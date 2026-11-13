import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  // Expose CHRONOS_* env vars (instead of Vite's default VITE_*) to the client.
  envPrefix: 'CHRONOS_',
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
})
