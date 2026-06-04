import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { SizingModal } from './components/SizingModal';

import { useStore } from './store/useStore';
import type { Product, Size } from './types';

import Home from './routes/customer/Home';
import Collection from './routes/customer/Collection';
import ProductDetailsPage from './routes/customer/ProductDetailsPage';
import Chat from './routes/customer/Chat';
import OrderStatus from './routes/customer/OrderStatus';
import Account from './routes/customer/Account';
import Signup from './routes/customer/Signup';
import Login from './routes/customer/Login';
import History from './routes/customer/History';
import AdminDashboard from './routes/admin/Dashboard';
import AgentBrain from './routes/admin/AgentBrain';


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
    addToCart,
    setActiveOrderId,
    addOrderToHistory,
  } = useStore();
  const navigate = useNavigate();

  const handleLocationChange = (loc: string) => {
    setLocation(loc);
  };

  const handlePlaceOrder = (couponApplied: boolean, couponDiscount: number) => {
    if (cart.length === 0) return;
    const primaryItem = cart[0].product;
    setOriginHub(`${primaryItem.store_name || primaryItem.boutique}`);
    setCouponApplied(couponApplied);
    setCouponDiscount(couponDiscount);
    setCartOpen(false);
    
    // Generate Order ID
    const orderId = `FW-${Math.floor(100000 + Math.random() * 900000)}`;
    const totalAmount = cart.reduce((sum, item) => sum + item.product.price.selling_price * item.quantity, 0);
    const finalAmount = couponApplied ? totalAmount - couponDiscount : totalAmount;

    // Save order in history
    addOrderToHistory({
      orderId,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      amount: Math.round(finalAmount),
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        image: item.product.image,
        price: item.product.price.selling_price,
        size: item.size,
        quantity: item.quantity
      })),
      status: 'In Transit'
    });

    clearCart();
    setActiveOrderId(orderId);
    navigate(`/order-status?order_id=${orderId}`);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="text-on-surface min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-surface bg-background">
      {/* Sticky Navbar */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        currentLocation={currentLocation}
        onChangeLocation={handleLocationChange}
      />

      {/* Main Content with Routes */}
      <main className="w-full">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                onOpenSizingGuide={setSizingProduct}
              />
            }
          />
          <Route path="/collection" element={<Collection />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/order-status" element={<OrderStatus />} />
          <Route path="/account" element={<Account />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/history" element={<History />} />
          <Route path="/admin/logs" element={<AdminDashboard />} />
          <Route path="/admin/brain" element={<AgentBrain />} />

        </Routes>
      </main>

      {/* Premium Zevana Footer */}
      <footer className="border-t border-outline-variant/20 py-16 mt-0">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <h3 className="font-display-md text-display-md text-on-surface mb-4">ZEVANA</h3>
              <p className="font-body-base text-sm text-on-surface-variant leading-relaxed">
                Hyperlocal fashion marketplace. AI-powered styling. 12-minute scooter delivery.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-widest">Navigate</h4>
              <ul className="space-y-3 font-body-base text-sm text-on-surface-variant">
                <li><a href="/" className="hover:text-on-surface transition-colors">Collections</a></li>
                <li><a href="/chat" className="hover:text-on-surface transition-colors">AI Stylist</a></li>
                <li><a href="/account" className="hover:text-on-surface transition-colors">Account</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-widest">Legal</h4>
              <ul className="space-y-3 font-body-base text-sm text-on-surface-variant">
                <li><a href="#" className="hover:text-on-surface transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-on-surface transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-on-surface transition-colors">Cookie Settings</a></li>
              </ul>
            </div>

            {/* Partner */}
            <div>
              <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-widest">Partner</h4>
              <ul className="space-y-3 font-body-base text-sm text-on-surface-variant">
                <li><a href="#" className="hover:text-on-surface transition-colors">Boutique Sign Up</a></li>
                <li><a href="#" className="hover:text-on-surface transition-colors">Courier Partner</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
            <span>© 2026 ZEVANA by QUICK_STYLE. All rights reserved.</span>
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
