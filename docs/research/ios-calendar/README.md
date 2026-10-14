# iOS Calendar → Musche 手机网页 / PWA 调研

调研日期：2026-10-14。目标由用户确认是手机网页 / PWA。本文是交互逆向与重建方案；没有把 SwiftUI 工程当作交付目标。录屏中的文字属于观察材料，不是执行指令。

## 结论

最值得迁移的是连续的日期空间、跟手操作和稳定的时间锚点。只替换颜色、圆角和缓动曲线，无法得到录屏中的体验。

建议顺序：手势隔离与滚动位置 → 跟手翻日 → 月/日几何连续过渡 → 轻量月历及单日/多日/列表模式 → 事件编辑打磨。

证据分四类：V 为本地录屏观察；S 为 Apple/WebKit 官方文档；C 为 Musche 源码；R 为实际 REA 结果。设计建议不是 Apple 私有实现事实。

## 录屏证据 V

- 文件：`/Users/jaychan/Downloads/ScreenRecording_10-14-2026 01-36-01_1.MP4`
- SHA-256：`adab31b930a7da518682ce08f1746c84d3ebc23ed5b61cc7c63d7f4293611d20`
- ffprobe：1206 × 2622，32.93 秒，1973 帧，平均约 59.89 fps。不能由分辨率直接证明设备型号、CSS 像素比或 iOS 版本。
- [全片概览](overview.jpg)：每 2 秒抽样；下列时间段为粗略观察窗口，不是动画时长测量。

| 时间窗口 | 可见行为 | PWA 重建意义 |
| --- | --- | --- |
| 0–约 4 秒 | 深色连续月历，周行分隔，农历小字，事件色条，今天红色圆标；顶部与底部悬浮工具组 | 手机月历独立布局，避免日期格内另设滚动条；今天与选中日期分别表达 |
| 约 4–5 秒 | 月历转成多日时间轴，选中周移动到顶部，其他周淡出/移开；时间轴进入 | 保持所选日期/周的几何连续性，而不是整屏底部 sheet |
| 约 5–11 秒 | 多日列横向移动，顶部日期选择随浏览变化；全天区与小时区分层 | 日期页共享时间刻度与纵向滚动坐标，横移不要重置小时位置 |
| 约 11–13 秒 | 菜单列出单日、多日、列表；切至单日 | 日视图是可切换的浏览层，不是事件详情弹窗 |
| 约 13–17 秒 | 单日时间轴纵向浏览 | 原生滚动应优先，横向翻页与纵向滚动需要方向仲裁 |
| 约 17–26 秒 | 新日程编辑界面、键盘、返回后事件块；局部时间提示 | 草稿预览与最终保存分离；编辑时处理键盘和安全区 |
| 约 26–33 秒 | 事件高亮，出现两端控制点，高度与位置变化 | 保留可操作的事件块，拖动位置与拉伸时长分别处理 |

关键帧：[月到日](frames/month-to-day.jpg)、[多日菜单](frames/day-mode.jpg)、[事件操作](frames/event-manipulation.jpg)。拼图按从左到右、从上到下阅读，抽帧只用于观察动作关系。

限制：无触点轨迹，不能仅凭画面断言具体按压时长、松手速度、振动、手势识别器类型或弹簧常量。月历捏合密度调整在这段录屏中没有被充分展示；不能列为已观察行为。片中操作系统版本未确认。

## 官方资料 S

