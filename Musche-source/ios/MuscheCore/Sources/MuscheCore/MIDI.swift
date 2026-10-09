import Foundation

/// `app/scripts/utils/midi.js` 的直译移植（tempo map / tick→秒 / 按小节量化 / 名称归一）。
/// 读 SMF 拿 track/notes 那层在 Swift 侧交给 MIDIKit，这里的算法可直接复用。
public enum MIDI {

    public struct TempoEvent: Equatable {
        public var tick: Int
        public var mpb: Int
        public var seconds: Double

        public init(tick: Int, mpb: Int, seconds: Double) {
            self.tick = tick
            self.mpb = mpb
            self.seconds = seconds
        }
    }

    public struct TempoMap: Equatable {
        public var ppq: Int
        public var events: [TempoEvent]

        public init(ppq: Int, events: [TempoEvent]) {
            self.ppq = ppq
            self.events = events
        }
    }

    public struct TimeSignatureEntry: Equatable {
        public var ticks: Int
        public var num: Int
        public var den: Int

        public init(ticks: Int, num: Int, den: Int) {
            self.ticks = ticks
            self.num = num
            self.den = den
        }
    }

    public struct Note: Equatable {
        public var ticks: Int
        public var durationTicks: Int
        public var midi: Int

        public init(ticks: Int, durationTicks: Int, midi: Int) {
            self.ticks = ticks
            self.durationTicks = durationTicks
            self.midi = midi
        }
    }

    public struct BarDuration: Equatable {
        public var seconds: Double
        public var rawSeconds: Double
        public var bars: Int

        public init(seconds: Double, rawSeconds: Double, bars: Int) {
            self.seconds = seconds
            self.rawSeconds = rawSeconds
            self.bars = bars
        }
    }

    /// 元事件（仅移植 buildTempoMap / buildTimeSigMap 所需的字段）。
    public struct MetaEvent: Equatable {
        public var tick: Int
        public var type: Int
        public var data: [UInt8]

        public init(tick: Int, type: Int, data: [UInt8]) {
            self.tick = tick
            self.type = type
            self.data = data
        }
    }

    /// SMF 的最小模型（对应 JZZ 解析产物里的 ppqn + tracks）。
    public struct SMFFile: Equatable {
        public var ppq: Int
        public var tracks: [[MetaEvent]]

        public init(ppq: Int, tracks: [[MetaEvent]]) {
            self.ppq = ppq
            self.tracks = tracks
        }
    }

    // MARK: - 移植函数

    /// 移植 `jzzTicksToSeconds`。
    public static func jzzTicksToSeconds(_ tick: Int, _ tempoMap: TempoMap) -> Double {
        var index = tempoMap.events.count - 1
        while index > 0 && tempoMap.events[index].tick > tick {
            index -= 1
        }
        let tempo = tempoMap.events[index]
        let deltaTicks = tick - tempo.tick
        return tempo.seconds + Double(deltaTicks * tempo.mpb) / (Double(tempoMap.ppq) * 1000000)
    }

    /// 移植 `calculateBarQuantizedDuration`：按小节量化后的有效时长 / 原始时长 / 有效小节数。
    public static func calculateBarQuantizedDuration(
        _ notes: [Note],
        _ tempoMap: TempoMap,
        _ timeSigs: [TimeSignatureEntry]
    ) -> BarDuration {
        guard !notes.isEmpty else {
            return BarDuration(seconds: 0, rawSeconds: 0, bars: 0)
        }

        var lastNoteOffTick = 0
        for note in notes {
            let end = note.ticks + note.durationTicks
            if end > lastNoteOffTick { lastNoteOffTick = end }
        }

        var currentTick = 0.0
        var sigIndex = 0
        var validSeconds = 0.0
        var validBars = 0

        while currentTick < Double(lastNoteOffTick) {
            if sigIndex + 1 < timeSigs.count && currentTick >= Double(timeSigs[sigIndex + 1].ticks) {
                sigIndex += 1
            }

            let currentSig = timeSigs[sigIndex]
            let ticksPerBar = (Double(tempoMap.ppq) * 4.0 / Double(currentSig.den)) * Double(currentSig.num)
            let barStartTick = currentTick
            let barEndTick = currentTick + ticksPerBar

            let isActiveBar = notes.contains { note in
                let start = Double(note.ticks)
                let end = Double(note.ticks + note.durationTicks)
                return max(start, barStartTick) < min(end, barEndTick)
            }

            if isActiveBar {
                let startSec = jzzTicksToSeconds(Int(barStartTick), tempoMap)
                let endSec = jzzTicksToSeconds(Int(barEndTick), tempoMap)
                validSeconds += endSec - startSec
                validBars += 1
            }

            currentTick += ticksPerBar
        }

        return BarDuration(
            seconds: validSeconds,
            rawSeconds: jzzTicksToSeconds(lastNoteOffTick, tempoMap),
            bars: validBars
        )
    }

