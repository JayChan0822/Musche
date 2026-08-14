import SwiftUI
import MuscheCore

/// M3：月视图（Apple 原生风格，纵向连续滚动翻月）。
/// 点某天：那一行日期飞到顶部变成周日期条，日视图从下方滑出盖住月格子——转场参考 Apple 日历。
struct MonthView: View {
    let model: AppModel
    @State private var showSync = false
    @State private var selectedDay = ""
    @State private var showDay = false
    /// 月格子里的日期数字 ↔ 日视图顶部周条之间的连贯飞行
    @Namespace private var dayNamespace
    /// 只在首次（含云端数据到达后的首次）自动定位到今天，之后不再打断用户滚动
    @State private var didInitialJump = false
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 0), count: 7)

    /// 月→日转场用的弹簧：与系统日历观感接近（略带回弹、不拖沓）
    private static let transitionAnimation = Animation.spring(response: 0.42, dampingFraction: 0.86)

    var body: some View {
        ZStack(alignment: .top) {
            // 月视图始终挂载：这样滚动位置不丢，关闭日视图时那一行日期能原路飞回去。
            // 日模式下只是淡出，其余几周看起来就是「让位」。
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
        .navigationTitle("Musche")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(showDay ? .hidden : .visible, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showSync = true } label: { Image(systemName: "arrow.triangle.2.circlepath") }
            }
        }
        .sheet(isPresented: $showSync) {
            SyncSheet(model: model)
        }
    }

    private var monthScroll: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 28) {
                    ForEach(months, id: \.self) { month in
                        monthSection(month)
                    }
                }
                .padding(.top, 4)
                .padding(.bottom, 24)
            }
            .onAppear { jumpToToday(proxy) }
            // 云端数据到达后月份区间会重算，需要重新落回今天，否则会停在最早的那个月；
            // 但只补这一次，之后不再把正在滚动的用户拽回去
            .onChange(of: months.count) { _, _ in
                guard !didInitialJump else { return }
                jumpToToday(proxy)
            }
        }
    }

    private func jumpToToday(_ proxy: ScrollViewProxy) {
        let today = Format.formatYMD(Date())
        DispatchQueue.main.async {
            proxy.scrollTo(today, anchor: .center)
            if !model.tasks.isEmpty { didInitialJump = true }
        }
    }

    /// 点某天：选中日所在那一行的 7 个日期数字连贯升到顶部变成周条，时间轴同时从下方滑出。
    private func openDay(_ dateStr: String) {
        selectedDay = dateStr
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

    // MARK: - 月份区间（从任务数据推算，缺省用当天）

    private var months: [Date] {
        let cal = Calendar.current
        let today = Date()

        var start = today
        var end = today
        for dateStr in model.tasks.map(\.date) {
            if let d = Self.parseDate(dateStr) {
                if d < start { start = d }
                if d > end { end = d }
            }
        }
        let startComp = cal.dateComponents([.year, .month], from: start)
        let endComp = cal.dateComponents([.year, .month], from: end)
        guard let startMonth = cal.date(from: startComp),
              let endMonth = cal.date(from: endComp) else {
            return [today]
        }

        var result: [Date] = []
        var m = cal.date(byAdding: .month, value: -1, to: startMonth)!
        let last = cal.date(byAdding: .month, value: 1, to: endMonth)!
        while m <= last {
            result.append(m)
            m = cal.date(byAdding: .month, value: 1, to: m)!
        }
        return result
    }

    // MARK: - 每个月的区块

    private func monthSection(_ month: Date) -> some View {
        VStack(spacing: 4) {
            Text(monthTitle(month))
                .font(.title3).bold()
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, alignment: .leading)

            weekdayHeader

            LazyVGrid(columns: columns, spacing: 10) {
                ForEach(CalendarMath.generateMonthGrid(month), id: \.fullDate) { day in
                    dayCell(day)
                }
            }
        }
        .padding(.horizontal, 8)
    }

    private var weekdayHeader: some View {
        HStack(spacing: 0) {
            ForEach(CalendarMath.weekdayNames, id: \.self) { name in
                Text(name)
                    .font(.caption2)
                    .foregroundStyle(Color(white: 0.45))
                    .frame(maxWidth: .infinity)
            }
        }
        .padding(.vertical, 6)
    }

    private func dayCell(_ day: CalendarMath.MonthDay) -> some View {
        let dateTasks = model.tasks(for: day.fullDate)
        return Button {
            openDay(day.fullDate)
        } label: {
            VStack(alignment: .leading, spacing: 3) {
                dayNumber(day)

                ForEach(dateTasks.prefix(2), id: \.scheduleId) { task in
                    Text(TaskDisplay.title(for: task, settings: model.settings))
                        .font(.system(size: 10, weight: .medium))
                        .lineLimit(1)
                        .padding(.horizontal, 4)
                        .padding(.vertical, 2)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(TaskDisplay.color(for: task).opacity(0.9), in: RoundedRectangle(cornerRadius: 4, style: .continuous))
                        .foregroundStyle(.white)
                }

                if dateTasks.count > 2 {
                    Text("+\(dateTasks.count - 2) 更多")
                        .font(.system(size: 9))
                        .foregroundStyle(Color(white: 0.45))
                }

                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, minHeight: 64, alignment: .topLeading)
        }
        .buttonStyle(.plain)
        .id(day.fullDate)
    }

    /// 日期数字。月模式下带 matchedGeometry：日视图打开时它会飞到顶部周条的对应位置。
    /// 打开后不再参与匹配（同一个 id 只能有一个 source），视觉不变。
    @ViewBuilder
    private func dayNumber(_ day: CalendarMath.MonthDay) -> some View {
        let base = Text("\(day.dayNum)")
            .font(.system(size: 15))
            .fontWeight(isToday(day) ? .semibold : .regular)
            .foregroundStyle(isToday(day) ? .white : (day.isCurrentMonth ? .white : Color(white: 0.38)))
            .frame(width: 26, height: 26)
            .background(isToday(day) ? Color.red : .clear, in: Circle())

        if showDay {
            base
        } else {
            base.matchedGeometryEffect(id: "day-\(day.fullDate)", in: dayNamespace, properties: .position, anchor: .center)
        }
    }

    // MARK: - 工具

    private func monthTitle(_ month: Date) -> String {
        let cal = Calendar.current
        return "\(cal.component(.year, from: month))年\(cal.component(.month, from: month))月"
    }

    private func isToday(_ day: CalendarMath.MonthDay) -> Bool {
        day.fullDate == Format.formatYMD(Date())
    }

    private static func parseDate(_ s: String) -> Date? {
        let parts = s.split(separator: "-").map(String.init)
        guard parts.count == 3, let y = Int(parts[0]), let m = Int(parts[1]), let d = Int(parts[2]) else { return nil }
        var comps = DateComponents()
        comps.year = y
        comps.month = m
        comps.day = d
        return Calendar.current.date(from: comps)
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
