import { useState, useCallback, useRef, useEffect } from 'react';
import { game } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useSlotMachine = (machineId, islandId) => {
    const { user, updateBalance } = useAuth();
    
    // --- GAME STATE ---
    const [reels, setReels] = useState([7, 7, 7, 7, 7, 7, 7, 7, 7]); 
    const [winningLines, setWinningLines] = useState([]); 
    const [isSpinning, setIsSpinning] = useState([false, false, false]); 
    const [isTeaser, setIsTeaser] = useState(false); 
    
    // --- PACHISLOT MECHANICS ---
    const [freeSpins, setFreeSpins] = useState(0); 
    const [bonusMode, setBonusMode] = useState(null); 
    const [bonusSpinsLeft, setBonusSpinsLeft] = useState(0);

    // --- RESULTS STATE ---
    const [lastWin, setLastWin] = useState(0);
    const [winStreak, setWinStreak] = useState(0); 
    const [isJackpot, setIsJackpot] = useState(false); 
    
    // --- CONTROL STATE ---
    const [sessionToken, setSessionToken] = useState(null); 
    const [autoPlay, setAutoPlay] = useState(false);
    const [turboMode, setTurboMode] = useState(false); 
    const [error, setError] = useState(null);

    // --- REFS FOR STABLE CALLBACKS (Meoshi Implementation) ---
    const timers = useRef([]);
    const spinDataRef = useRef(null); // Stores the backend payload until the user stops the reels
    const currentBetRef = useRef(0);
    const autoPlayRef = useRef(autoPlay);
    const turboModeRef = useRef(turboMode);
    const spinRef = useRef(null); // Prevents circular dependency in useEffect looping

    // Sync state to refs for use inside callbacks without causing re-renders
    useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);
    useEffect(() => { turboModeRef.current = turboMode; }, [turboMode]);
    
    const clearTimers = () => { 
        timers.current.forEach(clearTimeout); 
        timers.current = []; 
    };
    
    useEffect(() => () => clearTimers(), []);

    const enter = useCallback(async () => {
        if(!machineId) return;
        try {
            const res = await game.enterMachine(machineId);
            if (res.data.status === 'success') {
                setSessionToken(res.data.session_token);
                setError(null);
            }
        } catch (e) { setError("Failed to connect to machine."); }
    }, [machineId]);

    useEffect(() => { if(machineId) enter(); }, [machineId, enter]);

    // 1. Post-Spin Processor
    const handlePostSpinEffects = useCallback((data, currentBetAmount) => {
        setWinningLines(data.winning_lines || []);
        updateBalance(data.new_balance);
        
        // Update Pachislot AT states
        setFreeSpins(data.free_spins);
        setBonusMode(data.bonus_mode);
        setBonusSpinsLeft(data.bonus_spins_left);

        if (data.win_amount > 0) {
            setLastWin(data.win_amount);
            setWinStreak(prev => prev + 1);
        } else {
            setWinStreak(0);
        }

        // Loop Autoplay if active
        if (autoPlayRef.current) {
            timers.current.push(setTimeout(() => {
                if (spinRef.current) spinRef.current(currentBetAmount);
            }, turboModeRef.current ? 500 : 1500));
        }
    }, [updateBalance]);

    // 2. Meoshi (Skill Stop) Logic
    const stopReel = useCallback((index) => {
        setIsSpinning(prevSpinning => {
            // Prevent stopping a reel that is already stopped, or if no spin data exists
            if (!prevSpinning[index] || !spinDataRef.current) return prevSpinning;

            const data = spinDataRef.current;
            
            // Map the specific column's data from the 1D array payload
            setReels(prevReels => {
                const nextReels = [...prevReels];
                if (index === 0) { nextReels[0]=data.stops[0]; nextReels[3]=data.stops[3]; nextReels[6]=data.stops[6]; }
                if (index === 1) { nextReels[1]=data.stops[1]; nextReels[4]=data.stops[4]; nextReels[7]=data.stops[7]; }
                if (index === 2) { nextReels[2]=data.stops[2]; nextReels[5]=data.stops[5]; nextReels[8]=data.stops[8]; }
                return nextReels;
            });

            // Mark this specific reel as stopped
            const nextSpinning = [...prevSpinning];
            nextSpinning[index] = false;
            
            // If all 3 reels are now stopped (none are true), evaluate the board
            if (!nextSpinning.some(s => s)) {
                setIsTeaser(false);
                handlePostSpinEffects(data, currentBetRef.current);
                spinDataRef.current = null; // Clear payload cache
            }
            
            return nextSpinning;
        });
    }, [handlePostSpinEffects]);

    // 3. Core Spin Trigger
    const spin = useCallback(async (betAmount) => {
        if (!user) return;
        
        // Prevent deduction if player has a free spin (Replay) or is in AT Bonus Mode
        const actualBet = (freeSpins > 0 || bonusMode) ? 0 : betAmount;
        if (parseFloat(user.balance) < actualBet) {
            setError("Insufficient Funds"); setAutoPlay(false); return;
        }

        // Lock UI into spinning state
        setIsSpinning([true, true, true]);
        setWinningLines([]);
        setLastWin(0);
        setIsJackpot(false);
        setIsTeaser(false);
        setError(null);
        clearTimers();

        try {
            const res = await game.spin(machineId, betAmount, sessionToken);
            const data = res.data;

            if (data.status !== 'success') throw new Error(data.error || "Spin Failed");
            if (data.session_token) setSessionToken(data.session_token);

            // Cache the backend result so stopReel() can access it when the user clicks
            spinDataRef.current = data;
            currentBetRef.current = betAmount;

            // Capture Teaser State immediately to trigger screen flash / audio
            if (data.is_teaser) setIsTeaser(true);

            if (autoPlayRef.current) {
                // AUTO PLAY SEQUENCE (Automated stops)
                const baseTime = turboModeRef.current ? 150 : 400;
                
                timers.current.push(setTimeout(() => stopReel(0), baseTime));
                timers.current.push(setTimeout(() => stopReel(1), baseTime * 2));
                
                // Suspense Engine: Delay 3rd reel automatically if huge win or near-miss
                let finalReelDelay = baseTime * 3;
                if ((data.is_teaser || data.win_amount > betAmount * 20) && !turboModeRef.current) {
                    finalReelDelay = 2500; 
                }
                timers.current.push(setTimeout(() => stopReel(2), finalReelDelay));
                
            } else {
                // MANUAL PLAY SEQUENCE (Authentic Meoshi)
                // We do NOTHING here. The reels spin infinitely until the player clicks the buttons in PlayView.js.
                
                // Server Failsafe: Auto-stop after 15 seconds if the user walks away from their screen
                timers.current.push(setTimeout(() => stopReel(0), 15000));
                timers.current.push(setTimeout(() => stopReel(1), 15500));
                timers.current.push(setTimeout(() => stopReel(2), 16000));
            }

        } catch (err) {
            if (err.message?.includes("Session")) { setError("Session refreshed."); enter(); }
            else setError(err.message || "Connection Error");
            setAutoPlay(false); setIsSpinning([false, false, false]);
        }
    }, [user, machineId, sessionToken, freeSpins, bonusMode, enter, stopReel]);

    // Keep spin stable for the interval loop
    useEffect(() => { spinRef.current = spin; }, [spin]);

    return {
        reels, winningLines, lastWin, winStreak,
        isSpinning, isTeaser, isJackpot, setIsJackpot, error, sessionToken,
        freeSpins, bonusMode, bonusSpinsLeft, 
        autoPlay, setAutoPlay, turboMode, setTurboMode,
        spin, stopReel, setLastWin
    };
};