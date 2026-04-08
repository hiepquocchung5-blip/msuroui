import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; 
import api, { game, user as userApi } from '../services/api';

import { 
    ChevronLeft, ChevronRight, Lock, Coins, MapPin, Loader2, 
    Bell, Trophy, Calendar, ClipboardList, Activity, Layers, 
    Sparkles, Zap, AlertTriangle, ShieldAlert 
} from 'lucide-react';

import CharacterSVG from '../components/visuals/CharacterSVG';
import CabinetSVG from '../components/visuals/CabinetSVG';
import IslandLandscapeSVG from '../components/visuals/IslandLandscapeSVG';
import SymbolSVG from '../components/visuals/SymbolSVG';
import BottomDock from '../components/layout/BottomDock';
import DailyBonusModal from '../components/game/DailyBonusModal';
import GlobalTicker from '../components/ui/GlobalTicker';
import ActiveEvents from '../components/ui/ActiveEvents';
import { useGameSound } from '../hooks/useGameSound';

// --- LEVIATHAN GJP MATRIX (V7.11 PARITY) ---
const GJP_THRESHOLDS = {
    1: { base: 3000000, trigger: 3600000, max: 7200000 },
    2: { base: 4000000, trigger: 4500000, max: 8100000 },
    3: { base: 5000000, trigger: 6000000, max: 10000000 },
    4: { base: 7500000, trigger: 9000000, max: 15000000 },
    5: { base: 10000000, trigger: 12000000, max: 20000000 }
};

// --- Local Rollup Counter for Jackpot ---
const RollupNumber = ({ value }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = count;
        const end = parseInt(value) || 0;
        if (start === end) { setCount(end); return; }
        if (end === 0) { setCount(0); return; }
        
        let timer = setInterval(() => {
            const step = Math.ceil(Math.abs(end - start) / 20) || 1;
            if (start < end) {
                start += step;
                if (start >= end) { setCount(end); clearInterval(timer); } else setCount(start);
            } else {
                start -= step;
                if (start <= end) { setCount(end); clearInterval(timer); } else setCount(start);
            }
        }, 30);
        return () => clearInterval(timer);
    }, [value, count]);
    return <>{count.toLocaleString()}</>;
};

// --- DYNAMIC FLOATING SYMBOL MATRIX ---
const FloatingSymbols = () => {
    const [particles, setParticles] = useState([]);
    
    useEffect(() => {
        const generated = Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            symId: Math.floor(Math.random() * 6) + 2,
            islandId: Math.floor(Math.random() * 5) + 1,
            size: Math.random() * 40 + 20,
            left: Math.random() * 100,
            delay: Math.random() * 10,
            duration: Math.random() * 15 + 15
        }));
        setParticles(generated);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen opacity-30">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.left}%`,
                        bottom: '-10%',
                        filter: 'blur(2px)'
                    }}
                    animate={{
                        y: ['0vh', '-120vh'],
                        x: [0, Math.random() * 100 - 50, 0],
                        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay
                    }}
                >
                    <SymbolSVG id={p.symId} islandId={p.islandId} variant="dim" />
                </motion.div>
            ))}
        </div>
    );
};

// --- FRAMER MOTION CAROUSEL CONFIG (Heavy AAA Physics) ---
const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.85,
        rotateY: direction > 0 ? 45 : -45,
        zIndex: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
        rotateY: 0,
        transition: {
            x: { type: "spring", stiffness: 200, damping: 22 },
            opacity: { duration: 0.3 },
            rotateY: { type: "spring", stiffness: 200, damping: 22 },
            scale: { duration: 0.4, ease: "easeOut" }
        }
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.85,
        rotateY: direction < 0 ? 45 : -45,
        transition: {
            x: { type: "spring", stiffness: 200, damping: 22 },
            opacity: { duration: 0.3 }
        }
    })
};

