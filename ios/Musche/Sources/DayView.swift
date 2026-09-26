import SwiftUI
import MuscheCore

/// M2/M3：日视图。作为月视图之上的一层「面板」存在（不是 sheet）——
/// 打开时月视图把选中日那一行滚到顶部，日面板从底部滑出盖住其余月格子——参考 Apple 日历的月→日转场。
struct DayPane: View {
    let model: AppModel
    /// 与月视图共享：让选中周那 7 个日期数字从月格子连贯升到顶部周条。
    let namespace: Namespace.ID
    @Binding var dateStr: String
    let onClose: () -> Void

    @State private var showConflict = false
    @State private var recordTarget: Schedule?
    @State private var showRecord = false
    @State private var publishMessage: String?
    @State private var showPublishResult = false
    @State private var notifyMessage: String?
    @State private var showNotifyResult = false
    /// 翻天方向：+1 下一天从右滑入，-1 上一天从左滑入。
    @State private var slideDirection = 1
    /// 下拉关闭手势的实时位移。
    @State private var pullDown: CGFloat = 0
    /// header + 周条的高度：升起的时间轴面要从它们下方开始
    @State private var topAreaHeight: CGFloat = 110

    var body: some View {
        ZStack(alignment: .top) {
            // 时间轴是一整块不透明的「面」，从屏幕下边缘升起，一路盖住下方的月格子。
            // 不做淡入——淡入就成了闪现，升起才连贯。
            VStack(spacing: 0) {
                // 顶部留出 header + 周条的高度，让这块面从它们下方开始
                Color.clear
                    .frame(height: topAreaHeight)
                    .allowsHitTesting(false)
                timeline
                    .background(DayPaneBackground())
            }
            .transition(.move(edge: .bottom))

            // 顶部：与月视图同色、立刻就位（所以看不出「出现」），
            // 周条的位置由 matchedGeometry 从月格子插值过来，视觉上就是那一行日期升了上来。
            VStack(spacing: 0) {
                header
                weekStrip
                Divider().overlay(Color.white.opacity(0.08))
            }
            // 背景延伸到状态栏，否则月格子会从顶部露出来
            .background(DayPaneBackground().ignoresSafeArea(edges: .top))
            // 下拉关闭只挂在顶部这一块：挂在整个面板上会让「拖任务块」「滚时间轴」误关日视图
            .gesture(pullToDismiss)
            .onGeometryChange(for: CGFloat.self) { $0.size.height } action: { height in
                if abs(height - topAreaHeight) > 0.5 { topAreaHeight = height }
            }
        }
        .offset(y: pullDown)
        .alert("时间冲突", isPresented: $showConflict) {
            Button("好", role: .cancel) {}
        } message: {
            Text("该时间段已有同类型的其他安排。")
        }
        .alert("发布到日历", isPresented: $showPublishResult) {
            Button("好", role: .cancel) {}
        } message: {
            Text(publishMessage ?? "")
        }
        .alert("开启提醒", isPresented: $showNotifyResult) {
            Button("好", role: .cancel) {}
        } message: {
            Text(notifyMessage ?? "")
        }
        .sheet(isPresented: $showRecord) {
            if let task = recordTarget {
                RecordSheet(model: model, task: task)
            }
        }
    }

    // MARK: - 顶栏：返回月份 + 当天日期 + 操作

