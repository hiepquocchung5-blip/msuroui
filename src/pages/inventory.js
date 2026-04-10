import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { user as userApi } from '../services/api';
import { 
    ChevronLeft, Heart, Lock, CheckCircle, Sparkles, UserCheck, 
    Star, Coins, Activity, Calendar, MapPin, Cpu, Database, ShieldAlert
} from 'lucide-react';
import CharacterSVG from '../components/visuals/CharacterSVG';
import GlassCard from '../components/ui/GlassCard';
import BottomDock from '../components/layout/BottomDock';
import { useGameSound } from '../hooks/useGameSound';

// --- LOCAL METADATA MAPPING (V10.x Circuit Chaos UI) ---
const getCharMeta = (key) => {
    const meta = {
        luna: { rarity: 'R', color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-900/20', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]', element: 'Moon / 月' },
        mika: { rarity: 'R', color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-900/20', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.5)]', element: 'Water / 水' },
        kira: { rarity: 'SR', color: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-900/20', glow: 'shadow-[0_0_15px_rgba(248,113,113,0.5)]', element: 'Fire / 火' },
        glacia: { rarity: 'SR', color: 'text-sky-300', border: 'border-sky-500/50', bg: 'bg-sky-900/20', glow: 'shadow-[0_0_15px_rgba(125,211,252,0.5)]', element: 'Ice / 氷' },
        bio: { rarity: 'SR', color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-900/20', glow: 'shadow-[0_0_15px_rgba(74,222,128,0.5)]', element: 'Nature / 森' },
        gold: { rarity: 'SR', color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-900/20', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.5)]', element: 'Metal / 金' },
        yami: { rarity: 'SSR', color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-900/20', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.5)]', element: 'Dark / 闇' },
        sky: { rarity: 'SSR', color: 'text-yellow-200', border: 'border-yellow-200/50', bg: 'bg-yellow-900/20', glow: 'shadow-[0_0_15px_rgba(254,240,138,0.5)]', element: 'Light / 光' },
        cyber: { rarity: 'UR', color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-900/20', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.5)]', element: 'Tech / 電' },
        void: { rarity: 'UR', color: 'text-fuchsia-500', border: 'border-fuchsia-500/50', bg: 'bg-fuchsia-900/20', glow: 'shadow-[0_0_15px_rgba(217,70,239,0.5)]', element: 'Void / 無' },
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

    if (loading || !user) {
        return (
            <div className="bg-[#050505] min-h-screen flex flex-col items-center justify-center font-mono">
                <Cpu size={48} className="text-cyan-500 mb-4 animate-pulse drop-shadow-[0_0_15px_cyan]" />
                <h2 className="text-cyan-400 font-black italic tracking-[0.3em] uppercase">LOADING MATRIX</h2>
            </div>
        );
    }

    const meta = selectedChar ? getCharMeta(selectedChar.char_key) : null;

    return (
        <div className="h-[100dvh] bg-[#050505] relative overflow-hidden flex flex-col font-sans selection:bg-pink-500 selection:text-white">
            
            {/* Global Circuit Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/seigaiha.png')] opacity-[0.03] pointer-events-none z-0 mix-blend-screen" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
            <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gray-900/30 via-black to-black pointer-events-none z-0 transition-colors duration-1000 ${meta ? meta.bg.replace('/20', '/10') : ''}`} />

            {/* --- UHD HEADER --- */}
            <div className="px-4 sm:px-6 py-4 relative z-30 flex items-center justify-between backdrop-blur-xl border-b border-white/5 bg-black/60 shadow-md">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:text-pink-400 transition-colors active:scale-95 shadow-inner">
                        <ChevronLeft size={24} strokeWidth={1.5} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 tracking-widest italic flex items-center gap-2 leading-none drop-shadow-md">
                            <Database className="text-pink-500" size={18} /> COMPANIONS
                        </h1>
                        <span className="text-[9px] sm:text-[10px] text-pink-300/80 font-bold tracking-widest uppercase mt-0.5">
                            仲間 <span className="mx-1 opacity-50">|</span> အဖော်များ
                        </span>
                    </div>
                </div>
                <div onClick={() => router.push('/wallet')} className="cursor-pointer bg-black/60 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-yellow-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:border-yellow-400 transition-colors">
                    <Coins size={14} className="text-yellow-400" />
                    <span className="text-yellow-400 font-mono font-black text-xs sm:text-sm tracking-wide">{parseFloat(user.balance).toLocaleString()}</span>
                </div>
            </div>

            {/* --- RESPONSIVE SPLIT ARCHITECTURE --- */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10 pb-[70px]">
                
                {/* 1. HOLOGRAPHIC PROJECTION UI (Left Side - Scrollable on mobile, Fixed on Desktop) */}
                <div className="w-full lg:w-5/12 h-[45vh] lg:h-full relative flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden bg-gradient-to-b from-transparent to-black/80">
                    <AnimatePresence mode="wait">
                        {selectedChar && meta && (
                            <motion.div 
                                key={selectedChar.char_key}
                                initial={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 1.05, filter: "blur(5px)" }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="w-full h-full relative flex flex-col items-center justify-end pb-4 lg:pb-10"
                            >
                                {/* Watermark */}
                                <div className="absolute left-2 lg:left-6 top-6 text-white/5 font-black text-5xl lg:text-7xl tracking-[0.5em] pointer-events-none z-0" style={{ writingMode: 'vertical-rl' }}>
                                    運命の仲間
                                </div>

                                {/* Hologram Pedestal */}
                                <div className={`absolute bottom-0 w-[80%] h-16 bg-gradient-to-t ${meta.bg.replace('bg-', 'from-').replace('/20', '/40')} to-transparent rounded-[100%] blur-2xl pointer-events-none`}></div>
                                <div className={`absolute bottom-4 lg:bottom-8 w-[60%] h-2 border-b-2 ${meta.border} rounded-[100%] ${meta.glow} pointer-events-none`}></div>
                                
                                {/* Scanlines */}
                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none mix-blend-overlay z-20"></div>

                                {/* Character Model */}
                                <div className={`w-full h-[115%] lg:h-[125%] absolute bottom-4 lg:bottom-10 origin-bottom transform scale-110 lg:scale-125 z-10 transition-all duration-700 ${!selectedChar.is_owned ? 'brightness-50 grayscale contrast-125 sepia-[20%] hue-rotate-180' : ''}`}>
                                    <CharacterSVG type={selectedChar.char_key} mood={selectedChar.is_owned ? "idle" : "sad"} />
                                </div>

                                {/* Rarity Tag */}
                                <div className={`absolute top-4 right-4 lg:top-8 lg:right-8 px-4 py-1 border-l-2 border-b-2 rounded-bl-2xl backdrop-blur-xl shadow-lg font-black italic text-2xl lg:text-3xl tracking-tighter z-30 ${meta.border} ${meta.color} bg-black/80`}>
                                    {meta.rarity}
                                </div>

                                {/* Floating Name Plate */}
                                <div className="absolute bottom-0 left-0 w-full p-4 lg:p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-30 flex justify-between items-end">
                                    <div>
                                        <h2 className="text-3xl lg:text-5xl font-black text-white italic uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] leading-none mb-1 lg:mb-2">
                                            {selectedChar.name}
                                        </h2>
                                        <div className="text-[9px] lg:text-[10px] text-gray-400 font-mono tracking-widest uppercase flex items-center gap-2">
                                            <span>ID: 0x{selectedChar.char_key.toUpperCase()}</span>
                                            <span className="text-cyan-500/50">|</span>
                                            <span className="font-sans">アバター</span>
                                        </div>
                                    </div>
                                    {selectedChar.is_premium == 1 && (
                                        <div className="flex flex-col items-end">
                                            <Star className="text-yellow-400 fill-yellow-400 animate-pulse mb-1" size={16} />
                                            <span className="text-[7px] lg:text-[8px] text-yellow-400 font-bold tracking-widest border border-yellow-500/50 bg-yellow-900/50 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(234,179,8,0.3)]">PREMIUM</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. DATA TELEMETRY & ROSTER GRID (Right Side - Scrollable) */}
                <div className="w-full lg:w-7/12 flex flex-col h-full overflow-y-auto hide-scrollbar bg-[#050505] lg:bg-transparent relative">
                    
                    <div className="p-4 lg:p-6 flex flex-col gap-4 lg:gap-6 min-h-full">
                        {/* Active Character Dossier */}
                        {selectedChar && meta && (
                            <GlassCard className={`p-4 lg:p-5 border ${meta.border} bg-black/60 shadow-lg relative overflow-hidden flex-shrink-0`}>
                                <div className="absolute -bottom-6 -right-4 text-[100px] lg:text-[140px] font-black text-white/5 pointer-events-none z-0 leading-none">絆</div>
                                
                                <h3 className="text-[10px] lg:text-xs font-black text-white tracking-widest uppercase mb-3 lg:mb-4 border-b border-white/10 pb-2 lg:pb-3 flex items-center gap-2 relative z-10">
                                    <Cpu size={14} className={meta.color}/> 
                                    <div className="flex flex-col">
                                        <span>ENTITY TELEMETRY</span>
                                        <span className="text-[7px] lg:text-[8px] text-gray-500">ဇာတ်ကောင် အချက်အလက်</span>
                                    </div>
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-2 lg:gap-3 font-mono relative z-10">
                                    <div className="bg-[#0a0c10] p-2.5 lg:p-3 rounded-xl border border-white/5 shadow-inner">
                                        <div className="text-[8px] lg:text-[9px] text-gray-500 uppercase font-bold mb-1 flex items-center justify-between">
                                            <span className="flex items-center gap-1"><MapPin size={10}/> Sector</span>
                                            <span className="text-[7px] font-sans text-gray-600 hidden sm:inline">မူလနေရာ</span>
                                        </div>
                                        <div className="text-xs lg:text-sm font-black text-white">Island #{selectedChar.island_id}</div>
                                    </div>
                                    <div className="bg-[#0a0c10] p-2.5 lg:p-3 rounded-xl border border-white/5 shadow-inner">
                                        <div className="text-[8px] lg:text-[9px] text-gray-500 uppercase font-bold mb-1 flex items-center justify-between">
                                            <span className="flex items-center gap-1"><Activity size={10}/> Element</span>
                                            <span className="text-[7px] font-sans text-gray-600 hidden sm:inline">စွမ်းအင်</span>
                                        </div>
                                        <div className={`text-xs lg:text-sm font-black ${meta.color}`}>{meta.element}</div>
                                    </div>
                                    <div className="bg-[#0a0c10] p-2.5 lg:p-3 rounded-xl border border-white/5 shadow-inner">
                                        <div className="text-[8px] lg:text-[9px] text-gray-500 uppercase font-bold mb-1 flex items-center justify-between">
                                            <span className="flex items-center gap-1"><Calendar size={10}/> Acquired</span>
                                            <span className="text-[7px] font-sans text-gray-600 hidden sm:inline">ရရှိသောနေ့</span>
                                        </div>
                                        <div className={`text-[10px] lg:text-xs font-black truncate ${selectedChar.is_owned ? 'text-green-400' : 'text-red-500'}`}>
                                            {selectedChar.is_owned ? (selectedChar.obtained_at ? new Date(selectedChar.obtained_at).toLocaleDateString() : 'DEFAULT') : 'LOCKED'}
                                        </div>
                                    </div>
                                    <div className="bg-[#0a0c10] p-2.5 lg:p-3 rounded-xl border border-white/5 shadow-inner">
                                        <div className="text-[8px] lg:text-[9px] text-gray-500 uppercase font-bold mb-1 flex items-center justify-between">
                                            <span className="flex items-center gap-1"><Heart size={10}/> Bond</span>
                                            <span className="text-[7px] font-sans text-gray-600 hidden sm:inline">သံယောဇဉ်</span>
                                        </div>
                                        <div className="text-xs lg:text-sm font-black text-pink-400">{selectedChar.is_owned ? `${selectedChar.affection}%` : '---'}</div>
                                        {selectedChar.is_owned && (
                                            <div className="w-full h-1 lg:h-1.5 bg-gray-900 rounded-full mt-1.5 overflow-hidden">
                                                <div className="h-full bg-pink-500 shadow-[0_0_5px_pink]" style={{width: `${selectedChar.affection}%`}}></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        )}

                        {/* Roster Grid (Data Shards) */}
                        <div className="flex-1 bg-[#0a0c10]/80 border border-white/5 rounded-2xl p-3 lg:p-5 shadow-[inset_0_5px_20px_rgba(0,0,0,0.5)] relative">
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 relative z-10 pb-20">
                                {isLoading ? (
                                    <div className="col-span-full text-center text-cyan-500 py-10 font-mono text-xs animate-pulse">Syncing Database... / ဒေတာချိတ်ဆက်နေသည်...</div>
                                ) : roster.map(char => {
                                    const cMeta = getCharMeta(char.char_key);
                                    const isSelected = selectedChar?.char_key === char.char_key;
                                    
                                    return (
                                        <motion.div 
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            key={char.char_key}
                                            onClick={() => setSelectedChar(char)}
                                            className={`relative cursor-pointer transition-all duration-300 group overflow-hidden rounded-xl bg-black border-[1.5px]
                                                ${isSelected ? `${cMeta.border} shadow-[0_0_15px_rgba(255,255,255,0.1)] z-10 bg-gradient-to-b from-[#111] to-black` : 'border-white/10 hover:border-white/30'}
                                                ${!char.is_owned ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : ''}
                                            `}
                                        >
                                            {/* Inner Bezel for Hardware Look */}
                                            <div className="absolute inset-1 border border-white/5 rounded-lg pointer-events-none z-20"></div>

                                            <div className={`absolute top-0 right-0 w-6 h-6 lg:w-7 lg:h-7 rounded-bl-lg flex items-center justify-center text-[8px] lg:text-[9px] font-black z-30 ${cMeta.bg} ${cMeta.color} ${cMeta.border} border-l border-b backdrop-blur-md`}>
                                                {cMeta.rarity}
                                            </div>

                                            <div className="aspect-[3/4] overflow-hidden relative">
                                                <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 ${isSelected ? 'opacity-60' : 'opacity-90'}`}></div>
                                                <div className="absolute inset-0 scale-150 translate-y-3">
                                                    <CharacterSVG type={char.char_key} stickerMode={true} />
                                                </div>
                                                
                                                {char.is_active && (
                                                    <div className="absolute top-1 left-1 bg-green-500 text-black text-[7px] lg:text-[8px] font-black px-1.5 py-0.5 rounded shadow-[0_0_10px_lime] z-30 flex items-center gap-0.5">
                                                        <div className="w-1 h-1 bg-white rounded-full animate-ping"></div> LINKED
                                                    </div>
                                                )}
                                                
                                                {!char.is_owned && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 gap-1 z-20 backdrop-blur-[2px] bg-black/60">
                                                        <ShieldAlert size={16} className="opacity-80" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className={`absolute bottom-0 w-full text-center p-1.5 lg:p-2 z-20 bg-black/90 backdrop-blur-md border-t ${isSelected ? cMeta.border : 'border-white/5'}`}>
                                                <div className={`text-[8px] lg:text-[9px] font-black tracking-widest uppercase truncate ${isSelected ? cMeta.color : 'text-gray-400'}`}>{char.name}</div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Action Bar (Sticky within the Right Pane) */}
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#050505] via-[#050505] to-transparent p-4 pt-12 z-30 border-t border-white/5">
                                {selectedChar && (
                                    selectedChar.is_owned ? (
                                        <button 
                                            onClick={() => handleEquip(selectedChar)}
                                            disabled={selectedChar.is_active || isEquipping}
                                            className={`w-full py-3.5 sm:py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all border tracking-widest uppercase outline-none
                                            ${selectedChar.is_active 
                                                ? 'bg-gray-900 border-gray-700 text-gray-500 cursor-default' 
                                                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:brightness-110 active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.4)] border-cyan-400/50'}`}
                                        >
                                            {isEquipping ? <Loader2 className="animate-spin" size={20}/> : (
                                                selectedChar.is_active ? (
                                                    <>
                                                        <CheckCircle size={18} className="sm:w-5 sm:h-5"/> 
                                                        <div className="flex flex-col items-start text-left leading-none gap-1">
                                                            <span className="text-xs sm:text-sm">SYSTEM LINK ACTIVE</span>
                                                            <span className="text-[8px] sm:text-[9px] opacity-70 font-sans">ချိတ်ဆက်ထားပြီး</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserCheck size={18} className="sm:w-5 sm:h-5"/> 
                                                        <div className="flex flex-col items-start text-left leading-none gap-1">
                                                            <span className="text-xs sm:text-sm">INITIATE SYNC</span>
                                                            <span className="text-[8px] sm:text-[9px] opacity-90 font-sans">အသုံးပြုမည်</span>
                                                        </div>
                                                    </>
                                                )
                                            )}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => router.push('/shop')}
                                            className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400/50 tracking-widest uppercase outline-none"
                                        >
                                            <Sparkles size={18} className="sm:w-5 sm:h-5" /> 
                                            <div className="flex flex-col items-start text-left leading-none gap-1">
                                                <span className="text-xs sm:text-sm">ACQUIRE IN STAR GATE</span>
                                                <span className="text-[8px] sm:text-[9px] opacity-90 font-sans">စတားဂိတ်တွင် ရယူပါ</span>
                                            </div>
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className="relative z-50">
                <BottomDock 
                    activeCharId={user?.active_pet_id} 
                    onNavigate={(path) => router.push(`/${path}`)} 
                />
            </div>
        </div>
    );
}