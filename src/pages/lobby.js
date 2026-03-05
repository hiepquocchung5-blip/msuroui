import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; 
import api, { game, finance, user as userApi } from '../services/api';
import { ChevronLeft, ChevronRight, Lock, Coins, MapPin, Loader2, Bell, Trophy, Calendar, ClipboardList, CheckCircle, Unlock, AlertTriangle } from 'lucide-react';
import CharacterSVG from '../components/visuals/CharacterSVG';
import CabinetSVG from '../components/visuals/CabinetSVG';
import IslandLandscapeSVG from '../components/visuals/IslandLandscapeSVG';
import BottomDock from '../components/layout/BottomDock';
import GlassCard from '../components/ui/GlassCard';
import DailyBonusModal from '../components/game/DailyBonusModal';
import GlobalTicker from '../components/ui/GlobalTicker';
import ActiveEvents from '../components/ui/ActiveEvents';
import { useGameSound } from '../hooks/useGameSound';

export default function Lobby() {
    const { user, loading, updateBalance } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    
    // Core State
    const [islands, setIslands] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // V3 User Progression Data (Based on Total Deposited)
    const [userStats, setUserStats] = useState({
        totalDeposited: 0
    });
    
    // Modals
    const [isMuted, setIsMuted] = useState(false);
    const [showDailyBonus, setShowDailyBonus] = useState(false);
    const [showMissions, setShowMissions] = useState(false); 
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [missions, setMissions] = useState([]);

    const { playSound } = useGameSound(!isMuted);

    // Fetch Live Data
    useEffect(() => {
        const initLobby = async () => {
            try {
                // Fetch Islands, Notifications, Missions, AND User Stats
                const [resIslands, resNotifs, resMissions, resProfile] = await Promise.all([
                    game.getIslands(),
                    userApi.getNotifications(),
                    api.get('/game/missions.php'),
                    userApi.getProfile() 
                ]);

                if (resIslands.data.status === 'success') {
                    // V3 Progression System: Islands unlock based on lifetime deposit tiers
                    const progressionIslands = resIslands.data.data.map(island => {
                        let reqDeposit = 0;
                        let displayName = island.name;
                        
                        // Map V3 Specific Data based on Island ID
                        switch(parseInt(island.id)) {
                            case 1: reqDeposit = 0; displayName = 'Kyoto Zen'; break;       // Starter
                            case 2: reqDeposit = 50000; displayName = 'Okinawa Tropic'; break;  
                            case 3: reqDeposit = 100000; displayName = 'Osaka Neon'; break; 
                            case 4: reqDeposit = 500000; displayName = 'Tokyo Cyber'; break; 
                            case 5: reqDeposit = 1000000; displayName = 'Ginza Gold'; break; // High Roller
                            default: reqDeposit = 0;
                        }
                        
                        return { ...island, reqDeposit, name: displayName };
                    });
                    
                    setIslands(progressionIslands);
                }
                
                if (resNotifs.data.status === 'success') {
                    setUnreadCount(resNotifs.data.count || 0);
                }
                
                if (resMissions.data.status === 'success') {
                    setMissions(resMissions.data.data);
                }

                if (resProfile.data.status === 'success') {
                    setUserStats({
                        totalDeposited: resProfile.data.user.total_deposited || 0
                    });
                }

                // Check Daily Bonus Eligibility
                if (user) {
                    const lastClaimDate = localStorage.getItem(`daily_claim_${user.id}`);
                    const today = new Date().toDateString();
                    if (lastClaimDate !== today) {
                        setTimeout(() => setShowDailyBonus(true), 1500);
                    }
                }
            } catch (e) { 
                console.error("Lobby Load Error", e);
                addToast("Connection to game server unstable.", 'error');
            }
        };

        if (!loading && user) {
            initLobby();
        }
    }, [loading, user, addToast]);

    // Navigation
    const handleNav = (direction) => {
        playSound('click');
        if (islands.length === 0) return;
        setIsTransitioning(true);
        setTimeout(() => {
            if (direction === 'next') setCurrentIndex((prev) => (prev + 1) % islands.length);
            else setCurrentIndex((prev) => (prev - 1 + islands.length) % islands.length);
            setIsTransitioning(false);
        }, 300);
    };

    const selectedIsland = islands.length > 0 ? islands[currentIndex] : null;
    
    // V3 Check: Is Island Unlocked based on Deposit History?
    const checkProgressionUnlock = (island) => {
        if (!island) return false;
        if (island.id === 1) return true; // Starter island always unlocked
        return userStats.totalDeposited >= island.reqDeposit;
    };

    const isOwned = selectedIsland ? checkProgressionUnlock(selectedIsland) : false;

    const handleEnter = async (island) => {
        playSound('click');
        
        if (!isOwned) {
            setShowUnlockModal(true);
            return;
        }
        
        router.push(`/game/${island.id}`);
    };

    const claimMission = async (id, reward) => {
        playSound('click');
        try {
            const res = await api.post('/game/missions.php', { mission_id: id });
            if (res.data.status === 'success') {
                playSound('win');
                updateBalance(res.data.new_balance);
                addToast(`Mission Completed! +${reward} MMK`, 'success');
                setMissions(prev => prev.map(m => m.id === id ? { ...m, claimed: true } : m));
            }
        } catch (e) {
            addToast(e.response?.data?.error || "Failed to claim", 'error');
        }
    };

    if (loading || islands.length === 0) {
        return (
            <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-cyan-500 mb-4" size={48} /> 
                <span className="font-mono tracking-widest text-xs text-gray-500">CONNECTING TO LOBBY...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden flex flex-col">
            
            <div className="relative z-50"><GlobalTicker /></div>
            <ActiveEvents />

            {/* HEADER */}
            <div className="pt-2 px-6 pb-2 flex justify-between items-center z-20 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm sticky top-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                         <span className="text-white font-black text-lg italic tracking-tighter drop-shadow-md">LVL {user.level}</span>
                         <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden border border-white/20">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000" style={{width: `${user.progress_percent || 0}%`}}></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => { playSound('click'); setShowMissions(true); }} className="w-9 h-9 rounded-full bg-blue-900/30 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 active:scale-95 transition-all">
                        <ClipboardList size={16} />
                    </button>
                    <button onClick={() => { playSound('click'); setShowDailyBonus(true); }} className="w-9 h-9 rounded-full bg-green-900/30 border border-green-500/30 flex items-center justify-center text-green-400 hover:bg-green-500/20 active:scale-95 transition-all">
                        <Calendar size={16} />
                    </button>
                    <button onClick={() => { playSound('click'); router.push('/tournaments'); }} className="w-9 h-9 rounded-full bg-yellow-900/30 border border-yellow-500/30 flex items-center justify-center text-yellow-400 hover:bg-yellow-500/20 active:scale-95 transition-all">
                        <Trophy size={16} />
                    </button>
                    <button onClick={() => { playSound('click'); router.push('/notifications'); }} className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all relative">
                        <Bell size={16} />
                        {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-black flex items-center justify-center text-[8px] font-bold">{unreadCount > 9 ? '!' : unreadCount}</span>}
                    </button>
                    <div className="bg-black/50 px-3 py-1.5 rounded-full border border-yellow-500/30 flex items-center gap-2 backdrop-blur-md cursor-pointer hover:bg-black/70 active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.1)]" onClick={() => router.push('/wallet')}>
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-mono font-bold text-sm">{parseFloat(user.balance).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* 3D ISLAND CAROUSEL */}
            <div className="flex-1 relative flex items-center justify-center perspective-1000 mt-4">
                <div className={`absolute inset-0 transition-colors duration-1000 opacity-60 bg-gradient-to-b from-black via-transparent to-black`} />

                <button onClick={() => handleNav('prev')} className="absolute left-2 z-30 p-3 bg-black/50 rounded-full text-white hover:bg-white/20 border border-white/10 active:scale-95 transition-transform"><ChevronLeft/></button>
                <button onClick={() => handleNav('next')} className="absolute right-2 z-30 p-3 bg-black/50 rounded-full text-white hover:bg-white/20 border border-white/10 active:scale-95 transition-transform"><ChevronRight/></button>

                {selectedIsland && (
                    <div 
                        className={`relative w-[85%] max-w-[400px] h-[65vh] group cursor-pointer transform-style-3d transition-all duration-500 ease-out ${isTransitioning ? 'scale-90 opacity-50 rotate-y-12' : 'scale-100 opacity-100'}`} 
                        onClick={() => handleEnter(selectedIsland)}
                    >
                        <div className={`w-full h-full rounded-3xl overflow-hidden border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative transition-all duration-500 ${!isOwned ? 'grayscale border-gray-800' : 'border-cyan-500/50 shadow-cyan-500/20'}`}>
                            <div className="absolute inset-0 bg-gray-900 scale-110 transition-transform duration-[10s] ease-linear group-hover:scale-125 group-hover:rotate-1">
                                <IslandLandscapeSVG islandId={selectedIsland.id} />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                            
                            {/* Cabinet & Character Projection */}
                            <div className="absolute left-[45%] top-[45%] transform -translate-x-1/2 -translate-y-1/2 scale-125 z-10 transition-transform duration-500 group-hover:scale-135 group-hover:-translate-y-[55%] pointer-events-none">
                                 <CabinetSVG islandId={selectedIsland.id} mode="hall" visualState="FREE" charId={selectedIsland.hostess_char_id} />
                            </div>
                            <div className="absolute right-[-40px] bottom-0 w-[65%] h-[65%] drop-shadow-2xl transition-transform duration-700 group-hover:scale-105 group-hover:translate-x-[-10px] z-20 pointer-events-none">
                                <CharacterSVG type={selectedIsland.hostess_char_id} mood="idle" />
                            </div>

                            <div className="absolute bottom-6 left-6 z-30">
                                <div className="text-xs text-cyan-400 font-black tracking-widest mb-1 flex items-center gap-2 bg-black/60 px-2 py-1 rounded w-fit backdrop-blur-sm border border-cyan-500/30">
                                    <MapPin size={12}/> {isOwned ? 'ACCESS GRANTED' : 'HIGH ROLLER REGION'}
                                </div>
                                <h1 className="text-4xl font-black italic uppercase text-white drop-shadow-xl leading-none mb-2" style={{textShadow: '0 0 20px rgba(0,0,0,0.8)'}}>
                                    {selectedIsland.name}
                                </h1>
                                <p className="text-[10px] text-gray-300 max-w-[150px] leading-tight mb-3 drop-shadow-md">
                                    {selectedIsland.desc || "Explore the unknown..."}
                                </p>
                                
                                {!isOwned && (
                                    <div className="mt-2 flex flex-col gap-1">
                                        <div className="bg-black/80 border border-red-500/50 text-red-400 text-[9px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 w-fit">
                                            <Lock size={10}/> DEP. {selectedIsland.reqDeposit.toLocaleString()} TO UNLOCK
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="h-12 flex justify-center gap-2 items-center z-20">
                {islands.map((_, idx) => (
                    <div key={idx} className={`transition-all duration-300 rounded-full ${idx === currentIndex ? 'bg-cyan-500 w-6 h-2 shadow-[0_0_10px_cyan]' : 'bg-gray-700 w-2 h-2'}`} />
                ))}
            </div>

            {/* --- MODALS --- */}
            
            {/* 1. Unlock Island Modal (V3 Deposit Progression) */}
            <AnimatePresence>
                {showUnlockModal && selectedIsland && (
                    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 backdrop-blur-md animate-in zoom-in-95" onClick={() => setShowUnlockModal(false)}>
                        <GlassCard className="w-full max-w-sm p-0 overflow-hidden border-cyan-500/50 shadow-[0_0_40px_rgba(0,243,255,0.2)]" onClick={e => e.stopPropagation()}>
                            
                            <div className="bg-gradient-to-r from-red-900 to-black p-4 flex justify-between items-center border-b border-red-500/30">
                                <h3 className="text-white font-black text-lg flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-red-500"/> ACCESS DENIED
                                </h3>
                                <button onClick={() => setShowUnlockModal(false)} className="text-white/70 hover:text-white"><X size={20}/></button>
                            </div>
                            
                            <div className="p-6 bg-black/90">
                                <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                                    To enter <strong className="text-white">{selectedIsland.name}</strong>, you must meet the VIP lifetime deposit requirements for this sector.
                                </p>

                                {/* Requirement: Deposits */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                                        <span>LIFETIME DEPOSITS</span>
                                        <span className={userStats.totalDeposited >= selectedIsland.reqDeposit ? "text-green-400" : "text-white"}>
                                            {userStats.totalDeposited.toLocaleString()} / {selectedIsland.reqDeposit.toLocaleString()} MMK
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                                        <div className={`h-full transition-all duration-1000 ${userStats.totalDeposited >= selectedIsland.reqDeposit ? 'bg-green-500' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'}`} 
                                             style={{ width: `${Math.min(100, (userStats.totalDeposited / selectedIsland.reqDeposit) * 100 || 0)}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2 text-center">
                                        Increase your lifetime deposits by making a top-up in the cashier to unlock higher tier floors.
                                    </p>
                                </div>

                                <button 
                                    onClick={() => { setShowUnlockModal(false); router.push('/wallet'); }}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    <Coins size={18}/> GO TO CASHIER
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </AnimatePresence>

            {/* 2. Missions Modal */}
            {showMissions && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 backdrop-blur-sm animate-in zoom-in-95" onClick={() => setShowMissions(false)}>
                    <GlassCard className="w-full max-w-sm p-0 overflow-hidden border-blue-500/50" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 flex justify-between items-center">
                            <h2 className="text-xl font-black text-white italic">DAILY MISSIONS</h2>
                            <button onClick={() => setShowMissions(false)}><X size={20} className="text-white/50 hover:text-white"/></button>
                        </div>
                        <div className="p-4 space-y-3 bg-black/80 max-h-[60vh] overflow-y-auto">
                            {missions.length === 0 ? (
                                <div className="text-center text-gray-500 text-xs py-4">No missions active right now.</div>
                            ) : (
                                missions.map(m => (
                                    <div key={m.id} className="bg-white/5 border border-white/10 p-3 rounded-xl relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <div className="text-sm font-bold text-white max-w-[70%] leading-tight">{m.task}</div>
                                            <div className="text-xs text-yellow-400 font-mono font-bold bg-yellow-900/30 px-2 py-0.5 rounded border border-yellow-500/30">+{m.reward.toLocaleString()}</div>
                                        </div>
                                        <div className="w-full h-2 bg-black rounded-full overflow-hidden mb-2 border border-white/5">
                                            <div className={`h-full transition-all duration-1000 ${m.claimed ? 'bg-green-500' : 'bg-blue-500 shadow-[0_0_10px_blue]'}`} style={{width: `${(m.progress/m.total)*100}%`}}></div>
                                        </div>
                                        <div className="flex justify-between items-center relative z-10">
                                            <span className="text-[10px] text-gray-400 font-mono">{m.progress.toLocaleString()} / {m.total.toLocaleString()}</span>
                                            {m.claimed ? (
                                                <span className="text-[10px] text-green-500 font-bold flex items-center gap-1"><CheckCircle size={12}/> CLAIMED</span>
                                            ) : (
                                                <button onClick={() => claimMission(m.id, m.reward)} disabled={m.progress < m.total} className={`text-[10px] px-4 py-1.5 rounded-full font-bold shadow-md transition-all ${m.progress >= m.total ? 'bg-yellow-500 text-black hover:scale-105 active:scale-95 animate-pulse' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}>CLAIM</button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}

            {showDailyBonus && <DailyBonusModal onClose={() => setShowDailyBonus(false)} />}

            <BottomDock activeCharId={user?.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} onOpenBank={() => router.push('/wallet')} />
        </div>
    );
}