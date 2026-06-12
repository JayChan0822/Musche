# Root Context Assembly Aliases Implementation Plan

> **状态（2026-06-12）：已完成。** `locals` 参数已删除：227 项中 31 项 ref 并入 wiring 的
> `assembly.refs` 解构（59→90），196 项改从 `assembly.helpers` 解构，185 项在 app.js
> 各 feature 装配块旁就地发布。烟雾测试新增反向守护（app.js 禁出现 `locals:`）与
> 清单一致性守护（wiring 的 helpers 解构 ⊆ app.js 发布键）。
> 等价性双向 diff 无差，166 单测 + 4 E2E 冒烟 + 构建全绿。

**Goal:** 删除 `createAppRootContexts` 的 `locals` 参数，wiring 改为从
`assembly.refs` / `assembly.helpers` 解构，app.js 在各 feature 装配块旁就地发布别名，
并加守护断言。

设计见 `2026-06-12-root-context-assembly-aliases-design.md`。

---

### Task 1: app.js 就地发布别名到 assembly.helpers

**Files:**
- Modify: `app/scripts/app.js`

**Steps:**
1. 在每个 feature 装配块（解构 / 赋值完成处）旁新增 `Object.assign(assembly.helpers, { ... })`，
   覆盖设计文档第 3 类的 185 项；已在 refs / helpers 上的 42 项不重复发布。
2. `locals` 暂时保留（本任务零行为变化，wiring 仍读 locals）。
3. 验证：`node --check app/scripts/app.js` → `npm run verify:modularization` → `npm test` → `npm run build`。

Commit: `refactor: publish root template aliases through assembly helpers`

### Task 2: wiring 改读 assembly，删除 locals，加守护

**Files:**
- Modify: `app/scripts/services/app-root-context-wiring.js`
- Modify: `app/scripts/app.js`
- Modify: `tests/modularization-smoke.mjs`

**Steps:**
1. 先加守护断言（红）：app.js 不得出现 `locals:`；wiring 不得出现 `locals` 且必须
   `} = assembly.helpers;`；wiring 的 helpers 解构集合 ⊆ app.js 各
   `Object.assign(assembly.helpers, {...})` 块的键集合。跑 `npm run verify:modularization` 确认红。
2. wiring：31 项 ref 并入 `= assembly.refs` 解构，196 项函数/computed 改为
   `= assembly.helpers` 解构，签名改 `({ assembly, factories })`。
3. app.js：删除 `locals` 对象与传参。
4. 等价性校验（不入库脚本）：`git show HEAD:app/scripts/app.js` 提取旧 locals 227 键，
   与新 wiring 两处解构的并集做双向 diff，必须完全一致。
5. 验证：`node --check` 两个文件 → `npm run verify:modularization`（绿） → `npm test` → `npm run build`。

Commit: `refactor: wire root contexts from assembly instead of locals list`
