import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Flame, Users, Search, Trophy, 
    X, BarChart3, History, Lock, MapPin, Activity, ShieldAlert, Cpu, Target, Coins,
    ServerCrash
} from 'lucide-react';
import { useRouter } from 'next/router';

import { useGameSound } from '../../hooks/useGameSound';
import api from '../../services/api';
import CabinetSVG from '../visuals/CabinetSVG';
import CharacterSVG from '../visuals/CharacterSVG';
import IslandLandscapeSVG from '../visuals/IslandLandscapeSVG';
import GlobalTicker from '../ui/GlobalTicker';
import ActiveEvents from '../ui/ActiveEvents';

const MACHINES_PER_FLOOR = 90;

export default function HallView({ island, machines, user, onSelectMachine, onBack }) {
    const [filter, setFilter] = useState('ALL'); 
    const [search, setSearch] = useState('');
    const [currentFloor, setCurrentFloor] = useState(1);
    const [inspectingMachine, setInspectingMachine] = useState(null); 
    const [floorDirection, setFloorDirection] = useState(1);
    const [currentJackpot, setCurrentJackpot] = useState(0);
    
    const [showSearch, setShowSearch] = useState(false);
    const scrollContainerRef = useRef(null);

    const { playSound } = useGameSound();

    // --- FETCH JACKPOT ---
    useEffect(() => {
        const fetchJackpot = async () => {
            if (!island?.id) return;
            try {
                const res = await api.get(`/game/ticker.php?island_id=${island.id}`);
                if (res.data && res.data.jackpot_amount) setCurrentJackpot(res.data.jackpot_amount);
            } catch (e) {}
        };
        fetchJackpot(); 
        const intv = setInterval(fetchJackpot, 10000);
        return () => clearInterval(intv);
    }, [island?.id]);

    // --- LOGIC: Total Floors Calculation ---
    const totalFloors = useMemo(() => {
        if (!machines || machines.length === 0) return 1;
        const maxMachineNum = Math.max(...machines.map(m => m.machine_number));
        return Math.ceil(maxMachineNum / MACHINES_PER_FLOOR) || 1;
    }, [machines]);

    // --- LOGIC: Filter Machines for Current Floor ---
    const activeMachines = useMemo(() => {
        return (machines || []).filter(m => {
            const mFloor = Math.ceil(m.machine_number / MACHINES_PER_FLOOR);
            if (mFloor !== currentFloor) return false;

            if (search && !m.machine_number.toString().includes(search)) return false;
            if (filter === 'EMPTY') return m.status === 'free';
            if (filter === 'HOT') return parseFloat(m.total_payout) > 50000; 
            
            return true;
        });
    }, [machines, currentFloor, filter, search]);

    // --- METRICS ---
    const globalOccupied = useMemo(() => (machines || []).filter(m => m.status === 'occupied').length, [machines]);
    const globalRate = machines && machines.length > 0 ? Math.round((globalOccupied / machines.length) * 100) : 0;
    
    const floorOccupied = useMemo(() => activeMachines.filter(m => m.status === 'occupied').length, [activeMachines]);
    const floorTotal = activeMachines.length;
    const floorRate = floorTotal > 0 ? Math.round((floorOccupied / floorTotal) * 100) : 0;

    // --- HANDLERS ---
    const handleMachineClick = (m) => {
        playSound('click');
        if (m.status === 'occupied' && parseInt(m.current_user_id) !== parseInt(user?.id)) return;
        setInspectingMachine(m);
    };

    const handleEnterMachine = (m) => {
        playSound('click');
        setInspectingMachine(null);
        onSelectMachine(m);
    };

    const changeFloor = (newFloor) => {
        if (newFloor === currentFloor || newFloor < 1 || newFloor > totalFloors) return;
        playSound('spin'); 
        setFloorDirection(newFloor > currentFloor ? 1 : -1);
        setCurrentFloor(newFloor);
        
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    };

    // Auto-scroll slightly to hint at horizontal layout
    useEffect(() => {
        if (scrollContainerRef.current && activeMachines.length > 0) {
            const timer = setTimeout(() => {
                if (scrollContainerRef.current) {
                     scrollContainerRef.current.scrollTo({ left: 120, behavior: 'smooth' });
                }
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [currentFloor, activeMachines.length]);

    // PERFORMANCE FIX: Removed expensive blur() and rotateX() filters which kill mobile GPU on 90 SVG nodes.
    const floorVariants = {
        initial: (dir) => ({ x: dir * 100, opacity: 0 }),
        animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.02 } },
        exit: (dir) => ({ x: dir * -100, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } })
    };

    return (
        <div className="min-h-[100dvh] bg-[#050505] pb-6 relative overflow-hidden flex flex-col selection:bg-cyan-500 selection:text-black font-sans">
            
            {/* --- IMMERSIVE BACKGROUND (Optimized layers) --- */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 scale-105 opacity-30 transition-opacity duration-1000" style={{ transform: 'translateZ(0)' }}>
                    <IslandLandscapeSVG islandId={island?.id || 1} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 via-black to-black opacity-90"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            </div>

            <div className="relative z-50"><GlobalTicker /></div>
            <ActiveEvents />

            {/* --- RESPONSIVE HEADER --- */}
            <div className="pt-4 px-4 sm:px-6 pb-3 bg-black/80 backdrop-blur-md sticky top-8 z-40 border-b border-cyan-500/20 shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button onClick={() => { playSound('click'); onBack(); }} className="w-10 h-10 flex-shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors active:scale-95">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-cyan-400 mb-0.5 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                                <MapPin size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded shadow-inner">
                                    FLOOR {currentFloor} / {totalFloors}
                                </span>
                            </div>
                            <h2 className="text-white font-black text-xl sm:text-2xl italic uppercase tracking-wider leading-none drop-shadow-md truncate">
                                {island?.name || 'Unknown'}
                            </h2>
                            <div className="flex items-center gap-3 mt-1.5">
                                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-400 font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/10 shadow-inner">
                                    <span className={`w-1.5 h-1.5 rounded-full ${globalRate > 80 ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-green-500 shadow-[0_0_5px_green]'} animate-pulse`}></span>
                                    GLB: {globalRate}%
                                </div>
                                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-400 font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/10 shadow-inner">
                                    <span className={`w-1.5 h-1.5 rounded-full ${floorRate > 80 ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-blue-500 shadow-[0_0_5px_blue]'} animate-pulse`}></span>
                                    FLR: {floorRate}%
                                </div>
                            </div>
                        </div>

                        {/* Mobile Search Toggle */}
                        <button onClick={() => setShowSearch(!showSearch)} className="sm:hidden p-2 text-gray-400 hover:text-cyan-400 bg-white/5 rounded-lg border border-white/10 transition-colors">
                            <Search size={18} />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Search Input */}
                        <div className={`relative flex-1 sm:w-40 transition-all duration-300 ${showSearch ? 'block' : 'hidden sm:block'}`}>
                            <input 
                                type="text" 
                                placeholder="Search ID..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-black/60 border border-white/20 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-cyan-500 transition-colors font-mono shadow-inner placeholder:text-gray-600"
                            />
                            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"/>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex bg-black/50 p-1 rounded-lg border border-white/10 shadow-inner">
                            <button onClick={() => { playSound('click'); setFilter('ALL'); }} className={`px-3 py-1.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors ${filter === 'ALL' ? 'bg-cyan-600 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-gray-500 hover:text-white'}`}>
                                ALL
                            </button>
                            <button onClick={() => { playSound('click'); setFilter('EMPTY'); }} className={`px-3 py-1.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 ${filter === 'EMPTY' ? 'bg-green-600 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'text-gray-500 hover:text-white'}`}>
                                <Users size={12}/> FREE
                            </button>
                            <button onClick={() => { playSound('click'); setFilter('HOT'); }} className={`px-3 py-1.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 ${filter === 'HOT' ? 'bg-orange-600 text-black shadow-[0_0_10px_rgba(234,88,12,0.5)]' : 'text-gray-500 hover:text-white'}`}>
                                <Flame size={12}/> HOT
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex relative h-[calc(100vh-140px)]">
                
                {/* --- ELEVATOR UI (FLOOR SELECTOR) --- */}
                {totalFloors > 1 && (
                    <div className="w-14 sm:w-16 flex-shrink-0 bg-black/90 border-r border-white/10 flex flex-col items-center py-4 z-20 overflow-y-auto hide-scrollbar shadow-[10px_0_30px_rgba(0,0,0,0.6)] relative">
                        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-cyan-900/50 to-transparent -translate-x-1/2 pointer-events-none"></div>
                        
                        <div className="text-[8px] sm:text-[9px] text-cyan-500 font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-1 drop-shadow-[0_0_5px_cyan]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                            <Activity size={10} className="mb-2" /> ELEVATOR
                        </div>
                        
                        <div className="flex flex-col gap-3 w-full px-2 relative z-10">
                            {Array.from({length: totalFloors}).map((_, i) => {
                                const fl = i + 1;
                                const isActive = currentFloor === fl;
                                return (
                                    <button 
                                        key={fl}
                                        onClick={() => changeFloor(fl)}
                                        className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center font-black transition-all duration-200 relative group overflow-hidden
                                            ${isActive ? 'bg-cyan-500 text-black shadow-[0_0_15px_cyan] scale-105 border-2 border-white' : 'bg-gray-900/80 text-gray-500 border border-white/5 hover:bg-gray-800 hover:text-cyan-400 hover:border-cyan-500/50'}
                                        `}
                                    >
                                        <span className="text-xs sm:text-sm relative z-10 font-mono">{fl}</span>
                                        <span className={`text-[6px] sm:text-[7px] relative z-10 mt-0.5 ${isActive ? 'opacity-80 text-black' : 'opacity-40'}`}>FLR</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- CASINO FLOOR (Hardware Accelerated Scroll) --- */}
                <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-x-auto overflow-y-hidden flex items-center px-6 md:px-12 hide-scrollbar z-10 relative scroll-smooth"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        maskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)'
                    }}
                >
                    <AnimatePresence mode="wait" custom={floorDirection}>
                        <motion.div 
                            key={currentFloor}
                            custom={floorDirection}
                            variants={floorVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="flex gap-6 sm:gap-8 md:gap-12 items-end h-full w-max min-w-full pb-8 sm:pb-12 pt-10"
                            style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity' }} // GPU Acceleration
                        >
                            
                            {/* Floor Signage (Left) */}
                            <div className="flex-shrink-0 w-16 sm:w-24 h-[50vh] flex flex-col justify-end pb-12 sm:pb-24 opacity-20 select-none pointer-events-none">
                                <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-t from-white to-gray-800 italic" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                    FLOOR {currentFloor}
                                </div>
                            </div>

                            {activeMachines.length === 0 ? (
                                <div className="w-[70vw] flex flex-col items-center justify-center text-gray-600 h-[50vh]">
                                    <ServerCrash className="w-16 h-16 opacity-20 mb-4"/>
                                    <p className="text-sm font-mono tracking-widest bg-black/50 px-4 py-2 rounded-lg border border-white/5">NO_UNITS_FOUND</p>
                                </div>
                            ) : (
                                activeMachines.map((m) => {
                                    const isOccupied = m.status === 'occupied';
                                    const isMe = user && parseInt(m.current_user_id) === parseInt(user.id);
                                    const isHot = parseFloat(m.total_payout) > 50000;
                                    const isJackpot = parseFloat(m.total_payout) > 500000;
                                    
                                    const relativeNum = ((parseInt(m.machine_number) - 1) % MACHINES_PER_FLOOR) + 1;
                                    const displayId = `${currentFloor}-${relativeNum.toString().padStart(2, '0')}`;
                                    
                                    return (
                                        <div 
                                            key={m.id} 
                                            onClick={() => handleMachineClick(m)} 
                                            className={`relative group cursor-pointer transition-transform duration-300 will-change-transform hover:-translate-y-4 hover:scale-[1.02] flex-shrink-0 flex items-end
                                                ${isOccupied && !isMe ? 'opacity-60 grayscale-[0.5] hover:opacity-80' : ''}
                                            `}
                                            style={{ 
                                                width: 'min(70vw, 240px)', 
                                                height: '65vh',
                                                maxHeight: '700px',
                                                minHeight: '380px',
                                                zIndex: isMe ? 40 : (isOccupied ? 10 : 20),
                                                transform: 'translateZ(0)' // Force hardware rendering
                                            }}
                                        >
                                            {/* Spotlight for Hot Machines */}
                                            {isHot && !isOccupied && (
                                                <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-32 h-[120%] bg-gradient-to-b from-yellow-500/20 to-transparent blur-2xl pointer-events-none z-0 mix-blend-screen"></div>
                                            )}

                                            {/* Overhead Floating Signs */}
                                            {isMe && (
                                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-green-500 text-black font-black text-xs px-4 py-1 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] z-50 whitespace-nowrap border border-white flex items-center gap-1">
                                                    <Users size={12}/> YOUR LINK
                                                </div>
                                            )}
                                            {isJackpot && !isMe && (
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-[9px] px-3 py-1 rounded-full shadow-[0_0_15px_purple] z-50 whitespace-nowrap border border-white/30 flex items-center gap-1">
                                                    <Trophy size={10}/> HIGH YIELD
                                                </div>
                                            )}
                                            {isHot && !isJackpot && !isMe && !isOccupied && (
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-40">
                                                    <Flame size={24} className="text-orange-400 fill-orange-500 animate-pulse drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]"/>
                                                </div>
                                            )}

                                            {/* Machine Body */}
                                            <div className="relative w-full aspect-[0.6] flex items-end justify-center mb-4">
                                                
                                                {/* Core Cabinet Render - Optimized drop-shadow usage */}
                                                <div className="absolute inset-0 z-10 w-full h-full" style={{ filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.8))' }}>
                                                    <CabinetSVG 
                                                        islandId={parseInt(island?.id || 1)} 
                                                        visualState={isOccupied ? 'BUSY' : (isHot ? 'JACKPOT_HOT' : 'FREE')} 
                                                        mode="hall" 
                                                        stats={{ laps: m.total_laps, wins: m.total_payout }} 
                                                        charId={island?.hostess_char_id || 'luna'} 
                                                        machineNumber={displayId} 
                                                        serialNumber={m.serial_number}
                                                        machine={m}
                                                        currentJackpot={currentJackpot}
                                                    />
                                                </div>

                                                {/* Occupant Overlay */}
                                                {isOccupied && (
                                                    <div className="absolute bottom-[2%] right-[-25%] w-[60%] h-[65%] z-20 pointer-events-none opacity-90 transition-transform duration-500 group-hover:scale-105 group-hover:-translate-x-1" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.6))' }}>
                                                        <CharacterSVG 
                                                            type={m.sticker_char_id || 'luna'} 
                                                            mood="idle" 
                                                        />
                                                    </div>
                                                )}
                                                
                                                {/* Secure Lock Overlay */}
                                                {isOccupied && !isMe && (
                                                    <div className="absolute inset-0 bg-black/50 z-30 flex flex-col items-center justify-center rounded-2xl border border-white/5 transition-opacity duration-300 group-hover:bg-black/30">
                                                        <div className="bg-red-950/90 text-red-500 font-black text-[9px] sm:text-[10px] px-3 py-1.5 rounded border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center gap-1.5">
                                                            <Lock size={12}/> SECURED LINK
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {!isOccupied && (
                                                <div className="absolute bottom-[8%] left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                                                    <div className="bg-cyan-500 text-black font-black text-[9px] sm:text-[10px] px-4 py-2 rounded-full shadow-[0_0_20px_cyan] flex items-center gap-1 transform scale-95 group-hover:scale-100 transition-transform border border-white">
                                                        <Cpu size={12}/> INITIALIZE
                                                    </div>
                                                </div>
                                            )}

                                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-black blur-xl rounded-full opacity-80 pointer-events-none z-0"></div>
                                        </div>
                                    );
                                })
                            )}
                            
                            {/* Floor Signage (Right End Spacer) */}
                            {activeMachines.length > 0 && (
                                <div className="w-12 sm:w-16 flex-shrink-0 h-[50vh] border-l-2 border-dashed border-white/10 ml-4 relative opacity-30 flex items-end pb-12 sm:pb-24">
                                    <div className="absolute bottom-12 left-2 text-white font-black text-xl sm:text-3xl italic whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                        END FLR {currentFloor}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* --- MACHINE INSPECTOR MODAL (Optimized Animations) --- */}
            <AnimatePresence>
                {inspectingMachine && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm" 
                        onClick={() => setInspectingMachine(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-sm p-0 overflow-hidden bg-[#0a0c10] border border-cyan-500/40 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.15)] relative" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-5 pointer-events-none mix-blend-screen"></div>
                            
                            <div className="bg-cyan-950/40 p-4 flex justify-between items-center border-b border-cyan-500/20 relative z-10">
                                <div>
                                    <h3 className="text-white font-black text-xl italic tracking-widest drop-shadow-md flex items-center gap-2">
                                        <Cpu size={20} className="text-cyan-400"/>
                                        UNIT #{currentFloor}-{( ((parseInt(inspectingMachine.machine_number) - 1) % MACHINES_PER_FLOOR) + 1 ).toString().padStart(2,'0')}
                                    </h3>
                                    <div className="text-[9px] text-cyan-300 font-bold tracking-widest uppercase flex items-center gap-1 mt-0.5 opacity-80">
                                        <MapPin size={10} /> {island?.name} • FLR {currentFloor}
                                    </div>
                                </div>
                                <button onClick={() => setInspectingMachine(null)} className="text-white/50 hover:text-white bg-white/5 p-2 rounded-full border border-white/10 transition-colors"><X size={16}/></button>
                            </div>

                            <div className="p-5 space-y-4 relative z-10">
                                <div className="flex gap-2 mb-2">
                                    <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-center shadow-inner relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent"></div>
                                        <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex justify-center items-center gap-1"><Target size={10}/> Tenjo Target</div>
                                        <div className="text-red-400 font-mono font-bold text-sm">
                                            {inspectingMachine.laps_since_bonus || (inspectingMachine.total_laps % 777)} <span className="text-[9px] text-gray-600">/ 777</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-center shadow-inner">
                                        <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex justify-center items-center gap-1"><Activity size={10}/> AI Status</div>
                                        <div className={`font-mono font-bold text-xs ${parseFloat(inspectingMachine.total_payout) > 500000 ? 'text-orange-400' : 'text-cyan-400'}`}>
                                            {parseFloat(inspectingMachine.total_payout) > 500000 ? 'OVERHEATING' : 'GATHERING'}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/30 p-4 rounded-xl border border-white/5 shadow-inner">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-950/50 flex items-center justify-center border border-blue-500/30">
                                                <History size={14} className="text-blue-400"/>
                                            </div>
                                            <div>
                                                <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Lifetime Spins</div>
                                                <div className="text-white font-mono font-bold text-base leading-none">{parseInt(inspectingMachine.total_laps).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                         <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-yellow-950/50 flex items-center justify-center border border-yellow-500/30">
                                                <Coins size={14} className="text-yellow-400"/>
                                            </div>
                                            <div>
                                                <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Total Payouts</div>
                                                <div className="text-yellow-400 font-mono font-black text-base leading-none">{parseFloat(inspectingMachine.total_payout).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/40 p-3 rounded-xl border border-white/5 relative overflow-hidden h-20 flex flex-col justify-between">
                                    <div className="flex items-center gap-1.5 text-[8px] text-gray-500 font-bold uppercase tracking-widest relative z-10">
                                        <BarChart3 size={10} className="text-cyan-500"/> Core Telemetry
                                    </div>
                                    <div className="flex items-end gap-1 relative z-10 h-10 w-full mt-2">
                                        {Array.from({length: 30}).map((_, i) => {
                                            const hash = (inspectingMachine.id * i * 17) % 100;
                                            const isSpike = hash > 85;
                                            return (
                                                <div 
                                                    key={i} 
                                                    className={`flex-1 rounded-t opacity-80 ${isSpike ? 'bg-yellow-500' : 'bg-cyan-800'}`} 
                                                    style={{height: `${Math.max(10, hash)}%`}}
                                                ></div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="text-[8px] text-green-500/60 flex items-center gap-1.5 justify-center bg-green-950/10 py-1.5 rounded border border-green-900/20 uppercase tracking-widest">
                                    <ShieldAlert size={10} /> AES-256 Link Validated
                                </div>

                                <button 
                                    onClick={() => handleEnterMachine(inspectingMachine)}
                                    className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-black text-black text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform mt-2 border border-cyan-300/50 tracking-widest"
                                >
                                    <Zap size={16} fill="currentColor"/> ESTABLISH SECURE LINK
                                </button>
                                
                                <div className="text-center text-[8px] text-gray-600 font-mono mt-1">
                                    SYS_ID: {inspectingMachine.id} | {inspectingMachine.serial_number || 'UNKNOWN'}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
        </div>
    );
}