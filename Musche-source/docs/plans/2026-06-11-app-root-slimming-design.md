# App Root Slimming Design

## Goal

`app/scripts/app.js` 当前 2423 行：~100 行依赖解构、~1580 行 feature 接线表（30+ 个 `registerXxxFeature({...})` 块）、~690 行 shell ctx 创建（35 个 `createRootXxxShellState({...})` 块）。组合根的职责应当是"按顺序装配"，而每个 feature 需要哪些 refs/actions 的**接线细节**属于该 feature 的适配层。目标：把接线表下放到已有的 `*-feature-registrar.js` / `*-feature-loader.js` 适配层，app.js 收敛为数百行的纯装配序列。

## 核心机制：assembly 上下文

新增 `app/scripts/services/app-assembly.js`：

```js
export function createAppAssembly({ vue, utils, services }) {
    return {
        vue,        // computed/watch/nextTick 等
        utils,      // timeUtils/formatUtils/idUtils/splitStateUtils
        services,   // storageService/supabaseService/deviceService/triggerTouchHaptic
        refs: {},   // store 与各 state 工厂输出的并集（不在 app.js 解构）
        state: {},  // settings 等 reactive 状态
        features: {},  // 已注册 feature 按名挂载：assembly.features.ratio = ...
        helpers: {},   // 跨 feature 别名（pushHistory/openAlertModal/getNameById...）
    };
}
```

关键规则：

- **refs 不在 app.js 解构**。store 与 state 工厂的输出直接合并进 `assembly.refs`，接线模块自己解构所需的名字。
- **跨 feature 引用必须延迟取值**。接线表中引用其它 feature 的方法时写 `(...args) => assembly.features.xxx.method(...args)` 或经 `assembly.helpers`（调用时取属性，不在模块顶部解构捕获），因为注册存在先后顺序。
- **接线表逐字搬移**。每个 `registerXxxFeature({...})` 块原样移入对应 registrar，模块顶部补一段从 assembly 解构所需名字的清单；这样烟雾测试中 pin 接线内容的正则只需把 fixture 从 `appScript` 换成对应 registrar 的 fixture，正则本体不变。

## registrar 的形态演进

现状（空壳直传）：

```js
export function createRatioFeatureRegistrar() {
  return registerRatioFeature;
}
```

目标（真正的接线适配器）：

```js
export function createRatioFeatureRegistrar() {
  return function wireRatioFeature(assembly) {
    const { trackListData, showTrackList, ... } = assembly.refs;
    const { helpers } = assembly;
    return registerRatioFeature({
      refs: { ... },          // ← 原 app.js 块逐字搬移
      actions: { pushHistory: () => helpers.pushHistory(), ... },
    });
  };
}
```

app.js 中对应块缩成一行：

```js
ratioFeature = wireRatioFeature(assembly);
assembly.features.ratio = ratioFeature;
```

过渡期 app.js 保留 `const { getTaskRatio, ... } = ratioFeature;` 别名解构（后续块还在引用这些名字），全部迁移后在收尾阶段删除别名、改为接线模块内部按需取用。

懒加载 feature（`loadXxxFeature` + `lazy-feature-proxy`）同理：`*-feature-loader.js` 接收 assembly 构建 context。

## 测试迁移规约

- `assert.match(appScript, /registerXxxFeature\({.../)` 类正向 pin：fixture 换成对应 registrar 模块，正则不变。
- `appScript.indexOf('xxxFeature = registerXxxFeature({')` 存在性检查：改为检查 registrar 含 `registerXxxFeature({` 且 app.js 含 `wireXxxFeature(`。
- `assert.doesNotMatch(appScript, ...)`（app.js 不得包含旧实现）：全部保持不变，瘦身后依然成立。
- `assertAppFeatureRegistrarRegistry`：按新导出形态更新。

## 分阶段计划

1. **Phase 1**：assembly 骨架 + 低扇出 feature 试点批（sidebar、dropdowns、ratio、history、session），验证全套迁移机制（含断言重定向），每批全绿提交。
2. **Phase 2-3**：其余 feature 接线分 2-3 批迁移（schedule/interactions/track-list 等高扇出块最后）。
3. **Phase 4**：shell ctx 段（35 个 createRootXxx 块）下放到分组 wiring 模块。
4. **Phase 5**：清理过渡期别名解构与依赖巨型解构，app.js 收敛到 ~200-300 行。

每个阶段固定验证：`node --check` 改动文件 → `npm run verify:modularization` → `npm test` → `npm run build`，阶段完成后跑 `npm run test:e2e`。

## 风险

- 跨 feature 延迟取值如果误写成顶部解构捕获，会拿到 undefined——规约要求 helpers/features 一律调用时取属性；行为由 E2E 冒烟兜底。
- 烟雾断言数量大（appScript 上 99 处正向 pin），必须跟随每批迁移同步重定向，禁止整体放宽。
