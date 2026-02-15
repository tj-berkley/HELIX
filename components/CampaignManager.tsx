
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Campaign, Status, CampaignStep, CampaignTrigger, CampaignTriggerSource } from '../types';
import { generateCampaignFromPrompt, generateCampaignScript } from '../services/geminiService';
import { Icons } from '../constants';

interface ChannelDef {
  id: string;
  name: string;
  icon: string;
  isCustom: boolean;
}

const DEFAULT_CHANNELS: ChannelDef[] = [
  { id: 'ch-1', name: 'Email', icon: '📧', isCustom: false },
  { id: 'ch-2', name: 'SMS', icon: '📱', isCustom: false },
  { id: 'ch-3', name: 'Social', icon: '🌐', isCustom: false },
  { id: 'ch-4', name: 'Ads', icon: '💰', isCustom: false },
  { id: 'ch-5', name: 'Blog', icon: '✍️', isCustom: false },
];

const CAMPAIGN_PRESETS = [
  { 
    id: 'tp_webinar_drip', 
    name: 'Webinar Attendance Drip', 
    channel: 'Email', 
    status: 'Draft' as Status, 
    reach: 0, 
    conversion: 0, 
    startDate: '2025-03-01', 
    summary: 'High-touch email sequence to confirm registration and ensure sign-in portal usage.',
    steps: [
      { id: 's1', type: 'Email', title: 'Confirmation & Sign-in Link', body: 'Welcome to the session! Here is your private sign-in link to track your attendance and unlock the live code on the day.', delayDays: 0, status: 'Draft' },
      { id: 's2', type: 'Email', title: '24 Hour Reminder', body: 'We go live in 24 hours. Don\'t forget to use your portal link to access the room.', delayDays: 1, status: 'Draft' },
      { id: 's3', type: 'Email', title: 'Post-Event Replay & Terms', body: 'Thanks for attending! As mentioned, here are the custom terms we discussed for your upgrade.', delayDays: 2, status: 'Draft' },
    ]
  },
  { id: 't1', name: 'Product Launch Blitz', channel: 'Multi-Channel', status: 'Draft' as Status, reach: 0, conversion: 0, startDate: '2025-06-01', summary: 'High intensity launch sequence across Email, Social and SMS.' },
  { id: 't2', name: 'Voice Concierge Onboarding', channel: 'Phone/SMS', status: 'Draft' as Status, reach: 0, conversion: 0, startDate: '2025-07-01', summary: 'Onboard VIP customers via AI led phone calls and personalized SMS.' },
  { id: 't3', name: 'Newsletter Re-engagement', channel: 'Email', status: 'Draft' as Status, reach: 0, conversion: 0, startDate: '2025-05-15', summary: 'Re-ignite inactive lists with personalized value-driven drip feeds.' },
];

const TRIGGER_SOURCES: { type: CampaignTriggerSource; label: string; icon: string; desc: string }[] = [
  { type: 'Form', label: 'Form Submission', icon: '📝', desc: 'Activate when a specific OmniPortal form is completed.' },
  { type: 'LinkClick', label: 'Link Interaction', icon: '🔗', desc: 'Trigger when a tracking link is clicked in an ad or post.' },
  { type: 'PaperworkSigned', label: 'Paperwork Signature', icon: '✍️', desc: 'Sequence starts after a contract or MSA is signed.' },
  { type: 'IncomingCall', label: 'Incoming Call', icon: '📞', desc: 'Trigger on inbound voice connection to agent.' },
  { type: 'IncomingSMS', label: 'Incoming Message', icon: '📱', desc: 'Activate on keyword detection in SMS/WhatsApp.' },
  { type: 'WebinarJoin', label: 'Webinar Entrance', icon: '📡', desc: 'Trigger when a lead joins a live broadcast.' },
  { type: 'LandingPageVisit', label: 'Page Engagement', icon: '🌐', desc: 'Activate on specific landing page scroll or time-on-page.' },
  { type: 'Manual', label: 'Manual Activation', icon: '🖱️', desc: 'Start the sequence with a single click or CSV upload.' },
];

