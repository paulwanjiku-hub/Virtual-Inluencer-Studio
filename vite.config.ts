import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This exposes the VITE_API_KEY from your .env file to the client-side
    // code as `process.env.API_KEY`. This is necessary for the Gemini SDK,
    // which expects to find the key at `process.env.API_KEY`.
    // SECURITY NOTE: This key will be publicly visible in the built JS files.
    // For production, it's crucial to restrict your API key in the Google
    // Cloud console (e.g., using HTTP referrer restrictions) to prevent abuse.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY)
  }
})