    private var header: some View {
        HStack(spacing: 8) {
            Button(action: close) {
                HStack(spacing: 3) {
                    Image(systemName: "chevron.left").font(.system(size: 15, weight: .semibold))
                    Text(monthLabel).font(.system(size: 17))
                }
            }
            .tint(Theme.accent)

            Spacer(minLength: 8)

            Text(dayLabel)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Color(white: 0.62))
                .lineLimit(1)

            Menu {
                Button { model.undo() } label: { Label("撤销", systemImage: "arrow.uturn.backward") }
                    .disabled(!model.canUndo)
                Button { model.redo() } label: { Label("重做", systemImage: "arrow.uturn.forward") }
                    .disabled(!model.canRedo)
                Divider()
                ShareLink(item: model.exportCSV()) { Label("导出 CSV", systemImage: "square.and.arrow.up") }
                Button { publishToCalendar() } label: { Label("发布到日历", systemImage: "calendar.badge.plus") }
                Button { scheduleNotifications() } label: { Label("开启提醒", systemImage: "bell.badge") }
            } label: {
                Image(systemName: "ellipsis.circle").font(.system(size: 17))
            }
            .tint(Theme.accent)
        }
        .padding(.horizontal, 12)
        .padding(.top, 6)
        .padding(.bottom, 8)
    }

    // MARK: - 周日期条（月格子飞上来的落点）

    private var weekStrip: some View {
        HStack(spacing: 0) {
            ForEach(CalendarMath.weekDays(around: dateStr), id: \.fullDate) { day in
                Button {
                    select(day.fullDate)
                } label: {
                    VStack(spacing: 4) {
                        Text(day.weekdayName)
                            .font(.system(size: 11))
                            .foregroundStyle(Color(white: 0.45))
                        Text("\(day.dayNum)")
                            .font(.system(size: 17, weight: day.fullDate == dateStr ? .semibold : .regular))
                            .foregroundStyle(dayNumberColor(day))
                            .frame(width: 32, height: 32)
                            .background(dayNumberBackground(day), in: Circle())
                            .matchedGeometryEffect(id: "day-\(day.fullDate)", in: namespace, properties: .position, anchor: .center)
                        Circle()
                            .fill(model.tasks(for: day.fullDate).isEmpty ? .clear : Theme.accent)
                            .frame(width: 4, height: 4)
                    }
                    .frame(maxWidth: .infinity)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.bottom, 8)
        .contentShape(Rectangle())
        // 在周条上左右滑翻天：不放在时间轴上，否则会抢走任务块的拖动手势
        .gesture(swipeBetweenDays)
    }

    private func dayNumberColor(_ day: CalendarMath.WeekStripDay) -> Color {
        if day.fullDate == dateStr { return .white }
        return day.isToday ? .red : .white
    }

    private func dayNumberBackground(_ day: CalendarMath.WeekStripDay) -> Color {
        guard day.fullDate == dateStr else { return .clear }
        return day.isToday ? .red : Theme.accent
    }

    // MARK: - 时间轴（翻天时只滑这一层，刻度不动）

    private var timeline: some View {
        DayTimeline(
            model: model,
            dateStr: dateStr,
            onConflict: { showConflict = true },
            onOpenRecord: { task in
                recordTarget = task
                showRecord = true
            }
        )
        .id(dateStr)
        .transition(.asymmetric(
            insertion: .move(edge: slideDirection > 0 ? .trailing : .leading).combined(with: .opacity),
            removal: .move(edge: slideDirection > 0 ? .leading : .trailing).combined(with: .opacity)
        ))
    }

    // MARK: - 手势

    /// 左右滑翻天（挂在周日期条上）。
    private var swipeBetweenDays: some Gesture {
        DragGesture(minimumDistance: 24)
            .onEnded { value in
                let dx = value.translation.width
                let dy = value.translation.height
                guard abs(dx) > abs(dy) * 1.5, abs(dx) > 50 else { return }
                select(CalendarMath.shiftDay(dateStr, by: dx < 0 ? 1 : -1))
            }
    }

    /// 顶栏/周条区域下拉关闭。
    private var pullToDismiss: some Gesture {
        DragGesture(minimumDistance: 12)
            .onChanged { value in
                guard value.translation.height > 0, abs(value.translation.width) < 60 else { return }
                pullDown = min(value.translation.height, 160)
            }
            .onEnded { value in
                if value.translation.height > 90 {
                    close()
                } else {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.85)) { pullDown = 0 }
                }
            }
    }

    private func select(_ target: String) {
        guard target != dateStr else { return }
        slideDirection = target > dateStr ? 1 : -1
        withAnimation(.spring(response: 0.32, dampingFraction: 0.86)) {
            dateStr = target
        }
    }

    private func close() {
        pullDown = 0
        onClose()
    }

    // MARK: - 系统集成

    private func publishToCalendar() {
        Task {
            let publisher = CalendarPublisher()
            do {
                let count = try await publisher.publish(
                    tasks: model.tasks,
                    sessionId: model.currentSessionId,
                    sessionName: model.currentSessionName,
                    titleFor: { TaskDisplay.title(for: $0, settings: model.settings) }
                )
                publishMessage = "已发布 \(count) 条日程到系统日历"
            } catch {
                publishMessage = error.localizedDescription
            }
            showPublishResult = true
        }
    }

    private func scheduleNotifications() {
        Task {
            let scheduler = NotificationScheduler()
            do {
                let count = try await scheduler.schedule(
                    tasks: model.tasks,
                    sessionId: model.currentSessionId,
                    titleFor: { TaskDisplay.title(for: $0, settings: model.settings) }
                )
                notifyMessage = "已为 \(count) 条日程设置提醒"
            } catch {
                notifyMessage = error.localizedDescription
            }
            showNotifyResult = true
        }
    }

    // MARK: - 文案

    private var monthLabel: String {
        let parts = dateStr.split(separator: "-").map(String.init)
        guard parts.count >= 2, let m = Int(parts[1]) else { return "返回" }
        return "\(m)月"
    }

    private var dayLabel: String {
        let parts = dateStr.split(separator: "-").map(String.init)
        guard parts.count == 3, let y = Int(parts[0]), let m = Int(parts[1]), let d = Int(parts[2]) else {
            return dateStr
        }
        var comps = DateComponents()
        comps.year = y
        comps.month = m
        comps.day = d
        let date = Calendar.current.date(from: comps) ?? Date()
        let wd = CalendarMath.weekdayNames[Calendar.current.component(.weekday, from: date) - 1]
        return "\(y)年\(m)月\(d)日 周\(wd)"
    }
}

