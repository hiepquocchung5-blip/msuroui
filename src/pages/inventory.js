import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { user as userApi } from '../services/api';
import { ChevronLeft, Heart, Lock, CheckCircle, Sparkles, UserCheck, Star, Coins } from 'lucide-react';
import CharacterSVG from '../components/visuals/CharacterSVG';
import GlassCard from '../components/ui/GlassCard';
import BottomDock from '../components/layout/BottomDock';
import { useGameSound } from '../hooks/useGameSound';

export default function InventoryPage() {
    const { user, loading, updateBalance } = useAuth(); // We might need to refresh user context
    const { addToast } = useToast();
    const router = useRouter();
    const { playSound } = useGameSound();

    const [roster, setRoster] = useState([]);
    const [selectedChar, setSelectedChar] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEquipping, setIsEquipping] = useState(false);

    // Fetch Roster
    useEffect(() => {
        const fetchRoster = async () => {
            try {
                const res = await api.get('/user/characters.php');
                if (res.data.status === 'success') {
                    setRoster(res.data.roster);
                    // Default select active character or first available
                    const active = res.data.roster.find(c => c.is_active) || res.data.roster[0];
                    setSelectedChar(active);
                }
            } catch (e) {
                console.error("Roster error", e);
                addToast("Failed to load characters.", 'error');
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchRoster();
    }, [user, addToast]);

    const handleEquip = async (char) => {
        if (!char.is_owned) return;
        setIsEquipping(true);
        playSound('click');

        try {
            const res = await userApi.equipCharacter(char.char_key);
            if (res.data.status === 'success') {
                addToast(`Equipped ${char.name}!`, 'success');
                
                // Update local state to reflect change immediately
                setRoster(prev => prev.map(c => ({
                    ...c,
                    is_active: c.char_key === char.char_key
                })));
                
                // Force reload/update global context
                // In a production app with SWR/React Query this would auto-revalidate.
                // For this setup, we reload to sync the BottomDock/Header avatars.
                setTimeout(() => window.location.reload(), 800);
            }
        } catch (e) {
            addToast("Failed to equip character.", 'error');
        } finally {
            setIsEquipping(false);
        }
    };

    if (loading || !user) return <div className="bg-black min-h-screen"/>;

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden flex flex-col">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-pink-900/20 to-black pointer-events-none" />

            {/* Header */}
            <div className="p-6 pt-8 relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-white hover:text-pink-400 transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-black text-white tracking-widest italic flex items-center gap-2">
                        <Heart className="text-pink-500" fill="currentColor" /> MY GIRLS
                    </h1>
                </div>
                <div className="bg-black/50 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                    <Coins size={14} className="text-yellow-400" />
                    <span className="text-white font-mono font-bold text-xs">{parseFloat(user.balance).toLocaleString()}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row px-6 gap-6 relative z-10 overflow-y-auto">
                
                {/* 1. Character Preview (Large) */}
                <div className="w-full md:w-1/2 h-[50vh] md:h-auto relative flex items-center justify-center">
                    {selectedChar && (
                        <div className="relative w-full h-full animate-in zoom-in duration-500 flex items-center justify-center">
                            {/* Spotlight */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-t from-pink-500/20 to-transparent blur-3xl rounded-full pointer-events-none"></div>
                            
                            <div className="w-full h-full relative z-10 scale-125 origin-bottom">
                                <CharacterSVG 
                                    type={selectedChar.char_key} 
                                    mood="idle" 
                                    scale={1}
                                />
                            </div>
                            
                            {/* Info Overlay */}
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
                                <h2 className="text-3xl font-black text-white italic uppercase drop-shadow-lg">{selectedChar.name}</h2>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs font-bold text-pink-300 border border-pink-500/30">
                                        <Heart size={12} fill="currentColor"/> {selectedChar.affection}% Affection
                                    </div>
                                    {selectedChar.is_premium == 1 && (
                                        <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded text-xs font-bold text-yellow-400 border border-yellow-500/30">
                                            <Star size={12} fill="currentColor"/> PREMIUM
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Selection Grid */}
                <div className="w-full md:w-1/2 pb-10">
                    <div className="grid grid-cols-3 gap-3">
                        {roster.map(char => (
                            <GlassCard 
                                key={char.char_key}
                                onClick={() => setSelectedChar(char)}
                                className={`p-2 relative cursor-pointer transition-all duration-300 group overflow-hidden
                                    ${selectedChar?.char_key === char.char_key ? 'border-pink-500 bg-pink-900/20 ring-1 ring-pink-500/50' : 'border-white/10 hover:border-white/30'}
                                    ${!char.is_owned ? 'opacity-60 grayscale' : ''}
                                `}
                            >
                                {/* Thumbnail */}
                                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-black relative">
                                    <div className="absolute inset-0 scale-150 translate-y-4">
                                        <CharacterSVG type={char.char_key} stickerMode={true} />
                                    </div>
                                    
                                    {/* Status Badges */}
                                    {char.is_active && (
                                        <div className="absolute top-1 right-1 bg-green-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg z-10">ACTIVE</div>
                                    )}
                                    {!char.is_owned && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-gray-400 gap-1 z-10 backdrop-blur-[1px]">
                                            <Lock size={20} />
                                            <span className="text-[8px] font-bold">LOCKED</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="text-center mt-2">
                                    <div className="text-[10px] font-bold text-white truncate">{char.name}</div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>

                    {/* Action Bar */}
                    <div className="fixed bottom-24 left-0 right-0 px-6 z-50 md:absolute md:bottom-0 md:left-auto md:right-auto md:w-full">
                        {selectedChar && (
                            selectedChar.is_owned ? (
                                <button 
                                    onClick={() => handleEquip(selectedChar)}
                                    disabled={selectedChar.is_active || isEquipping}
                                    className={`w-full py-4 rounded-xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all border border-white/10
                                    ${selectedChar.is_active 
                                        ? 'bg-gray-800 text-gray-500 cursor-default' 
                                        : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:scale-[1.02] active:scale-95 shadow-pink-900/50'}`}
                                >
                                    {isEquipping ? <Loader2 className="animate-spin" size={18}/> : (
                                        selectedChar.is_active ? <><CheckCircle size={18}/> CURRENTLY ACTIVE</> : <><UserCheck size={18}/> SET AS PARTNER</>
                                    )}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => router.push('/shop')}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 border border-white/10 shadow-yellow-900/50"
                                >
                                    <Sparkles size={18} /> UNLOCK IN SHOP
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            <BottomDock 
                activeCharId={user.active_pet_id} 
                onNavigate={(path) => router.push(`/${path}`)} 
                onOpenBank={() => router.push('/wallet')}
            />
        </div>
    );
}