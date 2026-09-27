import assert from 'node:assert/strict';
import test from 'node:test';
import { createSSRApp, reactive } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { AppResourceInfoModal } from '../app/scripts/components/app-resource-info-modal.js';
import { AppResourceSidebar } from '../app/scripts/components/app-resource-sidebar.js';
import { AppMetadataLibrary } from '../app/scripts/components/app-metadata-library.js';
import { metadataAvatarColor } from '../app/scripts/utils/metadata-types.js';

function context() {
  return reactive({ currentSessionId: 'S_DEFAULT',
    settings: { musicians: [{ id: 'M', name: 'Alice', color: '#123456' }], instruments: [{ id: 'I', name: 'Erhu' }],
      projects: [{ id: 'P', name: 'Film' }], sessions: [{ id: 'S_DEFAULT', name: 'Session A' }] },
    itemPool: [{ id: 'T', name: 'Recorded Song', musicianId: 'M', instrumentId: 'I', projectId: 'P', musicDuration: '03:00',
      records: { musician: { actualDuration: '01:00:00' }, project: { actualDuration: '20:00:00' } } }],
    scheduledTasks: [{ scheduleId: 'S', templateId: 'T', musicianId: 'M', date: '2026-09-28', startTime: '10:00' }],
    newSettingsItem: { instrument: { name: '', group: '' }, musician: { name: '', group: '' }, project: { name: '', group: '' } },
  });
}

async function renderDetail(type, id, { tab = 'overview', scope = 'all', query = '', ctx = context() } = {}) {
  let state;
  const component = { ...AppResourceInfoModal, setup(props, options) {
    state = AppResourceInfoModal.setup(props, options);
    state.tab.value = tab; state.scope.value = scope; state.query.value = query;
    return state;
  } };
  const ssr = {};
  await renderToString(createSSRApp(component, { ctx, selection: { type, id } }), ssr);
  return { html: ssr.teleports.body, state, ctx };
}

for (const [type, id] of [['musician', 'M'], ['instrument', 'I'], ['project', 'P']]) {
  test(`${type} overview shows recording ratio with samples and no editing time contamination`, async () => {
    const { html } = await renderDetail(type, id);
    assert.match(html, /role="dialog" aria-modal="true"/);
    assert.match(html, /×20\.0/);
    assert.match(html, /仅 1 首有效样本/);
    assert.match(html, /01:00:00/);
    assert.doesNotMatch(html, /20:00:00/);
    for (const label of ['修改颜色', '分类统计', '历史曲目', '全部历史', '当前日程', '单曲倍率中位数', '休息']) assert.ok(html.includes(label));
  });
}

test('history search, scope and status filters use the shared reactive data', async () => {
  const { state, ctx } = await renderDetail('musician', 'M', { tab: 'history' });
  assert.equal(state.historyRows.value[0].name, 'Recorded Song');
  state.query.value = 'no match'; assert.equal(state.historyRows.value.length, 0);
  state.query.value = 'erhu'; assert.equal(state.historyRows.value.length, 1);
  state.status.value = 'pending'; assert.equal(state.historyRows.value.length, 0);
  state.status.value = 'all'; state.query.value = '';
  ctx.itemPool.push({ ...ctx.itemPool[0], id: 'T2', sessionId: 'OTHER' });
  assert.equal(state.data.value.summary.trackCount, 2);
  state.scope.value = 'current'; assert.equal(state.data.value.summary.trackCount, 1);
});

test('breakdown and history tabs render names, durations, dates and sample counts', async () => {
  const breakdown = await renderDetail('musician', 'M', { tab: 'breakdown' });
  assert.match(breakdown.html, /按乐器统计/);
  assert.match(breakdown.html, /按项目统计/);
  assert.match(breakdown.html, /1 首 \/ 1 段/);
  const history = await renderDetail('musician', 'M', { tab: 'history' });
  for (const label of ['Recorded Song', 'Film', 'Erhu', '2026-09-28', '已录制']) assert.ok(history.html.includes(label));
});

test('empty and deleted entities render safely with no invented ratio', async () => {
  const ctx = context(); ctx.itemPool = []; ctx.settings.musicians = [];
  const { html } = await renderDetail('musician', 'M', { ctx });
  assert.match(html, /条目已删除/);
  assert.match(html, /暂无关联曲目/);
  assert.doesNotMatch(html, /×20|×NaN|Infinity/);
});

test('avatar selects the matching entity details instead of opening color editing', async () => {
  let state;
  const component = { ...AppResourceSidebar, setup(props) { state = AppResourceSidebar.setup(props); return state; } };
  await renderToString(createSSRApp(component, { ctx: context(), open: true }));
  state.selectType('musician'); state.openInfo({ id: 'M' });
  assert.deepEqual(state.infoSelection.value, { type: 'musician', id: 'M' });
  assert.match(AppResourceSidebar.template, /@click="openInfo\(item\)"/);
  assert.doesNotMatch(AppResourceSidebar.template, /@click="ctx.openColorPicker/);
});

for (const [type, label, icon] of [['studio', '录音棚', 'fa-building'], ['engineer', '工程师', 'fa-sliders'], ['operator', '操作员', 'fa-headphones'], ['assistant', '助理', 'fa-user-group']]) {
  test(`${label} avatars and details use the shared layout and associated recording history`, async () => {
    const ctx = context();
    ctx.settings[`${type}s`] = [{ id: 'META', name: 'Team A' }];
    ctx.scheduledTasks[0].recordingInfo = { [type]: 'Team A' };
    ctx.newRecInputs = { studio: '', engineer: '', operator: '', assistant: '' };
    const listing = await renderToString(createSSRApp(AppMetadataLibrary, { ctx }));
    assert.match(listing, /查看Team A详情/);
    assert.ok(listing.includes(metadataAvatarColor(ctx.settings[`${type}s`][0], type)));
    const { html, state } = await renderDetail(type, 'META', { ctx });
    assert.ok(html.includes(label));
    assert.ok(html.includes(icon));
    assert.match(html, /关联录音倍率/);
    assert.match(html, /×20\.0/);
    assert.match(html, /Recorded Song/);
    assert.equal(state.data.value.breakdowns.length, 3);
    ctx.settings[`${type}s`][0].color = '#112233';
    assert.equal(state.avatarColor.value, '#112233');
  });
}

test('overview has a compact summary and recent recordings while trend stays in breakdown', async () => {
  const { html } = await renderDetail('musician', 'M');
  assert.match(html, /录音汇总/);
  assert.match(html, /最近录音/);
  assert.match(html, /<dl /);
  assert.match(html, /<details /);
  assert.doesNotMatch(html, /月度录制倍率|常合作对象 \/ 录音耗时分布|bg-blue-500\/5/);
  const breakdown = await renderDetail('musician', 'M', { tab: 'breakdown' });
  assert.match(breakdown.html, /月度录制倍率/);
});
