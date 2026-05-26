import React, { useState } from 'react';
import { User, MapPin, Plus, Trash2, Edit2, Shield, Settings, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Account() {
  const { adminMode } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
  
  // Mock Data
  const [profile, setProfile] = useState({
    name: adminMode ? "Admin User" : "Customer",
    email: adminMode ? "admin@quickstyle.io" : "customer@example.com",
    phone: "+91 98765 43000"
  });

  const [addresses, setAddresses] = useState([
    { id: 1, label: "Home", street: "Jadavpur University Road", area: "Jadavpur", city: "Kolkata", pincode: "700032", isDefault: true },
    { id: 2, label: "Office", street: "Sector V, Salt Lake", area: "Salt Lake", city: "Kolkata", pincode: "700091", isDefault: false }
  ]);

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', street: '', area: '', city: 'Kolkata', pincode: '' });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddresses([...addresses, { ...newAddress, id: Date.now(), isDefault: false }]);
    setShowAddAddress(false);
    setNewAddress({ label: '', street: '', area: '', city: 'Kolkata', pincode: '' });
  };

  const setAsDefault = (id: number) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 py-8 animate-fade-in">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-2">
        <div className="bg-white border border-panelBorder rounded-2xl p-6 mb-6">
          <div className="w-16 h-16 bg-lavender-deep rounded-full flex items-center justify-center text-coral mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="font-extrabold text-xl">{profile.name}</h2>
          <p className="text-sm text-gray-500">{profile.email}</p>
        </div>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-[#5C1324] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          <div className="flex items-center gap-3"><User className="w-5 h-5" /> <span className="font-semibold text-sm">Personal Info</span></div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>
        <button 
          onClick={() => setActiveTab('addresses')}
          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${activeTab === 'addresses' ? 'bg-[#5C1324] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          <div className="flex items-center gap-3"><MapPin className="w-5 h-5" /> <span className="font-semibold text-sm">Saved Addresses</span></div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white border border-panelBorder rounded-3xl p-6 md:p-8 min-h-[500px]">
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Personal Information</h3>
              <p className="text-sm text-gray-500">Manage your personal details and preferences.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm focus:outline-none focus:border-coral transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm focus:outline-none focus:border-coral transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm focus:outline-none focus:border-coral transition-colors" />
              </div>
            </div>
            
            <div className="pt-4 border-t border-panelBorder/50">
              <button className="bg-coral text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-coral/20 hover:scale-105 transition-transform">Save Changes</button>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Saved Addresses</h3>
                <p className="text-sm text-gray-500">Manage multiple delivery addresses.</p>
              </div>
              <button onClick={() => setShowAddAddress(true)} className="flex items-center gap-2 bg-[#FAF8F5] text-coral hover:bg-lavender border border-panelBorder px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                <Plus className="w-4 h-4" /> Add New
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className={`p-5 rounded-2xl border transition-all ${addr.isDefault ? 'border-emerald bg-emerald-dark/5' : 'border-panelBorder bg-white'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{addr.label}</span>
                      {addr.isDefault && <span className="bg-emerald text-white text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full">Default</span>}
                    </div>
                    <div className="flex gap-2 text-gray-400">
                      <button className="hover:text-coral transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button className="hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {addr.street}<br/>
                    {addr.area}, {addr.city} {addr.pincode}
                  </p>
                  {!addr.isDefault && (
                    <button onClick={() => setAsDefault(addr.id)} className="text-xs font-bold text-emerald hover:underline">Set as Default</button>
                  )}
                </div>
              ))}
            </div>
            
            {showAddAddress && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 animate-scale-up">
                  <h3 className="text-xl font-extrabold mb-6">Add New Address</h3>
                  <form onSubmit={handleAddAddress} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input required placeholder="Label (e.g. Home)" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="col-span-2 w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm" />
                      <input required placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="col-span-2 w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm" />
                      <input required placeholder="Area/Locality" value={newAddress.area} onChange={e => setNewAddress({...newAddress, area: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm" />
                      <input required placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm" />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button type="submit" className="flex-1 bg-[#5C1324] text-white py-3 rounded-xl font-bold">Save Address</button>
                      <button type="button" onClick={() => setShowAddAddress(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
