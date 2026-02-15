
import React, { useState, useEffect } from 'react';
import { Contact, LeadCategory, CustomFieldValue } from '../types';

const INITIAL_MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Alice Thompson', email: 'alice@cloudscale.io', company: 'CloudScale', role: 'CTO', status: 'Lead', lastContacted: '2025-02-14', category: 'Legal Help', customFields: [] },
  { id: '2', name: 'Bob Roberts', email: 'bob@buildit.com', company: 'BuildIt Corp', role: 'Project Manager', status: 'Customer', lastContacted: '2025-02-10', category: 'Insurance', customFields: [] },
  { id: '3', name: 'Charlie Dean', email: 'cdean@vertex.net', company: 'Vertex Systems', role: 'CEO', status: 'Nurturing', lastContacted: '2025-02-01', category: 'Financial', customFields: [] },
  { id: '4', name: 'Diana Prince', email: 'diana@themyscira.com', company: 'Amazonia', role: 'Director', status: 'Lost', lastContacted: '2024-12-15', category: 'Real Estate', customFields: [] },
  { id: '5', name: 'Satoshi Nakamoto', email: 'sat@block.chain', company: 'Protocol Zero', role: 'Architect', status: 'Lead', lastContacted: '2025-02-18', category: 'Crypto', customFields: [] },
];

const LEAD_CATEGORIES: LeadCategory[] = [
  'Insurance', 'Home Security', 'Legal Help', 'Incident Reports', 'Doctors', 
  'Home Services', 'Loans', 'Real Estate', 'Flights', 'Hotels', 'Car Rentals', 
  'Cruises', 'Packages', 'Auto Dealerships', 'Realtor', 'Lawyer', 
  'Contractor', 'Financial', 'Crypto', 'Auto Repair'
];

