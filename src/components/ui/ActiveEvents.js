import React, { useState, useEffect } from 'react';
import { Zap, Clock, Star } from 'lucide-react';
import api from '../../services/api';

const ActiveEvents = () => {
    const [events, setEvents] = useState([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Manually calling the new endpoint directly
                // (Or add getActiveEvents to api.js service)
                const res = await api.get('/game/active_events.php');
                if (res.data.status === 'success' && res.data.events.length > 0) {
                    setEvents(res.data.events);
                }
            } catch (e) {
                // Silent fail
            }
        };
        fetchEvents();
    }, []);

    if (events.length === 0 || !isVisible) return null;

    return (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-[90%] max-w-sm pointer-events-none">
            {events.map((ev, idx) => (
                <div 
                    key={idx} 
                    className="bg-gradient-to-r from-yellow-600/90 to-orange-600/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-yellow-400/50 flex items-center justify-between mb-2 animate-in slide-in-from-top-4 fade-in duration-500 pointer-events-auto"
                >
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-1.5 rounded-full">
                            {ev.type === 'XP_BOOST' ? <Star size={16} className="text-white fill-current"/> : <Zap size={16} className="text-white fill-current"/>}
                        </div>
                        <div>
                            <div className="text-xs font-black text-white uppercase italic tracking-wider">{ev.title}</div>
                            <div className="text-[10px] text-yellow-100 font-bold">
                                {ev.target_island_id ? `Only on Island #${ev.target_island_id}` : 'Global Bonus'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full">
                        <span className="text-lg font-black text-white italic">x{ev.multiplier}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActiveEvents;