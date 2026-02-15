
import React, { useState } from 'react';
import { generateEmailReply } from '../services/geminiService';
import { Icons } from '../constants';

interface Email {
  id: string;
  from: string;
  senderEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  unread: boolean;
  neuralPriority: 'High' | 'Medium' | 'Low';
  avatar?: string;
}

const MOCK_EMAILS: Email[] = [
  { 
    id: '1', 
    from: 'Sarah Jenkins', 
    senderEmail: 's.jenkins@cloudscale.io',
    subject: 'Strategic Partnership Proposal', 
    body: 'Hi, I saw your latest project portfolio and I am very impressed. We would like to discuss a potential long-term partnership regarding neural asset production. Would you be available for a call this Thursday at 2 PM PST to discuss details?', 
    timestamp: '10:45 AM', 
    unread: true, 
    neuralPriority: 'High', 
    avatar: 'https://picsum.photos/40/40?random=1' 
  },
  { 
    id: '2', 
    from: 'Google Cloud Billing', 
    senderEmail: 'billing@google.com',
    subject: 'Usage Statement Available', 
    body: 'Your latest Google Cloud Platform usage statement is now ready for review in the console. Your current balance is $124.50. You can download the PDF statement from your billing dashboard.', 
    timestamp: 'Yesterday', 
    unread: false, 
    neuralPriority: 'Low' 
  },
  { 
    id: '3', 
    from: 'Dev Team', 
    senderEmail: 'devs@hobbs.studio',
    subject: 'Production Deployment Status', 
    body: 'Sprint 24 is now fully deployed to the production environment. Neural latency has been reduced by 14ms across all regions. We are seeing a 10% increase in throughput on the video rendering nodes.', 
    timestamp: 'Feb 14', 
    unread: false, 
    neuralPriority: 'Medium', 
    avatar: 'https://picsum.photos/40/40?random=3' 
  },
  { 
    id: '4', 
    from: 'Alex Rivera', 
    senderEmail: 'alex@startup.vc',
    subject: 'Follow up on Q3 Growth', 
    body: 'Great meeting yesterday. I am sharing the updated deck with the new projections. Let me know if you have any questions before the board meeting on Friday.', 
    timestamp: 'Feb 13', 
    unread: true, 
    neuralPriority: 'High', 
    avatar: 'https://picsum.photos/40/40?random=4' 
  },
];

interface EmailManagerProps {
  theme?: 'light' | 'dark';
}

