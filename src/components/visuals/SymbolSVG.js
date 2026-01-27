import React from 'react';

const SymbolSVG = ({ id, isWin = false }) => {
  const commonClass = `w-full h-full ${isWin ? 'symbol-win' : 'symbol-idle'}`;

  const defs = (
    <defs>
      {/* Glow */}
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Gold Gradient */}
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFF4B0" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>

      {/* Red Gradient */}
      <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FF8A8A" />
        <stop offset="50%" stopColor="#D60000" />
        <stop offset="100%" stopColor="#7A0000" />
      </linearGradient>

      {/* Ice / Diamond */}
      <linearGradient id="iceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#EFFFFF" />
        <stop offset="50%" stopColor="#6FEFFF" />
        <stop offset="100%" stopColor="#0077B6" />
      </linearGradient>

      {/* Shine animation */}
      <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="white" stopOpacity="0" />
        <stop offset="50%" stopColor="white" stopOpacity="0.5" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>
    </defs>
  );

  switch (parseInt(id)) {

    /* 1 — BLACK 7 (Premium Neon) */
    case 1:
      return (
        <svg viewBox="0 0 100 100" className={commonClass}>
          {defs}
          <path d="M22,22 L82,22 L42,92" stroke="#000" strokeWidth="18" opacity="0.4" />
          <path d="M20,20 L80,20 L40,90" stroke="#111" strokeWidth="14" fill="none" />
          <path d="M20,20 L80,20 L40,90"
                stroke="#FFF"
                strokeWidth="3"
                fill="none"
                filter={isWin ? 'url(#glow)' : ''}
                opacity="0.7" />
        </svg>
      );

    /* 2 — RED 7 (Classic Casino) */
    case 2:
      return (
        <svg viewBox="0 0 100 100" className={commonClass}>
          {defs}
          <path d="M22,22 L82,22 L42,92" stroke="black" strokeWidth="18" opacity="0.3" />
          <path d="M20,20 L80,20 L40,90"
                stroke="url(#redGrad)"
                strokeWidth="14"
                fill="none"
                filter={isWin ? 'url(#glow)' : ''} />
          <path d="M20,20 L80,20 L40,90"
                stroke="white"
                strokeWidth="3"
                fill="none"
                opacity="0.4" />
        </svg>
      );

    /* 3 — DIAMOND (Glass Ice) */
    case 3:
      return (
        <svg viewBox="0 0 100 100" className={commonClass}>
          {defs}
          <path d="M50,5 L90,40 L50,95 L10,40 Z"
                fill="url(#iceGrad)"
                stroke="#00BFFF"
                strokeWidth="2"
                filter={isWin ? 'url(#glow)' : ''} />
          <path d="M50,5 L90,40 L50,40 Z" fill="white" opacity="0.25" />
        </svg>
      );

    /* 4 — BAR (Gold Luxury) */
    case 4:
      return (
        <svg viewBox="0 0 100 100" className={commonClass}>
          {defs}
          <rect x="8" y="32" width="84" height="36" rx="6"
                fill="black"
                stroke="url(#goldGrad)"
                strokeWidth="4"
                filter={isWin ? 'url(#glow)' : ''} />
          <text x="50" y="58"
                textAnchor="middle"
                fontSize="22"
                fontWeight="900"
                fill="url(#goldGrad)">
            BAR
          </text>
        </svg>
      );

    /* 5 — CLOVER (Lucky Green) */
    case 5:
      return (
        <svg viewBox="0 0 100 100" className={commonClass}>
          {defs}
          <circle cx="35" cy="35" r="15" fill="#3CB371" />
          <circle cx="65" cy="35" r="15" fill="#3CB371" />
          <circle cx="35" cy="65" r="15" fill="#3CB371" />
          <circle cx="65" cy="65" r="15" fill="#3CB371" />
          <path d="M50,50 L50,90"
                stroke="#145A32"
                strokeWidth="5"
                filter={isWin ? 'url(#glow)' : ''} />
        </svg>
      );

    /* 6 — BELL (Shiny Gold) */
    case 6:
      return (
        <svg viewBox="0 0 100 100" className={commonClass}>
          {defs}
          <path d="M50,8 Q82,12 78,60 L88,80 H12 L22,60 Q18,12 50,8"
                fill="url(#goldGrad)"
                stroke="#B8860B"
                strokeWidth="2"
                filter={isWin ? 'url(#glow)' : ''} />
          <circle cx="50" cy="80" r="6" fill="#8B7500" />
        </svg>
      );

    /* 7 — CHERRY (Juicy) */
    case 7:
      return (
        <svg viewBox="0 0 100 100" className={commonClass}>
          {defs}
          <circle cx="38" cy="65" r="15" fill="#DC143C" />
          <circle cx="65" cy="75" r="15" fill="#B11226" />
          <path d="M38,50 Q50,20 65,65"
                stroke="#1E8449"
                strokeWidth="4"
                fill="none" />
          <path d="M50,20 L60,10"
                stroke="#1E8449"
                strokeWidth="4" />
        </svg>
      );

    default:
      return null;
  }
};

export default SymbolSVG;
