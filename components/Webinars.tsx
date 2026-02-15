
import React, { useState, useEffect } from 'react';
import { Webinar, PageDesign, Status, Campaign } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { Icons } from '../constants';
import { generateWebinarUpdateAlerts } from '../services/geminiService';

const DEFAULT_INVITE_DESIGN: PageDesign = {
  headline: "Unlock The Future of AI Automation",
  subheadline: "Join our exclusive masterclass on scaling enterprise operations with neural networks.",
  ctaText: "Reserve My Seat",
  themeColor: "#0f172a",
  accentColor: "#4f46e5"
};

const DEFAULT_SIGNIN_DESIGN: PageDesign = {
  headline: "Verified Session Access",
  subheadline: "Please verify your registration email to unlock the live room code.",
  ctaText: "Verify & Enter",
  themeColor: "#050505",
  accentColor: "#10b981"
};

const MOCK_WEBINARS: Webinar[] = [
  { 
    id: 'w1', 
    title: 'The Future of AI Automation', 
    slug: 'ai-automation-2025',
    subdomain: 'future',
    description: 'A deep dive into how neural networks are reshaping enterprise productivity.',
    date: '2025-03-01', 
    invites: 1500, 
    showUps: 450, 
    buyers: 42, 
    status: 'Live', 
    transcript: "Hi everyone, welcome to the AI Automation workshop...",
    roomLink: 'https://meet.google.com/abc-defg-hij',
    accessCode: 'NEURAL-2025',
    scheduleDay: 4,
    scheduleTime: '14:00',
    repeatFrequency: 'Weekly',
    invitePageDesign: DEFAULT_INVITE_DESIGN,
    signinPageDesign: DEFAULT_SIGNIN_DESIGN,
    invitesSent: ['admin@omniportal.app'],
    calendarEventId: 'evt-initial-w1',
    campaignId: 'camp-initial-w1'
  }
];

