# App Root Slimming Implementation Plan

**Goal:** 把 app.js 的 feature 接线表与 shell ctx 创建下放到适配层，组合根收敛到数百行。

设计见 `2026-06-11-app-root-slimming-design.md`。

---

### Task 1: assembly 骨架

- Create: `app/scripts/services/app-assembly.js`（红：先加 modularization-smoke requiredFiles）
- Create: `tests/app-assembly.test.mjs`（结构与延迟取值语义单测）
- Modify: `app/scripts/app.js`（创建 assembly、把 store/state 输出合并进 refs，行为不变）

Commit: `refactor: introduce app assembly context`

### Task 2: 试点批迁移（低扇出 feature）

sidebar → dropdowns → ratio → history → session，逐个：

1. registrar 改为返回 `wireXxxFeature(assembly)`，接线块逐字搬移；
2. app.js 块缩为 `wireXxxFeature(assembly)` 调用 + 过渡期别名解构；
3. 重定向相关烟雾/边界断言（fixture 换 registrar，正则不变）；
4. `npm run verify:modularization && npm test` 全绿后进下一个。

Commit: `refactor: move <feature> wiring into its registrar`（每个或每 2-3 个一提）

### Task 3+: 其余批次

按依赖扇出从低到高：name-lookup、split-view、picker-controls、universal-modal、orchestration、quick-add、settings-sync、view-navigation、search、sidebar-stats、mobile-ui、auth、schedule、schedule-interactions、pool-interactions、global-keyboard、app-runtime；懒加载组（task-editor、track-list、settings、midi-manager、metadata-modals、data-io、import-data、mobile-touch、schedule-deletion、notifications、desktop-resize、avatar-crop、tour）。

### Task N-1: shell ctx 段下放

### Task N: 清理别名与巨型解构，app.js 收敛

每阶段验证：`node --check` → `npm run verify:modularization` → `npm test` → `npm run build`；阶段尾加跑 `npm run test:e2e`。
