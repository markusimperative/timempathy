import { chromium, expect } from '@playwright/test'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const origin = 'http://127.0.0.1:4173'
const server = spawn(
  process.execPath,
  [
    'node_modules/vite/bin/vite.js',
    'preview',
    '--host',
    '127.0.0.1',
    '--port',
    '4173',
    '--strictPort',
  ],
  { windowsHide: true, stdio: 'pipe' },
)
let serverLog = ''
server.stdout.on('data', (data) => {
  serverLog += data
})
server.stderr.on('data', (data) => {
  serverLog += data
})
let browser
try {
  for (let i = 0; i < 50 && !serverLog.includes(origin); i++) {
    if (server.exitCode !== null) throw Error('Preview server did not start: ' + serverLog)
    await delay(100)
  }
  if (!serverLog.includes(origin)) throw Error('Preview server was not ready: ' + serverLog)
  browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
    reducedMotion: 'reduce',
  })
  const errors = []
  const external = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== origin) external.push(request.url())
  })
  await page.goto(origin)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('button', { name: '85', exact: true }).click()
  await expect(page.getByRole('slider', { name: 'Borrowed age', exact: true })).toHaveValue('85')
  await page.getByRole('button', { name: 'Looking back', exact: true }).click()
  await page.getByRole('button', { name: /WED Morning, again/ }).click()
  await page.getByRole('link', { name: 'Take this into tomorrow' }).click()
  await expect(page.locator('#tomorrow-title')).toBeFocused()
  await expect(page.locator('.tomorrow-companion')).toContainText('Morning, again')
  await page.getByRole('textbox', { name: 'I’d like to remember…' }).fill('The first cup of tea.')
  await page.getByRole('button', { name: 'Keep this thought' }).click()
  await expect(page.locator('#your-thought')).toContainText('The first cup of tea.')
  await page.getByRole('button', { name: 'Find an echo', exact: true }).click()
  await expect(page.locator('.is-echo')).toHaveCount(2)
  await page.getByRole('button', { name: 'Another echo', exact: true }).click()
  await expect(page.locator('.hope-note').nth(0).locator('.hope-age')).toHaveText('34')
  await expect(page.locator('.hope-note').nth(1).locator('.hope-age')).toHaveText('73')
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  const notices = await page.request.get(origin + '/third-party-notices.txt')
  expect(notices.ok()).toBe(true)
  expect(await notices.text()).toContain('SIL OPEN FONT LICENSE')
  expect(errors).toEqual([])
  expect(external).toEqual([])
  console.log(
    'Production smoke passed: rendered scenes, reflection privacy, adjacent echo pairs, bundled notices, no external requests or runtime errors.',
  )
} finally {
  await browser?.close()
  server.kill()
}
