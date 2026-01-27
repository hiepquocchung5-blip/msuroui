import { useEffect, useRef, useCallback } from 'react';

/**
 * useGameSound Hook
 * Handles game audio effects.
 * * Usage:
 * const { playSound } = useGameSound();
 * playSound('spin');
 */
export const useGameSound = (enabled = true) => {
    const audioRefs = useRef({});

    // Define sound map
    const SOUNDS = {
        spin: '/assets/sounds/spin_start.mp3',
        stop: '/assets/sounds/reel_stop.mp3',
        win: '/assets/sounds/win_small.mp3',
        bigwin: '/assets/sounds/win_big.mp3',
        click: '/assets/sounds/ui_click.mp3',
        bgm_lobby: '/assets/sounds/bgm_lobby.mp3',
    };

    useEffect(() => {
        // Preload sounds
        Object.keys(SOUNDS).forEach(key => {
            const audio = new Audio(SOUNDS[key]);
            audio.volume = 0.5;
            audioRefs.current[key] = audio;
        });
    }, []);

    const playSound = useCallback((type) => {
        if (!enabled || !audioRefs.current[type]) return;
        
        const sound = audioRefs.current[type];
        sound.currentTime = 0; // Reset to start
        
        // Randomize pitch slightly for repetitive sounds like 'stop'
        if(type === 'stop') {
            sound.playbackRate = 0.9 + Math.random() * 0.2;
        } else {
            sound.playbackRate = 1;
        }

        sound.play().catch(e => console.warn("Audio play blocked", e));
    }, [enabled]);

    return { playSound };
};