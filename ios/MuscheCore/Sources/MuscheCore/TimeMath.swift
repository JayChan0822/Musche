import Foundation

/// `app/scripts/utils/time.js` 的直译移植。
/// 全仓时间字符串约定：startTime 一律是补零的 "HH:MM"；排序按分钟数而非字符串。
public enum TimeMath {

    /// 移植 `parseTime`："HH:MM" / "HH:MM:SS" / 裸数字 → 秒。falsy 或非法输入 → 0。
    public static func parseTime(_ value: Any?) -> Int {
        guard let value, !(value is NSNull) else { return 0 }
        let s = String(describing: value).trimmingCharacters(in: .whitespacesAndNewlines)
        let parts = s.split(separator: ":", omittingEmptySubsequences: false).map { jsNumber(String($0)) }
        if parts.contains(where: { $0 == nil }) { return 0 }
        let nums = parts.compactMap { $0 }
        if nums.count == 2 { return nums[0] * 60 + nums[1] }
        if nums.count == 3 { return nums[0] * 3600 + nums[1] * 60 + nums[2] }
        return nums.first ?? 0
    }

    /// 移植 `timeToMinutes`：返回分钟数；JS 返回 NaN 的情形这里返回 nil，falsy 返回 0。
    public static func timeToMinutes(_ value: Any?) -> Int? {
        guard let value, !(value is NSNull) else { return 0 }
        let s = String(describing: value)
        let parts = s.split(separator: ":", omittingEmptySubsequences: false).map(String.init)
        let hours = parts.count > 0 ? jsNumber(parts[0]) : nil
        let minutes = parts.count > 1 ? jsNumber(parts[1]) : nil
        guard let hours, let minutes else { return nil }
        return hours * 60 + minutes
    }

    /// 移植 `formatClock`：补零的 "HH:MM"。
    public static func formatClock(_ hours: Any?, _ minutes: Any? = 0) -> String {
        let h = Int(String(describing: hours ?? 0)) ?? 0
        let m = Int(String(describing: minutes ?? 0)) ?? 0
        return String(format: "%02d:%02d", h, m)
    }

    /// 移植 `normalizeClock`：把历史遗留的 "9:00" 这类没补零的值补齐；空值/非法值原样返回。
    public static func normalizeClock(_ value: Any?) -> String {
        guard let value, !(value is NSNull) else { return "" }
        let s = String(describing: value)
        if s.isEmpty { return "" } // JS: if (!value) return value
        let parts = s.split(separator: ":", omittingEmptySubsequences: false).map(String.init)
        guard parts.count > 0 else { return s }
        let hours = parts[0]
        guard jsNumber(hours) != nil else { return s }
        let minutes = parts.count > 1 ? parts[1] : "0"
        return formatClock(hours, minutes)
    }

    /// 移植 `addMinutesToTime`：先钳制上下界，再按 step 吸附，输出补零 "HH:MM"。
    public static func addMinutesToTime(
        _ time: Any?,
        _ minutes: Int,
        minMinutes: Int = Int.min,
        maxMinutes: Int = Int.max,
        stepMinutes: Int = 1
    ) -> String {
        var next = (timeToMinutes(time) ?? 0) + minutes
        next = max(minMinutes, min(maxMinutes, next))
        if stepMinutes > 1 {
            next = jsRound(Double(next) / Double(stepMinutes)) * stepMinutes
        }
        return String(format: "%02d:%02d", next / 60, next % 60)
    }

    /// 移植 `addDaysToDate`：按本地日历加天数 → "YYYY-MM-DD"。
    public static func addDaysToDate(_ date: Date, _ days: Int) -> String {
        let next = Calendar.current.date(byAdding: .day, value: days, to: date) ?? date
        return Format.formatYMD(next)
    }
}
