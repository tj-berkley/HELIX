
import React, { useState } from 'react';
import { Icons } from '../constants';

const SiteBuilder: React.FC = () => {
  const [activeElement, setActiveElement] = useState<string | null>(null);

  const widgets = [
    { id: 'text', label: 'Headline', icon: '📝' },
    { id: 'image', label: 'Image', icon: '🖼️' },
    { id: 'button', label: 'Button', icon: '🔘' },
    { id: 'section', label: 'Section', icon: '🏗️' },
    { id: 'video', label: 'Video', icon: '🎬' },
    { id: 'form', label: 'Form', icon: '📝' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden">
      <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-black text-slate-900">Landing Page Builder</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
            <button className="px-3 py-1 bg-white text-blue-600 rounded shadow-sm">Desktop</button>
            <button className="px-3 py-1 text-slate-400 hover:text-slate-600 transition-all">Mobile</button>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Preview</button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Publish Live</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Widget Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 p-6 space-y-8 shrink-0 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Elements</h3>
            <div className="grid grid-cols-2 gap-3">
              {widgets.map(w => (
                <button key={w.id} className="p-4 border border-slate-100 bg-slate-50 rounded-2xl flex flex-col items-center justify-center space-y-2 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{w.icon}</span>
                  <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-600">{w.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Styles</h3>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Main Color</label>
              <div className="flex space-x-2">
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(c => (
                  <button key={c} className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-12 overflow-y-auto pattern-grid">
          <div className="max-w-4xl mx-auto bg-white min-h-[1000px] shadow-2xl rounded-2xl overflow-hidden relative group">
            {/* Header section mock */}
            <div className="p-12 text-center space-y-6 border-b border-slate-100 hover:ring-2 hover:ring-blue-400 cursor-pointer transition-all">
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">Your Epic Headline Goes Here</h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Create beautiful landing pages that convert your leads into loyal customers with our AI-powered site builder.</p>
              <button className="px-10 py-4 bg-blue-600 text-white rounded-full text-lg font-black shadow-xl hover:bg-blue-700 transition-all transform active:scale-95">Get Started Now</button>
            </div>

            {/* Feature section mock */}
            <div className="p-12 grid grid-cols-3 gap-8 hover:ring-2 hover:ring-blue-400 cursor-pointer transition-all">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🚀</div>
                  <h4 className="font-bold text-slate-900">Feature {i}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Describe a key benefit of your product here to engage the audience.</p>
                </div>
              ))}
            </div>

            {/* Empty drop zone */}
            <div className="p-20 text-center border-4 border-dashed border-slate-100 m-12 rounded-[2rem] flex flex-col items-center justify-center space-y-4 text-slate-300">
               <div className="text-4xl opacity-20">🏗️</div>
               <p className="font-bold uppercase text-xs tracking-widest opacity-40">Drag elements from the sidebar to build your page</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteBuilder;
