import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShieldCheck, Truck, X, ChevronLeft, ChevronRight, Upload, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '../../components/product/ProductCard';
import type { Product, Size } from '../../types';
import { fetchProducts, mapProduct } from '../../queries/useProducts';

// ─── AI-Generated model views per cloth type ─────────────────────────────────
const AI_MODEL_VIEWS: Record<string, { src: string; label: string }[]> = {
  blazer: [
    { src: '/ai-models/blazer_front.png', label: 'Front View' },
    { src: '/ai-models/blazer_side.png',  label: 'Side View' },
    { src: '/ai-models/blazer_back.png',  label: 'Back View' },
  ],
  black_dress: [
    { src: '/ai-models/black_dress_front.png', label: 'Front View' },
    { src: '/ai-models/black_dress_side.png',  label: 'Side View' },
    { src: '/ai-models/black_dress_back.png',  label: 'Back View' },
  ],
  brown_dress: [
    { src: '/ai-models/brown_midi_front.png', label: 'Front View' },
    { src: '/ai-models/brown_midi_side.png',  label: 'Side View' },
    { src: '/ai-models/brown_midi_back.png',  label: 'Back View' },
  ],
  blue_dress: [
    { src: '/ai-models/blue_dress_front.png', label: 'Front View' },
    { src: '/ai-models/blue_dress_side.png',  label: 'Side View' },
    { src: '/ai-models/blue_dress_back.png',  label: 'Back View' },
  ],
  hoodie: [
    { src: '/ai-models/hoodie_front.png', label: 'Front View' },
    { src: '/ai-models/hoodie_side.png',  label: 'Side View' },
    { src: '/ai-models/hoodie_back.png',  label: 'Back View' },
  ],
  tshirt: [
    { src: '/ai-models/tshirt_front.png', label: 'Front View' },
    { src: '/ai-models/tshirt_side.png',  label: 'Side View' },
    { src: '/ai-models/tshirt_back.png',  label: 'Back View' },
  ],
  grey_shirt: [
    { src: '/ai-models/grey_shirt_front.png', label: 'Front View' },
    { src: '/ai-models/grey_shirt_side.png',  label: 'Side View' },
    { src: '/ai-models/grey_shirt_back.png',  label: 'Back View' },
  ],
  core_heavyweight_tee: [
    { src: '/ai-models/core_heavyweight_tee_front.png', label: 'Front View' },
    { src: '/ai-models/core_heavyweight_tee_side.png',  label: 'Side View' },
    { src: '/ai-models/core_heavyweight_tee_back.png',  label: 'Back View' },
  ],
  silk_tunic: [
    { src: '/ai-models/silk_tunic_front.png', label: 'Front View' },
    { src: '/ai-models/silk_tunic_side.png',  label: 'Side View' },
    { src: '/ai-models/silk_tunic_back.png',  label: 'Back View' },
  ],
  apex_tech_hoodie: [
    { src: '/ai-models/apex_tech_hoodie_front.png', label: 'Front View' },
    { src: '/ai-models/apex_tech_hoodie_side.png',  label: 'Side View' },
    { src: '/ai-models/apex_tech_hoodie_back.png',  label: 'Back View' },
  ],
  vanguard_utility_jacket: [
    { src: '/ai-models/vanguard_utility_jacket_front.png', label: 'Front View' },
    { src: '/ai-models/vanguard_utility_jacket_side.png',  label: 'Side View' },
    { src: '/ai-models/vanguard_utility_jacket_back.png',  label: 'Back View' },
  ],
  amethyst_knit_sweater: [
    { src: '/ai-models/amethyst_knit_sweater_front.png', label: 'Front View' },
    { src: '/ai-models/amethyst_knit_sweater_side.png',  label: 'Side View' },
    { src: '/ai-models/amethyst_knit_sweater_back.png',  label: 'Back View' },
  ],
  obsidian_ribbed_knit: [
    { src: '/ai-models/obsidian_ribbed_knit_front.png', label: 'Front View' },
    { src: '/ai-models/obsidian_ribbed_knit_side.png',  label: 'Side View' },
    { src: '/ai-models/obsidian_ribbed_knit_back.png',  label: 'Back View' },
  ],
  striped_dress: [
    { src: '/ai-models/striped_dress_front.png', label: 'Front View' },
    { src: '/ai-models/striped_dress_side.png',  label: 'Side View' },
    { src: '/ai-models/striped_dress_back.png',  label: 'Back View' },
  ],
  trousers: [
    { src: '/ai-models/trousers_front.png', label: 'Front View' },
    { src: '/ai-models/trousers_side.png',  label: 'Side View' },
    { src: '/ai-models/trousers_back.png',  label: 'Back View' },
  ],
  combat_boot: [
    { src: '/ai-models/boot_front.png', label: 'Front View' },
    { src: '/ai-models/boot_side.png',  label: 'Side View' },
    { src: '/ai-models/boot_back.png',  label: 'Back View' },
  ],
  stiletto: [
    { src: '/ai-models/stiletto_front.png', label: 'Front View' },
    { src: '/ai-models/stiletto_side.png',  label: 'Side View' },
    { src: '/ai-models/stiletto_back.png',  label: 'Back View' },
  ],
  cuff: [
    { src: '/ai-models/cuff_front.png', label: 'Front View' },
    { src: '/ai-models/cuff_side.png',  label: 'Side View' },
    { src: '/ai-models/cuff_back.png',  label: 'Back View' },
  ],
  minaudiere: [
    { src: '/ai-models/minaudiere_front.png', label: 'Front View' },
    { src: '/ai-models/minaudiere_side.png',  label: 'Side View' },
    { src: '/ai-models/minaudiere_back.png',  label: 'Back View' },
  ],
  obsidian_gown: [
    { src: '/ai-models/obsidian_gown_front.jpg', label: 'Front View' },
    { src: '/ai-models/obsidian_gown_side.jpg',  label: 'Side View' },
    { src: '/ai-models/obsidian_gown_back.jpg',  label: 'Back View' },
  ],
  // fallback uses tshirt models
  default: [
    { src: '/ai-models/tshirt_front.png', label: 'Front View' },
    { src: '/ai-models/tshirt_side.png',  label: 'Side View' },
    { src: '/ai-models/tshirt_back.png',  label: 'Back View' },
  ],
};

