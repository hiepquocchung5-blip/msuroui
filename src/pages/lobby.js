import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; 
import api, { game, user as userApi } from '../services/api';

import { 
    ChevronLeft, ChevronRight, Lock, Coins, MapPin, Loader2, 
    Bell, Trophy, Calendar, ClipboardList, Activity, Layers, 
    Sparkles, Zap, Users, AlertTriangle 
} from 'lucide-react';

import CharacterSVG from '../components/visuals/CharacterSVG';
import CabinetSVG from '../components/visuals/CabinetSVG';
import IslandLandscapeSVG from '../components/visuals/IslandLandscapeSVG';
import BottomDock from '../components/layout/BottomDock';
import GlassCard from '../components/ui/GlassCard';
import DailyBonusModal from '../components/game/DailyBonusModal';
import GlobalTicker from '../components/ui/GlobalTicker';
import ActiveEvents from '../components/ui/ActiveEvents';
import { useGameSound } from '../hooks/useGameSound';

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

// --- Sakura (Cherry Blossom) Particle Engine ---
const SakuraParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute bg-gradient-to-br from-pink-200 to-pink-400 rounded-tl-full rounded-br-full opacity-40 shadow-[0_0_5px_rgba(255,192,203,0.8)]"
                style={{
                    width: Math.random() * 8 + 6 + 'px',
                    height: Math.random() * 8 + 6 + 'px',
                    left: Math.random() * 100 + '%',
                    top: '-5%'
                }}
                animate={{
                    y: ['0vh', '110vh'],
                    x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
                    rotate: [0, 360 * Math.random()]
                }}
                transition={{
                    duration: Math.random() * 5 + 7,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 5
                }}
            />
        ))}
    </div>
);

// --- FRAMER MOTION CAROUSEL CONFIG ---
const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.8,
        rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        rotateY: 0,
        transition: {
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            rotateY: { duration: 0.4, ease: "easeOut" }
        }
    },
    exit: (direction) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.8,
        rotateY: direction < 0 ? 45 : -45,
        transition: {
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
        }
    })
};

