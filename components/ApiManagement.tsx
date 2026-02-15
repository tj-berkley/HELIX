
import React, { useState, useEffect } from 'react';

interface ApiKeyRecord {
  id: string;
  provider: string;
  service: string;
  status: 'Active' | 'Missing';
  value: string;
}

const ApiManagement: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const PROVIDERS = [
    { id: 'GEMINI', name: 'Google Gemini', service: 'LLM & Multimodal AI', env: 'API_KEY' },
    { id: 'ELEVEN_LABS', name: 'ElevenLabs', service: 'Neural TTS & Voice Cloning', env: 'ELEVEN_LABS_KEY' },
    { id: 'TWILIO', name: 'Twilio', service: 'SMS & Voice Gateway', env: 'TWILIO_KEY' },
    { id: 'TELNYX', name: 'Telnyx', service: 'Global Telephony', env: 'TELNYX_KEY' },
    { id: 'VONAGE', name: 'Vonage', service: 'Communications API', env: 'VONAGE_KEY' },
  ];

  useEffect(() => {
    const loadedKeys = PROVIDERS.map(p => {
      const val = localStorage.getItem(p.env) || '';
      return {
        id: p.id,
        provider: p.name,
        service: p.service,
        status: val ? 'Active' : 'Missing',
        value: val
      } as ApiKeyRecord;
    });
    setKeys(loadedKeys);
  }, []);

  const handleUpdate = (id: string, newVal: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, value: newVal } : k));
  };

  const handleSave = (id: string) => {
    const key = keys.find(k => k.id === id);
    if (!key) return;
    const provider = PROVIDERS.find(p => p.id === id);
    if (!provider) return;
    
    localStorage.setItem(provider.env, key.value);
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: key.value ? 'Active' : 'Missing' } : k));
    setSaveFeedback(`Successfully updated ${key.provider} credentials.`);
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">API Management</h2>
            <p className="text-lg text-slate-500 font-medium">Control the neural pathways and communication gateways of your platform.</p>
          </div>
          {saveFeedback && (
            <div className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 animate-bounce">
              {saveFeedback}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {keys.map(key => (
            <div key={key.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group flex items-center justify-between">
              <div className="flex items-center space-x-6 flex-1">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner ${key.status === 'Active' ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                   {key.id === 'GEMINI' ? '🧠' : key.id === 'ELEVEN_LABS' ? '🗣️' : '📞'}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-black text-slate-900">{key.provider}</h3>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${key.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{key.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{key.service}</p>
                  <div className="mt-4 flex max-w-md">
                    <input 
                      type="password" 
                      placeholder={`Enter ${key.provider} Secret Key`}
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-l-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={key.value}
                      onChange={(e) => handleUpdate(key.id, e.target.value)}
                    />
                    <button 
                      onClick={() => handleSave(key.id)}
                      className="bg-slate-900 text-white px-6 rounded-r-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                    >
                      Sync
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="px-10 hidden md:block">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol</p>
                    <p className="text-sm font-black text-slate-800">{key.id === 'GEMINI' ? 'REST/WSS' : 'REST API'}</p>
                 </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex justify-between items-center relative overflow-hidden group">
           <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
           <div className="space-y-4 relative">
              <h4 className="text-2xl font-black">Security Protocol v4</h4>
              <p className="text-slate-400 max-w-md font-medium leading-relaxed">Keys are stored locally in your browser's persistent storage. They are injected into requests only when a neural process is initiated.</p>
           </div>
           <div className="relative">
              <button className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-100 transition-all active:scale-95">Clear All Keys</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ApiManagement;
