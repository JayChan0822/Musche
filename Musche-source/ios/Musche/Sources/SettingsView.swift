import SwiftUI
import MuscheCore

/// 设置页：日程（Session）管理 + 乐手/项目/乐器等元数据的增删改 + 时间轴时段。
/// 对应 Web 版 features/settings.js 与 features/session.js。
struct SettingsView: View {
    let model: AppModel
    @Environment(\.dismiss) private var dismiss

    @State private var newSessionName = ""
    @State private var renameTarget: SettingEntry?
    @State private var renameText = ""
    @State private var deleteSessionTarget: SettingEntry?
    @State private var sessionAlert: String?

    var body: some View {
        NavigationStack {
            Form {
                sessionSection
                metadataSection
                hoursSection
            }
            .navigationTitle("设置")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) { Button("完成") { dismiss() } }
            }
            .alert("提示", isPresented: Binding(get: { sessionAlert != nil }, set: { if !$0 { sessionAlert = nil } })) {
                Button("好", role: .cancel) {}
            } message: {
                Text(sessionAlert ?? "")
            }
            .alert("重命名日程", isPresented: Binding(get: { renameTarget != nil }, set: { if !$0 { renameTarget = nil } })) {
                TextField("名称", text: $renameText)
                Button("保存") {
                    if let target = renameTarget, !renameText.trimmingCharacters(in: .whitespaces).isEmpty {
                        model.renameSession(id: target.id, name: renameText.trimmingCharacters(in: .whitespaces))
                    }
                    renameTarget = nil
                }
                Button("取消", role: .cancel) { renameTarget = nil }
            }
            .confirmationDialog(
                "删除日程「\(deleteSessionTarget?.name ?? "")」？",
                isPresented: Binding(get: { deleteSessionTarget != nil }, set: { if !$0 { deleteSessionTarget = nil } }),
                titleVisibility: .visible
            ) {
                Button("删除", role: .destructive) {
                    if let target = deleteSessionTarget, !model.deleteSession(id: target.id) {
                        sessionAlert = "至少需要保留一个日程。"
                    }
                    deleteSessionTarget = nil
                }
                Button("取消", role: .cancel) { deleteSessionTarget = nil }
            } message: {
                Text("属于这个日程的任务仍会保留在日程表里。")
            }
        }
    }

    // MARK: - 日程

    private var sessionSection: some View {
        Section {
            ForEach(model.sessions, id: \.id) { session in
                Button {
                    model.currentSessionId = session.id
                } label: {
                    HStack {
                        Text(session.name)
                            .foregroundStyle(.primary)
                        Spacer()
                        if session.id == model.currentSessionId {
                            Image(systemName: "checkmark")
                                .foregroundStyle(Theme.accent)
                        }
                    }
                    .contentShape(Rectangle())
                }
                // 列表行不要用强调色文字，否则整行看起来像链接
                .buttonStyle(.plain)
                .swipeActions(edge: .trailing) {
                    Button("删除", role: .destructive) { deleteSessionTarget = session }
                    Button("重命名") {
                        renameText = session.name
                        renameTarget = session
                    }
                    .tint(.gray)
                }
            }

            HStack {
                TextField("新建日程（例如 2026 春季录音）", text: $newSessionName)
                Button {
                    let name = newSessionName.trimmingCharacters(in: .whitespaces)
                    guard !name.isEmpty else { return }
                    model.addSession(name: name)
                    newSessionName = ""
                } label: {
                    Image(systemName: "plus.circle.fill")
                }
                .disabled(newSessionName.trimmingCharacters(in: .whitespaces).isEmpty)
            }
        } header: {
            Text("日程")
        } footer: {
            Text("新排的任务会记到当前日程；切换日程后，别的日程的任务在日历上显示为灰色。")
        }
    }

    // MARK: - 元数据

    private var metadataSection: some View {
        Section("资料") {
            ForEach(AppModel.EntryKind.allCases) { kind in
                NavigationLink {
                    EntryListView(model: model, kind: kind)
                } label: {
                    HStack {
                        Text(kind.rawValue)
                        Spacer()
                        Text("\(model.entries(kind).count)")
                            .foregroundStyle(.secondary)
                            .monospacedDigit()
                    }
                }
            }
        }
    }

    // MARK: - 时间轴时段

    private var hoursSection: some View {
        Section {
            Stepper("开始 \(model.settings.startHour):00", value: startHourBinding, in: 0...23)
            Stepper("结束 \(model.settings.endHour):00", value: endHourBinding, in: 1...24)
        } header: {
            Text("时间轴")
        } footer: {
            Text("日视图只显示这个时段；结束必须晚于开始。")
        }
    }

    private var startHourBinding: Binding<Int> {
        Binding(
            get: { model.settings.startHour },
            set: { model.updateHours(startHour: $0, endHour: model.settings.endHour) }
        )
    }

    private var endHourBinding: Binding<Int> {
        Binding(
            get: { model.settings.endHour },
            set: { model.updateHours(startHour: model.settings.startHour, endHour: $0) }
        )
    }
}

// MARK: - 单类资料的列表

private struct EntryListView: View {
    let model: AppModel
    let kind: AppModel.EntryKind

    @State private var search = ""
    @State private var editTarget: SettingEntry?
    @State private var deleteTarget: SettingEntry?
    @State private var showAdd = false

    private var entries: [SettingEntry] {
        let keyword = search.trimmingCharacters(in: .whitespaces).lowercased()
        let all = model.entries(kind)
        guard !keyword.isEmpty else { return all }
        return all.filter { $0.name.lowercased().contains(keyword) }
    }

