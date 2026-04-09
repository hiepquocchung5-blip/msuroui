import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
    Minus, Plus, Zap, Gamepad2, 
    Trophy, Flame, MessageCircle, TrendingUp, 
    ShieldAlert, X, Coins, Repeat, Target, Activity, Cpu, MapPin, 
    HelpCircle, AlertOctagon, Settings, LogOut, Menu, Clock, LifeBuoy, Sparkles, Loader2, Volume2, VolumeX, Monitor
} from 'lucide-react';
import { useRouter } from 'next/router';

import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useGameSound } from '../../hooks/useGameSound';
import { useSlotMachine } from '../../hooks/useSlotMachine';
import { useSpinLoader } from '../../hooks/useSpinLoader'; 

import CabinetSVG from '../visuals/CabinetSVG';
import SymbolSVG from '../visuals/SymbolSVG';
import GlassCard from '../ui/GlassCard';
import GlobalTicker from '../ui/GlobalTicker';
import ActiveEvents from '../ui/ActiveEvents';

const CharacterSVG = dynamic(() => import('../visuals/CharacterSVG'), { ssr: false, loading: () => null });
const IslandLandscapeSVG = dynamic(() => import('../visuals/IslandLandscapeSVG'), { ssr: false, loading: () => null });

const PAYTABLE_DATA = [
    { id: 1, name: 'GRAND JACKPOT', mult: 'MEGA', color: 'text-red-500' },
    { id: 2, name: 'CHARACTER', mult: 20, color: 'text-purple-400' },
    { id: 3, name: 'BAR', mult: 10, color: 'text-orange-400' },
    { id: 4, name: 'BELL', mult: 10, color: 'text-yellow-200' },
    { id: 5, name: 'MELON', mult: 15, color: 'text-green-400' },
    { id: 6, name: 'CHERRY', mult: 2, color: 'text-pink-400' },
    { id: 7, name: 'REPLAY', mult: 'FREE SPIN', color: 'text-cyan-400' }
];

const PAYLINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [6, 4, 2]];

