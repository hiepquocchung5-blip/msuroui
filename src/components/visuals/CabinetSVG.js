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
    
    // --- STATE FLAGS ---
    const isBusy = visualState === 'BUSY';
    const isHot = visualState === 'JACKPOT_HOT';
    const isBroken = visualState === 'BROKEN';
    const displaySerial = serialNumber || `SN-${islandId}-${machineNumber.toString().padStart(3,'0')}`;

    // --- ASSET PATHS ---
    const getHeaderImg = (id) => `/assets/machines/header_${id}.png`;
    const getBellyImg = (id) => `/assets/machines/belly_${id}.png`;

    // --- 1. MATERIALS & SHADERS ---
    const renderDefs = () => (
        <defs>
            {/* METALS */}
            <linearGradient id="chromeGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#333" /><stop offset="20%" stopColor="#888" /><stop offset="50%" stopColor="#fff" /><stop offset="80%" stopColor="#888" /><stop offset="100%" stopColor="#333" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8B4513" /><stop offset="40%" stopColor="#FFD700" /><stop offset="60%" stopColor="#FFFACD" /><stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
            <linearGradient id="blackPlastic" x1="0" y1="0" x2="1" y2="0">
                 <stop offset="0%" stopColor="#0a0a0a"/><stop offset="50%" stopColor="#222"/><stop offset="100%" stopColor="#0a0a0a"/>
            </linearGradient>

            {/* TEXTURES */}
            <pattern id="graffitiPattern" width="100" height="100" patternUnits="userSpaceOnUse">
                 <path d="M10,10 L30,40 M80,20 L60,80 M10,90 L40,80" stroke="#000" strokeWidth="1" opacity="0.3" />
                 <circle cx="50" cy="50" r="20" fill="none" stroke="#000" strokeWidth="0.5" opacity="0.2" />
            </pattern>
            <pattern id="speakerMesh" width="3" height="3" patternUnits="userSpaceOnUse">
                <rect width="3" height="3" fill="#111"/><circle cx="1.5" cy="1.5" r="1" fill="#333" />
            </pattern>

            {/* FX FILTERS */}
            <filter id="ledGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <linearGradient id="glassGlare" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.05)" /><stop offset="45%" stopColor="rgba(255,255,255,0.2)" /><stop offset="50%" stopColor="rgba(255,255,255,0)" /><stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>

            {/* ISLAND SKINS */}
            <linearGradient id="skinVegas" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#500"/><stop offset="50%" stopColor="#900"/><stop offset="100%" stopColor="#500"/></linearGradient>
            <linearGradient id="skinAloha" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#5D4037"/><stop offset="50%" stopColor="#8D6E63"/><stop offset="100%" stopColor="#5D4037"/></linearGradient>
            <linearGradient id="skinMagma" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#200"/><stop offset="50%" stopColor="#500"/><stop offset="100%" stopColor="#200"/></linearGradient>
            <linearGradient id="skinNoctyra" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#1a0b2e"/><stop offset="50%" stopColor="#4834d4"/><stop offset="100%" stopColor="#1a0b2e"/></linearGradient>
            <linearGradient id="skinGlacia" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#a2d9ff"/><stop offset="50%" stopColor="#e0ffff"/><stop offset="100%" stopColor="#a2d9ff"/></linearGradient>
            <linearGradient id="skinSky" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#bdc3c7"/><stop offset="50%" stopColor="#ffffff"/><stop offset="100%" stopColor="#bdc3c7"/></linearGradient>
            <linearGradient id="skinBio" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#1e8449"/><stop offset="50%" stopColor="#2ecc71"/><stop offset="100%" stopColor="#1e8449"/></linearGradient>
            <linearGradient id="skinCyber" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2c3e50"/><stop offset="50%" stopColor="#34495e"/><stop offset="100%" stopColor="#2c3e50"/></linearGradient>
            <linearGradient id="skinGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#b8860b"/><stop offset="50%" stopColor="#f1c40f"/><stop offset="100%" stopColor="#b8860b"/></linearGradient>
            <linearGradient id="skinVoid" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#000"/><stop offset="50%" stopColor="#222"/><stop offset="100%" stopColor="#000"/></linearGradient>

            {/* MASKS for PNG Clipping */}
            <clipPath id="headerClip"><rect x="55" y="40" width="130" height="40" rx="2" /></clipPath>
            <clipPath id="bellyClip"><path d="M40,300 L200,300 L195,370 L45,370 Z" /></clipPath>
            <clipPath id="screenCutout"><rect x="40" y="85" width="160" height="115" rx="4" /></clipPath>
        </defs>
    );

    // --- 2. CHASSIS GEOMETRY (10 Unique Styles) ---
    const renderChassis = () => {
        let path, fill, stroke;
        const accent = isHot ? '#FFD700' : '#00F3FF';

        switch(islandId) {
            case 1: // Vegas (Classic Box)
                fill="url(#skinVegas)"; stroke="url(#goldGradient)";
                path = "M15,40 Q120,20 225,40 L230,390 L10,390 Z"; break;
            case 2: // Aloha (Wood/Bamboo)
                fill="url(#skinAloha)"; stroke="#3E2723";
                path = "M10,40 L30,20 L210,20 L230,40 L225,390 L15,390 Z"; break;
            case 3: // Inferna (Jagged Rock)
                fill="url(#skinMagma)"; stroke="#500";
                path = "M10,50 L40,30 L80,50 L120,30 L160,50 L200,30 L230,50 L235,390 L5,390 Z"; break;
            case 4: // Noctyra (Coffin)
                fill="url(#skinNoctyra)"; stroke="#4834d4";
                path = "M20,60 L120,10 L220,60 L215,390 L25,390 Z"; break;
            case 5: // Glacia (Shard)
                fill="url(#skinGlacia)"; stroke="#FFF";
                path = "M10,40 L120,20 L230,40 L220,390 L20,390 Z"; break;
            case 6: // Sky (Winged Pillar)
                fill="url(#skinSky)"; stroke="url(#goldGradient)";
                path = "M5,40 Q60,10 120,30 Q180,10 235,40 L230,390 L10,390 Z"; break;
            case 7: // Bio (Organic Bulb)
                fill="url(#skinBio)"; stroke="#0F0";
                path = "M20,50 Q120,0 220,50 Q240,200 225,390 Q120,410 15,390 Q0,200 20,50"; break;
            case 8: // Cyber (Tech Box)
                fill="url(#skinCyber)"; stroke="#0FF";
                path = "M10,30 H50 V40 H190 V30 H230 V390 H10 Z"; break;
            case 9: // Gold (Steampunk)
                fill="url(#skinGold)"; stroke="#B8860B";
                path = "M20,40 Q120,20 220,40 L220,390 L20,390 Z"; break;
            case 10: // Void (Monolith)
                fill="url(#skinVoid)"; stroke="#333";
                path = "M30,20 L210,20 L210,400 L30,400 Z"; break;
            default: fill="url(#darkPlastic)"; stroke="#555"; path = "M10,40 L230,40 L230,390 L10,390 Z";
        }

        return (
            <g>
                <path d={path} fill={fill} stroke={stroke} strokeWidth="2" />
                {/* Side LED Strips */}
                <path d="M20,60 L20,350" stroke={accent} strokeWidth="4" className="animate-pulse" filter="url(#ledGlow)" opacity="0.8" />
                <path d="M220,60 L220,350" stroke={accent} strokeWidth="4" className="animate-pulse" filter="url(#ledGlow)" opacity="0.8" />
                
                {/* Graffiti Layer (For Slum/Inferna) */}
                {(islandId === 3 || islandId === 8 || islandId === 10) && (
                    <path d={path} fill="url(#graffitiPattern)" style={{mixBlendMode: 'multiply'}} opacity="0.7" />
                )}
            </g>
        );
    };

    // --- 3. TOPPER (Header PNG + Data) ---
    const renderTopper = () => (
        <g transform="translate(60, -5)">
            <rect x="0" y="0" width="120" height="35" fill="#080808" stroke="#333" rx="3" />
            
            {/* Header Image Area */}
            <image href={getHeaderImg(islandId)} x="30" y="2" width="85" height="31" preserveAspectRatio="none" onError={(e) => {e.target.style.display='none'}}/>

            {/* LED Display (Overlay) */}
            <g transform="translate(5, 5)">
                <rect x="0" y="0" width="30" height="25" fill="#220000" stroke="#400" />
                <text x="15" y="20" textAnchor="middle" fill="red" fontSize="12" fontFamily="monospace" fontWeight="bold" filter="url(#ledGlow)">{stats?.laps || 0}</text>
            </g>

            {/* Status Lights */}
            <g transform="translate(95, 5)">
                <circle cx="4" cy="4" r="3" fill={isBroken ? 'red' : '#300'} className={isBroken ? "animate-pulse" : ""} />
                <circle cx="4" cy="12" r="3" fill={isHot ? 'yellow' : '#330'} className={isHot ? 'animate-pulse' : ''} />
                <circle cx="4" cy="20" r="3" fill={isBusy ? 'blue' : '#003'} className={isBusy ? "animate-pulse" : ""} />
            </g>
        </g>
    );

    // --- 4. SCREEN BEZEL ---
    const renderScreenArea = () => {
        if (mode === 'game') {
            // Game Mode: Hollow frame for React reels
            return (
                <g>
                    {/* Bezel Frame */}
                    <path d="M40,85 H200 V205 H40 Z M10,40 H230 V390 H10 Z" fill="rgba(0,0,0,0.95)" fillRule="evenodd" />
                    {/* Chrome Inner Trim */}
                    <rect x="40" y="85" width="160" height="115" fill="none" stroke="url(#chromeGradient)" strokeWidth="4" rx="2" />
                </g>
            );
        }
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

             {/* STOP BUTTONS (Visual) */}
             {mode !== 'game' && (
                 <g transform="translate(70, 15)">
                     <circle cx="0" cy="10" r="12" fill="#c0392b" stroke="#333" strokeWidth="2" />
                     <text x="0" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">1</text>
                     <circle cx="40" cy="10" r="12" fill="#c0392b" stroke="#333" strokeWidth="2" />
                     <text x="40" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">2</text>
                     <circle cx="80" cy="10" r="12" fill="#c0392b" stroke="#333" strokeWidth="2" />
                     <text x="80" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">3</text>
                 </g>
             )}
        </g>
    );

    const renderBellyGlass = () => (
        <g transform="translate(30, 310)">
             {/* Frame */}
             <path d="M0,0 L180,0 L170,70 L10,70 Z" fill="#000" stroke="url(#chromeGradient)" strokeWidth="2" />
             
             {/* Art Content with Clip */}
             <g clipPath="url(#bellyClipLocal)">
                 {/* 1. Background Fill */}
                 <rect x="0" y="0" width="180" height="70" fill={islandId===3 ? '#300' : '#101'} />
                 
                 {/* 2. 1:1 PNG Asset (Center Cropped to fit wide area) */}
                 <image 
                    href={getBellyImg(islandId)}
                    x="0" y="-20" width="180" height="110" 
                    preserveAspectRatio="xMidYMid slice"
                    onError={(e) => { e.target.style.display = 'none'; }}
                 />
                 
                 {/* 3. Sticker Overlay (Character) */}
                 <g transform="translate(130, 35) scale(0.25)">
                    <CharacterSVG type={charId} stickerMode={true} />
                 </g>
                 
                 {/* 4. Text Overlay */}
                 <text x="20" y="55" fill="gold" fontSize="12" fontFamily="monospace" fontWeight="bold" style={{textShadow:'0 0 2px black'}}>
                     WIN: {stats.wins}
                 </text>
             </g>
             
             {/* Glass Reflection */}
             <path d="M0,0 L180,0 L170,70 L10,70 Z" fill="url(#glassGlare)" opacity="0.3" pointerEvents="none" />
             
             {/* Serial Plate */}
             <rect x="60" y="60" width="60" height="8" fill="silver" stroke="black" rx="1" />
             <text x="90" y="66" textAnchor="middle" fill="black" fontSize="5" fontFamily="monospace" fontWeight="bold">{displaySerial}</text>
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
        <svg width="100%" height="100%" viewBox="0 0 240 400" preserveAspectRatio="xMidYMid meet" className={`drop-shadow-2xl transition-transform duration-300 ${mode==='hall' ? 'group-hover:-translate-y-2' : ''}`}>
            {renderDefs()}
            <ellipse cx="120" cy="395" rx="100" ry="10" fill="#000" opacity="0.6" filter="blur(6px)" />
            {renderChassis()}
            {renderTopper()}
            {renderScreenArea()} 
            {renderButtonDeck()}
            {renderBellyGlass()}
            {renderCoinTray()}
            {mode === 'hall' && isBusy && occupantPetId && <g transform="translate(80, 260) scale(0.35)"><CharacterSVG type={occupantPetId} mood="idle" /></g>}
            
            {/* Overall Glare */}
            <path d="M10,40 L230,40 L240,400 L0,400 Z" fill="url(#glassGlare)" opacity="0.1" pointerEvents="none" style={{mixBlendMode:'screen'}} />
        </svg>
    );
};

export default memo(CabinetSVG);