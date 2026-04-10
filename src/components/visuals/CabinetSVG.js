import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// SUROPARA V8.2 CABINET ENGINE (STABLE)
// Hyper-Realistic, Cold Industrial Pachislo Design.
// * FIX: Flattened architecture to prevent Next.js Babel minification crashes.
// * FIX: Pure math extraction for zero-latency sparklines.
// ============================================================================

// --- PURE HELPER FUNCTIONS (Outside Component Scope) ---
const getAccentColor = (islandId, visualState) => {
    if (visualState === 'JACKPOT_HOT') return '#eab308'; // Pure Gold
    switch(islandId) {
        case 1: return '#991b1b'; // Deep Crimson
        case 2: return '#0891b2'; // Deep Cyan
        case 3: return '#b91c1c'; // Brick Red
        case 4: return '#6d28d9'; // Deep Indigo
        case 5: return '#ca8a04'; // Dark Gold
        default: return '#991b1b';
    }
};

const getThemeData = (islandId) => {
    const themes = {
        1: { name: 'KYOTO ZEN', title: "SECTOR 01", kanji: "京都" },
        2: { name: 'OKINAWA TROPIC', title: "SECTOR 02", kanji: "沖縄" },
        3: { name: 'OSAKA NEON', title: "SECTOR 03", kanji: "大阪" },
        4: { name: 'TOKYO CYBER', title: "SECTOR 04", kanji: "東京" },
        5: { name: 'GINZA GOLD', title: "SECTOR 05", kanji: "銀座" }
    };
    return themes[islandId] || themes[1];
};

const getChassisConfig = (islandId) => {
    const configs = {
        1: { fill: "url(#powderCoatedRed)", stroke: "#2b0000", path: "M10,35 Q120,25 230,35 L235,395 L5,395 Z" },
        2: { fill: "url(#oxidizedCopper)", stroke: "#0d1a1a", path: "M10,30 H50 V45 H190 V30 H230 V395 H10 Z" },
        3: { fill: "url(#matteSteel)", stroke: "#0a0a0a", path: "M10,50 L40,30 L80,50 L120,30 L160,50 L200,30 L230,50 L235,395 L5,395 Z" },
        4: { fill: "url(#mattePurple)", stroke: "#190431", path: "M15,40 L35,20 L205,20 L225,40 L225,395 L15,395 Z" },
        5: { fill: "url(#matteGold)", stroke: "#2e1a00", path: "M20,60 L120,20 L220,60 L225,395 L15,395 Z" }
    };
    return configs[islandId] || configs[1];
};

const formatK = (val) => val >= 1000 ? `${val/1000}k` : val;

// GUARANTEED SAFE MATH: Prevents NaN propagation causing ReferenceErrors
const generateSparkline = (seedVal) => {
    let pts = [];
    let y = 40;
    // Strip any non-numeric characters (e.g. "1-05" becomes 105)
    const seed = parseInt(String(seedVal).replace(/[^0-9]/g, ''), 10) || 1;
    
    for(let x = -10; x <= 200; x += 5) {
        y = Math.max(10, Math.min(70, 40 + (Math.sin((seed * x) + x) * 15) + (Math.cos(x * 3) * 5)));
        pts.push(`${x},${y.toFixed(1)}`);
    }
    return pts.join(' ');
};

