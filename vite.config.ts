import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['brand/favicon-16.png', 'brand/favicon-32.png', 'brand/apple-touch-icon.png'],
      manifest: {
        name: 'Dramark',
        short_name: 'Dramark',
        description: 'Bibliothèque personnelle pour suivre les films et séries repérés sur Viki.',
        lang: 'fr-FR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#070912',
        theme_color: '#070912',
        icons: [
          {
            src: '/brand/dramark-pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/brand/dramark-pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/brand/dramark-pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,ico}'],
        globIgnores: ['**/dramark-splash-bg-*.png']
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
});
