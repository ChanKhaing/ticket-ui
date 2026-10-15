import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/mailhog-api': {
        target: 'http://localhost:8025',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/mailhog-api/, ''),
      },
    },
  },
})