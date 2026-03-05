import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Minus, Plus, Zap, StopCircle, Gamepad2, 
    Trophy, Flame, MessageCircle, TrendingUp, 
    ShieldAlert, X, Coins, Repeat, Target, Activity, Cpu, MapPin
} from 'lucide-react';
import { useRouter } from 'next/router';

// --- REAL PRODUCTION IMPORTS ---
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useGameSound } from '../../hooks/useGameSound';
import { useSlotMachine } from '../../hooks/useSlotMachine';

import CabinetSVG from '../visuals/CabinetSVG';
import CharacterSVG from '../visuals/CharacterSVG';
import SymbolSVG from '../visuals/SymbolSVG';
import IslandLandscapeSVG from '../visuals/IslandLandscapeSVG';
import GlassCard from '../ui/GlassCard';
import GlobalTicker from '../ui/GlobalTicker';
import ActiveEvents from '../ui/ActiveEvents';

// --- CONFIGURATION ---
const PAYTABLE_DATA = [
    { id: 1, name: 'BIG BONUS', mult: 'SPECIAL', color: 'text-yellow-400', glow: 'shadow-[0_0_40px_gold]' },
    { id: 2, name: 'CHARACTER', mult: 20, color: 'text-purple-400', glow: 'shadow-[0_0_30px_purple]' },
    { id: 3, name: 'BAR', mult: 10, color: 'text-red-400', glow: 'shadow-[0_0_30px_red]' },
    { id: 4, name: 'BELL', mult: 10, color: 'text-yellow-200', glow: 'shadow-[0_0_20px_yellow]' },
    { id: 5, name: 'MELON', mult: 15, color: 'text-green-400', glow: 'shadow-[0_0_20px_green]' },
    { id: 6, name: 'CHERRY', mult: 2, color: 'text-pink-400', glow: 'shadow-[0_0_15px_pink]' },
    { id: 7, name: 'REPLAY', mult: 'FREE SPIN', color: 'text-cyan-400', glow: 'shadow-[0_0_15px_cyan]' }
];

const PAYLINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [6, 4, 2]];

// V3 RESTRICTED BETS
const BET_AMOUNTS = [100, 500, 1000, 5000, 10000];

// --- ROLLUP COUNTER ---
const RollupNumber = ({ value, duration = 1000 }) => {
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
    }, [value]);
    return <>{count.toLocaleString()}</>;
};

const getIslandPaylineStyle = () => {
    return { color: '#00f3ff', shadow: 'rgba(0, 243, 255, 0.8)' };
};

