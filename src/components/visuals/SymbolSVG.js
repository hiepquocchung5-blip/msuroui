import React, { memo } from 'react';

const SymbolSVG = ({ id }) => {
    // SYMBOL MAP (Pachislo Style)
    // 1: RED 7 (Big Bonus)
    // 2: BLUE 7 (Reg Bonus)
    // 3: BAR (Gold)
    // 4: BELL (15 Coins)
    // 5: WATERMELON (10 Coins)
    // 6: CHERRY (2 Coins)
    // 7: REPLAY (Free Spin)

    const renderDefs = () => (
        <defs>
            {/* Gradients */}
            <linearGradient id="symGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFD700"/><stop offset="50%" stopColor="#FFF7CC"/><stop offset="100%" stopColor="#B8860B"/></linearGradient>
            <linearGradient id="symRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF4d4d"/><stop offset="50%" stopColor="#F00"/><stop offset="100%" stopColor="#900"/></linearGradient>
            <linearGradient id="symBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4d4dff"/><stop offset="50%" stopColor="#00F"/><stop offset="100%" stopColor="#009"/></linearGradient>
            <linearGradient id="symSilver" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#eee"/><stop offset="50%" stopColor="#ccc"/><stop offset="100%" stopColor="#999"/></linearGradient>
            <radialGradient id="symGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stopColor="white" stopOpacity="0.8"/><stop offset="100%" stopColor="white" stopOpacity="0"/></radialGradient>
            
            {/* 3D Bevel Filter */}
            <filter id="bevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.75" specularExponent="20" lightingColor="#FFF" result="specOut">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
            </filter>
        </defs>
    );

    const renderSymbol = () => {
        switch(parseInt(id)) {
            case 1: // RED 7
                return (
                    <g filter="url(#bevel)">
                        <path d="M20,20 L80,20 L50,85 L25,85 L45,40 L20,40 Z" fill="url(#symRed)" stroke="url(#symGold)" strokeWidth="3" />
                        <text x="35" y="65" fill="#FFF" fontSize="10" fontWeight="bold" transform="rotate(-10 35 65)">SEVEN</text>
                        <path d="M20,20 L80,20" stroke="white" strokeWidth="2" opacity="0.5" />
                    </g>
                );
            case 2: // BLUE 7
                return (
                    <g filter="url(#bevel)">
                        <path d="M20,20 L80,20 L50,85 L25,85 L45,40 L20,40 Z" fill="url(#symBlue)" stroke="#C0C0C0" strokeWidth="3" />
                         <path d="M20,20 L80,20" stroke="white" strokeWidth="2" opacity="0.5" />
                    </g>
                );
            case 3: // BAR
                return (
                    <g filter="url(#bevel)">
                        <rect x="10" y="35" width="80" height="30" rx="4" fill="black" stroke="url(#symGold)" strokeWidth="4" />
                        <text x="50" y="58" textAnchor="middle" fill="url(#symGold)" fontSize="24" fontWeight="900" letterSpacing="4">BAR</text>
                        <rect x="15" y="38" width="70" height="12" fill="white" opacity="0.1" rx="2" />
                    </g>
                );
            case 4: // BELL
                return (
                    <g filter="url(#bevel)">
                        <path d="M50,15 Q80,15 85,70 L95,85 L5,85 L15,70 Q20,15 50,15" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
                        <circle cx="50" cy="85" r="8" fill="#B8860B" />
                        <path d="M40,25 Q50,20 60,25" stroke="white" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
                    </g>
                );
            case 5: // WATERMELON
                return (
                    <g filter="url(#bevel)">
                        <path d="M10,50 Q50,90 90,50 Z" fill="#228B22" stroke="#006400" strokeWidth="2" />
                        <path d="M10,50 Q50,90 90,50" fill="none" stroke="#000" strokeWidth="3" strokeDasharray="5,5" opacity="0.5" />
                        <path d="M10,50 L90,50" fill="none" stroke="#fff" strokeWidth="2" />
                        <path d="M15,55 Q50,80 85,55" fill="#FF4500" /> {/* Inside */}
                    </g>
                );
            case 6: // CHERRY
                return (
                    <g filter="url(#bevel)">
                        <path d="M50,20 L30,55 M50,20 L70,60" stroke="#006400" strokeWidth="4" />
                        <circle cx="30" cy="65" r="15" fill="#D00" stroke="#600" strokeWidth="2" />
                        <circle cx="70" cy="70" r="15" fill="#D00" stroke="#600" strokeWidth="2" />
                        <path d="M50,20 Q60,10 70,25" fill="#228B22" /> {/* Leaf */}
                        <circle cx="25" cy="60" r="5" fill="white" opacity="0.4" />
                        <circle cx="65" cy="65" r="5" fill="white" opacity="0.4" />
                    </g>
                );
            case 7: // REPLAY
                return (
                    <g filter="url(#bevel)">
                        <circle cx="50" cy="50" r="35" fill="url(#symSilver)" stroke="#444" strokeWidth="2" />
                        <path d="M50,25 A25,25 0 1,1 25,50" fill="none" stroke="#00F" strokeWidth="6" strokeLinecap="round" />
                        <path d="M25,50 L15,40 M25,50 L35,40" fill="none" stroke="#00F" strokeWidth="6" strokeLinecap="round" />
                        <text x="50" y="55" textAnchor="middle" fill="#333" fontSize="10" fontWeight="bold">REPLAY</text>
                    </g>
                );
            default: return <circle cx="50" cy="50" r="20" fill="#333" />;
        }
    };

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {renderDefs()}
            {renderSymbol()}
        </svg>
    );
};

export default memo(SymbolSVG);