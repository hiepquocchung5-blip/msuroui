import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ChevronLeft, Sparkles, Zap, Coins, Star, Hexagon, ArrowRight, Loader2, Target, FastForward } from 'lucide-react';
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
    
    // Add Local Pity State
    const [pityCount, setPityCount] = useState(user?.gacha_pity || 0);
    
    // Featured Character (Rotation)
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const featuredChars = ['cyber', 'kira', 'void', 'luna'];

    // Timers for animation skipping
    const flashTimer = useRef(null);
    const revealTimer = useRef(null);
    const pendingResult = useRef(null); // Store result for skip

    useEffect(() => {
        const interval = setInterval(() => {
            setFeaturedIndex(prev => (prev + 1) % featuredChars.length);
        }, 5000);
        return () => {
            clearInterval(interval);
            clearTimeout(flashTimer.current);
            clearTimeout(revealTimer.current);
        };
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
            // CRITICAL FIX: Point to the actual gacha endpoint, not island purchase
            const res = await api.post('/shop/gacha.php', { type: type });
            
            if (res.data.status !== 'success') {
                addToast(res.data.error || "Summon Failed", 'error');
                setAnimStage('idle');
                setIsSummoning(false);
                return;
            }

            pendingResult.current = res.data;

            // Artificial Delay for Suspense
            flashTimer.current = setTimeout(() => {
                setAnimStage('flash');
                playSound('bigwin'); // Flash sound
                
                revealTimer.current = setTimeout(() => {
                    executeReveal(pendingResult.current);
                }, 800); // White flash duration
            }, 2500); // Charging duration

        } catch (e) {
            console.error(e);
            addToast("Connection Error", 'error');
            setAnimStage('idle');
            setIsSummoning(false);
        }
    };

    // New: Skip Animation Feature
    const handleSkip = () => {
        if (animStage === 'charging' || animStage === 'flash') {
            playSound('click');
            clearTimeout(flashTimer.current);
            clearTimeout(revealTimer.current);
            if (pendingResult.current) {
                executeReveal(pendingResult.current);
            }
        }
    };

    const executeReveal = (data) => {
        setResult(data);
        updateBalance(data.new_balance);
        setPityCount(data.pity_count); // Sync pity from server
        setAnimStage('reveal');
        
        // Rarity Sound
        if (data.rarity === 'UR' || data.rarity === 'SSR') {
            playSound('bigwin');
        } else {
            playSound('win');
        }
    };

    const closeResult = () => {
        setResult(null);
        setAnimStage('idle');
        setIsSummoning(false);
        pendingResult.current = null;
    };

    if (loading || !user) return <div className="bg-black min-h-screen"/>;

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden flex flex-col">
            
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse pointer-events-none"></div>

            {/* Header */}
            <div className="p-6 pt-8 relative z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-white hover:text-purple-400 transition-colors active:scale-95">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 tracking-widest italic flex items-center gap-2 drop-shadow-md">
                        <Hexagon className="text-purple-500 fill-purple-500/20" /> STAR GATE
                    </h1>
                </div>
                <div className="bg-black/80 px-4 py-2 rounded-full border border-yellow-500/30 flex items-center gap-2 backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.15)] cursor-pointer hover:bg-black transition-colors" onClick={() => router.push('/wallet')}>
                    <Coins size={16} className="text-yellow-400" />
                    <span className="text-white font-mono font-black text-sm">{parseFloat(user.balance).toLocaleString()}</span>
                </div>
            </div>

            {/* Content Scroll */}
            <div className="flex-1 overflow-y-auto px-6 relative z-10 pt-4">
                
                {/* 1. Featured Banner */}
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-purple-500/30 mb-6 group bg-black shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-purple-900/50"></div>
                    
                    {/* Featured Character Render */}
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={featuredIndex}
                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -50, scale: 1.05 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute right-[-30px] top-[-30px] w-56 h-72 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        >
                            <CharacterSVG type={featuredChars[featuredIndex]} mood="win" />
                        </motion.div>
                    </AnimatePresence>

                    <div className="absolute bottom-6 left-6 z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse">RATE UP</span>
                            <span className="text-purple-300 text-[10px] font-bold tracking-widest uppercase">{featuredChars[featuredIndex]}</span>
                        </div>
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 italic drop-shadow-lg leading-none">
                            LEGENDARY<br/>ARRIVAL
                        </h2>
                    </div>
                </div>

                {/* --- PITY COUNTER BAR (SINGULARITY DRIVE) --- */}
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-2 px-1">
                        <span className={`text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 transition-colors ${pityCount >= 90 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
                            <Target size={12}/> Singularity Drive
                        </span>
                        <span className="text-xs font-mono font-black text-white">{pityCount} / 100</span>
                    </div>
                    <div className="w-full h-3 bg-black/80 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (pityCount / 100) * 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full shadow-[0_0_15px_cyan] ${pityCount >= 90 ? 'bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 animate-[shimmer_2s_linear_infinite]' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`}
                        />
                    </div>
                    <p className={`text-[9px] mt-2 text-center uppercase tracking-wider font-mono ${pityCount >= 90 ? 'text-red-500 animate-pulse font-bold' : 'text-gray-500'}`}>
                        {pityCount >= 90 ? "> CRITICAL MASS: UR ENTITY DETECTED <" : "Guaranteed UR Character at 100 Summons"}
                    </p>
                </div>

                {/* 2. Summon Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Standard Summon */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <GlassCard className="p-1 relative overflow-hidden group cursor-pointer border-blue-500/30 transition-all">
                            <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-blue-900/30 transition-colors"></div>
                            <div className="relative p-5 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-blue-950 border-2 border-blue-400/50 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(59,130,246,0.2)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all">
                                    <Sparkles size={28} className="text-blue-400 group-hover:rotate-12 transition-transform" />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-1 tracking-wider">STANDARD SCOUT</h3>
                                <p className="text-gray-400 text-xs mb-4">High chance for R & SR characters.</p>
                                
                                <button 
                                    onClick={() => handleSummon('standard')} 
                                    disabled={isSummoning}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all"
                                >
                                    <Coins size={16} className="text-yellow-300" /> 1,000
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Premium Summon */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <GlassCard className="p-1 relative overflow-hidden group cursor-pointer border-purple-500/30 transition-all">
                            <div className="absolute inset-0 bg-purple-900/10 group-hover:bg-purple-900/30 transition-colors"></div>
                            
                            {/* Circuit Effect */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 group-hover:opacity-30 transition-opacity mix-blend-color-dodge"></div>
                            
                            <div className="relative p-5 flex flex-col items-center text-center z-10">
                                <div className="w-16 h-16 rounded-full bg-purple-950 border-2 border-purple-400/50 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:shadow-[0_0_40px_rgba(168,85,247,0.8)] transition-all">
                                    <Zap size={28} className="text-purple-400 fill-current group-hover:scale-110 transition-transform" />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-1 tracking-wider italic">ELITE SCOUT</h3>
                                <p className="text-gray-400 text-xs mb-4">Increased SSR & UR drop rates.</p>
                                
                                <button 
                                    onClick={() => handleSummon('premium')} 
                                    disabled={isSummoning}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all"
                                >
                                    <Coins size={16} className="text-yellow-300" /> 5,000
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>

                </div>

                {/* Rates Info */}
                <div className="mt-8 p-4 rounded-xl bg-black/60 border border-white/5 text-[10px] text-gray-500 space-y-2 text-center backdrop-blur-sm">
                    <p className="font-bold text-gray-400 uppercase tracking-widest mb-1 flex justify-center items-center gap-2">
                        <Star size={10}/> DROP RATES (ELITE) <Star size={10}/>
                    </p>
                    <div className="flex justify-center gap-4 font-mono">
                        <span className="text-purple-400 font-bold drop-shadow-[0_0_5px_purple]">UR: 2%</span>
                        <span className="text-yellow-400 font-bold drop-shadow-[0_0_5px_yellow]">SSR: 8%</span>
                        <span className="text-blue-400 font-bold">SR: 30%</span>
                        <span className="text-gray-400">R: 60%</span>
                    </div>
                </div>
            </div>

            {/* --- SUMMONING SEQUENCE OVERLAY --- */}
            <AnimatePresence>
                {animStage !== 'idle' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
                    >
                        
                        {/* Skip Button */}
                        {(animStage === 'charging' || animStage === 'flash') && (
                            <button 
                                onClick={handleSkip}
                                className="absolute top-10 right-6 z-[110] bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 backdrop-blur-md border border-white/20 transition-all"
                            >
                                SKIP SEQUENCE <FastForward size={14} />
                            </button>
                        )}

                        {/* Stage 1: Charging (Warp Gate) */}
                        {animStage === 'charging' && (
                            <motion.div 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 2, opacity: 0, filter: "brightness(200%)" }}
                                transition={{ duration: 0.5 }}
                                className="relative flex flex-col items-center"
                            >
                                <div className="absolute inset-0 bg-purple-500 blur-[120px] opacity-30 animate-pulse pointer-events-none"></div>
                                
                                {/* Magic Tech Circle */}
                                <div className="relative w-64 h-64 flex items-center justify-center">
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/50 shadow-[0_0_30px_cyan]"
                                    />
                                    <motion.div 
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-4 rounded-full border border-pink-500/50 shadow-[0_0_20px_pink]"
                                    />
                                    <Hexagon size={80} className="text-white drop-shadow-[0_0_20px_white] animate-pulse" />
                                </div>
                                
                                <motion.div 
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="mt-12 text-center"
                                >
                                    <div className="text-cyan-400 font-mono font-bold tracking-[0.4em] text-sm drop-shadow-[0_0_5px_cyan]">ESTABLISHING LINK...</div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Stage 2: Flash */}
                        {animStage === 'flash' && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 bg-white z-50"
                            />
                        )}

                        {/* Stage 3: Reveal */}
                        {animStage === 'reveal' && result && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                                className="relative w-full h-full flex flex-col items-center justify-center"
                            >
                                {/* Dynamic Rarity Background */}
                                <div className={`absolute inset-0 z-0 
                                    ${result.rarity === 'UR' ? 'bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-purple-900 via-black to-purple-900' : 
                                      result.rarity === 'SSR' ? 'bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-yellow-900 via-black to-yellow-900' : 
                                      'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 to-black'}`}>
                                </div>
                                
                                {/* Overlay Particles for UR/SSR */}
                                {(result.rarity === 'UR' || result.rarity === 'SSR') && (
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-[spin_60s_linear_infinite] pointer-events-none z-0"></div>
                                )}

                                {/* Character Reveal */}
                                <motion.div 
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                                    className={`relative z-10 w-[85%] max-w-sm h-[60%] mb-4 filter 
                                        ${result.rarity === 'UR' ? 'drop-shadow-[0_0_50px_rgba(168,85,247,0.8)]' : 
                                          result.rarity === 'SSR' ? 'drop-shadow-[0_0_40px_rgba(234,179,8,0.6)]' : 
                                          'drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]'}`}
                                >
                                    <CharacterSVG type={result.character.char_key} mood="win" scale={1.2} />
                                </motion.div>

                                {/* Info Card UI */}
                                <motion.div 
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                    className="relative z-20 text-center w-[90%] max-w-sm"
                                >
                                    {/* Glitch effect on UR text */}
                                    <div className={`text-7xl font-black italic tracking-tighter mb-2 drop-shadow-2xl 
                                        ${result.rarity === 'UR' ? 'text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-pink-600 animate-pulse' : 
                                          result.rarity === 'SSR' ? 'text-yellow-400' : 'text-blue-400'}`}
                                    >
                                        {result.rarity}
                                    </div>
                                    
                                    <h2 className="text-4xl font-bold text-white mb-2 uppercase tracking-wide drop-shadow-md">
                                        {result.character.name}
                                    </h2>
                                    
                                    <div className="flex justify-center mb-6">
                                        {result.is_new ? (
                                            <span className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full animate-bounce shadow-[0_0_20px_red] tracking-widest">NEW ACQUISITION</span>
                                        ) : (
                                            <span className="bg-gray-800 text-gray-300 text-[10px] font-bold px-4 py-1.5 rounded-full border border-gray-600 tracking-widest shadow-inner">DUPLICATE CONVERTED</span>
                                        )}
                                    </div>

                                    <p className="text-xs text-cyan-300 font-mono mb-8 border-t border-white/10 pt-4 w-3/4 mx-auto leading-relaxed">
                                        {result.message}
                                    </p>

                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={closeResult}
                                        className="bg-white text-black font-black py-4 px-12 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center gap-2 mx-auto uppercase tracking-widest text-sm"
                                    >
                                        CONTINUE <ArrowRight size={18}/>
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomDock activeCharId={user.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} onOpenBank={() => router.push('/wallet')} />
        </div>
    );
}