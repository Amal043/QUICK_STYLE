import React from 'react';
import { motion } from 'framer-motion';

interface CategoryTabsProps {
  activeCategory: 'All' | 'Streetwear' | 'Formals' | 'Activewear' | 'Loungewear';
  onSelectCategory: (category: 'All' | 'Streetwear' | 'Formals' | 'Activewear' | 'Loungewear') => void;
}

const categories: Array<'All' | 'Streetwear' | 'Formals' | 'Activewear' | 'Loungewear'> = [
  'All',
  'Streetwear',
  'Formals',
  'Activewear',
  'Loungewear'
];

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  return (
    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-lavender-deep/60 border border-panelBorder/60 overflow-x-auto scrollbar-none">
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className="relative px-5 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 focus:outline-none whitespace-nowrap"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isActive && (
              <motion.div
                layoutId="active-category-pill"
                className="absolute inset-0 bg-[#C5A880] rounded-xl shadow-lg shadow-[#C5A880]/25"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              {cat === 'All' ? 'All Clothing' : cat}
            </span>
          </button>
        );
      })}
    </div>
  );
};
