import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.png', 'app_logo/app_logo_192.png', 'app_logo/app_logo_512.png', 'screenshots/*.png', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Ranamatch Official Platform',
        short_name: 'Ranamatch',
        description: 'Ranamatch Gaming & Sports Betting Platform. High odds, fast withdrawals, and exclusive promotions.',
        theme_color: '#E49C16',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'any',
        categories: ['games', 'entertainment', 'finance'],
        icons: [
          {
            src: 'app_logo/app_logo_192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'app_logo/app_logo_512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'app_logo/app_logo_512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],

        shortcuts: [
          {
            name: 'Quick Deposit',
            url: '/deposit',
            icons: [{ src: 'app_logo/app_logo_192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Active Promotions',
            url: '/promotion',
            icons: [{ src: 'app_logo/app_logo_192.png', sizes: '192x192', type: 'image/png' }]
          }
        ],
        prefer_related_applications: false,
        launch_handler: {
          client_mode: 'focus-existing'
        }
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://ranamatch.com',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  preview: {
    // Vite handles history API fallback automatically
  },
})