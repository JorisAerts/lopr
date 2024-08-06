import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'
import {
  DEFAULT_HOST,
  DEFAULT_PORT,
  WEBSOCKET_ROOT,
} from './src/shared/constants'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [VueDevTools(), vue(), vueJsx()],
  base: './',

  build: {
    outDir: './dist/client',
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    proxy: {
      [WEBSOCKET_ROOT]: {
        target: `ws://${DEFAULT_HOST}:${DEFAULT_PORT}`,
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
})
