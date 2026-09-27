import assert from 'node:assert/strict';
import test from 'node:test';
import { createSSRApp, h, reactive } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { AppResourceSidebar } from '../app/scripts/components/app-resource-sidebar.js';
import { AppSettingsModal } from '../app/scripts/components/app-settings-modal.js';
import { createRootShellState } from '../app/scripts/state/root-shell-state.js';

const ctx = () => reactive({
  settings: { instruments: [{ id: 'I', name: 'Guzheng', group: 'Plucks', color: '#123456' }], musicians: [], projects: [] },
  newSettingsItem: { instrument: { name: '', group: '' }, musician: { name: '', group: '' }, project: { name: '', group: '' } },
});

test('right library renders three primary tabs and a secondary Metadata entry', async () => {
  const html = await renderToString(createSSRApp({ render: () => h(AppResourceSidebar, { ctx: ctx(), open: true }) }));
  assert.match(html, /role="complementary"/);
  assert.equal((html.match(/role="tab"/g) || []).length, 3);
  assert.match(html, /Metadata/);
  assert.match(html, /搜索乐器/);
  assert.match(html, /Guzheng/);
  assert.doesNotMatch(html, /aria-label="所属分组"/);
  assert.match(html, /修改Guzheng分组/);
  assert.match(html, /新增乐器/);
  assert.match(html, /删除Guzheng/);
  assert.match(html, /查看Guzheng详情/);
  assert.doesNotMatch(html, /修改Guzheng颜色/);
  assert.doesNotMatch(html, /项目信息/);
});

test('small-screen library exposes a dismissible dialog and hidden library renders no controls', async () => {
  const html = await renderToString(createSSRApp(AppResourceSidebar, { ctx: ctx(), open: true, overlay: true }));
  assert.match(html, /role="dialog" aria-modal="true"/);
  assert.match(html, /关闭资料库遮罩/);
  const closed = await renderToString(createSSRApp(AppResourceSidebar, { ctx: ctx(), open: false }));
  assert.doesNotMatch(closed, /<aside|<input|<button/);
});

test('root exposes the same settings context while preferences no longer render resource lists', () => {
  const library = ctx();
  const { appRootShell } = createRootShellState({ reactive, appResourceLibrary: library });
  assert.equal(appRootShell.appResourceLibrary, library);
  assert.doesNotMatch(AppSettingsModal.template, /allSettingsGrouped|removeSettingsItem|addSettingsItem/);
  assert.match(AppSettingsModal.template, /settings.startHour/);
  assert.doesNotMatch(AppSettingsModal.template, /showMetadataManager|Edit MetaData/);
});

test('metadata tab displays shared studio and personnel collections with edit actions', async () => {
  const context = ctx();
  Object.assign(context.settings, {
    studios: [{ id: 'S', name: 'Studio A' }], engineers: [{ id: 'E', name: 'Engineer B' }],
    operators: [], assistants: [],
  });
  context.newRecInputs = { studio: '', engineer: '', operator: '', assistant: '' };
  const component = { ...AppResourceSidebar, setup(props) {
    const result = AppResourceSidebar.setup(props);
    result.selectType('metadata');
    return result;
  } };
  const html = await renderToString(createSSRApp(component, { ctx: context, open: true }));
  for (const text of ['录音棚', '工程师', '操作员', '助理', 'Studio A', 'Engineer B']) assert.ok(html.includes(text));
  assert.match(html, /返回资料库/);
  assert.doesNotMatch(html, /role="tablist"/);
  assert.match(html, /新增录音棚/);
  assert.match(html, /删除Studio A/);
  assert.doesNotMatch(html, /Guzheng|清空|新条目分组/);
});

for (const type of ['musician', 'project']) {
  test(`${type} tab renders its own fields and actions`, async () => {
    const context = ctx();
    context.settings[`${type}s`].push({ id: 'ROW', name: 'Test entry', defaultRatio: 25 });
    const component = { ...AppResourceSidebar, setup(props) {
      const result = AppResourceSidebar.setup(props);
      result.selectType(type);
      return result;
    } };
    const html = await renderToString(createSSRApp(component, { ctx: context, open: true }));
    assert.match(html, /Test entry/);
    assert.doesNotMatch(html, /Guzheng/);
    if (type === 'project') {
      assert.match(html, /MIDI 管理/);
      assert.match(html, /项目信息/);
      assert.doesNotMatch(html, /aria-label="默认倍数"/);
    } else {
      assert.doesNotMatch(html, /aria-label="默认倍数"|默认 ×/);
      assert.doesNotMatch(html, /MIDI 管理/);
    }
  });
}
