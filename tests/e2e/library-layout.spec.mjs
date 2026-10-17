import { test, expect } from '@playwright/test';

for (const viewport of [{ width: 1400, height: 900 }, { width: 320, height: 568 }, { width: 667, height: 375 }]) {
  test(`library controls fit at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => localStorage.setItem('musche_tour_seen', '1'));
    await page.goto('/');
    await expect(page.locator('#global-loader')).toBeHidden();
    // The desktop trigger can be hidden on mobile; open via the same button handler.
    await page.locator('#library-toggle').evaluate(button => button.click());
    const panel = page.getByRole('dialog', { name: '资料库', exact: true });
    await expect(panel).toBeVisible();
    await panel.getByRole('tab', { name: '人员', exact: true }).click();
    await panel.getByRole('button', { name: '全部展开', exact: true }).click();
    const role = panel.locator('.library-role-select').first();
    await expect(role).toBeVisible();
    const longName = '【SPO Brass】夏非 Fei Xia 长名称布局检查';
    const personName = panel.getByRole('textbox', { name: '人员名称', exact: true }).first();
    await personName.fill(longName);
    await personName.press('Tab');
    await expect(personName).toHaveAttribute('title', longName);
    for (const value of ['musician', 'editor', 'both']) {
      await role.selectOption(value);
      await expect(role).toHaveValue(value);
    }
    await page.locator('html').evaluate(element => element.classList.add('dark'));
    const metrics = await role.evaluate(element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const row = element.closest('.library-item-grid');
      const name = row.querySelector('input').getBoundingClientRect();
      return { textHeight: element.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom), fontSize: parseFloat(style.fontSize), top: rect.top, nameBottom: name.bottom, nameWidth: name.width, overflow: row.scrollWidth - row.clientWidth };
    });
    expect(metrics.textHeight).toBeGreaterThanOrEqual(metrics.fontSize + 2);
    expect(metrics.top).toBeGreaterThanOrEqual(metrics.nameBottom);
    expect(metrics.nameWidth).toBeGreaterThan(100);
    expect(metrics.overflow).toBeLessThanOrEqual(1);
    await role.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(panel.getByRole('button', { name: /修改.*分组/ }).first()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(role).toBeFocused();
    await panel.getByRole('button', { name: '新增人员', exact: true }).click();
    const add = panel.getByRole('button', { name: '添加', exact: true });
    await add.scrollIntoViewIfNeeded();
    await expect(add).toBeInViewport();
    expect(await panel.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `test-results/library-${viewport.width}.png` });
    await panel.getByRole('button', { name: '取消新增', exact: true }).click();
    await panel.getByRole('tab', { name: '项目', exact: true }).click();
    await panel.getByRole('button', { name: '全部展开', exact: true }).click();
    const projectRow = panel.locator('.library-item-grid').first();
    const projectMetrics = await projectRow.evaluate(element => {
      const name = element.querySelector('input').getBoundingClientRect();
      const actions = element.querySelector('.library-project-actions').getBoundingClientRect();
      return { nameWidth: name.width, nameBottom: name.bottom, actionsTop: actions.top, overflow: element.scrollWidth - element.clientWidth };
    });
    expect(projectMetrics.nameWidth).toBeGreaterThan(100);
    expect(projectMetrics.actionsTop).toBeGreaterThanOrEqual(projectMetrics.nameBottom);
    expect(projectMetrics.overflow).toBeLessThanOrEqual(1);
    await projectRow.getByRole('button', { name: /查看.*详情/ }).click();
    const stage = page.getByRole('combobox', { name: '工作阶段', exact: true });
    await expect(stage).toBeVisible();
    const stageMetrics = await stage.evaluate(element => {
      const style = getComputedStyle(element);
      return { available: element.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom), line: parseFloat(style.fontSize) + 2 };
    });
    expect(stageMetrics.available).toBeGreaterThanOrEqual(stageMetrics.line);
    await stage.selectOption('edit');
    await expect(stage).toHaveValue('edit');
  });
}
