import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { z } from 'zod'
import type { D1Database, RateLimit } from '@cloudflare/workers-types'
import {
  RETENTION_DAYS,
  keySchema,
  submissionSchema,
  reportSchema,
  checkWords,
} from '../server/wall-policy'

const CONSENT_VERSION = 'public-wall-v1'
type Env = {
  DB: D1Database
  READ_LIMIT: RateLimit
  WRITE_LIMIT: RateLimit
  PUBLIC_ORIGIN: string
  ADDITIONAL_PUBLIC_ORIGIN?: string
  RATE_LIMIT_SECRET: string
}
type Row = {
  id: string
  text: string | null
  age: number | null
  state: 'shared' | 'withdrawn' | 'flagged'
  expires: number
}
const schema = submissionSchema(CONSENT_VERSION)
const app = new Hono<{ Bindings: Env }>()
const unavailable = 'The Wall is unavailable. Keep your words and try again shortly.'
const limited = 'A few hopes at a time. Please try again in a minute.'
const encoder = new TextEncoder()
const hex = (bytes: ArrayBuffer) =>
  Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
const hash = async (key: string) => hex(await crypto.subtle.digest('SHA-256', encoder.encode(key)))
const publicState = (row: Row) => ({ id: row.id, state: row.state, expires: row.expires })
const prune = (db: D1Database, now = Date.now()) =>
  db.prepare('DELETE FROM hopes WHERE expires <= ?').bind(now).run()

