import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; 
import api, { game, user as userApi } from '../services/api';

import { 
    ChevronLeft, ChevronRight, Lock, Coins, MapPin, Loader2, 
    Bell, Trophy, Calendar, ClipboardList, Activity, Layers, 
    Sparkles, Zap, AlertTriangle, ShieldAlert, Users, Hexagon
} from 'lucide-react';

import CharacterSVG from '../components/visuals/CharacterSVG';
import CabinetSVG from '../components/visuals/CabinetSVG';
import IslandLandscapeSVG from '../components/visuals/IslandLandscapeSVG';
import BottomDock from '../components/layout/BottomDock';
import DailyBonusModal from '../components/game/DailyBonusModal';
import GlobalTicker from '../components/ui/GlobalTicker';
import ActiveEvents from '../components/ui/ActiveEvents';
import SymbolSVG from '../components/visuals/SymbolSVG';
import { useGameSound } from '../hooks/useGameSound';

// --- LEVIATHAN GJP MATRIX (V7.12 PARITY) ---
const GJP_THRESHOLDS = {
    1: { base: 3000000, trigger: 3600000, max: 7200000 },
    2: { base: 4000000, trigger: 4500000, max: 8100000 },
    3: { base: 5000000, trigger: 6000000, max: 10000000 },
    4: { base: 7500000, trigger: 9000000, max: 15000000 },
    5: { base: 10000000, trigger: 12000000, max: 20000000 }
};

// --- AAA OPTIMIZATION: Memoized Rollup Counter ---
const RollupNumber = memo(({ value }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = count;
        const end = parseInt(value) || 0;
        if (start === end) return;
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
});

// --- AAA OPTIMIZATION: Memoized Background Reels ---
const BackgroundReels = memo(() => {
    const symbols = [1, 2, 3, 4, 5, 6, 7];
    const columns = useMemo(() => [
        { dir: 'up', speed: '30s', opacity: 'opacity-[0.03]', size: 'w-24 h-24 sm:w-32 sm:h-32', delay: '0s' },
        { dir: 'down', speed: '40s', opacity: 'opacity-[0.02]', size: 'w-32 h-32 sm:w-48 sm:h-48', delay: '-5s' },
        { dir: 'up', speed: '25s', opacity: 'opacity-[0.04]', size: 'w-20 h-20 sm:w-28 sm:h-28', delay: '-10s' },
        { dir: 'down', speed: '45s', opacity: 'opacity-[0.02]', size: 'w-40 h-40 sm:w-56 sm:h-56', delay: '-2s' },
        { dir: 'up', speed: '35s', opacity: 'opacity-[0.03]', size: 'w-28 h-28 sm:w-36 sm:h-36', delay: '-15s' },
    ], []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex justify-between px-[-5%] sm:px-[5%] transform-gpu will-change-transform">
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes roll-up { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
                @keyframes roll-down { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }
            `}} />
            {columns.map((col, i) => (
                <div key={i} className="h-[200vh] flex flex-col items-center justify-start overflow-visible" style={{ width: '20%' }}>
                    <div 
                        className="flex flex-col gap-12 sm:gap-24 will-change-transform"
                        style={{ animation: `${col.dir === 'up' ? 'roll-up' : 'roll-down'} ${col.speed} linear infinite`, animationDelay: col.delay }}
                    >
                        {[...symbols, ...symbols, ...symbols].map((sym, j) => (
                            <div key={j} className={`${col.size} ${col.opacity} mix-blend-screen grayscale-[50%]`}>
                                <SymbolSVG id={sym} variant="dim" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]"></div>
        </div>
    );
});

// --- FRAMER MOTION CAROUSEL CONFIG (UHD Smooth Physics) ---
const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.85,
        rotateY: direction > 0 ? 30 : -30,
        rotateX: 5,
        zIndex: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
        rotateY: 0,
        rotateX: 0,
        transition: {
            x: { type: "spring", stiffness: 250, damping: 25 },
            opacity: { duration: 0.4 },
            rotateY: { type: "spring", stiffness: 200, damping: 25 },
            rotateX: { type: "spring", stiffness: 200, damping: 25 },
            scale: { duration: 0.5, ease: "easeOut" }
        }
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.85,
        rotateY: direction < 0 ? 30 : -30,
        rotateX: 5,
        transition: {
            x: { type: "spring", stiffness: 250, damping: 25 },
            opacity: { duration: 0.3 }
        }
    })
};

export default function Lobby() {
    const { user, loading } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const { playSound } = useGameSound();
    
    const [islands, setIslands] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // Live Ticker & Community State
    const [jackpotAmount, setJackpotAmount] = useState(3000000);
    const [activePlayers, setActivePlayers] = useState(0);
    const [topOperatives, setTopOperatives] = useState([]); 
    
    const [userStats, setUserStats] = useState({ totalDeposited: 0 });
    const [showDailyBonus, setShowDailyBonus] = useState(false);
    const [serverPing, setServerPing] = useState(true);

    const selectedIsland = islands.length > 0 ? islands[currentIndex] : null;

    // --- FETCH LIVE DATA & APPLY ISLAND THEMES ---
    useEffect(() => {
        const initLobby = async () => {
            try {
                const [resIslands, resNotifs, resProfile, resLeaderboard] = await Promise.all([
                    game.getIslands(), 
                    userApi.getNotifications(), 
                    userApi.getProfile(),
                    game.getLeaderboard('balance')
                ]);

                if (resIslands.data?.status === 'success') {
                    const progressionIslands = resIslands.data.data.map(island => {
                        let reqDeposit = parseFloat(island.req_deposit) || 0;
                        let totalMachines = 0;
                        
                        let theme = { 
                            bgGrad: 'from-gray-900/40', border: 'border-gray-500/50', hoverBorder: 'hover:border-gray-400', 
                            shadow: 'shadow-[0_20px_50px_rgba(156,163,175,0.1)]', text: 'text-gray-400', bgBadge: 'bg-gray-950/80', accentColor: '#9ca3af', ring: 'ring-gray-500/30'
                        };

                        switch(parseInt(island.id)) {
                            case 1: totalMachines = 900; theme = { bgGrad: 'from-red-900/60', border: 'border-red-500/50', hoverBorder: 'hover:border-red-400', shadow: 'shadow-[0_20px_50px_rgba(239,68,68,0.2)]', text: 'text-red-400', bgBadge: 'bg-red-950/80', accentColor: '#ef4444', ring: 'ring-red-500/30' }; break;
                            case 2: totalMachines = 720; theme = { bgGrad: 'from-blue-900/60', border: 'border-cyan-500/50', hoverBorder: 'hover:border-cyan-400', shadow: 'shadow-[0_20px_50px_rgba(6,182,212,0.2)]', text: 'text-cyan-400', bgBadge: 'bg-cyan-950/80', accentColor: '#06b6d4', ring: 'ring-cyan-500/30' }; break;
                            case 3: totalMachines = 540; theme = { bgGrad: 'from-orange-900/60', border: 'border-orange-500/50', hoverBorder: 'hover:border-orange-400', shadow: 'shadow-[0_20px_50px_rgba(249,115,22,0.2)]', text: 'text-orange-400', bgBadge: 'bg-orange-950/80', accentColor: '#f97316', ring: 'ring-orange-500/30' }; break;
                            case 4: totalMachines = 360; theme = { bgGrad: 'from-pink-900/60', border: 'border-pink-500/50', hoverBorder: 'hover:border-pink-400', shadow: 'shadow-[0_20px_50px_rgba(236,72,153,0.2)]', text: 'text-pink-400', bgBadge: 'bg-pink-950/80', accentColor: '#ec4899', ring: 'ring-pink-500/30' }; break;
                            case 5: totalMachines = 180; theme = { bgGrad: 'from-purple-900/60', border: 'border-purple-500/50', hoverBorder: 'hover:border-purple-400', shadow: 'shadow-[0_20px_50px_rgba(168,85,247,0.2)]', text: 'text-purple-400', bgBadge: 'bg-purple-950/80', accentColor: '#a855f7', ring: 'ring-purple-500/30' }; break;
                            default: totalMachines = 200;
                        }
                        return { ...island, reqDeposit, totalMachines, theme };
                    });
                    setIslands(progressionIslands);
                }
                
                if (resNotifs.data?.status === 'success') setUnreadCount(resNotifs.data.count || 0);
                if (resProfile.data?.status === 'success') setUserStats({ totalDeposited: parseFloat(resProfile.data.user.total_deposited) || 0 });
                if (resLeaderboard.data?.status === 'success') setTopOperatives(resLeaderboard.data.list.slice(0, 5));

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
                    setJackpotAmount(parseFloat(response.data.jackpot_amount));
                    setServerPing(true);
                    setActivePlayers(Math.floor(Math.random() * 500) + 1200); 
                }
            } catch (e) { setServerPing(false); }
        };

        fetchIslandJackpot(); 
        const interval = setInterval(fetchIslandJackpot, 10000); 
        return () => clearInterval(interval);
    }, [selectedIsland?.id]);

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
    
    const isJPHot = jackpotAmount >= gjpLimits.trigger && jackpotAmount < gjpLimits.max;
    const isJPCritical = jackpotAmount >= gjpLimits.max;

    return (
        <div className="min-h-[100dvh] bg-[#050505] pb-[90px] relative overflow-hidden flex flex-col selection:bg-cyan-500 selection:text-black font-sans">
            
            {/* Global Overlays (AAA Cinematic Reels) */}
            <BackgroundReels />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
            
            <div className="relative z-50"><GlobalTicker /></div>
            <ActiveEvents />

            {/* --- UHD GLASSMORPHISM HEADER --- */}
            <div className="pt-3 px-4 sm:px-6 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center z-20 bg-black/40 backdrop-blur-xl sticky top-8 gap-3 sm:gap-0 border-b border-white/5 shadow-sm">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                         {/* Cyber-ID Operative Badge */}
                         <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-3 cursor-pointer group bg-white/5 p-1.5 pr-5 rounded-2xl border border-white/10 shadow-inner backdrop-blur-md relative overflow-hidden"
                            onClick={() => router.push('/profile')}
                         >
                             <div className="bg-gradient-to-br from-cyan-600 to-blue-800 w-10 h-10 rounded-xl flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all overflow-hidden relative z-10">
                                 <div className="absolute inset-0 scale-[1.5] pt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <CharacterSVG type={user.active_pet_id || 'luna'} mood="idle" stickerMode={true} />
                                 </div>
                                 <span className="text-white font-black text-sm italic relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{user.level}</span>
                             </div>
                             
                             <div className="flex flex-col relative z-10">
                                 <span className="text-[10px] text-cyan-300 font-bold tracking-[0.2em] uppercase flex items-center gap-1.5 drop-shadow-md">
                                    <ShieldAlert size={10} className="text-cyan-400" /> Operative
                                 </span>
                                 <div className="w-28 sm:w-36 h-1.5 bg-black/80 rounded-full overflow-hidden border border-white/10 mt-1 shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-1000 shadow-[0_0_8px_cyan]" style={{width: `${user.progress_percent || 0}%`}}></div>
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
                        <button onClick={() => { playSound('click'); router.push('/missions'); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-950/40 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/30 active:scale-95 transition-all" title="တာဝန်များ / Missions">
                            <ClipboardList size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => { playSound('click'); setShowDailyBonus(true); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-950/40 border border-green-500/30 flex items-center justify-center text-green-400 hover:bg-green-500/30 active:scale-95 transition-all" title="နေ့စဉ် ဘောနပ်စ် / Daily">
                            <Calendar size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => { playSound('click'); router.push('/tournaments'); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-yellow-950/40 border border-yellow-500/30 flex items-center justify-center text-yellow-400 hover:bg-yellow-500/30 active:scale-95 transition-all" title="ပြိုင်ပွဲများ / Events">
                            <Trophy size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => { playSound('click'); router.push('/notifications'); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all relative" title="အသိပေးချက် / Alerts">
                            <Bell size={16} className="sm:w-5 sm:h-5" />
                            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full border border-black flex items-center justify-center text-[10px] font-black">{unreadCount > 9 ? '!' : unreadCount}</span>}
                        </button>
                    </div>

                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/wallet')}
                        className="bg-black/60 px-4 py-2 rounded-2xl border border-yellow-500/30 flex items-center gap-2 shadow-inner cursor-pointer hover:bg-black transition-colors"
                    >
                        <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-mono font-black text-sm sm:text-base tracking-tight flex items-center gap-1">
                            {parseFloat(user.balance).toLocaleString()} <span className="text-[10px] text-yellow-600 hidden sm:inline">MMK</span>
                        </span>
                    </motion.div>
                </div>
            </div>

            {/* --- UHD CLEAN GJP & COMMUNITY DASHBOARD --- */}
            <div className="relative z-20 px-4 sm:px-6 mt-4 mb-2 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-5xl mx-auto">
                
                {/* Sleek GJP Readout */}
                <div className={`flex-1 w-full rounded-3xl p-4 sm:p-5 flex flex-col justify-center bg-black/40 backdrop-blur-2xl border transition-all duration-1000 relative overflow-hidden
                    ${isJPCritical ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : isJPHot ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/10 shadow-lg'}`}>
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_3s_infinite] pointer-events-none" />
                    
                    <div className="flex items-center justify-between z-10 relative">
                        <div className="flex flex-col">
                            <h3 className={`font-black text-[10px] sm:text-xs tracking-[0.3em] flex items-center gap-2 uppercase ${isJPCritical ? 'text-purple-400' : (isJPHot ? 'text-red-400' : 'text-gray-400')}`}>
                                {isJPCritical ? <Zap size={14}/> : <Sparkles size={14} className="opacity-50" />}
                                {selectedIsland ? `${selectedIsland.name} GJP` : 'GRAND JACKPOT'} 
                                <span className="font-serif opacity-50 hidden md:inline tracking-normal ml-1">[ 大当り ]</span>
                            </h3>
                            <div className="mt-1 flex items-center gap-2">
                                {isJPCritical ? <span className="bg-purple-900/50 text-purple-200 font-bold px-2 py-0.5 rounded text-[8px] tracking-widest border border-purple-500/50">CRITICAL</span> : 
                                 isJPHot ? <span className="bg-red-900/50 text-red-200 font-bold px-2 py-0.5 rounded text-[8px] tracking-widest border border-red-500/50">HOT</span> : null}
                            </div>
                        </div>
                        
                        <div className={`text-3xl sm:text-5xl md:text-6xl font-mono font-black tracking-tighter transition-colors duration-1000 ${isJPCritical ? 'text-purple-400' : (isJPHot ? 'text-red-500' : 'text-white')}`}>
                            <RollupNumber value={jackpotAmount} />
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5 z-10">
                        <div className={`h-full transition-all duration-500 ${isJPCritical ? 'bg-purple-500 shadow-[0_0_10px_purple]' : isJPHot ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-white/20'}`} style={{ width: `${jpProgressPercent}%` }} />
                    </div>
                </div>
                
                {/* UHD Community Cluster */}
                <div className="flex flex-col justify-center gap-3 bg-black/40 backdrop-blur-2xl border border-white/10 px-5 py-4 rounded-3xl w-full sm:w-auto min-w-[250px] shadow-lg">
                    <div className="flex items-center justify-between w-full text-cyan-400 text-[10px] font-bold tracking-widest uppercase">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping opacity-70"></span>
                            <Users size={14} className="opacity-80" /> 
                            <span>NETWORK</span>
                        </div>
                        <span className="text-white font-mono">{activePlayers.toLocaleString()}</span>
                    </div>

                    {topOperatives.length > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 w-full">
                            <span className="text-[9px] text-gray-500 font-bold tracking-widest uppercase"><Trophy size={10} className="inline mr-1 text-yellow-500/50"/> TOP OP</span>
                            <div className="flex -space-x-2 hover:space-x-1 transition-all duration-300">
                                {topOperatives.map((op, idx) => (
                                    <div key={op.id} className="w-7 h-7 rounded-full bg-[#111] border border-white/20 relative overflow-hidden flex items-center justify-center shadow-md">
                                        <div className="absolute inset-0 scale-[1.3] pt-1 opacity-90 transition-all">
                                            <CharacterSVG type={op.active_pet_id || 'luna'} mood="idle" stickerMode={true} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- 3D ISLAND CAROUSEL (UHD CABINET-CENTRIC) --- */}
            <div className="flex-1 relative flex items-center justify-center perspective-1000 mt-2 sm:mt-4 mb-6 min-h-[45vh] z-10">
                
                <AnimatePresence mode="popLayout">
                    <motion.div 
                        key={`bg-${selectedIsland?.id}`}
                        initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
                        className={`absolute inset-0 bg-gradient-to-b ${selectedIsland?.theme?.bgGrad || 'from-black'} via-transparent to-black pointer-events-none z-0`} 
                    />
                </AnimatePresence>

                <button onClick={() => paginate(-1)} className="absolute left-2 sm:left-6 z-40 p-3 bg-black/40 backdrop-blur-xl rounded-full text-white hover:bg-white/10 border border-white/10 active:scale-95 transition-all">
                    <ChevronLeft size={24} strokeWidth={1.5} />
                </button>
                <button onClick={() => paginate(1)} className="absolute right-2 sm:right-6 z-40 p-3 bg-black/40 backdrop-blur-xl rounded-full text-white hover:bg-white/10 border border-white/10 active:scale-95 transition-all">
                    <ChevronRight size={24} strokeWidth={1.5} />
                </button>

                {/* --- HARDWARE ACCELERATED SWIPE CAROUSEL --- */}
                <div className="relative w-full h-[45vh] sm:h-[50vh] md:h-[60vh] flex justify-center items-center overflow-visible z-30">
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
                                className={`absolute w-[80vw] sm:w-[70vw] md:w-[450px] h-full group cursor-pointer transform-gpu will-change-transform z-30`}
                                style={{ transform: 'translateZ(0)' }}
                            >
                                {/* CYBER-SECURED LOCK SCREEN LAYER */}
                                {!isOwned && (
                                    <div className="absolute inset-0 z-50 rounded-[2rem] bg-black/80 backdrop-blur-md border border-red-500/30 overflow-hidden flex flex-col items-center justify-center">
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                                        <ShieldAlert size={48} strokeWidth={1} className="text-red-500 mb-4 opacity-80" />
                                        <h2 className="text-xl sm:text-2xl font-black italic text-white tracking-widest uppercase">RESTRICTED</h2>
                                        <div className="text-gray-400 font-mono bg-black px-4 py-2 mt-4 rounded-xl border border-white/5 text-xs sm:text-sm text-center w-3/4">
                                            <span className="text-gray-500 text-[9px] block mb-1 uppercase tracking-widest">Deposit Req.</span>
                                            {userStats.totalDeposited.toLocaleString()} / <span className="text-white">{selectedIsland.reqDeposit.toLocaleString()} MMK</span>
                                        </div>
                                    </div>
                                )}

                                {/* Main Card Body (Clean Glass Frame) */}
                                <div className={`w-full h-full rounded-[2rem] overflow-hidden border border-white/20 bg-black/40 backdrop-blur-md relative transition-all duration-500 pointer-events-none
                                    ${!isOwned ? 'opacity-0' : `group-hover:border-white/40 ${selectedIsland.theme.shadow}`}`}>
                                    
                                    <div className="absolute inset-0 bg-[#050505] scale-105 transition-transform duration-[20s] ease-linear group-hover:scale-110">
                                        <IslandLandscapeSVG islandId={selectedIsland.id} priority={true} />
                                    </div>
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 mix-blend-overlay"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                                    
                                    {/* Centered UHD Cabinet */}
                                    <div className="absolute left-1/2 top-[45%] transform -translate-x-1/2 -translate-y-1/2 scale-[1.3] sm:scale-[1.5] z-10 transition-transform duration-700 ease-out group-hover:scale-[1.35] sm:group-hover:scale-[1.55] group-hover:-translate-y-[48%]">
                                         <CabinetSVG islandId={selectedIsland.id} mode="hall" visualState="FREE" />
                                    </div>

                                    {/* Clean Info Typography */}
                                    <div className="absolute bottom-6 left-6 right-6 z-30 text-center flex flex-col items-center">
                                        <div className="flex gap-2 mb-2">
                                            <div className="bg-white/5 text-gray-300 border border-white/10 text-[9px] font-bold tracking-widest flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md uppercase">
                                                <MapPin size={10}/> မြေပုံ
                                            </div>
                                            <div className="bg-white/5 text-gray-300 border border-white/10 text-[9px] font-bold tracking-widest flex items-center gap-1 px-3 py-1 rounded-full backdrop-blur-md uppercase">
                                                <Layers size={10}/> {selectedIsland.totalMachines} MACHINES
                                            </div>
                                        </div>
                                        <h1 className="text-3xl sm:text-4xl font-black italic uppercase text-white tracking-tighter drop-shadow-md mb-1">
                                            {selectedIsland.name}
                                        </h1>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Dots Pagination */}
            <div className="h-6 flex justify-center gap-2 items-center z-20 relative top-[-15px] sm:top-[-10px]">
                {islands.map((isl, idx) => (
                    <div 
                        key={idx} 
                        className={`transition-all duration-300 rounded-full 
                            ${idx === currentIndex ? `w-6 sm:w-8 h-1.5 sm:h-2 ${isl.theme?.bgBadge || 'bg-white'} border border-white/20` : 'bg-white/20 w-1.5 sm:w-2 h-1.5 sm:h-2 hover:bg-white/40'}`} 
                        style={idx === currentIndex ? { backgroundColor: isl.theme?.accentColor || '#fff' } : {}}
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