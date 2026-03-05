import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Flame, Users, Zap, Search, Trophy, 
    X, BarChart3, History, Lock, MapPin, Activity, ShieldAlert, Cpu, Target
} from 'lucide-react';
import CabinetSVG from '../visuals/CabinetSVG';
import CharacterSVG from '../visuals/CharacterSVG';
import IslandLandscapeSVG from '../visuals/IslandLandscapeSVG';
import GlobalTicker from '../ui/GlobalTicker';
import ActiveEvents from '../ui/ActiveEvents';
import GlassCard from '../ui/GlassCard';
import { useGameSound } from '../../hooks/useGameSound';

const MACHINES_PER_FLOOR = 90;

export default function HallView({ island, machines, user, onSelectMachine, onBack }) {
    const [filter, setFilter] = useState('ALL'); // ALL, EMPTY, HOT
    const [search, setSearch] = useState('');
    const [currentFloor, setCurrentFloor] = useState(1);
    const [inspectingMachine, setInspectingMachine] = useState(null); 
    const [floorDirection, setFloorDirection] = useState(1);
    
    // UI States
    const [showSearch, setShowSearch] = useState(false);
    const scrollContainerRef = useRef(null);

    const { playSound } = useGameSound();

    // --- LOGIC: Total Floors Calculation ---
    const totalFloors = useMemo(() => {
        if (!machines || machines.length === 0) return 1;
        const maxMachineNum = Math.max(...machines.map(m => m.machine_number));
        return Math.ceil(maxMachineNum / MACHINES_PER_FLOOR) || 1;
    }, [machines]);

    // --- LOGIC: Filter Machines for Current Floor ---
    const activeMachines = useMemo(() => {
        return machines.filter(m => {
            const mFloor = Math.ceil(m.machine_number / MACHINES_PER_FLOOR);
            if (mFloor !== currentFloor) return false;

            if (search && !m.machine_number.toString().includes(search)) return false;
            if (filter === 'EMPTY') return m.status === 'free';
            if (filter === 'HOT') return parseFloat(m.total_payout) > 50000; 
            
            return true;
        });
    }, [machines, currentFloor, filter, search]);

    // --- METRICS ---
    const globalOccupied = useMemo(() => machines.filter(m => m.status === 'occupied').length, [machines]);
    const globalRate = machines.length > 0 ? Math.round((globalOccupied / machines.length) * 100) : 0;
    
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
        playSound('spin'); // Tech sound for elevator
        setFloorDirection(newFloor > currentFloor ? 1 : -1);
        setCurrentFloor(newFloor);
        
        // Reset scroll position when changing floors
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    };

    // Auto-scroll to center on mount/floor change to establish perspective
    useEffect(() => {
        if (scrollContainerRef.current && activeMachines.length > 0) {
            // Scroll slightly to the right to make it obvious there are more machines
            setTimeout(() => {
                if (scrollContainerRef.current) {
                     scrollContainerRef.current.scrollTo({ left: 100, behavior: 'smooth' });
                }
            }, 500);
        }
    }, [currentFloor, activeMachines.length]);

    // --- ANIMATION VARIANTS (Cinematic Elevator) ---
    const floorVariants = {
        initial: (dir) => ({ 
            y: dir * 200, 
            opacity: 0, 
            scale: 0.85, 
            filter: 'blur(15px)',
            rotateX: dir * 15
        }),
        animate: { 
            y: 0, 
            opacity: 1, 
            scale: 1, 
            filter: 'blur(0px)',
            rotateX: 0
        },
        exit: (dir) => ({ 
            y: dir * -200, 
            opacity: 0, 
            scale: 1.15, 
            filter: 'blur(15px)',
            rotateX: dir * -15
        })
    };


    return (
        <div className="min-h-[100dvh] bg-[#050505] pb-6 relative overflow-hidden flex flex-col selection:bg-cyan-500 selection:text-black">
            
            {/* --- IMMERSIVE BACKGROUND --- */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 scale-110 blur-[2px] opacity-40 transition-all duration-1000">
                    <IslandLandscapeSVG islandId={island.id} />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black opacity-80"></div>
                {/* Tech Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            </div>

            <div className="relative z-50"><GlobalTicker /></div>
            <ActiveEvents />

            {/* --- RESPONSIVE HEADER --- */}
            <div className="pt-4 px-4 sm:px-6 pb-3 bg-black/80 backdrop-blur-xl sticky top-8 z-40 border-b border-cyan-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button onClick={() => { playSound('click'); onBack(); }} className="w-10 h-10 flex-shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/50 transition-all active:scale-95 shadow-lg">
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
                                {island.name}
                            </h2>
                            <div className="flex items-center gap-3 mt-1.5">
                                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-400 font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                    <span className={`w-1.5 h-1.5 rounded-full ${globalRate > 80 ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-green-500 shadow-[0_0_5px_green]'} animate-pulse`}></span>
                                    GLB: {globalRate}%
                                </div>
                                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-400 font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                    <span className={`w-1.5 h-1.5 rounded-full ${floorRate > 80 ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-blue-500 shadow-[0_0_5px_blue]'} animate-pulse`}></span>
                                    FLR: {floorRate}%
                                </div>
                            </div>
                        </div>

                        {/* Mobile Search Toggle */}
                        <button onClick={() => setShowSearch(!showSearch)} className="sm:hidden p-2 text-gray-400 hover:text-cyan-400 bg-white/5 rounded-lg border border-white/10">
                            <Search size={18} />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Search Input (Hidden on mobile unless toggled) */}
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
                            <button onClick={() => { playSound('click'); setFilter('ALL'); }} className={`px-3 py-1.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all ${filter === 'ALL' ? 'bg-cyan-600 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-gray-500 hover:text-white'}`}>
                                ALL
                            </button>
                            <button onClick={() => { playSound('click'); setFilter('EMPTY'); }} className={`px-3 py-1.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${filter === 'EMPTY' ? 'bg-green-600 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'text-gray-500 hover:text-white'}`}>
                                <Users size={12}/> FREE
                            </button>
                            <button onClick={() => { playSound('click'); setFilter('HOT'); }} className={`px-3 py-1.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${filter === 'HOT' ? 'bg-orange-600 text-black shadow-[0_0_10px_rgba(234,88,12,0.5)]' : 'text-gray-500 hover:text-white'}`}>
                                <Flame size={12}/> HOT
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex relative h-[calc(100vh-140px)]">
                
                {/* --- ELEVATOR UI (FLOOR SELECTOR) --- */}
                {totalFloors > 1 && (
                    <div className="w-12 sm:w-16 flex-shrink-0 bg-black/80 border-r border-white/10 flex flex-col items-center py-4 z-20 overflow-y-auto hide-scrollbar backdrop-blur-md shadow-[10px_0_30px_rgba(0,0,0,0.8)] relative">
                        {/* Elevator Track styling */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gradient-to-b from-transparent via-cyan-900/50 to-transparent -translate-x-1/2 pointer-events-none"></div>
                        
                        <div className="text-[8px] sm:text-[9px] text-cyan-500 font-black uppercase tracking-[0.3em] mb-6 opacity-80 flex items-center gap-1" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                            <Activity size={10} className="mb-2" /> ELEVATOR
                        </div>
                        
                        <div className="flex flex-col gap-2 sm:gap-3 w-full px-1.5 sm:px-2 relative z-10">
                            {Array.from({length: totalFloors}).map((_, i) => {
                                const fl = i + 1;
                                const isActive = currentFloor === fl;
                                return (
                                    <button 
                                        key={fl}
                                        onClick={() => changeFloor(fl)}
                                        className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center font-black transition-all duration-300 relative group overflow-hidden
                                            ${isActive ? 'bg-cyan-500 text-black shadow-[0_0_15px_cyan] scale-110 border-2 border-white' : 'bg-gray-900 text-gray-500 border border-white/10 hover:bg-gray-800 hover:text-gray-300'}
                                        `}
                                    >
                                        {isActive && <div className="absolute inset-0 bg-white/30 animate-pulse"></div>}
                                        <span className="text-xs sm:text-sm relative z-10">{fl}</span>
                                        <span className={`text-[6px] sm:text-[7px] relative z-10 mt-0.5 ${isActive ? 'opacity-80' : 'opacity-40'}`}>FLR</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- CASINO FLOOR (3D Perspective Horizontal Scroll) --- */}
                <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-x-auto overflow-y-hidden perspective-1000 flex items-center px-4 md:px-12 hide-scrollbar z-10 relative scroll-smooth"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        // Create a subtle vignette effect at the edges of the scroll container
                        maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
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
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="flex gap-4 sm:gap-6 md:gap-10 items-end h-full w-max min-w-full pb-8 sm:pb-12 pt-10"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            
                            {/* Floor Signage (Left) */}
                            <div className="flex-shrink-0 w-24 sm:w-32 h-[50vh] flex flex-col justify-end pb-12 sm:pb-24 opacity-20 select-none pointer-events-none pl-4">
                                <div className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-t from-white to-gray-800 italic" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                    FLOOR {currentFloor}
                                </div>
                            </div>

                            {activeMachines.length === 0 ? (
                                <div className="w-[80vw] flex flex-col items-center justify-center text-gray-600 h-[50vh]">
                                    <div className="relative mb-4">
                                        <Search className="w-16 h-16 opacity-20"/>
                                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
                                    </div>
                                    <p className="text-sm font-mono tracking-widest bg-black/50 px-4 py-2 rounded-lg border border-white/5">NO_UNITS_FOUND</p>
                                </div>
                            ) : (
                                activeMachines.map((m) => {
                                    const isOccupied = m.status === 'occupied';
                                    // Parse user ID safely
                                    const isMe = user && parseInt(m.current_user_id) === parseInt(user.id);
                                    const isHot = parseFloat(m.total_payout) > 50000;
                                    const isJackpot = parseFloat(m.total_payout) > 500000;
                                    
                                    // Calculate relative number for display (e.g. 1-01)
                                    const relativeNum = ((parseInt(m.machine_number) - 1) % MACHINES_PER_FLOOR) + 1;
                                    const displayId = `${currentFloor}-${relativeNum.toString().padStart(2, '0')}`;
                                    
                                    return (
                                        <div 
                                            key={m.id} 
                                            onClick={() => handleMachineClick(m)} 
                                            className={`relative group cursor-pointer transition-all duration-500 transform hover:-translate-y-4 hover:scale-[1.02] flex-shrink-0 flex items-end
                                                ${isOccupied && !isMe ? 'opacity-60 grayscale-[0.5] hover:opacity-80' : ''}
                                            `}
                                            style={{ 
                                                width: 'min(75vw, 260px)', // Responsive width based on viewport
                                                height: '65vh',
                                                maxHeight: '750px',
                                                minHeight: '400px',
                                                zIndex: isMe ? 40 : (isOccupied ? 10 : 20)
                                            }}
                                        >
                                            {/* Spotlight for Hot Machines */}
                                            {isHot && !isOccupied && (
                                                <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-48 h-[140%] bg-gradient-to-b from-yellow-500/30 via-yellow-500/5 to-transparent blur-2xl pointer-events-none z-0 mix-blend-screen"></div>
                                            )}

                                            {/* Overhead Floating Signs */}
                                            {isMe && (
                                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-green-500 text-black font-black text-xs px-4 py-1.5 rounded-full animate-bounce shadow-[0_0_20px_rgba(34,197,94,0.8)] z-50 whitespace-nowrap border-2 border-white flex items-center gap-1">
                                                    <Users size={12}/> YOUR ACTIVE LINK
                                                </div>
                                            )}
                                            {isJackpot && !isMe && (
                                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-[10px] px-3 py-1 rounded-full animate-pulse shadow-[0_0_20px_purple] z-50 whitespace-nowrap border border-white/50 flex items-center gap-1">
                                                    <Trophy size={10}/> HIGH YIELD
                                                </div>
                                            )}
                                            {isHot && !isJackpot && !isMe && !isOccupied && (
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-40">
                                                    <Flame size={28} className="text-orange-400 fill-orange-500 animate-bounce drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]"/>
                                                </div>
                                            )}

                                            {/* Machine Body */}
                                            <div className="relative w-full aspect-[0.6] flex items-end justify-center mb-6">
                                                
                                                {/* Core Cabinet Render */}
                                                <div className="absolute inset-0 z-10 w-full h-full drop-shadow-[0_20px_25px_rgba(0,0,0,0.9)]">
                                                    <CabinetSVG 
                                                        islandId={parseInt(island.id)} 
                                                        visualState={isOccupied ? 'BUSY' : (isHot ? 'JACKPOT_HOT' : 'FREE')} 
                                                        mode="hall" 
                                                        stats={{ laps: m.total_laps, wins: m.total_payout }} 
                                                        charId={island.hostess_char_id} 
                                                        machineNumber={displayId} 
                                                        serialNumber={m.serial_number}
                                                        machine={m}
                                                    />
                                                </div>

                                                {/* Occupant 3D Projection Overlay */}
                                                {isOccupied && (
                                                    <div className="absolute bottom-[2%] right-[-30%] w-[60%] h-[65%] z-20 pointer-events-none drop-shadow-2xl opacity-90 transition-transform duration-700 group-hover:scale-105 group-hover:-translate-x-2">
                                                        <CharacterSVG 
                                                            type={m.sticker_char_id || 'luna'} 
                                                            mood="idle" 
                                                        />
                                                    </div>
                                                )}
                                                
                                                {/* Secure Lock Overlay for occupied machines */}
                                                {isOccupied && !isMe && (
                                                    <div className="absolute inset-0 bg-black/60 z-30 flex flex-col items-center justify-center rounded-2xl backdrop-blur-[2px] border border-white/5 transition-opacity duration-300 group-hover:bg-black/40">
                                                        <div className="bg-red-950/80 text-red-500 font-black text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 rounded-lg border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-1.5">
                                                            <Lock size={12}/> SECURED LINK
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Hover Action Button (Hidden on touch devices usually, relies on click handler) */}
                                            {!isOccupied && (
                                                <div className="absolute bottom-[10%] left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">
                                                    <div className="bg-cyan-500 text-black font-black text-[10px] sm:text-xs px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-[0_0_30px_cyan] flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform border-2 border-white">
                                                        <Cpu size={14}/> INITIALIZE
                                                    </div>
                                                </div>
                                            )}

                                            {/* Floor Reflection / Shadow */}
                                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-black blur-xl rounded-full opacity-80 pointer-events-none z-0"></div>
                                            {isHot && !isOccupied && (
                                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[60%] h-4 bg-yellow-500 blur-lg rounded-full opacity-30 pointer-events-none z-0"></div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            
                            {/* Floor Signage (Right End Spacer) */}
                            {activeMachines.length > 0 && (
                                <div className="w-16 sm:w-24 flex-shrink-0 h-[50vh] border-l-2 border-dashed border-white/10 ml-4 sm:ml-8 relative opacity-30 flex items-end pb-12 sm:pb-24">
                                    <div className="absolute bottom-12 left-4 text-white font-black text-2xl sm:text-4xl italic whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                        END FLR {currentFloor}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* --- MACHINE INSPECTOR MODAL (Cyber UI) --- */}
            <AnimatePresence>
                {inspectingMachine && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md" 
                        onClick={() => setInspectingMachine(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-sm p-0 overflow-hidden bg-gradient-to-b from-gray-900 to-black border border-cyan-500/50 rounded-[2rem] shadow-[0_0_50px_rgba(6,182,212,0.2)] relative" 
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Tech Background overlay */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 pointer-events-none mix-blend-color-dodge"></div>
                            
                            {/* Scanline Effect */}
                            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-0"></div>
                            
                            {/* Header */}
                            <div className="bg-cyan-950/50 p-5 flex justify-between items-center border-b border-cyan-500/30 relative z-10">
                                <div>
                                    <h3 className="text-white font-black text-2xl italic tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] flex items-center gap-2">
                                        <Cpu size={24} className="text-cyan-400"/>
                                        UNIT #{currentFloor}-{( ((parseInt(inspectingMachine.machine_number) - 1) % MACHINES_PER_FLOOR) + 1 ).toString().padStart(2,'0')}
                                    </h3>
                                    <div className="text-[10px] text-cyan-300 font-bold tracking-widest uppercase flex items-center gap-1 mt-1">
                                        <MapPin size={10} /> {island.name} • FLR {currentFloor}
                                    </div>
                                </div>
                                <button onClick={() => setInspectingMachine(null)} className="text-white/50 hover:text-white bg-black/40 p-2 rounded-full border border-white/10 transition-colors"><X size={18}/></button>
                            </div>

                            {/* Body */}
                            <div className="p-5 space-y-4 relative z-10">
                                
                                {/* Engine Specs & Predictive AI (Replaces RTP) */}
                                <div className="flex gap-2 mb-2">
                                    <div className="flex-1 bg-black/60 border border-white/10 rounded-xl p-3 text-center shadow-inner relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent"></div>
                                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex justify-center items-center gap-1"><Target size={10}/> Tenjo Target</div>
                                        <div className="text-red-400 font-mono font-bold text-sm">
                                            {inspectingMachine.laps_since_bonus || (inspectingMachine.total_laps % 777)} <span className="text-[9px] text-gray-500">/ 777</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-black/60 border border-white/10 rounded-xl p-3 text-center shadow-inner">
                                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex justify-center items-center gap-1"><Activity size={10}/> AI Status</div>
                                        <div className={`font-mono font-bold text-sm ${parseFloat(inspectingMachine.total_payout) > 500000 ? 'text-orange-400 animate-pulse' : 'text-cyan-400'}`}>
                                            {parseFloat(inspectingMachine.total_payout) > 500000 ? 'OVERHEATING' : 'GATHERING'}
                                        </div>
                                    </div>
                                </div>

                                {/* Main Stats */}
                                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                                <History size={18} className="text-blue-400"/>
                                            </div>
                                            <div>
                                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Lifetime Spins</div>
                                                <div className="text-white font-mono font-bold text-lg leading-none">{parseInt(inspectingMachine.total_laps).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                         <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-yellow-950 flex items-center justify-center border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                                <Coins size={18} className="text-yellow-400"/>
                                            </div>
                                            <div>
                                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Total Payouts</div>
                                                <div className="text-yellow-400 font-mono font-black text-lg leading-none">{parseFloat(inspectingMachine.total_payout).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mock Trend Chart */}
                                <div className="bg-black/60 p-4 rounded-2xl border border-white/5 relative overflow-hidden h-24 flex flex-col justify-between">
                                    <div className="flex items-center gap-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest relative z-10">
                                        <BarChart3 size={12} className="text-cyan-500"/> Core Telemetry (Last 50)
                                    </div>
                                    <div className="flex items-end gap-1 relative z-10 h-12 w-full mt-2">
                                        {/* Generate predictable random bars based on machine ID for visual stability */}
                                        {Array.from({length: 30}).map((_, i) => {
                                            const hash = (inspectingMachine.id * i * 17) % 100;
                                            const isSpike = hash > 85;
                                            return (
                                                <div 
                                                    key={i} 
                                                    className={`flex-1 rounded-t opacity-90 transition-all ${isSpike ? 'bg-yellow-400 shadow-[0_0_5px_gold]' : 'bg-cyan-800'}`} 
                                                    style={{height: `${Math.max(10, hash)}%`}}
                                                ></div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Security Badge */}
                                <div className="text-[8px] text-green-500/80 flex items-center gap-1.5 justify-center bg-green-950/20 py-1.5 rounded-lg border border-green-900/30 uppercase tracking-widest">
                                    <ShieldAlert size={10} /> AES-256 Link Encrypted & Validated
                                </div>

                                {/* Main Action */}
                                <button 
                                    onClick={() => handleEnterMachine(inspectingMachine)}
                                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-black text-black text-sm shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all mt-4 border border-cyan-300 tracking-widest"
                                >
                                    <Zap size={18} fill="currentColor"/> ESTABLISH SECURE LINK
                                </button>
                                
                                <div className="text-center text-[8px] text-gray-600 font-mono mt-2">
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