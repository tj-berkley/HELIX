
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
    { id: 'movie-studio', label: 'Movie Studio', icon: <span>🎥</span> },
    { id: 'movie-maker', label: 'Movie Maker', icon: <span>🎬</span> },
    { id: 'box-office', label: 'Box Office', icon: <span>🎟️</span> },
    { id: 'site-builder', label: 'Site Builder', icon: <span>🌐</span> },
  ];

  const adminNav = [
    { id: 'api-management', label: 'API Management', icon: <span>🔑</span> },
    { id: 'owner-profile', label: 'Owner Profile', icon: <span>👤</span> },
    { id: 'business-identity', label: 'Business Identity', icon: <span>🏢</span> },
    { id: 'usage-dashboard', label: 'Usage & Billing', icon: <span>🏦</span> },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-700 select-none overflow-hidden shrink-0">
      <div className="p-4 flex items-center space-x-2 border-b border-slate-700 cursor-pointer shrink-0" onClick={() => onSelectPage('board')}>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">H</div>
        <span className="font-bold text-white text-lg tracking-tight">Hobbs Studio</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-6 scrollbar-hide">
        <div className="space-y-1">
          {mainNav.map(item => (
            <button 
              key={item.id}
              onClick={() => onSelectPage(item.id as Page)}
              className={`flex items-center space-x-3 w-full p-2.5 rounded-lg transition-all text-sm ${activePage === item.id ? 'bg-blue-600 text-white font-semibold shadow-md' : 'hover:bg-slate-800'}`}
            >
              <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div>
          <div className="px-2 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Creative Suite</div>
          <div className="space-y-1">
            {platformNav.map(item => (
              <button 
                key={item.id}
                onClick={() => onSelectPage(item.id as Page)}
                className={`flex items-center space-x-3 w-full p-2.5 rounded-lg transition-all text-sm ${activePage === item.id ? 'bg-indigo-600 text-white font-semibold shadow-md' : 'hover:bg-slate-800'}`}
              >
                <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <button 
            onClick={() => setIsAdminExpanded(!isAdminExpanded)}
            className="px-2 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between w-full hover:text-slate-300"
          >
            <span>Administration</span>
            <span className={`transition-transform ${isAdminExpanded ? 'rotate-180' : ''}`}><Icons.ChevronDown /></span>
          </button>
          {isAdminExpanded && (
            <div className="space-y-1 animate-in slide-in-from-top-1">
              {adminNav.map(item => (
                <button 
                  key={item.id}
                  onClick={() => onSelectPage(item.id as Page)}
                  className={`flex items-center space-x-3 w-full p-2.5 rounded-lg transition-all text-sm ${activePage === item.id ? 'bg-slate-700 text-white font-semibold' : 'hover:bg-slate-800'}`}
                >
                  <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

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
