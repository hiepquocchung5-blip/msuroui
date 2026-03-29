import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import ChatWidget from '../components/social/ChatWidget';
import { useAssetPreloader } from '../hooks/useAssetPreloader';
import { Loader2, Zap, Terminal, Cpu } from 'lucide-react';
import '../styles/globals.css';

// --- CIRCUIT CHAOS BOOT LOADER ---
const BootSequence = ({ progress }) => {
    const [logIndex, setLogIndex] = useState(0);
    const logs = [
        "INITIALIZING LEVIATHAN KERNEL...",
        "DECRYPTING SECURE CHANNELS...",
        "LOADING VIRTUAL REEL TAPES...",
        "MOUNTING 3D ASSETS...",
        "ESTABLISHING PROVABLY FAIR LINK...",
        "SYSTEM OPTIMAL. READY."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setLogIndex(prev => Math.min(prev + 1, logs.length - 1));
        }, 400);
        return () => clearInterval(interval);
    }, [logs.length]);

    return (
        <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-[9999] overflow-hidden font-mono selection:bg-cyan-500 selection:text-black">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black"></div>

            <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
                
                {/* Reactor Core */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                    <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-500 animate-spin shadow-[0_0_15px_cyan]"></div>
                    <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-purple-500 animate-[spin_1.5s_linear_infinite_reverse] shadow-[0_0_15px_purple]"></div>
                    <div className="absolute inset-4 rounded-full border-t-2 border-l-2 border-white/20 animate-spin-slow"></div>
                    <Cpu size={40} className="text-cyan-400 animate-pulse drop-shadow-[0_0_10px_cyan]" />
                </div>

                {/* Brand */}
                <h1 className="text-4xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 tracking-widest mb-6 drop-shadow-lg">
                    SUROPARA
                </h1>
                
                {/* Progress Bar */}
                <div className="w-full bg-black/80 rounded-sm border border-cyan-500/30 p-1 mb-4 shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-20 mix-blend-screen"></div>
                    <div 
                        className="h-2 bg-gradient-to-r from-cyan-500 to-purple-500 relative transition-all duration-300 ease-out shadow-[0_0_10px_cyan]"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/50 blur-[2px] animate-[shimmer_1s_infinite]"></div>
                    </div>
                </div>
                
                {/* Terminal Output */}
                <div className="w-full bg-black/60 border border-white/10 rounded p-3 h-24 overflow-hidden flex flex-col justify-end relative">
                    <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-black to-transparent z-10"></div>
                    <div className="flex flex-col gap-1 text-[10px] text-cyan-500/80">
                        {logs.slice(0, logIndex + 1).map((log, i) => (
                            <div key={i} className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                <Terminal size={10} /> <span>{log}</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-2 text-white font-bold animate-pulse mt-1">
                            <Zap size={10} className="text-yellow-400" /> <span>{progress}% - MOUNTING SYSTEM...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AppContent = ({ Component, pageProps }) => {
    const { progress, loaded } = useAssetPreloader();

    // Show Circuit Chaos Boot Sequence until assets are cached
    if (!loaded) {
        return <BootSequence progress={progress} />;
    }

    return (
        <div className="animate-in fade-in duration-700">
            <Component {...pageProps} />
            <ChatWidget />
        </div>
    );
};

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Head>
            <title>Suropara - Slot Paradise</title>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            <meta name="theme-color" content="#050505" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="apple-mobile-web-app-title" content="Suropara" />
            <link rel="manifest" href="/manifest.json" />
            <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        </Head>
        <main className="font-sans antialiased text-gray-100 bg-[#050505] min-h-screen selection:bg-cyan-500 selection:text-black">
            <AppContent Component={Component} pageProps={pageProps} />
        </main>
      </ToastProvider>
    </AuthProvider>
  );
}

export default MyApp;