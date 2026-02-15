
import React, { useState, useEffect, useMemo } from 'react';

interface ApiKeyRecord {
  id: string;
  provider: string;
  service: string;
  status: 'Active' | 'Missing';
  value: string;
  category: 'AI & Models' | 'Communication' | 'Telephony' | 'Developer';
}

const ApiManagement: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const PROVIDERS = [
    { id: 'GEMINI', name: 'Google Cloud / Gemini', service: 'Core AI, Gmail, Calendar, Sheets, Drive', env: 'API_KEY', category: 'AI & Models' },
    { id: 'ANTHROPIC', name: 'Anthropic Claude', service: 'Claude 3.5 Sonnet / Opus', env: 'ANTHROPIC_KEY', category: 'AI & Models' },
    { id: 'OPENAI', name: 'OpenAI', service: 'GPT-4o & DALL-E 3 Synthesis', env: 'OPENAI_KEY', category: 'AI & Models' },
    { id: 'FAL', name: 'Fal.ai', service: 'Ultra-Fast Media & Image Synthesis', env: 'FAL_KEY', category: 'AI & Models' },
    { id: 'ELEVEN_LABS', name: 'ElevenLabs', service: 'Neural TTS & Voice Cloning', env: 'ELEVEN_LABS_KEY', category: 'AI & Models' },
    
    { id: 'SLACK', name: 'Slack Bot', service: 'Bot User OAuth Token (xoxb-...)', env: 'SLACK_KEY', category: 'Communication' },
    { id: 'DISCORD', name: 'Discord Webhook', service: 'Server Channel Webhook URL', env: 'DISCORD_KEY', category: 'Communication' },
    
    { id: 'TWILIO', name: 'Twilio', service: 'SMS & Voice Gateway', env: 'TWILIO_KEY', category: 'Telephony' },
    { id: 'TELNYX', name: 'Telnyx', service: 'Global Telephony', env: 'TELNYX_KEY', category: 'Telephony' },
    { id: 'VONAGE', name: 'Vonage', service: 'Communications API', env: 'VONAGE_KEY', category: 'Telephony' },
    
    { id: 'OPENROUTER', name: 'OpenRouter', service: 'Unified LLM Gateway', env: 'OPENROUTER_KEY', category: 'Developer' },
    { id: 'GROQ', name: 'Groq', service: 'Ultra-Fast LPU Inference', env: 'GROQ_KEY', category: 'Developer' },
  ];

  useEffect(() => {
    const loadedKeys = PROVIDERS.map(p => {
      const val = localStorage.getItem(p.env) || '';
      return {
        id: p.id,
        provider: p.name,
        service: p.service,
        status: val ? 'Active' : 'Missing',
        value: val,
        category: p.category
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

  const categories = ['AI & Models', 'Communication', 'Telephony', 'Developer'];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in">
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">API Vault</h2>
            <p className="text-lg text-slate-500 font-medium">Link your credentials to activate the Marketplace integrations.</p>
          </div>
          {saveFeedback && (
            <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 animate-in slide-in-from-top-2">
              {saveFeedback}
            </div>
          )}
        </div>

        {categories.map(cat => (
          <div key={cat} className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-4">{cat}</h3>
            <div className="grid grid-cols-1 gap-4">
              {keys.filter(k => k.category === cat).map(key => (
                <div key={key.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-lg transition-all group flex items-center justify-between overflow-hidden relative">
                  <div className="flex items-center space-x-8 flex-1">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-all group-hover:scale-105 duration-500 ${key.status === 'Active' ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50 border border-slate-100'}`}>
                       {key.id === 'GEMINI' && '🧠'}
                       {key.id === 'ANTHROPIC' && '🎭'}
                       {key.id === 'OPENAI' && '🤖'}
                       {key.id === 'FAL' && '🎆'}
                       {key.id === 'ELEVEN_LABS' && '🗣️'}
                       {key.id === 'SLACK' && '💬'}
                       {key.id === 'DISCORD' && '👾'}
                       {['TWILIO', 'TELNYX', 'VONAGE'].includes(key.id) && '📞'}
                       {key.category === 'Developer' && '🛠️'}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{key.provider}</h3>
                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border shadow-sm ${key.status === 'Active' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{key.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{key.service}</p>
                      <div className="mt-4 flex max-w-lg group/input">
                        <input 
                          type="password" 
                          placeholder={`Enter Secret Key...`}
                          className="flex-1 bg-slate-50 border-2 border-transparent rounded-l-xl px-4 py-3 text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner font-mono"
                          value={key.value}
                          onChange={(e) => handleUpdate(key.id, e.target.value)}
                        />
                        <button 
                          onClick={() => handleSave(key.id)}
                          className="bg-slate-900 text-white px-6 rounded-r-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-slate-900 rounded-[4rem] p-16 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden group shadow-2xl">
           <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="space-y-6 relative max-w-xl text-center md:text-left mb-10 md:mb-0">
              <h4 className="text-3xl font-black tracking-tight">Security Protocol</h4>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                All keys are stored exclusively in your browser's persistent storage. We never transmit your keys to our backend. They are injected client-side only during active sessions.
              </p>
           </div>
           <div className="relative">
              <button 
                onClick={clearAllKeys}
                className="px-12 py-5 bg-white text-slate-900 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95 transform"
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
