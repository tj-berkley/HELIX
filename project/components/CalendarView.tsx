
import React from 'react';
import { Group } from '../types';
import { STATUS_COLORS } from '../constants';

interface CalendarViewProps {
  groups: Group[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ groups }) => {
  const allItems = groups.flatMap(g => g.items.filter(item => item.dueDate).map(item => ({ ...item, groupColor: g.color })));
  
  const days = Array.from({ length: 35 }, (_, i) => i - 3);

  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0c0e12] p-8 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden transition-colors duration-300">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-white/5">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="p-6 text-center font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-white/5">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-white/5">
          {days.map((dayNum, i) => {
            const dateStr = `2025-02-${String(dayNum).padStart(2, '0')}`;
            const dayItems = allItems.filter(item => item.dueDate === dateStr);
            const isToday = dayNum === 15;

            return (
              <div key={i} className={`min-h-[160px] p-4 space-y-2 transition-colors ${dayNum <= 0 || dayNum > 28 ? 'bg-slate-50/30 dark:bg-black/20 text-slate-300 dark:text-slate-700' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                <div className="flex justify-between items-center mb-4">
                    <span className={`text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 dark:text-slate-600'}`}>
                        {dayNum > 0 && dayNum <= 28 ? dayNum : ''}
                    </span>
                    {dayNum > 0 && dayNum <= 28 && <button className="opacity-0 group-hover:opacity-100 text-indigo-500 text-xl font-black">+</button>}
                </div>
                <div className="space-y-1.5">
                  {dayItems.map(item => (
                      <div key={item.id} className={`text-[9px] p-2 rounded-xl text-white font-black uppercase tracking-widest shadow-sm flex items-center space-x-2 transition-all transform hover:scale-[1.02] ${STATUS_COLORS[item.status]}`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0 animate-pulse"></div>
                          <span className="truncate">{item.name}</span>
                      </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
