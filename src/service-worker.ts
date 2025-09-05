// src/service-worker.ts

/* eslint-disable no-restricted-globals */
import { clientsClaim } from "workbox-core";
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

clientsClaim();

// Precache assets injected by VitePWA
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// Cache images with a Cache First strategy
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "image-cache",
    plugins: [],
  })
);

// Cache API requests with a Network First strategy
registerRoute(
  ({ url }) => url.origin === "https://xyz.supabase.co", // Replace with your Supabase project origin
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [],
  })
);
