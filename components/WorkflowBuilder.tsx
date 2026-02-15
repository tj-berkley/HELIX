
import React, { useState, useRef, useMemo } from 'react';
import { Icons } from '../constants';
import { WorkflowNode, WorkflowMaterial, Workflow } from '../types';

// Vast Library for Marketplace and Quick Setup with functional guides
interface NodeTemplate {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  category: string;
  setupGuide: {
    steps: string[];
    link: string;
    infoNeeded: string;
  };
}

const ALL_MARKETPLACE_NODES: {
  triggers: NodeTemplate[];
  actions: NodeTemplate[];
  logic: NodeTemplate[];
} = {
  triggers: [
    { 
      id: 'chatbot_trigger', 
      label: 'Neural Chatbot', 
      icon: '💬', 
      color: 'bg-indigo-100 border-indigo-300 text-indigo-800', 
      description: 'Triggers when a user initiates a chat session in the Hub.', 
      category: 'Communication',
      setupGuide: {
        steps: ['Open Communications Hub', 'Enable "Chatbot Auto-Pilot"', 'Configure Welcome Intent'],
        link: '#',
        infoNeeded: 'Chatbot ID, Workspace Context'
      }
    },
    { 
      id: 'phone_call', 
      label: 'Inbound Call', 
      icon: '📞', 
      color: 'bg-rose-100 border-rose-300 text-rose-800', 
      description: 'Triggers when an automated voice call is received.', 
      category: 'Communication',
      setupGuide: {
        steps: ['Provision a number in Connections Hub', 'Set Voice Persona', 'Configure Webhook Redirect'],
        link: '#',
        infoNeeded: 'Phone Number ID'
      }
    },
    { 
      id: 'sms_text', 
      label: 'SMS / Text', 
      icon: '📱', 
      color: 'bg-emerald-100 border-emerald-300 text-emerald-800', 
      description: 'Triggers on incoming SMS via Twilio/Telnyx.', 
      category: 'Communication',
      setupGuide: {
        steps: ['Connect Twilio in Integrations', 'Select verified mobile number', 'Define keyword triggers'],
        link: 'https://console.twilio.com',
        infoNeeded: 'Webhook URL, SID'
      }
    },
    { 
      id: 'gmail_new', 
      label: 'Gmail: New Email', 
      icon: '📧', 
      color: 'bg-rose-100 border-rose-300 text-rose-800', 
      description: 'Triggers when a new email arrives in your connected inbox.', 
      category: 'Google',
      setupGuide: {
        steps: ['Go to Google Cloud Console', 'Enable Gmail API', 'Create OAuth 2.0 Credentials'],
        link: 'https://console.cloud.google.com/apis/library/gmail.googleapis.com',
        infoNeeded: 'Client ID, Secret, Refresh Token'
      }
    },
    { 
      id: 'sheets_row', 
      label: 'Sheets: New Row', 
      icon: '📊', 
      color: 'bg-emerald-100 border-emerald-300 text-emerald-800', 
      description: 'Triggers when a new row is appended to a spreadsheet.', 
      category: 'Google',
      setupGuide: {
        steps: ['Create a Google Sheet', 'Enable Sheets API', 'Link Spreadsheet ID'],
        link: 'https://console.cloud.google.com',
        infoNeeded: 'Spreadsheet ID'
      }
    },
    { 
      id: 'webhook_in', 
      label: 'Incoming Webhook', 
      icon: '🔌', 
      color: 'bg-amber-100 border-amber-300 text-amber-800', 
      description: 'Triggers via a unique HTTP endpoint.', 
      category: 'Utilities',
      setupGuide: {
        steps: ['Copy the unique URL generated in the Config tab', 'Paste it into your external service', 'Send a test JSON payload'],
        link: '#',
        infoNeeded: 'JSON Schema'
      }
    },
    { 
      id: 'cron_timer', 
      label: 'Cron: Scheduled', 
      icon: '⏰', 
      color: 'bg-slate-100 border-slate-300 text-slate-800', 
      description: 'Runs daily at a specific designated time.', 
      category: 'Utilities',
      setupGuide: { steps: ['Define frequency', 'Set timezone', 'Choose start date'], link: '#', infoNeeded: 'Schedule Pattern' }
    },
  ],
  actions: [
    { 
      id: 'ai_agent', 
      label: 'AI Assistant Task', 
      icon: '🧠', 
      color: 'bg-indigo-600 border-indigo-400 text-white', 
      description: 'Execute reasoning or generation tasks via Gemini 3 Pro.', 
      category: 'AI',
      setupGuide: {
        steps: ['Select a Neural Identity', 'Define System Instruction', 'Map inputs to Prompt variables'],
        link: 'https://aistudio.google.com/',
        infoNeeded: 'System Global API Key'
      }
    },
    { 
      id: 'memory_store', 
      label: 'Memory Node', 
      icon: '💾', 
      color: 'bg-purple-600 border-purple-400 text-white', 
      description: 'Save data into the long-term neural memory cluster.', 
      category: 'AI',
      setupGuide: {
        steps: ['Select Target Folder in Connections Hub', 'Map data fields', 'Set expiration TTL'],
        link: '#',
        infoNeeded: 'Cluster ID'
      }
    },
    { 
      id: 'canva_node', 
      label: 'Canva Export', 
      icon: '🎨', 
      color: 'bg-sky-500 border-sky-300 text-white', 
      description: 'Push generated assets into a Canva template.', 
      category: 'Creative',
      setupGuide: {
        steps: ['Open Canva Developer account', 'Generate Project API Key', 'Link Template ID'],
        link: 'https://www.canva.com/developers/',
        infoNeeded: 'Canva API Key'
      }
    },
    { 
      id: 'invoice_gen', 
      label: 'Invoice Builder', 
      icon: '🧾', 
      color: 'bg-emerald-600 border-emerald-400 text-white', 
      description: 'Generate professional PDF invoices automatically.', 
      category: 'Financial',
      setupGuide: {
        steps: ['Set Business Identity in Profile', 'Configure Tax rates', 'Map customer email'],
        link: '#',
        infoNeeded: 'Logo Asset, Client Data'
      }
    },
    { 
      id: 'slack_msg', 
      label: 'Slack: Alert', 
      icon: '💬', 
      color: 'bg-emerald-100 border-emerald-300 text-emerald-800', 
      description: 'Notify a channel or user about this event.', 
      category: 'Communication',
      setupGuide: {
        steps: ['Create a Slack App', 'Enable Incoming Webhooks', 'Copy Webhook URL'],
        link: 'https://api.slack.com/apps',
        infoNeeded: 'Slack Webhook URL'
      }
    },
    { 
      id: 'http_req', 
      label: 'HTTP Request', 
      icon: '🌐', 
      color: 'bg-slate-800 border-slate-600 text-white', 
      description: 'Perform custom API calls (GET/POST/PUT).', 
      category: 'Utilities',
      setupGuide: { steps: ['Define URL', 'Select Method', 'Add Auth Headers'], link: '#', infoNeeded: 'API Endpoint' }
    },
  ],
  logic: [
    { 
      id: 'if_condition', 
      label: 'IF Node', 
      icon: '💎', 
      color: 'bg-purple-100 border-purple-300 text-purple-800', 
      description: 'Checks conditions and branches the relay logic.', 
      category: 'Logic',
      setupGuide: { steps: ['Define logic key', 'Choose operator', 'Set comparison value'], link: '#', infoNeeded: 'Conditional Logic' }
    },
    { 
      id: 'function_js', 
      label: 'Function (JS)', 
      icon: '⚡', 
      color: 'bg-amber-50 border-amber-200 text-amber-900', 
      description: 'Executes custom JavaScript transformation.', 
      category: 'Logic',
      setupGuide: { steps: ['Open Script Tab', 'Write async function', 'Return valid JSON'], link: '#', infoNeeded: 'JS Script' }
    },
    { 
      id: 'set_variable', 
      label: 'Set Variable', 
      icon: '📍', 
      color: 'bg-slate-100 border-slate-300 text-slate-800', 
      description: 'Assigns values for downstream use.', 
      category: 'Logic',
      setupGuide: { steps: ['Define Variable Key', 'Map value from parent node'], link: '#', infoNeeded: 'Global Vars' }
    },
  ]
};

