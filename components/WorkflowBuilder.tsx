
import React, { useState, useRef } from 'react';
import { Icons } from '../constants';
import { WorkflowNode, WorkflowMaterial, Workflow } from '../types';

const TRIGGER_TEMPLATES = [
  { id: 'gmail_new', label: 'Gmail: New Email', icon: '📧', color: 'bg-rose-100 border-rose-300 text-rose-800', description: 'Triggers when a new email arrives in your inbox.', api: { provider: 'Google', service: 'Gmail' } },
  { id: 'sheets_row', label: 'Sheets: New Row', icon: '📊', color: 'bg-emerald-100 border-emerald-300 text-emerald-800', description: 'Triggers when a new row is appended to a spreadsheet.', api: { provider: 'Google', service: 'Sheets' } },
  { id: 'form_submit', label: 'Form Submission', icon: '📝', color: 'bg-indigo-100 border-indigo-300 text-indigo-800', description: 'Triggers when a user submits a portal form.' },
  { id: 'cron_timer', label: 'Cron: Scheduled', icon: '⏰', color: 'bg-slate-100 border-slate-300 text-slate-800', description: 'Runs daily at a specific designated time.' },
  { id: 'interval', label: 'Interval Trigger', icon: '⏱️', color: 'bg-amber-100 border-amber-300 text-amber-800', description: 'Runs every hour or minute automatically.' },
];

const ACTION_TEMPLATES = [
  { id: 'ai_agent', label: 'AI Agent Task', icon: '🤖', color: 'bg-indigo-600 border-indigo-400 text-white', description: 'Execute a complex reasoning task using Gemini 3 Pro.', mcp: true },
  { id: 'memory_store', label: 'Memory Node', icon: '🧠', color: 'bg-purple-600 border-purple-400 text-white', description: 'Save data into the long-term neural memory cluster.', mcp: true },
  { id: 'drive_upload', label: 'Drive: Upload File', icon: '📁', color: 'bg-blue-100 border-blue-300 text-blue-800', description: 'Upload generated assets to Google Drive.', api: { provider: 'Google', service: 'Drive' } },
  { id: 'airtable_sync', label: 'Airtable: Sync', icon: '☁️', color: 'bg-cyan-100 border-cyan-300 text-cyan-800', description: 'Synchronize record data to an Airtable base.' },
  { id: 'slack_msg', label: 'Slack: Alert', icon: '💬', color: 'bg-emerald-100 border-emerald-300 text-emerald-800', description: 'Notify a channel or user about this event.' },
  { id: 'trello_card', label: 'Trello: New Card', icon: '📋', color: 'bg-blue-50 border-blue-200 text-blue-700', description: 'Create a card in the project management backlog.' },
];

