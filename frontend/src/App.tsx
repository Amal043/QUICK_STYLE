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
import OrderDetails from './routes/customer/OrderDetails';
import Account from './routes/customer/Account';
import Signup from './routes/customer/Signup';
import Login from './routes/customer/Login';
import History from './routes/customer/History';
import Wishlist from './routes/customer/Wishlist';
import AdminDashboard from './routes/admin/Dashboard';
import AgentBrain from './routes/admin/AgentBrain';
import AdminAddProduct from './routes/admin/AdminAddProduct';


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
    
    setCouponApplied(couponApplied);
    setCouponDiscount(couponDiscount);
    setCartOpen(false);
    
    // Split into multiple orders (one per cart item) because items come from different boutiques
    const newOrderIds: string[] = [];
    
    cart.forEach((item, index) => {
      const orderId = `FW-${Math.floor(100000 + Math.random() * 900000)}`;
      newOrderIds.push(orderId);
      
      const itemPrice = item.product.price.selling_price * item.quantity;
      // If a coupon is applied, we can just distribute it or apply it to the first order. 
      // For simplicity, applying proportionately or ignoring. Let's apply it just to the first item for now.
      const discountToApply = (index === 0 && couponApplied) ? couponDiscount : 0;
      const finalAmount = itemPrice - discountToApply;

      addOrderToHistory({
        orderId,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        amount: Math.max(0, Math.round(finalAmount)),
        address: useStore.getState().currentLocation !== 'Select Location' ? useStore.getState().currentLocation.replace('📍 ', '') : 'Registered Address',
        items: [{
          id: item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price.selling_price,
          size: item.size,
          quantity: item.quantity,
          store_name: item.product.store_name,
          store_location: item.product.store_location
        }],
        status: 'In Transit'
      });
    });

    clearCart();
    
    // If multiple items, navigate to history so user sees all of them tracking separately. 
    // If single item, navigate directly to that order's details page.
    if (newOrderIds.length === 1) {
      setActiveOrderId(newOrderIds[0]);
      navigate(`/order-details/${newOrderIds[0]}`);
    } else {
      setActiveOrderId(null);
      navigate(`/history`);
    }
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
          <Route path="/order-details/:orderId" element={<OrderDetails />} />
          <Route path="/account" element={<Account />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/history" element={<History />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/admin/logs" element={<AdminDashboard />} />
          <Route path="/admin/brain" element={<AgentBrain />} />
          <Route path="/admin/add-product" element={<AdminAddProduct />} />

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
