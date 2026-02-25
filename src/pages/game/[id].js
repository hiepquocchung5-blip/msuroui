import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { game as gameApi } from '../../services/api';
import { Loader2 } from 'lucide-react';
import HallView from '../../components/game/HallView';
import PlayView from '../../components/game/PlayView';

// Opt-out of Static Generation (SSG) for this dynamic route.
// This prevents "Collecting page data" build errors (like the Analytics crash) 
// by explicitly telling Next.js to render this page on the server/client on-demand.
export async function getServerSideProps(context) {
    return {
        props: {
            resolvedId: context.params.id
        }
    };
}

export default function GameContainer({ resolvedId }) {
    const router = useRouter();
    // Use resolvedId from SSR to prevent hydration issues if router.query is not ready
    const id = router.query.id || resolvedId;
    const { user, updateBalance, loading } = useAuth();
    
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
    const handleSelect = async (m) => {
        if (m.status === 'occupied' && m.current_user_id !== user.id) {
            alert("This machine is occupied by another player.");
            return;
        }
        try {
            // Optimistic selection
            setSelectedMachine(m);
            // Server lock
            await gameApi.enterMachine(m.id);
        } catch (e) { 
            console.error("Enter Machine Error", e); 
        }
    };

    const handleLeave = async () => {
        if (selectedMachine) {
            try { await gameApi.leaveMachine(selectedMachine.id); } catch(e){}
        }
        setSelectedMachine(null);
    };

    if (loading || !island) {
        return (
            <div className="bg-black min-h-screen text-cyan-500 flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" /> Loading World...
            </div>
        );
    }

    if (selectedMachine) {
        return (
            <PlayView 
                machine={selectedMachine} 
                island={island} 
                user={user} 
                onLeave={handleLeave} 
                updateBalance={updateBalance} 
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