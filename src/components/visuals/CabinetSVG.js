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
            {/* CORE MATERIALS */}
            <linearGradient id="chromeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#333" />
                <stop offset="15%" stopColor="#999" />
                <stop offset="50%" stopColor="#fff" />
                <stop offset="85%" stopColor="#999" />
                <stop offset="100%" stopColor="#333" />
            </linearGradient>
            
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#B8860B" />
                <stop offset="40%" stopColor="#FFD700" />
                <stop offset="60%" stopColor="#FFFACD" />
                <stop offset="100%" stopColor="#DAA520" />
            </linearGradient>
            
            <linearGradient id="blackPlastic" x1="0" y1="0" x2="1" y2="0">
                 <stop offset="0%" stopColor="#111"/>
                 <stop offset="20%" stopColor="#333"/>
                 <stop offset="50%" stopColor="#222"/>
                 <stop offset="80%" stopColor="#333"/>
                 <stop offset="100%" stopColor="#111"/>
            </linearGradient>
            
            {/* ISLAND SKINS (10 Unique Themes) */}
            <linearGradient id="skinVegas" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#600"/><stop offset="50%" stopColor="#D00"/><stop offset="100%" stopColor="#600"/></linearGradient>
            <linearGradient id="skinAloha" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#5D4037"/><stop offset="50%" stopColor="#8D6E63"/><stop offset="100%" stopColor="#5D4037"/></linearGradient>
            <linearGradient id="skinMagma" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#300"/><stop offset="50%" stopColor="#F00"/><stop offset="100%" stopColor="#300"/></linearGradient>
            <linearGradient id="skinNoctyra" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#1a0b2e"/><stop offset="50%" stopColor="#4834d4"/><stop offset="100%" stopColor="#1a0b2e"/></linearGradient>
            <linearGradient id="skinGlacia" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#81ecec"/><stop offset="50%" stopColor="#dff9fb"/><stop offset="100%" stopColor="#81ecec"/></linearGradient>
            <linearGradient id="skinSky" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#bdc3c7"/><stop offset="50%" stopColor="#ffffff"/><stop offset="100%" stopColor="#bdc3c7"/></linearGradient>
            <linearGradient id="skinBio" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#1e8449"/><stop offset="50%" stopColor="#2ecc71"/><stop offset="100%" stopColor="#1e8449"/></linearGradient>
            <linearGradient id="skinCyber" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2c3e50"/><stop offset="50%" stopColor="#34495e"/><stop offset="100%" stopColor="#2c3e50"/></linearGradient>
            <linearGradient id="skinGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#b8860b"/><stop offset="50%" stopColor="#f1c40f"/><stop offset="100%" stopColor="#b8860b"/></linearGradient>
            <linearGradient id="skinVoid" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#000"/><stop offset="50%" stopColor="#222"/><stop offset="100%" stopColor="#000"/></linearGradient>

            {/* PATTERNS & FX */}
            <pattern id="speakerMesh" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="4" height="4" fill="#080808"/>
                <circle cx="2" cy="2" r="1" fill="#333" />
            </pattern>
            
            <filter id="ledGlow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            
            <linearGradient id="glassGlare" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="40%" stopColor="rgba(255,255,255,0.2)" />
                <stop offset="45%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>
            
            {/* REEL CYLINDER ILLUSION */}
            <linearGradient id="cylinderShine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000" stopOpacity="0.8"/>
                <stop offset="20%" stopColor="#000" stopOpacity="0.1"/>
                <stop offset="50%" stopColor="#fff" stopOpacity="0.1"/>
                <stop offset="80%" stopColor="#000" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#000" stopOpacity="0.8"/>
            </linearGradient>
            
            <clipPath id="screenCutout"><rect x="40" y="85" width="160" height="115" rx="4" /></clipPath>
            <clipPath id="bellyClip"><path d="M40,300 L200,300 L195,370 L45,370 Z" /></clipPath>
        </defs>
    );

    // --- 2. CABINET FRAME (The Housing) ---
    const renderCabinetFrame = () => {
        const themes = [null, 'skinVegas', 'skinAloha', 'skinMagma', 'skinNoctyra', 'skinGlacia', 'skinSky', 'skinBio', 'skinCyber', 'skinGold', 'skinVoid'];
        const fillUrl = `url(#${themes[islandId] || 'blackPlastic'})`;
        const accentColor = isHot ? '#FFD700' : (islandId === 3 ? '#FF4500' : '#00F3FF');

        return (
            <g>
                {/* Main Body Outline (Curved Top) */}
                <path d="M10,40 Q120,20 230,40 L240,400 L0,400 Z" fill={fillUrl} stroke="#111" strokeWidth="1" />
                
                {/* Side LED Strips */}
                <path d="M15,45 L15,360" stroke={accentColor} strokeWidth="4" className="animate-pulse" filter="url(#ledGlow)" opacity="0.8" />
                <path d="M225,45 L225,360" stroke={accentColor} strokeWidth="4" className="animate-pulse" filter="url(#ledGlow)" opacity="0.8" />

                {/* Speaker Housings (Top Ears) */}
                <path d="M5,40 L50,40 L45,70 L10,70 Z" fill="url(#speakerMesh)" stroke="#222" />
                <path d="M235,40 L190,40 L195,70 L230,70 Z" fill="url(#speakerMesh)" stroke="#222" />
                
                {/* Chrome Trim */}
                <path d="M15,45 L15,360" stroke="url(#chromeGradient)" strokeWidth="1" opacity="0.5" />
                <path d="M225,45 L225,360" stroke="url(#chromeGradient)" strokeWidth="1" opacity="0.5" />
            </g>
        );
    };

    // --- 3. TOPPER (Data Counter) ---
    const renderTopper = () => (
        <g transform="translate(65, -5)">
            {/* Device Box */}
            <rect x="0" y="0" width="110" height="35" fill="#080808" stroke="#333" rx="3" />
            
            {/* LED Display Area */}
            <g transform="translate(10, 5)">
                <rect x="0" y="0" width="80" height="25" fill="#220000" />
                <text x="75" y="20" textAnchor="end" fill="red" fontSize="14" fontFamily="monospace" fontWeight="bold" filter="url(#ledGlow)">
                    {stats?.laps || 0}
                </text>
                <text x="5" y="8" fill="#500" fontSize="5" fontWeight="bold">SPINS</text>
            </g>
            
            {/* Status Lights */}
            <g transform="translate(95, 5)">
                <circle cx="4" cy="4" r="2" fill={isBroken ? 'red' : '#300'} className={isBroken ? "animate-pulse" : ""} />
                <circle cx="4" cy="10" r="2" fill={isHot ? 'yellow' : '#330'} className={isHot ? 'animate-pulse' : ''} />
                <circle cx="4" cy="16" r="2" fill={isBusy ? 'blue' : '#003'} className={isBusy ? "animate-pulse" : ""} />
            </g>
        </g>
    );

    // --- 4. SCREEN AREA ---
    const renderScreenArea = () => {
        if (mode === 'game') {
            // Game Mode: Hollow frame for React reels
            return (
                <g>
                    {/* Bezel Frame */}
                    <path d="M40,85 H200 V205 H40 Z M10,40 H230 V380 H10 Z" fill="rgba(0,0,0,0.95)" fillRule="evenodd" />
                    {/* Chrome Inner Trim */}
                    <rect x="40" y="85" width="160" height="120" fill="none" stroke="url(#chromeGradient)" strokeWidth="4" rx="2" />
                    {/* Serial Number */}
                    <text x="120" y="215" textAnchor="middle" fill="#444" fontSize="5" fontFamily="monospace">{displaySerial}</text>
                </g>
            );
        }

        // Lobby Mode: Static Screen
        return (
            <g transform="translate(40, 85)">
                <rect x="0" y="0" width="160" height="120" fill="#000" stroke="#333" strokeWidth="2" />
                {/* Mock Reels */}
                <rect x="10" y="10" width="40" height="100" fill="url(#chromeGradient)" opacity="0.1" />
                <rect x="60" y="10" width="40" height="100" fill="url(#chromeGradient)" opacity="0.1" />
                <rect x="110" y="10" width="40" height="100" fill="url(#chromeGradient)" opacity="0.1" />
                
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
                     <circle cx="0" cy="10" r="12" fill="#c0392b" stroke="#500" strokeWidth="2" />
                     <text x="0" y="13" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">1</text>
                     <circle cx="40" cy="10" r="12" fill="#c0392b" stroke="#500" strokeWidth="2" />
                     <text x="40" y="13" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">2</text>
                     <circle cx="80" cy="10" r="12" fill="#c0392b" stroke="#500" strokeWidth="2" />
                     <text x="80" y="13" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">3</text>
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
            
            {/* Components */}
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
            
            {/* Overall Glare */}
            <path d="M20,40 L220,40 L220,390 L20,390 Z" fill="url(#glassGlare)" opacity="0.1" pointerEvents="none" style={{mixBlendMode:'screen'}} />
        </svg>
    );
};

export default memo(CabinetSVG);