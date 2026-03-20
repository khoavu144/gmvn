import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssCodeSplit: true,
    // Raise chunk warning threshold — our manual splits keep everything reasonable
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          // ── Core React runtime (~45kb gz) — cached forever, changes rarely
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'react-runtime'
          }

          // ── Router + state management (~35kb gz)
          if (
            id.includes('react-router') ||
            id.includes('@reduxjs') ||
            id.includes('react-redux')
          ) {
            return 'router-state'
          }

          // ── Data fetching (~20kb gz)
          if (id.includes('@tanstack/react-query')) {
            return 'query'
          }

          // ── Heavy optional libraries — loaded only when needed
          if (id.includes('recharts')) {
            return 'charts'
          }

          if (id.includes('leaflet') || id.includes('react-leaflet')) {
            return 'maps'
          }

          if (id.includes('react-select')) {
            return 'select'
          }

          if (id.includes('framer-motion')) {
            return 'motion'
          }

          if (id.includes('socket.io-client')) {
            return 'socket'
          }

          // ── react-helmet-async — small but shared
          if (id.includes('react-helmet')) {
            return 'seo'
          }

          return undefined
        },
      },
    },
  },
})

