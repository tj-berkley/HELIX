
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { Workspace, Page, OwnerInfo, BusinessInfo } from '../types';

interface SidebarProps {
  workspaces: Workspace[];
  activeBoardId: string;
  onSelectBoard: (boardId: string) => void;
  activePage: Page;
  onSelectPage: (page: Page) => void;
  ownerInfo: OwnerInfo;
  businessInfo: BusinessInfo;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  service: string;
}

const Sidebar: React.FC<SidebarProps> = ({ workspaces, activeBoardId, onSelectBoard, activePage, onSelectPage, ownerInfo, businessInfo }) => {
  const [isAdminExpanded, setIsAdminExpanded] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Gemini Production', key: '••••••••••••••••', service: 'Google GenAI' }
  ]);
  
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState(localStorage.getItem('ELEVEN_LABS_KEY') || '');
  const [twilioKey, setTwilioKey] = useState(localStorage.getItem('TWILIO_KEY') || '');
  const [telnyxKey, setTelnyxKey] = useState(localStorage.getItem('TELNYX_KEY') || '');
  const [vonageKey, setVonageKey] = useState(localStorage.getItem('VONAGE_KEY') || '');
  
  const [saveStatus, setSaveStatus] = useState<Record<string, boolean>>({});

  const triggerSuccess = (provider: string) => {
    setSaveStatus(prev => ({ ...prev, [provider]: true }));
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, [provider]: false }));
    }, 2000);
  };

  const saveTelephonyKey = (provider: string, val: string) => {
    localStorage.setItem(`${provider.toUpperCase()}_KEY`, val);
    triggerSuccess(provider);
  };

  const clearTelephonyKey = (provider: string) => {
    localStorage.removeItem(`${provider.toUpperCase()}_KEY`);
    if (provider === 'Twilio') setTwilioKey('');
    if (provider === 'Telnyx') setTelnyxKey('');
    if (provider === 'Vonage') setVonageKey('');
    if (provider === 'ElevenLabs') setElevenLabsKey('');
  };

  const mainNav = [
    { id: 'board', label: 'Home', icon: <Icons.Home /> },
    { id: 'portfolio', label: 'Portfolios', icon: <span>📊</span> },
    { id: 'connections', label: 'Connections Hub', icon: <span>💬</span> },
    { id: 'tasks', label: 'My Tasks', icon: <span>✅</span> },
    { id: 'workflows', label: 'Workflows', icon: <span>⚡</span> },
    { id: 'campaigns', label: 'Campaigns', icon: <span>📢</span> },
    { id: 'contacts', label: 'Contacts', icon: <span>👥</span> },
    { id: 'brand-voice', label: 'Brand Voice', icon: <span>✨</span> },
    { id: 'integrations', label: 'Integrations Center', icon: <span>🔌</span> },
  ];

  const platformNav = [
    { id: 'blog', label: 'Blog & Writing', icon: <span>✍️</span> },
    { id: 'content-creator', label: 'Content marketing', icon: <span>🎨</span> },
    { id: 'video-maker', label: 'Video Marketing', icon: <span>📹</span> },
    { id: 'audio-lab', label: 'Audio & Voice Lab', icon: <span>🔊</span> },
    { id: 'social', label: 'Social Connect', icon: <span>🔗</span> },
    { id: 'social-calendar', label: 'Social Calendar', icon: <span>🗓️</span> },
    { id: 'movie-studio', label: 'Movie Studio (Prep)', icon: <span>🎥</span> },
    { id: 'movie-maker', label: 'Movie Maker (Render)', icon: <span>🎬</span> },
    { id: 'box-office', label: 'Box Office', icon: <span>🎟️</span> },
    { id: 'site-builder', label: 'Site Builder', icon: <span>🌐</span> },
  ];

  const renderTelephonyField = (provider: string, value: string, setter: (v: string) => void) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{provider}</label>
        {localStorage.getItem(`${provider.toUpperCase()}_KEY`) && (
          <button 
            onClick={() => clearTelephonyKey(provider)}
            className="text-[8px] font-bold text-rose-500 hover:underline uppercase"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex space-x-1">
        <input 
          type="password" 
          placeholder={`${provider} API Key`} 
          className="flex-1 bg-slate-950 border border-white/5 rounded-lg p-2 text-[10px] text-white outline-none focus:border-indigo-500 transition-colors" 
          value={value} 
          onChange={e => setter(e.target.value)} 
        />
        <button 
          onClick={() => saveTelephonyKey(provider, value)} 
          className={`px-3 rounded-lg text-[10px] font-bold transition-all ${
            saveStatus[provider] ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {saveStatus[provider] ? '✓' : 'Set'}
        </button>
      </div>
    </div>
  );

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-700 select-none overflow-hidden">
      <div className="p-4 flex items-center space-x-2 border-b border-slate-700 cursor-pointer shrink-0" onClick={() => onSelectPage('board')}>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">H</div>
        <span className="font-bold text-white text-lg tracking-tight">Hobbs Studio</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-6">
        <div className="space-y-1">
          {mainNav.map(item => (
            <button 
              key={item.id}
              onClick={() => onSelectPage(item.id as Page)}
              className={`flex items-center space-x-3 w-full p-2.5 rounded-lg transition-all text-sm ${activePage === item.id ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40' : 'hover:bg-slate-800'}`}
            >
              <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div>
          <div className="px-2 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between items-center">
            <span>Creative Suite</span>
          </div>
          <div className="space-y-1">
            {platformNav.map(item => (
              <button 
                key={item.id}
                onClick={() => onSelectPage(item.id as Page)}
                className={`flex items-center space-x-3 w-full p-2.5 rounded-lg transition-all text-sm ${activePage === item.id ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-900/40' : 'hover:bg-slate-800'}`}
              >
                <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-2 shrink-0 bg-slate-900/50">
        <button 
          onClick={() => setIsAdminExpanded(!isAdminExpanded)}
          className={`flex items-center justify-between w-full p-2 hover:bg-slate-800 rounded-lg transition-colors text-sm ${isAdminExpanded ? 'text-white font-bold' : ''}`}
        >
          <div className="flex items-center space-x-3">
            <Icons.Settings />
            <span>Telephony & Auth</span>
          </div>
          <span className={`transition-transform ${isAdminExpanded ? 'rotate-180' : ''}`}><Icons.ChevronDown /></span>
        </button>

        {isAdminExpanded && (
          <div className="mt-2 space-y-4 px-3 py-4 bg-slate-800/30 rounded-xl border border-white/5 animate-in slide-in-from-bottom-2 max-h-96 overflow-y-auto scrollbar-hide shadow-inner">
            
            <div className="space-y-4">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block border-b border-white/5 pb-1">Telephony Providers</span>
              {renderTelephonyField('Twilio', twilioKey, setTwilioKey)}
              {renderTelephonyField('Telnyx', telnyxKey, setTelnyxKey)}
              {renderTelephonyField('Vonage', vonageKey, setVonageKey)}
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest block border-b border-white/5 pb-1">AI Credentials</span>
              {renderTelephonyField('ElevenLabs', elevenLabsKey, setElevenLabsKey)}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-950/80 border-t border-slate-700 flex items-center space-x-3 shrink-0 cursor-pointer hover:bg-slate-900 transition-all" onClick={() => onSelectPage('owner-profile')}>
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white">
          {ownerInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-[11px] font-black text-white truncate">{ownerInfo.name}</p>
          <p className="text-[9px] text-slate-500 font-bold truncate uppercase tracking-tighter">{businessInfo.assignedPhone || 'No assigned phone'}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
