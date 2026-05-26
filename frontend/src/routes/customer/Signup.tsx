import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, MapPin } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    street: '', area: '', city: 'Kolkata', pincode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // Mock signup success
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
                <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 pl-10 text-sm focus:outline-none focus:border-coral" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 pl-10 text-sm focus:outline-none focus:border-coral" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 pl-10 text-sm focus:outline-none focus:border-coral" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Primary Delivery Address</h3>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="text" placeholder="Street Address" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 pl-10 text-sm focus:outline-none focus:border-coral" />
              </div>
              <input required type="text" placeholder="Area / Locality" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm focus:outline-none focus:border-coral" />
              <div className="flex gap-4">
                <input disabled type="text" value="Kolkata" className="w-1/2 bg-gray-100 border border-panelBorder rounded-xl p-3 text-sm text-gray-500 cursor-not-allowed" />
                <input required type="text" placeholder="Pincode" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-1/2 bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 text-sm focus:outline-none focus:border-coral" />
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
