import SwiftUI
import MuscheCore

/// M4：任务池。
/// 设计要点：一屏先看「谁还有多少没排」，再逐层展开到具体曲目——
/// 所以顶部是总览条，中间是可折叠的分组卡片（默认收起），条目行只留名称/时长/状态，
/// 倍率这类细节收进详情，避免出现一整屏没有名字的时长行。
struct PoolView: View {
    let model: AppModel
    /// 点「定位」时回调给根视图：切到日历并打开那一天
    let onLocate: (String) -> Void

    @State private var groupBy: GroupBy = .musician
    @State private var search = ""
    @State private var expanded: Set<String> = []
    @State private var showQuickAdd = false
    @State private var showImport = false
    @State private var scheduleTarget: PoolItem?
    @State private var detailTarget: PoolItem?
    @State private var deleteTarget: PoolItem?
    /// 同一时间只允许一行划开
    @State private var openedRowId: String?
    /// 该条目还没排期时点「定位」的提示
    @State private var showNotScheduled = false

    enum GroupBy: String, CaseIterable, Identifiable {
        case musician = "乐手"
        case project = "项目"
        var id: String { rawValue }
        var recordType: String { self == .musician ? "musician" : "project" }
    }

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                summaryBar

                Picker("分组", selection: $groupBy) {
                    ForEach(GroupBy.allCases) { Text($0.rawValue).tag($0) }
                }
                .pickerStyle(.segmented)
                .padding(.bottom, 2)

                if groups.isEmpty {
                    emptyState
                } else {
                    ForEach(groups) { group in
                        GroupCard(
                            group: group,
                            isExpanded: expanded.contains(group.id),
                            openedRowId: $openedRowId,
                            onToggle: { toggle(group.id) },
                            onSchedule: { scheduleTarget = $0 },
                            onOpen: { detailTarget = $0 },
                            onLocate: { locate($0) },
                            onEdit: { detailTarget = $0 },
                            onDelete: { deleteTarget = $0 }
                        )
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
            .padding(.bottom, 28)
            .animation(.spring(response: 0.32, dampingFraction: 0.88), value: expanded)
        }
        .scrollDismissesKeyboard(.immediately)
        .searchable(text: $search, prompt: "搜索曲目、乐手、项目")
        .navigationTitle("任务池")
        .toolbar {
            ToolbarItemGroup(placement: .topBarTrailing) {
                Button { showImport = true } label: { Image(systemName: "square.and.arrow.down") }
                Button { showQuickAdd = true } label: { Image(systemName: "plus") }
            }
        }
        .sheet(isPresented: $showQuickAdd) { QuickAddSheet(model: model) }
        .sheet(isPresented: $showImport) { ImportCSVSheet(model: model) }
        .sheet(item: $scheduleTarget) { item in ScheduleSheet(model: model, item: item) }
        .sheet(item: $detailTarget) { item in ItemDetailSheet(model: model, item: item) }
        .alert("还没有排期", isPresented: $showNotScheduled) {
            Button("好", role: .cancel) {}
        } message: {
            Text("这条曲目还没排到日历上，先用「排期」按钮安排时间。")
        }
        .confirmationDialog(
            "删除「\(deleteTarget.map(displayName) ?? "")」？",
            isPresented: Binding(get: { deleteTarget != nil }, set: { if !$0 { deleteTarget = nil } }),
            titleVisibility: .visible
        ) {
            Button("删除", role: .destructive) {
                if let target = deleteTarget { model.deletePoolItem(id: target.id) }
                deleteTarget = nil
            }
            Button("取消", role: .cancel) { deleteTarget = nil }
        } message: {
            Text("会同时删掉它已经排到日历上的时间块。")
        }
    }

    /// 定位：跳到这条曲目最近一次排期所在的那天
    private func locate(_ item: PoolItem) {
        let dates = model.tasks.filter { $0.templateId == item.id }.map(\.date).sorted()
        guard let target = dates.first else {
            showNotScheduled = true
            return
        }
        openedRowId = nil
        onLocate(target)
    }

    // MARK: - 总览

