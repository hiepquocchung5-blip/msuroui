import React, { memo } from 'react';

const SymbolSVG = ({ 
    id, 
    islandId = 1, 
    variant = 'normal', 
    isWinning = false 
}) => {

    // --- PREMIUM IMAGE-QUALITY DEFS ---
    const renderDefs = () => (
        <defs>
            {/* 3D Glossy Fruit Gradients */}
            <radialGradient id="cherryGloss" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffcccc" />
                <stop offset="15%" stopColor="#ff0044" />
                <stop offset="70%" stopColor="#aa0000" />
                <stop offset="100%" stopColor="#330000" />
            </radialGradient>
            
            <radialGradient id="melonRind" cx="50%" cy="80%" r="80%">
                <stop offset="0%" stopColor="#00ff00" />
                <stop offset="60%" stopColor="#008000" />
                <stop offset="100%" stopColor="#003300" />
            </radialGradient>

            <linearGradient id="melonFlesh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff4d4d" />
                <stop offset="80%" stopColor="#cc0000" />
                <stop offset="100%" stopColor="#e6ffe6" />
            </linearGradient>

            {/* Metallic Gradients */}
            <linearGradient id="goldMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe680" />
                <stop offset="25%" stopColor="#ffcc00" />
                <stop offset="50%" stopColor="#b38600" />
                <stop offset="75%" stopColor="#ffcc00" />
                <stop offset="100%" stopColor="#664d00" />
            </linearGradient>

            <linearGradient id="chromeMetal" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#cccccc" />
                <stop offset="50%" stopColor="#666666" />
                <stop offset="60%" stopColor="#eeeeee" />
                <stop offset="100%" stopColor="#333333" />
            </linearGradient>

            {/* Hanko Stamp Ink */}
            <radialGradient id="hankoRed" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff3333" />
                <stop offset="80%" stopColor="#cc0000" />
                <stop offset="100%" stopColor="#8b0000" />
            </radialGradient>

            {/* Glowing Neon Replay */}
            <radialGradient id="cyanGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00ffff" stopOpacity="1" />
                <stop offset="70%" stopColor="#0088ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0000ff" stopOpacity="0" />
            </radialGradient>

            {/* Advanced Filters */}
            <filter id="dropShadow3D" x="-20%" y="-20%" width="150%" height="150%">
                <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.6"/>
                <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#000" floodOpacity="0.8"/>
            </filter>

            <filter id="specularHighlight">
                <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="40" lightingColor="#ffffff" result="spec">
                    <fePointLight x="-20" y="-30" z="50"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
            </filter>

            <filter id="winPulseGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 3 0" />
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>

            {/* Patterns */}
            <pattern id="seigaiha" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
                <circle cx="10" cy="20" r="10" fill="none" stroke="#002200" strokeWidth="2" opacity="0.5"/>
                <circle cx="10" cy="20" r="7" fill="none" stroke="#002200" strokeWidth="1" opacity="0.4"/>
                <circle cx="0" cy="10" r="10" fill="none" stroke="#002200" strokeWidth="2" opacity="0.5"/>
                <circle cx="0" cy="10" r="7" fill="none" stroke="#002200" strokeWidth="1" opacity="0.4"/>
                <circle cx="20" cy="10" r="10" fill="none" stroke="#002200" strokeWidth="2" opacity="0.5"/>
                <circle cx="20" cy="10" r="7" fill="none" stroke="#002200" strokeWidth="1" opacity="0.4"/>
            </pattern>
        </defs>
    );

    // --- 1. BIG BONUS (Massive 3D "7") ---
    const renderSeven = () => {
        const themeColors = {
            1: ['#ff1a1a', '#800000'], // Zen: Red
            2: ['#ff00ff', '#4b0082'], // Neon: Pink
            3: ['#ff4500', '#330000'], // Magma: Orange/Red
            4: ['#ffb3c6', '#ff0066'], // Hanami: Pink/White
            5: ['#8a2be2', '#000000'], // Yokai: Purple/Black
            8: ['#00ff00', '#003300'], // Cyber: Green
            10: ['#1a0033', '#000000'] // Void: Black
        };
        const [cTop, cBot] = themeColors[islandId] || themeColors[1];
        
        return (
            <g filter="url(#dropShadow3D)">
                <defs>
                    <linearGradient id="sevenGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={cTop} />
                        <stop offset="100%" stopColor={cBot} />
                    </linearGradient>
                </defs>

                {/* 3D Extrusion (Back/Side Layers) */}
                <path d="M 30 20 L 90 20 L 60 85 L 35 85 L 60 38 L 30 38 Z" fill="#111" transform="translate(4, 6)" />
                <path d="M 90 20 L 94 26 L 64 91 L 60 85 Z" fill="#222" /> 
                <path d="M 35 85 L 39 91 L 64 91 L 60 85 Z" fill="#0a0a0a" /> 

                {/* Main Front Face with Specular Lighting */}
                <path d="M 26 16 L 86 16 L 56 81 L 31 81 L 56 34 L 26 34 Z" fill="url(#sevenGrad)" stroke="url(#goldMetal)" strokeWidth="2.5" filter="url(#specularHighlight)" />
                
                {/* Embedded Reflections (Glass Sheen) */}
                <path d="M 30 19 L 80 19 L 70 30 L 30 30 Z" fill="#ffffff" opacity="0.4" pointerEvents="none" />
                <path d="M 52 40 L 40 65 L 48 65 L 56 40 Z" fill="#ffffff" opacity="0.2" pointerEvents="none" />
            </g>
        );
    };

    // --- 2. REG BONUS (Silver Crest) ---
    const renderRegBonus = () => (
        <g filter="url(#dropShadow3D)" transform="scale(0.85) translate(10, 10)">
            <path d="M 30 20 L 90 20 L 60 85 L 35 85 L 60 38 L 30 38 Z" fill="#0a0a0a" transform="translate(4, 6)" />
            <path d="M 26 16 L 86 16 L 56 81 L 31 81 L 56 34 L 26 34 Z" fill="url(#chromeMetal)" stroke="#555" strokeWidth="2.5" filter="url(#specularHighlight)" />
            <path d="M 30 19 L 80 19 L 70 30 L 30 30 Z" fill="#ffffff" opacity="0.6" pointerEvents="none" />
            
            {/* Text Ribbon */}
            <g transform="translate(50, 72) rotate(-12)">
                <rect x="-30" y="-10" width="60" height="20" rx="3" fill="#800" stroke="url(#goldMetal)" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="900" letterSpacing="1.5">BONUS</text>
            </g>
        </g>
    );

    // --- 3. BAR SYMBOL (Chunky Plaque with Hanko Stamp) ---
    const renderBar = () => (
        <g filter="url(#dropShadow3D)">
            {/* Thick Base Extrusion */}
            <rect x="18" y="38" width="64" height="28" rx="3" fill="#0a0a0a" />
            <path d="M 82 35 L 86 39 V 67 L 82 63 Z" fill="#1a1a1a" />
            <path d="M 14 63 L 18 67 H 86 L 82 63 Z" fill="#111" />

            {/* Front Metallic Plate */}
            <rect x="14" y="35" width="68" height="28" rx="4" fill="#1a1a1a" stroke="url(#chromeMetal)" strokeWidth="3" filter="url(#specularHighlight)" />
            
            {/* Bolt Heads */}
            <circle cx="20" cy="41" r="2" fill="url(#chromeMetal)" />
            <circle cx="76" cy="41" r="2" fill="url(#chromeMetal)" />
            <circle cx="20" cy="57" r="2" fill="url(#chromeMetal)" />
            <circle cx="76" cy="57" r="2" fill="url(#chromeMetal)" />

            {/* Engraved Text */}
            <text x="48" y="55" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="900" letterSpacing="3" style={{textShadow: '0px 3px 5px rgba(0,0,0,1)'}}>BAR</text>
            
            {/* Hanko Stamp Overlay (Right Edge) */}
            <g transform="translate(68, 42) rotate(-15)" filter="url(#dropShadow3D)">
                <rect x="-9" y="-9" width="18" height="18" rx="2" fill="url(#hankoRed)" stroke="#fff" strokeWidth="0.5" opacity="0.95" />
                <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="serif" opacity="0.9">吉</text> {/* Kichi = Good Luck */}
            </g>
            
            {/* Glass Curvature Highlight */}
            <path d="M 16 37 Q 48 45 80 37 V 42 Q 48 50 16 42 Z" fill="#fff" opacity="0.3" pointerEvents="none" />
        </g>
    );

    // --- 4. BELL (Traditional Suzu Shrine Bell) ---
    const renderBell = () => (
        <g filter="url(#dropShadow3D)">
            {/* Suzu-o Twine/Rope Hanging Behind */}
            <path d="M 50 0 C 45 10, 55 20, 50 30" fill="none" stroke="#ddd" strokeWidth="6" strokeLinecap="round" />
            <path d="M 50 0 C 55 10, 45 20, 50 30" fill="none" stroke="#cc0000" strokeWidth="6" strokeLinecap="round" />
            
            {/* Solid Brass Sphere */}
            <circle cx="50" cy="55" r="35" fill="url(#goldMetal)" filter="url(#specularHighlight)" />
            
            {/* Engraved Horizontal Lines typical of Suzu */}
            <path d="M 17 45 Q 50 55 83 45" fill="none" stroke="#8a5a00" strokeWidth="2.5" opacity="0.7"/>
            <path d="M 15 55 Q 50 65 85 55" fill="none" stroke="#8a5a00" strokeWidth="2.5" opacity="0.7"/>

            {/* The Bottom Sound Slit */}
            <path d="M 25 75 Q 50 85 75 75" fill="none" stroke="#331a00" strokeWidth="6" strokeLinecap="round" />
            <circle cx="25" cy="75" r="6" fill="#331a00" />
            <circle cx="75" cy="75" r="6" fill="#331a00" />

            {/* Spherical Glare */}
            <ellipse cx="35" cy="35" rx="12" ry="6" fill="#fff" opacity="0.7" transform="rotate(-30 35 35)" pointerEvents="none" />
        </g>
    );

    // --- 5. WATERMELON (3D Crescent with Seigaiha Waves) ---
    const renderMelon = () => (
        <g filter="url(#dropShadow3D)">
            {/* Shadow / Base Rind Thickness */}
            <path d="M 10 45 Q 50 95 90 45 Z" fill="#001100" transform="translate(0, 8)"/>
            
            {/* Outer Green Rind */}
            <path d="M 10 45 Q 50 95 90 45 Z" fill="url(#melonRind)" stroke="#002200" strokeWidth="3" filter="url(#specularHighlight)" />
            
            {/* Japanese Seigaiha Pattern applied to rind */}
            <path d="M 10 45 Q 50 95 90 45 Z" fill="url(#seigaiha)" opacity="0.7" />

            {/* Dark Tiger Stripes */}
            <path d="M 30 45 Q 35 65 30 75 M 50 45 V 85 M 70 45 Q 65 65 70 75" fill="none" stroke="#001a00" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
            
            {/* Inner White Rind Layer */}
            <path d="M 10 45 Q 50 15 90 45 Q 50 60 10 45 Z" fill="#e6ffe6" stroke="#003300" strokeWidth="1.5" />
            
            {/* Bright Red/Pink Flesh */}
            <path d="M 15 45 Q 50 20 85 45 Q 50 55 15 45 Z" fill="url(#melonFlesh)" filter="url(#specularHighlight)" />
            
            {/* Embedded Seeds */}
            <g fill="#1a0000" transform="translate(0, 0)">
                <ellipse cx="40" cy="40" rx="2" ry="3.5" transform="rotate(20 40 40)" />
                <ellipse cx="50" cy="43" rx="2" ry="3.5" />
                <ellipse cx="60" cy="40" rx="2" ry="3.5" transform="rotate(-20 60 40)" />
            </g>

            {/* Wet Juicy Glare */}
            <path d="M 20 45 Q 50 25 80 45 Q 50 50 20 45 Z" fill="#fff" opacity="0.4" pointerEvents="none" />
        </g>
    );

    // --- 6. CHERRY (Deep red, 3D glossy spheres with Bonsai Leaf) ---
    const renderCherry = () => (
        <g filter="url(#dropShadow3D)">
            {/* Stems connecting down */}
            <path d="M 50 20 Q 40 25 30 60" fill="none" stroke="#331a00" strokeWidth="4" strokeLinecap="round" />
            <path d="M 50 20 Q 65 25 70 65" fill="none" stroke="#331a00" strokeWidth="4" strokeLinecap="round" />
            
            {/* Japanese Bonsai-style Leaf */}
            <g filter="url(#specularHighlight)">
                <path d="M 50 20 Q 75 5 85 20 Q 65 30 50 20 Z" fill="#228b22" stroke="#003300" strokeWidth="1.5" />
                <path d="M 50 20 Q 70 15 80 20" fill="none" stroke="#003300" strokeWidth="1" />
            </g>

            {/* Left Cherry Sphere */}
            <circle cx="30" cy="65" r="18" fill="url(#cherryGloss)" filter="url(#specularHighlight)" />
            <ellipse cx="23" cy="57" rx="6" ry="3" fill="#fff" opacity="0.8" transform="rotate(-30 23 57)" pointerEvents="none" />
            {/* Bounced ambient light under cherry */}
            <path d="M 25 78 A 12 12 0 0 0 42 70" fill="none" stroke="#ffb3b3" strokeWidth="1.5" opacity="0.6" pointerEvents="none" /> 

            {/* Right Cherry Sphere (Overlaps Left) */}
            <circle cx="70" cy="70" r="20" fill="url(#cherryGloss)" filter="url(#specularHighlight)" />
            <ellipse cx="62" cy="61" rx="7" ry="3.5" fill="#fff" opacity="0.8" transform="rotate(-30 62 61)" pointerEvents="none" />
            <path d="M 64 85 A 14 14 0 0 0 84 76" fill="none" stroke="#ffb3b3" strokeWidth="1.5" opacity="0.6" pointerEvents="none" />
        </g>
    );

    // --- 7. REPLAY (Glowing Mitsudomoe Coin) ---
    const renderReplay = () => {
        return (
            <g filter="url(#dropShadow3D)">
                {/* Thick Coin Edge */}
                <circle cx="50" cy="54" r="32" fill="#0a0a0a" />
                
                {/* Silver/Chrome Coin Face */}
                <circle cx="50" cy="50" r="32" fill="url(#chromeMetal)" stroke="#333" strokeWidth="2" filter="url(#specularHighlight)" />
                
                {/* Inner Dark Recess */}
                <circle cx="50" cy="50" r="24" fill="#050505" stroke="#222" strokeWidth="1.5" />
                
                {/* Glowing Base behind emblem */}
                <circle cx="50" cy="50" r="22" fill="url(#cyanGlow)" opacity="0.6" />

                {/* Mitsudomoe (Triple Comma Swirl) */}
                <g transform="translate(50, 50) scale(0.42)" fill="#00f3ff">
                    <path d="M 0 -20 A 20 20 0 1 1 -17 10 A 10 10 0 1 0 0 -20 Z" />
                    <path d="M 0 -20 A 20 20 0 1 1 -17 10 A 10 10 0 1 0 0 -20 Z" transform="rotate(120)" />
                    <path d="M 0 -20 A 20 20 0 1 1 -17 10 A 10 10 0 1 0 0 -20 Z" transform="rotate(240)" />
                </g>

                {/* Encircling Holographic Arrows */}
                <path d="M 50 30 A 20 20 0 1 1 30 50" fill="none" stroke="#00f3ff" strokeWidth="4.5" strokeLinecap="round" style={{filter: `drop-shadow(0 0 4px #00f3ff)`}} />
                <polygon points="22,48 38,48 30,35" fill="#00f3ff" style={{filter: `drop-shadow(0 0 4px #00f3ff)`}} />
                
                {/* Overlay Text */}
                <text x="50" y="54" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="900" letterSpacing="1.5" style={{textShadow: '0 2px 4px #000'}}>REPLAY</text>
                
                {/* Heavy Glass Bubble Dome over the center */}
                <ellipse cx="45" cy="40" rx="14" ry="8" fill="#fff" opacity="0.3" transform="rotate(-30 45 40)" pointerEvents="none" />
            </g>
        );
    };

    // --- ROUTER ---
    const renderSymbol = () => {
        switch(parseInt(id)) {
            case 1: return renderSeven(); 
            case 2: return renderRegBonus();
            case 3: return renderBar();
            case 4: return renderBell();
            case 5: return renderMelon();
            case 6: return renderCherry();
            case 7: return renderReplay(); 
            default: return <circle cx="50" cy="50" r="20" fill="#333" filter="url(#dropShadow3D)" />;
        }
    };

    return (
        <svg 
            viewBox="0 0 100 100" 
            className={`w-full h-full transition-all duration-300 
                ${isWinning ? 'animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite] scale-[1.15] z-10' : 'scale-100'} 
                ${variant === 'glitch' ? 'animate-[pulse_0.1s_linear_infinite]' : ''}
                ${variant === 'dim' ? 'brightness-50 grayscale-[50%]' : ''}
            `}
        >
            {renderDefs()}
            
            {/* The Main Symbol Render */}
            {renderSymbol()}

            {/* Glowing Win Box (Only visible if part of a winning line) */}
            {isWinning && (
                <rect 
                    x="2" y="2" width="96" height="96" rx="12" 
                    fill="none" stroke="url(#goldMetal)" strokeWidth="4" 
                    filter="url(#winPulseGlow)" 
                    pointerEvents="none" 
                />
            )}
        </svg>
    );
};

export default memo(SymbolSVG);