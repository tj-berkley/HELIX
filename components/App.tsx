
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Sidebar from './Sidebar';
import BoardHeader from './BoardHeader';
import BoardTable from './BoardTable';
import KanbanView from './KanbanView';
import TimelineView from './TimelineView';
import CalendarView from './CalendarView';
import Dashboard from './Dashboard';
import IntegrationsCenter from './IntegrationsCenter';
import WorkflowBuilder from './WorkflowBuilder';
import CampaignManager from './CampaignManager';
import ContactManager from './ContactManager';
import Analytics from './Analytics';
import Webinars from './Webinars';
import GlobalTasks from './GlobalTasks';
import SiteBuilder from './SiteBuilder';
import BlogPlatform from './BlogPlatform';
import BrandVoicePage from './BrandVoice';
import SocialConnector from './SocialConnector';
import SocialCalendar from './SocialCalendar';
import ContentCreator from './ContentCreator';
import AudioCreator from './AudioCreator';
import VideoMaker from './VideoMaker';
import MovieStudio from './MovieStudio';
import MovieMaker from './MovieMaker';
import BoxOffice from './BoxOffice';
import ConnectionsHub from './ConnectionsHub';
import OwnerProfile from './OwnerProfile';
import BusinessIdentity from './BusinessIdentity';
import ProjectPortfolio from './ProjectPortfolio';
import UsageDashboard from './UsageDashboard';
import ApiManagement from './ApiManagement';
import AIChatbot from './AIChatbot';
import { Icons } from '../constants';
import { Workspace, Board, Group, Item, BoardView, Page, Status, Priority, ReleasedMovie, MovieScript, Manuscript, OwnerInfo, BusinessInfo, ClonedVoice } from '../types';
import { generateBoardFromPrompt, BoardGenerationOptions } from '../services/geminiService';

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

  // Identity States
  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo>({ 
    name: 'Senior Engineer', 
    role: 'Full-stack Architect', 
    email: 'engineer@hobbs.studio',
    bio: 'Lead architect at Hobbs Studio. Specialized in autonomous agent orchestration and high-fidelity portal development.' 
  });
  
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({ 
    name: 'Hobbs Studio', 
    industry: 'Creative Technology', 
    mission: 'Empowering the next generation of creators with autonomous AI production environments.',
    website: 'https://hobbs.studio',
    size: 'Medium (11-50)',
    assignedPhone: '+1 (415) 555-0123'
  });

  // Library & Shared states
  const [manuscriptLibrary, setManuscriptLibrary] = useState<Manuscript[]>([]);
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [pendingMovieContent, setPendingMovieContent] = useState<{title: string, content: string} | undefined>();
  
  // Cinematic Registry
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

  const handleMoveItem = useCallback((sourceGroupId: string, targetGroupId: string, itemId: string) => {
    setWorkspaces(prev => prev.map(ws => ({
      ...ws,
      boards: ws.boards.map(board => {
        if (board.id !== activeBoardId) return board;
        let itemToMove: Item | undefined;
        const updatedGroups = board.groups.map(group => {
          if (group.id === sourceGroupId) {
            itemToMove = group.items.find(i => i.id === itemId);
            return { ...group, items: group.items.filter(i => i.id !== itemId) };
          }
          return group;
        });

        if (itemToMove) {
          return {
            ...board,
            groups: updatedGroups.map(group => {
              if (group.id === targetGroupId) {
                return { ...group, items: [...group.items, itemToMove!] };
              }
              return group;
            })
          };
        }
        return board;
      })
    })));
  }, [activeBoardId]);

  const handleDeleteItem = useCallback((groupId: string, itemId: string) => {
    setWorkspaces(prev => prev.map(ws => ({
      ...ws,
      boards: ws.boards.map(board => {
        if (board.id !== activeBoardId) return board;
        return {
          ...board,
          groups: board.groups.map(group => {
            if (group.id !== groupId) return group;
            return { ...group, items: group.items.filter(i => i.id !== itemId) };
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
              // Fix: Changed mapping logic to correctly append newItem to the items array
              items: [...group.items, newItem]
            };
          })
        };
      })
    })));
  }, [activeBoardId]);

  const handleDeleteGroup = useCallback((groupId: string) => {
    setWorkspaces(prev => prev.map(ws => ({
        ...ws,
        boards: ws.boards.map(board => {
            if (board.id !== activeBoardId) return board;
            return {
                ...board,
                groups: board.groups.filter(g => g.id !== groupId)
            };
        })
    })));
  }, [activeBoardId]);

  const handleAddBoard = useCallback((newBoard: Board) => {
    setWorkspaces(prev => prev.map(ws => {
      if (ws.id === 'ws-1') return { ...ws, boards: [newBoard, ...ws.boards] };
      return ws;
    }));
    setActiveBoardId(newBoard.id);
    setActiveView('Table');
    setActivePage('board');
  }, []);

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
        handleAddBoard(newBoard);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveMovieProject = (script: MovieScript) => {
    setMovieProjects(prev => {
      const exists = prev.find(p => p.id === script.id);
      if (exists) return prev.map(p => p.id === script.id ? script : p);
      return [script, ...prev];
    });
  };

  const handleReleaseMovie = (movie: ReleasedMovie) => {
    setReleasedMovies(prev => [movie, ...prev]);
    setActivePage('box-office');
  };

  const renderActiveModule = () => {
    switch (activePage) {
      case 'dashboard': return (
        <Dashboard 
          ownerInfo={ownerInfo} 
          businessInfo={businessInfo} 
          boards={allBoards} 
          onSelectPage={setActivePage} 
          onSelectBoard={(id) => { setActiveBoardId(id); setActivePage('board'); }}
        />
      );
      case 'analytics': return <Analytics boards={allBoards} />;
      case 'webinars': return <Webinars />;
      case 'owner-profile': return <OwnerProfile info={ownerInfo} onUpdate={setOwnerInfo} />;
      case 'business-identity': return <BusinessIdentity info={businessInfo} onUpdate={setBusinessInfo} />;
      case 'brand-voice': return <BrandVoicePage />;
      case 'usage-dashboard': return <UsageDashboard />;
      case 'api-management': return <ApiManagement />;
      case 'portfolio': return <ProjectPortfolio boards={allBoards} onAddBoard={handleAddBoard} onSelectProject={(id) => { setActiveBoardId(id); setActivePage('board'); }} />;
      case 'connections': return <ConnectionsHub clonedVoices={clonedVoices} />;
      case 'integrations': return <IntegrationsCenter />;
      case 'workflows': return <WorkflowBuilder />;
      case 'campaigns': return <CampaignManager />;
      case 'contacts': return <ContactManager />;
      case 'tasks': return <GlobalTasks activeViewInitial="List" />;
      case 'calendar': return <GlobalTasks activeViewInitial="Calendar" />;
      case 'site-builder': return <SiteBuilder />;
      case 'blog': return (
        <BlogPlatform 
          manuscriptLibrary={manuscriptLibrary}
          onSaveManuscript={(m) => setManuscriptLibrary(prev => [m, ...prev])}
          onConvertToMovie={(title, content) => {
            setPendingMovieContent({ title, content });
            setActivePage('movie-studio');
          }} 
        />
      );
      case 'social': return <SocialConnector />;
      case 'social-calendar': return <SocialCalendar />;
      case 'content-creator': return <ContentCreator />;
      case 'audio-lab': return (
        <AudioCreator 
          onAddClonedVoice={(v) => setClonedVoices(prev => [v, ...prev])}
          clonedVoices={clonedVoices}
        />
      );
      case 'video-maker': return <VideoMaker clonedVoices={clonedVoices} />;
      case 'movie-studio': return (
        <MovieStudio 
          initialContent={pendingMovieContent} 
          manuscriptLibrary={manuscriptLibrary}
          clonedVoices={clonedVoices}
          script={currentMovieScript}
          onUpdateScript={(s) => {
            setCurrentMovieScript(s);
            handleSaveMovieProject(s);
          }}
          onMoveToProduction={() => setActivePage('movie-maker')}
        />
      );
      case 'movie-maker': return (
        <MovieMaker 
          savedProjects={movieProjects}
          onRelease={handleReleaseMovie}
        />
      );
      case 'box-office': return <BoxOffice movies={releasedMovies} />;
      case 'board':
        if (!activeBoard) return <div className="flex-1 flex items-center justify-center text-slate-400 font-medium italic text-xl">🚀 Select a mission board to launch</div>;
        return (
          <>
            <BoardHeader 
              board={activeBoard} activeView={activeView} onViewChange={setActiveView}
              onGenerateAI={handleAIGenerate} isGenerating={isGenerating} 
              searchQuery={searchQuery} onSearchChange={setSearchQuery}
              activeFilters={activeFilters} onFiltersChange={setActiveFilters}
            />
            {activeView === 'Table' && (
              <BoardTable 
                groups={filteredGroups} 
                onUpdateItem={handleUpdateItem} 
                onAddItem={handleAddItem} 
                onDeleteGroup={handleDeleteGroup}
                onDeleteItem={handleDeleteItem}
                onMoveItem={handleMoveItem}
              />
            )}
            {activeView === 'Kanban' && <KanbanView groups={filteredGroups} />}
            {activeView === 'Timeline' && <TimelineView groups={filteredGroups} />}
            {activeView === 'Calendar' && <CalendarView groups={filteredGroups} />}
          </>
        );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans text-slate-900 bg-[#0c0e12]">
      <Sidebar 
        workspaces={workspaces} 
        activeBoardId={activeBoardId} 
        onSelectBoard={setActiveBoardId} 
        activePage={activePage} 
        onSelectPage={setActivePage} 
        ownerInfo={ownerInfo} 
        businessInfo={businessInfo} 
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Modern Top Bar */}
        <header className="h-14 border-b border-white/5 bg-[#0c0e12]/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-40">
           <div className="flex items-center space-x-6 flex-1">
              <div className="flex items-center space-x-2 text-slate-400">
                 <span className="text-xs font-black uppercase tracking-[0.2em]">{activePage.replace('-', ' ')}</span>
                 <Icons.ChevronRight />
                 <span className="text-xs font-black text-slate-100">{activeBoard?.name || (activePage === 'dashboard' ? 'Overview' : activePage.charAt(0).toUpperCase() + activePage.slice(1))}</span>
              </div>
              <div className="relative max-w-md w-full">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Icons.Search />
                 </div>
                 <input 
                   type="text" 
                   placeholder="Command + K to Search Everywhere" 
                   className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all"
                 />
              </div>
           </div>
           <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                 <Icons.Message />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#0c0e12]"></span>
              </button>
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                 <Icons.Settings />
              </button>
              <div className="h-6 w-px bg-white/10 mx-2"></div>
              <div 
                className="flex items-center space-x-2 cursor-pointer group"
                onClick={() => setActivePage('owner-profile')}
              >
                 <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg group-hover:scale-110 transition-transform">
                   {ownerInfo.name[0]}
                 </div>
              </div>
           </div>
        </header>

        <main className="flex-1 flex flex-col min-w-0 bg-[#f9fafb] overflow-hidden relative shadow-2xl rounded-tl-[1.5rem] border-t border-l border-white/5">
          {renderActiveModule()}
        </main>
      </div>
      <AIChatbot />
    </div>
  );
};

export default App;
