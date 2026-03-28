import { useState, useEffect } from 'react';

// Dynamically generate the paths for all 35 island symbols (5 islands * 7 symbols)
const ISLAND_SYMBOLS = Array.from({ length: 5 }).flatMap((_, islandIndex) => 
    Array.from({ length: 7 }).map((_, symbolIndex) => 
        `/assets/symbols/island${islandIndex + 1}/${symbolIndex + 1}.svg`
    )
);

// List of critical assets to cache immediately
const CRITICAL_ASSETS = [
    // Characters (PNGs) - All 10 kept for the Gacha/Inventory system
    '/assets/characters/luna.png',
    '/assets/characters/mika.png',
    '/assets/characters/kira.png',
    '/assets/characters/yami.png',
    '/assets/characters/glacia.png',
    // '/assets/characters/sky.png',
    // '/assets/characters/ivy.png',
    // '/assets/characters/cyber.png',
    // '/assets/characters/penny.png',
    // '/assets/characters/void.png',

    // Machine Bellies (Strictly 5 for V3 Islands)
    // Note: Headers were removed as the cabinet now uses Live Holographic LEDs
    '/assets/machines/belly_1.png',
    '/assets/machines/belly_2.png',
    '/assets/machines/belly_3.png',
    '/assets/machines/belly_4.png',
    '/assets/machines/belly_5.png',

    // Dynamic Island Symbols (5 islands x 7 symbols = 35 SVGs)
    ...ISLAND_SYMBOLS
];

export const useAssetPreloader = () => {
    const [progress, setProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let loadedCount = 0;
        const total = CRITICAL_ASSETS.length;

        const loadImage = (src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = resolve;
                img.onerror = resolve; // Continue even if one fails
            });
        };

        const loadAll = async () => {
            const promises = CRITICAL_ASSETS.map(async (src) => {
                await loadImage(src);
                loadedCount++;
                setProgress(Math.round((loadedCount / total) * 100));
            });

            await Promise.all(promises);
            setLoaded(true);
        };

        loadAll();
    }, []);

    return { progress, loaded };
};