const ContactModal: React.FC<{
  contact: Partial<Contact> | null;
  onClose: () => void;
  onSave: (contact: Contact) => void;
}> = ({ contact, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Contact>>(() => contact || {
    name: '',
    email: '',
    company: '',
    role: '',
    status: 'Lead',
    lastContacted: new Date().toISOString().split('T')[0],
    category: 'Insurance',
    customFields: []
  });

  const [newFieldName, setNewFieldName] = useState('');

  const handleAddCustomField = () => {
    if (!newFieldName.trim()) return;
    const key = newFieldName.trim();
    const existingFields = formData.customFields || [];
    if (existingFields.find(f => f.key === key)) {
      alert("Field already exists.");
      return;
    }
    setFormData({
      ...formData,
      customFields: [...existingFields, { key, value: '' }]
    });
    setNewFieldName('');
  };

  const handleUpdateCustomField = (key: string, value: string) => {
    const updated = (formData.customFields || []).map(f => f.key === key ? { ...f, value } : f);
    setFormData({ ...formData, customFields: updated });
  };

  const handleRemoveCustomField = (key: string) => {
    const updated = (formData.customFields || []).filter(f => f.key !== key);
    setFormData({ ...formData, customFields: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    const finalContact: Contact = {
      id: formData.id || `c-${Date.now()}`,
      name: formData.name || '',
      email: formData.email || '',
      company: formData.company || '',
      role: formData.role || '',
      status: formData.status as any || 'Lead',
      lastContacted: formData.lastContacted || new Date().toISOString().split('T')[0],
      category: formData.category as any || 'Insurance',
      customFields: formData.customFields || []
    };
    onSave(finalContact);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-indigo-50/30 dark:bg-indigo-950/20">
          <div className="flex items-center space-x-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">👤</div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{formData.id ? 'Edit Profile' : 'New Identity'}</h3>
                <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Global CRM Registry</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Display Name</label>
                 <input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold dark:text-white shadow-inner outline-none transition-all"
                    placeholder="Full Name"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Email Access</label>
                 <input 
                    required 
                    type="email"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold dark:text-white shadow-inner outline-none transition-all"
                    placeholder="email@example.com"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Company / Entity</label>
                 <input 
                    value={formData.company} 
                    onChange={e => setFormData({...formData, company: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold dark:text-white shadow-inner outline-none transition-all"
                    placeholder="Enterprise Name"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Role Title</label>
                 <input 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold dark:text-white shadow-inner outline-none transition-all"
                    placeholder="e.g. CTO, Architect"
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Sector category</label>
                 <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-xs font-black uppercase text-slate-900 dark:text-white outline-none shadow-inner appearance-none"
                 >
                    {LEAD_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Lifecycle Phase</label>
                 <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-xs font-black uppercase text-slate-900 dark:text-white outline-none shadow-inner appearance-none"
                 >
                    <option value="Lead">Lead</option>
                    <option value="Customer">Customer</option>
                    <option value="Nurturing">Nurturing</option>
                    <option value="Lost">Lost</option>
                 </select>
              </div>
           </div>

           <div className="pt-6 border-t border-slate-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-6 px-2">
                 <h4 className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Neural Custom Parameters</h4>
                 <span className="text-[9px] font-bold text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-1 rounded-full uppercase">Dynamic Scaling Active</span>
              </div>
              
              <div className="space-y-3 mb-6">
                 {(formData.customFields || []).map((f, idx) => (
                    <div key={idx} className="flex items-center space-x-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 group">
                       <div className="w-1/3">
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter mb-1">Param Key</p>
                          <p className="text-xs font-black text-slate-900 dark:text-white truncate">{f.key}</p>
                       </div>
                       <div className="flex-1">
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter mb-1">Value Injection</p>
                          <input 
                             value={f.value} 
                             onChange={e => handleUpdateCustomField(f.key, e.target.value)}
                             placeholder="Set value..."
                             className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                       </div>
                       <button 
                          type="button"
                          onClick={() => handleRemoveCustomField(f.key)}
                          className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-all"
                       >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                    </div>
                 ))}
              </div>

              <div className="flex space-x-2 bg-indigo-50/30 dark:bg-indigo-950/10 p-2 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 border-dashed">
                 <input 
                    placeholder="New Intelligence Field Name..." 
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 text-xs font-bold dark:text-white outline-none"
                    value={newFieldName}
                    onChange={e => setNewFieldName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomField())}
                 />
                 <button 
                    type="button"
                    onClick={handleAddCustomField}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                 >
                    + Define Field
                 </button>
              </div>
           </div>
        </form>

        <div className="p-8 border-t border-slate-100 dark:border-white/5 flex justify-end space-x-4 bg-slate-50/30 dark:bg-slate-900/40">
           <button onClick={onClose} className="px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-600 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition-all">Dismiss</button>
           <button 
              onClick={handleSubmit}
              className="px-12 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-black dark:hover:bg-indigo-700 transition-all transform active:scale-95"
           >
              Commit Record
           </button>
        </div>
      </div>
    </div>
  );
};

const ContactManager: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('OMNI_CONTACTS_V2');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_CONTACTS;
  });
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState<'Directory' | 'Lead Hub'>('Directory');
  const [selectedLeadCategory, setSelectedLeadCategory] = useState<LeadCategory | 'All'>('All');
  const [modalState, setModalState] = useState<{ isOpen: boolean; contact: Contact | null }>({ isOpen: false, contact: null });

  useEffect(() => {
    localStorage.setItem('OMNI_CONTACTS_V2', JSON.stringify(contacts));
  }, [contacts]);

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                         c.company.toLowerCase().includes(search.toLowerCase()) ||
                         c.email.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedLeadCategory === 'All' || c.category === selectedLeadCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveContact = (contact: Contact) => {
    const exists = contacts.find(c => c.id === contact.id);
    if (exists) {
      setContacts(contacts.map(c => c.id === contact.id ? contact : c));
    } else {
      setContacts([contact, ...contacts]);
    }
    setModalState({ isOpen: false, contact: null });
  };

  const deleteContact = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Purge this identity from the matrix?")) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white dark:bg-[#0c0e12] animate-in fade-in transition-colors">
      {/* Category Sidebar (Visible in Lead Hub) */}
      {activeView === 'Lead Hub' && (
        <div className="w-64 border-r border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 overflow-y-auto p-8 space-y-6 shrink-0 scrollbar-hide">
           <div className="space-y-1">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest px-2">Vertical Filters</h3>
              <p className="text-xs font-bold text-slate-900 dark:text-white px-2 tracking-tight">Active Categories</p>
           </div>
           <nav className="space-y-1">
              <button 
                onClick={() => setSelectedLeadCategory('All')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedLeadCategory === 'All' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
              >
                All Verticals
              </button>
              {LEAD_CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedLeadCategory(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedLeadCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                >
                  {cat}
                </button>
              ))}
           </nav>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-transparent">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-end border-b border-slate-100 dark:border-white/5 pb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                 <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{activeView}</h2>
                 <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl shadow-inner border border-slate-200/50 dark:border-white/10">
                    {['Directory', 'Lead Hub'].map(v => (
                      <button key={v} onClick={() => { setActiveView(v as any); setSelectedLeadCategory('All'); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}>{v}</button>
                    ))}
                 </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium italic">Synchronizing global pipeline intelligence across {contacts.length} nodes.</p>
            </div>
            <div className="flex items-center space-x-3 mb-1">
               <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search people or entities..." 
                    className="pl-12 pr-6 py-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.2rem] text-xs font-bold dark:text-white w-72 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/30 transition-all outline-none shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
               </div>
               <button 
                  onClick={() => setModalState({ isOpen: true, contact: null })}
                  className="px-8 py-3.5 bg-indigo-600 text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 transition-all"
               >
                  Add Record
               </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/40 dark:shadow-none transition-colors">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <tr>
                  <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Identify</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Entity & Role</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Category</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Phase</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredContacts.map(c => (
                  <tr 
                    key={c.id} 
                    onClick={() => setModalState({ isOpen: true, contact: c })}
                    className="hover:bg-indigo-50/20 dark:hover:bg-indigo-500/5 transition-all group cursor-pointer"
                  >
                    <td className="p-6">
                      <div className="flex items-center space-x-4">
                         <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-lg border border-white/20 group-hover:scale-110 transition-transform">{c.name[0]}</div>
                         <div>
                           <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{c.name}</p>
                           <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">{c.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight">{c.company}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">{c.role}</p>
                    </td>
                    <td className="p-6">
                       <span className="px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-600 text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/5 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">{c.category || 'General'}</span>
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors shadow-sm ${
                        c.status === 'Customer' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' :
                        c.status === 'Lead' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' :
                        c.status === 'Nurturing' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' :
                        'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-700 border-slate-200 dark:border-white/5'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                       <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => deleteContact(c.id, e)}
                            className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Delete Record"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                          <button 
                            className="p-3 bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl transition-all shadow-xl hover:bg-indigo-600 dark:hover:bg-indigo-400"
                            title="Open Profile"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredContacts.length === 0 && (
              <div className="py-40 text-center space-y-6 opacity-30 animate-pulse">
                 <span className="text-9xl">🏜️</span>
                 <div className="space-y-2 px-8">
                    <p className="text-3xl font-black uppercase tracking-[0.4em] dark:text-white">Sector Vacuum</p>
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">No Identities found in current parameter sweep.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalState.isOpen && (
        <ContactModal 
          contact={modalState.contact} 
          onClose={() => setModalState({ isOpen: false, contact: null })}
          onSave={handleSaveContact}
        />
      )}
    </div>
  );
};

export default ContactManager;