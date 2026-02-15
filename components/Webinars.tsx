
import React, { useState } from 'react';
import { Webinar } from '../types';
import { GoogleGenAI } from "@google/genai";

const MOCK_WEBINARS: Webinar[] = [
  { id: 'w1', title: 'The Future of AI Automation', date: '2025-03-01', invites: 1500, showUps: 450, buyers: 42, status: 'Live', transcript: "Hi everyone, welcome to the AI Automation workshop. Today we are discussing legal help and insurance workflows. Let's make an appointment for the review next Tuesday. Send a follow up email to all attendees about the new invoice template." },
  { id: 'w2', title: 'Creative Directing for Pros', date: '2025-02-15', invites: 800, showUps: 320, buyers: 18, status: 'Completed' },
  { id: 'w3', title: 'Scaling Agency Operations', date: '2025-03-10', invites: 2500, showUps: 0, buyers: 0, status: 'Upcoming' },
];

const Webinars: React.FC = () => {
  const [webinars] = useState<Webinar[]>(MOCK_WEBINARS);
  const [processingWebinar, setProcessingWebinar] = useState<string | null>(null);
  const [aiActions, setAiActions] = useState<string[]>([]);

  const runNeuralScan = async (webinar: Webinar) => {
    if (!webinar.transcript) return;
    setProcessingWebinar(webinar.id);
    setAiActions([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this webinar transcript and identify business tasks to execute. Tasks include: Set appointments, fill paperwork, generate invoices, send follow-up emails.
        Transcript: "${webinar.transcript}"
        Return a list of specific actions as short strings.`,
      });

      const actions = response.text?.split('\n').filter(a => a.trim()) || [];
      setAiActions(actions);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingWebinar(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-12 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-end border-b border-slate-200 pb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Webinar Center</h2>
            <p className="text-slate-500 font-medium text-lg">Orchestrate live broadcasts and automated conversion funnels.</p>
          </div>
          <button className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-black active:scale-95 transition-all">➕ New Broadcast</button>
        </div>

        <div className="grid grid-cols-1 gap-8">
           {webinars.map(w => (
             <div key={w.id} className="bg-white rounded-[3.5rem] border border-slate-200 p-10 shadow-sm hover:shadow-2xl transition-all group flex flex-col lg:flex-row lg:items-center gap-12">
                <div className="lg:w-1/3 space-y-4">
                   <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${w.status === 'Live' ? 'bg-rose-500 animate-pulse' : w.status === 'Completed' ? 'bg-slate-400' : 'bg-indigo-500'}`}></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{w.status} // {w.date}</span>
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">{w.title}</h3>
                   <div className="flex space-x-4 pt-2">
                      <button className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all">Edit Link</button>
                      <button className="px-5 py-2 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Invites</button>
                   </div>
                </div>

                <div className="lg:flex-1 grid grid-cols-3 gap-8">
                   <div className="bg-slate-50 rounded-[2rem] p-6 text-center shadow-inner border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Invites</p>
                      <p className="text-2xl font-black text-slate-900">{w.invites.toLocaleString()}</p>
                   </div>
                   <div className="bg-slate-50 rounded-[2rem] p-6 text-center shadow-inner border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Show-ups</p>
                      <p className="text-2xl font-black text-slate-900">{w.showUps.toLocaleString()}</p>
                      <p className="text-[8px] font-bold text-indigo-400 mt-1">{w.invites ? Math.round((w.showUps/w.invites)*100) : 0}% Rate</p>
                   </div>
                   <div className="bg-slate-50 rounded-[2rem] p-6 text-center shadow-inner border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Buyers</p>
                      <p className="text-2xl font-black text-emerald-600">{w.buyers.toLocaleString()}</p>
                      <p className="text-[8px] font-bold text-emerald-400 mt-1">{w.showUps ? Math.round((w.buyers/w.showUps)*100) : 0}% Conv</p>
                   </div>
                </div>

                <div className="lg:w-64 space-y-3">
                   <button 
                    disabled={!w.transcript || processingWebinar === w.id}
                    onClick={() => runNeuralScan(w)}
                    className="w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-[9px] tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-20"
                   >
                      {processingWebinar === w.id ? 'Analyzing Audio...' : 'Run Neural Scan'}
                   </button>
                   <p className="text-[8px] text-center text-slate-400 font-bold uppercase">Process Audio to Text</p>
                </div>
             </div>
           ))}
        </div>

        {aiActions.length > 0 && (
          <div className="bg-white rounded-[3.5rem] p-12 border-4 border-indigo-100 shadow-2xl animate-in zoom-in-95 duration-500 space-y-8">
             <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg text-white">✨</div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Neural Automation Queue</h3>
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Identified Actions from Broadcast</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiActions.map((action, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-300 transition-all">
                      <span className="text-sm font-bold text-slate-700">{action}</span>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Execute</button>
                   </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Webinars;