const CampaignDetailView: React.FC<{
    campaign: Campaign;
    onBack: () => void;
    onUpdate: (updates: Partial<Campaign>) => void;
}> = ({ campaign, onBack, onUpdate }) => {
    const [isRefining, setIsRefining] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'sequence' | 'audience' | 'triggers'>('sequence');
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleStepUpdate = (stepId: string, updates: Partial<CampaignStep>) => {
        const nextSteps = (campaign.steps || []).map(s => s.id === stepId ? { ...s, ...updates } : s);
        onUpdate({ steps: nextSteps });
    };

    const handleRefineStep = async (step: CampaignStep) => {
        setIsRefining(step.id);
        try {
            const voice = JSON.parse(localStorage.getItem('HOBBS_BRAND_VOICE') || '{}');
            const data = await generateCampaignScript(step.type, `Context for this campaign: ${campaign.name}. Current draft: ${step.body}`, voice);
            handleStepUpdate(step.id, { subject: data.subject || step.subject, body: data.body });
        } catch (e) {
            console.error(e);
        } finally {
            setIsRefining(null);
        }
    };

    const addStep = (type: CampaignStep['type']) => {
        const newStep: CampaignStep = {
            id: `st-${Date.now()}`,
            type,
            title: `New ${type}`,
            body: '',
            delayDays: 1,
            status: 'Draft'
        };
        onUpdate({ steps: [...(campaign.steps || []), newStep] });
    };

    const setTrigger = (src: typeof TRIGGER_SOURCES[0]) => {
        onUpdate({ 
            trigger: { id: `tr-${Date.now()}`, source: src.type, label: src.label }
        });
    };

    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsImporting(true);
        setTimeout(() => {
            onUpdate({ 
                audienceType: 'CSV_Import', 
                audienceMeta: { fileName: file.name, count: Math.floor(Math.random() * 500) + 50 } 
            });
            setIsImporting(false);
        }, 1500);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white animate-in slide-in-from-right-10 duration-500 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 shadow-sm z-10">
                <div className="flex items-center space-x-6">
                    <button onClick={onBack} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{campaign.name}</h2>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{campaign.channel} System Orchestration</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex bg-slate-100 p-1 rounded-2xl mr-4">
                        {(['sequence', 'triggers', 'audience'] as const).map(v => (
                            <button key={v} onClick={() => setActiveView(v)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{v}</button>
                        ))}
                    </div>
                    <button 
                        onClick={() => onUpdate({ status: campaign.status === 'Active' ? 'Paused' : 'Active' })}
                        className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${campaign.status === 'Active' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`}
                    >
                        {campaign.status === 'Active' ? 'Stop Campaign' : 'Activate Campaign'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50 pattern-grid-light">
                <div className="max-w-4xl mx-auto space-y-12 pb-32">
                    
                    {/* TRIGGER ARCHITECTURE VIEW */}
                    {activeView === 'triggers' && (
                        <div className="space-y-10 animate-in fade-in zoom-in-95">
                            <div className="space-y-2 px-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Trigger Architecture</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">Select the neural signal that initiates this campaign sequence.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {TRIGGER_SOURCES.map(src => (
                                    <button 
                                        key={src.type} 
                                        onClick={() => setTrigger(src)}
                                        className={`p-8 rounded-[2.5rem] border-2 text-left transition-all group flex items-start space-x-6 ${campaign.trigger?.source === src.type ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-900/20' : 'bg-white border-slate-100 hover:border-indigo-100 hover:shadow-lg'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-transform group-hover:scale-110 ${campaign.trigger?.source === src.type ? 'bg-indigo-500' : 'bg-slate-50'}`}>
                                            {src.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`text-lg font-black uppercase tracking-tight ${campaign.trigger?.source === src.type ? 'text-white' : 'text-slate-900'}`}>{src.label}</h4>
                                            <p className={`text-[11px] font-medium leading-relaxed mt-1 ${campaign.trigger?.source === src.type ? 'text-indigo-100' : 'text-slate-400'}`}>{src.desc}</p>
                                        </div>
                                        {campaign.trigger?.source === src.type && (
                                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-indigo-600 text-xs font-black animate-in zoom-in">✓</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AUDIENCE INTEGRATION VIEW */}
                    {activeView === 'audience' && (
                        <div className="space-y-10 animate-in fade-in zoom-in-95">
                            <div className="space-y-2 px-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Audience Integration</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">Configure the data set that will be processed by this campaign.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-[3rem] border border-slate-200 p-10 space-y-6 shadow-sm">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl">👥</div>
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black text-slate-900">Contact Center Sync</h4>
                                        <p className="text-xs text-slate-500 font-medium">Link this campaign to your primary lead database.</p>
                                    </div>
                                    <button 
                                        onClick={() => onUpdate({ audienceType: 'CRM_Segment' })}
                                        className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${campaign.audienceType === 'CRM_Segment' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                    >
                                        {campaign.audienceType === 'CRM_Segment' ? 'Synced to Global CRM' : 'Connect Leads'}
                                    </button>
                                </div>

                                <div className="bg-white rounded-[3rem] border border-slate-200 p-10 space-y-6 shadow-sm">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl">📊</div>
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black text-slate-900">Sheet / CSV Import</h4>
                                        <p className="text-xs text-slate-500 font-medium">Upload a static list of targets for processing.</p>
                                    </div>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isImporting}
                                        className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${campaign.audienceType === 'CSV_Import' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                    >
                                        {isImporting ? 'Processing Data...' : campaign.audienceType === 'CSV_Import' ? 'Upload Replacement' : 'Upload CSV/Sheets'}
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx" onChange={handleCsvUpload} />
                                </div>
                            </div>

                            {campaign.audienceMeta && (
                                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex items-center justify-between border border-white/5 animate-in slide-in-from-top-4">
                                    <div className="flex items-center space-x-6">
                                        <div className="text-4xl">📎</div>
                                        <div>
                                            <p className="text-sm font-black text-indigo-400 uppercase tracking-widest">Active Data Source</p>
                                            <p className="text-2xl font-black tracking-tight">{campaign.audienceMeta.fileName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calculated Reach</p>
                                        <p className="text-3xl font-black text-emerald-400">{campaign.audienceMeta.count} Profiles</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SEQUENCE EDITOR VIEW */}
                    {activeView === 'sequence' && (
                        <div className="animate-in fade-in">
                            <div className="mb-10 px-2 flex justify-between items-end">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sequence Timeline</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed italic">The automated journey of your audience.</p>
                                </div>
                                <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Start Node</span>
                                    <span className="text-sm font-black text-indigo-600 uppercase tracking-tighter">
                                        {campaign.trigger ? campaign.trigger.label : 'Missing Trigger'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {(campaign.steps || []).map((step, idx) => (
                                    <div key={step.id} className="relative">
                                        <div className="h-10 w-1 bg-indigo-100 absolute -top-10 left-10 rounded-full"></div>
                                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden group/step hover:border-indigo-400 transition-all">
                                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                                        {step.type === 'Email' ? '📧' : step.type === 'SMS' ? '📱' : step.type === 'DM' ? '💬' : step.type === 'Call' ? '📞' : '⏳'}
                                                    </div>
                                                    <div>
                                                        <input 
                                                            className="bg-transparent border-none text-sm font-black text-slate-900 p-0 focus:ring-0 uppercase tracking-tight"
                                                            value={step.title}
                                                            onChange={e => handleStepUpdate(step.id, { title: e.target.value })}
                                                        />
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Step {idx + 1} // {step.type}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-inner">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase mr-2">Wait</span>
                                                        <input 
                                                            type="number" 
                                                            className="w-8 bg-transparent border-none text-xs font-black text-indigo-600 p-0 focus:ring-0" 
                                                            value={step.delayDays}
                                                            onChange={e => handleStepUpdate(step.id, { delayDays: parseInt(e.target.value) })}
                                                        />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase">Days</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => onUpdate({ steps: campaign.steps?.filter(s => s.id !== step.id) })}
                                                        className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-all"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-10 space-y-6">
                                                {step.type === 'Email' && (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subject Line</label>
                                                        <input 
                                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner"
                                                            value={step.subject || ''}
                                                            onChange={e => handleStepUpdate(step.id, { subject: e.target.value })}
                                                        />
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Neural Script Content</label>
                                                    <textarea 
                                                        className="w-full h-32 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-5 text-sm font-medium text-slate-700 outline-none transition-all shadow-inner leading-relaxed resize-none"
                                                        value={step.body}
                                                        onChange={e => handleStepUpdate(step.id, { body: e.target.value })}
                                                        placeholder={`Compose your ${step.type} draft...`}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Brand Voice Synced</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleRefineStep(step)}
                                                        disabled={isRefining === step.id}
                                                        className={`flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all ${isRefining === step.id ? 'animate-pulse' : ''}`}
                                                    >
                                                        {isRefining === step.id ? (
                                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        ) : <span>✨ Gemini Synthesis</span>}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-10 flex flex-col items-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">Append Sequential Node</p>
                                    <div className="flex bg-white border border-slate-200 p-2 rounded-[2rem] shadow-xl space-x-2">
                                        {(['Email', 'SMS', 'DM', 'Call', 'Wait'] as const).map(type => (
                                            <button 
                                                key={type} 
                                                onClick={() => addStep(type)}
                                                className="px-6 py-3 hover:bg-indigo-50 rounded-2xl flex flex-col items-center transition-all group"
                                            >
                                                <span className="text-xl mb-1 group-hover:scale-110 transition-transform">
                                                    {type === 'Email' ? '📧' : type === 'SMS' ? '📱' : type === 'DM' ? '💬' : type === 'Call' ? '📞' : '⏳'}
                                                </span>
                                                <span className="text-[8px] font-black uppercase text-slate-400 group-hover:text-indigo-600">{type}</span>
                                            </button>
                                        ))}
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

const CampaignManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'templates' | 'channels'>('active');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [channels, setChannels] = useState<ChannelDef[]>(() => {
    const saved = localStorage.getItem('OMNI_CHANNELS_V1');
    return saved ? JSON.parse(saved) : DEFAULT_CHANNELS;
  });
  const [customTemplates, setCustomTemplates] = useState<any[]>(() => {
    const saved = localStorage.getItem('OMNI_CAMPAIGN_TEMPLATES_V1');
    return saved ? JSON.parse(saved) : [];
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  
  // Create Campaign Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', channel: 'Email', startDate: new Date().toISOString().split('T')[0] });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  // Add Channel Form State
  const [newChannel, setNewChannel] = useState({ name: '', icon: '📡' });

  useEffect(() => {
    const saved = localStorage.getItem('OMNI_CAMPAIGNS_V3');
    if (saved) setCampaigns(JSON.parse(saved));
    else setCampaigns([{ id: 'c1', name: 'Spring Reveal', channel: 'Social', status: 'Active', reach: 45000, conversion: 2.4, startDate: '2025-03-01' }]);
  }, []);

  useEffect(() => {
    localStorage.setItem('OMNI_CHANNELS_V1', JSON.stringify(channels));
  }, [channels]);

  const saveCampaigns = (updated: Campaign[]) => {
    setCampaigns(updated);
    localStorage.setItem('OMNI_CAMPAIGNS_V3', JSON.stringify(updated));
  };

  const saveTemplates = (updated: any[]) => {
    setCustomTemplates(updated);
    localStorage.setItem('OMNI_CAMPAIGN_TEMPLATES_V1', JSON.stringify(updated));
  };

  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const data = await generateCampaignFromPrompt(aiPrompt);
      const newCamps = data.map((d: any, i: number) => ({
        id: `c-ai-${Date.now()}-${i}`,
        name: d.name,
        channel: d.channel,
        status: 'Draft' as Status,
        reach: 0,
        conversion: 0,
        startDate: d.startDate || new Date().toISOString().split('T')[0],
        steps: d.steps?.map((s: any, idx: number) => ({ ...s, id: `step-${idx}-${Date.now()}`, status: 'Draft' })) || []
      }));
      saveCampaigns([...newCamps, ...campaigns]);
      setAiPrompt('');
      setActiveTab('active');
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const handleCreateManualCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name.trim()) return;
    const camp: Campaign = {
      id: `c-${Date.now()}`,
      name: newCampaign.name,
      channel: newCampaign.channel,
      status: 'Draft',
      reach: 0,
      conversion: 0,
      startDate: newCampaign.startDate,
      steps: []
    };
    saveCampaigns([camp, ...campaigns]);
    setIsCreateModalOpen(false);
    setNewCampaign({ name: '', channel: 'Email', startDate: new Date().toISOString().split('T')[0] });
    setActiveTab('active');
  };

  const handleSaveAsTemplate = (campaign: Campaign) => {
    const template = {
      ...campaign,
      id: `tpl-${Date.now()}`,
      summary: `User-defined strategy based on ${campaign.name}.`,
      status: 'Draft'
    };
    saveTemplates([template, ...customTemplates]);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleRenameCampaign = (id: string, newName: string) => {
    const updated = campaigns.map(c => c.id === id ? { ...c, name: newName } : c);
    saveCampaigns(updated);
  };

  const handleUpdateCampaign = (id: string, updates: Partial<Campaign>) => {
    const updated = campaigns.map(c => c.id === id ? { ...c, ...updates } : c);
    saveCampaigns(updated);
  };

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannel.name.trim()) return;
    const chan: ChannelDef = {
      id: `ch-${Date.now()}`,
      name: newChannel.name,
      icon: newChannel.icon,
      isCustom: true
    };
    setChannels([...channels, chan]);
    setNewChannel({ name: '', icon: '📡' });
  };

  const removeChannel = (id: string) => {
    setChannels(channels.filter(c => c.id !== id || !c.isCustom));
  };

  const removeTemplate = (id: string) => {
    saveTemplates(customTemplates.filter(t => t.id !== id));
  };

  const installTemplate = (tpl: any) => {
    saveCampaigns([{ ...tpl, id: `c-t-${Date.now()}` }, ...campaigns]);
    setActiveTab('active');
  };

  const allTemplates = useMemo(() => [...customTemplates, ...CAMPAIGN_PRESETS], [customTemplates]);

  const activeCampaign = useMemo(() => campaigns.find(c => c.id === selectedCampaignId), [campaigns, selectedCampaignId]);

  if (selectedCampaignId && activeCampaign) {
      return (
        <CampaignDetailView 
            campaign={activeCampaign} 
            onBack={() => setSelectedCampaignId(null)} 
            onUpdate={(u) => handleUpdateCampaign(activeCampaign.id, u)}
        />
      );
  }

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-slate-50 animate-in fade-in relative">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Campaign Matrix</h2>
            <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
               {(['active', 'templates', 'channels'] as const).map(t => (
                 <button 
                  key={t} 
                  onClick={() => setActiveTab(t)} 
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {t === 'active' ? 'Live' : t === 'templates' ? 'Templates' : 'Channel Studio'}
                 </button>
               ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative">
                <input 
                  placeholder="Ask Gemini to build a campaign..." 
                  className="w-96 pl-6 pr-14 py-4 bg-white border-2 border-transparent focus:border-indigo-500 rounded-[1.8rem] text-xs font-bold shadow-xl outline-none transition-all"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                />
                <button onClick={handleAskAI} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                   {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>✨</span>}
                </button>
             </div>
             <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all active:scale-95"
             >
               ➕ New Strategy
             </button>
          </div>
        </div>

        {activeTab === 'active' && (
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifier</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Channel</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">State</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Performance</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-48">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map(c => (
                  <tr key={c.id} onClick={() => setSelectedCampaignId(c.id)} className="hover:bg-indigo-50/20 transition-all group cursor-pointer">
                    <td className="p-8 font-black text-slate-900 text-lg tracking-tight">
                       {renamingId === c.id ? (
                          <input 
                            autoFocus
                            className="bg-transparent border-b-2 border-indigo-500 outline-none w-full p-0 font-black text-lg text-slate-900 focus:ring-0"
                            value={c.name}
                            onChange={(e) => handleRenameCampaign(c.id, e.target.value)}
                            onBlur={() => setRenamingId(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setRenamingId(null)}
                            onClick={e => e.stopPropagation()}
                          />
                       ) : (
                          <div className="flex items-center group/name">
                             <span className="truncate">{c.name}</span>
                             <button 
                               onClick={(e) => { e.stopPropagation(); setRenamingId(c.id); }}
                               className="ml-3 opacity-0 group-hover/name:opacity-100 p-1.5 text-slate-400 hover:text-indigo-600 transition-all"
                               title="Edit Name"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                             </button>
                          </div>
                       )}
                    </td>
                    <td className="p-8">
                       <div className="flex items-center space-x-2">
                          <span className="text-xl">{channels.find(ch => ch.name === c.channel)?.icon || '📡'}</span>
                          <span className="font-bold text-slate-500 uppercase text-xs">{c.channel}</span>
                       </div>
                    </td>
                    <td className="p-8"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${c.status === 'Active' ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{c.status}</span></td>
                    <td className="p-8 font-black text-indigo-600 text-right">{(c.reach/1000).toFixed(1)}k Reach</td>
                    <td className="p-8 text-right">
                        <div className="flex justify-end items-center space-x-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setRenamingId(c.id); }} 
                                className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-400 rounded-xl transition-all shadow-sm flex items-center"
                            >
                                Edit Name
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleSaveAsTemplate(c); }} 
                                className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 hover:border-emerald-400 rounded-xl transition-all shadow-sm flex items-center"
                                title="Save as Template"
                            >
                                💾 Template
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {campaigns.length === 0 && (
              <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">No active campaigns in this sector.</div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in">
             {allTemplates.map(t => (
               <div key={t.id} className="bg-white border-2 border-slate-100 rounded-[3rem] p-12 space-y-8 hover:shadow-2xl transition-all group flex flex-col hover:border-indigo-500 relative">
                  <div className="flex justify-between items-start">
                     <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">📋</div>
                     <div className="flex flex-col items-end space-y-2">
                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg ${t.id.startsWith('tpl-') || t.id.startsWith('tp_') ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
                            {t.id.startsWith('tpl-') || t.id.startsWith('tp_') ? 'High Value Strategy' : 'Premium Strategy'}
                        </span>
                        {t.id.startsWith('tpl-') && (
                            <button onClick={() => removeTemplate(t.id)} className="text-[8px] font-black text-rose-500 hover:underline uppercase tracking-widest">Delete Template</button>
                        )}
                     </div>
                  </div>
                  <div className="flex-1">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t.name}</h3>
                     <p className="text-xs text-slate-400 font-medium leading-relaxed mt-4 italic">"{t.summary}"</p>
                  </div>
                  <button onClick={() => installTemplate(t)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 shadow-xl transition-all">Apply Strategy</button>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="space-y-12 animate-in fade-in">
             <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-2xl space-y-10">
                <div className="flex justify-between items-center">
                   <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">Channel Studio</h3>
                      <p className="text-slate-500 font-medium mt-1">Configure the delivery paths for your autonomous marketing engine.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {channels.map(chan => (
                     <div key={chan.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col items-center space-y-4 relative group">
                        <div className="text-4xl bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all">{chan.icon}</div>
                        <span className="font-black text-slate-800 uppercase text-[10px] tracking-widest">{chan.name}</span>
                        {chan.isCustom && (
                          <button 
                            onClick={() => removeChannel(chan.id)}
                            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                     </div>
                   ))}
                   
                   <form onSubmit={handleAddChannel} className="p-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col space-y-4 hover:border-indigo-400 transition-all bg-white/50">
                      <div className="flex space-x-2">
                         <input 
                           className="w-12 h-12 text-center bg-white border border-slate-100 rounded-xl text-xl shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none"
                           value={newChannel.icon}
                           onChange={e => setNewChannel({...newChannel, icon: e.target.value})}
                         />
                         <input 
                           placeholder="Channel Name"
                           className="flex-1 bg-white border border-slate-100 rounded-xl px-4 text-xs font-bold shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none"
                           value={newChannel.name}
                           onChange={e => setNewChannel({...newChannel, name: e.target.value})}
                         />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all"
                      >
                         Define Custom Path
                      </button>
                   </form>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Manual Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                       <Icons.Plus />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900">New Strategy</h3>
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Manual Campaign Entry</p>
                    </div>
                 </div>
                 <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              
              <form onSubmit={handleCreateManualCampaign} className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Campaign Identifier</label>
                    <input 
                      autoFocus
                      placeholder="e.g. Q1 Global Growth"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold shadow-inner outline-none transition-all"
                      value={newCampaign.name}
                      onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Active Channel</label>
                    <div className="grid grid-cols-2 gap-3">
                       {channels.map(ch => (
                         <button 
                           key={ch.id}
                           type="button"
                           onClick={() => setNewCampaign({...newCampaign, channel: ch.name})}
                           className={`p-4 rounded-2xl border-2 transition-all flex items-center space-x-3 ${newCampaign.channel === ch.name ? 'bg-indigo-50 border-indigo-600 shadow-md' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                         >
                            <span className="text-xl">{ch.icon}</span>
                            <span className="text-[10px] font-black uppercase text-slate-700">{ch.name}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Launch Date</label>
                    <input 
                      type="date"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold shadow-inner outline-none transition-all"
                      value={newCampaign.startDate}
                      onChange={e => setNewCampaign({...newCampaign, startDate: e.target.value})}
                    />
                 </div>

                 <button 
                  type="submit" 
                  className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all transform active:scale-95 mt-4"
                 >
                    Initialize Strategy
                 </button>
              </form>
           </div>
        </div>
      )}

      {showSaveSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest animate-in slide-in-from-top-4">
           ✨ Strategy saved as custom template
        </div>
      )}
    </div>
  );
};

export default CampaignManager;
