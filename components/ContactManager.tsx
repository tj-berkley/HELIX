
import React, { useState } from 'react';
import { Contact, LeadCategory } from '../types';

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Alice Thompson', email: 'alice@cloudscale.io', company: 'CloudScale', role: 'CTO', status: 'Lead', lastContacted: '2025-02-14', category: 'Legal Help' },
  { id: '2', name: 'Bob Roberts', email: 'bob@buildit.com', company: 'BuildIt Corp', role: 'Project Manager', status: 'Customer', lastContacted: '2025-02-10', category: 'Insurance' },
  { id: '3', name: 'Charlie Dean', email: 'cdean@vertex.net', company: 'Vertex Systems', role: 'CEO', status: 'Nurturing', lastContacted: '2025-02-01', category: 'Financial' },
  { id: '4', name: 'Diana Prince', email: 'diana@themyscira.com', company: 'Amazonia', role: 'Director', status: 'Lost', lastContacted: '2024-12-15', category: 'Real Estate' },
  { id: '5', name: 'Satoshi Nakamoto', email: 'sat@block.chain', company: 'Protocol Zero', role: 'Architect', status: 'Lead', lastContacted: '2025-02-18', category: 'Crypto' },
];

const LEAD_CATEGORIES: LeadCategory[] = [
  'Insurance', 'Home Security', 'Legal Help', 'Incident Reports', 'Doctors', 
  'Home Services', 'Loans', 'Real Estate', 'Flights', 'Hotels', 'Car Rentals', 
  'Cruises', 'Packages', 'Auto Dealerships', 'Realtor', 'Lawyer', 
  'Contractor', 'Financial', 'Crypto', 'Auto Repair'
];

const ContactManager: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState<'Directory' | 'Lead Hub'>('Directory');
  const [selectedLeadCategory, setSelectedLeadCategory] = useState<LeadCategory | 'All'>('All');

  const filteredContacts = MOCK_CONTACTS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedLeadCategory === 'All' || c.category === selectedLeadCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex overflow-hidden bg-white animate-in fade-in">
      {/* Category Sidebar (Visible in Lead Hub) */}
      {activeView === 'Lead Hub' && (
        <div className="w-64 border-r border-slate-100 bg-slate-50/50 overflow-y-auto p-8 space-y-6 shrink-0 scrollbar-hide">
           <div className="space-y-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Vertical Filters</h3>
              <p className="text-xs font-bold text-slate-900 px-2 tracking-tight">Active Categories</p>
           </div>
           <nav className="space-y-1">
              <button 
                onClick={() => setSelectedLeadCategory('All')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedLeadCategory === 'All' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                All Verticals
              </button>
              {LEAD_CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedLeadCategory(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedLeadCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {cat}
                </button>
              ))}
           </nav>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-end border-b border-slate-100 pb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">{activeView}</h2>
                 <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/50">
                    {['Directory', 'Lead Hub'].map(v => (
                      <button key={v} onClick={() => { setActiveView(v as any); setSelectedLeadCategory('All'); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{v}</button>
                    ))}
                 </div>
              </div>
              <p className="text-slate-500 font-medium">Manage pipeline intelligence across all sectors.</p>
            </div>
            <div className="flex items-center space-x-3 mb-1">
               <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search people or entities..." 
                    className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-[1.2rem] text-xs font-bold w-72 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
               </div>
               <button className="px-8 py-3 bg-slate-900 text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest hover:bg-black shadow-xl active:scale-95 transition-all">Add Record</button>
            </div>
          </div>

          <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/40">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identify</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity & Role</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map(c => (
                  <tr key={c.id} className="hover:bg-indigo-50/20 transition-all group cursor-pointer">
                    <td className="p-6">
                      <div className="flex items-center space-x-4">
                         <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-lg border border-white/20">{c.name[0]}</div>
                         <div>
                           <p className="font-black text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">{c.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-black text-slate-700 tracking-tight">{c.company}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.role}</p>
                    </td>
                    <td className="p-6">
                       <span className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200 group-hover:bg-white transition-colors">{c.category || 'General'}</span>
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                        c.status === 'Customer' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        c.status === 'Lead' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        c.status === 'Nurturing' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(c.lastContacted).toLocaleDateString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredContacts.length === 0 && (
              <div className="py-40 text-center space-y-4 opacity-20">
                 <span className="text-8xl">🏜️</span>
                 <p className="text-2xl font-black uppercase tracking-[0.4em]">No Records in this sector</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactManager;
