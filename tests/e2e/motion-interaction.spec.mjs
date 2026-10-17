import { test, expect } from '@playwright/test';

async function openCalendar(page) {
  await page.addInitScript(() => localStorage.setItem('musche_tour_seen', '1'));
  await page.goto('/');
  await expect(page.locator('#global-loader')).toBeHidden();
}

test('month/week transitions mount immediately and settle after rapid reversal', async ({ page }) => {
  await openCalendar(page);
  const initialCells = page.locator('.calendar-month-view [data-date]');
  expect(await initialCells.first().evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
  await page.evaluate(async () => {
    document.querySelector('#tour-view-switch').click();
    await new Promise(requestAnimationFrame);
  });
  await expect(page.locator('.calendar-week-view')).toHaveCount(1);
  // Reverse while the outgoing month is still present.
  await page.locator('#tour-view-switch').click();
  await expect(page.locator('.calendar-month-view')).toHaveCount(1);
  await expect(page.locator('.calendar-week-view')).toHaveCount(0);
  await expect(page.locator('.calendar-month-view')).toHaveCSS('opacity', '1');
  await page.locator('#tour-view-switch').click();
  await expect(page.locator('.calendar-week-view')).toHaveCSS('opacity', '1');
  await expect(page.locator('.calendar-month-view')).toHaveCount(0);
  const slider = page.locator('.week-zoom-slider');
  await slider.evaluate(el => {
    for (const value of ['60', '90', '70']) {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await expect(slider).toHaveValue('70');
  await expect(page.locator('.calendar-week-view')).toHaveCSS('--slot-height', '70px');
  expect(await page.locator('#main-content').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
});

test('reduced motion reaches the final calendar state without a visible transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openCalendar(page);
  await page.locator('#tour-view-switch').click();
  await expect(page.locator('.calendar-week-view')).toHaveCSS('opacity', '1');
  await expect(page.locator('.calendar-month-view')).toHaveCount(0);
  const durations = await page.locator('.week-day-column').first().evaluate(el => getComputedStyle(el).transitionDuration);
  expect(durations.split(',').every(value => parseFloat(value) <= .001)).toBe(true);
});