export default function Lobby() {
    const { user, loading, updateBalance } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const { playSound } = useGameSound();
    
    // Core State
    const [islands, setIslands] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
    const [unreadCount, setUnreadCount] = useState(0);
    
    // App Initialization / Caching State
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [cacheProgress, setCacheProgress] = useState(0);
    
    // Live Ticker State
    const [jackpotAmount, setJackpotAmount] = useState(3000000);
    const [activePlayers, setActivePlayers] = useState(0);
    const prevJackpotRef = useRef(null);
    
    // Global Celebration State
    const [showJpCelebration, setShowJpCelebration] = useState(false);
    const [coinParticles, setCoinParticles] = useState([]);
    
    // V3 User Progression Data
    const [userStats, setUserStats] = useState({ totalDeposited: 0 });
    
    // Modals & UI State
    const [showDailyBonus, setShowDailyBonus] = useState(false);
    const [missions, setMissions] = useState([]);
    const [serverPing, setServerPing] = useState(true);

    const triggerCoinShower = useCallback(() => {
        const newParticles = Array.from({length: 80}).map((_, i) => ({
            id: Date.now() + i, left: Math.random() * 100, delay: Math.random() * 2,
            scale: 0.5 + Math.random(), rotation: Math.random() * 360
        }));
        setCoinParticles(newParticles);
        setTimeout(() => setCoinParticles([]), 5000);
    }, []);

    // --- 1. INITIALIZATION & CACHING SEQUENCE ---
    useEffect(() => {
        const hasCached = localStorage.getItem('suropara_assets_cached');
        if (!hasCached) {
            let progress = 0;
            const cacheInterval = setInterval(() => {
                progress += Math.floor(Math.random() * 15) + 5;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(cacheInterval);
                    localStorage.setItem('suropara_assets_cached', 'true');
                    setTimeout(() => setIsAppLoading(false), 500);
                }
                setCacheProgress(progress);
            }, 150);
        } else {
            setIsAppLoading(false);
        }
    }, []);

    // --- 2. FETCH LIVE DATA & APPLY ISLAND THEMES ---
    useEffect(() => {
        const initLobby = async () => {
            if (isAppLoading) return;
            try {
                const [resIslands, resNotifs, resMissions, resProfile, resTicker] = await Promise.all([
                    game.getIslands(), userApi.getNotifications(), api.get('/game/missions.php'), userApi.getProfile(), game.getTicker()
                ]);

                if (resIslands.data.status === 'success') {
                    const progressionIslands = resIslands.data.data.map(island => {
                        let reqDeposit = parseFloat(island.req_deposit) || 0;
                        let totalMachines = 0;
                        
                        let theme = { 
                            bgGrad: 'from-gray-900/40', border: 'border-gray-500/50', hoverBorder: 'hover:border-gray-400', 
                            shadow: 'shadow-[0_0_30px_rgba(156,163,175,0.3)]', hoverShadow: 'hover:shadow-[0_0_50px_rgba(156,163,175,0.5)]', 
                            text: 'text-gray-400', bgBadge: 'bg-gray-950/80', accentColor: '#9ca3af'
                        };

                        switch(parseInt(island.id)) {
                            case 1: totalMachines = 900; theme = { bgGrad: 'from-red-900/60', border: 'border-red-500/50', hoverBorder: 'hover:border-red-400', shadow: 'shadow-[0_0_40px_rgba(239,68,68,0.4)]', hoverShadow: 'group-hover:shadow-[0_0_60px_rgba(239,68,68,0.6)]', text: 'text-red-400', bgBadge: 'bg-red-950/80', accentColor: '#ef4444' }; break;
                            case 2: totalMachines = 720; theme = { bgGrad: 'from-blue-900/60', border: 'border-cyan-500/50', hoverBorder: 'hover:border-cyan-400', shadow: 'shadow-[0_0_40px_rgba(6,182,212,0.4)]', hoverShadow: 'group-hover:shadow-[0_0_60px_rgba(6,182,212,0.6)]', text: 'text-cyan-400', bgBadge: 'bg-cyan-950/80', accentColor: '#06b6d4' }; break;
                            case 3: totalMachines = 540; theme = { bgGrad: 'from-orange-900/60', border: 'border-orange-500/50', hoverBorder: 'hover:border-orange-400', shadow: 'shadow-[0_0_40px_rgba(249,115,22,0.4)]', hoverShadow: 'group-hover:shadow-[0_0_60px_rgba(249,115,22,0.6)]', text: 'text-orange-400', bgBadge: 'bg-orange-950/80', accentColor: '#f97316' }; break;
                            case 4: totalMachines = 360; theme = { bgGrad: 'from-pink-900/60', border: 'border-pink-500/50', hoverBorder: 'hover:border-pink-400', shadow: 'shadow-[0_0_40px_rgba(236,72,153,0.4)]', hoverShadow: 'group-hover:shadow-[0_0_60px_rgba(236,72,153,0.6)]', text: 'text-pink-400', bgBadge: 'bg-pink-950/80', accentColor: '#ec4899' }; break;
                            case 5: totalMachines = 180; theme = { bgGrad: 'from-purple-900/60', border: 'border-purple-500/50', hoverBorder: 'hover:border-purple-400', shadow: 'shadow-[0_0_40px_rgba(168,85,247,0.4)]', hoverShadow: 'group-hover:shadow-[0_0_60px_rgba(168,85,247,0.6)]', text: 'text-purple-400', bgBadge: 'bg-purple-950/80', accentColor: '#a855f7' }; break;
                            default: totalMachines = 200;
                        }
                        return { ...island, reqDeposit, totalMachines, theme };
                    });
                    setIslands(progressionIslands);
                }
                
                if (resNotifs.data.status === 'success') setUnreadCount(resNotifs.data.count || 0);
                if (resMissions.data.status === 'success') setMissions(resMissions.data.data);
                
                if (resProfile.data.status === 'success') {
                    const deposited = parseFloat(resProfile.data.user.total_deposited) || 0;
                    setUserStats({ totalDeposited: deposited });
                }

                if (resTicker.data.status === 'success') {
                    setJackpotAmount(resTicker.data.jackpot_amount || 3000000);
                    prevJackpotRef.current = resTicker.data.jackpot_amount || 3000000;
                    setActivePlayers(Math.floor(Math.random() * 500) + 1200);
                    setServerPing(true);
                }

                if (user) {
                    const lastClaimStr = localStorage.getItem(`daily_claim_time_${user.id}`);
                    const now = new Date().getTime();
                    if (!lastClaimStr || (now - parseInt(lastClaimStr) > 86400000)) {
                        setTimeout(() => setShowDailyBonus(true), 1500);
                    }
                }
            } catch (e) { 
                addToast("Connection to game server unstable.", 'error');
                setServerPing(false);
            }
        };

        if (!loading && user) initLobby();
    }, [loading, user, addToast, isAppLoading]);

    // --- BACKGROUND IMAGE PRE-FETCHER ---
    useEffect(() => {
        if (islands.length > 0) {
            const nextIdx = (currentIndex + 1) % islands.length;
            const prevIdx = (currentIndex - 1 + islands.length) % islands.length;
            const preloadIds = [islands[nextIdx].id, islands[prevIdx].id];
            preloadIds.forEach(id => {
                const img = new Image();
                img.src = `/assets/backgrounds/bg_${id}.jpg`;
            });
        }
    }, [currentIndex, islands]);

    // --- LIVE JACKPOT POLLING ---
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await game.getTicker();
                if (res.data.status === 'success' && res.data.jackpot_amount) {
                    const newJp = res.data.jackpot_amount;
                    if (prevJackpotRef.current !== null && (newJp - prevJackpotRef.current > 500000)) {
                        playSound('bigwin');
                        setShowJpCelebration(true);
                        triggerCoinShower();
                        setTimeout(() => setShowJpCelebration(false), 8000);
                    }
                    setJackpotAmount(newJp);
                    prevJackpotRef.current = newJp;
                    setServerPing(true);
                }
            } catch (e) { setServerPing(false); }
        }, 10000);
        return () => clearInterval(interval);
    }, [playSound, triggerCoinShower]);

    // --- CAROUSEL NAVIGATION WITH SWIPE ---
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

    const selectedIsland = islands.length > 0 ? islands[currentIndex] : null;
    
    const checkProgressionUnlock = useCallback((island) => {
        if (!island) return false;
        if (island.id === 1 || island.reqDeposit === 0) return true; 
        return userStats.totalDeposited >= island.reqDeposit;
    }, [userStats]);

    const isOwned = selectedIsland ? checkProgressionUnlock(selectedIsland) : false;

    const handleEnter = async (island) => {
        playSound('click');
        if (!isOwned) {
            addToast(`Deposit required to unlock ${island.name}`, 'info');
            return;
        }
        router.push(`/game/${island.id}`);
    };

    // --- INITIAL LOADING SCREEN ---
    if (loading || isAppLoading) {
        return (
            <div className="bg-[#050505] min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/seigaiha.png')] opacity-10 animate-[pulse_5s_infinite]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 via-black to-black"></div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex flex-col items-center">
                    <h1 className="text-4xl font-black text-white italic tracking-widest mb-2 drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">SUROPARA</h1>
                    <div className="text-[10px] text-cyan-400 font-bold tracking-[0.3em] mb-8">スロパラダイス</div>

                    {isAppLoading && (
                        <div className="w-64">
                            <div className="flex justify-between text-[9px] text-gray-400 font-mono mb-1 uppercase">
                                <span>Caching Assets...</span>
                                <span>{cacheProgress}%</span>
                            </div>
                            <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden border border-white/10 relative">
                                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_10px_cyan] transition-all duration-200" style={{width: `${cacheProgress}%`}}></div>
                            </div>
                        </div>
                    )}
                    {!isAppLoading && <Loader2 className="animate-spin text-cyan-500 w-8 h-8" />}
                </motion.div>
            </div>
        );
    }

    if (islands.length === 0) return null;

    // --- DYNAMIC GJP STYLING LOGIC ---
    const jpProgressPercent = Math.min(100, Math.max(0, ((jackpotAmount - 3000000) / (7200000 - 3000000)) * 100));
    const isJPHot = jackpotAmount >= 3600000 && jackpotAmount < 7000000;
    const isJPCritical = jackpotAmount >= 7000000;

    let jpContainerClass = "w-full max-w-sm sm:max-w-md rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center backdrop-blur-md relative overflow-hidden transition-all duration-1000 ";
    if (isJPCritical) jpContainerClass += "bg-gradient-to-b from-purple-900/60 to-black/90 border-2 border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.6)] animate-[shake-epic_0.5s_infinite]";
    else if (isJPHot) jpContainerClass += "bg-gradient-to-b from-red-900/60 to-black/90 border border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)] animate-pulse";
    else jpContainerClass += "bg-gradient-to-b from-yellow-900/30 to-black/80 border border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.2)]";

    return (
        <div className="min-h-[100dvh] bg-[#050505] pb-[90px] relative overflow-hidden flex flex-col selection:bg-cyan-500 selection:text-black font-sans">
            <style dangerouslySetInnerHTML={{__html: `@keyframes shake-epic { 0%, 100% { transform: translate(0,0) rotate(0deg); } 10%, 30%, 50%, 70%, 90% { transform: translate(-2px, 2px) rotate(-1deg); } 20%, 40%, 60%, 80% { transform: translate(2px, -2px) rotate(1deg); } }`}} />

            <SakuraParticles />
            <div className="relative z-50"><GlobalTicker /></div>
            <ActiveEvents />

            {/* --- RESPONSIVE HEADER --- */}
            <div className="pt-3 px-4 sm:px-6 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center z-20 bg-gradient-to-b from-black/95 to-transparent backdrop-blur-sm sticky top-8 gap-3 sm:gap-0 border-b border-white/5">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                         <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => router.push('/profile')}
                         >
                             <div className="bg-gradient-to-br from-cyan-500 to-purple-600 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                                 <span className="text-white font-black text-xs italic">{user.level}</span>
                             </div>
                             <div className="flex flex-col">
                                 <span className="text-[9px] text-cyan-300 font-bold tracking-widest uppercase">Rank / 段位</span>
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
                        <button onClick={() => { playSound('click'); router.push('/missions'); }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-950/50 border border-blue-500/40 flex items-center justify-center text-blue-400 hover:bg-blue-500/30 active:scale-95 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"><ClipboardList size={16} className="sm:w-5 sm:h-5" /></button>
                        <button onClick={() => { playSound('click'); setShowDailyBonus(true); }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-950/50 border border-green-500/40 flex items-center justify-center text-green-400 hover:bg-green-500/30 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]"><Calendar size={16} className="sm:w-5 sm:h-5" /></button>
                        <button onClick={() => { playSound('click'); router.push('/tournaments'); }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-950/50 border border-yellow-500/40 flex items-center justify-center text-yellow-400 hover:bg-yellow-500/30 active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]"><Trophy size={16} className="sm:w-5 sm:h-5" /></button>
                        <button onClick={() => { playSound('click'); router.push('/notifications'); }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all relative">
                            <Bell size={16} className="sm:w-5 sm:h-5" />
                            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-600 text-white rounded-full border border-black flex items-center justify-center text-[8px] sm:text-[10px] font-black animate-bounce">{unreadCount > 9 ? '!' : unreadCount}</span>}
                        </button>
                    </div>

                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/wallet')}
                        className="bg-black/60 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-yellow-500/40 flex items-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(234,179,8,0.15)] cursor-pointer hover:bg-black/80 transition-colors"
                    >
                        <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 animate-pulse" />
                        <span className="text-yellow-400 font-mono font-black text-sm sm:text-base tracking-tight">{parseFloat(user.balance).toLocaleString()}</span>
                    </motion.div>
                </div>
            </div>

            {/* --- LIVE GRAND JACKPOT DISPLAY --- */}
            <div className="relative z-20 px-4 sm:px-6 mt-3 mb-2 flex flex-col items-center justify-center">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={jpContainerClass}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-[pulse_4s_ease-in-out_infinite] mix-blend-color-dodge"></div>
                    {isJPCritical && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-20 mix-blend-overlay"></div>}
                    
                    <h3 className={`font-black text-[10px] sm:text-xs tracking-[0.2em] mb-1 flex items-center gap-2 drop-shadow-md z-10 ${isJPCritical ? 'text-purple-300 animate-pulse' : (isJPHot ? 'text-red-400' : 'text-yellow-500')}`}>
                        {isJPCritical ? <Zap size={14} className="animate-bounce fill-current"/> : <Sparkles size={14} className="animate-bounce" />}
                        GRAND JACKPOT <span className="font-serif">[ 大当り ]</span>
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
            <div className="flex-1 relative flex items-center justify-center perspective-1000 mt-2 sm:mt-4 mb-6">
                
                {/* Seamless Background Crossfading */}
                <AnimatePresence mode="popLayout">
                    <motion.div 
                        key={`bg-${selectedIsland?.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className={`absolute inset-0 bg-gradient-to-b ${selectedIsland?.theme?.bgGrad || 'from-black'} via-transparent to-black pointer-events-none`} 
                    />
                </AnimatePresence>

                <button onClick={() => paginate(-1)} className="absolute left-2 sm:left-6 z-40 p-2 sm:p-4 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 border border-white/20 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <ChevronLeft size={24} className="sm:w-8 sm:h-8"/>
                </button>
                
                <button onClick={() => paginate(1)} className="absolute right-2 sm:right-6 z-40 p-2 sm:p-4 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 border border-white/20 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <ChevronRight size={24} className="sm:w-8 sm:h-8"/>
                </button>

                {/* --- HARDWARE ACCELERATED SWIPE CAROUSEL --- */}
                <div className="relative w-full h-[50vh] sm:h-[55vh] md:h-[60vh] flex justify-center items-center overflow-visible">
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
                                style={{ transform: 'translateZ(0)' }} // Force GPU compositing
                            >
                                <div className={`w-full h-full rounded-[2rem] overflow-hidden border-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative transition-all duration-300 pointer-events-none
                                    ${!isOwned ? 'grayscale-[80%] border-gray-800' : `${selectedIsland.theme.border} ${selectedIsland.theme.shadow} ${selectedIsland.theme.hoverBorder} ${selectedIsland.theme.hoverShadow}`}`}>
                                    
                                    <div className="absolute inset-0 bg-gray-900 scale-105 transition-transform duration-[15s] ease-linear group-hover:scale-110">
                                        <IslandLandscapeSVG islandId={selectedIsland.id} priority={true} />
                                    </div>
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 mix-blend-overlay"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                                    
                                    <div className="absolute left-[45%] top-[45%] transform -translate-x-1/2 -translate-y-1/2 scale-[1.15] sm:scale-125 z-10 transition-transform duration-500 group-hover:scale-125 group-hover:-translate-y-[50%]">
                                         <CabinetSVG islandId={selectedIsland.id} mode="hall" visualState="FREE" charId={selectedIsland.hostess_char_id} />
                                    </div>
                                    <div className="absolute right-[-40px] sm:right-[-60px] bottom-0 w-[70%] sm:w-[65%] h-[70%] drop-shadow-2xl transition-transform duration-700 group-hover:scale-[1.08] group-hover:translate-x-[-15px] z-20">
                                        <CharacterSVG type={selectedIsland.hostess_char_id} mood="idle" />
                                    </div>

                                    {/* Info Banner */}
                                    <div className="absolute bottom-6 left-5 sm:left-8 right-5 sm:right-8 z-30">
                                        <div className="flex gap-2 mb-1 sm:mb-2">
                                            <div className={`text-[9px] sm:text-[10px] font-black tracking-widest flex items-center gap-1.5 px-2.5 py-1 rounded backdrop-blur-md border shadow-lg uppercase 
                                                ${isOwned ? `bg-black/70 ${selectedIsland.theme.text} ${selectedIsland.theme.border}` : 'bg-red-950/80 text-red-400 border-red-500/50'}`}>
                                                {isOwned ? <><MapPin size={12}/> OPEN WORLD</> : <><Lock size={12}/> RESTRICTED</>}
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
                                        
                                        {!isOwned && (
                                            <div className="mt-3 bg-black/80 backdrop-blur-md border border-gray-700 p-3 rounded-xl shadow-lg">
                                                <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest">
                                                    <span>VIP Progression</span>
                                                    <span className="text-yellow-500 font-mono">
                                                        {userStats.totalDeposited.toLocaleString()} / {selectedIsland.reqDeposit.toLocaleString()} <span className="text-[8px] text-gray-500">MMK</span>
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-yellow-500 transition-all duration-1000 shadow-[0_0_5px_gold]" 
                                                        style={{ width: `${Math.min(100, (userStats.totalDeposited / selectedIsland.reqDeposit) * 100)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="mt-2 flex items-center gap-1.5 text-red-400 text-[10px] font-bold">
                                                    <AlertTriangle size={12} className="opacity-70" /> DEPOSIT MORE TO UNLOCK
                                                </div>
                                            </div>
                                        )}
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