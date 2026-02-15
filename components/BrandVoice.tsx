
import React, { useState, useEffect } from 'react';
import { BrandVoice } from '../types';

const INITIAL_VOICE: BrandVoice = {
  id: 'v1',
  name: 'Architect Core',
  tone: 'Confident, precise, and visionary. Use short, punchy sentences for impact.',
  audience: 'High-level entrepreneurs, creative directors, and tech innovators.',
  avoidKeywords: ['synergy', 'leverage', 'game-changer', 'disruptive'],
  keyPhrases: ['autonomous excellence', 'neural precision', 'future-proof scaling'],
  language: 'English (US)',
  personalityEmoji: '🧠'
};

const BrandVoicePage: React.FC = () => {
  const [voice, setVoice] = useState<BrandVoice>(() => {
    const stored = localStorage.getItem('HOBBS_BRAND_VOICE');
    return stored ? JSON.parse(stored) : INITIAL_VOICE;
  });
  const [saveStatus, setSaveStatus] = useState(false);

  useEffect(() => {
    localStorage.setItem('HOBBS_BRAND_VOICE', JSON.stringify(voice));
  }, [voice]);

  const handleSave = () => {
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const addKeyword = (list: 'avoidKeywords' | 'keyPhrases', val: string) => {
    if (!val.trim()) return;
    setVoice(prev => ({ ...prev, [list]: [...prev[list], val.trim()] }));
  };

  const removeKeyword = (list: 'avoidKeywords' | 'keyPhrases', index: number) => {
    setVoice(prev => ({ ...prev, [list]: prev[list].filter((_, i) => i !== index) }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-4 mb-2">
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-xl shadow-indigo-900/20">
                   {voice.personalityEmoji}
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">The Brain</h2>
            </div>
            <p className="text-slate-500 font-medium text-lg">Define the global personality and constraints for all AI outputs.</p>
          </div>
          <button 
            onClick={handleSave}
            className={`px-10 py-4 rounded-[1.2rem] font-black uppercase text-xs tracking-widest shadow-2xl transition-all ${saveStatus ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/40'}`}
          >
            {saveStatus ? 'Brain Synced ✓' : 'Commit Voice Parameters'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section className="space-y-8">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Voice Profile Name</label>
               <input 
                 className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner"
                 value={voice.name}
                 onChange={e => setVoice({ ...voice, name: e.target.value })}
               />
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ideal Audience Persona</label>
               <textarea 
                 className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[2rem] text-slate-900 font-medium focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner h-32 resize-none leading-relaxed"
                 value={voice.audience}
                 onChange={e => setVoice({ ...voice, audience: e.target.value })}
               />
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tone & Mannerisms</label>
               <textarea 
                 className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[2rem] text-slate-900 font-medium focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner h-32 resize-none leading-relaxed"
                 value={voice.tone}
                 onChange={e => setVoice({ ...voice, tone: e.target.value })}
                 placeholder="How should the AI speak? (e.g. Friendly but firm, uses metaphors...)"
               />
            </div>
          </section>

          <section className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1">Negative Constraints (Avoid)</label>
              <div className="space-y-3">
                 <div className="flex flex-wrap gap-2">
                   {voice.avoidKeywords.map((k, i) => (
                     <span key={i} className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-bold flex items-center">
                        {k}
                        <button onClick={() => removeKeyword('avoidKeywords', i)} className="ml-2 hover:text-rose-800">✕</button>
                     </span>
                   ))}
                 </div>
                 <input 
                   onKeyDown={e => e.key === 'Enter' && (addKeyword('avoidKeywords', e.currentTarget.value), e.currentTarget.value = '')}
                   className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-rose-200"
                   placeholder="Type word and press Enter..."
                 />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1">Signature Lexicon (Include)</label>
              <div className="space-y-3">
                 <div className="flex flex-wrap gap-2">
                   {voice.keyPhrases.map((k, i) => (
                     <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold flex items-center">
                        {k}
                        <button onClick={() => removeKeyword('keyPhrases', i)} className="ml-2 hover:text-emerald-800">✕</button>
                     </span>
                   ))}
                 </div>
                 <input 
                   onKeyDown={e => e.key === 'Enter' && (addKeyword('keyPhrases', e.currentTarget.value), e.currentTarget.value = '')}
                   className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-200"
                   placeholder="Add key phrase..."
                 />
              </div>
            </div>

            <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-white/5 space-y-4 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                  <span className="text-4xl">💡</span>
               </div>
               <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Architectural Insight</h4>
               <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic pr-8">
                 These parameters are injected into every Gemini request system-wide. Consistency in brand voice is the foundation of digital authority.
               </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BrandVoicePage;
