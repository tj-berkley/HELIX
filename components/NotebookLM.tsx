
import React, { useState, useRef, useEffect } from 'react';
import { Manuscript, NotebookNote, NotebookProject, NotebookSource } from '../types';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { Icons } from '../constants';

const RESEARCH_CATEGORIES = [
  { id: 'success', label: 'Success Story', icon: '🏆', prompt: 'Extract all success indicators and metrics from these sources.' },
  { id: 'overview', label: 'Executive Overview', icon: '📝', prompt: 'Create a concise executive overview based on the project goals.' },
  { id: 'review', label: 'Critical Review', icon: '🧐', prompt: 'Critically analyze the information and point out gaps or risks.' },
  { id: 'leadership', label: 'Leadership Focus', icon: '👑', prompt: 'Identify leadership strategies and cultural impacts mentioned.' },
  { id: 'technical', label: 'Technical Map', icon: '⚙️', prompt: 'Map out technical requirements and stack architecture.' },
];

interface NotebookLMProps {
  manuscriptLibrary: Manuscript[];
  notebookProjects: NotebookProject[];
  onUpdateProjects: (projects: NotebookProject[]) => void;
}

const NotebookLM: React.FC<NotebookLMProps> = ({ manuscriptLibrary, notebookProjects, onUpdateProjects }) => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notebooks' | 'sources' | 'research' | 'notes' | 'studio'>('notebooks');
  
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'model'; text: string; id: string }[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  
  const [isWebSearchOpen, setIsWebSearchOpen] = useState(false);
  const [webSearchQuery, setWebSearchQuery] = useState('');
  const [searchDepth, setSearchDepth] = useState<'fast' | 'deep'>('fast');
  const [searchSource, setSearchSource] = useState<'web' | 'drive'>('web');

  const [isGeneratingOverview, setIsGeneratingOverview] = useState<'audio' | 'video' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeProject = notebookProjects.find(p => p.id === activeProjectId);

  // Voice Decoding Helpers
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
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isThinking]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
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

  const handleSendMessage = async (text?: string) => {
    const finalMsg = text || query;
    if (!finalMsg.trim() || !activeProject) return;
    setQuery('');
    setChat(prev => [...prev, { role: 'user', text: finalMsg, id: Date.now().toString() }]);
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = activeProject.sources.map(s => `[Source: ${s.name}]\n${s.content}`).join('\n\n');
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Research Assistant Persona. Use only the following context: \n${context}\n\nUser: ${finalMsg}`,
        config: { thinkingConfig: { thinkingBudget: 4000 } }
      });
      const reply = response.text || '';
      setChat(prev => [...prev, { role: 'model', text: reply, id: (Date.now()+1).toString() }]);
      speakText(reply);
    } catch (e) {
      setChat(prev => [...prev, { role: 'model', text: "Neural link lost. Checking Vault.", id: 'err' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAddSource = (src: NotebookSource) => {
    if (!activeProject) return;
    const updated = notebookProjects.map(p => p.id === activeProjectId ? { ...p, sources: [...p.sources, src] } : p);
    onUpdateProjects(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const type = file.type.includes('audio') ? 'Audio' : file.type.includes('video') ? 'Video' : 'Doc';
        handleAddSource({
          id: `src-${Date.now()}-${file.name}`,
          name: file.name,
          type: type as any,
          content: ev.target?.result as string
        });
      };
      reader.readAsText(file);
    });
  };

  const handleWebSearch = async () => {
    if (!webSearchQuery.trim()) return;
    setIsThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Deep research report for: "${webSearchQuery}" using ${searchSource} data. Depth: ${searchDepth}.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      handleAddSource({
        id: `search-${Date.now()}`,
        name: `Research: ${webSearchQuery}`,
        type: 'WebSearch',
        content: response.text || ''
      });
      setIsWebSearchOpen(false);
      setWebSearchQuery('');
    } catch (e) { console.error(e); }
    finally { setIsThinking(false); }
  };

  const pinNote = (title: string, content: string) => {
    if (!activeProject) return;
    const newNote: NotebookNote = {
      id: `note-${Date.now()}`,
      title,
      content,
      timestamp: new Date().toLocaleDateString()
    };
    const updated = notebookProjects.map(p => p.id === activeProjectId ? { ...p, notes: [newNote, ...p.notes] } : p);
    onUpdateProjects(updated);
    alert("Insight pinned to project notes.");
  };

  const createNewProject = () => {
    const id = `project-${Date.now()}`;
    const newP: NotebookProject = {
      id,
      title: 'New Research Mission',
      description: 'Analyzing complex data sets.',
      updatedAt: new Date().toISOString(),
      sources: [],
      notes: [],
      color: 'bg-indigo-600'
    };
    onUpdateProjects([newP, ...notebookProjects]);
    setActiveProjectId(id);
    setActiveTab('sources');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8faff] text-slate-900 overflow-hidden font-sans">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 shadow-sm z-20">
        <div className="flex items-center space-x-6">
           <div className={`w-14 h-14 ${activeProject?.color || 'bg-slate-900'} rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-slate-200 transition-colors`}>📓</div>
           <div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none">NotebookLM</h2>
              <div className="flex items-center space-x-2 mt-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{activeProject ? activeProject.title : 'Research Hub'}</span>
              </div>
           </div>
           <div className="flex bg-slate-100 p-1 rounded-2xl ml-8 border border-slate-200/50 shadow-inner">
              <button onClick={() => setActiveTab('notebooks')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notebooks' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-400 hover:text-slate-700'}`}>Notebooks</button>
              {activeProjectId && (
                <>
                  <button onClick={() => setActiveTab('sources')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sources' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-400 hover:text-slate-700'}`}>Sources</button>
                  <button onClick={() => setActiveTab('research')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'research' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-400 hover:text-slate-700'}`}>Research</button>
                  <button onClick={() => setActiveTab('notes')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notes' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-400 hover:text-slate-700'}`}>Notes</button>
                </>
              )}
           </div>
        </div>
        <div className="flex items-center space-x-4">
           {activeProjectId && activeTab === 'research' && (
             <button onClick={() => setIsVoiceActive(!isVoiceActive)} className={`p-3 rounded-xl transition-all ${isVoiceActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                {isVoiceActive ? '🔊' : '🔇'}
             </button>
           )}
           <button onClick={createNewProject} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200">Deploy Notebook</button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'notebooks' && (
          <div className="p-12 h-full overflow-y-auto pattern-grid-light">
             <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   {notebookProjects.map(project => (
                     <div key={project.id} onClick={() => { setActiveProjectId(project.id); setActiveTab('research'); }} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all cursor-pointer group flex flex-col space-y-6">
                        <div className={`w-16 h-16 ${project.color} rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform`}>📓</div>
                        <div>
                           <h4 className="text-xl font-black text-slate-900 truncate uppercase tracking-tight">{project.title}</h4>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Last sync: {new Date(project.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                           <span>{project.sources.length} Sources</span>
                           <span>{project.notes.length} Notes</span>
                        </div>
                     </div>
                   ))}
                   <button onClick={createNewProject} className="p-8 border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center space-y-4 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/20 transition-all">
                      <span className="text-4xl">+</span>
                      <p className="text-[10px] font-black uppercase tracking-widest">Add Category Node</p>
                   </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'sources' && activeProject && (
          <div className="p-12 h-full overflow-y-auto bg-slate-50/50 flex flex-col space-y-12">
             <div className="max-w-5xl mx-auto w-full space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div onClick={() => fileInputRef.current?.click()} className="bg-white p-10 border-4 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">📤</div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-slate-900">Drop Intelligence</p>
                        <p className="text-[10px] text-slate-400 font-medium">PDF, Images, Doc, Audio, Video</p>
                      </div>
                      <input type="file" ref={fileInputRef} multiple className="hidden" onChange={handleFileUpload} />
                   </div>
                   <div onClick={() => setIsWebSearchOpen(true)} className="bg-white p-10 border-4 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center text-center space-y-4 hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">🌐</div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-slate-900">Web Research</p>
                        <p className="text-[10px] text-slate-400 font-medium">Deep Intelligence Scraper</p>
                      </div>
                   </div>
                   <div className="bg-slate-900 p-10 rounded-[4rem] flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 pattern-grid opacity-10"></div>
                      <p className="text-sm font-black uppercase tracking-widest text-indigo-400 relative z-10">Synthesize Overview</p>
                      <div className="flex space-x-3 relative z-10">
                         <button className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">Audio</button>
                         <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">Video</button>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-xl font-black text-slate-900 px-4 uppercase tracking-widest">Active Source Registry ({activeProject.sources.length})</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activeProject.sources.map(src => (
                        <div key={src.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-xl transition-all group">
                           <div className="flex items-center space-x-4 min-w-0">
                              <span className="text-2xl">{src.type === 'WebSearch' ? '🌐' : src.type === 'Audio' ? '🔊' : src.type === 'Video' ? '🎬' : '📄'}</span>
                              <div className="min-w-0">
                                 <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{src.name}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{src.type}</p>
                              </div>
                           </div>
                           <button onClick={() => onUpdateProjects(notebookProjects.map(p => p.id === activeProjectId ? { ...p, sources: p.sources.filter(s => s.id !== src.id) } : p))} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2">✕</button>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'research' && activeProject && (
          <div className="flex h-full animate-in fade-in">
             <div className="w-80 border-r border-slate-100 bg-white p-8 flex flex-col space-y-8 shrink-0 overflow-y-auto scrollbar-hide">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Analysis Protocols</h3>
                <div className="space-y-3">
                   {RESEARCH_CATEGORIES.map(cat => (
                     <button key={cat.id} onClick={() => { handleSendMessage(cat.prompt); }} className="w-full text-left p-5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-[2rem] flex items-center space-x-4 transition-all group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                        <span className="text-[10px] font-black uppercase text-slate-700 group-hover:text-indigo-600">{cat.label}</span>
                     </button>
                   ))}
                </div>
             </div>
             <div className="flex-1 flex flex-col p-12 bg-slate-50/50">
                <div className="flex-1 bg-white border border-slate-200 rounded-[4rem] shadow-2xl flex flex-col overflow-hidden">
                   <div className="flex-1 overflow-y-auto p-12 space-y-8 scrollbar-hide">
                      {chat.map(m => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                           <div className={`max-w-[80%] p-8 rounded-[3rem] text-sm leading-relaxed shadow-lg relative ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-lg' : 'bg-slate-100 text-slate-800 rounded-tl-lg'}`}>
                              <p className="whitespace-pre-wrap font-medium">{m.text}</p>
                              {m.role === 'model' && (
                                <button onClick={() => pinNote('Grounded Insight', m.text)} className="absolute -top-3 -right-3 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110">📌</button>
                              )}
                           </div>
                        </div>
                      ))}
                      {isThinking && <div className="flex space-x-2 p-4 bg-slate-100 rounded-full w-20 justify-center animate-pulse"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div></div>}
                      <div ref={chatEndRef}></div>
                   </div>
                   <div className="p-8 border-t border-slate-100 flex space-x-4 bg-white items-center">
                      <button onClick={toggleListening} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}>
                         <span className="text-2xl">🎙️</span>
                      </button>
                      <input 
                        className="flex-1 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.8rem] px-8 py-5 outline-none font-bold text-lg shadow-inner"
                        placeholder="Ground your thoughts here..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button onClick={() => handleSendMessage()} disabled={!query.trim()} className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-indigo-700 active:scale-90 transition-all disabled:opacity-20"><span className="text-3xl font-black">➔</span></button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'notes' && activeProject && (
          <div className="p-12 h-full overflow-y-auto pattern-grid-light animate-in fade-in">
             <div className="max-w-6xl mx-auto space-y-12">
                <div className="flex justify-between items-end border-b border-slate-200 pb-8">
                   <div className="space-y-1">
                      <h3 className="text-4xl font-black tracking-tighter uppercase">Knowledge Nodes</h3>
                      <p className="text-slate-500 font-medium">Insights extracted from the neural matrix.</p>
                   </div>
                   <button onClick={() => pinNote('New Note', 'Drafting my thoughts...')} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Manual Insight</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-40">
                   {activeProject.notes.map(note => (
                     <div key={note.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all space-y-6 relative group">
                        <div className="flex justify-between items-start">
                           <span className="text-3xl">📌</span>
                           <button onClick={() => onUpdateProjects(notebookProjects.map(p => p.id === activeProjectId ? { ...p, notes: p.notes.filter(n => n.id !== note.id) } : p))} className="text-rose-500 opacity-0 group-hover:opacity-100 p-2">✕</button>
                        </div>
                        <input 
                           className="w-full text-xl font-black bg-transparent border-none p-0 focus:ring-0 uppercase tracking-tight" 
                           value={note.title} 
                           onChange={e => {
                             const updated = notebookProjects.map(p => p.id === activeProjectId ? { ...p, notes: p.notes.map(n => n.id === note.id ? { ...n, title: e.target.value } : n) } : p);
                             onUpdateProjects(updated);
                           }}
                        />
                        <textarea 
                           className="w-full h-40 bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium leading-relaxed resize-none focus:ring-2 focus:ring-indigo-500" 
                           value={note.content}
                           onChange={e => {
                              const updated = notebookProjects.map(p => p.id === activeProjectId ? { ...p, notes: p.notes.map(n => n.id === note.id ? { ...n, content: e.target.value } : n) } : p);
                              onUpdateProjects(updated);
                           }}
                        />
                        <p className="text-[9px] font-black uppercase text-slate-400 text-right italic">{note.timestamp}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* Web Search Modal */}
        {isWebSearchOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
             <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                   <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Neural Scraper</h3>
                   <button onClick={() => setIsWebSearchOpen(false)} className="p-4 hover:bg-slate-50 rounded-full text-slate-400">✕</button>
                </div>
                <div className="p-10 space-y-10">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Source Protocol</label>
                         <div className="flex bg-slate-100 p-1 rounded-2xl">
                            <button onClick={() => setSearchSource('web')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchSource === 'web' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>Web</button>
                            <button onClick={() => setSearchSource('drive')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchSource === 'drive' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>Drive</button>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Intensity</label>
                         <div className="flex bg-slate-100 p-1 rounded-2xl">
                            <button onClick={() => setSearchDepth('fast')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchDepth === 'fast' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}>Fast</button>
                            <button onClick={() => setSearchDepth('deep')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchDepth === 'deep' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}>Deep</button>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Target Intelligence Query</label>
                      <input 
                        autoFocus 
                        className="w-full p-6 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-3xl font-black text-lg outline-none transition-all shadow-inner" 
                        placeholder="Search query..." 
                        value={webSearchQuery} 
                        onChange={e => setWebSearchQuery(e.target.value)}
                      />
                   </div>
                   <button onClick={handleWebSearch} disabled={isThinking || !webSearchQuery.trim()} className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-black transition-all transform active:scale-95">
                      {isThinking ? 'Processing Neural Buffers...' : 'Initiate Remote Synthesis'}
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotebookLM;
