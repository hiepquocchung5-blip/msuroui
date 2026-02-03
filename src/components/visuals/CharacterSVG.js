import React, { memo } from 'react';

const CharacterSVG = ({
  type = 'luna',
  mood = 'idle', // idle | win | sad
  scale = 1,
  stickerMode = false
}) => {
  const isWin = mood === 'win';
  const isSad = mood === 'sad';

  /* ===================== 1. DEFINITIONS & MATERIALS ===================== */
  const renderDefs = () => (
    <defs>
      {/* SKIN TONES (Realistic Shading) */}
      <linearGradient id="skinBase" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FAD0C4"/><stop offset="50%" stopColor="#FFD1DC"/><stop offset="100%" stopColor="#E6B8AD"/></linearGradient>
      <radialGradient id="skinHighlight" cx="0.3" cy="0.3" r="0.5"><stop offset="0%" stopColor="rgba(255,255,255,0.6)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/></radialGradient>
      <linearGradient id="skinShadow" x1="1" y1="0" x2="0" y2="0"><stop offset="0%" stopColor="rgba(160,82,45,0.3)"/><stop offset="100%" stopColor="rgba(0,0,0,0)"/></linearGradient>
      
      <linearGradient id="skinTan" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#F5DEB3"/><stop offset="100%" stopColor="#D2B48C"/></linearGradient>
      <linearGradient id="skinPale" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFF0F5"/><stop offset="100%" stopColor="#E6E6FA"/></linearGradient>

      {/* HAIR TEXTURES */}
      <linearGradient id="hairOrange" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFA500"/><stop offset="100%" stopColor="#FF4500"/></linearGradient>
      <linearGradient id="hairBlack" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#444"/><stop offset="50%" stopColor="#111"/><stop offset="100%" stopColor="#000"/></linearGradient>
      <linearGradient id="hairBlonde" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFFACD"/><stop offset="100%" stopColor="#FFD700"/></linearGradient>
      <linearGradient id="hairRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF6347"/><stop offset="100%" stopColor="#8B0000"/></linearGradient>
      <linearGradient id="hairWhite" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFF"/><stop offset="100%" stopColor="#DDD"/></linearGradient>
      <linearGradient id="hairPurple" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D8BFD8"/><stop offset="100%" stopColor="#4B0082"/></linearGradient>

      {/* CLOTHING MATERIALS */}
      <linearGradient id="fabricBikini" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00CED1"/><stop offset="100%" stopColor="#008B8B"/></linearGradient>
      <linearGradient id="fabricDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#333"/><stop offset="100%" stopColor="#000"/></linearGradient>
      <linearGradient id="fabricGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFD700"/><stop offset="100%" stopColor="#B8860B"/></linearGradient>
      <linearGradient id="fabricRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF0000"/><stop offset="100%" stopColor="#800000"/></linearGradient>
      <linearGradient id="latexShiny" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#333"/><stop offset="50%" stopColor="#777"/><stop offset="100%" stopColor="#111"/></linearGradient>

      <filter id="softShadow"><feGaussianBlur stdDeviation="2" result="blur"/><feOffset in="blur" dx="2" dy="2" result="offsetBlur"/><feMerge><feMergeNode in="offsetBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
  );

  /* ===================== 2. REALISTIC ANATOMY ===================== */
  
  // High-Detail Face
  const AnimeFace = ({ eyeColor = "#00BFFF", hairBack, hairFront }) => (
      <g transform="translate(0, -20)">
          {/* Back Hair */}
          {hairBack}

          {/* Neck */}
          <path d="M245,200 L245,240 L267,240 L267,200" fill="url(#skinBase)" />
          <path d="M245,200 L245,240 L255,240 L255,200" fill="url(#skinShadow)" opacity="0.3" />

          {/* Face Shape */}
          <path d="M210,130 Q210,230 256,260 Q302,230 302,130 Q302,60 256,60 Q210,60 210,130" fill="url(#skinBase)" />
          
          {/* Eyes */}
          <g transform="translate(0, 10)">
              {/* Left */}
              <g transform="translate(228, 160)">
                  <path d="M-12,-8 Q0,-15 12,-5" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" /> {/* Lash */}
                  <ellipse cx="0" cy="0" rx="9" ry="7" fill="#FFF" />
                  <ellipse cx="0" cy="0" rx="5" ry="6" fill={eyeColor} />
                  <circle cx="0" cy="0" r="2" fill="#000" />
                  <circle cx="-3" cy="-3" r="1.5" fill="#FFF" opacity="0.9" />
              </g>
              {/* Right */}
              <g transform="translate(284, 160)">
                  <path d="M-12,-8 Q0,-15 12,-5" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
                  <ellipse cx="0" cy="0" rx="9" ry="7" fill="#FFF" />
                  <ellipse cx="0" cy="0" rx="5" ry="6" fill={eyeColor} />
                  <circle cx="0" cy="0" r="2" fill="#000" />
                  <circle cx="-3" cy="-3" r="1.5" fill="#FFF" opacity="0.9" />
              </g>
          </g>

          {/* Blush & Mouth */}
          <ellipse cx="225" cy="185" rx="10" ry="5" fill="#FF69B4" opacity="0.2" />
          <ellipse cx="287" cy="185" rx="10" ry="5" fill="#FF69B4" opacity="0.2" />
          <path d={isWin ? "M246,215 Q256,225 266,215" : (isSad ? "M246,220 Q256,210 266,220" : "M252,215 Q256,218 260,215")} stroke="#D56868" strokeWidth="1.5" fill="none" />
          <path d="M256,190 L254,200 L258,200" fill="rgba(0,0,0,0.1)" /> {/* Nose */}

          {/* Front Hair */}
          {hairFront}
      </g>
  );

  // Full Body Base (Legs, Hips, Torso)
  const FullBody = ({ skinFill = "url(#skinBase)" }) => (
      <g>
          {/* Legs (Thighs to Knees) */}
          <path d="M200,450 Q180,600 210,750 L240,750 L250,550" fill={skinFill} /> {/* Left Leg */}
          <path d="M312,450 Q332,600 302,750 L272,750 L262,550" fill={skinFill} /> {/* Right Leg */}
          <path d="M200,450 Q210,600 205,750" fill="url(#skinShadow)" opacity="0.3" /> {/* Shadow L */}
          <path d="M312,450 Q302,600 307,750" fill="url(#skinShadow)" opacity="0.3" /> {/* Shadow R */}

          {/* Hips & Torso (Hourglass) */}
          <path d="M190,260 Q170,350 190,460 Q256,520 322,460 Q342,350 322,260 L190,260 Z" fill={skinFill} />
          
          {/* Cleavage / Chest */}
          <path d="M200,220 Q200,290 256,290 Q312,290 312,220 L256,220 Z" fill={skinFill} />
          <path d="M256,220 L256,290" stroke="#B8860B" strokeWidth="0.5" opacity="0.2" /> {/* Sternum line */}
          
          {/* Arms */}
          <path d="M180,230 Q160,350 170,450" fill="none" stroke={skinFill} strokeWidth="30" strokeLinecap="round"/>
          <path d="M332,230 Q352,350 342,450" fill="none" stroke={skinFill} strokeWidth="30" strokeLinecap="round"/>
      </g>
  );

  /* ===================== 3. CHARACTER STYLES ===================== */
  // Renamed function to match return call
  const renderCharacter = () => {
    switch(type) {
        // 1. LUNA (Nami Style - Pirate Bikini)
        case 'luna': return (
            <>
                <AnimeFace 
                    eyeColor="#FF8C00"
                    hairBack={<path d="M150,100 Q256,400 362,100 L380,500 L132,500 Z" fill="url(#hairOrange)" />}
                    hairFront={
                        <g fill="none" stroke="url(#hairOrange)" strokeWidth="25" strokeLinecap="round">
                            <path d="M256,80 Q200,150 180,300" /> <path d="M256,80 Q312,150 332,300" />
                        </g>
                    }
                />
                <FullBody />
                {/* Tropical Bikini */}
                <path d="M200,280 Q228,320 256,280 L256,240 L200,240 Z" fill="teal" stroke="white" strokeWidth="2" /> {/* Top L */}
                <path d="M256,280 Q284,320 312,280 L312,240 L256,240 Z" fill="teal" stroke="white" strokeWidth="2" /> {/* Top R */}
                <path d="M200,440 Q256,480 312,440 L312,410 Q256,440 200,410 Z" fill="teal" /> {/* Bottom */}
                {/* Tattoo */}
                <circle cx="185" cy="250" r="8" fill="none" stroke="#000" strokeWidth="2" />
            </>
        );

        // 2. MIKA (Nico Robin Style - Elegant Dark)
        case 'mika': return (
            <>
                <AnimeFace 
                    eyeColor="#00008B"
                    hairBack={<path d="M160,100 L140,500 L372,500 L352,100 Z" fill="url(#hairBlack)" />}
                    hairFront={<path d="M256,80 Q360,80 360,400 L300,400 L256,80" fill="url(#hairBlack)" />}
                />
                <FullBody skinFill="url(#skinTan)" />
                {/* Dark Swimsuit */}
                <path d="M210,250 Q256,350 302,250 L302,460 Q256,500 210,460 Z" fill="#1a1a1a" />
                <path d="M220,250 L240,220 L272,220 L292,250" fill="#1a1a1a" /> {/* Straps */}
                <rect x="230" y="320" width="52" height="5" fill="#333" /> {/* Zipper hint */}
            </>
        );

        // 3. KIRA (Boa Hancock Style - Empress)
        case 'kira': return (
            <>
                <AnimeFace 
                    eyeColor="#00008B"
                    hairBack={<path d="M120,100 Q256,600 392,100" fill="url(#hairBlack)" />}
                    hairFront={
                        <g fill="none" stroke="url(#hairBlack)" strokeWidth="30">
                            <path d="M256,60 Q180,150 180,450" /> <path d="M256,60 Q332,150 332,450" />
                        </g>
                    }
                />
                <FullBody />
                {/* Royal Bikini */}
                <path d="M200,280 Q228,330 256,280" fill="#800000" stroke="gold" strokeWidth="3" />
                <path d="M256,280 Q284,330 312,280" fill="#800000" stroke="gold" strokeWidth="3" />
                <path d="M200,440 Q256,500 312,440 L312,400 Q256,440 200,400 Z" fill="#800000" />
                <path d="M190,420 L322,420" stroke="gold" strokeWidth="4" fill="none" /> {/* Belt */}
            </>
        );

        // 4. YAMI (Rangiku Style - Relaxed)
        case 'yami': return (
            <>
                <AnimeFace 
                    eyeColor="#ADD8E6"
                    hairBack={<path d="M140,120 Q256,400 372,120" fill="#FFA500" />}
                    hairFront={<path d="M256,80 Q320,200 350,300 L256,100 L162,300" fill="#FFA500" />}
                />
                <FullBody />
                {/* Loose Top */}
                <path d="M180,240 Q256,350 332,240 L340,400 Q256,420 172,400 Z" fill="#FFC0CB" opacity="0.9" />
                <path d="M256,240 L256,350" stroke="#000" strokeWidth="1" opacity="0.2" /> {/* Open middle */}
                <path d="M200,450 Q256,480 312,450" fill="#000" /> {/* Bikini bottom */}
            </>
        );

        // 5. GLACIA (Tsunade Style - Power)
        case 'glacia': return (
            <>
                <AnimeFace 
                    eyeColor="#B8860B"
                    hairBack={<path d="M160,150 L140,400 L372,400 L352,150 Z" fill="url(#hairBlonde)" />}
                    hairFront={<path d="M200,100 L180,300 M312,100 L332,300" stroke="url(#hairBlonde)" strokeWidth="20" fill="none" />}
                />
                <FullBody />
                {/* Minimalist Bikini */}
                <path d="M200,260 L312,260 L312,320 L200,320 Z" fill="#EEE" stroke="#CCC" strokeWidth="1" /> {/* Wrap */}
                <path d="M256,260 L256,320" stroke="#DDD" strokeWidth="2" />
                <path d="M200,440 Q256,490 312,440" fill="#333" />
            </>
        );

        // 6. AERIS (Faye Style - Retro)
        case 'sky': return (
            <>
                <AnimeFace 
                    eyeColor="#228B22"
                    hairBack={<circle cx="256" cy="150" r="100" fill="url(#hairPurple)" />}
                    hairFront={<path d="M256,80 L200,200 L312,200 Z" fill="url(#hairPurple)" />}
                />
                <FullBody />
                {/* Yellow Bra & Shorts */}
                <path d="M200,280 Q228,320 256,280" fill="#FFD700" />
                <path d="M256,280 Q284,320 312,280" fill="#FFD700" />
                <rect x="200" y="420" width="112" height="60" fill="#FFF" /> {/* Shorts */}
                <rect x="200" y="420" width="112" height="10" fill="#FF0000" /> {/* Belt */}
            </>
        );

        // 7. IVY (Revy Style - Rebel)
        case 'ivy': return (
            <>
                <AnimeFace 
                    eyeColor="#800000"
                    hairBack={<path d="M150,150 Q256,100 362,150" fill="url(#hairRed)" />}
                    hairFront={<path d="M256,80 L230,250 M256,80 L282,250" stroke="url(#hairRed)" strokeWidth="20" fill="none" />}
                />
                <FullBody skinFill="url(#skinTan)" />
                {/* Cropped Tank */}
                <rect x="200" y="260" width="112" height="60" fill="#000" />
                {/* Low rise jeans/bikini */}
                <path d="M190,460 Q256,500 322,460 L322,500 L190,500 Z" fill="#4B0082" />
                <rect x="180" y="480" width="20" height="40" fill="#333" /> {/* Holster */}
            </>
        );

        // 8. V-77 (Erza Style - Armor)
        case 'cyber': return (
            <>
                <AnimeFace 
                    eyeColor="#F00"
                    hairBack={<path d="M120,100 L400,100 L350,500 L160,500 Z" fill="#8B0000" />}
                    hairFront={<path d="M256,80 Q320,150 300,400" fill="none" stroke="#8B0000" strokeWidth="40" />}
                />
                <FullBody />
                {/* Armored Bikini */}
                <circle cx="228" cy="290" r="30" fill="silver" stroke="#333" strokeWidth="2" />
                <circle cx="284" cy="290" r="30" fill="silver" stroke="#333" strokeWidth="2" />
                <path d="M200,450 Q256,500 312,450 L312,420 Q256,450 200,420 Z" fill="silver" stroke="#333" />
                <circle cx="256" cy="430" r="10" fill="blue" filter="url(#softGlow)" />
            </>
        );
        
        // 9. PENNY (Mirajane Style - Pastel)
        case 'penny': return (
            <>
                <AnimeFace 
                    eyeColor="#1E90FF"
                    hairBack={<path d="M140,150 Q256,500 372,150" fill="url(#hairWhite)" />}
                    hairFront={<path d="M256,60 Q150,150 150,300 M256,60 Q362,150 362,300" stroke="url(#hairWhite)" strokeWidth="40" fill="none" />}
                />
                <FullBody skinFill="url(#skinPale)" />
                {/* Pastel Pink Ruffled Bikini */}
                <path d="M200,280 Q228,320 256,280" fill="#FFB6C1" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
                <path d="M256,280 Q284,320 312,280" fill="#FFB6C1" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
                <path d="M200,440 Q256,480 312,440" fill="#FFB6C1" />
            </>
        );

        // 10. NOVA (Yor Style - Assassin)
        case 'void': return (
            <>
                <AnimeFace 
                    eyeColor="#FF0000"
                    hairBack={<path d="M150,100 L362,100 L362,500 L150,500 Z" fill="#000" />}
                    hairFront={<path d="M256,80 L200,300 L256,150 L312,300 Z" fill="#000" />}
                />
                <FullBody />
                {/* Modern Strappy Bikini */}
                <path d="M200,280 L230,320 L256,280" fill="#000" />
                <path d="M256,280 L282,320 L312,280" fill="#000" />
                <path d="M220,280 L292,280" stroke="#000" strokeWidth="5" />
                <path d="M200,440 Q256,500 312,440" fill="#000" />
                <path d="M190,440 L322,440" stroke="#000" strokeWidth="2" /> {/* Hip straps */}
            </>
        );

        default: return <><FullBody /><AnimeFace /></>;
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
    <svg viewBox="0 0 512 800" className={`w-full h-full drop-shadow-2xl transition-all duration-500 ${isWin ? 'scale-110 drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]' : ''}`} style={{transform: `scale(${scale})`}}>
      {renderDefs()}
      <g className={isWin ? 'animate-bounce' : 'animate-[pulse_6s_infinite]'}>
         {renderCharacter()}
      </g>
      {/* Sparkles */}
      {isWin && (
          <g>
              <circle cx="150" cy="200" r="10" fill="white" className="animate-ping" />
              <circle cx="350" cy="250" r="15" fill="gold" className="animate-ping" />
          </g>
      )}
    </svg>
  );
};

export default memo(CharacterSVG);