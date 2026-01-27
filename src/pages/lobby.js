import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; // Assuming ToastContext is available
import api, { game, finance, user as userApi } from '../services/api';
import { ChevronLeft, ChevronRight, Lock, Coins, MapPin, Loader2, Bell, Trophy, Calendar, Check, Volume2, VolumeX, X } from 'lucide-react';
import CharacterSVG from '../components/visuals/CharacterSVG';
import CabinetSVG from '../components/visuals/CabinetSVG';
import IslandLandscapeSVG from '../components/visuals/IslandLandscapeSVG';
import BottomDock from '../components/layout/BottomDock';
import GlassCard from '../components/ui/GlassCard';
import { useGameSound } from '../hooks/useGameSound';

export default function Lobby() {
    const { user, loading, updateBalance } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    
    // State
    const [islands, setIslands] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // New State for Audio & Bonus
    const [isMuted, setIsMuted] = useState(false);
    const [showDailyBonus, setShowDailyBonus] = useState(false);
    const [bonusClaiming, setBonusClaiming] = useState(false);
    const [bonusData, setBonusData] = useState(null); // { day: 1, reward: 1000 }

    const { playSound } = useGameSound(!isMuted);

    // Fetch Data (Islands & Notifications)
    useEffect(() => {
        const initLobby = async () => {
            try {
                // Fetch Islands and Notifications in parallel
                const [resIslands, resNotifs] = await Promise.all([
                    game.getIslands(),
                    userApi.getNotifications()
                ]);

                if (resIslands.data.status === 'success') {
                    setIslands(resIslands.data.data);
                }
                
                if (resNotifs.data.status === 'success') {
                    setUnreadCount(resNotifs.data.count || 0);
                }
                
                // Check Daily Bonus Status (Simulated Check or separate endpoint)
                // For better UX, we could have an endpoint check status. 
                // Here we just check local storage to see if we should auto-open
                const lastClaimDate = localStorage.getItem(`daily_claim_${user.id}`);
                const today = new Date().toDateString();
                if (lastClaimDate !== today) {
                    setTimeout(() => setShowDailyBonus(true), 1500); // Pop up after load
                }

            } catch (e) { 
                console.error("Failed to load lobby data", e);
            }
        };

        if (!loading && user) {
            initLobby();
        }
    }, [loading, user]);

    // Carousel Navigation Logic
    const handleNav = (direction) => {
        playSound('click');
        setIsTransitioning(true);
        setTimeout(() => {
            if (direction === 'next') {
                setCurrentIndex((prev) => (prev + 1) % islands.length);
            } else {
                setCurrentIndex((prev) => (prev - 1 + islands.length) % islands.length);
            }
            setIsTransitioning(false);
        }, 300);
    };

    const selectedIsland = islands[currentIndex];
    
    // Check Ownership Logic
    const checkOwnership = (islandId) => {
        if (!user?.owned_islands) return false;
        
        let owned = [];
        if (Array.isArray(user.owned_islands)) {
            owned = user.owned_islands;
        } else if (typeof user.owned_islands === 'string') {
            try {
                owned = JSON.parse(user.owned_islands);
                if (!Array.isArray(owned)) owned = []; 
            } catch (e) { owned = []; }
        }
        
        return owned.includes(islandId);
    };

    const isOwned = selectedIsland ? checkOwnership(selectedIsland.id) : false;

    // Action Handlers
    const handleEnter = async (island) => {
        playSound('click');
        if (!isOwned) {
            // Purchase Flow
            if (parseFloat(user.balance) < parseFloat(island.unlock_price)) {
                addToast("Insufficient Funds to travel here. Please deposit.", 'error');
                return;
            }
            
            if(confirm(`Unlock ${island.name} Access? \nPrice: ${parseFloat(island.unlock_price).toLocaleString()} MMK`)) {
               setIsPurchasing(true);
               try {
                   const res = await finance.purchaseIsland(island.id); 
                   if (res.data.status === 'success') {
                       updateBalance(res.data.new_balance);
                       router.reload(); 
                   }
               } catch(e) { 
                   addToast(e.response?.data?.error || "Purchase Failed", 'error'); 
               } finally {
                   setIsPurchasing(false);
               }
            }
            return;
        }
        
        // Enter Game Room
        router.push(`/game/${island.id}`);
    };

    const handleClaimBonus = async () => {
        setBonusClaiming(true);
        playSound('click');
        try {
            // Assuming this endpoint exists from Step 2 of 10.0 ideas
            // If not, this is where it would be called.
            const res = await api.post('/game/daily_bonus.php'); 
            
            if (res.data.status === 'success') {
                playSound('win');
                updateBalance(res.data.new_balance || user.balance); // Update balance if returned
                setBonusData(res.data); // { day: 2, reward: 2000, next_reward: 3000 }
                addToast(`Claimed ${res.data.reward} MMK!`, 'success');
                
                // Mark locally as claimed today
                localStorage.setItem(`daily_claim_${user.id}`, new Date().toDateString());
                
                // Close modal after delay
                setTimeout(() => setShowDailyBonus(false), 2000);
            }
        } catch (e) {
            console.error("Bonus Error", e);
            // Fallback simulation if API not ready
            addToast(e.response?.data?.error || "Daily Bonus already claimed.", 'info');
            setShowDailyBonus(false);
            localStorage.setItem(`daily_claim_${user.id}`, new Date().toDateString());
        } finally {
            setBonusClaiming(false);
        }
    };

    // Loading State
    if (loading || !selectedIsland) return <div className="bg-black min-h-screen text-white flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500 mr-2"/> Loading World...</div>;

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden flex flex-col">
            
            {/* Header: Stats & Quick Actions */}
            <div className="pt-4 px-6 pb-2 flex justify-between items-center z-20 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm sticky top-0">
                
                {/* Level & Progress */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                         <span className="text-white font-black text-lg italic tracking-tighter">LVL {user.level}</span>
                         <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden border border-white/20">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000" style={{width: `${user.progress_percent || 0}%`}}></div>
                        </div>
                    </div>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-2">
                    {/* Daily Bonus */}
                    <button onClick={() => { playSound('click'); setShowDailyBonus(true); }} className="w-9 h-9 rounded-full bg-green-900/30 border border-green-500/30 flex items-center justify-center text-green-400 hover:bg-green-500/20 active:scale-95 transition-all">
                        <Calendar size={16} />
                    </button>

                    {/* Tournament Shortcut */}
                    <button onClick={() => { playSound('click'); router.push('/tournaments'); }} className="w-9 h-9 rounded-full bg-yellow-900/30 border border-yellow-500/30 flex items-center justify-center text-yellow-400 hover:bg-yellow-500/20 active:scale-95 transition-all">
                        <Trophy size={16} />
                    </button>

                    {/* Notifications Shortcut */}
                    <button onClick={() => { playSound('click'); router.push('/notifications'); }} className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all relative">
                        <Bell size={16} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-black flex items-center justify-center text-[8px] font-bold">
                                {unreadCount > 9 ? '!' : unreadCount}
                            </span>
                        )}
                    </button>
                    
                    {/* Mute Toggle */}
                     <button onClick={() => setIsMuted(!isMuted)} className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all">
                        {isMuted ? <VolumeX size={16}/> : <Volume2 size={16}/>}
                    </button>

                    {/* Wallet Display */}
                    <div className="bg-black/50 px-3 py-1.5 rounded-full border border-yellow-500/30 flex items-center gap-2 backdrop-blur-md cursor-pointer hover:bg-black/70 active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.1)]" onClick={() => router.push('/wallet')}>
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-mono font-bold text-sm">{parseFloat(user.balance).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* 3D CAROUSEL STAGE */}
            <div className="flex-1 relative flex items-center justify-center perspective-1000">
                
                {/* Ambient Background Transition */}
                <div className={`absolute inset-0 transition-colors duration-1000 opacity-60 bg-gradient-to-b from-black via-transparent to-black`} 
                     style={{ backgroundColor: selectedIsland.id === 3 ? '#300' : (selectedIsland.id === 5 ? '#002' : '#000') }} 
                />

                {/* Nav Arrows */}
                <button onClick={() => handleNav('prev')} className="absolute left-2 z-30 p-3 bg-black/50 rounded-full text-white hover:bg-white/20 border border-white/10 active:scale-95 transition-transform"><ChevronLeft/></button>
                <button onClick={() => handleNav('next')} className="absolute right-2 z-30 p-3 bg-black/50 rounded-full text-white hover:bg-white/20 border border-white/10 active:scale-95 transition-transform"><ChevronRight/></button>

                {/* THE CARD */}
                <div 
                    className={`relative w-[85%] h-[65vh] group cursor-pointer transform-style-3d transition-all duration-500 ease-out ${isTransitioning ? 'scale-90 opacity-50 rotate-y-12' : 'scale-100 opacity-100'}`} 
                    onClick={() => handleEnter(selectedIsland)}
                >
                    <div className={`w-full h-full rounded-3xl overflow-hidden border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative transition-all duration-500 ${!isOwned ? 'grayscale border-gray-800' : 'border-cyan-500/50 shadow-cyan-500/20'}`}>
                        
                        {/* Layer 1: Background Landscape */}
                        <div className="absolute inset-0 bg-gray-900 scale-110 transition-transform duration-[10s] ease-linear group-hover:scale-125 group-hover:rotate-1">
                            <IslandLandscapeSVG islandId={selectedIsland.id} />
                        </div>
                        
                        {/* Layer 2: Atmospheric Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>

                        {/* Layer 3: 3D CABINET SHOWCASE (Center) */}
                        <div className="absolute left-[50%] top-[45%] transform -translate-x-1/2 -translate-y-1/2 scale-125 z-10 transition-transform duration-500 group-hover:scale-135 group-hover:-translate-y-[55%]">
                             <CabinetSVG 
                                islandId={selectedIsland.id} 
                                mode="hall" 
                                visualState="FREE" 
                                charId={selectedIsland.hostess_char_id} 
                            />
                        </div>

                        {/* Layer 4: Hostess Character (Side) */}
                        <div className="absolute right-[-30px] bottom-0 w-[60%] h-[60%] drop-shadow-2xl transition-transform duration-700 group-hover:scale-105 group-hover:translate-x-[-10px] z-20 pointer-events-none">
                            <CharacterSVG type={selectedIsland.hostess_char_id} mood="idle" />
                        </div>

                        {/* Layer 5: Info Overlay */}
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

            {/* Pagination Dots */}
            <div className="h-12 flex justify-center gap-2 items-center z-20">
                {islands.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`transition-all duration-300 rounded-full ${idx === currentIndex ? 'bg-cyan-500 w-6 h-2 shadow-[0_0_10px_cyan]' : 'bg-gray-700 w-2 h-2'}`} 
                    />
                ))}
            </div>

            {/* Daily Bonus Modal */}
            {showDailyBonus && (
                <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-sm animate-in zoom-in-95">
                    <GlassCard className="w-full max-w-sm p-6 text-center border-yellow-500/50 shadow-[0_0_60px_rgba(234,179,8,0.2)]">
                        {bonusData ? (
                            <>
                                <h2 className="text-3xl font-black text-yellow-400 mb-2 italic">CLAIMED!</h2>
                                <div className="text-6xl mb-4">🎁</div>
                                <div className="text-white text-xl font-bold mb-2">+{bonusData.reward.toLocaleString()} MMK</div>
                                <p className="text-gray-400 text-xs">Come back tomorrow for more!</p>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-black text-white italic">DAILY BONUS</h2>
                                    <button onClick={() => setShowDailyBonus(false)}><X size={20} className="text-gray-500"/></button>
                                </div>
                                <div className="grid grid-cols-4 gap-2 mb-6">
                                    {[1,2,3,4,5,6,7].map(day => (
                                        <div key={day} className={`aspect-square rounded-xl flex flex-col items-center justify-center border ${day === 1 ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                            <span className="text-[10px] font-bold">DAY {day}</span>
                                            <span className="text-xs font-black">{day===7 ? '50k' : (day*1)+'k'}</span>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={handleClaimBonus} 
                                    disabled={bonusClaiming}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-sm shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                                >
                                    {bonusClaiming ? <Loader2 className="animate-spin" size={18}/> : <><Check size={18}/> CLAIM REWARD</>}
                                </button>
                            </>
                        )}
                    </GlassCard>
                </div>
            )}

            <BottomDock activeCharId={user.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} onOpenBank={() => router.push('/wallet')} />
        </div>
    );
}