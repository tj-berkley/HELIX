
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { ConnectionChannel, MessageThread, MemoryNode, HobbsPersona } from '../types';

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

  return (
    <div className="flex-1 flex overflow-hidden animate-in fade-in duration-500 bg-slate-950">
      {/* Memory Folders Sidebar */}
      <div className="w-80 border-r border-white/5 bg-black/20 flex flex-col shrink-0 p-6 space-y-8">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Knowledge Clusters</h3>
           <button className="text-indigo-400 hover:text-indigo-300">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
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
              <span className="text-xs font-black uppercase tracking-tight truncate">{f}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto bg-slate-900 border border-white/5 rounded-[2rem] p-6 space-y-4 shadow-2xl">
           <div className="flex items-center space-x-3">
              <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Assistant Brain Status</span>
           </div>
           <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">Grounding active for <strong>{memories.length}</strong> parameters across all platform chatbots.</p>
           {isSyncing && (
             <div className="flex items-center space-x-2 text-[8px] font-black text-indigo-400 uppercase animate-pulse">
                <span>Neural Frequency Syncing...</span>
             </div>
           )}
        </div>
      </div>

      {/* Memory Nodes Grid */}
      <div className="flex-1 bg-slate-900/10 p-10 overflow-y-auto pattern-grid-dark relative">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex justify-between items-end border-b border-white/5 pb-6">
            <div>
              <h3 className="text-3xl font-black tracking-tighter text-white">Cluster: {activeFolder}</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Grounding instructions and proprietary knowledge nodes.</p>
            </div>
            <div className="flex space-x-3">
               <button 
                onClick={() => setIsAddingMemory(true)}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center"
              >
                Manual Node
              </button>
              <button 
                onClick={() => setIsSmartCapturing(true)}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all flex items-center"
              >
                <span className="mr-2">✨</span>
                Smart Capture
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMemories.map(m => (
              <div key={m.id} className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 space-y-6 hover:border-white/20 transition-all group shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => deleteMemory(m.id)} className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-50 hover:text-white rounded-xl transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                    {m.type === 'Note' ? '📝' : m.type === 'Link' ? '🔗' : '📄'}
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg tracking-tight truncate w-48">{m.title}</h4>
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{m.timestamp}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed italic pr-4">"{m.content}"</p>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                   <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Grounding Active</span>
                   <div className="flex items-center space-x-1.5">
                      <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                      <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                      <div className="w-1 h-1 rounded-full bg-indigo-500 opacity-30"></div>
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Strength</span>
                   </div>
                </div>
              </div>
            ))}

            {filteredMemories.length === 0 && !isAddingMemory && !isSmartCapturing && (
               <div className="col-span-full py-40 text-center space-y-6 border-4 border-dashed border-white/5 rounded-[3rem] opacity-20">
                  <div className="text-8xl">🧠</div>
                  <p className="text-2xl font-black uppercase tracking-widest">Empty Cluster</p>
                  <p className="text-sm font-bold uppercase tracking-widest">Use Smart Capture to train the brain instantly</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Memory Modal */}
      {isAddingMemory && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in" onClick={() => setIsAddingMemory(false)}>
          <div className="bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-10 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter">New Memory Node</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Manual Brain Augmentation</p>
              </div>
              <button onClick={() => setIsAddingMemory(false)} className="p-3 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Node Title</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. Brand Tone Guidelines"
                  className="w-full px-8 py-5 bg-slate-950 border-2 border-white/5 rounded-[1.8rem] focus:border-indigo-500 outline-none transition-all font-black text-xl text-white shadow-inner"
                  value={newNode.title}
                  onChange={(e) => setNewNode({ ...newNode, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Instruction Content</label>
                <textarea 
                  placeholder="The factual or logical information to ground the AI..."
                  className="w-full px-8 py-5 bg-slate-950 border-2 border-white/5 rounded-[2.5rem] focus:border-indigo-500 outline-none transition-all font-medium text-slate-300 h-40 resize-none shadow-inner leading-relaxed"
                  value={newNode.content}
                  onChange={(e) => setNewNode({ ...newNode, content: e.target.value })}
                />
              </div>

              <div className="pt-4 flex space-x-4">
                <button onClick={() => setIsAddingMemory(false)} className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 rounded-2xl transition-all">Cancel</button>
                <button 
                  onClick={addMemory}
                  disabled={!newNode.title || !newNode.content}
                  className="flex-[2] py-5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-900/20 transition-all transform active:scale-95 disabled:opacity-20"
                >
                  Commit Memory Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Capture Modal */}
      {isSmartCapturing && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in" onClick={() => setIsSmartCapturing(false)}>
           <div className="bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-indigo-600/10">
                <div>
                   <h3 className="text-3xl font-black text-white tracking-tighter flex items-center">
                     <span className="mr-3">✨</span> Smart Memory Capture
                   </h3>
                   <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Gemini 3 Pro Extraction Suite</p>
                </div>
                <button onClick={() => setIsSmartCapturing(false)} className="p-3 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-10 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Knowledge Payload</label>
                    <textarea 
                      placeholder="Paste unstructured notes, emails, or guidelines here. Gemini will analyze and distill them into trainable memory nodes..."
                      className="w-full px-8 py-8 bg-slate-950 border-2 border-white/5 rounded-[2.5rem] focus:border-indigo-500 outline-none transition-all font-medium text-slate-300 h-64 resize-none shadow-inner leading-relaxed"
                      value={smartCaptureText}
                      onChange={(e) => setSmartCaptureText(e.target.value)}
                    />
                 </div>

                 <div className="pt-4 flex flex-col space-y-4">
                    <button 
                      onClick={handleSmartCapture}
                      disabled={!smartCaptureText.trim() || isSmartCapturing}
                      className={`w-full py-6 bg-indigo-600 text-white text-sm font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-indigo-700 shadow-2xl shadow-indigo-900/40 transition-all transform active:scale-95 disabled:opacity-30 flex items-center justify-center space-x-3`}
                    >
                      {isSmartCapturing ? (
                        <>
                           <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                           <span>Analyzing Neural context...</span>
                        </>
                      ) : (
                        <>
                           <span>Extract & Embed Nodes</span>
                           <span className="text-xl">🚀</span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                       Training data will be categorized into: <span className="text-indigo-400">{activeFolder}</span>
                    </p>
                 </div>
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
    <div className="flex-1 flex overflow-hidden">
      <div className="w-[450px] border-r border-white/5 bg-black/20 p-8 space-y-8 flex flex-col">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Broadcast Studio</h3>
        
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">1. Distribution Path</label>
          <div className="grid grid-cols-4 gap-2">
            {CHANNELS.map(c => (
              <button 
                key={c.id} 
                onClick={() => setSelectedChannel(c.id)}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center space-y-1 ${
                  selectedChannel === c.id 
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg' 
                    : connectedChannels.has(c.id) 
                      ? 'border-white/10 hover:border-indigo-500/50' 
                      : 'border-white/5 opacity-30 grayscale cursor-not-allowed'
                }`}
                disabled={!connectedChannels.has(c.id)}
              >
                <span className="text-xl">{c.icon}</span>
                <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full text-center">{c.id}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 flex-1 flex flex-col">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">2. Message Payload</label>
          <textarea 
            value={outboundMessage}
            onChange={(e) => setOutboundMessage(e.target.value)}
            placeholder="Draft outbound communication..."
            className="flex-1 w-full bg-slate-900/50 border border-white/10 rounded-[2rem] p-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={!outboundMessage.trim() || !selectedChannel || isSending}
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all transform active:scale-95 shadow-2xl ${
              isSending ? 'bg-slate-800 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/40'
            } disabled:opacity-20`}
          >
            {isSending ? 'Transmitting Data...' : 'Initiate Outbound Push'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-900/10 p-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex justify-between items-end border-b border-white/5 pb-4">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Sent Transmissions</h3>
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Live Tracking Matrix</span>
          </div>

          <div className="space-y-4">
            {sentHistory.map(item => (
              <div key={item.id} className="bg-slate-900 border border-white/5 rounded-3xl p-6 flex items-center space-x-6 hover:border-white/10 transition-all group shadow-lg">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xl ${CHANNELS.find(c => c.id === item.channel)?.color} bg-opacity-20`}>
                  {CHANNELS.find(c => c.id === item.channel)?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-black text-slate-200 text-sm">{item.recipient}</h4>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate pr-10">{item.message}</p>
                </div>
                <div className="flex flex-col items-end">
                   <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                     item.status === 'Delivered' ? 'bg-indigo-500/20 text-indigo-400' :
                     item.status === 'Read' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'
                   }`}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConnectionsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Inbound' | 'Outbound' | 'Brain' | 'Voice' | 'Provisioning'>('Inbound');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<HobbsPersona>('Personal Assistant');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  // Channels State
  const [connectedChannels, setConnectedChannels] = useState<Set<ConnectionChannel>>(new Set(['Email', 'SMS']));
  
  // Provisioning State
  const [assignedNumber, setAssignedNumber] = useState<string | null>(localStorage.getItem('HOBBS_MOBILE_NUMBER'));
  const [isProvisioning, setIsProvisioning] = useState(false);

  const provisionNumber = () => {
    setIsProvisioning(true);
    setTimeout(() => {
      const areaCode = [415, 650, 212, 310][Math.floor(Math.random() * 4)];
      const number = `+1 (${areaCode}) ${Math.floor(Math.random()*899+100)}-${Math.floor(Math.random()*8999+1000)}`;
      setAssignedNumber(number);
      localStorage.setItem('HOBBS_MOBILE_NUMBER', number);
      setConnectedChannels(prev => new Set([...Array.from(prev), 'Phone', 'Twilio']));
      setIsProvisioning(false);
      setActiveTab('Inbound');
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

  const toggleAutoPilot = (id: string) => {
    console.log(`Toggling AI Auto-Pilot for thread ${id}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-white font-sans">
      {/* Header */}
      <div className="p-8 bg-black/40 border-b border-white/5 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center text-2xl shadow-xl shadow-indigo-900/40">
             {PERSONAS.find(p => p.role === activePersona)?.icon}
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Hobbs Connections Hub</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">AI Memory Center // Multi-Channel Control</p>
          </div>
        </div>
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
           {(['Inbound', 'Outbound', 'Brain', 'Voice', 'Provisioning'] as const).map(tab => (
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-500 hover:text-slate-300'}`}
             >
               {tab === 'Brain' ? 'AI Memory' : tab}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Inbound Mode */}
        {activeTab === 'Inbound' && (
          <div className="flex-1 flex overflow-hidden animate-in fade-in duration-500">
            {/* Thread List Sidebar */}
            <div className="w-96 border-r border-white/5 bg-black/20 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4">
              <div className="p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] mb-2 shadow-2xl">
                 <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">OmniPortal Mobile Identity</p>
                 {assignedNumber ? (
                   <div className="flex justify-between items-center">
                     <span className="font-mono text-sm text-indigo-100">{assignedNumber}</span>
                     <span className="text-[8px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded uppercase">Live</span>
                   </div>
                 ) : (
                   <button onClick={() => setActiveTab('Provisioning')} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 mt-2">Get Mobile Number</button>
                 )}
              </div>

              <div className="flex justify-between items-center px-2 mb-2">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Nodes</h3>
                 <button 
                    onClick={connectAllChannels}
                    className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest"
                  >
                    Sync All
                  </button>
              </div>
              <div className="flex space-x-3 overflow-x-auto pb-6 scrollbar-hide px-2">
                 {CHANNELS.map(c => {
                   const isConnected = connectedChannels.has(c.id);
                   return (
                     <button 
                        key={c.id} 
                        title={`${c.id}: ${isConnected ? 'Active' : 'Offline'}`} 
                        onClick={() => toggleChannelConnection(c.id)}
                        className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-xl transition-all border-2 relative group ${
                          isConnected 
                          ? `${c.color} bg-opacity-20 border-white/10 shadow-lg scale-105` 
                          : 'bg-slate-900 border-white/5 opacity-40 hover:opacity-100'
                        }`}
                     >
                       {c.icon}
                       {isConnected && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse shadow-xl"></div>}
                     </button>
                   );
                 })}
              </div>
              
              <div className="space-y-2">
                {MOCK_THREADS.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setSelectedThreadId(t.id)}
                    className={`w-full text-left p-5 rounded-[2rem] border transition-all relative group ${selectedThreadId === t.id ? 'bg-indigo-600 border-indigo-400 shadow-2xl' : 'bg-slate-900/50 border-white/5 hover:bg-slate-900 hover:border-white/10'}`}
                  >
                    <div className="flex items-center space-x-4">
                       <div className="relative">
                          <img src={t.avatarUrl} className="w-12 h-12 rounded-2xl object-cover border border-white/10" alt="avatar" />
                          <div className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-xl flex items-center justify-center text-[10px] border-4 border-slate-950 shadow-xl ${CHANNELS.find(c => c.id === t.channel)?.color}`}>
                             {CHANNELS.find(c => c.id === t.channel)?.icon}
                          </div>
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                             <span className="font-black text-sm truncate tracking-tight">{t.contactName}</span>
                             <span className="text-[9px] font-bold opacity-30">{t.timestamp}</span>
                          </div>
                          <p className={`text-[11px] truncate leading-tight ${selectedThreadId === t.id ? 'text-indigo-100' : 'text-slate-500'}`}>{t.lastMessage}</p>
                       </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-slate-900/30 flex flex-col relative pattern-grid-dark">
               {selectedThreadId ? (
                 <>
                   <div className="p-8 bg-black/20 border-b border-white/5 flex justify-between items-center backdrop-blur-md z-10">
                      <div className="flex items-center space-x-4">
                         <h3 className="text-2xl font-black tracking-tighter">{MOCK_THREADS.find(t => t.id === selectedThreadId)?.contactName}</h3>
                         <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-tighter">Verified Node</span>
                      </div>
                      <div className="flex items-center space-x-4">
                         <div className="flex items-center space-x-3 bg-slate-950/80 border border-white/10 px-6 py-2.5 rounded-2xl shadow-xl">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hobbs AI Engine</span>
                            <button 
                              onClick={() => toggleAutoPilot(selectedThreadId)}
                              className={`w-12 h-6 rounded-full p-1 transition-all ${MOCK_THREADS.find(t => t.id === selectedThreadId)?.isAiAutoPilot ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-700'}`}
                            >
                               <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-transform ${MOCK_THREADS.find(t => t.id === selectedThreadId)?.isAiAutoPilot ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                         </div>
                         <button className="p-3 bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40 active:scale-95 text-lg">📞</button>
                      </div>
                   </div>
                   <div className="flex-1 p-10 overflow-y-auto space-y-8 scrollbar-hide">
                      <div className="flex justify-center mb-10">
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] bg-white/5 px-6 py-2 rounded-full border border-white/5 backdrop-blur-sm">Security Handshake Complete // 128-bit Encryption</span>
                      </div>
                      <div className="flex flex-col space-y-2 max-w-lg self-start">
                         <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] rounded-tl-lg text-sm leading-relaxed text-slate-200 shadow-xl">
                            Hey Hobbs, just confirming if you received the NDA from the cloudscale team? I sent it via email an hour ago.
                         </div>
                         <span className="text-[9px] font-bold text-slate-600 uppercase ml-4">Sent 10:42 AM</span>
                      </div>
                      <div className="flex flex-col space-y-2 max-w-lg self-end ml-auto">
                         <div className="bg-indigo-600 p-6 rounded-[2.5rem] rounded-tr-lg text-sm leading-relaxed text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)]">
                            Received! I've already cross-referenced it with your previous legal guidelines and flagged Clause 4.2 for review.
                         </div>
                         <span className="text-[9px] font-black text-indigo-400 uppercase mr-4 text-right">Hobbs AI // 10:43 AM</span>
                      </div>
                   </div>
                   <div className="p-10 border-t border-white/5 bg-black/20">
                      <div className="bg-slate-950/90 backdrop-blur-2xl border border-white/10 p-5 rounded-[3rem] flex items-center space-x-5 shadow-2xl">
                         <button className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-2xl flex items-center justify-center">📎</button>
                         <textarea className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm py-4 resize-none h-14 font-medium" placeholder="Instruct Hobbs or send a raw transmission..."></textarea>
                         <button className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-2xl shadow-indigo-900/50 hover:bg-indigo-700 active:scale-90 transition-all">🚀</button>
                      </div>
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-8 opacity-20 animate-pulse">
                    <div className="text-[120px]">📡</div>
                    <h3 className="text-3xl font-black uppercase tracking-[0.3em] text-slate-400">Await Inbound Signal</h3>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Outbound Mode */}
        {activeTab === 'Outbound' && (
          <div className="flex-1 flex animate-in slide-in-from-right-10 duration-500">
            <OutboundView connectedChannels={connectedChannels} assignedNumber={assignedNumber} />
          </div>
        )}

        {/* Memory Mode (formerly Brain) */}
        {activeTab === 'Brain' && (
          <MemoryStudio />
        )}

        {/* Provisioning Mode */}
        {activeTab === 'Provisioning' && (
          <div className="flex-1 flex flex-col items-center justify-center p-20 animate-in fade-in duration-500 bg-black/40">
             <div className="max-w-2xl w-full bg-slate-900 border border-white/10 rounded-[4rem] p-16 space-y-12 shadow-[0_80px_160px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] group-hover:bg-indigo-600/20 transition-all"></div>
                <div className="text-center space-y-6 relative">
                   <div className="w-32 h-32 bg-gradient-to-tr from-indigo-500 via-purple-600 to-indigo-800 rounded-[2.5rem] mx-auto flex items-center justify-center text-6xl shadow-2xl border-2 border-white/10">📱</div>
                   <h3 className="text-5xl font-black tracking-tighter">Provision Global Line</h3>
                   <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md mx-auto">Instantly acquire a verified cloud mobile number for encrypted talk, text, and enterprise data logging.</p>
                </div>

                <div className="space-y-8 relative">
                   <div className="grid grid-cols-2 gap-6">
                      <button 
                        onClick={provisionNumber}
                        disabled={isProvisioning}
                        className="p-10 bg-black/40 border-2 border-white/5 rounded-[3rem] hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-900/20 transition-all group flex flex-col items-center space-y-4"
                      >
                         <span className="text-5xl grayscale group-hover:grayscale-0 transition-all mb-2">🇬</span>
                         <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-indigo-400">Google Voice Hub</span>
                      </button>
                      <button 
                        onClick={provisionNumber}
                        disabled={isProvisioning}
                        className="p-10 bg-black/40 border-2 border-white/5 rounded-[3rem] hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-900/20 transition-all group flex flex-col items-center space-y-4"
                      >
                         <span className="text-5xl text-rose-500 font-black mb-2 tracking-tighter">Twilio</span>
                         <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-rose-400">Programmable SMS</span>
                      </button>
                   </div>

                   {isProvisioning && (
                     <div className="py-10 text-center space-y-5 animate-in slide-in-from-bottom-5">
                        <div className="relative w-12 h-12 mx-auto">
                          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse">Allocating Neural Frequency...</p>
                          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">ETA: {'<'} 10 SECONDS</p>
                        </div>
                     </div>
                   )}

                   {assignedNumber && !isProvisioning && (
                      <div className="p-8 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2.5rem] flex flex-col items-center space-y-3 animate-in zoom-in-95 shadow-2xl">
                         <div className="flex items-center space-x-2">
                           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Successfully Provisioned</span>
                         </div>
                         <span className="text-4xl font-mono text-white tracking-[0.2em] font-black">{assignedNumber}</span>
                      </div>
                   )}
                </div>

                <div className="pt-10 border-t border-white/5 text-center">
                   <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest opacity-40">
                     Proprietary Hobbs Studio telephony infrastructure. Supports cross-region carrier roaming & deep packet logging.
                   </p>
                </div>
             </div>
          </div>
        )}

        {/* Voice Lab */}
        {activeTab === 'Voice' && (
          <div className="flex-1 flex flex-col items-center justify-center p-20 relative overflow-hidden bg-black">
             <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600 rounded-full blur-[160px] animate-pulse"></div>
             </div>
             <div className="z-10 flex flex-col items-center space-y-16 max-w-3xl w-full">
                <div className="text-center space-y-8">
                   <div className="relative">
                      <div className={`w-56 h-56 bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 rounded-[4rem] flex items-center justify-center text-9xl shadow-[0_0_120px_rgba(79,70,229,0.5)] border-4 border-white/10 relative overflow-hidden transition-all duration-700 ${isVoiceActive ? 'scale-110 rotate-3' : 'scale-100 rotate-0 grayscale-[0.3]'}`}>
                         <span className={`${isVoiceActive ? 'animate-bounce' : ''}`}>✨</span>
                         {isVoiceActive && (
                           <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-full bg-white/10 animate-ping rounded-full scale-150 opacity-20"></div>
                           </div>
                         )}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-6xl font-black tracking-tighter">Hobbs Live Voice</h3>
                      <p className="text-slate-400 font-medium text-lg uppercase tracking-widest opacity-60">Ultra-low latency audio synthesis v2.5</p>
                   </div>
                   <div className="pt-8">
                      <button 
                        onClick={() => setIsVoiceActive(!isVoiceActive)}
                        className={`px-20 py-8 rounded-[3rem] font-black text-2xl uppercase tracking-[0.2em] shadow-2xl transition-all transform active:scale-95 border-2 ${
                          isVoiceActive 
                          ? 'bg-rose-600 border-rose-400 shadow-rose-900/40 hover:bg-rose-700' 
                          : 'bg-indigo-600 border-indigo-400 shadow-indigo-900/40 hover:bg-indigo-700'
                        }`}
                      >
                         {isVoiceActive ? 'End Live Link' : 'Establish Session'}
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsHub;
