import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Test configuration is handled by vitest.config.ts
  // This config is for production builds only
})
