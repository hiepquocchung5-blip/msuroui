import React, { useState, useMemo } from 'react';
import { ChevronLeft, Filter, Zap, PlayCircle, Flame } from 'lucide-react';
import CabinetSVG from '../visuals/CabinetSVG';
import BottomDock from '../layout/BottomDock';
import GlobalTicker from '../ui/GlobalTicker';

const HallView = ({ island, machines, user, onSelectMachine, onBack }) => {
    const [filter, setFilter] = useState('ALL'); // 'ALL', 'FREE', 'HOT'

    // Filter Logic
    const filteredMachines = useMemo(() => {
        return machines.filter(m => {
            if (filter === 'FREE') return m.status === 'free';
            if (filter === 'HOT') return parseFloat(m.total_payout) > 1000000; // Example threshold
            return true;
        });
    }, [machines, filter]);

    // Quick Join Logic
    const handleQuickJoin = () => {
        const freeMachine = machines.find(m => m.status === 'free');
        if (freeMachine) {
            onSelectMachine(freeMachine);
        } else {
            alert("No free machines available right now!");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pb-24 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 to-black pointer-events-none"></div>

            <GlobalTicker />
            
            {/* Header */}
            <div className="p-4 bg-black/80 backdrop-blur-md sticky top-0 z-20 shadow-lg">
                <div className="flex items-center gap-4 mb-3">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors active:scale-95">
                        <ChevronLeft />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-white font-black text-xl uppercase italic tracking-wider text-shadow-sm">{island.name}</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <p className="text-xs text-cyan-400 font-bold tracking-widest">{machines.filter(m=>m.status==='occupied').length} PLAYERS ONLINE</p>
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    <button 
                        onClick={handleQuickJoin}
                        className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full text-[10px] font-black text-white shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        <PlayCircle size={14} fill="currentColor" /> QUICK JOIN
                    </button>
                    <div className="w-px bg-white/20 mx-1"></div>
                    <button onClick={() => setFilter('ALL')} className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${filter === 'ALL' ? 'bg-white text-black border-white' : 'text-gray-400 border-gray-700'}`}>ALL</button>
                    <button onClick={() => setFilter('FREE')} className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${filter === 'FREE' ? 'bg-green-500 text-black border-green-500' : 'text-gray-400 border-gray-700'}`}>EMPTY</button>
                    <button onClick={() => setFilter('HOT')} className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${filter === 'HOT' ? 'bg-red-500 text-white border-red-500' : 'text-gray-400 border-gray-700'}`}><Flame size={10} className="inline mr-1"/>HOT</button>
                </div>
            </div>

            {/* 3D Machine Scroll Container */}
            <div className="p-8 flex gap-8 overflow-x-auto snap-x snap-mandatory min-h-[75vh] items-center hide-scrollbar perspective-1000">
                {filteredMachines.length === 0 ? (
                    <div className="w-full text-center text-gray-500 mt-20">
                        <Filter size={48} className="mx-auto mb-2 opacity-50"/>
                        <p>No machines match this filter.</p>
                    </div>
                ) : (
                    filteredMachines.map(m => {
                        const isOccupied = m.status === 'occupied' && m.current_user_id !== user.id;
                        const isHot = parseFloat(m.total_payout) > 1000000;
                        
                        return (
                            <div 
                                key={m.id} 
                                onClick={() => onSelectMachine(m)} 
                                className={`snap-center shrink-0 relative group cursor-pointer transition-all duration-500 ease-out
                                    ${isOccupied ? 'opacity-60 grayscale scale-95' : 'hover:-translate-y-4 hover:scale-105'}
                                `}
                            >
                                {/* Hot Badge */}
                                {isHot && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-[0_0_15px_red] z-30 animate-bounce flex items-center gap-1">
                                        <Flame size={10} fill="currentColor"/> HOT MACHINE
                                    </div>
                                )}

                                {/* Cabinet Visual */}
                                <CabinetSVG 
                                    islandId={island.id} 
                                    visualState={m.status === 'occupied' ? 'BUSY' : (isHot ? 'JACKPOT_HOT' : 'FREE')} 
                                    mode="hall" 
                                    stats={{ laps: m.total_laps, wins: m.total_payout }} 
                                    charId={island.hostess_char_id} 
                                    occupantPetId={m.sticker_char_id}
                                    machineNumber={m.machine_number}
                                    serialNumber={m.serial_number}
                                />
                                
                                {/* Interaction Overlay */}
                                {!isOccupied && (
                                    <div className="absolute inset-0 flex items-end justify-center pb-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-cyan-500 text-black font-black text-sm px-6 py-3 rounded-full shadow-[0_0_30px_cyan] animate-bounce tracking-widest border-2 border-white">
                                            SIT DOWN
                                        </div>
                                    </div>
                                )}

                                {/* Occupied Badge */}
                                {isOccupied && (
                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                        <div className="bg-red-600/90 text-white font-bold px-4 py-2 rounded border border-red-400 shadow-xl backdrop-blur-sm rotate-12">
                                            OCCUPIED
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            
            <BottomDock activeCharId={user.active_pet_id} onNavigate={(path) => window.location.href = `/${path}`} />
        </div>
    );
};

export default HallView;