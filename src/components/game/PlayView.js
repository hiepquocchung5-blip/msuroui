import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Minus, Plus, Zap, StopCircle, Gamepad2, 
    Trophy, Flame, MessageCircle, TrendingUp, 
    ShieldAlert, X, Coins, Repeat, Target, Activity, Cpu, MapPin, HelpCircle, AlertOctagon
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
    { id: 1, name: 'GRAND JACKPOT', mult: 'MEGA', color: 'text-red-500', glow: 'shadow-[0_0_50px_red]' },
    { id: 2, name: 'CHARACTER', mult: 20, color: 'text-purple-400', glow: 'shadow-[0_0_30px_purple]' },
    { id: 3, name: 'BAR', mult: 10, color: 'text-orange-400', glow: 'shadow-[0_0_30px_orange]' },
    { id: 4, name: 'BELL', mult: 10, color: 'text-yellow-200', glow: 'shadow-[0_0_20px_yellow]' },
    { id: 5, name: 'MELON', mult: 15, color: 'text-green-400', glow: 'shadow-[0_0_20px_green]' },
    { id: 6, name: 'CHERRY', mult: 2, color: 'text-pink-400', glow: 'shadow-[0_0_15px_pink]' },
    { id: 7, name: 'REPLAY', mult: 'FREE SPIN', color: 'text-cyan-400', glow: 'shadow-[0_0_15px_cyan]' }
];

const PAYLINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [6, 4, 2]];
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
    }, [value, count]);
    return <>{count.toLocaleString()}</>;
};

const getIslandPaylineStyle = () => {
    return { color: '#00f3ff', shadow: 'rgba(0, 243, 255, 0.8)' };
};

