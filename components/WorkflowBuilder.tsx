
import React, { useState, useRef, useMemo } from 'react';
import { Icons } from '../constants';
import { WorkflowNode, WorkflowMaterial, Workflow } from '../types';

// Vast Library for Marketplace and Quick Setup
const ALL_MARKETPLACE_NODES = {
  triggers: [
    { id: 'chatbot_trigger', label: 'Neural Chatbot', icon: '💬', color: 'bg-indigo-100 border-indigo-300 text-indigo-800', description: 'Triggers when a user initiates a chat session.', category: 'Communication' },
    { id: 'phone_call', label: 'Inbound Call', icon: '📞', color: 'bg-rose-100 border-rose-300 text-rose-800', description: 'Triggers when an automated voice call is received.', category: 'Communication' },
    { id: 'sms_text', label: 'SMS / Text', icon: '📱', color: 'bg-emerald-100 border-emerald-300 text-emerald-800', description: 'Triggers on incoming SMS via Twilio/Telnyx.', category: 'Communication' },
    { id: 'dm_social', label: 'Social DM', icon: '✉️', color: 'bg-pink-100 border-pink-300 text-pink-800', description: 'Triggers on Instagram/LinkedIn direct messages.', category: 'Communication' },
    { id: 'gmail_new', label: 'Gmail: New Email', icon: '📧', color: 'bg-rose-100 border-rose-300 text-rose-800', description: 'Triggers when a new email arrives in your inbox.', category: 'Google' },
    { id: 'sheets_row', label: 'Sheets: New Row', icon: '📊', color: 'bg-emerald-100 border-emerald-300 text-emerald-800', description: 'Triggers when a new row is appended to a spreadsheet.', category: 'Google' },
    { id: 'sheets_update', label: 'Sheets: Row Update', icon: '🔄', color: 'bg-emerald-50 border-emerald-200 text-emerald-900', description: 'Triggers when an existing cell is modified.', category: 'Google' },
    { id: 'form_submit', label: 'Form Submission', icon: '📝', color: 'bg-indigo-100 border-indigo-300 text-indigo-800', description: 'Triggers when a user submits a portal form.', category: 'Communication' },
    { id: 'agent_task', label: 'Agent Assistant', icon: '🤖', color: 'bg-purple-100 border-purple-300 text-purple-800', description: 'Triggers when an autonomous task is assigned.', category: 'AI' },
    { id: 'cron_timer', label: 'Cron: Scheduled', icon: '⏰', color: 'bg-slate-100 border-slate-300 text-slate-800', description: 'Runs daily at a specific designated time.', category: 'Utilities' },
    { id: 'webhook_in', label: 'Webhook', icon: '🔌', color: 'bg-amber-100 border-amber-300 text-amber-800', description: 'Triggers via a unique HTTP endpoint.', category: 'Utilities' },
  ],
  actions: [
    { id: 'ai_agent', label: 'AI Agent Execution', icon: '🧠', color: 'bg-indigo-600 border-indigo-400 text-white', description: 'Execute reasoning tasks via Gemini 3 Pro.', category: 'AI' },
    { id: 'memory_store', label: 'Memory Node', icon: '💾', color: 'bg-purple-600 border-purple-400 text-white', description: 'Save data into the long-term neural memory cluster.', category: 'AI' },
    { id: 'canva_node', label: 'Canva Design', icon: '🎨', color: 'bg-sky-500 border-sky-300 text-white', description: 'Push assets or metadata to a Canva design project.', category: 'Creative' },
    { id: 'invoice_gen', label: 'Invoice Builder', icon: '🧾', color: 'bg-emerald-600 border-emerald-400 text-white', description: 'Generate professional PDF invoices automatically.', category: 'Financial' },
    { id: 'drive_upload', label: 'Drive: Upload', icon: '📁', color: 'bg-blue-100 border-blue-300 text-blue-800', description: 'Upload generated assets to Google Drive.', category: 'Google' },
    { id: 'slack_msg', label: 'Slack: Alert', icon: '💬', color: 'bg-emerald-100 border-emerald-300 text-emerald-800', description: 'Notify a channel or user about this event.', category: 'Communication' },
    { id: 'http_req', label: 'HTTP Request', icon: '🌐', color: 'bg-slate-800 border-slate-600 text-white', description: 'Perform custom API calls (GET/POST/PUT).', category: 'Utilities' },
    { id: 'airtable_sync', label: 'Airtable: Sync', icon: '☁️', color: 'bg-cyan-100 border-cyan-300 text-cyan-800', description: 'Synchronize record data to an Airtable base.', category: 'Data' },
  ],
  logic: [
    { id: 'if_condition', label: 'IF Node', icon: '💎', color: 'bg-purple-100 border-purple-300 text-purple-800', description: 'Checks conditions and branches the relay logic.', category: 'Logic' },
    { id: 'function_js', label: 'Function (JS)', icon: '⚡', color: 'bg-amber-50 border-amber-200 text-amber-900', description: 'Executes custom JavaScript transformation.', category: 'Logic' },
    { id: 'set_variable', label: 'Set Variable', icon: '📍', color: 'bg-slate-100 border-slate-300 text-slate-800', description: 'Assigns values for downstream use.', category: 'Logic' },
    { id: 'data_split', label: 'Data Split', icon: '✂️', color: 'bg-rose-50 border-rose-200 text-rose-900', description: 'Splits arrays into individual streams.', category: 'Logic' },
    { id: 'custom_value', label: 'Custom Value', icon: '🏷️', color: 'bg-indigo-50 border-indigo-200 text-indigo-900', description: 'Define static values or parameters.', category: 'Logic' },
  ]
};

