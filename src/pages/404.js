import React from 'react';
import { useRouter } from 'next/router';
import { Home } from 'lucide-react';
import CharacterSVG from '../components/visuals/CharacterSVG';

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden p-6">
        {/* Void Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
            {/* 3D Character Floating */}
            <div className="w-48 h-48 mb-6 animate-bounce-slow">
                <CharacterSVG type="void" mood="idle" scale={1.5} />
            </div>

            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 mb-2">404</h1>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">Lost in the Void</h2>
            <p className="text-gray-400 text-sm max-w-xs mb-8">
                The island you are looking for does not exist or has been consumed by the darkness.
            </p>

            <button 
                onClick={() => router.push('/')}
                className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
                <Home size={18} /> RETURN HOME
            </button>
        </div>
    </div>
  );
}