
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
  "Logic & Data": [
    { id: 'if', label: 'If', icon: '💎', color: 'bg-purple-100 border-purple-300 text-purple-800', description: 'Conditional logic paths.', category: 'Logic', setupGuide: { steps: ['Define keys', 'Operator', 'Value'], link: '#', infoNeeded: 'Logic' } },
    { id: 'function', label: 'Function', icon: '⚡', color: 'bg-amber-50 border-amber-200 text-amber-900', description: 'Execute custom JavaScript.', category: 'Logic', setupGuide: { steps: ['Write JS'], link: '#', infoNeeded: 'Script' } },
    { id: 'set', label: 'Set', icon: '📍', color: 'bg-slate-100 border-slate-300 text-slate-800', description: 'Modify data in workflow.', category: 'Logic', setupGuide: { steps: ['Key', 'Value'], link: '#', infoNeeded: 'Variables' } },
    { id: 'mysql', label: 'MySQL', icon: '💾', color: 'bg-blue-100 border-blue-300 text-blue-800', description: 'Interact with MySQL databases.', category: 'Data', setupGuide: { steps: ['Host', 'Credentials', 'Query'], link: '#', infoNeeded: 'DB Connection' } },
    { id: 'command', label: 'Execute Command', icon: '🐚', color: 'bg-slate-800 border-slate-900 text-white', description: 'Run shell commands.', category: 'Dev', setupGuide: { steps: ['Script path'], link: '#', infoNeeded: 'Env' } },
  ],
  "Communication": [
    { id: 'slack', label: 'Slack', icon: '💬', color: 'bg-emerald-100 border-emerald-300 text-emerald-800', description: 'Send messages to Slack.', category: 'Communication', setupGuide: { steps: ['Hook URL'], link: 'https://api.slack.com', infoNeeded: 'Webhook' } },
    { id: 'email', label: 'Email', icon: '📧', color: 'bg-indigo-100 border-indigo-300 text-indigo-800', description: 'Send/receive through SMTP.', category: 'Communication', setupGuide: { steps: ['SMTP Host'], link: '#', infoNeeded: 'Credentials' } },
    { id: 'gmail', label: 'Gmail', icon: '💌', color: 'bg-rose-100 border-rose-300 text-rose-800', description: 'Send/receive through Gmail.', category: 'Google', setupGuide: { steps: ['OAuth'], link: '#', infoNeeded: 'G-Token' } },
  ],
  "Google Workspace": [
    { id: 'sheets', label: 'Google Sheets', icon: '📊', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', description: 'Read/write spreadsheet data.', category: 'Google', setupGuide: { steps: ['Sheet ID'], link: '#', infoNeeded: 'Auth' } },
    { id: 'calendar', label: 'Google Calendar', icon: '📅', color: 'bg-blue-100 border-blue-200 text-blue-800', description: 'Manage events.', category: 'Google', setupGuide: { steps: ['Calendar ID'], link: '#', infoNeeded: 'Auth' } },
    { id: 'drive', label: 'Google Drive', icon: '📁', color: 'bg-amber-100 border-amber-200 text-amber-800', description: 'Manage files.', category: 'Google', setupGuide: { steps: ['Folder ID'], link: '#', infoNeeded: 'Auth' } },
    { id: 'docs', label: 'Google Docs', icon: '📄', color: 'bg-blue-50 border-blue-200 text-blue-800', description: 'Edit documents.', category: 'Google', setupGuide: { steps: ['Doc ID'], link: '#', infoNeeded: 'Auth' } },
    { id: 'slides', label: 'Google Slides', icon: '📙', color: 'bg-orange-50 border-orange-200 text-orange-800', description: 'Manage slides.', category: 'Google', setupGuide: { steps: ['Slide ID'], link: '#', infoNeeded: 'Auth' } },
    { id: 'forms', label: 'Google Forms', icon: '📝', color: 'bg-purple-50 border-purple-200 text-purple-800', description: 'Collect responses.', category: 'Google', setupGuide: { steps: ['Form ID'], link: '#', infoNeeded: 'Auth' } },
    { id: 'contacts', label: 'Google Contacts', icon: '👥', color: 'bg-blue-100 border-blue-200 text-blue-900', description: 'Manage contacts.', category: 'Google', setupGuide: { steps: ['Contacts scope'], link: '#', infoNeeded: 'Auth' } },
    { id: 'analytics', label: 'Google Analytics', icon: '📈', color: 'bg-orange-100 border-orange-200 text-orange-900', description: 'Fetch traffic data.', category: 'Google', setupGuide: { steps: ['Property ID'], link: '#', infoNeeded: 'Auth' } },
    { id: 'ads', label: 'Google Ads', icon: '💰', color: 'bg-emerald-50 border-emerald-200 text-emerald-900', description: 'Manage campaigns.', category: 'Google', setupGuide: { steps: ['Account ID'], link: '#', infoNeeded: 'Auth' } },
    { id: 'maps', label: 'Google Maps', icon: '🗺️', color: 'bg-rose-50 border-rose-200 text-rose-800', description: 'Mapping services.', category: 'Google', setupGuide: { steps: ['API Key'], link: '#', infoNeeded: 'Key' } },
    { id: 'tasks', label: 'Google Tasks', icon: '✅', color: 'bg-indigo-50 border-indigo-200 text-indigo-800', description: 'Manage to-do lists.', category: 'Google', setupGuide: { steps: ['Task List ID'], link: '#', infoNeeded: 'Auth' } },
    { id: 'storage', label: 'Google Cloud Storage', icon: '☁️', color: 'bg-sky-100 border-sky-200 text-sky-900', description: 'Object storage.', category: 'Google', setupGuide: { steps: ['Bucket'], link: '#', infoNeeded: 'Auth' } },
  ],
  "Third Party": [
    { id: 'trello', label: 'Trello', icon: '📋', color: 'bg-blue-100 border-blue-300 text-blue-900', description: 'Manage boards/cards.', category: 'Apps', setupGuide: { steps: ['Board ID'], link: '#', infoNeeded: 'Auth' } },
    { id: 'salesforce', label: 'Salesforce', icon: '☁️', color: 'bg-sky-50 border-sky-300 text-sky-800', description: 'Leads/Contacts.', category: 'Apps', setupGuide: { steps: ['Instance'], link: '#', infoNeeded: 'Auth' } },
    { id: 'mailchimp', label: 'Mailchimp', icon: '🐒', color: 'bg-amber-100 border-amber-300 text-amber-900', description: 'Email marketing.', category: 'Apps', setupGuide: { steps: ['API Key'], link: '#', infoNeeded: 'Key' } },
    { id: 'sendfox', label: 'Sendfox', icon: '🦊', color: 'bg-orange-100 border-orange-300 text-orange-900', description: 'Email marketing.', category: 'Apps', setupGuide: { steps: ['Access Token'], link: '#', infoNeeded: 'Auth' } },
    { id: 'shopify', label: 'Shopify', icon: '🛒', color: 'bg-emerald-100 border-emerald-300 text-emerald-900', description: 'Store orders/tasks.', category: 'Apps', setupGuide: { steps: ['Store URL'], link: '#', infoNeeded: 'Auth' } },
    { id: 'typeform', label: 'Typeform', icon: '📝', color: 'bg-slate-900 border-slate-700 text-white', description: 'Form data collection.', category: 'Apps', setupGuide: { steps: ['Personal Token'], link: '#', infoNeeded: 'Auth' } },
    { id: 'formly', label: 'Formly', icon: '🔗', color: 'bg-indigo-50 border-indigo-200 text-indigo-800', description: ' getformly.app forms.', category: 'Apps', setupGuide: { steps: ['API ID'], link: 'https://getformly.app', infoNeeded: 'Auth' } },
    { id: 'github', label: 'GitHub', icon: '🐙', color: 'bg-slate-50 border-slate-200 text-slate-800', description: 'Repos & Actions.', category: 'Apps', setupGuide: { steps: ['Repo name'], link: '#', infoNeeded: 'Auth' } },
  ],
  "Utilities": [
    { id: 'http', label: 'HTTP Request', icon: '🌐', color: 'bg-slate-100 border-slate-300 text-slate-900', description: 'API calls.', category: 'Utils', setupGuide: { steps: ['URL', 'Method'], link: '#', infoNeeded: 'Endpoint' } },
    { id: 'webhook', label: 'Webhook', icon: '🔌', color: 'bg-amber-50 border-amber-200 text-amber-800', description: 'Receive data via URL.', category: 'Utils', setupGuide: { steps: ['Copy URL'], link: '#', infoNeeded: 'Endpoint' } },
  ]
};

