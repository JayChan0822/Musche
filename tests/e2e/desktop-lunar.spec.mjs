import { test, expect } from '@playwright/test';

test('电脑端分页月历、连续月历和周标题显示对应农历',async({page})=>{
    await page.clock.setFixedTime(new Date('2026-10-18T12:00:00+08:00'));
    await page.addInitScript(()=>{localStorage.setItem('musche_tour_seen','1');localStorage.setItem('theme_mode','dark');});
    await page.goto('/'); await expect(page.locator('#global-loader')).toBeHidden({timeout:20000});
    const day=page.locator('[data-month-lunar="2026-10-18"]');
    await expect(day).toHaveText('初九');
    await expect(page.locator('[data-month-lunar="2026-10-10"]')).toHaveText('九月');
    await page.screenshot({path:'/tmp/musche-desktop-lunar-month.png'});
    const scrolled=await page.locator('[data-calendar-weekdays]').count();
    await page.getByRole('button',{name:'切换月历排布'}).click();
    await expect(page.locator('[data-calendar-weekdays]')).toHaveCount(scrolled ? 0 : 1);
    await expect(day).toHaveText('初九');
    await page.locator('#tour-view-switch').click();
    await expect(page.locator('[data-week-lunar]')).toHaveCount(7);
    await expect(page.locator('[data-week-lunar="2026-10-18"]')).toHaveText('初九');
    expect(await page.locator('[data-week-lunar]').allTextContents()).not.toContain('');
    await expect(page.locator('.calendar-week-view')).toHaveCSS('opacity','1');
    await expect(page.locator('[data-week-lunar="2026-10-18"]')).toBeVisible();
    await page.screenshot({path:'/tmp/musche-desktop-lunar-week.png',animations:'disabled'});
    expect(await page.locator('#main-content').textContent()).not.toMatch(/undefined|NaN/);
});
