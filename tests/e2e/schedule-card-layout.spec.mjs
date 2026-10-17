import { test, expect } from '@playwright/test';

test('schedule cards adapt to their own width and height without clipping visible text', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('musche_tour_seen', '1'));
  await page.goto('/');
  await expect(page.locator('#global-loader')).toBeHidden();
  await page.locator('#tour-view-switch').click();
  const card = page.locator('.calendar-week-view .task-block').first();
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('title', /Musician A.*10:00/);
  for (const size of [
    { width: 220, height: 90, duration: true, time: true },
    { width: 220, height: 44, duration: false, time: true },
    { width: 220, height: 28, duration: false, time: true },
    { width: 85, height: 90, duration: false, time: true },
    { width: 85, height: 28, duration: false, time: false },
    { width: 220, height: 20, duration: false, time: false, marker: true },
  ]) {
    await card.evaluate((element, size) => {
      element.style.width = `${size.width}px`;
      element.style.height = `${size.height}px`;
      element.querySelector('.schedule-block-title').textContent = '钱军 Jun Qian 很长的姓名';
    }, size);
    const title = card.locator('.schedule-block-title');
    await expect(title).toBeVisible({ visible: !size.marker });
    await expect(card.locator('.schedule-block-duration')).toBeVisible({ visible: size.duration });
    await expect(card.locator('.schedule-block-start')).toBeVisible({ visible: size.time });
    const layout = await card.evaluate(element => {
      const content = element.querySelector('.schedule-block-content').getBoundingClientRect();
      return [...element.querySelectorAll('.schedule-block-title, .schedule-block-start, .schedule-block-duration')]
        .filter(child => child.getClientRects().length)
        .map(child => {
          const rect = child.getBoundingClientRect();
          return { fits: rect.top >= content.top - 1 && rect.bottom <= content.bottom + 1 && rect.right <= content.right + 1, textFitsHeight: child.clientHeight >= parseFloat(getComputedStyle(child).lineHeight) };
        });
    });
    expect(layout.every(item => item.fits && item.textFitsHeight), JSON.stringify(size)).toBe(true);
  }
  await page.screenshot({ path: 'test-results/schedule-card-compact.png' });
});
