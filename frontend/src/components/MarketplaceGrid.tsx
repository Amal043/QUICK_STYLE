import React from 'react';
import { MapPin, Sparkles, Star, Zap, RotateCw, Clock } from 'lucide-react';
import type { Product, Size } from '../types';

interface MarketplaceGridProps {
  products: Product[];
  selectedSizes: { [productId: string]: Size };
  onSelectSize: (productId: string | number, size: Size) => void;
  onAddToCart: (product: Product) => void;
  onOpenSizingGuide: (product: Product) => void;
  onOpen360Viewer: (product: Product) => void;
}

export const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({
  products,
  selectedSizes,
  onSelectSize,
  onAddToCart,
  onOpenSizingGuide,
  onOpen360Viewer
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        const selectedSize = selectedSizes[product.id];
        
        // Calculate total stock
        const totalStock = Object.values(product.stock).reduce((sum, current) => sum + current, 0);
        const isOutOfStock = totalStock <= 0;

        return (
          <div
            key={product.id}
            className="glass-card rounded-[20px] border border-panelBorder/40 hover:border-coral/20 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-300 group"
          >
            {/* Image Container with Luxury Ivory-Beige Photo Backdrop */}
            <div className="relative aspect-square w-full bg-[#FAF9F6] flex items-center justify-center overflow-hidden border-b border-panelBorder/30">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#C5A880]/5 to-transparent opacity-60 group-hover:scale-105 transition-transform duration-500"></div>
              
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-500"
              />

              {/* Interactive 360° Studio Trigger Button overlay */}
              {product.has_360 && (
                <button
                  onClick={() => onOpen360Viewer(product)}
                  className="absolute inset-0 z-20 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                >
                  <div className="bg-white hover:bg-gray-50 text-gray-950 text-xs font-bold px-4 py-2.5 rounded-full border border-panelBorder flex items-center gap-1.5 shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <RotateCw className="w-3.5 h-3.5 text-gray-950 animate-spin-slow" />
                    <span>360° View</span>
                  </div>
                </button>
              )}

              {/* Swiggy Style Delivery ETA Badge */}
              <span className="absolute top-3 left-3 z-20 text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-lg bg-white shadow-md flex items-center gap-1 text-gray-900 border border-panelBorder/50">
                <Clock className="w-3 h-3 text-emerald" />
                <span>{product.delivery_eta} mins</span>
              </span>

              {/* Cross-Brand True Fit Indicator */}
              <span className="absolute bottom-3 right-3 z-20 text-[9px] font-bold px-2 py-1 rounded-md bg-white/95 text-[#C5A880] border border-[#E8E2D9] flex items-center gap-1 shadow-md">
                <Sparkles className="w-2.5 h-2.5 text-[#C5A880]" />
                <span>{product.fitAccuracy}% True Fit</span>
              </span>
            </div>

            {/* Product Metadata & Controls */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-white">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#C5A880]">
                    {product.brand}
                  </span>
                  
                  {/* Scarcity / Stock Alert */}
                  {totalStock <= 2 && totalStock > 0 ? (
                    <span className="text-[9px] font-bold text-coral px-2 py-0.5 rounded bg-coral/5 border border-coral/10 animate-pulse flex items-center gap-1">
                      Only {totalStock} left
                    </span>
                  ) : totalStock === 0 ? (
                    <span className="text-[9px] font-bold text-gray-500 px-2 py-0.5 rounded bg-gray-100 border border-gray-200 flex items-center gap-1">
                      Sold Out
                    </span>
                  ) : null}
                </div>

                <h3 className="font-semibold text-sm text-gray-900 tracking-tight group-hover:text-coral transition-colors line-clamp-2">
                  {product.name}
                </h3>
                
                {/* Rating badge & Distance */}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-amber-450">
                      <Star className="w-3 h-3 fill-current text-amber-400" />
                      <span className="text-[10px] font-bold text-gray-800 ml-0.5">{product.rating.average}</span>
                    </div>
                    <span className="text-[9px] text-gray-500">({product.rating.count})</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{product.distance} km</span>
                  </div>
                </div>
              </div>

              {/* Price, Sizes & CTA */}
              <div className="space-y-3.5 pt-1 border-t border-panelBorder/30">
                <div className="flex items-baseline justify-between pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900 font-jakarta">
                      ₹{product.price.selling_price}
                    </span>
                    {product.price.discount_percent > 0 && (
                      <span className="text-[10px] text-gray-400 line-through">
                        ₹{product.price.mrp}
                      </span>
                    )}
                  </div>
                  <button 
                    type="button"
                    className="text-[9px] text-gray-500 hover:text-coral transition-colors underline bg-transparent border-none cursor-pointer" 
                    onClick={() => onOpenSizingGuide(product)}
                  >
                    Size Guide
                  </button>
                </div>

                {/* Size picker */}
                <div className="space-y-1">
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Select Size</p>
                  <div id={`size-select-${product.id}`} className="flex flex-wrap gap-1.5 transition-all">
                    {product.sizes_available.map((size: any) => {
                      const isSelected = selectedSize === size;
                      const sizeStock = product.stock[size] || 0;
                      const isSizeOutOfStock = sizeStock === 0;

                      return (
                        <button
                          key={size}
                          disabled={isSizeOutOfStock}
                          onClick={() => onSelectSize(product.id, size)}
                          className={`py-1.5 px-3 text-[11px] font-bold rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-coral border-coral text-white'
                              : isSizeOutOfStock
                              ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed line-through'
                              : 'bg-white border-panelBorder text-gray-600 hover:text-gray-900 hover:border-coral/40'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={isOutOfStock || !selectedSize}
                  className="w-full py-3 rounded-xl bg-coral disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-coral-hover text-white text-[11px] font-bold tracking-widest uppercase transition-all duration-300 active:scale-[0.98] shadow-md shadow-coral/5 hover:shadow-coral/15 flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-white text-white" />
                  <span>
                    {isOutOfStock 
                      ? 'Sold Out' 
                      : !selectedSize 
                        ? 'Select a Size' 
                        : 'Instant Delivery'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
