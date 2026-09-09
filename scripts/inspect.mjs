import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

await mkdir('.local/screenshots', { recursive: true })
const browser = await chromium.launch()
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
    reducedMotion: 'reduce',
  })
  await page.goto('http://127.0.0.1:5173')
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: '.local/screenshots/desktop-hero.png' })
  for (const section of ['weight', 'memory', 'tomorrow', 'wall']) {
    await page
      .locator(`#${section}`)
      .screenshot({ path: `.local/screenshots/desktop-${section}.png` })
  }
  await page.getByRole('button', { name: 'Looking back', exact: true }).click()
  await page
    .locator('#memory')
    .screenshot({ path: '.local/screenshots/desktop-memory-remembered.png' })
  await page.getByRole('button', { name: 'Find an echo', exact: true }).click()
  await page.locator('#wall').screenshot({ path: '.local/screenshots/desktop-wall-echo.png' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://127.0.0.1:5173')
  await page.screenshot({ path: '.local/screenshots/mobile-hero.png' })
  for (const section of ['weight', 'memory', 'tomorrow', 'wall']) {
    await page
      .locator(`#${section}`)
      .screenshot({ path: `.local/screenshots/mobile-${section}.png` })
  }
  console.log('Rendered desktop and mobile screenshots saved to .local/screenshots.')
} finally {
  await browser.close()
}
