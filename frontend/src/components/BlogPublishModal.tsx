
import React, { useState } from 'react';
import { PublishingDestination } from '../types';

interface BlogPublishModalProps {
  onClose: () => void;
  onPublish: (data: { title: string; description: string; destination: PublishingDestination }) => void;
  initialTitle?: string;
  initialDescription?: string;
}

const BlogPublishModal: React.FC<BlogPublishModalProps> = ({ onClose, onPublish, initialTitle = '', initialDescription = '' }) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [destination, setDestination] = useState<PublishingDestination>('WordPress');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onPublish({ title, description, destination });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-10 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Ready to Publish</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cross-Platform Distribution</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Article Title</label>
            <input 
              type="text" 
              required
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-900"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Meta Description / Summary</label>
            <textarea 
              required
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-slate-600 h-24 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Select Destination CMS</label>
            <div className="grid grid-cols-2 gap-3">
              {(['WordPress', 'Blogger', 'Shopify', 'Webhook'] as PublishingDestination[]).map(dest => (
                <button 
                  key={dest}
                  type="button"
                  onClick={() => setDestination(dest)}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center space-x-3 ${destination === dest ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'}`}
                >
                  <span className="text-lg">
                    {dest === 'WordPress' && 'Ⓜ️'}
                    {dest === 'Blogger' && '🅱️'}
                    {dest === 'Shopify' && '🛒'}
                    {dest === 'Webhook' && '🔌'}
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest">{dest}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 flex space-x-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`flex-[2] py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all flex items-center justify-center space-x-3 ${isSubmitting ? 'bg-slate-800 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/20 active:scale-95'}`}
            >
              {isSubmitting ? (
                 <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Syncing...</span>
                 </>
              ) : (
                <>
                  <span>Post to {destination}</span>
                  <span>🚀</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogPublishModal;
