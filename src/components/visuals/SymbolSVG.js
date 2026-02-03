import React, { memo } from 'react';

const SymbolSVG = ({ 
    id, 
    islandId = 1, 
    variant = 'normal', // 'normal', 'gold', 'frozen', 'glitch', 'dim', 'heat'
    isWinning = false   // Triggers win animation
}) => {
    // SYMBOL MAP:
    // 1: BIG BONUS (Theme Specific "7")
    // 2: REG BONUS (Secondary "7" or Character)
    // 3: BAR / HIGH VALUE (Theme Specific)
    // 4: BELL (Medium Win)
    // 5: WATERMELON (Low Win)
    // 6: CHERRY (Small Win)
    // 7: REPLAY (Free Spin)

    const renderDefs = () => (
        <defs>
            {/* SHARED GRADIENTS */}
            <linearGradient id="symGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFD700"/><stop offset="50%" stopColor="#FFF7CC"/><stop offset="100%" stopColor="#B8860B"/></linearGradient>
            <linearGradient id="symSilver" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#eee"/><stop offset="50%" stopColor="#ccc"/><stop offset="100%" stopColor="#999"/></linearGradient>
            <linearGradient id="symRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF4d4d"/><stop offset="100%" stopColor="#900"/></linearGradient>
            <linearGradient id="symMagma" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#300"/><stop offset="50%" stopColor="#F40"/><stop offset="100%" stopColor="#FFD700"/></linearGradient>
            <linearGradient id="symNeon" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0F0"/><stop offset="100%" stopColor="#005"/></linearGradient>
            <linearGradient id="symIce" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E0FFFF"/><stop offset="100%" stopColor="#00BFFF"/></linearGradient>
            <linearGradient id="symVoid" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4B0082"/><stop offset="100%" stopColor="#000"/></linearGradient>
            
            {/* VARIANT OVERLAYS */}
            <linearGradient id="overlayGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="gold" stopOpacity="0.5"/><stop offset="100%" stopColor="orange" stopOpacity="0.2"/></linearGradient>
            <linearGradient id="overlayIce" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="white" stopOpacity="0.6"/><stop offset="100%" stopColor="cyan" stopOpacity="0.3"/></linearGradient>
            <radialGradient id="overlayHeat" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stopColor="#FF4500" stopOpacity="0.6"/><stop offset="100%" stopColor="#FF0000" stopOpacity="0.2"/></radialGradient>

            {/* 3D BEVEL FILTER */}
            <filter id="symBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="20" lightingColor="#FFF" result="specOut">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
            </filter>
            
            {/* GLOW FILTERS */}
            <filter id="symGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="winGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
        </defs>
    );

    // --- 1. THE "BIG BONUS" SYMBOL (Usually "7") ---
    const renderSeven = () => {
        switch(islandId) {
            case 2: // ALOHA (Hibiscus Flower)
                return (
                    <g filter="url(#symBevel)">
                        <path d="M50,20 Q70,5 80,30 Q90,10 95,40 Q100,60 80,70 Q60,90 50,80 Q40,90 20,70 Q0,60 5,40 Q10,10 20,30 Q30,5 50,20" fill="#FF1493" stroke="white" strokeWidth="1" />
                        <circle cx="50" cy="50" r="10" fill="yellow" />
                        <text x="50" y="55" textAnchor="middle" fill="#000" fontSize="10" fontWeight="bold">RUSH</text>
                    </g>
                );
            case 3: // INFERNA (Magma Gem)
                return (
                    <g filter="url(#symGlow)">
                         <path d="M50,10 L85,50 L50,90 L15,50 Z" fill="url(#symMagma)" stroke="#300" strokeWidth="2" />
                         <path d="M50,20 L75,50 L50,80 L25,50 Z" fill="#F00" opacity="0.5" />
                         <text x="50" y="55" textAnchor="middle" fill="#FFD700" fontSize="14" fontWeight="black" stroke="#300" strokeWidth="0.5">7</text>
                    </g>
                );
            case 5: // GLACIA (Ice Crystal)
                return (
                    <g filter="url(#symBevel)">
                        <path d="M50,10 L70,30 L90,50 L50,90 L10,50 L30,30 Z" fill="url(#symIce)" stroke="white" strokeWidth="2" />
                        <path d="M50,10 L50,90 M10,50 L90,50" stroke="white" strokeWidth="1" opacity="0.6" />
                    </g>
                );
            case 8: // CYBER (Digital 7)
                return (
                    <g filter="url(#symGlow)">
                        <path d="M20,20 L80,20 L50,90" fill="none" stroke="url(#symNeon)" strokeWidth="8" strokeLinecap="square" />
                        <path d="M20,20 L80,20 L50,90" fill="none" stroke="white" strokeWidth="2" />
                    </g>
                );
            case 10: // VOID (Black Hole)
                return (
                    <g>
                        <circle cx="50" cy="50" r="35" fill="url(#symVoid)" stroke="#8A2BE2" strokeWidth="2" />
                        <circle cx="50" cy="50" r="32" fill="none" stroke="#FFF" strokeWidth="1" strokeDasharray="4,4" className="animate-spin" style={{animationDuration:'10s'}}/>
                        <text x="50" y="60" textAnchor="middle" fill="#FFF" fontSize="24" fontWeight="bold">7</text>
                    </g>
                );
            default: // VEGAS (Classic Red 7)
                return (
                    <g filter="url(#symBevel)">
                        <path d="M20,20 L85,20 L55,90 L30,90 L50,45 L20,45 Z" fill="url(#symRed)" stroke="url(#symGold)" strokeWidth="2" />
                        <text x="45" y="70" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" transform="rotate(-15 45 70)">JACKPOT</text>
                    </g>
                );
        }
    };

    // --- 2. BAR SYMBOL (Medium/High) ---
    const renderBar = () => {
        switch(islandId) {
            case 2: // Tiki Totem (Aloha)
                return (
                    <g filter="url(#symBevel)">
                        <rect x="25" y="20" width="50" height="60" rx="5" fill="#8B4513" stroke="#5D4037" strokeWidth="2"/>
                        <circle cx="40" cy="40" r="5" fill="yellow"/> <circle cx="60" cy="40" r="5" fill="yellow"/>
                        <path d="M35,60 Q50,70 65,60" fill="none" stroke="black" strokeWidth="2"/>
                    </g>
                );
            case 9: // Gold Ingot (Gold)
                return (
                    <g filter="url(#symBevel)">
                         <path d="M20,40 L30,30 L70,30 L80,40 L70,70 L30,70 Z" fill="url(#symGold)" stroke="#B8860B" strokeWidth="2" />
                         <text x="50" y="55" textAnchor="middle" fill="#5D4037" fontSize="12" fontWeight="black">GOLD</text>
                    </g>
                );
            default: // Classic Bar
                return (
                    <g filter="url(#symBevel)">
                        <rect x="15" y="35" width="70" height="30" rx="2" fill="black" stroke="white" strokeWidth="2" />
                        <text x="50" y="58" textAnchor="middle" fill="white" fontSize="20" fontWeight="900" letterSpacing="2">BAR</text>
                    </g>
                );
        }
    };

    // --- 3. REPLAY SYMBOL (Free Spin) ---
    const renderReplay = () => {
        const color = islandId === 8 ? '#0F0' : (islandId === 3 ? '#F00' : '#00F');
        return (
            <g filter="url(#symBevel)">
                <circle cx="50" cy="50" r="30" fill="#EEE" stroke="#999" strokeWidth="1" />
                <path d="M50,25 A25,25 0 1,1 25,50" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
                <path d="M25,50 L15,40 M25,50 L35,40" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
                <text x="50" y="54" textAnchor="middle" fill="#333" fontSize="10" fontWeight="bold">REPLAY</text>
            </g>
        );
    };

    // --- MAIN RENDER SWITCH ---
    const renderSymbol = () => {
        switch(parseInt(id)) {
            case 1: return renderSeven(); 
            case 2: // REG BONUS
                return (
                    <g filter="url(#symBevel)" transform="scale(0.9) translate(5,5)">
                        <path d="M20,20 L80,20 L50,85 L25,85 L45,40 L20,40 Z" fill="url(#symSilver)" stroke="#444" strokeWidth="2" />
                    </g>
                );
            case 3: return renderBar();
            case 4: // BELL
                return (
                    <g filter="url(#symBevel)">
                        <path d="M50,20 Q80,20 85,70 L95,85 L5,85 L15,70 Q20,20 50,20" fill="url(#symGold)" stroke="#B8860B" strokeWidth="2" />
                        <circle cx="50" cy="85" r="8" fill="#B8860B" />
                        <path d="M50,20 L50,10" stroke="#333" strokeWidth="3"/>
                    </g>
                );
            case 5: // WATERMELON
                return (
                    <g filter="url(#symBevel)">
                        <path d="M10,50 Q50,90 90,50 Z" fill="#228B22" stroke="#006400" strokeWidth="2" />
                        <path d="M10,50 Q50,90 90,50" fill="none" stroke="#000" strokeWidth="3" strokeDasharray="5,5" opacity="0.6" />
                        <path d="M10,50 L90,50" fill="none" stroke="#fff" strokeWidth="2" />
                        <path d="M20,55 Q50,80 80,55" fill="#FF4500" />
                    </g>
                );
            case 6: // CHERRY
                return (
                    <g filter="url(#symBevel)">
                        <path d="M50,20 L30,55 M50,20 L70,60" stroke="#228B22" strokeWidth="4" />
                        <circle cx="30" cy="65" r="14" fill="#D00" stroke="#600" strokeWidth="1" />
                        <circle cx="70" cy="70" r="14" fill="#D00" stroke="#600" strokeWidth="1" />
                        <path d="M50,20 Q70,10 80,25" fill="#228B22" stroke="#006400" strokeWidth="1"/>
                        <circle cx="25" cy="60" r="4" fill="white" opacity="0.5" />
                    </g>
                );
            case 7: return renderReplay(); 
            default: return <circle cx="50" cy="50" r="20" fill="#333" />;
        }
    };

    // Apply Visual Variants
    const getVariantOverlay = () => {
        switch(variant) {
            case 'gold': return <rect x="0" y="0" width="100" height="100" fill="url(#overlayGold)" style={{mixBlendMode:'overlay'}}/>;
            case 'frozen': return (
                <>
                    <rect x="0" y="0" width="100" height="100" fill="url(#overlayIce)" />
                    <path d="M10,10 L30,30 M80,20 L60,40" stroke="white" strokeWidth="2" opacity="0.8"/>
                </>
            );
            case 'heat': return (
                <>
                     <rect x="0" y="0" width="100" height="100" fill="url(#overlayHeat)" />
                     <circle cx="50" cy="50" r="40" fill="none" stroke="red" strokeWidth="4" opacity="0.4" className="animate-pulse" />
                </>
            );
            case 'dim': return <rect x="0" y="0" width="100" height="100" fill="black" opacity="0.6" />;
            default: return null;
        }
    };

    return (
        <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-sm transition-all duration-300 ${isWinning ? 'animate-pulse scale-110 drop-shadow-[0_0_10px_gold]' : ''} ${variant === 'glitch' ? 'animate-pulse' : ''}`}>
            {renderDefs()}
            {renderSymbol()}
            {getVariantOverlay()}
            {isWinning && <rect x="0" y="0" width="100" height="100" fill="none" stroke="gold" strokeWidth="3" rx="10" filter="url(#winGlow)" />}
        </svg>
    );
};

export default memo(SymbolSVG);