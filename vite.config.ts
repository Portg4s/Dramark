import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const tmdbAccessToken = env.TMDB_ACCESS_TOKEN?.trim();

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'brand/favicon-16.png',
          'brand/favicon-32.png',
          'brand/apple-touch-icon.png',
          'brand/dramark-splash-placeholder.webp'
        ],
        manifest: {
          name: 'Dramark',
          short_name: 'Dramark',
          description:
            'Biblioth\u00e8que personnelle pour suivre les films et s\u00e9ries rep\u00e9r\u00e9s sur Viki.',
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
    server: {
      proxy: {
        '/api/tmdb': {
          target: 'https://api.themoviedb.org/3',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tmdb/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (tmdbAccessToken) {
                proxyReq.setHeader('Authorization', `Bearer ${tmdbAccessToken}`);
              }

              proxyReq.setHeader('Accept', 'application/json');
            });
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts'
    }
  };
});
