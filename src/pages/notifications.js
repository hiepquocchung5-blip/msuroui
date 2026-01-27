import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ChevronLeft, Bell, Gift, CheckCircle, XCircle, Info, Loader2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import BottomDock from '../components/layout/BottomDock';

export default function NotificationsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [notifs, setNotifs] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const res = await api.get('/user/notifications.php');
                if (res.data.status === 'success') {
                    setNotifs(res.data.data);
                }
            } catch (e) { console.error(e); } 
            finally { setIsFetching(false); }
        };
        if(user) fetchNotifs();
    }, [user]);

    if (loading) return <div className="bg-black min-h-screen"/>;
    if (!user) { router.push('/'); return null; }

    const getIcon = (type) => {
        switch(type) {
            case 'success': return <CheckCircle className="text-green-400" size={24}/>;
            case 'error': return <XCircle className="text-red-400" size={24}/>;
            case 'gift': return <Gift className="text-yellow-400" size={24}/>;
            default: return <Info className="text-blue-400" size={24}/>;
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden">
             {/* Header */}
             <div className="p-6 pt-8 bg-gradient-to-b from-gray-900 to-transparent sticky top-0 z-20 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-white hover:text-cyan-400 transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-black text-white tracking-widest italic flex items-center gap-2">
                        <Bell className="text-yellow-500" /> NOTIFICATIONS
                    </h1>
                </div>
            </div>

            <div className="px-6 space-y-3 relative z-10">
                {isFetching ? (
                    <div className="text-center text-gray-500 py-10"><Loader2 className="animate-spin mx-auto"/> Loading...</div>
                ) : notifs.length === 0 ? (
                    <div className="text-center text-gray-600 py-10 text-sm">No recent notifications.</div>
                ) : (
                    notifs.map(n => (
                        <GlassCard key={n.id} className="p-4 flex gap-4 items-start border-l-4 border-l-transparent hover:bg-white/5 transition-colors">
                            <div className="mt-1 flex-shrink-0">{getIcon(n.type)}</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-white font-bold text-sm">{n.title}</h4>
                                    <span className="text-[10px] text-gray-500">{n.date} {n.time}</span>
                                </div>
                                <p className="text-xs text-gray-300 mt-1 leading-relaxed">{n.message}</p>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

            <BottomDock activeCharId={user.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} />
        </div>
    );
}