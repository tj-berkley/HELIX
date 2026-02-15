
import React, { useState, useEffect } from 'react';
import { Campaign, Status } from '../types';

interface ChannelDef {
  id: string;
  name: string;
  icon: string;
  isSystem?: boolean;
}

const SYSTEM_CHANNELS: ChannelDef[] = [
  { id: 'sys-email', name: 'Email', icon: '📧', isSystem: true },
  { id: 'sys-text', name: 'Text', icon: '📱', isSystem: true },
  { id: 'sys-social', name: 'Social', icon: '🌐', isSystem: true },
  { id: 'sys-blog', name: 'Blog', icon: '✍️', isSystem: true },
  { id: 'sys-ads', name: 'Ads', icon: '💰', isSystem: true },
];

const INITIAL_MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Spring Product Launch', channel: 'Email', status: 'Active', reach: 45000, conversion: 2.4, startDate: '2025-03-01' },
  { id: '2', name: 'Flash Sale SMS', channel: 'Text', status: 'Draft', reach: 0, conversion: 0, startDate: '2025-03-15' },
  { id: '3', name: 'Q1 Review Video', channel: 'Social', status: 'Active', reach: 120000, conversion: 1.1, startDate: '2025-02-10' },
  { id: '4', name: 'SEO Optimization Push', channel: 'Blog', status: 'Active', reach: 8500, conversion: 4.8, startDate: '2025-01-20' },
  { id: '5', name: 'Black Friday Google Ads', channel: 'Ads', status: 'Paused', reach: 250000, conversion: 0.8, startDate: '2025-11-20' },
];

const EMOJI_POOL = ['📢', '💬', '🚀', '🎙️', '📻', '📞', '📫', '💎', '📦', '🖼️', '🎨', '🎮', '💡', '🎵', '📺', '📰', '🛍️', '🎫', '🎥', '🎯', '⚡', '🏗️', '💼', '🛒', '🧬'];

