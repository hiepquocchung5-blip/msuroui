import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ChevronLeft, Sparkles, Zap, Coins, Star, Hexagon, Layers, ArrowRight } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import CharacterSVG from '../components/visuals/CharacterSVG';
import BottomDock from '../components/layout/BottomDock';
import { useGameSound } from '../hooks/useGameSound';

export default function ShopPage() {
    const { user, loading, updateBalance } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const { playSound } = useGameSound();

    // State
    const [isSummoning, setIsSummoning] = useState(false);
    const [animStage, setAnimStage] = useState('idle'); // idle, charging, flash, reveal
    const [result, setResult] = useState(null); // { character, rarity, is_new }
    
    // Featured Character (Rotation)
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const featuredChars = ['cyber', 'kira', 'void'];

    useEffect(() => {
        const interval = setInterval(() => {
            setFeaturedIndex(prev => (prev + 1) % featuredChars.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSummon = async (type) => {
        const cost = type === 'premium' ? 5000 : 1000;
        if (parseFloat(user.balance) < cost) {
            addToast("Insufficient Funds. Win more or Deposit!", 'error');
            return;
        }

        setIsSummoning(true);
        setAnimStage('charging');
        playSound('spin'); // Reuse spin sound for charging

        try {
            // API Call
            const res = await api.post('/shop/purchase.php', { type: 'gacha', tier: type });
            
            // Artificial Delay for Suspense
            setTimeout(() => {
                setAnimStage('flash');
                playSound('bigwin'); // Flash sound
                
                setTimeout(() => {
                    if (res.data.status === 'success') {
                        setResult(res.data);
                        updateBalance(res.data.new_balance);
                        setAnimStage('reveal');
                        
                        // Rarity Sound
                        if (res.data.rarity === 'UR' || res.data.rarity === 'SSR') {
                            playSound('bigwin');
                        }
                    } else {
                        addToast(res.data.error || "Summon Failed", 'error');
                        setAnimStage('idle');
                        setIsSummoning(false);
                    }
                }, 800); // White flash duration
            }, 2500); // Charging duration

        } catch (e) {
            console.error(e);
            addToast("Connection Error", 'error');
            setAnimStage('idle');
            setIsSummoning(false);
        }
    };

    const closeResult = () => {
        setResult(null);
        setAnimStage('idle');
        setIsSummoning(false);
    };

    if (loading || !user) return <div className="bg-black min-h-screen"/>;

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden flex flex-col">
            
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>

            {/* Header */}
            <div className="p-6 pt-8 relative z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-white hover:text-purple-400 transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-black text-white tracking-widest italic flex items-center gap-2">
                        <Hexagon className="text-purple-500 fill-purple-500/20" /> STAR GATE
                    </h1>
                </div>
                <div className="bg-black/50 px-3 py-1 rounded-full border border-yellow-500/30 flex items-center gap-2 backdrop-blur-md">
                    <Coins size={14} className="text-yellow-400" />
                    <span className="text-white font-mono font-bold text-xs">{parseFloat(user.balance).toLocaleString()}</span>
                </div>
            </div>

            {/* Content Scroll */}
            <div className="flex-1 overflow-y-auto px-6 relative z-10">
                
                {/* 1. Featured Banner */}
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-white/10 mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-purple-900/50"></div>
                    
                    {/* Featured Character Render */}
                    <div className="absolute right-[-20px] top-[-20px] w-48 h-64 transition-transform duration-700 ease-in-out group-hover:scale-105">
                         <CharacterSVG type={featuredChars[featuredIndex]} mood="win" />
                    </div>

                    <div className="absolute bottom-6 left-6">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse">RATE UP</span>
                            <span className="text-purple-300 text-[10px] font-bold tracking-widest uppercase">{featuredChars[featuredIndex]}</span>
                        </div>
                        <h2 className="text-2xl font-black text-white italic drop-shadow-lg">LEGENDARY<br/>ARRIVAL</h2>
                    </div>
                </div>

                {/* 2. Summon Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Standard Summon */}
                    <GlassCard className="p-1 relative overflow-hidden group cursor-pointer border-blue-500/30 hover:border-blue-400/60 transition-all">
                        <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-blue-900/20 transition-colors"></div>
                        <div className="relative p-5 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-950 border-2 border-blue-400/50 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                                <Sparkles size={28} className="text-blue-400" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1">STANDARD SCOUT</h3>
                            <p className="text-gray-400 text-xs mb-4">High chance for R & SR characters.</p>
                            
                            <button 
                                onClick={() => handleSummon('standard')} 
                                disabled={isSummoning}
                                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black text-sm shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <Coins size={14} className="text-yellow-300" /> 1,000
                            </button>
                        </div>
                    </GlassCard>

                    {/* Premium Summon */}
                    <GlassCard className="p-1 relative overflow-hidden group cursor-pointer border-purple-500/30 hover:border-purple-400/60 transition-all">
                        <div className="absolute inset-0 bg-purple-900/10 group-hover:bg-purple-900/20 transition-colors"></div>
                        
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-shimmer pointer-events-none"></div>

                        <div className="relative p-5 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-purple-950 border-2 border-purple-400/50 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                                <Zap size={28} className="text-purple-400 fill-current" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1">ELITE SCOUT</h3>
                            <p className="text-gray-400 text-xs mb-4">Increased SSR & UR rates.</p>
                            
                            <button 
                                onClick={() => handleSummon('premium')} 
                                disabled={isSummoning}
                                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <Coins size={14} className="text-yellow-300" /> 5,000
                            </button>
                        </div>
                    </GlassCard>

                </div>

                {/* Rates Info */}
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-[10px] text-gray-500 space-y-1 text-center">
                    <p className="font-bold text-gray-400 mb-2 uppercase tracking-widest">DROP RATES (ELITE)</p>
                    <div className="flex justify-center gap-4">
                        <span className="text-purple-400 font-bold">UR: 2%</span>
                        <span className="text-yellow-400 font-bold">SSR: 8%</span>
                        <span className="text-blue-400 font-bold">SR: 30%</span>
                        <span className="text-gray-400">R: 60%</span>
                    </div>
                </div>
            </div>

            {/* --- SUMMONING SEQUENCE OVERLAY --- */}
            {animStage !== 'idle' && (
                <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center overflow-hidden">
                    
                    {/* Stage 1: Charging */}
                    {animStage === 'charging' && (
                        <div className="relative flex flex-col items-center">
                            <div className="absolute inset-0 bg-purple-500 blur-[100px] opacity-20 animate-pulse"></div>
                            
                            {/* Magic Circle */}
                            <div className="w-64 h-64 rounded-full border-2 border-purple-500/50 flex items-center justify-center animate-[spin_3s_linear_infinite]">
                                <div className="w-48 h-48 border border-cyan-500/50 rotate-45"></div>
                                <div className="w-48 h-48 border border-pink-500/50 -rotate-45 absolute"></div>
                            </div>
                            
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <Hexagon size={64} className="text-white animate-bounce" />
                            </div>
                            
                            <div className="mt-12 text-center">
                                <div className="text-purple-300 font-mono tracking-[0.3em] text-sm animate-pulse">SYNCHRONIZING...</div>
                            </div>
                        </div>
                    )}

                    {/* Stage 2: Flash */}
                    {animStage === 'flash' && (
                        <div className="absolute inset-0 bg-white animate-out fade-out duration-1000 fill-mode-forwards"></div>
                    )}

                    {/* Stage 3: Reveal */}
                    {animStage === 'reveal' && result && (
                        <div className="relative w-full h-full flex flex-col items-center justify-center animate-in zoom-in duration-500">
                            
                            {/* Rarity Rays */}
                            <div className={`absolute inset-0 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] opacity-40 z-0 
                                ${result.rarity === 'UR' ? 'from-purple-500 to-black' : 
                                  result.rarity === 'SSR' ? 'from-yellow-500 to-black' : 
                                  'from-blue-500 to-black'}`}>
                            </div>

                            {/* Character */}
                            <div className="relative z-10 w-[80%] h-[60%] mb-4 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                <CharacterSVG type={result.character.char_key} mood="win" />
                            </div>

                            {/* Info Card */}
                            <div className="relative z-20 text-center w-[90%] max-w-sm">
                                <div className={`text-5xl font-black italic tracking-tighter mb-2 drop-shadow-xl 
                                    ${result.rarity === 'UR' ? 'text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-purple-600' : 
                                      result.rarity === 'SSR' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                    {result.rarity}
                                </div>
                                
                                <h2 className="text-3xl font-bold text-white mb-2 uppercase">{result.character.name}</h2>
                                
                                {result.is_new ? (
                                    <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce inline-block mb-4">NEW!</span>
                                ) : (
                                    <span className="bg-gray-700 text-gray-300 text-[10px] font-bold px-3 py-1 rounded-full inline-block mb-4">DUPLICATE CONVERTED</span>
                                )}

                                <p className="text-xs text-gray-300 mb-8 border-t border-white/10 pt-4 w-2/3 mx-auto">
                                    {result.message}
                                </p>

                                <button 
                                    onClick={closeResult}
                                    className="bg-white text-black font-black py-4 px-12 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
                                >
                                    CONTINUE <ArrowRight size={16}/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <BottomDock activeCharId={user.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} onOpenBank={() => router.push('/wallet')} />
        </div>
    );
}