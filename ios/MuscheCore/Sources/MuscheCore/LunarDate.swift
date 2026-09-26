import Foundation

/// 农历日期文案（对齐 Apple 日历中文版的显示规则）：
/// 每天显示农历日（初一…三十），但农历初一那天改显示农历月名（正月/二月/…/冬月/腊月），
/// 闰月加「闰」前缀。用系统的 .chinese 历法换算，不自带农历表。
public enum LunarDate {

    /// 农历日名：初一…初十、十一…十九、二十、廿一…廿九、三十
    public static let dayNames = [
        "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
        "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
        "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
    ]

    /// 农历月名（与 Apple 日历一致：十一月叫冬月、十二月叫腊月）
    public static let monthNames = [
        "正月", "二月", "三月", "四月", "五月", "六月",
        "七月", "八月", "九月", "十月", "冬月", "腊月",
    ]

    private static let chineseCalendar: Calendar = {
        var calendar = Calendar(identifier: .chinese)
        calendar.timeZone = .current
        return calendar
    }()

    public struct Value: Equatable {
        /// 显示用文案：初一那天是月名（如「七月」），其余是日名（如「初二」）
        public var label: String
        /// 是否农历月首（初一）——月首那天 Apple 会用不同颜色标出
        public var isMonthStart: Bool

        public init(label: String, isMonthStart: Bool) {
            self.label = label
            self.isMonthStart = isMonthStart
        }
    }

    public static func value(for date: Date) -> Value {
        let comps = chineseCalendar.dateComponents([.month, .day], from: date)
        guard let day = comps.day, day >= 1, day <= 30,
              let month = comps.month, month >= 1, month <= 12 else {
            return Value(label: "", isMonthStart: false)
        }

        if day == 1 {
            let leapPrefix = (comps.isLeapMonth ?? false) ? "闰" : ""
            return Value(label: leapPrefix + monthNames[month - 1], isMonthStart: true)
        }
        return Value(label: dayNames[day - 1], isMonthStart: false)
    }

    /// 便捷取文案
    public static func label(for date: Date) -> String {
        value(for: date).label
    }
}
