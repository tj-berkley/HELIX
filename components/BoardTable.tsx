
import React, { useState, useEffect, useRef } from 'react';
import { Icons, STATUS_COLORS, PRIORITY_COLORS } from '../constants';
import { Group, Item, Status, Priority, Comment, Subtask } from '../types';
import { refineUpdate } from '../services/geminiService';

interface BoardTableProps {
  groups: Group[];
  onUpdateItem: (groupId: string, itemId: string, updates: Partial<Item>) => void;
  onAddItem: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onDeleteItem?: (groupId: string, itemId: string) => void;
  onMoveItem?: (sourceGroupId: string, targetGroupId: string, itemId: string) => void;
}

const MOCK_USERS: Record<string, { name: string; avatar?: string; color: string }> = {
  'u-1': { name: 'Senior Engineer', avatar: 'https://picsum.photos/32/32?random=1', color: 'bg-indigo-500' },
  'u-2': { name: 'Product Manager', avatar: 'https://picsum.photos/32/32?random=2', color: 'bg-emerald-500' },
  'u-3': { name: 'UI Designer', color: 'bg-rose-500' },
};

const CURRENT_USER_ID = 'u-1';

const OwnerAvatar: React.FC<{ ownerId: string; size?: 'sm' | 'md' }> = ({ ownerId, size = 'md' }) => {
  const user = MOCK_USERS[ownerId];
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[8px]' : 'w-7 h-7 text-[10px]';
  
  if (!ownerId || !user) {
    return (
      <div className={`${sizeClasses} rounded-full bg-slate-100 border border-slate-200 border-dashed flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all cursor-pointer group/avatar`}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size === 'sm' ? "12" : "14"} height={size === 'sm' ? "12" : "14"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
      </div>
    );
  }
  if (user.avatar) {
    return (
      <img src={user.avatar} className={`${sizeClasses} rounded-full border border-white shadow-sm ring-1 ring-slate-200`} alt={user.name} />
    );
  }
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  return (
    <div className={`${sizeClasses} rounded-full ${user.color} flex items-center justify-center font-bold text-white border border-white shadow-sm`}>
      {initials}
    </div>
  );
};

