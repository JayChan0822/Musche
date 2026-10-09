import Foundation

/// `features/import-csv.js` 里「去重/匹配/状态判定」的直译移植。
/// 预览表格 + 逐行勾选在 SwiftUI 重做，这里的归一与判定照搬。
public enum ImportMatch {

    /// 移植 `normalizeImportMatch`：trim + 小写。
    public static func normalizeImportMatch(_ value: String?) -> String {
        (value ?? "").trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    }

    /// 移植 `normalizeTime`：截取前 5 个字符（HH:MM）。
    public static func normalizeTime(_ value: String?) -> String {
        guard let value, !value.isEmpty else { return "" }
        return String(value.prefix(5))
    }

    /// 移植 existingTask 判定：项目名 + 乐器名 + 乐手名 归一后全等即为重复。
    public static func findDuplicate(
        in pool: [PoolItem],
        sessionId: String,
        projectName: String,
        instrumentName: String,
        musicianName: String,
        settings: Settings
    ) -> Bool {
        pool.contains { item in
            (item.sessionId ?? "S_DEFAULT") == sessionId &&
            normalizeImportMatch(NameLookup.name(forId: item.projectId, type: "project", settings: settings)) == normalizeImportMatch(projectName) &&
            normalizeImportMatch(item.name.isEmpty ? NameLookup.name(forId: item.instrumentId, type: "instrument", settings: settings) : item.name) == normalizeImportMatch(instrumentName) &&
            normalizeImportMatch(item.musicianId.map { NameLookup.name(forId: $0, type: "musician", settings: settings) } ?? "") == normalizeImportMatch(musicianName)
        }
    }

    /// 移植 `calculateStatus`：无数据 → SKIP；重复 →（有差异 ? UPDATE : SKIP）；否则（任务模式 ? NEW : SKIP）。
    public static func calculateStatus(hasData: Bool, isDuplicate: Bool, hasSpecificDiff: Bool, isTaskMode: Bool) -> String {
        if !hasData { return "SKIP" }
        if isDuplicate { return hasSpecificDiff ? "UPDATE" : "SKIP" }
        return isTaskMode ? "NEW" : "SKIP"
    }
}
