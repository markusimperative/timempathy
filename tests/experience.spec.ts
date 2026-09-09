import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('the complete journey renders locally without errors or outside requests', async ({
  page,
}) => {
  const errors: string[] = []
  const external: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('request', (req) => {
    if (!req.url().startsWith('http://127.0.0.1:5173') && !req.url().startsWith('data:'))
      external.push(req.url())
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'The same clock.A different feeling.',
  )
  await page.getByRole('link', { name: 'Borrow a clock', exact: true }).click()
  await expect(page).toHaveURL(/#weight$/)
  await expect(page.getByRole('heading', { name: 'Borrow another clock.' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await expect(
    page.getByText('An imagined wall. These are written examples, not real submissions.'),
  ).toBeAttached()
  await expect(page.locator('.hope-note')).toHaveCount(12)
  expect(errors).toEqual([])
  expect(external).toEqual([])
})

test('clocks support keyboard ages, synchronized playback, pause and scrubbing', async ({
  page,
}) => {
  await page.goto('/#weight')
  await page.getByRole('button', { name: '85', exact: true }).click()
  await expect(page.getByRole('slider', { name: 'Borrowed age', exact: true })).toHaveValue('85')
  const start = page.getByRole('slider', { name: 'Starting age', exact: true })
  await start.focus()
  await page.keyboard.press('ArrowRight')
  await expect(start).toHaveValue('33')
  await page.getByRole('button', { name: 'Let a year pass' }).click()
  await expect(page.getByRole('button', { name: 'Pause the year' })).toBeVisible()
  await expect
    .poll(async () => Number(await page.locator('#year-progress').inputValue()))
    .toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Pause the year' }).click()
  const value = await page.locator('#year-progress').inputValue()
  await page.waitForTimeout(200)
  expect(await page.locator('#year-progress').inputValue()).toBe(value)
  await page.locator('#year-progress').fill('6')
  await expect(page.locator('#year-progress')).toHaveAttribute('aria-valuetext', '6 of 12 months')
  const paths = await page
    .locator('.dial-year')
    .evaluateAll((elements) => elements.map((el) => el.getAttribute('stroke-dasharray')))
  expect(parseFloat(paths[0]!)).toBeCloseTo(0.5 / 33)
  expect(parseFloat(paths[1]!)).toBeCloseTo(0.5 / 85)
})

test('memory gives an ordinary repeated moment equal permission to stay', async ({ page }) => {
  await page.goto('/#memory')
  await page.getByRole('button', { name: 'Looking back', exact: true }).click()
  await expect(page.getByText(/Here, familiar cups fold together/)).toBeVisible()
  const ordinary = page.getByRole('button', { name: /WED Morning, again/ })
  await ordinary.click()
  await expect(ordinary).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('A familiar morning can stay with you, too.')).toBeVisible()
  await ordinary.click()
  await expect(ordinary).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('button', { name: 'As it happens', exact: true }).click()
  await expect(page.locator('.memory-moment')).toHaveCount(7)
})

test('reflections are ephemeral unless saving is explicitly selected', async ({ page }) => {
  await page.goto('/#tomorrow')
  await page.getByRole('button', { name: 'Keep this thought' }).click()
  await expect(page.getByRole('alert')).toHaveText('A few words are enough.')
  await expect(page.getByRole('textbox', { name: 'I’d like to remember…' })).toBeFocused()
  await page
    .getByRole('textbox', { name: 'I’d like to remember…' })
    .fill('Making soup with a friend.')
  await page.getByRole('spinbutton', { name: 'Your age' }).fill('32.5')
  await page.getByRole('button', { name: 'Keep this thought' }).click()
  await expect(
    page.getByText('Use a whole number from 1 to 120, or leave your age blank.'),
  ).toBeVisible()
  await page.getByRole('spinbutton', { name: 'Your age' }).fill('')
  await page.getByRole('button', { name: 'Keep this thought' }).click()
  await expect(page.locator('.saved-state')).toBeFocused()
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await expect(page.locator('#your-thought')).toContainText('Making soup with a friend.')
  await page.reload()
  await expect(page.locator('#your-thought')).toHaveCount(0)
})

test('an explicitly saved thought survives reload and can be removed', async ({ page }) => {
  await page.goto('/#tomorrow')
  const literal = '<img src=x onerror=alert(1)> An ordinary peaceful day.'
  await page.getByRole('textbox', { name: 'I’d like to remember…' }).fill(literal)
  await page.getByRole('spinbutton', { name: 'Your age' }).fill('79')
  await page.getByRole('checkbox', { name: 'Keep this thought in this browser.' }).check()
  await page.getByRole('button', { name: 'Keep this thought' }).click()
  await page.reload()
  await expect(page.locator('.saved-state blockquote')).toHaveText(literal)
  await expect(page.locator('#your-thought')).toContainText('AGE 79')
  await expect(page.locator('#your-thought img')).toHaveCount(0)
  await page.getByRole('button', { name: 'Remove my thought' }).click()
  await expect(page.locator('.saved-state')).toHaveCount(0)
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await page.reload()
  await expect(page.locator('#your-thought')).toHaveCount(0)
})

test('blocked storage is reported and still allows a private session thought', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'QuotaExceededError')
    }
  })
  await page.goto('/#tomorrow')
  await page.getByRole('textbox', { name: 'I’d like to remember…' }).fill('The rain.')
  await page.getByRole('checkbox', { name: 'Keep this thought in this browser.' }).check()
  await page.getByRole('button', { name: 'Keep this thought' }).click()
  await expect(page.getByText(/Your browser could not save this thought/)).toBeVisible()
  await expect(page.locator('.saved-state')).toContainText('Kept only for this visit.')
})

