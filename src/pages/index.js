import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { Smartphone, Lock, ShieldCheck, Loader2, Users } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

export default function Landing() {
  const { user, login, register, loading } = useAuth();
  const router = useRouter();
  
  const [authMode, setAuthMode] = useState('LOGIN');
  const [formData, setFormData] = useState({ phone: '', password: '', confirmPass: '', refCode: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If user is already logged in, send them to the lobby immediately
    if (user && !loading) {
        router.push('/lobby');
    }
  }, [user, loading, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    if (!formData.phone || !formData.password) {
        setError("Please fill all fields");
        setIsSubmitting(false);
        return;
    }

    try {
        let result;
        if (authMode === 'LOGIN') {
            result = await login(formData.phone, formData.password);
        } else {
            if (formData.password !== formData.confirmPass) {
                setError("Passwords do not match");
                setIsSubmitting(false);
                return;
            }
            // Pass referral code to register function
            result = await register(formData.phone, formData.password, formData.refCode);
        }

        if (!result.success) {
            setError(result.error);
        }
    } catch (err) {
        setError("An unexpected connection error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-cyan-500 w-10 h-10" /></div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0b2e] to-[#000033]"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <GlassCard className="z-10 w-[90%] max-w-md p-8 shadow-[0_0_50px_rgba(139,92,246,0.3)] border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-sm tracking-tighter">SUROPARA</h1>
                <p className="text-xs tracking-[0.4em] text-gray-400 mt-2 font-bold uppercase">VIP Slot Casino</p>
            </div>

            <div className="flex bg-black/60 rounded-xl p-1 mb-8 border border-white/5 relative overflow-hidden">
                <div className={`absolute top-1 bottom-1 w-[48%] bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg transition-all duration-300 ${authMode === 'LOGIN' ? 'left-1' : 'left-[51%]'}`}></div>
                <button type="button" onClick={() => setAuthMode('LOGIN')} className="flex-1 py-3 rounded-lg text-xs font-bold relative z-10 transition-colors text-white">LOGIN</button>
                <button type="button" onClick={() => setAuthMode('REGISTER')} className="flex-1 py-3 rounded-lg text-xs font-bold relative z-10 transition-colors text-white">SIGN UP</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-xs text-center font-bold animate-pulse">{error}</div>}
                
                <div className="relative group">
                    <Smartphone className="absolute left-4 top-4 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-cyan-400" />
                    <span className="absolute left-12 top-4 text-gray-500 font-mono text-sm">+95</span>
                    <input 
                        name="phone"
                        type="tel" 
                        placeholder="9xxxxxxxxx" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-20 text-white focus:border-cyan-500 outline-none transition-all placeholder:text-gray-700 font-mono"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>
                
                <div className="relative group">
                    <Lock className="absolute left-4 top-4 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-cyan-400" />
                    <input 
                        name="password"
                        type="password" 
                        placeholder="Password" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 text-white focus:border-cyan-500 outline-none transition-all placeholder:text-gray-700"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>
                
                {authMode === 'REGISTER' && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 fade-in">
                        <div className="relative group">
                            <ShieldCheck className="absolute left-4 top-4 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-cyan-400" />
                            <input 
                                name="confirmPass"
                                type="password" 
                                placeholder="Confirm Password" 
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 text-white focus:border-cyan-500 outline-none transition-all placeholder:text-gray-700"
                                value={formData.confirmPass}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative group">
                            <Users className="absolute left-4 top-4 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-cyan-400" />
                            <input 
                                name="refCode"
                                type="text" 
                                placeholder="Referral Code (Optional)" 
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 text-white focus:border-cyan-500 outline-none transition-all placeholder:text-gray-700 uppercase font-mono"
                                value={formData.refCode}
                                onChange={(e) => setFormData({...formData, refCode: e.target.value.toUpperCase()})}
                            />
                            <div className="absolute right-4 top-4 text-[9px] text-green-400 font-bold bg-green-900/30 px-2 py-0.5 rounded border border-green-500/30">+500 MMK</div>
                        </div>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 py-4 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-transform mt-4 border border-white/20 hover:brightness-110 disabled:opacity-50 disabled:grayscale"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : (authMode === 'LOGIN' ? 'ENTER PARADISE' : 'JOIN VIP CLUB')}
                </button>
            </form>
        </GlassCard>
        
        <div className="absolute bottom-6 text-[10px] text-gray-600">v10.1.0 • Licensed in SuroVegas</div>
    </div>
  );
}