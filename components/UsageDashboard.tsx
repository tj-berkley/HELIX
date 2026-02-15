
import React, { useState, useEffect } from 'react';

interface UsageMetric {
  provider: string;
  label: string;
  usage: number;
  limit: number;
  unit: string;
  cost: number;
  color: string;
}

const UsageDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<UsageMetric[]>([
    { provider: 'Google', label: 'Gemini 3 Pro', usage: 124500, limit: 1000000, unit: 'tokens', cost: 12.45, color: 'bg-indigo-500' },
    { provider: 'ElevenLabs', label: 'Neural TTS', usage: 15400, limit: 50000, unit: 'chars', cost: 5.20, color: 'bg-orange-500' },
    { provider: 'Twilio', label: 'Programmable SMS', usage: 840, limit: 5000, unit: 'msgs', cost: 24.12, color: 'bg-rose-500' },
    { provider: 'Veo', label: 'Neural Video Gen', usage: 12, limit: 100, unit: 'renders', cost: 36.00, color: 'bg-purple-600' },
    { provider: 'Telnyx', label: 'Carrier Routing', usage: 125, limit: 1000, unit: 'mins', cost: 3.15, color: 'bg-blue-600' },
    { provider: 'Vonage', label: 'Video API', usage: 450, limit: 2000, unit: 'mins', cost: 8.90, color: 'bg-amber-500' },
  ]);

  const totalSpent = metrics.reduce((acc, m) => acc + m.cost, 0);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Usage & Billing</h2>
            <p className="text-lg text-slate-500 font-medium">Real-time telemetry for neural processing and communications.</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Monthly Spend</p>
             <p className="text-4xl font-black text-indigo-600">${totalSpent.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {metrics.map(metric => {
             const progress = (metric.usage / metric.limit) * 100;
             return (
               <div key={metric.provider + metric.label} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h3 className="text-lg font-black text-slate-900">{metric.label}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{metric.provider}</p>
                     </div>
                     <span className="text-sm font-black text-slate-900">${metric.cost.toFixed(2)}</span>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Resource Consumption</span>
                        <span className="text-xs font-black text-slate-900">{Math.round(progress)}%</span>
                     </div>
                     <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full ${metric.color} transition-all duration-1000 ease-out shadow-lg`} style={{ width: `${progress}%` }}></div>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                        <span>{metric.usage.toLocaleString()} {metric.unit}</span>
                        <span>{metric.limit.toLocaleString()} Limit</span>
                     </div>
                  </div>

                  <div className="pt-8 flex space-x-3">
                     <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all">Recharge</button>
                     <button className="flex-1 py-3 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all">Report</button>
                  </div>
               </div>
             );
           })}
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex justify-between items-center shadow-2xl relative overflow-hidden group">
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
           <div className="space-y-4 relative">
              <h4 className="text-2xl font-black">Neural Efficiency Score</h4>
              <p className="text-slate-400 max-w-md font-medium leading-relaxed">Your account is performing in the top 5% of efficiency. Automated workflows are saving approximately 142 human hours per month.</p>
              <div className="flex space-x-6">
                 <div className="text-center">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Automation ROI</p>
                    <p className="text-2xl font-black">12.4x</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Avg Latency</p>
                    <p className="text-2xl font-black">142ms</p>
                 </div>
              </div>
           </div>
           <div className="relative">
              <div className="w-32 h-32 rounded-full border-[12px] border-indigo-600/30 flex items-center justify-center relative">
                 <div className="absolute inset-0 rounded-full border-[12px] border-indigo-500 border-t-transparent animate-spin-slow"></div>
                 <span className="text-3xl font-black italic">A+</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UsageDashboard;
