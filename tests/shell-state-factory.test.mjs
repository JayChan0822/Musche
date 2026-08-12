import test from 'node:test';
import assert from 'node:assert/strict';
import { defineShellState } from '../app/scripts/state/shell-state-factory.js';

const identityReactive = (value) => value;
const makeResolver = (sources) => (path) => {
    const [bucket, ...rest] = path.split('.');
    let node = sources[bucket];
    for (const seg of rest) node = node?.[seg];
    return node;
};

test('defineShellState validates its own arguments', () => {
    assert.throws(() => defineShellState('', () => ({})), {
        name: 'TypeError',
        message: 'defineShellState requires a factory name',
    });
    assert.throws(() => defineShellState('createDemoShellState'), {
        name: 'TypeError',
        message: 'defineShellState requires a dependency spec object',
    });
});

test('created factory fails clearly without Vue reactive, using the factory name', () => {
    const createDemoShellState = defineShellState('createDemoShellState', { reads: [] });
    assert.throws(() => createDemoShellState(), {
        name: 'TypeError',
        message: 'createDemoShellState requires Vue reactive factory',
    });
    assert.throws(() => createDemoShellState({ reactive: null }), {
        name: 'TypeError',
        message: 'createDemoShellState requires Vue reactive factory',
    });
});

test('created factory fails clearly without a dependency resolver', () => {
    const createDemoShellState = defineShellState('createDemoShellState', { reads: [] });
    assert.throws(() => createDemoShellState({ reactive: identityReactive }), {
        name: 'TypeError',
        message: 'createDemoShellState requires a dependency resolver',
    });
});

test('reads expose ref values through read-only getters', () => {
    const show = { value: false };
    const createDemoShellState = defineShellState('createDemoShellState', {
        reads: ['refs.show'],
    });
    const ctx = createDemoShellState({
        reactive: identityReactive,
        resolve: makeResolver({ refs: { show } }),
    });

    assert.equal(ctx.show, false);
    show.value = true;
    assert.equal(ctx.show, true);
    const descriptor = Object.getOwnPropertyDescriptor(ctx, 'show');
    assert.equal(typeof descriptor.get, 'function');
    assert.equal(descriptor.set, undefined);
});

test('models read and write the underlying ref', () => {
    const show = { value: false };
    const createDemoShellState = defineShellState('createDemoShellState', {
        models: ['refs.show'],
    });
    const ctx = createDemoShellState({
        reactive: identityReactive,
        resolve: makeResolver({ refs: { show } }),
    });

    ctx.show = true;
    assert.equal(show.value, true);
    assert.equal(ctx.show, true);
});

test('values are resolved lazily on every access', () => {
    const close = () => {};
    const state = { splitState: { ratio: 1 } };
    const createDemoShellState = defineShellState('createDemoShellState', {
        values: ['helpers.close', 'state.splitState'],
    });
    const ctx = createDemoShellState({
        reactive: identityReactive,
        resolve: makeResolver({ helpers: { close }, state }),
    });

    assert.equal(ctx.close, close);
    assert.equal(ctx.splitState.ratio, 1);
    state.splitState = { ratio: 2 };
    assert.equal(ctx.splitState.ratio, 2, 'values must re-resolve on each access');
});

test('spec entries support [ctxKey, path] renames', () => {
    const show = { value: false };
    const createDemoShellState = defineShellState('createDemoShellState', {
        reads: [['visible', 'refs.show']],
    });
    const ctx = createDemoShellState({
        reactive: identityReactive,
        resolve: makeResolver({ refs: { show } }),
    });

    assert.equal(ctx.visible, false);
});

test('reads fail clearly when a dependency is not published', () => {
    const createDemoShellState = defineShellState('createDemoShellState', {
        reads: ['refs.missing'],
    });
    const ctx = createDemoShellState({
        reactive: identityReactive,
        resolve: makeResolver({ refs: {} }),
    });
    assert.throws(() => ctx.missing, {
        name: 'TypeError',
        message: /createDemoShellState: 依赖 "refs\.missing" 没有发布到 assembly/,
    });
});

test('invalid spec entries are rejected at factory invocation', () => {
    const createDemoShellState = defineShellState('createDemoShellState', { reads: [42] });
    assert.throws(
        () => createDemoShellState({
            reactive: identityReactive,
            resolve: makeResolver({ refs: {} }),
        }),
        {
            name: 'TypeError',
            message: /spec entries must be a dependency path or a \[ctxKey, path\] pair/,
        }
    );
});

test('the resulting target is wrapped by the provided reactive factory', () => {
    let wrapped;
    const createDemoShellState = defineShellState('createDemoShellState', {
        values: ['state.answer'],
    });
    const ctx = createDemoShellState({
        reactive: (value) => { wrapped = value; return value; },
        resolve: makeResolver({ state: { answer: 42 } }),
    });
    assert.equal(ctx, wrapped);
    assert.equal(ctx.answer, 42);
});
