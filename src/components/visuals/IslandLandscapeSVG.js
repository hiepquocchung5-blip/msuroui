import React, { memo, useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const IslandLandscapeSVG = ({ islandId, priority = false }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Reset loading state if the island changes
    useEffect(() => {
        setIsLoaded(false);
        setHasError(false);
    }, [islandId]);

    // Format ID to ensure we only process the 5 active V3 islands
    const safeIslandId = Math.max(1, Math.min(5, parseInt(islandId) || 1));
    const getBgImage = (id) => `/assets/backgrounds/bg_${id}.jpg`;

    // --- 1. ATMOSPHERIC SHADERS & DEFINITIONS ---
    const renderDefs = () => (
        <defs>
            {/* Advanced Blurs & Distortions */}
            <filter id="haze"><feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="15" /><feGaussianBlur stdDeviation="2" /></filter>
            <filter id="heatDistortion"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise"><animate attributeName="baseFrequency" values="0.05;0.07;0.05" dur="4s" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G"/></filter>
            <filter id="hologram"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/><feGaussianBlur stdDeviation="1" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="spiritGlow"><feGaussianBlur stdDeviation="6" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>

            {/* Gradients */}
            <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFF7CC"/><stop offset="50%" stopColor="#FFD700"/><stop offset="100%" stopColor="#B8860B"/></linearGradient>
            <linearGradient id="emberGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#FF4500" stopOpacity="0"/><stop offset="50%" stopColor="#FFD700" stopOpacity="0.8"/><stop offset="100%" stopColor="#FF4500" stopOpacity="0"/></linearGradient>
            <linearGradient id="neonRain" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00f3ff" stopOpacity="0"/><stop offset="50%" stopColor="#00f3ff" stopOpacity="0.8"/><stop offset="100%" stopColor="#ff00ff" stopOpacity="0"/></linearGradient>
            <radialGradient id="sakuraGrad" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stopColor="#ffb3c6" stopOpacity="0.9"/><stop offset="100%" stopColor="#ff6699" stopOpacity="0"/></radialGradient>
            <radialGradient id="yokaiSoul" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stopColor="#00ffff" stopOpacity="0.9"/><stop offset="100%" stopColor="#8a2be2" stopOpacity="0"/></radialGradient>
        </defs>
    );

    // --- 2. THEMATIC GRAND JACKPOT (GJP) MONUMENTS ---
    // Seamlessly integrates the concept of the GJP into the actual world environment
    const renderGJPMonument = () => {
        switch(safeIslandId) {
            case 1: // Kyoto Zen: Golden Spirit Torii
                return (
                    <g transform="translate(50, 150) scale(1.5)" opacity="0.6" filter="url(#spiritGlow)" className="animate-pulse">
                        <text x="50%" y="20" textAnchor="middle" fill="url(#goldGrad)" fontSize="18" fontWeight="900" letterSpacing="4" style={{fontFamily: 'serif'}}>GRAND JACKPOT</text>
                        <path d="M 30 30 L 70 30 M 35 40 L 65 40 M 40 30 L 40 80 M 60 30 L 60 80" stroke="url(#goldGrad)" strokeWidth="4" fill="none" />
                        <text x="50%" y="60" textAnchor="middle" fill="#FFF" fontSize="12" letterSpacing="2">大当り</text>
                    </g>
                );
            case 2: // Neon Arcade: Massive Holographic Billboard
                return (
                    <g transform="translate(0, 50)" filter="url(#hologram)" opacity="0.7">
                        <rect x="10%" y="20" width="80%" height="60" fill="#001133" stroke="#00f3ff" strokeWidth="2" opacity="0.5" transform="skewX(-15)" />
                        <text x="50%" y="60" textAnchor="middle" fill="#00f3ff" fontSize="32" fontWeight="900" fontStyle="italic" letterSpacing="6" transform="skewX(-15)" className="animate-[pulse_0.1s_linear_infinite]">GRAND JACKPOT</text>
                        <path d="M 0 80 L 1000 80" stroke="#ff00ff" strokeWidth="1" strokeDasharray="10 5" className="animate-[marquee_2s_linear_infinite]" />
                    </g>
                );
            case 3: // Edo Castle: Burning War Banner
                return (
                    <g transform="translate(50, 100) scale(1.2)" filter="url(#heatDistortion)" opacity="0.8">
                        <text x="50%" y="40" textAnchor="middle" fill="#FF4500" fontSize="28" fontWeight="900" letterSpacing="5" stroke="#FFD700" strokeWidth="1" className="animate-pulse">GRAND JACKPOT</text>
                        <text x="50%" y="70" textAnchor="middle" fill="#FFD700" fontSize="20" letterSpacing="10" opacity="0.8">覇者</text>
                    </g>
                );
            case 4: // Hanami Fest: Floating Sky Lanterns
                return (
                    <g transform="translate(0, 80)" opacity="0.8" filter="url(#spiritGlow)">
                        <text x="50%" y="50" textAnchor="middle" fill="#ffb3c6" fontSize="26" fontWeight="900" letterSpacing="8" className="animate-[bounce-slow_4s_ease-in-out_infinite]">GRAND JACKPOT</text>
                        <circle cx="20%" cy="40" r="10" fill="#ffb3c6" className="animate-ping" style={{animationDuration: '3s'}} />
                        <circle cx="80%" cy="30" r="15" fill="#ffb3c6" className="animate-ping" style={{animationDuration: '4s'}} />
                    </g>
                );
            case 5: // Spirited Yokai: Ghostly Runes
                return (
                    <g transform="translate(0, 120)" opacity="0.7" filter="url(#haze)">
                        <text x="50%" y="50" textAnchor="middle" fill="url(#yokaiSoul)" fontSize="30" fontWeight="900" fontStyle="italic" letterSpacing="10" className="animate-pulse">GRAND JACKPOT</text>
                        <path d="M 20% 60 Q 50% 20 80% 60" fill="none" stroke="url(#yokaiSoul)" strokeWidth="3" opacity="0.5" />
                    </g>
                );
            default: return null;
        }
    };

    // --- 3. DYNAMIC ATMOSPHERE LAYERS ---
    const renderAtmosphere = () => {
        switch(safeIslandId) {
            case 1: // Kyoto Zen (Fog & Leaves)
                return (
                    <g>
                        <rect width="100%" height="100%" fill="#FFD700" filter="url(#haze)" opacity="0.1" className="animate-[pulse_8s_infinite]" />
                        {[...Array(15)].map((_, i) => (
                            <path key={i} d="M0,0 Q5,5 10,0 Q5,-5 0,0" fill="#FF4500" opacity="0.6" className="animate-[fall_5s_linear_infinite]" 
                                style={{
                                    transform: `translate(${Math.random() * 100}%, -10%) scale(${Math.random() * 1.5 + 0.5})`,
                                    animationDuration: `${Math.random() * 4 + 4}s`, 
                                    animationDelay: `${Math.random() * 5}s`
                                }} 
                            />
                        ))}
                    </g>
                );
            case 2: // Neon Arcade (Cyber Rain)
                return (
                    <g stroke="url(#neonRain)" strokeWidth="2" strokeLinecap="round">
                        <rect width="100%" height="100%" fill="#00f3ff" opacity="0.05" style={{mixBlendMode: 'overlay'}} />
                        {[...Array(30)].map((_, i) => (
                            <line key={i} x1={Math.random() * 100 + "%"} y1="-20%" x2={Math.random() * 100 + "%"} y2="120%" className="animate-[fall_1s_linear_infinite]" 
                                style={{
                                    animationDuration: `${Math.random() * 0.5 + 0.5}s`, 
                                    strokeDasharray: "20, 40", 
                                    opacity: Math.random() * 0.8 + 0.2
                                }} 
                            />
                        ))}
                    </g>
                );
            case 3: // Edo Castle (Ash & Heat)
                return (
                    <g filter="url(#heatDistortion)">
                        <rect width="100%" height="100%" fill="red" opacity="0.1" style={{mixBlendMode: 'color-dodge'}} className="animate-pulse" />
                        {[...Array(20)].map((_, i) => (
                            <circle key={i} r={Math.random() * 2 + 1} cx={Math.random() * 100 + "%"} cy="110%" fill="url(#emberGrad)" className="animate-float" 
                                style={{
                                    animationDuration: `${Math.random() * 3 + 2}s`, 
                                    animationDelay: `${Math.random()}s`, 
                                    opacity: 0.8
                                }} 
                            />
                        ))}
                    </g>
                );
            case 4: // Hanami Fest (Sakura Petals)
                return (
                    <g>
                        <rect width="100%" height="100%" fill="#ffb3c6" filter="url(#haze)" opacity="0.15" className="animate-[pulse_10s_infinite]" />
                        {[...Array(25)].map((_, i) => (
                            <circle key={i} r={Math.random() * 3 + 2} cx={Math.random() * 100 + "%"} cy="-10%" fill="url(#sakuraGrad)" className="animate-[fall_6s_linear_infinite]" 
                                style={{
                                    animationDuration: `${Math.random() * 6 + 4}s`, 
                                    animationDelay: `${Math.random() * 5}s`, 
                                    opacity: 0.7
                                }} 
                            />
                        ))}
                    </g>
                );
            case 5: // Spirited Yokai (Soul Wisps)
                return (
                    <g>
                        <rect width="100%" height="100%" fill="#4B0082" opacity="0.2" style={{mixBlendMode: 'overlay'}} />
                        {[...Array(12)].map((_, i) => (
                            <circle key={i} r={Math.random() * 6 + 3} cx={Math.random() * 100 + "%"} cy={Math.random() * 100 + "%"} fill="url(#yokaiSoul)" filter="url(#spiritGlow)" className="animate-pulse" 
                                style={{
                                    animationDuration: `${Math.random() * 2 + 2}s`,
                                    animationDelay: `${Math.random() * 2}s`
                                }}>
                                <animateTransform attributeName="transform" type="translate" values="0 0; 0 -30; 0 0" dur={`${Math.random() * 4 + 4}s`} repeatCount="indefinite" />
                            </circle>
                        ))}
                    </g>
                );
            default: return null;
        }
    };

    // Fallback gradient colors specific to the 5 V3 islands
    const getFallbackGradient = (id) => {
        const gradients = {
            1: 'from-orange-900 to-black',   // Kyoto Zen
            2: 'from-blue-900 to-purple-900',// Neon Arcade
            3: 'from-red-950 to-black',      // Edo Castle
            4: 'from-pink-900 to-black',     // Hanami Fest
            5: 'from-indigo-950 to-black'    // Spirited Yokai
        };
        return gradients[id] || 'from-gray-900 to-black';
    };

    return (
        <div className="w-full h-full relative overflow-hidden bg-black">
            
            {/* Loading Skeleton / Fallback Gradient */}
            <div className={`absolute inset-0 -z-10 bg-gradient-to-b ${getFallbackGradient(safeIslandId)} transition-opacity duration-1000 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}>
                {!hasError && !isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <ImageIcon className="text-white/20 w-12 h-12 animate-pulse" />
                    </div>
                )}
            </div>

            {/* Smart Image Loader (With Blur-Up Effect) */}
            {!hasError && (
                <img 
                    src={getBgImage(safeIslandId)} 
                    alt={`Island Environment ${safeIslandId}`}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async" 
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out z-0
                        ${isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105'}`}
                />
            )}

            {/* Atmospheric Overlay & GJP Monuments (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
                {renderDefs()}
                
                {/* Render the physical GJP monument integrated into the background */}
                {isLoaded && renderGJPMonument()}

                {/* Render the weather/particle effects */}
                {renderAtmosphere()}
            </svg>
            
            {/* Edge Vignette for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(transparent_40%,black_120%)] opacity-80 z-20 pointer-events-none"></div>
        </div>
    );
};

export default memo(IslandLandscapeSVG);