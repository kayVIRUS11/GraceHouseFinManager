import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Grace House School Tracker',
        short_name: 'Grace House',
        start_url: '/',
        display: 'standalone',
        background_color: '#f6f3ee',
        theme_color: '#1f1b17',
        icons: [
          {
            src: '/icons/pwa-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/pwa-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}']
      }
    })
  ],
})