const ItemDetailModal: React.FC<{
  item: Item;
  group: Group;
  onClose: () => void;
  onUpdate: (updates: Partial<Item>) => void;
}> = ({ item, group, onClose, onUpdate }) => {
  const [newComment, setNewComment] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `c-${Date.now()}`,
      text: newComment,
      author: MOCK_USERS[CURRENT_USER_ID].name,
      authorId: CURRENT_USER_ID,
      timestamp: new Date().toLocaleString(),
      likes: []
    };
    onUpdate({ comments: [...(item.comments || []), comment] });
    setNewComment('');
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskName.trim()) return;
    const subtask: Subtask = {
      id: `st-${Date.now()}`,
      name: newSubtaskName,
      status: 'Not Started',
      ownerId: CURRENT_USER_ID
    };
    onUpdate({ subtasks: [...(item.subtasks || []), subtask] });
    setNewSubtaskName('');
  };

  const handleUpdateSubtask = (id: string, updates: Partial<Subtask>) => {
    const updated = (item.subtasks || []).map(st => st.id === id ? { ...st, ...updates } : st);
    onUpdate({ subtasks: updated });
  };

  const handleRefine = async () => {
    if (!newComment.trim()) return;
    setIsRefining(true);
    const refined = await refineUpdate(newComment);
    if (refined) setNewComment(refined.trim());
    setIsRefining(false);
  };

  const doneSubtasks = (item.subtasks || []).filter(st => st.status === 'Done').length;
  const subtaskProgress = item.subtasks?.length ? (doneSubtasks / item.subtasks.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-10 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: group.color }}></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{group.name}</span>
            </div>
            <input 
              className="text-3xl font-black text-slate-900 w-full border-none outline-none focus:ring-0 bg-transparent p-0 tracking-tight" 
              value={item.name} 
              onChange={(e) => onUpdate({ name: e.target.value })} 
            />
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-full text-slate-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          {/* Main Attributes Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-3 space-y-2 mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Objective Name</p>
              <input 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" 
                value={item.name} 
                onChange={(e) => onUpdate({ name: e.target.value })} 
                placeholder="Enter objective name..."
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</p>
              <div className="relative">
                <div className={`px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white text-center shadow-lg shadow-inner ${STATUS_COLORS[item.status]}`}>{item.status}</div>
                <select className="absolute inset-0 opacity-0 cursor-pointer" value={item.status} onChange={(e) => onUpdate({ status: e.target.value as Status })}>{Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}</select>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Priority</p>
              <div className="relative">
                <div className={`px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white text-center shadow-lg shadow-inner ${PRIORITY_COLORS[item.priority]}`}>{item.priority}</div>
                <select className="absolute inset-0 opacity-0 cursor-pointer" value={item.priority} onChange={(e) => onUpdate({ priority: e.target.value as Priority })}>{Object.keys(PRIORITY_COLORS).map(p => <option key={p} value={p}>{p}</option>)}</select>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Due Date</p>
              <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 hover:bg-white hover:border-indigo-200 transition-all cursor-pointer shadow-inner">
                <span className="mr-2 text-slate-400"><Icons.Calendar /></span>
                <span className="text-xs font-bold text-slate-600 truncate">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Set Deadline'}</span>
                <input type="date" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" value={item.dueDate || ''} onChange={(e) => onUpdate({ dueDate: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center">
                <span className="mr-3 text-xl">🌱</span> Mission Milestones
              </h4>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doneSubtasks} / {item.subtasks?.length || 0} Complete</span>
            </div>

            <div className="space-y-3">
              {(item.subtasks || []).map(st => (
                <div key={st.id} className={`flex items-center bg-slate-50/50 hover:bg-white border-2 border-transparent hover:border-indigo-100 rounded-[1.5rem] p-4 transition-all group/st shadow-sm`}>
                  <button 
                    onClick={() => handleUpdateSubtask(st.id, { status: st.status === 'Done' ? 'Not Started' : 'Done' })}
                    className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${st.status === 'Done' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-white border-slate-200'}`}
                  >
                    {st.status === 'Done' && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </button>
                  <input 
                    className={`ml-4 flex-1 text-sm bg-transparent border-none outline-none font-bold ${st.status === 'Done' ? 'line-through text-slate-300' : 'text-slate-700'}`} 
                    value={st.name} 
                    onChange={(e) => handleUpdateSubtask(st.id, { name: e.target.value })} 
                  />
                  <div className="flex items-center space-x-3 opacity-0 group-hover/st:opacity-100 transition-opacity">
                    <OwnerAvatar ownerId={st.ownerId || ''} size="sm" />
                    <button onClick={() => onUpdate({ subtasks: item.subtasks?.filter(s => s.id !== st.id) })} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              <form onSubmit={handleAddSubtask} className="flex items-center bg-white border-2 border-dashed border-slate-200 rounded-[1.5rem] p-4 group transition-all hover:border-indigo-400">
                <div className="w-6 h-6 flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors font-black text-xl">+</div>
                <input placeholder="Add a new milestone..." className="ml-4 flex-1 text-sm bg-transparent border-none outline-none font-bold" value={newSubtaskName} onChange={(e) => setNewSubtaskName(e.target.value)} />
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center border-b border-slate-100 pb-3">
              <span className="mr-3 text-xl">📢</span> Intelligence Stream
            </h4>
            <div className="bg-slate-50 rounded-[2rem] p-8 space-y-6 shadow-inner border border-slate-100">
               <textarea placeholder="Synthesize an update..." className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 min-h-[100px] resize-none" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
               <div className="flex justify-between items-center pt-6 border-t border-slate-200/50">
                  <button type="button" onClick={handleRefine} disabled={isRefining || !newComment.trim()} className="h-10 px-5 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center">
                    <Icons.Sparkles /> <span className="ml-2">{isRefining ? 'Synthesizing...' : 'Neural Refine'}</span>
                  </button>
                  <button onClick={handleAddComment} disabled={!newComment.trim()} className="h-10 px-8 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-xl active:scale-95">Post Update</button>
               </div>
            </div>
            <div className="space-y-6 pr-2">
              {(item.comments || []).slice().reverse().map(comment => (
                <div key={comment.id} className="flex space-x-4 animate-in slide-in-from-bottom-2">
                  <OwnerAvatar ownerId={comment.authorId} />
                  <div className="flex-1 bg-white border border-slate-100 rounded-[1.8rem] p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-black text-slate-900">{comment.author}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BoardTable: React.FC<BoardTableProps> = ({ groups, onUpdateItem, onAddItem, onDeleteGroup, onDeleteItem, onMoveItem }) => {
  const [selectedItem, setSelectedItem] = useState<{ item: Item; group: Group } | null>(null);

  return (
    <div className="flex-1 overflow-auto p-10 space-y-12 bg-white/50 backdrop-blur-sm">
      {groups.map(group => (
        <div key={group.id} className="animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-center mb-6 space-x-3 px-2 group/title">
            <div className="w-1.5 h-6 rounded-full shadow-sm" style={{ backgroundColor: group.color }}></div>
            <h3 className="font-black text-xl tracking-tight" style={{ color: '#1e293b' }}>{group.name}</h3>
            <span className="bg-slate-100 text-[10px] font-black text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest">{group.items.length} Entries</span>
            <button onClick={() => onDeleteGroup(group.id)} className="opacity-0 group-hover/title:opacity-100 text-[10px] font-black text-rose-400 hover:text-rose-600 transition-all uppercase tracking-widest ml-auto">Dissolve Group</button>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200/60 shadow-xl bg-white/80 backdrop-blur-md">
            <table className="w-full border-collapse text-sm table-fixed min-w-[1100px]">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="w-12"></th>
                  <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-[35%]">Objective Name</th>
                  <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Nodes</th>
                  <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-28">Strategist</th>
                  <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-36">Current Phase</th>
                  <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-36">Level</th>
                  <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Timeline</th>
                  <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {group.items.map(item => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-indigo-50/20 transition-all duration-300 group/row cursor-pointer"
                    onClick={() => setSelectedItem({ item, group })}
                  >
                    <td className="p-4 text-center"><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" onClick={e => e.stopPropagation()} /></td>
                    <td className="p-4 font-bold text-slate-800">
                      <div className="flex items-center space-x-3">
                         <div className="w-1 h-5 rounded-full opacity-50" style={{ backgroundColor: group.color }}></div>
                         <span className="truncate tracking-tight">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                       <div className={`w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center mx-auto transition-all ${item.comments?.length ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:text-indigo-400'}`}>
                          <Icons.Message />
                       </div>
                    </td>
                    <td className="p-4 text-center flex justify-center"><OwnerAvatar ownerId={item.ownerId} /></td>
                    <td className="p-2 relative">
                       <div className={`h-10 flex items-center justify-center rounded-xl font-black text-[9px] uppercase tracking-[0.15em] text-white shadow-sm transition-all group-hover/row:scale-105 ${STATUS_COLORS[item.status]}`}>{item.status}</div>
                    </td>
                    <td className="p-2 relative">
                       <div className={`h-10 flex items-center justify-center rounded-xl font-black text-[9px] uppercase tracking-[0.15em] text-white shadow-sm transition-all group-hover/row:scale-105 ${PRIORITY_COLORS[item.priority]}`}>{item.priority}</div>
                    </td>
                    <td className="p-4 text-center">
                       <div className="text-[10px] font-black text-slate-500 font-mono tracking-tighter bg-slate-100/50 py-1.5 rounded-lg border border-slate-200/50">
                          {item.dueDate ? new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : 'No Expiry'}
                       </div>
                    </td>
                    <td className="p-4 text-center">
                       <button className="opacity-0 group-hover/row:opacity-100 text-slate-400 hover:text-indigo-600 p-1 transition-all">•••</button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="p-4"></td>
                  <td colSpan={7} className="p-6">
                    <button 
                      onClick={() => onAddItem(group.id)}
                      className="flex items-center space-x-4 group/add px-4 py-2 hover:bg-indigo-50 rounded-2xl transition-all"
                    >
                      <div className="w-8 h-8 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center group-hover/add:border-indigo-400 group-hover/add:bg-white transition-all">
                        <span className="text-xl text-slate-300 group-hover/add:text-indigo-500 font-black">+</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/add:text-indigo-600">Append Objective</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem.item} 
          group={selectedItem.group} 
          onClose={() => setSelectedItem(null)} 
          onUpdate={(updates) => {
            onUpdateItem(selectedItem.group.id, selectedItem.item.id, updates);
            setSelectedItem(prev => prev ? { ...prev, item: { ...prev.item, ...updates } } : null);
          }} 
        />
      )}
    </div>
  );
};

export default BoardTable;
