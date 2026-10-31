import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  // PWA configuration with offline caching for dashboard and farm records
  ...withPWA({
    dest: "public",
    register: true,
    workboxOptions: {
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === "image",
          handler: "CacheFirst",
          options: {
            cacheName: "images",
            expiration: { maxEntries: 50 },
          },
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/batches") || url.pathname.startsWith("/expenses") || url.pathname.startsWith("/inventory"),
          handler: "NetworkFirst",
          options: {
            cacheName: "farm-data",
            expiration: { maxEntries: 100 },
          },
        },
      ],
    },
  }),
};

export default nextConfig;