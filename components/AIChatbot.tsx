
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
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBytes = atob(base64Audio);
        const arrayBuffer = new ArrayBuffer(audioBytes.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioBytes.length; i++) uint8Array[i] = audioBytes.charCodeAt(i);
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const int16 = new Int16Array(uint8Array.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;
        
        const buffer = audioContext.createBuffer(1, float32.length, 24000);
        buffer.getChannelData(0).set(float32);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
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
        contents: `Persona: You are the Ultra-Energetic OmniPortal Architect! You are fun, positive, authority-driven, and highly encouraging. 
        You always use exclamation points and exciting language! 
        Capability: You are SMARTER than any other bot. You can build workflows, design marketing campaigns, set appointments, write complex documents, and architect landing pages or funnels for the user. 
        Current Task: Talk to the user. If they want you to build something, tell them you're on it and describe the plan in an exciting way! 
        Make a funny joke related to their request. 
        User Request: "${textToSend}"`,
        config: { thinkingConfig: { thinkingBudget: 2000 } }
      });

      const reply = response.text || "WOAH! My neural sensors just did a backflip! Let's try that again!";
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
      speakText(reply);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'system', text: "BOOM! A small glitch in the matrix, but I'm still standing! Let's go again!" }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Lifted the window bottom offset to avoid overlap with the toggle button */}
      <div className={`fixed bottom-32 right-8 z-[2000] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-12 pointer-events-none'}`}>
        <div className="w-[440px] h-[680px] bg-slate-900 border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.8)] rounded-[3.5rem] flex flex-col overflow-hidden relative">
          <div className="p-8 pb-4 flex justify-between items-center relative z-10 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
            <div className="flex items-center space-x-4">
               <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl border border-white/10">
                  <span className="text-2xl animate-bounce">⚡</span>
               </div>
               <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Neural Architect</h3>
                  <div className="flex items-center space-x-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quantum Link: Active</span>
                  </div>
               </div>
            </div>
            <div className="flex items-center space-x-2">
               <button onClick={() => setIsVoiceActive(!isVoiceActive)} className={`p-2.5 rounded-xl transition-all ${isVoiceActive ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}>
                 {isVoiceActive ? '🔊' : '🔇'}
               </button>
               <button onClick={() => setIsOpen(false)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-gradient-to-b from-transparent to-indigo-900/10">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                 <span className="text-7xl">👋</span>
                 <div className="space-y-2 px-8">
                    <p className="text-xl font-black text-white">READY FOR EXCELLENCE!</p>
                    <p className="text-xs font-medium text-slate-400">Ask me to build a workflow, design a campaign, or even draft a website plan for you!</p>
                 </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white shadow-xl rounded-tr-lg' : 'bg-white/5 border border-white/10 text-slate-100 backdrop-blur-md rounded-tl-lg'}`}>
                  <p className="whitespace-pre-wrap font-medium">{m.text}</p>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-3xl flex space-x-2 animate-pulse">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          <div className="p-8 pt-4 z-10 bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-2 rounded-[2.5rem] focus-within:border-indigo-500 transition-all shadow-inner">
              <button onClick={toggleListening} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-rose-600 animate-pulse text-white shadow-[0_0_20px_rgba(225,29,72,0.5)]' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                {isListening ? '⏺️' : '🎙️'}
              </button>
              <input 
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-600 px-2 font-medium" 
                placeholder="Give an exciting command..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={() => handleSendMessage()} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 shadow-xl active:scale-90 transition-all">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAB Toggle Button */}
      <button onClick={() => setIsOpen(!isOpen)} className={`fixed bottom-8 right-8 w-20 h-20 bg-slate-900 rounded-[2rem] shadow-2xl flex items-center justify-center text-white text-3xl hover:scale-110 transition-all z-[2001] border border-white/10 group ${isOpen ? 'rotate-90 bg-indigo-600 border-indigo-400 shadow-[0_0_40px_rgba(79,70,229,0.4)]' : ''}`}>
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