    var body: some View {
        List {
            ForEach(entries, id: \.id) { entry in
                Button {
                    editTarget = entry
                } label: {
                    HStack(spacing: 10) {
                        Circle()
                            .fill(Color(hex: entry.color) ?? Color(white: 0.35))
                            .frame(width: 10, height: 10)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(entry.name.isEmpty ? "未命名" : entry.name)
                                .foregroundStyle(.primary)
                            if let group = entry.group, !group.isEmpty {
                                Text(group)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        Spacer()
                        if kind.hasDefaultRatio, let ratio = entry.defaultRatio {
                            Text(String(format: "×%.1f", ratio))
                                .font(.caption)
                                .monospacedDigit()
                                .foregroundStyle(.secondary)
                        }
                    }
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .swipeActions(edge: .trailing) {
                    Button("删除", role: .destructive) { deleteTarget = entry }
                }
            }
        }
        .searchable(text: $search, prompt: "搜索\(kind.rawValue)")
        .navigationTitle(kind.rawValue)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showAdd = true } label: { Image(systemName: "plus") }
            }
        }
        .sheet(isPresented: $showAdd) {
            EntryEditSheet(model: model, kind: kind, entry: nil)
        }
        .sheet(item: $editTarget) { entry in
            EntryEditSheet(model: model, kind: kind, entry: entry)
        }
        .confirmationDialog(
            "删除「\(deleteTarget?.name ?? "")」？",
            isPresented: Binding(get: { deleteTarget != nil }, set: { if !$0 { deleteTarget = nil } }),
            titleVisibility: .visible
        ) {
            Button("删除", role: .destructive) {
                if let target = deleteTarget { model.deleteEntry(kind, id: target.id) }
                deleteTarget = nil
            }
            Button("取消", role: .cancel) { deleteTarget = nil }
        } message: {
            if let target = deleteTarget {
                let count = model.usageCount(kind, id: target.id)
                Text(count > 0 ? "有 \(count) 条数据在用它，删除后这些数据会变成「未指定」。" : "没有数据在用它。")
            }
        }
    }
}

// MARK: - 新建/编辑一条资料

private struct EntryEditSheet: View {
    let model: AppModel
    let kind: AppModel.EntryKind
    let entry: SettingEntry?
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var group = ""
    @State private var colorHex = ""
    @State private var ratio: Double = 20
    @State private var hasRatio = false
    @State private var loaded = false

    /// 取色盘：与 Web 版的调色板同色系
    private let palette = ["#60a5fa", "#a855f7", "#eab308", "#22c55e", "#ef4444", "#f97316", "#14b8a6", "#ec4899"]

    var body: some View {
        NavigationStack {
            Form {
                Section("名称") {
                    TextField("名称", text: $name)
                    TextField("分组（可空）", text: $group)
                }

                Section("颜色") {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 8), spacing: 10) {
                        ForEach(palette, id: \.self) { hex in
                            Circle()
                                .fill(Color(hex: hex) ?? .gray)
                                .frame(height: 26)
                                .overlay {
                                    if colorHex.caseInsensitiveCompare(hex) == .orderedSame {
                                        Circle().stroke(.white, lineWidth: 2)
                                    }
                                }
                                .onTapGesture { colorHex = hex }
                        }
                    }
                    .padding(.vertical, 4)
                }

                if kind.hasDefaultRatio {
                    Section {
                        Toggle("设置默认倍率", isOn: $hasRatio)
                        if hasRatio {
                            Stepper(String(format: "×%.1f", ratio), value: $ratio, in: 1...100, step: 0.5)
                                .monospacedDigit()
                        }
                    } footer: {
                        Text("新建曲目时按乐曲时长 × 倍率估算录制时长。")
                    }
                }
            }
            .navigationTitle(entry == nil ? "新建\(kind.rawValue)" : "编辑\(kind.rawValue)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("取消") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") { save() }
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear(perform: load)
        }
    }

    private func load() {
        guard !loaded else { return }
        loaded = true
        guard let entry else { return }
        name = entry.name
        group = entry.group ?? ""
        colorHex = entry.color ?? ""
        if let value = entry.defaultRatio {
            ratio = value
            hasRatio = true
        }
    }

    private func save() {
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        let trimmedGroup = group.trimmingCharacters(in: .whitespaces)
        if var existing = entry {
            existing.name = trimmedName
            existing.group = trimmedGroup.isEmpty ? nil : trimmedGroup
            existing.color = colorHex.isEmpty ? nil : colorHex
            existing.defaultRatio = (kind.hasDefaultRatio && hasRatio) ? ratio : nil
            model.updateEntry(kind, existing)
        } else {
            let id = model.addEntry(
                kind,
                name: trimmedName,
                color: colorHex.isEmpty ? nil : colorHex,
                defaultRatio: (kind.hasDefaultRatio && hasRatio) ? ratio : nil
            )
            if !trimmedGroup.isEmpty,
               var created = model.entries(kind).first(where: { $0.id == id }) {
                created.group = trimmedGroup
                model.updateEntry(kind, created)
            }
        }
        dismiss()
    }
}

// MARK: - 让 SettingEntry 能直接喂给 .sheet(item:)

extension SettingEntry: @retroactive Identifiable {}

extension Color {
    /// "#60a5fa" → Color；解析不了返回 nil
    init?(hex: String?) {
        guard var value = hex?.trimmingCharacters(in: .whitespaces), !value.isEmpty else { return nil }
        if value.hasPrefix("#") { value.removeFirst() }
        guard value.count == 6, let number = Int(value, radix: 16) else { return nil }
        self.init(
            red: Double((number >> 16) & 0xFF) / 255,
            green: Double((number >> 8) & 0xFF) / 255,
            blue: Double(number & 0xFF) / 255
        )
    }
}
