import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useProducts } from '../../queries/useProducts';
import { Trash2, ShieldCheck } from 'lucide-react';

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useStore();
  const { data: allProducts = [], isLoading } = useProducts('');
  const navigate = useNavigate();

  const wishlistProducts = allProducts.filter(p => wishlist.includes(p.id.toString()));

  return (
    <div className="bg-[#f1f3f6] min-h-screen py-8">
      <div className="max-w-5xl mx-auto bg-white shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">My Wishlist ({wishlistProducts.length})</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading your wishlist...</div>
        ) : wishlistProducts.length === 0 ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Empty Wishlist</h3>
            <p className="mb-6">You have no items in your wishlist. Start adding!</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="group relative flex flex-col md:flex-row gap-6 p-6 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                
                {/* Product Image */}
                <div 
                  className="w-32 h-32 flex-shrink-0 cursor-pointer flex items-center justify-center bg-gray-50 rounded overflow-hidden border border-gray-100"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform" />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="text-base text-gray-900 cursor-pointer hover:text-blue-600 font-medium pr-12 line-clamp-2 leading-relaxed"
                  >
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 mt-1 mb-3">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-600 italic">Assured</span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-gray-900">₹{product.price.selling_price}</span>
                    <span className="text-sm text-gray-500 line-through">₹{product.price.mrp}</span>
                    <span className="text-sm font-bold text-green-600">{product.price.discount_percent}% off</span>
                  </div>
                </div>

                {/* Delete Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id.toString());
                  }}
                  className="absolute right-6 top-8 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
