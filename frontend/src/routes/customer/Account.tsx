import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Plus, Trash2, Edit2, ChevronRight, Loader2, Key, LogOut } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Account() {
  const navigate = useNavigate();
  const { adminMode, userProfile, setUserProfile, setUserCoords, setIsLoggedIn, setAdminMode } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'admin_panel'>('profile');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [addresses, setAddresses] = useState<any[]>([]);
  
  useEffect(() => {
    if (userProfile) {
      setProfile({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || ''
      });
      if (userProfile.addresses) {
        setAddresses(userProfile.addresses.map((a: any, idx: number) => ({
          id: idx + 1,
          label: a.label || 'Primary Address',
          street: a.street,
          area: a.area,
          city: a.city,
          pincode: a.pincode,
          state: a.state || '',
          lat: a.lat || 0,
          lng: a.lng || 0,
          isDefault: a.isDefault !== undefined ? a.isDefault : a.is_default
        })));
      }
      setLoading(false);
    } else {
      const fetchProfile = async () => {
        try {
          const email = adminMode ? 'admin@quickstyle.io' : 'customer@example.com';
          const res = await fetch(`/api/v1/users/me?email=${email}`);
          if (res.ok) {
            const data = await res.json();
            setUserProfile(data);
            setProfile({ name: data.name, email: data.email, phone: data.phone || '' });
            setAddresses(data.addresses.map((a: any, idx: number) => ({
              id: idx + 1,
              label: a.label,
              street: a.street,
              area: a.area,
              city: a.city,
              pincode: a.pincode,
              state: a.state || '',
              lat: a.lat || 0,
              lng: a.lng || 0,
              isDefault: a.is_default
            })));
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [adminMode, userProfile]);

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', street: '', area: '', city: '', pincode: '', state: '', lat: 0, lng: 0 });
  const [fetchingLoc, setFetchingLoc] = useState(false);
  const [addingLoc, setAddingLoc] = useState(false);
  const [hasManualEdits, setHasManualEdits] = useState(false);

  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setFetchingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let area = '';
        let city = '';
        let state = '';
        let pincode = '';
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          if (data && data.address) {
            pincode = data.address.postcode || '';
            city = data.address.city || data.address.town || data.address.village || '';
            state = data.address.state || '';
            area = data.address.suburb || data.address.neighbourhood || data.address.residential || '';
          }
        } catch (err) {
          console.error("Reverse Geocoding failed", err);
        }

        setNewAddress(prev => ({ 
          ...prev, 
          lat: latitude, 
          lng: longitude,
          area: area || prev.area,
          city: city || prev.city,
          state: state || prev.state,
          pincode: pincode || prev.pincode
        }));
        setHasManualEdits(false);
        setFetchingLoc(false);
      },
      (error) => {
        alert("Unable to retrieve your location: " + error.message);
        setFetchingLoc(false);
      }
    );
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingLoc(true);
    
    let finalLat = newAddress.lat;
    let finalLng = newAddress.lng;

    // If live location wasn't fetched OR user made manual edits to location fields, use forward geocoding
    if (!finalLat || !finalLng || hasManualEdits) {
       const addressString = `${newAddress.street}, ${newAddress.area}, ${newAddress.city}, ${newAddress.state} ${newAddress.pincode}`;
       try {
         const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressString)}&format=json&limit=1`);
         const data = await res.json();
         if (data && data.length > 0) {
           finalLat = parseFloat(data[0].lat);
           finalLng = parseFloat(data[0].lon);
         }
       } catch (err) {
         console.error("Geocoding failed", err);
       }
    }

    const updatedAddresses = [...addresses, { ...newAddress, lat: finalLat, lng: finalLng, id: Date.now(), isDefault: addresses.length === 0 }];
    setAddresses(updatedAddresses);
    
    // Save back to the store
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        addresses: updatedAddresses.map(a => ({
          label: a.label,
          street: a.street,
          area: a.area,
          city: a.city,
          pincode: a.pincode,
          state: a.state,
          lat: a.lat,
          lng: a.lng,
          is_default: a.isDefault
        }))
      });
    }
    
    setShowAddAddress(false);
    setAddingLoc(false);
    setHasManualEdits(false);
    setNewAddress({ label: '', street: '', area: '', city: '', pincode: '', state: '', lat: 0, lng: 0 });
  };

  const setAsDefault = (id: number) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    
    const active = updated.find(a => a.isDefault);
    if (active && active.lat && active.lng) {
      setUserCoords({ lat: active.lat, lng: active.lng });
    }

    if (userProfile) {
      setUserProfile({
        ...userProfile,
        addresses: updated.map(a => ({
          label: a.label,
          street: a.street,
          area: a.area,
          city: a.city,
          pincode: a.pincode,
          state: a.state,
          lat: a.lat,
          lng: a.lng,
          is_default: a.isDefault
        }))
      });
    }
  };

  const handleDeleteAddress = (id: number) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        addresses: updated.map(a => ({
          label: a.label,
          street: a.street,
          area: a.area,
          city: a.city,
          pincode: a.pincode,
          state: a.state,
          lat: a.lat,
          lng: a.lng,
          is_default: a.isDefault
        }))
      });
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 py-12 px-4 animate-fade-in text-gray-900">
      {/* Left Column: Sidebar Card */}
      <div className="w-full md:w-72 flex-shrink-0 space-y-3">
        <div className="bg-white border-t-4 border-t-[#C5A880] border border-panelBorder rounded-2xl p-6 shadow-md text-center">
          <div className="w-20 h-20 bg-gray-50 border border-panelBorder rounded-full flex items-center justify-center text-[#C5A880] mx-auto mb-4 shadow-inner">
            <User className="w-10 h-10" />
          </div>
          <span className="font-label-caps text-[#C5A880] text-[9px] tracking-[0.2em] uppercase">MEMBER PROFILE</span>
          <h2 className="font-display-md text-gray-950 text-xl font-bold mt-1.5 break-all">{profile.name}</h2>
          <p className="font-body-base text-xs text-gray-500 mt-1">{profile.email}</p>
        </div>

        <nav className="space-y-1.5">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 border
              ${activeTab === 'profile' 
                ? 'bg-[#5C1324] border-[#5C1324] text-white shadow-md shadow-[#5C1324]/10' 
                : 'bg-white border-panelBorder text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-3">
              <User className="w-4.5 h-4.5" /> 
              <span className="font-bold text-sm">Personal Info</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>
          
          <button 
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 border
              ${activeTab === 'addresses' 
                ? 'bg-[#5C1324] border-[#5C1324] text-white shadow-md shadow-[#5C1324]/10' 
                : 'bg-white border-panelBorder text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4.5 h-4.5" /> 
              <span className="font-bold text-sm">Saved Addresses</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>
          
          {adminMode && (
            <button 
              onClick={() => setActiveTab('admin_panel')}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 border
                ${activeTab === 'admin_panel' 
                  ? 'bg-[#5C1324] border-[#5C1324] text-white shadow-md shadow-[#5C1324]/10' 
                  : 'bg-white border-panelBorder text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-3">
                <Edit2 className="w-4.5 h-4.5" /> 
                <span className="font-bold text-sm">Admin Panel</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          )}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-panelBorder">
          <button 
            onClick={() => {
              setIsLoggedIn(false);
              setAdminMode(false);
              setUserProfile(null);
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-red-600 font-bold hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4.5 h-4.5" /> 
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Right Column: Content Card */}
      <div className="flex-1 bg-white border border-panelBorder rounded-3xl p-8 md:p-10 shadow-lg min-h-[500px] flex flex-col justify-between">
        
        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fade-in flex-1">
            <div className="border-b border-panelBorder/50 pb-6">
              <span className="font-label-caps text-[#C5A880] text-[10px] tracking-[0.25em] uppercase">ATELIER DIRECT</span>
              <h3 className="font-display-md text-2xl font-bold text-gray-950 mt-1">Personal Details</h3>
              <p className="font-body-base text-sm text-gray-500 mt-1">Manage your private account details and address configurations.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label-caps text-[9px] text-gray-400 uppercase tracking-widest font-bold">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})} 
                  className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3.5 text-sm text-gray-900 focus:outline-none focus:border-coral transition-colors font-semibold" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-label-caps text-[9px] text-gray-400 uppercase tracking-widest font-bold">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  onChange={(e) => setProfile({...profile, email: e.target.value})} 
                  className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3.5 text-sm text-gray-900 focus:outline-none focus:border-coral transition-colors font-semibold" 
                />
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="font-label-caps text-[9px] text-gray-400 uppercase tracking-widest font-bold">Phone Number</label>
                <input 
                  type="tel" 
                  value={profile.phone} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})} 
                  className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3.5 text-sm text-gray-900 focus:outline-none focus:border-coral transition-colors font-semibold max-w-md" 
                />
              </div>
            </div>
            
            <div className="pt-6 border-t border-panelBorder/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <Key className="w-4 h-4 text-[#C5A880]" />
                <span>Password encrypted using secure hashing</span>
              </div>
              <button 
                onClick={() => {
                  if (userProfile) {
                    setUserProfile({ ...userProfile, ...profile });
                    alert("Profile updated successfully!");
                  }
                }}
                className="bg-[#5C1324] hover:bg-[#4A0F1D] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#5C1324]/20 hover:scale-[1.02] transition-all"
              >
                Save Details
              </button>
            </div>
          </div>
        )}

        {/* Addresses Tab Content */}
        {activeTab === 'addresses' && (
          <div className="space-y-8 animate-fade-in flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-panelBorder/50 pb-6">
              <div>
                <span className="font-label-caps text-[#C5A880] text-[10px] tracking-[0.25em] uppercase">SHIPPING LIST</span>
                <h3 className="font-display-md text-2xl font-bold text-gray-950 mt-1">Saved Addresses</h3>
                <p className="font-body-base text-sm text-gray-500 mt-1">Configure multiple delivery locations for your boutique items.</p>
              </div>
              <button 
                onClick={() => setShowAddAddress(true)} 
                className="flex items-center gap-2 bg-[#FAF8F5] text-coral hover:bg-gray-100 border border-panelBorder px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-panelBorder rounded-2xl bg-[#FAF8F5]/50">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">No saved addresses found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id} 
                    className={`p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between min-h-[160px]
                      ${addr.isDefault 
                        ? 'border-emerald/50 bg-emerald-light/10 shadow-sm' 
                        : 'border-panelBorder bg-[#FAF8F5]/30 hover:border-gray-300'}`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-950 text-sm uppercase tracking-wide">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="bg-emerald-500 text-white text-[8px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                        {addr.street}<br/>
                        {addr.area}, {addr.city} - {addr.pincode}<br/>
                        {addr.state}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-panelBorder/30 pt-3 mt-3">
                      {!addr.isDefault ? (
                        <button 
                          onClick={() => setAsDefault(addr.id)} 
                          className="text-[10px] font-bold text-emerald-600 hover:underline uppercase tracking-wider"
                        >
                          Set Default
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-widest">Active Address</span>
                      )}
                      
                      <button 
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Modal: Add New Address */}
            {showAddAddress && (
              <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 animate-slide-up shadow-2xl border border-panelBorder/50 text-gray-900">
                  <h3 className="font-display-md text-xl font-bold mb-6 text-gray-950 border-b border-panelBorder/40 pb-3">Add New Address</h3>
                  <form onSubmit={handleAddAddress} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="font-label-caps text-[8px] text-gray-400 tracking-wider block mb-1">LABEL</label>
                        <input required placeholder="e.g. Home, Office" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-coral" />
                      </div>
                      <div className="col-span-2">
                        <label className="font-label-caps text-[8px] text-gray-400 tracking-wider block mb-1">STREET ADDRESS</label>
                        <input required placeholder="Flat, Building, Road name" value={newAddress.street} onChange={e => { setNewAddress({...newAddress, street: e.target.value}); setHasManualEdits(true); }} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-coral" />
                      </div>
                      <div>
                        <label className="font-label-caps text-[8px] text-gray-400 tracking-wider block mb-1">AREA / LOCALITY</label>
                        <input required placeholder="Sector, Area, Ward" value={newAddress.area} onChange={e => { setNewAddress({...newAddress, area: e.target.value}); setHasManualEdits(true); }} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-coral" />
                      </div>
                      <div>
                        <label className="font-label-caps text-[8px] text-gray-400 tracking-wider block mb-1">PINCODE</label>
                        <input required placeholder="6-digit ZIP" value={newAddress.pincode} onChange={e => { setNewAddress({...newAddress, pincode: e.target.value}); setHasManualEdits(true); }} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-coral" />
                      </div>
                      <div>
                        <label className="font-label-caps text-[8px] text-gray-400 tracking-wider block mb-1">CITY</label>
                        <input required placeholder="City name" value={newAddress.city} onChange={e => { setNewAddress({...newAddress, city: e.target.value}); setHasManualEdits(true); }} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-coral" />
                      </div>
                      <div>
                        <label className="font-label-caps text-[8px] text-gray-400 tracking-wider block mb-1">STATE</label>
                        <input required placeholder="State name" value={newAddress.state} onChange={e => { setNewAddress({...newAddress, state: e.target.value}); setHasManualEdits(true); }} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-coral" />
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-6 border-t border-panelBorder/35 mt-6">
                      <button type="button" onClick={handleLiveLocation} disabled={fetchingLoc} className="flex-1 bg-coral hover:bg-coral-dark text-white py-3 rounded-xl font-bold text-[11px] shadow-lg transition-colors flex items-center justify-center gap-1">
                        {fetchingLoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />} 
                        {fetchingLoc ? 'Fetching...' : 'Live Location'}
                      </button>
                      <button type="submit" disabled={addingLoc} className="flex-1 bg-[#5C1324] hover:bg-[#4A0F1D] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#5C1324]/10 transition-colors flex items-center justify-center">
                        {addingLoc ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Address'}
                      </button>
                      <button type="button" onClick={() => setShowAddAddress(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Panel Tab Content */}
        {activeTab === 'admin_panel' && (
          <div className="space-y-8 animate-fade-in flex-1">
            <div className="border-b border-panelBorder/50 pb-6">
              <span className="font-label-caps text-[#C5A880] text-[10px] tracking-[0.25em] uppercase">SYSTEM ADMINISTRATION</span>
              <h3 className="font-display-md text-2xl font-bold text-gray-950 mt-1">Admin Dashboard</h3>
              <p className="font-body-base text-sm text-gray-500 mt-1">Manage boutique inventory and access AI registry tools.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="border border-panelBorder rounded-2xl p-6 bg-[#FAF8F5]/30 hover:border-[#5C1324]/50 transition-colors cursor-pointer group" onClick={() => navigate('/admin/add-product')}>
                  <div className="w-12 h-12 bg-[#5C1324]/10 text-[#5C1324] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <Plus className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Add New Product</h4>
                  <p className="text-sm text-gray-500">Register new inventory manually or use the AI Assistant for auto-generation.</p>
               </div>
               
               <div className="border border-panelBorder rounded-2xl p-6 bg-[#FAF8F5]/30 hover:border-[#5C1324]/50 transition-colors cursor-pointer group" onClick={() => navigate('/admin/logs')}>
                  <div className="w-12 h-12 bg-[#C5A880]/10 text-[#C5A880] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <Edit2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Analytics & Logs</h4>
                  <p className="text-sm text-gray-500">View real-time sales metrics and system logs.</p>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
