import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import { createRequire } from 'node:module'
import type { Plugin as VitePlugin } from 'vite'

const _require = createRequire(import.meta.url)
const renderer = _require('vite-plugin-electron-renderer')
const rendererPlugin: () => VitePlugin = renderer.default || renderer

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['better-sqlite3'],
            },
          },
        },
      },

    ]),
    rendererPlugin(),
  ],
})
