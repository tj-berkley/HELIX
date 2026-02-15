
import React, { useState } from 'react';
import { Icons, STATUS_COLORS, PRIORITY_COLORS } from '../constants';

type TaskView = 'List' | 'Board' | 'Calendar';

interface Task {
  id: string;
  title: string;
  priority: string;
  column: string;
  category: string;
  dueDate: string;
}

interface GlobalTasksProps {
  activeViewInitial?: TaskView;
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Update homepage copy', priority: 'High', column: 'To Do', category: 'Marketing', dueDate: '2025-02-20' },
  { id: '2', title: 'Fix CSS layout bug in sidebar', priority: 'Critical', column: 'In Progress', category: 'Dev', dueDate: '2025-02-18' },
  { id: '3', title: 'Schedule team sync', priority: 'Low', column: 'To Do', category: 'Admin', dueDate: '2025-02-22' },
  { id: '4', title: 'Prepare board deck', priority: 'High', column: 'Done', category: 'Strategy', dueDate: '2025-02-15' },
  { id: '5', title: 'API Documentation review', priority: 'Medium', column: 'Blocked', category: 'Dev', dueDate: '2025-02-25' },
];

const GlobalTasks: React.FC<GlobalTasksProps> = ({ activeViewInitial = 'List' }) => {
  const [activeView, setActiveView] = useState<TaskView>(activeViewInitial);
  const [selectedCalendarSources, setSelectedCalendarSources] = useState<string[]>(['Internal', 'G-Calendar', 'G-Tasks']);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    priority: 'Medium', 
    column: 'To Do', 
    category: 'General',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const columns = ['To Do', 'In Progress', 'Blocked', 'Done'];

  const handleOpenModal = (column: string = 'To Do', prefilledDate?: string) => {
    setNewTask({ 
      ...newTask, 
      column, 
      dueDate: prefilledDate || new Date().toISOString().split('T')[0] 
    });
    setIsModalOpen(true);
  };

  const handleCreateTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      priority: newTask.priority,
      column: newTask.column,
      category: newTask.category,
      dueDate: newTask.dueDate
    };

    setTasks([task, ...tasks]);
    setIsModalOpen(false);
    setNewTask({ 
      title: '', 
      priority: 'Medium', 
      column: 'To Do', 
      category: 'General', 
      dueDate: new Date().toISOString().split('T')[0] 
    });
  };

  const updateTaskTitle = (id: string, newTitle: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t));
  };

  const externalEvents = [
    { id: 'e1', title: 'Google Sync: Team Lead Interview', source: 'G-Calendar', time: '10:00 AM', date: '2025-02-15' },
    { id: 'e2', title: 'Google Tasks: Renew Cloud Credentials', source: 'G-Tasks', time: 'All Day', date: '2025-02-16' },
    { id: 'e3', title: 'Contact: Alice Reached Out', source: 'G-Contacts', time: '3:00 PM', date: '2025-02-18' },
  ];

  const calendarDays = Array.from({ length: 35 }, (_, i) => i - 3); // Feb grid logic

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="p-8 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-6">
           <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
              {activeView === 'Calendar' ? '🗓️' : '✅'}
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{activeView === 'Calendar' ? 'Master Calendar' : 'My Tasks'}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aggregate Mission Control</p>
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
           <button 
            onClick={() => handleOpenModal()}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all flex items-center active:scale-95"
           >
             <Icons.Plus /> <span className="ml-2">Create New</span>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {activeView === 'Calendar' && (
           <div className="w-80 border-r border-slate-200 bg-white p-8 flex flex-col shrink-0 space-y-10 overflow-y-auto">
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Linked Intelligence</h3>
                 <div className="space-y-3">
                    {[
                       { id: 'Internal', label: 'OmniPortal Internal', color: 'bg-indigo-500', icon: '💎' },
                       { id: 'G-Calendar', label: 'Google Calendar', color: 'bg-blue-500', icon: '📅' },
                       { id: 'G-Tasks', label: 'Google Tasks', color: 'bg-emerald-500', icon: '✅' },
                       { id: 'G-Contacts', label: 'Google Contacts', color: 'bg-amber-500', icon: '👤' }
                    ].map(source => (
                       <button 
                        key={source.id} 
                        onClick={() => setSelectedCalendarSources(prev => prev.includes(source.id) ? prev.filter(s => s !== source.id) : [...prev, source.id])}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedCalendarSources.includes(source.id) ? 'border-slate-100 bg-slate-50' : 'border-transparent opacity-40 grayscale'}`}
                       >
                          <div className="flex items-center space-x-3">
                             <span className="text-xl">{source.icon}</span>
                             <span className="text-xs font-bold text-slate-700">{source.label}</span>
                          </div>
                          <div className={`w-2.5 h-2.5 rounded-full ${source.color}`}></div>
                       </button>
                    ))}
                 </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-4 shadow-xl">
                 <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Workspace Sync Active</span>
                 </div>
                 <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    AI agent is currently monitoring your Google Workspace for conflicts and optimization opportunities.
                 </p>
                 <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">Sync Settings</button>
              </div>
           </div>
        )}

        <div className="flex-1 overflow-auto p-8 relative">
          {activeView === 'Board' && (
            <div className="flex space-x-6 h-full">
              {columns.map(col => (
                <div key={col} className="w-80 flex-shrink-0 flex flex-col space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center">
                      <span className={`w-2.5 h-2.5 rounded-full mr-3 ${col === 'Done' ? 'bg-emerald-500' : col === 'Blocked' ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                      {col}
                    </h3>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{tasks.filter(t => t.column === col).length}</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    {tasks.filter(t => t.column === col).map(task => (
                      <div key={task.id} className="bg-white p-6 rounded-[1.8rem] shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all cursor-grab active:cursor-grabbing group">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{task.category}</span>
                            <button className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                            </button>
                          </div>
                          <input 
                            className="text-sm font-black text-slate-800 leading-tight mb-6 bg-transparent border-none outline-none w-full focus:ring-0" 
                            value={task.title}
                            onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                          />
                          <div className="flex justify-between items-center">
                            <div className="flex -space-x-2">
                                <img src={`https://picsum.photos/24/24?random=${task.id}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="Avatar" />
                            </div>
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full text-white ${PRIORITY_COLORS[task.priority] || 'bg-slate-400'}`}>{task.priority}</span>
                          </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => handleOpenModal(col)}
                      className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-white transition-all flex items-center justify-center text-[10px] font-black uppercase tracking-widest"
                    >
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
                      {tasks.map(task => (
                        <tr key={task.id} className="hover:bg-slate-50/80 transition-all cursor-pointer group">
                          <td className="p-5">
                            <button className={`w-5 h-5 rounded-full border-2 transition-all ${task.column === 'Done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-indigo-500'}`}>
                               {task.column === 'Done' && <span className="text-white text-[10px]">✓</span>}
                            </button>
                          </td>
                          <td className="p-5">
                             <div className="space-y-0.5">
                                <input 
                                  className={`text-sm font-black tracking-tight bg-transparent border-none outline-none focus:ring-0 w-full ${task.column === 'Done' ? 'line-through text-slate-400' : 'text-slate-800'}`} 
                                  value={task.title}
                                  onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                                />
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
                            <button 
                              onClick={() => handleOpenModal()}
                              className="flex items-center text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline px-4"
                            >
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
            <div className="max-w-7xl mx-auto pb-20">
               <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col min-h-[800px]">
                  <div className="grid grid-cols-7 border-b border-slate-100">
                     {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                       <div key={d} className="p-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50/50">{d}</div>
                     ))}
                  </div>
                  <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-slate-50">
                     {calendarDays.map((dayNum, i) => {
                        const dateStr = `2025-02-${String(dayNum).padStart(2, '0')}`;
                        const internalTasks = tasks.filter(t => t.dueDate === dateStr);
                        const external = externalEvents.filter(e => e.date === dateStr && selectedCalendarSources.includes(e.source));
                        const isToday = dayNum === 15;

                        return (
                          <div key={i} className={`p-4 min-h-[140px] space-y-2 hover:bg-slate-50/50 transition-colors group relative ${dayNum <= 0 || dayNum > 28 ? 'bg-slate-50/30' : ''}`}>
                             <div className="flex justify-between items-center mb-2">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-all ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 group-hover:text-slate-900'}`}>
                                   {dayNum > 0 && dayNum <= 28 ? dayNum : ''}
                                </span>
                                {dayNum > 0 && dayNum <= 28 && (
                                   <button 
                                     onClick={() => handleOpenModal('To Do', dateStr)}
                                     className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-black opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-600 hover:text-white"
                                   >
                                      +
                                   </button>
                                )}
                             </div>
                             
                             <div className="space-y-1">
                                {internalTasks.map(t => (
                                   <div key={t.id} className="p-1.5 rounded-lg bg-indigo-500 text-white text-[9px] font-bold shadow-sm truncate">
                                      {t.title}
                                   </div>
                                ))}
                                {external.map(e => (
                                   <div key={e.id} className={`p-1.5 rounded-lg text-white text-[9px] font-bold shadow-sm truncate ${e.source === 'G-Calendar' ? 'bg-blue-500' : e.source === 'G-Tasks' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                      <span className="opacity-70 mr-1">[{e.time}]</span> {e.title}
                                   </div>
                                ))}
                             </div>
                          </div>
                        );
                     })}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                       <Icons.Plus />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900">Define Objective</h3>
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">New Neural Task</p>
                    </div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              
              <form onSubmit={handleCreateTask} className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Task Title</label>
                    <input 
                      autoFocus
                      placeholder="What needs to be done?"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold shadow-inner outline-none transition-all"
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Priority</label>
                       <select 
                         className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-black uppercase outline-none shadow-inner"
                         value={newTask.priority}
                         onChange={e => setNewTask({...newTask, priority: e.target.value})}
                       >
                          {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                       <select 
                         className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-black uppercase outline-none shadow-inner"
                         value={newTask.column}
                         onChange={e => setNewTask({...newTask, column: e.target.value})}
                       >
                          {columns.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                        <input 
                        placeholder="e.g. Marketing"
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold shadow-inner outline-none transition-all"
                        value={newTask.category}
                        onChange={e => setNewTask({...newTask, category: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Due Date</label>
                        <input 
                        type="date"
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold shadow-inner outline-none transition-all"
                        value={newTask.dueDate}
                        onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                        />
                    </div>
                 </div>

                 <button 
                  type="submit" 
                  className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all transform active:scale-95 mt-4"
                 >
                    Commit Objective
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default GlobalTasks;
