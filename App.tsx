
import React, { useState, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import BoardHeader from './components/BoardHeader';
import BoardTable from './components/BoardTable';
import KanbanView from './components/KanbanView';
import TimelineView from './components/TimelineView';
import CalendarView from './components/CalendarView';
import IntegrationsCenter from './components/IntegrationsCenter';
import WorkflowBuilder from './components/WorkflowBuilder';
import CampaignManager from './components/CampaignManager';
import ContactManager from './components/ContactManager';
import GlobalTasks from './components/GlobalTasks';
import SiteBuilder from './components/SiteBuilder';
import BlogPlatform from './components/BlogPlatform';
import BrandVoicePage from './components/BrandVoice';
import SocialConnector from './components/SocialConnector';
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
// Added missing import for ApiManagement
import ApiManagement from './components/ApiManagement';
import AIChatbot from './components/AIChatbot';
import { Workspace, Board, Group, Item, BoardView, Page, Status, Priority, ReleasedMovie, MovieScript, Manuscript, OwnerInfo, BusinessInfo } from './types';
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
  const [activePage, setActivePage] = useState<Page>('board');
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
    size: 'Medium (11-50)'
  });

  // Library & Shared states
  const [manuscriptLibrary, setManuscriptLibrary] = useState<Manuscript[]>([]);
  const [pendingMovieContent, setPendingMovieContent] = useState<{title: string, content: string} | undefined>();
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
            return { ...group, items: [...group.items, newItem] };
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

  const handleReleaseMovie = (movie: ReleasedMovie) => {
    setReleasedMovies(prev => [movie, ...prev]);
    setActivePage('box-office');
  };

  const renderActiveModule = () => {
    switch (activePage) {
      case 'owner-profile': return <OwnerProfile info={ownerInfo} onUpdate={setOwnerInfo} />;
      case 'business-identity': return <BusinessIdentity info={businessInfo} onUpdate={setBusinessInfo} />;
      case 'brand-voice': return <BrandVoicePage />;
      case 'usage-dashboard': return <UsageDashboard />;
      // Added missing handling for api-management page
      case 'api-management': return <ApiManagement />;
      case 'portfolio': return <ProjectPortfolio boards={allBoards} onSelectProject={(id) => { setActiveBoardId(id); setActivePage('board'); }} />;
      case 'connections': return <ConnectionsHub />;
      case 'integrations': return <IntegrationsCenter />;
      case 'workflows': return <WorkflowBuilder />;
      case 'campaigns': return <CampaignManager />;
      case 'contacts': return <ContactManager />;
      case 'tasks': return <GlobalTasks />;
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
      case 'audio-lab': return <AudioCreator />;
      case 'video-maker': return <VideoMaker />;
      case 'movie-studio': return (
        <MovieStudio 
          initialContent={pendingMovieContent} 
          manuscriptLibrary={manuscriptLibrary}
          script={currentMovieScript}
          onUpdateScript={(s) => setCurrentMovieScript(s)}
          onMoveToProduction={() => setActivePage('movie-maker')}
        />
      );
      case 'movie-maker': return (
        <MovieMaker 
          script={currentMovieScript}
          onUpdateScript={(s) => setCurrentMovieScript(s)}
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
    <div className="flex h-screen w-screen overflow-hidden font-sans text-slate-900 bg-slate-950">
      <Sidebar workspaces={workspaces} activeBoardId={activeBoardId} onSelectBoard={setActiveBoardId} activePage={activePage} onSelectPage={setActivePage} ownerInfo={ownerInfo} businessInfo={businessInfo} />
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden relative shadow-2xl rounded-l-[2rem] border-l border-slate-200">
        {renderActiveModule()}
      </main>
      <AIChatbot />
    </div>
  );
};

export default App;