const INITIAL_NODES: WorkflowNode[] = [
  { 
    id: 'n1', 
    type: 'trigger', 
    icon: '📧', 
    label: 'Gmail: Inbound Lead', 
    description: 'Monitor support@hobbs.studio', 
    color: 'bg-rose-100 border-rose-300 text-rose-800',
    apiConnected: true,
    mcpEnabled: false,
    materials: [],
    config: { api: { provider: 'Google', service: 'Gmail', isActive: true } }
  },
  { 
    id: 'n2', 
    type: 'condition', 
    icon: '💎', 
    label: 'Logic: Sentiment Check', 
    description: 'If message is urgent', 
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    apiConnected: false,
    mcpEnabled: true,
    materials: [],
    config: { mcp: { capabilities: ['reasoning'], isActive: true } }
  },
  { 
    id: 'n3', 
    type: 'action', 
    icon: '🤖', 
    label: 'Agent: Draft Reply', 
    description: 'Generate empathetic response', 
    color: 'bg-indigo-600 border-indigo-400 text-white',
    apiConnected: false,
    mcpEnabled: true,
    materials: [],
    config: { mcp: { capabilities: ['generation'], isActive: true } }
  },
];

const WORKFLOW_TEMPLATES: Workflow[] = [
  { id: 'w1', name: 'Neural Lead Responder', status: 'Active', nodes: INITIAL_NODES },
  { id: 'w2', name: 'Sheets to Slack Sync', status: 'Draft', nodes: [] },
  { id: 'w3', name: 'Emergency SMS Relay', status: 'Paused', nodes: [] },
];

