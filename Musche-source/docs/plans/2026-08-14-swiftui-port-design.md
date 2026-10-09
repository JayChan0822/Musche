# Musche SwiftUI 原生移植设计

## 目标（Goal）

把 Musche（音乐人录音排程 Web 应用）移植为原生 SwiftUI **iPhone** App。目标平台 iOS 26+ / SwiftUI + Observation / supabase-swift。现有 Web 版继续作为 iPad/桌面端与「可运行规格」（272 个测试）的参考。

废弃旧的 Capacitor WebView 壳（`.worktrees/*/ios`），全新原生工程，不走 WebView 打包路线。

## 关键决策（Decisions）

1. **原生 SwiftUI**，状态用 Observation（`@Observable`），不引入 MVVM 框架。现有 `features/` + `registrars` 分层直接映射为「Model 层 + 依赖注入」。
2. **数据层不拆表**：用 `Codable` 直接映射现有 `user_data` 里的单个 JSON blob（`content` + `version`），两端共用一套数据。等 iOS 稳定后再考虑本地持久化换 SwiftData。
3. **纯逻辑与 UI 分离**：抽一个本地 Swift Package `MuscheCore`（模型 + 纯函数 + 行为测试），iOS App target 依赖它。`MuscheCore` 可在无 Xcode 的环境下用 `swift test`（macOS 目标）先行验证——这是清单「直译」层，也是移植的地基。
4. **iPhone 优先**：桌面端专属的周视图、全局快捷键、悬浮搜索条不移植。iPad 版后续补。
5. **分类只剩两个**：录音（musician）、编辑（project）。乐器（instrument）数据字段保留但无 UI 入口（真源见 `app/scripts/utils/sidebar-tabs.js`）。

## 工程结构（Project Layout）

```
ios/
├── MuscheCore/                     # 本地 Swift Package：纯逻辑，无 UI，可 swift test
│   ├── Package.swift
│   ├── Sources/MuscheCore/
│   │   ├── Models/                 # Codable 数据模型（UserData / PoolItem / Schedule / Settings …）
│   │   ├── Time/                   # TimeMath：parseTime / formatClock / 吸附 / 排序
│   │   ├── SplitState/             # 拆分状态机（值类型 + 纯函数）
│   │   ├── Ratio/                  # 效率倍率取值与回写
│   │   ├── Schedule/               # 重叠检测、幽灵任务、落点计算
│   │   ├── History/                # 撤销栈（JSON 快照 + 去重 + redo 截断）
│   │   ├── Import/                 # CSV 解析 / MIDI tempo 推算
│   │   └── Export/                 # CSV 写出、Credit 文本
│   └── Tests/MuscheCoreTests/      # 移植同名行为测试（见「测试策略」）
├── Musche/                         # iOS App（Xcode 工程，装好 Xcode 后生成/构建）
│   ├── App/                        # MuscheApp.swift、RootView、依赖注入
│   ├── Features/                   # 各 feature 的 @Observable 模型
│   └── Views/                      # DayView / MonthView / PoolView / 弹窗 …
└── (Config)                        # supabase-swift 配置，密钥走环境/配置，不硬编码
```

`MuscheCore` 用 Swift Package（`Package.swift`），不依赖 iOS SDK——这样现在就能 `swift test` 跑绿；`Musche/` 是 Xcode App 工程，装好 Xcode 后再生成并接入 `MuscheCore`。

## 数据模型（Data Model）

`Codable` 直接映射现有 JSON（字段与 Web 版一致，零丢失）：

```swift
struct UserData: Codable {
    var pool: [PoolItem]
    var tasks: [Schedule]
    var settings: Settings
    var version: Int          // 乐观锁，保存前比对云端
}

struct PoolItem: Codable {
    var id: String
    var sessionId: String
    var projectId: String
    var instrumentId: String
    var musicianId: String
    var name: String
    var musicDuration: String      // 乐曲长度
    var estDuration: String        // = musicDuration × ratio
    var ratio: Double
    var ratios: [String: Double]          // musician / project / instrument 三套
    var records: [String: [Record]]       // 三套
    var splitViews: [String: SplitView]   // 按视图拆分的树
    var orchestration: [String]
}

struct Schedule: Codable {
    var scheduleId: String
    var templateId: String        // 指回 PoolItem.id
    var sessionId: String
    var date: String              // YYYY-MM-DD
    var startTime: String         // 补零的 HH:MM
    var estDuration: String       // "01:30" 或 "5400s"
    var musicianId: String
    var projectId: String
    var instrumentId: String
    var ratio: Double
    var trackCount: Int
    var musicDuration: String
    var recordingInfo: String
    var editInfo: String
}

struct Settings: Codable {
    var startHour: Int            // 默认 10
    var endHour: Int              // 默认 22
    var sessions: [Session]
    var musicians: [Musician]
    var projects: [Named]         // studios / engineers / operators / assistants 同构
    var instruments: [Named]
}
```