const NodeEditorModal: React.FC<{
  node: WorkflowNode;
  onClose: () => void;
  onUpdate: (updates: Partial<WorkflowNode>) => void;
}> = ({ node, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'guide' | 'script'>('config');
  const [isTesting, setIsTesting] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const template = useMemo(() => {
    return [...ALL_MARKETPLACE_NODES.triggers, ...ALL_MARKETPLACE_NODES.actions, ...ALL_MARKETPLACE_NODES.logic]
      .find(t => t.label === node.label || t.icon === node.icon);
  }, [node]);

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
      onUpdate({ config: { ...(node.config || {}), isActive: true } });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-xl animate-in fade-in">
      <div className="bg-white w-full max-w-6xl rounded-[4rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20" onClick={(e) => e.stopPropagation()}>
        <div className={`p-12 border-b border-slate-100 flex justify-between items-center ${node.color.split(' ')[0]} bg-opacity-10`}>
          <div className="flex items-center space-x-8">
            <div 
              onClick={() => logoInputRef.current?.click()}
              className="w-24 h-24 rounded-[2.5rem] bg-white shadow-2xl border-4 border-white overflow-hidden flex items-center justify-center text-5xl cursor-pointer hover:scale-105 transition-transform"
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
                className="text-4xl font-black text-slate-900 bg-transparent border-none outline-none focus:ring-0 p-0 mb-1" 
                value={node.label} 
                onChange={(e) => onUpdate({ label: e.target.value })} 
              />
              <div className="flex items-center space-x-3 mt-2">
                 <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{node.type} node</span>
                 {node.config?.isActive && <span className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse shadow-lg shadow-emerald-500/50 ml-2"></span>}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button onClick={() => setActiveTab('config')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Configuration</button>
              <button onClick={() => setActiveTab('guide')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'guide' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Setup Guide</button>
              {node.label.includes('Function') && <button onClick={() => setActiveTab('script')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'script' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>JS Editor</button>}
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide">
            {activeTab === 'config' && (
              <div className="grid grid-cols-1 gap-10">
                <section className="space-y-6">
                   <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Protocol Handshake</h4>
                   <div className="p-10 rounded-[3rem] border-2 border-indigo-100 bg-white shadow-xl space-y-8">
                      <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-3 space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Method</label>
                           <select 
                            className="w-full bg-slate-100 border-none rounded-2xl p-5 text-sm font-black text-indigo-600"
                            value={node.config?.api?.method || 'POST'}
                            onChange={(e) => handleUpdateConfig('api', { method: e.target.value })}
                           >
                              <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                           </select>
                        </div>
                        <div className="col-span-9 space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Production URL</label>
                           <input 
                              type="text" 
                              className="w-full bg-slate-100 border-none rounded-2xl p-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500" 
                              placeholder="https://api.provider.com/v1/endpoint"
                              value={node.config?.api?.url || ''}
                              onChange={(e) => handleUpdateConfig('api', { url: e.target.value })}
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Auth Token (Bearer / Key)</label>
                        <input 
                          type="password" 
                          className="w-full bg-slate-100 border-none rounded-2xl p-5 text-xs font-mono"
                          placeholder="sk-..."
                          value={node.config?.api?.auth || ''}
                          onChange={(e) => handleUpdateConfig('api', { auth: e.target.value })}
                        />
                      </div>
                   </div>
                </section>
                <section className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Contextual Instructions</h4>
                   <textarea 
                      className="w-full h-32 p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] outline-none text-sm font-medium resize-none shadow-inner italic"
                      placeholder="Specify logic requirements for this specific node..."
                      value={node.description}
                      onChange={(e) => onUpdate({ description: e.target.value })}
                   />
                </section>
              </div>
            )}
            {activeTab === 'guide' && template && (
              <div className="space-y-12 animate-in slide-in-from-bottom-4">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Node Setup Strategy</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {template.setupGuide.steps.map((step, i) => (
                      <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
                         <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">0{i+1}</div>
                         <p className="text-sm font-black text-slate-800 leading-snug">{step}</p>
                      </div>
                    ))}
                 </div>
                 <div className="p-12 bg-slate-900 rounded-[3.5rem] text-white flex justify-between items-center shadow-2xl relative overflow-hidden group">
                    <div className="space-y-2 relative z-10">
                       <h4 className="text-2xl font-black tracking-tight">Acquire Credentials</h4>
                       <p className="text-indigo-200 text-sm opacity-80">Obtain the necessary keys from the provider portal.</p>
                    </div>
                    {template.setupGuide.link !== '#' && (
                      <a href={template.setupGuide.link} target="_blank" className="px-10 py-5 bg-white text-slate-900 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all transform active:scale-95">Go to Console →</a>
                    )}
                 </div>
                 <div className="p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-center space-x-6">
                    <span className="text-4xl">📋</span>
                    <p className="text-lg font-black text-indigo-900">{template.setupGuide.infoNeeded}</p>
                 </div>
              </div>
            )}
            {activeTab === 'script' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 h-full flex flex-col">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter">JS Logic Engine</h3>
                 <div className="flex-1 bg-slate-950 rounded-[3rem] p-12 font-mono text-emerald-400 shadow-2xl relative">
                    <textarea 
                      className="w-full h-full bg-transparent border-none outline-none focus:ring-0 resize-none leading-relaxed"
                      defaultValue={`const main = async (payload) => {\n  return { ...payload, processed: true };\n};`}
                    />
                 </div>
              </div>
            )}
          </div>
          <div className="w-96 border-l border-slate-100 bg-slate-50/50 p-12 flex flex-col space-y-10">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signal Telemetry</h4>
             <div className="space-y-4">
                <div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
                   <span className="text-[11px] font-black uppercase text-slate-400">Connection</span>
                   <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${node.config?.isActive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>{node.config?.isActive ? 'Synced' : 'Offline'}</span>
                </div>
             </div>
             <div className="flex-1 flex flex-col justify-end pb-6">
                <button onClick={simulateConnection} disabled={isTesting} className="w-full py-8 rounded-[2.5rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl">{isTesting ? 'Validating...' : 'Simulate Handshake'}</button>
             </div>
          </div>
        </div>
        <div className="p-10 border-t border-slate-100 flex justify-end bg-white">
           <button onClick={onClose} className="px-20 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-700 active:scale-95 transition-all">Confirm Logic</button>
        </div>
      </div>
    </div>
  );
};

const WorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    const saved = localStorage.getItem('OMNI_WORKFLOWS_V3');
    return saved ? JSON.parse(saved) : [
      {
        id: 'w-default',
        name: 'Inbound Inquiry Relay',
        status: 'Active',
        nodes: [
          { id: 'n-trig-1', type: 'trigger', label: 'Neural Chatbot', description: 'Triggers when user initiates Hub session.', icon: '💬', color: 'bg-indigo-100 border-indigo-300 text-indigo-800', apiConnected: true, mcpEnabled: false, materials: [] },
          { id: 'n-act-1', type: 'action', label: 'AI Assistant Task', description: 'Execute reasoning tasks via Gemini 3 Pro.', icon: '🧠', color: 'bg-indigo-600 border-indigo-400 text-white', apiConnected: true, mcpEnabled: false, materials: [] },
          { id: 'n-act-2', type: 'action', label: 'Slack: Alert', description: 'Notify channel of session outcome.', icon: '💬', color: 'bg-emerald-100 border-emerald-300 text-emerald-800', apiConnected: true, mcpEnabled: false, materials: [] },
        ]
      }
    ];
  });
  
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(workflows[0].id);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'my-relays' | 'marketplace'>('my-relays');
  const [marketplaceSearch, setMarketplaceSearch] = useState('');

  const activeWorkflow = useMemo(() => workflows.find(w => w.id === activeWorkflowId) || workflows[0], [workflows, activeWorkflowId]);

  const saveWorkflows = (updated: Workflow[]) => {
    setWorkflows(updated);
    localStorage.setItem('OMNI_WORKFLOWS_V3', JSON.stringify(updated));
  };

  const handleCreateWorkflow = () => {
    const id = `w-${Date.now()}`;
    const newW: Workflow = { id, name: 'Untitled Relay', status: 'Draft', nodes: [{ id: `n-trig-${Date.now()}`, type: 'trigger', label: 'Incoming Webhook', description: 'Define entry signal', icon: '⚡', color: 'bg-amber-50 border-amber-200 text-amber-700', apiConnected: false, mcpEnabled: false, materials: [] }] };
    saveWorkflows([newW, ...workflows]);
    setActiveWorkflowId(id);
    setViewMode('my-relays');
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    const updated = workflows.map(w => w.id === activeWorkflowId ? { ...w, nodes: w.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n) } : w);
    saveWorkflows(updated);
    if (selectedNode?.id === nodeId) setSelectedNode(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleDeleteNode = (nodeId: string) => {
    saveWorkflows(workflows.map(w => w.id === activeWorkflowId ? { ...w, nodes: w.nodes.filter(n => n.id !== nodeId) } : w));
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
    const newNode: WorkflowNode = { id: `n-installed-${Date.now()}`, type, label: template.label, description: template.description, icon: template.icon, color: template.color, apiConnected: false, mcpEnabled: false, materials: [] };
    saveWorkflows(workflows.map(w => w.id === activeWorkflowId ? { ...w, nodes: [...w.nodes, newNode] } : w));
    setViewMode('my-relays');
    setSelectedNode(newNode);
  };

  const filteredMarketplace = useMemo(() => {
    const search = marketplaceSearch.toLowerCase();
    const categories = ['triggers', 'actions', 'logic'] as const;
    const result: any = { triggers: [], actions: [], logic: [] };
    categories.forEach(cat => {
      result[cat] = ALL_MARKETPLACE_NODES[cat].filter(n => n.label.toLowerCase().includes(search) || n.description.toLowerCase().includes(search) || n.category.toLowerCase().includes(search));
    });
    return result;
  }, [marketplaceSearch]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8faff] overflow-hidden">
      <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 z-20 shadow-sm">
        <div className="flex items-center space-x-8">
          <div className="space-y-1">
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Automation Architect</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Neural Relay OS v4.5</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] shadow-inner">
             <button onClick={() => setViewMode('my-relays')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'my-relays' ? 'bg-white text-indigo-600 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}>Active Relays</button>
             <button onClick={() => setViewMode('marketplace')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'marketplace' ? 'bg-white text-indigo-600 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}>Marketplace</button>
          </div>
        </div>
        <button onClick={handleCreateWorkflow} className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center active:scale-95 group"><span className="mr-3 text-xl group-hover:rotate-90 transition-transform">➕</span> New Relay</button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {viewMode === 'my-relays' ? (
          <>
            <div className="w-[400px] border-r border-slate-100 bg-white p-10 space-y-8 shrink-0 overflow-y-auto">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Project Pipelines</h3>
              <div className="space-y-4">
                {workflows.map(w => (
                  <div key={w.id} className="relative group">
                    <button onClick={() => setActiveWorkflowId(w.id)} className={`w-full text-left p-8 rounded-[3rem] border-2 transition-all relative overflow-hidden ${activeWorkflowId === w.id ? 'bg-indigo-50 border-indigo-500 shadow-2xl scale-[1.02]' : 'bg-white border-slate-50 hover:border-indigo-100 shadow-sm'}`}>
                      <div className="flex justify-between items-start mb-6"><span className="font-black text-slate-900 truncate pr-6 text-xl tracking-tight">{w.name}</span><span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${w.status === 'Active' ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{w.status}</span></div>
                      <div className="flex items-center space-x-4"><div className="flex -space-x-3">{w.nodes.slice(0, 4).map((n, i) => (<div key={i} className={`w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center text-lg shadow-xl ${n.color.split(' ')[0]} group-hover:scale-110 transition-transform`}>{n.icon}</div>))}</div><span className="text-[11px] font-black text-slate-900 block uppercase tracking-widest">{w.nodes.length} Blocks</span></div>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if(confirm("Purge?")) saveWorkflows(workflows.filter(item => item.id !== w.id)); }} className="absolute -top-1 -right-1 p-3 bg-white border border-slate-200 text-slate-300 hover:text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-2xl z-10">✕</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-auto p-20 pattern-grid relative bg-[#fcfdff]">
              <div className="max-w-2xl mx-auto space-y-16 pb-60">
                {activeWorkflow.nodes.map((node, idx) => (
                  <React.Fragment key={node.id}>
                    <div onClick={() => setSelectedNode(node)} className={`relative p-12 rounded-[5rem] border-2 bg-white shadow-[0_40px_80px_rgba(0,0,0,0.04)] hover:shadow-[0_60px_120px_rgba(79,70,229,0.12)] transition-all cursor-pointer group ${node.color} transform hover:-translate-y-2 ${showTemplateDropdown === node.id ? 'z-[100]' : 'z-10'}`}>
                      <div className="absolute -top-5 left-16 flex space-x-3 z-10"><span className="px-6 py-2 bg-white border border-inherit rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-xl">{node.type}</span>{node.config?.isActive && <span className="px-4 py-2 bg-emerald-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center animate-in zoom-in"><span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>Linked</span>}</div>
                      <div className="flex items-center space-x-12"><div className="w-32 h-32 rounded-[3.5rem] bg-white shadow-2xl border-[6px] border-white flex items-center justify-center text-7xl overflow-hidden relative shrink-0">{node.logoUrl ? <img src={node.logoUrl} className="w-full h-full object-cover" /> : node.icon}</div><div className="flex-1 min-w-0"><div className="flex justify-between items-start"><div><h4 className="text-4xl font-black text-slate-900 tracking-tighter truncate leading-none">{node.label}</h4><p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Active Pipeline</p></div><div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setShowTemplateDropdown(showTemplateDropdown === node.id ? null : node.id); }} className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl">Quick Config</button>
                        {showTemplateDropdown === node.id && (
                          <div className="absolute right-0 top-full mt-6 w-[400px] bg-white/95 backdrop-blur-3xl border border-slate-200 rounded-[4rem] shadow-[0_80px_160px_rgba(0,0,0,0.3)] z-[200] py-10 animate-in slide-in-from-top-6 duration-500 overflow-hidden">
                             <div className="max-h-[500px] overflow-y-auto scrollbar-hide px-4">
                               {Object.entries(ALL_MARKETPLACE_NODES).map(([groupName, items]) => (
                                 <div key={groupName} className="mb-8">
                                    <div className="px-8 pb-3 border-b border-slate-100 mb-4 flex justify-between items-center"><p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{groupName}</p><span className="text-[9px] font-bold text-slate-300 uppercase">{items.length} Options</span></div>
                                    <div className="space-y-1">{items.map(t => (<button key={t.id} onClick={(e) => { e.stopPropagation(); applyTemplate(node.id, t); }} className="w-full text-left px-8 py-5 hover:bg-slate-50 rounded-[2.5rem] transition-all flex items-center space-x-6 group/opt"><span className="text-4xl group-hover/opt:scale-125 transition-transform duration-500">{t.icon}</span><div className="min-w-0"><span className="text-sm font-black text-slate-900 block truncate group-hover/opt:text-indigo-600 transition-colors">{t.label}</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.category}</span></div></button>))}</div>
                                 </div>
                               ))}
                             </div>
                          </div>
                        )}
                      </div></div><p className="text-lg text-slate-500 font-medium truncate mt-4 pr-16 italic opacity-70">"{node.description}"</p></div></div>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }} className="absolute -top-5 -right-5 w-14 h-14 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 group-hover:rotate-90">✕</button>
                    </div>
                    {idx < activeWorkflow.nodes.length - 1 && (
                      <div className="flex justify-center h-24 items-center"><div className="w-2 h-full bg-slate-200/40 rounded-full flex items-center justify-center relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-b from-indigo-500 via-transparent to-transparent h-20 animate-scroll-down"></div><div className="w-6 h-6 bg-white border-4 border-slate-100 rounded-full shadow-2xl z-10"></div></div></div>
                    )}
                  </React.Fragment>
                ))}
                <button onClick={() => { const newNode: WorkflowNode = { id: `n-${Date.now()}`, type: 'action', label: 'New Action', description: 'Configuring...', icon: '⚙️', color: 'bg-slate-50 border-slate-200 text-slate-600', apiConnected: false, mcpEnabled: false, materials: [] }; saveWorkflows(workflows.map(w => w.id === activeWorkflowId ? { ...w, nodes: [...w.nodes, newNode] } : w)); setSelectedNode(newNode); }} className="w-full py-28 border-4 border-dashed border-slate-200 rounded-[6rem] flex flex-col items-center justify-center space-y-8 text-slate-300 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all group relative overflow-hidden shadow-inner"><div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-700"></div><div className="w-24 h-24 rounded-[2.5rem] border-4 border-inherit flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-[0_30px_60px_rgba(0,0,0,0.1)] relative z-10 group-hover:rotate-90"><span className="text-4xl">➕</span></div><div className="text-center relative z-10 space-y-2"><span className="text-sm font-black uppercase tracking-[0.5em] block text-slate-400 group-hover:text-indigo-600">Append Relay Stage</span><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-40">Extend your autonomous logic circuit</span></div></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col bg-white animate-in slide-in-from-right-10 duration-700 overflow-y-auto">
             <div className="p-20 border-b border-slate-50 bg-slate-50/30 backdrop-blur-3xl relative overflow-hidden">
                <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                   <div className="flex justify-between items-end">
                      <div className="space-y-3"><h3 className="text-7xl font-black text-slate-900 tracking-tighter leading-none">Node Marketplace</h3><p className="text-2xl text-slate-400 font-medium tracking-tight">Deploy pre-built communication hubs and AI logic blocks.</p></div>
                      <div className="relative group"><Icons.Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600" /><input type="text" placeholder="Search relays..." className="w-[550px] pl-20 pr-10 py-7 bg-white border-2 border-slate-100 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.08)] text-xl font-medium focus:ring-4 focus:ring-indigo-100 outline-none" value={marketplaceSearch} onChange={(e) => setMarketplaceSearch(e.target.value)} /></div>
                   </div>
                </div>
             </div>
             <div className="flex-1 p-20 bg-white"><div className="max-w-6xl mx-auto space-y-24">
                {Object.entries(filteredMarketplace).map(([catName, nodes]: [string, any[]]) => nodes.length > 0 && (
                  <div key={catName} className="space-y-12 animate-in fade-in slide-in-from-bottom-5">
                     <div className="flex items-center space-x-6 border-b border-slate-50 pb-6"><h4 className="text-lg font-black text-slate-900 uppercase tracking-[0.5em]">{catName}</h4><span className="text-[11px] font-black bg-slate-900 text-white px-4 py-1.5 rounded-full uppercase tracking-widest">{nodes.length} Blocks Available</span></div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">{nodes.map(node => (
                       <div key={node.id} className="bg-white border-2 border-slate-50 rounded-[4rem] p-12 flex flex-col space-y-8 hover:shadow-[0_60px_120px_rgba(79,70,229,0.15)] hover:border-indigo-100 transition-all group relative overflow-hidden shadow-sm">
                          <div className="flex justify-between items-start"><div className={`w-24 h-24 rounded-[3rem] flex items-center justify-center text-6xl shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 ${node.color} group-hover:shadow-indigo-500/40`}>{node.icon}</div><span className="text-[10px] font-black bg-slate-50 text-slate-400 border border-slate-100 px-4 py-1.5 rounded-full uppercase tracking-widest">{node.category}</span></div>
                          <div className="space-y-2 flex-1"><h5 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">{node.label}</h5><p className="text-sm text-slate-400 font-medium leading-relaxed italic pr-6 group-hover:text-slate-500 transition-colors">"{node.description}"</p></div>
                          <button onClick={() => installNode(node)} className="w-full py-6 bg-slate-900 text-white rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-indigo-600 shadow-2xl transition-all active:scale-95 group-hover:-translate-y-2">Deploy to Canvas</button>
                       </div>
                     ))}</div>
                  </div>
                ))}
             </div></div>
          </div>
        )}
      </div>

      {selectedNode && <NodeEditorModal node={selectedNode} onClose={() => setSelectedNode(null)} onUpdate={(u) => handleUpdateNode(selectedNode.id, u)} />}
      <style>{`@keyframes scroll-down { 0% { transform: translateY(-100%); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(100%); opacity: 0; } } .animate-scroll-down { animation: scroll-down 3s linear infinite; }`}</style>
    </div>
  );
};

export default WorkflowBuilder;