/// 面板底：不透明到足以盖住月视图，同时保留一点玻璃感。
private struct DayPaneBackground: View {
    var body: some View {
        ZStack {
            Color(red: 0.055, green: 0.055, blue: 0.08)
            Rectangle().fill(.ultraThinMaterial).opacity(0.6)
        }
        .ignoresSafeArea(edges: .bottom)
        // 背景延伸到底部安全区只是为了铺色；不关掉命中测试的话，
        // 它会盖住 tab bar 的触摸区域，底部两个 tab 就点不动了。
        .allowsHitTesting(false)
    }
}

/// 时间轴的固定坐标系名字：拖动/拉伸都在这个空间里算位移，
/// 免得手势挂在会移动的块上、位移被自己带偏。
private let timelineSpace = "musche.dayTimeline"

// MARK: - 时间轴本体

private struct DayTimeline: View {
    let model: AppModel
    let dateStr: String
    let onConflict: () -> Void
    let onOpenRecord: (Schedule) -> Void

    /// 每分钟像素（与 Web 版 pxPerMin 语义一致）。
    private let pxPerMin: Double = 2.0
    private let gutter: CGFloat = 56

    /// 拖拽中的任务：整个时间轴只允许一个，避免多块同时响应造成抖动。
    @State private var activeDragId: String?
    /// 选中的任务：选中后才出现左侧抓手和底部拉伸条，再点一次（或点空白处）取消。
    /// 不做「长按进入拖动」——长按结束事件在 SwiftUI 里并不可靠，
    /// 一旦漏掉块就永远停在拖动态，时间轴也跟着滚不动了。
    @State private var selectedId: String?
    /// 待确认删除的时间块
    @State private var deleteTarget: Schedule?

    // 把手拖到上下边缘时自动滚动（Apple 日历一样）需要的几个量
    /// 可编程滚动的位置（iOS 18 的 ScrollPosition，可按像素滚）
    @State private var scrollPosition = ScrollPosition()
    /// 当前内容偏移 / 可视高度 / 内容高度，从 scroll geometry 实时读回
    @State private var scrollY: CGFloat = 0
    @State private var viewportHeight: CGFloat = 0
    @State private var contentHeight: CGFloat = 0
    /// 时间轴在屏幕上的位置，用来判断手指是不是进了上下边缘触发区
    @State private var viewportFrame: CGRect = .zero
    /// 手指当前的屏幕 y（拖动中才有值）
    @State private var dragPointY: CGFloat?
    /// 本次拖动里自动滚动累计走过的像素——要补给任务块，
    /// 否则手指不动、内容在滚，块会留在原地不跟手
    @State private var autoScrollOffset: Double = 0
    @State private var autoScrollSpeed: Double = 0
    @State private var autoScrollTimer: Timer?

    /// 上下各留这么宽的触发区；越靠边滚得越快
    private let autoScrollZone: CGFloat = 90
    private let autoScrollMaxSpeed: Double = 420   // px/s

