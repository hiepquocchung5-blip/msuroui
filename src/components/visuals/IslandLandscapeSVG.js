import React, { memo } from 'react';

const IslandLandscapeSVG = ({ islandId }) => {
    
    // --- ASSET MAPPING ---
    // Save images as /public/assets/backgrounds/bg_1.jpg, bg_2.jpg, etc.
    const getBgImage = (id) => `/assets/backgrounds/bg_${id}.jpg`;

    // --- 1. ATMOSPHERIC DEFINITIONS ---
    const renderDefs = () => (
        <defs>
            {/* FOG / HAZE */}
            <filter id="haze">
                <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
                <feGaussianBlur stdDeviation="3" />
            </filter>
            
            {/* GLOW */}
            <filter id="envGlow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>

            {/* PARTICLES */}
            <linearGradient id="emberGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#FF4500" stopOpacity="0"/>
                <stop offset="50%" stopColor="#FFD700" stopOpacity="1"/>
                <stop offset="100%" stopColor="#FF4500" stopOpacity="0"/>
            </linearGradient>

            <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F0" stopOpacity="0"/>
                <stop offset="50%" stopColor="#0F0" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#0F0" stopOpacity="0"/>
            </linearGradient>

            <radialGradient id="sporeGrad" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#ADFF2F" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#006400" stopOpacity="0"/>
            </radialGradient>

            <radialGradient id="fireflyGrad" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="1"/>
                <stop offset="100%" stopColor="#FF8C00" stopOpacity="0"/>
            </radialGradient>

             <linearGradient id="steamGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#FFF" stopOpacity="0"/>
                <stop offset="50%" stopColor="#AAA" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#FFF" stopOpacity="0"/>
            </linearGradient>
        </defs>
    );

    // --- 2. DYNAMIC ATMOSPHERE LAYERS ---
    const renderAtmosphere = () => {
        switch(islandId) {
            case 1: // VEGAS (Spotlights)
                return (
                    <g className="mix-blend-screen opacity-40">
                        <path d="M-100,600 L200,-100 L250,-100 L50,600 Z" fill="url(#emberGrad)" className="animate-[pulse_4s_ease-in-out_infinite]" style={{transformOrigin: 'bottom center', transform: 'rotate(15deg)'}} />
                        <path d="M700,600 L400,-100 L350,-100 L650,600 Z" fill="url(#emberGrad)" className="animate-[pulse_5s_ease-in-out_infinite]" style={{transformOrigin: 'bottom center', transform: 'rotate(-15deg)'}} />
                    </g>
                );
            case 2: // ALOHA (Fireflies & Sunset Haze)
                return (
                    <g>
                         <rect width="100%" height="100%" fill="#FF4500" opacity="0.1" style={{mixBlendMode: 'overlay'}} />
                         {[...Array(8)].map((_, i) => (
                            <circle key={i} r={Math.random() * 2 + 1} cx={Math.random() * 100 + "%"} cy={Math.random() * 100 + "%"} fill="url(#fireflyGrad)" className="animate-[pulse_3s_infinite]" style={{animationDelay: `${Math.random() * 2}s`}}>
                                <animateTransform attributeName="transform" type="translate" values="0 0; 10 -10; 0 0" dur={`${Math.random() * 5 + 5}s`} repeatCount="indefinite" />
                            </circle>
                        ))}
                    </g>
                );
            case 3: // INFERNA (Rising Embers)
                return (
                    <g fill="url(#emberGrad)">
                        {[...Array(12)].map((_, i) => (
                            <circle key={i} r={Math.random() * 2 + 1} cx={Math.random() * 100 + "%"} cy="110%" className="animate-float" style={{animationDuration: `${Math.random() * 3 + 2}s`, animationDelay: `${Math.random()}s`, opacity: 0.8}} />
                        ))}
                         <rect width="100%" height="100%" fill="red" opacity="0.05" className="animate-pulse" style={{mixBlendMode: 'color-dodge'}} />
                    </g>
                );
            case 4: // NOCTYRA (Fog & Bats)
                return (
                    <g>
                        <rect width="100%" height="100%" fill="#4B0082" filter="url(#haze)" opacity="0.2" className="animate-[pulse_8s_infinite]" />
                        {/* Bat Shadows */}
                        <path d="M10,10 Q20,20 30,10 L20,15 Z" fill="black" opacity="0.6" transform="translate(100, 50) scale(0.5)">
                             <animateTransform attributeName="transform" type="translate" values="100 50; 300 80" dur="10s" repeatCount="indefinite" />
                        </path>
                        <path d="M10,10 Q20,20 30,10 L20,15 Z" fill="black" opacity="0.4" transform="translate(300, 150) scale(0.3)">
                             <animateTransform attributeName="transform" type="translate" values="300 150; 50 100" dur="15s" repeatCount="indefinite" />
                        </path>
                    </g>
                );
            case 5: // GLACIA (Snow)
                return (
                    <g fill="white">
                        {[...Array(25)].map((_, i) => (
                            <circle key={i} r={Math.random() * 2} cx={Math.random() * 100 + "%"} cy="-10%" className="animate-[fall_5s_linear_infinite]" style={{animationDuration: `${Math.random() * 5 + 3}s`, animationDelay: `${Math.random() * 5}s`, opacity: 0.8}} />
                        ))}
                         <rect width="100%" height="100%" fill="#E0FFFF" opacity="0.1" style={{mixBlendMode: 'screen'}} />
                    </g>
                );
            case 6: // SKY (Moving Clouds/Mist)
                return (
                    <g>
                        <rect width="100%" height="100%" fill="white" filter="url(#haze)" opacity="0.4" className="animate-[pulse_10s_infinite]" />
                        <circle cx="90%" cy="10%" r="50" fill="white" filter="url(#envGlow)" opacity="0.6" className="animate-pulse" />
                    </g>
                );
            case 7: // BIO (Spores)
                return (
                    <g>
                        {[...Array(15)].map((_, i) => (
                            <circle key={i} r={Math.random() * 3} cx={Math.random() * 100 + "%"} cy={Math.random() * 100 + "%"} fill="url(#sporeGrad)" className="animate-pulse" style={{animationDuration: `${Math.random() * 3 + 2}s`}}>
                                 <animateTransform attributeName="transform" type="translate" values="0 0; 0 -20; 0 0" dur={`${Math.random() * 5 + 5}s`} repeatCount="indefinite" />
                            </circle>
                        ))}
                    </g>
                );
            case 8: // CYBER (Digital Rain)
                return (
                    <g stroke="url(#rainGrad)" strokeWidth="1.5" strokeLinecap="round">
                        {[...Array(20)].map((_, i) => (
                            <line key={i} x1={Math.random() * 100 + "%"} y1="-20%" x2={Math.random() * 100 + "%"} y2="100%" className="animate-[fall_2s_linear_infinite]" style={{animationDuration: `${Math.random() * 1 + 0.5}s`, strokeDasharray: "5, 10", opacity: 0.7}} />
                        ))}
                    </g>
                );
            case 9: // GOLD (Steam & Sparks)
                return (
                    <g>
                         <rect width="100%" height="100%" fill="url(#steamGrad)" filter="url(#haze)" opacity="0.3" className="animate-[pulse_6s_infinite]" />
                         {[...Array(5)].map((_, i) => (
                            <circle key={i} r={1} cx={Math.random() * 100 + "%"} cy={Math.random() * 100 + "%"} fill="#FFD700" className="animate-ping" style={{animationDuration: '0.5s', animationDelay: `${Math.random() * 2}s`}} />
                         ))}
                    </g>
                );
            case 10: // VOID (Stars)
                return (
                    <g fill="white">
                        {[...Array(40)].map((_, i) => (
                            <circle key={i} r={Math.random() * 1.5} cx={Math.random() * 100 + "%"} cy={Math.random() * 100 + "%"} className="animate-pulse" style={{animationDuration: `${Math.random() * 3 + 1}s`, opacity: Math.random()}} />
                        ))}
                        <rect width="100%" height="100%" fill="#4B0082" opacity="0.1" style={{mixBlendMode: 'overlay'}} />
                    </g>
                );
            default: return null;
        }
    };

    // --- 3. MAIN RENDER ---
    return (
        <div className="w-full h-full relative overflow-hidden bg-black">
            {/* Base Image Asset */}
            <img 
                src={getBgImage(islandId)} 
                alt="Landscape"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                onError={(e) => {
                    // Fallback gradient if image missing
                    e.target.style.display = 'none';
                }}
            />
            
            {/* Fallback Gradient (visible if image fails) */}
            <div className={`absolute inset-0 -z-10 bg-gradient-to-b 
                ${islandId===1 ? 'from-purple-900 to-black' : 
                  islandId===3 ? 'from-red-900 to-black' : 
                  islandId===5 ? 'from-cyan-900 to-black' : 
                  islandId===7 ? 'from-green-900 to-black' :
                  islandId===9 ? 'from-yellow-900 to-black' :
                  'from-gray-900 to-black'}`} 
            />

            {/* Atmospheric Overlay (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
                {renderDefs()}
                {renderAtmosphere()}
            </svg>
            
            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(transparent_50%,black_100%)] opacity-70 z-0"></div>
        </div>
    );
};

export default memo(IslandLandscapeSVG);