import { test, expect } from '@playwright/test';

// 每个测试都是全新浏览器上下文（空 localStorage）：
// 应用会写入演示数据（Project A / Instrument A / Musician A + 演示曲目）。
// 新手引导是懒加载的，自动弹出的时机不可控（driver.js chunk 加载完才出现），
// 所以统一预置 musche_tour_seen 阻止自动启动；引导用例会手动点击启动按钮。
async function bootApp(page) {
    await page.addInitScript(() => localStorage.setItem('musche_tour_seen', '1'));
    await page.goto('/');
    await expect(page.locator('#global-loader')).toBeHidden({ timeout: 15_000 });
    await expect(page.locator('.driver-popover')).toBeHidden();
}

// 快速添加弹窗里选一个下拉项：点行 → 搜索 → 点选项
async function pickQuickAddOption(page, rowLabel, searchPlaceholder, optionName) {
    const modal = page.locator('.modal-overlay');
    await modal.getByText(rowLabel).locator('..').click();
    await page.locator(`input[placeholder="${searchPlaceholder}"]`).fill(optionName);
    await page.locator('.modal-overlay')
        .getByText(optionName, { exact: true })
        .filter({ visible: true })
        .first()
        .click();
    await expect(modal.getByText(optionName).filter({ visible: true }).first()).toBeVisible();
}

test('应用启动并加载演示数据', async ({ page }) => {
    await bootApp(page);
    // 头部：默认日程
    await expect(page.getByRole('button', { name: '默认录音日程' })).toBeVisible();
    // 任务池：演示任务卡片
    await expect(page.getByText('Musician A').first()).toBeVisible();
    await expect(page.getByText('1 Items')).toBeVisible();
    // 月视图：已排程的演示任务
    await expect(page.getByText(/10:00.*Musician A/).first()).toBeVisible();
});

test('快速添加任务并在刷新后保留', async ({ page }) => {
    await bootApp(page);
    await page.getByRole('button', { name: 'New Task' }).click();
    const modal = page.locator('.modal-overlay');
    await expect(modal).toBeVisible();

    await pickQuickAddOption(page, 'Project', '搜索项目...', 'Project A');
    await pickQuickAddOption(page, 'Instrument', '搜索乐器...', 'Instrument A');
    await pickQuickAddOption(page, 'Musician', '搜索人员...', 'Musician A');
    await page.locator('input[placeholder="00:00"]').fill('01:30');
    await modal.locator('button[class*="007aff"]').click();

    await expect(modal).toBeHidden();
    await expect(page.getByText('2 Items')).toBeVisible();

    // localStorage 持久化
    await page.reload();
    await expect(page.locator('#global-loader')).toBeHidden({ timeout: 15_000 });
    await page.keyboard.press('Escape');
    await expect(page.getByText('2 Items')).toBeVisible();
});

test('月视图与周视图切换', async ({ page }) => {
    await bootApp(page);
    // 默认月视图：无小时刻度
    await expect(page.getByText('14:00', { exact: true })).toBeHidden();
    await page.locator('#tour-view-switch').click();
    // 周视图：出现小时刻度（默认 10:00-22:00）
    await expect(page.getByText('14:00', { exact: true }).first()).toBeVisible();
    await page.locator('#tour-view-switch').click();
    await expect(page.getByText('14:00', { exact: true })).toBeHidden();
});

test('新手引导可手动启动并关闭', async ({ page }) => {
    await bootApp(page);
    await page.locator('button[title="新手引导"]').click();
    await expect(page.locator('.driver-popover')).toBeVisible();
    await expect(page.getByText('欢迎使用 Musche')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.driver-popover')).toBeHidden();
});
