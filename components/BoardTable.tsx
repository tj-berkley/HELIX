
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
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);

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
    if (updates.status === 'Done') {
        setRecentlyCompleted(id);
        setTimeout(() => setRecentlyCompleted(null), 1000);
    }
    const updated = (item.subtasks || []).map(st => st.id === id ? { ...st, ...updates } : st);
    onUpdate({ subtasks: updated });
  };

  const handleDeleteSubtask = (id: string) => {
    const updated = (item.subtasks || []).filter(st => st.id !== id);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }}></div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{group.name}</span>
            </div>
            <input 
              className="text-2xl font-bold text-slate-900 w-full border-none outline-none focus:ring-2 focus:ring-blue-100 rounded px-1 -ml-1 transition-all" 
              value={item.name} 
              onChange={(e) => onUpdate({ name: e.target.value })} 
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
              <div className="relative">
                <div className={`px-3 py-2 rounded font-medium text-white text-sm text-center ${STATUS_COLORS[item.status]}`}>{item.status}</div>
                <select className="absolute inset-0 opacity-0 cursor-pointer" value={item.status} onChange={(e) => onUpdate({ status: e.target.value as Status })}>{Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}</select>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Priority</p>
              <div className="relative">
                <div className={`px-3 py-2 rounded font-medium text-white text-sm text-center ${PRIORITY_COLORS[item.priority]}`}>{item.priority}</div>
                <select className="absolute inset-0 opacity-0 cursor-pointer" value={item.priority} onChange={(e) => onUpdate({ priority: e.target.value as Priority })}>{Object.keys(PRIORITY_COLORS).map(p => <option key={p} value={p}>{p}</option>)}</select>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Due Date</p>
              <div className="relative flex items-center bg-white border border-slate-200 rounded px-3 py-2 hover:bg-slate-100 transition-colors cursor-pointer">
                <span className="mr-2 text-slate-400"><Icons.Calendar /></span>
                <span className="text-sm text-slate-600 truncate">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Set date'}</span>
                <input type="date" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" value={item.dueDate || ''} onChange={(e) => onUpdate({ dueDate: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h4 className="text-sm font-bold text-slate-700 flex items-center">
                <span className="mr-2">🌿</span> Subtasks 
                <span className="ml-2 text-xs font-normal text-slate-400">({doneSubtasks}/{item.subtasks?.length || 0})</span>
              </h4>
              <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${subtaskProgress}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              {(item.subtasks || []).map(st => (
                <div key={st.id} className={`flex items-center group/st bg-white border rounded-lg p-2 transition-all duration-300 ${recentlyCompleted === st.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                  <button 
                    onClick={() => handleUpdateSubtask(st.id, { status: st.status === 'Done' ? 'Not Started' : 'Done' })}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${st.status === 'Done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}
                  >
                    {st.status === 'Done' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </button>
                  <div className="ml-3 flex-shrink-0 relative group/owner">
                    <OwnerAvatar ownerId={st.ownerId || ''} size="sm" />
                    <select className="absolute inset-0 opacity-0 cursor-pointer" value={st.ownerId} onChange={(e) => handleUpdateSubtask(st.id, { ownerId: e.target.value })}>
                       {Object.keys(MOCK_USERS).map(uid => <option key={uid} value={uid}>{MOCK_USERS[uid].name}</option>)}
                    </select>
                  </div>
                  <input 
                    className={`ml-3 flex-1 text-sm bg-transparent border-none outline-none ${st.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`} 
                    value={st.name} 
                    onChange={(e) => handleUpdateSubtask(st.id, { name: e.target.value })} 
                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                  />
                  <div className="flex items-center space-x-2">
                    <div className="relative group-hover/st:opacity-100 opacity-0 transition-opacity">
                      <div className="flex items-center space-x-1 px-2 py-0.5 rounded border border-slate-200 text-[10px] font-bold text-slate-400 bg-slate-50">
                        <Icons.Calendar />
                        {st.dueDate && <span>{new Date(st.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                      </div>
                      <input type="date" className="absolute inset-0 opacity-0 cursor-pointer" value={st.dueDate || ''} onChange={(e) => handleUpdateSubtask(st.id, { dueDate: e.target.value })} />
                    </div>
                    <button onClick={() => handleDeleteSubtask(st.id)} className="text-slate-300 hover:text-rose-500 p-1 opacity-0 group-hover/st:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              <form onSubmit={handleAddSubtask} className="flex items-center bg-slate-100/50 border border-slate-200 border-dashed rounded-lg p-2 focus-within:bg-white transition-all">
                <div className="w-5 h-5 flex items-center justify-center text-slate-400"><Icons.Plus /></div>
                <input placeholder="Add a subtask..." className="ml-3 flex-1 text-sm bg-transparent border-none outline-none" value={newSubtaskName} onChange={(e) => setNewSubtaskName(e.target.value)} />
              </form>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 flex items-center border-b border-slate-200 pb-2">
              <span className="mr-2">💬</span> Updates
            </h4>
            <form onSubmit={handleAddComment} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <textarea placeholder="Write an update..." className="w-full p-0 text-sm border-none focus:ring-0 outline-none min-h-[80px] resize-none" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <button type="button" onClick={handleRefine} disabled={isRefining || !newComment.trim()} className="text-xs font-bold text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg flex items-center">
                  <Icons.Sparkles /> <span className="ml-1.5">{isRefining ? 'Refining...' : 'AI Refine'}</span>
                </button>
                <button type="submit" disabled={!newComment.trim()} className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all">Post</button>
              </div>
            </form>
            <div className="space-y-4 pt-2">
              {(item.comments || []).slice().reverse().map(comment => (
                <div key={comment.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex space-x-3">
                    <OwnerAvatar ownerId={comment.authorId} />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-900">{comment.author}</span>
                        <span className="text-slate-400">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-600">{comment.text}</p>
                    </div>
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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
  const [deletingRow, setDeletingRow] = useState<string | null>(null);
  const [actionMenu, setActionMenu] = useState<{ itemId: string; groupId: string; x: number; y: number } | null>(null);

  const toggleExpand = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) newExpanded.delete(itemId);
    else newExpanded.add(itemId);
    setExpandedItems(newExpanded);
  };

  const handleUpdateItemWithFeedback = (groupId: string, itemId: string, updates: Partial<Item>) => {
    setHighlightedRow(itemId);
    onUpdateItem(groupId, itemId, updates);
    setTimeout(() => setHighlightedRow(null), 1200);
  };

  const handleDeleteItemWithAnimation = (groupId: string, itemId: string) => {
    setDeletingRow(itemId);
    setTimeout(() => {
      onDeleteItem?.(groupId, itemId);
      setDeletingRow(null);
    }, 500);
  };

  const handleMoveItemWithFeedback = (sourceGroupId: string, targetGroupId: string, itemId: string) => {
    onMoveItem?.(sourceGroupId, targetGroupId, itemId);
    setHighlightedRow(itemId); // ID stays same, highlight triggers in the new group arrival
    setTimeout(() => setHighlightedRow(null), 1200);
  };

  const openActionMenu = (e: React.MouseEvent, itemId: string, groupId: string) => {
    e.preventDefault();
    setActionMenu({ itemId, groupId, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex-1 overflow-auto p-6 space-y-8 bg-slate-50" onClick={() => setActionMenu(null)}>
      {groups.map(group => (
        <div key={group.id} className="group-container animate-in fade-in slide-in-from-left-4">
          <div className="flex items-center mb-3 space-x-2 group/title">
            <button className="text-slate-400 opacity-0 group-hover/title:opacity-100 transition-opacity"><Icons.ChevronDown /></button>
            <h3 className="font-bold text-lg" style={{ color: group.color }}>{group.name}</h3>
            <span className="text-slate-400 text-sm font-normal ml-2">{group.items.length} Items</span>
            <button onClick={() => onDeleteGroup(group.id)} className="opacity-0 group-hover/title:opacity-100 text-slate-400 hover:text-red-500 transition-all text-xs ml-auto">Delete Group</button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full border-collapse text-sm table-fixed min-w-[1200px]">
              <thead className="bg-slate-50 sticky top-0 z-20 border-b border-slate-200">
                <tr>
                  <th className="w-10 p-2"></th>
                  <th className="p-3 text-left font-semibold text-slate-500 w-[35%]">Item</th>
                  <th className="p-3 text-center font-semibold text-slate-500 w-24">Updates</th>
                  <th className="p-3 text-center font-semibold text-slate-500 w-24">Owner</th>
                  <th className="p-3 text-center font-semibold text-slate-500 w-36">Status</th>
                  <th className="p-3 text-center font-semibold text-slate-500 w-36">Priority</th>
                  <th className="p-3 text-center font-semibold text-slate-500 w-44">Timeline</th>
                  <th className="p-3 text-center font-semibold text-slate-500 w-44">Due Date</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {group.items.map(item => (
                  <React.Fragment key={item.id}>
                    <tr 
                      className={`transition-all duration-500 group/row relative ${
                        highlightedRow === item.id ? 'bg-indigo-50 ring-2 ring-indigo-400 shadow-[0_0_25px_rgba(79,70,229,0.2)] z-10' : 
                        deletingRow === item.id ? 'opacity-0 -translate-x-full scale-95 blur-sm' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-2 text-center"><input type="checkbox" className="rounded" /></td>
                      <td 
                        className="p-3 border-l-4 cursor-pointer flex items-center" 
                        style={{ borderLeftColor: group.color }}
                        onClick={() => setSelectedItem({ item, group })}
                      >
                        <button onClick={(e) => toggleExpand(e, item.id)} className={`mr-2 p-1 rounded hover:bg-slate-200 text-slate-400 ${item.subtasks?.length ? '' : 'opacity-0'}`}>
                           <div className={`transition-transform ${expandedItems.has(item.id) ? 'rotate-90' : ''}`}><Icons.ChevronRight /></div>
                        </button>
                        <div className="flex-1 flex items-center relative min-w-0">
                          <input 
                            type="text" 
                            value={item.name} 
                            className="bg-transparent border-none outline-none w-full font-medium hover:bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:px-2 rounded transition-all truncate" 
                            onChange={(e) => handleUpdateItemWithFeedback(group.id, item.id, { name: e.target.value })} 
                            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                            onClick={(e) => e.stopPropagation()} 
                          />
                          {highlightedRow === item.id && (
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center text-indigo-500 animate-in fade-in zoom-in slide-in-from-right-2 duration-300">
                               <Icons.Sparkles />
                             </div>
                          )}
                        </div>
                        {!!item.subtasks?.length && <span className="ml-2 text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0">🌿 {item.subtasks.filter(s => s.status === 'Done').length}/{item.subtasks.length}</span>}
                      </td>
                      <td className="p-2 text-center">
                        <button 
                          onClick={() => setSelectedItem({ item, group })} 
                          className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all transform hover:scale-110 relative group/msg ${item.comments && item.comments.length > 0 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-100'}`}
                          title={`${item.comments?.length || 0} Updates`}
                        >
                          <Icons.Message />
                          {item.comments && item.comments.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-in zoom-in group-hover/msg:scale-110 transition-transform">
                              {item.comments.length}
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="p-2 text-center flex justify-center py-3"><OwnerAvatar ownerId={item.ownerId} /></td>
                      <td className="p-0 relative group/cell">
                        <div className={`h-full flex items-center justify-center p-3 font-bold text-white text-xs transition-all duration-300 ${STATUS_COLORS[item.status]} group-hover/cell:brightness-110`}>{item.status}</div>
                        <select className="absolute inset-0 opacity-0 cursor-pointer" value={item.status} onChange={(e) => handleUpdateItemWithFeedback(group.id, item.id, { status: e.target.value as Status })}>
                          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="p-0 relative group/cell">
                        <div className={`h-full flex items-center justify-center p-3 font-bold text-white text-xs transition-all duration-300 ${PRIORITY_COLORS[item.priority]} group-hover/cell:brightness-110`}>{item.priority}</div>
                        <select className="absolute inset-0 opacity-0 cursor-pointer" value={item.priority} onChange={(e) => handleUpdateItemWithFeedback(group.id, item.id, { priority: e.target.value as Priority })}>
                          {Object.keys(PRIORITY_COLORS).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                      <td className="p-3 text-center text-slate-500 text-xs font-mono">{item.timeline ? `${item.timeline.start} - ${item.timeline.end}` : '-'}</td>
                      <td className="p-2 text-center relative group/date">
                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${item.dueDate ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-400 group-hover/date:border-indigo-300 group-hover/date:text-indigo-500'}`}>
                          <Icons.Calendar /> <span>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Set date'}</span>
                        </div>
                        <input type="date" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" value={item.dueDate || ''} onChange={(e) => handleUpdateItemWithFeedback(group.id, item.id, { dueDate: e.target.value })} />
                      </td>
                      <td className="p-2 text-center">
                        <button onClick={(e) => openActionMenu(e, item.id, group.id)} className="opacity-0 group-hover/row:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded-lg">•••</button>
                      </td>
                    </tr>
                    {expandedItems.has(item.id) && (item.subtasks || []).map(st => (
                      <tr key={st.id} className="bg-slate-50/50 text-[11px] group/sub animate-in slide-in-from-top-1">
                        <td></td>
                        <td className="p-2 pl-12 flex items-center relative">
                          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                          <div className="absolute left-8 top-1/2 w-3 h-0.5 bg-slate-200"></div>
                          <button onClick={() => {
                             const updated = item.subtasks?.map(s => s.id === st.id ? { ...s, status: (s.status === 'Done' ? 'Not Started' : 'Done') as Status } : s);
                             handleUpdateItemWithFeedback(group.id, item.id, { subtasks: updated });
                          }} className={`w-3.5 h-3.5 rounded-full border mr-2 transition-all transform hover:scale-125 ${st.status === 'Done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'}`}>
                             {st.status === 'Done' && <svg viewBox="0 0 24 24" className="w-2 h-2 mx-auto" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </button>
                          <input 
                            className={`ml-1 flex-1 text-[11px] bg-transparent border-none outline-none ${st.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-700 font-medium hover:bg-white/50'}`} 
                            value={st.name} 
                            onChange={(e) => {
                              const updated = item.subtasks?.map(s => s.id === st.id ? { ...s, name: e.target.value } : s);
                              handleUpdateItemWithFeedback(group.id, item.id, { subtasks: updated });
                            }} 
                            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                          />
                        </td>
                        <td className="p-2"></td>
                        <td className="p-2 flex justify-center"><OwnerAvatar ownerId={st.ownerId || ''} size="sm" /></td>
                        <td className="p-0 text-center text-[10px] relative">
                           <div className={`h-full py-1 text-white font-bold transition-colors ${STATUS_COLORS[st.status]}`}>{st.status}</div>
                           <select className="absolute inset-0 opacity-0" value={st.status} onChange={(e) => {
                             const updated = item.subtasks?.map(s => s.id === st.id ? { ...s, status: e.target.value as Status } : s);
                             handleUpdateItemWithFeedback(group.id, item.id, { subtasks: updated });
                           }}>{Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}</select>
                        </td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center text-slate-400 font-mono text-[9px]">{st.dueDate || '-'}</td>
                        <td className="p-2 text-center"><button onClick={() => {
                          const updated = item.subtasks?.filter(s => s.id !== st.id);
                          handleUpdateItemWithFeedback(group.id, item.id, { subtasks: updated });
                        }} className="opacity-0 group-hover/sub:opacity-100 text-rose-500 transition-opacity transform hover:scale-125">✕</button></td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                <tr>
                  <td className="p-2"></td>
                  <td colSpan={8} className="p-3">
                    <button onClick={() => onAddItem(group.id)} className="text-slate-400 hover:text-indigo-600 flex items-center font-bold text-xs uppercase tracking-widest transition-all group/add">
                      <div className="w-5 h-5 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center mr-2 group-hover/add:border-indigo-500 group-hover/add:bg-indigo-50"><Icons.Plus /></div>
                      <span>Add Item</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {actionMenu && (
        <div 
          className="fixed z-[120] bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 w-48 animate-in zoom-in-95 duration-200" 
          style={{ top: actionMenu.y, left: actionMenu.x - 192 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 py-2 mb-1 border-b border-slate-50">Item Controls</div>
          <button 
             onClick={() => handleDeleteItemWithAnimation(actionMenu.groupId, actionMenu.itemId)}
             className="w-full text-left px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-xl flex items-center transition-colors font-bold"
          >
            <span className="mr-3 text-lg">🗑️</span> Delete Permanently
          </button>
          <div className="my-2 border-t border-slate-100"></div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 py-2">Transfer to Group</div>
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {groups.map(g => (
               <button 
                  key={g.id}
                  disabled={g.id === actionMenu.groupId}
                  onClick={() => {
                    handleMoveItemWithFeedback(actionMenu.groupId, g.id, actionMenu.itemId);
                    setActionMenu(null);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-xs rounded-xl transition-all flex items-center space-x-3 font-bold ${g.id === actionMenu.groupId ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:bg-indigo-50 text-slate-700 hover:text-indigo-700'}`}
               >
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: g.color }}></div>
                  <span className="truncate">{g.name}</span>
               </button>
            ))}
          </div>
        </div>
      )}

      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem.item} 
          group={selectedItem.group} 
          onClose={() => setSelectedItem(null)} 
          onUpdate={(updates) => {
            handleUpdateItemWithFeedback(selectedItem.group.id, selectedItem.item.id, updates);
            setSelectedItem(prev => prev ? { ...prev, item: { ...prev.item, ...updates } } : null);
          }} 
        />
      )}
    </div>
  );
};

export default BoardTable;
