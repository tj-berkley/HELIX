
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import BoardHeader from './components/BoardHeader';
import BoardTable from './components/BoardTable';
import KanbanView from './components/KanbanView';
import TimelineView from './components/TimelineView';
import CalendarView from './components/CalendarView';
import Dashboard from './components/Dashboard';
import IntegrationsCenter from './components/IntegrationsCenter';
import AutomationStudio from './components/AutomationStudio';
import ContactManager from './components/ContactManager';
import Analytics from './components/Analytics';
import Webinars from './components/Webinars';
import GlobalTasks from './components/GlobalTasks';
import SiteBuilder from './components/SiteBuilder';
import BlogPlatform from './components/BlogPlatform';
import BrandVoicePage from './components/BrandVoice';
import SocialCalendar from './components/SocialCalendar';
import ContentCreator from './components/ContentCreator';
import AudioCreator from './components/AudioCreator';
import VideoMaker from './components/VideoMaker';
import MovieStudio from './components/MovieStudio';
import MovieMaker from './components/MovieMaker';
import BoxOffice from './components/BoxOffice';
import ConnectionsHub from './components/ConnectionsHub';
import OwnerProfile from './components/OwnerProfile';
import BusinessIdentity from './components/BusinessIdentity';
import ProjectPortfolio from './components/ProjectPortfolio';
import UsageDashboard from './components/UsageDashboard';
import ConnectionVault from './components/ApiManagement';
import EmailManager from './components/EmailManager';
import AIChatbot from './components/AIChatbot';
import NotebookLM from './components/NotebookLM';
import MedicalHub from './components/MedicalHub';
import { Icons } from './constants';
import { Workspace, Board, Group, Item, BoardView, Page, Status, Priority, ReleasedMovie, MovieScript, Manuscript, OwnerInfo, BusinessInfo, ClonedVoice } from './types';
import { generateBoardFromPrompt, BoardGenerationOptions } from './services/geminiService';

