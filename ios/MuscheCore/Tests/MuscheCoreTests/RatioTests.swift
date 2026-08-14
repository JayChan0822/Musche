import XCTest
@testable import MuscheCore

/// 对应 tests/ratio-behavior.test.mjs。
final class RatioTests: XCTestCase {

    func makeSettings(musicians: [SettingEntry] = [], projects: [SettingEntry] = [], instruments: [SettingEntry] = []) -> Settings {
        Settings(startHour: 10, endHour: 22, sessions: [], instruments: instruments,
                 musicians: musicians, projects: projects, studios: [], engineers: [], operators: [], assistants: [])
    }

    func poolItem(_ id: String, musicianId: String? = nil, sessionId: String? = nil,
                  musicDuration: String? = nil, ratio: Double? = nil) -> PoolItem {
        var item = PoolItem(id: id, name: "")
        item.musicianId = musicianId
        item.sessionId = sessionId
        item.musicDuration = musicDuration
        item.ratio = ratio
        return item
    }

    func scheduled(_ id: String, musicianId: String? = nil, sessionId: String? = nil,
                   musicDuration: String? = nil, ratio: Double? = nil) -> Schedule {
        var s = Schedule(scheduleId: id, date: "", startTime: "", estDuration: "")
        s.musicianId = musicianId
        s.sessionId = sessionId
        s.musicDuration = musicDuration
        s.ratio = ratio
        return s
    }

    func testEnsureItemRecordsMigratesLegacyFields() {
        var item = PoolItem(id: "T1", name: "")
        item.musicianId = "M1"
        item.ratio = 40
        item.actualDuration = "01:00"
        item.recStart = "09:00"
        item.recEnd = "10:00"
        item.breakMinutes = 5

        Ratio.ensureItemRecords(&item)

        XCTAssertEqual(item.records?.musician, Record(recStart: "09:00", recEnd: "10:00", actualDuration: "01:00", breakMinutes: 5))
        XCTAssertEqual(item.records?.project, Record())
        XCTAssertEqual(item.records?.instrument, Record())
        XCTAssertEqual(item.ratios?.musician, 40)
        XCTAssertNil(item.ratios?.project)
        XCTAssertNil(item.ratios?.instrument)
    }

    func testGetDefaultRatio() {
        let settings = makeSettings(
            musicians: [SettingEntry(id: "M1", name: "", defaultRatio: 35)],
            projects: [SettingEntry(id: "P1", name: "", defaultRatio: 50)]
        )
        XCTAssertEqual(Ratio.getDefaultRatio("M1", type: "musician", settings: settings), 35)
        XCTAssertEqual(Ratio.getDefaultRatio("P1", type: "project", settings: settings), 50)
        XCTAssertEqual(Ratio.getDefaultRatio("MISSING", type: "musician", settings: settings), 20)
        XCTAssertEqual(Ratio.getDefaultRatio("X", type: "instrument", settings: settings), 20)
    }

    func testCalculateEstTime() {
        XCTAssertEqual(Ratio.calculateEstTime("01:00", 2), "00:02:00")
        XCTAssertEqual(Ratio.calculateEstTime("00:30", nil), "00:00:30")
    }

    func testGetTaskRatio() {
        let settings = makeSettings(musicians: [SettingEntry(id: "M1", name: "", defaultRatio: 30)])
        var item = PoolItem(id: "T1", name: "")
        item.musicianId = "M1"
        item.ratios = Ratios(musician: 45, project: nil, instrument: nil)

        XCTAssertEqual(Ratio.getTaskRatio(&item, settings: settings), 45)
        item.ratios?.musician = nil
        XCTAssertEqual(Ratio.getTaskRatio(&item, settings: settings), 30)
    }

    func testCalculateSingleRatio() {
        var item = PoolItem(id: "T1", name: "")
        item.musicDuration = "02:00"
        item.records = Records(musician: Record(actualDuration: "01:00"), project: nil, instrument: nil)
        XCTAssertEqual(Ratio.calculateSingleRatio(item), "0.5")

        item.records?.musician?.actualDuration = ""
        XCTAssertEqual(Ratio.calculateSingleRatio(item), "-")

        item.records?.musician?.actualDuration = "01:00"
        item.musicDuration = ""
        XCTAssertEqual(Ratio.calculateSingleRatio(item), "-")
    }

