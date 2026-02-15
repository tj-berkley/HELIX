
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Manuscript, PublishingDestination } from '../types';
import BlogPublishModal from './BlogPublishModal';
import { Icons } from '../constants';

type PlatformTab = 'toolbox' | 'book' | 'script' | 'editor' | 'library';
type WritingGenre = 'Fiction' | 'Non-Fiction' | 'Business' | 'Educational' | 'Sci-Fi' | 'Fantasy';
type Tone = 'Professional' | 'Witty' | 'Bold' | 'Academic' | 'Empowering';

interface BlogPlatformProps {
  manuscriptLibrary: Manuscript[];
  onConvertToMovie?: (title: string, content: string) => void;
  onSaveManuscript?: (manuscript: Manuscript) => void;
}

const TOOLS = [
  { id: 'bulk', label: 'Bulk Article Gen', icon: '📦', desc: 'Generate high-quality, SEO-optimized articles in batches.', color: 'from-blue-500 to-indigo-600' },
  { id: 'short', label: 'Short Info Article', icon: '⚡', desc: 'Quick snippets for newsletters or social insights.', color: 'from-amber-500 to-orange-600' },
  { id: 'outline', label: 'Outline to Article', icon: '📝', desc: 'Interactive: Approve the outline before full AI generation.', color: 'from-emerald-500 to-teal-600' },
  { id: 'amazon', label: 'Amazon Review', icon: '🛒', desc: 'AI-powered product reviews from keyword research.', color: 'from-sky-500 to-blue-600' },
  { id: 'amazon-manual', label: 'Amazon Review (Manual)', icon: '⌨️', desc: 'Granular control over keywords and product IDs.', color: 'from-slate-700 to-slate-900' },
  { id: 'youtube', label: 'YouTube to Article', icon: '🎬', desc: 'Convert video transcriptions into structured blog posts.', color: 'from-rose-500 to-red-600' },
  { id: 'bio', label: 'Biography Article', icon: '👤', desc: 'Intelligent profile pieces with batch processing.', color: 'from-purple-500 to-indigo-600' },
  { id: 'product-link', label: 'Product Link to Blog', icon: '🔗', desc: 'Long-form affiliate content for high conversions.', color: 'from-pink-500 to-rose-600' },
  { id: 'blog-link', label: 'Blog Link to Blog', icon: '🔄', desc: 'Repurpose existing posts into fresh, unique content.', color: 'from-indigo-600 to-blue-700' },
];

