
import React, { useState, useRef, useMemo } from 'react';
import { Icons } from '../constants';
import { WorkflowNode, WorkflowMaterial, Workflow } from '../types';

// Enhanced Node Registry with Instructions and Links
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
      description: 'Triggers when a user initiates a chat session in the Communications Hub.', 
      category: 'Communication',
      setupGuide: {
        steps: ['Open Communications Hub', 'Enable "Chatbot Auto-Pilot"', 'Configure Welcome Intent'],
        link: '#',
        infoNeeded: 'Chatbot ID, Workspace Context'
      }
    },
    { 
      id: 'webhook_in', 
      label: 'Incoming Webhook', 
      icon: '🔌', 
      color: 'bg-amber-100 border-amber-300 text-amber-800', 
      description: 'Triggers via a unique HTTP endpoint from any external service.', 
      category: 'Utilities',
      setupGuide: {
        steps: ['Copy the auto-generated URL below', 'Paste it into your external app (Stripe, GitHub, etc)', 'Send a test JSON payload'],
        link: 'https://docs.omniportal.io/webhooks',
        infoNeeded: 'JSON Structure'
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
        steps: ['Select a Neural Identity (e.g. Architect)', 'Define System Instruction', 'Map inputs to Prompt variables'],
        link: 'https://aistudio.google.com/',
        infoNeeded: 'System Global API Key'
      }
    },
    { 
      id: 'canva_node', 
      label: 'Canva Export', 
      icon: '🎨', 
      color: 'bg-sky-500 border-sky-300 text-white', 
      description: 'Push generated assets or text into a Canva design template.', 
      category: 'Creative',
      setupGuide: {
        steps: ['Create a Canva Developer account', 'Generate a Project API Key', 'Select Template ID'],
        link: 'https://www.canva.com/developers/',
        infoNeeded: 'Canva Project ID'
      }
    },
    { 
      id: 'invoice_gen', 
      label: 'Invoice Builder', 
      icon: '🧾', 
      color: 'bg-emerald-600 border-emerald-400 text-white', 
      description: 'Generate professional PDF invoices and send via configured channel.', 
      category: 'Financial',
      setupGuide: {
        steps: ['Upload Business Logo in Business Identity', 'Configure Tax Rates', 'Set Currency Code'],
        link: '#',
        infoNeeded: 'Client Email, Line Items'
      }
    },
  ],
  logic: [
    { id: 'if_condition', label: 'IF Node', icon: '💎', color: 'bg-purple-100 border-purple-300 text-purple-800', description: 'Checks conditions and branches the relay logic.', category: 'Logic', setupGuide: { steps: ['Define key to check', 'Select operator (equals, contains)', 'Provide value'], link: '#', infoNeeded: 'Logic Path' } },
    { id: 'function_js', label: 'Function (JS)', icon: '⚡', color: 'bg-amber-50 border-amber-200 text-amber-900', description: 'Executes custom JavaScript transformation.', category: 'Logic', setupGuide: { steps: ['Write JS code in the editor', 'Define return object', 'Test with mock data'], link: '#', infoNeeded: 'Script Payload' } },
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
        
        {/* Header */}
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
                 {node.config?.isActive && (
                   <span className="flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span> ACTIVE CONNECTION
                   </span>
                 )}
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

        {/* Content Tabs */}
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide">
            {activeTab === 'config' && (
              <div className="grid grid-cols-1 gap-10 animate-in slide-in-from-bottom-4">
                <section className="space-y-6">
                   <div className="flex justify-between items-center px-2">
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Connection & API Settings</h4>
                      <button onClick={() => onUpdate({ apiConnected: !node.apiConnected })} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${node.apiConnected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                        {node.apiConnected ? 'External API: Linked' : 'Link External API'}
                      </button>
                   </div>
                   
                   <div className={`p-10 rounded-[3rem] border-2 transition-all space-y-8 ${node.apiConnected ? 'bg-white border-indigo-500 shadow-2xl' : 'bg-slate-50 border-slate-100 opacity-50 pointer-events-none grayscale'}`}>
                      <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-3 space-y-3">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Method</label>
                           <select 
                            className="w-full bg-slate-100 border-none rounded-2xl p-5 text-sm font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={node.config?.api?.method || 'POST'}
                            onChange={(e) => handleUpdateConfig('api', { method: e.target.value })}
                           >
                              <option>GET</option>
                              <option>POST</option>
                              <option>PUT</option>
                              <option>PATCH</option>
                              <option>DELETE</option>
                           </select>
                        </div>
                        <div className="col-span-9 space-y-3">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Production Endpoint URL</label>
                           <input 
                              type="text" 
                              className="w-full bg-slate-100 border-none rounded-2xl p-5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" 
                              placeholder="https://api.yourprovider.com/v1/resource"
                              value={node.config?.api?.url || ''}
                              onChange={(e) => handleUpdateConfig('api', { url: e.target.value })}
                           />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Authorization Token (Bearer/API Key)</label>
                            <input 
                              type="password" 
                              className="w-full bg-slate-100 border-none rounded-2xl p-5 text-xs font-mono text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                              value={node.config?.api?.auth || ''}
                              onChange={(e) => handleUpdateConfig('api', { auth: e.target.value })}
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Content Header</label>
                            <input 
                              type="text" 
                              className="w-full bg-slate-100 border-none rounded-2xl p-5 text-xs font-bold text-slate-500 outline-none"
                              value="application/json"
                              readOnly
                            />
                         </div>
                      </div>
                   </div>
                </section>

                <section className="space-y-6">
                   <div className="flex justify-between items-center px-2">
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Logic Parameters</h4>
                   </div>
                   <textarea 
                      className="w-full h-32 p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-sm font-medium resize-none shadow-inner italic"
                      placeholder="Specify custom parameters or instructions for this node (e.g. 'Format currency as USD', 'Extract user email')..."
                      value={node.description}
                      onChange={(e) => onUpdate({ description: e.target.value })}
                   />
                </section>
              </div>
            )}

            {activeTab === 'guide' && template && (
              <div className="space-y-12 animate-in slide-in-from-bottom-4">
                 <div className="space-y-4">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Implementation Strategy</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">Follow these precise steps to establish a reliable neural relay for the <span className="text-indigo-600 font-black">{node.label}</span> node.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {template.setupGuide.steps.map((step, i) => (
                      <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4 shadow-inner group/step hover:bg-white hover:border-indigo-200 transition-all">
                         <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg group-hover/step:bg-indigo-600 transition-colors">0{i+1}</div>
                         <p className="text-sm font-black text-slate-800 leading-snug">{step}</p>
                      </div>
                    ))}
                 </div>

                 <div className="p-12 bg-slate-900 rounded-[3.5rem] text-white flex justify-between items-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-1000 pointer-events-none">
                       <span className="text-[160px]">🔑</span>
                    </div>
                    <div className="space-y-2 relative z-10">
                       <h4 className="text-3xl font-black tracking-tight leading-none mb-4">Acquire Node Credentials</h4>
                       <p className="text-indigo-200 text-lg font-medium opacity-80">Access the provider console to authorize this specific relay pathway.</p>
                    </div>
                    {template.setupGuide.link !== '#' && (
                      <a 
                        href={template.setupGuide.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-12 py-6 bg-white text-slate-900 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-50 transition-all transform active:scale-95 relative z-10"
                      >
                         Go to Console →
                      </a>
                    )}
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Metadata / Context Required</h4>
                    <div className="p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-center space-x-6">
                       <span className="text-4xl">📋</span>
                       <p className="text-lg font-black text-indigo-900">{template.setupGuide.infoNeeded}</p>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'script' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 h-full flex flex-col">
                 <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Logic Scripting Interface</h3>
                    <p className="text-slate-500 font-medium">Write custom JavaScript to transform your relay data stream.</p>
                 </div>
                 <div className="flex-1 bg-slate-950 rounded-[3rem] p-12 font-mono text-[13px] text-emerald-400 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-6 right-10 flex space-x-2">
                       <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                       <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                       <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <textarea 
                      className="w-full h-full bg-transparent border-none outline-none focus:ring-0 resize-none text-emerald-400 leading-relaxed scrollbar-hide"
                      spellCheck={false}
                      defaultValue={`/**
 * Custom Data Transformation Logic
 * Access incoming data via payload object
 */
const main = async (payload) => {
  const { data, meta } = payload;

  // Process data...
  const result = {
    processed: true,
    timestamp: new Date().toISOString(),
    original: data
  };

  return result;
};`}
                    />
                 </div>
                 <button className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-black transition-all shadow-xl">Run Logic Validation</button>
              </div>
            )}
          </div>

          {/* Sidebar Matrix */}
          <div className="w-96 border-l border-slate-100 bg-slate-50/50 p-12 shrink-0 space-y-12 flex flex-col">
             <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relay Health Matrix</h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-center p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                      <span className="text-[11px] font-black uppercase text-slate-400">Handshake</span>
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${node.config?.isActive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                        {node.config?.isActive ? 'SYNCED' : 'PENDING'}
                      </span>
                   </div>
                   <div className="flex justify-between items-center p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                      <span className="text-[11px] font-black uppercase text-slate-400">Signal Crypt</span>
                      <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full text-slate-400 bg-slate-100">SHA-256 Active</span>
                   </div>
                </div>
             </div>

             <div className="flex-1 flex flex-col justify-end space-y-6 pb-6">
                <button 
                  onClick={simulateConnection}
                  disabled={isTesting || !node.apiConnected}
                  className={`w-full py-8 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl transform active:scale-95 ${
                    isTesting ? 'bg-slate-200 text-slate-400 cursor-wait' : 
                    !node.apiConnected ? 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed' :
                    'bg-slate-900 text-white hover:bg-black'
                  }`}
                >
                  {isTesting ? 'Validating Handshake...' : 'Simulate Handshake'}
                </button>
                <p className="text-[10px] text-slate-400 font-bold text-center italic leading-relaxed px-6 opacity-60">Handshake simulation attempts a zero-knowledge signal test with the target endpoint.</p>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-slate-100 flex justify-end bg-white">
           <button 
             onClick={onClose} 
             className="px-20 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-700 active:scale-95 transition-all"
           >
             Confirm Node Logic
           </button>
        </div>
      </div>
    </div>
  );
};

const WorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    const saved = localStorage.getItem('OMNI_WORKFLOWS_V2');
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
    localStorage.setItem('OMNI_WORKFLOWS_V2', JSON.stringify(updated));
  };

  const handleCreateWorkflow = () => {
    const id = `w-${Date.now()}`;
    const newW: Workflow = {
      id,
      name: 'Untitled Relay',
      status: 'Draft',
      nodes: [{ id: `n-trig-${Date.now()}`, type: 'trigger', label: 'Incoming Webhook', description: 'Define entry signal', icon: '⚡', color: 'bg-amber-50 border-amber-200 text-amber-700', apiConnected: false, mcpEnabled: false, materials: [] }]
    };
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
    const updated = workflows.map(w => w.id === activeWorkflowId ? { ...w, nodes: w.nodes.filter(n => n.id !== nodeId) } : w);
    saveWorkflows(updated);
  };

  const handleAddNode = () => {
    const newNode: WorkflowNode = { id: `n-${Date.now()}`, type: 'action', label: 'New Action', description: 'Configuring node...', icon: '⚙️', color: 'bg-slate-50 border-slate-200 text-slate-600', apiConnected: false, mcpEnabled: false, materials: [] };
    const updated = workflows.map(w => w.id === activeWorkflowId ? { ...w, nodes: [...w.nodes, newNode] } : w);
    saveWorkflows(updated);
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
    const updated = workflows.map(w => w.id === activeWorkflowId ? { ...w, nodes: [...w.nodes, newNode] } : w);
    saveWorkflows(updated);
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
    <div className="flex-1 flex flex-col h-full bg-[#f8faff] overflow-hidden">
      {/* OS Top Bar */}
      <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 z-20 shadow-sm">
        <div className="flex items-center space-x-8">
          <div className="space-y-1">
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Automation Architect</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Neural Relay OS v4.5</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] shadow-inner">
             <button 
               onClick={() => setViewMode('my-relays')}
               className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'my-relays' ? 'bg-white text-indigo-600 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
             >
                Active Relays
             </button>
             <button 
               onClick={() => setViewMode('marketplace')}
               className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'marketplace' ? 'bg-white text-indigo-600 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
             >
                Node Marketplace
             </button>
          </div>
        </div>
        <button onClick={handleCreateWorkflow} className="px-12 py-4 bg-slate-900 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center active:scale-95 group">
          <span className="mr-3 text-xl group-hover:rotate-90 transition-transform">➕</span> Initiate New Relay
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {viewMode === 'my-relays' ? (
          <>
            {/* Sidebar List */}
            <div className="w-[400px] border-r border-slate-100 bg-white p-10 space-y-8 shrink-0 overflow-y-auto">
              <div className="flex justify-between items-center px-2">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Project Pipelines</h3>
                 <span className="text-[10px] font-black bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full uppercase">{workflows.length} Total</span>
              </div>
              <div className="space-y-4">
                {workflows.map(w => (
                  <div key={w.id} className="relative group">
                    <button 
                      onClick={() => setActiveWorkflowId(w.id)}
                      className={`w-full text-left p-8 rounded-[3rem] border-2 transition-all relative overflow-hidden ${activeWorkflowId === w.id ? 'bg-indigo-50 border-indigo-500 shadow-2xl scale-[1.02]' : 'bg-white border-slate-50 hover:border-indigo-100 shadow-sm'}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className="font-black text-slate-900 truncate pr-6 text-xl tracking-tight">{w.name}</span>
                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${w.status === 'Active' ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{w.status}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex -space-x-3">
                           {w.nodes.slice(0, 4).map((n, i) => (
                             <div key={i} className={`w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center text-lg shadow-xl ${n.color.split(' ')[0]} group-hover:scale-110 transition-transform`}>{n.icon}</div>
                           ))}
                           {w.nodes.length > 4 && <div className="w-10 h-10 rounded-2xl border-4 border-white bg-slate-900 flex items-center justify-center text-[10px] font-black text-white">+{w.nodes.length - 4}</div>}
                        </div>
                        <div className="space-y-0.5">
                           <span className="text-[11px] font-black text-slate-900 block uppercase tracking-widest">{w.nodes.length} Blocks</span>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Operational Circuit</span>
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm("Permanently purge this relay?")) saveWorkflows(workflows.filter(item => item.id !== w.id)); }} 
                      className="absolute -top-1 -right-1 p-3 bg-white border border-slate-200 text-slate-300 hover:text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-2xl z-10 hover:rotate-90"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 overflow-auto p-20 pattern-grid relative bg-[#fcfdff]">
              <div className="max-w-2xl mx-auto space-y-16 pb-60">
                {activeWorkflow.nodes.map((node, idx) => (
                  <React.Fragment key={node.id}>
                    <div 
                      onClick={() => setSelectedNode(node)}
                      className={`relative p-12 rounded-[5rem] border-2 bg-white shadow-[0_40px_80px_rgba(0,0,0,0.04)] hover:shadow-[0_60px_120px_rgba(79,70,229,0.12)] transition-all cursor-pointer group ${node.color} group/node transform hover:-translate-y-2 ${showTemplateDropdown === node.id ? 'z-[100]' : 'z-10'}`}
                    >
                      <div className="absolute -top-5 left-16 flex space-x-3 z-10">
                        <span className="px-6 py-2 bg-white border border-inherit rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-xl">{node.type} Node</span>
                        {node.config?.isActive && <span className="px-4 py-2 bg-emerald-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center animate-in zoom-in"><span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>Linked</span>}
                      </div>
                      
                      <div className="flex items-center space-x-12">
                        <div className="w-32 h-32 rounded-[3.5rem] bg-white shadow-2xl border-[6px] border-white flex items-center justify-center text-7xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 overflow-hidden relative shrink-0">
                          {node.logoUrl ? <img src={node.logoUrl} className="w-full h-full object-cover" /> : node.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                               <h4 className="text-4xl font-black text-slate-900 tracking-tighter truncate leading-none">{node.label}</h4>
                               <div className="flex items-center space-x-3 mt-3">
                                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Telemetry: Optimized</p>
                               </div>
                            </div>
                            <div className="relative">
                               <button 
                                onClick={(e) => { e.stopPropagation(); setShowTemplateDropdown(showTemplateDropdown === node.id ? null : node.id); }}
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl hover:-translate-y-0.5"
                               >
                                 Quick Config
                               </button>
                               {showTemplateDropdown === node.id && (
                                 <div className="absolute right-0 top-full mt-6 w-[400px] bg-white/95 backdrop-blur-3xl border border-slate-200 rounded-[4rem] shadow-[0_80px_160px_rgba(0,0,0,0.3)] z-[200] py-10 animate-in slide-in-from-top-6 duration-500 overflow-hidden">
                                    <div className="max-h-[500px] overflow-y-auto scrollbar-hide px-4">
                                      {Object.entries(ALL_MARKETPLACE_NODES).map(([groupName, items]) => (
                                        <div key={groupName} className="mb-8">
                                           <div className="px-8 pb-3 border-b border-slate-100 mb-4 flex justify-between items-center">
                                              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{groupName}</p>
                                              <span className="text-[9px] font-bold text-slate-300 uppercase">{items.length} Options</span>
                                           </div>
                                           <div className="space-y-1">
                                             {items.map(t => (
                                               <button key={t.id} onClick={(e) => { e.stopPropagation(); applyTemplate(node.id, t); }} className="w-full text-left px-8 py-5 hover:bg-slate-50 rounded-[2.5rem] transition-all flex items-center space-x-6 group/opt">
                                                 <span className="text-4xl group-hover/opt:scale-125 transition-transform duration-500 drop-shadow-xl">{t.icon}</span>
                                                 <div className="min-w-0">
                                                    <span className="text-sm font-black text-slate-900 block truncate group-hover/opt:text-indigo-600 transition-colors">{t.label}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.category}</span>
                                                 </div>
                                               </button>
                                             ))}
                                           </div>
                                        </div>
                                      ))}
                                    </div>
                                 </div>
                               )}
                            </div>
                          </div>
                          <p className="text-lg text-slate-500 font-medium truncate mt-4 pr-16 italic opacity-70">"{node.description}"</p>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }} className="absolute -top-5 -right-5 w-14 h-14 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 group-hover:rotate-90">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all text-indigo-400 scale-150 group-hover:translate-x-4"><Icons.ChevronRight /></div>
                    </div>
                    {idx < activeWorkflow.nodes.length - 1 && (
                      <div className="flex justify-center h-24 items-center">
                         <div className="w-2 h-full bg-slate-200/40 rounded-full flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500 via-transparent to-transparent h-20 animate-scroll-down"></div>
                            <div className="w-6 h-6 bg-white border-4 border-slate-100 rounded-full shadow-2xl z-10"></div>
                         </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
                
                <button 
                  onClick={handleAddNode}
                  className="w-full py-28 border-4 border-dashed border-slate-200 rounded-[6rem] flex flex-col items-center justify-center space-y-8 text-slate-300 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all group relative overflow-hidden shadow-inner"
                >
                  <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-700"></div>
                  <div className="w-24 h-24 rounded-[2.5rem] border-4 border-inherit flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-[0_30px_60px_rgba(0,0,0,0.1)] relative z-10 group-hover:rotate-90">
                     <span className="text-4xl">➕</span>
                  </div>
                  <div className="text-center relative z-10 space-y-2">
                     <span className="text-sm font-black uppercase tracking-[0.5em] block text-slate-400 group-hover:text-indigo-600">Append Relay Stage</span>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-40">Extend your autonomous logic circuit</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Marketplace View */
          <div className="flex-1 flex flex-col bg-white animate-in slide-in-from-right-10 duration-700">
            <div className="p-20 border-b border-slate-50 bg-slate-50/30 backdrop-blur-3xl relative overflow-hidden">
               <div className="absolute -right-20 -top-20 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px]"></div>
               <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                  <div className="flex justify-between items-end">
                     <div className="space-y-3">
                        <h3 className="text-7xl font-black text-slate-900 tracking-tighter leading-none">Node Marketplace</h3>
                        <p className="text-2xl text-slate-400 font-medium tracking-tight">Deploy pre-built communication hubs and AI logic blocks.</p>
                     </div>
                     <div className="relative group">
                        <Icons.Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                        <input 
                          type="text" 
                          placeholder="Search relays, bots, or logic..." 
                          className="w-[550px] pl-20 pr-10 py-7 bg-white border-2 border-slate-100 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.08)] text-xl font-medium focus:ring-[12px] focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none"
                          value={marketplaceSearch}
                          onChange={(e) => setMarketplaceSearch(e.target.value)}
                        />
                     </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                     {['All Nodes', 'Communication', 'Google Workspace', 'AI Intelligence', 'Logic & Scripts', 'Financial', 'Creative Suite', 'Utilities'].map(tag => (
                        <button key={tag} className="px-8 py-3 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 transform">#{tag}</button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-20 bg-white">
               <div className="max-w-6xl mx-auto space-y-24">
                  {Object.entries(filteredMarketplace).map(([catName, nodes]: [string, any[]]) => nodes.length > 0 && (
                    <div key={catName} className="space-y-12 animate-in fade-in slide-in-from-bottom-5">
                       <div className="flex items-center space-x-6 border-b border-slate-50 pb-6">
                          <h4 className="text-lg font-black text-slate-900 uppercase tracking-[0.5em]">{catName}</h4>
                          <span className="text-[11px] font-black bg-slate-900 text-white px-4 py-1.5 rounded-full uppercase tracking-widest">{nodes.length} Blocks Available</span>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                          {nodes.map(node => (
                            <div key={node.id} className="bg-white border-2 border-slate-50 rounded-[4rem] p-12 flex flex-col space-y-8 hover:shadow-[0_60px_120px_rgba(79,70,229,0.15)] hover:border-indigo-100 transition-all group relative overflow-hidden shadow-sm">
                               <div className="flex justify-between items-start">
                                  <div className={`w-24 h-24 rounded-[3rem] flex items-center justify-center text-6xl shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 ${node.color} group-hover:shadow-indigo-500/40`}>
                                     {node.icon}
                                  </div>
                                  <span className="text-[10px] font-black bg-slate-50 text-slate-400 border border-slate-100 px-4 py-1.5 rounded-full uppercase tracking-widest">{node.category}</span>
                               </div>
                               <div className="space-y-2 flex-1">
                                  <h5 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">{node.label}</h5>
                                  <p className="text-sm text-slate-400 font-medium leading-relaxed italic pr-6 group-hover:text-slate-500 transition-colors">"{node.description}"</p>
                               </div>
                               <button 
                                 onClick={() => installNode(node)}
                                 className="w-full py-6 bg-slate-900 text-white rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-indigo-600 shadow-2xl transition-all active:scale-95 group-hover:-translate-y-2"
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
      
      <style>{`
        @keyframes scroll-down {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .animate-scroll-down {
          animation: scroll-down 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default WorkflowBuilder;
