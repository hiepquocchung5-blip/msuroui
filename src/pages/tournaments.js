import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Trophy, Clock, Users, Zap, ChevronLeft, Play, Lock } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import BottomDock from '../components/layout/BottomDock';

export default function TournamentPage() {
    const { user, loading, updateBalance } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const fetchEvents = async () => {
        setIsLoadingData(true);
        try {
            const res = await api.get('/tournaments/list.php');
            if (res.data.status === 'success') {
                setEvents(res.data.data);
            }
        } catch (e) {
            console.error("Failed to load tournaments");
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (user) fetchEvents();
    }, [user]);

    const handleJoin = async (t) => {
        if (t.entry_fee > 0 && !confirm(`Pay ${t.entry_fee.toLocaleString()} MMK to join?`)) return;
        
        try {
            const res = await api.post('/tournaments/join.php', { tournament_id: t.id });
            if (res.data.status === 'success') {
                alert("Joined! Go to the Game Room to start your spins.");
                updateBalance(user.balance - t.entry_fee);
                fetchEvents();
            }
        } catch (e) {
            alert(e.response?.data?.error || "Failed to join");
        }
    };

    const handlePlay = (t) => {
        // Redirect to a machine. Ideally, pass tournament_id to context/URL
        // For now, just go to Lobby or specific Island if set
        router.push(t.island_id ? `/game/${t.island_id}` : '/lobby');
    };

    if (loading || !user) return <div className="bg-black min-h-screen"/>;

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 to-black pointer-events-none" />

            {/* Header */}
            <div className="p-6 pt-8 relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-white hover:text-cyan-400 transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-black text-white tracking-widest italic flex items-center gap-2">
                        <Trophy className="text-yellow-500"/> TOURNAMENTS
                    </h1>
                </div>
            </div>

            <div className="px-6 space-y-4 relative z-10">
                {isLoadingData ? (
                    <div className="text-center text-gray-500 py-10">Loading Events...</div>
                ) : events.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 text-sm">No active tournaments right now.</div>
                ) : (
                    events.map(t => (
                        <GlassCard key={t.id} className={`p-0 overflow-hidden border-l-4 ${t.is_joined ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
                            {/* Banner */}
                            <div className="h-24 bg-gradient-to-r from-yellow-900/50 to-black relative flex items-center px-6">
                                <div className="absolute right-4 top-4 opacity-20"><Trophy size={64}/></div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded uppercase">
                                            {t.status}
                                        </span>
                                        {t.is_joined && <span className="bg-green-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">JOINED</span>}
                                    </div>
                                    <h3 className="text-xl font-black text-white italic">{t.title}</h3>
                                    <p className="text-xs text-gray-400 max-w-[200px]">{t.desc}</p>
                                </div>
                            </div>
                            
                            {/* Stats Bar */}
                            <div className="bg-white/5 p-3 flex justify-between items-center text-xs">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 font-bold uppercase text-[9px]">Prize Pool</span>
                                    <span className="text-yellow-400 font-mono font-bold text-sm">{t.prize_pool.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-gray-500 font-bold uppercase text-[9px]">Ends In</span>
                                    <span className="text-white font-mono flex items-center gap-1 justify-end"><Clock size={10}/> {t.time_left}</span>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="p-3 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-[10px] text-gray-400">
                                    <span className="flex items-center gap-1"><Users size={12}/> {t.participant_count}</span>
                                    <span className="flex items-center gap-1"><Zap size={12}/> {t.spin_limit} Spins</span>
                                </div>

                                {t.is_joined ? (
                                    <button onClick={() => handlePlay(t)} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg shadow-green-900/50">
                                        <Play size={12} fill="currentColor"/> PLAY NOW
                                    </button>
                                ) : (
                                    <button onClick={() => handleJoin(t)} className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg shadow-yellow-900/50">
                                        {t.entry_fee > 0 ? `JOIN (${t.entry_fee/1000}k)` : 'JOIN FREE'}
                                    </button>
                                )}
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

            <BottomDock activeCharId={user?.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} />
        </div>
    );
}