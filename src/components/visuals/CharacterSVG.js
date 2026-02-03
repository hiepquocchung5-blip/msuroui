import React, { memo } from 'react';

const CharacterSVG = ({
  type = 'luna',
  mood = 'idle', // idle | win | sad
  scale = 1,
  stickerMode = false
}) => {
  const isWin = mood === 'win';
  const isSad = mood === 'sad';

  /* ===================== JOINT DEFINITIONS ===================== */
  const renderDefs = () => (
    <defs>
      {/* SKIN TONES (Realistic Shading) */}
      <radialGradient id="skinLight" cx="0.4" cy="0.4" r="0.8"><stop offset="0%" stopColor="#FFF0E5" /><stop offset="100%" stopColor="#EBC6A6" /></radialGradient>
      <radialGradient id="skinTan" cx="0.4" cy="0.4" r="0.8"><stop offset="0%" stopColor="#F5D0A9" /><stop offset="100%" stopColor="#A67B5B" /></radialGradient>
      <radialGradient id="skinPale" cx="0.4" cy="0.4" r="0.8"><stop offset="0%" stopColor="#FFF" /><stop offset="100%" stopColor="#E0E0FF" /></radialGradient>
      <linearGradient id="skinShadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(100,50,0,0.2)"/></linearGradient>

      {/* HAIR GRADIENTS */}
      <linearGradient id="hairLuna" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2e1a47"/><stop offset="100%" stopColor="#5e3987"/></linearGradient>
      <linearGradient id="hairMika" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFFACD"/><stop offset="100%" stopColor="#FFD700"/></linearGradient>
      <linearGradient id="hairKira" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#800"/><stop offset="100%" stopColor="#F00"/></linearGradient>

      {/* MATERIALS */}
      <linearGradient id="latex" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#222"/><stop offset="50%" stopColor="#666"/><stop offset="100%" stopColor="#111"/></linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C5A059"/><stop offset="40%" stopColor="#FFD700"/><stop offset="100%" stopColor="#DAA520"/></linearGradient>
      <radialGradient id="void"><stop offset="0%" stopColor="#000"/><stop offset="100%" stopColor="#4B0082"/></radialGradient>

      <filter id="softGlow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
  );

  /* ===================== ANATOMY HELPERS ===================== */
  
  // Realistic Anime Eyes
  const AnimeEyes = ({ color = "#8A2BE2" }) => (
    <g className="char-eyes" transform={isSad ? "translate(0, 5) scale(1, 0.8)" : ""}>
        <g transform="translate(225, 190)"> {/* Left Eye */}
            <path d="M-15,-5 Q0,-15 15,-5" fill="none" stroke="#000" strokeWidth="3" /> {/* Lash */}
            <ellipse cx="0" cy="0" rx="10" ry="12" fill="#FFF" />
            <ellipse cx="0" cy="0" rx="6" ry="8" fill={color} />
            <circle cx="0" cy="0" r="3" fill="#000" />
            <circle cx="-3" cy="-3" r="2" fill="#FFF" opacity="0.8" />
        </g>
        <g transform="translate(287, 190)"> {/* Right Eye */}
            <path d="M-15,-5 Q0,-15 15,-5" fill="none" stroke="#000" strokeWidth="3" />
            <ellipse cx="0" cy="0" rx="10" ry="12" fill="#FFF" />
            <ellipse cx="0" cy="0" rx="6" ry="8" fill={color} />
            <circle cx="0" cy="0" r="3" fill="#000" />
            <circle cx="-3" cy="-3" r="2" fill="#FFF" opacity="0.8" />
        </g>
    </g>
  );

  // Female Body Base (Hourglass)
  const FemaleBody = ({ skinId = "skinLight" }) => (
      <g>
          {/* Neck */}
          <rect x="246" y="240" width="20" height="40" fill={`url(#${skinId})`} />
          {/* Torso / Cleavage */}
          <path d="M210,280 Q256,380 302,280 L310,450 Q256,500 202,450 Z" fill={`url(#${skinId})`} />
          {/* Cleavage Shadow */}
          <path d="M256,280 L256,330" stroke="#CD853F" strokeWidth="1" opacity="0.3" />
          {/* Arms (Shoulders) */}
          <path d="M200,280 Q180,320 180,400" fill="none" stroke={`url(#${skinId})`} strokeWidth="35" strokeLinecap="round"/>
          <path d="M312,280 Q332,320 332,400" fill="none" stroke={`url(#${skinId})`} strokeWidth="35" strokeLinecap="round"/>
      </g>
  );

  // Head
  const Head = ({ skinId = "skinLight" }) => (
      <g>
          <path d="M256,260 Q196,260 196,160 Q200,90 256,90 Q312,90 316,160 Q316,260 256,260 Z" fill={`url(#${skinId})`} />
          {/* Blush */}
          <ellipse cx="215" cy="220" rx="12" ry="6" fill="#FFB6C1" opacity="0.3" />
          <ellipse cx="297" cy="220" rx="12" ry="6" fill="#FFB6C1" opacity="0.3" />
          {/* Mouth */}
          <path d={isWin ? "M246,240 Q256,255 266,240" : (isSad ? "M246,250 Q256,240 266,250" : "M250,245 L262,245")} stroke="#D56868" strokeWidth="2" fill="none" />
          {/* Nose */}
          <path d="M256,220 L252,230 L260,230" fill="rgba(0,0,0,0.1)" />
      </g>
  );

  /* ===================== CHARACTER RENDERERS ===================== */

  const renderCharacter = () => {
    switch(type) {
        // 1. LUNA (Vegas Bunny)
        case 'luna': return (
            <>
                <path d="M150,150 Q256,400 362,150 L350,600 L162,600 Z" fill="url(#hairLuna)" className="hair-back" />
                <FemaleBody />
                {/* Lingerie: Bunny Bustier */}
                <path d="M200,320 Q256,420 312,320 L312,480 Q256,520 200,480 Z" fill="#111" />
                <path d="M200,320 Q230,360 256,320" fill="#222" opacity="0.8"/> {/* Left Cup */}
                <path d="M256,320 Q282,360 312,320" fill="#222" opacity="0.8"/> {/* Right Cup */}
                {/* Bowtie */}
                <path d="M246,275 L230,265 L230,285 Z" fill="black"/> <path d="M266,275 L282,265 L282,285 Z" fill="black"/> <circle cx="256" cy="275" r="5" fill="red"/>
                
                <Head /> <AnimeEyes color="#9370DB" />
                
                {/* Bunny Ears */}
                <path d="M200,100 L180,20 L220,100" fill="#111" /> <path d="M195,90 L185,40 L210,90" fill="pink" />
                <path d="M312,100 L332,20 L292,100" fill="#111" /> <path d="M317,90 L327,40 L302,90" fill="pink" />
                
                {/* Hair Front */}
                <path d="M256,90 Q150,150 180,400" fill="none" stroke="url(#hairLuna)" strokeWidth="30" strokeLinecap="round" />
                <path d="M256,90 Q360,150 330,400" fill="none" stroke="url(#hairLuna)" strokeWidth="30" strokeLinecap="round" />
            </>
        );

        // 2. MIKA (Aloha Bikini)
        case 'mika': return (
            <>
                <path d="M120,150 Q256,250 392,150 L400,550 L112,550 Z" fill="url(#hairMika)" className="hair-back" />
                <FemaleBody skinId="skinTan" />
                {/* Bikini Top */}
                <path d="M200,320 Q230,360 256,320 L256,280 L200,280 Z" fill="#FF1493" /> {/* Left Tri */}
                <path d="M256,320 Q282,360 312,320 L312,280 L256,280 Z" fill="#FF1493" /> {/* Right Tri */}
                <path d="M256,320 L256,280" stroke="#FF69B4" strokeWidth="2" /> {/* String */}
                {/* Flower */}
                <circle cx="310" cy="150" r="20" fill="white" /> <circle cx="310" cy="150" r="5" fill="yellow" />
                
                <Head skinId="skinTan" /> <AnimeEyes color="#00BFFF" />
                <path d="M256,90 Q350,150 350,300" fill="none" stroke="url(#hairMika)" strokeWidth="20" />
            </>
        );

        // 3. KIRA (Magma Armor)
        case 'kira': return (
            <>
                <path d="M256,90 L150,200 L256,150 L362,200 Z" fill="url(#hairKira)" />
                <FemaleBody />
                {/* Plate Armor Bra */}
                <circle cx="225" cy="330" r="28" fill="url(#gold)" stroke="#800" strokeWidth="2" />
                <circle cx="287" cy="330" r="28" fill="url(#gold)" stroke="#800" strokeWidth="2" />
                <rect x="250" y="325" width="12" height="10" fill="#300" />
                
                <Head /> <AnimeEyes color="#FF4500" />
                <path d="M256,90 L200,300" fill="none" stroke="url(#hairKira)" strokeWidth="30" />
                <path d="M256,90 L312,300" fill="none" stroke="url(#hairKira)" strokeWidth="30" />
                {/* Crown */}
                <path d="M220,100 L256,60 L292,100" fill="none" stroke="gold" strokeWidth="3" />
            </>
        );

        // 4. YAMI (Noctyra Latex)
        case 'yami': return (
            <>
                {/* Wings */}
                <path d="M100,200 Q256,150 412,200 L350,400 L162,400 Z" fill="#1a0b2e" />
                <FemaleBody skinId="skinPale" />
                {/* Latex Tube Top */}
                <path d="M190,310 Q256,350 322,310 L322,380 Q256,400 190,380 Z" fill="url(#latex)" />
                <path d="M190,310 Q256,350 322,310" fill="none" stroke="#555" strokeWidth="1" /> {/* Highlight */}
                
                <Head skinId="skinPale" /> <AnimeEyes color="#FF00FF" />
                <path d="M256,90 Q150,150 150,400" fill="none" stroke="#4B0082" strokeWidth="40" />
                <path d="M256,90 Q362,150 362,400" fill="none" stroke="#4B0082" strokeWidth="40" />
            </>
        );
        
        // 5. GLACIA (Sheer Ice)
        case 'glacia': return (
            <>
                <FemaleBody skinId="skinPale" />
                {/* Sheer Top */}
                <path d="M190,300 Q256,340 322,300 L322,450 Q256,480 190,450 Z" fill="rgba(200,240,255,0.4)" stroke="white" strokeWidth="0.5" />
                <circle cx="225" cy="330" r="25" fill="rgba(255,255,255,0.6)" /> {/* Coverage */}
                <circle cx="287" cy="330" r="25" fill="rgba(255,255,255,0.6)" />
                
                <Head skinId="skinPale" /> <AnimeEyes color="#00FFFF" />
                <path d="M180,150 L256,100 L332,150 L332,600 L180,600 Z" fill="#E0FFFF" opacity="0.5" className="hair-back" />
            </>
        );

        // DEFAULT (Others generic for now to save space, mapping to similar styles)
        default: return <><FemaleBody /><Head /><AnimeEyes /></>;
    }
  };

  if (stickerMode) {
      return (
        <svg viewBox="0 0 100 100" className="drop-shadow-sm">
             <g transform="translate(-200, -80) scale(0.4)">
                {renderDefs()}
                {renderCharacter()}
             </g>
        </svg>
      );
  }

  return (
    <svg viewBox="0 0 512 768" className={`w-full h-full drop-shadow-2xl transition-all duration-500 ${isWin ? 'scale-110 drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]' : ''}`} style={{transform: `scale(${scale})`}}>
      {renderDefs()}
      <g className={isWin ? 'animate-bounce' : 'animate-[pulse_4s_infinite]'}>
         {renderCharacter()}
      </g>
      {/* Sparkles for Win */}
      {isWin && (
          <g>
              <circle cx="100" cy="100" r="10" fill="white" className="animate-ping" />
              <circle cx="400" cy="200" r="15" fill="yellow" className="animate-ping" />
          </g>
      )}
    </svg>
  );
};

export default memo(CharacterSVG);