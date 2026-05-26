import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { SizingModal } from './components/SizingModal';
import { FulfillmentSheet } from './components/FulfillmentSheet';
import { Viewer360Modal } from './components/Viewer360Modal';
import { useStore } from './store/useStore';
import type { Product } from './types';
import { Zap } from 'lucide-react';

import Home from './routes/customer/Home';
import Chat from './routes/customer/Chat';
import OrderStatus from './routes/customer/OrderStatus';
import Account from './routes/customer/Account';
import Signup from './routes/customer/Signup';
import AdminDashboard from './routes/admin/Dashboard';

const queryClient = new QueryClient();

function AppShell() {
  const {
    cart,
    updateQty,
    removeItem,
    clearCart,
    setSize,
    currentLocation,
    setLocation,
    sizingProduct,
    setSizingProduct,
    cartOpen,
    setCartOpen,
    fulfillmentOpen,
    setFulfillmentOpen,
    setOriginHub,
    setCouponApplied,
    setCouponDiscount,
    originHub,
  } = useStore();

  const [viewer360Product, setViewer360Product] = useState<Product | null>(null);

  const handleLocationChange = (loc: string) => {
    setLocation(loc);
  };

  const handlePlaceOrder = (couponApplied: boolean, couponDiscount: number) => {
    if (cart.length === 0) return;
    const primaryItem = cart[0].product;
    setOriginHub(`${primaryItem.boutique} Hub`);
    setCouponApplied(couponApplied);
    setCouponDiscount(couponDiscount);
    setCartOpen(false);
    clearCart();
    setFulfillmentOpen(true);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="text-gray-900 min-h-screen relative overflow-x-hidden selection:bg-coral selection:text-white bg-[#FAF8F5]">
      {/* Sticky Navbar */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        currentLocation={currentLocation}
        onChangeLocation={handleLocationChange}
      />

      {/* Main Content with Routes */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                onOpenSizingGuide={setSizingProduct}
                onOpen360Viewer={setViewer360Product}
              />
            }
          />
          <Route path="/chat" element={<Chat />} />
          <Route path="/order-status" element={<OrderStatus />} />
          <Route path="/account" element={<Account />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/logs" element={<AdminDashboard />} />
        </Routes>
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-panelBorder/50 bg-gradient-to-b from-transparent to-[#F5F1E8]/30 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand mark */}
            <div className="flex items-center gap-3">
              <div className="bg-[#C5A880]/15 border border-[#C5A880]/30 rounded-xl p-2 flex items-center justify-center text-[#C5A880]">
                <Zap className="w-4 h-4 fill-[#C5A880] text-[#C5A880]" />
              </div>
              <div>
                <span className="font-extrabold text-base text-gray-900 font-jakarta">
                  QUICK_<span className="text-coral">STYLE</span>
                </span>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Hyperlocal Fashion · Zero Inventory · AI Driven
                </p>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-xs text-gray-500 text-center md:text-left max-w-sm leading-relaxed">
              Bridging local boutiques and modern shoppers through AI-powered fit calibration, 
              real-time inventory, and 12-minute scooter delivery.
            </p>

            {/* Footer links */}
            <nav className="flex flex-wrap gap-5 text-xs font-medium text-gray-500 justify-center">
              <a href="#" className="hover:text-coral transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="hover:text-coral transition-colors duration-200">Terms of Service</a>
              <a href="#" className="hover:text-coral transition-colors duration-200">Boutique Sign Up</a>
              <a href="#" className="hover:text-coral transition-colors duration-200">Courier Partner</a>
            </nav>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-panelBorder/40 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] text-gray-400">
            <span>© 2026 QUICK_STYLE. All rights reserved.</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All systems operational · 14 riders active</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Overlay Components */}

      {/* Sizing Guide Modal */}
      {sizingProduct && (
        <SizingModal
          isOpen={true}
          onClose={() => setSizingProduct(null)}
          productName={sizingProduct.name}
          onSelectSize={(sz) => setSize(sizingProduct.id, sz)}
        />
      )}

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cart}
        onUpdateQty={updateQty}
        onRemoveItem={removeItem}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* Live Delivery Tracking Sheet */}
      <FulfillmentSheet
        isOpen={fulfillmentOpen}
        onClose={() => setFulfillmentOpen(false)}
        originHub={originHub}
      />

      {/* 360° Product Viewer Modal */}
      {viewer360Product && (
        <Viewer360Modal
          product={viewer360Product}
          onClose={() => setViewer360Product(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
