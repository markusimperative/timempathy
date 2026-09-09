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
    'The same clock. A different feeling.',
  )
  await page.getByRole('link', { name: 'Borrow a clock', exact: true }).click()
  await expect(page).toHaveURL(/#weight$/)
  await expect(page.getByRole('heading', { name: 'Borrow another clock.' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await expect(
    page.getByText('An imagined wall — these are written examples, not real submissions.'),
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
  await expect(start).toHaveValue('6')
  await page.getByRole('button', { name: 'Watch the same year pass' }).click()
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible()
  await expect
    .poll(async () => Number(await page.locator('#year-progress').inputValue()))
    .toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  const value = await page.locator('#year-progress').inputValue()
  await page.waitForTimeout(200)
  expect(await page.locator('#year-progress').inputValue()).toBe(value)
  await page.locator('#year-progress').fill('6')
  await expect(page.locator('#year-progress')).toHaveAttribute('aria-valuetext', '6 of 12 months')
  const paths = await page
    .locator('.dial-year')
    .evaluateAll((elements) => elements.map((el) => el.getAttribute('stroke-dasharray')))
  expect(parseFloat(paths[0]!)).toBeCloseTo(0.5 / 6)
  expect(parseFloat(paths[1]!)).toBeCloseTo(0.5 / 85)
})

test('memory gives an ordinary repeated moment equal permission to stay', async ({ page }) => {
  await page.goto('/#memory')
  await page.getByRole('button', { name: 'Looking back', exact: true }).click()
  await expect(page.getByText('Less paper. Still seven days. Open any fold.')).toBeVisible()
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
  await expect(page.getByRole('button', { name: 'Watch the same year pass' })).toHaveCount(0)
  await expect(page.locator('#year-progress')).toHaveValue('0')
  await page.getByRole('button', { name: 'Compare the same year' }).click()
  await expect(page.locator('#year-progress')).toHaveValue('12')
  await expect(page.locator('.clock-play')).not.toHaveClass(/has-cue/)
  await page.getByRole('button', { name: 'Show the beginning' }).click()
  await expect(page.locator('#year-progress')).toHaveValue('0')
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
  await page.getByRole('button', { name: 'Watch the same year pass' }).click()
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
  await page.getByRole('button', { name: 'Watch the same year pass' }).click()
  await expect(page.locator('#year-progress')).toHaveValue('12', { timeout: 12000 })
  await expect(page.getByRole('button', { name: 'Watch again' })).toBeVisible()
  await expect(page.locator('.clock-summary')).toHaveText(
    'The same year. A different share of the story.',
  )
  await expect(page.locator('.year-share')).toHaveText(['One of 5 years.', 'One of 50 years.'])
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

test('selecting and switching paper cards keeps the drawings in proportion throughout motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/#memory')
  await page.evaluate(() => document.fonts.ready)
  await page.locator('.memory-strip').scrollIntoViewIfNeeded()
  const result = await page.evaluate(async () => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.memory-page'))
    const suns = cards
      .slice(0, 3)
      .map((card) => card.querySelector<SVGCircleElement>('.scene-cup > circle')!)
    const widths: number[] = []
    let maximumDistortion = 0
    const sample = () => {
      widths.push(...cards.slice(0, 3).map((card) => card.getBoundingClientRect().width))
      for (const sun of suns) {
        const box = sun.getBoundingClientRect()
        maximumDistortion = Math.max(maximumDistortion, Math.abs(box.width / box.height - 1))
      }
    }
    const observe = (duration: number) =>
      new Promise<void>((resolve) => {
        const start = performance.now()
        const frame = () => {
          sample()
          if (performance.now() - start < duration) requestAnimationFrame(frame)
          else resolve()
        }
        requestAnimationFrame(frame)
      })
    sample()
    // Interrupt two transitions with another choice, then release the final card.
    for (const index of [0, 1, 2, 2]) {
      cards[index].querySelector('button')!.click()
      await observe(index === 0 ? 450 : 260)
    }
    await observe(900)
    return {
      maximumDistortion,
      distinctWidths: new Set(widths.map((width) => Math.round(width))).size,
    }
  })
  expect(result.maximumDistortion).toBeLessThan(0.01)
  expect(result.distinctWidths).toBeGreaterThan(3)
  await expect(page.locator('.memory-moment[aria-pressed="true"]')).toHaveCount(0)
})

test('each life marks its years and the same months trace both arcs', async ({ page }) => {
  await page.goto('/#weight')
  await expect(page.locator('.clock-reference .dial-ticks line')).toHaveCount(5)
  await expect(page.locator('.clock-borrowed .dial-ticks line')).toHaveCount(50)
  await page.locator('#year-progress').fill('6')
  await expect(page.locator('#year-progress')).toHaveAttribute('aria-valuetext', '6 of 12 months')
  const arcs = await page
    .locator('.dial-year')
    .evaluateAll((els) => els.map((el) => parseFloat(el.getAttribute('stroke-dasharray')!)))
  expect(arcs[0]).toBeCloseTo(0.5 / 5)
  expect(arcs[1]).toBeCloseTo(0.5 / 50)
  await page.locator('#reference-age').fill('1')
  await page.locator('#borrowed-age').fill('100')
  await expect(page.locator('.clock-reference .dial-ticks line')).toHaveCount(1)
  await expect(page.locator('.clock-borrowed .dial-ticks line')).toHaveCount(100)
  await expect(page.locator('.clock-reference .year-dial')).toHaveAccessibleName(
    /the whole circle, 100.0 percent/,
  )
  await expect(page.locator('.clock-borrowed .year-dial')).toHaveAccessibleName(
    /one of 100 years, 1.0 percent/,
  )
  await expect
    .poll(async () =>
      parseFloat(
        (await page.locator('.clock-borrowed .dial-year').getAttribute('stroke-dasharray'))!,
      ),
    )
    .toBeCloseTo(0.005)
  await page.locator('#year-progress').fill('12')
  await page.locator('#borrowed-age').fill('1')
  await expect(page.locator('.year-share')).toHaveText(['One whole year.', 'One whole year.'])
  await expect(page.locator('.clock-summary')).toContainText('12 months held in place')
})

test('the final play invitation draws attention once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.addInitScript(() => {
    document.addEventListener('animationstart', (event) => {
      if (event.animationName === 'invite-year')
        document.documentElement.dataset.yearInvitations = String(
          Number(document.documentElement.dataset.yearInvitations || '0') + 1,
        )
    })
  })
  await page.goto('/')
  // Touching non-interactive paper while scrolling should not consume the invitation.
  await page.locator('.weight-heading').dispatchEvent('pointerdown')
  const play = page.getByRole('button', { name: 'Watch the same year pass' })
  await play.scrollIntoViewIfNeeded()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.yearInvitations))
    .toBe('1')
  expect(
    await play.evaluate(
      (el) =>
        [...document.querySelectorAll('#weight button, #weight a, #weight input')].at(-1) === el,
    ),
  ).toBe(true)
  await expect(play).not.toHaveClass(/has-cue/)
  await page.locator('#top').scrollIntoViewIfNeeded()
  await play.scrollIntoViewIfNeeded()
  await page.waitForTimeout(700)
  expect(await page.evaluate(() => document.documentElement.dataset.yearInvitations)).toBe('1')
  await play.click()
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible()
  await expect(page.locator('.clock-play')).not.toHaveClass(/has-cue/)
})

