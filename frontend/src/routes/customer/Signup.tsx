import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, MapPin, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getPreciseLocation } from '../../lib/geolocation';

export default function Signup() {
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserProfile } = useStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    street: '', area: '', city: 'Kolkata', pincode: '', state: 'West Bengal'
  });
  const [detecting, setDetecting] = useState(false);

  const handleAutoDetect = () => {
    setDetecting(true);
    getPreciseLocation(
      async (coords) => {
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (resp.ok) {
            const data = await resp.json();
            if (data && data.address) {
              const addr = data.address;
              const streetStr = [addr.road, addr.suburb].filter(Boolean).join(', ') || addr.neighbourhood || '';
              const areaStr = addr.city_district || addr.county || '';
              const cityStr = addr.city || addr.town || addr.village || 'Kolkata';
              const pincodeStr = addr.postcode || '';
              const stateStr = addr.state || 'West Bengal';

              setFormData(prev => ({
                ...prev,
                street: streetStr || prev.street,
                area: areaStr || prev.area,
                city: cityStr,
                pincode: pincodeStr || prev.pincode,
                state: stateStr
              }));
              setDetecting(false);
              return;
            }
          }
        } catch (e) {
          console.warn(e);
        }

        // Fallback to IP city/zip
        try {
          const resp = await fetch('https://freeipapi.com/api/json');
          if (resp.ok) {
            const data = await resp.json();
            setFormData(prev => ({
              ...prev,
              city: data.cityName || prev.city,
              pincode: data.zipCode || prev.pincode,
              state: data.regionName || prev.state
            }));
          }
        } catch (e) {
          console.warn(e);
        }
        setDetecting(false);
      },
      async (error) => {
        console.warn("[GEOLOCATION] Geolocation failed:", error);
        try {
          const resp = await fetch('https://freeipapi.com/api/json');
          if (resp.ok) {
            const data = await resp.json();
            setFormData(prev => ({
              ...prev,
              city: data.cityName || prev.city,
              pincode: data.zipCode || prev.pincode,
              state: data.regionName || prev.state
            }));
          }
        } catch (e) {
          console.warn(e);
        }
        setDetecting(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      setUserProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '9999999999',
        addresses: [
          {
            label: 'Home Address',
            street: formData.street,
            area: formData.area,
            city: formData.city,
            pincode: formData.pincode,
            state: formData.state,
            is_default: true
          }
        ]
      });
      setIsLoggedIn(true);
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
      <div className="bg-white border border-panelBorder rounded-3xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 font-jakarta">Create Account</h2>
          <p className="text-sm text-gray-500 mt-2">Join QUICK_STYLE for 12-minute fashion.</p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className={`h-2 rounded-full transition-all ${step >= 1 ? 'w-8 bg-coral' : 'w-2 bg-gray-200'}`}></div>
          <div className={`h-2 rounded-full transition-all ${step >= 2 ? 'w-8 bg-coral' : 'w-2 bg-gray-200'}`}></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 pl-10 text-sm text-gray-900 focus:outline-none focus:border-coral" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 pl-10 text-sm text-gray-900 focus:outline-none focus:border-coral" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 pl-10 text-sm text-gray-900 focus:outline-none focus:border-coral" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-700">Primary Delivery Address</h3>
                <button
                  type="button"
                  onClick={handleAutoDetect}
                  disabled={detecting}
                  className="flex items-center gap-1 text-[11px] font-bold text-coral bg-[#FAF8F5] hover:bg-gray-100 border border-panelBorder px-2.5 py-1.5 rounded-lg transition-all"
                >
                  {detecting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-coral" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <span>📍 Auto-Detect</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="text" placeholder="Street Address" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 pl-10 text-sm text-gray-900 focus:outline-none focus:border-coral" />
              </div>
              <input required type="text" placeholder="Area / Locality" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-coral" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-coral" />
                <input required type="text" placeholder="Pincode" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-coral" />
                <div className="col-span-2 relative">
                  <input required type="text" list="signup-states-list" placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-coral" />
                  <datalist id="signup-states-list">
                    <option value="West Bengal" />
                    <option value="Jharkhand" />
                    <option value="Bihar" />
                    <option value="Delhi" />
                    <option value="Maharashtra" />
                    <option value="Karnataka" />
                    <option value="Tamil Nadu" />
                    <option value="Uttar Pradesh" />
                    <option value="Gujarat" />
                    <option value="Haryana" />
                    <option value="Punjab" />
                    <option value="Telangana" />
                  </datalist>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-[#5C1324] text-white py-3.5 rounded-xl font-bold mt-6 shadow-lg shadow-[#5C1324]/20 hover:bg-[#4A0F1D] transition-colors">
            {step === 1 ? 'Continue' : 'Create Account'}
          </button>

        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-emerald" />
          <span>Your data is encrypted and secure.</span>
        </div>
      </div>
    </div>
  );
}
