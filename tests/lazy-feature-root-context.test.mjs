import assert from 'node:assert/strict';
import test from 'node:test';

import { computed, reactive, ref, shallowRef } from 'vue';

import { createAppStateFactories } from '../app/scripts/services/app-state-factories.js';
import { createAppRootContexts } from '../app/scripts/services/app-root-context-wiring.js';

// 组合根装配的其余 250 个别名与本用例无关：用自动补全的桩顶替，
// 只把 import-data / midi-manager 两条懒加载链路换成真实 state 工厂。
function createStub() {
    const cache = new Map();
    return new Proxy(() => undefined, {
        get(target, key) {
            if (typeof key === 'symbol') return Reflect.get(target, key);
            if (key === 'value') return undefined;
            if (!cache.has(key)) cache.set(key, createStub());
            return cache.get(key);
        },
        apply() {
            return undefined;
        },
    });
}

function createStubBag() {
    return new Proxy({}, {
        get(target, key) {
            if (typeof key === 'symbol') return Reflect.get(target, key);
            if (!(key in target)) target[key] = createStub();
            return target[key];
        },
        has() {
            return true;
        },
    });
}

function createImportDataFeatureDouble() {
    return {
        groupedCsvData: computed(() => [{ projectName: 'Project A', rows: [] }]),
        isAllSelected: computed(() => true),
        availableInstrumentGroups: computed(() => ['Strings']),
        midiGroupData: computed(() => [{ id: 'group-1', name: 'Strings' }]),
        currentMidiDisplayList: computed(() => [{ id: 'track-1' }]),
        filteredImportOptions: computed(() => [{ id: 'inst-1' }]),
        midiGroupExpanded: reactive(new Set(['group-1'])),
    };
}

function createMidiManagerFeatureDouble() {
    return {
        midiManagerExpandedGroups: reactive(new Set(['Strings'])),
        projectMidiList: computed(() => [{ id: 'midi-1', group: 'Strings' }]),
        projectMidiGroups: computed(() => [{ name: 'Strings', items: [] }]),
        filteredMidiGroups: computed(() => ['Strings']),
    };
}

// 复刻 app.js 的发布顺序：state 工厂产出的占位在 setup() 同步末尾就被钉进根 ctx，
// 懒加载 feature 的 onLoaded 晚于这一步，只能靠转发 computed 把真实值送进去。
function setupRootContexts() {
    const factories = createAppStateFactories({ ref, reactive, shallowRef, computed });
    const assembly = {
        refs: createStubBag(),
        state: createStubBag(),
        utils: createStubBag(),
        helpers: createStubBag(),
        features: createStubBag(),
    };

    const importDataState = factories.createRootImportDataState();
    const {
        groupedCsvData,
        availableInstrumentGroups,
        midiGroupData,
        currentMidiDisplayList,
        filteredImportOptions,
        midiGroupExpanded,
    } = importDataState;
    assembly.refs.availableInstrumentGroups = availableInstrumentGroups;
    Object.assign(assembly.helpers, {
        groupedCsvData, midiGroupData, currentMidiDisplayList, filteredImportOptions, midiGroupExpanded,
    });

    const midiManagerState = factories.createRootMidiManagerState();
    const { midiManagerExpandedGroups, projectMidiGroups, filteredMidiGroups } = midiManagerState;
    Object.assign(assembly.refs, { midiManagerExpandedGroups, projectMidiGroups });
    Object.assign(assembly.helpers, { filteredMidiGroups });

    const { appRootOverlaysShell } = createAppRootContexts({ assembly, factories });
    const importModals = appRootOverlaysShell.appMidiCsvImportModalsShell;

    return {
        assembly,
        importDataState,
        midiManagerState,
        appCsvImportModal: importModals.appCsvImportModal,
        appMidiImportModal: importModals.appMidiImportModal,
        appMidiManagerModal: importModals.appMidiManagerModal,
    };
}