    private var tasks: [Schedule] { model.tasks(for: dateStr) }
    private var startMinutes: Int { model.settings.startHour * 60 }
    private var endMinutes: Int { model.settings.endHour * 60 }
    private var timelineHeight: Double { Double(endMinutes - startMinutes) * pxPerMin }

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                ZStack(alignment: .topLeading) {
                    // 刻度用真实布局（每小时一行）：这样 scrollTo 能按小时精确定位
                    VStack(spacing: 0) {
                        ForEach(model.settings.startHour...model.settings.endHour, id: \.self) { hour in
                            HourRow(hour: hour, gutter: gutter, isLast: hour == model.settings.endHour)
                                .frame(height: hour == model.settings.endHour ? 1 : 60 * pxPerMin)
                                .id("hour-\(hour)")
                        }
                    }
                    // 点空白处取消选中
                    .contentShape(Rectangle())
                    .onTapGesture { selectedId = nil }

                    ForEach(tasks, id: \.scheduleId) { task in
                        TaskBlock(
                            task: task,
                            title: TaskDisplay.title(for: task, settings: model.settings),
                            pxPerMin: pxPerMin,
                            startHour: model.settings.startHour,
                            endHour: model.settings.endHour,
                            isAnotherDragging: activeDragId != nil && activeDragId != task.scheduleId,
                            isSelected: selectedId == task.scheduleId,
                            autoScrollOffset: autoScrollOffset,
                            onDragStateChange: { dragging in
                                activeDragId = dragging ? task.scheduleId : nil
                                if dragging {
                                    autoScrollOffset = 0
                                } else {
                                    dragPointY = nil
                                    stopAutoScroll()
                                }
                            },
                            onDragPointChange: { dragPointY = $0 },
                            onCommit: { updated in commit(updated) },
                            onToggleSelect: {
                                selectedId = selectedId == task.scheduleId ? nil : task.scheduleId
                            },
                            onOpenDetail: { onOpenRecord(task) },
                            onDelete: { deleteTarget = task }
                        )
                        // 别的日程的任务只做灰色只读展示（Web 版的「幽灵任务」），
                        // 免得在 A 日程里误改到 B 日程的安排。
                        .opacity(model.belongsToCurrentSession(task) ? 1 : 0.35)
                        .allowsHitTesting(model.belongsToCurrentSession(task))
                        // 不要在这里给固定高度：拉伸时块自身会变高，父框固定会让它居中溢出，
                        // 表现就是「上下同时变长」。高度由 TaskBlock 自己决定，顶部对齐由 ZStack 保证。
                        .padding(.leading, gutter)
                        .padding(.trailing, 8)
                        .offset(y: DayViewMath.taskTopPx(startTime: task.startTime, startHour: model.settings.startHour, pxPerMin: pxPerMin))
                    }

                    if let nowTop, let nowLabel {
                        NowLine(label: nowLabel, gutter: gutter)
                            .offset(y: nowTop)
                            .allowsHitTesting(false)
                    }
                }
                .frame(maxWidth: .infinity, minHeight: timelineHeight, alignment: .topLeading)
                .padding(.bottom, 40)
                // 拖动/拉伸都按这个固定坐标系算位移。用默认的 .local 会出事：
                // 手势挂在会跟着动的块上，块一动位移就被自己带偏，表现就是抽搐。
                .coordinateSpace(.named(timelineSpace))
            }
            // 拖动任务块时锁住纵向滚动，避免手势打架造成的抽搐
            // （自动滚动是程序触发的，不受这个开关影响）
            .scrollDisabled(activeDragId != nil)
            .scrollPosition($scrollPosition)
            .onScrollGeometryChange(for: ScrollGeometry.self) { $0 } action: { _, geo in
                scrollY = geo.contentOffset.y
                viewportHeight = geo.containerSize.height
                contentHeight = geo.contentSize.height
            }
            .onGeometryChange(for: CGRect.self) { $0.frame(in: .global) } action: { viewportFrame = $0 }
            .onChange(of: dragPointY) { _, _ in updateAutoScroll() }
            .onDisappear { stopAutoScroll() }
            .confirmationDialog(
                "删除这个时间块？",
                isPresented: Binding(get: { deleteTarget != nil }, set: { if !$0 { deleteTarget = nil } }),
                titleVisibility: .visible
            ) {
                Button("删除", role: .destructive) {
                    if let target = deleteTarget {
                        model.deleteTask(id: target.scheduleId)
                        selectedId = nil
                    }
                    deleteTarget = nil
                }
                Button("取消", role: .cancel) { deleteTarget = nil }
            } message: {
                Text("只删日历上的安排，任务池里的曲目会保留。")
            }
            .onAppear { scrollToFocus(proxy) }
            .onChange(of: dateStr) { _, _ in
                selectedId = nil
                scrollToFocus(proxy)
            }
        }
    }

    // MARK: - 拖到边缘自动滚动

    /// 手指位置变了就重算滚动方向和速度：进了上/下触发区就开定时器，出了就停。
    private func updateAutoScroll() {
        guard let y = dragPointY, viewportFrame.height > 0 else {
            stopAutoScroll()
            return
        }
        let top = viewportFrame.minY + autoScrollZone
        let bottom = viewportFrame.maxY - autoScrollZone

        if y < top {
            let depth = min(1, max(0, (top - y) / autoScrollZone))
            autoScrollSpeed = -depth * autoScrollMaxSpeed
        } else if y > bottom {
            let depth = min(1, max(0, (y - bottom) / autoScrollZone))
            autoScrollSpeed = depth * autoScrollMaxSpeed
        } else {
            stopAutoScroll()
            return
        }
        startAutoScroll()
    }

    private func startAutoScroll() {
        guard autoScrollTimer == nil else { return }
        // 必须注册到 .common 模式：手指按住时 runloop 处于 tracking 模式，
        // scheduledTimer 默认只在 .default 模式跑，一次都不会触发。
        let timer = Timer(timeInterval: 1.0 / 60.0, repeats: true) { _ in
            stepAutoScroll()
        }
        RunLoop.main.add(timer, forMode: .common)
        autoScrollTimer = timer
    }

    private func stopAutoScroll() {
        autoScrollTimer?.invalidate()
        autoScrollTimer = nil
        autoScrollSpeed = 0
    }

    private func stepAutoScroll() {
        let maxOffset = max(0, contentHeight - viewportHeight)
        let target = min(maxOffset, max(0, scrollY + autoScrollSpeed / 60.0))
        let applied = target - scrollY
        guard applied != 0 else { return }   // 已经到头就别再空转
        scrollY = target
        scrollPosition.scrollTo(y: target)
        // 滚了多少就补给正在拖的块，让它继续跟着手指走
        autoScrollOffset += Double(applied)
    }

    /// 打开/翻天后落在「有内容的地方」：首个任务所在小时，其次当前时刻，最后 9 点。
    private func scrollToFocus(_ proxy: ScrollViewProxy) {
        let hour = focusHour
        DispatchQueue.main.async {
            proxy.scrollTo("hour-\(hour)", anchor: .top)
        }
    }

    private var focusHour: Int {
        let lower = model.settings.startHour
        let upper = max(lower, model.settings.endHour - 4)

        if let first = tasks.first, let minutes = TimeMath.timeToMinutes(first.startTime) {
            return min(max(lower, minutes / 60 - 1), upper)
        }
        if dateStr == Format.formatYMD(Date()) {
            let nowHour = Calendar.current.component(.hour, from: Date())
            return min(max(lower, nowHour - 1), upper)
        }
        return min(max(lower, 9), upper)
    }

    /// 落点：先查重叠，冲突则不写回并提示（块会弹回原位）。
    private func commit(_ updated: Schedule) {
        let type = ScheduleMath.taskType(of: updated)
        let conflict = ScheduleMath.checkOverlap(
            date: updated.date,
            startTime: updated.startTime,
            durationStr: updated.estDuration,
            excludeId: updated.scheduleId,
            checkType: type,
            tasks: model.tasks,
            currentSessionId: model.currentSessionId
        )
        if conflict {
            UINotificationFeedbackGenerator().notificationOccurred(.warning)
            onConflict()
        } else {
            model.updateTask(updated)
        }
    }

    private var nowTop: Double? {
        guard dateStr == Format.formatYMD(Date()) else { return nil }
        let cal = Calendar.current
        let minutes = cal.component(.hour, from: Date()) * 60 + cal.component(.minute, from: Date())
        return DayViewMath.nowIndicatorTop(nowMinutes: minutes, startHour: model.settings.startHour, endHour: model.settings.endHour, pxPerMin: pxPerMin)
    }

    private var nowLabel: String? {
        guard nowTop != nil else { return nil }
        let cal = Calendar.current
        return TimeMath.formatClock(cal.component(.hour, from: Date()), cal.component(.minute, from: Date()))
    }
}

