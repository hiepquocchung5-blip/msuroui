import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; // Assuming this exists from previous steps, if not remove or replace with alert/local state
import api, { finance } from '../services/api';
import { ChevronLeft, Upload, Copy, ArrowDownCircle, ArrowUpCircle, History, AlertCircle, Loader2, Clock, ShieldCheck, UserCheck, Info, User, Wifi } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import BottomDock from '../components/layout/BottomDock';

export default function WalletPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    
    // Optional Toast hook if available, otherwise fallback
    const toast = { addToast: (msg, type) => console.log(type, msg) }; 
    try {
        const t = require('../context/ToastContext').useToast();
        if(t) toast.addToast = t.addToast;
    } catch(e) {}
    
    // Tabs & Data
    const [activeTab, setActiveTab] = useState('deposit');
    const [depositMethods, setDepositMethods] = useState([]);
    const [withdrawBanks, setWithdrawBanks] = useState([]);
    const [withdrawLimits, setWithdrawLimits] = useState([]);
    
    // Selection State
    const [selectedDepositMethod, setSelectedDepositMethod] = useState(null);
    const [selectedWithdrawBank, setSelectedWithdrawBank] = useState(null);
    const [availableAgents, setAvailableAgents] = useState([]); 
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [agentsLoading, setAgentsLoading] = useState(false);
    
    const [amount, setAmount] = useState('');
    
    // Deposit Session State (15 Minute Security Window)
    const [sessionExpiry, setSessionExpiry] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const timerRef = useRef(null);

    // Form Fields
    const [proofFile, setProofFile] = useState(null);
    const [lastDigits, setLastDigits] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [message, setMessage] = useState(null);

    // 1. Fetch Real Configuration from Backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Deposit Methods
                const depRes = await api.get('/data/payment_methods.php');
                if (depRes.data.status === 'success') {
                    setDepositMethods(depRes.data.data);
                }

                // Fetch Withdrawal Banks
                try {
                    const bankRes = await api.get('/data/withdrawal_banks.php');
                    if (bankRes.data.status === 'success') {
                        setWithdrawBanks(bankRes.data.data);
                    }
                } catch (e) { 
                    console.error("Failed to load withdrawal banks", e);
                }

                // Fetch Withdrawal Limits
                try {
                    const limitRes = await api.get('/data/withdrawal_limits.php');
                    if (limitRes.data.status === 'success') {
                        setWithdrawLimits(limitRes.data.data);
                    }
                } catch (e) { 
                    console.error("Failed to load limits", e); 
                }

            } catch (e) {
                console.error("Wallet Config Error", e);
                setMessage({ type: 'error', text: "Failed to load banking configuration." });
            } finally {
                setIsLoadingData(false);
            }
        };
        if(user) fetchData();
    }, [user]);

    // 2. Fetch Agents when Withdrawal Bank Selected
    useEffect(() => {
        // Reset agent selection when bank changes
        setSelectedAgent(null);
        setAvailableAgents([]);
        
        if (activeTab === 'withdraw' && selectedWithdrawBank) {
            const fetchAgents = async () => {
                setAgentsLoading(true);
                try {
                    // Try to fetch agents specifically for this bank
                    const bankName = selectedWithdrawBank.bank_name || selectedWithdrawBank.provider_name;
                    const res = await api.get(`/data/withdrawal_agents.php?provider=${encodeURIComponent(bankName)}`);
                    if (res.data.status === 'success') {
                        setAvailableAgents(res.data.data);
                        // Auto-select if only one agent is available
                        if(res.data.data.length === 1) setSelectedAgent(res.data.data[0]);
                    }
                } catch(e) { 
                    console.warn("Agent fetch failed", e);
                    setAvailableAgents([]); 
                } finally {
                    setAgentsLoading(false);
                }
            };
            fetchAgents();
        }
    }, [selectedWithdrawBank, activeTab]);

    // 3. Countdown Timer Logic
    useEffect(() => {
        if (sessionExpiry) {
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const diff = sessionExpiry - now;
                
                if (diff <= 0) {
                    clearInterval(timerRef.current);
                    setSelectedDepositMethod(null);
                    setSessionExpiry(null);
                    setTimeLeft(null);
                    alert("Security Session Expired. Please select a payment method again.");
                } else {
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
                }
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [sessionExpiry]);

    // Handlers
    const handleSelectDeposit = (method) => {
        const expiry = Date.now() + 15 * 60 * 1000; // 15 Minutes
        setSessionExpiry(expiry);
        setSelectedDepositMethod(method);
        setMessage(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'File too large (Max 5MB)' });
                return;
            }
            setProofFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        // Basic Validation
        if (!amount || parseInt(amount) < 1000) {
            setMessage({ type: 'error', text: 'Minimum amount is 1,000 MMK' });
            setIsSubmitting(false);
            return;
        }

        try {
            if (activeTab === 'deposit') {
                if (!selectedDepositMethod) throw new Error("Please select a payment channel.");
                if (!previewUrl || !lastDigits) throw new Error("Proof screenshot & Transaction ID (Last 6) are required.");
                if (lastDigits.length !== 6) throw new Error("Transaction ID must be exactly the last 6 digits.");

                const res = await finance.deposit(amount, selectedDepositMethod.provider_name, previewUrl, lastDigits);
                
                if (res.data.status === 'success') {
                    setMessage({ type: 'success', text: 'Deposit submitted! Pending Verification.' });
                    setSelectedDepositMethod(null);
                    setSessionExpiry(null);
                    setProofFile(null); setPreviewUrl(null); setLastDigits(''); setAmount('');
                }
            } 
            else { // WITHDRAW
                if (!selectedWithdrawBank) throw new Error("Select a receiving bank.");
                if (parseFloat(amount) > parseFloat(user.balance)) throw new Error("Insufficient Balance.");
                
                // Requirement: Must select agent if available
                if (availableAgents.length > 0 && !selectedAgent) {
                    throw new Error("Please select an online agent to process your withdrawal.");
                }
                
                const bankName = selectedWithdrawBank.bank_name || selectedWithdrawBank.provider_name;
                const targetId = selectedAgent ? selectedAgent.id : null;
                
                const payload = {
                    type: 'withdraw',
                    amount: amount,
                    provider: bankName,
                    target_admin_id: targetId
                };

                const res = await api.post('/finance/submit_request.php', payload);
                
                if (res.data.status === 'success') {
                    setMessage({ type: 'success', text: `Withdrawal requested via ${bankName}.` });
                    setAmount('');
                    setSelectedAgent(null);
                }
            }
        } catch (error) {
            console.error("Tx Error", error);
            const errorMsg = error.response?.data?.error || error.message || "Request failed.";
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getIcon = (name) => {
        if (!name) return '🏦';
        const n = name.toLowerCase();
        if (n.includes('kbz')) return '💙';
        if (n.includes('wave')) return '💛';
        if (n.includes('cb')) return '🧡';
        if (n.includes('aya')) return '❤️';
        if (n.includes('usdt')) return '🟢';
        return '🏦';
    };

    if (loading || !user) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Loading Wallet...</div>;

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden">
            {/* Header */}
            <div className="p-6 pt-8 bg-gradient-to-b from-gray-900 to-transparent">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => router.back()} className="text-white hover:text-cyan-400 transition-colors"><ChevronLeft size={28} /></button>
                    <h1 className="text-2xl font-black italic text-white tracking-widest">CASHIER</h1>
                    <button onClick={() => router.push('/history')} className="text-gray-400 hover:text-white transition-colors"><History size={24} /></button>
                </div>

                <GlassCard className="p-6 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-black border-yellow-500/30">
                    <span className="text-gray-400 text-xs font-bold tracking-widest mb-2">TOTAL BALANCE</span>
                    <div className="text-4xl font-mono font-black text-yellow-400 drop-shadow-md">
                        {parseFloat(user.balance).toLocaleString()} <span className="text-sm text-yellow-600">MMK</span>
                    </div>
                </GlassCard>
            </div>

            <div className="px-6 mt-4">
                {/* Tabs */}
                <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 mb-6">
                    <button onClick={() => { setActiveTab('deposit'); setMessage(null); }} className={`flex-1 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'deposit' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                        <ArrowDownCircle size={16} /> DEPOSIT
                    </button>
                    <button onClick={() => { setActiveTab('withdraw'); setMessage(null); }} className={`flex-1 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'withdraw' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                        <ArrowUpCircle size={16} /> WITHDRAW
                    </button>
                </div>

                {isLoadingData ? (
                    <div className="text-center text-gray-500 py-10 flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-cyan-500" />
                        <span className="text-xs">Loading Secure Channels...</span>
                    </div>
                ) : (
                    <>
                        {/* === DEPOSIT VIEW === */}
                        {activeTab === 'deposit' && (
                            <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                                <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Select Channel</label>
                                
                                {depositMethods.length === 0 ? (
                                    <div className="text-red-500 text-xs text-center border border-red-900 p-4 rounded-xl bg-red-900/20">No active deposit methods found. Please contact support.</div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {depositMethods.map(method => (
                                            <div key={method.id} onClick={() => handleSelectDeposit(method)} className={`p-3 rounded-xl border cursor-pointer flex flex-col items-center gap-1 transition-all ${selectedDepositMethod?.id === method.id ? 'bg-cyan-900/30 border-cyan-500 ring-2 ring-cyan-500/50' : 'bg-black/40 border-white/10 opacity-60 hover:opacity-100'}`}>
                                                <div className="text-2xl">{method.logo_url ? <img src={method.logo_url} alt="icon" className="w-6 h-6 object-contain"/> : getIcon(method.provider_name)}</div>
                                                <div className="text-xs font-bold text-white">{method.provider_name}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedDepositMethod && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                                            <Clock size={10} /> {timeLeft}
                                        </div>
                                        
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <div className="text-[10px] text-green-400 font-bold">OFFICIAL AGENT ACTIVE</div>
                                        </div>

                                        <div className="text-[10px] text-yellow-500 font-bold mb-2 uppercase">Transfer To:</div>
                                        <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg mb-2 border border-white/5">
                                            <div>
                                                <span className="text-white font-mono text-lg block tracking-wide">{selectedDepositMethod.account_number}</span>
                                                <span className="text-[10px] text-gray-400 uppercase">{selectedDepositMethod.account_name}</span>
                                            </div>
                                            <button type="button" onClick={() => navigator.clipboard.writeText(selectedDepositMethod.account_number)} className="text-gray-400 hover:text-white p-2 bg-white/5 rounded-lg active:scale-95 transition-transform"><Copy size={16}/></button>
                                        </div>
                                        <div className="text-[9px] text-gray-500 text-center">
                                            Please transfer exactly the amount you wish to deposit.
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* === WITHDRAW VIEW === */}
                        {activeTab === 'withdraw' && (
                            <div className="animate-in fade-in slide-in-from-left-4 space-y-4">
                                <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Select Bank</label>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    {withdrawBanks.length > 0 ? withdrawBanks.map(bank => {
                                        const bankName = bank.bank_name || bank.provider_name || bank.name;
                                        return (
                                            <div key={bank.id} onClick={() => { setSelectedWithdrawBank(bank); setSelectedAgent(null); }} className={`p-3 rounded-xl border cursor-pointer flex flex-col items-center gap-1 transition-all ${selectedWithdrawBank?.id === bank.id ? 'bg-red-900/30 border-red-500 ring-2 ring-red-500/50' : 'bg-black/40 border-white/10 opacity-60'}`}>
                                                <div className="text-2xl">{bank.logo_url ? <img src={bank.logo_url} alt="icon" className="w-6 h-6 object-contain"/> : getIcon(bankName)}</div>
                                                <div className="text-xs font-bold text-white">{bankName}</div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="col-span-2 text-center text-gray-500 text-xs p-4">No withdrawal banks available.</div>
                                    )}
                                </div>
                                
                                {/* Agent Selection (New Feature) */}
                                {selectedWithdrawBank && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Processing Agent</label>
                                            {agentsLoading && <Loader2 className="animate-spin w-3 h-3 text-gray-500" />}
                                        </div>
                                        
                                        {availableAgents.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-2">
                                                {availableAgents.map(agent => (
                                                    <div key={agent.id} onClick={() => setSelectedAgent(agent)} className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${selectedAgent?.id === agent.id ? 'bg-green-900/30 border-green-500' : 'bg-black/40 border-white/10'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-white border border-white/20">
                                                                <User size={14} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-white">{agent.username}</div>
                                                                <div className="text-[10px] text-green-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> ONLINE</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {agent.badge === 'FAST' && <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30 font-bold flex items-center gap-1"><AlertCircle size={10} fill="currentColor"/> FAST</span>}
                                                            {selectedAgent?.id === agent.id && <div className="text-green-500"><UserCheck size={16}/></div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-500 p-3 border border-dashed border-gray-700 rounded-xl text-center bg-black/20">
                                                <Wifi size={16} className="mx-auto mb-1 opacity-50"/>
                                                No specific agents online for {selectedWithdrawBank.bank_name || selectedWithdrawBank.provider_name}.<br/>Request will be sent to general queue.
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Limits Table */}
                                {withdrawLimits.length > 0 && (
                                    <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase"><Info size={12}/> Withdrawal Limits</div>
                                        <div className="space-y-1">
                                            {withdrawLimits.map((tier, idx) => (
                                                <div key={idx} className="flex justify-between text-[9px] font-mono text-gray-500 border-b border-white/5 pb-1 last:border-0">
                                                    <span>Dep: {parseFloat(tier.deposit_amount).toLocaleString()}</span>
                                                    <span className="text-white">Max: {parseFloat(tier.max_withdraw).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* === FORM (Shared) === */}
                        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 font-bold ml-1">AMOUNT (MMK)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono text-lg focus:border-cyan-500 outline-none placeholder:text-gray-700"
                                    placeholder="Min 1,000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    disabled={isSubmitting || (activeTab === 'deposit' && !selectedDepositMethod)}
                                />
                            </div>

                            {activeTab === 'deposit' && selectedDepositMethod && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 font-bold ml-1">LAST 6 DIGITS (TX ID)</label>
                                        <input type="text" maxLength={6} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono text-lg focus:border-cyan-500 outline-none placeholder:text-gray-700" placeholder="e.g. 123456" value={lastDigits} onChange={(e) => setLastDigits(e.target.value)} disabled={isSubmitting}/>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 font-bold ml-1">PROOF</label>
                                        <div className="relative w-full h-32 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center hover:border-cyan-500 transition-colors cursor-pointer bg-black/30 overflow-hidden group">
                                            {previewUrl ? <img src={previewUrl} alt="Proof" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-gray-500 group-hover:text-cyan-400 transition-colors"><Upload className="mb-2" size={24}/><span className="text-xs">Upload Screenshot</span></div>}
                                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} disabled={isSubmitting} />
                                        </div>
                                    </div>
                                </>
                            )}

                            {message && <div className={`p-3 rounded-lg text-xs text-center font-bold border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>{message.text}</div>}

                            <button type="submit" disabled={isSubmitting || (activeTab === 'deposit' && !selectedDepositMethod)} className={`w-full py-4 rounded-xl font-black text-white shadow-lg active:scale-95 transition-transform mt-2 flex items-center justify-center gap-2 ${activeTab === 'deposit' ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-red-600 to-red-500'} disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}>
                                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <><ShieldCheck size={18}/> CONFIRM TRANSACTION</>}
                            </button>
                        </form>
                    </>
                )}
            </div>
            
            <BottomDock 
                activeCharId={user?.active_pet_id} 
                onNavigate={(path) => router.push(`/${path}`)} 
                onOpenBank={() => { /* Already on wallet */ }}
            />
        </div>
    );
}