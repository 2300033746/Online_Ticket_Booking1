import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'], // prevents dependency pre-bundling crash
  },
  server: {
    host: true,          // allows LAN / mobile preview
    port: 5173,          // default vite port
  },
});
