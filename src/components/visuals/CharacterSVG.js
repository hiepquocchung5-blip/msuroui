import React from 'react';

const CharacterSVG = ({
  type = 'luna',
  mood = 'idle', // idle | win
  scale = 1,
  stickerMode = false
}) => {
  const isWin = mood === 'win';

  /* ===================== JOINT DEFINITIONS ===================== */
  const renderDefs = () => (
    <defs>
      {/* SKIN TONES */}
      <radialGradient id="skinLight" cx="0.5" cy="0.4" r="0.6"><stop offset="0%" stopColor="#FFF5EE" /><stop offset="100%" stopColor="#FFDBAC" /></radialGradient>
      <radialGradient id="skinPale" cx="0.5" cy="0.4" r="0.6"><stop offset="0%" stopColor="#FFF" /><stop offset="100%" stopColor="#E6E6FA" /></radialGradient>
      <radialGradient id="skinTan" cx="0.5" cy="0.4" r="0.6"><stop offset="0%" stopColor="#FFE0BD" /><stop offset="100%" stopColor="#C68642" /></radialGradient>
      <radialGradient id="skinAlien" cx="0.5" cy="0.4" r="0.6"><stop offset="0%" stopColor="#E0FFFF" /><stop offset="100%" stopColor="#8A2BE2" /></radialGradient>

      {/* HAIR GRADIENTS */}
      <linearGradient id="hairLuna" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4B0082" /><stop offset="100%" stopColor="#8A2BE2" /></linearGradient>
      <linearGradient id="hairMika" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFFACD" /><stop offset="100%" stopColor="#FFD700" /></linearGradient>
      <linearGradient id="hairKira" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF4500" /><stop offset="100%" stopColor="#800000" /></linearGradient>
      <linearGradient id="hairGlacia" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E0FFFF" /><stop offset="100%" stopColor="#00BFFF" /></linearGradient>
      <linearGradient id="hairSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#87CEEB" /></linearGradient>
      <linearGradient id="hairBio" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#32CD32" /><stop offset="100%" stopColor="#006400" /></linearGradient>
      
      {/* MATERIALS */}
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFF4B0" /><stop offset="50%" stopColor="#FFD700" /><stop offset="100%" stopColor="#B8860B" /></linearGradient>
      <linearGradient id="latex" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#333" /><stop offset="50%" stopColor="#555" /><stop offset="100%" stopColor="#111" /></linearGradient>
      <linearGradient id="cyberMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C0C0C0" /><stop offset="100%" stopColor="#444" /></linearGradient>
      <linearGradient id="magma" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#330000"/><stop offset="60%" stopColor="#FF4500"/><stop offset="100%" stopColor="#FFD700"/></linearGradient>
      <radialGradient id="void"><stop offset="0%" stopColor="#8A2BE2" /><stop offset="100%" stopColor="#000" /></radialGradient>

      
      <filter id="softGlow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
  );

  /* ===================== ANATOMY HELPERS ===================== */
  
  // Anime Eyes Generator
  const AnimeEyes = ({ color = "#4B0082", shape = "round" }) => (
    <g className="char-eyes">
        {/* Sclera */}
        <ellipse cx="230" cy="195" rx="16" ry="12" fill="#FFF" />
        <ellipse cx="282" cy="195" rx="16" ry="12" fill="#FFF" />
        
        {/* Iris */}
        <ellipse cx="230" cy="195" rx="9" ry="11" fill={color} />
        <ellipse cx="282" cy="195" rx="9" ry="11" fill={color} />
        
        {/* Pupil */}
        <ellipse cx="230" cy="195" rx="4" ry="5" fill="#000" />
        <ellipse cx="282" cy="195" rx="4" ry="5" fill="#000" />
        
        {/* Highlights (The Anime Look) */}
        <circle cx="234" cy="190" r="3" fill="#FFF" opacity="0.9" />
        <circle cx="286" cy="190" r="3" fill="#FFF" opacity="0.9" />
        
        {/* Lashes */}
        <path d="M214,190 Q230,180 246,190" fill="none" stroke="#000" strokeWidth={shape==='sharp'?3:2} />
        <path d="M266,190 Q282,180 298,190" fill="none" stroke="#000" strokeWidth={shape==='sharp'?3:2} />
    </g>
  );

  const BaseHead = ({ skinId = "skinLight" }) => (
      <g className="char-head">
          <path d="M256,260 Q186,260 196,160 Q200,100 256,100 Q312,100 316,160 Q326,260 256,260 Z" fill={`url(#${skinId})`} />
          <path d="M256,260 L240,300 L272,300 Z" fill={`url(#${skinId})`} /> {/* Neck */}
          {/* Blush */}
          <ellipse cx="215" cy="215" rx="10" ry="6" fill="#FFB6C1" opacity="0.4" />
          <ellipse cx="297" cy="215" rx="10" ry="6" fill="#FFB6C1" opacity="0.4" />
          {/* Mouth */}
          <path d={isWin ? "M246,235 Q256,245 266,235" : "M250,235 L262,235"} stroke="#C14444" strokeWidth="2" fill="none" />
      </g>
  );

  /* ===================== CHARACTER RENDERERS ===================== */

  const renderCharacter = () => {
    switch(type) {
        // 1. LUNA (Moon Hostess)
        case 'luna':
  return (
    <>
      {/* ================== DEFINITIONS ================== */}
      <defs>
        {/* Hair Gradients */}
        <linearGradient id="lunaHairBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A0F4F" />
          <stop offset="100%" stopColor="#090014" />
        </linearGradient>

        <linearGradient id="lunaHairMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B3FA0" />
          <stop offset="100%" stopColor="#1A062E" />
        </linearGradient>

        <linearGradient id="lunaHairFront" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B58BFF" />
          <stop offset="100%" stopColor="#4A1775" />
        </linearGradient>

        {/* Skin */}
        <linearGradient id="lunaSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F1C7A8" />
          <stop offset="100%" stopColor="#D8A98B" />
        </linearGradient>
      </defs>

      {/* ================== BACK HAIR ================== */}
      <path
        d="
          M140,160
          C110,340 150,560 256,620
          C362,560 402,340 372,160
          Q256,120 140,160 Z
        "
        fill="url(#lunaHairBack)"
      />

      {/* ================== BODY (BUNNY SUIT) ================== */}
      <path
        d="
          M180,300
          C165,360 180,460 200,540
          Q256,590 312,540
          C332,460 347,360 332,300
          Q256,265 180,300 Z
        "
        fill="#0D0D0F"
      />

      {/* Suit Highlight */}
      <path
        d="M200,330 Q256,350 312,330"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="3"
        fill="none"
      />

      {/* Collar */}
      <path
        d="M190,300 L322,300 L322,345 Q256,375 190,345 Z"
        fill="#FFFFFF"
        opacity="0.92"
      />

      {/* ================== NECK ================== */}
      <path
        d="
          M232,260
          Q256,272 280,260
          L285,315
          Q256,332 227,315 Z
        "
        fill="url(#lunaSkin)"
      />

      {/* Jaw Shadow */}
      <path
        d="
          M220,225
          Q256,252 292,225
          Q256,268 220,225 Z
        "
        fill="#C79674"
        opacity="0.35"
      />

      {/* ================== HEAD & EYES ================== */}
      <BaseHead />
      <AnimeEyes color="#8A2BE2" />

      {/* Eye Wet Highlights */}
      <circle cx="245" cy="210" r="3" fill="white" opacity="0.8" />
      <circle cx="267" cy="210" r="3" fill="white" opacity="0.8" />

      {/* ================== MID HAIR ================== */}
      <path
        d="
          M165,145
          C140,280 185,440 256,470
          C327,440 372,280 347,145
          Q256,115 165,145 Z
        "
        fill="url(#lunaHairMid)"
      />

      {/* ================== FRONT HAIR STRANDS ================== */}
      <path
        d="M230,110 C200,230 210,370"
        stroke="url(#lunaHairFront)"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M282,110 C312,230 302,370"
        stroke="url(#lunaHairFront)"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />

      {/* ================== BUNNY EARS ================== */}
      {/* Left Ear */}
      <path
        d="M200,120 C180,40 145,20 165,140"
        fill="#0D0D0F"
      />
      <path
        d="M190,120 C175,60 165,55 175,130"
        fill="#E8A8C8"
        opacity="0.75"
      />

      {/* Right Ear */}
      <path
        d="M312,120 C332,40 367,20 347,140"
        fill="#0D0D0F"
      />
      <path
        d="M322,120 C337,60 347,55 337,130"
        fill="#E8A8C8"
        opacity="0.75"
      />
    </>
  );


        // 2. MIKA (Beach)
        case 'mika': return (
            <>
                <path d="M100,180 Q50,300 80,500" stroke="url(#hairMika)" strokeWidth="60" fill="none" className="hair-back" />
                <path d="M412,180 Q462,300 432,500" stroke="url(#hairMika)" strokeWidth="60" fill="none" className="hair-back" />
                {/* Body (Bikini) */}
                <path d="M200,300 Q256,280 312,300 L310,450 Q256,500 202,450 Z" fill="url(#skinTan)" />
                <path d="M200,450 Q256,500 312,450 L312,500 Q256,550 200,500 Z" fill="#FF69B4" /> {/* Skirt */}
                <circle cx="230" cy="360" r="30" fill="#FF69B4" /> <circle cx="282" cy="360" r="30" fill="#FF69B4" />
                <BaseHead skinId="skinTan" /> <AnimeEyes color="#00BFFF" />
                <path d="M256,100 Q350,150 350,300" fill="none" stroke="url(#hairMika)" strokeWidth="20" />
                {/* Flower */}
                <circle cx="320" cy="150" r="20" fill="white" className={isWin ? "fx-spin" : ""} />
            </>
        );

        // 3. KIRA (Volcano)
        case 'kira': return (
            <>
                <path d="M256,80 L150,200 L256,150 L362,200 Z" fill="url(#hairKira)" />
                {/* Armor */}
                <path d="M180,300 Q256,280 332,300 L320,550 Q256,600 192,550 Z" fill="#300" stroke="#FF4500" strokeWidth="2" />
                <rect x="220" y="320" width="72" height="100" fill="#111" opacity="0.5" />
                <BaseHead /> <AnimeEyes color="#FF4500" shape="sharp" />
                <path d="M256,100 L200,250 L256,150 L312,250 Z" fill="url(#hairKira)" />
                <path d="M200,100 L180,50 L220,100" fill="#FFD700" /> {/* Horn/Tiara */}
            </>
        );

        // 4. YAMI (Dark)
        case 'yami': return (
            <>
                <path d="M50,200 Q256,100 462,200 L400,500 L112,500 Z" fill="#1a0b2e" /> {/* Wings */}
                {/* Body (Latex) */}
                <path d="M190,300 Q256,280 322,300 L320,550 Q256,600 192,550 Z" fill="url(#latex)" />
                <path d="M220,300 L256,400 L292,300" fill="none" stroke="#8A2BE2" strokeWidth="2" />
                <BaseHead skinId="skinPale" /> <AnimeEyes color="#FF00FF" shape="sharp" />
                <path d="M256,100 Q150,150 150,400" fill="none" stroke="#4B0082" strokeWidth="40" />
                <path d="M256,100 Q362,150 362,400" fill="none" stroke="#4B0082" strokeWidth="40" />
                {/* Horns */}
                <path d="M210,120 Q180,50 200,60" stroke="#000" strokeWidth="6" fill="none" />
                <path d="M302,120 Q332,50 312,60" stroke="#000" strokeWidth="6" fill="none" />
            </>
        );

        // 5. GLACIA (Ice)
        case 'glacia': return (
            <>
                <path d="M150,150 L256,100 L362,150 L350,600 L162,600 Z" fill="url(#hairGlacia)" className="hair-back" />
                <path d="M180,300 L332,300 L332,550 L180,550 Z" fill="#00BFFF" />
                <path d="M180,300 L256,400 L332,300" fill="#FFF" opacity="0.8" /> {/* Fur */}
                <BaseHead skinId="skinPale" /> <AnimeEyes color="#00FFFF" />
                <path d="M200,100 L256,80 L312,100" fill="none" stroke="#E0FFFF" strokeWidth="4" /> {/* Crown */}
            </>
        );

        // 6. AERIS (Sky)
        case 'sky': return (
            <>
                <path d="M50,250 Q100,100 200,250" fill="#FFF" opacity="0.8" className={isWin ? "fx-pulse" : ""} />
                <path d="M462,250 Q412,100 312,250" fill="#FFF" opacity="0.8" className={isWin ? "fx-pulse" : ""} />
                <path d="M190,300 Q256,280 322,300 L330,600 L180,600 Z" fill="#FFF" stroke="#FFD700" strokeWidth="1" />
                <BaseHead /> <AnimeEyes color="#87CEEB" />
                <path d="M256,100 Q150,150 180,450" fill="none" stroke="url(#hairSky)" strokeWidth="30" />
                <path d="M256,100 Q360,150 330,450" fill="none" stroke="url(#hairSky)" strokeWidth="30" />
                <ellipse cx="256" cy="70" rx="40" ry="10" fill="none" stroke="#FFD700" strokeWidth="3" filter="url(#softGlow)" />
            </>
        );

        // 7. IVY (Bio/Elf)
        case 'bio': return (
            <>
                <path d="M150,150 Q256,350 362,150" fill="none" stroke="url(#hairBio)" strokeWidth="80" />
                <path d="M190,300 Q256,280 322,300 L320,550 Q256,600 192,550 Z" fill="#228B22" />
                <path d="M200,300 L256,450 L312,300" fill="#32CD32" opacity="0.5" />
                <BaseHead /> <AnimeEyes color="#00FF00" />
                <path d="M180,140 L160,100 L180,120" fill="url(#skinLight)" /> {/* Elf Ear L */}
                <path d="M332,140 L352,100 L332,120" fill="url(#skinLight)" /> {/* Elf Ear R */}
                <path d="M200,100 Q256,150 312,100" fill="none" stroke="url(#hairBio)" strokeWidth="15" />
            </>
        );

        // 8. V-77 (Cyber)
        case 'cyber': return (
            <>
                <rect x="150" y="120" width="212" height="400" fill="url(#cyberMetal)" rx="20" />
                <path d="M190,300 L322,300 L310,550 L202,550 Z" fill="#222" stroke="#0F0" />
                <BaseHead skinId="skinPale" /> <AnimeEyes color="#0F0" shape="sharp" />
                <rect x="210" y="185" width="92" height="20" fill="#111" /> {/* Visor */}
                <rect x="220" y="190" width="72" height="10" fill="#0F0" className="fx-pulse" />
                <path d="M180,250 L160,350" stroke="#000" strokeWidth="5" /> {/* Cable */}
            </>
        );

        // 9. PENNY (Gold)
        case 'gold': return (
            <>
                <path d="M150,150 Q256,50 362,150 L350,500 L160,500 Z" fill="#8B4513" />
                <path d="M190,300 L322,300 L322,550 L190,550 Z" fill="#DEB887" />
                <rect x="200" y="300" width="20" height="250" fill="#5D4037" /> <rect x="290" y="300" width="20" height="250" fill="#5D4037" />
                <BaseHead /> <AnimeEyes color="#DAA520" />
                <g transform="translate(256, 120)">
                    <circle r="30" fill="none" stroke="#B8860B" strokeWidth="5" />
                    <rect x="-35" y="-10" width="70" height="20" fill="rgba(255,255,255,0.3)" stroke="#555" /> {/* Goggles */}
                </g>
            </>
        );

        // 10. NOVA (Void)
        case 'void': return (
            <>
                <circle cx="256" cy="250" r="140" fill="url(#void)" opacity="0.6" className="fx-spin" />
                <path d="M200,300 L312,300 L300,550 L212,550 Z" fill="#000" />
                <BaseHead skinId="skinAlien" /> <AnimeEyes color="#FFF" />
                <circle cx="256" cy="100" r="5" fill="white" className="fx-pulse" />
                <circle cx="200" cy="50" r="3" fill="white" className="fx-pulse" />
                <circle cx="310" cy="60" r="4" fill="white" className="fx-pulse" />
            </>
        );

        default: return <BaseHead />;
    }
  };

  if (stickerMode) {
      return (
        <svg viewBox="0 0 100 100" className="drop-shadow-sm">
             <g transform="translate(-200, -100) scale(0.4)">
                {renderDefs()}
                {renderCharacter()}
             </g>
        </svg>
      );
  }

  return (
    <svg viewBox="0 0 512 768" className={`w-full h-full drop-shadow-2xl transition-all duration-500 ${isWin ? 'scale-110 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]' : 'character-idle'}`} style={{transform: `scale(${scale})`}}>
      {renderDefs()}
      <g className={isWin ? 'character-win' : ''}>
         {renderCharacter()}
      </g>
    </svg>
  );
};

export default CharacterSVG;