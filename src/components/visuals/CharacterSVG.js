import React, { memo } from 'react';

const CharacterSVG = ({
  type = 'luna',
  mood = 'idle', // idle | win | sad
  scale = 1,
  stickerMode = false
}) => {
  const isWin = mood === 'win';
  const isSad = mood === 'sad';

  // Map character IDs to filenames
  // Ensure you upload these .png files to your public/assets/characters/ folder
  const getAssetPath = (charType) => {
      // Sanitize input
      const safeType = charType ? charType.toLowerCase() : 'luna';
      return `/assets/characters/${safeType}.png`;
  };

  // --- STICKER MODE (For Cabinet Belly Glass & Icons) ---
  // Must return pure SVG elements (no div) to work inside CabinetSVG
  if (stickerMode) {
      return (
        <svg viewBox="0 0 512 768" overflow="visible">
             <defs>
                 <filter id="stickerGlow">
                     <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
                     <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                 </filter>
             </defs>
             {/* Glow Background */}
             <image 
                href={getAssetPath(type)} 
                x="0" y="0" width="512" height="768"
                filter="url(#stickerGlow)" opacity="0.5"
                transform="scale(1.05) translate(-12, -10)"
             />
             {/* Main Image */}
             <image 
                href={getAssetPath(type)} 
                x="0" y="0" width="512" height="768"
                preserveAspectRatio="xMidYMid meet"
             />
        </svg>
      );
  }

  // --- STAGE MODE (For Game View / Lobby) ---
  // Full resolution with CSS animations
  return (
    <svg 
        viewBox="0 0 512 768" 
        className={`w-full h-full drop-shadow-2xl transition-all duration-500 
            ${isWin ? 'drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]' : ''}
            ${isSad ? 'grayscale-[50%] brightness-75' : 'contrast-110'}
        `} 
        style={{transform: `scale(${scale})`}}
    >
      <defs>
          <filter id="winFlash">
              <feColorMatrix type="matrix" values="
                  1.5 0 0 0 0
                  0 1.5 0 0 0
                  0 0 1.5 0 0
                  0 0 0 1 0" />
          </filter>
      </defs>

      {/* Shadow */}
      <ellipse cx="256" cy="740" rx="180" ry="20" fill="black" opacity="0.4" filter="blur(10px)" />

      {/* Character Sprite */}
      <image 
        href={getAssetPath(type)} 
        x="0" y="0" width="512" height="768"
        preserveAspectRatio="xMidYMid meet"
        className={isWin ? 'animate-bounce' : 'animate-[pulse_4s_ease-in-out_infinite]'}
        filter={isWin ? 'url(#winFlash)' : ''}
      />

      {/* Win Sparkles */}
      {isWin && (
          <g>
              <circle cx="100" cy="200" r="10" fill="white" className="animate-ping" opacity="0.8" />
              <circle cx="400" cy="300" r="15" fill="gold" className="animate-ping" style={{animationDelay:'0.2s'}} />
              <circle cx="256" cy="100" r="20" fill="white" className="animate-ping" style={{animationDelay:'0.5s'}} />
          </g>
      )}
    </svg>
  );
};

export default memo(CharacterSVG);