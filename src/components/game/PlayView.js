import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Minus, Plus, Zap, StopCircle, Gamepad2, LogOut, 
    Trophy, Flame, MessageCircle, Square, Circle, Timer, TrendingUp, 
    ArrowUpCircle, ShieldAlert, Info, HelpCircle, X, Coins, Repeat
} from 'lucide-react';

// ============================================================================
// INTERNAL MOCKS & CONTEXTS (Self-Contained for Preview)
// ============================================================================

// --- Auth Context Mock ---
const AuthContext = createContext({ user: { balance: 150000, active_pet_id: 'luna' }, updateBalance: () => {} });
const useAuth = () => useContext(AuthContext);

// --- Toast Context Mock ---
const ToastContext = createContext({ addToast: console.log });
const useToast = () => useContext(ToastContext);

// --- Game Sound Mock ---
const useGameSound = () => ({ playSound: (type) => console.log(`Sound: ${type}`) });

// --- Slot Machine Logic Hook (V3 MULTI-ALGORITHM ENGINE) ---
const useSlotMachine = (machineId, islandId) => {
    const [reels, setReels] = useState([7,7,7, 7,7,7, 7,7,7]);
    const [isSpinning, setIsSpinning] = useState([false, false, false]);
    const [winningLines, setWinningLines] = useState([]);
    const [lastWin, setLastWin] = useState(0);
    const [winTier, setWinTier] = useState('NONE');
    const [sessionWinStreak, setSessionWinStreak] = useState(0);
    const [streakMult, setStreakMult] = useState(1.0);
    const [freeSpins, setFreeSpins] = useState(0);
    const [bonusMode, setBonusMode] = useState(null);
    const [bonusSpinsLeft, setBonusSpinsLeft] = useState(0);
    const [lapsSinceBonus, setLapsSinceBonus] = useState(120);
    const [momentumMult, setMomentumMult] = useState(1.0);
    const [inZone, setInZone] = useState(false);
    const [isTeaser, setIsTeaser] = useState(false);
    const [isReachEye, setIsReachEye] = useState(false);
    const [isFreeze, setIsFreeze] = useState(false);
    const [isJackpot, setIsJackpot] = useState(false);
    
    // Global State for Preview
    const [currentJackpot, setCurrentJackpot] = useState(3599800); // Start just before 3.6M to see it climb
    const [userBal, setUserBal] = useState(150000);

    const [error, setError] = useState(null);
    const [autoPlay, setAutoPlay] = useState(false);
    const [turboMode, setTurboMode] = useState(false);
    const [atSequence, setAtSequence] = useState([]);
    const [atCurrentStep, setAtCurrentStep] = useState(0);
    const [isReady, setIsReady] = useState(true);
    
    // Use refs for spin execution to decouple state from intervals
    const spinDataRef = useRef(null);

    const spin = (betAmount) => {
        if (userBal < betAmount) {
            setError("Insufficient Balance");
            setAutoPlay(false);
            return;
        }

        setIsSpinning([true, true, true]);
        setWinningLines([]);
        setLastWin(0);
        setWinTier('NONE');
        setIsJackpot(false);
        
        // 1. Deduct Bet & Feed Jackpot (5%)
        setUserBal(prev => prev - betAmount);
        let newJp = currentJackpot + (betAmount * 0.05);
        
        // 2. V3 ALGORITHM ROUTER
        let isJpHit = false;
        let spinWin = 0;
        let finalStops = [0,0,0, 0,0,0, 0,0,0];
        let wLines = [];
        
        // --- JACKPOT LOGIC ---
        const gMin = 3600000;
        const gMax = 7200000;
        
        if (newJp >= gMax) {
            isJpHit = true; // Forced Hit at cap
        } else if (newJp >= gMin) {
            const alpha = Math.min(1, Math.max(0, (newJp - gMin) / (gMax - gMin)));
            const pjp = 0.00002 * (1 + 5 * alpha);
            if (Math.random() <= pjp) isJpHit = true;
        }

        if (isJpHit) {
            spinWin = newJp;
            newJp = 3000000; // Reset
            finalStops = [2,5,3, 1,1,1, 4,6,2]; // Visual 7-7-7
            wLines = [1];
        } else {
            // --- ISLAND ALGORITHMS ---
            const roll = Math.floor(Math.random() * 1000) + 1;
            let winSym = 0, mult = 0;
            const id = parseInt(islandId) || 1;

            if (id === 1) { // Kyoto Zen (~70% Base RTP)
                if (roll <= 4) { winSym = 7; mult = 40; }       // Diamond
                else if (roll <= 12) { winSym = 1; mult = 15; }  // 7
                else if (roll <= 26) { winSym = 5; mult = 7; }   // Melon
                else if (roll <= 56) { winSym = 4; mult = 3; }   // Bell
                else if (roll <= 109) { winSym = 6; mult = 2; }  // Cherry
                else if (roll <= 174) { winSym = 7; mult = 0; }  // Replay
            } 
            else if (id === 2) { // Neon Arcade
                if (roll <= 1) { winSym = 1; mult = 50; }       
                else if (roll <= 11) { winSym = 3; mult = 10; }  
                else if (roll <= 41) { winSym = 5; mult = 4; }   
                else if (roll <= 101) { winSym = 4; mult = 2; }   
                else if (roll <= 251) { winSym = 6; mult = 1; }  
            }
            else if (id === 3) { // Edo Castle (Extreme)
                if (roll <= 2) { winSym = 1; mult = 150; }      
                else if (roll <= 12) { winSym = 3; mult = 20; }   
                else if (roll <= 45) { winSym = 5; mult = 3; }   
            }
            else if (id === 4) { // Hanami Fest
                if (roll <= 4) { winSym = 1; mult = 30; }       
                else if (roll <= 14) { winSym = 3; mult = 12; }  
                else if (roll <= 34) { winSym = 5; mult = 6; }   
                else if (roll <= 74) { winSym = 4; mult = 4; }   
                else if (roll <= 140) { winSym = 6; mult = 1.5; } 
            }
            else if (id === 5) { // Spirited Yokai
                if (roll <= 5) { winSym = 1; mult = 40; }       
                else if (roll <= 30) { winSym = 3; mult = 16; }   
                else if (roll <= 70) { winSym = 4; mult = 0; }    
            }

            if (winSym > 0 && mult > 0) {
                spinWin = betAmount * mult;
                finalStops = [2,3,4, winSym,winSym,winSym, 5,6,2];
                wLines = [1];
            } else {
                finalStops = [2,3,4, 5,6,7, 1,2,3].sort(() => Math.random() - 0.5);
                wLines = [];
            }
        }

        // Store data for when reels stop
        spinDataRef.current = {
            winAmount: spinWin,
            stops: finalStops,
            lines: wLines,
            isJp: isJpHit,
            newJpPool: newJp
        };

        // Auto-stop logic mock
        if (autoPlay) {
            const baseTime = turboMode ? 200 : 500;
            setTimeout(() => stopReel(0), baseTime);
            setTimeout(() => stopReel(1), baseTime * 2);
            setTimeout(() => stopReel(2), baseTime * 3);
        }
    };
    
    const stopReel = (idx) => { 
        setIsSpinning(p => { 
            const n = [...p]; 
            n[idx] = false; 
            
            // Check if all stopped
            if (!n.some(s => s)) {
                const data = spinDataRef.current;
                if(data) {
                    setReels(data.stops);
                    setWinningLines(data.lines);
                    setLastWin(data.winAmount);
                    setIsJackpot(data.isJp);
                    setCurrentJackpot(data.newJpPool);
                    
                    if (data.winAmount > 0) {
                        setUserBal(prev => prev + data.winAmount);
                        const mult = data.winAmount / BET_AMOUNTS[0]; // rough calc
                        if (mult >= 40) setWinTier('EPIC');
                        else if (mult >= 15) setWinTier('MEGA');
                        else if (mult >= 7) setWinTier('BIG');
                        else setWinTier('SMALL');
                    }
                }
            }
            return n; 
        }); 
    };
    
    return {
        reels, winningLines, lastWin, winTier, sessionWinStreak, streakMult, volatility: 'V3 Engine',
        isSpinning, isTeaser, isReachEye, isFreeze, isJackpot, setIsJackpot, error,
        showIdleWarning: false, isIdleKicked: false, resetIdleTimer: ()=>{}, leave: ()=>{}, isReady,
        freeSpins, bonusMode, bonusSpinsLeft, atSequence, atCurrentStep,
        lapsSinceBonus, momentumMult, inZone,
        showBonusSummary: false, bonusTotalWin: 0, clearBonusTotal: () => {},
        levelUpData: null, setLevelUpData: () => {},
        autoPlay, setAutoPlay, turboMode, setTurboMode,
        spin, stopReel, setLastWin, currentJackpot, userBal
    };
};

