
import React, { useState } from 'react';
import { Board, Status } from '../types';
import { Icons } from '../constants';

interface ProjectPortfolioProps {
  boards: Board[];
  onSelectProject: (boardId: string) => void;
}

const ProjectPortfolio: React.FC<ProjectPortfolioProps> = ({ boards, onSelectProject }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getProjectStats = (board: Board) => {
    const allItems = board.groups.flatMap(g => g.items);
    const completed = allItems.filter(i => i.status === 'Done').length;
    const total = allItems.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    
    // Simple heuristic for health
    let health: Status = 'On Track';
    const stuck = allItems.filter(i => i.status === 'Stuck').length;
    const critical = allItems.filter(i => i.status === 'Critical' || i.priority === 'Critical').length;
    
    if (stuck > 0 || critical > 1) health = 'At Risk';
    if (stuck > 2 || critical > 3) health = 'Off Track';

    return { progress, total, completed, health };
  };

  const healthColors: Record<string, string> = {
    'On Track': 'text-emerald-500 bg-emerald-50 border-emerald-100',
    'At Risk': 'text-amber-500 bg-amber-50 border-amber-100',
    'Off Track': 'text-rose-500 bg-rose-50 border-rose-100',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Project Portfolio</h2>
            <p className="text-slate-500 font-medium text-lg">Central dashboard for all active mission streams.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
            <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all flex items-center active:scale-95">
              <Icons.Plus /> <span className="ml-2 uppercase tracking-widest text-xs">Create Project</span>
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boards.map(board => {
              const stats = getProjectStats(board);
              return (
                <div 
                  key={board.id} 
                  onClick={() => onSelectProject(board.id)}
                  className="bg-white rounded-[3rem] border-2 border-transparent shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all p-10 cursor-pointer group flex flex-col space-y-8"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">
                      🚀
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${healthColors[stats.health]}`}>
                      {stats.health}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{board.name}</h3>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {board.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                       <span className="text-sm font-black text-slate-900">{Math.round(stats.progress)}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                       <div className="h-full bg-indigo-600 transition-all duration-1000 ease-out" style={{ width: `${stats.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                       <span>{stats.completed} Tasks Done</span>
                       <span>{stats.total - stats.completed} Remaining</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <img key={i} src={`https://picsum.photos/32/32?random=${i + board.id.length}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="Team" />
                      ))}
                    </div>
                    <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                      View Board <span className="ml-2">→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project Name</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Progress</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Team</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {boards.map(board => {
                  const stats = getProjectStats(board);
                  return (
                    <tr 
                      key={board.id} 
                      onClick={() => onSelectProject(board.id)}
                      className="hover:bg-indigo-50/20 transition-colors cursor-pointer group"
                    >
                      <td className="p-8">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl">🚀</div>
                          <div>
                            <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{board.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Mission Active</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${healthColors[stats.health]}`}>
                          {stats.health}
                        </span>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center space-x-4">
                           <div className="flex-1 h-2 w-32 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-indigo-600" style={{ width: `${stats.progress}%` }}></div>
                           </div>
                           <span className="text-xs font-black text-slate-600">{Math.round(stats.progress)}%</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex -space-x-2">
                           {[1, 2, 3].map(i => (
                             <img key={i} src={`https://picsum.photos/28/28?random=${i + board.id.length}`} className="w-7 h-7 rounded-full border-2 border-white" alt="Team" />
                           ))}
                        </div>
                      </td>
                      <td className="p-8 text-right font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Engineering
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPortfolio;