    private var summaryBar: some View {
        HStack(spacing: 0) {
            summaryCell(value: "\(filteredPool.count)", label: "条目")
            divider
            summaryCell(value: Format.formatSecs(totalSeconds), label: "总时长", mono: true)
            divider
            summaryCell(value: "\(model.tasks.count)", label: "日历块", mono: true)
        }
        .padding(.vertical, 12)
        .glass(cornerRadius: 20)
    }

    private var divider: some View {
        Rectangle().fill(.white.opacity(0.08)).frame(width: 1, height: 26)
    }

    private func summaryCell(value: String, label: String, mono: Bool = false) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 17, weight: .semibold))
                .monospacedDigit()
                .foregroundStyle(.white)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(label)
                .font(.system(size: 11))
                .foregroundStyle(Color(white: 0.5))
        }
        .frame(maxWidth: .infinity)
    }

    private var emptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: search.isEmpty ? "tray" : "magnifyingglass")
                .font(.system(size: 30))
                .foregroundStyle(Color(white: 0.35))
            Text(search.isEmpty ? "任务池是空的" : "没有匹配的条目")
                .font(.subheadline)
                .foregroundStyle(Color(white: 0.55))
            if search.isEmpty {
                Button("添加第一条") { showQuickAdd = true }
                    .font(.subheadline.weight(.semibold))
                    .tint(Theme.accent)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }

    // MARK: - 数据

    private var filteredPool: [PoolItem] {
        let keyword = search.trimmingCharacters(in: .whitespaces).lowercased()
        guard !keyword.isEmpty else { return model.pool }
        return model.pool.filter { item in
            let haystack = [
                item.name,
                name(of: item.musicianId, type: "musician"),
                name(of: item.projectId, type: "project"),
                name(of: item.instrumentId, type: "instrument"),
            ].joined(separator: " ").lowercased()
            return haystack.contains(keyword)
        }
    }

    private var totalSeconds: Int {
        filteredPool.reduce(0) { $0 + TimeMath.parseTime($1.estDuration) }
    }


    /// 按当前维度分组，空组不显示；组内按名称排序。
    private var groups: [PoolGroup] {
        let entries = groupBy == .musician ? model.settings.musicians : model.settings.projects
        let scheduledTemplates = Set(model.tasks.compactMap(\.templateId))

        return entries.compactMap { entry in
            let items = filteredPool.filter {
                (groupBy == .musician ? $0.musicianId : $0.projectId) == entry.id
            }
            guard !items.isEmpty else { return nil }

            let schedules = model.tasks.filter {
                (groupBy == .musician ? $0.musicianId : $0.projectId) == entry.id
            }
            let stats = PoolStats.computeGroupStats(
                poolItems: items, scheduleItems: schedules,
                recordType: groupBy.recordType, defaultRatio: entry.defaultRatio
            )

            return PoolGroup(
                id: entry.id,
                title: entry.name,
                statusKey: stats?.statusKey ?? "pending",
                totalSeconds: items.reduce(0) { $0 + TimeMath.parseTime($1.estDuration) },
                // 「已排」数的是日历上属于这个乐手/项目的块。
                // 只认 templateId 的话，历史上直接按乐手拖出来的块（没有 templateId）永远算 0。
                blockCount: schedules.count,
                rows: items
                    .map { item in
                        PoolRow(
                            item: item,
                            title: displayName(of: item),
                            subtitle: subtitle(of: item),
                            isScheduled: scheduledTemplates.contains(item.id)
                        )
                    }
                    .sorted { $0.title.localizedStandardCompare($1.title) == .orderedAscending }
            )
        }
    }

    private func toggle(_ id: String) {
        if expanded.contains(id) { expanded.remove(id) } else { expanded.insert(id) }
    }

    // MARK: - 文案

    /// 名称兜底：导入进来的条目常常没有 name，退回乐器名，再退回项目名，绝不显示空行。
    private func displayName(of item: PoolItem) -> String {
        let trimmed = item.name.trimmingCharacters(in: .whitespaces)
        if !trimmed.isEmpty { return trimmed }
        let instrument = name(of: item.instrumentId, type: "instrument")
        if !instrument.isEmpty { return instrument }
        let project = name(of: item.projectId, type: "project")
        return project.isEmpty ? "未命名曲目" : project
    }

    /// 副标题按分组维度换另一边的信息，避免重复显示当前分组名。
    private func subtitle(of item: PoolItem) -> String {
        let instrument = name(of: item.instrumentId, type: "instrument")
        let other = groupBy == .musician
            ? name(of: item.projectId, type: "project")
            : name(of: item.musicianId, type: "musician")
        return [other, instrument].filter { !$0.isEmpty }.joined(separator: " · ")
    }

    private func name(of id: String?, type: String) -> String {
        guard let id, !id.isEmpty else { return "" }
        return NameLookup.name(forId: id, type: type, settings: model.settings)
    }
}

