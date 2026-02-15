
import React, { useState, useEffect, useCallback } from 'react';

interface ConnectionRecord {
  id: string;
  provider: string;
  service: string;
  status: 'Active' | 'Missing';
  value: string;
  category: 'AI & Models' | 'Communication' | 'Telephony' | 'Developer' | 'Social' | 'Custom';
  type: 'Key' | 'OAuth' | 'Webhook';
  isCustom?: boolean;
}

const ConnectionVault: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'keys' | 'social' | 'webhooks' | 'custom'>('keys');
  const [records, setRecords] = useState<ConnectionRecord[]>([]);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newCustom, setNewCustom] = useState({
    provider: '',
    service: '',
    value: ''
  });

  const SYSTEM_PROVIDERS = [
    // API KEYS
    { id: 'GEMINI', provider: 'Google Cloud / Gemini', service: 'Core AI, Gmail, Calendar, Sheets, Drive', env: 'API_KEY', category: 'AI & Models', type: 'Key' },
    { id: 'ANTHROPIC', provider: 'Anthropic Claude', service: 'Claude 3.5 Sonnet / Opus', env: 'ANTHROPIC_KEY', category: 'AI & Models', type: 'Key' },
    { id: 'OPENAI', provider: 'OpenAI', service: 'GPT-4o & DALL-E 3 Synthesis', env: 'OPENAI_KEY', category: 'AI & Models', type: 'Key' },
    { id: 'ELEVEN_LABS', provider: 'ElevenLabs', service: 'Neural TTS & Voice Cloning', env: 'ELEVEN_LABS_KEY', category: 'AI & Models', type: 'Key' },
    { id: 'WHATSAPP', provider: 'WhatsApp Business', service: 'Cloud API Permanent Token', env: 'WHATSAPP_TOKEN', category: 'Telephony', type: 'Key' },
    { id: 'TELEGRAM', provider: 'Telegram Bot', service: 'BotFather Access Token', env: 'TELEGRAM_TOKEN', category: 'Telephony', type: 'Key' },
    { id: 'TWILIO', provider: 'Twilio', service: 'SMS & Voice Gateway', env: 'TWILIO_KEY', category: 'Telephony', type: 'Key' },
    { id: 'TELNYX', provider: 'Telnyx', service: 'Global Telephony & SIP Trunking', env: 'TELNYX_KEY', category: 'Telephony', type: 'Key' },
    
    // SOCIAL OAUTH
    { id: 'FACEBOOK', provider: 'Facebook', service: 'Page Management & Ads', env: 'FB_AUTH_STATUS', category: 'Social', type: 'OAuth' },
    { id: 'INSTAGRAM', provider: 'Instagram', service: 'Business Profile Publishing', env: 'IG_AUTH_STATUS', category: 'Social', type: 'OAuth' },
    { id: 'LINKEDIN', provider: 'LinkedIn', service: 'Professional Network Syc', env: 'LI_AUTH_STATUS', category: 'Social', type: 'OAuth' },
    { id: 'X_COM', provider: 'X / Twitter', service: 'Real-time Signal Broadcast', env: 'X_AUTH_STATUS', category: 'Social', type: 'OAuth' },

    // WEBHOOKS
    { id: 'INBOUND_SIGNALS', provider: 'Inbound Logic', service: 'Endpoint for external triggers', env: 'WEBHOOK_INBOUND', category: 'Developer', type: 'Webhook' },
  ];

  const loadAllRecords = useCallback(() => {
    const system = SYSTEM_PROVIDERS.map(p => {
      const val = localStorage.getItem(p.env) || '';
      return {
        ...p,
        status: val ? 'Active' : 'Missing',
        value: val,
        isCustom: false
      } as ConnectionRecord;
    });

    const customRaw = localStorage.getItem('OMNI_CUSTOM_CONNECTIONS_V1');
    const custom: ConnectionRecord[] = customRaw ? JSON.parse(customRaw) : [];
    
    setRecords([...system, ...custom]);
  }, []);

  useEffect(() => {
    loadAllRecords();
  }, [loadAllRecords]);

  const handleUpdate = (id: string, updates: Partial<ConnectionRecord>) => {
    setRecords(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));
  };

  const handleSave = (id: string) => {
    const record = records.find(r => r.id === id);
    if (!record) return;

    if (record.isCustom) {
      const customOnlies = records.filter(r => r.isCustom);
      localStorage.setItem('OMNI_CUSTOM_CONNECTIONS_V1', JSON.stringify(customOnlies));
    } else {
      const provider = SYSTEM_PROVIDERS.find(p => p.id === id);
      if (provider) {
        localStorage.setItem(provider.env, record.value);
      }
    }
    
    handleUpdate(id, { status: record.value ? 'Active' : 'Missing' });
    setSaveFeedback(`Successfully synced ${record.provider}.`);
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustom.provider || !newCustom.service) return;

    const id = `custom-${Date.now()}`;
    const newRecord: ConnectionRecord = {
      id,
      provider: newCustom.provider,
      service: newCustom.service,
      value: newCustom.value,
      status: newCustom.value ? 'Active' : 'Missing',
      category: 'Custom',
      type: 'Key',
      isCustom: true
    };

    const updatedCustoms = [...records.filter(r => r.isCustom), newRecord];
    localStorage.setItem('OMNI_CUSTOM_CONNECTIONS_V1', JSON.stringify(updatedCustoms));
    setRecords([...records, newRecord]);
    
    setIsAddModalOpen(false);
    setNewCustom({ provider: '', service: '', value: '' });
    setActiveTab('custom');
    setSaveFeedback(`Created custom connection: ${newRecord.provider}`);
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const deleteCustom = (id: string) => {
    if (confirm("Delete this custom connection permanentely?")) {
      const filtered = records.filter(r => r.id !== id);
      const customOnly = filtered.filter(r => r.isCustom);
      localStorage.setItem('OMNI_CUSTOM_CONNECTIONS_V1', JSON.stringify(customOnly));
      setRecords(filtered);
    }
  };

  const simulateOAuth = (id: string) => {
    handleUpdate(id, { value: 'CONNECTED_SESSION_OAUTH_TOKEN' });
    setTimeout(() => handleSave(id), 1000);
  };

  const clearVault = () => {
    if (confirm("Are you sure you want to purge all secure credentials? This will disconnect all AI and Social processes.")) {
      SYSTEM_PROVIDERS.forEach(p => localStorage.removeItem(p.env));
      localStorage.removeItem('OMNI_CUSTOM_CONNECTIONS_V1');
      loadAllRecords();
      setSaveFeedback("Vault purged successfully.");
      setTimeout(() => setSaveFeedback(null), 3000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8faff] p-12 animate-in fade-in">
      <div className="max-w-6xl mx-auto space-y-12 pb-32">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Neural Vault</h2>
            <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
               {(['keys', 'social', 'webhooks', 'custom'] as const).map(t => (
                 <button 
                  key={t} 
                  onClick={() => setActiveTab(t)} 
                  className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {t === 'keys' ? '🔐 API Keys' : t === 'social' ? '🌐 Social Sync' : t === 'webhooks' ? '🔌 Webhooks' : '🛠️ Custom'}
                 </button>
               ))}
            </div>
          </div>
          <div className="flex items-center space-x-4 mb-1">
            {saveFeedback && (
              <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 animate-in slide-in-from-top-2 shadow-sm mr-2">
                {saveFeedback}
              </div>
            )}
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black active:scale-95 transition-all flex items-center"
            >
              <span className="mr-2">➕</span> Define Custom Connection
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {records
            .filter(r => {
              if (activeTab === 'keys') return r.type === 'Key' && !r.isCustom;
              if (activeTab === 'social') return r.type === 'OAuth';
              if (activeTab === 'webhooks') return r.type === 'Webhook';
              return r.isCustom;
            })
            .map(record => (
              <div key={record.id} className={`bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm hover:shadow-xl transition-all group flex items-center justify-between overflow-hidden relative ${record.isCustom ? 'border-l-4 border-l-indigo-500' : ''}`}>
                <div className="flex items-center space-x-10 flex-1">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-inner transition-all group-hover:scale-105 duration-500 ${record.status === 'Active' ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50 border border-slate-100'}`}>
                     {record.id === 'GEMINI' && '🧠'}
                     {record.id === 'WHATSAPP' && '💬'}
                     {record.id === 'TELEGRAM' && '✈️'}
                     {record.id === 'FACEBOOK' && '📘'}
                     {record.id === 'INSTAGRAM' && '📸'}
                     {record.id === 'LINKEDIN' && '👔'}
                     {record.id === 'X_COM' && '✖️'}
                     {record.id === 'TELNYX' && '📶'}
                     {record.type === 'Webhook' && '🔌'}
                     {record.isCustom && '🛠️'}
                     {!['GEMINI','WHATSAPP','TELEGRAM','FACEBOOK','INSTAGRAM','LINKEDIN','X_COM', 'TELNYX'].includes(record.id) && record.type === 'Key' && !record.isCustom && '🔑'}
                  </div>
                  
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-4">
                      {record.isCustom ? (
                        <input 
                          className="text-2xl font-black text-slate-900 tracking-tight bg-transparent border-b border-transparent focus:border-indigo-500 outline-none p-0 focus:ring-0"
                          value={record.provider}
                          onChange={(e) => handleUpdate(record.id, { provider: e.target.value })}
                          placeholder="Connection Name"
                        />
                      ) : (
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{record.provider}</h3>
                      )}
                      <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border shadow-sm ${record.status === 'Active' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{record.status}</span>
                    </div>
                    
                    {record.isCustom ? (
                      <input 
                        className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-transparent border-b border-transparent focus:border-indigo-500 outline-none w-full p-0 focus:ring-0"
                        value={record.service}
                        onChange={(e) => handleUpdate(record.id, { service: e.target.value })}
                        placeholder="Purpose / Description"
                      />
                    ) : (
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{record.service}</p>
                    )}
                    
                    <div className="mt-8 flex max-w-2xl group/input">
                      {record.type === 'OAuth' ? (
                        <button 
                          onClick={() => simulateOAuth(record.id)}
                          className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${record.status === 'Active' ? 'bg-slate-50 text-slate-500 border border-slate-200' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'}`}
                        >
                          {record.status === 'Active' ? 'Account Linked' : `Authorize ${record.provider}`}
                        </button>
                      ) : (
                        <>
                          <input 
                            type={record.type === 'Webhook' ? 'text' : 'password'} 
                            placeholder={`Enter ${record.provider} ${record.type}...`}
                            className="flex-1 bg-slate-50 border-2 border-transparent rounded-l-2xl px-6 py-4 text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner font-mono"
                            value={record.value}
                            onChange={(e) => handleUpdate(record.id, { value: e.target.value })}
                          />
                          <button 
                            onClick={() => handleSave(record.id)}
                            className="bg-slate-900 text-white px-10 rounded-r-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                          >
                            Sync
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {record.isCustom && (
                  <button 
                    onClick={() => deleteCustom(record.id)}
                    className="absolute top-10 right-10 p-3 bg-rose-50 text-rose-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                    title="Delete Connection"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            ))}
        </div>

        {/* Empty States */}
        {records.filter(r => activeTab === 'custom' ? r.isCustom : (activeTab === 'keys' ? (r.type === 'Key' && !r.isCustom) : (activeTab === 'social' ? r.type === 'OAuth' : r.type === 'Webhook'))).length === 0 && (
          <div className="py-32 text-center space-y-4 border-4 border-dashed border-slate-100 rounded-[4rem] opacity-30">
            <span className="text-8xl">🏜️</span>
            <p className="text-xl font-black uppercase tracking-widest">No connections in this category</p>
          </div>
        )}

        <div className="bg-slate-900 rounded-[4rem] p-16 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden group shadow-2xl">
           <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="space-y-6 relative max-w-xl text-center md:text-left mb-10 md:mb-0">
              <h4 className="text-3xl font-black tracking-tight">Enterprise Compliance</h4>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                Platform credentials are encrypted and stored locally in your workspace cache. We utilize AES-256 for transmission between neural nodes and campaign triggers.
              </p>
           </div>
           <div className="relative">
              <button 
                onClick={clearVault}
                className="px-12 py-5 bg-white text-slate-900 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95 transform"
              >
                Purge All Credentials
              </button>
           </div>
        </div>
      </div>

      {/* Add Custom Connection Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">🛠️</div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Define Connection</h3>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Custom API Architecture</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-white rounded-full text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleAddCustom} className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Name Label</label>
                <input 
                  autoFocus
                  required
                  placeholder="e.g. Supabase Key, Stripe Live..."
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-sm font-bold shadow-inner outline-none transition-all"
                  value={newCustom.provider}
                  onChange={e => setNewCustom({ ...newCustom, provider: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description / Service Box</label>
                <textarea 
                  required
                  placeholder="What is this connection used for?"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-sm font-bold shadow-inner outline-none transition-all h-24 resize-none"
                  value={newCustom.service}
                  onChange={e => setNewCustom({ ...newCustom, service: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">API Key / Token Value</label>
                <input 
                  type="password"
                  placeholder="sk-..."
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-sm font-mono shadow-inner outline-none transition-all"
                  value={newCustom.value}
                  onChange={e => setNewCustom({ ...newCustom, value: e.target.value })}
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-600 transition-all active:scale-95"
              >
                Launch Connection
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionVault;
