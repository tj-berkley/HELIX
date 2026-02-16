
import React, { useState, useEffect } from 'react';
import { Icons, STATUS_COLORS, PRIORITY_COLORS } from '../constants';

type TaskView = 'List' | 'Board' | 'Calendar';

interface Task {
  id: string;
  title: string;
  priority: string;
  column: string;
  category: string;
  dueDate: string;
  isAvailable?: boolean; 
  isEvent?: boolean;
  attendees?: string[];
  paymentOption?: string;
  webinarLink?: string;
  webinarToken?: string;
  paperworkStatus?: 'Pending' | 'Signed' | 'N/A';
  eventDetails?: string;
  registrationLogic?: string;
  socialConfig?: {
    enabled: boolean;
    postTitle: string;
    postDescription: string;
    attachmentType: 'Article' | 'Image' | 'Video' | 'None';
    attachmentReference: string;
    platforms: string[];
  };
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
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('OMNI_GLOBAL_TASKS_V1');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  
  const [newTask, setNewTask] = useState({ 
    title: '', 
    priority: 'Medium', 
    column: 'To Do', 
    category: 'General',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const [newEvent, setNewEvent] = useState({
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    attendees: '',
    paymentOption: 'Direct Invoice',
    webinarDetails: '',
    webinarToken: '',
    paperwork: 'Standard MSA',
    priority: 'High',
    eventDetails: '',
    registrationLogic: '',
    socialEnabled: false,
    socialTitle: '',
    socialDescription: '',
    attachmentType: 'None' as 'Article' | 'Image' | 'Video' | 'None',
    attachmentRef: '',
    selectedPlatforms: [] as string[],
    isAvailable: true 
  });

  useEffect(() => {
    localStorage.setItem('OMNI_GLOBAL_TASKS_V1', JSON.stringify(tasks));
  }, [tasks]);

  const columns = ['To Do', 'In Progress', 'Blocked', 'Done'];

  const handleOpenTaskModal = (column: string = 'To Do', prefilledDate?: string) => {
    setNewTask({ 
      ...newTask, 
      column, 
      dueDate: prefilledDate || new Date().toISOString().split('T')[0] 
    });
    setIsTaskModalOpen(true);
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
    setIsTaskModalOpen(false);
    setNewTask({ title: '', priority: 'Medium', column: 'To Do', category: 'General', dueDate: new Date().toISOString().split('T')[0] });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    const eventTask: Task = {
      id: `evt-${Date.now()}`,
      title: newEvent.socialEnabled ? `📢 [SOCIAL] ${newEvent.title}` : `🗓️ ${newEvent.title}`,
      priority: newEvent.priority,
      column: 'To Do',
      category: newEvent.socialEnabled ? 'Social Post' : 'Event',
      dueDate: newEvent.dueDate,
      isEvent: true,
      isAvailable: newEvent.isAvailable,
      attendees: newEvent.attendees.split(',').map(s => s.trim()).filter(Boolean),
      paymentOption: newEvent.paymentOption,
      webinarLink: newEvent.webinarDetails,
      webinarToken: newEvent.webinarToken,
      paperworkStatus: 'Pending',
      eventDetails: newEvent.eventDetails,
      registrationLogic: newEvent.registrationLogic,
      socialConfig: {
        enabled: newEvent.socialEnabled,
        postTitle: newEvent.socialTitle,
        postDescription: newEvent.socialDescription,
        attachmentType: newEvent.attachmentType,
        attachmentReference: newEvent.attachmentRef,
        platforms: newEvent.selectedPlatforms
      }
    };

    setTasks([eventTask, ...tasks]);
    setIsEventModalOpen(false);
    setNewEvent({
        title: '',
        dueDate: new Date().toISOString().split('T')[0],
        attendees: '',
        paymentOption: 'Direct Invoice',
        webinarDetails: '',
        webinarToken: '',
        paperwork: 'Standard MSA',
        priority: 'High',
        eventDetails: '',
        registrationLogic: '',
        socialEnabled: false,
        socialTitle: '',
        socialDescription: '',
        attachmentType: 'None',
        attachmentRef: '',
        selectedPlatforms: [],
        isAvailable: true
    });
  };

  const togglePlatform = (platform: string) => {
    setNewEvent(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platform)
        ? prev.selectedPlatforms.filter(p => p !== platform)
        : [...prev.selectedPlatforms, platform]
    }));
  };

  const updateTaskTitle = (id: string, newTitle: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const externalEvents = [
    { id: 'e1', title: 'Google Sync: Team Lead Interview', source: 'G-Calendar', time: '10:00 AM', date: '2025-02-15' },
    { id: 'e2', title: 'Google Tasks: Renew Cloud Credentials', source: 'G-Tasks', time: 'All Day', date: '2025-02-16' },
    { id: 'e3', title: 'Contact: Alice Reached Out', source: 'G-Contacts', time: '3:00 PM', date: '2025-02-18' },
  ];

  const calendarDays = Array.from({ length: 35 }, (_, i) => i - 3);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#0c0e12] overflow-hidden font-sans text-slate-900 dark:text-white transition-colors duration-300">
      <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0c0e12] flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-6">
           <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
              {activeView === 'Calendar' ? '🗓️' : '✅'}
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{activeView === 'Calendar' ? 'Master Calendar' : 'Objective Stream'}</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Aggregate mission control</p>
           </div>
           <div className="h-8 w-px bg-slate-100 dark:bg-white/10 mx-2"></div>
           <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
              {(['List', 'Board', 'Calendar'] as TaskView[]).map(v => (
                <button 
                  key={v}
                  onClick={() => setActiveView(v)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}
                >
                   {v}
                </button>
              ))}
           </div>
        </div>
        <div className="flex items-center space-x-3">
           <button 
            onClick={() => setIsEventModalOpen(true)}
            className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black dark:hover:bg-slate-200 transition-all flex items-center active:scale-95"
           >
             <Icons.Calendar className="mr-2" /> New Event
           </button>
           <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all flex items-center active:scale-95"
           >
             <Icons.Plus className="mr-2" /> New Task
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {activeView === 'Calendar' && (
           <div className="w-80 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0c0e12] p-8 flex flex-col shrink-0 space-y-10 overflow-y-auto scrollbar-hide transition-colors duration-300">
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest px-1">Linked Intelligence</h3>
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
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedCalendarSources.includes(source.id) ? 'border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 shadow-sm' : 'border-transparent opacity-40 grayscale'}`}
                       >
                          <div className="flex items-center space-x-3">
                             <span className="text-xl">{source.icon}</span>
                             <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{source.label}</span>
                          </div>
                          <div className={`w-2.5 h-2.5 rounded-full ${source.color}`}></div>
                       </button>
                    ))}
                 </div>
              </div>

              <div className="p-6 bg-slate-900 dark:bg-slate-800 rounded-[2rem] text-white space-y-4 shadow-xl">
                 <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Workspace Sync Active</span>
                 </div>
                 <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed italic font-medium">
                    AI agent is monitoring your availability. Slots marked as 'Not Busy' are open for external booking.
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
                    <h3 className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest flex items-center">
                      <span className={`w-2.5 h-2.5 rounded-full mr-3 ${col === 'Done' ? 'bg-emerald-500' : col === 'Blocked' ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                      {col}
                    </h3>
                    <span className="text-[10px] font-bold bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full">{tasks.filter(t => t.column === col).length}</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    {tasks.filter(t => t.column === col).map(task => (
                      <div key={task.id} className={`p-6 rounded-[1.8rem] shadow-sm border transition-all cursor-grab active:cursor-grabbing group relative ${task.isEvent ? (task.isAvailable ? 'bg-amber-50/40 dark:bg-amber-950/20 border-dashed border-amber-200 dark:border-amber-500/20' : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/20') : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 hover:shadow-xl'}`}>
                          <button onClick={() => deleteTask(task.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-all">✕</button>
                          <div className="flex justify-between items-start mb-4">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${task.isEvent ? (task.isAvailable ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' : 'bg-indigo-600 text-white border-indigo-500') : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-400 dark:text-indigo-500 border-indigo-100 dark:border-indigo-500/20'}`}>
                                {task.category}
                            </span>
                          </div>
                          <input 
                            className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight mb-6 bg-transparent border-none outline-none w-full focus:ring-0" 
                            value={task.title}
                            onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                          />
                          <div className="flex justify-between items-center">
                            <div className="flex -space-x-2">
                                <img src={`https://picsum.photos/32/32?random=${task.id}`} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" alt="Avatar" />
                            </div>
                            <span className={`text-[8px] font-black px-2.5 py-1 rounded-full text-white uppercase tracking-widest ${PRIORITY_COLORS[task.priority] || 'bg-slate-400'}`}>{task.priority}</span>
                          </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeView === 'List' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden transition-colors duration-300">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                      <tr>
                        <th className="p-5 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest w-12"></th>
                        <th className="p-5 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Description</th>
                        <th className="p-5 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Availability</th>
                        <th className="p-5 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Status</th>
                        <th className="p-5 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Due Date</th>
                        <th className="p-5 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest text-right w-24">Owner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                      {tasks.map(task => (
                        <tr key={task.id} className={`hover:bg-slate-50/80 dark:hover:bg-white/5 transition-all cursor-pointer group ${task.isEvent ? (task.isAvailable ? 'bg-amber-50/20 dark:bg-amber-950/10' : 'bg-indigo-50/30 dark:bg-indigo-950/20') : ''}`}>
                          <td className="p-5">
                            <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className={`w-5 h-5 rounded-full border-2 transition-all ${task.column === 'Done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500'}`}>
                               {task.column === 'Done' && <span className="text-white text-[10px]">✓</span>}
                            </button>
                          </td>
                          <td className="p-5">
                             <div className="space-y-0.5">
                                <input 
                                  className={`text-sm font-black tracking-tight bg-transparent border-none outline-none focus:ring-0 w-full ${task.column === 'Done' ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-100'}`} 
                                  value={task.title}
                                  onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                                />
                                <span className={`text-[8px] font-black uppercase ${task.isAvailable ? 'text-amber-600 dark:text-amber-400' : (task.isEvent ? 'text-indigo-600 dark:text-indigo-400' : 'text-indigo-400 dark:text-indigo-500')}`}>{task.category}</span>
                             </div>
                          </td>
                          <td className="p-5">
                             <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase border ${task.isAvailable ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-700 border-slate-200 dark:border-white/5'}`}>
                                {task.isAvailable ? 'Available' : 'Busy'}
                             </span>
                          </td>
                          <td className="p-5">
                             <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${STATUS_COLORS[task.column] || 'bg-slate-400'} text-white`}>
                                {task.column}
                             </span>
                          </td>
                          <td className="p-5">
                             <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{task.dueDate}</span>
                          </td>
                          <td className="p-5 text-right">
                             <img src={`https://picsum.photos/32/32?random=${task.id}`} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 inline-block shadow-sm" alt="owner" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}

          {activeView === 'Calendar' && (
            <div className="max-w-7xl mx-auto pb-20">
               <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden flex flex-col min-h-[800px] transition-colors duration-300">
                  <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/5">
                     {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                       <div key={d} className="p-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-white/5">{d}</div>
                     ))}
                  </div>
                  <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-slate-50 dark:divide-white/5">
                     {calendarDays.map((dayNum, i) => {
                        const dateStr = `2025-02-${String(dayNum).padStart(2, '0')}`;
                        const internalTasks = tasks.filter(t => t.dueDate === dateStr);
                        const external = externalEvents.filter(e => e.date === dateStr && selectedCalendarSources.includes(e.source));
                        const isToday = dayNum === 15;

                        return (
                          <div key={i} className={`p-4 min-h-[140px] space-y-2 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group relative ${dayNum <= 0 || dayNum > 28 ? 'bg-slate-50/30 dark:bg-black/20' : ''}`}>
                             <div className="flex justify-between items-center mb-2">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-all ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                                   {dayNum > 0 && dayNum <= 28 ? dayNum : ''}
                                </span>
                                {dayNum > 0 && dayNum <= 28 && (
                                   <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                                       <button 
                                            onClick={() => { setNewEvent({...newEvent, dueDate: dateStr}); setIsEventModalOpen(true); }}
                                            className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-white dark:text-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-lg"
                                            title="Add Event"
                                        >
                                            📅
                                        </button>
                                        <button 
                                            onClick={() => handleOpenTaskModal('To Do', dateStr)}
                                            className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-black shadow-lg"
                                            title="Add Task"
                                        >
                                            +
                                        </button>
                                   </div>
                                )}
                             </div>
                             
                             <div className="space-y-1">
                                {internalTasks.map(t => (
                                   <div key={t.id} className={`p-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm truncate border transition-all relative group/item ${t.isAvailable ? 'bg-white dark:bg-slate-800 border-dashed border-amber-400 text-amber-600' : (t.isEvent ? 'bg-slate-950 dark:bg-black border-l-4 border-indigo-400 text-white' : 'bg-indigo-500 text-white')}`}>
                                      <button onClick={(e) => { e.stopPropagation(); deleteTask(t.id); }} className="absolute right-1 top-1 text-[8px] opacity-0 group-hover/item:opacity-100 transition-opacity">✕</button>
                                      {t.title}
                                   </div>
                                ))}
                                {external.map(e => (
                                   <div key={e.id} className={`p-1.5 rounded-lg text-white text-[9px] font-black uppercase tracking-widest shadow-sm truncate ${e.source === 'G-Calendar' ? 'bg-blue-500' : e.source === 'G-Tasks' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
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
      {isTaskModalOpen && (
        <div 
          className="fixed inset-0 z-[1000] bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in"
          onClick={() => setIsTaskModalOpen(false)}
        >
           <div className="bg-white dark:bg-[#1e293b] w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-indigo-50/30 dark:bg-indigo-950/20">
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                       <Icons.Plus />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Define Objective</h3>
                       <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">New Neural Task</p>
                    </div>
                 </div>
                 <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              
              <form onSubmit={handleCreateTask} className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Task Identifier</label>
                    <input 
                      autoFocus
                      placeholder="What needs to be done?"
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold dark:text-white shadow-inner outline-none transition-all"
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                    />
                 </div>
                 <div className="flex space-x-3 mt-4">
                    <button 
                        type="button" 
                        onClick={() => setIsTaskModalOpen(false)} 
                        className="flex-1 py-5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="flex-[2] py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all transform active:scale-95"
                    >
                        Commit Task
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Advanced Event Modal */}
      {isEventModalOpen && (
        <div 
          className="fixed inset-0 z-[1100] bg-slate-900/80 dark:bg-black/90 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in overflow-y-auto"
          onClick={() => setIsEventModalOpen(false)}
        >
           <div className="bg-white dark:bg-[#1e293b] w-full max-w-4xl rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] my-10 overflow-hidden animate-in slide-in-from-bottom-10 duration-500" onClick={e => e.stopPropagation()}>
              <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
                 <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-slate-900 dark:bg-white rounded-[1.5rem] flex items-center justify-center text-2xl shadow-2xl">
                       📅
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Neural Event Orchestration</h3>
                       <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">Lifecycle & Distribution Management</p>
                    </div>
                 </div>
                 <button onClick={() => setIsEventModalOpen(false)} className="p-4 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 dark:text-slate-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <form onSubmit={handleCreateEvent} className="p-10 grid grid-cols-2 gap-8 scrollbar-hide">
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Project Identifier (Event Name)</label>
                    <input 
                      autoFocus
                      placeholder="e.g. Q1 Global Growth Summit"
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-[1.8rem] p-6 text-xl font-black tracking-tight outline-none transition-all shadow-inner dark:text-white dark:placeholder-slate-700"
                      value={newEvent.title}
                      onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    />
                 </div>

                 {/* Column 1 */}
                 <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Timeline Schedule</label>
                        <input 
                        type="date"
                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-xs font-black uppercase outline-none shadow-inner font-mono dark:text-white"
                        value={newEvent.dueDate}
                        onChange={e => setNewEvent({...newEvent, dueDate: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Invitee List (Emails)</label>
                        <textarea 
                        placeholder="team@studio.com, guest@partner.io..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-[1.5rem] p-5 text-xs font-bold outline-none shadow-inner h-24 resize-none dark:text-white dark:placeholder-slate-700"
                        value={newEvent.attendees}
                        onChange={e => setNewEvent({...newEvent, attendees: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Virtual Access Link</label>
                        <input 
                        placeholder="Zoom/Meet/Stream Link..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-5 text-xs font-bold outline-none shadow-inner dark:text-white dark:placeholder-slate-700"
                        value={newEvent.webinarDetails}
                        onChange={e => setNewEvent({...newEvent, webinarDetails: e.target.value})}
                        />
                    </div>
                 </div>

                 {/* Column 2 */}
                 <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Access Token / Webinar Code</label>
                        <input 
                        placeholder="Auth Token or Session Code..."
                        className="w-full bg-slate-950 dark:bg-black border-none rounded-2xl p-4 text-xs font-mono text-indigo-400 outline-none shadow-inner"
                        value={newEvent.webinarToken}
                        onChange={e => setNewEvent({...newEvent, webinarToken: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">General Event Intelligence (Details)</label>
                        <textarea 
                        placeholder="Brief purpose and outcome expectations..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-[1.5rem] p-5 text-xs font-bold outline-none shadow-inner h-32 resize-none dark:text-white dark:placeholder-slate-700"
                        value={newEvent.eventDetails}
                        onChange={e => setNewEvent({...newEvent, eventDetails: e.target.value})}
                        />
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] flex items-center justify-between shadow-inner">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Temporal Availability</p>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Mark as 'Not Busy' for appointments?</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={newEvent.isAvailable} onChange={() => setNewEvent({...newEvent, isAvailable: !newEvent.isAvailable})} />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>
                 </div>

                 {/* Social Distribution Suite */}
                 <div className="col-span-2 pt-10 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">📣</span>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Social Signal Distribution</h4>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={newEvent.socialEnabled} 
                              onChange={() => {
                                  const nextEnabled = !newEvent.socialEnabled;
                                  setNewEvent({...newEvent, socialEnabled: nextEnabled, isAvailable: nextEnabled ? true : newEvent.isAvailable});
                              }} 
                            />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            <span className="ml-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Activate Auto-Post</span>
                        </label>
                    </div>

                    {newEvent.socialEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-top-4">
                            <div className="md:col-span-2 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Post Catchline (Title)</label>
                                    <input 
                                        className="w-full bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-4 text-sm font-bold outline-none dark:text-white"
                                        placeholder="Announcement Header..."
                                        value={newEvent.socialTitle}
                                        onChange={e => setNewEvent({...newEvent, socialTitle: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Creative Narrative (Description)</label>
                                    <textarea 
                                        className="w-full bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 rounded-[1.5rem] p-5 text-xs font-medium h-32 resize-none outline-none dark:text-white"
                                        placeholder="Body copy for the post..."
                                        value={newEvent.socialDescription}
                                        onChange={e => setNewEvent({...newEvent, socialDescription: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Target Platforms</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Facebook', 'X', 'LinkedIn', 'Instagram', 'TikTok'].map(plat => (
                                            <button 
                                                key={plat}
                                                type="button"
                                                onClick={() => togglePlatform(plat)}
                                                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${newEvent.selectedPlatforms.includes(plat) ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 border-transparent hover:bg-slate-200 dark:hover:bg-white/10'}`}
                                            >
                                                {plat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                                   <p className="text-[9px] text-indigo-700 dark:text-indigo-300 leading-tight">ℹ️ <strong>Optimization Active:</strong> This post will appear on your calendar as a reference but will not block appointment bookings.</p>
                                </div>
                            </div>
                        </div>
                    )}
                 </div>

                 <div className="col-span-2 pt-10 flex space-x-4">
                    <button 
                        type="button" 
                        onClick={() => setIsEventModalOpen(false)}
                        className="flex-1 py-6 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all transform active:scale-95"
                    >
                        Dismiss Setup
                    </button>
                    <button 
                        type="submit" 
                        className="flex-[3] py-6 bg-slate-900 dark:bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-black dark:hover:bg-indigo-700 transition-all transform active:scale-95 flex items-center justify-center group"
                    >
                        Commit & Transmit Orchestration <span className="ml-3 group-hover:scale-125 transition-transform">✨</span>
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default GlobalTasks;
