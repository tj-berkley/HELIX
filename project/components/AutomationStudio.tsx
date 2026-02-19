
import React, { useState, useRef, useMemo } from 'react';
import { Icons } from '../constants';
import { AutomationFlow, AutomationNode, WorkflowMaterial, Status } from '../types';
import { generateWorkflowFromPrompt, generateCampaignScript } from '../services/geminiService';

interface NodeTemplate {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  type: AutomationNode['type'];
  category: string;
}

const ALL_MARKETPLACE_NODES: { [key: string]: NodeTemplate[] } = {
  "Neural Triggers": [
    { id: 't_form', label: 'Form Submission', icon: '📝', color: 'bg-indigo-50 border-indigo-200 text-indigo-800', description: 'Triggered when a lead completes an portal form.', type: 'trigger', category: 'Web' },
    { id: 't_email', label: 'Inbound Email', icon: '📧', color: 'bg-blue-50 border-blue-200 text-blue-800', description: 'Activate on receiving an email with specific keywords.', type: 'trigger', category: 'Email' },
    { id: 't_dm', label: 'Social DM Trigger', icon: '💬', color: 'bg-pink-50 border-pink-200 text-pink-800', description: 'Trigger on direct messages from linked social profiles.', type: 'trigger', category: 'Social' },
    { id: 't_webinar', label: 'Webinar Registration', icon: '🛰️', color: 'bg-purple-50 border-purple-200 text-purple-800', description: 'Activate when a user signs up for a live session.', type: 'trigger', category: 'Webinar' },
    { id: 't_social', label: 'Social Mention', icon: '🌐', color: 'bg-sky-50 border-sky-200 text-sky-800', description: 'Trigger when your brand is tagged or mentioned.', type: 'trigger', category: 'Social' },
    { id: 't_whatsapp', label: 'WhatsApp Signal', icon: '🟢', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', description: 'Receive triggers via WhatsApp Business API.', type: 'trigger', category: 'Messaging' },
    { id: 't_telegram', label: 'Telegram Command', icon: '✈️', color: 'bg-sky-50 border-sky-200 text-sky-800', description: 'Activate on bot commands or channel messages.', type: 'trigger', category: 'Messaging' },
    { id: 't_call', label: 'Incoming Call', icon: '📞', color: 'bg-rose-50 border-rose-200 text-rose-800', description: 'Activate on inbound voice connection to agent.', type: 'trigger', category: 'Voice' },
    { id: 't_text', label: 'Incoming Text (SMS)', icon: '📱', color: 'bg-amber-50 border-amber-200 text-amber-800', description: 'Activate on keyword detection in SMS.', type: 'trigger', category: 'Telephony' },
    { id: 't_sheets', label: 'Sheets Row Update', icon: '📊', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', description: 'Trigger when a new row is detected in Google Sheets.', type: 'trigger', category: 'Data' },
  ],
  "Neural Logic & Action": [
    { id: 'l_if', label: 'If/Then Branch', icon: '💎', color: 'bg-purple-100 border-purple-300 text-purple-800', description: 'Conditional routing for flow paths.', type: 'logic', category: 'Flow' },
    { id: 'l_wait', label: 'Neural Wait', icon: '⏳', color: 'bg-amber-50 border-amber-200 text-amber-900', description: 'Introduce temporal delay between nodes.', type: 'logic', category: 'Timing' },
    { id: 'c_email', label: 'Dispatch Email', icon: '📧', color: 'bg-indigo-600 border-indigo-400 text-white', description: 'Send automated email using brand voice.', type: 'communication', category: 'Outreach' },
    { id: 'cr_logo', label: 'Logo Synthesis', icon: '✨', color: 'bg-indigo-900 border-indigo-700 text-white', description: 'Synthesize brand logo variations from brief.', type: 'creative', category: 'Branding' },
  ]
};

const FLOW_PRESETS: AutomationFlow[] = [
  {
    id: 'tpl_form',
    name: 'Lead Capture & Nurture',
    status: 'Draft',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Form Submission', icon: '📝', color: 'bg-indigo-50 border-indigo-200 text-indigo-700', description: 'Triggers when a landing page form is completed.', materials: [] },
      { id: 'n2', type: 'communication', label: 'Instant Welcome', icon: '📧', color: 'bg-indigo-600 text-white', description: 'Immediate personalized intro email.', materials: [] },
      { id: 'n3', type: 'logic', label: 'Wait 2 Days', icon: '⏳', color: 'bg-slate-100 text-slate-800', description: 'Wait before follow-up.', materials: [] },
      { id: 'n4', type: 'communication', label: 'Resource Pack', icon: '📦', color: 'bg-emerald-600 text-white', description: 'Send high-value asset.', materials: [] }
    ]
  },
  {
    id: 'tpl_email',
    name: 'Smart Email Router',
    status: 'Draft',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Inbound Email', icon: '📧', color: 'bg-blue-50 border-blue-200 text-blue-800', description: 'Activates on subject line keywords.', materials: [] },
      { id: 'n2', type: 'logic', label: 'Support VS Sales', icon: '💎', color: 'bg-purple-100 text-purple-900', description: 'Routing logic based on intent.', materials: [] },
      { id: 'n3', type: 'communication', label: 'Team Alert', icon: '🔔', color: 'bg-slate-900 text-white', description: 'Notify correct department.', materials: [] }
    ]
  },
  {
    id: 'tpl_dm',
    name: 'Social DM Auto-Responder',
    status: 'Draft',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'IG/LI DM Received', icon: '💬', color: 'bg-pink-50 border-pink-200 text-pink-800', description: 'New DM from linked profile.', materials: [] },
      { id: 'n2', type: 'communication', label: 'Booking Link Reply', icon: '🔗', color: 'bg-indigo-600 text-white', description: 'Instant reply with Calendly link.', materials: [] }
    ]
  },
  {
    id: 'tpl_webinar',
    name: 'Webinar Pre-Game Sync',
    status: 'Draft',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Webinar Opt-in', icon: '🛰️', color: 'bg-purple-50 border-purple-200 text-purple-800', description: 'New registration detected.', materials: [] },
      { id: 'n2', type: 'communication', label: 'Confirmation', icon: '✅', color: 'bg-emerald-600 text-white', description: 'Access token and calendar invite.', materials: [] },
      { id: 'n3', type: 'logic', label: 'Wait until 1h Before', icon: '⏳', color: 'bg-amber-100 text-amber-900', description: 'Last minute reminder sequence.', materials: [] }
    ]
  },
  {
    id: 'tpl_social',
    name: 'Social Media Pulse',
    status: 'Draft',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Brand Mention', icon: '🌐', color: 'bg-sky-50 border-sky-200 text-sky-800', description: 'Tagged or mentioned on X.', materials: [] },
      { id: 'n2', type: 'communication', label: 'Slack Warning', icon: '💬', color: 'bg-purple-600 text-white', description: 'Alert social team to engage.', materials: [] }
    ]
  },
  {
    id: 'tpl_whatsapp',
    name: 'WhatsApp Service Hub',
    status: 'Draft',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'WhatsApp Input', icon: '🟢', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', description: 'Incoming WhatsApp API signal.', materials: [] },
      { id: 'n2', type: 'communication', label: 'Neural AI Reply', icon: '🤖', color: 'bg-black text-white', description: 'Voice-grounded AI assistant response.', materials: [] }
    ]
  },
  {
    id: 'tpl_telegram',
    name: 'Telegram Ops Bot',
    status: 'Draft',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Dev Command', icon: '✈️', color: 'bg-sky-50 border-sky-200 text-sky-800', description: 'Bot command /deploy or /status.', materials: [] },
      { id: 'n2', type: 'communication', label: 'Status Report', icon: '📊', color: 'bg-blue-600 text-white', description: 'Generate and send metrics log.', materials: [] }
    ]
  },
  {
    id: 'tpl_call',
    name: 'Missed Call Fallback',
    status: 'Draft',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Inbound Call', icon: '📞', color: 'bg-rose-50 border-rose-200 text-rose-800', description: 'Activates if call is unanswered.', materials: [] },
      { id: 'n2', type: 'communication', label: 'Instant SMS', icon: '📱', color: 'bg-emerald-500 text-white', description: 'Text: "Sorry I missed you, use this link..."', materials: [] }
    ]
  },
  {
    id: 'tpl_text',
    name: 'SMS Keyword Matrix',
    status: 'Draft',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Incoming Text', icon: '📱', color: 'bg-amber-50 border-amber-200 text-amber-800', description: 'Triggers on keywords like "OFFER".', materials: [] },
      { id: 'n2', type: 'logic', label: 'Match Segment', icon: '🔍', color: 'bg-white border-slate-200 text-slate-800', description: 'Filter users by intent.', materials: [] },
      { id: 'n3', type: 'communication', label: 'Coupon Dispatch', icon: '🏷️', color: 'bg-rose-600 text-white', description: 'Send discount code via text.', materials: [] }
    ]
  },
  {
    id: 'tpl_sheets',
    name: 'Google Sheets Outreach',
    status: 'Draft',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Sheets Row Update', icon: '📊', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', description: 'New entry in Master Tracker Sheet.', materials: [] },
      { id: 'n2', type: 'communication', label: 'Sync to CRM', icon: '👥', color: 'bg-indigo-600 text-white', description: 'Update global contact profiles.', materials: [] },
      { id: 'n3', type: 'communication', label: 'Email Intro', icon: '📧', color: 'bg-slate-800 text-white', description: 'First touch email sequence.', materials: [] }
    ]
  }
];