const CampaignManager: React.FC = () => {
  const [channels, setChannels] = useState<ChannelDef[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_MOCK_CAMPAIGNS);
  
  // UI Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'channel' | 'campaign'>('channel');
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);

  // Form State: Channel
  const [chanName, setChanName] = useState('');
  const [chanIcon, setChanIcon] = useState('📢');

  // Form State: Campaign
  const [campName, setCampName] = useState('');
  const [campChannel, setCampChannel] = useState(SYSTEM_CHANNELS[0].name);
  const [campDate, setCampDate] = useState('');

  // Initialization & Persistence
  useEffect(() => {
    const stored = localStorage.getItem('OMNI_CHANNELS_V2');
    if (stored) {
      setChannels(JSON.parse(stored));
    } else {
      setChannels(SYSTEM_CHANNELS);
    }
  }, []);

  const saveChannels = (updated: ChannelDef[]) => {
    setChannels(updated);
    localStorage.setItem('OMNI_CHANNELS_V2', JSON.stringify(updated));
  };

  const openChannelModal = (id?: string) => {
    setModalType('channel');
    if (id) {
      const target = channels.find(c => c.id === id);
      if (target) {
        setEditingChannelId(id);
        setChanName(target.name);
        setChanIcon(target.icon);
      }
    } else {
      setEditingChannelId(null);
      setChanName('');
      setChanIcon('📢');
    }
    setIsModalOpen(true);
  };

  const handleSaveChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chanName.trim()) return;

    if (editingChannelId) {
      const oldName = channels.find(c => c.id === editingChannelId)?.name;
      const updated = channels.map(c => 
        c.id === editingChannelId ? { ...c, name: chanName.trim(), icon: chanIcon } : c
      );
      saveChannels(updated);
      
      // If name changed, update all existing campaigns using that name
      if (oldName && oldName !== chanName.trim()) {
        setCampaigns(prev => prev.map(camp => 
          camp.channel === oldName ? { ...camp, channel: chanName.trim() } : camp
        ));
      }
    } else {
      const newChan: ChannelDef = {
        id: `chan-${Date.now()}`,
        name: chanName.trim(),
        icon: chanIcon,
        isSystem: false
      };
      if (channels.some(c => c.name.toLowerCase() === newChan.name.toLowerCase())) {
        alert("A channel with this name already exists.");
        return;
      }
      saveChannels([...channels, newChan]);
    }
    setIsModalOpen(false);
  };

  const handleRemoveChannel = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const target = channels.find(c => c.id === id);
    if (!target) return;
    if (target.isSystem) return alert("System channels cannot be removed.");
    
    if (confirm(`Are you sure you want to delete the "${target.name}" channel?`)) {
      saveChannels(channels.filter(c => c.id !== id));
    }
  };

  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName.trim()) return;
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: campName.trim(),
      channel: campChannel,
      status: 'Draft',
      reach: 0,
      conversion: 0,
      startDate: campDate || new Date().toISOString().split('T')[0]
    };
    setCampaigns(prev => [newCamp, ...prev]);
    setCampName('');
    setCampDate('');
    setIsModalOpen(false);
  };

  const getChannelIcon = (channelName: string) => {
    const chan = channels.find(c => c.name === channelName);
    return chan ? chan.icon : '📢';
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 animate-in fade-in">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Campaign Manager</h2>
            <p className="text-slate-500 font-medium text-lg mt-1">Define your marketing avenues and track global performance.</p>
          </div>
          <div className="flex space-x-3">
             <button 
               onClick={() => openChannelModal()}
               className="px-6 py-3 border-2 border-slate-200 bg-white rounded-2xl text-sm font-black shadow-sm hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center group"
             >
               <span className="mr-2 group-hover:scale-125 transition-transform">➕</span> Define Channel
             </button>
             <button 
                onClick={() => { setModalType('campaign'); setIsModalOpen(true); }}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all transform active:scale-95"
              >
                Initiate Campaign
              </button>
          </div>
        </div>

        {/* Channels Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Marketing Channels</h3>
             <span className="text-[10px] font-bold text-slate-400">{channels.length} Total</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {channels.map(ch => (
              <div 
                key={ch.id} 
                onClick={() => openChannelModal(ch.id)}
                className="bg-white p-6 rounded-[2.5rem] border-2 border-transparent shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative cursor-pointer"
              >
                 <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{ch.icon}</div>
                 <h4 className="text-sm font-black text-slate-800 truncate">{ch.name}</h4>
                 <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xl font-black text-indigo-600">
                      {campaigns.filter(c => c.channel === ch.name).length}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Campaigns</span>
                 </div>

                 {/* Controls Overlay */}
                 <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-1.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    {!ch.isSystem && (
                      <button 
                        onClick={(e) => handleRemoveChannel(e, ch.id)}
                        className="p-1.5 bg-rose-50 text-rose-300 hover:text-rose-600 rounded-lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                 </div>
              </div>
            ))}
            <button 
              onClick={() => openChannelModal()}
              className="p-6 rounded-[2.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-3 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all group"
            >
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                 <span className="text-2xl font-black">+</span>
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest">New Channel</span>
            </button>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Campaign Performance Matrix</h3>
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Strategy Name</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Distribution Channel</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Current State</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Engagement Reach</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Conversion KPI</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Deployment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map(c => (
                  <tr key={c.id} className="hover:bg-indigo-50/20 transition-colors cursor-pointer group">
                    <td className="p-6 font-black text-slate-900">{c.name}</td>
                    <td className="p-6">
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="text-2xl">{getChannelIcon(c.channel)}</span>
                        <span className="font-bold text-slate-600">{c.channel}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase border shadow-sm ${c.status === 'Active' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-6 text-sm text-slate-900 font-black">{(c.reach / 1000).toFixed(1)}k</td>
                    <td className="p-6">
                       <div className="flex items-center space-x-4">
                          <div className="flex-1 h-2 w-24 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                             <div className={`h-full bg-indigo-500 transition-all duration-1000 ${c.status === 'Active' ? 'opacity-100' : 'opacity-30'}`} style={{ width: `${c.conversion * 10}%` }}></div>
                          </div>
                          <span className="text-xs font-black text-slate-600">{c.conversion}%</span>
                       </div>
                    </td>
                    <td className="p-6 text-sm text-slate-400 font-bold">{c.startDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Global Contextual Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                  {modalType === 'channel' ? (editingChannelId ? 'Edit Channel' : 'Define Channel') : 'Initiate Campaign'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Marketing Architecture Studio</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-10">
              {modalType === 'channel' ? (
                <form onSubmit={handleSaveChannel} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Display Identity</label>
                    <input 
                      type="text" 
                      autoFocus
                      placeholder="e.g. Influencer, Twitch, LinkedIn Ads"
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] focus:bg-white focus:border-indigo-500 outline-none transition-all font-black text-xl text-slate-900 shadow-inner"
                      value={chanName}
                      onChange={(e) => setChanName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Channel Visual Avatar</label>
                    <div className="grid grid-cols-5 gap-3 p-4 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner max-h-60 overflow-y-auto scrollbar-hide">
                      {EMOJI_POOL.map(emoji => (
                        <button 
                          key={emoji}
                          type="button"
                          onClick={() => setChanIcon(emoji)}
                          className={`p-4 text-3xl rounded-2xl transition-all transform hover:scale-110 ${chanIcon === emoji ? 'bg-indigo-600 shadow-2xl scale-110' : 'hover:bg-white'}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 flex space-x-4">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
                    >
                      Discard
                    </button>
                    <button 
                      type="submit"
                      disabled={!chanName.trim()}
                      className="flex-[2] py-5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-900/20 transition-all transform active:scale-95 disabled:opacity-50"
                    >
                      {editingChannelId ? 'Save Modifications' : 'Commit Channel'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddCampaign} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Campaign Identifier</label>
                    <input 
                      type="text" 
                      autoFocus
                      placeholder="e.g. Q4 Growth Sprint"
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] focus:bg-white focus:border-indigo-500 outline-none transition-all font-black text-xl text-slate-900 shadow-inner"
                      value={campName}
                      onChange={(e) => setCampName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Primary Path</label>
                      <select 
                        className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-500 outline-none font-black text-slate-900 appearance-none shadow-sm cursor-pointer"
                        value={campChannel}
                        onChange={(e) => setCampChannel(e.target.value)}
                      >
                        {channels.map(ch => (
                          <option key={ch.id} value={ch.name}>{ch.icon} {ch.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Launch Date</label>
                      <input 
                        type="date"
                        className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-500 outline-none font-black text-slate-900 shadow-sm"
                        value={campDate}
                        onChange={(e) => setCampDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <span className="text-4xl">💡</span>
                    </div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Optimization Note</p>
                    <p className="text-sm text-indigo-900 font-medium leading-relaxed italic pr-12">
                      All newly initiated campaigns will begin in "Draft" state. Deployment requires manual verification of creative assets.
                    </p>
                  </div>

                  <div className="pt-6 flex space-x-4">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
                    >
                      Discard
                    </button>
                    <button 
                      type="submit"
                      disabled={!campName.trim()}
                      className="flex-[2] py-5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-900/20 transition-all transform active:scale-95 disabled:opacity-50"
                    >
                      Initiate Production
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;
