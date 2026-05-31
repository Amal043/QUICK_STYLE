import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CategoryItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link: string;
}

interface CategorySliderProps {
  items: CategoryItem[];
}

export const CategorySlider: React.FC<CategorySliderProps> = ({ items }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (!isHovered && scrollRef.current) {
      intervalId = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          // Calculate max scroll
          const maxScroll = scrollWidth - clientWidth;
          
          if (scrollLeft >= maxScroll - 10) {
            // Reset to beginning if near end
            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            // Scroll by roughly one item width (assume ~250px)
            scrollRef.current.scrollBy({ left: 250, behavior: 'smooth' });
          }
        }
      }, 2000); // User requested 2 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isHovered]);

  return (
    <div 
      className="w-full overflow-hidden py-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-margin-mobile md:px-margin-desktop py-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => navigate(item.link)}
            className="relative shrink-0 w-[200px] md:w-[250px] aspect-[4/5] rounded-xl overflow-hidden cursor-pointer snap-start group shadow-md border border-outline-variant/10"
          >
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col items-center justify-end text-center z-10">
              <h3 className="font-display-md text-white text-lg md:text-xl font-bold tracking-wider drop-shadow-md">{item.title}</h3>
              <p className="font-body-base text-white/90 text-sm mt-1">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
