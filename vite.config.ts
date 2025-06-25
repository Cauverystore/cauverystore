import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-helmet-async': 'react-helmet-async/lib/index.esm.js',
    },
  },
  optimizeDeps: {
    include: ['react-helmet-async'],
  },
});
