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
            {/* COMMON METALS (Brightened for Dark Mode) */}
            <linearGradient id="chromeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#444" />
                <stop offset="15%" stopColor="#999" />
                <stop offset="25%" stopColor="#bbb" />
                <stop offset="50%" stopColor="#fff" />
                <stop offset="75%" stopColor="#999" />
                <stop offset="100%" stopColor="#444" />
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
                <stop offset="0%" stopColor="#000" stopOpacity="0.8" />
                <stop offset="20%" stopColor="#000" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#FFF" stopOpacity="0.1" />
                <stop offset="80%" stopColor="#000" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.8" />
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
            <pattern id="speakerMesh" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="4" height="4" fill="#111"/>
                <circle cx="2" cy="2" r="1.5" fill="#333" />
            </pattern>
            
            {/* ISLAND SKINS */}
            <linearGradient id="skinVegas" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#900"/><stop offset="50%" stopColor="#D00"/><stop offset="100%" stopColor="#900"/></linearGradient>
            <linearGradient id="skinMagma" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF4500"/><stop offset="100%" stopColor="#330000"/></linearGradient>
            <linearGradient id="skinAloha" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#8B4513"/><stop offset="50%" stopColor="#CD853F"/><stop offset="100%" stopColor="#8B4513"/></linearGradient>
            <linearGradient id="skinIce" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E0FFFF"/><stop offset="100%" stopColor="#00BFFF"/></linearGradient>
            <linearGradient id="skinSky" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#Eef2f3"/><stop offset="50%" stopColor="#FFFFFF"/><stop offset="100%" stopColor="#BDC3C7"/></linearGradient>
            <linearGradient id="skinBio" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#556B2F"/><stop offset="100%" stopColor="#004d00"/></linearGradient>
            <linearGradient id="skinRust" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8B4513"/><stop offset="50%" stopColor="#A0522D"/><stop offset="100%" stopColor="#5D4037"/></linearGradient>
            <linearGradient id="skinCyber" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2C3E50"/><stop offset="50%" stopColor="#34495E"/><stop offset="100%" stopColor="#2C3E50"/></linearGradient>
            <linearGradient id="skinGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#B8860B"/><stop offset="50%" stopColor="#FFD700"/><stop offset="100%" stopColor="#B8860B"/></linearGradient>
            <linearGradient id="skinVoid" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#000"/><stop offset="50%" stopColor="#4B0082"/><stop offset="100%" stopColor="#000"/></linearGradient>
            
            {/* MASKS */}
            <clipPath id="screenCutout">
                <rect x="40" y="85" width="160" height="115" rx="4" />
            </clipPath>
            <clipPath id="bellyClip">
                <rect x="0" y="0" width="160" height="60" rx="4" />
            </clipPath>
        </defs>
    );

    // --- LAYER 1: ENVIRONMENT (Shadows & Glow) ---
    const renderLayerEnvironment = () => (
        <g id="layer-env">
            <ellipse cx="120" cy="390" rx="100" ry="15" fill="black" opacity="0.6" filter="blur(8px)" />
            {isHot && <ellipse cx="120" cy="390" rx="130" ry="25" fill="url(#goldGradient)" opacity="0.4" filter="blur(15px)" className="animate-pulse" />}
        </g>
    );

    // --- LAYER 2: CABINET FRAME (The Housing) ---
    const renderLayerFrame = () => {
        // Dynamic styling based on Island
        let bodyFill = "url(#darkMetal)";
        
        switch(islandId) {
            case 1: // VEGAS (Neon/Red)
                return (
                    <g>
                        <path d="M15,20 L225,20 L235,390 L5,390 Z" fill="url(#skinVegas)" stroke="#FFD700" strokeWidth="2" />
                        <path d="M20,30 L10,380" stroke="#0FF" strokeWidth="3" className="animate-pulse" filter="url(#neonBlur)" opacity="0.9" />
                        <path d="M220,30 L230,380" stroke="#FF00FF" strokeWidth="3" className="animate-pulse" filter="url(#neonBlur)" opacity="0.9" />
                    </g>
                );
            case 2: // ALOHA (Bamboo)
                return (
                    <g>
                        <path d="M10,20 L230,20 L235,400 L5,400 Z" fill="url(#skinAloha)" stroke="#DAA520" strokeWidth="2" />
                        <rect x="5" y="20" width="15" height="380" fill="#8D6E63" rx="5" stroke="#3E2723" />
                        <rect x="220" y="20" width="15" height="380" fill="#8D6E63" rx="5" stroke="#3E2723" />
                    </g>
                );
            case 3: // MAGMA (Obsidian)
                return (
                    <g>
                        <path d="M15,20 L225,20 L235,390 L5,390 Z" fill="url(#skinMagma)" stroke="none" />
                        <path d="M20,60 L60,100 M200,300 L180,250" stroke="#FF4500" strokeWidth="3" filter="url(#neonBlur)" className="animate-pulse" />
                    </g>
                );
            case 4: // NOCTYRA (Gothic)
                 return (
                    <g>
                        <path d="M20,50 L120,10 L220,50 L220,390 L20,390 Z" fill="#2d3436" stroke="#6c5ce7" strokeWidth="2" />
                        <path d="M30,60 L30,380 M210,60 L210,380" stroke="#000" strokeWidth="4" />
                        <path d="M120,20 L120,60" stroke="#6c5ce7" strokeWidth="2" />
                    </g>
                 );
            case 5: // GLACIA (Ice)
                return (
                    <g>
                        <path d="M20,20 L220,20 L230,390 L10,390 Z" fill="url(#skinIce)" stroke="#fff" strokeWidth="1" opacity="0.9" />
                        <path d="M20,20 L80,390 M220,20 L160,390" stroke="white" strokeWidth="1" opacity="0.7" />
                        <circle cx="30" cy="40" r="2" fill="white" className="animate-ping" />
                    </g>
                );
            case 6: // SKY (Marble)
                 return (
                    <g>
                        <path d="M20,20 L220,20 L220,390 L20,390 Z" fill="url(#skinSky)" stroke="#FFD700" strokeWidth="2" />
                        <rect x="10" y="20" width="10" height="370" fill="#FFF" />
                        <rect x="220" y="20" width="10" height="370" fill="#FFF" />
                    </g>
                 );
            case 7: // BIO (Moss)
                 return (
                    <g>
                        <path d="M20,30 Q120,10 220,30 L230,390 L10,390 Z" fill="url(#skinBio)" stroke="#7CFC00" strokeWidth="3" />
                        <path d="M30,50 Q80,100 30,200" fill="none" stroke="#32CD32" strokeWidth="4" />
                        <path d="M210,300 Q160,200 210,100" fill="none" stroke="#32CD32" strokeWidth="4" />
                    </g>
                 );
            case 8: // CYBER (Rust/Tech)
                 return (
                    <g>
                        <path d="M15,20 L225,20 L225,390 L15,390 Z" fill="url(#skinCyber)" stroke="#000" strokeWidth="2" />
                        <rect x="30" y="30" width="180" height="360" fill="none" stroke="#FFFF00" strokeWidth="2" strokeDasharray="10,5" className="animate-pulse" />
                        <text x="120" y="380" textAnchor="middle" fill="yellow" fontSize="8" fontFamily="monospace">HIGH VOLTAGE</text>
                    </g>
                 );
            case 9: // GOLD (Steampunk)
                 return (
                    <g>
                        <path d="M20,20 L220,20 L220,390 L20,390 Z" fill="url(#skinGold)" stroke="#B8860B" strokeWidth="4" />
                        <circle cx="20" cy="20" r="10" fill="#B8860B" />
                        <circle cx="220" cy="20" r="10" fill="#B8860B" />
                        <path d="M20,390 L220,390" stroke="#B8860B" strokeWidth="4" strokeDasharray="5,5" />
                    </g>
                 );
            case 10: // VOID (Space)
                 return (
                    <g>
                        <path d="M30,30 L210,30 L210,380 L30,380 Z" fill="url(#skinVoid)" stroke="#8A2BE2" strokeWidth="2" />
                        <circle cx="120" cy="200" r="100" stroke="#8A2BE2" strokeWidth="2" fill="none" opacity="0.8" className="animate-pulse" />
                    </g>
                 );
            default: // Generic
                return <path d="M15,20 L225,20 L235,390 L5,390 Z" fill="url(#darkMetal)" stroke="#999" strokeWidth="2" />;
        }
    };

    // --- 3. TOPPER (Data Counter & Manual) ---
    const renderTopper = () => (
        <g transform="translate(65, -5)">
            {/* Main Unit */}
            <rect x="0" y="0" width="110" height="35" fill="#080808" stroke="#333" rx="3" />
            
            {/* LED Display Area (Spins) */}
            <g transform="translate(10, 5)">
                <rect x="0" y="0" width="80" height="25" fill="#220000" />
                <text x="75" y="20" textAnchor="end" fill="red" fontSize="14" fontFamily="monospace" fontWeight="bold" filter="url(#ledGlow)">
                    {stats?.laps || 0}
                </text>
                <text x="5" y="8" fill="#500" fontSize="5" fontWeight="bold">SPINS</text>
            </g>
            
            {/* Status Lights (Candle) */}
            <g transform="translate(95, 5)">
                <circle cx="4" cy="4" r="3" fill={isBroken ? 'red' : '#300'} className={isBroken ? "animate-pulse" : ""} />
                <circle cx="4" cy="12" r="3" fill={isHot ? 'yellow' : '#330'} className={isHot ? 'animate-pulse' : ''} />
                <circle cx="4" cy="20" r="3" fill={isBusy ? 'blue' : '#003'} className={isBusy ? "animate-pulse" : ""} />
            </g>

            {/* Guide/Manual Holder (Left Side) */}
            <g transform="translate(-20, 5)">
                 <rect x="0" y="0" width="20" height="25" fill="#222" stroke="#444" rx="1"/>
                 <text x="10" y="15" textAnchor="middle" fill="#666" fontSize="4" fontWeight="bold">INFO</text>
            </g>
        </g>
    );

    // --- 4. SCREEN BEZEL ---
    const renderScreenArea = () => {
        if (mode === 'game') {
            // Game Mode: Hollow frame
            return (
                <g>
                    {/* Bezel Frame */}
                    <path d="M40,85 H200 V205 H40 Z M10,40 H230 V380 H10 Z" fill="rgba(0,0,0,0.95)" fillRule="evenodd" />
                    {/* Chrome Inner Trim */}
                    <rect x="40" y="85" width="160" height="120" fill="none" stroke="url(#chromeGradient)" strokeWidth="4" rx="2" />
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

    // --- 5. BUTTON DECK & BELLY GLASS ---
    const renderButtonDeck = () => (
        <g transform="translate(10, 230)">
             {/* Sloped Deck Body */}
             <path d="M0,0 L220,0 L235,50 L-15,50 Z" fill="url(#chromeGradient)" stroke="#111" />
             <path d="M-15,50 L235,50 L235,70 L-15,70 Z" fill="#111" /> {/* Front Lip */}
             
             {/* Coin Slot */}
             <rect x="190" y="15" width="5" height="20" rx="2" fill="#000" stroke="#888" />
             <rect x="192" y="18" width="1" height="14" fill="#0F0" className="animate-pulse" filter="url(#neonBlur)"/>
             
             {/* START LEVER (Knob) */}
             <g transform="translate(15, 25)">
                 <circle cx="0" cy="0" r="14" fill="#111" stroke="#333" />
                 <circle cx="0" cy="0" r="10" fill="url(#chromeGradient)" />
                 <circle cx="0" cy="-6" r="12" fill="red" className={isBusy ? "" : "animate-pulse"} />
             </g>

             {/* STOP BUTTONS */}
             <g transform="translate(70, 15)">
                 <circle cx="0" cy="10" r="12" fill="#c0392b" stroke="#500" strokeWidth="2" />
                 <text x="0" y="13" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">1</text>
                 <circle cx="40" cy="10" r="12" fill="#c0392b" stroke="#500" strokeWidth="2" />
                 <text x="40" y="13" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">2</text>
                 <circle cx="80" cy="10" r="12" fill="#c0392b" stroke="#500" strokeWidth="2" />
                 <text x="80" y="13" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">3</text>
             </g>
        </g>
    );

    const renderBellyGlass = () => (
        <g transform="translate(30, 310)">
             {/* Frame */}
             <path d="M0,0 L180,0 L170,70 L10,70 Z" fill="#000" stroke="url(#chromeGradient)" strokeWidth="2" />
             
             {/* Art Area */}
             <g clipPath="url(#screenCutout)">
                 <rect x="5" y="5" width="170" height="60" fill={islandId===3 ? '#300' : '#101'} />
                 
                 {/* Character Sticker */}
                 <g transform="translate(140, 35) scale(0.25)">
                    <CharacterSVG type={charId} stickerMode={true} />
                 </g>
                 
                 {/* Text */}
                 <text x="15" y="25" fill="#FFF" fontSize="14" fontWeight="black" style={{textShadow:'0 0 5px white'}}>BIG BONUS</text>
                 <text x="15" y="45" fill="gold" fontSize="10" fontFamily="monospace">WIN: {stats.wins}</text>
             </g>
             
             {/* Glare */}
             <path d="M0,0 L180,0 L170,70 L10,70 Z" fill="url(#glassGlare)" opacity="0.3" pointerEvents="none" />
             
             {/* Serial Plate */}
             <rect x="60" y="55" width="60" height="10" fill="#silver" stroke="black" rx="1" />
             <text x="90" y="62" textAnchor="middle" fill="black" fontSize="5" fontFamily="monospace" fontWeight="bold">{displaySerial}</text>
        </g>
    );

    const renderCoinTray = () => (
        <g transform="translate(0, 380)">
             <path d="M10,0 Q120,15 230,0 L230,20 Q120,30 10,20 Z" fill="url(#chromeGradient)" stroke="#333" />
             <rect x="20" y="5" width="200" height="12" rx="5" fill="#111" opacity="0.9" />
             {isHot && <circle cx="40" cy="12" r="4" fill="gold" stroke="orange" />}
        </g>
    );

    // --- MAIN RENDER ---
    return (
        <svg width="240" height="400" viewBox="0 0 240 400" className={`drop-shadow-2xl transition-transform group-hover:-translate-y-2 duration-300 ${isBroken ? 'animate-pulse' : ''}`}>
            {renderDefs()}
            
            {/* Shadow */}
            <ellipse cx="120" cy="390" rx="110" ry="12" fill="#000" opacity="0.7" filter="blur(6px)" />
            
            {renderCabinetFrame()}
            {renderTopper()}
            {renderScreenArea()}
            {renderButtonDeck()}
            {renderBellyGlass()}
            {renderCoinTray()}

            {/* Occupant (Hall Mode) */}
            {mode === 'hall' && isBusy && occupantPetId && (
                 <g transform="translate(80, 260) scale(0.35)">
                    <CharacterSVG type={occupantPetId} mood="idle" />
                 </g>
            )}
        </svg>
    );
};

export default memo(CabinetSVG);