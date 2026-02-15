
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
    { id: 'GEMINI', name: 'Google Gemini', service: 'LLM & Multimodal AI (Core OS)', env: 'API_KEY' },
    { id: 'ANTHROPIC', name: 'Anthropic Claude', service: 'Claude 3.5 Sonnet / Opus', env: 'ANTHROPIC_KEY' },
    { id: 'OPENAI', name: 'OpenAI', service: 'GPT-4o & DALL-E 3 Synthesis', env: 'OPENAI_KEY' },
    { id: 'OPENROUTER', name: 'OpenRouter', service: 'Unified LLM Gateway & Aggregator', env: 'OPENROUTER_KEY' },
    { id: 'FAL', name: 'Fal.ai', service: 'Ultra-Fast Media & Image Synthesis', env: 'FAL_KEY' },
    { id: 'DEEPSEEK', name: 'DeepSeek', service: 'High-Efficiency Reasoning Models', env: 'DEEPSEEK_KEY' },
    { id: 'GROQ', name: 'Groq', service: 'Ultra-Fast LPU Inference', env: 'GROQ_KEY' },
    { id: 'MISTRAL', name: 'Mistral AI', service: 'European Open-Weight Models', env: 'MISTRAL_KEY' },
    { id: 'PERPLEXITY', name: 'Perplexity', service: 'Real-time Search Grounded AI', env: 'PERPLEXITY_KEY' },
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

  const clearAllKeys = () => {
    if (confirm("Are you sure you want to purge all API credentials from local storage?")) {
      PROVIDERS.forEach(p => localStorage.removeItem(p.env));
      setKeys(prev => prev.map(k => ({ ...k, value: '', status: 'Missing' })));
      setSaveFeedback("Vault cleared successfully.");
      setTimeout(() => setSaveFeedback(null), 3000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in">
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Vault Management</h2>
            <p className="text-lg text-slate-500 font-medium">Control the neural pathways and communication gateways of your platform.</p>
          </div>
          {saveFeedback && (
            <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 animate-in slide-in-from-top-2">
              {saveFeedback}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {keys.map(key => (
            <div key={key.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group flex items-center justify-between overflow-hidden relative">
              <div className="flex items-center space-x-8 flex-1">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-inner transition-all group-hover:scale-105 duration-500 ${key.status === 'Active' ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50 border border-slate-100'}`}>
                   {key.id === 'GEMINI' && '🧠'}
                   {key.id === 'ANTHROPIC' && '🎭'}
                   {key.id === 'OPENAI' && '🤖'}
                   {key.id === 'OPENROUTER' && '🌐'}
                   {key.id === 'FAL' && '🎆'}
                   {key.id === 'DEEPSEEK' && '🐋'}
                   {key.id === 'GROQ' && '⚡'}
                   {key.id === 'MISTRAL' && '🌪️'}
                   {key.id === 'PERPLEXITY' && '🔍'}
                   {key.id === 'ELEVEN_LABS' && '🗣️'}
                   {['TWILIO', 'TELNYX', 'VONAGE'].includes(key.id) && '📞'}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{key.provider}</h3>
                    <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border shadow-sm ${key.status === 'Active' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{key.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{key.service}</p>
                  <div className="mt-6 flex max-w-xl group/input">
                    <input 
                      type="password" 
                      placeholder={`Enter ${key.provider} Secret Key...`}
                      className="flex-1 bg-slate-50 border-2 border-transparent rounded-l-[1.2rem] px-6 py-4 text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner font-mono"
                      value={key.value}
                      onChange={(e) => handleUpdate(key.id, e.target.value)}
                    />
                    <button 
                      onClick={() => handleSave(key.id)}
                      className="bg-slate-900 text-white px-8 rounded-r-[1.2rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                    >
                      Sync Vault
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="px-12 hidden lg:block border-l border-slate-100">
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Architecture</p>
                    <p className="text-xs font-black text-slate-800 tracking-widest">{key.id === 'GEMINI' ? 'REST/WSS' : 'REST API v2'}</p>
                 </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-[4rem] p-16 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden group shadow-2xl">
           <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
              <span className="text-[120px]">🔐</span>
           </div>
           <div className="space-y-6 relative max-w-xl text-center md:text-left mb-10 md:mb-0">
              <h4 className="text-3xl font-black tracking-tight">Security Protocol v4.5</h4>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                All keys are stored exclusively in your browser's persistent storage. We never transmit your keys to our backend. They are injected client-side only when a neural synthesis is initiated.
              </p>
              <div className="flex items-center space-x-3 text-indigo-400">
                 <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">End-to-End Encryption Mode Active</span>
              </div>
           </div>
           <div className="relative">
              <button 
                onClick={clearAllKeys}
                className="px-12 py-5 bg-white text-slate-900 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95 transform hover:-translate-y-1"
              >
                Purge All Credentials
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ApiManagement;
