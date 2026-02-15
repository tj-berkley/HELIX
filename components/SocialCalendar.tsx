
import React, { useState } from 'react';
import { Icons } from '../constants';
import { SocialPost } from '../types';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸', color: 'bg-pink-500' },
  { id: 'linkedin', label: 'LinkedIn', icon: '👔', color: 'bg-blue-700' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: 'bg-black' },
  { id: 'x', label: 'X.com', icon: '✖️', color: 'bg-slate-900' },
  { id: 'facebook', label: 'Facebook', icon: '📘', color: 'bg-blue-600' },
];

const MOCK_POSTS: SocialPost[] = [
  {
    id: 'p1',
    title: 'Product Launch Reveal',
    content: 'The future of productivity is here. #OmniPortal',
    mediaUrl: 'https://picsum.photos/400/400?random=1',
    mediaType: 'image',
    scheduledTime: '2025-02-20 10:00',
    platforms: ['instagram', 'x'],
    status: 'Scheduled'
  },
  {
    id: 'p2',
    title: 'AI Workflow Tutorial',
    content: 'Learn how to automate your creative process with Hobbs AI.',
    mediaUrl: 'https://picsum.photos/400/400?random=2',
    mediaType: 'video',
    scheduledTime: '2025-02-22 14:30',
    platforms: ['linkedin', 'youtube'],
    status: 'Scheduled'
  }
];

const SocialCalendar: React.FC = () => {
  const [posts, setPosts] = useState<SocialPost[]>(MOCK_POSTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate] = useState(new Date(2025, 1, 15)); // Mocked current view to Feb 2025

  // Generate calendar grid for Feb 2025
  const daysInMonth = 28;
  const startDay = 6; // Saturday
  const grid = Array.from({ length: 35 }, (_, i) => {
    const dayNum = i - startDay + 1;
    return dayNum > 0 && dayNum <= daysInMonth ? dayNum : null;
  });

  const getPostsForDay = (day: number) => {
    const dateStr = `2025-02-${String(day).padStart(2, '0')}`;
    return posts.filter(p => p.scheduledTime.startsWith(dateStr));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-white">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight">Social Content Calendar</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Omnichannel Campaign Orchestration</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-2 bg-slate-900 border border-white/5 px-4 py-2 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-indigo-400">February 2025</span>
              <div className="flex space-x-1">
                <button className="p-1 hover:bg-white/5 rounded">◀</button>
                <button className="p-1 hover:bg-white/5 rounded">▶</button>
              </div>
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all flex items-center active:scale-95"
           >
             <Icons.Plus /> <span className="ml-2 uppercase tracking-widest text-xs">Create Post</span>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pattern-grid-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-7 gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500 pb-2">{d}</div>
            ))}
            
            {grid.map((day, i) => (
              <div 
                key={i} 
                className={`min-h-[160px] rounded-3xl border-2 transition-all p-3 flex flex-col space-y-2 ${day ? 'bg-slate-900/40 border-white/5 hover:border-indigo-500/30' : 'opacity-10 border-transparent'}`}
              >
                {day && (
                  <>
                    <div className="flex justify-between items-start">
                       <span className={`text-xs font-black p-1.5 rounded-lg ${day === 15 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{day}</span>
                       <button className="p-1 text-slate-700 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">+</button>
                    </div>
                    
                    <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
                      {getPostsForDay(day).map(post => (
                        <div key={post.id} className="bg-slate-800/80 border border-white/10 rounded-2xl p-2 cursor-pointer hover:bg-slate-800 group relative">
                           <div className="aspect-square w-full rounded-xl overflow-hidden mb-2 relative">
                              <img src={post.mediaUrl} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" alt="thumb" />
                              {post.mediaType === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="text-xs">▶</span></div>}
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[8px] font-black text-slate-400 truncate w-16">{post.title}</span>
                              <div className="flex -space-x-1">
                                 {post.platforms.map(p => (
                                   <div key={p} className={`w-3.5 h-3.5 rounded-full border border-slate-900 flex items-center justify-center text-[6px] ${PLATFORMS.find(pl => pl.id === p)?.color}`}>
                                      {PLATFORMS.find(pl => pl.id === p)?.icon}
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scheduler Modal Mock */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-xl h-full rounded-[3rem] shadow-2xl border border-white/10 flex flex-col animate-in slide-in-from-right-10 duration-500">
             <div className="p-10 border-b border-white/5 flex justify-between items-center">
                <div>
                   <h3 className="text-2xl font-black tracking-tight">Schedule New Asset</h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Cross-Platform Distribution</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-10 space-y-10">
                <section className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">1. Select Target Platforms</h4>
                   <div className="grid grid-cols-5 gap-3">
                      {PLATFORMS.map(p => (
                        <button key={p.id} className="flex flex-col items-center p-4 bg-slate-950 border border-white/5 rounded-2xl hover:border-indigo-500 transition-all group">
                           <span className="text-2xl group-hover:scale-125 transition-transform">{p.icon}</span>
                           <span className="text-[8px] font-black mt-2 text-slate-500 uppercase">{p.label}</span>
                        </button>
                      ))}
                   </div>
                </section>

                <section className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">2. Narrative & Caption</h4>
                   <textarea 
                     className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-sm font-medium h-32 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                     placeholder="Write the post caption. AI will automatically adapt hashtags for each platform..."
                   />
                </section>

                <section className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">3. Pick Your Master Asset</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="aspect-video bg-indigo-600/10 border-2 border-dashed border-indigo-500/30 rounded-3xl flex flex-col items-center justify-center space-y-2 cursor-pointer hover:bg-indigo-600/20 transition-all">
                         <span className="text-3xl">🎞️</span>
                         <span className="text-[10px] font-black uppercase text-indigo-400">Movie Studio Library</span>
                      </div>
                      <div className="aspect-video bg-purple-600/10 border-2 border-dashed border-purple-500/30 rounded-3xl flex flex-col items-center justify-center space-y-2 cursor-pointer hover:bg-purple-600/20 transition-all">
                         <span className="text-3xl">🎨</span>
                         <span className="text-[10px] font-black uppercase text-purple-400">Canvas Exports</span>
                      </div>
                   </div>
                </section>

                <section className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">4. Release Timing</h4>
                   <div className="flex space-x-4">
                      <input type="date" className="flex-1 bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                      <input type="time" className="flex-1 bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                   </div>
                   <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl flex justify-between items-center">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">AI Prime Time Prediction</span>
                      <span className="text-[10px] font-mono text-emerald-600">Suggests: Feb 20, 10:15 AM</span>
                   </div>
                </section>
             </div>

             <div className="p-10 bg-black/40 border-t border-white/5 shrink-0 flex space-x-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-700 transition-all">Cancel</button>
                <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all active:scale-95">Commit to Queue</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialCalendar;
