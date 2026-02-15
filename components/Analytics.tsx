
import React from 'react';
import { Board } from '../types';

interface AnalyticsProps {
  boards: Board[];
}

const Analytics: React.FC<AnalyticsProps> = ({ boards }) => {
  // Simple mock data for charts
  const revenueData = [12, 19, 3, 5, 2, 3, 10, 15, 25, 20, 30, 45];
  const engagementData = [65, 59, 80, 81, 56, 55, 40, 70, 90, 85, 95, 100];

  const renderSVGLine = (data: number[], color: string, height: number) => {
    const max = Math.max(...data);
    const step = 800 / (data.length - 1);
    const points = data.map((d, i) => `${i * step},${height - (d / max) * height}`).join(' ');
    return (
      <svg className="w-full h-full" viewBox={`0 0 800 ${height}`} preserveAspectRatio="none">
        <polyline fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={points} className="animate-dash" />
      </svg>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8faff] p-12 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Analytics Pulse</h2>
            <p className="text-slate-500 font-medium text-lg">Deep telemetry for your autonomous empire.</p>
          </div>
          <div className="flex space-x-3">
             <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all">Export JSON</button>
             <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">Live View</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: 'Total Revenue', value: '$124,500', trend: '+12%', color: 'text-emerald-500' },
             { label: 'Active Users', value: '4,231', trend: '+5.4%', color: 'text-indigo-500' },
             { label: 'Render Efficiency', value: '98.2%', trend: '+0.4%', color: 'text-purple-500' },
             { label: 'Task Completion', value: '84%', trend: '-2%', color: 'text-rose-500' },
           ].map(stat => (
             <div key={stat.label} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex justify-between items-end">
                   <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                   <span className={`text-xs font-black ${stat.color}`}>{stat.trend}</span>
                </div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-sm space-y-8 relative overflow-hidden group">
              <div className="flex justify-between items-center relative z-10">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Stream</h3>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 12 Months</span>
              </div>
              <div className="h-64 w-full relative z-10 pt-4">
                 {renderSVGLine(revenueData, '#6366f1', 256)}
              </div>
              <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                 <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
              </div>
           </div>

           <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-sm space-y-8 relative overflow-hidden group">
              <div className="flex justify-between items-center relative z-10">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">User Engagement</h3>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retention Rate</span>
              </div>
              <div className="h-64 w-full relative z-10 pt-4">
                 {renderSVGLine(engagementData, '#10b981', 256)}
              </div>
              <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                 <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
              </div>
           </div>
        </div>

        <div className="bg-slate-900 rounded-[4rem] p-16 text-white flex justify-between items-center relative overflow-hidden shadow-2xl">
           <div className="absolute inset-0 pattern-grid opacity-10"></div>
           <div className="space-y-6 relative">
              <div className="inline-flex items-center px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                 <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
                 <span className="text-[9px] font-black uppercase tracking-widest">Neural Insights</span>
              </div>
              <h3 className="text-4xl font-black tracking-tighter">Gemini Optimization Engine</h3>
              <p className="text-slate-400 font-medium text-lg max-w-xl leading-relaxed">AI analysis indicates your funnel conversion is up 22% this week. Suggested workflow improvement: Automated lead follow-up after Webinar show-ups.</p>
              <button className="px-8 py-3.5 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50 transition-all shadow-xl active:scale-95">Optimize Funnel Now</button>
           </div>
           <div className="relative">
              <div className="w-48 h-48 rounded-full border-[16px] border-indigo-500/10 flex items-center justify-center relative">
                 <div className="absolute inset-0 rounded-full border-[16px] border-indigo-500 border-t-transparent animate-spin-slow"></div>
                 <span className="text-5xl font-black italic">A+</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
