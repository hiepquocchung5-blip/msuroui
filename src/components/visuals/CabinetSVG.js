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
                <stop offset="0%" stopColor="#333" />
                <stop offset="15%" stopColor="#888" />
                <stop offset="25%" stopColor="#aaa" />
                <stop offset="50%" stopColor="#fff" />
                <stop offset="75%" stopColor="#aaa" />
                <stop offset="100%" stopColor="#333" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#B8860B" />
                <stop offset="40%" stopColor="#FFD700" />
                <stop offset="60%" stopColor="#FFFACD" />
                <stop offset="100%" stopColor="#DAA520" />
            </linearGradient>
            <linearGradient id="darkPlastic" x1="0" y1="0" x2="1" y2="0">
                 <stop offset="0%" stopColor="#1a1a1a"/>
                 <stop offset="20%" stopColor="#333"/>
                 <stop offset="50%" stopColor="#222"/>
                 <stop offset="80%" stopColor="#333"/>
                 <stop offset="100%" stopColor="#1a1a1a"/>
            </linearGradient>
            
            {/* GLASS EFFECTS */}
            <linearGradient id="glassGlare" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="40%" stopColor="rgba(255,255,255,0.2)" />
                <stop offset="45%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>

            {/* LED DIGITS */}
            <filter id="ledGlow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>

            {/* SPEAKER MESH */}
            <pattern id="speakerMesh" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="4" height="4" fill="#111"/>
                <circle cx="2" cy="2" r="1.5" fill="#333" />
            </pattern>
            
            {/* --- ISLAND THEME SKINS --- */}
            {/* 1. Vegas (Red/Gold) */}
            <linearGradient id="skinVegas" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#500"/><stop offset="50%" stopColor="#900"/><stop offset="100%" stopColor="#500"/></linearGradient>
            {/* 2. Aloha (Wood) */}
            <linearGradient id="skinAloha" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#5D4037"/><stop offset="50%" stopColor="#8D6E63"/><stop offset="100%" stopColor="#5D4037"/></linearGradient>
            {/* 3. Inferna (Magma) */}
            <linearGradient id="skinMagma" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#300"/><stop offset="50%" stopColor="#800"/><stop offset="100%" stopColor="#f00"/></linearGradient>
            {/* 4. Noctyra (Purple) */}
            <linearGradient id="skinNoctyra" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#2d1b4e"/><stop offset="50%" stopColor="#4834d4"/><stop offset="100%" stopColor="#2d1b4e"/></linearGradient>
            {/* 5. Glacia (Ice) */}
            <linearGradient id="skinGlacia" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#a2d9ff"/><stop offset="50%" stopColor="#e0ffff"/><stop offset="100%" stopColor="#a2d9ff"/></linearGradient>
            {/* 6. Sky (White/Gold) */}
            <linearGradient id="skinSky" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#bdc3c7"/><stop offset="50%" stopColor="#ffffff"/><stop offset="100%" stopColor="#bdc3c7"/></linearGradient>
            {/* 7. Bio (Green) */}
            <linearGradient id="skinBio" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#1e8449"/><stop offset="50%" stopColor="#2ecc71"/><stop offset="100%" stopColor="#1e8449"/></linearGradient>
            {/* 8. Cyber (Teal/Black) */}
            <linearGradient id="skinCyber" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#2c3e50"/><stop offset="50%" stopColor="#34495e"/><stop offset="100%" stopColor="#2c3e50"/></linearGradient>
            {/* 9. Gold (Bronze) */}
            <linearGradient id="skinGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#cd6133"/><stop offset="50%" stopColor="#e17055"/><stop offset="100%" stopColor="#cd6133"/></linearGradient>
            {/* 10. Void (Black) */}
            <linearGradient id="skinVoid" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#000000"/><stop offset="50%" stopColor="#333"/><stop offset="100%" stopColor="#000000"/></linearGradient>
        </defs>
    );

    // --- 2. CABINET HOUSING ---
    const renderHousing = () => {
        const themes = [null, 'skinVegas', 'skinAloha', 'skinMagma', 'skinNoctyra', 'skinGlacia', 'skinSky', 'skinBio', 'skinCyber', 'skinGold', 'skinVoid'];
        const fillUrl = `url(#${themes[islandId] || 'darkPlastic'})`;
        const accentColor = isHot ? '#FFD700' : (islandId === 3 ? '#FF4500' : '#00F3FF');

        return (
            <g>
                {/* Main Body with Curves */}
                <path d="M10,40 Q120,20 230,40 L240,400 L0,400 Z" fill={fillUrl} stroke="#111" strokeWidth="1" />
                
                {/* Chrome Trim Lines */}
                <path d="M15,45 L15,395" stroke="url(#chromeGradient)" strokeWidth="2" opacity="0.5" />
                <path d="M225,45 L225,395" stroke="url(#chromeGradient)" strokeWidth="2" opacity="0.5" />

                {/* Neon Strips */}
                <path d="M20,50 L20,350" stroke={accentColor} strokeWidth="3" className="animate-pulse" filter="url(#ledGlow)" opacity="0.8"/>
                <path d="M220,50 L220,350" stroke={accentColor} strokeWidth="3" className="animate-pulse" filter="url(#ledGlow)" opacity="0.8"/>

                {/* Speaker Housings (Top Ears) */}
                <path d="M5,40 L50,40 L45,70 L10,70 Z" fill="url(#speakerMesh)" stroke="#222" />
                <path d="M235,40 L190,40 L195,70 L230,70 Z" fill="url(#speakerMesh)" stroke="#222" />
            </g>
        );
    };

    // --- 3. TOPPER (Data Counter & Manual) ---
    const renderTopper = () => (
        <g transform="translate(45, 5)">
            {/* Device Box */}
            <rect x="0" y="0" width="150" height="35" fill="#080808" stroke="#333" rx="3" />
            
            {/* LED Display Area */}
            <g transform="translate(10, 5)">
                <rect x="0" y="0" width="80" height="25" fill="#220000" />
                <text x="75" y="20" textAnchor="end" fill="red" fontSize="14" fontFamily="monospace" fontWeight="bold" filter="url(#ledGlow)">
                    {stats?.laps || 0}
                </text>
                <text x="5" y="8" fill="#500" fontSize="5" fontWeight="bold">SPINS</text>
            </g>
            
            {/* "Manual" / Promo Area */}
            <g transform="translate(95, 2)">
                <rect x="0" y="0" width="45" height="31" fill="#222" stroke="#444" />
                {/* Simulated PNG/Art */}
                <rect x="2" y="2" width="41" height="27" fill={isHot ? 'gold' : '#444'} />
                <text x="22" y="18" textAnchor="middle" fill="#000" fontSize="5" fontWeight="bold">BONUS</text>
            </g>

            {/* Status Lights */}
            <circle cx="5" cy="5" r="2" fill={isBroken ? 'red' : '#300'} />
            <circle cx="145" cy="5" r="2" fill={isHot ? 'yellow' : '#330'} className={isHot ? 'animate-pulse' : ''} />
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
                    <text x="120" y="220" textAnchor="middle" fill="#555" fontSize="6" fontFamily="monospace">{displaySerial}</text>
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
                <text x="80" y="200" textAnchor="middle" fill="#555" fontSize="6" fontFamily="monospace">{displaySerial}</text>
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
             
             {/* Deck Texture */}
             <rect x="15" y="5" width="160" height="40" fill="#000" opacity="0.2" rx="4" />
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
                 <text x="15" y="25" fill="#FFF" fontSize="12" fontWeight="black" style={{textShadow:'0 0 5px white'}}>
                     BIG BONUS
                 </text>
                 <text x="15" y="45" fill="gold" fontSize="10" fontFamily="monospace">
                     WIN: {stats.wins}
                 </text>
             </g>
             
             {/* Glare */}
             <path d="M0,0 L180,0 L170,70 L10,70 Z" fill="url(#glassGlare)" opacity="0.3" pointerEvents="none" />
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
            
            {/* Floor Shadow */}
            <ellipse cx="120" cy="390" rx="110" ry="12" fill="#000" opacity="0.6" filter="blur(6px)" />
            
            {renderHousing()}
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

export default CabinetSVG;