const WebinarCenter: React.FC = () => {
  const [webinars, setWebinars] = useState<Webinar[]>(() => {
    const saved = localStorage.getItem('OMNI_WEBINARS_V1');
    return saved ? JSON.parse(saved) : MOCK_WEBINARS;
  });
  const [view, setView] = useState<'dashboard' | 'funnel-builder'>('dashboard');
  const [activeWebinar, setActiveWebinar] = useState<Webinar | null>(null);
  const [funnelTab, setFunnelTab] = useState<'analytics' | 'invite' | 'signin' | 'outreach' | 'config'>('analytics');
  const [isGeneratingPage, setIsGeneratingPage] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCodeRevealed, setIsCodeRevealed] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [showShareToast, setShowShareToast] = useState(false);
  const [isNeuralSyncing, setIsNeuralSyncing] = useState(false);

  const [newWebinarForm, setNewWebinarForm] = useState({
    title: '',
    description: '',
    scheduleDay: 1,
    scheduleTime: '10:00',
    repeatFrequency: 'Weekly' as 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'None'
  });

  useEffect(() => {
    localStorage.setItem('OMNI_WEBINARS_V1', JSON.stringify(webinars));
  }, [webinars]);

  const openFunnel = (w: Webinar) => {
    setActiveWebinar(w);
    setView('funnel-builder');
    setFunnelTab('analytics');
  };

  const calculateNextOccurrenceDate = (dayOfWeek: number, time: string) => {
    const now = new Date();
    const [hours, minutes] = (time || '10:00').split(':').map(Number);
    let resultDate = new Date();
    resultDate.setHours(hours, minutes, 0, 0);
    const currentDay = now.getDay();
    let daysUntil = (dayOfWeek - currentDay + 7) % 7;
    if (daysUntil === 0 && (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes))) daysUntil = 7;
    resultDate.setDate(now.getDate() + daysUntil);
    return resultDate;
  };

  const handleCreateWebinar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebinarForm.title) return;

    const id = `w-${Date.now()}`;
    const slug = newWebinarForm.title.toLowerCase().replace(/\s+/g, '-');
    const occurrenceDate = calculateNextOccurrenceDate(newWebinarForm.scheduleDay, newWebinarForm.scheduleTime);
    const dateStr = occurrenceDate.toISOString().split('T')[0];

    const calendarEventId = `evt-${Date.now()}`;
    const campaignId = `camp-${Date.now()}`;

    const created: Webinar = {
      id,
      title: newWebinarForm.title,
      slug,
      subdomain: '',
      description: newWebinarForm.description,
      date: dateStr,
      invites: 0, showUps: 0, buyers: 0,
      status: 'Upcoming',
      scheduleDay: newWebinarForm.scheduleDay,
      scheduleTime: newWebinarForm.scheduleTime,
      repeatFrequency: newWebinarForm.repeatFrequency,
      invitePageDesign: { ...DEFAULT_INVITE_DESIGN, headline: newWebinarForm.title },
      signinPageDesign: DEFAULT_SIGNIN_DESIGN,
      invitesSent: [],
      calendarEventId,
      campaignId
    };

    // 1. Save Webinar
    const updatedWebinars = [created, ...webinars];
    setWebinars(updatedWebinars);

    // 2. Automatically add to Global Calendar (Tasks Storage)
    const savedTasks = JSON.parse(localStorage.getItem('OMNI_GLOBAL_TASKS_V1') || '[]');
    const newCalendarEvent = {
      id: calendarEventId,
      title: `📡 Webinar: ${created.title}`,
      priority: 'High',
      column: 'To Do',
      category: 'Event',
      dueDate: dateStr,
      isEvent: true,
      isAvailable: false,
      eventDetails: created.description,
      webinarLink: `https://omniportal.app/join/${slug}`
    };
    localStorage.setItem('OMNI_GLOBAL_TASKS_V1', JSON.stringify([newCalendarEvent, ...savedTasks]));

    // 3. Automatically create Follow-up Campaign
    const savedCampaigns = JSON.parse(localStorage.getItem('OMNI_CAMPAIGNS_V3') || '[]');
    const newCampaign: Campaign = {
      id: campaignId,
      name: `Follow-up: ${created.title}`,
      channel: 'Email',
      status: 'Draft',
      reach: 0,
      conversion: 0,
      startDate: dateStr,
      summary: `Automated follow-up sequence for the ${created.title} session.`,
      steps: [
        { id: `step-1-${Date.now()}`, type: 'Email', title: 'Post-Event Replay', body: `Hi! Thanks for attending ${created.title}. Here is your requested replay link and the resources we discussed.`, delayDays: 1, status: 'Draft' },
        { id: `step-2-${Date.now()}`, type: 'Email', title: 'Next Steps & Feedback', body: 'We would love to hear your thoughts on the session. Do you have 2 minutes for a quick survey?', delayDays: 3, status: 'Draft' }
      ]
    };
    localStorage.setItem('OMNI_CAMPAIGNS_V3', JSON.stringify([newCampaign, ...savedCampaigns]));

    setIsCreateModalOpen(false);
    setNewWebinarForm({ title: '', description: '', scheduleDay: 1, scheduleTime: '10:00', repeatFrequency: 'Weekly' });
    openFunnel(created);
  };

  /**
   * Enhanced update function with Neural Syncing
   */
  const updateWebinar = async (updates: Partial<Webinar>) => {
    if (!activeWebinar) return;

    // Detect critical changes that need neural alert synthesis
    const isScheduleChange = (updates.date && updates.date !== activeWebinar.date) || 
                             (updates.scheduleTime && updates.scheduleTime !== activeWebinar.scheduleTime);
    const isCancelChange = updates.status === 'Cancelled';
    const isTitleChange = updates.title && updates.title !== activeWebinar.title;

    const nextWebinar = { ...activeWebinar, ...updates };
    setActiveWebinar(nextWebinar);
    setWebinars(prev => prev.map(w => w.id === activeWebinar.id ? nextWebinar : w));

    if (isScheduleChange || isCancelChange || isTitleChange) {
      setIsNeuralSyncing(true);
      try {
        const action = isCancelChange ? 'Cancel' : isScheduleChange ? 'Reschedule' : 'Postpone';
        const brandVoice = JSON.parse(localStorage.getItem('HOBBS_BRAND_VOICE') || '{}');
        
        // 1. Synthesize Neural Alerts
        const alerts = await generateWebinarUpdateAlerts(
          action as any, 
          nextWebinar, 
          activeWebinar.date + ' ' + activeWebinar.scheduleTime, 
          nextWebinar.date + ' ' + nextWebinar.scheduleTime,
          brandVoice
        );

        // 2. Sync Calendar
        if (nextWebinar.calendarEventId) {
          const tasks = JSON.parse(localStorage.getItem('OMNI_GLOBAL_TASKS_V1') || '[]');
          const updatedTasks = tasks.map((t: any) => {
            if (t.id === nextWebinar.calendarEventId) {
              return { 
                ...t, 
                title: isCancelChange ? `[CANCELLED] ${nextWebinar.title}` : `📡 Webinar: ${nextWebinar.title}`,
                dueDate: nextWebinar.date,
                eventDetails: `Update: ${alerts.sms}\n\nOriginal: ${nextWebinar.description}`,
                column: isCancelChange ? 'Blocked' : t.column
              };
            }
            return t;
          });
          localStorage.setItem('OMNI_GLOBAL_TASKS_V1', JSON.stringify(updatedTasks));
        }

        // 3. Sync Campaign Templates
        if (nextWebinar.campaignId) {
          const campaigns = JSON.parse(localStorage.getItem('OMNI_CAMPAIGNS_V3') || '[]');
          const updatedCampaigns = campaigns.map((c: any) => {
            if (c.id === nextWebinar.campaignId) {
              const newStepId = `step-alert-${Date.now()}`;
              return { 
                ...c, 
                name: `Alert: ${nextWebinar.title} (${action})`,
                startDate: nextWebinar.date,
                steps: [
                  { 
                    id: newStepId, 
                    type: 'Email', 
                    title: `Important: ${action} Notice`, 
                    subject: alerts.email.subject, 
                    body: alerts.email.body, 
                    delayDays: 0, 
                    status: 'Draft' 
                  },
                  ...(c.steps || [])
                ]
              };
            }
            return c;
          });
          localStorage.setItem('OMNI_CAMPAIGNS_V3', JSON.stringify(updatedCampaigns));
        }
      } catch (e) {
        console.error("Neural Sync Failed", e);
      } finally {
        setIsNeuralSyncing(false);
      }
    }
  };

  const handleDeleteWebinar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this webinar and its associated funnel data? This will also remove the linked calendar event and campaigns.")) {
      const webinarToDelete = webinars.find(w => w.id === id);
      
      // Cleanup linked modules
      if (webinarToDelete) {
        if (webinarToDelete.calendarEventId) {
          const tasks = JSON.parse(localStorage.getItem('OMNI_GLOBAL_TASKS_V1') || '[]');
          localStorage.setItem('OMNI_GLOBAL_TASKS_V1', JSON.stringify(tasks.filter((t: any) => t.id !== webinarToDelete.calendarEventId)));
        }
        if (webinarToDelete.campaignId) {
          const campaigns = JSON.parse(localStorage.getItem('OMNI_CAMPAIGNS_V3') || '[]');
          localStorage.setItem('OMNI_CAMPAIGNS_V3', JSON.stringify(campaigns.filter((c: any) => c.id !== webinarToDelete.campaignId)));
        }
      }

      setWebinars(prev => prev.filter(w => w.id !== id));
      if (activeWebinar?.id === id) setView('dashboard');
    }
  };

  const sendInvites = () => {
    const list = inviteEmails.split(',').map(e => e.trim()).filter(Boolean);
    updateWebinar({ invitesSent: [...(activeWebinar?.invitesSent || []), ...list] });
    setInviteEmails('');
    alert(`Dispatched ${list.length} invitations via Neural Email Engine.`);
  };

  const copyShareLink = () => {
    const url = activeWebinar?.subdomain 
      ? `https://${activeWebinar.subdomain}.omniportal.app` 
      : `https://omniportal.app/join/${activeWebinar?.slug}`;
    navigator.clipboard.writeText(url);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const formatNextOccurrence = (dayOfWeek: number, time: string) => {
    const date = calculateNextOccurrenceDate(dayOfWeek, time);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (view === 'funnel-builder' && activeWebinar) {
    const nextDateString = formatNextOccurrence(activeWebinar.scheduleDay || 0, activeWebinar.scheduleTime || '10:00');
    
    return (
      <div className="flex-1 flex flex-col h-full bg-[#f8faff] animate-in fade-in duration-500 overflow-hidden text-slate-900">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 z-10 shadow-sm">
          <div className="flex items-center space-x-6">
            <button onClick={() => setView('dashboard')} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{activeWebinar.title}</h2>
              <div className="flex items-center space-x-2 mt-0.5">
                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Funnel Framework</span>
                 <span className="text-slate-200">•</span>
                 <span className="text-[10px] font-bold text-slate-400 font-mono">{activeWebinar.subdomain ? `${activeWebinar.subdomain}.omniportal.app` : `omniportal.app/join/${activeWebinar.slug}`}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isNeuralSyncing && (
              <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Neural Syncing...</span>
              </div>
            )}
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              {(['analytics', 'invite', 'signin', 'outreach', 'config'] as const).map(v => (
                <button key={v} onClick={() => setFunnelTab(v)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${funnelTab === v ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                  {v === 'analytics' ? '📊 Data' : v === 'invite' ? '🎨 Landing' : v === 'signin' ? '🔑 Sign-In' : v === 'outreach' ? '📢 Invites' : '⚙️ Config'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 pattern-grid-light scrollbar-hide relative">
          {showShareToast && (
             <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl font-black text-[10px] uppercase tracking-widest animate-in slide-in-from-bottom-4">
                ✨ URL Copied to Clipboard
             </div>
          )}

          <div className="max-w-6xl mx-auto pb-40">
            {funnelTab === 'analytics' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-3 gap-8">
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Invites</p>
                     <p className="text-5xl font-black text-slate-900">{activeWebinar.invites.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Show-ups</p>
                     <p className="text-5xl font-black text-indigo-600">{activeWebinar.showUps.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent Invites</p>
                     <p className="text-5xl font-black text-emerald-600">{(activeWebinar.invitesSent?.length || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-[4rem] p-16 text-white flex justify-between items-center relative overflow-hidden shadow-2xl">
                   <div className="absolute inset-0 pattern-grid opacity-5"></div>
                   <div className="relative space-y-4">
                      <h3 className="text-2xl font-black uppercase tracking-tight">Active Distribution</h3>
                      <p className="text-slate-400 font-medium max-w-md italic">Public access is live. Forms on linked landing pages are feeding into this dataset. All new leads will receive the automatic follow-up sequence.</p>
                   </div>
                   <button onClick={copyShareLink} className="relative px-8 py-4 bg-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl active:scale-95 transition-all">Copy Public Link</button>
                </div>
              </div>
            )}

            {(funnelTab === 'invite' || funnelTab === 'signin') && (
              <div className="grid grid-cols-12 gap-10 animate-in fade-in">
                <div className="col-span-4 space-y-6">
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
                     <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest">Visual Designer</h4>
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Headline</label>
                           <input 
                              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                              value={funnelTab === 'invite' ? activeWebinar.invitePageDesign?.headline : activeWebinar.signinPageDesign?.headline}
                              onChange={(e) => {
                                 const key = funnelTab === 'invite' ? 'invitePageDesign' : 'signinPageDesign';
                                 const current = activeWebinar[key] || DEFAULT_INVITE_DESIGN;
                                 updateWebinar({ [key]: { ...current, headline: e.target.value } });
                              }}
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Subheadline</label>
                           <textarea 
                              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-medium h-24 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                              value={funnelTab === 'invite' ? activeWebinar.invitePageDesign?.subheadline : activeWebinar.signinPageDesign?.subheadline}
                              onChange={(e) => {
                                 const key = funnelTab === 'invite' ? 'invitePageDesign' : 'signinPageDesign';
                                 const current = activeWebinar[key] || DEFAULT_INVITE_DESIGN;
                                 updateWebinar({ [key]: { ...current, subheadline: e.target.value } });
                              }}
                           />
                        </div>
                     </div>
                  </div>
                  <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-xl flex flex-col items-center text-center space-y-4">
                     <span className="text-3xl">🌐</span>
                     <p className="text-xs font-black uppercase tracking-widest leading-relaxed">This form can be embedded in any Site Studio project.</p>
                     <button onClick={() => alert('Navigate to Site Studio to drag this widget.')} className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest">Go to Designer</button>
                  </div>
                </div>

                <div className="col-span-8">
                   <div 
                      className="rounded-[4rem] min-h-[600px] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center p-20"
                      style={{ backgroundColor: (funnelTab === 'invite' ? activeWebinar.invitePageDesign?.themeColor : activeWebinar.signinPageDesign?.themeColor) || '#000' }}
                   >
                      <div className="absolute inset-0 pattern-grid opacity-10"></div>
                      <div className="relative z-10 space-y-8 max-w-xl">
                         <h1 className="text-5xl font-black text-white tracking-tighter leading-tight uppercase">
                            {(funnelTab === 'invite' ? activeWebinar.invitePageDesign?.headline : activeWebinar.signinPageDesign?.headline) || 'Title'}
                         </h1>
                         <p className="text-lg text-slate-400 font-medium">
                            {(funnelTab === 'invite' ? activeWebinar.invitePageDesign?.subheadline : activeWebinar.signinPageDesign?.subheadline) || 'Subtext'}
                         </p>
                         <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 w-full space-y-6">
                            <input className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white outline-none font-bold placeholder-slate-600" placeholder="Email Address" />
                            <button className="w-full py-5 rounded-2xl font-black text-white uppercase tracking-widest text-sm shadow-xl" style={{ backgroundColor: activeWebinar.invitePageDesign?.accentColor || '#4f46e5' }}>
                               {funnelTab === 'invite' ? activeWebinar.invitePageDesign?.ctaText : activeWebinar.signinPageDesign?.ctaText}
                            </button>
                            <p className="text-[10px] text-slate-500 uppercase font-black">Next Session: {nextDateString}</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {funnelTab === 'outreach' && (
              <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4">
                 <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-xl space-y-10">
                    <div className="flex items-center space-x-4">
                       <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl">📩</div>
                       <div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase">Send Invitations</h3>
                          <p className="text-slate-500 text-sm font-medium">Dispatched via Neural Email Service.</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Recipient Emails (Comma separated)</label>
                       <textarea 
                          className="w-full h-40 p-8 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-[2.5rem] outline-none text-sm font-medium transition-all shadow-inner"
                          placeholder="partner@enterprise.io, cto@cloudscale.net..."
                          value={inviteEmails}
                          onChange={e => setInviteEmails(e.target.value)}
                       />
                    </div>
                    <button 
                       onClick={sendInvites}
                       disabled={!inviteEmails.trim()}
                       className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-30"
                    >
                       Dispatch Invites
                    </button>
                 </div>

                 <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-xl space-y-8">
                    <h4 className="text-sm font-black text-slate-900 uppercase px-2 tracking-widest">Sharing Matrix</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={copyShareLink} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col items-center space-y-3 hover:bg-white hover:border-indigo-200 transition-all group">
                          <span className="text-3xl group-hover:scale-110 transition-transform">🔗</span>
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Copy Direct Link</span>
                       </button>
                       <button className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col items-center space-y-3 hover:bg-white hover:border-indigo-200 transition-all group opacity-40 grayscale cursor-not-allowed">
                          <span className="text-3xl">📱</span>
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Discord/Slack Push</span>
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {funnelTab === 'config' && (
              <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in">
                 <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-xl space-y-10">
                    <div className="flex items-center space-x-4">
                       <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl">🌐</div>
                       <div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase">Routing & Identity</h3>
                          <p className="text-slate-500 text-sm font-medium">Configure public access points.</p>
                       </div>
                    </div>
                    
                    <div className="space-y-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Dedicated Subdomain</label>
                          <div className="flex">
                             <input 
                                className="flex-1 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 p-5 rounded-l-2xl font-black text-lg outline-none transition-all shadow-inner text-right"
                                value={activeWebinar.subdomain || ''}
                                onChange={e => updateWebinar({ subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                placeholder="my-webinar"
                             />
                             <div className="bg-slate-200 px-6 flex items-center rounded-r-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border-l border-white/10">
                                .omniportal.app
                             </div>
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Webinar Header Title</label>
                          <input 
                             className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 p-5 rounded-2xl font-black text-lg outline-none transition-all shadow-inner"
                             value={activeWebinar.title}
                             onChange={e => updateWebinar({ title: e.target.value })}
                          />
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Custom Slug (Universal Path)</label>
                          <div className="flex items-center space-x-4 bg-slate-50 p-5 rounded-2xl shadow-inner border border-slate-100">
                             <span className="text-[10px] font-black text-slate-400 uppercase">omniportal.app/join/</span>
                             <input 
                                className="flex-1 bg-transparent border-none p-0 font-black text-lg text-indigo-600 outline-none focus:ring-0"
                                value={activeWebinar.slug}
                                onChange={e => updateWebinar({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                             />
                          </div>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Scheduled Day</label>
                          <select 
                             className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-black uppercase outline-none shadow-inner"
                             value={activeWebinar.scheduleDay}
                             onChange={e => updateWebinar({ scheduleDay: Number(e.target.value) })}
                          >
                             {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                          </select>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">UTC Time Matrix</label>
                          <input 
                             type="time"
                             className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-black outline-none shadow-inner"
                             value={activeWebinar.scheduleTime}
                             onChange={e => updateWebinar({ scheduleTime: e.target.value })}
                          />
                       </div>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                       <div className="flex justify-between items-center mb-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Redirects</p>
                          <span className="text-[9px] font-bold text-emerald-500 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Verified</span>
                       </div>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                             <span>Landing Page</span>
                             <span className="font-mono text-[10px] text-indigo-400">/join/{activeWebinar.slug}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                             <span>Sign-in Check-in</span>
                             <span className="font-mono text-[10px] text-indigo-400">/verify/{activeWebinar.slug}</span>
                          </div>
                       </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex flex-col space-y-4">
                       <button 
                         onClick={() => updateWebinar({ status: 'Cancelled' })}
                         className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                       >
                         Neural Cancel Session
                       </button>
                       <button 
                         onClick={(e) => handleDeleteWebinar(activeWebinar.id, e as any)}
                         className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                       >
                         Purge All Webinar Data (No Alerts)
                       </button>
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
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in duration-700 text-slate-900">
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
             <div 
               key={w.id} 
               onClick={() => openFunnel(w)}
               className="bg-white rounded-[4rem] border border-slate-200 p-12 shadow-sm hover:shadow-[0_40px_80px_rgba(0,0,0,0.05)] transition-all group flex flex-col lg:flex-row lg:items-center gap-16 relative cursor-pointer"
             >
                <div className="lg:w-1/3 space-y-6">
                   <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${w.status === 'Live' ? 'bg-rose-500 animate-pulse' : w.status === 'Completed' ? 'bg-slate-400' : w.status === 'Cancelled' ? 'bg-rose-900' : 'bg-indigo-500'}`}></div>
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{w.status} // Every {days[w.scheduleDay || 0]} @ {w.scheduleTime}</span>
                   </div>
                   <h3 className={`text-4xl font-black text-slate-900 tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors uppercase ${w.status === 'Cancelled' ? 'line-through opacity-40' : ''}`}>{w.title}</h3>
                   <div className="flex space-x-4 pt-2">
                      <span className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/20 group-hover:bg-indigo-700 transition-all">Orchestrate Funnel</span>
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
                
                <button 
                  onClick={(e) => handleDeleteWebinar(w.id, e)} 
                  className="text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 absolute top-12 right-12 p-3 rounded-full hover:bg-rose-50"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
           ))}
        </div>
      </div>

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
                 <button onClick={() => setIsCreateModalOpen(false)} className="p-4 hover:bg-white rounded-full text-slate-400 transition-all">✕</button>
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