// MARK: - 小时刻度

private struct HourRow: View {
    let hour: Int
    let gutter: CGFloat
    let isLast: Bool

    var body: some View {
        ZStack(alignment: .topLeading) {
            // 整点线 + 左侧时刻（时刻文字压在线上，与系统日历一致）
            VStack(spacing: 0) {
                HStack(spacing: 0) {
                    Text(TimeMath.formatClock(hour))
                        .font(.system(size: 11))
                        .foregroundStyle(Color(white: 0.42))
                        .frame(width: gutter - 10, alignment: .trailing)
                        .padding(.trailing, 10)
                        .offset(y: -6)
                    Rectangle().fill(.white.opacity(0.10)).frame(height: 0.5)
                }
                Spacer(minLength: 0)
            }

            if !isLast {
                // 半点虚线
                VStack(spacing: 0) {
                    Spacer(minLength: 0)
                    Rectangle().fill(.white.opacity(0.05)).frame(height: 0.5)
                        .padding(.leading, gutter)
                    Spacer(minLength: 0)
                }
            }
        }
    }
}

// MARK: - 任务块

private struct TaskBlock: View {
    let task: Schedule
    let title: String
    let pxPerMin: Double
    let startHour: Int
    let endHour: Int
    let isAnotherDragging: Bool
    let isSelected: Bool
    /// 自动滚动累计走过的像素（父层给），要叠进位移里，块才会跟着一起走
    let autoScrollOffset: Double
    let onDragStateChange: (Bool) -> Void
    /// 手指的屏幕 y，父层用它判断要不要自动滚动；松手传 nil
    let onDragPointChange: (CGFloat?) -> Void
    let onCommit: (Schedule) -> Void
    let onToggleSelect: () -> Void
    let onOpenDetail: () -> Void
    let onDelete: () -> Void

