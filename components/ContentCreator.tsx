
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import BlogPublishModal from './BlogPublishModal';
import { PublishingDestination } from '../types';

interface CanvasElement {
  id: string;
  type: 'image' | 'text';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

type AIMode = 'Generate' | 'Edit' | 'Combine' | 'Headshots' | 'Product' | 'Extract' | 'Upscale' | 'Analyze';
type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
type ImageSize = '1K' | '2K' | '4K';

const PRODUCT_ENVIRONMENTS = [
  { id: 'minimal', label: 'Minimalist Studio', prompt: 'clean white minimalist studio background with soft shadows' },
  { id: 'marble', label: 'Luxury Marble', prompt: 'elegant white marble surface with cinematic lighting' },
  { id: 'wood', label: 'Natural Wood', prompt: 'rustic light oak wood table in a sunlit room with plants' },
  { id: 'tropical', label: 'Tropical Beach', prompt: 'sandy beach with turquoise water and palm leaf shadows' },
  { id: 'urban', label: 'Urban Street', prompt: 'blurred city street background at golden hour' },
  { id: 'dark', label: 'Moody Dark', prompt: 'dark charcoal textured background with dramatic spotlighting' },
];

const HEADSHOT_STYLES = [
  { id: 'corporate', label: 'Executive Pack', icon: '💼', prompt: 'a high-end professional corporate executive headshot, neutral gray studio background, sharp focus, professional business attire, soft cinematic lighting' },
  { id: 'creative', label: 'Creative Pack', icon: '🎨', prompt: 'a stylish creative professional headshot, slightly blurred warm office background, modern casual attire, natural daylight, soft bokeh' },
  { id: 'academic', label: 'Academic Pack', icon: '📚', prompt: 'a clean academic or medical professional headshot, bright white background, formal attire, even lighting, high clarity' },
  { id: 'blackwhite', label: 'Artistic Pack', icon: '🎞️', prompt: 'a dramatic black and white artistic professional portrait, dark background, rim lighting, high contrast, sharp details' },
];

const COMBINE_PRESETS = [
  { id: 'showcase', label: 'Product Showcase', icon: '💎', description: 'Premium lighting for luxury items.', prompt: 'Create a high-end product showcase by seamlessly merging these images into a cohesive, professionally lit studio scene. Focus on premium lighting and sharp focus.' },
  { id: 'skincare', label: 'Skincare Ad', icon: '🧴', description: 'Serene, natural aesthetic vibes.', prompt: 'Generate a clean, aesthetic skincare advertisement. Blend the products into a serene environment with soft lighting, water ripples, or natural textures like sand.' },
  { id: 'tryon', label: 'Virtual Try-On', icon: '👕', description: 'Place fashion items on people.', prompt: 'Perform a realistic virtual try-on. Take the clothing or accessory from one image and realistically composite it onto the person in the other image, ensuring perfect fit and lighting matching.' },
  { id: 'composite', label: 'Creative Composition', icon: '🎨', description: 'Surreal artistic blends and layouts.', prompt: 'Create a surreal and artistic creative composition by blending these disparate images into a single, unified masterpiece with artistic flair.' },
];

const EDIT_PRESETS = [
  { id: 'cyberpunk', label: 'Cyberpunk Style', icon: '🌆', prompt: 'Transform this image into a cyberpunk aesthetic with neon lights, high contrast, and a futuristic sci-fi atmosphere.' },
  { id: 'oil', label: 'Oil Painting', icon: '🎨', prompt: 'Redraw this image as a classic oil painting with visible brushstrokes and rich textures.' },
  { id: 'sketch', label: 'Pencil Sketch', icon: '✏️', prompt: 'Convert this image into a detailed hand-drawn pencil sketch with fine lines and shading.' },
  { id: 'bg-remove', label: 'Change Background', icon: '🌅', prompt: 'Remove the original background and place the subjects in a beautiful mountain landscape at sunset.' },
  { id: 'anime', label: 'Anime Filter', icon: '🌸', prompt: 'Redraw this image in a high-quality Studio Ghibli inspired anime style.' },
  { id: 'enhance', label: 'Smart Enhance', icon: '✨', prompt: 'Enhance the details, colors, and lighting of this image to make it look professionally shot and edited.' },
];

const ContentCreator: React.FC = () => {
  const [activeShelf, setActiveShelf] = useState<'Templates' | 'AI Gen'>('AI Gen');
  const [activeAIMode, setActiveAIMode] = useState<AIMode>('Generate');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [selectedCombinePreset, setSelectedCombinePreset] = useState<string | null>(null);
  const [selectedEditPreset, setSelectedEditPreset] = useState<string | null>(null);
  const [selectedHeadshotStyle, setSelectedHeadshotStyle] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  
  const [elements, setElements] = useState<CanvasElement[]>([
    { id: '1', type: 'text', content: 'SUMMER LAUNCH', x: 40, y: 40, width: 300, height: 100 },
  ]);

  const [selectedEnv, setSelectedEnv] = useState<string | null>(null);
  const [sourceImages, setSourceImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sidebarItems = [
    { label: 'Templates', icon: '📄' },
    { label: 'AI Magic', icon: '✨' },
    { label: 'Elements', icon: '🧩' },
    { label: 'Uploads', icon: '📤' },
    { label: 'Text', icon: 'T' },
    { label: 'Projects', icon: '📁' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSourceImages(prev => [...prev, reader.result as string].slice(-3));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handlePublish = (data: { title: string; description: string; destination: PublishingDestination }) => {
    console.log(`Publishing Asset to ${data.destination}:`, data);
    setIsPublishModalOpen(false);
    alert(`Visual asset post synced to ${data.destination}!`);
  };

  const speakText = async (text: string) => {
    if (!text) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBytes = atob(base64Audio);
        const arrayBuffer = new ArrayBuffer(audioBytes.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioBytes.length; i++) uint8Array[i] = audioBytes.charCodeAt(i);
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const int16 = new Int16Array(uint8Array.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;
        
        const buffer = audioContext.createBuffer(1, float32.length, 24000);
        buffer.getChannelData(0).set(float32);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (e) { console.error("TTS failed", e); }
  };

  const processAIRequest = async (batchCount: number = 1) => {
    const isSpecialMode = ['Headshots', 'Upscale', 'Extract', 'Analyze'].includes(activeAIMode);
    if (!prompt.trim() && !isSpecialMode && !selectedEnv && !selectedCombinePreset && !selectedEditPreset && !selectedHeadshotStyle) return;
    
    if (batchCount > 1) setIsBatchGenerating(true);
    else setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const generateSingle = async (contextPrompt?: string) => {
        const parts: any[] = [];
        let finalPrompt = prompt;
        let model = 'gemini-3-pro-image-preview';
        let config: any = { imageConfig: { aspectRatio, imageSize } };

        if (isThinkingMode) {
          config.thinkingConfig = { thinkingBudget: 32768 };
        }

        if (activeAIMode === 'Edit') {
          model = 'gemini-2.5-flash-image';
          const preset = EDIT_PRESETS.find(p => p.id === selectedEditPreset);
          finalPrompt = `${preset ? preset.prompt : ''} ${prompt || 'Enhance this image'}. Focus on the user's modifications while maintaining the original subjects and structure.`;
        } else if (activeAIMode === 'Combine') {
          model = 'gemini-2.5-flash-image';
          const preset = COMBINE_PRESETS.find(p => p.id === selectedCombinePreset);
          finalPrompt = `${preset ? preset.prompt : 'Seamlessly combine these images into a professional composition.'} ${prompt}`;
        } else if (activeAIMode === 'Headshots') {
          const style = contextPrompt || (selectedHeadshotStyle ? HEADSHOT_STYLES.find(s => s.id === selectedHeadshotStyle)?.prompt : 'professional studio LinkedIn headshot');
          finalPrompt = `Convert the person in this source photo into a ${style}. Ensure realistic skin textures, studio lighting, and a professional look. Maintain facial identity precisely. High fidelity raw photo quality.`;
        } else if (activeAIMode === 'Analyze') {
          model = 'gemini-3-pro-preview';
          finalPrompt = `Analyze this image in detail and describe what you see, identifying key objects, themes, colors, and composition. Be precise.`;
        } else if (activeAIMode === 'Product') {
          const env = contextPrompt || prompt || (selectedEnv ? PRODUCT_ENVIRONMENTS.find(e => e.id === selectedEnv)?.prompt : 'clean studio');
          finalPrompt = `High-end product photography of this item in a ${env} environment. Commercial quality, perfect lighting, 8k resolution.`;
        } else if (activeAIMode === 'Extract') {
          model = 'gemini-3-flash-preview';
          finalPrompt = `Analyze this image and reverse-engineer the highly detailed descriptive prompt that would generate it.`;
        } else if (activeAIMode === 'Upscale') {
          model = 'gemini-2.5-flash-image';
          finalPrompt = `Upscale and enhance this image 2x, adding missing high-frequency details and sharpening textures.`;
        }
        
        parts.push({ text: finalPrompt });
        sourceImages.forEach(img => {
          parts.push({ inlineData: { data: img.split(',')[1], mimeType: img.split(',')[0].split(':')[1].split(';')[0] } });
        });

        const response = await ai.models.generateContent({ model, contents: { parts }, config });

        if (activeAIMode === 'Extract' || activeAIMode === 'Analyze') {
          const resultText = response.text || '';
          setPrompt(resultText);
          return null;
        }

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        return null;
      };

      if (batchCount > 1 && (activeAIMode === 'Product' || activeAIMode === 'Headshots')) {
        const pool = activeAIMode === 'Product' ? PRODUCT_ENVIRONMENTS : HEADSHOT_STYLES;
        const contextsToUse = pool.slice(0, batchCount);
        const results = await Promise.all(contextsToUse.map(ctx => generateSingle(ctx.prompt)));
        const validResults = results.filter((r): r is string => r !== null);
        setGeneratedImages(prev => [...validResults, ...prev]);
      } else {
        const res = await generateSingle();
        if (res) setGeneratedImages(prev => [res, ...prev]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
      setIsBatchGenerating(false);
    }
  };

  const addImageToCanvas = (url: string) => {
    setElements([...elements, { id: `el-${Date.now()}`, type: 'image', content: url, x: 100, y: 100, width: 250, height: 250 }]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden text-white">
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-black flex items-center"><span className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl mr-3 shadow-lg">✨</span>Content Marketing Studio</h2>
          <div className="h-6 w-px bg-slate-800"></div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>Advanced AI Creator // v3.4</p>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsPublishModalOpen(true)} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all">Post to Blog</button>
          <button onClick={() => speakText(prompt)} disabled={!prompt} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all" title="Speak Prompt/Description">🔊</button>
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0">Export Assets</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-20 bg-slate-950 flex flex-col border-r border-slate-800 shrink-0">
          {sidebarItems.map(item => (
            <button key={item.label} onClick={() => setActiveShelf(item.label === 'Templates' ? 'Templates' : 'AI Gen')} className={`p-4 h-24 flex flex-col items-center justify-center space-y-2 transition-all group ${activeShelf === (item.label === 'Templates' ? 'Templates' : 'AI Gen') && item.label === 'AI Magic' ? 'bg-slate-900 border-r-4 border-indigo-500' : 'hover:bg-slate-900'}`}>
              <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 group-hover:text-slate-300">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="w-96 bg-slate-900 border-r border-slate-800 overflow-y-auto shrink-0 flex flex-col p-6 space-y-8">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">AI Intelligent Engine</h3>
            <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
              {(['Generate', 'Combine', 'Edit', 'Analyze', 'Product', 'Headshots', 'Upscale'] as AIMode[]).map(mode => (
                <button key={mode} onClick={() => { setActiveAIMode(mode); setSourceImages([]); setSelectedCombinePreset(null); setSelectedEditPreset(null); setSelectedEnv(null); setSelectedHeadshotStyle(null); }} className={`py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeAIMode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{mode}</button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {activeAIMode !== 'Generate' && activeAIMode !== 'Analyze' ? (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase flex justify-between tracking-widest">
                  <span>{activeAIMode === 'Combine' ? 'Composite Sources' : activeAIMode === 'Product' ? 'Product Source' : activeAIMode === 'Headshots' ? 'Reference Photos' : 'Input Canvas (Source)'}</span>
                  <span className="text-indigo-400">{sourceImages.length}/{activeAIMode === 'Product' || activeAIMode === 'Headshots' ? '1' : '3'}</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {sourceImages.map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl bg-slate-800 border border-slate-700 relative overflow-hidden group shadow-inner">
                      <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="src" />
                      <button onClick={() => setSourceImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center shadow-lg transition-transform hover:scale-110">✕</button>
                    </div>
                  ))}
                  {sourceImages.length < (activeAIMode === 'Product' || activeAIMode === 'Headshots' ? 1 : 3) && (
                    <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-600 hover:border-indigo-500 hover:text-indigo-500 transition-all hover:bg-indigo-500/5">
                       <span className="text-2xl mb-1">+</span>
                       <span className="text-[8px] font-black uppercase tracking-tighter">{activeAIMode === 'Headshots' ? 'Upload Face' : 'Add Item'}</span>
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" multiple={activeAIMode !== 'Product' && activeAIMode !== 'Headshots'} accept="image/*" onChange={handleFileUpload} />
              </div>
            ) : null}

            {activeAIMode === 'Headshots' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-white tracking-tight">Choose Your Photo Pack</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Select a photo pack style below to get started.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {HEADSHOT_STYLES.map(style => (
                    <button 
                      key={style.id} 
                      onClick={() => setSelectedHeadshotStyle(style.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col items-start space-y-1 ${selectedHeadshotStyle === style.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-50'}`}
                    >
                      <span className="text-xl">{style.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-tight">{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeAIMode === 'Edit' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Edit Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {EDIT_PRESETS.map(preset => (
                    <button 
                      key={preset.id} 
                      onClick={() => setSelectedEditPreset(selectedEditPreset === preset.id ? null : preset.id)}
                      className={`flex flex-col p-3 rounded-2xl border-2 text-left transition-all ${selectedEditPreset === preset.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{preset.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-tight">{preset.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Refinement Instructions</label>
              <textarea 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                className="w-full h-32 p-5 text-sm bg-slate-800 border-2 border-slate-700 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-200 transition-all font-medium placeholder-slate-500 shadow-inner" 
                placeholder="Describe your vision..."
              />
            </div>

            <button onClick={() => processAIRequest()} disabled={isGenerating} className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl disabled:opacity-50 transition-all">
              {isGenerating ? 'Synthesizing...' : 'Generate AI Visual'}
            </button>
          </div>

          <div className="space-y-4 flex-1">
            <h4 className="text-[10px] font-black uppercase text-slate-500 border-b border-slate-800 pb-3 tracking-widest flex justify-between">
               <span>Studio Assets</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((img, idx) => (
                <div key={idx} onClick={() => addImageToCanvas(img)} className="aspect-square rounded-[1.5rem] bg-slate-800 border border-slate-700 overflow-hidden cursor-pointer hover:border-indigo-500 transition-all animate-in zoom-in group relative shadow-lg">
                  <img src={img} className="w-full h-full object-cover" alt="Gen" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 p-12 bg-slate-800 overflow-auto flex items-center justify-center pattern-grid-dark relative">
           <div className="bg-white w-[640px] h-[640px] shadow-[0_60px_120px_rgba(0,0,0,0.5)] relative overflow-hidden rounded-[2.5rem] border-[12px] border-slate-950">
              {elements.map(el => (
                <div key={el.id} className="absolute group/element" style={{ left: el.x, top: el.y, width: el.width, height: el.height }}>
                  {el.type === 'text' ? (
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 cursor-move">
                       <h4 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">{el.content}</h4>
                    </div>
                  ) : (
                    <img src={el.content} className="w-full h-full object-cover rounded-2xl shadow-2xl cursor-move" alt="cv" />
                  )}
                  <button onClick={() => setElements(elements.filter(e => e.id !== el.id))} className="absolute -top-5 -right-5 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/element:opacity-100 shadow-2xl transition-all">✕</button>
                </div>
              ))}
           </div>
        </div>
      </div>

      {isPublishModalOpen && (
        <BlogPublishModal 
          initialTitle="New Studio Asset Post"
          initialDescription="Shared from Content Marketing Studio."
          onClose={() => setIsPublishModalOpen(false)}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
};

export default ContentCreator;
