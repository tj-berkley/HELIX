
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MovieScript, MovieScene, MovieCharacter, Manuscript, ClonedVoice } from '../types';
import { Icons } from '../constants';

const VOICES = [
  { id: 'Puck', label: 'Puck (Youthful)', emoji: '👦' },
  { id: 'Kore', label: 'Kore (Calm)', emoji: '👩' },
  { id: 'Fenrir', label: 'Fenrir (Deep)', emoji: '🐺' },
  { id: 'Charon', label: 'Charon (Wise)', emoji: '🛶' },
  { id: 'Zephyr', label: 'Zephyr (Smooth)', emoji: '🌬️' },
];

interface MovieStudioProps {
  initialContent?: { title: string; content: string };
  manuscriptLibrary: Manuscript[];
  clonedVoices: ClonedVoice[];
  script: MovieScript | null;
  onUpdateScript: (script: MovieScript) => void;
  onMoveToProduction: () => void;
}

const MovieStudio: React.FC<MovieStudioProps> = ({ initialContent, manuscriptLibrary, script, clonedVoices, onUpdateScript, onMoveToProduction }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<string>('');
  const [isRewriting, setIsRewriting] = useState<string | null>(null);
  const [isTestingVoice, setIsTestingVoice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Scenes' | 'Characters'>('Scenes');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const charImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCharId, setUploadingCharId] = useState<string | null>(null);

  useEffect(() => {
    if (initialContent && !script) {
      convertToMovieScript(initialContent.title, initialContent.content);
    }
  }, [initialContent]);

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const handleTestVoice = async (sceneId: string) => {
    const scene = script?.scenes.find(s => s.id === sceneId);
    if (!scene || !scene.audioScript) return;
    
    setIsTestingVoice(sceneId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const voiceId = scene.voiceId || 'Kore';
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: scene.audioScript }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceId.includes('cloned') ? 'Kore' : (voiceId.includes(':') ? 'Kore' : voiceId) },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decodedBytes = decodeBase64(base64Audio);
        const audioBuffer = await decodeAudioData(decodedBytes, audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
      }
    } catch (e) {
      console.error("Voice preview failed", e);
    } finally {
      setIsTestingVoice(null);
    }
  };

  const convertToMovieScript = async (title: string, content: string) => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Convert this story into a highly detailed screenplay project.
        Title: "${title}"
        Story: "${content}"
        Requirement: Breakdown the narrative into precisely defined scene cards. Include Sluglines, specific background details, and character emotional state for each scene. Also, generate a compelling "audioScript" (dialogue or narration) for each scene. Identify key characters and provide their background and traits.`,
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
                    audioScript: { type: Type.STRING },
                    action: { type: Type.STRING },
                    dialogue: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: { character: { type: Type.STRING }, line: { type: Type.STRING } }
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
        characters: data.characters.map((c: any, i: number) => ({ 
          id: `ch-${i}`, 
          ...c, 
          voiceId: 'Kore',
          avatarUrl: `https://picsum.photos/400/400?random=${i}`
        })),
        scenes: data.scenes.map((s: any, i: number) => ({ id: `sc-${i}`, ...s, isApproved: false, voiceId: 'Kore' })),
        status: 'Pre-Production'
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const neuralRewriteScene = async (sceneId: string) => {
    if (!script) return;
    const scene = script.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    setIsRewriting(sceneId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a cinematic scriptwriter. Enrich the following scene description with much higher detail regarding background textures, lighting mood, and the intense emotional subtext of the characters. Also, refine the audioScript (narration/dialogue) to be more impactful.
        Current Slugline: ${scene.slugline}
        Current Description: ${scene.description}
        Current AudioScript: ${scene.audioScript}
        
        Return exactly three fields in JSON: "enrichedDescription", "enrichedVisualPrompt", and "enrichedAudioScript".`
      });

      const text = response.text;
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const data = JSON.parse(text.substring(jsonStart, jsonEnd));

      onUpdateScript({
        ...script,
        scenes: script.scenes.map(s => s.id === sceneId ? { 
          ...s, 
          description: data.enrichedDescription, 
          visualPrompt: data.enrichedVisualPrompt,
          audioScript: data.enrichedAudioScript
        } : s)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRewriting(null);
    }
  };

  const moveScene = (index: number, direction: 'left' | 'right') => {
    if (!script) return;
    const nextIdx = direction === 'left' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= script.scenes.length) return;
    
    const newScenes = [...script.scenes];
    const [removed] = newScenes.splice(index, 1);
    newScenes.splice(nextIdx, 0, removed);
    onUpdateScript({ ...script, scenes: newScenes });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => convertToMovieScript(file.name.replace(/\.[^/.]+$/, ""), event.target?.result as string);
    reader.readAsText(file);
  };

  const handleCharImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingCharId || !script) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdateScript({
        ...script,
        characters: script.characters.map(c => c.id === uploadingCharId ? { ...c, avatarUrl: dataUrl } : c)
      });
      setUploadingCharId(null);
    };
    reader.readAsDataURL(file);
  };

  if (!script) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 bg-slate-950 pattern-grid-dark relative text-white">
        <div className="max-w-4xl w-full grid grid-cols-2 gap-12 animate-in zoom-in-95">
           <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-12 space-y-8 shadow-2xl relative group overflow-hidden">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl mb-4">📜</div>
              <h3 className="text-3xl font-black text-white">Import from Library</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Select a manuscript you've written in the Blog & Writing Studio.</p>
              <select 
                value={selectedManuscriptId}
                onChange={(e) => setSelectedManuscriptId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none"
              >
                <option value="">Choose Manuscript...</option>
                {manuscriptLibrary.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
              <button 
                disabled={!selectedManuscriptId}
                onClick={() => {
                  const m = manuscriptLibrary.find(item => item.id === selectedManuscriptId);
                  if (m) convertToMovieScript(m.title, m.content);
                }}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 disabled:opacity-20 transition-all shadow-xl shadow-indigo-900/40"
              >
                Initialize Pipeline
              </button>
           </div>
           <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-12 space-y-8 shadow-2xl relative group overflow-hidden">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-xl mb-4">📤</div>
              <h3 className="text-3xl font-black text-white">Upload New Script</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Upload a .txt or .md file containing your story or screenplay.</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-white/10 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all"
              >
                Select Local File
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.md" onChange={handleFileUpload} />
           </div>
        </div>
        {isGenerating && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center space-y-8">
             <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-2xl font-black text-white uppercase tracking-widest animate-pulse">Consulting Neural Screenwriter...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-white font-sans">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
        <div className="flex items-center space-x-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl">🎥</div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">{script.title} // Project Studio</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Status: {script.status}</p>
          </div>
          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 ml-6">
             {(['Scenes', 'Characters'] as const).map(tab => (
               <button 
                 key={tab} 
                 onClick={() => setActiveTab(tab)}
                 className={`px-6 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 {tab}
               </button>
             ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => onUpdateScript(script)} className="px-6 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700">Save Snapshot</button>
          <button onClick={onMoveToProduction} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all">Move to Production Lab</button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'Scenes' ? (
          <div className="h-full overflow-x-auto p-12 bg-slate-950 flex space-x-8 scrollbar-hide">
            {script.scenes.map((scene, idx) => (
              <div key={scene.id} className="w-[450px] flex-shrink-0 flex flex-col space-y-6 animate-in slide-in-from-right-10 duration-500">
                 <div className="flex justify-between items-center px-2">
                    <div className="flex items-center space-x-3">
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Scene 0{idx + 1}</span>
                       <div className="flex space-x-1">
                          <button onClick={() => moveScene(idx, 'left')} className="p-1 hover:text-indigo-400 disabled:opacity-20" disabled={idx === 0}>◀</button>
                          <button onClick={() => moveScene(idx, 'right')} className="p-1 hover:text-indigo-400 disabled:opacity-20" disabled={idx === script.scenes.length - 1}>▶</button>
                       </div>
                    </div>
                    <div className="flex space-x-2">
                       <button 
                         onClick={() => neuralRewriteScene(scene.id)} 
                         disabled={isRewriting === scene.id}
                         className={`p-1.5 bg-slate-900 rounded-lg hover:text-indigo-400 transition-colors flex items-center space-x-2 ${isRewriting === scene.id ? 'animate-pulse' : ''}`}
                         title="Neural Rewrite for Background & Emotion"
                       >
                         {isRewriting === scene.id ? <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div> : <span>✨</span>}
                         <span className="text-[8px] font-black uppercase tracking-widest">Enrich</span>
                       </button>
                    </div>
                 </div>
                 
                 <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative group overflow-hidden border-t-[6px] border-indigo-600/30">
                    <input 
                      className="bg-transparent border-none text-xl font-black text-white w-full focus:ring-0 uppercase tracking-tight p-0"
                      value={scene.slugline}
                      onChange={(e) => {
                        const next = [...script.scenes];
                        next[idx] = { ...scene, slugline: e.target.value };
                        onUpdateScript({ ...script, scenes: next });
                      }}
                    />

                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between">
                         <span>Narrative Beats</span>
                         <span className="text-indigo-400 italic">Core Action</span>
                       </label>
                       <textarea 
                         className="w-full bg-black/30 border border-white/5 rounded-2xl p-5 text-sm text-slate-400 h-32 resize-none font-medium leading-relaxed italic scrollbar-hide focus:border-indigo-500 outline-none transition-all"
                         value={scene.description}
                         onChange={(e) => {
                            const next = [...script.scenes];
                            next[idx] = { ...scene, description: e.target.value };
                            onUpdateScript({ ...script, scenes: next });
                         }}
                       />
                    </div>

                    <div className="space-y-3 p-5 bg-indigo-900/10 rounded-[2rem] border border-indigo-500/10">
                       <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest px-1 flex justify-between items-center">
                         <span>Written Audio Script</span>
                         <button 
                           onClick={() => handleTestVoice(scene.id)} 
                           disabled={isTestingVoice === scene.id || !scene.audioScript}
                           className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-20"
                         >
                           {isTestingVoice === scene.id ? <div className="w-2 h-2 border border-emerald-400 border-t-transparent rounded-full animate-spin mr-1"></div> : '🔊'}
                           <span className="text-[8px] font-black uppercase">Test Voice</span>
                         </button>
                       </label>
                       <textarea 
                         className="w-full bg-black/30 border border-white/5 rounded-2xl p-4 text-sm text-white h-24 resize-none font-medium leading-relaxed scrollbar-hide focus:border-indigo-500 outline-none transition-all mt-2"
                         placeholder="Write the narration or dialogue for this scene..."
                         value={scene.audioScript || ''}
                         onChange={(e) => {
                            const next = [...script.scenes];
                            next[idx] = { ...scene, audioScript: e.target.value };
                            onUpdateScript({ ...script, scenes: next });
                         }}
                       />
                       <div className="flex flex-wrap gap-1 mt-3">
                          {[...clonedVoices, ...VOICES].map(v => (
                            <button 
                              key={v.id} 
                              onClick={() => {
                                const next = [...script.scenes];
                                next[idx] = { ...scene, voiceId: v.id };
                                onUpdateScript({ ...script, scenes: next });
                              }}
                              className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase transition-all flex items-center space-x-1 ${scene.voiceId === v.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-black/40 text-slate-500 hover:text-slate-300'}`}
                              title={v.label}
                            >
                              <span>{v.emoji}</span>
                              <span className="truncate max-w-[50px]">{v.id.includes('cloned') ? (v as any).label.split(' ')[0] : v.id}</span>
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Visual Synthesis Parameters</label>
                       <textarea 
                         className="w-full bg-slate-950/50 border border-indigo-500/10 rounded-2xl p-5 text-[10px] font-mono text-indigo-300 h-24 resize-none outline-none focus:border-indigo-500 transition-all"
                         value={scene.visualPrompt}
                         onChange={(e) => {
                            const next = [...script.scenes];
                            next[idx] = { ...scene, visualPrompt: e.target.value };
                            onUpdateScript({ ...script, scenes: next });
                         }}
                       />
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                       <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${scene.isApproved ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
                          <span className="text-[9px] font-black text-slate-500 uppercase">Verification</span>
                       </div>
                       <button 
                         onClick={() => {
                            const next = [...script.scenes];
                            next[idx] = { ...scene, isApproved: !scene.isApproved };
                            onUpdateScript({ ...script, scenes: next });
                         }}
                         className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${scene.isApproved ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                       >
                         {scene.isApproved ? 'Approved' : 'Commit Beat'}
                       </button>
                    </div>
                 </div>
              </div>
            ))}
            <button className="w-[300px] flex-shrink-0 h-[600px] border-4 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center space-y-4 text-slate-700 hover:border-indigo-500 hover:text-indigo-500 transition-all group">
               <div className="w-16 h-16 rounded-full border-4 border-slate-900 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all shadow-2xl">
                  <Icons.Plus />
               </div>
               <span className="font-black uppercase tracking-widest text-xs">Append Sequence</span>
            </button>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-12 bg-slate-950 pattern-grid-dark">
             <div className="max-w-6xl mx-auto space-y-12">
                <div className="flex justify-between items-end border-b border-white/5 pb-8">
                   <div>
                      <h3 className="text-4xl font-black tracking-tighter">Character Registry</h3>
                      <p className="text-slate-500 font-medium text-lg mt-1">Define the biometric and narrative essence of your cast.</p>
                   </div>
                   <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Add Character</button>
                </div>

                <div className="grid grid-cols-1 gap-12">
                   {script.characters.map((char, charIdx) => (
                      <div key={char.id} className="bg-slate-900/50 border border-white/5 rounded-[4rem] p-12 flex flex-col lg:flex-row gap-12 group hover:border-indigo-500/30 transition-all shadow-2xl">
                         <div className="lg:w-80 flex flex-col space-y-6">
                            <div 
                              onClick={() => {
                                setUploadingCharId(char.id);
                                charImageInputRef.current?.click();
                              }}
                              className="aspect-square rounded-[3rem] bg-black/40 border-2 border-dashed border-white/10 overflow-hidden relative group/avatar cursor-pointer hover:border-indigo-500 transition-all"
                            >
                               {char.avatarUrl ? (
                                 <img src={char.avatarUrl} className="w-full h-full object-cover group-hover/avatar:scale-105 transition-transform" />
                               ) : (
                                 <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
                                    <span className="text-4xl">👤</span>
                                    <span className="text-[8px] font-black uppercase text-slate-500">Upload Visual Ref</span>
                                 </div>
                               )}
                               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-[10px] font-black uppercase tracking-widest">Update Face Ref</span>
                               </div>
                            </div>
                            <input 
                              type="text" 
                              className="bg-transparent border-none text-2xl font-black text-white w-full focus:ring-0 uppercase tracking-tight text-center"
                              value={char.name}
                              onChange={(e) => {
                                 const nextChars = [...script.characters];
                                 nextChars[charIdx] = { ...char, name: e.target.value };
                                 onUpdateScript({ ...script, characters: nextChars });
                              }}
                            />
                            <div className="space-y-3">
                               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Voice Identity</label>
                               <div className="relative group/voice">
                                  <select 
                                     value={char.voiceId || 'Kore'}
                                     onChange={(e) => {
                                        const nextChars = [...script.characters];
                                        nextChars[charIdx] = { ...char, voiceId: e.target.value };
                                        onUpdateScript({ ...script, characters: nextChars });
                                     }}
                                     className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-black text-indigo-400 outline-none appearance-none cursor-pointer group-hover/voice:border-indigo-500/50 transition-all"
                                  >
                                     {clonedVoices.length > 0 && (
                                        <optgroup label="Neural Clones" className="bg-slate-900 text-indigo-400">
                                           {clonedVoices.map(v => (
                                              <option key={v.id} value={v.id}>{v.emoji} {v.label}</option>
                                           ))}
                                        </optgroup>
                                     )}
                                     <optgroup label="System Registry" className="bg-slate-900 text-slate-500">
                                        {VOICES.map(v => (
                                          <option key={v.id} value={v.id}>{v.emoji} {v.label}</option>
                                        ))}
                                     </optgroup>
                                  </select>
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 scale-75">
                                     <Icons.ChevronDown />
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="flex-1 space-y-8">
                            <div className="space-y-4">
                               <div className="flex justify-between items-center px-1">
                                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Character Background & Origin</h4>
                                  <span className="text-indigo-400 text-[9px] font-black uppercase italic">Neural Grounding</span>
                               </div>
                               <textarea 
                                 className="w-full bg-black/30 border border-white/5 rounded-[2.5rem] p-8 text-sm text-slate-300 h-40 resize-none font-medium leading-relaxed scrollbar-hide focus:border-indigo-500 outline-none transition-all shadow-inner"
                                 placeholder="Detail this character's history, motivation, and role in the story..."
                                 value={char.description}
                                 onChange={(e) => {
                                    const nextChars = [...script.characters];
                                    nextChars[charIdx] = { ...char, description: e.target.value };
                                    onUpdateScript({ ...script, characters: nextChars });
                                 }}
                               />
                            </div>

                            <div className="space-y-4">
                               <div className="flex justify-between items-center px-1">
                                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Traits & Behavioral Nuance</h4>
                                  <span className="text-slate-600 text-[9px] font-black uppercase">Comma Separated Traits</span>
                               </div>
                               <textarea 
                                 className="w-full bg-black/30 border border-white/5 rounded-[2.5rem] p-8 text-sm text-indigo-300 h-32 resize-none font-black leading-relaxed scrollbar-hide focus:border-indigo-500 outline-none transition-all shadow-inner uppercase tracking-widest"
                                 placeholder="STERN, ANALYTICAL, WHISPERS_WHEN_ANGRY, LOYAL..."
                                 value={char.traits.join(', ')}
                                 onChange={(e) => {
                                    const nextChars = [...script.characters];
                                    nextChars[charIdx] = { ...char, traits: e.target.value.split(',').map(t => t.trim()).filter(Boolean) };
                                    onUpdateScript({ ...script, characters: nextChars });
                                 }}
                               />
                            </div>

                            <div className="flex items-center space-x-6 opacity-40">
                               <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                  <span className="text-[9px] font-black uppercase">Scene Consistency Active</span>
                               </div>
                               <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                  <span className="text-[9px] font-black uppercase">Voice Link Synced</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
             <input 
               type="file" 
               ref={charImageInputRef} 
               className="hidden" 
               accept="image/*" 
               onChange={handleCharImageUpload} 
             />
          </div>
        )
        }
      </div>
    </div>
  );
};

export default MovieStudio;