function getModelViews(product: Product): { src: string; label: string }[] {
  // If this product was generated by our AI agent, use its gallery
  if (product.tags?.includes("ai_generated") && product.gallery && product.gallery.length > 0) {
     return product.gallery.map((imgUrl, idx) => ({
        src: imgUrl,
        label: `AI Variation ${idx + 1}`
     }));
  }

  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();

  // 1. Explicit mappings for all catalog items in the database:
  if (name.includes('obsidian gown')) {
    return AI_MODEL_VIEWS.obsidian_gown;
  }
  if (name.includes('obsidian ribbed knit') || name.includes('ribbed knit')) {
    return AI_MODEL_VIEWS.obsidian_ribbed_knit;
  }
  if (name.includes('architectural blazer')) {
    return AI_MODEL_VIEWS.blazer;
  }
  if (name.includes('core heavyweight tee') || name.includes('heavyweight tee')) {
    return AI_MODEL_VIEWS.core_heavyweight_tee;
  }
  if (name.includes('silk drape tunic') || name.includes('silk tunic') || name.includes('tunic')) {
    return AI_MODEL_VIEWS.silk_tunic;
  }
  if (name.includes('precision cut trousers') || name.includes('trousers') || name.includes('pants') || name.includes('tailored')) {
    return AI_MODEL_VIEWS.trousers;
  }
  if (name.includes('monolith combat boot') || name.includes('combat boot') || name.includes('boot')) {
    return AI_MODEL_VIEWS.combat_boot;
  }
  if (name.includes('noir stiletto') || name.includes('stiletto') || name.includes('heel') || name.includes('shoe')) {
    return AI_MODEL_VIEWS.stiletto;
  }
  if (name.includes('architectural cuff') || name.includes('cuff') || name.includes('bracelet')) {
    return AI_MODEL_VIEWS.cuff;
  }
  if (name.includes('minimalist minaudiere') || name.includes('minaudiere') || name.includes('bag') || name.includes('clutch')) {
    return AI_MODEL_VIEWS.minaudiere;
  }
  if (name.includes('apex tech hoodie') || name.includes('apex')) {
    return AI_MODEL_VIEWS.apex_tech_hoodie;
  }
  if (name.includes('vanguard utility jacket') || name.includes('utility jacket')) {
    return AI_MODEL_VIEWS.vanguard_utility_jacket;
  }
  if (name.includes('amethyst knit sweater') || name.includes('amethyst') || name.includes('sweater')) {
    return AI_MODEL_VIEWS.amethyst_knit_sweater;
  }
  if (name.includes('aero-knit activewear tee') || name.includes('activewear tee') || name.includes('aero-knit') || name.includes('cool tshirt')) {
    return AI_MODEL_VIEWS.tshirt; // the coral tshirt
  }
  if (name.includes('obsidian formal blazer') || name.includes('formal blazer')) {
    return AI_MODEL_VIEWS.blazer;
  }
  if (name.includes('honky tonky') || name.includes('striped dress') || name.includes('charming dress')) {
    return AI_MODEL_VIEWS.striped_dress;
  }
  if (name.includes('trendy aayu') || name.includes('brown midi') || name.includes('brown dress')) {
    return AI_MODEL_VIEWS.brown_dress;
  }
  if (name.includes('v-mart') || name.includes('light blue dress')) {
    return AI_MODEL_VIEWS.blue_dress;
  }

  // 2. Keyword-based matching fallbacks
  // Dresses / Gowns
  if (name.includes('dress') || name.includes('gown') || name.includes('midi') || name.includes('mini') || name.includes('skirt') || name.includes('flare')) {
    if (name.includes('black') || name.includes('striped')) return AI_MODEL_VIEWS.striped_dress;
    if (name.includes('brown')) return AI_MODEL_VIEWS.brown_dress;
    if (name.includes('blue')) return AI_MODEL_VIEWS.blue_dress;
    return AI_MODEL_VIEWS.black_dress;
  }

  // Hoodies / Jackets / Sweaters
  if (name.includes('hoodie') || name.includes('jacket') || name.includes('sweater') || name.includes('knit') || name.includes('sweatshirt')) {
    if (name.includes('lavender') || name.includes('purple')) return AI_MODEL_VIEWS.apex_tech_hoodie;
    if (name.includes('amethyst')) return AI_MODEL_VIEWS.amethyst_knit_sweater;
    if (name.includes('black') || name.includes('obsidian') || name.includes('dark')) return AI_MODEL_VIEWS.vanguard_utility_jacket;
    return AI_MODEL_VIEWS.hoodie;
  }

  // Blazers / Suits
  if (name.includes('blazer') || name.includes('suit') || name.includes('formal')) {
    return AI_MODEL_VIEWS.blazer;
  }

  // T-shirts / Shirts
  if (name.includes('tee') || name.includes('tshirt') || name.includes('t-shirt') || name.includes('shirt')) {
    if (name.includes('white') || name.includes('optic')) return AI_MODEL_VIEWS.core_heavyweight_tee;
    if (name.includes('grey') || name.includes('gray')) return AI_MODEL_VIEWS.grey_shirt;
    if (name.includes('navy') || name.includes('midnight') || name.includes('tunic')) return AI_MODEL_VIEWS.silk_tunic;
    return AI_MODEL_VIEWS.tshirt;
  }

  // 3. Category/Accessory fallbacks
  const cat = category.toLowerCase();
  if (cat.includes('accessories') || name.includes('cuff') || name.includes('bag') || name.includes('minaudiere')) {
    return AI_MODEL_VIEWS.minaudiere;
  }
  if (cat.includes('footwear') || name.includes('boot') || name.includes('stiletto') || name.includes('shoe')) {
    if (name.includes('stiletto') || name.includes('heel')) return AI_MODEL_VIEWS.stiletto;
    if (name.includes('boot')) return AI_MODEL_VIEWS.combat_boot;
    return AI_MODEL_VIEWS.default;
  }

  return AI_MODEL_VIEWS.default;
}

