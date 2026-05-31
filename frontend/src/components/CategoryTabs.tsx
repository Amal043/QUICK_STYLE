import React from 'react';
import { Shirt, Sparkles, Sofa, Activity, Briefcase } from 'lucide-react';

interface CategoryTabsProps {
  activeCategory: 'All' | 'Streetwear' | 'Formals' | 'Activewear' | 'Loungewear';
  onSelectCategory: (category: 'All' | 'Streetwear' | 'Formals' | 'Activewear' | 'Loungewear') => void;
}

const categoriesList = [
  { name: 'All' as const, label: 'All Fits', icon: Sparkles, glowClass: 'glow-gold text-[#C5A880] border-[#C5A880]' },
  { name: 'Streetwear' as const, label: 'Streetwear', icon: Shirt, glowClass: 'glow-pink text-rose-600 border-rose-300' },
  { name: 'Formals' as const, label: 'Formals', icon: Briefcase, glowClass: 'glow-blue text-blue-600 border-blue-300' },
  { name: 'Activewear' as const, label: 'Activewear', icon: Activity, glowClass: 'glow-green text-emerald-600 border-emerald-300' },
  { name: 'Loungewear' as const, label: 'Loungewear', icon: Sofa, glowClass: 'glow-orange text-amber-600 border-amber-300' },
];

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-none py-2">
      <div className="flex items-center gap-8 px-4 min-w-max justify-start md:justify-center">
        {categoriesList.map((cat) => {
          const isActive = activeCategory === cat.name;
          const Icon = cat.icon;
          return (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className="flex flex-col items-center gap-2.5 group cursor-pointer focus:outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isActive
                    ? 'ring-2 ring-[#C5A880] ring-offset-2 scale-105 shadow-lg ' + cat.glowClass
                    : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-600 hover:scale-105'
                }`}
              >
                <Icon className={`w-7 h-7 ${isActive ? 'scale-110' : 'group-hover:scale-110 text-stone-500'}`} />
              </div>
              <span
                className={`text-xs font-extrabold tracking-widest uppercase transition-colors ${
                  isActive ? 'text-[#C5A880]' : 'text-gray-500 group-hover:text-gray-900'
                }`}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
