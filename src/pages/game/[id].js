import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { game as gameApi } from '../../services/api';
import { Loader2, Cpu } from 'lucide-react';
import HallView from '../../components/game/HallView';
import PlayView from '../../components/game/PlayView';

// Opt-out of Static Generation (SSG) for this dynamic route.
export async function getServerSideProps(context) {
    return {
        props: {
            resolvedId: context.params.id
        }
    };
}

export default function GameContainer({ resolvedId }) {
    const router = useRouter();
    const id = router.query.id || resolvedId;
    
    const { user, loading } = useAuth();
    const { addToast } = useToast();
    
    const [island, setIsland] = useState(null);
    const [machines, setMachines] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState(null);
    
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [isEntering, setIsEntering] = useState(false); // Mutex lock to prevent double-clicks

    // --- 1. DATA FETCHING & POLLING ---
    const fetchWorldData = useCallback(async (isInitial = false) => {
        if (!id || !user) return;
        
        try {
            if (isInitial) {
                // Initial load: Fetch both Island Config and Machines
                const [islandRes, machinesRes] = await Promise.all([
                    gameApi.getIslands(), 
                    gameApi.getMachines(id)
                ]);
                
                if (islandRes.data.status === 'success' && machinesRes.data.status === 'success') {
                    const foundIsland = islandRes.data.data.find(i => i.id === parseInt(id));
                    if (!foundIsland) throw new Error("Island not found");
                    
                    setIsland(foundIsland);
                    setMachines(machinesRes.data.machines);
                } else {
                    throw new Error("Failed to decrypt world data");
                }
            } else {
                // Background polling: Only fetch machine statuses
                const machinesRes = await gameApi.getMachines(id);
                if (machinesRes.data.status === 'success') {
                    setMachines(machinesRes.data.machines);
                }
            }
        } catch (e) {
            console.error("World Data Sync Error", e);
            if (isInitial) {
                addToast("Connection to sector lost. Rerouting...", "error");
                router.push('/lobby');
            }
        } finally {
            if (isInitial) setIsFetchingData(false);
        }
    }, [id, user, router, addToast]);

    // Initial Load
    useEffect(() => {
        fetchWorldData(true);
    }, [fetchWorldData]);

    // Live Polling (Only when looking at the Hall View)
    useEffect(() => {
        if (isFetchingData || selectedMachine || !user) return;
        
        const pollInterval = setInterval(() => {
            fetchWorldData(false);
        }, 10000); // Sync floor every 10s
        
        return () => clearInterval(pollInterval);
    }, [isFetchingData, selectedMachine, user, fetchWorldData]);


    // --- 2. MACHINE INTERACTION HANDLERS ---
    const handleSelect = async (m) => {
        if (isEntering) return; // Prevent double-click spam
        
        if (m.status === 'occupied' && parseInt(m.current_user_id) !== parseInt(user.id)) {
            addToast("Secure Link Denied: Machine currently occupied by another operative.", "error");
            return;
        }
        
        if (m.status === 'maintenance') {
            addToast("Unit Offline: Scheduled for maintenance.", "error");
            return;
        }

        setIsEntering(true);
        try {
            // Attempt cryptographic handshake with machine
            const res = await gameApi.enterMachine(m.id);
            
            if (res.data.status === 'success') {
                 // Link established. Inject session token and transition view.
                 setSelectedMachine({ ...m, session_token: res.data.session_token });
                 addToast("Secure link established. Initializing interface...", "success");
            } else {
                 throw new Error(res.data.message || 'Unknown error');
            }
        } catch (e) {
             console.error("Machine Link Error:", e);
             addToast(e.response?.data?.error || "Failed to establish secure link to machine.", "error");
             // Refresh machines immediately in case it was snagged by someone else
             fetchWorldData(false); 
        } finally {
             setIsEntering(false);
        }
    };

    const handleLeave = async () => {
        if (selectedMachine) {
            try { 
                await gameApi.leaveMachine(selectedMachine.id); 
                addToast("Link severed cleanly.", "info");
            } catch(e) {
                console.error("Disconnection error", e);
            }
        }
        setSelectedMachine(null);
        fetchWorldData(false); // Refresh floor immediately upon return
    };


    // --- 3. RENDER STAGES ---
    if (loading || isFetchingData || !island) {
        return (
            <div className="bg-[#050505] min-h-screen text-cyan-500 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Circuit Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black"></div>
                
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 border-t-2 border-r-2 border-cyan-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-b-2 border-l-2 border-blue-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                        <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-black italic tracking-widest text-lg text-white drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">ACCESSING SECTOR</span>
                        <span className="font-mono text-[10px] text-cyan-500 tracking-[0.3em] uppercase mt-1 animate-pulse">Decrypting Matrix...</span>
                    </div>
                </div>
            </div>
        );
    }

    // --- 4. SEAMLESS VIEW TRANSITIONS ---
    const viewVariants = {
        enter: (direction) => ({
            opacity: 0,
            scale: direction > 0 ? 1.05 : 0.95,
            filter: "blur(10px)",
        }),
        center: {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
        },
        exit: (direction) => ({
            opacity: 0,
            scale: direction > 0 ? 0.95 : 1.05,
            filter: "blur(10px)",
            transition: { duration: 0.4, ease: "easeIn" }
        })
    };

    return (
        <div className="bg-[#050505] min-h-screen relative overflow-hidden">
            <AnimatePresence mode="wait" custom={selectedMachine ? 1 : -1}>
                {selectedMachine ? (
                    <motion.div
                        key="play"
                        custom={1}
                        variants={viewVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0 z-10"
                    >
                        <PlayView 
                            machine={selectedMachine} 
                            island={island} 
                            onLeave={handleLeave} 
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="hall"
                        custom={-1}
                        variants={viewVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0 z-10"
                    >
                        <HallView 
                            island={island} 
                            machines={machines} 
                            user={user} 
                            onSelectMachine={handleSelect} 
                            onBack={() => router.push('/lobby')} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global entering overlay to block touches while handshake occurs */}
            {isEntering && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center cursor-wait"></div>
            )}
        </div>
    );
}