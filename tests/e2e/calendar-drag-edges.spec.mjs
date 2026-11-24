import { test, expect } from '@playwright/test';

test('dragging a schedule scrolls the week and can be dropped after paging', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('musche_tour_seen', '1'));
  await page.goto('/');
  await expect(page.locator('#global-loader')).toBeHidden();
  await page.locator('#tour-view-switch').click();
  const week = page.locator('.calendar-week-view');
  await expect(week).toHaveCSS('opacity', '1');
  const activeWeek = week.locator('[data-week-page]:not([inert])');
  const header = activeWeek.locator('[data-week-header]').first();
  const originalWeek = await header.getAttribute('data-week-header');
  const card = week.locator('.task-block').first();
  await card.scrollIntoViewIfNeeded();
  const label = await card.locator('.schedule-block-title').innerText();
  const duration = await card.locator('.schedule-block-duration').innerText();
  const box = await card.boundingBox();
  const bounds = await week.boundingBox();
  const scrollTop = () => week.evaluate(el => el.scrollTop);
  const before = await scrollTop();
  await page.mouse.move(box.x + box.width / 2, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height - 8);
  await expect.poll(scrollTop).toBeGreaterThan(before + 20);
  await page.mouse.move(bounds.x + bounds.width - 8, bounds.y + bounds.height / 2);
  await expect(header).not.toHaveAttribute('data-week-header', originalWeek);
  const target = activeWeek.locator('[data-week-header]').nth(3);
  const targetDate = await target.getAttribute('data-week-header');
  const x = await target.evaluate(el => {
    const scroller = el.closest('.calendar-week-view');
    const ruler = scroller.querySelector('[data-week-ruler]');
    return ruler.getBoundingClientRect().right - scroller.scrollLeft + el.offsetLeft + el.offsetWidth / 2;
  });
  await page.mouse.move(x, bounds.y + bounds.height / 2);
  await page.mouse.up();
  const moved = week.locator(`[data-date-str="${targetDate}"] .task-block`)
    .filter({ has: page.getByText(label, { exact: true }) });
  await expect(moved.locator('.schedule-block-duration')).toHaveText(duration);
});

for (const paged of [false, true]) {
  test(`dragging a schedule scrolls and pages the desktop month before drop (${paged ? 'paged' : 'continuous'})`, async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-16T12:00:00'));
    await page.addInitScript(() => localStorage.setItem('musche_tour_seen', '1'));
    await page.goto('/');
    await expect(page.locator('#global-loader')).toBeHidden();
    if (paged) await page.getByRole('button', { name: '切换月历排布' }).click();
    const month = page.locator('[data-calendar-scroller]');
    await expect(month.locator('[data-calendar-weekdays]')).toHaveCount(paged ? 0 : 1);
    const card = month.locator('[data-date="2026-10-16"] [data-month-schedule]').first();
    await card.scrollIntoViewIfNeeded();
    await month.evaluate(el => { el.scrollTop = Math.min(el.scrollTop, Math.max(0, el.scrollHeight - el.clientHeight - 90)); });
    const title = await card.locator('.font-bold').innerText();
    const time = await card.locator('.font-mono').innerText();
    const cardBox = await card.boundingBox();
    const bounds = await month.boundingBox();
    const scrollTop = () => month.evaluate(el => el.scrollTop);
    const before = await scrollTop();
    await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height - 6, { steps: 5 });
    await page.mouse.move(bounds.x + bounds.width / 2 + 1, bounds.y + bounds.height - 6);
    await expect.poll(scrollTop).toBeGreaterThan(before + 10);
    const middle = bounds.y + bounds.height / 2;
    await page.mouse.move(bounds.x + bounds.width - 6, middle);
    await page.mouse.move(bounds.x + bounds.width - 5, middle);
    await expect(page.locator('.mobile-header-nav')).toContainText('2026年 11月');
    const center = bounds.x + bounds.width / 2;
    await page.mouse.move(center, middle);
    if (paged) await expect(month.locator('[data-date="2026-10-16"]')).toHaveCount(0);
    const targetAtPointer = () => page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('[data-date]')?.dataset.date,
      { x: center, y: middle });
    await expect.poll(targetAtPointer).toMatch(/^2026-11-/);
    const targetDate = await targetAtPointer();
    await page.mouse.move(center + 1, middle);
    await page.mouse.up();
    const moved = month.locator(`[data-date="${targetDate}"] [data-month-schedule]`)
      .filter({ has: page.getByText(title, { exact: true }) });
    await expect(moved.locator('.font-mono')).toHaveText(time);
  });
}
