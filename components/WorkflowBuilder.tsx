
import React, { useState } from 'react';
import { Icons } from '../constants';
import { WorkflowNode, WorkflowMaterial, Workflow } from '../types';

const INITIAL_NODES: WorkflowNode[] = [
  { 
    id: 'n1', 
    type: 'trigger', 
    icon: '⚡', 
    label: 'Trigger: Status Change', 
    description: 'When item status changes to "Done"', 
    purpose: 'Initiate post-completion sequence.',
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    apiConnected: true,
    mcpEnabled: false,
    materials: [],
    config: {
      api: { url: 'https://api.hobbs.io/webhooks/status', method: 'POST', isActive: true }
    }
  },
  { 
    id: 'n2', 
    type: 'condition', 
    icon: '🤔', 
    label: 'Condition: Priority Check', 
    description: 'If priority is High or Critical', 
    purpose: 'Branch logic based on urgency.',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    apiConnected: false,
    mcpEnabled: true,
    materials: [{ type: 'note', title: 'Urgency Guidelines' }],
    config: {
      mcp: { serverUrl: 'mcp://localhost:8080', capabilities: ['reasoning', 'filtering'], isActive: false }
    }
  },
  { 
    id: 'n3', 
    type: 'action', 
    icon: '💬', 
    label: 'Action: Notify Slack', 
    description: 'Send message to #alerts', 
    purpose: 'Instant team awareness.',
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    apiConnected: true,
    mcpEnabled: false,
    materials: [],
    config: {
      api: { url: 'https://hooks.slack.com/services/T000/B000/XXXX', method: 'POST', isActive: true }
    }
  },
];

const WORKFLOW_TEMPLATES: Workflow[] = [
  { id: 'w1', name: 'CRM Auto-Reply', status: 'Active', nodes: INITIAL_NODES },
  { id: 'w2', name: 'Slack Status Sync', status: 'Draft', nodes: [] },
  { id: 'w3', name: 'Lead Assignment Logic', status: 'Paused', nodes: [] },
];

