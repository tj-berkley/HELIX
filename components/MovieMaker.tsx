
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MovieScript, MovieScene, ReleasedMovie } from '../types';

interface MovieMakerProps {
  savedProjects: MovieScript[];
  onRelease?: (movie: ReleasedMovie) => void;
}

const MovieMaker: React.FC<MovieMakerProps> = ({ savedProjects, onRelease }) => {
  const [activeProject, setActiveProject] = useState<MovieScript | null>(savedProjects[0] || null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [assemblyProgress, setAssemblyProgress] = useState(0);

  const renderSceneVideo = async (sceneId: string) => {
    if (!activeProject) return;

    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) await (window as any).aistudio.openSelectKey();

    const sceneIdx = activeProject.scenes.findIndex(s => s.id === sceneId);
    const updatedScenes = [...activeProject.scenes];
    updatedScenes[sceneIdx] = { ...updatedScenes[sceneIdx], isGenerating: true };
    setActiveProject({ ...activeProject, scenes: updatedScenes });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const scene = activeProject.scenes[sceneIdx];
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `${scene.visualPrompt}. Master color graded, cinema grade quality.`,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const finalScenes = [...activeProject.scenes];
        finalScenes[sceneIdx] = { ...finalScenes[sceneIdx], videoUrl: url, isGenerating: false };
        setActiveProject({ ...activeProject, scenes: finalScenes });
      }
    } catch (error) {
      console.error(error);
      const finalScenes = [...activeProject.scenes];
      finalScenes[sceneIdx] = { ...finalScenes[sceneIdx], isGenerating: false };
      setActiveProject({ ...activeProject, scenes: finalScenes });
    }
  };

  const releaseToBoxOffice = () => {
    if (!activeProject) return;
    setIsReleasing(true);
    let p = 0;
    const interval = setInterval(() => {
        p += 5;
        setAssemblyProgress(p);
        if (p >= 100) {
            clearInterval(interval);
            onRelease?.({
                id: `m-${Date.now()}`,
                title: activeProject.title,
                description: activeProject.logline,
                posterUrl: activeProject.scenes[0].videoUrl || `https://picsum.photos/1280/720?random=${Date.now()}`,
                ticketPrice: 12.50,
                ticketsSold: 0,
                totalRevenue: 0,
                author: "Hobbs Studio AI"
            });
            setIsReleasing(false);
        }
    }, 100);
  };

  const renderedCount = activeProject?.scenes.filter(s => s.videoUrl).length || 0;
  const totalCount = activeProject?.scenes.length || 0;
  const isReadyForRelease = renderedCount === totalCount && totalCount > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-white font-sans">
      <div className="p-8 bg-black border-b border-white/5 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-8">
           <div>
              <h2 className="text-3xl font-black tracking-tight">Neural Production Lab</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Final Frame Synthesis & Rendering</p>
           </div>
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Active Studio Project</span>
              <select 
                value={activeProject?.id || ''}
                onChange={(e) => setActiveProject(savedProjects.find(p => p.id === e.target.value) || null)}
                className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              >
                 {savedProjects.length === 0 && <option>No Projects Found</option>}
                 {savedProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
           </div>
        </div>
        <div className="flex items-center space-x-6">
           <div className="text-right">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Render Stack</p>
              <p className="text-lg font-black text-indigo-400">{renderedCount} / {totalCount} Ready</p>
           </div>
           <button 
              onClick={releaseToBoxOffice}
              disabled={!isReadyForRelease || isReleasing}
              className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all ${isReadyForRelease ? 'bg-rose-600 shadow-rose-900/40 hover:bg-rose-700 hover:-translate-y-1' : 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed'}`}
           >
              {isReleasing ? `Packaging... ${assemblyProgress}%` : 'Assemble Full Movie'}
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {!activeProject ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-6">
             <div className="w-32 h-32 bg-slate-900 rounded-[3rem] flex items-center justify-center text-6xl shadow-2xl border border-white/5">🎞️</div>
             <div className="text-center space-y-2">
                <h3 className="text-4xl font-black">Project Queue Empty</h3>
                <p className="text-slate-500 font-medium">Head to the <strong>Movie Studio</strong> to design and save a cinematic project first.</p>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
             <div className="w-[500px] border-r border-white/5 bg-black/20 overflow-y-auto p-10 space-y-8">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Frame Synthesis Queue</h4>
                <div className="space-y-6">
                   {activeProject.scenes.map((scene, idx) => (
                      <div key={scene.id} className={`p-8 rounded-[2.5rem] border-2 transition-all ${scene.videoUrl ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900 border-white/5 hover:border-indigo-500/30'}`}>
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sequence 0{idx + 1}</span>
                               <h5 className="font-black text-slate-200 uppercase tracking-tight text-xs mt-1 truncate w-48">{scene.slugline}</h5>
                            </div>
                            {scene.videoUrl && <span className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-[10px]">✓</span>}
                         </div>
                         <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/5">
                            <p className="text-[10px] text-slate-500 italic leading-relaxed line-clamp-3">"{scene.description}"</p>
                         </div>
                         <button 
                            onClick={() => renderSceneVideo(scene.id)}
                            disabled={scene.isGenerating}
                            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${scene.videoUrl ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700'}`}
                         >
                            {scene.isGenerating ? 'Synthesizing Neural Latency...' : scene.videoUrl ? 'Re-Render Sequence' : 'Start Frame Generation'}
                         </button>
                      </div>
                   ))}
                </div>
             </div>

             <div className="flex-1 bg-black p-12 flex flex-col items-center justify-center relative pattern-grid-dark">
                <div className="w-full max-w-5xl aspect-video bg-slate-900 rounded-[4rem] shadow-[0_80px_160px_rgba(0,0,0,1)] overflow-hidden border-[16px] border-slate-950 relative group">
                   {activeProject.scenes.some(s => s.videoUrl) ? (
                      <div className="w-full h-full flex overflow-x-auto snap-x scrollbar-hide">
                         {activeProject.scenes.filter(s => s.videoUrl).map((s, i) => (
                            <div key={i} className="flex-shrink-0 w-full h-full snap-center relative">
                               <video src={s.videoUrl} className="w-full h-full object-cover" autoPlay loop muted />
                               <div className="absolute bottom-10 left-10 p-8 bg-black/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 max-w-md">
                                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 block tracking-[0.2em]">Neural Feed 0{i+1}</span>
                                  <p className="text-sm text-white font-medium italic">"{s.description}"</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center space-y-6 opacity-20">
                         <div className="text-[120px]">📡</div>
                         <p className="text-xl font-black uppercase tracking-[0.4em]">Await Signal</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieMaker;
