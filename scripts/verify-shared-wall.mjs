import { chromium, expect, devices } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import serveStatic from '@fastify/static'
import { resolve } from 'node:path'
import { mkdir } from 'node:fs/promises'
import { createWallApp } from '../server/wall.ts'

// Only isolated local services are permitted: never seed a deployed Wall.
const origin = process.env.WALL_TEST_ORIGIN ?? 'http://127.0.0.1:4180'
if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
  throw Error('Tests require an isolated loopback Wall')
let app
if (!process.env.WALL_TEST_ORIGIN) {
  app = await createWallApp({ database: ':memory:', origins: [origin], limits: false })
  await app.register(serveStatic, { root: resolve('dist'), dotfiles: 'deny' })
  await app.listen({ host: '127.0.0.1', port: 4180 })
}
let browser
try {
  browser = await chromium.launch()
  const errors = [],
    external = [],
    violations = []
  let visitor = 0
  const createVisitor = async (mobile = false) => {
    const context = await browser.newContext({
      ...(mobile ? devices['Pixel 7'] : { viewport: { width: 1440, height: 960 } }),
      reducedMotion: 'reduce',
      ...(process.env.WALL_TEST_ORIGIN
        ? { extraHTTPHeaders: { 'CF-Connecting-IP': `198.51.100.${++visitor}` } }
        : {}),
    })
    const page = await context.newPage()
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('request', (r) => {
      if (new URL(r.url()).origin !== origin) external.push(r.url())
    })
    await page.goto(origin)
    return page
  }
  const privateThought = async (page, text, age) => {
    await page.getByRole('textbox', { name: 'I’d like to remember…' }).fill(text)
    if (age) await page.locator('#reflection-age').fill(String(age))
    await page.getByRole('button', { name: 'Keep this thought', exact: true }).click()
    await expect(page.locator('.saved-state')).toContainText(text)
  }
  const offer = async (page) => {
    await page.getByRole('button', { name: 'Offer it to the Wall' }).click()
    await expect(
      page.getByRole('checkbox', { name: 'I agree to share these words and my age on this Wall.' }),
    ).not.toBeChecked()
  }
  const agree = (page) =>
    page
      .getByRole('checkbox', { name: 'I agree to share these words and my age on this Wall.' })
      .check()
  const share = (page) => page.getByRole('button', { name: 'Share this hope', exact: true }).click()
  const audit = async (page, scope) => {
    const result = await new AxeBuilder({ page })
      .include(scope)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    violations.push(
      ...result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    )
  }
  const first = await createVisitor()
  if (process.env.WALL_TEST_ORIGIN) {
    await expect(first.locator('#privacy')).toContainText('Cloudflare')
    await expect(first.locator('#privacy')).not.toContainText('No external service')
  }
  let sent = 0
  first.on('request', (r) => {
    if (r.url() === origin + '/api/wall' && r.method() === 'POST') sent++
  })
  await privateThought(first, 'A warm cup, and enough time to finish the story.', 72)
  expect(sent).toBe(0)
  await offer(first)
  if (process.env.WALL_TEST_ORIGIN) {
    await expect(first.locator('.share-form')).toContainText('Anyone on the internet')
    await expect(first.locator('.share-form')).toContainText('seven more days')
  }
  await share(first)
  expect(sent).toBe(0)
  await expect(first.getByRole('alert')).toContainText('Choose whether')
  await agree(first)
  await audit(first, '#tomorrow')
  await share(first)
  await expect(first.locator('.sharing-result')).toContainText('Your hope has a place')
  const firstKey = await first
    .getByRole('textbox', { name: 'Your removal key', exact: true })
    .inputValue()
  expect(sent).toBe(1)
  await expect(first.locator('.shared-hope-list .shared-hope')).toHaveCount(1)
  await expect(first.locator('.meet-tomorrow')).toHaveCount(0)
  await expect(first.locator('.saved-state')).toBeVisible()
  expect(await first.evaluate(() => localStorage.length)).toBe(0)

  const second = await createVisitor(true)
  await expect(second.locator('.shared-hope-list')).toContainText('enough time to finish the story')
  // Optional age stays private until the visitor supplies it for sharing.
  await privateThought(second, 'The familiar sound of someone putting the kettle on.')
  await offer(second)
  await mkdir('.local/screenshots', { recursive: true })
  await second
    .locator('#tomorrow')
    .screenshot({ path: '.local/screenshots/share-consent-mobile.png' })
  await agree(second)
  await share(second)
  await expect(second.locator('#share-age')).toBeFocused()
  await second.locator('#share-age').fill('19')
  await share(second)
  await expect(second.locator('.sharing-result')).toContainText('Your hope has a place')
  const secondKey = await second
    .getByRole('textbox', { name: 'Your removal key', exact: true })
    .inputValue()
  await second.locator('.meet-tomorrow').click()
  await expect(second.locator('.shared-encounter')).toBeFocused()
  await expect(second.locator('.own-hope .shared-age')).toHaveText('19')
  await expect(second.locator('.encountered-hope .shared-age')).toHaveText('72')
  await audit(second, '#wall')
  await mkdir('.local/screenshots', { recursive: true })
  await second.locator('#wall').screenshot({ path: '.local/screenshots/shared-wall-mobile.png' })
  await second.locator('#year-progress').fill('6')
  await second.getByRole('button', { name: 'Borrow this person’s clock' }).click()
  await expect(second.locator('#borrowed-age')).toHaveValue('72')
  await expect(second.locator('#year-progress')).toHaveValue('6')
  await expect(second.locator('#weight-title')).toBeFocused()
  await expect(second.locator('#weight')).toContainText('A hope from age 72 brought you here.')
  await second.getByRole('link', { name: 'Return to their words.' }).click()
  await expect(second.locator('.encountered-hope')).toContainText('finish the story')
  expect(await second.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

  await first.getByRole('button', { name: 'Refresh the Wall', exact: true }).click()
  await first.locator('.meet-tomorrow').click()
  await expect(first.locator('.encountered-hope')).toContainText('kettle on')
  await first.locator('#wall').screenshot({ path: '.local/screenshots/shared-wall-desktop.png' })
  await first
    .locator('#tomorrow')
    .screenshot({ path: '.local/screenshots/shared-choice-desktop.png' })
  await audit(first, '#tomorrow')

  // Private deletion must not strand the author's active withdrawal control.
  await second.getByRole('button', { name: 'Remove private copy', exact: true }).click()
  await expect(second.locator('#your-thought')).toHaveCount(0)
  await expect(second.getByRole('textbox', { name: 'Your removal key', exact: true })).toHaveValue(
    secondKey,
  )
  await second.getByRole('button', { name: 'Withdraw from the Wall', exact: true }).click()
  await expect(second.locator('.sharing-result')).toContainText('Your hope has left')
  await first.getByRole('button', { name: 'Refresh the Wall', exact: true }).click()
  await expect(first.locator('.shared-hope-list .shared-hope')).toHaveCount(1)
  await expect(first.locator('.shared-encounter')).toHaveCount(0)

  // A third reader can flag, but cannot withdraw with a guessed author key.
  const third = await createVisitor()
  await third.locator('.manage-hope summary').click()
  await third.locator('#wall-removal-key').fill('0'.repeat(64))
  await third.getByRole('button', { name: 'Withdraw my hope', exact: true }).click()
  await expect(third.getByRole('alert')).toContainText('key was not found')
  await expect(third.locator('.shared-hope-list .shared-hope')).toHaveCount(1)
  await third.getByRole('button', { name: 'Flag hope from age 72', exact: true }).click()
  await third.getByRole('button', { name: 'Flag and remove', exact: true }).click()
  await expect(third.locator('.wall-empty')).toBeVisible()
  await expect(third.locator('#shared-wall')).toBeFocused()
  await first.getByRole('button', { name: 'Refresh the Wall', exact: true }).click()
  await first.locator('.manage-hope summary').click()
  await first.locator('#wall-removal-key').fill(firstKey)
  await first.getByRole('button', { name: 'Check my hope', exact: true }).click()
  await expect(first.locator('.manage-hope')).toContainText('flagged and has left')
  await expect(first.locator('.sharing-result')).toContainText('Your hope has left')

  // A lost response followed by Keep private must withdraw the accepted request.
  const interrupted = await createVisitor()
  await privateThought(interrupted, 'Watching the rain with a friend.', 32)
  await offer(interrupted)
  await agree(interrupted)
  await interrupted.route('**/api/wall', async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    await route.fetch()
    await route.abort('failed')
  })
  await share(interrupted)
  await expect(interrupted.getByRole('alert')).toBeVisible()
  await interrupted.getByRole('button', { name: 'Withdraw and keep it private' }).click()
  await expect(interrupted.locator('.sharing-choice')).toHaveCount(0)
  expect((await (await first.request.get(origin + '/api/wall')).json()).hopes).toEqual([])

  // Rejected input never leaves a stored receipt; private editing remains possible.
  const rejected = await createVisitor(true)
  await privateThought(rejected, 'Call me at test@example.org', 18)
  await offer(rejected)
  await agree(rejected)
  await share(rejected)
  await expect(rejected.getByRole('alert')).toContainText('Leave out links')
  await expect(rejected.getByRole('button', { name: 'Keep it private', exact: true })).toBeVisible()
  await rejected.getByRole('button', { name: 'Keep it private', exact: true }).click()
  await expect(rejected.locator('.saved-state')).toContainText('test@example.org')
  expect((await (await first.request.get(origin + '/api/wall')).json()).hopes).toEqual([])
  const narrow = await createVisitor(true)
  await narrow.setViewportSize({ width: 320, height: 568 })
  const longHope = 'Time for a familiar story, a quiet kitchen, and someone to listen. '
    .repeat(4)
    .slice(0, 240)
  await privateThought(narrow, longHope, 120)
  await offer(narrow)
  await agree(narrow)
  await share(narrow)
  await expect(narrow.locator('.sharing-result')).toContainText('Your hope has a place')
  await audit(narrow, '#tomorrow')
  await interrupted.getByRole('button', { name: 'Refresh the Wall', exact: true }).click()
  await interrupted.setViewportSize({ width: 320, height: 568 })
  await interrupted.locator('.meet-tomorrow').click()
  await expect(interrupted.locator('.encountered-hope')).toContainText(longHope.trim())
  expect(await interrupted.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
    true,
  )
  const ageTops = await interrupted
    .locator('.shared-encounter .shared-age')
    .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top))
  expect(Math.abs(ageTops[0] - ageTops[1])).toBeLessThan(2)
  await audit(interrupted, '#wall')
  await narrow.getByRole('button', { name: 'Withdraw from the Wall', exact: true }).click()
  expect(violations).toEqual([])
  expect(errors).toEqual([])
  expect(external).toEqual([])
  console.log(
    'Shared Wall verified: independent visitors, explicit consent, age validation, accessible encounters, clock continuity, withdrawal, reader flags, lost-response recovery, rejected-text privacy, no external requests. Screenshots contain isolated test fixtures only.',
  )
} finally {
  await browser?.close()
  await app?.close()
}