// --- PURE RENDER COMPONENTS ---
const CulturalPaint = memo(({ islandId }) => {
    switch(islandId) {
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
});


// --- MAIN COMPONENT ---
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
    const accent = getAccentColor(safeIslandId, visualState);
    const themeData = getThemeData(safeIslandId);
    const chassis = getChassisConfig(safeIslandId);

    const animProfile = {
        FREE: { physics: { y: 0, filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.95))' } },
        BUSY: { physics: { y: 0, filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.95))' } },
        JACKPOT_HOT: { physics: { y: 0, filter: 'drop-shadow(0 20px 30px rgba(234,179,8,0.15))' } },
        BROKEN: { physics: { y: 0, filter: 'grayscale(0.8) drop-shadow(0 20px 25px rgba(0,0,0,0.95))' } }
    }[visualState] || { physics: { y: 0 } };

    const displayLaps = machine?.total_laps || stats.laps || 0;
    const displayWins = machine?.total_payout || stats.wins || 0;
    const displayNum = machine?.machine_number || machineNumber || 0;

    // Memoize the sparkline points to prevent re-calculation on every tick,
    // safely handled by the external pure function.
    const sparklinePoints = useMemo(() => generateSparkline(displayNum), [displayNum]);

    return (
        <motion.svg 
            animate={animProfile.physics}
            width="100%" height="100%" 
            viewBox="0 0 240 415" 
            preserveAspectRatio="xMidYMid meet" 
            className={mode==='hall' ? 'transition-transform hover:-translate-y-1 cursor-pointer' : ''}
        >
            <defs>
                <linearGradient id="matteGunmetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2a2d34" /><stop offset="30%" stopColor="#1e2025" /><stop offset="70%" stopColor="#151619" /><stop offset="100%" stopColor="#0a0a0c" /></linearGradient>
                <linearGradient id="darkAcrylic" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#050505" /><stop offset="50%" stopColor="#0a0c10" /><stop offset="100%" stopColor="#020202" /></linearGradient>
                <linearGradient id="coldChrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4a4d54" /><stop offset="20%" stopColor="#8a8d94" /><stop offset="40%" stopColor="#e2e8f0" /><stop offset="60%" stopColor="#64748b" /><stop offset="100%" stopColor="#1e293b" /></linearGradient>
                <linearGradient id="accentLed" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity="0.8"/><stop offset="50%" stopColor="#ffffff" stopOpacity="0.9"/><stop offset="100%" stopColor={accent} stopOpacity="0.8"/></linearGradient>
                
                <filter id="pbrNoise"><feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="3" result="noise" /><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0" result="coloredNoise" /><feComposite operator="in" in2="SourceGraphic" result="texture" /><feBlend mode="multiply" in="texture" in2="SourceGraphic" /></filter>
                <filter id="panelInset"><feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.9"/><feDropShadow dx="0" dy="-1" stdDeviation="0.5" floodColor="#ffffff" floodOpacity="0.15"/></filter>
                
                <linearGradient id="sharpGlare" x1="-1" y1="-1" x2="2" y2="2">
                    <stop offset="0%" stopColor="rgba(255,255,255,0)" /><stop offset="48%" stopColor="rgba(255,255,255,0)" /><stop offset="50%" stopColor="rgba(255,255,255,0.15)" /><stop offset="52%" stopColor="rgba(255,255,255,0)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    <animate attributeName="x1" values="-2; 2; -2" dur="12s" repeatCount="indefinite" ease="linear" />
                    <animate attributeName="x2" values="1; 5; 1" dur="12s" repeatCount="indefinite" ease="linear" />
                </linearGradient>

                <linearGradient id="matteSteel" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#1a1a1a" /><stop offset="20%" stopColor="#2c2c2c" /><stop offset="80%" stopColor="#222222" /><stop offset="100%" stopColor="#0a0a0a" /></linearGradient>
                <linearGradient id="oxidizedCopper" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2f4f4f" /><stop offset="50%" stopColor="#1a3333" /><stop offset="100%" stopColor="#0d1a1a" /></linearGradient>
                <linearGradient id="matteGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8b6508" /><stop offset="50%" stopColor="#cd950c" /><stop offset="100%" stopColor="#5c4305" /></linearGradient>
                <linearGradient id="powderCoatedRed" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4a0e0e" /><stop offset="50%" stopColor="#8b1a1a" /><stop offset="100%" stopColor="#2b0808" /></linearGradient>
                <linearGradient id="mattePurple" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2e0854" /><stop offset="50%" stopColor="#4b0082" /><stop offset="100%" stopColor="#190431" /></linearGradient>
                <linearGradient id="plasticLed" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#111" /><stop offset="50%" stopColor="#333" /><stop offset="100%" stopColor="#111" /></linearGradient>
                
                <pattern id="speakerMesh" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="3" fill="#111"/><circle cx="1.5" cy="1.5" r="0.8" fill="#000" /></pattern>
                <pattern id="pat-seigaiha" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
                    <path d="M10 0 A10 10 0 0 0 0 10 A10 10 0 0 0 10 20 A10 10 0 0 0 20 10 A10 10 0 0 0 10 0 Z" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1"/>
                    <path d="M10 4 A6 6 0 0 0 4 10 A6 6 0 0 0 10 16 A6 6 0 0 0 16 10 A6 6 0 0 0 10 4 Z" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1"/>
                </pattern>
                <pattern id="pat-hex" width="10" height="17.32" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
                    <path d="M5 0 L10 2.88 L10 8.66 L5 11.54 L0 8.66 L0 2.88 Z" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5"/>
                </pattern>
                <clipPath id="screenClipLocal"><path d="M 6 6 L 184 6 L 180 74 L 10 74 Z" /></clipPath>
            </defs>
            
            {/* Ground Shadow */}
            <ellipse cx="120" cy="410" rx="100" ry="8" fill="#000" opacity="0.9" filter="blur(6px)" />
            
            {/* --- CHASSIS --- */}
            <g>
                <path d={chassis.path} fill={chassis.fill} stroke={chassis.stroke} strokeWidth="4" filter="url(#pbrNoise)" />
                <CulturalPaint islandId={safeIslandId} />
                
                {/* Hardware Greebles */}
                <g className="hardware-details">
                    <path d="M 22 140 L 22 295 M 218 140 L 218 295" stroke="#111" strokeWidth="1" opacity="0.8" />
                    <path d="M 24 140 L 24 295 M 216 140 L 216 295" stroke="#ffffff" strokeWidth="1" opacity="0.05" />
                    <g fill="url(#coldChrome)" stroke="#000" strokeWidth="0.5">
                        <circle cx="12" cy="45" r="1.5" /><circle cx="228" cy="45" r="1.5" />
                        <circle cx="12" cy="385" r="1.5" /><circle cx="228" cy="385" r="1.5" />
                        <circle cx="12" cy="140" r="1.5" /><circle cx="228" cy="140" r="1.5" />
                    </g>
                    <g transform="translate(10, 95)" filter="url(#panelInset)">
                        <rect width="8" height="20" fill="#050505" rx="1.5" />
                        <circle cx="4" cy="5" r="1.5" fill="#22c55e" opacity={visualState === 'FREE' ? '0.8' : '0.2'} />
                        <circle cx="4" cy="10" r="1.5" fill="#eab308" opacity={visualState === 'BUSY' ? '0.8' : '0.2'} />
                        <circle cx="4" cy="15" r="1.5" fill="#ef4444" opacity={visualState === 'BROKEN' ? '0.8' : '0.2'} />
                    </g>
                    <g transform="translate(10, 360)">
                        <rect width="18" height="8" fill="url(#coldChrome)" rx="0.5" stroke="#000" strokeWidth="0.25" />
                        <g fill="#111" opacity="0.8">
                            <rect x="2" y="2" width="1" height="4" /><rect x="4" y="2" width="2" height="4" /><rect x="7" y="2" width="0.5" height="4" /><rect x="9" y="2" width="2.5" height="4" /><rect x="13" y="2" width="1" height="4" /><rect x="15" y="2" width="1" height="4" />
                        </g>
                        <circle cx="1" cy="4" r="0.5" fill="#000" /><circle cx="17" cy="4" r="0.5" fill="#000" />
                    </g>
                    <g transform="translate(218, 90)">
                        <rect width="8" height="25" fill="#050505" rx="1" filter="url(#panelInset)" />
                        <line x1="1" y1="4" x2="7" y2="7" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="1" y1="10" x2="7" y2="13" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="1" y1="16" x2="7" y2="19" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="1" y1="22" x2="7" y2="25" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
                    </g>
                    <g transform="translate(220, 260)">
                        <circle cx="6" cy="6" r="4.5" fill="#050505" stroke="#ef4444" strokeWidth="0.5" filter="url(#panelInset)" />
                        <circle cx="6" cy="6" r="3" fill="url(#coldChrome)" />
                        <rect x="5.5" y="4.5" width="1" height="3" fill="#111" />
                    </g>
                    <g transform="translate(6, 120)">
                        <rect x="0" y="0" width="6" height="40" fill="#0a0a0c" rx="1" filter="url(#panelInset)" />
                        {[...Array(7)].map((_, i) => (<rect key={i} x="1" y={4 + (i * 5)} width="4" height="2" fill="#000" rx="0.5" />))}
                    </g>
                    <g transform="translate(6, 280)">
                        <rect x="0" y="0" width="4" height="25" fill="#111" rx="1" filter="url(#panelInset)" />
                        <circle cx="2" cy="4" r="1" fill="#333" /><circle cx="2" cy="12.5" r="1" fill="#333" /><circle cx="2" cy="21" r="1" fill="#333" />
                    </g>
                    <g transform="translate(12, 330)">
                        <rect x="0" y="0" width="25" height="40" fill="#0a0a0a" rx="2" filter="url(#panelInset)" />
                        {[...Array(8)].map((_, i) => (<line key={i} x1="4" y1={5 + (i * 4.5)} x2="21" y2={5 + (i * 4.5)} stroke="#111" strokeWidth="2" strokeLinecap="round" />))}
                    </g>
                    <g transform="translate(160, 235)">
                        <rect x="0" y="0" width="30" height="12" fill="#111" rx="1" stroke="#000" filter="url(#panelInset)" />
                        <rect x="2" y="5" width="26" height="2" fill="#000" />
                        <text x="15" y="10" textAnchor="middle" fill="#444" fontSize="3" fontWeight="bold">TICKET OUT</text>
                    </g>
                    <g transform="translate(222, 130)">
                        <circle cx="6" cy="6" r="5" fill="url(#coldChrome)" stroke="#000" strokeWidth="1" filter="url(#panelInset)" />
                        <circle cx="6" cy="6" r="3" fill="#111" /><rect x="5.5" y="5" width="1" height="4" fill="#000" />
                    </g>
                    <g transform="translate(210, 350)">
                        <circle cx="8" cy="8" r="6" fill="url(#matteGunmetal)" stroke="#000" strokeWidth="1" filter="url(#panelInset)" />
                        <circle cx="8" cy="8" r="3" fill="#000" /><rect x="7" y="8" width="2" height="4" fill="#000" />
                    </g>
                    <g transform="translate(210, 360)">
                        <rect width="20" height="8" fill="#e2e8f0" rx="1" />
                        <text x="10" y="6" textAnchor="middle" fill="#000" fontSize="4" fontWeight="900" fontFamily="sans-serif">管理ID</text>
                    </g>
                </g>

                <g opacity="0.9">
                    <rect x="24" y="140" width="6" height="155" fill="url(#plasticLed)" rx="2" stroke="#000" strokeWidth="1" filter="url(#panelInset)" />
                    <rect x="210" y="140" width="6" height="155" fill="url(#plasticLed)" rx="2" stroke="#000" strokeWidth="1" filter="url(#panelInset)" />
                </g>
                <g opacity={visualState === 'BROKEN' ? 0.1 : 0.8}>
                    <rect x="26.5" y="142" width="3" height="151" fill={visualState === 'FREE' ? '#333' : 'url(#accentLed)'} rx="0.5" />
                    <rect x="210.5" y="142" width="3" height="151" fill={visualState === 'FREE' ? '#333' : 'url(#accentLed)'} rx="0.5" />
                </g>
                <g transform="translate(0, 50)" filter="url(#panelInset)">
                    <path d="M 8 0 L 22 8 L 22 75 L 8 68 Z" fill="url(#speakerMesh)" stroke="#111" strokeWidth="1"/>
                    <path d="M 232 0 L 218 8 L 218 75 L 232 68 Z" fill="url(#speakerMesh)" stroke="#111" strokeWidth="1"/>
                </g>
            </g>

            {/* --- TOPPER --- */}
            <g transform="translate(45, 0)">
                <path d="M 0 5 L 150 5 L 142 45 L 8 45 Z" fill="url(#coldChrome)" stroke="#000" strokeWidth="1.5" filter="url(#pbrNoise)" />
                <circle cx="10" cy="10" r="1.5" fill="#222" /><circle cx="140" cy="10" r="1.5" fill="#222" />
                <circle cx="15" cy="40" r="1.5" fill="#222" /><circle cx="135" cy="40" r="1.5" fill="#222" />
                <path d="M 4 9 L 146 9 L 140 41 L 10 41 Z" fill="#050505" filter="url(#panelInset)" />
                <path d="M 6 11 L 144 11 L 138 39 L 12 39 Z" fill="url(#darkAcrylic)" />
                <g transform="translate(75, 23)">
                    <text x="0" y="-3" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold" fontFamily="sans-serif" letterSpacing="3">PROGRESSIVE POOL</text>
                    <text x="0" y="11" textAnchor="middle" fill={visualState === 'JACKPOT_HOT' ? '#eab308' : '#e2e8f0'} fontSize="14" fontFamily="monospace" fontWeight="900" letterSpacing="1">
                        {currentJackpot > 0 ? Number(currentJackpot).toLocaleString() : 'SYSTEM SYNC'}
                    </text>
                </g>
                <g transform="translate(-5, 18)"><circle cx="0" cy="0" r="10" fill="url(#coldChrome)" stroke="#000" /><circle cx="0" cy="0" r="7" fill={visualState === 'JACKPOT_HOT' ? '#ef4444' : '#450a0a'} /></g>
                <g transform="translate(155, 18)"><circle cx="0" cy="0" r="10" fill="url(#coldChrome)" stroke="#000" /><circle cx="0" cy="0" r="7" fill={visualState === 'JACKPOT_HOT' ? '#ef4444' : '#450a0a'} /></g>
            </g>

            {/* --- SCREEN BEZEL --- */}
            <g transform="translate(0, 80)">
                <path d="M 30 0 H 210 L 206 130 H 34 Z" fill="url(#matteGunmetal)" stroke="#000" strokeWidth="4" filter="url(#pbrNoise)" />
                <path d="M 35 5 H 205 L 202 125 H 38 Z" fill="#050505" filter="url(#panelInset)" />
                {mode === 'game' && (
                    <g opacity="0.9">
                        <line x1="95.5" y1="5" x2="95.5" y2="125" stroke="url(#coldChrome)" strokeWidth="3" />
                        <line x1="95.5" y1="5" x2="95.5" y2="125" stroke="#111" strokeWidth="1" />
                        <line x1="145.5" y1="5" x2="145.5" y2="125" stroke="url(#coldChrome)" strokeWidth="3" />
                        <line x1="145.5" y1="5" x2="145.5" y2="125" stroke="#111" strokeWidth="1" />
                    </g>
                )}
                <g fill="url(#coldChrome)" stroke="#000" strokeWidth="0.5" filter="url(#pbrNoise)">
                    <circle cx="33" cy="3" r="2" /><circle cx="207" cy="3" r="2" /><circle cx="37" cy="127" r="2" /><circle cx="203" cy="127" r="2" />
                </g>
                <g transform="translate(155, 10)">
                    <rect width="40" height="12" fill="#111" rx="1" stroke="#333" strokeWidth="1" filter="url(#panelInset)" />
                    <text x="20" y="8" textAnchor="middle" fill="#888" fontSize="5" fontFamily="monospace" fontWeight="bold" letterSpacing="1">SURO-OS</text>
                </g>
            </g>

            {/* --- TELEMETRY DASHBOARD --- */}
            <g transform="translate(25, 295)">
                 <path d="M 0 0 L 190 0 L 180 80 L 10 80 Z" fill="url(#matteGunmetal)" stroke="#000" strokeWidth="3" filter="url(#pbrNoise)" />
                 <g clipPath="url(#screenClipLocal)">
                     <rect x="0" y="0" width="190" height="80" fill="#0a0c10" />
                     <rect x="0" y="0" width="190" height="80" fill="url(#pat-seigaiha)" opacity="0.05" />
                     <polyline points={sparklinePoints} fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.3" />

                     <g transform="translate(95, 35)">
                         <text x="0" y="-12" textAnchor="middle" fill="#64748b" fontSize="6" fontWeight="bold" fontFamily="sans-serif" letterSpacing="2">{themeData.title}</text>
                         <text x="0" y="4" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">{themeData.name}</text>
                         <text x="0" y="18" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="sans-serif" letterSpacing="4">{themeData.kanji}</text>
                     </g>

                     <g transform="translate(145, 8)">
                         <text x="20" y="8" textAnchor="middle" fill="#0ea5e9" fontSize="6" fontFamily="monospace" fontWeight="bold">PAY: {(displayWins / 1000).toFixed(1)}k</text>
                     </g>
                     <g transform="translate(10, 68)">
                         <text x="0" y="0" fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold">SYS: {visualState}</text>
                     </g>
                     <g transform="translate(140, 68)">
                         <text x="40" y="0" textAnchor="end" fill="#0ea5e9" fontSize="6" fontFamily="monospace" fontWeight="bold">LAPS: {displayLaps.toString().padStart(4, '0')}</text>
                     </g>
                 </g>
                 <path d="M 0 0 L 190 0 L 180 80 L 10 80 Z" fill="none" stroke="#000" strokeWidth="4" opacity="0.8" pointerEvents="none" />
            </g>

            {/* --- RFID DECK & ACOUSTIC CHUTE --- */}
            <g transform="translate(5, 380)">
                 <path d="M 5 0 Q 115 15 225 0 L 230 20 Q 115 30 0 20 Z" fill="url(#matteGunmetal)" stroke="#111" strokeWidth="3" filter="url(#pbrNoise)" />
                 <path d="M 12 4 Q 115 18 218 4 L 214 16 Q 115 26 16 16 Z" fill="#050505" filter="url(#panelInset)" />
                 
                 <g transform="translate(20, 6) rotate(-2)">
                    <rect width="50" height="12" rx="2" fill="#0a0a0c" stroke="#222" strokeWidth="1" />
                    <rect x="2" y="2" width="46" height="8" rx="1" fill="#020202" />
                    <path d="M 8 3 Q 12 3 14 6 M 6 5 Q 10 5 12 8 M 4 7 Q 8 7 10 10" fill="none" stroke="#333" strokeWidth="0.8" strokeLinecap="round" />
                    <text x="25" y="7.5" textAnchor="middle" fill="#64748b" fontSize="4" fontFamily="sans-serif" fontWeight="900" letterSpacing="1">RFID SCAN</text>
                    <circle cx="44" cy="6" r="1.5" fill={visualState === 'FREE' ? '#22c55e' : '#3b82f6'} opacity="0.8" />
                 </g>

                 <g transform="translate(85, 7)">
                     <rect width="125" height="14" rx="1" fill="#020617" stroke="#1e293b" strokeWidth="1" />
                     <text x="5" y="9.5" fill="#0ea5e9" fontSize="5" fontFamily="monospace" fontWeight="bold">OP: {userName.substring(0, 8).toUpperCase()}</text>
                     <text x="65" y="9.5" fill="#0ea5e9" fontSize="5" fontFamily="monospace" fontWeight="bold">BET: {currentBet > 0 ? formatK(currentBet) : '---'}</text>
                     <rect x="115" y="4" width="6" height="6" fill={visualState !== 'FREE' ? '#0ea5e9' : '#334155'} rx="1" />
                 </g>
            </g>

            <g transform="translate(80, 400)">
                <path d="M 0 0 L 80 0 L 75 12 L 5 12 Z" fill="#050505" filter="url(#panelInset)" />
                <rect x="5" y="2" width="70" height="1.5" fill="#111" />
                <rect x="10" y="5" width="60" height="1.5" fill="#111" />
                <rect x="15" y="8" width="50" height="1.5" fill="#111" />
            </g>
            
            <path d="M 15 40 L 225 40 L 230 395 L 10 395 Z" fill="url(#sharpGlare)" pointerEvents="none" />
        </motion.svg>
    );
};

export default memo(CabinetSVG);