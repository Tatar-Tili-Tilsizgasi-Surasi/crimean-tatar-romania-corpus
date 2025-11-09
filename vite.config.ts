
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    base: './',
    define: {
      // Strictly adhere to the requirement of using process.env.API_KEY in the code.
      // This replaces the variable with its actual string value during the build process.
      // We add a fallback to process.env.API_KEY to ensure it works in CI environments where loadEnv might misses it.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    }
  }
})
