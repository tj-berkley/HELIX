
import React, { useState, useEffect } from 'react';
import { Integration, Page } from '../types';

interface IntegrationsCenterProps {
  onNavigate: (page: Page) => void;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  // Google Workspace
  { id: 'google-gmail', name: 'Gmail', category: 'Google Workspace', icon: '📧', description: 'Sync emails to tasks and automate replies with context-aware AI.', connected: false, envKey: 'API_KEY' },
  { id: 'google-calendar', name: 'Google Calendar', category: 'Google Workspace', icon: '📅', description: 'Two-way sync with your team calendars for autonomous scheduling.', connected: false, envKey: 'API_KEY' },
  { id: 'google-drive', name: 'Google Drive', category: 'Google Workspace', icon: '📁', description: 'Attach documents and cloud files directly to mission objectives.', connected: false, envKey: 'API_KEY' },
  { id: 'google-sheets', name: 'Google Sheets', category: 'Google Workspace', icon: '📊', description: 'Dynamic data mirroring and automated spreadsheet reporting.', connected: false, envKey: 'API_KEY' },
  
  // High Fidelity Media
  { id: 'elevenlabs', name: 'ElevenLabs', category: 'Marketing', icon: '🗣️', description: 'Neural TTS and high-fidelity voice cloning for video and audio content.', connected: false, envKey: 'ELEVEN_LABS_KEY' },
  { id: 'fal-ai', name: 'Fal.ai', category: 'Marketing', icon: '🎆', description: 'Ultra-fast image and media synthesis for cinematic production.', connected: false, envKey: 'FAL_KEY' },
  
  // Telephony & Instant Chat
  { id: 'whatsapp', name: 'WhatsApp Business', category: 'Telephony', icon: '💬', description: 'Neural automated responses and broadcast sequences for customer care.', connected: false, envKey: 'WHATSAPP_TOKEN' },
  { id: 'telegram', name: 'Telegram Bot', category: 'Telephony', icon: '✈️', description: 'High-speed automated signals and dev-ops integration via bot tokens.', connected: false, envKey: 'TELEGRAM_TOKEN' },
  { id: 'twilio', name: 'Twilio', category: 'Telephony', icon: '📱', description: 'Programmable SMS and voice routing for global communications.', connected: false, envKey: 'TWILIO_KEY' },
  { id: 'telnyx', name: 'Telnyx', category: 'Telephony', icon: '📶', description: 'Enterprise SIP trunking and global mobile number provisioning.', connected: false, envKey: 'TELNYX_KEY' },
  { id: 'vonage', name: 'Vonage', category: 'Telephony', icon: '☎️', description: 'Unified communications and video API for customer engagement.', connected: false, envKey: 'VONAGE_KEY' },
  
  // Communication & Productivity
  { id: 'slack', name: 'Slack', category: 'Communication', icon: '💬', description: 'Real-time notification streams and board update triggers.', connected: false, envKey: 'SLACK_KEY' },
  { id: 'discord', name: 'Discord', category: 'Communication', icon: '👾', description: 'Community management and dev-ops alert integration.', connected: false, envKey: 'DISCORD_KEY' },
];

const CATEGORIES = ['All Apps', 'Google Workspace', 'Marketing', 'Telephony', 'Communication'];

const IntegrationsCenter: React.FC<IntegrationsCenterProps> = ({ onNavigate }) => {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [activeCategory, setActiveCategory] = useState('All Apps');
  const [search, setSearch] = useState('');
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  useEffect(() => {
    // Initial sync with localStorage vault
    setIntegrations(prev => prev.map(int => {
      const key = int.envKey ? localStorage.getItem(int.envKey) : null;
      return { ...int, connected: !!key };
    }));
  }, []);

  const toggleConnection = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) return;

    if (integration.connected) {
      setIntegrations(prev => prev.map(int => int.id === id ? { ...int, connected: false } : int));
    } else {
      const keyExists = integration.envKey ? localStorage.getItem(integration.envKey) : null;
      
      if (!keyExists) {
        setErrorId(id);
        return;
      }

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
          <p className="text-sm font-bold text-slate-900 px-3 tracking-tight">Production Directory</p>
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
              <span className="text-[9px] font-black uppercase tracking-widest">Vault Link</span>
           </div>
           <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">OmniPortal automatically detects credentials from your API Vault.</p>
           <button 
            onClick={() => onNavigate('vault')}
            className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:underline"
           >
            Manage Vault Credentials →
           </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-12 pattern-grid-light">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex justify-between items-end border-b border-slate-200 pb-8">
            <div className="space-y-1">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Marketplace</h2>
              <p className="text-slate-500 font-medium">Link actual services via your secure API Vault.</p>
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search production tools..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium w-80 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(int => (
              <div key={int.id} className={`bg-white rounded-[2.5rem] border-2 transition-all p-8 flex flex-col group relative overflow-hidden ${int.connected ? 'border-indigo-100 shadow-xl' : errorId === int.id ? 'border-rose-400 shadow-rose-100' : 'border-transparent shadow-sm hover:shadow-2xl hover:border-indigo-50'}`}>
                
                {errorId === int.id && (
                  <div className="absolute inset-0 bg-rose-600/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in zoom-in-95">
                     <span className="text-4xl">⚠️</span>
                     <div className="space-y-1">
                        <p className="text-sm font-black uppercase text-white tracking-widest leading-tight">Key Missing in Vault</p>
                        <p className="text-[10px] text-rose-100 font-medium">Please add your <strong>{int.envKey}</strong> to the secure vault to enable this link.</p>
                     </div>
                     <div className="flex flex-col w-full space-y-2 pt-4">
                        <button 
                          onClick={() => onNavigate('vault')}
                          className="w-full py-3 bg-white text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-rose-50 transition-all"
                        >
                          Configure in Vault
                        </button>
                        <button 
                          onClick={() => setErrorId(null)}
                          className="w-full py-3 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                        >
                          Back
                        </button>
                     </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                    {int.icon}
                  </div>
                  {int.connected && (
                    <div className="flex items-center bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 animate-in zoom-in">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                       <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
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
                           <span>Verifying Key...</span>
                        </>
                     ) : int.connected ? (
                        <span>Manage Link</span>
                     ) : (
                        <span>Activate Production</span>
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
