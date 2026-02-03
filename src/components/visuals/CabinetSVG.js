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

    // --- 1. DEFINITIONS (Advanced Materials) ---
    const renderDefs = () => (
        <defs>
            {/* PLASTICS & METALS */}
            <linearGradient id="plasticGloss" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
            </linearGradient>
            <linearGradient id="chromeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#333" />
                <stop offset="20%" stopColor="#FFF" />
                <stop offset="50%" stopColor="#999" />
                <stop offset="80%" stopColor="#FFF" />
                <stop offset="100%" stopColor="#333" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#BF953F" />
                <stop offset="50%" stopColor="#FCF6BA" />
                <stop offset="100%" stopColor="#AA771C" />
            </linearGradient>

            {/* LIGHTING FX */}
            <filter id="ledGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            
            <pattern id="speakerMesh" width="3" height="3" patternUnits="userSpaceOnUse">
                <rect width="3" height="3" fill="#111"/>
                <circle cx="1.5" cy="1.5" r="1" fill="#333" />
            </pattern>

            {/* THEME SKINS (Base Chassis Colors) */}
            <linearGradient id="skinVegas" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#600"/><stop offset="50%" stopColor="#A00"/><stop offset="100%" stopColor="#400"/></linearGradient>
            <linearGradient id="skinMagical" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FF69B4"/><stop offset="50%" stopColor="#FFC0CB"/><stop offset="100%" stopColor="#FF1493"/></linearGradient>
            <linearGradient id="skinGothic" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#2c3e50"/><stop offset="50%" stopColor="#4ca1af"/><stop offset="100%" stopColor="#2c3e50"/></linearGradient>
            <linearGradient id="skinGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#B8860B"/><stop offset="50%" stopColor="#FFD700"/><stop offset="100%" stopColor="#B8860B"/></linearGradient>
            <linearGradient id="skinVoid" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#000"/><stop offset="50%" stopColor="#333"/><stop offset="100%" stopColor="#000"/></linearGradient>
            
            <clipPath id="screenCutout"><rect x="45" y="95" width="150" height="110" rx="4" /></clipPath>
            <clipPath id="bellyClip"><path d="M20,290 L220,290 L220,380 L20,380 Z" /></clipPath>
        </defs>
    );

    // --- 2. CHASSIS GEOMETRY (10 Variations) ---
    const renderChassis = () => {
        let path, fill, trim;
        
        switch(islandId) {
            case 1: // Vegas (Classic Red/Gold Box)
                fill = "url(#skinVegas)"; trim = "url(#goldGradient)";
                path = "M10,40 Q120,20 230,40 L230,400 L10,400 Z";
                break;
            case 6: // Sky (Magical Girl Style - Rounded Wings)
                fill = "url(#skinMagical)"; trim = "#FFF";
                return (
                    <g>
                        {/* Winged Top */}
                        <path d="M0,50 Q20,20 60,30 L180,30 Q220,20 240,50 L230,400 L10,400 Z" fill="url(#skinMagical)" stroke="#FF69B4" strokeWidth="2"/>
                        <path d="M0,50 Q20,20 60,30" fill="none" stroke="white" strokeWidth="3" />
                        <path d="M180,30 Q220,20 240,50" fill="none" stroke="white" strokeWidth="3" />
                        {/* Gem on Top */}
                        <circle cx="120" cy="25" r="15" fill="#FF00FF" stroke="white" strokeWidth="2" filter="url(#ledGlow)" className="animate-pulse"/>
                    </g>
                );
            case 9: // Gold (Industrial/Mecha)
                fill = "url(#skinGold)"; trim = "#000";
                return (
                    <g>
                        <path d="M10,20 L50,20 L60,40 L180,40 L190,20 L230,20 L240,400 L0,400 Z" fill="url(#goldGradient)" stroke="#000" strokeWidth="2"/>
                        <rect x="20" y="50" width="200" height="340" fill="#333" opacity="0.3"/>
                        <path d="M10,20 L20,400" stroke="white" strokeWidth="1" opacity="0.5"/>
                    </g>
                );
            default: // Standard Pachislo Box
                fill = "url(#skinGothic)"; trim = "url(#chromeGradient)";
                path = "M20,30 L220,30 L220,390 L20,390 Z";
        }

        return (
            <g>
                <path d={path} fill={fill} stroke={trim} strokeWidth="3" />
                {/* Side LED Strips */}
                <path d="M25,50 L25,380" stroke={isHot ? "gold" : "cyan"} strokeWidth="4" className="animate-pulse" filter="url(#ledGlow)"/>
                <path d="M215,50 L215,380" stroke={isHot ? "gold" : "magenta"} strokeWidth="4" className="animate-pulse" filter="url(#ledGlow)"/>
            </g>
        );
    };

    // --- 3. TOPPER (Data Counter) ---
    const renderTopper = () => (
        <g transform="translate(60, -10)">
            <rect x="0" y="0" width="120" height="35" fill="#111" stroke="#333" rx="4" />
            
            {/* Big LED Digits */}
            <g transform="translate(10, 5)">
                <rect x="0" y="0" width="70" height="25" fill="#200" />
                <text x="65" y="20" textAnchor="end" fill="red" fontSize="16" fontFamily="monospace" fontWeight="bold" filter="url(#ledGlow)">
                    {stats?.laps || 0}
                </text>
                <text x="5" y="8" fill="#500" fontSize="5">GAMES</text>
            </g>
            
            {/* Battle History Lamps */}
            <g transform="translate(85, 5)">
                <circle cx="5" cy="5" r="3" fill={isBroken ? 'red' : '#300'} />
                <circle cx="15" cy="5" r="3" fill={isHot ? 'yellow' : '#330'} className={isHot?'animate-pulse':''} />
                <circle cx="25" cy="5" r="3" fill={isBusy ? 'lime' : '#030'} className={isBusy?'animate-pulse':''} />
            </g>
        </g>
    );

    // --- 4. SCREEN BEZEL ---
    const renderScreen = () => {
        if (mode === 'game') {
            return (
                <g>
                    {/* Hollow frame for HTML reels */}
                    <path d="M45,95 H195 V205 H45 Z M10,30 H230 V390 H10 Z" fill="rgba(10,10,10,0.95)" fillRule="evenodd" />
                    {/* Chrome Trim */}
                    <rect x="43" y="93" width="154" height="114" fill="none" stroke="url(#chromeGradient)" strokeWidth="4" rx="2" />
                </g>
            );
        }
        return (
            <g transform="translate(45, 95)">
                <rect x="0" y="0" width="150" height="110" fill="#000" stroke="#333" strokeWidth="2" />
                {/* Simulated Reels */}
                <rect x="10" y="10" width="40" height="90" fill="url(#chromeGradient)" opacity="0.1"/>
                <rect x="55" y="10" width="40" height="90" fill="url(#chromeGradient)" opacity="0.1"/>
                <rect x="100" y="10" width="40" height="90" fill="url(#chromeGradient)" opacity="0.1"/>
                <text x="75" y="60" textAnchor="middle" fill={isBusy ? 'red' : 'green'} fontSize="14" fontWeight="bold">{isBusy ? 'PLAY' : 'IDLE'}</text>
            </g>
        );
    };

    // --- 5. CONTROL DECK (Pachislo Style) ---
    const renderControls = () => (
        <g transform="translate(10, 220)">
            {/* Slanted Table */}
            <path d="M0,0 L220,0 L235,60 L-15,60 Z" fill="url(#chromeGradient)" stroke="#111" />
            <path d="M-15,60 L235,60 L235,75 L-15,75 Z" fill="#222" />
            
            {/* START LEVER (The Knob) */}
            <g transform="translate(20, 30)">
                <circle cx="0" cy="0" r="16" fill="#111" stroke="#333" strokeWidth="2" />
                <circle cx="0" cy="0" r="12" fill="silver" />
                <circle cx="0" cy="-8" r="12" fill="red" className={!isBusy ? "animate-pulse" : ""} /> {/* The Ball */}
            </g>

            {/* STOP BUTTONS (3 Buttons) */}
            <g transform="translate(75, 20)">
                {/* Button 1 */}
                <g>
                    <circle cx="0" cy="10" r="14" fill="#c0392b" stroke="#333" strokeWidth="2" />
                    <text x="0" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">STOP</text>
                </g>
                {/* Button 2 */}
                <g transform="translate(35, 0)">
                    <circle cx="0" cy="10" r="14" fill="#c0392b" stroke="#333" strokeWidth="2" />
                    <text x="0" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">STOP</text>
                </g>
                {/* Button 3 */}
                <g transform="translate(70, 0)">
                    <circle cx="0" cy="10" r="14" fill="#c0392b" stroke="#333" strokeWidth="2" />
                    <text x="0" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">STOP</text>
                </g>
            </g>

            {/* Coin Slot */}
            <rect x="195" y="15" width="5" height="25" rx="2" fill="#000" stroke="#888" />
            <rect x="197" y="18" width="1" height="19" fill="#0F0" className="animate-pulse" filter="url(#ledGlow)"/>
        </g>
    );

    // --- 6. BELLY GLASS (Art Panel) ---
    // Note: Replace CharacterSVG with <image> tag for PNGs
    const renderBelly = () => (
        <g transform="translate(20, 290)">
            <rect x="0" y="0" width="200" height="90" rx="2" fill="#000" stroke="#333" />
            
            <g clipPath="url(#bellyClip)">
                {/* Placeholder for PNG Art */}
                {/* <image href="/assets/belly/madoka.png" x="0" y="0" width="200" height="90" /> */}
                
                {/* Fallback Vector Art */}
                <rect x="0" y="0" width="200" height="90" fill={islandId===6 ? '#FFC0CB' : '#220000'} opacity="0.8" />
                <g transform="translate(150, 45) scale(0.3)">
                    <CharacterSVG type={charId} stickerMode={true} />
                </g>
                
                <text x="100" y="45" textAnchor="middle" fill="white" fontSize="18" fontWeight="900" style={{textShadow: '0 0 10px #FF00FF'}}>
                    {isHot ? 'SUPER JACKPOT' : 'SUROPARA'}
                </text>
                <text x="100" y="65" textAnchor="middle" fill="gold" fontSize="12" fontFamily="monospace">
                    WIN: {stats.wins}
                </text>
            </g>
            
            {/* Glass Reflection */}
            <path d="M0,0 L200,0 L180,90 L20,90 Z" fill="url(#plasticGloss)" opacity="0.3" pointerEvents="none" />
            
            {/* Serial Plate */}
            <rect x="70" y="80" width="60" height="8" fill="silver" stroke="black" />
            <text x="100" y="86" textAnchor="middle" fill="black" fontSize="4" fontFamily="monospace">{displaySerial}</text>
        </g>
    );

    const renderCoinTray = () => (
        <g transform="translate(0, 375)">
            <path d="M10,0 Q120,15 230,0 L230,25 Q120,35 10,25 Z" fill="url(#chromeGradient)" stroke="#222" />
            <rect x="25" y="5" width="190" height="15" rx="5" fill="#111" opacity="0.9" />
            {isHot && (
                 <g>
                    <circle cx="50" cy="12" r="5" fill="gold" stroke="orange" />
                    <circle cx="60" cy="14" r="5" fill="gold" stroke="orange" />
                    <circle cx="55" cy="10" r="5" fill="gold" stroke="orange" />
                 </g>
            )}
        </g>
    );

    // --- MAIN RENDER ---
    return (
        <svg width="240" height="400" viewBox="0 0 240 400" className={`drop-shadow-2xl transition-transform duration-300 ${mode==='hall' ? 'group-hover:-translate-y-2' : ''}`}>
            {renderDefs()}
            
            {/* Shadow */}
            <ellipse cx="120" cy="395" rx="100" ry="10" fill="#000" opacity="0.7" filter="blur(6px)" />
            
            {renderChassis()}
            {renderTopper()}
            {renderScreenArea()}
            {renderControls()}
            {renderBelly()}
            {renderCoinTray()}
            
            {/* Hall Mode Occupant */}
            {mode === 'hall' && isBusy && occupantPetId && (
                 <g transform="translate(80, 260) scale(0.35)">
                    <CharacterSVG type={occupantPetId} mood="idle" />
                 </g>
            )}
        </svg>
    );
};

export default memo(CabinetSVG);