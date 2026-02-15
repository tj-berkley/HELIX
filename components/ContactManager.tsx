
import React, { useState } from 'react';
import { Contact } from '../types';

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Alice Thompson', email: 'alice@cloudscale.io', company: 'CloudScale', role: 'CTO', status: 'Lead', lastContacted: '2025-02-14' },
  { id: '2', name: 'Bob Roberts', email: 'bob@buildit.com', company: 'BuildIt Corp', role: 'Project Manager', status: 'Customer', lastContacted: '2025-02-10' },
  { id: '3', name: 'Charlie Dean', email: 'cdean@vertex.net', company: 'Vertex Systems', role: 'CEO', status: 'Nurturing', lastContacted: '2025-02-01' },
  { id: '4', name: 'Diana Prince', email: 'diana@themyscira.com', company: 'Amazonia', role: 'Director', status: 'Lost', lastContacted: '2024-12-15' },
];

const ContactManager: React.FC = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact Center</h2>
            <p className="text-slate-500">Manage your pipeline and customer relationships.</p>
          </div>
          <div className="flex items-center space-x-3">
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Filter contacts..." 
                  className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
             </div>
             <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all">Add Contact</button>
          </div>
        </div>

        <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company & Role</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Contact</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_CONTACTS.map(c => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="p-5">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">{c.name[0]}</div>
                       <div>
                         <p className="font-bold text-slate-800">{c.name}</p>
                         <p className="text-xs text-slate-400 font-medium">{c.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="text-sm font-bold text-slate-700">{c.company}</p>
                    <p className="text-xs text-slate-400 font-medium">{c.role}</p>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                      c.status === 'Customer' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      c.status === 'Lead' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      c.status === 'Nurturing' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-slate-500 font-medium">{new Date(c.lastContacted).toLocaleDateString()}</td>
                  <td className="p-5 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors opacity-0 group-hover:opacity-100">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContactManager;
