import React, { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Duplicate items exactly twice to allow seamless infinite looping with translation(-50%)
  const marqueeItems = [...items, ...items];

  return (
    <div 
      className="w-full overflow-hidden py-8 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Premium edge fading gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

      <div 
        className="flex gap-4 w-max animate-marquee_20s_linear_infinite px-4 py-4"
        style={{ 
          animationPlayState: isHovered ? 'paused' : 'running',
        }}
      >
        {marqueeItems.map((item, index) => (
          <div 
            key={`${item.id}-${index}`}
            onClick={() => navigate(item.link)}
            className="relative shrink-0 w-[200px] md:w-[250px] aspect-[4/5] rounded-xl overflow-hidden cursor-pointer group/card shadow-lg border border-outline-variant/10 transition-transform duration-500 hover:scale-[1.03]"
          >
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
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
