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
    
    // --- PACHISLOT MECHANICS (Navi-Oshi & Summaries) ---
    const [freeSpins, setFreeSpins] = useState(0); 
    const [bonusMode, setBonusMode] = useState(null); 
    const [bonusSpinsLeft, setBonusSpinsLeft] = useState(0);
    const [atSequence, setAtSequence] = useState([]);
    const [atCurrentStep, setAtCurrentStep] = useState(0);
    const [bonusTotalWin, setBonusTotalWin] = useState(0);
    const [showBonusSummary, setShowBonusSummary] = useState(false);

    // --- RESULTS STATE ---
    const [lastWin, setLastWin] = useState(0);
    const [winStreak, setWinStreak] = useState(0); 
    const [isJackpot, setIsJackpot] = useState(false); 
    const [levelUpData, setLevelUpData] = useState(null);
    
    // --- CONTROL STATE ---
    const [sessionToken, setSessionToken] = useState(null); 
    const [autoPlay, setAutoPlay] = useState(false);
    const [turboMode, setTurboMode] = useState(false); 
    const [error, setError] = useState(null);

    // --- REFS FOR STABLE CALLBACKS (Meoshi Implementation) ---
    const timers = useRef([]);
    const spinDataRef = useRef(null); 
    const currentBetRef = useRef(0);
    const autoPlayRef = useRef(autoPlay);
    const turboModeRef = useRef(turboMode);
    const spinRef = useRef(null); 

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
        
        // Track Bonus Winnings Accumulator
        if (data.bonus_mode) {
            setBonusTotalWin(prev => prev + data.win_amount);
        }

        // Trigger Summary Modal if Bonus just ended
        if (bonusMode !== null && !data.bonus_mode) {
            setShowBonusSummary(true);
            setAutoPlay(false); // Force stop to show summary
        }

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

        // Loop Autoplay if active and no popups
        if (autoPlayRef.current && !showBonusSummary && !data.level_up && !data.is_jackpot) {
            timers.current.push(setTimeout(() => {
                if (spinRef.current) spinRef.current(currentBetAmount);
            }, turboModeRef.current ? 500 : 1500));
        }
    }, [updateBalance, bonusMode, showBonusSummary]);

    // 2. Meoshi (Skill Stop) Logic with Navi-Oshi Guard
    const stopReel = useCallback((index) => {
        setIsSpinning(prevSpinning => {
            if (!prevSpinning[index] || !spinDataRef.current) return prevSpinning;

            // Navi-Oshi Guard: Force player to hit the buttons in the generated order during AT
            setAtCurrentStep(currentStep => {
                if (atSequence.length > 0 && !autoPlayRef.current) {
                    if (atSequence[currentStep] !== index) {
                        return currentStep; // Return early, don't update state
                    }
                    return currentStep + 1; // Valid press, increment step
                }
                return currentStep;
            });

            // Re-check sequence to prevent reel stop if guard above failed
            // React state is async, so we manually evaluate the array condition
            let isValid = true;
            if (atSequence.length > 0 && !autoPlayRef.current) {
                // Find how many reels are currently stopped to determine current index in sequence
                const stoppedCount = prevSpinning.filter(s => !s).length;
                if (atSequence[stoppedCount] !== index) isValid = false;
            }

            if (!isValid) return prevSpinning;

            const data = spinDataRef.current;
            
            setReels(prevReels => {
                const nextReels = [...prevReels];
                if (index === 0) { nextReels[0]=data.stops[0]; nextReels[3]=data.stops[3]; nextReels[6]=data.stops[6]; }
                if (index === 1) { nextReels[1]=data.stops[1]; nextReels[4]=data.stops[4]; nextReels[7]=data.stops[7]; }
                if (index === 2) { nextReels[2]=data.stops[2]; nextReels[5]=data.stops[5]; nextReels[8]=data.stops[8]; }
                return nextReels;
            });

            const nextSpinning = [...prevSpinning];
            nextSpinning[index] = false;
            
            if (!nextSpinning.some(s => s)) {
                setIsTeaser(false);
                handlePostSpinEffects(data, currentBetRef.current);
                spinDataRef.current = null; 
            }
            
            return nextSpinning;
        });
    }, [handlePostSpinEffects, atSequence]);

    // 3. Core Spin Trigger
    const spin = useCallback(async (betAmount) => {
        if (!user) return;
        
        const actualBet = (freeSpins > 0 || bonusMode) ? 0 : betAmount;
        if (parseFloat(user.balance) < actualBet) {
            setError("Insufficient Funds"); setAutoPlay(false); return;
        }

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

            spinDataRef.current = data;
            currentBetRef.current = betAmount;

            // Generate AT Sequence if in Bonus Mode
            if (data.bonus_spins_left > 0 || data.bonus_mode) {
                setAtSequence([0, 1, 2].sort(() => Math.random() - 0.5));
                setAtCurrentStep(0);
            } else {
                setAtSequence([]);
            }

            if (data.is_teaser) setIsTeaser(true);

            if (autoPlayRef.current) {
                const baseTime = turboModeRef.current ? 150 : 400;
                
                // If in AT mode with AutoPlay, we must execute stops in the correct order visually
                let order = data.bonus_spins_left > 0 ? [0,1,2].sort(() => Math.random() - 0.5) : [0, 1, 2];
                setAtSequence(order); // Sync visually
                
                timers.current.push(setTimeout(() => stopReel(order[0]), baseTime));
                timers.current.push(setTimeout(() => stopReel(order[1]), baseTime * 2));
                
                let finalReelDelay = baseTime * 3;
                if ((data.is_teaser || data.win_amount > betAmount * 20) && !turboModeRef.current) {
                    finalReelDelay = 2500; 
                }
                timers.current.push(setTimeout(() => stopReel(order[2]), finalReelDelay));
                
            } else {
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

    useEffect(() => { spinRef.current = spin; }, [spin]);

    const clearBonusTotal = () => {
        setShowBonusSummary(false);
        setBonusTotalWin(0);
    };

    return {
        reels, winningLines, lastWin, winStreak,
        isSpinning, isTeaser, isJackpot, setIsJackpot, error, sessionToken,
        freeSpins, bonusMode, bonusSpinsLeft, atSequence, atCurrentStep,
        showBonusSummary, bonusTotalWin, clearBonusTotal, levelUpData, setLevelUpData,
        autoPlay, setAutoPlay, turboMode, setTurboMode,
        spin, stopReel, setLastWin
    };
};