const ReelColumn = ({ isSpinning, finalSymbols, locked, isWinning, isTeaser, isFreeze, islandId }) => {
    const spinStrip = useMemo(() => {
        const randomFill = Array.from({length: 12}, () => Math.floor(Math.random() * 7) + 1);
        return [...finalSymbols, ...randomFill];
    }, [isSpinning, finalSymbols]);

    const displaySymbols = isSpinning ? spinStrip : finalSymbols;

    return (
        <div className={`flex-1 flex flex-col relative h-full bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] border-x border-white/5 rounded-sm overflow-hidden ${locked ? 'border-2 border-yellow-400' : ''}`}>
            <svg width="0" height="0" className="absolute"><defs><filter id="vertBlur"><feGaussianBlur in="SourceGraphic" stdDeviation="0 6" /></filter></defs></svg>
            <div className="absolute inset-0 overflow-hidden" style={{ perspective: '1000px' }}>
                <div 
                    className={`w-full absolute flex flex-col justify-between ${isSpinning ? 'animate-reel-spin-heavy' : 'animate-snap-heavy'} ${isFreeze ? 'brightness-50 grayscale' : ''}`} 
                    style={{ height: isSpinning ? '500%' : '100%', top: 0, filter: isSpinning ? 'url(#vertBlur)' : 'none' }}
                >
                    {displaySymbols.map((symId, idx) => (
                        <div key={idx} className="relative flex items-center justify-center w-full" style={{ height: isSpinning ? '6.66%' : '32%' }}>
                            <div className={`w-[85%] aspect-square flex items-center justify-center bg-black/40 border border-white/5 rounded-lg shadow-inner transition-colors duration-300
                                ${isTeaser && !isSpinning && idx === 1 ? 'ring-2 ring-red-500/50 animate-pulse' : ''}
                                ${isWinning && !isSpinning && idx < 3 ? 'z-10 shadow-[0_0_30px_rgba(255,215,0,0.6)] bg-yellow-900/30 ring-1 ring-yellow-400 scale-105' : ''}
                            `}>
                                <SymbolSVG id={symId} isWinning={isWinning && !isSpinning && idx < 3} islandId={islandId} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black/90 z-20 pointer-events-none shadow-[inset_0_20px_20px_-10px_rgba(0,0,0,0.8),inset_0_-20px_20px_-10px_rgba(0,0,0,0.8)]"></div>
        </div>
    );
};

const PlayView = ({ machine, island, onLeave }) => {
    const router = useRouter();
    const { user } = useAuth();
    const { addToast } = useToast();
    const { playSound } = useGameSound();
    
    // Real API-driven slot machine hook
    const slotLogic = useSlotMachine(machine?.id, island?.id, machine?.session_token);
    
    const { 
        reels, winningLines, isSpinning, isTeaser, lastWin, winTier, sessionWinStreak, streakMult,
        freeSpins, bonusMode, bonusSpinsLeft, atSequence, atCurrentStep,
        showBonusSummary, bonusTotalWin, clearBonusTotal, levelUpData, setLevelUpData,
        isJackpot, isReachEye, isFreeze, lapsSinceBonus, momentumMult, inZone, error, 
        showIdleWarning, isIdleKicked, resetIdleTimer, isReady,
        autoPlay, spin, stopReel, setAutoPlay, setLastWin, turboMode, setTurboMode
    } = slotLogic;
    
    const [betIndex, setBetIndex] = useState(0);
    const [winStage, setWinStage] = useState('idle');
    const [charInteraction, setCharInteraction] = useState(null);
    const [coins, setCoins] = useState([]);
    const [showPaytable, setShowPaytable] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [reelThud, setReelThud] = useState([false, false, false]);
    
    // Live Grand Jackpot State
    const [currentJackpot, setCurrentJackpot] = useState(3000000);

    const currentBet = BET_AMOUNTS[betIndex];

    // Refs for synchronization
    const isProcessing = useRef(false);
    const winHandled = useRef(false); 
    
    const isCurrentlySpinning = isSpinning.some(s => s);

    // --- MACHINE FLOOR & ID CALCULATION ---
    const currentFloor = Math.ceil((machine?.machine_number || 1) / 90);
    const relativeNum = (((machine?.machine_number || 1) - 1) % 90) + 1;
    const displayId = `${currentFloor}-${relativeNum.toString().padStart(2, '0')}`;

    // --- GRAND JACKPOT LIVE FETCHING ---
    useEffect(() => {
        const fetchJackpot = async () => {
            try {
                const res = await api.get('/game/ticker.php');
                if (res.data && res.data.jackpot_amount) {
                    setCurrentJackpot(res.data.jackpot_amount);
                }
            } catch (e) {
                console.warn("Live ticker sync failed.");
            }
        };

        fetchJackpot(); 
        const jpInterval = setInterval(fetchJackpot, 10000); // Sync every 10s
        return () => clearInterval(jpInterval);
    }, []);

    // Reset Jackpot visually if won
    useEffect(() => {
        if (isJackpot) setCurrentJackpot(3000000);
    }, [isJackpot]);

    const handlePointerMove = useCallback((e) => {
        resetIdleTimer();
        if (typeof window !== 'undefined') {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const x = ((clientX / innerWidth) - 0.5) * 10;
            const y = ((clientY / innerHeight) - 0.5) * -10;
            setMousePos({ x, y });
        }
    }, [resetIdleTimer]);

    // Handle Backend Errors & AFK Kick
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

    // AI Status Logic
    const isOverheating = sessionWinStreak >= 3 || momentumMult > 1.2 || inZone || bonusMode;

    useEffect(() => {
        if (isFreeze) { playSound('bigwin'); addToast("CRITICAL ANOMALY: LONG FREEZE DETECTED!", "error"); }
    }, [isFreeze, playSound, addToast]);

    useEffect(() => {
        if (inZone && isCurrentlySpinning) setCharInteraction("⚠️ ZONE ACTIVE: YIELD SURGE!");
        else if (isReachEye && isCurrentlySpinning) setCharInteraction("Gekiatsu... REACH!");
        else if (sessionWinStreak >= 3 && !isCurrentlySpinning) setCharInteraction(`🔥 COMBO x${sessionWinStreak}! MULT: ${streakMult}x`);
        else if (momentumMult > 1.2 && !isCurrentlySpinning) setCharInteraction(`Momentum x${momentumMult.toFixed(1)}!`);
    }, [inZone, isReachEye, momentumMult, sessionWinStreak, streakMult, isCurrentlySpinning]);

    useEffect(() => {
        if (levelUpData) { playSound('bigwin'); triggerCoinShower(80); }
    }, [levelUpData, playSound]);

    // --- SECURE WIN EVALUATION ---
    useEffect(() => {
        if (lastWin > 0 && winStage === 'idle' && !winHandled.current && !isCurrentlySpinning) {
            winHandled.current = true; 
            
            const isBigWin = winTier === 'BIG' || winTier === 'MEGA' || winTier === 'EPIC' || isJackpot;
            playSound(isBigWin ? 'bigwin' : 'win');
            if (isBigWin) triggerCoinShower(isJackpot ? 150 : (winTier === 'EPIC' ? 100 : 50));

            if (!bonusMode && (!autoPlay || isBigWin)) {
                setWinStage('celebrating');
                setTimeout(() => {
                    setWinStage('idle');
                    setLastWin(0); 
                }, isJackpot ? 6000 : (winTier === 'EPIC' ? 4000 : 2500));
            }
        } 
        
        if (!isCurrentlySpinning) {
            isProcessing.current = false;
        }
    }, [lastWin, autoPlay, playSound, bonusMode, winStage, isCurrentlySpinning, winTier, isJackpot, setLastWin]);

    const triggerCoinShower = (amount = 40) => {
        const newParticles = Array.from({length: amount}).map((_, i) => ({
            id: Date.now() + i, left: Math.random() * 100, delay: Math.random() * 1.5,
            scale: 0.5 + Math.random(), rotation: Math.random() * 360
        }));
        setCoins(newParticles);
        setTimeout(() => setCoins([]), 4000);
    };

    // --- CORE GAME ACTIONS ---
    const handleSpin = useCallback(() => {
        if (!isReady || isProcessing.current || isCurrentlySpinning || winStage !== 'idle' || isFreeze || levelUpData) return; 
        if (parseFloat(user?.balance || 0) < currentBet && freeSpins === 0 && !bonusMode) {
            addToast("Insufficient Balance", "error"); 
            setAutoPlay(false);
            return;
        }
        
        isProcessing.current = true;
        winHandled.current = false; 
        setCharInteraction(null);
        playSound('spin');
        
        // Optimistic Jackpot Increment
        if (freeSpins === 0 && !bonusMode) {
            setCurrentJackpot(prev => prev + (currentBet * 0.05));
        }

        spin(currentBet);
    }, [user, currentBet, winStage, playSound, spin, freeSpins, bonusMode, isCurrentlySpinning, isFreeze, levelUpData, addToast, isReady, setAutoPlay]);

    const handleManualStop = (idx) => {
        if (isSpinning[idx] && !autoPlay) {
            if (atSequence && atSequence.length > 0 && atSequence[atCurrentStep] !== idx) return; 
            playSound('stop');
            if (navigator.vibrate) navigator.vibrate(20);
            
            setReelThud(prev => { const n = [...prev]; n[idx] = true; return n; });
            setTimeout(() => { setReelThud(prev => { const n = [...prev]; n[idx] = false; return n; }); }, 150);
            
            stopReel(idx);
        }
    };

    const handleQuickStop = useCallback(() => {
        if (!isCurrentlySpinning) return;
        playSound('stop');
        if (navigator.vibrate) navigator.vibrate(20);
        
        if (autoPlay) setAutoPlay(false);

        const order = (atSequence && atSequence.length === 3) ? atSequence : [0, 1, 2];
        let delay = 0;
        order.forEach((reelIdx) => {
            if (isSpinning[reelIdx]) {
                setTimeout(() => stopReel(reelIdx), delay);
                delay += 120; 
            }
        });
    }, [isCurrentlySpinning, playSound, autoPlay, setAutoPlay, atSequence, isSpinning, stopReel]);

    const toggleAutoPlay = () => {
        playSound('click');
        const nextState = !autoPlay;
        setAutoPlay(nextState);
        if (!nextState && isCurrentlySpinning) handleQuickStop();
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            resetIdleTimer();
            if (e.code === 'Space') { 
                e.preventDefault(); 
                if (isCurrentlySpinning) handleQuickStop();
                else handleSpin(); 
            }
            if (e.key === '1') handleManualStop(0); 
            if (e.key === '2') handleManualStop(1); 
            if (e.key === '3') handleManualStop(2);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSpin, handleQuickStop, handleManualStop, isCurrentlySpinning, resetIdleTimer]);

    const winDetails = useMemo(() => {
        if (!winningLines || winningLines.length === 0) return null;
        const firstLine = winningLines[0];
        if (firstLine === 99) return PAYTABLE_DATA.find(p => p.id === reels[0]) || PAYTABLE_DATA[6]; 
        const symId = reels[PAYLINES[firstLine][0]];
        return PAYTABLE_DATA.find(p => p.id === symId) || PAYTABLE_DATA[6];
    }, [winningLines, reels]);

    const lineStyle = getIslandPaylineStyle();
    const strokeWidths = { 'NONE': 4, 'SMALL': 5, 'BIG': 8, 'MEGA': 12, 'EPIC': 18 };

    const jpProgressPercent = Math.min(100, Math.max(0, ((currentJackpot - 3000000) / (7200000 - 3000000)) * 100));

    return (
        <div 
            className={`min-h-[100dvh] bg-black relative flex flex-col overflow-hidden transition-colors duration-1000 ${bonusMode === 'HEAVEN' ? 'bg-purple-950' : (bonusMode ? 'bg-red-950' : '')}`}
            onPointerMove={handlePointerMove} 
            onPointerDown={resetIdleTimer}
        >
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes reel-spin-anim { 0% { transform: translateY(-80%); filter: blur(0px); } 5% { filter: blur(4px); } 100% { transform: translateY(0%); filter: blur(4px); } }
                .animate-reel-spin-heavy { animation: reel-spin-anim 0.25s linear infinite; }
                @keyframes snap-bounce-heavy { 0% { transform: translateY(-12%); } 30% { transform: translateY(6%); } 100% { transform: translateY(0%); } }
                .animate-snap-heavy { animation: snap-bounce-heavy 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                @keyframes shake-epic { 0%, 100% { transform: translate(0,0) rotate(0deg); } 10%, 30%, 50%, 70%, 90% { transform: translate(-8px, 8px) rotate(-2deg); } 20%, 40%, 60%, 80% { transform: translate(8px, -8px) rotate(2deg); } }
                .animate-shake-epic { animation: shake-epic 0.4s infinite; }
            `}} />

            {/* --- IMMERSIVE BACKGROUND --- */}
            <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isCurrentlySpinning ? 'opacity-40' : 'opacity-100'}`}>
                <div className="absolute inset-0 scale-110 blur-[1px] opacity-60">
                    <IslandLandscapeSVG islandId={island?.id} />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black opacity-90"></div>
                {/* Tech Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                
                {inZone && <div className="absolute inset-0 bg-yellow-500/10 mix-blend-overlay animate-pulse"></div>}
                {bonusMode === 'HEAVEN' && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-40 mix-blend-color-dodge animate-pulse hue-rotate-180"></div>}
            </div>

            {/* AFK WARNING BANNER */}
            <AnimatePresence>
                {showIdleWarning && (
                    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-sm bg-red-600 border-2 border-white shadow-[0_0_30px_red] rounded-full p-2 flex items-center justify-center gap-2 animate-pulse">
                        <ShieldAlert className="text-white" size={16}/>
                        <span className="text-white font-black text-[10px] tracking-widest uppercase">Idle Warning: Kick in 60s. Tap to stay.</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <GlobalTicker />
            <ActiveEvents />

            {/* V3 INTEGRATED GRAND JACKPOT TICKER */}
            <div className="bg-black border-b border-white/10 h-10 flex items-center overflow-hidden relative z-30 shadow-lg">
                <div className="bg-yellow-900/80 h-full px-3 sm:px-4 flex items-center justify-center border-r border-yellow-500/50 z-10">
                    <Trophy className="w-4 h-4 text-yellow-500 sm:mr-2" />
                    <span className="hidden sm:inline text-yellow-400 font-black text-xs tracking-widest italic">GRAND JACKPOT</span>
                </div>
                <div className="flex-1 px-4 sm:px-6 flex items-center justify-between bg-gradient-to-r from-yellow-900/20 to-transparent">
                    <div className="text-yellow-400 font-mono font-black text-xl tracking-[0.2em] drop-shadow-[0_0_10px_gold]">
                        <RollupNumber value={currentJackpot} duration={500} />
                    </div>
                    {currentJackpot >= 7000000 ? (
                        <div className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded animate-pulse shadow-[0_0_15px_purple]">
                            CRITICAL MASS
                        </div>
                    ) : currentJackpot >= 3600000 ? (
                        <div className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded animate-pulse shadow-[0_0_10px_red]">
                            TRIGGER HOT
                        </div>
                    ) : (
                        <div className="text-[10px] text-gray-500 font-bold px-2 py-0.5 uppercase tracking-widest">
                            BUILDING...
                        </div>
                    )}
                </div>
                <div 
                    className={`absolute bottom-0 left-0 h-[2px] transition-all duration-500 shadow-[0_0_5px_currentColor] ${currentJackpot >= 7000000 ? 'bg-purple-500 text-purple-500' : currentJackpot >= 3600000 ? 'bg-red-500 text-red-500' : 'bg-yellow-500 text-yellow-500'}`} 
                    style={{ width: `${jpProgressPercent}%` }} 
                />
            </div>
            
            {/* --- CYBER HUD --- */}
            <div className="absolute top-16 sm:top-20 left-0 w-full px-4 sm:px-6 flex justify-between items-start z-40 pointer-events-none mt-1">
                
                {/* Left Side: Navigation & Momentum */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-3 pointer-events-auto">
                        <button onClick={onLeave} className="w-10 h-10 flex-shrink-0 bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/50 transition-all active:scale-95 shadow-lg rounded-full backdrop-blur-md">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-cyan-400 mb-0.5 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                                <MapPin size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded shadow-inner">
                                    {island?.name || 'Unknown'} • FLR {currentFloor}
                                </span>
                            </div>
                            <h2 className="text-white font-black text-xl sm:text-2xl italic uppercase tracking-wider leading-none drop-shadow-md truncate flex items-center gap-2">
                                <Cpu size={20} className="text-cyan-500"/> UNIT #{displayId}
                            </h2>
                        </div>
                    </div>
                    
                    <div className={`pointer-events-auto w-fit bg-black/80 border rounded-xl p-1.5 sm:p-2 px-2 sm:px-3 flex items-center gap-2 sm:gap-3 backdrop-blur-md shadow-lg transition-colors duration-500 mt-1 ${momentumMult > 1.5 ? 'border-purple-500 shadow-[0_0_15px_purple]' : 'border-cyan-500/30'}`}>
                        <TrendingUp size={14} className={momentumMult > 1.5 ? 'text-purple-400 animate-pulse' : 'text-cyan-400'} />
                        <div>
                            <div className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-wider ${momentumMult > 1.5 ? 'text-purple-500' : 'text-cyan-500'}`}>Momentum</div>
                            <div className="text-xs sm:text-sm font-mono font-black text-white leading-none mt-0.5">x{momentumMult.toFixed(1)}</div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Wallet, Tenjo, AI Predictor */}
                <div className="flex flex-col items-end gap-2">
                    <div className="pointer-events-auto bg-black/80 border border-yellow-500/40 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(234,179,8,0.2)] cursor-pointer hover:bg-black/90 transition-all group" onClick={() => router.push('/wallet')}>
                        <Coins size={14} className="text-yellow-400 sm:w-4 sm:h-4 group-hover:animate-spin-slow" />
                        <span className="text-white font-mono font-black text-sm sm:text-base tracking-tight"><RollupNumber value={user?.balance || 0} /></span>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        <div className="bg-black/80 border border-red-500/30 rounded-xl p-1.5 sm:p-2 px-2 sm:px-3 flex items-center gap-2 sm:gap-3 backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            <div className="text-right">
                                <div className="text-[7px] sm:text-[8px] text-red-500 font-bold uppercase tracking-wider">Tenjo Target</div>
                                <div className="text-xs sm:text-sm font-mono font-black text-white leading-none mt-0.5">{lapsSinceBonus} <span className="text-gray-500">/ 777</span></div>
                            </div>
                            <Target size={14} className="text-red-400 sm:w-4 sm:h-4 animate-pulse" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        <div className="bg-black/80 border border-white/10 rounded-xl p-1.5 sm:p-2 px-2 sm:px-3 flex items-center gap-2 sm:gap-3 backdrop-blur-md shadow-inner">
                            <div className="text-right">
                                <div className="text-[7px] sm:text-[8px] text-gray-500 font-bold uppercase tracking-wider">AI Status</div>
                                <div className={`text-xs sm:text-sm font-mono font-black leading-none mt-0.5 ${isOverheating ? 'text-orange-400 animate-pulse' : 'text-cyan-400'}`}>
                                    {isOverheating ? 'OVERHEATING' : 'GATHERING'}
                                </div>
                            </div>
                            <Activity size={14} className={isOverheating ? 'text-orange-400' : 'text-cyan-400'} />
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN GAME STAGE */}
            <div className={`flex-1 flex items-center justify-center relative z-10 px-2 pt-28 pb-6 ${isFreeze || winTier === 'EPIC' || isJackpot ? 'animate-shake-epic' : ''}`} style={{ perspective: '1200px' }}>
                <motion.div 
                    className="relative w-full max-w-[400px] aspect-[0.6] flex items-center justify-center"
                    animate={{ rotateX: mousePos.y, rotateY: mousePos.x }}
                    transition={{ type: 'spring', stiffness: 75, damping: 15 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <div className="absolute inset-0 z-10 w-full h-full pointer-events-none drop-shadow-[0_20px_25px_rgba(0,0,0,0.9)]" style={{ transform: 'translateZ(-10px)' }}>
                        <CabinetSVG 
                            islandId={parseInt(island?.id || 1)} 
                            mode="game" 
                            charId={island?.hostess_char_id} 
                            visualState={getCabinetState()} 
                            machineNumber={displayId}
                            serialNumber={machine?.serial_number}
                        />
                        {turboMode && <div className="absolute inset-0 rounded-[2rem] border-[4px] border-yellow-500 opacity-50 shadow-[0_0_30px_gold] animate-pulse pointer-events-none"></div>}
                    </div>

                    <div className="absolute bottom-[5%] right-[-20%] sm:right-[-25%] w-[60%] sm:w-[65%] h-[65%] sm:h-[70%] z-20 pointer-events-none drop-shadow-2xl transition-transform duration-700 hover:scale-[1.05] hover:-translate-x-2" style={{ transform: 'translateZ(30px)' }}>
                        <CharacterSVG type={user?.active_pet_id || island?.hostess_char_id} mood={bonusMode || winTier !== 'NONE' ? 'win' : 'idle'} />
                        <AnimatePresence>
                            {charInteraction && (
                                <motion.div initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 20 }} className={`absolute -top-10 left-0 bg-white text-black p-3 rounded-2xl rounded-bl-none shadow-2xl border-2 z-50 font-black text-xs uppercase italic tracking-wider whitespace-nowrap ${inZone ? 'border-yellow-500 shadow-[0_0_15px_gold]' : 'border-cyan-500'}`}>
                                    <MessageCircle size={14} className="inline mr-1" /> {charInteraction}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="absolute top-[21.25%] left-[16.67%] w-[66.67%] h-[28.75%] flex flex-col z-20" style={{ transform: 'translateZ(5px)' }}>
                        <div className={`h-[15%] flex items-center justify-between px-3 bg-black/90 border-b border-white/5 ${inZone && !bonusMode ? 'border-yellow-500 shadow-[0_0_10px_gold] bg-yellow-900/30' : ''}`}>
                            <span className={`text-[10px] font-black tracking-widest uppercase ${inZone ? 'text-yellow-400 animate-pulse' : 'text-cyan-400'}`}>
                                {inZone ? "★ ZONE ACTIVE ★" : (bonusMode ? "BONUS RUSH" : "LUCKY SLOT")}
                            </span>
                            {bonusMode && <span className="text-[10px] font-mono font-bold text-yellow-400 animate-pulse">LEFT: {bonusSpinsLeft}</span>}
                        </div>

                        <div className={`flex-1 flex gap-[1%] p-[1%] bg-[#050505] rounded-b-sm border-x-2 border-b-2 relative ${inZone && !bonusMode ? 'border-yellow-500/50 shadow-[inset_0_0_30px_rgba(234,179,8,0.2)]' : 'border-gray-900'}`}>
                            {[0, 1, 2].map(colIdx => (
                                <ReelColumn key={colIdx} isSpinning={isSpinning[colIdx]} finalSymbols={reels.slice(colIdx * 3, colIdx * 3 + 3)} islandId={island?.id} isWinning={winningLines.length > 0 && winningLines.some(lId => [0,1,2,3,4].includes(lId) || (lId === 99 && colIdx === 0))} isTeaser={isTeaser} isFreeze={isFreeze} />
                            ))}

                            {winningLines.length > 0 && winStage !== 'gambling' && (
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-40" preserveAspectRatio="none">
                                    <defs><filter id="winlineGlow"><feGaussianBlur stdDeviation={winTier === 'EPIC' ? "8" : "4"} result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                                    {winningLines.map(lineIdx => {
                                        if (lineIdx === 99) return null; 
                                        const paths = { 0: "M 0 16.6% L 100% 16.6%", 1: "M 0 50% L 100% 50%", 2: "M 0 83.3% L 100% 83.3%", 3: "M 0 0 L 100% 100%", 4: "M 0 100% L 100% 0" };
                                        const nodes = { 0: [{x: '0', y: '16.6%'}, {x: '100%', y: '16.6%'}], 1: [{x: '0', y: '50%'}, {x: '100%', y: '50%'}], 2: [{x: '0', y: '83.3%'}, {x: '100%', y: '83.3%'}], 3: [{x: '0', y: '0'}, {x: '100%', y: '100%'}], 4: [{x: '0', y: '100%'}, {x: '100%', y: '0'}] };
                                        return (
                                            <g key={lineIdx} filter="url(#winlineGlow)">
                                                <motion.path d={paths[lineIdx]} stroke={lineStyle.color} strokeWidth={strokeWidths[winTier] || 4} fill="none" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${lineStyle.shadow})` }} initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: [1, 0.5, 1] }} transition={{ duration: 0.4, ease: "easeOut", opacity: { repeat: Infinity, duration: 0.2 } }} />
                                                <circle cx={nodes[lineIdx][0].x} cy={nodes[lineIdx][0].y} r="6" fill="#fff" className="animate-pulse" />
                                                <circle cx={nodes[lineIdx][1].x} cy={nodes[lineIdx][1].y} r="6" fill="#fff" className="animate-pulse" />
                                            </g>
                                        );
                                    })}
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* DYNAMIC CONTROL DECK */}
                    <div className="absolute top-[57.5%] left-[5%] w-[90%] h-[15%] z-50 pointer-events-auto" style={{ perspective: '800px', transform: 'translateZ(40px)' }}>
                        <div className="w-full h-full relative flex items-center justify-center" style={{ transform: 'rotateX(25deg)', transformOrigin: 'top center' }}>
                            
                            {/* Left Controls: V3 Restricted Bets */}
                            <div className={`absolute left-[2%] top-[10%] flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 shadow-inner transition-opacity ${isCurrentlySpinning ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                <button onClick={() => { if(!isMuted) playSound('click'); setBetIndex(Math.max(0, betIndex - 1))}} className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-white active:bg-cyan-600 active:scale-95 transition-all"><Minus size={14}/></button>
                                <div className="w-16 text-center font-mono font-bold text-yellow-400 text-xs">{currentBet.toLocaleString()}</div>
                                <button onClick={() => { if(!isMuted) playSound('click'); setBetIndex(Math.min(BET_AMOUNTS.length - 1, betIndex + 1))}} className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-white active:bg-cyan-600 active:scale-95 transition-all"><Plus size={14}/></button>
                            </div>
                            
                            <button 
                                onClick={() => { if(!isMuted) playSound('click'); setBetIndex(BET_AMOUNTS.length - 1)}} 
                                disabled={isCurrentlySpinning}
                                className={`absolute left-[2%] top-[60%] w-[100px] h-8 bg-orange-700 rounded-lg border-b-4 border-black text-[10px] font-black text-white flex items-center justify-center transition-all shadow-md ${isCurrentlySpinning ? 'opacity-50 cursor-not-allowed border-b-0 translate-y-1' : 'active:translate-y-1 active:border-b-0'}`}
                            >
                                MAX BET
                            </button>

                            {/* Center Controls: Hide manual stop buttons when NOT spinning */}
                            <div className={`absolute left-[31%] top-[25%] flex gap-[10%] w-[38%] justify-between z-50 transition-opacity duration-300 ${isCurrentlySpinning ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                {[0, 1, 2].map((idx) => {
                                    const naviOrder = atSequence ? atSequence.indexOf(idx) : -1;
                                    const isCurrentNavi = atSequence && atSequence[atCurrentStep] === idx;
                                    const showNavi = atSequence && atSequence.length > 0 && naviOrder >= atCurrentStep && isSpinning[idx];

                                    return (
                                        <button key={idx} onClick={() => handleManualStop(idx)} disabled={!isSpinning[idx] || autoPlay} className={`relative w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all shadow-xl touch-manipulation ${isSpinning[idx] && !autoPlay ? 'bg-red-600 border-red-400 text-white cursor-pointer shadow-[0_0_20px_red] hover:bg-red-500' : 'bg-black/50 border-gray-800 text-gray-700 cursor-default opacity-40'} ${isCurrentNavi && !autoPlay ? 'animate-pulse ring-4 ring-yellow-400 border-white' : ''} ${reelThud[idx] ? 'scale-75 border-0 bg-red-800' : 'scale-100'}`}>
                                            <StopCircle size={20} fill={isSpinning[idx] ? "currentColor" : "none"}/>
                                            {showNavi && <div className={`absolute -top-10 w-10 h-10 rounded-full border-2 font-black text-lg flex items-center justify-center z-50 pointer-events-none transition-all ${isCurrentNavi ? 'bg-yellow-400 text-black border-white animate-bounce shadow-[0_0_20px_gold] scale-125' : 'bg-black/90 text-yellow-500 border-yellow-500 opacity-80'}`}>{naviOrder + 1}</div>}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Right Controls: Central Primary Action Button */}
                            <button 
                                onClick={isCurrentlySpinning ? handleQuickStop : handleSpin} 
                                disabled={!isReady || (isProcessing.current && !isCurrentlySpinning) || isFreeze || winStage !== 'idle'} 
                                className={`absolute right-[2%] top-[5%] w-20 h-20 rounded-full border-b-[8px] flex flex-col items-center justify-center shadow-2xl transition-all touch-manipulation 
                                ${!isReady || (isProcessing.current && !isCurrentlySpinning) ? 'bg-gray-800 border-gray-950 opacity-50 translate-y-1 border-b-[4px]' : 
                                  isCurrentlySpinning ? 'bg-gradient-to-b from-red-600 to-red-900 border-red-950 text-white shadow-[0_0_20px_red] active:translate-y-2 active:border-b-0' :
                                  'bg-gradient-to-b from-red-500 to-red-800 border-red-950 text-white hover:brightness-110 active:translate-y-2 active:border-b-0'}`}
                            >
                                {turboMode && !isCurrentlySpinning && <Zap className="absolute -top-2 -right-2 text-yellow-400 fill-yellow-400 animate-pulse drop-shadow-[0_0_10px_yellow]" size={20} />}
                                {isCurrentlySpinning ? <StopCircle size={28} strokeWidth={2.5} className="text-white mb-1" /> : <Gamepad2 size={28} strokeWidth={2.5} className="text-white mb-1" />}
                                <span className="text-[9px] font-black text-white tracking-widest uppercase drop-shadow-md">
                                    {!isReady ? 'WAIT...' : (isCurrentlySpinning ? 'STOP' : 'SPIN')}
                                </span>
                            </button>

                            {/* Secondary Controls: Auto / Turbo */}
                            <div className="absolute right-[30%] top-[15%] flex flex-col gap-2">
                                <button onClick={() => { if(!isMuted) playSound('click'); setTurboMode(!turboMode)}} className={`w-10 h-10 rounded-lg border-b-4 flex items-center justify-center transition-all active:translate-y-1 active:border-b-0 ${turboMode ? 'bg-yellow-500 text-black border-yellow-800 shadow-[0_0_15px_gold]' : 'bg-gray-800 text-gray-400 border-gray-950 shadow-md'}`}><Zap size={18} fill={turboMode ? "currentColor" : "none"}/></button>
                                <button onClick={toggleAutoPlay} className={`w-10 h-10 rounded-lg border-b-4 flex items-center justify-center transition-all active:translate-y-1 active:border-b-0 ${autoPlay ? 'bg-green-600 text-white border-green-900 shadow-[0_0_15px_lime]' : 'bg-gray-800 text-gray-400 border-gray-950 shadow-md'}`}>
                                    {autoPlay ? <Repeat size={18} className="animate-spin-slow" /> : <Repeat size={18}/>}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* COIN VFX */}
            {coins.map(c => (
                <div key={c.id} className="absolute top-[-20px] animate-fall z-50 pointer-events-none" style={{ left: `${c.left}%`, animationDuration: '2.5s', animationDelay: `${c.delay}s`, transform: `scale(${c.scale}) rotate(${c.rotation}deg)` }}>
                    <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-200 shadow-lg flex items-center justify-center font-black text-yellow-700 text-xs"><Coins size={10} strokeWidth={3}/></div>
                </div>
            ))}

            {/* --- MODALS --- */}
            <AnimatePresence>
                {showPaytable && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 pointer-events-auto" onClick={() => setShowPaytable(false)}>
                        <GlassCard className="w-full max-w-sm p-0 overflow-hidden border-cyan-500/50 shadow-[0_0_40px_rgba(0,243,255,0.2)]" onClick={e => e.stopPropagation()}>
                            <div className="bg-gradient-to-r from-cyan-900 to-blue-900 p-4 flex justify-between items-center border-b border-cyan-500/30">
                                <h3 className="text-white font-black text-lg flex items-center gap-2"><HelpCircle size={18}/> PAYTABLE</h3>
                                <button onClick={() => setShowPaytable(false)} className="text-white/70 hover:text-white"><X size={20}/></button>
                            </div>
                            <div className="p-4 bg-black/80 space-y-2">
                                {PAYTABLE_DATA.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 p-1 bg-black rounded shadow-inner"><SymbolSVG id={item.id} islandId={parseInt(island?.id || 1)} /></div>
                                            <span className={`font-bold text-sm ${item.color}`}>{item.name}</span>
                                        </div>
                                        <div className="font-mono text-white font-black">{typeof item.mult === 'number' ? `x${item.mult}` : item.mult}</div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {winStage === 'celebrating' && winDetails && !bonusMode && (
                    <motion.div initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} animate={{ opacity: 1, backdropFilter: 'blur(10px)' }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                        {(winTier === 'EPIC' || isJackpot) && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-30 mix-blend-color-dodge animate-pulse hue-rotate-90"></div>}
                        <motion.div initial={{ scale: 0.5, y: 100 }} animate={{ scale: (winTier === 'EPIC' || isJackpot) ? 1.2 : 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 15 } }} className="relative z-10 flex flex-col items-center">
                            <GlassCard className={`p-10 text-center flex flex-col items-center border-t-8 border-b-8 ${isJackpot ? 'border-yellow-400 shadow-[0_0_150px_gold]' : (winDetails?.color?.replace('text-', 'border-') || 'border-cyan-400')} ${winDetails?.glow} ${winTier === 'EPIC' ? 'shadow-[0_0_100px_rgba(255,215,0,0.8)]' : ''}`}>
                                {isJackpot ? <h1 className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-orange-500 to-red-600 drop-shadow-2xl mb-4 animate-pulse">GRAND JACKPOT</h1> : 
                                 winTier === 'EPIC' ? <h1 className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-purple-200 to-pink-600 drop-shadow-2xl mb-4 animate-pulse">EPIC WIN</h1> : 
                                 winTier === 'MEGA' ? <h1 className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 to-blue-600 drop-shadow-lg mb-4">MEGA WIN</h1> : null}
                                <motion.div animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-32 h-32 mb-6">
                                    <SymbolSVG id={winDetails.id} islandId={parseInt(island?.id || 1)} isWinning={true} />
                                </motion.div>
                                <h2 className={`text-4xl font-black italic tracking-tighter uppercase drop-shadow-2xl ${winDetails?.color}`}>{winDetails?.name}</h2>
                                <div className="text-6xl font-mono font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] mt-6 bg-black/50 px-6 py-2 rounded-2xl border border-white/20">
                                    +<RollupNumber value={lastWin} duration={winTier === 'EPIC' ? 2500 : 1500} />
                                </div>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showBonusSummary && (
                    <motion.div initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} animate={{ opacity: 1, backdropFilter: 'blur(10px)' }} className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 pointer-events-auto">
                        <GlassCard className="w-full max-w-sm p-8 text-center border-yellow-500/50 shadow-[0_0_80px_gold]">
                            <Trophy size={80} className="text-yellow-500 mx-auto mb-6 animate-bounce drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]" />
                            <h3 className="text-gray-400 font-bold text-sm mb-1 uppercase tracking-widest">Bonus Complete</h3>
                            <h2 className="text-4xl font-black text-white italic mb-6">TOTAL GET</h2>
                            <div className="text-6xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 mb-8 border-y border-white/10 py-6 drop-shadow-xl">
                                +<RollupNumber value={bonusTotalWin} duration={2000} />
                            </div>
                            <button onClick={() => { if(!isMuted) playSound('click'); clearBonusTotal(); }} className="w-full py-4 bg-white text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 transition-all">CONTINUE</button>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default PlayView;