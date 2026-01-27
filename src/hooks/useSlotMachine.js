import { useState, useCallback, useRef, useEffect } from 'react';
import { game } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useSlotMachine = (machineId, islandId) => {
    const { user, updateBalance } = useAuth();
    
    // --- GAME STATE ---
    const [reels, setReels] = useState([7, 7, 7]); // Current Symbols
    const [isSpinning, setIsSpinning] = useState([false, false, false]); // Reel animation state
    const [isTeaser, setIsTeaser] = useState(false); // "Near Miss" suspense flag
    
    // --- RESULTS STATE ---
    const [lastWin, setLastWin] = useState(0);
    const [winStreak, setWinStreak] = useState(0); // Consecutive wins
    const [isJackpot, setIsJackpot] = useState(false); // Grand Jackpot Triggered
    const [mysteryItem, setMysteryItem] = useState(null); // Bonus Drops
    
    // --- SPECIAL MECHANICS STATE ---
    const [lockedReels, setLockedReels] = useState([false, false, false]); // For Sticky Respins
    const [expandedReels, setExpandedReels] = useState([false, false, false]); // For Expanding Wilds
    const [avalancheTriggered, setAvalancheTriggered] = useState(false); // For Avalanche

    // --- CONTROL STATE ---
    const [sessionToken, setSessionToken] = useState(null); // Anti-Replay Token
    const [autoPlay, setAutoPlay] = useState(false);
    const [turboMode, setTurboMode] = useState(false); // Fast Spin Mode
    const [error, setError] = useState(null);

    // Timer management to prevent memory leaks or overlapping animations
    const timers = useRef([]);

    const clearTimers = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => clearTimers();
    }, []);

    // 1. ENTER MACHINE (Initialize Session)
    const enter = useCallback(async () => {
        if(!machineId) return;
        try {
            const res = await game.enterMachine(machineId);
            if (res.data.status === 'success') {
                setSessionToken(res.data.session_token);
                setError(null);
            }
        } catch (e) { 
            console.error("Enter Machine Error", e);
            setError("Failed to connect to machine."); 
        }
    }, [machineId]);

    // Auto-enter when machineId changes
    useEffect(() => { if(machineId) enter(); }, [machineId, enter]);

    // 2. SPIN LOGIC
    const spin = useCallback(async (betAmount) => {
        // Validation
        if (!user) return;
        if (parseFloat(user.balance) < betAmount) {
            setError("Insufficient Funds");
            setAutoPlay(false);
            return;
        }

        // Reset Visuals
        // Handle Sticky Respins (Noctyra - ID 4)
        if (islandId === 4 && winStreak > 0) {
            // Keep winning symbols spinning? No, usually sticky means they stay.
            // Simplified: If locked, don't spin that reel visual, but API handles logic.
            // For this frontend sim, we'll assume API handles the result and we just animate non-locked.
            // Resetting lock for new spin unless it's a respin chain.
        } else {
             setLockedReels([false, false, false]);
        }
        
        setIsSpinning(prev => prev.map((val, i) => lockedReels[i] ? false : true)); // Only spin unlocked
        setExpandedReels([false, false, false]);
        setAvalancheTriggered(false);
        setIsTeaser(false);
        setLastWin(0);
        setIsJackpot(false);
        setMysteryItem(null);
        setError(null);
        clearTimers();

        try {
            // API Call
            const res = await game.spin(machineId, betAmount, sessionToken);
            const data = res.data;

            if (data.status !== 'success') {
                throw new Error(data.error || "Spin Failed");
            }

            // Update Token for next spin (Rotation)
            if (data.session_token) setSessionToken(data.session_token);

            // Calculate Timings (Turbo vs Normal)
            const baseTime = turboMode ? 150 : 400; // ms per reel stop
            
            // --- REEL 1 STOP ---
            if (!lockedReels[0]) {
                timers.current.push(setTimeout(() => {
                    setReels(prev => [data.stops[0], prev[1], prev[2]]);
                    setIsSpinning(prev => [false, prev[1], prev[2]]);
                }, baseTime));
            }

            // --- REEL 2 STOP ---
            if (!lockedReels[1]) {
                timers.current.push(setTimeout(() => {
                    setReels(prev => [prev[0], data.stops[1], prev[2]]);
                    setIsSpinning(prev => [prev[0], false, prev[2]]);
                    
                    // Only trigger teaser if NOT in turbo mode
                    if (data.is_teaser && !turboMode) {
                        setIsTeaser(true); 
                    }
                }, baseTime * 2));
            }

            // --- REEL 3 STOP ---
            // Normal: 1200ms | Teaser: 2500ms | Turbo: 450ms
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
                 // If 3rd is locked, trigger effects immediately after 2nd (or base delay)
                 timers.current.push(setTimeout(() => {
                     handlePostSpinEffects(data);
                 }, baseTime * 2 + 100));
            }

        } catch (err) {
            console.error("Spin Logic Error:", err);
            
            if (err.response && err.response.status === 429) {
                setError("Cooling down...");
                setAutoPlay(false); 
            } else if (err.message && err.message.includes("Session")) {
                 setError("Session refreshed.");
                 enter();
                 setAutoPlay(false);
            } else {
                setError(err.message || "Connection Error");
                setAutoPlay(false);
            }
            setIsSpinning([false, false, false]);
        }
    }, [user, machineId, sessionToken, autoPlay, turboMode, updateBalance, enter, islandId, lockedReels]);

    const handlePostSpinEffects = (data) => {
        // --- ISLAND MECHANICS VISUALS ---
        
        // 1. Inferna (Volcano) - Expanding Wilds
        if (islandId === 3 && data.win_amount > 0) {
             // Logic: If wild (e.g. 7 for now) is in winning combo, expand it
             // Simple visual mock: If win, expand random reel
             const r = Math.floor(Math.random() * 3);
             const newExpanded = [false, false, false];
             newExpanded[r] = true;
             setExpandedReels(newExpanded);
        }

        // 2. Glacia (Ice) - Avalanche
        if (islandId === 5 && data.win_amount > 0) {
            setAvalancheTriggered(true);
            // Visual: Symbols shatter, new ones fall (handled in View via CSS)
        }

        // 3. Noctyra (Moon) - Sticky Respins
        if (islandId === 4 && data.win_amount > 0) {
            // Lock winning reels (Simple mock: lock all if win)
            // Real logic needs individual symbol checking
            setLockedReels([true, true, true]);
        } else {
            setLockedReels([false, false, false]);
        }

        // Update Data
        updateBalance(data.new_balance);
        
        if (data.win_amount > 0) {
            setLastWin(data.win_amount);
            setWinStreak(prev => prev + 1);
            if (data.is_jackpot) setIsJackpot(true);
        } else {
            setWinStreak(0);
        }
        
        if (data.mystery_item) setMysteryItem(data.mystery_item);

        // Auto-Play Logic
        if (autoPlay) {
            if (data.is_jackpot) {
                setAutoPlay(false);
            } else {
                const nextSpinDelay = turboMode ? 500 : 1500;
                timers.current.push(setTimeout(() => spin(data.bet_amount || 1000), nextSpinDelay));
            }
        }
    };

    const stopReel = (index) => {
        // Placeholder
    };

    return {
        // Data
        reels,
        lastWin,
        winStreak,
        mysteryItem,
        
        // State Flags
        isSpinning,
        isTeaser,
        isJackpot,
        error,
        sessionToken,
        
        // Mechanics Flags
        expandedReels,
        lockedReels,
        avalancheTriggered,
        
        // Controls
        autoPlay, setAutoPlay,
        turboMode, setTurboMode,
        spin,
        stopReel,
        setLastWin
    };
};