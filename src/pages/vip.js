import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Crown, Gem, Star, Shield, Lock, MapPin, Zap, ArrowRight, Gift, Banknote } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import BottomDock from '../components/layout/BottomDock';
import { motion } from 'framer-motion';

// VIP Tiers mapped to V3 Island Deposit Requirements
const VIP_TIERS = [
    { name: 'GUEST', min: 0, max: 49999, color: 'text-gray-400', bg: 'bg-gray-900/40', border: 'border-gray-500/50', icon: Shield },
    { name: 'BRONZE', min: 50000, max: 99999, color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-500/50', icon: Star }, 
    { name: 'SILVER', min: 100000, max: 499999, color: 'text-gray-200', bg: 'bg-gray-700/40', border: 'border-gray-300/50', icon: Star }, 
    { name: 'GOLD', min: 500000, max: 999999, color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/50', icon: Crown }, 
    { name: 'DIAMOND', min: 1000000, max: 4999999, color: 'text-cyan-400', bg: 'bg-cyan-900/20', border: 'border-cyan-500/50', icon: Gem }, 
    { name: 'LEVIATHAN', min: 5000000, max: Infinity, color: 'text-purple-500', bg: 'bg-purple-900/20', border: 'border-purple-500/50', icon: Zap } 
];

const ISLAND_UNLOCKS = [
    { id: 1, name: 'Kyoto Zen', req: 0 },
    { id: 2, name: 'Okinawa Tropic', req: 50000 },
    { id: 3, name: 'Osaka Neon', req: 100000 },
    { id: 4, name: 'Tokyo Cyber', req: 500000 },
    { id: 5, name: 'Ginza Gold', req: 1000000 }
];

export default function VIPPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [currentTier, setCurrentTier] = useState(VIP_TIERS[0]);
    const [nextTier, setNextTier] = useState(VIP_TIERS[1]);

    useEffect(() => {
        if (user) {
            const deposited = parseFloat(user.total_deposited || 0);
            let current = VIP_TIERS[0];
            let next = VIP_TIERS[1];

            for (let i = 0; i < VIP_TIERS.length; i++) {
                if (deposited >= VIP_TIERS[i].min) {
                    current = VIP_TIERS[i];
                    next = VIP_TIERS[i + 1] || null;
                }
            }
            setCurrentTier(current);
            setNextTier(next);
        }
    }, [user]);

    if (loading) return <div className="bg-black min-h-screen text-cyan-500 flex items-center justify-center font-mono animate-pulse">Establishing Secure Link...</div>;
    if (!user) { router.push('/'); return null; }

    const deposited = parseFloat(user.total_deposited || 0);
    const progressToNext = nextTier ? Math.min(100, ((deposited - currentTier.min) / (nextTier.min - currentTier.min)) * 100) : 100;
    const amountToNext = nextTier ? nextTier.min - deposited : 0;

    const TierIcon = currentTier.icon;

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden">
            {/* Background */}
            <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${currentTier.bg.replace('/20', '/40').replace('/40', '/60')} via-black to-black pointer-events-none transition-colors duration-1000`} />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-[pulse_4s_infinite] pointer-events-none" />

            {/* Header */}
            <div className="p-6 pt-8 relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-white hover:text-cyan-400 transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-black text-white tracking-widest italic flex items-center gap-2">
                        <Crown className={currentTier.color} /> VIP CLUB
                    </h1>
                </div>
            </div>

            <div className="px-6 space-y-6 relative z-10">
                
                {/* 3D VIP Identity Card */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }}
                    whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ perspective: 1000 }}
                >
                    <GlassCard className={`p-6 border border-t-2 border-l-2 ${currentTier.border} ${currentTier.bg} relative overflow-hidden shadow-2xl transition-all duration-300`}>
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none animate-[shimmer_3s_infinite]" style={{ backgroundSize: '200% 200%' }}></div>
                        
                        <div className="absolute -right-6 -bottom-6 opacity-10">
                            <TierIcon size={150} className={currentTier.color} />
                        </div>
                        
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${currentTier.border} bg-black shadow-[0_0_15px_currentColor] ${currentTier.color}`}>
                                <TierIcon size={28} />
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mb-1 drop-shadow-md">Current Status</div>
                                <h2 className={`text-3xl font-black italic tracking-wider m-0 drop-shadow-[0_0_10px_currentColor] ${currentTier.color}`}>
                                    {currentTier.name}
                                </h2>
                            </div>
                        </div>

                        <div className="bg-black/60 rounded-xl p-4 border border-white/10 relative z-10 backdrop-blur-md">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Lifetime Deposits</div>
                                    <div className="text-xl font-mono font-bold text-white tracking-wide">{deposited.toLocaleString()} <span className="text-[10px] text-gray-500">MMK</span></div>
                                </div>
                                {nextTier && (
                                    <div className="text-right">
                                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1 justify-end">Next: <span className={nextTier.color}>{nextTier.name}</span></div>
                                        <div className="text-xs font-mono text-gray-300">{nextTier.min.toLocaleString()} MMK</div>
                                    </div>
                                )}
                            </div>

                            {nextTier ? (
                                <>
                                    <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-white/5 mb-2 relative">
                                        <motion.div 
                                            initial={{ width: 0 }} animate={{ width: `${progressToNext}%` }} transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full ${nextTier.bg.replace('/20', '').replace('/40', '')} ${nextTier.color.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor] relative`}
                                        >
                                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                                        </motion.div>
                                    </div>
                                    <div className="text-[9px] text-gray-400 text-center font-mono">
                                        Deposit <span className="text-white font-bold">{amountToNext.toLocaleString()} MMK</span> more to rank up.
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-xs text-purple-400 font-black tracking-widest mt-2 animate-pulse">
                                    <Zap size={14} className="inline mr-1"/> MAXIMUM VIP LEVEL REACHED
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Island Unlocks Tracker */}
                <div>
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2 tracking-widest uppercase">
                        <MapPin size={16} className="text-cyan-400"/> World Access Passes
                    </h3>
                    <div className="space-y-3">
                        {ISLAND_UNLOCKS.map((isl, idx) => {
                            const isUnlocked = deposited >= isl.req;
                            return (
                                <motion.div whileHover={isUnlocked ? { scale: 1.02 } : {}} key={idx}>
                                    <GlassCard className={`p-4 flex items-center justify-between transition-all duration-300 ${isUnlocked ? 'border-green-500/30 bg-green-900/10 hover:bg-green-900/20' : 'border-white/5 opacity-60 grayscale-[50%]'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${isUnlocked ? 'bg-green-950 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-gray-900 border-gray-700 text-gray-600'}`}>
                                                {isUnlocked ? <MapPin size={18}/> : <Lock size={18}/>}
                                            </div>
                                            <div>
                                                <div className={`font-black italic tracking-wider ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>{isl.name}</div>
                                                <div className="text-[9px] text-gray-500 font-mono">Req: {isl.req === 0 ? 'FREE' : `${isl.req.toLocaleString()} MMK`}</div>
                                            </div>
                                        </div>
                                        <div>
                                            {isUnlocked ? (
                                                <span className="bg-green-500/20 text-green-400 text-[9px] font-black px-3 py-1.5 rounded-full border border-green-500/30 shadow-inner">UNLOCKED</span>
                                            ) : (
                                                <span className="bg-gray-800 text-gray-500 text-[9px] font-black px-3 py-1.5 rounded-full border border-gray-700">LOCKED</span>
                                            )}
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* VIP Perks */}
                <div className="mt-8 p-5 rounded-2xl bg-black/60 border border-white/5 text-center backdrop-blur-sm shadow-xl">
                    <p className="font-bold text-gray-300 uppercase tracking-widest mb-4 flex justify-center items-center gap-2 text-xs">
                        <Gem size={14} className="text-purple-400"/> EXCLUSIVE TIER BENEFITS <Gem size={14} className="text-purple-400"/>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-colors flex gap-3">
                            <Banknote className="text-yellow-400 flex-shrink-0 mt-1" size={20}/>
                            <div>
                                <div className="text-yellow-400 font-bold text-xs mb-1">Higher Withdraw Limits</div>
                                <div className="text-[10px] text-gray-400 leading-relaxed">Higher VIP tiers unlock withdrawal limits up to 60,000,000 MMK daily.</div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors flex gap-3">
                            <Zap className="text-cyan-400 flex-shrink-0 mt-1" size={20}/>
                            <div>
                                <div className="text-cyan-400 font-bold text-xs mb-1">Priority Support</div>
                                <div className="text-[10px] text-gray-400 leading-relaxed">Your deposits & withdrawals skip the standard queue and are processed instantly.</div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-pink-500/30 transition-colors flex gap-3 md:col-span-2">
                            <Gift className="text-pink-400 flex-shrink-0 mt-1" size={20}/>
                            <div>
                                <div className="text-pink-400 font-bold text-xs mb-1">Exclusive Promotions</div>
                                <div className="text-[10px] text-gray-400 leading-relaxed">Gain access to secret weekend tournaments and premium gacha pools with enhanced UR drop rates.</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <BottomDock activeCharId={user?.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} />
        </div>
    );
}