import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useProducts } from '../../queries/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import type { Product } from '../../types';
import { CategorySlider } from '../../components/CategorySlider';

interface HomeProps {
  onOpenSizingGuide: (product: Product) => void;
}

export default function Home({ onOpenSizingGuide }: HomeProps) {
  const navigate = useNavigate();
  const { data: queryProducts } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isPopupExpanded, setIsPopupExpanded] = useState(false);

  const heroImages = []; // No longer needed as we use the video

  const fashionLoopImages = [
    '/stitch/fashion_video_1.png',
    '/stitch/fashion_video_2.png',
    '/stitch/fashion_video_3.png',
    '/stitch/fashion_video_4.png'
  ];

  const [activeLoopIdx, setActiveLoopIdx] = useState(0);

  const categoryItems = [
    { id: '1', title: 'Must-Have Tees', subtitle: 'UNDER ₹ 499', image: '/photos/blazer_formal/main.png', link: '/collection?category=Streetwear' },
    { id: '2', title: 'Cool T-Shirts', subtitle: 'UNDER ₹ 399', image: '/photos/cool_tshirt.png', link: '/collection?category=Activewear' },
    { id: '3', title: 'Tailored Trousers', subtitle: 'UNDER ₹ 599', image: '/photos/tailored_trousers.png', link: '/collection?category=Editorial' },
    { id: '4', title: 'Charming Dresses', subtitle: 'UNDER ₹ 499', image: '/photos/charming_dress.png', link: '/collection?category=Streetwear' },
    { id: '5', title: 'Suits & Blazers', subtitle: 'UNDER ₹ 2999', image: '/photos/blazer_formal/main.png', link: '/collection?category=Formals' },
    { id: '6', title: 'Hottest Handbags', subtitle: 'UNDER ₹ 1599', image: '/stitch/minaudiere.jpg', link: '/collection?category=Accessories' },
    { id: '7', title: 'Formal Footwear', subtitle: 'STARTING ₹ 799', image: '/stitch/noir_stiletto.jpg', link: '/collection?category=Runway' },
  ];

  useEffect(() => {
    if (queryProducts) {
      setProducts(queryProducts);
    }
  }, [queryProducts]);

  useEffect(() => {
    // Video doesn't need interval state
  }, []);

  useEffect(() => {
    const loopInterval = setInterval(() => {
      setActiveLoopIdx((prev) => (prev + 1) % fashionLoopImages.length);
    }, 3000); // 3 seconds per frame for the circulating animation
    return () => clearInterval(loopInterval);
  }, [fashionLoopImages.length]);

  useEffect(() => {
    const popupInterval = setInterval(() => {
      setIsPopupExpanded(true);
      setTimeout(() => setIsPopupExpanded(false), 5000); // Collapse after 5 seconds
    }, 15000); // Expand every 15 seconds
    
    return () => clearInterval(popupInterval);
  }, []);

  return (
    <>
      <div className="space-y-0 animate-fade-in pb-24 relative">
        {/* Hero Section */}
      <section className="relative min-h-[921px] flex flex-col md:flex-row px-margin-mobile md:px-margin-desktop py-section-py-md gap-gutter items-center overflow-hidden" id="hero-section">
        <div className="cinematic-canvas bg-black" id="fashion-film-container">
           <video 
             src="/videos/hero-animation.mp4"
             className="w-full h-full object-cover opacity-[0.55]"
             autoPlay
             loop
             muted
             playsInline
           />
        </div>
        <div className="light-leaks"></div>
        <div className="film-grain"></div>
        <div className="vignette"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent z-10 pointer-events-none"></div>

        <div className="w-full md:w-1/3 flex flex-col justify-center stagger-1 z-20 relative">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4 tracking-widest drop-shadow-md">Avant-Garde</p>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6 drop-shadow-lg">THE NOIR<br />COLLECTION</h1>
          <p className="font-body-base text-body-base text-on-surface-variant max-w-sm mb-8 drop-shadow-md">
            At Zevana, we craft garments that move with grace and speak with style. From timeless classics to modern silhouettes.
          </p>
          <button 
            onClick={() => navigate('/collection')}
            className="bg-on-surface text-surface font-label-caps text-label-caps uppercase px-8 py-4 w-fit flex items-center gap-2 hover:bg-primary hover:scale-105 hover:shadow-[0_0_20px_rgba(198,198,198,0.3)] transition-all duration-300 group"
          >
            Explore Collection
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
        
        <div className="w-full md:w-2/3 h-[614px] md:h-[819px] relative flex justify-end items-center z-20 pointer-events-none pb-12 md:pb-0 pr-0 md:pr-24">
        </div>
        
        <div className="hidden md:flex w-1/12 flex-col justify-end items-end h-full stagger-3 absolute right-margin-desktop bottom-section-py-md z-20 pointer-events-none">
          <p className="font-display-md text-display-md text-outline-variant/40 vertical-writing-rl rotate-180 select-none tracking-widest drop-shadow-md">
            AUTUMN / WINTER
          </p>
        </div>
      </section>

      {/* Promotional Banners & Fashion Loop Section */}
      <section className="px-margin-mobile md:px-margin-desktop py-section-py-md bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Promos */}
          <div className="flex flex-col gap-4">
            {/* Promo 1: Flat 500 Off */}
            <div 
              onClick={() => navigate('/collection?min_discount=50')}
              className="w-full bg-gradient-to-br from-surface-container-low to-surface-container-lowest border border-tertiary/20 rounded-2xl p-8 flex flex-col justify-center items-center text-center cursor-pointer shadow-xl transition-all duration-500 hover:scale-[1.01] hover:border-tertiary/40 hover:shadow-[0_0_30px_rgba(224,194,152,0.08)] group"
            >
              <span className="font-label-caps text-tertiary text-[10px] tracking-[0.25em] mb-3 opacity-90 transition-all group-hover:tracking-[0.3em]">ATELIER PRIVILEGE</span>
              <h3 className="font-display-lg text-white text-3xl md:text-4xl font-normal tracking-wide drop-shadow-md">
                FLAT <span className="text-tertiary">₹500</span> OFF
              </h3>
              <p className="font-body-base text-on-surface-variant/80 text-xs md:text-sm mt-3 tracking-wider font-light">
                Applied automatically on your first boutique purchase
              </p>
            </div>
            
            {/* Promo 2: Sale is Live */}
            <div 
              onClick={() => navigate('/collection?min_discount=50')}
              className="w-full relative overflow-hidden rounded-2xl h-[216px] cursor-pointer shadow-xl transition-all duration-500 hover:scale-[1.01] border border-outline-variant/30 group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10"></div>
              <img 
                src="/stitch/fashion_video_4.png" 
                alt="Sale is Live" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[1200ms] ease-out" 
              />
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
                <span className="font-label-caps text-tertiary text-[10px] tracking-[0.25em] mb-1 opacity-90">THE APEX EVENT</span>
                <h3 className="font-display-lg text-white text-2xl md:text-3xl font-normal tracking-wide">
                  SEASONAL SALE IS <span className="text-tertiary italic font-display-md">LIVE</span>
                </h3>
                <p className="font-body-base text-white/60 text-xs mt-2 max-w-md font-light tracking-wide">
                  Exclusive access to archive styles and bespoke tailoring up to 50% off
                </p>
              </div>
            </div>
          </div>
          
          {/* Fashion Loop (Images Restored) */}
          <div className="w-full h-full min-h-[400px] relative rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/20">
            {fashionLoopImages.map((src, index) => (
              <div 
                key={src}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === activeLoopIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img src={src} className="w-full h-full object-cover" alt="Fashion Editorial Loop" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-6 left-6 z-20">
                  <p className="font-label-caps text-white text-sm tracking-widest opacity-80 mb-1">A W E 2 6</p>
                  <p className="font-display-md text-white text-2xl drop-shadow-md">The New Standard</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Sliders */}
        <div className="mt-16">
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-display-md text-display-md text-on-surface">Explore Categories</h2>
          </div>
          <CategorySlider items={categoryItems} />
        </div>
      </section>

      {/* Trending Now */}
      <section id="trending-now" className="px-margin-mobile md:px-margin-desktop py-section-py-lg">
        <div className="flex justify-between items-end mb-12 stagger-1">
          <div>
            <h2 className="font-display-md text-display-md text-on-surface">Trending Now</h2>
            <p className="font-body-base text-body-base text-on-surface-variant mt-2">Curated selections from the Atelier.</p>
          </div>
          <button 
            onClick={() => navigate('/collection')}
            className="hidden md:flex items-center gap-2 font-label-caps text-label-caps text-on-surface uppercase hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1 cursor-pointer"
          >
            View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selectedSize={undefined} // Handled in details modal now
              onSelectSize={() => {}}
              onAddToCart={() => {}}
              onOpenSizingGuide={() => {}}
              onOpen360Viewer={() => {}}
            />
          ))}
        </div>
      </section>
    </div>

    {/* Expanding Side Popup (Fixed correctly outside animated wrapper) */}
    <div 
      className={`fixed top-1/2 right-0 -translate-y-1/2 z-[100] flex items-center bg-error text-surface shadow-xl rounded-l-full cursor-pointer transition-all duration-500 overflow-hidden border border-r-0 border-outline-variant/30 ${
        isPopupExpanded ? 'w-[240px] px-6 py-4' : 'w-[56px] h-[56px] justify-center hover:w-[240px] hover:px-6'
      }`}
      onMouseEnter={() => setIsPopupExpanded(true)}
      onMouseLeave={() => setIsPopupExpanded(false)}
      onClick={() => navigate('/collection?min_discount=50')}
    >
      <span className="material-symbols-outlined text-2xl flex-shrink-0 animate-pulse">
        local_fire_department
      </span>
      <div className={`ml-3 flex flex-col whitespace-nowrap transition-opacity duration-300 ${isPopupExpanded ? 'opacity-100' : 'opacity-0 hidden group-hover:block'}`}>
        <span className="font-label-caps text-label-caps uppercase tracking-wider">Flash Sale</span>
        <span className="font-body-base text-xs opacity-90">Up to 50% Off</span>
      </div>
    </div>
  </>
  );
}
