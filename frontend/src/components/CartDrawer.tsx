import React, { useState } from 'react';
import { ShoppingBag, X, ShoppingCart, CreditCard, Tag, CheckCircle, AlertCircle } from 'lucide-react';
import type { CartItem, Size } from '../types';
import { getImageAsset } from './MarketplaceGrid';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (productId: string | number, size: Size, delta: number) => void;
  onRemoveItem: (productId: string | number, size: Size) => void;
  onPlaceOrder: (couponApplied: boolean, couponDiscount: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onPlaceOrder
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price.selling_price * item.quantity, 0);
  const calibrationDiscount = subtotal > 0 ? 5.00 : 0;

  // Coupon QUICK20 provides 20% discount
  const couponDiscount = couponApplied ? (subtotal - calibrationDiscount) * 0.20 : 0;
  const finalTotal = Math.max(0, subtotal - calibrationDiscount - couponDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'QUICK20') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponApplied(false);
      setCouponError('Invalid coupon code. Try QUICK20!');
    }
  };

  const handleCheckout = () => {
    onPlaceOrder(couponApplied, couponDiscount);
    // Reset coupon state on checkout success
    setCouponCode('');
    setCouponApplied(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white border-l border-panelBorder shadow-2xl transition-transform duration-300 flex flex-col justify-between animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-panelBorder/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-coral" />
            <h3 className="font-bold text-lg text-gray-900">Your Flash Cart</h3>
            <span className="bg-coral/5 border border-coral/15 text-coral text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
              {totalQty} Items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#F7F5F0] hover:bg-[#EAE6DF] text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-panelBorder">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500 py-12">
              <div className="p-4 rounded-full bg-[#F7F5F0]/50 border border-panelBorder text-gray-400">
                <ShoppingCart className="w-10 h-10" />
              </div>
              <p className="text-sm font-medium">Your cart is empty.</p>
              <p className="text-xs text-gray-500 max-w-[200px]">
                Select a size and click "Instant Delivery" on products to add them.
              </p>
              <button onClick={onClose} className="text-xs font-bold text-coral hover:underline">
                Continue Browsing
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex gap-4 p-3 rounded-2xl bg-[#F7F5F0]/50 border border-panelBorder/60 items-center justify-between animate-fade-in"
                >
                  <div className="w-14 h-14 bg-[#FAF8F5] rounded-xl border border-panelBorder p-1 flex items-center justify-center flex-shrink-0">
                    <img src={getImageAsset(item.product.id)} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{item.product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-coral/5 text-coral border border-coral/10 px-2 py-0.5 rounded font-bold">
                        Size: {item.size}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        ₹{item.product.price.selling_price.toFixed(2)} each
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2.5">
                    <div className="flex items-center gap-2 bg-[#FAF8F5] border border-panelBorder rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateQty(item.product.id, item.size, -1)}
                        className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-[#EAE6DF] rounded"
                      >
                        -
                      </button>
                      <span className="text-[11px] font-bold text-gray-900 min-w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQty(item.product.id, item.size, 1)}
                        className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-[#EAE6DF] rounded"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product.id, item.size)}
                      className="text-[10px] text-coral hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* E-commerce Coupon & Price Summary panel */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-panelBorder bg-[#F7F5F0] space-y-4">
            
            {/* Nykaa/Flipkart inspired coupon widget */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon (e.g. QUICK20)"
                    disabled={couponApplied}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-panelBorder text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:border-coral disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponApplied || !couponCode.trim()}
                  className="px-4 rounded-xl bg-gray-950 hover:bg-gray-800 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>

              {couponApplied && (
                <div className="flex items-center gap-1.5 text-xs text-[#10B981] bg-[#10B981]/5 border border-[#10B981]/20 p-2.5 rounded-lg">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Promo <b>QUICK20</b> applied: 20% discount deducted!</span>
                </div>
              )}
              {couponError && (
                <div className="flex items-center gap-1.5 text-xs text-coral bg-coral/5 border border-coral/20 p-2.5 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}
            </form>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Hyper-Local Delivery (ETA ~12m)</span>
                <span className="text-emerald font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>AI Stylist Calibration Discount</span>
                <span className="text-coral">-₹{calibrationDiscount.toFixed(2)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-xs text-[#10B981]">
                  <span>Voucher Code (QUICK20)</span>
                  <span>-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="h-[1px] bg-panelBorder/60 my-2"></div>
              <div className="flex justify-between text-sm font-bold text-gray-900">
                <span>Total (Incl. tax)</span>
                <span className="text-lg text-coral font-jakarta">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order Checkout CTA */}
            <button
              onClick={handleCheckout}
              className="w-full py-4 rounded-xl bg-coral hover:bg-coral-hover text-white text-sm font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] shadow-lg shadow-coral/10 hover:shadow-coral/20 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Place Order (Quick-Pay)</span>
            </button>
          </div>
        )}

      </div>
    </>
  );
};
