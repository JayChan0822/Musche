import Foundation

/// `app/scripts/utils/format.js` 的直译移植。
public enum Format {

    /// 移植 `formatSecs`：秒 → 补零的 "HH:MM:SS"。
    public static func formatSecs(_ value: Any?) -> String {
        let rounded = jsRound(jsToDouble(value))
        return String(format: "%02d:%02d:%02d", rounded / 3600, (rounded % 3600) / 60, rounded % 60)
    }

    /// "YYYY-MM-DD"（本地日历）。
    public static func formatYMD(_ date: Date) -> String {
        let c = Calendar.current.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
    }

    /// 移植 `formatDate`：Date → "YYYY-MM-DD"（本地）。
    public static func formatDate(_ date: Date) -> String {
        formatYMD(date)
    }
}
