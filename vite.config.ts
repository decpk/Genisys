import { resolve } from 'path'
import { readFileSync } from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const host = process.env.TAURI_DEV_HOST
const tauriConf = JSON.parse(readFileSync(resolve('src-tauri/tauri.conf.json'), 'utf-8'))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(tauriConf.version)
  },
  resolve: {
    alias: {
      '@renderer': resolve('src'),
      '@': resolve('src')
    },
    dedupe: ['react', 'react-dom']
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined,
    watch: { ignored: ['**/src-tauri/**'] }
  },
  worker: { format: 'es' },
  optimizeDeps: {
    // Heavy dependencies that are only reachable through lazily-loaded app
    // chunks (every app is `React.lazy`). Without pre-bundling, Vite first
    // discovers them when the app is opened, which triggers a mid-session
    // dependency re-optimization + full reload. In the Tauri/WKWebView the
    // in-flight dynamic import then rejects with "Importing a module script
    // failed" (seen when opening the Library app, which uniquely pulls in
    // shiki + mermaid + sucrase + the markdown stack). Pre-bundling them at
    // dev-server startup avoids the re-optimize and the failed import.
    include: [
      'shiki',
      'shiki/engine/javascript',
      'mermaid',
      'sucrase',
      'react-markdown',
      'remark-gfm',
    ],
    exclude: ['monaco-editor'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('monaco-editor') || id.includes('@monaco-editor/react')) return 'monaco'
          if (id.includes('@xyflow/react') || id.includes('@dagrejs/dagre')) return 'xyflow'
          if (id.includes('react-markdown') || id.includes('remark-gfm')) return 'markdown'
          if (id.includes('prettier/standalone')) return 'prettier-core'
          if (id.includes('@dnd-kit/')) return 'dnd'
        }
      }
    }
  }
})