// ─── Lightbox Component ───────────────────────────────────────────────────────
interface LightboxProps {
  views: { src: string; label: string }[];
  startIdx: number;
  onClose: () => void;
}

function Lightbox({ views, startIdx, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(startIdx);
  const prev = () => setIdx(i => (i - 1 + views.length) % views.length);
  const next = () => setIdx(i => (i + 1) % views.length);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative max-w-xl w-full mx-4" onClick={e => e.stopPropagation()}>
        {/* Image */}
        <img
          src={views[idx].src}
          alt={views[idx].label}
          className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
        />

        {/* Label */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/20">
          {views[idx].label} &nbsp;·&nbsp; AI Model
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Prev */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next */}
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {views.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TryOnModal Component ───────────────────────────────────────────────────
interface TryOnModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

function TryOnModal({ product, isOpen, onClose }: TryOnModalProps) {
  const [userFile, setUserFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
      setAdvice(null);
      setError(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUserFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
      setAdvice(null);
      setError(null);
    }
  };

  const handleReset = () => {
    setUserFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setAdvice(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!userFile) return;
    setIsGenerating(true);
    setError(null);
    setLoadingStep("Uploading image...");

    const steps = [
      "Uploading your photo...",
      "AI is analyzing your pose and features...",
      "Matching skin tones and lighting...",
      "Calibrating garment sizing...",
      "Simulating fabric textures...",
      "Rendering your personalized Try-On preview...",
    ];
    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length - 1) {
        stepIdx++;
        setLoadingStep(steps[stepIdx]);
      }
    }, 2500);

    try {
      const formData = new FormData();
      formData.append("user_image", userFile);
      formData.append("garment_image_url", product.image);
      formData.append("garment_name", product.name);
      formData.append("category", product.category || "tops");

      const res = await fetch("/api/v1/vto/try-on-upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (!res.ok) {
        throw new Error(`Server returned error status: ${res.status}`);
      }

      const data = await res.json();
      setResultUrl(data.generated_image_url);
      setAdvice(data.styling_advice);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process the request. Please verify your connection.");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
        .animate-scan-loop {
          animation: scan 2.5s linear infinite;
        }
      `}</style>
      <div 
        className="relative bg-surface-container-lowest border border-outline-variant/30 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col md:flex-row min-h-[550px] max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Product Context & Info */}
        <div className="md:w-80 bg-surface-container-low p-6 flex flex-col justify-between border-r border-outline-variant/20 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-6 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">AI Virtual Dressing</span>
            </div>
            
            <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 mb-6 shadow-sm">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-surface-container-low mb-3">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold text-sm text-on-surface truncate">{product.name}</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">₹{product.price.selling_price}</p>
            </div>

            <div className="text-xs text-on-surface-variant space-y-2.5">
              <p className="font-semibold text-on-surface">Tips for best results:</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>Use a clear, front-facing, well-lit photo of yourself.</li>
                <li>Avoid loose clothing or patterns in your photo.</li>
                <li>Ensure the background is relatively clean/solid.</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-outline-variant/10">
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Powered by Gemini and Pollinations AI. Images are processed securely and not saved permanently.
            </p>
          </div>
        </div>

        {/* Right Side: Workspace */}
        <div className="flex-1 p-6 md:p-8 flex flex-col relative overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-surface-container-high hover:bg-surface-container-highest rounded-full flex items-center justify-center text-on-surface transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <h2 className="font-display-md text-xl md:text-2xl text-on-surface mb-6 pr-8">
            Virtual Try-On
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">Generation Failed</p>
                <p className="mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Workflow content */}
          <div className="flex-1 flex flex-col justify-center">
            
            {/* Step 1: Upload state */}
            {!previewUrl && !isGenerating && (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className="border-2 border-dashed border-outline-variant/40 hover:border-purple-500/50 rounded-2xl p-8 text-center cursor-pointer transition-colors duration-300 bg-surface-container-low/30 hover:bg-surface-container-low/60 flex flex-col items-center justify-center min-h-[300px]"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="font-semibold text-on-surface text-base">Drag and drop your photo here</p>
                <p className="text-xs text-on-surface-variant mt-1.5">or click to browse from device</p>
                <p className="text-[10px] text-on-surface-variant mt-6 uppercase tracking-wider">Supports JPEG, PNG up to 10MB</p>
              </div>
            )}

            {/* Step 2: Uploaded, but not yet generated */}
            {previewUrl && !resultUrl && !isGenerating && (
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="relative w-full max-w-sm aspect-[3/4] bg-surface-container-low rounded-2xl overflow-hidden shadow-md">
                  <img src={previewUrl} alt="Your photo" className="w-full h-full object-cover" />
                  <button 
                    onClick={handleReset}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Change
                  </button>
                </div>
                
                <button
                  onClick={handleGenerate}
                  className="w-full max-w-sm h-12 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate AI Try-On
                </button>
              </div>
            )}

            {/* Step 3: Loading / Generating state */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-8 text-center min-h-[300px]">
                <div className="relative w-44 aspect-[3/4] bg-surface-container-low rounded-2xl overflow-hidden mb-6 shadow-lg border border-outline-variant/20">
                  <img src={previewUrl!} alt="Uploading preview" className="w-full h-full object-cover opacity-60" />
                  
                  {/* Glowing vertical scanner animation line */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 shadow-[0_0_15px_#a855f7] animate-scan-loop z-10" />
                </div>

                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold mb-2">
                  <span className="material-symbols-outlined animate-spin text-xl">autorenew</span>
                  <span>Generating Try-On...</span>
                </div>
                <p className="text-sm text-on-surface-variant font-medium max-w-xs transition-all duration-500">
                  {loadingStep}
                </p>
              </div>
            )}

            {/* Step 4: Success state */}
            {resultUrl && !isGenerating && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Left: Original Photo */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Your Photo</span>
                    <div className="aspect-[3/4] bg-surface-container-low rounded-2xl overflow-hidden shadow border border-outline-variant/10">
                      <img src={previewUrl!} alt="Original upload" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Right: AI Result */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Simulation
                      </span>
                      <span className="text-[9px] uppercase tracking-widest bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-200/20">Ready</span>
                    </div>
                    <div className="aspect-[3/4] bg-surface-container-low rounded-2xl overflow-hidden shadow-lg border border-purple-500/20 relative group">
                      <img src={resultUrl} alt="Try on result" className="w-full h-full object-cover" />
                      <a 
                        href={resultUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Open full size image"
                      >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* AI Styling Advice */}
                {advice && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/10">
                    <h4 className="font-semibold text-xs text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> AI Stylist Recommendation
                    </h4>
                    <p className="text-sm text-on-surface leading-relaxed font-normal">
                      {advice}
                    </p>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 h-12 rounded-full border border-outline-variant text-on-surface font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Another Photo
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 h-12 rounded-full bg-on-surface text-background font-semibold flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors"
                  >
                    Close & Decide
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart, setCartOpen } = useStore();
  const [selectedSize, setSelectedSize] = useState<Size | ''>('');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);

  // Scroll to top when product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/products/${id}`);
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      return mapProduct(data);
    },
    enabled: !!id
  });

  const { data: similarProducts = [] } = useQuery<Product[]>({
    queryKey: ['similarProducts', product?.category],
    queryFn: async () => {
      const products = await fetchProducts(`category=${product?.category}&limit=5`);
      return products.filter(p => p.id !== id).slice(0, 4);
    },
    enabled: !!product?.category
  });

  const { data: completeTheLook = [] } = useQuery<Product[]>({
    queryKey: ['completeTheLook', 'Accessories'],
    queryFn: async () => {
      const products = await fetchProducts('category=Accessories&limit=4');
      return products.filter(p => p.id !== id).slice(0, 4);
    }
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span></div>;
  if (isError || !product) return <div className="min-h-screen flex items-center justify-center flex-col gap-4"><h2>Product Not Found</h2><button onClick={() => navigate('/collection')} className="underline">Back to Collection</button></div>;

  const images = product.gallery.length > 0 ? [product.image, ...product.gallery] : [product.image];
  const mainImage = images[0];
  const sideImages = images.slice(1, 3);
  const isWished = wishlist.includes(product.id as string);
  const isOutOfStock = Object.values(product.stock).reduce((sum, val) => sum + val, 0) === 0;
  const modelViews = getModelViews(product);

  const handleAddToCart = () => {
    if (selectedSize) {
      addToCart(product, selectedSize as any);
      setCartOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in pb-24">

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && (
        <Lightbox views={modelViews} startIdx={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}

      {/* ── Virtual Try-On Modal ── */}
      <TryOnModal
        product={product}
        isOpen={isTryOnOpen}
        onClose={() => setIsTryOnOpen(false)}
      />

      {/* ── Product Top Section ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-margin-desktop py-8 md:py-16">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm uppercase tracking-widest text-on-surface-variant hover:text-on-surface mb-8 transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left: Hero Imagery */}
          <div className="col-span-1 lg:col-span-7 flex flex-col gap-unit">
            <div className="w-full aspect-[3/4] bg-surface-container-lowest relative overflow-hidden group rounded-xl">
              <img alt={product.name} className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-[1200ms] ease-out" src={mainImage} />
              <div className="absolute bottom-6 left-6 bg-surface/40 backdrop-blur-xl border border-outline-variant/30 px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg">
                <p className="font-label-caps-xs text-label-caps-xs text-on-surface-variant mb-1">AI GENERATED ASSET</p>
                <p className="font-body-base text-xs text-on-surface">Category: {product.category}</p>
              </div>
            </div>
            {sideImages.length > 0 && (
              <div className="grid grid-cols-2 gap-unit">
                {sideImages.map((img, idx) => (
                  <div key={idx} className="aspect-[3/4] bg-surface-container-lowest overflow-hidden rounded-xl">
                    <img alt={`${product.name} detail ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" src={img} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="col-span-1 lg:col-span-5 lg:pl-8 flex flex-col pt-8 lg:pt-0 lg:sticky lg:top-24 h-fit">
            <div className="flex justify-between items-start mb-6 border-b border-outline-variant/20 pb-8">
              <div>
                <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-3xl text-on-surface mb-2">{product.name}</h1>
                <p className="font-body-base text-body-base text-on-surface-variant">{product.brand} - {product.category}</p>
              </div>
              <button onClick={() => toggleWishlist(product.id as string)} className="p-2 hover:bg-surface-container-low rounded-full transition-colors group">
                <Heart className={`w-6 h-6 transition-transform group-hover:scale-110 ${isWished ? 'fill-primary text-primary' : 'text-on-surface'}`} />
              </button>
            </div>

            <div className="mb-10">
              <div className="flex items-end gap-3 mb-4">
                <p className="font-headline-md text-headline-md text-on-surface">₹{product.price.selling_price}</p>
                {product.price.discount_percent > 0 && (
                  <>
                    <span className="text-on-surface-variant line-through text-sm mb-1">₹{product.price.mrp}</span>
                    <span className="text-emerald-500 font-bold text-sm mb-1">{product.price.discount_percent}% off</span>
                  </>
                )}
              </div>
              <p className="font-body-base text-sm text-on-surface-variant leading-relaxed">{product.description}</p>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <p className="font-label-caps text-label-caps text-on-surface mb-3">
                  COLOR: <span className="text-on-surface-variant ml-2">{product.colors[0].name}</span>
                </p>
                <div className="flex gap-3">
                  {product.colors.map((c, i) => (
                    <button key={i} aria-label={`Select ${c.name}`} className="w-8 h-8 rounded-full border border-on-surface ring-2 ring-background ring-offset-1 ring-offset-on-surface focus:outline-none" style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-10">
              <div className="flex justify-between items-end mb-3">
                <p className="font-label-caps text-label-caps text-on-surface">SELECT SIZE</p>
                <button className="font-label-caps-xs text-label-caps-xs text-on-surface-variant hover:text-on-surface underline transition-colors">SIZE GUIDE</button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes_available.map(size => {
                  const inStock = (product.stock[size] || 0) > 0;
                  return (
                    <button
                      key={size}
                      disabled={!inStock}
                      onClick={() => setSelectedSize(size as Size)}
                      className={`py-3 border font-body-base text-sm transition-all focus:outline-none
                        ${selectedSize === size ? 'border-on-surface bg-surface-container-high text-on-surface' : 'border-outline-variant text-on-surface-variant hover:border-on-surface hover:text-on-surface'}
                        ${!inStock ? 'opacity-40 bg-surface-container-lowest cursor-not-allowed line-through' : ''}
                      `}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-8 bg-surface-container p-4 rounded-xl border border-outline-variant/20">
              <div className="text-sm">
                <p className="text-primary font-semibold flex items-center gap-1">
                  {product.store_name} <span className="bg-primary text-background rounded-full text-[10px] w-3 h-3 flex items-center justify-center font-bold">✓</span>
                </p>
                <div className="flex items-center gap-3 mt-2 text-on-surface-variant">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-primary" /> Authentic Local Stock</span>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <Truck className="w-4 h-4 text-on-surface shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-on-surface">Delivery in {product.delivery_eta || 45} Minutes | <span className="text-primary">Free</span></p>
                    <p className="text-on-surface-variant mt-1">From: {product.store_name} ({product.distance || 2} km away)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-12">
              <button
                disabled={isOutOfStock || !selectedSize}
                onClick={handleAddToCart}
                className="w-full h-[52px] bg-on-surface text-background font-body-bold text-body-bold hover:bg-surface-tint transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOutOfStock ? 'SOLD OUT' : (selectedSize ? 'ADD TO BAG' : 'SELECT SIZE')}
                <span className="material-symbols-outlined text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI MODEL SHOWCASE ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-margin-desktop py-14 border-t border-outline-variant/20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[14px]">smart_toy</span>
            </div>
            <h2 className="font-display-md text-2xl text-on-surface">See It On Models</h2>
            <span className="text-[10px] uppercase tracking-widest bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold border border-purple-200">AI Generated</span>
          </div>
          <button
            onClick={() => setIsTryOnOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            Try It On Yourself
          </button>
        </div>
        <p className="text-sm text-on-surface-variant mb-10 ml-9">AI-generated model previews showing how this garment looks from different angles</p>

        {/* 3 Model Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {modelViews.map((view, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxIdx(idx)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-container-low shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <img
                  src={view.src}
                  alt={view.label}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                {/* Bottom label on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                  <p className="text-white font-semibold text-sm uppercase tracking-wider">{view.label}</p>
                  <p className="text-white/70 text-xs mt-0.5">Click to enlarge</p>
                </div>

                {/* Zoom icon */}
                <div className="absolute top-4 right-4 w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="material-symbols-outlined text-white text-[16px]">zoom_in</span>
                </div>

                {/* AI badge */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-white/20">
                  ✦ AI Model
                </div>
              </div>

              {/* Label below card */}
              <div className="mt-3 px-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface uppercase tracking-wide">{view.label}</span>
                <span className="text-xs text-on-surface-variant">View {idx + 1} / {modelViews.length}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Complete the Look ── */}
      {completeTheLook.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-margin-desktop py-12 border-t border-outline-variant/20">
          <div className="flex justify-between items-end mb-10">
            <h2 className="font-display-md text-2xl text-on-surface">Complete The Look</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {completeTheLook.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Similar Products ── */}
      {similarProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-margin-desktop py-12 border-t border-outline-variant/20">
          <div className="flex justify-between items-end mb-10">
            <h2 className="font-display-md text-2xl text-on-surface">Similar Pieces</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
