import test from 'node:test';
import assert from 'node:assert/strict';
import { defineShellState } from '../app/scripts/state/shell-state-factory.js';

const identityReactive = (value) => value;

test('defineShellState validates its own arguments', () => {
    assert.throws(() => defineShellState('', () => ({})), {
        name: 'TypeError',
        message: 'defineShellState requires a factory name',
    });
    assert.throws(() => defineShellState('createDemoShellState'), {
        name: 'TypeError',
        message: 'defineShellState requires a spec builder function',
    });
});

test('created factory fails clearly without Vue reactive, using the factory name', () => {
    const createDemoShellState = defineShellState('createDemoShellState', () => ({}));
    assert.throws(() => createDemoShellState(), {
        name: 'TypeError',
        message: 'createDemoShellState requires Vue reactive factory',
    });
    assert.throws(() => createDemoShellState({ reactive: null }), {
        name: 'TypeError',
        message: 'createDemoShellState requires Vue reactive factory',
    });
});

test('reads expose ref values through read-only getters', () => {
    const show = { value: false };
    const createDemoShellState = defineShellState('createDemoShellState', ({ refs }) => ({
        reads: { show: refs.show },
    }));
    const ctx = createDemoShellState({ reactive: identityReactive, refs: { show } });

    assert.equal(ctx.show, false);
    show.value = true;
    assert.equal(ctx.show, true);
    const descriptor = Object.getOwnPropertyDescriptor(ctx, 'show');
    assert.equal(typeof descriptor.get, 'function');
    assert.equal(descriptor.set, undefined);
});

test('models read and write the underlying ref', () => {
    const show = { value: false };
    const createDemoShellState = defineShellState('createDemoShellState', ({ refs }) => ({
        models: { show: refs.show },
    }));
    const ctx = createDemoShellState({ reactive: identityReactive, refs: { show } });

    ctx.show = true;
    assert.equal(show.value, true);
    assert.equal(ctx.show, true);
});

test('raw thunks re-evaluate on every access', () => {
    const state = { splitState: { ratio: 1 } };
    const createDemoShellState = defineShellState('createDemoShellState', (sources) => ({
        raw: { splitState: () => sources.state.splitState },
    }));
    const ctx = createDemoShellState({ reactive: identityReactive, state });

    assert.equal(ctx.splitState.ratio, 1);
    state.splitState = { ratio: 2 };
    assert.equal(ctx.splitState.ratio, 2);
});

test('values are passed through once at creation time', () => {
    const close = () => {};
    const childCtx = { name: 'child' };
    const createDemoShellState = defineShellState('createDemoShellState', ({ actions, appChildModal }) => ({
        values: { close: actions.close, appChildModal },
    }));
    const ctx = createDemoShellState({
        reactive: identityReactive,
        actions: { close },
        appChildModal: childCtx,
    });

    assert.equal(ctx.close, close);
    assert.equal(ctx.appChildModal, childCtx);
});

test('the spec builder never runs before the reactive guard', () => {
    let built = false;
    const createDemoShellState = defineShellState('createDemoShellState', () => {
        built = true;
        return {};
    });
    assert.throws(() => createDemoShellState({}));
    assert.equal(built, false);
});

test('the resulting target is wrapped by the provided reactive factory', () => {
    let wrapped;
    const createDemoShellState = defineShellState('createDemoShellState', () => ({
        values: { answer: 42 },
    }));
    const ctx = createDemoShellState({
        reactive: (value) => { wrapped = value; return value; },
    });
    assert.equal(ctx, wrapped);
    assert.equal(ctx.answer, 42);
});
