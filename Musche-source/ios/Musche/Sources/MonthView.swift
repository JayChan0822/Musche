import SwiftUI
import MuscheCore

/// 月视图：完全参照 Apple 日历中文版。
/// - 非本月的日期留空，不再灰显（每个月只画自己的日子，行尾留白）
/// - 日期下方显示农历；农历月首显示月名并标红
/// - 月份标记压在该月 1 号上方，并从那一列往右拉一条分隔线
/// - 左上角大标题跟随滚动显示当前月份，左下角「今天」按钮回到今天
/// 点某天：那一行日期升到顶部变成周条，日视图从下方滑出。
struct MonthView: View {
    let model: AppModel
    /// 外部（任务池「定位」）要求打开的日期；处理完置回 nil
    @Binding var focusDate: String?

    @State private var showSync = false
    @State private var showSettings = false
    @State private var selectedDay = ""
    @State private var showDay = false
    /// 月格子里的日期数字 ↔ 日视图顶部周条之间的连贯飞行
    @Namespace private var dayNamespace
    /// 参与「飞到顶部周条」的那 7 天。只有这一周挂 matchedGeometry，
    /// 其余格子一律不挂——否则切换时几百个格子会一起重建、跟着动。
    @State private var flightWeek: Set<String> = []
    /// 滚到顶部的月份（驱动左上角大标题，也用来做「今天」跳转）
    @State private var topMonthKey: String?
    /// 只在首次（含云端数据到达后的首次）自动定位到今天，之后不再打断用户滚动
    @State private var didInitialJump = false
    /// 覆盖式顶栏的实测高度，用来让出滚动内容的上边距
    @State private var headerHeight: CGFloat = 96

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 0), count: 7)

    /// 月→日转场用的弹簧：与系统日历观感接近（略带回弹、不拖沓）
    private static let transitionAnimation = Animation.spring(response: 0.42, dampingFraction: 0.86)

    var body: some View {
        ZStack(alignment: .top) {
            // 月视图始终挂载：这样滚动位置不丢，关闭日视图时那一行日期能原路飞回去。
            monthScroll
                .allowsHitTesting(!showDay)

            if showDay {
                // 面板整体不做位移过渡——周条要由 matchedGeometry 从月格子「升」上来，
                // 只有时间轴从底部滑出，两者合成一段连贯动作。
                DayPane(
                    model: model,
                    namespace: dayNamespace,
                    dateStr: $selectedDay,
                    onClose: closeDay
                )
                .zIndex(1)
            }
        }
        // 自己画顶栏：系统工具栏会把左上角标题收进「…」里，且样式不受控
        .toolbar(.hidden, for: .navigationBar)
        .sheet(isPresented: $showSync) {
            SyncSheet(model: model)
        }
        .sheet(isPresented: $showSettings) {
            SettingsView(model: model)
        }
        // 任务池点「定位」过来的：滚到那个月并直接打开那一天
        .onChange(of: focusDate) { _, value in
            guard let value, !value.isEmpty else { return }
            if let date = CalendarMath.parseYMD(value) {
                topMonthKey = MonthSlot.monthKey(date)
            }
            openDay(value)
            focusDate = nil
        }
    }

    // MARK: - 滚动的月份列表

    private var monthScroll: some View {
        // 在这里读一次 model.tasks：依赖登记在 MonthView.body 上，
        // 云端同步回来时整屏小圆点会一起刷新（逐格 filter 既慢又会漏刷新）
        let tasksByDate = CalendarMath.tasksByDateMap(model.tasks)
        return ScrollView {
            LazyVStack(spacing: 0) {
                ForEach(months) { month in
                    monthSection(month, tasksByDate: tasksByDate)
                }
            }
            .scrollTargetLayout()
            .padding(.bottom, 24)
        }
        .scrollPosition(id: $topMonthKey, anchor: .top)
        // 顶栏用覆盖（不是 safeAreaInset）：日期从它下面穿过去，边缘用渐变淡出；
        // 用 contentMargins 把首行让出来，滚动区域尺寸不随日视图开关变化，
        // 返回时月视图还停在原处，日视图（ZStack 里更高一层）也能整块盖住它们。
        .contentMargins(.top, headerHeight, for: .scrollContent)
        .overlay(alignment: .top) {
            topBar
                .onGeometryChange(for: CGFloat.self) { $0.size.height } action: { headerHeight = $0 }
        }
        .safeAreaInset(edge: .bottom, spacing: 0) { todayBar }
        .onAppear { jumpToToday() }
        // 云端数据到达后月份区间会重算，需要重新落回今天；只补这一次，
        // 之后不再把正在滚动的用户拽回去
        .onChange(of: months.count) { _, _ in
            guard !didInitialJump else { return }
            jumpToToday()
        }
    }

    private var topBar: some View {
        VStack(spacing: 0) {
            HStack(alignment: .firstTextBaseline) {
                Text(monthTitle)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(.white)
                    .contentTransition(.numericText())
                Spacer()
                sessionMenu
                menuButton
            }
            .padding(.horizontal, 16)
            .padding(.top, 4)
            .padding(.bottom, 8)

            weekdayHeader
        }
        // 底部留一段透明区，让渐变在这里收尾——日期从下面滚过时是淡出，不是被硬边切断
        .padding(.bottom, 18)
        .background {
            // 高斯模糊 + 黑底：材质只负责模糊，上面盖一层黑把系统材质的灰调压掉，
            // 顶栏底色就和下面的日历一样黑，日期滚过去只留一团模糊的暗影。
            // 再用自上而下淡出的遮罩收尾，避免出现硬边。
            ZStack {
                Rectangle().fill(.ultraThinMaterial)
                Rectangle().fill(Color.black.opacity(0.52))
            }
                .mask {
                    LinearGradient(
                        stops: [
                            .init(color: .black, location: 0),
                            .init(color: .black, location: 0.87),
                            .init(color: .black.opacity(0.7), location: 0.94),
                            .init(color: .clear, location: 1),
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                }
                .ignoresSafeArea(edges: .top)
        }
    }

    /// 当前日程：点开可切换，日程多起来时这是最常用的入口
    private var sessionMenu: some View {
        Menu {
            Picker("日程", selection: Binding(
                get: { model.currentSessionId },
                set: { model.currentSessionId = $0 }
            )) {
                // 当前日程可能不在列表里（老数据的 S_DEFAULT），补一项进去，
                // 否则 Picker 选不中、看起来像没选日程
                if !model.sessions.contains(where: { $0.id == model.currentSessionId }) {
                    Text(model.currentSessionName).tag(model.currentSessionId)
                }
                ForEach(model.sessions, id: \.id) { session in
                    Text(session.name).tag(session.id)
                }
            }
            Divider()
            Button { showSettings = true } label: { Label("管理日程…", systemImage: "slider.horizontal.3") }
        } label: {
            HStack(spacing: 4) {
                Text(model.currentSessionName)
                    .font(.system(size: 13, weight: .medium))
                    .lineLimit(1)
                    .truncationMode(.tail)
                Image(systemName: "chevron.down")
                    .font(.system(size: 9, weight: .bold))
            }
            .foregroundStyle(Theme.accent)
            .frame(maxWidth: 130)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(.ultraThinMaterial, in: Capsule())
        }
    }

    private var menuButton: some View {
        Menu {
            Button { showSettings = true } label: { Label("设置", systemImage: "gearshape") }
            Button { showSync = true } label: { Label("同步", systemImage: "arrow.triangle.2.circlepath") }
        } label: {
            syncIcon
                .frame(width: 36, height: 36)
                .background(.ultraThinMaterial, in: Circle())
        }
    }

    /// 同步按钮兼自动保存指示：存的时候转圈，冲突/失败标黄，平时是同步图标
    @ViewBuilder
    private var syncIcon: some View {
        switch model.saveState {
        case .saving:
            ProgressView().controlSize(.small).tint(Theme.accent)
        case .conflict, .failed:
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(.orange)
        case .idle, .saved:
            Image(systemName: "ellipsis")
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(Theme.accent)
        }
    }

    private var weekdayHeader: some View {
        HStack(spacing: 0) {
            ForEach(Array(CalendarMath.weekdayNames.enumerated()), id: \.offset) { index, name in
                Text(name)
                    .font(.system(size: 12))
                    // 周六周日用红色，与 Apple 中文日历一致
                    .foregroundStyle(index == 0 || index == 6 ? Color.red.opacity(0.85) : Color(white: 0.55))
                    .frame(maxWidth: .infinity)
            }
        }
        .padding(.horizontal, 4)
    }

    private var todayBar: some View {
        HStack {
            Button {
                withAnimation(.easeInOut(duration: 0.25)) { jumpToToday(force: true) }
            } label: {
                Text("今天")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 18)
                    .padding(.vertical, 10)
                    .background(.ultraThinMaterial, in: Capsule())
                    .overlay(Capsule().stroke(.white.opacity(0.12), lineWidth: 1))
            }
            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 4)
    }

    private func jumpToToday(force: Bool = false) {
        topMonthKey = MonthSlot.monthKey(Date())
        if force || !model.tasks.isEmpty { didInitialJump = true }
    }

    // MARK: - 单个月

    private func monthSection(_ month: MonthSlot, tasksByDate: [String: [Schedule]]) -> some View {
        LazyVGrid(columns: columns, spacing: 0) {
            ForEach(month.cells) { cell in
                dayCell(cell, month: month, tasksByDate: tasksByDate)
            }
        }
        .padding(.horizontal, 4)
    }

    private func dayCell(_ cell: DayCell, month: MonthSlot, tasksByDate: [String: [Schedule]]) -> some View {
        VStack(spacing: 0) {
            // 1 号那一行：从 1 号所在列起往右一条分隔线，线上方压月份标记（Apple 的做法）
            if cell.showsRule {
                Text(cell.isMonthStart ? month.gregorianLabel : " ")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(month.isCurrentMonth ? Color.red : .white)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.leading, 4)
                    .padding(.bottom, 4)
                Rectangle()
                    .fill(.white.opacity(0.16))
                    .frame(height: 0.5)
                    .padding(.bottom, 6)
            }

            if let day = cell.day {
                dayContent(day, tasks: tasksByDate[day.fullDate] ?? [])
            }

            Spacer(minLength: 0)
        }
        .frame(minHeight: cell.showsRule ? 104 : 72, alignment: .top)
    }

    private func dayContent(_ day: DayInfo, tasks: [Schedule]) -> some View {
        VStack(spacing: 1) {
            Text("\(day.dayNum)")
                .font(.system(size: 19, weight: day.isToday ? .semibold : .regular))
                .foregroundStyle(.white)
                .frame(width: 34, height: 34)
                .background(day.isToday ? Color.red : .clear, in: Circle())
                .modifier(DayFlight(
                    id: day.fullDate,
                    namespace: dayNamespace,
                    active: flightWeek.contains(day.fullDate),
                    isSource: !showDay
                ))

            Text(day.lunar)
                .font(.system(size: 10))
                .foregroundStyle(day.isLunarMonthStart ? Color.red.opacity(0.9) : Color(white: 0.55))
                .lineLimit(1)
                .minimumScaleFactor(0.8)

            dots(tasks)
        }
        .frame(maxWidth: .infinity)
        .contentShape(Rectangle())
        .onTapGesture { openDay(day.fullDate) }
    }

    /// 任务用彩色小圆点表示（与 Apple 日历一致），最多 4 个
    private func dots(_ tasks: [Schedule]) -> some View {
        HStack(spacing: 3) {
            ForEach(Array(tasks.prefix(4).enumerated()), id: \.offset) { _, task in
                Circle()
                    // 不属于当前日程的任务显示成灰点（Web 版的「幽灵任务」）
                    .fill(model.belongsToCurrentSession(task) ? TaskDisplay.color(for: task) : Color(white: 0.32))
                    .frame(width: 5, height: 5)
            }
        }
        .frame(height: 7)
    }

    private func openDay(_ dateStr: String) {
        selectedDay = dateStr
        // 在动画之外先定好参与飞行的这一周，避免动画期间视图身份发生变化
        flightWeek = Set(CalendarMath.weekDays(around: dateStr).map(\.fullDate))
        UIImpactFeedbackGenerator(style: .soft).impactOccurred()
        withAnimation(Self.transitionAnimation) {
            showDay = true
        }
    }

    private func closeDay() {
        withAnimation(Self.transitionAnimation) {
            showDay = false
        }
    }

    // MARK: - 数据

    /// 左上角大标题：跟随滚动显示滚到顶部的那个月；跨年时带上年份
    private var monthTitle: String {
        let key = topMonthKey ?? MonthSlot.monthKey(Date())
        let parts = key.split(separator: "-")
        guard parts.count == 2, let year = Int(parts[0]), let month = Int(parts[1]) else { return "" }
        let thisYear = Calendar.current.component(.year, from: Date())
        return year == thisYear ? "\(month)月" : "\(year)年\(month)月"
    }

    /// 覆盖数据范围的月份（前后各留一个月），缺省用当天所在月
    private var months: [MonthSlot] {
        let cal = Calendar.current
        let today = Date()

        var start = today
        var end = today
        for dateStr in model.tasks.map(\.date) {
            if let d = CalendarMath.parseYMD(dateStr) {
                if d < start { start = d }
                if d > end { end = d }
            }
        }
        let startComp = cal.dateComponents([.year, .month], from: start)
        let endComp = cal.dateComponents([.year, .month], from: end)
        guard let startMonth = cal.date(from: startComp),
              let endMonth = cal.date(from: endComp),
              var cursor = cal.date(byAdding: .month, value: -1, to: startMonth),
              let last = cal.date(byAdding: .month, value: 1, to: endMonth) else {
            return [MonthSlot(date: today)]
        }

        var result: [MonthSlot] = []
        while cursor <= last {
            result.append(MonthSlot(date: cursor))
            guard let next = cal.date(byAdding: .month, value: 1, to: cursor) else { break }
            cursor = next
        }
        return result
    }
}

