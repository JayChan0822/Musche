import XCTest
@testable import MuscheCore

/// 对应 tests/utils-midi.test.mjs（纯算法部分）。
final class MIDITests: XCTestCase {

    func testNormalizeForMatch() {
        XCTAssertEqual(MIDI.normalizeForMatch("Viola♭ 2"), "violab")
        XCTAssertEqual(MIDI.normalizeForMatch("C#-Flat.12"), "c# b")
        XCTAssertEqual(MIDI.normalizeForMatch("Strings_(In)"), "strings")
    }

    func testCleanMidiTrackName() {
        XCTAssertEqual(MIDI.cleanMidiTrackName("Violin I"), "Violin")
        XCTAssertEqual(MIDI.cleanMidiTrackName("Flûte 2"), "Flûte")
        XCTAssertEqual(MIDI.cleanMidiTrackName("Cello_3"), "Cello")
    }

    func testCalculateBarQuantizedDurationEmptyNotes() {
        let tempoMap = MIDI.TempoMap(ppq: 480, events: [MIDI.TempoEvent(tick: 0, mpb: 500000, seconds: 0)])
        let timeSigs = [MIDI.TimeSignatureEntry(ticks: 0, num: 4, den: 4)]
        XCTAssertEqual(
            MIDI.calculateBarQuantizedDuration([], tempoMap, timeSigs),
            MIDI.BarDuration(seconds: 0, rawSeconds: 0, bars: 0)
        )
    }

    func testCalculateBarQuantizedDurationAcrossBarBoundaries() {
        let tempoMap = MIDI.TempoMap(ppq: 480, events: [MIDI.TempoEvent(tick: 0, mpb: 500000, seconds: 0)])
        let timeSigs = [MIDI.TimeSignatureEntry(ticks: 0, num: 4, den: 4)]
        let notes = [MIDI.Note(ticks: 0, durationTicks: 2400, midi: 60)]

        XCTAssertEqual(
            MIDI.calculateBarQuantizedDuration(notes, tempoMap, timeSigs),
            MIDI.BarDuration(seconds: 4, rawSeconds: 2.5, bars: 2)
        )
    }

    func testBuildTempoMap() {
        // 0x07 0xA1 0x20 = 500000 µs/拍
        let smf = MIDI.SMFFile(ppq: 480, tracks: [[MIDI.MetaEvent(tick: 0, type: 0x51, data: [0x07, 0xA1, 0x20])]])
        let map = MIDI.buildTempoMap(smf)

        XCTAssertEqual(map.ppq, 480)
        XCTAssertEqual(map.events.count, 1)
        XCTAssertEqual(map.events[0].mpb, 500000)
        XCTAssertEqual(map.events[0].seconds, 0)
    }

    func testBuildTempoMapDefaultsWhenNoTempoEvents() {
        let smf = MIDI.SMFFile(ppq: 480, tracks: [[]])
        let map = MIDI.buildTempoMap(smf)
        XCTAssertEqual(map.events.count, 1)
        XCTAssertEqual(map.events[0].mpb, 500000)
        XCTAssertEqual(map.events[0].tick, 0)
    }
}
