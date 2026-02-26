import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Minus, Plus, Zap, StopCircle, Gamepad2, LogOut, 
    Trophy, Flame, MessageCircle, Square, Circle, Timer, TrendingUp, 
    ArrowUpCircle, ShieldAlert, Info, HelpCircle, X, Coins , Repeat
} from 'lucide-react';
import { useRouter } from 'next/router';

// --- REAL PRODUCTION IMPORTS ---
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useGameSound } from '../../hooks/useGameSound';
import { useSlotMachine } from '../../hooks/useSlotMachine';
import { game as gameApi } from '../../services/api';

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
const BET_AMOUNTS = [80, 100, 150, 200, 300, 500, 700, 850, 900, 1000, 5000, 10000, 50000, 100000, 250000, 500000];

// --- ISLAND-SPECIFIC GAMBLE MINI-GAMES ---
const GAMBLE_THEMES = {
    1: { title: 'HIGH STAKES', sub: 'Pick a Suit', a: { label: 'HEARTS', icon: '♥️', color: 'red-500' }, b: { label: 'SPADES', icon: '♠️', color: 'gray-400' } },
    2: { title: 'COCONUT SHELL', sub: 'Find the Pearl', a: { label: 'LEFT SHELL', icon: '🥥', color: 'orange-400' }, b: { label: 'RIGHT SHELL', icon: '🥥', color: 'orange-400' } },
    3: { title: 'DRAGON BREATH', sub: 'Choose a Shield', a: { label: 'FIRE SHIELD', icon: '🛡️', color: 'red-600' }, b: { label: 'IRON SHIELD', icon: '🛡️', color: 'gray-500' } },
    4: { title: 'BAT HUNT', sub: 'Pick a Target', a: { label: 'BLOOD BAT', icon: '🦇', color: 'red-500' }, b: { label: 'SHADOW BAT', icon: '🦇', color: 'purple-500' } },
    5: { title: 'ICE CRACK', sub: 'Tap a Crystal', a: { label: 'RUBY ICE', icon: '💎', color: 'red-400' }, b: { label: 'OBSIDIAN', icon: '💎', color: 'gray-600' } },
    6: { title: 'FEATHER FALL', sub: 'Catch the Right Feather', a: { label: 'SUN FEATHER', icon: '🪶', color: 'yellow-400' }, b: { label: 'MOON FEATHER', icon: '🪶', color: 'gray-300' } },
    7: { title: 'SPORE CHOICE', sub: 'Pick a Mushroom', a: { label: 'NEON CAP', icon: '🍄', color: 'green-400' }, b: { label: 'DARK CAP', icon: '🍄', color: 'purple-600' } },
    8: { title: 'HACK SEQUENCE', sub: 'Select Override Node', a: { label: 'NODE ALPHA', icon: '🔌', color: 'cyan-400' }, b: { label: 'NODE OMEGA', icon: '🔌', color: 'blue-500' } },
    9: { title: 'GEAR GRIND', sub: 'Lock a Cog', a: { label: 'BRASS COG', icon: '⚙️', color: 'yellow-600' }, b: { label: 'IRON COG', icon: '⚙️', color: 'gray-400' } },
    10: { title: 'EVENT HORIZON', sub: 'Predict the Singularity', a: { label: 'EXPAND', icon: '🌌', color: 'red-500' }, b: { label: 'COLLAPSE', icon: '🌌', color: 'purple-600' } },
};

// --- ROLLUP COUNTER ---
const RollupNumber = ({ value, duration = 1000 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseInt(value) || 0;
        if (start === end) { setCount(end); return; }
        if (end === 0) { setCount(0); return; }
        
        let timer = setInterval(() => {
            start += Math.ceil(end / 20) || 1;
            if (start >= end) { setCount(end); clearInterval(timer); } 
            else { setCount(start); }
        }, 30);
        return () => clearInterval(timer);
    }, [value]);
    return <>{count.toLocaleString()}</>;
};