// MARK: - 月/日模型（只渲染本月的日子，行尾留白）

private struct MonthSlot: Identifiable {
    let cells: [DayCell]
    let gregorianLabel: String
    let isCurrentMonth: Bool
    let key: String

    var id: String { key }

    static func monthKey(_ date: Date) -> String {
        let cal = Calendar.current
        return "\(cal.component(.year, from: date))-\(String(format: "%02d", cal.component(.month, from: date)))"
    }

    init(date: Date) {
        let cal = Calendar.current
        let year = cal.component(.year, from: date)
        let month = cal.component(.month, from: date)

        var firstComps = DateComponents()
        firstComps.year = year
        firstComps.month = month
        firstComps.day = 1
        let firstDay = cal.date(from: firstComps) ?? date

        let leading = cal.component(.weekday, from: firstDay) - 1     // 周日 = 0
        let daysInMonth = cal.range(of: .day, in: .month, for: firstDay)?.count ?? 30
        let todayStr = Format.formatYMD(Date())

        var cells: [DayCell] = []
        // 前导留白：不显示上个月的日子
        for index in 0..<leading {
            cells.append(DayCell(id: "\(year)-\(month)-lead-\(index)", day: nil, showsRule: false, isMonthStart: false))
        }
        for dayNum in 1...daysInMonth {
            let dayDate = cal.date(byAdding: .day, value: dayNum - 1, to: firstDay) ?? firstDay
            let full = Format.formatYMD(dayDate)
            let lunar = LunarDate.value(for: dayDate)
            let info = DayInfo(
                fullDate: full,
                dayNum: dayNum,
                isToday: full == todayStr,
                lunar: lunar.label,
                isLunarMonthStart: lunar.isMonthStart
            )
            // 分隔线只画在 1 号那一行、且从 1 号所在列往右
            let showsRule = leading + dayNum <= 7
            cells.append(DayCell(id: full, day: info, showsRule: showsRule, isMonthStart: dayNum == 1))
        }
        // 行尾留白：下个月从新的一行开始
        let remainder = cells.count % 7
        if remainder > 0 {
            for index in 0..<(7 - remainder) {
                cells.append(DayCell(id: "\(year)-\(month)-trail-\(index)", day: nil, showsRule: false, isMonthStart: false))
            }
        }

        self.cells = cells
        self.gregorianLabel = "\(month)月"
        self.isCurrentMonth = cal.isDate(date, equalTo: Date(), toGranularity: .month)
        self.key = MonthSlot.monthKey(firstDay)
    }
}

