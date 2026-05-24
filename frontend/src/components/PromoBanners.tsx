import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// Import assets for banners
import purpleModel from '../assets/purple_fur_model.png';
import activewearShirt from '../assets/activewear_shirt.png';
import techwearJacket from '../assets/techwear_jacket.png';

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

export const PromoBanners: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = bannerSlides[currentSlide];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl min-h-[300px] sm:min-h-[260px] flex border border-panelBorder/30 shadow-xl bg-[#FAF8F5]">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -25 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full rounded-3xl bg-gradient-to-r ${slide.colorClass} border-none p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 relative`}
        >
          {/* Subtle Grid Lines Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none rounded-3xl"></div>

          {/* Left: Editorial content */}
          <div className="relative z-10 space-y-4 max-w-lg text-left">
            <span className="text-[10px] uppercase tracking-widest bg-white text-gray-800 px-3.5 py-1.5 rounded-md border border-panelBorder shadow-sm font-bold font-jakarta">
              {slide.brand}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight font-jakarta">
              {slide.title}
            </h2>
            <p className={`text-xs ${slide.textColor} font-normal leading-relaxed max-w-md`}>
              {slide.description}
            </p>

            <div className="pt-2 flex items-center gap-6">
              <a
                href="#marketplace"
                className="px-6 py-3 rounded-full bg-gray-950 hover:bg-gray-800 text-white text-xs font-bold transition-all duration-300 flex items-center gap-2 active:scale-95 shadow-md group"
              >
                <span>{slide.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
              </a>

              {/* Dot Indicators */}
              <div className="flex gap-2">
                {bannerSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? 'bg-gray-900 w-4' : 'bg-gray-900/30 hover:bg-gray-900/60'
                    }`}
                  ></button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Absolute luxury image placeholder */}
          <div className="relative md:absolute right-0 bottom-0 top-0 w-full md:w-[45%] h-[200px] md:h-full flex items-center justify-center md:justify-end pointer-events-none select-none z-0">
            {/* Blending Gradient Mask */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FAF8F5]/20 to-transparent z-10 hidden md:block"></div>
            <img
              src={slide.image}
              alt={slide.title}
              className="max-h-[90%] max-w-[90%] md:max-h-full md:max-w-none object-contain md:object-cover md:object-center translate-y-4 md:translate-y-0 scale-105 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-transform duration-[1000ms] hover:scale-110"
            />
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
};
