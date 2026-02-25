import React, { memo } from 'react';
import CharacterSVG from './CharacterSVG';

const CabinetSVG = ({ 
    islandId, 
    visualState = 'FREE', 
    mode = 'hall', 
    charId, 
    machine = {}, 
    stats = { laps: 0, wins: 0 }, 
    machineNumber = 0,
    serialNumber = null 
}) => {
    
    // --- STATE & PROPS BINDING ---
    const isBusy = visualState === 'BUSY';
    const isHot = visualState === 'JACKPOT_HOT';
    const isBroken = visualState === 'BROKEN';
    
    const displayLaps = machine?.total_laps || stats.laps || 0;
    const displayWins = machine?.total_payout || stats.wins || 0;
    const displayNum = machine?.machine_number || machineNumber || 0;
    const displaySerial = machine?.serial_number || serialNumber || `SRO-${islandId}-${displayNum.toString().padStart(3,'0')}`;
    const paintSkin = machine?.paint_skin || 'default';
    const jackpotSeed = machine?.jackpot_seed || 0;

    // --- ASSET PATHS ---
    const getHeaderImg = (id) => `/assets/machines/header_${id}.png`;
    const getBellyImg = (id) => `/assets/machines/belly_${id}.png`;

    // --- 1. MATERIALS, SHADERS & TEXTURES ---
    const renderDefs = () => (
        <defs>
            {/* METALS & MATERIALS */}
            <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#222" /><stop offset="30%" stopColor="#aaa" /><stop offset="50%" stopColor="#fff" /><stop offset="70%" stopColor="#aaa" /><stop offset="100%" stopColor="#222" /></linearGradient>
            <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#5c3a00" /><stop offset="40%" stopColor="#FFD700" /><stop offset="60%" stopColor="#FFFACD" /><stop offset="100%" stopColor="#B8860B" /></linearGradient>
            <linearGradient id="darkPlast" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#050505"/><stop offset="50%" stopColor="#1a1a1a"/><stop offset="100%" stopColor="#050505"/></linearGradient>
            <linearGradient id="glassGlare" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgba(255,255,255,0.05)" /><stop offset="45%" stopColor="rgba(255,255,255,0.3)" /><stop offset="50%" stopColor="rgba(255,255,255,0)" /><stop offset="100%" stopColor="rgba(255,255,255,0.05)" /></linearGradient>
            <linearGradient id="neonGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00f3ff" stopOpacity="0.8" /><stop offset="100%" stopColor="#ff00ff" stopOpacity="0.2" /></linearGradient>

            {/* PACHISLO SPECIFIC PATTERNS */}
            <pattern id="dotMatrix" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="4" height="4" fill="#110000"/>
                <circle cx="2" cy="2" r="1.5" fill="#330000" />
            </pattern>
            <pattern id="carbonFiber" width="8" height="8" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" fill="#111"/>
                <path d="M0,8 L8,0 M-2,2 L2,-2 M6,10 L10,6" stroke="#222" strokeWidth="2" />
            </pattern>
            <pattern id="speakerMesh" width="3" height="3" patternUnits="userSpaceOnUse">
                <rect width="3" height="3" fill="#000"/><circle cx="1.5" cy="1.5" r="1" fill="#222" />
            </pattern>

            {/* ISLAND SKINS */}
            <linearGradient id="skinVegas" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#300"/><stop offset="50%" stopColor="#800"/><stop offset="100%" stopColor="#300"/></linearGradient>
            <linearGradient id="skinAloha" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#3E2723"/><stop offset="50%" stopColor="#6D4C41"/><stop offset="100%" stopColor="#3E2723"/></linearGradient>
            <linearGradient id="skinMagma" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#111"/><stop offset="50%" stopColor="#400"/><stop offset="100%" stopColor="#820"/></linearGradient>
            <linearGradient id="skinNoctyra" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0B001A"/><stop offset="50%" stopColor="#2A0066"/><stop offset="100%" stopColor="#0B001A"/></linearGradient>
            <linearGradient id="skinGlacia" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4682B4"/><stop offset="50%" stopColor="#B0E0E6"/><stop offset="100%" stopColor="#4682B4"/></linearGradient>
            <linearGradient id="skinSky" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#bdc3c7"/><stop offset="50%" stopColor="#ffffff"/><stop offset="100%" stopColor="#bdc3c7"/></linearGradient>
            <linearGradient id="skinBio" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#003300"/><stop offset="50%" stopColor="#228B22"/><stop offset="100%" stopColor="#003300"/></linearGradient>
            <linearGradient id="skinCyber" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#111"/><stop offset="50%" stopColor="#2A3B4C"/><stop offset="100%" stopColor="#111"/></linearGradient>
            <linearGradient id="skinGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#8B6508"/><stop offset="50%" stopColor="#FFD700"/><stop offset="100%" stopColor="#8B6508"/></linearGradient>
            <linearGradient id="skinVoid" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#000"/><stop offset="50%" stopColor="#111"/><stop offset="100%" stopColor="#000"/></linearGradient>

            {/* FILTERS */}
            <filter id="glowLight"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="hotGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

            {/* MASKS */}
            <clipPath id="bellyClipLocal"><path d="M10,0 L170,0 L160,70 L20,70 Z" /></clipPath>
            <clipPath id="screenCutout"><rect x="40" y="85" width="160" height="115" rx="4" /></clipPath>
        </defs>
    );

    // --- 2. THEMATIC JAPANESE MOTIFS (Highly Detailed) ---
    const renderJapaneseMotifs = () => {
        switch(islandId) {
            case 1: // Kyoto Zen (Wood grain & Glowing Kanji)
                return (
                    <g className="theme-motifs">
                        {/* Shogun Torii Beams */}
                        <path d="M 5 35 L 235 35 L 235 40 L 5 40 Z" fill="#8B0000" stroke="#400" strokeWidth="1"/>
                        <path d="M 15 45 L 225 45 L 225 50 L 15 50 Z" fill="#8B0000" stroke="#400" strokeWidth="1"/>
                        {/* Glowing Kanji for "Fortune" */}
                        {isHot && <text x="30" y="150" fill="#FFD700" fontSize="30" filter="url(#hotGlow)" opacity="0.4" className="animate-pulse font-serif">福</text>}
                        {isHot && <text x="210" y="150" fill="#FFD700" fontSize="30" filter="url(#hotGlow)" opacity="0.4" className="animate-pulse font-serif">運</text>}
                    </g>
                );
            case 2: // Neon Arcade (Akihabara Grids & Diodes)
                return (
                    <g className="theme-motifs">
                        <rect x="15" y="60" width="10" height="280" fill="url(#dotMatrix)" opacity="0.8" />
                        <rect x="215" y="60" width="10" height="280" fill="url(#dotMatrix)" opacity="0.8" />
                        {/* Circuit traces */}
                        <path d="M 20 100 L 30 110 L 30 150 M 220 100 L 210 110 L 210 150" fill="none" stroke="#FF00FF" strokeWidth="2" opacity="0.5" filter="url(#glowLight)"/>
                    </g>
                );
            case 3: // Edo Castle (Samurai Armor Lacing - Odoshige)
                return (
                    <g className="theme-motifs">
                        {/* Criss-cross armor lacing */}
                        <path d="M 15 100 L 25 110 M 15 110 L 25 100 M 15 120 L 25 130 M 15 130 L 25 120" stroke="#FFD700" strokeWidth="2" opacity="0.7" />
                        <path d="M 215 100 L 225 110 M 215 110 L 225 100 M 215 120 L 225 130 M 215 130 L 225 120" stroke="#FFD700" strokeWidth="2" opacity="0.7" />
                        <circle cx="20" cy="80" r="6" fill="#111" stroke="#FFD700" strokeWidth="1.5" />
                        <circle cx="220" cy="80" r="6" fill="#111" stroke="#FFD700" strokeWidth="1.5" />
                    </g>
                );
            case 4: // Hanami Fest (Branch Silhouettes)
                return (
                    <g className="theme-motifs">
                        <path d="M 10 40 Q 30 60 40 100 Q 35 120 20 130" fill="none" stroke="#3E2723" strokeWidth="4" strokeLinecap="round" />
                        <path d="M 230 40 Q 210 60 200 100 Q 205 120 220 130" fill="none" stroke="#3E2723" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="35" cy="80" r="4" fill="#FFB6C1" filter="url(#glowLight)"/>
                        <circle cx="205" cy="80" r="4" fill="#FFB6C1" filter="url(#glowLight)"/>
                    </g>
                );
            case 5: // Yokai (Shimenawa Rope & Paper Wards)
                return (
                    <g className="theme-motifs">
                        {/* Twisted Rope */}
                        <path d="M 10 70 Q 20 75 30 70 T 50 70 T 70 70" fill="none" stroke="#F5DEB3" strokeWidth="6" strokeDasharray="8 4" opacity="0.6"/>
                        <path d="M 170 70 Q 180 75 190 70 T 210 70 T 230 70" fill="none" stroke="#F5DEB3" strokeWidth="6" strokeDasharray="8 4" opacity="0.6"/>
                        {/* ZigZag Paper (Shide) */}
                        <path d="M 30 70 L 35 80 L 30 90 L 35 100" fill="none" stroke="#FFF" strokeWidth="3" />
                        <path d="M 210 70 L 205 80 L 210 90 L 205 100" fill="none" stroke="#FFF" strokeWidth="3" />
                    </g>
                );
            case 8: // Cyberpunk (Hex Grids & Hazard Tape)
                return (
                    <g className="theme-motifs">
                        <path d="M 15 40 L 25 50 L 15 60 L 25 70" fill="none" stroke="#FFFF00" strokeWidth="10" strokeDasharray="10 10" opacity="0.8"/>
                        <path d="M 225 40 L 215 50 L 225 60 L 215 70" fill="none" stroke="#FFFF00" strokeWidth="10" strokeDasharray="10 10" opacity="0.8"/>
                        <rect x="18" y="100" width="4" height="200" fill="#00f3ff" filter="url(#glowLight)" className="animate-pulse"/>
                        <rect x="218" y="100" width="4" height="200" fill="#00f3ff" filter="url(#glowLight)" className="animate-pulse"/>
                    </g>
                );
            default: return null;
        }
    };

    // --- 3. CHASSIS GEOMETRY (Authentic Molded Shapes) ---
    const renderChassis = () => {
        let path, fill, stroke;
        const accent = isHot ? '#FFD700' : (islandId === 8 ? '#00F3FF' : '#FF0055');

        // Paint Skin Override
        if (paintSkin === 'gold') fill = "url(#skinGold)";
        else if (paintSkin === 'cyber') fill = "url(#skinCyber)";
        else {
            switch(islandId) {
                case 1: fill="url(#skinVegas)"; stroke="url(#gold)"; path = "M10,35 Q120,15 230,35 L235,395 L5,395 Z"; break;
                case 2: fill="url(#skinAloha)"; stroke="#FFD700"; path = "M15,40 L35,20 L205,20 L225,40 L225,395 L15,395 Z"; break;
                case 3: fill="url(#skinMagma)"; stroke="#F00"; path = "M10,50 L40,30 L80,50 L120,30 L160,50 L200,30 L230,50 L235,395 L5,395 Z"; break;
                case 4: fill="url(#skinNoctyra)"; stroke="#9D00FF"; path = "M20,60 L120,20 L220,60 L225,395 L15,395 Z"; break;
                case 8: fill="url(#carbonFiber)"; stroke="#00F3FF"; path = "M10,30 H50 V45 H190 V30 H230 V395 H10 Z"; break;
                default: fill="url(#darkPlast)"; stroke="#555"; path = "M15,40 L225,40 L230,395 L10,395 Z";
            }
        }

        return (
            <g>
                {/* Main Body */}
                <path d={path} fill={fill} stroke={stroke} strokeWidth="3" />
                
                {/* Pachislo Large Speaker Ears */}
                <g transform="translate(0, 50)">
                    <path d="M 5 0 L 25 10 L 25 80 L 5 70 Z" fill="url(#speakerMesh)" stroke="#222" strokeWidth="2"/>
                    <path d="M 235 0 L 215 10 L 215 80 L 235 70 Z" fill="url(#speakerMesh)" stroke="#222" strokeWidth="2"/>
                    <circle cx="15" cy="40" r="6" fill="#111" stroke={accent} strokeWidth="1" filter="url(#glowLight)" className={isHot ? 'animate-pulse' : ''} />
                    <circle cx="225" cy="40" r="6" fill="#111" stroke={accent} strokeWidth="1" filter="url(#glowLight)" className={isHot ? 'animate-pulse' : ''} />
                </g>

                {/* Vertical LED Light Pillars */}
                <rect x="18" y="140" width="6" height="180" rx="3" fill="#111" stroke="#333" />
                <rect x="20" y="145" width="2" height="170" fill={accent} filter="url(#glowLight)" className="animate-[pulse_1s_infinite]" opacity={isBusy || isHot ? 1 : 0.2} />
                
                <rect x="216" y="140" width="6" height="180" rx="3" fill="#111" stroke="#333" />
                <rect x="218" y="145" width="2" height="170" fill={accent} filter="url(#glowLight)" className="animate-[pulse_1s_infinite]" opacity={isBusy || isHot ? 1 : 0.2} />

                {/* Mechanical Details (Screws) */}
                <circle cx="25" cy="380" r="3" fill="url(#chrome)" /><circle cx="25" cy="380" r="1.5" fill="#111" />
                <circle cx="215" cy="380" r="3" fill="url(#chrome)" /><circle cx="215" cy="380" r="1.5" fill="#111" />

                {/* Motif Layer */}
                {renderJapaneseMotifs()}
            </g>
        );
    };

    // --- 4. TOPPER & HOLOGRAPHIC HUD ---
    const renderTopper = () => (
        <g transform="translate(60, -5)">
            {/* Header Chrome Frame */}
            <path d="M -5 5 L 125 5 L 120 40 L 0 40 Z" fill="#050505" stroke="url(#chrome)" strokeWidth="2" />
            <image href={getHeaderImg(islandId)} x="5" y="8" width="110" height="28" preserveAspectRatio="none" onError={(e) => {e.target.style.display='none'}}/>

            {/* Holographic Data Matrix (Pachislo Style Data Counter) */}
            <g transform="translate(0, -15)">
                <rect x="20" y="0" width="80" height="22" rx="2" fill="url(#dotMatrix)" stroke="#333" strokeWidth="2" />
                <rect x="22" y="2" width="76" height="18" fill="#f00" opacity="0.1" />
                <text x="30" y="10" fill="#f87171" fontSize="5" fontFamily="monospace" fontWeight="bold">LAPS</text>
                <text x="50" y="18" fill="#ff0000" fontSize="12" fontFamily="monospace" fontWeight="black" filter="url(#glowLight)" letterSpacing="1">
                    {displayLaps.toString().padStart(4, '0')}
                </text>
                {jackpotSeed > 0 && (
                    <text x="80" y="10" fill="#fbbf24" fontSize="4" fontFamily="monospace" fontWeight="bold">JP</text>
                )}
            </g>

            {/* Warning / Status Beacons */}
            <g transform="translate(100, -10)">
                <path d="M 0 0 L 10 0 L 12 12 L -2 12 Z" fill={isBroken ? '#F00' : '#300'} filter={isBroken ? 'url(#glowLight)' : ''} className={isBroken ? "animate-pulse" : ""} />
                <path d="M 12 0 L 22 0 L 24 12 L 10 12 Z" fill={isHot ? '#FFD700' : '#330'} filter={isHot ? 'url(#hotGlow)' : ''} className={isHot ? 'animate-pulse' : ''} />
            </g>
        </g>
    );

    // --- 5. SCREEN BEZEL (Deep Recessed Monitor) ---
    const renderScreenArea = () => {
        return (
            <g transform="translate(0, 80)">
                {/* Outer Chrome Lip */}
                <path d="M 30 0 H 210 L 205 130 H 35 Z" fill="url(#darkPlast)" stroke="url(#chrome)" strokeWidth="3" />
                {/* Inner Shadow / Recess */}
                <path d="M 35 5 H 205 L 200 125 H 40 Z" fill="#000" />
                <path d="M 35 5 H 205 L 195 20 H 45 Z" fill="#111" opacity="0.8" />
                <path d="M 35 5 L 45 20 V 110 L 40 125 Z" fill="#111" opacity="0.5" />
                
                {/* "Gekiatsu" Alert Layer (Visible only when HOT) */}
                {isHot && mode !== 'game' && (
                    <g opacity="0.8" className="animate-pulse">
                        <text x="120" y="75" textAnchor="middle" fill="#FF0000" fontSize="32" fontWeight="900" fontStyle="italic" stroke="#FFF" strokeWidth="2" filter="url(#hotGlow)">激熱</text>
                    </g>
                )}

                {/* If Hall Mode, render mock reels. If Game Mode, leave transparent for React to fill. */}
                {mode !== 'game' && (
                    <g opacity={isHot ? 0.3 : 1}>
                        <rect x="45" y="10" width="33" height="110" fill="#222" opacity="0.5" rx="2" />
                        <rect x="83" y="10" width="34" height="110" fill="#222" opacity="0.5" rx="2" />
                        <rect x="122" y="10" width="33" height="110" fill="#222" opacity="0.5" rx="2" />
                        <text x="120" y="70" textAnchor="middle" fill={isBusy ? '#00F3FF' : '#0F0'} fontWeight="bold" fontSize="16" letterSpacing="2" className={!isBusy ? 'animate-pulse' : ''} filter="url(#glowLight)">
                            {isBroken ? 'ERROR' : (isBusy ? 'LINKED' : 'INSERT COIN')}
                        </text>
                    </g>
                )}
            </g>
        );
    };

    // --- 6. CONTROL DECK (Authentic Pachislo Layout) ---
    const renderButtonDeck = () => (
        <g transform="translate(10, 220)">
             {/* Sloped Deck Base */}
             <path d="M 0 0 L 220 0 L 235 60 L -15 60 Z" fill="url(#darkPlast)" stroke="#444" strokeWidth="2"/>
             <path d="M -15 60 L 235 60 L 230 75 L -10 75 Z" fill="#0a0a0a" stroke="#222" />
             
             {/* Coin Slot (Right Side) */}
             <g transform="translate(195, 10)">
                 <rect x="0" y="0" width="16" height="30" rx="3" fill="#111" stroke="url(#chrome)" strokeWidth="1.5" />
                 <rect x="6" y="5" width="4" height="20" rx="2" fill="#000" />
                 <polygon points="8,35 4,40 12,40" fill="#0F0" filter="url(#glowLight)" className="animate-bounce" />
             </g>

             {/* MAX BET Button (Left Side) */}
             <g transform="translate(5, 15)">
                 <rect x="0" y="0" width="24" height="16" rx="4" fill="#333" stroke="#111" strokeWidth="2" />
                 <rect x="2" y="2" width="20" height="12" rx="2" fill="#800" />
                 <text x="12" y="10" textAnchor="middle" fill="#FFF" fontSize="4" fontWeight="bold">MAX BET</text>
             </g>

             {/* START LEVER (Below Max Bet) */}
             <g transform="translate(17, 45)">
                 <circle cx="0" cy="0" r="14" fill="#111" stroke="#333" />
                 <circle cx="0" cy="0" r="10" fill="url(#chrome)" />
                 <circle cx="0" cy="-6" r="10" fill={isBusy ? "#00F3FF" : "red"} filter="url(#glowLight)" className={!isBusy ? "animate-pulse" : ""} />
             </g>

             {/* 3 MASSIVE STOP BUTTON HOUSINGS (Center) */}
             {mode !== 'game' && (
                 <g transform="translate(60, 20)">
                     {/* Button 1 */}
                     <circle cx="15" cy="20" r="18" fill="#111" stroke="url(#chrome)" strokeWidth="2" />
                     <circle cx="15" cy="20" r="14" fill="#500" />
                     {/* Button 2 */}
                     <circle cx="55" cy="20" r="18" fill="#111" stroke="url(#chrome)" strokeWidth="2" />
                     <circle cx="55" cy="20" r="14" fill="#500" />
                     {/* Button 3 */}
                     <circle cx="95" cy="20" r="18" fill="#111" stroke="url(#chrome)" strokeWidth="2" />
                     <circle cx="95" cy="20" r="14" fill="#500" />
                 </g>
             )}
        </g>
    );

    // --- 7. BELLY GLASS ---
    const renderBellyGlass = () => (
        <g transform="translate(25, 295)">
             {/* Frame */}
             <path d="M 0 0 L 190 0 L 180 80 L 10 80 Z" fill="#000" stroke="url(#chrome)" strokeWidth="3" />
             
             {/* Art Content */}
             <g clipPath="url(#bellyClipLocal)" transform="scale(1.12) translate(-5, 0)">
                 <rect x="0" y="0" width="180" height="70" fill={islandId===3 ? '#300' : '#101'} />
                 <image href={getBellyImg(islandId)} x="0" y="-20" width="180" height="110" preserveAspectRatio="xMidYMid slice" onError={(e) => { e.target.style.display = 'none'; }} />
                 
                 {/* Sticker Char */}
                 <g transform="translate(130, 35) scale(0.25)">
                    <CharacterSVG type={charId} stickerMode={true} />
                 </g>
                 
                 {/* Stats Overlay */}
                 <rect x="5" y="50" width="70" height="15" fill="rgba(0,0,0,0.7)" rx="2" />
                 <text x="10" y="61" fill="#FFD700" fontSize="8" fontFamily="monospace" fontWeight="bold">
                     WIN: {(displayWins / 1000).toFixed(1)}k
                 </text>
             </g>
             
             {/* Glass Glare */}
             <path d="M 0 0 L 190 0 L 180 80 L 10 80 Z" fill="url(#glassGlare)" opacity="0.5" pointerEvents="none" />
             
             {/* Serial Plate */}
             <rect x="65" y="70" width="60" height="8" fill="#ccc" stroke="#333" rx="1" />
             <text x="95" y="76" textAnchor="middle" fill="#000" fontSize="5" fontFamily="monospace" fontWeight="bold">{displaySerial}</text>
        </g>
    );

    // --- 8. COIN TRAY (Hopper) ---
    const renderCoinTray = () => (
        <g transform="translate(5, 380)">
             {/* Outer Chrome Tray */}
             <path d="M 5 0 Q 115 20 225 0 L 230 20 Q 115 35 0 20 Z" fill="url(#chrome)" stroke="#222" strokeWidth="2" />
             {/* Deep Black Inner Tray */}
             <path d="M 15 5 Q 115 20 215 5 L 210 15 Q 115 25 20 15 Z" fill="#0a0a0a" />
             
             {/* Coin Pile (If Wins > 0 or Hot) */}
             {(displayWins > 0 || isHot) && (
                 <g transform="translate(30, 8)">
                    {/* Simulated stack of overlapping ellipses representing coins */}
                    <ellipse cx="20" cy="5" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    <ellipse cx="22" cy="3" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    <ellipse cx="35" cy="6" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    <ellipse cx="30" cy="2" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    <ellipse cx="50" cy="5" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    <ellipse cx="45" cy="1" rx="8" ry="3" fill="url(#gold)" stroke="#B8860B" strokeWidth="0.5" />
                    {isHot && <circle cx="35" cy="4" r="15" fill="#FFD700" opacity="0.3" filter="url(#glowLight)" className="animate-pulse" />}
                 </g>
             )}
        </g>
    );

    return (
        <svg 
            width="100%" height="100%" 
            viewBox="0 0 240 410" 
            preserveAspectRatio="xMidYMid meet" 
            className={`drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] transition-transform duration-300 ${mode==='hall' ? 'group-hover:-translate-y-2' : ''}`}
        >
            {renderDefs()}
            {/* Ambient Floor Shadow */}
            <ellipse cx="120" cy="405" rx="110" ry="12" fill="#000" opacity="0.8" filter="blur(5px)" />
            
            {renderChassis()}
            {renderTopper()}
            {renderScreenArea()} 
            {renderButtonDeck()}
            {renderBellyGlass()}
            {renderCoinTray()}
            
            {/* Final Overall Screen Glare */}
            <path d="M 15 40 L 225 40 L 230 395 L 10 395 Z" fill="url(#glassGlare)" opacity="0.2" pointerEvents="none" style={{mixBlendMode:'screen'}} />
        </svg>
    );
};

export default memo(CabinetSVG);