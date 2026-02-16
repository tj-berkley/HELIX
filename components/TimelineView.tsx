
import React from 'react';
import { Group } from '../types';
import { STATUS_COLORS } from '../constants';

interface TimelineViewProps {
  groups: Group[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ groups }) => {
  const allItems = groups.flatMap(g => g.items.map(item => ({ ...item, groupName: g.name, groupColor: g.color })));

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-[#0c0e12] transition-colors duration-300">
      <div className="min-w-[1400px]">
        {/* Simple Monthly Header for mock scale */}
        <div className="flex border-b border-slate-200 dark:border-white/5 sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 transition-colors duration-300">
          <div className="w-80 p-5 font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-white/5">Mission Objective</div>
          <div className="flex-1 flex">
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
              <div key={month} className="flex-1 p-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 border-r border-slate-100 dark:border-white/5 last:border-r-0">
                {month}
              </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {allItems.map(item => {
            const startMonth = item.dueDate ? new Date(item.dueDate).getMonth() : Math.floor(Math.random() * 11);
            const duration = 1.2; 

            return (
              <div key={item.id} className="flex hover:bg-slate-50 dark:hover:bg-white/5 group transition-colors">
                <div className="w-80 p-5 border-r border-slate-200 dark:border-white/5 flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.groupColor }}></div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate tracking-tight">{item.name}</span>
                </div>
                <div className="flex-1 flex relative h-16 items-center px-4">
                    <div 
                        className={`absolute h-9 rounded-full shadow-lg flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-white transition-all transform hover:scale-[1.02] active:scale-95 group-hover:shadow-xl ${STATUS_COLORS[item.status]}`}
                        style={{ 
                            left: `${(startMonth / 12) * 100}%`, 
                            width: `${(duration / 12) * 100}%`,
                            minWidth: '100px'
                        }}
                    >
                        {item.status}
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {allItems.length === 0 && (
        <div className="p-40 text-center space-y-4 opacity-20">
           <span className="text-6xl">📊</span>
           <p className="text-xl font-black uppercase tracking-[0.4em] text-slate-400">Timeline Sector Vacuum</p>
        </div>
      )}
    </div>
  );
};

export default TimelineView;
