
import React from 'react';
// Correctly split imports: Group from types, STATUS_COLORS from constants
import { Group } from '../types';
import { STATUS_COLORS } from '../constants';

interface CalendarViewProps {
  groups: Group[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ groups }) => {
  const allItems = groups.flatMap(g => g.items.filter(item => item.dueDate).map(item => ({ ...item, groupColor: g.color })));
  
  // Basic mock current month grid
  const days = Array.from({ length: 35 }, (_, i) => i - 3); // some padding for previous month

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="p-4 text-center font-bold text-slate-500 text-sm bg-slate-50">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {days.map((dayNum, i) => {
            const dateStr = `2025-02-${String(dayNum).padStart(2, '0')}`;
            const dayItems = allItems.filter(item => item.dueDate === dateStr);
            const isToday = dayNum === 15; // mock "today"

            return (
              <div key={i} className={`min-h-[140px] p-2 space-y-1 ${dayNum <= 0 || dayNum > 28 ? 'bg-slate-50/50 text-slate-300' : 'text-slate-700'}`}>
                <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : ''}`}>
                        {dayNum > 0 && dayNum <= 28 ? dayNum : ''}
                    </span>
                </div>
                {dayItems.map(item => (
                    <div key={item.id} className={`text-[10px] p-1.5 rounded-md text-white font-bold shadow-sm flex items-center space-x-1 ${STATUS_COLORS[item.status]}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></div>
                        <span className="truncate">{item.name}</span>
                    </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
