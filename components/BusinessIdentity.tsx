
import React from 'react';
import { BusinessInfo } from '../types';

interface BusinessIdentityProps {
  info: BusinessInfo;
  onUpdate: (info: BusinessInfo) => void;
}

const BusinessIdentity: React.FC<BusinessIdentityProps> = ({ info, onUpdate }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center space-x-8 pb-12 border-b border-slate-200">
           <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl">
              🏢
           </div>
           <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Business Identity</h2>
              <p className="text-lg text-slate-500 font-medium">Configure your organization's core data and mission.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Legal Entity Name</label>
                 <input 
                    type="text" 
                    value={info.name}
                    onChange={(e) => onUpdate({ ...info, name: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Primary Industry</label>
                 <input 
                    type="text" 
                    value={info.industry}
                    onChange={(e) => onUpdate({ ...info, industry: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Organization Size</label>
                 <select 
                    value={info.size}
                    onChange={(e) => onUpdate({ ...info, size: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm appearance-none"
                 >
                    <option>Solopreneur</option>
                    <option>Small Team (2-10)</option>
                    <option>Medium (11-50)</option>
                    <option>Enterprise (50+)</option>
                 </select>
              </div>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Mission Statement</label>
                 <textarea 
                    value={info.mission}
                    onChange={(e) => onUpdate({ ...info, mission: e.target.value })}
                    className="w-full h-[268px] px-6 py-4 bg-white border border-slate-200 rounded-[2rem] text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm resize-none leading-relaxed"
                    placeholder="Describe your company's core purpose..."
                 />
              </div>
           </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 space-y-6 shadow-sm">
           <h3 className="text-xl font-black text-slate-900">Brand Assets</h3>
           <div className="grid grid-cols-4 gap-4">
              <div className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all cursor-pointer">
                 <span className="text-2xl">🖼️</span>
                 <span className="text-[10px] font-black uppercase tracking-tighter">Primary Logo</span>
              </div>
              <div className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all cursor-pointer">
                 <span className="text-2xl">🎨</span>
                 <span className="text-[10px] font-black uppercase tracking-tighter">Brand Guide</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessIdentity;
