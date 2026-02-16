
import React, { useState, useCallback } from 'react';

const PlatformIcons: Record<string, React.ReactNode> = {
  facebook: (
    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  ),
  instagram: (
    <svg className="w-5 h-5" fill="#E4405F" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664 4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324A4.162 4.162 0 0112 16zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
  youtube: (
    <svg className="w-5 h-5" fill="#FF0000" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  tiktok: (
    <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31 0 2.59.32 3.72.93a6.52 6.52 0 01-1.1 2.92c-1.12.38-1.56.45-1.56.45v11.53c0 3.21-2.61 5.82-5.82 5.82A5.82 5.82 0 011.94 15.85c0-3.21 2.61-5.82 5.82-5.82.28 0 .55.02.82.06V14.2c-.27-.04-.54-.06-.82-.06a1.73 1.73 0 100 3.46 1.73 1.73 0 001.73-1.73V0h3.03zm7.04 4.54a4.34 4.34 0 002.43 1.15v3.13a7.43 7.43 0 01-3.13-.68v3.13c0 1.95-1.58 3.54-3.54 3.54a3.54 3.54 0 01-3.54-3.54V4.56h3.13v6.12a.4.4 0 00.4.4c.22 0 .4-.18.4-.4V4.56h3.65z" />
    </svg>
  ),
  x: (
    <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  gmb: (
    <svg className="w-5 h-5" fill="#4285F4" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  ),
  reddit: (
    <svg className="w-5 h-5" fill="#FF4500" viewBox="0 0 24 24">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.051l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.97 0 1.754.784 1.754 1.754 0 .716-.445 1.333-1.056 1.617.015.21.022.413.022.619 0 2.91-3.503 5.27-7.823 5.27-4.32 0-7.822-2.36-7.822-5.27 0-.193.006-.385.019-.576a1.73 1.73 0 0 1-1.067-1.58c0-.97.785-1.753 1.754-1.753.463 0 .875.182 1.185.477 1.187-.816 2.834-1.34 4.644-1.427l.886-4.143a.242.242 0 0 1 .192-.186l3.29-.692c.074-.015.15-.022.226-.022zM9.461 11.53c-.703 0-1.28.576-1.28 1.28a1.281 1.281 0 0 0 2.56 0c0-.704-.577-1.28-1.28-1.28zm5.078 0c-.703 0-1.28.576-1.28 1.28a1.281 1.281 0 0 0 2.561 0c0-.704-.578-1.28-1.281-1.28zM12 15.07c-1.31 0-2.458.358-3.238.922a.242.242 0 1 0 .284.39c.62-.446 1.608-.745 2.954-.745 1.346 0 2.335.3 2.955.745a.242.242 0 1 0 .283-.39c-.78-.564-1.928-.922-3.238-.922z" />
    </svg>
  ),
};

interface SocialPlatform {
  id: string;
  name: string;
  emoji: string;
  connected: boolean;
  connecting: boolean;
  followers: string;
  handle?: string;
}

const INITIAL_PLATFORMS: SocialPlatform[] = [
  { id: 'facebook', name: 'Facebook', emoji: '📘', connected: true, connecting: false, followers: '12.4k', handle: '@hobbs_studio' },
  { id: 'instagram', name: 'Instagram', emoji: '📸', connected: false, connecting: false, followers: '0' },
  { id: 'linkedin', name: 'LinkedIn', emoji: '👔', connected: true, connecting: false, followers: '5.2k', handle: 'Hobbs Creative' },
  { id: 'youtube', name: 'YouTube', emoji: '🎬', connected: false, connecting: false, followers: '0' },
  { id: 'tiktok', name: 'TikTok', emoji: '🎵', connected: false, connecting: false, followers: '0' },
  { id: 'x', name: 'X.com / Twitter', emoji: '✖️', connected: true, connecting: false, followers: '8.9k', handle: '@HobbsAI' },
  { id: 'gmb', name: 'Google Business Profile', emoji: '📍', connected: false, connecting: false, followers: '0' },
  { id: 'reddit', name: 'Reddit', emoji: '🤖', connected: false, connecting: false, followers: '0' },
];

const SocialConnector: React.FC = () => {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(INITIAL_PLATFORMS);
  const [activeSettings, setActiveSettings] = useState<string | null>(null);

  const connectFacebook = async (id: string) => {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, connecting: true } : p));

    try {
      const accessToken = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN;

      if (!accessToken) {
        console.error('Facebook access token not configured');
        setPlatforms(prev => prev.map(p => p.id === id ? { ...p, connecting: false } : p));
        return;
      }

      const response = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,followers_count&access_token=${accessToken}`);
      const data = await response.json();

      if (data.error) {
        console.error('Facebook API error:', data.error);
        setPlatforms(prev => prev.map(p => p.id === id ? { ...p, connecting: false } : p));
        return;
      }

      setPlatforms(prev => prev.map(p => p.id === id ? {
        ...p,
        connecting: false,
        connected: true,
        followers: data.followers_count ? `${(data.followers_count / 1000).toFixed(1)}k` : '12.4k',
        handle: `@${data.name?.replace(/\s+/g, '_').toLowerCase() || 'hobbs_studio'}`
      } : p));
    } catch (error) {
      console.error('Error connecting to Facebook:', error);
      setPlatforms(prev => prev.map(p => p.id === id ? { ...p, connecting: false } : p));
    }
  };

  const simulateConnection = useCallback((id: string) => {
    if (id === 'facebook') {
      connectFacebook(id);
      return;
    }

    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, connecting: true } : p));

    setTimeout(() => {
      setPlatforms(prev => prev.map(p => p.id === id ? {
        ...p,
        connecting: false,
        connected: true,
        followers: '1.2k',
        handle: id === 'reddit' ? `u/hobbs_studio` : `@hobbs_${id === 'gmb' ? 'google' : id}`
      } : p));
    }, 2500);
  }, []);

  const toggleConnect = (id: string) => {
    const platform = platforms.find(p => p.id === id);
    if (!platform) return;

    if (platform.connected) {
      // Confirm disconnect
      if (confirm(`Are you sure you want to disconnect ${platform.name}?`)) {
        setPlatforms(prev => prev.map(p => p.id === id ? { ...p, connected: false, handle: undefined, followers: '0' } : p));
      }
    } else {
      simulateConnection(id);
    }
  };

  const handleConnectAll = async () => {
    const disconnected = platforms.filter(p => !p.connected && !p.connecting);
    for (const p of disconnected) {
      simulateConnection(p.id);
      await new Promise(r => setTimeout(r, 400)); // Stagger them
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-slate-50 relative">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Social Connect</h2>
            <p className="text-slate-500 font-medium">Link all your profiles to enable multi-channel scheduling and AI promotion.</p>
          </div>
          <button 
            onClick={handleConnectAll}
            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:shadow-slate-300 transition-all uppercase tracking-widest active:scale-95"
          >
            Connect All Pending
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {platforms.map(p => (
            <div key={p.id} className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all group relative flex flex-col space-y-6 ${p.connecting ? 'border-blue-400 animate-pulse' : p.connected ? 'border-emerald-100 shadow-sm' : 'border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl'}`}>
              
              {p.connected && (
                <div className="absolute top-6 right-8">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-400 mt-1">{p.followers} Reach</span>
                  </div>
                </div>
              )}

              <div className="w-20 h-20 bg-slate-50 rounded-[1.8rem] flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform">
                {p.emoji}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <div className={`transition-all shrink-0 ${p.connected ? 'opacity-100' : 'opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110'}`}>
                    {PlatformIcons[p.id === 'gmb' ? 'gmb' : p.id === 'x' ? 'x' : p.id]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-slate-900 flex flex-col">
                      <span className="truncate">{p.name}</span>
                      <span className="flex items-center shrink-0 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${p.connecting ? 'bg-blue-500 animate-pulse' : p.connected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${p.connecting ? 'text-blue-500' : p.connected ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {p.connecting ? 'Connecting' : p.connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </span>
                    </h3>
                  </div>
                </div>
                {p.connected ? (
                   <p className="text-xs font-bold text-indigo-400 truncate tracking-tight pt-1">{p.handle}</p>
                ) : (
                  <p className="text-xs text-slate-400 font-medium pt-1">Link your {p.name} account to sync audience data.</p>
                )}
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => toggleConnect(p.id)}
                  disabled={p.connecting}
                  className={`w-full py-4 rounded-2xl text-xs font-black transition-all transform active:scale-95 uppercase tracking-widest flex items-center justify-center ${
                    p.connecting 
                    ? 'bg-blue-50 text-blue-500 cursor-wait'
                    : p.connected 
                    ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'
                  }`}
                >
                  {p.connecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Authorizing...
                    </>
                  ) : p.connected ? (
                    'Manage Settings'
                  ) : (
                    `Connect Account`
                  )}
                </button>
              </div>

              {p.connected && (
                <button 
                  onClick={() => setActiveSettings(p.id)}
                  className="absolute bottom-4 right-8 text-[10px] font-bold text-slate-300 hover:text-rose-500 uppercase tracking-widest transition-colors"
                >
                  Unlink
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Platform Settings Modal Mock */}
      {activeSettings && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setActiveSettings(null)}>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{platforms.find(p => p.id === activeSettings)?.emoji}</div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{platforms.find(p => p.id === activeSettings)?.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Integration Settings</p>
                </div>
              </div>
              <button onClick={() => setActiveSettings(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Permissions</h4>
                 <div className="space-y-3">
                    {['Read Audience Analytics', 'Publish Content', 'Manage Ad Campaigns', 'View Direct Messages'].map(perm => (
                      <div key={perm} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <span className="text-sm font-bold text-slate-700">{perm}</span>
                         <div className="w-10 h-5 bg-emerald-500 rounded-full flex items-center justify-end p-1">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex space-x-4">
                 <button onClick={() => setActiveSettings(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                 <button 
                  onClick={() => {
                    toggleConnect(activeSettings);
                    setActiveSettings(null);
                  }}
                  className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
                 >
                    Disconnect Account
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Toast Simulation */}
      <div className="fixed bottom-10 left-10 pointer-events-none space-y-4 z-[2000]">
        {platforms.filter(p => p.connecting).map(p => (
          <div key={p.id} className="bg-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-200 flex items-center space-x-4 animate-in slide-in-from-left-10 fade-in">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="text-xs font-black text-slate-900 uppercase">Connecting to {p.name}...</p>
              <p className="text-[9px] font-bold text-slate-400">Verifying API keys & account access</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialConnector;
