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

test('drawer and modal visibly overshoot and settle', async ({ page }) => {
  await openCalendar(page);
  const scales = await page.evaluate(async () => {
    document.querySelector('#library-toggle').click();
    const samples = [];
    const start = performance.now();
    while (performance.now() - start < 850) {
      await new Promise(requestAnimationFrame);
      const panel = document.querySelector('#resource-library');
      if (panel) samples.push(new DOMMatrix(getComputedStyle(panel).transform).a);
    }
    return samples;
  });
  expect(Math.max(...scales)).toBeGreaterThan(1.005);
  expect(scales.at(-1)).toBeCloseTo(1, 3);
  await page.locator('#resource-library').press('Escape');
  await expect(page.locator('#resource-library')).toHaveCount(0);
  const modalScales = await page.evaluate(async () => {
    document.querySelector('#tour-new-task').click();
    const samples = [];
    const start = performance.now();
    while (performance.now() - start < 750) {
      await new Promise(requestAnimationFrame);
      const modal = document.querySelector('.modal-window');
      if (modal) samples.push(new DOMMatrix(getComputedStyle(modal).transform).a);
    }
    return samples;
  });
  expect(Math.max(...modalScales)).toBeGreaterThan(1.001);
  expect(modalScales.at(-1)).toBeCloseTo(1, 3);
});

test('reopening a closing drawer continues its position instead of restarting offscreen', async ({ page }) => {
  await openCalendar(page);
  await page.locator('#library-toggle').click();
  await expect(page.locator('#resource-library')).toHaveCSS('transform', 'none');
  const positions = await page.evaluate(async () => {
    const toggle = document.querySelector('#library-toggle');
    toggle.click();
    for (let i = 0; i < 3; i++) await new Promise(requestAnimationFrame);
    const before = new DOMMatrix(getComputedStyle(document.querySelector('#resource-library')).transform).m41;
    toggle.click();
    await new Promise(requestAnimationFrame);
    const after = new DOMMatrix(getComputedStyle(document.querySelector('#resource-library')).transform).m41;
    return { before, after };
  });
  expect(Math.abs(positions.after - positions.before)).toBeLessThan(80);
  await expect(page.locator('#resource-library')).toHaveCSS('transform', 'none');
});
