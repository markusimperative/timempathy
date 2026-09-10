import assert from 'node:assert/strict'
import { randomBytes, randomUUID, createHash } from 'node:crypto'
import { readFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'

process.env.WRANGLER_SEND_METRICS = 'false'
process.env.WRANGLER_LOG_PATH = resolve('.local/cloudflare/test-logs')
process.env.CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV = 'false'
const { createTestHarness } = await import('wrangler')
// The official harness uses isolated local storage, never remote D1.
const config = JSON.parse(
  (await readFile('wrangler.jsonc', 'utf8'))
    .replace(/^\/\/.*$/gm, '')
    .replace(/,\s*([}\]])/g, '$1'),
)
config.main = resolve(config.main)
config.assets.directory = resolve(config.assets.directory)
config.d1_databases = config.d1_databases.map((db) => ({
  ...db,
  remote: false,
  migrations_dir: resolve(db.migrations_dir),
}))
config.vars = { PUBLIC_ORIGIN: '', RATE_LIMIT_SECRET: randomBytes(32).toString('hex') }
config.dev = { ip: '127.0.0.1', port: 0 }
// Resolve local variable files outside the developer's .dev.vars directory.
const root = resolve('.local/cloudflare/test-harness')
await mkdir(root, { recursive: true })
const harness = createTestHarness({ root, workers: [{ config }] })
const key = () => randomBytes(32).toString('hex')
const hope = (extra = {}) => ({
  text: 'A cup of tea together.',
  age: 67,
  consent: true,
  consentVersion: 'public-wall-v1',
  key: key(),
  ...extra,
})
let serial = 0
try {
  const { url } = await harness.listen()
  const origin = url.origin
  const worker = harness.getWorker()
  await worker.applyD1Migrations('DB')
  let { DB } = await worker.getEnv()
  const request = (path = '/api/wall', body, extra = {}) =>
    harness.fetch(origin + path, {
      method: body === undefined ? 'GET' : 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
      ...extra,
      headers: {
        Origin: origin,
        'Content-Type': 'application/json',
        'CF-Connecting-IP': `203.0.${Math.floor(++serial / 250)}.${serial % 250}`,
        ...extra.headers,
      },
    })
  const receipt = (action, token) =>
    request('/api/wall/' + action, {}, { headers: { Authorization: 'Bearer ' + token } })
  const feed = async () => (await (await request()).json()).hopes
  const reset = () => DB.prepare('DELETE FROM hopes').run()
  const status = async (response, code) =>
    assert.equal(response.status, code, await response.clone().text())

  const input = hope({ text: '  Demain, un café. 雨の音を聴く。 <b>tea</b>  ', age: 8 })
  const accepted = await request('/api/wall', input)
  await status(accepted, 201)
  const initial = await accepted.json()
  assert.deepEqual(await feed(), [{ id: initial.id, text: input.text.trim(), age: 8 }])
  assert.equal((await request()).headers.get('cache-control'), 'no-store')
  assert.equal((await (await request()).json()).mode, 'public')
  assert.equal((await (await receipt('receipt', input.key)).json()).state, 'shared')
  assert.equal((await (await request('/api/wall', input)).json()).id, initial.id)
  await status(await request('/api/wall', { ...input, age: 9 }), 409)
  await harness.update({ root, workers: [{ config }] })
  ;({ DB } = await worker.getEnv())
  assert.equal((await feed())[0].id, initial.id)
  await status(await receipt('withdraw', key()), 404)
  await status(await receipt('withdraw', input.key), 200)
  await status(await receipt('withdraw', input.key), 200)
  await status(await request('/api/wall', input), 409)
  assert.deepEqual(await feed(), [])
  const removed = await DB.prepare('SELECT text, age, key_hash FROM hopes WHERE id = ?')
    .bind(initial.id)
    .first()
  assert.equal(removed.text, null)
  assert.equal(removed.age, null)
  assert.equal(removed.key_hash, createHash('sha256').update(input.key).digest('hex'))
  await reset()
  for (const override of [
    { consent: false },
    { consentVersion: 'local-wall-v1' },
    { age: 0 },
    { age: 121 },
    { age: 4.5 },
    { age: '12' },
    { text: '' },
    { text: 'x'.repeat(241) },
    { name: 'extra' },
    { key: 'guess' },
  ])
    await status(await request('/api/wall', hope(override)), 400)
  for (const text of [
    'Visit https://example.com',
    'me@example.net',
    'Call +33 612 345 678',
    '@contact_me tomorrow',
    'fuck you',
    'invisible\u200bwords',
  ]) {
    const rejected = hope({ text })
    await status(await request('/api/wall', rejected), 422)
    await status(await receipt('receipt', rejected.key), 404)
  }
  for (const age of [1, 120]) await status(await request('/api/wall', hope({ age })), 201)
  await reset()
  const retried = hope()
  const retries = await Promise.all(Array.from({ length: 12 }, () => request('/api/wall', retried)))
  assert.equal(retries.filter((r) => r.status === 201).length, 1)
  assert.equal(retries.filter((r) => r.status === 200).length, 11)
  assert.equal((await feed()).length, 1)
  const id = (await feed())[0].id
  await status(await request(`/api/wall/${id}/report`, { reason: 'invalid' }), 400)
  await status(await request('/api/wall/not-an-id/report', { reason: 'other' }), 400)
  await status(await request(`/api/wall/${id}/report`, { reason: 'other' }), 200)
  assert.deepEqual(await feed(), [])
  assert.equal((await (await receipt('receipt', retried.key)).json()).state, 'flagged')
  await status(await request('/api/wall', retried), 409)
  assert.deepEqual(await DB.prepare('SELECT text, age FROM hopes WHERE id = ?').bind(id).first(), {
    text: null,
    age: null,
  })
  await reset()
  const now = Date.now()
  await DB.batch(
    Array.from({ length: 199 }, () =>
      DB.prepare(
        "INSERT INTO hopes VALUES (?, NULL, NULL, 'withdrawn', ?, 'public-wall-v1', ?, ?)",
      ).bind(randomUUID(), key(), now, now + 60000),
    ),
  )
  const lastPlace = await Promise.all(Array.from({ length: 8 }, () => request('/api/wall', hope())))
  assert.equal(lastPlace.filter((r) => r.status === 201).length, 1)
  assert.equal(lastPlace.filter((r) => r.status === 503).length, 7)
  assert.equal((await DB.prepare('SELECT count(*) AS count FROM hopes').first()).count, 200)
  await reset()
  const expired = hope()
  const expiry = await (await request('/api/wall', expired)).json()
  await DB.prepare('UPDATE hopes SET expires = ? WHERE id = ?')
    .bind(Date.now() - 1, expiry.id)
    .run()
  assert.deepEqual(await feed(), [])
  await status(await receipt('receipt', expired.key), 404)
  await worker.scheduled({ cron: '17 * * * *', scheduledTime: new Date() })
  assert.equal((await DB.prepare('SELECT count(*) AS count FROM hopes').first()).count, 0)
  await status(
    await request('/api/wall', hope(), { headers: { Origin: 'https://elsewhere.test' } }),
    403,
  )
  await status(await request('/api/wall', hope(), { headers: { Origin: '' } }), 403)
  await status(
    await request('/api/wall', hope(), { headers: { 'Content-Type': 'text/plain' } }),
    415,
  )
  await status(await request('/api/wall', undefined, { method: 'POST', body: '{' }), 400)
  await status(await request('/api/wall', hope({ text: 'x'.repeat(5000) })), 413)
  await status(await request('/api/unknown'), 404)
  for (let i = 0; i < 5; i++)
    await status(
      await request('/api/wall', hope(), { headers: { 'CF-Connecting-IP': '192.0.2.20' } }),
      201,
    )
  const limited = await request('/api/wall', hope(), {
    headers: { 'CF-Connecting-IP': '192.0.2.20' },
  })
  await status(limited, 429)
  assert.equal(limited.headers.get('retry-after'), '60')
  const author = hope()
  await request('/api/wall', author, { headers: { 'CF-Connecting-IP': '192.0.2.21' } })
  for (let i = 0; i < 5; i++)
    await request('/api/wall', hope(), { headers: { 'CF-Connecting-IP': '192.0.2.21' } })
  await status(
    await request(
      '/api/wall/withdraw',
      {},
      { headers: { 'CF-Connecting-IP': '192.0.2.21', Authorization: 'Bearer ' + author.key } },
    ),
    200,
  )
  const home = await request('/')
  await status(home, 200)
  assert.ok(home.headers.get('content-security-policy')?.includes("script-src 'self'"))
  assert.equal(home.headers.get('referrer-policy'), 'no-referrer')
  await reset()
  await DB.prepare('ALTER TABLE hopes RENAME TO offline_hopes').run()
  await status(await request(), 503)
  await status(await request('/'), 200)
  await DB.prepare('ALTER TABLE offline_hopes RENAME TO hopes').run()
  // Exercise real deployment hostnames entirely inside the isolated local Worker.
  const primary = 'https://timempathy.timempathy.workers.dev'
  const custom = 'https://timepathy.markmathew.com'
  await harness.update({
    root,
    workers: [
      {
        config: {
          ...config,
          vars: {
            ...config.vars,
            PUBLIC_ORIGIN: primary,
            ADDITIONAL_PUBLIC_ORIGIN: custom,
          },
        },
      },
    ],
  })
  const domainEnv = await worker.getEnv()
  assert.equal(domainEnv.PUBLIC_ORIGIN, primary)
  assert.equal(domainEnv.ADDITIONAL_PUBLIC_ORIGIN, custom)
  const atAddress = (address, path = '/api/wall', body, headers = {}) =>
    worker.fetch(address + path, {
      method: body === undefined ? 'GET' : 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        Origin: address,
        'Content-Type': 'application/json',
        'CF-Connecting-IP': `198.51.100.${++serial % 250}`,
        ...headers,
      },
    })
  for (const address of [primary, custom]) await status(await atAddress(address), 200)
  const moving = hope()
  const onCustom = await atAddress(custom, '/api/wall', moving)
  await status(onCustom, 201)
  const movingId = (await onCustom.json()).id
  assert.ok((await (await atAddress(primary)).json()).hopes.some((item) => item.id === movingId))
  await status(
    await atAddress(
      primary,
      '/api/wall/withdraw',
      {},
      {
        Authorization: 'Bearer ' + moving.key,
      },
    ),
    200,
  )
  assert.deepEqual((await (await atAddress(custom)).json()).hopes, [])
  for (const [address, otherOrigin] of [
    [custom, primary],
    [primary, custom],
    [custom, ''],
    [custom, 'null'],
  ])
    await status(await atAddress(address, '/api/wall', hope(), { Origin: otherOrigin }), 403)
  for (const address of [
    'https://elsewhere.test',
    custom + '.elsewhere.test',
    custom.replace('https:', 'http:'),
  ])
    await status(await atAddress(address), 403)
  assert.deepEqual((await (await atAddress(custom)).json()).hopes, [])
  await harness.update({ root, workers: [{ config }] })
  assert.equal(harness.getLogs().filter((entry) => entry.level === 'error').length, 0)
  console.log(
    'Worker API verified: real D1 migrations, reload persistence, consent, concurrency, capacity, expiry, removal, rate limits, both domain origins, same-origin protection, static headers and database outage.',
  )
  await new Promise((resolveRun, reject) => {
    const child = spawn(process.execPath, ['scripts/verify-shared-wall.mjs'], {
      stdio: 'inherit',
      env: { ...process.env, WALL_TEST_ORIGIN: origin },
    })
    child.on('error', reject)
    child.on('exit', (code) =>
      code === 0 ? resolveRun() : reject(Error('Worker browser journey failed: ' + code)),
    )
  })
} finally {
  await harness.close()
}
