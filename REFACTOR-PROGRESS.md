# Musche 重构进度交接（2026-08-13）

> 任务来源：`/tmp/musche-review.md`（Opus 5 深度审查报告，含完整证据链）
> 任务：按 P0→P5 逐项修复/优化，验证命令 `npm test`（当前 235 pass 全绿）

## ✅ 审查遗留项修复（2026-08-13 下午，cc 按 opus 审查报告执行）

| # | 内容 | 提交 |
|---|---|---|
| P1-1 | ratio 写回限定当前 session（updateTask 加 `(task.sessionId\|\|'S_DEFAULT') !== currentSessionId.value` 过滤，scheduledTasks 同改）+ 跨 session 回归用例 | `b476254` |
| P1-2 | 删 shouldPushHistory 死参数（8 个调用点清参）+ 去抖写回后真实现 pushHistory（93e045f，撤销栈不再丢记录） | `a9c412d` `93e045f` |
| P1-3 | 整体删拼音死链：search.js/pinyin-match-loader.js 删码、search-feature-registrar 去 `{pinyinMatchSupport}` 参数、package.json 删 pinyin-pro、6 处锁定断言改向 | `68fe3ad` |
| P2-4 | 删 createSplitRemainderTask 死字面字段 | `39199c3` |
| P2-5/6 | split 滑块边界（<=0/>=total）守卫测试 + openSplitSlider 不可拆分守卫 + invalidCalls 改错误标题数组断言 | `9ff34a1` `ed19b79` |
| P2-7 | ratio NO_DATA fixture 显式 session，:141 过滤分支真正被执行 | `b7e1b99` |

**验证（Hermes 实测，非 cc 自报）**：node --check 14/14 → verify:modularization 76 modules ✅ → `npm test` **216/216 全绿** → build ✅ 主包 433.01 kB（gzip 130.33），pinyin-pro 289 kB 死 chunk 消失，仅 xlsx 常规告警。

## ✅ 已完成（按提交顺序）

