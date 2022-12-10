import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,wasm}']
      }
    }),
    vue(),
    // {
    //   name: "configure-response-headers",
    //   configureServer: (server) => {
    //     server.middlewares.use((_req, res, next) => {
    //       res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    //       res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    //       next();
    //     });
    //   },
    // }
  ]
})
