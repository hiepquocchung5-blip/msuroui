import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
    Minus, Plus, Zap, StopCircle, Gamepad2, 
    Trophy, Flame, MessageCircle, TrendingUp, 
    ShieldAlert, X, Coins, Repeat, Target, Activity, Cpu, MapPin, 
    HelpCircle, AlertOctagon, Settings, LogOut, Menu, Heart, Clock, LifeBuoy, Sparkles
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
    { id: 1, name: 'GRAND JACKPOT', mult: 'MEGA', color: 'text-red-500', glow: 'shadow-[0_0_50px_red]' },
    { id: 2, name: 'CHARACTER', mult: 20, color: 'text-purple-400', glow: 'shadow-[0_0_30px_purple]' },
    { id: 3, name: 'BAR', mult: 10, color: 'text-orange-400', glow: 'shadow-[0_0_30px_orange]' },
    { id: 4, name: 'BELL', mult: 10, color: 'text-yellow-200', glow: 'shadow-[0_0_20px_yellow]' },
    { id: 5, name: 'MELON', mult: 15, color: 'text-green-400', glow: 'shadow-[0_0_20px_green]' },
    { id: 6, name: 'CHERRY', mult: 2, color: 'text-pink-400', glow: 'shadow-[0_0_15px_pink]' },
    { id: 7, name: 'REPLAY', mult: 'FREE SPIN', color: 'text-cyan-400', glow: 'shadow-[0_0_15px_cyan]' }
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

