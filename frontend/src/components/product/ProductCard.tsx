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
  const totalStock = Object.values(product.stock || {}).reduce((acc: number, val: any) => acc + Number(val), 0);
  const isOutOfStock = totalStock <= 0;

  return (
    <div
      className="glass-card rounded-[20px] border border-panelBorder/40 hover:border-coral/20 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-300 group bg-white"
    >
      {/* Image Container with Luxury Ivory-Beige Photo Backdrop */}
      <div className="relative aspect-square w-full bg-[#FAF9F6] p-6 flex items-center justify-center overflow-hidden border-b border-panelBorder/30">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#C5A880]/5 to-transparent opacity-60 group-hover:scale-105 transition-transform duration-500"></div>
        
        <img
          src={product.image || getImageAsset(product.id)}
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

        {/* Wishlist Heart Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Assuming toggleWishlist is passed or handled via global state directly inside the card. Let's just mock the button click visually if state is not passed.
            // Actually, we can just use the global store here.
          }}
          className="absolute top-3 right-3 z-20 p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:scale-110 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
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
            {totalStock <= 2 && totalStock > 0 ? (
              <span className="text-[9px] font-bold text-coral px-2 py-0.5 rounded bg-coral/5 border border-coral/10 animate-pulse flex items-center gap-1">
                Only {totalStock} left
              </span>
            ) : totalStock > 2 ? (
              <span className="text-[9px] font-bold text-[#10B981] px-2 py-0.5 rounded bg-[#10B981]/5 border border-[#10B981]/10 flex items-center gap-1">
                In Stock
              </span>
            ) : null}
          </div>

          <h3 className="font-semibold text-sm text-gray-900 tracking-tight group-hover:text-coral transition-colors">
            {product.name}
          </h3>
          
          {/* Rating badge */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex items-center text-emerald-700 bg-emerald-100 px-1 rounded-sm">
              <span className="text-[10px] font-bold ml-0.5">{product.rating.average}</span>
              <Star className="w-2.5 h-2.5 fill-current ml-0.5" />
            </div>
            <span className="text-[10px] text-gray-500 font-medium">({product.rating.count})</span>
            <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="Assured" className="h-[14px] ml-auto" />
          </div>
        </div>

        {/* Price, Sizes & CTA */}
        <div className="space-y-3.5 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900 font-jakarta">
              ₹{product.price.selling_price}
            </span>
            <span className="text-xs text-gray-500 line-through">₹{product.price.mrp}</span>
            <span className="text-xs font-bold text-emerald-600">{product.price.discount_percent}% off</span>
            <button 
              type="button"
              className="text-[9px] text-gray-500 hover:text-coral transition-colors underline bg-transparent border-none cursor-pointer ml-auto" 
              onClick={() => onOpenSizingGuide(product)}
            >
              Size Guide
            </button>
          </div>

          {/* Size picker container with wiggle ID */}
          <div className="space-y-1">
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Select Size</p>
            <div id={`size-select-${product.id}`} className="grid grid-cols-4 gap-1.5 transition-all">
              {(product.sizes_available || ['S', 'M', 'L', 'XL'] as Size[]).map((size) => {
                const isSelected = selectedSize === size;
                const inStock = product.stock[size] > 0;
                return (
                  <button
                    key={size}
                    disabled={!inStock}
                    onClick={() => onSelectSize(product.id, size as Size)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-panelBorder text-gray-600 hover:text-gray-900 hover:border-blue-400'
                    } ${!inStock ? 'opacity-30 line-through cursor-not-allowed bg-gray-50' : ''}`}
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
