import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Dynamically generate the paths for all 35 island symbols (5 islands * 7 symbols)
const ISLAND_SYMBOLS = Array.from({ length: 5 }).flatMap((_, islandIndex) => 
    Array.from({ length: 7 }).map((_, symbolIndex) => 
        `/assets/symbols/island${islandIndex + 1}/${symbolIndex + 1}.svg`
    )
);

// Global heavy assets
const HEAVY_ASSETS = [
    '/assets/characters/luna.png', '/assets/characters/mika.png', '/assets/characters/kira.png',
    '/assets/characters/yami.png', '/assets/characters/glacia.png', '/assets/characters/sky.png',
    '/assets/characters/ivy.png', '/assets/characters/cyber.png', '/assets/characters/penny.png',
    '/assets/characters/void.png',
    '/assets/machines/belly_1.png', '/assets/machines/belly_2.png', '/assets/machines/belly_3.png',
    '/assets/machines/belly_4.png', '/assets/machines/belly_5.png',
    ...ISLAND_SYMBOLS
];

export const useAssetPreloader = () => {
    const [progress, setProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // 1. FAST PATH: Check if assets are already cached in this browser
        const isCached = localStorage.getItem('suro_assets_cached') === 'v6.9';
        
        if (isCached) {
            setLoaded(true);
            setProgress(100);
            
            // Silently refresh the cache in the background without blocking UI
            HEAVY_ASSETS.forEach(src => {
                const img = new Image();
                img.src = src;
            });
            return;
        }

        // 2. FULL BOOT SEQUENCE (First time or cache cleared)
        let loadedCount = 0;
        const total = HEAVY_ASSETS.length;

        const loadImage = (src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = resolve;
                img.onerror = resolve; // Continue even if one fails to prevent soft-locks
            });
        };

        const loadAll = async () => {
            // Process in chunks to prevent freezing the main thread
            const chunkSize = 5;
            for (let i = 0; i < total; i += chunkSize) {
                const chunk = HEAVY_ASSETS.slice(i, i + chunkSize);
                await Promise.all(chunk.map(async (src) => {
                    await loadImage(src);
                    loadedCount++;
                    setProgress(Math.round((loadedCount / total) * 100));
                }));
            }

            // Mark as cached for future visits
            localStorage.setItem('suro_assets_cached', 'v6.9');
            
            // Slight delay to let the 100% animation finish
            setTimeout(() => {
                setLoaded(true);
            }, 800);
        };

        loadAll();
    }, []);

    return { progress, loaded };
};