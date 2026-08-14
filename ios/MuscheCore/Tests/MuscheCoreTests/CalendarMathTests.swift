import XCTest
@testable import MuscheCore

/// 对应 calendar-view.js 里 generateMonthGrid / currentWeekDays / tasksByDateMap 的纯逻辑。
final class CalendarMathTests: XCTestCase {

    func date(_ year: Int, _ month: Int, _ day: Int) -> Date {
        var c = DateComponents()
        c.year = year
        c.month = month
        c.day = day
        c.hour = 12
        return Calendar.current.date(from: c)!
    }

    func testGenerateMonthGridStructure() {
        let cal = Calendar.current
        let grid = CalendarMath.generateMonthGrid(date(2026, 8, 14))

        XCTAssertTrue(grid.count == 35 || grid.count == 42)
        XCTAssertEqual(grid.count % 7, 0)

        let currentMonthDays = grid.filter { $0.isCurrentMonth }
        XCTAssertEqual(currentMonthDays.count, 31, "2026 年 8 月有 31 天")
        XCTAssertEqual(currentMonthDays.first?.dayNum, 1)
        XCTAssertEqual(currentMonthDays.last?.dayNum, 31)

        // 日期逐日连续
        for i in 1..<grid.count {
            let delta = cal.dateComponents([.day], from: grid[i - 1].date, to: grid[i].date).day
            XCTAssertEqual(delta, 1)
        }
    }

    func testCurrentWeekDaysStartsSunday() {
        let week = CalendarMath.currentWeekDays(date(2026, 8, 14))
        XCTAssertEqual(week.count, 7)
        XCTAssertEqual(week[0].weekday, "日")
        XCTAssertEqual(week[6].weekday, "六")
    }

    func testTimeSlots() {
        XCTAssertEqual(CalendarMath.timeSlots(startHour: 10, endHour: 11), ["10:00", "10:30"])
        XCTAssertEqual(CalendarMath.timeSlots(startHour: 10, endHour: 12), ["10:00", "10:30", "11:00", "11:30"])
    }

    func testTasksByDateMapSortsByMinutesNotString() {
        let t1 = Schedule(scheduleId: "1", date: "2026-08-14", startTime: "10:00", estDuration: "")
        let t2 = Schedule(scheduleId: "2", date: "2026-08-14", startTime: "9:00", estDuration: "")

        let map = CalendarMath.tasksByDateMap([t1, t2])
        let list = map["2026-08-14"]!

        XCTAssertEqual(list.map { $0.startTime }, ["9:00", "10:00"], "没补零的 9:00 也必须排在 10:00 之前")
    }
}

// MARK: - 日视图周日期条

extension CalendarMathTests {
    func testWeekDaysAroundReturnsSundayToSaturday() {
        // 2026-08-13 是周四
        let days = CalendarMath.weekDays(around: "2026-08-13", today: CalendarMath.parseYMD("2026-08-13")!)
        XCTAssertEqual(days.map(\.fullDate), [
            "2026-08-09", "2026-08-10", "2026-08-11", "2026-08-12",
            "2026-08-13", "2026-08-14", "2026-08-15",
        ])
        XCTAssertEqual(days.map(\.weekdayName), ["日", "一", "二", "三", "四", "五", "六"])
        XCTAssertEqual(days.filter(\.isToday).map(\.fullDate), ["2026-08-13"])
        XCTAssertEqual(days.map(\.dayNum), [9, 10, 11, 12, 13, 14, 15])
    }

    func testWeekDaysAroundInvalidInput() {
        XCTAssertTrue(CalendarMath.weekDays(around: "not-a-date").isEmpty)
    }

    func testShiftDayCrossesMonthAndYear() {
        XCTAssertEqual(CalendarMath.shiftDay("2026-08-31", by: 1), "2026-09-01")
        XCTAssertEqual(CalendarMath.shiftDay("2026-09-01", by: -1), "2026-08-31")
        XCTAssertEqual(CalendarMath.shiftDay("2026-12-31", by: 1), "2027-01-01")
        XCTAssertEqual(CalendarMath.shiftDay("坏数据", by: 1), "坏数据")
    }
}
