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
            {/* Glossy Cherry Red */}
            <radialGradient id="cherryRed" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffb3b3"/>
                <stop offset="15%" stopColor="#ff0044"/>
                <stop offset="70%" stopColor="#b30000"/>
                <stop offset="100%" stopColor="#4d0000"/>
            </radialGradient>
            
            {/* Lush Melon Green */}
            <radialGradient id="melonGreen" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#88ff88"/>
                <stop offset="40%" stopColor="#00cc00"/>
                <stop offset="85%" stopColor="#004d00"/>
                <stop offset="100%" stopColor="#002200"/>
            </radialGradient>

            {/* Shinto Shrine Gold (Suzu Bell) */}
            <linearGradient id="bellGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fff8cc"/>
                <stop offset="25%" stopColor="#ffcc00"/>
                <stop offset="50%" stopColor="#e6a800"/>
                <stop offset="75%" stopColor="#ffcc00"/>
                <stop offset="100%" stopColor="#996600"/>
            </linearGradient>

            {/* Pachislo Chrome/Silver */}
            <linearGradient id="chrome" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff"/>
                <stop offset="20%" stopColor="#ccc"/>
                <stop offset="50%" stopColor="#f8f8f8"/>
                <stop offset="80%" stopColor="#777"/>
                <stop offset="100%" stopColor="#333"/>
            </linearGradient>

            {/* --- THEMATIC GRADIENTS FOR "7" & "BAR" --- */}
            <linearGradient id="theme1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff3333"/><stop offset="100%" stopColor="#8b0000"/></linearGradient> {/* Zen: Crimson */}
            <linearGradient id="theme2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00f3ff"/><stop offset="100%" stopColor="#ff00ff"/></linearGradient> {/* Neon Arcade */}
            <linearGradient id="theme3" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#4a0000"/><stop offset="50%" stopColor="#ff4500"/><stop offset="100%" stopColor="#ffd700"/></linearGradient> {/* Edo Magma */}
            <linearGradient id="theme4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffffff"/><stop offset="100%" stopColor="#ff6699"/></linearGradient> {/* Hanami Sakura */}
            <linearGradient id="theme5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#000044"/><stop offset="100%" stopColor="#4b0082"/></linearGradient> {/* Yokai Dark */}
            <linearGradient id="theme6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffffff"/><stop offset="100%" stopColor="#00bfff"/></linearGradient> {/* Onsen Ice */}
            <linearGradient id="theme7" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ccff66"/><stop offset="100%" stopColor="#228b22"/></linearGradient> {/* Inaka Nature */}
            <linearGradient id="theme8" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00ff00"/><stop offset="100%" stopColor="#004400"/></linearGradient> {/* Cyber Matrix */}
            <linearGradient id="theme9" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffd700"/><stop offset="100%" stopColor="#ff8c00"/></linearGradient> {/* Okinawa Sun */}
            <linearGradient id="theme10" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2a0044"/><stop offset="100%" stopColor="#000000"/></linearGradient> {/* Ninja Void */}

            {/* --- ADVANCED 3D SHADERS --- */}
            <filter id="bevel3D" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="4" specularConstant="1.5" specularExponent="30" lightingColor="#ffffff" result="spec">
                    <fePointLight x="-20" y="-30" z="40"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
                <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.6"/>
            </filter>

            <filter id="glassShine">
                <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
                <feOffset dx="2" dy="2" result="offsetBlur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="110" lightingColor="#fff" result="specOut">
                    <fePointLight x="-50" y="-50" z="200"/>
                </feSpecularLighting>
                <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
            </filter>

            <filter id="winGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 3 0" />
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>

            {/* Thematic Overlays */}
            <pattern id="matrixPattern" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="4" height="4" fill="none" />
                <path d="M0,0 L4,4 M4,0 L0,4" stroke="#00ff00" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
        </defs>
    );

    // --- 1. BIG BONUS (THEMATIC "7" - Massive & Thick) ---
    const renderSeven = () => {
        const themeGrad = `url(#theme${islandId})`;
        const isDarkTheme = islandId === 5 || islandId === 10;
        const strokeColor = isDarkTheme ? '#ff00ff' : 'url(#bellGold)';

        // Deep 3D Extrusion
        const path7Back = "M 32 25 L 92 25 L 62 85 L 42 85 L 62 45 L 32 45 Z";
        const path7Front = "M 22 15 L 82 15 L 52 75 L 32 75 L 52 35 L 22 35 Z";

        return (
            <g>
                {/* Extruded Shadow Layer */}
                <path d={path7Back} fill="#111" />
                <path d="M 82 15 L 92 25 L 62 85 L 52 75 Z" fill="#222" /> {/* Right Edge */}
                <path d="M 22 35 L 32 45 L 62 45 L 52 35 Z" fill="#1a1a1a" /> {/* Bottom Lip */}

                {/* Main Front Face with 3D Bevel */}
                <path d={path7Front} fill={themeGrad} stroke={strokeColor} strokeWidth="2.5" filter="url(#bevel3D)" />
                
                {/* Island-Specific Overlays on the 7 */}
                {islandId === 4 && ( // Sakura Petals (Hanami)
                    <g transform="translate(45, 20) scale(0.6)">
                        <path d="M 10 0 Q 20 -10 30 0 Q 20 10 10 0" fill="#fff" opacity="0.8"/>
                        <path d="M 0 15 Q 15 5 20 20 Q 5 25 0 15" fill="#fff" opacity="0.8"/>
                    </g>
                )}
                {islandId === 8 && ( // Matrix Grid (Cyber)
                    <path d={path7Front} fill="url(#matrixPattern)" />
                )}
                {islandId === 10 && ( // Ninja Shuriken Cutout
                    <g transform="translate(55, 30) scale(0.4)">
                        <path d="M 20 0 L 25 15 L 40 20 L 25 25 L 20 40 L 15 25 L 0 20 L 15 15 Z" fill="#111" stroke="#fff" strokeWidth="1"/>
                    </g>
                )}

                {/* Intense Glass Glare */}
                <path d="M 25 18 L 75 18 L 65 35 L 25 35 Z" fill="#ffffff" opacity="0.4" />
                <path d="M 50 40 L 45 50 L 52 50 Z" fill="#ffffff" opacity="0.2" />
            </g>
        );
    };

    // --- 2. REG BONUS (Smaller Chrome 7 or Emblem) ---
    const renderRegBonus = () => (
        <g filter="url(#bevel3D)" transform="scale(0.85) translate(10, 10)">
            {/* Extrusion */}
            <path d="M 32 25 L 92 25 L 62 85 L 42 85 L 62 45 L 32 45 Z" fill="#111" />
            <path d="M 22 15 L 82 15 L 52 75 L 32 75 L 52 35 L 22 35 Z" fill="url(#chrome)" stroke="#555" strokeWidth="2" />
            
            {/* Glare */}
            <path d="M 25 18 L 75 18 L 65 35 L 25 35 Z" fill="#ffffff" opacity="0.6" />
            
            {/* Banner */}
            <rect x="25" y="60" width="50" height="20" fill="#800" stroke="url(#bellGold)" strokeWidth="1.5" transform="rotate(-10 50 70)" />
            <text x="50" y="74" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="900" transform="rotate(-10 50 70)" letterSpacing="1">BONUS</text>
        </g>
    );

    // --- 3. BAR SYMBOL (Chunky Japanese Wooden/Neon Plaque) ---
    const renderBar = () => {
        const themeGrad = `url(#theme${islandId})`;
        return (
            <g>
                {/* 3D Extrusion block */}
                <rect x="18" y="38" width="68" height="28" rx="4" fill="#111" />
                <path d="M 82 35 L 86 38 V 66 L 82 63 Z" fill="#333" />
                <path d="M 14 63 L 18 66 H 86 L 82 63 Z" fill="#222" />

                {/* Main Plate */}
                <rect x="14" y="35" width="68" height="28" rx="4" fill={islandId === 1 ? '#0a0a0a' : themeGrad} stroke="url(#chrome)" strokeWidth="2.5" filter="url(#bevel3D)" />
                
                {/* Screws */}
                <circle cx="18" cy="39" r="2" fill="url(#chrome)"/>
                <circle cx="78" cy="39" r="2" fill="url(#chrome)"/>
                <circle cx="18" cy="59" r="2" fill="url(#chrome)"/>
                <circle cx="78" cy="59" r="2" fill="url(#chrome)"/>

                {/* Text */}
                <text x="48" y="56" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="900" letterSpacing="4" style={{textShadow: '0px 3px 4px rgba(0,0,0,0.9)'}}>BAR</text>
                
                {/* Curved Glass Highlight */}
                <path d="M 16 37 Q 48 45 80 37 V 43 Q 48 50 16 43 Z" fill="#fff" opacity="0.3" />
            </g>
        );
    };

    // --- 4. BELL (Traditional Shinto 'Suzu' Shrine Bell) ---
    const renderBell = () => (
        <g filter="url(#bevel3D)">
            {/* Top Handle / Rope attachment */}
            <path d="M 40 15 A 10 10 0 1 1 60 15" fill="none" stroke="url(#bellGold)" strokeWidth="6" strokeLinecap="round"/>
            
            {/* Main Round Bell Body */}
            <circle cx="50" cy="50" r="35" fill="url(#bellGold)" />
            
            {/* Horizontal indentations (traditional styling) */}
            <path d="M 17 40 Q 50 50 83 40" fill="none" stroke="#b37700" strokeWidth="2" opacity="0.5"/>
            <path d="M 15 50 Q 50 60 85 50" fill="none" stroke="#b37700" strokeWidth="2" opacity="0.5"/>

            {/* Smiling Slit (Sound hole) */}
            <path d="M 25 70 Q 50 80 75 70" fill="none" stroke="#4a2e00" strokeWidth="5" strokeLinecap="round" />
            <circle cx="25" cy="70" r="5" fill="#4a2e00" />
            <circle cx="75" cy="70" r="5" fill="#4a2e00" />

            {/* Spherical High Gloss */}
            <ellipse cx="35" cy="30" rx="12" ry="6" fill="#fff" opacity="0.6" transform="rotate(-30 35 30)" />
        </g>
    );

    // --- 5. WATERMELON (Lush, 3D Sliced Edge) ---
    const renderMelon = () => (
        <g filter="url(#bevel3D)">
            {/* Shadow Base */}
            <path d="M 10 50 Q 50 95 90 50 Z" fill="#002200" transform="translate(0, 5)"/>
            
            {/* Main Green Rind */}
            <path d="M 10 50 Q 50 95 90 50 Z" fill="url(#melonGreen)" stroke="#003300" strokeWidth="2" />
            
            {/* Dark Jagged Stripes */}
            <path d="M 30 50 Q 35 70 30 80 M 50 50 V 90 M 70 50 Q 65 70 70 80" fill="none" stroke="#001100" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
            
            {/* Cut Surface (Top) */}
            <path d="M 10 50 Q 50 20 90 50 Q 50 65 10 50 Z" fill="#e6ffe6" stroke="#004400" strokeWidth="1" />
            <path d="M 15 50 Q 50 25 85 50 Q 50 60 15 50 Z" fill="#ff3333" />
            
            {/* Seeds */}
            <g fill="#111" transform="translate(0, 2)">
                <ellipse cx="40" cy="45" rx="1.5" ry="3" transform="rotate(20 40 45)" />
                <ellipse cx="50" cy="48" rx="1.5" ry="3" />
                <ellipse cx="60" cy="45" rx="1.5" ry="3" transform="rotate(-20 60 45)" />
            </g>

            {/* Wet Gloss */}
            <path d="M 20 50 Q 50 30 80 50 Q 50 55 20 50 Z" fill="#fff" opacity="0.2" />
            <path d="M 15 60 Q 30 80 50 85" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        </g>
    );

    // --- 6. CHERRY (Deep red, 3D spheres, bonsai leaf) ---
    const renderCherry = () => (
        <g filter="url(#bevel3D)">
            {/* Stems */}
            <path d="M 50 20 Q 40 25 30 60" fill="none" stroke="#4a2e00" strokeWidth="3" strokeLinecap="round" />
            <path d="M 50 20 Q 65 25 70 65" fill="none" stroke="#4a2e00" strokeWidth="3" strokeLinecap="round" />
            
            {/* Traditional Leaf */}
            <path d="M 50 20 Q 75 5 85 20 Q 65 30 50 20 Z" fill="#228b22" stroke="#004d00" strokeWidth="1.5" />
            <path d="M 50 20 Q 70 15 80 20" fill="none" stroke="#004d00" strokeWidth="1" />

            {/* Left Cherry */}
            <circle cx="30" cy="65" r="18" fill="url(#cherryRed)" />
            <ellipse cx="23" cy="57" rx="6" ry="3" fill="#fff" opacity="0.7" transform="rotate(-30 23 57)" />
            <path d="M 25 78 A 12 12 0 0 0 42 70" fill="none" stroke="#ff8080" strokeWidth="1.5" opacity="0.5" /> {/* Bounce light */}

            {/* Right Cherry (Overlapping) */}
            <circle cx="70" cy="70" r="20" fill="url(#cherryRed)" />
            <ellipse cx="62" cy="61" rx="7" ry="3.5" fill="#fff" opacity="0.7" transform="rotate(-30 62 61)" />
            <path d="M 64 85 A 14 14 0 0 0 84 76" fill="none" stroke="#ff8080" strokeWidth="1.5" opacity="0.5" />
        </g>
    );

    // --- 7. REPLAY (Mitsudomoe Japanese Swirl Emblem) ---
    const renderReplay = () => {
        const color = islandId === 8 ? '#00f3ff' : (islandId === 3 ? '#ff4500' : '#4dabf7');
        return (
            <g filter="url(#bevel3D)">
                {/* 3D Coin Base */}
                <circle cx="50" cy="54" r="32" fill="#111" />
                <circle cx="50" cy="50" r="32" fill="url(#chrome)" stroke="#555" strokeWidth="2" />
                <circle cx="50" cy="50" r="24" fill="#050505" stroke="#333" strokeWidth="1" />
                
                {/* Mitsudomoe (Three comma swirl) inside */}
                <g transform="translate(50, 50) scale(0.4) rotate(0)" opacity="0.3" fill={color}>
                    <path d="M 0 -20 A 20 20 0 1 1 -17 10 A 10 10 0 1 0 0 -20 Z" />
                    <path d="M 0 -20 A 20 20 0 1 1 -17 10 A 10 10 0 1 0 0 -20 Z" transform="rotate(120)" />
                    <path d="M 0 -20 A 20 20 0 1 1 -17 10 A 10 10 0 1 0 0 -20 Z" transform="rotate(240)" />
                </g>

                {/* High-Tech Glowing Arrow Paths */}
                <path d="M 50 30 A 20 20 0 1 1 30 50" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" style={{filter: `drop-shadow(0 0 3px ${color})`}} />
                <polygon points="23,48 37,48 30,36" fill={color} style={{filter: `drop-shadow(0 0 3px ${color})`}} />
                
                <text x="50" y="54" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="900" letterSpacing="1" style={{textShadow: '0 1px 2px #000'}}>REPLAY</text>
                
                {/* Glass Cover over emblem */}
                <circle cx="50" cy="50" r="24" fill="url(#glassShine)" opacity="0.5" pointerEvents="none" />
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
                ${isWinning ? 'animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite] scale-[1.15] z-10 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'scale-100'} 
                ${variant === 'glitch' ? 'animate-[pulse_0.1s_linear_infinite]' : ''}
                ${variant === 'dim' ? 'brightness-50 grayscale-[50%]' : ''}
            `}
        >
            {renderDefs()}
            
            {/* Render the core symbol */}
            {renderSymbol()}

            {/* Win Highlight Box overlay */}
            {isWinning && (
                <rect x="4" y="4" width="92" height="92" rx="12" fill="none" stroke="url(#bellGold)" strokeWidth="3" filter="url(#winGlow)" className="animate-pulse" />
            )}
        </svg>
    );
};

export default memo(SymbolSVG);