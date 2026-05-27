import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, ShoppingCart, CreditCard, Tag, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import type { CartItem, Size } from '../types';
import { getImageAsset } from './product/ProductCard';
import { useStore } from '../store/useStore';
import { getPreciseLocation } from '../lib/geolocation';

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
  const { currentLocation, setLocation, setUserCoords, userCoords } = useStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch address suggestions from OpenStreetMap Nominatim API
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        console.log(`[NOMINATIM] Searching for: ${searchQuery}`);
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`;
        const resp = await fetch(url, {
          headers: {
            'Accept-Language': 'en'
          }
        });
        if (resp.ok) {
          const data = await resp.json();
          setSuggestions(data || []);
        }
      } catch (err) {
        console.error("Nominatim geocoding search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price.selling_price * item.quantity, 0);
  const calibrationDiscount = subtotal > 0 ? 5.00 : 0;

  const isKolkata = userCoords
    ? Math.abs(userCoords.lat - 22.5) < 0.5 && Math.abs(userCoords.lng - 88.3) < 0.5
    : (currentLocation.includes('Kolkata'));
  const deliveryFee = currentLocation === 'Select Location' ? 0 : (isKolkata ? 49 : 149);

  // Coupon QUICK20 provides 20% discount
  const couponDiscount = couponApplied ? (subtotal - calibrationDiscount) * 0.20 : 0;
  const finalTotal = Math.max(0, subtotal - calibrationDiscount - couponDiscount + deliveryFee);

  const handleRequestLocation = () => {
    setLocLoading(true);
    setLocError('');
    
    getPreciseLocation(
      async (coords) => {
        const { lat, lng } = coords;
        setUserCoords({ lat, lng });
        
        // Try Nominatim reverse geocoding (free, OSM public API)
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
            headers: {
              'Accept-Language': 'en'
            }
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data && data.address) {
              const addr = data.address;
              const placeName = addr.suburb || addr.neighbourhood || addr.city_district || addr.city || addr.town || addr.village || "";
              const stateName = addr.state || "";
              const formatted = placeName ? `📍 ${placeName}, ${stateName}` : `📍 ${data.display_name.split(',')[0]}, ${stateName}`;
              setLocation(formatted);
              setLocLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn("[GEOLOCATION] OSM Nominatim reverse geocode failed, falling back to IP:", e);
        }

        // Fallback 1: freeipapi.com
        try {
          const resp = await fetch('https://freeipapi.com/api/json');
          if (resp.ok) {
            const data = await resp.json();
            if (data.cityName && data.regionName) {
              setLocation(`📍 ${data.cityName}, ${data.regionName}`);
              setLocLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn(e);
        }

        // Fallback 2: Basic lat/lng bounding box check
        const isKolkataLoc = Math.abs(lat - 22.5) < 0.5 && Math.abs(lng - 88.3) < 0.5;
        if (isKolkataLoc) {
          setLocation('📍 Kolkata, West Bengal');
        } else {
          setLocation('📍 Jamshedpur, Jharkhand');
        }
        setLocLoading(false);
      },
      async (error) => {
        console.warn("[GEOLOCATION] Geolocation failed:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setLocError('Location permission denied. Please allow location access to checkout.');
          setLocLoading(false);
        } else {
          // timeout or position unavailable - fall back to IP geoloc
          try {
            const resp = await fetch('https://freeipapi.com/api/json');
            if (resp.ok) {
              const data = await resp.json();
              if (data.cityName && data.regionName) {
                setLocation(`📍 ${data.cityName}, ${data.regionName}`);
                const fallbackLat = data.latitude || 22.4981;
                const fallbackLng = data.longitude || 88.3653;
                setUserCoords({ lat: fallbackLat, lng: fallbackLng });
                setLocLoading(false);
                return;
              }
            }
          } catch (e) {
            console.warn(e);
          }
          setLocation('📍 Kolkata, West Bengal');
          setUserCoords({ lat: 22.4981, lng: 88.3653 });
          setLocLoading(false);
        }
      }
    );
  };

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
            
            {/* Delivery Location Status Card */}
            {currentLocation === 'Select Location' ? (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-3 shadow-sm animate-fade-in">
                <div className="text-center space-y-1">
                  <div className="w-9 h-9 bg-orange-100 text-coral rounded-full flex items-center justify-center mx-auto border border-orange-200 animate-pulse mb-1">
                    <MapPin className="w-4.5 h-4.5 text-coral" />
                  </div>
                  <h4 className="font-extrabold text-xs text-gray-900">Delivery Address Required</h4>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    Share your address location to calculate delivery fees and checkout.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRequestLocation}
                  disabled={locLoading}
                  className="w-full h-9 bg-[#fc8019] hover:bg-[#e07016] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {locLoading ? "Detecting GPS..." : "Detect Location (GPS)"}
                </button>

                <div className="flex items-center gap-2 text-gray-400">
                  <div className="h-[1px] bg-gray-200 flex-1"></div>
                  <span className="text-[8px] font-bold tracking-wider uppercase">Or Search Address</span>
                  <div className="h-[1px] bg-gray-200 flex-1"></div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type Jamshedpur, Kolkata, etc..."
                    className="w-full h-9 px-3 rounded-xl bg-white border border-panelBorder text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-coral"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-coral border-t-transparent rounded-full animate-spin"></div>
                  )}

                  {/* Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-panelBorder rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-gray-100">
                      {suggestions.map((item) => {
                        const addr = item.address;
                        const placeName = addr.suburb || addr.neighbourhood || addr.city_district || addr.city || addr.town || addr.village || "";
                        const stateName = addr.state || "";
                        const mainLabel = placeName ? `${placeName}, ${stateName}` : `${item.display_name.split(',')[0]}, ${stateName}`;
                        
                        return (
                          <button
                            key={item.place_id}
                            type="button"
                            onClick={() => {
                              const lat = parseFloat(item.lat);
                              const lng = parseFloat(item.lon);
                              setUserCoords({ lat, lng });
                              setLocation(`📍 ${mainLabel}`);
                              setSearchQuery('');
                              setSuggestions([]);
                            }}
                            className="w-full text-left px-3 py-2 text-[11px] text-gray-700 hover:bg-[#FAF8F5] transition-colors truncate font-medium border-b border-gray-100"
                          >
                            📍 {item.display_name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-650 rounded-full flex items-center justify-center border border-emerald-200 flex-shrink-0">
                    <CheckCircle className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wider">Deliver To</h5>
                    <p className="text-xs text-gray-850 font-bold truncate max-w-[170px]">{currentLocation}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLocation('Select Location');
                    setUserCoords(null);
                  }}
                  className="text-[10px] font-bold text-coral hover:underline flex-shrink-0"
                >
                  Change
                </button>
              </div>
            )}

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
              <div className="flex justify-between text-xs text-gray-600 items-center">
                <span>Delivery Location</span>
                {currentLocation === 'Select Location' ? (
                  <button
                    type="button"
                    onClick={handleRequestLocation}
                    disabled={locLoading}
                    className="text-coral font-bold hover:underline bg-coral/5 border border-coral/25 px-2 py-1 rounded text-[10px] animate-pulse"
                  >
                    {locLoading ? "Locating..." : "Locate Me"}
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-800 text-[10px] truncate max-w-[120px]">{currentLocation}</span>
                    <button
                      type="button"
                      onClick={handleRequestLocation}
                      disabled={locLoading}
                      className="text-coral font-bold hover:underline text-[9px]"
                    >
                      {locLoading ? "..." : "(change)"}
                    </button>
                  </div>
                )}
              </div>
              {locError && (
                <div className="text-[10px] text-coral font-semibold text-right leading-none mt-0.5">
                  {locError}
                </div>
              )}
              
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-xs text-gray-600">
                <span>Hyper-Local Delivery</span>
                {currentLocation === 'Select Location' ? (
                  <span className="text-gray-400 font-semibold italic text-[10px]">Add location first</span>
                ) : (
                  <span className="text-gray-800 font-bold">₹{deliveryFee.toFixed(2)}</span>
                )}
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
              disabled={currentLocation === 'Select Location'}
              className="w-full py-4 rounded-xl bg-coral hover:bg-coral-hover text-white text-sm font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] shadow-lg shadow-coral/10 hover:shadow-coral/20 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <CreditCard className="w-4 h-4" />
              <span>{currentLocation === 'Select Location' ? 'Set Location to Checkout' : 'Place Order (Quick-Pay)'}</span>
            </button>
          </div>
        )}

      </div>
    </>
  );
};
