
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import BlogPublishModal from './BlogPublishModal';
import { PublishingDestination } from '../types';

interface CanvasElement {
  id: string;
  type: 'image' | 'text' | 'shape' | 'sticky';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style?: React.CSSProperties;
}

type ShelfType = 'templates' | 'ai' | 'elements' | 'uploads' | 'text' | 'projects';
type AIMode = 'Generate' | 'Edit' | 'Combine' | 'Headshots' | 'Product' | 'Extract' | 'Upscale' | 'Analyze';
type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
type ImageSize = '1K' | '2K' | '4K';

const PRODUCT_ENVIRONMENTS = [
  { id: 'minimal', label: 'Minimalist Studio', icon: '⚪', prompt: 'clean white minimalist studio background with soft shadows' },
  { id: 'marble', label: 'Luxury Marble', icon: '💎', prompt: 'elegant white marble surface with cinematic lighting' },
  { id: 'wood', label: 'Natural Wood', icon: '🪵', prompt: 'rustic light oak wood table in a sunlit room with plants' },
  { id: 'tropical', label: 'Tropical Beach', icon: '🏝️', prompt: 'sandy beach with turquoise water and palm leaf shadows' },
  { id: 'urban', label: 'Urban Street', icon: '🏙️', prompt: 'blurred city street background at golden hour' },
  { id: 'dark', label: 'Moody Dark', icon: '🌚', prompt: 'dark charcoal textured background with dramatic spotlighting' },
];

const HEADSHOT_STYLES = [
  { id: 'corporate', label: 'Executive Pack', icon: '💼', prompt: 'a high-end professional corporate executive headshot, neutral gray studio background, sharp focus, professional business attire, soft cinematic lighting' },
  { id: 'creative', label: 'Creative Pack', icon: '🎨', prompt: 'a stylish creative professional headshot, slightly blurred warm office background, modern casual attire, natural daylight, soft bokeh' },
  { id: 'academic', label: 'Academic Pack', icon: '📚', prompt: 'a clean academic or medical professional headshot, bright white background, formal attire, even lighting, high clarity' },
  { id: 'blackwhite', label: 'Artistic Pack', icon: '🎞️', prompt: 'a dramatic black and white artistic professional portrait, dark background, rim lighting, high contrast, sharp details' },
];

const COMBINE_PRESETS = [
  { id: 'showcase', label: 'Product Showcase', icon: '💎', description: 'Premium lighting for items.', prompt: 'Create a high-end product showcase by seamlessly merging these images into a cohesive, professionally lit studio scene. Focus on premium lighting and sharp focus.' },
  { id: 'skincare', label: 'Skincare Ad', icon: '🧴', description: 'Serene natural vibes.', prompt: 'Generate a clean, aesthetic skincare advertisement. Blend the products into a serene environment with soft lighting, water ripples, and natural textures.' },
  { id: 'tryon', label: 'Virtual Try-On', icon: '👕', description: 'Wear items on people.', prompt: 'Perform a realistic virtual try-on. Take the clothing or accessory from one image and realistically composite it onto the person in the other image, ensuring perfect fit and lighting matching.' },
  { id: 'composite', label: 'Creative Mix', icon: '🎨', description: 'Surreal artistic blends.', prompt: 'Create a surreal and artistic creative composition by blending these disparate images into a single, unified masterpiece with artistic flair.' },
];

const EDIT_PRESETS = [
  { id: 'cyberpunk', label: 'Cyberpunk Style', icon: '🌆', prompt: 'Transform this image into a cyberpunk aesthetic with neon lights, high contrast, and a futuristic sci-fi atmosphere.' },
  { id: 'oil', label: 'Oil Painting', icon: '🎨', prompt: 'Redraw this image as a classic oil painting with visible brushstrokes and rich textures.' },
  { id: 'sketch', label: 'Pencil Sketch', icon: '✏️', prompt: 'Convert this image into a detailed hand-drawn pencil sketch with fine lines and shading.' },
  { id: 'bg-remove', label: 'Change Background', icon: '🌅', prompt: 'Remove the original background and place the subjects in a beautiful mountain landscape at sunset.' },
  { id: 'anime', label: 'Anime Filter', icon: '🌸', prompt: 'Redraw this image in a high-quality Studio Ghibli inspired anime style.' },
  { id: 'enhance', label: 'Smart Enhance', icon: '✨', prompt: 'Enhance the details, colors, and lighting of this image to make it look professionally shot and edited.' },
];

