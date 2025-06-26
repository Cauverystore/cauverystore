// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import legacy from "@vitejs/plugin-legacy";
import { createHtmlPlugin } from "vite-plugin-html";
import ViteCompression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
    visualizer({
      filename: "dist/stats.html",
      open: false,
      brotliSize: true,
      gzipSize: true,
      template: "treemap",
    }),
    ViteCompression({
      algorithm: "brotliCompress", // Also supports gzip
      ext: ".br",
      deleteOriginFile: false,
      threshold: 10240,
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
      manifest: {
        name: "Cauverystore",
        short_name: "Cauverystore",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#16a34a",
        icons: [
          {
            src: "/pwa-icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
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
