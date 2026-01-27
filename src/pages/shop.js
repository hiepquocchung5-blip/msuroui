import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ChevronLeft, Gem, Sparkles, Zap, Coins, Loader2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import CharacterSVG from '../components/visuals/CharacterSVG';
import BottomDock from '../components/layout/BottomDock';

export default function ShopPage() {
    const { user, updateBalance } = useAuth();
    const router = useRouter();
    
    const [isSummoning, setIsSummoning] = useState(false);
    const [result, setResult] = useState(null); // { character, rarity, is_new }
    const [animStage, setAnimStage] = useState('idle'); // idle, charging, flash, reveal

    const handleSummon = async (type) => {
        const cost = type === 'premium' ? 5000 : 1000;
        if (user.balance < cost) {
            alert("Insufficient Funds");
            return;
        }

        setIsSummoning(true);
        setAnimStage('charging');

        try {
            // API Call
            const res = await api.post('/shop/gacha.php', { type });
            
            // Animation Delay
            setTimeout(() => {
                setAnimStage('flash');
                setTimeout(() => {
                    if (res.data.status === 'success') {
                        setResult(res.data);
                        updateBalance(res.data.new_balance);
                        setAnimStage('reveal');
                    }
                    setIsSummoning(false);
                }, 500); // Flash duration
            }, 2000); // Charge duration

        } catch (e) {
            alert("Summon Failed");
            setIsSummoning(false);
            setAnimStage('idle');
        }
    };

    const closeResult = () => {
        setResult(null);
        setAnimStage('idle');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black pointer-events-none" />

            {/* Header */}
            <div className="p-6 pt-8 relative z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-white hover:text-cyan-400"><ChevronLeft size={28}/></button>
                    <h1 className="text-xl font-black text-white tracking-widest italic flex items-center gap-2">
                        <Gem className="text-purple-400"/> STAR GATE
                    </h1>
                </div>
                <div className="bg-black/50 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                    <Coins size={14} className="text-yellow-400"/>
                    <span className="text-sm font-mono font-bold text-white">{parseFloat(user.balance).toLocaleString()}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 relative z-10 flex flex-col items-center gap-6 mt-4">
                
                {/* Banner */}
                <GlassCard className="w-full h-40 bg-gradient-to-r from-purple-900 to-blue-900 border-purple-500/30 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>
                    <div className="text-center z-10">
                        <h2 className="text-2xl font-black text-white italic drop-shadow-lg">UNIT V-77</h2>
                        <p className="text-xs text-cyan-300 font-bold tracking-widest">RATE UP EVENT</p>
                    </div>
                    {/* Floating Char */}
                    <div className="absolute -right-10 bottom-[-20px] w-32 h-32 opacity-80">
                         <CharacterSVG type="cyber" mood="win" />
                    </div>
                </GlassCard>

                {/* Summon Buttons */}
                <div className="w-full grid grid-cols-2 gap-4">
                    {/* Standard */}
                    <button 
                        onClick={() => handleSummon('standard')} 
                        disabled={isSummoning}
                        className="bg-gray-900 border border-gray-700 hover:border-gray-500 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center shadow-inner">
                            <Sparkles className="text-gray-400" />
                        </div>
                        <div className="text-center">
                            <div className="text-white font-bold text-sm">STANDARD</div>
                            <div className="text-yellow-400 font-mono text-xs">1,000 MMK</div>
                        </div>
                    </button>

                    {/* Premium */}
                    <button 
                        onClick={() => handleSummon('premium')} 
                        disabled={isSummoning}
                        className="bg-gradient-to-b from-purple-900 to-black border border-purple-500 hover:border-purple-300 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.2)] disabled:opacity-50"
                    >
                        <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center shadow-inner border border-purple-500/50">
                            <Zap className="text-purple-400 fill-current animate-pulse" />
                        </div>
                        <div className="text-center">
                            <div className="text-white font-bold text-sm">PREMIUM</div>
                            <div className="text-yellow-400 font-mono text-xs">5,000 MMK</div>
                        </div>
                    </button>
                </div>

                <div className="text-center text-xs text-gray-500">
                    <p>Standard: 1% UR | 9% SSR | 30% SR</p>
                    <p>Premium: 5% UR | 25% SSR | 60% SR</p>
                </div>

            </div>

            {/* --- SUMMONING ANIMATION OVERLAY --- */}
            {animStage !== 'idle' && (
                <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                    
                    {/* Stage 1: Charging */}
                    {animStage === 'charging' && (
                        <div className="relative">
                            <div className="w-48 h-48 rounded-full border-4 border-white/20 animate-spin-slow"></div>
                            <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 animate-pulse"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <Loader2 className="w-12 h-12 text-white animate-spin" />
                            </div>
                            <div className="absolute -bottom-12 w-full text-center text-cyan-400 font-mono tracking-widest text-xs animate-pulse">
                                CONNECTING TO VOID...
                            </div>
                        </div>
                    )}

                    {/* Stage 2: Flash */}
                    {animStage === 'flash' && (
                        <div className="absolute inset-0 bg-white animate-out fade-out duration-500"></div>
                    )}

                    {/* Stage 3: Reveal */}
                    {animStage === 'reveal' && result && (
                        <div className="flex flex-col items-center animate-in zoom-in duration-500">
                            {/* Rarity Effect */}
                            <div className={`absolute inset-0 blur-3xl opacity-40 z-0 ${result.rarity === 'UR' ? 'bg-purple-600' : (result.rarity === 'SSR' ? 'bg-yellow-500' : 'bg-blue-500')}`}></div>
                            
                            <div className="relative z-10 scale-150 mb-8">
                                <CharacterSVG type={result.character.char_key} mood="win" />
                            </div>

                            <div className="relative z-10 text-center">
                                <div className={`text-4xl font-black italic tracking-widest mb-2 ${result.rarity === 'UR' ? 'text-purple-400 drop-shadow-[0_0_10px_purple]' : (result.rarity === 'SSR' ? 'text-yellow-400 drop-shadow-[0_0_10px_gold]' : 'text-white')}`}>
                                    {result.rarity}
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4">{result.character.name}</h2>
                                <div className="text-sm bg-black/50 px-4 py-2 rounded-lg text-gray-300 border border-white/10 mb-6">
                                    {result.message}
                                </div>
                                <button onClick={closeResult} className="bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
                                    CONTINUE
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <BottomDock activeCharId={user.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} />
        </div>
    );
}