/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/.*\/api\/.*/i,
      handler: "NetworkOnly",
    },
    {
      urlPattern: /^\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|gif|webp|svg|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /^https?:\/\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "pages",
        expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
