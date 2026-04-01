import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { user as userApi } from '../services/api';
import { ChevronLeft, LogOut, Trophy, Wallet, Shield, MapPin, Crown, Copy, Check, ChevronRight, History as HistoryIcon, Gem } from 'lucide-react';
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

  if (loading || !user) return <div className="bg-[#050505] min-h-screen flex items-center justify-center font-mono text-cyan-500 animate-pulse tracking-widest">LOADING DOSSIER...</div>;

  const ownedCount = user.owned_islands ? user.owned_islands.length : 0;

  // --- Animation Variants ---
  const containerVariants = {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden font-sans">
        
        {/* Background Texture (V3 Japanese Motif) */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/seigaiha.png')] opacity-5 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/40 via-[#050505] to-[#050505] pointer-events-none" />
        
        {/* Header */}
        <div className="p-6 pt-8 flex justify-between items-center relative z-10 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm border-b border-white/5">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="text-white hover:text-cyan-400 transition-colors active:scale-95">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-black text-white tracking-widest italic flex items-center gap-2">
                    <Shield className="text-cyan-500" /> DOSSIER
                </h1>
            </div>
            <div className="flex gap-2">
                <button onClick={() => router.push('/settings')} className="bg-white/5 border border-white/10 p-2.5 rounded-full hover:bg-white/10 text-white transition-colors active:scale-95">
                   <Shield size={18} />
                </button>
                <button onClick={logout} className="bg-red-950/40 border border-red-900/50 p-2.5 rounded-full hover:bg-red-900/60 text-red-400 transition-colors active:scale-95">
                    <LogOut size={18} />
                </button>
            </div>
        </div>

        <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show" 
            className="px-6 space-y-4 relative z-10 mt-4"
        >
            
            {/* VIP Identity Card (V3 Premium Look) */}
            <motion.div variants={itemVariants}>
                <GlassCard className="p-0 flex flex-col bg-gradient-to-br from-gray-900 to-black border-gray-700/50 relative overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
                    {/* Metallic Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
                    
                    <div className="p-6 flex items-center gap-5">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] overflow-hidden bg-black flex-shrink-0 relative z-10">
                            <div className="w-full h-full transform scale-125 pt-2">
                                <CharacterSVG type={user.active_pet_id || 'luna'} mood="idle" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 relative z-10">
                            <div className="text-[9px] text-cyan-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" /> Verified Operative
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white mb-0.5 truncate tracking-tight">{user.username}</h2>
                            <div className="text-xs text-gray-400 font-mono mb-3">{user.phone}</div>
                            
                            <button onClick={() => router.push('/vip')} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-3 py-1 rounded shadow-[0_0_10px_rgba(234,179,8,0.3)] text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-95">
                                <Crown size={12} /> VIP RANK {user.level} <ChevronRight size={12}/>
                            </button>
                        </div>
                    </div>

                    {/* Level Progress Footer */}
                    <div className="bg-black/60 p-4 border-t border-white/5">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">XP Progression</span>
                            <span className="text-[10px] text-cyan-400 font-mono font-bold">{user.xp.toLocaleString()} <span className="text-gray-600">/ {user.next_level_xp.toLocaleString()}</span></span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out"
                                style={{ width: `${user.progress_percent || 0}%` }}
                            />
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Core Stats Grid (V3 Minimalist) */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                <GlassCard className="p-4 flex flex-col justify-center gap-1 bg-black/40 border-white/5 hover:border-green-500/30 transition-colors group cursor-pointer" onClick={() => router.push('/wallet')}>
                    <div className="flex justify-between items-center w-full mb-2">
                        <Wallet className="text-green-500 group-hover:scale-110 transition-transform" size={18} />
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Balance</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-white truncate w-full">
                        {parseFloat(user.balance).toLocaleString()}
                    </div>
                </GlassCard>
                
                <GlassCard className="p-4 flex flex-col justify-center gap-1 bg-black/40 border-white/5 hover:border-yellow-500/30 transition-colors group cursor-pointer" onClick={() => router.push('/rank')}>
                    <div className="flex justify-between items-center w-full mb-2">
                        <Trophy className="text-yellow-500 group-hover:scale-110 transition-transform" size={18} />
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Rank</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-white">
                        LEADER
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex flex-col justify-center gap-1 bg-black/40 border-white/5 hover:border-purple-500/30 transition-colors group cursor-pointer" onClick={() => router.push('/shop')}>
                    <div className="flex justify-between items-center w-full mb-2">
                        <MapPin className="text-purple-500 group-hover:scale-110 transition-transform" size={18} />
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Sectors</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-white">
                        {ownedCount} <span className="text-sm text-gray-600">/ 5</span>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex flex-col justify-center gap-1 bg-black/40 border-white/5 group">
                    <div className="flex justify-between items-center w-full mb-2">
                        <Gem className="text-blue-500 group-hover:scale-110 transition-transform" size={18} />
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">User ID</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-white">
                        #{user.id.toString().padStart(4, '0')}
                    </div>
                </GlassCard>
            </motion.div>

            {/* Referral Section (V3 High-End) */}
            <motion.div variants={itemVariants}>
                <GlassCard className="p-0 bg-gradient-to-r from-blue-900/20 to-cyan-900/10 border-cyan-500/30 overflow-hidden cursor-pointer hover:border-cyan-500/60 transition-all group" onClick={() => router.push('/referral')}>
                    <div className="p-5 flex items-center justify-between relative z-10">
                        <div>
                            <h3 className="text-sm font-black text-cyan-400 mb-1 tracking-widest uppercase">VIP Affiliates</h3>
                            <p className="text-[10px] text-gray-400">Share code. Earn 2,000 MMK per recruit.</p>
                        </div>
                        <div className="bg-black/60 border border-cyan-500/30 px-4 py-2 rounded-lg flex items-center gap-3">
                            <span className="font-mono text-sm tracking-widest text-white font-bold">
                                {user.referral_code || '---'}
                            </span>
                            <button className="text-cyan-400 hover:text-cyan-300 transition-colors" onClick={(e) => { e.stopPropagation(); handleCopy(); }}>
                                {copied ? <Check size={16}/> : <Copy size={16}/>}
                            </button>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Recent Activity Ledger (V3 Clean) */}
            <motion.div variants={itemVariants}>
                <GlassCard className="p-0 overflow-hidden border-white/5 bg-black/40">
                     <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/60">
                         <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                             <HistoryIcon size={14} className="text-gray-500"/> FINANCIAL LEDGER
                         </h3>
                         <button onClick={() => router.push('/history')} className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest flex items-center hover:text-cyan-400 transition-colors bg-cyan-500/10 px-2 py-1 rounded">
                             VIEW ALL <ChevronRight size={10} className="ml-1"/>
                         </button>
                     </div>
                     
                     <div className="divide-y divide-white/5">
                         {loadingHistory ? (
                             <div className="p-6 text-center text-xs text-gray-500 font-mono animate-pulse">SYNCING RECORDS...</div>
                         ) : recentHistory.length === 0 ? (
                             <div className="p-6 text-center text-xs text-gray-600 font-mono">NO RECENT TRANSACTIONS.</div>
                         ) : (
                             recentHistory.map(tx => (
                                 <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer" onClick={() => router.push('/history')}>
                                     <div className="flex items-center gap-3">
                                         <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${tx.type === 'deposit' ? 'bg-green-950/50 border-green-500/30 text-green-500' : 'bg-red-950/50 border-red-500/30 text-red-500'}`}>
                                            <span className="font-black text-lg leading-none mb-1">{tx.type === 'deposit' ? '+' : '-'}</span>
                                         </div>
                                         <div>
                                             <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                                                 {tx.type}
                                             </div>
                                             <div className="text-[9px] text-gray-500 font-mono mt-0.5">{new Date(tx.created_at).toLocaleDateString()}</div>
                                         </div>
                                     </div>
                                     <div className="text-right">
                                         <div className="text-sm font-mono font-black text-white">{parseFloat(tx.amount).toLocaleString()}</div>
                                         <div className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${tx.status === 'approved' ? 'text-green-500' : (tx.status === 'rejected' ? 'text-red-500' : 'text-yellow-500')}`}>
                                             {tx.status}
                                         </div>
                                     </div>
                                 </div>
                             ))
                         )}
                     </div>
                </GlassCard>
            </motion.div>

        </motion.div>

        <BottomDock 
            activeCharId={user.active_pet_id} 
            onNavigate={(path) => router.push(`/${path}`)} 
            onOpenBank={() => router.push('/wallet')}
        />
    </div>
  );
}