const NODE_COLORS = [
  'bg-indigo-50 border-indigo-200 text-indigo-900',
  'bg-emerald-50 border-emerald-200 text-emerald-700',
  'bg-rose-50 border-rose-200 text-rose-800',
  'bg-amber-50 border-amber-200 text-amber-900',
  'bg-purple-50 border-purple-200 text-purple-800',
  'bg-indigo-600 border-indigo-400 text-white',
  'bg-rose-600 border-rose-400 text-white',
  'bg-slate-900 border-slate-700 text-white',
];

const TemplatePreviewModal: React.FC<{
  template: AutomationFlow;
  onClose: () => void;
  onDeploy: () => void;
}> = ({ template, onClose, onDeploy }) => {
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-indigo-50/20 dark:bg-indigo-950/20">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Blueprint Example</h3>
            <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-1">{template.name}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white dark:hover:bg-white/10 rounded-full text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-12 space-y-6 scrollbar-hide bg-slate-50/50 dark:bg-black/20">
          <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-4">Logic Flow Architecture (Read Only)</p>
          {template.nodes.map((node, idx) => (
            <div key={node.id} className="relative">
              <div className={`p-6 rounded-[2rem] border-2 bg-white dark:bg-slate-900 shadow-sm flex items-center space-x-6 ${node.color}`}>
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-2xl shadow-sm border border-black/5">
                  {node.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase tracking-tight">{node.label}</h4>
                  <p className="text-[10px] opacity-60 italic leading-snug line-clamp-1">{node.description}</p>
                </div>
              </div>
              {idx < template.nodes.length - 1 && (
                <div className="h-6 flex justify-center items-center">
                  <div className="w-0.5 h-full bg-slate-200 dark:bg-white/10"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-10 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 flex space-x-4">
           <button onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest">Close Example</button>
           <button onClick={onDeploy} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700">Deploy & Edit Blueprint</button>
        </div>
      </div>
    </div>
  );
};

const NodeEditModal: React.FC<{
  node: AutomationNode;
  onClose: () => void;
  onUpdate: (updates: Partial<AutomationNode>) => void;
}> = ({ node, onClose, onUpdate }) => {
  const [newMaterialName, setNewMaterialName] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const addMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialName.trim()) return;
    const newMaterial: WorkflowMaterial = {
      id: `mat-${Date.now()}`,
      name: newMaterialName.trim(),
      type: 'Asset'
    };
    onUpdate({ materials: [...(node.materials || []), newMaterial] });
    setNewMaterialName('');
  };

  const handleNeuralRemix = async () => {
    if (node.type !== 'communication') return;
    setIsSynthesizing(true);
    try {
      const voice = JSON.parse(localStorage.getItem('HOBBS_BRAND_VOICE') || '{}');
      const data = await generateCampaignScript(node.label, `Directive: ${node.description}. Current Content: ${node.config?.body || ''}`, voice);
      onUpdate({ config: { ...node.config, subject: data.subject, body: data.body } });
    } catch (e) { console.error(e); }
    finally { setIsSynthesizing(false); }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#1e293b] w-full max-w-4xl rounded-[4rem] shadow-[0_40px_120px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-12 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-indigo-50/30 dark:bg-indigo-950/20">
          <div className="flex items-center space-x-6">
            <div 
              onClick={() => logoInputRef.current?.click()}
              className="w-20 h-20 rounded-[2rem] bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-5xl border-2 border-dashed border-indigo-200 dark:border-indigo-500/20 cursor-pointer hover:border-indigo-500 transition-all overflow-hidden relative group"
            >
              {node.imageUrl ? (
                <img src={node.imageUrl} className="w-full h-full object-cover" alt="Node logo" />
              ) : (
                <span>{node.icon}</span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Logo</span>
              </div>
            </div>
            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
            <div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Edit Neural Node</h3>
              <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.4em] mt-1">{node.type} protocol activation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white dark:hover:bg-white/10 rounded-full text-slate-400 transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-12 lg:col-span-7 space-y-10">
              <section className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2">Mission Identifier (Label)</label>
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 rounded-3xl p-6 text-xl font-black text-slate-900 dark:text-white outline-none transition-all shadow-inner"
                  value={node.label}
                  onChange={e => onUpdate({ label: e.target.value })}
                  placeholder="e.g. Inbound Voice Filter"
                />
              </section>
              <section className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2">Neural Directive (Instructions)</label>
                <textarea 
                  className="w-full h-48 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 rounded-[2.5rem] p-8 text-sm font-medium text-slate-600 dark:text-slate-400 outline-none transition-all resize-none leading-relaxed shadow-inner"
                  value={node.description}
                  onChange={e => onUpdate({ description: e.target.value })}
                  placeholder="Define exactly how this node should behave..."
                />
              </section>
              {node.type === 'communication' && (
                <section className="space-y-6 animate-in slide-in-from-top-2 p-8 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-[3rem] border border-indigo-100 dark:border-indigo-500/10">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Asset Synthesis</label>
                      <button onClick={handleNeuralRemix} disabled={isSynthesizing} className={`text-[10px] font-black text-indigo-500 uppercase hover:underline ${isSynthesizing ? 'animate-pulse' : ''}`}>✨ Neural Remix</button>
                    </div>
                    <div className="space-y-4">
                      <input 
                        placeholder="Subject Line..." 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                        value={node.config?.subject || ''}
                        onChange={e => onUpdate({ config: { ...node.config, subject: e.target.value } })}
                      />
                      <textarea 
                        placeholder="Message content..." 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-xs font-medium text-slate-700 dark:text-slate-300 h-48 resize-none outline-none focus:ring-2 focus:ring-indigo-500"
                        value={node.config?.body || ''}
                        onChange={e => onUpdate({ config: { ...node.config, body: e.target.value } })}
                      />
                    </div>
                </section>
              )}
            </div>
            <div className="col-span-12 lg:col-span-5 space-y-10">
              <section className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2">Visual Signature</label>
                <div className="grid grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-[2rem] border border-slate-100 dark:border-white/5">
                  {NODE_COLORS.map(c => (
                    <button key={c} onClick={() => onUpdate({ color: c })} className={`h-12 rounded-xl border-2 transition-all transform hover:scale-110 ${node.color === c ? 'border-indigo-600 ring-4 ring-indigo-500/20 scale-110' : 'border-transparent opacity-60 hover:opacity-100'} ${c.split(' ')[0]}`} />
                  ))}
                </div>
              </section>
              <section className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Inbound Assets</label>
                  <span className="text-[10px] font-black text-indigo-400 uppercase">{node.materials?.length || 0} Synced</span>
                </div>
                <div className="space-y-3">
                  {node.materials?.map(mat => (
                    <div key={mat.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-2xl group transition-all hover:border-indigo-200">
                        <div className="flex items-center space-x-4">
                          <span className="text-xl">📄</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate w-32">{mat.name}</span>
                        </div>
                        <button onClick={() => onUpdate({ materials: (node.materials || []).filter(m => m.id !== mat.id) })} className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                  ))}
                  <form onSubmit={addMaterial} className="flex space-x-3 mt-4">
                      <input placeholder="Attach link/doc..." className="flex-1 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 rounded-2xl px-5 text-sm font-bold h-16 text-slate-900 dark:text-white outline-none transition-all shadow-inner" value={newMaterialName} onChange={e => setNewMaterialName(e.target.value)} />
                      <button type="submit" className="w-16 h-16 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-black active:scale-95 transition-all">
                        <Icons.Plus className="w-6 h-6" />
                      </button>
                  </form>
                </div>
              </section>
            </div>
          </div>
        </div>
        <div className="p-12 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/40 flex justify-end">
           <button onClick={onClose} className="px-16 py-6 bg-slate-900 dark:bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.3em] shadow-2xl hover:bg-black dark:hover:bg-indigo-700 active:scale-95 transition-all">Synchronize Parameters</button>
        </div>
      </div>
    </div>
  );
};

const AutomationStudio: React.FC = () => {
  const [flows, setFlows] = useState<AutomationFlow[]>(() => {
    const saved = localStorage.getItem('OMNI_AUTOMATION_FLOWS_V3');
    return saved ? JSON.parse(saved) : [FLOW_PRESETS[0]];
  });
  const [activeId, setActiveId] = useState(flows[0]?.id || '');
  const [view, setView] = useState<'canvas' | 'templates' | 'marketplace'>('canvas');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<AutomationFlow | null>(null);

  const activeFlow = useMemo(() => flows.find(f => f.id === activeId) || flows[0], [flows, activeId]);
  const editingNode = useMemo(() => activeFlow?.nodes.find(n => n.id === selectedNodeId) || null, [activeFlow, selectedNodeId]);

  const saveFlows = (updated: AutomationFlow[]) => {
    setFlows(updated);
    localStorage.setItem('OMNI_AUTOMATION_FLOWS_V3', JSON.stringify(updated));
  };

  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const data = await generateWorkflowFromPrompt(aiPrompt);
      const id = `f-ai-${Date.now()}`;
      const newF: AutomationFlow = {
        id,
        name: data.name || 'AI Designed Flow',
        status: 'Draft',
        nodes: data.nodes.map((n: any, i: number) => ({ id: `n-${i}-${Date.now()}`, ...n, materials: [] }))
      };
      const nextFlows = [newF, ...flows];
      saveFlows(nextFlows);
      setActiveId(id);
      setView('canvas');
      setAiPrompt('');
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const spawnFromTemplate = (template: AutomationFlow) => {
    const id = `f-tpl-${Date.now()}`;
    const newF: AutomationFlow = {
      ...template,
      id,
      name: `${template.name} (Live)`,
      status: 'Draft',
      nodes: template.nodes.map((n, i) => ({ ...n, id: `n-${i}-${Date.now()}` }))
    };
    const nextFlows = [newF, ...flows];
    saveFlows(nextFlows);
    setActiveId(id);
    setView('canvas');
    setPreviewTemplate(null);
  };

  const handleNewFlow = () => {
    const id = `f-new-${Date.now()}`;
    const newF: AutomationFlow = {
      id,
      name: 'New Sequence Matrix',
      status: 'Draft',
      nodes: [{ id: `n-init-${Date.now()}`, type: 'trigger', label: 'Inception Event', icon: '⚡', color: 'bg-indigo-600 border-indigo-400 text-white', description: 'The genesis of your sequence.', materials: [] }]
    };
    const nextFlows = [newF, ...flows];
    saveFlows(nextFlows);
    setActiveId(id);
    setView('canvas');
  };

  const deleteFlow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Permanently dissolve this pathway and all associated node intelligence?")) {
      const nextFlows = flows.filter(f => f.id !== id);
      saveFlows(nextFlows);
      if (activeId === id) {
        setActiveId(nextFlows[0]?.id || '');
      }
    }
  };

  const addMarketNode = (tpl: NodeTemplate) => {
    const node: AutomationNode = { id: `n-${Date.now()}`, ...tpl, materials: [] };
    const updated = flows.map(f => f.id === activeId ? { ...f, nodes: [...f.nodes, node] } : f);
    saveFlows(updated);
    setView('canvas');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8faff] dark:bg-[#0c0e12] overflow-hidden transition-colors">
      <div className="p-8 bg-white dark:bg-[#0c0e12] border-b border-slate-100 dark:border-white/5 flex justify-between items-center shrink-0 z-[100] shadow-sm">
        <div className="flex items-center space-x-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Automation Studio</h2>
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border dark:border-white/5 shadow-inner">
             {(['canvas', 'templates', 'marketplace'] as const).map(v => (
               <button key={v} onClick={() => setView(v)} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'}`}>{v === 'canvas' ? 'Orchestration' : v.charAt(0).toUpperCase() + v.slice(1)}</button>
             ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <div className="relative">
              <input 
                placeholder="Describe a neural mission pathway..." 
                className="w-96 pl-6 pr-14 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 rounded-2xl text-xs font-bold dark:text-white outline-none transition-all shadow-inner"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskAI()}
              />
              <button onClick={handleAskAI} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-black shadow-lg hover:scale-110 active:scale-95 transition-all">
                 {isGenerating ? <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div> : <span>✨</span>}
              </button>
           </div>
           <button onClick={handleNewFlow} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-900/40 hover:bg-indigo-700 active:scale-95 transition-all">➕ New Matrix</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {view === 'canvas' && activeFlow ? (
          <>
            <div className="w-72 border-r border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c0e12] p-6 space-y-6 shrink-0 overflow-y-auto scrollbar-hide">
               <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2">Saved Pathways</h3>
               <div className="space-y-2">
                 {flows.map(f => (
                   <div 
                    key={f.id} 
                    className={`group/f relative w-full text-left p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${activeId === f.id ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-xl' : 'bg-white dark:bg-transparent border-slate-50 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/20'}`} 
                    onClick={() => setActiveId(f.id)}
                   >
                      <div className="flex justify-between items-start">
                         <p className={`font-black text-sm truncate uppercase tracking-tight ${activeId === f.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-200'}`}>{f.name}</p>
                         <button 
                          onClick={(e) => deleteFlow(f.id, e)} 
                          className="p-1 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover/f:opacity-100"
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase mt-1 block tracking-widest">{f.nodes.length} Neural Step{f.nodes.length !== 1 ? 's' : ''}</span>
                   </div>
                 ))}
               </div>
            </div>
            <div className="flex-1 overflow-auto p-20 pattern-grid-light dark:pattern-grid-dark relative transition-colors">
               <div className="max-w-4xl mx-auto space-y-12 pb-60">
                 <div className="flex items-center justify-between mb-16 px-4">
                    <div>
                       <h4 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{activeFlow.name}</h4>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Sequence Orchestration Canvas</p>
                    </div>
                    <div className="flex space-x-3">
                       <button className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFlow.status === 'Active' ? 'bg-emerald-600 text-white shadow-2xl' : 'bg-white dark:bg-white/5 text-slate-400 border border-slate-100 dark:border-white/10 shadow-sm'}`} onClick={() => saveFlows(flows.map(f => f.id === activeId ? { ...f, status: f.status === 'Active' ? 'Paused' : 'Active' } : f))}>
                          {activeFlow.status === 'Active' ? 'System Running' : 'Activate Sequence'}
                       </button>
                    </div>
                 </div>
                 {activeFlow.nodes.map((node, idx) => (
                   <React.Fragment key={node.id}>
                     <div 
                       className={`relative p-12 rounded-[4rem] border-2 bg-white dark:bg-slate-900/80 backdrop-blur-md shadow-2xl group transition-all transform hover:-translate-y-2 cursor-pointer ${node.color} ${selectedNodeId === node.id ? 'ring-[12px] ring-indigo-500/20 border-indigo-500 scale-105' : 'border-slate-50 dark:border-white/5'}`} 
                       onClick={() => setSelectedNodeId(node.id)}
                     >
                        <div className="flex items-center space-x-12">
                           <div className="w-32 h-32 rounded-[3rem] bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center text-6xl shrink-0 group-hover:scale-110 transition-transform duration-500 overflow-hidden relative border border-white/10">
                              {node.imageUrl ? (
                                <img src={node.imageUrl} className="w-full h-full object-cover" alt="logo" />
                              ) : (
                                <span>{node.icon}</span>
                              )}
                           </div>
                           <div className="flex-1 min-w-0 space-y-4">
                              <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{node.label}</h4>
                              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium line-clamp-2 italic leading-relaxed">"{node.description}"</p>
                              <div className="flex space-x-2 pt-2">
                                 {node.materials?.map(m => <span key={m.id} className="w-1.5 h-1.5 rounded-full bg-indigo-500/40"></span>)}
                              </div>
                           </div>
                        </div>
                        {selectedNodeId === node.id && (
                           <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-black shadow-2xl border-4 border-white animate-bounce">✎</div>
                        )}
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if(confirm("Purge this logic node?")) {
                              saveFlows(flows.map(f => f.id === activeId ? { ...f, nodes: f.nodes.filter(n => n.id !== node.id) } : f)); 
                            }
                          }}
                          className="absolute top-8 right-8 p-3 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                     </div>
                     {idx < activeFlow.nodes.length - 1 && (
                        <div className="flex justify-center h-24 items-center">
                           <div className="w-2 h-full bg-gradient-to-b from-indigo-500/20 to-transparent dark:from-white/10 rounded-full"></div>
                        </div>
                     )}
                   </React.Fragment>
                 ))}
                 <button onClick={() => setView('marketplace')} className="w-full py-32 border-4 border-dashed border-slate-200 dark:border-white/10 rounded-[5rem] text-slate-300 dark:text-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-900 transition-all flex flex-col items-center justify-center space-y-8 group shadow-inner">
                    <div className="w-20 h-20 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all shadow-xl">
                       <span className="text-4xl font-black">+</span>
                    </div>
                    <span className="text-sm font-black uppercase tracking-[0.5em]">Append Neural Step</span>
                 </button>
               </div>
            </div>
            {editingNode && (
              <NodeEditModal 
                node={editingNode} 
                onClose={() => setSelectedNodeId(null)} 
                onUpdate={(u) => {
                  const updated = flows.map(f => f.id === activeId ? { ...f, nodes: f.nodes.map(n => n.id === editingNode.id ? { ...n, ...u } : n) } : f);
                  saveFlows(updated);
                }} 
              />
            )}
          </>
        ) : view === 'templates' ? (
          <div className="flex-1 p-12 overflow-y-auto bg-white dark:bg-[#0c0e12] transition-colors">
            <div className="max-w-7xl mx-auto space-y-24 pb-40">
              <div className="space-y-4">
                 <h3 className="text-7xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Pathway Blueprints</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-medium text-2xl italic max-w-2xl">Explore internal logic examples or deploy pre-configured mission matrixes to your saved pathways.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 {FLOW_PRESETS.map(tpl => (
                   <div key={tpl.id} className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-[4rem] p-10 flex flex-col space-y-8 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:border-indigo-500/30 transition-all shadow-sm group">
                      <div className="flex justify-between items-start">
                         <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform duration-700">
                            {tpl.nodes[0]?.icon || '⚡'}
                         </div>
                         <span className="text-[10px] font-black bg-slate-50 dark:bg-black/40 text-slate-400 dark:text-slate-500 px-5 py-2 rounded-full uppercase tracking-widest border border-slate-100 dark:border-white/5">{tpl.nodes.length} Stages</span>
                      </div>
                      <div className="flex-1 space-y-3">
                         <h5 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight">{tpl.name}</h5>
                         <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-3 leading-relaxed italic pr-2">Pre-engineered logic chain triggered by {tpl.nodes[0]?.label}.</p>
                      </div>
                      <div className="flex flex-col space-y-3">
                        <button onClick={() => setPreviewTemplate(tpl)} className="w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-white/10 transition-all">View Logic Examples</button>
                        <button onClick={() => spawnFromTemplate(tpl)} className="w-full py-6 bg-slate-900 dark:bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black dark:hover:bg-indigo-700 transition-all active:scale-95 transform">Deploy Blueprint</button>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
            {previewTemplate && (
              <TemplatePreviewModal 
                template={previewTemplate} 
                onClose={() => setPreviewTemplate(null)} 
                onDeploy={() => spawnFromTemplate(previewTemplate)} 
              />
            )}
          </div>
        ) : view === 'marketplace' ? (
          <div className="flex-1 p-12 overflow-y-auto bg-white dark:bg-[#0c0e12] transition-colors">
             <div className="max-w-7xl mx-auto space-y-24 pb-40">
                <div className="space-y-4">
                   <h3 className="text-7xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Blueprint Market</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-medium text-2xl italic max-w-2xl">Deploy individual enterprise-grade neural triggers and automated communication nodes to your active canvas.</p>
                </div>
                {Object.entries(ALL_MARKETPLACE_NODES).map(([cat, items]) => (
                  <div key={cat} className="space-y-12">
                     <div className="flex items-center space-x-6">
                        <div className="w-2 h-12 bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)]"></div>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{cat}</h4>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {items.map(tpl => (
                           <div key={tpl.id} className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-[4rem] p-10 flex flex-col space-y-8 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:border-indigo-500/30 transition-all shadow-sm group">
                              <div className="flex justify-between items-start">
                                 <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform duration-700 ${tpl.color.split(' ')[0]} ${tpl.color.includes('white') ? 'bg-indigo-600' : ''}`}>
                                    {tpl.icon}
                                 </div>
                                 <span className="text-[10px] font-black bg-slate-50 dark:bg-black/40 text-slate-400 dark:text-slate-500 px-5 py-2 rounded-full uppercase tracking-widest border border-slate-100 dark:border-white/5">{tpl.category}</span>
                              </div>
                              <div className="flex-1 space-y-3">
                                 <h5 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight">{tpl.label}</h5>
                                 <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-3 leading-relaxed italic pr-2">"{tpl.description}"</p>
                              </div>
                              <button onClick={() => addMarketNode(tpl)} className="w-full py-6 bg-slate-900 dark:bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black dark:hover:bg-indigo-700 transition-all active:scale-95 transform">Deploy Protocol</button>
                           </div>
                        ))}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-30">
            <span className="text-9xl mb-8">🏗️</span>
            <p className="text-2xl font-black uppercase tracking-[0.4em]">Initialize Flow to Begin</p>
            <button onClick={handleNewFlow} className="mt-8 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase">Create First Flow</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomationStudio;
