
import React, { useState } from 'react';
import { Icons, STATUS_COLORS, PRIORITY_COLORS } from '../constants';

type TaskView = 'List' | 'Board' | 'Calendar';

const GlobalTasks: React.FC = () => {
  const [activeView, setActiveView] = useState<TaskView>('List');
  const columns = ['To Do', 'In Progress', 'Blocked', 'Done'];
  
  const mockTasks = [
    { id: '1', title: 'Update homepage copy', priority: 'High', column: 'To Do', category: 'Marketing', dueDate: '2025-02-20' },
    { id: '2', title: 'Fix CSS layout bug in sidebar', priority: 'Critical', column: 'In Progress', category: 'Dev', dueDate: '2025-02-18' },
    { id: '3', title: 'Schedule team sync', priority: 'Low', column: 'To Do', category: 'Admin', dueDate: '2025-02-22' },
    { id: '4', title: 'Prepare board deck', priority: 'High', column: 'Done', category: 'Strategy', dueDate: '2025-02-15' },
    { id: '5', title: 'API Documentation review', priority: 'Medium', column: 'Blocked', category: 'Dev', dueDate: '2025-02-25' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      <div className="p-8 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-6">
           <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">✅</div>
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Tasks</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Aggregate Mission Control</p>
           </div>
           <div className="h-8 w-px bg-slate-100"></div>
           <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['List', 'Board', 'Calendar'] as TaskView[]).map(v => (
                <button 
                  key={v}
                  onClick={() => setActiveView(v)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                   {v}
                </button>
              ))}
           </div>
        </div>
        <div className="flex space-x-3">
           <button className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all flex items-center active:scale-95">
             <Icons.Plus /> <span className="ml-2">Create Task</span>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        {activeView === 'Board' && (
          <div className="flex space-x-6 h-full">
            {columns.map(col => (
              <div key={col} className="w-80 flex-shrink-0 flex flex-col space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center">
                    <span className={`w-2.5 h-2.5 rounded-full mr-3 ${col === 'Done' ? 'bg-emerald-500' : col === 'Blocked' ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                    {col}
                  </h3>
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{mockTasks.filter(t => t.column === col).length}</span>
                </div>

                <div className="flex-1 space-y-3">
                  {mockTasks.filter(t => t.column === col).map(task => (
                    <div key={task.id} className="bg-white p-6 rounded-[1.8rem] shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all cursor-grab active:cursor-grabbing group">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{task.category}</span>
                          <button className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                          </button>
                        </div>
                        <h4 className="text-sm font-black text-slate-800 leading-tight mb-6">{task.title}</h4>
                        <div className="flex justify-between items-center">
                          <div className="flex -space-x-2">
                              <img src={`https://picsum.photos/24/24?random=${task.id}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="Avatar" />
                          </div>
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full text-white ${PRIORITY_COLORS[task.priority] || 'bg-slate-400'}`}>{task.priority}</span>
                        </div>
                    </div>
                  ))}
                  <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-white transition-all flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
                      <Icons.Plus /> <span className="ml-2">New Entry</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === 'List' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-12"></th>
                      <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Task Name</th>
                      <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                      <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                      <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right w-24">Assignee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {mockTasks.map(task => (
                      <tr key={task.id} className="hover:bg-slate-50/80 transition-all cursor-pointer group">
                        <td className="p-5">
                          <button className={`w-5 h-5 rounded-full border-2 transition-all ${task.column === 'Done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-indigo-500'}`}>
                             {task.column === 'Done' && <span className="text-white text-[10px]">✓</span>}
                          </button>
                        </td>
                        <td className="p-5">
                           <div className="space-y-0.5">
                              <p className={`text-sm font-black tracking-tight ${task.column === 'Done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                              <span className="text-[8px] font-black text-indigo-400 uppercase">{task.category}</span>
                           </div>
                        </td>
                        <td className="p-5">
                           <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${STATUS_COLORS[task.column] || 'bg-slate-400'} text-white`}>
                              {task.column}
                           </span>
                        </td>
                        <td className="p-5">
                           <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${PRIORITY_COLORS[task.priority] || 'bg-slate-400'} text-white`}>
                              {task.priority}
                           </span>
                        </td>
                        <td className="p-5">
                           <span className="text-xs font-bold text-slate-500">{task.dueDate}</span>
                        </td>
                        <td className="p-5 text-right">
                           <img src={`https://picsum.photos/32/32?random=${task.id}`} className="w-8 h-8 rounded-full border border-slate-200 inline-block shadow-sm" alt="owner" />
                        </td>
                      </tr>
                    ))}
                    <tr>
                       <td colSpan={6} className="p-4">
                          <button className="flex items-center text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline px-4">
                             <Icons.Plus /> <span className="ml-2">Add task to queue</span>
                          </button>
                       </td>
                    </tr>
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeView === 'Calendar' && (
          <div className="max-w-5xl mx-auto h-[600px] bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-6">
             <div className="text-6xl">🗓️</div>
             <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Master Task Calendar</h3>
                <p className="text-slate-400 font-medium">Syncing deadlines across all mission boards...</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalTasks;
