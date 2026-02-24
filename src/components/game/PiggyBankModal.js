import React, { useState, useEffect } from 'react';
import { X, Hammer, Lock, Coins, Loader2 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useGameSound } from '../../hooks/useGameSound';

const PiggySVG = ({ isBroken }) => (
    <svg viewBox="0 0 200 200" className={`w-48 h-48 drop-shadow-2xl transition-all duration-300 ${isBroken ? 'scale-110 opacity-0' : 'animate-bounce-slow'}`}>
        <defs>
            <radialGradient id="pigGold" cx="0.4" cy="0.4" r="0.7"><stop offset="0%" stopColor="#FFD700"/><stop offset="100%" stopColor="#B8860B"/></radialGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Body */}
        <ellipse cx="100" cy="110" rx="70" ry="60" fill="url(#pigGold)" />
        {/* Legs */}
        <ellipse cx="60" cy="160" rx="10" ry="15" fill="#B8860B" />
        <ellipse cx="140" cy="160" rx="10" ry="15" fill="#B8860B" />
        {/* Ears */}
        <path d="M40,70 L30,40 L60,50 Z" fill="#DAA520" />
        <path d="M160,70 L170,40 L140,50 Z" fill="#DAA520" />
        {/* Snout */}
        <ellipse cx="100" cy="115" rx="20" ry="15" fill="#FFC125" />
        <circle cx="92" cy="115" r="3" fill="#552200" />
        <circle cx="108" cy="115" r="3" fill="#552200" />
        {/* Eyes */}
        <circle cx="70" cy="90" r="5" fill="black" />
        <circle cx="130" cy="90" r="5" fill="black" />
        {/* Coin Slot */}
        <rect x="85" y="55" width="30" height="5" rx="2" fill="#331100" />
    </svg>
);

const PiggyBankModal = ({ onClose }) => {
    const { updateBalance } = useAuth();
    const { playSound } = useGameSound();
    
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [smashing, setSmashing] = useState(false);
    const [isBroken, setIsBroken] = useState(false);

    useEffect(() => {
        const fetchVault = async () => {
            try {
                const res = await api.get('/game/vault.php');
                if (res.data.status === 'success') {
                    setStatus(res.data);
                }
            } catch (e) {
                console.error("Vault Error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchVault();
    }, []);

    const handleSmash = async () => {
        if (!status.is_open || status.balance <= 0) return;
        setSmashing(true);
        playSound('click');

        // Animation Sequence
        setTimeout(async () => {
            playSound('break'); // You'd need a break sound or reuse 'bigwin'
            setIsBroken(true);
            
            try {
                const res = await api.post('/game/vault.php');
                if (res.data.status === 'success') {
                    setTimeout(() => {
                        updateBalance(res.data.new_wallet_balance);
                        onClose();
                        alert(`You collected ${res.data.claimed_amount.toLocaleString()} MMK!`);
                    }, 800);
                }
            } catch (e) {
                alert("Failed to smash!");
                setIsBroken(false);
            } finally {
                setSmashing(false);
            }
        }, 500); // Swing delay
    };

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-6 backdrop-blur-sm animate-in zoom-in-95">
            <GlassCard className="w-full max-w-sm p-0 overflow-hidden border-yellow-500/50 shadow-[0_0_80px_rgba(255,215,0,0.15)]">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-700 to-yellow-900 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white">
                        <Coins className="text-yellow-200"/>
                        <h2 className="text-xl font-black italic">GOLDEN VAULT</h2>
                    </div>
                    <button onClick={onClose}><X size={24} className="text-white/70 hover:text-white"/></button>
                </div>

                <div className="p-8 flex flex-col items-center text-center bg-black/80 relative">
                    {/* Glow Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 blur-[60px] rounded-full pointer-events-none"></div>

                    <div className="relative mb-6">
                        <PiggySVG isBroken={isBroken} />
                        
                        {/* Hammer Animation Overlay */}
                        {smashing && !isBroken && (
                            <div className="absolute -top-10 -right-10 animate-[ping_0.5s_ease-in-out]">
                                <Hammer size={64} className="text-white fill-gray-400 rotate-45" />
                            </div>
                        )}

                        {/* Balance Display */}
                        {!isBroken && (
                            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-900 font-black text-xl drop-shadow-sm">
                                {status.balance > 0 ? `${status.balance.toLocaleString()}` : 'EMPTY'}
                            </div>
                        )}
                        
                        {/* Broken Coins FX */}
                        {isBroken && (
                            <div className="absolute inset-0 flex items-center justify-center animate-out zoom-out duration-500">
                                <Coins size={64} className="text-yellow-400 animate-bounce" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 mb-6 w-full">
                        <div className="flex justify-between text-xs text-gray-400 border-b border-white/10 pb-2">
                            <span>TOTAL SAVED</span>
                            <span className="text-white font-mono">{status.total_saved.toLocaleString()} MMK</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 border-b border-white/10 pb-2">
                            <span>STATUS</span>
                            <span className={status.is_open ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                                {status.is_open ? "UNLOCKED" : "LOCKED"}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={handleSmash}
                        disabled={!status.is_open || status.balance <= 0 || smashing}
                        className={`w-full py-4 rounded-xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all
                        ${status.is_open && status.balance > 0
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:scale-105 active:scale-95 shadow-yellow-500/20' 
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    >
                        {smashing ? <Loader2 className="animate-spin"/> : (
                            status.is_open ? <><Hammer size={18} /> SMASH & CLAIM</> : <><Lock size={18} /> OPENS ON WEEKENDS</>
                        )}
                    </button>
                    
                    {!status.is_open && (
                        <p className="text-[10px] text-gray-600 mt-3 animate-pulse">
                            Come back on {status.open_days} to break the bank!
                        </p>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default PiggyBankModal;