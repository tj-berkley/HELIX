
import React, { useState, useEffect } from 'react';
import { Campaign, Status } from '../types';
import { generateCampaignFromPrompt } from '../services/geminiService';
import { Icons } from '../constants';

interface ChannelDef {
  id: string;
  name: string;
  icon: string;
  isCustom: boolean;
}

const DEFAULT_CHANNELS: ChannelDef[] = [
  { id: 'ch-1', name: 'Email', icon: '📧', isCustom: false },
  { id: 'ch-2', name: 'SMS', icon: '📱', isCustom: false },
  { id: 'ch-3', name: 'Social', icon: '🌐', isCustom: false },
  { id: 'ch-4', name: 'Ads', icon: '💰', isCustom: false },
  { id: 'ch-5', name: 'Blog', icon: '✍️', isCustom: false },
];

const CAMPAIGN_TEMPLATES = [
  { id: 't1', name: 'Product Launch Blitz', channel: 'Multi-Channel', status: 'Draft' as Status, reach: 0, conversion: 0, startDate: '2025-06-01', summary: 'High intensity launch sequence across Email, Social and SMS.' },
  { id: 't2', name: 'Voice Concierge Onboarding', channel: 'Phone/SMS', status: 'Draft' as Status, reach: 0, conversion: 0, startDate: '2025-07-01', summary: 'Onboard VIP customers via AI-led phone calls and personalized SMS.' },
  { id: 't3', name: 'Newsletter Re-engagement', channel: 'Email', status: 'Draft' as Status, reach: 0, conversion: 0, startDate: '2025-05-15', summary: 'Re-ignite inactive lists with personalized value-driven drip feeds.' },
  { id: 't4', name: 'Flash Sale funnel', channel: 'SMS/Site', status: 'Draft' as Status, reach: 0, conversion: 0, startDate: '2025-08-01', summary: 'High-converting sales funnel with automated scarcity alerts.' },
];

const CampaignManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'templates' | 'channels'>('active');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [channels, setChannels] = useState<ChannelDef[]>(() => {
    const saved = localStorage.getItem('OMNI_CHANNELS_V1');
    return saved ? JSON.parse(saved) : DEFAULT_CHANNELS;
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Create Campaign Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', channel: 'Email', startDate: new Date().toISOString().split('T')[0] });

  // Add Channel Form State
  const [newChannel, setNewChannel] = useState({ name: '', icon: '📡' });

  useEffect(() => {
    const saved = localStorage.getItem('OMNI_CAMPAIGNS_V3');
    if (saved) setCampaigns(JSON.parse(saved));
    else setCampaigns([{ id: 'c1', name: 'Spring Reveal', channel: 'Social', status: 'Active', reach: 45000, conversion: 2.4, startDate: '2025-03-01' }]);
  }, []);

  useEffect(() => {
    localStorage.setItem('OMNI_CHANNELS_V1', JSON.stringify(channels));
  }, [channels]);

  const saveCampaigns = (updated: Campaign[]) => {
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
      saveCampaigns([...newCamps, ...campaigns]);
      setAiPrompt('');
      setActiveTab('active');
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const handleCreateManualCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name.trim()) return;
    const camp: Campaign = {
      id: `c-${Date.now()}`,
      name: newCampaign.name,
      channel: newCampaign.channel,
      status: 'Draft',
      reach: 0,
      conversion: 0,
      startDate: newCampaign.startDate
    };
    saveCampaigns([camp, ...campaigns]);
    setIsCreateModalOpen(false);
    setNewCampaign({ name: '', channel: 'Email', startDate: new Date().toISOString().split('T')[0] });
    setActiveTab('active');
  };

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannel.name.trim()) return;
    const chan: ChannelDef = {
      id: `ch-${Date.now()}`,
      name: newChannel.name,
      icon: newChannel.icon,
      isCustom: true
    };
    setChannels([...channels, chan]);
    setNewChannel({ name: '', icon: '📡' });
  };

  const removeChannel = (id: string) => {
    setChannels(channels.filter(c => c.id !== id || !c.isCustom));
  };

  const installTemplate = (tpl: any) => {
    saveCampaigns([{ ...tpl, id: `c-t-${Date.now()}` }, ...campaigns]);
    setActiveTab('active');
  };

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-slate-50 animate-in fade-in">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Campaign Matrix</h2>
            <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
               {(['active', 'templates', 'channels'] as const).map(t => (
                 <button 
                  key={t} 
                  onClick={() => setActiveTab(t)} 
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {t === 'active' ? 'Live' : t === 'templates' ? 'Templates' : 'Channel Studio'}
                 </button>
               ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative">
                <input 
                  placeholder="Ask Gemini to build a campaign..." 
                  className="w-96 pl-6 pr-14 py-4 bg-white border-2 border-transparent focus:border-indigo-500 rounded-[1.8rem] text-xs font-bold shadow-xl outline-none transition-all"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                />
                <button onClick={handleAskAI} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                   {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>✨</span>}
                </button>
             </div>
             <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all active:scale-95"
             >
               ➕ New Strategy
             </button>
          </div>
        </div>

        {activeTab === 'active' && (
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
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
                    <td className="p-8">
                       <div className="flex items-center space-x-2">
                          <span className="text-xl">{channels.find(ch => ch.name === c.channel)?.icon || '📡'}</span>
                          <span className="font-bold text-slate-500 uppercase text-xs">{c.channel}</span>
                       </div>
                    </td>
                    <td className="p-8"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${c.status === 'Active' ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{c.status}</span></td>
                    <td className="p-8 font-black text-indigo-600 text-right">{(c.reach/1000).toFixed(1)}k Reach</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {campaigns.length === 0 && (
              <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">No active campaigns in this sector.</div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in">
             {CAMPAIGN_TEMPLATES.map(t => (
               <div key={t.id} className="bg-white border-2 border-slate-100 rounded-[3rem] p-12 space-y-8 hover:shadow-2xl transition-all group flex flex-col hover:border-indigo-500">
                  <div className="flex justify-between items-start">
                     <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">📋</div>
                     <span className="text-[10px] font-black bg-indigo-600 text-white px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Premium Strategy</span>
                  </div>
                  <div className="flex-1">
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t.name}</h3>
                     <p className="text-xs text-slate-400 font-medium leading-relaxed mt-4 italic">"{t.summary}"</p>
                  </div>
                  <button onClick={() => installTemplate(t)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 shadow-xl transition-all">Apply Strategy</button>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="space-y-12 animate-in fade-in">
             <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-2xl space-y-10">
                <div className="flex justify-between items-center">
                   <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">Channel Studio</h3>
                      <p className="text-slate-500 font-medium mt-1">Configure the delivery paths for your autonomous marketing engine.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {channels.map(chan => (
                     <div key={chan.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col items-center space-y-4 relative group">
                        <div className="text-4xl bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all">{chan.icon}</div>
                        <span className="font-black text-slate-800 uppercase text-[10px] tracking-widest">{chan.name}</span>
                        {chan.isCustom && (
                          <button 
                            onClick={() => removeChannel(chan.id)}
                            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                     </div>
                   ))}
                   
                   <form onSubmit={handleAddChannel} className="p-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col space-y-4 hover:border-indigo-400 transition-all bg-white/50">
                      <div className="flex space-x-2">
                         <input 
                           className="w-12 h-12 text-center bg-white border border-slate-100 rounded-xl text-xl shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none"
                           value={newChannel.icon}
                           onChange={e => setNewChannel({...newChannel, icon: e.target.value})}
                         />
                         <input 
                           placeholder="Channel Name"
                           className="flex-1 bg-white border border-slate-100 rounded-xl px-4 text-xs font-bold shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none"
                           value={newChannel.name}
                           onChange={e => setNewChannel({...newChannel, name: e.target.value})}
                         />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all"
                      >
                         Define Custom Path
                      </button>
                   </form>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Manual Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                       <Icons.Plus />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900">New Strategy</h3>
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Manual Campaign Entry</p>
                    </div>
                 </div>
                 <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              
              <form onSubmit={handleCreateManualCampaign} className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Campaign Identifier</label>
                    <input 
                      autoFocus
                      placeholder="e.g. Q1 Global Growth"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold shadow-inner outline-none transition-all"
                      value={newCampaign.name}
                      onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Active Channel</label>
                    <div className="grid grid-cols-2 gap-3">
                       {channels.map(ch => (
                         <button 
                           key={ch.id}
                           type="button"
                           onClick={() => setNewCampaign({...newCampaign, channel: ch.name})}
                           className={`p-4 rounded-2xl border-2 transition-all flex items-center space-x-3 ${newCampaign.channel === ch.name ? 'bg-indigo-50 border-indigo-600 shadow-md' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                         >
                            <span className="text-xl">{ch.icon}</span>
                            <span className="text-[10px] font-black uppercase text-slate-700">{ch.name}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Launch Date</label>
                    <input 
                      type="date"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold shadow-inner outline-none transition-all"
                      value={newCampaign.startDate}
                      onChange={e => setNewCampaign({...newCampaign, startDate: e.target.value})}
                    />
                 </div>

                 <button 
                  type="submit" 
                  className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all transform active:scale-95 mt-4"
                 >
                    Initialize Strategy
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;
