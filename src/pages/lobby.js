import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; 
import api, { game, finance, user as userApi } from '../services/api';
import { ChevronLeft, ChevronRight, Lock, Coins, MapPin, Loader2, Bell, Trophy, Calendar, Volume2, VolumeX, X, MessageCircle, ClipboardList, CheckCircle } from 'lucide-react';
import CharacterSVG from '../components/visuals/CharacterSVG';
import CabinetSVG from '../components/visuals/CabinetSVG';
import IslandLandscapeSVG from '../components/visuals/IslandLandscapeSVG';
import BottomDock from '../components/layout/BottomDock';
import GlassCard from '../components/ui/GlassCard';
import DailyBonusModal from '../components/game/DailyBonusModal';
import GlobalTicker from '../components/ui/GlobalTicker'; // New: Ticker in Lobby
import ActiveEvents from '../components/ui/ActiveEvents'; // New: Events in Lobby
import { useGameSound } from '../hooks/useGameSound';

export default function Lobby() {
    const { user, loading, updateBalance } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    
    // Core State
    const [islands, setIslands] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // UI/Audio State
    const [isMuted, setIsMuted] = useState(false);
    const [showDailyBonus, setShowDailyBonus] = useState(false);
    const [showMissions, setShowMissions] = useState(false); // New: Missions Modal
    
    // Tutorial / Greeting State
    const [tutorialStep, setTutorialStep] = useState(0);

    const { playSound } = useGameSound(!isMuted);

    // Mock Missions Data (In real app, fetch from API)
    const [missions, setMissions] = useState([
        { id: 1, task: "Spin 50 Times", progress: 34, total: 50, reward: 500, claimed: false },
        { id: 2, task: "Hit a Big Win (>10x)", progress: 1, total: 1, reward: 1000, claimed: true },
        { id: 3, task: "Play 'Inferna' Island", progress: 0, total: 1, reward: 200, claimed: false },
    ]);

    // 1. Fetch Lobby Data
    useEffect(() => {
        const initLobby = async () => {
            try {
                const [resIslands, resNotifs] = await Promise.all([
                    game.getIslands(),
                    userApi.getNotifications()
                ]);

                if (resIslands.data.status === 'success') setIslands(resIslands.data.data);
                if (resNotifs.data.status === 'success') setUnreadCount(resNotifs.data.count || 0);

                // Auto-trigger Tutorial
                const hasSeenIntro = sessionStorage.getItem('suro_intro_seen');
                if (!hasSeenIntro) {
                    setTimeout(() => {
                        setTutorialStep(1);
                        playSound('win'); 
                    }, 500);
                } else {
                    checkDailyBonus();
                }

            } catch (e) { 
                console.error("Lobby Load Error", e);
            }
        };

        if (!loading && user) {
            initLobby();
        }
    }, [loading, user]);

    // 2. Check Daily Bonus
    const checkDailyBonus = () => {
        const lastClaimDate = localStorage.getItem(`daily_claim_${user.id}`);
        const today = new Date().toDateString();
        if (lastClaimDate !== today) {
            setTimeout(() => setShowDailyBonus(true), 1000);
        }
    };

    // 3. Tutorial Logic
    const handleTutorialNext = () => {
        playSound('click');
        if (tutorialStep >= 4) {
            setTutorialStep(0);
            sessionStorage.setItem('suro_intro_seen', 'true');
            checkDailyBonus();
        } else {
            setTutorialStep(prev => prev + 1);
        }
    };

    const getTutorialContent = () => {
        switch(tutorialStep) {
            case 1: return { text: `Welcome back, ${user.username}! I've been waiting for you! Let's win big today!`, mood: 'win' };
            case 2: return { text: "Don't forget to check your DAILY BONUS by tapping the Calendar icon above!", mood: 'idle' };
            case 3: return { text: "Check the MISSIONS tab (Clipboard icon) to earn extra rewards while playing!", mood: 'idle' };
            case 4: return { text: "Swipe left or right to choose an Island. Each one has unique machines. Good luck!", mood: 'win' };
            default: return { text: "", mood: 'idle' };
        }
    };

    // Navigation & Interaction
    const handleNav = (direction) => {
        playSound('click');
        setIsTransitioning(true);
        setTimeout(() => {
            if (direction === 'next') setCurrentIndex((prev) => (prev + 1) % islands.length);
            else setCurrentIndex((prev) => (prev - 1 + islands.length) % islands.length);
            setIsTransitioning(false);
        }, 300);
    };

    const selectedIsland = islands[currentIndex];
    
    const checkOwnership = (islandId) => {
        if (!user?.owned_islands) return false;
        let owned = [];
        if (Array.isArray(user.owned_islands)) owned = user.owned_islands;
        else if (typeof user.owned_islands === 'string') {
            try { owned = JSON.parse(user.owned_islands); if (!Array.isArray(owned)) owned = []; } catch (e) { owned = []; }
        }
        return owned.includes(islandId);
    };

    const isOwned = selectedIsland ? checkOwnership(selectedIsland.id) : false;

    const handleEnter = async (island) => {
        playSound('click');
        if (!isOwned) {
            if (parseFloat(user.balance) < parseFloat(island.unlock_price)) {
                addToast("Insufficient Funds to unlock.", 'error');
                return;
            }
            if(confirm(`Unlock ${island.name}? Price: ${parseFloat(island.unlock_price).toLocaleString()} MMK`)) {
               setIsPurchasing(true);
               try {
                   const res = await finance.purchaseIsland(island.id); 
                   if (res.data.status === 'success') {
                       updateBalance(res.data.new_balance);
                       router.reload(); 
                   }
               } catch(e) { 
                   addToast("Purchase Failed", 'error'); 
               } finally {
                   setIsPurchasing(false);
               }
            }
            return;
        }
        router.push(`/game/${island.id}`);
    };

    // Claim Mission
    const claimMission = (id, reward) => {
        playSound('win');
        updateBalance(parseFloat(user.balance) + reward);
        addToast(`Claimed ${reward} MMK!`, 'success');
        setMissions(prev => prev.map(m => m.id === id ? { ...m, claimed: true } : m));
    };

    if (loading || !selectedIsland) return <div className="bg-black min-h-screen text-white flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500 mr-2"/> Loading World...</div>;

    const tut = getTutorialContent();

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden flex flex-col">
            
            {/* Global Ticker */}
            <div className="relative z-50">
                <GlobalTicker />
            </div>

            {/* Active Events Overlay */}
            <ActiveEvents />

            {/* --- HEADER --- */}
            <div className="pt-2 px-6 pb-2 flex justify-between items-center z-20 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm sticky top-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                         <span className="text-white font-black text-lg italic tracking-tighter">LVL {user.level}</span>
                         <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden border border-white/20">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000" style={{width: `${user.progress_percent || 0}%`}}></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Missions */}
                    <button onClick={() => { playSound('click'); setShowMissions(true); }} className="w-9 h-9 rounded-full bg-blue-900/30 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 active:scale-95 transition-all">
                        <ClipboardList size={16} />
                    </button>

                    {/* Daily Bonus */}
                    <button onClick={() => { playSound('click'); setShowDailyBonus(true); }} className="w-9 h-9 rounded-full bg-green-900/30 border border-green-500/30 flex items-center justify-center text-green-400 hover:bg-green-500/20 active:scale-95 transition-all">
                        <Calendar size={16} />
                    </button>

                    {/* Tournament */}
                    <button onClick={() => { playSound('click'); router.push('/tournaments'); }} className="w-9 h-9 rounded-full bg-yellow-900/30 border border-yellow-500/30 flex items-center justify-center text-yellow-400 hover:bg-yellow-500/20 active:scale-95 transition-all">
                        <Trophy size={16} />
                    </button>

                    {/* Notifications */}
                    <button onClick={() => { playSound('click'); router.push('/notifications'); }} className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all relative">
                        <Bell size={16} />
                        {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-black flex items-center justify-center text-[8px] font-bold">{unreadCount > 9 ? '!' : unreadCount}</span>}
                    </button>
                    
                    {/* Wallet */}
                    <div className="bg-black/50 px-3 py-1.5 rounded-full border border-yellow-500/30 flex items-center gap-2 backdrop-blur-md cursor-pointer hover:bg-black/70 active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.1)]" onClick={() => router.push('/wallet')}>
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-mono font-bold text-sm">{parseFloat(user.balance).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* --- 3D CAROUSEL --- */}
            <div className="flex-1 relative flex items-center justify-center perspective-1000">
                <div className={`absolute inset-0 transition-colors duration-1000 opacity-60 bg-gradient-to-b from-black via-transparent to-black`} 
                     style={{ backgroundColor: selectedIsland.id === 3 ? '#300' : (selectedIsland.id === 5 ? '#002' : '#000') }} 
                />

                <button onClick={() => handleNav('prev')} className="absolute left-2 z-30 p-3 bg-black/50 rounded-full text-white hover:bg-white/20 border border-white/10 active:scale-95 transition-transform"><ChevronLeft/></button>
                <button onClick={() => handleNav('next')} className="absolute right-2 z-30 p-3 bg-black/50 rounded-full text-white hover:bg-white/20 border border-white/10 active:scale-95 transition-transform"><ChevronRight/></button>

                <div 
                    className={`relative w-[85%] h-[65vh] group cursor-pointer transform-style-3d transition-all duration-500 ease-out ${isTransitioning ? 'scale-90 opacity-50 rotate-y-12' : 'scale-100 opacity-100'}`} 
                    onClick={() => handleEnter(selectedIsland)}
                >
                    <div className={`w-full h-full rounded-3xl overflow-hidden border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative transition-all duration-500 ${!isOwned ? 'grayscale border-gray-800' : 'border-cyan-500/50 shadow-cyan-500/20'}`}>
                        <div className="absolute inset-0 bg-gray-900 scale-110 transition-transform duration-[10s] ease-linear group-hover:scale-125 group-hover:rotate-1">
                            <IslandLandscapeSVG islandId={selectedIsland.id} />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                        
                        {/* Cabinet & Char */}
                        <div className="absolute left-[50%] top-[45%] transform -translate-x-1/2 -translate-y-1/2 scale-125 z-10 transition-transform duration-500 group-hover:scale-135 group-hover:-translate-y-[55%]">
                             <CabinetSVG islandId={selectedIsland.id} mode="hall" visualState="FREE" charId={selectedIsland.hostess_char_id} />
                        </div>
                        <div className="absolute right-[-30px] bottom-0 w-[60%] h-[60%] drop-shadow-2xl transition-transform duration-700 group-hover:scale-105 group-hover:translate-x-[-10px] z-20 pointer-events-none">
                            <CharacterSVG type={selectedIsland.hostess_char_id} mood="idle" />
                        </div>

                        <div className="absolute bottom-6 left-6 z-30">
                            <div className="text-xs text-cyan-400 font-black tracking-widest mb-1 flex items-center gap-2 bg-black/60 px-2 py-1 rounded w-fit backdrop-blur-sm border border-cyan-500/30">
                                <MapPin size={12}/> {isOwned ? 'OPEN WORLD' : 'LOCKED REGION'}
                            </div>
                            <h1 className="text-4xl font-black italic uppercase text-white drop-shadow-xl leading-none mb-2" style={{textShadow: '0 0 20px rgba(0,0,0,0.8)'}}>
                                {selectedIsland.name}
                            </h1>
                            <p className="text-[10px] text-gray-300 max-w-[150px] leading-tight mb-3 drop-shadow-md">
                                {selectedIsland.desc || "Explore the unknown..."}
                            </p>
                            {!isOwned && (
                                <div className="mt-2 bg-yellow-500 text-black font-bold px-4 py-3 rounded-xl inline-flex items-center gap-2 animate-bounce shadow-lg shadow-yellow-500/20">
                                    {isPurchasing ? <Loader2 className="animate-spin" size={16}/> : <Lock size={16}/>} 
                                    UNLOCK {parseFloat(selectedIsland.unlock_price).toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="h-12 flex justify-center gap-2 items-center z-20">
                {islands.map((_, idx) => (
                    <div key={idx} className={`transition-all duration-300 rounded-full ${idx === currentIndex ? 'bg-cyan-500 w-6 h-2 shadow-[0_0_10px_cyan]' : 'bg-gray-700 w-2 h-2'}`} />
                ))}
            </div>

            {/* --- MODALS & OVERLAYS --- */}

            {/* Tutorial */}
            {tutorialStep > 0 && (
                <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center animate-in fade-in" onClick={handleTutorialNext}>
                    <div className="absolute bottom-0 right-0 w-[80%] h-[70%] z-10 pointer-events-none animate-in slide-in-from-bottom-20 duration-500">
                        <CharacterSVG type={user.active_pet_id} mood={tut.mood} scale={1.2} />
                    </div>
                    <div className="absolute top-[30%] left-[10%] right-[10%] md:w-96 md:left-[20%] z-20">
                        <GlassCard className="p-6 border-cyan-500/50 bg-black/90 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative">
                             <div className="absolute -bottom-3 right-20 w-6 h-6 bg-black border-r border-b border-cyan-500/50 transform rotate-45"></div>
                             <div className="flex items-start gap-4">
                                 <div className="bg-cyan-900/50 p-2 rounded-full border border-cyan-500/30">
                                     <MessageCircle size={24} className="text-cyan-400" />
                                 </div>
                                 <div className="flex-1">
                                     <h3 className="text-cyan-400 font-bold text-xs mb-1 uppercase tracking-wider">GUIDE: {user.active_pet_id.toUpperCase()}</h3>
                                     <p className="text-white text-sm font-medium leading-relaxed">{tut.text}</p>
                                     <div className="mt-4 flex justify-end">
                                         <span className="text-[10px] text-gray-500 animate-pulse font-bold tracking-widest">TAP TO CONTINUE &rarr;</span>
                                     </div>
                                 </div>
                             </div>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Missions Modal */}
            {showMissions && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 backdrop-blur-sm animate-in zoom-in-95" onClick={() => setShowMissions(false)}>
                    <GlassCard className="w-full max-w-sm p-0 overflow-hidden border-blue-500/50" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 flex justify-between items-center">
                            <h2 className="text-xl font-black text-white italic">DAILY MISSIONS</h2>
                            <button onClick={() => setShowMissions(false)}><X size={20} className="text-white/50 hover:text-white"/></button>
                        </div>
                        <div className="p-4 space-y-3">
                            {missions.map(m => (
                                <div key={m.id} className="bg-white/5 border border-white/10 p-3 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-sm font-bold text-white">{m.task}</div>
                                        <div className="text-xs text-yellow-400 font-mono">+{m.reward}</div>
                                    </div>
                                    <div className="w-full h-2 bg-black rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-blue-500" style={{width: `${(m.progress/m.total)*100}%`}}></div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-gray-500">{m.progress} / {m.total}</span>
                                        {m.claimed ? (
                                            <span className="text-[10px] text-green-500 font-bold flex items-center gap-1"><CheckCircle size={10}/> CLAIMED</span>
                                        ) : (
                                            <button 
                                                onClick={() => claimMission(m.id, m.reward)} 
                                                disabled={m.progress < m.total}
                                                className={`text-[10px] px-3 py-1 rounded-full font-bold ${m.progress >= m.total ? 'bg-yellow-500 text-black animate-pulse' : 'bg-gray-700 text-gray-500'}`}
                                            >
                                                CLAIM
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Daily Bonus Modal */}
            {showDailyBonus && <DailyBonusModal onClose={() => setShowDailyBonus(false)} />}

            <BottomDock activeCharId={user.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} onOpenBank={() => router.push('/wallet')} />
        </div>
    );
}