const NodeEditorModal: React.FC<{
  node: WorkflowNode;
  onClose: () => void;
  onUpdate: (updates: Partial<WorkflowNode>) => void;
}> = ({ node, onClose, onUpdate }) => {
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'learn'>('config');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | { success: boolean; message: string }>(null);

  const addMaterial = (type: WorkflowMaterial['type']) => {
    if (!newMaterialTitle) return;
    const newMat: WorkflowMaterial = { type, title: newMaterialTitle };
    onUpdate({ materials: [...node.materials, newMat] });
    setNewMaterialTitle('');
  };

  const handleUpdateConfig = (key: string, value: any) => {
    const currentConfig = node.config || {};
    onUpdate({
      config: {
        ...currentConfig,
        [key]: {
          ...(currentConfig[key] || {}),
          ...value
        }
      }
    });
  };

  const simulateConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        success: true,
        message: `Successfully connected to ${node.apiConnected ? node.config?.api?.url : node.config?.mcp?.serverUrl}`
      });
      // Auto-activate on successful handshake if not already active
      const type = node.apiConnected ? 'api' : 'mcp';
      handleUpdateConfig(type, { isActive: true });
    }, 1500);
  };

  const isConnectionActive = node.apiConnected ? node.config?.api?.isActive : node.config?.mcp?.isActive;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className={`p-10 border-b border-slate-100 flex justify-between items-center ${node.color.split(' ')[0]} bg-opacity-20`}>
          <div className="flex items-center space-x-6">
            <div className="relative group/logo">
              <div className="w-20 h-20 rounded-3xl bg-white shadow-xl border-2 border-white overflow-hidden flex items-center justify-center text-4xl">
                {node.logoUrl ? <img src={node.logoUrl} className="w-full h-full object-cover" alt="logo" /> : node.icon}
              </div>
            </div>
            <div className="flex-1 min-w-[300px]">
              <input 
                className="text-3xl font-black text-slate-900 bg-transparent border-none outline-none focus:ring-0 w-full p-0" 
                value={node.label} 
                onChange={(e) => onUpdate({ label: e.target.value })} 
                placeholder="Node Title"
              />
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{node.type} Logic Block</p>
                {isConnectionActive && (
                  <span className="flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                    ACTIVE CONNECTION
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button onClick={() => setActiveTab('config')} className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'config' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Settings</button>
                <button onClick={() => setActiveTab('learn')} className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'learn' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Learn</button>
             </div>
             <button onClick={onClose} className="p-3 hover:bg-white/50 rounded-full text-slate-600 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-12 gap-0">
          <div className="col-span-8 p-10 space-y-10 border-r border-slate-100">
            {activeTab === 'config' ? (
                <>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <span className="mr-2">📝</span> Meta Information
                    </label>
                    <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Node Description</label>
                        <input 
                          type="text" 
                          placeholder="What does this block do?" 
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          value={node.description}
                          onChange={(e) => onUpdate({ description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Primary Purpose</label>
                        <textarea 
                          placeholder="Define the core logic purpose..." 
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                          value={node.purpose || ''}
                          onChange={(e) => onUpdate({ purpose: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <span className="mr-2">🔌</span> Connection Protocol
                    </label>
                    <div className="space-y-4">
                      <div className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer group flex items-start space-x-4 ${node.apiConnected ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-blue-200'}`} onClick={() => onUpdate({ apiConnected: !node.apiConnected, mcpEnabled: false })}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${node.apiConnected ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>🔌</div>
                        <div className="flex-1">
                          <h4 className="font-black text-sm">REST API</h4>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Standard Webhooks & Endpoints</p>
                        </div>
                      </div>
                      <div className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer group flex items-start space-x-4 ${node.mcpEnabled ? 'border-purple-500 bg-purple-50' : 'border-slate-100 bg-white hover:border-purple-200'}`} onClick={() => onUpdate({ mcpEnabled: !node.mcpEnabled, apiConnected: false })}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${node.mcpEnabled ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>🧠</div>
                        <div className="flex-1">
                          <h4 className="font-black text-sm">MCP Protocol</h4>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">AI Model Context Injection</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {node.apiConnected && (
                  <div className="space-y-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 animate-in slide-in-from-top-4">
                    <div className="flex justify-between items-center">
                      <h5 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center">
                        <span className="mr-2">⚡</span> API Endpoint Configuration
                      </h5>
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activate Connection</span>
                        <button 
                          onClick={() => handleUpdateConfig('api', { isActive: !node.config?.api?.isActive })}
                          className={`w-10 h-5 rounded-full p-1 transition-all ${node.config?.api?.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${node.config?.api?.isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Endpoint URL</label>
                        <input 
                          type="text" 
                          placeholder="https://api.your-system.com/v1/automation" 
                          className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={node.config?.api?.url || ''}
                          onChange={(e) => handleUpdateConfig('api', { url: e.target.value })}
                        />
                      </div>
                      <div className="flex space-x-4">
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">HTTP Method</label>
                          <select 
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            value={node.config?.api?.method || 'POST'}
                            onChange={(e) => handleUpdateConfig('api', { method: e.target.value })}
                          >
                            <option>GET</option>
                            <option>POST</option>
                            <option>PUT</option>
                            <option>DELETE</option>
                          </select>
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Custom Headers (JSON)</label>
                          <input 
                            type="text" 
                            placeholder='{"Content-Type": "application/json"}' 
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={node.config?.api?.headers || ''}
                            onChange={(e) => handleUpdateConfig('api', { headers: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {node.mcpEnabled && (
                  <div className="space-y-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 animate-in slide-in-from-top-4">
                    <div className="flex justify-between items-center">
                      <h5 className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center">
                        <span className="mr-2">🧠</span> Model Context Settings (MCP)
                      </h5>
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Connection</span>
                        <button 
                          onClick={() => handleUpdateConfig('mcp', { isActive: !node.config?.mcp?.isActive })}
                          className={`w-10 h-5 rounded-full p-1 transition-all ${node.config?.mcp?.isActive ? 'bg-purple-500' : 'bg-slate-300'}`}
                        >
                          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${node.config?.mcp?.isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">MCP Server Endpoint</label>
                      <input 
                        type="text" 
                        placeholder="mcp://localhost:8080" 
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        value={node.config?.mcp?.serverUrl || ''}
                        onChange={(e) => handleUpdateConfig('mcp', { serverUrl: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Active Agent Capabilities</label>
                      <div className="flex flex-wrap gap-2">
                        {['reasoning', 'retrieval', 'exec-node', 'db-write', 'semantic-search', 'orchestration'].map(tag => (
                          <button 
                            key={tag}
                            onClick={() => {
                              const current = node.config?.mcp?.capabilities || [];
                              const next = current.includes(tag) ? current.filter((t: string) => t !== tag) : [...current, tag];
                              handleUpdateConfig('mcp', { capabilities: next });
                            }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${node.config?.mcp?.capabilities?.includes(tag) ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-purple-300'}`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(node.apiConnected || node.mcpEnabled) && (
                  <div className="flex flex-col items-center pt-4 space-y-4">
                    <button 
                      onClick={simulateConnection}
                      disabled={isTesting}
                      className={`px-12 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${isTesting ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-black shadow-2xl hover:-translate-y-1'}`}
                    >
                      {isTesting ? 'Validating Handshake...' : 'Simulate & Auto-Activate'}
                    </button>
                    {testResult && (
                      <div className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest ${testResult.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <span>{testResult.success ? '✅' : '❌'}</span>
                        <span>{testResult.message}</span>
                      </div>
                    )}
                  </div>
                )}
                </>
            ) : (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                   <div className="space-y-4">
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">Documentation & Logic Guides</h4>
                      <p className="text-slate-600 leading-relaxed text-lg font-medium">
                        OmniPortal nodes can be enriched with context. These resources are injected into the {node.mcpEnabled ? 'AI Model' : 'Workflow Engine'} during execution.
                      </p>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                        <h5 className="text-xs font-black uppercase tracking-widest mb-4 opacity-60">Execution Flow</h5>
                        <div className="space-y-4 text-xs opacity-90 leading-relaxed">
                          <p><strong>Step 1:</strong> Event triggers based on board activity.</p>
                          <p><strong>Step 2:</strong> Logic resources are loaded into memory.</p>
                          <p><strong>Step 3:</strong> The protocol (API/MCP) receives the payload.</p>
                        </div>
                      </div>
                      <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white">
                        <h5 className="text-xs font-black uppercase tracking-widest mb-4 opacity-60">Success Criteria</h5>
                        <div className="space-y-4 text-xs opacity-90 leading-relaxed">
                          <p>✅ 200 OK Response</p>
                          <p>✅ Schema validation passed</p>
                          <p>✅ Secondary triggers fired</p>
                        </div>
                      </div>
                   </div>
                </div>
            )}
          </div>

          <div className="col-span-4 p-10 bg-slate-50/50 space-y-8 overflow-y-auto">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Logic Resources</h4>
            <div className="space-y-4">
              {node.materials.map((mat, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group shadow-sm transition-all hover:scale-[1.02]">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shadow-inner">
                      {mat.type === 'document' && '📄'}
                      {mat.type === 'video' && '🎬'}
                      {mat.type === 'image' && '🖼️'}
                      {mat.type === 'slide' && '📊'}
                      {mat.type === 'note' && '📝'}
                      {mat.type === 'task' && '✅'}
                    </div>
                    <div>
                        <span className="text-sm font-black text-slate-800 block">{mat.title}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{mat.type}</span>
                    </div>
                  </div>
                  <button onClick={() => onUpdate({ materials: node.materials.filter((_, idx) => idx !== i) })} className="p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              {node.materials.length === 0 && (
                <div className="text-center py-10 opacity-30 italic text-sm">No resources attached.</div>
              )}
            </div>

            <div className="pt-8 border-t border-slate-200 space-y-6">
              <input 
                placeholder="Asset title..."
                className="w-full p-4 text-sm border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={newMaterialTitle}
                onChange={(e) => setNewMaterialTitle(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'document', icon: '📄' },
                  { type: 'video', icon: '🎬' },
                  { type: 'note', icon: '📝' },
                  { type: 'image', icon: '🖼️' },
                  { type: 'slide', icon: '📊' },
                  { type: 'task', icon: '✅' }
                ].map((item) => (
                  <button 
                    key={item.type}
                    disabled={!newMaterialTitle}
                    onClick={() => addMaterial(item.type as any)}
                    className="p-3 border-2 border-slate-100 bg-white rounded-2xl text-[9px] font-black uppercase tracking-tighter hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 transition-all flex flex-col items-center space-y-1"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8 bg-white border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-12 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-base shadow-2xl hover:bg-black transition-all transform active:scale-95 uppercase tracking-widest">
            Confirm Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkflowBuilder: React.FC = () => {
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(WORKFLOW_TEMPLATES[0].id);
  const [workflows, setWorkflows] = useState<Workflow[]>(WORKFLOW_TEMPLATES);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  const activeWorkflow = workflows.find(w => w.id === activeWorkflowId) || workflows[0];

  const handleUpdateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id !== activeWorkflowId) return w;
      return {
        ...w,
        nodes: w.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n)
      };
    }));
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Automation Engine</h2>
          <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">MCP READY</span>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center active:scale-95">
          <Icons.Plus /> <span className="ml-2 uppercase tracking-widest">New Flow</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="w-80 border-r border-slate-200 bg-white p-6 space-y-6 overflow-y-auto shrink-0">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Flows</h3>
            {workflows.map(w => (
              <button 
                key={w.id} 
                onClick={() => setActiveWorkflowId(w.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${activeWorkflowId === w.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-black text-slate-800 truncate">{w.name}</span>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${w.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{w.status}</span>
                </div>
                <div className="flex items-center space-x-2">
                   <div className="flex -space-x-1.5">
                     {w.nodes.map((n, idx) => (
                       <div key={idx} className={`w-5 h-5 rounded-full border border-white flex items-center justify-center text-[8px] ${n.color.split(' ')[0]}`}>{n.icon}</div>
                     ))}
                   </div>
                   <p className="text-[10px] text-slate-400 font-bold">{w.nodes.length} Blocks</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-slate-50 relative overflow-auto p-16 pattern-grid">
          <div className="max-w-xl mx-auto space-y-16">
            {activeWorkflow.nodes.map((node, i) => {
              const isActive = node.apiConnected ? node.config?.api?.isActive : node.config?.mcp?.isActive;
              return (
                <React.Fragment key={node.id}>
                  <div 
                    onClick={() => setSelectedNode(node)}
                    className={`group relative p-10 rounded-[3rem] border-2 ${node.color} shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 bg-white overflow-hidden`}
                  >
                    <div className="absolute top-6 left-10 flex space-x-2">
                      <div className="px-4 py-1.5 bg-white border border-inherit rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                        {node.type}
                      </div>
                      {isActive && (
                        <div className="px-3 py-1.5 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center">
                          <span className="w-1 h-1 bg-white rounded-full mr-1.5 animate-pulse"></span>
                          LIVE
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl border border-slate-100 flex items-center justify-center text-5xl group-hover:scale-110 group-hover:rotate-3 transition-transform overflow-hidden">
                          {node.logoUrl ? <img src={node.logoUrl} className="w-full h-full object-cover" /> : node.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-black text-2xl text-slate-900 leading-tight tracking-tight">{node.label}</h4>
                        <p className="text-sm text-slate-500 font-medium opacity-80">{node.description}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-6">
                            {node.apiConnected && <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 uppercase tracking-tighter">🔌 {node.config?.api?.method || 'WEBHOOK'}</span>}
                            {node.mcpEnabled && <span className="text-[8px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 uppercase tracking-tighter">🧠 MCP CONTEXT</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 p-3 rounded-2xl text-white shadow-2xl scale-75 group-hover:scale-100">
                        <Icons.ChevronRight />
                    </div>
                  </div>

                  {i < activeWorkflow.nodes.length - 1 && (
                    <div className="flex justify-center h-20">
                      <div className="w-1.5 bg-slate-200 rounded-full h-full relative">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-slate-200"></div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            <button className="w-full py-12 border-4 border-dashed border-slate-200 rounded-[3rem] text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center space-y-4 group">
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl">
                <Icons.Plus />
              </div>
              <span className="font-black text-sm uppercase tracking-widest block">Expand Logic Circuit</span>
            </button>
          </div>
        </div>
      </div>

      {selectedNode && (
        <NodeEditorModal 
          node={selectedNode} 
          onClose={() => setSelectedNode(null)} 
          onUpdate={(updates) => handleUpdateNode(selectedNode.id, updates)} 
        />
      )}
    </div>
  );
};

export default WorkflowBuilder;
