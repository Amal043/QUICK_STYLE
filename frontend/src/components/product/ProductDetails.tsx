import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { X, RotateCw, HelpCircle, Share2, Heart, Tag, Truck, ShieldCheck, ChevronRight, Check, ShoppingBag, MapPin, Zap } from 'lucide-react';
import type { Product } from '../../types';
import { useStore } from '../../store/useStore';

interface ProductDetailsProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  const { wishlist, toggleWishlist, userProfile } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [frameIndex, setFrameIndex] = useState(0);

  // Use frames_360 if available, else gallery, else fallback to main image
  const images = product.has_360 && product.frames_360.length > 0 
    ? product.frames_360 
    : product.gallery.length > 0 
      ? [product.image, ...product.gallery] 
      : [product.image];

  const hasMultipleFrames = images.length > 1;

  // Swipe logic for mini-carousel / 360 viewer
  const bind = useDrag(({ movement: [mx], down }) => {
    if (down && hasMultipleFrames) {
      if (mx > 50) setFrameIndex((prev) => (prev - 1 + images.length) % images.length);
      else if (mx < -50) setFrameIndex((prev) => (prev + 1) % images.length);
    }
  });

  const isWished = wishlist.includes(product.id as string);
  const deliveryPincode = userProfile?.addresses?.find((a: any) => a.isDefault)?.pincode || "700032";

  const handleAddToCart = () => {
    if (selectedSize) {
      onAddToCart(product, selectedSize as any);
      onClose();
    }
  };

  const isOutOfStock = Object.values(product.stock).reduce((sum, val) => sum + val, 0) === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal Container - Flipkart style large modal */}
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl bg-[#f1f3f6] rounded-none sm:rounded-2xl overflow-y-auto relative z-10 flex flex-col md:flex-row shadow-2xl"
      >
        {/* Left Side: Image Gallery & 360 Viewer */}
        <div className="w-full md:w-[40%] bg-white p-4 relative flex flex-col border-r border-panelBorder/50 sticky top-0 md:h-auto h-[60vh]">
          <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow-md text-gray-500 md:hidden">
            <X className="w-5 h-5" />
          </button>

          <button onClick={() => toggleWishlist(product.id as string)} className="absolute top-4 right-14 md:right-4 z-20 p-2 bg-white rounded-full shadow-sm border border-gray-100 group">
            <Heart className={`w-6 h-6 transition-transform group-hover:scale-110 ${isWished ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>

          <div {...(bind() as any)} className="flex-1 flex flex-col items-center justify-center relative cursor-grab active:cursor-grabbing group select-none">
            {hasMultipleFrames && product.has_360 && (
              <div className="absolute top-2 left-2 z-20 text-[10px] bg-black/50 text-white px-2 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <RotateCw className="w-3 h-3" /> Drag to View 360°
              </div>
            )}
            
            <img
              src={images[frameIndex]}
              alt={product.name}
              className="max-h-[400px] object-contain transition-opacity duration-200 pointer-events-none"
            />
            
            {hasMultipleFrames && (
              <div className="flex gap-2 mt-4 absolute bottom-4">
                {images.map((_, idx) => (
                  <div key={idx} className={`w-2 h-2 rounded-full ${idx === frameIndex ? 'bg-blue-600' : 'bg-gray-300'}`} />
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4 px-2 hidden md:flex">
            <button 
              disabled={isOutOfStock || !selectedSize}
              onClick={handleAddToCart}
              className="flex-1 py-3 bg-[#ff9f00] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> {isOutOfStock ? 'SOLD OUT' : 'ADD TO CART'}
            </button>
            <button 
              disabled={isOutOfStock || !selectedSize}
              onClick={handleAddToCart}
              className="flex-1 py-3 bg-[#fb641b] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" /> BUY NOW
            </button>
          </div>
        </div>

        {/* Right Side: Product Details */}
        <div className="w-full md:w-[60%] flex flex-col bg-[#f1f3f6]">
          {/* Header & Price */}
          <div className="bg-white p-4 sm:p-6 mb-2">
            <p className="text-gray-500 text-sm font-semibold hover:text-blue-600 cursor-pointer">{product.brand}</p>
            <h1 className="text-lg text-gray-900 leading-snug mt-1">{product.description || product.name}</h1>
            
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-emerald-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                {product.rating.average} ★
              </span>
              <span className="text-gray-500 text-sm font-medium">{product.rating.count} Ratings & Reviews</span>
              <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="Assured" className="h-[21px] ml-2" />
            </div>

            <div className="flex items-end gap-3 mt-4">
              <span className="text-3xl font-bold text-gray-900">₹{product.price.selling_price}</span>
              <span className="text-gray-500 line-through text-sm mb-1">₹{product.price.mrp}</span>
              <span className="text-emerald-600 font-bold text-sm mb-1">{product.price.discount_percent}% off</span>
            </div>
          </div>

          {/* Sizing */}
          <div className="bg-white p-4 sm:p-6 mb-2">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-900">Size {selectedSize ? `- ${selectedSize}` : ''}</span>
              <span className="text-blue-600 font-semibold text-sm cursor-pointer">Size Chart</span>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {product.sizes_available.map(size => {
                const inStock = (product.stock[size] || 0) > 0;
                return (
                  <button
                    key={size}
                    disabled={!inStock}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-[48px] border-2 rounded flex items-center justify-center font-semibold transition-colors
                      ${selectedSize === size ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-800 hover:border-blue-400'}
                      ${!inStock ? 'opacity-40 bg-gray-50 border-gray-100 cursor-not-allowed line-through' : ''}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Offers */}
          <div className="bg-white p-4 sm:p-6 mb-2">
            <h3 className="font-semibold text-gray-900 mb-3">Available offers</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-800"><span className="font-bold">Bank Offer</span> 5% Cashback on Flipkart Axis Bank Card <span className="text-blue-600 font-semibold cursor-pointer">T&C</span></p>
              </div>
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-800"><span className="font-bold">Special Price</span> Get extra ₹29 off (price inclusive of cashback/coupon) <span className="text-blue-600 font-semibold cursor-pointer">T&C</span></p>
              </div>
            </div>
          </div>

          {/* Delivery & Service */}
          <div className="bg-white p-4 sm:p-6 mb-2">
            <div className="flex gap-4">
              <span className="text-gray-500 font-semibold text-sm w-20 shrink-0">Delivery</span>
              <div>
                <div className="flex items-center gap-2 border-b-2 border-blue-600 pb-1 mb-2 max-w-xs">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">{deliveryPincode}</span>
                  <span className="text-blue-600 text-sm font-semibold ml-auto cursor-pointer">Change</span>
                </div>
                <div className="flex items-start gap-2 mt-3 text-sm">
                  <Truck className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">Delivery in {product.delivery_eta} Minutes | <span className="text-emerald-600">Free</span> <span className="line-through text-gray-400 font-normal">₹40</span></p>
                    <p className="text-gray-500 mt-1">From: {product.boutique} ({product.distance} km away)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white p-4 sm:p-6 pb-20 md:pb-6">
            <div className="flex gap-4">
              <span className="text-gray-500 font-semibold text-sm w-20 shrink-0">Highlights</span>
              <ul className="list-disc pl-4 text-sm text-gray-800 space-y-1">
                <li>Gender: <span className="capitalize">{product.gender}</span></li>
                <li>Distance: {product.distance} km</li>
                <li>Brand verified local stock</li>
              </ul>
            </div>
            
            <div className="flex gap-4 mt-6">
              <span className="text-gray-500 font-semibold text-sm w-20 shrink-0">Seller</span>
              <div className="text-sm">
                <p className="text-blue-600 font-semibold cursor-pointer flex items-center gap-1">
                  {product.store_name} <span className="bg-blue-600 text-white rounded-full text-[10px] w-3 h-3 flex items-center justify-center font-bold">✓</span>
                </p>
                <div className="flex items-center gap-3 mt-2 text-gray-600">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Instant Local Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Mobile Bottom Bar */}
          <div className="fixed md:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex gap-2 z-30">
            <button 
              disabled={isOutOfStock || !selectedSize}
              onClick={handleAddToCart}
              className="flex-1 py-3 bg-white disabled:bg-gray-100 disabled:text-gray-400 text-gray-900 font-bold text-sm border border-gray-300"
            >
              {isOutOfStock ? 'SOLD OUT' : 'ADD TO CART'}
            </button>
            <button 
              disabled={isOutOfStock || !selectedSize}
              onClick={handleAddToCart}
              className="flex-1 py-3 bg-[#fb641b] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm"
            >
              BUY NOW
            </button>
          </div>

          {/* Close button for Desktop */}
          <button onClick={onClose} className="hidden md:flex absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-50">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
