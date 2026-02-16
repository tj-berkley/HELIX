
import React, { useState } from 'react';
import { Manuscript } from '../types';
import { GoogleGenAI } from '@google/genai';

interface NotebookLMProps {
  manuscriptLibrary: Manuscript[];
}

const NotebookLM: React.FC<NotebookLMProps> = ({ manuscriptLibrary }) => {
  const [activeTab, setActiveTab] = useState<'notebook' | 'studio'>('notebook');
  const [sources, setSources] = useState<Manuscript[]>([]);
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  
  // AI Studio Integrated Params
  const [temperature, setTemperature] = useState(0.7);
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-preview');

  const addSource = (m: Manuscript) => {
    if (sources.find(s => s.id === m.id)) return;
    setSources([...sources, m]);
  };

  const askNotebook = async () => {
    if (!query.trim() || sources.length === 0) return;
    const userMsg = query;
    setQuery('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = sources.map(s => `[Source: ${s.title}]\n${s.content}`).join('\n\n');
      
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: `You are a precision research assistant. Ground all answers specifically in these sources: \n${context}\n\nUser Question: ${userMsg}`,
        config: {
          temperature,
          thinkingConfig: selectedModel.includes('pro') ? { thinkingBudget: 4000 } : undefined
        }
      });
      setChat(prev => [...prev, { role: 'model', text: response.text || '' }]);
    } catch (e) {
      console.error(e);
      setChat(prev => [...prev, { role: 'model', text: "Neural connection error. Ensure your key is set in the Vault." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8faff] text-slate-900 overflow-hidden font-sans">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 shadow-sm z-20">
        <div className="flex items-center space-x-6">
           <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-slate-200">📓</div>
           <div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none">NotebookLM</h2>
              <div className="flex items-center space-x-2 mt-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Neural Research Lab</span>
              </div>
           </div>
           <div className="flex bg-slate-100 p-1.5 rounded-2xl ml-8 border border-slate-200/50 shadow-inner">
              <button onClick={() => setActiveTab('notebook')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notebook' ? 'bg-white shadow-lg text-indigo-600 scale-105' : 'text-slate-500 hover:text-slate-700'}`}>Research View</button>
              <button onClick={() => setActiveTab('studio')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'studio' ? 'bg-white shadow-lg text-indigo-600 scale-105' : 'text-slate-500 hover:text-slate-700'}`}>Integrated AI Studio</button>
           </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-slate-100 bg-white p-10 flex flex-col space-y-10 shrink-0 overflow-y-auto scrollbar-hide">
           <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grounded Context</h3>
              <div className="space-y-3">
                 {sources.map(s => (
                    <div key={s.id} className="p-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] flex justify-between items-center group shadow-sm">
                       <span className="text-xs font-black text-slate-700 truncate w-32 uppercase tracking-tight">{s.title}</span>
                       <button onClick={() => setSources(sources.filter(x => x.id !== s.id))} className="text-rose-500 p-1">✕</button>
                    </div>
                 ))}
                 <button className="w-full py-5 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400">+ New Knowledge Node</button>
              </div>
           </div>
           
           <div className="space-y-6 pt-6 border-t border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Library Manuscripts</h3>
              <div className="space-y-3">
                 {manuscriptLibrary.map(m => (
                    <button key={m.id} onClick={() => addSource(m)} className="w-full text-left p-5 hover:bg-indigo-50 rounded-[1.8rem] border-2 border-transparent hover:border-indigo-100 transition-all flex items-center space-x-4 shadow-sm bg-white">
                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl">📜</div>
                       <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-black uppercase text-slate-900 truncate block">{m.title}</span>
                          <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Add to Context</span>
                       </div>
                    </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="flex-1 flex bg-slate-50/40 p-12">
           {activeTab === 'notebook' ? (
              <div className="flex-1 flex flex-col space-y-10 max-w-5xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex-1 bg-white border border-slate-200 rounded-[4rem] shadow-2xl flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-16 space-y-8 scrollbar-hide">
                       {chat.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-8">
                             <div className="text-[120px]">🕵️‍♂️</div>
                             <p className="text-4xl font-black uppercase tracking-[0.3em] text-slate-900">Neural Investigator</p>
                          </div>
                       )}
                       {chat.map((m, i) => (
                          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                             <div className={`max-w-[85%] p-8 rounded-[3rem] text-sm leading-relaxed shadow-lg ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-lg' : 'bg-slate-100 text-slate-800 rounded-tl-lg'}`}>
                                <p className="font-medium whitespace-pre-wrap">{m.text}</p>
                             </div>
                          </div>
                       ))}
                       {isThinking && <div className="p-6 bg-slate-100 rounded-full w-20 flex space-x-2 animate-pulse justify-center"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div></div>}
                    </div>
                    <div className="p-10 border-t border-slate-100 flex space-x-6 bg-white">
                       <input 
                         value={query} 
                         onChange={e => setQuery(e.target.value)} 
                         onKeyDown={e => e.key === 'Enter' && askNotebook()}
                         className="flex-1 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[2rem] px-10 py-5 outline-none transition-all font-bold text-lg" 
                         placeholder={sources.length === 0 ? "Add a source to begin..." : "Synthesize from knowledge base..."} 
                         disabled={sources.length === 0}
                       />
                       <button onClick={askNotebook} disabled={sources.length === 0} className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl active:scale-90 transition-all">
                          <span className="text-3xl font-black">➔</span>
                       </button>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="flex-1 max-w-4xl mx-auto h-full overflow-y-auto scrollbar-hide py-10">
                 <div className="bg-white border border-slate-200 rounded-[5rem] p-20 space-y-16 shadow-2xl animate-in zoom-in-95">
                    <div className="space-y-3">
                       <h3 className="text-5xl font-black tracking-tighter uppercase text-slate-900">Neural Laboratory</h3>
                       <p className="text-slate-500 font-medium italic text-2xl">Refine logic pathways and inference parameters.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                       <div className="space-y-10">
                          <div className="space-y-5">
                             <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-4">Grounding Model Selection</label>
                             <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-black text-sm uppercase border-2 border-transparent focus:border-indigo-500 transition-all">
                                <option value="gemini-3-pro-preview">Gemini 3 Pro (Deep Research)</option>
                                <option value="gemini-3-flash-preview">Gemini 3 Flash (High Velocity)</option>
                             </select>
                          </div>
                          <div className="space-y-5">
                             <div className="flex justify-between items-center px-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Inference Temp</label>
                                <span className="text-lg font-black text-indigo-600 font-mono">{temperature}</span>
                             </div>
                             <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} className="w-full h-2.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600" />
                          </div>
                       </div>
                       <div className="p-10 bg-indigo-50 rounded-[4rem] border border-indigo-100 flex flex-col space-y-6 relative overflow-hidden">
                          <div className="flex items-center space-x-4 relative">
                             <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                             <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em]">Vault Link Enabled</span>
                          </div>
                          <p className="text-sm text-indigo-600 font-bold leading-relaxed italic">"AI Studio parameters apply globally to all NotebookLM sessions in this portal."</p>
                       </div>
                    </div>
                    
                    <button className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-indigo-600 transition-all">Synchronize Neural Network</button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default NotebookLM;
