
import React from 'react';
// Correctly split imports: Group and Status from types, while Icons and colors come from constants
import { Group, Status } from '../types';
import { Icons, PRIORITY_COLORS, STATUS_COLORS } from '../constants';

const COLUMNS: Status[] = ['Not Started', 'Working on it', 'Stuck', 'Critical', 'Done'];

interface KanbanViewProps {
  groups: Group[];
}

const KanbanView: React.FC<KanbanViewProps> = ({ groups }) => {
  const allItems = groups.flatMap(g => g.items.map(item => ({ ...item, groupColor: g.color })));

  return (
    <div className="flex-1 overflow-x-auto p-6 bg-slate-50 flex space-x-4">
      {COLUMNS.map(status => {
        const columnItems = allItems.filter(item => item.status === status);
        const statusColor = STATUS_COLORS[status] || 'bg-slate-400';

        return (
          <div key={status} className="flex-shrink-0 w-80 flex flex-col space-y-3">
            <div className={`p-3 rounded-t-lg border-b-4 ${statusColor} bg-white shadow-sm flex justify-between items-center`}>
              <h3 className="font-bold text-slate-800 text-sm">{status}</h3>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">{columnItems.length}</span>
            </div>
            
            <div className="flex-1 space-y-3 pb-4">
              {columnItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-1.5 h-6 rounded-full mb-3" style={{ backgroundColor: item.groupColor }}></div>
                  <h4 className="font-medium text-slate-900 mb-2 leading-snug">{item.name}</h4>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                        <img src={`https://picsum.photos/24/24?random=${item.id}`} className="w-6 h-6 rounded-full" alt="Owner" />
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${PRIORITY_COLORS[item.priority]}`}>
                            {item.priority}
                        </span>
                    </div>
                    {item.dueDate && (
                        <div className="flex items-center text-[10px] text-slate-400">
                           🗓️ {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                    )}
                  </div>
                </div>
              ))}
              <button className="w-full p-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs font-bold hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center">
                <Icons.Plus /> <span className="ml-1">Add task</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanView;
