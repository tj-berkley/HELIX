
import React, { useState } from 'react';
import { Integration } from '../types';

const INITIAL_INTEGRATIONS: Integration[] = [
  // Google Workspace
  { id: 'google-gmail', name: 'Gmail', category: 'Google Workspace', icon: '📧', description: 'Sync emails to tasks and automate replies with context-aware AI.', connected: false },
  { id: 'google-calendar', name: 'Google Calendar', category: 'Google Workspace', icon: '📅', description: 'Two-way sync with your team calendars for autonomous scheduling.', connected: true },
  { id: 'google-drive', name: 'Google Drive', category: 'Google Workspace', icon: '📁', description: 'Attach documents and cloud files directly to mission objectives.', connected: false },
  { id: 'google-sheets', name: 'Google Sheets', category: 'Google Workspace', icon: '📊', description: 'Dynamic data mirroring and automated spreadsheet reporting.', connected: false },
  { id: 'google-docs', name: 'Google Docs', category: 'Google Workspace', icon: '📄', description: 'Collaborative AI-assisted writing directly inside portal items.', connected: false },
  { id: 'google-slides', name: 'Google Slides', category: 'Google Workspace', icon: '📙', description: 'Automated deck generation for project milestone reviews.', connected: false },
  
  // Social Distribution
  { id: 'youtube-connect', name: 'YouTube', category: 'Marketing', icon: '🎬', description: 'Automated publishing of long-form cinematic content and shorts directly from the Movie Lab.', connected: false },
  { id: 'tiktok-connect', name: 'TikTok', category: 'Marketing', icon: '🎵', description: 'Direct export for marketing reels and short-form video campaigns.', connected: false },
  { id: 'instagram-connect', name: 'Instagram', category: 'Marketing', icon: '📸', description: 'Sync your visual assets and schedule reels to your professional profile.', connected: false },
  
  // Telephony
  { id: 'twilio', name: 'Twilio', category: 'Telephony', icon: '📱', description: 'Programmable SMS and voice routing for global communications.', connected: false },
  { id: 'telnyx', name: 'Telnyx', category: 'Telephony', icon: '📶', description: 'Enterprise SIP trunking and global mobile number provisioning.', connected: false },
  
  // Communication & Productivity
  { id: 'slack', name: 'Slack', category: 'Communication', icon: '💬', description: 'Real-time notification streams and board update triggers.', connected: true },
  { id: 'discord', name: 'Discord', category: 'Communication', icon: '👾', description: 'Community management and dev-ops alert integration.', connected: false },
];

const CATEGORIES = ['All Apps', 'Google Workspace', 'Marketing', 'Telephony', 'Communication'];

const IntegrationsCenter: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [activeCategory, setActiveCategory] = useState('All Apps');
  const [search, setSearch] = useState('');
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const toggleConnection = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) return;

    if (integration.connected) {
      setIntegrations(prev => prev.map(int => int.id === id ? { ...int, connected: false } : int));
    } else {
      setConnectingId(id);
      setTimeout(() => {
        setIntegrations(prev => prev.map(int => int.id === id ? { ...int, connected: true } : int));
        setConnectingId(null);
      }, 1500);
    }
  };

  const filtered = integrations.filter(int => {
    const matchesSearch = int.name.toLowerCase().includes(search.toLowerCase()) || int.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All Apps' || int.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f9fafb] animate-in fade-in duration-500">
      {/* Categories Sidebar */}
      <div className="w-64 border-r border-slate-200 bg-white p-8 flex flex-col space-y-8 shrink-0">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3">Marketplace</h3>
          <p className="text-sm font-bold text-slate-900 px-3 tracking-tight">App Directory</p>
        </div>
        
        <nav className="space-y-1">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black transition-all ${activeCategory === cat ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              {cat}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-6 bg-slate-900 rounded-[2rem] text-white space-y-4">
           <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="text-[9px] font-black uppercase tracking-widest">Dev Protocol</span>
           </div>
           <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">OmniPortal Studio SDK active.</p>
           <button className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:underline">API Docs →</button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-12 pattern-grid-light">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex justify-between items-end border-b border-slate-200 pb-8">
            <div className="space-y-1">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Marketplace</h2>
              <p className="text-slate-500 font-medium">Link distribution channels and workspace productivity tools.</p>
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search app directory..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium w-80 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(int => (
              <div key={int.id} className={`bg-white rounded-[2.5rem] border-2 transition-all p-8 flex flex-col group relative overflow-hidden ${int.connected ? 'border-indigo-100 shadow-xl' : 'border-transparent shadow-sm hover:shadow-2xl hover:border-indigo-50'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                    {int.icon}
                  </div>
                  {int.connected && (
                    <div className="flex items-center bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 animate-in zoom-in">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                       <span className="text-[10px] font-black uppercase tracking-widest">Linked</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{int.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {int.description}
                  </p>
                </div>

                <div className="pt-8 border-t border-slate-50 mt-6">
                   <button 
                     onClick={() => toggleConnection(int.id)}
                     disabled={connectingId === int.id}
                     className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${
                       connectingId === int.id ? 'bg-slate-100 text-slate-400 cursor-wait' :
                       int.connected 
                       ? 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-rose-500' 
                       : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200 active:scale-95'
                     }`}
                   >
                     {connectingId === int.id ? (
                        <>
                           <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                           <span>Authenticating...</span>
                        </>
                     ) : int.connected ? (
                        <span>Manage Connection</span>
                     ) : (
                        <span>Integrate Channel</span>
                     )}
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsCenter;