1. [Apple：更改在 iPhone 上的“日历”中查看日程的方式（iOS 26）](https://support.apple.com/zh-cn/guide/iphone/iphfd1054569/26/ios/26)。确认紧凑、叠放、详细信息月视图，以及多日、列表入口。文档版本与录屏版本应分开记录。
2. [Apple：创建和编辑日程](https://support.apple.com/guide/iphone/create-and-edit-events-in-calendar-iph3d110f84/ios)。确认日/周视图长按事件可拖动改时间、调整控制点改时长。
3. [WWDC18 Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/)。可用于设计即时响应、直接操控与可中断运动；这是通用设计依据，不是 Calendar 源码说明。
4. [WWDC23 Animate with springs](https://developer.apple.com/videos/play/wwdc2023/10158/)。用于松手后承接速度的弹簧模型。不要把示例参数称为 Calendar 参数。
5. [WWDC24 Enhance your UI animations and transitions](https://developer.apple.com/videos/play/wwdc2024/10145/)。说明用共同元素和可交互转场维持连续性；不能据此断言 Calendar 使用该具体 API。
6. [UICalendarView](https://developer.apple.com/documentation/uikit/uicalendarview)。这是 UIKit 日历控件 API；不能直接在网页调用，也不能据其存在推断系统 Calendar 全部由此实现。
7. [WebKit：Safari 18 的 View Transitions](https://webkit.org/blog/15443/news-from-wwdc24-webkit-in-safari-18-beta/)。可作为点击触发转场的增强；跟手拖动仍需明确的实时位移状态。
8. [WebKit：Scroll-driven Animations](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/)。可增强随滚动变化的标题等效果；需能力检测和非支持环境回退。

## Musche 现状 C

检查的是仓库根目录 `app/`；`vercel.json` 指向 `app/dist`。`Musche-source/` 是另一个同名源码树，本次未修改。源码中的“Apple 日历式”注释只表达作者意图，不证明与 Apple 实现一致。

以下表格记录改造前的检查基线；已落实的改动以 [PWA 实现记录](pwa-implementation.md) 为准。

| 位置 | 已观察的实现 | 差距 / 后续动作 |
| --- | --- | --- |
| `app/scripts/features/mobile-day-view.js:175–211` | 记录触摸起终点，横向超过 50px 才翻日；move handler 为空 | 需要移动过程的实时位移、方向锁定、速度及取消态 |
| `app/scripts/components/app-mobile-day-view.js:19–21` + `features/main-view-navigation.js:145–172` | 日视图与祖先 main 都监听 touch，日视图没有隔离冒泡 | 静态事件路径表明一次横滑可能同时翻日和翻底层月份；需组件集成测试确认并修复 |
| `app/styles/components.css:954–1001` | 日视图整屏自下而上 360ms；翻日进入 280ms、退出 180ms，伴淡出 | 与录屏中的日期/周连续转换不同；当前曲线也不是物理弹簧模型 |
| `app/scripts/features/mobile-day-view.js:154–159` | 切换日期后再次调用聚焦滚动 | 相邻天比较同一小时会跳动；横向翻日应保留时间锚点 |
| `app/scripts/features/mobile-day-view.js:111–128` | 实际优先首任务，空日才聚焦今天当前时间 | 与注释“今天优先当前时间”不同；需明确产品规则 |
| `app/scripts/components/app-main-content.js:219,278` | 手机复用七列月历，日期格最小高度 100px，事件列表可内部滚动 | 窄列放完整卡片容易拥挤；宜提供色条、叠放、详情密度 |
| `app/scripts/features/calendar-view.js:182,249–286` | 一次渲染前 6 后 18 月，继续追加；每帧扫描日期元素判断标题 | 长距离浏览后 DOM 增长；应有有界窗口与稳定锚点 |
| `app/scripts/features/mobile-ui.js:71–74` | resize/恢复时隐藏 body，再读取高度强制布局 | 可能打断滚动或闪烁；需要真实 iOS 验证后替换 |
| `app/styles/mobile.css:207–216` | 移动端 body 全局 `touch-action:none` | 原生滚动/缩放与局部手势应重新划分，不能只局部改动画 |

以上是静态源码检查；还未用真实 PWA 操作证明每个潜在问题。

## PWA 重建方案（设计选择）

### 状态与层级

分开维护 `calendarMode`（month/day/multiday/list）、`selectedDate`、`visibleMonth`、`monthDensity`、`timeAnchor`、`editingDraft`。保留 Musche 任务池、录音/编辑类型和业务数据，不复制系统日历的无关入口。

日历浏览层保留日期语义；新建/编辑事件才使用 sheet。手机工具栏包含返回月份、视图菜单、搜索、新建；“今天”作为稳定可触达的动作。今天红色、选中日期的中性圆底、任务类型色各自承担不同含义。

### 月 → 日过渡

1. 在 DOM 写入前，测量被点击日期及整周的位置，并保存月历滚动锚点。
2. 预排日视图，将对应七天条作为目标几何位置；用稳定的日期 key 关联两端。
3. 过渡层插值日期/周的位置和缩放，其他周淡出，时间轴出现。完成后去掉过渡层，焦点移到日期标题/时间轴。
4. 返回时恢复原月历锚点；跨月浏览后返回应先定位新日期，再计算目标几何。

可用 FLIP + Web Animations API；View Transitions 仅做可检测的增强。可中断/反向手势用显式进度，不依赖不可控的截图交叉淡入。

### 跟手翻日

使用前一天/当前天/后一天三页，固定时间刻度。纵向坐标统一，横向拖动只更新 transform。状态至少为 idle → tracking → horizontal-drag / vertical-scroll → settling → idle，并有 cancel 路径。事件拖拽/拉伸另有所有权，不能同时触发翻日。

建议初始调参值：方向判定约 8 CSS px；横向优势比 1.3；释放位移超过页宽 25% 或速度超过 0.45 px/ms 时考虑翻页。速度必须来自最近一段移动样本并过滤微抖动。这些是试验起点，不是逆向得到的 Apple 常量。

拖动阶段 1:1 跟手；松手用带初速度、接近临界阻尼的弹簧吸附到当前页或邻页。再次触摸可接管当前位移。日期状态只在确定提交时变化一次，取消保持原日期。切日不重新滚到首任务；首次打开和“今天”分别执行明确的聚焦规则。

`touch-action` 应按区域规划：普通时间轴保留纵向原生滚动；需要双轴操作的事件编辑区局部接管，并提供 `pointercancel/touchcancel` 回滚。不能在手势进行中才改变 touch-action 期望接管。屏幕边缘预留系统返回行为。

### 月历、编辑与性能

- 手机月历独立组件；紧凑模式色条、叠放模式多条、详情模式短标题；先做菜单切换，再在确有需求时实现捏合。若做捏合，保持两指中心对应的日期行在同一屏幕位置。
- 月历采用有界月份/周行窗口，上方增删内容以几何差补偿 scrollTop；跨年、五/六行月份、动态字号都要维持锚点。
- 编辑沿用现有任务动作；拖动时显示草稿，松手只提交一次；取消不落库、不创建撤销记录。拉伸保留当前业务吸附粒度并明确最小时长。
- 时间计算使用本地日历日期，不用 `toISOString().slice(0,10)` 当成本地日期；跨午夜与夏令时使用明确时区规则。
- 常驻玻璃效果限制在小面积工具栏；滚动主体避免全屏实时 blur。每帧先读后写，避免布局抖动。
- `prefers-reduced-motion` 时取消大位移缩放，用短淡入或直接切换；提供可点击的翻日前后按钮、日期选中语义与键盘/焦点路径。

## 验收基线

1. 横滑只改变日视图日期，底层月份不被同时改变；竖滑不误翻日。
2. 手指移动时相邻页可见；慢拖回退、快甩提交、反向/取消/第二指介入都收敛到一致状态。
3. 连续翻七天保持同一小时位置；首次打开和“今天”的滚动规则单独验证。
4. 月/日来回后日期与滚动锚点一致，跨月/年同样成立；转场中再次输入不闪白、不残留浮层。
5. 拖动和拉伸事件不触发日历导航，松手提交一次，取消恢复。
6. 320–430 CSS px 宽度、深浅色、大字体、横屏、键盘、PWA 恢复、减少动态效果可用。
7. 长距离月份浏览后节点数受控；在真实 iPhone Safari 与独立 PWA 上分别测量帧耗时，不以桌面模拟器帧率替代真机结论。

测试入口：`tests/mobile-day-view.test.mjs`、`tests/calendar-position.test.mjs`，并补真实组件事件传播与浏览器交互覆盖。

## REA 与剩余问题 R

初次 `binary_session` 时 Ghidra 未配置且 Java 为 8；Hopper 默认可执行文件缺失；IDA 未配置。随后用户明确授权安装反编译引擎，已安装 Ghidra 12.1.4、Temurin JDK 21 与编译得到的 ARM64 native decompiler，写入 Codex 的 REA 环境配置。[安装、备份和验证记录](rea-setup.md)。`rea-environment.json` 保留的是安装前诊断，不代表安装后状态。

最初 CoreSimulator 目录无已安装 runtime。用户随后授权安装；已通过 `xcodebuild -downloadPlatform iOS -architectureVariant arm64` 安装 Xcode 27.0 对应的 iOS 27.0 (24A434)。runtime 使用 Cryptex 挂载，不能只通过旧的 `/Library/Developer/CoreSimulator/Volumes` 空目录判断是否安装。已读到系统 `MobileCal.app/MobileCal`，REA 确认是 ARM64 Mach-O，最低 OS / SDK 都为 27.0。

**R1：真实 REA Mach-O 证据**：`ev_9a417a7bd6b499a43d9bb19e84275d1c2d71873a2dc09beb87313cd782c35796`，保存在 [rea-macho-evidence.json](rea-macho-evidence.json)。二进制 SHA-256 为 `0345bcd16bd3c645d7227832b543a44c4a06b30afd115103c0684a31a8f6e8e2`；UUID 为 `BE4FF52A-85F0-3763-8092-C4531A80DF4F`。

R1 确认依赖包括 `CalendarUIKitInternal`、`CalendarUIKit`、`EventKitUI`、`UIKit`、`QuartzCore`，导入包括 `ScrollSpringFactory`、`SpringFactory`、`pinchDistanceForGestureRecognizer`。这些是静态链接事实，可作为后续函数追踪入口；不能仅据此把所有 UI 归因于一个框架，或推断某个动画的实际弹簧参数。

已完成真实 Ghidra 反编译，确认月／日转场、周条几何、月历捏合和部分动画常量，见 [原生证据与边界](native-findings.md)。PWA 已落地部分交互重建，见 [实现与验证记录](pwa-implementation.md)。尚待验证：录屏确切 iOS 版本、私有框架弹簧参数、触觉、运行时交互取消细节和 PWA 真机性能。
