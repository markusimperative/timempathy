import Fastify from 'fastify'
import rateLimit from '@fastify/rate-limit'
import { DatabaseSync } from 'node:sqlite'
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { z } from 'zod'
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity'

export const CONSENT_VERSION = 'local-wall-v1'
export const RETENTION_DAYS = 7
const lifetime = RETENTION_DAYS * 86400000
const keySchema = z.string().regex(/^[a-f0-9]{64}$/)
const submissionSchema = z
  .object({
    text: z.string().trim().min(1).max(240),
    age: z.number().int().min(1).max(120),
    consent: z.literal(true),
    consentVersion: z.literal(CONSENT_VERSION),
    key: keySchema,
  })
  .strict()
const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers })
const hash = (key: string) => createHash('sha256').update(key).digest('hex')
type Row = {
  id: string
  text: string | null
  age: number | null
  state: string
  expires: number
  key_hash: string
}
export type WallOptions = {
  database?: string
  origins?: string[]
  now?: () => number
  limits?: boolean
}

// This service has no moderator endpoint, account, or automatic rewriting.
export async function createWallApp(options: WallOptions = {}) {
  const file = options.database ?? resolve('.local/wall/prototype.sqlite')
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true })
  const db = new DatabaseSync(file, { timeout: 3000 })
  db.exec(`PRAGMA journal_mode=DELETE; PRAGMA secure_delete=ON;
    CREATE TABLE IF NOT EXISTS hopes (
      id TEXT PRIMARY KEY, text TEXT, age INTEGER, state TEXT NOT NULL,
      key_hash TEXT UNIQUE NOT NULL, consent_version TEXT NOT NULL,
      created INTEGER NOT NULL, expires INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS public_hopes ON hopes(state, expires);`)
  const now = options.now ?? Date.now
  const origins = new Set(options.origins ?? ['http://127.0.0.1:5173', 'http://localhost:5173'])
  const hosts = new Set([...origins].map((origin) => new URL(origin).host))
  const app = Fastify({ logger: false, bodyLimit: 4096, requestTimeout: 10000, trustProxy: false })
  const salt = randomBytes(32)
  const prune = () => db.prepare('DELETE FROM hopes WHERE expires <= ?').run(now())
  prune()
  const expiryTimer = setInterval(prune, 60000)
  expiryTimer.unref()
  app.addHook('onClose', async () => {
    clearInterval(expiryTimer)
    db.close()
  })
  app.addHook('onRequest', async (request, reply) => {
    reply.header('Cache-Control', 'no-store').header('X-Content-Type-Options', 'nosniff')
    if (!hosts.has(request.headers.host ?? ''))
      return reply
        .code(403)
        .send({ message: 'This Wall is available only on its configured local address.' })
    if (
      request.method !== 'GET' &&
      request.method !== 'HEAD' &&
      !origins.has(request.headers.origin ?? '')
    ) {
      return reply.code(403).send({ message: 'Open the Wall before sending a request.' })
    }
    prune()
  })
  if (options.limits !== false)
    await app.register(rateLimit, {
      max: 90,
      timeWindow: 60000,
      keyGenerator: (request) => createHmac('sha256', salt).update(request.ip).digest('hex'),
    })
  app.setErrorHandler((error: Error & { statusCode?: number }, _request, reply) => {
    const code = error.statusCode ?? 503
    const message =
      code === 429
        ? 'A few hopes at a time. Please try again in a minute.'
        : code === 413
          ? 'Please keep your hope within 240 characters.'
          : code < 500
            ? 'That request could not be read. Your words are still yours to keep.'
            : 'The Wall is unavailable. Keep your words and try again shortly.'
    reply.code(code >= 500 ? 503 : code).send({ message })
  })
  const writeLimit = { config: { rateLimit: { max: 5, timeWindow: 60000 } } }
  const findKey = (key: string) =>
    db.prepare('SELECT * FROM hopes WHERE key_hash = ?').get(hash(key)) as Row | undefined
  const publicState = (row: Row) => ({ id: row.id, state: row.state, expires: row.expires })

  app.get('/api/wall', async () => ({
    mode: 'local-prototype',
    consentVersion: CONSENT_VERSION,
    retentionDays: RETENTION_DAYS,
    hopes: db
      .prepare(
        "SELECT id, text, age FROM hopes WHERE state = 'shared' AND expires > ? ORDER BY created DESC, id LIMIT 200",
      )
      .all(now()),
  }))
  app.post('/api/wall', writeLimit, async (request, reply) => {
    const parsed = submissionSchema.safeParse(request.body)
    if (!parsed.success)
      return reply
        .code(400)
        .send({ message: 'Add a few words, an age from 1 to 120, and your agreement to share.' })
    const input = parsed.data
    const existing = findKey(input.key)
    if (existing) {
      if (existing.state !== 'shared')
        return reply
          .code(409)
          .send({ message: 'This hope has already left the Wall. Start again to offer a new one.' })
      if (existing.text !== input.text || existing.age !== input.age)
        return reply.code(409).send({
          message: 'This key belongs to different words. Keep it to manage the earlier hope.',
        })
      return publicState(existing)
    }
    const normalized = input.text.normalize('NFKC')
    const contact =
      /(?:https?:|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?\d[\s().-]*){7,}|@[\w_]{2,}|\b[\w-]+\.(?:com|net|org|io|fr|uk)\b)/iu
    const control =
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/u
    if (contact.test(normalized) || control.test(normalized))
      return reply.code(422).send({
        message:
          'Leave out links, contact details, handles, and hidden formatting. You can also keep this thought private.',
      })
    if (matcher.hasMatch(normalized))
      return reply.code(422).send({
        message:
          'The automated language check could not accept these words. You can revise them or keep your thought private.',
      })
    if (
      Number(
        (db.prepare('SELECT count(*) AS count FROM hopes').get() as { count: number }).count,
      ) >= 200
    )
      return reply
        .code(503)
        .send({ message: 'This small Wall is full for now. Your thought can stay private.' })
    const id = randomUUID(),
      created = now(),
      expires = created + lifetime
    db.prepare('INSERT INTO hopes VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      id,
      input.text,
      input.age,
      'shared',
      hash(input.key),
      input.consentVersion,
      created,
      expires,
    )
    return reply.code(201).send({ id, state: 'shared', expires })
  })
  app.post('/api/wall/receipt', async (request, reply) => {
    const key = keySchema.safeParse(request.headers.authorization?.replace(/^Bearer /, ''))
    const row = key.success ? findKey(key.data) : undefined
    if (!row)
      return reply.code(404).send({
        message: 'This key was not found. The hope may have expired, or the key may be incomplete.',
      })
    return publicState(row)
  })
  app.post('/api/wall/withdraw', async (request, reply) => {
    const key = keySchema.safeParse(request.headers.authorization?.replace(/^Bearer /, ''))
    const row = key.success ? findKey(key.data) : undefined
    if (!row)
      return reply
        .code(404)
        .send({ message: 'This key was not found. Check the key or whether the hope has expired.' })
    db.prepare("UPDATE hopes SET text = NULL, age = NULL, state = 'withdrawn' WHERE id = ?").run(
      row.id,
    )
    return { id: row.id, state: 'withdrawn', expires: row.expires }
  })
  app.post('/api/wall/:id/report', writeLimit, async (request, reply) => {
    const parsed = z
      .object({ reason: z.enum(['identifying', 'harmful', 'other']) })
      .strict()
      .safeParse(request.body)
    const id = z.uuid().safeParse((request.params as { id: string }).id)
    if (!parsed.success || !id.success)
      return reply.code(400).send({ message: 'Choose a reason to flag this hope.' })
    // No public report counts. A report removes the words, without retaining a moderation inbox.
    db.prepare(
      "UPDATE hopes SET text = NULL, age = NULL, state = 'flagged' WHERE id = ? AND state = 'shared'",
    ).run(id.data)
    return { removed: true }
  })
  return app
}
