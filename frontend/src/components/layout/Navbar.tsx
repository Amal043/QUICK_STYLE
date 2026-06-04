import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, MapPin, Search, ShoppingBag, ChevronDown, Mic, MicOff, LayoutDashboard, User, Heart } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  currentLocation: string;
  onChangeLocation: (loc: string) => void;
}

const searchQueries = [
  "Ask our AI Stylist for matching sizes...",
  "Need a black linen shirt for tonight?",
  "🔥 Spilled coffee, need a fresh L shirt...",
  "👟 Sneaker match for blue jeans...",
  "🎓 Formal look for presentation...",
  "⚡ Delivery to NIT Jamshedpur under 12 mins..."
];

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  currentLocation,
  onChangeLocation
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchIndex, setSearchIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [locLoading, setLocLoading] = useState(false);

  // Zustand Store binding
  const { 
    adminMode, 
    setAdminMode, 
    voiceSearching, 
    setVoiceSearching, 
    isLoggedIn, 
    setIsLoggedIn,
    setLocation,
    setUserCoords
  } = useStore();

  const handleRequestLocation = () => {
    setLocLoading(true);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setLocation('📍 Kolkata, West Bengal');
      setUserCoords({ lat: 22.4981, lng: 88.3653 });
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setUserCoords({ lat, lng });

        // Nominatim reverse geocode
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
            headers: { 'Accept-Language': 'en' }
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
          console.warn(e);
        }

        // Local coordinates region check fallback
        const isKolkata = Math.abs(lat - 22.5) < 0.5 && Math.abs(lng - 88.3) < 0.5;
        setLocation(isKolkata ? '📍 Kolkata, West Bengal' : '📍 Jamshedpur, Jharkhand');
        setLocLoading(false);
      },
      (error) => {
        console.warn("[GEOLOCATION] Navbar geolocation error:", error);
        alert("Could not detect your current location. Falling back to default (Kolkata).");
        setLocation('📍 Kolkata, West Bengal');
        setUserCoords({ lat: 22.4981, lng: 88.3653 });
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Cycling search placeholder animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setSearchIndex((prev) => (prev + 1) % searchQueries.length);
        setFade(true);
      }, 300);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Web Speech API Integration
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const toggleVoiceSearch = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Please try Google Chrome or MS Edge.");
      return;
    }

    if (voiceSearching) {
      recognition.stop();
      setVoiceSearching(false);
    } else {
      setVoiceSearching(true);
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        // Navigate to Chat route and dispatch query
        navigate('/chat');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('voice-query', { detail: transcript }));
        }, 300);
        setVoiceSearching(false);
      };

      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setVoiceSearching(false);
      };

      recognition.onend = () => {
        setVoiceSearching(false);
      };

      recognition.start();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-b from-[#FAF9F6] via-[#FAF9F6]/80 to-transparent backdrop-blur-[6px] border-none transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Left: Logo & Location Picker */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-[#C5A880]/15 border border-[#C5A880]/30 rounded-xl p-2 flex items-center justify-center text-[#C5A880] shadow-md shadow-[#C5A880]/5 group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-5 h-5 fill-[#C5A880] text-[#C5A880]" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-gray-950 via-gray-900 to-[#C5A880] bg-clip-text text-transparent group-hover:opacity-95 font-jakarta">
              QUICK_<span className="text-coral">STYLE</span>
            </span>
          </Link>

          {/* Location Picker */}
          <button 
            onClick={handleRequestLocation}
            disabled={locLoading}
            className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-coral transition-colors max-w-[220px] bg-[#F7F5F0] border border-panelBorder px-3 py-1.5 rounded-full shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            title="Click to geolocate your delivery address"
          >
            <MapPin className="w-3.5 h-3.5 text-coral flex-shrink-0 animate-pulse" />
            <span className="font-extrabold truncate max-w-[130px]">
              {locLoading ? 'Locating...' : (currentLocation === 'Select Location' ? 'Set Location' : currentLocation.replace('📍 ', ''))}
            </span>
            <ChevronDown className="w-3 h-3 text-coral" />
          </button>
        </div>

        {/* Center: Search pill with integrated voice microphone */}
        <div className="flex-1 max-w-lg relative group">
          <div className="w-full h-11 px-4 pl-11 pr-11 rounded-full bg-white border border-panelBorder/80 flex items-center justify-between text-sm text-gray-600 focus-within:border-[#C5A880] focus-within:ring-2 focus-within:ring-[#C5A880]/15 transition-all duration-300">
            <div className="flex items-center gap-3 w-full">
              <Search className="w-4 h-4 text-[#C5A880]" />
              <span
                className={`text-gray-600/80 pointer-events-none truncate select-none transition-opacity duration-300 ${
                  fade ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {searchQueries[searchIndex]}
              </span>
            </div>
            
            {/* Voice microphone button inside the search pill */}
            <button
              onClick={toggleVoiceSearch}
              className={`absolute right-3.5 top-2.5 p-1 rounded-full border transition-all ${
                voiceSearching
                  ? 'bg-[#5C1324] border-[#5C1324] text-white animate-pulse'
                  : 'bg-[#FAF8F5] border-panelBorder text-[#C5A880] hover:border-[#C5A880]/50'
              }`}
              title="Voice Search"
            >
              {voiceSearching ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Right: Dashboard switcher, Cart, and Links */}
        <div className="flex items-center gap-4">
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-700 mr-2">
            <Link to="/" className={`hover:text-coral transition-colors ${location.pathname === '/' ? 'text-coral' : ''}`}>Home</Link>
            <Link to="/chat" className={`hover:text-coral transition-colors ${location.pathname === '/chat' ? 'text-coral' : ''}`}>AI Pilot</Link>
            
            {!isLoggedIn && !adminMode && (
              <>
                <Link to="/signup" className={`hover:text-coral transition-colors ${location.pathname === '/signup' ? 'text-coral' : ''}`}>Sign Up</Link>
                <Link to="/login" className={`hover:text-coral transition-colors ${location.pathname === '/login' ? 'text-coral' : ''}`}>Login</Link>
              </>
            )}

            {(isLoggedIn || adminMode) && (
              <>
                <Link to="/history" className={`hover:text-coral transition-colors ${location.pathname === '/history' ? 'text-coral' : ''}`}>History</Link>
                <Link to="/account" className={`hover:text-coral transition-colors ${location.pathname === '/account' ? 'text-coral' : ''}`}>Account</Link>
              </>
            )}

            {adminMode && (
              <>
                <Link to="/admin/logs" className={`hover:text-coral transition-colors ${location.pathname === '/admin/logs' ? 'text-coral' : ''}`}>Dashboard</Link>
                <Link to="/admin/brain" className={`hover:text-coral transition-colors ${location.pathname === '/admin/brain' ? 'text-coral' : ''}`}>Agent Brain</Link>
                <span className="bg-[#5C1324] text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Admin</span>
              </>
            )}
          </nav>

          {/* Admin Dashboard Switcher (Hidden when actually logged in as Admin, as it acts automatically) */}
          {!isLoggedIn && (
            <button
              onClick={() => {
                const newMode = !adminMode;
                setAdminMode(newMode);
                if (newMode) {
                  navigate('/admin/logs');
                } else {
                  navigate('/');
                }
              }}
              className={`p-3 rounded-xl border flex items-center justify-center transition-all duration-200 group ${
                location.pathname.startsWith('/admin')
                  ? 'bg-[#C5A880] border-[#C5A880] text-white shadow-lg shadow-[#C5A880]/20'
                  : 'bg-white hover:bg-lavender-deep border-panelBorder text-[#C5A880] hover:text-[#5C1324]'
              }`}
              title={adminMode ? "Switch to Storefront" : "Toggle Demo Admin"}
            >
              {location.pathname.startsWith('/admin') ? <User className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            </button>
          )}

          {/* Wishlist Icon */}
          {isLoggedIn && (
            <Link
              to="/account"
              className="relative bg-white hover:bg-lavender-deep border border-panelBorder p-3 rounded-xl flex items-center justify-center transition-all duration-200 group text-[#C5A880] hover:text-[#5C1324]"
            >
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {useStore.getState().wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 rounded-full bg-[#5C1324] border-2 border-[#FAF8F5] flex items-center justify-center text-[10px] font-extrabold text-white">
                  {useStore.getState().wishlist.length}
                </span>
              )}
            </Link>
          )}

          <button
            onClick={onOpenCart}
            className="relative bg-white hover:bg-lavender-deep border border-panelBorder p-3 rounded-xl flex items-center justify-center transition-all duration-200 group text-[#C5A880] hover:text-[#5C1324]"
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span
              className={`absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 rounded-full bg-[#5C1324] border-2 border-[#FAF8F5] flex items-center justify-center text-[10px] font-extrabold text-white transform transition-transform duration-300 ${
                cartCount > 0 ? 'scale-100' : 'scale-0'
              }`}
            >
              {cartCount}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
