import { expect, test } from '@playwright/test'

test('an age change leaves one brief trace and a held year survives interruption', async ({
  page,
}) => {
  await page.goto('/#weight')
  await page.locator('#year-progress').fill('6')
  await page.locator('#borrowed-age').fill('5')
  const trace = page.locator('.clock-borrowed .dial-trace')
  await expect
    .poll(() => trace.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBeGreaterThan(0.3)
  await expect(trace).toHaveAttribute('stroke-dasharray', '0.02 1')
  await expect(page.locator('#year-progress')).toHaveValue('6')
  await page.locator('#borrowed-age').fill('85')
  await expect(trace).toHaveCount(1)
  await expect.poll(() => trace.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(0)
  await page.locator('#borrowed-age').fill('18')
  await page.locator('#year-progress').fill('8')
  await expect(trace).toHaveCSS('opacity', '0')
  await page.locator('#borrowed-age').fill('32')
  await page.locator('.motion-toggle').click()
  await expect(trace).toHaveCSS('opacity', '0')
  await expect(page.locator('#year-progress')).toHaveValue('8')
})

test('all wishes open beside their original position and Escape returns there', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#wall')
  for (let i = 1; i <= 12; i++) {
    const wish = page.locator(`#hope-open-s${i}`)
    const note = page.locator(`[data-hope="s${i}"]`)
    await note.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
    const before = (await note.boundingBox())!
    await wish.click()
    const pair = page.locator('.echo-pair')
    await expect(pair).toBeFocused()
    const after = (await note.boundingBox())!
    expect(Math.abs(after.x - before.x)).toBeLessThan(6)
    expect(Math.abs(after.y - before.y)).toBeLessThan(2)
    await expect(pair.locator('.hope-age').first()).toBeInViewport({ ratio: 1 })
    await expect(pair.locator('.hope-age').last()).toBeInViewport({ ratio: 1 })
    await page.keyboard.press('Escape')
    await expect(wish).toBeFocused()
    const returned = (await note.boundingBox())!
    expect(Math.abs(returned.y - before.y)).toBeLessThan(2)
  }
})

test('a wish keeps its theme when its companion belongs to another theme', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#wall')
  const filter = page.getByRole('button', { name: 'A little quiet', exact: true })
  await filter.click()
  const count = await page.locator('.hope-note').count()
  await page.locator('#hope-open-s5').click()
  await expect(filter).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.echo-pair [data-hope="s12"]')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('#hope-open-s5')).toBeFocused()
  await expect(page.locator('.hope-note')).toHaveCount(count)
})

test('a small phone keeps both ages readable in an anchored pairing', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#wall')
  await page.locator('#hope-open-s10').click()
  const pair = page.locator('.echo-pair')
  await expect(pair.locator('.hope-age').first()).toBeInViewport({ ratio: 1 })
  await expect(pair.locator('.hope-age').last()).toBeInViewport({ ratio: 1 })
  await expect(pair.locator('.echo-thread')).toHaveCSS('animation-name', 'none')
  await expect(pair.locator('.echo-companion')).toHaveCSS('animation-name', 'none')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})

test('softened impressions reverse and explicitly opened moments stay clear', async ({ page }) => {
  await page.goto('/#memory')
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const monday = page.locator('.memory-print').nth(0)
  const tuesday = page.locator('.memory-print').nth(1)
  await page.getByRole('button', { name: 'Looking back', exact: true }).click()
  await expect(monday).toHaveCSS('opacity', '0.82')
  await page.getByRole('button', { name: 'As it happens', exact: true }).click()
  await page.getByRole('button', { name: 'Looking back', exact: true }).click()
  const cup = page.getByRole('button', { name: /MON A familiar cup/ })
  await cup.click()
  await cup.click()
  await expect(monday).toHaveCSS('opacity', '1')
  await expect(monday).toHaveCSS('filter', 'none')
  await expect(tuesday).toHaveCSS('opacity', '0.82')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: 'As it happens', exact: true }).click()
  await expect(tuesday).toHaveCSS('opacity', '1')
  await expect(tuesday).toHaveCSS('filter', 'none')
  await expect(page.locator('.moment-label').first()).toHaveCSS('filter', 'none')
  expect(errors).toEqual([])
})
