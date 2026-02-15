
import React from 'react';
import { OwnerInfo } from '../types';

interface OwnerProfileProps {
  info: OwnerInfo;
  onUpdate: (info: OwnerInfo) => void;
}

const OwnerProfile: React.FC<OwnerProfileProps> = ({ info, onUpdate }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center space-x-8 pb-12 border-b border-slate-200">
           <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl">
              {info.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
           </div>
           <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Owner Profile</h2>
              <p className="text-lg text-slate-500 font-medium">Manage your personal professional brand and bio.</p>
           </div>
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
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Professional Bio</label>
                 <textarea 
                    value={info.bio}
                    onChange={(e) => onUpdate({ ...info, bio: e.target.value })}
                    className="w-full h-[268px] px-6 py-4 bg-white border border-slate-200 rounded-[2rem] text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm resize-none leading-relaxed"
                    placeholder="Tell your story..."
                 />
              </div>
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
