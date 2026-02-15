
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { ConnectionChannel, MessageThread, MemoryNode, HobbsPersona, ClonedVoice } from '../types';

const CHANNELS: { id: ConnectionChannel; icon: string; color: string }[] = [
  { id: 'Email', icon: '📧', color: 'bg-blue-500' },
  { id: 'SMS', icon: '📱', color: 'bg-emerald-500' },
  { id: 'Twilio', icon: '✆', color: 'bg-rose-600' },
  { id: 'Telnyx', icon: '📶', color: 'bg-indigo-600' },
  { id: 'Vonage', icon: '☎️', color: 'bg-orange-500' },
  { id: 'WhatsApp', icon: '💬', color: 'bg-green-600' },
  { id: 'Telegram', icon: '✈️', color: 'bg-sky-400' },
  { id: 'Discord', icon: '👾', color: 'bg-indigo-500' },
  { id: 'Slack', icon: '#', color: 'bg-purple-500' },
  { id: 'Circle', icon: '⭕', color: 'bg-orange-500' },
  { id: 'Instagram', icon: '📸', color: 'bg-pink-500' },
  { id: 'Facebook', icon: '👥', color: 'bg-blue-600' },
  { id: 'LinkedIn', icon: '👔', color: 'bg-blue-700' },
  { id: 'Phone', icon: '📞', color: 'bg-rose-500' },
];

const PERSONAS: { role: HobbsPersona; icon: string; description: string }[] = [
  { role: 'Emergency Responder', icon: '🚨', description: 'Crisis management and rapid response protocols.' },
  { role: 'Health Coach', icon: '🍏', description: 'Wellness, nutrition, and metabolic health tracking.' },
  { role: 'Business Mentor', icon: '📈', description: 'Strategy, growth, and enterprise scalability.' },
  { role: 'Home Manager', icon: '🏠', description: 'IoT automation, grocery logs, and maintenance.' },
  { role: 'Travel Agent', icon: '✈️', description: 'Itinerary planning and real-time flight tracking.' },
  { role: 'Financial Advisor', icon: '💰', description: 'Budgeting, portfolios, and expense analysis.' },
  { role: 'Medical Assistant', icon: '🏥', description: 'Health logs and professional documentation support.' },
  { role: 'Career Coach', icon: '💼', description: 'Skill mapping, interviews, and networking strategy.' },
  { role: 'Fitness Trainer', icon: '🏋️', description: 'Workout cycles and biometric performance review.' },
  { role: 'Local Guide', icon: '📍', description: 'Hidden gems and navigation intelligence.' },
  { role: 'Life Coach', icon: '🧘', description: 'Mindfulness, goals, and existential clarity.' },
  { role: 'Personal Assistant', icon: '🤖', description: 'Scheduling and day-to-day administrative flow.' },
];

const DEFAULT_VOICES = [
  { id: 'Puck', label: 'Puck', description: 'Energy & Youth', emoji: '👦' },
  { id: 'Kore', label: 'Kore', description: 'Calm & Professional', emoji: '👩' },
  { id: 'Fenrir', label: 'Fenrir', description: 'Deep Authority', emoji: '🐺' },
  { id: 'Charon', label: 'Charon', description: 'Wise Storytelling', emoji: '🛶' },
  { id: 'Zephyr', label: 'Zephyr', description: 'Service Friendly', emoji: '🌬️' },
];

