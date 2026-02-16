
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model' | 'system', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Voice Helpers
  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeRawAudio = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  // Setup Speech to Text
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const speakText = async (text: string) => {
    if (!isVoiceActive) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decodedBytes = decodeBase64(base64Audio);
        const audioBuffer = await decodeRawAudio(decodedBytes, audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (e) { console.error("TTS failed", e); }
  };

  const handleSendMessage = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim()) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `OmniPortal Architect Persona. User Request: "${textToSend}"`,
        config: { thinkingConfig: { thinkingBudget: 2000 } }
      });

      const reply = response.text || "Neural protocols synchronized! How can I assist?";
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
      speakText(reply);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'system', text: "Glitched signal! Re-syncing." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      <div className={`fixed bottom-32 right-8 z-[2000] transition-all duration-500 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-12 pointer-events-none'}`}>
        <div className="w-[440px] h-[680px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl rounded-[3.5rem] flex flex-col overflow-hidden relative">
          <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex justify-between items-center">
            <div className="flex items-center space-x-4">
               <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">⚡</div>
               <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Architect AI</h3>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Neural Link</p>
               </div>
            </div>
            <div className="flex items-center space-x-2">
               <button onClick={() => setIsVoiceActive(!isVoiceActive)} className={`p-2.5 rounded-xl transition-all ${isVoiceActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                 {isVoiceActive ? '🔊' : '🔇'}
               </button>
               <button onClick={() => setIsOpen(false)} className="w-10 h-10 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full flex items-center justify-center transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100'}`}>
                  <p className="whitespace-pre-wrap font-medium">{m.text}</p>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-3xl flex space-x-2 animate-pulse">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          <div className="p-8 pt-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center space-x-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2 rounded-[2.5rem] focus-within:border-indigo-500 transition-all">
              <button onClick={toggleListening} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-rose-600 text-white shadow-lg animate-pulse' : 'bg-white dark:bg-white/5 text-slate-400'}`}>
                {isListening ? '⏺️' : '🎙️'}
              </button>
              <input 
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 px-2" 
                placeholder="Talk to Architect..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={() => handleSendMessage()} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 shadow-xl active:scale-95 transition-all">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <button onClick={() => setIsOpen(!isOpen)} className={`fixed bottom-8 right-8 w-20 h-20 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex items-center justify-center text-slate-600 dark:text-white text-3xl hover:scale-110 transition-all z-[2001] border border-slate-200 dark:border-white/10 group ${isOpen ? 'rotate-90 bg-indigo-600 text-white' : ''}`}>
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <span className="group-hover:animate-pulse">✨</span>
        )}
      </button>
    </>
  );
};

export default AIChatbot;
