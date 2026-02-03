import React, { memo } from 'react';
import CharacterSVG from './CharacterSVG';

const CabinetSVG = ({ 
    islandId, 
    visualState = 'FREE', 
    mode = 'hall', 
    stats = { laps: 0, wins: 0 }, 
    charId, 
    occupantPetId,
    machineNumber = 0,
    serialNumber = null 
}) => {
    
    // --- VISUAL STATE FLAGS ---
    const isBusy = visualState === 'BUSY';
    const isHot = visualState === 'JACKPOT_HOT';
    const isBroken = visualState === 'BROKEN';
    
    const displaySerial = serialNumber || `SN-${islandId}-${machineNumber.toString().padStart(3,'0')}`;

    // --- 1. DEFINITIONS (Materials & Gradients) ---
    const renderDefs = () => (
        <defs>
            {/* COMMON METALS */}
            <linearGradient id="chromeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#333" />
                <stop offset="15%" stopColor="#999" />
                <stop offset="25%" stopColor="#bbb" />
                <stop offset="50%" stopColor="#fff" />
                <stop offset="75%" stopColor="#999" />
                <stop offset="100%" stopColor="#333" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#C5A059" /> 
                <stop offset="40%" stopColor="#FFD700" />
                <stop offset="60%" stopColor="#FFFACD" />
                <stop offset="100%" stopColor="#DAA520" />
            </linearGradient>
            <linearGradient id="darkMetal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#374151" />
                <stop offset="100%" stopColor="#111827" />
            </linearGradient>
            <linearGradient id="cylinderShine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000" stopOpacity="0.8"/>
                <stop offset="20%" stopColor="#000" stopOpacity="0.2"/>
                <stop offset="50%" stopColor="#fff" stopOpacity="0.1"/>
                <stop offset="80%" stopColor="#000" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#000" stopOpacity="0.8"/>
            </linearGradient>

            {/* GLASS & LIGHTS */}
            <linearGradient id="glassGlare" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="45%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
            <filter id="neonBlur">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            
            {/* PATTERNS (NEW: Real World Textures) */}
            <pattern id="patCarbon" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="4" height="4" fill="#151515" />
                <rect width="2" height="2" fill="#252525" />
                <rect x="2" y="2" width="2" height="2" fill="#252525" />
            </pattern>
            
            <pattern id="patWood" width="10" height="40" patternUnits="userSpaceOnUse">
                 <rect width="10" height="40" fill="#5D4037" />
                 <path d="M5,0 Q8,10 5,20 Q2,30 5,40" stroke="#3E2723" strokeWidth="0.5" fill="none" opacity="0.5"/>
            </pattern>

            <pattern id="patHex" width="8" height="8" patternUnits="userSpaceOnUse">
                 <rect width="8" height="8" fill="#1a252f" />
                 <path d="M4,0 L8,2 L8,6 L4,8 L0,6 L0,2 Z" fill="none" stroke="#2c3e50" strokeWidth="0.5" />
            </pattern>

            <pattern id="speakerMesh" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="4" height="4" fill="#111"/>
                <circle cx="2" cy="2" r="1.5" fill="#333" />
            </pattern>
            
            {/* ISLAND SKINS (Animated & Static) */}
            <linearGradient id="skinVegas" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#600"/><stop offset="50%" stopColor="#D00"/><stop offset="100%" stopColor="#600"/></linearGradient>
            
            <linearGradient id="skinMagma" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#300">
                    <animate attributeName="stop-color" values="#300;#500;#300" dur="4s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#F00">
                    <animate attributeName="stop-color" values="#F00;#F40;#F00" dur="4s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#300"/>
            </linearGradient>

            <linearGradient id="skinNoctyra" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#1a0b2e"/><stop offset="50%" stopColor="#4834d4"/><stop offset="100%" stopColor="#1a0b2e"/></linearGradient>
            <linearGradient id="skinGlacia" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#81ecec"/><stop offset="50%" stopColor="#dff9fb"/><stop offset="100%" stopColor="#81ecec"/></linearGradient>
            <linearGradient id="skinSky" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#bdc3c7"/><stop offset="50%" stopColor="#ffffff"/><stop offset="100%" stopColor="#bdc3c7"/></linearGradient>
            
            <linearGradient id="skinBio" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1e8449"/>
                <stop offset="50%" stopColor="#2ecc71">
                     <animate attributeName="stop-color" values="#2ecc71;#55efc4;#2ecc71" dur="5s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#1e8449"/>
            </linearGradient>

            <linearGradient id="skinGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#b8860b"/><stop offset="50%" stopColor="#f1c40f"/><stop offset="100%" stopColor="#b8860b"/></linearGradient>
            
            <linearGradient id="skinVoid" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#000"/>
                <stop offset="50%" stopColor="#222">
                    <animate attributeName="stop-color" values="#222;#444;#222" dur="6s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#000"/>
            </linearGradient>

            <linearGradient id="blackPlastic" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#111"/><stop offset="50%" stopColor="#333"/><stop offset="100%" stopColor="#111"/></linearGradient>

            <clipPath id="screenCutout"><rect x="40" y="85" width="160" height="115" rx="4" /></clipPath>
            <clipPath id="bellyClip"><path d="M40,300 L200,300 L195,370 L45,370 Z" /></clipPath>
        </defs>
    );

    // --- 2. CABINET FRAME (The Housing) ---
    const renderCabinetFrame = () => {
        // Default Materials
        let bodyFill = "url(#blackPlastic)";
        let trimStroke = "url(#chromeGradient)";
        let accentColor = isHot ? '#FFD700' : '#00F3FF';
        
        // --- THEME LOGIC ---
        switch(islandId) {
            case 1: // Vegas (Classic Red/Gold)
                bodyFill = "url(#skinVegas)"; 
                trimStroke = "url(#goldGradient)";
                accentColor = "#FFD700";
                break;
            case 2: // Aloha (Wood/Green)
                bodyFill = "url(#patWood)"; // Use Wood Pattern
                trimStroke = "#8B4513";
                accentColor = "#7CFC00";
                break;
            case 3: // Magma (Lava/Red)
                bodyFill = "url(#skinMagma)";
                trimStroke = "#500";
                accentColor = "#FF4500";
                break;
            case 4: // Noctyra (Purple/Dark)
                bodyFill = "url(#skinNoctyra)";
                trimStroke = "#4834d4";
                accentColor = "#E056FD";
                break;
            case 5: // Glacia (Ice/White)
                bodyFill = "url(#skinGlacia)";
                trimStroke = "#FFF";
                accentColor = "#00FFFF";
                break;
            case 6: // Sky (Marble/Gold)
                bodyFill = "url(#skinSky)";
                trimStroke = "url(#goldGradient)";
                accentColor = "#FFFFFF";
                break;
            case 7: // Bio (Green/Organic)
                bodyFill = "url(#skinBio)";
                trimStroke = "#2ecc71";
                accentColor = "#ADFF2F";
                break;
            case 8: // Cyber (Tech/Hex)
                bodyFill = "url(#patHex)"; // Use Hex Pattern
                trimStroke = "#00F3FF";
                accentColor = "#00F3FF";
                break; 
            case 9: // Gold (Steampunk)
                bodyFill = "url(#skinGold)";
                trimStroke = "#B8860B";
                accentColor = "#FFA500";
                break;
            case 10: // Void (Black/Purple)
                bodyFill = "url(#skinVoid)";
                trimStroke = "#333";
                accentColor = "#9370DB";
                break;
            default: 
                bodyFill = "url(#blackPlastic)";
        }

        return (
            <g>
                {/* Main Body Outline (Curved Top) */}
                <path d="M10,40 Q120,20 230,40 L240,400 L0,400 Z" fill={bodyFill} stroke="#111" strokeWidth="1" />
                
                {/* Side LED Strips */}
                <path d="M15,45 L15,360" stroke={accentColor} strokeWidth="4" className="animate-pulse" filter="url(#ledGlow)" opacity="0.8" />
                <path d="M225,45 L225,360" stroke={accentColor} strokeWidth="4" className="animate-pulse" filter="url(#ledGlow)" opacity="0.8" />

                {/* Speaker Housings (Top Ears) */}
                <path d="M5,40 L50,40 L45,70 L10,70 Z" fill="url(#speakerMesh)" stroke="#222" />
                <path d="M235,40 L190,40 L195,70 L230,70 Z" fill="url(#speakerMesh)" stroke="#222" />
                
                {/* Trim */}
                <path d="M15,45 L15,360" stroke={trimStroke} strokeWidth="1" opacity="0.8" fill="none" />
                <path d="M225,45 L225,360" stroke={trimStroke} strokeWidth="1" opacity="0.8" fill="none" />
            </g>
        );
    };

    // --- 3. TOPPER (Data Counter) ---
    const renderTopper = () => (
        <g transform="translate(65, -5)">
            <rect x="0" y="0" width="110" height="35" fill="#080808" stroke="#333" rx="3" />
            <g transform="translate(10, 5)">
                <rect x="0" y="0" width="80" height="25" fill="#220000" />
                <text x="75" y="20" textAnchor="end" fill="red" fontSize="14" fontFamily="monospace" fontWeight="bold" filter="url(#ledGlow)">
                    {stats?.laps || 0}
                </text>
                <text x="5" y="8" fill="#500" fontSize="5" fontWeight="bold">SPINS</text>
            </g>
            <g transform="translate(95, 5)">
                <circle cx="4" cy="4" r="3" fill={isBroken ? 'red' : '#300'} className={isBroken ? "animate-pulse" : ""} />
                <circle cx="4" cy="12" r="3" fill={isHot ? 'yellow' : '#330'} className={isHot ? 'animate-pulse' : ''} />
                <circle cx="4" cy="20" r="3" fill={isBusy ? 'blue' : '#003'} className={isBusy ? "animate-pulse" : ""} />
            </g>
        </g>
    );

    // --- 4. SCREEN BEZEL (Custom per Island) ---
    const renderScreenArea = () => {
        let bezelStroke = "url(#chromeGradient)";
        let bezelFill = "none";
        
        // Theme Specific Bezel Colors
        if (islandId === 1) bezelStroke = "url(#goldGradient)"; // Vegas Gold
        if (islandId === 5) bezelStroke = "#E0FFFF"; // Glacia Ice
        if (islandId === 8) bezelStroke = "#00F3FF"; // Cyber Neon

        if (mode === 'game') {
            // Game Mode: Hollow frame for React reels
            return (
                <g>
                    {/* Bezel Frame Mask */}
                    <path d="M40,85 H200 V205 H40 Z M10,40 H230 V390 H10 Z" fill="rgba(0,0,0,0.95)" fillRule="evenodd" />
                    {/* The Bezel Itself */}
                    <rect x="40" y="85" width="160" height="120" fill="none" stroke={bezelStroke} strokeWidth="4" rx="2" />
                    {/* Inner Shadow */}
                    <rect x="42" y="87" width="156" height="116" fill="none" stroke="black" strokeWidth="1" opacity="0.5" rx="2" />
                </g>
            );
        }

        // Lobby Mode: Simulated Reels
        return (
            <g transform="translate(40, 85)">
                <rect x="0" y="0" width="160" height="120" fill="#000" stroke="#333" strokeWidth="2" />
                {/* Mock Reels */}
                <rect x="10" y="10" width="40" height="100" fill="url(#cylinderShine)" opacity="0.3" />
                <rect x="60" y="10" width="40" height="100" fill="url(#cylinderShine)" opacity="0.3" />
                <rect x="110" y="10" width="40" height="100" fill="url(#cylinderShine)" opacity="0.3" />
                
                <text x="80" y="65" textAnchor="middle" fill={isBusy ? '#F00' : '#0F0'} fontWeight="bold" fontSize="18" className={!isBusy ? 'animate-pulse' : ''} style={{textShadow: '0 0 10px currentColor'}}>
                    {isBroken ? 'ERROR' : (isBusy ? 'PLAYING' : 'OPEN')}
                </text>
            </g>
        );
    };

    // --- 5. CONTROL DECK & BELLY ---
    const renderButtonDeck = () => (
        <g transform="translate(10, 230)">
             {/* Sloped Deck Body */}
             <path d="M0,0 L220,0 L235,50 L-15,50 Z" fill="url(#blackPlastic)" stroke="#333" />
             <path d="M-15,50 L235,50 L235,70 L-15,70 Z" fill="#111" /> {/* Front Lip */}
             
             {/* Coin Slot */}
             <rect x="190" y="15" width="5" height="20" rx="2" fill="#000" stroke="#888" />
             <rect x="192" y="18" width="1" height="14" fill="#0F0" className="animate-pulse" filter="url(#ledGlow)"/>
             
             {/* START LEVER (Knob) */}
             <g transform="translate(15, 25)">
                 <circle cx="0" cy="0" r="14" fill="#111" stroke="#333" />
                 <circle cx="0" cy="0" r="10" fill="url(#chromeGradient)" />
                 <circle cx="0" cy="-6" r="12" fill={isBusy ? "#500" : "red"} className={!isBusy ? "animate-pulse" : ""} />
             </g>

             {/* STOP BUTTONS (Visual Only - HTML Handles Interaction in Game Mode) */}
             {mode !== 'game' && (
                 <g transform="translate(70, 15)">
                     <circle cx="0" cy="10" r="12" fill="#c0392b" stroke="#333" strokeWidth="2" />
                     <circle cx="40" cy="10" r="12" fill="#c0392b" stroke="#333" strokeWidth="2" />
                     <circle cx="80" cy="10" r="12" fill="#c0392b" stroke="#333" strokeWidth="2" />
                 </g>
             )}
        </g>
    );

    const renderBellyGlass = () => (
        <g transform="translate(30, 310)">
             {/* Frame */}
             <path d="M0,0 L180,0 L170,70 L10,70 Z" fill="#000" stroke="url(#chromeGradient)" strokeWidth="2" />
             
             {/* Art Area */}
             <g clipPath="url(#bellyClip)">
                 <rect x="5" y="5" width="170" height="60" fill={islandId===3 ? '#300' : '#101'} />
                 
                 {/* Character Sticker */}
                 <g transform="translate(140, 35) scale(0.25)">
                    <CharacterSVG type={charId} stickerMode={true} />
                 </g>
                 
                 {/* Info Text */}
                 <text x="15" y="25" fill="#FFF" fontSize="14" fontWeight="black" style={{textShadow:'0 0 5px white'}}>BIG BONUS</text>
                 <text x="15" y="45" fill="gold" fontSize="10" fontFamily="monospace">WIN: {stats.wins}</text>
             </g>
             
             {/* Glare */}
             <path d="M0,0 L180,0 L170,70 L10,70 Z" fill="url(#glassGlare)" opacity="0.3" pointerEvents="none" />
             
             {/* Serial Plate */}
             <rect x="60" y="55" width="60" height="10" fill="silver" stroke="black" rx="1" />
             <text x="90" y="62" textAnchor="middle" fill="black" fontSize="5" fontFamily="monospace" fontWeight="bold">{displaySerial}</text>
        </g>
    );

    const renderCoinTray = () => (
        <g transform="translate(0, 380)">
             <path d="M10,0 Q120,15 230,0 L230,20 Q120,30 10,20 Z" fill="url(#chromeGradient)" stroke="#333" />
             <rect x="20" y="5" width="200" height="15" rx="5" fill="#111" opacity="0.9" />
             {isHot && (
                 <g>
                    <circle cx="40" cy="12" r="5" fill="gold" stroke="orange" />
                    <circle cx="50" cy="14" r="5" fill="gold" stroke="orange" />
                    <circle cx="45" cy="10" r="5" fill="gold" stroke="orange" />
                 </g>
             )}
        </g>
    );

    // --- MAIN RENDER ---
    return (
        <svg width="240" height="400" viewBox="0 0 240 400" className={`drop-shadow-2xl transition-transform group-hover:-translate-y-2 duration-300 ${isBroken ? 'animate-pulse' : ''}`}>
            {renderDefs()}
            
            {/* Floor Shadow */}
            <ellipse cx="120" cy="395" rx="100" ry="10" fill="#000" opacity="0.6" filter="blur(6px)" />
            
            {renderCabinetFrame()}
            {renderTopper()}
            {renderScreenArea()} 
            {renderButtonDeck()}
            {renderBellyGlass()}
            {renderCoinTray()}

            {/* Occupant (Hall Mode Only) */}
            {mode === 'hall' && isBusy && occupantPetId && (
                 <g transform="translate(80, 260) scale(0.35)">
                    <CharacterSVG type={occupantPetId} mood="idle" />
                 </g>
            )}
        </svg>
    );
};

export default memo(CabinetSVG);