| # | 内容 | 提交 |
|---|---|---|
| P0 | 修复懒加载 feature 状态回填断链（CSV/MIDI 导入弹窗列表恒空）——占位改稳定转发 computed（shallowRef holder），新增 `tests/lazy-feature-root-context.test.mjs` | `43d8a85` |
| P0b | playwright baseURL 改 `127.0.0.1` + zshrc 加 `NO_PROXY`（根因：HTTP_PROXY 劫持 playwright 探测返 400） | `5c607c1` |
| P1 | `app-root-context-wiring.js` 755→111 行：shell state 改声明式 spec（reads/models/values 字符串路径），wiring 只留惰性 resolve；33 个 shell state 全迁移；`shell-state-factory.test.mjs` 重写（10 测试） | `2fd5f0c` |
| P2a | CSV parse 纯函数抽取：`parseCSVLine`/`parseCSVRobust` → `app/scripts/utils/csv.js`，import-csv.js 改 import；新增 3 个单测 + 2 条边界断言 | `b4073fe` |
| P2b | **track-list.js 拆分（1087 → 组合根 88 行 + 3 子模块）**：`track-list-drag.js`(550，divider+track 手势，闭包 4 个 let 移入)、`track-list-records.js`(226，记录读写，trackSaveTimer 移入)、`track-list-layout.js`(336，布局+排序+分组判定)。跨模块依赖单向注入：layout ← records ← drag（`autoResizeScheduleByRecords`、`syncTrackItemScheduleSection`）。主文件变装配根，`calculateSingleRatio` 保留 actions 默认值。smoke 5 处断言改指向子模块 + requiredFiles 加 3 条目 | `892b979` |
| P3 | **接线层样板清理三刀**：① 删 `app-utility-functions.js` 21 个扁平死导出（app.js 只用 4 桶，grep 零消费方）② 去 22 个零参数空壳工厂 `createXxxFeatureRegistrar()` → 直接 `export function wireXxxFeature(assembly)`（search 保留工厂，因 `pinyinMatchSupport` 参数——**已于后续 commit 整体删除，search 现也是 wire 形态**）③ global-keyboard registrar 41 个 ref 名写两遍 → `pick(assembly.refs, KEYBOARD_REF_KEYS)` 写一遍。smoke 断言 helper 加 `importName = factoryName || registerName` 分支 + 22 个 boundary 测试删 factoryName 行 | `78a91c5` `60fd51f` |
| P4 | **补行为测试**：`tests/ratio-behavior.test.mjs`(8 测试)、`tests/split-task-behavior.test.mjs`(11 测试)。测试从 193 → 212 | `bef0427` |
| 收尾1 | **ratio 跨 session 写回 bug 修复**（cc 审查 P1-1）：`autoUpdateEfficiency` 的 updateTask 只判 idKey，A 会话录音会静默改 B 会话同乐手 ratio/estDuration（Ctrl+Z 救不回）。修法：updateTask 加与平均值计算对称的 `(task.sessionId||'S_DEFAULT') === currentSessionId.value` 判据；新增跨 session 回归用例（itemPool+scheduledTasks 双数组验证）；smoke fixture 补 sessionId + 改 OTHER_SESSION 断言为「不被触碰」 | `b476254` |
| 收尾2 | **shouldPushHistory 死参数清理**（cc 审查 P1-2 + P3 同型）：`autoUpdateEfficiency(targetId, viewType, shouldPushHistory=true)` 声明后从未读取，9 个调用点全传 false/true；`autoResizeScheduleByRecords(isSilent, shouldPushHistory)` 同型。两参数删除 + 全部调用点清理（9 文件）；smoke 5 处锁旧 arity 的断言更新（含 :4875 签名正则、:4922 大正则） | `a9c412d` |
| 收尾3 | **拼音搜索链路整体删除**（cc 审查 P1-3）：功能自 22d7a1e(2026-06-11) 断线——createSearchFeatureRegistrar 空参不接 pinyinMatchSupport，search.js 永远走 `ensurePinyinMatch = () => Promise.resolve()` 默认值，loadPinyinMatch 全仓零调用点，pinyin-pro 289 kB(gzip 142) 100% 死 chunk。删除：pinyin-match-loader.js 文件、support-loaders/dependencies/registrars 的 pinyinMatchSupport 三处接线、search.js 懒加载触发 + smartMatch 拼音分支、pinyin-pro 依赖（npm uninstall）、9 处锁死接线的测试断言（改 doesNotMatch 守护）。**search registrar 去工厂降 wireSearchFeature**（与其余 21 个同步 feature 同形态）。build 后 pinyin chunk 消失，主包 433.77→433.10 kB，总下载量 -289 kB | `68fe3ad` |
| 收尾4 | **split-task 测试缺口补强**（cc 审查 P2-4/5/6）：confirmSplitSlider 余量任务补 pool 长度 + remainder musicDuration/splitTag/identity 断言；滑块两端（splitPoint<=0 / >=totalSec）→ '无效拆分' 且不建任务；splitTrack 空/00:00 总长 → '无法拆分'；invalidCalls 混计计数器改按顺序断言错误标题数组（数值错误/格式错误可区分）。测试 213 → 215 | `9ff34a1` |
| 收尾5 | **二轮 cc(opus) 审查通过（4 项修复全 ✅，8 个变异测试证伪）**：变异验证「删 session 判据 → 单测+smoke 双挂」「互换错误标题 → 挂」「删 itemPool.push → 挂」等。新增 5 个 P3 遗留（见下） | 审查报告 `/tmp/musche-fix-review-log.txt` |
| 收尾6 | **二轮遗留清零（4 commit，测试 215→216）**：① NO_DATA fixture 补 sessionId:'S1' 恢复「newRatio 回落」分支断言效力 `b7e1b99` ② openSplitSlider 同款「无法拆分」守卫补测（原全仓唯一删掉不挂测试的守卫）`ed19b79` ③ createSplitRemainderTask:227-231 五个死赋值字段清理（变异证实被 syncLegacySplitFields 覆盖）+ 注释 `39199c3` ④ **saveTrackRecord debounce 写回补 pushHistory**（fix：calcTrackDiff 的 pushHistory 在 1.5s debounce 前同步执行，写回的 ratio/estDuration 落进撤销盲区 Ctrl+Z 救不回）`93e045f` | 见下各 commit |

## 📝 P4 剩余评估（未做，附理由）

- **smoke 12921 行降为数据驱动**：`requiredFiles` 已是「清单 + for 循环」数据驱动；`assertApp*Registry`(41)、`assertRootShellCtx`(32) 已参数化 helper。剩余 593 assert.match + 346 assert.doesNotMatch 是**语义边界断言**（每个正则+label 唯一），非重复样板，无数据化收益。
- **metadata-modals / data-io 贯通测试**：这两条懒加载链的转发写在 app.js 内联（`computed(() => ref.value?.xxx.value || [])`），非 state 层 forward。P0 测试已覆盖同模式的 import-data + midi-manager（断链实际受害者）。再补需复刻 app.js 大量装配，投入产出比低。

