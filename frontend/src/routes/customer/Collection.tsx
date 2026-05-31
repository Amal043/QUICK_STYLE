import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../queries/useProducts';
import { ProductCard } from '../../components/product/ProductCard';

export default function Collection() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parse initial filters from URL
  const initialCategory = searchParams.get('category') || '';
  const initialSizes = searchParams.get('sizes') ? searchParams.get('sizes')!.split(',') : [];
  const initialColors = searchParams.get('colors') ? searchParams.get('colors')!.split(',') : [];
  const initialMinDiscount = searchParams.get('min_discount') ? parseInt(searchParams.get('min_discount')!) : 0;
  const initialSortBy = searchParams.get('sort_by') || 'created_at';

  const [category, setCategory] = useState(initialCategory);
  const [sizes, setSizes] = useState<string[]>(initialSizes);
  const [colors, setColors] = useState<string[]>(initialColors);
  const [minDiscount, setMinDiscount] = useState<number>(initialMinDiscount);
  const [sortBy, setSortBy] = useState(initialSortBy);

  // Sync state back to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sizes.length > 0) params.set('sizes', sizes.join(','));
    if (colors.length > 0) params.set('colors', colors.join(','));
    if (minDiscount > 0) params.set('min_discount', minDiscount.toString());
    if (sortBy && sortBy !== 'created_at') params.set('sort_by', sortBy);
    
    setSearchParams(params, { replace: true });
  }, [category, sizes, colors, minDiscount, sortBy, setSearchParams]);

  // Fetch products with the current filter state
  const { data: products = [], isLoading } = useProducts(searchParams.toString());

  const toggleSize = (size: string) => {
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleColor = (color: string) => {
    setColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const handleDiscountChange = (val: number) => {
    setMinDiscount(prev => prev === val ? 0 : val); // toggle off if same
  };

  // Hardcoded filter options
  const categoryOptions = ["Atelier", "Runway", "Editorial", "Streetwear", "Activewear", "Formals", "Accessories"];
  const colorOptions = [
    { name: 'Vanta Black', hex: '#0a0a0a' },
    { name: 'Optic White', hex: '#FFFFFF' },
    { name: 'Charcoal Grey', hex: '#36454F' },
    { name: 'Midnight', hex: '#191970' },
    { name: 'Silver', hex: '#C0C0C0' }
  ];
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  const discountOptions = [10, 20, 30, 50];

  return (
    <div className="min-h-screen flex flex-col font-body-base text-body-base bg-background text-on-surface animate-fade-in">
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto px-4 md:px-margin-desktop py-8 md:py-16 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0 pr-8 border-r border-outline-variant/20 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display-md text-xl tracking-wider">FILTERS</h3>
            {(category || sizes.length > 0 || colors.length > 0 || minDiscount > 0) && (
              <button 
                onClick={() => { setCategory(''); setSizes([]); setColors([]); setMinDiscount(0); }}
                className="text-xs font-label-caps-xs uppercase text-error hover:text-error/80"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Category */}
          <div className="mb-10">
            <h4 className="font-body-bold text-body-bold mb-4 uppercase tracking-widest text-on-surface-variant">Category</h4>
            <ul className="space-y-3">
              {categoryOptions.map(cat => (
                <li key={cat}>
                  <label className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors">
                    <input 
                      type="radio"
                      name="category"
                      checked={category === cat}
                      onChange={() => setCategory(cat === category ? '' : cat)}
                      className="form-radio bg-transparent border-outline-variant text-primary focus:ring-0"
                    />
                    <span>{cat}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Color */}
          <div className="mb-10">
            <h4 className="font-body-bold text-body-bold mb-4 uppercase tracking-widest text-on-surface-variant">Color</h4>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map(col => {
                const isSelected = colors.includes(col.name);
                return (
                  <button 
                    key={col.name}
                    onClick={() => toggleColor(col.name)}
                    className={`w-8 h-8 rounded-full border transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background border-outline' : 'border-outline-variant hover:border-outline'}`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                );
              })}
            </div>
          </div>

          {/* Size */}
          <div className="mb-10">
            <h4 className="font-body-bold text-body-bold mb-4 uppercase tracking-widest text-on-surface-variant">Size</h4>
            <div className="grid grid-cols-3 gap-2">
              {sizeOptions.map(sz => {
                const isSelected = sizes.includes(sz);
                return (
                  <button 
                    key={sz}
                    onClick={() => toggleSize(sz)}
                    className={`py-2 border text-center transition-colors ${isSelected ? 'border-primary bg-primary text-on-primary font-bold' : 'border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary'}`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discount */}
          <div className="mb-10">
            <h4 className="font-body-bold text-body-bold mb-4 uppercase tracking-widest text-on-surface-variant">Discounts</h4>
            <ul className="space-y-3">
              {discountOptions.map(discount => (
                <li key={discount}>
                  <label className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors text-error">
                    <input 
                      type="radio"
                      name="discount"
                      checked={minDiscount === discount}
                      onChange={() => handleDiscountChange(discount)}
                      className="form-radio bg-transparent border-error text-error focus:ring-0"
                    />
                    <span>{discount}% or more</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Header & Sort */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="font-display-lg text-4xl mb-2">Editorial Collection</h1>
              <p className="text-on-surface-variant text-sm">Showing {products.length} refined pieces.</p>
            </div>
            
            <div className="flex items-center gap-3 self-end md:self-auto">
              <span className="text-sm text-on-surface-variant uppercase tracking-widest">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-b border-outline-variant py-2 pr-8 text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none uppercase text-sm tracking-wider"
              >
                <option value="created_at" className="bg-surface">Newest Arrivals</option>
                <option value="price" className="bg-surface">Price: Low to High</option>
                <option value="price_desc" className="bg-surface">Price: High to Low</option>
                <option value="rating" className="bg-surface">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selectedSize={undefined}
                  onSelectSize={() => {}}
                  onAddToCart={() => {}}
                  onOpenSizingGuide={() => {}}
                  onOpen360Viewer={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-outline-variant/30 rounded-2xl">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
              <h2 className="font-display-md text-2xl mb-2">No pieces found</h2>
              <p className="text-on-surface-variant max-w-md mx-auto">Try adjusting your filters or search criteria to explore other parts of the collection.</p>
              <button onClick={() => { setCategory(''); setSizes([]); setColors([]); setMinDiscount(0); }} className="mt-6 border border-outline hover:border-primary px-6 py-2 text-sm uppercase tracking-widest transition-colors">
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
