import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, Settings, Minus, Plus, Zap, StopCircle, Gamepad2, Sparkles, Gift, Info, Volume2, VolumeX, Repeat, Coins, LogOut, Trophy, Lock, Flame, MessageCircle, Shield, Sword, Circle, Square, Waves, Sun, CloudRain, Cpu, Terminal, Palmtree, Eye, EyeOff, Moon, Ghost } from 'lucide-react';
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

// --- PAYTABLE & GAME CONFIGURATION ---
const PAYTABLE_DATA = [
    { id: 1, name: 'BIG BONUS (AT)', mult: 'SPECIAL', color: 'text-yellow-400', glow: 'shadow-[0_0_40px_gold]' },
    { id: 2, name: 'CHARACTER', mult: 20, color: 'text-purple-400', glow: 'shadow-[0_0_30px_purple]' },
    { id: 3, name: 'BAR', mult: 10, color: 'text-red-400', glow: 'shadow-[0_0_30px_red]' },
    { id: 4, name: 'BELL (KOYAKU)', mult: 10, color: 'text-yellow-200', glow: 'shadow-[0_0_20px_yellow]' },
    { id: 5, name: 'MELON (KOYAKU)', mult: 15, color: 'text-green-400', glow: 'shadow-[0_0_20px_green]' },
    { id: 6, name: 'CHERRY (L-REEL)', mult: 2, color: 'text-pink-400', glow: 'shadow-[0_0_15px_pink]' },
    { id: 7, name: 'REPLAY', mult: 'FREE SPIN', color: 'text-cyan-400', glow: 'shadow-[0_0_15px_cyan]' }
];

const PAYLINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [6, 4, 2]];
const BET_AMOUNTS = [80, 200, 500, 1000, 5000, 10000, 50000, 100000, 250000, 500000];

const getGambleTheme = (islandId) => {
    const themes = {
        1: { rIcon: Circle, bIcon: Square, rLabel: 'YIN', bLabel: 'YANG', rBg: 'bg-green-900 border-green-500', bBg: 'bg-gray-800 border-gray-500', rTxt: 'text-white', bTxt: 'text-white' },
        2: { rIcon: Gamepad2, bIcon: Ghost, rLabel: 'PLAYER 1', bLabel: 'PLAYER 2', rBg: 'bg-red-600 border-red-400', bBg: 'bg-blue-600 border-blue-400', rTxt: 'text-white', bTxt: 'text-white' },
        3: { rIcon: Sword, bIcon: Shield, rLabel: 'ATTACK', bLabel: 'DEFEND', rBg: 'bg-orange-900 border-orange-500', bBg: 'bg-gray-800 border-gray-500', rTxt: 'text-white', bTxt: 'text-white' },
        4: { rIcon: Sun, bIcon: Moon, rLabel: 'DAY', bLabel: 'NIGHT', rBg: 'bg-pink-600 border-pink-400', bBg: 'bg-purple-900 border-purple-500', rTxt: 'text-yellow-200', bTxt: 'text-white' },
        5: { rIcon: Flame, bIcon: Ghost, rLabel: 'SOUL FIRE', bLabel: 'SPIRIT', rBg: 'bg-indigo-900 border-indigo-500', bBg: 'bg-gray-900 border-gray-600', rTxt: 'text-blue-300', bTxt: 'text-white' },
        6: { rIcon: Flame, bIcon: Waves, rLabel: 'HOT', bLabel: 'COLD', rBg: 'bg-red-700 border-red-400', bBg: 'bg-cyan-700 border-cyan-400', rTxt: 'text-white', bTxt: 'text-white' },
        7: { rIcon: Sun, bIcon: CloudRain, rLabel: 'SUN', bLabel: 'RAIN', rBg: 'bg-yellow-600 border-yellow-400', bBg: 'bg-blue-600 border-blue-400', rTxt: 'text-white', bTxt: 'text-white' },
        8: { rIcon: Cpu, bIcon: Terminal, rLabel: 'OVERCLOCK', bLabel: 'HACK', rBg: 'bg-black border-green-500', bBg: 'bg-black border-red-500', rTxt: 'text-green-500', bTxt: 'text-red-500' },
        9: { rIcon: Waves, bIcon: Palmtree, rLabel: 'WAVE', bLabel: 'SAND', rBg: 'bg-cyan-600 border-cyan-400', bBg: 'bg-yellow-600 border-yellow-400', rTxt: 'text-white', bTxt: 'text-white' },
        10: { rIcon: Eye, bIcon: EyeOff, rLabel: 'SEEN', bLabel: 'HIDDEN', rBg: 'bg-gray-900 border-gray-600', bBg: 'bg-black border-gray-800', rTxt: 'text-white', bTxt: 'text-gray-500' },
    };
    return themes[islandId] || themes[1]; 
};

