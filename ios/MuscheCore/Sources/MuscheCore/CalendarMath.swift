import Foundation

/// `app/scripts/features/calendar-view.js` 里纯日期运算部分的直译移植。
public enum CalendarMath {

    public static let weekdayNames = ["日", "一", "二", "三", "四", "五", "六"]

    public struct MonthDay: Equatable {
        public var fullDate: String
        public var dayNum: Int
        public var isCurrentMonth: Bool
        public var date: Date
    }

    public struct WeekDay: Equatable {
        public var dateStr: String
        public var weekday: String
        public var dateShort: String
    }

    /// 移植 `generateMonthGrid`：月网格（含跨月补白，35 或 42 格）。
    public static func generateMonthGrid(_ targetDate: Date) -> [MonthDay] {
        let cal = Calendar.current
        let year = cal.component(.year, from: targetDate)
        let month = cal.component(.month, from: targetDate)

        var firstComps = DateComponents()
        firstComps.year = year
        firstComps.month = month
        firstComps.day = 1
        let firstDay = cal.date(from: firstComps)!

        let firstWeekday = cal.component(.weekday, from: firstDay) // 1=周日
        let daysInMonth = cal.range(of: .day, in: .month, for: firstDay)!.count

        var days: [MonthDay] = []

        // 前导补白：firstDay.getDay() 天（0=周日 → 无补白）
        for index in stride(from: firstWeekday - 1, to: 0, by: -1) {
            let d = cal.date(byAdding: .day, value: -index, to: firstDay)!
            days.append(MonthDay(fullDate: Format.formatYMD(d), dayNum: cal.component(.day, from: d), isCurrentMonth: false, date: d))
        }

        for day in 1...daysInMonth {
            let d = cal.date(byAdding: .day, value: day - 1, to: firstDay)!
            days.append(MonthDay(fullDate: Format.formatYMD(d), dayNum: day, isCurrentMonth: true, date: d))
        }

        let targetLength = days.count <= 35 ? 35 : 42
        var k = 1
        while days.count < targetLength {
            let d = cal.date(byAdding: .day, value: daysInMonth + k - 1, to: firstDay)!
            days.append(MonthDay(fullDate: Format.formatYMD(d), dayNum: cal.component(.day, from: d), isCurrentMonth: false, date: d))
            k += 1
        }

        return days
    }

    /// 移植 `currentWeekDays`：从 viewDate 推出所在周（周日开始）的 7 天。
    public static func currentWeekDays(_ viewDate: Date) -> [WeekDay] {
        let cal = Calendar.current
        let weekday = cal.component(.weekday, from: viewDate) // 1=周日
        let start = cal.date(byAdding: .day, value: -(weekday - 1), to: viewDate)!

        var days: [WeekDay] = []
        for index in 0..<7 {
            let current = cal.date(byAdding: .day, value: index, to: start)!
            let wd = cal.component(.weekday, from: current)
            let month = cal.component(.month, from: current)
            let day = cal.component(.day, from: current)
            days.append(WeekDay(
                dateStr: Format.formatYMD(current),
                weekday: weekdayNames[wd - 1],
                dateShort: "\(month)/\(day)"
            ))
        }
        return days
    }

    /// 日视图顶部周日期条的一格。
    public struct WeekStripDay: Equatable, Identifiable {
        public var fullDate: String
        public var dayNum: Int
        public var weekdayName: String
        public var isToday: Bool

        public var id: String { fullDate }

        public init(fullDate: String, dayNum: Int, weekdayName: String, isToday: Bool) {
            self.fullDate = fullDate
            self.dayNum = dayNum
            self.weekdayName = weekdayName
            self.isToday = isToday
        }
    }

    /// "YYYY-MM-DD" → Date（本地时区当天零点）。格式不对返回 nil。
    public static func parseYMD(_ dateStr: String) -> Date? {
        let parts = dateStr.split(separator: "-").map(String.init)
        guard parts.count == 3,
              let year = Int(parts[0]), let month = Int(parts[1]), let day = Int(parts[2]) else { return nil }
        var comps = DateComponents()
        comps.year = year
        comps.month = month
        comps.day = day
        return Calendar.current.date(from: comps)
    }

    /// 某天所在周（周日开始）的 7 天，供日视图顶部周日期条使用。
    public static func weekDays(around dateStr: String, today: Date = Date()) -> [WeekStripDay] {
        guard let date = parseYMD(dateStr) else { return [] }
        let cal = Calendar.current
        let weekday = cal.component(.weekday, from: date) // 1=周日
        guard let start = cal.date(byAdding: .day, value: -(weekday - 1), to: date) else { return [] }
        let todayStr = Format.formatYMD(today)

        return (0..<7).compactMap { index in
            guard let current = cal.date(byAdding: .day, value: index, to: start) else { return nil }
            let full = Format.formatYMD(current)
            return WeekStripDay(
                fullDate: full,
                dayNum: cal.component(.day, from: current),
                weekdayName: weekdayNames[cal.component(.weekday, from: current) - 1],
                isToday: full == todayStr
            )
        }
    }

    /// "YYYY-MM-DD" 加减天数（跨月跨年由 Calendar 处理）。解析失败时原样返回。
    public static func shiftDay(_ dateStr: String, by offset: Int) -> String {
        guard let date = parseYMD(dateStr),
              let shifted = Calendar.current.date(byAdding: .day, value: offset, to: date) else { return dateStr }
        return Format.formatYMD(shifted)
    }

    /// 移植 `timeSlots`：startHour..<endHour 每个整点 + 半点。
    public static func timeSlots(startHour: Int, endHour: Int) -> [String] {
        var slots: [String] = []
        for hour in startHour..<endHour {
            slots.append("\(hour):00")
            slots.append("\(hour):30")
        }
        return slots
    }

    /// 移植 `tasksByDateMap`：按日期分组，组内按分钟数排序（历史没补零的值也不会排错）。
    public static func tasksByDateMap(_ tasks: [Schedule]) -> [String: [Schedule]] {
        var map: [String: [Schedule]] = [:]
        for task in tasks {
            map[task.date, default: []].append(task)
        }
        for (date, list) in map {
            map[date] = list.sorted {
                (TimeMath.timeToMinutes($0.startTime) ?? 0) < (TimeMath.timeToMinutes($1.startTime) ?? 0)
            }
        }
        return map
    }
}
