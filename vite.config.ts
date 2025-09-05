// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { createHtmlPlugin } from "vite-plugin-html";
import ViteCompression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    visualizer({
      filename: "dist/stats.html",
      open: false,
      brotliSize: true,
      gzipSize: true,
      template: "treemap",
    }),

    ViteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 10240,
      deleteOriginFile: false,
    }),

    createHtmlPlugin({
      inject: {
        data: {
          preloadLinks: `
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link rel="preconnect" href="https://xyz.supabase.co">
            <link rel="preload" href="https://cdn.cauverystore.in/og-store.jpg" as="image" type="image/jpeg">
          `,
        },
      },
      minify: true,
    }),

    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Cauverystore",
        short_name: "Cauverystore",
        description: "India's trusted e-commerce marketplace for curated products.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#16a34a",
        orientation: "portrait",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.cauverystore\.in\/.*\.(?:png|jpg|jpeg|webp|svg)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // ✅ Alias fix here
    },
  },

  server: {
    port: 3000,
    open: true,
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    assetsInlineLimit: 8192,
    rollupOptions: {
      treeshake: true,
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "vendor-react";
            if (id.includes("supabase")) return "vendor-supabase";
            if (id.includes("zustand")) return "vendor-zustand";
            return "vendor-others";
          }
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        inlineDynamicImports: false,
        preserveEntrySignatures: false,
      },
    },
  },
});