// --- ROLLUP COUNTER COMPONENT ---
const RollupNumber = ({ value, duration = 1500 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;
        const endValue = parseInt(value, 10) || 0;

        if (endValue === 0) {
            setCount(0);
            return;
        }

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            setCount(Math.floor(easeOut * endValue));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(step);
            } else {
                setCount(endValue);
            }
        };

        animationFrame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return <>{count.toLocaleString()}</>;
};

// --- 3D REEL COMPONENT WITH SNAP PHYSICS ---
const ReelColumn = ({ isSpinning, finalSymbols, locked, expanded, avalanche, islandId, isWinning, isTeaser }) => {
    const spinStrip = useMemo(() => {
        const randomFill = Array.from({length: 12}, () => Math.floor(Math.random() * 7) + 1);
        return [...randomFill, ...finalSymbols];
    }, [isSpinning, finalSymbols]);

    const displaySymbols = isSpinning ? spinStrip : finalSymbols;

    return (
        <div className={`flex-1 flex flex-col relative h-full bg-gradient-to-b from-[#111] via-[#222] to-[#111] border-x border-black/80 rounded-sm overflow-hidden ${locked ? 'border-2 border-yellow-400 shadow-[inset_0_0_10px_gold]' : ''}`}>
            <div className="absolute inset-0 overflow-hidden" style={{ perspective: '800px' }}>
                <div className={`w-full absolute flex flex-col justify-between ${isSpinning ? 'animate-reel-spin blur-[1.5px]' : 'animate-snap'}`} style={{ height: isSpinning ? '500%' : '100%', top: 0, transformStyle: 'preserve-3d', willChange: 'transform' }}>
                    {displaySymbols.map((symId, idx) => (
                        <div key={idx} className="relative flex items-center justify-center w-full" style={{ height: isSpinning ? '6.66%' : '32%' }}>
                            <div className={`w-[85%] aspect-square flex items-center justify-center bg-black/40 border border-white/5 rounded-sm shadow-inner 
                                ${isTeaser && !isSpinning && idx >= displaySymbols.length - 3 && idx === displaySymbols.length - 2 ? 'animate-pulse ring-2 ring-red-500/50' : ''}`}
                            >
                                <SymbolSVG id={symId} isWinning={isWinning && !isSpinning && idx >= displaySymbols.length - 3} islandId={parseInt(islandId)} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black/90 z-20 pointer-events-none shadow-[inset_0_20px_20px_-10px_rgba(0,0,0,0.8),inset_0_-20px_20px_-10px_rgba(0,0,0,0.8)]"></div>
        </div>
    );
};

const PlayView = ({ machine, island, user, onLeave, updateBalance }) => {
    const slotLogic = useSlotMachine(machine.id, island.id);
    const { addToast } = useToast();
    const { 
        reels, winningLines, isSpinning, isTeaser, lastWin, winStreak, mysteryItem, 
        freeSpins, bonusMode, bonusSpinsLeft, atSequence, atCurrentStep,
        showBonusSummary, bonusTotalWin, clearBonusTotal, levelUpData, setLevelUpData, isJackpot, setIsJackpot,
        autoPlay, spin, stopReel, setAutoPlay, setLastWin, 
        turboMode, setTurboMode
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
    const [showCutIn, setShowCutIn] = useState(false); 
    
    const { playSound } = useGameSound(!isMuted);
    const currentBet = BET_AMOUNTS[betIndex];

    const getCabinetState = () => {
        if (bonusMode) return 'JACKPOT_HOT';
        if (isSpinning.some(s => s)) return 'BUSY';
        return 'FREE';
    };
    
    const getMood = () => {
        if (gambleLost) return 'sad'; 
        if (winStage === 'celebrating' || (winStage === 'gambling' && !gamblePending) || bonusMode) return 'win';
        return 'idle';
    };

    const getWinDetails = () => {
        if (!winningLines || winningLines.length === 0) return null;
        const firstWinningLineIndex = winningLines[0];
        if (firstWinningLineIndex === 99) {
            const cherrySymbol = reels[0]; 
            const config = PAYTABLE_DATA.find(p => p.id === cherrySymbol);
            return { symbolId: cherrySymbol, ...config };
        }
        const symbolPosition = PAYLINES[firstWinningLineIndex][0];
        const symbolId = reels[symbolPosition];
        const config = PAYTABLE_DATA.find(p => p.id === symbolId);
        return { symbolId, ...config };
    };

    useEffect(() => {
        if (isTeaser && isSpinning.some(s=>s)) {
            setShowCutIn(true);
            playSound('bigwin'); 
            setTimeout(() => setShowCutIn(false), 1500); 
        }
    }, [isTeaser, isSpinning, playSound]);

    useEffect(() => {
        if (bonusMode && atSequence && atSequence.length > 0 && isSpinning.some(s=>s) && !autoPlay) {
            const nextIdx = atSequence[atCurrentStep];
            if (nextIdx === 0) setCharInteraction("Left!");
            else if (nextIdx === 1) setCharInteraction("Center!");
            else if (nextIdx === 2) setCharInteraction("Right!");
        } else if (!isSpinning.some(s=>s)) {
            setCharInteraction(null);
        }
    }, [atCurrentStep, atSequence, bonusMode, isSpinning, autoPlay]);

    useEffect(() => {
        if (lastWin > 0 && winStage === 'idle') {
            const isBigWin = lastWin > currentBet * 10;
            playSound(isBigWin ? 'bigwin' : 'win');
            if (isBigWin) triggerCoinShower();

            if (!bonusMode && !autoPlay) {
                setWinStage('celebrating');
                // Give enough time for the Rollup animation to complete
                setTimeout(() => setWinStage('gambling'), isBigWin ? 3000 : 2000);
            }
        } else if (lastWin === 0 && winStage !== 'gambling' && winStage !== 'celebrating') {
             setWinStage('idle');
        }
    }, [lastWin, autoPlay, currentBet, playSound, bonusMode, winStage]);

    const triggerCoinShower = () => {
        const newParticles = Array.from({length: 40}).map((_, i) => ({
            id: Date.now() + i, left: Math.random() * 90 + 5, delay: Math.random() * 2,
            scale: 0.5 + Math.random(), rotation: Math.random() * 360
        }));
        setCoins(newParticles);
        setTimeout(() => setCoins([]), 4000);
    };

    // Add back the Character Click Handler
    const handleCharacterClick = useCallback(() => {
        playSound('click');
        const lines = ["Let's win big!", "I'm feeling lucky!", "Watch the Navi markers!", "You can do it!"];
        setCharInteraction(lines[Math.floor(Math.random() * lines.length)]);
        setTimeout(() => setCharInteraction(null), 3000);
    }, [playSound]);

    const handleSpin = useCallback(() => {
        if (winStage !== 'idle' && !bonusMode) return; 
        if (parseFloat(user.balance) < currentBet && freeSpins === 0 && !bonusMode) {
            setShowLowBalance(true); playSound('stop'); return;
        }
        setGambleLost(false); setGambleFeedback(null); playSound('spin');
        spin(currentBet);
    }, [user.balance, currentBet, winStage, playSound, spin, freeSpins, bonusMode]);

    const handleStopReel = useCallback((idx) => {
        if (isSpinning[idx]) {
            if (atSequence && atSequence.length > 0 && atSequence[atCurrentStep] !== idx) {
                return; 
            }
            playSound('click'); 
            if (navigator.vibrate) navigator.vibrate(20);
            stopReel(idx);
        }
    }, [isSpinning, playSound, stopReel, atSequence, atCurrentStep]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') { e.preventDefault(); if (!isSpinning.some(s=>s) && winStage === 'idle') handleSpin(); }
            if (e.key === '1') handleStopReel(0); 
            if (e.key === '2') handleStopReel(1); 
            if (e.key === '3') handleStopReel(2);
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
                    setLastWin(res.data.new_win_amount); updateBalance(res.data.new_balance);
                    if (res.data.is_critical) {
                        setGambleFeedback('critical'); addToast("CRITICAL HIT! 3X MULTIPLIER!", "success");
                        playSound('bigwin'); triggerCoinShower();
                    } else { playSound('win'); }
                    setWinStage('celebrating'); setTimeout(() => setWinStage('idle'), 3000);
                } else {
                    setLastWin(res.data.new_win_amount); updateBalance(res.data.new_balance);
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
    const changeBet = (delta) => { playSound('click'); setBetIndex(prev => Math.max(0, Math.min(BET_AMOUNTS.length - 1, prev + delta))); };
    const handleMaxBet = () => { playSound('click'); setBetIndex(BET_AMOUNTS.length - 1); };
    const toggleTurbo = () => { playSound('click'); if (setTurboMode) setTurboMode(!turboMode); };
    const toggleAuto = () => { playSound('click'); setAutoPlay(!autoPlay); };
    const toggleMute = () => { const newVal = !isMuted; setIsMuted(newVal); localStorage.setItem('suro_game_muted', newVal); };

    const drawPaylines = () => {
        if (!winningLines || winningLines.length === 0 || winStage === 'gambling') return null;
        const linePaths = {
            0: "M 0 16.6% L 100% 16.6%",  1: "M 0 50% L 100% 50%", 2: "M 0 83.3% L 100% 83.3%",  
            3: "M 0 0 L 100% 100%",       4: "M 0 100% L 100% 0"        
        };
        return (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-40" preserveAspectRatio="none">
                <defs><filter id="neonLine"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                {winningLines.map(lineIdx => {
                    if (lineIdx === 99) return null; // Cherry line special case
                    return (
                    <path key={lineIdx} d={linePaths[lineIdx]} stroke="#00f3ff" strokeWidth="4" fill="none" filter="url(#neonLine)" className="animate-pulse drop-shadow-[0_0_15px_rgba(0,243,255,1)]" />
                )})}
            </svg>
        );
    };

    const getWinName = () => {
        if (winningLines.includes(99)) return "CHERRY!";
        if (winningLines.length > 0 && winningLines[0] !== 99) {
            const sym = reels[PAYLINES[winningLines[0]][0]];
            return PAYTABLE_DATA.find(p => p.id === sym)?.name || "WIN!";
        }
        return bonusMode ? "ASSIST TIME" : (freeSpins > 0 ? "FREE SPIN" : "INSERT COIN");
    };

    const columns = [ [0, 3, 6], [1, 4, 7], [2, 5, 8] ];
    const winDetails = getWinDetails();
    const gambleTheme = getGambleTheme(island.id);
    const RedIcon = gambleTheme.rIcon;
    const BlackIcon = gambleTheme.bIcon;

    return (
        <div className={`min-h-screen bg-black relative flex flex-col overflow-hidden transition-colors duration-1000 ${bonusMode ? 'bg-red-950' : ''}`}>
            
            {/* Tech Artist Custom Physics & Effects */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes reel-spin-anim {
                    0% { transform: translateY(0%); }
                    100% { transform: translateY(-80%); }
                }
                .animate-reel-spin {
                    animation: reel-spin-anim 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
                }
                @keyframes snap-bounce {
                    0% { transform: translateY(-10%); }
                    60% { transform: translateY(5%); }
                    100% { transform: translateY(0%); }
                }
                .animate-snap {
                    animation: snap-bounce 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes screen-shake {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(3px, 3px) rotate(1deg); }
                    50% { transform: translate(-3px, -3px) rotate(-1deg); }
                    75% { transform: translate(-3px, 3px) rotate(0deg); }
                }
                .animate-shake {
                    animation: screen-shake 0.4s ease-in-out infinite;
                }
            `}} />

            {/* Backgrounds */}
            <div className="absolute inset-0 z-0 overflow-hidden transition-opacity duration-1000" style={{ opacity: winStage === 'celebrating' ? 0.3 : 1 }}>
                <div className={`absolute inset-0 scale-110 opacity-70 transition-all ${bonusMode ? 'animate-pulse hue-rotate-90 saturate-200' : ''}`}>
                    <IslandLandscapeSVG islandId={island.id} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black pointer-events-none"></div>
                {bonusMode && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-20 mix-blend-color-dodge animate-pulse"></div>}
            </div>

            {/* AT BANNERS */}
            {bonusMode && (
                <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between overflow-hidden">
                    <div className="w-full bg-gradient-to-r from-transparent via-red-600 to-transparent py-1 text-center font-black italic tracking-[1em] text-white animate-marquee shadow-[0_0_30px_red]">
                        {bonusMode === 'BB' ? 'BIG BONUS ACTIVE' : 'REGULAR BONUS ACTIVE'}
                    </div>
                    <div className="w-full bg-gradient-to-r from-transparent via-red-600 to-transparent py-1 text-center font-black italic tracking-[1em] text-white animate-marquee shadow-[0_0_30px_red]" style={{ animationDirection: 'reverse' }}>
                        AT MODE ENABLED
                    </div>
                </div>
            )}

            <GlobalTicker />
            <ActiveEvents />

            {/* HUD */}
            <div className="absolute top-8 w-full p-4 flex justify-between items-center z-40 pointer-events-none safe-area-top">
                <button onClick={onLeave} className="pointer-events-auto w-10 h-10 bg-white/10 rounded-full text-white backdrop-blur flex items-center justify-center border border-white/20 hover:bg-white/20 active:scale-95 transition-transform"><ChevronLeft/></button>
                <div className={`pointer-events-auto px-4 sm:px-5 py-2 rounded-full border flex items-center gap-2 sm:gap-3 backdrop-blur-md transition-all ${bonusMode ? 'bg-red-900/80 border-yellow-400 shadow-[0_0_20px_red]' : 'bg-black/60 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]'}`}>
                    <div className="text-[10px] text-yellow-500 font-bold tracking-widest hidden md:block">CREDIT</div>
                    <span className="text-white font-mono font-black text-base sm:text-lg"><RollupNumber value={user.balance} duration={1000} /></span>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                     <button onClick={() => setShowPaytable(true)} className="w-10 h-10 bg-white/10 rounded-full text-white backdrop-blur flex items-center justify-center border border-white/20"><Info size={20}/></button>
                     <button onClick={() => setShowSettings(true)} className="w-10 h-10 bg-white/10 rounded-full text-white backdrop-blur flex items-center justify-center border border-white/20"><Settings size={20} /></button>
                </div>
            </div>

            {/* MAIN STAGE WITH DYNAMIC SHAKE EFFECTS */}
            <div className={`flex-1 flex flex-col items-center justify-center relative z-10 w-full h-full overflow-hidden px-2 pt-16 pb-6 ${(showCutIn || isJackpot) ? 'animate-shake' : ''}`}>
                <div className="relative flex items-center justify-center w-full max-w-[400px] sm:max-w-[450px] aspect-[0.6] max-h-[80vh] overflow-visible">
                    
                    <div className="absolute inset-0 z-10 w-full h-full">
                        <CabinetSVG islandId={parseInt(island.id)} mode="game" charId={island.hostess_char_id} machine={machine} visualState={getCabinetState()} />
                    </div>

                    <div 
                        className="absolute bottom-[2%] right-[-15%] w-[55%] h-[65%] sm:bottom-[5%] sm:right-[-35%] sm:w-[65%] sm:h-[70%] z-20 pointer-events-auto cursor-pointer transition-transform duration-500 hover:scale-105 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" 
                        onClick={handleCharacterClick}
                        style={{ transform: (winStage !== 'idle' || bonusMode) ? 'scale(1.1) translateY(-10px)' : 'scale(1)' }}
                    >
                        <CharacterSVG type={user.active_pet_id} mood={getMood()} />
                        {charInteraction && <div className="absolute top-10 -left-10 bg-white text-black p-2 sm:p-3 rounded-xl rounded-br-none shadow-xl animate-in zoom-in duration-300 z-50"><p className="font-bold text-[10px] sm:text-xs flex items-center gap-1"><MessageCircle size={12}/> {charInteraction}</p></div>}
                        {gambleLost && <div className="absolute top-[20%] left-[-20px] bg-white text-black font-black px-4 sm:px-6 py-2 sm:py-3 rounded-full rounded-bl-none animate-bounce z-50 shadow-[0_0_15px_red] border-2 border-red-600 text-base sm:text-xl transform -rotate-12">LOST!</div>}
                        {gambleFeedback === 'pity' && <div className="absolute top-[30%] left-[-30px] bg-white text-blue-600 font-black px-4 py-2 rounded-full rounded-bl-none animate-bounce z-50 shadow-[0_0_15px_blue] border-2 border-blue-500 text-xs sm:text-sm transform rotate-6">SAVED 50%!</div>}
                    </div>

                    {/* 3x3 SCREEN CONTENT */}
                    <div className="absolute top-[21.25%] left-[16.67%] w-[66.67%] h-[28.75%] flex flex-col pointer-events-none z-20">
                        <div className={`bg-black/90 h-[15%] flex items-center justify-between px-2 overflow-hidden mb-[1%] shadow-inner ${bonusMode ? 'border-t-2 border-red-500 bg-red-900/50' : ''}`}>
                            <span className={`font-mono text-[9px] sm:text-[11px] font-bold tracking-widest ${bonusMode ? 'text-white' : 'text-cyan-400'}`}>
                                {getWinName()}
                            </span>
                            
                            {/* Win Streak / AT Combo HUD */}
                            <div className="flex items-center gap-1">
                                {winStreak > 1 && (
                                    <span className="font-mono text-[8px] font-black text-orange-400 bg-orange-900/40 px-1 rounded animate-pulse border border-orange-500/50 flex items-center gap-0.5">
                                        <Flame size={8} fill="currentColor"/> {winStreak}x STREAK
                                    </span>
                                )}
                                {(bonusMode || freeSpins > 0) && (
                                    <span className="font-mono text-[9px] font-black text-yellow-400 bg-black/50 px-1 rounded animate-pulse border border-yellow-500/30">
                                        {bonusMode ? `LEFT: ${bonusSpinsLeft}` : `FREE: ${freeSpins}`}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className={`flex-1 flex gap-[1%] p-[1.5%] relative rounded-sm border-2 overflow-hidden ${bonusMode ? 'bg-[#200] border-red-500 shadow-[inset_0_0_30px_red]' : 'bg-[#0a0a0a] border-gray-900 shadow-[inset_0_0_20px_black]'}`}>
                            {columns.map((colIndices, colIdx) => {
                                const finalSymbols = colIndices.map(symIndex => reels[symIndex]);
                                return (
                                    <ReelColumn key={colIdx} isSpinning={isSpinning[colIdx]} finalSymbols={finalSymbols} islandId={island.id} isTeaser={isTeaser}
                                        isWinning={winningLines.length > 0 && winningLines.some(lId => [0,1,2,3,4].includes(lId) || (lId === 99 && colIdx === 0))}
                                    />
                                );
                            })}
                            {drawPaylines()}
                        </div>
                    </div>

                    {/* BUTTON DECK */}
                    <div className="absolute top-[57.5%] left-[5%] w-[90%] h-[15%] z-50 pointer-events-auto touch-manipulation" style={{ perspective: '600px' }}>
                        <div className="w-full h-full relative flex items-center justify-center" style={{ transform: 'rotateX(20deg)', transformOrigin: 'top center' }}>
                            <div className="absolute left-[-2%] sm:left-[2%] top-[10%] flex gap-0.5 sm:gap-1 scale-90 sm:scale-100 origin-left">
                                <button onClick={() => changeBet(-1)} className="w-7 h-7 sm:w-10 sm:h-10 bg-gray-800 rounded-lg border-b-4 border-black text-white flex items-center justify-center active:translate-y-1"><Minus size={14}/></button>
                                <div className="bg-black border border-gray-600 w-12 h-7 sm:w-16 sm:h-10 flex items-center justify-center text-[9px] sm:text-xs text-yellow-400 font-mono tracking-tighter select-none">{currentBet.toLocaleString()}</div>
                                <button onClick={() => changeBet(1)} className="w-7 h-7 sm:w-10 sm:h-10 bg-gray-800 rounded-lg border-b-4 border-black text-white flex items-center justify-center active:translate-y-1"><Plus size={14}/></button>
                            </div>
                            
                            <button onClick={handleMaxBet} className="absolute left-[-2%] sm:left-[2%] top-[60%] w-10 h-6 sm:w-16 sm:h-8 bg-orange-700 rounded border-b-4 border-black text-[8px] font-black text-white flex items-center justify-center active:translate-y-1 scale-90 sm:scale-100 origin-left">MAX</button>

                            {/* STOP BUTTONS w/ NAVI-OSHI Logic */}
                            <div className="absolute left-[26%] sm:left-[31%] top-[25%] flex gap-[8%] sm:gap-[10%] w-[45%] sm:w-[38%] justify-between z-50">
                                {[0, 1, 2].map((idx) => {
                                    const naviOrder = atSequence ? atSequence.indexOf(idx) : -1;
                                    const isCurrentNavi = atSequence && atSequence[atCurrentStep] === idx;
                                    const showNavi = atSequence && atSequence.length > 0 && naviOrder >= atCurrentStep && isSpinning[idx];

                                    return (
                                        <button 
                                            key={idx} 
                                            onClick={() => handleStopReel(idx)}
                                            disabled={!isSpinning[idx]} 
                                            className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all touch-manipulation shadow-md ${isSpinning[idx] ? 'bg-red-600 border-red-400 text-white cursor-pointer shadow-red-500/50' : 'bg-black/50 border-gray-800 text-gray-700 cursor-default opacity-30'} ${isCurrentNavi && !autoPlay ? 'animate-pulse ring-4 ring-yellow-400' : ''}`}
                                        >
                                            <StopCircle size={18} fill={isSpinning[idx] ? "currentColor" : "none"}/>
                                            
                                            {/* NAVI INDICATOR */}
                                            {showNavi && (
                                                <div className={`absolute -top-8 w-8 h-8 rounded-full border-2 font-black text-sm flex items-center justify-center z-50 pointer-events-none transition-all
                                                    ${isCurrentNavi ? 'bg-yellow-400 text-black border-white animate-bounce shadow-[0_0_15px_gold] scale-125' : 'bg-black/90 text-yellow-500 border-yellow-500 opacity-80'}`}>
                                                    {naviOrder + 1}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={handleSpin} 
                                disabled={isSpinning.some(s=>s) || (winStage !== 'idle' && winStage !== 'celebrating') || showBonusSummary} 
                                className={`absolute right-[-2%] sm:right-[2%] top-[5%] w-14 h-14 sm:w-20 sm:h-20 rounded-full border-b-[6px] shadow-xl flex flex-col items-center justify-center active:translate-y-1 transition-all touch-manipulation scale-90 sm:scale-100 origin-right
                                ${(isSpinning.some(s=>s) || showBonusSummary) ? 'bg-gray-800 border-gray-950 opacity-50' : 
                                  bonusMode ? 'bg-gradient-to-b from-red-500 to-yellow-600 border-red-900 text-white shadow-[0_0_20px_red] animate-pulse' :
                                  freeSpins > 0 ? 'bg-gradient-to-b from-cyan-500 to-blue-600 border-blue-900 text-white shadow-[0_0_20px_cyan]' :
                                  'bg-gradient-to-b from-red-600 to-red-800 border-red-950 text-white hover:brightness-110'}`}
                            >
                                <Gamepad2 size={24} strokeWidth={3} className="text-white"/>
                                <span className="text-[7px] sm:text-[8px] font-black tracking-widest text-white mt-0.5 select-none text-center leading-none">
                                    {bonusMode ? 'AT SPIN' : (freeSpins > 0 ? 'REPLAY' : 'SPIN')}
                                </span>
                            </button>

                            <div className="absolute right-[22%] sm:right-[30%] top-[15%] flex flex-col gap-2 scale-90 sm:scale-100 origin-right">
                                <button onClick={toggleTurbo} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-b-4 border-black flex items-center justify-center active:translate-y-1 shadow-md touch-manipulation ${turboMode ? 'bg-yellow-500 text-black shadow-[0_0_10px_gold]' : 'bg-gray-700 text-gray-400'}`}><Zap size={14} fill={turboMode ? "currentColor" : "none"}/></button>
                                <button onClick={toggleAuto} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-b-4 border-black flex items-center justify-center active:translate-y-1 shadow-md touch-manipulation ${autoPlay ? 'bg-green-600 text-white shadow-[0_0_10px_green]' : 'bg-gray-700 text-gray-400'}`}>
                                    {autoPlay ? <Repeat size={14} className="animate-spin-slow" /> : <Repeat size={14}/>}
                                </button>
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

            {/* 1. CYBER GLITCH CUT-IN (GEKIATSU) */}
            {showCutIn && (
                <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden mix-blend-screen">
                    <div className="absolute inset-0 bg-red-600 mix-blend-color-burn animate-pulse opacity-50"></div>
                    
                    {/* Cyber Glitch Box */}
                    <div className="w-full h-64 bg-black/90 border-y-8 border-red-500 shadow-[0_0_80px_red] flex items-center justify-center transform animate-in slide-in-from-left-[100%] slide-out-to-right-[100%] duration-1000 fill-mode-forwards relative overflow-hidden"
                         style={{ clipPath: 'polygon(0 10%, 100% 0, 100% 90%, 0 100%)' }}>
                        
                        {/* CRT Scanlines */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-40 animate-[marquee_1s_linear_infinite]"></div>
                        
                        <div className="text-6xl sm:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-red-500 to-red-900 drop-shadow-[0_0_30px_red] tracking-[0.2em] relative z-10 scale-150 mix-blend-hard-light"
                             style={{ animation: 'glitch-anim 0.2s infinite' }}>
                            GEKIATSU
                        </div>
                        <div className="absolute right-[-10%] bottom-[-20%] opacity-90 h-[150%]">
                            <div className="h-full filter drop-shadow-2xl brightness-150 contrast-150 saturate-200">
                                <CharacterSVG type={island.hostess_char_id} mood="win" scale={1.4} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. BONUS SUMMARY (TOTAL GET) */}
            {showBonusSummary && (
                <div className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center p-4 animate-in zoom-in-50 duration-500">
                     <div className="absolute inset-0 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-yellow-900/40 via-black to-black"></div>
                     <GlassCard className="w-full max-w-sm p-8 text-center border-t-4 border-b-4 border-yellow-400 shadow-[0_0_50px_gold] relative z-10">
                          <h3 className="text-xl font-bold text-yellow-500 tracking-[0.5em] mb-2 uppercase">BONUS COMPLETE</h3>
                          <h2 className="text-4xl font-black italic text-white mb-6">TOTAL GET</h2>
                          <div className="text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-xl mb-8">
                              +<RollupNumber value={bonusTotalWin} duration={2500} />
                          </div>
                          <button onClick={clearBonusTotal} className="w-full py-4 rounded-full bg-white text-black font-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                              CONTINUE
                          </button>
                     </GlassCard>
                </div>
            )}

            {/* GAMBLE MODAL */}
            {winStage === 'gambling' && !bonusMode && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in zoom-in-95">
                    <GlassCard className={`w-full max-w-sm p-6 text-center border-t-4 shadow-2xl ${gambleFeedback === 'critical' ? 'border-yellow-400 shadow-yellow-500/50' : 'border-cyan-500/50 shadow-cyan-500/20'}`}>
                        <h2 className="text-3xl font-black text-white mb-2 italic tracking-widest drop-shadow-md">DOUBLE UP?</h2>
                        <div className="flex justify-between text-xs font-mono text-gray-400 mb-6 bg-black/50 p-2 rounded-xl border border-white/10 items-center">
                            <div className="flex flex-col text-left">
                                <span className="text-[9px] uppercase">Total Bet</span>
                                <b className="text-white">{currentBet.toLocaleString()}</b>
                            </div>
                            <div className="text-center">
                                <span className="text-[9px] uppercase block">Current Win</span>
                                <b className="text-white text-sm"><RollupNumber value={lastWin} duration={1500} /></b>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[9px] uppercase">Potential Win</span>
                                <span className="text-green-400"><b className="text-lg">{(lastWin*2).toLocaleString()}</b></span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button onClick={() => handleGamble('red')} disabled={gamblePending} className={`h-20 sm:h-24 rounded-2xl border-4 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all group relative overflow-hidden ${gambleTheme.rBg}`}>
                                <RedIcon size={32} className={`${gambleTheme.rTxt} mb-1 group-hover:scale-110 transition-transform`} />
                                <span className={`font-black text-xs ${gambleTheme.rTxt}`}>{gambleTheme.rLabel}</span>
                            </button>
                            <button onClick={() => handleGamble('black')} disabled={gamblePending} className={`h-20 sm:h-24 rounded-2xl border-4 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all group relative overflow-hidden ${gambleTheme.bBg}`}>
                                <BlackIcon size={32} className={`${gambleTheme.bTxt} mb-1 group-hover:scale-110 transition-transform`} />
                                <span className={`font-black text-xs ${gambleTheme.bTxt}`}>{gambleTheme.bLabel}</span>
                            </button>
                        </div>
                        <button onClick={collectWin} className="text-gray-400 hover:text-white text-xs font-bold underline transition-colors">COLLECT WIN</button>
                    </GlassCard>
                </div>
            )}
            
            {showPaytable && (
                <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 sm:p-6" onClick={() => setShowPaytable(false)}>
                     <div className="text-white font-black text-2xl italic tracking-widest mb-6 drop-shadow-md">PAYTABLE</div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                         {PAYTABLE_DATA.map((item) => (
                             <div key={item.id} className={`bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-4 ${item.id === 7 ? 'sm:col-span-2 justify-center' : ''}`}>
                                 <div className="w-12 h-12 bg-black/60 rounded-lg p-1 shadow-lg"><SymbolSVG id={item.id} islandId={parseInt(island.id)} /></div>
                                 <div className="flex flex-col">
                                     <span className={`font-black text-sm uppercase ${item.color}`}>{item.name}</span>
                                     <span className="text-white font-mono font-bold text-base bg-black/40 px-2 py-0.5 rounded w-fit">{item.mult}x</span>
                                 </div>
                             </div>
                         ))}
                     </div>
                     <div className="mt-8 text-gray-500 text-xs animate-pulse">TAP TO CLOSE</div>
                </div>
            )}

            {/* CELEBRATION OVERLAY (STANDARD WIN) */}
            {winStage === 'celebrating' && winDetails && !bonusMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"></div>
                    <div className="relative z-10 flex flex-col items-center animate-in zoom-in-50 duration-500 ease-out">
                        <GlassCard className={`p-8 text-center flex flex-col items-center border-t-4 border-b-4 ${winDetails.color.replace('text-', 'border-')} ${winDetails.glow}`}>
                            <div className="w-24 h-24 mb-4 animate-bounce"><SymbolSVG id={winDetails.symbolId} islandId={parseInt(island.id)} isWinning={true} /></div>
                            <h2 className={`text-4xl font-black italic tracking-tighter uppercase drop-shadow-lg ${winDetails.color}`}>{winDetails.name}</h2>
                            <div className="text-5xl font-mono font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] mt-4">
                                +<RollupNumber value={lastWin} duration={1500} />
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayView;