import assert from 'node:assert/strict';
import test from 'node:test';
import { reactive } from 'vue';
import { createResourceLibrary } from '../app/scripts/features/resource-library.js';

function harness() {
  let saves = 0;
  const ctx = reactive({
    settings: { instruments: [{ id: 'I', name: 'Guzheng', group: 'Plucks' }, { id: 'I2', name: 'Flute', group: 'Winds' }],
      musicians: [{ id: 'M', name: '张三', group: '', defaultRatio: 20 }], projects: [] },
    newSettingsItem: { instrument: { name: '', group: '' }, musician: { name: '', group: '' }, project: { name: '', group: '' } },
    pushHistory: () => saves++,
    async addSettingsItem(type) {
      const form = ctx.newSettingsItem[type];
      ctx.settings[`${type}s`].push({ id: 'NEW', name: form.name.trim(), group: form.group.trim() });
      form.name = ''; saves++;
    },
  });
  return { ctx, feature: createResourceLibrary(ctx), saves: () => saves };
}

test('library tabs search independently by name and group using shared settings', () => {
  const { feature: f, ctx } = harness();
  assert.equal(f.activeType.value, 'instrument');
  assert.equal(f.totalCount.value, 2);
  f.search.value = 'PLUCKS';
  assert.equal(f.groups.value[0].items[0].id, 'I');
  f.selectType('musician');
  assert.equal(f.search.value, '');
  assert.equal(f.groups.value[0].items[0], ctx.settings.musicians[0]);
  f.selectType('instrument');
  assert.equal(f.search.value, 'PLUCKS');
  f.search.value = 'missing';
  assert.equal(f.groups.value.length, 0);
});

test('library group expansion and inline creation preserve all existing entries', async () => {
  const { feature: f, ctx } = harness();
  assert.equal(f.isExpanded('Plucks'), false);
  f.toggleGroup('Plucks');
  assert.equal(f.isExpanded('Plucks'), true);
  f.toggleGroup('Plucks');
  assert.equal(f.isExpanded('Plucks'), false);
  f.search.value = 'new instrument';
  f.beginCreate();
  assert.equal(f.form.value.name, 'new instrument');
  f.form.value.group = 'Plucks';
  await f.saveNew();
  assert.equal(ctx.settings.instruments.length, 3);
  assert.equal(f.search.value, '');
  assert.equal(f.isExpanded('Plucks'), true);
  assert.equal(f.creating.value, false);
});

test('groups start collapsed in every tab and search only temporarily expands matches', () => {
  const { feature: f } = harness();
  assert.equal(f.allExpanded.value, false);
  f.search.value = 'guzheng';
  assert.equal(f.isExpanded('Plucks'), true);
  f.search.value = '';
  assert.equal(f.isExpanded('Plucks'), false);
  f.toggleAll();
  assert.equal(f.isExpanded('Plucks'), true);
  assert.equal(f.isExpanded('Winds'), true);
  f.toggleAll();
  assert.equal(f.isExpanded('Winds'), false);
  f.selectType('musician');
  assert.equal(f.isExpanded(''), false);
});

test('group edits share data with task pickers and save once', () => {
  const h = harness();
  h.feature.updateGroup(h.ctx.settings.instruments[0], '  New group  ');
  assert.equal(h.ctx.settings.instruments[0].group, 'New group');
  assert.equal(h.saves(), 1);
  h.feature.updateGroup(h.ctx.settings.instruments[0], 'New group');
  assert.equal(h.saves(), 1);
});

test('Metadata is secondary and back restores the selected resource and search', () => {
  const { feature: f } = harness();
  f.selectType('musician'); f.search.value = '张三';
  f.selectType('metadata');
  assert.equal(f.activeType.value, 'metadata');
  assert.equal(f.resourceTabs.length, 3);
  f.returnToLibrary();
  assert.equal(f.activeType.value, 'musician');
  assert.equal(f.search.value, '张三');
});
