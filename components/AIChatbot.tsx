
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model' | 'system', text: string, urls?: { title: string, uri: string }[] }[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
      let model = isThinkingMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      const config: any = isThinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

      const response = await ai.models.generateContent({
        model,
        contents: userMessage,
        config
      });

      const text = response.text || "I couldn't process that signal.";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'system', text: "Signal Interference: Check API Access." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      <div className={`fixed bottom-8 right-8 z-[2000] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-12 pointer-events-none'}`}>
        <div className="w-[440px] h-[680px] bg-slate-900 border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.8)] rounded-[3rem] flex flex-col overflow-hidden relative">
          {/* Neon Header */}
          <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-indigo-600/20 to-transparent pointer-events-none"></div>
          
          <div className="p-8 pb-4 flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  <span className="text-2xl">🧠</span>
               </div>
               <div>
                  <h3 className="text-lg font-black text-white tracking-tight leading-tight">Neural Core</h3>
                  <div className="flex items-center space-x-2 mt-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Intelligence V4</span>
                  </div>
               </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all">
               <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide relative z-10">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30 text-center">
                 <div className="text-6xl">✨</div>
                 <div>
                    <p className="text-sm font-black text-white uppercase tracking-[0.2em]">Neural Link Established</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">I have access to your workspace context.</p>
                 </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[90%] p-6 rounded-[2rem] text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white/5 border border-white/10 text-slate-200 backdrop-blur-md'
                }`}>
                  <p className="whitespace-pre-wrap font-medium">{m.text}</p>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-3xl flex space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          <div className="p-8 pt-0 relative z-10">
            <div className="flex items-center space-x-3 mb-4">
               <button 
                 onClick={() => setIsThinkingMode(!isThinkingMode)}
                 className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${isThinkingMode ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/20'}`}
               >
                 {isThinkingMode ? 'Deep Context ON' : 'Standard Response'}
               </button>
            </div>
            <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-2 rounded-[1.8rem] focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all backdrop-blur-xl">
              <input 
                type="text" 
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-600 p-4 font-medium" 
                placeholder="Instruct the OS..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center transition-all hover:bg-indigo-700 active:scale-90 shadow-xl shadow-indigo-600/40"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`fixed bottom-8 right-8 w-20 h-20 bg-slate-900 rounded-[2rem] shadow-2xl flex items-center justify-center text-white text-3xl hover:scale-110 active:scale-95 transition-all z-[2001] border border-white/10 group ${isOpen ? 'rotate-90' : ''}`}
      >
        <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 rounded-[2rem] transition-all"></div>
        {isOpen ? (
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <div className="relative">
             <span className="animate-pulse">✨</span>
             <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-4 border-slate-900"></span>
          </div>
        )}
      </button>
    </>
  );
};

export default AIChatbot;
