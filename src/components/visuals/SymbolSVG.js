import React, { memo } from 'react';

const SymbolSVG = ({ 
    id, 
    islandId = 1, 
    variant = 'normal', 
    isWinning = false 
}) => {

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

    const theme = getTheme(islandId);

    // --- 2. PREMIUM 3D SHADERS & DEFINITIONS ---
    const renderDefs = () => (
        <defs>
            {/* Image 11: Replay Blue Orb */}
            <radialGradient id="replayOrb" cx="40%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#b3ebff" />
                <stop offset="30%" stopColor="#00aaff" />
                <stop offset="70%" stopColor="#0055cc" />
                <stop offset="100%" stopColor="#001144" />
            </radialGradient>

            {/* Image 12: Deep Cherry Gloss */}
            <radialGradient id="cherryRed" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="15%" stopColor="#ff1a40" />
                <stop offset="50%" stopColor="#cc0000" />
                <stop offset="85%" stopColor="#4d0000" />
                <stop offset="100%" stopColor="#1a0000" />
            </radialGradient>
            
            <linearGradient id="leafGreen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a3ff47" />
                <stop offset="50%" stopColor="#2eb82e" />
                <stop offset="100%" stopColor="#004d00" />
            </linearGradient>

            {/* Image 13 & 18: Rich Gold Metal */}
            <linearGradient id="goldMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff2a8" />
                <stop offset="25%" stopColor="#ffcc00" />
                <stop offset="50%" stopColor="#b38600" />
                <stop offset="75%" stopColor="#ffcc00" />
                <stop offset="100%" stopColor="#4d3300" />
            </linearGradient>

            {/* Image 14: Melon Textures */}
            <linearGradient id="melonFlesh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffcccc" />
                <stop offset="20%" stopColor="#ff3333" />
                <stop offset="80%" stopColor="#cc0000" />
                <stop offset="100%" stopColor="#e6ffcc" />
            </linearGradient>

            {/* Image 16: Blue Textured 7 */}
            <linearGradient id="sevenBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#66ccff" />
                <stop offset="40%" stopColor="#0066cc" />
                <stop offset="100%" stopColor="#001133" />
            </linearGradient>

            {/* Image 17: Slopara Pink/Blonde */}
            <linearGradient id="blondeHair" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff5cc" />
                <stop offset="50%" stopColor="#ffcc00" />
                <stop offset="100%" stopColor="#cc7a00" />
            </linearGradient>
            <linearGradient id="magicalPink" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff99cc" />
                <stop offset="100%" stopColor="#cc0052" />
            </linearGradient>

            {/* Gems for JP */}
            <radialGradient id="gemCyan" cx="30%" cy="30%" r="70%"><stop offset="0%" stopColor="#ffffff"/><stop offset="40%" stopColor="#00ffff"/><stop offset="100%" stopColor="#006666"/></radialGradient>
            <radialGradient id="gemGreen" cx="30%" cy="30%" r="70%"><stop offset="0%" stopColor="#ffffff"/><stop offset="40%" stopColor="#00ff00"/><stop offset="100%" stopColor="#004d00"/></radialGradient>
            <radialGradient id="gemMagenta" cx="30%" cy="30%" r="70%"><stop offset="0%" stopColor="#ffffff"/><stop offset="40%" stopColor="#ff00ff"/><stop offset="100%" stopColor="#660066"/></radialGradient>

            {/* 3D Shadows & Lighting */}
            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.75"/>
                <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#000" floodOpacity="0.9"/>
            </filter>

            <filter id="innerGlow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="3" specularConstant="1.5" specularExponent="20" lightingColor="#ffffff" result="spec">
                    <fePointLight x="-10" y="-10" z="30"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
            </filter>

            {/* Gemini Aura Win Pulse */}
            <filter id="winPulse" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 3 0" />
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>

            <radialGradient id="auraRay" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="40%" stopColor={theme.aura} stopOpacity="0.6" />
                <stop offset="100%" stopColor={theme.aura} stopOpacity="0" />
            </radialGradient>
        </defs>
    );

    // --- 3. GEMINI FEATURE: DYNAMIC WIN AURA ---
    const renderWinAura = () => {
        if (!isWinning) return null;
        return (
            <g className="pointer-events-none">
                {/* Expanding Energy Ring */}
                <circle cx="50" cy="50" r="45" fill="none" stroke={theme.aura} strokeWidth="2" opacity="0.8">
                    <animate attributeName="r" values="30; 55; 30" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8; 0; 0.8" dur="1.5s" repeatCount="indefinite" />
                </circle>
                
                {/* Backlight Burst */}
                <circle cx="50" cy="50" r="40" fill="url(#auraRay)">
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

    // --- 4. HIGH FIDELITY SYMBOL RECREATIONS (Matched to Images) ---

    // ID 1: GRAND JP (Matches Image 18 - Golden Crown, Coins, Gems)
    const renderGrandJP = () => (
        <g filter="url(#dropShadow)">
            {/* Background Light Burst */}
            <circle cx="50" cy="50" r="45" fill="url(#auraRay)" opacity="0.6" />
            
            {/* Palm Fronds (Background) */}
            <path d="M 20 60 Q 5 40 10 20 Q 25 35 30 50 Z" fill="#006600" />
            <path d="M 80 60 Q 95 40 90 20 Q 75 35 70 50 Z" fill="#006600" />
            
            {/* Pile of Gold Coins */}
            <g stroke="#805500" strokeWidth="0.5">
                <ellipse cx="25" cy="75" rx="14" ry="6" fill="url(#goldMetal)" />
                <ellipse cx="75" cy="75" rx="14" ry="6" fill="url(#goldMetal)" />
                <ellipse cx="15" cy="82" rx="12" ry="5" fill="url(#goldMetal)" />
                <ellipse cx="85" cy="82" rx="12" ry="5" fill="url(#goldMetal)" />
                <ellipse cx="50" cy="88" rx="18" ry="7" fill="url(#goldMetal)" />
            </g>

            {/* Huge 3D "GRAND JP" Text */}
            <g transform="translate(50, 48)">
                {/* 3D Extrusion */}
                <text x="0" y="4" textAnchor="middle" fill="#4d0000" fontSize="24" fontWeight="900" stroke="#4d0000" strokeWidth="6" style={{fontFamily: 'Impact, sans-serif'}}>GRAND</text>
                <text x="0" y="0" textAnchor="middle" fill="url(#goldMetal)" fontSize="24" fontWeight="900" stroke="#fff" strokeWidth="1" letterSpacing="1" style={{fontFamily: 'Impact, sans-serif'}}>GRAND</text>
                
                <text x="0" y="32" textAnchor="middle" fill="#4d0000" fontSize="34" fontWeight="900" stroke="#4d0000" strokeWidth="8" style={{fontFamily: 'Impact, sans-serif'}}>JP</text>
                <text x="0" y="28" textAnchor="middle" fill="#ff1a1a" fontSize="34" fontWeight="900" stroke="url(#goldMetal)" strokeWidth="2" style={{fontFamily: 'Impact, sans-serif'}}>JP</text>
            </g>

            {/* The Crown */}
            <g transform="translate(50, 22) scale(0.8)">
                <path d="M -30 10 L -20 -15 L -10 5 L 0 -20 L 10 5 L 20 -15 L 30 10 Z" fill="url(#goldMetal)" stroke="#663300" strokeWidth="1" filter="url(#innerGlow)" />
                <circle cx="-20" cy="-15" r="4" fill="url(#gemCyan)" />
                <circle cx="0" cy="-20" r="5" fill="url(#gemMagenta)" />
                <circle cx="20" cy="-15" r="4" fill="url(#gemGreen)" />
                <path d="M -25 10 Q 0 15 25 10" fill="none" stroke="#ff0000" strokeWidth="3" />
            </g>

            {/* Massive Foreground Gems */}
            <polygon points="35,80 25,95 45,95" fill="url(#gemCyan)" stroke="#fff" strokeWidth="1" filter="url(#innerGlow)" />
            <polygon points="65,80 55,95 75,95" fill="url(#gemGreen)" stroke="#fff" strokeWidth="1" filter="url(#innerGlow)" />
            <polygon points="50,75 35,90 65,90" fill="url(#gemMagenta)" stroke="#fff" strokeWidth="1" filter="url(#innerGlow)" />
        </g>
    );

    // ID 2: SLOPARA (Matches Image 17 - Anime Girl with Twin Tails & Bows)
    const renderSlopara = () => (
        <g filter="url(#dropShadow)">
            <circle cx="50" cy="50" r="45" fill="url(#auraRay)" opacity="0.4" />
            
            {/* Twin Tails (Blonde) */}
            <path d="M 50 30 Q -10 10 5 80 Q 20 60 40 30" fill="url(#blondeHair)" stroke="#b37700" strokeWidth="1" filter="url(#innerGlow)"/>
            <path d="M 50 30 Q 110 10 95 80 Q 80 60 60 30" fill="url(#blondeHair)" stroke="#b37700" strokeWidth="1" filter="url(#innerGlow)"/>
            
            {/* Hair Bows */}
            <path d="M 30 25 L 15 15 L 20 35 Z" fill="url(#magicalPink)" stroke="#fff" strokeWidth="0.5" />
            <path d="M 70 25 L 85 15 L 80 35 Z" fill="url(#magicalPink)" stroke="#fff" strokeWidth="0.5" />
            <polygon points="28,25 33,20 38,25 33,30" fill="url(#goldMetal)" />
            <polygon points="72,25 67,20 62,25 67,30" fill="url(#goldMetal)" />

            {/* Anime Face & Head */}
            <circle cx="50" cy="40" r="22" fill="#fff0e6" stroke="#e6b3b3" strokeWidth="1" />
            
            {/* Eyes */}
            <ellipse cx="40" cy="40" rx="5" ry="7" fill="#0066cc" />
            <circle cx="41" cy="38" r="2" fill="#fff" />
            <ellipse cx="60" cy="40" rx="5" ry="7" fill="#0066cc" />
            <circle cx="59" cy="38" r="2" fill="#fff" />
            
            {/* Smile & Blush */}
            <path d="M 45 48 Q 50 55 55 48 Z" fill="#ff4d4d" />
            <ellipse cx="32" cy="45" rx="4" ry="2" fill="#ff9999" opacity="0.6" />
            <ellipse cx="68" cy="45" rx="4" ry="2" fill="#ff9999" opacity="0.6" />
            
            {/* Magical Girl Chest Bow */}
            <path d="M 50 65 L 30 60 L 40 75 Z" fill="url(#magicalPink)" />
            <path d="M 50 65 L 70 60 L 60 75 Z" fill="url(#magicalPink)" />
            <polygon points="50,60 55,68 45,68" fill="url(#goldMetal)" />

            {/* 3D "SLOPARA" Text Logo */}
            <g transform="translate(50, 88)">
                <text x="0" y="2" textAnchor="middle" fill="#800000" fontSize="22" fontWeight="900" stroke="#fff" strokeWidth="3" style={{fontFamily: 'Impact, sans-serif'}}>SLOPARA</text>
                <text x="0" y="0" textAnchor="middle" fill="url(#goldMetal)" fontSize="22" fontWeight="900" stroke="#cc0000" strokeWidth="0.5" style={{fontFamily: 'Impact, sans-serif'}}>SLOPARA</text>
            </g>
        </g>
    );

    // ID 3: SEVEN (Matches Image 16 - Blue Core, Double Gold Rim)
    const renderSeven = () => (
        <g filter="url(#dropShadow)">
            {/* Base Extrusion (Shadow side) */}
            <path d="M 18 22 L 88 22 L 88 42 L 52 92 L 28 92 L 60 46 L 18 46 Z" fill="#4d2600" transform="translate(2, 4)" />
            
            {/* Outer Thick Gold Rim */}
            <path d="M 15 15 L 85 15 L 85 38 L 48 90 L 25 90 L 58 42 L 15 42 Z" fill="url(#goldMetal)" stroke="#331a00" strokeWidth="1" filter="url(#innerGlow)" />
            
            {/* Inner Dark Gold Trench */}
            <path d="M 23 23 L 77 23 L 77 34 L 43 82 L 33 82 L 64 38 L 23 38 Z" fill="#805500" />
            
            {/* Center Textured Blue Core */}
            <path d="M 26 26 L 74 26 L 74 31 L 41 78 L 37 78 L 62 35 L 26 35 Z" fill="url(#sevenBlue)" filter="url(#innerGlow)" />
            
            {/* High-Gloss Hand Painted Highlights */}
            <path d="M 28 27 L 70 27 L 65 30 L 28 30 Z" fill="#ffffff" opacity="0.6" pointerEvents="none" />
            <path d="M 64 36 L 43 72 L 41 72 L 61 36 Z" fill="#ffffff" opacity="0.4" pointerEvents="none" />
            <path d="M 20 18 L 80 18 L 78 20 L 20 20 Z" fill="#ffffff" opacity="0.8" pointerEvents="none" />
            
            {/* Base Sparkles */}
            <circle cx="30" cy="85" r="4" fill="url(#goldMetal)" filter="url(#dropShadow)" opacity="0.9" />
            <circle cx="55" cy="88" r="3" fill="url(#goldMetal)" filter="url(#dropShadow)" opacity="0.9" />
        </g>
    );

    // ID 4: BELL (Matches Image 13 - Massive Gold Bell on Coins)
    const renderBell = () => (
        <g filter="url(#dropShadow)">
            {/* Large Coin Pile */}
            <g stroke="#805500" strokeWidth="0.5">
                <ellipse cx="30" cy="80" rx="16" ry="6" fill="url(#goldMetal)" />
                <ellipse cx="70" cy="82" rx="16" ry="6" fill="url(#goldMetal)" />
                <ellipse cx="20" cy="86" rx="16" ry="6" fill="url(#goldMetal)" />
                <ellipse cx="80" cy="86" rx="16" ry="6" fill="url(#goldMetal)" />
                <ellipse cx="50" cy="90" rx="20" ry="7" fill="url(#goldMetal)" />
                <ellipse cx="40" cy="85" rx="16" ry="6" fill="url(#goldMetal)" />
                <ellipse cx="60" cy="87" rx="16" ry="6" fill="url(#goldMetal)" />
            </g>

            {/* Bell Knob */}
            <circle cx="50" cy="18" r="8" fill="url(#goldMetal)" filter="url(#innerGlow)" />
            <path d="M 44 24 L 56 24 L 56 32 L 44 32 Z" fill="#805500" />
            
            {/* Main Bell Body */}
            <path d="M 50 28 C 20 28, 10 65, 5 75 C 5 85, 95 85, 95 75 C 90 65, 80 28, 50 28 Z" fill="url(#goldMetal)" filter="url(#innerGlow)" />
            
            {/* Bottom Opening (Dark Hollow) */}
            <ellipse cx="50" cy="78" rx="43" ry="12" fill="#331a00" />
            
            {/* Hanging Clapper */}
            <path d="M 50 65 L 50 85" stroke="#cca300" strokeWidth="5" strokeLinecap="round" />
            <circle cx="50" cy="88" r="10" fill="url(#goldMetal)" filter="url(#innerGlow)" />
            
            {/* Horizontal Etched Rings */}
            <path d="M 15 55 Q 50 70 85 55" fill="none" stroke="#996600" strokeWidth="2.5" />
            <path d="M 10 65 Q 50 80 90 65" fill="none" stroke="#996600" strokeWidth="2.5" />
            
            {/* Massive White Glare */}
            <path d="M 28 35 C 20 45, 18 65, 18 65 C 25 65, 35 45, 35 35 Z" fill="#ffffff" opacity="0.5" pointerEvents="none" />
        </g>
    );

    // ID 5: WATERMELON (Matches Image 14 - Glossy Rind, Red Flesh, Seeds)
    const renderMelon = () => (
        <g filter="url(#dropShadow)">
            {/* Deep Green Outer Rind */}
            <path d="M 5 45 Q 50 105 95 45 Z" fill="#003300" />
            
            {/* Bright Green Rind Layer */}
            <path d="M 8 45 Q 50 100 92 45 Z" fill="#00cc00" filter="url(#innerGlow)" />
            
            {/* Tiger Stripes on Rind */}
            <path d="M 30 45 Q 35 65 25 80 M 50 45 V 90 M 70 45 Q 65 65 75 80" fill="none" stroke="#004d00" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
            
            {/* Inner White/Yellow Rind */}
            <path d="M 12 45 Q 50 88 88 45 Z" fill="#e6ffcc" />
            
            {/* Juicy Red Flesh */}
            <path d="M 15 45 Q 50 82 85 45 L 50 18 Z" fill="url(#melonFlesh)" filter="url(#innerGlow)" />
            
            {/* Highly Detailed Black Seeds */}
            <g fill="#1a0000">
                {/* Top Row */}
                <ellipse cx="40" cy="35" rx="2.5" ry="5" transform="rotate(25 40 35)" />
                <ellipse cx="50" cy="38" rx="2.5" ry="5" />
                <ellipse cx="60" cy="35" rx="2.5" ry="5" transform="rotate(-25 60 35)" />
                {/* Bottom Row */}
                <ellipse cx="32" cy="48" rx="2.5" ry="5" transform="rotate(40 32 48)" />
                <ellipse cx="43" cy="54" rx="2.5" ry="5" transform="rotate(15 43 54)" />
                <ellipse cx="57" cy="54" rx="2.5" ry="5" transform="rotate(-15 57 54)" />
                <ellipse cx="68" cy="48" rx="2.5" ry="5" transform="rotate(-40 68 48)" />
            </g>
            
            {/* Wet Juice Reflections */}
            <path d="M 25 40 Q 50 68 75 40 L 50 25 Z" fill="#ffffff" opacity="0.25" pointerEvents="none" />
            <circle cx="20" cy="40" r="3" fill="#fff" opacity="0.6" pointerEvents="none" />
            <circle cx="80" cy="40" r="2" fill="#fff" opacity="0.6" pointerEvents="none" />
        </g>
    );

    // ID 6: CHERRY (Matches Image 12 - Two giant glossy cherries, detailed leaves)
    const renderCherry = () => (
        <g filter="url(#dropShadow)">
            {/* Light Green Stems */}
            <path d="M 50 15 Q 35 30 30 65" fill="none" stroke="#66cc00" strokeWidth="5" strokeLinecap="round" />
            <path d="M 50 15 Q 65 30 70 70" fill="none" stroke="#66cc00" strokeWidth="5" strokeLinecap="round" />
            
            {/* Wood Knot at top */}
            <rect x="44" y="10" width="12" height="7" rx="2" fill="#8b4513" stroke="#4a2500" strokeWidth="1" />
            
            {/* Left Huge Leaf */}
            <g filter="url(#innerGlow)">
                <path d="M 48 18 Q 5 0 10 35 Q 30 40 48 18 Z" fill="url(#leafGreen)" stroke="#004d00" strokeWidth="1.5" />
                <path d="M 45 18 Q 20 15 15 30" fill="none" stroke="#004d00" strokeWidth="1.5" opacity="0.6" />
            </g>

            {/* Right Huge Leaf */}
            <g filter="url(#innerGlow)">
                <path d="M 52 18 Q 95 0 90 35 Q 70 40 52 18 Z" fill="url(#leafGreen)" stroke="#004d00" strokeWidth="1.5" />
                <path d="M 55 18 Q 80 15 85 30" fill="none" stroke="#004d00" strokeWidth="1.5" opacity="0.6" />
            </g>
            
            {/* Left Cherry Orb */}
            <circle cx="30" cy="65" r="22" fill="url(#cherryRed)" filter="url(#innerGlow)" />
            {/* Left Cherry Gloss */}
            <ellipse cx="20" cy="55" rx="8" ry="4" fill="#ffffff" opacity="0.8" transform="rotate(-30 20 55)" pointerEvents="none" />
            <circle cx="38" cy="78" r="3" fill="#ff9999" opacity="0.5" pointerEvents="none" />
            
            {/* Right Cherry Orb (Overlapping) */}
            <circle cx="70" cy="68" r="24" fill="url(#cherryRed)" filter="url(#innerGlow)" />
            {/* Right Cherry Gloss */}
            <ellipse cx="60" cy="57" rx="9" ry="4.5" fill="#ffffff" opacity="0.8" transform="rotate(-30 60 57)" pointerEvents="none" />
            <circle cx="80" cy="82" r="3.5" fill="#ff9999" opacity="0.5" pointerEvents="none" />
        </g>
    );

    // ID 7: REPLAY (Matches Image 11 - Blue Glass Orb, Silver Arrows, Ribbon)
    const renderReplay = () => (
        <g filter="url(#dropShadow)">
            {/* Outer Dark Rim */}
            <circle cx="50" cy="45" r="38" fill="#003399" />
            
            {/* Silver/Chrome Ring */}
            <circle cx="50" cy="45" r="35" fill="url(#chromeMetal)" stroke="#ffffff" strokeWidth="1" filter="url(#innerGlow)" />
            
            {/* Inner Dark Recess */}
            <circle cx="50" cy="45" r="28" fill="#001144" stroke="#000" strokeWidth="2" />
            
            {/* Liquid Blue Orb Core */}
            <circle cx="50" cy="45" r="26" fill="url(#replayOrb)" filter="url(#innerGlow)" />
            
            {/* Glowing Stars in Orb */}
            <circle cx="40" cy="35" r="1.5" fill="#fff" filter="url(#dropShadow)" className="animate-pulse" />
            <circle cx="60" cy="55" r="2" fill="#fff" filter="url(#dropShadow)" className="animate-pulse" />

            {/* Huge 3D Circular Arrows (White/Silver) */}
            <g transform="translate(50, 45) scale(1.15)" fill="#ffffff" stroke="#e6e6e6" strokeWidth="1">
                <path d="M -16 -6 A 19 19 0 0 1 12 -16 L 12 -24 L 25 -13 L 12 -2 L 12 -10 A 13 13 0 0 0 -10 -1 Z" filter="url(#dropShadow)" />
                <path d="M 16 6 A 19 19 0 0 1 -12 16 L -12 24 L -25 13 L -12 2 L -12 10 A 13 13 0 0 0 10 1 Z" filter="url(#dropShadow)" />
            </g>

            {/* Bottom Replay Ribbon */}
            <path d="M 5 65 Q 50 80 95 65 L 90 85 Q 50 95 10 85 Z" fill="#0055ff" />
            <path d="M 15 62 L 85 62 L 90 82 L 10 82 Z" fill="url(#replayOrb)" stroke="#66ccff" strokeWidth="1" />
            
            {/* REPLAY Text */}
            <text x="50" y="78" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900" letterSpacing="1" style={{fontFamily: 'Impact, sans-serif'}} stroke="#002266" strokeWidth="1.5">REPLAY</text>
            
            {/* Top Glass Dome Glare */}
            <ellipse cx="40" cy="25" rx="20" ry="8" fill="#ffffff" opacity="0.6" transform="rotate(-20 40 25)" pointerEvents="none" />
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
            
            {/* Dynamic Gemini Aura (Triggers heavily on win) */}
            {renderWinAura()}

            {/* Main Hand-drawn Vector Artwork */}
            {renderSymbolContent()}

            {/* Glowing Border Box on Win (Classic Slot Highlight) */}
            {isWinning && (
                <rect 
                    x="2" y="2" width="96" height="96" rx="16" 
                    fill="none" stroke={theme.aura} strokeWidth="5" 
                    filter="url(#winPulse)" 
                    pointerEvents="none" 
                    className="animate-pulse"
                />
            )}
        </svg>
    );
};

export default memo(SymbolSVG);