test('wall filters and echoes connect ages without ranking people', async ({ page }) => {
  await page.goto('/#wall')
  await page.getByRole('button', { name: 'A little quiet', exact: true }).click()
  await expect(page.locator('.hope-note')).toHaveCount(3)
  await page.getByRole('button', { name: 'Find an echo', exact: true }).click()
  await expect(page.locator('.hope-note')).toHaveCount(12)
  await expect(page.locator('.is-echo')).toHaveCount(2)
  await expect(page.locator('.echo-caption')).toContainText('ages 17 and 79')
  await page.getByRole('button', { name: 'Another echo', exact: true }).click()
  await expect(page.locator('.echo-caption')).toContainText('ages 34 and 73')
})

test('reduced motion offers a direct equivalent with no timed interaction', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#weight')
  await expect(
    page.getByRole('button', { name: 'Reduced motion is enabled by your device' }),
  ).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Let a year pass' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Show the beginning' }).click()
  await expect(page.locator('#year-progress')).toHaveValue('0')
  await page.getByRole('button', { name: 'Show the whole year' }).click()
  await expect(page.locator('#year-progress')).toHaveValue('12')
})

test('key states pass automated accessibility checks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const initial = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(
    initial.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, issue: n.failureSummary })),
    })),
  ).toEqual([])
  await page.getByRole('button', { name: 'Looking back', exact: true }).click()
  await page.getByRole('button', { name: 'Find an echo', exact: true }).click()
  const changed = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(
    changed.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, issue: n.failureSummary })),
    })),
  ).toEqual([])
})

test('narrow and enlarged layouts keep the page within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 })
  await page.goto('/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.addStyleTag({ content: 'body { font-size: 200%; }' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('the global motion control stops playback without silently restarting it', async ({
  page,
}) => {
  await page.goto('/#weight')
  await page.getByRole('button', { name: 'Let a year pass' }).click()
  await expect
    .poll(async () => Number(await page.locator('#year-progress').inputValue()))
    .toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click()
  await expect(page.locator('.clock-summary')).toContainText('The year is paused')
  const pausedValue = await page.locator('#year-progress').inputValue()
  await page.getByRole('button', { name: 'Resume motion', exact: true }).click()
  await page.waitForTimeout(200)
  expect(await page.locator('#year-progress').inputValue()).toBe(pausedValue)
  await expect(page.getByRole('button', { name: 'Continue the year' })).toBeAttached()
})

test('keyboard visitors can skip the header and reach the first interaction', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to the experience' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Borrow a clock', exact: true })).toBeFocused()
})

