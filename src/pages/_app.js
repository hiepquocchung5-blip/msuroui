import React from 'react';
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import ChatWidget from '../components/social/ChatWidget'; // NEW: Import Chat
import '../styles/globals.css';
// import { Analytics } from "@vercel/analytics/next"
// import { SpeedInsights } from "@vercel/speed-insights/next"

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Head>
            <title>Suropara - Slot Paradise</title>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            <meta name="theme-color" content="#000000" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </Head>
        <main className="font-sans antialiased text-gray-100 bg-black min-h-screen selection:bg-cyan-500 selection:text-black">
            <Component {...pageProps} />
            
            {/* Global Chat Overlay */}
            <ChatWidget />
            
            {/* Vercel Analytics */}
            <Analytics />
        </main>
      </ToastProvider>
    </AuthProvider>
  );
}

export default MyApp;