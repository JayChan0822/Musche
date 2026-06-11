# Shell State Factory Design

## Goal

`app/scripts/state/` 下 33 个 `*-shell-state.js` 文件（`root-shell-state.js` 除外）高度同构：接收 `{ reactive, <sources...> }`，校验 `reactive`，返回一个由 getter/setter/直传属性组成的 reactive ctx 对象。本次引入一个共享工厂消除样板，**不改变任何文件的导出名、调用签名、TypeError 文案与运行时行为**。

## 现状模式

每个 shell state 的属性只有四种形态：

1. **只读 ref**：`get x() { return refs.x.value; }`
2. **可写 ref（v-model）**：上者加 `set x(value) { refs.x.value = value; }`
3. **延迟取值**：`get x() { return state.x; }`（来源属性可能被重新赋值，需每次访问求值）
4. **直传**：`x: actions.x` / 子 ctx 透传 `appColorPickerModal`（创建时取值一次）

## 方案

新增 `app/scripts/state/shell-state-factory.js`：

```js
export function defineShellState(factoryName, buildSpec) {
    return function createShellState({ reactive, ...sources } = {}) {
        if (typeof reactive !== 'function') {
            throw new TypeError(`${factoryName} requires Vue reactive factory`);
        }
        const { reads = {}, models = {}, raw = {}, values = {} } = buildSpec(sources);
        // values → 直传属性；reads → 只读 getter（.value）；
        // models → getter+setter（.value）；raw → 每次访问执行 thunk
        ...
        return reactive(target);
    };
}
```

每个 shell state 文件改写为声明式 spec，例如：

```js
import { defineShellState } from './shell-state-factory.js';

export const createConfirmModalShellState = defineShellState(
    'createConfirmModalShellState',
    ({ refs, actions }) => ({
        reads: { showConfirmModal: refs.showConfirmModal },
        values: {
            confirmModalConfig: refs.confirmModalConfig,
            closeConfirmModal: actions.closeConfirmModal,
            handleConfirmAction: actions.handleConfirmAction,
        },
    }),
);
```

语义等价性说明：

- 原 getter 在创建时解构源对象（一次），访问时读 `.value`——`reads`/`models` 等价。
- 原 `get x() { return state.x; }` 访问时读取属性——`raw: { x: () => state.x }` 等价。
- 原解构后直接返回的常量 getter（如 `confirmModalConfig`）与直传属性等价，归入 `values`。
- `reactive()` 包裹带 accessor 的对象与原对象字面量 getter 行为一致（Proxy get trap 经 Reflect.get 触发 accessor）。

## 不迁移的文件

- `root-shell-state.js`：返回两个 ctx 的不同形态，且被 `tests/helpers/app-boundary-assertions.mjs` 的结构正则锁定。
- `app-state.js`、`settings-state.js`、`data-io-state.js`、`import-data-state.js`、`track-list-state.js`、`midi-manager-state.js`、`metadata-modal-state.js`：这些是创建 ref 的状态工厂，不是 ctx 映射壳。

## 测试影响

- 行为断言（import 工厂后用 `reactive: v => v` 调用并检查属性/TypeError）：不受影响。
- 源码 pin 正则（`tests/modularization-smoke.mjs` 中 7 处 `export function createXxxShellState...`、`tests/settings-modal-shell-app-boundary.test.mjs` 1 处）：更新为 pin 新的 `export const createXxx = defineShellState(` 形态，原有的关键属性名列表保留在正则中。
- `tests/modularization-smoke.mjs` 的 `requiredFiles` 先行加入 `shell-state-factory.js`（红）。
- 新增 `tests/shell-state-factory.test.mjs` 单测工厂四种 bucket 的语义。

## 迁移验证

一次性等价性校验（不入库）：用 `git show HEAD:<file>` 取旧实现，与新实现用同一组 Proxy mock sources 实例化，逐属性比较 own keys、getter/setter 存在性与取值同一性，33 个文件全部通过后才提交。