test('the clock chapter and its final play action fit together in the viewport', async ({
  page,
  isMobile,
}) => {
  await page.setViewportSize(isMobile ? { width: 320, height: 568 } : { width: 1366, height: 768 })
  await page.goto('/#weight')
  await page.evaluate(() => document.fonts.ready)
  await page
    .locator('#weight')
    .evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
  const chapter = await page.locator('#weight').boundingBox()
  expect(chapter).not.toBeNull()
  expect(chapter!.y).toBeGreaterThanOrEqual(-1)
  expect(chapter!.y + chapter!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1)
  await expect(page.locator('.clock-play')).toBeInViewport({ ratio: 1 })
  await page.locator('#borrowed-age').fill('100')
  await page.locator('.clock-play').click()
  await expect(page.locator('.year-dial').first()).toBeInViewport({ ratio: 1 })
  await expect(page.locator('.year-dial').last()).toBeInViewport({ ratio: 1 })
  await expect(page.locator('.clock-play')).toBeInViewport({ ratio: 1 })
})

test('borrowing changes the shape of a held year without advancing it', async ({ page }) => {
  await page.goto('/#weight')
  await page.locator('#year-progress').fill('6')
  const observed = await page.evaluate(async () => {
    const input = document.querySelector<HTMLInputElement>('#borrowed-age')!
    const values: number[] = []
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    setValue.call(input, '5')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    const start = performance.now()
    await new Promise<void>((resolve) => {
      const frame = () => {
        values.push(
          parseFloat(
            document.querySelector('.clock-borrowed .dial-year')!.getAttribute('stroke-dasharray')!,
          ),
        )
        if (performance.now() - start < 850) requestAnimationFrame(frame)
        else resolve()
      }
      requestAnimationFrame(frame)
    })
    return values
  })
  expect(observed.some((value) => value > 0.011 && value < 0.095)).toBe(true)
  await expect(page.locator('#year-progress')).toHaveValue('6')
  await page.locator('#borrowed-age').fill('85')
  await page
    .getByRole('button', { name: 'Exchange clocks, keeping the same elapsed months' })
    .click()
  await expect(page.locator('#reference-age')).toHaveValue('85')
  await expect(page.locator('#borrowed-age')).toHaveValue('5')
  await expect(page.locator('#year-progress')).toHaveValue('6')
  await page.getByRole('button', { name: 'Continue the year' }).click()
  await expect
    .poll(async () => Number(await page.locator('#year-progress').inputValue()))
    .toBeGreaterThan(6)
})

