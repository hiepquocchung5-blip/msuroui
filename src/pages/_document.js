import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <meta charSet="utf-8" />
        <meta name="application-name" content="Suropara" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Suropara" />
        <meta name="description" content="Play the #1 Slot Game in Myanmar. 3D Graphics, Instant Withdrawals, and Huge Jackpots." />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#050505" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Apple Touch Icon (Mapped to the standard 192x192 maskable icon) */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        
        {/* Preconnect to fonts for performance to prevent layout shift */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=JetBrains+Mono:wght@400;700;900&display=swap" rel="stylesheet" />
      </Head>
      <body className="bg-[#050505] text-gray-100 antialiased overflow-x-hidden selection:bg-cyan-500 selection:text-black">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}