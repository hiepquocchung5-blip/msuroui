import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { user as userApi } from '../services/api';
import { ChevronLeft, LogOut, Trophy, Wallet, Shield, Star, Crown, Copy, Check, Clock, ChevronRight, History as HistoryIcon } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import CharacterSVG from '../components/visuals/CharacterSVG';
import BottomDock from '../components/layout/BottomDock';

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  // Fetch Recent Activity for "Show More" preview
  useEffect(() => {
    const fetchPreview = async () => {
        if (!user) return;
        try {
            const res = await userApi.getHistory();
            if (res.data.status === 'success') {
                setRecentHistory(res.data.data.slice(0, 3)); // Only show top 3
            }
        } catch (e) {
            console.error("Failed to load history preview");
        } finally {
            setLoadingHistory(false);
        }
    };
    fetchPreview();
  }, [user]);

  const handleCopy = () => {
      if (user?.referral_code) {
          navigator.clipboard.writeText(user.referral_code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

  if (loading || !user) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Loading Profile...</div>;

  const ownedCount = user.owned_islands ? user.owned_islands.length : 0;

  return (
    <div className="min-h-screen bg-black pb-24 relative overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />
        
        {/* Header */}
        <div className="p-6 pt-8 flex justify-between items-center relative z-10 bg-gradient-to-b from-black/80 to-transparent">
            <h1 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">PROFILE</h1>
            <div className="flex gap-2">
                <button onClick={() => router.push('/settings')} className="bg-white/10 p-2 rounded-full hover:bg-white/20 text-white transition-colors">
                   <Shield size={20} />
                </button>
                <button onClick={logout} className="bg-white/10 p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors">
                    <LogOut size={20} />
                </button>
            </div>
        </div>

        <div className="px-6 space-y-6 relative z-10">
            
            {/* Identity Card */}
            <GlassCard className="p-6 flex items-center gap-6 bg-gradient-to-r from-gray-900 to-gray-800 border-purple-500/30 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>
                
                <div className="w-24 h-24 rounded-full border-4 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)] overflow-hidden bg-black flex-shrink-0 relative z-10">
                    <div className="w-full h-full transform scale-125 pt-2">
                        <CharacterSVG type={user.active_pet_id || 'luna'} mood="idle" />
                    </div>
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-1 truncate">{user.username}</h2>
                    <div className="text-xs text-gray-400 font-mono mb-2">{user.phone}</div>
                    <div className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold border border-yellow-500/30">
                        <Crown size={12} /> VIP LEVEL {user.level}
                    </div>
                </div>
            </GlassCard>

            {/* Level Progress */}
            <GlassCard className="p-5">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-gray-400 font-bold">XP PROGRESS</span>
                    <span className="text-xs text-cyan-400 font-mono">{user.xp.toLocaleString()} / {user.next_level_xp.toLocaleString()}</span>
                </div>
                <div className="w-full h-3 bg-black rounded-full overflow-hidden border border-white/10 mb-2">
                    <div 
                        className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${user.progress_percent || 0}%` }}
                    />
                </div>
                <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase">
                     <span>Current Rank</span>
                     <span>Next Reward: {((user.level + 1) * 1000).toLocaleString()} MMK</span>
                </div>
            </GlassCard>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-4 flex flex-col items-center justify-center gap-2">
                    <Wallet className="text-green-400" />
                    <div className="text-xs text-gray-400 uppercase font-bold">Balance</div>
                    <div className="text-lg font-mono font-black text-white truncate w-full text-center">
                        {parseFloat(user.balance).toLocaleString()}
                    </div>
                </GlassCard>
                
                <GlassCard className="p-4 flex flex-col items-center justify-center gap-2" onClick={() => router.push('/rank')}>
                    <Trophy className="text-yellow-400" />
                    <div className="text-xs text-gray-400 uppercase font-bold">Tournaments</div>
                    <div className="text-lg font-mono font-black text-white">0 WINS</div>
                </GlassCard>

                <GlassCard className="p-4 flex flex-col items-center justify-center gap-2">
                    <Star className="text-purple-400" />
                    <div className="text-xs text-gray-400 uppercase font-bold">Islands</div>
                    <div className="text-xl font-mono font-black text-white">{ownedCount} / 10</div>
                </GlassCard>

                <GlassCard className="p-4 flex flex-col items-center justify-center gap-2">
                    <Shield className="text-blue-400" />
                    <div className="text-xs text-gray-400 uppercase font-bold">User ID</div>
                    <div className="text-xl font-mono font-black text-white">#{user.id}</div>
                </GlassCard>
            </div>

            {/* Recent Activity (Show More) */}
            <GlassCard className="p-0 overflow-hidden">
                 <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                     <h3 className="text-sm font-bold text-white flex items-center gap-2">
                         <HistoryIcon size={16} className="text-cyan-400"/> RECENT ACTIVITY
                     </h3>
                     <button onClick={() => router.push('/history')} className="text-[10px] font-bold text-cyan-400 flex items-center hover:text-cyan-300">
                         SHOW MORE <ChevronRight size={12}/>
                     </button>
                 </div>
                 
                 <div className="divide-y divide-white/5">
                     {loadingHistory ? (
                         <div className="p-4 text-center text-xs text-gray-500">Loading...</div>
                     ) : recentHistory.length === 0 ? (
                         <div className="p-4 text-center text-xs text-gray-500">No recent transactions.</div>
                     ) : (
                         recentHistory.map(tx => (
                             <div key={tx.id} className="p-3 flex justify-between items-center hover:bg-white/5 transition-colors">
                                 <div>
                                     <div className={`text-xs font-bold ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                                         {tx.type.toUpperCase()}
                                     </div>
                                     <div className="text-[9px] text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</div>
                                 </div>
                                 <div className="text-right">
                                     <div className="text-sm font-mono font-bold text-white">{parseFloat(tx.amount).toLocaleString()}</div>
                                     <div className={`text-[8px] font-bold uppercase ${tx.status === 'approved' ? 'text-green-500' : 'text-yellow-500'}`}>
                                         {tx.status}
                                     </div>
                                 </div>
                             </div>
                         ))
                     )}
                 </div>
            </GlassCard>

            {/* Referral Section */}
            <GlassCard className="p-4 bg-cyan-900/20 border-cyan-500/30 mb-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-2">INVITE FRIENDS</h3>
                <p className="text-xs text-gray-300 mb-3">Share your code to earn 2000 MMK per friend.</p>
                <div className="bg-black/50 p-3 rounded-lg border border-dashed border-gray-600 flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors" onClick={handleCopy}>
                    <span className="font-mono text-lg tracking-widest text-white">
                        {user.referral_code || '---'}
                    </span>
                    <button className="text-xs bg-white text-black px-3 py-1 rounded font-bold hover:bg-gray-200 flex items-center gap-1">
                        {copied ? <Check size={12}/> : <Copy size={12}/>} {copied ? 'COPIED' : 'COPY'}
                    </button>
                </div>
            </GlassCard>

        </div>

        <BottomDock 
            activeCharId={user.active_pet_id} 
            onNavigate={(path) => router.push(`/${path}`)} 
            onOpenBank={() => router.push('/wallet')}
        />
    </div>
  );
}