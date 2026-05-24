import React from 'react';

interface CategoryQuickSelectProps {
  activeCategory: string;
  onSelectCategory: (category: 'All' | 'Streetwear' | 'Formals' | 'Activewear' | 'Loungewear') => void;
}

const categories: Array<'All' | 'Streetwear' | 'Formals' | 'Activewear' | 'Loungewear'> = [
  'All',
  'Streetwear',
  'Formals',
  'Activewear',
  'Loungewear'
];

export const CategoryQuickSelect: React.FC<CategoryQuickSelectProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-panelBorder">
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 active:scale-95 ${
              isActive
                ? 'bg-[#C5A880] border-[#C5A880] text-white shadow-lg shadow-[#C5A880]/20'
                : 'bg-lavender-deep/40 hover:bg-lavender-deep border-panelBorder text-gray-600 hover:text-gray-900'
            }`}
          >
            {cat === 'All' ? 'All Clothing' : cat}
          </button>
        );
      })}
    </div>
  );
};
