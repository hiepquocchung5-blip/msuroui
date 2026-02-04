import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Settings, Minus, Plus, Zap, StopCircle, Gamepad2, Sparkles, Gift, Info, Volume2, VolumeX, Maximize2, Repeat, Coins, LogOut, Wallet, Trophy, Lock, Flame, MessageCircle, Shield, Sword, Skull } from 'lucide-react';
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

const PlayView = ({ machine, island, user, onLeave, updateBalance }) => {
    // 1. Logic Hooks
    const slotLogic = useSlotMachine(machine.id, island.id);
    const { 
        reels, isSpinning, isTeaser, lastWin, mysteryItem, 
        autoPlay, spin, stopReel, setAutoPlay, setLastWin, 
        turboMode, setTurboMode, 
        expandedReels, lockedReels, avalancheTriggered 
    } = slotLogic;
    
    // 2. Local UI State
    const [betIndex, setBetIndex] = useState(0);
    const [winStage, setWinStage] = useState('idle'); // 'idle' | 'celebrating' | 'gambling'
    const [gamblePending, setGamblePending] = useState(false);
    const [gambleLost, setGambleLost] = useState(false); // Triggers "Boo!" mood
    const [charInteraction, setCharInteraction] = useState(null); // Text bubble for character click
    
    // Modals
    const [showPaytable, setShowPaytable] = useState(false);
    const [showSettings, setShowSettings] = useState(false); 
    const [showLowBalance, setShowLowBalance] = useState(false); 

    const [isMuted, setIsMuted] = useState(false);
    const [coins, setCoins] = useState([]); 
    
    const { playSound } = useGameSound(!isMuted);
    
    // Config
    const BET_AMOUNTS = [200, 500, 1000, 2000, 5000, 10000, 50000];
    const currentBet = BET_AMOUNTS[betIndex];

    // --- HELPER FUNCTIONS ---

    // Determine Machine Visual State (Lights/LEDs)
    const getCabinetState = () => {
        if (winStage === 'celebrating') return 'JACKPOT_HOT'; 
        if (isSpinning.some(s => s)) return 'BUSY';
        if (winStage === 'gambling') return 'BUSY';
        return 'FREE';
    };
    
    // Determine Character Animation State
    const getMood = () => {
        if (gambleLost) return 'sad'; 
        if (winStage === 'celebrating' || (winStage === 'gambling' && !gamblePending)) return 'win';
        return 'idle';
    };

    // --- 3. EFFECTS ---
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
                    // Delay before showing Gamble option
                    setTimeout(() => setWinStage('gambling'), isBigWin ? 2500 : 1000);
                }
            }
        } else {
             if (winStage !== 'gambling' && winStage !== 'celebrating') setWinStage('idle');
        }
    }, [lastWin, autoPlay, currentBet, playSound]);

    const triggerCoinShower = () => {
        const newParticles = Array.from({length: 50}).map((_, i) => ({
            id: Date.now() + i,
            left: Math.random() * 90 + 5,
            delay: Math.random() * 2,
            scale: 0.5 + Math.random(),
            rotation: Math.random() * 360
        }));
        setCoins(newParticles);
        setTimeout(() => setCoins([]), 5000);
    };

    // --- 4. HANDLERS ---
    const handleSpin = useCallback(() => {
        if (winStage !== 'idle') return; 
        
        if (parseFloat(user.balance) < currentBet) {
            setShowLowBalance(true);
            playSound('stop');
            return;
        }

        setGambleLost(false);
        setCharInteraction(null);
        playSound('spin');
        if (navigator.vibrate) navigator.vibrate(50);
        spin(currentBet);
    }, [user.balance, currentBet, winStage, playSound, spin]);

    const handleStopReel = useCallback((idx) => {
        if (isSpinning[idx]) {
            playSound('click'); // Click sound for button press
            if (navigator.vibrate) navigator.vibrate(20);
            stopReel(idx); // Call hook function
        }
    }, [isSpinning, playSound, stopReel]);

    // Character Click Interaction
    const handleCharacterClick = () => {
        playSound('click');
        const lines = [
            "Let's win big!",
            "I'm feeling lucky!",
            "One more spin?",
            "You can do it!",
            "Nice to see you!"
        ];
        setCharInteraction(lines[Math.floor(Math.random() * lines.length)]);
        setTimeout(() => setCharInteraction(null), 3000);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!isSpinning.some(s=>s) && winStage === 'idle') handleSpin();
            }
            // Stop Buttons (1, 2, 3)
            if (e.key === '1') handleStopReel(0);
            if (e.key === '2') handleStopReel(1);
            if (e.key === '3') handleStopReel(2);

            if (e.code === 'Escape') {
                if (showPaytable) setShowPaytable(false);
                else if (showSettings) setShowSettings(false);
                else if (winStage === 'gambling') collectWin();
                else onLeave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSpinning, showPaytable, showSettings, winStage, handleSpin, handleStopReel, onLeave]);

    const handleGamble = async (choice) => {
        playSound('click');
        setGamblePending(true);
        try {
            const res = await gameApi.gamble(choice);
            if (res.data.status === 'success') {
                if (res.data.won) {
                    // WON: Celebrate then Close (One Shot Logic)
                    setLastWin(res.data.new_win_amount); 
                    updateBalance(res.data.new_balance);
                    
                    playSound('win');
                    triggerCoinShower();
                    setWinStage('celebrating'); 
                    
                    // Auto close after celebration
                    setTimeout(() => {
                        setWinStage('idle');
                    }, 3000);
                } else {
                    // LOST: Show Boo then Close
                    setLastWin(0); 
                    updateBalance(res.data.new_balance);
                    
                    playSound('stop'); // Sad sound
                    setGambleLost(true); // Character cries
                    setWinStage('idle'); // Close modal immediately to show character
                    
                    // Reset Boo after 2s
                    setTimeout(() => setGambleLost(false), 2000);
                }
            } else {
                alert(res.data.error || "Gamble Failed");
                setWinStage('idle');
            }
        } catch (e) { 
            console.error(e); 
            setWinStage('idle'); 
        } finally { 
            setGamblePending(false); 
        }
    };
    
    const collectWin = () => {
        playSound('click');
        setWinStage('idle');
    };

    const changeBet = (delta) => {
        playSound('click');
        setBetIndex(prev => Math.max(0, Math.min(BET_AMOUNTS.length - 1, prev + delta)));
    };
    
    const handleMaxBet = () => {
      playSound('click');
      setBetIndex(BET_AMOUNTS.length - 1);
    };
    
    const toggleTurbo = () => {
        playSound('click');
        if (setTurboMode) {
            setTurboMode(!turboMode);
        }
    };
  
    const toggleAuto = () => {
        playSound('click');
        setAutoPlay(!autoPlay);
    };

    const toggleMute = () => {
        const newVal = !isMuted;
        setIsMuted(newVal);
        localStorage.setItem('suro_game_muted', newVal);
    };

    // --- ISLAND SPECIFIC GAMBLE UI ---
    const renderGambleContent = () => {
        // 1. Vegas (High Card)
        if (island.id === 1) {
            return (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => handleGamble('red')} disabled={gamblePending} className="h-24 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl border-4 border-red-400 flex flex-col items-center justify-center shadow-lg active:scale-95 group">
                        <div className="w-10 h-14 bg-white rounded flex items-center justify-center text-red-600 font-bold border border-gray-300 shadow-sm mb-1 group-hover:-translate-y-1 transition-transform">♥</div>
                        <span className="text-white font-black text-xs">RED</span>
                    </button>
                    <button onClick={() => handleGamble('black')} disabled={gamblePending} className="h-24 bg-gradient-to-br from-gray-800 to-black rounded-2xl border-4 border-gray-600 flex flex-col items-center justify-center shadow-lg active:scale-95 group">
                        <div className="w-10 h-14 bg-white rounded flex items-center justify-center text-black font-bold border border-gray-300 shadow-sm mb-1 group-hover:-translate-y-1 transition-transform">♠</div>
                        <span className="text-white font-black text-xs">BLACK</span>
                    </button>
                </div>
            );
        }
        
        // 3. Inferna (Dragon Breath)
        if (island.id === 3) {
            return (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => handleGamble('red')} disabled={gamblePending} className="h-24 bg-gradient-to-br from-orange-600 to-red-900 rounded-2xl border-4 border-orange-400 flex flex-col items-center justify-center shadow-lg active:scale-95 group relative overflow-hidden">
                        <Flame size={32} className="text-yellow-300 animate-pulse mb-1 group-hover:scale-125 transition-transform" />
                        <span className="text-white font-black text-xs z-10 relative">BLOCK FIRE</span>
                        <div className="absolute inset-0 bg-red-500/20 group-hover:bg-red-500/40 transition-colors"></div>
                    </button>
                    <button onClick={() => handleGamble('black')} disabled={gamblePending} className="h-24 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl border-4 border-gray-500 flex flex-col items-center justify-center shadow-lg active:scale-95 group relative overflow-hidden">
                        <Shield size={32} className="text-gray-300 mb-1 group-hover:scale-125 transition-transform" />
                        <span className="text-white font-black text-xs z-10 relative">DEFEND</span>
                    </button>
                </div>
            );
        }
        
        // 4. Noctyra (Bat Hunt)
        if (island.id === 4) {
             return (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => handleGamble('red')} disabled={gamblePending} className="h-24 bg-gradient-to-br from-purple-800 to-black rounded-2xl border-4 border-purple-500 flex flex-col items-center justify-center shadow-lg active:scale-95 group">
                        <div className="text-3xl mb-1 group-hover:-translate-y-2 transition-transform">🦇</div>
                        <span className="text-purple-200 font-black text-xs">LEFT BAT</span>
                    </button>
                    <button onClick={() => handleGamble('black')} disabled={gamblePending} className="h-24 bg-gradient-to-br from-purple-800 to-black rounded-2xl border-4 border-purple-500 flex flex-col items-center justify-center shadow-lg active:scale-95 group">
                        <div className="text-3xl mb-1 group-hover:-translate-y-2 transition-transform">🧛‍♀️</div>
                        <span className="text-purple-200 font-black text-xs">RIGHT BAT</span>
                    </button>
                </div>
            );
        }

        // Default (Red/Black)
        return (
            <div className="grid grid-cols-2 gap-4 mb-6">
                <button onClick={() => handleGamble('red')} disabled={gamblePending} className="h-24 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl border-4 border-red-400 flex items-center justify-center shadow-lg active:scale-95"><span className="text-white font-black">RED</span></button>
                <button onClick={() => handleGamble('black')} disabled={gamblePending} className="h-24 bg-gradient-to-br from-gray-800 to-black rounded-2xl border-4 border-gray-600 flex items-center justify-center shadow-lg active:scale-95"><span className="text-white font-black">BLACK</span></button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-black relative flex flex-col overflow-hidden" style={{ imageRendering: 'crisp-edges' }}>
            
            {/* BACKGROUND */}
            <div className="absolute inset-0 z-0 overflow-hidden transition-opacity duration-1000" style={{ opacity: winStage === 'celebrating' ? 0.4 : 1 }}>
                <div className="absolute inset-0 scale-110 opacity-70">
                    {island && <IslandLandscapeSVG islandId={island.id} />}
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black pointer-events-none"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] pointer-events-none"></div>
            </div>

            <GlobalTicker />
            <ActiveEvents />

            {/* HUD */}
            <div className="absolute top-8 w-full p-4 flex justify-between items-center z-40 pointer-events-none safe-area-top">
                <button onClick={onLeave} className="pointer-events-auto w-10 h-10 bg-white/10 rounded-full text-white backdrop-blur flex items-center justify-center border border-white/20 hover:bg-white/20 active:scale-95 transition-transform shadow-lg"><ChevronLeft/></button>
                <div className="pointer-events-auto bg-black/60 px-5 py-2 rounded-full border border-yellow-500/50 flex items-center gap-3 shadow-[0_0_20px_rgba(234,179,8,0.3)] backdrop-blur-md">
                    <div className="text-[10px] text-yellow-500 font-bold tracking-widest hidden md:block">CREDIT</div>
                    <span className="text-yellow-400 font-mono font-black text-lg">{user.balance.toLocaleString()}</span>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                     <button onClick={() => setShowPaytable(true)} className="w-10 h-10 bg-white/10 rounded-full text-white backdrop-blur flex items-center justify-center border border-white/20 hover:bg-white/20 active:scale-95"><Info size={20}/></button>
                     <button onClick={() => setShowSettings(true)} className="w-10 h-10 bg-white/10 rounded-full text-white backdrop-blur flex items-center justify-center border border-white/20 hover:bg-white/20 active:scale-95">
                        <Settings size={20} />
                     </button>
                </div>
            </div>

            {/* MAIN STAGE CONTAINER */}
            <div className="flex-1 flex items-center justify-center relative z-10 w-full h-full overflow-hidden">
                
                {/* CENTER ANCHOR FOR 3D SCENE */}
                <div className="relative flex items-end justify-center h-[75vh] max-h-[850px] aspect-[0.6]">
                    
                    {/* 1. CABINET */}
                    <div className="absolute inset-0 w-full h-full z-10">
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
                        className="absolute bottom-[5%] right-[-45%] w-[50%] h-[70%] z-20 pointer-events-auto cursor-pointer transition-transform duration-500 hover:scale-105" 
                        onClick={handleCharacterClick}
                        style={{ transform: (winStage !== 'idle' && !gambleLost) ? 'scale(1.1) translateY(-10px)' : 'scale(1)' }}
                    >
                        <CharacterSVG type={user.active_pet_id} mood={getMood()} />
                        {charInteraction && (
                            <div className="absolute top-10 -left-10 bg-white text-black p-3 rounded-xl rounded-br-none shadow-xl animate-in zoom-in duration-300 z-50">
                                <p className="font-bold text-xs flex items-center gap-1"><MessageCircle size={12}/> {charInteraction}</p>
                            </div>
                        )}
                        {mysteryItem && (
                            <div className="absolute top-0 left-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl animate-bounce shadow-2xl z-50 border border-white">
                                <div className="flex items-center gap-2"><Gift size={16} className="text-yellow-300"/> <span className="font-bold text-xs">{mysteryItem.message}</span></div>
                            </div>
                        )}
                        {gambleLost && (
                            <div className="absolute top-[20%] left-[-20px] bg-white text-black font-black px-6 py-3 rounded-full rounded-bl-none animate-bounce z-50 shadow-[0_0_15px_red] border-2 border-red-600 text-xl transform -rotate-12">
                                BOO! 👻
                            </div>
                        )}
                    </div>

                    {/* 3. SCREEN CONTENT LAYER */}
                    <div className="absolute top-[21.25%] left-[16.67%] w-[66.67%] h-[30%] flex flex-col pointer-events-none z-20">
                        {/* Win Marquee */}
                        <div className={`bg-black/90 h-[15%] flex items-center justify-center overflow-hidden mb-[1%] shadow-inner ${isTeaser ? 'border-t-2 border-red-500' : ''}`}>
                            <p className="font-mono text-[min(3vw,12px)] text-cyan-400 font-bold tracking-widest animate-marquee whitespace-nowrap">
                                {lastWin > 0 ? `*** BIG WIN ${lastWin.toLocaleString()} ***` : (isTeaser ? 'NEAR MISS...' : 'INSERT COIN')}
                            </p>
                        </div>
                        {/* Reels Container */}
                        <div className="flex-1 grid grid-cols-3 gap-[2%] bg-black p-[2%] overflow-hidden relative shadow-[inset_0_0_20px_black]">
                            {reels.map((s, i) => (
                                <div key={i} className={`relative h-full overflow-hidden bg-gradient-to-b from-[#111] via-[#333] to-[#111] border-x border-black/50 ${lockedReels && lockedReels[i] ? 'border-2 border-yellow-400 shadow-[inset_0_0_15px_gold]' : ''}`}>
                                    {lockedReels && lockedReels[i] && <div className="absolute inset-0 bg-yellow-400/20 z-30 animate-pulse flex items-center justify-center"><Lock size={12} className="text-yellow-400"/></div>}
                                    {expandedReels && expandedReels[i] && <div className="absolute inset-0 bg-red-600/80 z-40 flex items-center justify-center animate-in fade-in"><Flame size={24} className="text-white animate-bounce"/></div>}
                                    
                                    <div className={`absolute inset-0 flex flex-col items-center justify-center ${isSpinning[i] ? 'blur-[2px]' : ''} ${turboMode && isSpinning[i] ? 'blur-[4px]' : ''} ${avalancheTriggered && !isSpinning[i] ? 'animate-ping' : ''}`}>
                                        <div className="w-[80%] aspect-square"><SymbolSVG id={s} /></div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-20"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. BUTTON DECK & STOP BUTTONS */}
                    <div className="absolute top-[57.5%] left-[5%] w-[90%] h-[15%] z-50 pointer-events-auto touch-manipulation" style={{ perspective: '600px' }}>
                        <div className="w-full h-full relative" style={{ transform: 'rotateX(20deg)', transformOrigin: 'top center' }}>
                            
                            {/* Left: Bet Config */}
                            <div className="absolute left-[5%] top-[10%] flex gap-1">
                                <button onClick={() => changeBet(-1)} className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg border-b-4 border-black text-white flex items-center justify-center active:border-b-0 active:translate-y-1 shadow-lg touch-manipulation active:bg-gray-700"><Minus size={14}/></button>
                                <div className="bg-black border border-gray-600 w-12 h-8 sm:w-16 sm:h-10 flex items-center justify-center text-[9px] sm:text-xs text-yellow-400 font-mono tracking-tighter shadow-inner select-none">{currentBet.toLocaleString()}</div>
                                <button onClick={() => changeBet(1)} className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg border-b-4 border-black text-white flex items-center justify-center active:border-b-0 active:translate-y-1 shadow-lg touch-manipulation active:bg-gray-700"><Plus size={14}/></button>
                            </div>
                            
                            <button onClick={handleMaxBet} className="absolute left-[5%] top-[60%] w-10 h-6 sm:w-12 sm:h-8 bg-orange-700 rounded border-b-4 border-black text-[8px] font-black text-white flex items-center justify-center active:border-b-0 active:translate-y-1 shadow-lg touch-manipulation active:bg-orange-600">MAX</button>

                            {/* Center: STOP BUTTONS (Pachislo Style) */}
                            <div className="absolute left-[33%] top-[25%] flex gap-2 sm:gap-4 z-50">
                                {[0, 1, 2].map((idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleStopReel(idx)}
                                        disabled={!isSpinning[idx]}
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all active:scale-95 touch-manipulation
                                        ${isSpinning[idx] 
                                            ? 'bg-red-600 border-red-400 text-white animate-pulse cursor-pointer hover:bg-red-500 shadow-red-500/50' 
                                            : 'bg-black/50 border-gray-800 text-gray-700 cursor-default opacity-50'}`}
                                    >
                                        <StopCircle size={16} fill={isSpinning[idx] ? "currentColor" : "none"}/>
                                    </button>
                                ))}
                            </div>

                            {/* Right: SPIN Button */}
                            <button 
                                onClick={handleSpin} 
                                disabled={isSpinning.some(s=>s) || (winStage !== 'idle' && winStage !== 'celebrating')} 
                                className={`absolute right-[5%] top-[5%] w-16 h-16 sm:w-20 sm:h-20 rounded-full border-b-[6px] shadow-xl flex flex-col items-center justify-center active:border-b-0 active:translate-y-1 transition-all touch-manipulation
                                ${isSpinning.some(s=>s) ? 'bg-gray-800 border-gray-950 opacity-50' : 'bg-gradient-to-b from-red-600 to-red-800 border-red-950 text-white hover:brightness-110 hover:shadow-red-500/80 active:bg-red-700'}`}
                            >
                                <Gamepad2 size={24} strokeWidth={3} className="text-white"/>
                                <span className="text-[8px] font-black tracking-widest text-white mt-0.5 select-none">SPIN</span>
                            </button>

                            {/* Center-Right: Toggles */}
                            <div className="absolute right-[35%] top-[15%] flex flex-col gap-2">
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

            {/* MODALS */}
            {winStage === 'gambling' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in zoom-in-95">
                    <GlassCard className="w-full max-w-sm p-6 text-center border-yellow-500/50">
                        <h2 className="text-3xl font-black text-yellow-400 mb-2 italic">DOUBLE UP?</h2>
                        <div className="flex justify-between text-xs font-mono text-gray-400 mb-6">
                            <span>RISK: <b className="text-white">{lastWin.toLocaleString()}</b></span>
                            <span className="text-green-400">WIN: <b className="text-lg">{(lastWin*2).toLocaleString()}</b></span>
                        </div>
                        
                        {renderGambleContent()}

                        <button onClick={collectWin} className="text-gray-400 text-xs font-bold underline">COLLECT WIN</button>
                    </GlassCard>
                </div>
            )}
            
            {showSettings && (
                <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6" onClick={() => setShowSettings(false)}>
                    <GlassCard className="w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white font-bold mb-4 border-b border-white/10 pb-2">SETTINGS</h3>
                        <button onClick={toggleMute} className="w-full bg-white/10 p-3 rounded-xl flex justify-between mb-2">
                             <span>Sound</span> {isMuted ? <VolumeX/> : <Volume2 className="text-green-400"/>}
                        </button>
                        <button onClick={onLeave} className="w-full bg-red-900/30 text-red-400 p-3 rounded-xl flex justify-between">
                             <span>Leave Game</span> <LogOut/>
                        </button>
                    </GlassCard>
                </div>
            )}
            
            {showPaytable && (
                <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6" onClick={() => setShowPaytable(false)}>
                     <div className="text-white font-bold text-xl mb-4">PAYTABLE</div>
                     <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white/10 p-2 rounded flex items-center gap-2"><SymbolSVG id={1} /> <span className="text-yellow-400 font-bold">100x</span></div>
                         <div className="bg-white/10 p-2 rounded flex items-center gap-2"><SymbolSVG id={2} /> <span className="text-red-400 font-bold">50x</span></div>
                         <div className="bg-white/10 p-2 rounded flex items-center gap-2"><SymbolSVG id={3} /> <span className="text-cyan-400 font-bold">20x</span></div>
                         <div className="bg-white/10 p-2 rounded flex items-center gap-2"><SymbolSVG id={4} /> <span className="text-white font-bold">10x</span></div>
                     </div>
                     <div className="mt-8 text-gray-500 text-xs">Tap to close</div>
                </div>
            )}

            {showLowBalance && (
                <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6">
                    <GlassCard className="text-center p-6 border-red-500/50">
                        <Coins className="w-12 h-12 text-red-500 mx-auto mb-2"/>
                        <h2 className="text-xl font-bold text-white">LOW BALANCE</h2>
                        <button onClick={() => window.location.href='/wallet'} className="mt-4 w-full bg-green-600 py-3 rounded-xl font-bold text-white">DEPOSIT NOW</button>
                        <button onClick={() => setShowLowBalance(false)} className="mt-2 text-gray-500 text-xs">Cancel</button>
                    </GlassCard>
                </div>
            )}

        </div>
    );
};

export default PlayView;