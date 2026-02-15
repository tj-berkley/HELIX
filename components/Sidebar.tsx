
import React, { useState } from 'react';
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

const Sidebar: React.FC<SidebarProps> = ({ activePage, onSelectPage, ownerInfo, businessInfo }) => {
  const [isAdminExpanded, setIsAdminExpanded] = useState(true);
  const [isMainExpanded, setIsMainExpanded] = useState(true);
  const [isCreativeExpanded, setIsCreativeExpanded] = useState(true);

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: <Icons.Home /> },
    { id: 'email', label: 'Email Center', icon: <span>✉️</span> },
    { id: 'analytics', label: 'Analytics Pulse', icon: <span>📈</span> },
    { id: 'portfolio', label: 'Portfolios', icon: <span>📊</span> },
    { id: 'connections', label: 'Connections Hub', icon: <span>💬</span> },
    { id: 'tasks', label: 'My Tasks', icon: <span>✅</span> },
    { id: 'calendar', label: 'Calendar', icon: <Icons.Calendar /> },
    { id: 'workflows', label: 'Workflows', icon: <span>⚡</span> },
    { id: 'campaigns', label: 'Campaigns', icon: <span>📢</span> },
    { id: 'contacts', label: 'Contact Center', icon: <span>👥</span> },
    { id: 'brand-voice', label: 'Brand Voice', icon: <span>✨</span> },
    { id: 'integrations', label: 'Integrations', icon: <span>🔌</span> },
  ];

  const platformNav = [
    { id: 'webinars', label: 'Webinar Center', icon: <span>📡</span> },
    { id: 'site-builder', label: 'Sites', icon: <span>🌐</span> },
    { id: 'blog', label: 'Blog & Writing', icon: <span>✍️</span> },
    { id: 'content-creator', label: 'Content Marketing', icon: <span>🎨</span> },
    { id: 'video-maker', label: 'Video Marketing', icon: <span>📹</span> },
    { id: 'audio-lab', label: 'Audio Lab', icon: <span>🔊</span> },
    { id: 'movie-studio', label: 'Movie Studio', icon: <span>🎥</span> },
    { id: 'movie-maker', label: 'Movie Maker', icon: <span>🎬</span> },
    { id: 'box-office', label: 'Box Office', icon: <span>🍿</span> },
  ];

  const adminNav = [
    { id: 'vault', label: 'Neural Vault', icon: <span>🔐</span> },
    { id: 'owner-profile', label: 'My Profile', icon: <span>👤</span> },
    { id: 'business-identity', label: 'Legal Entity', icon: <span>🏢</span> },
    { id: 'usage-dashboard', label: 'Usage', icon: <span>🏦</span> },
  ];

  const initials = ownerInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const brandName = businessInfo.name || 'Business Identity';

  return (
    <aside className="w-[240px] h-screen bg-[#0c0e12] text-slate-400 flex flex-col border-r border-white/5 select-none overflow-hidden shrink-0">
      {/* White-labeled Brand Header */}
      <div className="h-14 flex items-center px-6 border-b border-white/5 shrink-0">
        <div className="flex items-center space-x-3 group cursor-pointer overflow-hidden" onClick={() => onSelectPage('dashboard')}>
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform overflow-hidden shrink-0">
            {businessInfo.logoUrl ? (
              <img src={businessInfo.logoUrl} className="w-full h-full object-cover" alt="L" />
            ) : (
              brandName[0].toUpperCase()
            )}
          </div>
          <span className="font-black text-white text-sm tracking-tight truncate uppercase">{brandName}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
        {/* Main Navigation Section */}
        <div>
          <button 
            onClick={() => setIsMainExpanded(!isMainExpanded)}
            className="px-3 pb-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center justify-between w-full hover:text-slate-400 group"
          >
            <span>Global Hub</span>
            <span className={`transition-transform duration-300 ${isMainExpanded ? 'rotate-180 text-indigo-400' : ''}`}><Icons.ChevronDown /></span>
          </button>
          {isMainExpanded && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
              {mainNav.map(item => (
                <button 
                  key={item.id}
                  onClick={() => onSelectPage(item.id as Page)}
                  className={`flex items-center space-x-3 w-full px-3 py-2 rounded-xl transition-all text-xs font-bold ${activePage === item.id ? 'bg-white/10 text-white shadow-inner relative' : 'hover:bg-white/5 hover:text-slate-200'}`}
                >
                  {activePage === item.id && <div className="absolute left-0 w-1 h-4 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,1)]"></div>}
                  <span className="w-4 h-4 flex items-center justify-center opacity-80">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Creative Suite Section */}
        <div>
          <button 
            onClick={() => setIsCreativeExpanded(!isCreativeExpanded)}
            className="px-3 pb-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center justify-between w-full hover:text-slate-400 group"
          >
            <span>Creative Suite</span>
            <span className={`transition-transform duration-300 ${isCreativeExpanded ? 'rotate-180 text-purple-400' : ''}`}><Icons.ChevronDown /></span>
          </button>
          {isCreativeExpanded && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
              {platformNav.map(item => (
                <button 
                  key={item.id}
                  onClick={() => onSelectPage(item.id as Page)}
                  className={`flex items-center space-x-3 w-full px-3 py-2 rounded-xl transition-all text-xs font-bold ${activePage === item.id ? 'bg-white/10 text-white shadow-inner relative' : 'hover:bg-white/5 hover:text-slate-200'}`}
                >
                  {activePage === item.id && <div className="absolute left-0 w-1 h-4 bg-purple-500 rounded-r-full shadow-[0_0_8px_rgba(168,85,247,1)]"></div>}
                  <span className="w-4 h-4 flex items-center justify-center opacity-80">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Administration Section */}
        <div>
          <button 
            onClick={() => setIsAdminExpanded(!isAdminExpanded)}
            className="px-3 pb-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center justify-between w-full hover:text-slate-400 group"
          >
            <span>Administration</span>
            <span className={`transition-transform duration-300 ${isAdminExpanded ? 'rotate-180 text-emerald-400' : ''}`}><Icons.ChevronDown /></span>
          </button>
          {isAdminExpanded && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
              {adminNav.map(item => (
                <button 
                  key={item.id}
                  onClick={() => onSelectPage(item.id as Page)}
                  className={`flex items-center space-x-3 w-full px-3 py-2 rounded-xl transition-all text-xs font-bold ${activePage === item.id ? 'bg-white/10 text-white relative' : 'hover:bg-white/5 hover:text-slate-200'}`}
                >
                  {activePage === item.id && <div className="absolute left-0 w-1 h-4 bg-emerald-400 rounded-r-full"></div>}
                  <span className="w-4 h-4 flex items-center justify-center opacity-80">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 bg-white/5 border-t border-white/5 flex items-center space-x-3 shrink-0 cursor-pointer hover:bg-white/10 transition-all" onClick={() => onSelectPage('owner-profile')}>
        {ownerInfo.avatarUrl ? (
          <img src={ownerInfo.avatarUrl} className="w-8 h-8 rounded-xl object-cover shadow-lg border border-white/10" alt="Avatar" />
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-[10px] font-black text-white shadow-lg border border-white/10">
            {initials}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <p className="text-[11px] font-black text-white truncate leading-none mb-1">{ownerInfo.name}</p>
          <p className="text-[9px] text-slate-500 font-bold truncate uppercase tracking-tighter">{brandName}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
