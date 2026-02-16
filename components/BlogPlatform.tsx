
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Manuscript, PublishingDestination, NotebookNote } from '../types';
import BlogPublishModal from './BlogPublishModal';
import { Icons } from '../constants';
import { generateArticleOutline } from '../services/geminiService';

type PlatformTab = 'toolbox' | 'book' | 'script' | 'editor' | 'library' | 'analysis';
type WritingGenre = 
  | 'Fiction' | 'Non-Fiction' | 'Business' | 'Educational' | 'Sci-Fi' | 'Fantasy'
  | 'Product Review' | 'Amazon Affiliate' | 'Listicle' | 'How-To Guide' 
  | 'Case Study' | 'Whitepaper' | 'Comparison' | 'Location-Based SEO' | 'Newsletter';
type Tone = 'Professional' | 'Witty' | 'Bold' | 'Academic' | 'Empowering' | 'Persuasive' | 'Informative';
type ModelOption = 'gemini-3-flash-preview' | 'gemini-3-pro-preview';

interface BlogPlatformProps {
  manuscriptLibrary: Manuscript[];
  onConvertToMovie?: (title: string, content: string) => void;
  onSaveManuscript?: (manuscript: Manuscript) => void;
  notebookNotes?: NotebookNote[];
}

const TOOLS = [
  { id: 'bulk-seo', label: 'Bulk SEO Generator', icon: '🚀', desc: 'Create hundreds of location and keyword-specific pages in one click.', color: 'from-indigo-600 to-blue-500' },
  { id: 'amazon-review', label: 'Amazon Review Hub', icon: '🛒', desc: 'Automatic product detail extraction and high-converting review synthesis.', color: 'from-amber-500 to-orange-600' },
  { id: 'doc-intel', label: 'Document Intelligence', icon: '🔍', desc: 'Analyze PDFs/Docs to extract summaries and blog drafts.', color: 'from-emerald-600 to-teal-500' },
  { id: 'product-compare', label: 'Product VS Comparison', icon: '⚔️', desc: 'Analyze two products and create a definitive choice guide.', color: 'from-rose-500 to-pink-600' },
  { id: 'location-seo', label: 'Location SEO Landing', icon: '📍', desc: 'Generate landing pages targeting specific cities and zip codes.', color: 'from-sky-500 to-blue-600' },
  { id: 'listicle', label: 'Top 10 Listicle', icon: '🔟', desc: 'Viral "Best of" lists with affiliate link integration.', color: 'from-purple-500 to-indigo-600' },
  { id: 'youtube', label: 'YouTube to Blog', icon: '🎬', desc: 'Convert video content into structured SEO articles.', color: 'from-red-500 to-rose-600' },
  { id: 'case-study', label: 'Enterprise Case Study', icon: '📊', desc: 'Data-driven results pieces to prove brand authority.', color: 'from-slate-700 to-slate-900' },
];