const ReelColumn = ({ isSpinning, finalSymbols, locked, isWinning, isTeaser, isReachEye, colIdx, isFreeze, islandId, isReady }) => {
    const spinStrip = useMemo(() => {
        const randomFill = Array.from({length: 3}, () => Math.floor(Math.random() * 7) + 1);
        return [...finalSymbols, ...randomFill];
    }, [isSpinning, finalSymbols]);

    const displaySymbols = isSpinning ? spinStrip : finalSymbols;
    const isReachReel = isReachEye && isSpinning && colIdx === 2;

    return (
        <div className={`flex-1 flex flex-col relative h-full bg-gradient-to-b from-[#0f1115] via-[#1c1f26] to-[#0f1115] border-x border-white/10 rounded-md overflow-hidden transition-all duration-500 will-change-transform
            ${locked ? 'border-2 border-yellow-400' : ''}
            ${isReachReel ? 'ring-4 ring-red-500 shadow-[inset_0_0_80px_rgba(239,68,68,0.5)] animate-pulse saturate-150' : ''}
        `} style={{ transform: 'translateZ(0)' }}>
            
            <style dangerouslySetInnerHTML={{__html: `@keyframes scanline { 0% { top: -10%; } 100% { top: 110%; } }`}} />

            <div className="absolute inset-0 overflow-hidden" style={{ perspective: '1000px' }}>
                <div 
                    className={`w-full absolute flex flex-col justify-between will-change-transform
                        ${isSpinning ? (isReachReel ? 'animate-[reel-spin-fast_0.3s_linear_infinite]' : 'animate-[reel-spin-fast_0.1s_linear_infinite]') : 'animate-[snap-bounce-soft_0.4s_cubic-bezier(0.2,0.8,0.2,1)_forwards]'} 
                        ${isFreeze ? 'brightness-50 grayscale' : ''}
                        ${isSpinning ? 'blur-[2px]' : 'blur-0'} 
                    `} 
                    style={{ height: isSpinning ? '200%' : '100%', top: 0 }}
                >
                    {displaySymbols.map((symId, idx) => (
                        <div key={idx} className="relative flex items-center justify-center w-full" style={{ height: isSpinning ? '16.66%' : '33.33%' }}>
                            <div className={`w-[90%] aspect-[16/9] flex items-center justify-center bg-black/40 backdrop-blur-[2px] border border-white/10 rounded-lg shadow-inner transition-colors duration-500
                                ${isTeaser && !isReachEye && !isSpinning && idx === 1 && colIdx === 1 ? 'ring-2 ring-red-500/50 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_40px_rgba(239,68,68,0.6)] bg-red-900/20' : ''}
                                ${isWinning && !isSpinning && idx < 3 ? 'z-10 shadow-[0_0_40px_rgba(255,215,0,0.4)] bg-yellow-900/20 ring-1 ring-yellow-400/80 scale-105' : ''}
                            `}>
                                {isReady && <SymbolSVG id={symId} isWinning={isWinning && !isSpinning && idx < 3} islandId={islandId} />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {isReachReel && <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 to-transparent mix-blend-overlay animate-[pulse_0.5s_ease-in-out_infinite] z-30 pointer-events-none"></div>}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 z-20 pointer-events-none shadow-[inset_0_15px_15px_-10px_rgba(0,0,0,0.6),inset_0_-15px_15px_-10px_rgba(0,0,0,0.6)]"></div>
        </div>
    );
};

const SectorLoader = ({ progress, islandName }) => (
    <motion.div 
        initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "easeInOut" }}
        className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center font-mono"
    >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 mix-blend-color-dodge animate-pulse pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">
            <div className="w-24 h-24 relative flex items-center justify-center mb-8">
                <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-500 animate-spin shadow-[0_0_20px_cyan]"></div>
                <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-purple-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
                <div className="absolute inset-4 rounded-full border-t-2 border-l-2 border-white/20 animate-spin-slow"></div>
                <Cpu size={32} className="text-cyan-400 animate-[pulse_2s_ease-in-out_infinite] drop-shadow-[0_0_15px_cyan]" />
            </div>
            
            <h2 className="text-2xl font-black italic tracking-[0.3em] text-white mb-2 uppercase drop-shadow-md">
                MOUNTING SECTOR
            </h2>
            <div className="text-cyan-400 font-bold tracking-widest text-sm mb-8 uppercase px-4 py-1 border border-cyan-500/30 bg-cyan-900/20 rounded shadow-inner">
                [{islandName}]
            </div>
            
            <div className="w-full bg-gray-900 rounded-sm border border-cyan-500/20 p-1 mb-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-500/10 animate-pulse pointer-events-none"></div>
                <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-300 ease-out shadow-[0_0_15px_cyan]" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-[10px] text-gray-400 tracking-widest uppercase flex justify-between w-full">
                <span>Fetching Crypto Vectors...</span>
                <span className="text-cyan-400 font-bold">{progress}%</span>
            </div>
        </div>
    </motion.div>
);

const PlayView = ({ machine, island, onLeave }) => {
    const router = useRouter();
    const { user } = useAuth();
    const { addToast } = useToast();
    const { playSound } = useGameSound();
    
    const slotLogic = useSlotMachine(machine?.id, island?.id, machine?.session_token);
    
    // --- ZERO LATENCY ASSET PRELOADER ---
    const { progress: assetProgress, isReady: assetsReady } = useSpinLoader(island?.id, user?.active_pet_id || island?.hostess_char_id);

    const { 
        reels, winningLines, isSpinning, isTeaser, isReachEye, isFreeze, lastWin, winTier, sessionWinStreak, momentumMult, inZone, volatility,
        freeSpins, bonusMode, bonusSpinsLeft,
        showBonusSummary, bonusTotalWin, clearBonusTotal, levelUpData, 
        isJackpot, lapsSinceBonus, error, 
        showIdleWarning, isIdleKicked, resetIdleTimer, isReady: sessionReady,
        autoPlay, spin, setAutoPlay, setLastWin, turboMode, setTurboMode
    } = slotLogic;
    
    const [sessionMinutes, setSessionMinutes] = useState(0);
    const [betIndex, setBetIndex] = useState(0);
    const [winStage, setWinStage] = useState('idle');
    const [charInteraction, setCharInteraction] = useState(null);
    const [coinParticles, setCoinParticles] = useState([]); 
    const [showPaytable, setShowPaytable] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    
    // Smoothed Parallax State
    const [targetMousePos, setTargetMousePos] = useState({ x: 0, y: 0 });
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);
    const [currentJackpot, setCurrentJackpot] = useState(3000000);

    const activeBetAmounts = useMemo(() => ISLAND_BET_AMOUNTS[island?.id] || ISLAND_BET_AMOUNTS.default, [island?.id]);
    
    useEffect(() => {
        if (betIndex >= activeBetAmounts.length) setBetIndex(activeBetAmounts.length - 1);
    }, [activeBetAmounts, betIndex]);

    const currentBet = activeBetAmounts[betIndex] || activeBetAmounts[0];
    const isProcessing = useRef(false);
    const winHandled = useRef(false); 
    const winTimeoutRef = useRef(null);
    const animationFrameRef = useRef(null);
    
    const isCurrentlySpinning = isSpinning.some(s => s);
    const isReachWaitState = isReachEye && isCurrentlySpinning && !isSpinning[0] && !isSpinning[1] && isSpinning[2];

    const MACHINES_PER_FLOOR = 90;
    const currentFloor = Math.ceil((machine?.machine_number || 1) / MACHINES_PER_FLOOR);
    const relativeNum = (((machine?.machine_number || 1) - 1) % MACHINES_PER_FLOOR) + 1;
    const displayId = `${currentFloor}-${relativeNum.toString().padStart(2, '0')}`;

    useEffect(() => {
        const sessionTimer = setInterval(() => { setSessionMinutes(prev => prev + 1); }, 60000);
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => { window.removeEventListener('resize', checkMobile); clearInterval(sessionTimer); };
    }, []);

    // --- SMOOTH PARALLAX LERPING ---
    useEffect(() => {
        const lerp = (start, end, factor) => start + (end - start) * factor;
        const renderLoop = () => {
            setMousePos(prev => ({
                x: lerp(prev.x, targetMousePos.x, 0.05), // Heavy dampening for smooth feel
                y: lerp(prev.y, targetMousePos.y, 0.05)
            }));
            animationFrameRef.current = requestAnimationFrame(renderLoop);
        };
        renderLoop();
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [targetMousePos]);

    useEffect(() => {
        if (!assetsReady) return;
        const handleOrientation = (e) => {
            if (!e.gamma || !e.beta) return;
            const x = Math.min(Math.max(e.gamma / 4, -12), 12); 
            const y = Math.min(Math.max((e.beta - 45) / 4, -12), 12);
            setTargetMousePos({ x, y: -y }); 
        };
        if (isMobile && typeof window !== 'undefined' && window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation);
        }
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [isMobile, assetsReady]);

    const handlePointerMove = useCallback((e) => {
        if(resetIdleTimer) resetIdleTimer();
        if (!isMobile && typeof window !== 'undefined') {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const x = ((clientX / innerWidth) - 0.5) * 8; // Max 4 deg rotation
            const y = ((clientY / innerHeight) - 0.5) * -8;
            setTargetMousePos({ x, y });
        }
    }, [resetIdleTimer, isMobile]);

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

    useEffect(() => { if (isFreeze) { playSound('bigwin'); } }, [isFreeze, playSound]);

    useEffect(() => {
        if (isReachWaitState) setCharInteraction("🔥 GEKIATSU! REACH!");
        else if (inZone && isCurrentlySpinning) setCharInteraction("⚠️ ZONE ACTIVE!");
        else if (sessionWinStreak >= 3 && !isCurrentlySpinning) setCharInteraction(`🔥 COMBO x${sessionWinStreak}!`);
        else if (momentumMult > 1.2 && !isCurrentlySpinning) setCharInteraction(`Momentum x${momentumMult.toFixed(1)}!`);
        else setCharInteraction(null);
    }, [isReachWaitState, inZone, momentumMult, sessionWinStreak, isCurrentlySpinning]);

    useEffect(() => {
        if (levelUpData && levelUpData.length > 0) { 
            playSound('bigwin'); triggerCoinShower(80, true); 
        }
    }, [levelUpData, playSound]);

    useEffect(() => {
        if (lastWin > 0 && winStage === 'idle' && !winHandled.current && !isCurrentlySpinning) {
            winHandled.current = true; 
            const isBigWin = winTier === 'BIG' || winTier === 'MEGA' || winTier === 'EPIC' || isJackpot;
            playSound(isBigWin ? 'bigwin' : 'win');
            if (isBigWin) triggerCoinShower(isJackpot ? 150 : (winTier === 'EPIC' ? 100 : 50), isJackpot || winTier === 'EPIC');

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
    }, [lastWin, autoPlay, playSound, bonusMode, winStage, isCurrentlySpinning, winTier, isJackpot, setLastWin]);

    // --- AAA PARTICLE ENGINE ---
    const triggerCoinShower = useCallback((amount = 40, isPremium = false) => {
        const newParticles = Array.from({length: amount}).map((_, i) => {
            const isGold = Math.random() > 0.3;
            const isNeon = Math.random() > 0.9;
            return {
                id: Date.now() + i, 
                left: Math.random() * 100, 
                delay: Math.random() * 1.5,
                duration: 2 + Math.random() * 2,
                scale: 0.4 + Math.random() * 0.8, 
                rotationSpeed: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720),
                type: isPremium && isNeon ? 'neon' : (isGold ? 'gold' : 'silver')
            };
        });
        setCoinParticles(newParticles);
        setTimeout(() => setCoinParticles([]), 4000);
    }, []);

    const handleSkipWin = () => {
        if (winStage === 'celebrating') {
            playSound('click');
            if (winTimeoutRef.current) clearTimeout(winTimeoutRef.current);
            setWinStage('idle');
            setLastWin(0);
        }
    };

    // --- ZERO-LATENCY SPIN ENGINE ---
    const handleSpin = useCallback(async () => {
        if (!assetsReady || !sessionReady || isProcessing.current || isCurrentlySpinning || winStage !== 'idle' || isFreeze || (levelUpData && levelUpData.length > 0)) return; 
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
        
        // Pipelined Request
        await spin(currentBet);
        
    }, [user, currentBet, winStage, playSound, spin, freeSpins, bonusMode, isCurrentlySpinning, isFreeze, levelUpData, addToast, sessionReady, assetsReady, setAutoPlay]);

    const toggleAutoPlay = () => {
        playSound('click');
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

            <div 
                className={`min-h-[100dvh] bg-[#050505] relative flex flex-col overflow-hidden transition-colors duration-1000 ${bonusMode === 'HEAVEN' ? 'bg-purple-950' : (bonusMode ? 'bg-red-950' : '')}`}
                onPointerMove={handlePointerMove} 
                onPointerDown={resetIdleTimer}
            >
                {/* AAA KEYFRAMES */}
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes reel-spin-fast { 0% { transform: translateY(-50%); } 100% { transform: translateY(0%); } }
                    @keyframes snap-bounce-soft { 0% { transform: translateY(-5%); } 40% { transform: translateY(2%); } 75% { transform: translateY(-1%); } 100% { transform: translateY(0%); } }
                    @keyframes glitch-anim-1 { 0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 2px); } 20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -2px); } 40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, -2px); } 60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, 2px); } 80% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 1px); } 100% { clip-path: inset(30% 0 50% 0); transform: translate(1px, -1px); } }
                    @keyframes glitch-anim-2 { 0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -2px); } 20% { clip-path: inset(30% 0 20% 0); transform: translate(-2px, 2px); } 40% { clip-path: inset(70% 0 10% 0); transform: translate(2px, 2px); } 60% { clip-path: inset(20% 0 50% 0); transform: translate(-2px, -2px); } 80% { clip-path: inset(50% 0 30% 0); transform: translate(1px, -1px); } 100% { clip-path: inset(5% 0 80% 0); transform: translate(-1px, 1px); } }
                    .glitch-effect { position: relative; }
                    .glitch-effect::before, .glitch-effect::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: transparent; }
                    .glitch-effect::before { left: 2px; text-shadow: -2px 0 red; animation: glitch-anim-1 0.3s infinite linear alternate-reverse; }
                    .glitch-effect::after { left: -2px; text-shadow: -2px 0 blue; animation: glitch-anim-2 0.3s infinite linear alternate-reverse; }
                    .sunburst { background: conic-gradient(from 0deg, transparent 0deg 15deg, rgba(255,215,0,0.3) 15deg 30deg, transparent 30deg 45deg, rgba(255,215,0,0.3) 45deg 60deg, transparent 60deg 75deg, rgba(255,215,0,0.3) 75deg 90deg, transparent 90deg 105deg, rgba(255,215,0,0.3) 105deg 120deg, transparent 120deg 135deg, rgba(255,215,0,0.3) 135deg 150deg, transparent 150deg 165deg, rgba(255,215,0,0.3) 165deg 180deg, transparent 180deg 195deg, rgba(255,215,0,0.3) 195deg 210deg, transparent 210deg 225deg, rgba(255,215,0,0.3) 225deg 240deg, transparent 240deg 255deg, rgba(255,215,0,0.3) 255deg 270deg, transparent 270deg 285deg, rgba(255,215,0,0.3) 285deg 300deg, transparent 300deg 315deg, rgba(255,215,0,0.3) 315deg 330deg, transparent 330deg 345deg, rgba(255,215,0,0.3) 345deg 360deg); animation: spin 20s linear infinite; mask-image: radial-gradient(circle, black 20%, transparent 70%); -webkit-mask-image: radial-gradient(circle, black 20%, transparent 70%); }
                `}} />

                {/* --- CINEMATIC OVERLAYS --- */}
                <AnimatePresence>
                    {assetsReady && (
                        <>
                            <motion.div initial={{ height: "50vh" }} animate={{ height: "0vh" }} transition={{ duration: 1, ease: "circInOut" }} className="fixed top-0 left-0 w-full bg-black z-[200] pointer-events-none shadow-[0_10px_20px_rgba(0,0,0,0.8)]" />
                            <motion.div initial={{ height: "50vh" }} animate={{ height: "0vh" }} transition={{ duration: 1, ease: "circInOut" }} className="fixed bottom-0 left-0 w-full bg-black z-[200] pointer-events-none shadow-[0_-10px_20px_rgba(0,0,0,0.8)]" />
                        </>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {(isJackpot || winTier === 'EPIC' || winTier === 'MEGA' || isFreeze) && (
                        <motion.div 
                            initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] pointer-events-none z-0 flex justify-around items-end"
                            style={{ transformOrigin: 'bottom center', transform: 'translateZ(-50px)' }}
                        >
                            <div className="relative w-32 h-full flex flex-col justify-end items-center origin-bottom -rotate-[25deg]">
                                <div className="w-full h-[80%] bg-gradient-to-t from-cyan-300/40 via-cyan-500/10 to-transparent blur-2xl"></div>
                                <div className="w-8 h-4 bg-white rounded-full shadow-[0_0_30px_#fff,0_0_60px_#00f3ff]"></div>
                            </div>
                            <div className="relative w-48 h-full flex flex-col justify-end items-center origin-bottom">
                                <div className="w-full h-[90%] bg-gradient-to-t from-white/50 via-yellow-200/20 to-transparent blur-3xl"></div>
                                <div className="w-12 h-6 bg-white rounded-full shadow-[0_0_40px_#fff,0_0_80px_#eab308]"></div>
                            </div>
                            <div className="relative w-32 h-full flex flex-col justify-end items-center origin-bottom rotate-[25deg]">
                                <div className="w-full h-[80%] bg-gradient-to-t from-purple-300/40 via-purple-500/10 to-transparent blur-2xl"></div>
                                <div className="w-8 h-4 bg-white rounded-full shadow-[0_0_30px_#fff,0_0_60px_#a855f7]"></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isFreeze && isCurrentlySpinning && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm pointer-events-none flex flex-col items-center justify-center overflow-hidden"
                        >
                            {/* CRT Scanline Overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px] z-10 mix-blend-overlay pointer-events-none"></div>
                            
                            <h1 data-text="SYSTEM FREEZE" className="glitch-effect text-white text-5xl md:text-8xl font-black italic tracking-widest relative drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] z-20">
                                SYSTEM FREEZE
                            </h1>
                            <p className="text-cyan-400 mt-4 font-mono tracking-[0.5em] text-xs md:text-base animate-pulse z-20 bg-black/50 px-4 py-1 border border-cyan-500/50">FATAL KERNEL PANIC // REBOOTING...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isReachWaitState && !isFreeze && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} 
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="fixed inset-0 z-40 pointer-events-none flex flex-col items-center justify-center mix-blend-screen"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent"></div>
                            <h1 className="text-red-500 text-7xl md:text-[10rem] font-black italic drop-shadow-[0_0_80px_red] animate-pulse" style={{ fontFamily: 'Impact, sans-serif' }}>
                                激熱
                            </h1>
                        </motion.div>
                    )}
                </AnimatePresence>

                {assetsReady && (
                    <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isCurrentlySpinning ? 'opacity-40' : 'opacity-100'}`}>
                        <div className={`absolute inset-0 scale-110 blur-[1px] opacity-60 transition-all duration-1000 ${isReachWaitState ? 'grayscale-[30%] sepia-[50%] hue-rotate-[-20deg] scale-125' : ''}`}>
                            <IslandLandscapeSVG islandId={island?.id} />
                        </div>
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black opacity-90"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                        {inZone && <div className="absolute inset-0 bg-yellow-500/10 mix-blend-overlay animate-[pulse_2s_ease-in-out_infinite]"></div>}
                        {bonusMode === 'HEAVEN' && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-40 mix-blend-color-dodge animate-[pulse_4s_ease-in-out_infinite] hue-rotate-180"></div>}
                    </div>
                )}

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
                            <div className="text-[8px] md:text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_red]">HOT</div>
                        ) : (
                            <div className="text-[8px] md:text-[10px] text-gray-500 font-bold px-1.5 py-0.5 uppercase tracking-widest">BUILDING</div>
                        )}
                    </div>
                    <div className={`absolute bottom-0 left-0 h-[2px] transition-all duration-500 shadow-[0_0_8px_currentColor] ${currentJackpot >= 7000000 ? 'bg-purple-500 text-purple-500' : currentJackpot >= 3600000 ? 'bg-red-500 text-red-500' : 'bg-yellow-500 text-yellow-500'}`} style={{ width: `${jpProgressPercent}%` }} />
                </div>
                
                <div className="absolute top-16 md:top-20 left-0 w-full px-2 md:px-6 flex flex-row justify-between items-start z-40 pointer-events-none mt-1">
                    
                    <div className="flex flex-col gap-1 md:gap-2">
                        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSettings(true)} className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all backdrop-blur-md shadow-lg rounded-full">
                                <Menu size={16} className="md:w-5 md:h-5" />
                            </motion.button>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1 md:gap-2 text-cyan-400 mb-0.5 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                                    <MapPin size={10} className="md:w-3 md:h-3" />
                                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest bg-cyan-950/50 border border-cyan-500/30 px-1.5 py-0.5 rounded shadow-inner backdrop-blur-md">
                                        {island?.name || 'Kyoto Zen'} • FLR {currentFloor}
                                    </span>
                                </div>
                                <h2 className="text-white font-black text-sm md:text-2xl italic uppercase tracking-wider leading-none drop-shadow-md truncate flex items-center gap-1 md:gap-2">
                                    <Cpu size={14} className="md:w-5 md:h-5 text-cyan-500"/> UNIT #{displayId}
                                </h2>
                            </div>
                        </div>
                        
                        <div className={`pointer-events-auto w-fit bg-black/80 border rounded-lg md:rounded-xl p-1 md:p-2 px-2 md:px-3 flex items-center gap-1 md:gap-3 backdrop-blur-md shadow-lg transition-colors duration-500 mt-1 ${momentumMult > 1.5 ? 'border-purple-500 shadow-[0_0_15px_purple]' : 'border-cyan-500/30'}`}>
                            {sessionWinStreak > 2 ? (
                                <Flame size={12} className="md:w-4 md:h-4 text-orange-500 animate-pulse fill-orange-500" />
                            ) : (
                                <TrendingUp size={12} className={`md:w-4 md:h-4 ${momentumMult > 1.5 ? 'text-purple-400 animate-pulse' : 'text-cyan-400'}`} />
                            )}
                            <div>
                                <div className={`text-[6px] md:text-[8px] font-bold uppercase tracking-wider ${sessionWinStreak > 2 ? 'text-orange-500' : (momentumMult > 1.5 ? 'text-purple-500' : 'text-cyan-500')}`}>
                                    {sessionWinStreak > 2 ? 'WIN STREAK' : 'Momentum'}
                                </div>
                                <div className="text-[10px] md:text-sm font-mono font-black text-white leading-none mt-0.5">
                                    {sessionWinStreak > 2 ? `x${sessionWinStreak}` : `x${momentumMult.toFixed(1)}`}
                                </div>
                            </div>
                        </div>

                        <div className="pointer-events-auto mt-0.5 md:mt-1 flex items-center gap-2">
                            <div className="flex items-center gap-1 px-1.5 py-1 bg-black/60 rounded border border-white/5 w-fit shadow-sm backdrop-blur-md">
                                 <AlertOctagon size={8} className={`md:w-3 md:h-3 ${volatility === 'extreme' || volatility === 'high' ? 'text-red-500' : 'text-gray-400'}`} />
                                 <span className="text-[6px] md:text-[8px] text-gray-400 uppercase tracking-widest hidden md:inline">VOLATILITY:</span>
                                 <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-widest ${volatility === 'extreme' ? 'text-red-500' : volatility === 'high' ? 'text-orange-500' : volatility === 'low' ? 'text-green-400' : 'text-cyan-400'}`}>{volatility}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 md:gap-2">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pointer-events-auto bg-black/80 border border-yellow-500/50 rounded-full px-2 md:px-4 py-1 md:py-2 flex items-center gap-1 md:gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(234,179,8,0.25)] cursor-pointer hover:border-yellow-400 transition-all duration-300 group" onClick={() => router.push('/wallet')}>
                            <Coins size={12} className="text-yellow-400 md:w-4 md:h-4 group-hover:animate-spin-slow" />
                            <span className="text-white font-mono font-black text-sm sm:text-base tracking-tight drop-shadow-md"><RollupNumber value={user?.balance || 0} /></span>
                        </motion.div>

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
                                    <div className={`text-[10px] md:text-sm font-mono font-black leading-none mt-0.5 ${isOverheating ? 'text-orange-400 animate-pulse drop-shadow-[0_0_5px_orange]' : 'text-cyan-400'}`}>
                                        {isOverheating ? 'OVERHEATING' : 'GATHERING'}
                                    </div>
                                </div>
                                <Activity size={12} className={`md:w-4 md:h-4 ${isOverheating ? 'text-orange-400' : 'text-cyan-400'}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MAIN GAME STAGE --- */}
                <div className="flex-1 flex items-center justify-center relative z-10 px-2 pt-28 pb-12 md:pb-6 will-change-transform" style={{ perspective: isMobile ? '800px' : '1200px', transform: 'translateZ(0)' }}>
                    
                    {/* DYNAMIC CHARACTER LAYER */}
                    {assetsReady && (
                        <div 
                            className={`absolute pointer-events-none drop-shadow-2xl transition-all duration-700 ease-in-out z-0 md:z-20 will-change-transform
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
                    )}

                    <motion.div 
                        className="relative w-full max-w-[350px] md:max-w-[400px] aspect-[0.6] flex items-center justify-center z-10 will-change-transform"
                        animate={{ rotateX: mousePos.y, rotateY: mousePos.x }}
                        transition={{ type: 'spring', stiffness: isMobile ? 80 : 100, damping: 25 }}
                        style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0)' }}
                    >
                        {/* Cabinet Graphic */}
                        <div className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_40px_50px_rgba(0,0,0,0.9)]" style={{ transform: 'translateZ(-10px)' }}>
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
                        <div className="absolute top-[21.25%] left-[16.67%] w-[66.67%] h-[28.75%] flex flex-col pointer-events-none will-change-transform" style={{ transform: 'translateZ(5px)' }}>
                            <div className={`h-[15%] flex items-center justify-between px-2 md:px-3 bg-black/90 border-b border-white/5 ${inZone && !bonusMode ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] bg-yellow-900/30' : ''}`}>
                                <span className={`text-[8px] md:text-[10px] font-black tracking-widest uppercase ${isReachWaitState ? 'text-red-500 animate-pulse' : (inZone ? 'text-yellow-400 animate-pulse' : 'text-cyan-400')}`}>
                                    {isReachWaitState ? "!!! GEKIATSU !!!" : (inZone ? "★ ZONE ACTIVE ★" : (bonusMode ? "BONUS RUSH" : "LUCKY SLOT"))}
                                </span>
                                {bonusMode && <span className="text-[8px] md:text-[10px] font-mono font-bold text-yellow-400 animate-pulse drop-shadow-[0_0_5px_gold]">LEFT: {bonusSpinsLeft}</span>}
                            </div>

                            <div className={`flex-1 flex gap-[1%] p-[1%] bg-[#050505] rounded-b-sm border-x-2 border-b-2 relative ${isReachWaitState ? 'border-red-600 shadow-[inset_0_0_40px_rgba(239,68,68,0.3)]' : (inZone && !bonusMode ? 'border-yellow-500/50 shadow-[inset_0_0_40px_rgba(234,179,8,0.15)]' : 'border-gray-900')}`}>
                                
                                {[0, 1, 2].map(colIdx => (
                                    <ReelColumn 
                                        key={colIdx} 
                                        colIdx={colIdx}
                                        isSpinning={isSpinning[colIdx]} 
                                        finalSymbols={[reels[colIdx], reels[colIdx + 3], reels[colIdx + 6]]} 
                                        islandId={island?.id} 
                                        isWinning={winningLines.length > 0 && winningLines.some(lId => [0,1,2,3,4].includes(lId) || (lId === 99 && colIdx === 0))} 
                                        isTeaser={isTeaser} 
                                        isReachEye={isReachEye}
                                        isFreeze={isFreeze} 
                                        isReady={assetsReady && sessionReady}
                                    />
                                ))}

                                {/* Solid Red Win Lines */}
                                {winningLines.length > 0 && winStage !== 'gambling' && !isJackpot && (
                                    <div className="absolute inset-0 pointer-events-none z-40">
                                        {winningLines.map(lineIdx => {
                                            if (lineIdx === 99) return null; 
                                            const lineStyles = {
                                                0: "top-[16.66%] left-0 w-full h-2 -translate-y-1/2",
                                                1: "top-[50%] left-0 w-full h-2 -translate-y-1/2",
                                                2: "top-[83.33%] left-0 w-full h-2 -translate-y-1/2",
                                                3: "top-[50%] left-[-10%] w-[120%] h-2 -translate-y-1/2 rotate-[35deg]",
                                                4: "top-[50%] left-[-10%] w-[120%] h-2 -translate-y-1/2 -rotate-[35deg]"
                                            };
                                            return (
                                                <motion.div 
                                                    key={lineIdx} 
                                                    initial={{ scaleX: 0 }} 
                                                    animate={{ scaleX: 1 }} 
                                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                                    className={`absolute bg-red-600 shadow-[0_0_15px_red,0_0_5px_white_inset] origin-center z-50 ${lineStyles[lineIdx]}`}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- DYNAMIC CONTROL DECK (AAA Refinement) --- */}
                        <div className="absolute top-[57.5%] left-[5%] w-[90%] h-[15%] pointer-events-auto" style={{ perspective: '800px', transform: 'translateZ(40px)' }}>
                            <div className="w-full h-full relative flex items-center justify-center" style={{ transform: 'rotateX(25deg)', transformOrigin: 'top center' }}>
                                
                                {/* Left Controls: Bet Adjust */}
                                <div className={`absolute left-[5%] top-[10%] flex flex-col md:flex-row items-center gap-1 bg-black/60 p-1.5 rounded-lg border border-white/10 shadow-inner backdrop-blur-md transition-opacity duration-300 ${isCurrentlySpinning ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                    <div className="flex items-center gap-1 w-full justify-between">
                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }} onClick={() => { playSound('click'); setBetIndex(Math.max(0, betIndex - 1))}} className="w-8 h-8 bg-gradient-to-b from-gray-700 to-gray-900 border border-gray-600 rounded flex items-center justify-center text-white shadow-md hover:bg-gray-700 transition-colors"><Minus size={14}/></motion.button>
                                        <div className="w-16 text-center font-mono font-black text-yellow-400 text-xs drop-shadow-[0_0_5px_rgba(234,179,8,0.5)] leading-none">{currentBet.toLocaleString()}</div>
                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }} onClick={() => { playSound('click'); setBetIndex(Math.min(activeBetAmounts.length - 1, betIndex + 1))}} className="w-8 h-8 bg-gradient-to-b from-gray-700 to-gray-900 border border-gray-600 rounded flex items-center justify-center text-white shadow-md hover:bg-gray-700 transition-colors"><Plus size={14}/></motion.button>
                                    </div>
                                </div>

                                {/* Center Controls: Primary Spin Action (Magnetic Glow) */}
                                <div className="absolute left-1/2 -translate-x-1/2 top-[5%] md:top-[10%] z-40">
                                    {autoPlay && !isCurrentlySpinning && (
                                        <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-green-500 animate-[spin_4s_linear_infinite] pointer-events-none scale-110"></div>
                                    )}
                                    <motion.button 
                                        whileHover={!isCurrentlySpinning && assetsReady && sessionReady && winStage === 'idle' ? { scale: 1.05 } : {}}
                                        whileTap={!isCurrentlySpinning && assetsReady && sessionReady && winStage === 'idle' ? { y: 4, scale: 0.95 } : {}}
                                        onClick={handleSpin} 
                                        disabled={!assetsReady || !sessionReady || (isProcessing.current && !isCurrentlySpinning) || isFreeze || winStage !== 'idle' || isCurrentlySpinning} 
                                        className={`w-20 h-20 rounded-full border-b-[6px] md:border-b-[8px] flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden group
                                        ${(!assetsReady || !sessionReady) || (isProcessing.current && !isCurrentlySpinning) ? 'bg-gray-800 border-gray-950 opacity-50 shadow-inner' : 
                                          isCurrentlySpinning ? 'bg-gradient-to-b from-red-600 to-red-900 border-red-950 text-white shadow-[0_0_30px_rgba(239,68,68,0.8)]' :
                                          'bg-gradient-to-b from-red-500 to-red-800 border-red-950 text-white hover:brightness-125 shadow-[0_10px_30px_rgba(239,68,68,0.5),inset_0_2px_10px_rgba(255,255,255,0.3)]'}`}
                                    >
                                        {!isCurrentlySpinning && assetsReady && sessionReady && (
                                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.4),_transparent)] pointer-events-none"></div>
                                        )}
                                        {turboMode && !isCurrentlySpinning && <Zap className="absolute -top-1 -right-1 md:-top-2 md:-right-2 text-yellow-400 fill-yellow-400 animate-pulse drop-shadow-[0_0_15px_rgba(234,179,8,1)] z-10" size={isMobile ? 16 : 20} />}
                                        <div className="relative z-10 flex flex-col items-center">
                                            {isCurrentlySpinning ? <Loader2 size={28} className="text-white/80 animate-spin mb-1 drop-shadow-md" /> : <Gamepad2 size={28} strokeWidth={2.5} className="text-white mb-1 drop-shadow-md group-hover:scale-110 transition-transform" />}
                                            <span className="text-[9px] font-black text-white tracking-widest uppercase drop-shadow-md leading-none">
                                                {!assetsReady || !sessionReady ? 'WAIT' : 'SPIN'}
                                            </span>
                                        </div>
                                    </motion.button>
                                </div>

                                {/* Right Controls: Auto / Turbo */}
                                <div className="absolute right-[5%] top-[15%] flex flex-col md:flex-row gap-2">
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ y: 2 }} onClick={() => { playSound('click'); setTurboMode(!turboMode)}} className={`w-10 h-10 rounded-lg border-b-[3px] flex items-center justify-center shadow-md transition-colors ${turboMode ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-black border-yellow-800 shadow-[0_0_20px_rgba(234,179,8,0.6)]' : 'bg-gradient-to-b from-gray-700 to-gray-900 text-gray-400 border-gray-950 hover:bg-gray-700'}`}><Zap size={14} className="md:w-[18px] md:h-[18px]" fill={turboMode ? "currentColor" : "none"}/></motion.button>
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ y: 2 }} onClick={toggleAutoPlay} className={`w-10 h-10 rounded-lg border-b-[3px] flex items-center justify-center shadow-md transition-colors ${autoPlay ? 'bg-gradient-to-b from-green-500 to-green-700 text-white border-green-900 shadow-[0_0_20px_rgba(34,197,94,0.6)]' : 'bg-gradient-to-b from-gray-700 to-gray-900 text-gray-400 border-gray-950 hover:bg-gray-700'}`}>
                                        <Repeat size={14} className={autoPlay ? "md:w-[18px] md:h-[18px] animate-spin-slow" : "md:w-[18px] md:h-[18px]"} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* DYNAMIC PARTICLE VFX */}
                {coinParticles.map(c => {
                    const colors = {
                        gold: 'bg-yellow-400 border-yellow-200 text-yellow-700 shadow-[0_0_15px_rgba(255,215,0,0.8)]',
                        silver: 'bg-gray-300 border-white text-gray-600 shadow-[0_0_10px_rgba(255,255,255,0.8)]',
                        neon: 'bg-cyan-400 border-cyan-200 text-cyan-900 shadow-[0_0_20px_rgba(0,243,255,0.9)]'
                    };
                    const colorClass = colors[c.type];

                    return (
                        <div key={c.id} className="absolute top-[-50px] animate-fall z-50 pointer-events-none" 
                             style={{ 
                                left: `${c.left}%`, 
                                animationDuration: `${c.duration}s`, 
                                animationDelay: `${c.delay}s`
                             }}>
                            <div 
                                className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center font-black text-xs md:text-sm ${colorClass}`}
                                style={{ transform: `scale(${c.scale}) rotate(${c.rotationSpeed}deg)`, transition: 'transform 2s linear' }}
                            >
                                {c.type === 'neon' ? <Sparkles size={12} fill="currentColor"/> : '$'}
                            </div>
                        </div>
                    );
                })}

                {/* --- PLAYER HUB SETTINGS --- */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 pointer-events-auto" onClick={() => setShowSettings(false)}>
                            <GlassCard className="w-full max-w-sm p-0 overflow-hidden border-white/20 shadow-2xl" onClick={e => e.stopPropagation()}>
                                <div className="bg-gradient-to-r from-gray-900 to-black p-4 flex justify-between items-center border-b border-white/10">
                                    <h3 className="text-white font-black text-lg flex items-center gap-2"><Settings size={18}/> PLAYER HUB</h3>
                                    <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white"><X size={20}/></button>
                                </div>
                                <div className="p-4 space-y-4 bg-black/60">
                                    <div className="bg-pink-900/20 p-3 rounded-xl border border-pink-500/30 flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3 text-pink-400 font-bold text-sm">
                                            <Clock size={16}/> Session Time
                                        </div>
                                        <span className="text-white font-mono text-sm">{sessionMinutes} mins</span>
                                    </div>
                                    <button onClick={() => alert("Our Support Team is always here for you! ❤️\n\nPlease reach out via Telegram/Viber for assistance.")} className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 text-white font-bold text-sm transition-colors mb-2">
                                        <span className="flex items-center gap-3"><LifeBuoy className="text-blue-400"/> 24/7 Player Support</span>
                                    </button>
                                    <button onClick={() => { setShowSettings(false); setShowPaytable(true); }} className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 text-white font-bold text-sm transition-colors">
                                        <span className="flex items-center gap-3"><HelpCircle className="text-yellow-400"/> View Paytable</span>
                                    </button>
                                    <button onClick={onLeave} className="w-full flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/50 border border-red-500/50 p-3 rounded-xl text-red-400 font-black text-sm transition-colors mt-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                        <LogOut size={18}/> SECURE LEAVE
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- PAYTABLE MODAL --- */}
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

                {/* --- CINEMATIC WIN CELEBRATION MODAL --- */}
                <AnimatePresence>
                    {winStage === 'celebrating' && winDetails && !bonusMode && (
                        <motion.div 
                            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} 
                            animate={{ opacity: 1, backdropFilter: 'blur(10px)' }} 
                            exit={{ opacity: 0 }} 
                            onClick={handleSkipWin}
                            className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-auto p-4 cursor-pointer overflow-hidden"
                        >
                            {/* Ambient Light Rays */}
                            <div className="absolute inset-0 sunburst opacity-30 mix-blend-screen pointer-events-none"></div>

                            {isJackpot && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-30 mix-blend-color-dodge animate-[pulse_0.5s_infinite] hue-rotate-90 pointer-events-none"></div>}
                            
                            <div className="absolute top-10 text-white/50 text-xs tracking-widest uppercase animate-[pulse_2s_ease-in-out_infinite] flex items-center gap-2 z-10">
                                Tap to skip <span className="animate-bounce">↓</span>
                            </div>

                            <motion.div initial={{ scale: 0.5, y: 100, rotateX: 45 }} animate={{ scale: (winTier === 'EPIC' || isJackpot) ? 1.15 : 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 150, damping: 15 } }} className="relative z-10 flex flex-col items-center w-full max-w-sm pointer-events-none transform-style-3d perspective-1000">
                                
                                {/* Shockwave Ring */}
                                <motion.div 
                                    initial={{ scale: 0, opacity: 1 }}
                                    animate={{ scale: 3, opacity: 0 }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`absolute inset-0 rounded-full border-[10px] z-0 ${isJackpot ? 'border-yellow-400' : 'border-cyan-400'}`}
                                ></motion.div>

                                <GlassCard className={`w-full p-8 md:p-12 text-center flex flex-col items-center border-t-8 border-b-8 ${isJackpot ? 'border-yellow-400 shadow-[0_0_150px_rgba(255,215,0,0.5)] bg-black/95' : (winDetails?.color?.replace('text-', 'border-') || 'border-cyan-400')} ${winDetails?.glow} ${winTier === 'EPIC' ? 'shadow-[0_0_100px_rgba(255,215,0,0.6)] bg-black/95' : 'bg-black/90'} relative z-10`}>
                                    
                                    {isJackpot ? <h1 className="text-5xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-orange-500 to-red-600 drop-shadow-2xl mb-4 animate-pulse leading-none">GRAND<br/>JACKPOT</h1> : 
                                     winTier === 'EPIC' ? <h1 className="text-6xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-purple-200 to-pink-600 drop-shadow-2xl mb-4 animate-pulse leading-none">EPIC<br/>WIN</h1> : 
                                     winTier === 'MEGA' ? <h1 className="text-5xl md:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 to-blue-600 drop-shadow-lg mb-4 leading-none">MEGA<br/>WIN</h1> : null}
                                    
                                    <motion.div animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }} className="w-32 h-32 md:w-40 md:h-40 mb-6 relative">
                                        <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full animate-pulse"></div>
                                        <SymbolSVG id={isJackpot ? 1 : (winDetails?.id || 7)} islandId={parseInt(island?.id || 1)} isWinning={true} />
                                    </motion.div>
                                    
                                    <h2 className={`text-3xl md:text-5xl font-black italic tracking-tighter uppercase drop-shadow-2xl ${isJackpot ? 'text-red-500' : winDetails?.color}`}>
                                        {isJackpot ? 'GRAND JACKPOT' : winDetails?.name}
                                    </h2>
                                    
                                    <div className="text-5xl md:text-7xl font-mono font-black text-white drop-shadow-[0_0_50px_rgba(255,255,255,1)] mt-6 md:mt-8 bg-white/10 px-6 md:px-10 py-3 md:py-4 rounded-3xl border-2 border-white/30 backdrop-blur-xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 animate-[shimmer_2s_infinite]"></div>
                                        +<RollupNumber value={lastWin} duration={winTier === 'EPIC' || isJackpot ? 2500 : 1500} />
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
        </>
    );
};

export default PlayView;