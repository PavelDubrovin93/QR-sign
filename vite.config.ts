import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// docker cp adoring_chaum:/usr/share/nginx/html /var/www/html

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process?.env?.VITE_BACKEND_URL || "https://arbuz-darom.ru/",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    }
  }
})
