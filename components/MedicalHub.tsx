
import React, { useState } from 'react';
import { STATUS_COLORS } from '../constants';
import { PatientRecord } from '../types';

const MOCK_PATIENTS: PatientRecord[] = [
  { id: 'p1', name: 'John Doe', type: 'Clinical Checkup', vitals: '72 bpm / 120/80', status: 'Done', owner: 'Dr. Neural' },
  { id: 'p2', name: 'Jane Smith', type: 'Metabolic Log', vitals: '68 bpm / 115/75', status: 'Working on it', owner: 'Architect v4' },
  { id: 'p3', name: 'Robert C.', type: 'Neural Sync', vitals: '82 bpm / 135/90', status: 'Critical', owner: 'Dr. Neural' },
];

const MedicalHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'records' | 'protocols' | 'graphs'>('records');

  const renderSparkline = (data: number[], color: string) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((d, i) => `${(i / (data.length - 1)) * 300},${100 - ((d - min) / range) * 80}`).join(' ');
    return (
      <svg className="w-full h-32" viewBox="0 0 300 100">
        <polyline fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={points} className="animate-dash" />
      </svg>
    );
  };

  const mockVitals = [
    { date: 'Feb 1', hr: 72, glucose: 95 },
    { date: 'Feb 5', hr: 75, glucose: 98 },
    { date: 'Feb 10', hr: 68, glucose: 92 },
    { date: 'Feb 15', hr: 71, glucose: 96 },
    { date: 'Feb 20', hr: 74, glucose: 94 },
    { date: 'Feb 25', hr: 70, glucose: 95 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8faff] text-slate-900 overflow-hidden font-sans">
      <div className="p-10 border-b border-slate-200 bg-white shrink-0 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center space-x-6">
           <div className="w-16 h-16 bg-rose-600 rounded-[1.8rem] flex items-center justify-center text-4xl shadow-2xl shadow-rose-200 text-white">🏥</div>
           <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Medical Hub</h2>
              <p className="text-slate-500 font-medium mt-1">Autonomous Biometric & Clinical Management</p>
           </div>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[1.8rem] border border-slate-200/50 shadow-inner">
           {(['records', 'protocols', 'graphs'] as const).map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab)} className={`px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white shadow-xl text-rose-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab === 'records' ? '📋 Records' : tab === 'protocols' ? '🔬 Protocols' : '📈 Graphs & Data'}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 pattern-grid-light relative scrollbar-hide bg-slate-50/30">
         <div className="max-w-7xl mx-auto space-y-12 pb-40">
            {activeTab === 'records' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                 <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                             <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                             <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol</th>
                             <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Vitals</th>
                             <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                             <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Attending</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {MOCK_PATIENTS.map((p) => (
                            <tr key={p.id} className="hover:bg-rose-50/20 transition-colors cursor-pointer group">
                               <td className="p-8 text-xl font-black tracking-tight">{p.name}</td>
                               <td className="p-8 text-sm font-bold text-slate-500 uppercase tracking-tighter">{p.type}</td>
                               <td className="p-8 text-center text-sm font-mono font-black text-rose-500">{p.vitals}</td>
                               <td className="p-8 text-center"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase text-white shadow-lg ${STATUS_COLORS[p.status] || 'bg-slate-400'}`}>{p.status}</span></td>
                               <td className="p-8 text-right text-[10px] font-black uppercase text-slate-400">{p.owner}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}

            {activeTab === 'protocols' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in">
                 {[
                   { label: 'Blood Panel Logic', icon: '🩸', color: 'bg-rose-50 text-rose-600' },
                   { label: 'Rhythm Sync (HRV)', icon: '💓', color: 'bg-indigo-50 text-indigo-600' },
                   { label: 'Pharmaceutical Map', icon: '💊', color: 'bg-emerald-50 text-emerald-600' },
                   { label: 'Sleep Phase Analysis', icon: '🌙', color: 'bg-blue-50 text-blue-600' },
                 ].map(proto => (
                   <div key={proto.label} className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group cursor-pointer flex flex-col space-y-8">
                      <div className={`w-20 h-20 ${proto.color} rounded-[2rem] flex items-center justify-center text-5xl group-hover:scale-110 transition-transform`}>{proto.icon}</div>
                      <h4 className="text-3xl font-black text-slate-900 tracking-tight">{proto.label}</h4>
                      <button className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 transition-all shadow-lg">Activate Protocol</button>
                   </div>
                 ))}
              </div>
            )}

            {activeTab === 'graphs' && (
              <div className="space-y-12 animate-in zoom-in-95">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-white p-16 rounded-[5rem] border border-slate-200 shadow-xl space-y-12">
                       <div className="flex justify-between items-center">
                          <h4 className="text-3xl font-black text-slate-900 uppercase">Heart Rate</h4>
                          <span className="text-6xl font-black text-rose-500">72</span>
                       </div>
                       {renderSparkline(mockVitals.map(v => v.hr), '#f43f5e')}
                    </div>
                    <div className="bg-white p-16 rounded-[5rem] border border-slate-200 shadow-xl space-y-12">
                       <div className="flex justify-between items-center">
                          <h4 className="text-3xl font-black text-slate-900 uppercase">Blood Glucose</h4>
                          <span className="text-6xl font-black text-emerald-500">95</span>
                       </div>
                       {renderSparkline(mockVitals.map(v => v.glucose), '#10b981')}
                    </div>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default MedicalHub;
