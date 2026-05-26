import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, MapPin, Search, ShoppingBag, ChevronDown, Mic, MicOff, LayoutDashboard, User } from 'lucide-react';
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

  // Zustand Store binding
  const { adminMode, setAdminMode, voiceSearching, setVoiceSearching } = useStore();

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
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-panelBorder/60 transition-all duration-300">
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

          {/* Location dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-lavender-deep border border-panelBorder text-xs font-semibold text-gray-800 transition-all duration-200"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{currentLocation.replace('📍 ', '')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                <div className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-obsidian border border-panelBorder shadow-xl p-2 z-20">
                  <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Select Location</div>
                  {[
                    '📍 NIT Jamshedpur Campus',
                    '📍 Adityapur Mall Area',
                    '📍 Bistupur Market Hub',
                    '📍 Tatanagar Station Area'
                  ].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        onChangeLocation(loc);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-lavender-deep hover:text-gray-900 transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
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
            <Link to="/account" className={`hover:text-coral transition-colors ${location.pathname === '/account' ? 'text-coral' : ''}`}>Account</Link>
            <Link to="/signup" className={`hover:text-coral transition-colors ${location.pathname === '/signup' ? 'text-coral' : ''}`}>Sign Up</Link>
            <Link to="/login" className={`hover:text-coral transition-colors ${location.pathname === '/login' ? 'text-coral' : ''}`}>Login</Link>
            {adminMode && (
              <Link to="/admin/logs" className={`hover:text-coral transition-colors ${location.pathname.startsWith('/admin') ? 'text-coral' : ''}`}>Logs</Link>
            )}
          </nav>

          {/* Admin Dashboard Switcher */}
          <button
            onClick={() => {
              const newMode = !adminMode;
              setAdminMode(newMode);
              if (newMode) {
                navigate('/admin');
              } else {
                navigate('/');
              }
            }}
            className={`p-3 rounded-xl border flex items-center justify-center transition-all duration-200 group ${
              location.pathname.startsWith('/admin')
                ? 'bg-[#C5A880] border-[#C5A880] text-white shadow-lg shadow-[#C5A880]/20'
                : 'bg-white hover:bg-lavender-deep border-panelBorder text-[#C5A880] hover:text-[#5C1324]'
            }`}
            title={adminMode ? "Switch to Storefront" : "Switch to Admin Dashboard"}
          >
            {location.pathname.startsWith('/admin') ? <User className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />}
          </button>

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
