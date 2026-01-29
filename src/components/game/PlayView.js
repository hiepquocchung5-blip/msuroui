import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Settings, Minus, Plus, Zap, StopCircle, Gamepad2, Sparkles, Gift, Info, Volume2, VolumeX, Maximize2, Repeat, Coins, LogOut, Wallet, Trophy } from 'lucide-react';
import CabinetSVG from '../visuals/CabinetSVG';
import CharacterSVG from '../visuals/CharacterSVG';
import SymbolSVG from '../visuals/SymbolSVG';
import IslandLandscapeSVG from '../visuals/IslandLandscapeSVG';
import GlassCard from '../ui/GlassCard';
import GlobalTicker from '../ui/GlobalTicker';
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
    const [gambleLost, setGambleLost] = useState(false); // For "Boo" reaction
    
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

    // --- INITIALIZATION ---
    useEffect(() => {
        const savedMute = localStorage.getItem('suro_game_muted');
        if (savedMute !== null) setIsMuted(savedMute === 'true');
    }, []);

    const toggleMute = () => {
        const newVal = !isMuted;
        setIsMuted(newVal);
        localStorage.setItem('suro_game_muted', newVal);
    };

    // Determine Machine Visual State
    const getCabinetState = () => {
        if (winStage === 'celebrating') return 'JACKPOT_HOT'; 
        if (isSpinning.some(s => s)) return 'BUSY';
        if (winStage === 'gambling') return 'BUSY';
        return 'FREE';
    };
    
    const getMood = () => {
        if (gambleLost) return 'sad'; 
        if (winStage === 'celebrating' || winStage === 'gambling') return 'win';
        return 'idle';
    };

    // --- 3. GAMEPLAY EFFECTS ---
    useEffect(() => {
        if (lastWin > 0) {
            // Check if this is a fresh win from the hook (not a gamble update)
            if (winStage === 'idle') {
                const isBigWin = lastWin > currentBet * 10;
                
                playSound(isBigWin ? 'bigwin' : 'win');
                if (navigator.vibrate) navigator.vibrate(isBigWin ? [200, 100, 200] : 100);
                if (isBigWin) triggerCoinShower();

                if (!autoPlay) {
                    setWinStage('celebrating');
                    setGambleLost(false);
                    // Delay before showing Gamble option
                    setTimeout(() => setWinStage('gambling'), isBigWin ? 3000 : 1500);
                }
            }
        } else {
             // If win cleared (e.g. lost gamble), reset
             if (winStage !== 'gambling') setWinStage('idle');
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
        playSound('spin');
        if (navigator.vibrate) navigator.vibrate(50);
        spin(currentBet);
    }, [user.balance, currentBet, winStage, playSound, spin]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!isSpinning.some(s=>s) && winStage === 'idle') handleSpin();
            }
            if (e.code === 'Escape') {
                if (showPaytable) setShowPaytable(false);
                else if (showSettings) setShowSettings(false);
                else if (winStage === 'gambling') collectWin();
                else onLeave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSpinning, showPaytable, showSettings, winStage, handleSpin, onLeave]);

    const handleStopReel = (idx) => {
      playSound('stop');
      if (navigator.vibrate) navigator.vibrate(20);
      stopReel(idx);
    };

    const handleGamble = async (choice) => {
        playSound('click');
        setGamblePending(true);
        try {
            const res = await gameApi.gamble(choice);
            if (res.data.status === 'success') {
                if (res.data.won) {
                    setLastWin(res.data.new_win_amount); 
                    updateBalance(res.data.new_balance);
                    playSound('win');
                    triggerCoinShower();
                    // Keep in gambling stage for streaks
                } else {
                    setLastWin(0); 
                    updateBalance(res.data.new_balance);
                    setWinStage('idle');
                    setGambleLost(true);
                    playSound('stop');
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
        if (setTurboMode) setTurboMode(!turboMode);
    };
  
    const toggleAuto = () => {
        playSound('click');
        setAutoPlay(!autoPlay);
    };

    return (
        <div className="min-h-screen bg-black relative flex flex-col overflow-hidden" style={{ imageRendering: 'crisp-edges' }}>
            
            {/* BACKGROUND */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 scale-110 opacity-70 transition-opacity duration-1000">
                    {island && <IslandLandscapeSVG islandId={island.id} />}
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black pointer-events-none"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] pointer-events-none"></div>
            </div>

            <GlobalTicker />

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

            {/* MAIN STAGE */}
            <div className="flex-1 flex flex-col items-center justify-center pt-8 relative z-10 w-full h-full">
                
                {/* 1. 3D PET */}
                <div className="absolute top-[18%] right-[-5%] w-[42%] h-[42%] z-0 pointer-events-none transition-transform duration-500 md:right-0 md:w-[35%] md:h-[35%]" 
                     style={{ transform: (winStage !== 'idle') ? 'scale(1.25) translateY(-20px)' : 'scale(1)' }}>
                    <CharacterSVG type={user.active_pet_id} mood={getMood()} />
                    {mysteryItem && (
                        <div className="absolute -top-20 -left-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-2xl animate-bounce shadow-2xl z-50 border-2 border-white scale-75 md:scale-100">
                            <div className="flex items-center gap-2 mb-1"><Gift className="w-6 h-6 text-yellow-300"/> <span className="font-black text-sm">BONUS!</span></div>
                            <div className="text-xs font-bold">{mysteryItem.message}</div>
                        </div>
                    )}
                    {/* "BOO!" Reaction Bubble */}
                    {gambleLost && (
                        <div className="absolute -top-10 -left-10 bg-white text-black font-black px-4 py-2 rounded-full rounded-bl-none animate-bounce z-50 shadow-lg border-2 border-red-500 text-sm transform -rotate-12">
                            BOO!
                        </div>
                    )}
                </div>

                {/* 2. 3D CABINET */}
                <div className="relative z-10 w-full max-w-md h-[82vh] max-h-[850px] flex items-center justify-center transform md:scale-100 scale-95 origin-center">
                    <CabinetSVG 
                        islandId={parseInt(island.id)} 
                        mode="game" 
                        charId={island.hostess_char_id} 
                        stats={{laps: machine.total_laps, wins: machine.total_payout}} 
                        machineNumber={machine.machine_number}
                        serialNumber={machine.serial_number}
                        visualState={getCabinetState()}
                    />
                    
                    {/* --- INTERACTIVE SCREEN --- */}
                    <div className="absolute top-[21%] w-[68%] h-[30%] flex flex-col pointer-events-none">
                        
                        {/* Win Marquee */}
                        <div className={`bg-black/95 rounded border border-gray-800 h-8 flex items-center justify-center overflow-hidden relative mb-1 shadow-inner ${isTeaser ? 'border-red-500 animate-pulse' : ''}`}>
                            <p className="font-mono text-[10px] text-cyan-400 font-bold tracking-widest animate-marquee whitespace-nowrap px-2">
                                {lastWin > 0 ? `*** BIG WIN ${lastWin.toLocaleString()} MMK ***` : (isTeaser ? 'NEAR MISS...' : 'INSERT COIN • PLAY NOW')}
                            </p>
                        </div>

                        {/* Reels with Mechanics Visuals */}
                        <div className="flex-1 grid grid-cols-3 gap-1 bg-black p-1 rounded overflow-hidden relative border-4 border-gray-900 shadow-[inset_0_0_20px_black]">
                            {reels.map((s, i) => (
                                <div key={i} className={`relative h-full overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#2a2a2a] to-[#0a0a0a] border-x border-black/50 ${lockedReels && lockedReels[i] ? 'border-2 border-yellow-400 shadow-[inset_0_0_15px_gold]' : ''}`}>
                                    
                                    {/* Locked State Overlay (Noctyra) */}
                                    {lockedReels && lockedReels[i] && (
                                        <div className="absolute inset-0 bg-yellow-400/10 z-30 pointer-events-none animate-pulse flex items-center justify-center">
                                            <div className="absolute top-1 right-1 text-yellow-500"><Lock size={12}/></div>
                                        </div>
                                    )}

                                    {/* Expanding Wild Overlay (Inferna) */}
                                    {expandedReels && expandedReels[i] && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 z-40 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                                            <span className="text-white font-black text-xl rotate-90 tracking-widest drop-shadow-md">WILD</span>
                                        </div>
                                    )}

                                    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-100 
                                        ${isSpinning[i] ? 'blur-[2px] scale-y-110 opacity-80' : 'blur-0 scale-y-100 opacity-100'}
                                        ${i===2 && isTeaser ? 'animate-bounce' : ''}
                                        ${turboMode && isSpinning[i] ? 'blur-[4px]' : ''}
                                        ${avalancheTriggered && !isSpinning[i] ? 'animate-ping' : ''}
                                    `}>
                                        <div className="absolute top-[-45%] w-full p-2 transform scale-y-[0.6] opacity-30 brightness-50"><SymbolSVG id={(s === 1 ? 7 : s - 1)} /></div>
                                        <div className="w-full p-1 transform scale-110 z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"><SymbolSVG id={s} /></div>
                                        <div className="absolute bottom-[-45%] w-full p-2 transform scale-y-[0.6] opacity-30 brightness-50"><SymbolSVG id={(s % 7) + 1} /></div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/50 z-20"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- BUTTON DECK (Interactive) --- */}
                    {/* --- BUTTON DECK (Interactive | FIXED) --- */}
<div
  className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[95vw] max-w-[500px] z-50 pointer-events-none px-1 sm:px-2"
>
  {/* Visual tilt ONLY */}
  <div
    aria-hidden
    className="absolute inset-0"
    style={{
      perspective: '600px',
      transform: 'rotateX(18deg)',
    }}
  />

  {/* Actual interactive layer */}
  <div className="relative flex flex-row items-end justify-between gap-2 sm:gap-4 pointer-events-auto">
    
    {/* Left: Bet Config */}
    <div className="flex flex-col items-start gap-2">
      <div className="flex gap-1">
        <button
          onClick={() => changeBet(-1)}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-lg border-b-4 border-gray-950 text-white flex items-center justify-center active:border-b-0 active:translate-y-1 transition-all shadow-lg hover:bg-gray-700"
        >
          <Minus size={18} />
        </button>

        <div className="bg-black border border-gray-600 w-16 h-10 sm:w-20 sm:h-12 flex items-center justify-center text-xs sm:text-sm text-yellow-400 font-mono shadow-inner select-none">
          {currentBet.toLocaleString()}
        </div>

        <button
          onClick={() => changeBet(1)}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-lg border-b-4 border-gray-950 text-white flex items-center justify-center active:border-b-0 active:translate-y-1 transition-all shadow-lg hover:bg-gray-700"
        >
          <Plus size={18} />
        </button>
      </div>

      <button
        onClick={handleMaxBet}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-16 h-8 sm:w-20 sm:h-10 bg-orange-700 rounded-lg border-b-4 border-black text-[10px] sm:text-xs font-black text-white flex items-center justify-center active:border-b-0 active:translate-y-1 shadow-lg hover:bg-orange-600"
      >
        MAX
      </button>
    </div>

    {/* Center: SPIN */}
    <button
      onClick={handleSpin}
      onPointerDown={(e) => e.stopPropagation()}
      disabled={isSpinning.some(Boolean) || winStage !== 'idle'}
      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-b-[8px] shadow-2xl flex flex-col items-center justify-center active:border-b-0 active:translate-y-2 transition-all
        ${
          isSpinning.some(Boolean)
            ? 'bg-gray-800 border-gray-950 opacity-50'
            : 'bg-gradient-to-b from-red-600 to-red-800 border-red-950 text-white hover:brightness-110'
        }`}
    >
      <Gamepad2 size={36} strokeWidth={3} />
      <span className="text-xs sm:text-sm font-black tracking-widest">SPIN</span>
    </button>

                            {/* Right: Toggles */}
                            <div className="flex flex-col gap-2 items-end">
                                <button
                                    onClick={toggleTurbo}
                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-b-4 border-black flex items-center justify-center active:border-b-0 active:translate-y-1 shadow-md transition-colors pointer-events-auto cursor-pointer ${turboMode ? 'bg-yellow-500 text-black shadow-[0_0_10px_gold]' : 'bg-gray-700 text-gray-400'}`}
                                    aria-label="Turbo Mode"
                                >
                                    <Zap size={18} fill={turboMode ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                    onClick={toggleAuto}
                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-b-4 border-black flex items-center justify-center active:border-b-0 active:translate-y-1 shadow-md transition-colors pointer-events-auto cursor-pointer ${autoPlay ? 'bg-green-600 text-white shadow-[0_0_10px_green]' : 'bg-gray-700 text-gray-400'}`}
                                    aria-label="Auto Play"
                                >
                                    {autoPlay ? <StopCircle size={18} /> : <Repeat size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* VFX: Coin Shower */}
            {coins.map(c => (
                <div key={c.id} className="absolute top-[-20px] animate-fall z-50 pointer-events-none" style={{ left: `${c.left}%`, animationDuration: '2.5s', animationDelay: `${c.delay}s`, transform: `scale(${c.scale}) rotate(${c.rotation}deg)` }}>
                    <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-200 shadow-[0_0_15px_gold] flex items-center justify-center font-black text-yellow-700 text-xs"><Coins size={12} strokeWidth={3}/></div>
                </div>
            ))}

            {/* MODALS */}
            
            {/* 1. Gamble Modal */}
            {winStage === 'gambling' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in zoom-in-95 duration-200 p-4">
                    <GlassCard className="w-[90%] max-w-sm p-6 text-center border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                        <h2 className="text-3xl font-black text-yellow-400 mb-2 italic tracking-tighter drop-shadow-md">DOUBLE UP?</h2>
                        <div className="text-white text-lg font-mono mb-6 border-b border-white/10 pb-4">
                            WIN: <span className="text-green-400">{lastWin.toLocaleString()}</span> MMK
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button onClick={() => handleGamble('red')} disabled={gamblePending} className="h-32 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl border-b-8 border-red-950 flex items-center justify-center shadow-lg active:border-b-0 active:translate-y-2 transition-all hover:brightness-110 group"><div className="w-16 h-16 bg-red-500 rotate-45 transform shadow-inner border-4 border-red-300 group-hover:scale-110 transition-transform rounded-sm"></div></button>
                            <button onClick={() => handleGamble('black')} disabled={gamblePending} className="h-32 bg-gradient-to-br from-gray-800 to-black rounded-2xl border-b-8 border-black flex items-center justify-center shadow-lg active:border-b-0 active:translate-y-2 transition-all hover:brightness-110 group"><div className="w-16 h-16 bg-black border-4 border-gray-600 rotate-45 transform shadow-inner group-hover:scale-110 transition-transform rounded-sm"></div></button>
                        </div>
                        
                        <button onClick={collectWin} className="text-gray-400 text-xs font-bold tracking-widest hover:text-white transition-colors uppercase border-b border-transparent hover:border-white">
                            No Thanks, Collect Win
                        </button>
                    </GlassCard>
                </div>
            )}
            
            {/* 2. Celebration Modal */}
            {winStage === 'celebrating' && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in zoom-in duration-300 cursor-pointer" onClick={() => setWinStage('gambling')}>
                    <Trophy size={64} className="text-yellow-400 mb-4 animate-bounce" />
                    <h1 className="text-6xl font-black text-yellow-300 drop-shadow-[0_0_25px_gold] italic">BIG WIN</h1>
                    <div className="text-4xl font-mono text-white mt-4">{lastWin.toLocaleString()}</div>
                    <div className="mt-8 text-sm text-gray-400 animate-pulse">TAP TO CONTINUE</div>
                </div>
            )}
            
            {/* 3. Paytable Modal */}
            {showPaytable && (
                <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-xl animate-in fade-in" onClick={() => setShowPaytable(false)}>
                    <h3 className="text-white font-black mb-6 tracking-widest text-2xl border-b-4 border-cyan-500 pb-2">PAYTABLE</h3>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10"><div className="w-10 h-10"><SymbolSVG id={1}/></div><span className="text-yellow-400 font-black text-xl">100x</span></div>
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10"><div className="w-10 h-10"><SymbolSVG id={2}/></div><span className="text-red-500 font-black text-xl">50x</span></div>
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10"><div className="w-10 h-10"><SymbolSVG id={3}/></div><span className="text-cyan-400 font-bold text-lg">20x</span></div>
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10"><div className="w-10 h-10"><SymbolSVG id={4}/></div><span className="text-white font-bold text-lg">10x</span></div>
                    </div>
                    <div className="col-span-2 text-center text-gray-500 text-xs mt-4">Tap anywhere to close</div>
                </div>
            )}

            {/* 4. Settings Modal */}
            {showSettings && (
                <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-xl animate-in fade-in" onClick={() => setShowSettings(false)}>
                    <GlassCard className="w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-white font-bold mb-4 tracking-widest border-b border-white/10 pb-2">GAME MENU</h3>
                        <div className="space-y-3">
                             <button onClick={toggleMute} className="w-full bg-white/5 p-3 rounded-xl flex justify-between items-center hover:bg-white/10">
                                 <span className="text-sm font-bold text-gray-300">Sound Effects</span>
                                 {isMuted ? <VolumeX size={18} className="text-gray-500"/> : <Volume2 size={18} className="text-green-400"/>}
                             </button>
                             <button onClick={onLeave} className="w-full bg-red-900/20 border border-red-500/30 p-3 rounded-xl flex justify-between items-center hover:bg-red-900/40 text-red-400">
                                 <span className="text-sm font-bold">Leave Machine</span>
                                 <LogOut size={18} />
                             </button>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* 5. Low Balance Alert */}
            {showLowBalance && (
                <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-sm animate-in zoom-in-95">
                    <GlassCard className="w-full max-w-sm p-6 text-center border-red-500/50">
                        <Coins className="w-12 h-12 text-red-500 mx-auto mb-2" />
                        <h2 className="text-xl font-black text-white mb-2">LOW BALANCE</h2>
                        <p className="text-gray-400 text-xs mb-4">You need more credits to place this bet.</p>
                        <button onClick={() => window.location.href='/wallet'} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                            <Wallet size={16}/> DEPOSIT NOW
                        </button>
                        <button onClick={() => setShowLowBalance(false)} className="mt-3 text-gray-500 text-xs">Cancel</button>
                    </GlassCard>
                </div>
            )}

        </div>
    );
};

export default PlayView;