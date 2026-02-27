import React, { memo } from 'react';

const SymbolSVG = ({ 
    id, 
    islandId = 1, 
    variant = 'normal', // 'normal', 'gold', 'frozen', 'glitch', 'dim', 'heat'
    isWinning = false   // Triggers win animation
}) => {

    const renderDefs = () => (
        <defs>
            {/* --- PREMIUM 3D GRADIENTS --- */}
            <radialGradient id="cherryRed" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffb3b3"/>
                <stop offset="20%" stopColor="#ff0044"/>
                <stop offset="80%" stopColor="#990000"/>
                <stop offset="100%" stopColor="#4d0000"/>
            </radialGradient>
            
            <radialGradient id="melonGreen" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#66ff66"/>
                <stop offset="50%" stopColor="#00cc00"/>
                <stop offset="100%" stopColor="#004d00"/>
            </radialGradient>

            <linearGradient id="bellGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fff5cc"/>
                <stop offset="30%" stopColor="#ffcc00"/>
                <stop offset="70%" stopColor="#b38600"/>
                <stop offset="100%" stopColor="#ffcc00"/>
            </linearGradient>

            <linearGradient id="chrome" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0f0f0"/>
                <stop offset="40%" stopColor="#888"/>
                <stop offset="50%" stopColor="#fff"/>
                <stop offset="60%" stopColor="#555"/>
                <stop offset="100%" stopColor="#ddd"/>
            </linearGradient>

            {/* --- THEMATIC GRADIENTS FOR "7" & "BAR" --- */}
            <linearGradient id="theme1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff4d4d"/><stop offset="100%" stopColor="#8b0000"/></linearGradient> {/* Zen: Crimson */}
            <linearGradient id="theme2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00f3ff"/><stop offset="100%" stopColor="#ff00ff"/></linearGradient> {/* Neon: Cyber Pink/Cyan */}
            <linearGradient id="theme3" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#300"/><stop offset="50%" stopColor="#ff4500"/><stop offset="100%" stopColor="#ffd700"/></linearGradient> {/* Magma */}
            <linearGradient id="theme4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffb3c6"/><stop offset="100%" stopColor="#ff0066"/></linearGradient> {/* Hanami: Sakura */}
            <linearGradient id="theme5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#000033"/><stop offset="100%" stopColor="#4b0082"/></linearGradient> {/* Yokai: Dark Spirit */}
            <linearGradient id="theme6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffffff"/><stop offset="100%" stopColor="#00bfff"/></linearGradient> {/* Onsen: Ice/Water */}
            <linearGradient id="theme7" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#9acd32"/><stop offset="100%" stopColor="#228b22"/></linearGradient> {/* Inaka: Nature */}
            <linearGradient id="theme8" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00ff00"/><stop offset="100%" stopColor="#003300"/></linearGradient> {/* Cyber: Matrix */}
            <linearGradient id="theme9" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffd700"/><stop offset="100%" stopColor="#ff8c00"/></linearGradient> {/* Tropic: Sun */}
            <linearGradient id="theme10" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#1a0033"/><stop offset="100%" stopColor="#000000"/></linearGradient> {/* Void: Blackhole */}

            {/* --- ADVANCED SHADERS --- */}
            <filter id="bevel" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="3" specularConstant="1.2" specularExponent="25" lightingColor="#ffffff" result="spec">
                    <fePointLight x="-20" y="-20" z="30"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
            </filter>

            <filter id="glowDrop" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.8"/>
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>

            <filter id="winGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 3 0" />
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
        </defs>
    );

    // --- 1. BIG BONUS (THEMATIC "7") ---
    const renderSeven = () => {
        const themeGrad = `url(#theme${islandId})`;
        const isDarkTheme = islandId === 5 || islandId === 10;
        const strokeColor = isDarkTheme ? '#ff00ff' : 'url(#bellGold)';

        // Extruded 3D Base Path for the "7"
        const path7Back = "M 28 28 L 88 28 L 58 88 L 38 88 L 58 48 L 28 48 Z";
        const path7Front = "M 22 22 L 82 22 L 52 82 L 32 82 L 52 42 L 22 42 Z";

        return (
            <g filter="url(#glowDrop)">
                {/* Background Thematic Accents */}
                {islandId === 4 && <path d="M 50 10 Q 60 0 70 10 Q 60 20 50 10" fill="#ffb3c6" className="animate-pulse" />} {/* Sakura Petal */}
                {islandId === 8 && <rect x="20" y="20" width="60" height="60" fill="none" stroke="#00ff00" strokeWidth="1" strokeDasharray="2 4" />} {/* Cyber Grid */}
                {islandId === 10 && <circle cx="50" cy="50" r="30" fill="none" stroke="#4b0082" strokeWidth="2" strokeDasharray="10 10" className="animate-spin-slow"/>} {/* Void Ring */}

                {/* Extruded Shadow Layer */}
                <path d={path7Back} fill="#111" />
                <path d="M 82 22 L 88 28 L 58 88 L 52 82 Z" fill="#333" /> {/* Right Edge */}
                <path d="M 22 42 L 28 48 L 58 48 L 52 42 Z" fill="#222" /> {/* Bottom Lip */}

                {/* Main Front Face */}
                <path d={path7Front} fill={themeGrad} stroke={strokeColor} strokeWidth="2" filter="url(#bevel)" />
                
                {/* Gloss Reflection */}
                <path d="M 25 25 L 75 25 L 65 40 L 25 40 Z" fill="#ffffff" opacity="0.3" />
            </g>
        );
    };

    // --- 2. REG BONUS (SECONDARY SYMBOL) ---
    const renderRegBonus = () => (
        <g filter="url(#glowDrop)" transform="scale(0.9) translate(5, 5)">
            <path d="M 28 28 L 88 28 L 58 88 L 38 88 L 58 48 L 28 48 Z" fill="#111" />
            <path d="M 22 22 L 82 22 L 52 82 L 32 82 L 52 42 L 22 42 Z" fill="url(#chrome)" stroke="#333" strokeWidth="2" filter="url(#bevel)" />
            <path d="M 25 25 L 75 25 L 65 40 L 25 40 Z" fill="#ffffff" opacity="0.5" />
            <text x="45" y="70" textAnchor="middle" fill="#111" fontSize="12" fontWeight="900" transform="rotate(-15 45 70)">BONUS</text>
        </g>
    );

    // --- 3. BAR SYMBOL (THEMATIC) ---
    const renderBar = () => {
        const themeGrad = `url(#theme${islandId})`;
        return (
            <g filter="url(#glowDrop)">
                {/* 3D Extrusion block */}
                <rect x="18" y="38" width="68" height="28" rx="4" fill="#111" />
                <path d="M 82 35 L 86 38 V 66 L 82 63 Z" fill="#333" />
                <path d="M 14 63 L 18 66 H 86 L 82 63 Z" fill="#222" />

                {/* Main Plate */}
                <rect x="14" y="35" width="68" height="28" rx="4" fill={islandId === 1 ? '#000' : themeGrad} stroke="url(#chrome)" strokeWidth="2" filter="url(#bevel)" />
                
                <text x="48" y="56" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="900" letterSpacing="3" style={{textShadow: '0px 2px 2px rgba(0,0,0,0.8)'}}>BAR</text>
                
                {/* Gloss */}
                <rect x="16" y="37" width="64" height="10" rx="2" fill="#fff" opacity="0.2" />
            </g>
        );
    };

    // --- 4. BELL ---
    const renderBell = () => (
        <g filter="url(#glowDrop)">
            {/* Bell Base */}
            <path d="M 50 20 C 70 20, 80 50, 85 75 L 15 75 C 20 50, 30 20, 50 20 Z" fill="url(#bellGold)" filter="url(#bevel)" />
            
            {/* Clapper */}
            <ellipse cx="50" cy="75" rx="35" ry="10" fill="#cc9900" />
            <circle cx="50" cy="82" r="6" fill="url(#bellGold)" filter="url(#bevel)" />
            
            {/* Top Handle */}
            <path d="M 45 20 V 12 C 45 8, 55 8, 55 12 V 20" fill="none" stroke="url(#bellGold)" strokeWidth="4" />
            
            {/* Shine */}
            <path d="M 35 30 C 40 25, 45 25, 50 25 C 45 40, 35 50, 25 65" fill="none" stroke="#fff" strokeWidth="3" opacity="0.5" strokeLinecap="round" />
        </g>
    );

    // --- 5. WATERMELON ---
    const renderMelon = () => (
        <g filter="url(#glowDrop)">
            {/* Main Round Melon */}
            <circle cx="50" cy="55" r="35" fill="url(#melonGreen)" filter="url(#bevel)" />
            
            {/* Dark Stripes */}
            <path d="M 30 25 Q 40 55 35 85" fill="none" stroke="#003300" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            <path d="M 50 20 Q 55 55 50 90" fill="none" stroke="#003300" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
            <path d="M 70 25 Q 60 55 65 85" fill="none" stroke="#003300" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            
            {/* Cut Slice Overlay */}
            <path d="M 15 65 Q 50 95 85 65 Z" fill="#006600" />
            <path d="M 20 63 Q 50 90 80 63 Z" fill="#ff3333" />
            <circle cx="40" cy="70" r="1.5" fill="#000" />
            <circle cx="50" cy="75" r="1.5" fill="#000" />
            <circle cx="60" cy="70" r="1.5" fill="#000" />
            
            {/* Shine */}
            <ellipse cx="40" cy="35" rx="10" ry="5" fill="#fff" opacity="0.4" transform="rotate(-30 40 35)" />
        </g>
    );

    // --- 6. CHERRY ---
    const renderCherry = () => (
        <g filter="url(#glowDrop)">
            {/* Stems */}
            <path d="M 50 20 Q 40 10 30 55" fill="none" stroke="#663300" strokeWidth="3" strokeLinecap="round" />
            <path d="M 50 20 Q 60 15 70 60" fill="none" stroke="#663300" strokeWidth="3" strokeLinecap="round" />
            
            {/* Leaf */}
            <path d="M 50 20 Q 70 10 80 25 Q 60 30 50 20 Z" fill="#228b22" stroke="#004d00" strokeWidth="1" filter="url(#bevel)" />

            {/* Left Cherry */}
            <circle cx="30" cy="60" r="16" fill="url(#cherryRed)" filter="url(#bevel)" />
            <ellipse cx="25" cy="53" rx="4" ry="2" fill="#fff" opacity="0.6" transform="rotate(-30 25 53)" />

            {/* Right Cherry (Slightly larger, overlaps) */}
            <circle cx="70" cy="65" r="18" fill="url(#cherryRed)" filter="url(#bevel)" />
            <ellipse cx="65" cy="57" rx="5" ry="2.5" fill="#fff" opacity="0.6" transform="rotate(-30 65 57)" />
        </g>
    );

    // --- 7. REPLAY (FREE SPIN) ---
    const renderReplay = () => {
        const color = islandId === 8 ? '#00f3ff' : (islandId === 3 ? '#ff4500' : '#4dabf7');
        return (
            <g filter="url(#glowDrop)">
                {/* 3D Base Disc */}
                <circle cx="50" cy="53" r="32" fill="#222" />
                <circle cx="50" cy="50" r="32" fill="url(#chrome)" stroke="#555" strokeWidth="2" filter="url(#bevel)" />
                <circle cx="50" cy="50" r="22" fill="#111" stroke="#333" strokeWidth="1" />
                
                {/* Arrow Paths */}
                <path d="M 50 32 A 18 18 0 1 1 32 50" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" filter="url(#glowDrop)" />
                <polygon points="27,48 37,48 32,38" fill={color} filter="url(#glowDrop)" />
                
                <text x="50" y="54" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="900" letterSpacing="1">REPLAY</text>
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
            default: return <circle cx="50" cy="50" r="20" fill="#333" />;
        }
    };

    return (
        <svg 
            viewBox="0 0 100 100" 
            className={`w-full h-full transition-all duration-300 
                ${isWinning ? 'animate-pulse scale-[1.15] z-10' : 'scale-100'} 
                ${variant === 'glitch' ? 'animate-[pulse_0.1s_linear_infinite]' : ''}
            `}
        >
            {renderDefs()}
            
            {/* Render the core symbol */}
            {renderSymbol()}

            {/* Win Highlight Box overlay */}
            {isWinning && (
                <rect x="2" y="2" width="96" height="96" rx="12" fill="none" stroke="url(#bellGold)" strokeWidth="4" filter="url(#winGlow)" className="animate-pulse" />
            )}
        </svg>
    );
};

export default memo(SymbolSVG);