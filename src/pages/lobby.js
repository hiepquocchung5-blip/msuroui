import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; 
import api, { game, user as userApi } from '../services/api';

import { 
    ChevronLeft, ChevronRight, Lock, Coins, MapPin, Loader2, 
    Bell, Trophy, Calendar, ClipboardList, Activity, Layers, 
    Sparkles, Zap, ShieldAlert, Users, Hexagon, Cpu, Terminal
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

// --- LEVIATHAN GJP MATRIX (V9 PARITY) ---
const GJP_THRESHOLDS = {
    1: { base: 3000000, trigger: 3600000, max: 7200000 },
    2: { base: 4000000, trigger: 4500000, max: 8100000 },
    3: { base: 5000000, trigger: 6000000, max: 10000000 },
    4: { base: 7500000, trigger: 9000000, max: 15000000 },
    5: { base: 10000000, trigger: 12000000, max: 20000000 }
};

// --- AAA OPTIMIZATION: 60FPS DOM Mutation Counter (Zero React Re-renders) ---
const RollupNumber = memo(({ value }) => {
    const nodeRef = useRef(null);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;
        
        const end = parseInt(value) || 0;
        let start = parseInt(node.textContent.replace(/,/g, '')) || 0;
        if (start === end) return;
        
        const duration = 800; // Snappy 800ms rollup
        let startTime = null;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // EaseOutCubic function for buttery smooth deceleration
            const current = Math.floor(start + (end - start) * (1 - Math.pow(1 - progress, 3)));
            
            node.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }, [value]);

    return <span ref={nodeRef}>0</span>;
});
RollupNumber.displayName = 'RollupNumber';

