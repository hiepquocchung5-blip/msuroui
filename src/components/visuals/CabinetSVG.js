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
    
    // --- STATE MACHINE & ANIMATION PROFILES ---
    const isBusy = visualState === 'BUSY';
    const isHot = visualState === 'JACKPOT_HOT';
    const isBroken = visualState === 'BROKEN';
    
    const animProfile = {
        FREE: { ledSpeed: '3s', physics: { y: 0 } },
        BUSY: { ledSpeed: '0.6s', physics: { y: [-1, 1, -1], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } } },
        JACKPOT_HOT: { ledSpeed: '0.3s', physics: { y: [-2, 0, -2], transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } } },
        BROKEN: { ledSpeed: '0s', physics: { y: 0, opacity: 0.6, filter: 'grayscale(0.8)' } }
    }[visualState] || { ledSpeed: '3s', physics: { y: 0 } };
    
    const safeIslandId = Math.max(1, Math.min(5, parseInt(islandId) || 1));
    
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

    const getAccentColor = () => {
        if (isHot) return '#FFD700';
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

    // --- 1. ADVANCED MATERIALS, SHADERS & THEMATIC PATTERNS ---
    const renderDefs = () => (
        <defs>
            <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#222" /><stop offset="30%" stopColor="#aaa" /><stop offset="50%" stopColor="#fff" /><stop offset="70%" stopColor="#aaa" /><stop offset="100%" stopColor="#222" /></linearGradient>
            <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#5c3a00" /><stop offset="40%" stopColor="#FFD700" /><stop offset="60%" stopColor="#FFFACD" /><stop offset="100%" stopColor="#B8860B" /></linearGradient>
            <linearGradient id="brushMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#111"/><stop offset="50%" stopColor="#333"/><stop offset="100%" stopColor="#111"/></linearGradient>
            
            <filter id="pbrNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="noise" />
                <feColorMatrix type="saturate" values="0"/>
                <feComponentTransfer><feFuncA type="table" tableValues="0 0.05"/></feComponentTransfer>
                <feComposite operator="in" in2="SourceGraphic" result="texture" />
                <feBlend mode="multiply" in="texture" in2="SourceGraphic" />
            </filter>

            <filter id="specular">
                <feSpecularLighting surfaceScale="5" specularConstant="0.8" specularExponent="20" lightingColor="#fff">
                    <fePointLight x="120" y={isHot ? 20 : 80} z="150">
                        {isHot && <animate attributeName="x" values="50;190;50" dur="2s" repeatCount="indefinite" />}
                    </fePointLight>
                </feSpecularLighting>
                <feComposite operator="in" in2="SourceGraphic"/>
                <feBlend mode="screen" in2="SourceGraphic"/>
            </filter>

            <linearGradient id="darkPlast" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#050505"/><stop offset="50%" stopColor="#1a1a1a"/><stop offset="100%" stopColor="#050505"/></linearGradient>
            <linearGradient id="glassGlare" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgba(255,255,255,0.02)" /><stop offset="45%" stopColor="rgba(255,255,255,0.2)" /><stop offset="50%" stopColor="rgba(255,255,255,0)" /><stop offset="100%" stopColor="rgba(255,255,255,0.05)" /></linearGradient>

            {/* Thematic Patterns */}
            <pattern id="pat-1" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
                <path d="M10 0 L20 10 L10 20 L0 10 Z M0 0 L20 20 M20 0 L0 20" fill="none" stroke="rgba(255,215,0,0.05)" strokeWidth="0.5"/>
            </pattern>
            <pattern id="pat-2" width="40" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
                <path d="M0 10 Q10 0 20 10 T40 10" fill="none" stroke="rgba(0,243,255,0.05)" strokeWidth="1"/>
                <path d="M0 15 Q10 5 20 15 T40 15" fill="none" stroke="rgba(0,243,255,0.02)" strokeWidth="1"/>
            </pattern>
            <pattern id="pat-3" width="10" height="10" patternUnits="userSpaceOnUse">
                <rect width="10" height="2" fill="rgba(255,69,0,0.05)"/>
            </pattern>
            <pattern id="pat-4" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M-2 12 L12 -2" stroke="rgba(168,85,247,0.08)" strokeWidth="1"/>
            </pattern>
            <pattern id="pat-5" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M0 0 L8 8 M8 0 L0 8" stroke="rgba(255,215,0,0.08)" strokeWidth="0.5"/>
            </pattern>

            <pattern id="speakerMesh" width="3" height="3" patternUnits="userSpaceOnUse">
                <rect width="3" height="3" fill="#000"/><circle cx="1.5" cy="1.5" r="1" fill="#222" />
            </pattern>

            <linearGradient id="textGrad1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FF0055"/><stop offset="100%" stopColor="#FFD700"/></linearGradient>
            <linearGradient id="textGrad2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#00F3FF"/><stop offset="100%" stopColor="#0066FF"/></linearGradient>
            <linearGradient id="textGrad3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FF4500"/><stop offset="100%" stopColor="#FF0000"/></linearGradient>
            <linearGradient id="textGrad4" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#A855F7"/><stop offset="100%" stopColor="#FF00FF"/></linearGradient>
            <linearGradient id="textGrad5" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FFFACD"/><stop offset="100%" stopColor="#FFD700"/></linearGradient>

            <linearGradient id="ledFlowVert" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="0.1"/>
                <stop offset="50%" stopColor="#FFF" stopOpacity="1"/>
                <stop offset="100%" stopColor={accent} stopOpacity="0.1"/>
            </linearGradient>
            
            <linearGradient id="ledFlowHoriz" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={accent} stopOpacity="0.1"/>
                <stop offset="50%" stopColor="#FFF" stopOpacity="1"/>
                <stop offset="100%" stopColor={accent} stopOpacity="0.1"/>
            </linearGradient>

            <filter id="glowLight"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="hotGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

            <clipPath id="screenClipLocal"><path d="M 2 2 L 188 2 L 178 78 L 12 78 Z" /></clipPath>
        </defs>
    );

    // --- 2. THEMATIC JAPANESE MOTIFS ---
    const renderJapaneseMotifs = () => {
        switch(safeIslandId) {
            case 1: 
                return (
                    <g className="theme-motifs">
                        <path d="M20 70 H220 M20 73 H220" stroke="#FFD700" strokeWidth="1.5" opacity="0.6" />
                        <path d="M110 70 Q105 78 100 70 Q105 62 110 70" stroke="#FFD700" fill="none" strokeWidth="1" />
                        <path d="M 5 35 L 235 35 L 235 40 L 5 40 Z" fill="#8B0000" stroke="#400" strokeWidth="1"/>
                        <path d="M 15 45 L 225 45 L 225 50 L 15 50 Z" fill="#8B0000" stroke="#400" strokeWidth="1"/>
                        {isHot && <text x="30" y="150" fill="#FFD700" fontSize="30" filter="url(#hotGlow)" opacity="0.4" className="animate-pulse font-serif">福</text>}
                        {isHot && <text x="210" y="150" fill="#FFD700" fontSize="30" filter="url(#hotGlow)" opacity="0.4" className="animate-pulse font-serif">運</text>}
                    </g>
                );
            case 2: 
                return (
                    <g className="theme-motifs">
                        <g opacity="0.15" fill="#00f3ff">
                            <path d="M20 180 Q15 160 10 150 Q18 165 20 180" />
                            <path d="M20 180 Q25 160 30 150 Q22 165 20 180" />
                            <path d="M220 180 Q215 160 210 150 Q218 165 220 180" />
                            <path d="M220 180 Q225 160 230 150 Q222 165 220 180" />
                        </g>
                        <path d="M15 90 C20 85, 30 85, 35 90 C40 95, 50 95, 55 90" stroke="#00F3FF" strokeWidth="2" fill="none" opacity="0.4" filter="url(#glowLight)"/>
                        <path d="M220 90 C225 85, 235 85, 240 90 C245 95, 255 95, 260 90" stroke="#00F3FF" strokeWidth="2" fill="none" opacity="0.4" filter="url(#glowLight)"/>
                    </g>
                );
            case 3: 
                return (
                    <g className="theme-motifs">
                        <g transform="translate(16, 68)">
                            {[...Array(8)].map((_, i) => (
                                <g key={i} transform={`translate(${i * 26},0)`}>
                                    <line x1="0" y1="0" x2="0" y2="-6" stroke="#FFD700" strokeWidth="1" opacity="0.5"/>
                                    <circle cx="0" cy="-8" r="2.5" fill="#FF4500" opacity={isHot ? 1 : 0.4} filter={isHot ? "url(#glowLight)" : "none"} className={isHot ? "animate-pulse" : ""} />
                                </g>
                            ))}
                        </g>
                        <rect x="15" y="100" width="8" height="20" fill="#FF0000" opacity="0.4" rx="1"/>
                        <rect x="215" y="120" width="8" height="30" fill="#FFD700" opacity="0.4" rx="1"/>
                        <text x="25" y="180" fill="#FF4500" fontSize="12" opacity="0.1" style={{writingMode: 'vertical-rl'}}>ジャックポット</text>
                        <text x="215" y="180" fill="#FF4500" fontSize="12" opacity="0.1" style={{writingMode: 'vertical-rl'}}>オーソカ</text>
                    </g>
                );
            case 4: 
                return (
                    <g className="theme-motifs">
                        <path d="M10 85 L20 75 L30 85 L40 75 L50 85 L60 75 L70 85 L80 75 L90 85 L100 75 L110 85 L120 75 L130 85 L140 75 L150 85 L160 75 L170 85 L180 75 L190 85 L200 75 L210 85 L220 75 L230 85" stroke="#A855F7" strokeWidth="0.5" fill="none" opacity="0.3"/>
                        <g opacity="0.2" fill="#00F3FF" fontSize="8" fontFamily="monospace">
                            <text x="18" y="120">か</text>
                            <text x="18" y="140">の</text>
                            <text x="215" y="130">じ</text>
                            <text x="215" y="150">ゃ</text>
                        </g>
                    </g>
                );
            case 5: 
                return (
                    <g className="theme-motifs">
                        <path d="M15 75 L225 75 L220 225 L20 225 Z" fill="none" stroke="url(#gold)" strokeWidth="1" opacity="0.5"/>
                        <circle cx="20" cy="80" r="3" fill="none" stroke="#FFD700" strokeWidth="1" />
                        <circle cx="220" cy="80" r="3" fill="none" stroke="#FFD700" strokeWidth="1" />
                        <text x="120" y="375" textAnchor="middle" fill="#FFD700" fontSize="8" opacity="0.15" letterSpacing="4">賭金セーフ</text>
                    </g>
                );
            default: return null;
        }
    };

    // --- 3. CHASSIS GEOMETRY ---
    const renderChassis = () => {
        let path, fill, stroke;
        switch(safeIslandId) {
            case 1: fill="#3a0000"; stroke="url(#gold)"; path = "M10,35 Q120,15 230,35 L235,395 L5,395 Z"; break;
            case 2: fill="#001a33"; stroke="#00f3ff"; path = "M10,30 H50 V45 H190 V30 H230 V395 H10 Z"; break;
            case 3: fill="#111"; stroke="#F00"; path = "M10,50 L40,30 L80,50 L120,30 L160,50 L200,30 L230,50 L235,395 L5,395 Z"; break;
            case 4: fill="#1A0033"; stroke="#A855F7"; path = "M15,40 L35,20 L205,20 L225,40 L225,395 L15,395 Z"; break;
            case 5: fill="#332000"; stroke="url(#gold)"; path = "M20,60 L120,20 L220,60 L225,395 L15,395 Z"; break;
            default: fill="#3a0000"; stroke="url(#gold)"; path = "M10,35 Q120,15 230,35 L235,395 L5,395 Z"; break;
        }

        return (
            <g>
                <path d={path} fill={fill} stroke={stroke} strokeWidth="3" filter="url(#pbrNoise)" />
                <path d={path} fill={`url(#pat-${safeIslandId})`} opacity="1" style={{mixBlendMode: 'screen'}} pointerEvents="none" />
                
                <g transform="translate(15, 305)" opacity="0.4">
                    <rect width="18" height="8" fill={accent} rx="1" />
                    <text x="9" y="6" textAnchor="middle" fill="#000" fontSize="4" fontFamily="monospace" fontWeight="bold">G-0{displayNum.toString().slice(-1)}</text>
                </g>

                <g transform="translate(0, 50)">
                    <path d="M 5 0 L 25 10 L 25 80 L 5 70 Z" fill="url(#speakerMesh)" stroke="#222" strokeWidth="2"/>
                    <path d="M 235 0 L 215 10 L 215 80 L 235 70 Z" fill="url(#speakerMesh)" stroke="#222" strokeWidth="2"/>
                    <circle cx="15" cy="40" r="6" fill="#111" stroke={accent} strokeWidth="1" filter="url(#glowLight)" className={isHot ? 'animate-pulse' : ''} />
                    <circle cx="225" cy="40" r="6" fill="#111" stroke={accent} strokeWidth="1" filter="url(#glowLight)" className={isHot ? 'animate-pulse' : ''} />
                </g>

                <g opacity={isBroken ? 0 : (isBusy || isHot ? 1 : 0.4)}>
                    <rect x="18" y="140" width="6" height="180" rx="3" fill="#111" stroke="#333" />
                    <rect x="216" y="140" width="6" height="180" rx="3" fill="#111" stroke="#333" />

                    {safeIslandId === 4 ? (
                        <g>
                            <rect x="20" y="145" width="2" height="170" fill="url(#ledFlowHoriz)" filter="url(#glowLight)">
                                {!isBroken && <animateTransform attributeName="transform" type="translate" values="-20 0; 20 0" dur={animProfile.ledSpeed} repeatCount="indefinite"/>}
                            </rect>
                            <rect x="218" y="145" width="2" height="170" fill="url(#ledFlowHoriz)" filter="url(#glowLight)">
                                {!isBroken && <animateTransform attributeName="transform" type="translate" values="-20 0; 20 0" dur={animProfile.ledSpeed} repeatCount="indefinite"/>}
                            </rect>
                        </g>
                    ) : safeIslandId === 2 ? (
                        <g>
                            <path d="M21 145 Q19 230 21 315" stroke="url(#ledFlowVert)" strokeWidth="2" fill="none" strokeDasharray="10 5" filter="url(#glowLight)">
                                {!isBroken && <animate attributeName="stroke-dashoffset" values="15; 0" dur={animProfile.ledSpeed} repeatCount="indefinite"/>}
                            </path>
                            <path d="M219 145 Q221 230 219 315" stroke="url(#ledFlowVert)" strokeWidth="2" fill="none" strokeDasharray="10 5" filter="url(#glowLight)">
                                {!isBroken && <animate attributeName="stroke-dashoffset" values="15; 0" dur={animProfile.ledSpeed} repeatCount="indefinite"/>}
                            </path>
                        </g>
                    ) : (
                        <g>
                            <rect x="20" y="145" width="2" height="170" fill="url(#ledFlowVert)" filter="url(#glowLight)">
                                {!isBroken && <animateTransform attributeName="transform" type="translate" values="0 -170; 0 170" dur={animProfile.ledSpeed} repeatCount="indefinite"/>}
                            </rect>
                            <rect x="218" y="145" width="2" height="170" fill="url(#ledFlowVert)" filter="url(#glowLight)">
                                {!isBroken && <animateTransform attributeName="transform" type="translate" values="0 -170; 0 170" dur={animProfile.ledSpeed} repeatCount="indefinite"/>}
                            </rect>
                        </g>
                    )}
                </g>

                {renderJapaneseMotifs()}
            </g>
        );
    };

    // --- 4. MASSIVE GRAND JACKPOT TOPPER & BONUS INDICATOR ---
    const renderTopper = () => {
        const ledThemes = {
            1: { bg: '#3a0000', glow: '#ff0000', border: '#FFD700' }, 
            2: { bg: '#001a33', glow: '#0066ff', border: '#00f3ff' }, 
            3: { bg: '#331100', glow: '#ff0000', border: '#ff4500' }, 
            4: { bg: '#1a0033', glow: '#a855f7', border: '#a855f7' }, 
            5: { bg: '#2a1a00', glow: '#eab308', border: '#eab308' }, 
        };
        const led = ledThemes[safeIslandId];

        return (
            <g transform="translate(60, -5)">
                <path d="M -5 5 L 125 5 L 120 40 L 0 40 Z" fill="#050505" stroke="url(#chrome)" strokeWidth="2" filter="url(#specular)" />
                <path d="M 2 10 L 118 10 L 114 36 L 6 36 Z" fill={led.bg} stroke={led.border} strokeWidth="1" />
                <path d="M 2 10 L 118 10 L 114 36 L 6 36 Z" fill="url(#glassGlare)" opacity="0.5" pointerEvents="none" />

                <g transform="translate(60, 20)" className={isHot ? "animate-pulse" : ""}>
                    <text x="0" y="-2" textAnchor="middle" fill={`url(#textGrad${safeIslandId})`} fontSize="9" fontWeight="800" fontStyle="italic" letterSpacing="3" style={{ filter: `drop-shadow(0 0 5px ${led.glow})` }}>
                        GRAND JACKPOT
                    </text>
                    <text x="0" y="12" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="monospace" style={{ fontWeight: 720, filter: `drop-shadow(0 0 8px #fff)`, letterSpacing: "1px" }}>
                        {currentJackpot > 0 ? Number(currentJackpot).toLocaleString() : 'PULLING...'}
                    </text>
                </g>

                {/* Pachislo Bonus UI Element */}
                <g transform="translate(130, 10)" opacity={isHot ? "1" : "0.2"}>
                    <text x="0" y="0" fill={isHot ? "#FFD700" : "#555"} fontSize="6" fontWeight="bold" filter={isHot ? "url(#glowLight)" : ""}>ボーナス</text>
                    <rect x="0" y="4" width="30" height="3" fill="#111" stroke={isHot ? "#FFD700" : "#333"} />
                    {isHot && <rect x="0" y="4" width="30" height="3" fill="#FFD700" className="animate-pulse" />}
                </g>

                <g transform="translate(100, -10)">
                    <path d="M 0 0 L 10 0 L 12 12 L -2 12 Z" fill={isBroken ? '#F00' : '#300'} filter={isBroken ? 'url(#glowLight)' : ''} className={isBroken ? "animate-pulse" : ""} />
                    <path d="M 12 0 L 22 0 L 24 12 L 10 12 Z" fill={isHot ? '#FFD700' : '#330'} filter={isHot ? 'url(#hotGlow)' : ''} className={isHot ? 'animate-pulse' : ''} />
                </g>
            </g>
        );
    };

    // --- 5. REALISTIC SCREEN BEZEL & REEL CAGE ---
    const renderScreenArea = () => {
        return (
            <g transform="translate(0, 80)">
                <path d="M 30 0 H 210 L 205 130 H 35 Z" fill="url(#darkPlast)" stroke={safeIslandId === 5 ? "url(#gold)" : "url(#chrome)"} strokeWidth="3" filter="url(#pbrNoise)" />
                <path d="M 35 5 H 205 L 200 125 H 40 Z" fill="#020202" />
                
                {/* Physical Reel Cage Dividers */}
                {mode === 'game' && (
                    <g opacity="0.8">
                        <rect x="94" y="10" width="3" height="110" fill="url(#chrome)" stroke="#000" strokeWidth="0.5" />
                        <rect x="144" y="10" width="3" height="110" fill="url(#chrome)" stroke="#000" strokeWidth="0.5" />
                    </g>
                )}

                <path d="M 35 5 H 205 L 195 20 H 45 Z" fill="#111" opacity="0.8" />
                <path d="M 35 5 L 45 20 V 110 L 40 125 Z" fill="#111" opacity="0.5" />
                
                <g transform="translate(160, 9)">
                    <rect width="35" height="10" fill="#000" opacity="0.8" rx="2" stroke={accent} strokeWidth="0.5" />
                    <text x="17.5" y="7.5" textAnchor="middle" fill={accent} fontSize="5" fontFamily="monospace" fontWeight="bold">
                        SYS: 0{safeIslandId}
                    </text>
                </g>
                
                <path d="M 35 5 H 205 L 200 125 H 40 Z" fill="url(#glassGlare)" opacity="0.4" pointerEvents="none" />
            </g>
        );
    };

    // --- 6. CONTROL DECK (WITH JAPANESE DECALS) ---
    const renderButtonDeck = () => (
        <g transform="translate(10, 220)">
             <path d="M 0 0 L 220 0 L 235 60 L -15 60 Z" fill={safeIslandId === 5 ? "url(#brushMetal)" : "url(#darkPlast)"} stroke="#444" strokeWidth="2" filter="url(#pbrNoise)" />
             <path d="M -15 60 L 235 60 L 230 75 L -10 75 Z" fill="#0a0a0a" stroke="#222" />
             
             {/* Japanese Etched Panel Decals */}
             {mode === 'game' && (
                 <g opacity="0.5">
                     <text x="30" y="12" fill="#fff" fontSize="5" fontWeight="bold">ベット</text>
                     <text x="210" y="12" fill="#fff" fontSize="5" fontWeight="bold" textAnchor="end">スピン</text>
                     <text x="120" y="68" fill="#fff" fontSize="4" fontWeight="bold" textAnchor="middle" letterSpacing="4">ストップ</text>
                 </g>
             )}

             <g transform="translate(195, 10)">
                 <rect x="0" y="0" width="16" height="30" rx="3" fill="#111" stroke="url(#chrome)" strokeWidth="1.5" />
                 <rect x="6" y="5" width="4" height="20" rx="2" fill="#000" />
                 <polygon points="8,35 4,40 12,40" fill="#0F0" filter="url(#glowLight)" className={isBusy ? 'opacity-50' : 'animate-[pulse_2s_ease-in-out_infinite]'} />
             </g>

             <g transform="translate(5, 15)">
                 <rect x="0" y="0" width="24" height="16" rx="4" fill="#333" stroke="#111" strokeWidth="2" />
                 <rect x="2" y="2" width="20" height="12" rx="2" fill="#800" />
                 <text x="12" y="10" textAnchor="middle" fill="#FFF" fontSize="4" fontWeight="bold">MAX BET</text>
             </g>

             <g transform="translate(17, 45)">
                 <circle cx="0" cy="0" r="14" fill="#111" stroke="#333" />
                 <circle cx="0" cy="0" r="10" fill="url(#chrome)" />
                 <circle cx="0" cy="-6" r="10" fill={isBusy ? "#00F3FF" : "red"} filter="url(#glowLight)" className={!isBusy ? "animate-[pulse_1s_ease-in-out_infinite]" : ""} />
             </g>

             {mode !== 'game' && (
                 <g transform="translate(60, 20)">
                     <circle cx="15" cy="20" r="18" fill="#111" stroke="url(#chrome)" strokeWidth="2" />
                     <circle cx="15" cy="20" r="14" fill="#500" />
                     <circle cx="55" cy="20" r="18" fill="#111" stroke="url(#chrome)" strokeWidth="2" />
                     <circle cx="55" cy="20" r="14" fill="#500" />
                     <circle cx="95" cy="20" r="18" fill="#111" stroke="url(#chrome)" strokeWidth="2" />
                     <circle cx="95" cy="20" r="14" fill="#500" />
                 </g>
             )}
        </g>
    );

    // --- 7. DEDICATED TELEMETRY DASHBOARD (Belly Glass) ---
    const renderTelemetryDashboard = () => {
        let screenBg = '#0a0a14';
        if (isHot) screenBg = '#330000';
        else if (isBroken) screenBg = '#050505'; 
        else if (isBusy) screenBg = '#001a1a';

        return (
            <g transform="translate(25, 295)">
                 {/* Bezel */}
                 <path d="M 0 0 L 190 0 L 180 80 L 10 80 Z" fill="#050505" stroke="url(#chrome)" strokeWidth="3" filter="url(#pbrNoise)" />
                 
                 <g clipPath="url(#screenClipLocal)">
                     <rect x="0" y="0" width="190" height="80" fill={screenBg} className="transition-all duration-1000" />
                     <rect x="0" y="0" width="190" height="80" fill={`url(#pat-${safeIslandId})`} opacity="0.3" />

                     {/* Circuit Chaos Background Waveform (Zero Latency) */}
                     {!isBroken && (
                         <g opacity="0.4">
                             <polyline points={bellySparklinePoints} fill="none" stroke={accent} strokeWidth="1.5" filter="url(#glowLight)" className="transition-all duration-300" />
                         </g>
                     )}

                     {/* Central Branding & Narrative Island Name */}
                     {isBroken ? (
                         <g opacity="0.9">
                             <text x="95" y="45" textAnchor="middle" fill="#F00" fontSize="14" fontWeight="900" fontStyle="italic" letterSpacing="2">SYSTEM OFFLINE</text>
                         </g>
                     ) : (
                         <>
                             <g transform="translate(95, 45)">
                                 <text x="0" y="-12" textAnchor="middle" fill={accent} fontSize="5" fontWeight="bold" opacity="0.6" letterSpacing="2">
                                     {currentTheme.title}
                                 </text>
                                 <text x="0" y="0" textAnchor="middle" fill={`url(#textGrad${safeIslandId})`} fontSize="16" style={{ filter: `drop-shadow(0 0 5px ${accent})` }}>
                                     {currentTheme.name}
                                 </text>
                                 <text x="0" y="16" textAnchor="middle" fill="#FFF" fontSize="8" opacity="0.3" letterSpacing="4">
                                     {currentTheme.kanji}
                                 </text>
                             </g>
                         </>
                     )}

                     {/* Top Right: Win Counter */}
                     <g transform="translate(145, 5)">
                         <rect width="40" height="12" fill="rgba(0,0,0,0.8)" rx="2" stroke={accent} strokeWidth="0.5" />
                         <text x="20" y="8.5" textAnchor="middle" fill="#FFF" fontSize="6" fontFamily="monospace" fontWeight="900" style={{ filter: `drop-shadow(0 0 2px #fff)` }}>
                             W: {(displayWins / 1000).toFixed(1)}k
                         </text>
                     </g>

                     {/* Bottom Left: Volatility Readout */}
                     <g transform="translate(5, 63)">
                         <rect width="45" height="12" fill="rgba(0,0,0,0.8)" rx="2" stroke={accent} strokeWidth="0.5" />
                         <text x="22.5" y="8.5" textAnchor="middle" fill={accent} fontSize="5" fontFamily="monospace" fontWeight="bold">
                             VOL: {visualState}
                         </text>
                     </g>

                     {/* Bottom Right: Laps Odometer */}
                     <g transform="translate(140, 63)">
                         <rect width="45" height="12" fill="rgba(0,0,0,0.8)" rx="2" stroke={accent} strokeWidth="0.5" />
                         <text x="20.5" y="8.5" textAnchor="middle" fill="#FFF" fontSize="6" fontFamily="monospace" fontWeight="900" style={{ filter: `drop-shadow(0 0 2px #fff)` }}>
                             LAPS: {displayLaps.toString().padStart(4, '0')}
                         </text>
                     </g>
                 </g>
                 
                 <path d="M 0 0 L 190 0 L 180 80 L 10 80 Z" fill="url(#glassGlare)" opacity="0.6" pointerEvents="none" style={{mixBlendMode: 'screen'}} />
            </g>
        );
    };

    // --- 8. COIN TRAY ---
    const renderCoinTray = () => (
        <g transform="translate(5, 380)">
             <path d="M 5 0 Q 115 20 225 0 L 230 20 Q 115 35 0 20 Z" fill={safeIslandId === 5 ? "url(#gold)" : "url(#chrome)"} stroke="#222" strokeWidth="2" filter="url(#pbrNoise)" />
             <path d="M 15 5 Q 115 20 215 5 L 210 15 Q 115 25 20 15 Z" fill="#0a0a0a" />
             
             <g transform="translate(180, 5)" opacity="0.4">
                {[...Array(4)].map((_, i) => (
                    <rect key={i} x={i * 8} y="0" width="4" height="10" fill={accent} transform="skewX(-20)" />
                ))}
             </g>

             {(displayWins > 0 || isHot) && (
                 <g transform="translate(30, 8)">
                    <ellipse cx="20" cy="5" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    <ellipse cx="22" cy="3" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    <ellipse cx="35" cy="6" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    <ellipse cx="30" cy="2" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    <ellipse cx="50" cy="5" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    <ellipse cx="45" cy="1" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    {isHot && <circle cx="35" cy="4" r="15" fill="#FFD700" opacity="0.3" filter="url(#glowLight)" className="animate-[pulse_1s_ease-in-out_infinite]" />}
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
            className={`drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] ${mode==='hall' ? 'transition-transform hover:-translate-y-2 cursor-pointer' : ''}`}
        >
            {renderDefs()}
            <ellipse cx="120" cy="405" rx="110" ry="12" fill="#000" opacity="0.8" filter="blur(5px)" />
            
            {renderChassis()}
            {renderTopper()}
            {renderScreenArea()} 
            {renderButtonDeck()}
            {renderTelemetryDashboard()}
            {renderCoinTray()}
            
            <path d="M 15 40 L 225 40 L 230 395 L 10 395 Z" fill="url(#glassGlare)" opacity="0.2" pointerEvents="none" style={{mixBlendMode:'screen'}} />
        </motion.svg>
    );
};

export default memo(CabinetSVG);