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
                    sessionId: "S_DEFAULT",
                    sessionName: "默认录音日程",
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
                    sessionId: "S_DEFAULT",
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
    }
}

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

                    ForEach(tasks, id: \.scheduleId) { task in
                        TaskBlock(
                            task: task,
                            title: TaskDisplay.title(for: task, settings: model.settings),
                            pxPerMin: pxPerMin,
                            startHour: model.settings.startHour,
                            endHour: model.settings.endHour,
                            isAnotherDragging: activeDragId != nil && activeDragId != task.scheduleId,
                            onDragStateChange: { dragging in
                                activeDragId = dragging ? task.scheduleId : nil
                            },
                            onCommit: { updated in commit(updated) },
                            onTap: { onOpenRecord(task) }
                        )
                        .padding(.leading, gutter)
                        .padding(.trailing, 8)
                    }

                    if let nowTop, let nowLabel {
                        NowLine(label: nowLabel, gutter: gutter)
                            .offset(y: nowTop)
                            .allowsHitTesting(false)
                    }
                }
                .frame(maxWidth: .infinity, minHeight: timelineHeight, alignment: .topLeading)
                .padding(.bottom, 40)
            }
            // 拖动任务块时锁住纵向滚动，避免手势打架造成的抽搐
            .scrollDisabled(activeDragId != nil)
            .onAppear { scrollToFocus(proxy) }
            .onChange(of: dateStr) { _, _ in scrollToFocus(proxy) }
        }
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
            currentSessionId: "S_DEFAULT"
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
    let onDragStateChange: (Bool) -> Void
    let onCommit: (Schedule) -> Void
    let onTap: () -> Void

    /// 拖动中的实时位移，已吸附到 30 分钟（所以块是「一格一格」走的，不会跟着手指抖）。
    @State private var dragMinutes: Int = 0
    /// 拉伸中的实时时长增量（分钟，已吸附）。
    @State private var resizeMinutes: Int = 0
    @State private var isDragging = false
    @State private var isResizing = false

    private var baseTop: Double {
        DayViewMath.taskTopPx(startTime: task.startTime, startHour: startHour, pxPerMin: pxPerMin)
    }

    private var baseHeight: Double {
        DayViewMath.taskHeightPx(estDuration: task.estDuration, pxPerMin: pxPerMin)
    }

    private var liveTop: Double { baseTop + Double(dragMinutes) * pxPerMin }
    private var liveHeight: Double { max(pxPerMin * 5, baseHeight + Double(resizeMinutes) * pxPerMin) }

    /// 拖动中显示吸附后的时间，让用户看到「会落在哪」。
    private var liveStartLabel: String {
        let minutes = (TimeMath.timeToMinutes(task.startTime) ?? 0) + dragMinutes
        return TimeMath.formatClock(minutes / 60, minutes % 60)
    }

    var body: some View {
        HStack(spacing: 0) {
            Rectangle()
                .fill(TaskDisplay.color(for: task))
                .frame(width: 4)

            VStack(alignment: .leading, spacing: 1) {
                Text(title)
                    .font(.system(size: 13, weight: .semibold))
                    .lineLimit(1)
                    .foregroundStyle(.white)
                Text("\(liveStartLabel) · \(task.estDuration)")
                    .font(.system(size: 11))
                    .foregroundStyle(Color(white: 0.65))
                    .monospacedDigit()
                Spacer(minLength: 0)
            }
            .padding(.vertical, 5)
            .padding(.horizontal, 8)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(height: liveHeight, alignment: .top)
        .background(Color(white: 0.16).opacity(0.97))
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(alignment: .bottom) { resizeHandle }
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(isDragging ? Theme.accent.opacity(0.9) : .white.opacity(0.08), lineWidth: isDragging ? 1.5 : 1)
        )
        .shadow(color: .black.opacity(isDragging ? 0.5 : 0.3), radius: isDragging ? 12 : 4, y: isDragging ? 6 : 2)
        .scaleEffect(isDragging ? 1.02 : 1, anchor: .center)
        .opacity(isAnotherDragging ? 0.4 : 1)
        .zIndex(isDragging || isResizing ? 20 : 1)
        .offset(y: liveTop)
        .animation(.spring(response: 0.22, dampingFraction: 0.85), value: dragMinutes)
        .animation(.spring(response: 0.22, dampingFraction: 0.85), value: resizeMinutes)
        .animation(.easeOut(duration: 0.16), value: isDragging)
        .contentShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .onTapGesture(perform: onTap)
        // 长按 0.25s 进入拖动模式（同时 DayTimeline 会关掉纵向滚动），
        // 位移由下面的 simultaneousGesture 接管。
        // 不能用 .gesture(LongPress.sequenced(before: Drag))：在 ScrollView 里
        // 滚动手势会把它整条吞掉，连第一阶段都收不到（实测日志验证）。
        .onLongPressGesture(minimumDuration: 0.25, maximumDistance: 14) {
            guard !isDragging else { return }
            isDragging = true
            onDragStateChange(true)
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        }
        // including: 未进入拖动模式时把手势让给 ScrollView（否则在任务块上就滚不动了），
        // 长按成功后才接管位移。
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { value in
                    guard isDragging else { return }
                    let snapped = snapMinutes(from: value.translation.height)
                    if snapped != dragMinutes {
                        dragMinutes = snapped
                        UISelectionFeedbackGenerator().selectionChanged()
                    }
                }
                .onEnded { _ in
                    guard isDragging else { return }
                    let moved = dragMinutes
                    isDragging = false
                    onDragStateChange(false)
                    dragMinutes = 0
                    guard moved != 0 else { return }

                    let finalY = baseTop + Double(moved) * pxPerMin
                    var updated = task
                    updated.startTime = DayViewMath.snapDropToTime(
                        relativeY: finalY, offsetMinutes: 0, pxPerMin: pxPerMin, startHour: startHour, endHour: endHour
                    )
                    onCommit(updated)
                },
            including: isDragging ? .all : .subviews
        )
    }

    private var resizeHandle: some View {
        Capsule()
            .fill(.white.opacity(isResizing ? 0.9 : 0.35))
            .frame(width: 32, height: 4)
            .padding(.bottom, 3)
            .frame(maxWidth: .infinity)
            .frame(height: 22)
            .contentShape(Rectangle())
            .highPriorityGesture(resizeGesture)
    }

    // MARK: - 手势

    private var resizeGesture: some Gesture {
        DragGesture(minimumDistance: 2)
            .onChanged { value in
                if !isResizing {
                    isResizing = true
                    onDragStateChange(true)
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                }
                let snapped = snapMinutes(from: value.translation.height)
                if snapped != resizeMinutes {
                    resizeMinutes = snapped
                    UISelectionFeedbackGenerator().selectionChanged()
                }
            }
            .onEnded { value in
                let delta = Double(resizeMinutes) * pxPerMin
                isResizing = false
                onDragStateChange(false)
                resizeMinutes = 0
                guard abs(value.translation.height) > 2 else { return }

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
