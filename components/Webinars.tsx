
import React, { useState, useEffect, useMemo } from 'react';
import { Webinar, Page } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { Icons } from '../constants';

const MOCK_WEBINARS: Webinar[] = [
  { 
    id: 'w1', 
    title: 'The Future of AI Automation', 
    description: 'A deep dive into how neural networks are reshaping enterprise productivity.',
    date: '2025-03-01', 
    invites: 1500, 
    showUps: 450, 
    buyers: 42, 
    status: 'Live', 
    transcript: "Hi everyone, welcome to the AI Automation workshop. Today we are discussing legal help and insurance workflows. Let's make an appointment for the review next Tuesday. Send a follow up email to all attendees about the new invoice template. Also, I promised Bob a 20% discount on the enterprise plan if he signs today.",
    roomLink: 'https://meet.google.com/abc-defg-hij',
    accessCode: 'NEURAL-2025',
    scheduleDay: 4, // Thursday
    scheduleTime: '14:00',
    repeatFrequency: 'Weekly'
  }
];

const WebinarCenter: React.FC = () => {
  const [webinars, setWebinars] = useState<Webinar[]>(() => {
    const saved = localStorage.getItem('OMNI_WEBINARS_V1');
    return saved ? JSON.parse(saved) : MOCK_WEBINARS;
  });
  const [view, setView] = useState<'dashboard' | 'funnel-builder'>('dashboard');
  const [activeWebinar, setActiveWebinar] = useState<Webinar | null>(null);
  const [funnelTab, setFunnelTab] = useState<'invite' | 'signin' | 'config' | 'intelligence'>('invite');
  const [processingWebinar, setProcessingWebinar] = useState<string | null>(null);
  const [aiActions, setAiActions] = useState<any[]>([]);
  const [isCodeRevealed, setIsCodeRevealed] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Sign-in states
  const [signInEmail, setSignInEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const [newWebinarForm, setNewWebinarForm] = useState({
    title: '',
    description: '',
    scheduleDay: 1, // Monday
    scheduleTime: '10:00',
    repeatFrequency: 'Weekly' as 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'None'
  });

  useEffect(() => {
    localStorage.setItem('OMNI_WEBINARS_V1', JSON.stringify(webinars));
  }, [webinars]);

  const openFunnel = (w: Webinar) => {
    setActiveWebinar(w);
    setView('funnel-builder');
    setFunnelTab('invite');
    setIsVerified(false);
    setSignInEmail('');
  };

  const handleCreateWebinar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebinarForm.title) return;

    const created: Webinar = {
      id: `w-${Date.now()}`,
      title: newWebinarForm.title,
      description: newWebinarForm.description,
      date: new Date().toISOString().split('T')[0],
      invites: 0,
      showUps: 0,
      buyers: 0,
      status: 'Upcoming',
      scheduleDay: newWebinarForm.scheduleDay,
      scheduleTime: newWebinarForm.scheduleTime,
      repeatFrequency: newWebinarForm.repeatFrequency,
      roomLink: '',
      accessCode: '',
      token: ''
    };

    setWebinars([created, ...webinars]);
    setIsCreateModalOpen(false);
    setNewWebinarForm({ title: '', description: '', scheduleDay: 1, scheduleTime: '10:00', repeatFrequency: 'Weekly' });
    openFunnel(created);
  };

  const updateWebinar = (updates: Partial<Webinar>) => {
    if (!activeWebinar) return;
    const next = { ...activeWebinar, ...updates };
    setActiveWebinar(next);
    setWebinars(prev => prev.map(w => w.id === activeWebinar.id ? next : w));
  };

  const calculateNextOccurrence = (dayOfWeek: number, time: string, frequency: string = 'Weekly') => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    let resultDate = new Date();
    resultDate.setHours(hours, minutes, 0, 0);

    const currentDay = now.getDay();
    let daysUntil = (dayOfWeek - currentDay + 7) % 7;
    
    if (daysUntil === 0) {
      if (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)) {
        daysUntil = 7;
      }
    }

    if (frequency === 'Bi-Weekly') daysUntil += 7;
    if (frequency === 'Monthly') daysUntil += 21; // Simple approximation for UI
    
    resultDate.setDate(now.getDate() + daysUntil);
    return resultDate;
  };

  const formatNextOccurrence = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const runNeuralScan = async (webinar: Webinar) => {
    if (!webinar.transcript) return;
    setProcessingWebinar(webinar.id);
    setAiActions([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this webinar transcript. Identify high-intent leads and follow-up actions. Transcript: "${webinar.transcript}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                target: { type: Type.STRING },
                action: { type: Type.STRING },
                value: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
              }
            }
          }
        }
      });
      setAiActions(JSON.parse(response.text || '[]'));
    } catch (e) { console.error(e); }
    finally { setProcessingWebinar(null); }
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (view === 'funnel-builder' && activeWebinar) {
    const nextDate = calculateNextOccurrence(activeWebinar.scheduleDay || 0, activeWebinar.scheduleTime || '10:00', activeWebinar.repeatFrequency);
    const nextDateString = formatNextOccurrence(nextDate);

    const handleSignIn = () => {
      if (signInEmail.trim()) {
        setIsVerified(true);
      }
    };

    const addToCalendar = () => {
      alert(`Synchronizing ${activeWebinar.title} on ${nextDateString} to your workspace calendar.`);
    };

    return (
      <div className="flex-1 flex flex-col h-full bg-[#f8faff] animate-in fade-in duration-500 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 shadow-sm z-10">
          <div className="flex items-center space-x-6">
            <button onClick={() => setView('dashboard')} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{activeWebinar.title}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Active Funnel Management</span>
              </div>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {(['invite', 'signin', 'config', 'intelligence'] as const).map(v => (
              <button key={v} onClick={() => setFunnelTab(v)} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${funnelTab === v ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                {v === 'invite' ? '1. Landing Page' : v === 'signin' ? '2. Sign-In / Check-in' : v === 'config' ? '3. Automation Config' : '4. Post-Event Intel'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 pattern-grid-light relative">
          <div className="max-w-5xl mx-auto pb-40">
            {funnelTab === 'invite' && (
              <div className="space-y-12 animate-in slide-in-from-bottom-4">
                <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-2xl relative">
                  <div className="absolute top-8 right-8 z-20">
                     <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">Live Soon</span>
                  </div>
                  <div className="h-80 bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 pattern-grid opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                    <h1 className="text-5xl font-black text-white z-10 uppercase tracking-tighter text-center max-w-2xl px-10 leading-tight">{activeWebinar.title}</h1>
                    <p className="text-indigo-400 font-bold uppercase tracking-widest mt-6 z-10 bg-indigo-900/40 px-6 py-2 rounded-full backdrop-blur-md border border-indigo-500/30 shadow-2xl animate-in zoom-in">Exclusive Virtual Event // {nextDateString}</p>
                  </div>
                  <div className="p-16 grid grid-cols-1 md:grid-cols-2 gap-20">
                    <div className="space-y-8">
                      <div className="space-y-3">
                         <h3 className="text-3xl font-black text-slate-900 leading-tight">Masterclass Series</h3>
                         <p className="text-slate-500 leading-relaxed font-medium text-lg">{activeWebinar.description || "Unlock high-level strategies in our recurring virtual sessions. Learn the exact frameworks we use to scale production nodes."}</p>
                      </div>
                      <div className="space-y-4">
                         <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center space-x-6 group hover:bg-white hover:border-indigo-200 transition-all cursor-pointer shadow-inner hover:shadow-xl">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl group-hover:scale-110 transition-transform">📅</div>
                            <div>
                               <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Next Available Session</p>
                               <p className="text-sm font-bold text-slate-700">{nextDateString}</p>
                            </div>
                         </div>
                         <button onClick={addToCalendar} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors pl-6">Add to Calendar (+)</button>
                      </div>
                    </div>
                    <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] space-y-8 relative overflow-hidden">
                       <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                       <div className="relative space-y-6">
                          <h4 className="text-xl font-black text-white uppercase text-center tracking-tight">Request Access</h4>
                          <div className="space-y-4">
                             <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-sm text-white outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder-slate-600" placeholder="Full Name" />
                             <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-sm text-white outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder-slate-600" placeholder="Work Email" />
                             <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 active:scale-95 transition-all">Claim Virtual Seat</button>
                          </div>
                          <div className="pt-4 text-center">
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">System reminders dispatched via<br/>Email, SMS, Telegram, and Discord.</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {funnelTab === 'signin' && (
              <div className="space-y-12 animate-in slide-in-from-bottom-4">
                <div className="bg-slate-950 rounded-[4rem] p-24 shadow-[0_100px_200px_rgba(0,0,0,0.6)] border border-white/5 flex flex-col items-center text-center space-y-12 relative overflow-hidden">
                  <div className="absolute inset-0 pattern-grid opacity-5"></div>
                  <div className="w-28 h-28 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-[0_0_80px_rgba(16,185,129,0.3)] animate-pulse relative z-10">🔑</div>
                  <div className="space-y-4 relative z-10">
                    <h2 className="text-6xl font-black text-white tracking-tighter uppercase">Virtual Check-In</h2>
                    <p className="text-slate-400 text-xl font-medium max-w-lg">Verify your identity to unlock the live session access code and room link.</p>
                  </div>
                  <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-[3.5rem] p-12 space-y-10 relative z-10 backdrop-blur-xl shadow-2xl">
                    {!isVerified ? (
                      <div className="space-y-6 animate-in fade-in zoom-in-95">
                         <div className="space-y-2 text-left px-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Identity Verification</label>
                           <input 
                             value={signInEmail}
                             onChange={(e) => setSignInEmail(e.target.value)}
                             className="w-full bg-black/60 border-2 border-white/5 p-6 rounded-3xl text-white font-mono text-lg outline-none focus:border-emerald-500 transition-all shadow-inner placeholder-slate-800" 
                             placeholder="Registered Email" 
                           />
                         </div>
                         <button onClick={handleSignIn} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/40 hover:bg-emerald-700 transition-all transform active:scale-95 text-xs">Verify & Check-In</button>
                      </div>
                    ) : (
                      <div className="space-y-10 animate-in fade-in zoom-in-95">
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl">
                           <p className="text-emerald-400 font-black uppercase text-xs tracking-widest">Verification Success</p>
                           <p className="text-slate-400 text-[10px] font-medium mt-1 uppercase tracking-tighter">{signInEmail}</p>
                        </div>
                        <div className="space-y-6">
                           <button onClick={() => setIsCodeRevealed(!isCodeRevealed)} className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] hover:text-white transition-colors">
                              {isCodeRevealed ? 'Hide Secured Data' : 'Reveal Access Credentials'}
                           </button>
                           {isCodeRevealed && (
                              <div className="flex flex-col space-y-4 animate-in slide-in-from-top-4">
                                 <div className="bg-black/60 p-6 rounded-[2rem] border border-indigo-500/30 font-mono text-3xl tracking-[0.4em] text-indigo-400 h-24 flex items-center justify-center shadow-inner">
                                    {activeWebinar.accessCode || 'ALPHA-PRIME'}
                                 </div>
                                 <button 
                                   onClick={() => { navigator.clipboard.writeText(activeWebinar.accessCode || 'ALPHA-PRIME'); alert('Code copied!'); }}
                                   className="text-[10px] font-black text-white/40 uppercase hover:text-indigo-400 transition-colors tracking-widest"
                                 >
                                   📋 Copy Credentials
                                 </button>
                              </div>
                           )}
                           <a href={activeWebinar.roomLink || '#'} target="_blank" className="w-full py-6 bg-white text-slate-900 rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-slate-100 transition-all flex items-center justify-center space-x-3">
                              <span>Enter Live Room</span>
                              <span className="text-xl">🚀</span>
                           </a>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all">
                     <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Powered by OmniPortal Neural Shield</span>
                  </div>
                </div>
              </div>
            )}

            {funnelTab === 'config' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-4">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm space-y-10">
                       <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">📡</div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase">Room Matrix</h3>
                       </div>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Production Link (Zoom/Meet)</label>
                             <input value={activeWebinar.roomLink || ''} onChange={(e) => updateWebinar({ roomLink: e.target.value })} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all" placeholder="Enter Virtual Room URL" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Identity Token / Reveal Code</label>
                             <input value={activeWebinar.accessCode || ''} onChange={(e) => updateWebinar({ accessCode: e.target.value })} className="w-full bg-slate-950 border-none p-5 rounded-2xl text-sm font-mono font-bold text-indigo-400 outline-none shadow-inner" placeholder="e.g. VIP-ACCESS-2025" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Custom Value (Workflow Injection)</label>
                             <input value={activeWebinar.token || ''} onChange={(e) => updateWebinar({ token: e.target.value })} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm font-mono font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all" placeholder="UUID or Tracking Token" />
                          </div>
                       </div>
                    </div>

                    <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm space-y-10">
                       <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">⚡</div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase">Temporal Logic</h3>
                       </div>
                       <div className="space-y-8">
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Recurrence Window</label>
                                <select value={activeWebinar.scheduleDay} onChange={(e) => updateWebinar({ scheduleDay: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-xs font-black uppercase outline-none cursor-pointer hover:bg-slate-100 transition-colors">
                                   {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Time Matrix (UTC)</label>
                                <input type="time" value={activeWebinar.scheduleTime} onChange={(e) => updateWebinar({ scheduleTime: e.target.value })} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-xs font-black outline-none" />
                             </div>
                          </div>
                          
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Repeat Frequency</label>
                             <div className="grid grid-cols-2 gap-3">
                                {(['Weekly', 'Bi-Weekly', 'Monthly', 'None'] as const).map(freq => (
                                  <button 
                                    key={freq} 
                                    onClick={() => updateWebinar({ repeatFrequency: freq })}
                                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${activeWebinar.repeatFrequency === freq ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                  >
                                    {freq}
                                  </button>
                                ))}
                             </div>
                          </div>

                          <div className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100 space-y-6">
                             <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
                                Distribution Pulse
                             </h4>
                             <div className="grid grid-cols-2 gap-4">
                                {['Email Campaign', 'SMS Drip', 'Discord Alert', 'Slack Push'].map(c => (
                                  <div key={c} className="flex items-center space-x-3 bg-white px-4 py-3 rounded-2xl border border-indigo-100 shadow-sm">
                                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                     <span className="text-[9px] font-black uppercase text-slate-600 truncate">{c}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {funnelTab === 'intelligence' && (
              <div className="space-y-12 animate-in slide-in-from-bottom-4">
                 <div className="grid grid-cols-3 gap-10">
                   <div className="col-span-1 space-y-6">
                      <div className="bg-white p-10 rounded-[4rem] border border-slate-200 shadow-sm space-y-4 text-center group">
                         <div className="w-20 h-20 bg-indigo-50 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transcript Engine</h4>
                         <p className="text-xs text-slate-500 leading-relaxed font-medium italic">Autonomous extraction of lead intent and discussion terms.</p>
                      </div>
                      <button 
                         disabled={!activeWebinar.transcript || processingWebinar === activeWebinar.id}
                         onClick={() => runNeuralScan(activeWebinar)}
                         className="w-full py-12 bg-slate-900 text-white rounded-[3.5rem] shadow-2xl shadow-indigo-900/40 hover:bg-black transition-all flex flex-col items-center space-y-4 group active:scale-95"
                      >
                         <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-xl">✨</div>
                         <span className="font-black uppercase tracking-[0.3em] text-xs">Run Neural Analysis</span>
                      </button>
                   </div>
                   <div className="col-span-2">
                      <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-xl min-h-[600px] space-y-10 relative overflow-hidden">
                         <div className="flex justify-between items-center border-b border-slate-50 pb-8">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Intelligence Matrix</h3>
                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100">{aiActions.length} Entities Detected</span>
                         </div>
                         <div className="space-y-6">
                            {aiActions.map((action, i) => (
                               <div key={i} className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-indigo-300 hover:bg-white hover:shadow-2xl transition-all group relative overflow-hidden">
                                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${action.priority === 'High' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                                  <div className="flex items-center space-x-8">
                                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">👤</div>
                                     <div>
                                        <div className="flex items-center space-x-3">
                                           <h4 className="font-black text-slate-900 text-lg">{action.target}</h4>
                                           <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${action.priority === 'High' ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{action.priority}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest">{action.action} // {action.value}</p>
                                     </div>
                                  </div>
                                  <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95">Dispatch Workflow</button>
                               </div>
                            ))}
                            {aiActions.length === 0 && (
                              <div className="py-40 text-center opacity-10 flex flex-col items-center space-y-6">
                                 <span className="text-[140px]">📡</span>
                                 <p className="text-3xl font-black uppercase tracking-[0.4em]">Await Transmission</p>
                              </div>
                            )}
                         </div>
                      </div>
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Webinar Control</h2>
            <p className="text-slate-500 font-medium text-xl italic max-w-lg leading-relaxed">Design high-fidelity virtual session funnels with automated cross-platform distribution logic.</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-black active:scale-95 transition-all flex items-center group"
          >
            <span className="mr-3 group-hover:scale-125 transition-transform"><Icons.Plus /></span> Launch Virtual Session
          </button>
        </div>

        <div className="grid grid-cols-1 gap-10">
           {webinars.map(w => (
             <div key={w.id} className="bg-white rounded-[4rem] border border-slate-200 p-12 shadow-sm hover:shadow-[0_40px_80px_rgba(0,0,0,0.05)] transition-all group flex flex-col lg:flex-row lg:items-center gap-16 relative">
                <div className="lg:w-1/3 space-y-6">
                   <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${w.status === 'Live' ? 'bg-rose-500 animate-pulse' : w.status === 'Completed' ? 'bg-slate-400' : 'bg-indigo-500'}`}></div>
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{w.status} // Every {days[w.scheduleDay || 0]} @ {w.scheduleTime}</span>
                   </div>
                   <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors uppercase">{w.title}</h3>
                   <div className="flex space-x-4 pt-2">
                      <button onClick={() => openFunnel(w)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-95">Orchestrate Funnel</button>
                   </div>
                </div>

                <div className="lg:flex-1 grid grid-cols-3 gap-10">
                   <div className="bg-slate-50 rounded-[3rem] p-8 text-center shadow-inner border border-slate-100 flex flex-col justify-center space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Total Invites</p>
                      <p className="text-3xl font-black text-slate-900">{w.invites.toLocaleString()}</p>
                   </div>
                   <div className="bg-slate-50 rounded-[3rem] p-8 text-center shadow-inner border border-slate-100 flex flex-col justify-center space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Sign-In Tracking</p>
                      <p className="text-3xl font-black text-slate-900">{w.showUps.toLocaleString()}</p>
                   </div>
                   <div className="bg-slate-50 rounded-[3rem] p-8 text-center shadow-inner border border-slate-100 flex flex-col justify-center space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Conversion Node</p>
                      <p className="text-3xl font-black text-emerald-600">{w.buyers.toLocaleString()}</p>
                   </div>
                </div>
                
                <button onClick={() => setWebinars(webinars.filter(wb => wb.id !== w.id))} className="text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 absolute top-12 right-12">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
           ))}
           {webinars.length === 0 && (
             <div className="py-60 text-center border-4 border-dashed border-slate-200 rounded-[5rem] opacity-20 group">
               <span className="text-[160px] group-hover:scale-110 transition-transform duration-1000 block">📡</span>
               <p className="text-4xl font-black uppercase tracking-[0.5em] mt-10">Sector Vacuum</p>
               <p className="text-xs font-bold uppercase tracking-widest mt-4">Initialize virtual pipeline to commence session monitoring</p>
             </div>
           )}
        </div>
      </div>

      {/* Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsCreateModalOpen(false)}>
           <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-[0_60px_120px_rgba(0,0,0,0.5)] border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-12 border-b border-slate-50 bg-indigo-50/40 flex justify-between items-center">
                 <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl shadow-2xl">🛰️</div>
                    <div>
                       <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">New Virtual Session</h3>
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2">Autonomous Funnel Architect</p>
                    </div>
                 </div>
                 <button onClick={() => setIsCreateModalOpen(false)} className="p-4 hover:bg-white rounded-full text-slate-400 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <form onSubmit={handleCreateWebinar} className="p-12 space-y-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Session Identifier</label>
                    <input autoFocus required className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 p-6 rounded-3xl font-black text-lg outline-none transition-all shadow-inner uppercase tracking-tight" value={newWebinarForm.title} onChange={e => setNewWebinarForm({...newWebinarForm, title: e.target.value})} placeholder="e.g. Q4 GROWTH FRAMEWORK" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Strategic Takeaways</label>
                    <textarea className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 p-6 rounded-[2rem] font-medium text-sm outline-none transition-all h-28 resize-none shadow-inner" value={newWebinarForm.description} onChange={e => setNewWebinarForm({...newWebinarForm, description: e.target.value})} placeholder="Outline the session objectives..." />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Temporal Window</label>
                       <select value={newWebinarForm.scheduleDay} onChange={e => setNewWebinarForm({...newWebinarForm, scheduleDay: Number(e.target.value)})} className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-3xl text-xs font-black uppercase outline-none cursor-pointer hover:bg-slate-100 transition-all shadow-inner">
                          {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Time (UTC)</label>
                       <input type="time" value={newWebinarForm.scheduleTime} onChange={e => setNewWebinarForm({...newWebinarForm, scheduleTime: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-3xl text-xs font-black outline-none shadow-inner" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Recurrence Choice</label>
                    <div className="grid grid-cols-4 gap-3">
                       {(['Weekly', 'Bi-Weekly', 'Monthly', 'None'] as const).map(freq => (
                         <button 
                           key={freq} 
                           type="button"
                           onClick={() => setNewWebinarForm({ ...newWebinarForm, repeatFrequency: freq })}
                           className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${newWebinarForm.repeatFrequency === freq ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}
                         >
                           {freq}
                         </button>
                       ))}
                    </div>
                 </div>

                 <button type="submit" className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 transform mt-4">Initialize Funnel Framework</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default WebinarCenter;
