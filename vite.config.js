import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'inline',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,wasm}']
    }
  }), vue()]
})