const LOGIC_TEMPLATES = [
  { id: 'if_condition', label: 'IF Node', icon: '💎', color: 'bg-purple-100 border-purple-300 text-purple-800', description: 'Checks conditions and branches the relay logic.' },
  { id: 'function_js', label: 'Function (JS)', icon: '⚡', color: 'bg-amber-50 border-amber-200 text-amber-900', description: 'Executes custom JavaScript for data transformation.' },
  { id: 'set_variable', label: 'Set Value', icon: '📍', color: 'bg-slate-100 border-slate-300 text-slate-800', description: 'Assigns values to variables for downstream use.' },
  { id: 'data_split', label: 'Data Split', icon: '✂️', color: 'bg-rose-50 border-rose-200 text-rose-900', description: 'Splits arrays or objects into individual streams.' },
];

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
  const [activeTab, setActiveTab] = useState<'config' | 'learn'>('config');
  const [isTesting, setIsTesting] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateConfig = (key: string, value: any) => {
    const currentConfig = node.config || {};
    onUpdate({
      config: {
        ...currentConfig,
        [key]: { ...(currentConfig[key] || {}), ...value }
      }
    });
  };

  const simulateConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      const type = node.apiConnected ? 'api' : 'mcp';
      handleUpdateConfig(type, { isActive: true });
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
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{node.type} Logic Circuit</p>
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
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Data Protocol</label>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => onUpdate({ apiConnected: !node.apiConnected, mcpEnabled: false })} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center space-y-2 ${node.apiConnected ? 'border-indigo-500 bg-indigo-50' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                  <span className="text-2xl">🔌</span>
                  <span className="text-[10px] font-black uppercase">REST API</span>
                </button>
                <button onClick={() => onUpdate({ mcpEnabled: !node.mcpEnabled, apiConnected: false })} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center space-y-2 ${node.mcpEnabled ? 'border-purple-500 bg-purple-50' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                  <span className="text-2xl">🧠</span>
                  <span className="text-[10px] font-black uppercase">MCP Model</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-6">
             <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Advanced Configuration</h4>
             {node.id.includes('function') && (
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Script Runtime</label>
                  <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-emerald-400 h-40 overflow-y-auto">
                    {"// Execute logic below\nmodule.exports = async (data) => {\n  return { ...data, transformed: true };\n};"}
                  </div>
               </div>
             )}
             <button 
               onClick={simulateConnection}
               disabled={isTesting}
               className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl ${isTesting ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-black'}`}
             >
               {isTesting ? 'Validating Link...' : 'Sync Data Pathway'}
             </button>
          </div>
        </div>
        
        <div className="p-8 border-t border-slate-100 flex justify-end">
           <button onClick={onClose} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Confirm Changes</button>
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
  };

  const handleDeleteWorkflow = (id: string) => {
    if (confirm("Permanently dissolve this automation relay?")) {
      const filtered = workflows.filter(w => w.id !== id);
      setWorkflows(filtered);
      if (activeWorkflowId === id && filtered.length > 0) setActiveWorkflowId(filtered[0].id);
    }
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
      apiConnected: !!template.api,
      mcpEnabled: !!template.mcp,
      config: template.api ? { api: template.api } : {}
    });
    setShowTemplateDropdown(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center shrink-0 shadow-sm z-20">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Automation Engine</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button className="px-4 py-1.5 bg-white text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">My Relays</button>
             <button className="px-4 py-1.5 text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest">Global Marketplace</button>
          </div>
        </div>
        <button onClick={handleCreateWorkflow} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center active:scale-95">
          <Icons.Plus /> <span className="ml-2">New Workflow</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Workflow Selector */}
        <div className="w-80 border-r border-slate-200 bg-white p-6 space-y-6 shrink-0 overflow-y-auto">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Active Pipelines</h3>
          <div className="space-y-3">
            {workflows.map(w => (
              <div key={w.id} className="relative group">
                <button 
                  onClick={() => setActiveWorkflowId(w.id)}
                  className={`w-full text-left p-5 rounded-[2rem] border transition-all ${activeWorkflowId === w.id ? 'bg-indigo-50 border-indigo-200 shadow-md' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-black text-slate-900 truncate pr-4">{w.name}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${w.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{w.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-1.5">
                       {w.nodes.slice(0, 4).map((n, i) => (
                         <div key={i} className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] ${n.color.split(' ')[0]}`}>{n.icon}</div>
                       ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{w.nodes.length} Blocks</span>
                  </div>
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteWorkflow(w.id); }} className="absolute top-2 right-2 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-16 pattern-grid relative bg-slate-50/50">
          <div className="max-w-2xl mx-auto space-y-12 pb-40">
            {activeWorkflow.nodes.map((node, idx) => (
              <React.Fragment key={node.id}>
                <div 
                  onClick={() => setSelectedNode(node)}
                  className={`relative p-10 rounded-[3.5rem] border-2 bg-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group ${node.color}`}
                >
                  <div className="absolute -top-4 left-10 flex space-x-2">
                    <span className="px-3 py-1 bg-white border border-inherit rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">{node.type}</span>
                    {node.mcpEnabled && <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-[7px] font-black uppercase tracking-widest shadow-md">Neural AI</span>}
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl border border-slate-100 flex items-center justify-center text-5xl group-hover:scale-110 group-hover:rotate-3 transition-transform overflow-hidden relative shrink-0">
                      {node.logoUrl ? <img src={node.logoUrl} className="w-full h-full object-cover" /> : node.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight truncate">{node.label}</h4>
                        <div className="relative">
                           <button 
                            onClick={(e) => { e.stopPropagation(); setShowTemplateDropdown(showTemplateDropdown === node.id ? null : node.id); }}
                            className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg"
                           >
                             Quick Setup
                           </button>
                           {showTemplateDropdown === node.id && (
                             <div className="absolute right-0 top-full mt-4 w-72 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.2)] z-[100] py-6 animate-in slide-in-from-top-2">
                                <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                                  <div className="px-6 pb-2 border-b border-slate-100 mb-3"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Triggers</p></div>
                                  {TRIGGER_TEMPLATES.map(t => (
                                    <button key={t.id} onClick={(e) => { e.stopPropagation(); applyTemplate(node.id, t); }} className="w-full text-left px-6 py-2.5 hover:bg-indigo-50 flex items-center space-x-3 group/opt">
                                      <span className="text-xl group-hover/opt:scale-125 transition-transform">{t.icon}</span>
                                      <span className="text-xs font-bold text-slate-700">{t.label}</span>
                                    </button>
                                  ))}
                                  <div className="px-6 py-2 border-b border-slate-100 my-3"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logic Blocks</p></div>
                                  {LOGIC_TEMPLATES.map(t => (
                                    <button key={t.id} onClick={(e) => { e.stopPropagation(); applyTemplate(node.id, t); }} className="w-full text-left px-6 py-2.5 hover:bg-purple-50 flex items-center space-x-3 group/opt">
                                      <span className="text-xl group-hover/opt:scale-125 transition-transform">{t.icon}</span>
                                      <span className="text-xs font-bold text-slate-700">{t.label}</span>
                                    </button>
                                  ))}
                                  <div className="px-6 py-2 border-b border-slate-100 my-3"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">App Actions</p></div>
                                  {ACTION_TEMPLATES.map(t => (
                                    <button key={t.id} onClick={(e) => { e.stopPropagation(); applyTemplate(node.id, t); }} className="w-full text-left px-6 py-2.5 hover:bg-blue-50 flex items-center space-x-3 group/opt">
                                      <span className="text-xl group-hover/opt:scale-125 transition-transform">{t.icon}</span>
                                      <span className="text-xs font-bold text-slate-700">{t.label}</span>
                                    </button>
                                  ))}
                                </div>
                             </div>
                           )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 font-medium truncate mt-1">{node.description}</p>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }} className="absolute -top-3 -right-3 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">✕</button>
                </div>
                {idx < activeWorkflow.nodes.length - 1 && (
                  <div className="flex justify-center h-16"><div className="w-1 bg-slate-200 h-full rounded-full"></div></div>
                )}
              </React.Fragment>
            ))}
            
            <button 
              onClick={handleAddNode}
              className="w-full py-16 border-4 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center space-y-4 text-slate-300 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all group"
            >
              <div className="w-16 h-16 rounded-full border-4 border-inherit flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-xl">
                 <Icons.Plus />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.3em]">Append Logic Circuit</span>
            </button>
          </div>
        </div>
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
