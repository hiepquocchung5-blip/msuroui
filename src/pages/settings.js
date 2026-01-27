import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ChevronLeft, Volume2, VolumeX, Smartphone, Shield, LogOut, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

export default function SettingsPage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    
    // Preferences State
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [highQuality, setHighQuality] = useState(true);

    // Password Form State
    const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    // Load Prefs
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSoundEnabled(localStorage.getItem('suro_sound') !== 'false');
            setMusicEnabled(localStorage.getItem('suro_music') !== 'false');
            setHighQuality(localStorage.getItem('suro_hq') !== 'false');
        }
    }, []);

    // Toggle Handler
    const toggleSetting = (key, val, setter) => {
        const newVal = !val;
        setter(newVal);
        localStorage.setItem(key, newVal);
        // Dispatch event for hooks to listen
        window.dispatchEvent(new Event('storage')); 
    };

    // Password Change Handler
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMsg(null);
        
        if (passForm.new.length < 6) {
            setMsg({ type: 'error', text: 'New password must be at least 6 chars.' });
            return;
        }
        if (passForm.new !== passForm.confirm) {
            setMsg({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        setIsSaving(true);
        try {
            // Call API
            const res = await api.post('/user/change_password.php', {
                current_password: passForm.current,
                new_password: passForm.new
            });
            
            if (res.data.status === 'success') {
                setMsg({ type: 'success', text: 'Password updated successfully.' });
                setPassForm({ current: '', new: '', confirm: '' });
            } else {
                throw new Error(res.data.error || "Failed to update.");
            }
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.error || error.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="bg-black min-h-screen"/>;
    if (!user) { if(typeof window !== 'undefined') router.push('/'); return null; }

    return (
        <div className="min-h-screen bg-[#050505] relative overflow-hidden pb-10">
            {/* Header */}
            <div className="p-6 pt-8 bg-black border-b border-white/5 sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-white hover:text-cyan-400 transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-wider">SETTINGS</h1>
                </div>
            </div>

            <div className="p-6 space-y-6">
                
                {/* 1. App Experience */}
                <div>
                    <h3 className="text-xs text-gray-500 font-bold uppercase mb-3 ml-1">App Experience</h3>
                    <GlassCard className="p-0 overflow-hidden">
                        {/* Sound Toggle */}
                        <div className="p-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-3">
                                {soundEnabled ? <Volume2 size={20} className="text-cyan-400"/> : <VolumeX size={20} className="text-gray-500"/>}
                                <span className="text-sm font-bold text-white">Sound Effects</span>
                            </div>
                            <button 
                                onClick={() => toggleSetting('suro_sound', soundEnabled, setSoundEnabled)}
                                className={`w-10 h-5 rounded-full relative transition-colors ${soundEnabled ? 'bg-cyan-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${soundEnabled ? 'left-5.5' : 'left-0.5'}`} />
                            </button>
                        </div>

                        {/* Graphics Toggle */}
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Smartphone size={20} className={highQuality ? "text-green-400" : "text-gray-500"}/>
                                <div>
                                    <div className="text-sm font-bold text-white">High Quality Graphics</div>
                                    <div className="text-[10px] text-gray-500">Enable 3D particles & animations</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => toggleSetting('suro_hq', highQuality, setHighQuality)}
                                className={`w-10 h-5 rounded-full relative transition-colors ${highQuality ? 'bg-green-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${highQuality ? 'left-5.5' : 'left-0.5'}`} />
                            </button>
                        </div>
                    </GlassCard>
                </div>

                {/* 2. Security */}
                <div>
                    <h3 className="text-xs text-gray-500 font-bold uppercase mb-3 ml-1">Account Security</h3>
                    <GlassCard className="p-5">
                        <div className="flex items-center gap-2 mb-4 text-yellow-500">
                            <Shield size={18} />
                            <span className="text-sm font-bold">CHANGE PASSWORD</span>
                        </div>
                        
                        <form onSubmit={handlePasswordChange} className="space-y-3">
                            <div>
                                <input 
                                    type="password" 
                                    placeholder="Current Password" 
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-yellow-500 outline-none"
                                    value={passForm.current}
                                    onChange={(e) => setPassForm({...passForm, current: e.target.value})}
                                />
                            </div>
                            <div>
                                <input 
                                    type="password" 
                                    placeholder="New Password" 
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-yellow-500 outline-none"
                                    value={passForm.new}
                                    onChange={(e) => setPassForm({...passForm, new: e.target.value})}
                                />
                            </div>
                            <div>
                                <input 
                                    type="password" 
                                    placeholder="Confirm New Password" 
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-yellow-500 outline-none"
                                    value={passForm.confirm}
                                    onChange={(e) => setPassForm({...passForm, confirm: e.target.value})}
                                />
                            </div>

                            {msg && (
                                <div className={`p-2 rounded text-xs flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {msg.type === 'success' ? <CheckCircle size={12}/> : <AlertCircle size={12}/>}
                                    {msg.text}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full bg-white text-black font-bold py-3 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="animate-spin w-4 h-4 mx-auto"/> : 'UPDATE PASSWORD'}
                            </button>
                        </form>
                    </GlassCard>
                </div>

                {/* 3. Info & Logout */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs text-gray-500 px-2">
                        <span>User ID: {user.id}</span>
                        <span>v10.0.0 (Pro)</span>
                    </div>
                    
                    <button 
                        onClick={logout}
                        className="w-full py-4 rounded-xl border border-red-500/30 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={18} /> LOG OUT
                    </button>
                </div>

            </div>
        </div>
    );
}