import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// SUROPARA V8.0 CABINET ENGINE
// Hyper-Realistic, Cold Industrial Pachislo Design.
// No Glitches, No Cartoon Glows. Pure Matte Metals & Glass.
// ============================================================================

const CabinetSVG = ({ 
    islandId, 
    visualState = 'FREE', 
    mode = 'hall', 
    machine = {}, 
    stats = { laps: 0, wins: 0 }, 
    machineNumber = 0,
    serialNumber = null,
    currentJackpot = 0,
    userName = 'GUEST',
    currentBet = 0
}) => {
    
    const safeIslandId = Math.max(1, Math.min(5, parseInt(islandId) || 1));

    // Muted, premium accent colors for the LED trims (Cold Vibe)
    const getAccentColor = () => {
        if (visualState === 'JACKPOT_HOT') return '#eab308'; // Pure Gold
        switch(safeIslandId) {
            case 1: return '#991b1b'; // Deep Crimson
            case 2: return '#0891b2'; // Deep Cyan
            case 3: return '#b91c1c'; // Brick Red
            case 4: return '#6d28d9'; // Deep Indigo
            case 5: return '#ca8a04'; // Dark Gold
            default: return '#991b1b';
        }
    };
    
    const accent = getAccentColor();

    // V8: No bouncing physics. The machine is heavy and grounded.
    // Only visual states change (greyscale for broken).
    const animProfile = {
        FREE: { physics: { y: 0, filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.95))' } },
        BUSY: { physics: { y: 0, filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.95))' } },
        JACKPOT_HOT: { physics: { y: 0, filter: 'drop-shadow(0 20px 30px rgba(234,179,8,0.15))' } },
        BROKEN: { physics: { y: 0, filter: 'grayscale(0.8) drop-shadow(0 20px 25px rgba(0,0,0,0.95))' } }
    }[visualState] || { physics: { y: 0 } };

    const displayLaps = machine?.total_laps || stats.laps || 0;
    const displayWins = machine?.total_payout || stats.wins || 0;
    const displayNum = machine?.machine_number || machineNumber || 0;

    const islandThemes = {
        1: { name: 'KYOTO ZEN', title: "SECTOR 01", kanji: "京都" },
        2: { name: 'OKINAWA TROPIC', title: "SECTOR 02", kanji: "沖縄" },
        3: { name: 'OSAKA NEON', title: "SECTOR 03", kanji: "大阪" },
        4: { name: 'TOKYO CYBER', title: "SECTOR 04", kanji: "東京" },
        5: { name: 'GINZA GOLD', title: "SECTOR 05", kanji: "銀座" }
    };
    const currentTheme = islandThemes[safeIslandId];

    // --- 1. HYPER-REALISTIC MATERIALS (V8) ---
    const renderDefs = () => (
        <defs>
            {/* Cold, heavy industrial metals */}
            <linearGradient id="matteGunmetal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2a2d34" />
                <stop offset="30%" stopColor="#1e2025" />
                <stop offset="70%" stopColor="#151619" />
                <stop offset="100%" stopColor="#0a0a0c" />
            </linearGradient>

            <linearGradient id="darkAcrylic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#050505" />
                <stop offset="50%" stopColor="#0a0c10" />
                <stop offset="100%" stopColor="#020202" />
            </linearGradient>

            <linearGradient id="coldChrome" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4a4d54" />
                <stop offset="20%" stopColor="#8a8d94" />
                <stop offset="40%" stopColor="#e2e8f0" />
                <stop offset="60%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            
            <linearGradient id="accentLed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="0.8"/>
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9"/>
                <stop offset="100%" stopColor={accent} stopOpacity="0.8"/>
            </linearGradient>

            {/* Micro-texture for plastic/metal surface */}
            <filter id="pbrNoise">
                <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="3" result="noise" />
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0" result="coloredNoise" />
                <feComposite operator="in" in2="SourceGraphic" result="texture" />
                <feBlend mode="multiply" in="texture" in2="SourceGraphic" />
            </filter>

            {/* Deep physical panel shadows */}
            <filter id="panelInset">
                <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.9"/>
                <feDropShadow dx="0" dy="-1" stdDeviation="0.5" floodColor="#ffffff" floodOpacity="0.15"/>
            </filter>

            {/* Sharp, clean glass reflection (No blur, highly realistic) */}
            <linearGradient id="sharpGlare" x1="-1" y1="-1" x2="2" y2="2">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="48%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="52%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                <animate attributeName="x1" values="-2; 2; -2" dur="12s" repeatCount="indefinite" ease="linear" />
                <animate attributeName="x2" values="1; 5; 1" dur="12s" repeatCount="indefinite" ease="linear" />
            </linearGradient>

            {/* Mesh for speakers */}
            <pattern id="speakerMesh" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="3" height="3" fill="#111"/>
                <circle cx="1.5" cy="1.5" r="0.8" fill="#000" />
            </pattern>

            <clipPath id="screenClipLocal"><path d="M 6 6 L 184 6 L 180 74 L 10 74 Z" /></clipPath>
        </defs>
    );

    // --- 2. AUTHENTIC PHYSICAL GREEBLES ---
    const renderHardwareGreebles = () => (
        <g className="hardware-details">
            {/* Structural Seams */}
            <path d="M 22 140 L 22 295 M 218 140 L 218 295" stroke="#111" strokeWidth="1" opacity="0.8" />
            <path d="M 24 140 L 24 295 M 216 140 L 216 295" stroke="#ffffff" strokeWidth="1" opacity="0.05" />

            {/* Heavy Hex Screws */}
            <g fill="url(#coldChrome)" stroke="#000" strokeWidth="0.5">
                <circle cx="12" cy="45" r="1.5" /><circle cx="228" cy="45" r="1.5" />
                <circle cx="12" cy="385" r="1.5" /><circle cx="228" cy="385" r="1.5" />
                <circle cx="12" cy="140" r="1.5" /><circle cx="228" cy="140" r="1.5" />
            </g>

            {/* Left Side: Heavy Industrial Vents */}
            <g transform="translate(6, 120)">
                <rect x="0" y="0" width="6" height="40" fill="#0a0a0c" rx="1" filter="url(#panelInset)" />
                {[...Array(7)].map((_, i) => (
                    <rect key={i} x="1" y={4 + (i * 5)} width="4" height="2" fill="#000" rx="0.5" />
                ))}
            </g>
            
            {/* Right Side: Operator Key Lock */}
            <g transform="translate(222, 130)">
                <circle cx="6" cy="6" r="5" fill="url(#coldChrome)" stroke="#000" strokeWidth="1" filter="url(#panelInset)" />
                <circle cx="6" cy="6" r="3" fill="#111" />
                <rect x="5.5" y="5" width="1" height="4" fill="#000" />
            </g>

            {/* Clean Japanese Corporate Decals (Replacing graffiti) */}
            <g transform="translate(210, 360)">
                <rect width="20" height="8" fill="#e2e8f0" rx="1" />
                <text x="10" y="6" textAnchor="middle" fill="#000" fontSize="4" fontWeight="900" fontFamily="sans-serif">管理ID</text>
            </g>
            <g transform="translate(10, 360)">
                <rect width="18" height="8" fill="#ef4444" rx="1" />
                <text x="9" y="6" textAnchor="middle" fill="#fff" fontSize="4" fontWeight="900" fontFamily="sans-serif">警告</text>
            </g>
        </g>
    );

    // --- 3. HEAVY MATTE CHASSIS ---
    const renderChassis = () => {
        // Uniform chassis shape. No crazy curves. Solid block of metal.
        const path = "M10,35 Q120,25 230,35 L235,395 L5,395 Z";

        return (
            <g>
                {/* Main Body */}
                <path d={path} fill="url(#matteGunmetal)" stroke="#111" strokeWidth="2" filter="url(#pbrNoise)" />
                
                {/* Physical LED Light Bars (Inset into the metal) */}
                <g filter="url(#panelInset)">
                    <rect x="26" y="140" width="4" height="155" fill="#0a0a0c" rx="1" />
                    <rect x="210" y="140" width="4" height="155" fill="#0a0a0c" rx="1" />
                </g>

                {/* Actual LEDs inside the bars */}
                <g opacity={visualState === 'BROKEN' ? 0.1 : 0.8}>
                    <rect x="26.5" y="142" width="3" height="151" fill={visualState === 'FREE' ? '#333' : 'url(#accentLed)'} rx="0.5" />
                    <rect x="210.5" y="142" width="3" height="151" fill={visualState === 'FREE' ? '#333' : 'url(#accentLed)'} rx="0.5" />
                </g>

                {renderHardwareGreebles()}

                {/* Industrial Speaker Grilles */}
                <g transform="translate(0, 50)" filter="url(#panelInset)">
                    <path d="M 8 0 L 22 8 L 22 75 L 8 68 Z" fill="url(#speakerMesh)" stroke="#111" strokeWidth="1"/>
                    <path d="M 232 0 L 218 8 L 218 75 L 232 68 Z" fill="url(#speakerMesh)" stroke="#111" strokeWidth="1"/>
                </g>
            </g>
        );
    };

    // --- 4. TOPPER (Embedded LCD style) ---
    const renderTopper = () => {
        return (
            <g transform="translate(45, 0)">
                {/* Heavy Frame */}
                <path d="M 0 5 L 150 5 L 142 45 L 8 45 Z" fill="url(#coldChrome)" stroke="#000" strokeWidth="1.5" filter="url(#pbrNoise)" />
                <path d="M 4 9 L 146 9 L 140 41 L 10 41 Z" fill="#050505" filter="url(#panelInset)" />
                
                {/* Screen */}
                <path d="M 6 11 L 144 11 L 138 39 L 12 39 Z" fill="url(#darkAcrylic)" />

                <g transform="translate(75, 23)">
                    <text x="0" y="-3" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold" fontFamily="sans-serif" letterSpacing="3">
                        PROGRESSIVE POOL
                    </text>
                    <text x="0" y="11" textAnchor="middle" fill={visualState === 'JACKPOT_HOT' ? '#eab308' : '#e2e8f0'} fontSize="14" fontFamily="monospace" fontWeight="900" letterSpacing="1">
                        {currentJackpot > 0 ? Number(currentJackpot).toLocaleString() : 'SYSTEM SYNC'}
                    </text>
                </g>

                {/* Physical Chrome Warning Lights */}
                <g transform="translate(-5, 18)">
                    <circle cx="0" cy="0" r="10" fill="url(#coldChrome)" stroke="#000" />
                    <circle cx="0" cy="0" r="7" fill={visualState === 'JACKPOT_HOT' ? '#ef4444' : '#450a0a'} />
                </g>
                <g transform="translate(155, 18)">
                    <circle cx="0" cy="0" r="10" fill="url(#coldChrome)" stroke="#000" />
                    <circle cx="0" cy="0" r="7" fill={visualState === 'JACKPOT_HOT' ? '#ef4444' : '#450a0a'} />
                </g>
            </g>
        );
    };

    // --- 5. SCREEN BEZEL (Recessed Display) ---
    const renderScreenArea = () => (
        <g transform="translate(0, 80)">
            {/* Bezel Base */}
            <path d="M 30 0 H 210 L 206 130 H 34 Z" fill="url(#matteGunmetal)" stroke="#000" strokeWidth="2" filter="url(#pbrNoise)" />
            
            {/* Inner Recess */}
            <path d="M 35 5 H 205 L 202 125 H 38 Z" fill="#000" filter="url(#panelInset)" />
            
            {/* Real Physical Frame Dividers (If Mode Game) */}
            {mode === 'game' && (
                <g opacity="0.9">
                    <line x1="95.5" y1="5" x2="95.5" y2="125" stroke="url(#coldChrome)" strokeWidth="3" />
                    <line x1="95.5" y1="5" x2="95.5" y2="125" stroke="#111" strokeWidth="1" />
                    
                    <line x1="145.5" y1="5" x2="145.5" y2="125" stroke="url(#coldChrome)" strokeWidth="3" />
                    <line x1="145.5" y1="5" x2="145.5" y2="125" stroke="#111" strokeWidth="1" />
                </g>
            )}

            {/* Hardware Plaque */}
            <g transform="translate(155, 10)">
                <rect width="45" height="12" fill="url(#coldChrome)" rx="1" stroke="#000" strokeWidth="0.5" filter="url(#panelInset)" />
                <rect width="43" height="10" x="1" y="1" fill="#111" rx="0.5" />
                <text x="22.5" y="8" textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="sans-serif" fontWeight="900" letterSpacing="1">V8-CORE</text>
            </g>
            
            {/* Clean Glass Overlay */}
            <path d="M 35 5 H 205 L 202 125 H 38 Z" fill="url(#sharpGlare)" pointerEvents="none" />
        </g>
    );

    // --- 6. EMBEDDED TELEMETRY LCD (Belly Glass) ---
    const renderTelemetryDashboard = () => {
        return (
            <g transform="translate(25, 295)">
                 {/* Matte Metal Frame */}
                 <path d="M 0 0 L 190 0 L 180 80 L 10 80 Z" fill="url(#matteGunmetal)" stroke="#000" strokeWidth="2" filter="url(#pbrNoise)" />
                 
                 {/* LCD Recess */}
                 <g clipPath="url(#screenClipLocal)">
                     <rect x="0" y="0" width="190" height="80" fill="url(#darkAcrylic)" filter="url(#panelInset)" />
                     
                     {/* LCD Grid/Matrix background */}
                     <g opacity="0.1">
                        <line x1="0" y1="20" x2="190" y2="20" stroke="#fff" strokeWidth="0.5"/>
                        <line x1="0" y1="40" x2="190" y2="40" stroke="#fff" strokeWidth="0.5"/>
                        <line x1="0" y1="60" x2="190" y2="60" stroke="#fff" strokeWidth="0.5"/>
                     </g>

                     {/* Clean Typography */}
                     <g transform="translate(95, 35)">
                         <text x="0" y="-12" textAnchor="middle" fill="#64748b" fontSize="6" fontWeight="bold" fontFamily="sans-serif" letterSpacing="2">
                             {currentTheme.title}
                         </text>
                         <text x="0" y="4" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">
                             {currentTheme.name}
                         </text>
                         <text x="0" y="18" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="sans-serif" letterSpacing="4">
                             {currentTheme.kanji}
                         </text>
                     </g>

                     {/* Data Readouts (LCD Font Style) */}
                     <g transform="translate(145, 8)">
                         <text x="20" y="8" textAnchor="middle" fill="#0ea5e9" fontSize="6" fontFamily="monospace" fontWeight="bold">
                             PAY: {(displayWins / 1000).toFixed(1)}k
                         </text>
                     </g>

                     <g transform="translate(10, 68)">
                         <text x="0" y="0" fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold">
                             SYS: {visualState}
                         </text>
                     </g>
                     
                     <g transform="translate(140, 68)">
                         <text x="40" y="0" textAnchor="end" fill="#0ea5e9" fontSize="6" fontFamily="monospace" fontWeight="bold">
                             LAPS: {displayLaps.toString().padStart(4, '0')}
                         </text>
                     </g>
                 </g>
                 
                 {/* Glass Glare */}
                 <path d="M 0 0 L 190 0 L 180 80 L 10 80 Z" fill="url(#sharpGlare)" pointerEvents="none" />
            </g>
        );
    };

    // --- 7. SMART RFID DECK & TELEMETRY ---
    const renderRFIDDeck = () => (
        <g transform="translate(5, 380)">
             {/* Base Deck Plate */}
             <path d="M 5 0 Q 115 15 225 0 L 230 20 Q 115 30 0 20 Z" fill="url(#matteGunmetal)" stroke="#111" strokeWidth="2" filter="url(#pbrNoise)" />
             
             {/* Recessed Black Acrylic Area */}
             <path d="M 12 4 Q 115 18 218 4 L 214 16 Q 115 26 16 16 Z" fill="#050505" filter="url(#panelInset)" />
             
             {/* RFID Scanner Pad (Matte Black Glass) */}
             <g transform="translate(20, 6) rotate(-2)">
                <rect width="50" height="12" rx="2" fill="#0a0a0c" stroke="#222" strokeWidth="1" />
                <rect x="2" y="2" width="46" height="8" rx="1" fill="#020202" />
                
                {/* Physical NFC Icon */}
                <path d="M 8 3 Q 12 3 14 6 M 6 5 Q 10 5 12 8 M 4 7 Q 8 7 10 10" fill="none" stroke="#333" strokeWidth="0.8" strokeLinecap="round" />
                
                <text x="25" y="7.5" textAnchor="middle" fill="#64748b" fontSize="4" fontFamily="sans-serif" fontWeight="900" letterSpacing="1">RFID SCAN</text>
                
                {/* Status LED */}
                <circle cx="44" cy="6" r="1.5" fill={visualState === 'FREE' ? '#22c55e' : '#3b82f6'} opacity="0.8" />
             </g>

             {/* Digital Operator Readout (Crisp VFD display look) */}
             <g transform="translate(85, 7)">
                 <rect width="125" height="14" rx="1" fill="#020617" stroke="#1e293b" strokeWidth="1" />
                 
                 <text x="5" y="9.5" fill="#0ea5e9" fontSize="5" fontFamily="monospace" fontWeight="bold">OP: {userName.substring(0, 8).toUpperCase()}</text>
                 <text x="65" y="9.5" fill="#0ea5e9" fontSize="5" fontFamily="monospace" fontWeight="bold">BET: {currentBet > 0 ? (currentBet >= 1000 ? `${currentBet/1000}k` : currentBet) : '---'}</text>
                 
                 {/* Connection Status Square */}
                 <rect x="115" y="4" width="6" height="6" fill={visualState !== 'FREE' ? '#0ea5e9' : '#334155'} rx="1" />
             </g>
        </g>
    );

    return (
        <motion.svg 
            animate={animProfile.physics}
            width="100%" height="100%" 
            viewBox="0 0 240 410" 
            preserveAspectRatio="xMidYMid meet" 
            className={mode==='hall' ? 'transition-transform hover:-translate-y-1 cursor-pointer' : ''}
        >
            {renderDefs()}
            
            {/* Ground Shadow */}
            <ellipse cx="120" cy="405" rx="100" ry="10" fill="#000" opacity="0.8" filter="blur(4px)" />
            
            {renderChassis()}
            {renderTopper()}
            {renderScreenArea()} 
            {renderTelemetryDashboard()}
            {renderRFIDDeck()}
            
            {/* Master Environmental Glass Glare (Very subtle, ties everything together) */}
            <path d="M 15 40 L 225 40 L 230 395 L 10 395 Z" fill="url(#sharpGlare)" pointerEvents="none" />
        </motion.svg>
    );
};

export default memo(CabinetSVG);