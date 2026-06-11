# CLAUDE.md

Musche：音乐人排程应用。Vue 3（运行时组件，无 SFC、无 JSX）+ Vite + Tailwind + Supabase + Capacitor iOS。UI 文案与代码注释以中文为主。

## 常用命令

```bash
npm run dev                      # 本地开发（需 app/config.local.js 或 VITE_SUPABASE_* 环境变量）
npm test                         # 全量测试：模块化烟雾 + node --test tests/*.test.mjs
npm run test:e2e                 # Playwright E2E 冒烟（tests/e2e/，跑在 vite preview 上，不连 Supabase）
npm run verify:modularization    # 仅跑模块边界烟雾测试
npm run build                    # 产物在 app/dist
node --test tests/<file>.test.mjs   # 单跑某个测试
```

## 架构约定

`app/scripts/app.js` 是**组合根**：只负责按顺序装配（创建 store/state → 逐个 `wireXxxFeature(assembly)` → 发布别名 → 创建根 ctx），不写业务逻辑，也不写接线表。新逻辑一律放进模块，接线细节放进对应适配器。

- **features/**：业务功能模块，两种形态：
  - `registerXxxFeature(context)`——同步注册，接收 `{ refs, services, actions }` 形态的 context，返回供模板使用的函数集合；
  - `loadXxxFeature(...)`——懒加载形态，配合 `services/lazy-feature-proxy.js`（首次调用时动态 import，方法调用自动排队等待加载完成）。
- **services/**：依赖装配层。`app-dependencies.js` 聚合全部依赖供 app.js 一次性解构；`app-assembly.js` 是共享装配上下文（`refs`/`state`/`features`/`helpers` 四个桶）；`*-feature-registrar.js` 持有同步 feature 的接线表（`wireXxxFeature(assembly)`，从 assembly 解构所需 refs，跨 feature 引用必须经 `assembly.helpers`/`assembly.features` **延迟取值**，禁止在模块顶部解构捕获）；`app-lazy-feature-wirings.js` 持有全部懒加载 feature 的接线表（refs 在 loadFeature 执行时才取，`onLoaded` 回调把结果回填组合根局部别名）；`app-root-context-wiring.js` 把模板别名装配成 `appRootShell`/`appRootOverlaysShell`；`*-loader.js`（xlsx/cropper/midi-smf/pinyin）封装第三方库的按需加载。
- **components/**：Vue 运行时组件（`app-*-modal.js`、`*-shell.js`），通过 `:ctx` prop 接收状态。
- **state/**：状态工厂；每个弹窗/区块有对应 `*-shell-state.js`，由 `app-state-factories.js` 汇总。shell state 一律用 `state/shell-state-factory.js` 的 `defineShellState(name, spec)` 声明（bucket：`reads` 只读 ref / `models` 可写 ref / `raw` 延迟取值 / `values` 直传），不要手写 getter 样板。
- **utils/**：纯函数（time/csv/midi/format/id/split-state），不依赖 Vue。

第三方重依赖（xlsx、JZZ、cropper、driver.js、pinyin-pro）必须保持按需加载，不要静态 import 进主包。

## 测试约定

- `tests/*-boundary.test.mjs`：守护模块拆分边界（断言 app.js 不再包含已抽出的实现、模块文件存在等），共享工具在 `tests/helpers/app-boundary-assertions.mjs`。
- 行为测试（如 `schedule-drag-drop.test.mjs`、`import-csv-confirm.test.mjs`）用 node:test，直接 import 模块测纯逻辑。
- 抽取新模块时：先在 `tests/modularization-smoke.mjs` 的 `requiredFiles` 加条目（红），再实施抽取（绿）。

## 重构工作流

大型重构先写设计文档到 `docs/plans/`（`YYYY-MM-DD-<topic>-design.md` + 同名实施计划），按任务逐个提交，提交信息用 `refactor: extract <module> feature` 格式。验证步骤固定为：`node --check` 改动文件 → `npm run verify:modularization` → `npm test` → `npm run build`。

## 安全

- Supabase 密钥只能来自 `app/config.local.js`（gitignored）或 `VITE_SUPABASE_URL` / `VITE_SUPABASE_KEY`，禁止硬编码（历史教训见 `docs/security/2026-05-11-supabase-key-rotation.md`）。
