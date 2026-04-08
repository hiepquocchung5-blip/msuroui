import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // Direct API access
import { ChevronLeft, Users, Send, DollarSign, RefreshCw, Copy, Activity, Shield } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import BottomDock from '../components/layout/BottomDock';

export default function AgentPage() {
  const { user, loading, updateBalance } = useAuth();
  const router = useRouter();
  
  // Data State
  const [agentData, setAgentData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  
  // Transfer Form State
  const [targetPhone, setTargetPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  // 1. Fetch Agent Info
  const fetchAgentData = async () => {
      setIsFetching(true);
      try {
          const res = await api.get('/agent/data.php');
          if (res.data.status === 'success') {
              setAgentData(res.data);
          }
      } catch (e) {
          if (e.response?.status === 403) {
              alert("Restricted Area: Agents Only");
              router.push('/profile');
          }
      } finally {
          setIsFetching(false);
      }
  };

  useEffect(() => {
      if (user) {
          if (user.is_agent != 1 && user.is_agent !== true) { // Handle loose typing
             // Optional: Redirect immediately or show locked state
          } else {
             fetchAgentData();
          }
      }
  }, [user]);

  // 2. Handle Transfer
  const handleTransfer = async (e) => {
      e.preventDefault();
      setMsg(null);
      setIsSubmitting(true);

      try {
          const res = await api.post('/agent/transfer.php', {
              target_phone: targetPhone,
              amount: amount
          });
          
          if (res.data.status === 'success') {
              setMsg({ type: 'success', text: res.data.message });
              updateBalance(res.data.new_balance); // Update global context
              setAmount('');
              setTargetPhone('');
              fetchAgentData(); // Refresh history
          }
      } catch (e) {
          setMsg({ type: 'error', text: e.response?.data?.error || "Transfer failed" });
      } finally {
          setIsSubmitting(false);
      }
  };

  if (loading) return <div className="bg-black min-h-screen"/>;
  
  // Guard Clause for non-agents
  if (user && user.is_agent != 1 && user.is_agent !== true) {
      return (
          <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center p-6 text-center">
              <Shield size={48} className="text-gray-600 mb-4"/>
              <h2 className="text-xl font-bold">ACCESS RESTRICTED</h2>
              <p className="text-gray-400 text-sm mt-2">This area is for authorized Agents only.</p>
              <button onClick={() => router.push('/profile')} className="mt-6 bg-white text-black px-6 py-2 rounded-full font-bold">GO BACK</button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden">
        {/* Header */}
        <div className="p-6 pt-8 relative z-10 flex justify-between items-center bg-gradient-to-b from-blue-900/20 to-transparent">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="text-white hover:text-cyan-400 transition-colors">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-black text-white tracking-widest italic">AGENT PORTAL</h1>
            </div>
            <button onClick={fetchAgentData} className="text-gray-400 hover:text-white">
                <RefreshCw size={20} className={isFetching ? "animate-spin" : ""} />
            </button>
        </div>

        <div className="px-6 space-y-6 relative z-10">
            
            {/* Stats Card */}
            <GlassCard className="p-5 border-blue-500/30 bg-gradient-to-br from-blue-900/40 to-black">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-xs text-blue-400 font-bold mb-1">YOUR BALANCE</div>
                        <div className="text-2xl font-mono font-bold text-white">{parseFloat(user.balance).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-yellow-400 font-bold mb-1">COMMISSION</div>
                        <div className="text-xl font-mono font-bold text-yellow-300">
                            {agentData ? parseFloat(agentData.agent_profile.commission).toLocaleString() : '---'}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                    <span className="text-xs text-gray-400 font-mono tracking-widest">CODE: {agentData?.agent_profile?.referral_code || '...'}</span>
                    <Copy size={14} className="text-gray-400" />
                </div>
            </GlassCard>

            {/* Transfer Tool */}
            <GlassCard className="p-5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Send size={16} className="text-green-400"/> CREDIT TRANSFER
                </h3>
                
                <form onSubmit={handleTransfer} className="space-y-3">
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Player Phone</label>
                        <input 
                            type="tel" 
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-green-500 outline-none"
                            placeholder="09..."
                            value={targetPhone}
                            onChange={(e) => setTargetPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Amount</label>
                        <input 
                            type="number" 
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-green-500 outline-none"
                            placeholder="Min 1,000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    {msg && (
                        <div className={`text-xs p-2 rounded ${msg.type === 'success' ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'}`}>
                            {msg.text}
                        </div>
                    )}

                    <button disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50">
                        {isSubmitting ? 'PROCESSING...' : 'SEND CREDITS'}
                    </button>
                </form>
            </GlassCard>

            {/* Downline Activity */}
            <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase">Recent Activity</h3>
                    <span className="text-[10px] text-blue-400">{agentData?.downline?.length || 0} Users</span>
                </div>
                
                {agentData?.downline?.length > 0 ? (
                    agentData.downline.map((u) => (
                        <div key={u.id} className="bg-white/5 border border-white/5 p-3 rounded-xl flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-800 p-2 rounded-full"><Users size={14} className="text-gray-400"/></div>
                                <div>
                                    <div className="text-xs font-bold text-white">{u.username}</div>
                                    <div className="text-[9px] text-gray-500">{u.phone}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-mono text-green-400">+{parseFloat(u.total_deposited || 0).toLocaleString()}</div>
                                <div className="text-[8px] text-gray-600">DEPOSITED</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-600 text-xs py-4">No referrals found yet.</div>
                )}
            </div>

        </div>

        <BottomDock activeCharId={user?.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} onOpenBank={() => router.push('/wallet')} />
    </div>
  );
}