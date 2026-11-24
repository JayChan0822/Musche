import { test, expect } from '@playwright/test';

async function openApp(page) {
  await page.addInitScript(() => localStorage.setItem('musche_tour_seen', '1'));
  await page.goto('/');
  await expect(page.locator('#global-loader')).toBeHidden();
}

test('Recording Info saves multiple names in each field and uses slash-separated Credits', async ({ page }) => {
  await openApp(page);
  await page.locator('#tour-view-switch').click();
  const week = page.locator('.calendar-week-view');
  await expect(week).toHaveCSS('opacity', '1');
  await week.locator('.task-block').first().dblclick();
  const openInfo = page.getByTitle('填写录音信息 (Recording Info)', { exact: true });
  await openInfo.click();

  const modal = page.getByRole('dialog', { name: 'Recording Info' });
  const studio = modal.getByLabel('Recording Studio', { exact: true });
  for (const name of ['Studio One', 'Studio Two']) {
    await studio.fill(name);
    await modal.getByRole('button', { name: `创建「${name}」`, exact: true }).click();
  }
  await modal.getByRole('button', { name: '移除 Studio Two', exact: true }).click();
  await studio.click();
  await modal.getByRole('button', { name: 'Studio Two', exact: true }).click();

  const engineer = modal.getByLabel('Recording Engineer', { exact: true });
  await engineer.fill('Engineer One / Engineer Two / engineer one');
  await engineer.press('Enter');
  await modal.getByLabel('Recording Operator', { exact: true }).fill('Operator One，Operator Two');
  await modal.getByRole('button', { name: '添加 Recording Operator', exact: true }).click();
  await modal.getByLabel('Recording Assistant', { exact: true }).fill('Assistant One / Assistant Two');
  await modal.getByRole('button', { name: '保存', exact: true }).click();
  await expect(modal).toBeHidden();

  await openInfo.click();
  for (const [field, names] of Object.entries({
    studio: ['Studio One', 'Studio Two'],
    engineer: ['Engineer One', 'Engineer Two'],
    operator: ['Operator One', 'Operator Two'],
    assistant: ['Assistant One', 'Assistant Two'],
  })) {
    await expect(modal.locator(`[data-rec-info-field="${field}"] li > span`)).toHaveText(names);
  }
  await modal.getByRole('button', { name: '取消', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '打开菜单' }).click();
  await page.getByRole('button', { name: '导出 Credit' }).click();
  const credits = page.locator('.modal-window').filter({ has: page.getByRole('heading', { name: 'Project Credits' }) }).locator('textarea');
  const text = await credits.inputValue();
  expect(text).toContain('Recording Studio：Studio One / Studio Two');
  expect(text).toContain('Recording Engineer：Engineer One / Engineer Two');
  expect(text).toContain('Recording Operator：Operator One / Operator Two');
  expect(text).toContain('Recording Assistant：Assistant One / Assistant Two');
});

test('Credit stays in view when the top-left menu exceeds a short viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 380 });
  await openApp(page);
  await page.getByRole('button', { name: '打开菜单' }).click();
  const menu = page.locator('.menu-shortcuts-dropdown');
  const credit = menu.getByRole('button', { name: '导出 Credit' });
  await expect(credit).toBeInViewport({ ratio: 1 });
  const body = menu.locator('.menu-shortcuts-items');
  expect(await body.evaluate(el => el.scrollHeight > el.clientHeight && el.scrollTop === 0)).toBe(true);
  await credit.click();
  await expect(page.getByRole('heading', { name: 'Project Credits' })).toBeVisible();
});
