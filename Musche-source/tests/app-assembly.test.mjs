import test from 'node:test';
import assert from 'node:assert/strict';
import { createAppAssembly } from '../app/scripts/services/app-assembly.js';

const buckets = () => ({
    vue: { computed: () => {} },
    utils: { timeUtils: {} },
    services: { storageService: {} },
});

test('createAppAssembly requires its three buckets', () => {
    assert.throws(() => createAppAssembly(), {
        name: 'TypeError',
        message: 'createAppAssembly requires vue, utils, and services buckets',
    });
    assert.throws(() => createAppAssembly({ vue: {}, utils: {} }), { name: 'TypeError' });
});

test('createAppAssembly exposes empty refs/state/features/helpers buckets', () => {
    const assembly = createAppAssembly(buckets());
    assert.deepEqual(assembly.refs, {});
    assert.deepEqual(assembly.state, {});
    assert.deepEqual(assembly.features, {});
    assert.deepEqual(assembly.helpers, {});
});

test('helpers support late binding: closures created before assignment resolve at call time', () => {
    const assembly = createAppAssembly(buckets());
    // 接线模块在 helper 注册之前创建的闭包
    const action = (...args) => assembly.helpers.pushHistory(...args);
    let pushed = null;
    assembly.helpers.pushHistory = (entry) => { pushed = entry; };
    action('snapshot');
    assert.equal(pushed, 'snapshot');
});

test('features support late binding through the registry object', () => {
    const assembly = createAppAssembly(buckets());
    const callRatio = () => assembly.features.ratio.getTaskRatio('t1');
    assembly.features.ratio = { getTaskRatio: (id) => `ratio:${id}` };
    assert.equal(callRatio(), 'ratio:t1');
});
