import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/inss-tracker/',
  plugins: [react()],
  test: { environment: 'node' },
})
