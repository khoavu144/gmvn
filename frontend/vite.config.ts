import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/') ||
            id.includes('react-router') ||
            id.includes('@reduxjs') ||
            id.includes('react-redux') ||
            id.includes('@tanstack/react-query')
          ) {
            return 'framework'
          }

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

          return undefined
        },
      },
    },
  },
})