const BlogPlatform: React.FC<BlogPlatformProps> = ({ manuscriptLibrary, onConvertToMovie, onSaveManuscript }) => {
  const [activeTab, setActiveTab] = useState<PlatformTab>('toolbox');
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState<WritingGenre>('Non-Fiction');
  const [tone, setTone] = useState<Tone>('Professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  const getBrandVoice = () => {
    const raw = localStorage.getItem('HOBBS_BRAND_VOICE');
    return raw ? JSON.parse(raw) : { audience: 'General', tone: 'Professional', keyPhrases: [], avoidKeywords: [] };
  };

  const handleGenerate = async (mode: PlatformTab | string) => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const voice = getBrandVoice();
      
      let systemPrompt = `Act as a world-class author and expert copywriter.
      BRAND VOICE:
      - Audience: ${voice.audience}
      - Tone Matrix: ${voice.tone}
      - Include: ${voice.keyPhrases.join(', ')}
      - Avoid: ${voice.avoidKeywords.join(', ')}
      
      TASK: Write a piece about "${topic}". `;

      if (mode === 'script') {
        systemPrompt += "FORMATTING: Use professional industry-standard screenplay format (Sluglines, character cues, dialogue).";
      } else if (mode === 'book') {
        systemPrompt += "FORMATTING: Provide a high-level book structure including a table of contents and a detailed opening chapter.";
      } else {
        systemPrompt += "FORMATTING: High-quality, SEO-optimized blog structure with H2/H3 tags and a compelling hook.";
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: systemPrompt,
        config: { thinkingConfig: { thinkingBudget: 6000 } }
      });

      const content = response.text || '';
      setGeneratedContent(content);
      
      const newManuscript: Manuscript = {
        id: `ms-${Date.now()}`,
        title: topic,
        content: content,
        genre,
        tone,
        createdAt: new Date().toISOString()
      };
      
      onSaveManuscript?.(newManuscript);
      setActiveTab('editor');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = (data: { title: string; description: string; destination: PublishingDestination }) => {
    console.log(`Syncing to ${data.destination}:`, data);
    setIsPublishModalOpen(false);
    alert(`Success! "${data.title}" has been published to ${data.destination}.`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden font-sans">
      {/* Dynamic Studio Header */}
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 shadow-sm z-30">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
            Writing Studio <span className="ml-3 text-[10px] bg-indigo-600 text-white px-3 py-1 rounded-full uppercase font-black tracking-widest shadow-lg shadow-indigo-100">AI PRO v4.5</span>
          </h2>
          <p className="text-slate-500 font-medium italic">Powered by the Global Brand Voice engine.</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex bg-slate-100 p-1.5 rounded-[1.8rem] shadow-inner">
            {(['toolbox', 'book', 'script', 'editor', 'library'] as PlatformTab[]).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab === 'toolbox' ? '🧰 Tools' : tab === 'book' ? '📖 Book' : tab === 'script' ? '🎞️ Script' : tab === 'editor' ? '✍️ Canvas' : '📚 Library'}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsPublishModalOpen(true)}
            disabled={!generatedContent}
            className="px-8 py-3 bg-slate-900 text-white rounded-[1.2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition-all transform active:scale-95 disabled:opacity-20"
          >
            Post to Blog
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/50">
        {/* Toolbox View */}
        {activeTab === 'toolbox' && (
          <div className="max-w-7xl mx-auto p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4">
             <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">SEO & Article Toolbox</h3>
                <p className="text-slate-500 font-medium">Select a specialized workflow for high-converting marketing content.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TOOLS.map(tool => (
                  <div 
                    key={tool.id} 
                    onClick={() => { setSelectedToolId(tool.id); setActiveTab('editor'); setTopic(''); setGeneratedContent(''); }}
                    className="bg-white p-8 rounded-[3rem] border-2 border-transparent shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all cursor-pointer group flex flex-col items-start space-y-4 relative overflow-hidden"
                  >
                     <div className={`w-16 h-16 bg-gradient-to-tr ${tool.color} rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform`}>
                        {tool.icon}
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{tool.label}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{tool.desc}</p>
                     </div>
                     <div className="pt-4 flex items-center text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                        Launch Engine <span className="ml-2">→</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Specialized Assistants (Book/Script/Editor) */}
        {(activeTab === 'book' || activeTab === 'script' || activeTab === 'editor') && (
          <div className="max-w-5xl mx-auto p-12 space-y-10 animate-in fade-in">
             <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-8 relative overflow-hidden">
                <div className="flex justify-between items-center">
                   <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg text-white">
                         {activeTab === 'book' ? '📖' : activeTab === 'script' ? '🎞️' : '🖋️'}
                      </div>
                      <div>
                         <h3 className="text-3xl font-black text-slate-900 tracking-tighter capitalize">{activeTab} Architect</h3>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Composition Engine</p>
                      </div>
                   </div>
                   <div className="flex space-x-2">
                      <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full uppercase border border-indigo-100">Brand Voice: Sync Active</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Concept or Keyword</label>
                   <textarea 
                     value={topic}
                     onChange={e => setTopic(e.target.value)}
                     placeholder={activeTab === 'script' ? "A sci-fi noir about a detective chasing an AI ghost in Neo-Tokyo..." : "The ultimate guide to autonomous enterprise agents..."}
                     className="w-full p-8 text-2xl font-black bg-slate-50 border-2 border-transparent rounded-[2.5rem] focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner h-40 resize-none placeholder-slate-200"
                   />
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Genre/Domain</label>
                      <select value={genre} onChange={e => setGenre(e.target.value as WritingGenre)} className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors">
                        {['Fiction', 'Non-Fiction', 'Business', 'Educational', 'Sci-Fi', 'Fantasy'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Tonal Profile</label>
                      <select value={tone} onChange={e => setTone(e.target.value as Tone)} className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors">
                        {['Professional', 'Witty', 'Bold', 'Academic', 'Empowering'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                   </div>
                </div>

                <button 
                  onClick={() => handleGenerate(activeTab)}
                  disabled={isGenerating || !topic.trim()}
                  className={`w-full py-8 rounded-[2.5rem] text-2xl font-black uppercase tracking-widest text-white transition-all transform active:scale-95 shadow-2xl ${isGenerating ? 'bg-slate-800 animate-pulse cursor-wait' : 'bg-slate-900 hover:bg-black shadow-slate-300'}`}
                >
                  {isGenerating ? 'Synthesizing...' : 'Execute AI Draft'}
                </button>
             </div>

             {generatedContent && (
               <div className="bg-white border border-slate-200 rounded-[3rem] p-16 shadow-2xl space-y-10 animate-in zoom-in-95">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-10">
                     <div className="space-y-3">
                        <div className="flex space-x-2">
                           <span className="text-[9px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-[0.2em]">{genre}</span>
                           <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-slate-200">{tone}</span>
                        </div>
                        <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{topic}</h3>
                     </div>
                     {activeTab === 'script' && (
                        <button 
                          onClick={() => onConvertToMovie?.(topic, generatedContent)}
                          className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl shadow-purple-900/20"
                        >
                          Sync to Movie Studio
                        </button>
                     )}
                  </div>
                  <div className="prose prose-slate max-w-none prose-lg">
                     <div className="text-slate-700 leading-relaxed font-serif text-xl whitespace-pre-wrap outline-none selection:bg-indigo-100 min-h-[600px]" contentEditable suppressContentEditableWarning onBlur={(e) => setGeneratedContent(e.currentTarget.innerText)}>
                        {generatedContent}
                     </div>
                  </div>
               </div>
             )}
          </div>
        )}

        {/* Library View */}
        {activeTab === 'library' && (
          <div className="max-w-6xl mx-auto p-12 space-y-8 animate-in fade-in">
             <div className="flex justify-between items-end">
                <h3 className="text-3xl font-black tracking-tighter text-slate-900">Manuscript Library</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{manuscriptLibrary.length} Records Found</span>
             </div>
             <div className="grid grid-cols-1 gap-4">
                {manuscriptLibrary.map(m => (
                  <div key={m.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex justify-between items-center hover:border-indigo-200 hover:shadow-2xl transition-all group">
                     <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">📜</div>
                        <div>
                           <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{m.title}</h4>
                           <div className="flex items-center space-x-3 mt-1">
                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{m.genre}</span>
                              <span className="text-slate-200">•</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(m.createdAt).toLocaleDateString()}</span>
                           </div>
                        </div>
                     </div>
                     <button 
                      onClick={() => { setGeneratedContent(m.content); setTopic(m.title); setActiveTab('editor'); }}
                      className="px-8 py-3 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                     >
                        Open Manuscript
                     </button>
                  </div>
                ))}
                {manuscriptLibrary.length === 0 && (
                  <div className="py-40 text-center space-y-4 opacity-20">
                     <span className="text-8xl">📓</span>
                     <p className="text-2xl font-black uppercase tracking-widest">Library Empty</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>

      {isPublishModalOpen && (
        <BlogPublishModal 
          initialTitle={topic}
          initialDescription={generatedContent.slice(0, 150) + '...'}
          onClose={() => setIsPublishModalOpen(false)}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
};

export default BlogPlatform;
