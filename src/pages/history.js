import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { user as userApi } from '../services/api';
import { ChevronLeft, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle, RefreshCw, AlertCircle, FileText, Image as ImageIcon, Gift, History as HistoryIcon } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import BottomDock from '../components/layout/BottomDock';

export default function HistoryPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [transactions, setTransactions] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    
    // Modal State
    const [selectedTx, setSelectedTx] = useState(null);

    const fetchHistory = async () => {
        setIsFetching(true);
        try {
            const res = await userApi.getHistory();
            if (res.data.status === 'success') {
                setTransactions(res.data.data);
            }
        } catch(e) {
            console.error("Failed to fetch history");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (user) fetchHistory();
    }, [user]);

    if (loading) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Loading...</div>;
    if (!user) { 
        if (typeof window !== 'undefined') router.push('/'); 
        return null; 
    }

    // Helper for Status Badge
    const StatusBadge = ({ status }) => {
        if (status === 'approved') return <span className="text-green-400 bg-green-900/30 px-2 py-1 rounded text-[10px] font-bold border border-green-500/30 flex items-center gap-1"><CheckCircle size={10}/> SUCCESS</span>;
        if (status === 'rejected') return <span className="text-red-400 bg-red-900/30 px-2 py-1 rounded text-[10px] font-bold border border-red-500/30 flex items-center gap-1"><XCircle size={10}/> FAILED</span>;
        return <span className="text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded text-[10px] font-bold border border-yellow-500/30 flex items-center gap-1"><Clock size={10}/> PENDING</span>;
    };

    // Helper to get Base URL for images (removes /api suffix if present to avoid double api/api)
    const getImageUrl = (path) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        // If API_URL ends in /api, we might need to adjust depending on where 'proofs' folder is relative to it.
        // Assuming API_URL points to the folder containing 'proofs' parent or similar structure.
        // For this setup: API is http://localhost:8005/api. Proofs are in ../proofs relative to script.
        // If serves static files correctly, we might need to point to root. 
        // Simple heuristic: Remove '/api' from end to get root if proofs are in root/proofs, 
        // OR if proofs are inside api/proofs, just append.
        // Let's assume standard static serving:
        return `${baseUrl}/${path}`;
    };

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden">
            {/* Header */}
            <div className="p-6 pt-8 bg-gradient-to-b from-gray-900 to-transparent flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-white hover:text-cyan-400 transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-widest">HISTORY</h1>
                </div>
                <button onClick={fetchHistory} className="text-gray-400 hover:text-white transition-colors">
                    <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''}/>
                </button>
            </div>

            <div className="p-4 space-y-3 relative z-10">
                {transactions.map(tx => (
                    <GlassCard 
                        key={tx.id} 
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 active:scale-95 transition-all"
                        onClick={() => setSelectedTx(tx)}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full bg-black border border-white/10 ${tx.type === 'deposit' ? 'text-green-400' : (tx.type === 'withdraw' ? 'text-red-400' : 'text-yellow-400')}`}>
                                {tx.type === 'deposit' ? <ArrowDownCircle size={20}/> : (tx.type === 'withdraw' ? <ArrowUpCircle size={20}/> : <Gift size={20}/>)}
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">{tx.type}</div>
                                <div className="text-lg font-mono font-bold text-white">{parseFloat(tx.amount).toLocaleString()}</div>
                                <div className="text-[10px] text-gray-600">{new Date(tx.created_at).toLocaleString()}</div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                            <StatusBadge status={tx.status} />
                            {tx.admin_note && <div className="text-[9px] text-gray-500 italic max-w-[100px] truncate">&quot;{tx.admin_note}&quot;</div>}
                        </div>
                    </GlassCard>
                ))}
                
                {!isFetching && transactions.length === 0 && (
                    <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                        <HistoryIcon size={48} className="opacity-20 mb-2"/>
                        <span className="text-xs">No transactions found.</span>
                    </div>
                )}
            </div>

            {/* DETAIL MODAL */}
            {selectedTx && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedTx(null)}>
                    <GlassCard className="w-full max-w-sm p-6 border-white/20" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <h3 className="text-white font-bold text-lg mb-1 uppercase tracking-widest">{selectedTx.type}</h3>
                            <div className="text-3xl font-mono text-yellow-400 font-black">{parseFloat(selectedTx.amount).toLocaleString()}</div>
                            <div className="mt-2 flex justify-center"><StatusBadge status={selectedTx.status} /></div>
                        </div>
                        
                        <div className="space-y-4 text-sm text-gray-300">
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span>Date</span>
                                <span className="text-white text-xs">{new Date(selectedTx.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span>Reference ID</span>
                                <span className="font-mono text-white text-xs">{selectedTx.transaction_last_digits || 'N/A'}</span>
                            </div>
                            
                            {/* Admin Note / Rejection Reason */}
                            {selectedTx.admin_note && (
                                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex items-center gap-1"><FileText size={10}/> Admin Note</div>
                                    <p className="text-xs text-white italic">&quot;{selectedTx.admin_note}&quot;</p>
                                </div>
                            )}

                            {/* Proof Image (If deposit) */}
                            {selectedTx.proof_image && (
                                <div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex items-center gap-1"><ImageIcon size={10}/> Proof Uploaded</div>
                                    <div className="rounded-lg border border-white/20 overflow-hidden bg-black">
                                        <img 
                                            src={getImageUrl(selectedTx.proof_image)} 
                                            className="w-full h-auto object-contain max-h-48" 
                                            alt="Proof" 
                                            onError={(e) => {e.target.style.display='none'}}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <button onClick={() => setSelectedTx(null)} className="w-full mt-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-bold text-xs transition-colors">
                            CLOSE
                        </button>
                    </GlassCard>
                </div>
            )}

            <BottomDock activeCharId={user?.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} />
        </div>
    );
}