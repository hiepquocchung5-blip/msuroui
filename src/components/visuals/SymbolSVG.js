import React, { memo } from 'react';

const SymbolSVG = ({ 
    id, 
    islandId = 1, 
    variant = 'normal', 
    isWinning = false 
}) => {

    // --- 1. DYNAMIC THEME ENGINE ---
    const getTheme = (island) => {
        const themes = {
            1: { aura: '#FFD700', particle: 'star' },     // Kyoto: Gold Stars
            2: { aura: '#00f3ff', particle: 'sparkle' },  // Neon: Cyan Sparkles
            3: { aura: '#ff4500', particle: 'ember' },    // Edo: Fire Embers
            4: { aura: '#ffb3c6', particle: 'petal' },    // Hanami: Sakura Petals
            5: { aura: '#8a2be2', particle: 'soul' },     // Yokai: Purple Soul Flames
        };
        return themes[island] || themes[1];
    };

    const theme = getTheme(islandId);

    // --- 2. PREMIUM 3D SHADERS & DEFINITIONS ---
    const renderDefs = () => (
        <defs>
            {/* Glossy Textures */}
            <radialGradient id="blueOrb" cx="40%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#80dfff" />
                <stop offset="30%" stopColor="#00aaff" />
                <stop offset="80%" stopColor="#0055ff" />
                <stop offset="100%" stopColor="#002288" />
            </radialGradient>

            <radialGradient id="cherryRed" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="15%" stopColor="#ff1a40" />
                <stop offset="60%" stopColor="#cc0000" />
                <stop offset="100%" stopColor="#4d0000" />
            </radialGradient>

            <linearGradient id="goldMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe680" />
                <stop offset="25%" stopColor="#ffcc00" />
                <stop offset="50%" stopColor="#b38600" />
                <stop offset="75%" stopColor="#ffcc00" />
                <stop offset="100%" stopColor="#4d3300" />
            </linearGradient>

            <linearGradient id="blueTexture" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#80d4ff" />
                <stop offset="50%" stopColor="#0077b3" />
                <stop offset="100%" stopColor="#002266" />
            </linearGradient>

            <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff99cc" />
                <stop offset="50%" stopColor="#ff3385" />
                <stop offset="100%" stopColor="#b30047" />
            </linearGradient>

            {/* Gems */}
            <linearGradient id="gemBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00ffff"/><stop offset="100%" stopColor="#000080"/></linearGradient>
            <linearGradient id="gemGreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00ff00"/><stop offset="100%" stopColor="#003300"/></linearGradient>
            <linearGradient id="gemPink" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff00ff"/><stop offset="100%" stopColor="#800080"/></linearGradient>

            {/* Filters */}
            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.7"/>
                <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#000" floodOpacity="0.9"/>
            </filter>

            <filter id="winPulse" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 3 0" />
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>

            {/* Light Rays */}
            <radialGradient id="lightRay" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="50%" stopColor={theme.aura} stopOpacity="0.4" />
                <stop offset="100%" stopColor={theme.aura} stopOpacity="0" />
            </radialGradient>
        </defs>
    );

    // --- 3. GEMINI FEATURE: DYNAMIC WIN AURA ---
    const renderWinAura = () => {
        if (!isWinning) return null;
        return (
            <g className="pointer-events-none">
                {/* Background Burst */}
                <circle cx="50" cy="50" r="45" fill="url(#lightRay)">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="scale" values="0.9; 1.1; 0.9" dur="1s" repeatCount="indefinite" transformOrigin="50 50" />
                </circle>
                
                {/* Rotating Light Beams */}
                <g opacity="0.6">
                    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="4s" repeatCount="indefinite" />
                    <polygon points="48,10 52,10 50,50" fill="url(#lightRay)" />
                    <polygon points="48,90 52,90 50,50" fill="url(#lightRay)" />
                    <polygon points="10,48 10,52 50,50" fill="url(#lightRay)" />
                    <polygon points="90,48 90,52 50,50" fill="url(#lightRay)" />
                </g>

                {/* Particles */}
                {[...Array(6)].map((_, i) => (
                    <circle key={i} cx="50" cy="50" r={Math.random() * 2 + 1} fill="#FFF" filter="drop-shadow(0 0 2px #FFF)">
                        <animateTransform 
                            attributeName="transform" 
                            type="translate" 
                            values={`0 0; ${Math.cos(i * 60) * 40} ${Math.sin(i * 60) * 40}`} 
                            dur={`${Math.random() * 1 + 0.5}s`} 
                            repeatCount="indefinite" 
                        />
                        <animate attributeName="opacity" values="1;0" dur={`${Math.random() * 1 + 0.5}s`} repeatCount="indefinite" />
                    </circle>
                ))}
            </g>
        );
    };

    // --- 4. HIGH FIDELITY SYMBOL RECREATIONS ---

    // ID 1: GRAND JP (Matches Image 18)
    const renderGrandJP = () => (
        <g filter="url(#dropShadow)">
            {/* Background Light Burst */}
            <circle cx="50" cy="50" r="40" fill="url(#lightRay)" opacity="0.5" />
            
            {/* Crown */}
            <path d="M 20 45 L 25 20 L 38 35 L 50 15 L 62 35 L 75 20 L 80 45 Z" fill="url(#goldMetal)" stroke="#663300" strokeWidth="1" />
            <circle cx="25" cy="20" r="3" fill="url(#gemBlue)" />
            <circle cx="50" cy="15" r="4" fill="url(#gemPink)" />
            <circle cx="75" cy="20" r="3" fill="url(#gemGreen)" />
            
            {/* Ribbon Background */}
            <path d="M 5 60 Q 50 70 95 60 L 90 75 Q 50 85 10 75 Z" fill="#cc0000" />
            
            {/* GRAND Text */}
            <text x="50" y="52" textAnchor="middle" fill="url(#goldMetal)" fontSize="20" fontWeight="900" stroke="#4d0000" strokeWidth="2" letterSpacing="1" style={{fontFamily: 'Impact, sans-serif'}}>GRAND</text>
            <text x="50" y="52" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="900" stroke="none" letterSpacing="1" opacity="0.4" style={{fontFamily: 'Impact, sans-serif'}}>GRAND</text>
            
            {/* JP Text */}
            <text x="50" y="78" textAnchor="middle" fill="url(#goldMetal)" fontSize="32" fontWeight="900" stroke="#4d0000" strokeWidth="2" style={{fontFamily: 'Impact, sans-serif'}}>JP</text>
            
            {/* Gems at Bottom */}
            <polygon points="30,85 20,95 40,95" fill="url(#gemBlue)" stroke="#fff" strokeWidth="0.5" />
            <polygon points="50,82 40,95 60,95" fill="url(#gemGreen)" stroke="#fff" strokeWidth="0.5" />
            <polygon points="70,85 60,95 80,95" fill="url(#gemPink)" stroke="#fff" strokeWidth="0.5" />
        </g>
    );

    // ID 2: SLOPARA (Matches Image 17)
    const renderSlopara = () => (
        <g filter="url(#dropShadow)">
            {/* Bright Aura */}
            <circle cx="50" cy="50" r="45" fill="url(#lightRay)" opacity="0.3" />
            
            {/* Twin Tails (Blonde) */}
            <path d="M 50 40 Q 10 30 15 80 Q 25 60 40 40" fill="#ffd700" />
            <path d="M 50 40 Q 90 30 85 80 Q 75 60 60 40" fill="#ffd700" />
            
            {/* Pink Bows */}
            <polygon points="35,25 20,20 25,35" fill="url(#pinkGradient)" />
            <polygon points="65,25 80,20 75,35" fill="url(#pinkGradient)" />

            {/* Face */}
            <circle cx="50" cy="45" r="20" fill="#fff0e6" />
            
            {/* Anime Eyes (Large Blue) */}
            <ellipse cx="42" cy="45" rx="4" ry="6" fill="#0055ff" />
            <circle cx="43" cy="43" r="1.5" fill="#fff" />
            <ellipse cx="58" cy="45" rx="4" ry="6" fill="#0055ff" />
            <circle cx="57" cy="43" r="1.5" fill="#fff" />
            
            {/* Happy Mouth */}
            <path d="M 45 52 Q 50 58 55 52 Z" fill="#ff4d4d" />
            
            {/* Idol Outfit Top */}
            <path d="M 35 60 Q 50 65 65 60 L 60 75 Q 50 80 40 75 Z" fill="url(#pinkGradient)" />
            <polygon points="50,68 45,63 55,63" fill="url(#goldMetal)" />

            {/* SLOPARA 3D Logo */}
            <g transform="translate(50, 88)">
                <text x="0" y="0" textAnchor="middle" fill="#cc0000" fontSize="22" fontWeight="900" stroke="#fff" strokeWidth="3" letterSpacing="0" style={{fontFamily: 'Impact, sans-serif'}}>SLOPARA</text>
                <text x="0" y="0" textAnchor="middle" fill="url(#goldMetal)" fontSize="22" fontWeight="900" stroke="#800000" strokeWidth="0.5" letterSpacing="0" style={{fontFamily: 'Impact, sans-serif'}}>SLOPARA</text>
            </g>
        </g>
    );

    // ID 3: SEVEN (Matches Image 16)
    const renderSeven = () => (
        <g filter="url(#dropShadow)">
            {/* Deep Gold Outer Border (3D Extrusion) */}
            <path d="M 18 18 L 88 18 L 88 38 L 52 92 L 28 92 L 60 42 L 18 42 Z" fill="#4d3300" transform="translate(2, 4)" />
            
            {/* Main Gold Rim */}
            <path d="M 15 15 L 85 15 L 85 35 L 50 88 L 30 88 L 60 40 L 15 40 Z" fill="url(#goldMetal)" stroke="#331a00" strokeWidth="1" />
            
            {/* Inner Gold Lip */}
            <path d="M 22 22 L 78 22 L 78 30 L 46 82 L 38 82 L 66 36 L 22 36 Z" fill="#805500" />
            
            {/* Blue Textured Core */}
            <path d="M 25 25 L 75 25 L 75 28 L 44 78 L 40 78 L 65 33 L 25 33 Z" fill="url(#blueTexture)" />
            
            {/* Hand-painted white gloss highlights */}
            <path d="M 28 26 L 68 26 L 62 29 L 28 29 Z" fill="#ffffff" opacity="0.6" />
            <path d="M 64 36 L 43 72 L 41 72 L 61 36 Z" fill="#ffffff" opacity="0.3" />
            
            {/* Gold Sparkles at base */}
            <circle cx="35" cy="85" r="5" fill="url(#goldMetal)" filter="url(#dropShadow)" opacity="0.8" />
            <circle cx="55" cy="88" r="4" fill="url(#goldMetal)" filter="url(#dropShadow)" opacity="0.8" />
        </g>
    );

    // ID 4: BELL (Matches Image 13)
    const renderBell = () => (
        <g filter="url(#dropShadow)">
            {/* Stack of Gold Coins underneath */}
            <ellipse cx="40" cy="85" rx="15" ry="5" fill="url(#goldMetal)" stroke="#664d00" strokeWidth="1" />
            <ellipse cx="65" cy="82" rx="15" ry="5" fill="url(#goldMetal)" stroke="#664d00" strokeWidth="1" />
            <ellipse cx="30" cy="78" rx="15" ry="5" fill="url(#goldMetal)" stroke="#664d00" strokeWidth="1" />
            <ellipse cx="75" cy="75" rx="15" ry="5" fill="url(#goldMetal)" stroke="#664d00" strokeWidth="1" />
            <ellipse cx="50" cy="88" rx="18" ry="6" fill="url(#goldMetal)" stroke="#664d00" strokeWidth="1" />

            {/* Top Knob */}
            <circle cx="50" cy="15" r="8" fill="url(#goldMetal)" />
            <path d="M 45 22 L 55 22 L 55 30 L 45 30 Z" fill="#664d00" />
            
            {/* Bell Body */}
            <path d="M 50 25 C 20 25, 10 60, 5 70 C 5 80, 95 80, 95 70 C 90 60, 80 25, 50 25 Z" fill="url(#goldMetal)" />
            
            {/* Dark Inner Hollow */}
            <ellipse cx="50" cy="72" rx="42" ry="12" fill="#332200" />
            
            {/* Clapper / Ringer */}
            <path d="M 50 65 L 50 82" stroke="#cca300" strokeWidth="4" />
            <circle cx="50" cy="85" r="8" fill="url(#goldMetal)" />
            
            {/* Etched Lines */}
            <path d="M 16 50 Q 50 65 84 50" fill="none" stroke="#664d00" strokeWidth="2" />
            <path d="M 12 60 Q 50 75 88 60" fill="none" stroke="#664d00" strokeWidth="2" />
            
            {/* Glare */}
            <path d="M 30 30 C 20 40, 20 60, 20 60 C 25 60, 35 40, 35 30 Z" fill="#ffffff" opacity="0.4" />
        </g>
    );

    // ID 5: WATERMELON (Matches Image 14)
    const renderMelon = () => (
        <g filter="url(#dropShadow)">
            {/* Dark Green Rind Base */}
            <path d="M 5 45 Q 50 100 95 45 Z" fill="#003300" />
            
            {/* Bright Green Rind */}
            <path d="M 8 45 Q 50 95 92 45 Z" fill="url(#gemGreen)" />
            
            {/* Inner Yellow/White Rind Edge */}
            <path d="M 12 45 Q 50 85 88 45 Z" fill="#e6ffcc" />
            
            {/* Bright Red Flesh */}
            <path d="M 15 45 Q 50 80 85 45 L 50 20 Z" fill="url(#cherryRed)" />
            
            {/* Realistic Black Seeds with highlights */}
            <g fill="#1a0000">
                {/* Row 1 */}
                <ellipse cx="40" cy="35" rx="2" ry="4" transform="rotate(25 40 35)" />
                <ellipse cx="50" cy="38" rx="2" ry="4" />
                <ellipse cx="60" cy="35" rx="2" ry="4" transform="rotate(-25 60 35)" />
                {/* Row 2 */}
                <ellipse cx="32" cy="45" rx="2" ry="4" transform="rotate(35 32 45)" />
                <ellipse cx="43" cy="50" rx="2" ry="4" transform="rotate(15 43 50)" />
                <ellipse cx="57" cy="50" rx="2" ry="4" transform="rotate(-15 57 50)" />
                <ellipse cx="68" cy="45" rx="2" ry="4" transform="rotate(-35 68 45)" />
            </g>
            
            {/* Wet Juice Glare */}
            <path d="M 25 40 Q 50 65 75 40 L 50 28 Z" fill="#ffffff" opacity="0.3" />
            
            {/* Splash at the bottom */}
            <ellipse cx="50" cy="85" rx="30" ry="5" fill="#00ffff" opacity="0.4" filter="url(#winPulse)" />
        </g>
    );

    // ID 6: CHERRY (Matches Image 12)
    const renderCherry = () => (
        <g filter="url(#dropShadow)">
            {/* Stems */}
            <path d="M 50 15 Q 35 30 30 60" fill="none" stroke="#336600" strokeWidth="4" strokeLinecap="round" />
            <path d="M 50 15 Q 65 30 70 60" fill="none" stroke="#336600" strokeWidth="4" strokeLinecap="round" />
            
            {/* Stem Knot */}
            <rect x="45" y="10" width="10" height="6" rx="2" fill="#663300" />
            
            {/* Leaves */}
            <path d="M 50 15 Q 10 -5 15 35 Q 35 35 50 15" fill="url(#gemGreen)" stroke="#003300" strokeWidth="1" />
            <path d="M 50 15 Q 90 -5 85 35 Q 65 35 50 15" fill="url(#gemGreen)" stroke="#003300" strokeWidth="1" />
            
            {/* Left Cherry */}
            <circle cx="30" cy="65" r="22" fill="url(#cherryRed)" />
            <ellipse cx="20" cy="55" rx="8" ry="4" fill="#ffffff" opacity="0.8" transform="rotate(-40 20 55)" />
            
            {/* Right Cherry (Overlapping) */}
            <circle cx="70" cy="68" r="24" fill="url(#cherryRed)" />
            <ellipse cx="60" cy="56" rx="9" ry="4.5" fill="#ffffff" opacity="0.8" transform="rotate(-40 60 56)" />
        </g>
    );

    // ID 7: REPLAY (Matches Image 11)
    const renderReplay = () => (
        <g filter="url(#dropShadow)">
            {/* Outer Blue Metallic Rim */}
            <circle cx="50" cy="45" r="40" fill="url(#blueTexture)" />
            <circle cx="50" cy="45" r="35" fill="url(#blueOrb)" />
            
            {/* Inner Glowing Core */}
            <circle cx="50" cy="45" r="28" fill="#00f3ff" opacity="0.4" />
            <circle cx="50" cy="45" r="20" fill="#ccffff" opacity="0.6" filter="url(#winPulse)" />

            {/* Circular Arrows (White) */}
            <g transform="translate(50, 45) scale(1.1)" fill="#ffffff">
                <path d="M -15 -5 A 18 18 0 0 1 10 -15 L 10 -22 L 22 -12 L 10 -2 L 10 -9 A 12 12 0 0 0 -10 0 Z" />
                <path d="M 15 5 A 18 18 0 0 1 -10 15 L -10 22 L -22 12 L -10 2 L -10 9 A 12 12 0 0 0 10 0 Z" />
            </g>

            {/* Bottom Ribbon */}
            <path d="M 10 70 Q 50 85 90 70 L 85 85 Q 50 95 15 85 Z" fill="#0044cc" />
            <path d="M 20 65 L 80 65 L 85 85 L 15 85 Z" fill="url(#blueOrb)" />
            
            {/* REPLAY Text */}
            <text x="50" y="80" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900" letterSpacing="1" style={{fontFamily: 'Impact, sans-serif'}} stroke="#003399" strokeWidth="1">REPLAY</text>
            
            {/* Glass Dome Glare */}
            <ellipse cx="40" cy="25" rx="20" ry="10" fill="#ffffff" opacity="0.5" transform="rotate(-25 40 25)" pointerEvents="none" />
        </g>
    );

    // --- 5. COMPONENT ROUTER ---
    const renderSymbolContent = () => {
        switch(parseInt(id)) {
            case 1: return renderGrandJP(); 
            case 2: return renderSlopara();
            case 3: return renderSeven();
            case 4: return renderBell();
            case 5: return renderMelon();
            case 6: return renderCherry();
            case 7: return renderReplay(); 
            default: return <circle cx="50" cy="50" r="20" fill="#333" filter="url(#dropShadow)" />;
        }
    };

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
            
            {/* Dynamic Gemini Aura (Triggers on win) */}
            {renderWinAura()}

            {/* Main Hand-drawn Vector Artwork */}
            {renderSymbolContent()}

            {/* Glowing Border Box on Win */}
            {isWinning && (
                <rect 
                    x="2" y="2" width="96" height="96" rx="16" 
                    fill="none" stroke={theme.aura} strokeWidth="4" 
                    filter="url(#winPulse)" 
                    pointerEvents="none" 
                    className="animate-pulse"
                />
            )}
        </svg>
    );
};

export default memo(SymbolSVG);