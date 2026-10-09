import { test, expect } from '@playwright/test';

// 复现：点击日程块选中后按 Backspace，日程应被删除
test('backspace 删除选中的日程块', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('musche_tour_seen', '1'));
    await page.goto('/');
    await expect(page.locator('#global-loader')).toBeHidden({ timeout: 15_000 });
    await expect(page.getByText(/10:00.*Musician A/).first()).toBeVisible();

    // 记录控制台错误
    const errors = [];
    page.on('pageerror', (err) => errors.push(String(err)));

    // 点击日程块选中
    const block = page.getByText(/10:00.*Musician A/).first();
    await block.click();
    await page.waitForTimeout(300);

    // 按 Backspace
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(800);

    if (errors.length) console.log('PAGE ERRORS:', errors);
    // 日程块应消失
    await expect(page.getByText(/10:00.*Musician A/)).toHaveCount(0, { timeout: 5_000 });
});
