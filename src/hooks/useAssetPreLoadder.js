import { useState, useEffect } from 'react';

// List of critical assets to cache immediately
const CRITICAL_ASSETS = [
    // Characters (PNGs)
    '/assets/characters/luna.png',
    '/assets/characters/mika.png',
    '/assets/characters/kira.png',
   
    '/assets/characters/cyber.png',
    
    '/assets/characters/void.png',
    
    // Machine Headers
    '/assets/machines/header_1.png',
    '/assets/machines/header_2.png',
    '/assets/machines/header_3.png',
    '/assets/machines/header_4.png',
    '/assets/machines/header_5.png',
    

    // Machine Bellies
    '/assets/machines/belly_1.png',
    '/assets/machines/belly_2.png',
    '/assets/machines/belly_3.png',
    '/assets/machines/belly_4.png',
    '/assets/machines/belly_5.png',
    
];

export const useAssetPreloader = () => {
    const [progress, setProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let loadedCount = 0;
        const total = CRITICAL_ASSETS.length;

        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
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