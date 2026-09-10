import { resolve } from 'node:path'
import serveStatic from '@fastify/static'
import { createWallApp } from './wall.ts'
const port = 4173
const app = await createWallApp({
  origins: [`http://127.0.0.1:${port}`, `http://localhost:${port}`],
})
await app.register(serveStatic, { root: resolve('dist'), dotfiles: 'deny' })
await app.listen({ host: '127.0.0.1', port })
console.log(`Timempathy local prototype: http://127.0.0.1:${port}`)
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.once(signal, () => {
    void app.close().then(() => process.exit(0))
  })
