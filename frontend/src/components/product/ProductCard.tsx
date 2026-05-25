import React from 'react';
import { MapPin, Star, Zap, RotateCw } from 'lucide-react';
import type { Product, Size } from '../../types';
import { FitConfidenceBadge } from './FitConfidenceBadge';

import lavenderHoodie from '../../assets/lavender_hoodie.png';
import techwearJacket from '../../assets/techwear_jacket.png';
import knitSweater from '../../assets/knit_sweater.png';
import activewearShirt from '../../assets/activewear_shirt.png';

interface ProductCardProps {
  product: Product;
  selectedSize: Size | undefined;
  onSelectSize: (productId: string | number, size: Size) => void;
  onAddToCart: (product: Product) => void;
  onOpenSizingGuide: (product: Product) => void;
  onOpen360Viewer: (product: Product) => void;
}

export const getImageAsset = (id: string | number): string => {
  const s = String(id).toLowerCase();
  if (s === '1' || s.includes('hoodie')) return lavenderHoodie;
  if (s === '2' || s.includes('jacket')) return techwearJacket;
  if (s === '3' || s.includes('sweater')) return knitSweater;
  if (s === '4' || s.includes('shirt') || s.includes('tee')) return activewearShirt;
  return lavenderHoodie;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  selectedSize,
  onSelectSize,
  onAddToCart,
  onOpenSizingGuide,
  onOpen360Viewer
}) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      className="glass-card rounded-[20px] border border-panelBorder/40 hover:border-coral/20 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-300 group bg-white"
    >
      {/* Image Container with Luxury Ivory-Beige Photo Backdrop */}
      <div className="relative aspect-square w-full bg-[#FAF9F6] p-6 flex items-center justify-center overflow-hidden border-b border-panelBorder/30">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#C5A880]/5 to-transparent opacity-60 group-hover:scale-105 transition-transform duration-500"></div>
        
        <img
          src={getImageAsset(product.id)}
          alt={product.name}
          className="max-h-full max-w-full object-contain relative z-10 group-hover:scale-105 transition-transform duration-500 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)]"
        />

        {/* Interactive 360° Studio Trigger Button overlay */}
        <button
          onClick={() => onOpen360Viewer(product)}
          className="absolute inset-0 z-20 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
        >
          <div className="bg-white hover:bg-gray-55 text-gray-950 text-xs font-bold px-4 py-2.5 rounded-full border border-panelBorder flex items-center gap-1.5 shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <RotateCw className="w-3.5 h-3.5 text-gray-950 animate-spin-slow" />
            <span>360° View</span>
          </div>
        </button>

        {/* Boutique Location Context Badge */}
        <span className="absolute top-3 left-3 z-20 text-[9px] font-bold tracking-wide px-2 py-1 rounded-md bg-white/95 text-gray-800 border border-panelBorder/60 flex items-center gap-1 shadow-md">
          <MapPin className="w-2.5 h-2.5 text-coral" />
          <span>{product.boutique} ({product.distance} km)</span>
        </span>

        {/* Fit Confidence Badge */}
        <FitConfidenceBadge
          score={product.fitAccuracy}
          onClick={() => onOpenSizingGuide(product)}
        />
      </div>

      {/* Product Metadata & Controls */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-white">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#C5A880]">
              {product.category}
            </span>
            
            {/* Scarcity / Stock Alert */}
            {product.stock <= 2 ? (
              <span className="text-[9px] font-bold text-coral px-2 py-0.5 rounded bg-coral/5 border border-coral/10 animate-pulse flex items-center gap-1">
                Only {product.stock} left
              </span>
            ) : (
              <span className="text-[9px] font-bold text-[#10B981] px-2 py-0.5 rounded bg-[#10B981]/5 border border-[#10B981]/10 flex items-center gap-1">
                In Stock
              </span>
            )}
          </div>

          <h3 className="font-semibold text-sm text-gray-900 tracking-tight group-hover:text-coral transition-colors">
            {product.name}
          </h3>
          
          {/* Rating badge */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex items-center text-amber-450">
              <Star className="w-3 h-3 fill-current text-amber-400" />
              <span className="text-[10px] font-bold text-gray-800 ml-0.5">{product.rating}</span>
            </div>
            <span className="text-[9px] text-gray-500">({product.reviewsCount} reviews)</span>
          </div>
        </div>

        {/* Price, Sizes & CTA */}
        <div className="space-y-3.5 pt-1">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900 font-jakarta">
              ${product.price.toFixed(2)}
            </span>
            <button 
              type="button"
              className="text-[9px] text-gray-500 hover:text-coral transition-colors underline bg-transparent border-none cursor-pointer" 
              onClick={() => onOpenSizingGuide(product)}
            >
              Size Guide
            </button>
          </div>

          {/* Size picker container with wiggle ID */}
          <div className="space-y-1">
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Select Size</p>
            <div id={`size-select-${product.id}`} className="grid grid-cols-4 gap-1.5 transition-all">
              {(['S', 'M', 'L', 'XL'] as Size[]).map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => onSelectSize(product.id, size)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-coral border-coral text-white'
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
            disabled={isOutOfStock}
            className="w-full py-3 rounded-xl bg-coral disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-coral-hover text-white text-[11px] font-bold tracking-widest uppercase transition-all duration-300 active:scale-[0.98] shadow-md shadow-coral/5 hover:shadow-coral/15 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span>{isOutOfStock ? 'Sold Out' : 'Instant Delivery'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