**不拆成 SwiftData 实体**——两端共用数据，拆表要写双向转换。保留 `version` 乐观锁 + 离线 `localStorage`（iOS 侧对应本地缓存）。

## 模块映射（Module Mapping）

| 状态 | Web 源 | Swift 目标 | 说明 |
| --- | --- | --- | --- |
| 直译 | `utils/time.js` | `MuscheCore/Time` | parseTime / timeToMinutes / formatClock / addMinutesToTime / addDaysToDate，60 行地基 |
| 直译 | `utils/split-state.js` | `MuscheCore/SplitState` | 拆分状态机 316 行，值类型 + 纯函数复刻，不改语义 |
| 直译 | `utils/midi.js` | `MuscheCore/Import` | tempo map / tick→秒 / 量化，读 SMF 层换 MIDIKit |
| 直译 | `utils/csv.js` `utils/format.js` `utils/id.js` | `MuscheCore/Import` `Export` | 带引号转义 CSV、秒→时长、日期归一化、id 生成 |
| 直译 | `features/ratio.js` | `MuscheCore/Ratio` | 倍率取值优先级 + calculateEstTime + autoUpdateEfficiency（注意 session 作用域） |
| 直译 | `features/schedule.js` 的 checkOverlap / cleanupEmptySchedules | `MuscheCore/Schedule` | 同分类/同 session/同一天重叠检测 + 孤儿日程清理 |
| 直译 | `features/credits.js` `features/export-csv.js` 取数 | `MuscheCore/Export` | 字幕文本、导出行组装；表格写出换库 |
| 直译 | `features/calendar-view.js` generateMonthGrid / currentWeekDays | `MuscheCore/Calendar` | 月网格（35/42 格）、周日期序列 |
| 改造 | `features/history.js` | `MuscheCore/History` | 撤销栈：JSON 快照、上限 50、先去重再截断 redo |
| 改造 | `features/schedule-drag-drop.js` `mobile-touch-*.js` | `MuscheCore/Schedule`（落点）+ `Views/DayView` | 落点/吸附逻辑照搬，命中测试、幽灵、自动滚动换 DragGesture |
| 改造 | `features/track-list-*.js`（4 文件 1.2k 行） | `Features/TrackList` | 分段/分隔条/起止时间/反推时长，第二大块 |
| 改造 | `features/search.js` `sidebar-stats.js` | `Features/Search` `Features/SidebarStats` | 模糊匹配、四态统计，渲染换 SwiftUI List |
| 改造 | `features/import-csv.js`（1011 行）`import-midi.js` | `Features/Import` | 列映射/智能匹配/去重预览，逻辑值钱 |
| 改造 | `features/auth.js` | `Features/Auth` | 登录/拉取写回/版本冲突/离线缓存，换 supabase-swift |
| 重写 | 日/月/周视图、任务池侧栏、约 20 个弹窗 | `Views/*` | 自绘 + 手势（详见里程碑） |
| 不移植 | driver.js / cropperjs / 自绘下拉框 / 全局快捷键 / ICS | TipKit / PhotosPicker / Menu·Picker·alert / EventKit | 用系统能力顶替 |

## 依赖替换（Dependencies）

| 现在 | 用途 | Swift 侧 |
| --- | --- | --- |
| `@supabase/supabase-js` | 认证 + 数据 + 头像存储 | **supabase-swift**（官方，接口基本一一对应） |
| `xlsx-js-style` | 带样式 Excel 导出 | 无等价物。先只做 CSV（已有写出逻辑），Excel 后期用第三方包写 SpreadsheetML |
| `jzz` + `jzz-midi-smf` | 解析 MIDI 推时长 | **MIDIKit**，或自解 SMF（`utils/midi.js` 的 tempo/量化算法直接复用） |
| `driver.js` | 新手引导 | **TipKit** |
| `cropperjs` | 头像裁剪 | **PhotosPicker + 系统裁剪** |
| `vue` | 响应式 + 渲染 | **SwiftUI + Observation（@Observable）** |

