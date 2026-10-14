import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test('手机日历跟手翻日、保持小时位置、隔离后台月份导航', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => localStorage.setItem('musche_tour_seen', '1'));
    await page.goto('/');
    await expect(page.locator('#global-loader')).toBeHidden();
    await page.getByRole('button', { name: '日程表', exact: true }).click();
    const date = await page.evaluate(() => {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        return `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
    });
    await page.locator(`[data-calendar-scroller] [data-date="${date}"]`).click();
    const day = page.locator('[data-mobile-day-view]');
    await expect(day).toBeVisible();
    await expect(day.locator('[aria-pressed="true"]')).toHaveAttribute('aria-label', date);
    await page.waitForTimeout(650);
    const monthLabel = await page.locator('.mobile-header-nav').innerText();
    await day.locator('.day-timeline').evaluate(el => { el.scrollTop = 250; });
    const scrollBefore = await day.locator('.day-timeline').evaluate(el => el.scrollTop);
    const slot = day.locator('[data-date-str] .grid-slot').first();
    await slot.dispatchEvent('touchstart', { touches: [{ identifier: 1, clientX: 300, clientY: 400 }] });
    await slot.dispatchEvent('touchmove', { touches: [{ identifier: 1, clientX: 170, clientY: 403 }] });
    await expect(day.locator('.day-pager-track')).toHaveAttribute('style', /-\s*130px/);
    await slot.dispatchEvent('touchend', { changedTouches: [{ identifier: 1, clientX: 170, clientY: 403 }], touches: [] });
    const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + 1);
    const nextDate = `${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}-${String(next.getDate()).padStart(2,'0')}`;
    await expect(day.locator('[aria-pressed="true"]')).toHaveAttribute('aria-label', nextDate);
    expect(await day.locator('.day-timeline').evaluate(el => el.scrollTop)).toBe(scrollBefore);
    expect(await page.locator('.mobile-header-nav').innerText()).toBe(monthLabel);
    expect(await day.locator('[inert]').count()).toBe(2);
    await day.locator('.day-timeline').evaluate(el => { el.scrollTop = 0; });
    await page.waitForTimeout(300);
    await page.screenshot({ path: '/tmp/musche-mobile-day.png' });
    await day.getByRole('button', { name: '返回月视图' }).click();
    await expect(day).toBeHidden();
    const number = page.locator(`[data-date="${nextDate}"] [data-month-day-number]`);
    await expect(number).toHaveCSS('font-size', '17px');
    await expect(page.locator(`[data-date="${nextDate}"] > div:last-child > div`).first()).toHaveCSS('height', '5px');
    await page.screenshot({ path: '/tmp/musche-mobile-month.png' });
    expect(errors).toEqual([]);
});
