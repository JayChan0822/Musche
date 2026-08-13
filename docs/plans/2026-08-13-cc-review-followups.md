# 2026-08-13 cc 审查遗留项清零记录

> 背景：P0-P5 重构完成后，两轮 cc(opus) 只读审查（含变异测试）共发现问题 4+5 项，全部在此次收尾中处理。验证基线：`npm test` 219 pass 全绿（76 modules smoke）+ `npm run build` OK。

## 二轮审查结论（2026-08-13 晚，报告 /tmp/musche-fix-review-log.txt）

| commit | 结论 | 处理 |
|---|---|---|
| b7e1b99 NO_DATA fixture | ⚠️ 断言只长回一半牙 | 本轮补 ratio:5 + estDuration 断言（见下） |
| ed19b79 openSplitSlider 守卫 | ✅ 达成（totalSec 断言恒真） | 本轮换 syncItemForView 计数 |
| 39199c3 删死字面量 | ✅ 行为等价 | 无需处理 |
| 93e045f debounce pushHistory | ⚠️ 修对主症状但引入 P2 撤销栈竞态 + 零测试 | 本轮修竞态 + 补测试（见下） |

## 本轮修复（5 项）

1. **P2｜undo/redo 竞态**：debounce 回调的 pushHistory 会截断 redo 分支（1.5s 内 Ctrl+Z 后 redo 永久失效，history.js:88 分支截断触发）。修法：track-list-records 暴露 `cancelPendingTrackSave`（清 trackSaveTimer）→ app.js 经懒加载代理挂 `assembly.helpers.cancelPendingTrackSave` → history registrar 延迟取值注入 → undo/redo 开头调用。track-list 是懒加载 feature，跨 feature 引用全部经 assembly 延迟取值（符合 CLAUDE.md 约束）。
2. **P3｜pushHistory 空快照保护**：与当前索引处快照字节相同则跳过。避免 debounce 写回无变化时推重复快照（第一次 Ctrl+Z 无反应、50 条上限下撤销深度减半）。
3. **P3｜track-list-records 行为测试**：`tests/track-list-records-behavior.test.mjs`（3 测试，node:test mock.timers）——debounce 去抖只触发一次 + 回调推历史（93e045f 回归守护）、cancelPendingTrackSave 取消 pending、calcTrackDiff 计算 actualDuration 并调度写回。
4. **P3｜NO_DATA 写回路径有牙**：fixture ratio 12→5（原来 == 回落值 12，`task.ratio !== newRatio` 短路导致断言空转），补 estDuration '720s' 断言，真正覆盖 newRatio===0 回落写回分支。
5. **P3｜openSplitSlider 测试强化**：`totalSec stays 0`（恒真）换 `syncItemForView` 调用计数 0（守卫 return 前无副作用的最直接观测点）。

## 验证

- `npm run verify:modularization`：76 modules passed
- `npm test`：219 pass / 0 fail（本轮新增 3 条 track-list-records 行为测试，216→219）
- `npm run build`：OK

## 四轮补充（223 基线，2026-08-13）

四审（报告 /tmp/musche-round4-review-log.txt）确认 6 项中的 4 项 ✅、2 项 ⚠️，遗留 1 P2 + 3 P3 已清零：

1. **P2｜漏网同类路径**：Alt+Tab 切 session（global-keyboard.js:263，与 switchSession 等价入口）、删除 session 落到 sessions[0]（session.js:59 同函数体第三分支）、ghost 任务跨 session 跳转（main-view-navigation.js:174）、auth 登出 resetWorkingData / 冲突上传 / 加载失败兜底——全部补 cancelPendingTrackSave。
2. **P3｜接线测试**：`lazy-feature-proxy.test.mjs` 加 isLoaded 2 用例（未加载不触发 import、加载失败恢复）；`session-behavior.test.mjs` 4 用例（switchSession/新建/删除触发 cancel、唯一 session 拒绝时不 cancel）；`data-portability-behavior.test.mjs` 1 用例（导入恢复 cancel）。
3. **P3｜docs**：本段即修正记录；`npm test` 现为 **223 pass**。
4. **P3｜死代码**：app.js:559-560 的 getSessionRatio / calculateProportionalDuration 无消费方（被 smoke:5198 正则钉住）——既有问题，未动。

## 遗留（低优先，未做）

- track-list.js:16 sidebarTab 解构三子模块无人用（app-lazy-feature-wirings.js:466,480 还在接线）
- compareTrackItems 随 ...layout 展开多导出一项（无消费方）
- 子模块注入顺序无守护（autoResizeScheduleByRecords/syncTrackItemScheduleSection 创建顺序被调会静默 undefined）
- smoke 迁 node:test（半份廉价收益）
