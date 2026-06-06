
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  // Use a relative base for Capacitor/embedded builds
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: pkg.name || 'Carwash Staff Management',
        short_name: 'Carwash',
        start_url: './',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1976d2',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // cache common asset types
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: false,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor_react';
            if (id.includes('firebase')) return 'vendor_firebase';
            if (id.includes('react-router-dom')) return 'vendor_router';
            return 'vendor';
          }
        },
      },
    },
  },
});