
import React, { useState } from 'react';
import { Board, Status, Group, Item } from '../types';
import { Icons } from '../constants';

interface ProjectPortfolioProps {
  boards: Board[];
  onSelectProject: (boardId: string) => void;
  onAddBoard: (board: Board) => void;
}

const MOCK_TEAM = [
  { id: 'u-1', name: 'Senior Engineer', avatar: 'https://picsum.photos/32/32?random=1', role: 'Architect' },
  { id: 'u-2', name: 'Product Manager', avatar: 'https://picsum.photos/32/32?random=2', role: 'Ops' },
  { id: 'u-3', name: 'UI Designer', avatar: 'https://picsum.photos/32/32?random=3', role: 'Design' },
  { id: 'u-4', name: 'Marketing Lead', avatar: 'https://picsum.photos/32/32?random=4', role: 'Growth' },
];

const CreateProjectModal: React.FC<{ onClose: () => void; onComplete: (data: any) => void }> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    industry: 'Technology',
    methodology: 'Agile',
    team: [] as string[]
  });

  const totalSteps = 3;

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const submit = () => {
    const newBoard: Board = {
      id: `b-${Date.now()}`,
      name: formData.name || 'Untitled Mission',
      description: formData.description || 'No description provided.',
      groups: [
        {
          id: `g-${Date.now()}`,
          name: 'Milestone 1: Inception',
          color: formData.color,
          items: [
            {
              id: `i-${Date.now()}`,
              name: 'Initialize Project Core',
              ownerId: formData.team[0] || 'u-1',
              status: 'Not Started',
              priority: 'High',
              timeline: null,
              lastUpdated: new Date().toISOString(),
              comments: [],
              subtasks: []
            }
          ]
        }
      ]
    };
    onComplete(newBoard);
  };

  const toggleMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.includes(id) ? prev.team.filter(m => m !== id) : [...prev.team, id]
    }));
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.5)] border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Progress Header */}
        <div className="p-10 border-b border-slate-50 bg-slate-50/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Mission Architect</h3>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-1">Step {step} of {totalSteps}</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white rounded-full text-slate-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 p-12 space-y-10 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Identifier</label>
                <input 
                  autoFocus
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-6 text-xl font-black tracking-tight outline-none transition-all shadow-inner"
                  placeholder="e.g. Project Hyperdrive"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Strategic Brief</label>
                <textarea 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-[2rem] p-6 text-sm font-medium outline-none transition-all shadow-inner h-32 resize-none"
                  placeholder="Describe the primary objectives..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Theme Signature</label>
                <div className="flex space-x-3">
                  {['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'].map(c => (
                    <button 
                      key={c} 
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-10 h-10 rounded-xl transition-all ${formData.color === c ? 'ring-4 ring-slate-100 scale-110 shadow-lg' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Domain / Industry</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm font-black uppercase tracking-widest outline-none transition-all shadow-inner"
                    value={formData.industry}
                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                  >
                    <option>Technology</option><option>Creative</option><option>Real Estate</option><option>Healthcare</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Execution Framework</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm font-black uppercase tracking-widest outline-none transition-all shadow-inner"
                    value={formData.methodology}
                    onChange={e => setFormData({ ...formData, methodology: e.target.value })}
                  >
                    <option>Agile</option><option>Waterfall</option><option>Kanban</option><option>Lean</option>
                  </select>
                </div>
              </div>
              <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] flex items-center space-x-6 group">
                <div className="text-4xl group-hover:scale-110 transition-transform">✨</div>
                <div>
                   <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">AI Optimization Ready</p>
                   <p className="text-[10px] text-indigo-600 leading-relaxed font-medium mt-1">Guided flows allow Gemini to pre-populate task structures based on your selected framework.</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Squad Deployment</label>
                <div className="grid grid-cols-2 gap-4">
                  {MOCK_TEAM.map(member => (
                    <button 
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`flex items-center space-x-4 p-4 rounded-[1.8rem] border-2 transition-all ${formData.team.includes(member.id) ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                    >
                       <img src={member.avatar} className="w-10 h-10 rounded-full border border-white shadow-sm" alt="avatar" />
                       <div className="text-left flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">{member.name}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</p>
                       </div>
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.team.includes(member.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}>
                          {formData.team.includes(member.id) && <span className="text-white text-[10px]">✓</span>}
                       </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-10 border-t border-slate-50 flex justify-between items-center">
          <button 
            onClick={step === 1 ? onClose : handleBack}
            className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button 
            onClick={step === totalSteps ? submit : handleNext}
            disabled={step === 1 && !formData.name}
            className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-20"
          >
            {step === totalSteps ? 'Launch Mission' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectPortfolio: React.FC<ProjectPortfolioProps> = ({ boards, onSelectProject, onAddBoard }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getProjectStats = (board: Board) => {
    const allItems = board.groups.flatMap(g => g.items);
    const completed = allItems.filter(i => i.status === 'Done').length;
    const total = allItems.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    
    let health: Status = 'On Track';
    const stuck = allItems.filter(i => i.status === 'Stuck').length;
    const critical = allItems.filter(i => i.status === 'Critical' || i.priority === 'Critical').length;
    
    if (stuck > 0 || critical > 1) health = 'At Risk';
    if (stuck > 2 || critical > 3) health = 'Off Track';

    return { progress, total, completed, health };
  };

  const healthColors: Record<string, string> = {
    'On Track': 'text-emerald-500 bg-emerald-50 border-emerald-100',
    'At Risk': 'text-amber-500 bg-amber-50 border-amber-100',
    'Off Track': 'text-rose-500 bg-rose-50 border-rose-100',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Project Portfolio</h2>
            <p className="text-slate-500 font-medium text-lg">Central dashboard for all active mission streams.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all flex items-center active:scale-95"
            >
              <Icons.Plus /> <span className="ml-2 uppercase tracking-widest text-xs">Create Project</span>
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boards.map(board => {
              const stats = getProjectStats(board);
              return (
                <div 
                  key={board.id} 
                  onClick={() => onSelectProject(board.id)}
                  className="bg-white rounded-[3rem] border-2 border-transparent shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all p-10 cursor-pointer group flex flex-col space-y-8"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">
                      🚀
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${healthColors[stats.health]}`}>
                      {stats.health}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{board.name}</h3>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {board.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                       <span className="text-sm font-black text-slate-900">{Math.round(stats.progress)}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                       <div className="h-full bg-indigo-600 transition-all duration-1000 ease-out" style={{ width: `${stats.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <img key={i} src={`https://picsum.photos/32/32?random=${i + board.id.length}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="Team" />
                      ))}
                    </div>
                    <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                      View Board <span className="ml-2">→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project Name</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Progress</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Team</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {boards.map(board => {
                  const stats = getProjectStats(board);
                  return (
                    <tr 
                      key={board.id} 
                      onClick={() => onSelectProject(board.id)}
                      className="hover:bg-indigo-50/20 transition-colors cursor-pointer group"
                    >
                      <td className="p-8">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl">🚀</div>
                          <div>
                            <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{board.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Mission Active</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${healthColors[stats.health]}`}>
                          {stats.health}
                        </span>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center space-x-4">
                           <div className="flex-1 h-2 w-32 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-indigo-600" style={{ width: `${stats.progress}%` }}></div>
                           </div>
                           <span className="text-xs font-black text-slate-600">{Math.round(stats.progress)}%</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex -space-x-2">
                           {[1, 2, 3].map(i => (
                             <img key={i} src={`https://picsum.photos/28/28?random=${i + board.id.length}`} className="w-7 h-7 rounded-full border-2 border-white" alt="Team" />
                           ))}
                        </div>
                      </td>
                      <td className="p-8 text-right font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Engineering
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsCreateModalOpen(false)}
          onComplete={(board) => {
            onAddBoard(board);
            setIsCreateModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ProjectPortfolio;
