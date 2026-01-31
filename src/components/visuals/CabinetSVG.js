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
            {/* COMMON METALS */}
            <linearGradient id="chromeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#444" />
                <stop offset="50%" stopColor="#fff" />
                <stop offset="100%" stopColor="#444" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#BF953F" />
                <stop offset="50%" stopColor="#FCF6BA" />
                <stop offset="100%" stopColor="#AA771C" />
            </linearGradient>
            
            {/* ISLAND SPECIFIC TEXTURES */}
            <linearGradient id="skinVegas" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#800000"/><stop offset="50%" stopColor="#ff0000"/><stop offset="100%" stopColor="#800000"/></linearGradient>
            <linearGradient id="skinAloha" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#5D4037"/><stop offset="50%" stopColor="#8D6E63"/><stop offset="100%" stopColor="#5D4037"/></linearGradient>
            <linearGradient id="skinMagma" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#220000"/><stop offset="50%" stopColor="#550000"/><stop offset="100%" stopColor="#110000"/></linearGradient>
            <linearGradient id="skinNoctyra" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#2d1b4e"/><stop offset="50%" stopColor="#4834d4"/><stop offset="100%" stopColor="#191919"/></linearGradient>
            <linearGradient id="skinGlacia" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#dff9fb"/><stop offset="50%" stopColor="#81ecec"/><stop offset="100%" stopColor="#00cec9"/></linearGradient>
            <linearGradient id="skinSky" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#dfe6e9"/><stop offset="50%" stopColor="#ffffff"/><stop offset="100%" stopColor="#b2bec3"/></linearGradient>
            <linearGradient id="skinBio" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#2d3436"/><stop offset="50%" stopColor="#636e72"/><stop offset="100%" stopColor="#2d3436"/></linearGradient>
            <linearGradient id="skinCyber" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2c3e50"/><stop offset="50%" stopColor="#34495e"/><stop offset="100%" stopColor="#2c3e50"/></linearGradient>
            <linearGradient id="skinGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#cd6133"/><stop offset="50%" stopColor="#e17055"/><stop offset="100%" stopColor="#cd6133"/></linearGradient>
            <linearGradient id="skinVoid" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#000000"/><stop offset="50%" stopColor="#2d1b4e"/><stop offset="100%" stopColor="#000000"/></linearGradient>

            <pattern id="grill" width="4" height="4" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#000" opacity="0.3"/>
            </pattern>
            
            <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            
            {/* REEL GRADIENT */}
            <linearGradient id="reelCylinder" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000" stopOpacity="0.6"/>
                <stop offset="20%" stopColor="#000" stopOpacity="0.1"/>
                <stop offset="50%" stopColor="#fff" stopOpacity="0.1"/>
                <stop offset="80%" stopColor="#000" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#000" stopOpacity="0.6"/>
            </linearGradient>
        </defs>
    );

    // --- 2. CABINET FRAME (Pachislo Style) ---
    const renderCabinetFrame = () => {
        switch(islandId) {
            case 1: // VEGAS: Classic Red & Chrome
                return (
                    <g>
                        <path d="M20,20 L220,20 L220,380 L20,380 Z" fill="url(#skinVegas)" stroke="url(#chromeGradient)" strokeWidth="4" />
                        <rect x="25" y="25" width="10" height="350" fill="#300" opacity="0.5" />
                        <rect x="205" y="25" width="10" height="350" fill="#300" opacity="0.5" />
                        {/* Flashing Bulbs */}
                        <circle cx="10" cy="50" r="4" fill="yellow" className="animate-pulse" filter="url(#glow)" />
                        <circle cx="230" cy="50" r="4" fill="yellow" className="animate-pulse" filter="url(#glow)" />
                    </g>
                );
            case 2: // ALOHA: Bamboo Frame
                return (
                    <g>
                        <rect x="20" y="20" width="200" height="360" fill="url(#skinAloha)" />
                        {/* Bamboo columns */}
                        <rect x="10" y="15" width="15" height="370" fill="#a1887f" stroke="#5d4037" rx="5" />
                        <rect x="215" y="15" width="15" height="370" fill="#a1887f" stroke="#5d4037" rx="5" />
                        <path d="M10,15 L230,15 L220,50 L20,50 Z" fill="#5d4037" />
                    </g>
                );
            case 3: // INFERNA: Magma Rock
                return (
                    <g>
                        <path d="M15,20 L225,20 L230,380 L10,380 Z" fill="url(#skinMagma)" stroke="#333" strokeWidth="2" />
                        {/* Cracks */}
                        <path d="M20,60 L50,100 L40,140 M200,300 L180,250" fill="none" stroke="#ff4500" strokeWidth="2" filter="url(#glow)" className="animate-pulse" />
                    </g>
                );
            case 4: // NOCTYRA: Gothic Coffin Shape
                return (
                    <g>
                        <path d="M30,50 L120,10 L210,50 L210,380 L30,380 Z" fill="url(#skinNoctyra)" stroke="#000" strokeWidth="3" />
                        <path d="M120,10 L120,380" stroke="#000" strokeWidth="2" opacity="0.3" />
                        <circle cx="120" cy="50" r="15" fill="#4834d4" stroke="#fff" strokeWidth="1" filter="url(#glow)" />
                    </g>
                );
            case 5: // GLACIA: Ice Block
                return (
                    <g>
                         <path d="M20,20 L220,20 L220,380 L20,380 Z" fill="url(#skinGlacia)" opacity="0.9" />
                         <path d="M20,20 L60,60 M220,20 L180,60 M20,380 L60,340 M220,380 L180,340" stroke="white" strokeWidth="2" opacity="0.6" />
                         <rect x="60" y="60" width="120" height="280" fill="none" stroke="white" strokeWidth="1" opacity="0.4" />
                    </g>
                );
            case 6: // SKY: Marble Pillar
                return (
                    <g>
                        <rect x="25" y="20" width="190" height="360" fill="url(#skinSky)" />
                        {/* Pillars */}
                        <rect x="15" y="20" width="15" height="360" fill="#fff" stroke="#b2bec3" />
                        <rect x="210" y="20" width="15" height="360" fill="#fff" stroke="#b2bec3" />
                        <circle cx="120" cy="40" r="20" fill="none" stroke="#fab1a0" strokeWidth="3" />
                    </g>
                );
            case 7: // BIO: Mossy Stone
                return (
                    <g>
                        <path d="M15,20 Q120,5 225,20 L230,380 L10,380 Z" fill="url(#skinBio)" stroke="#2d3436" strokeWidth="2" />
                        <path d="M15,20 Q60,100 15,200 M225,20 Q180,100 225,200" fill="none" stroke="#55efc4" strokeWidth="3" opacity="0.5" />
                        <circle cx="50" cy="300" r="3" fill="#00b894" filter="url(#glow)" className="animate-pulse" />
                    </g>
                );
            case 8: // CYBER: Industrial
                return (
                    <g>
                         <rect x="20" y="20" width="200" height="360" fill="url(#skinCyber)" stroke="#000" strokeWidth="2" />
                         <path d="M20,30 L220,30" stroke="yellow" strokeWidth="2" strokeDasharray="10,10" />
                         <path d="M20,370 L220,370" stroke="yellow" strokeWidth="2" strokeDasharray="10,10" />
                         <text x="120" y="360" textAnchor="middle" fill="yellow" fontSize="8" fontFamily="monospace">CAUTION</text>
                    </g>
                );
            case 9: // GOLD: Steampunk
                return (
                    <g>
                        <rect x="20" y="20" width="200" height="360" fill="url(#skinGold)" stroke="#b33939" strokeWidth="3" />
                        <circle cx="30" cy="30" r="8" fill="#d35400" stroke="#000" />
                        <circle cx="210" cy="30" r="8" fill="#d35400" stroke="#000" />
                        {/* Gears */}
                        <path d="M40,350 L70,350 L70,380 L40,380 Z" fill="none" stroke="#2d3436" strokeWidth="2" />
                    </g>
                );
            case 10: // VOID: Monolith
                return (
                    <g>
                        <rect x="20" y="20" width="200" height="360" fill="url(#skinVoid)" stroke="#6c5ce7" strokeWidth="2" />
                        <circle cx="120" cy="200" r="80" fill="none" stroke="#a29bfe" strokeWidth="1" className="animate-ping" opacity="0.2" />
                    </g>
                );
            default: return <rect x="20" y="20" width="200" height="360" fill="#333" />;
        }
    };

    // --- 3. COMPONENTS ---
    const renderTopper = () => {
        // Japanese machines often have a battle counter or art on top
        return (
            <g transform="translate(40, 5)">
                 <path d="M0,15 L160,15 L150,0 L10,0 Z" fill="#111" stroke="#333" />
                 {/* Status Lights (Candle) */}
                 <rect x="75" y="-10" width="10" height="15" fill={isBroken ? "red" : (isHot ? "yellow" : "transparent")} stroke="#000" strokeWidth="0.5" className="animate-pulse" />
                 <text x="80" y="10" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">DATA</text>
            </g>
        );
    };

    const renderSpeakers = () => (
        <g>
            <rect x="30" y="30" width="30" height="30" fill="url(#grill)" />
            <rect x="180" y="30" width="30" height="30" fill="url(#grill)" />
        </g>
    );

    const renderBellyGlass = () => (
        <g transform="translate(40, 240)">
             <rect x="0" y="0" width="160" height="100" fill="#000" stroke="#333" rx="2" />
             {/* Character Art */}
             <g transform="translate(130, 50) scale(0.25)">
                <CharacterSVG type={charId} stickerMode={true} />
             </g>
             {/* Text */}
             <text x="10" y="20" fill="#fff" fontSize="14" fontWeight="bold" style={{textShadow: '0 0 5px white'}}>PACHISLO</text>
             <text x="10" y="35" fill="gold" fontSize="10" fontFamily="monospace">JP: {(5000000 + stats.laps*10).toLocaleString()}</text>
             
             {/* Coin Chute */}
             <rect x="60" y="80" width="40" height="10" fill="#222" stroke="#555" rx="5" />
        </g>
    );
    
    const renderButtonDeck = () => (
         <g transform="translate(15, 210)">
             {/* Slanted Deck */}
             <path d="M0,0 L210,0 L225,30 L-15,30 Z" fill="url(#chromeGradient)" stroke="#111" />
             {/* Buttons (Visual only, mapped to HTML in PlayView) */}
             <ellipse cx="30" cy="15" rx="15" ry="8" fill="#c0392b" stroke="#000" />
             <ellipse cx="105" cy="15" rx="30" ry="10" fill="#ecf0f1" stroke="#000" />
             <ellipse cx="180" cy="15" rx="15" ry="8" fill="#2980b9" stroke="#000" />
         </g>
    );

    const renderCoinTray = () => (
        <g transform="translate(0, 360)">
            <path d="M20,0 Q120,10 220,0 L220,40 Q120,50 20,40 Z" fill="url(#chromeGradient)" stroke="#000" />
            <rect x="30" y="10" width="180" height="20" rx="2" fill="#111" opacity="0.8" />
            {/* Coins */}
            {isHot && <circle cx="50" cy="20" r="5" fill="gold" stroke="orange" />}
        </g>
    );

    // --- 4. SCREEN LAYERS ---
    const renderScreen = () => {
        if (mode === 'game') return null; // Transparent in game mode
        
        return (
            <g transform="translate(40, 85)">
                <rect x="0" y="0" width="160" height="110" fill={isBusy ? '#2c3e50' : '#000'} />
                {/* Reels */}
                <g>
                    <rect x="10" y="10" width="40" height="90" fill="#fff" />
                    <rect x="10" y="10" width="40" height="90" fill="url(#cylinderShine)" />
                    
                    <rect x="60" y="10" width="40" height="90" fill="#fff" />
                    <rect x="60" y="10" width="40" height="90" fill="url(#cylinderShine)" />
                    
                    <rect x="110" y="10" width="40" height="90" fill="#fff" />
                    <rect x="110" y="10" width="40" height="90" fill="url(#cylinderShine)" />
                </g>
                <text x="80" y="60" textAnchor="middle" fill={isBusy ? '#e74c3c' : '#2ecc71'} fontSize="16" fontWeight="bold">
                    {isBusy ? 'PLAYING' : 'START'}
                </text>
            </g>
        );
    }
    
    // --- MAIN RENDER ---
    // Game Mode: Render Frame, Topper, Deck, Belly. Leave screen transparent.
    if (mode === 'game') {
        return (
             <div className="absolute inset-0 z-0 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 240 400" preserveAspectRatio="none">
                    {renderDefs()}
                    {renderCabinetFrame()}
                    {renderTopper()}
                    {renderSpeakers()}
                    {renderButtonDeck()}
                    {renderBellyGlass()}
                    {renderCoinTray()}
                    
                    {/* Bezel Overlay for React Reels */}
                    <path d="M40,85 H200 V195 H40 Z M15,20 H225 V380 H15 Z" fill="rgba(0,0,0,0.8)" fillRule="evenodd" />
                    
                    {/* Glass Glare */}
                    <path d="M40,85 L100,85 L80,195 L40,195 Z" fill="white" opacity="0.1" />
                    
                    {/* Serial */}
                    <text x="120" y="395" textAnchor="middle" fill="#555" fontSize="6" fontFamily="monospace">{displaySerial}</text>
                </svg>
            </div>
        );
    }

    // Hall Mode: Render Full Cabinet
    return (
        <svg width="240" height="400" viewBox="0 0 240 400" className={`drop-shadow-2xl transition-transform group-hover:-translate-y-2 duration-300 ${isBroken ? 'animate-pulse' : ''}`}>
            {renderDefs()}
            
            {/* Shadow */}
            <ellipse cx="120" cy="390" rx="100" ry="10" fill="#000" opacity="0.6" filter="blur(5px)" />
            
            {renderCabinetFrame()}
            {renderTopper()}
            {renderSpeakers()}
            {renderScreen()}
            {renderButtonDeck()}
            {renderBellyGlass()}
            {renderCoinTray()}

            {/* Chair & Occupant */}
            <g transform="translate(0, 30)">
                {isBusy && occupantPetId && (
                    <g transform="translate(80, 250) scale(0.35)">
                        <CharacterSVG type={occupantPetId} mood="idle" />
                    </g>
                )}
                <path d="M60,350 L180,350 L190,380 L50,380 Z" fill="#111" stroke="#333" />
                <rect x="60" y="350" width="120" height="5" fill="#222" />
            </g>
            
            <text x="120" y="395" textAnchor="middle" fill="#555" fontSize="6" fontFamily="monospace">{displaySerial}</text>
        </svg>
    );
};

export default CabinetSVG;