const TEMPLATES = [
  { id: 't1', label: 'Instagram Launch', icon: '📸', category: 'Social' },
  { id: 't2', label: 'LinkedIn Article Header', icon: '👔', category: 'Professional' },
  { id: 't3', label: 'Product Promo Banner', icon: '🏷️', category: 'Marketing' },
  { id: 't4', label: 'Event Invitation', icon: '✉️', category: 'Events' },
  { id: 't5', label: 'YouTube Thumbnail', icon: '🎬', category: 'Content' },
];

const ELEMENT_CATEGORIES = {
  "Basic Shapes": [
    { id: 'rect', label: 'Square', icon: '⬛' },
    { id: 'circle', label: 'Circle', icon: '🔵' },
    { id: 'star', label: 'Star', icon: '⭐' },
    { id: 'heart', label: 'Heart', icon: '❤️' },
    { id: 'triangle', label: 'Triangle', icon: '🔼' },
  ],
  "Sticky Notes": [
    { id: 'sticky-yellow', label: 'Yellow Note', icon: '🟨', color: '#fef08a' },
    { id: 'sticky-blue', label: 'Blue Note', icon: '🟦', color: '#bfdbfe' },
    { id: 'sticky-green', label: 'Green Note', icon: '🟩', color: '#bbf7d0' },
    { id: 'sticky-orange', label: 'Orange Note', icon: '🟧', color: '#fed7aa' },
  ],
  "Marketing Stickers": [
    { id: 'fire', label: 'Trending', icon: '🔥' },
    { id: 'rocket', label: 'Launch', icon: '🚀' },
    { id: 'gem', label: 'Premium', icon: '💎' },
    { id: 'tag', label: 'Sale', icon: '🏷️' },
    { id: 'spark', label: 'New', icon: '✨' },
    { id: 'mega', label: 'Promo', icon: '📢' },
  ],
  "Platform Assets": [
    { id: 'x-logo', label: '𝕏', icon: '𝕏' },
    { id: 'insta', label: 'Instagram', icon: '📸' },
    { id: 'link', label: 'LinkedIn', icon: '👔' },
    { id: 'tube', label: 'YouTube', icon: '🎞️' },
    { id: 'face', label: 'Facebook', icon: '📘' },
  ],
  "Device Frames": [
    { id: 'mobile', label: 'Mobile UI', icon: '📱' },
    { id: 'laptop', label: 'Laptop UI', icon: '💻' },
    { id: 'desktop', label: 'Desktop UI', icon: '🖥️' },
  ]
};

