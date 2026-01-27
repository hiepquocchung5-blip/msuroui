import React from 'react';
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
            {/* METALS */}
            <linearGradient id="chromeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#333" />
                <stop offset="15%" stopColor="#888" />
                <stop offset="25%" stopColor="#aaa" />
                <stop offset="50%" stopColor="#fff" />
                <stop offset="75%" stopColor="#888" />
                <stop offset="100%" stopColor="#333" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#B8860B" />
                <stop offset="40%" stopColor="#FFD700" />
                <stop offset="60%" stopColor="#FFFACD" />
                <stop offset="100%" stopColor="#DAA520" />
            </linearGradient>
            <linearGradient id="darkMetal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2c3e50" />
                <stop offset="100%" stopColor="#000" />
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
                <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="45%" stopColor="rgba(255,255,255,0.2)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>
            <filter id="neonBlur">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            
            {/* ISLAND SKINS */}
            <linearGradient id="skinVegas" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#500"/><stop offset="50%" stopColor="#900"/><stop offset="100%" stopColor="#500"/></linearGradient>
            <linearGradient id="skinMagma" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF4500"/><stop offset="100%" stopColor="#220000"/></linearGradient>
            <linearGradient id="skinAloha" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#5D4037"/><stop offset="50%" stopColor="#8D6E63"/><stop offset="100%" stopColor="#5D4037"/></linearGradient>
            <linearGradient id="skinIce" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E0FFFF"/><stop offset="100%" stopColor="#00BFFF"/></linearGradient>
            <linearGradient id="skinSky" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFF"/><stop offset="50%" stopColor="#F0F8FF"/><stop offset="100%" stopColor="#B0C4DE"/></linearGradient>
            <linearGradient id="skinBio" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#556B2F"/><stop offset="100%" stopColor="#004d00"/></linearGradient>
            <linearGradient id="skinRust" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#5a3a2a"/><stop offset="50%" stopColor="#8b4513"/><stop offset="100%" stopColor="#3e2723"/></linearGradient>
            <linearGradient id="skinVoid" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#000"/><stop offset="50%" stopColor="#4B0082"/><stop offset="100%" stopColor="#000"/></linearGradient>
            
            {/* MASKS */}
            <clipPath id="screenCutout">
                <rect x="40" y="85" width="160" height="115" rx="4" />
            </clipPath>
        </defs>
    );

    // --- LAYER 1: ENVIRONMENT (Shadows & Glow) ---
    const renderLayerEnvironment = () => (
        <g id="layer-env">
            <ellipse cx="120" cy="390" rx="100" ry="15" fill="black" opacity="0.7" filter="blur(6px)" />
            {isHot && <ellipse cx="120" cy="390" rx="120" ry="20" fill="url(#goldGradient)" opacity="0.3" filter="blur(10px)" className="animate-pulse" />}
        </g>
    );

    // --- LAYER 2: CABINET FRAME (The Housing) ---
    const renderLayerFrame = () => {
        // Dynamic styling based on Island
        let bodyFill = "url(#darkMetal)";
        let trimStroke = "url(#chromeGradient)";
        
        switch(islandId) {
            case 1: // VEGAS
                return (
                    <g>
                        <path d="M15,20 L225,20 L235,390 L5,390 Z" fill="url(#skinVegas)" stroke="#FFD700" strokeWidth="2" />
                        <path d="M20,30 L10,380" stroke="#0FF" strokeWidth="2" className="animate-pulse" filter="url(#neonBlur)" opacity="0.8" />
                        <path d="M220,30 L230,380" stroke="#FF00FF" strokeWidth="2" className="animate-pulse" filter="url(#neonBlur)" opacity="0.8" />
                    </g>
                );
            case 2: // ALOHA
                return (
                    <g>
                        <path d="M10,20 L230,20 L235,400 L5,400 Z" fill="url(#skinAloha)" stroke="#DAA520" strokeWidth="2" />
                        <rect x="5" y="20" width="15" height="380" fill="#8D6E63" rx="5" stroke="#3E2723" />
                        <rect x="220" y="20" width="15" height="380" fill="#8D6E63" rx="5" stroke="#3E2723" />
                    </g>
                );
            case 3: // MAGMA
                return (
                    <g>
                        <path d="M15,20 L225,20 L235,390 L5,390 Z" fill="url(#skinMagma)" stroke="none" />
                        <path d="M20,60 L60,100 M200,300 L180,250" stroke="#FF4500" strokeWidth="2" filter="url(#neonBlur)" className="animate-pulse" />
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
                        <path d="M15,20 L225,20 L225,390 L15,390 Z" fill="url(#skinRust)" stroke="#000" strokeWidth="2" />
                        <rect x="30" y="30" width="180" height="360" fill="none" stroke="#FFFF00" strokeWidth="2" strokeDasharray="10,5" className="animate-pulse" />
                        <text x="120" y="380" textAnchor="middle" fill="yellow" fontSize="8" fontFamily="monospace">HIGH VOLTAGE</text>
                    </g>
                 );
            case 9: // GOLD (Steampunk)
                 return (
                    <g>
                        <path d="M20,20 L220,20 L220,390 L20,390 Z" fill="#3E2723" stroke="#B8860B" strokeWidth="4" />
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

    // --- NEW: LIGHT TOWER (Status Candle) ---
    const renderCandle = () => (
        <g transform="translate(195, -5)">
            <rect x="-4" y="0" width="8" height="20" fill="#111" />
            <rect x="-6" y="2" width="12" height="5" rx="1" fill={isBroken ? "#F00" : "#300"} className={isBroken ? "animate-pulse" : ""} stroke="#000" strokeWidth="0.5"/>
            <rect x="-6" y="8" width="12" height="5" rx="1" fill={isHot ? "#FF0" : "#330"} className={isHot ? "animate-pulse" : ""} stroke="#000" strokeWidth="0.5"/>
            <rect x="-6" y="14" width="12" height="5" rx="1" fill={isBusy ? "#00F" : (visualState==='FREE' ? "#0F0" : "#030")} className="animate-pulse" stroke="#000" strokeWidth="0.5"/>
        </g>
    );

    // --- NEW: COIN TRAY ---
    const renderCoinTray = () => (
        <g transform="translate(0, 380)">
             <path d="M20,0 Q120,10 220,0 L220,15 Q120,25 20,15 Z" fill="url(#chromeGradient)" stroke="#333" strokeWidth="1"/>
             <rect x="30" y="5" width="180" height="5" rx="2" fill="#111" opacity="0.6" />
        </g>
    );

    // --- NEW: SPEAKER GRILLS ---
    const renderSpeakers = () => (
        <g>
            <path d="M25,35 L60,35 L55,70 L30,70 Z" fill="url(#speakerPattern)" opacity="0.6"/>
            <path d="M180,35 L215,35 L210,70 L185,70 Z" fill="url(#speakerPattern)" opacity="0.6"/>
        </g>
    );

    // --- LAYER 3: BACKLIGHT / PANEL (Screen Area) ---
    const renderLayerScreen = () => {
        // In Game Mode, we only render the "Hole" where React reels go
        if (mode === 'game') return null;

        // In Hall Mode, we simulate reels (cylindrical effect)
        return (
            <g id="layer-screen" transform="translate(40, 90)">
                 <rect x="0" y="0" width="160" height="110" fill={isBusy ? '#220000' : '#111'} stroke="none" />
                 
                 {/* Simulated 3D Cylinder Reels */}
                 <g>
                    <rect x="10" y="10" width="40" height="90" fill="url(#chromeGradient)" />
                    <rect x="10" y="10" width="40" height="90" fill="url(#cylinderShine)" opacity="0.5" />
                    
                    <rect x="60" y="10" width="40" height="90" fill="url(#chromeGradient)" />
                    <rect x="60" y="10" width="40" height="90" fill="url(#cylinderShine)" opacity="0.5" />
                    
                    <rect x="110" y="10" width="40" height="90" fill="url(#chromeGradient)" />
                    <rect x="110" y="10" width="40" height="90" fill="url(#cylinderShine)" opacity="0.5" />
                 </g>

                 {/* Screen Text */}
                 <text x="80" y="60" textAnchor="middle" fill={isBusy ? '#F00' : (isBroken ? '#FFA500' : '#0F0')} fontWeight="bold" fontSize="18" className={!isBusy && !isBroken ? 'animate-pulse' : ''} style={{textShadow: '0 0 10px currentColor'}}>
                      {isBroken ? 'ERROR' : (isBusy ? 'PLAYING' : 'OPEN')}
                 </text>
                 {isBusy && <text x="80" y="80" textAnchor="middle" fill="#700" fontSize="8">OCCUPIED</text>}
            </g>
        );
    };

    // --- LAYER 5: MASK / BEZEL / DASHBOARD / BUTTONS ---
    const renderLayerMask = () => {
        const titles = ['','VEGAS','ALOHA','MAGMA','NIGHT','GLACIA','SKY','BIO','CYBER','GOLD','VOID'];
        return (
            <g id="layer-mask">
                {/* 1. Header Marquee */}
                <g transform="translate(30, 25)">
                    <path d="M0,0 L180,0 L175,45 L5,45 Z" fill="#111" stroke="#444" strokeWidth="2" />
                    <rect x="10" y="5" width="160" height="35" rx="2" fill="#000" />
                    <text x="90" y="28" textAnchor="middle" fill="#FFF" fontWeight="900" fontSize="16" letterSpacing="3" filter="url(#neonBlur)">
                        {titles[islandId] || 'SLOT'}
                    </text>
                    <circle cx="15" cy="22" r="3" fill="yellow" className="animate-pulse" />
                    <circle cx="165" cy="22" r="3" fill="yellow" className="animate-pulse" style={{animationDelay: '0.5s'}} />
                </g>

                {/* 2. Screen Bezel */}
                <path d="M30,75 L210,75 L210,210 L30,210 Z M40,85 L200,85 L200,200 L40,200 Z" fill="#111" stroke="#333" strokeWidth="2" fillRule="evenodd" />

                {/* 3. Button Deck (Protrudes) */}
                <g transform="translate(10, 240)">
                    <path d="M10,0 L210,0 L230,50 L-10,50 Z" fill="url(#chromeGradient)" stroke="#444" />
                    <rect x="-10" y="50" width="240" height="20" fill="#333" />
                    
                    {/* SVG Buttons removed in Game Mode to allow HTML overlay, but kept for Hall mode visuals */}
                    {mode !== 'game' && (
                        <>
                            <g transform="translate(40, 15)">
                                <ellipse cx="0" cy="0" rx="20" ry="12" fill="#900" stroke="#500" strokeWidth="2" className="animate-pulse" />
                                <ellipse cx="0" cy="-3" rx="18" ry="10" fill="red" />
                                <text x="0" y="2" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">BET</text>
                            </g>
                            <g transform="translate(110, 15)">
                                <ellipse cx="0" cy="0" rx="30" ry="15" fill="#DDD" stroke="#999" strokeWidth="2" />
                                <ellipse cx="0" cy="-4" rx="28" ry="13" fill="#FFF" />
                                <text x="0" y="2" textAnchor="middle" fill="#000" fontSize="8" fontWeight="bold">SPIN</text>
                            </g>
                            <g transform="translate(180, 15)">
                                <ellipse cx="0" cy="0" rx="20" ry="12" fill="#111" stroke="#555" />
                                <ellipse cx="0" cy="-3" rx="18" ry="10" fill="#333" />
                                <text x="0" y="2" textAnchor="middle" fill="#FFF" fontSize="6">MAX</text>
                            </g>
                        </>
                    )}
                </g>

                {/* 4. Belly Glass & Dashboard */}
                <g transform="translate(40, 320)">
                    <rect x="0" y="0" width="160" height="60" rx="4" fill="#000" stroke="#333" />
                    
                    {/* Sticker */}
                    <g transform="translate(130, 30) scale(0.18)">
                         <CharacterSVG type={charId} stickerMode={true} />
                    </g>

                    {/* Serial Plate */}
                    <g transform="translate(10, 45)">
                        <rect width="60" height="10" fill="#AAA" stroke="black" rx="1" />
                        <text x="30" y="7" textAnchor="middle" fill="black" fontSize="5" fontFamily="monospace" fontWeight="bold">{displaySerial}</text>
                    </g>

                    {/* Stats */}
                    <text x="10" y="20" fill="gold" fontSize="8" fontWeight="bold" fontFamily="monospace">JP: {(5000000 + stats.laps*50).toLocaleString()}</text>
                    <text x="10" y="32" fill="#0F0" fontSize="8" fontWeight="bold" fontFamily="monospace">WINS: {stats.wins}</text>
                </g>
            </g>
        );
    };

    // --- LAYER 6: FX (Occupant & Lights) ---
    const renderLayerFX = () => (
        <g id="layer-fx">
             {/* Occupant (Other Player) */}
            {isBusy && occupantPetId && (
                <g transform="translate(80, 290) scale(0.35)">
                    <CharacterSVG type={occupantPetId} mood="idle" />
                </g>
            )}

            {/* Chair */}
            <g transform="translate(0, 20)">
                 <path d="M60,370 L180,370 L190,390 L50,390 Z" fill="#050505" stroke="#222" />
                 <rect x="60" y="370" width="120" height="5" fill="#222" />
            </g>
        </g>
    );

    // --- LAYER 7: GLASS (Reflections) ---
    const renderLayerGlass = () => (
        <g id="layer-glass" pointerEvents="none">
             {/* Main Screen Reflection */}
             <path d="M40,85 L200,85 L200,200 L40,200 Z" fill="url(#glassGlare)" style={{mixBlendMode: 'screen'}} opacity="0.4" />
             {/* Belly Glass Reflection */}
             <path d="M40,320 L200,320 L200,380 L40,380 Z" fill="url(#glassGlare)" style={{mixBlendMode: 'screen'}} opacity="0.3" />
             
             {/* Hot Effect */}
             {isHot && <rect x="0" y="0" width="240" height="400" fill="white" opacity="0" className="animate-ping" style={{animationDuration: '2s'}} />}
        </g>
    );

    // --- MAIN RENDER ---
    if (mode === 'game') {
        // Game Mode: Only Frame, Mask, Glass (Hollow Center for Reels)
        // Note: Cabinet body is dimmed to focus on reels
        return (
            <div className="absolute inset-0 z-0 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 240 400" preserveAspectRatio="none">
                    {renderDefs()}
                    {renderLayerEnvironment()}
                    
                    {/* Dimmed Background Layers */}
                    <g opacity="0.5">
                        {renderLayerFrame()}
                        {renderCandle()}
                        {renderSpeakers()}
                    </g>
                    
                    {/* Active Layers */}
                    {renderLayerMask()}
                    
                    {/* Extra Bezel Occlusion for Game Mode */}
                    <path d="M40,85 H200 V200 H40 Z M0,0 H240 V400 H0 Z" fill="rgba(0,0,0,0.9)" fillRule="evenodd" />
                    
                    {/* Dimming Overlay for non-screen areas */}
                    <path d="M40,85 H200 V200 H40 Z M0,0 H240 V400 H0 Z" fill="black" fillOpacity="0.4" fillRule="evenodd" />
                    
                    {/* Dimming Overlay for screen UI */}
                    <rect x="40" y="85" width="160" height="115" fill="black" fillOpacity="0.3" />
                    
                    {renderLayerFX()}
                    {renderLayerGlass()}
                    
                    <g opacity="0.5">
                        {renderCoinTray()}
                    </g>
                </svg>
            </div>
        );
    }

    return (
        <svg width="240" height="400" viewBox="0 0 240 400" className={`drop-shadow-2xl transition-transform group-hover:-translate-y-4 duration-300 ${isBroken ? 'animate-pulse' : ''}`}>
            {renderDefs()}
            {renderLayerEnvironment()}
            {renderLayerFrame()}
            {renderCandle()}
            {renderSpeakers()}
            {renderLayerScreen()}
            {renderLayerMask()}
            {renderLayerFX()}
            {renderLayerGlass()}
            {renderCoinTray()}
        </svg>
    );
};

export default CabinetSVG;