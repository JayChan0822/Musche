import Foundation

/// 通用的 `getNameById` 工具（乐手/项目/乐器名称解析）。
public enum NameLookup {

    /// 由 id 解析名称；找不到返回空串。
    public static func name(forId id: String?, type: String, settings: Settings) -> String {
        guard let id, !id.isEmpty else { return "" }
        let list: [SettingEntry]
        switch type {
        case "project": list = settings.projects
        case "instrument": list = settings.instruments
        default: list = settings.musicians
        }
        return list.first(where: { $0.id == id })?.name ?? ""
    }

    /// 反向：由名称解析 id（导入用）；找不到返回 nil。
    public static func id(forName name: String, type: String, settings: Settings) -> String? {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }
        let list: [SettingEntry]
        switch type {
        case "project": list = settings.projects
        case "instrument": list = settings.instruments
        default: list = settings.musicians
        }
        return list.first(where: { $0.name == trimmed })?.id
    }
}
