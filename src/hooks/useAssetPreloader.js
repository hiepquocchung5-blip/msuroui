import { useState, useEffect } from 'react';

// Dynamically generate the paths for all 35 island symbols (5 islands * 7 symbols)
const ISLAND_SYMBOLS = Array.from({ length: 5 }).flatMap((_, islandIndex) => 
    Array.from({ length: 7 }).map((_, symbolIndex) => 
        `/assets/symbols/island${islandIndex + 1}/${symbolIndex + 1}.svg`
    )
);

// Global heavy assets required for zero-latency UI rendering
// V11 Optimization: Purged static machine headers and bellies. Relying strictly on dynamic SVG chassis.
const HEAVY_ASSETS = [
    // The 5 Core Island Hostesses
    '/assets/characters/luna.png', 
    '/assets/characters/mika.png', 
    '/assets/characters/kira.png',
    '/assets/characters/cyber.png', 
    '/assets/characters/gold.png',
    
    // The 5 Core Environments
    '/assets/backgrounds/bg_1.jpg',
    '/assets/backgrounds/bg_2.jpg',
    '/assets/backgrounds/bg_3.jpg',
    '/assets/backgrounds/bg_4.jpg',
    '/assets/backgrounds/bg_5.jpg',
    
    // Symbol Matrix
    ...ISLAND_SYMBOLS
];

export const useAssetPreloader = () => {
    const [progress, setProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const CACHE_NAME = 'suro-assets-v11';
        const CACHE_FLAG = 'suro_assets_cached_v11';

        // 1. FAST PATH: Check if assets are already securely saved to disk
        if (localStorage.getItem(CACHE_FLAG) === 'true') {
            setLoaded(true);
            setProgress(100);
            return;
        }

        // 2. FULL BOOT SEQUENCE: Download and write to persistent CacheStorage
        let loadedCount = 0;
        const total = HEAVY_ASSETS.length;

        const cacheAssets = async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
                const chunkSize = 5; 
                
                for (let i = 0; i < total; i += chunkSize) {
                    const chunk = HEAVY_ASSETS.slice(i, i + chunkSize);
                    
                    await Promise.all(chunk.map(async (src) => {
                        try {
                            const cachedResponse = await cache.match(src);
                            if (!cachedResponse) {
                                const fetchRes = await fetch(src);
                                if (fetchRes.ok) {
                                    await cache.put(src, fetchRes.clone());
                                }
                            }
                        } catch (e) {
                            console.warn(`[PRELOADER] Failed to cache asset: ${src}`, e);
                        } finally {
                            loadedCount++;
                            setProgress(Math.round((loadedCount / total) * 100));
                        }
                    }));
                }

                localStorage.setItem(CACHE_FLAG, 'true');
                
                setTimeout(() => {
                    setLoaded(true);
                }, 800);

            } catch (error) {
                console.error("[PRELOADER] Cache API Error:", error);
                setLoaded(true);
                setProgress(100);
            }
        };

        if ('caches' in window) {
            cacheAssets();
        } else {
            console.warn("[PRELOADER] CacheStorage API not supported. Falling back to native rendering.");
            setLoaded(true);
        }

    }, []);

    return { progress, loaded };
};