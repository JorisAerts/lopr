import { resolve } from 'path'
import type { ConfigEnv, LibraryOptions } from 'vite'
import { defineConfig } from 'vite'

const name = 'lopr'

// https://vitejs.dev/config/
export default defineConfig((env: ConfigEnv) => ({
  esbuild: {
    minifySyntax: true,
    minifyIdentifiers: true,
  },
  optimizeDeps: {
    include: ['lopr-shared'],
  },
  build: {
    minify: true,
    outDir: './dist',
    ssr: true,
    sourcemap: env.mode === 'development',
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, './src/index.ts'),
      name: name,
      // the proper extensions will be added
      fileName: name,
      formats: ['es'],
    } as LibraryOptions,
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      output: {
        globals: {},
      },
    },
  },
}))
