
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model' | 'system', text: string, thinking?: string, urls?: { title: string, uri: string }[] }[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isGroundingSearch, setIsGroundingSearch] = useState(true);
  const [isGroundingMaps, setIsGroundingMaps] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Live API State
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let model = 'gemini-3-flash-preview';
      const config: any = {};

      if (isThinkingMode) {
        model = 'gemini-3-pro-preview';
        config.thinkingConfig = { thinkingBudget: 32768 };
      } else if (isGroundingMaps) {
        model = 'gemini-2.5-flash';
        config.tools = [{ googleMaps: {} }];
        if (isGroundingSearch) config.tools.push({ googleSearch: {} });
        
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
          config.toolConfig = {
            retrievalConfig: {
              latLng: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
            }
          };
        } catch (e) { console.warn("Location denied, using default."); }
      } else if (isGroundingSearch) {
        model = 'gemini-3-flash-preview';
        config.tools = [{ googleSearch: {} }];
      } else {
        // Fast low-latency response
        model = 'gemini-2.5-flash-lite-latest';
      }

      const response = await ai.models.generateContent({
        model,
        contents: userMessage,
        config
      });

      const text = response.text || "I couldn't generate a response.";
      const urls: { title: string, uri: string }[] = [];
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web) urls.push({ title: chunk.web.title, uri: chunk.web.uri });
          if (chunk.maps) urls.push({ title: chunk.maps.title, uri: chunk.maps.uri });
        });
      }

      setMessages(prev => [...prev, { role: 'model', text, urls: urls.length > 0 ? urls : undefined }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'system', text: "Error: Could not connect to Gemini." }]);
    } finally {
      setIsThinking(false);
    }
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const startLive = async () => {
    if (isLiveActive) return;
    setIsLiveActive(true);
    setMessages(prev => [...prev, { role: 'system', text: "Live voice session starting..." }]);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
          sessionRef.current = { stream, inputCtx, processor };
        },
        onmessage: async (msg: any) => {
          const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64 && audioContextRef.current) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
            const buffer = await decodeAudioData(decode(audioBase64), audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => setIsLiveActive(false),
        onerror: () => setIsLiveActive(false),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
        systemInstruction: 'You are a friendly workspace assistant in the Hobbs Studio platform. Help users with their tasks.'
      }
    });
  };

  const stopLive = () => {
    if (sessionRef.current) {
      sessionRef.current.stream.getTracks().forEach((t: any) => t.stop());
      sessionRef.current.inputCtx.close();
      sessionRef.current = null;
    }
    setIsLiveActive(false);
  };

  const startTranscription = async () => {
    setIsTranscribing(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: any[] = [];

    mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: { parts: [{ inlineData: { data: base64, mimeType: 'audio/webm' } }, { text: "Transcribe this audio exactly." }] }
        });
        setInput(res.text || "");
        setIsTranscribing(false);
      };
      reader.readAsDataURL(audioBlob);
      stream.getTracks().forEach(t => t.stop());
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 5000);
  };

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-[1000] transition-all duration-500 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
        <div className="w-[420px] h-[640px] bg-white border border-slate-200 shadow-2xl rounded-[2.5rem] flex flex-col overflow-hidden">
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-xl shadow-lg">✨</div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest">Workspace Assistant</h3>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isLiveActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{isLiveActive ? 'Live Voice Active' : 'Ready'}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm shadow-sm ${
                  m.role === 'user' ? 'bg-indigo-600 text-white' : m.role === 'system' ? 'bg-slate-200 text-slate-500 italic text-[10px]' : 'bg-white text-slate-800'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.urls && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sources:</p>
                      {m.urls.map((u, idx) => (
                        <a key={idx} href={u.uri} target="_blank" rel="noreferrer" className="block text-indigo-500 hover:underline text-[10px] truncate">🔗 {u.title || u.uri}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          <div className="p-6 bg-white border-t border-slate-100 space-y-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setIsThinkingMode(!isThinkingMode)} className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full transition-all border ${isThinkingMode ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}>🧠 Thinking</button>
              <button onClick={() => setIsGroundingSearch(!isGroundingSearch)} className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full transition-all border ${isGroundingSearch ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}>🔍 Search</button>
              <button onClick={() => setIsGroundingMaps(!isGroundingMaps)} className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full transition-all border ${isGroundingMaps ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}>📍 Maps</button>
              <button onClick={isLiveActive ? stopLive : startLive} className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full transition-all border ${isLiveActive ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}>🎙️ Live</button>
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <button onClick={startTranscription} className={`p-2 rounded-xl transition-all ${isTranscribing ? 'bg-rose-100 text-rose-500 animate-pulse' : 'text-slate-400 hover:text-slate-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" /></svg>
              </button>
              <input 
                type="text" 
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder-slate-400 p-2" 
                placeholder="Ask me anything..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[1.5rem] shadow-2xl flex items-center justify-center text-white text-3xl hover:scale-110 active:scale-95 transition-all z-[1001] border-2 border-white/20">
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <span className="animate-pulse">✨</span>
        )}
      </button>
    </>
  );
};

export default AIChatbot;