const MOCK_THREADS: MessageThread[] = [
  { id: 't1', channel: 'Email', contactName: 'Investor Group', lastMessage: 'Following up on the Q3 reports. Are they ready?', timestamp: '10:45 AM', isAiAutoPilot: true, avatarUrl: 'https://picsum.photos/40/40?random=11', unreadCount: 0 },
  { id: 't2', channel: 'WhatsApp', contactName: 'Family Chat', lastMessage: 'Dinner at 7 tonight?', timestamp: '9:30 AM', isAiAutoPilot: false, avatarUrl: 'https://picsum.photos/40/40?random=12', unreadCount: 3 },
  { id: 't3', channel: 'Discord', contactName: 'Dev Guild', lastMessage: 'PR #452 has been merged into main.', timestamp: 'Yesterday', isAiAutoPilot: true, avatarUrl: 'https://picsum.photos/40/40?random=13', unreadCount: 0 },
  { id: 't4', channel: 'SMS', contactName: '+1 (555) 012-3456', lastMessage: 'Your package is out for delivery.', timestamp: 'Mon', isAiAutoPilot: true, avatarUrl: 'https://picsum.photos/40/40?random=14', unreadCount: 0 },
];

const MemoryStudio: React.FC = () => {
  const [folders, setFolders] = useState<string[]>(['Core Identity', 'Business Logic', 'Project Alpha', 'Customer Service FAQ']);
  const [activeFolder, setActiveFolder] = useState<string>('Core Identity');
  const [memories, setMemories] = useState<MemoryNode[]>(() => {
    const saved = localStorage.getItem('HOBBS_AI_MEMORY_V1');
    return saved ? JSON.parse(saved) : [
      { id: 'm1', title: 'Brand Tone Guidelines', type: 'Note', content: 'Always maintain a professional but approachable voice. Use technical terms but explain them briefly.', timestamp: 'Feb 15, 2025', category: 'Core Identity' },
      { id: 'm2', title: 'Preferred Meeting Times', type: 'Note', content: 'No meetings before 10 AM or after 4 PM. Focus blocks on Wednesdays.', timestamp: 'Feb 15, 2025', category: 'Core Identity' },
    ];
  });

  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [isSmartCapturing, setIsSmartCapturing] = useState(false);
  const [smartCaptureText, setSmartCaptureText] = useState('');
  const [newNode, setNewNode] = useState({ title: '', content: '', type: 'Note' as MemoryNode['type'] });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    localStorage.setItem('HOBBS_AI_MEMORY_V1', JSON.stringify(memories));
  }, [memories]);

  const addMemory = () => {
    if (!newNode.title || !newNode.content) return;
    const node: MemoryNode = {
      id: `m-${Date.now()}`,
      title: newNode.title,
      content: newNode.content,
      type: newNode.type,
      timestamp: new Date().toLocaleDateString(),
      category: activeFolder
    };
    setMemories([node, ...memories]);
    setIsAddingMemory(false);
    setNewNode({ title: '', content: '', type: 'Note' });
    
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const handleSmartCapture = async () => {
    if (!smartCaptureText.trim()) return;
    setIsSmartCapturing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze the following text and extract exactly 3 distinct, high-value training memory nodes that would help an AI assistant better understand the user or business.
        Target Category: ${activeFolder}
        Text: "${smartCaptureText}"
        
        Return the result as a JSON array of objects with "title", "content", and "type" ('Note' | 'Document' | 'Link').`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['Note', 'Document', 'Link'] }
              }
            }
          }
        }
      });

      const extracted = JSON.parse(response.text);
      const newNodes = extracted.map((e: any, i: number) => ({
        id: `m-smart-${Date.now()}-${i}`,
        title: e.title,
        content: e.content,
        type: e.type,
        timestamp: new Date().toLocaleDateString(),
        category: activeFolder
      }));

      setMemories([...newNodes, ...memories]);
      setSmartCaptureText('');
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000);
    } catch (e) {
      console.error("Smart capture failed", e);
    } finally {
      setIsSmartCapturing(false);
    }
  };

  const deleteMemory = (id: string) => {
    setMemories(memories.filter(m => m.id !== id));
  };

  const filteredMemories = memories.filter(m => m.category === activeFolder);
  const totalTokens = memories.length * 450; // Mock calculation

  return (
    <div className="flex-1 flex overflow-hidden animate-in fade-in duration-500 bg-slate-950">
      <div className="w-80 border-r border-white/5 bg-black/20 flex flex-col shrink-0 p-6 space-y-8">
        <div className="flex justify-between items-center px-2">
           <div className="space-y-1">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Hierarchy</h3>
              <p className="text-sm font-bold text-white tracking-tight">Knowledge Clusters</p>
           </div>
           <button className="text-indigo-400 hover:text-indigo-300 p-2 hover:bg-white/5 rounded-xl transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
           </button>
        </div>
        <div className="space-y-1">
          {folders.map(f => (
            <button 
              key={f} 
              onClick={() => setActiveFolder(f)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center space-x-3 group ${activeFolder === f ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-900/20 text-white' : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/10'}`}
            >
              <span className="text-lg">{activeFolder === f ? '📂' : '📁'}</span>
              <div className="flex-1 min-w-0">
                 <span className="text-[10px] font-black uppercase tracking-tight block truncate">{f}</span>
                 <span className={`text-[8px] font-bold ${activeFolder === f ? 'text-indigo-200' : 'text-slate-600'}`}>{memories.filter(m => m.category === f).length} Parameters</span>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-auto bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden group/status">
           <div className="absolute -right-10 -top-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover/status:bg-emerald-500/10 transition-all"></div>
           <div className="space-y-4 relative">
              <div className="flex items-center space-x-3">
                 <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
                 <span className="text-[10px] font-black uppercase text-slate-200 tracking-widest">Global Brain Matrix</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Training Depth</p>
                    <p className="text-lg font-black text-white">{memories.length > 5 ? 'Stable' : 'Sparse'}</p>
                 </div>
                 <div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Context Size</p>
                    <p className="text-lg font-black text-indigo-400">{(totalTokens / 1000).toFixed(1)}k</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
      <div className="flex-1 bg-slate-900/10 p-12 overflow-y-auto pattern-grid-dark relative">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="flex justify-between items-end border-b border-white/5 pb-8">
            <div className="space-y-1">
              <div className="flex items-center space-x-3 mb-2">
                 <span className="text-3xl">🧠</span>
                 <h3 className="text-4xl font-black tracking-tighter text-white">{activeFolder}</h3>
              </div>
              <p className="text-slate-500 font-medium text-lg">Manage context nodes to train agents.</p>
            </div>
            <div className="flex space-x-4 mb-1">
               <button onClick={() => setIsAddingMemory(true)} className="px-6 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all shadow-lg active:scale-95">Manual Node</button>
               <button onClick={() => setIsSmartCapturing(true)} className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all flex items-center active:scale-95">Smart Capture</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredMemories.map(m => (
              <div key={m.id} className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8 hover:border-indigo-500/30 transition-all group shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => deleteMemory(m.id)} className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform ring-1 ring-white/10">
                    {m.type === 'Note' ? '📝' : m.type === 'Link' ? '🔗' : '📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-white text-xl tracking-tight truncate">{m.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                       <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{m.timestamp}</span>
                       <span className="text-slate-800">•</span>
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{m.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-black/30 rounded-[2rem] p-6 border border-white/5">
                   <p className="text-sm text-slate-400 font-medium leading-relaxed italic pr-4">"{m.content}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isAddingMemory && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in" onClick={() => setIsAddingMemory(false)}>
          <div className="bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-10 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-3xl font-black text-white tracking-tighter">Manual Node</h3>
              <button onClick={() => setIsAddingMemory(false)} className="p-3 hover:bg-white/5 rounded-full text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-10 space-y-10">
              <input type="text" autoFocus placeholder="Title" className="w-full px-8 py-5 bg-slate-950 border-2 border-white/5 rounded-[2rem] focus:border-indigo-500 outline-none text-white" value={newNode.title} onChange={(e) => setNewNode({ ...newNode, title: e.target.value })} />
              <textarea placeholder="Content" className="w-full px-8 py-6 bg-slate-950 border-2 border-white/5 rounded-[2.5rem] focus:border-indigo-500 outline-none text-slate-300 h-48 resize-none" value={newNode.content} onChange={(e) => setNewNode({ ...newNode, content: e.target.value })} />
              <button onClick={addMemory} className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs">Sync Memory</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OutboundView: React.FC<{ 
  connectedChannels: Set<ConnectionChannel>, 
  assignedNumber: string | null 
}> = ({ connectedChannels, assignedNumber }) => {
  const [outboundMessage, setOutboundMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<ConnectionChannel | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sentHistory, setSentHistory] = useState([
    { id: 's1', recipient: 'Marketing Team', message: 'Campaign brief updated.', channel: 'Slack', status: 'Delivered', time: '10 mins ago' },
    { id: 's2', recipient: 'Alice Dev', message: 'Reviewing the API documentation now.', channel: 'SMS', status: 'Read', time: '1 hour ago' },
  ]);

  const handleSend = () => {
    if (!outboundMessage.trim() || !selectedChannel) return;
    setIsSending(true);
    setTimeout(() => {
      setSentHistory([{
        id: `s-${Date.now()}`,
        recipient: 'Active Session',
        message: outboundMessage,
        channel: selectedChannel,
        status: 'Sent',
        time: 'Just now'
      }, ...sentHistory]);
      setOutboundMessage('');
      setIsSending(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f9fafb]">
      <div className="w-[450px] border-r border-slate-200 bg-white p-10 space-y-10 flex flex-col shrink-0">
        <div className="space-y-1">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Broadcast Studio</h3>
           <p className="text-sm font-bold text-slate-900 tracking-tight px-1">Outbound Transmission</p>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Path Selection</label>
          <div className="grid grid-cols-4 gap-3">
            {CHANNELS.map(c => (
              <button key={c.id} onClick={() => setSelectedChannel(c.id)} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center space-y-2 ${selectedChannel === c.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : connectedChannels.has(c.id) ? 'border-slate-100 bg-white' : 'opacity-20 grayscale cursor-not-allowed'}`} disabled={!connectedChannels.has(c.id)}>
                <span className="text-2xl">{c.icon}</span>
                <span className="text-[8px] font-black uppercase truncate w-full text-center">{c.id}</span>
              </button>
            ))}
          </div>
        </div>
        <textarea value={outboundMessage} onChange={(e) => setOutboundMessage(e.target.value)} placeholder="Draft secure communication..." className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-sm outline-none resize-none shadow-inner" />
        <button onClick={handleSend} disabled={!outboundMessage.trim() || !selectedChannel || isSending} className={`w-full py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all ${isSending ? 'bg-slate-800 animate-pulse' : 'bg-indigo-600 text-white shadow-indigo-200'} disabled:opacity-20`}>Initiate Push</button>
      </div>
      <div className="flex-1 p-12 overflow-y-auto pattern-grid-light">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex justify-between items-end border-b border-slate-200 pb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Live Matrix</h3>
          </div>
          <div className="space-y-4">
            {sentHistory.map(item => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex items-center space-x-8 shadow-sm">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl ${CHANNELS.find(c => c.id === item.channel)?.color} bg-opacity-10`}>
                  {CHANNELS.find(c => c.id === item.channel)?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-900 text-lg">{item.recipient}</h4>
                  <p className="text-sm text-slate-500 truncate italic">"{item.message}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ConnectionsHubProps {
  clonedVoices: ClonedVoice[];
}

const ConnectionsHub: React.FC<ConnectionsHubProps> = ({ clonedVoices = [] }) => {
  const [activeTab, setActiveTab] = useState<'Inbound' | 'Outbound' | 'AI Memory' | 'Voice' | 'Provisioning'>('Inbound');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<HobbsPersona>('Personal Assistant');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('Kore');
  const availableVoices = [...clonedVoices, ...DEFAULT_VOICES];
  const [connectedChannels, setConnectedChannels] = useState<Set<ConnectionChannel>>(new Set(['Email', 'SMS']));
  const [assignedNumber, setAssignedNumber] = useState<string | null>(localStorage.getItem('HOBBS_MOBILE_NUMBER'));
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState(false);

  const provisionNumber = () => {
    setIsProvisioning(true);
    setProvisionSuccess(false);
    setTimeout(() => {
      const areaCode = [415, 650, 212, 310][Math.floor(Math.random() * 4)];
      const number = `+1 (${areaCode}) ${Math.floor(Math.random()*899+100)}-${Math.floor(Math.random()*8999+1000)}`;
      setAssignedNumber(number);
      localStorage.setItem('HOBBS_MOBILE_NUMBER', number);
      setConnectedChannels(prev => new Set([...Array.from(prev), 'Phone', 'Twilio']));
      setIsProvisioning(false);
      setProvisionSuccess(true);
    }, 2500);
  };

  const toggleChannelConnection = (channelId: ConnectionChannel) => {
    const next = new Set(connectedChannels);
    if (next.has(channelId)) {
      next.delete(channelId);
    } else {
      next.add(channelId);
    }
    setConnectedChannels(next);
  };

  const connectAllChannels = () => {
    setConnectedChannels(new Set(CHANNELS.map(c => c.id)));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-white font-sans">
      <div className="p-8 bg-black/40 border-b border-white/5 flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center space-x-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-2xl">
             {availableVoices.find(v => v.id === selectedVoiceId)?.emoji || '🧠'}
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Connections Hub</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
                {availableVoices.find(v => v.id === selectedVoiceId)?.label || activePersona} Linked
            </p>
          </div>
        </div>
        <div className="flex bg-slate-900/50 p-1.5 rounded-[1.5rem] border border-white/5">
           {(['Inbound', 'Outbound', 'AI Memory', 'Voice', 'Provisioning'] as const).map(tab => (
             <button key={tab} onClick={() => { setActiveTab(tab); setProvisionSuccess(false); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'Inbound' && (
          <div className="flex-1 flex overflow-hidden bg-slate-950">
            <div className="w-96 border-r border-white/5 bg-black/20 flex flex-col shrink-0 overflow-y-auto p-6 space-y-6">
              <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] mb-2 shadow-2xl">
                 <p className="text-[9px] font-black uppercase text-indigo-400">Active Identity</p>
                 {assignedNumber ? (
                   <div className="flex flex-col mt-2">
                     <span className="font-mono text-lg text-white tracking-widest">{assignedNumber}</span>
                     <span className="text-[7px] text-emerald-400 uppercase mt-1">Neural Agent Enabled</span>
                   </div>
                 ) : (
                   <button onClick={() => setActiveTab('Provisioning')} className="w-full py-3.5 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase mt-2">Provision Line</button>
                 )}
              </div>
              <div className="grid grid-cols-5 gap-2 px-1">
                 {CHANNELS.map(c => (
                   <button key={c.id} onClick={() => toggleChannelConnection(c.id)} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all border-2 ${connectedChannels.has(c.id) ? `${c.color} bg-opacity-20 border-white/20 shadow-lg` : 'bg-slate-900 border-white/5 opacity-40 hover:opacity-100'}`}>
                     {c.icon}
                   </button>
                 ))}
              </div>
              <div className="space-y-3">
                {MOCK_THREADS.map(t => (
                  <button key={t.id} onClick={() => setSelectedThreadId(t.id)} className={`w-full text-left p-6 rounded-[2.5rem] border transition-all ${selectedThreadId === t.id ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-900/40 border-white/5'}`}>
                    <div className="flex items-center space-x-5">
                       <img src={t.avatarUrl} className="w-14 h-14 rounded-[1.2rem] object-cover" />
                       <div className="flex-1 min-w-0">
                          <span className="font-black text-sm text-white truncate block">{t.contactName}</span>
                          <p className="text-xs truncate text-slate-500">{t.lastMessage}</p>
                       </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-slate-900/30 flex flex-col items-center justify-center opacity-20">
               <span className="text-[140px]">📡</span>
               <h3 className="text-4xl font-black uppercase tracking-[0.4em]">Signal Feed</h3>
            </div>
          </div>
        )}

        {activeTab === 'Outbound' && <OutboundView connectedChannels={connectedChannels} assignedNumber={assignedNumber} />}
        {activeTab === 'AI Memory' && <MemoryStudio />}
        
        {activeTab === 'Provisioning' && (
           <div className="flex-1 flex flex-col items-center justify-center p-20 bg-black/60 relative overflow-hidden">
             <div className="max-w-3xl w-full bg-slate-900 border border-white/10 rounded-[5rem] p-20 space-y-12 relative z-10">
                {!provisionSuccess ? (
                  <>
                    <div className="text-center space-y-6">
                       <div className="w-32 h-32 bg-indigo-600 rounded-[3rem] mx-auto flex items-center justify-center text-6xl shadow-2xl">📱</div>
                       <h3 className="text-5xl font-black text-white">Acquire Identity</h3>
                       <p className="text-slate-400 text-lg">Provision a verified mobile number for your AI agent to communicate via voice and text.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <button onClick={provisionNumber} disabled={isProvisioning} className="p-10 bg-black/40 border-2 border-white/5 rounded-[3rem] hover:border-indigo-500 transition-all flex flex-col items-center space-y-4">
                          <span className="text-5xl">🇬</span>
                          <span className="text-[10px] font-black uppercase text-slate-500">Google Hub</span>
                       </button>
                       <button onClick={provisionNumber} disabled={isProvisioning} className="p-10 bg-black/40 border-2 border-white/5 rounded-[3rem] hover:border-rose-500 transition-all flex flex-col items-center space-y-4">
                          <span className="text-4xl font-black text-rose-500">Twilio</span>
                          <span className="text-[10px] font-black uppercase text-slate-500">API Gateway</span>
                       </button>
                    </div>
                    {isProvisioning && (
                      <div className="text-center space-y-4 animate-pulse">
                         <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                         <p className="text-xs font-black uppercase text-indigo-400">Allocating Neural Frequency...</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center space-y-10 animate-in zoom-in-95">
                     <div className="w-32 h-32 bg-emerald-500 rounded-[3rem] mx-auto flex items-center justify-center text-6xl shadow-2xl">✅</div>
                     <div className="space-y-4">
                        <h3 className="text-5xl font-black text-white">Success!</h3>
                        <p className="text-slate-400 text-lg">Your new autonomous identity is active and linked.</p>
                        <div className="p-8 bg-black/40 border-2 border-emerald-500/30 rounded-[3rem] font-mono text-4xl text-emerald-400 tracking-widest mt-6">
                           {assignedNumber}
                        </div>
                     </div>
                     <button onClick={() => setActiveTab('Inbound')} className="px-12 py-5 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest">Go to Inbound Feed</button>
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'Voice' && (
          <div className="flex-1 flex flex-col items-center justify-center p-20 bg-black">
             <div className="w-64 h-64 bg-indigo-600 rounded-[4rem] flex items-center justify-center text-[100px] shadow-[0_0_100px_rgba(79,70,229,0.4)] animate-pulse">
                {availableVoices.find(v => v.id === selectedVoiceId)?.emoji || '🎙️'}
             </div>
             <h3 className="text-5xl font-black mt-12">Voice Matrix</h3>
             <select value={selectedVoiceId} onChange={(e) => setSelectedVoiceId(e.target.value)} className="mt-8 bg-slate-900 border-2 border-white/10 rounded-2xl p-6 text-white font-black outline-none w-80">
                {availableVoices.map(v => <option key={v.id} value={v.id}>{v.emoji} {v.label}</option>)}
             </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsHub;
