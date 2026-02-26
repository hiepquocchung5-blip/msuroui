import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ChevronLeft, Target, CheckCircle, Loader2, Zap, Coins, Crosshair, TerminalSquare } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import BottomDock from '../components/layout/BottomDock';
import { useGameSound } from '../hooks/useGameSound';

export default function MissionsPage() {
    const { user, loading, updateBalance } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const { playSound } = useGameSound();

    const [missions, setMissions] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [claimingId, setClaimingId] = useState(null);

    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const res = await api.get('/game/missions.php');
                if (res.data.status === 'success') {
                    setMissions(res.data.data);
                }
            } catch (e) {
                console.error("Failed to load missions", e);
            } finally {
                setIsFetching(false);
            }
        };

        if (user) fetchMissions();
    }, [user]);

    const handleClaim = async (missionId, reward) => {
        setClaimingId(missionId);
        playSound('click');
        try {
            const res = await api.post('/game/missions.php', { mission_id: missionId });
            if (res.data.status === 'success') {
                playSound('win');
                addToast(`Directive Complete! +${reward.toLocaleString()} MMK`, 'success');
                updateBalance(res.data.new_balance);
                
                // Update local state smoothly
                setMissions(prev => prev.map(m => m.id === missionId ? { ...m, claimed: true } : m));
            }
        } catch (e) {
            addToast(e.response?.data?.error || "Failed to claim reward", 'error');
        } finally {
            setClaimingId(null);
        }
    };

    if (loading) return <div className="bg-black min-h-screen"/>;
    if (!user) { 
        if (typeof window !== 'undefined') router.push('/'); 
        return null; 
    }

    // Calc Progress
    const completedCount = missions.filter(m => m.claimed).length;
    const totalMissions = missions.length;
    const progressPercent = totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0;

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden">
            {/* Cyberpunk Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-black to-black pointer-events-none" />

            {/* Header */}
            <div className="p-6 pt-8 relative z-10 flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/5 sticky top-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-white hover:text-cyan-400 transition-colors active:scale-95">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-widest italic flex items-center gap-2 drop-shadow-sm">
                        <Target className="text-cyan-400" /> DIRECTIVES
                    </h1>
                </div>
            </div>

            <div className="px-6 space-y-6 relative z-10 mt-6">
                
                {/* Progress Overview Card */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                    <GlassCard className="p-6 border-cyan-500/30 bg-gradient-to-r from-cyan-900/20 to-black relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 opacity-10">
                            <Crosshair size={120} className="text-cyan-500 animate-[spin_20s_linear_infinite]" />
                        </div>
                        <div className="flex justify-between items-end mb-3 relative z-10">
                            <span className="text-sm font-bold text-cyan-500 flex items-center gap-2">
                                <TerminalSquare size={16} /> SYSTEM PROGRESS
                            </span>
                            <span className="text-xl font-black text-white font-mono">{completedCount} / {totalMissions}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-white/10 relative z-10">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-white transition-all duration-1000 ease-out shadow-[0_0_15px_cyan]"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <div className="text-[10px] text-gray-500 mt-3 font-mono uppercase tracking-widest relative z-10">
                             Next reset at 00:00 MST
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Mission List */}
                <div className="space-y-4">
                    {isFetching ? (
                        <div className="text-center text-cyan-500 py-12 flex flex-col items-center">
                            <div className="relative">
                                <Loader2 className="animate-spin mb-3 w-10 h-10" />
                                <div className="absolute inset-0 blur-md bg-cyan-500/50 rounded-full animate-pulse"></div>
                            </div>
                            <span className="text-xs font-mono tracking-widest animate-pulse">DECRYPTING LOGS...</span>
                        </div>
                    ) : missions.length === 0 ? (
                        <div className="text-center text-gray-600 text-xs py-10 border border-dashed border-white/10 rounded-xl font-mono">
                             NO_ACTIVE_DIRECTIVES_FOUND
                        </div>
                    ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                            {missions.map(m => {
                                const isDone = m.progress >= m.total;
                                const isClaimed = m.claimed;
                                const progressWidth = Math.min(100, (m.progress / m.total) * 100);

                                return (
                                    <motion.div key={m.id} variants={itemVariants} layout>
                                        <GlassCard 
                                            className={`p-5 relative overflow-hidden transition-all duration-500 
                                                ${isClaimed ? 'opacity-50 border-green-500/20 bg-green-900/5 grayscale-[50%]' : 
                                                (isDone ? 'border-cyan-400 bg-cyan-900/20 shadow-[0_0_20px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/50' : 
                                                'border-white/10 hover:border-white/20 hover:bg-white/5')}`}
                                        >
                                            {/* Circuit Decoration for active ready missions */}
                                            {isDone && !isClaimed && (
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 mix-blend-color-dodge animate-pulse pointer-events-none"></div>
                                            )}

                                            {/* Reward Badge */}
                                            <div className="absolute top-0 right-0 bg-black/80 border-b border-l border-white/10 px-3 py-1.5 rounded-bl-xl flex items-center gap-1 backdrop-blur-md">
                                                <Coins size={12} className="text-yellow-400" />
                                                <span className="text-yellow-400 font-mono font-bold text-xs">+{m.reward.toLocaleString()}</span>
                                            </div>

                                            <div className="pr-20 mb-5 relative z-10">
                                                <h3 className={`font-bold text-sm mb-1 ${isDone && !isClaimed ? 'text-white' : 'text-gray-300'}`}>{m.task}</h3>
                                                <div className="text-[10px] text-gray-500 font-mono tracking-widest flex items-center gap-2">
                                                    <span>LOG:</span>
                                                    <span className={isDone ? "text-cyan-400" : "text-gray-400"}>
                                                        {m.progress.toLocaleString()} / {m.total.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Progress Bar & Button */}
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ease-out relative
                                                            ${isClaimed ? 'bg-green-600' : (isDone ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-blue-600')}`}
                                                        style={{ width: `${progressWidth}%` }}
                                                    >
                                                        {isDone && !isClaimed && <div className="absolute inset-0 bg-white/50 w-full h-full animate-[shimmer_2s_infinite]"></div>}
                                                    </div>
                                                </div>

                                                {isClaimed ? (
                                                    <span className="text-green-500 text-[10px] font-black tracking-wider flex items-center gap-1 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                                                        <CheckCircle size={14} /> EXECUTED
                                                    </span>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleClaim(m.id, m.reward)}
                                                        disabled={!isDone || claimingId === m.id}
                                                        className={`px-6 py-2 rounded-lg font-black text-xs transition-all flex items-center justify-center min-w-[110px] tracking-widest
                                                        ${isDone 
                                                            ? 'bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.4)] border border-cyan-300' 
                                                            : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-white/5'}`}
                                                    >
                                                        {claimingId === m.id ? <Loader2 size={14} className="animate-spin" /> : 'EXTRACT'}
                                                    </button>
                                                )}
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </div>
            </div>

            <BottomDock activeCharId={user?.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} />
        </div>
    );
}