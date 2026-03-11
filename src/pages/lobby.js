import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; 
import api, { game, user as userApi } from '../services/api';
import { 
    ChevronLeft, ChevronRight, Lock, Coins, MapPin, Loader2, 
    Bell, Trophy, Calendar, ClipboardList, CheckCircle, AlertTriangle, 
    Users, Activity, Flame, Layers, Sparkles, Zap
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

export default function Lobby() {
    const { user, loading, updateBalance } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    
    // Core State
    const [islands, setIslands] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
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
    const [showMissions, setShowMissions] = useState(false); 
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [missions, setMissions] = useState([]);
    const [serverPing, setServerPing] = useState(true);

    const { playSound } = useGameSound();

    // Trigger Coin Shower function for celebrations
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

    // --- 2. FETCH LIVE DATA ---
    useEffect(() => {
        const initLobby = async () => {
            if (isAppLoading) return;

            try {
                const [resIslands, resNotifs, resMissions, resProfile, resTicker] = await Promise.all([
                    game.getIslands(),
                    userApi.getNotifications(),
                    api.get('/game/missions.php'),
                    userApi.getProfile(),
                    game.getTicker()
                ]);

                if (resIslands.data.status === 'success') {
                    // Update to support NEW V3 Island Names and progression requirements
                    const progressionIslands = resIslands.data.data.map(island => {
                        let reqDeposit = parseFloat(island.req_deposit) || 0;
                        let totalMachines = 0;
                        let productionName = island.name;
                        
                        // Hard-syncing names and floor-logic for V3 Deployment
                        switch(parseInt(island.id)) {
                            case 1: 
                                totalMachines = 900; 
                                productionName = "Kyoto Zen";
                                break;
                            case 2: 
                                totalMachines = 720; 
                                productionName = "Okinawa Tropic";
                                break;
                            case 3: 
                                totalMachines = 540; 
                                productionName = "Osaka Neon";
                                break;
                            case 4: 
                                totalMachines = 360; 
                                productionName = "Tokyo Cyber";
                                break;
                            case 5: 
                                totalMachines = 180; 
                                productionName = "Ginza Gold";
                                break;
                            default: 
                                totalMachines = 200;
                        }
                        return { ...island, name: productionName, reqDeposit, totalMachines };
                    });
                    setIslands(progressionIslands);
                }
                
                if (resNotifs.data.status === 'success') setUnreadCount(resNotifs.data.count || 0);
                if (resMissions.data.status === 'success') setMissions(resMissions.data.data);
                if (resProfile.data.status === 'success') setUserStats({ totalDeposited: resProfile.data.user.total_deposited || 0 });

                if (resTicker.data.status === 'success') {
                    setJackpotAmount(resTicker.data.jackpot_amount || 3000000);
                    prevJackpotRef.current = resTicker.data.jackpot_amount || 3000000;
                    setActivePlayers(Math.floor(Math.random() * 500) + 1200);
                    setServerPing(true);
                }

                // STRICT 24-HOUR DAILY BONUS CHECK
                if (user) {
                    const lastClaimStr = localStorage.getItem(`daily_claim_time_${user.id}`);
                    const now = new Date().getTime();
                    const hours24 = 86400000; 
                    if (!lastClaimStr || (now - parseInt(lastClaimStr) > hours24)) {
                        setTimeout(() => setShowDailyBonus(true), 1500);
                    }
                }
            } catch (e) { 
                console.error("Lobby initialization failed", e);
                addToast("Connection to game server unstable.", 'error');
                setServerPing(false);
            }
        };

        if (!loading && user) initLobby();
    }, [loading, user, addToast, isAppLoading]);

    // --- LIVE JACKPOT POLLING & CELEBRATION DETECTION ---
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await game.getTicker();
                if (res.data.status === 'success' && res.data.jackpot_amount) {
                    const newJp = res.data.jackpot_amount;
                    
                    // Detect a Jackpot Win! (If it drops by more than 500k instantly)
                    if (prevJackpotRef.current !== null && (prevJackpotRef.current - newJp > 500000)) {
                        playSound('bigwin');
                        setShowJpCelebration(true);
                        triggerCoinShower();
                        setTimeout(() => setShowJpCelebration(false), 8000);
                    }
                    
                    setJackpotAmount(newJp);
                    prevJackpotRef.current = newJp;
                    setServerPing(true);
                }
            } catch (e) {
                setServerPing(false);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [playSound, triggerCoinShower]);

    // Navigation
    const handleNav = (direction) => {
        playSound('click');
        if (islands.length === 0) return;
        setIsTransitioning(true);
        setTimeout(() => {
            if (direction === 'next') setCurrentIndex((prev) => (prev + 1) % islands.length);
            else setCurrentIndex((prev) => (prev - 1 + islands.length) % islands.length);
            setIsTransitioning(false);
        }, 300);
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
            setShowUnlockModal(true);
            return;
        }
        router.push(`/game/${island.id}`);
    };

    const claimMission = async (id, reward) => {
        playSound('click');
        try {
            const res = await api.post('/game/missions.php', { mission_id: id });
            if (res.data.status === 'success') {
                playSound('win');
                updateBalance(res.data.new_balance);
                addToast(`Mission Completed! +${reward} MMK`, 'success');
                setMissions(prev => prev.map(m => m.id === id ? { ...m, claimed: true } : m));
            }
        } catch (e) {
            addToast(e.response?.data?.error || "Failed to claim", 'error');
        }
    };

    // --- INITIAL LOADING SCREEN ---
    if (loading || isAppLoading) {
        return (
            <div className="bg-[#050505] min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/seigaiha.png')] opacity-10 animate-[pulse_5s_infinite]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/20 via-black to-black"></div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 flex flex-col items-center"
                >
                    <h1 className="text-4xl font-black text-white italic tracking-widest mb-2 drop-shadow-[0_0_15px_rgba(255,192,203,0.5)]">
                        SUROPARA
                    </h1>
                    <div className="text-[10px] text-pink-400 font-bold tracking-[0.3em] mb-8">スロパラダイス</div>

                    {isAppLoading && (
                        <div className="w-64">
                            <div className="flex justify-between text-[9px] text-gray-400 font-mono mb-1 uppercase">
                                <span>Caching Assets...</span>
                                <span>{cacheProgress}%</span>
                            </div>
                            <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden border border-white/10 relative">
                                <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 shadow-[0_0_10px_pink] transition-all duration-200" style={{width: `${cacheProgress}%`}}></div>
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
    if (isJPCritical) {
        jpContainerClass += "bg-gradient-to-b from-purple-900/60 to-black/90 border-2 border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.6)] animate-[shake-epic_0.5s_infinite]";
    } else if (isJPHot) {
        jpContainerClass += "bg-gradient-to-b from-red-900/60 to-black/90 border border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)] animate-pulse";
    } else {
        jpContainerClass += "bg-gradient-to-b from-yellow-900/30 to-black/80 border border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.2)]";
    }

    return (
        <div className="min-h-[100dvh] bg-[#050505] pb-[90px] relative overflow-hidden flex flex-col selection:bg-pink-500 selection:text-black font-sans">
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes shake-epic { 0%, 100% { transform: translate(0,0) rotate(0deg); } 10%, 30%, 50%, 70%, 90% { transform: translate(-2px, 2px) rotate(-1deg); } 20%, 40%, 60%, 80% { transform: translate(2px, -2px) rotate(1deg); } }
            `}} />

            <SakuraParticles />

            {/* Global Ticker & Events */}
            <div className="relative z-50"><GlobalTicker /></div>
            <ActiveEvents />

            {/* --- RESPONSIVE HEADER --- */}
            <div className="pt-3 px-4 sm:px-6 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center z-20 bg-gradient-to-b from-black/95 to-transparent backdrop-blur-sm sticky top-8 gap-3 sm:gap-0 border-b border-white/5">
                
                {/* Level Progress (RPG Style) */}
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                         <div className="flex items-center gap-2">
                             <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_10px_rgba(236,72,153,0.6)]">
                                 <span className="text-white font-black text-xs italic">{user.level}</span>
                             </div>
                             <div className="flex flex-col">
                                 <span className="text-[9px] text-pink-300 font-bold tracking-widest uppercase">Rank / 段位</span>
                                 <div className="w-24 sm:w-32 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-white/10 mt-0.5">
                                    <div className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-1000 shadow-[0_0_5px_pink]" style={{width: `${user.progress_percent || 0}%`}}></div>
                                </div>
                             </div>
                         </div>
                         <div className={`flex sm:hidden items-center gap-1 text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full border ${serverPing ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-red-500 border-red-500/30 bg-red-500/10'}`}>
                             <Activity size={10} className={serverPing ? 'animate-pulse' : ''} />
                             {serverPing ? 'LIVE' : 'DISC'}
                         </div>
                    </div>
                </div>

                {/* Action Buttons & Static Balance Display */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-4">
                    <div className="flex gap-2">
                        <button onClick={() => { playSound('click'); setShowMissions(true); }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-950/50 border border-blue-500/40 flex items-center justify-center text-blue-400 hover:bg-blue-500/30 active:scale-95 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <ClipboardList size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => { playSound('click'); setShowDailyBonus(true); }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-950/50 border border-green-500/40 flex items-center justify-center text-green-400 hover:bg-green-500/30 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                            <Calendar size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => { playSound('click'); router.push('/tournaments'); }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-950/50 border border-yellow-500/40 flex items-center justify-center text-yellow-400 hover:bg-yellow-500/30 active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                            <Trophy size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => { playSound('click'); router.push('/notifications'); }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all relative">
                            <Bell size={16} className="sm:w-5 sm:h-5" />
                            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-600 text-white rounded-full border border-black flex items-center justify-center text-[8px] sm:text-[10px] font-black animate-bounce">{unreadCount > 9 ? '!' : unreadCount}</span>}
                        </button>
                    </div>

                    <div className="bg-black/60 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-yellow-500/40 flex items-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(234,179,8,0.15)] cursor-default">
                        <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 animate-pulse" />
                        <span className="text-yellow-400 font-mono font-black text-sm sm:text-base tracking-tight">{parseFloat(user.balance).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* --- LIVE GRAND JACKPOT DISPLAY --- */}
            <div className="relative z-20 px-4 sm:px-6 mt-3 mb-2 flex flex-col items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={jpContainerClass}
                >
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
                         {isJPCritical ? (
                             <span className="bg-purple-600 text-white font-bold px-3 py-0.5 rounded-full text-[9px] tracking-widest uppercase border border-white/50 shadow-[0_0_15px_purple]">CRITICAL MASS DETECTED</span>
                         ) : isJPHot ? (
                             <span className="bg-red-600 text-white font-bold px-3 py-0.5 rounded-full text-[9px] tracking-widest uppercase shadow-[0_0_10px_red]">TRIGGER HOT</span>
                         ) : null}
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 z-10">
                        <div 
                            className={`h-full transition-all duration-500 shadow-[0_0_10px_currentColor] ${isJPCritical ? 'bg-purple-500 text-purple-500' : isJPHot ? 'bg-red-500 text-red-500' : 'bg-yellow-500 text-yellow-500'}`} 
                            style={{ width: `${jpProgressPercent}%` }} 
                        />
                    </div>
                </motion.div>
                
                {/* Active Players */}
                <div className="mt-3 flex items-center gap-1.5 text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest backdrop-blur-sm shadow-lg">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
                    <Users size={12} /> {activePlayers.toLocaleString()} PLAYERS ONLINE
                </div>
            </div>

            {/* --- 3D ISLAND CAROUSEL --- */}
            <div className="flex-1 relative flex items-center justify-center perspective-1000 mt-2 sm:mt-4 mb-6">
                <div className="absolute inset-0 transition-colors duration-1000 opacity-60 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

                <button onClick={() => handleNav('prev')} className="absolute left-2 sm:left-6 z-30 p-2 sm:p-4 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 border border-white/20 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <ChevronLeft size={24} className="sm:w-8 sm:h-8"/>
                </button>
                <button onClick={() => handleNav('next')} className="absolute right-2 sm:right-6 z-30 p-2 sm:p-4 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 border border-white/20 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <ChevronRight size={24} className="sm:w-8 sm:h-8"/>
                </button>

                {selectedIsland && (
                    <div 
                        className={`relative w-[85%] sm:w-[70%] md:max-w-[450px] h-[50vh] sm:h-[55vh] md:h-[60vh] group cursor-pointer transform-style-3d transition-all duration-500 ease-out ${isTransitioning ? 'scale-90 opacity-40 rotate-y-12' : 'scale-100 opacity-100'}`} 
                        onClick={() => handleEnter(selectedIsland)}
                    >
                        <div className={`w-full h-full rounded-[2rem] overflow-hidden border-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative transition-all duration-500 ${!isOwned ? 'grayscale border-gray-800' : 'border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:border-pink-400 hover:shadow-[0_0_50px_rgba(236,72,153,0.5)]'}`}>
                            
                            {/* Background Image/SVG */}
                            <div className="absolute inset-0 bg-gray-900 scale-110 transition-transform duration-[15s] ease-linear group-hover:scale-125 group-hover:rotate-2">
                                <IslandLandscapeSVG islandId={selectedIsland.id} />
                            </div>
                            
                            {/* Overlay Glassmorphism */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 mix-blend-overlay"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                            
                            {/* Cabinet & Character Projection */}
                            <div className="absolute left-[45%] top-[45%] transform -translate-x-1/2 -translate-y-1/2 scale-[1.15] sm:scale-125 z-10 transition-transform duration-500 group-hover:scale-125 group-hover:-translate-y-[50%] pointer-events-none">
                                 <CabinetSVG islandId={selectedIsland.id} mode="hall" visualState="FREE" charId={selectedIsland.hostess_char_id} />
                            </div>
                            <div className="absolute right-[-40px] sm:right-[-60px] bottom-0 w-[70%] sm:w-[65%] h-[70%] drop-shadow-2xl transition-transform duration-700 group-hover:scale-[1.08] group-hover:translate-x-[-15px] z-20 pointer-events-none">
                                <CharacterSVG type={selectedIsland.hostess_char_id} mood="idle" />
                            </div>

                            {/* Info Banner */}
                            <div className="absolute bottom-6 left-5 sm:left-8 z-30 pr-4">
                                <div className="flex gap-2 mb-1 sm:mb-2">
                                    <div className={`text-[9px] sm:text-[10px] font-black tracking-widest flex items-center gap-1.5 px-2.5 py-1 rounded backdrop-blur-md border shadow-lg uppercase ${isOwned ? 'bg-black/70 text-pink-400 border-pink-500/50' : 'bg-red-950/80 text-red-400 border-red-500/50'}`}>
                                        {isOwned ? <><MapPin size={12}/> OPEN WORLD</> : <><Lock size={12}/> RESTRICTED</>}
                                    </div>
                                    <div className="bg-black/70 text-cyan-400 border border-cyan-500/50 text-[9px] sm:text-[10px] font-black tracking-widest flex items-center gap-1 px-2.5 py-1 rounded backdrop-blur-md shadow-lg">
                                        <Layers size={12}/> {selectedIsland.totalMachines} MACHINES
                                    </div>
                                </div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase text-white drop-shadow-[0_0_15px_rgba(0,0,0,1)] leading-[0.9] mb-1.5 sm:mb-2">
                                    {selectedIsland.name}
                                </h1>
                                <p className="text-[10px] sm:text-xs text-gray-300 max-w-[140px] sm:max-w-[200px] leading-tight mb-2 sm:mb-3 drop-shadow-md line-clamp-2 font-serif">
                                    {selectedIsland.desc || "Enter the grid..."}
                                </p>
                                
                                {!isOwned && (
                                    <div className="mt-2 bg-red-900/80 border border-red-500/50 text-red-100 text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-fit shadow-[0_0_10px_red]">
                                        <AlertTriangle size={12} fill="currentColor" className="text-red-500"/> RANK UP TO UNLOCK
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Dots Pagination */}
            <div className="h-6 flex justify-center gap-2 items-center z-20 relative top-[-10px]">
                {islands.map((_, idx) => (
                    <div key={idx} className={`transition-all duration-300 rounded-full ${idx === currentIndex ? 'bg-pink-400 w-6 sm:w-8 h-1.5 sm:h-2 shadow-[0_0_10px_pink]' : 'bg-gray-700 w-1.5 sm:w-2 h-1.5 sm:h-2 hover:bg-gray-500'}`} />
                ))}
            </div>

            {/* --- GLOBAL JACKPOT WINNER OVERLAY CELEBRATION --- */}
            <AnimatePresence>
                {showJpCelebration && (
                    <motion.div 
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(15px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 overflow-hidden pointer-events-none"
                    >
                        {/* Celebration Particles */}
                        {coinParticles.map(c => (
                            <div key={c.id} className="absolute top-[-20px] animate-fall z-0" style={{ left: `${c.left}%`, animationDuration: '3s', animationDelay: `${c.delay}s`, transform: `scale(${c.scale}) rotate(${c.rotation}deg)` }}>
                                <div className="w-8 h-8 bg-yellow-400 rounded-full border-4 border-yellow-200 shadow-[0_0_15px_gold] flex items-center justify-center font-black text-yellow-700 text-lg"><Coins size={16} strokeWidth={3}/></div>
                            </div>
                        ))}

                        <motion.div 
                            initial={{ scale: 0.5, y: 100 }} 
                            animate={{ scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 15 } }} 
                            className="relative z-10 flex flex-col items-center w-full max-w-lg"
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 mix-blend-color-dodge animate-[spin_30s_linear_infinite] rounded-full blur-3xl"></div>
                            
                            <GlassCard className="w-full p-8 sm:p-12 text-center flex flex-col items-center border-t-8 border-b-8 border-yellow-400 shadow-[0_0_100px_rgba(255,215,0,0.6)] bg-gradient-to-br from-yellow-900/60 to-black">
                                <motion.div animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }} className="mb-4">
                                    <Trophy size={80} className="text-yellow-400 drop-shadow-[0_0_30px_gold] mx-auto" />
                                </motion.div>
                                
                                <h1 className="text-4xl sm:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-orange-500 to-red-600 drop-shadow-2xl mb-2 animate-pulse uppercase tracking-tighter">
                                    JACKPOT HIT!
                                </h1>
                                <p className="text-yellow-400 font-bold text-sm sm:text-lg tracking-widest font-serif mb-6 drop-shadow-md">
                                    [ 奇跡の大当り ]
                                </p>
                                
                                <div className="text-gray-300 text-xs sm:text-sm bg-black/50 px-6 py-3 rounded-full border border-white/20 mb-6 shadow-inner">
                                    A lucky player just cracked the vault!
                                </div>
                                
                                <div className="mt-2 text-cyan-400 font-mono text-[10px] animate-pulse">
                                    POOL RESET & BUILDING NOW
                                </div>
                            </GlassCard>
                            
                            {/* Cheering character */}
                            <motion.div 
                                initial={{ y: 200, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, type: "spring", damping: 12 }}
                                className="absolute -bottom-24 -right-10 w-48 h-48 drop-shadow-2xl pointer-events-none"
                            >
                                <CharacterSVG type="luna" mood="win" />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MODALS --- */}
            
            <AnimatePresence>
                {showUnlockModal && selectedIsland && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md" 
                        onClick={() => setShowUnlockModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-sm p-0 overflow-hidden bg-white/5 border border-red-500/50 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.2)] relative" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                            
                            <div className="bg-gradient-to-r from-red-950 to-black p-4 sm:p-5 flex justify-between items-center border-b border-red-500/30 relative z-10">
                                <h3 className="text-white font-black text-lg sm:text-xl flex items-center gap-2 tracking-widest italic">
                                    <Lock size={20} className="text-red-500"/> ACCESS DENIED <span className="text-red-700 font-serif text-sm">[ アクセス拒否 ]</span>
                                </h3>
                                <button onClick={() => setShowUnlockModal(false)} className="text-white/50 hover:text-white bg-white/5 p-1.5 rounded-full transition-colors"><X size={20}/></button>
                            </div>
                            
                            <div className="p-5 sm:p-6 bg-black/95 relative z-10">
                                <p className="text-xs sm:text-sm text-gray-300 mb-5 leading-relaxed text-center">
                                    <strong className="text-white text-base block mb-1">{selectedIsland.name}</strong> 
                                    is a High Roller sector. You must increase your VIP Rank to gain entry.
                                </p>

                                <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div className="flex justify-between text-[10px] sm:text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                                        <span>VIP Progress</span>
                                        <span className={userStats.totalDeposited >= selectedIsland.reqDeposit ? "text-green-400" : "text-white font-mono"}>
                                            {((userStats.totalDeposited / selectedIsland.reqDeposit) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 sm:h-3 bg-gray-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                        <div className={`h-full transition-all duration-1000 ${userStats.totalDeposited >= selectedIsland.reqDeposit ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_10px_red]'}`} 
                                             style={{ width: `${Math.min(100, (userStats.totalDeposited / selectedIsland.reqDeposit) * 100 || 0)}%` }}></div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <button 
                                        onClick={() => setShowUnlockModal(false)}
                                        className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/20"
                                    >
                                        RETURN
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Missions Modal */}
            <AnimatePresence>
                {showMissions && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm" 
                        onClick={() => setShowMissions(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-md p-0 overflow-hidden bg-white/5 border border-blue-500/50 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.2)]" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bg-gradient-to-r from-blue-950 to-black p-4 sm:p-5 flex justify-between items-center border-b border-blue-500/30">
                                <h2 className="text-lg sm:text-xl font-black text-white italic tracking-widest flex items-center gap-2">
                                    <ClipboardList size={20} className="text-blue-500"/> NINMU <span className="text-blue-500 font-serif text-sm">[ 任務 ]</span>
                                </h2>
                                <button onClick={() => setShowMissions(false)} className="text-white/50 hover:text-white bg-white/5 p-1.5 rounded-full"><X size={20}/></button>
                            </div>
                            <div className="p-3 sm:p-5 space-y-2 sm:space-y-3 bg-black/95 max-h-[65vh] overflow-y-auto hide-scrollbar">
                                {missions.length === 0 ? (
                                    <div className="text-center text-gray-500 text-xs py-8 font-mono">NO_ACTIVE_DIRECTIVES</div>
                                ) : (
                                    missions.map(m => (
                                        <div key={m.id} className={`bg-white/5 border p-3 sm:p-4 rounded-xl relative overflow-hidden group transition-colors ${m.claimed ? 'border-green-500/20 opacity-60' : 'border-white/10 hover:bg-white/10'}`}>
                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                <div className="text-xs sm:text-sm font-bold text-white max-w-[70%] leading-tight">{m.task}</div>
                                                <div className="text-[10px] sm:text-xs text-yellow-400 font-mono font-bold bg-yellow-950/50 px-2 py-1 rounded-md border border-yellow-500/30 shadow-inner">
                                                    +{m.reward.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="w-full h-1.5 sm:h-2 bg-black rounded-full overflow-hidden mb-3 border border-white/5 shadow-inner">
                                                <div className={`h-full transition-all duration-1000 ${m.claimed ? 'bg-green-500' : 'bg-blue-500 shadow-[0_0_10px_blue]'}`} style={{width: `${Math.min(100, (m.progress/m.total)*100)}%`}}></div>
                                            </div>
                                            <div className="flex justify-between items-center relative z-10">
                                                <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono tracking-widest">{m.progress.toLocaleString()} / {m.total.toLocaleString()}</span>
                                                {m.claimed ? (
                                                    <span className="text-[9px] sm:text-[10px] text-green-500 font-black tracking-wider flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded">
                                                        <CheckCircle size={12}/> EXECUTED
                                                    </span>
                                                ) : (
                                                    <button onClick={() => claimMission(m.id, m.reward)} disabled={m.progress < m.total} className={`text-[9px] sm:text-[10px] px-4 py-1.5 sm:py-2 rounded-lg font-black tracking-widest transition-all ${m.progress >= m.total ? 'bg-cyan-500 text-black hover:bg-cyan-400 active:scale-95 shadow-[0_0_15px_cyan]' : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/10'}`}>
                                                        CLAIM <span className="font-serif">[ 報酬 ]</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showDailyBonus && <DailyBonusModal onClose={() => setShowDailyBonus(false)} />}

            {/* Bottom Dock */}
            <div className="relative z-50">
                <BottomDock activeCharId={user?.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} />
            </div>
        </div>
    );
}