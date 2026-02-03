/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Cache Strategy: Stale While Revalidate (Load fast from cache, check for updates in background)
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 }
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst', // Always serve images from cache if available
      options: {
        cacheName: 'suro-assets',
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 } // Keep for 30 days
      },
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: 'NetworkFirst', // Always try to get fresh API data
      options: {
        cacheName: 'suro-api',
        expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 }
      },
    }
  ]
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'm.api.suropara.com'], // Allow external images
    unoptimized: true // Vital for static export/PWA handling of local assets
  },
};

module.exports = withPWA(nextConfig);