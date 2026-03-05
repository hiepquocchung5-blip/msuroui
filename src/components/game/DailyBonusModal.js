import React, { useEffect, useState } from 'react';
import { X, Check, Loader2, Calendar } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import api from '../../services/api'; 
import { useAuth } from '../../context/AuthContext';

const DailyBonusModal = ({ onClose }) => {
    const { updateBalance, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [data, setData] = useState(null);

    // Fetch Status on Mount
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await api.get('/game/daily_bonus.php');
                if (res.data.status === 'success') {
                    setData(res.data);
                }
            } catch (e) {
                console.error("Bonus Check Failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    const handleClaim = async () => {
        setClaiming(true);
        try {
            const res = await api.post('/game/daily_bonus.php');
            if (res.data.status === 'success') {
                updateBalance(res.data.new_balance);
                setData(prev => ({ ...prev, can_claim: false }));
                
                // STRICT 24-HOUR TIMESTAMP LOCK
                const now = new Date().getTime();
                localStorage.setItem(`daily_claim_time_${user?.id || 'sys'}`, now.toString());
            }
        } catch (e) {
            alert(e.response?.data?.error || "Claim failed");
        } finally {
            setClaiming(false);
        }
    };

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm animate-in zoom-in-95 duration-300">
            <GlassCard className="w-full max-w-md p-0 overflow-hidden border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>
                    <div className="flex items-center gap-2 relative z-10">
                        <Calendar className="text-white" size={24} />
                        <h2 className="text-xl md:text-2xl font-black text-white italic tracking-tighter">DAILY REWARDS</h2>
                    </div>
                    <button onClick={onClose} className="relative z-10 text-white/80 hover:text-white"><X size={24} /></button>
                </div>

                {/* Calendar Grid */}
                <div className="p-4 sm:p-6 bg-black/80">
                    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
                        {[1, 2, 3, 4, 5, 6, 7].map(day => {
                            const isToday = data?.streak_day === day;
                            const isPast = day < data?.streak_day;
                            const isBigPrize = day === 7;
                            
                            let bgClass = 'bg-white/5 border-white/10 text-gray-500';
                            if (isPast) bgClass = 'bg-green-900/30 border-green-500/50 text-green-500'; 
                            if (isToday) bgClass = data?.can_claim 
                                ? 'bg-yellow-500 text-black border-yellow-400 animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                                : 'bg-green-600 text-white border-green-500'; 

                            return (
                                <div 
                                    key={day} 
                                    className={`relative rounded-xl flex flex-col items-center justify-center p-2 border aspect-square ${bgClass} ${isBigPrize ? 'col-span-2 aspect-auto flex-row gap-4' : ''}`}
                                >
                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase">{isBigPrize ? 'BIG REWARD' : `DAY ${day}`}</span>
                                    <div className="text-xs sm:text-sm font-black">
                                        {isBigPrize ? '50,000' : (data?.rewards_table[day] / 1000) + 'k'}
                                    </div>
                                    
                                    {(isPast || (isToday && !data?.can_claim)) && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                                            <Check className="text-green-400 drop-shadow-md" size={isBigPrize ? 28 : 20} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Button */}
                    <button 
                        onClick={handleClaim}
                        disabled={!data?.can_claim || claiming}
                        className={`w-full py-3 sm:py-4 rounded-xl font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all
                        ${data?.can_claim 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-[1.02] active:scale-95 shadow-green-500/20' 
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    >
                        {claiming ? <Loader2 className="animate-spin" size={20} /> : (data?.can_claim ? 'CLAIM REWARD' : 'COME BACK TOMORROW')}
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

export default DailyBonusModal;