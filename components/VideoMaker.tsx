
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PublishingDestination } from '../types';
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
  { id: 'static', label: 'Static', icon: '📷', prompt: 'Fixed camera position, no movement.' },
  { id: 'pan_right', label: 'Pan Right', icon: '➡️', prompt: 'Smooth horizontal cinematic pan to the right.' },
  { id: 'pan_left', label: 'Pan Left', icon: '⬅️', prompt: 'Smooth horizontal cinematic pan to the left.' },
  { id: 'zoom_in', label: 'Zoom In', icon: '🔍', prompt: 'Gradual, dramatic slow zoom into the focal point.' },
  { id: 'zoom_out', label: 'Zoom Out', icon: '🔭', prompt: 'Gradual slow zoom out to reveal the wider scene.' },
  { id: 'tilt_up', label: 'Tilt Up', icon: '⬆️', prompt: 'Slow vertical tilt up to reveal scale.' },
  { id: 'orbit', label: '360 Orbit', icon: '🔄', prompt: 'Full 360-degree orbital camera rotation around the subject.' },
];

interface TimelineClip {
  id: string;
  url: string;
  prompt: string;
  duration: number;
  status: 'rendering' | 'ready' | 'failed';
  motionId: string;
  resolution: '720p' | '1080p';
  thumbnail?: string;
  type: 'scene' | 'lipsync';
}

