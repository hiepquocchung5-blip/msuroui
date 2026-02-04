import React, { useState, useMemo } from 'react';
import { ChevronLeft, Filter, Flame, Users, Zap, Search, Trophy, Sparkles } from 'lucide-react';
import CabinetSVG from '../visuals/CabinetSVG';
import IslandLandscapeSVG from '../visuals/IslandLandscapeSVG';
import BottomDock from '../layout/BottomDock';
import GlobalTicker from '../ui/GlobalTicker';
import ActiveEvents from '../ui/ActiveEvents';

const HallView = ({ island, machines, user, onSelectMachine, onBack }) => {
    const [filter, setFilter] = useState('ALL'); // ALL, EMPTY, HOT
    const [search, setSearch] = useState('');

    // --- LOGIC: Filter Machines ---
    const filteredMachines = useMemo(() => {
        return machines.filter(m => {
            // 1. Search Query (Machine ID)
            if (search && !m.machine_number.toString().includes(search)) return false;
            
            // 2. Tab Filters
            if (filter === 'EMPTY') return m.status === 'free';
            if (filter === 'HOT') return m.total_payout > 500000; // Example threshold
            
            return true;
        });
    }, [machines, filter, search]);

    // Calculate Occupancy
    const occupiedCount = machines.filter(m => m.status === 'occupied').length;
    const occupancyRate = Math.round((occupiedCount / machines.length) * 100);

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
                        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors active:scale-95">
                            <ChevronLeft />
                        </button>
                        <div>
                            <h2 className="text-white font-black text-xl italic uppercase tracking-wider leading-none drop-shadow-md">
                                {island.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${occupancyRate > 80 ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></span>
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
                            className="w-full bg-black/50 border border-white/20 rounded-full py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-cyan-500 transition-colors font-mono"
                        />
                        <Search size={12} className="absolute left-2.5 top-2 text-gray-500"/>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap ${filter === 'ALL' ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'}`}>
                        ALL MACHINES
                    </button>
                    <button onClick={() => setFilter('EMPTY')} className={`px-4 py-2 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 whitespace-nowrap ${filter === 'EMPTY' ? 'bg-green-600 text-white border-green-600 shadow-[0_0_10px_green]' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'}`}>
                        <Users size={12}/> EMPTY SEATS
                    </button>
                    <button onClick={() => setFilter('HOT')} className={`px-4 py-2 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 whitespace-nowrap ${filter === 'HOT' ? 'bg-red-600 text-white border-red-600 shadow-[0_0_10px_red]' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'}`}>
                        <Flame size={12}/> HOT
                    </button>
                </div>
            </div>

            {/* --- CASINO FLOOR (3D Perspective Scroll) --- */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden perspective-1000 flex items-center py-4 px-8 hide-scrollbar z-10">
                <div className="flex gap-6 items-end" style={{ transformStyle: 'preserve-3d' }}>
                    
                    {filteredMachines.length === 0 ? (
                        <div className="text-center w-full text-gray-500 mt-20 flex flex-col items-center">
                            <Search className="w-12 h-12 opacity-20 mb-2"/>
                            <p className="text-xs">No machines found matching filter.</p>
                        </div>
                    ) : (
                        filteredMachines.map((m, idx) => {
                            const isOccupied = m.status === 'occupied';
                            const isMe = m.current_user_id === user.id;
                            const isHot = m.total_payout > 500000;
                            const isJackpot = m.total_payout > 2000000; // Mega win
                            
                            return (
                                <div 
                                    key={m.id} 
                                    onClick={() => onSelectMachine(m)} 
                                    className={`relative group cursor-pointer transition-all duration-300 transform hover:-translate-y-4 hover:scale-105 flex-shrink-0
                                        ${isOccupied && !isMe ? 'grayscale-[0.5] opacity-80' : ''}
                                    `}
                                    style={{ 
                                        width: '240px',
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

                                    {/* The Machine */}
                                    {/* Fixed aspect ratio container for the SVG */}
                                    <div className="w-full aspect-[0.6] relative">
                                        <CabinetSVG 
                                            islandId={island.id} 
                                            visualState={isOccupied ? 'BUSY' : (isHot ? 'JACKPOT_HOT' : 'FREE')} 
                                            mode="hall" 
                                            stats={{ laps: m.total_laps, wins: m.total_payout }} 
                                            charId={island.hostess_char_id} 
                                            occupantPetId={isOccupied ? (m.sticker_char_id || 'luna') : null}
                                            machineNumber={m.machine_number}
                                            serialNumber={m.serial_number}
                                        />
                                    </div>
                                    
                                    {/* Action Button Overlay */}
                                    {!isOccupied && (
                                        <div className="absolute bottom-24 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                                            <button className="bg-white text-black font-black text-xs px-6 py-2 rounded-full shadow-xl flex items-center gap-2 hover:bg-cyan-400 transform hover:scale-110 transition-transform">
                                                <Zap size={14} fill="black"/> SIT DOWN
                                            </button>
                                        </div>
                                    )}

                                    {/* Floor Reflection */}
                                    <div className="absolute -bottom-2 left-4 right-4 h-6 bg-black/40 blur-md rounded-full scale-x-90"></div>
                                    
                                    {/* Recent Win Badge */}
                                    {m.last_win_amount > 10000 && !isOccupied && (
                                        <div className="absolute bottom-10 right-2 bg-black/80 text-yellow-400 text-[9px] font-mono px-2 py-0.5 rounded border border-yellow-500/30 flex items-center gap-1">
                                            <Sparkles size={8}/> Last: {m.last_win_amount/1000}k
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                    
                    {/* Spacer for scroll end */}
                    <div className="w-12 flex-shrink-0"></div>
                </div>
            </div>

            <BottomDock activeCharId={user.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} onOpenBank={() => router.push('/wallet')} />
        </div>
    );
};

export default HallView;