const getIslandPaylineStyle = (islandId) => {
    switch(parseInt(islandId)) {
        case 1: return { color: '#FF00FF', shadow: 'rgba(255, 0, 255, 0.8)' };
        case 3: return { color: '#FF4500', shadow: 'rgba(255, 69, 0, 0.8)' };
        case 4: return { color: '#9D00FF', shadow: 'rgba(157, 0, 255, 0.8)' };
        case 5: return { color: '#00FFFF', shadow: 'rgba(0, 255, 255, 0.8)' };
        case 8: return { color: '#00FF00', shadow: 'rgba(0, 255, 0, 0.8)' };
        case 9: return { color: '#FFD700', shadow: 'rgba(255, 215, 0, 0.8)' };
        default: return { color: '#00f3ff', shadow: 'rgba(0, 243, 255, 0.8)' };
    }
};

const ReelColumn = ({ isSpinning, finalSymbols, locked, islandId, isWinning, isTeaser, isFreeze }) => {
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
                                <SymbolSVG id={symId} isWinning={isWinning && !isSpinning && idx < 3} islandId={parseInt(islandId || 1)} />
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
    const { user, updateBalance } = useAuth();
    const { addToast } = useToast();
    
    // Bind to the real API-driven slot machine hook
    const slotLogic = useSlotMachine(machine?.id, island?.id);
    
    const { 
        reels, winningLines, isSpinning, isTeaser, lastWin, winTier, sessionWinStreak, streakMult, volatility,
        freeSpins, bonusMode, bonusSpinsLeft, atSequence, atCurrentStep,
        showBonusSummary, bonusTotalWin, clearBonusTotal, levelUpData, setLevelUpData,
        isJackpot, isReachEye, isFreeze, lapsSinceBonus, momentumMult, inZone, error, 
        showIdleWarning, isIdleKicked, resetIdleTimer, leave,
        autoPlay, spin, stopReel, setAutoPlay, setLastWin, turboMode, setTurboMode
    } = slotLogic;
    
    const [betIndex, setBetIndex] = useState(0);
    const [winStage, setWinStage] = useState('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [charInteraction, setCharInteraction] = useState(null);
    const [gamblePending, setGamblePending] = useState(false);
    const [gambleLost, setGambleLost] = useState(false);
    const [gambleFeedback, setGambleFeedback] = useState(null);
    const [coins, setCoins] = useState([]);
    
    const [showPaytable, setShowPaytable] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    
    const { playSound } = useGameSound(!isMuted);
    const currentBet = BET_AMOUNTS[betIndex];

    const isProcessing = useRef(false);
    const [reelThud, setReelThud] = useState([false, false, false]); 

    const gambleTheme = GAMBLE_THEMES[island?.id] || GAMBLE_THEMES[1];

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
        if (isSpinning.some(s => s)) return 'BUSY';
        return 'FREE';
    };

    useEffect(() => {
        if (isFreeze) { playSound('bigwin'); addToast("CRITICAL ANOMALY: LONG FREEZE DETECTED!", "error"); }
    }, [isFreeze, playSound, addToast]);

    useEffect(() => {
        if (inZone && isSpinning.some(s=>s)) setCharInteraction("⚠️ ZONE ACTIVE: RTP SURGE!");
        else if (isReachEye && isSpinning.some(s=>s)) setCharInteraction("Gekiatsu... REACH!");
        else if (sessionWinStreak >= 3 && !isSpinning.some(s=>s)) setCharInteraction(`🔥 COMBO x${sessionWinStreak}! MULT: ${streakMult}x`);
        else if (momentumMult > 1.2 && !isSpinning.some(s=>s)) setCharInteraction(`Momentum x${momentumMult.toFixed(1)}!`);
    }, [inZone, isReachEye, momentumMult, sessionWinStreak, streakMult, isSpinning]);

    useEffect(() => {
        if (levelUpData) { playSound('bigwin'); triggerCoinShower(80); }
    }, [levelUpData, playSound]);

    useEffect(() => {
        if (lastWin > 0 && winStage === 'idle') {
            const isBigWin = winTier === 'BIG' || winTier === 'MEGA' || winTier === 'EPIC';
            playSound(isBigWin ? 'bigwin' : 'win');
            if (winTier === 'MEGA' || winTier === 'EPIC') triggerCoinShower(winTier === 'EPIC' ? 100 : 50);

            if (!bonusMode && !autoPlay) {
                setWinStage('celebrating');
                setTimeout(() => setWinStage('gambling'), winTier === 'EPIC' ? 4000 : 2500);
            }
        } else if (lastWin === 0 && winStage !== 'gambling' && winStage !== 'celebrating') {
             setWinStage('idle');
        }
        if (!isSpinning.some(s=>s)) isProcessing.current = false;
    }, [lastWin, autoPlay, currentBet, playSound, bonusMode, winStage, isSpinning, winTier]);

    const triggerCoinShower = (amount = 40) => {
        const newParticles = Array.from({length: amount}).map((_, i) => ({
            id: Date.now() + i, left: Math.random() * 100, delay: Math.random() * 1.5,
            scale: 0.5 + Math.random(), rotation: Math.random() * 360
        }));
        setCoins(newParticles);
        setTimeout(() => setCoins([]), 4000);
    };

    const handleSpin = useCallback(() => {
        if (isProcessing.current || isSpinning.some(s=>s) || winStage !== 'idle' || isFreeze || levelUpData) return; 
        if (parseFloat(user?.balance || 0) < currentBet && freeSpins === 0 && !bonusMode) {
            addToast("Insufficient Balance", "error"); return;
        }
        isProcessing.current = true;
        setCharInteraction(null);
        playSound('spin');
        spin(currentBet);
    }, [user, currentBet, winStage, playSound, spin, freeSpins, bonusMode, isSpinning, isFreeze, levelUpData, addToast]);

    const handleStopReel = (idx) => {
        if (isSpinning[idx] && !autoPlay) {
            if (atSequence && atSequence.length > 0 && atSequence[atCurrentStep] !== idx) return; 
            playSound('stop');
            if (navigator.vibrate) navigator.vibrate(20);
            setReelThud(prev => { const n = [...prev]; n[idx] = true; return n; });
            setTimeout(() => { setReelThud(prev => { const n = [...prev]; n[idx] = false; return n; }); }, 150);
            stopReel(idx);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            resetIdleTimer();
            if (e.code === 'Space') { e.preventDefault(); handleSpin(); }
            if (e.key === '1') handleStopReel(0); 
            if (e.key === '2') handleStopReel(1); 
            if (e.key === '3') handleStopReel(2);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSpin, handleStopReel, resetIdleTimer]);

    const handleGamble = async (choice) => {
        playSound('click'); setGamblePending(true); setGambleFeedback(null);
        try {
            const res = await gameApi.gamble(choice);
            if (res.data.status === 'success') {
                if (res.data.won) {
                    setLastWin(res.data.new_win_amount); 
                    updateBalance(res.data.new_balance);
                    if (res.data.is_critical) {
                        setGambleFeedback('critical'); addToast("CRITICAL SUCCESS! 3X MULTIPLIER!", "success");
                        playSound('bigwin'); triggerCoinShower(50);
                    } else { playSound('win'); }
                    setWinStage('celebrating'); 
                    setTimeout(() => setWinStage('idle'), 3000);
                } else {
                    setLastWin(res.data.new_win_amount); 
                    updateBalance(res.data.new_balance);
                    if (res.data.is_pity) {
                        setGambleFeedback('pity'); addToast("LUCKY SAVE! Retained 50%!", "info");
                        playSound('win'); setWinStage('idle');
                    } else {
                        playSound('stop'); setGambleLost(true); setWinStage('idle');
                        setTimeout(() => setGambleLost(false), 2000);
                    }
                }
            } else { addToast(res.data.error || "Gamble Failed", "error"); setWinStage('idle'); }
        } catch (e) { setWinStage('idle'); } finally { setGamblePending(false); }
    };

    const collectWin = () => { playSound('click'); setWinStage('idle'); };

    const winDetails = useMemo(() => {
        if (!winningLines || winningLines.length === 0) return null;
        const firstLine = winningLines[0];
        if (firstLine === 99) return PAYTABLE_DATA.find(p => p.id === reels[0]); 
        const symId = reels[PAYLINES[firstLine][0]];
        return PAYTABLE_DATA.find(p => p.id === symId);
    }, [winningLines, reels]);

    const lineStyle = getIslandPaylineStyle(island?.id);
    const strokeWidths = { 'NONE': 4, 'SMALL': 5, 'BIG': 8, 'MEGA': 12, 'EPIC': 18 };

    return (
        <div 
            className={`min-h-screen bg-black relative flex flex-col overflow-hidden transition-colors duration-1000 ${bonusMode === 'HEAVEN' ? 'bg-purple-950' : (bonusMode ? 'bg-red-950' : '')}`}
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

            {/* BACKGROUND LAYER */}
            <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isSpinning.some(s=>s) ? 'opacity-40' : 'opacity-100'}`}>
                <IslandLandscapeSVG islandId={island?.id} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black"></div>
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
            
            {/* TELEMETRY HUD (Top) */}
            <div className="absolute top-10 left-0 w-full px-6 flex justify-between items-start z-40 pointer-events-none">
                <div className="flex flex-col gap-2">
                    <button onClick={onLeave} className="pointer-events-auto w-10 h-10 bg-black/60 rounded-full text-white backdrop-blur flex items-center justify-center border border-white/10 hover:bg-white/20 active:scale-95 transition-all"><ChevronLeft/></button>
                    
                    <div className={`pointer-events-auto bg-black/80 border rounded-xl p-2 px-3 flex items-center gap-3 backdrop-blur-md shadow-lg transition-colors duration-500 ${momentumMult > 1.5 ? 'border-purple-500 shadow-[0_0_15px_purple]' : 'border-cyan-500/30'}`}>
                        <TrendingUp size={16} className={momentumMult > 1.5 ? 'text-purple-400 animate-pulse' : 'text-cyan-400'} />
                        <div>
                            <div className={`text-[8px] font-bold uppercase ${momentumMult > 1.5 ? 'text-purple-500' : 'text-cyan-500'}`}>Momentum</div>
                            <div className="text-sm font-mono font-black text-white">x{momentumMult.toFixed(1)}</div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {sessionWinStreak >= 3 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="pointer-events-auto bg-orange-900/80 border border-orange-500 rounded-xl p-2 px-3 flex items-center gap-2 backdrop-blur-md shadow-[0_0_15px_orange] animate-pulse">
                                <Flame size={16} className="text-orange-400 fill-current" />
                                <div>
                                    <div className="text-[8px] text-orange-200 font-bold uppercase">WIN STREAK</div>
                                    <div className="text-sm font-mono font-black text-white">x{sessionWinStreak} <span className="text-xs text-orange-400 ml-1">(+{streakMult}x)</span></div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="pointer-events-auto bg-black/80 border border-yellow-500/30 rounded-full px-4 py-2 flex items-center gap-3 backdrop-blur-md shadow-lg cursor-pointer hover:bg-black transition-colors" onClick={() => router.push('/wallet')}>
                        <Coins size={18} className="text-yellow-400" />
                        <span className="text-white font-mono font-black text-lg"><RollupNumber value={user?.balance || 0} /></span>
                    </div>

                    <div className={`pointer-events-auto bg-black/80 border rounded-xl p-2 px-3 flex items-center gap-3 backdrop-blur-md shadow-lg transition-colors duration-500 ${lapsSinceBonus > 700 ? 'border-red-500 shadow-[0_0_15px_red] animate-pulse' : 'border-red-500/30'}`}>
                        <div>
                            <div className="text-[8px] text-red-500 font-bold uppercase text-right">Tenjo Limit</div>
                            <div className="text-sm font-mono font-black text-white">{lapsSinceBonus} / 777</div>
                        </div>
                        <Timer size={16} className={lapsSinceBonus > 700 ? 'text-white' : 'text-red-400'} />
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button onClick={() => { playSound('click'); setShowPaytable(true); }} className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white backdrop-blur-sm transition-colors">
                            <Info size={14} />
                        </button>
                        <div className="bg-black/60 border border-white/10 rounded-full px-3 py-1 flex items-center gap-1 backdrop-blur-sm">
                            <span className="text-[8px] text-gray-400 uppercase font-bold">VOL:</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${volatility === 'high' || volatility === 'extreme' ? 'text-red-400' : 'text-blue-400'}`}>
                                {volatility}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN GAME STAGE */}
            <div className={`flex-1 flex items-center justify-center relative z-10 px-2 pt-16 pb-6 ${isFreeze || winTier === 'EPIC' ? 'animate-shake-epic' : ''}`} style={{ perspective: '1200px' }}>
                <motion.div 
                    className="relative w-full max-w-[400px] aspect-[0.6] flex items-center justify-center"
                    animate={{ rotateX: mousePos.y, rotateY: mousePos.x }}
                    transition={{ type: 'spring', stiffness: 75, damping: 15 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <div className="absolute inset-0 z-10 w-full h-full pointer-events-none" style={{ transform: 'translateZ(-10px)' }}>
                        <CabinetSVG islandId={parseInt(island?.id || 1)} mode="game" charId={island?.hostess_char_id} visualState={getCabinetState()} />
                    </div>

                    <div className="absolute bottom-[5%] right-[-20%] w-[60%] h-[65%] z-20 pointer-events-auto cursor-pointer group" style={{ transform: 'translateZ(30px)' }} onClick={() => {playSound('click'); setCharInteraction("Target acquired.");}}>
                        <CharacterSVG type={user?.active_pet_id} mood={bonusMode || winTier !== 'NONE' ? 'win' : 'idle'} />
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

                    <div className="absolute top-[57.5%] left-[5%] w-[90%] h-[15%] z-50 pointer-events-auto" style={{ perspective: '800px', transform: 'translateZ(40px)' }}>
                        <div className="w-full h-full relative flex items-center justify-center" style={{ transform: 'rotateX(25deg)', transformOrigin: 'top center' }}>
                            <div className="absolute left-[2%] top-[10%] flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 shadow-inner">
                                <button onClick={() => {playSound('click'); setBetIndex(Math.max(0, betIndex - 1))}} className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-white active:bg-cyan-600 active:scale-95 transition-all"><Minus size={14}/></button>
                                <div className="w-16 text-center font-mono font-bold text-yellow-400 text-xs">{currentBet.toLocaleString()}</div>
                                <button onClick={() => {playSound('click'); setBetIndex(Math.min(BET_AMOUNTS.length - 1, betIndex + 1))}} className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-white active:bg-cyan-600 active:scale-95 transition-all"><Plus size={14}/></button>
                            </div>
                            <button onClick={() => {playSound('click'); setBetIndex(BET_AMOUNTS.length - 1)}} className="absolute left-[2%] top-[60%] w-[100px] h-8 bg-orange-700 rounded-lg border-b-4 border-black text-[10px] font-black text-white flex items-center justify-center active:translate-y-1 active:border-b-0 transition-all shadow-md">MAX BET</button>

                            <div className="absolute left-[31%] top-[25%] flex gap-[10%] w-[38%] justify-between z-50">
                                {[0, 1, 2].map((idx) => {
                                    const naviOrder = atSequence ? atSequence.indexOf(idx) : -1;
                                    const isCurrentNavi = atSequence && atSequence[atCurrentStep] === idx;
                                    const showNavi = atSequence && atSequence.length > 0 && naviOrder >= atCurrentStep && isSpinning[idx];

                                    return (
                                        <button key={idx} onClick={() => handleStopReel(idx)} disabled={!isSpinning[idx] || autoPlay} className={`relative w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all shadow-xl touch-manipulation ${isSpinning[idx] && !autoPlay ? 'bg-red-600 border-red-400 text-white cursor-pointer shadow-[0_0_20px_red] hover:bg-red-500' : 'bg-black/50 border-gray-800 text-gray-700 cursor-default opacity-40'} ${isCurrentNavi && !autoPlay ? 'animate-pulse ring-4 ring-yellow-400 border-white' : ''} ${reelThud[idx] ? 'scale-75 border-0 bg-red-800' : 'scale-100'}`}>
                                            <StopCircle size={20} fill={isSpinning[idx] ? "currentColor" : "none"}/>
                                            {showNavi && <div className={`absolute -top-10 w-10 h-10 rounded-full border-2 font-black text-lg flex items-center justify-center z-50 pointer-events-none transition-all ${isCurrentNavi ? 'bg-yellow-400 text-black border-white animate-bounce shadow-[0_0_20px_gold] scale-125' : 'bg-black/90 text-yellow-500 border-yellow-500 opacity-80'}`}>{naviOrder + 1}</div>}
                                        </button>
                                    );
                                })}
                            </div>

                            <button onClick={handleSpin} disabled={isSpinning.some(s=>s) || isFreeze || isProcessing.current || (winStage !== 'idle' && winStage !== 'celebrating') || levelUpData !== null} className={`absolute right-[2%] top-[5%] w-20 h-20 rounded-full border-b-[8px] flex flex-col items-center justify-center shadow-2xl transition-all touch-manipulation ${isSpinning.some(s=>s) || isProcessing.current || levelUpData ? 'bg-gray-800 border-gray-950 opacity-50 translate-y-1 border-b-[4px]' : bonusMode ? 'bg-gradient-to-b from-yellow-400 to-orange-600 border-orange-950 text-white shadow-[0_0_30px_gold] animate-pulse active:translate-y-2 active:border-b-0' : freeSpins > 0 ? 'bg-gradient-to-b from-cyan-400 to-blue-600 border-blue-950 text-white shadow-[0_0_20px_cyan] active:translate-y-2 active:border-b-0' : 'bg-gradient-to-b from-red-500 to-red-800 border-red-950 text-white hover:brightness-110 active:translate-y-2 active:border-b-0'}`}>
                                <Gamepad2 size={28} strokeWidth={2.5} className="text-white mb-1" />
                                <span className="text-[9px] font-black text-white tracking-widest uppercase drop-shadow-md">{bonusMode ? 'AT SPIN' : (freeSpins > 0 ? 'REPLAY' : 'SPIN')}</span>
                            </button>

                            <div className="absolute right-[30%] top-[15%] flex flex-col gap-2">
                                <button onClick={() => {playSound('click'); setTurboMode(!turboMode)}} className={`w-10 h-10 rounded-lg border-b-4 flex items-center justify-center transition-all active:translate-y-1 active:border-b-0 ${turboMode ? 'bg-yellow-500 text-black border-yellow-800 shadow-[0_0_15px_gold]' : 'bg-gray-800 text-gray-400 border-gray-950 shadow-md'}`}><Zap size={18} fill={turboMode ? "currentColor" : "none"}/></button>
                                <button onClick={() => {playSound('click'); setAutoPlay(!autoPlay)}} className={`w-10 h-10 rounded-lg border-b-4 flex items-center justify-center transition-all active:translate-y-1 active:border-b-0 ${autoPlay ? 'bg-green-600 text-white border-green-900 shadow-[0_0_15px_lime]' : 'bg-gray-800 text-gray-400 border-gray-950 shadow-md'}`}>
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
                {levelUpData && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center backdrop-blur-xl pointer-events-auto">
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <ArrowUpCircle size={80} className="text-cyan-400 mb-6 animate-bounce shadow-[0_0_50px_cyan] rounded-full" />
                            <h2 className="text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400 text-6xl font-black italic tracking-widest drop-shadow-[0_0_20px_cyan]">LEVEL UP!</h2>
                            <div className="mt-4 text-2xl font-bold text-white tracking-widest">RANK {levelUpData.new_level}</div>
                            {levelUpData.reward > 0 && (
                                <div className="mt-8 bg-black/50 border border-yellow-500/50 p-6 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                                    <div className="text-xs text-yellow-500 font-bold uppercase tracking-widest mb-2">RANK REWARD</div>
                                    <div className="text-5xl font-mono font-black text-yellow-400">+{levelUpData.reward.toLocaleString()} MMK</div>
                                </div>
                            )}
                            <button onClick={() => { playSound('click'); setLevelUpData(null); }} className="mt-12 px-12 py-4 bg-cyan-500 text-black font-black text-xl rounded-full shadow-[0_0_30px_cyan] hover:scale-105 active:scale-95 transition-transform">ASCEND</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isFreeze && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center mix-blend-difference pointer-events-none">
                        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 0.05 }} className="text-8xl font-black italic tracking-tighter text-black">FREEZE</motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {winStage === 'celebrating' && winDetails && !bonusMode && (
                    <motion.div initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} animate={{ opacity: 1, backdropFilter: 'blur(10px)' }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                        {winTier === 'EPIC' && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-30 mix-blend-color-dodge animate-pulse hue-rotate-90"></div>}
                        <motion.div initial={{ scale: 0.5, y: 100 }} animate={{ scale: winTier === 'EPIC' ? 1.2 : 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 15 } }} className="relative z-10 flex flex-col items-center">
                            <GlassCard className={`p-10 text-center flex flex-col items-center border-t-8 border-b-8 ${winDetails.color.replace('text-', 'border-')} ${winDetails.glow} ${winTier === 'EPIC' ? 'shadow-[0_0_100px_rgba(255,215,0,0.8)]' : ''}`}>
                                {winTier === 'EPIC' ? <h1 className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-orange-500 to-red-600 drop-shadow-2xl mb-4 animate-pulse">EPIC WIN</h1> : winTier === 'MEGA' ? <h1 className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 to-blue-600 drop-shadow-lg mb-4">MEGA WIN</h1> : null}
                                <motion.div animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-32 h-32 mb-6">
                                    <SymbolSVG id={winDetails.id} islandId={parseInt(island?.id || 1)} isWinning={true} />
                                </motion.div>
                                <h2 className={`text-4xl font-black italic tracking-tighter uppercase drop-shadow-2xl ${winDetails.color}`}>{winDetails.name}</h2>
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
                            <button onClick={() => { playSound('click'); clearBonusTotal(); }} className="w-full py-4 bg-white text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 transition-all">CONTINUE</button>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* ISLAND-THEMED GAMBLE MODAL */}
            {winStage === 'gambling' && !bonusMode && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 pointer-events-auto">
                    <GlassCard className={`w-full max-w-sm p-0 text-center border-t-4 shadow-2xl overflow-hidden ${gambleFeedback === 'critical' ? 'border-yellow-400 shadow-[0_0_50px_gold]' : 'border-cyan-500/50 shadow-[0_0_30px_cyan]'}`}>
                        
                        <div className={`bg-gradient-to-b from-${gambleTheme.a.color.split('-')[0]}-900/40 to-transparent p-6 pb-2`}>
                            <h2 className="text-3xl font-black text-white mb-1 italic tracking-widest drop-shadow-md">{gambleTheme.title}</h2>
                            <p className="text-xs text-cyan-400 font-bold tracking-widest uppercase mb-4 animate-pulse">{gambleTheme.sub}</p>
                            
                            <div className="flex justify-between text-xs font-mono text-gray-400 mb-6 bg-black/80 p-4 rounded-xl border border-white/10 items-center shadow-inner relative overflow-hidden mt-4">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                <div className="flex flex-col text-left relative z-10">
                                    <span className="text-[9px] uppercase">Base Win</span>
                                    <b className="text-white text-sm">{currentBet.toLocaleString()}</b>
                                </div>
                                <div className="text-center relative z-10 border-x border-white/10 px-4">
                                    <span className="text-[9px] uppercase block text-cyan-400 mb-1">Current Pot</span>
                                    <b className="text-cyan-400 text-2xl drop-shadow-[0_0_10px_cyan]"><RollupNumber value={lastWin} duration={500} /></b>
                                </div>
                                <div className="flex flex-col text-right relative z-10">
                                    <span className="text-[9px] uppercase text-green-400">Potential</span>
                                    <b className="text-green-400 text-lg drop-shadow-[0_0_10px_green]">{(lastWin*2).toLocaleString()}</b>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 pt-2">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button onClick={() => handleGamble('red')} disabled={gamblePending} className={`group relative h-28 rounded-2xl border border-${gambleTheme.a.color.split('-')[0]}-500/50 bg-${gambleTheme.a.color.split('-')[0]}-950/40 overflow-hidden hover:border-${gambleTheme.a.color.split('-')[0]}-400 active:scale-95 transition-all shadow-lg`}>
                                    <div className={`absolute inset-0 bg-gradient-to-t from-${gambleTheme.a.color.split('-')[0]}-600/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform drop-shadow-lg">{gambleTheme.a.icon}</div>
                                        <span className={`font-black text-[10px] text-${gambleTheme.a.color} tracking-widest uppercase`}>{gambleTheme.a.label}</span>
                                    </div>
                                </button>
                                
                                <button onClick={() => handleGamble('black')} disabled={gamblePending} className={`group relative h-28 rounded-2xl border border-${gambleTheme.b.color.split('-')[0]}-500/50 bg-${gambleTheme.b.color.split('-')[0]}-950/40 overflow-hidden hover:border-${gambleTheme.b.color.split('-')[0]}-400 active:scale-95 transition-all shadow-lg`}>
                                    <div className={`absolute inset-0 bg-gradient-to-t from-${gambleTheme.b.color.split('-')[0]}-600/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform drop-shadow-lg">{gambleTheme.b.icon}</div>
                                        <span className={`font-black text-[10px] text-${gambleTheme.b.color} tracking-widest uppercase`}>{gambleTheme.b.label}</span>
                                    </div>
                                </button>
                            </div>
                            
                            <button onClick={collectWin} className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs rounded-xl transition-all uppercase tracking-widest shadow-inner">
                                <LogOut size={14} className="inline mr-2" /> Collect Win & Return
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default PlayView;