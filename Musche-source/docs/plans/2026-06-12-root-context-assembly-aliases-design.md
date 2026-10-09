# Root Context Assembly Aliases Design

## Goal

`app/scripts/app.js` 末尾向 `createAppRootContexts` 传一个 227 项的 `locals` 对象，
`app/scripts/services/app-root-context-wiring.js` 顶部再用同名清单整体解构一遍。
新增一个模板别名必须同步改两处，漏改导致运行时 undefined，且没有测试守护。

本次让 wiring 改为从 `assembly.refs` / `assembly.helpers` 取值（项目既有约定，
见 CLAUDE.md「跨 feature 引用必须经 assembly 延迟取值」），删除 `locals` 参数，
消除两份手工同步的清单，并加守护断言防止回潮。

## 现状

`locals` 的 227 项按来源分三类：

1. **31 项 ref 已挂在 `assembly.refs`**（app.js 装配各 state 工厂时已 `Object.assign(assembly.refs, ...)`）：
   sortField、sidebarTab、isMobile、mobileTab、newItem、isSyncing、isZooming、weekGridWrapper、
   dragState、availableInstrumentGroups、midiManagerExpandedGroups、projectMidiGroups、isSidebarOpen、
   showColorPickerModal、activeRecDropdown、showRecInfoModal、recInfoForm、recDropdownSearch、
   newRecInputs、projectInfoForm、showImportModal、showExportModal、exportFilter、settingsNameFocus、
   filteredSidebarList、musicianStats、projectStats、instrumentStats、expandedStatsIds、
   currentWeekDays、sidebarScrollRef。
2. **11 项已在 `assembly.helpers`**（universal-modal / history / view-navigation 等块已发布）：
   changeDate、closeConfirmModal、closeImportMenu、closeInputModal、confirmInputModal、
   handleConfirmAction、pushHistory、undo、redo、onBeforeLeave、onAfterLeave。
3. **其余 185 项**（feature 返回的函数 / computed / 局部 state）只进了 `locals`，assembly 上没有。

## 方案

### app.js：别名就地发布

在每个 feature 装配块旁（紧跟该块的解构 / 赋值之后）就地
`Object.assign(assembly.helpers, { ... })`，把第 3 类的 185 项发布到 `assembly.helpers`。
小而内聚、与创建处同址，新增别名时只改一处。

时序语义不变：setup 同步执行，懒加载 feature 的 `onLoaded` 回调（异步）发生在
`createAppRootContexts` 调用之后，所以「就地发布」与原来「末尾整体收集」捕获的是
同一批值（含 `let` 别名被 onLoaded 回填前的初值，如 groupedCsvData、allSettingsGrouped）。

### wiring：从 assembly 解构

`createAppRootContexts({ assembly, factories })` 去掉 `locals` 参数：

- 第 1 类 31 项并入现有的 `= assembly.refs` 解构；
- 第 2、3 类共 196 项改为 `= assembly.helpers` 解构。

该模块在 setup 末尾同步调用，此时全部 feature 已注册、helpers 均已发布完毕，
顶部解构不存在注册顺序问题（registrar 的「禁止顶部解构」规约针对的是装配中途的
跨 feature 引用，不适用于这里——文件头注释已说明此时序前提）。

各 shell 工厂调用体（`createRootXxxShellState({ refs, state, actions, ... })`）不动，
烟雾测试对它们的结构断言不受影响。

## 守护（先红后绿）

`tests/modularization-smoke.mjs` 新增：

1. 反向守护：`app.js` 不得再出现 `locals:`；`app-root-context-wiring.js` 不得出现 `locals`，
   且必须含 `} = assembly.helpers;` 解构。
2. 清单一致性守护（替代原先「两处手工同步」的根因）：解析 wiring 中
   `= assembly.helpers` 解构出的标识符集合，断言每一项都出现在 app.js 的某个
   `Object.assign(assembly.helpers, { ... })` 块的键里——漏发布在测试期即红，
   不再等到运行时 undefined。

## 测试影响

- 无新文件，requiredFiles 不变。
- 烟雾测试对 wiring 的既有断言均针对 shell 工厂调用体或 `createRootShellState` 调用，与
  参数来源无关，预计不需改动；若 `npm run verify:modularization` 暴露隐性 pin，随实现同步更新。
- 行为测试不依赖 `createAppRootContexts` 签名。

## 迁移验证

一次性等价性校验（不入库）：用 `git show HEAD:app/scripts/app.js` 提取旧 `locals`
的 227 个键，逐一断言出现在新 wiring 的 `assembly.refs` / `assembly.helpers` 解构中；
再反向断言新解构没有引入旧清单之外的名字。通过后才提交。

固定验证步骤：`node --check` 改动文件 → `npm run verify:modularization` → `npm test` → `npm run build`。