test('opened ordinary moments shape a physically shorter recollection', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#memory')
  const cup = page.getByRole('button', { name: /MON A familiar cup/ })
  await cup.click()
  await cup.click()
  const widths = () =>
    page
      .locator('.memory-page')
      .evaluateAll((items) => items.map((el) => el.getBoundingClientRect().width))
  const lived = await widths()
  await page.getByRole('button', { name: 'Looking back', exact: true }).click()
  const recalled = await widths()
  expect(recalled.reduce((sum, width) => sum + width, 0)).toBeLessThan(
    lived.reduce((sum, width) => sum + width, 0) * 0.85,
  )
  expect(recalled[0]).toBeCloseTo(lived[0], 0)
  expect(recalled[3]).toBeLessThan(lived[3])
  await page.getByRole('button', { name: /THU A sudden rain/ }).click()
  await page.getByRole('button', { name: /THU A sudden rain/ }).click()
  const reopened = await widths()
  expect(reopened[0]).toBeCloseTo(lived[0], 0)
  expect(reopened[3]).toBeCloseTo(lived[3], 0)
  await expect(page.getByRole('slider', { name: 'Fold the week into memory' })).toHaveAttribute(
    'aria-valuetext',
    'Looking back, the days you opened remain unfolded',
  )
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await page.reload()
  await expect(page.locator('.memory-page.was-opened')).toHaveCount(0)
})

test('a wish can open its cross-age companion and return keyboard focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#wall')
  const wish = page.locator('#hope-open-s2')
  await wish.focus()
  await page.keyboard.press('Enter')
  const pair = page.getByRole('group', { name: 'Two imagined wishes, ages 79 and 17' })
  await expect(pair).toBeFocused()
  await expect(pair.locator('.hope-note')).toHaveCount(2)
  await expect(pair.locator('.echo-fragment')).toHaveText(['dinner', 'dinner'])
  await expect(pair.locator('.hope-age').first()).toBeInViewport({ ratio: 1 })
  await expect(pair.locator('.hope-age').last()).toBeInViewport({ ratio: 1 })
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await page.keyboard.press('Escape')
  await expect(wish).toBeFocused()
  await expect(page.locator('.echo-pair')).toHaveCount(0)
  await expect(page.locator('.hope-note')).toHaveCount(12)
  await page.getByRole('button', { name: 'Find an echo', exact: true }).click()
  await page.locator('.echo-pair').focus()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Find an echo', exact: true })).toBeFocused()
})
