import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ChevronLeft, Trophy, Crown, Users, Zap, Loader2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import CharacterSVG from '../components/visuals/CharacterSVG';
import BottomDock from '../components/layout/BottomDock';

export default function RankPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState('balance');
    const [leaderboard, setLeaderboard] = useState([]);
    const [myRank, setMyRank] = useState('-');
    const [isFetching, setIsFetching] = useState(true);

    const fetchRank = async (type) => {
        setIsFetching(true);
        try {
            // API expects ?type=balance|wins|referrals
            const res = await api.get(`/game/leaderboard.php?type=${type}`); 
            if (res.data.status === 'success') {
                setLeaderboard(res.data.list);
                setMyRank(res.data.my_rank);
            }
        } catch (e) {
            console.error("Rank fetch error", e);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (user) fetchRank(activeTab);
    }, [user, activeTab]);

    if (loading) return <div className="bg-black min-h-screen"/>;
    if (!user) { 
        if (typeof window !== 'undefined') router.push('/'); 
        return null; 
    }

    const getTabIcon = (type) => {
        switch(type) {
            case 'balance': return <Crown size={14}/>;
            case 'wins': return <Zap size={14}/>;
            case 'referrals': return <Users size={14}/>;
            default: return <Trophy size={14}/>;
        }
    };

    const formatValue = (val, type) => {
        if (type === 'referrals') return Math.floor(val) + " Invites";
        return Math.floor(val).toLocaleString() + " MMK";
    };

    // Determine current user's value to show in "My Rank" banner based on tab
    const getMyValue = () => {
        // If "balance", we have it in user context. Others might need to come from API or be ---
        if (activeTab === 'balance') return parseFloat(user.balance);
        // For wins/referrals, we look for our entry in the list if present
        const me = leaderboard.find(p => p.is_me);
        return me ? me.value : 0;
    };

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 to-black pointer-events-none" />

            {/* Header */}
            <div className="p-6 pt-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => router.back()} className="text-white hover:text-cyan-400 transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-black text-white tracking-widest italic flex items-center gap-2">
                        <Trophy className="text-yellow-500"/> HALL OF FAME
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 mb-6">
                    {['balance', 'wins', 'referrals'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setActiveTab(t)} 
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all uppercase 
                                ${activeTab === t ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {getTabIcon(t)} {t === 'balance' ? 'Richest' : (t === 'wins' ? 'Big Wins' : 'Agents')}
                        </button>
                    ))}
                </div>

                {/* My Rank Banner */}
                <GlassCard className="p-3 mb-4 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-cyan-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black border border-cyan-500 overflow-hidden relative shadow-[0_0_10px_cyan]">
                             <div className="absolute inset-0 scale-125 pt-1"><CharacterSVG type={user.active_pet_id} mood="idle"/></div>
                        </div>
                        <div>
                            <div className="text-[10px] text-cyan-400 font-bold mb-0.5">YOUR RANK</div>
                            <div className="text-white font-black text-xl italic">#{myRank}</div>
                        </div>
                    </div>
                    <div className="text-right">
                         <div className="text-[9px] text-gray-400 uppercase font-bold tracking-wide">{activeTab}</div>
                         <div className="text-sm font-mono text-white font-bold">
                             {formatValue(getMyValue(), activeTab)}
                         </div>
                    </div>
                </GlassCard>

                {/* List */}
                <div className="space-y-2">
                    {isFetching ? (
                        <div className="text-center text-gray-500 py-10"><Loader2 className="animate-spin mx-auto"/> Loading...</div>
                    ) : (
                        leaderboard.map((player, idx) => {
                            const rank = idx + 1;
                            let rankColor = 'text-gray-400';
                            let icon = null;
                            let bgClass = 'bg-white/5 border-white/5';
                            
                            if (rank === 1) { 
                                rankColor = 'text-yellow-400'; 
                                icon = <Trophy size={16} className="text-yellow-500 drop-shadow-md"/>; 
                                bgClass = 'bg-yellow-900/20 border-yellow-500/30';
                            }
                            if (rank === 2) { 
                                rankColor = 'text-gray-300'; 
                                icon = <Trophy size={14} className="text-gray-400"/>; 
                                bgClass = 'bg-gray-800/50 border-gray-600/30';
                            }
                            if (rank === 3) { 
                                rankColor = 'text-orange-400'; 
                                icon = <Trophy size={14} className="text-orange-600"/>; 
                                bgClass = 'bg-orange-900/20 border-orange-500/30';
                            }

                            if (player.is_me) bgClass = 'bg-cyan-900/20 border-cyan-500/50';

                            return (
                                <div key={player.id} className={`p-3 rounded-xl flex items-center justify-between border ${bgClass} transition-transform hover:scale-[1.02]`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 text-center font-black ${rankColor} flex justify-center text-lg italic`}>
                                            {icon || rank}
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-black border border-white/10 overflow-hidden relative">
                                            <div className="absolute inset-0 scale-125 pt-1">
                                                <CharacterSVG type={player.active_pet_id || 'luna'} mood="idle" />
                                            </div>
                                        </div>
                                        <div className={`text-xs font-bold ${player.is_me ? 'text-cyan-400' : 'text-gray-200'}`}>
                                            {player.username}
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono font-bold text-white tracking-tight">
                                        {formatValue(player.value, activeTab)}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    
                    {!isFetching && leaderboard.length === 0 && (
                        <div className="text-center text-gray-500 py-10 text-xs">No rankings available yet.</div>
                    )}
                </div>
            </div>

            <BottomDock activeCharId={user.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} onOpenBank={() => router.push('/wallet')} />
        </div>
    );
}