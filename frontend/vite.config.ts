import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg'],
      manifest: {
        name: 'CryptoWallet Pro',
        short_name: 'CryptoWallet',
        description: 'Production-grade crypto wallet PWA',
        theme_color: '#0A0E27',
        background_color: '#0A0E27',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
    // Bundle visualizer — run with `npm run build -- --analyze`
    ...(process.env.ANALYZE ? [visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      open: true,
    })] : []),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
      },
    },
  },

  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 120,
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // Shared vendor chunk
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
            return 'vendor';
          }
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'query';
          }
          if (id.includes('node_modules/lightweight-charts') || id.includes('node_modules/recharts')) {
            return 'charts';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'animation';
          }
          if (id.includes('node_modules/socket.io-client')) {
            return 'socket';
          }

          // Per-page chunks (matched by page file paths)
          if (id.includes('/pages/auth/')) return 'auth';
          if (id.includes('/pages/dashboard/')) return 'dashboard';
          if (id.includes('/pages/wallet/')) return 'wallet';
          if (id.includes('/pages/trade/')) return 'trading';
          if (id.includes('/pages/signals/')) return 'signals';
          if (id.includes('/pages/kyc/')) return 'kyc';
          if (id.includes('/pages/settings/')) return 'settings';
          if (id.includes('/pages/admin/')) return 'admin';
          if (id.includes('/pages/NotFoundPage')) return 'shared-ui';
        },
      },
    },
  },
});
