import React, { memo } from 'react';

const SymbolSVG = ({ 
    id, 
    islandId = 1, 
    variant = 'normal', 
    isWinning = false 
}) => {

    // Ensure islandId is bound between 1 and 5 for the V3 Core Islands
    const safeIslandId = Math.max(1, Math.min(5, parseInt(islandId) || 1));

    // --- 1. DYNAMIC THEME ENGINE ---
    // Adapts the aura and lighting based on the 5 V3 Islands
    const getTheme = (island) => {
        const themes = {
            1: { aura: '#FFD700', glow: 'rgba(255, 215, 0, 0.8)' },    // Kyoto: Gold
            2: { aura: '#00f3ff', glow: 'rgba(0, 243, 255, 0.8)' },    // Neon: Cyan
            3: { aura: '#ff4500', glow: 'rgba(255, 69, 0, 0.8)' },     // Edo: Magma
            4: { aura: '#ffb3c6', glow: 'rgba(255, 179, 198, 0.8)' },  // Hanami: Sakura
            5: { aura: '#8a2be2', glow: 'rgba(138, 43, 226, 0.8)' },   // Yokai: Purple
        };
        return themes[island] || themes[1];
    };

    const theme = getTheme(safeIslandId);

    // --- 2. PREMIUM 3D SHADERS & AURA DEFINITIONS ---
    // Cleaned up: Removed hardcoded gradients, keeping only the dynamic lighting filters
    const renderDefs = () => (
        <defs>
            {/* 3D Shadows */}
            <filter id={`dropShadow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.75"/>
                <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#000" floodOpacity="0.9"/>
            </filter>

            {/* Gemini Aura Win Pulse */}
            <filter id={`winPulse-${id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 3 0" />
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>

            <radialGradient id={`auraRay-${id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="40%" stopColor={theme.aura} stopOpacity="0.6" />
                <stop offset="100%" stopColor={theme.aura} stopOpacity="0" />
            </radialGradient>
        </defs>
    );

    // --- 3. DYNAMIC WIN AURA ---
    // Remains active to wrap around your custom SVGs
    const renderWinAura = () => {
        if (!isWinning) return null;
        return (
            <g className="pointer-events-none z-0">
                {/* Expanding Energy Ring */}
                <circle cx="50" cy="50" r="45" fill="none" stroke={theme.aura} strokeWidth="2" opacity="0.8">
                    <animate attributeName="r" values="30; 55; 30" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8; 0; 0.8" dur="1.5s" repeatCount="indefinite" />
                </circle>
                
                {/* Backlight Burst */}
                <circle cx="50" cy="50" r="40" fill={`url(#auraRay-${id})`}>
                    <animateTransform attributeName="transform" type="scale" values="0.9; 1.15; 0.9" dur="1s" repeatCount="indefinite" transformOrigin="50 50" />
                </circle>

                {/* Star Particles */}
                {[...Array(8)].map((_, i) => (
                    <g key={i} transform={`rotate(${i * 45} 50 50)`}>
                        <path d="M 50 10 L 52 15 L 50 20 L 48 15 Z" fill="#FFF" filter="drop-shadow(0 0 2px #FFF)">
                            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -15" dur={`${Math.random() * 0.5 + 0.5}s`} repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0" dur={`${Math.random() * 0.5 + 0.5}s`} repeatCount="indefinite" />
                        </path>
                    </g>
                ))}
            </g>
        );
    };

    // --- 4. DYNAMIC SVG LOADER ---
    // Points directly to /public/assets/symbols/islandX/Y.svg
    const symbolPath = `/assets/symbols/island${safeIslandId}/${id}.svg`;

    return (
        <svg 
            viewBox="0 0 100 100" 
            className={`w-full h-full transition-all duration-300 
                ${isWinning ? 'scale-[1.15] z-10' : 'scale-100'} 
                ${variant === 'glitch' ? 'animate-[pulse_0.1s_linear_infinite] opacity-50' : ''}
                ${variant === 'dim' ? 'brightness-50 grayscale-[30%]' : ''}
            `}
        >
            {renderDefs()}
            
            {/* Dynamic Gemini Aura (Triggers heavily on win) */}
            {renderWinAura()}

            {/* Core Symbol Image Fetcher */}
            <image 
                href={symbolPath}
                x="5" 
                y="5" 
                width="90" 
                height="90" 
                preserveAspectRatio="xMidYMid meet"
                filter={`url(#dropShadow-${id})`}
                className="relative z-10"
            />

            {/* Glowing Border Box on Win (Classic Slot Highlight) */}
            {isWinning && (
                <rect 
                    x="2" y="2" width="96" height="96" rx="16" 
                    fill="none" stroke={theme.aura} strokeWidth="5" 
                    filter={`url(#winPulse-${id})`} 
                    pointerEvents="none" 
                    className="animate-pulse z-20 relative"
                />
            )}
        </svg>
    );
};

export default memo(SymbolSVG);