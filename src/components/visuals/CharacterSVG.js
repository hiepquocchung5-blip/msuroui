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
      {/* --- ANIMATIONS (Live2D Style) --- */}
      <style>{`
        @keyframes breath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015) translateY(-1px); }
        }
        @keyframes blink {
          0%, 48%, 52%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.1); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .live-breath { animation: breath 4s ease-in-out infinite; transform-origin: center 60%; }
        .live-blink { animation: blink 4s infinite; transform-origin: center; }
        .live-hair { animation: sway 3s ease-in-out infinite; transform-origin: top center; }
        .live-float { animation: float 6s ease-in-out infinite; }
      `}</style>

      {/* REALISTIC SKIN TONES (Highlights & Shadows) */}
      <linearGradient id="skinBase" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FAD0C4"/><stop offset="50%" stopColor="#FFD1DC"/><stop offset="100%" stopColor="#E6B8AD"/></linearGradient>
      <radialGradient id="skinHighlight" cx="0.3" cy="0.3" r="0.5"><stop offset="0%" stopColor="rgba(255,255,255,0.6)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/></radialGradient>
      <linearGradient id="skinShadow" x1="1" y1="0" x2="0" y2="0"><stop offset="0%" stopColor="rgba(160,82,45,0.3)"/><stop offset="100%" stopColor="rgba(0,0,0,0)"/></linearGradient>
      
      <linearGradient id="skinTan" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#F5DEB3"/><stop offset="100%" stopColor="#D2B48C"/></linearGradient>
      <linearGradient id="skinPale" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFF0F5"/><stop offset="100%" stopColor="#E6E6FA"/></linearGradient>
      <linearGradient id="skinGreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d4f7d4"/><stop offset="100%" stopColor="#8fbc8f"/></linearGradient>

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

  /* ===================== 2. ANATOMY ENGINE ===================== */
  
  // Helper to scale width from center (256)
  const sx = (x, factor) => 256 + (x - 256) * factor;

  const RealisticBody = ({ 
      skinId = "skinBase", 
      anatomy = { bust: 1.0, waist: 1.0, hips: 1.0, thighs: 1.0 },
      details = { clavicle: true, navel: true, hipDip: true }
  }) => {
      const { bust, waist, hips, thighs } = anatomy;

      return (
        <g className="anatomy-layer">
            {/* 1. Legs (Thighs) - Static Base */}
            <path 
                d={`M${sx(200, hips)},450 Q${sx(170, thighs)},600 ${sx(210, 1)},750 L245,750 L${sx(250, 0.8)},550`} 
                fill={`url(#${skinId})`} 
            />
            <path 
                d={`M${sx(312, hips)},450 Q${sx(342, thighs)},600 ${sx(302, 1)},750 L267,750 L${sx(262, 0.8)},550`} 
                fill={`url(#${skinId})`} 
            />
            {/* Inner Thigh Softness */}
            <path d="M250,550 Q256,600 250,650" stroke="rgba(0,0,0,0.1)" strokeWidth="4" fill="none" filter="url(#softShadow)" />

            {/* 2. Torso (Hourglass) - Breaths */}
            <g className={stickerMode ? '' : 'live-breath'}>
                <path 
                    d={`
                        M${sx(190, 1)},260 
                        Q${sx(165, waist)},350 ${sx(185, hips)},470 
                        Q256,525 ${sx(327, hips)},470 
                        Q${sx(347, waist)},350 ${sx(322, 1)},260 
                        Z
                    `} 
                    fill={`url(#${skinId})`} 
                />
                
                {/* Hip Dips / Shadows */}
                {details.hipDip && (
                    <>
                        <path d={`M${sx(185, hips)},470 Q${sx(200, hips)},480 ${sx(210, hips)},500`} stroke="rgba(0,0,0,0.05)" strokeWidth="3" fill="none" />
                        <path d={`M${sx(327, hips)},470 Q${sx(312, hips)},480 ${sx(302, hips)},500`} stroke="rgba(0,0,0,0.05)" strokeWidth="3" fill="none" />
                    </>
                )}

                {/* Navel */}
                {details.navel && (
                    <path d="M256,410 Q258,415 256,420 Q254,415 256,410" fill="rgba(0,0,0,0.1)" />
                )}

                {/* 3. Bust System (Volume + Gravity) */}
                <g transform={`translate(0, ${bust * 5})`}>
                    {/* Gravity Shadow (Underbust) */}
                    <path 
                        d={`M${sx(205, bust)},300 Q256,320 ${sx(307, bust)},300`} 
                        fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="6" strokeLinecap="round" 
                    />
                    {/* Volume Base (Cleavage) */}
                    <path 
                        d={`M256,290 Q${sx(200, bust)},290 ${sx(200, 1)},220 Q256,220 256,290 Q312,220 ${sx(312, 1)},220 Q${sx(312, bust)},290 256,290`} 
                        fill={`url(#${skinId})`} 
                    />
                    {/* Highlights (Top Curve) */}
                    <path d={`M${sx(220, 1)},240 Q${sx(240, bust)},230 ${sx(250, 1)},250`} stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" />
                    <path d={`M${sx(292, 1)},240 Q${sx(272, bust)},230 ${sx(262, 1)},250`} stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" />
                </g>
            </g>

            {/* 4. Neck & Shoulders */}
            <rect x="246" y="200" width="20" height="40" fill={`url(#${skinId})`} />
            <path d="M180,230 Q220,230 246,220" fill="none" stroke={`url(#${skinId})`} strokeWidth="30" strokeLinecap="round"/>
            <path d="M332,230 Q292,230 266,220" fill="none" stroke={`url(#${skinId})`} strokeWidth="30" strokeLinecap="round"/>
            
            {/* Clavicles */}
            {details.clavicle && (
                <path d="M220,235 Q240,240 250,235 M292,235 Q272,240 262,235" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />
            )}
        </g>
      );
  };

  const AnimeFace = ({ eyeColor = "#00BFFF", hairBack, hairFront, skinId="skinBase" }) => (
      <g transform="translate(0, -30)">
          <g className={stickerMode ? '' : 'live-hair'}>{hairBack}</g>

          <path d="M210,130 Q210,240 256,270 Q302,240 302,130 Q302,50 256,50 Q210,50 210,130" fill={`url(#${skinId})`} />
          
          {/* Eyes (Blinking) */}
          <g transform="translate(0, 10)" className={stickerMode ? '' : 'live-blink'}>
              <g transform="translate(228, 160)">
                  <path d="M-14,-6 Q0,-18 14,-6" fill="none" stroke="#000" strokeWidth="2.5" />
                  <ellipse cx="0" cy="0" rx="9" ry="7" fill="#FFF" />
                  <ellipse cx="0" cy="0" rx="5" ry="6" fill={eyeColor} />
                  <circle cx="0" cy="0" r="2" fill="#000" />
                  <circle cx="-3" cy="-3" r="2" fill="#FFF" opacity="0.9" />
              </g>
              <g transform="translate(284, 160)">
                  <path d="M-14,-6 Q0,-18 14,-6" fill="none" stroke="#000" strokeWidth="2.5" />
                  <ellipse cx="0" cy="0" rx="9" ry="7" fill="#FFF" />
                  <ellipse cx="0" cy="0" rx="5" ry="6" fill={eyeColor} />
                  <circle cx="0" cy="0" r="2" fill="#000" />
                  <circle cx="-3" cy="-3" r="2" fill="#FFF" opacity="0.9" />
              </g>
          </g>

          {/* Expressions */}
          <ellipse cx="225" cy="185" rx="10" ry="5" fill="#FF69B4" opacity="0.2" />
          <ellipse cx="287" cy="185" rx="10" ry="5" fill="#FF69B4" opacity="0.2" />
          <path d={isWin ? "M246,215 Q256,225 266,215" : (isSad ? "M246,225 Q256,215 266,225" : "M252,220 Q256,223 260,220")} stroke="#C14444" strokeWidth="1.5" fill="none" />
          <path d="M256,195 L254,205 L258,205" fill="rgba(0,0,0,0.1)" />

          <g className={stickerMode ? '' : 'live-hair'}>{hairFront}</g>
      </g>
  );

  /* ===================== 3. CHARACTER ROSTER ===================== */
  const renderCharacter = () => {
    switch(type) {
        // 1. LUNA (One Piece - Nami Style)
        case 'luna': return (
            <>
                <AnimeFace 
                    eyeColor="#FF8C00"
                    hairBack={<path d="M150,100 Q256,500 362,100 L380,550 L132,550 Z" fill="url(#hairOrange)" />}
                    hairFront={
                        <g fill="none" stroke="url(#hairOrange)" strokeWidth="25" strokeLinecap="round">
                            <path d="M256,80 Q200,150 180,320" /> <path d="M256,80 Q312,150 332,320" />
                        </g>
                    }
                />
                <RealisticBody anatomy={{ bust: 1.25, waist: 0.8, hips: 1.2, thighs: 1.1 }} />
                {/* Bikini Top */}
                <g className={stickerMode ? '' : 'live-breath'}>
                    <path d="M200,280 Q228,330 256,280" fill="teal" stroke="white" strokeWidth="2" />
                    <path d="M256,280 Q284,330 312,280" fill="teal" stroke="white" strokeWidth="2" />
                </g>
                {/* Bikini Bottom (Low Rise) */}
                <path d="M200,450 Q256,500 312,450 L312,420 Q256,460 200,420 Z" fill="teal" />
                {/* Tattoo */}
                <path d="M180,240 Q170,250 190,250" fill="none" stroke="#000" strokeWidth="2" />
            </>
        );

        // 2. MIKA (Nico Robin - Elegant)
        case 'mika': return (
            <>
                <AnimeFace 
                    skinId="skinTan"
                    eyeColor="#00008B"
                    hairBack={<path d="M160,100 L140,500 L372,500 L352,100 Z" fill="url(#hairBlack)" />}
                    hairFront={<path d="M256,80 Q360,80 360,400 L300,400 L256,80" fill="url(#hairBlack)" />}
                />
                <RealisticBody skinId="skinTan" anatomy={{ bust: 1.15, waist: 0.9, hips: 1.15, thighs: 1.0 }} />
                {/* Dark Swimsuit */}
                <g className={stickerMode ? '' : 'live-breath'}>
                    <path d="M210,250 Q256,350 302,250 L302,460 Q256,500 210,460 Z" fill="#1a1a1a" />
                    <path d="M220,250 L240,220 L272,220 L292,250" fill="#1a1a1a" />
                </g>
                <rect x="230" y="320" width="52" height="2" fill="#333" /> {/* Zipper */}
            </>
        );

        // 3. KIRA (Boa Hancock - Empress)
        case 'kira': return (
            <>
                <AnimeFace 
                    eyeColor="#00008B"
                    hairBack={<path d="M120,100 Q256,650 392,100" fill="url(#hairBlack)" />}
                    hairFront={<g fill="none" stroke="url(#hairBlack)" strokeWidth="30"><path d="M256,60 Q180,150 180,450" /> <path d="M256,60 Q332,150 332,450" /></g>}
                />
                <RealisticBody anatomy={{ bust: 1.3, waist: 0.75, hips: 1.3, thighs: 1.1 }} />
                {/* Royal Red/Gold Bikini */}
                <g className={stickerMode ? '' : 'live-breath'}>
                    <path d="M200,280 Q228,340 256,280" fill="url(#fabricRed)" stroke="url(#gold)" strokeWidth="3" />
                    <path d="M256,280 Q284,340 312,280" fill="url(#fabricRed)" stroke="url(#gold)" strokeWidth="3" />
                </g>
                <path d="M200,440 Q256,500 312,440 L312,400 Q256,440 200,400 Z" fill="url(#fabricRed)" />
                <path d="M190,420 L322,420" stroke="url(#gold)" strokeWidth="4" fill="none" /> {/* Gold Belt */}
            </>
        );

        // 4. YAMI (Noctyra - Latex)
        case 'yami': return (
            <>
                <AnimeFace 
                    skinId="skinPale"
                    eyeColor="#FF00FF"
                    hairBack={<path d="M100,200 Q256,150 412,200 L350,400 L162,400 Z" fill="#1a0b2e" />}
                    hairFront={<path d="M256,80 Q320,200 350,300 L256,100 L162,300" fill="#4B0082" />}
                />
                <RealisticBody skinId="skinPale" anatomy={{ bust: 1.2, waist: 0.85, hips: 1.2, thighs: 1.2 }} />
                {/* Latex Tube Top */}
                <g className={stickerMode ? '' : 'live-breath'}>
                    <path d="M190,300 Q256,340 322,300 L322,380 Q256,400 190,380 Z" fill="url(#latex)" />
                    <path d="M190,300 Q256,340 322,300" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" /> {/* Highlight */}
                </g>
            </>
        );

        // 5. GLACIA (Sheer Ice)
        case 'glacia': return (
            <>
                <AnimeFace 
                    skinId="skinPale"
                    eyeColor="#00FFFF"
                    hairBack={<path d="M160,150 L140,500 L372,500 L352,150 Z" fill="url(#hairWhite)" />}
                    hairFront={<path d="M200,100 L180,300 M312,100 L332,300" stroke="url(#hairWhite)" strokeWidth="20" fill="none" />}
                />
                <RealisticBody skinId="skinPale" anatomy={{ bust: 1.0, waist: 0.8, hips: 1.0, thighs: 0.9 }} />
                {/* Sheer Translucent Top */}
                <g className={stickerMode ? '' : 'live-breath'}>
                    <path d="M190,300 Q256,340 322,300 L322,450 Q256,480 190,450 Z" fill="rgba(220,255,255,0.3)" stroke="white" strokeWidth="0.5" />
                    <circle cx="225" cy="320" r="15" fill="rgba(255,255,255,0.5)" filter="url(#softShadow)" /> 
                    <circle cx="287" cy="320" r="15" fill="rgba(255,255,255,0.5)" filter="url(#softShadow)" />
                </g>
            </>
        );
        
        // 6. AERIS (Sky - Gold Chainmail)
        case 'sky': return (
            <>
                <AnimeFace eyeColor="#87CEEB" hairBack={<circle cx="256" cy="150" r="100" fill="url(#hairSky)" />} />
                <RealisticBody anatomy={{ bust: 1.1, waist: 0.9, hips: 1.1, thighs: 1.0 }} />
                <g className={stickerMode ? '' : 'live-breath'}>
                    <path d="M200,280 Q230,320 256,280" fill="url(#gold)" />
                    <path d="M256,280 Q282,320 312,280" fill="url(#gold)" />
                </g>
                <rect x="200" y="420" width="112" height="60" fill="white" /> {/* Shorts */}
            </>
        );

        // 7. IVY (Bio - Leaf)
        case 'ivy': return (
            <>
                <AnimeFace skinId="skinTan" eyeColor="#006400" hairFront={<path d="M256,80 L230,250 M256,80 L282,250" stroke="green" strokeWidth="20" fill="none" />} />
                <RealisticBody skinId="skinTan" anatomy={{ bust: 1.0, waist: 0.8, hips: 1.1, thighs: 1.1 }} />
                <g className={stickerMode ? '' : 'live-breath'}>
                    <path d="M200,280 Q256,320 312,280 L256,400 Z" fill="url(#skinGreen)" /> {/* Leaf Top */}
                </g>
                <path d="M200,440 Q256,500 312,440" fill="url(#skinGreen)" />
            </>
        );

        // 8. V-77 (Cyber - Neon Paint)
        case 'cyber': return (
            <>
                <AnimeFace skinId="skinPale" eyeColor="#0F0" hairFront={<path d="M256,80 Q320,150 300,400" fill="none" stroke="#222" strokeWidth="40" />} />
                <RealisticBody skinId="skinPale" anatomy={{ bust: 1.1, waist: 0.9, hips: 1.0, thighs: 1.0 }} />
                <g className={stickerMode ? '' : 'live-breath'}>
                    <path d="M210,300 Q230,320 250,300" fill="none" stroke="#0F0" strokeWidth="2" filter="url(#softGlow)" />
                    <path d="M262,300 Q282,320 302,300" fill="none" stroke="#0F0" strokeWidth="2" filter="url(#softGlow)" />
                </g>
                <rect x="200" y="440" width="112" height="50" fill="#111" />
            </>
        );
        
        // 9. PENNY (Gold - Steampunk)
        case 'penny': return (
            <>
                <AnimeFace skinId="skinTan" eyeColor="#DAA520" hairBack={<path d="M140,150 Q256,500 372,150" fill="#FFF" />} />
                <RealisticBody skinId="skinTan" anatomy={{ bust: 1.2, waist: 0.8, hips: 1.2, thighs: 1.1 }} />
                <g className={stickerMode ? '' : 'live-breath'}>
                    <path d="M200,300 Q256,280 312,300 L300,450 Q256,480 212,450 Z" fill="#8B4513" />
                    <path d="M220,300 L220,450" stroke="#DAA520" strokeWidth="2" strokeDasharray="5,5" />
                </g>
            </>
        );
        
        // 10. NOVA (Void)
        case 'void': return (
            <>
                <AnimeFace eyeColor="#FFF" hairBack={<path d="M150,100 L362,100 L362,500 L150,500 Z" fill="#000" />} />
                <RealisticBody anatomy={{ bust: 1.1, waist: 0.9, hips: 1.1, thighs: 1.0 }} />
                <g className={stickerMode ? '' : 'live-breath'}>
                    <path d="M200,280 L230,320 L256,280" fill="#000" />
                    <path d="M256,280 L282,320 L312,280" fill="#000" />
                </g>
                <path d="M200,440 Q256,500 312,440" fill="#000" />
            </>
        );

        default: return <><RealisticBody /><AnimeFace /></>;
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
    <svg viewBox="0 0 512 800" className={`w-full h-full drop-shadow-2xl transition-all duration-500 ${isWin ? 'scale-105 drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]' : ''}`} style={{transform: `scale(${scale})`}}>
      {renderDefs()}
      <g className={isWin ? 'animate-bounce' : ''}>
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