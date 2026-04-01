import { useState, useEffect } from 'react';

/**
 * useSpinLoader
 * Isolates and fetches ONLY the specific assets (7 Symbols, 1 Background, 1 Character) 
 * required for the active game room, preventing memory leaks and optimizing speed.
 */
export const useSpinLoader = (islandId, charId) => {
    const [progress, setProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!islandId) return;

        setIsReady(false);
        setProgress(0);

        // Array of strict dependencies required before the slot machine can mount
        const assets = [
            `/assets/backgrounds/bg_${islandId}.jpg`,
            charId ? `/assets/characters/${charId}.png` : null,
            ...Array.from({ length: 7 }).map((_, i) => `/assets/symbols/island${islandId}/${i + 1}.svg`)
        ].filter(Boolean);

        let loaded = 0;
        const total = assets.length;

        const loadAsset = (src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = resolve;
                img.onerror = resolve; // Resolve on error so we don't soft-lock the user
            });
        };

        const mountSector = async () => {
            // Fetch and cache all SVG symbols and PNGs for this session in parallel
            await Promise.all(assets.map(async (src) => {
                await loadAsset(src);
                loaded++;
                setProgress(Math.round((loaded / total) * 100));
            }));

            // Add a slight cinematic buffer before dropping the loading screen
            setTimeout(() => {
                setIsReady(true);
            }, 800);
        };

        mountSector();

    }, [islandId, charId]);

    return { progress, isReady };
};