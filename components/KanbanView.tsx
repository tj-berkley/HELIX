
import React from 'react';
import { Group, Status } from '../types';
import { Icons, PRIORITY_COLORS, STATUS_COLORS } from '../constants';

const COLUMNS: Status[] = ['Not Started', 'Working on it', 'Stuck', 'Critical', 'Done'];

interface KanbanViewProps {
  groups: Group[];
}

const KanbanView: React.FC<KanbanViewProps> = ({ groups }) => {
  const allItems = groups.flatMap(g => g.items.map(item => ({ ...item, groupColor: g.color })));

  return (
    <div className="flex-1 overflow-x-auto p-8 bg-slate-50 dark:bg-[#0c0e12] flex space-x-6 transition-colors duration-300">
      {COLUMNS.map(status => {
        const columnItems = allItems.filter(item => item.status === status);
        const statusColor = STATUS_COLORS[status] || 'bg-slate-400';

        return (
          <div key={status} className="flex-shrink-0 w-80 flex flex-col space-y-4">
            <div className={`p-4 rounded-2xl border-b-4 ${statusColor} bg-white dark:bg-slate-900 shadow-sm flex justify-between items-center transition-colors duration-300 border-x border-t border-slate-100 dark:border-white/5`}>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-[10px] uppercase tracking-[0.2em]">{status}</h3>
              <span className="text-[10px] bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full font-black text-slate-500 dark:text-slate-400">{columnItems.length}</span>
            </div>
            
            <div className="flex-1 space-y-4 pb-10">
              {columnItems.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 shadow-sm border border-slate-200 dark:border-white/5 hover:shadow-xl dark:hover:shadow-indigo-500/5 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: item.groupColor }}></div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4 leading-snug tracking-tight">{item.name}</h4>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-3">
                        <img src={`https://picsum.photos/32/32?random=${item.id}`} className="w-7 h-7 rounded-full border border-white dark:border-slate-800 shadow-sm" alt="Owner" />
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white ${PRIORITY_COLORS[item.priority]}`}>
                            {item.priority}
                        </span>
                    </div>
                    {item.dueDate && (
                        <div className="flex items-center text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                           🗓️ {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                    )}
                  </div>
                </div>
              ))}
              <button className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-white/5 transition-all flex items-center justify-center group">
                <Icons.Plus className="group-hover:scale-125 transition-transform" /> <span className="ml-2">Add task</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanView;
