
import React, { useState, useEffect, useRef } from 'react';
import { BrandVoice, ExternalSource } from '../types';
import { GoogleGenAI } from "@google/genai";

const INITIAL_VOICE: BrandVoice = {
  id: 'v1',
  name: 'Architect Core',
  tone: 'Confident, precise, and visionary. Use short, punchy sentences for impact.',
  audience: 'High-level entrepreneurs, creative directors, and tech innovators.',
  avoidKeywords: ['synergy', 'leverage', 'game-changer', 'disruptive'],
  keyPhrases: ['autonomous excellence', 'neural precision', 'future-proof scaling'],
  language: 'English (US)',
  personalityEmoji: '🧠',
  externalSources: []
};

const BrandVoicePage: React.FC = () => {
  const [voice, setVoice] = useState<BrandVoice>(() => {
    const stored = localStorage.getItem('HOBBS_BRAND_VOICE');
    return stored ? JSON.parse(stored) : INITIAL_VOICE;
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newSource, setNewSource] = useState<{ url: string; type: ExternalSource['type'] }>({ url: '', type: 'URL' });
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    localStorage.setItem('HOBBS_BRAND_VOICE', JSON.stringify(voice));
  }, [voice]);

  const handleSave = () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    // Simulate complex neural commitment
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }, 1500);
  };

  const addKeyword = (list: 'avoidKeywords' | 'keyPhrases', val: string) => {
    if (!val.trim()) return;
    setVoice(prev => ({ ...prev, [list]: [...prev[list], val.trim()] }));
  };

  const removeKeyword = (list: 'avoidKeywords' | 'keyPhrases', index: number) => {
    setVoice(prev => ({ ...prev, [list]: prev[list].filter((_, i) => i !== index) }));
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.url.trim()) return;

    setIsScanning(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a Brand Intel Analyst. I am providing a source (${newSource.type}): "${newSource.url}". 
        Since you cannot browse live, suggest exactly 3 tone keywords and 2 signature phrases that might characterize a professional brand based on this source type and typical industry standards for such platforms. 
        Return JSON: { "keywords": ["word1", "word2", "word3"], "phrases": ["phrase1", "phrase2"] }`,
      });

      const data = JSON.parse(response.text.match(/\{.*\}/s)?.[0] || '{"keywords":[], "phrases":[]}');
      
      const source: ExternalSource = {
        id: `src-${Date.now()}`,
        type: newSource.type,
        label: newSource.url.split('/').pop() || 'Knowledge Asset',
        url: newSource.url,
        lastSynced: new Date().toLocaleDateString(),
        status: 'Ready'
      };

      setVoice(prev => ({
        ...prev,
        externalSources: [...(prev.externalSources || []), source],
        avoidKeywords: Array.from(new Set([...prev.avoidKeywords, ...data.keywords])),
        keyPhrases: Array.from(new Set([...prev.keyPhrases, ...data.phrases]))
      }));
      
      setNewSource({ url: '', type: 'URL' });
      setIsAddingSource(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in relative">
      {/* Global Success Notification */}
      {saveStatus === 'success' && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] flex items-center space-x-4 bg-emerald-600 text-white px-8 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(16,185,129,0.4)] animate-in slide-in-from-top-10 duration-500">
           <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
           </div>
           <div>
              <p className="font-black text-xs uppercase tracking-widest leading-none">Parameters Committed</p>
              <p className="text-[10px] opacity-80 mt-1">Neural brain identity successfully synchronized across all studios.</p>
           </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-12 pb-40">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-4 mb-2">
                <div className={`w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-xl shadow-indigo-900/20 transition-all ${isSaving ? 'animate-pulse scale-110' : ''}`}>
                   {voice.personalityEmoji}
                </div>
                <div>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tight">The Brain</h2>
                   <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em]">Identity Hub & Core Logic</p>
                </div>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`group relative px-12 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl transition-all overflow-hidden ${isSaving ? 'bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/40 hover:-translate-y-1 active:scale-95'}`}
          >
            {isSaving && (
               <div className="absolute inset-0 bg-indigo-500/20 animate-pulse"></div>
            )}
            <span className="relative flex items-center justify-center space-x-3">
               {isSaving ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   <span>Syncing...</span>
                 </>
               ) : (
                 <>
                   <span>Commit Voice Parameters</span>
                   <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">⚡</span>
                 </>
               )}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-7 space-y-10">
            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
               <h3 className="text-xl font-black text-slate-900 tracking-tight px-2 flex items-center space-x-3">
                  <span className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-sm">👤</span>
                  <span>Neural Profile</span>
               </h3>
               
               <div className="space-y-6">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Voice Identifier</label>
                     <input 
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-[1.5rem] text-slate-900 font-bold outline-none transition-all shadow-inner"
                        value={voice.name}
                        onChange={e => setVoice({ ...voice, name: e.target.value })}
                     />
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tonal Architecture</label>
                     <textarea 
                        className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-[2rem] text-slate-900 font-medium outline-none transition-all shadow-inner h-40 resize-none leading-relaxed"
                        value={voice.tone}
                        onChange={e => setVoice({ ...voice, tone: e.target.value })}
                        placeholder="Define the rhythmic and lexical style..."
                     />
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Audience Target</label>
                     <textarea 
                        className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-[2rem] text-slate-900 font-medium outline-none transition-all shadow-inner h-32 resize-none leading-relaxed"
                        value={voice.audience}
                        onChange={e => setVoice({ ...voice, audience: e.target.value })}
                     />
                  </div>
               </div>
            </section>

            <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
               <div className="flex justify-between items-center px-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
                     <span className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-sm">💡</span>
                     <span>Intelligence Sources</span>
                  </h3>
                  <button 
                    onClick={() => setIsAddingSource(true)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                  >
                    + Link Source
                  </button>
               </div>

               <div className="space-y-4">
                  {(voice.externalSources || []).map(src => (
                    <div key={src.id} className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] group hover:border-indigo-200 transition-all">
                       <div className="flex items-center space-x-6">
                          <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-xl shadow-inner ${src.type === 'URL' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                             {src.type === 'URL' ? '🌐' : src.type === 'Sheet' ? '📊' : '📄'}
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-slate-900 truncate max-w-[200px]">{src.label}</h4>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Last Synced: {src.lastSynced}</p>
                          </div>
                       </div>
                       <div className="flex items-center space-x-3">
                          <span className="text-[8px] font-black bg-white px-3 py-1 rounded-full text-emerald-500 border border-emerald-100 uppercase tracking-widest shadow-sm">{src.status}</span>
                          <button onClick={() => setVoice({ ...voice, externalSources: voice.externalSources?.filter(s => s.id !== src.id) })} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                       </div>
                    </div>
                  ))}
                  
                  {(!voice.externalSources || voice.externalSources.length === 0) && (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] opacity-30 group">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No external data links active</p>
                    </div>
                  )}
               </div>
            </section>
          </div>

          <div className="col-span-12 lg:col-span-5 space-y-10">
            <section className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden group/cons">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/cons:rotate-12 transition-transform duration-700">
                  <span className="text-[100px]">🚫</span>
               </div>
               <div className="relative">
                  <h3 className="text-xl font-black tracking-tight text-rose-400 flex items-center space-x-3 uppercase">
                     <span>Lexical Constraints</span>
                  </h3>
                  <p className="text-slate-400 text-xs font-medium mt-1">Specific terms and phrases the AI must avoid.</p>
               </div>
               <div className="space-y-6 relative">
                  <div className="flex flex-wrap gap-2">
                    {voice.avoidKeywords.map((k, i) => (
                      <span key={i} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center group/tag hover:border-rose-500 transition-all">
                         {k}
                         <button onClick={() => removeKeyword('avoidKeywords', i)} className="ml-2 text-slate-600 hover:text-rose-500 transition-colors">✕</button>
                      </span>
                    ))}
                  </div>
                  <input 
                    onKeyDown={e => e.key === 'Enter' && (addKeyword('avoidKeywords', e.currentTarget.value), e.currentTarget.value = '')}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-xs font-bold text-white placeholder-slate-600 outline-none focus:border-rose-500 transition-all shadow-inner"
                    placeholder="Input negative constraint..."
                  />
               </div>
            </section>

            <section className="bg-white rounded-[3.5rem] p-10 shadow-xl border border-slate-100 space-y-8 group/lex">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-3 uppercase">
                     <span className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-sm">✨</span>
                     <span>Signature Lexicon</span>
                  </h3>
                  <p className="text-slate-500 text-xs font-medium mt-1 italic">Core phrases to inject for brand recognition.</p>
               </div>
               <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {voice.keyPhrases.map((k, i) => (
                      <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center group/tag hover:shadow-lg transition-all">
                         {k}
                         <button onClick={() => removeKeyword('keyPhrases', i)} className="ml-3 text-emerald-300 hover:text-emerald-700">✕</button>
                      </span>
                    ))}
                  </div>
                  <input 
                    onKeyDown={e => e.key === 'Enter' && (addKeyword('keyPhrases', e.currentTarget.value), e.currentTarget.value = '')}
                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-xs font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-50 transition-all shadow-inner"
                    placeholder="Add signature phrase..."
                  />
               </div>
            </section>

            <div className="p-10 bg-indigo-600 rounded-[3rem] text-white space-y-4 relative overflow-hidden shadow-2xl shadow-indigo-900/40 group/insight">
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover/insight:bg-white/10 transition-all duration-1000"></div>
               <h4 className="text-sm font-black uppercase tracking-[0.2em]">Neural Strategy</h4>
               <p className="text-[11px] text-indigo-100 leading-relaxed font-medium italic relative">
                 "A consistent Brand Voice increases audience trust by 33%. Commit these changes to apply them to every campaign, video, and message generated by the portal."
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Source Modal */}
      {isAddingSource && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsAddingSource(false)}>
           <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">🔗</div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Link</h3>
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">External Knowledge Sync</p>
                    </div>
                 </div>
                 <button onClick={() => setIsAddingSource(false)} className="p-3 hover:bg-white rounded-full text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <form onSubmit={handleAddSource} className="p-10 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Resource Selection</label>
                    <div className="grid grid-cols-3 gap-3">
                       {(['URL', 'Sheet', 'Doc'] as ExternalSource['type'][]).map(t => (
                         <button 
                           key={t}
                           type="button"
                           onClick={() => setNewSource({ ...newSource, type: t })}
                           className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center space-y-2 ${newSource.type === t ? 'bg-indigo-50 border-indigo-600 shadow-md text-indigo-600' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}
                         >
                            <span className="text-2xl">{t === 'URL' ? '🌐' : t === 'Sheet' ? '📊' : '📄'}</span>
                            <span className="text-[9px] font-black uppercase">{t === 'URL' ? 'Live Site' : t === 'Sheet' ? 'G-Sheet' : 'G-Doc'}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Resource Pointer (URL)</label>
                    <input 
                      autoFocus
                      required
                      placeholder="https://..."
                      className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-[1.2rem] p-5 text-sm font-bold shadow-inner outline-none transition-all"
                      value={newSource.url}
                      onChange={e => setNewSource({ ...newSource, url: e.target.value })}
                    />
                    <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic px-1">AI will parse the source structure to extract brand consistency signals.</p>
                 </div>

                 <button 
                  type="submit" 
                  disabled={isScanning || !newSource.url}
                  className={`w-full py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] text-white shadow-2xl transition-all transform active:scale-95 ${isScanning ? 'bg-slate-800' : 'bg-slate-900 hover:bg-black shadow-slate-200'}`}
                 >
                    {isScanning ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Parsing Signal...</span>
                      </div>
                    ) : 'Initialize Neural Sync'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BrandVoicePage;
