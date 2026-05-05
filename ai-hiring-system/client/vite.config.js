import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['chart.js', 'react-chartjs-2'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'chart.js': path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'node_modules/chart.js/dist/chart.js'),
    },
    dedupe: ['chart.js', 'react-chartjs-2'],
  },
  plugins: [react(), tailwindcss()],
})
