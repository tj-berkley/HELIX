
import React, { useState, useRef, useEffect } from 'react';
import { Icons, STATUS_COLORS, PRIORITY_COLORS } from '../constants';
import { Board, BoardView, Status, Priority } from '../types';

interface BoardHeaderProps {
  board: Board;
  activeView: BoardView;
  onViewChange: (view: BoardView) => void;
  onGenerateAI: (prompt: string, options?: { 
    deadline?: string; 
    teamSize?: string; 
    complexity?: any; 
    industry?: string;
    methodology?: any;
    primaryGoal?: any;
  }) => void;
  isGenerating: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: { status: Status[]; priority: Priority[] };
  onFiltersChange: (filters: { status: Status[]; priority: Priority[] }) => void;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({ 
  board, 
  activeView, 
  onViewChange, 
  onGenerateAI, 
  isGenerating,
  searchQuery,
  onSearchChange,
  activeFilters,
  onFiltersChange
}) => {
  const [prompt, setPrompt] = useState('');
  const [deadline, setDeadline] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [complexity, setComplexity] = useState('Medium');
  const [industry, setIndustry] = useState('');
  const [methodology, setMethodology] = useState('Agile');
  const [primaryGoal, setPrimaryGoal] = useState('Quality');
  
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  const filterMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const priorityMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (filterMenuRef.current && !filterMenuRef.current.contains(target)) {
        setShowFilterMenu(false);
      }
      if (statusMenuRef.current && !statusMenuRef.current.contains(target)) {
        setShowStatusMenu(false);
      }
      if (priorityMenuRef.current && !priorityMenuRef.current.contains(target)) {
        setShowPriorityMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmitAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerateAI(prompt, { 
        deadline, 
        teamSize, 
        complexity, 
        industry,
        methodology,
        primaryGoal
      });
      setPrompt('');
      setDeadline('');
      setTeamSize('');
      setComplexity('Medium');
      setIndustry('');
      setMethodology('Agile');
      setPrimaryGoal('Quality');
      setShowAIPrompt(false);
    }
  };

  const toggleFilter = (type: 'status' | 'priority', value: any) => {
    const current = [...activeFilters[type]];
    const index = current.indexOf(value);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    onFiltersChange({ ...activeFilters, [type]: current });
  };

  const clearFilters = () => {
    onFiltersChange({ status: [], priority: [] });
    onSearchChange('');
  };

  const hasActiveFilters = activeFilters.status.length > 0 || activeFilters.priority.length > 0 || searchQuery.length > 0;

  const views: { id: BoardView; icon: string; label: string }[] = [
    { id: 'Table', icon: '🏠', label: 'Main Table' },
    { id: 'Kanban', icon: '📋', label: 'Kanban' },
    { id: 'Timeline', icon: '📊', label: 'Timeline' },
    { id: 'Calendar', icon: '🗓️', label: 'Calendar' },
  ];