    /// 移植 `buildTempoMap`：从 SMF 元事件构建 tempo map。
    public static func buildTempoMap(_ smf: SMFFile) -> TempoMap {
        var tempoEvents: [TempoEvent] = []

        for track in smf.tracks {
            for event in track where event.type == 0x51 && event.data.count >= 3 {
                let mpb = (Int(event.data[0]) << 16) | (Int(event.data[1]) << 8) | Int(event.data[2])
                tempoEvents.append(TempoEvent(tick: event.tick, mpb: mpb, seconds: 0))
            }
        }

        if tempoEvents.isEmpty {
            tempoEvents.append(TempoEvent(tick: 0, mpb: 500000, seconds: 0))
        }

        tempoEvents.sort { $0.tick < $1.tick }

        if tempoEvents[0].tick > 0 {
            tempoEvents.insert(TempoEvent(tick: 0, mpb: 500000, seconds: 0), at: 0)
        }

        var currentSec = 0.0
        for index in tempoEvents.indices {
            if index > 0 {
                let deltaTicks = tempoEvents[index].tick - tempoEvents[index - 1].tick
                currentSec += Double(deltaTicks * tempoEvents[index - 1].mpb) / (Double(smf.ppq) * 1000000)
            }
            tempoEvents[index].seconds = currentSec
        }

        return TempoMap(ppq: smf.ppq, events: tempoEvents)
    }

    /// 移植 `buildTimeSigMap`。
    public static func buildTimeSigMap(_ smf: SMFFile) -> [TimeSignatureEntry] {
        var timeSigs: [TimeSignatureEntry] = []

        for track in smf.tracks {
            for event in track where event.type == 0x58 && event.data.count >= 2 {
                let num = Int(event.data[0])
                let denPower = Int(event.data[1])
                let den = Int(pow(2.0, Double(denPower)))
                timeSigs.append(TimeSignatureEntry(ticks: event.tick, num: num, den: den))
            }
        }

        if timeSigs.isEmpty {
            timeSigs.append(TimeSignatureEntry(ticks: 0, num: 4, den: 4))
        }

        timeSigs.sort { $0.ticks < $1.ticks }
        return timeSigs
    }

    /// 移植 `cleanMidiTrackName`：去掉结尾编号，保留 Unicode 文本。
    public static func cleanMidiTrackName(_ name: String?) -> String {
        guard let name, !name.isEmpty else { return "" }
        var s = name
        s = s.replacingOccurrences(of: #"[_-]\d+$"#, with: "", options: .regularExpression)
        s = s.replacingOccurrences(of: #"\s*\d+$"#, with: "", options: .regularExpression)
        s = s.replacingOccurrences(of: #"\s+(I{1,3}|IV|V|VI)$"#, with: "", options: [.regularExpression, .caseInsensitive])
        return s.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    /// 移植 `normalizeForMatch`：归一大小写、标点、数字与 Unicode 升降号。
    public static func normalizeForMatch(_ value: String?) -> String {
        guard let value, !value.isEmpty else { return "" }
        var s = value.lowercased()
        s = s.replacingOccurrences(of: "♭", with: "b")
        s = s.replacingOccurrences(of: #"\bflat\b"#, with: "b", options: .regularExpression)
        s = s.replacingOccurrences(of: ".", with: " ")
        s = s.replacingOccurrences(of: "_", with: " ")
        s = s.replacingOccurrences(of: "-", with: " ")
        s = s.replacingOccurrences(of: #"\d+"#, with: "", options: .regularExpression)
        s = s.replacingOccurrences(of: #"[()\[\]]"#, with: "", options: .regularExpression)
        s = s.replacingOccurrences(of: #"\bsharp\b"#, with: "#", options: .regularExpression)
        s = s.replacingOccurrences(of: "♯", with: "#")
        s = s.replacingOccurrences(of: #"\bin\b"#, with: "", options: .regularExpression)
        return s.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
