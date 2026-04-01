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
    
    // --- STATE MACHINE & ANIMATION PROFILES (GLITCH REMOVED) ---
    const isBusy = visualState === 'BUSY';
    const isHot = visualState === 'JACKPOT_HOT';
    const isBroken = visualState === 'BROKEN';
    
    // Smooth, deliberate physics. No more jitter or shake.
    const animProfile = {
        FREE: { ledSpeed: '3s', physics: { y: 0 } },
        BUSY: { ledSpeed: '1s', physics: { y: [-1, 1, -1], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } } },
        JACKPOT_HOT: { ledSpeed: '0.3s', physics: { y: [-2, 0, -2], transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } } },
        BROKEN: { ledSpeed: '0s', physics: { y: 0, opacity: 0.6, filter: 'grayscale(0.5)' } }
    }[visualState] || { ledSpeed: '3s', physics: { y: 0 } };
    
    // STRICT V3 Enforcer
    const safeIslandId = Math.max(1, Math.min(5, parseInt(islandId) || 1));
    
    const displayLaps = machine?.total_laps || stats.laps || 0;
    const displayWins = machine?.total_payout || stats.wins || 0;
    const displayNum = machine?.machine_number || machineNumber || 0;
    const displaySerial = machine?.serial_number || serialNumber || `SRO-${safeIslandId}-${displayNum.toString().padStart(3,'0')}`;

    // --- CUSTOM UNICODE TYPOGRAPHY ---
    const getIslandName = () => {
        switch(safeIslandId) {
            case 1: return '𝓚𝔂𝓸𝓽𝓸 𝓩𝓮𝓷';
            case 2: return '𝙾𝚔𝚒𝚗𝚊𝚠𝚊 𝚃𝚛𝚘𝚙𝚒𝚌';
            case 3: return 'ＯＳＡＫＡ ＮＥＯＮ';
            case 4: return '𝕿𝖔𝖐𝖞𝖔 𝕮𝖞𝖇𝖊𝖗';
            case 5: return '𝐆𝐢𝐧𝐳𝐚 𝐆𝐨𝐥𝐝';
            default: return 'UNKNOWN SECTOR';
        }
    };

    // Smooth Sparkline Data (0 Latency)
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

    // --- 1. ADVANCED MATERIALS, SHADERS & TEXTURES ---
    const renderDefs = () => (
        <defs>
            {/* Base Materials */}
            <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#222" /><stop offset="30%" stopColor="#aaa" /><stop offset="50%" stopColor="#fff" /><stop offset="70%" stopColor="#aaa" /><stop offset="100%" stopColor="#222" /></linearGradient>
            <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#5c3a00" /><stop offset="40%" stopColor="#FFD700" /><stop offset="60%" stopColor="#FFFACD" /><stop offset="100%" stopColor="#B8860B" /></linearGradient>
            
            <filter id="pbrNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.1 0" />
                <feComposite operator="in" in2="SourceGraphic" result="texture" />
                <feBlend mode="multiply" in="texture" in2="SourceGraphic" />
            </filter>

            <linearGradient id="darkPlast" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#050505"/><stop offset="50%" stopColor="#1a1a1a"/><stop offset="100%" stopColor="#050505"/></linearGradient>
            <linearGradient id="glassGlare" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgba(255,255,255,0.02)" /><stop offset="45%" stopColor="rgba(255,255,255,0.2)" /><stop offset="50%" stopColor="rgba(255,255,255,0)" /><stop offset="100%" stopColor="rgba(255,255,255,0.05)" /></linearGradient>

            {/* Traditional Japanese Wagara Pattern (Seigaiha / overlapping circles) replacing Cyber Matrix */}
            <pattern id="wagara" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(0.6)">
                <circle cx="10" cy="10" r="10" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                <circle cx="0" cy="0" r="10" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                <circle cx="20" cy="0" r="10" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                <circle cx="0" cy="20" r="10" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                <circle cx="20" cy="20" r="10" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
            </pattern>
            
            <pattern id="speakerMesh" width="3" height="3" patternUnits="userSpaceOnUse">
                <rect width="3" height="3" fill="#000"/><circle cx="1.5" cy="1.5" r="1" fill="#222" />
            </pattern>

            {/* Typography Gradients for the specific Unicode Island Fonts */}
            <linearGradient id="textGrad1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FF0055"/><stop offset="100%" stopColor="#FFD700"/></linearGradient>
            <linearGradient id="textGrad2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#00F3FF"/><stop offset="100%" stopColor="#0066FF"/></linearGradient>
            <linearGradient id="textGrad3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FF4500"/><stop offset="100%" stopColor="#FF0000"/></linearGradient>
            <linearGradient id="textGrad4" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#A855F7"/><stop offset="100%" stopColor="#FF00FF"/></linearGradient>
            <linearGradient id="textGrad5" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FFFACD"/><stop offset="100%" stopColor="#FFD700"/></linearGradient>

            <linearGradient id="ledFlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="0.2"/>
                <stop offset="50%" stopColor="#FFF" stopOpacity="1"/>
                <stop offset="100%" stopColor={accent} stopOpacity="0.2"/>
            </linearGradient>

            <linearGradient id="skin1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#300"/><stop offset="50%" stopColor="#800"/><stop offset="100%" stopColor="#300"/></linearGradient>
            <linearGradient id="skin2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#1a0033"/><stop offset="50%" stopColor="#001a33"/><stop offset="100%" stopColor="#1a0033"/></linearGradient>
            <linearGradient id="skin3" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#111"/><stop offset="50%" stopColor="#400"/><stop offset="100%" stopColor="#820"/></linearGradient>
            <linearGradient id="skin4" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#1A0033"/><stop offset="50%" stopColor="#4B0082"/><stop offset="100%" stopColor="#1A0033"/></linearGradient>
            <linearGradient id="skin5" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#332000"/><stop offset="50%" stopColor="#805500"/><stop offset="100%" stopColor="#332000"/></linearGradient>

            <filter id="glowLight"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="hotGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

            <clipPath id="screenClipLocal"><path d="M 2 2 L 188 2 L 178 78 L 12 78 Z" /></clipPath>
        </defs>
    );

    // --- 2. THEMATIC MOTIFS ---
    const renderJapaneseMotifs = () => {
        switch(safeIslandId) {
            case 1: 
                return (
                    <g className="theme-motifs">
                        <path d="M 5 35 L 235 35 L 235 40 L 5 40 Z" fill="#8B0000" stroke="#400" strokeWidth="1"/>
                        <path d="M 15 45 L 225 45 L 225 50 L 15 50 Z" fill="#8B0000" stroke="#400" strokeWidth="1"/>
                        {isHot && <text x="30" y="150" fill="#FFD700" fontSize="30" filter="url(#hotGlow)" opacity="0.4" className="animate-pulse font-serif">福</text>}
                        {isHot && <text x="210" y="150" fill="#FFD700" fontSize="30" filter="url(#hotGlow)" opacity="0.4" className="animate-pulse font-serif">運</text>}
                    </g>
                );
            case 2: 
                return (
                    <g className="theme-motifs">
                        <rect x="15" y="60" width="10" height="280" fill="url(#wagara)" opacity="0.8" />
                        <rect x="215" y="60" width="10" height="280" fill="url(#wagara)" opacity="0.8" />
                        <path d="M 20 100 L 30 110 L 30 150 M 220 100 L 210 110 L 210 150" fill="none" stroke="#00f3ff" strokeWidth="2" opacity="0.5" filter="url(#glowLight)"/>
                    </g>
                );
            case 3: 
                return (
                    <g className="theme-motifs">
                        <path d="M 15 100 L 25 110 M 15 110 L 25 100 M 15 120 L 25 130 M 15 130 L 25 120" stroke="#FFD700" strokeWidth="2" opacity="0.7" />
                        <path d="M 215 100 L 225 110 M 215 110 L 225 100 M 215 120 L 225 130 M 215 130 L 225 120" stroke="#FFD700" strokeWidth="2" opacity="0.7" />
                        <circle cx="20" cy="80" r="6" fill="#111" stroke="#FFD700" strokeWidth="1.5" />
                        <circle cx="220" cy="80" r="6" fill="#111" stroke="#FFD700" strokeWidth="1.5" />
                    </g>
                );
            case 4: 
                return (
                    <g className="theme-motifs">
                        <path d="M 15 100 L 30 85 L 30 140 M 225 100 L 210 85 L 210 140" fill="none" stroke="#A855F7" strokeWidth="2" opacity="0.6" filter="url(#glowLight)"/>
                        <circle cx="22" cy="115" r="3" fill="#A855F7" filter="url(#glowLight)"/>
                        <circle cx="218" cy="115" r="3" fill="#A855F7" filter="url(#glowLight)"/>
                    </g>
                );
            case 5: 
                return (
                    <g className="theme-motifs">
                        <path d="M 20 80 L 30 70 L 40 80 L 30 90 Z" fill="none" stroke="url(#gold)" strokeWidth="2" opacity="0.8"/>
                        <path d="M 200 80 L 210 70 L 220 80 L 210 90 Z" fill="none" stroke="url(#gold)" strokeWidth="2" opacity="0.8"/>
                        <path d="M 20 100 L 30 90 L 40 100 L 30 110 Z" fill="url(#gold)" opacity="0.4"/>
                        <path d="M 200 100 L 210 90 L 220 100 L 210 110 Z" fill="url(#gold)" opacity="0.4"/>
                    </g>
                );
            default: return null;
        }
    };

    // --- 3. CHASSIS GEOMETRY ---
    const renderChassis = () => {
        let path, fill, stroke;

        switch(safeIslandId) {
            case 1: fill="url(#skin1)"; stroke="url(#gold)"; path = "M10,35 Q120,15 230,35 L235,395 L5,395 Z"; break;
            case 2: fill="url(#skin2)"; stroke="#00f3ff"; path = "M10,30 H50 V45 H190 V30 H230 V395 H10 Z"; break;
            case 3: fill="url(#skin3)"; stroke="#F00"; path = "M10,50 L40,30 L80,50 L120,30 L160,50 L200,30 L230,50 L235,395 L5,395 Z"; break;
            case 4: fill="url(#skin4)"; stroke="#A855F7"; path = "M15,40 L35,20 L205,20 L225,40 L225,395 L15,395 Z"; break;
            case 5: fill="url(#skin5)"; stroke="url(#gold)"; path = "M20,60 L120,20 L220,60 L225,395 L15,395 Z"; break;
            default: fill="url(#skin1)"; stroke="url(#gold)"; path = "M10,35 Q120,15 230,35 L235,395 L5,395 Z"; break;
        }

        return (
            <g>
                <path d={path} fill={fill} stroke={stroke} strokeWidth="3" filter="url(#pbrNoise)" />
                
                <g transform="translate(0, 50)">
                    <path d="M 5 0 L 25 10 L 25 80 L 5 70 Z" fill="url(#speakerMesh)" stroke="#222" strokeWidth="2"/>
                    <path d="M 235 0 L 215 10 L 215 80 L 235 70 Z" fill="url(#speakerMesh)" stroke="#222" strokeWidth="2"/>
                    <circle cx="15" cy="40" r="6" fill="#111" stroke={accent} strokeWidth="1" filter="url(#glowLight)" className={isHot ? 'animate-pulse' : ''} />
                    <circle cx="225" cy="40" r="6" fill="#111" stroke={accent} strokeWidth="1" filter="url(#glowLight)" className={isHot ? 'animate-pulse' : ''} />
                </g>

                <g opacity={isBroken ? 0 : (isBusy || isHot ? 1 : 0.4)}>
                    <rect x="18" y="140" width="6" height="180" rx="3" fill="#111" stroke="#333" />
                    <rect x="20" y="145" width="2" height="170" fill={isBroken ? '#333' : 'url(#ledFlow)'} filter="url(#glowLight)">
                        {!isBroken && <animateTransform attributeName="transform" type="translate" values="0 -170; 0 170" dur={animProfile.ledSpeed} repeatCount="indefinite"/>}
                    </rect>
                    
                    <rect x="216" y="140" width="6" height="180" rx="3" fill="#111" stroke="#333" />
                    <rect x="218" y="145" width="2" height="170" fill={isBroken ? '#333' : 'url(#ledFlow)'} filter="url(#glowLight)">
                        {!isBroken && <animateTransform attributeName="transform" type="translate" values="0 -170; 0 170" dur={animProfile.ledSpeed} repeatCount="indefinite"/>}
                    </rect>
                </g>

                {renderJapaneseMotifs()}
            </g>
        );
    };

    // --- 4. MASSIVE GRAND JACKPOT TOPPER ---
    const renderTopper = () => {
        const ledThemes = {
            1: { bg: '#3a0000', text: '#FFD700', glow: '#ff0000', border: '#FFD700' }, 
            2: { bg: '#001a33', text: '#00f3ff', glow: '#0066ff', border: '#00f3ff' }, 
            3: { bg: '#331100', text: '#ff4500', glow: '#ff0000', border: '#ff4500' }, 
            4: { bg: '#1a0033', text: '#d8b4fe', glow: '#a855f7', border: '#a855f7' }, 
            5: { bg: '#2a1a00', text: '#fef08a', glow: '#eab308', border: '#eab308' }, 
        };
        const led = ledThemes[safeIslandId];

        return (
            <g transform="translate(60, -5)">
                <path d="M -5 5 L 125 5 L 120 40 L 0 40 Z" fill="#050505" stroke="url(#chrome)" strokeWidth="2" />
                
                <path d="M 2 10 L 118 10 L 114 36 L 6 36 Z" fill={led.bg} stroke={led.border} strokeWidth="1" />
                <path d="M 2 10 L 118 10 L 114 36 L 6 36 Z" fill="url(#wagara)" opacity="0.4" pointerEvents="none" />
                <path d="M 2 10 L 118 10 L 114 36 L 6 36 Z" fill="url(#glassGlare)" opacity="0.5" pointerEvents="none" />

                <g transform="translate(60, 20)" className={isHot ? "animate-pulse" : ""}>
                    {/* Updated font weight to 800 per request */}
                    <text x="0" y="-2" textAnchor="middle" fill={led.text} fontSize="9" fontWeight="800" fontStyle="italic" letterSpacing="3" style={{ filter: `drop-shadow(0 0 5px ${led.glow})` }}>
                        GRAND JACKPOT
                    </text>
                    {/* Updated font weight to 720 and size to 10 per request */}
                    <text x="0" y="12" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="monospace" style={{ fontWeight: 720, filter: `drop-shadow(0 0 8px ${led.text})`, letterSpacing: "1px" }}>
                        {currentJackpot > 0 ? Number(currentJackpot).toLocaleString() : 'PULLING...'}
                    </text>
                </g>

                <g transform="translate(100, -10)">
                    <path d="M 0 0 L 10 0 L 12 12 L -2 12 Z" fill={isBroken ? '#F00' : '#300'} filter={isBroken ? 'url(#glowLight)' : ''} className={isBroken ? "animate-pulse" : ""} />
                    <path d="M 12 0 L 22 0 L 24 12 L 10 12 Z" fill={isHot ? '#FFD700' : '#330'} filter={isHot ? 'url(#hotGlow)' : ''} className={isHot ? 'animate-pulse' : ''} />
                </g>
            </g>
        );
    };

    // --- 5. REALISTIC SCREEN BEZEL ---
    const renderScreenArea = () => {
        return (
            <g transform="translate(0, 80)">
                <path d="M 30 0 H 210 L 205 130 H 35 Z" fill="url(#darkPlast)" stroke="url(#chrome)" strokeWidth="3" filter="url(#pbrNoise)" />
                <path d="M 35 5 H 205 L 200 125 H 40 Z" fill="#000" />
                <path d="M 35 5 H 205 L 195 20 H 45 Z" fill="#111" opacity="0.8" />
                <path d="M 35 5 L 45 20 V 110 L 40 125 Z" fill="#111" opacity="0.5" />
                
                <g transform="translate(160, 9)">
                    <rect width="35" height="10" fill="#000" opacity="0.8" rx="2" stroke={accent} strokeWidth="0.5" />
                    <text x="17.5" y="7.5" textAnchor="middle" fill={accent} fontSize="5" fontFamily="monospace" fontWeight="bold">
                        SYS: 0{safeIslandId}
                    </text>
                </g>
                
                {isHot && mode !== 'game' && (
                    <g opacity="0.8" className="animate-[pulse_1s_ease-in-out_infinite]">
                        <text x="120" y="75" textAnchor="middle" fill="#FF0000" fontSize="32" fontWeight="900" fontStyle="italic" stroke="#FFF" strokeWidth="2" filter="url(#hotGlow)">激熱</text>
                    </g>
                )}
                
                {/* Clean, dark realistic resting state when not playing */}
            </g>
        );
    };

    // --- 6. CONTROL DECK ---
    const renderButtonDeck = () => (
        <g transform="translate(10, 220)">
             <path d="M 0 0 L 220 0 L 235 60 L -15 60 Z" fill="url(#darkPlast)" stroke="#444" strokeWidth="2" filter="url(#pbrNoise)" />
             <path d="M -15 60 L 235 60 L 230 75 L -10 75 Z" fill="#0a0a0a" stroke="#222" />
             
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

    // --- 7. AAA RENDER LAYERED LCD SCREEN ---
    const renderTelemetryDashboard = () => {
        let screenBg = '#0a0a14';
        if (isHot) screenBg = '#330000';
        else if (isBroken) screenBg = '#1a0505'; 
        else if (isBusy) screenBg = '#001a1a';

        return (
            <g transform="translate(25, 295)">
                 {/* Bezel */}
                 <path d="M 0 0 L 190 0 L 180 80 L 10 80 Z" fill="#050505" stroke="url(#chrome)" strokeWidth="3" filter="url(#pbrNoise)" />
                 
                 <g clipPath="url(#screenClipLocal)">
                     <rect x="0" y="0" width="190" height="80" fill={screenBg} className="transition-all duration-1000" />
                     <rect x="0" y="0" width="190" height="80" fill="url(#wagara)" opacity="0.5" />

                     {/* Circuit Chaos Background Waveform (Zero Latency) */}
                     {!isBroken && (
                         <g opacity="0.4">
                             <polyline points={bellySparklinePoints} fill="none" stroke={accent} strokeWidth="1.5" filter="url(#glowLight)" className="transition-all duration-300" />
                         </g>
                     )}

                     {/* Central Branding & Unicode Island Name */}
                     {isBroken ? (
                         <g opacity="0.9">
                             <text x="95" y="45" textAnchor="middle" fill="#F00" fontSize="14" fontWeight="900" fontStyle="italic" letterSpacing="2">SYSTEM OFFLINE</text>
                         </g>
                     ) : (
                         <>
                             <g transform="translate(95, 45)">
                                 <text x="0" y="0" textAnchor="middle" fill={`url(#textGrad${safeIslandId})`} fontSize="18" style={{ filter: `drop-shadow(0 0 5px ${accent})` }}>
                                     {getIslandName()}
                                 </text>
                                 <text x="0" y="16" textAnchor="middle" fill={accent} fontSize="6" fontWeight="bold" letterSpacing="4" opacity="0.8">
                                     SECTOR ENGAGED
                                 </text>
                             </g>
                         </>
                     )}
                     
                     {/* --- CYBER HUD OVERLAYS --- */}
                     
                     {/* Top Left: Status */}
                     <g transform="translate(5, 5)">
                        <rect width="35" height="12" fill="rgba(0,0,0,0.8)" rx="2" stroke={accent} strokeWidth="0.5" />
                        <circle cx="8" cy="6" r="2" fill={isBroken ? "#f00" : "#0f0"} className={isBroken ? "" : "animate-[pulse_1s_ease-in-out_infinite]"} />
                        <text x="14" y="8" fill={isBroken ? "#f00" : accent} fontSize="5" fontFamily="monospace" fontWeight="bold" style={{ filter: `drop-shadow(0 0 2px ${accent})` }}>
                            {isBroken ? 'ERR' : 'LIVE'}
                        </text>
                     </g>

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

                     {/* Bottom Right: Laps Odometer (Moved Left by 2px) */}
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
             <path d="M 5 0 Q 115 20 225 0 L 230 20 Q 115 35 0 20 Z" fill="url(#chrome)" stroke="#222" strokeWidth="2" filter="url(#pbrNoise)" />
             <path d="M 15 5 Q 115 20 215 5 L 210 15 Q 115 25 20 15 Z" fill="#0a0a0a" />
             
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