  return (
    <div className="bg-white border-b border-slate-200 p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            {board.name}
            <button className="ml-2 p-1 hover:bg-slate-100 rounded">
              <Icons.ChevronDown />
            </button>
          </h1>
          <p className="text-slate-500 text-sm">{board.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2 mr-4">
            {[1, 2, 3].map(i => (
              <img key={i} src={`https://picsum.photos/32/32?random=${i+10}`} className="w-8 h-8 rounded-full border-2 border-white" alt="Team" />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">+4</div>
          </div>
          <button className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-50 text-sm font-medium flex items-center transition-colors">
            Activity / 2
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium flex items-center transition-shadow shadow-sm">
            Invite / 1
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-6 border-b border-slate-100 pb-2">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`px-2 py-1 text-sm font-medium flex items-center transition-all border-b-2 ${
              activeView === view.id 
                ? 'text-blue-600 border-blue-600' 
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="mr-2 text-lg">{view.icon}</span> {view.label}
          </button>
        ))}
        <button className="text-slate-500 hover:text-slate-700 px-2 py-1 text-sm font-medium">
          <Icons.Plus />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              onClick={() => setShowAIPrompt(!showAIPrompt)}
              className={`px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-medium flex items-center shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 ${isGenerating ? 'animate-pulse' : ''}`}
              disabled={isGenerating}
            >
              <Icons.Sparkles />
              <span className="ml-2">{isGenerating ? 'AI Magic in progress...' : 'AI Assistant'}</span>
            </button>
            
            {showAIPrompt && (
              <div className="absolute top-full left-0 mt-2 w-[500px] bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <form onSubmit={handleSubmitAI} className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-slate-800 flex items-center">
                        <span className="mr-2">🎯</span> Project Objective
                      </label>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Required</span>
                    </div>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your goal, e.g. Launch a new SaaS product for small bakeries..."
                      className="w-full h-24 p-4 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner bg-slate-50/50"
                      autoFocus
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                        <span className="mr-1">🗓️</span> Deadline
                      </label>
                      <input 
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                        <span className="mr-1">🧠</span> Complexity
                      </label>
                      <select 
                        value={complexity}
                        onChange={(e) => setComplexity(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option>Simple</option>
                        <option>Medium</option>
                        <option>Complex</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                        <span className="mr-1">👥</span> Team
                      </label>
                      <input 
                        type="text"
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        placeholder="Size..."
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                        <span className="mr-1">🏢</span> Industry
                      </label>
                      <input 
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="Tech, HR..."
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                        <span className="mr-1">⚡</span> Flow
                      </label>
                      <select 
                        value={methodology}
                        onChange={(e) => setMethodology(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option>Agile</option>
                        <option>Waterfall</option>
                        <option>Kanban</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                        <span className="mr-1">🏆</span> Priority
                      </label>
                      <select 
                        value={primaryGoal}
                        onChange={(e) => setPrimaryGoal(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option>Quality</option>
                        <option>Speed</option>
                        <option>Efficiency</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setShowAIPrompt(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                    <button type="submit" className="px-8 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold transition-all transform active:scale-95 flex items-center">
                      <span className="mr-2">✨</span> Generate Board
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center border border-slate-200 rounded-md px-2 bg-white focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <Icons.Search />
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="border-none outline-none p-1.5 text-sm w-40 placeholder-slate-400" 
              />
              {searchQuery && (
                <button onClick={() => onSearchChange('')} className="text-slate-300 hover:text-slate-500 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              )}
            </div>

            <div className="relative" ref={statusMenuRef}>
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-md transition-all ${
                  activeFilters.status.length > 0
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' 
                  : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <span className="mr-1.5 text-lg">🎯</span>
                <span>Status</span>
                {activeFilters.status.length > 0 && (
                  <span className="ml-2 bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilters.status.length}
                  </span>
                )}
              </button>

              {showStatusMenu && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Filter by Status</h4>
                  <div className="space-y-1">
                    {Object.keys(STATUS_COLORS).map(s => (
                      <button
                        key={s}
                        onClick={() => toggleFilter('status', s)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          activeFilters.status.includes(s as Status)
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${STATUS_COLORS[s]}`}></div>
                          {s}
                        </div>
                        {activeFilters.status.includes(s as Status) && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                  {activeFilters.status.length > 0 && (
                    <button 
                      onClick={() => onFiltersChange({ ...activeFilters, status: [] })}
                      className="w-full mt-3 pt-3 border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                    >
                      Clear Status Filters
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="relative" ref={priorityMenuRef}>
              <button 
                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-md transition-all ${
                  activeFilters.priority.length > 0
                  ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                  : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <span className="mr-1.5 text-lg">⚡</span>
                <span>Priority</span>
                {activeFilters.priority.length > 0 && (
                  <span className="ml-2 bg-orange-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilters.priority.length}
                  </span>
                )}
              </button>

              {showPriorityMenu && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Filter by Priority</h4>
                  <div className="space-y-1">
                    {Object.keys(PRIORITY_COLORS).map(p => (
                      <button
                        key={p}
                        onClick={() => toggleFilter('priority', p)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          activeFilters.priority.includes(p as Priority)
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${PRIORITY_COLORS[p]}`}></div>
                          {p}
                        </div>
                        {activeFilters.priority.includes(p as Priority) && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                  {activeFilters.priority.length > 0 && (
                    <button 
                      onClick={() => onFiltersChange({ ...activeFilters, priority: [] })}
                      className="w-full mt-3 pt-3 border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-orange-600 transition-colors"
                    >
                      Clear Priority Filters
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="relative" ref={filterMenuRef}>
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-md transition-all ${
                  hasActiveFilters 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                  : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icons.Filter /> 
                <span className="ml-1.5">Combined</span>
                {(activeFilters.status.length + activeFilters.priority.length) > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilters.status.length + activeFilters.priority.length}
                  </span>
                )}
              </button>

              {showFilterMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Filters</h4>
                    <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">Clear all</button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-2 block">Status</label>
                      <div className="flex flex-wrap gap-1">
                        {Object.keys(STATUS_COLORS).map(s => (
                          <button
                            key={s}
                            onClick={() => toggleFilter('status', s)}
                            className={`text-[10px] px-2 py-1 rounded transition-all border ${
                              activeFilters.status.includes(s as Status)
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-2 block">Priority</label>
                      <div className="flex flex-wrap gap-1">
                        {Object.keys(PRIORITY_COLORS).map(p => (
                          <button
                            key={p}
                            onClick={() => toggleFilter('priority', p)}
                            className={`text-[10px] px-2 py-1 rounded transition-all border ${
                              activeFilters.priority.includes(p as Priority)
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardHeader;