const ContentCreator: React.FC = () => {
  const [activeShelf, setActiveShelf] = useState<ShelfType>('ai');
  const [activeAIMode, setActiveAIMode] = useState<AIMode>('Generate');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  
  const [selectedCombinePreset, setSelectedCombinePreset] = useState<string | null>(null);
  const [selectedEditPreset, setSelectedEditPreset] = useState<string | null>(null);
  const [selectedHeadshotStyle, setSelectedHeadshotStyle] = useState<string | null>(null);
  const [selectedEnv, setSelectedEnv] = useState<string | null>(null);

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  
  const [elements, setElements] = useState<CanvasElement[]>([
    { id: '1', type: 'text', content: 'PRO BRANDING', x: 40, y: 40, width: 300, height: 100, style: { color: '#000', fontSize: '32px', fontWeight: '900' } },
  ]);

  const [sourceImages, setSourceImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sidebarFileInputRef = useRef<HTMLInputElement>(null);

  const sidebarItems: { id: ShelfType; label: string; icon: string }[] = [
    { id: 'templates', label: 'Templates', icon: '📄' },
    { id: 'ai', label: 'AI Magic', icon: '✨' },
    { id: 'elements', label: 'Elements', icon: '🧩' },
    { id: 'uploads', label: 'Uploads', icon: '📤' },
    { id: 'text', label: 'Text', icon: 'T' },
    { id: 'projects', label: 'Projects', icon: '📁' },
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

  const handleSidebarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const url = reader.result as string;
          setSourceImages(prev => [url, ...prev]);
          addImageToCanvas(url);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handlePublish = (data: { title: string; description: string; destination: PublishingDestination }) => {
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

  const processAIRequest = async () => {
    const isSpecialMode = ['Headshots', 'Upscale', 'Extract', 'Analyze'].includes(activeAIMode);
    if (!prompt.trim() && !isSpecialMode && !selectedEnv && !selectedCombinePreset && !selectedEditPreset && !selectedHeadshotStyle) return;
    
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
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
        finalPrompt = `${preset ? preset.prompt : ''} ${prompt || 'Enhance this image'}. Maintain original structure but apply requested changes.`;
      } else if (activeAIMode === 'Combine') {
        model = 'gemini-2.5-flash-image';
        const preset = COMBINE_PRESETS.find(p => p.id === selectedCombinePreset);
        finalPrompt = `${preset ? preset.prompt : 'Seamlessly combine these images into a professional composition.'} ${prompt}. Ensure realistic shadows, lighting match, and seamless blending.`;
      } else if (activeAIMode === 'Headshots') {
        const style = selectedHeadshotStyle ? HEADSHOT_STYLES.find(s => s.id === selectedHeadshotStyle)?.prompt : 'professional studio headshot';
        finalPrompt = `Convert the person in this source photo into a ${style}. High fidelity raw photo quality.`;
      } else if (activeAIMode === 'Analyze') {
        model = 'gemini-3-pro-preview';
        finalPrompt = `Analyze this image in detail and describe its composition, lighting, and subjects.`;
      } else if (activeAIMode === 'Product') {
        model = 'gemini-2.5-flash-image';
        const env = selectedEnv ? PRODUCT_ENVIRONMENTS.find(e => e.id === selectedEnv)?.prompt : 'clean studio';
        finalPrompt = `High-end product photography of this item in a ${env} environment. Commercial quality, perfect lighting.`;
      } else if (activeAIMode === 'Extract') {
        model = 'gemini-3-flash-preview';
        finalPrompt = `Reverse-engineer the highly detailed prompt that would generate this image.`;
      } else if (activeAIMode === 'Upscale') {
        model = 'gemini-2.5-flash-image';
        finalPrompt = `Upscale and enhance this image 2x, adding high-frequency details.`;
      }
      
      parts.push({ text: finalPrompt });
      sourceImages.forEach(img => {
        parts.push({ inlineData: { data: img.split(',')[1], mimeType: img.split(',')[0].split(':')[1].split(';')[0] } });
      });

      const response = await ai.models.generateContent({ model, contents: { parts }, config });

      if (activeAIMode === 'Extract' || activeAIMode === 'Analyze') {
        setPrompt(response.text || "");
      } else {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setGeneratedImages(prev => [`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, ...prev]);
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addImageToCanvas = (url: string) => {
    setElements([...elements, { id: `el-${Date.now()}`, type: 'image', content: url, x: 100, y: 100, width: 250, height: 250 }]);
  };

  const addTextToCanvas = (type: 'h' | 'sh' | 'b') => {
    const config = {
      h: { content: 'ADD HEADLINE', size: '48px', weight: '900' },
      sh: { content: 'Add subheadline', size: '24px', weight: '700' },
      b: { content: 'Add a little bit of body text', size: '16px', weight: '400' },
    }[type];
    setElements([...elements, { 
      id: `el-${Date.now()}`, 
      type: 'text', 
      content: config.content, 
      x: 50, 
      y: 150, 
      width: 400, 
      height: 80,
      style: { fontSize: config.size, fontWeight: config.weight, color: '#000' }
    }]);
  };

  const addShapeToCanvas = (shape: string) => {
    setElements([...elements, { id: `el-${Date.now()}`, type: 'shape', content: shape, x: 200, y: 200, width: 100, height: 100 }]);
  };

  const addStickyToCanvas = (color: string) => {
    setElements([...elements, { 
      id: `el-${Date.now()}`, 
      type: 'sticky', 
      content: 'Idea...', 
      x: 250, 
      y: 250, 
      width: 200, 
      height: 200,
      style: { backgroundColor: color }
    }]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden text-white">
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-black flex items-center"><span className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl mr-3 shadow-lg">✨</span>Marketing Asset Studio</h2>
          <div className="h-6 w-px bg-slate-800"></div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>Advanced AI Multi-Image Synthesis</p>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsPublishModalOpen(true)} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">Post to Blog</button>
          <button onClick={() => speakText(prompt)} disabled={!prompt} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all" title="Speak Prompt/Description">🔊</button>
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all active:scale-95">Export Master</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-20 bg-slate-950 flex flex-col border-r border-slate-800 shrink-0">
          {sidebarItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveShelf(item.id)} 
              className={`p-4 h-24 flex flex-col items-center justify-center space-y-2 transition-all group ${activeShelf === item.id ? 'bg-slate-900 border-r-4 border-indigo-500' : 'hover:bg-slate-900'}`}
            >
              <span className={`text-2xl group-hover:scale-110 transition-transform ${activeShelf === item.id ? 'opacity-100' : 'opacity-40'}`}>{item.icon}</span>
              <span className={`text-[8px] font-black uppercase tracking-tighter ${activeShelf === item.id ? 'text-indigo-400' : 'text-slate-500'}`}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Shelf Content */}
        <div className="w-96 bg-slate-900 border-r border-slate-800 overflow-y-auto shrink-0 flex flex-col p-6 space-y-8 scrollbar-hide">
          {activeShelf === 'templates' && (
             <div className="space-y-6 animate-in fade-in">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Design Blueprints</h3>
                <div className="grid grid-cols-1 gap-4">
                   {TEMPLATES.map(t => (
                     <button key={t.id} onClick={() => addImageToCanvas(`https://picsum.photos/600/400?random=${t.id}`)} className="bg-slate-800/50 border border-white/5 p-6 rounded-[2rem] flex items-center space-x-6 hover:bg-slate-800 transition-all group text-left">
                        <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">{t.icon}</div>
                        <div>
                           <p className="text-sm font-black text-white">{t.label}</p>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t.category}</p>
                        </div>
                     </button>
                   ))}
                </div>
             </div>
          )}

          {activeShelf === 'ai' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Production Mode</h3>
                <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
                  {(['Generate', 'Combine', 'Edit', 'Analyze', 'Product', 'Headshots', 'Upscale'] as AIMode[]).map(mode => (
                    <button 
                      key={mode} 
                      onClick={() => { setActiveAIMode(mode); setSourceImages([]); setSelectedCombinePreset(null); setSelectedEditPreset(null); setSelectedEnv(null); setSelectedHeadshotStyle(null); }} 
                      className={`py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeAIMode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {(['Combine', 'Product', 'Edit', 'Headshots', 'Upscale', 'Analyze'].includes(activeAIMode)) && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase flex justify-between tracking-widest">
                      <span>Source Images (max 3)</span>
                      <span className="text-indigo-400">{sourceImages.length}/3</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {sourceImages.slice(0, 3).map((img, i) => (
                        <div key={i} className="aspect-square rounded-2xl bg-slate-800 border border-slate-700 relative overflow-hidden group shadow-inner">
                          <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="src" />
                          <button onClick={() => setSourceImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center shadow-lg transition-transform hover:scale-110">✕</button>
                        </div>
                      ))}
                      {sourceImages.length < 3 && (
                        <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-600 hover:border-indigo-500 hover:text-indigo-500 transition-all hover:bg-indigo-500/5">
                           <span className="text-2xl mb-1">+</span>
                           <span className="text-[8px] font-black uppercase tracking-tighter">Upload</span>
                        </button>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileUpload} />
                  </div>
                )}

                {activeAIMode === 'Combine' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Combine Presets</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {COMBINE_PRESETS.map(preset => (
                        <button 
                          key={preset.id} 
                          onClick={() => setSelectedCombinePreset(preset.id)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col items-start space-y-1 ${selectedCombinePreset === preset.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-50'}`}
                        >
                          <span className="text-xl">{preset.icon}</span>
                          <span className="text-[9px] font-black uppercase tracking-tight">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeAIMode === 'Product' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Commercial Environments</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {PRODUCT_ENVIRONMENTS.map(env => (
                        <button 
                          key={env.id} 
                          onClick={() => setSelectedEnv(env.id)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col items-start space-y-1 ${selectedEnv === env.id ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-50'}`}
                        >
                          <span className="text-xl">{env.icon}</span>
                          <span className="text-[9px] font-black uppercase tracking-tight">{env.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeAIMode === 'Headshots' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Profile Styles</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {HEADSHOT_STYLES.map(style => (
                        <button 
                          key={style.id} 
                          onClick={() => setSelectedHeadshotStyle(style.id)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col items-start space-y-1 ${selectedHeadshotStyle === style.id ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-50'}`}
                        >
                          <span className="text-xl">{style.icon}</span>
                          <span className="text-[9px] font-black uppercase tracking-tight">{style.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeAIMode === 'Edit' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Edit Presets</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {EDIT_PRESETS.map(preset => (
                        <button 
                          key={preset.id} 
                          onClick={() => setSelectedEditPreset(preset.id)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col items-start space-y-1 ${selectedEditPreset === preset.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-50'}`}
                        >
                          <span className="text-xl">{preset.icon}</span>
                          <span className="text-[9px] font-black uppercase tracking-tight">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Refinement Intent</label>
                  <textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    className="w-full h-32 p-5 text-sm bg-slate-800 border-2 border-slate-700 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-200 transition-all font-medium placeholder-slate-500 shadow-inner" 
                    placeholder="Instruct the model (e.g. blend these with golden hour lighting...)"
                  />
                </div>

                <button onClick={processAIRequest} disabled={isGenerating} className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl disabled:opacity-50 transition-all active:scale-95">
                  {isGenerating ? 'Neural Processing...' : 'Run Production Engine'}
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <h4 className="text-[10px] font-black uppercase text-slate-500 border-b border-slate-800 pb-3 tracking-widest">Master Assets</h4>
                <div className="grid grid-cols-2 gap-4">
                  {generatedImages.map((img, idx) => (
                    <div key={idx} onClick={() => addImageToCanvas(img)} className="aspect-square rounded-[1.5rem] bg-slate-800 border border-slate-700 overflow-hidden cursor-pointer hover:border-indigo-500 transition-all animate-in zoom-in group relative shadow-lg">
                      <img src={img} className="w-full h-full object-cover" alt="Gen" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <span className="text-[10px] font-black uppercase">Add to Canvas</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeShelf === 'elements' && (
             <div className="space-y-10 animate-in fade-in">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Modular Elements</h3>
                
                {Object.entries(ELEMENT_CATEGORIES).map(([cat, items]) => (
                  <div key={cat} className="space-y-4">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1 border-l-2 border-indigo-500 ml-1 pl-3">{cat}</p>
                    <div className="grid grid-cols-4 gap-2">
                       {items.map(s => (
                         <button 
                           key={s.id} 
                           onClick={() => {
                             if (cat === "Sticky Notes") {
                               addStickyToCanvas(s.color!);
                             } else {
                               addShapeToCanvas(s.icon);
                             }
                           }} 
                           className="aspect-square bg-slate-800/50 border border-white/5 rounded-xl flex flex-col items-center justify-center transition-all group hover:bg-slate-800 hover:border-indigo-500"
                           title={s.label}
                         >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
                         </button>
                       ))}
                    </div>
                  </div>
                ))}
             </div>
          )}

          {activeShelf === 'uploads' && (
             <div className="space-y-6 animate-in fade-in">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Media Repository</h3>
                <button 
                   onClick={() => sidebarFileInputRef.current?.click()}
                   className="w-full py-10 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center space-y-3 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group"
                >
                   <span className="text-3xl">📤</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white">Upload Brand Asset</span>
                </button>
                <input type="file" ref={sidebarFileInputRef} className="hidden" multiple accept="image/*" onChange={handleSidebarFileUpload} />
                <div className="grid grid-cols-2 gap-3">
                   {sourceImages.map((img, i) => (
                     <div key={i} onClick={() => addImageToCanvas(img)} className="aspect-square rounded-2xl bg-slate-800 overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all">
                        <img src={img} className="w-full h-full object-cover" alt="upload" />
                     </div>
                   ))}
                </div>
             </div>
          )}

          {activeShelf === 'text' && (
             <div className="space-y-6 animate-in fade-in">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Typography Presets</h3>
                <div className="space-y-4">
                   <button onClick={() => addTextToCanvas('h')} className="w-full p-6 bg-slate-800/50 border border-white/5 rounded-2xl hover:bg-slate-800 transition-all text-left">
                      <span className="text-3xl font-black block leading-none">Add Headline</span>
                   </button>
                   <button onClick={() => addTextToCanvas('sh')} className="w-full p-6 bg-slate-800/50 border border-white/5 rounded-2xl hover:bg-slate-800 transition-all text-left">
                      <span className="text-xl font-bold block leading-none text-slate-300">Add subheadline</span>
                   </button>
                   <button onClick={() => addTextToCanvas('b')} className="w-full p-6 bg-slate-800/50 border border-white/5 rounded-2xl hover:bg-slate-800 transition-all text-left">
                      <span className="text-sm font-medium block leading-none text-slate-400">Add body text</span>
                   </button>
                </div>
             </div>
          )}

          {activeShelf === 'projects' && (
             <div className="space-y-6 animate-in fade-in">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Studio Archive</h3>
                <div className="py-20 text-center opacity-30 italic">No saved drafts in current sector.</div>
             </div>
          )}
        </div>

        <div className="flex-1 p-12 bg-slate-800 overflow-auto flex items-center justify-center pattern-grid-dark relative">
           <div className="bg-white w-[640px] h-[640px] shadow-[0_60px_120px_rgba(0,0,0,0.5)] relative overflow-hidden rounded-[2.5rem] border-[12px] border-slate-950">
              {elements.map(el => (
                <div key={el.id} className="absolute group/element" style={{ left: el.x, top: el.y, width: el.width, height: el.height }}>
                  {el.type === 'text' ? (
                    <div 
                      className="p-4 bg-transparent rounded-2xl border border-transparent hover:border-indigo-500/30 cursor-move outline-none" 
                      contentEditable 
                      suppressContentEditableWarning 
                      style={el.style}
                    >
                       {el.content}
                    </div>
                  ) : el.type === 'sticky' ? (
                    <div 
                      className="w-full h-full p-6 flex items-start justify-center shadow-lg border-b-4 border-black/10 cursor-move outline-none text-black font-medium leading-tight"
                      contentEditable
                      suppressContentEditableWarning
                      style={{ backgroundColor: el.style?.backgroundColor }}
                    >
                       {el.content}
                    </div>
                  ) : el.type === 'shape' ? (
                    <div className="w-full h-full flex items-center justify-center text-[100px] cursor-move select-none">
                       {el.content}
                    </div>
                  ) : (
                    <img src={el.content} className="w-full h-full object-cover rounded-2xl shadow-2xl cursor-move" alt="cv" />
                  )}
                  <button onClick={() => setElements(elements.filter(e => e.id !== el.id))} className="absolute -top-5 -right-5 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/element:opacity-100 shadow-2xl transition-all z-10">✕</button>
                </div>
              ))}
              {elements.length === 0 && (
                <div className="flex-1 h-full flex flex-col items-center justify-center space-y-4 opacity-10">
                   <span className="text-8xl">🏗️</span>
                   <p className="text-2xl font-black uppercase tracking-[0.4em]">Ready for Production</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {isPublishModalOpen && (
        <BlogPublishModal 
          initialTitle="New Studio Asset Post"
          initialDescription="Creative asset generated and refined in the Marketing Studio."
          onClose={() => setIsPublishModalOpen(false)}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
};

export default ContentCreator;
