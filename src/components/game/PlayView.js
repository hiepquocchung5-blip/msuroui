import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Settings, Minus, Plus, Zap, StopCircle, Gamepad2, Sparkles, Gift, Info, Volume2, VolumeX, Repeat, Coins, LogOut, Trophy, Lock, Flame, MessageCircle, Shield, Sword, Circle, Square, Leaf, Waves, Sun, CloudRain, Cpu, Terminal, Palmtree, Eye, EyeOff, Moon } from 'lucide-react';
import CabinetSVG from '../visuals/CabinetSVG';
import CharacterSVG from '../visuals/CharacterSVG';
import SymbolSVG from '../visuals/SymbolSVG';
import IslandLandscapeSVG from '../visuals/IslandLandscapeSVG';
import GlassCard from '../ui/GlassCard';
import GlobalTicker from '../ui/GlobalTicker';
import ActiveEvents from '../ui/ActiveEvents';
import { useSlotMachine } from '../../hooks/useSlotMachine';
import { useGameSound } from '../../hooks/useGameSound';
import { game as gameApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

// --- PAYTABLE DEFINITION ---
const PAYTABLE_MAP = {
    1: { name: 'GRAND JACKPOT', mult: 50, color: 'text-yellow-400', glow: 'shadow-[0_0_40px_gold]' },
    2: { name: 'HIGH TIER', mult: 20, color: 'text-red-400', glow: 'shadow-[0_0_30px_red]' },
    3: { name: 'MID TIER', mult: 10, color: 'text-cyan-400', glow: 'shadow-[0_0_30px_cyan]' },
    4: { name: 'BELL WIN', mult: 5, color: 'text-white', glow: 'shadow-[0_0_20px_white]' },
    5: { name: 'WATERMELON', mult: 1, color: 'text-green-400', glow: 'shadow-[0_0_20px_green]' },
    6: { name: 'CHERRY', mult: 0.1, color: 'text-pink-400', glow: 'shadow-[0_0_15px_pink]' },
    7: { name: 'MICRO HIT', mult: 0.01, color: 'text-gray-400', glow: 'shadow-[0_0_10px_gray]' }
};

// Backend Paylines matching to extract the winning symbol
const PAYLINES = [
    [0, 1, 2], // Top Row
    [3, 4, 5], // Mid Row
    [6, 7, 8], // Bot Row
    [0, 4, 8], // Diag \
    [6, 4, 2]  // Diag /
];

const PlayView = ({ machine, island, user, onLeave, updateBalance }) => {
    const slotLogic = useSlotMachine(machine.id, island.id);
    const { addToast } = useToast();
    const { 
        reels, winningLines, isSpinning, isTeaser, lastWin, mysteryItem, 
        autoPlay, spin, stopReel, setAutoPlay, setLastWin, 
        turboMode, setTurboMode, 
        expandedReels, lockedReels, avalancheTriggered 
    } = slotLogic;
    
    const [betIndex, setBetIndex] = useState(0);
    const [winStage, setWinStage] = useState('idle');
    const [gamblePending, setGamblePending] = useState(false);
    const [gambleLost, setGambleLost] = useState(false);
    const [charInteraction, setCharInteraction] = useState(null);
    const [gambleFeedback, setGambleFeedback] = useState(null); 
    
    const [showPaytable, setShowPaytable] = useState(false);
    const [showSettings, setShowSettings] = useState(false); 
    const [showLowBalance, setShowLowBalance] = useState(false); 
    const [isMuted, setIsMuted] = useState(false);
    const [coins, setCoins] = useState([]); 
    
    const { playSound } = useGameSound(!isMuted);
    const BET_AMOUNTS = [200, 500, 1000, 2000, 5000, 10000, 50000];
    const currentBet = BET_AMOUNTS[betIndex];

    const getCabinetState = () => {
        if (winStage === 'celebrating') return 'JACKPOT_HOT'; 
        if (isSpinning.some(s => s)) return 'BUSY';
        if (winStage === 'gambling') return 'BUSY';
        return 'FREE';
    };
    
    const getMood = () => {
        if (gambleLost) return 'sad'; 
        if (winStage === 'celebrating' || (winStage === 'gambling' && !gamblePending)) return 'win';
        return 'idle';
    };

    // Extract Win Details
    const getWinDetails = () => {
        if (!winningLines || winningLines.length === 0) return null;
        // Get the first winning line's first symbol index to determine the matched symbol
        const firstWinningLineIndex = winningLines[0];
        const symbolPosition = PAYLINES[firstWinningLineIndex][0];
        const symbolId = reels[symbolPosition];
        return { symbolId, ...PAYTABLE_MAP[symbolId] };
    };

    useEffect(() => {
        if (lastWin > 0) {
            if (winStage === 'idle') {
                const isBigWin = lastWin > currentBet * 10;
                playSound(isBigWin ? 'bigwin' : 'win');
                if (navigator.vibrate) navigator.vibrate(isBigWin ? [200, 100, 200] : 100);
                if (isBigWin) triggerCoinShower();

                if (!autoPlay) {
                    setWinStage('celebrating');
                    setGambleLost(false);
                    // Extend celebration slightly for bigger wins before gambling
                    setTimeout(() => setWinStage('gambling'), isBigWin ? 3000 : 2000);
                }
            }
        } else {
             if (winStage !== 'gambling' && winStage !== 'celebrating') setWinStage('idle');
        }
    }, [lastWin, autoPlay, currentBet, playSound]);

    const triggerCoinShower = () => {
        const newParticles = Array.from({length: 50}).map((_, i) => ({
            id: Date.now() + i, left: Math.random() * 90 + 5, delay: Math.random() * 2,
            scale: 0.5 + Math.random(), rotation: Math.random() * 360
        }));
        setCoins(newParticles);
        setTimeout(() => setCoins([]), 5000);
    };

    const handleSpin = useCallback(() => {
        if (winStage !== 'idle') return; 
        if (parseFloat(user.balance) < currentBet) {
            setShowLowBalance(true); playSound('stop'); return;
        }
        setGambleLost(false); setCharInteraction(null); setGambleFeedback(null); playSound('spin');
        if (navigator.vibrate) navigator.vibrate(50);
        spin(currentBet);
    }, [user.balance, currentBet, winStage, playSound, spin]);

    const handleStopReel = useCallback((idx) => {
        if (isSpinning[idx]) {
            playSound('click'); 
            if (navigator.vibrate) navigator.vibrate(20);
            stopReel(idx);
        }
    }, [isSpinning, playSound, stopReel]);

    const handleCharacterClick = () => {
        playSound('click');
        const lines = ["Let's win big!", "I'm feeling lucky!", "One more spin?", "You can do it!", "Nice to see you!"];
        setCharInteraction(lines[Math.floor(Math.random() * lines.length)]);
        setTimeout(() => setCharInteraction(null), 3000);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') { e.preventDefault(); if (!isSpinning.some(s=>s) && winStage === 'idle') handleSpin(); }
            if (e.key === '1') handleStopReel(0); if (e.key === '2') handleStopReel(1); if (e.key === '3') handleStopReel(2);
            if (e.code === 'Escape') {
                if (showPaytable) setShowPaytable(false); else if (showSettings) setShowSettings(false);
                else if (winStage === 'gambling') collectWin(); else onLeave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSpinning, showPaytable, showSettings, winStage, handleSpin, handleStopReel, onLeave]);

    const handleGamble = async (choice) => {
        playSound('click'); setGamblePending(true); setGambleFeedback(null);
        try {
            const res = await gameApi.gamble(choice);
            if (res.data.status === 'success') {
                if (res.data.won) {
                    setLastWin(res.data.new_win_amount); 
                    updateBalance(res.data.new_balance);
                    
                    if (res.data.is_critical) {
                        setGambleFeedback('critical');
                        addToast("CRITICAL HIT! 3X MULTIPLIER!", "success");
                        playSound('bigwin');
                        triggerCoinShower();
                    } else {
                        playSound('win');
                    }
                    
                    setWinStage('celebrating'); 
                    setTimeout(() => setWinStage('idle'), 3000);
                } else {
                    setLastWin(res.data.new_win_amount); 
                    updateBalance(res.data.new_balance);
                    
                    if (res.data.is_pity) {
                        setGambleFeedback('pity');
                        addToast("LUCKY SAVE! Retained 50%!", "info");
                        playSound('win'); 
                        setWinStage('idle');
                    } else {
                        playSound('stop'); 
                        setGambleLost(true); 
                        setWinStage('idle');
                        setTimeout(() => setGambleLost(false), 2000);
                    }
                }
            } else { 
                addToast(res.data.error || "Gamble Failed", "error"); 
                setWinStage('idle'); 
            }
        } catch (e) { 
            setWinStage('idle'); 
        } finally { 
            setGamblePending(false); 
        }
    };
    
    const collectWin = () => { playSound('click'); setWinStage('idle'); };
    const changeBet = (delta) => { playSound('click'); setBetIndex(prev => Math.max(0, Math.min(BET_AMOUNTS.length - 1, prev + delta))); };
    const handleMaxBet = () => { playSound('click'); setBetIndex(BET_AMOUNTS.length - 1); };
    const toggleTurbo = () => { playSound('click'); if (setTurboMode) setTurboMode(!turboMode); };
    const toggleAuto = () => { playSound('click'); setAutoPlay(!autoPlay); };
    const toggleMute = () => { const newVal = !isMuted; setIsMuted(newVal); localStorage.setItem('suro_game_muted', newVal); };

    const drawPaylines = () => {
        if (!winningLines || winningLines.length === 0 || winStage === 'gambling') return null;
        const linePaths = {
            0: "M 0 16.6% L 100% 16.6%",  // Top Row
            1: "M 0 50% L 100% 50%",      // Middle Row
            2: "M 0 83.3% L 100% 83.3%",  // Bottom Row
            3: "M 0 0 L 100% 100%",       // Diagonal 1 (\)
            4: "M 0 100% L 100% 0"        // Diagonal 2 (/)
        };

        return (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-40" preserveAspectRatio="none">
                <defs><filter id="neonLine"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                {winningLines.map(lineIdx => (
                    <path key={lineIdx} d={linePaths[lineIdx]} stroke="#00f3ff" strokeWidth="4" fill="none" filter="url(#neonLine)" className="animate-pulse drop-shadow-[0_0_15px_rgba(0,243,255,1)]" />
                ))}
            </svg>
        );
    };

    const columns = [ [0, 3, 6], [1, 4, 7], [2, 5, 8] ];
    const winDetails = getWinDetails();

    const renderGambleContent = () => {
        const btnClass = "h-20 sm:h-24 rounded-2xl border-4 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all group relative overflow-hidden";
        
        switch(island.id) {
            case 1: return (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => handleGamble('red')} disabled={gamblePending} className={`${btnClass} bg-green-900 border-green-500`}><Circle size={32} className="text-white mb-1 group-hover:scale-110"/><span className="text-white font-black text-xs">YIN</span></button>
                    <button onClick={() => handleGamble('black')} disabled={gamblePending} className={`${btnClass} bg-gray-800 border-gray-500`}><Square size={32} className="text-white mb-1 group-hover:scale-110"/><span className="text-white font-black text-xs">YANG</span></button>
                </div>
            );
            case 3: return (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => handleGamble('red')} disabled={gamblePending} className={`${btnClass} bg-gradient-to-br from-orange-600 to-red-900 border-orange-400`}><Flame size={32} className="text-yellow-300 animate-pulse mb-1 group-hover:scale-125 transition-transform" /><span className="text-white font-black text-xs z-10">BLOCK FIRE</span></button>
                    <button onClick={() => handleGamble('black')} disabled={gamblePending} className={`${btnClass} bg-gradient-to-br from-gray-700 to-gray-900 border-gray-500`}><Shield size={32} className="text-gray-300 mb-1 group-hover:scale-125 transition-transform" /><span className="text-white font-black text-xs z-10">DEFEND</span></button>
                </div>
            );
            case 8: return (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => handleGamble('red')} disabled={gamblePending} className={`${btnClass} bg-black border-green-500`}><Cpu size={32} className="text-green-500 mb-1 group-hover:scale-110 transition-transform"/><span className="text-green-500 font-mono font-bold text-xs">OVERCLOCK</span></button>
                    <button onClick={() => handleGamble('black')} disabled={gamblePending} className={`${btnClass} bg-black border-red-500`}><Terminal size={32} className="text-red-500 mb-1 group-hover:scale-110 transition-transform"/><span className="text-red-500 font-mono font-bold text-xs">HACK</span></button>
                </div>
            );
            default: return (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => handleGamble('red')} disabled={gamblePending} className={`${btnClass} bg-gradient-to-br from-red-600 to-red-900 border-red-400`}>
                        <div className="w-8 h-12 sm:w-10 sm:h-14 bg-white rounded flex items-center justify-center text-red-600 font-bold border border-gray-300 shadow-sm mb-1 group-hover:-translate-y-1 transition-transform">♥</div>
                        <span className="text-white font-black text-xs">RED</span>
                    </button>
                    <button onClick={() => handleGamble('black')} disabled={gamblePending} className={`${btnClass} bg-gradient-to-br from-gray-800 to-black border-gray-600`}>
                        <div className="w-8 h-12 sm:w-10 sm:h-14 bg-white rounded flex items-center justify-center text-black font-bold border border-gray-300 shadow-sm mb-1 group-hover:-translate-y-1 transition-transform">♠</div>
                        <span className="text-white font-black text-xs">BLACK</span>
                    </button>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-black relative flex flex-col overflow-hidden" style={{ imageRendering: 'crisp-edges' }}>
            
            {/* BACKGROUND */}
            <div className="absolute inset-0 z-0 overflow-hidden transition-opacity duration-1000" style={{ opacity: winStage === 'celebrating' ? 0.3 : 1 }}>
                <div className="absolute inset-0 scale-110 opacity-70"><IslandLandscapeSVG islandId={island.id} /></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black pointer-events-none"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] pointer-events-none"></div>
            </div>

            <GlobalTicker />
            <ActiveEvents />

            {/* HUD */}
            <div className="absolute top-8 w-full p-4 flex justify-between items-center z-40 pointer-events-none safe-area-top">
                <button onClick={onLeave} className="pointer-events-auto w-10 h-10 bg-white/10 rounded-full text-white backdrop-blur flex items-center justify-center border border-white/20 hover:bg-white/20 active:scale-95 transition-transform shadow-lg"><ChevronLeft/></button>
                <div className="pointer-events-auto bg-black/60 px-4 sm:px-5 py-2 rounded-full border border-yellow-500/50 flex items-center gap-2 sm:gap-3 shadow-[0_0_20px_rgba(234,179,8,0.3)] backdrop-blur-md">
                    <div className="text-[10px] text-yellow-500 font-bold tracking-widest hidden md:block">CREDIT</div>
                    <span className="text-yellow-400 font-mono font-black text-base sm:text-lg">{user.balance.toLocaleString()}</span>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                     <button onClick={() => setShowPaytable(true)} className="w-10 h-10 bg-white/10 rounded-full text-white backdrop-blur flex items-center justify-center border border-white/20 hover:bg-white/20 active:scale-95"><Info size={20}/></button>
                     <button onClick={() => setShowSettings(true)} className="w-10 h-10 bg-white/10 rounded-full text-white backdrop-blur flex items-center justify-center border border-white/20 hover:bg-white/20 active:scale-95">
                        <Settings size={20} />
                     </button>
                </div>
            </div>

            {/* MAIN STAGE CONTAINER */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full h-full overflow-hidden px-2 pt-16 pb-6">
                
                {/* Responsive Fixed-Ratio Wrapper */}
                <div className="relative flex items-center justify-center w-full max-w-[400px] sm:max-w-[450px] aspect-[0.6] max-h-[80vh]">
                    
                    {/* 1. CABINET */}
                    <div className="absolute inset-0 z-10 w-full h-full">
                        <CabinetSVG 
                            islandId={parseInt(island.id)} 
                            mode="game" 
                            charId={island.hostess_char_id} 
                            stats={{laps: machine.total_laps, wins: machine.total_payout}} 
                            machineNumber={machine.machine_number}
                            serialNumber={machine.serial_number}
                            visualState={getCabinetState()}
                        />
                    </div>

                    {/* 2. CHARACTER */}
                    <div 
                        className="absolute bottom-[5%] right-[-25%] sm:right-[-35%] w-[60%] sm:w-[65%] h-[60%] sm:h-[70%] z-20 pointer-events-auto cursor-pointer transition-transform duration-500 hover:scale-105 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" 
                        onClick={handleCharacterClick}
                        style={{ transform: (winStage !== 'idle' && !gambleLost) ? 'scale(1.1) translateY(-10px)' : 'scale(1)' }}
                    >
                        <CharacterSVG type={user.active_pet_id} mood={getMood()} />
                        {charInteraction && (
                            <div className="absolute top-10 -left-10 bg-white text-black p-2 sm:p-3 rounded-xl rounded-br-none shadow-xl animate-in zoom-in duration-300 z-50">
                                <p className="font-bold text-[10px] sm:text-xs flex items-center gap-1"><MessageCircle size={12}/> {charInteraction}</p>
                            </div>
                        )}
                        {mysteryItem && (
                            <div className="absolute top-0 left-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 sm:p-3 rounded-xl animate-bounce shadow-2xl z-50 border border-white">
                                <div className="flex items-center gap-1 sm:gap-2"><Gift size={16} className="text-yellow-300"/> <span className="font-bold text-[10px] sm:text-xs">{mysteryItem.message}</span></div>
                            </div>
                        )}
                        {gambleLost && (
                            <div className="absolute top-[20%] left-[-20px] bg-white text-black font-black px-4 sm:px-6 py-2 sm:py-3 rounded-full rounded-bl-none animate-bounce z-50 shadow-[0_0_15px_red] border-2 border-red-600 text-base sm:text-xl transform -rotate-12">
                                LOST!
                            </div>
                        )}
                        {gambleFeedback === 'pity' && (
                            <div className="absolute top-[30%] left-[-30px] bg-white text-blue-600 font-black px-4 py-2 rounded-full rounded-bl-none animate-bounce z-50 shadow-[0_0_15px_blue] border-2 border-blue-500 text-xs sm:text-sm transform rotate-6">
                                SAVED 50%!
                            </div>
                        )}
                    </div>

                    {/* 3. SCREEN CONTENT LAYER */}
                    <div className="absolute top-[21.25%] left-[16.67%] w-[66.67%] h-[28.75%] flex flex-col pointer-events-none z-20">
                        {/* Win Marquee */}
                        <div className={`bg-black/90 h-[15%] flex items-center justify-center overflow-hidden mb-[1%] shadow-inner ${isTeaser ? 'border-t-2 border-red-500' : ''}`}>
                            <p className="font-mono text-[10px] sm:text-[12px] text-cyan-400 font-bold tracking-widest animate-marquee whitespace-nowrap">
                                {lastWin > 0 ? `*** WIN ${lastWin.toLocaleString()} ***` : (isTeaser ? 'NEAR MISS...' : 'INSERT COIN')}
                            </p>
                        </div>
                        {/* Reels Container */}
                        <div className="flex-1 flex gap-[2%] bg-[#0a0a0a] p-[2%] relative shadow-[inset_0_0_20px_black] rounded-sm">
                            {columns.map((colIndices, colIdx) => (
                                <div key={colIdx} className={`flex-1 flex flex-col gap-[2%] relative h-full bg-gradient-to-b from-[#111] via-[#222] to-[#111] border-x border-black/50 ${lockedReels && lockedReels[colIdx] ? 'border-2 border-yellow-400 shadow-[inset_0_0_10px_gold]' : ''}`}>
                                    {lockedReels && lockedReels[colIdx] && <div className="absolute inset-0 bg-yellow-400/20 z-30 animate-pulse flex items-center justify-center"><Lock size={12} className="text-yellow-400"/></div>}
                                    {expandedReels && expandedReels[colIdx] && <div className="absolute inset-0 bg-red-600/80 z-40 flex items-center justify-center animate-in fade-in"><Flame size={24} className="text-white animate-bounce"/></div>}
                                    
                                    {colIndices.map((symIndex) => (
                                        <div key={symIndex} className="flex-1 relative flex items-center justify-center w-full">
                                            <div className={`w-[85%] aspect-square flex items-center justify-center ${isSpinning[colIdx] ? 'blur-[4px] animate-[spin_0.1s_linear_infinite]' : ''} ${avalancheTriggered && !isSpinning[colIdx] ? 'animate-ping' : ''}`}>
                                                <SymbolSVG id={reels[symIndex]} isWinning={winningLines.length > 0 && winningLines.some(lId => [0,1,2,3,4].includes(lId))} />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-20 pointer-events-none"></div>
                                </div>
                            ))}
                            {drawPaylines()}
                        </div>
                    </div>

                    {/* 4. BUTTON DECK & STOP BUTTONS (Interactive Layer) */}
                    <div className="absolute top-[57.5%] left-[5%] w-[90%] h-[15%] z-50 pointer-events-auto touch-manipulation" style={{ perspective: '600px' }}>
                        <div className="w-full h-full relative" style={{ transform: 'rotateX(20deg)', transformOrigin: 'top center' }}>
                            
                            {/* Left: Bet Config */}
                            <div className="absolute left-[2%] top-[10%] flex gap-1">
                                <button onClick={() => changeBet(-1)} className="w-7 h-7 sm:w-10 sm:h-10 bg-gray-800 rounded-lg border-b-4 border-black text-white flex items-center justify-center active:border-b-0 active:translate-y-1 shadow-lg touch-manipulation active:bg-gray-700"><Minus size={14}/></button>
                                <div className="bg-black border border-gray-600 w-12 h-7 sm:w-16 sm:h-10 flex items-center justify-center text-[9px] sm:text-xs text-yellow-400 font-mono tracking-tighter shadow-inner select-none">{currentBet.toLocaleString()}</div>
                                <button onClick={() => changeBet(1)} className="w-7 h-7 sm:w-10 sm:h-10 bg-gray-800 rounded-lg border-b-4 border-black text-white flex items-center justify-center active:border-b-0 active:translate-y-1 shadow-lg touch-manipulation active:bg-gray-700"><Plus size={14}/></button>
                            </div>
                            
                            <button onClick={handleMaxBet} className="absolute left-[2%] top-[60%] w-10 h-6 sm:w-16 sm:h-8 bg-orange-700 rounded border-b-4 border-black text-[8px] font-black text-white flex items-center justify-center active:border-b-0 active:translate-y-1 shadow-lg touch-manipulation active:bg-orange-600">MAX</button>

                            {/* Center: STOP BUTTONS */}
                            <div className="absolute left-[31%] top-[25%] flex gap-[10%] w-[38%] justify-between z-50">
                                {[0, 1, 2].map((idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleStopReel(idx)}
                                        disabled={!isSpinning[idx]}
                                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all active:scale-95 touch-manipulation shadow-md
                                        ${isSpinning[idx] 
                                            ? 'bg-red-600 border-red-400 text-white animate-pulse cursor-pointer hover:bg-red-500 shadow-red-500/50' 
                                            : 'bg-black/50 border-gray-800 text-gray-700 cursor-default opacity-30'}`}
                                    >
                                        <StopCircle size={18} fill={isSpinning[idx] ? "currentColor" : "none"}/>
                                    </button>
                                ))}
                            </div>

                            {/* Right: SPIN Button */}
                            <button 
                                onClick={handleSpin} 
                                disabled={isSpinning.some(s=>s) || (winStage !== 'idle' && winStage !== 'celebrating')} 
                                className={`absolute right-[2%] top-[5%] w-16 h-16 sm:w-20 sm:h-20 rounded-full border-b-[6px] shadow-xl flex flex-col items-center justify-center active:border-b-0 active:translate-y-1 transition-all touch-manipulation
                                ${isSpinning.some(s=>s) ? 'bg-gray-800 border-gray-950 opacity-50' : 'bg-gradient-to-b from-red-600 to-red-800 border-red-950 text-white hover:brightness-110 hover:shadow-red-500/80 active:bg-red-700'}`}
                            >
                                <Gamepad2 size={24} strokeWidth={3} className="text-white"/>
                                <span className="text-[8px] font-black tracking-widest text-white mt-0.5 select-none">SPIN</span>
                            </button>

                            {/* Center-Right: Toggles */}
                            <div className="absolute right-[30%] top-[15%] flex flex-col gap-2">
                                <button onClick={toggleTurbo} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-b-4 border-black flex items-center justify-center active:border-b-0 active:translate-y-1 shadow-md touch-manipulation ${turboMode ? 'bg-yellow-500 text-black shadow-[0_0_10px_gold]' : 'bg-gray-700 text-gray-400'}`}><Zap size={14} fill={turboMode ? "currentColor" : "none"}/></button>
                                <button onClick={toggleAuto} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-b-4 border-black flex items-center justify-center active:border-b-0 active:translate-y-1 shadow-md touch-manipulation ${autoPlay ? 'bg-green-600 text-white shadow-[0_0_10px_green]' : 'bg-gray-700 text-gray-400'}`}>{autoPlay ? <StopCircle size={14}/> : <Repeat size={14}/>}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COIN VFX */}
            {coins.map(c => (
                <div key={c.id} className="absolute top-[-20px] animate-fall z-50 pointer-events-none" style={{ left: `${c.left}%`, animationDuration: '2.5s', animationDelay: `${c.delay}s`, transform: `scale(${c.scale}) rotate(${c.rotation}deg)` }}>
                    <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-200 shadow-lg flex items-center justify-center font-black text-yellow-700 text-xs"><Coins size={10} strokeWidth={3}/></div>
                </div>
            ))}

            {/* --- MODALS & OVERLAYS --- */}

            {/* NEW: DETAILED WIN PRESENTATION OVERLAY */}
            {winStage === 'celebrating' && winDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"></div>
                    
                    <div className="relative z-10 flex flex-col items-center animate-in zoom-in-50 duration-500 delay-100 ease-out">
                        {/* Sunburst background effect */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] sm:w-[100vw] sm:h-[100vw] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_60%)] animate-[spin_10s_linear_infinite] pointer-events-none"></div>

                        <GlassCard className={`p-8 text-center flex flex-col items-center border-t-4 border-b-4 ${winDetails.color.replace('text-', 'border-')} ${winDetails.glow}`}>
                            <div className="text-[10px] font-bold text-white tracking-[0.3em] uppercase opacity-80 mb-2">WINNING COMBO</div>
                            
                            {/* Giant Symbol Render */}
                            <div className="w-24 h-24 sm:w-32 sm:h-32 mb-4 animate-bounce">
                                <SymbolSVG id={winDetails.symbolId} islandId={parseInt(island.id)} isWinning={true} />
                            </div>

                            <h2 className={`text-4xl sm:text-5xl font-black italic tracking-tighter uppercase drop-shadow-lg ${winDetails.color}`}>
                                {winDetails.name}
                            </h2>
                            
                            <div className="flex items-center gap-3 my-4">
                                <div className="h-[1px] w-12 bg-white/20"></div>
                                <span className="bg-white text-black font-black px-3 py-1 rounded-lg text-sm shadow-md">
                                    {winDetails.mult}x MULTIPLIER
                                </span>
                                <div className="h-[1px] w-12 bg-white/20"></div>
                            </div>

                            <div className="text-5xl sm:text-6xl font-mono font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                                +{lastWin.toLocaleString()}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* GAMBLE MODAL */}
            {winStage === 'gambling' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in zoom-in-95">
                    <GlassCard className={`w-full max-w-sm p-6 text-center border-t-4 shadow-2xl ${gambleFeedback === 'critical' ? 'border-yellow-400 shadow-yellow-500/50' : 'border-cyan-500/50 shadow-cyan-500/20'}`}>
                        {gambleFeedback === 'critical' && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black font-black text-xs px-3 py-1 rounded-full animate-bounce">CRITICAL MULTIPLIER!</div>}
                        
                        <h2 className="text-3xl font-black text-white mb-2 italic tracking-widest drop-shadow-md">DOUBLE UP?</h2>
                        <div className="flex justify-between text-xs font-mono text-gray-400 mb-6 bg-black/50 p-2 rounded-xl border border-white/10">
                            <span>RISK: <b className="text-white">{lastWin.toLocaleString()}</b></span>
                            <span className="text-green-400">WIN: <b className="text-lg">{(lastWin*2).toLocaleString()}</b> <span className="text-[10px] text-yellow-500">or 3x!</span></span>
                        </div>
                        
                        {renderGambleContent()}

                        <button onClick={collectWin} className="text-gray-400 hover:text-white text-xs font-bold underline transition-colors">COLLECT WIN</button>
                    </GlassCard>
                </div>
            )}
            
            {showSettings && (
                <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6" onClick={() => setShowSettings(false)}>
                    <GlassCard className="w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white font-bold mb-4 border-b border-white/10 pb-2">SETTINGS</h3>
                        <button onClick={toggleMute} className="w-full bg-white/10 p-3 rounded-xl flex justify-between mb-2"><span>Sound</span> {isMuted ? <VolumeX/> : <Volume2 className="text-cyan-400"/>}</button>
                        <button onClick={onLeave} className="w-full bg-red-900/30 text-red-400 p-3 rounded-xl flex justify-between hover:bg-red-900/50"><span>Leave Game</span> <LogOut/></button>
                    </GlassCard>
                </div>
            )}
            
            {showPaytable && (
                <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6" onClick={() => setShowPaytable(false)}>
                     <div className="text-white font-bold text-xl mb-4">PAYTABLE</div>
                     <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                         <div className="bg-white/10 p-2 rounded flex items-center gap-2"><SymbolSVG id={1} /> <span className="text-yellow-400 font-bold font-mono">50x</span></div>
                         <div className="bg-white/10 p-2 rounded flex items-center gap-2"><SymbolSVG id={2} /> <span className="text-red-400 font-bold font-mono">20x</span></div>
                         <div className="bg-white/10 p-2 rounded flex items-center gap-2"><SymbolSVG id={3} /> <span className="text-cyan-400 font-bold font-mono">10x</span></div>
                         <div className="bg-white/10 p-2 rounded flex items-center gap-2"><SymbolSVG id={4} /> <span className="text-white font-bold font-mono">5x</span></div>
                         <div className="bg-white/10 p-2 rounded flex items-center gap-2"><SymbolSVG id={5} /> <span className="text-white font-bold font-mono">1x</span></div>
                         <div className="bg-white/10 p-2 rounded flex items-center gap-2"><SymbolSVG id={6} /> <span className="text-white font-bold font-mono">0.1x</span></div>
                         <div className="bg-white/10 p-2 rounded flex justify-center items-center gap-2 col-span-2"><SymbolSVG id={7} /> <span className="text-gray-400 font-bold font-mono">0.01x (Micro Hit)</span></div>
                     </div>
                     <div className="mt-8 text-gray-500 text-xs animate-pulse">Tap anywhere to close</div>
                </div>
            )}

            {showLowBalance && (
                <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6">
                    <GlassCard className="text-center p-6 border-red-500/50">
                        <Coins className="w-12 h-12 text-red-500 mx-auto mb-2"/>
                        <h2 className="text-xl font-bold text-white mb-4">LOW BALANCE</h2>
                        <button onClick={() => window.location.href='/wallet'} className="w-full bg-cyan-600 py-3 rounded-xl font-bold text-white shadow-lg shadow-cyan-900/50">DEPOSIT NOW</button>
                        <button onClick={() => setShowLowBalance(false)} className="mt-4 text-gray-500 text-xs underline">Cancel</button>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default PlayView;