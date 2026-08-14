import SwiftUI
import MuscheCore

/// M4：任务池。
/// 设计要点：一屏先看「谁还有多少没排」，再逐层展开到具体曲目——
/// 所以顶部是总览条，中间是可折叠的分组卡片（默认收起），条目行只留名称/时长/状态，
/// 倍率这类细节收进详情，避免出现一整屏没有名字的时长行。
struct PoolView: View {
    let model: AppModel

    @State private var groupBy: GroupBy = .musician
    @State private var search = ""
    @State private var expanded: Set<String> = []
    @State private var showQuickAdd = false
    @State private var showImport = false
    @State private var scheduleTarget: PoolItem?
    @State private var detailTarget: PoolItem?

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
                            onToggle: { toggle(group.id) },
                            onSchedule: { scheduleTarget = $0 },
                            onOpen: { detailTarget = $0 }
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
    }

    // MARK: - 总览

    private var summaryBar: some View {
        HStack(spacing: 0) {
            summaryCell(value: "\(filteredPool.count)", label: "条目")
            divider
            summaryCell(value: Format.formatSecs(totalSeconds), label: "总时长", mono: true)
            divider
            summaryCell(value: "\(scheduledCount)/\(filteredPool.count)", label: "已排期", mono: true)
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

    private var scheduledCount: Int {
        let scheduledTemplates = Set(model.tasks.compactMap(\.templateId))
        return filteredPool.filter { scheduledTemplates.contains($0.id) }.count
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
                scheduledCount: items.filter { scheduledTemplates.contains($0.id) }.count,
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
    let scheduledCount: Int
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
    let onToggle: () -> Void
    let onSchedule: (PoolItem) -> Void
    let onOpen: (PoolItem) -> Void

    var body: some View {
        VStack(spacing: 0) {
            header

            if isExpanded {
                VStack(spacing: 0) {
                    ForEach(group.rows) { row in
                        Divider().overlay(Color.white.opacity(0.06))
                        ItemRow(row: row, onSchedule: onSchedule, onOpen: onOpen)
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
                    Text("\(group.rows.count) 条 · \(Format.formatSecs(group.totalSeconds)) · 已排 \(group.scheduledCount)/\(group.rows.count)")
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

// MARK: - 条目行

private struct ItemRow: View {
    let row: PoolRow
    let onSchedule: (PoolItem) -> Void
    let onOpen: (PoolItem) -> Void

    var body: some View {
        Button { onOpen(row.item) } label: {
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
        }
        .buttonStyle(.plain)
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

    var body: some View {
        NavigationStack {
            Form {
                Section("曲目") {
                    LabeledContent("名称", value: item.name.isEmpty ? "未命名" : item.name)
                    LabeledContent("乐曲时长", value: item.musicDuration ?? "-")
                    LabeledContent("预计录制", value: item.estDuration ?? "-")
                    LabeledContent("倍率", value: item.ratio.map { String(format: "×%.1f", $0) } ?? "-")
                }
                Section("归属") {
                    LabeledContent("项目", value: name(item.projectId, "project"))
                    LabeledContent("乐手", value: name(item.musicianId, "musician"))
                    LabeledContent("乐器", value: name(item.instrumentId, "instrument"))
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
                ToolbarItem(placement: .confirmationAction) { Button("完成") { dismiss() } }
            }
        }
    }

    private var schedules: [Schedule] {
        model.tasks.filter { $0.templateId == item.id }
            .sorted { ($0.date, $0.startTime) < ($1.date, $1.startTime) }
    }

    private func name(_ id: String?, _ type: String) -> String {
        guard let id, !id.isEmpty else { return "-" }
        let value = NameLookup.name(forId: id, type: type, settings: model.settings)
        return value.isEmpty ? "-" : value
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
