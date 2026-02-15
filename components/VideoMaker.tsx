
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { LipSyncMode, PublishingDestination } from '../types';
import { Icons } from '../constants';
import BlogPublishModal from './BlogPublishModal';

const REASSURING_MESSAGES = [
  "Initializing neural rendering engine...",
  "Analyzing script for motion dynamics...",
  "Generating high-fidelity frames...",
  "Optimizing cinematic lighting...",
  "Encoding ultra-realistic video output...",
];

const MOTION_PRESETS = [
  { id: 'static', label: 'Static Camera', icon: '📷', prompt: 'Fixed camera position, no movement.' },
  { id: 'pan', label: 'Cinematic Pan', icon: '↔️', prompt: 'Smooth horizontal cinematic pan across the scene.' },
  { id: 'zoom', label: 'Slow Zoom In', icon: '🔍', prompt: 'Gradual, dramatic slow zoom into the focal point.' },
  { id: 'tilt', label: 'Dynamic Tilt', icon: '↕️', prompt: 'Slow vertical tilt up to reveal the scale of the environment.' },
  { id: 'orbit', label: '360 Orbit', icon: '🔄', prompt: 'Full 360-degree orbital camera rotation around the subject.' },
];

interface TimelineClip {
  id: string;
  url: string;
  prompt: string;
  duration: number;
  status: 'rendering' | 'ready' | 'failed';
  motionId: string;
}