// --- UI Components ---
const GlassCard = ({ children, className, onClick }) => (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`} onClick={onClick}>
        {children}
    </div>
);

const CabinetSVG = ({ visualState }) => (
    <div className={`w-full h-full rounded-[2rem] border-[8px] ${visualState === 'BROKEN' ? 'border-red-500 shadow-[0_0_50px_red]' : 'border-gray-800'} bg-[#111] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden transition-colors duration-500`}>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black px-6 py-1 rounded-full border border-white/10 text-[9px] font-black tracking-widest text-cyan-500 shadow-lg">
            LEVIATHAN ENGINE V3
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
    </div>
);

const CharacterSVG = ({ type, mood }) => (
    <div className={`w-full h-full transition-transform duration-500 ${mood === 'win' ? 'scale-110 drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]' : 'drop-shadow-xl'}`}>
        <div className="w-full aspect-square bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full border-4 border-white flex items-center justify-center relative overflow-hidden">
            <Trophy className="text-white w-1/2 h-1/2 absolute z-10" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-[spin_30s_linear_infinite]"></div>
            <div className="absolute bottom-4 bg-black/80 px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase border border-white/20">{type || 'PET'}</div>
        </div>
    </div>
);

const SymbolSVG = ({ id, isWinning }) => {
    const colors = ["text-yellow-400", "text-purple-400", "text-red-500", "text-yellow-200", "text-green-400", "text-pink-400", "text-cyan-400"];
    const color = colors[id - 1] || "text-white";
    return <div className={`font-black text-5xl ${color} ${isWinning ? 'animate-pulse drop-shadow-[0_0_15px_currentColor]' : ''}`}>{id}</div>;
};

const IslandLandscapeSVG = () => (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900 via-gray-900 to-black" />
);

// ============================================================================
// MAIN COMPONENT CODE
// ============================================================================

// V3 RESTRICTED BETS
const BET_AMOUNTS = [100, 500, 1000, 5000, 10000];

const getIslandPaylineStyle = () => {
    return { color: '#00f3ff', shadow: 'rgba(0, 243, 255, 0.8)' };
};

const ReelColumn = ({ isSpinning, finalSymbols, locked, isWinning, isTeaser, isFreeze }) => {
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
                                <SymbolSVG id={symId} isWinning={isWinning && !isSpinning && idx < 3} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black/90 z-20 pointer-events-none shadow-[inset_0_20px_20px_-10px_rgba(0,0,0,0.8),inset_0_-20px_20px_-10px_rgba(0,0,0,0.8)]"></div>
        </div>
    );
};

