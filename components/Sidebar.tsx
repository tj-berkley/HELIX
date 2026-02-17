
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
  const [isMedicalExpanded, setIsMedicalExpanded] = useState(true);

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: <Icons.Home /> },
    { id: 'prospecting', label: 'Prospecting', icon: <span>🔍</span> },
    { id: 'email', label: 'Email Center', icon: <span>✉️</span> },
    { id: 'analytics', label: 'Analytics Pulse', icon: <span>📈</span> },
    { id: 'portfolio', label: 'Portfolios', icon: <span>📊</span> },
    { id: 'connections', label: 'Connections Hub', icon: <span>💬</span> },
    { id: 'tasks', label: 'My Tasks', icon: <span>✅</span> },
    { id: 'calendar', label: 'Calendar', icon: <Icons.Calendar /> },
    { id: 'automation', label: 'Automation Studio', icon: <span>⚡</span> },
    { id: 'contacts', label: 'Contact Center', icon: <span>👥</span> },
    { id: 'brand-voice', label: 'Brand Voice', icon: <span>✨</span> },
    { id: 'integrations', label: 'Integrations', icon: <span>🔌</span> },
  ];

  const platformNav = [
    { id: 'notebook-lm', label: 'NotebookLM', icon: <span>📓</span> },
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

  const medicalNav = [
    { id: 'medical-hub', label: 'Medical Hub', icon: <span>🏥</span> },
  ];

  const adminNav = [
    { id: 'vault', label: 'Neural Vault', icon: <span>🔐</span> },
    { id: 'owner-profile', label: 'My Profile', icon: <span>👤</span> },
    { id: 'business-identity', label: 'Legal Entity', icon: <span>🏢</span> },
    { id: 'usage-dashboard', label: 'Usage', icon: <span>🏦</span> },
  ];

  const brandName = businessInfo.name || 'GoogleHubs';

  return (
    <aside className="w-[240px] h-screen bg-slate-50 text-slate-600 flex flex-col border-r border-slate-200 dark:bg-[#0c0e12] dark:text-slate-400 dark:border-white/5 select-none overflow-hidden shrink-0 transition-colors duration-300">
      <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-white/5 shrink-0 bg-white dark:bg-black/20">
        <div className="flex items-center space-x-4 group cursor-pointer overflow-hidden" onClick={() => onSelectPage('dashboard')}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden shrink-0">
            <img
              src={businessInfo.logoUrl || "/1._Helix_logo_A1.00.jpg"}
              className="w-full h-full object-contain"
              alt="Logo"
            />
          </div>
          <div className="flex flex-col min-w-0">
             <span className="font-black text-slate-900 dark:text-white text-xs tracking-tighter truncate uppercase leading-none transition-colors">{brandName}</span>
             <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1 opacity-60">HELIX AI v4.5</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
        <div>
          <button onClick={() => setIsMainExpanded(!isMainExpanded)} className="px-3 pb-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center justify-between w-full hover:text-indigo-600 dark:hover:text-white group transition-colors">
            <span>Core Hub</span>
            <span className={`transition-transform duration-300 ${isMainExpanded ? 'rotate-180 text-indigo-500' : ''}`}><Icons.ChevronDown /></span>
          </button>
          {isMainExpanded && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
              {mainNav.map(item => (
                <button key={item.id} onClick={() => onSelectPage(item.id as Page)} className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-2xl transition-all text-xs font-bold ${activePage === item.id ? 'bg-indigo-600/10 text-indigo-600 dark:bg-white/10 dark:text-white shadow-sm relative' : 'hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                  {activePage === item.id && <div className="absolute left-0 w-1 h-5 bg-indigo-600 dark:bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,1)]"></div>}
                  <span className="w-5 h-5 flex items-center justify-center opacity-80">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button onClick={() => setIsCreativeExpanded(!isCreativeExpanded)} className="px-3 pb-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center justify-between w-full hover:text-purple-600 dark:hover:text-white group transition-colors">
            <span>Creative Suite</span>
            <span className={`transition-transform duration-300 ${isCreativeExpanded ? 'rotate-180 text-purple-500' : ''}`}><Icons.ChevronDown /></span>
          </button>
          {isCreativeExpanded && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
              {platformNav.map(item => (
                <button key={item.id} onClick={() => onSelectPage(item.id as Page)} className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-2xl transition-all text-xs font-bold ${activePage === item.id ? 'bg-purple-600/10 text-purple-600 dark:bg-white/10 dark:text-white shadow-sm relative' : 'hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                  {activePage === item.id && <div className="absolute left-0 w-1 h-5 bg-purple-600 dark:bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,1)]"></div>}
                  <span className="w-5 h-5 flex items-center justify-center opacity-80">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button onClick={() => setIsMedicalExpanded(!isMedicalExpanded)} className="px-3 pb-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center justify-between w-full hover:text-rose-600 dark:hover:text-white group transition-colors">
            <span>Health & Medical</span>
            <span className={`transition-transform duration-300 ${isMedicalExpanded ? 'rotate-180 text-rose-500' : ''}`}><Icons.ChevronDown /></span>
          </button>
          {isMedicalExpanded && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
              {medicalNav.map(item => (
                <button key={item.id} onClick={() => onSelectPage(item.id as Page)} className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-2xl transition-all text-xs font-bold ${activePage === item.id ? 'bg-rose-600/10 text-rose-600 dark:bg-white/10 dark:text-white shadow-sm relative' : 'hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                  {activePage === item.id && <div className="absolute left-0 w-1 h-5 bg-rose-600 dark:bg-rose-500 rounded-r-full shadow-[0_0_10px_rgba(244,63,94,1)]"></div>}
                  <span className="w-5 h-5 flex items-center justify-center opacity-80">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button onClick={() => setIsAdminExpanded(!isAdminExpanded)} className="px-3 pb-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center justify-between w-full hover:text-emerald-600 dark:hover:text-white group transition-colors">
            <span>Compliance</span>
            <span className={`transition-transform duration-300 ${isAdminExpanded ? 'rotate-180 text-emerald-500' : ''}`}><Icons.ChevronDown /></span>
          </button>
          {isAdminExpanded && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
              {adminNav.map(item => (
                <button key={item.id} onClick={() => onSelectPage(item.id as Page)} className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-2xl transition-all text-xs font-bold ${activePage === item.id ? 'bg-emerald-600/10 text-emerald-600 dark:bg-white/10 dark:text-white shadow-sm relative' : 'hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                  {activePage === item.id && <div className="absolute left-0 w-1 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-r-full"></div>}
                  <span className="w-5 h-5 flex items-center justify-center opacity-80">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 bg-slate-200/50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 flex items-center space-x-3 shrink-0 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/5 transition-all" onClick={() => onSelectPage('owner-profile')}>
        {ownerInfo.avatarUrl ? (
          <img src={ownerInfo.avatarUrl} className="w-10 h-10 rounded-2xl object-cover shadow-lg border border-white/10 dark:border-white/5" alt="Avatar" />
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-xs font-black text-white shadow-lg border border-white/10">
            {ownerInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-slate-900 dark:text-white truncate leading-none mb-1 transition-colors">{ownerInfo.name}</p>
          <p className="text-[9px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-tighter truncate">{brandName} User</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;