const WORKFLOW_PRESETS: Workflow[] = [
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
    name: 'Lead Extraction & CRM Sync',
    status: 'Draft',
    nodes: [
      { id: 'le1', type: 'trigger', label: 'Webhook', icon: '🔌', color: 'bg-amber-100 border-amber-300 text-amber-800', description: 'Receive lead from Formly.', apiConnected: true, mcpEnabled: false, materials: [] },
      { id: 'le2', type: 'action', label: 'AI Assistant', icon: '🧠', color: 'bg-indigo-600 border-indigo-400 text-white', description: 'Extract custom values and summarize lead.', apiConnected: true, mcpEnabled: false, materials: [] },
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
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
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
        <div className="p-8 border-t border-slate-100 flex justify-end">
           <button onClick={onClose} className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">Confirm & Close</button>
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
  const [activeId, setActiveId] = useState(workflows[0].id);
  const [view, setView] = useState<'canvas' | 'templates' | 'marketplace'>('canvas');
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuickConfig, setShowQuickConfig] = useState<string | null>(null);

  const activeWorkflow = useMemo(() => workflows.find(w => w.id === activeId) || workflows[0], [workflows, activeId]);

  const save = (updated: Workflow[]) => {
    setWorkflows(updated);
    localStorage.setItem('OMNI_WORKFLOWS_V5', JSON.stringify(updated));
  };

  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const data = await generateWorkflowFromPrompt(aiPrompt);
      const newW: Workflow = {
        id: `w-ai-${Date.now()}`,
        name: data.name || 'AI Designed Flow',
        status: 'Draft',
        nodes: data.nodes.map((n: any, i: number) => ({ id: `n-${i}-${Date.now()}`, ...n, apiConnected: false, mcpEnabled: false, materials: [] }))
      };
      save([newW, ...workflows]);
      setActiveId(newW.id);
      setView('canvas');
      setAiPrompt('');
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const applyTemplate = (tpl: Workflow) => {
    const newW = { ...tpl, id: `w-t-${Date.now()}`, status: 'Draft' as const };
    save([newW, ...workflows]);
    setActiveId(newW.id);
    setView('canvas');
  };

  const addMarketNode = (tpl: NodeTemplate) => {
    const node: WorkflowNode = { id: `n-${Date.now()}`, type: 'action', label: tpl.label, icon: tpl.icon, color: tpl.color, description: tpl.description, apiConnected: false, mcpEnabled: false, materials: [] };
    const updated = workflows.map(w => w.id === activeId ? { ...w, nodes: [...w.nodes, node] } : w);
    save(updated);
    setView('canvas');
    setShowQuickConfig(null);
  };

  const updateNodeTemplate = (nodeId: string, tpl: NodeTemplate) => {
    const updated = workflows.map(w => w.id === activeId ? { ...w, nodes: w.nodes.map(n => n.id === nodeId ? { ...n, label: tpl.label, icon: tpl.icon, color: tpl.color, description: tpl.description } : n) } : w);
    save(updated);
    setShowQuickConfig(null);
  };

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
           <button onClick={() => {}} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200">➕ New Flow</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {view === 'canvas' ? (
          <>
            <div className="w-80 border-r border-slate-100 bg-white p-6 space-y-6 shrink-0 overflow-y-auto">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Active Pipeline</h3>
               <div className="space-y-2">
                 {workflows.map(w => (
                   <button key={w.id} onClick={() => setActiveId(w.id)} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${activeId === w.id ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-50'}`}>
                      <p className="font-black text-slate-900 text-sm truncate">{w.name}</p>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">{w.nodes.length} Blocks</span>
                   </button>
                 ))}
               </div>
            </div>
            <div className="flex-1 overflow-auto p-20 pattern-grid-light relative">
               <div className="max-w-2xl mx-auto space-y-12 pb-60">
                 {activeWorkflow.nodes.map((node, idx) => (
                   <React.Fragment key={node.id}>
                     <div className={`relative p-10 rounded-[4rem] border-2 bg-white shadow-xl group transition-all transform hover:-translate-y-2 cursor-pointer ${node.color} ${showQuickConfig === node.id ? 'z-[200]' : 'z-10'}`} onClick={() => setSelectedNode(node)}>
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
                          <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[3rem] shadow-2xl z-[300] p-8 max-h-[400px] overflow-y-auto scrollbar-hide animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
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
                   {WORKFLOW_PRESETS.map(p => (
                     <div key={p.id} className="bg-white border border-slate-200 rounded-[4rem] p-12 space-y-8 hover:shadow-2xl transition-all group">
                        <div className="flex justify-between items-start">
                           <div className="flex -space-x-4">
                              {p.nodes.map((n, i) => <div key={i} className={`w-14 h-14 rounded-2xl border-4 border-white flex items-center justify-center text-3xl shadow-xl ${n.color.split(' ')[0]}`}>{n.icon}</div>)}
                           </div>
                           <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Premium Template</span>
                        </div>
                        <div>
                           <h4 className="text-3xl font-black text-slate-900 tracking-tight">{p.name}</h4>
                           <p className="text-sm text-slate-500 font-medium leading-relaxed mt-4">"{p.nodes[1].description}"</p>
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
                      <p className="text-slate-400 font-medium text-xl mt-2">Browse our extensive library of neural pathways and integrations.</p>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                        <button onClick={() => addMarketNode(tpl)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-indigo-600">Connect to Canvas</button>
                     </div>
                   )))}
                </div>
             </div>
          </div>
        )}
      </div>

      {selectedNode && <NodeEditorModal node={selectedNode} onClose={() => setSelectedNode(null)} onUpdate={(u) => {
        const updated = workflows.map(w => w.id === activeId ? { ...w, nodes: w.nodes.map(n => n.id === selectedNode.id ? { ...n, ...u } : n) } : w);
        save(updated);
        setSelectedNode({ ...selectedNode, ...u });
      }} />}
    </div>
  );
};

export default WorkflowBuilder;