const BlogPlatform: React.FC<BlogPlatformProps> = ({ manuscriptLibrary, onConvertToMovie, onSaveManuscript, notebookNotes = [] }) => {
  const [activeTab, setActiveTab] = useState<PlatformTab>('toolbox');
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState<WritingGenre>('Non-Fiction');
  const [tone, setTone] = useState<Tone>('Professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [selectedModel, setSelectedModel] = useState<ModelOption>('gemini-3-pro-preview');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [useNotebookContext, setUseNotebookContext] = useState(notebookNotes.length > 0);

  // Advanced SEO & Product State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<typeof TOOLS[0] | null>(null);
  const [affiliateLink, setAffiliateLink] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [targetLocations, setTargetLocations] = useState('');
  const [productDetails, setProductDetails] = useState<{ title?: string; image?: string; specs?: string[] } | null>(null);
  
  // Outline State
  const [outline, setOutline] = useState<string[]>([]);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [showOutlineEditor, setShowOutlineEditor] = useState(false);

  const [analysisFile, setAnalysisFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Setup Speech to Text
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTopic(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const getBrandVoice = () => {
    const raw = localStorage.getItem('HOBBS_BRAND_VOICE');
    return raw ? JSON.parse(raw) : { audience: 'General', tone: 'Professional', keyPhrases: [], avoidKeywords: [] };
  };

  const handleFetchProduct = async () => {
    if (!targetUrl.trim()) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Fetch and summarize product details for this URL: ${targetUrl}.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              image: { type: Type.STRING },
              specs: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      const data = JSON.parse(response.text || '{}');
      setProductDetails(data);
      if (data.title) setTopic(data.title);
    } catch (e) { console.error(e); }
  };

  const handleGenerateOutline = async () => {
    if (!topic.trim()) return;
    setIsGeneratingOutline(true);
    try {
      const voice = getBrandVoice();
      const headers = await generateArticleOutline(topic, seoKeywords, voice);
      setOutline(headers);
      setShowOutlineEditor(true);
    } catch (e) { console.error(e); }
    finally { setIsGeneratingOutline(false); }
  };

  const handleGenerate = async (mode: PlatformTab | string) => {
    const finalTopic = topic.trim();
    if (!finalTopic) return;
    setIsGenerating(true);
    setIsConfigModalOpen(false);
    setShowOutlineEditor(false);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const voice = getBrandVoice();
      const notebookContext = useNotebookContext ? notebookNotes.map(n => `[Research Insight: ${n.title}] ${n.content}`).join('\n') : '';

      let systemPrompt = `Act as a world-class SEO strategist and conversion copywriter.
      BRAND VOICE: ${voice.tone}
      AUDIENCE: ${voice.audience}
      ${notebookContext ? `GROUNDING RESEARCH DATA:\n${notebookContext}\n` : ''}
      TASK: Write a full article on "${finalTopic}" using the tool ${selectedTool?.label || mode}. 
      Keywords: ${seoKeywords}. Locations: ${targetLocations}.`;

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: systemPrompt,
        config: {
          tools: selectedModel.includes('pro') ? [{ googleSearch: {} }] : undefined,
          thinkingConfig: selectedModel.includes('pro') ? { thinkingBudget: 4000 } : undefined
        }
      });

      const content = response.text || '';
      setGeneratedContent(content);
      
      const newManuscript: Manuscript = {
        id: `ms-${Date.now()}`,
        title: finalTopic,
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
    setIsPublishModalOpen(false);
    alert(`Manuscript "${data.title}" successfully synced to ${data.destination}!`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden font-sans">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center bg-white shrink-0 shadow-sm z-30">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Writing Studio</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Global Brand Voice Engine</p>
        </div>

        <div className="px-10 shrink-0">
          <button 
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center space-x-3 hover:bg-purple-700 transition-all active:scale-95"
          >
            <span>AI {selectedModel.includes('pro') ? 'PRO' : 'FLASH'}</span>
            <Icons.ChevronDown className={`w-3.5 h-3.5 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex-1 flex justify-end items-center space-x-6">
          <div className="flex bg-slate-100 p-1.5 rounded-[1.8rem] shadow-inner">
            {(['toolbox', 'book', 'script', 'editor', 'library', 'analysis'] as PlatformTab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab === 'toolbox' ? '🧰 Tools' : tab === 'book' ? '📖 Book' : tab === 'script' ? '🎞️ Script' : tab === 'editor' ? '✍️ Canvas' : tab === 'library' ? '📚 Library' : '🔍 Analysis'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/50 relative">
        {activeTab === 'toolbox' && (
          <div className="max-w-7xl mx-auto p-12 space-y-12 animate-in fade-in">
             <div className="flex justify-between items-start">
               <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">SEO & Article Toolbox</h3>
                  <p className="text-slate-500 font-medium text-xl italic max-w-lg">Advanced workflows for marketing dominance.</p>
               </div>
               {notebookNotes.length > 0 && (
                 <div className="flex items-center space-x-3 bg-white p-4 rounded-3xl border border-indigo-100 shadow-sm">
                    <div className={`w-3 h-3 rounded-full ${useNotebookContext ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Notebook Research Sync</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={useNotebookContext} onChange={() => setUseNotebookContext(!useNotebookContext)} />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                 </div>
               )}
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TOOLS.map(tool => (
                  <div key={tool.id} onClick={() => tool.id === 'doc-intel' ? setActiveTab('analysis') : (setSelectedTool(tool), setIsConfigModalOpen(true))} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all cursor-pointer group flex flex-col items-start space-y-6">
                     <div className={`w-20 h-20 bg-gradient-to-tr ${tool.color} rounded-[2rem] flex items-center justify-center text-4xl shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform`}>{tool.icon}</div>
                     <div className="space-y-2">
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{tool.label}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{tool.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {(activeTab === 'book' || activeTab === 'script' || activeTab === 'editor') && (
          <div className="max-w-5xl mx-auto p-12 space-y-12 animate-in fade-in">
             <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 space-y-10 relative overflow-hidden">
                <div className="flex justify-between items-center">
                   <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-lg text-white">{activeTab === 'book' ? '📖' : activeTab === 'script' ? '🎞️' : '🖋️'}</div>
                      <div>
                         <h3 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">{activeTab} Architect</h3>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Neural Composition Engine</p>
                      </div>
                   </div>
                   <div className="flex space-x-2">
                      <button onClick={toggleListening} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400 hover:text-indigo-600'}`}>🎙️</button>
                      {notebookNotes.length > 0 && (
                        <button onClick={() => setUseNotebookContext(!useNotebookContext)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${useNotebookContext ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            {useNotebookContext ? 'Research Sync: ON' : 'Research Sync: OFF'}
                        </button>
                      )}
                   </div>
                </div>
                <div className="space-y-4">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Project Directive</label>
                   <textarea value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-10 text-3xl font-black bg-slate-50 border-2 border-transparent rounded-[3rem] focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner h-48 resize-none placeholder-slate-200" placeholder="Describe the focus or speak your intent..." />
                </div>
                <button onClick={() => handleGenerate(activeTab)} disabled={isGenerating || !topic.trim()} className={`w-full py-10 rounded-[3rem] text-3xl font-black uppercase tracking-[0.3em] text-white transition-all transform active:scale-95 shadow-[0_30px_60px_rgba(15,23,42,0.3)] ${isGenerating ? 'bg-slate-800 animate-pulse' : 'bg-slate-900 hover:bg-black'}`}>{isGenerating ? 'Synthesizing...' : 'Execute Neural Draft'}</button>
             </div>
             {generatedContent && (
               <div className="bg-white border border-slate-200 rounded-[4rem] p-20 shadow-2xl space-y-12 animate-in zoom-in-95 duration-500">
                  <h3 className="text-6xl font-black text-slate-900 tracking-tighter leading-none uppercase">{topic}</h3>
                  <div className="prose prose-slate max-w-none prose-xl"><div className="text-slate-800 leading-relaxed font-serif text-2xl whitespace-pre-wrap outline-none selection:bg-indigo-100 min-h-[800px] px-2" contentEditable suppressContentEditableWarning onBlur={(e) => setGeneratedContent(e.currentTarget.innerText)}>{generatedContent}</div></div>
               </div>
             )}
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