// --- AAA OPTIMIZATION: Hardware Accelerated Background Reels ---
const BackgroundReels = memo(({ islandId }) => {
    const symbols = [1, 2, 3, 4, 5, 6, 7];
    const columns = useMemo(() => [
        { dir: 'up', speed: '30s', opacity: 'opacity-10', size: 'w-24 h-24 sm:w-32 sm:h-32', delay: '0s' },
        { dir: 'down', speed: '40s', opacity: 'opacity-5', size: 'w-32 h-32 sm:w-48 sm:h-48', delay: '-5s' },
        { dir: 'up', speed: '25s', opacity: 'opacity-10', size: 'w-20 h-20 sm:w-28 sm:h-28', delay: '-10s' },
        { dir: 'down', speed: '45s', opacity: 'opacity-5', size: 'w-40 h-40 sm:w-56 sm:h-56', delay: '-2s' },
        { dir: 'up', speed: '35s', opacity: 'opacity-10', size: 'w-28 h-28 sm:w-36 sm:h-36', delay: '-15s' },
    ], []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex justify-between px-[-5%] sm:px-[5%]">
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes roll-up { 0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(0, -50%, 0); } }
                @keyframes roll-down { 0% { transform: translate3d(0, -50%, 0); } 100% { transform: translate3d(0, 0, 0); } }
            `}} />
            {columns.map((col, i) => (
                <div key={i} className="h-[200vh] flex flex-col items-center justify-start overflow-visible transform-gpu" style={{ width: '20%' }}>
                    <div 
                        className="flex flex-col gap-12 sm:gap-24 will-change-transform transform-gpu"
                        style={{ animation: `${col.dir === 'up' ? 'roll-up' : 'roll-down'} ${col.speed} linear infinite`, animationDelay: col.delay }}
                    >
                        {/* Reduced DOM depth and removed expensive mix-blend-screen for mobile GPUs */}
                        {[...symbols, ...symbols].map((sym, j) => (
                            <div key={j} className={`${col.size} ${col.opacity} grayscale-[50%] transition-opacity duration-1000 transform-gpu`}>
                                <SymbolSVG id={sym} islandId={islandId} variant="dim" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] transform-gpu translate-z-0"></div>
        </div>
    );
});
BackgroundReels.displayName = 'BackgroundReels';

// --- FRAMER MOTION CAROUSEL CONFIG (V9 Smooth Physics) ---
const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.9,
        rotateY: direction > 0 ? 15 : -15, // Reduced rotation for cleaner V9 aesthetic
        zIndex: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
        rotateY: 0,
        transition: {
            x: { type: "spring", stiffness: 300, damping: 30 }, // Snappier response
            opacity: { duration: 0.3 },
            rotateY: { type: "spring", stiffness: 300, damping: 30 },
            scale: { duration: 0.4, ease: "easeOut" }
        }
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.9,
        rotateY: direction < 0 ? 15 : -15,
        transition: {
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
        }
    })
};

// Sub-component for SysLog to prevent full lobby re-renders
const SystemLogPanel = memo(({ activePlayers, sysLog, topOperatives }) => (
    <div className="flex flex-col justify-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 px-5 py-4 rounded-3xl w-full sm:w-auto min-w-[250px] shadow-2xl">
        <div className="flex items-center justify-between w-full text-cyan-400 text-[10px] font-bold tracking-widest uppercase">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_cyan]"></span>
                <Users size={14} className="opacity-80" /> 
                <span>NETWORK</span>
            </div>
            <span className="text-white font-mono">{activePlayers.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2 border-t border-white/5 pt-2">
            <Terminal size={10} className="text-gray-500" />
            <span className="text-[8px] text-gray-400 font-mono uppercase tracking-widest truncate max-w-[150px]">
                {sysLog}
            </span>
        </div>

        {topOperatives.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-white/5 w-full">
                <span className="text-[9px] text-gray-500 font-bold tracking-widest uppercase flex items-center">
                    <Trophy size={10} className="mr-1 text-yellow-500/50"/> TOP OP
                </span>
                <div className="flex -space-x-2 hover:space-x-1 transition-all duration-300">
                    {topOperatives.map((op) => (
                        <div key={op.id} className="w-7 h-7 rounded-full bg-[#111] border border-white/20 relative overflow-hidden flex items-center justify-center shadow-md hover:scale-110 hover:z-20 transition-transform transform-gpu" title={op.username}>
                            <div className="absolute inset-0 scale-[1.3] pt-1 opacity-90">
                                <CharacterSVG type={op.active_pet_id || 'luna'} mood="idle" stickerMode={true} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
));
SystemLogPanel.displayName = 'SystemLogPanel';

export default function Lobby() {
    const { user, loading, updateBalance } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const { playSound } = useGameSound();
    
    const [islands, setIslands] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    
    // Live Ticker & Community State
    const [jackpotAmount, setJackpotAmount] = useState(3000000);
    const [activePlayers, setActivePlayers] = useState(0);
    const [topOperatives, setTopOperatives] = useState([]); 
    const [sysLog, setSysLog] = useState('MONITORING SECTORS...');
    
    const [userStats, setUserStats] = useState({ totalDeposited: 0 });
    const [showDailyBonus, setShowDailyBonus] = useState(false);
    const [serverPing, setServerPing] = useState(true);

    const selectedIsland = useMemo(() => islands.length > 0 ? islands[currentIndex] : null, [islands, currentIndex]);

    // --- FAULT-TOLERANT DATA FETCHING ---
    useEffect(() => {
        const initLobby = async () => {
            try {
                const results = await Promise.allSettled([
                    game.getIslands(), 
                    userApi.getNotifications(), 
                    userApi.getProfile(),
                    game.getLeaderboard('balance')
                ]);

                const [resIslands, resNotifs, resProfile, resLeaderboard] = results;

                if (resIslands.status === 'fulfilled' && resIslands.value?.data?.status === 'success') {
                    const progressionIslands = resIslands.value.data.data.map(island => {
                        let reqDeposit = parseFloat(island.req_deposit) || 0;
                        let totalMachines = 0;
                        
                        let theme = { 
                            bgGrad: 'from-gray-900/50', border: 'border-gray-500/40', hoverBorder: 'hover:border-gray-400', 
                            shadow: 'shadow-[0_20px_50px_rgba(156,163,175,0.05)]', text: 'text-gray-400', bgBadge: 'bg-gray-800', accentColor: '#9ca3af'
                        };

                        switch(parseInt(island.id)) {
                            case 1: totalMachines = 900; theme = { ...theme, bgGrad: 'from-red-900/50', border: 'border-red-500/40', text: 'text-red-400', bgBadge: 'bg-red-900', accentColor: '#ef4444' }; break;
                            case 2: totalMachines = 720; theme = { ...theme, bgGrad: 'from-cyan-900/50', border: 'border-cyan-500/40', text: 'text-cyan-400', bgBadge: 'bg-cyan-900', accentColor: '#06b6d4' }; break;
                            case 3: totalMachines = 540; theme = { ...theme, bgGrad: 'from-orange-900/50', border: 'border-orange-500/40', text: 'text-orange-400', bgBadge: 'bg-orange-900', accentColor: '#f97316' }; break;
                            case 4: totalMachines = 360; theme = { ...theme, bgGrad: 'from-pink-900/50', border: 'border-pink-500/40', text: 'text-pink-400', bgBadge: 'bg-pink-900', accentColor: '#ec4899' }; break;
                            case 5: totalMachines = 180; theme = { ...theme, bgGrad: 'from-purple-900/50', border: 'border-purple-500/40', text: 'text-purple-400', bgBadge: 'bg-purple-900', accentColor: '#a855f7' }; break;
                            default: totalMachines = 200;
                        }
                        return { ...island, reqDeposit, totalMachines, theme };
                    });
                    setIslands(progressionIslands);
                }
                
                if (resNotifs.status === 'fulfilled' && resNotifs.value?.data?.status === 'success') {
                    setUnreadCount(resNotifs.value.data.count || 0);
                }
                
                if (resProfile.status === 'fulfilled' && resProfile.value?.data?.status === 'success') {
                    setUserStats({ totalDeposited: parseFloat(resProfile.value.data.user.total_deposited) || 0 });
                    if (resProfile.value.data.user.balance !== undefined) {
                        updateBalance(resProfile.value.data.user.balance); 
                    }
                }

                if (resLeaderboard.status === 'fulfilled' && resLeaderboard.value?.data?.status === 'success') {
                    setTopOperatives(resLeaderboard.value.data.list.slice(0, 5));
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
            } finally {
                setIsDataLoaded(true);
            }
        };

        if (!loading && user) initLobby();
    }, [loading, user]);

    // --- DYNAMIC TELEMETRY LOGS ---
    useEffect(() => {
        if (!isDataLoaded) return;
        const logs = [
            `ROUTING PACKETS TO SECTOR 0${selectedIsland?.id || 1}...`,
            `VALIDATING AES-256 SECURE LINK...`,
            `UPDATING LIQUIDITY POOLS...`,
            `MONITORING ACTIVE TERMINALS...`,
            `SYSTEM OPTIMAL. NO ANOMALIES.`
        ];
        let idx = 0;
        const interval = setInterval(() => {
            setSysLog(logs[idx]);
            idx = (idx + 1) % logs.length;
        }, 4000);
        return () => clearInterval(interval);
    }, [isDataLoaded, selectedIsland?.id]);

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
                    
                    const basePlayers = selectedIsland.id === 1 ? 1500 : (selectedIsland.id === 5 ? 300 : 800);
                    setActivePlayers(basePlayers + Math.floor(Math.random() * 150) - 75); 
                }
            } catch (e) { 
                setServerPing(false); 
            }
        };

        if (isDataLoaded) {
            fetchIslandJackpot(); 
            const interval = setInterval(fetchIslandJackpot, 10000); 
            return () => clearInterval(interval);
        }
    }, [selectedIsland?.id, isDataLoaded]);

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

    const handleEnter = async (island) => {
        playSound('click');
        const isOwned = island.id === 1 || island.reqDeposit === 0 || userStats.totalDeposited >= island.reqDeposit;
        
        if (!isOwned) {
            addToast(`Deposit required to breach this sector.`, 'error');
            return;
        }
        router.push(`/game/${island.id}`);
    };

    // --- LOADING STATE ---
    if (loading || !isDataLoaded || islands.length === 0) {
        return (
            <div className="bg-[#050505] min-h-screen flex flex-col items-center justify-center font-mono">
                <Cpu size={48} className="text-cyan-500 mb-4 animate-pulse drop-shadow-[0_0_15px_cyan]" />
                <h2 className="text-white font-black italic tracking-[0.3em] uppercase">INITIALIZING LOBBY</h2>
                <div className="text-[10px] text-cyan-400/80 mt-2 flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" /> DECRYPTING SECTOR HASHES...
                </div>
                <div className="w-48 h-1 bg-gray-900 mt-6 rounded-full overflow-hidden transform-gpu">
                    <div className="h-full bg-cyan-500 w-1/2 animate-[marquee_1s_ease-in-out_infinite]"></div>
                </div>
            </div>
        );
    }

    const gjpLimits = GJP_THRESHOLDS[selectedIsland?.id] || GJP_THRESHOLDS[1];
    const jpProgressPercent = Math.min(100, Math.max(0, ((jackpotAmount - gjpLimits.base) / (gjpLimits.max - gjpLimits.base)) * 100));
    
    const isJPHot = jackpotAmount >= gjpLimits.trigger && jackpotAmount < gjpLimits.max;
    const isJPCritical = jackpotAmount >= gjpLimits.max;
    const isOwned = selectedIsland.id === 1 || selectedIsland.reqDeposit === 0 || userStats.totalDeposited >= selectedIsland.reqDeposit;

    return (
        <div className="min-h-[100dvh] bg-[#050505] pb-[90px] relative overflow-hidden flex flex-col selection:bg-cyan-500 selection:text-black font-sans overscroll-none touch-pan-y">
            
            {/* Background Architecture */}
            <BackgroundReels islandId={selectedIsland?.id || 1} />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0 transform-gpu translate-z-0" />
            
            <div className="relative z-50"><GlobalTicker /></div>
            <ActiveEvents />

            {/* --- UHD V9 HEADER --- */}
            <div className="pt-3 px-4 sm:px-6 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center z-20 bg-gradient-to-b from-black/80 to-transparent sticky top-8 gap-3 sm:gap-0">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                         <motion.div 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-3 cursor-pointer group bg-black/60 p-1.5 pr-5 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md relative overflow-hidden transform-gpu"
                            onClick={() => router.push('/profile')}
                         >
                             <div className="bg-gradient-to-br from-gray-800 to-black w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all overflow-hidden relative z-10">
                                 <div className="absolute inset-0 scale-[1.5] pt-2 opacity-90 group-hover:opacity-100 transition-opacity">
                                    <CharacterSVG type={user.active_pet_id || 'luna'} mood="idle" stickerMode={true} />
                                 </div>
                                 <span className="text-white font-black text-sm italic relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{user.level || 1}</span>
                             </div>
                             
                             <div className="flex flex-col relative z-10">
                                 <span className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase flex items-center gap-1.5 drop-shadow-md">
                                    <ShieldAlert size={10} className="text-cyan-500" /> Operative
                                 </span>
                                 <div className="w-28 sm:w-36 h-1.5 bg-[#111] rounded-full overflow-hidden border border-white/5 mt-1 shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 shadow-[0_0_8px_cyan]" style={{width: `${user.progress_percent || 0}%`}}></div>
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
                        <button onClick={() => { playSound('click'); router.push('/missions'); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all" title="Missions">
                            <ClipboardList size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => { playSound('click'); setShowDailyBonus(true); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all" title="Daily">
                            <Calendar size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => { playSound('click'); router.push('/tournaments'); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all" title="Events">
                            <Trophy size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => { playSound('click'); router.push('/notifications'); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all relative" title="Alerts">
                            <Bell size={16} className="sm:w-5 sm:h-5" />
                            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full border border-black flex items-center justify-center text-[10px] font-black">{unreadCount > 9 ? '!' : unreadCount}</span>}
                        </button>
                    </div>

                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/wallet')}
                        className="bg-black/60 px-4 py-2 rounded-2xl border border-yellow-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.1)] cursor-pointer hover:bg-black transition-colors"
                    >
                        <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-mono font-black text-sm sm:text-base tracking-tight flex items-center gap-1">
                            {parseFloat(user.balance || 0).toLocaleString()} <span className="text-[10px] text-yellow-600 hidden sm:inline">MMK</span>
                        </span>
                    </motion.div>
                </div>
            </div>

            {/* --- V9 DASHBOARD MODULE --- */}
            <div className="relative z-20 px-4 sm:px-6 mt-4 mb-2 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-5xl mx-auto">
                <div className={`flex-1 w-full rounded-3xl p-4 sm:p-5 flex flex-col justify-center bg-black/60 backdrop-blur-xl border transition-all duration-700 relative overflow-hidden
                    ${isJPCritical ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : isJPHot ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/10 shadow-2xl'}`}>
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_3s_infinite] pointer-events-none" />
                    
                    <div className="flex items-center justify-between z-10 relative">
                        <div className="flex flex-col">
                            <h3 className={`font-black text-[10px] sm:text-xs tracking-[0.3em] flex items-center gap-2 uppercase ${isJPCritical ? 'text-purple-400' : (isJPHot ? 'text-red-400' : 'text-cyan-500')}`}>
                                {isJPCritical ? <Zap size={14}/> : <Sparkles size={14} className="opacity-80" />}
                                {selectedIsland ? `${selectedIsland.name} GJP` : 'GRAND JACKPOT'} 
                            </h3>
                            <div className="mt-1 flex items-center gap-2">
                                {isJPCritical ? <span className="bg-purple-900/50 text-purple-200 font-bold px-2 py-0.5 rounded text-[8px] tracking-widest border border-purple-500/50">CRITICAL</span> : 
                                 isJPHot ? <span className="bg-red-900/50 text-red-200 font-bold px-2 py-0.5 rounded text-[8px] tracking-widest border border-red-500/50">HOT</span> : null}
                            </div>
                        </div>
                        
                        <div className={`text-3xl sm:text-5xl md:text-6xl font-mono font-black tracking-tighter transition-colors duration-1000 ${isJPCritical ? 'text-purple-400 drop-shadow-[0_0_10px_purple]' : (isJPHot ? 'text-red-500 drop-shadow-[0_0_10px_red]' : 'text-white')}`}>
                            <RollupNumber value={jackpotAmount} />
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5 z-10">
                        <div className={`h-full transition-all duration-500 ${isJPCritical ? 'bg-purple-500 shadow-[0_0_10px_purple]' : isJPHot ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-cyan-500 shadow-[0_0_10px_cyan]'}`} style={{ width: `${jpProgressPercent}%` }} />
                    </div>
                </div>
                
                <SystemLogPanel activePlayers={activePlayers} sysLog={sysLog} topOperatives={topOperatives} />
            </div>

            {/* --- V9 ZERO-LATENCY 3D CAROUSEL --- */}
            <div className="flex-1 relative flex items-center justify-center perspective-1000 mt-2 sm:mt-4 mb-6 min-h-[45vh] z-10">
                
                <AnimatePresence mode="popLayout">
                    <motion.div 
                        key={`bg-${selectedIsland?.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className={`absolute inset-0 bg-gradient-to-b ${selectedIsland?.theme?.bgGrad || 'from-black'} via-transparent to-black pointer-events-none z-0`} 
                    />
                </AnimatePresence>

                <button onClick={() => paginate(-1)} className="absolute left-2 sm:left-6 z-40 p-3 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/10 border border-white/10 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                    <ChevronLeft size={24} strokeWidth={1.5} />
                </button>
                
                <button onClick={() => paginate(1)} className="absolute right-2 sm:right-6 z-40 p-3 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/10 border border-white/10 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                    <ChevronRight size={24} strokeWidth={1.5} />
                </button>

                <div className="relative w-full h-[45vh] sm:h-[50vh] md:h-[60vh] flex justify-center items-center overflow-visible z-30 touch-none">
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
                                dragDirectionLock
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.1} // Strictly bounded to prevent pitch/lag
                                onDragEnd={handleDragEnd}
                                onClick={() => handleEnter(selectedIsland)}
                                className={`absolute w-[80vw] sm:w-[70vw] md:w-[450px] h-full group cursor-pointer transform-gpu will-change-transform z-30`}
                                style={{ transform: 'translateZ(0)', touchAction: 'pan-y' }}
                            >
                                {/* CYBER-SECURED LOCK */}
                                {!isOwned && (
                                    <div className="absolute inset-0 z-50 rounded-[2rem] bg-black/90 backdrop-blur-sm border border-red-500/30 overflow-hidden flex flex-col items-center justify-center transform-gpu">
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                                        <ShieldAlert size={48} strokeWidth={1.5} className="text-red-500 mb-4 opacity-90" />
                                        <h2 className="text-xl sm:text-2xl font-black italic text-white tracking-widest uppercase">RESTRICTED</h2>
                                        <div className="text-gray-400 font-mono bg-[#0a0a0a] px-4 py-2 mt-4 rounded-xl border border-white/5 text-xs sm:text-sm text-center w-3/4">
                                            <span className="text-gray-500 text-[9px] block mb-1 uppercase tracking-widest">Deposit Req.</span>
                                            {userStats.totalDeposited.toLocaleString()} / <span className="text-white">{selectedIsland.reqDeposit.toLocaleString()} MMK</span>
                                        </div>
                                    </div>
                                )}

                                {/* Main Body */}
                                <div className={`w-full h-full rounded-[2rem] overflow-hidden border border-white/10 bg-[#0a0a0a] relative transition-all duration-300 pointer-events-none transform-gpu
                                    ${!isOwned ? 'opacity-0' : `group-hover:border-white/30 ${selectedIsland.theme.shadow}`}`}>
                                    
                                    <div className="absolute inset-0 bg-[#050505] scale-105 transition-transform duration-[15s] ease-linear group-hover:scale-110">
                                        <IslandLandscapeSVG islandId={selectedIsland.id} priority={true} />
                                    </div>
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent opacity-90 mix-blend-multiply"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                                    
                                    <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${selectedIsland.theme.bgGrad.replace('/50', '/20')} via-transparent to-transparent opacity-80 z-0 pointer-events-none mix-blend-screen transform-gpu translate-z-0`}></div>

                                    {/* 3D Floor Base */}
                                    <div className="absolute left-1/2 top-[80%] transform -translate-x-1/2 w-[70%] h-[12%] bg-gradient-to-b from-black to-transparent rounded-[100%] border-t border-white/20 shadow-[0_30px_60px_rgba(0,0,0,1)] z-0">
                                        <div className={`absolute inset-0 rounded-[100%] border-t-2 ${selectedIsland.theme.border} opacity-50 shadow-[0_0_30px_currentColor] blur-[2px]`}></div>
                                    </div>

                                    <div className="absolute left-1/2 top-[45%] transform -translate-x-1/2 -translate-y-1/2 scale-[1.3] sm:scale-[1.5] z-0 opacity-20 blur-[2px] scale-y-[-1] translate-y-[85%] pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 40%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 40%)' }}>
                                         <CabinetSVG 
                                             islandId={selectedIsland.id} 
                                             mode="hall" 
                                             visualState={isJPCritical ? 'JACKPOT_HOT' : (activePlayers > 1000 ? 'BUSY' : 'FREE')} 
                                             currentJackpot={jackpotAmount}
                                             userName={user?.username || 'GUEST'}
                                             machineNumber={`${selectedIsland.id}-000`}
                                             stats={{ laps: selectedIsland.totalMachines * 10, wins: jackpotAmount * 0.1 }}
                                         />
                                    </div>

                                    <div className="absolute left-1/2 top-[45%] transform -translate-x-1/2 -translate-y-1/2 scale-[1.3] sm:scale-[1.5] z-10 transition-all duration-500 ease-out group-hover:scale-[1.35] sm:group-hover:scale-[1.55] group-hover:-translate-y-[48%] drop-shadow-[0_40px_40px_rgba(0,0,0,0.9)] will-change-transform transform-gpu">
                                         <CabinetSVG 
                                             islandId={selectedIsland.id} 
                                             mode="hall" 
                                             visualState={isJPCritical ? 'JACKPOT_HOT' : (activePlayers > 1000 ? 'BUSY' : 'FREE')} 
                                             currentJackpot={jackpotAmount}
                                             userName={user?.username || 'GUEST'}
                                             machineNumber={`${selectedIsland.id}-000`}
                                             stats={{ laps: selectedIsland.totalMachines * 10, wins: jackpotAmount * 0.1 }}
                                         />
                                    </div>

                                    {/* Typography */}
                                    <div className="absolute bottom-6 left-6 right-6 z-30 text-center flex flex-col items-center">
                                        <div className="flex gap-2 mb-2">
                                            <div className="bg-black/60 text-gray-300 border border-white/10 text-[9px] font-bold tracking-widest flex items-center gap-1.5 px-3 py-1 rounded-full uppercase shadow-lg">
                                                <MapPin size={10}/> မြေပုံ
                                            </div>
                                            <div className="bg-black/60 text-gray-300 border border-white/10 text-[9px] font-bold tracking-widest flex items-center gap-1 px-3 py-1 rounded-full uppercase shadow-lg">
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

            {/* Pagination */}
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

            <div className="relative z-50">
                <BottomDock activeCharId={user?.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} />
            </div>
        </div>
    );
}