import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useProducts } from '../../queries/useProducts';
import { TrendingBanner } from '../../components/product/TrendingBanner';
import { CategoryTabs } from '../../components/CategoryTabs';
import { ProductCard } from '../../components/product/ProductCard';
import type { Product, Size } from '../../types';
import { ArrowRight, Box, ShieldCheck, Bike, Zap } from 'lucide-react';
import purpleModel from '../../assets/purple_fur_model.png';

interface HomeProps {
  onOpenSizingGuide: (product: Product) => void;
  onOpen360Viewer: (product: Product) => void;
}

export default function Home({ onOpenSizingGuide, onOpen360Viewer }: HomeProps) {
  const {
    cart,
    addToCart,
    selectedSizes,
    setSize,
    activeCategory,
    setCategory
  } = useStore();

  const { data: queryProducts } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);

  // Sync query products to local state to support local stock deductions
  useEffect(() => {
    if (queryProducts) {
      setProducts(queryProducts);
    }
  }, [queryProducts]);

  const handleAddToCart = (product: Product) => {
    const size = selectedSizes[product.id];
    if (!size) {
      const selectBox = document.getElementById(`size-select-${product.id}`);
      if (selectBox) {
        selectBox.classList.add('animate-bounce-slow');
        setTimeout(() => selectBox.classList.remove('animate-bounce-slow'), 1000);
      }
      return;
    }
    addToCart(product, size);
  };

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Promo swipe banners */}
      <TrendingBanner />

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Model Hero Banner (Rich Dark Velvet Wine with Gold accents for luxury feel) */}
        <div className="lg:col-span-7 rounded-3xl overflow-hidden bg-[#2A141A] border border-[#C5A880]/30 relative flex flex-col justify-between p-8 sm:p-12 shadow-2xl min-h-[460px] md:min-h-[500px]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
          <div className="absolute right-0 bottom-0 top-0 w-1/2 md:w-3/5 pointer-events-none select-none">
            <img src={purpleModel} alt="Premium Model" className="w-full h-full object-cover object-center translate-y-4 md:translate-y-0 scale-105 md:scale-110 filter drop-shadow-2xl" />
          </div>

          <div className="relative z-10">
            <span className="text-xs uppercase tracking-widest bg-white/5 text-white/90 px-3.5 py-1.5 rounded-full font-bold border border-white/10">
              ✨ QUICK_STYLE EXCLUSIVE
            </span>
          </div>

          <div className="max-w-xs md:max-w-md relative z-10 space-y-4 my-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white tracking-tight font-jakarta">
              Unlock the Magic of Fashion
            </h1>
            <p className="text-rose-100/90 text-sm md:text-base leading-relaxed font-light">
              Vibrant local boutique catalogs, real-time AI styling assistance, and quick scooter delivery. Try our AI fit matchmaking tool now!
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-6 mt-6">
            <a href="#marketplace" className="bg-[#C5A880] hover:bg-[#C5A880]/90 text-[#FAF8F5] px-8 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all duration-300 active:scale-95 flex items-center gap-2 group cursor-pointer">
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-white/40"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-white/40"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-white/40"></span>
            </div>
          </div>
        </div>

        {/* Right: Pitch card pointing to the AI Chat Stylist */}
        <div className="lg:col-span-5 glass-card rounded-3xl border border-panelBorder p-8 flex flex-col justify-between shadow-2xl relative min-h-[460px] md:min-h-[500px] bg-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A880]/5 rounded-full filter blur-3xl pointer-events-none"></div>
          <div className="space-y-6">
            <span className="text-[9px] font-bold bg-[#FAF0F1] border border-coral/10 text-coral px-3 py-1 rounded-full uppercase tracking-wider">
              AI Concierge Service
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight font-jakarta">
              Meet Your Personal AI Stylist
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              Describe your occasion, sizing problems, or look preferences, and our neural shopping pilot will scan local boutique inventory to coordinate your exact fit in seconds.
            </p>
            
            <div className="border border-panelBorder/60 rounded-2xl p-4 bg-[#FAF8F5] space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-gray-700">
                <span className="p-1 rounded bg-[#5C1324]/10 text-coral font-bold mt-0.5">Prompt</span>
                <p className="italic">"Need a knit sweater for NIT Jamshedpur presentation today..."</p>
              </div>
            </div>
          </div>

          <a href="/chat" className="w-full py-4 rounded-xl bg-[#5C1324] hover:bg-[#430E1A] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 text-center flex items-center justify-center gap-2 shadow-lg shadow-coral/10 cursor-pointer">
            <Zap className="w-4 h-4 fill-white" />
            <span>Launch AI Stylist Chat</span>
          </a>
        </div>
      </section>

      {/* Live Marketplace */}
      <section id="marketplace" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-coral mb-2 animate-pulse-subtle">
              <Zap className="w-5 h-5 text-coral fill-coral/10" />
              <span className="text-xs font-bold uppercase tracking-widest">LIVE INVENTORY • LOCAL STOCKS</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight font-jakarta">
              Flash-Delivery Marketplace
            </h2>
            <p className="text-gray-600 text-sm mt-1">Ready-to-ship boutique garments near you. Instant calibration match.</p>
          </div>

          {/* Framer motion category tabs */}
          <CategoryTabs
            activeCategory={activeCategory}
            onSelectCategory={setCategory}
          />
        </div>

        {/* Bento grid marketplace */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selectedSize={selectedSizes[product.id]}
              onSelectSize={(id, sz) => setSize(id, sz)}
              onAddToCart={handleAddToCart}
              onOpenSizingGuide={onOpenSizingGuide}
              onOpen360Viewer={onOpen360Viewer}
            />
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl border border-panelBorder p-6 space-y-3 flex items-start gap-4 hover:border-coral/20 transition-colors bg-white">
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#C5A880]/30 text-[#C5A880]">
            <Box className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-gray-900">Zero-Inventory Architecture</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Connecting you directly to live local inventory in verified boutique stores nearby. Zero latency shipping.</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-panelBorder p-6 space-y-3 flex items-start gap-4 hover:border-coral/20 transition-colors bg-white">
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#C5A880]/30 text-[#C5A880]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-gray-900">Hyper-Accurate Fit Calibration</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Smart sizing AI calculates exact mappings between Zara and local boutiques so it fits you right, first try.</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-panelBorder p-6 space-y-3 flex items-start gap-4 hover:border-coral/20 transition-colors bg-white">
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#C5A880]/30 text-[#C5A880]">
            <Bike className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-gray-900">Instant Scooter Delivery</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Automated local courier dispatching system delivers premium sealed packages in under 12 minutes.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
