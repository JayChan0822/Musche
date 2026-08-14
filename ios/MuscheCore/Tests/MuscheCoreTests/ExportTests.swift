import XCTest
@testable import MuscheCore

/// 对应 export-csv.js 的取数/格式化纯函数。
final class ExportTests: XCTestCase {

    func testFormatEstDuration() {
        XCTAssertEqual(Export.formatEstDuration(0), "")
        XCTAssertEqual(Export.formatEstDuration(-5), "")
        XCTAssertEqual(Export.formatEstDuration(90), "01:30")
        XCTAssertEqual(Export.formatEstDuration(3723), "01:02:03")
    }

    func testWeekdayLabel() {
        // 2026-08-14 是周五
        XCTAssertEqual(Export.weekdayLabel("2026-08-14"), "周五")
        XCTAssertEqual(Export.weekdayLabel("not-a-date"), "")
    }

    func testInstrumentLabel() {
        XCTAssertEqual(Export.instrumentLabel(name: "曲笛", family: "Ethnic Woodwinds", splitTag: nil), "Ethnic Woodwinds 曲笛")
        XCTAssertEqual(Export.instrumentLabel(name: "曲笛", family: "Ethnic Woodwinds", splitTag: "Part 2"), "Ethnic Woodwinds 曲笛 (Part 2)")
        XCTAssertEqual(Export.instrumentLabel(name: "未知乐器", family: "", splitTag: nil), "")
    }

    func testBuildRows() {
        var s = Settings.defaults()
        s.musicians = [SettingEntry(id: "M1", name: "王老师")]
        s.projects = [SettingEntry(id: "P1", name: "专辑 A")]
        s.instruments = [SettingEntry(id: "I1", name: "曲笛", color: "#60a5fa", group: "Ethnic Woodwinds")]

        var item = PoolItem(id: "T1", name: "曲笛")
        item.sessionId = "S_DEFAULT"
        item.musicianId = "M1"
        item.projectId = "P1"
        item.instrumentId = "I1"
        item.sectionIndex = 0

        let task = Schedule(scheduleId: "S1", date: "2026-08-14", startTime: "10:00", estDuration: "00:30:00",
                            musicianId: "M1", recordingInfo: ["notes": "test"])

        let rows = Export.buildRows(tasks: [task], pool: [item], settings: s, sessionId: "S_DEFAULT")

        XCTAssertEqual(rows.count, 1)
        let row = rows[0]
        XCTAssertEqual(row.type, "REC")
        XCTAssertEqual(row.weekday, "周五")
        XCTAssertEqual(row.estDuration, "30:00", "formatEstDuration 对 <1h 输出 MM:SS（30 分钟 = 30:00）")
        XCTAssertEqual(row.musician, "王老师")
        XCTAssertEqual(row.instLabel, "Ethnic Woodwinds 曲笛")
        XCTAssertEqual(row.project, "专辑 A")
        XCTAssertEqual(row.notes, "test")
    }

    func testCsvEscaping() {
        XCTAssertEqual(Export.csvEscape("a,b"), "\"a,b\"")
        XCTAssertEqual(Export.csvEscape("a\"b"), "\"a\"\"b\"")
        XCTAssertEqual(Export.csvEscape("plain"), "plain")
        XCTAssertEqual(Export.csvLine(["a,b", "c"]), "\"a,b\",c")
    }
}
