
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

const STATUS_OPTIONS: Status[] = ['Not Started', 'Working on it', 'Stuck', 'Done', 'Critical'];

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
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmitAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerateAI(prompt, { deadline, teamSize, complexity, industry, methodology, primaryGoal });
      setPrompt('');
      setShowAIPrompt(false);
    }
  };

  const toggleStatusFilter = (status: Status) => {
    const current = activeFilters.status;
    const next = current.includes(status) 
      ? current.filter(s => s !== status) 
      : [...current, status];
    onFiltersChange({ ...activeFilters, status: next });
  };

  const clearFilters = () => {
    onFiltersChange({ ...activeFilters, status: [] });
  };

  const views: { id: BoardView; icon: string; label: string }[] = [
    { id: 'Table', icon: '🏠', label: 'Main Table' },
    { id: 'Kanban', icon: '📋', label: 'Kanban' },
    { id: 'Timeline', icon: '📊', label: 'Timeline' },
    { id: 'Calendar', icon: '🗓️', label: 'Calendar' },
  ];

  return (
    <div className="bg-white dark:bg-[#0c0e12] px-8 pt-8 pb-4 shrink-0 z-30 transition-colors">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
             <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{board.name}</h1>
             <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-400"><Icons.ChevronDown /></button>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">{board.description}</p>
        </div>
        <div className="flex items-center space-x-3">
           <div className="flex -space-x-3 hover:-space-x-1 transition-all mr-4 cursor-pointer">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://picsum.photos/32/32?random=${i+20}`} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700" alt="Team" />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">+8</div>
           </div>
           <button className="h-10 px-4 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all dark:text-slate-300">Activities</button>
           <button className="h-10 px-6 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl hover:bg-black dark:hover:bg-slate-200 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 dark:shadow-none transition-all active:scale-95">Invite Team</button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center space-x-2">
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`px-4 py-3 text-xs font-black uppercase tracking-[0.15em] flex items-center transition-all border-b-2 ${
                activeView === view.id 
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400' 
                  : 'text-slate-400 dark:text-slate-600 border-transparent hover:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
              <span className="mr-2 opacity-60">{view.icon}</span> {view.label}
            </button>
          ))}
          <button className="p-3 text-slate-300 dark:text-slate-700 hover:text-indigo-500 transition-colors"><Icons.Plus /></button>
        </div>

        <div className="flex items-center space-x-4 mb-2">
          <button 
            onClick={() => setShowAIPrompt(!showAIPrompt)}
            className={`h-9 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg hover:shadow-indigo-200 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 ${isGenerating ? 'animate-pulse' : ''}`}
            disabled={isGenerating}
          >
            <Icons.Sparkles />
            <span className="ml-2">{isGenerating ? 'AI Processing...' : 'AI Assistant'}</span>
          </button>
          
          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

          <div className="flex items-center space-x-2 relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center transition-all border ${
                activeFilters.status.length > 0 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400' 
                  : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <Icons.Filter />
              <span className="ml-2">Filter</span>
              {activeFilters.status.length > 0 && (
                <span className="ml-2 w-4 h-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center text-[8px]">
                  {activeFilters.status.length}
                </span>
              )}
            </button>

            {showFilterDropdown && (
              <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[50] py-4 animate-in slide-in-from-top-2 duration-200">
                <div className="px-5 pb-3 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Filter by Status</span>
                  {activeFilters.status.length > 0 && (
                    <button onClick={clearFilters} className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase hover:underline">Clear</button>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  {STATUS_OPTIONS.map(status => (
                    <button
                      key={status}
                      onClick={() => toggleStatusFilter(status)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]}`}></div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{status}</span>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        activeFilters.status.includes(status) 
                          ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500' 
                          : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 group-hover:border-indigo-300 dark:group-hover:border-indigo-500'
                      }`}>
                        {activeFilters.status.includes(status) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative group">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Icons.Search />
             </div>
             <input 
               type="text" 
               placeholder="Search items..." 
               value={searchQuery}
               onChange={(e) => onSearchChange(e.target.value)}
               className="bg-slate-50 dark:bg-white/5 dark:text-white border-none rounded-xl py-1.5 pl-10 pr-4 text-xs text-slate-700 outline-none w-48 focus:w-64 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 transition-all"
             />
          </div>
        </div>
      </div>

      {showAIPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-950/20">
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                       <Icons.Sparkles />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white">Neural Board Architect</h3>
                       <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Precision Project Engineering</p>
                    </div>
                 </div>
                 <button onClick={() => setShowAIPrompt(false)} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <form onSubmit={handleSubmitAI} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Project Brief</label>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. Build a 12-week go-to-market strategy for a high-end coffee brand..."
                      className="w-full h-24 p-6 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-[1.8rem] outline-none transition-all text-sm font-medium dark:text-white resize-none shadow-inner dark:placeholder-slate-700"
                      autoFocus
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Industry / Domain</label>
                       <input 
                         type="text" 
                         placeholder="e.g. Fintech, Healthcare..." 
                         className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-xs font-black uppercase outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner dark:text-white dark:placeholder-slate-700" 
                         value={industry} 
                         onChange={e => setIndustry(e.target.value)} 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Methodology</label>
                       <select className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-xs font-black uppercase outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner dark:text-white appearance-none" value={methodology} onChange={e => setMethodology(e.target.value)}>
                          <option>Agile</option>
                          <option>Waterfall</option>
                          <option>Kanban</option>
                       </select>
                    </div>
                 </div>

                 <button type="submit" className="w-full py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black dark:hover:bg-indigo-700 transition-all transform active:scale-95 mt-4">Synthesize Optimized Board</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BoardHeader;