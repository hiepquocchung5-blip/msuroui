import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ChevronLeft, Users, Copy, Gift, TrendingUp, Loader2, ArrowRight } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import BottomDock from '../components/layout/BottomDock';

export default function ReferralPage() {
    const { user, loading, updateBalance } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();

    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchStats = async () => {
            try {
                const res = await api.get('/user/referral_stats.php');
                if (res.data.status === 'success') {
                    setStats(res.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    const handleCopy = () => {
        if (stats?.referral_code) {
            navigator.clipboard.writeText(stats.referral_code);
            addToast('Referral code copied!', 'success');
        }
    };

    const handleClaim = async () => {
        if (!stats || stats.current_commission < 1000) {
            addToast('Minimum claim is 1,000 MMK', 'error');
            return;
        }

        if(!confirm(`Transfer ${stats.current_commission.toLocaleString()} MMK to your main balance?`)) return;

        setIsClaiming(true);
        try {
            const res = await api.post('/user/claim_commission.php');
            if (res.data.status === 'success') {
                addToast(res.data.message, 'success');
                updateBalance(res.data.new_balance);
                setStats(prev => ({ ...prev, current_commission: 0 }));
            }
        } catch (e) {
            addToast(e.response?.data?.error || 'Claim failed', 'error');
        } finally {
            setIsClaiming(false);
        }
    };

    if (loading) return <div className="bg-black min-h-screen"/>;
    if (!user) { router.push('/'); return null; }

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black pointer-events-none" />

            {/* Header */}
            <div className="p-6 pt-8 relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-white hover:text-cyan-400 transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-black text-white tracking-widest italic flex items-center gap-2">
                        <Users className="text-purple-500"/> REFERRALS
                    </h1>
                </div>
            </div>

            <div className="px-6 space-y-6 relative z-10">
                {isLoading ? (
                    <div className="text-center text-gray-500 py-10"><Loader2 className="animate-spin mx-auto"/> Loading...</div>
                ) : (
                    <>
                        {/* Invite Card */}
                        <GlassCard className="p-6 border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-black">
                            <div className="text-center mb-4">
                                <h3 className="text-white font-bold mb-1">YOUR INVITE CODE</h3>
                                <p className="text-gray-400 text-xs">Share this code. Friends get <span className="text-yellow-400 font-bold">500 MMK</span> bonus!</p>
                            </div>
                            
                            <div className="bg-black/50 border border-dashed border-purple-500/50 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-purple-900/10 transition-colors" onClick={handleCopy}>
                                <span className="font-mono text-2xl font-black text-white tracking-widest">{stats.referral_code}</span>
                                <Copy className="text-purple-400" size={20}/>
                            </div>
                        </GlassCard>

                        {/* Commission Wallet */}
                        <GlassCard className="p-5 border-green-500/30">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-xs text-gray-500 font-bold uppercase mb-1">Commission Balance</div>
                                    <div className="text-3xl font-mono font-black text-green-400">{stats.current_commission.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Lifetime Earned</div>
                                    <div className="text-sm font-mono text-white">{stats.lifetime_commission.toLocaleString()}</div>
                                </div>
                            </div>

                            <button 
                                onClick={handleClaim} 
                                disabled={isClaiming || stats.current_commission < 1000}
                                className={`w-full py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all 
                                ${stats.current_commission >= 1000 ? 'bg-green-500 hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                            >
                                {isClaiming ? <Loader2 className="animate-spin" size={18}/> : <><Gift size={18}/> CLAIM REWARD</>}
                            </button>
                            <div className="text-[9px] text-gray-600 text-center mt-2">Min. claim 1,000 MMK</div>
                        </GlassCard>

                        {/* Friends List */}
                        <div>
                            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                                <TrendingUp size={16} className="text-cyan-400"/> YOUR TEAM ({stats.total_invites})
                            </h3>
                            <div className="space-y-2">
                                {stats.recent_referrals.length === 0 ? (
                                    <div className="text-center text-gray-600 text-xs py-4">No invites yet. Start sharing!</div>
                                ) : (
                                    stats.recent_referrals.map((ref, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-xl flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-white border border-white/20">
                                                    {ref.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white">{ref.username}</div>
                                                    <div className="text-[9px] text-gray-500">{new Date(ref.created_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-500">Deposited</div>
                                                <div className="text-xs font-mono text-cyan-400">{parseFloat(ref.total_deposited || 0).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <BottomDock activeCharId={user.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} />
        </div>
    );
}