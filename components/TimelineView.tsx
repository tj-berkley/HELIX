
import React from 'react';
// Correctly split imports: Group from types, STATUS_COLORS from constants
import { Group } from '../types';
import { STATUS_COLORS } from '../constants';

interface TimelineViewProps {
  groups: Group[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ groups }) => {
  const allItems = groups.flatMap(g => g.items.map(item => ({ ...item, groupName: g.name, groupColor: g.color })));

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="min-w-[1200px]">
        {/* Simple Monthly Header for mock scale */}
        <div className="flex border-b border-slate-200 sticky top-0 bg-slate-50 z-10">
          <div className="w-64 p-4 font-bold text-slate-500 border-r border-slate-200">Tasks</div>
          <div className="flex-1 flex">
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
              <div key={month} className="flex-1 p-4 text-center text-xs font-bold text-slate-400 border-r border-slate-100 last:border-r-0">
                {month}
              </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {allItems.map(item => {
            // Very basic mock positioning for visualization
            const startMonth = item.dueDate ? new Date(item.dueDate).getMonth() : Math.floor(Math.random() * 11);
            const duration = 1; 

            return (
              <div key={item.id} className="flex hover:bg-slate-50 group">
                <div className="w-64 p-4 border-r border-slate-200 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.groupColor }}></div>
                  <span className="text-sm font-medium text-slate-700 truncate">{item.name}</span>
                </div>
                <div className="flex-1 flex relative h-14 items-center px-4">
                    <div 
                        className={`absolute h-8 rounded-full shadow-sm flex items-center justify-center text-[10px] font-bold text-white transition-all group-hover:shadow-md ${STATUS_COLORS[item.status]}`}
                        style={{ 
                            left: `${(startMonth / 12) * 100}%`, 
                            width: `${(duration / 12) * 100}%`,
                            minWidth: '80px'
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
        <div className="p-20 text-center text-slate-400 italic">No tasks with dates to display.</div>
      )}
    </div>
  );
};

export default TimelineView;
