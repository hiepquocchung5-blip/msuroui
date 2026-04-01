import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Lock, ShieldCheck, Loader2, Users, Hexagon } from 'lucide-react';
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
        setError("ကျေးဇူးပြု၍ အချက်အလက်များ ပြည့်စုံစွာထည့်ပါ (Please fill all fields)");
        setIsSubmitting(false);
        return;
    }

    try {
        let result;
        if (authMode === 'LOGIN') {
            result = await login(formData.phone, formData.password);
        } else {
            if (formData.password !== formData.confirmPass) {
                setError("စကားဝှက်များ မကိုက်ညီပါ (Passwords do not match)");
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
        setError("ချိတ်ဆက်မှု ပြတ်တောက်သွားပါသည် (Connection error occurred)");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#050505]">
              <Loader2 className="animate-spin text-cyan-500 w-12 h-12 drop-shadow-[0_0_15px_rgba(0,243,255,0.8)]" />
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] relative overflow-hidden bg-[#050505] font-sans selection:bg-cyan-500 selection:text-black p-4">
        
        {/* --- CIRCUIT CHAOS BACKGROUND --- */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0514] to-[#000022] z-0"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
        <div className="absolute top-[-20%] right-[-20%] w-[70%] h-[70%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-[70%] h-[70%] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
        
        <GlassCard className="z-10 w-full max-w-md p-6 sm:p-8 shadow-[0_0_50px_rgba(139,92,246,0.15)] border-cyan-500/20 bg-black/60 backdrop-blur-xl relative overflow-hidden">
            
            {/* Inner Glitch Detail */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 mix-blend-screen pointer-events-none"></div>

            {/* BRAND HEADER */}
            <div className="text-center mb-8 relative z-10">
                <div className="flex justify-center mb-3">
                    <div className="relative flex items-center justify-center">
                        <Hexagon size={50} className="text-cyan-400 absolute animate-pulse drop-shadow-[0_0_15px_rgba(0,243,255,0.8)]" strokeWidth={1} />
                        <Hexagon size={40} className="text-purple-500 animate-[spin_10s_linear_infinite]" strokeWidth={1.5} />
                    </div>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 tracking-tighter italic drop-shadow-md">
                    SUROPARA
                </h1>
                <p className="text-[10px] tracking-[0.3em] text-cyan-300/70 mt-1 font-bold uppercase">
                    VIP စလော့ကာစီနို
                </p>
            </div>

            {/* AUTH TOGGLE */}
            <div className="flex bg-black/80 rounded-xl p-1 mb-8 border border-white/10 relative overflow-hidden shadow-inner">
                <div className={`absolute top-1 bottom-1 w-[48%] bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg transition-all duration-300 shadow-[0_0_10px_cyan] ${authMode === 'LOGIN' ? 'left-1' : 'left-[51%]'}`}></div>
                <button type="button" onClick={() => setAuthMode('LOGIN')} className={`flex-1 py-3 rounded-lg text-xs font-bold relative z-10 transition-colors flex flex-col items-center justify-center gap-0.5 ${authMode === 'LOGIN' ? 'text-white drop-shadow-md' : 'text-gray-500'}`}>
                    <span>အကောင့်ဝင်ရန်</span>
                    <span className="text-[9px] uppercase tracking-widest opacity-80">Login</span>
                </button>
                <button type="button" onClick={() => setAuthMode('REGISTER')} className={`flex-1 py-3 rounded-lg text-xs font-bold relative z-10 transition-colors flex flex-col items-center justify-center gap-0.5 ${authMode === 'REGISTER' ? 'text-white drop-shadow-md' : 'text-gray-500'}`}>
                    <span>အကောင့်ဖွင့်ရန်</span>
                    <span className="text-[9px] uppercase tracking-widest opacity-80">Register</span>
                </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-red-400 text-xs text-center font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* PHONE INPUT */}
                <div className="relative group">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-cyan-400" />
                    <span className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm border-r border-gray-700 pr-2">+95</span>
                    <input 
                        name="phone"
                        type="tel" 
                        placeholder="9xxxxxxxxx" 
                        className="w-full bg-black/60 border border-white/10 rounded-xl py-3.5 pl-[85px] pr-4 text-white focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] outline-none transition-all placeholder:text-gray-700 font-mono text-base"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <div className="absolute -top-2 left-4 px-1 bg-black text-[9px] text-cyan-500 font-bold uppercase tracking-widest">ဖုန်းနံပါတ် / Phone</div>
                </div>
                
                {/* PASSWORD INPUT */}
                <div className="relative group mt-5">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-cyan-400" />
                    <input 
                        name="password"
                        type="password" 
                        placeholder="••••••" 
                        className="w-full bg-black/60 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] outline-none transition-all placeholder:text-gray-700 text-base tracking-widest"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <div className="absolute -top-2 left-4 px-1 bg-black text-[9px] text-cyan-500 font-bold uppercase tracking-widest">စကားဝှက် / Password</div>
                </div>
                
                {/* DYNAMIC REGISTRATION FIELDS */}
                <AnimatePresence>
                    {authMode === 'REGISTER' && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="space-y-5 overflow-hidden"
                        >
                            <div className="relative group pt-1">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-purple-400" />
                                <input 
                                    name="confirmPass"
                                    type="password" 
                                    placeholder="••••••" 
                                    className="w-full bg-black/60 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] outline-none transition-all placeholder:text-gray-700 text-base tracking-widest"
                                    value={formData.confirmPass}
                                    onChange={handleChange}
                                />
                                <div className="absolute -top-2 left-4 px-1 bg-black text-[9px] text-purple-400 font-bold uppercase tracking-widest">အတည်ပြုပါ / Confirm</div>
                            </div>

                            <div className="relative group">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-green-400" />
                                <input 
                                    name="refCode"
                                    type="text" 
                                    placeholder="e.g. XY123" 
                                    className="w-full bg-black/60 border border-white/10 rounded-xl py-3.5 pl-12 pr-[80px] text-white focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.2)] outline-none transition-all placeholder:text-gray-700 uppercase font-mono text-base"
                                    value={formData.refCode}
                                    onChange={(e) => setFormData({...formData, refCode: e.target.value.toUpperCase()})}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-green-400 font-black bg-green-950/80 px-2 py-1 rounded shadow-inner border border-green-500/30">+500 MMK</div>
                                <div className="absolute -top-2 left-4 px-1 bg-black text-[9px] text-green-400 font-bold uppercase tracking-widest">ဖိတ်ခေါ်ကုဒ် / Referral</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SUBMIT BUTTON */}
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 py-4 rounded-xl font-black text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all mt-6 border border-cyan-300/50 hover:brightness-110 disabled:opacity-50 disabled:grayscale flex flex-col items-center justify-center gap-0.5"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-white"/>
                    ) : (
                        <>
                            <span className="tracking-widest text-sm">
                                {authMode === 'LOGIN' ? 'ဂိမ်းထဲသို့ ဝင်မည်' : 'အကောင့်သစ် ဖွင့်မည်'}
                            </span>
                            <span className="text-[9px] uppercase tracking-[0.3em] opacity-80">
                                {authMode === 'LOGIN' ? 'Enter Paradise' : 'Initialize Account'}
                            </span>
                        </>
                    )}
                </button>
            </form>
        </GlassCard>
        
        {/* FOOTER */}
        <div className="absolute bottom-6 flex flex-col items-center gap-1 z-10 pointer-events-none">
            <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_green]"></span> 
                Secure Matrix v10.1.0
            </div>
            <div className="text-[9px] text-gray-600 font-mono tracking-widest">Licensed in SuroVegas</div>
        </div>
    </div>
  );
}