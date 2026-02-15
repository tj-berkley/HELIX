
import React from 'react';
import { Icons } from '../constants';
import { OwnerInfo, BusinessInfo, Board } from '../types';

interface DashboardProps {
  ownerInfo: OwnerInfo;
  businessInfo: BusinessInfo;
  boards: Board[];
  onSelectPage: (page: any) => void;
  onSelectBoard: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ ownerInfo, businessInfo, boards, onSelectPage, onSelectBoard }) => {
  const recentBoards = boards.slice(0, 3);
  
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0c0e12] p-12 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Welcome Section */}
        <div className="flex justify-between items-end bg-white dark:bg-slate-900/50 rounded-[3.5rem] p-16 shadow-2xl relative overflow-hidden border border-slate-100 dark:border-white/5 group">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-1000"></div>
          <div className="space-y-6 relative z-10 max-w-2xl">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-full border border-indigo-100 dark:border-indigo-500/20 mb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse mr-2"></span>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Neural Link v4.5 Ready</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
              Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{ownerInfo.name.split(' ')[0]}</span>.
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
              "Your autonomous workspace is synchronized and operating at peak performance."
            </p>
            <div className="flex space-x-4 pt-4">
              <button 
                onClick={() => onSelectPage('board')}
                className="px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black dark:hover:bg-slate-200 transition-all transform active:scale-95"
              >
                Go to Boards
              </button>
              <button 
                onClick={() => onSelectPage('movie-studio')}
                className="px-8 py-4 bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-sm"
              >
                New Production
              </button>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-10 relative z-10">
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Efficiency</p>
                <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">98%</p>
             </div>
             <div className="w-px h-16 bg-slate-100 dark:bg-white/10"></div>
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Active Tasks</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">24</p>
             </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-8">
           {/* Left Column: Recent Projects & Quick Launch */}
           <div className="col-span-12 lg:col-span-8 space-y-8">
              <div className="bg-white dark:bg-slate-900/40 rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-white/5 space-y-8">
                 <div className="flex justify-between items-center px-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recent Mission Streams</h3>
                    <button onClick={() => onSelectPage('portfolio')} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">View Portfolio →</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentBoards.map(board => (
                       <div key={board.id} onClick={() => onSelectBoard(board.id)} className="p-8 bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-[2.5rem] border-2 border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all group cursor-pointer shadow-inner hover:shadow-xl">
                          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-6 group-hover:scale-110 transition-transform">🚀</div>
                          <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1 truncate">{board.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed mb-6">{board.description}</p>
                          <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500 w-2/3"></div>
                          </div>
                       </div>
                    ))}
                    <button className="p-8 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center space-y-4 text-slate-400 dark:text-slate-600 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/20 dark:hover:bg-indigo-500/5 transition-all group">
                       <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all shadow-md">
                          <span className="text-2xl font-black">+</span>
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-widest">Synthesize New Board</span>
                    </button>
                 </div>
              </div>

              <div className="bg-slate-900 dark:bg-slate-800/50 rounded-[3rem] p-10 shadow-2xl text-white space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 opacity-5">
                    <span className="text-[120px]">⚡</span>
                 </div>
                 <div className="relative z-10 px-2">
                    <h3 className="text-xl font-black tracking-tight">Neural Accelerator</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">Instant production triggers.</p>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                    {[
                       { id: 'blog', label: 'Write Post', icon: '✍️' },
                       { id: 'video-maker', label: 'Gen Video', icon: '📹' },
                       { id: 'connections', label: 'Active Link', icon: '📞' },
                       { id: 'tasks', label: 'Focus Mode', icon: '✅' }
                    ].map(action => (
                       <button 
                        key={action.id} 
                        onClick={() => onSelectPage(action.id as any)}
                        className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all flex flex-col items-center space-y-3 group/act"
                       >
                          <span className="text-3xl group-hover/act:scale-125 transition-transform duration-500">{action.icon}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover/act:text-white">{action.label}</span>
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right Column: Signal Pulse & Roadmap */}
           <div className="col-span-12 lg:col-span-4 space-y-8">
              <div className="bg-white dark:bg-slate-900/40 rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-white/5 space-y-8 h-full flex flex-col">
                 <div className="flex justify-between items-center px-2 shrink-0">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Neural Pulse</h3>
                    <span className="text-[10px] font-black bg-rose-50 dark:bg-rose-950/30 text-rose-500 px-3 py-1 rounded-full uppercase border border-rose-100 dark:border-rose-500/20">Live</span>
                 </div>
                 
                 <div className="space-y-6 flex-1">
                    {[
                       { title: 'Project Alpha Completed', meta: 'Automation Sync Success', icon: '✅', color: 'bg-emerald-500', time: '2m ago' },
                       { title: 'New Signal via WhatsApp', meta: 'Investor Group #Q3', icon: '💬', color: 'bg-indigo-600', time: '14m ago' },
                       { title: 'Render Finished', meta: 'Cinematic Masterpiece #4', icon: '🎞️', color: 'bg-purple-600', time: '1h ago' },
                       { title: 'Task Blocked: UI Refactor', meta: 'Senior Engineer', icon: '⚠️', color: 'bg-amber-400', time: '3h ago' }
                    ].map((signal, idx) => (
                       <div key={idx} className="flex items-start space-x-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/signal cursor-pointer">
                          <div className={`w-12 h-12 rounded-2xl ${signal.color} flex items-center justify-center text-white text-xl shadow-lg shrink-0 group-hover/signal:rotate-6 transition-transform`}>
                             {signal.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-center mb-0.5">
                                <h4 className="font-black text-slate-900 dark:text-white text-sm truncate">{signal.title}</h4>
                                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">{signal.time}</span>
                             </div>
                             <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight truncate">{signal.meta}</p>
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="pt-8 border-t border-slate-50 dark:border-white/5 mt-auto">
                    <button onClick={() => onSelectPage('connections')} className="w-full py-5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-all">Clear Signals</button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;