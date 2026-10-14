# MobileCal 实现逆向：已验证发现

目标：iOS 27.0 (24A434) 模拟器系统 Calendar，ARM64。分析器：REA 6.4.0 + Ghidra 12.1.4。分析对象身份见主报告 R1。本报告对应模拟器产物；没有证明其与用户录屏版本或真机二进制完全相同。

完整证据：[REA 原始证据包（gzip）](rea-native-evidence.json.gz)；[索引及解压后 SHA-256](evidence-index.json)。`functions/` 是从完整记录派生的阅读视图，保留方法、伪代码、汇编及限制，不是另一次分析。伪代码含 Objective-C 调用约定和浮点寄存器恢复误差，不应直接移植成产品代码。

## 1. 月／日切换由专用转场对象组织

`CompactMonthDayAnimator::animateTransition:`（`0x10012abd4`）取出源/目标控制器，强制目标布局，取得选中日期，加入独立 transitionView，准备几何与日期条，然后按 reverse 分派到 `animateToDayWithCompletion:` 或 `animateToMonthWithCompletion:`。

证据：`ev_0fe465b36d401baffb65082d556801049c84c349fd296b8ba7c5dc86f8acd244`。[伪代码](functions/month-day-animator.txt)。多日有独立 `CompactMonthMultiDayAnimator::animateTransition:`（`0x1000b8694`），同样使用 prepare/animate 流程；该入口给 allDayView/topLabelsContainer 传空值，说明不能简单假定单日、多日内部所有图层都相同。证据：`ev_4783505292c55250d672fb93c93899e5d352409ffd9bb820d35822560037946d`。

**PWA 推导**：做一个负责日期、源/目标几何和完成清理的转场协调模块。不要把跨视图状态与事件编辑 sheet 混在同一个布尔开关中。

## 2. 日期条保持月布局与日布局两套几何

`MonthDayTransitionView::prepareTransitionScrubberWithSelectedDate:...`（`0x10009a4cc`）读取选中周的 cell frames、day scrubber cell size 和坐标转换结果，分别设置 dayFrame、monthFrame、monthCellFrames、monthRowHeight、selectedIndex、todayIndex、monthBreakIndex。它还获取月历事件/摘要的图像快照，保存对应 frame。

证据：`ev_0820a1224b55de40bf0933f049e026efd747a6332ebe96c363eacaf4a6f52125`。[伪代码](functions/transition-prepare.txt)。`MonthDayNavigationTransitionView::_setToDayStateAnimated:` 调用布局 block 并使用 SpringFactory；布局 block `0x1000ea040` 将日期 cell 排入日布局、调整圆形尺寸、隐藏月摘要快照，并区分今天与选中日期。

证据：`ev_2686588a3d69c1a78aff200dbd04efd73629e9b69e0d036be7f29c138a3b6845`、`ev_2e3395c48a54f99725657a51a5289ce7c4260a3f464b2e22e3eb37a4a15c15e4`。[日期布局](functions/day-cell-layout.txt)。

**PWA 推导**：月格与顶部周条应以日期 key 对应；转场前测量两端，单独动画位置、圆形大小、标签与事件摘要。复杂事件列表可用轻量静态副本承接过渡，避免每帧重新排版全部事件。

## 3. 多个区域协调运动，使用弹簧工厂

`MonthDayTransitionView::animateToDayWithCompletion:`（`0x10009b6f4`）出现以下实际调用：

- 检查已有 `_animating` 并调用 `_haltAnimations`。
- `enterAnimationSplitStateWithCutOutArea:topBoundary:`、`setSplitStateOpen:`，在月历切出日期条所在区域。
- 隐藏原 day scrubber，显示用于过渡的 scrubber，调用 `animateToDayLayout`。
- 对全天区、顶部标签和底部日视图分别处理 alpha / position。
- `SpringFactory::sharedFactory` 与 `_springAnimationDuration`，随后调用 UIView 动画入口。

