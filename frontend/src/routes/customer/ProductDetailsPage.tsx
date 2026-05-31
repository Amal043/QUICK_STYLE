import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '../../components/product/ProductCard';
import type { Product, Size } from '../../types';
import { fetchProducts, mapProduct } from '../../queries/useProducts';

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, userProfile, addToCart, setCartOpen } = useStore();
  const [selectedSize, setSelectedSize] = useState<Size | ''>('');

  // Fetch current product
  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/products/${id}`);
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      return mapProduct(data);
    },
    enabled: !!id
  });

  // Fetch similar products (same category)
  const { data: similarProducts = [] } = useQuery<Product[]>({
    queryKey: ['similarProducts', product?.category],
    queryFn: async () => {
      const products = await fetchProducts(`category=${product?.category}&limit=5`);
      return products.filter(p => p.id !== id).slice(0, 4);
    },
    enabled: !!product?.category
  });

  // Fetch complete the look (accessories)
  const { data: completeTheLook = [] } = useQuery<Product[]>({
    queryKey: ['completeTheLook', 'Accessories'],
    queryFn: async () => {
      const products = await fetchProducts('category=Accessories&limit=4');
      return products.filter(p => p.id !== id).slice(0, 4);
    }
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span></div>;
  if (isError || !product) return <div className="min-h-screen flex items-center justify-center flex-col gap-4"><h2>Product Not Found</h2><button onClick={() => navigate('/collection')} className="underline">Back to Collection</button></div>;

  const images = product.gallery.length > 0 ? [product.image, ...product.gallery] : [product.image];
  const mainImage = images[0];
  const sideImages = images.slice(1, 3);

  const isWished = wishlist.includes(product.id as string);
  const isOutOfStock = Object.values(product.stock).reduce((sum, val) => sum + val, 0) === 0;

  const handleAddToCart = () => {
    if (selectedSize) {
      addToCart(product, selectedSize as any);
      setCartOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in pb-24">
      {/* Product Top Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-margin-desktop py-8 md:py-16">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm uppercase tracking-widest text-on-surface-variant hover:text-on-surface mb-8 transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left: Hero Imagery (7 columns) */}
          <div className="col-span-1 lg:col-span-7 flex flex-col gap-unit">
            <div className="w-full aspect-[3/4] bg-surface-container-lowest relative overflow-hidden group rounded-xl">
              <img 
                alt={product.name} 
                className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-[1200ms] ease-out" 
                src={mainImage}
              />
              <div className="absolute bottom-6 left-6 bg-surface/40 backdrop-blur-xl border border-outline-variant/30 px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg">
                <p className="font-label-caps-xs text-label-caps-xs text-on-surface-variant mb-1">AI GENERATED ASSET</p>
                <p className="font-body-base text-xs text-on-surface">Category: {product.category}</p>
              </div>
            </div>
            
            {sideImages.length > 0 && (
              <div className="grid grid-cols-2 gap-unit">
                {sideImages.map((img, idx) => (
                  <div key={idx} className="aspect-[3/4] bg-surface-container-lowest overflow-hidden rounded-xl">
                    <img 
                      alt={`${product.name} detail ${idx + 1}`} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                      src={img}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details (5 columns) */}
          <div className="col-span-1 lg:col-span-5 lg:pl-8 flex flex-col pt-8 lg:pt-0 lg:sticky lg:top-24 h-fit">
            <div className="flex justify-between items-start mb-6 border-b border-outline-variant/20 pb-8">
              <div>
                <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-3xl text-on-surface mb-2">{product.name}</h1>
                <p className="font-body-base text-body-base text-on-surface-variant">{product.brand} - {product.category}</p>
              </div>
              <button onClick={() => toggleWishlist(product.id as string)} className="p-2 hover:bg-surface-container-low rounded-full transition-colors group">
                <Heart className={`w-6 h-6 transition-transform group-hover:scale-110 ${isWished ? 'fill-primary text-primary' : 'text-on-surface'}`} />
              </button>
            </div>

            <div className="mb-10">
              <div className="flex items-end gap-3 mb-4">
                <p className="font-headline-md text-headline-md text-on-surface">₹{product.price.selling_price}</p>
                {product.price.discount_percent > 0 && (
                   <>
                     <span className="text-on-surface-variant line-through text-sm mb-1">₹{product.price.mrp}</span>
                     <span className="text-emerald-500 font-bold text-sm mb-1">{product.price.discount_percent}% off</span>
                   </>
                )}
              </div>
              
              <p className="font-body-base text-sm text-on-surface-variant leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Variations */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <p className="font-label-caps text-label-caps text-on-surface mb-3 flex items-center justify-between">
                  <span>COLOR: <span className="text-on-surface-variant ml-2">{product.colors[0].name}</span></span>
                </p>
                <div className="flex gap-3">
                  {product.colors.map((c, i) => (
                    <button key={i} aria-label={`Select ${c.name}`} className="w-8 h-8 rounded-full border border-on-surface ring-2 ring-background ring-offset-1 ring-offset-on-surface focus:outline-none" style={{ backgroundColor: c.hex }}></button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-10">
              <div className="flex justify-between items-end mb-3">
                <p className="font-label-caps text-label-caps text-on-surface">SELECT SIZE</p>
                <button className="font-label-caps-xs text-label-caps-xs text-on-surface-variant hover:text-on-surface underline transition-colors">SIZE GUIDE</button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes_available.map(size => {
                  const inStock = (product.stock[size] || 0) > 0;
                  return (
                    <button
                      key={size}
                      disabled={!inStock}
                      onClick={() => setSelectedSize(size as Size)}
                      className={`py-3 border font-body-base text-sm transition-all focus:outline-none 
                        ${selectedSize === size 
                          ? 'border-on-surface bg-surface-container-high text-on-surface' 
                          : 'border-outline-variant text-on-surface-variant hover:border-on-surface hover:text-on-surface'
                        }
                        ${!inStock ? 'opacity-40 bg-surface-container-lowest cursor-not-allowed line-through' : ''}
                      `}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery info (Lux Noir styled) */}
            <div className="mb-8 bg-surface-container p-4 rounded-xl border border-outline-variant/20">
              <div className="flex gap-4">
                <div className="text-sm">
                  <p className="text-primary font-semibold flex items-center gap-1">
                    {product.store_name} <span className="bg-primary text-background rounded-full text-[10px] w-3 h-3 flex items-center justify-center font-bold">✓</span>
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-on-surface-variant">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-primary" /> Authentic Local Stock</span>
                  </div>
                  <div className="flex items-start gap-2 mt-3 text-sm">
                    <Truck className="w-4 h-4 text-on-surface shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-on-surface">Delivery in {product.delivery_eta || 45} Minutes | <span className="text-primary">Free</span></p>
                      <p className="text-on-surface-variant mt-1">From: {product.store_name} ({product.distance || 2} km away)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-4 mb-12">
              <button 
                disabled={isOutOfStock || !selectedSize}
                onClick={handleAddToCart}
                className="w-full h-[52px] bg-on-surface text-background font-body-bold text-body-bold hover:bg-surface-tint transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOutOfStock ? 'SOLD OUT' : (selectedSize ? 'ADD TO BAG' : 'SELECT SIZE')}
                <span className="material-symbols-outlined text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Complete the Look Section */}
      {completeTheLook.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-margin-desktop py-12 border-t border-outline-variant/20 mt-8">
          <div className="flex justify-between items-end mb-10">
            <h2 className="font-display-md text-2xl text-on-surface">Complete The Look</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {completeTheLook.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-margin-desktop py-12 border-t border-outline-variant/20">
          <div className="flex justify-between items-end mb-10">
            <h2 className="font-display-md text-2xl text-on-surface">Similar Pieces</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
