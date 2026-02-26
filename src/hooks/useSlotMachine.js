import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useSlotMachine = (machineId, islandId) => {
    const { user, updateBalance } = useAuth();
    
    // --- GAME STATE ---
    const [reels, setReels] = useState([7, 7, 7, 7, 7, 7, 7, 7, 7]); 
    const [winningLines, setWinningLines] = useState([]); 
    const [isSpinning, setIsSpinning] = useState([false, false, false]); 
    const [isTeaser, setIsTeaser] = useState(false); 
    const [isReachEye, setIsReachEye] = useState(false);
    const [isFreeze, setIsFreeze] = useState(false);
    
    // --- LEVIATHAN v5 TELEMETRY ---
    const [freeSpins, setFreeSpins] = useState(0); 
    const [bonusMode, setBonusMode] = useState(null); 
    const [bonusSpinsLeft, setBonusSpinsLeft] = useState(0);
    const [lapsSinceBonus, setLapsSinceBonus] = useState(0);
    const [momentumMult, setMomentumMult] = useState(1.0);
    const [inZone, setInZone] = useState(false);

    // --- AT SEQUENCING & SUMMARIES ---
    const [atSequence, setAtSequence] = useState([]);
    const [atCurrentStep, setAtCurrentStep] = useState(0);
    const [bonusTotalWin, setBonusTotalWin] = useState(0);
    const [showBonusSummary, setShowBonusSummary] = useState(false);

    // --- RESULTS STATE ---
    const [lastWin, setLastWin] = useState(0);
    const [winStreak, setWinStreak] = useState(0); 
    const [isJackpot, setIsJackpot] = useState(false); 
    const [levelUpData, setLevelUpData] = useState(null);
    const [error, setError] = useState(null);
    
    // --- CONTROL STATE ---
    const [sessionToken, setSessionToken] = useState(null); 
    const [autoPlay, setAutoPlay] = useState(false);
    const [turboMode, setTurboMode] = useState(false); 

    // --- REFS FOR STABLE CALLBACKS ---
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

    // 1. Enter Machine & Get Initial Token
    const enter = useCallback(async () => {
        if(!machineId) return;
        try {
            const res = await api.post('/game/machine_actions.php', { action: 'enter', machine_id: machineId });
            if (res.data.status === 'success') {
                setSessionToken(res.data.session_token);
                setError(null);
            }
        } catch (e) { setError(e.response?.data?.error || "Failed to connect to machine."); }
    }, [machineId]);

    useEffect(() => { if(machineId) enter(); }, [machineId, enter]);

    // 2. Post-Spin Processor
    const handlePostSpinEffects = useCallback((data, currentBetAmount) => {
        setWinningLines(data.winning_lines || []);
        
        // Update Balance
        if (data.new_balance !== undefined) {
            updateBalance(data.new_balance);
        }
        
        // Track Bonus Winnings
        if (data.bonus_mode) {
            setBonusTotalWin(prev => prev + data.win_amount);
        }

        // Trigger Summary Modal if Bonus just ended
        if (bonusMode !== null && !data.bonus_mode) {
            setShowBonusSummary(true);
            setAutoPlay(false); 
        }

        // Update Leviathan States
        setFreeSpins(data.free_spins || 0);
        setBonusMode(data.bonus_mode || null);
        setBonusSpinsLeft(data.bonus_spins_left || 0);
        setLapsSinceBonus(data.laps_since_bonus || 0);
        setMomentumMult(data.momentum_multiplier || 1.0);
        setInZone(data.in_zone || false);
        setIsJackpot(data.is_jackpot || false);
        setLevelUpData(data.level_up || null);

        if (data.win_amount > 0) {
            setLastWin(data.win_amount);
            setWinStreak(prev => prev + 1);
        } else {
            setLastWin(0);
            setWinStreak(0);
        }

        // Loop Autoplay
        if (autoPlayRef.current && !showBonusSummary && !data.level_up && !data.is_jackpot && !data.is_freeze) {
            timers.current.push(setTimeout(() => {
                if (spinRef.current) spinRef.current(currentBetAmount);
            }, turboModeRef.current ? 400 : 1200));
        }
    }, [updateBalance, bonusMode, showBonusSummary]);

    // 3. Skill Stop Logic
    const stopReel = useCallback((index) => {
        setIsSpinning(prevSpinning => {
            if (!prevSpinning[index] || !spinDataRef.current) return prevSpinning;

            // Enforce Navi-Oshi Order
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

    // 4. Core Spin Trigger
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
        setIsReachEye(false);
        setIsFreeze(false);
        setError(null);
        clearTimers();

        try {
            const res = await api.post('/game/spin.php', {
                machine_id: machineId,
                bet_amount: betAmount,
                session_token: sessionToken
            });
            
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
                if ((data.is_teaser || data.win_amount > betAmount * 20) && !turboModeRef.current) {
                    finalReelDelay = 2000; 
                }
                timers.current.push(setTimeout(() => stopReel(order[2]), finalReelDelay));
            } else {
                // Server Timeout Failsafe
                timers.current.push(setTimeout(() => stopReel(0), 15000));
                timers.current.push(setTimeout(() => stopReel(1), 15500));
                timers.current.push(setTimeout(() => stopReel(2), 16000));
            }

        } catch (err) {
            const errMsg = err.response?.data?.error || err.message;
            setError(errMsg);
            if (errMsg.includes("sync")) enter(); // Auto-recover session
            setAutoPlay(false); 
            setIsSpinning([false, false, false]);
        }
    }, [user, machineId, sessionToken, freeSpins, bonusMode, enter, stopReel]);

    useEffect(() => { spinRef.current = spin; }, [spin]);

    const clearBonusTotal = () => {
        setShowBonusSummary(false);
        setBonusTotalWin(0);
    };

    return {
        reels, winningLines, lastWin, winStreak,
        isSpinning, isTeaser, isReachEye, isFreeze, isJackpot, setIsJackpot, error,
        freeSpins, bonusMode, bonusSpinsLeft, atSequence, atCurrentStep,
        lapsSinceBonus, momentumMult, inZone,
        showBonusSummary, bonusTotalWin, clearBonusTotal, levelUpData, setLevelUpData,
        autoPlay, setAutoPlay, turboMode, setTurboMode,
        spin, stopReel, setLastWin
    };
};