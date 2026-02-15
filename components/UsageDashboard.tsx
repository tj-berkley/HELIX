
import React, { useState, useMemo } from 'react';

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
  const [markupPercent, setMarkupPercent] = useState(25);
  const [isMarkupEnabled, setIsMarkupEnabled] = useState(true);
  const [isOwnerMode, setIsOwnerMode] = useState(true); // Conceptually restricted to owner

  const [metrics, setMetrics] = useState<UsageMetric[]>([
    { provider: 'Google', label: 'Gemini 3 Pro', usage: 124500, limit: 1000000, unit: 'tokens', cost: 12.45, color: 'bg-indigo-500' },
    { provider: 'ElevenLabs', label: 'Neural TTS', usage: 15400, limit: 50000, unit: 'chars', cost: 5.20, color: 'bg-orange-500' },
    { provider: 'Twilio', label: 'Programmable SMS', usage: 840, limit: 5000, unit: 'msgs', cost: 24.12, color: 'bg-rose-500' },
    { provider: 'Veo', label: 'Neural Video Gen', usage: 12, limit: 100, unit: 'renders', cost: 36.00, color: 'bg-purple-600' },
    { provider: 'Telnyx', label: 'Carrier Routing', usage: 125, limit: 1000, unit: 'mins', cost: 3.15, color: 'bg-blue-600' },
    { provider: 'Vonage', label: 'Video API', usage: 450, limit: 2000, unit: 'mins', cost: 8.90, color: 'bg-amber-500' },
  ]);

  const financialSummary = useMemo(() => {
    const totalBaseSpend = metrics.reduce((acc, m) => acc + m.cost, 0);
    const totalUserRevenue = isMarkupEnabled 
      ? metrics.reduce((acc, m) => acc + (m.cost * (1 + markupPercent / 100)), 0)
      : totalBaseSpend;
    const totalProfit = totalUserRevenue - totalBaseSpend;

    return {
      totalBaseSpend,
      totalUserRevenue,
      totalProfit
    };
  }, [metrics, markupPercent, isMarkupEnabled]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-12 pb-32">
        
        {/* Header & Owner Toggle */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-10">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Usage & Billing</h2>
            <p className="text-lg text-slate-500 font-medium">Real-time telemetry for neural processing and communications.</p>
          </div>
          
          {isOwnerMode && (
            <div className="bg-indigo-600/5 border border-indigo-100 p-6 rounded-[2.5rem] flex items-center space-x-8 shadow-sm">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Platform Markup</span>
                  <div className="flex items-center space-x-3">
                     <span className="text-2xl font-black text-slate-900">{markupPercent}%</span>
                     <input 
                        type="range" 
                        min="0" 
                        max="200" 
                        value={markupPercent} 
                        onChange={(e) => setMarkupPercent(parseInt(e.target.value))}
                        className="w-32 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                     />
                  </div>
               </div>
               <div className="h-10 w-px bg-slate-200"></div>
               <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isMarkupEnabled} onChange={() => setIsMarkupEnabled(!isMarkupEnabled)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
               </div>
            </div>
          )}
        </div>

        {/* Global Financial Metrics (Owner Only) */}
        {isOwnerMode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gross User Revenue</p>
                <p className="text-5xl font-black text-slate-900">${financialSummary.totalUserRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase italic">Retail price billed to platform users</p>
             </div>
             <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Operational Spend</p>
                <p className="text-5xl font-black text-slate-500">${financialSummary.totalBaseSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase italic">Direct cost from API providers</p>
             </div>
             <div className="bg-indigo-600 rounded-[3rem] p-10 text-white space-y-2 shadow-2xl shadow-indigo-900/20">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">Net Desired Profit</p>
                <p className="text-5xl font-black text-white">${financialSummary.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <div className="flex items-center space-x-2 mt-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                   <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-100">Margin Optimization: {markupPercent}%</span>
                </div>
             </div>
          </div>
        )}

        {/* Individual Usage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {metrics.map(metric => {
             const progress = (metric.usage / metric.limit) * 100;
             const retailPrice = metric.cost * (1 + markupPercent / 100);
             const cardProfit = retailPrice - metric.cost;

             return (
               <div key={metric.provider + metric.label} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h3 className="text-lg font-black text-slate-900">{metric.label}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{metric.provider}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">${(isMarkupEnabled ? retailPrice : metric.cost).toFixed(2)}</p>
                        {isMarkupEnabled && (
                           <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Profit: +${cardProfit.toFixed(2)}</p>
                        )}
                     </div>
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

                  {isMarkupEnabled && (
                    <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Operational Cost</span>
                          <span className="text-[10px] font-mono text-slate-600">${metric.cost.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Applied Platform Fee</span>
                          <span className="text-[10px] font-mono text-indigo-600">+{(retailPrice - metric.cost).toFixed(2)}</span>
                       </div>
                    </div>
                  )}

                  <div className="pt-8 flex space-x-3 mt-auto">
                     <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all">Adjust Plan</button>
                     <button className="flex-1 py-3 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all">Details</button>
                  </div>
               </div>
             );
           })}
        </div>

        {/* Neural Score Section */}
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