export default function Lobby() {
    const { user, loading, updateBalance } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const { playSound } = useGameSound();
    
    const [islands, setIslands] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // Live Ticker State
    const [jackpotAmount, setJackpotAmount] = useState(3000000);
    const [activePlayers, setActivePlayers] = useState(0);
    const prevJackpotRef = useRef(null);
    
    const [showJpCelebration, setShowJpCelebration] = useState(false);
    const [userStats, setUserStats] = useState({ totalDeposited: 0 });
    
    const [showDailyBonus, setShowDailyBonus] = useState(false);
    const [serverPing, setServerPing] = useState(true);

    const selectedIsland = islands.length > 0 ? islands[currentIndex] : null;

    // --- FETCH LIVE DATA & APPLY ISLAND THEMES ---
    useEffect(() => {
        const initLobby = async () => {
            try {
                const [resIslands, resNotifs, resProfile] = await Promise.all([
                    game.getIslands(), 
                    userApi.getNotifications(), 
                    userApi.getProfile()
                ]);

                if (resIslands.data.status === 'success') {
                    const progressionIslands = resIslands.data.data.map(island => {
                        let reqDeposit = parseFloat(island.req_deposit) || 0;
                        let totalMachines = 0;
                        
                        let theme = { 
                            bgGrad: 'from-gray-900/40', border: 'border-gray-500/50', hoverBorder: 'hover:border-gray-400', 
                            shadow: 'shadow-[0_0_30px_rgba(156,163,175,0.3)]', text: 'text-gray-400', bgBadge: 'bg-gray-950/80', accentColor: '#9ca3af'
                        };

                        switch(parseInt(island.id)) {
                            case 1: totalMachines = 900; theme = { bgGrad: 'from-red-900/60', border: 'border-red-500/50', hoverBorder: 'hover:border-red-400', shadow: 'shadow-[0_0_50px_rgba(239,68,68,0.5)]', text: 'text-red-400', bgBadge: 'bg-red-950/80', accentColor: '#ef4444' }; break;
                            case 2: totalMachines = 720; theme = { bgGrad: 'from-blue-900/60', border: 'border-cyan-500/50', hoverBorder: 'hover:border-cyan-400', shadow: 'shadow-[0_0_50px_rgba(6,182,212,0.5)]', text: 'text-cyan-400', bgBadge: 'bg-cyan-950/80', accentColor: '#06b6d4' }; break;
                            case 3: totalMachines = 540; theme = { bgGrad: 'from-orange-900/60', border: 'border-orange-500/50', hoverBorder: 'hover:border-orange-400', shadow: 'shadow-[0_0_50px_rgba(249,115,22,0.5)]', text: 'text-orange-400', bgBadge: 'bg-orange-950/80', accentColor: '#f97316' }; break;
                            case 4: totalMachines = 360; theme = { bgGrad: 'from-pink-900/60', border: 'border-pink-500/50', hoverBorder: 'hover:border-pink-400', shadow: 'shadow-[0_0_50px_rgba(236,72,153,0.5)]', text: 'text-pink-400', bgBadge: 'bg-pink-950/80', accentColor: '#ec4899' }; break;
                            case 5: totalMachines = 180; theme = { bgGrad: 'from-purple-900/60', border: 'border-purple-500/50', hoverBorder: 'hover:border-purple-400', shadow: 'shadow-[0_0_50px_rgba(168,85,247,0.5)]', text: 'text-purple-400', bgBadge: 'bg-purple-950/80', accentColor: '#a855f7' }; break;
                            default: totalMachines = 200;
                        }
                        return { ...island, reqDeposit, totalMachines, theme };
                    });
                    setIslands(progressionIslands);
                }
                
                if (resNotifs.data.status === 'success') setUnreadCount(resNotifs.data.count || 0);
                
                if (resProfile.data.status === 'success') {
                    const deposited = parseFloat(resProfile.data.user.total_deposited) || 0;
                    setUserStats({ totalDeposited: deposited });
                }

                if (user) {
                    const lastClaimStr = localStorage.getItem(`daily_claim_time_${user.id}`);
                    const now = new Date().getTime();
                    if (!lastClaimStr || (now - parseInt(lastClaimStr) > 86400000)) {
                        setTimeout(() => setShowDailyBonus(true), 1500);
                    }
                }
            } catch (e) { 
                setServerPing(false);
            }
        };

        if (!loading && user) initLobby();
    }, [loading, user]);

    // Snap Jackpot baseline immediately on carousel change
    useEffect(() => {
        if (selectedIsland) {
            const limits = GJP_THRESHOLDS[selectedIsland.id] || GJP_THRESHOLDS[1];
            // If the current jackpot visually looks completely wrong for this island, snap it to base
            if (jackpotAmount < limits.base || jackpotAmount > limits.max + 1000000) {
                setJackpotAmount(limits.base);
            }
        }
    }, [selectedIsland?.id]);

    // --- ISLAND-SPECIFIC JACKPOT POLLING ---
    useEffect(() => {
        const fetchIslandJackpot = async () => {
            if (!selectedIsland?.id) return;
            try {
                const response = await api.get(`/game/ticker.php?island_id=${selectedIsland.id}`);
                
                if (response.data.status === 'success' && response.data.jackpot_amount) {
                    const newJp = parseFloat(response.data.jackpot_amount);
                    
                    if (prevJackpotRef.current !== null && (newJp - prevJackpotRef.current > 500000)) {
                        playSound('bigwin');
                        setShowJpCelebration(true);
                        setTimeout(() => setShowJpCelebration(false), 8000);
                    }
                    
                    setJackpotAmount(newJp);
                    prevJackpotRef.current = newJp;
                    setServerPing(true);
                    setActivePlayers(Math.floor(Math.random() * 500) + 1200); 
                }
            } catch (e) { setServerPing(false); }
        };

        fetchIslandJackpot(); 
        const interval = setInterval(fetchIslandJackpot, 10000); 
        return () => clearInterval(interval);
    }, [selectedIsland?.id, playSound]);

    // --- CAROUSEL NAVIGATION ---
    const paginate = useCallback((newDirection) => {
        if (islands.length === 0) return;
        playSound('click');
        setDirection(newDirection);
        setCurrentIndex((prev) => (prev + newDirection + islands.length) % islands.length);
    }, [islands.length, playSound]);

    const handleDragEnd = (e, { offset, velocity }) => {
        const swipe = swipePower(offset.x, velocity.x);
        if (swipe < -swipeConfidenceThreshold) paginate(1);
        else if (swipe > swipeConfidenceThreshold) paginate(-1);
    };

    const isOwned = selectedIsland ? (selectedIsland.id === 1 || selectedIsland.reqDeposit === 0 || userStats.totalDeposited >= selectedIsland.reqDeposit) : false;

    const handleEnter = async (island) => {
        playSound('click');
        if (!isOwned) {
            addToast(`Deposit required to breach this sector.`, 'info');
            return;
        }
        router.push(`/game/${island.id}`);
    };

    if (loading || islands.length === 0) return <div className="bg-[#050505] min-h-screen" />;

    // --- EXACT DYNAMIC GJP THRESHOLD LOGIC ---
    const gjpLimits = GJP_THRESHOLDS[selectedIsland?.id] || GJP_THRESHOLDS[1];
    const jpProgressPercent = Math.min(100, Math.max(0, ((jackpotAmount - gjpLimits.base) / (gjpLimits.max - gjpLimits.base)) * 100));
    
    // Strict contextual zone calculation
    const isJPHot = jackpotAmount >= gjpLimits.trigger && jackpotAmount < gjpLimits.max;
    const isJPCritical = jackpotAmount >= gjpLimits.max;

    let jpContainerClass = "w-full max-w-sm sm:max-w-md rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center backdrop-blur-md relative overflow-hidden transition-all duration-1000 z-10 ";
    if (isJPCritical) {
        jpContainerClass += "bg-gradient-to-b from-purple-900/60 to-black/90 border-2 border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.6)] animate-[shake-epic_0.5s_infinite]";
    } else if (isJPHot) {
        jpContainerClass += "bg-gradient-to-b from-red-900/60 to-black/90 border border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)] animate-pulse";
    } else {
        jpContainerClass += `bg-gradient-to-b ${selectedIsland?.theme?.bgGrad || 'from-yellow-900/30'} to-black/80 border ${selectedIsland?.theme?.border || 'border-yellow-500/40'} shadow-lg`;
    }

    return (
        <div className="min-h-[100dvh] bg-[#050505] pb-[90px] relative overflow-hidden flex flex-col selection:bg-cyan-500 selection:text-black font-sans">
            <style dangerouslySetInnerHTML={{__html: `@keyframes shake-epic { 0%, 100% { transform: translate(0,0) rotate(0deg); } 10%, 30%, 50%, 70%, 90% { transform: translate(-2px, 2px) rotate(-1deg); } 20%, 40%, 60%, 80% { transform: translate(2px, -2px) rotate(1deg); } }`}} />

            {/* Global Overlays */}
            <FloatingSymbols />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
            
            <div className="relative z-50"><GlobalTicker /></div>
            <ActiveEvents />

            {/* --- TRI-LINGUAL RESPONSIVE HEADER --- */}
            <div className="pt-3 px-4 sm:px-6 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center z-20 bg-gradient-to-b from-black/95 to-transparent backdrop-blur-sm sticky top-8 gap-3 sm:gap-0 border-b border-white/5">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                         <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 cursor-pointer group bg-black/50 p-1.5 pr-4 rounded-full border border-white/10 shadow-inner"
                            onClick={() => router.push('/profile')}
                         >
                             <div className="bg-gradient-to-br from-cyan-500 to-purple-600 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_10px_rgba(6,182,212,0.6)] group-hover:shadow-[0_0_15px_cyan] transition-all">
                                 <span className="text-white font-black text-xs italic">{user.level}</span>
                             </div>
                             <div className="flex flex-col">
                                 <span className="text-[9px] text-cyan-300 font-bold tracking-widest uppercase flex items-center gap-1">
                                    Rank <span className="opacity-50">|</span> အဆင့် <span className="opacity-50">|</span> 段位
                                 </span>
                                 <div className="w-24 sm:w-32 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-white/10 mt-0.5 shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-1000 shadow-[0_0_5px_cyan]" style={{width: `${user.progress_percent || 0}%`}}></div>
                                </div>
                             </div>
                         </motion.div>
                         <div className={`flex sm:hidden items-center gap-1 text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full border ${serverPing ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-red-500 border-red-500/30 bg-red-500/10'}`}>
                             <Activity size={10} className={serverPing ? 'animate-pulse' : ''} />
                             {serverPing ? 'LIVE' : 'DISC'}
                         </div>
                    </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-4">
                    <div className="flex gap-2">
                        <button onClick={() => { playSound('click'); router.push('/missions'); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-950/50 border border-blue-500/40 flex items-center justify-center text-blue-400 hover:bg-blue-500/30 active:scale-95 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]" title="တာဝန်များ / Missions">
                            <ClipboardList size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => { playSound('click'); setShowDailyBonus(true); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-950/50 border border-green-500/40 flex items-center justify-center text-green-400 hover:bg-green-500/30 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]" title="နေ့စဉ် ဘောနပ်စ် / Daily">
                            <Calendar size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => { playSound('click'); router.push('/tournaments'); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-yellow-950/50 border border-yellow-500/40 flex items-center justify-center text-yellow-400 hover:bg-yellow-500/30 active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]" title="ပြိုင်ပွဲများ / Events">
                            <Trophy size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => { playSound('click'); router.push('/notifications'); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all relative" title="အသိပေးချက် / Alerts">
                            <Bell size={16} className="sm:w-5 sm:h-5" />
                            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full border border-black flex items-center justify-center text-[10px] font-black animate-bounce">{unreadCount > 9 ? '!' : unreadCount}</span>}
                        </button>
                    </div>

                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/wallet')}
                        className="bg-black/80 px-4 py-2 rounded-full border border-yellow-500/50 flex items-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(234,179,8,0.2)] cursor-pointer hover:bg-black transition-colors"
                    >
                        <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 animate-pulse" />
                        <span className="text-yellow-400 font-mono font-black text-sm sm:text-base tracking-tight flex items-center gap-1">
                            {parseFloat(user.balance).toLocaleString()} <span className="text-[10px] text-yellow-600 hidden sm:inline">MMK</span>
                        </span>
                    </motion.div>
                </div>
            </div>

            {/* --- LOCALIZED GRAND JACKPOT DISPLAY --- */}
            <div className="relative z-20 px-4 sm:px-6 mt-3 mb-2 flex flex-col items-center justify-center">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={jpContainerClass}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-[pulse_4s_ease-in-out_infinite] mix-blend-color-dodge pointer-events-none"></div>
                    {isJPCritical && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>}
                    
                    <h3 className={`font-black text-[10px] sm:text-xs tracking-[0.2em] mb-1 flex items-center gap-2 drop-shadow-md z-10 uppercase ${isJPCritical ? 'text-purple-300 animate-pulse' : (isJPHot ? 'text-red-400' : 'text-yellow-500')}`}>
                        {isJPCritical ? <Zap size={14} className="animate-bounce fill-current"/> : <Sparkles size={14} className="animate-bounce" />}
                        {selectedIsland ? `${selectedIsland.name} GJP` : 'GRAND JACKPOT'} <span className="font-serif opacity-80 hidden sm:inline">[ 大当り / ဂျက်ပေါ့ ]</span>
                    </h3>
                    <div className={`text-3xl sm:text-5xl font-mono font-black tracking-tighter z-10 ${isJPCritical ? 'text-transparent bg-clip-text bg-gradient-to-b from-purple-200 via-pink-400 to-red-600 drop-shadow-[0_0_20px_rgba(236,72,153,1)]' : (isJPHot ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-orange-500 to-red-600 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-200 to-yellow-600 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]')}`}>
                        <RollupNumber value={jackpotAmount} />
                    </div>
                    <div className="mt-1 z-10">
                         {isJPCritical ? <span className="bg-purple-600 text-white font-bold px-3 py-0.5 rounded-full text-[9px] tracking-widest uppercase border border-white/50 shadow-[0_0_15px_purple]">CRITICAL MASS DETECTED</span> : isJPHot ? <span className="bg-red-600 text-white font-bold px-3 py-0.5 rounded-full text-[9px] tracking-widest uppercase shadow-[0_0_10px_red]">TRIGGER HOT</span> : null}
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 z-10">
                        <div className={`h-full transition-all duration-500 shadow-[0_0_10px_currentColor] ${isJPCritical ? 'bg-purple-500 text-purple-500' : isJPHot ? 'bg-red-500 text-red-500' : 'bg-yellow-500 text-yellow-500'}`} style={{ width: `${jpProgressPercent}%` }} />
                    </div>
                </motion.div>
                
                <div className="mt-3 flex items-center gap-1.5 text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest backdrop-blur-sm shadow-lg">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
                    <Users size={12} /> {activePlayers.toLocaleString()} PLAYERS ONLINE
                </div>
            </div>

            {/* --- 3D ISLAND CAROUSEL (THEMATIC) --- */}
            <div className="flex-1 relative flex items-center justify-center perspective-1000 mt-2 sm:mt-4 mb-6 min-h-[50vh]">
                
                {/* Seamless Background Crossfading */}
                <AnimatePresence mode="popLayout">
                    <motion.div 
                        key={`bg-${selectedIsland?.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className={`absolute inset-0 bg-gradient-to-b ${selectedIsland?.theme?.bgGrad || 'from-black'} via-transparent to-black pointer-events-none z-0`} 
                    />
                </AnimatePresence>

                <button onClick={() => paginate(-1)} className="absolute left-2 sm:left-6 z-40 p-2 sm:p-4 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 border border-white/20 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <ChevronLeft size={24} className="sm:w-8 sm:h-8"/>
                </button>
                
                <button onClick={() => paginate(1)} className="absolute right-2 sm:right-6 z-40 p-2 sm:p-4 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 border border-white/20 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <ChevronRight size={24} className="sm:w-8 sm:h-8"/>
                </button>

                {/* --- HARDWARE ACCELERATED SWIPE CAROUSEL --- */}
                <div className="relative w-full h-[50vh] sm:h-[55vh] md:h-[60vh] flex justify-center items-center overflow-visible z-30">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        {selectedIsland && (
                            <motion.div
                                key={selectedIsland.id}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={1}
                                onDragEnd={handleDragEnd}
                                onClick={() => handleEnter(selectedIsland)}
                                className={`absolute w-[85vw] sm:w-[70vw] md:w-[450px] h-full group cursor-pointer transform-style-3d will-change-transform z-30`}
                                style={{ transform: 'translateZ(0)' }}
                            >
                                {/* CYBER-SECURED LOCK SCREEN LAYER */}
                                {!isOwned && (
                                    <div className="absolute inset-0 z-50 rounded-[2rem] bg-red-900/40 backdrop-blur-sm border-2 border-red-500 shadow-[inset_0_0_100px_rgba(239,68,68,0.8)] overflow-hidden flex flex-col items-center justify-center">
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.2)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30 mix-blend-overlay"></div>
                                        <ShieldAlert size={80} className="text-red-500 animate-pulse drop-shadow-[0_0_20px_red] mb-4" />
                                        <h2 className="text-3xl font-black italic text-red-500 tracking-widest uppercase drop-shadow-md">RESTRICTED</h2>
                                        <div className="text-white font-mono bg-black/80 px-4 py-2 mt-4 rounded border border-red-500/50 shadow-inner text-sm text-center">
                                            <span className="text-gray-500 text-[10px] block mb-1">DEPOSIT REQUIRED TO BREACH SECTOR</span>
                                            {userStats.totalDeposited.toLocaleString()} / <span className="text-red-400 font-bold">{selectedIsland.reqDeposit.toLocaleString()} MMK</span>
                                        </div>
                                    </div>
                                )}

                                {/* Main Card Body */}
                                <div className={`w-full h-full rounded-[2rem] overflow-hidden border-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative transition-all duration-300 pointer-events-none
                                    ${!isOwned ? 'opacity-0' : `${selectedIsland.theme.border} ${selectedIsland.theme.shadow} ${selectedIsland.theme.hoverBorder} ${selectedIsland.theme.hoverShadow}`}`}>
                                    
                                    <div className="absolute inset-0 bg-gray-900 scale-105 transition-transform duration-[15s] ease-linear group-hover:scale-110">
                                        <IslandLandscapeSVG islandId={selectedIsland.id} priority={true} />
                                    </div>
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 mix-blend-overlay"></div>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-20 mix-blend-color-dodge pointer-events-none group-hover:opacity-40 transition-opacity"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                                    
                                    <div className="absolute left-[45%] top-[45%] transform -translate-x-1/2 -translate-y-1/2 scale-[1.15] sm:scale-125 z-10 transition-transform duration-500 group-hover:scale-125 group-hover:-translate-y-[50%]">
                                         <CabinetSVG islandId={selectedIsland.id} mode="hall" visualState="FREE" charId={selectedIsland.hostess_char_id} />
                                    </div>
                                    <div className="absolute right-[-40px] sm:right-[-60px] bottom-0 w-[70%] sm:w-[65%] h-[70%] drop-shadow-2xl transition-transform duration-700 group-hover:scale-[1.08] group-hover:translate-x-[-15px] z-20">
                                        <CharacterSVG type={selectedIsland.hostess_char_id} mood="idle" />
                                    </div>

                                    {/* Localized Info Banner */}
                                    <div className="absolute bottom-6 left-5 sm:left-8 right-5 sm:right-8 z-30">
                                        <div className="flex gap-2 mb-1 sm:mb-2">
                                            <div className={`text-[9px] sm:text-[10px] font-black tracking-widest flex items-center gap-1.5 px-2.5 py-1 rounded backdrop-blur-md border shadow-lg uppercase bg-black/70 ${selectedIsland.theme.text} ${selectedIsland.theme.border}`}>
                                                <MapPin size={12}/> မြေပုံ / マップ
                                            </div>
                                            <div className="bg-black/70 text-white border border-white/20 text-[9px] sm:text-[10px] font-black tracking-widest flex items-center gap-1 px-2.5 py-1 rounded backdrop-blur-md shadow-lg">
                                                <Layers size={12}/> {selectedIsland.totalMachines} MACHINES
                                            </div>
                                        </div>
                                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase text-white drop-shadow-[0_0_15px_rgba(0,0,0,1)] leading-[0.9] mb-1.5 sm:mb-2">
                                            {selectedIsland.name}
                                        </h1>
                                        <p className="text-[10px] sm:text-xs text-gray-300 leading-tight mb-2 sm:mb-3 drop-shadow-md line-clamp-2 font-serif">
                                            {selectedIsland.desc || "Enter the grid..."}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Dots Pagination */}
            <div className="h-6 flex justify-center gap-2 items-center z-20 relative top-[-10px]">
                {islands.map((isl, idx) => (
                    <div 
                        key={idx} 
                        className={`transition-all duration-300 rounded-full 
                            ${idx === currentIndex ? `w-6 sm:w-8 h-1.5 sm:h-2 ${isl.theme?.bgBadge || 'bg-cyan-500'} ${isl.theme?.shadow || ''} border border-white/50` : 'bg-gray-700 w-1.5 sm:w-2 h-1.5 sm:h-2 hover:bg-gray-500'}`} 
                        style={idx === currentIndex ? { backgroundColor: isl.theme?.accentColor || '#06b6d4' } : {}}
                    />
                ))}
            </div>

            <AnimatePresence>
                {showDailyBonus && <DailyBonusModal onClose={() => setShowDailyBonus(false)} />}
            </AnimatePresence>

            {/* Bottom Dock */}
            <div className="relative z-50">
                <BottomDock activeCharId={user?.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} />
            </div>
        </div>
    );
}