
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

  const handleSubmitAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerateAI(prompt, { deadline, teamSize, complexity, industry, methodology, primaryGoal });
      setPrompt('');
      setShowAIPrompt(false);
    }
  };

  const views: { id: BoardView; icon: string; label: string }[] = [
    { id: 'Table', icon: '🏠', label: 'Main Table' },
    { id: 'Kanban', icon: '📋', label: 'Kanban' },
    { id: 'Timeline', icon: '📊', label: 'Timeline' },
    { id: 'Calendar', icon: '🗓️', label: 'Calendar' },
  ];

  return (
    <div className="bg-white px-8 pt-8 pb-4 shrink-0 z-30">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">{board.name}</h1>
             <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"><Icons.ChevronDown /></button>
          </div>
          <p className="text-slate-400 text-sm font-medium">{board.description}</p>
        </div>
        <div className="flex items-center space-x-3">
           <div className="flex -space-x-3 hover:-space-x-1 transition-all mr-4 cursor-pointer">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://picsum.photos/32/32?random=${i+20}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100" alt="Team" />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">+8</div>
           </div>
           <button className="h-10 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-black uppercase tracking-widest transition-all">Activities</button>
           <button className="h-10 px-6 bg-slate-900 text-white rounded-xl hover:bg-black text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95">Invite Team</button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center space-x-2">
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`px-4 py-3 text-xs font-black uppercase tracking-[0.15em] flex items-center transition-all border-b-2 ${
                activeView === view.id 
                  ? 'text-indigo-600 border-indigo-600' 
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              <span className="mr-2 opacity-60">{view.icon}</span> {view.label}
            </button>
          ))}
          <button className="p-3 text-slate-300 hover:text-indigo-500 transition-colors"><Icons.Plus /></button>
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
          
          <div className="h-4 w-px bg-slate-200 mx-1"></div>

          <div className="relative group">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Icons.Search />
             </div>
             <input 
               type="text" 
               placeholder="Search items..." 
               value={searchQuery}
               onChange={(e) => onSearchChange(e.target.value)}
               className="bg-slate-50 border-none rounded-xl py-1.5 pl-10 pr-4 text-xs text-slate-700 outline-none w-48 focus:w-64 focus:ring-2 focus:ring-indigo-100 transition-all"
             />
          </div>
        </div>
      </div>

      {showAIPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                       <Icons.Sparkles />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900">Neural Board Architect</h3>
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Precision Project Engineering</p>
                    </div>
                 </div>
                 <button onClick={() => setShowAIPrompt(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <form onSubmit={handleSubmitAI} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Project Brief</label>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. Build a 12-week go-to-market strategy for a high-end coffee brand..."
                      className="w-full h-24 p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-[1.8rem] outline-none transition-all text-sm font-medium resize-none shadow-inner"
                      autoFocus
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Industry / Domain</label>
                       <input 
                         type="text" 
                         placeholder="e.g. Fintech, Healthcare..." 
                         className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-black uppercase outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner" 
                         value={industry} 
                         onChange={e => setIndustry(e.target.value)} 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Methodology</label>
                       <select className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-black uppercase outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner" value={methodology} onChange={e => setMethodology(e.target.value)}>
                          <option>Agile</option>
                          <option>Waterfall</option>
                          <option>Kanban</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Complexity Level</label>
                       <select className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-black uppercase outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner" value={complexity} onChange={e => setComplexity(e.target.value)}>
                          <option>Simple</option>
                          <option>Medium</option>
                          <option>Complex</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Primary Goal</label>
                       <select className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-black uppercase outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner" value={primaryGoal} onChange={e => setPrimaryGoal(e.target.value)}>
                          <option>Speed</option>
                          <option>Quality</option>
                          <option>Cost-Efficiency</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Team Size</label>
                       <input 
                         type="number" 
                         placeholder="Number of members" 
                         className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-black uppercase outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner" 
                         value={teamSize} 
                         onChange={e => setTeamSize(e.target.value)} 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Deadline</label>
                       <input type="date" className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-black uppercase outline-none border-2 border-transparent focus:border-indigo-500 shadow-inner" value={deadline} onChange={e => setDeadline(e.target.value)} />
                    </div>
                 </div>

                 <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all transform active:scale-95 mt-4">Synthesize Optimized Board</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BoardHeader;
