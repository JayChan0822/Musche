import XCTest
@testable import MuscheCore

/// 对应 import-csv.js 的去重/匹配/状态判定纯逻辑。
final class ImportMatchTests: XCTestCase {

    func settings() -> Settings {
        var s = Settings.defaults()
        s.musicians = [SettingEntry(id: "M1", name: "王老师")]
        s.projects = [SettingEntry(id: "P1", name: "专辑 A")]
        return s
    }

    func testNameLookupReverse() {
        let s = settings()
        XCTAssertEqual(NameLookup.id(forName: "王老师", type: "musician", settings: s), "M1")
        XCTAssertEqual(NameLookup.id(forName: "专辑 A", type: "project", settings: s), "P1")
        XCTAssertNil(NameLookup.id(forName: "不存在", type: "musician", settings: s))
    }

    func testNormalizeImportMatch() {
        XCTAssertEqual(ImportMatch.normalizeImportMatch("  Violin  "), "violin")
        XCTAssertEqual(ImportMatch.normalizeImportMatch("ABC"), "abc")
        XCTAssertEqual(ImportMatch.normalizeImportMatch(nil), "")
    }

    func testNormalizeTime() {
        XCTAssertEqual(ImportMatch.normalizeTime("09:00:00"), "09:00")
        XCTAssertEqual(ImportMatch.normalizeTime("09:05"), "09:05")
        XCTAssertEqual(ImportMatch.normalizeTime(""), "")
        XCTAssertEqual(ImportMatch.normalizeTime(nil), "")
    }

    func testCalculateStatus() {
        XCTAssertEqual(ImportMatch.calculateStatus(hasData: false, isDuplicate: false, hasSpecificDiff: false, isTaskMode: true), "SKIP")
        XCTAssertEqual(ImportMatch.calculateStatus(hasData: true, isDuplicate: true, hasSpecificDiff: true, isTaskMode: true), "UPDATE")
        XCTAssertEqual(ImportMatch.calculateStatus(hasData: true, isDuplicate: true, hasSpecificDiff: false, isTaskMode: true), "SKIP")
        XCTAssertEqual(ImportMatch.calculateStatus(hasData: true, isDuplicate: false, hasSpecificDiff: false, isTaskMode: true), "NEW")
        XCTAssertEqual(ImportMatch.calculateStatus(hasData: true, isDuplicate: false, hasSpecificDiff: false, isTaskMode: false), "SKIP")
    }

    func testFindDuplicate() {
        let s = settings()
        var item = PoolItem(id: "T1", name: "曲笛")
        item.sessionId = "S_DEFAULT"
        item.projectId = "P1"
        item.instrumentId = "I1"
        item.musicianId = "M1"

        // 项目/乐器/乐手名全等 → 重复
        XCTAssertTrue(ImportMatch.findDuplicate(in: [item], sessionId: "S_DEFAULT", projectName: "专辑 A", instrumentName: "曲笛", musicianName: "王老师", settings: s))
        // 项目不同 → 不重复
        XCTAssertFalse(ImportMatch.findDuplicate(in: [item], sessionId: "S_DEFAULT", projectName: "专辑 B", instrumentName: "曲笛", musicianName: "王老师", settings: s))
        // 不同 session → 不重复
        XCTAssertFalse(ImportMatch.findDuplicate(in: [item], sessionId: "S_OTHER", projectName: "专辑 A", instrumentName: "曲笛", musicianName: "王老师", settings: s))
    }
}
