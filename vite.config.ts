import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

function devRoutes(): Plugin {
  const routes: Record<string, string> = {
    '/material-cards': '/src/pages/material-cards/index.html',
    '/material-cards/': '/src/pages/material-cards/index.html',
    '/material-cards.html': '/src/pages/material-cards/index.html',
    '/periodic-table': '/src/pages/periodic-table/index.html',
    '/periodic-table/': '/src/pages/periodic-table/index.html',
    '/periodic-table.html': '/src/pages/periodic-table/index.html',
  }
  return {
    name: 'dev-routes',
    configureServer(server) {
      // oxlint-disable-next-line no-explicit-any — connect middleware signature
      server.middlewares.use((req: any, res: any, next: any) => {
        const target = routes[req.url ?? '']
        if (target) {
          req.url = target
        }
        next()
      })
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [react(), ...(command === 'serve' ? [devRoutes()] : [])],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve('index.html'),
        'material-cards': resolve('src/pages/material-cards/index.html'),
        'periodic-table': resolve('src/pages/periodic-table/index.html'),
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
}))