const VideoMaker: React.FC = () => {
  const [activeStudioTab, setActiveStudioTab] = useState<'scene' | 'lipsync'>('scene');
  const [script, setScript] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [activeMotion, setActiveMotion] = useState('static');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  
  // Scene Generation state
  const [startingFrame, setStartingFrame] = useState<string | null>(null);
  
  // LipSync state
  const [syncVideo, setSyncVideo] = useState<string | null>(null);
  const [syncAudioText, setSyncAudioText] = useState('');
  const [syncMode, setSyncMode] = useState<'clone' | 'avatar' | 'satire'>('avatar');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const syncVideoInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setStartingFrame(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSyncVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSyncVideo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const extractDetailedPrompt = async () => {
    setIsExtracting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let promptContent: any = `Act as a professional cinematographer. `;
      if (startingFrame) {
        promptContent = {
          parts: [
            { inlineData: { data: startingFrame.split(',')[1], mimeType: 'image/jpeg' } },
            { text: "Analyze this image and describe a high-end cinematic video prompt that starts from this frame. Include lighting, lens details, and motion. Be extremely descriptive." }
          ]
        };
      } else {
        promptContent = `Expand this short description into a highly detailed, 100-word production prompt for a high-end video AI: "${script || 'A beautiful cinematic scene'}". Include lighting, textures, camera lens details, and atmospheric conditions.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: promptContent
      });
      setScript(response.text || script);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateVideo = async (isUpscale: boolean = false, targetId?: string) => {
    if (activeStudioTab === 'scene' && !script.trim() && !startingFrame) return;
    if (activeStudioTab === 'lipsync' && !syncVideo && !syncAudioText.trim()) return;
    
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        return;
      }
      
      setIsGenerating(true);
      const clipId = targetId || `clip-${Date.now()}`;
      const motion = MOTION_PRESETS.find(m => m.id === activeMotion)?.prompt || '';
      const currentRes = isUpscale ? '1080p' : resolution;

      if (!isUpscale) {
        const newClip: TimelineClip = {
          id: clipId,
          url: '',
          prompt: activeStudioTab === 'scene' ? script : syncAudioText,
          duration: 6,
          status: 'rendering',
          motionId: activeMotion,
          resolution: currentRes,
          thumbnail: activeStudioTab === 'scene' ? (startingFrame || undefined) : (syncVideo || undefined),
          type: activeStudioTab
        };
        setTimeline(prev => [...prev, newClip]);
        setActiveClipId(clipId);
      } else {
        setTimeline(prev => prev.map(c => c.id === clipId ? { ...c, status: 'rendering', resolution: '1080p' } : c));
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation;

      if (activeStudioTab === 'scene') {
        const finalPrompt = `${script}. Camera Motion: ${motion}. Cinematic masterpiece, 8k, master color grade, highly detailed, photorealistic.`;
        const generationConfig: any = {
          model: 'veo-3.1-fast-generate-preview',
          prompt: finalPrompt,
          config: { numberOfVideos: 1, resolution: currentRes as any, aspectRatio: aspectRatio }
        };
        if (startingFrame) {
          generationConfig.image = { imageBytes: startingFrame.split(',')[1], mimeType: 'image/png' };
        }
        operation = await ai.models.generateVideos(generationConfig);
      } else {
        // LipSync Simulation through specific Prompt engineering for Veo
        const lipSyncPrompt = `High fidelity neural lip sync. The character in the video speaks the following clearly: "${syncAudioText}". Ensure perfect mouth movement match, expressive facial acting, and professional studio lighting. Mode: ${syncMode}.`;
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: lipSyncPrompt,
          image: { imageBytes: syncVideo?.split(',')[1] || '', mimeType: 'image/png' },
          config: { numberOfVideos: 1, resolution: currentRes as any, aspectRatio: aspectRatio }
        });
      }

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
      setTimeline(prev => prev.map(c => c.status === 'rendering' ? { ...c, status: 'failed' } : c));
    } finally {
      setIsGenerating(false);
    }
  };

  const upscaleActiveClip = async () => {
    if (!activeClip || activeClip.status !== 'ready') return;
    handleGenerateVideo(true, activeClip.id);
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
              <div className="flex items-center space-x-2">
                 <button onClick={() => setActiveStudioTab('scene')} className={`text-[8px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded ${activeStudioTab === 'scene' ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Scene Engine</button>
                 <button onClick={() => setActiveStudioTab('lipsync')} className={`text-[8px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded ${activeStudioTab === 'lipsync' ? 'bg-rose-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}>LipSync Studio</button>
              </div>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex items-center space-x-6">
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Global Aspect</span>
                <div className="flex bg-slate-900 rounded-lg p-0.5 mt-1 border border-white/5">
                   <button onClick={() => setAspectRatio('16:9')} className={`px-2 py-1 text-[8px] font-bold rounded-md transition-all ${aspectRatio === '16:9' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>16:9</button>
                   <button onClick={() => setAspectRatio('9:16')} className={`px-2 py-1 text-[8px] font-bold rounded-md transition-all ${aspectRatio === '9:16' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>9:16</button>
                </div>
             </div>
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Default Res</span>
                <div className="flex bg-slate-900 rounded-lg p-0.5 mt-1 border border-white/5">
                   <button onClick={() => setResolution('720p')} className={`px-2 py-1 text-[8px] font-bold rounded-md transition-all ${resolution === '720p' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>720p</button>
                   <button onClick={() => setResolution('1080p')} className={`px-2 py-1 text-[8px] font-bold rounded-md transition-all ${resolution === '1080p' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>1080p</button>
                </div>
             </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsPublishModalOpen(true)} className="px-5 py-2 bg-slate-900 border border-white/10 hover:bg-slate-800 transition-all text-[10px] font-black uppercase tracking-widest rounded-xl">Post to Blog</button>
          <button 
            onClick={() => handleGenerateVideo()} 
            disabled={isGenerating} 
            className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-30 flex items-center space-x-2"
          >
            {isGenerating ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>Start Neural Render</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* AI Tools Sidebar */}
        <div className="w-80 bg-black/40 border-r border-white/5 p-6 space-y-8 overflow-y-auto shrink-0 scrollbar-hide">
          {activeStudioTab === 'scene' ? (
            <>
              <section className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between">
                    <span>1. Visual Reference</span>
                    {startingFrame && <button onClick={() => setStartingFrame(null)} className="text-rose-500 hover:text-rose-400">Clear</button>}
                 </h3>
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className={`aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group ${startingFrame ? 'border-indigo-500/50' : 'border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5'}`}
                 >
                    {startingFrame ? (
                      <img src={startingFrame} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <>
                        <span className="text-2xl mb-2">🖼️</span>
                        <span className="text-[8px] font-black uppercase text-slate-500">Starting Frame (Optional)</span>
                      </>
                    )}
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </section>

              <section className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between">
                    <span>2. Script Narrative</span>
                    <button 
                       onClick={extractDetailedPrompt} 
                       disabled={isExtracting}
                       className="text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-20 flex items-center"
                    >
                      {isExtracting ? (
                        <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                      ) : '✨'} 
                      <span>{startingFrame ? 'Extract from Frame' : 'Extract Prompt'}</span>
                    </button>
                 </h3>
                 <textarea 
                   value={script} 
                   onChange={(e) => setScript(e.target.value)} 
                   className="w-full h-32 p-5 text-xs bg-slate-900/80 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none font-medium text-slate-300 shadow-inner leading-relaxed" 
                   placeholder="Describe your scene in detail..."
                 />
              </section>

              <section className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">3. AI Motion Control</h3>
                 <div className="grid grid-cols-2 gap-2">
                    {MOTION_PRESETS.map(m => (
                      <button 
                        key={m.id}
                        onClick={() => setActiveMotion(m.id)}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center space-y-1 group ${activeMotion === m.id ? 'bg-indigo-600 border-indigo-400 shadow-lg' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                      >
                         <span className="text-lg group-hover:scale-110 transition-transform">{m.icon}</span>
                         <span className="text-[8px] font-black uppercase tracking-tight text-center">{m.label}</span>
                      </button>
                    ))}
                 </div>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between">
                    <span>1. Identity Reference</span>
                    {syncVideo && <button onClick={() => setSyncVideo(null)} className="text-rose-500 hover:text-rose-400">Clear</button>}
                 </h3>
                 <div 
                   onClick={() => syncVideoInputRef.current?.click()}
                   className={`aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group ${syncVideo ? 'border-rose-500/50' : 'border-white/10 hover:border-rose-500/30 hover:bg-rose-500/5'}`}
                 >
                    {syncVideo ? (
                      <img src={syncVideo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <>
                        <span className="text-2xl mb-2">👤</span>
                        <span className="text-[8px] font-black uppercase text-slate-500">Video Source / Headshot</span>
                      </>
                    )}
                 </div>
                 <input type="file" ref={syncVideoInputRef} className="hidden" accept="image/*,video/*" onChange={handleSyncVideoUpload} />
              </section>

              <section className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between">
                    <span>2. Speech Script</span>
                 </h3>
                 <textarea 
                   value={syncAudioText} 
                   onChange={(e) => setSyncAudioText(e.target.value)} 
                   className="w-full h-32 p-5 text-xs bg-slate-900/80 border border-white/10 rounded-2xl focus:ring-2 focus:ring-rose-500/50 outline-none resize-none font-medium text-slate-300 shadow-inner leading-relaxed" 
                   placeholder="Enter the speech content for the lip sync..."
                 />
              </section>

              <section className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">3. Sync Protocol</h3>
                 <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'avatar', label: 'Cartoon Avatar', desc: 'Synthesized stylized sync' },
                      { id: 'clone', label: 'Neural Clone', desc: 'High-fidelity realistic sync' },
                      { id: 'satire', label: 'Deepfake Satire', desc: 'Exaggerated emotive sync' },
                    ].map(mode => (
                      <button 
                        key={mode.id}
                        onClick={() => setSyncMode(mode.id as any)}
                        className={`p-4 rounded-xl border transition-all text-left group ${syncMode === mode.id ? 'bg-rose-600 border-rose-400 shadow-lg' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                      >
                         <h5 className="text-[10px] font-black uppercase tracking-tight">{mode.label}</h5>
                         <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">{mode.desc}</p>
                      </button>
                    ))}
                 </div>
              </section>
            </>
          )}
        </div>

        {/* Studio Viewport */}
        <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center relative pattern-grid-dark">
          <div className="absolute top-8 left-8 flex items-center space-x-4 z-10">
             <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full">
                <div className={`w-2 h-2 rounded-full animate-pulse ${activeStudioTab === 'scene' ? 'bg-indigo-500' : 'bg-rose-500'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Studio Monitor</span>
             </div>
          </div>

          <div className={`w-full max-w-4xl transition-all duration-700 ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] h-[70%]'} bg-black rounded-[2.5rem] overflow-hidden shadow-[0_80px_160px_rgba(0,0,0,0.9)] relative flex items-center justify-center group border-[8px] border-slate-950`}>
            {isGenerating ? (
              <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="relative w-20 h-20 mx-auto">
                   <div className={`absolute inset-0 border-4 rounded-full opacity-20 ${activeStudioTab === 'scene' ? 'border-indigo-500' : 'border-rose-500'}`}></div>
                   <div className={`absolute inset-0 border-4 border-t-transparent rounded-full animate-spin ${activeStudioTab === 'scene' ? 'border-indigo-500' : 'border-rose-500'}`}></div>
                </div>
                <div className="space-y-1">
                   <p className="text-xl font-black tracking-tight">{REASSURING_MESSAGES[loadingMessageIdx]}</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Allocating Neural Buffers...</p>
                </div>
              </div>
            ) : activeClip?.url ? (
              <>
                <video src={activeClip.url} className="w-full h-full object-cover" controls autoPlay loop />
                <div className="absolute top-6 right-6 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all">
                   <button 
                     onClick={upscaleActiveClip} 
                     disabled={activeClip.resolution === '1080p'}
                     className={`px-4 py-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeClip.resolution === '1080p' ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-indigo-600'}`}
                   >
                     {activeClip.resolution === '1080p' ? 'Maximum Fidelity' : 'Neural Upscale (1080p)'}
                   </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <div className="text-8xl">{activeStudioTab === 'scene' ? '🎞️' : '👄'}</div>
                <p className="text-xl font-black uppercase tracking-widest">Neural Canvas Ready</p>
              </div>
            )}
          </div>

          {/* Timeline Editor Area */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-black/80 backdrop-blur-3xl border-t border-white/5 p-6 flex flex-col space-y-4">
             <div className="flex justify-between items-center px-2">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Production Timeline // Sequence Editor</h4>
                <div className="flex items-center space-x-4">
                   <span className="text-[10px] font-bold text-slate-600 uppercase">{timeline.length} Clips // Total Length: {timeline.length * 6}s</span>
                   <button className="text-[10px] font-black text-indigo-500 uppercase hover:underline" onClick={() => setTimeline([])}>Clear Story</button>
                </div>
             </div>
             
             <div className="flex-1 flex space-x-4 overflow-x-auto pb-2 scrollbar-hide px-2">
                {timeline.map((clip, idx) => (
                  <div 
                    key={clip.id} 
                    onClick={() => setActiveClipId(clip.id)}
                    className={`relative flex-shrink-0 w-60 h-full rounded-2xl border-2 transition-all cursor-pointer overflow-hidden group/clip ${activeClipId === clip.id ? 'border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)]' : 'border-white/5 hover:border-white/20'}`}
                  >
                     {clip.status === 'rendering' ? (
                       <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center space-y-2">
                          <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${clip.type === 'scene' ? 'border-indigo-500' : 'border-rose-500'}`}></div>
                          <span className={`text-[8px] font-black uppercase ${clip.type === 'scene' ? 'text-indigo-400' : 'text-rose-400'}`}>Synthesizing...</span>
                       </div>
                     ) : clip.status === 'failed' ? (
                       <div className="w-full h-full bg-rose-950/20 flex flex-col items-center justify-center space-y-2">
                          <span className="text-xl">⚠️</span>
                          <span className="text-[8px] font-black text-rose-500 uppercase">Render Failed</span>
                       </div>
                     ) : (
                       <>
                         <video src={clip.url} className="w-full h-full object-cover opacity-60 group-hover/clip:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                         <div className="absolute top-2 left-2 flex space-x-1">
                            <span className="bg-black/60 px-2 py-0.5 rounded text-[7px] font-black text-indigo-400">{clip.resolution}</span>
                            <span className="bg-black/60 px-2 py-0.5 rounded text-[7px] font-black text-slate-400">{clip.motionId}</span>
                            <span className={`bg-black/60 px-2 py-0.5 rounded text-[7px] font-black ${clip.type === 'scene' ? 'text-blue-400' : 'text-rose-400'}`}>{clip.type.toUpperCase()}</span>
                         </div>
                         <div className="absolute bottom-2 left-3 flex items-center justify-between right-3">
                            <span className="text-[8px] font-black text-white/60">SCENE 0{idx + 1}</span>
                            <span className="text-[8px] font-black text-white/60">6s</span>
                         </div>
                       </>
                     )}
                     <button 
                      onClick={(e) => { e.stopPropagation(); setTimeline(prev => prev.filter(c => c.id !== clip.id)); if (activeClipId === clip.id) setActiveClipId(null); }} 
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-lg flex items-center justify-center text-[10px] opacity-0 group-hover/clip:opacity-100 transition-all hover:bg-rose-600"
                     >✕</button>
                  </div>
                ))}
                
                <button 
                  onClick={() => { setScript(''); setStartingFrame(null); setSyncVideo(null); setSyncAudioText(''); }}
                  className="flex-shrink-0 w-60 h-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center space-y-2 text-slate-600 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                >
                   <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all">
                      <span className="text-xl">+</span>
                   </div>
                   <span className="text-[8px] font-black uppercase tracking-widest">Append Sequence</span>
                </button>
             </div>
          </div>
        </div>
      </div>

      {isPublishModalOpen && (
        <BlogPublishModal 
          initialTitle="Cinematic Masterpiece"
          initialDescription={`Professional neural production containing ${timeline.length} scenes. Rendered in high-fidelity.`}
          onClose={() => setIsPublishModalOpen(false)}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
};

export default VideoMaker;
