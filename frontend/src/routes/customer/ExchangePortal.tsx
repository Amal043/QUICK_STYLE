import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, X, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useProducts } from '../../queries/useProducts';
import type { Product } from '../../types';
import { useStore } from '../../store/useStore';

interface SelectedItem {
  product: Product;
  size: string | null;
  sizeOpen: boolean;
}

export default function ExchangePortal() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { updateOrderStatus } = useStore();

  const returningItem = state?.item;

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [confirming, setConfirming] = useState(false);

  if (!returningItem) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Exchange Session Expired</h2>
        <p className="text-gray-500 mb-6">Please initiate exchange from your order history.</p>
        <button
          onClick={() => navigate('/history')}
          className="px-6 py-2.5 bg-[#5C1324] text-white rounded-xl font-bold hover:bg-[#4A0F1D]"
        >
          Go to History
        </button>
      </div>
    );
  }

  // `price` is stored as a plain number on order items (not an object)
  const returningPrice: number =
    typeof returningItem.price === 'object'
      ? (returningItem.price?.selling_price ?? 0)
      : (returningItem.price ?? 0);

  // Fetch same-store products priced ≥ returning price
  const qs = new URLSearchParams();
  qs.set('store', returningItem.store_name);
  qs.set('min_price', String(returningPrice));
  const { data: products = [], isLoading } = useProducts(qs.toString());

  // ── Selection helpers ───────────────────────────────────────────────────────
  const isSelected = (productId: string) => selectedItems.some(i => i.product.id === productId);

  const toggleProduct = (product: Product) => {
    if (isSelected(product.id)) {
      setSelectedItems(prev => prev.filter(i => i.product.id !== product.id));
    } else {
      setSelectedItems(prev => [...prev, { product, size: null, sizeOpen: true }]);
    }
  };

  const setSizeForItem = (productId: string, size: string) => {
    setSelectedItems(prev =>
      prev.map(i => i.product.id === productId ? { ...i, size, sizeOpen: false } : i)
    );
  };

  const toggleSizePanel = (productId: string) => {
    setSelectedItems(prev =>
      prev.map(i => i.product.id === productId ? { ...i, sizeOpen: !i.sizeOpen } : i)
    );
  };

  const removeItem = (productId: string) => {
    setSelectedItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const allSizesSelected = selectedItems.length > 0 && selectedItems.every(i => i.size !== null);

  const handleConfirmExchange = () => {
    if (!orderId || !allSizesSelected || confirming) return;
    setConfirming(true);
    const trackingCreatedAt = Date.now();
    updateOrderStatus(orderId, 'Exchanging', trackingCreatedAt);
    window.location.href = `/order-details/${orderId}?createdAt=${trackingCreatedAt}&mode=Exchange`;
  };

  const panelHeight = selectedItems.length > 0;

  return (
    <div className={`min-h-screen bg-background pt-20 px-4 md:px-10 animate-fade-in ${panelHeight ? 'pb-72' : 'pb-12'}`}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-display-md text-gray-900">Exchange Portal</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              From <span className="font-bold text-gray-700">{returningItem.store_name}</span> — items priced ₹{returningPrice}+
            </p>
          </div>
          {selectedItems.length > 0 && (
            <div className="ml-auto flex items-center gap-2 bg-[#5C1324]/10 text-[#5C1324] px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold">{selectedItems.length} selected</span>
            </div>
          )}
        </div>

        {/* Returning item banner */}
        <div className="mb-6 bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center gap-4">
          {returningItem.image && (
            <img
              src={returningItem.image}
              alt="Returning"
              className="w-14 h-14 object-cover rounded-xl border border-gray-200 flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-0.5">Returning</p>
            <p className="font-bold text-gray-900 truncate">{returningItem.name}</p>
            <p className="text-sm text-gray-500">Size: {returningItem.size} · ₹{returningPrice}</p>
          </div>
        </div>

        {/* Products grid */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <span className="material-symbols-outlined animate-spin text-4xl text-[#C5A880]">autorenew</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 text-gray-500">
            No items available for exchange from this store at ₹{returningPrice} or above.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => {
              const selected = isSelected(p.id);
              const price = p.price?.selling_price ?? (p.price as any);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProduct(p)}
                  className={`relative group text-left rounded-2xl border-2 transition-all overflow-hidden shadow-sm hover:shadow-lg ${
                    selected
                      ? 'border-[#5C1324] ring-2 ring-[#5C1324]/20 shadow-md'
                      : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="aspect-[3/4] bg-gray-50 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {selected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-[#5C1324] rounded-full flex items-center justify-center shadow">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs font-bold text-gray-900 leading-tight line-clamp-2">{p.name}</p>
                    <p className="text-xs text-[#5C1324] font-extrabold mt-1">₹{price}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Sticky bottom panel ──────────────────────────────────────────────── */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl max-h-64 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 pt-4 pb-4">

            {/* Selected items list */}
            <div className="space-y-3 mb-4">
              {selectedItems.map(({ product, size, sizeOpen }) => {
                const availableSizes =
                  product.sizes_available?.length
                    ? product.sizes_available
                    : Object.keys(product.stock || {});
                const price = product.price?.selling_price ?? (product.price as any);

                return (
                  <div key={product.id} className="bg-gray-50 rounded-xl p-3">
                    {/* Product row */}
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-xs truncate">{product.name}</p>
                        <p className="text-xs text-gray-400">₹{price}</p>
                      </div>

                      {/* Size indicator / toggle */}
                      <button
                        onClick={() => toggleSizePanel(product.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          size
                            ? 'bg-[#5C1324] text-white border-[#5C1324]'
                            : 'bg-white text-orange-600 border-orange-300 animate-pulse'
                        }`}
                      >
                        {size ? `Size: ${size}` : 'Pick size'}
                        {sizeOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-1 rounded-full hover:bg-gray-200 flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>

                    {/* Size chips */}
                    {sizeOpen && (
                      <div className="flex items-center gap-2 flex-wrap mt-3 pl-13">
                        {availableSizes.map((sz) => {
                          const inStock = (product.stock?.[sz as any] ?? 1) > 0;
                          return (
                            <button
                              key={sz}
                              disabled={!inStock}
                              onClick={() => setSizeForItem(product.id, sz)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                size === sz
                                  ? 'bg-[#5C1324] text-white border-[#5C1324]'
                                  : inStock
                                  ? 'bg-white text-gray-700 border-gray-300 hover:border-[#5C1324] hover:text-[#5C1324]'
                                  : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed line-through'
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Exchange button */}
            <button
              disabled={!allSizesSelected || confirming}
              onClick={handleConfirmExchange}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                allSizesSelected && !confirming
                  ? 'bg-[#5C1324] text-white hover:bg-[#4A0F1D] shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {confirming
                ? 'Processing...'
                : allSizesSelected
                ? `Exchange ${selectedItems.length} Item${selectedItems.length > 1 ? 's' : ''}`
                : 'Pick sizes to continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
