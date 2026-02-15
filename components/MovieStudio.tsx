
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { MovieScript, MovieScene, MovieCharacter, Manuscript } from '../types';
import { Icons, STATUS_COLORS } from '../constants';

interface MovieStudioProps {
  initialContent?: { title: string; content: string };
  manuscriptLibrary: Manuscript[];
  script: MovieScript | null;
  onUpdateScript: (script: MovieScript) => void;
  onMoveToProduction: () => void;
}

type StudioTab = 'storyboard' | 'cast' | 'moodboard' | 'director';

const MovieStudio: React.FC<MovieStudioProps> = ({ initialContent, manuscriptLibrary, script, onUpdateScript, onMoveToProduction }) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('storyboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<string>('');
  const [isMoodLoading, setIsMoodLoading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-convert if passed from Blog platform
  useEffect(() => {
    if (initialContent && !script) {
      convertToMovieScript(initialContent.title, initialContent.content);
    }
  }, [initialContent]);

  const convertToMovieScript = async (title: string, content: string) => {
    setIsGenerating(true);
    setChatMessages(prev => [...prev, { role: 'ai', text: "Analyzing narrative structure... Preparing cinematic blueprint." }]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Act as a world-class movie producer. Take this story and convert it into a highly structured screenplay.
        
        Story Title: "${title}"
        Manuscript: "${content}"
        
        Output Requirements:
        1. Compelling Logline.
        2. Detailed Characters (2-4).
        3. Scene Breakdown (8-10 scenes). Each scene needs a slugline, action description, visual prompt for AI generation, and dialogue lines.
        
        Return strictly valid JSON matching the MovieScript structure.`,
        config: {
          thinkingConfig: { thinkingBudget: 4000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              logline: { type: Type.STRING },
              characters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    traits: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    slugline: { type: Type.STRING },
                    description: { type: Type.STRING },
                    visualPrompt: { type: Type.STRING },
                    action: { type: Type.STRING },
                    dialogue: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          character: { type: Type.STRING },
                          line: { type: Type.STRING }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      onUpdateScript({
        id: `ms-${Date.now()}`,
        title,
        logline: data.logline,
        characters: data.characters.map((c: any, i: number) => ({ id: `ch-${i}`, ...c })),
        scenes: data.scenes.map((s: any, i: number) => ({ id: `sc-${i}`, ...s, isApproved: false })),
        status: 'Pre-Production'
      });
      setActiveTab('storyboard');
    } catch (error) {
      console.error("Script generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMoodboard = async (sceneId: string) => {
    const scene = script?.scenes.find(s => s.id === sceneId);
    if (!scene) return;
    
    setIsMoodLoading(sceneId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Cinematic movie moodboard frame for: ${scene.visualPrompt}. Master lighting, high fidelity, 8k resolution.` }] },
        config: { imageConfig: { aspectRatio: '16:9' } }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const url = `data:image/png;base64,${part.inlineData.data}`;
          updateSceneDetails(sceneId, { videoUrl: url }); // Using videoUrl field for mood image placeholder
          break;
        }
      }
    } catch (error) {
      console.error("Moodboard generation failed", error);
    } finally {
      setIsMoodLoading(null);
    }
  };

  const updateSceneDetails = (sceneId: string, updates: Partial<MovieScene>) => {
    if (!script) return;
    onUpdateScript({
      ...script,
      scenes: script.scenes.map(s => s.id === sceneId ? { ...s, ...updates } : s)
    });
  };

  const updateCharacterDetails = (charId: string, updates: Partial<MovieCharacter>) => {
    if (!script) return;
    onUpdateScript({
      ...script,
      characters: script.characters.map(c => c.id === charId ? { ...c, ...updates } : c)
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      convertToMovieScript(file.name.replace(/\.[^/.]+$/, ""), content);
    };
    reader.readAsText(file);
  };

  const allApproved = script?.scenes.every(s => s.isApproved) && script.scenes.length > 0;

  if (!script) {
    return (
      <div className="flex-1 flex flex-col h-full bg-slate-950 items-center justify-center p-20 pattern-grid-dark relative">
        <div className="absolute top-10 left-10 flex items-center space-x-2">
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg">🎬</div>
           <span className="text-white font-black uppercase tracking-widest text-sm">Hobbs Movie Studio</span>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-2 gap-12 animate-in zoom-in-95">
           <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-12 space-y-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl transition-all group-hover:bg-indigo-500/20"></div>
              <div className="space-y-4 relative">
                 <h3 className="text-4xl font-black text-white tracking-tight">New Production</h3>
                 <p className="text-slate-400 font-medium leading-relaxed">Start from a blank canvas or upload a professional manuscript to begin your cinematic journey.</p>
              </div>
              <div className="space-y-4 relative">
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3"
                 >
                    <span>Upload Manuscript</span>
                    <Icons.Plus />
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.md,.rtf" onChange={handleFileUpload} />
              </div>
           </div>

           <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-12 space-y-10 shadow-2xl relative overflow-hidden group">
              <div className="space-y-4">
                 <h3 className="text-4xl font-black text-white tracking-tight">Library Pick</h3>
                 <p className="text-slate-400 font-medium leading-relaxed">Continue working on a manuscript drafted in the Blog & Writing platform.</p>
              </div>
              <div className="space-y-4">
                 <select 
                    value={selectedManuscriptId}
                    onChange={(e) => setSelectedManuscriptId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                 >
                    <option value="">Select script...</option>
                    {manuscriptLibrary.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                 </select>
                 <button 
                    disabled={!selectedManuscriptId}
                    onClick={() => {
                      const m = manuscriptLibrary.find(item => item.id === selectedManuscriptId);
                      if (m) convertToMovieScript(m.title, m.content);
                    }}
                    className="w-full py-6 bg-white/5 border border-white/10 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-20"
                 >
                    Import to Studio
                 </button>
              </div>
           </div>
        </div>

        {isGenerating && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center space-y-8 animate-in fade-in">
             <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             <div className="text-center space-y-2">
                <h4 className="text-3xl font-black text-white tracking-tight animate-pulse">Consulting the Neural Screenwriter</h4>
                <p className="text-slate-400 font-medium">Drafting scenes, casting roles, and mapping visual arcs...</p>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-white">
      {/* Studio Header */}
      <div className="p-6 bg-black/40 border-b border-white/5 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-6">
           <div>
              <h2 className="text-2xl font-black tracking-tight">{script.title}</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{script.status} // Master Project Board</p>
           </div>
           <div className="h-8 w-px bg-white/10"></div>
           <div className="flex space-x-1">
              {(['storyboard', 'cast', 'moodboard', 'director'] as StudioTab[]).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab}
                </button>
              ))}
           </div>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex -space-x-2 mr-4">
              {script.characters.map((c, i) => (
                <div key={c.id} title={c.name} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-indigo-600 flex items-center justify-center text-[10px] font-black uppercase shadow-lg">
                   {c.name[0]}
                </div>
              ))}
           </div>
           <button 
              onClick={onMoveToProduction}
              disabled={!allApproved}
              className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${allApproved ? 'bg-indigo-600 shadow-xl shadow-indigo-900/40 hover:bg-indigo-700' : 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed'}`}
           >
              {allApproved ? '🚀 Send to Production' : 'Approve All Scenes First'}
           </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'storyboard' && (
          <div className="h-full flex flex-col p-8 overflow-y-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
             <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                   <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Screenplay Storyboard</h3>
                   <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500">
                      <span>{script.scenes.filter(s => s.isApproved).length} Verified</span>
                      <div className="w-32 h-1 bg-slate-900 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(script.scenes.filter(s => s.isApproved).length / script.scenes.length) * 100}%` }}></div>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-black/20 border-b border-white/5">
                            <th className="w-12 p-4"></th>
                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Scene / Slugline</th>
                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-1/3">Action & Narrative</th>
                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Prompt</th>
                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Verification</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {script.scenes.map((scene, idx) => (
                            <tr key={scene.id} className="group hover:bg-white/5 transition-colors">
                               <td className="p-4 text-center font-black text-slate-700 text-xs">{idx + 1}</td>
                               <td className="p-4">
                                  <input 
                                    className="bg-transparent border-none text-indigo-400 font-black uppercase text-sm w-full outline-none focus:ring-1 focus:ring-indigo-500/30 rounded p-1"
                                    value={scene.slugline}
                                    onChange={(e) => updateSceneDetails(scene.id, { slugline: e.target.value })}
                                  />
                               </td>
                               <td className="p-4">
                                  <textarea 
                                    className="bg-transparent border-none text-slate-300 text-xs w-full outline-none focus:ring-1 focus:ring-indigo-500/30 rounded p-1 resize-none h-16 leading-relaxed italic font-serif"
                                    value={scene.description}
                                    onChange={(e) => updateSceneDetails(scene.id, { description: e.target.value })}
                                  />
                               </td>
                               <td className="p-4">
                                  <textarea 
                                    className="bg-slate-950/50 border border-white/5 text-indigo-300 text-[10px] w-full outline-none focus:ring-1 focus:ring-indigo-500 p-2 rounded-xl h-16 font-mono"
                                    value={scene.visualPrompt}
                                    onChange={(e) => updateSceneDetails(scene.id, { visualPrompt: e.target.value })}
                                  />
                               </td>
                               <td className="p-4 text-center">
                                  <button 
                                    onClick={() => updateSceneDetails(scene.id, { isApproved: !scene.isApproved })}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${scene.isApproved ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'}`}
                                  >
                                     {scene.isApproved ? 'Verified' : 'Verify'}
                                  </button>
                               </td>
                            </tr>
                         ))}
                         <tr className="hover:bg-white/5 transition-colors cursor-pointer">
                            <td colSpan={5} className="p-4 text-center">
                               <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline flex items-center justify-center mx-auto">
                                  <Icons.Plus /> <span className="ml-2">Add Production Scene</span>
                               </button>
                            </td>
                         </tr>
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'cast' && (
          <div className="h-full p-12 overflow-y-auto space-y-12 animate-in fade-in slide-in-from-right-4">
             <div className="flex justify-between items-end">
                <div className="space-y-1">
                   <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Casting Dossier</h3>
                   <p className="text-slate-500 font-medium">Define your character backgrounds, motivations, and key physical traits.</p>
                </div>
                <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center">
                   <Icons.Plus /> <span className="ml-2">Add Talent</span>
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {script.characters.map((char) => (
                  <div key={char.id} className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                        <div className="text-4xl">🎭</div>
                     </div>
                     
                     <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl shadow-indigo-900/40">
                           {char.name[0]}
                        </div>
                        <input 
                           className="bg-transparent border-none text-2xl font-black tracking-tight text-white w-full outline-none focus:ring-0 p-0"
                           value={char.name}
                           onChange={(e) => updateCharacterDetails(char.id, { name: e.target.value })}
                           placeholder="Character Name"
                        />
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                              <span className="w-1 h-1 rounded-full bg-indigo-500 mr-2"></span> Cinematic Background
                           </label>
                           <textarea 
                              className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/30 h-40 resize-none font-medium leading-relaxed placeholder-slate-700"
                              value={char.description}
                              onChange={(e) => updateCharacterDetails(char.id, { description: e.target.value })}
                              placeholder="Describe the origins, backstory, and narrative arc..."
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                              <span className="w-1 h-1 rounded-full bg-indigo-500 mr-2"></span> Signature Traits
                           </label>
                           <textarea 
                              className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-indigo-400 outline-none focus:ring-2 focus:ring-indigo-500/30 h-24 resize-none font-black leading-relaxed placeholder-slate-700"
                              value={char.traits.join(', ')}
                              onChange={(e) => updateCharacterDetails(char.id, { traits: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                              placeholder="Brave, Cynical, Agile..."
                           />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'moodboard' && (
          <div className="h-full p-12 overflow-y-auto space-y-12 animate-in fade-in">
             <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Production Moodboard</h3>
                <p className="text-slate-500 font-medium">Neural visualization of key scene frames to define cinematic style.</p>
             </div>

             <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {script.scenes.map((scene) => (
                  <div key={scene.id} className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                     <div className="aspect-video bg-black flex items-center justify-center relative">
                        {scene.videoUrl ? (
                           <img src={scene.videoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="mood" />
                        ) : isMoodLoading === scene.id ? (
                           <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                           <div className="text-center p-6 space-y-2 opacity-20">
                              <div className="text-3xl mx-auto">🖼️</div>
                              <p className="text-[10px] font-black uppercase">No visualization</p>
                           </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button 
                             onClick={() => generateMoodboard(scene.id)}
                             disabled={!!isMoodLoading}
                             className="px-6 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transform group-hover:translate-y-0 translate-y-4 transition-all"
                           >
                              Generate AI Mood
                           </button>
                        </div>
                     </div>
                     <div className="p-6">
                        <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">{scene.slugline}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter truncate">{scene.description}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'director' && (
          <div className="h-full flex flex-col p-12 space-y-8 animate-in slide-in-from-left-4">
             <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Director's Lounge</h3>
                <p className="text-slate-500 font-medium">Collaborate with the Neural Producer to refine dialogue, plot twists, or scene pacing.</p>
             </div>
             
             <div className="flex-1 bg-slate-900 border border-white/5 rounded-[3rem] p-10 flex flex-col space-y-6 shadow-2xl overflow-hidden relative">
                <div className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-hide">
                   {chatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                         <div className="text-8xl">🎬</div>
                         <p className="text-xl font-black uppercase tracking-widest">Director is on set</p>
                      </div>
                   )}
                   {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[70%] p-6 rounded-[2rem] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-black/40 border border-white/5 text-slate-300'}`}>
                            {msg.text}
                         </div>
                      </div>
                   ))}
                </div>
                
                <div className="pt-6 border-t border-white/5 flex items-center space-x-4">
                   <textarea 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Discuss the script with the AI Director..."
                      className="flex-1 bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20 shadow-inner"
                   />
                   <button className="w-20 h-20 bg-indigo-600 text-white rounded-[1.8rem] flex items-center justify-center text-3xl shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all active:scale-90">
                      🚀
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieStudio;
