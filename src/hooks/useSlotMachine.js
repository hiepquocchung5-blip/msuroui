import { useState, useCallback, useRef, useEffect } from 'react';
import { game } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useSlotMachine = (machineId, islandId) => {
    const { user, updateBalance } = useAuth();
    
    // --- GAME STATE (Now 3x3 Grid = 9 items) ---
    const [reels, setReels] = useState([7, 7, 7, 7, 7, 7, 7, 7, 7]); 
    const [winningLines, setWinningLines] = useState([]); // Array of line indices that won
    const [isSpinning, setIsSpinning] = useState([false, false, false]); // Spinning state per COLUMN
    const [isTeaser, setIsTeaser] = useState(false); 
    
    // --- RESULTS STATE ---
    const [lastWin, setLastWin] = useState(0);
    const [winStreak, setWinStreak] = useState(0); 
    const [isJackpot, setIsJackpot] = useState(false); 
    const [mysteryItem, setMysteryItem] = useState(null); 
    
    // --- SPECIAL MECHANICS STATE ---
    const [lockedReels, setLockedReels] = useState([false, false, false]); 
    const [expandedReels, setExpandedReels] = useState([false, false, false]); 
    const [avalancheTriggered, setAvalancheTriggered] = useState(false); 

    // --- CONTROL STATE ---
    const [sessionToken, setSessionToken] = useState(null); 
    const [autoPlay, setAutoPlay] = useState(false);
    const [turboMode, setTurboMode] = useState(false); 
    const [error, setError] = useState(null);

    const timers = useRef([]);

    const clearTimers = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    };

    useEffect(() => {
        return () => clearTimers();
    }, []);

    const enter = useCallback(async () => {
        if(!machineId) return;
        try {
            const res = await game.enterMachine(machineId);
            if (res.data.status === 'success') {
                setSessionToken(res.data.session_token);
                setError(null);
            }
        } catch (e) { 
            setError("Failed to connect to machine."); 
        }
    }, [machineId]);

    useEffect(() => { if(machineId) enter(); }, [machineId, enter]);

    // 2. SPIN LOGIC
    const spin = useCallback(async (betAmount) => {
        if (!user) return;
        if (parseFloat(user.balance) < betAmount) {
            setError("Insufficient Funds");
            setAutoPlay(false);
            return;
        }

        // Reset Visuals
        if (islandId !== 4 || winStreak === 0) {
             setLockedReels([false, false, false]);
        }
        
        setIsSpinning(prev => prev.map((val, i) => lockedReels[i] ? false : true));
        setWinningLines([]); // Clear previous lines
        setExpandedReels([false, false, false]);
        setAvalancheTriggered(false);
        setIsTeaser(false);
        setLastWin(0);
        setIsJackpot(false);
        setMysteryItem(null);
        setError(null);
        clearTimers();

        try {
            const res = await game.spin(machineId, betAmount, sessionToken);
            const data = res.data;

            if (data.status !== 'success') throw new Error(data.error || "Spin Failed");
            if (data.session_token) setSessionToken(data.session_token);

            const baseTime = turboMode ? 150 : 400;
            
            // Render columns stopping one by one.
            // data.stops is a flat array [0..8]. 
            // Col 1 = [0, 3, 6] | Col 2 = [1, 4, 7] | Col 3 = [2, 5, 8]
            
            // --- REEL 1 STOP ---
            if (!lockedReels[0]) {
                timers.current.push(setTimeout(() => {
                    setReels(prev => {
                        const next = [...prev];
                        next[0] = data.stops[0]; next[3] = data.stops[3]; next[6] = data.stops[6];
                        return next;
                    });
                    setIsSpinning(prev => [false, prev[1], prev[2]]);
                }, baseTime));
            }

            // --- REEL 2 STOP ---
            if (!lockedReels[1]) {
                timers.current.push(setTimeout(() => {
                    setReels(prev => {
                        const next = [...prev];
                        next[1] = data.stops[1]; next[4] = data.stops[4]; next[7] = data.stops[7];
                        return next;
                    });
                    setIsSpinning(prev => [prev[0], false, prev[2]]);
                    if (data.is_teaser && !turboMode) setIsTeaser(true); 
                }, baseTime * 2));
            }

            // --- REEL 3 STOP ---
            let reel3Delay = baseTime * 3;
            if (data.is_teaser && !turboMode) reel3Delay = 2500;

            if (!lockedReels[2]) {
                timers.current.push(setTimeout(() => {
                    setReels(data.stops);
                    setIsSpinning([false, false, false]);
                    setIsTeaser(false);
                    handlePostSpinEffects(data);
                }, reel3Delay));
            } else {
                 timers.current.push(setTimeout(() => handlePostSpinEffects(data), baseTime * 2 + 100));
            }

        } catch (err) {
            if (err.response?.status === 429) setError("Cooling down...");
            else if (err.message?.includes("Session")) { setError("Session refreshed."); enter(); }
            else setError(err.message || "Connection Error");
            setAutoPlay(false);
            setIsSpinning([false, false, false]);
        }
    }, [user, machineId, sessionToken, autoPlay, turboMode, updateBalance, enter, islandId, lockedReels]);

    const handlePostSpinEffects = (data) => {
        if (data.winning_lines) {
            setWinningLines(data.winning_lines);
        }

        updateBalance(data.new_balance);
        
        if (data.win_amount > 0) {
            setLastWin(data.win_amount);
            setWinStreak(prev => prev + 1);
            if (data.is_jackpot) setIsJackpot(true);
        } else {
            setWinStreak(0);
        }
        
        if (data.mystery_item) setMysteryItem(data.mystery_item);

        if (autoPlay) {
            if (data.is_jackpot) setAutoPlay(false);
            else timers.current.push(setTimeout(() => spin(data.bet_amount || 1000), turboMode ? 500 : 1500));
        }
    };

    const stopReel = (index) => {};

    return {
        reels, winningLines, lastWin, winStreak, mysteryItem,
        isSpinning, isTeaser, isJackpot, error, sessionToken,
        expandedReels, lockedReels, avalancheTriggered,
        autoPlay, setAutoPlay, turboMode, setTurboMode,
        spin, stopReel, setLastWin
    };
};