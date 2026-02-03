import React, { useState, useEffect } from 'react';
import { Zap, Clock, Star, TrendingUp, Gift } from 'lucide-react';
import api from '../../services/api';

const ActiveEvents = () => {
    const [events, setEvents] = useState([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Fetch events from the specific endpoint
                const res = await api.get('/game/active_events.php');
                if (res.data.status === 'success' && res.data.events.length > 0) {
                    setEvents(res.data.events);
                }
            } catch (e) {
                // Silent fail if no events or error
            }
        };

        fetchEvents();
        // Refresh every minute to check for expired events
        const interval = setInterval(fetchEvents, 60000);
        return () => clearInterval(interval);
    }, []);

    if (events.length === 0 || !isVisible) return null;

    const getIcon = (type) => {
        switch(type) {
            case 'XP_BOOST': return <Star size={14} className="text-yellow-200 fill-current"/>;
            case 'WIN_MULTIPLIER': return <TrendingUp size={14} className="text-green-200"/>;
            case 'DEPOSIT_BONUS': return <Gift size={14} className="text-pink-200"/>;
            default: return <Zap size={14} className="text-cyan-200 fill-current"/>;
        }
    };

    const getGradient = (type) => {
        switch(type) {
            case 'XP_BOOST': return 'from-yellow-600/90 to-orange-600/90 border-yellow-400/50';
            case 'WIN_MULTIPLIER': return 'from-green-600/90 to-emerald-600/90 border-green-400/50';
            case 'DEPOSIT_BONUS': return 'from-pink-600/90 to-purple-600/90 border-pink-400/50';
            default: return 'from-blue-600/90 to-cyan-600/90 border-cyan-400/50';
        }
    };

    return (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-30 w-[90%] max-w-sm pointer-events-none flex flex-col gap-2">
            {events.map((ev, idx) => (
                <div 
                    key={idx} 
                    className={`bg-gradient-to-r ${getGradient(ev.type)} backdrop-blur-md p-2 px-3 rounded-full shadow-lg border flex items-center justify-between animate-in slide-in-from-top-4 fade-in duration-500 pointer-events-auto`}
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-1.5 rounded-full shadow-inner">
                            {getIcon(ev.type)}
                        </div>
                        <div className="flex flex-col">
                            <div className="text-[10px] font-black text-white uppercase italic tracking-wider leading-none mb-0.5 shadow-black drop-shadow-sm">
                                {ev.title}
                            </div>
                            <div className="text-[9px] text-white/80 font-medium flex items-center gap-1">
                                {ev.target_island_id ? `📍 Island #${ev.target_island_id} Only` : '🌍 Global Event'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pl-3 border-l border-white/20">
                        <div className="text-right">
                             <div className="text-xs font-black text-white italic">x{ev.multiplier}</div>
                             <div className="text-[8px] text-white/90 font-mono flex items-center justify-end gap-1">
                                 <Clock size={8}/> 
                                 {/* Simple countdown display logic could go here */}
                                 ACTIVE
                             </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActiveEvents;