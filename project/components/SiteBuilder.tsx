
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { Webinar } from '../types';
import { generateSiteDesign } from '../services/geminiService';

interface SiteElement {
  id: string;
  type: 'headline' | 'paragraph' | 'image' | 'button' | 'section' | 'video' | 'form' | 'webinar-form' | 'list' | 'testimonial' | 'pricing' | 'divider';
  content: string;
  config?: any;
}

const SiteBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sites' | 'funnels' | 'builder'>('sites');
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [elements, setElements] = useState<SiteElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('OMNI_WEBINARS_V1');
    if (saved) setWebinars(JSON.parse(saved));
  }, []);

  const widgets = [
    { id: 'headline', label: 'Headline', icon: '📝' },
    { id: 'paragraph', label: 'Paragraph', icon: '📋' },
    { id: 'image', label: 'Image', icon: '🖼️' },
    { id: 'button', label: 'Button', icon: '🔘' },
    { id: 'list', label: 'Feature List', icon: '✅' },
    { id: 'testimonial', label: 'Testimonial', icon: '💬' },
    { id: 'pricing', label: 'Pricing Card', icon: '🏷️' },
    { id: 'form', label: 'Custom Form', icon: '📥' },
    { id: 'webinar-form', label: 'Webinar Form', icon: '🛰️' },
    { id: 'divider', label: 'Divider', icon: '➖' },
    { id: 'video', label: 'Video', icon: '🎬' },
    { id: 'section', label: 'Container', icon: '🏗️' },
  ];

  const addWidget = (type: SiteElement['type']) => {
    let content = '';
    let config = {};

    switch (type) {
      case 'headline':
        content = 'Empowering Neural Excellence';
        break;
      case 'paragraph':
        content = 'Our proprietary algorithms ensure that your enterprise data scales at the speed of thought, providing real-time insights and autonomous growth pathways.';
        break;
      case 'button':
        content = 'Get Started Now';
        break;
      case 'list':
        config = { items: ['Autonomous Orchestration', 'Neural Data Sync', 'Enterprise Security'] };
        break;
      case 'testimonial':
        content = 'OmniPortal has revolutionized how our team manages high-intent leads.';
        config = { author: 'Sarah Chen', role: 'CTO, CloudScale' };
        break;
      case 'pricing':
        content = 'Pro Plan';
        config = { price: '$99', features: ['Unlimited Workflows', 'Custom AI Agents', 'Priority Support'] };
        break;
      case 'webinar-form':
        config = { webinarId: webinars[0]?.id || '' };
        break;
      case 'form':
        config = { title: 'Connect with an Architect', fields: ['Name', 'Work Email'] };
        break;
      case 'divider':
        config = { style: 'solid', thickness: '2' };
        break;
    }

    const newEl: SiteElement = {
      id: `el-${Date.now()}`,
      type,
      content,
      config
    };
    setElements([...elements, newEl]);
    setSelectedElementId(newEl.id);
  };

  const handleAiBuild = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const brandVoice = JSON.parse(localStorage.getItem('HOBBS_BRAND_VOICE') || '{}');
      const aiData = await generateSiteDesign(aiPrompt, brandVoice);
      const translated = aiData.map((d: any, i: number) => ({
        ...d,
        id: `el-ai-${Date.now()}-${i}`,
      }));
      setElements(translated);
      setIsAiModalOpen(false);
      setAiPrompt('');
      setActiveTab('builder');
    } catch (e) {
      console.error(e);
      alert("Neural synthesis failed. Check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedElement = elements.find(e => e.id === selectedElementId);

  const updateSelectedElement = (updates: Partial<SiteElement>) => {
    if (!selectedElementId) return;
    setElements(elements.map(el => el.id === selectedElementId ? { ...el, ...updates } : el));
  };

  const updateConfig = (key: string, value: any) => {
    if (!selectedElement) return;
    updateSelectedElement({ config: { ...selectedElement.config, [key]: value } });
  };

  if (activeTab !== 'builder') {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#f8faff] animate-in fade-in duration-500 overflow-hidden text-slate-900">
        <div className="p-10 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Site Studio</h2>
            <p className="text-slate-500 font-medium">Manage your custom sites and autonomous funnel pages.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsAiModalOpen(true)}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all flex items-center"
            >
              <span className="mr-2">✨</span> AI Site Builder
            </button>
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button onClick={() => setActiveTab('sites')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sites' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Custom Sites</button>
              <button onClick={() => setActiveTab('funnels')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'funnels' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Webinar Funnels</button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 pattern-grid-light">
          <div className="max-w-6xl mx-auto">
             {activeTab === 'sites' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   <div 
                      onClick={() => setActiveTab('builder')}
                      className="bg-white p-12 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer group"
                   >
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-slate-50 group-hover:scale-110 transition-transform">+</div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Deploy New Site</p>
                   </div>
                   {elements.length > 0 && (
                     <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm flex flex-col space-y-4 hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="h-40 bg-slate-50 rounded-[2rem] border border-slate-100 mb-2 flex items-center justify-center text-4xl group-hover:rotate-2 transition-transform">🌐</div>
                        <div>
                           <h4 className="text-xl font-black text-slate-900 tracking-tight">Active Canvas Draft</h4>
                           <p className="text-[10px] font-black text-indigo-500 uppercase">{elements.length} Nodes Configured</p>
                        </div>
                        <button onClick={() => setActiveTab('builder')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">Resume Architect</button>
                     </div>
                   )}
                </div>
             ) : (
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-slate-900 px-2 uppercase tracking-tight">Active Funnel Registry</h3>
                   <div className="grid grid-cols-1 gap-4">
                      {webinars.map(w => (
                        <div key={w.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                           <div className="flex items-center space-x-6">
                              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:rotate-6 transition-all">🛰️</div>
                              <div>
                                 <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">{w.title}</h4>
                                 <div className="flex items-center space-x-3 mt-1">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest font-mono">/{w.slug}</span>
                                    <span className="text-slate-200">•</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Neural Routing Enabled</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex space-x-3">
                              <button onClick={() => { setElements([{ id: 'w-f-1', type: 'webinar-form', content: '', config: { webinarId: w.id } }]); setActiveTab('builder'); }} className="px-6 py-2.5 bg-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Edit Page</button>
                              <button onClick={() => window.open(`https://omniportal.app/join/${w.slug}`, '_blank')} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all">View Portal</button>
                           </div>
                        </div>
                      ))}
                      {webinars.length === 0 && (
                        <div className="py-40 text-center opacity-30 italic font-medium">No system funnels detected. Initialize a Webinar session to start.</div>
                      )}
                   </div>
                </div>
             )}
          </div>
        </div>

        {/* AI Build Modal */}
        {isAiModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
             <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_40px_120px_rgba(0,0,0,0.5)] border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-10 border-b border-slate-50 bg-indigo-50/40 flex justify-between items-center">
                   <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl shadow-2xl">✨</div>
                      <div>
                         <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">AI Site Architect</h3>
                         <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2">Neural Design Synthesis</p>
                      </div>
                   </div>
                   <button onClick={() => setIsAiModalOpen(false)} className="p-4 hover:bg-white rounded-full text-slate-400 transition-all">✕</button>
                </div>
                <div className="p-10 space-y-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Site Concept & Objective</label>
                      <textarea 
                         autoFocus
                         className="w-full h-48 p-8 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-[2.5rem] outline-none text-lg font-bold shadow-inner resize-none transition-all placeholder-slate-300"
                         placeholder="e.g. A sleek landing page for a neural networking consulting firm, focusing on enterprise lead generation and service trust."
                         value={aiPrompt}
                         onChange={e => setAiPrompt(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAiBuild()}
                      />
                   </div>
                   <button 
                      onClick={handleAiBuild}
                      disabled={isGenerating || !aiPrompt.trim()}
                      className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all transform active:scale-95 ${isGenerating ? 'bg-slate-800' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/40'}`}
                   >
                      {isGenerating ? (
                        <div className="flex items-center justify-center space-x-4">
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           <span>Synthesizing Components...</span>
                        </div>
                      ) : 'Generate Site Framework'}
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden animate-in zoom-in-95 duration-500 text-slate-900">
      <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={() => setActiveTab('sites')} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-xl font-black text-slate-900">Custom Designer Studio</h2>
          <div className="h-6 w-px bg-slate-100"></div>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Draft: {elements.length} Blocks</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            AI Remix
          </button>
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all active:scale-95">Publish Live</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-white border-r border-slate-200 p-8 space-y-10 shrink-0 overflow-y-auto scrollbar-hide">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Element Library</h3>
            <div className="grid grid-cols-2 gap-3">
              {widgets.map(w => (
                <button 
                  key={w.id} 
                  onClick={() => addWidget(w.id as any)}
                  className="p-6 border-2 border-slate-50 bg-slate-50/50 rounded-3xl flex flex-col items-center justify-center space-y-2 hover:border-indigo-200 hover:bg-indigo-50 transition-all group shadow-sm active:scale-95"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{w.icon}</span>
                  <span className="text-[9px] font-black text-slate-500 group-hover:text-indigo-600 uppercase tracking-tighter text-center leading-none">{w.label}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedElement && (
             <div className="pt-10 border-t border-slate-100 space-y-6 animate-in slide-in-from-bottom-4">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
                  Config: {selectedElement.type.replace('-', ' ')}
                </h4>
                
                {selectedElement.type === 'webinar-form' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Webinar Card</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500"
                      value={selectedElement.config?.webinarId}
                      onChange={(e) => updateConfig('webinarId', e.target.value)}
                    >
                      {webinars.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
                    </select>
                  </div>
                )}

                {selectedElement.type === 'form' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Form Logic</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-black outline-none"
                      value={selectedElement.config?.title}
                      onChange={(e) => updateConfig('title', e.target.value)}
                      placeholder="Form Title"
                    />
                    <div className="flex flex-wrap gap-2">
                       {['Name', 'Email', 'Phone', 'Message', 'Company'].map(field => {
                         const fields = selectedElement.config?.fields || [];
                         const isActive = fields.includes(field);
                         return (
                           <button 
                             key={field}
                             onClick={() => {
                                const nextFields = isActive ? fields.filter((f: string) => f !== field) : [...fields, field];
                                updateConfig('fields', nextFields);
                             }}
                             className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                           >
                             {field}
                           </button>
                         )
                       })}
                    </div>
                  </div>
                )}

                {selectedElement.type === 'list' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Features List</label>
                    <div className="space-y-2">
                      {(selectedElement.config?.items || []).map((item: string, idx: number) => (
                        <div key={idx} className="flex space-x-2">
                          <input 
                            className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold"
                            value={item}
                            onChange={(e) => {
                              const nextItems = [...selectedElement.config.items];
                              nextItems[idx] = e.target.value;
                              updateConfig('items', nextItems);
                            }}
                          />
                          <button onClick={() => updateConfig('items', selectedElement.config.items.filter((_: any, i: number) => i !== idx))} className="text-rose-500">✕</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => updateConfig('items', [...(selectedElement.config?.items || []), 'New Feature'])} className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase">+ Add Item</button>
                  </div>
                )}

                {selectedElement.type === 'testimonial' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Testimonial Info</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-bold"
                      value={selectedElement.content}
                      onChange={(e) => updateSelectedElement({ content: e.target.value })}
                      placeholder="Quote content..."
                    />
                    <input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold" value={selectedElement.config?.author} onChange={(e) => updateConfig('author', e.target.value)} placeholder="Author" />
                    <input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold" value={selectedElement.config?.role} onChange={(e) => updateConfig('role', e.target.value)} placeholder="Role/Company" />
                  </div>
                )}

                {selectedElement.type === 'pricing' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Config</label>
                    <input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold" value={selectedElement.content} onChange={(e) => updateSelectedElement({ content: e.target.value })} placeholder="Plan Name" />
                    <input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold" value={selectedElement.config?.price} onChange={(e) => updateConfig('price', e.target.value)} placeholder="Price" />
                  </div>
                )}

                {(selectedElement.type === 'headline' || selectedElement.type === 'paragraph' || selectedElement.type === 'button') && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Content Mapping</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={selectedElement.content}
                      rows={selectedElement.type === 'paragraph' ? 6 : 2}
                      onChange={(e) => updateSelectedElement({ content: e.target.value })}
                    />
                  </div>
                )}

                {selectedElement.type === 'divider' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Divider Styling</label>
                    <select className="w-full bg-slate-50 border p-3 rounded-xl text-xs font-bold" value={selectedElement.config?.style} onChange={(e) => updateConfig('style', e.target.value)}>
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </div>
                )}

                <button 
                  onClick={() => { setElements(elements.filter(e => e.id !== selectedElement.id)); setSelectedElementId(null); }}
                  className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                >
                  Dissolve Node
                </button>
             </div>
          )}
        </div>

        <div className="flex-1 p-12 overflow-y-auto pattern-grid-light bg-slate-200/30">
          <div className="max-w-4xl mx-auto bg-white min-h-[1200px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] rounded-[4rem] overflow-hidden relative border border-slate-100 p-20 flex flex-col space-y-12">
            
            {elements.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-20 py-40">
                 <div className="text-8xl">🏗️</div>
                 <p className="text-2xl font-black uppercase tracking-[0.4em]">Empty Canvas</p>
                 <button onClick={() => setIsAiModalOpen(true)} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Build with AI Assistant</button>
              </div>
            )}

            {elements.map(el => (
              <div 
                key={el.id} 
                onClick={() => setSelectedElementId(el.id)}
                className={`relative group/el cursor-pointer transition-all ${selectedElementId === el.id ? 'ring-4 ring-indigo-500 ring-offset-8 rounded-2xl' : 'hover:ring-2 hover:ring-slate-200 rounded-2xl'}`}
              >
                {el.type === 'headline' && <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-slate-900 leading-tight whitespace-pre-wrap">{el.content}</h2>}
                
                {el.type === 'paragraph' && <p className="text-lg text-slate-500 font-medium leading-relaxed whitespace-pre-wrap">{el.content}</p>}

                {el.type === 'button' && (
                  <div className="flex py-4">
                    <button className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-900/20 active:scale-95 transition-all">
                       {el.content}
                    </button>
                  </div>
                )}

                {el.type === 'list' && (
                  <ul className="space-y-4">
                    {(el.config?.items || []).map((item: string, i: number) => (
                      <li key={i} className="flex items-center space-x-4 text-lg font-bold text-slate-700">
                        <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {el.type === 'testimonial' && (
                  <div className="bg-indigo-50 rounded-[3rem] p-12 space-y-6">
                    <p className="text-2xl font-black text-indigo-900 italic leading-snug">"{el.content}"</p>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-200"></div>
                      <div>
                        <p className="font-black text-indigo-900 leading-none">{el.config?.author}</p>
                        <p className="text-xs font-bold text-indigo-400 uppercase mt-1">{el.config?.role}</p>
                      </div>
                    </div>
                  </div>
                )}

                {el.type === 'pricing' && (
                  <div className="max-w-md bg-white border border-slate-200 rounded-[3.5rem] p-12 shadow-2xl space-y-8">
                    <div className="text-center space-y-2">
                       <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">{el.content}</h3>
                       <p className="text-5xl font-black text-slate-900">{el.config?.price}<span className="text-lg text-slate-400">/mo</span></p>
                    </div>
                    <ul className="space-y-4 py-8 border-y border-slate-50">
                       {(el.config?.features || []).map((f: string, i: number) => (
                         <li key={i} className="flex items-center space-x-3 text-sm font-bold text-slate-600">
                           <span className="text-indigo-500">✦</span>
                           <span>{f}</span>
                         </li>
                       ))}
                    </ul>
                    <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs">Select Plan</button>
                  </div>
                )}

                {el.type === 'divider' && (
                  <div className="py-4">
                    <hr className={`border-t-${el.config?.thickness || 2} border-slate-200 w-full ${el.config?.style === 'dashed' ? 'border-dashed' : el.config?.style === 'dotted' ? 'border-dotted' : 'border-solid'}`} />
                  </div>
                )}

                {el.type === 'form' && (
                  <div className="bg-slate-50 border border-slate-100 p-12 rounded-[3.5rem] shadow-xl space-y-8 relative overflow-hidden">
                     <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{el.config?.title || 'Form'}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">OmniPortal Lead Collector</p>
                     </div>
                     <div className="grid grid-cols-1 gap-4">
                        {(el.config?.fields || ['Name', 'Email']).map((f: string) => (
                           <div key={f} className="space-y-1.5">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{f}</label>
                              <input disabled className="w-full bg-white border border-slate-200 p-5 rounded-2xl text-slate-400 placeholder-slate-200 font-bold shadow-inner" placeholder={`Enter ${f.toLowerCase()}...`} />
                           </div>
                        ))}
                        <button disabled className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest mt-4 shadow-xl opacity-80">Sync Response</button>
                     </div>
                  </div>
                )}

                {el.type === 'webinar-form' && (
                  <div className="bg-slate-900 p-16 rounded-[4rem] shadow-2xl text-white space-y-10 relative overflow-hidden">
                     <div className="absolute inset-0 pattern-grid opacity-5"></div>
                     <div className="text-center space-y-4 relative">
                        <h3 className="text-3xl font-black tracking-tight uppercase">Reserve Your Seat</h3>
                        <p className="text-slate-400 font-medium italic">Join our upcoming virtual session synced with the OmniPortal Engine.</p>
                     </div>
                     <div className="max-w-md mx-auto space-y-4 relative">
                        <input disabled className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white placeholder-slate-600 font-bold shadow-inner" placeholder="First Name" />
                        <input disabled className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white placeholder-slate-600 font-bold shadow-inner" placeholder="Work Email" />
                        <button disabled className="w-full py-5 bg-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest opacity-50">Link Active Form</button>
                     </div>
                     <div className="pt-4 text-center">
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Form Linked to: {webinars.find(w => w.id === el.config?.webinarId)?.title || 'No Webinar Selected'}</p>
                     </div>
                  </div>
                )}

                {el.type === 'section' && (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-[3rem] p-12 flex flex-col items-center justify-center space-y-4">
                     <p className="text-xl font-black text-indigo-900 tracking-tight text-center whitespace-pre-wrap">{el.content || 'Modular Section Container'}</p>
                  </div>
                )}
                
                {el.type === 'image' && (
                  <div className="aspect-video bg-slate-50 border border-slate-100 rounded-[3.5rem] flex flex-col items-center justify-center text-slate-300">
                     <span className="text-6xl mb-4 opacity-20">🖼️</span>
                     <p className="text-xs font-black uppercase tracking-widest opacity-40">Placeholder Image Asset</p>
                  </div>
                )}

                {el.type === 'video' && (
                  <div className="aspect-video bg-black rounded-[3.5rem] overflow-hidden flex flex-col items-center justify-center text-slate-600 shadow-2xl">
                     <span className="text-6xl mb-4">🎬</span>
                     <p className="text-xs font-black uppercase tracking-widest">Neural Video Layer</p>
                  </div>
                )}
                
                <div className="absolute -top-3 -right-3 opacity-0 group-hover/el:opacity-100 transition-opacity">
                   <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-black shadow-xl border-2 border-white">✎</div>
                </div>
              </div>
            ))}

            <div className="p-32 text-center border-4 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center space-y-6 text-slate-300">
               <div className="text-6xl opacity-10">🏗️</div>
               <p className="font-black uppercase text-xs tracking-[0.3em] opacity-40">Drop elements to expand the narrative</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteBuilder;
