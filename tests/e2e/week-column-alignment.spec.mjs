import { test, expect } from '@playwright/test';

test('week headers and schedule columns stay aligned throughout expand and collapse', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('musche_tour_seen', '1');
    localStorage.setItem('musche_day_width', '52');
  });
  await page.goto('/');
  await expect(page.locator('#global-loader')).toBeHidden();
  await page.locator('#tour-view-switch').click();
  await expect(page.locator('[data-week-header]')).toHaveCount(7);
  for (const action of ['展开日列', '收起日列', '展开日列', '收起日列']) {
    // Record every rendered frame, including the first frame after Vue applies the click.
    const samples = await page.evaluate(async action => {
      const button = document.querySelector(`button[aria-label="${action}"]`);
      button.click();
      const samples = [];
      const started = performance.now();
      do {
        await new Promise(requestAnimationFrame);
        samples.push([...document.querySelectorAll('[data-week-header]')].map(header => {
          const grid = document.querySelector(`[data-date-str="${header.dataset.weekHeader}"]`);
          const a = header.getBoundingClientRect(), b = grid.getBoundingClientRect();
          return Math.max(Math.abs(a.left - b.left), Math.abs(a.width - b.width));
        }));
      } while (performance.now() - started < 400);
      return samples;
    }, action);
    expect(Math.max(...samples.flat())).toBeLessThan(1);
  }
});
