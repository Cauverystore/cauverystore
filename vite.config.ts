import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  root: '.', // 👈 ensure index.html is in root
  build: {
    outDir: 'dist', // 👈 default, but confirm this
  },
});