const NodeEditorModal: React.FC<{
  node: WorkflowNode;
  onClose: () => void;
  onUpdate: (updates: Partial<WorkflowNode>) => void;
}> = ({ node, onClose, onUpdate }) => {
  const [isTesting, setIsTesting] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const simulateConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      onUpdate({ config: { ...(node.config || {}), isActive: true } });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className={`p-10 border-b border-slate-100 flex justify-between items-center ${node.color.split(' ')[0]} bg-opacity-10`}>
          <div className="flex items-center space-x-6">
            <div 
              onClick={() => logoInputRef.current?.click()}
              className="w-20 h-20 rounded-3xl bg-white shadow-xl border-2 border-white overflow-hidden flex items-center justify-center text-4xl cursor-pointer hover:scale-105 transition-transform"
            >
              {node.logoUrl ? <img src={node.logoUrl} className="w-full h-full object-cover" /> : node.icon}
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const r = new FileReader();
                  r.onloadend = () => onUpdate({ logoUrl: r.result as string });
                  r.readAsDataURL(file);
                }
              }} />
            </div>
            <div>
              <input 
                className="text-3xl font-black text-slate-900 bg-transparent border-none outline-none focus:ring-0 w-full" 
                value={node.label} 
                onChange={(e) => onUpdate({ label: e.target.value })} 
              />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{node.type} Node Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Operational Intent</label>
              <textarea 
                className="w-full h-32 p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium resize-none shadow-inner"
                placeholder="What is the objective of this node?"
                value={node.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
              />
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
               <h4 className="text-[10px] font-black uppercase text-slate-400">Node Properties</h4>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-slate-100">
                     <p className="text-[8px] font-bold text-slate-400 uppercase">Input Format</p>
                     <p className="text-xs font-black text-slate-900">JSON/Object</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-100">
                     <p className="text-[8px] font-bold text-slate-400 uppercase">Output Schema</p>
                     <p className="text-xs font-black text-slate-900">Standard Relay</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-6 border border-slate-100">
             <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Logic Settings</h4>
             <div className="space-y-4">
               <button onClick={() => onUpdate({ apiConnected: !node.apiConnected, mcpEnabled: false })} className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center space-x-4 ${node.apiConnected ? 'border-indigo-500 bg-white shadow-md' : 'bg-white border-transparent hover:border-slate-200'}`}>
                  <span className="text-3xl">🔌</span>
                  <div className="text-left">
                     <span className="text-xs font-black uppercase block">External API</span>
                     <span className="text-[9px] text-slate-400 font-bold uppercase">Connect via Secure Webhook</span>
                  </div>
               </button>
               <button onClick={() => onUpdate({ mcpEnabled: !node.mcpEnabled, apiConnected: false })} className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center space-x-4 ${node.mcpEnabled ? 'border-purple-500 bg-white shadow-md' : 'bg-white border-transparent hover:border-slate-200'}`}>
                  <span className="text-3xl">🧠</span>
                  <div className="text-left">
                     <span className="text-xs font-black uppercase block">AI Model Grounding</span>
                     <span className="text-[9px] text-slate-400 font-bold uppercase">Pass context to Gemini Agent</span>
                  </div>
               </button>
             </div>
             <button 
               onClick={simulateConnection}
               disabled={isTesting}
               className={`w-full py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl mt-6 ${isTesting ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-black'}`}
             >
               {isTesting ? 'Validating Connection...' : 'Save & Active Node'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(WORKFLOW_TEMPLATES);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(WORKFLOW_TEMPLATES[0].id);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'my-relays' | 'marketplace'>('my-relays');
  const [marketplaceSearch, setMarketplaceSearch] = useState('');

  const activeWorkflow = workflows.find(w => w.id === activeWorkflowId) || workflows[0];

  const handleCreateWorkflow = () => {
    const id = `w-${Date.now()}`;
    const newW: Workflow = {
      id,
      name: 'Untitled Relay',
      status: 'Draft',
      nodes: [{ id: `n-trig-${Date.now()}`, type: 'trigger', label: 'Start Trigger', description: 'Assign an entry signal', icon: '⚡', color: 'bg-amber-50 border-amber-200 text-amber-700', apiConnected: false, mcpEnabled: false, materials: [] }]
    };
    setWorkflows([newW, ...workflows]);
    setActiveWorkflowId(id);
    setViewMode('my-relays');
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setWorkflows(prev => prev.map(w => w.id === activeWorkflowId ? { ...w, nodes: w.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n) } : w));
    if (selectedNode?.id === nodeId) setSelectedNode(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleDeleteNode = (nodeId: string) => {
    setWorkflows(prev => prev.map(w => w.id === activeWorkflowId ? { ...w, nodes: w.nodes.filter(n => n.id !== nodeId) } : w));
  };

  const handleAddNode = () => {
    const newNode: WorkflowNode = { id: `n-${Date.now()}`, type: 'action', label: 'New Action', description: 'Configuring node...', icon: '⚙️', color: 'bg-slate-50 border-slate-200 text-slate-600', apiConnected: false, mcpEnabled: false, materials: [] };
    setWorkflows(prev => prev.map(w => w.id === activeWorkflowId ? { ...w, nodes: [...w.nodes, newNode] } : w));
    setSelectedNode(newNode);
  };

  const applyTemplate = (nodeId: string, template: any) => {
    handleUpdateNode(nodeId, {
      label: template.label,
      description: template.description,
      icon: template.icon,
      color: template.color,
      type: ALL_MARKETPLACE_NODES.triggers.find(t => t.id === template.id) ? 'trigger' : ALL_MARKETPLACE_NODES.actions.find(a => a.id === template.id) ? 'action' : 'condition'
    });
    setShowTemplateDropdown(null);
  };

  const installNode = (template: any) => {
    const type = ALL_MARKETPLACE_NODES.triggers.find(t => t.id === template.id) ? 'trigger' : ALL_MARKETPLACE_NODES.actions.find(a => a.id === template.id) ? 'action' : 'condition';
    const newNode: WorkflowNode = {
      id: `n-installed-${Date.now()}`,
      type,
      label: template.label,
      description: template.description,
      icon: template.icon,
      color: template.color,
      apiConnected: false,
      mcpEnabled: false,
      materials: []
    };
    setWorkflows(prev => prev.map(w => w.id === activeWorkflowId ? { ...w, nodes: [...w.nodes, newNode] } : w));
    setViewMode('my-relays');
    setSelectedNode(newNode);
  };

  const filteredMarketplace = useMemo(() => {
    const search = marketplaceSearch.toLowerCase();
    const categories = ['triggers', 'actions', 'logic'] as const;
    const result: any = { triggers: [], actions: [], logic: [] };
    categories.forEach(cat => {
      result[cat] = ALL_MARKETPLACE_NODES[cat].filter(n => 
        n.label.toLowerCase().includes(search) || 
        n.description.toLowerCase().includes(search) ||
        n.category.toLowerCase().includes(search)
      );
    });
    return result;
  }, [marketplaceSearch]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center shrink-0 shadow-sm z-20">
        <div className="flex items-center space-x-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Automation Engine</h2>
          <div className="flex bg-slate-100 p-1.5 rounded-[1.2rem] shadow-inner">
             <button 
               onClick={() => setViewMode('my-relays')}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'my-relays' ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
             >
                My Relays
             </button>
             <button 
               onClick={() => setViewMode('marketplace')}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'marketplace' ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
             >
                Global Marketplace
             </button>
          </div>
        </div>
        <button onClick={handleCreateWorkflow} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all flex items-center active:scale-95">
          <Icons.Plus /> <span className="ml-2">Initialize New Relay</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {viewMode === 'my-relays' ? (
          <>
            {/* Sidebar List */}
            <div className="w-80 border-r border-slate-200 bg-white p-6 space-y-6 shrink-0 overflow-y-auto">
              <div className="flex justify-between items-center px-1">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Pipelines</h3>
                 <span className="text-[8px] font-bold text-slate-300 uppercase">{workflows.length} Total</span>
              </div>
              <div className="space-y-3">
                {workflows.map(w => (
                  <div key={w.id} className="relative group">
                    <button 
                      onClick={() => setActiveWorkflowId(w.id)}
                      className={`w-full text-left p-6 rounded-[2.5rem] border-2 transition-all ${activeWorkflowId === w.id ? 'bg-indigo-50 border-indigo-500 shadow-lg scale-[1.02]' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-black text-slate-900 truncate pr-4 text-sm tracking-tight">{w.name}</span>
                        <span className={`text-[7px] font-black px-2 py-0.5 rounded uppercase ${w.status === 'Active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-500'}`}>{w.status}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                           {w.nodes.slice(0, 4).map((n, i) => (
                             <div key={i} className={`w-7 h-7 rounded-xl border-2 border-white flex items-center justify-center text-xs shadow-sm ${n.color.split(' ')[0]}`}>{n.icon}</div>
                           ))}
                           {w.nodes.length > 4 && <div className="w-7 h-7 rounded-xl border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">+{w.nodes.length - 4}</div>}
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{w.nodes.length} Logic Blocks</span>
                      </div>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm("Purge this workflow?")) setWorkflows(workflows.filter(item => item.id !== w.id)); }} 
                      className="absolute -top-1 -right-1 p-2.5 bg-white border border-slate-200 text-slate-300 hover:text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 overflow-auto p-16 pattern-grid relative bg-[#f8faff]">
              <div className="max-w-2xl mx-auto space-y-12 pb-40">
                {activeWorkflow.nodes.map((node, idx) => (
                  <React.Fragment key={node.id}>
                    <div 
                      onClick={() => setSelectedNode(node)}
                      className={`relative p-12 rounded-[4rem] border-2 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all cursor-pointer group ${node.color} group/node`}
                    >
                      <div className="absolute -top-4 left-12 flex space-x-2 z-10">
                        <span className="px-4 py-1.5 bg-white border border-inherit rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">{node.type} Node</span>
                        {node.mcpEnabled && <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center"><span className="w-1.5 h-1.5 bg-white rounded-full mr-2 animate-pulse"></span>Neural Active</span>}
                      </div>
                      
                      <div className="flex items-center space-x-10">
                        <div className="w-28 h-28 rounded-[2.5rem] bg-white shadow-2xl border-4 border-white flex items-center justify-center text-6xl group-hover:scale-110 group-hover:rotate-3 transition-transform overflow-hidden relative shrink-0">
                          {node.logoUrl ? <img src={node.logoUrl} className="w-full h-full object-cover" /> : node.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                               <h4 className="text-3xl font-black text-slate-900 tracking-tighter truncate leading-tight">{node.label}</h4>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: Fully Operational</p>
                            </div>
                            <div className="relative">
                               <button 
                                onClick={(e) => { e.stopPropagation(); setShowTemplateDropdown(showTemplateDropdown === node.id ? null : node.id); }}
                                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-xl hover:-translate-y-0.5"
                               >
                                 Quick Swap
                               </button>
                               {showTemplateDropdown === node.id && (
                                 <div className="absolute right-0 top-full mt-6 w-80 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-[3rem] shadow-[0_60px_100px_rgba(0,0,0,0.25)] z-[100] py-8 animate-in slide-in-from-top-4 duration-300">
                                    <div className="max-h-[450px] overflow-y-auto scrollbar-hide px-2">
                                      {Object.entries(ALL_MARKETPLACE_NODES).map(([groupName, items]) => (
                                        <div key={groupName} className="mb-6">
                                           <div className="px-6 pb-2 border-b border-slate-100 mb-3"><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{groupName}</p></div>
                                           {items.map(t => (
                                             <button key={t.id} onClick={(e) => { e.stopPropagation(); applyTemplate(node.id, t); }} className="w-full text-left px-6 py-3.5 hover:bg-indigo-50 rounded-2xl transition-all flex items-center space-x-4 group/opt">
                                               <span className="text-3xl group-hover/opt:scale-125 transition-transform drop-shadow-sm">{t.icon}</span>
                                               <div className="min-w-0">
                                                  <span className="text-xs font-black text-slate-900 block truncate">{t.label}</span>
                                                  <span className="text-[8px] font-bold text-slate-400 uppercase">{t.category}</span>
                                               </div>
                                             </button>
                                           ))}
                                        </div>
                                      ))}
                                    </div>
                                 </div>
                               )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 font-medium truncate mt-3 pr-12 italic opacity-80">"{node.description}"</p>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }} className="absolute -top-4 -right-4 w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 group-hover:rotate-90">✕</button>
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all text-slate-300 scale-150"><Icons.ChevronRight /></div>
                    </div>
                    {idx < activeWorkflow.nodes.length - 1 && (
                      <div className="flex justify-center h-20 items-center">
                         <div className="w-1.5 h-full bg-slate-200/50 rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-white border-2 border-slate-200 rounded-full shadow-sm"></div>
                         </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
                
                <button 
                  onClick={handleAddNode}
                  className="w-full py-20 border-4 border-dashed border-slate-200 rounded-[5rem] flex flex-col items-center justify-center space-y-6 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors"></div>
                  <div className="w-20 h-20 rounded-full border-4 border-inherit flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-2xl relative z-10">
                     <Icons.Plus />
                  </div>
                  <div className="text-center relative z-10">
                     <span className="text-sm font-black uppercase tracking-[0.4em] block">Expand Logic Circuit</span>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Append new action or logic block</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Marketplace View */
          <div className="flex-1 flex flex-col bg-white animate-in slide-in-from-right-10 duration-700">
            <div className="p-12 border-b border-slate-100 bg-slate-50/50">
               <div className="max-w-6xl mx-auto space-y-10">
                  <div className="flex justify-between items-end">
                     <div className="space-y-2">
                        <h3 className="text-5xl font-black text-slate-900 tracking-tighter">Global Node Registry</h3>
                        <p className="text-xl text-slate-500 font-medium">Link production agents, communication hubs, and data streams.</p>
                     </div>
                     <div className="relative">
                        <Icons.Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search nodes, providers, or logic..." 
                          className="w-[450px] pl-16 pr-8 py-5 bg-white border-2 border-slate-200 rounded-[2rem] shadow-xl text-lg font-medium focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                          value={marketplaceSearch}
                          onChange={(e) => setMarketplaceSearch(e.target.value)}
                        />
                     </div>
                  </div>
                  <div className="flex space-x-4">
                     {['All', 'Communication', 'Google', 'AI', 'Logic', 'Financial', 'Creative', 'Utilities'].map(tag => (
                        <button key={tag} className="px-6 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm">#{tag}</button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 bg-white">
               <div className="max-w-6xl mx-auto space-y-16">
                  {Object.entries(filteredMarketplace).map(([catName, nodes]: [string, any[]]) => nodes.length > 0 && (
                    <div key={catName} className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                       <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
                          <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">{catName}</h4>
                          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">{nodes.length} Results</span>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {nodes.map(node => (
                            <div key={node.id} className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 flex flex-col space-y-6 hover:shadow-2xl hover:border-indigo-100 transition-all group relative overflow-hidden">
                               <div className="flex justify-between items-start">
                                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl shadow-xl transition-transform group-hover:scale-110 duration-500 ${node.color} group-hover:shadow-indigo-500/20`}>
                                     {node.icon}
                                  </div>
                                  <span className="text-[9px] font-black bg-slate-50 text-slate-400 border border-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{node.category}</span>
                               </div>
                               <div className="space-y-1 flex-1">
                                  <h5 className="text-xl font-black text-slate-900 tracking-tight">{node.label}</h5>
                                  <p className="text-sm text-slate-500 font-medium leading-relaxed italic pr-4">"{node.description}"</p>
                               </div>
                               <button 
                                 onClick={() => installNode(node)}
                                 className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 shadow-xl transition-all active:scale-95"
                               >
                                  Deploy to Canvas
                               </button>
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>

      {selectedNode && (
        <NodeEditorModal 
          node={selectedNode} 
          onClose={() => setSelectedNode(null)} 
          onUpdate={(u) => handleUpdateNode(selectedNode.id, u)} 
        />
      )}
    </div>
  );
};

export default WorkflowBuilder;
