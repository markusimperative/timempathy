import type { Plugin } from 'vite'
import { createWallApp } from './wall.ts'

// Fastify owns request parsing and limits; Vite owns its existing UI server.
export function wallPrototype(): Plugin {
  return {
    name: 'timempathy-local-wall',
    apply: 'serve',
    async configureServer(server) {
      const app = await createWallApp()
      await app.ready()
      server.middlewares.use((request, response, next) => {
        if (request.url?.split('?')[0].startsWith('/api/wall')) app.routing(request, response)
        else next()
      })
      server.httpServer?.once('close', () => {
        void app.close()
      })
    },
  }
}
