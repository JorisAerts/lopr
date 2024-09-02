import { fileURLToPath, URL } from 'url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import { DEFAULT_HOST, DEFAULT_PORT, WEBSOCKET_ROOT } from '../shared/src/constants' // don't refer using lopr-shared here

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [/*VueDevTools(),*/ vue(), vueJsx()],
  base: './',

  build: {
    outDir: './dist',

    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash][extname]',
        entryFileNames: 'assets/[hash].js',
      },
    },
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    proxy: {
      '/api': {
        target: `http://${DEFAULT_HOST}:${DEFAULT_PORT}`,
        changeOrigin: true,
      },
      [WEBSOCKET_ROOT]: {
        target: `ws://${DEFAULT_HOST}:${DEFAULT_PORT}`,
        ws: true,
        rewriteWsOrigin: true,
        changeOrigin: true,
      },
    },
  },
})