test('a failed deletion never claims that a persistent thought is gone', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'timempathy.reflection.v1',
      JSON.stringify({ text: 'A quiet day.', age: 42 }),
    )
    Storage.prototype.removeItem = () => {
      throw Error('blocked')
    }
  })
  await page.goto('/#tomorrow')
  await page.getByRole('button', { name: 'Remove my thought' }).click()
  await expect(page.getByText(/This browser could not remove the saved thought/)).toBeVisible()
  await expect(page.locator('.saved-state blockquote')).toHaveText('A quiet day.')
})

test('a complete year stops at twelve months for both lives', async ({ page }) => {
  await page.goto('/#weight')
  await page.getByRole('button', { name: 'Let a year pass' }).click()
  await expect(page.locator('#year-progress')).toHaveValue('12', { timeout: 12000 })
  await expect(page.getByRole('button', { name: 'Let a year pass' })).toBeVisible()
  await expect(page.locator('.clock-summary')).toContainText(
    '3.1% of one circle and 20.0% of the other',
  )
})

test('a chosen illustration accompanies tomorrow without changing the visitor’s words', async ({
  page,
}) => {
  await page.goto('/#tomorrow')
  await page
    .getByRole('textbox', { name: 'I’d like to remember…' })
    .fill('Something entirely my own.')
  await page.getByRole('button', { name: 'Looking back', exact: true }).click()
  const ordinary = page.getByRole('button', { name: /WED Morning, again/ })
  await ordinary.focus()
  await page.keyboard.press('Enter')
  await expect(ordinary).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.memory-keepsake')).toContainText('Another cup across the table.')
  await page.getByRole('link', { name: 'Take this into tomorrow' }).click()
  await expect(page).toHaveURL(/#tomorrow-title$/)
  await expect(page.locator('#tomorrow-title')).toBeFocused()
  await expect(page.locator('.tomorrow-companion')).toContainText('Morning, again')
  await expect(page.locator('.tomorrow-companion .object-cup')).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'I’d like to remember…' })).toHaveValue(
    'Something entirely my own.',
  )
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await page.getByRole('button', { name: 'Leave this moment here' }).click()
  await expect(page.getByRole('textbox', { name: 'I’d like to remember…' })).toBeFocused()
  await expect(page.locator('.tomorrow-companion')).toHaveCount(0)
  await expect(ordinary).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('textbox', { name: 'I’d like to remember…' })).toHaveValue(
    'Something entirely my own.',
  )
})

test('the paper folds at the visitor’s pace and any day can reopen in still mode', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#memory')
  const thread = page.getByRole('slider', { name: 'Fold the week into memory' })
  await thread.focus()
  await page.keyboard.press('End')
  await expect(thread).toHaveValue('1')
  await expect(thread).toHaveAttribute(
    'aria-valuetext',
    'Looking back, familiar mornings folded together',
  )
  const pageWidth = () =>
    page
      .locator('.memory-page')
      .first()
      .evaluate((el) => el.getBoundingClientRect().width)
  const foldedWidth = await pageWidth()
  await page.getByRole('button', { name: /MON A familiar cup/ }).click()
  await expect.poll(pageWidth).toBeGreaterThan(foldedWidth + 20)
  await page.getByRole('button', { name: /SAT An evening walk/ }).click()
  await expect(page.locator('.tomorrow-companion .object-moon')).toBeAttached()
  await expect(page.locator('.memory-moment[aria-pressed="true"]')).toHaveCount(1)
  await page.getByRole('button', { name: 'As it happens', exact: true }).click()
  await expect(thread).toHaveValue('0')
  const accessibility = await new AxeBuilder({ page })
    .include('#memory')
    .include('#tomorrow')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(
    accessibility.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
  ).toEqual([])
  await page.reload()
  await expect(page.locator('.tomorrow-companion')).toHaveCount(0)
})

test('all seven paper scenes are reachable on a narrow screen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#memory')
  const strip = page.locator('.memory-strip')
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'Later in the week' }).click()
  expect(await strip.evaluate((el) => el.scrollLeft)).toBeGreaterThan(500)
  const sunday = page.getByRole('button', { name: /SUN Something growing/ })
  await sunday.click()
  await expect(sunday).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('link', { name: 'Take this into tomorrow' }).click()
  await expect(page.locator('.tomorrow-companion .object-flower')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
