import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

// Capture the clock in an actual viewport so an oversized chapter cannot hide
// behind a full-element screenshot.
async function captureClock(page, path) {
  await page
    .locator('#weight')
    .evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
  await page.screenshot({ path })
}

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
    if (section === 'weight') {
      await captureClock(page, '.local/screenshots/desktop-weight.png')
      continue
    }
    await page
      .locator(`#${section}`)
      .screenshot({ path: `.local/screenshots/desktop-${section}.png` })
  }
  await page.getByRole('button', { name: 'Looking back', exact: true }).click()
  await page
    .locator('#memory')
    .screenshot({ path: '.local/screenshots/desktop-memory-remembered.png' })
  await page.getByRole('button', { name: /WED Morning, again/ }).click()
  await page.mouse.move(0, 0)
  await page.locator('#memory').screenshot({ path: '.local/screenshots/desktop-memory-held.png' })
  await page.getByRole('link', { name: 'Take this into tomorrow' }).click()
  await page
    .locator('#tomorrow')
    .screenshot({ path: '.local/screenshots/desktop-tomorrow-companion.png' })
  await page.getByRole('button', { name: 'Find an echo', exact: true }).click()
  await page.locator('#wall').screenshot({ path: '.local/screenshots/desktop-wall-echo.png' })
  const motionPage = await browser.newPage({
    viewport: { width: 1440, height: 960 },
    reducedMotion: 'no-preference',
  })
  await motionPage.goto('http://127.0.0.1:5173/#weight')
  await motionPage.evaluate(() => document.fonts.ready)
  await motionPage.getByRole('button', { name: 'Watch the same year pass' }).click()
  await motionPage.mouse.move(0, 0)
  await motionPage.waitForTimeout(2800)
  await captureClock(motionPage, '.local/screenshots/desktop-clock-playing.png')
  await motionPage.close()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://127.0.0.1:5173')
  await page.screenshot({ path: '.local/screenshots/mobile-hero.png' })
  for (const section of ['weight', 'memory', 'tomorrow', 'wall']) {
    if (section === 'weight') {
      await captureClock(page, '.local/screenshots/mobile-weight.png')
      continue
    }
    await page
      .locator(`#${section}`)
      .screenshot({ path: `.local/screenshots/mobile-${section}.png` })
  }
  await page.getByRole('button', { name: /MON A familiar cup/ }).click()
  await page.getByRole('link', { name: 'Take this into tomorrow' }).click()
  await page
    .locator('#tomorrow')
    .screenshot({ path: '.local/screenshots/mobile-tomorrow-companion.png' })
  console.log('Rendered desktop and mobile screenshots saved to .local/screenshots.')
} finally {
  await browser.close()
}