const PlayView = ({ machine = { id: 1 }, island = { id: 1, name: 'Kyoto Zen' }, onLeave = () => {} }) => {
    const { addToast } = useToast();
    
    // Bind to the real API-driven slot machine hook
    const slotLogic = useSlotMachine(machine?.id, island?.id);
    
    const { 
        reels, winningLines, isSpinning, isTeaser, lastWin, winTier, sessionWinStreak, streakMult, volatility,
        freeSpins, bonusMode, bonusSpinsLeft, atSequence, atCurrentStep,
        isJackpot, isReachEye, isFreeze, lapsSinceBonus, momentumMult, inZone, error, 
        isReady, autoPlay, spin, stopReel, setAutoPlay, setLastWin, turboMode, setTurboMode,
        currentJackpot, userBal // Brought out for V3 UI
    } = slotLogic;
    
    const [betIndex, setBetIndex] = useState(0);
    const [winStage, setWinStage] = useState('idle');
    const [charInteraction, setCharInteraction] = useState(null);
    const [coins, setCoins] = useState([]);
    const [showPaytable, setShowPaytable] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    
    const { playSound } = useGameSound();
    const currentBet = BET_AMOUNTS[betIndex];

    const isProcessing = useRef(false);
    const winHandled = useRef(false); 
    
    const isCurrentlySpinning = isSpinning.some(s => s);

    const handlePointerMove = useCallback((e) => {
        if (typeof window !== 'undefined') {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const x = ((clientX / innerWidth) - 0.5) * 10;
            const y = ((clientY / innerHeight) - 0.5) * -10;
            setMousePos({ x, y });
        }
    }, []);

    const getCabinetState = () => {
        if (isFreeze) return 'BROKEN';
        if (bonusMode) return 'JACKPOT_HOT';
        if (isCurrentlySpinning) return 'BUSY';
        return 'FREE';
    };

    const triggerCoinShower = (amount = 40) => {
        const newParticles = Array.from({length: amount}).map((_, i) => ({
            id: Date.now() + i, left: Math.random() * 100, delay: Math.random() * 1.5,
            scale: 0.5 + Math.random(), rotation: Math.random() * 360
        }));
        setCoins(newParticles);
        setTimeout(() => setCoins([]), 4000);
    };

    // --- SECURE WIN EVALUATION (Gamble Removed) ---
    useEffect(() => {
        if (lastWin > 0 && winStage === 'idle' && !winHandled.current && !isCurrentlySpinning) {
            winHandled.current = true; 
            
            const isBigWin = winTier === 'BIG' || winTier === 'MEGA' || winTier === 'EPIC' || isJackpot;
            playSound(isBigWin ? 'bigwin' : 'win');
            if (isBigWin) triggerCoinShower(isJackpot ? 150 : (winTier === 'EPIC' ? 100 : 50));

            if (!bonusMode && !autoPlay) {
                setWinStage('celebrating');
                // Automatically return to idle after celebration
                setTimeout(() => {
                    setWinStage('idle');
                    setLastWin(0);
                }, isJackpot ? 6000 : (winTier === 'EPIC' ? 4000 : 2500));
            }
        } 
        
        if (!isCurrentlySpinning) {
            isProcessing.current = false;
        }
    }, [lastWin, autoPlay, playSound, bonusMode, winStage, isCurrentlySpinning, winTier, isJackpot]);

    // --- CORE GAME ACTIONS ---
    const handleSpin = useCallback(() => {
        if (!isReady || isProcessing.current || isCurrentlySpinning || winStage !== 'idle' || isFreeze) return; 
        
        isProcessing.current = true;
        winHandled.current = false; 
        setCharInteraction(null);
        playSound('spin');
        spin(currentBet);
    }, [currentBet, winStage, playSound, spin, isCurrentlySpinning, isFreeze, isReady]);

    const handleQuickStop = useCallback(() => {
        if (!isCurrentlySpinning) return;
        playSound('stop');
        
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
            if (e.code === 'Space') { 
                e.preventDefault(); 
                if (isCurrentlySpinning) handleQuickStop();
                else handleSpin(); 
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSpin, handleQuickStop, isCurrentlySpinning]);

    const lineStyle = getIslandPaylineStyle();
    const strokeWidths = { 'NONE': 4, 'SMALL': 5, 'BIG': 8, 'MEGA': 12, 'EPIC': 18 };

    return (
        <div 
            className={`min-h-screen bg-black relative flex flex-col overflow-hidden transition-colors duration-1000 ${bonusMode === 'HEAVEN' ? 'bg-purple-950' : (bonusMode ? 'bg-red-950' : '')}`}
            onPointerMove={handlePointerMove} 
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
            <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isCurrentlySpinning ? 'opacity-40' : 'opacity-100'}`}>
                <IslandLandscapeSVG islandId={island?.id} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black"></div>
                {inZone && <div className="absolute inset-0 bg-yellow-500/10 mix-blend-overlay animate-pulse"></div>}
            </div>

            {/* V3 INTEGRATED GRAND JACKPOT TICKER */}
            <div className="bg-black border-b border-white/10 h-10 flex items-center overflow-hidden relative z-30 shadow-lg">
                <div className="bg-yellow-900/80 h-full px-4 flex items-center justify-center border-r border-yellow-500/50 z-10">
                    <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-yellow-400 font-black text-xs tracking-widest italic">GRAND JACKPOT</span>
                </div>
                <div className="flex-1 px-6 flex items-center justify-between bg-gradient-to-r from-yellow-900/20 to-transparent">
                    <div className="text-yellow-400 font-mono font-black text-xl tracking-[0.2em] drop-shadow-[0_0_10px_gold]">
                        {currentJackpot.toLocaleString()}
                    </div>
                    {currentJackpot >= 3600000 && (
                        <div className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded animate-pulse">
                            TRIGGER HOT
                        </div>
                    )}
                </div>
            </div>
            
            {/* TELEMETRY HUD (Top) */}
            <div className="absolute top-16 left-0 w-full px-6 flex justify-between items-start z-40 pointer-events-none">
                <div className="flex flex-col gap-2">
                    <button onClick={onLeave} className="pointer-events-auto w-10 h-10 bg-black/60 rounded-full text-white backdrop-blur flex items-center justify-center border border-white/10 hover:bg-white/20 active:scale-95 transition-all"><ChevronLeft/></button>
                    
                    <div className={`pointer-events-auto bg-black/80 border rounded-xl p-2 px-3 flex items-center gap-3 backdrop-blur-md shadow-lg transition-colors duration-500 ${momentumMult > 1.5 ? 'border-purple-500 shadow-[0_0_15px_purple]' : 'border-cyan-500/30'}`}>
                        <TrendingUp size={16} className={momentumMult > 1.5 ? 'text-purple-400 animate-pulse' : 'text-cyan-400'} />
                        <div>
                            <div className={`text-[8px] font-bold uppercase ${momentumMult > 1.5 ? 'text-purple-500' : 'text-cyan-500'}`}>Momentum</div>
                            <div className="text-sm font-mono font-black text-white">x{momentumMult.toFixed(1)}</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="pointer-events-auto bg-black/80 border border-yellow-500/30 rounded-full px-4 py-2 flex items-center gap-3 backdrop-blur-md shadow-lg cursor-pointer hover:bg-black transition-colors">
                        <Coins size={18} className="text-yellow-400" />
                        <span className="text-white font-mono font-black text-lg">{userBal.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button onClick={() => { playSound('click'); setShowPaytable(true); }} className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white backdrop-blur-sm transition-colors">
                            <Info size={14} />
                        </button>
                        <div className="bg-black/60 border border-white/10 rounded-full px-3 py-1 flex items-center gap-1 backdrop-blur-sm">
                            <span className="text-[8px] text-gray-400 uppercase font-bold">ALGO:</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest text-cyan-400`}>
                                V3 {island.name}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN GAME STAGE */}
            <div className={`flex-1 flex items-center justify-center relative z-10 px-2 pt-16 pb-6 ${isFreeze || winTier === 'EPIC' || isJackpot ? 'animate-shake-epic' : ''}`} style={{ perspective: '1200px' }}>
                <motion.div 
                    className="relative w-full max-w-[400px] aspect-[0.6] flex items-center justify-center"
                    animate={{ rotateX: mousePos.y, rotateY: mousePos.x }}
                    transition={{ type: 'spring', stiffness: 75, damping: 15 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <div className="absolute inset-0 z-10 w-full h-full pointer-events-none" style={{ transform: 'translateZ(-10px)' }}>
                        <CabinetSVG visualState={getCabinetState()} />
                        {turboMode && <div className="absolute inset-0 rounded-[2rem] border-[4px] border-yellow-500 opacity-50 shadow-[0_0_30px_gold] animate-pulse pointer-events-none"></div>}
                    </div>

                    <div className="absolute bottom-[5%] right-[-20%] w-[60%] h-[65%] z-20 pointer-events-auto cursor-pointer group" style={{ transform: 'translateZ(30px)' }} onClick={() => {playSound('click'); setCharInteraction("Target acquired.");}}>
                        <CharacterSVG type={'luna'} mood={bonusMode || winTier !== 'NONE' ? 'win' : 'idle'} />
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

                            {winningLines.length > 0 && (
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
                                <button onClick={() => {playSound('click'); setBetIndex(Math.max(0, betIndex - 1))}} className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-white active:bg-cyan-600 active:scale-95 transition-all"><Minus size={14}/></button>
                                <div className="w-16 text-center font-mono font-bold text-yellow-400 text-xs">{currentBet.toLocaleString()}</div>
                                <button onClick={() => {playSound('click'); setBetIndex(Math.min(BET_AMOUNTS.length - 1, betIndex + 1))}} className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-white active:bg-cyan-600 active:scale-95 transition-all"><Plus size={14}/></button>
                            </div>
                            
                            <button 
                                onClick={() => {playSound('click'); setBetIndex(BET_AMOUNTS.length - 1)}} 
                                disabled={isCurrentlySpinning}
                                className={`absolute left-[2%] top-[60%] w-[100px] h-8 bg-orange-700 rounded-lg border-b-4 border-black text-[10px] font-black text-white flex items-center justify-center transition-all shadow-md ${isCurrentlySpinning ? 'opacity-50 cursor-not-allowed border-b-0 translate-y-1' : 'active:translate-y-1 active:border-b-0'}`}
                            >
                                MAX BET
                            </button>

                            {/* Center Controls: Hide manual stop buttons when NOT spinning */}
                            <div className={`absolute left-[31%] top-[25%] flex gap-[10%] w-[38%] justify-between z-50 transition-opacity duration-300 ${isCurrentlySpinning ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                {[0, 1, 2].map((idx) => {
                                    return (
                                        <button key={idx} onClick={() => handleStopReel(idx)} disabled={!isSpinning[idx] || autoPlay} className={`relative w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all shadow-xl touch-manipulation ${isSpinning[idx] && !autoPlay ? 'bg-red-600 border-red-400 text-white cursor-pointer shadow-[0_0_20px_red] hover:bg-red-500' : 'bg-black/50 border-gray-800 text-gray-700 cursor-default opacity-40'} scale-100`}>
                                            <StopCircle size={20} fill={isSpinning[idx] ? "currentColor" : "none"}/>
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
                                <button onClick={() => {playSound('click'); setTurboMode(!turboMode)}} className={`w-10 h-10 rounded-lg border-b-4 flex items-center justify-center transition-all active:translate-y-1 active:border-b-0 ${turboMode ? 'bg-yellow-500 text-black border-yellow-800 shadow-[0_0_15px_gold]' : 'bg-gray-800 text-gray-400 border-gray-950 shadow-md'}`}><Zap size={18} fill={turboMode ? "currentColor" : "none"}/></button>
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
                                            <div className="w-10 h-10 p-1 bg-black rounded shadow-inner"><SymbolSVG id={item.id} /></div>
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
                {winStage === 'celebrating' && (
                    <motion.div initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} animate={{ opacity: 1, backdropFilter: 'blur(10px)' }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                        {(winTier === 'EPIC' || isJackpot) && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-30 mix-blend-color-dodge animate-pulse hue-rotate-90"></div>}
                        <motion.div initial={{ scale: 0.5, y: 100 }} animate={{ scale: (winTier === 'EPIC' || isJackpot) ? 1.2 : 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 15 } }} className="relative z-10 flex flex-col items-center">
                            <GlassCard className={`p-10 text-center flex flex-col items-center border-t-8 border-b-8 ${isJackpot ? 'border-yellow-400 shadow-[0_0_150px_gold]' : 'border-cyan-400'}`}>
                                {isJackpot ? <h1 className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-orange-500 to-red-600 drop-shadow-2xl mb-4 animate-pulse">GRAND JACKPOT</h1> : 
                                 winTier === 'EPIC' ? <h1 className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-purple-200 to-pink-600 drop-shadow-2xl mb-4 animate-pulse">EPIC WIN</h1> : 
                                 winTier === 'MEGA' ? <h1 className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 to-blue-600 drop-shadow-lg mb-4">MEGA WIN</h1> : null}
                                <div className="text-6xl font-mono font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] mt-6 bg-black/50 px-6 py-2 rounded-2xl border border-white/20">
                                    +{(lastWin).toLocaleString()}
                                </div>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default PlayView;