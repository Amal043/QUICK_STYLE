import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Login() {
  const navigate = useNavigate();
  const { setIsLoggedIn, setAdminMode, setUserProfile } = useStore();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isAdmin = formData.email === 'admin@quickstyle.io';
    if (isAdmin) {
      setAdminMode(true);
    }
    setUserProfile({
      name: isAdmin ? 'ADMIN USER' : formData.email.split('@')[0].toUpperCase(),
      email: formData.email,
      phone: '9876543210',
      addresses: [
        {
          label: 'Primary Address',
          street: '12 Luxury Boulevard',
          area: 'Salt Lake Sector V',
          city: 'Kolkata',
          pincode: '700091',
          state: 'West Bengal',
          is_default: true
        }
      ]
    });
    setIsLoggedIn(true);
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
      <div className="bg-white border border-panelBorder rounded-3xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 font-jakarta">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-2">Sign in to QUICK_STYLE.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-4 animate-fade-in">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 pl-10 text-sm text-gray-900 focus:outline-none focus:border-coral" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input required type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#FAF8F5] border border-panelBorder rounded-xl p-3 pl-10 text-sm text-gray-900 focus:outline-none focus:border-coral" />
            </div>
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-xs font-bold text-coral hover:underline">Forgot Password?</a>
          </div>

          <button type="submit" className="w-full bg-[#5C1324] text-white py-3.5 rounded-xl font-bold mt-6 shadow-lg shadow-[#5C1324]/20 hover:bg-[#4A0F1D] transition-colors">
            Sign In
          </button>
          
          <div className="text-center mt-4">
            <p className="text-xs text-gray-600">
              Don't have an account? <Link to="/signup" className="text-coral font-bold hover:underline">Sign up</Link>
            </p>
          </div>

        </form>

        <div className="mt-8 pt-6 border-t border-panelBorder flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-emerald" />
          <span>Secured with enterprise-grade encryption.</span>
        </div>
      </div>
    </div>
  );
}
