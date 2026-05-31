import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product, Size } from '../../types';

interface ProductCardProps {
  product: Product;
  selectedSize?: Size;
  onSelectSize?: (productId: string | number, size: Size) => void;
  onAddToCart?: (product: Product) => void;
  onOpenSizingGuide?: (product: Product) => void;
  onOpen360Viewer?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product
}) => {
  const navigate = useNavigate();
  return (
    <div className="group cursor-pointer stagger-2" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="relative aspect-[3/4] bg-surface-container-low rounded-xl overflow-hidden hover-img-container mb-4">
        {/* Main image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* We reuse the image for the secondary hover effect if another isn't available */}
        <img
          src={product.image}
          alt={`${product.name} side`}
          className="secondary-img"
        />
        
        {product.price.discount_percent > 0 && (
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-outline-variant/20">
            <span className="font-label-caps-xs text-label-caps-xs text-on-surface uppercase">
              {product.price.discount_percent}% OFF
            </span>
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <button className="bg-surface/80 backdrop-blur-md text-on-surface font-label-caps-xs text-label-caps-xs uppercase px-4 py-2 rounded-full border border-outline-variant/30 hover:bg-on-surface hover:text-surface transition-colors cursor-pointer">
            Quick View
          </button>
        </div>
      </div>
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-body-bold text-body-bold text-on-surface">{product.name}</h3>
          <p className="font-label-caps-xs text-label-caps-xs text-on-surface-variant uppercase mt-1">
            {product.category}
          </p>
        </div>
        <span className="font-body-base text-body-base text-on-surface shrink-0">
          ₹{product.price.selling_price}
        </span>
      </div>
    </div>
  );
};
