
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
      {/* Memory Folders Sidebar */}
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
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">Training nodes in the <strong>{activeFolder}</strong> cluster are currently grounding all Gemini-3 operations.</p>
           </div>
           {isSyncing && (
             <div className="flex items-center space-x-2 text-[8px] font-black text-indigo-400 uppercase animate-pulse border-t border-white/5 pt-4">
                <svg className="animate-spin h-3 w-3 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Synapsing Knowledge...</span>
             </div>
           )}
        </div>
      </div>

      {/* Memory Nodes Grid */}
      <div className="flex-1 bg-slate-900/10 p-12 overflow-y-auto pattern-grid-dark relative">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="flex justify-between items-end border-b border-white/5 pb-8">
            <div className="space-y-1">
              <div className="flex items-center space-x-3 mb-2">
                 <span className="text-3xl">🧠</span>
                 <h3 className="text-4xl font-black tracking-tighter text-white">{activeFolder}</h3>
              </div>
              <p className="text-slate-500 font-medium text-lg">Manage proprietary context nodes to train your autonomous agents.</p>
            </div>
            <div className="flex space-x-4 mb-1">
               <button 
                onClick={() => setIsAddingMemory(true)}
                className="px-6 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center shadow-lg active:scale-95"
              >
                Manual Node
              </button>
              <button 
                onClick={() => setIsSmartCapturing(true)}
                className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all flex items-center active:scale-95"
              >
                <span className="mr-3">✨</span>
                Smart Capture
              </button>
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

                <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
                   <div className="flex items-center bg-emerald-500/5 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/10">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                      <span className="text-[9px] font-black uppercase tracking-widest">Grounding Active</span>
                   </div>
                   <div className="flex items-center space-x-1.5">
                      <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                      <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                      <div className="w-1 h-1 rounded-full bg-indigo-500 opacity-20"></div>
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter ml-1">Strength</span>
                   </div>
                </div>
              </div>
            ))}

            {filteredMemories.length === 0 && !isAddingMemory && !isSmartCapturing && (
               <div className="col-span-full py-40 text-center space-y-8 border-4 border-dashed border-white/5 rounded-[4rem] opacity-30 group hover:opacity-50 transition-opacity">
                  <div className="text-[120px] filter grayscale group-hover:grayscale-0 transition-all">🧠</div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black uppercase tracking-widest text-white">Cluster Void</p>
                    <p className="text-lg font-bold uppercase tracking-widest text-slate-500">No context nodes found in this knowledge cluster</p>
                  </div>
                  <button onClick={() => setIsSmartCapturing(true)} className="px-10 py-4 bg-indigo-600/10 border border-indigo-600/30 rounded-2xl text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all">Launch Neural Extraction</button>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Memory Modal */}
      {isAddingMemory && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in" onClick={() => setIsAddingMemory(false)}>
          <div className="bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter">Manual Augmentation</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Direct Brain Interface</p>
              </div>
              <button onClick={() => setIsAddingMemory(false)} className="p-3 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-10 space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Node Identity</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. Legal Compliance Matrix"
                  className="w-full px-8 py-5 bg-slate-950 border-2 border-white/5 rounded-[2rem] focus:border-indigo-500 outline-none transition-all font-black text-xl text-white shadow-inner"
                  value={newNode.title}
                  onChange={(e) => setNewNode({ ...newNode, title: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Instructional Payload</label>
                <textarea 
                  placeholder="Detailed factual or logical information to ground the AI model..."
                  className="w-full px-8 py-6 bg-slate-950 border-2 border-white/5 rounded-[2.5rem] focus:border-indigo-500 outline-none transition-all font-medium text-slate-300 h-48 resize-none shadow-inner leading-relaxed"
                  value={newNode.content}
                  onChange={(e) => setNewNode({ ...newNode, content: e.target.value })}
                />
              </div>

              <div className="pt-4 flex space-x-4">
                <button onClick={() => setIsAddingMemory(false)} className="flex-1 py-6 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 rounded-2xl transition-all">Discard</button>
                <button 
                  onClick={addMemory}
                  disabled={!newNode.title || !newNode.content}
                  className="flex-[2] py-6 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-900/40 transition-all transform active:scale-95 disabled:opacity-20"
                >
                  Confirm Memory Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Capture Modal */}
      {isSmartCapturing && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in" onClick={() => setIsSmartCapturing(false)}>
           <div className="bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-indigo-600/10">
                <div>
                   <h3 className="text-3xl font-black text-white tracking-tighter flex items-center">
                     <span className="mr-4">✨</span> Smart Extraction
                   </h3>
                   <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Gemini 3 Pro context Distillation</p>
                </div>
                <button onClick={() => setIsSmartCapturing(false)} className="p-3 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-12 space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Knowledge Payload</label>
                    <textarea 
                      placeholder="Paste unstructured notes, emails, or company guidelines here. Gemini will analyze and distill them into 3 high-value memory nodes..."
                      className="w-full px-8 py-8 bg-slate-950 border-2 border-white/5 rounded-[3rem] focus:border-indigo-500 outline-none transition-all font-medium text-slate-300 h-72 resize-none shadow-inner leading-relaxed"
                      value={smartCaptureText}
                      onChange={(e) => setSmartCaptureText(e.target.value)}
                    />
                 </div>

                 <div className="pt-4 flex flex-col space-y-6">
                    <button 
                      onClick={handleSmartCapture}
                      disabled={!smartCaptureText.trim() || isSmartCapturing}
                      className={`w-full py-8 bg-indigo-600 text-white text-sm font-black uppercase tracking-[0.3em] rounded-[2rem] hover:bg-indigo-700 shadow-2xl shadow-indigo-900/40 transition-all transform active:scale-95 disabled:opacity-30 flex items-center justify-center space-x-4`}
                    >
                      {isSmartCapturing ? (
                        <>
                           <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                           <span>Analyzing context...</span>
                        </>
                      ) : (
                        <>
                           <span>Embed Neural Nodes</span>
                           <span className="text-2xl">🚀</span>
                        </>
                      )}
                    </button>
                    <div className="p-6 bg-indigo-950/20 rounded-2xl border border-indigo-500/10 flex items-center justify-between">
                       <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Target Cluster</span>
                       <span className="text-[10px] font-black text-white uppercase tracking-widest px-3 py-1 bg-indigo-600 rounded-lg">{activeFolder}</span>
                    </div>
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
    <div className="flex-1 flex overflow-hidden bg-[#f9fafb]">
      <div className="w-[450px] border-r border-slate-200 bg-white p-10 space-y-10 flex flex-col shrink-0">
        <div className="space-y-1">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Broadcast Studio</h3>
           <p className="text-sm font-bold text-slate-900 tracking-tight px-1">Outbound Transmission</p>
        </div>
        
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">1. Path Selection</label>
          <div className="grid grid-cols-4 gap-3">
            {CHANNELS.map(c => (
              <button 
                key={c.id} 
                onClick={() => setSelectedChannel(c.id)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center space-y-2 group ${
                  selectedChannel === c.id 
                    ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                    : connectedChannels.has(c.id) 
                      ? 'border-slate-100 bg-white hover:border-indigo-200' 
                      : 'border-slate-50 opacity-20 grayscale cursor-not-allowed'
                }`}
                disabled={!connectedChannels.has(c.id)}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{c.icon}</span>
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
            placeholder="Draft secure communication..."
            className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none shadow-inner placeholder-slate-300"
          />
          <button 
            onClick={handleSend}
            disabled={!outboundMessage.trim() || !selectedChannel || isSending}
            className={`w-full py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-2xl ${
              isSending ? 'bg-slate-800 animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
            } disabled:opacity-20`}
          >
            {isSending ? 'Transmitting...' : 'Initiate Push'}
          </button>
        </div>
      </div>

      <div className="flex-1 p-12 overflow-y-auto pattern-grid-light">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex justify-between items-end border-b border-slate-200 pb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Live Transmission Matrix</h3>
            <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Real-time Tracking</span>
          </div>

          <div className="space-y-4">
            {sentHistory.map(item => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex items-center space-x-8 hover:shadow-2xl hover:border-indigo-100 transition-all group shadow-sm">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl ${CHANNELS.find(c => c.id === item.channel)?.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                  {CHANNELS.find(c => c.id === item.channel)?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-slate-900 text-lg tracking-tight">{item.recipient}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.time}</span>
                  </div>
                  <p className="text-sm text-slate-500 truncate pr-12 font-medium italic">"{item.message}"</p>
                </div>
                <div className="flex flex-col items-end">
                   <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${
                     item.status === 'Delivered' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                     item.status === 'Read' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
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

interface ConnectionsHubProps {
  clonedVoices?: ClonedVoice[];
}

const ConnectionsHub: React.FC<ConnectionsHubProps> = ({ clonedVoices = [] }) => {
  const [activeTab, setActiveTab] = useState<'Inbound' | 'Outbound' | 'AI Memory' | 'Voice' | 'Provisioning'>('Inbound');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<HobbsPersona>('Personal Assistant');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  // Voice Selection
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('Kore');
  const availableVoices = [...clonedVoices, ...DEFAULT_VOICES];
  
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

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-white font-sans">
      {/* Header */}
      <div className="p-8 bg-black/40 border-b border-white/5 flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center space-x-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-2xl shadow-indigo-900/40 border border-white/10 group-hover:rotate-6 transition-transform">
             {availableVoices.find(v => v.id === selectedVoiceId)?.emoji || PERSONAS.find(p => p.role === activePersona)?.icon}
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Connections Hub</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
                {availableVoices.find(v => v.id === selectedVoiceId)?.label || activePersona} Voice Active
            </p>
          </div>
        </div>
        <div className="flex bg-slate-900/50 p-1.5 rounded-[1.5rem] border border-white/5 shadow-inner">
           {(['Inbound', 'Outbound', 'AI Memory', 'Voice', 'Provisioning'] as const).map(tab => (
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'text-slate-500 hover:text-slate-300'}`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Inbound Mode */}
        {activeTab === 'Inbound' && (
          <div className="flex-1 flex overflow-hidden animate-in fade-in duration-500 bg-slate-950">
            {/* Thread List Sidebar */}
            <div className="w-96 border-r border-white/5 bg-black/20 flex flex-col shrink-0 overflow-y-auto p-6 space-y-6">
              <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] mb-2 shadow-2xl relative overflow-hidden group">
                 <div className="absolute -right-5 -top-5 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 relative">Active Phone Line</p>
                    {assignedNumber && <span className="text-[7px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 uppercase">Neural Voice Answering</span>}
                 </div>
                 {assignedNumber ? (
                   <div className="flex justify-between items-center relative">
                     <span className="font-mono text-lg text-white tracking-widest">{assignedNumber}</span>
                     <div className="flex -space-x-2">
                        {availableVoices.slice(0, 3).map(v => (
                            <div key={v.id} className={`w-6 h-6 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] ${selectedVoiceId === v.id ? 'bg-indigo-500 z-10' : 'bg-slate-800'}`}>{v.emoji}</div>
                        ))}
                     </div>
                   </div>
                 ) : (
                   <button onClick={() => setActiveTab('Provisioning')} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 mt-2">Provision Line</button>
                 )}
              </div>

              <div className="flex justify-between items-center px-2 mb-1">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Nodes</h3>
                 <button 
                    onClick={connectAllChannels}
                    className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest"
                  >
                    Sync Network
                  </button>
              </div>
              
              {/* SIGNAL NODES GRID FIX: Switched from a scrolling row to a 5-column grid to prevent overlap and ensure visibility. */}
              <div className="grid grid-cols-5 gap-2 px-1 pb-4">
                 {CHANNELS.map(c => {
                   const isConnected = connectedChannels.has(c.id);
                   return (
                     <button 
                        key={c.id} 
                        title={`${c.id}: ${isConnected ? 'Active' : 'Offline'}`} 
                        onClick={() => toggleChannelConnection(c.id)}
                        className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xl transition-all border-2 relative group ${
                          isConnected 
                          ? `${c.color} bg-opacity-20 border-white/20 shadow-lg scale-105 z-10` 
                          : 'bg-slate-900 border-white/5 opacity-40 hover:opacity-100 hover:border-white/10'
                        }`}
                     >
                       {c.icon}
                       {isConnected && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse shadow-2xl"></div>}
                     </button>
                   );
                 })}
              </div>
              
              <div className="space-y-3">
                {MOCK_THREADS.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setSelectedThreadId(t.id)}
                    className={`w-full text-left p-6 rounded-[2.5rem] border transition-all relative group overflow-hidden ${selectedThreadId === t.id ? 'bg-indigo-600 border-indigo-400 shadow-[0_20px_50px_rgba(79,70,229,0.3)]' : 'bg-slate-900/40 border-white/5 hover:bg-slate-900 hover:border-white/10'}`}
                  >
                    <div className="flex items-center space-x-5 relative z-10">
                       <div className="relative shrink-0">
                          <img src={t.avatarUrl} className="w-14 h-14 rounded-[1.2rem] object-cover border border-white/10 group-hover:scale-105 transition-transform" alt="avatar" />
                          <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center text-xs border-4 border-slate-950 shadow-2xl ${CHANNELS.find(c => c.id === t.channel)?.color}`}>
                             {CHANNELS.find(c => c.id === t.channel)?.icon}
                          </div>
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <span className="font-black text-sm truncate tracking-tight text-white">{t.contactName}</span>
                             <span className={`text-[8px] font-bold ${selectedThreadId === t.id ? 'text-indigo-200' : 'text-slate-600'}`}>{t.timestamp}</span>
                          </div>
                          <p className={`text-xs truncate leading-tight font-medium ${selectedThreadId === t.id ? 'text-indigo-100' : 'text-slate-500'}`}>{t.lastMessage}</p>
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
                   <div className="p-8 bg-black/20 border-b border-white/5 flex justify-between items-center backdrop-blur-xl z-10">
                      <div className="flex items-center space-x-6">
                         <div className="relative">
                            <img src={MOCK_THREADS.find(t => t.id === selectedThreadId)?.avatarUrl} className="w-12 h-12 rounded-2xl border border-white/10" />
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                         </div>
                         <div>
                            <h3 className="text-2xl font-black tracking-tighter text-white">{MOCK_THREADS.find(t => t.id === selectedThreadId)?.contactName}</h3>
                            <div className="flex items-center space-x-2">
                               <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-widest border border-indigo-500/20">Secured Node</span>
                               <span className="text-[9px] font-bold text-slate-600 uppercase">via {MOCK_THREADS.find(t => t.id === selectedThreadId)?.channel}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center space-x-4">
                         <div className="flex flex-col items-end px-4 border-r border-white/10 mr-4">
                            <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest">Assistant Voice</span>
                            <div className="flex items-center space-x-1 text-[10px] font-black text-indigo-400">
                                <span>{availableVoices.find(v => v.id === selectedVoiceId)?.emoji}</span>
                                <span>{availableVoices.find(v => v.id === selectedVoiceId)?.label}</span>
                            </div>
                         </div>
                         <div className="flex items-center space-x-4 bg-slate-950/80 border border-white/10 pl-6 pr-2 py-2 rounded-2xl shadow-2xl">
                            <div className="flex flex-col text-right">
                               <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Auto-Pilot</span>
                               <span className="text-[9px] font-bold text-emerald-400 uppercase">Active Agent</span>
                            </div>
                            <button className="w-12 h-6 bg-emerald-500 rounded-full p-1 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                               <div className="w-4 h-4 bg-white rounded-full translate-x-6 transition-transform"></div>
                            </button>
                         </div>
                         <button className="w-12 h-12 bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40 active:scale-95 text-xl flex items-center justify-center">📞</button>
                      </div>
                   </div>
                   <div className="flex-1 p-10 overflow-y-auto space-y-10 scrollbar-hide">
                      <div className="flex justify-center mb-10">
                         <div className="flex items-center space-x-3 bg-white/5 border border-white/5 px-8 py-2.5 rounded-full backdrop-blur-md">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em]">Quantum Handshake Verified // E2EE Active</span>
                         </div>
                      </div>
                      <div className="flex flex-col space-y-2 max-w-lg self-start animate-in slide-in-from-left-4">
                         <div className="bg-slate-900 border border-white/10 p-8 rounded-[3rem] rounded-tl-lg text-sm leading-relaxed text-slate-200 shadow-2xl">
                            Hey Hobbs, just confirming if you received the NDA from the cloudscale team? I sent it via email an hour ago.
                         </div>
                         <span className="text-[9px] font-bold text-slate-600 uppercase ml-6">Sent 10:42 AM</span>
                      </div>
                      <div className="flex flex-col space-y-2 max-w-lg self-end ml-auto animate-in slide-in-from-right-4">
                         <div className="bg-indigo-600 p-8 rounded-[3rem] rounded-tr-lg text-sm leading-relaxed text-white shadow-[0_30px_60px_rgba(79,70,229,0.3)] relative group">
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-white text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black shadow-xl group-hover:scale-110 transition-transform">
                                {availableVoices.find(v => v.id === selectedVoiceId)?.emoji || '🧠'}
                            </div>
                            Received! I've already cross-referenced it with your previous legal guidelines and flagged Clause 4.2 for review. I've also drafted a response for your approval.
                         </div>
                         <span className="text-[9px] font-black text-indigo-400 uppercase mr-6 text-right">
                            {availableVoices.find(v => v.id === selectedVoiceId)?.label || 'Hobbs'} Neural Node // 10:43 AM
                         </span>
                      </div>
                   </div>
                   <div className="p-10 border-t border-white/5 bg-black/30 backdrop-blur-2xl">
                      <div className="bg-slate-950/90 border border-white/10 p-6 rounded-[3.5rem] flex items-center space-x-6 shadow-2xl group focus-within:border-indigo-500 transition-all">
                         <button className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-[1.5rem] transition-all text-2xl flex items-center justify-center border border-white/5">📎</button>
                         <textarea className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm py-4 resize-none h-14 font-medium text-white placeholder-slate-600" placeholder={`Instruct ${availableVoices.find(v => v.id === selectedVoiceId)?.label || 'the agent'} or send transmission...`}></textarea>
                         <button className="w-16 h-16 bg-indigo-600 text-white rounded-[1.8rem] flex items-center justify-center text-4xl shadow-2xl shadow-indigo-900/50 hover:bg-indigo-700 active:scale-90 transition-all">🚀</button>
                      </div>
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-10 opacity-20 animate-pulse">
                    <div className="text-[140px] filter drop-shadow-[0_0_50px_rgba(99,102,241,0.5)]">📡</div>
                    <div className="text-center space-y-2">
                       <h3 className="text-4xl font-black uppercase tracking-[0.4em] text-white">Await Signal</h3>
                       <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Awaiting inbound connection from network nodes</p>
                    </div>
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

        {/* AI Memory Mode */}
        {activeTab === 'AI Memory' && (
          <MemoryStudio />
        )}

        {/* Provisioning Mode */}
        {activeTab === 'Provisioning' && (
           <div className="flex-1 flex flex-col items-center justify-center p-20 animate-in fade-in duration-700 bg-black/60 relative overflow-hidden">
             {/* Background Blobs */}
             <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
             <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>

             <div className="max-w-3xl w-full bg-slate-900 border border-white/10 rounded-[5rem] p-20 space-y-16 shadow-[0_100px_200px_rgba(0,0,0,0.9)] relative z-10 group overflow-hidden">
                <div className="text-center space-y-8 relative">
                   <div className="w-40 h-40 bg-gradient-to-tr from-indigo-500 via-purple-600 to-indigo-900 rounded-[3.5rem] mx-auto flex items-center justify-center text-7xl shadow-[0_20px_80px_rgba(79,70,229,0.4)] border-2 border-white/20 transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-700">📱</div>
                   <div className="space-y-3">
                      <h3 className="text-6xl font-black tracking-tighter text-white">Cloud Telephony</h3>
                      <p className="text-slate-400 font-medium text-xl leading-relaxed max-w-lg mx-auto">Instantly acquire verified mobile identities for encrypted talk, text, and data-driven communications.</p>
                   </div>
                </div>

                <div className="space-y-10 relative">
                   <div className="grid grid-cols-2 gap-8">
                      <button 
                        onClick={provisionNumber}
                        disabled={isProvisioning}
                        className="p-12 bg-black/40 border-2 border-white/5 rounded-[3.5rem] hover:border-indigo-500 hover:shadow-[0_0_50px_rgba(79,70,229,0.2)] transition-all group/btn flex flex-col items-center space-y-6 relative overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-indigo-600/0 group-hover/btn:bg-indigo-600/5 transition-colors"></div>
                         <span className="text-6xl grayscale group-hover/btn:grayscale-0 transition-all mb-2 filter drop-shadow-lg">🇬</span>
                         <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 group-hover/btn:text-indigo-400">Google Voice Hub</span>
                      </button>
                      <button 
                        onClick={provisionNumber}
                        disabled={isProvisioning}
                        className="p-12 bg-black/40 border-2 border-white/5 rounded-[3.5rem] hover:border-rose-500 hover:shadow-[0_0_50px_rgba(244,63,94,0.2)] transition-all group/btn flex flex-col items-center space-y-6 relative overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-rose-600/0 group-hover/btn:bg-rose-600/5 transition-colors"></div>
                         <span className="text-6xl text-rose-500 font-black mb-2 tracking-tighter filter drop-shadow-lg">Twilio</span>
                         <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 group-hover/btn:text-rose-400">Programmable SMS</span>
                      </button>
                   </div>

                   {isProvisioning && (
                     <div className="py-12 text-center space-y-6 animate-in slide-in-from-bottom-5">
                        <div className="relative w-16 h-16 mx-auto">
                          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-black text-indigo-400 uppercase tracking-[0.5em] animate-pulse">Allocating Neural Frequency...</p>
                          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Estimated Wait: <span className="text-white">7 SECONDS</span></p>
                        </div>
                     </div>
                   )}

                   {assignedNumber && !isProvisioning && (
                      <div className="p-12 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[4rem] flex flex-col items-center space-y-4 animate-in zoom-in-95 shadow-[0_30px_100px_rgba(16,185,129,0.1)]">
                         <div className="flex items-center space-x-3">
                           <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                           <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.5em]">Identity Verified</span>
                         </div>
                         <span className="text-5xl font-mono text-white tracking-[0.2em] font-black border-b-4 border-emerald-500/30 pb-2">{assignedNumber}</span>
                      </div>
                   )}
                </div>

                <div className="pt-12 border-t border-white/5 text-center">
                   <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest opacity-60 max-w-md mx-auto">
                     Proprietary OmniPortal Studio telephony infrastructure. Supports cross-region carrier roaming & automated sentiment logging.
                   </p>
                </div>
             </div>
          </div>
        )}

        {/* Voice Lab */}
        {activeTab === 'Voice' && (
          <div className="flex-1 flex overflow-hidden bg-black relative">
             <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-600 rounded-full blur-[200px] animate-pulse"></div>
             </div>

             {/* Voice Selection Sidebar */}
             <div className="w-96 border-r border-white/5 bg-black/40 p-10 flex flex-col space-y-10 shrink-0 z-20 overflow-y-auto scrollbar-hide">
                <div className="space-y-1">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-1">Neural Registry</h3>
                   <p className="text-sm font-bold text-white tracking-tight px-1">Active Call Persona</p>
                </div>

                <div className="space-y-4">
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2">Select Target Voice</p>
                   <div className="grid grid-cols-1 gap-3">
                      {availableVoices.map(v => (
                         <button 
                            key={v.id} 
                            onClick={() => setSelectedVoiceId(v.id)}
                            className={`w-full text-left p-5 rounded-[2rem] border transition-all flex items-center space-x-5 ${selectedVoiceId === v.id ? 'bg-indigo-600 border-indigo-400 shadow-2xl' : 'bg-slate-900 border-white/5 hover:border-white/10'}`}
                         >
                            <span className="text-3xl">{v.emoji}</span>
                            <div className="flex-1 min-w-0">
                               <h4 className="font-black text-sm uppercase tracking-tight flex items-center">
                                  {v.label}
                                  {v.id.includes('cloned') && <span className="ml-2 text-[7px] bg-indigo-400 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">CLONE</span>}
                               </h4>
                               <p className="text-[10px] text-slate-400 truncate font-medium mt-0.5">{v.description}</p>
                            </div>
                            {selectedVoiceId === v.id && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                         </button>
                      ))}
                   </div>
                </div>

                <div className="p-8 bg-slate-900/50 rounded-[2.5rem] border border-white/5 space-y-4">
                   <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Voice Protocol</h4>
                   <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                      This voice will be used for both answering inbound telephony calls and for all real-time voice link sessions.
                   </p>
                </div>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center p-20 z-10">
                <div className="text-center space-y-12 max-w-4xl w-full">
                   <div className="relative">
                      <div className={`w-72 h-72 bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 rounded-[5rem] flex items-center justify-center text-[140px] shadow-[0_0_150px_rgba(79,70,229,0.6)] border-4 border-white/10 relative overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${isVoiceActive ? 'scale-110 rotate-6' : 'scale-100 rotate-0 grayscale-[0.5]'}`}>
                         <span className={`${isVoiceActive ? 'animate-bounce' : ''}`}>{availableVoices.find(v => v.id === selectedVoiceId)?.emoji || '✨'}</span>
                         {isVoiceActive && (
                           <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-full bg-white/10 animate-ping rounded-full scale-150 opacity-20"></div>
                           </div>
                         )}
                      </div>
                   </div>
                   <div className="space-y-6">
                      <h3 className="text-7xl font-black tracking-tighter text-white leading-none">Live Neural Link</h3>
                      <p className="text-slate-400 font-bold text-xl uppercase tracking-[0.4em] opacity-60">
                          Active Voice: <span className="text-indigo-400">{availableVoices.find(v => v.id === selectedVoiceId)?.label || 'System Core'}</span>
                      </p>
                   </div>
                   <div className="pt-10">
                      <button 
                        onClick={() => setIsVoiceActive(!isVoiceActive)}
                        className={`px-24 py-10 rounded-[4rem] font-black text-3xl uppercase tracking-[0.3em] shadow-[0_40px_100px_rgba(0,0,0,0.5)] transition-all transform active:scale-95 border-4 ${
                          isVoiceActive 
                          ? 'bg-rose-600 border-rose-400 shadow-rose-900/40 hover:bg-rose-700' 
                          : 'bg-indigo-600 border-indigo-400 shadow-indigo-900/40 hover:bg-indigo-700'
                        }`}
                      >
                         {isVoiceActive ? 'Kill Link' : 'Open Link'}
                      </button>
                   </div>
                </div>
                
                <div className="grid grid-cols-3 gap-10 w-full opacity-40 mt-20">
                   <div className="text-center space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sample Rate</p>
                      <p className="text-2xl font-black text-white">48kHz</p>
                   </div>
                   <div className="text-center space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jitter Buffer</p>
                      <p className="text-2xl font-black text-white">12ms</p>
                   </div>
                   <div className="text-center space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol</p>
                      <p className="text-2xl font-black text-white">WSS/RTC</p>
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