// Public asset requests bypass this Worker; only /api/* invokes it.
app.use('/api/*', async (c, next) => {
  c.header('Cache-Control', 'no-store')
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('Referrer-Policy', 'no-referrer')
  const url = new URL(c.req.url)
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  const origins = [
    c.env.PUBLIC_ORIGIN || (local ? url.origin : ''),
    c.env.ADDITIONAL_PUBLIC_ORIGIN,
  ].filter(Boolean)
  if (!origins.includes(url.origin))
    return c.json({ message: 'Open the Wall at its published address.' }, 403)
  // Each address serves its own same-origin API, including during a domain move.
  if (!['GET', 'HEAD'].includes(c.req.method) && c.req.header('Origin') !== url.origin)
    return c.json({ message: 'Open the Wall before sending a request.' }, 403)
  if (!c.env.RATE_LIMIT_SECRET || c.env.RATE_LIMIT_SECRET.length < 32)
    return c.json({ message: unavailable }, 503)
  // An hourly keyed digest avoids a persistent visitor ID or raw IP in rate-limit keys.
  // Shared networks share this short allowance; counters are per Cloudflare location.
  const secret = await crypto.subtle.importKey(
    'raw',
    encoder.encode(c.env.RATE_LIMIT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const client = c.req.header('CF-Connecting-IP') || (local ? 'loopback' : '')
  if (!client) return c.json({ message: unavailable }, 503)
  const key = hex(
    await crypto.subtle.sign(
      'HMAC',
      secret,
      encoder.encode(`${Math.floor(Date.now() / 3600000)}:${client}`),
    ),
  )
  const allowed = await c.env.READ_LIMIT.limit({ key })
  if (!allowed.success) {
    c.header('Retry-After', '60')
    return c.json({ message: limited }, 429)
  }
  if (
    c.req.method === 'POST' &&
    (url.pathname === '/api/wall' || url.pathname.endsWith('/report'))
  ) {
    const action = url.pathname.endsWith('/report') ? 'report' : 'share'
    if (!(await c.env.WRITE_LIMIT.limit({ key: `${action}:${key}` })).success) {
      c.header('Retry-After', '60')
      return c.json({ message: limited }, 429)
    }
  }
  await next()
})
app.use(
  '/api/*',
  bodyLimit({
    maxSize: 4096,
    onError: (c) => c.json({ message: 'Please keep your hope within 240 characters.' }, 413),
  }),
)
app.use('/api/*', async (c, next) => {
  if (
    c.req.method === 'POST' &&
    c.req.header('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json'
  )
    return c.json(
      { message: 'That request could not be read. Your words are still yours to keep.' },
      415,
    )
  await next()
})
app.onError(
  () =>
    new Response(JSON.stringify({ message: unavailable }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    }),
)
app.notFound((c) => c.json({ message: 'This part of the Wall could not be found.' }, 404))

app.get('/api/wall', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, text, age FROM hopes WHERE state = 'shared' AND expires > ? ORDER BY created DESC, id LIMIT 200",
  )
    .bind(Date.now())
    .all()
  return c.json({
    mode: 'public',
    consentVersion: CONSENT_VERSION,
    retentionDays: RETENTION_DAYS,
    hopes: results,
  })
})
app.post('/api/wall', async (c) => {
  const input = schema.safeParse(await c.req.json().catch(() => null))
  if (!input.success)
    return c.json(
      { message: 'Add a few words, an age from 1 to 120, and your agreement to share.' },
      400,
    )
  const { text, age, key, consentVersion } = input.data
  const problem = checkWords(text)
  if (problem) return c.json({ message: problem }, 422)
  const keyHash = await hash(key)
  const id = crypto.randomUUID(),
    created = Date.now(),
    expires = created + RETENTION_DAYS * 86400000
  // D1 executes a batch as one transaction: concurrent retries and a nearly full
  // Wall cannot produce duplicates, exceed capacity, or restore removed words.
  const [, inserted, found] = await c.env.DB.batch<Row>([
    c.env.DB.prepare('DELETE FROM hopes WHERE expires <= ?').bind(created),
    c.env.DB.prepare(
      `INSERT INTO hopes (id, text, age, state, key_hash, consent_version, created, expires)
      SELECT ?, ?, ?, 'shared', ?, ?, ?, ? WHERE (SELECT count(*) FROM hopes) < 200
      ON CONFLICT(key_hash) DO NOTHING`,
    ).bind(id, text, age, keyHash, consentVersion, created, expires),
    c.env.DB.prepare('SELECT id, text, age, state, expires FROM hopes WHERE key_hash = ?').bind(
      keyHash,
    ),
  ])
  const row = found.results[0]
  if (!row)
    return c.json(
      { message: 'This small Wall is full for now. Your thought can stay private.' },
      503,
    )
  if (row.state !== 'shared')
    return c.json(
      { message: 'This hope has already left the Wall. Start again to offer a new one.' },
      409,
    )
  if (row.text !== text || row.age !== age)
    return c.json(
      { message: 'This key belongs to different words. Keep it to manage the earlier hope.' },
      409,
    )
  return c.json(publicState(row), inserted.meta.changes ? 201 : 200)
})
app.post('/api/wall/receipt', async (c) => {
  const key = keySchema.safeParse(c.req.header('Authorization')?.replace(/^Bearer /, ''))
  const row = key.success
    ? await c.env.DB.prepare(
        'SELECT id, state, expires FROM hopes WHERE key_hash = ? AND expires > ?',
      )
        .bind(await hash(key.data), Date.now())
        .first<Row>()
    : null
  if (!row)
    return c.json(
      {
        message: 'This key was not found. The hope may have expired, or the key may be incomplete.',
      },
      404,
    )
  return c.json(publicState(row))
})
app.post('/api/wall/withdraw', async (c) => {
  const key = keySchema.safeParse(c.req.header('Authorization')?.replace(/^Bearer /, ''))
  const row = key.success
    ? await c.env.DB.prepare(
        "UPDATE hopes SET text = NULL, age = NULL, state = 'withdrawn' WHERE key_hash = ? AND expires > ? RETURNING id, state, expires",
      )
        .bind(await hash(key.data), Date.now())
        .first<Row>()
    : null
  if (!row)
    return c.json(
      { message: 'This key was not found. Check the key or whether the hope has expired.' },
      404,
    )
  return c.json(publicState(row))
})
app.post('/api/wall/:id/report', async (c) => {
  const parsed = reportSchema.safeParse(await c.req.json().catch(() => null))
  const id = z.uuid().safeParse(c.req.param('id'))
  if (!parsed.success || !id.success)
    return c.json({ message: 'Choose a reason to flag this hope.' }, 400)
  await c.env.DB.prepare(
    "UPDATE hopes SET text = NULL, age = NULL, state = 'flagged' WHERE id = ? AND state = 'shared' AND expires > ?",
  )
    .bind(id.data, Date.now())
    .run()
  return c.json({ removed: true })
})

export default {
  fetch: app.fetch,
  async scheduled(_event: unknown, env: Env) {
    await prune(env.DB)
  },
}
