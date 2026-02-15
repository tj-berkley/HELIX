
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { AudioClip } from '../types';

const VOICES = [
  { id: 'Puck', label: 'Puck', desc: 'Youthful, energetic, dynamic', emoji: '👦' },
  { id: 'Kore', label: 'Kore', desc: 'Professional, calm, feminine', emoji: '👩' },
  { id: 'Fenrir', label: 'Fenrir', desc: 'Deep, resonant, authoritative', emoji: '🐺' },
  { id: 'Charon', label: 'Charon', desc: 'Wise, storytelling, older', emoji: '🛶' },
  { id: 'Zephyr', label: 'Zephyr', desc: 'Helpful, customer support tone', emoji: '🌬️' },
];

const AudioCreator: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isGenerating, setIsGenerating] = useState(false);
  const [clips, setClips] = useState<AudioClip[]>([]);

  // Implement manual decoding for raw PCM audio data as required by instructions
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
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        // Prepare playback
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decodedBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedBytes, audioCtx, 24000, 1);
        
        // Convert to playable blob for UI history
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
        
        // Auto play
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
      }
    } catch (e) {
      console.error("TTS failed", e);
      alert("Failed to generate audio. Check your API configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-white pattern-grid-dark">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40 shrink-0">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Audio & Voice Lab</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">AI Neural Speech Synthesis Studio</p>
        </div>
        <div className="flex space-x-3">
           <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full border border-indigo-400/20">GEMINI TTS v2.5</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Composition Panel */}
        <div className="w-[500px] border-r border-white/5 p-10 flex flex-col space-y-8 overflow-y-auto">
          <section className="space-y-4">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">1. Select Voice Persona</h3>
             <div className="grid grid-cols-1 gap-2">
                {VOICES.map(v => (
                  <button 
                    key={v.id} 
                    onClick={() => setSelectedVoice(v.id)}
                    className={`w-full text-left p-5 rounded-[1.8rem] border transition-all flex items-center space-x-4 ${selectedVoice === v.id ? 'bg-indigo-600 border-indigo-400 shadow-xl' : 'bg-slate-900 border-white/5 hover:border-white/10'}`}
                  >
                    <span className="text-3xl">{v.emoji}</span>
                    <div className="flex-1 min-w-0">
                       <h4 className="font-black text-sm uppercase tracking-tight">{v.label}</h4>
                       <p className="text-[10px] text-slate-400 truncate font-medium">{v.desc}</p>
                    </div>
                    {selectedVoice === v.id && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                  </button>
                ))}
             </div>
          </section>

          <section className="space-y-4 flex-1 flex flex-col">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">2. Manuscript Text</h3>
             <textarea 
               value={text}
               onChange={(e) => setText(e.target.value)}
               placeholder="Enter the text you want the AI to narrate..."
               className="flex-1 w-full p-8 bg-slate-900 border border-white/10 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-500/20 outline-none resize-none text-lg font-medium shadow-inner text-slate-200"
             />
             <button 
               onClick={handleGenerate}
               disabled={isGenerating || !text.trim()}
               className={`w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center space-x-3 active:scale-95 ${isGenerating ? 'animate-pulse cursor-wait opacity-50' : 'hover:bg-indigo-700'}`}
             >
                {isGenerating ? (
                   <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Synthesizing...</span>
                   </>
                ) : (
                  <>
                     <span>Generate AI Audio</span>
                     <span className="text-xl">🎙️</span>
                  </>
                )}
             </button>
          </section>
        </div>

        {/* Studio Output Panel */}
        <div className="flex-1 bg-black/20 p-10 overflow-y-auto">
           <div className="max-w-3xl mx-auto space-y-10">
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                 <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Production History</h3>
                 <span className="text-[10px] font-bold text-slate-600 uppercase">{clips.length} Clips Available</span>
              </div>

              <div className="space-y-6">
                {clips.map(clip => (
                  <div key={clip.id} className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative group overflow-hidden animate-in slide-in-from-right-4">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl shadow-xl">
                              {VOICES.find(v => v.id === clip.voice)?.emoji}
                           </div>
                           <div>
                              <h4 className="font-black text-indigo-400 uppercase text-xs tracking-widest">{clip.voice} Voice Engine</h4>
                              <p className="text-[10px] text-slate-500 font-bold">{clip.timestamp}</p>
                           </div>
                        </div>
                        <div className="flex space-x-2">
                           <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-xs">Download</button>
                           <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-xs">Share</button>
                        </div>
                     </div>

                     <div className="p-6 bg-black/40 rounded-2xl border border-white/5 italic text-slate-300 text-sm leading-relaxed">
                        "{clip.text}"
                     </div>

                     <div className="flex items-center space-x-6">
                        <button 
                          onClick={() => {
                            const audio = new Audio(clip.url);
                            audio.play();
                          }}
                          className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-3xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                        >
                           ▶
                        </button>
                        <div className="flex-1 h-12 flex items-center space-x-1">
                           {Array.from({ length: 40 }).map((_, i) => (
                             <div 
                               key={i} 
                               className="flex-1 bg-indigo-500/20 rounded-full" 
                               style={{ height: `${20 + Math.random() * 80}%` }}
                             ></div>
                           ))}
                        </div>
                     </div>
                  </div>
                ))}

                {clips.length === 0 && (
                  <div className="py-40 text-center space-y-6 border-4 border-dashed border-white/5 rounded-[3rem] opacity-20">
                     <span className="text-8xl">🔊</span>
                     <p className="text-2xl font-black uppercase tracking-widest">No Masters Recorded</p>
                     <p className="text-xs font-bold uppercase tracking-widest">Start generating to build your audio library</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AudioCreator;
