import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { user as userApi } from '../services/api'; 
import { ChevronLeft, Copy, Users, Gift, CheckCircle, Share2, Coins } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import BottomDock from '../components/layout/BottomDock';

export default function InvitePage() {
    const { user, loading, updateBalance } = useAuth();
    const router = useRouter();
    const [claimCode, setClaimCode] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);
    const [msg, setMsg] = useState(null);

    const handleCopy = () => {
        if (user?.referral_code) {
            navigator.clipboard.writeText(user.referral_code);
            alert("Code Copied!");
        }
    };

    const handleClaim = async () => {
        if (!claimCode) return;
        setIsClaiming(true);
        setMsg(null);
        try {
            // Call API
            const res = await userApi.claimReferral(claimCode);
            if (res.data.status === 'success') {
                setMsg({ type: 'success', text: res.data.message });
                updateBalance(res.data.new_balance);
                setClaimCode('');
            }
        } catch (e) {
            setMsg({ type: 'error', text: e.response?.data?.error || "Invalid Code" });
        } finally {
            setIsClaiming(false);
        }
    };

    if (loading) return <div className="bg-black min-h-screen"/>;

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-black pointer-events-none" />

            {/* Header */}
            <div className="p-6 pt-8 relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-white hover:text-cyan-400 transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-wider">INVITE</h1>
                </div>
            </div>

            <div className="px-6 space-y-6 relative z-10">
                
                {/* Hero Card */}
                <GlassCard className="p-6 bg-gradient-to-r from-green-900/40 to-cyan-900/40 border-green-500/30">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-black italic text-white">EARN CASH</h2>
                            <p className="text-xs text-green-400 font-bold">GET 2,000 MMK PER FRIEND</p>
                        </div>
                        <Gift className="text-green-400 w-10 h-10 animate-bounce" />
                    </div>
                    <div className="text-[10px] text-gray-300 leading-relaxed">
                        Share your unique code. When friends join and verify, you both get paid instantly.
                    </div>
                </GlassCard>

                {/* My Code Section */}
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Your Referral Code</label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-black/60 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                            <span className="font-mono text-xl font-bold text-white tracking-widest">
                                {user?.referral_code || 'LOADING...'}
                            </span>
                            <button onClick={handleCopy} className="text-gray-400 hover:text-white">
                                <Copy size={18} />
                            </button>
                        </div>
                        <button onClick={handleCopy} className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-4 flex items-center justify-center">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Claim Section */}
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Enter Friend's Code</label>
                    <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                        <div className="flex gap-2 mb-2">
                            <input 
                                type="text" 
                                placeholder="e.g. AB123XY"
                                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-green-500 outline-none font-mono uppercase"
                                value={claimCode}
                                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                            />
                            <button 
                                onClick={handleClaim}
                                disabled={isClaiming || !claimCode}
                                className="bg-white text-black font-bold rounded-lg px-4 text-xs hover:bg-gray-200 disabled:opacity-50"
                            >
                                {isClaiming ? '...' : 'CLAIM'}
                            </button>
                        </div>
                        {msg && (
                            <div className={`text-[10px] flex items-center gap-1 ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {msg.type === 'success' ? <CheckCircle size={10}/> : null} {msg.text}
                            </div>
                        )}
                        <p className="text-[10px] text-gray-500 mt-2">
                            * You can only claim one code. Valid for new accounts under 7 days.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <GlassCard className="p-4 flex flex-col items-center gap-1">
                        <Users className="text-cyan-400 w-5 h-5" />
                        <div className="text-2xl font-black text-white">0</div>
                        <div className="text-[9px] text-gray-400 uppercase font-bold">Friends Invited</div>
                    </GlassCard>
                    <GlassCard className="p-4 flex flex-col items-center gap-1">
                        <Coins className="text-yellow-400 w-5 h-5" />
                        <div className="text-2xl font-black text-white">0</div>
                        <div className="text-[9px] text-gray-400 uppercase font-bold">Total Earned</div>
                    </GlassCard>
                </div>

            </div>

            <BottomDock activeCharId={user?.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} />
        </div>
    );
}