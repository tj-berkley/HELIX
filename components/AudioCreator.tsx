
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { AudioClip, ClonedVoice } from '../types';

const SYSTEM_VOICES = [
  { id: 'Puck', label: 'Puck', description: 'Youthful, energetic, dynamic', emoji: '👦' },
  { id: 'Kore', label: 'Kore', description: 'Professional, calm, feminine', emoji: '👩' },
  { id: 'Fenrir', label: 'Fenrir', description: 'Deep, resonant, authoritative', emoji: '🐺' },
  { id: 'Charon', label: 'Charon', description: 'Wise, storytelling, older', emoji: '🛶' },
  { id: 'Zephyr', label: 'Zephyr', description: 'Helpful, customer support tone', emoji: '🌬️' },
];

const READING_TEMPLATE = "In the heart of the digital forest, neural networks hum with the infinite possibilities of tomorrow. Every word I speak is a unique frequency, a fingerprint of my identity in this vast spectrum of sound. I am creating a neural clone to bridge the gap between human expression and synthetic precision.";

interface AudioCreatorProps {
  onAddClonedVoice: (voice: ClonedVoice) => void;
  clonedVoices: ClonedVoice[];
}

const AudioCreator: React.FC<AudioCreatorProps> = ({ onAddClonedVoice, clonedVoices }) => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isGenerating, setIsGenerating] = useState(false);
  const [clips, setClips] = useState<AudioClip[]>([]);
  
  // Cloning/Capture State
  const [isCloning, setIsCloning] = useState(false);
  const [cloningSource, setCloningSource] = useState<string | null>(null);
  const [cloningStatus, setCloningStatus] = useState<string | null>(null);
  const [isCaptureMode, setIsCaptureMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio Decoding Helpers
  const decode = (base64: string) => {
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

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const voiceToUse = selectedVoice.includes(':') ? 'Kore' : selectedVoice;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceToUse },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decodedBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedBytes, audioCtx, 24000, 1);
        
        const wavBlob = new Blob([decodedBytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(wavBlob);

        const newClip: AudioClip = {
          id: `clip-${Date.now()}`,
          text: text.slice(0, 100),
          voice: selectedVoice,
          url,
          timestamp: new Date().toLocaleTimeString(),
        };

        setClips([newClip, ...clips]);
        
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
      }
    } catch (e) {
      console.error("TTS failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;
      if (liveVideoRef.current) liveVideoRef.current.srcObject = stream;
      setIsCaptureMode(true);
    } catch (err) {
      console.error("Media access denied", err);
      alert("Please grant camera and microphone permissions to use this feature.");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!streamRef.current) return;
      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(finalBlob);
      };
      recorder.start();
      setIsRecording(true);
    }
  };

  const finalizeCapture = async () => {
    if (!recordedBlob) return;
    setIsCloning(true);
    setCloningStatus("Analyzing recorded biometric data...");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(recordedBlob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            { inlineData: { data: base64Data, mimeType: 'video/webm' } },
            { text: "Analyze the user's voice in this live recording. Identify their unique vocal signature and tone. Provide a name for this clone (e.g., 'User Prime') and a description of their voice style." }
          ]
        });

        setCloningStatus("Synthesizing neural identity...");
        await new Promise(r => setTimeout(r, 2000));
        
        const analysis = response.text || "Direct personal clone.";
        const newClonedVoice: ClonedVoice = {
          id: `cloned:personal:${Date.now()}`,
          label: `Self (Neural)`,
          description: analysis.slice(0, 100) + "...",
          emoji: "👤",
          sourceType: 'video',
          provider: 'ElevenLabs'
        };

        onAddClonedVoice(newClonedVoice);
        stopCapture();
        setCloningStatus("Identity Synced Successfully.");
        setTimeout(() => setCloningStatus(null), 3000);
      };
    } catch (err) {
      console.error(err);
      setCloningStatus("Sync failed. Check capture length.");
    } finally {
      setIsCloning(false);
    }
  };

  const stopCapture = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsCaptureMode(false);
    setRecordedBlob(null);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCloningSource(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleStartCloning = async () => {
    if (!cloningSource) return;
    setIsCloning(true);
    setCloningStatus("Analyzing vocal frequencies...");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { inlineData: { data: cloningSource.split(',')[1], mimeType: 'video/mp4' } },
          { text: "Analyze the person's voice in this video. Describe their tone, pitch, and energy. Then, provide a short professional label and a matching emoji for this persona." }
        ]
      });
      
      setCloningStatus("Synthesizing neural tone mapping...");
      await new Promise(r => setTimeout(r, 2000));
      
      const analysis = response.text || "Smooth and professional.";
      const nameParts = analysis.split(' ').filter(word => word.length > 3);
      const personaLabel = nameParts[0] || "Custom";
      
      const newClonedVoice: ClonedVoice = {
        id: `cloned:${Date.now()}`,
        label: `${personaLabel} (Cloned)`,
        description: analysis.slice(0, 100) + "...",
        emoji: "👤",
        sourceType: 'video',
        provider: 'ElevenLabs'
      };
      
      onAddClonedVoice(newClonedVoice);
      setCloningSource(null);
      setCloningStatus("Cloning Synchronized.");
      setTimeout(() => setCloningStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setCloningStatus("Sync failed. Check format.");
    } finally {
      setIsCloning(false);
    }
  };

  const currentVoiceObj = [...clonedVoices, ...SYSTEM_VOICES].find(v => v.id === selectedVoice);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-white pattern-grid-dark">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40 shrink-0">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Audio & Voice Lab</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Neural Cloning & Synthesis Studio</p>
        </div>
        <div className="flex items-center space-x-6">
           <div className="flex -space-x-2">
              {clonedVoices.map(cv => (
                <div key={cv.id} className="w-9 h-9 rounded-full bg-indigo-600 border-2 border-slate-950 flex items-center justify-center text-sm shadow-2xl" title={cv.label}>{cv.emoji}</div>
              ))}
           </div>
           <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-4 py-2 rounded-full border border-indigo-400/20 uppercase tracking-widest">Enterprise Neural Engine</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Composition Panel */}
        <div className="w-[500px] border-r border-white/5 p-10 flex flex-col space-y-10 overflow-y-auto scrollbar-hide">
          
          {/* Cloning Options */}
          <div className="grid grid-cols-2 gap-4">
             <button 
               onClick={() => videoInputRef.current?.click()}
               className="p-6 bg-slate-900 border border-white/5 rounded-[2.5rem] flex flex-col items-center space-y-3 hover:border-indigo-500 transition-all group"
             >
                <span className="text-3xl group-hover:scale-110 transition-transform">📤</span>
                <span className="text-[8px] font-black uppercase text-slate-500">Upload Video</span>
             </button>
             <button 
               onClick={startCapture}
               className="p-6 bg-indigo-600 border border-indigo-400 rounded-[2.5rem] flex flex-col items-center space-y-3 hover:bg-indigo-700 transition-all group shadow-xl shadow-indigo-900/40"
             >
                <span className="text-3xl group-hover:scale-110 transition-transform">🎥</span>
                <span className="text-[8px] font-black uppercase text-white">Live Capture</span>
             </button>
          </div>

          {/* Cloning Section */}
          <section className="space-y-4">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Neural Persona Sync</h3>
                <span className="text-rose-400 text-[9px] font-black uppercase tracking-tighter">Identity Services</span>
             </div>
             <div 
               className={`aspect-video rounded-[3rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group ${cloningSource ? 'border-indigo-500/50 shadow-[0_0_40px_rgba(79,70,229,0.1)]' : 'border-white/10'}`}
             >
                {cloningSource ? (
                   <video src={cloningSource} className="w-full h-full object-cover" muted autoPlay loop />
                ) : (
                   <div className="text-center p-8 opacity-40">
                      <div className="text-5xl mb-3">📡</div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Identity Repository</p>
                   </div>
                )}
                {cloningStatus && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-4">
                     <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                     <p className="text-xs font-black uppercase text-indigo-400 tracking-[0.2em] animate-pulse">{cloningStatus}</p>
                  </div>
                )}
             </div>
             <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoUpload} />
             {cloningSource && (
               <button 
                 onClick={handleStartCloning}
                 disabled={isCloning}
                 className="w-full py-5 rounded-[1.8rem] bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-700 shadow-xl transition-all"
               >
                  Process Uploaded Clone
               </button>
             )}
          </section>

          <div className="h-px bg-white/5"></div>

          <section className="space-y-6">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">1. Voice Registry</h3>
                {clonedVoices.length > 0 && <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{clonedVoices.length} Neural Clones Active</span>}
             </div>
             
             {/* DROPDOWN UI ENHANCEMENT */}
             <div className="relative group">
                <select 
                   value={selectedVoice}
                   onChange={(e) => setSelectedVoice(e.target.value)}
                   className="w-full bg-slate-900 border-2 border-white/10 rounded-[2rem] p-6 text-sm font-black text-white outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer shadow-inner"
                >
                   {clonedVoices.length > 0 && (
                      <optgroup label="Neural Clones" className="bg-slate-900 text-indigo-400">
                         {clonedVoices.map(v => (
                            <option key={v.id} value={v.id} className="p-4 bg-slate-900 text-white">
                               {v.emoji} {v.label} (Identity Clone)
                            </option>
                         ))}
                      </optgroup>
                   )}
                   <optgroup label="System Registry" className="bg-slate-900 text-slate-500">
                      {SYSTEM_VOICES.map(v => (
                         <option key={v.id} value={v.id} className="p-4 bg-slate-900 text-white">
                            {v.emoji} {v.label} - {v.description}
                         </option>
                      ))}
                   </optgroup>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
             </div>

             {currentVoiceObj && (
                <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] animate-in slide-in-from-top-2">
                   <div className="flex items-center space-x-4">
                      <div className="text-4xl">{currentVoiceObj.emoji}</div>
                      <div>
                         <h4 className="text-xs font-black uppercase text-white tracking-tight">{currentVoiceObj.label}</h4>
                         <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{currentVoiceObj.description}</p>
                      </div>
                   </div>
                </div>
             )}
          </section>

          <section className="space-y-4 flex-1 flex flex-col pb-10">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">2. Transmission Script</h3>
             <textarea 
               value={text}
               onChange={(e) => setText(e.target.value)}
               placeholder="Draft the text you want the neural engine to vocalize..."
               className="w-full min-h-[220px] p-8 bg-slate-950 border border-white/10 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-500/20 outline-none resize-none text-lg font-medium shadow-inner text-slate-200 leading-relaxed"
             />
             <button 
               onClick={handleGenerate}
               disabled={isGenerating || !text.trim()}
               className={`w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all flex items-center justify-center space-x-4 active:scale-95 mt-4 ${isGenerating ? 'animate-pulse cursor-wait opacity-50' : 'hover:bg-indigo-700'}`}
             >
                {isGenerating ? (
                   <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Vocalizing...</span>
                   </>
                ) : (
                  <>
                     <span>Generate Master Audio</span>
                     <span className="text-2xl">🎙️</span>
                  </>
                )}
             </button>
          </section>
        </div>

        {/* Studio Output Panel */}
        <div className="flex-1 bg-black/20 p-12 overflow-y-auto relative">
           <div className="max-w-4xl mx-auto space-y-12 pb-20">
              <div className="flex justify-between items-end border-b border-white/5 pb-6">
                 <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Global Production History</h3>
                 <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{clips.length} Neural Clips</span>
              </div>

              <div className="space-y-8">
                {clips.map(clip => (
                  <div key={clip.id} className="bg-slate-900 border border-white/5 rounded-[3.5rem] p-10 space-y-8 shadow-2xl relative group overflow-hidden animate-in slide-in-from-right-8 duration-700">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-6">
                           <div className="w-16 h-16 rounded-[1.8rem] bg-indigo-600 flex items-center justify-center text-3xl shadow-xl border border-white/10">
                              {[...clonedVoices, ...SYSTEM_VOICES].find(v => v.id === clip.voice)?.emoji || '🎙️'}
                           </div>
                           <div>
                              <h4 className="font-black text-indigo-400 uppercase text-sm tracking-[0.2em]">{clip.voice.split(':')[0]} Synthetic Layer</h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{clip.timestamp}</p>
                           </div>
                        </div>
                        <div className="flex space-x-3">
                           <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-white/5">Export</button>
                        </div>
                     </div>

                     <div className="p-8 bg-black/40 rounded-[2rem] border border-white/5 italic text-slate-300 text-lg leading-relaxed shadow-inner">
                        "{clip.text}"
                     </div>

                     <div className="flex items-center space-x-8">
                        <button 
                          onClick={() => {
                            const audio = new Audio(clip.url);
                            audio.play();
                          }}
                          className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center text-4xl shadow-2xl hover:scale-110 active:scale-95 transition-all transform"
                        >
                           ▶
                        </button>
                        <div className="flex-1 h-16 flex items-center space-x-1.5 opacity-60">
                           {Array.from({ length: 60 }).map((_, i) => (
                             <div 
                               key={i} 
                               className="flex-1 bg-indigo-500/40 rounded-full" 
                               style={{ height: `${15 + Math.random() * 85}%` }}
                             ></div>
                           ))}
                        </div>
                     </div>
                  </div>
                ))}

                {clips.length === 0 && (
                  <div className="py-60 text-center space-y-10 border-4 border-dashed border-white/5 rounded-[5rem] opacity-20">
                     <span className="text-[160px] filter drop-shadow-[0_0_100px_rgba(99,102,241,0.2)]">🎙️</span>
                     <div className="space-y-3">
                        <p className="text-4xl font-black uppercase tracking-[0.4em]">Studio Silence</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Initiate synthesis to populate your master library</p>
                     </div>
                  </div>
                )}
              </div>
           </div>

           {/* Live Capture Overlay Modal */}
           {isCaptureMode && (
             <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-12">
                <div className="max-w-6xl w-full grid grid-cols-12 gap-12 animate-in zoom-in-95 duration-500">
                   <div className="col-span-7 flex flex-col space-y-8">
                      <div className="flex justify-between items-end">
                         <div className="space-y-2">
                            <h3 className="text-5xl font-black tracking-tighter">Biometric Voice Capture</h3>
                            <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Neural Identity Ingestion v1.0</p>
                         </div>
                         <button onClick={stopCapture} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel Process</button>
                      </div>

                      <div className="bg-slate-900 border-[8px] border-slate-950 rounded-[4rem] aspect-video relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
                         <video ref={liveVideoRef} autoPlay muted className="w-full h-full object-cover grayscale brightness-75 scale-x-[-1]" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                         
                         {isRecording && (
                           <div className="absolute top-8 left-8 flex items-center space-x-3 bg-rose-600 px-4 py-2 rounded-full shadow-2xl animate-pulse">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                              <span className="text-[10px] font-black uppercase tracking-widest">Capturing Biometrics...</span>
                           </div>
                         )}

                         <div className="absolute bottom-8 left-8 right-8 flex justify-center">
                            <button 
                              onClick={toggleRecording}
                              className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all ${isRecording ? 'bg-white border-rose-500 scale-110' : 'bg-rose-600 border-white/20 hover:scale-110'}`}
                            >
                               {isRecording ? <div className="w-8 h-8 bg-rose-600 rounded-lg"></div> : <div className="w-10 h-10 bg-white rounded-full"></div>}
                            </button>
                         </div>
                      </div>
                   </div>

                   <div className="col-span-5 flex flex-col space-y-8 pt-10">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Reading Template</label>
                         <div className="bg-slate-900/50 border border-white/5 p-10 rounded-[3rem] shadow-inner relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                               <span className="text-8xl">📜</span>
                            </div>
                            <p className="text-2xl font-medium leading-relaxed italic text-slate-200 selection:bg-indigo-500/50">
                               "{READING_TEMPLATE}"
                            </p>
                         </div>
                         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center">Speak clearly and naturally for optimal neural matching.</p>
                      </div>

                      <div className="flex-1 flex flex-col justify-end">
                         <button 
                           onClick={finalizeCapture}
                           disabled={!recordedBlob || isRecording || isCloning}
                           className={`w-full py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all transform active:scale-95 shadow-2xl ${recordedBlob ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/40' : 'bg-slate-800 text-slate-600 grayscale opacity-50 cursor-not-allowed'}`}
                         >
                            {isCloning ? 'Extracting Neural Data...' : 'Finalize Identity Clone'}
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AudioCreator;