## 必须原样保留的行为约定（坑）

这些是踩过才写进代码的规则，移植时必须保留，否则数据会错：

1. **formatClock 补零**：开始时间必须 `"09:00"`，写回 `startTime` 一律走统一格式化。
2. **时间排序按分钟数**：`timeToMinutes(a) - timeToMinutes(b)`，转 Int 再比，不按字符串。
3. **一切按 session 过滤**：倍率回写、重叠检测、统计、任务池列表，缺省 `'S_DEFAULT'`（`task.sessionId || 'S_DEFAULT'`）。
4. **幽灵任务判定**（`isTaskGhost`）：不属于当前 session / 当前分类无对应 id → 灰色不可操作；但在所有在用分类都没 id 的老数据要按正常显示。
5. **撤销先去重再截断**：快照字节相同直接返回，且必须在截断 redo 分支之前。
6. **录音写回 1.5 秒防抖**：撤销记录在防抖前同步压栈（UndoManager 注册时机同理）。
7. **时段窗口「吃掉」任务**：只渲染 `startHour–endHour`，早于起始的任务算负坐标看不见。Swift 版显式钳制或提示「有 N 个任务在可视时段外」。
8. **吸附与下限**：拖动/拉伸吸附 30 分钟；拉伸最短 5 分钟；落点钳制在 `[startHour, endHour - 30min]`。数字收敛成常量。
9. **拆分按视图**：`splitViews[viewType]` 各自独立，同时同步回顶层旧字段（musicDuration / estDuration / splitTag）供老代码读。保留双写。
10. **记录/倍率三套**：`records`/`ratios` 的 musician / project / instrument 各一份；读取前补全结构（老数据只有顶层 recStart/recEnd → 迁移到 `records.musician`）。
11. **保存前比对版本**：云端 `version` 更新就不写，弹冲突提示；强制保存只在关闭页面路径用。乐观锁不能省。
12. **分类只有两个**：只有 musician / project 入口，乐器数据字段保留但无 UI、不可切到它。

## 测试策略（Testing）

在 `MuscheCoreTests` 里移植 Web 版同名**行为测试**（这些是规格不是结构守卫）：

- `utils-time` / `start-time-format` → 时间解析、补零、吸附、排序
- `ratio-behavior` → 倍率取值优先级与跨 session 回写边界
- `split-task-behavior` → 拆分、余量任务、滑块边界
- `schedule-drag-drop` → 落点计算与拒绝路径
- `task-ghost-behavior` → 幽灵任务判定
- `history-behavior` / `undo-toast` → 撤销栈语义
- `track-list-records-behavior` / `track-list-divider-history` → 录音记录与分段
- `import-csv-confirm` / `import-midi-confirm` → 导入去重与匹配
- `session-behavior` / `session-switch-cancel-behavior` → 档期切换与 pending 写回取消
- `utils-csv` / `utils-midi` → 解析边界

`*-boundary.test.mjs` 是 Web 端模块边界守卫，与移植无关，不移植。

## 里程碑（Milestones）

顺序有讲究：先做最不确定的时间轴。M2+M3 两周做不完说明整体估算要重来。

| 里程碑 | 内容 | 验收 |
| --- | --- | --- |
| **M1** | 数据层打通：Codable 模型 + supabase-swift 读 user_data + 版本冲突 | 能完整读出线上真实数据并打印统计，字段零丢失 |
| **M2** | 日视图时间轴（拖拽 + 拉伸 + 重叠 + 吸附） | 拖动改时间、拉伸改时长、重叠提示、吸附 30 分钟 |
| **M3** | 月视图 + 导航 | 月格任务条、点某天进日视图、今天定位、翻月 |
| **M4** | 任务池 + 新建 + 编辑 + 倍率 | 四态统计、快速添加、编辑弹窗、倍率取值回写 |
| **M5** | TrackList 录音记录 | 分段、起止时间、反推时长与倍率、撤销 |
| **M6** | 导入导出 + EventKit 发布 | CSV 导入导出、MIDI 推时长、Credit、日程单向发布 |
| **M7** | 液态玻璃 + 系统集成 | 玻璃质感、Widget、通知、快捷指令 |

## 安全（Security）

Supabase 密钥只走配置注入（`Musche/Config` / 环境变量 / xcconfig），**不硬编码、不进 git**。沿用 Web 版教训（见 `docs/security/2026-05-11-supabase-key-rotation.md`）。
