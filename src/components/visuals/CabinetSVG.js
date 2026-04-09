import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// SUROPARA V7.12 CABINET ENGINE
// Dynamic Hardware Decals & Matte-Metallic Rendering.
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

    const getAccentColor = () => {
        if (visualState === 'JACKPOT_HOT') return '#DAA520';
        switch(safeIslandId) {
            case 1: return '#8B0000'; // Deep Kyoto Red
            case 2: return '#008B8B'; // Okinawa Teal
            case 3: return '#B22222'; // Edo Firebrick
            case 4: return '#4B0082'; // Tokyo Indigo
            case 5: return '#B8860B'; // Ginza Dark Gold
            default: return '#8B0000';
        }
    };
    
    const accent = getAccentColor();

    // --- REALISTIC HEAVY PHYSICS ---
    const animProfile = {
        FREE: { physics: { y: 0 } },
        BUSY: { physics: { y: [0, -0.5, 0], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } } },
        JACKPOT_HOT: { physics: { y: [0, -1, 0], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } } },
        BROKEN: { physics: { filter: 'grayscale(0.5)' } }
    }[visualState] || { physics: { y: 0 } };

    const displayLaps = machine?.total_laps || stats.laps || 0;
    const displayWins = machine?.total_payout || stats.wins || 0;
    const displayNum = machine?.machine_number || machineNumber || 0;

    const islandThemes = {
        1: { name: '𝓚𝔂𝓸𝓽𝓸 𝓩𝓮𝓷', title: "SHRINE OF FORTUNE", kanji: "伝統・静寂" },
        2: { name: '𝙾𝚔𝚒𝚗𝚊𝚠𝚊 𝚃𝚛𝚘𝚙𝚒𝚌', title: "ISLAND LOTTERY", kanji: "海・琉球" },
        3: { name: 'ＯＳＡＫＡ ＮＥＯＮ', title: "DOTONBORI CHALLENGE", kanji: "浪速・祭" },
        4: { name: '𝕿𝖔𝖐𝖞𝖔 𝕮𝖞𝖇𝖊𝖗', title: "CYBER YAKUZA", kanji: "電脳・東京" },
        5: { name: '𝐆𝐢𝐧𝐳𝐚 𝐆𝐨𝐥𝐝', title: "GOLD BOUTIQUE", kanji: "黄金・富" }
    };
    const currentTheme = islandThemes[safeIslandId];

    // --- DYNAMIC BET DENOMINATION LIMITS ---
    const ISLAND_BETS = {
        1: { min: 100, max: 5000 },
        2: { min: 1000, max: 20000 },
        3: { min: 5000, max: 100000 },
        4: { min: 10000, max: 250000 },
        5: { min: 50000, max: 1000000 }
    };
    const limits = ISLAND_BETS[safeIslandId] || ISLAND_BETS[1];
    const formatK = (val) => val >= 1000 ? `${val/1000}k` : val;

    const bellySparklinePoints = useMemo(() => {
        let pts = [];
        let y = 40; 
        for(let x = -10; x <= 200; x += 5) {
            y = Math.max(10, Math.min(70, 40 + (Math.sin((displayNum * x) + x) * 15) + (Math.cos(x * 3) * 5)));
            pts.push(`${x},${y.toFixed(1)}`);
        }
        return pts.join(' ');
    }, [displayNum]);

    // --- 1. MATTE METALLIC MATERIALS ---
    const renderDefs = () => (
        <defs>
            <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#111" />
                <stop offset="30%" stopColor="#888" />
                <stop offset="45%" stopColor="#fff" />
                <stop offset="55%" stopColor="#555" />
                <stop offset="100%" stopColor="#111" />
            </linearGradient>
            <linearGradient id="darkChrome" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#050505" />
                <stop offset="50%" stopColor="#222" />
                <stop offset="100%" stopColor="#050505" />
            </linearGradient>
            <linearGradient id="matteSteel" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1a1a1a" /><stop offset="20%" stopColor="#2c2c2c" /><stop offset="80%" stopColor="#222222" /><stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            <linearGradient id="oxidizedCopper" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2f4f4f" /><stop offset="50%" stopColor="#1a3333" /><stop offset="100%" stopColor="#0d1a1a" />
            </linearGradient>
            <linearGradient id="matteGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b6508" /><stop offset="50%" stopColor="#cd950c" /><stop offset="100%" stopColor="#5c4305" />
            </linearGradient>
            <linearGradient id="powderCoatedRed" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4a0e0e" /><stop offset="50%" stopColor="#8b1a1a" /><stop offset="100%" stopColor="#2b0808" />
            </linearGradient>
            <linearGradient id="mattePurple" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2e0854" /><stop offset="50%" stopColor="#4b0082" /><stop offset="100%" stopColor="#190431" />
            </linearGradient>
            <filter id="pbrNoise">
                <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" result="noise" />
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" result="coloredNoise" />
                <feComposite operator="in" in2="SourceGraphic" result="texture" />
                <feBlend mode="multiply" in="texture" in2="SourceGraphic" />
            </filter>
            <filter id="panelGap">
                <feDropShadow dx="1" dy="1" stdDeviation="0.5" floodColor="#000" floodOpacity="0.8"/>
                <feDropShadow dx="-1" dy="-1" stdDeviation="0.5" floodColor="#ffffff" floodOpacity="0.1"/>
            </filter>
            <linearGradient id="plasticLed" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#111" /><stop offset="50%" stopColor="#333" /><stop offset="100%" stopColor="#111" />
            </linearGradient>
            <pattern id="pat-seigaiha" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
                <path d="M10 0 A10 10 0 0 0 0 10 A10 10 0 0 0 10 20 A10 10 0 0 0 20 10 A10 10 0 0 0 10 0 Z" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1"/>
                <path d="M10 4 A6 6 0 0 0 4 10 A6 6 0 0 0 10 16 A6 6 0 0 0 16 10 A6 6 0 0 0 10 4 Z" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1"/>
            </pattern>
            <pattern id="pat-hex" width="10" height="17.32" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
                <path d="M5 0 L10 2.88 L10 8.66 L5 11.54 L0 8.66 L0 2.88 Z" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5"/>
            </pattern>
            <clipPath id="screenClipLocal"><path d="M 4 4 L 186 4 L 176 76 L 14 76 Z" /></clipPath>
        </defs>
    );

    // --- 2. PHYSICAL HARDWARE GREEBLES ---
    const renderHardwareGreebles = () => (
        <g className="hardware-details" opacity="0.8">
            <g transform="translate(6, 120)">
                <rect x="0" y="0" width="4" height="25" fill="#111" rx="1" filter="url(#panelGap)" />
                <circle cx="2" cy="4" r="1" fill="#333" /><circle cx="2" cy="12.5" r="1" fill="#333" /><circle cx="2" cy="21" r="1" fill="#333" />
            </g>
            <g transform="translate(6, 280)">
                <rect x="0" y="0" width="4" height="25" fill="#111" rx="1" filter="url(#panelGap)" />
                <circle cx="2" cy="4" r="1" fill="#333" /><circle cx="2" cy="12.5" r="1" fill="#333" /><circle cx="2" cy="21" r="1" fill="#333" />
            </g>

            <g transform="translate(12, 330)">
                <rect x="0" y="0" width="25" height="40" fill="#0a0a0a" rx="2" filter="url(#panelGap)" />
                {[...Array(8)].map((_, i) => (
                    <line key={i} x1="4" y1={5 + (i * 4.5)} x2="21" y2={5 + (i * 4.5)} stroke="#111" strokeWidth="2" strokeLinecap="round" />
                ))}
            </g>

            <g transform="translate(160, 235)">
                <rect x="0" y="0" width="30" height="12" fill="#111" rx="1" stroke="#000" filter="url(#panelGap)" />
                <rect x="2" y="5" width="26" height="2" fill="#000" />
                <text x="15" y="10" textAnchor="middle" fill="#444" fontSize="3" fontWeight="bold">TICKET OUT</text>
            </g>

            <g transform="translate(210, 350)">
                <circle cx="8" cy="8" r="6" fill="url(#matteSteel)" stroke="#000" strokeWidth="1" filter="url(#panelGap)" />
                <circle cx="8" cy="8" r="3" fill="#000" />
                <rect x="7" y="8" width="2" height="4" fill="#000" />
            </g>

            <path d="M 25 140 L 25 295" stroke="#000" strokeWidth="1" opacity="0.3" />
            <path d="M 215 140 L 215 295" stroke="#000" strokeWidth="1" opacity="0.3" />
            <circle cx="15" cy="45" r="1.5" fill="#222" /><circle cx="225" cy="45" r="1.5" fill="#222" />
            <circle cx="15" cy="385" r="1.5" fill="#222" /><circle cx="225" cy="385" r="1.5" fill="#222" />
        </g>
    );

    // --- 3. PAINTED CULTURAL MOTIFS ---
    const renderCulturalPaint = () => {
        switch(safeIslandId) {
            case 1: 
                return (
                    <g className="cultural-paint" opacity="0.6">
                        <path d="M 40 220 C 10 170, 80 130, 100 180 C 110 200, 90 240, 50 220" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                        <path d="M 20 300 L 25 250 L 22 200 M 35 320 L 38 240 L 32 180" fill="none" stroke="#111" strokeWidth="3" />
                        <text x="25" y="380" fill="#000" fontSize="10" fontWeight="bold" transform="rotate(-10)" opacity="0.8" style={{fontFamily: 'serif'}}>京都</text>
                    </g>
                );
            case 2: 
                return (
                    <g className="cultural-paint" opacity="0.4">
                        <rect x="10" y="150" width="40" height="200" fill="url(#pat-seigaiha)" opacity="0.3" />
                        <circle cx="30" cy="200" r="15" fill="#8B0000" opacity="0.5" />
                        <path d="M 15 210 Q 30 190 45 210" fill="none" stroke="#111" strokeWidth="2" />
                        <text x="-250" y="30" fill="#000" fontSize="24" fontWeight="900" transform="rotate(-90)" opacity="0.2">RYUKYU</text>
                    </g>
                );
            case 3: 
                return (
                    <g className="cultural-paint" opacity="0.5">
                        <path d="M 20 180 Q 40 200 25 240" fill="none" stroke="#8B0000" strokeWidth="6" strokeLinecap="round" />
                        <path d="M 30 190 Q 45 205 35 230" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
                        <text x="20" y="300" fill="#000" fontSize="14" fontWeight="900" style={{fontFamily: 'serif', writingMode: 'vertical-rl'}}>浪速</text>
                    </g>
                );
            case 4: 
                return (
                    <g className="cultural-paint" opacity="0.6">
                        <rect x="15" y="150" width="30" height="100" fill="url(#pat-hex)" opacity="0.5" />
                        <rect x="15" y="260" width="25" height="6" fill="#000" />
                        <text x="27.5" y="264.5" textAnchor="middle" fill="#fff" fontSize="3" fontWeight="bold" fontFamily="monospace">CAUTION</text>
                        <g transform="translate(20, 280)">
                            <rect x="0" y="0" width="1" height="15" fill="#000"/><rect x="3" y="0" width="3" height="15" fill="#000"/><rect x="8" y="0" width="1" height="15" fill="#000"/><rect x="11" y="0" width="4" height="15" fill="#000"/>
                        </g>
                    </g>
                );
            case 5: 
                return (
                    <g className="cultural-paint" opacity="0.3">
                        <path d="M 15 300 C 40 280, 10 200, 30 160" fill="none" stroke="#000" strokeWidth="2" />
                        <path d="M 30 160 C 50 180, 20 250, 40 290" fill="none" stroke="#000" strokeWidth="1" />
                        <text x="25" y="220" fill="#000" fontSize="18" fontWeight="bold" style={{fontFamily: 'serif'}}>金</text>
                    </g>
                );
            default: return null;
        }
    };

    // --- 4. HEAVY MATTE CHASSIS ---
    const renderChassis = () => {
        let path, fill, stroke;
        switch(safeIslandId) {
            case 1: fill="url(#powderCoatedRed)"; stroke="#2b0000"; path = "M10,35 Q120,15 230,35 L235,395 L5,395 Z"; break;
            case 2: fill="url(#oxidizedCopper)"; stroke="#0d1a1a"; path = "M10,30 H50 V45 H190 V30 H230 V395 H10 Z"; break;
            case 3: fill="url(#matteSteel)"; stroke="#0a0a0a"; path = "M10,50 L40,30 L80,50 L120,30 L160,50 L200,30 L230,50 L235,395 L5,395 Z"; break;
            case 4: fill="url(#mattePurple)"; stroke="#190431"; path = "M15,40 L35,20 L205,20 L225,40 L225,395 L15,395 Z"; break;
            case 5: fill="url(#matteGold)"; stroke="#2e1a00"; path = "M20,60 L120,20 L220,60 L225,395 L15,395 Z"; break;
            default: fill="url(#powderCoatedRed)"; stroke="#2b0000"; path = "M10,35 Q120,15 230,35 L235,395 L5,395 Z"; break;
        }

        return (
            <g>
                <path d={path} fill={fill} stroke={stroke} strokeWidth="4" filter="url(#pbrNoise)" />
                {renderCulturalPaint()}
                {renderHardwareGreebles()}
                <g opacity="0.9">
                    <rect x="24" y="140" width="6" height="155" fill="url(#plasticLed)" rx="2" stroke="#000" strokeWidth="1" filter="url(#panelGap)" />
                    <rect x="210" y="140" width="6" height="155" fill="url(#plasticLed)" rx="2" stroke="#000" strokeWidth="1" filter="url(#panelGap)" />
                </g>
            </g>
        );
    };

    // --- 5. PHYSICAL TOPPER ---
    const renderTopper = () => {
        return (
            <g transform="translate(45, -8)">
                <path d="M 0 5 L 150 5 L 140 45 L 10 45 Z" fill="url(#matteSteel)" stroke="#000" strokeWidth="2" filter="url(#pbrNoise)" />
                <circle cx="10" cy="10" r="1.5" fill="#222" /><circle cx="140" cy="10" r="1.5" fill="#222" />
                <circle cx="15" cy="40" r="1.5" fill="#222" /><circle cx="135" cy="40" r="1.5" fill="#222" />
                <path d="M 4 9 L 146 9 L 138 41 L 12 41 Z" fill="#0a0a0a" filter="url(#panelGap)" />
                <path d="M 6 11 L 144 11 L 136 39 L 14 39 Z" fill="#111" />
                <g transform="translate(75, 22)">
                    <text x="0" y="-3" textAnchor="middle" fill="#DAA520" fontSize="10" fontWeight="900" fontStyle="italic" letterSpacing="2">
                        GRAND JACKPOT
                    </text>
                    <text x="0" y="12" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
                        {currentJackpot > 0 ? Number(currentJackpot).toLocaleString() : 'SYSTEM SYNC...'}
                    </text>
                </g>
            </g>
        );
    };

    // --- 6. SCREEN BEZEL ---
    const renderScreenArea = () => (
        <g transform="translate(0, 80)">
            <path d="M 30 0 H 210 L 205 130 H 35 Z" fill="url(#matteSteel)" stroke="#000" strokeWidth="4" filter="url(#pbrNoise)" />
            <path d="M 35 5 H 205 L 200 125 H 40 Z" fill="#050505" filter="url(#panelGap)" />
            {mode === 'game' && (
                <g opacity="0.8">
                    <line x1="95.5" y1="5" x2="95.5" y2="125" stroke="#111" strokeWidth="2" />
                    <line x1="145.5" y1="5" x2="145.5" y2="125" stroke="#111" strokeWidth="2" />
                </g>
            )}
            <g transform="translate(155, 10)">
                <rect width="40" height="12" fill="#111" rx="1" stroke="#333" strokeWidth="1" filter="url(#panelGap)" />
                <text x="20" y="8" textAnchor="middle" fill="#888" fontSize="5" fontFamily="monospace" fontWeight="bold" letterSpacing="1">SURO-OS</text>
            </g>
        </g>
    );

    // --- 7. EMBEDDED TELEMETRY LCD (Belly Glass) ---
    const renderTelemetryDashboard = () => {
        let screenBg = '#0a0c10';
        return (
            <g transform="translate(25, 295)">
                 <path d="M 0 0 L 190 0 L 180 80 L 10 80 Z" fill="url(#matteSteel)" stroke="#000" strokeWidth="3" filter="url(#pbrNoise)" />
                 <g clipPath="url(#screenClipLocal)">
                     <rect x="0" y="0" width="190" height="80" fill={screenBg} />
                     <rect x="0" y="0" width="190" height="80" fill="url(#pat-seigaiha)" opacity="0.05" />
                     <rect x="0" y="0" width="190" height="80" fill="url(#crtScanline)" opacity="0.3" pointerEvents="none" />
                     <polyline points={bellySparklinePoints} fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.3" />

                     <g transform="translate(95, 45)">
                         <rect x="-65" y="-22" width="130" height="34" rx="2" fill="#050505" stroke="#333" strokeWidth="1" filter="url(#panelGap)" />
                         <text x="0" y="-14" textAnchor="middle" fill="#888" fontSize="5" fontWeight="bold" letterSpacing="2">
                             [ {currentTheme.title} ]
                         </text>
                         <text x="0" y="2" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="900" fontStyle="italic">
                             {currentTheme.name}
                         </text>
                         <text x="0" y="16" textAnchor="middle" fill="#555" fontSize="6" letterSpacing="6">
                             {currentTheme.kanji}
                         </text>
                     </g>

                     <g transform="translate(145, 5)">
                         <rect width="40" height="12" fill="#111" rx="2" stroke="#333" strokeWidth="1" />
                         <text x="20" y="8.5" textAnchor="middle" fill="#fff" fontSize="5" fontFamily="monospace" fontWeight="bold">
                             W: {(displayWins / 1000).toFixed(1)}k
                         </text>
                     </g>
                     <g transform="translate(5, 63)">
                         <rect width="45" height="12" fill="#111" rx="2" stroke="#333" strokeWidth="1" />
                         <text x="22.5" y="8.5" textAnchor="middle" fill="#888" fontSize="4.5" fontFamily="monospace" fontWeight="bold">
                             SYS: {visualState}
                         </text>
                     </g>
                     <g transform="translate(140, 63)">
                         <rect width="45" height="12" fill="#111" rx="2" stroke="#333" strokeWidth="1" />
                         <text x="20.5" y="8.5" textAnchor="middle" fill="#fff" fontSize="5" fontFamily="monospace" fontWeight="bold">
                             LAPS: {displayLaps.toString().padStart(4, '0')}
                         </text>
                     </g>
                 </g>
                 <path d="M 0 0 L 190 0 L 180 80 L 10 80 Z" fill="none" stroke="#000" strokeWidth="4" opacity="0.8" pointerEvents="none" />
            </g>
        );
    };

    // --- 8. SMART RFID DECK & TELEMETRY ---
    const renderRFIDDeck = () => (
        <g transform="translate(5, 380)">
             <path d="M 5 0 Q 115 20 225 0 L 230 20 Q 115 35 0 20 Z" fill="url(#matteSteel)" stroke="#111" strokeWidth="3" filter="url(#pbrNoise)" />
             <path d="M 15 5 Q 115 20 215 5 L 210 15 Q 115 25 20 15 Z" fill="#050505" filter="url(#panelGap)" />
             
             {/* RFID Scanner Pad (Replaces Coin Slot) */}
             <g transform="translate(20, 6) rotate(-2)">
                <rect width="45" height="12" rx="2" fill="#111" stroke="#333" strokeWidth="1" />
                <rect x="2" y="2" width="41" height="8" rx="1" fill="#050505" />
                <text x="22.5" y="7.5" textAnchor="middle" fill="#0ea5e9" fontSize="4" fontFamily="monospace" fontWeight="bold" className="animate-pulse">SCAN RFID</text>
                {/* Glowing Scan Line */}
                <line x1="4" y1="6" x2="41" y2="6" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.5">
                     <animate attributeName="y1" values="2; 10; 2" dur="2s" repeatCount="indefinite" />
                     <animate attributeName="y2" values="2; 10; 2" dur="2s" repeatCount="indefinite" />
                </line>
             </g>

             {/* Digital Operator Readout */}
             <g transform="translate(75, 7)">
                 <rect width="135" height="14" rx="2" fill="#020617" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.9" />
                 <rect x="1" y="1" width="133" height="12" fill="url(#pat-seigaiha)" opacity="0.1" />
                 
                 <text x="5" y="9.5" fill="#38bdf8" fontSize="5" fontFamily="monospace" fontWeight="bold">OP: {userName.substring(0, 8).toUpperCase()}</text>
                 <text x="65" y="9.5" fill="#38bdf8" fontSize="5" fontFamily="monospace" fontWeight="bold">BET: {currentBet > 0 ? formatK(currentBet) : '---'}</text>
                 <text x="130" y="9.5" textAnchor="end" fill="#38bdf8" fontSize="4" fontFamily="monospace" className={visualState !== 'FREE' ? 'animate-pulse' : 'opacity-50'}>LINKED</text>
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
            style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.9))' }}
        >
            {renderDefs()}
            <ellipse cx="120" cy="405" rx="100" ry="10" fill="#000" opacity="0.9" filter="blur(6px)" />
            {renderChassis()}
            {renderTopper()}
            {renderScreenArea()} 
            {renderTelemetryDashboard()}
            {renderRFIDDeck()}
        </motion.svg>
    );
};

export default memo(CabinetSVG);