const EmailManager: React.FC<EmailManagerProps> = ({ theme }) => {
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(MOCK_EMAILS[0].id);
  const [isComposing, setIsComposing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [replyIntent, setReplyIntent] = useState('');

  const selectedEmail = emails.find(e => e.id === selectedEmailId);

  const handleAiDraft = async () => {
    if (!selectedEmail) return;
    setIsDrafting(true);
    try {
      const brandVoice = JSON.parse(localStorage.getItem('HOBBS_BRAND_VOICE') || '{"tone": "Professional"}');
      const result = await generateEmailReply(selectedEmail.body, replyIntent || 'Respond professionally and thank them for the email.', brandVoice);
      setDraftContent(result.body);
      setIsComposing(true);
    } catch (e) {
      console.error(e);
      alert("Neural synthesis failed. Please check your Gemini API key in the Vault.");
    } finally {
      setIsDrafting(false);
    }
  };

  const markAsRead = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, unread: false } : e));
    setSelectedEmailId(id);
  };

  const handleSend = () => {
    alert("Message transmitted via Neural SMTP. Identity verified.");
    setIsComposing(false);
    setDraftContent('');
    setReplyIntent('');
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white dark:bg-[#0c0e12] animate-in fade-in h-full transition-colors">
      {/* Folder Sidebar */}
      <div className="w-64 border-r border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex flex-col shrink-0 p-8 space-y-8">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest px-2">Folders</h3>
          <p className="text-xs font-bold text-slate-900 dark:text-white px-2 tracking-tight">Active Transmissions</p>
        </div>
        <nav className="space-y-1">
          {[
            { id: 'inbox', label: 'Inbox', icon: '📥', count: emails.filter(e => e.unread).length },
            { id: 'starred', label: 'Starred', icon: '⭐', count: 0 },
            { id: 'sent', label: 'Sent', icon: '📤', count: 0 },
            { id: 'drafts', label: 'Drafts', icon: '📝', count: 0 },
            { id: 'neural', label: 'Neural Junk', icon: '⚡', count: 0 },
            { id: 'archive', label: 'Archive', icon: '📁', count: 0 },
          ].map(folder => (
            <button 
              key={folder.id} 
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black transition-all ${folder.id === 'inbox' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white hover:shadow-sm'}`}
            >
              <span className="flex items-center space-x-3">
                <span>{folder.icon}</span>
                <span>{folder.label}</span>
              </span>
              {folder.count > 0 && <span className={`px-2 py-0.5 rounded-full text-[9px] ${folder.id === 'inbox' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>{folder.count}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-6 bg-slate-900 dark:bg-slate-800 rounded-[2rem] text-white space-y-4 shadow-xl">
           <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] font-black uppercase tracking-widest">Neural Filtering: ON</span>
           </div>
           <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed italic">AI is automatically classifying incoming signals by high-intent priority scores.</p>
        </div>
      </div>

      {/* Email List Pane */}
      <div className="w-96 border-r border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c0e12] flex flex-col shrink-0 overflow-y-auto scrollbar-hide">
        <div className="p-6 border-b border-slate-50 dark:border-white/5 sticky top-0 bg-white/80 dark:bg-[#0c0e12]/80 backdrop-blur-md z-10 flex flex-col space-y-4">
           <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Inbox</h3>
              <button 
                onClick={() => { setDraftContent(''); setIsComposing(true); }}
                className="w-10 h-10 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-black dark:hover:bg-slate-200 transition-all shadow-lg active:scale-95"
              >
                <Icons.Plus />
              </button>
           </div>
           <div className="relative">
              <input className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-xs font-medium dark:text-white outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 transition-all" placeholder="Search signals..." />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
           </div>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-white/5">
          {emails.map(email => (
            <button 
              key={email.id} 
              onClick={() => markAsRead(email.id)}
              className={`w-full p-6 text-left transition-all hover:bg-indigo-50/20 dark:hover:bg-white/5 flex space-x-4 group relative ${selectedEmailId === email.id ? 'bg-indigo-50/40 dark:bg-white/5' : ''}`}
            >
               {email.unread && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full"></div>}
               <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-indigo-600 dark:text-indigo-400 shadow-inner shrink-0 overflow-hidden group-hover:scale-110 transition-transform">
                  {email.avatar ? <img src={email.avatar} alt="A" className="w-full h-full object-cover" /> : email.from[0]}
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                     <span className={`text-[11px] font-black tracking-tight truncate ${email.unread ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-600'}`}>{email.from}</span>
                     <span className="text-[8px] font-bold text-slate-400 dark:text-slate-700 uppercase">{email.timestamp}</span>
                  </div>
                  <h4 className={`text-xs truncate ${email.unread ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-500 dark:text-slate-500'}`}>{email.subject}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-600 truncate mt-1 leading-relaxed font-medium">{email.body}</p>
                  <div className="flex items-center space-x-2 mt-2">
                     <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ${email.neuralPriority === 'High' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' : email.neuralPriority === 'Medium' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-white/5'}`}>
                        Priority: {email.neuralPriority}
                     </span>
                  </div>
               </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reading Pane */}
      <div className="flex-1 bg-white dark:bg-[#0c0e12] flex flex-col overflow-hidden relative transition-colors">
        {selectedEmail ? (
          <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-500">
             <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center shrink-0 bg-white dark:bg-[#0c0e12]">
                <div className="space-y-1">
                   <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{selectedEmail.subject}</h2>
                   <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{selectedEmail.from}</span>
                      <span className="text-slate-200 dark:text-white/5">/</span>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-600">{selectedEmail.senderEmail}</span>
                      <span className="text-slate-200 dark:text-white/5">•</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{selectedEmail.timestamp}</span>
                   </div>
                </div>
                <div className="flex space-x-2">
                   <button className="p-3 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500 rounded-xl text-slate-300 dark:text-slate-700 transition-all">🗑️</button>
                   <button className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-slate-300 dark:text-slate-700 transition-all">⭐</button>
                   <button className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-slate-300 dark:text-slate-700 transition-all">📥</button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
                <div className="prose dark:prose-invert max-w-none">
                   <div className="flex items-center space-x-4 mb-10">
                      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-700 shadow-lg">
                        {selectedEmail.avatar ? <img src={selectedEmail.avatar} alt="A" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-slate-400 dark:text-slate-600">{selectedEmail.from[0]}</div>}
                      </div>
                      <div>
                         <p className="font-black text-slate-900 dark:text-white leading-none">{selectedEmail.from}</p>
                         <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest mt-1">To: Me &lt;engineer@hobbs.studio&gt;</p>
                      </div>
                   </div>
                   <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">{selectedEmail.body}</p>
                </div>

                <div className="pt-12 border-t border-slate-100 dark:border-white/5 space-y-8">
                   <div className="flex items-center justify-between px-2">
                      <div className="flex items-center space-x-4">
                         <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Icons.Sparkles />
                         </div>
                         <div>
                            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Neural Assistant</h4>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">In-Context Reply Synthesis</p>
                         </div>
                      </div>
                   </div>
                   <div className="bg-white dark:bg-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl border border-slate-100 dark:border-white/5 group">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest px-2">Reply Objective</label>
                        <textarea 
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 p-6 rounded-[2rem] text-sm font-medium text-slate-700 dark:text-slate-300 min-h-[120px] resize-none outline-none transition-all shadow-inner" 
                          placeholder="Describe your intent... (e.g. 'I'm interested but need more info on pricing, be very professional')" 
                          value={replyIntent}
                          onChange={e => setReplyIntent(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-between items-center pt-6 border-t border-slate-50 dark:border-white/5">
                        <button 
                          onClick={handleAiDraft} 
                          disabled={isDrafting}
                          className="h-14 px-10 bg-slate-900 dark:bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black dark:hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 dark:shadow-none flex items-center space-x-3 active:scale-95 disabled:opacity-50"
                        >
                           {isDrafting ? (
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           ) : (
                             <>
                               <span>Synthesize Draft</span>
                               <span className="text-lg opacity-50 group-hover:opacity-100">✨</span>
                             </>
                           )}
                        </button>
                        <div className="text-right">
                           <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest italic">Gemini 3 Pro Architecture</p>
                           <p className="text-[8px] text-slate-300 dark:text-slate-700 uppercase mt-0.5">Brand Voice: Architect Core v1.0</p>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 space-y-6">
             <span className="text-[140px] animate-pulse">📡</span>
             <h3 className="text-3xl font-black uppercase tracking-[0.3em] dark:text-white">Sector Vacuum Detected</h3>
             <p className="text-xs font-bold uppercase tracking-widest dark:text-white">Select an identity node to view signal</p>
          </div>
        )}

        {/* Neural Compose HUD */}
        {isComposing && (
          <div className="absolute bottom-10 right-10 w-[640px] bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-[4rem] shadow-[0_60px_150px_rgba(0,0,0,0.15)] flex flex-col animate-in slide-in-from-bottom-12 duration-700 overflow-hidden z-[100]">
             <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md flex justify-between items-center">
                <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg">✉️</div>
                   <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Signal Dispatch</h3>
                </div>
                <button onClick={() => setIsComposing(false)} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full text-slate-400 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             <div className="flex-1 p-10 space-y-6">
                <div className="space-y-4">
                   <div className="flex items-center space-x-4 border-b border-slate-100 dark:border-white/5 pb-3">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase w-12">Recip:</span>
                      <input className="flex-1 bg-transparent border-none p-0 text-xs font-bold dark:text-white outline-none focus:ring-0" placeholder="Identity link..." value={selectedEmail?.senderEmail} />
                   </div>
                   <div className="flex items-center space-x-4 border-b border-slate-100 dark:border-white/5 pb-3">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase w-12">Subj:</span>
                      <input className="flex-1 bg-transparent border-none p-0 text-xs font-black dark:text-white outline-none focus:ring-0" placeholder="Signal header..." value={selectedEmail ? `Re: ${selectedEmail.subject}` : ''} />
                   </div>
                </div>
                <textarea 
                  className="w-full h-80 bg-slate-50 dark:bg-slate-950 border-none rounded-[2rem] p-8 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none resize-none leading-relaxed shadow-inner" 
                  value={draftContent}
                  onChange={e => setDraftContent(e.target.value)}
                  placeholder="Drafting signal..."
                />
                <div className="flex items-center justify-between pt-4">
                   <button 
                     onClick={handleSend} 
                     className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-900/20 hover:bg-indigo-700 active:scale-95 transition-all group"
                   >
                      <span>Dispatch Signal</span>
                      <span className="ml-3 group-hover:translate-x-2 transition-transform inline-block">→</span>
                   </button>
                   <div className="flex space-x-2">
                      <button className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all" title="Attach Asset">📎</button>
                      <button className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all" title="Embed Narrative Image">🖼️</button>
                      <button onClick={handleAiDraft} className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-all" title="Neural Remix">✨</button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailManager;