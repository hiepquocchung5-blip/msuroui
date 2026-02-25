import React, { useState, useMemo } from 'react';
import { ChevronLeft, Flame, Users, Zap, Search, Trophy, Sparkles, X, BarChart3, History, Coins, Lock, Leaf, Gamepad2, Castle, Flower, Ghost, Waves, CloudRain, Cpu, Palmtree, Sword, ShieldAlert } from 'lucide-react';
import CabinetSVG from '../visuals/CabinetSVG';
import CharacterSVG from '../visuals/CharacterSVG';
import IslandLandscapeSVG from '../visuals/IslandLandscapeSVG';
import BottomDock from '../layout/BottomDock';
import GlobalTicker from '../ui/GlobalTicker';
import ActiveEvents from '../ui/ActiveEvents';
import GlassCard from '../ui/GlassCard';
import { useGameSound } from '../../hooks/useGameSound';
import { useRouter } from 'next/router';

// Map the DB 'icon_key' string to a Lucide React Component for the 10 Japanese Themes
const getIslandIcon = (key) => {
    switch(key) {
        case 'leaf': return <Leaf size={20} />;         // Kyoto Zen
        case 'gamepad': return <Gamepad2 size={20} />;  // Neon Arcade
        case 'castle': return <Castle size={20} />;     // Edo Castle
        case 'flower': return <Flower size={20} />;     // Hanami
        case 'ghost': return <Ghost size={20} />;       // Yokai
        case 'hotspring': return <Waves size={20} />;   // Onsen
        case 'wheat': return <CloudRain size={20} />;   // Rural
        case 'cpu': return <Cpu size={20} />;           // Cyber
        case 'palmtree': return <Palmtree size={20} />; // Okinawa
        case 'sword': return <Sword size={20} />;       // Ninja
        default: return <MapPin size={20} />;
    }
};

const HallView = ({ island, machines, user, onSelectMachine, onBack }) => {
    const [filter, setFilter] = useState('ALL'); // ALL, EMPTY, HOT
    const [search, setSearch] = useState('');
    const [inspectingMachine, setInspectingMachine] = useState(null); 
    const { playSound } = useGameSound();
    const router = useRouter();

    // --- LOGIC: Filter Machines ---
    const filteredMachines = useMemo(() => {
        return machines.filter(m => {
            // 1. Search Query (Machine ID)
            if (search && !m.machine_number.toString().includes(search)) return false;
            
            // 2. Tab Filters
            if (filter === 'EMPTY') return m.status === 'free';
            if (filter === 'HOT') return m.total_payout > 50000; // Adjusted threshold for micro-wins
            
            return true;
        });
    }, [machines, filter, search]);

    // Calculate Occupancy
    const occupiedCount = machines.filter(m => m.status === 'occupied').length;
    const occupancyRate = machines.length > 0 ? Math.round((occupiedCount / machines.length) * 100) : 0;

    // Handlers
    const handleMachineClick = (m) => {
        playSound('click');
        if (m.status === 'occupied' && m.current_user_id !== user.id) {
            // If occupied by someone else, prevent interaction
            return;
        }
        // Open Inspector
        setInspectingMachine(m);
    };

    const handleEnterMachine = (m) => {
        playSound('click');
        setInspectingMachine(null);
        onSelectMachine(m);
    };

    const handleFilterChange = (newFilter) => {
        playSound('click');
        setFilter(newFilter);
    };

    return (
        <div className="min-h-screen bg-black pb-24 relative overflow-hidden flex flex-col">
            
            {/* --- BACKGROUND --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 scale-110 blur-sm opacity-50 transition-all duration-1000">
                    <IslandLandscapeSVG islandId={island.id} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>
            </div>

            <GlobalTicker />
            <ActiveEvents />

            {/* --- HEADER --- */}
            <div className="p-4 pt-6 bg-black/80 backdrop-blur-md sticky top-8 z-30 border-b border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { playSound('click'); onBack(); }} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors active:scale-95">
                            <ChevronLeft />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-cyan-400 mb-1 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                                {getIslandIcon(island.icon_emoji)}
                            </div>
                            <h2 className="text-white font-black text-xl italic uppercase tracking-wider leading-none drop-shadow-md">
                                {island.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${occupancyRate > 80 ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-green-500 shadow-[0_0_8px_green]'} animate-pulse`}></span>
                                <span className="text-[10px] text-gray-400 font-bold tracking-widest">{occupancyRate}% OCCUPIED</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Search Input */}
                    <div className="relative w-32">
                        <input 
                            type="text" 
                            placeholder="#ID" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/50 border border-white/20 rounded-full py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-cyan-500 transition-colors font-mono shadow-inner"
                        />
                        <Search size={12} className="absolute left-2.5 top-2 text-gray-500"/>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                    <button onClick={() => handleFilterChange('ALL')} className={`px-4 py-2 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap ${filter === 'ALL' ? 'bg-white text-black border-white shadow-[0_0_10px_white]' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'}`}>
                        ALL MACHINES
                    </button>
                    <button onClick={() => handleFilterChange('EMPTY')} className={`px-4 py-2 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 whitespace-nowrap ${filter === 'EMPTY' ? 'bg-green-600 text-white border-green-600 shadow-[0_0_10px_green]' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'}`}>
                        <Users size={12}/> EMPTY SEATS
                    </button>
                    <button onClick={() => handleFilterChange('HOT')} className={`px-4 py-2 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 whitespace-nowrap ${filter === 'HOT' ? 'bg-red-600 text-white border-red-600 shadow-[0_0_10px_red]' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'}`}>
                        <Flame size={12}/> HOT
                    </button>
                </div>
            </div>

            {/* --- CASINO FLOOR (3D Perspective Scroll) --- */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden perspective-1000 flex items-center py-4 px-8 hide-scrollbar z-10">
                <div className="flex gap-6 items-end h-full" style={{ transformStyle: 'preserve-3d' }}>
                    
                    {filteredMachines.length === 0 ? (
                        <div className="text-center w-full text-gray-500 mt-20 flex flex-col items-center">
                            <Search className="w-12 h-12 opacity-20 mb-2"/>
                            <p className="text-xs font-mono">NO_MACHINES_MATCHING_QUERY</p>
                        </div>
                    ) : (
                        filteredMachines.map((m) => {
                            const isOccupied = m.status === 'occupied';
                            const isMe = m.current_user_id === user.id;
                            const isHot = m.total_payout > 50000;
                            const isJackpot = m.total_payout > 500000; // Mega win threshold
                            
                            return (
                                <div 
                                    key={m.id} 
                                    onClick={() => handleMachineClick(m)} 
                                    className={`relative group cursor-pointer transition-all duration-300 transform hover:-translate-y-4 hover:scale-105 flex-shrink-0 flex items-end
                                        ${isOccupied && !isMe ? 'opacity-80 grayscale-[0.2]' : ''}
                                    `}
                                    style={{ 
                                        width: '260px',
                                        height: '70vh',
                                        maxHeight: '750px',
                                        zIndex: isOccupied ? 10 : 20 
                                    }}
                                >
                                    {/* Spotlight for Hot Machines */}
                                    {isHot && !isOccupied && (
                                        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-32 h-[150%] bg-gradient-to-b from-yellow-500/20 via-yellow-500/5 to-transparent blur-xl pointer-events-none"></div>
                                    )}

                                    {/* Overhead Signs */}
                                    {isMe && (
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-green-500 text-black font-black text-[10px] px-3 py-1 rounded-full animate-bounce shadow-[0_0_15px_lime] z-50 whitespace-nowrap border-2 border-white">
                                            YOUR SEAT
                                        </div>
                                    )}
                                    {isJackpot && !isMe && (
                                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-[10px] px-3 py-1 rounded-full animate-pulse shadow-[0_0_20px_gold] z-50 whitespace-nowrap border-2 border-white flex items-center gap-1">
                                            <Trophy size={10}/> JACKPOT HOT
                                        </div>
                                    )}
                                    {isHot && !isJackpot && !isMe && !isOccupied && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-40">
                                            <Flame size={24} className="text-red-500 fill-orange-500 animate-pulse drop-shadow-lg"/>
                                        </div>
                                    )}

                                    {/* The Machine & Occupant Wrapper (Fixed Aspect Ratio 0.6) */}
                                    <div className="relative w-full aspect-[0.6] flex items-end justify-center mb-4">
                                        
                                        {/* 1. Cabinet */}
                                        <div className="absolute inset-0 z-10 w-full h-full">
                                            <CabinetSVG 
                                                islandId={parseInt(island.id)} 
                                                visualState={isOccupied ? 'BUSY' : (isHot ? 'JACKPOT_HOT' : 'FREE')} 
                                                mode="hall" 
                                                stats={{ laps: m.total_laps, wins: m.total_payout }} 
                                                charId={island.hostess_char_id} 
                                                machineNumber={m.machine_number}
                                                serialNumber={m.serial_number}
                                            />
                                        </div>

                                        {/* 2. Occupant Overlay (If Busy) */}
                                        {isOccupied && (
                                            <div className="absolute bottom-[5%] right-[-25%] w-[50%] h-[60%] z-20 pointer-events-none drop-shadow-2xl">
                                                <CharacterSVG 
                                                    type={m.sticker_char_id || 'luna'} 
                                                    mood="idle" 
                                                />
                                            </div>
                                        )}
                                        
                                        {/* 3. "Locked" Overlay if occupied by other */}
                                        {isOccupied && !isMe && (
                                            <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center rounded-lg backdrop-blur-[2px]">
                                                <div className="bg-red-600 text-white font-black text-[10px] px-3 py-1 rounded border border-red-400 rotate-12 shadow-[0_0_15px_red] flex items-center gap-1">
                                                    <Lock size={10}/> OCCUPIED
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Action Button Overlay */}
                                    {!isOccupied && (
                                        <div className="absolute bottom-32 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                                            <div className="bg-white text-black font-black text-[10px] px-4 py-2 rounded-full shadow-[0_0_20px_white] flex items-center gap-1 hover:scale-110 transition-transform">
                                                <Search size={12}/> INSPECT DATA
                                            </div>
                                        </div>
                                    )}

                                    {/* Floor Reflection */}
                                    <div className="absolute -bottom-2 left-4 right-4 h-6 bg-black/60 blur-md rounded-full scale-x-90"></div>
                                </div>
                            );
                        })
                    )}
                    
                    {/* Spacer for scroll end */}
                    <div className="w-12 flex-shrink-0 h-full"></div>
                </div>
            </div>

            {/* --- MACHINE INSPECTOR MODAL --- */}
            {inspectingMachine && (
                <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md animate-in zoom-in-95 duration-300" onClick={() => setInspectingMachine(null)}>
                    <GlassCard className="w-full max-w-sm p-0 overflow-hidden border-cyan-500/50 shadow-[0_0_40px_rgba(0,243,255,0.15)]" onClick={e => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-cyan-900 to-blue-900 p-4 flex justify-between items-center border-b border-cyan-500/30">
                            <div>
                                <h3 className="text-white font-black text-xl italic drop-shadow-md">UNIT #{inspectingMachine.machine_number}</h3>
                                <div className="text-[10px] text-cyan-300 font-bold tracking-widest uppercase flex items-center gap-1">
                                    <MapPin size={10} /> {island.name} FLOOR
                                </div>
                            </div>
                            <button onClick={() => setInspectingMachine(null)} className="text-white/70 hover:text-white bg-black/20 p-1 rounded-full"><X size={20}/></button>
                        </div>

                        {/* Stats Body */}
                        <div className="p-6 space-y-4 bg-black/80">
                            
                            {/* RTP & Volatility Tags */}
                            <div className="flex gap-2 mb-2">
                                <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                                    <div className="text-[9px] text-gray-500 font-bold uppercase">Base RTP</div>
                                    <div className="text-cyan-400 font-mono font-bold">{island.rtp_rate}%</div>
                                </div>
                                <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                                    <div className="text-[9px] text-gray-500 font-bold uppercase">Grid System</div>
                                    <div className="text-purple-400 font-mono font-bold">3x3 / 5-LINE</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 shadow-inner">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border border-white/20 shadow-lg">
                                        <History size={18} className="text-gray-400"/>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase">Lifetime Spins</div>
                                        <div className="text-white font-mono font-bold text-lg">{inspectingMachine.total_laps.toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Total Payouts</div>
                                    <div className="text-yellow-400 font-mono font-bold flex items-center justify-end gap-1">
                                        {inspectingMachine.total_payout.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Fake Trend Graph for Cyber Vibe */}
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                <div className="flex items-center gap-2 mb-2 text-[10px] text-gray-400 font-bold uppercase relative z-10">
                                    <BarChart3 size={12} className="text-cyan-500"/> Performance Trend (Last 50)
                                </div>
                                <div className="h-12 flex items-end gap-1 relative z-10">
                                    {[...Array(24)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`flex-1 rounded-t opacity-80 ${Math.random() > 0.8 ? 'bg-yellow-500 shadow-[0_0_5px_gold]' : 'bg-cyan-900'}`} 
                                            style={{height: `${Math.random() * 100}%`}}
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            {/* Security Note */}
                            <div className="text-[9px] text-gray-500 flex items-center gap-1 justify-center">
                                <ShieldAlert size={10} /> Certified RNG & Anti-Cheat Active
                            </div>

                            {/* Action Button */}
                            <button 
                                onClick={() => handleEnterMachine(inspectingMachine)}
                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-black text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all mt-2 border border-cyan-400/50"
                            >
                                <Zap size={18} fill="currentColor"/> INITIALIZE LINK & PLAY
                            </button>
                            
                            <div className="text-center text-[9px] text-gray-600 font-mono">
                                S/N: {inspectingMachine.serial_number || `SRO-${island.id}-${inspectingMachine.machine_number}`}
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            <BottomDock activeCharId={user.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} onOpenBank={() => router.push('/wallet')} />
        </div>
    );
};

export default HallView;