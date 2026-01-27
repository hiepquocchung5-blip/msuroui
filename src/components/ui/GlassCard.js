import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const GlassCard = ({ children, className = "", hoverEffect = false, ...props }) => {
  return (
    <div 
      className={cn(
        "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl transition-all duration-300 relative overflow-hidden",
        hoverEffect && "hover:bg-white/10 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
        className
      )}
      {...props}
    >
      {/* Optional sheen effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};

export default GlassCard;