test('import-data 懒加载完成后，真实派生状态必须穿透到根 ctx', () => {
    const {
        assembly, importDataState, appCsvImportModal, appMidiImportModal,
    } = setupRootContexts();

    assert.deepEqual(appCsvImportModal.groupedCsvData, [], '加载前 CSV 导入表应为空态');
    assert.deepEqual(appMidiImportModal.midiGroupData, [], '加载前 MIDI 分组树应为空态');
    assert.equal(appMidiImportModal.midiGroupExpanded.has('group-1'), false, '加载前不应有展开分组');

    // 等价于 app.js 里 wireImportDataFeature 的 onLoaded 回填
    importDataState.importDataFeatureRef.value = createImportDataFeatureDouble();

    assert.deepEqual(
        appCsvImportModal.groupedCsvData,
        [{ projectName: 'Project A', rows: [] }],
        'CSV 导入弹窗必须读到懒加载后的真实分组数据',
    );
    assert.deepEqual(
        appMidiImportModal.midiGroupData,
        [{ id: 'group-1', name: 'Strings' }],
        'MIDI 导入弹窗必须读到懒加载后的真实分组树',
    );
    assert.deepEqual(
        appMidiImportModal.availableInstrumentGroups,
        ['Strings'],
        'MIDI 导入弹窗必须读到懒加载后的乐器组列表',
    );
    assert.deepEqual(
        appMidiImportModal.filteredImportOptions,
        [{ id: 'inst-1' }],
        'MIDI 导入弹窗的乐器下拉必须读到懒加载后的候选项',
    );
    assert.deepEqual(
        appMidiImportModal.currentMidiDisplayList,
        [{ id: 'track-1' }],
        'MIDI 导入弹窗必须读到懒加载后的当前展示列表',
    );
    assert.equal(
        appMidiImportModal.midiGroupExpanded.has('group-1'),
        true,
        'MIDI 导入弹窗的分组展开状态必须转发到懒加载后的集合',
    );
    assert.deepEqual(
        assembly.refs.availableInstrumentGroups.value,
        ['Strings'],
        'assembly.refs 上发布的乐器组必须同样是转发引用（供 midi-manager 延迟取值）',
    );
});

test('midi-manager 懒加载完成后，真实派生状态必须穿透到根 ctx', () => {
    const { assembly, midiManagerState, appMidiManagerModal } = setupRootContexts();

    assert.deepEqual(appMidiManagerModal.projectMidiGroups, [], '加载前 MIDI 管理器分组应为空态');
    assert.equal(appMidiManagerModal.midiManagerExpandedGroups.has('Strings'), false, '加载前不应有展开分组');

    // 等价于 app.js 里 wireMidiManagerFeature 的 onLoaded 回填
    midiManagerState.midiManagerFeatureRef.value = createMidiManagerFeatureDouble();

    assert.deepEqual(
        appMidiManagerModal.projectMidiGroups,
        [{ name: 'Strings', items: [] }],
        'MIDI 管理器必须读到懒加载后的真实分组',
    );
    assert.deepEqual(
        appMidiManagerModal.filteredMidiGroups,
        ['Strings'],
        'MIDI 管理器的分组下拉必须读到懒加载后的候选项',
    );
    assert.equal(
        appMidiManagerModal.midiManagerExpandedGroups.has('Strings'),
        true,
        'MIDI 管理器的展开状态必须转发到懒加载后的集合',
    );
    assert.deepEqual(
        midiManagerState.projectMidiList.value,
        [{ id: 'midi-1', group: 'Strings' }],
        'projectMidiList 也必须是转发引用',
    );
    assert.deepEqual(
        assembly.refs.projectMidiGroups.value,
        [{ name: 'Strings', items: [] }],
        'assembly.refs 上发布的分组必须同样是转发引用（供全局快捷键延迟取值）',
    );
    assert.equal(
        assembly.refs.midiManagerExpandedGroups.has('Strings'),
        true,
        'assembly.refs 上发布的展开集合必须同样是转发引用（供全局快捷键延迟取值）',
    );
});

test('转发占位在 feature 未加载时保持稳定的空态与可变集合语义', () => {
    const factories = createAppStateFactories({ ref, reactive, shallowRef, computed });
    const importDataState = factories.createRootImportDataState();
    const midiManagerState = factories.createRootMidiManagerState();

    assert.deepEqual(importDataState.groupedCsvData.value, []);
    assert.equal(importDataState.isAllSelected.value, false);
    assert.deepEqual(importDataState.availableInstrumentGroups.value, []);
    assert.deepEqual(midiManagerState.filteredMidiGroups.value, []);

    // 未加载时对集合的写入不应抛错
    assert.doesNotThrow(() => {
        importDataState.midiGroupExpanded.add('group-1');
        importDataState.midiGroupExpanded.delete('group-1');
        importDataState.midiGroupExpanded.clear();
        midiManagerState.midiManagerExpandedGroups.add('Strings');
        midiManagerState.midiManagerExpandedGroups.clear();
    });

    const stateA = factories.createRootImportDataState();
    const stateB = factories.createRootImportDataState();
    assert.notEqual(stateA.midiGroupExpanded, stateB.midiGroupExpanded, '每个 app 实例必须持有独立的展开集合');
});