    func testIsDefaultRatio() {
        let settings = makeSettings(musicians: [SettingEntry(id: "M1", name: "", defaultRatio: 35)])
        XCTAssertTrue(Ratio.isDefaultRatio(poolItem("A", musicianId: "M1", ratio: 35), settings: settings))
        XCTAssertFalse(Ratio.isDefaultRatio(poolItem("A", musicianId: "M1", ratio: 40), settings: settings))
        XCTAssertTrue(Ratio.isDefaultRatio(poolItem("A", musicianId: "M2", ratio: 20), settings: settings))
        XCTAssertTrue(Ratio.isDefaultRatio(poolItem("A"), settings: settings))
    }

    func testAutoUpdateEfficiencyRecomputesDefaultAndResetsFollowers() {
        var settings = makeSettings(musicians: [SettingEntry(id: "M1", name: "", defaultRatio: 20)])
        var pool = [
            poolItem("T1", musicianId: "M1", sessionId: "S_DEFAULT", musicDuration: "02:00", ratio: 20),
            poolItem("T2", musicianId: "M1", sessionId: "S_DEFAULT", musicDuration: "02:00", ratio: 20),
        ]
        var scheduled = [
            scheduled("S1", musicianId: "M1", sessionId: "S_DEFAULT", musicDuration: "02:00", ratio: 20),
        ]

        for i in pool.indices {
            Ratio.ensureItemRecords(&pool[i])
            pool[i].records?.musician?.actualDuration = "01:00"
        }

        Ratio.autoUpdateEfficiency(targetId: "M1", viewType: "musician",
                                   itemPool: &pool, scheduledTasks: &scheduled, settings: &settings, currentSessionId: "S_DEFAULT")

        XCTAssertEqual(settings.musicians[0].defaultRatio, 0.5)
        for i in pool.indices {
            XCTAssertNil(pool[i].ratios?.musician)
            XCTAssertEqual(pool[i].ratio, 0.5)
            XCTAssertEqual(pool[i].estDuration, "00:01:00")
        }
        XCTAssertEqual(scheduled[0].ratio, 0.5)
    }

    func testAutoUpdateEfficiencyIgnoresOtherDimensions() {
        var settings = makeSettings(musicians: [SettingEntry(id: "M1", name: "", defaultRatio: 20)])
        var pool = [
            poolItem("T1", musicianId: "M1", sessionId: "S_DEFAULT", musicDuration: "02:00", ratio: 20),
            poolItem("T2", musicianId: "OTHER", sessionId: "S_DEFAULT", musicDuration: "02:00", ratio: 20),
        ]
        var scheduled: [Schedule] = []
        for i in pool.indices {
            Ratio.ensureItemRecords(&pool[i])
            pool[i].records?.musician?.actualDuration = "01:00"
        }

        Ratio.autoUpdateEfficiency(targetId: "M1", viewType: "musician",
                                   itemPool: &pool, scheduledTasks: &scheduled, settings: &settings, currentSessionId: "S_DEFAULT")

        XCTAssertEqual(settings.musicians[0].defaultRatio, 0.5)
        XCTAssertEqual(pool[1].ratio, 20)
    }

    func testAutoUpdateEfficiencyNeverWritesAcrossSessions() {
        var settings = makeSettings(musicians: [SettingEntry(id: "M1", name: "", defaultRatio: 20)])
        var pool = [
            poolItem("T1", musicianId: "M1", sessionId: "S_A", musicDuration: "02:00", ratio: 20),
            poolItem("T2", musicianId: "M1", sessionId: "S_B", musicDuration: "02:00", ratio: 20),
        ]
        var scheduled = [
            scheduled("S1", musicianId: "M1", sessionId: "S_B", musicDuration: "02:00", ratio: 20),
        ]

        Ratio.ensureItemRecords(&pool[0])
        pool[0].records?.musician?.actualDuration = "01:00"

        Ratio.autoUpdateEfficiency(targetId: "M1", viewType: "musician",
                                   itemPool: &pool, scheduledTasks: &scheduled, settings: &settings, currentSessionId: "S_A")

        XCTAssertEqual(settings.musicians[0].defaultRatio, 0.5)
        XCTAssertNil(pool[0].ratios?.musician)
        XCTAssertEqual(pool[0].ratio, 0.5)
        XCTAssertEqual(pool[1].ratio, 20)
        XCTAssertNil(pool[1].estDuration)
        XCTAssertNil(pool[1].ratios)
        XCTAssertEqual(scheduled[0].ratio, 20)
    }
}
