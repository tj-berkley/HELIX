
import React, { useState, useEffect } from 'react';
import { Campaign, Status } from '../types';
import { generateCampaignFromPrompt } from '../services/geminiService';

const CAMPAIGN_TEMPLATES = [
  { id: 't1', name: 'Product Launch Blitz', channel: 'Multi-Channel', status: 'Draft' as Status, reach: 0, conversion: 0, startDate: '2025-06-01', summary: 'High intensity launch sequence across Email, Social and SMS.' },
  { id: 't2', name: 'Voice Concierge Onboarding', channel: 'Phone/SMS', status: 'Draft' as Status, reach: 0, conversion: 0, startDate: '2025-07-01', summary: 'Onboard VIP customers via AI-led phone calls and personalized SMS.' },
  { id: 't3', name: 'Newsletter Re-engagement', channel: 'Email', status: 'Draft' as Status, reach: 0, conversion: 0, startDate: '2025-05-15', summary: 'Re-ignite inactive lists with personalized value-driven drip feeds.' },
];

const CampaignManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'templates'>('active');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('OMNI_CAMPAIGNS_V3');
    if (saved) setCampaigns(JSON.parse(saved));
    else setCampaigns([{ id: 'c1', name: 'Spring Reveal', channel: 'Social', status: 'Active', reach: 45000, conversion: 2.4, startDate: '2025-03-01' }]);
  }, []);

  const save = (updated: Campaign[]) => {
    setCampaigns(updated);
    localStorage.setItem('OMNI_CAMPAIGNS_V3', JSON.stringify(updated));
  };

  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const data = await generateCampaignFromPrompt(aiPrompt);
      const newCamps = data.map((d: any, i: number) => ({
        id: `c-ai-${Date.now()}-${i}`,
        name: d.name,
        channel: d.channel,
        status: 'Draft' as Status,
        reach: 0,
        conversion: 0,
        startDate: d.startDate || new Date().toISOString().split('T')[0]
      }));
      save([...newCamps, ...campaigns]);
      setAiPrompt('');
      setActiveTab('active');
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const installTemplate = (tpl: any) => {
    save([{ ...tpl, id: `c-t-${Date.now()}` }, ...campaigns]);
    setActiveTab('active');
  };

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-slate-50 animate-in fade-in">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Campaign Matrix</h2>
            <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
               {['active', 'templates'].map(t => (
                 <button key={t} onClick={() => setActiveTab(t as any)} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{t === 'active' ? 'Live' : 'Templates'}</button>
               ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative">
                <input 
                  placeholder="Ask Gemini to design a campaign..." 
                  className="w-96 pl-6 pr-14 py-4 bg-white border-2 border-transparent focus:border-indigo-500 rounded-[1.8rem] text-xs font-bold shadow-xl outline-none transition-all"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                />
                <button onClick={handleAskAI} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90">
                   {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>✨</span>}
                </button>
             </div>
             <button className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all active:scale-95">➕ New Strategy</button>
          </div>
        </div>

        {activeTab === 'active' ? (
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifier</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Channel</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">State</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map(c => (
                  <tr key={c.id} className="hover:bg-indigo-50/20 transition-all group cursor-pointer">
                    <td className="p-8 font-black text-slate-900 text-lg tracking-tight">{c.name}</td>
                    <td className="p-8 font-bold text-slate-500 uppercase text-xs">{c.channel}</td>
                    <td className="p-8"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${c.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{c.status}</span></td>
                    <td className="p-8 font-black text-indigo-600 text-right">{(c.reach/1000).toFixed(1)}k Reach</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {CAMPAIGN_TEMPLATES.map(t => (
               <div key={t.id} className="bg-white border-2 border-slate-100 rounded-[3rem] p-12 space-y-8 hover:shadow-2xl transition-all group flex flex-col">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">📋</div>
                  <div className="flex-1">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t.name}</h3>
                     <p className="text-xs text-slate-400 font-medium leading-relaxed mt-4 italic">"{t.summary}"</p>
                  </div>
                  <button onClick={() => installTemplate(t)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 shadow-xl">Apply Strategy</button>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignManager;