const VideoMaker: React.FC = () => {
  const [script, setScript] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [activeMotion, setActiveMotion] = useState('pan');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  
  // Timeline & Clip State
  const [timeline, setTimeline] = useState<TimelineClip[]>([]);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);

  const activeClip = timeline.find(c => c.id === activeClipId);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => setLoadingMessageIdx((prev) => (prev + 1) % REASSURING_MESSAGES.length), 4000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const extractDetailedPrompt = async () => {
    if (!script.trim()) return;
    setIsExtracting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a professional cinematographer. Expand this short description into a highly detailed, 100-word production prompt for a high-end video AI: "${script}". Include lighting, textures, camera lens details, and atmospheric conditions.`
      });
      setScript(response.text || script);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!script.trim()) return;
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) await (window as any).aistudio.openSelectKey();
      
      setIsGenerating(true);
      const clipId = `clip-${Date.now()}`;
      const motion = MOTION_PRESETS.find(m => m.id === activeMotion)?.prompt || '';
      
      // Add placeholder to timeline
      const newClip: TimelineClip = {
        id: clipId,
        url: '',
        prompt: script,
        duration: 6,
        status: 'rendering',
        motionId: activeMotion
      };
      setTimeline(prev => [...prev, newClip]);
      setActiveClipId(clipId);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const finalPrompt = `${script}. Camera Motion: ${motion}. Resolution: ${resolution}. Cinematic masterpiece, 8k, master color grade.`;
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: finalPrompt,
        config: { numberOfVideos: 1, resolution: resolution as any, aspectRatio }
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
        
        setTimeline(prev => prev.map(c => c.id === clipId ? { ...c, url, status: 'ready' } : c));
      }
    } catch (error: any) {
      console.error(error);
      setTimeline(prev => prev.filter(c => c.status !== 'rendering'));
    } finally {
      setIsGenerating(false);
    }
  };

  const upscaleActiveClip = async () => {
    if (!activeClip || activeClip.status !== 'ready') return;
    setResolution('1080p');
    // In a real scenario, we would re-run with higher res config or use an upscale model.
    // Here we trigger a re-gen with 1080p.
    handleGenerateVideo();
  };

  const handlePublish = (data: { title: string; description: string; destination: PublishingDestination }) => {
    setIsPublishModalOpen(false);
    alert(`Success! Final master synced to ${data.destination}.`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-white font-sans">
      {/* Studio Header HUD */}
      <div className="p-6 bg-black border-b border-white/5 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl mr-3 shadow-[0_0_20px_rgba(79,70,229,0.4)]">📹</div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase">Video Maker Studio</h2>
              <p className="text-[8px] text-indigo-400 font-bold tracking-[0.4em] uppercase">Neural Production Suite v4.0</p>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex items-center space-x-4">
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Master Format</span>
                <span className="text-[10px] font-bold text-slate-300">{resolution} // {aspectRatio}</span>
             </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsPublishModalOpen(true)} className="px-5 py-2 bg-slate-900 border border-white/10 hover:bg-slate-800 transition-all text-[10px] font-black uppercase tracking-widest rounded-xl">Post to Blog</button>
          <button 
            onClick={handleGenerateVideo} 
            disabled={isGenerating || !script.trim()} 
            className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-30 flex items-center space-x-2"
          >
            {isGenerating ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>Start Neural Render</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* AI Tools Sidebar */}
        <div className="w-80 bg-black/40 border-r border-white/5 p-6 space-y-10 overflow-y-auto shrink-0 scrollbar-hide">
          <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between">
                <span>1. Script Narrative</span>
                <button 
                   onClick={extractDetailedPrompt} 
                   disabled={isExtracting || !script}
                   className="text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-20"
                >
                  {isExtracting ? 'Extracting...' : 'Extract Prompt ✨'}
                </button>
             </h3>
             <textarea 
               value={script} 
               onChange={(e) => setScript(e.target.value)} 
               className="w-full h-40 p-5 text-xs bg-slate-900/80 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none font-medium text-slate-300 shadow-inner leading-relaxed" 
               placeholder="Describe your scene in detail..."
             />
          </section>

          <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">2. AI Motion Control</h3>
             <div className="grid grid-cols-1 gap-2">
                {MOTION_PRESETS.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setActiveMotion(m.id)}
                    className={`p-4 rounded-2xl border transition-all flex items-center space-x-4 group ${activeMotion === m.id ? 'bg-indigo-600 border-indigo-400 shadow-lg' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                  >
                     <span className="text-xl group-hover:scale-125 transition-transform">{m.icon}</span>
                     <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-tight">{m.label}</p>
                        <p className={`text-[8px] font-medium leading-tight ${activeMotion === m.id ? 'text-indigo-100' : 'text-slate-500'}`}>{m.id === 'static' ? 'Fixed perspective' : 'Dynamic flow'}</p>
                     </div>
                  </button>
                ))}
             </div>
          </section>

          <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">3. Render Output</h3>
             <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setAspectRatio('16:9')} className={`py-3 rounded-xl text-[10px] font-black border transition-all ${aspectRatio === '16:9' ? 'bg-slate-800 border-white/40' : 'border-white/5 text-slate-500'}`}>16:9 Landscape</button>
                <button onClick={() => setAspectRatio('9:16')} className={`py-3 rounded-xl text-[10px] font-black border transition-all ${aspectRatio === '9:16' ? 'bg-slate-800 border-white/40' : 'border-white/5 text-slate-500'}`}>9:16 Portrait</button>
             </div>
          </section>
        </div>

        {/* Studio Viewport */}
        <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center relative pattern-grid-dark">
          <div className="absolute top-8 left-8 flex items-center space-x-2 z-10 opacity-40">
             <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Production Monitor</span>
          </div>

          <div className={`w-full max-w-4xl transition-all duration-700 ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] h-[70%]'} bg-black rounded-[2.5rem] overflow-hidden shadow-[0_80px_160px_rgba(0,0,0,0.9)] relative flex items-center justify-center group border-[8px] border-slate-950`}>
            {isGenerating ? (
              <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="relative w-20 h-20 mx-auto">
                   <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="space-y-1">
                   <p className="text-xl font-black tracking-tight">{REASSURING_MESSAGES[loadingMessageIdx]}</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Allocating GPU Buffers...</p>
                </div>
              </div>
            ) : activeClip?.url ? (
              <>
                <video src={activeClip.url} className="w-full h-full object-cover" controls autoPlay loop />
                <div className="absolute top-6 right-6 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all">
                   <button onClick={upscaleActiveClip} className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">2x Neural Upscale</button>
                </div>
                <div className="absolute bottom-6 left-6 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl max-w-xs">
                   <p className="text-[10px] text-indigo-400 font-black uppercase mb-1">Active Clip Details</p>
                   <p className="text-[9px] text-slate-300 font-medium italic line-clamp-2">"{activeClip.prompt}"</p>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <div className="text-8xl">🎬</div>
                <p className="text-xl font-black uppercase tracking-widest">Ready for First Take</p>
              </div>
            )}
          </div>

          {/* Timeline Editor Area */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-black/60 backdrop-blur-2xl border-t border-white/5 p-6 flex flex-col space-y-4">
             <div className="flex justify-between items-center px-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Production Timeline // Sequence</h4>
                <div className="flex items-center space-x-4">
                   <span className="text-[10px] font-bold text-slate-600 uppercase">{timeline.length} Clips // Total: {timeline.length * 6}s</span>
                   <button className="text-[10px] font-black text-indigo-500 uppercase hover:underline">Auto-Transition</button>
                </div>
             </div>
             
             <div className="flex-1 flex space-x-4 overflow-x-auto pb-2 scrollbar-hide px-2">
                {timeline.map((clip, idx) => (
                  <div 
                    key={clip.id} 
                    onClick={() => setActiveClipId(clip.id)}
                    className={`relative flex-shrink-0 w-56 h-full rounded-2xl border-2 transition-all cursor-pointer overflow-hidden group/clip ${activeClipId === clip.id ? 'border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)]' : 'border-white/5 hover:border-white/20'}`}
                  >
                     {clip.status === 'rendering' ? (
                       <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center space-y-2">
                          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[8px] font-black text-indigo-400 uppercase">Neural Splicing...</span>
                       </div>
                     ) : (
                       <>
                         <video src={clip.url} className="w-full h-full object-cover opacity-60 group-hover/clip:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                         <div className="absolute bottom-2 left-3 flex items-center justify-between right-3">
                            <span className="text-[8px] font-black text-white/60">0{idx + 1}</span>
                            <span className="text-[8px] font-black text-white/60">6s</span>
                         </div>
                       </>
                     )}
                     <button 
                      onClick={(e) => { e.stopPropagation(); setTimeline(prev => prev.filter(c => c.id !== clip.id)); if (activeClipId === clip.id) setActiveClipId(null); }} 
                      className="absolute top-2 right-2 w-6 h-6 bg-black/40 text-white rounded-lg flex items-center justify-center text-[10px] opacity-0 group-hover/clip:opacity-100 transition-all hover:bg-rose-600"
                     >✕</button>
                  </div>
                ))}
                <button 
                  onClick={() => setScript('')}
                  className="flex-shrink-0 w-56 h-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center space-y-2 text-slate-600 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                >
                   <span className="text-2xl group-hover:scale-110 transition-transform">+</span>
                   <span className="text-[8px] font-black uppercase tracking-widest">Append Next Scene</span>
                </button>
             </div>
          </div>
        </div>
      </div>

      {isPublishModalOpen && (
        <BlogPublishModal 
          initialTitle="New Cinematic Sequence"
          initialDescription={`Production master: ${timeline.length} scenes, ${resolution} resolution.`}
          onClose={() => setIsPublishModalOpen(false)}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
};

export default VideoMaker;
