import SwiftUI
import MuscheCore

/// 任务块的外观映射（对应 schedule.js 的 getTaskStyle / getBlockTitle 里的配色与标题）。
enum TaskDisplay {
    /// 与 Web 版 getTaskStyle 同序同色：项目→黄，乐器→蓝，其余（乐手）→紫。
    static func color(for task: Schedule) -> Color {
        if task.projectId != nil { return Theme.projectColor }
        if task.instrumentId != nil { return Theme.instrumentColor }
        return Theme.musicianColor
    }

    /// 对应 getBlockTitle：把 id 解析成名字。解析不到时退回可读标签，
    /// 绝不把 "tmjfhon1p1hrwgql" 这样的原始 id 显示给用户。
    static func title(for task: Schedule, settings: Settings) -> String {
        if let id = task.musicianId, !id.isEmpty {
            return resolved(id, type: "musician", fallback: "乐手", settings: settings)
        }
        if let id = task.projectId, !id.isEmpty {
            return resolved(id, type: "project", fallback: "项目", settings: settings)
        }
        if let id = task.instrumentId, !id.isEmpty {
            return resolved(id, type: "instrument", fallback: "乐器", settings: settings)
        }
        return "未命名日程"
    }

    private static func resolved(_ id: String, type: String, fallback: String, settings: Settings) -> String {
        let name = NameLookup.name(forId: id, type: type, settings: settings)
        let trimmed = name.trimmingCharacters(in: .whitespaces)
        // NameLookup 找不到时会回传 id 本身，这种情况显示「乐手（未匹配）」而不是一串 id
        if trimmed.isEmpty || trimmed == id { return "\(fallback)（未匹配）" }
        return trimmed
    }
}
