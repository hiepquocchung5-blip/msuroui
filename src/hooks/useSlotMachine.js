import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Helper to generate a realistic initial 3x3 grid (Avoids 1/GJP to prevent false hype)
const generateInitialReels = () => {
    return Array.from({ length: 9 }, () => Math.floor(Math.random() * 6) + 2);
};

export const useSlotMachine = (machineId, islandId, initialSessionToken = null) => {
    const { user, updateBalance } = useAuth();
    
    // --- CORE GAME STATE ---
    // V7.8+ FIX: Replaced static 7s with a randomized organic grid on load
    const [reels, setReels] = useState(generateInitialReels()); 
    const [winningLines, setWinningLines] = useState([]); 
    const [isSpinning, setIsSpinning] = useState([false, false, false]); 
    const [isTeaser, setIsTeaser] = useState(false); 
    const [isReachEye, setIsReachEye] = useState(false);
    const [isFreeze, setIsFreeze] = useState(false);
    
    // --- LEVIATHAN TELEMETRY & TRUST ---
    const [freeSpins, setFreeSpins] = useState(0); 
    const [bonusMode, setBonusMode] = useState(null); 
    const [bonusSpinsLeft, setBonusSpinsLeft] = useState(0);
    const [lapsSinceBonus, setLapsSinceBonus] = useState(0);
    const [momentumMult, setMomentumMult] = useState(1.0);
    const [inZone, setInZone] = useState(false);
    const [pfData, setPfData] = useState(null); // Provably Fair Cryptographic State
    
    const [winTier, setWinTier] = useState('NONE'); 
    const [sessionWinStreak, setSessionWinStreak] = useState(0);
    const [streakMult, setStreakMult] = useState(1.0);
    const [volatility, setVolatility] = useState('medium');

    const [atSequence, setAtSequence] = useState([]);
    const [atCurrentStep, setAtCurrentStep] = useState(0);
    const [bonusTotalWin, setBonusTotalWin] = useState(0);
    const [showBonusSummary, setShowBonusSummary] = useState(false);

    const [lastWin, setLastWin] = useState(0);
    const [isJackpot, setIsJackpot] = useState(false); 
    const [levelUpData, setLevelUpData] = useState(null); 
    const [error, setError] = useState(null);
    
    // --- SMART AUTO-PLAY & AFK SYSTEM ---
    const [showIdleWarning, setShowIdleWarning] = useState(false);
    const [isIdleKicked, setIsIdleKicked] = useState(false); 
    const [autoPlay, setAutoPlay] = useState(false);
    const [turboMode, setTurboMode] = useState(false); 
    const [sessionToken, setSessionToken] = useState(initialSessionToken); 

    // --- REFS FOR STABLE CALLBACKS ---
    const idleTimerRef = useRef(null); 
    const warningTimerRef = useRef(null);
    const spinDataRef = useRef(null); 
    const currentBetRef = useRef(0);
    const autoPlayRef = useRef(autoPlay);
    const turboModeRef = useRef(turboMode);
    const spinRef = useRef(null); 
    const timers = useRef([]); 

    useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);
    useEffect(() => { turboModeRef.current = turboMode; }, [turboMode]);
    
    const clearTimers = useCallback(() => { 
        timers.current.forEach(clearTimeout); 
        timers.current = []; 
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    }, []);
    
    useEffect(() => () => clearTimers(), [clearTimers]);

    // --- SERVER HEARTBEAT ---
    useEffect(() => {
        let pingInterval;
        if (sessionToken && machineId && !isIdleKicked) {
            pingInterval = setInterval(() => {
                api.post('/game/machine_actions.php', { action: 'ping', machine_id: machineId })
                   .catch(() => {}); 
            }, 60000); 
        }
        return () => clearInterval(pingInterval);
    }, [sessionToken, machineId, isIdleKicked]);

    const leave = useCallback(async () => {
        clearTimers();
        setSessionToken(null);
        setAutoPlay(false);
        try {
            await api.post('/game/machine_actions.php', { action: 'leave', machine_id: machineId });
        } catch (e) {
            console.error("Failed to free machine cleanly", e);
        }
    }, [machineId, clearTimers]);

    const handleIdleTimeout = useCallback(async () => {
        setIsIdleKicked(true);
        setShowIdleWarning(false);
        setError("Disconnected due to 5 minutes of inactivity.");
        await leave();
    }, [leave]);

    const handleIdleWarning = useCallback(() => {
        if (autoPlayRef.current) return; 
        setShowIdleWarning(true);
    }, []);

    const resetIdleTimer = useCallback(() => {
        if (isIdleKicked) return;
        setShowIdleWarning(false);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        
        // 4 Minutes = Warning | 5 Minutes = Kick
        warningTimerRef.current = setTimeout(handleIdleWarning, 240000);
        idleTimerRef.current = setTimeout(handleIdleTimeout, 300000);
    }, [handleIdleTimeout, handleIdleWarning, isIdleKicked]);

    // 1. Enter Machine & Recover State
    const enter = useCallback(async () => {
        if(!machineId) return;
        try {
            const res = await api.post('/game/machine_actions.php', { action: 'enter', machine_id: machineId });
            if (res.data.status === 'success') {
                setSessionToken(res.data.session_token);
                setError(null);
                resetIdleTimer();

                if (res.data.recovered_state) {
                    const state = res.data.recovered_state;
                    setBonusMode(state.bonus_mode);
                    setBonusSpinsLeft(state.bonus_spins_left || 0);
                    setFreeSpins(state.free_spins || 0);
                    setLapsSinceBonus(state.laps_since_bonus || 0);
                    setSessionWinStreak(state.session_win_streak || 0);
                    // Also recover grid if available
                    if (state.last_grid) setReels(state.last_grid);
                }
            }
        } catch (e) { setError(e.response?.data?.error || "Failed to connect to machine."); }
    }, [machineId, resetIdleTimer]);

    useEffect(() => { 
        if(machineId && !initialSessionToken) enter(); 
    }, [machineId, initialSessionToken, enter]);

    // 2. Post-Spin Processor
    const handlePostSpinEffects = useCallback((data, currentBetAmount) => {
        setWinningLines(data.winning_lines || []);
        
        if (data.new_balance !== undefined) updateBalance(data.new_balance);
        if (data.bonus_mode) setBonusTotalWin(prev => prev + data.win_amount);

        if (bonusMode !== null && !data.bonus_mode) {
            setShowBonusSummary(true);
            setAutoPlay(false); 
        }

        setFreeSpins(data.free_spins || 0);
        setBonusMode(data.bonus_mode || null);
        setBonusSpinsLeft(data.bonus_spins_left || 0);
        setLapsSinceBonus(data.laps_since_bonus || 0);
        setMomentumMult(data.momentum_multiplier || 1.0);
        setInZone(data.in_zone || false);
        setIsJackpot(data.is_jackpot || false);
        setLevelUpData(data.level_up || null);
        if (data.provably_fair) setPfData(data.provably_fair);
        
        setWinTier(data.win_tier || 'NONE');
        setSessionWinStreak(data.session_win_streak || 0);
        setStreakMult(data.streak_multiplier || 1.0);
        setVolatility(data.volatility_mode || 'medium');

        if (data.win_amount > 0) {
            setLastWin(data.win_amount);
        } else {
            setLastWin(0);
        }

        let shouldInterruptAutoPlay = false;
        if (data.is_freeze || data.is_jackpot || (data.level_up && data.level_up.length > 0)) {
            shouldInterruptAutoPlay = true;
        } else if (data.bonus_mode && !bonusMode) {
            shouldInterruptAutoPlay = true;
        } else if (showBonusSummary) {
            shouldInterruptAutoPlay = true;
        }

        if (autoPlayRef.current) {
            if (shouldInterruptAutoPlay) {
                setAutoPlay(false);
            } else {
                timers.current.push(setTimeout(() => {
                    if (spinRef.current) spinRef.current(currentBetAmount);
                }, turboModeRef.current ? 400 : 1200));
            }
        }
    }, [updateBalance, bonusMode, showBonusSummary]);

    // 3. Skill Stop Logic
    const stopReel = useCallback((index) => {
        setIsSpinning(prevSpinning => {
            if (!prevSpinning[index] || !spinDataRef.current) return prevSpinning;

            setAtCurrentStep(currentStep => {
                if (atSequence.length > 0 && !autoPlayRef.current) {
                    if (atSequence[currentStep] !== index) return currentStep; 
                    return currentStep + 1;
                }
                return currentStep;
            });

            let isValid = true;
            if (atSequence.length > 0 && !autoPlayRef.current) {
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
                setIsReachEye(false);
                setIsFreeze(false);
                handlePostSpinEffects(data, currentBetRef.current);
                spinDataRef.current = null; 
            }
            
            return nextSpinning;
        });
    }, [handlePostSpinEffects, atSequence]);

    // 4. Core Spin API Trigger
    const spin = useCallback(async (betAmount) => {
        if (!user || !sessionToken) return; 
        
        resetIdleTimer();

        const actualBet = (freeSpins > 0 || bonusMode) ? 0 : betAmount;
        if (parseFloat(user.balance) < actualBet) {
            setError("Insufficient Funds"); setAutoPlay(false); return;
        }

        setIsSpinning([true, true, true]);
        setWinningLines([]);
        setLastWin(0);
        setWinTier('NONE');
        setIsJackpot(false);
        setIsTeaser(false);
        setIsReachEye(false);
        setIsFreeze(false);
        setError(null);
        clearTimers();

        try {
            const customClientSeed = typeof window !== 'undefined' ? localStorage.getItem('suro_client_seed') : null;

            const payload = {
                machine_id: machineId,
                bet_amount: betAmount,
                session_token: sessionToken
            };

            if (customClientSeed) {
                payload.client_seed = customClientSeed;
            }

            const res = await api.post('/game/spin.php', payload);
            
            const data = res.data;
            if (data.status !== 'success') throw new Error(data.error || "Spin Failed");
            if (data.session_token) setSessionToken(data.session_token);

            spinDataRef.current = data;
            currentBetRef.current = betAmount;

            if (data.bonus_spins_left > 0 || data.bonus_mode) {
                setAtSequence([0, 1, 2].sort(() => Math.random() - 0.5));
                setAtCurrentStep(0);
            } else {
                setAtSequence([]);
            }

            if (data.is_teaser) setIsTeaser(true);
            if (data.is_reach_eye) setIsReachEye(true);
            if (data.is_freeze) setIsFreeze(true);

            if (autoPlayRef.current) {
                const baseTime = turboModeRef.current ? 150 : 350;
                let order = data.bonus_spins_left > 0 ? [0,1,2].sort(() => Math.random() - 0.5) : [0, 1, 2];
                setAtSequence(order); 
                
                timers.current.push(setTimeout(() => stopReel(order[0]), baseTime));
                timers.current.push(setTimeout(() => stopReel(order[1]), baseTime * 2));
                
                let finalReelDelay = baseTime * 3;
                if ((data.is_teaser || data.win_tier === 'MEGA' || data.win_tier === 'EPIC') && !turboModeRef.current) {
                    finalReelDelay = 2200; 
                }
                timers.current.push(setTimeout(() => stopReel(order[2]), finalReelDelay));
            } else {
                timers.current.push(setTimeout(() => stopReel(0), 3000));
                timers.current.push(setTimeout(() => stopReel(1), 3400));
                timers.current.push(setTimeout(() => stopReel(2), data.is_teaser ? 5000 : 3800)); 
            }

        } catch (err) {
            const responseError = err.response?.data?.error;
            let errMsg = err.message;

            if (responseError) {
                errMsg = typeof responseError === 'object' ? responseError.message : responseError;
            }

            setError(errMsg);

            if (typeof errMsg === 'string') {
                const lowerMsg = errMsg.toLowerCase();
                if (lowerMsg.includes("sync") || lowerMsg.includes("token") || lowerMsg.includes("mismatch")) {
                    console.warn("[V7 ENGINE] Stale session token detected. Re-establishing link...");
                    enter(); 
                }
            }

            setAutoPlay(false); 
            setIsSpinning([false, false, false]);
        }
    }, [user, machineId, sessionToken, freeSpins, bonusMode, enter, stopReel, resetIdleTimer, clearTimers]);

    useEffect(() => { spinRef.current = spin; }, [spin]);

    const clearBonusTotal = () => {
        setShowBonusSummary(false);
        setBonusTotalWin(0);
    };

    return {
        reels, winningLines, lastWin, 
        isSpinning, isTeaser, isReachEye, isFreeze, isJackpot, setIsJackpot, error,
        showIdleWarning, isIdleKicked, resetIdleTimer, leave,
        freeSpins, bonusMode, bonusSpinsLeft, atSequence, atCurrentStep,
        lapsSinceBonus, momentumMult, inZone, winTier, sessionWinStreak, streakMult, volatility,
        showBonusSummary, bonusTotalWin, clearBonusTotal, levelUpData, setLevelUpData,
        autoPlay, setAutoPlay, turboMode, setTurboMode,
        pfData, 
        spin, stopReel, setLastWin,
        isReady: !!sessionToken
    };
};