const ISLAND_BET_AMOUNTS = {
    1: [100, 500, 1000, 5000],             
    2: [1000, 5000, 10000, 20000],         
    3: [5000, 10000, 50000, 100000],       
    4: [10000, 50000, 100000, 250000],     
    5: [50000, 100000, 500000, 1000000],   
    default: [100, 500, 1000, 5000, 10000]
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

// --- AAA OPTIMIZATION: Memoized Reel Column with Flattened Props ---
const ReelColumn = memo(({ isSpinning, s1, s2, s3, locked, isWinning, isTeaser, isReachEye, colIdx, isFreeze, islandId, isReady }) => {
    const spinStrip = useMemo(() => {
        const randomFill = Array.from({length: 3}, () => Math.floor(Math.random() * 6) + 2);
        return [s1, s2, s3, ...randomFill];
    }, [isSpinning, s1, s2, s3]);

    const displaySymbols = isSpinning ? spinStrip : [s1, s2, s3];
    const isReachReel = isReachEye && isSpinning && colIdx === 2;

    return (
        <div className={`flex-1 flex flex-col relative h-full bg-[#0a0c10] border-x border-[#222] rounded-md overflow-hidden transform-gpu will-change-transform
            ${locked ? 'border-2 border-yellow-400' : ''}
            ${isReachReel ? 'saturate-150 brightness-125' : ''}
        `} style={{ transform: 'translateZ(0)' }}>
            
            <div className="absolute inset-0 overflow-hidden transform-gpu">
                <div 
                    className={`w-full absolute flex flex-col justify-between transform-gpu will-change-transform
                        ${isSpinning ? (isReachReel ? 'animate-[reel-spin-fast_0.3s_linear_infinite]' : 'animate-[reel-spin-fast_0.1s_linear_infinite]') : 'animate-[snap-bounce-soft_0.4s_cubic-bezier(0.2,0.8,0.2,1)_forwards]'} 
                        ${isFreeze ? 'brightness-50 grayscale' : ''}
                    `} 
                    style={{ height: isSpinning ? '200%' : '100%', top: 0 }}
                >
                    {displaySymbols.map((symId, idx) => (
                        <div key={idx} className="relative flex items-center justify-center w-full" style={{ height: isSpinning ? '16.66%' : '33.33%' }}>
                            <div className={`w-[90%] aspect-[16/9] flex items-center justify-center bg-[#111] rounded-lg border border-[#333] transition-colors duration-300 transform-gpu
                                ${isTeaser && !isReachEye && !isSpinning && idx === 1 && colIdx === 1 ? 'ring-2 ring-red-500 bg-red-900/30' : ''}
                                ${isWinning && !isSpinning && idx < 3 ? 'z-10 scale-[1.02] brightness-125 border-yellow-500/50 bg-yellow-900/20' : ''}
                            `}>
                                {isReady && <SymbolSVG id={symId} isWinning={isWinning && !isSpinning && idx < 3} islandId={islandId} />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black/90 z-20 pointer-events-none"></div>
        </div>
    );
});

// --- AAA OPTIMIZATION: Memoized Loader ---
const SectorLoader = memo(({ progress, islandName }) => (
    <motion.div 
        initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center font-mono transform-gpu"
    >
        <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">
            <Cpu size={48} className="text-cyan-500 mb-6 animate-pulse" />
            <h2 className="text-xl font-black italic tracking-[0.3em] text-white mb-2 uppercase">MOUNTING SECTOR</h2>
            <div className="text-cyan-400 font-bold tracking-widest text-sm mb-6 uppercase">[{islandName}]</div>
            <div className="w-full bg-gray-900 rounded border border-cyan-500/20 p-1 mb-2">
                <div className="h-1.5 bg-cyan-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-[10px] text-gray-500 tracking-widest uppercase flex justify-between w-full">
                <span>Loading Assets...</span>
                <span className="text-cyan-500 font-bold">{progress}%</span>
            </div>
        </div>
    </motion.div>
));

const PlayView = ({ machine, island, onLeave }) => {
    const router = useRouter();
    const { user } = useAuth();
    const { addToast } = useToast();
    const { playSound } = useGameSound();
    
    // --- ENGINE HOOKS ---
    const slotLogic = useSlotMachine(machine?.id, island?.id, machine?.session_token);
    const { progress: assetProgress, isReady: assetsReady } = useSpinLoader(island?.id, user?.active_pet_id || island?.hostess_char_id);

    const { 
        reels, winningLines, isSpinning, isTeaser, isReachEye, isFreeze, lastWin, winTier, sessionWinStreak, momentumMult, inZone, volatility,
        freeSpins, bonusMode, bonusSpinsLeft, showBonusSummary, bonusTotalWin, clearBonusTotal, levelUpData, 
        isJackpot, lapsSinceBonus, error, showIdleWarning, isIdleKicked, resetIdleTimer, isReady: sessionReady,
        autoPlay, spin, setAutoPlay, setLastWin, turboMode, setTurboMode
    } = slotLogic;
    
    const [sessionMinutes, setSessionMinutes] = useState(0);
    const [betIndex, setBetIndex] = useState(0);
    const [winStage, setWinStage] = useState('idle');
    const [charInteraction, setCharInteraction] = useState(null);
    const [showPaytable, setShowPaytable] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [currentJackpot, setCurrentJackpot] = useState(3000000);

    // --- LOCAL PREFERENCES ---
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [hqEnabled, setHqEnabled] = useState(true);

    const activeBetAmounts = useMemo(() => ISLAND_BET_AMOUNTS[island?.id] || ISLAND_BET_AMOUNTS.default, [island?.id]);
    const currentBet = activeBetAmounts[betIndex] || activeBetAmounts[0];
    
    const isProcessing = useRef(false);
    const winHandled = useRef(false); 
    const winTimeoutRef = useRef(null);
    
    const isCurrentlySpinning = isSpinning.some(s => s);
    const isReachWaitState = isReachEye && isCurrentlySpinning && !isSpinning[0] && !isSpinning[1] && isSpinning[2];

    const MACHINES_PER_FLOOR = 90;
    const currentFloor = Math.ceil((machine?.machine_number || 1) / MACHINES_PER_FLOOR);
    const relativeNum = (((machine?.machine_number || 1) - 1) % MACHINES_PER_FLOOR) + 1;
    const displayId = `${currentFloor}-${relativeNum.toString().padStart(2, '0')}`;

    // --- INITIALIZATION & SETTINGS ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSoundEnabled(localStorage.getItem('suro_sound') !== 'false');
            setHqEnabled(localStorage.getItem('suro_hq') !== 'false');
        }
        const sessionTimer = setInterval(() => { setSessionMinutes(prev => prev + 1); }, 60000);
        return () => clearInterval(sessionTimer);
    }, []);

    // Force Minimum Bet on Island Entry
    useEffect(() => {
        setBetIndex(0);
    }, [island?.id]);

    const toggleSound = () => {
        const val = !soundEnabled;
        setSoundEnabled(val);
        localStorage.setItem('suro_sound', val);
    };

    const toggleHQ = () => {
        const val = !hqEnabled;
        setHqEnabled(val);
        localStorage.setItem('suro_hq', val);
    };

    // --- JACKPOT POLLING ---
    useEffect(() => {
        const fetchJackpot = async () => {
            if (!island?.id) return;
            try {
                const res = await api.get(`/game/ticker.php?island_id=${island.id}`);
                if (res.data && res.data.jackpot_amount) setCurrentJackpot(res.data.jackpot_amount);
            } catch (e) {}
        };
        fetchJackpot(); 
        const jpInterval = setInterval(fetchJackpot, 10000);
        return () => clearInterval(jpInterval);
    }, [island?.id]);

    useEffect(() => { if (isJackpot) setCurrentJackpot(3000000); }, [isJackpot]);

    // --- ERROR HANDLING ---
    useEffect(() => {
        if (error) {
            addToast(`SYSTEM: ${error}`, 'error');
            setAutoPlay(false);
            isProcessing.current = false;
            if (isIdleKicked && onLeave) setTimeout(() => onLeave(), 2500);
        }
    }, [error, addToast, setAutoPlay, isIdleKicked, onLeave]);

    const getCabinetState = () => {
        if (isFreeze) return 'BROKEN';
        if (bonusMode) return 'JACKPOT_HOT';
        if (isCurrentlySpinning) return 'BUSY';
        return 'FREE';
    };

    const isOverheating = sessionWinStreak >= 3 || momentumMult > 1.2 || inZone || bonusMode;

    // --- SOUND & FX TRIGGERS ---
    useEffect(() => { if (isFreeze && soundEnabled) { playSound('bigwin'); } }, [isFreeze, playSound, soundEnabled]);
    useEffect(() => { if (levelUpData && levelUpData.length > 0 && soundEnabled) { playSound('bigwin'); } }, [levelUpData, playSound, soundEnabled]);

    useEffect(() => {
        if (isReachWaitState) setCharInteraction("🔥 GEKIATSU!");
        else if (inZone && isCurrentlySpinning) setCharInteraction("⚠️ ZONE ACTIVE!");
        else if (sessionWinStreak >= 3 && !isCurrentlySpinning) setCharInteraction(`🔥 COMBO x${sessionWinStreak}!`);
        else if (momentumMult > 1.2 && !isCurrentlySpinning) setCharInteraction(`Momentum x${momentumMult.toFixed(1)}!`);
        else setCharInteraction(null);
    }, [isReachWaitState, inZone, momentumMult, sessionWinStreak, isCurrentlySpinning]);

    // --- WIN CELEBRATION SEQUENCER ---
    useEffect(() => {
        if (lastWin > 0 && winStage === 'idle' && !winHandled.current && !isCurrentlySpinning) {
            winHandled.current = true; 
            const isBigWin = winTier === 'BIG' || winTier === 'MEGA' || winTier === 'EPIC' || isJackpot;
            if (soundEnabled) playSound(isBigWin ? 'bigwin' : 'win');

            if (!bonusMode && (!autoPlay || isBigWin)) {
                setWinStage('celebrating');
                winTimeoutRef.current = setTimeout(() => {
                    setWinStage('idle');
                    setLastWin(0); 
                }, isJackpot ? 6000 : (winTier === 'EPIC' ? 4000 : 2500));
            }
        } 
        if (!isCurrentlySpinning) {
            isProcessing.current = false;
        }
        return () => { if (winTimeoutRef.current) clearTimeout(winTimeoutRef.current); };
    }, [lastWin, autoPlay, playSound, bonusMode, winStage, isCurrentlySpinning, winTier, isJackpot, setLastWin, soundEnabled]);

    const handleSkipWin = () => {
        if (winStage === 'celebrating') {
            if (soundEnabled) playSound('click');
            if (winTimeoutRef.current) clearTimeout(winTimeoutRef.current);
            setWinStage('idle');
            setLastWin(0);
        }
    };

    // --- CORE ACTION: SPIN ---
    const handleSpin = useCallback(async () => {
        if (!assetsReady || !sessionReady || isProcessing.current || isCurrentlySpinning || winStage !== 'idle' || isFreeze || (levelUpData && levelUpData.length > 0)) return; 
        if (parseFloat(user?.balance || 0) < currentBet && freeSpins === 0 && !bonusMode) {
            addToast("Insufficient Balance / လက်ကျန်ငွေ မလုံလောက်ပါ", "error"); 
            setAutoPlay(false);
            return;
        }
        
        isProcessing.current = true;
        winHandled.current = false; 
        setCharInteraction(null);
        
        if (soundEnabled) playSound('spin');
        if (freeSpins === 0 && !bonusMode) setCurrentJackpot(prev => prev + (currentBet * 0.05));
        
        await spin(currentBet);
    }, [user, currentBet, winStage, playSound, spin, freeSpins, bonusMode, isCurrentlySpinning, isFreeze, levelUpData, addToast, sessionReady, assetsReady, setAutoPlay, soundEnabled]);

    const toggleAutoPlay = () => {
        if (soundEnabled) playSound('click');
        const nextState = !autoPlay;
        setAutoPlay(nextState);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if(resetIdleTimer) resetIdleTimer();
            if (e.code === 'Space') { 
                e.preventDefault(); 
                if (winStage === 'celebrating') { handleSkipWin(); return; }
                if (!isCurrentlySpinning) handleSpin(); 
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSpin, isCurrentlySpinning, resetIdleTimer, winStage]);

    const winDetails = useMemo(() => {
        const defaultWin = PAYTABLE_DATA[6]; 
        if (isJackpot) return PAYTABLE_DATA[0]; 
        if (!winningLines || winningLines.length === 0) return defaultWin;
        const firstLine = winningLines[0];
        if (firstLine === 99) return PAYTABLE_DATA.find(p => p.id === reels[0]) || defaultWin;
        const symId = reels[PAYLINES[firstLine][0]];
        return PAYTABLE_DATA.find(p => p.id === symId) || defaultWin;
    }, [winningLines, reels, isJackpot]);

    const jpProgressPercent = Math.min(100, Math.max(0, ((currentJackpot - 3000000) / (7200000 - 3000000)) * 100));

    return (
        <>
            <AnimatePresence>
                {!assetsReady && <SectorLoader progress={assetProgress} islandName={island?.name || 'UNKNOWN'} />}
            </AnimatePresence>

            <div className={`min-h-[100dvh] bg-[#050505] relative flex flex-col overflow-hidden transition-colors duration-1000 ${bonusMode === 'HEAVEN' ? 'bg-purple-950' : (bonusMode ? 'bg-red-950' : '')}`} onPointerDown={resetIdleTimer}>
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes reel-spin-fast { 0% { transform: translateY(-50%); } 100% { transform: translateY(0%); } }
                    @keyframes snap-bounce-soft { 0% { transform: translateY(-5%); } 40% { transform: translateY(2%); } 75% { transform: translateY(-1%); } 100% { transform: translateY(0%); } }
                `}} />

                {/* --- CRITICAL SYSTEM OVERLAYS --- */}
                <AnimatePresence>
                    {isFreeze && isCurrentlySpinning && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center overflow-hidden transform-gpu">
                            <h1 className="text-white text-5xl md:text-8xl font-black italic tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">SYSTEM FREEZE</h1>
                            <p className="text-cyan-500 mt-4 font-mono tracking-[0.5em] text-xs animate-pulse">REBOOTING...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isReachWaitState && !isFreeze && (
                        <motion.div initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-40 pointer-events-none flex flex-col items-center justify-center bg-red-900/30 mix-blend-screen transform-gpu">
                            <h1 className="text-red-500 text-7xl md:text-[10rem] font-black italic drop-shadow-[0_0_50px_red] animate-pulse" style={{ fontFamily: 'Impact, sans-serif' }}>激熱</h1>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- BACKGROUND RENDERING --- */}
                {assetsReady && (
                    <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 transform-gpu ${isCurrentlySpinning ? 'opacity-40' : 'opacity-100'}`}>
                        {hqEnabled && (
                            <div className="absolute inset-0 opacity-60">
                                <IslandLandscapeSVG islandId={island?.id} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/80"></div>
                        {bonusMode === 'HEAVEN' && <div className="absolute inset-0 bg-purple-900/30 animate-pulse"></div>}
                    </div>
                )}

                <AnimatePresence>
                    {showIdleWarning && (
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-sm bg-red-600 rounded-full p-2 flex items-center justify-center gap-2 transform-gpu shadow-[0_0_20px_red]">
                            <ShieldAlert className="text-white" size={16}/>
                            <span className="text-white font-black text-[10px] tracking-widest uppercase">Idle Warning: Kick in 60s.</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- GLOBAL HUD --- */}
                <GlobalTicker />
                <ActiveEvents />

                <div className="bg-black border-b border-white/10 h-8 md:h-10 flex items-center overflow-hidden relative z-30 shadow-lg">
                    <div className="bg-yellow-900/50 h-full px-2 md:px-4 flex items-center justify-center border-r border-yellow-500/50 z-10 backdrop-blur-sm">
                        <Trophy className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 md:mr-2" />
                        <span className="hidden md:inline text-yellow-400 font-black text-[10px] tracking-widest italic drop-shadow-md">GRAND JACKPOT (ဂရန်းဂျက်ပေါ့)</span>
                    </div>
                    <div className="flex-1 px-3 md:px-6 flex items-center justify-between">
                        <div className="text-yellow-400 font-mono font-black text-lg md:text-xl tracking-[0.2em] drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                            <RollupNumber value={currentJackpot} />
                        </div>
                    </div>
                </div>
                
                <div className="absolute top-16 md:top-20 left-0 w-full px-2 md:px-6 flex flex-row justify-between items-start z-40 pointer-events-none mt-1">
                    <div className="flex flex-col gap-1 md:gap-2">
                        <div className="flex items-center gap-2 pointer-events-auto">
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSettings(true)} className="w-8 h-8 flex-shrink-0 bg-black border border-white/20 flex items-center justify-center text-white rounded-full hover:bg-white/10 shadow-lg">
                                <Menu size={16} />
                            </motion.button>
                            <div className="flex flex-col bg-black/60 px-2 py-1 rounded border border-white/10 backdrop-blur-md shadow-inner">
                                <div className="flex items-center gap-1 text-cyan-400 mb-0.5">
                                    <MapPin size={10} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">
                                        {island?.name || 'Kyoto Zen'} • FLR {currentFloor}
                                    </span>
                                </div>
                                <h2 className="text-white font-black text-sm italic uppercase tracking-wider leading-none flex items-center gap-1">
                                    <Cpu size={12} className="text-cyan-500"/> UNIT #{displayId}
                                </h2>
                            </div>
                        </div>
                        
                        <div className={`pointer-events-auto w-fit bg-black/80 border rounded p-1.5 px-2 flex items-center gap-2 mt-1 backdrop-blur-md shadow-sm ${momentumMult > 1.5 ? 'border-purple-500 shadow-[0_0_10px_purple]' : 'border-white/10'}`}>
                            {sessionWinStreak > 2 ? <Flame size={12} className="text-orange-500 animate-pulse" /> : <TrendingUp size={12} className={momentumMult > 1.5 ? 'text-purple-400 animate-pulse' : 'text-cyan-400'} />}
                            <div>
                                <div className={`text-[6px] font-bold uppercase tracking-wider ${sessionWinStreak > 2 ? 'text-orange-500' : (momentumMult > 1.5 ? 'text-purple-500' : 'text-cyan-500')}`}>
                                    {sessionWinStreak > 2 ? 'WIN STREAK' : 'Momentum'}
                                </div>
                                <div className="text-[10px] font-mono font-black text-white leading-none mt-0.5">
                                    {sessionWinStreak > 2 ? `x${sessionWinStreak}` : `x${momentumMult.toFixed(1)}`}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 md:gap-2">
                        <motion.div whileTap={{ scale: 0.98 }} className="pointer-events-auto bg-black border border-yellow-500/50 rounded-full px-3 py-1.5 flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:border-yellow-400 transition-colors" onClick={() => router.push('/wallet')}>
                            <Coins size={12} className="text-yellow-400" />
                            <span className="text-white font-mono font-black text-sm tracking-tight"><RollupNumber value={user?.balance || 0} /></span>
                        </motion.div>

                        <div className="flex items-center gap-2 pointer-events-auto mt-1">
                            <div className="bg-black/80 border border-white/10 rounded p-1.5 px-2 flex items-center gap-2 backdrop-blur-md shadow-inner">
                                <div className="text-right">
                                    <div className="text-[6px] text-red-500 font-bold uppercase tracking-wider">Tenjo Target</div>
                                    <div className="text-[10px] font-mono font-black text-white leading-none mt-0.5">{lapsSinceBonus} <span className="text-gray-500">/ 777</span></div>
                                </div>
                                <Target size={12} className="text-red-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MAIN GAME STAGE (CABINET & CHARACTERS) --- */}
                <div className="flex-1 flex items-center justify-center relative z-10 px-2 pt-28 pb-[140px] transform-gpu will-change-transform" style={{ transform: 'translateZ(0)' }}>
                    
                    {assetsReady && hqEnabled && (
                        <div className="absolute top-[5%] right-[-10%] w-[50%] h-[60%] opacity-80 pointer-events-none z-0 transform-gpu transition-all duration-500" style={{ transform: isReachWaitState ? 'scale(1.1) translate(-5%, 5%)' : 'scale(1)' }}>
                            <CharacterSVG type={user?.active_pet_id || island?.hostess_char_id} mood={isReachWaitState ? 'sad' : (bonusMode || winTier !== 'NONE' ? 'win' : 'idle')} />
                            <AnimatePresence>
                                {charInteraction && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`absolute -top-6 left-0 bg-white text-black p-2 rounded-xl rounded-bl-none border-2 z-50 font-black text-[10px] uppercase italic whitespace-nowrap shadow-xl ${isReachWaitState ? 'border-red-500 text-red-600 shadow-[0_0_15px_red]' : 'border-cyan-500 shadow-[0_0_15px_cyan]'}`}>
                                        <MessageCircle size={10} className="inline mr-1" /> {charInteraction}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    <div className="relative w-[90%] max-w-[280px] sm:max-w-[320px] aspect-[0.6] flex items-center justify-center z-10 transform-gpu" style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.8))' }}>
                        
                        {/* Physical Cabinet Render */}
                        <div className="absolute inset-0 w-full h-full pointer-events-none">
                            <CabinetSVG 
                                islandId={parseInt(island?.id || 1)} 
                                mode="game" 
                                charId={island?.hostess_char_id} 
                                visualState={getCabinetState()} 
                                machineNumber={displayId}
                                serialNumber={machine?.serial_number}
                                currentJackpot={currentJackpot}
                                machine={machine}
                                stats={{ laps: machine?.total_laps, wins: machine?.total_payout }}
                                userName={user?.username || 'GUEST'}
                                currentBet={currentBet}
                            />
                        </div>

                        {/* Responsive Reel Window */}
                        <div className="absolute top-[21.25%] left-[16.67%] w-[66.67%] h-[28.75%] flex flex-col pointer-events-none transform-gpu will-change-transform" style={{ transform: 'translateZ(5px)' }}>
                            <div className={`h-[15%] flex items-center justify-between px-2 bg-black/90 border-b border-white/5 ${inZone && !bonusMode ? 'border-yellow-500 bg-yellow-900/30' : ''}`}>
                                <span className={`text-[8px] font-black tracking-widest uppercase drop-shadow-md ${isReachWaitState ? 'text-red-500 animate-pulse' : (inZone ? 'text-yellow-400 animate-pulse' : 'text-cyan-400')}`}>
                                    {isReachWaitState ? "!!! GEKIATSU !!!" : (inZone ? "★ ZONE ACTIVE ★" : (bonusMode ? "BONUS RUSH" : "LUCKY SLOT"))}
                                </span>
                                {bonusMode && <span className="text-[8px] font-mono font-bold text-yellow-400 drop-shadow-[0_0_5px_gold]">LEFT: {bonusSpinsLeft}</span>}
                            </div>

                            <div className={`flex-1 flex gap-[1%] p-[1%] bg-[#050505] border-x-2 border-b-2 relative transition-colors duration-300 ${isReachWaitState ? 'border-red-600 shadow-[inset_0_0_20px_rgba(239,68,68,0.3)]' : (inZone && !bonusMode ? 'border-yellow-500/50' : 'border-gray-900')}`}>
                                
                                {/* Memoized Reel Columns */}
                                {[0, 1, 2].map(colIdx => (
                                    <ReelColumn 
                                        key={colIdx} colIdx={colIdx} isSpinning={isSpinning[colIdx]} 
                                        s1={reels[colIdx]} s2={reels[colIdx + 3]} s3={reels[colIdx + 6]} 
                                        islandId={island?.id} isWinning={winningLines.length > 0 && winningLines.some(lId => [0,1,2,3,4].includes(lId) || (lId === 99 && colIdx === 0))} 
                                        isTeaser={isTeaser} isReachEye={isReachEye} isFreeze={isFreeze} isReady={assetsReady && sessionReady}
                                    />
                                ))}

                                {/* Laser Win Lines */}
                                {winningLines.length > 0 && winStage !== 'gambling' && !isJackpot && (
                                    <div className="absolute inset-0 pointer-events-none z-40 transform-gpu">
                                        {winningLines.map(lineIdx => {
                                            if (lineIdx === 99) return null; 
                                            const lineStyles = {
                                                0: "top-[16.66%] left-0 w-full h-[4px] -translate-y-1/2",
                                                1: "top-[50%] left-0 w-full h-[4px] -translate-y-1/2",
                                                2: "top-[83.33%] left-0 w-full h-[4px] -translate-y-1/2",
                                                3: "top-[50%] left-[-10%] w-[120%] h-[4px] -translate-y-1/2 rotate-[35deg]",
                                                4: "top-[50%] left-[-10%] w-[120%] h-[4px] -translate-y-1/2 -rotate-[35deg]"
                                            };
                                            let lineColor = "bg-green-400 shadow-[0_0_10px_#4ade80]";
                                            if (winTier === 'MEGA' || winTier === 'EPIC') lineColor = "bg-red-500 shadow-[0_0_15px_#ef4444]";
                                            else if (winTier === 'BIG') lineColor = "bg-yellow-400 shadow-[0_0_10px_#facc15]";
                                            return <div key={lineIdx} className={`absolute origin-center z-50 rounded-full ${lineColor} ${lineStyles[lineIdx]}`} />;
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MOBILE FIRST CONTROL CONSOLE (PROTRUDING) --- */}
                <div className="absolute bottom-0 left-0 w-full z-40 transform-gpu will-change-transform">
                    
                    {/* Main Console Box */}
                    <div className="bg-[#0a0c10] border-t border-cyan-500/20 rounded-t-[30px] px-3 sm:px-6 pb-6 pt-10 shadow-[0_-10px_40px_rgba(0,0,0,0.9)] relative backdrop-blur-xl">
                        
                        {/* Glowing Edge Accent */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

                        {/* Center: Massive Protruding Spin Button (Top 1/2 outside) */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 z-50 flex flex-col items-center">
                            
                            {/* Outer Armored Ring */}
                            <div className="bg-[#050505] p-2 sm:p-2.5 rounded-full border border-cyan-500/20 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md">
                                <button 
                                    onClick={handleSpin} 
                                    disabled={!assetsReady || !sessionReady || (isProcessing.current && !isCurrentlySpinning) || isFreeze || winStage !== 'idle' || isCurrentlySpinning} 
                                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all relative overflow-hidden outline-none
                                    ${(!assetsReady || !sessionReady) || (isProcessing.current && !isCurrentlySpinning) ? 'bg-[#222] border-b-[6px] border-[#111] opacity-50 shadow-inner' : 
                                    isCurrentlySpinning ? 'bg-gradient-to-b from-red-800 to-red-950 border-b-0 translate-y-[6px] text-white/50 shadow-[inset_0_5px_15px_rgba(0,0,0,0.6)]' :
                                    bonusMode === 'HEAVEN' ? 'bg-gradient-to-b from-purple-500 to-purple-700 border-b-[6px] border-purple-950 text-white active:border-b-0 active:translate-y-[6px] shadow-[0_5px_20px_rgba(168,85,247,0.6)]' :
                                    'bg-gradient-to-b from-red-600 to-red-800 border-b-[6px] border-red-950 text-white active:border-b-0 active:translate-y-[6px] shadow-[0_5px_15px_rgba(220,38,38,0.5)]'}`}
                                >
                                    <div className="relative z-10 flex flex-col items-center mt-1">
                                        {isCurrentlySpinning ? <Loader2 size={24} className="animate-spin mb-1 opacity-70" /> : <Gamepad2 size={28} strokeWidth={2.5} className="mb-1 drop-shadow-md" />}
                                        <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase drop-shadow-md">
                                            {!assetsReady || !sessionReady ? 'စောင့်ပါ' : 'လှည့်မည်'}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Sub-Controls Flex Layout */}
                        <div className="max-w-md mx-auto flex items-center justify-between gap-4 relative z-40 w-full pt-1">
                            
                            {/* Left: Bet Adjustment */}
                            <div className="flex-1 max-w-[140px] flex bg-[#111] p-1.5 rounded-xl border border-[#333] shadow-[inset_0_2px_10px_rgba(0,0,0,1)] items-center">
                                <button 
                                    onClick={() => { if(soundEnabled) playSound('click'); setBetIndex(Math.max(0, betIndex - 1))}} 
                                    className="w-7 h-10 sm:w-8 flex-shrink-0 bg-gradient-to-b from-[#444] to-[#222] border-b-[3px] border-[#111] rounded-lg active:border-b-0 active:translate-y-[3px] flex items-center justify-center text-white shadow-md transition-all"
                                ><Minus size={14}/></button>
                                
                                <div className="flex flex-col flex-1 mx-1.5 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[6px] sm:text-[7px] text-gray-500 font-bold uppercase tracking-widest">LVL</span>
                                        <span className="text-[6px] sm:text-[7px] text-yellow-500 font-black tracking-widest">{betIndex + 1}</span>
                                    </div>
                                    <div className="flex gap-[1px] my-1">
                                        {activeBetAmounts.map((amt, i) => (
                                            <div key={i} className={`h-[3px] flex-1 rounded-sm transition-colors duration-300 ${i <= betIndex ? 'bg-yellow-400 shadow-[0_0_3px_yellow]' : 'bg-gray-700'}`}></div>
                                        ))}
                                    </div>
                                    <div className="text-center font-mono font-black text-yellow-400 text-[10px] sm:text-xs drop-shadow-[0_0_5px_rgba(234,179,8,0.5)] leading-none pt-0.5 truncate">
                                        {currentBet >= 1000 ? `${currentBet/1000}k` : currentBet}
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => { if(soundEnabled) playSound('click'); setBetIndex(Math.min(activeBetAmounts.length - 1, betIndex + 1))}} 
                                    className="w-7 h-10 sm:w-8 flex-shrink-0 bg-gradient-to-b from-[#444] to-[#222] border-b-[3px] border-[#111] rounded-lg active:border-b-0 active:translate-y-[3px] flex items-center justify-center text-white shadow-md transition-all"
                                ><Plus size={14}/></button>
                            </div>

                            {/* Center Spacer (Allows the button to drop down cleanly) */}
                            <div className="w-[70px] sm:w-[100px] flex-shrink-0"></div>

                            {/* Right: Auto & Turbo */}
                            <div className="flex-1 max-w-[140px] flex justify-end gap-2">
                                <button 
                                    onClick={() => { if(soundEnabled) playSound('click'); setTurboMode(!turboMode)}} 
                                    className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-all outline-none border-b-[3px] ${turboMode ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 border-b-0 translate-y-[3px] text-black shadow-[0_0_15px_gold]' : 'bg-gradient-to-b from-[#333] to-[#1a1a1a] border-[#0a0a0a] text-gray-500 active:border-b-0 active:translate-y-[3px] hover:brightness-125 shadow-md'}`}
                                ><Zap size={16} fill={turboMode ? "currentColor" : "none"} className={turboMode ? 'drop-shadow-md' : ''} /></button>
                                
                                <button 
                                    onClick={toggleAutoPlay} 
                                    className={`flex-1 h-12 rounded-xl flex flex-col items-center justify-center transition-all outline-none border-b-[3px] ${autoPlay ? 'bg-gradient-to-b from-green-500 to-green-700 border-b-0 translate-y-[3px] text-white shadow-[0_0_15px_lime]' : 'bg-gradient-to-b from-[#333] to-[#1a1a1a] border-[#0a0a0a] text-gray-500 active:border-b-0 active:translate-y-[3px] hover:brightness-125 shadow-md'}`}
                                >
                                    <Repeat size={14} className={autoPlay ? "animate-spin-slow mb-0.5 drop-shadow-md" : "mb-0.5"} />
                                    <span className="text-[7px] font-bold tracking-wider">အော်တို</span>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* --- MODALS (SETTINGS / PAYTABLE / WIN CELEBRATION) --- */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 backdrop-blur-sm transform-gpu" onClick={() => setShowSettings(false)}>
                            <GlassCard className="w-full max-w-sm p-0 overflow-hidden bg-[#111] border-white/20 shadow-2xl" onClick={e => e.stopPropagation()}>
                                <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-white/10">
                                    <h3 className="text-white font-black flex items-center gap-2 tracking-widest"><Settings size={18}/> ကစားသူစင်တာ <span className="font-mono text-gray-400 text-[10px]">(HUB)</span></h3>
                                    <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white transition-colors"><X size={20}/></button>
                                </div>
                                <div className="p-4 space-y-3 bg-black">
                                    
                                    {/* Local Performance Toggles */}
                                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {soundEnabled ? <Volume2 size={18} className="text-cyan-400"/> : <VolumeX size={18} className="text-gray-500"/>}
                                            <span className="text-sm font-bold text-white tracking-wider">အသံ (Audio)</span>
                                        </div>
                                        <button onClick={toggleSound} className={`w-10 h-5 rounded-full relative transition-colors ${soundEnabled ? 'bg-cyan-600 shadow-[0_0_10px_cyan]' : 'bg-gray-700'}`}>
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${soundEnabled ? 'left-5.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Monitor size={18} className={hqEnabled ? "text-green-400" : "text-gray-500"}/>
                                            <div>
                                                <div className="text-sm font-bold text-white tracking-wider">ရုပ်ထွက် (3D High)</div>
                                            </div>
                                        </div>
                                        <button onClick={toggleHQ} className={`w-10 h-5 rounded-full relative transition-colors ${hqEnabled ? 'bg-green-600 shadow-[0_0_10px_lime]' : 'bg-gray-700'}`}>
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${hqEnabled ? 'left-5.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    <button onClick={() => { setShowSettings(false); setShowPaytable(true); }} className="w-full bg-white/5 p-3 rounded-xl border border-white/5 text-white font-bold text-sm flex items-center gap-3 mt-2 hover:bg-white/10 transition-colors tracking-widest">
                                        <HelpCircle className="text-yellow-400"/> ပေးချေမှုဇယား (PAYTABLE)
                                    </button>
                                    
                                    <button onClick={onLeave} className="w-full bg-red-900/30 border border-red-500/50 p-3 rounded-xl text-red-400 font-black text-sm flex justify-center gap-2 mt-4 hover:bg-red-900/50 transition-colors tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                        <LogOut size={18}/> ထွက်မည် (SECURE LEAVE)
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showPaytable && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 backdrop-blur-sm transform-gpu" onClick={() => setShowPaytable(false)}>
                            <GlassCard className="w-full max-w-sm p-0 bg-[#111] border-cyan-500/50 shadow-[0_0_30px_rgba(0,243,255,0.2)]" onClick={e => e.stopPropagation()}>
                                <div className="bg-cyan-900 p-4 flex justify-between items-center border-b border-cyan-500/30">
                                    <h3 className="text-white font-black flex items-center gap-2 tracking-widest"><HelpCircle size={18}/> PAYTABLE MULTIPLIERS</h3>
                                    <button onClick={() => setShowPaytable(false)} className="text-white/70 hover:text-white transition-colors"><X size={20}/></button>
                                </div>
                                <div className="p-4 space-y-2 bg-black">
                                    {PAYTABLE_DATA.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 p-1 bg-black rounded shadow-inner"><SymbolSVG id={item.id} islandId={parseInt(island?.id || 1)} /></div>
                                                <span className={`font-bold text-xs tracking-wider ${item.color}`}>{item.name}</span>
                                            </div>
                                            <div className="font-mono text-white font-black text-sm pt-1">{typeof item.mult === 'number' ? `x${item.mult}` : item.mult}</div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {winStage === 'celebrating' && winDetails && !bonusMode && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleSkipWin} className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 cursor-pointer backdrop-blur-sm transform-gpu">
                            <motion.div initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", damping: 20 }} className="text-center relative">
                                
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,215,0,0.2),_transparent)] blur-[50px] pointer-events-none -z-10"></div>
                                
                                <h1 className={`text-6xl font-black italic mb-4 tracking-tighter drop-shadow-2xl ${isJackpot ? 'text-red-500 drop-shadow-[0_0_30px_red]' : 'text-white'}`}>
                                    {isJackpot ? 'GRAND JACKPOT' : winTier + ' WIN'}
                                </h1>
                                
                                <div className="w-40 h-40 mx-auto mb-4 relative z-10 animate-bounce">
                                    <SymbolSVG id={isJackpot ? 1 : (winDetails?.id || 7)} islandId={parseInt(island?.id || 1)} isWinning={true} />
                                </div>
                                
                                <div className="text-6xl font-mono font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)] mb-8 bg-black/50 px-8 py-2 rounded-2xl border border-yellow-500/30 inline-block">
                                    +<RollupNumber value={lastWin} />
                                </div>

                                <div className="text-white/70 text-[10px] font-bold tracking-widest uppercase flex flex-col items-center gap-1.5 mt-4 bg-white/5 px-4 py-2 rounded-full border border-white/10 w-fit mx-auto backdrop-blur-sm">
                                    <span>Tap to continue / ဆက်သွားရန် နှိပ်ပါ</span>
                                    <span className="animate-bounce">↓</span>
                                </div>
                                
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </>
    );
};

export default memo(PlayView);