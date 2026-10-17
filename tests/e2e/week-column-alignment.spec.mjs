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
      const before = document.querySelector('[data-week-header]').getBoundingClientRect().width;
      button.click();
      const samples = [];
      const widths = [];
      const started = performance.now();
      do {
        await new Promise(requestAnimationFrame);
        widths.push(document.querySelector('[data-week-header]').getBoundingClientRect().width);
        samples.push([...document.querySelectorAll('[data-week-header]')].map(header => {
          const grid = document.querySelector(`[data-date-str="${header.dataset.weekHeader}"]`);
          const a = header.getBoundingClientRect(), b = grid.getBoundingClientRect();
          return Math.max(Math.abs(a.left - b.left), Math.abs(a.width - b.width));
        }));
      } while (performance.now() - started < 400);
      return { frames: samples, before, widths };
    }, action);
    expect(Math.max(...samples.frames.flat())).toBeLessThan(1);
    const after = samples.widths.at(-1);
    expect(Math.abs(after - samples.before)).toBeGreaterThan(20);
    // At least one frame must have an intermediate width: instant resizing cannot pass.
    expect(samples.widths.some(width => width > Math.min(samples.before, after) + 1 && width < Math.max(samples.before, after) - 1)).toBe(true);
  }
});
