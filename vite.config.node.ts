import { resolve } from 'path'
import { defineConfig } from 'vite'
import { packageJson } from './src/node/utils/package'

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    minifySyntax: true,
    minifyIdentifiers: true,
  },
  build: {
    outDir: './dist',
    ssr: true,
    sourcemap: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/node/index.ts'),
      name: packageJson.name,
      // the proper extensions will be added
      fileName: packageJson.name,
      formats: ['es'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      output: {
        globals: {},
      },
    },
  },
})