// MARK: - 分组模型

private struct PoolGroup: Identifiable {
    let id: String
    let title: String
    let statusKey: String
    let totalSeconds: Int
    /// 日历上属于这一组的时间块数量
    let blockCount: Int
    let rows: [PoolRow]
}

private struct PoolRow: Identifiable {
    let item: PoolItem
    let title: String
    let subtitle: String
    let isScheduled: Bool

    var id: String { item.id }
}

// MARK: - 分组卡片

private struct GroupCard: View {
    let group: PoolGroup
    let isExpanded: Bool
    @Binding var openedRowId: String?
    let onToggle: () -> Void
    let onSchedule: (PoolItem) -> Void
    let onOpen: (PoolItem) -> Void
    let onLocate: (PoolItem) -> Void
    let onEdit: (PoolItem) -> Void
    let onDelete: (PoolItem) -> Void

    var body: some View {
        VStack(spacing: 0) {
            header

            if isExpanded {
                VStack(spacing: 0) {
                    ForEach(group.rows) { row in
                        Divider().overlay(Color.white.opacity(0.06))
                        SwipeRow(
                            rowId: row.id,
                            openedRowId: $openedRowId,
                            actions: [
                                SwipeActionSpec(title: "定位", icon: "scope", tint: Theme.accent) { onLocate(row.item) },
                                SwipeActionSpec(title: "编辑", icon: "square.and.pencil", tint: Color(white: 0.42)) { onEdit(row.item) },
                                SwipeActionSpec(title: "删除", icon: "trash", tint: .red) { onDelete(row.item) },
                            ]
                        ) {
                            ItemRow(row: row, onSchedule: onSchedule, onOpen: onOpen)
                        }
                    }
                }
            }
        }
        .glass(cornerRadius: 20)
    }