证据：`ev_67df5a2206b430ea100693de9b497265adb8b12157b2391f2ebd0a788300ba0d`。[伪代码](functions/month-to-day.txt)。`_haltAnimations` 包含递归移除 layer 动画，以及排除导航栏 layer 的分支；证据 `ev_3ab919b1d10ff8df2ae96490706844429bf8342e3556d178d4dd2f570ed4184f`。这证明存在停止动画路径，但没有单独证明所有交互中断都连续保持速度。

**PWA 推导**：月历背景区域、选中周、日时间轴分层处理；转场要有清理/接管策略，不能只把新页 `translateY(100%)` 推上来。

## 4. 捏合是布局变化、锚点补偿和档位吸附

`CompactWidthMonthViewController::_monthScrollerPinched:`（`0x100087cf8`）按 recognizer 状态分支：开始时设置 `_eventLoadingSuspendedForPinching`，记录初始距离与 scale；变化时计算 scale 比率，限制到 minimumWeekScale/maximumWeekScale，并根据 `hideDaySummariesWithScale:`、`isNarrowWithScale:` 改变展示。它更新 pinch views 的几何、content size 及 content offset；结束路径查找 `nearestSnapBoundaryForScale:` 并执行 spring 动画。存在 UIImpactFeedbackGenerator 调用，但没有真机触觉强度/主观效果验证。

证据：`ev_b627080331535af81cd0c9b7173f284ee41c4adb739497742df5141902b56bd8`。[伪代码](functions/month-pinch.txt)。`applySizeToPinchView:compressed:snapToBoundary:`（`0x100086908`）先计算当前周内相对位置，再改变周尺寸、content size 并恢复 offset；证据 `ev_c1afcdaff009102fa2686a05a432cf655d1e1b2a842eaae34eaabd9fc33ef7b6`。[布局伪代码](functions/pinch-layout.txt)。精确 CGPoint/CGRect 表达式部分受反编译类型恢复限制。

**PWA 推导**：捏合中心所指日期保持在屏幕原位；只缩放字形会破坏布局。布局模式切换期间保持事件数据快照，结束时再处理待合并更新。网页不能假定可直接复用原生触觉 API。

## 5. 可以确认的参数及其边界

| 参数 | 静态证据 | 可解释范围 |
| --- | --- | --- |
| 常规月／日转场时长返回值 0.6 秒 | `MonthDayTransitionView::animationDuration`，`0x10009a3f4`，汇编先比较 `_UIAnimationDragCoefficient()` 与 1.5，再从 `0x1001e6690` 取 double | 是该方法的返回值，不代表每个子动画同为 0.6 秒，也不是录屏实测时长 |
| 另一分支返回 0.91 秒 | 同表第二个 double，系数 > 1.5 选择 | 不是通用“慢速模式手感”规格；运行环境触发条件仍未复现 |
| 月历捏合结束吸附 springDuration 0.25 秒；bounce、initialSpringVelocity、delay 均为 0 | `0x100087e98` 设置 d0=0.25；后续 d1/d2/d3 清零，`0x100087eb8` 调用已解析的 spring API | 仅该结束路径；不应套给翻日、月／日转场或事件拉伸 |

duration 方法证据：`ev_e4ad94963c6a740789e80da074a66f3cbf0a0104cc32d1123f0e95cf72551dc7`。数据读取证据：`ev_44257d45ec07b5419d74091677483b8bb29a34908646cf1d87713d05dbf04c6b`；16 字节 `333333333333e33f1f85eb51b81eed3f`，按 little-endian float64 解码为 0.6、0.91。原始数据与汇编阅读视图均已保存。

## 本轮范围与未知项

已完成：录屏分段、Apple 官方功能/动效资料、PWA 代码差距、模拟器 runtime 安装、Ghidra 配置与实际函数反编译、月／日和多日转场入口、日期几何重建、月历捏合与吸附参数。分析会话已导出并关闭。

部分完成：单日/多日横向翻页、事件拖动/拉伸已有录屏行为与 PWA 实现建议，但尚未追完其私有框架内部代码；SpringFactory 质量/刚度/阻尼具体值也未从框架解析。

未完成：录屏系统版本确认、模拟器 GUI 运行验证、真机运行时调用追踪、实际触点/速度和触觉测量、PWA UI 改造与真机验收。本轮没有修改生产日历代码，不能称为已完成 iOS Calendar 体验复刻。
