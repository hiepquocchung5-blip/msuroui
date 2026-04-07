import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

const CabinetSVG = ({ 
    islandId, 
    visualState = 'FREE', 
    mode = 'hall', 
    machine = {}, 
    stats = { laps: 0, wins: 0 }, 
    machineNumber = 0,
    serialNumber = null,
    currentJackpot = 0 
}) => {
    
    const safeIslandId = Math.max(1, Math.min(5, parseInt(islandId) || 1));

    const getAccentColor = () => {
        if (visualState === 'JACKPOT_HOT') return '#FFD700';
        switch(safeIslandId) {
            case 1: return '#FF0055'; 
            case 2: return '#00F3FF'; 
            case 3: return '#FF4500'; 
            case 4: return '#A855F7'; 
            case 5: return '#FFD700'; 
            default: return '#FF0055';
        }
    };
    
    const accent = getAccentColor();

    // --- AAA FLUID ANIMATION PROFILES (Heavy Machinery) ---
    const isBusy = visualState === 'BUSY';
    const isHot = visualState === 'JACKPOT_HOT';
    const isBroken = visualState === 'BROKEN';
    
    const animProfile = {
        FREE: { 
            ledSpeed: '5s', 
            physics: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 6, ease: "easeInOut" } } 
        },
        BUSY: { 
            ledSpeed: '1.5s', 
            physics: { y: [0, -1, 0], scale: [1, 1.002, 1], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } } 
        },
        JACKPOT_HOT: { 
            ledSpeed: '0.5s', 
            physics: { y: [0, -4, 0], scale: [1, 1.01, 1], filter: ['drop-shadow(0 20px 30px rgba(0,0,0,0.9))', `drop-shadow(0 20px 50px ${accent}80)`], transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } } 
        },
        BROKEN: { 
            ledSpeed: '0s', 
            physics: { y: 0, opacity: 0.6, filter: 'grayscale(0.8)' } 
        }
    }[visualState] || { ledSpeed: '5s', physics: { y: 0 } };

    const displayLaps = machine?.total_laps || stats.laps || 0;
    const displayWins = machine?.total_payout || stats.wins || 0;
    const displayNum = machine?.machine_number || machineNumber || 0;
    const displaySerial = machine?.serial_number || serialNumber || `SRO-${safeIslandId}-${displayNum.toString().padStart(3,'0')}`;

    // --- CUSTOM UNICODE TYPOGRAPHY & NARRATIVE THEMES ---
    const islandThemes = {
        1: { name: '𝓚𝔂𝓸𝓽𝓸 𝓩𝓮𝓷', title: "SHRINE OF FORTUNE", kanji: "福・神・符", short: "京都" },
        2: { name: '𝙾𝚔𝚒𝚗𝚊𝚠𝚊 𝚃𝚛𝚘𝚙𝚒𝚌', title: "ISLAND LOTTERY", kanji: "琉球・魚・波", short: "沖縄" },
        3: { name: 'ＯＳＡＫＡ ＮＥＯＮ', title: "DOTONBORI CHALLENGE", kanji: "大阪・祭・虎", short: "大阪" },
        4: { name: '𝕿𝖔𝖐𝖞𝖔 𝕮𝖞𝖇𝖊𝖗', title: "CYBER YAKUZA", kanji: "電脳・刀・狼", short: "東京" },
        5: { name: '𝐆𝐢𝐧𝐳𝐚 𝐆𝐨𝐥𝐝', title: "GOLD BOUTIQUE", kanji: "金塊・宝石・華", short: "銀座" }
    };
    
    const currentTheme = islandThemes[safeIslandId];

    const bellySparklinePoints = useMemo(() => {
        let pts = [];
        let y = 40; 
        for(let x = -10; x <= 200; x += 5) {
            y = Math.max(10, Math.min(70, 40 + (Math.sin((displayNum * x) + x) * 15) + (Math.cos(x * 3) * 5)));
            pts.push(`${x},${y.toFixed(1)}`);
        }
        return pts.join(' ');
    }, [displayNum]);

    // --- 1. ADVANCED MATERIALS, SHADERS & THEMATIC PATTERNS ---
    const renderDefs = () => (
        <defs>
            {/* Hyper-Realistic Metals */}
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
            <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4a3500" />
                <stop offset="30%" stopColor="#b8860b" />
                <stop offset="45%" stopColor="#ffeb73" />
                <stop offset="55%" stopColor="#ffd700" />
                <stop offset="75%" stopColor="#b8860b" />
                <stop offset="100%" stopColor="#2e1a00" />
            </linearGradient>
            <linearGradient id="brushMetal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1a1a1a"/><stop offset="30%" stopColor="#333"/><stop offset="50%" stopColor="#555"/><stop offset="70%" stopColor="#333"/><stop offset="100%" stopColor="#1a1a1a"/>
            </linearGradient>
            <linearGradient id="anodizedRed" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2b0000"/><stop offset="50%" stopColor="#660000"/><stop offset="100%" stopColor="#1a0000"/>
            </linearGradient>
            <linearGradient id="anodizedBlue" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#001122"/><stop offset="50%" stopColor="#003366"/><stop offset="100%" stopColor="#000a14"/>
            </linearGradient>
            <linearGradient id="cyberPurple" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#100022"/><stop offset="50%" stopColor="#3b0066"/><stop offset="100%" stopColor="#0a0014"/>
            </linearGradient>
            
            {/* Textures & Glare */}
            <filter id="pbrNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
                <feColorMatrix type="saturate" values="0"/>
                <feComponentTransfer><feFuncA type="table" tableValues="0 0.06"/></feComponentTransfer>
                <feComposite operator="in" in2="SourceGraphic" result="texture" />
                <feBlend mode="multiply" in="texture" in2="SourceGraphic" />
            </filter>

            <filter id="ambientGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            
            <filter id="grungeGlow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

            <filter id="specular">
                <feSpecularLighting surfaceScale="3" specularConstant="1.2" specularExponent="30" lightingColor="#fff">
                    <fePointLight x="120" y={isHot ? 20 : 80} z="200">
                        {isHot && <animate attributeName="x" values="20;220;20" dur="3s" repeatCount="indefinite" ease="easeInOut" />}
                    </fePointLight>
                </feSpecularLighting>
                <feComposite operator="in" in2="SourceGraphic"/>
                <feBlend mode="screen" in2="SourceGraphic"/>
            </filter>

            <linearGradient id="glassGlare" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="40%" stopColor="rgba(255,255,255,0.02)" />
                <stop offset="45%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            {/* Hardware Patterns & Decals */}
            <pattern id="pat-hazard" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="10" height="20" fill="#000" opacity="0.6"/>
                <rect x="10" width="10" height="20" fill="#FFD700" opacity="0.6"/>
            </pattern>
            
            <pattern id="pat-1" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
                <path d="M10 0 L20 10 L10 20 L0 10 Z M0 0 L20 20 M20 0 L0 20" fill="none" stroke="rgba(255,215,0,0.06)" strokeWidth="0.5"/>
            </pattern>
            <pattern id="pat-2" width="30" height="15" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
                <path d="M0 10 Q7.5 0 15 10 T30 10" fill="none" stroke="rgba(0,243,255,0.06)" strokeWidth="1"/>
            </pattern>
            <pattern id="pat-3" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,69,0,0.08)" strokeWidth="2"/>
            </pattern>
            <pattern id="pat-4" width="15" height="15" patternUnits="userSpaceOnUse">
                <path d="M0 0 H15 V15 H0 Z" fill="none" stroke="rgba(168,85,247,0.05)" strokeWidth="0.5"/>
                <circle cx="7.5" cy="7.5" r="1" fill="rgba(168,85,247,0.1)"/>
            </pattern>
            <pattern id="pat-5" width="12" height="12" patternUnits="userSpaceOnUse">
                <path d="M6 0 L12 6 L6 12 L0 6 Z" fill="none" stroke="rgba(255,215,0,0.08)" strokeWidth="0.5"/>
            </pattern>

            <pattern id="speakerMesh" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
                <rect width="4" height="4" fill="#0a0a0a"/><circle cx="2" cy="2" r="1.2" fill="#1a1a1a" />
            </pattern>
            
            <pattern id="crtScanline" width="4" height="4" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(0,0,0,0.3)" strokeWidth="2"/>
            </pattern>

            {/* LED Flow Shaders */}
            <linearGradient id="ledFlowVert" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="0"/>
                <stop offset="50%" stopColor="#FFF" stopOpacity="1"/>
                <stop offset="100%" stopColor={accent} stopOpacity="0"/>
            </linearGradient>

            <filter id="glowLight"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="hotGlow"><feGaussianBlur stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

            <clipPath id="screenClipLocal"><path d="M 4 4 L 186 4 L 176 76 L 14 76 Z" /></clipPath>
        </defs>
    );

    // --- 2. CULTURAL GRAFFITI, GRUNGE & HARDWARE ENGINE ---
    const renderGraffitiDecals = () => {
        // Hardware overlays (Coin Slots, Locks, Warning Stickers) universally applied to feel "Real"
        const renderHardware = () => (
            <g className="hardware-layer">
                {/* Coin Slot Right Side */}
                <g transform="translate(205, 180)">
                    <rect x="0" y="0" width="16" height="45" rx="3" fill="url(#chrome)" stroke="#000" strokeWidth="1" filter="url(#pbrNoise)" />
                    <rect x="7" y="5" width="2" height="20" fill="#000" />
                    <text x="8" y="38" textAnchor="middle" fill="#000" fontSize="4" fontWeight="bold">100¥</text>
                    <path d="M 4 40 L 12 40 L 8 43 Z" fill="#f00" />
                </g>
                
                {/* Operator Keyhole Left Side */}
                <g transform="translate(15, 185)">
                    <circle cx="8" cy="8" r="6" fill="url(#chrome)" stroke="#111" strokeWidth="0.5" />
                    <circle cx="8" cy="8" r="4" fill="#000" />
                    <rect x="7" y="8" width="2" height="4" fill="#000" />
                </g>

                {/* Generic Hazard Tape Edge */}
                <rect x="10" y="390" width="40" height="5" fill="url(#pat-hazard)" />
                <rect x="190" y="390" width="40" height="5" fill="url(#pat-hazard)" />
            </g>
        );

        // Island Specific Street Graffiti
        const renderStreetTags = () => {
            switch(safeIslandId) {
                case 1: // Kyoto Zen - Sumi-e Ink Wash & Red Stamps
                    return (
                        <g className="graffiti-layer" style={{mixBlendMode: 'overlay'}}>
                            <path d="M 15 350 Q 50 300 25 250 T 35 150" fill="none" stroke="#000" strokeWidth="15" strokeLinecap="round" filter="blur(2px)"/>
                            {/* Ink Drips */}
                            <circle cx="20" cy="280" r="3" fill="#000" filter="blur(1px)"/>
                            <circle cx="45" cy="310" r="2" fill="#000" filter="blur(1px)"/>
                            {/* Vertical Hanko Seal */}
                            <g transform="translate(210, 260)" opacity="0.8">
                                <rect x="0" y="0" width="12" height="35" fill="#a00" opacity="0.6"/>
                                <text x="6" y="10" fill="#fff" fontSize="6" textAnchor="middle" fontWeight="bold">京</text>
                                <text x="6" y="20" fill="#fff" fontSize="6" textAnchor="middle" fontWeight="bold">都</text>
                                <text x="6" y="30" fill="#fff" fontSize="6" textAnchor="middle" fontWeight="bold">印</text>
                            </g>
                            {/* Marker Scrawl */}
                            <text x="25" y="380" fill="#000" fontSize="8" fontWeight="bold" transform="rotate(-15)" opacity="0.6" style={{fontFamily: 'Impact'}}>DO NOT KICK</text>
                        </g>
                    );
                case 2: // Okinawa Tropic - Neon Pop Stickers & Wave Scrawls
                    return (
                        <g className="graffiti-layer" style={{mixBlendMode: 'screen'}}>
                            <path d="M 10 300 Q 30 280 50 300 T 90 300" fill="none" stroke="#0ff" strokeWidth="4" filter="url(#grungeGlow)" opacity="0.6"/>
                            <path d="M 150 150 Q 170 130 190 150 T 230 150" fill="none" stroke="#f0f" strokeWidth="2" filter="url(#grungeGlow)" opacity="0.5"/>
                            <text x="-150" y="215" fill="#fff" fontSize="24" fontWeight="900" fontStyle="italic" transform="rotate(-90)" letterSpacing="5" opacity="0.2">TROPIC</text>
                            {/* Sticker Slap */}
                            <g transform="translate(25, 250) rotate(-10)">
                                <rect x="0" y="0" width="30" height="15" fill="#ffeb3b" rx="2" />
                                <text x="15" y="10" fill="#000" fontSize="6" textAnchor="middle" fontWeight="900">100% PURE</text>
                            </g>
                        </g>
                    );
                case 3: // Osaka Neon - Bosozoku/Yakuza Graffiti
                    return (
                        <g className="graffiti-layer" opacity="0.7">
                            <text x="-380" y="35" fill="#f00" fontSize="30" fontWeight="900" fontFamily="Impact, sans-serif" transform="rotate(-90)" letterSpacing="2" stroke="#000" strokeWidth="2">BOSOZOKU</text>
                            {/* Spray Paint Drips */}
                            <path d="M 25 200 Q 40 210 25 220" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.5" style={{mixBlendMode: 'overlay'}}/>
                            <circle cx="28" cy="225" r="2.5" fill="#fff" opacity="0.5" style={{mixBlendMode: 'overlay'}}/>
                            <circle cx="25" cy="235" r="1" fill="#fff" opacity="0.5" style={{mixBlendMode: 'overlay'}}/>
                            {/* Heavy Marker */}
                            <text x="215" y="250" fill="#000" fontSize="12" fontWeight="900" transform="rotate(90)" style={{fontFamily: 'serif'}} opacity="0.8">神風</text>
                        </g>
                    );
                case 4: // Tokyo Cyber - Circuit Schematics, Barcodes & Neon Tags
                    return (
                        <g className="graffiti-layer" opacity="0.8" fill="#0ff" style={{mixBlendMode: 'screen'}}>
                            {/* Barcode */}
                            <g transform="translate(15, 130) rotate(-90)">
                                <rect x="0" y="0" width="2" height="15" /><rect x="4" y="0" width="4" height="15" /><rect x="10" y="0" width="1" height="15" /><rect x="13" y="0" width="6" height="15" /><rect x="21" y="0" width="2" height="15" />
                                <text x="10" y="22" fill="#0ff" fontSize="4" fontFamily="monospace" letterSpacing="1">V-77.0X</text>
                            </g>
                            {/* Hex Grid Sketch */}
                            <path d="M 200 340 L 205 330 L 215 330 L 220 340 L 215 350 L 205 350 Z" fill="none" stroke="#a855f7" strokeWidth="1" filter="url(#grungeGlow)"/>
                            <text x="195" y="375" fontSize="4" fontFamily="monospace" letterSpacing="1" opacity="0.7">SYS.ERR.77</text>
                            <text x="35" y="385" fill="#f0f" fontSize="8" fontWeight="bold" transform="rotate(-5)" filter="url(#grungeGlow)" style={{fontFamily: 'Impact'}}>JACKED</text>
                        </g>
                    );
                case 5: // Ginza Gold - Defaced Luxury
                    return (
                        <g className="graffiti-layer" opacity="0.5" style={{mixBlendMode: 'color-dodge'}}>
                            {/* Filigree Watermarks */}
                            <path d="M 15 300 C 30 250, 0 200, 25 150" fill="none" stroke="url(#gold)" strokeWidth="8" filter="blur(1px)"/>
                            {/* Defaced spray */}
                            <path d="M 225 300 C 210 250, 240 200, 215 150" fill="none" stroke="#f00" strokeWidth="4" filter="url(#grungeGlow)" opacity="0.6"/>
                            <text x="210" y="220" fill="#f00" fontSize="16" fontWeight="900" transform="rotate(15)" style={{fontFamily: 'Impact'}}>VIP ONLY</text>
                        </g>
                    );
                default: return null;
            }
        };

        return (
            <>
                {renderStreetTags()}
                {renderHardware()}
            </>
        );
    };

    // --- 3. ORGANIC CHASSIS GEOMETRY (Hyper-Metallic Base) ---
    const renderChassis = () => {
        let path, fill, stroke;
        switch(safeIslandId) {
            case 1: fill="url(#anodizedRed)"; stroke="url(#gold)"; path = "M10,35 Q120,15 230,35 L235,395 L5,395 Z"; break;
            case 2: fill="url(#anodizedBlue)"; stroke="#00f3ff"; path = "M10,30 H50 V45 H190 V30 H230 V395 H10 Z"; break;
            case 3: fill="url(#brushMetal)"; stroke="#F00"; path = "M10,50 L40,30 L80,50 L120,30 L160,50 L200,30 L230,50 L235,395 L5,395 Z"; break;
            case 4: fill="url(#cyberPurple)"; stroke="#A855F7"; path = "M15,40 L35,20 L205,20 L225,40 L225,395 L15,395 Z"; break;
            case 5: fill="#1a1000"; stroke="url(#gold)"; path = "M20,60 L120,20 L220,60 L225,395 L15,395 Z"; break;
            default: fill="url(#anodizedRed)"; stroke="url(#gold)"; path = "M10,35 Q120,15 230,35 L235,395 L5,395 Z"; break;
        }

        return (
            <g>
                {/* Smooth Organic Ambient Glow (Reactor Leak) */}
                <path d={path} fill="none" stroke={accent} strokeWidth={isHot ? "12" : "6"} filter="url(#ambientGlow)" opacity={isHot ? 0.7 : 0.2} />

                {/* Base Metal Layer */}
                <path d={path} fill={fill} stroke={stroke} strokeWidth="3" filter="url(#pbrNoise)" />
                <path d={path} fill={`url(#pat-${safeIslandId})`} opacity="1" style={{mixBlendMode: 'screen'}} pointerEvents="none" />
                
                {/* Specular Highlight for Curved Metal */}
                <path d={path} fill="none" stroke="url(#glassGlare)" strokeWidth="6" pointerEvents="none" />

                {/* Street Culture / Graffiti & Hardware Layer */}
                {renderGraffitiDecals()}
                
                {/* Serial Plate (Screwed in) */}
                <g transform="translate(15, 305)" opacity="0.8">
                    <rect width="26" height="10" fill="url(#darkChrome)" rx="1" stroke="#000" strokeWidth="0.5"/>
                    {/* Tiny Screws */}
                    <circle cx="2" cy="2" r="0.8" fill="#555" /><circle cx="24" cy="2" r="0.8" fill="#555" />
                    <circle cx="2" cy="8" r="0.8" fill="#555" /><circle cx="24" cy="8" r="0.8" fill="#555" />
                    <text x="13" y="7" textAnchor="middle" fill={accent} fontSize="4" fontFamily="monospace" fontWeight="bold">SRO-0{displayNum.toString().slice(-1)}</text>
                </g>

                {/* Heavy Speaker Grills */}
                <g transform="translate(0, 50)">
                    <path d="M 5 0 L 25 10 L 25 80 L 5 70 Z" fill="url(#speakerMesh)" stroke="#000" strokeWidth="3"/>
                    <path d="M 235 0 L 215 10 L 215 80 L 235 70 Z" fill="url(#speakerMesh)" stroke="#000" strokeWidth="3"/>
                    <ellipse cx="15" cy="40" rx="4" ry="12" fill="#000" stroke={accent} strokeWidth="1.5" filter="url(#glowLight)" opacity={isHot ? 1 : 0.6} className={isHot ? 'animate-pulse' : ''} />
                    <ellipse cx="225" cy="40" rx="4" ry="12" fill="#000" stroke={accent} strokeWidth="1.5" filter="url(#glowLight)" opacity={isHot ? 1 : 0.6} className={isHot ? 'animate-pulse' : ''} />
                </g>

                {/* Vertical Laser Cut Lines (Neon Accent Trim) */}
                <g opacity={isBroken ? 0 : (isBusy || isHot ? 1 : 0.4)}>
                    <line x1="20" y1="140" x2="20" y2="295" stroke="#000" strokeWidth="4" strokeLinecap="round" />
                    <line x1="220" y1="140" x2="220" y2="295" stroke="#000" strokeWidth="4" strokeLinecap="round" />

                    <g>
                        <line x1="20" y1="140" x2="20" y2="295" stroke="url(#ledFlowVert)" strokeWidth="2.5" strokeLinecap="round" filter="url(#glowLight)">
                            {!isBroken && <animate attributeName="stroke-dasharray" values="0,300; 300,0; 0,300" dur={animProfile.ledSpeed} repeatCount="indefinite" ease="easeInOut" />}
                        </line>
                        <line x1="220" y1="140" x2="220" y2="295" stroke="url(#ledFlowVert)" strokeWidth="2.5" strokeLinecap="round" filter="url(#glowLight)">
                            {!isBroken && <animate attributeName="stroke-dasharray" values="0,300; 300,0; 0,300" dur={animProfile.ledSpeed} repeatCount="indefinite" ease="easeInOut" />}
                        </line>
                    </g>
                </g>
            </g>
        );
    };

    // --- 4. AAA TOPPER & WARNING LIGHTS ---
    const renderTopper = () => {
        const ledThemes = {
            1: { bg: '#2b0000', glow: '#ff0000', border: '#FFD700' }, 
            2: { bg: '#001122', glow: '#0066ff', border: '#00f3ff' }, 
            3: { bg: '#1a0500', glow: '#ff0000', border: '#ff4500' }, 
            4: { bg: '#110022', glow: '#a855f7', border: '#a855f7' }, 
            5: { bg: '#1a1000', glow: '#eab308', border: '#eab308' }, 
        };
        const led = ledThemes[safeIslandId];

        return (
            <g transform="translate(45, -8)">
                {/* Structural Bezel with Screws */}
                <path d="M 0 5 L 150 5 L 140 45 L 10 45 Z" fill="url(#chrome)" stroke="#111" strokeWidth="2" filter="url(#pbrNoise)" />
                <circle cx="10" cy="10" r="1.5" fill="#222" /><circle cx="140" cy="10" r="1.5" fill="#222" />
                <circle cx="15" cy="40" r="1.5" fill="#222" /><circle cx="135" cy="40" r="1.5" fill="#222" />
                
                <path d="M 4 9 L 146 9 L 138 41 L 12 41 Z" fill="#020202" />
                
                {/* Embedded LCD Screen */}
                <path d="M 6 11 L 144 11 L 136 39 L 14 39 Z" fill={led.bg} stroke={led.border} strokeWidth="0.5" />
                <path d="M 6 11 L 144 11 L 136 39 L 14 39 Z" fill="url(#glassGlare)" opacity="0.6" pointerEvents="none" />

                {/* Always show Grand Jackpot Data clearly */}
                <g transform="translate(75, 22)" className={isHot ? "animate-[pulse_1s_ease-in-out_infinite]" : ""}>
                    <text x="0" y="-3" textAnchor="middle" fill={`url(#textGrad${safeIslandId})`} fontSize="11" fontWeight="900" fontStyle="italic" letterSpacing="4" style={{ filter: `drop-shadow(0 0 8px ${led.glow})` }}>
                        GRAND JACKPOT
                    </text>
                    <text x="0" y="13" textAnchor="middle" fill="#ffffff" fontSize="12" fontFamily="monospace" style={{ fontWeight: 800, filter: `drop-shadow(0 0 12px #fff)`, letterSpacing: "1.5px" }}>
                        {currentJackpot > 0 ? Number(currentJackpot).toLocaleString() : 'SYNCING...'}
                    </text>
                </g>

                {/* Topper Warning Sirens */}
                <g transform="translate(-10, 15)">
                    <circle cx="0" cy="0" r="8" fill="url(#chrome)" />
                    <circle cx="0" cy="0" r="6" fill={isHot ? '#f00' : '#300'} filter={isHot ? 'url(#hotGlow)' : ''} className={isHot ? 'animate-pulse' : ''} />
                </g>
                <g transform="translate(160, 15)">
                    <circle cx="0" cy="0" r="8" fill="url(#chrome)" />
                    <circle cx="0" cy="0" r="6" fill={isHot ? '#f00' : '#300'} filter={isHot ? 'url(#hotGlow)' : ''} className={isHot ? 'animate-pulse' : ''} />
                </g>
            </g>
        );
    };

    // --- 5. REALISTIC SCREEN BEZEL & REEL CAGE ---
    const renderScreenArea = () => {
        return (
            <g transform="translate(0, 80)">
                <path d="M 30 0 H 210 L 205 130 H 35 Z" fill="url(#darkPlast)" stroke={safeIslandId === 5 ? "url(#gold)" : "url(#chrome)"} strokeWidth="4" filter="url(#pbrNoise)" />
                <path d="M 35 5 H 205 L 200 125 H 40 Z" fill="#020202" />
                
                {mode === 'game' && (
                    <g opacity="0.5">
                        <line x1="95.5" y1="5" x2="95.5" y2="125" stroke="url(#chrome)" strokeWidth="1.5" />
                        <line x1="145.5" y1="5" x2="145.5" y2="125" stroke="url(#chrome)" strokeWidth="1.5" />
                    </g>
                )}

                <path d="M 35 5 H 205 L 195 25 H 45 Z" fill="#111" opacity="0.9" />
                <path d="M 35 5 L 45 25 V 105 L 40 125 Z" fill="#111" opacity="0.6" />
                
                {/* Screen Hardware Decal (Cleaned up for realism) */}
                <g transform="translate(155, 10)">
                    <rect width="40" height="12" fill="#050505" opacity="0.9" rx="2" stroke={accent} strokeWidth="0.5" />
                    <text x="20" y="8" textAnchor="middle" fill={accent} fontSize="5" fontFamily="monospace" fontWeight="900" letterSpacing="1">
                        SRO-V10
                    </text>
                </g>
                
                <path d="M 35 5 H 205 L 200 125 H 40 Z" fill="url(#glassGlare)" opacity="0.7" pointerEvents="none" />
            </g>
        );
    };

    // --- 6. CONTROL DECK ---
    const renderButtonDeck = () => (
        <g transform="translate(10, 220)">
             <path d="M 0 0 L 220 0 L 235 60 L -15 60 Z" fill={safeIslandId === 5 ? "url(#brushMetal)" : "url(#darkPlast)"} stroke="#111" strokeWidth="3" filter="url(#pbrNoise)" />
             <path d="M -15 60 L 235 60 L 230 75 L -10 75 Z" fill="#050505" />
             
             {/* Deck Screws */}
             <circle cx="5" cy="55" r="1.5" fill="#333" /><circle cx="215" cy="55" r="1.5" fill="#333" />

             {mode === 'game' && (
                 <g opacity="0.4">
                     <text x="30" y="12" fill="#fff" fontSize="5" fontWeight="bold">ベット</text>
                     <text x="210" y="12" fill="#fff" fontSize="5" fontWeight="bold" textAnchor="end">スピン</text>
                     <text x="120" y="68" fill="#fff" fontSize="4" fontWeight="bold" textAnchor="middle" letterSpacing="4">ストップ</text>
                 </g>
             )}

             <g transform="translate(195, 10)">
                 <rect x="0" y="0" width="18" height="32" rx="4" fill="#0a0a0a" stroke="url(#chrome)" strokeWidth="2" />
                 <line x1="9" y1="6" x2="9" y2="26" stroke="#111" strokeWidth="3" strokeLinecap="round" />
                 <circle cx="9" cy="38" r="4" fill="#0F0" filter="url(#glowLight)" className={isBusy ? 'opacity-30' : 'animate-[pulse_2s_ease-in-out_infinite]'} />
             </g>

             <g transform="translate(5, 15)">
                 <rect x="0" y="0" width="26" height="18" rx="4" fill="#1a1a1a" stroke="#000" strokeWidth="2" />
                 <rect x="2" y="2" width="22" height="14" rx="2" fill="#600" />
                 <text x="13" y="11" textAnchor="middle" fill="#FFF" fontSize="4.5" fontWeight="900">MAX BET</text>
             </g>

             {/* Dynamic Deck Light */}
             <g transform="translate(17, 45)">
                 <circle cx="0" cy="0" r="14" fill="#111" />
                 <circle cx="0" cy="0" r="10" fill="url(#chrome)" />
                 <circle cx="0" cy="-4" r="8" fill={isBusy ? "#00F3FF" : "red"} filter="url(#glowLight)" opacity={isBusy ? 0.6 : 1} />
             </g>
        </g>
    );

    // --- 7. EMBEDDED TELEMETRY DASHBOARD (Belly Glass) ---
    const renderTelemetryDashboard = () => {
        let screenBg = '#050508';
        if (isHot) screenBg = '#1a0505';
        else if (isBroken) screenBg = '#000000'; 
        else if (isBusy) screenBg = '#020a0a';

        return (
            <g transform="translate(25, 295)">
                 {/* Bezel */}
                 <path d="M 0 0 L 190 0 L 180 80 L 10 80 Z" fill="#020202" stroke="url(#chrome)" strokeWidth="3" filter="url(#pbrNoise)" />
                 
                 <g clipPath="url(#screenClipLocal)">
                     {/* Screen Base & Deep Shadow */}
                     <rect x="0" y="0" width="190" height="80" fill={screenBg} className="transition-all duration-1000" />
                     <rect x="0" y="0" width="190" height="80" fill={`url(#pat-${safeIslandId})`} opacity="0.15" />
                     <rect x="0" y="0" width="190" height="80" fill="none" stroke="#000" strokeWidth="8" opacity="0.6" /> {/* Inner CRT Shadow */}
                     <rect x="0" y="0" width="190" height="80" fill="url(#crtScanline)" opacity="0.3" pointerEvents="none" />

                     {/* Tracking Reticle (Circuit Chaos Vibe) */}
                     {!isBroken && (
                         <g opacity="0.2">
                             <circle cx="95" cy="40" r="30" fill="none" stroke={accent} strokeWidth="0.5" strokeDasharray="2 4" />
                             <circle cx="95" cy="40" r="20" fill="none" stroke={accent} strokeWidth="0.5" />
                             <line x1="60" y1="40" x2="130" y2="40" stroke={accent} strokeWidth="0.5" opacity="0.5"/>
                             <line x1="95" y1="5" x2="95" y2="75" stroke={accent} strokeWidth="0.5" opacity="0.5"/>
                         </g>
                     )}

                     {!isBroken && (
                         <g opacity="0.4">
                             <polyline points={bellySparklinePoints} fill="none" stroke={accent} strokeWidth="1.5" filter="url(#glowLight)" className="transition-all duration-500" />
                         </g>
                     )}

                     {isBroken ? (
                         <g opacity="0.9">
                             <text x="95" y="45" textAnchor="middle" fill="#F00" fontSize="14" fontWeight="900" fontStyle="italic" letterSpacing="4" filter="url(#glowLight)">SYSTEM OFFLINE</text>
                         </g>
                     ) : (
                         <>
                             <g transform="translate(95, 45)">
                                 <text x="0" y="-12" textAnchor="middle" fill={accent} fontSize="5" fontWeight="900" opacity="0.8" letterSpacing="3">
                                     {currentTheme.title}
                                 </text>
                                 <text x="0" y="0" textAnchor="middle" fill={`url(#textGrad${safeIslandId})`} fontSize="18" fontWeight="900" fontStyle="italic" style={{ filter: `drop-shadow(0 0 5px ${accent})` }}>
                                     {currentTheme.name}
                                 </text>
                                 <text x="0" y="16" textAnchor="middle" fill="#FFF" fontSize="8" opacity="0.3" letterSpacing="6">
                                     {currentTheme.kanji}
                                 </text>
                             </g>
                         </>
                     )}

                     {/* HUD Readouts - Keeping Laps, Volatility, Wins clear */}
                     <g transform="translate(145, 5)">
                         <rect width="40" height="12" fill="rgba(0,0,0,0.8)" rx="2" stroke={accent} strokeWidth="0.5" />
                         <text x="20" y="8.5" textAnchor="middle" fill="#FFF" fontSize="6" fontFamily="monospace" fontWeight="900" style={{ filter: `drop-shadow(0 0 2px #fff)` }}>
                             W: {(displayWins / 1000).toFixed(1)}k
                         </text>
                     </g>

                     <g transform="translate(5, 63)">
                         <rect width="45" height="12" fill="rgba(0,0,0,0.8)" rx="2" stroke={accent} strokeWidth="0.5" />
                         <text x="22.5" y="8.5" textAnchor="middle" fill={accent} fontSize="5" fontFamily="monospace" fontWeight="900">
                             VOL: {visualState}
                         </text>
                     </g>

                     <g transform="translate(140, 63)">
                         <rect width="45" height="12" fill="rgba(0,0,0,0.8)" rx="2" stroke={accent} strokeWidth="0.5" />
                         <text x="20.5" y="8.5" textAnchor="middle" fill="#FFF" fontSize="6" fontFamily="monospace" fontWeight="900" style={{ filter: `drop-shadow(0 0 2px #fff)` }}>
                             LAPS: {displayLaps.toString().padStart(4, '0')}
                         </text>
                     </g>
                 </g>
                 
                 {/* Curved CRT Glass Glare */}
                 <path d="M 0 0 L 190 0 L 180 80 L 10 80 Z" fill="url(#glassGlare)" opacity="0.6" pointerEvents="none" style={{mixBlendMode: 'screen'}} />
            </g>
        );
    };

    // --- 8. COIN TRAY ---
    const renderCoinTray = () => (
        <g transform="translate(5, 380)">
             <path d="M 5 0 Q 115 20 225 0 L 230 20 Q 115 35 0 20 Z" fill={safeIslandId === 5 ? "url(#gold)" : "url(#chrome)"} stroke="#111" strokeWidth="3" filter="url(#pbrNoise)" />
             <path d="M 15 5 Q 115 20 215 5 L 210 15 Q 115 25 20 15 Z" fill="#050505" />
             
             <g transform="translate(180, 5)" opacity="0.4">
                {[...Array(4)].map((_, i) => (
                    <line key={i} x1={i * 8} y1="0" x2={(i * 8) - 5} y2="10" stroke={accent} strokeWidth="2" strokeLinecap="round" />
                ))}
             </g>

             {(displayWins > 0 || isHot) && (
                 <g transform="translate(30, 8)">
                    <ellipse cx="20" cy="5" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    <ellipse cx="22" cy="3" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    <ellipse cx="35" cy="6" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    <ellipse cx="30" cy="2" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    {isHot && <circle cx="35" cy="4" r="12" fill="#FFD700" opacity="0.5" filter="url(#glowLight)" className="animate-[pulse_2s_ease-in-out_infinite]" />}
                 </g>
             )}
        </g>
    );

    return (
        <motion.svg 
            animate={animProfile.physics}
            width="100%" height="100%" 
            viewBox="0 0 240 410" 
            preserveAspectRatio="xMidYMid meet" 
            className={`${mode==='hall' ? 'transition-transform hover:-translate-y-2 cursor-pointer' : ''}`}
            style={{ filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.8))' }}
        >
            {renderDefs()}
            
            {/* Ambient Base Shadow */}
            <ellipse cx="120" cy="405" rx="105" ry="12" fill="#000" opacity="0.95" filter="blur(8px)" />
            
            {renderChassis()}
            {renderTopper()}
            {renderScreenArea()} 
            {renderButtonDeck()}
            {renderTelemetryDashboard()}
            {renderCoinTray()}
            
            {/* Environmental Glass Glare for entire cabinet */}
            <path d="M 15 40 L 225 40 L 230 395 L 10 395 Z" fill="url(#glassGlare)" opacity="0.25" pointerEvents="none" style={{mixBlendMode:'screen'}} />
        </motion.svg>
    );
};

export default memo(CabinetSVG);