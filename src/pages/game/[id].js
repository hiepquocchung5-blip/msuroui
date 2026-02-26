import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { game as gameApi } from '../../services/api';
import { Loader2 } from 'lucide-react';
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
    
    const [island, setIsland] = useState(null);
    const [machines, setMachines] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState(null);

    // Fetch Data
    useEffect(() => {
        if (!id || !user) return;
        const fetchData = async () => {
            try {
                const [islandRes, machinesRes] = await Promise.all([
                    gameApi.getIslands(), 
                    gameApi.getMachines(id)
                ]);
                
                if (islandRes.data.status === 'success' && machinesRes.data.status === 'success') {
                    const foundIsland = islandRes.data.data.find(i => i.id === parseInt(id));
                    setIsland(foundIsland);
                    setMachines(machinesRes.data.machines);
                } else {
                    throw new Error("Failed to load game data");
                }
            } catch (e) {
                console.error("Load Error", e);
                router.push('/lobby');
            }
        };
        fetchData();
    }, [id, user, router]);

    // Handlers
    const handleSelect = (m) => {
        if (m.status === 'occupied' && m.current_user_id !== user.id) {
            alert("This machine is occupied by another player.");
            return;
        }
        
        // Optimistic selection. The PlayView mounts and useSlotMachine handles the API Enter.
        // This removes the "double enter" race condition causing the seating mismatch.
        setSelectedMachine(m);
    };

    const handleLeave = async () => {
        if (selectedMachine) {
            try { await gameApi.leaveMachine(selectedMachine.id); } catch(e){}
        }
        setSelectedMachine(null);
    };

    if (loading || !island) {
        return (
            <div className="bg-black min-h-screen text-cyan-500 flex flex-col gap-4 items-center justify-center">
                <Loader2 className="animate-spin w-12 h-12" /> 
                <span className="font-mono tracking-widest text-xs animate-pulse">LOADING WORLD DATA...</span>
            </div>
        );
    }

    if (selectedMachine) {
        return (
            <PlayView 
                machine={selectedMachine} 
                island={island} 
                onLeave={handleLeave} 
            />
        );
    }

    return (
        <HallView 
            island={island} 
            machines={machines} 
            user={user} 
            onSelectMachine={handleSelect} 
            onBack={() => router.push('/lobby')} 
        />
    );
}