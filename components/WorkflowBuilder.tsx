
import React, { useState, useRef, useMemo } from 'react';
import { Icons } from '../constants';
import { WorkflowNode, WorkflowMaterial, Workflow } from '../types';
import { generateWorkflowFromPrompt } from '../services/geminiService';

interface NodeTemplate {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  category: string;
  setupGuide: { steps: string[]; link: string; infoNeeded: string; };
}

const ALL_MARKETPLACE_NODES: { [key: string]: NodeTemplate[] } = {
  "Core Logic & Data": [
    { id: 'if', label: 'If', icon: '💎', color: 'bg-purple-100 border-purple-300 text-purple-800', description: 'Conditional logic to control workflow paths.', category: 'Logic', setupGuide: { steps: ['Define logic key', 'Choose operator', 'Set value'], link: '#', infoNeeded: 'Logic Path' } },
    { id: 'function', label: 'Function', icon: '⚡', color: 'bg-amber-50 border-amber-200 text-amber-900', description: 'Execute custom JavaScript code for advanced logic.', category: 'Logic', setupGuide: { steps: ['Open script editor', 'Write async main function', 'Return valid JSON'], link: '#', infoNeeded: 'JS Code' } },
    { id: 'set', label: 'Set', icon: '📍', color: 'bg-slate-100 border-slate-300 text-slate-800', description: 'Set or modify data in the workflow.', category: 'Logic', setupGuide: { steps: ['Define variable key', 'Map value from input'], link: '#', infoNeeded: 'Variables' } },
    { id: 'mysql', label: 'MySQL', icon: '💾', color: 'bg-blue-100 border-blue-300 text-blue-800', description: 'Interact with MySQL databases for data management.', category: 'Data', setupGuide: { steps: ['Connect host', 'Add SQL Query', 'Map results'], link: '#', infoNeeded: 'Credentials' } },
    { id: 'command', label: 'Execute Command', icon: '🐚', color: 'bg-slate-800 border-slate-900 text-white', description: 'Run shell commands on the server.', category: 'Dev', setupGuide: { steps: ['Define script path', 'Set working dir'], link: '#', infoNeeded: 'Env Access' } },
    { id: 'http', label: 'HTTP Request', icon: '🌐', color: 'bg-indigo-50 border-indigo-200 text-indigo-900', description: 'Make API calls to external services.', category: 'Utils', setupGuide: { steps: ['URL', 'Method', 'Headers'], link: '#', infoNeeded: 'Endpoint' } },
    { id: 'webhook', label: 'Webhook', icon: '🔌', color: 'bg-amber-100 border-amber-300 text-amber-900', description: 'Receive data from external sources via webhooks.', category: 'Utils', setupGuide: { steps: ['Copy URL', 'Paste in provider'], link: '#', infoNeeded: 'JSON Schema' } },
  ],
  "Google Workspace": [
    { id: 'sheets', label: 'Google Sheets', icon: '📊', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', description: 'Read and write data to Google Sheets.', category: 'Google', setupGuide: { steps: ['Sheet ID', 'Tab name', 'Range'], link: '#', infoNeeded: 'OAuth' } },
    { id: 'drive', label: 'Google Drive', icon: '📁', color: 'bg-amber-50 border-amber-200 text-amber-800', description: 'Manage files and folders in Google Drive.', category: 'Google', setupGuide: { steps: ['Folder ID'], link: '#', infoNeeded: 'OAuth' } },
    { id: 'calendar', label: 'Google Calendar', icon: '📅', color: 'bg-blue-50 border-blue-200 text-blue-800', description: 'Create and manage calendar events.', category: 'Google', setupGuide: { steps: ['Calendar ID'], link: '#', infoNeeded: 'OAuth' } },
    { id: 'gmail', label: 'Gmail', icon: '💌', color: 'bg-rose-50 border-rose-200 text-rose-800', description: 'Send and receive emails through Gmail.', category: 'Google', setupGuide: { steps: ['OAuth Link'], link: '#', infoNeeded: 'Scope' } },
    { id: 'forms', label: 'Google Forms', icon: '📝', color: 'bg-purple-50 border-purple-200 text-purple-800', description: 'Collect responses through Google Forms.', category: 'Google', setupGuide: { steps: ['Form ID'], link: '#', infoNeeded: 'OAuth' } },
    { id: 'docs', label: 'Google Docs', icon: '📄', color: 'bg-blue-100 border-blue-200 text-blue-900', description: 'Access and edit Google Documents.', category: 'Google', setupGuide: { steps: ['Doc ID'], link: '#', infoNeeded: 'OAuth' } },
    { id: 'slides', label: 'Google Slides', icon: '📙', color: 'bg-orange-100 border-orange-200 text-orange-900', description: 'Automate slide generation.', category: 'Google', setupGuide: { steps: ['Presentation ID'], link: '#', infoNeeded: 'OAuth' } },
    { id: 'contacts', label: 'Google Contacts', icon: '👥', color: 'bg-indigo-100 border-indigo-200 text-indigo-900', description: 'Manage contacts stored in Google.', category: 'Google', setupGuide: { steps: ['Contacts sync'], link: '#', infoNeeded: 'OAuth' } },
    { id: 'analytics', label: 'Google Analytics', icon: '📈', color: 'bg-orange-50 border-orange-300 text-orange-800', description: 'Access and analyze website traffic data.', category: 'Google', setupGuide: { steps: ['Property ID'], link: '#', infoNeeded: 'Key' } },
    { id: 'ads', label: 'Google Ads', icon: '💰', color: 'bg-emerald-100 border-emerald-300 text-emerald-900', description: 'Manage advertising campaigns on Google Ads.', category: 'Google', setupGuide: { steps: ['Account ID'], link: '#', infoNeeded: 'OAuth' } },
    { id: 'maps', label: 'Google Maps', icon: '🗺️', color: 'bg-rose-100 border-rose-300 text-rose-900', description: 'Integrate mapping and location services.', category: 'Google', setupGuide: { steps: ['API Key'], link: '#', infoNeeded: 'Key' } },
    { id: 'tasks', label: 'Google Tasks', icon: '✅', color: 'bg-sky-50 border-sky-200 text-sky-800', description: 'Manage tasks and to-do lists.', category: 'Google', setupGuide: { steps: ['List ID'], link: '#', infoNeeded: 'OAuth' } },
    { id: 'storage', label: 'Google Cloud Storage', icon: '☁️', color: 'bg-blue-600 border-blue-400 text-white', description: 'Store and retrieve data in Google Cloud.', category: 'Google', setupGuide: { steps: ['Bucket name'], link: '#', infoNeeded: 'Auth' } },
  ],
  "Marketing & Productivity": [
    { id: 'slack', label: 'Slack', icon: '💬', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', description: 'Send messages and notifications to Slack.', category: 'Comm', setupGuide: { steps: ['Webhook URL'], link: '#', infoNeeded: 'App Key' } },
    { id: 'email_gen', label: 'Email', icon: '📧', color: 'bg-indigo-50 border-indigo-200 text-indigo-800', description: 'Send/receive through various providers.', category: 'Comm', setupGuide: { steps: ['SMTP Host'], link: '#', infoNeeded: 'Host' } },
    { id: 'trello', label: 'Trello', icon: '📋', color: 'bg-blue-100 border-blue-200 text-blue-800', description: 'Create and manage Trello cards and boards.', category: 'Apps', setupGuide: { steps: ['Board Token'], link: '#', infoNeeded: 'Auth' } },
    { id: 'salesforce', label: 'Salesforce', icon: '☁️', color: 'bg-sky-100 border-sky-200 text-sky-800', description: 'Manage leads and contacts in Salesforce.', category: 'Apps', setupGuide: { steps: ['Instance URL'], link: '#', infoNeeded: 'Auth' } },
    { id: 'mailchimp', label: 'Mailchimp', icon: '🐒', color: 'bg-amber-100 border-amber-200 text-amber-900', description: 'Automate email campaigns with Mailchimp.', category: 'Apps', setupGuide: { steps: ['API Key'], link: '#', infoNeeded: 'Key' } },
    { id: 'sendfox', label: 'Sendfox', icon: '🦊', color: 'bg-orange-100 border-orange-200 text-orange-900', description: 'Automate email marketing with Sendfox.', category: 'Apps', setupGuide: { steps: ['Token'], link: '#', infoNeeded: 'Key' } },
    { id: 'shopify', label: 'Shopify', icon: '🛒', color: 'bg-emerald-100 border-emerald-200 text-emerald-900', description: 'Manage e-commerce tasks and orders.', category: 'Apps', setupGuide: { steps: ['Store URL'], link: '#', infoNeeded: 'Auth' } },
    { id: 'typeform', label: 'Typeform', icon: '📝', color: 'bg-slate-900 border-slate-700 text-white', description: 'Collect responses and data from surveys.', category: 'Apps', setupGuide: { steps: ['Token'], link: '#', infoNeeded: 'Auth' } },
    { id: 'formly', label: 'Formly', icon: '🔗', color: 'bg-indigo-600 border-indigo-400 text-white', description: 'Sync with getformly.app forms.', category: 'Apps', setupGuide: { steps: ['API ID'], link: 'https://getformly.app', infoNeeded: 'Auth' } },
    { id: 'github', label: 'GitHub', icon: '🐙', color: 'bg-slate-50 border-slate-200 text-slate-800', description: 'Manage repos and automation.', category: 'Apps', setupGuide: { steps: ['Repo name'], link: '#', infoNeeded: 'Auth' } },
  ],
  "AI Agents": [
    { id: 'ai_assistant', label: 'AI Assistant', icon: '🧠', color: 'bg-indigo-600 border-indigo-400 text-white', description: 'Conversational agent to solve tasks and route data.', category: 'AI', setupGuide: { steps: ['Select identity', 'Set budget'], link: '#', infoNeeded: 'Key' } },
  ]
};

const WORKFLOW_PRESETS: Workflow[] = [
  {
    id: 'tp_webinar_conv',
    name: 'Webinar High-Intent Closer',
    status: 'Draft',
    nodes: [
      { id: 'w1', type: 'trigger', label: 'Webinar Exit Detection', icon: '📡', color: 'bg-indigo-100 border-indigo-300 text-indigo-800', description: 'Portal detects user stayed > 90% of duration.', apiConnected: true, mcpEnabled: false, materials: [] },
      { id: 'w2', type: 'action', label: 'Neural Intel Scan', icon: '✨', color: 'bg-purple-600 border-purple-400 text-white', description: 'Gemini extracts custom values and terms from transcript relevant to user.', apiConnected: true, mcpEnabled: false, materials: [] },
      { id: 'w3', type: 'action', label: 'Auto-Invoicing', icon: '💰', color: 'bg-emerald-50 border-emerald-300 text-emerald-800', description: 'Generate invoice based on discussed terms.', apiConnected: true, mcpEnabled: false, materials: [] },
      { id: 'w4', type: 'action', label: 'WhatsApp Broadcast', icon: '💬', color: 'bg-green-100 border-green-300 text-green-800', description: 'Send personal follow up with payment link.', apiConnected: true, mcpEnabled: false, materials: [] },
    ]
  },
  {
    id: 'tp1',
    name: 'AI Voice Concierge',
    status: 'Draft',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Inbound Call', icon: '📞', color: 'bg-rose-100 border-rose-300 text-rose-800', description: 'Voice call comes in.', apiConnected: true, mcpEnabled: false, materials: [] },
      { id: 'n2', type: 'action', label: 'AI Assistant', icon: '🧠', color: 'bg-indigo-600 border-indigo-400 text-white', description: 'Communicate with customer, understand intent, answer questions, schedule appointment.', apiConnected: true, mcpEnabled: false, materials: [] },
      { id: 'n3', type: 'action', label: 'Google Calendar', icon: '📅', color: 'bg-blue-100 border-blue-200 text-blue-800', description: 'Schedule meeting if requested.', apiConnected: true, mcpEnabled: false, materials: [] },
      { id: 'n4', type: 'action', label: 'Gmail', icon: '📧', color: 'bg-rose-100 border-rose-300 text-rose-800', description: 'Send follow-up email.', apiConnected: true, mcpEnabled: false, materials: [] },
    ]
  },
  {
    id: 'tp2',
    name: 'Automated Lead Extraction',
    status: 'Draft',
    nodes: [
      { id: 'le1', type: 'trigger', label: 'Webhook', icon: '🔌', color: 'bg-amber-100 border-amber-300 text-amber-800', description: 'Receive lead from Typeform.', apiConnected: true, mcpEnabled: false, materials: [] },
      { id: 'le2', type: 'action', label: 'AI Assistant', icon: '🧠', color: 'bg-indigo-600 border-indigo-400 text-white', description: 'Analyze responses and extract custom values.', apiConnected: true, mcpEnabled: false, materials: [] },
      { id: 'le3', type: 'action', label: 'Salesforce', icon: '☁️', color: 'bg-sky-50 border-sky-300 text-sky-800', description: 'Sync lead to CRM.', apiConnected: true, mcpEnabled: false, materials: [] },
    ]
  }
];

const NodeEditorModal: React.FC<{
  node: WorkflowNode;
  onClose: () => void;
  onUpdate: (updates: Partial<WorkflowNode>) => void;
}> = ({ node, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'guide'>('config');
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className={`p-10 border-b border-slate-100 flex justify-between items-center ${node.color.split(' ')[0]} bg-opacity-10`}>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-4xl">{node.icon}</div>
            <div>
              <h3 className="text-3xl font-black text-slate-900">{node.label}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{node.type} node</p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-2xl">
             {['config', 'guide'].map(t => (
               <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}>{t}</button>
             ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-12 space-y-8">
           {activeTab === 'config' ? (
             <div className="space-y-6">
               <textarea className="w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none text-sm font-medium" placeholder="Node specific logic..." value={node.description} onChange={e => onUpdate({ description: e.target.value })} />
               <div className="p-6 border border-slate-100 rounded-2xl bg-indigo-50/30">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Connection Config</p>
                  <input className="w-full bg-white p-4 rounded-xl border border-slate-200 text-xs font-mono" placeholder="API Endpoint / Connection String..." />
               </div>
             </div>
           ) : (
             <div className="space-y-4">
                <h4 className="font-black text-slate-800">Quick Setup</h4>
                <p className="text-sm text-slate-500">Provide the required authentication and parameters in the Config tab to activate this pathway.</p>
             </div>
           )}
        </div>
        <div className="p-8 border-t border-slate-100 flex justify-end space-x-4">
           <button onClick={onClose} className="px-10 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-200 transition-all">Cancel</button>
           <button onClick={onClose} className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-indigo-700 transition-all">Confirm & Close</button>
        </div>
      </div>
    </div>
  );
};

const WorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    const saved = localStorage.getItem('OMNI_WORKFLOWS_V5');
    return saved ? JSON.parse(saved) : [WORKFLOW_PRESETS[0]];
  });
  const [customTemplates, setCustomTemplates] = useState<Workflow[]>(() => {
    const saved = localStorage.getItem('OMNI_WORKFLOW_TEMPLATES_V1');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeId, setActiveId] = useState(workflows[0].id);
  const [view, setView] = useState<'canvas' | 'templates' | 'marketplace'>('canvas');
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuickConfig, setShowQuickConfig] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const activeWorkflow = useMemo(() => workflows.find(w => w.id === activeId) || workflows[0], [workflows, activeId]);

  const saveWorkflows = (updated: Workflow[]) => {
    setWorkflows(updated);
    localStorage.setItem('OMNI_WORKFLOWS_V5', JSON.stringify(updated));
  };

  const saveTemplates = (updated: Workflow[]) => {
    setCustomTemplates(updated);
    localStorage.setItem('OMNI_WORKFLOW_TEMPLATES_V1', JSON.stringify(updated));
  };

  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const data = await generateWorkflowFromPrompt(aiPrompt);
      const id = `w-ai-${Date.now()}`;
      const newW: Workflow = {
        id,
        name: data.name || 'AI Designed Flow',
        status: 'Draft',
        nodes: data.nodes.map((n: any, i: number) => ({ id: `n-${i}-${Date.now()}`, ...n, apiConnected: false, mcpEnabled: false, materials: [] }))
      };
      saveWorkflows([newW, ...workflows]);
      setActiveId(id);
      setView('canvas');
      setAiPrompt('');
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const handleNewFlow = () => {
    const id = `w-new-${Date.now()}`;
    const newW: Workflow = {
      id,
      name: 'Untitled Pipeline',
      status: 'Draft',
      nodes: [
        { 
          id: `n-init-${Date.now()}`, 
          type: 'trigger', 
          label: 'Manual Trigger', 
          icon: '🖱️', 
          color: 'bg-slate-100 border-slate-300 text-slate-800', 
          description: 'Initiate this workflow with a manual click or event.', 
          apiConnected: false, 
          mcpEnabled: false, 
          materials: [] 
        }
      ]
    };
    saveWorkflows([newW, ...workflows]);
    setActiveId(id);
    setView('canvas');
  };

  const handleSaveAsTemplate = () => {
    const template: Workflow = {
      ...activeWorkflow,
      id: `tpl-${Date.now()}`,
      status: 'Draft'
    };
    saveTemplates([template, ...customTemplates]);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const applyTemplate = (tpl: Workflow) => {
    const newW = { ...tpl, id: `w-t-${Date.now()}`, status: 'Draft' as const };
    saveWorkflows([newW, ...workflows]);
    setActiveId(newW.id);
    setView('canvas');
  };

  const deleteTemplate = (id: string) => {
    saveTemplates(customTemplates.filter(t => t.id !== id));
  };

  const addMarketNode = (tpl: NodeTemplate) => {
    const node: WorkflowNode = { id: `n-${Date.now()}`, type: 'action', label: tpl.label, icon: tpl.icon, color: tpl.color, description: tpl.description, apiConnected: false, mcpEnabled: false, materials: [] };
    const updated = workflows.map(w => w.id === activeId ? { ...w, nodes: [...w.nodes, node] } : w);
    saveWorkflows(updated);
    setView('canvas');
    setShowQuickConfig(null);
  };

  const updateNodeTemplate = (nodeId: string, tpl: NodeTemplate) => {
    const updated = workflows.map(w => w.id === activeId ? { ...w, nodes: w.nodes.map(n => n.id === nodeId ? { ...n, label: tpl.label, icon: tpl.icon, color: tpl.color, description: tpl.description } : n) } : w);
    saveWorkflows(updated);
    setShowQuickConfig(null);
  };

  const handleRenameWorkflow = (id: string, newName: string) => {
    const updated = workflows.map(w => w.id === id ? { ...w, name: newName } : w);
    saveWorkflows(updated);
  };

  const allTemplates = useMemo(() => [...customTemplates, ...WORKFLOW_PRESETS], [customTemplates]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8faff] overflow-hidden">
      <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 z-[100] shadow-sm">
        <div className="flex items-center space-x-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Workflow Architect</h2>
          <div className="flex bg-slate-100 p-1 rounded-2xl">
             {['canvas', 'templates', 'marketplace'].map(v => (
               <button key={v} onClick={() => setView(v as any)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
             ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <div className="relative">
              <input 
                placeholder="Ask Gemini to build a workflow..." 
                className="w-96 pl-6 pr-14 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold shadow-inner outline-none transition-all"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskAI()}
              />
              <button onClick={handleAskAI} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90">
                 {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>✨</span>}
              </button>
           </div>
           <button onClick={handleNewFlow} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">➕ New Flow</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {view === 'canvas' ? (
          <>
            <div className="w-80 border-r border-slate-100 bg-white p-6 space-y-6 shrink-0 overflow-y-auto">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Active Pipeline</h3>
               <div className="space-y-2">
                 {workflows.map(w => (
                   <div key={w.id} className={`group/w relative w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${activeId === w.id ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-50 hover:border-slate-200'}`} onClick={() => setActiveId(w.id)}>
                      {renamingId === w.id ? (
                        <input 
                          autoFocus
                          className="font-black text-slate-900 text-sm w-full bg-transparent border-none outline-none p-0 focus:ring-0"
                          value={w.name}
                          onChange={(e) => handleRenameWorkflow(w.id, e.target.value)}
                          onBlur={() => setRenamingId(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setRenamingId(null)}
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex justify-between items-center">
                          <p className="font-black text-slate-900 text-sm truncate flex-1">{w.name}</p>
                          <button onClick={(e) => { e.stopPropagation(); setRenamingId(w.id); }} className="opacity-0 group-hover/w:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition-all">
                             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                          </button>
                        </div>
                      )}
                      <span className="text-[8px] font-bold text-slate-400 uppercase">{w.nodes.length} Blocks</span>
                   </div>
                 ))}
               </div>
            </div>
            <div className="flex-1 overflow-auto p-20 pattern-grid-light relative">
               <div className="max-w-2xl mx-auto space-y-12 pb-60">
                 <div className="flex items-center justify-between mb-8 px-4">
                    <div>
                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{activeWorkflow.name}</h4>
                        <div className="flex items-center space-x-2 mt-2">
                           <span className={`w-2 h-2 rounded-full ${activeWorkflow.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeWorkflow.status}</span>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button 
                            onClick={handleSaveAsTemplate} 
                            className="px-5 py-2 bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center"
                        >
                            💾 Save as Template
                        </button>
                        <button onClick={() => setRenamingId(activeWorkflow.id)} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Rename Pipeline</button>
                    </div>
                 </div>

                 {activeWorkflow.nodes.map((node, idx) => (
                   <React.Fragment key={node.id}>
                     <div className={`relative p-10 rounded-[4rem] border-2 bg-white shadow-xl group transition-all transform hover:-translate-y-2 cursor-pointer ${node.color} ${showQuickConfig === node.id ? 'z-[300]' : 'z-10'}`} onClick={() => setSelectedNode(node)}>
                        <div className="flex items-center space-x-8">
                           <div className="w-24 h-24 rounded-[2rem] bg-white shadow-lg flex items-center justify-center text-5xl shrink-0">{node.icon}</div>
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                 <div>
                                   <h4 className="text-2xl font-black text-slate-900 tracking-tight">{node.label}</h4>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: Synced</p>
                                 </div>
                                 <button onClick={(e) => { e.stopPropagation(); setShowQuickConfig(showQuickConfig === node.id ? null : node.id); }} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">Quick Config</button>
                              </div>
                              <p className="text-sm text-slate-500 font-medium mt-4 line-clamp-2 italic">"{node.description}"</p>
                           </div>
                        </div>
                        {showQuickConfig === node.id && (
                          <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[3rem] shadow-2xl z-[500] p-8 max-h-[400px] overflow-y-auto scrollbar-hide animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                             {Object.entries(ALL_MARKETPLACE_NODES).map(([cat, items]) => (
                               <div key={cat} className="mb-6">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">{cat}</p>
                                  <div className="grid grid-cols-2 gap-2">
                                     {items.map(tpl => (
                                       <button key={tpl.id} onClick={() => updateNodeTemplate(node.id, tpl)} className="flex items-center space-x-3 p-3 hover:bg-slate-100 rounded-2xl transition-all text-left group">
                                          <span className="text-xl group-hover:scale-110 transition-transform">{tpl.icon}</span>
                                          <span className="text-xs font-black text-slate-700 truncate">{tpl.label}</span>
                                       </button>
                                     ))}
                                  </div>
                               </div>
                             ))}
                          </div>
                        )}
                     </div>
                     {idx < activeWorkflow.nodes.length - 1 && <div className="flex justify-center h-16 items-center"><div className="w-1 h-full bg-slate-200 rounded-full"></div></div>}
                   </React.Fragment>
                 ))}
                 <button onClick={() => setView('marketplace')} className="w-full py-20 border-4 border-dashed border-slate-200 rounded-[4rem] text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-all flex flex-col items-center justify-center space-y-4">
                    <span className="text-4xl">➕</span>
                    <span className="text-xs font-black uppercase tracking-widest">Append Neural Node</span>
                 </button>
               </div>
            </div>
          </>
        ) : view === 'templates' ? (
          <div className="flex-1 p-20 overflow-y-auto bg-slate-50">
             <div className="max-w-6xl mx-auto space-y-12">
                <h3 className="text-5xl font-black tracking-tighter">Workflow Blueprints</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {allTemplates.map(p => (
                     <div key={p.id} className="bg-white border border-slate-200 rounded-[4rem] p-12 space-y-8 hover:shadow-2xl transition-all group relative">
                        <div className="flex justify-between items-start">
                           <div className="flex -space-x-4">
                              {p.nodes.map((n, i) => <div key={i} className={`w-14 h-14 rounded-2xl border-4 border-white flex items-center justify-center text-3xl shadow-xl ${n.color.split(' ')[0]}`}>{n.icon}</div>)}
                           </div>
                           <div className="flex flex-col items-end space-y-2">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${p.id.startsWith('tpl-') ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
                                {p.id.startsWith('tpl-') ? 'Custom Template' : 'System Preset'}
                             </span>
                             {p.id.startsWith('tpl-') && (
                               <button onClick={() => deleteTemplate(p.id)} className="text-[8px] font-black text-rose-500 hover:underline uppercase tracking-widest">Delete Template</button>
                             )}
                           </div>
                        </div>
                        <div>
                           <h4 className="text-3xl font-black text-slate-900 tracking-tight">{p.name}</h4>
                           <p className="text-sm text-slate-500 font-medium leading-relaxed mt-4">"{p.nodes[1]?.description || p.nodes[0]?.description}"</p>
                        </div>
                        <button onClick={() => applyTemplate(p)} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[10px] shadow-xl hover:bg-black active:scale-95">Deploy to Canvas</button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        ) : (
          <div className="flex-1 p-12 overflow-y-auto bg-white">
             <div className="max-w-7xl mx-auto space-y-16">
                <div className="flex justify-between items-end border-b border-slate-100 pb-10">
                   <div>
                      <h3 className="text-5xl font-black tracking-tighter">Node Marketplace</h3>
                      <p className="text-slate-400 font-medium text-xl mt-2">Browse our extensive library of 30+ neural pathways and integrations.</p>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-40">
                   {Object.entries(ALL_MARKETPLACE_NODES).flatMap(([cat, items]) => items.map(tpl => (
                     <div key={tpl.id} className="bg-white border border-slate-100 rounded-[3rem] p-8 flex flex-col space-y-6 hover:shadow-2xl transition-all shadow-sm">
                        <div className="flex justify-between items-start">
                           <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner ${tpl.color.split(' ')[0]}`}>{tpl.icon}</div>
                           <span className="text-[9px] font-black bg-slate-50 text-slate-400 px-3 py-1 rounded-full uppercase">{tpl.category}</span>
                        </div>
                        <div className="flex-1">
                           <h5 className="text-xl font-black text-slate-900 tracking-tight">{tpl.label}</h5>
                           <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2 line-clamp-3">"{tpl.description}"</p>
                        </div>
                        <button onClick={() => addMarketNode(tpl)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-indigo-600 transition-colors">Connect to Canvas</button>
                     </div>
                   )))}
                </div>
             </div>
          </div>
        )}
      </div>

      {selectedNode && <NodeEditorModal node={selectedNode} onClose={() => setSelectedNode(null)} onUpdate={(u) => {
        const updated = workflows.map(w => w.id === activeId ? { ...w, nodes: w.nodes.map(n => n.id === selectedNode.id ? { ...n, ...u } : n) } : w);
        saveWorkflows(updated);
        setSelectedNode({ ...selectedNode, ...u });
      }} />}

      {showSaveSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest animate-in slide-in-from-top-4">
           ✨ Pipeline saved as custom template
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;
