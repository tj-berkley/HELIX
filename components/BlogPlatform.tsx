
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Manuscript, PublishingDestination } from '../types';
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

const BlogPlatform: React.FC<BlogPlatformProps> = ({ manuscriptLibrary, onConvertToMovie, onSaveManuscript }) => {
  const [activeTab, setActiveTab] = useState<PlatformTab>('toolbox');
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState<WritingGenre>('Non-Fiction');
  const [tone, setTone] = useState<Tone>('Professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  
  const [selectedModel, setSelectedModel] = useState<ModelOption>('gemini-3-pro-preview');
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Advanced SEO & Product State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<typeof TOOLS[0] | null>(null);
  const [affiliateLink, setAffiliateLink] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [authorInfo, setAuthorInfo] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoPhrases, setSeoPhrases] = useState('');
  const [targetLocations, setTargetLocations] = useState('');
  const [productDetails, setProductDetails] = useState<{ title?: string; image?: string; specs?: string[] } | null>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  
  // Outline State
  const [outline, setOutline] = useState<string[]>([]);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [showOutlineEditor, setShowOutlineEditor] = useState(false);

  const [analysisFile, setAnalysisFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const [analysisStep, setAnalysisStep] = useState<'upload' | 'options' | 'result'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getBrandVoice = () => {
    const raw = localStorage.getItem('HOBBS_BRAND_VOICE');
    return raw ? JSON.parse(raw) : { audience: 'General', tone: 'Professional', keyPhrases: [], avoidKeywords: [] };
  };

  const handleFetchProduct = async () => {
    if (!targetUrl.trim()) return;
    setIsFetchingProduct(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Fetch and summarize product details for this URL: ${targetUrl}. 
        Return JSON: { "title": "Product Name", "image": "Image URL if found", "specs": ["spec1", "spec2"] }`,
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
      const data = JSON.parse(response.text);
      setProductDetails(data);
      if (data.title) setTopic(data.title);
    } catch (e) {
      console.error(e);
      alert("Real-time extraction failed. Please enter details manually.");
    } finally {
      setIsFetchingProduct(false);
    }
  };

  const handleGenerateOutline = async () => {
    if (!topic.trim()) return;
    setIsGeneratingOutline(true);
    try {
      const voice = getBrandVoice();
      const headers = await generateArticleOutline(topic, seoKeywords, voice);
      setOutline(headers);
      setShowOutlineEditor(true);
    } catch (e) {
      console.error(e);
      alert("Neural outline generation failed.");
    } finally {
      setIsGeneratingOutline(false);
    }
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
      
      const keywordsList = seoKeywords.split(',').map(k => k.trim()).filter(Boolean);
      const locationsList = targetLocations.split(',').map(l => l.trim()).filter(Boolean);

      let systemPrompt = `Act as a world-class SEO strategist and conversion copywriter.
      BRAND VOICE:
      - Audience: ${voice.audience}
      - Tone: ${voice.tone}
      - Core Phrases: ${voice.keyPhrases.join(', ')}
      
      CONTEXT:
      - Tool: ${selectedTool?.label || mode}
      - Topic: ${finalTopic}
      - Target Locations: ${locationsList.join(', ')}
      - Primary Keywords: ${keywordsList.join(', ')}
      - SEO Phrases: ${seoPhrases}
      - Author: ${authorInfo}
      - Affiliate/Buy Link: ${affiliateLink}
      
      ARTICLE STRUCTURE (OUTLINE):
      ${outline.join('\n')}

      TASK: Write a highly optimized, high-converting full article. `;

      if (locationsList.length > 0) {
        systemPrompt += `CRITICAL: Seamlessly weave in the following locations to dominate local search: ${locationsList.join(', ')}. `;
      }

      if (mode === 'amazon-review') {
        systemPrompt += `FORMAT: Use a product review structure with Pros/Cons, "Why We Love It", technical specs, and 3 clear call-to-actions linking to ${affiliateLink}. `;
      }

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
        title: finalTopic + (locationsList.length > 0 ? ` (${locationsList[0]}...)` : ''),
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        setAnalysisFile({
          name: file.name,
          data: base64Data,
          mimeType: file.type || 'application/pdf'
        });
        setAnalysisStep('options');
      };
      reader.readAsDataURL(file);
    }
  };

  const runDocumentAnalysis = async (task: string) => {
    if (!analysisFile) return;
    setIsGenerating(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: {
          parts: [
            {
              inlineData: {
                data: analysisFile.data,
                mimeType: analysisFile.mimeType
              }
            },
            { text: task }
          ]
        },
        config: {
          thinkingConfig: selectedModel.includes('pro') ? { thinkingBudget: 4000 } : undefined
        }
      });

      const content = response.text || '';
      setGeneratedContent(content);
      setTopic(`Analysis: ${analysisFile.name}`);
      setActiveTab('editor');
      setAnalysisStep('upload');
      setAnalysisFile(null);
    } catch (e) {
      console.error("Document analysis failed:", e);
      alert("Neural analysis failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = (data: { title: string; description: string; destination: PublishingDestination }) => {
    setIsPublishModalOpen(false);
    alert(`Success! "${data.title}" has been published.`);
  };

  const openToolConfig = (tool: typeof TOOLS[0]) => {
    setSelectedTool(tool);
    setGenre(tool.id.includes('review') || tool.id.includes('amazon') ? 'Product Review' : (tool.id.includes('seo') ? 'Location-Based SEO' : 'Business'));
    setIsConfigModalOpen(true);
    setTopic('');
    setProductDetails(null);
    setOutline([]);
    setShowOutlineEditor(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden font-sans">
      {/* Dynamic Studio Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center bg-white shrink-0 shadow-sm z-30">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Writing Studio</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Global Brand Voice Engine</p>
        </div>

        <div className="px-10 shrink-0">
          <div className="relative">
            <button 
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center space-x-3 hover:bg-purple-700 transition-all border border-purple-500/20 active:scale-95"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              <span>AI {selectedModel.includes('pro') ? 'PRO' : 'FLASH'} v4.5</span>
              <Icons.ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showModelDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showModelDropdown && (
              <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-64 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-[100] p-3 animate-in zoom-in-95">
                <div className="px-4 py-3 border-b border-slate-50 mb-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Neural Intelligence</p>
                </div>
                <div className="space-y-1">
                  <button 
                    onClick={() => { setSelectedModel('gemini-3-pro-preview'); setShowModelDropdown(false); }}
                    className={`w-full flex items-start space-x-4 px-4 py-4 rounded-2xl transition-all ${selectedModel === 'gemini-3-pro-preview' ? 'bg-purple-50 text-purple-700' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <span className="text-xl">💎</span>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-tight">Gemini 3 Pro</p>
                      <p className="text-[9px] opacity-60 font-medium">Research & Creativity</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => { setSelectedModel('gemini-3-flash-preview'); setShowModelDropdown(false); }}
                    className={`w-full flex items-start space-x-4 px-4 py-4 rounded-2xl transition-all ${selectedModel === 'gemini-3-flash-preview' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <span className="text-xl">⚡</span>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-tight">Gemini 3 Flash</p>
                      <p className="text-[9px] opacity-60 font-medium">Speed Article Gen</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex justify-end items-center space-x-6">
          <div className="flex bg-slate-100 p-1.5 rounded-[1.8rem] shadow-inner">
            {(['toolbox', 'book', 'script', 'editor', 'library', 'analysis'] as PlatformTab[]).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab === 'toolbox' ? '🧰 Tools' : tab === 'book' ? '📖 Book' : tab === 'script' ? '🎞️ Script' : tab === 'editor' ? '✍️ Canvas' : tab === 'library' ? '📚 Library' : '🔍 Analysis'}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsPublishModalOpen(true)}
            disabled={!generatedContent}
            className="px-8 py-3 bg-slate-900 text-white rounded-[1.2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black active:scale-95 disabled:opacity-20"
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
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">SEO & Article Toolbox</h3>
                <p className="text-slate-500 font-medium text-xl italic max-w-lg">Advanced workflows for affiliate marketing and local dominance.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TOOLS.map(tool => (
                  <div 
                    key={tool.id} 
                    onClick={() => tool.id === 'doc-intel' ? setActiveTab('analysis') : openToolConfig(tool)}
                    className="bg-white p-10 rounded-[3.5rem] border-2 border-transparent shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all cursor-pointer group flex flex-col items-start space-y-6 relative overflow-hidden"
                  >
                     <div className={`w-20 h-20 bg-gradient-to-tr ${tool.color} rounded-[2rem] flex items-center justify-center text-4xl shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform`}>
                        {tool.icon}
                     </div>
                     <div className="space-y-2">
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{tool.label}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{tool.desc}</p>
                     </div>
                     <div className="pt-4 flex items-center text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all">
                        Initialize Engine <span className="ml-2">→</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Configuration Modal for Tools */}
        {isConfigModalOpen && selectedTool && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-xl animate-in fade-in">
             <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-10 border-b border-slate-50 bg-indigo-50/30 flex justify-between items-center shrink-0">
                   <div className="flex items-center space-x-6">
                      <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl shadow-2xl">
                         {selectedTool.icon}
                      </div>
                      <div>
                         <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{selectedTool.label}</h3>
                         <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2">SEO Neural Injection Protocol</p>
                      </div>
                   </div>
                   <button onClick={() => setIsConfigModalOpen(false)} className="p-4 hover:bg-white rounded-full text-slate-400 transition-all">✕</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide">
                   {!showOutlineEditor ? (
                      <>
                        <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-6">
                               <div className="space-y-4">
                                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Primary Topic / Headline</label>
                                  <input 
                                    autoFocus
                                    className="w-full p-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl outline-none text-lg font-black shadow-inner transition-all placeholder-slate-300"
                                    placeholder="e.g. Best Noise Cancelling Headphones 2025"
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                  />
                               </div>

                               <div className="space-y-4">
                                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Amazon / Product URL</label>
                                  <div className="flex space-x-2">
                                     <input 
                                       className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold shadow-inner"
                                       placeholder="https://amazon.com/dp/..."
                                       value={targetUrl}
                                       onChange={e => setTargetUrl(e.target.value)}
                                     />
                                     <button 
                                       onClick={handleFetchProduct}
                                       disabled={isFetchingProduct || !targetUrl}
                                       className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center"
                                     >
                                       {isFetchingProduct ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Fetch Details'}
                                     </button>
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Affiliate ID / Link</label>
                                  <input 
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold shadow-inner"
                                    placeholder="?tag=yourid-20"
                                    value={affiliateLink}
                                    onChange={e => setAffiliateLink(e.target.value)}
                                  />
                               </div>
                            </div>

                            <div className="space-y-6">
                               <div className="space-y-4">
                                  <label className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] px-2">SEO Keywords</label>
                                  <textarea 
                                    className="w-full p-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-[2rem] outline-none text-xs font-bold shadow-inner h-24 resize-none"
                                    placeholder="Review, comparison, features, price..."
                                    value={seoKeywords}
                                    onChange={e => setSeoKeywords(e.target.value)}
                                  />
                               </div>

                               <div className="space-y-4">
                                  <label className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] px-2">Target Locations</label>
                                  <textarea 
                                    className="w-full p-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-[2rem] outline-none text-xs font-bold shadow-inner h-24 resize-none"
                                    placeholder="London, New York, Tokyo..."
                                    value={targetLocations}
                                    onChange={e => setTargetLocations(e.target.value)}
                                  />
                               </div>
                            </div>
                         </div>

                         <div className="p-10 border-t border-slate-50 shrink-0 flex space-x-4">
                            <button 
                               onClick={handleGenerateOutline}
                               disabled={isGeneratingOutline || !topic.trim()}
                               className={`flex-1 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all transform active:scale-95 ${isGeneratingOutline ? 'bg-slate-800' : 'bg-slate-900 text-white hover:bg-black'}`}
                            >
                               {isGeneratingOutline ? 'Architecting Outline...' : 'Generate Neural Outline'}
                            </button>
                            <button 
                               onClick={() => handleGenerate(selectedTool.id)}
                               disabled={isGenerating || !topic.trim()}
                               className={`flex-1 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all transform active:scale-95 ${isGenerating ? 'bg-slate-800' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/40'}`}
                            >
                               Direct Synthesis
                            </button>
                         </div>
                      </>
                   ) : (
                      <div className="space-y-8 animate-in slide-in-from-right-4">
                         <div className="flex justify-between items-center px-2">
                            <div>
                               <h4 className="text-xl font-black text-slate-900 uppercase">Structural blueprint</h4>
                               <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Review and refine article headers</p>
                            </div>
                            <button onClick={() => setShowOutlineEditor(false)} className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 underline">Back to config</button>
                         </div>
                         
                         <div className="space-y-3">
                            {outline.map((header, idx) => (
                               <div key={idx} className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                                  <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg shrink-0">{idx + 1}</span>
                                  <input 
                                     className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700 p-0 focus:ring-0"
                                     value={header}
                                     onChange={(e) => {
                                        const next = [...outline];
                                        next[idx] = e.target.value;
                                        setOutline(next);
                                     }}
                                  />
                                  <button onClick={() => setOutline(outline.filter((_, i) => i !== idx))} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all">✕</button>
                               </div>
                            ))}
                            <button 
                               onClick={() => setOutline([...outline, 'New Section Header'])}
                               className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                            >
                               + Add Section Beat
                            </button>
                         </div>

                         <div className="p-10 border-t border-slate-50 shrink-0">
                            <button 
                               onClick={() => handleGenerate(selectedTool.id)}
                               disabled={isGenerating || outline.length === 0}
                               className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all transform active:scale-95 ${isGenerating ? 'bg-slate-800' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/40'}`}
                            >
                               {isGenerating ? 'Expanding Narrative...' : 'Synthesize Full Manuscript'}
                            </button>
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* ... Analysis and Other Views ... */}
        {activeTab === 'analysis' && (
          <div className="max-w-4xl mx-auto p-12 space-y-10 animate-in fade-in">
             <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 space-y-10 relative overflow-hidden">
                <div className="flex justify-between items-center">
                   <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-lg text-white">
                         🔍
                      </div>
                      <div>
                         <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Document Intelligence</h3>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Neural Parsing Protocol</p>
                      </div>
                   </div>
                </div>

                {analysisStep === 'upload' && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-4 border-dashed border-slate-100 rounded-[3.5rem] p-24 flex flex-col items-center justify-center space-y-8 text-slate-300 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group shadow-inner"
                  >
                    <div className="w-28 h-28 rounded-full bg-slate-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform shadow-sm">📄</div>
                    <div className="text-center space-y-3">
                       <p className="text-3xl font-black text-slate-900">Upload Intelligence Target</p>
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural PDF or DOCX Processing (Max 20MB)</p>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                  </div>
                )}

                {analysisStep === 'options' && analysisFile && (
                  <div className="space-y-10 animate-in zoom-in-95">
                    <div className="p-10 bg-slate-50 rounded-[2.5rem] flex items-center justify-between border border-slate-100 shadow-inner">
                       <div className="flex items-center space-x-8">
                          <div className="text-5xl">📎</div>
                          <div>
                             <p className="text-xl font-black text-slate-900 tracking-tight">{analysisFile.name}</p>
                             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Ready for Neural Distillation</p>
                          </div>
                       </div>
                       <button onClick={() => setAnalysisStep('upload')} className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-rose-100 bg-white">Replace Target</button>
                    </div>

                    <div className="space-y-6">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Select Neural Directive</label>
                       <div className="grid grid-cols-2 gap-6">
                          {[
                            { label: 'Summarize Content', icon: '📝', task: 'Provide a concise executive summary of this document, highlighting the main objectives and conclusions.' },
                            { label: 'Extract Key Takeaways', icon: '💎', task: 'Extract the 5 most critical takeaways from this document in a bulleted list.' },
                            { label: 'Identify Action Items', icon: '✅', task: 'Identify all explicit or implicit action items, deadlines, and responsibilities mentioned in this document.' },
                            { label: 'Draft Blog Post', icon: '✍️', task: 'Synthesize the information from this document into a compelling, SEO-optimized professional blog post draft.' },
                          ].map(opt => (
                            <button 
                              key={opt.label}
                              disabled={isGenerating}
                              onClick={() => runDocumentAnalysis(opt.task)}
                              className="p-10 bg-white border-2 border-slate-100 rounded-[3rem] flex flex-col items-start space-y-4 hover:border-emerald-500 hover:shadow-2xl transition-all group active:scale-95 disabled:opacity-50"
                            >
                               <span className="text-4xl group-hover:scale-110 transition-transform">{opt.icon}</span>
                               <span className="text-base font-black text-slate-900 uppercase tracking-tight">{opt.label}</span>
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                )}
             </div>

             {isGenerating && (
                <div className="flex flex-col items-center justify-center space-y-8 py-16 animate-pulse">
                   <div className="w-20 h-20 border-[6px] border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(16,185,129,0.3)]"></div>
                   <p className="text-2xl font-black text-emerald-600 uppercase tracking-[0.4em]">Neural Extraction Active...</p>
                </div>
             )}
          </div>
        )}

        {(activeTab === 'book' || activeTab === 'script' || activeTab === 'editor') && (
          <div className="max-w-5xl mx-auto p-12 space-y-12 animate-in fade-in">
             <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 space-y-10 relative overflow-hidden">
                <div className="flex justify-between items-center">
                   <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-lg text-white">
                         {activeTab === 'book' ? '📖' : activeTab === 'script' ? '🎞️' : '🖋️'}
                      </div>
                      <div>
                         <h3 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">{activeTab} Architect</h3>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Neural Composition Engine</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Project Directive</label>
                   <textarea 
                     value={topic}
                     onChange={e => setTopic(e.target.value)}
                     placeholder={activeTab === 'script' ? "A sci-fi noir about a detective..." : "The ultimate guide to autonomous enterprise agents..."}
                     className="w-full p-10 text-3xl font-black bg-slate-50 border-2 border-transparent rounded-[3rem] focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner h-48 resize-none placeholder-slate-200"
                   />
                </div>

                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Genre Classification</label>
                      <select value={genre} onChange={e => setGenre(e.target.value as WritingGenre)} className="w-full p-6 bg-slate-50 border-none rounded-[1.5rem] font-black text-slate-900 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors uppercase text-xs tracking-widest shadow-sm">
                        {[
                          'Fiction', 'Non-Fiction', 'Business', 'Educational', 'Sci-Fi', 'Fantasy',
                          'Product Review', 'Amazon Affiliate', 'Listicle', 'How-To Guide'
                        ].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Tonal profile Mapping</label>
                      <select value={tone} onChange={e => setTone(e.target.value as Tone)} className="w-full p-6 bg-slate-50 border-none rounded-[1.5rem] font-black text-slate-900 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors uppercase text-xs tracking-widest shadow-sm">
                        {['Professional', 'Witty', 'Bold', 'Academic', 'Empowering', 'Persuasive', 'Informative'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                   </div>
                </div>

                <button 
                  onClick={() => handleGenerate(activeTab)}
                  disabled={isGenerating || !topic.trim()}
                  className={`w-full py-10 rounded-[3rem] text-3xl font-black uppercase tracking-[0.3em] text-white transition-all transform active:scale-95 shadow-[0_30px_60px_rgba(15,23,42,0.3)] ${isGenerating ? 'bg-slate-800 animate-pulse cursor-wait' : 'bg-slate-900 hover:bg-black'}`}
                >
                  {isGenerating ? 'Synthesizing...' : 'Execute Neural Draft'}
                </button>
             </div>

             {generatedContent && (
               <div className="bg-white border border-slate-200 rounded-[4rem] p-20 shadow-2xl space-y-12 animate-in zoom-in-95 duration-500">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-12">
                     <div className="space-y-4">
                        <div className="flex space-x-3">
                           <span className="text-[10px] font-black bg-indigo-600 text-white px-4 py-1.5 rounded-full uppercase tracking-[0.3em] shadow-lg">{genre}</span>
                           <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full uppercase tracking-[0.3em] border border-slate-200">{tone}</span>
                        </div>
                        <h3 className="text-6xl font-black text-slate-900 tracking-tighter leading-none uppercase">{topic}</h3>
                     </div>
                     {activeTab === 'script' && (
                        <button 
                          onClick={() => onConvertToMovie?.(topic, generatedContent)}
                          className="px-10 py-5 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl shadow-purple-900/20 active:scale-95"
                        >
                          Sync to Movie Studio
                        </button>
                     )}
                  </div>
                  <div className="prose prose-slate max-w-none prose-xl">
                     <div className="text-slate-800 leading-relaxed font-serif text-2xl whitespace-pre-wrap outline-none selection:bg-indigo-100 min-h-[800px] px-2" contentEditable suppressContentEditableWarning onBlur={(e) => setGeneratedContent(e.currentTarget.innerText)}>
                        {generatedContent}
                     </div>
                  </div>
               </div>
             )}
          </div>
        )}

        {/* Library View */}
        {activeTab === 'library' && (
          <div className="max-w-6xl mx-auto p-12 space-y-10 animate-in fade-in">
             <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                <div>
                   <h3 className="text-5xl font-black tracking-tighter text-slate-900">Manuscript Library</h3>
                   <p className="text-slate-500 font-medium text-lg mt-1 italic">The archive of all generated intellectual property.</p>
                </div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] bg-slate-100 px-4 py-2 rounded-full border border-slate-200">{manuscriptLibrary.length} Records Inscribed</span>
             </div>
             <div className="grid grid-cols-1 gap-6">
                {manuscriptLibrary.map(m => (
                  <div key={m.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 flex justify-between items-center hover:border-indigo-200 hover:shadow-2xl transition-all group shadow-sm">
                     <div className="flex items-center space-x-8">
                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">📜</div>
                        <div>
                           <h4 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{m.title}</h4>
                           <div className="flex items-center space-x-4 mt-1.5">
                              <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">{m.genre}</span>
                              <span className="text-slate-200 text-lg">•</span>
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{new Date(m.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                           </div>
                        </div>
                     </div>
                     <button 
                      onClick={() => { setGeneratedContent(m.content); setTopic(m.title); setActiveTab('editor'); }}
                      className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                     >
                        Open Manuscript
                     </button>
                  </div>
                ))}
                {manuscriptLibrary.length === 0 && (
                  <div className="py-60 text-center space-y-10 border-4 border-dashed border-slate-100 rounded-[5rem] opacity-20">
                     <span className="text-[160px] filter grayscale">📓</span>
                     <div className="space-y-3">
                        <p className="text-4xl font-black uppercase tracking-[0.4em]">Archive Empty</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Initialize synthesis to begin your digital library</p>
                     </div>
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