// --- REFINED SOFTER REEL COMPONENT ---
const ReelColumn = ({ isSpinning, finalSymbols, locked, isWinning, isTeaser, isReachEye, colIdx, isFreeze, islandId }) => {
    const spinStrip = useMemo(() => {
        const randomFill = Array.from({length: 12}, () => Math.floor(Math.random() * 7) + 1);
        return [...finalSymbols, ...randomFill];
    }, [isSpinning, finalSymbols]);

    const displaySymbols = isSpinning ? spinStrip : finalSymbols;
    const isReachReel = isReachEye && isSpinning && colIdx === 2;

    return (
        <div className={`flex-1 flex flex-col relative h-full bg-gradient-to-b from-[#0f1115] via-[#1c1f26] to-[#0f1115] border-x border-white/10 rounded-md overflow-hidden transition-all duration-500
            ${locked ? 'border-2 border-yellow-400' : ''}
            ${isReachReel ? 'ring-4 ring-red-500 shadow-[inset_0_0_80px_rgba(239,68,68,0.5)] animate-pulse saturate-150' : ''}
        `}>
            <svg width="0" height="0" className="absolute"><defs><filter id="vertBlur"><feGaussianBlur in="SourceGraphic" stdDeviation={isReachReel ? "0 1.5" : "0 4"} /></filter></defs></svg>
            <div className="absolute inset-0 overflow-hidden" style={{ perspective: '1000px' }}>
                <div 
                    className={`w-full absolute flex flex-col justify-between 
                        ${isSpinning ? (isReachReel ? 'animate-[reel-spin-smooth_0.4s_linear_infinite]' : 'animate-[reel-spin-smooth_0.15s_linear_infinite]') : 'animate-[snap-bounce-soft_0.4s_cubic-bezier(0.2,0.8,0.2,1)_forwards]'} 
                        ${isFreeze ? 'brightness-50 grayscale' : ''}
                    `} 
                    style={{ height: isSpinning ? '500%' : '100%', top: 0, filter: isSpinning ? 'url(#vertBlur)' : 'none' }}
                >
                    {displaySymbols.map((symId, idx) => (
                        <div key={idx} className="relative flex items-center justify-center w-full" style={{ height: isSpinning ? '6.66%' : '32%' }}>
                            <div className={`w-[85%] aspect-square flex items-center justify-center bg-black/20 backdrop-blur-[2px] border border-white/5 rounded-xl shadow-inner transition-colors duration-500
                                ${isTeaser && !isReachEye && !isSpinning && idx === 1 && colIdx === 1 ? 'ring-2 ring-red-500/50 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.6)] bg-red-900/20' : ''}
                                ${isWinning && !isSpinning && idx < 3 ? 'z-10 shadow-[0_0_40px_rgba(255,215,0,0.4)] bg-yellow-900/20 ring-1 ring-yellow-400/80 scale-105' : ''}
                            `}>
                                <SymbolSVG id={symId} isWinning={isWinning && !isSpinning && idx < 3} islandId={islandId} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {isReachReel && (
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 to-transparent mix-blend-overlay animate-pulse z-30 pointer-events-none"></div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 z-20 pointer-events-none shadow-[inset_0_15px_15px_-10px_rgba(0,0,0,0.6),inset_0_-15px_15px_-10px_rgba(0,0,0,0.6)]"></div>
        </div>
    );
};

const PlayView = ({ machine, island, onLeave }) => {
    const router = useRouter();
    const { user, updateBalance } = useAuth();
    const { addToast } = useToast();
    const { playSound } = useGameSound();
    
    const slotLogic = useSlotMachine(machine?.id, island?.id, machine?.session_token);
    
    const { 
        reels, winningLines, isSpinning, isTeaser, isReachEye, isFreeze, lastWin, winTier, sessionWinStreak, streakMult, volatility,
        freeSpins, bonusMode, bonusSpinsLeft, atSequence, atCurrentStep,
        showBonusSummary, bonusTotalWin, clearBonusTotal, levelUpData, setLevelUpData,
        isJackpot, setIsJackpot, lapsSinceBonus, momentumMult, inZone, error, 
        showIdleWarning, isIdleKicked, resetIdleTimer, isReady,
        autoPlay, spin, stopReel, setAutoPlay, setLastWin, turboMode, setTurboMode
    } = slotLogic;
    
    const [betIndex, setBetIndex] = useState(0);
    const [winStage, setWinStage] = useState('idle');
    const [charInteraction, setCharInteraction] = useState(null);
    const [coinParticles, setCoinParticles] = useState([]); 
    const [showPaytable, setShowPaytable] = useState(false);
    
    // --- Responsive & Gyroscope State ---
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);
    
    const [reelThud, setReelThud] = useState([false, false, false]);
    const [currentJackpot, setCurrentJackpot] = useState(3000000);
    const currentBet = BET_AMOUNTS[betIndex];

    const isProcessing = useRef(false);
    const winHandled = useRef(false); 
    const isCurrentlySpinning = isSpinning.some(s => s);
    const isReachWaitState = isReachEye && isCurrentlySpinning && !isSpinning[0] && !isSpinning[1] && isSpinning[2];

    const MACHINES_PER_FLOOR = 90;
    const currentFloor = Math.ceil((machine?.machine_number || 1) / MACHINES_PER_FLOOR);
    const relativeNum = (((machine?.machine_number || 1) - 1) % MACHINES_PER_FLOOR) + 1;
    const displayId = `${currentFloor}-${relativeNum.toString().padStart(2, '0')}`;

    // --- SCREEN SIZE DETECTION ---
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // --- GYROSCOPE & MOUSE PARALLAX ---
    useEffect(() => {
        const handleOrientation = (e) => {
            if (!e.gamma || !e.beta) return;
            // Gamma: left/right (-90 to 90). Beta: front/back (-180 to 180)
            const x = Math.min(Math.max(e.gamma / 4, -15), 15);
            const y = Math.min(Math.max((e.beta - 45) / 4, -15), 15);
            setMousePos({ x, y: -y }); 
        };
        
        // Only attach device orientation on mobile devices to prevent permission loops on desktop
        if (isMobile && typeof window !== 'undefined' && window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation);
        }
        
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [isMobile]);

    const handlePointerMove = useCallback((e) => {
        if(resetIdleTimer) resetIdleTimer();
        if (!isMobile && typeof window !== 'undefined') {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const x = ((clientX / innerWidth) - 0.5) * 15;
            const y = ((clientY / innerHeight) - 0.5) * -15;
            setMousePos({ x, y });
        }
    }, [resetIdleTimer, isMobile]);

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

    // --- ERROR & STATE HANDLING ---
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

    useEffect(() => {
        if (isFreeze) { playSound('bigwin'); } 
    }, [isFreeze, playSound]);

    useEffect(() => {
        if (isReachWaitState) setCharInteraction("🔥 GEKIATSU! REACH!");
        else if (inZone && isCurrentlySpinning) setCharInteraction("⚠️ ZONE ACTIVE!");
        else if (sessionWinStreak >= 3 && !isCurrentlySpinning) setCharInteraction(`🔥 COMBO x${sessionWinStreak}!`);
        else if (momentumMult > 1.2 && !isCurrentlySpinning) setCharInteraction(`Momentum x${momentumMult.toFixed(1)}!`);
        else setCharInteraction(null);
    }, [isReachWaitState, inZone, momentumMult, sessionWinStreak, streakMult, isCurrentlySpinning]);

    useEffect(() => {
        if (levelUpData) { playSound('bigwin'); triggerCoinShower(80); }
    }, [levelUpData, playSound]);

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
        
        if (!isCurrentlySpinning) isProcessing.current = false;
    }, [lastWin, autoPlay, playSound, bonusMode, winStage, isCurrentlySpinning, winTier, isJackpot, setLastWin]);

    const triggerCoinShower = (amount = 40) => {
        const newParticles = Array.from({length: amount}).map((_, i) => ({
            id: Date.now() + i, left: Math.random() * 100, delay: Math.random() * 1.5,
            scale: 0.5 + Math.random(), rotation: Math.random() * 360
        }));
        setCoinParticles(newParticles);
        setTimeout(() => setCoinParticles([]), 4000);
    };

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
        
        if (freeSpins === 0 && !bonusMode) setCurrentJackpot(prev => prev + (currentBet * 0.05));

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
        if (!isCurrentlySpinning || isFreeze) return;
        playSound('stop');
        if (navigator.vibrate) navigator.vibrate(20);
        
        if (autoPlay) setAutoPlay(false);

        const order = (atSequence && atSequence.length === 3) ? atSequence : [0, 1, 2];
        let delay = 0;
        order.forEach((reelIdx) => {
            if (isSpinning[reelIdx]) {
                setTimeout(() => stopReel(reelIdx), delay);
                if (isReachEye && reelIdx === 2) delay += 1200; 
                else delay += 100; 
            }
        });
    }, [isCurrentlySpinning, isFreeze, playSound, autoPlay, setAutoPlay, atSequence, isSpinning, stopReel, isReachEye]);

    const toggleAutoPlay = () => {
        playSound('click');
        const nextState = !autoPlay;
        setAutoPlay(nextState);
        if (!nextState && isCurrentlySpinning && !isFreeze) handleQuickStop();
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if(resetIdleTimer) resetIdleTimer();
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
            {/* SOFTER UI/UX ANIMATIONS */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes reel-spin-smooth { 
                    0% { transform: translateY(-80%); filter: blur(3px); } 
                    100% { transform: translateY(0%); filter: blur(3px); } 
                }
                @keyframes snap-bounce-soft { 
                    0% { transform: translateY(-10%); } 
                    40% { transform: translateY(3%); } 
                    75% { transform: translateY(-1%); } 
                    100% { transform: translateY(0%); } 
                }
                @keyframes shake-epic { 0%, 100% { transform: translate(0,0) rotate(0deg); } 10%, 30%, 50%, 70%, 90% { transform: translate(-8px, 8px) rotate(-2deg); } 20%, 40%, 60%, 80% { transform: translate(8px, -8px) rotate(2deg); } }
                .animate-shake-epic { animation: shake-epic 0.4s infinite; }
                @keyframes glitch-noise { 0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 2px); } 20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -2px); } 40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, -2px); } 60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, 2px); } 80% { clip-path: inset(10% 0 70% 0); transform: translate(-2px, 2px); } 100% { clip-path: inset(30% 0 50% 0); transform: translate(2px, -2px); } }
                .animate-glitch { animation: glitch-noise 0.2s linear infinite alternate-reverse; }
            `}} />

            {/* --- CINEMATIC OVERLAYS --- */}
            <AnimatePresence>
                {isFreeze && isCurrentlySpinning && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-[200] bg-black pointer-events-none flex flex-col items-center justify-center mix-blend-difference"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-50 animate-pulse"></div>
                        <h1 className="text-white text-4xl md:text-8xl font-black italic tracking-tighter animate-glitch relative">
                            SYSTEM FREEZE
                            <span className="absolute inset-0 text-red-500 animate-glitch mix-blend-screen" style={{ left: '4px', animationDelay: '0.1s' }}>SYSTEM FREEZE</span>
                            <span className="absolute inset-0 text-cyan-500 animate-glitch mix-blend-screen" style={{ left: '-4px', animationDelay: '0.2s' }}>SYSTEM FREEZE</span>
                        </h1>
                        <p className="text-red-500 mt-4 font-mono tracking-[0.5em] animate-pulse text-xs md:text-base">AWAITING MIRACLE...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isReachWaitState && !isFreeze && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} 
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="fixed inset-0 z-40 pointer-events-none flex flex-col items-center justify-center mix-blend-overlay"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 to-transparent"></div>
                        <h1 className="text-red-500 text-7xl md:text-[10rem] font-black italic drop-shadow-[0_0_80px_red] animate-pulse" style={{ fontFamily: 'Impact, sans-serif' }}>
                            激熱
                        </h1>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- IMMERSIVE BACKGROUND --- */}
            <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isCurrentlySpinning ? 'opacity-40' : 'opacity-100'}`}>
                <div className={`absolute inset-0 scale-110 blur-[1px] opacity-60 transition-all duration-1000 ${isReachWaitState ? 'grayscale-[30%] sepia-[50%] hue-rotate-[-20deg] scale-125' : ''}`}>
                    <IslandLandscapeSVG islandId={island?.id} />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black opacity-90"></div>
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
            <div className="bg-black border-b border-white/10 h-8 md:h-10 flex items-center overflow-hidden relative z-30 shadow-lg">
                <div className="bg-gradient-to-r from-yellow-700 to-yellow-900 h-full px-2 md:px-4 flex items-center justify-center border-r border-yellow-500/50 z-10 shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
                    <Trophy className="w-3 h-3 md:w-4 md:h-4 text-yellow-300 md:mr-2 drop-shadow-md" />
                    <span className="hidden md:inline text-yellow-300 font-black text-xs tracking-widest italic drop-shadow-md">GRAND JACKPOT</span>
                </div>
                <div className="flex-1 px-3 md:px-6 flex items-center justify-between bg-gradient-to-r from-yellow-900/10 to-transparent">
                    <div className="text-yellow-400 font-mono font-black text-lg md:text-xl tracking-[0.2em] drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]">
                        <RollupNumber value={currentJackpot} duration={500} />
                    </div>
                    {currentJackpot >= 7000000 ? (
                        <div className="text-[8px] md:text-[10px] bg-purple-600 text-white font-bold px-1.5 py-0.5 rounded animate-pulse shadow-[0_0_15px_purple]">CRITICAL</div>
                    ) : currentJackpot >= 3600000 ? (
                        <div className="text-[8px] md:text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded animate-pulse shadow-[0_0_10px_red]">HOT</div>
                    ) : (
                        <div className="text-[8px] md:text-[10px] text-gray-500 font-bold px-1.5 py-0.5 uppercase tracking-widest">BUILDING</div>
                    )}
                </div>
                <div className={`absolute bottom-0 left-0 h-[2px] transition-all duration-500 shadow-[0_0_8px_currentColor] ${currentJackpot >= 7000000 ? 'bg-purple-500 text-purple-500' : currentJackpot >= 3600000 ? 'bg-red-500 text-red-500' : 'bg-yellow-500 text-yellow-500'}`} style={{ width: `${jpProgressPercent}%` }} />
            </div>
            
            {/* --- RESPONSIVE CYBER HUD --- */}
            <div className="absolute top-16 md:top-20 left-0 w-full px-2 md:px-6 flex flex-row justify-between items-start z-40 pointer-events-none mt-1">
                
                {/* Left Side: Navigation & Momentum */}
                <div className="flex flex-col gap-1 md:gap-2">
                    <div className="flex items-start gap-2 md:gap-3 pointer-events-auto">
                        <button onClick={onLeave} className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/50 transition-all active:scale-[0.98] shadow-lg rounded-full backdrop-blur-md">
                            <ChevronLeft size={20} className="md:w-6 md:h-6" />
                        </button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1 md:gap-2 text-cyan-400 mb-0.5 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                                <MapPin size={10} className="md:w-3 md:h-3" />
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest bg-cyan-950/50 border border-cyan-500/30 px-1.5 py-0.5 rounded shadow-inner">
                                    {island?.name || 'Kyoto Zen'} • FLR {currentFloor}
                                </span>
                            </div>
                            <h2 className="text-white font-black text-sm md:text-2xl italic uppercase tracking-wider leading-none drop-shadow-md truncate flex items-center gap-1 md:gap-2">
                                <Cpu size={14} className="md:w-5 md:h-5 text-cyan-500"/> UNIT #{displayId}
                            </h2>
                        </div>
                    </div>
                    
                    <div className={`pointer-events-auto w-fit bg-black/80 border rounded-lg md:rounded-xl p-1 md:p-2 px-2 md:px-3 flex items-center gap-1 md:gap-3 backdrop-blur-md shadow-lg transition-colors duration-500 mt-1 ${momentumMult > 1.5 ? 'border-purple-500 shadow-[0_0_15px_purple]' : 'border-cyan-500/30'}`}>
                        <TrendingUp size={12} className={`md:w-4 md:h-4 ${momentumMult > 1.5 ? 'text-purple-400 animate-pulse' : 'text-cyan-400'}`} />
                        <div>
                            <div className={`text-[6px] md:text-[8px] font-bold uppercase tracking-wider ${momentumMult > 1.5 ? 'text-purple-500' : 'text-cyan-500'}`}>Momentum</div>
                            <div className="text-[10px] md:text-sm font-mono font-black text-white leading-none mt-0.5">x{momentumMult.toFixed(1)}</div>
                        </div>
                    </div>

                    <div className="pointer-events-auto mt-0.5 md:mt-1 flex items-center gap-1 px-1.5 py-1 bg-black/60 rounded border border-white/5 w-fit shadow-sm">
                         <AlertOctagon size={8} className={`md:w-3 md:h-3 ${volatility === 'extreme' || volatility === 'high' ? 'text-red-500' : 'text-gray-400'}`} />
                         <span className="text-[6px] md:text-[8px] text-gray-400 uppercase tracking-widest hidden md:inline">VOLATILITY:</span>
                         <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-widest ${volatility === 'extreme' ? 'text-red-500' : volatility === 'high' ? 'text-orange-500' : volatility === 'low' ? 'text-green-400' : 'text-cyan-400'}`}>{volatility}</span>
                    </div>
                </div>

                {/* Right Side: Wallet, Tenjo, AI Predictor */}
                <div className="flex flex-col items-end gap-1 md:gap-2">
                    <div className="pointer-events-auto bg-gradient-to-r from-gray-900 to-black border border-yellow-500/30 rounded-full px-2 md:px-4 py-1 md:py-2 flex items-center gap-1 md:gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(234,179,8,0.15)] cursor-pointer hover:border-yellow-500/60 transition-all duration-300 group" onClick={() => router.push('/wallet')}>
                        <Coins size={12} className="text-yellow-400 md:w-4 md:h-4 group-hover:animate-spin-slow" />
                        <span className="text-white font-mono font-black text-[10px] md:text-base tracking-tight"><RollupNumber value={user?.balance || 0} /></span>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        <div className="bg-black/80 border border-red-500/30 rounded-lg md:rounded-xl p-1 md:p-2 px-2 md:px-3 flex items-center gap-1 md:gap-3 backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                            <div className="text-right">
                                <div className="text-[6px] md:text-[8px] text-red-500 font-bold uppercase tracking-wider">Tenjo Target</div>
                                <div className="text-[10px] md:text-sm font-mono font-black text-white leading-none mt-0.5">{lapsSinceBonus} <span className="text-gray-500">/ 777</span></div>
                            </div>
                            <Target size={12} className="text-red-400 md:w-4 md:h-4 animate-pulse" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        <div className="bg-black/80 border border-white/10 rounded-lg md:rounded-xl p-1 md:p-2 px-2 md:px-3 flex items-center gap-1 md:gap-3 backdrop-blur-md shadow-inner">
                            <div className="text-right">
                                <div className="text-[6px] md:text-[8px] text-gray-500 font-bold uppercase tracking-wider">AI Status</div>
                                <div className={`text-[10px] md:text-sm font-mono font-black leading-none mt-0.5 ${isOverheating ? 'text-orange-400 animate-pulse' : 'text-cyan-400'}`}>
                                    {isOverheating ? 'OVERHEATING' : 'GATHERING'}
                                </div>
                            </div>
                            <Activity size={12} className={`md:w-4 md:h-4 ${isOverheating ? 'text-orange-400' : 'text-cyan-400'}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN GAME STAGE --- */}
            <div className={`flex-1 flex items-center justify-center relative z-10 px-2 pt-28 pb-12 md:pb-6 ${isFreeze || winTier === 'EPIC' || isJackpot ? 'animate-shake-epic' : ''}`} style={{ perspective: isMobile ? '800px' : '1200px' }}>
                
                {/* DYNAMIC CHARACTER LAYER (Behind Cabinet on Mobile, Beside on Desktop) */}
                <div 
                    className={`absolute pointer-events-none drop-shadow-2xl transition-all duration-700 ease-in-out z-0 md:z-20
                        ${isMobile 
                            ? 'top-[-10%] left-1/2 w-[160%] h-[120%] opacity-40 mix-blend-screen' 
                            : 'bottom-[5%] right-[-25%] w-[65%] h-[70%] opacity-100 mix-blend-normal'
                        }
                    `} 
                    style={{ 
                        transform: isMobile 
                            ? `translate(-50%, 0) translateZ(-100px) rotateX(${mousePos.y * 0.5}deg) rotateY(${mousePos.x * 0.5}deg)` 
                            : `translateZ(30px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)` 
                    }}
                >
                    <CharacterSVG type={user?.active_pet_id || island?.hostess_char_id} mood={isReachWaitState ? 'sad' : (bonusMode || winTier !== 'NONE' ? 'win' : 'idle')} />
                    
                    <AnimatePresence>
                        {charInteraction && !isMobile && (
                            <motion.div initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 10 }} transition={{ type: 'spring', damping: 20 }} className={`absolute -top-10 left-0 bg-white/95 backdrop-blur-sm text-black p-3 rounded-2xl rounded-bl-none shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-2 z-50 font-black text-xs uppercase italic tracking-wider whitespace-nowrap ${isReachWaitState ? 'border-red-500 text-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : (inZone ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'border-cyan-500')}`}>
                                <MessageCircle size={14} className="inline mr-1" /> {charInteraction}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.div 
                    className="relative w-full max-w-[350px] md:max-w-[400px] aspect-[0.6] flex items-center justify-center z-10"
                    animate={{ rotateX: mousePos.y, rotateY: mousePos.x }}
                    transition={{ type: 'spring', stiffness: isMobile ? 50 : 75, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Cabinet Graphic */}
                    <div className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_30px_35px_rgba(0,0,0,0.8)]" style={{ transform: 'translateZ(-10px)' }}>
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
                        />
                        {turboMode && <div className="absolute inset-0 rounded-[2rem] border-[4px] border-yellow-500 opacity-50 shadow-[0_0_40px_rgba(255,215,0,0.4)] animate-pulse pointer-events-none"></div>}
                        {isReachWaitState && <div className="absolute inset-0 rounded-[2rem] border-[4px] border-red-600 opacity-80 shadow-[inset_0_0_60px_rgba(239,68,68,0.5)] animate-pulse pointer-events-none"></div>}
                    </div>

                    {/* Reels Area */}
                    <div className="absolute top-[21.25%] left-[16.67%] w-[66.67%] h-[28.75%] flex flex-col pointer-events-none" style={{ transform: 'translateZ(5px)' }}>
                        <div className={`h-[15%] flex items-center justify-between px-2 md:px-3 bg-black/90 border-b border-white/5 ${inZone && !bonusMode ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] bg-yellow-900/30' : ''}`}>
                            <span className={`text-[8px] md:text-[10px] font-black tracking-widest uppercase ${isReachWaitState ? 'text-red-500 animate-pulse' : (inZone ? 'text-yellow-400 animate-pulse' : 'text-cyan-400')}`}>
                                {isReachWaitState ? "!!! GEKIATSU !!!" : (inZone ? "★ ZONE ACTIVE ★" : (bonusMode ? "BONUS RUSH" : "LUCKY SLOT"))}
                            </span>
                            {bonusMode && <span className="text-[8px] md:text-[10px] font-mono font-bold text-yellow-400 animate-pulse">LEFT: {bonusSpinsLeft}</span>}
                        </div>

                        <div className={`flex-1 flex gap-[1%] p-[1%] bg-[#050505] rounded-b-sm border-x-2 border-b-2 relative ${isReachWaitState ? 'border-red-600 shadow-[inset_0_0_40px_rgba(239,68,68,0.3)]' : (inZone && !bonusMode ? 'border-yellow-500/50 shadow-[inset_0_0_40px_rgba(234,179,8,0.15)]' : 'border-gray-900')}`}>
                            {[0, 1, 2].map(colIdx => (
                                <ReelColumn 
                                    key={colIdx} 
                                    colIdx={colIdx}
                                    isSpinning={isSpinning[colIdx]} 
                                    finalSymbols={reels.slice(colIdx * 3, colIdx * 3 + 3)} 
                                    islandId={island?.id} 
                                    isWinning={winningLines.length > 0 && winningLines.some(lId => [0,1,2,3,4].includes(lId) || (lId === 99 && colIdx === 0))} 
                                    isTeaser={isTeaser} 
                                    isReachEye={isReachEye}
                                    isFreeze={isFreeze} 
                                />
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
                    <div className="absolute top-[57.5%] left-[5%] w-[90%] h-[15%] pointer-events-auto" style={{ perspective: '800px', transform: 'translateZ(40px)' }}>
                        <div className="w-full h-full relative flex items-center justify-center" style={{ transform: 'rotateX(25deg)', transformOrigin: 'top center' }}>
                            
                            {/* Left Controls: Bet Adjust */}
                            <div className={`absolute left-[2%] top-[5%] md:top-[10%] flex flex-col md:flex-row items-center gap-1 bg-black/60 p-1 md:p-1.5 rounded-lg border border-white/10 shadow-inner backdrop-blur-md transition-opacity duration-300 ${isCurrentlySpinning ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                <div className="flex items-center gap-1 w-full justify-between">
                                    <button onClick={() => { playSound('click'); setBetIndex(Math.max(0, betIndex - 1))}} className="w-6 h-6 md:w-8 md:h-8 bg-gray-800 rounded flex items-center justify-center text-white active:bg-cyan-600 active:scale-[0.98] transition-all"><Minus size={14}/></button>
                                    <div className="w-12 md:w-16 text-center font-mono font-bold text-yellow-400 text-[10px] md:text-xs drop-shadow-sm leading-none">{currentBet.toLocaleString()}</div>
                                    <button onClick={() => { playSound('click'); setBetIndex(Math.min(BET_AMOUNTS.length - 1, betIndex + 1))}} className="w-6 h-6 md:w-8 md:h-8 bg-gray-800 rounded flex items-center justify-center text-white active:bg-cyan-600 active:scale-[0.98] transition-all"><Plus size={14}/></button>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => { playSound('click'); setBetIndex(BET_AMOUNTS.length - 1)}} 
                                disabled={isCurrentlySpinning}
                                className={`absolute left-[2%] top-[55%] md:top-[60%] w-[80px] md:w-[100px] h-6 md:h-8 bg-gradient-to-b from-orange-600 to-orange-800 rounded-lg border-b-4 border-black text-[8px] md:text-[10px] font-black text-white flex items-center justify-center transition-all duration-300 shadow-md ${isCurrentlySpinning ? 'opacity-40 cursor-not-allowed border-b-0 translate-y-1' : 'hover:brightness-110 active:translate-y-1 active:border-b-0'}`}
                            >
                                MAX BET
                            </button>

                            {/* Center Controls: Manual Stops */}
                            <div className={`absolute left-[31%] top-[25%] flex gap-[8%] md:gap-[10%] w-[38%] justify-between transition-opacity duration-500 ${isCurrentlySpinning ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                {[0, 1, 2].map((idx) => {
                                    const naviOrder = atSequence ? atSequence.indexOf(idx) : -1;
                                    const isCurrentNavi = atSequence && atSequence[atCurrentStep] === idx;
                                    const showNavi = atSequence && atSequence.length > 0 && naviOrder >= atCurrentStep && isSpinning[idx];

                                    return (
                                        <button key={idx} onClick={() => handleManualStop(idx)} disabled={!isSpinning[idx] || autoPlay} className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] md:border-4 flex items-center justify-center transition-all duration-300 shadow-xl touch-manipulation z-50 ${isSpinning[idx] && !autoPlay ? 'bg-gradient-to-b from-red-500 to-red-700 border-red-400 text-white cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:brightness-110' : 'bg-black/40 border-gray-800 text-gray-700 cursor-default opacity-50'} ${isCurrentNavi && !autoPlay ? 'animate-pulse ring-4 ring-yellow-400 border-white' : ''} ${reelThud[idx] ? 'scale-75 border-0 bg-red-900' : 'scale-100'}`}>
                                            <StopCircle size={isMobile ? 16 : 20} fill={isSpinning[idx] ? "currentColor" : "none"}/>
                                            {showNavi && <div className={`absolute -top-8 md:-top-10 w-8 h-8 md:w-10 md:h-10 rounded-full border-2 font-black text-sm md:text-lg flex items-center justify-center z-50 pointer-events-none transition-all ${isCurrentNavi ? 'bg-yellow-400 text-black border-white animate-bounce shadow-[0_0_20px_gold] scale-125' : 'bg-black/90 text-yellow-500 border-yellow-500 opacity-80'}`}>{naviOrder + 1}</div>}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Right Controls: Central Primary Action Button */}
                            <button 
                                onClick={isCurrentlySpinning ? handleQuickStop : handleSpin} 
                                disabled={!isReady || (isProcessing.current && !isCurrentlySpinning) || isFreeze || winStage !== 'idle'} 
                                className={`absolute right-[2%] top-[5%] md:top-[10%] w-16 h-16 md:w-20 md:h-20 rounded-full border-b-[6px] md:border-b-[8px] flex flex-col items-center justify-center shadow-2xl transition-all duration-300 ease-out touch-manipulation z-40
                                ${!isReady || (isProcessing.current && !isCurrentlySpinning) ? 'bg-gray-800 border-gray-950 opacity-50 translate-y-1 border-b-[3px] md:border-b-[4px]' : 
                                  isCurrentlySpinning ? 'bg-gradient-to-b from-red-600 to-red-900 border-red-950 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)] active:translate-y-2 active:border-b-0' :
                                  'bg-gradient-to-b from-red-500 to-red-800 border-red-950 text-white hover:brightness-125 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] active:translate-y-2 active:border-b-0'}`}
                            >
                                {turboMode && !isCurrentlySpinning && <Zap className="absolute -top-1 -right-1 md:-top-2 md:-right-2 text-yellow-400 fill-yellow-400 animate-pulse drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" size={isMobile ? 16 : 20} />}
                                {isCurrentlySpinning ? <StopCircle size={isMobile ? 20 : 28} strokeWidth={2.5} className="text-white mb-0.5 md:mb-1" /> : <Gamepad2 size={isMobile ? 20 : 28} strokeWidth={2.5} className="text-white mb-0.5 md:mb-1" />}
                                <span className="text-[7px] md:text-[9px] font-black text-white tracking-widest uppercase drop-shadow-md leading-none">
                                    {!isReady ? 'WAIT' : (isCurrentlySpinning ? 'STOP' : 'SPIN')}
                                </span>
                            </button>

                            {/* Secondary Controls: Auto / Turbo */}
                            <div className="absolute right-[28%] md:right-[30%] top-[10%] md:top-[15%] flex flex-col gap-1 md:gap-2">
                                <button onClick={() => { playSound('click'); setTurboMode(!turboMode)}} className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border-b-[3px] md:border-b-4 flex items-center justify-center transition-all duration-300 active:translate-y-1 active:border-b-0 ${turboMode ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-black border-yellow-800 shadow-[0_0_20px_rgba(234,179,8,0.5)]' : 'bg-gray-800 text-gray-400 border-gray-950 shadow-md hover:bg-gray-700'}`}><Zap size={14} className="md:w-[18px] md:h-[18px]" fill={turboMode ? "currentColor" : "none"}/></button>
                                <button onClick={toggleAutoPlay} className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border-b-[3px] md:border-b-4 flex items-center justify-center transition-all duration-300 active:translate-y-1 active:border-b-0 ${autoPlay ? 'bg-gradient-to-b from-green-500 to-green-700 text-white border-green-900 shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'bg-gray-800 text-gray-400 border-gray-950 shadow-md hover:bg-gray-700'}`}>
                                    {autoPlay ? <Repeat size={14} className="md:w-[18px] md:h-[18px] animate-spin-slow" /> : <Repeat size={14} className="md:w-[18px] md:h-[18px]" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* COIN VFX */}
            {coinParticles.map(c => (
                <div key={c.id} className="absolute top-[-20px] animate-fall z-50 pointer-events-none" style={{ left: `${c.left}%`, animationDuration: '2.5s', animationDelay: `${c.delay}s`, transform: `scale(${c.scale}) rotate(${c.rotation}deg)` }}>
                    <div className="w-4 h-4 md:w-6 md:h-6 bg-yellow-400 rounded-full border-2 border-yellow-200 shadow-lg flex items-center justify-center font-black text-yellow-700 text-[8px] md:text-xs">
                        <span className="text-yellow-800 font-bold">$</span>
                    </div>
                </div>
            ))}

            {/* --- MODALS --- */}
            <AnimatePresence>
                {showPaytable && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 pointer-events-auto" onClick={() => setShowPaytable(false)}>
                        <GlassCard className="w-full max-w-sm p-0 overflow-hidden border-cyan-500/50 shadow-[0_0_40px_rgba(0,243,255,0.2)]" onClick={e => e.stopPropagation()}>
                            <div className="bg-gradient-to-r from-cyan-900 to-blue-900 p-4 flex justify-between items-center border-b border-cyan-500/30">
                                <h3 className="text-white font-black text-lg flex items-center gap-2"><HelpCircle size={18}/> PAYTABLE</h3>
                                <button onClick={() => setShowPaytable(false)} className="text-white/70 hover:text-white transition-colors"><X size={20}/></button>
                            </div>
                            <div className="p-4 bg-black/80 space-y-2">
                                {PAYTABLE_DATA.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
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
                    <motion.div initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} animate={{ opacity: 1, backdropFilter: 'blur(10px)' }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                        {(winTier === 'EPIC' || isJackpot) && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-30 mix-blend-color-dodge animate-pulse hue-rotate-90"></div>}
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: (winTier === 'EPIC' || isJackpot) ? 1.1 : 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }} className="relative z-10 flex flex-col items-center w-full max-w-sm">
                            <GlassCard className={`w-full p-6 md:p-10 text-center flex flex-col items-center border-t-8 border-b-8 ${isJackpot ? 'border-yellow-400 shadow-[0_0_150px_rgba(255,215,0,0.4)] bg-black/90' : (winDetails?.color?.replace('text-', 'border-') || 'border-cyan-400')} ${winDetails?.glow} ${winTier === 'EPIC' ? 'shadow-[0_0_100px_rgba(255,215,0,0.6)] bg-black/90' : 'bg-black/80'}`}>
                                {isJackpot ? <h1 className="text-4xl md:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-orange-500 to-red-600 drop-shadow-2xl mb-4 animate-pulse leading-none">GRAND<br/>JACKPOT</h1> : 
                                 winTier === 'EPIC' ? <h1 className="text-5xl md:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-purple-200 to-pink-600 drop-shadow-2xl mb-4 animate-pulse">EPIC WIN</h1> : 
                                 winTier === 'MEGA' ? <h1 className="text-4xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 to-blue-600 drop-shadow-lg mb-4">MEGA WIN</h1> : null}
                                <motion.div animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.15, 1] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }} className="w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-6">
                                    <SymbolSVG id={winDetails.id} islandId={parseInt(island?.id || 1)} isWinning={true} />
                                </motion.div>
                                <h2 className={`text-2xl md:text-4xl font-black italic tracking-tighter uppercase drop-shadow-2xl ${winDetails?.color}`}>{winDetails?.name}</h2>
                                <div className="text-4xl md:text-6xl font-mono font-black text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.8)] mt-4 md:mt-6 bg-white/10 px-4 md:px-8 py-2 md:py-3 rounded-2xl border border-white/20 backdrop-blur-md">
                                    +<RollupNumber value={lastWin} duration={winTier === 'EPIC' ? 2500 : 1500} />
                                </div>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showBonusSummary && (
                    <motion.div initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} animate={{ opacity: 1, backdropFilter: 'blur(10px)' }} className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
                        <GlassCard className="w-full max-w-sm p-6 sm:p-8 text-center border-yellow-500/50 shadow-[0_0_80px_rgba(234,179,8,0.3)] bg-black/90">
                            <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-500 mx-auto mb-4 sm:mb-6 animate-[bounce-slow_3s_infinite] drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]" />
                            <h3 className="text-gray-400 font-bold text-xs sm:text-sm mb-1 uppercase tracking-widest">Bonus Complete</h3>
                            <h2 className="text-3xl sm:text-4xl font-black text-white italic mb-4 sm:mb-6 drop-shadow-md">TOTAL GET</h2>
                            <div className="text-4xl sm:text-6xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 mb-6 sm:mb-8 border-y border-white/10 py-4 sm:py-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                                +<RollupNumber value={bonusTotalWin} duration={2000} />
                            </div>
                            <button onClick={() => { playSound('click'); clearBonusTotal(); }} className="w-full py-3 sm:py-4 bg-white text-black font-black text-base sm:text-lg rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">CONTINUE</button>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default PlayView;