private struct DayCell: Identifiable {
    let id: String
    let day: DayInfo?
    /// 该格上方是否画分隔线（1 号那一行、从 1 号所在列往右）
    let showsRule: Bool
    let isMonthStart: Bool
}

private struct DayInfo {
    let fullDate: String
    let dayNum: Int
    let isToday: Bool
    let lunar: String
    let isLunarMonthStart: Bool
}

/// 只有参与飞行的那一周才挂 matchedGeometry，其余格子完全不参与。
/// 包成 modifier 是为了避免在视图里写 if/else 两个分支——那会让 SwiftUI 认为是不同视图，
/// 切换时整屏格子重建，表现就是「所有行一起动」。
private struct DayFlight: ViewModifier {
    let id: String
    let namespace: Namespace.ID
    let active: Bool
    let isSource: Bool

    func body(content: Content) -> some View {
        if active {
            content.matchedGeometryEffect(id: "day-\(id)", in: namespace, properties: .position, anchor: .center, isSource: isSource)
        } else {
            content
        }
    }
}

// MARK: - 云端同步

private struct SyncSheet: View {
    let model: AppModel
    @Environment(\.dismiss) private var dismiss

    @State private var message = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("已登录") {
                    LabeledContent("账号", value: model.userEmail ?? "-")
                }
                Section {
                    Button("从云端读取") { Task { await load() } }
                    Button("上传到云端") { Task { await push() } }
                }
                Section {
                    Button("退出登录", role: .destructive) { Task { await signOut() } }
                }
                if !message.isEmpty {
                    Text(message)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("云端同步")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("关闭") { dismiss() } }
            }
        }
    }

    private func load() async {
        do {
            if try await model.syncFromCloud() {
                message = "已从云端读取（version \(model.dataVersion)）"
            } else {
                message = "云端无数据"
            }
        } catch {
            message = "读取失败：\(error.localizedDescription)"
        }
    }

    private func push() async {
        do {
            let result = try await model.pushToCloud()
            switch result {
            case .saved(let v): message = "已上传（version \(v)）"
            case .conflict(let v): message = "冲突：云端已是 version \(v)，请先读取"
            }
        } catch {
            message = "上传失败：\(error.localizedDescription)"
        }
    }

    private func signOut() async {
        do {
            try await model.signOut()
            dismiss()
        } catch {
            message = "退出失败：\(error.localizedDescription)"
        }
    }
}