## 📝 P5 评估结论（不做懒加载，附理由）

主包复量：**452.94 kB（gzip 133.99）→ 433.10 kB（gzip 130.60 不含 pinyin chunk）**，P1/P3/拼音删除自然下降。

- **sidebar-stats（472 行）不建议懒加载**：`currentSidebarList` 是侧栏首屏列表来源，被 search/pool-interactions 经 `assembly.refs.currentSidebarList` 延迟取值；`musicianStats` 徽标 + `filteredSidebarList` 均在首屏渲染，懒加载会白屏。
- **orchestration（305 行）不划算**：体积 8.6 kB（gzip 约 2-3 kB），懒加载需接 lazy proxy + onLoaded 回填，跨 feature 引用（`updatePercOrchestration` 等 helpers）风险 > 收益。
- 审查报告本就把 P5 定为「优先级最低、边际收益递减」，结论与之一致。

## ⏳ 待办

- **cc-review**：✅ 两轮审查均完成（首轮 P2-P5 验证 + 二轮 4 修复项验证，均 opus 只读 + 变异测试），遗留项已全部清零
- **剩余优化（2026-08-13 收尾，4 项清零 + 1 项评估不做）**：
  - ✅ 删 app.js getSessionRatio/calculateProportionalDuration 死别名（layout 定义保留，smoke 行为断言依赖）`357005e`
  - ✅ 删 track-list sidebarTab 死解构 + lazy wirings 接线 `e22fac0`
  - ✅ 删 compareTrackItems 多余导出（内部自用，tests 零消费）`ee352ef`
  - ✅ smoke 加子模块注入顺序守护（layout→records→drag，变异验证顺序颠倒必挂）`291b55e`
  - ⏭️ **smoke 迁 node:test 评估后不做**：13212 行裸脚本 + 1014 条语义断言（每个正则+label 唯一），重写风险高收益半份；当前 && 链已有 smoke 3.3s 快速失败语义；cc 亦只称「半份廉价收益」。保持现状。
- **最终状态**：`npm test` **235/235 全绿**（193 → 235）+ build OK；工作区仅 REFACTOR-PROGRESS.md untracked

## 🔧 环境须知（重要）

- **cc 调用模板**（Hermes 终端有旧中转 env 缓存，必须清）：
  ```bash
  env -u ANTHROPIC_API_KEY -u ANTHROPIC_AUTH_TOKEN -u ANTHROPIC_BASE_URL \
    HTTPS_PROXY=http://127.0.0.1:7897 HTTP_PROXY=http://127.0.0.1:7897 \
    ALL_PROXY=socks5://127.0.0.1:7897 NO_PROXY="127.0.0.1,localhost,::1" \
    claude --model opus -p "任务" --allowedTools "Read,Glob,Grep,Write,Edit,Bash" --max-turns 80
  ```
- cc 官方订阅已登录（iptiwbwy4ever@gmail.com, Pro），凭证在 Keychain；zshrc 中转配置已删
- zshrc 现在：Clash 代理 export(7897) + `NO_PROXY=127.0.0.1,localhost,::1`（防 node/playwright 探测被代理劫持返 400）
- **验证命令链**（CLAUDE.md 固定流程）：`node --check 改动文件` → `npm run verify:modularization` → `npm test` → `npm run build` →（E2E 可选）`NO_PROXY=127.0.0.1,localhost,::1 npx playwright test`
- **REFACTOR-PROGRESS.md 保持 untracked**（勿 git add，误加用 `git rm --cached` + amend 撤出）

## 📋 工作流约定（CLAUDE.md 摘要）

- 大型重构先写设计文档到 `docs/plans/`，提交信息 `refactor: extract <module> feature` 格式
- 抽取新模块：先在 `tests/modularization-smoke.mjs` 的 requiredFiles 加条目（红）→ 实施抽取（绿）
- 跨 feature 引用必须经 `assembly.helpers`/`assembly.features` 延迟取值，禁止模块顶部解构捕获
- 重依赖（xlsx/JZZ/cropper/driver.js）保持按需加载（pinyin-pro 已删，勿再加回）