    private var header: some View {
        Button(action: onToggle) {
            HStack(spacing: 10) {
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Color(white: 0.45))
                    .rotationEffect(.degrees(isExpanded ? 90 : 0))

                VStack(alignment: .leading, spacing: 3) {
                    Text(group.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .lineLimit(1)
                    Text("\(group.rows.count) 条 · \(Format.formatSecs(group.totalSeconds)) · 已排 \(group.blockCount) 块")
                        .font(.system(size: 12))
                        .monospacedDigit()
                        .foregroundStyle(Color(white: 0.5))
                        .lineLimit(1)
                }

                Spacer(minLength: 6)

                StatusBadge(key: group.statusKey)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 13)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - 左滑操作

struct SwipeActionSpec: Identifiable {
    let title: String
    let icon: String
    let tint: Color
    let action: () -> Void

    var id: String { title }
}

/// 行左滑露出操作按钮。用自绘而不是 List 的 .swipeActions——
/// 任务池是自定义卡片布局，不是 List。
private struct SwipeRow<Content: View>: View {
    let rowId: String
    @Binding var openedRowId: String?
    let actions: [SwipeActionSpec]
    @ViewBuilder let content: Content

    /// 手指当前的横向位移（仅拖动过程中有值）
    @State private var dragX: CGFloat = 0

    private let slotWidth: CGFloat = 62

    private var isOpen: Bool { openedRowId == rowId }
    private var revealWidth: CGFloat { CGFloat(actions.count) * slotWidth + 12 }
    /// 静止时按开合状态定位，拖动时跟手；两头都留一点橡皮筋余量
    private var offset: CGFloat {
        let base = isOpen ? -revealWidth : 0
        return min(0, max(-revealWidth - 24, base + dragX))
    }

    var body: some View {
        ZStack(alignment: .trailing) {
            // 操作区：自己的深色底，和任务条明显分层
            ZStack(alignment: .trailing) {
                Color(white: 0.08)
                HStack(spacing: 0) {
                    ForEach(actions) { action in
                        Button {
                            openedRowId = nil
                            dragX = 0
                            action.action()
                        } label: {
                            VStack(spacing: 2) {
                                Image(systemName: action.icon)
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundStyle(.white)
                                    .frame(width: 32, height: 32)
                                    .background(action.tint, in: Circle())
                                Text(action.title)
                                    .font(.system(size: 9))
                                    .foregroundStyle(Color(white: 0.62))
                            }
                            .frame(width: slotWidth)
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.trailing, 10)
            }
            // 只在划开的那段宽度里露出，免得关着时从行底下透出来
            .mask(alignment: .trailing) {
                Rectangle().frame(width: max(0, -offset))
            }

            content
                // 行划开时，点行本身只负责收回去。
                // 这层必须加在 .offset 之前：offset 不改布局框，
                // 加在后面的话它会盖住整行原始宽度，把按钮的点击也吃掉。
                .overlay {
                    if isOpen {
                        Color.black.opacity(0.001)
                            .contentShape(Rectangle())
                            .onTapGesture { close() }
                    }
                }
                // 不透明底：任务条要能把下面的操作区完全盖住，两层才分得开
                .background(Color(white: 0.13))
                .offset(x: offset)
                .gesture(swipeGesture)
        }
        // 按钮不许溢出到上下两行去
        .clipped()
        .animation(.spring(response: 0.28, dampingFraction: 0.86), value: offset)
        .onChange(of: openedRowId) { _, value in
            if value != rowId { dragX = 0 }
        }
    }

    private var swipeGesture: some Gesture {
        DragGesture(minimumDistance: 14)
            .onChanged { value in
                // 竖着划的交给外层滚动，不抢
                guard abs(value.translation.width) > abs(value.translation.height) else { return }
                dragX = value.translation.width
            }
            .onEnded { value in
                guard abs(value.translation.width) > abs(value.translation.height) else {
                    dragX = 0
                    return
                }
                let projected = value.translation.width + value.predictedEndTranslation.width * 0.2
                let shouldOpen = isOpen ? projected < revealWidth / 2 : projected < -revealWidth / 2
                dragX = 0
                openedRowId = shouldOpen ? rowId : nil
            }
    }

    private func close() {
        dragX = 0
        openedRowId = nil
    }
}

// MARK: - 条目行

private struct ItemRow: View {
    let row: PoolRow
    let onSchedule: (PoolItem) -> Void
    let onOpen: (PoolItem) -> Void

    var body: some View {
        // 外层不用 Button：Button 会把横向滑动也当成点击吃掉，左滑就永远打不开操作区。
        // 用 onTapGesture，手指划出阈值后点击自动作废，交给外层的滑动手势。
        HStack(spacing: 10) {
            Circle()
                .fill(row.isScheduled ? Color.green.opacity(0.9) : Color(white: 0.3))
                .frame(width: 6, height: 6)

            VStack(alignment: .leading, spacing: 2) {
                Text(row.title)
                    .font(.system(size: 15))
                    .foregroundStyle(.white)
                    .lineLimit(1)
                if !row.subtitle.isEmpty {
                    Text(row.subtitle)
                        .font(.system(size: 11))
                        .foregroundStyle(Color(white: 0.45))
                        .lineLimit(1)
                }
            }

            Spacer(minLength: 6)

            Text(row.item.estDuration ?? "--:--")
                .font(.system(size: 13))
                .monospacedDigit()
                .foregroundStyle(Color(white: 0.62))

            Button { onSchedule(row.item) } label: {
                Image(systemName: row.isScheduled ? "calendar.badge.checkmark" : "calendar.badge.plus")
                    .font(.system(size: 15))
                    .foregroundStyle(row.isScheduled ? Color(white: 0.4) : Theme.accent)
                    .frame(width: 32, height: 32)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
        .onTapGesture { onOpen(row.item) }
    }
}

// MARK: - 四态徽标

private struct StatusBadge: View {
    let key: String

    var body: some View {
        let (label, color) = Self.style(key)
        return Text(label)
            .font(.system(size: 11, weight: .semibold))
            .padding(.horizontal, 7)
            .padding(.vertical, 3)
            .background(color.opacity(0.16), in: Capsule())
            .foregroundStyle(color)
    }

    static func style(_ key: String) -> (String, Color) {
        switch key {
        case "completed": ("完成", .green)
        case "in-progress": ("进行中", Theme.accent)
        case "insufficient": ("缺时", .orange)
        case "full": ("已排", .purple)
        default: ("未排", Color(white: 0.5))
        }
    }
}

// MARK: - 条目详情（倍率等细节收在这里）

private struct ItemDetailSheet: View {
    let model: AppModel
    let item: PoolItem
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var musicDuration = ""
    @State private var estDuration = ""
    @State private var projectId = ""
    @State private var musicianId = ""
    @State private var instrumentId = ""
    @State private var loaded = false

    var body: some View {
        NavigationStack {
            Form {
                Section("曲目") {
                    TextField("名称", text: $name)
                    TextField("乐曲时长（MM:SS）", text: $musicDuration)
                        .monospacedDigit()
                    TextField("预计录制（HH:MM:SS）", text: $estDuration)
                        .monospacedDigit()
                    LabeledContent("倍率", value: item.ratio.map { String(format: "×%.1f", $0) } ?? "-")
                }
                Section("归属") {
                    entryPicker("项目", selection: $projectId, entries: model.settings.projects)
                    entryPicker("乐手", selection: $musicianId, entries: model.settings.musicians)
                    entryPicker("乐器", selection: $instrumentId, entries: model.settings.instruments)
                }
                if !schedules.isEmpty {
                    Section("已排期") {
                        ForEach(schedules, id: \.scheduleId) { task in
                            LabeledContent(task.date, value: "\(task.startTime) · \(task.estDuration)")
                                .monospacedDigit()
                        }
                    }
                }
            }
            .navigationTitle(item.name.isEmpty ? "曲目详情" : item.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("取消") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("保存") { save() } }
            }
            .onAppear(perform: load)
        }
    }

    /// 允许「未指定」，否则历史数据里没归属的条目会选中一个不属于它的项
    private func entryPicker(_ title: String, selection: Binding<String>, entries: [SettingEntry]) -> some View {
        Picker(title, selection: selection) {
            Text("未指定").tag("")
            ForEach(entries, id: \.id) { Text($0.name).tag($0.id) }
        }
    }

    private func load() {
        guard !loaded else { return }
        loaded = true
        name = item.name
        musicDuration = item.musicDuration ?? ""
        estDuration = item.estDuration ?? ""
        projectId = item.projectId ?? ""
        musicianId = item.musicianId ?? ""
        instrumentId = item.instrumentId ?? ""
    }

    private func save() {
        var updated = item
        updated.name = name.trimmingCharacters(in: .whitespaces)
        updated.musicDuration = blankToNil(musicDuration)
        updated.estDuration = blankToNil(estDuration)
        updated.projectId = blankToNil(projectId)
        updated.musicianId = blankToNil(musicianId)
        updated.instrumentId = blankToNil(instrumentId)
        model.updatePoolItem(updated)
        dismiss()
    }

    private func blankToNil(_ value: String) -> String? {
        let trimmed = value.trimmingCharacters(in: .whitespaces)
        return trimmed.isEmpty ? nil : trimmed
    }

    private var schedules: [Schedule] {
        model.tasks.filter { $0.templateId == item.id }
            .sorted { ($0.date, $0.startTime) < ($1.date, $1.startTime) }
    }
}

// MARK: - 快速添加

private struct QuickAddSheet: View {
    let model: AppModel
    @Environment(\.dismiss) private var dismiss

    @State private var projectId = ""
    @State private var instrumentId = ""
    @State private var musicianId = ""
    @State private var musicDuration = "02:00"

    var body: some View {
        NavigationStack {
            Form {
                Picker("项目", selection: $projectId) {
                    ForEach(model.settings.projects, id: \.id) { Text($0.name).tag($0.id) }
                }
                Picker("乐手", selection: $musicianId) {
                    ForEach(model.settings.musicians, id: \.id) { Text($0.name).tag($0.id) }
                }
                Picker("乐器", selection: $instrumentId) {
                    ForEach(model.settings.instruments, id: \.id) { Text($0.name).tag($0.id) }
                }
                TextField("乐曲时长 (MM:SS)", text: $musicDuration)
            }
            .navigationTitle("快速添加")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("取消") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("添加") {
                        model.addPoolItem(projectId: projectId, instrumentId: instrumentId, musicianId: musicianId, musicDuration: musicDuration)
                        dismiss()
                    }
                    .disabled(projectId.isEmpty || instrumentId.isEmpty || musicianId.isEmpty || musicDuration.isEmpty)
                }
            }
            .onAppear {
                projectId = model.settings.projects.first?.id ?? ""
                musicianId = model.settings.musicians.first?.id ?? ""
                instrumentId = model.settings.instruments.first?.id ?? ""
            }
        }
    }
}

// MARK: - 排期

private struct ScheduleSheet: View {
    let model: AppModel
    let item: PoolItem
    @Environment(\.dismiss) private var dismiss

    @State private var date = Date()
    @State private var time = Date()
    @State private var showConflict = false

    var body: some View {
        NavigationStack {
            Form {
                DatePicker("日期", selection: $date, displayedComponents: .date)
                DatePicker("时间", selection: $time, displayedComponents: .hourAndMinute)
                LabeledContent("预计时长", value: item.estDuration ?? "-")
            }
            .navigationTitle("安排 \(item.name.isEmpty ? "曲目" : item.name)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("取消") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("安排") {
                        let cal = Calendar.current
                        let dateStr = Format.formatYMD(date)
                        let startTime = TimeMath.formatClock(cal.component(.hour, from: time), cal.component(.minute, from: time))
                        if model.schedulePoolItem(item, dateStr: dateStr, startTime: startTime) {
                            dismiss()
                        } else {
                            showConflict = true
                        }
                    }
                }
            }
            .alert("时间冲突", isPresented: $showConflict) {
                Button("好", role: .cancel) {}
            } message: {
                Text("该时间段已有同类型的其他安排。")
            }
        }
    }
}

// MARK: - CSV 导入

private struct ImportCSVSheet: View {
    let model: AppModel
    @Environment(\.dismiss) private var dismiss

    @State private var text = ""
    @State private var preview: [CSVImportRow] = []

    var body: some View {
        NavigationStack {
            Form {
                TextEditor(text: $text)
                    .frame(minHeight: 120)
                    .font(.system(.caption, design: .monospaced))
                Text("每行一列：项目,乐手,乐器,时长（如 专辑A,王老师,曲笛,02:00）")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Button("解析预览") {
                    let rows = CSV.parseCSVRobust(text)
                    preview = model.previewCSVImport(Array(rows.dropFirst()))
                }

                if !preview.isEmpty {
                    Section("预览（\(preview.count) 行）") {
                        ForEach(preview) { row in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text("\(row.projectName) · \(row.musicianName)")
                                        .lineLimit(1)
                                    Text("\(row.instrumentName) · \(row.duration)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text(row.status)
                                    .font(.caption).bold()
                                    .foregroundStyle(row.status == "NEW" ? .blue : .secondary)
                            }
                        }
                    }
                }
            }
            .navigationTitle("导入 CSV")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("取消") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("导入") {
                        _ = model.confirmCSVImport(preview)
                        dismiss()
                    }
                    .disabled(preview.isEmpty)
                }
            }
        }
    }
}