const MOCK_WORKSPACE: Workspace = {
  id: 'ws-1',
  name: 'Main Workspace',
  boards: [
    {
      id: 'b-1',
      name: 'Product Roadmap Q3',
      description: 'Our core focus for the next quarter.',
      groups: [
        {
          id: 'g-1',
          name: 'Critical Phase 1',
          color: '#e2445c',
          items: [
            { 
              id: 'i-1', 
              name: 'UI Refactor', 
              ownerId: 'u-1', 
              status: 'Working on it', 
              priority: 'Critical', 
              timeline: { start: 'Jul 1', end: 'Jul 15' }, 
              dueDate: '2025-02-15',
              lastUpdated: new Date().toISOString(),
              description: 'Complete overhaul of the dashboard layouts and implementation of new design system variables.',
              comments: [
                { id: 'c-1', text: 'Started with the sidebar navigation. Looking for approval on the color palette.', author: 'Senior Engineer', authorId: 'u-1', timestamp: '2/15/2025, 10:00:00 AM', likes: [] }
              ],
              subtasks: [
                { id: 'st-1', name: 'Define color tokens', status: 'Done', ownerId: 'u-1' },
                { id: 'st-2', name: 'Refactor Sidebar.tsx', status: 'Working on it', ownerId: 'u-1' },
                { id: 'st-3', name: 'Update theme provider', status: 'Not Started', ownerId: 'u-1' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const App: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([MOCK_WORKSPACE]);
  const [activeBoardId, setActiveBoardId] = useState(MOCK_WORKSPACE.boards[0].id);
  const [activeView, setActiveView] = useState<BoardView>('Table');
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ status: Status[]; priority: Priority[] }>({
    status: [],
    priority: []
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('OMNI_THEME');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('OMNI_THEME', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo>({ 
    name: 'Senior Engineer', 
    role: 'Full-stack Architect', 
    email: 'engineer@hobbs.studio',
    bio: 'Lead architect at Hobbs Studio.' 
  });
  
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({ 
    name: 'Hobbs Studio', 
    industry: 'Creative Technology', 
    mission: 'Empowering creators.',
    website: 'https://hobbs.studio',
    size: 'Medium (11-50)'
  });

  const [manuscriptLibrary, setManuscriptLibrary] = useState<Manuscript[]>([]);
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [pendingMovieContent, setPendingMovieContent] = useState<{title: string, content: string} | undefined>();
  const [movieProjects, setMovieProjects] = useState<MovieScript[]>([]);
  const [currentMovieScript, setCurrentMovieScript] = useState<MovieScript | null>(null);
  const [releasedMovies, setReleasedMovies] = useState<ReleasedMovie[]>([]);

  const allBoards = useMemo(() => workspaces.flatMap(ws => ws.boards), [workspaces]);

  const activeBoard = useMemo(() => {
    for (const ws of workspaces) {
      const board = ws.boards.find(b => b.id === activeBoardId);
      if (board) return board;
    }
    return null;
  }, [workspaces, activeBoardId]);

  const filteredGroups = useMemo(() => {
    if (!activeBoard) return [];
    return activeBoard.groups.map(group => ({
      ...group,
      items: group.items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = activeFilters.status.length === 0 || activeFilters.status.includes(item.status);
        const matchesPriority = activeFilters.priority.length === 0 || activeFilters.priority.includes(item.priority);
        return matchesSearch && matchesStatus && matchesPriority;
      })
    })).filter(group => group.items.length > 0 || searchQuery === '');
  }, [activeBoard, searchQuery, activeFilters]);

  const handleUpdateItem = useCallback((groupId: string, itemId: string, updates: Partial<Item>) => {
    setWorkspaces(prev => prev.map(ws => ({
      ...ws,
      boards: ws.boards.map(board => {
        if (board.id !== activeBoardId) return board;
        return {
          ...board,
          groups: board.groups.map(group => {
            if (group.id !== groupId) return group;
            return {
              ...group,
              items: group.items.map(item => {
                if (item.id !== itemId) return item;
                return { ...item, ...updates, lastUpdated: new Date().toISOString() };
              })
            };
          })
        };
      })
    })));
  }, [activeBoardId]);

  const handleAddItem = useCallback((groupId: string) => {
    const newItem: Item = {
      id: `i-${Date.now()}`,
      name: 'New Item',
      ownerId: 'u-1',
      status: 'Not Started',
      priority: 'Medium',
      timeline: null,
      dueDate: '',
      lastUpdated: new Date().toISOString(),
      description: '',
      comments: [],
      subtasks: []
    };
    setWorkspaces(prev => prev.map(ws => ({
      ...ws,
      boards: ws.boards.map(board => {
        if (board.id !== activeBoardId) return board;
        return {
          ...board,
          groups: board.groups.map(group => {
            if (group.id !== groupId) return group;
            return {
              ...group,
              items: [...group.items, newItem]
            };
          })
        };
      })
    })));
  }, [activeBoardId]);

  const handleAIGenerate = async (prompt: string, options?: BoardGenerationOptions) => {
    setIsGenerating(true);
    try {
      const aiData = await generateBoardFromPrompt(prompt, options);
      if (aiData) {
        const newBoard: Board = {
          id: `b-${Date.now()}`,
          name: aiData.name || 'AI Generated Board',
          description: aiData.description || 'Generated by Gemini AI',
          groups: (aiData.groups || []).map((g: any, idx: number) => ({
            id: `g-${idx}-${Date.now()}`,
            name: g.name,
            color: g.color || '#579bfc',
            items: (g.items || []).map((it: any, iIdx: number) => ({
              id: `i-${idx}-${iIdx}-${Date.now()}`,
              name: it.name,
              status: it.status || 'Not Started',
              priority: it.priority || 'Medium',
              ownerId: 'u-1',
              timeline: null,
              dueDate: it.dueDate || '',
              lastUpdated: new Date().toISOString(),
              description: it.description || '',
              comments: [],
              subtasks: []
            }))
          }))
        };
        setWorkspaces(prev => prev.map(ws => {
          if (ws.id === 'ws-1') return { ...ws, boards: [newBoard, ...ws.boards] };
          return ws;
        }));
        setActiveBoardId(newBoard.id);
        setActiveView('Table');
        setActivePage('board');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderActiveModule = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard ownerInfo={ownerInfo} businessInfo={businessInfo} boards={allBoards} onSelectPage={setActivePage} onSelectBoard={(id) => { setActiveBoardId(id); setActivePage('board'); }} />;
      case 'email': return <EmailManager theme={theme} />;
      case 'analytics': return <Analytics boards={allBoards} />;
      case 'webinars': return <Webinars />;
      case 'owner-profile': return <OwnerProfile info={ownerInfo} onUpdate={setOwnerInfo} />;
      case 'business-identity': return <BusinessIdentity info={businessInfo} onUpdate={setBusinessInfo} />;
      case 'brand-voice': return <BrandVoicePage />;
      case 'usage-dashboard': return <UsageDashboard />;
      case 'vault': return <ConnectionVault />;
      case 'portfolio': return <ProjectPortfolio boards={allBoards} onAddBoard={(b) => setWorkspaces(prev => prev.map(ws => ws.id === 'ws-1' ? {...ws, boards: [b, ...ws.boards]} : ws))} onSelectProject={(id) => { setActiveBoardId(id); setActivePage('board'); }} />;
      case 'connections': return <ConnectionsHub clonedVoices={clonedVoices} businessInfo={businessInfo} onUpdateBusiness={setBusinessInfo} onUpdateOwner={setOwnerInfo} />;
      case 'integrations': return <IntegrationsCenter onNavigate={setActivePage} />;
      case 'automation': return <AutomationStudio />;
      case 'contacts': return <ContactManager />;
      case 'tasks': return <GlobalTasks activeViewInitial="List" />;
      case 'calendar': return <GlobalTasks activeViewInitial="Calendar" />;
      case 'site-builder': return <SiteBuilder />;
      case 'blog': return <BlogPlatform manuscriptLibrary={manuscriptLibrary} onSaveManuscript={(m) => setManuscriptLibrary(prev => [m, ...prev])} onConvertToMovie={(title, content) => { setPendingMovieContent({ title, content }); setActivePage('movie-studio'); }} />;
      case 'social-calendar': return <SocialCalendar />;
      case 'content-creator': return <ContentCreator />;
      case 'notebook-lm': return <NotebookLM manuscriptLibrary={manuscriptLibrary} />;
      case 'medical-hub': return <MedicalHub />;
      // Fix: Removed unused manuscriptLibrary prop from AudioCreator component to resolve TypeScript assignment error.
      case 'audio-lab': return <AudioCreator onAddClonedVoice={(v) => setClonedVoices(prev => [v, ...prev])} clonedVoices={clonedVoices} />;
      case 'video-maker': return <VideoMaker clonedVoices={clonedVoices} />;
      case 'movie-studio': return <MovieStudio initialContent={pendingMovieContent} manuscriptLibrary={manuscriptLibrary} clonedVoices={clonedVoices} script={currentMovieScript} onUpdateScript={(s) => { setCurrentMovieScript(s); setMovieProjects(prev => prev.find(p => p.id === s.id) ? prev.map(p => p.id === s.id ? s : p) : [s, ...prev]); }} onMoveToProduction={() => setActivePage('movie-maker')} />;
      case 'movie-maker': return <MovieMaker savedProjects={movieProjects} onRelease={(m) => { setReleasedMovies(prev => [m, ...prev]); setActivePage('box-office'); }} />;
      case 'box-office': return <BoxOffice movies={releasedMovies} />;
      case 'board':
        if (!activeBoard) return <div className="flex-1 flex items-center justify-center text-slate-400 font-medium italic text-xl dark:text-slate-500">🚀 Select a mission board to launch</div>;
        return (
          <>
            <BoardHeader board={activeBoard} activeView={activeView} onViewChange={setActiveView} onGenerateAI={handleAIGenerate} isGenerating={isGenerating} searchQuery={searchQuery} onSearchChange={setSearchQuery} activeFilters={activeFilters} onFiltersChange={setActiveFilters} />
            {activeView === 'Table' && <BoardTable groups={filteredGroups} onUpdateItem={handleUpdateItem} onAddItem={handleAddItem} onDeleteGroup={(id) => setWorkspaces(prev => prev.map(ws => ({...ws, boards: ws.boards.map(b => b.id === activeBoardId ? {...b, groups: b.groups.filter(g => g.id !== id)} : b)})))} />}
            {activeView === 'Kanban' && <KanbanView groups={filteredGroups} />}
            {activeView === 'Timeline' && <TimelineView groups={filteredGroups} />}
            {activeView === 'Calendar' && <CalendarView groups={filteredGroups} />}
          </>
        );
      default: return null;
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans bg-gray-50 text-slate-900 transition-colors duration-300 dark:bg-[#0c0e12] dark:text-slate-100 ${theme === 'dark' ? 'dark' : ''}`}>
      <Sidebar workspaces={workspaces} activeBoardId={activeBoardId} onSelectBoard={setActiveBoardId} activePage={activePage} onSelectPage={setActivePage} ownerInfo={ownerInfo} businessInfo={businessInfo} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:bg-[#0c0e12]/80 dark:border-white/5 flex items-center justify-between px-8 shrink-0 z-40 transition-colors duration-300">
           <div className="flex items-center space-x-6 flex-1">
              <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">{activePage.replace('-', ' ')}</span>
                 <Icons.ChevronRight />
                 <span className="text-[10px] font-black text-slate-800 dark:text-slate-100">{activeBoard?.name || (activePage === 'dashboard' ? 'Overview' : activePage.charAt(0).toUpperCase() + activePage.slice(1))}</span>
              </div>
              <div className="relative max-w-md w-full">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icons.Search />
                 </div>
                 <input 
                   type="text" 
                   placeholder="Search Universe..." 
                   className="w-full bg-slate-100 border border-transparent dark:bg-white/5 dark:border-white/10 rounded-full py-1.5 pl-10 pr-4 text-xs text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                 />
              </div>
           </div>
           <div className="flex items-center space-x-4">
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                 {theme === 'light' ? <span>🌙</span> : <span>☀️</span>}
              </button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors relative">
                 <Icons.Message />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-[#0c0e12]"></span>
              </button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                 <Icons.Settings />
              </button>
              <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>
              <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => setActivePage('owner-profile')}>
                 <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg group-hover:scale-110 transition-transform">
                   {ownerInfo.name[0]}
                 </div>
              </div>
           </div>
        </header>

        <main className="flex-1 flex flex-col min-w-0 bg-[#f9fafb] dark:bg-[#0c0e12] overflow-hidden relative transition-colors duration-300">
          {renderActiveModule()}
        </main>
      </div>
      <AIChatbot />
    </div>
  );
};

export default App;
