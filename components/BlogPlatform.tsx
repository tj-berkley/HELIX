
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
  
  // Advanced SEO & Product State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<typeof TOOLS[0] | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [targetLocations, setTargetLocations] = useState('');
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  
  // Analysis Tab State
  const [analysisUrl, setAnalysisUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const toggleNoteSelection = (id: string) => {
    setSelectedNoteIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleGenerate = async (mode: PlatformTab | string) => {
    const finalTopic = topic.trim() || (selectedTool ? selectedTool.label : "Untitled Document");
    setIsGenerating(true);
    setIsConfigModalOpen(false);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const voice = getBrandVoice();
      
      const attachedNotesContent = notebookNotes
        .filter(n => selectedNoteIds.includes(n.id))
        .map(n => `[Research Note: ${n.title}]\n${n.content}`)
        .join('\n\n');

      let systemPrompt = `Act as a world-class SEO strategist and high-conversion copywriter.
      BRAND VOICE: ${voice.tone}
      AUDIENCE: ${voice.audience}
      
      ${attachedNotesContent ? `GROUNDING KNOWLEDGE BASE (USE THIS CONTENT):\n${attachedNotesContent}\n` : ''}
      
      TASK: Execute the following tool: "${selectedTool?.label || mode}". 
      TOPIC/INTENT: "${topic}"
      URL REFERENCE: ${targetUrl}
      TARGET KEYWORDS: ${seoKeywords}
      LOCATIONS: ${targetLocations}
      
      Write a full, high-quality article including SEO-optimized headers. Ensure it feels grounded in the research provided.`;

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
      alert("Neural synthesis interrupted. Check connectivity.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Fix: Added missing handlePublish function to process publication events from the modal
  const handlePublish = (data: { title: string; description: string; destination: PublishingDestination }) => {
    setIsPublishModalOpen(false);
    alert(`Neural dispatch successful! Article "${data.title}" synchronized with ${data.destination}.`);
  };

  const handleDeepAnalysis = async () => {
    if (!analysisUrl.trim() && !topic.trim()) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Perform a deep document and content analysis for the following:
        ${analysisUrl ? `URL: ${analysisUrl}` : ''}
        ${topic ? `TOPIC/TEXT: ${topic}` : ''}
        
        Extract core themes, sentiment, entity data, and provide a 500-word executive brief.`,
        config: {
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });
      setAnalysisResult(response.text || '');
    } catch (e) {
      console.error(e);
      alert("Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden font-sans text-slate-900">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center bg-white shrink-0 shadow-sm z-30">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-black tracking-tight">Writing Studio</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Global Brand Voice Engine</p>
        </div>

        <div className="px-10 shrink-0 relative">
          <button 
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center space-x-3 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <span>AI {selectedModel.includes('pro') ? 'PRO' : 'FLASH'}</span>
            <Icons.ChevronDown className={`w-3.5 h-3.5 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showModelDropdown && (
            <div className="absolute top-full right-10 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 animate-in zoom-in-95">
              <button onClick={() => { setSelectedModel('gemini-3-pro-preview'); setShowModelDropdown(false); }} className={`w-full text-left p-4 rounded-xl text-[10px] font-black uppercase transition-all ${selectedModel === 'gemini-3-pro-preview' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50'}`}>Pro (Deep Thinking)</button>
              <button onClick={() => { setSelectedModel('gemini-3-flash-preview'); setShowModelDropdown(false); }} className={`w-full text-left p-4 rounded-xl text-[10px] font-black uppercase transition-all ${selectedModel === 'gemini-3-flash-preview' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50'}`}>Flash (High Speed)</button>
            </div>
          )}
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
             <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">SEO & Article Toolbox</h3>
                <p className="text-slate-500 font-medium text-xl italic">Deploy advanced marketing logic directly into your canvas.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TOOLS.map(tool => (
                  <div 
                    key={tool.id} 
                    onClick={() => { setSelectedTool(tool); setIsConfigModalOpen(true); }} 
                    className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all cursor-pointer group flex flex-col items-start space-y-6"
                  >
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

        {activeTab === 'analysis' && (
          <div className="max-w-6xl mx-auto p-12 space-y-12 animate-in fade-in">
             <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 space-y-10 relative overflow-hidden">
                <div className="flex items-center space-x-6">
                   <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl text-white">🔍</div>
                   <div>
                      <h3 className="text-4xl font-black tracking-tighter uppercase">Intelligence Analysis</h3>
                      <p className="text-slate-500 font-medium text-xl">Scrape URLs or analyze documents for deep extraction.</p>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Knowledge Link (URL)</label>
                      <input 
                         className="w-full p-6 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 rounded-3xl font-bold outline-none transition-all shadow-inner"
                         placeholder="Enter URL to scrape..."
                         value={analysisUrl}
                         onChange={e => setAnalysisUrl(e.target.value)}
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Document Summary Focus</label>
                      <input 
                         className="w-full p-6 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 rounded-3xl font-bold outline-none transition-all shadow-inner"
                         placeholder="Focus area (e.g. competitors, metrics)..."
                         value={topic}
                         onChange={e => setTopic(e.target.value)}
                      />
                   </div>
                </div>
                <button 
                   onClick={handleDeepAnalysis}
                   disabled={isAnalyzing}
                   className={`w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl transition-all ${isAnalyzing ? 'bg-emerald-800 animate-pulse' : 'hover:bg-black'}`}
                >
                   {isAnalyzing ? 'Executing Neural Deep Scan...' : 'Initiate Deep Analysis'}
                </button>
             </div>

             {analysisResult && (
                <div className="bg-white p-16 rounded-[4rem] border border-slate-200 shadow-2xl space-y-8 animate-in zoom-in-95">
                   <div className="flex justify-between items-center">
                      <h4 className="text-2xl font-black uppercase text-indigo-600 tracking-widest">Neural Brief Output</h4>
                      <button onClick={() => { setGeneratedContent(analysisResult); setActiveTab('editor'); }} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Send to Editor</button>
                   </div>
                   <div className="prose prose-slate max-w-none prose-lg">
                      <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed italic">{analysisResult}</div>
                   </div>
                </div>
             )}
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

      {/* Tool Config Modal */}
      {isConfigModalOpen && selectedTool && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in" onClick={() => setIsConfigModalOpen(false)}>
           <div className="bg-white w-full max-w-3xl rounded-[4rem] shadow-[0_40px_120px_rgba(0,0,0,0.5)] border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <div className="p-10 border-b border-slate-50 bg-indigo-50/30 flex justify-between items-center">
                 <div className="flex items-center space-x-5">
                    <div className={`w-14 h-14 bg-gradient-to-tr ${selectedTool.color} rounded-[1.2rem] flex items-center justify-center text-2xl text-white shadow-xl`}>
                       {selectedTool.icon}
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{selectedTool.label}</h3>
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Advanced Tool Configuration</p>
                    </div>
                 </div>
                 <button onClick={() => setIsConfigModalOpen(false)} className="p-4 hover:bg-white rounded-full text-slate-400">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Primary Intent / Topic</label>
                       <input className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 p-5 rounded-2xl font-bold outline-none transition-all shadow-inner" placeholder="Target Topic..." value={topic} onChange={e => setTopic(e.target.value)} />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Target URL (if applicable)</label>
                       <input className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 p-5 rounded-2xl font-bold outline-none transition-all shadow-inner" placeholder="https://..." value={targetUrl} onChange={e => setTargetUrl(e.target.value)} />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">SEO Keyphrases</label>
                       <input className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 p-5 rounded-2xl font-bold outline-none transition-all shadow-inner" placeholder="Keyword 1, Keyword 2..." value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)} />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Regional Focus (Bulk Only)</label>
                       <input className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 p-5 rounded-2xl font-bold outline-none transition-all shadow-inner" placeholder="London, NYC, Paris..." value={targetLocations} onChange={e => setTargetLocations(e.target.value)} />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Grounding Intelligence (NotebookLM Sync)</h4>
                       <span className="text-[10px] font-black text-indigo-500">{selectedNoteIds.length} Linked Nodes</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       {notebookNotes.map(note => (
                         <button 
                            key={note.id} 
                            onClick={() => toggleNoteSelection(note.id)}
                            className={`p-5 rounded-[2rem] border-2 transition-all flex items-center space-x-4 text-left group ${selectedNoteIds.includes(note.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}
                         >
                            <span className="text-xl">📌</span>
                            <div className="flex-1 min-w-0">
                               <p className={`text-xs font-black truncate uppercase ${selectedNoteIds.includes(note.id) ? 'text-white' : 'text-slate-900'}`}>{note.title}</p>
                               <p className={`text-[8px] font-bold uppercase truncate ${selectedNoteIds.includes(note.id) ? 'text-indigo-200' : 'text-slate-400'}`}>Knowledge Node</p>
                            </div>
                         </button>
                       ))}
                       {notebookNotes.length === 0 && (
                         <div className="col-span-2 py-10 text-center bg-slate-50 rounded-[2rem] opacity-30 italic">No notebook nodes found to link.</div>
                       )}
                    </div>
                 </div>
              </div>

              <div className="p-10 border-t border-slate-50 bg-white flex space-x-4">
                 <button onClick={() => setIsConfigModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                 <button onClick={() => handleGenerate(selectedTool.id)} className={`flex-[2] py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 transform`}>Execute Neural Protocol</button>
              </div>
           </div>
        </div>
      )}

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
