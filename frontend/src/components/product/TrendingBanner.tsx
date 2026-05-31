import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// Import assets for banners
import purpleModel from '../../assets/purple_fur_model.png';
import activewearShirt from '../../assets/activewear_shirt.png';
import techwearJacket from '../../assets/techwear_jacket.png';

interface BannerSlide {
  id: number;
  brand: string;
  title: string;
  description: string;
  actionText: string;
  image: string;
  colorClass: string;
  textColor: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    brand: "QUICK_STYLE LUXE",
    title: "Cozy Velvet & Street Couture",
    description: "Vibrant local boutique catalogs, real-time AI styling assistance, and quick scooter delivery. Try our AI fit matchmaking tool now!",
    actionText: "Explore Luxe",
    image: purpleModel,
    colorClass: "from-[#F6F1EA] via-[#FAF8F5] to-[#FAF8F5] border-[#E8E2D9]/40",
    textColor: "text-amber-950"
  },
  {
    id: 2,
    brand: "AERO-KNIT SPORT",
    title: "Power Your Movement",
    description: "Up to 30% Off on high-performance athletic tees in electric coral. Calibrated fit matching and instant delivery.",
    actionText: "Shop Activewear",
    image: activewearShirt,
    colorClass: "from-[#FAF0EE] via-[#FAF8F5] to-[#FAF8F5] border-[#E8E2D9]/40",
    textColor: "text-red-950"
  },
  {
    id: 3,
    brand: "VANGUARD LABS",
    title: "Waterproof Obsidian Techwear",
    description: "Built for the elements. Connect directly to live boutique stock and receive delivery in under 12 mins.",
    actionText: "Shop Techwear",
    image: techwearJacket,
    colorClass: "from-[#EDF4F5] via-[#FAF8F5] to-[#FAF8F5] border-[#E8E2D9]/40",
    textColor: "text-teal-950"
  }
];

export const TrendingBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = bannerSlides[currentSlide];

  return (
    <div className="full-bleed relative h-[500px] md:h-[600px] overflow-hidden bg-stone-100 border-none shadow-none -mt-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute inset-0 w-full h-full bg-gradient-to-r ${slide.colorClass} border-none p-0 flex items-center justify-between`}
        >
          {/* Background image for slide 1 (Cozy Velvet), or standard gradient layout for slides 2/3 */}
          {slide.id === 1 ? (
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-95 select-none z-0"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-end pointer-events-none select-none z-0 overflow-hidden">
              <img
                src={slide.image}
                alt={slide.title}
                className="max-h-[85%] md:max-h-[90%] object-contain scale-110 md:translate-x-[-10%] translate-y-4 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)]"
              />
            </div>
          )}

          {/* Minimalist Dark Gradient overlay (only on slide 1 to make text pop, or all slides if text is white) */}
          {slide.id === 1 && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 md:bg-gradient-to-r md:from-black/70 md:via-transparent md:to-transparent z-10"></div>
          )}

          {/* Bottom-left: Soft glassmorphism text overlay */}
          <div className={`absolute bottom-8 left-8 md:bottom-16 md:left-16 z-20 p-6 md:p-8 rounded-[24px] max-w-sm md:max-w-md text-left space-y-4 border shadow-2xl backdrop-blur-luxe ${
            slide.id === 1 
              ? 'bg-black/35 border-white/10 text-white' 
              : 'bg-white/70 border-white/40 text-gray-900'
          }`}>
            <span className={`text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 rounded-lg font-extrabold border inline-block ${
              slide.id === 1 ? 'bg-white/10 border-white/20 text-[#C5A880]' : 'bg-gray-950/5 border-gray-950/10 text-gray-800'
            }`}>
              {slide.brand}
            </span>
            <h2 className={`text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight font-jakarta ${
              slide.id === 1 ? 'text-white' : 'text-gray-900'
            }`}>
              {slide.title}
            </h2>
            <p className={`text-xs leading-relaxed max-w-xs font-normal ${
              slide.id === 1 ? 'text-stone-300' : 'text-gray-600'
            }`}>
              {slide.description}
            </p>

            <div className="pt-2 flex items-center gap-6">
              <a
                href="#marketplace"
                className={`px-6 py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 active:scale-95 shadow-md group cursor-pointer ${
                  slide.id === 1 
                    ? 'bg-[#C5A880] hover:bg-[#C5A880]/90 text-white' 
                    : 'bg-gray-950 hover:bg-gray-800 text-white'
                }`}
              >
                <span>{slide.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
              </a>

              {/* Dot Indicators */}
              <div className="flex gap-1.5">
                {bannerSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentSlide(idx);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentSlide === idx 
                        ? (slide.id === 1 ? 'bg-white w-4' : 'bg-gray-900 w-4') 
                        : (slide.id === 1 ? 'bg-white/30 hover:bg-white/60' : 'bg-gray-900/30 hover:bg-gray-900/60')
                    }`}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
export default TrendingBanner;