    /// 手指本身的位移（屏幕坐标系，不含自动滚动那部分）
    @State private var rawTranslation: Double = 0
    @State private var isDragging = false
    @State private var isResizing = false

    /// 拖动中的实时位移，已吸附到 30 分钟（所以块是「一格一格」走的，不会跟着手指抖）。
    /// = 手指位移 + 自动滚动位移，两者都要算进去。
    private var dragMinutes: Int {
        guard isDragging else { return 0 }
        return snapMinutes(from: rawTranslation + autoScrollOffset)
    }

    /// 拉伸中的实时时长增量（分钟，已吸附）。
    private var resizeMinutes: Int {
        guard isResizing else { return 0 }
        return snapResizeMinutes(from: rawTranslation + autoScrollOffset)
    }

    private var baseTop: Double {
        DayViewMath.taskTopPx(startTime: task.startTime, startHour: startHour, pxPerMin: pxPerMin)
    }

    private var baseHeight: Double {
        DayViewMath.taskHeightPx(estDuration: task.estDuration, pxPerMin: pxPerMin)
    }

    /// 拖动中的实时位移（相对静止位置）。静止位置由父层的 padding 决定，
    /// 这样命中区域始终与视觉一致。
    private var liveDragOffset: Double { Double(dragMinutes) * pxPerMin }
    private var liveHeight: Double { max(pxPerMin * 5, baseHeight + Double(resizeMinutes) * pxPerMin) }

    /// 拉伸中显示吸附后的时长
    private var liveDurationLabel: String {
        guard resizeMinutes != 0 else { return task.estDuration }
        let minutes = Int(baseHeight / pxPerMin) + resizeMinutes
        return Format.formatSecs(max(30, minutes) * 60)
    }

    /// 拖动中显示吸附后的时间，让用户看到「会落在哪」。
    private var liveStartLabel: String {
        let minutes = (TimeMath.timeToMinutes(task.startTime) ?? 0) + dragMinutes
        return TimeMath.formatClock(minutes / 60, minutes % 60)
    }

