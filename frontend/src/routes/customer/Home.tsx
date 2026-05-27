import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useProducts } from '../../queries/useProducts';
import { TrendingBanner } from '../../components/product/TrendingBanner';
import { CategoryTabs } from '../../components/CategoryTabs';
import { ProductCard, getImageAsset } from '../../components/product/ProductCard';
import type { Product, Size } from '../../types';
import { ArrowRight, Box, ShieldCheck, Bike, Zap, MapPin, ChevronDown } from 'lucide-react';
import purpleModel from '../../assets/purple_fur_model.png';

interface HomeProps {
  onOpenSizingGuide: (product: Product) => void;
  onOpen360Viewer: (product: Product) => void;
}

const CountdownTimer: React.FC = () => {
  const [seconds, setSeconds] = useState(719); // 11 mins 59 secs
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 719));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    <span className="flex items-center gap-1 text-[9px] font-extrabold tracking-wide px-2 py-1 rounded bg-[#5C1324] text-white shadow-md">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
      <span>⚡ FAST SELLING · {mins}:{secs < 10 ? `0${secs}` : secs}</span>
    </span>
  );
};

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
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showHotDeals, setShowHotDeals] = useState<boolean>(false);
  const [showDiscount, setShowDiscount] = useState<boolean>(false);

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

  let filteredProducts = activeCategory === 'All'
    ? [...products]
    : products.filter(p => p.category === activeCategory);

  if (showHotDeals) {
    filteredProducts = filteredProducts.filter(p => p.price.discount_percent >= 50);
  } else if (showDiscount) {
    filteredProducts = filteredProducts.filter(p => p.price.discount_percent > 0);
  }

  if (sortBy === 'price_low') {
    filteredProducts.sort((a, b) => a.price.selling_price - b.price.selling_price);
  } else if (sortBy === 'price_high') {
    filteredProducts.sort((a, b) => b.price.selling_price - a.price.selling_price);
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating.average - a.rating.average);
  }

  return (
    <div className="space-y-0 py-0 animate-fade-in">
      
      {/* 1. Sticky Navigation: Circular Categories horizontal row */}
      <section className="sticky top-[80px] z-30 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-panelBorder/30 py-2 -mx-4 px-4 md:-mx-8 md:px-8 transition-all duration-300">
        <CategoryTabs
          activeCategory={activeCategory}
          onSelectCategory={setCategory}
        />
      </section>

      {/* 2. Immersive Full-Bleed Hero Banner */}
      <TrendingBanner />

      {/* 3. 'Trending Now' Horizontal Scroll Section */}
      <section className="py-12 border-b border-panelBorder/30">
        <div className="mb-6">
          <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-[0.25em]">Hot This Week</span>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight font-jakarta">Trending Now</h2>
        </div>
        
        {/* Horizontal scroll carousel */}
        <div className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none py-2 -mx-4 px-4 md:-mx-8 md:px-8">
          {products.map((product, index) => {
            const isHotItem = index % 2 === 0;
            return (
              <div
                key={`trending-${product.id}`}
                className="flex-shrink-0 w-[75%] sm:w-[280px] snap-start overflow-hidden flex flex-col gap-3 group bg-transparent border-none shadow-none"
              >
                {/* Product Image Container (No border, rounded radius, light background) */}
                <div className="relative aspect-[3/4] w-full bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#C5A880]/5 to-transparent opacity-60 group-hover:scale-105 transition-transform duration-500"></div>
                  <img
                    src={getImageAsset(product.id)}
                    alt={product.name}
                    className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Floating Urgency Badges / countdown timer */}
                  <div className="absolute top-3.5 right-3.5 z-20 flex flex-col gap-1.5 items-end">
                    {isHotItem ? (
                      <CountdownTimer />
                    ) : (
                      <span className="text-[9px] font-extrabold tracking-widest px-2.5 py-1.5 rounded-lg bg-orange-600 text-white shadow-md uppercase animate-pulse flex items-center gap-1">
                        <span>🔥</span>
                        <span>HOT SELLING</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Location Badge */}
                  <span className="absolute bottom-3 left-3 z-20 text-[9px] font-bold px-2.5 py-1.5 rounded-xl bg-white/95 text-gray-800 border border-panelBorder/40 flex items-center gap-1 shadow-md">
                    <MapPin className="w-2.5 h-2.5 text-[#C5A880]" />
                    <span>{product.boutique}</span>
                  </span>
                </div>
                
                {/* Minimalist Info Area directly underneath */}
                <div className="space-y-1 text-left px-1">
                  <div className="flex items-center justify-between text-[9px] font-bold text-[#C5A880] uppercase tracking-wider">
                    <span>{product.category}</span>
                    <span>{product.fitAccuracy}% Fit Match</span>
                  </div>
                  <h3 className="font-semibold text-xs text-gray-900 truncate">{product.name}</h3>
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-sm font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400 line-through">${(product.price * 1.3).toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">30% OFF</span>
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onOpen360Viewer(product)}
                      className="flex-1 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-850 text-[10px] font-bold transition-all cursor-pointer text-center"
                    >
                      360° View
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 py-1.5 rounded-lg bg-gray-950 hover:bg-gray-850 text-white text-[10px] font-bold transition-all cursor-pointer text-center"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Flipkart Style Filter Bar */}
      <section className="bg-white border-y border-panelBorder py-3 mb-6 sticky top-[72px] z-30 shadow-sm">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar px-2">
          <button 
            onClick={() => setSortBy(prev => prev === 'price_low' ? 'price_high' : prev === 'price_high' ? 'featured' : 'price_low')}
            className={`flex items-center gap-1 border px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition
              ${sortBy !== 'featured' ? 'bg-coral/10 border-coral text-coral' : 'bg-[#FAF8F5] border-panelBorder text-gray-700 hover:bg-gray-100'}`}
          >
            <span>{sortBy === 'price_low' ? 'Price: Low to High' : sortBy === 'price_high' ? 'Price: High to Low' : 'Sort By'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${sortBy !== 'featured' ? 'rotate-180' : ''}`} />
          </button>
          
          <button 
            onClick={() => setSortBy(prev => prev === 'rating' ? 'featured' : 'rating')}
            className={`border px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition
              ${sortBy === 'rating' ? 'bg-coral/10 border-coral text-coral' : 'bg-[#FAF8F5] border-panelBorder text-gray-700 hover:bg-gray-100'}`}
          >
            Customer Ratings
          </button>
          
          <button 
            onClick={() => { setShowDiscount(!showDiscount); setShowHotDeals(false); }}
            className={`border px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition
              ${showDiscount ? 'bg-coral/10 border-coral text-coral' : 'bg-[#FAF8F5] border-panelBorder text-gray-700 hover:bg-gray-100'}`}
          >
            Discounted Items
          </button>
          
          <button 
            onClick={() => { setShowHotDeals(!showHotDeals); setShowDiscount(false); }}
            className={`border px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition flex items-center gap-1
              ${showHotDeals ? 'bg-coral text-white border-coral' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
          >
            <Zap className="w-3.5 h-3.5" /> Hot Deals (50%+ Off)
          </button>
        </div>
      </section>

      {/* 4. Live Marketplace Section */}
      <section id="marketplace" className="py-12 border-b border-panelBorder/30">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-sm border border-emerald-200">
                assured
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">FASHION & LIFESTYLE</span>
              <span className="mx-2 text-gray-300">|</span>
              <Zap className="w-3.5 h-3.5 text-coral fill-coral/10" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">LIVE INVENTORY • LOCAL STOCKS</span>
            </div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight font-jakarta flex items-center gap-3">
              Top Picks For You
              <span className="text-sm bg-coral text-white px-2 py-1 rounded shadow-sm animate-pulse font-bold">HOT DEALS</span>
            </h2>
            <p className="text-gray-500 text-xs mt-1">Ready-to-ship boutique garments near you. Instant calibration match.</p>
          </div>
        </div>

        {/* Bento grid marketplace */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pt-2">
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

      {/* 5. Feature cards */}
      <section className="py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-[20px] border border-panelBorder/50 p-6 space-y-3 flex items-start gap-4 hover:border-[#C5A880]/20 transition-colors bg-white">
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#C5A880]/30 text-[#C5A880]">
            <Box className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-gray-900">Zero-Inventory Architecture</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Connecting you directly to live local inventory in verified boutique stores nearby. Zero latency shipping.</p>
          </div>
        </div>

        <div className="glass-card rounded-[20px] border border-panelBorder/50 p-6 space-y-3 flex items-start gap-4 hover:border-[#C5A880]/20 transition-colors bg-white">
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#C5A880]/30 text-[#C5A880]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-gray-900">Hyper-Accurate Fit Calibration</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Smart sizing AI calculates exact mappings between Zara and local boutiques so it fits you right, first try.</p>
          </div>
        </div>

        <div className="glass-card rounded-[20px] border border-panelBorder/50 p-6 space-y-3 flex items-start gap-4 hover:border-[#C5A880]/20 transition-colors bg-white">
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
