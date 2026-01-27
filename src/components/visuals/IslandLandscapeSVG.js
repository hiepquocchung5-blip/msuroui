import React from 'react';

const IslandLandscapeSVG = ({ islandId }) => {
    
    const renderLandscape = () => {
        switch(islandId) {
            case 1: // SURO VEGAS
                return (
                    <g>
                        <rect width="100%" height="100%" fill="#0a0514" />
                        {/* Building Silhouettes */}
                        <path d="M20,400 L20,150 L80,150 L80,400" fill="#1a0b2e" />
                        <path d="M100,400 L100,100 L180,100 L180,400" fill="#240f45" />
                        <path d="M300,400 L300,180 L380,180 L380,400" fill="#1a0b2e" />
                        {/* The Sign */}
                        <g transform="translate(200, 50) scale(1)">
                            <path d="M0,0 L100,20 L0,40 Z" fill="#FF00FF" opacity="0.6" className="animate-pulse" />
                            <text x="10" y="25" fill="#FFF" fontSize="12" fontWeight="bold" transform="rotate(5)">CASINO</text>
                        </g>
                        {/* Beams */}
                        <path d="M140,100 L140,-50" stroke="cyan" strokeWidth="2" opacity="0.3" />
                        <path d="M340,180 L340,-20" stroke="magenta" strokeWidth="2" opacity="0.3" />
                    </g>
                );
            case 2: // KOHANA (Sunset)
                return (
                    <g>
                        <defs>
                            <linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FFD700" />
                                <stop offset="100%" stopColor="#FF69B4" />
                            </linearGradient>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#sunset)" />
                        <circle cx="200" cy="300" r="120" fill="#FF4500" opacity="0.4" />
                        {/* Waves */}
                        <path d="M0,350 Q100,340 200,350 T400,350 L400,400 L0,400 Z" fill="#0077BE" />
                        {/* Torii Gate */}
                        <path d="M250,350 L250,250 M350,350 L350,250" stroke="#000" strokeWidth="8" />
                        <path d="M230,270 L370,270" stroke="#000" strokeWidth="10" />
                    </g>
                );
            case 3: // INFERNA (Volcano)
                return (
                    <g>
                        <defs>
                            <linearGradient id="lava" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FF4500"/>
                                <stop offset="100%" stopColor="#800"/>
                            </linearGradient>
                        </defs>
                        <rect width="100%" height="100%" fill="#220000" />
                        <path d="M0,400 L150,200 L300,400 Z" fill="#400" />
                        <path d="M150,200 L180,400 L120,400" fill="url(#lava)" />
                        {/* Ash Particles */}
                        <circle cx="100" cy="100" r="2" fill="gray" opacity="0.5" />
                        <circle cx="200" cy="50" r="3" fill="gray" opacity="0.5" />
                    </g>
                );
            case 4: // NOCTYRA (Moon)
                 return (
                     <g>
                         <rect width="100%" height="100%" fill="#000022" />
                         {/* Moon */}
                         <circle cx="300" cy="100" r="40" fill="#FFF" className="animate-pulse" />
                         <path d="M0,400 Q200,300 400,400" fill="#111" />
                         {/* Bats */}
                         <path d="M100,100 Q110,90 120,100 M110,100 L110,110" stroke="#000" strokeWidth="2" />
                         <path d="M150,150 Q160,140 170,150 M160,150 L160,160" stroke="#000" strokeWidth="2" />
                     </g>
                 );
            case 5: // GLACIA (Ice)
                return (
                    <g>
                        <defs>
                            <linearGradient id="ice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#E0FFFF" />
                                <stop offset="100%" stopColor="#00BFFF" />
                            </linearGradient>
                        </defs>
                        <rect width="100%" height="100%" fill="#F0FFFF" />
                        {/* Mountains */}
                        <path d="M0,400 L100,200 L200,400" fill="url(#ice)" opacity="0.8" />
                        <path d="M150,400 L250,150 L350,400" fill="url(#ice)" opacity="0.6" />
                        <path d="M250,400 L350,250 L400,400" fill="url(#ice)" opacity="0.9" />
                        {/* Snow */}
                        <circle cx="50" cy="50" r="2" fill="white" className="animate-pulse" />
                        <circle cx="300" cy="80" r="3" fill="white" className="animate-pulse" />
                    </g>
                );
            case 6: // SKY (Clouds)
                return (
                    <g>
                        <defs>
                            <radialGradient id="sky" cx="0.5" cy="0.5" r="0.5">
                                <stop offset="0%" stopColor="#FFFFFF" />
                                <stop offset="100%" stopColor="#87CEEB" />
                            </radialGradient>
                        </defs>
                        <rect width="100%" height="100%" fill="#87CEEB" />
                        {/* Floating Islands */}
                        <path d="M50,250 Q100,200 150,250 L120,300 L80,300 Z" fill="#8B4513" />
                        <ellipse cx="100" cy="250" rx="60" ry="20" fill="green" />
                        {/* Clouds */}
                        <circle cx="300" cy="100" r="40" fill="white" opacity="0.8" />
                        <circle cx="350" cy="120" r="50" fill="white" opacity="0.8" />
                        <circle cx="250" cy="120" r="30" fill="white" opacity="0.8" />
                    </g>
                );
            case 7: // BIO (Jungle)
                return (
                    <g>
                        <rect width="100%" height="100%" fill="#002200" />
                        {/* Vines */}
                        <path d="M0,0 Q50,100 0,200" stroke="#006400" strokeWidth="5" fill="none" />
                        <path d="M400,0 Q350,100 400,200" stroke="#006400" strokeWidth="5" fill="none" />
                        <path d="M0,400 Q200,300 400,400" fill="#004400" />
                        {/* Spores */}
                        <circle cx="100" cy="200" r="3" fill="#00FF00" opacity="0.5" className="animate-ping" />
                        <circle cx="300" cy="150" r="2" fill="#00FF00" opacity="0.5" className="animate-ping" />
                    </g>
                );
            case 8: // CYBER (Matrix)
                return (
                    <g>
                        <rect width="100%" height="100%" fill="#000" />
                        {/* Grid */}
                        <path d="M0,300 L400,300 M0,320 L400,320 M0,350 L400,350 M0,390 L400,390" stroke="#00FF00" strokeWidth="1" opacity="0.5" />
                        <path d="M150,300 L0,400 M250,300 L400,400 M200,300 L200,400" stroke="#00FF00" strokeWidth="1" opacity="0.5" />
                        {/* Buildings */}
                        <rect x="50" y="150" width="40" height="150" fill="#111" stroke="#0F0" strokeWidth="1" />
                        <rect x="300" y="100" width="50" height="200" fill="#111" stroke="#0F0" strokeWidth="1" />
                    </g>
                );
            case 9: // GOLD (Steampunk)
                return (
                    <g>
                        <defs>
                            <linearGradient id="bronze" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#CD7F32" />
                                <stop offset="100%" stopColor="#3E2723" />
                            </linearGradient>
                        </defs>
                        <rect width="100%" height="100%" fill="#3E2723" />
                        {/* Gears */}
                        <circle cx="100" cy="100" r="60" fill="none" stroke="#CD7F32" strokeWidth="10" strokeDasharray="10,5" />
                        <circle cx="350" cy="350" r="100" fill="none" stroke="#B8860B" strokeWidth="20" strokeDasharray="20,10" />
                        {/* Steam */}
                        <path d="M200,300 Q220,250 200,200" stroke="white" strokeWidth="5" opacity="0.3" fill="none" />
                    </g>
                );
            case 10: // VOID (Space)
                return (
                    <g>
                        <rect width="100%" height="100%" fill="#000" />
                        {/* Black Hole */}
                        <circle cx="200" cy="150" r="50" fill="#000" stroke="#8A2BE2" strokeWidth="5" className="animate-pulse" />
                        {/* Stars */}
                        <circle cx="50" cy="50" r="1" fill="white" />
                        <circle cx="350" cy="80" r="2" fill="white" />
                        <circle cx="100" cy="300" r="1" fill="white" />
                        <circle cx="300" cy="250" r="1" fill="white" />
                    </g>
                );
            default: 
                return <rect width="100%" height="100%" fill="#111" />;
        }
    };

    return (
        <svg viewBox="0 0 400 120" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
            {renderLandscape()}
        </svg>
    );
};

export default IslandLandscapeSVG;