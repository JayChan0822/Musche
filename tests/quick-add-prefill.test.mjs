import assert from 'node:assert/strict';
import test from 'node:test';
import { reactive, ref } from 'vue';
import { registerQuickAddFeature } from '../app/scripts/features/quick-add.js';

for (const type of ['project', 'instrument', 'musician']) {
  test(`${type} creation prefills the search text and saves the editable name`, (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const refs = { quickAddType: ref(''), quickAddForm: reactive({ name: 'Old', group: 'Old' }),
      showQuickAddModal: ref(false), activeDropdown: ref(type) };
    const settings = { projects: [], instruments: [], musicians: [] };
    const newItem = {};
    const feature = registerQuickAddFeature({ refs, state: { settings, newItem },
      utils: { getExistingGroups: () => [], generateUniqueId: () => 'NEW', generateRandomHexColor: () => '#123456' },
      actions: { focusElementById() {}, pushHistory() {}, openAlertModal: () => assert.fail('unexpected alert') },
    });
    feature.openQuickAdd(type, '  新名称 Piano  ');
    assert.equal(refs.quickAddForm.name, '新名称 Piano');
    assert.equal(refs.quickAddForm.group, '');
    assert.equal(refs.showQuickAddModal.value, true);
    refs.quickAddForm.name += ' 2';
    feature.confirmQuickAdd();
    assert.equal(settings[`${type}s`][0].name, '新名称 Piano 2');
    assert.equal(newItem[`${type}Id`], 'NEW');
    feature.openQuickAdd(type);
    assert.equal(refs.quickAddForm.name, '', 'empty search never reuses the previous name');
  });
}
