# Shell State Factory Implementation Plan

**Goal:** 引入 `defineShellState` 工厂，把 33 个同构的 `*-shell-state.js` 收敛为声明式 spec，行为完全等价。

设计见 `2026-06-11-shell-state-factory-design.md`。

---

### Task 1: 工厂 + 单测

**Files:**
- Create: `app/scripts/state/shell-state-factory.js`
- Create: `tests/shell-state-factory.test.mjs`
- Modify: `tests/modularization-smoke.mjs`（requiredFiles 先加条目 → 红）

**Steps:**
1. requiredFiles 加 `app/scripts/state/shell-state-factory.js`，跑 `npm run verify:modularization` 确认红。
2. 实现 `defineShellState(factoryName, buildSpec)`，支持 `reads` / `models` / `raw` / `values` 四种 bucket；缺 `reactive` 时抛出与现有文案一致的 TypeError。
3. 单测覆盖：四种 bucket 语义、TypeError 文案、`reactive` 包裹、setter 写回 ref。
4. 验证：`node --check` → `npm run verify:modularization` → `npm test`。

Commit: `refactor: add shell state factory`

### Task 2: 迁移 33 个 shell state 文件

**Files:**
- Modify: 33 个 `app/scripts/state/*-shell-state.js`（root 除外）
- Modify: `tests/modularization-smoke.mjs`（7 处源码 pin 正则改为新形态）
- Modify: `tests/settings-modal-shell-app-boundary.test.mjs`（1 处源码 pin）

**Steps:**
1. 逐文件改写为 `export const createXxx = defineShellState('createXxx', (sources) => spec)`，导出名、参数 bucket 名、TypeError 文案不变。
2. 等价性校验：`git show HEAD:` 取旧实现，与新实现用同一组 mock sources 实例化，比较 own keys / accessor 形态 / 取值同一性，33 个全部通过。
3. 更新被破坏的源码 pin 正则（npm test 的失败列表即清单），保留关键属性名断言。
4. 验证：`npm run verify:modularization` → `npm test` → `npm run build`。

Commit: `refactor: migrate modal shell states to shell state factory`
