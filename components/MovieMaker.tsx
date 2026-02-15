
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MovieScript, MovieScene, ReleasedMovie } from '../types';

interface MovieMakerProps {
  script: MovieScript | null;
  onUpdateScript: (script: MovieScript) => void;
  onRelease?: (movie: ReleasedMovie) => void;
}

const MovieMaker: React.FC<MovieMakerProps> = ({ script, onUpdateScript, onRelease }) => {
  const [isReleasing, setIsReleasing] = useState(false);
  const [assemblyProgress, setAssemblyProgress] = useState(0);

  const renderSceneVideo = async (sceneId: string) => {
    if (!script) return;

    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) await (window as any).aistudio.openSelectKey();

    const sceneIdx = script.scenes.findIndex(s => s.id === sceneId);
    const updatedScenes = [...script.scenes];
    updatedScenes[sceneIdx] = { ...updatedScenes[sceneIdx], isGenerating: true };
    onUpdateScript({ ...script, scenes: updatedScenes });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const scene = script.scenes[sceneIdx];
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `${scene.visualPrompt}. Master color graded, high fidelity cinema 4k.`,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const finalScenes = [...script.scenes];
        finalScenes[sceneIdx] = { ...finalScenes[sceneIdx], videoUrl: url, isGenerating: false };
        onUpdateScript({ ...script, scenes: finalScenes });
      }
    } catch (error) {
      console.error("Video rendering failed", error);
      const finalScenes = [...script.scenes];
      finalScenes[sceneIdx] = { ...finalScenes[sceneIdx], isGenerating: false };
      onUpdateScript({ ...script, scenes: finalScenes });
    }
  };

  const releaseToBoxOffice = () => {
    if (!script) return;
    setIsReleasing(true);
    
    const released: ReleasedMovie = {
      id: `m-${Date.now()}`,
      title: script.title,
      description: script.logline,
      posterUrl: script.scenes[0].videoUrl || `https://picsum.photos/1280/720?random=${Date.now()}`,
      ticketPrice: 12.50,
      ticketsSold: 0,
      totalRevenue: 0,
      author: "Hobbs AI Studio"
    };

    // Simulate assembly delay
    let p = 0;
    const interval = setInterval(() => {
        p += 5;
        setAssemblyProgress(p);
        if (p >= 100) {
            clearInterval(interval);
            onRelease?.(released);
            setIsReleasing(false);
        }
    }, 100);
  };

  const renderedCount = script?.scenes.filter(s => s.videoUrl).length || 0;
  const totalCount = script?.scenes.length || 0;
  const isReadyForRelease = renderedCount === totalCount && totalCount > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-white">
      <div className="p-8 bg-black border-b border-white/5 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-3xl font-black tracking-tight">{script?.title ? `${script.title} (Render Lab)` : "Movie Maker Lab"}</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Scene-by-Scene Neural Rendering // Final Master</p>
        </div>
        <div className="flex items-center space-x-6">
           <div className="text-right">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Render Pipeline</p>
              <p className="text-lg font-black text-indigo-400">{renderedCount} / {totalCount} Renders</p>
           </div>
           <button 
              onClick={releaseToBoxOffice}
              disabled={!isReadyForRelease || isReleasing}
              className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all ${isReadyForRelease ? 'bg-rose-600 shadow-rose-900/40 hover:bg-rose-700 hover:-translate-y-1' : 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed'}`}
           >
              {isReleasing ? `Assembling Final Cut ${assemblyProgress}%` : 'Assemble & Release'}
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {!script ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-8 animate-in fade-in">
             <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-2xl border border-white/5">🎬</div>
             <h3 className="text-4xl font-black">No Verified Script Found</h3>
             <p className="text-slate-500 max-w-md mx-auto text-center font-medium">Head back to the <strong>Movie Studio</strong> to prep and verify your scenes before they appear in the production lab.</p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
             {/* Render Queue */}
             <div className="w-[450px] border-r border-white/5 bg-black/20 overflow-y-auto p-10 space-y-10">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Render Queue</h4>
                <div className="space-y-6">
                   {script.scenes.map((scene, idx) => (
                      <div key={scene.id} className={`p-8 rounded-[2.5rem] border-2 transition-all group ${scene.videoUrl ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/50 border-white/5 hover:border-indigo-500/30'}`}>
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <span className="text-[9px] font-black text-slate-500 uppercase">Scene 0{idx + 1}</span>
                               <h5 className="font-black text-slate-200 uppercase tracking-tight text-xs mt-1 truncate w-40">{scene.slugline}</h5>
                            </div>
                            {scene.videoUrl ? (
                               <span className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">✓</span>
                            ) : scene.isGenerating ? (
                               <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : null}
                         </div>
                         <p className="text-[10px] text-slate-500 italic mb-6 line-clamp-2">"{scene.description}"</p>
                         <button 
                            onClick={() => renderSceneVideo(scene.id)}
                            disabled={scene.isGenerating}
                            className={`w-full py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${scene.videoUrl ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700'}`}
                         >
                            {scene.videoUrl ? 'Re-Render Asset' : scene.isGenerating ? 'Processing...' : 'Run Neural Master'}
                         </button>
                      </div>
                   ))}
                </div>
             </div>

             {/* Monitor Area */}
             <div className="flex-1 bg-black p-12 flex flex-col items-center justify-center relative pattern-grid-dark">
                <div className="absolute top-10 left-10 right-10 flex justify-between items-center opacity-30">
                   <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">Live Production Node 02</span>
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.4em]">8K RAW PASSTHROUGH</span>
                </div>

                <div className="w-full max-w-5xl aspect-video bg-slate-900 rounded-[3.5rem] shadow-[0_60px_120px_rgba(0,0,0,0.9)] overflow-hidden border-[12px] border-slate-950 relative group">
                   {script.scenes.some(s => s.videoUrl) ? (
                      <div className="w-full h-full flex overflow-x-auto snap-x scrollbar-hide">
                         {script.scenes.filter(s => s.videoUrl).map((s, i) => (
                            <div key={i} className="flex-shrink-0 w-full h-full snap-center relative">
                               <video src={s.videoUrl} className="w-full h-full object-cover" autoPlay loop muted />
                               <div className="absolute bottom-10 left-10 p-8 bg-black/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 max-w-md shadow-2xl">
                                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">Clip Monitor // 0{i+1}</span>
                                  <p className="text-sm text-white font-medium italic">"{s.description}"</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                         <div className="text-9xl opacity-[0.03]">🎞️</div>
                         <div className="text-center">
                            <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Waiting for Neural Master Link</p>
                            <p className="text-slate-800 text-[9px] mt-2 font-bold uppercase tracking-[0.2em]">Select a scene from the queue to start rendering</p>
                         </div>
                      </div>
                   )}

                   {/* Production HUD Overlay */}
                   <div className="absolute top-10 right-10 flex flex-col items-end space-y-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-rose-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">Rec Active</div>
                      <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-[8px] font-mono text-white/40 space-y-1">
                         <div>FRAME_RATE: 24.00</div>
                         <div>BITRATE: 450Mbps</div>
                         <div>TEMP: 42°C</div>
                      </div>
                   </div>
                </div>

                <div className="mt-12 flex space-x-6 opacity-30">
                   <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em]">Timeline Lock Active</span>
                   </div>
                   <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em]">Audio Sync Ver. 3.2</span>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieMaker;
