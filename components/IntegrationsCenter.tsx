
import React, { useState } from 'react';
import { Integration } from '../types';

const INITIAL_INTEGRATIONS: Integration[] = [
  { id: 'twilio', name: 'Twilio', category: 'Telephony', icon: '📱', description: 'Cloud communications for SMS and Voice calls.', connected: false },
  { id: 'telnyx', name: 'Telnyx', category: 'Telephony', icon: '📶', description: 'Enterprise-grade telephony with global mobile number support.', connected: false },
  { id: 'vonage', name: 'Vonage', category: 'Telephony', icon: '☎️', description: 'Flexible APIs for voice, video, and text communications.', connected: false },
  { id: 'google-gmail', name: 'Gmail', category: 'Google Workspace', icon: '📧', description: 'Sync emails to tasks and automate replies.', connected: false },
  { id: 'google-calendar', name: 'Google Calendar', category: 'Google Workspace', icon: '📅', description: 'Two-way sync with your personal and team calendars.', connected: true },
  { id: 'google-drive', name: 'Google Drive', category: 'Google Workspace', icon: '📁', description: 'Attach documents and sheets directly to items.', connected: false },
  { id: 'google-sheets', name: 'Google Sheets', category: 'Google Workspace', icon: '📊', description: 'Export board data or import spreadsheet rows.', connected: false },
  { id: 'google-docs', name: 'Google Docs', category: 'Google Workspace', icon: '📄', description: 'Collaborative writing directly within items.', connected: false },
  { id: 'google-slides', name: 'Google Slides', category: 'Google Workspace', icon: '📙', description: 'Manage and link presentation decks to your project milestones.', connected: false },
  { id: 'google-forms', name: 'Google Forms', category: 'Google Workspace', icon: '📝', description: 'Collect data and automatically create items from form submissions.', connected: false },
  { id: 'google-keep', name: 'Google Keep', category: 'Google Workspace', icon: '💡', description: 'Sync notes and quick thoughts to your board.', connected: false },
  { id: 'google-tasks', name: 'Google Tasks', category: 'Google Workspace', icon: '✅', description: 'Sync board tasks with your personal task list.', connected: false },
  { id: 'google-contacts', name: 'Contacts', category: 'Google Workspace', icon: '👥', description: 'Import clients and team members automatically.', connected: false },
  { id: 'google-maps', name: 'Google Maps', category: 'Google Workspace', icon: '📍', description: 'Add locations and calculate distances for tasks.', connected: false },
  { id: 'google-3rd-party', name: '3rd Party Google Account', category: 'Multi-Account', icon: '👤', description: 'Connect additional Google accounts for Gmail, Calendar, and Drive access.', connected: false },
  { id: 'outlook', name: 'Outlook', category: 'Third Party', icon: '📨', description: 'Connect Microsoft 365 emails and calendars.', connected: false },
  { id: 'slack', name: 'Slack', category: 'Communication', icon: '💬', description: 'Receive notifications and update tasks from Slack.', connected: false },
  { id: 'dropbox', name: 'Dropbox', category: 'Third Party', icon: '📦', description: 'Link external files to your work environment.', connected: false },
];

const IntegrationsCenter: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [search, setSearch] = useState('');

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(int => 
      int.id === id ? { ...int, connected: !int.connected } : int
    ));
  };

  const filtered = integrations.filter(int => 
    int.name.toLowerCase().includes(search.toLowerCase()) || 
    int.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Integrations Center</h2>
            <p className="text-slate-500">Connect OmniPortal to your favorite Google, Telephony, and 3rd-party services.</p>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search apps..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
            <div className="absolute left-3 top-2.5 text-slate-400">🔍</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(int => (
            <div key={int.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col space-y-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-3xl shadow-inner">
                    {int.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{int.name}</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{int.category}</span>
                  </div>
                </div>
                {int.connected && (
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-200">
                    CONNECTED
                  </span>
                )}
              </div>
              
              <p className="text-sm text-slate-500 leading-relaxed flex-1">
                {int.description}
              </p>

              <button 
                onClick={() => toggleConnection(int.id)}
                className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${
                  int.connected 
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95'
                }`}
              >
                {int.connected ? 'Disconnect' : 'Connect Account'}
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 italic">No integrations found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationsCenter;