    var body: some View {
        HStack(spacing: 0) {
            // 左侧色条：选中后才是「抓手」，拖它改时间。没选中时它只是块颜色，
            // 这样滚动时手指扫过任务块不会误把任务拖走。
            Rectangle()
                .fill(TaskDisplay.color(for: task))
                .frame(width: isSelected ? 14 : 10)
                .overlay(alignment: .center) {
                    if isSelected {
                        Capsule()
                            .fill(.white.opacity(isDragging ? 0.95 : 0.7))
                            .frame(width: 3, height: 18)
                    }
                }
                .contentShape(Rectangle())
                .highPriorityGesture(moveDragGesture, including: isSelected ? .all : .none)

            VStack(alignment: .leading, spacing: 1) {
                Text(title)
                    .font(.system(size: 13, weight: .semibold))
                    .lineLimit(1)
                    .foregroundStyle(.white)
                Text("\(liveStartLabel) · \(liveDurationLabel)")
                    .font(.system(size: 11))
                    .foregroundStyle(Color(white: 0.65))
                    .monospacedDigit()
                Spacer(minLength: 0)
            }
            .padding(.vertical, 5)
            .padding(.horizontal, 8)
            .frame(maxWidth: .infinity, alignment: .leading)

            // 选中后才给详情/删除入口：点卡片本身现在是「选中/取消选中」
            if isSelected {
                Button(action: onDelete) {
                    Image(systemName: "trash")
                        .font(.system(size: 15))
                        .foregroundStyle(.red)
                        .frame(width: 32, height: 32)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)

                Button(action: onOpenDetail) {
                    Image(systemName: "info.circle")
                        .font(.system(size: 17))
                        .foregroundStyle(Theme.accent)
                        .frame(width: 32, height: 32)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .frame(height: liveHeight, alignment: .top)
        .background(Color(white: 0.16).opacity(0.97))
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(alignment: .bottom) { resizeHandle }
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(isSelected ? Theme.accent.opacity(0.9) : .white.opacity(0.08),
                        lineWidth: isSelected ? 1.5 : 1)
        )
        .shadow(color: .black.opacity(isDragging ? 0.5 : 0.3), radius: isDragging ? 12 : 4, y: isDragging ? 6 : 2)
        .scaleEffect(isDragging ? 1.02 : 1, anchor: .center)
        .opacity(isAnotherDragging ? 0.4 : 1)
        .zIndex(isDragging || isResizing ? 20 : 1)
        .offset(y: liveDragOffset)
        // 吸附是一格 30 分钟（60pt），弹簧会在每一格上回弹叠加，看起来就是抽搐。
        // 换成不过冲的 easeOut，一格一格干脆地走。
        .animation(.easeOut(duration: 0.12), value: dragMinutes)
        .animation(.easeOut(duration: 0.12), value: resizeMinutes)
        .animation(.easeOut(duration: 0.16), value: isDragging)
        .animation(.easeOut(duration: 0.16), value: isSelected)
        // 每吸附过一格给一次轻触反馈
        .onChange(of: dragMinutes) { _, new in if new != 0 { UISelectionFeedbackGenerator().selectionChanged() } }
        .onChange(of: resizeMinutes) { _, new in if new != 0 { UISelectionFeedbackGenerator().selectionChanged() } }
        .contentShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        // 点一下选中，再点一下取消选中。不用长按手势：它的结束事件不可靠，
        // 漏一次就会卡在选中/拖动态里，时间轴也跟着滚不动。
        .onTapGesture { onToggleSelect() }
    }

    /// 左侧色条上的直接拖动（无需长按）——给「长按不好按」留一条确定可用的路。
    /// 位移一律在屏幕坐标系里量：手势挂在会移动的块上，用 .local 会被自己带偏（抽搐），
    /// 用内容坐标系又会和自动滚动重复计一次。
    private var moveDragGesture: some Gesture {
        DragGesture(minimumDistance: 4, coordinateSpace: .global)
            .onChanged { value in
                guard !isResizing else { return }
                beginDragIfNeeded()
                rawTranslation = value.translation.height
                onDragPointChange(value.location.y)
            }
            .onEnded { _ in finishDrag() }
    }

    private func beginDragIfNeeded() {
        guard !isDragging else { return }
        isDragging = true
        rawTranslation = 0
        onDragStateChange(true)
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }

    private func finishDrag() {
        guard isDragging else { return }
        let moved = dragMinutes
        isDragging = false
        onDragStateChange(false)
        rawTranslation = 0
        guard moved != 0 else { return }

        let finalY = baseTop + Double(moved) * pxPerMin
        var updated = task
        updated.startTime = DayViewMath.snapDropToTime(
            relativeY: finalY, offsetMinutes: 0, pxPerMin: pxPerMin, startHour: startHour, endHour: endHour
        )
        onCommit(updated)
    }

    /// 底部拉伸把手：只在选中后出现，26pt 高、铺满宽度，直接拖即可（不需要长按）。
    private var resizeHandle: some View {
        Capsule()
            .fill(.white.opacity(isResizing ? 0.95 : 0.5))
            .frame(width: 44, height: 5)
            .opacity(isSelected ? 1 : 0)
            .padding(.bottom, 4)
            .frame(maxWidth: .infinity)
            .frame(height: 26)
            .contentShape(Rectangle())
            .highPriorityGesture(resizeGesture, including: isSelected ? .all : .none)
    }

    private var resizeGesture: some Gesture {
        DragGesture(minimumDistance: 2, coordinateSpace: .global)
            .onChanged { value in
                if !isResizing {
                    // 万一移动手势也起来了（手指先落在卡片上再滑到把手），把它收回，
                    // 否则两条手势同时改同一块，就是上下乱跳
                    if isDragging {
                        isDragging = false
                        onDragStateChange(false)
                    }
                    isResizing = true
                    rawTranslation = 0
                    onDragStateChange(true)
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                }
                rawTranslation = value.translation.height
                onDragPointChange(value.location.y)
            }
            .onEnded { _ in
                let delta = Double(resizeMinutes) * pxPerMin
                let changed = resizeMinutes != 0
                isResizing = false
                onDragStateChange(false)
                rawTranslation = 0
                guard changed else { return }

                let newDuration = DayViewMath.snapResizeDuration(
                    deltaY: delta, startHeight: baseHeight, startTime: task.startTime, pxPerMin: pxPerMin
                )
                guard newDuration != task.estDuration else { return }

                var updated = task
                updated.estDuration = newDuration
                if let newRatio = DayViewMath.recomputeRatioAfterResize(musicDuration: updated.musicDuration, estDuration: newDuration) {
                    updated.ratio = newRatio
                }
                onCommit(updated)
            }
    }

    /// 拉伸位移 → 分钟（吸附 30 分钟，最短 30 分钟一格）
    private func snapResizeMinutes(from translation: CGFloat) -> Int {
        let raw = Double(translation) / pxPerMin
        let snapped = Int((raw / 30).rounded()) * 30
        let currentMinutes = Int(baseHeight / pxPerMin)
        return max(30 - currentMinutes, snapped)
    }

    /// 位移 → 分钟，并吸附到 30 分钟；同时钳制在可视时段内，拖到边界就停住。
    private func snapMinutes(from translation: CGFloat) -> Int {
        let raw = Double(translation) / pxPerMin
        let snapped = Int((raw / 30).rounded()) * 30
        let startMins = TimeMath.timeToMinutes(task.startTime) ?? 0
        let lower = startHour * 60 - startMins
        let upper = endHour * 60 - 30 - startMins
        return max(lower, min(upper, snapped))
    }
}

// MARK: - 当前时刻红线

private struct NowLine: View {
    let label: String
    let gutter: CGFloat

    var body: some View {
        HStack(spacing: 0) {
            Text(label)
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(.red)
                .frame(width: gutter - 10, alignment: .trailing)
                .offset(y: -0.5)
            Circle().fill(.red).frame(width: 7, height: 7).offset(x: 3)
            Rectangle().fill(.red).frame(height: 1)
        }
    }
}

// MARK: - 录音信息

private struct RecordSheet: View {
    let model: AppModel
    let task: Schedule
    @Environment(\.dismiss) private var dismiss

    @State private var recStart = Calendar.current.date(bySettingHour: 9, minute: 0, second: 0, of: Date())!
    @State private var recEnd = Calendar.current.date(bySettingHour: 10, minute: 0, second: 0, of: Date())!
    @State private var breakMinutes: Double = 0

    var body: some View {
        NavigationStack {
            Form {
                DatePicker("开始", selection: $recStart, displayedComponents: .hourAndMinute)
                DatePicker("结束", selection: $recEnd, displayedComponents: .hourAndMinute)
                Stepper("休息 \(Int(breakMinutes)) 分钟", value: $breakMinutes, in: 0...120, step: 5)
                LabeledContent("实际时长", value: actualDuration)
            }
            .navigationTitle("录音信息 · \(TaskDisplay.title(for: task, settings: model.settings))")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("取消") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        model.saveRecording(taskId: task.scheduleId, recStart: startStr, recEnd: endStr, breakMinutes: breakMinutes)
                        dismiss()
                    }
                }
            }
            .onAppear {
                if let rec = task.records?.musician {
                    if let start = rec.recStart { recStart = Self.timeToDate(start, day: Date()) }
                    if let end = rec.recEnd { recEnd = Self.timeToDate(end, day: Date()) }
                    breakMinutes = rec.breakMinutes ?? 0
                }
            }
        }
    }

    private var startStr: String {
        let cal = Calendar.current
        return TimeMath.formatClock(cal.component(.hour, from: recStart), cal.component(.minute, from: recStart))
    }

    private var endStr: String {
        let cal = Calendar.current
        return TimeMath.formatClock(cal.component(.hour, from: recEnd), cal.component(.minute, from: recEnd))
    }

    private var actualDuration: String {
        TrackRecord.calculateActualDuration(recStart: startStr, recEnd: endStr, breakMinutes: breakMinutes) ?? "--:--"
    }

    private static func timeToDate(_ hhmm: String, day: Date) -> Date {
        let parts = hhmm.split(separator: ":").map(String.init)
        let h = parts.count > 0 ? (Int(parts[0]) ?? 0) : 0
        let m = parts.count > 1 ? (Int(parts[1]) ?? 0) : 0
        return Calendar.current.date(bySettingHour: h, minute: m, second: 0, of: day) ?? day
    }
}
