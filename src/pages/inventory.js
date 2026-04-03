import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { user as userApi } from '../services/api';
import { 
    ChevronLeft, Heart, Lock, CheckCircle, Sparkles, UserCheck, 
    Star, Coins, Activity, Calendar, MapPin, Cpu, Database, Shield
} from 'lucide-react';
import CharacterSVG from '../components/visuals/CharacterSVG';
import GlassCard from '../components/ui/GlassCard';
import BottomDock from '../components/layout/BottomDock';
import { useGameSound } from '../hooks/useGameSound';

// --- LOCAL METADATA MAPPING (For V10.x Circuit Chaos UI) ---
const getCharMeta = (key) => {
    const meta = {
        luna: { rarity: 'R', color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-900/20', element: 'Moon / 月' },
        mika: { rarity: 'R', color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-900/20', element: 'Water / 水' },
        kira: { rarity: 'SR', color: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-900/20', element: 'Fire / 火' },
        glacia: { rarity: 'SR', color: 'text-sky-300', border: 'border-sky-500/50', bg: 'bg-sky-900/20', element: 'Ice / 氷' },
        bio: { rarity: 'SR', color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-900/20', element: 'Nature / 森' },
        gold: { rarity: 'SR', color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-900/20', element: 'Metal / 金' },
        yami: { rarity: 'SSR', color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-900/20', element: 'Dark / 闇' },
        sky: { rarity: 'SSR', color: 'text-yellow-200', border: 'border-yellow-200/50', bg: 'bg-yellow-900/20', element: 'Light / 光' },
        cyber: { rarity: 'UR', color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-900/20', element: 'Tech / 電' },
        void: { rarity: 'UR', color: 'text-fuchsia-500', border: 'border-fuchsia-500/50', bg: 'bg-fuchsia-900/20', element: 'Void / 無' },
    };
    return meta[key] || meta['luna'];
};

export default function InventoryPage() {
    const { user, loading, updateBalance } = useAuth();
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
                    const active = res.data.roster.find(c => c.is_active) || res.data.roster[0];
                    setSelectedChar(active);
                }
            } catch (e) {
                console.error("Roster error", e);
                addToast("Failed to decrypt roster matrix. / ဒေတာချိတ်ဆက်မှု မအောင်မြင်ပါ။", 'error');
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
                playSound('win');
                addToast(`Synchronized with ${char.name}! / ချိတ်ဆက်မှု အောင်မြင်ပါသည်။`, 'success');
                
                setRoster(prev => prev.map(c => ({
                    ...c,
                    is_active: c.char_key === char.char_key
                })));
                
                // Refresh context for bottom dock update
                setTimeout(() => window.location.reload(), 800);
            }
        } catch (e) {
            addToast("Failed to establish companion link.", 'error');
        } finally {
            setIsEquipping(false);
        }
    };

    if (loading || !user) return <div className="bg-black min-h-screen flex items-center justify-center font-mono text-cyan-500 animate-pulse tracking-widest">LOADING MATRIX...</div>;

    const meta = selectedChar ? getCharMeta(selectedChar.char_key) : null;

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden flex flex-col font-sans">
            {/* Cyber-Traditional Background Fusion */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/seigaiha.png')] opacity-[0.03] pointer-events-none z-0 mix-blend-screen" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
            <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/40 via-black to-black pointer-events-none z-0 transition-colors duration-1000 ${meta ? meta.bg.replace('/20', '/10') : ''}`} />

            {/* Header */}
            <div className="p-6 pt-8 relative z-20 flex items-center justify-between backdrop-blur-md border-b border-white/5 bg-black/50 sticky top-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-white hover:text-cyan-400 transition-colors active:scale-95">
                        <ChevronLeft size={28} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 tracking-widest italic flex items-center gap-2 drop-shadow-md leading-none">
                            <Database className="text-pink-500" size={20} /> COMPANIONS
                        </h1>
                        <span className="text-[10px] text-pink-300/80 font-bold tracking-widest uppercase mt-1">
                            仲間 <span className="mx-1 opacity-50">|</span> အဖော်များ
                        </span>
                    </div>
                </div>
                <div className="bg-black/60 px-4 py-1.5 rounded-full border border-yellow-500/30 flex items-center gap-2 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                    <Coins size={14} className="text-yellow-400" />
                    <span className="text-yellow-400 font-mono font-bold text-sm tracking-wide">{parseFloat(user.balance).toLocaleString()}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row px-4 lg:px-8 py-6 gap-6 relative z-10 overflow-y-auto hide-scrollbar">
                
                {/* 1. HOLOGRAPHIC PROJECTION UI (Left Side) */}
                <div className="w-full lg:w-5/12 xl:w-1/2 flex flex-col relative h-[55vh] lg:h-[70vh]">
                    <AnimatePresence mode="wait">
                        {selectedChar && meta && (
                            <motion.div 
                                key={selectedChar.char_key}
                                initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="w-full h-full relative flex flex-col items-center justify-end pb-10"
                            >
                                {/* Vertical Kanji Watermark */}
                                <div className="absolute left-0 top-10 text-white/5 font-black text-6xl tracking-[0.5em] pointer-events-none z-0" style={{ writingMode: 'vertical-rl' }}>
                                    運命の仲間
                                </div>

                                {/* Hologram Base / Pedestal */}
                                <div className="absolute bottom-0 w-[80%] h-12 bg-gradient-to-t from-cyan-900/50 to-transparent rounded-[100%] blur-xl pointer-events-none"></div>
                                <div className="absolute bottom-6 w-[60%] h-2 border-b-2 border-cyan-500/50 rounded-[100%] shadow-[0_0_20px_cyan] pointer-events-none"></div>
                                
                                {/* Vertical Scanline Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none mix-blend-overlay z-20"></div>

                                {/* Character SVG */}
                                <div className={`w-full h-[120%] absolute bottom-10 origin-bottom transform scale-125 z-10 transition-all duration-1000 ${!selectedChar.is_owned ? 'brightness-50 grayscale contrast-125 sepia-[20%] hue-rotate-180' : ''}`}>
                                    <CharacterSVG 
                                        type={selectedChar.char_key} 
                                        mood={selectedChar.is_owned ? "idle" : "sad"} 
                                    />
                                </div>

                                {/* Floating Rarity Tag */}
                                <div className={`absolute top-10 right-4 lg:right-10 px-4 py-1.5 border-l-2 border-b-2 rounded-bl-xl backdrop-blur-md shadow-lg font-black italic text-3xl tracking-tighter z-30 ${meta.border} ${meta.color} bg-black/60`}>
                                    {meta.rarity}
                                </div>

                                {/* Character Info Plate */}
                                <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black via-black/80 to-transparent z-30 flex justify-between items-end border-b border-white/10 pb-6">
                                    <div>
                                        <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] leading-none mb-1">
                                            {selectedChar.name}
                                        </h2>
                                        <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase flex items-center gap-2">
                                            <span>ID: 0x{selectedChar.char_key.toUpperCase()}</span>
                                            <span className="text-cyan-500/50">|</span>
                                            <span className="font-sans text-xs">アバター</span>
                                        </div>
                                    </div>
                                    {selectedChar.is_premium == 1 && (
                                        <div className="flex flex-col items-end">
                                            <Star className="text-yellow-400 fill-yellow-400 animate-pulse mb-1" size={20} />
                                            <span className="text-[8px] text-yellow-400 font-bold tracking-widest border border-yellow-500/50 bg-yellow-900/30 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(234,179,8,0.3)]">PREMIUM</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. DATA TELEMETRY & ROSTER GRID (Right Side) */}
                <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col gap-6 relative z-10">
                    
                    {/* Active Character Dossier */}
                    {selectedChar && meta && (
                        <GlassCard className={`p-5 border ${meta.border} bg-black/60 shadow-lg relative overflow-hidden`}>
                            <div className="absolute -bottom-10 -right-4 text-[120px] font-black text-white/5 pointer-events-none z-0 leading-none">絆</div>
                            
                            <h3 className="text-xs font-black text-white tracking-widest uppercase mb-4 border-b border-white/10 pb-3 flex items-center gap-2 relative z-10">
                                <Cpu size={16} className={meta.color}/> 
                                <div className="flex flex-col">
                                    <span>ENTITY TELEMETRY</span>
                                    <span className="text-[8px] text-gray-400">ဇာတ်ကောင် အချက်အလက်</span>
                                </div>
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-3 font-mono relative z-10">
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5 shadow-inner">
                                    <div className="text-[9px] text-gray-500 uppercase fw-bold mb-1 flex items-center justify-between">
                                        <span className="flex items-center gap-1"><MapPin size={10}/> Sector</span>
                                        <span className="text-[8px] font-sans text-gray-600">မူလနေရာ</span>
                                    </div>
                                    <div className="text-sm font-bold text-white">Island #{selectedChar.island_id}</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5 shadow-inner">
                                    <div className="text-[9px] text-gray-500 uppercase fw-bold mb-1 flex items-center justify-between">
                                        <span className="flex items-center gap-1"><Activity size={10}/> Element</span>
                                        <span className="text-[8px] font-sans text-gray-600">စွမ်းအင်</span>
                                    </div>
                                    <div className={`text-sm font-bold ${meta.color}`}>{meta.element}</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5 shadow-inner">
                                    <div className="text-[9px] text-gray-500 uppercase fw-bold mb-1 flex items-center justify-between">
                                        <span className="flex items-center gap-1"><Calendar size={10}/> Acquired</span>
                                        <span className="text-[8px] font-sans text-gray-600">ရရှိသောနေ့</span>
                                    </div>
                                    <div className={`text-xs font-bold ${selectedChar.is_owned ? 'text-green-400' : 'text-red-500'}`}>
                                        {selectedChar.is_owned ? (selectedChar.obtained_at ? new Date(selectedChar.obtained_at).toLocaleDateString() : 'DEFAULT / မူလ') : 'LOCKED / ပိတ်ထားသည်'}
                                    </div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5 shadow-inner">
                                    <div className="text-[9px] text-gray-500 uppercase fw-bold mb-1 flex items-center justify-between">
                                        <span className="flex items-center gap-1"><Heart size={10}/> Bond</span>
                                        <span className="text-[8px] font-sans text-gray-600">သံယောဇဉ်</span>
                                    </div>
                                    <div className="text-sm font-bold text-pink-400">{selectedChar.is_owned ? `${selectedChar.affection}%` : '---'}</div>
                                    {selectedChar.is_owned && (
                                        <div className="w-full h-1.5 bg-gray-900 rounded-full mt-1.5 overflow-hidden">
                                            <div className="h-full bg-pink-500 shadow-[0_0_5px_pink]" style={{width: `${selectedChar.affection}%`}}></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {/* Roster Grid */}
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 overflow-y-auto hide-scrollbar shadow-inner relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/seigaiha.png')] opacity-[0.05] pointer-events-none mix-blend-screen" />
                        
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 relative z-10">
                            {isLoading ? (
                                <div className="col-span-full text-center text-cyan-500 py-10 font-mono text-xs animate-pulse">Syncing Database... / ဒေတာချိတ်ဆက်နေသည်...</div>
                            ) : roster.map(char => {
                                const cMeta = getCharMeta(char.char_key);
                                const isSelected = selectedChar?.char_key === char.char_key;
                                
                                return (
                                    <div 
                                        key={char.char_key}
                                        onClick={() => setSelectedChar(char)}
                                        className={`relative cursor-pointer transition-all duration-300 group overflow-hidden rounded-xl bg-black border-2
                                            ${isSelected ? `${cMeta.border} shadow-[0_0_15px_rgba(0,0,0,0.5)] scale-105 z-10 ring-2 ring-white/20` : 'border-white/10 hover:border-white/30'}
                                            ${!char.is_owned ? 'opacity-50 grayscale hover:grayscale-0 hover:opacity-80' : ''}
                                        `}
                                    >
                                        <div className={`absolute top-0 right-0 w-7 h-7 rounded-bl-lg flex items-center justify-center text-[9px] font-black z-20 ${cMeta.bg} ${cMeta.color} ${cMeta.border} border-l border-b backdrop-blur-sm`}>
                                            {cMeta.rarity}
                                        </div>

                                        <div className="aspect-[3/4] overflow-hidden relative">
                                            <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 ${isSelected ? 'opacity-80' : 'opacity-90'}`}></div>
                                            <div className="absolute inset-0 scale-150 translate-y-2">
                                                <CharacterSVG type={char.char_key} stickerMode={true} />
                                            </div>
                                            
                                            {char.is_active && (
                                                <div className="absolute top-1 left-1 bg-green-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded shadow-[0_0_10px_lime] z-20 animate-pulse">
                                                    LINKED
                                                </div>
                                            )}
                                            
                                            {!char.is_owned && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-1 z-20 backdrop-blur-[2px] bg-black/40">
                                                    <Lock size={16} />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="absolute bottom-0 w-full text-center p-2 z-20 bg-black/80 backdrop-blur-md">
                                            <div className={`text-[10px] font-bold truncate ${isSelected ? cMeta.color : 'text-gray-300'}`}>{char.name}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Bar (Sticky Bottom) */}
                    <div className="sticky bottom-0 bg-[#050505] pt-2 pb-4 border-t border-white/5 z-30">
                        {selectedChar && (
                            selectedChar.is_owned ? (
                                <button 
                                    onClick={() => handleEquip(selectedChar)}
                                    disabled={selectedChar.is_active || isEquipping}
                                    className={`w-full py-3.5 rounded-xl font-black shadow-xl flex items-center justify-center gap-3 transition-all border border-white/10 tracking-widest uppercase
                                    ${selectedChar.is_active 
                                        ? 'bg-gray-800/50 text-gray-500 cursor-default' 
                                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.4)] border-cyan-400/50'}`}
                                >
                                    {isEquipping ? <Loader2 className="animate-spin" size={24}/> : (
                                        selectedChar.is_active ? (
                                            <>
                                                <CheckCircle size={22}/> 
                                                <div className="flex flex-col items-start text-left leading-none gap-1">
                                                    <span className="text-sm">SYSTEM LINK ACTIVE</span>
                                                    <span className="text-[9px] opacity-70 font-sans">ချိတ်ဆက်ထားပြီး</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <UserCheck size={22}/> 
                                                <div className="flex flex-col items-start text-left leading-none gap-1">
                                                    <span className="text-sm">INITIATE SYNC</span>
                                                    <span className="text-[9px] opacity-90 font-sans">အသုံးပြုမည်</span>
                                                </div>
                                            </>
                                        )
                                    )}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => router.push('/shop')}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 border border-purple-400/50 tracking-widest uppercase"
                                >
                                    <Sparkles size={22} /> 
                                    <div className="flex flex-col items-start text-left leading-none gap-1">
                                        <span className="text-sm">ACQUIRE IN STAR GATE</span>
                                        <span className="text-[9px] opacity-90 font-sans">စတားဂိတ်တွင် ရယူပါ</span>
                                    </div>
                                </button>
                            )
                        )}
                    </div>

                </div>
            </div>

            <BottomDock 
                activeCharId={user?.active_pet_id} 
                onNavigate={(path) => router.push(`/${path}`)} 
                onOpenBank={() => router.push('/wallet')}
            />
        </div>
    );
}