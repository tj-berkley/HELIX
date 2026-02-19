
import React, { useRef } from 'react';
import { OwnerInfo } from '../types';

interface OwnerProfileProps {
  info: OwnerInfo;
  onUpdate: (info: OwnerInfo) => void;
}

const OwnerProfile: React.FC<OwnerProfileProps> = ({ info, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...info, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialUpdate = (key: string, value: string) => {
    onUpdate({
      ...info,
      socialLinks: {
        ...(info.socialLinks || {}),
        [key]: value
      }
    });
  };

  const initials = info.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in">
      <div className="max-w-4xl mx-auto space-y-12 pb-32">
        <div className="flex items-center space-x-8 pb-12 border-b border-slate-200">
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="relative w-32 h-32 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl transition-all hover:scale-105"
           >
              {info.avatarUrl ? (
                <img src={info.avatarUrl} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-4xl font-black text-white">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                <span className="text-white text-xs font-black uppercase tracking-widest">Change</span>
                <span className="text-xl">📸</span>
              </div>
           </div>
           
           <div className="flex-1">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Owner Profile</h2>
              <p className="text-lg text-slate-500 font-medium">Manage your personal professional brand and bio.</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
              >
                Upload Photo
              </button>
           </div>
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="image/*" 
             onChange={handleImageUpload} 
           />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                 <input 
                    type="text" 
                    value={info.name}
                    onChange={(e) => onUpdate({ ...info, name: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Professional Role</label>
                 <input 
                    type="text" 
                    value={info.role}
                    onChange={(e) => onUpdate({ ...info, role: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Contact Email</label>
                 <input 
                    type="email" 
                    value={info.email}
                    onChange={(e) => onUpdate({ ...info, email: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                 />
              </div>
              {info.assignedPhone && (
                <div className="space-y-2 animate-in slide-in-from-left-2">
                   <label className="text-xs font-black text-indigo-400 uppercase tracking-widest px-1">Provisioned Line</label>
                   <div className="w-full px-6 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-700 font-mono font-bold shadow-inner">
                      {info.assignedPhone}
                   </div>
                </div>
              )}
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Professional Bio</label>
                 <textarea 
                    value={info.bio}
                    onChange={(e) => onUpdate({ ...info, bio: e.target.value })}
                    className="w-full h-[368px] px-6 py-4 bg-white border border-slate-200 rounded-[2rem] text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm resize-none leading-relaxed"
                    placeholder="Tell your story..."
                 />
              </div>
           </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 space-y-8 shadow-sm">
           <div className="flex items-center space-x-3 mb-2 px-2">
              <span className="text-xl">🌐</span>
              <h3 className="text-xl font-black text-slate-900 uppercase">Social Presence</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'linkedin', label: 'LinkedIn', icon: '👤' },
                { id: 'twitter', label: 'X (Twitter)', icon: '✖️' },
                { id: 'instagram', label: 'Instagram', icon: '📸' },
                { id: 'github', label: 'GitHub', icon: '🐙' }
              ].map(plat => (
                <div key={plat.id} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center">
                    <span className="mr-2">{plat.icon}</span> {plat.label}
                  </label>
                  <input 
                    type="url"
                    placeholder={`https://${plat.id}.com/username`}
                    value={(info.socialLinks as any)?.[plat.id] || ''}
                    onChange={(e) => handleSocialUpdate(plat.id, e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                  />
                </div>
              ))}
           </div>
        </div>

        <div className="p-8 bg-indigo-600 rounded-[3rem] text-white flex justify-between items-center shadow-2xl shadow-indigo-200">
           <div className="space-y-1">
              <h4 className="text-xl font-black">AI Knowledge Sync</h4>
              <p className="text-sm text-indigo-100 font-medium">Your profile data is used to ground AI responses in your unique voice.</p>
           </div>
           <button className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">Enable Voice Clone</button>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfile;
