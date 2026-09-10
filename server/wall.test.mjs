import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { mkdtemp, mkdir, rm, rmdir } from 'node:fs/promises'
import { resolve, join, dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { createWallApp, CONSENT_VERSION, RETENTION_DAYS } from './wall.ts'

const origin = 'http://localhost:4180'
const headers = { host: 'localhost:4180', origin }
const key = () => randomBytes(32).toString('hex')
const hope = (extra = {}) => ({
  text: 'A cup of tea together.',
  age: 67,
  consent: true,
  consentVersion: CONSENT_VERSION,
  key: key(),
  ...extra,
})
const open = (options = {}) =>
  createWallApp({ database: ':memory:', origins: [origin], limits: false, ...options })
const request = (app, url = '/api/wall', payload, extra = {}) =>
  app.inject({ method: payload === undefined ? 'GET' : 'POST', url, headers, payload, ...extra })
const receipt = (app, action, token) =>
  request(
    app,
    '/api/wall/' + action,
    {},
    { headers: { ...headers, authorization: 'Bearer ' + token } },
  )

test('a consented hope is immediately readable by another visitor; only public fields leave the service', async (t) => {
  const app = await open()
  t.after(() => app.close())
  const input = hope({ text: '  Demain, un café.\n雨の音を聴く。 <b>tea</b>  ', age: 8 })
  const result = await request(app, '/api/wall', input)
  assert.equal(result.statusCode, 201)
  assert.equal(result.json().state, 'shared')
  const feed = await request(app)
  assert.equal(feed.headers['cache-control'], 'no-store')
  assert.deepEqual(feed.json().hopes, [{ id: result.json().id, text: input.text.trim(), age: 8 }])
  assert.equal(feed.body.includes(input.key), false)
  assert.equal((await request(app, '/api/wall', input)).json().id, result.json().id)
  assert.equal((await request(app)).json().hopes.length, 1)
  assert.equal((await request(app, '/api/wall', { ...input, age: 9 })).statusCode, 409)
})

test('the server requires explicit current consent and validates ages, words and the entire schema', async (t) => {
  const app = await open()
  t.after(() => app.close())
  for (const overrides of [
    { consent: false },
    { consent: undefined },
    { consentVersion: 'old' },
    { age: 0 },
    { age: 121 },
    { age: 4.5 },
    { age: '12' },
    { text: '' },
    { text: 'x'.repeat(241) },
    { name: 'extra' },
    { key: 'guess' },
  ]) {
    assert.equal(
      (await request(app, '/api/wall', hope(overrides))).statusCode,
      400,
      JSON.stringify(overrides),
    )
  }
  assert.equal((await request(app)).json().hopes.length, 0)
  for (const age of [1, 120])
    assert.equal((await request(app, '/api/wall', hope({ age }))).statusCode, 201)
})

test('automated checks reject obvious contact details and abusive language before storage', async (t) => {
  const app = await open()
  t.after(() => app.close())
  for (const text of [
    'Visit https://example.com',
    'me@example.net',
    'Call +33 612 345 678',
    '@contact_me tomorrow',
    'fuck you',
    'invisible\u200bwords',
  ]) {
    const input = hope({ text })
    assert.equal((await request(app, '/api/wall', input)).statusCode, 422, text)
    assert.equal((await receipt(app, 'receipt', input.key)).statusCode, 404)
  }
  assert.equal((await request(app)).json().hopes.length, 0)
})

test('only the removal key can withdraw; retry and subsequent sharing cannot restore removed words', async (t) => {
  const app = await open()
  t.after(() => app.close())
  const input = hope()
  await request(app, '/api/wall', input)
  assert.equal((await receipt(app, 'withdraw', key())).statusCode, 404)
  assert.equal((await request(app)).json().hopes.length, 1)
  assert.equal((await receipt(app, 'withdraw', input.key)).json().state, 'withdrawn')
  assert.equal((await receipt(app, 'withdraw', input.key)).json().state, 'withdrawn')
  assert.equal((await receipt(app, 'receipt', input.key)).json().state, 'withdrawn')
  assert.deepEqual((await request(app)).json().hopes, [])
  assert.equal((await request(app, '/api/wall', input)).statusCode, 409)
})

test('reader flags immediately remove words without creating a review queue', async (t) => {
  const app = await open()
  t.after(() => app.close())
  const input = hope()
  const id = (await request(app, '/api/wall', input)).json().id
  assert.equal(
    (await request(app, `/api/wall/${id}/report`, { reason: 'invalid' })).statusCode,
    400,
  )
  assert.equal(
    (await request(app, '/api/wall/not-an-id/report', { reason: 'other' })).statusCode,
    400,
  )
  assert.equal(
    (await request(app, `/api/wall/${id}/report`, { reason: 'identifying' })).statusCode,
    200,
  )
  assert.deepEqual((await request(app)).json().hopes, [])
  assert.equal((await receipt(app, 'receipt', input.key)).json().state, 'flagged')
  assert.equal((await request(app, '/api/wall', input)).statusCode, 409)
})

test('expiry removes the hope and its receipt after seven days', async (t) => {
  let now = 100000
  const app = await open({ now: () => now })
  t.after(() => app.close())
  const input = hope()
  const response = await request(app, '/api/wall', input)
  assert.equal(response.json().expires, now + RETENTION_DAYS * 86400000)
  now = response.json().expires
  assert.deepEqual((await request(app)).json().hopes, [])
  assert.equal((await receipt(app, 'receipt', input.key)).statusCode, 404)
})

test('origin, host, parsing, body size and actual rate limits are enforced', async (t) => {
  const app = await open({ limits: true })
  t.after(() => app.close())
  assert.equal(
    (
      await request(app, '/api/wall', hope(), {
        headers: { ...headers, origin: 'https://elsewhere.test' },
      })
    ).statusCode,
    403,
  )
  assert.equal(
    (await request(app, '/api/wall', undefined, { headers: { host: 'elsewhere.test' } }))
      .statusCode,
    403,
  )
  assert.equal(
    (await request(app, '/api/wall', hope(), { headers: { host: headers.host } })).statusCode,
    403,
  )
  assert.equal(
    (
      await request(app, '/api/wall', '{', {
        headers: { ...headers, 'content-type': 'application/json' },
        remoteAddress: '127.0.0.2',
      })
    ).statusCode,
    400,
  )
  assert.equal(
    (
      await request(app, '/api/wall', hope({ text: 'x'.repeat(5000) }), {
        remoteAddress: '127.0.0.3',
      })
    ).statusCode,
    413,
  )
  for (let i = 0; i < 5; i++)
    assert.equal((await request(app, '/api/wall', hope())).statusCode, 201)
  const limited = await request(app, '/api/wall', hope())
  assert.equal(limited.statusCode, 429)
  assert.ok(limited.headers['retry-after'])
})

test('the local database survives restart and clears withdrawn and flagged text at rest', async () => {
  await mkdir(resolve('.local'), { recursive: true })
  const directory = await mkdtemp(resolve('.local/wall-test-'))
  const database = join(directory, 'test.sqlite')
  const one = hope(),
    two = hope({ text: 'An ordinary walk.' })
  let app = await open({ database })
  try {
    await request(app, '/api/wall', one)
    const id = (await request(app, '/api/wall', two)).json().id
    await app.close()
    app = await open({ database })
    assert.equal((await request(app)).json().hopes.length, 2)
    await receipt(app, 'withdraw', one.key)
    await request(app, `/api/wall/${id}/report`, { reason: 'other' })
    await app.close()
    app = null
    const db = new DatabaseSync(database)
    try {
      const rows = db.prepare('SELECT text, age, state, key_hash FROM hopes').all()
      assert.equal(rows.length, 2)
      for (const row of rows) {
        assert.equal(row.text, null)
        assert.equal(row.age, null)
        assert.ok(['withdrawn', 'flagged'].includes(row.state))
        assert.ok(row.key_hash !== one.key && row.key_hash !== two.key)
      }
    } finally {
      db.close()
    }
  } finally {
    await app?.close()
    assert.equal(dirname(directory), resolve('.local'))
    await rm(database, { force: true })
    await rmdir(directory)
  }
})
