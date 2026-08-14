import Foundation

/// `features/credits.js` 里「名单取数/分类」部分的直译移植。
public enum Credits {

    /// 移植 `splitCreditNames`：按 `/`、`,`、换行、`^|` 拆分并去空。
    public static func splitCreditNames(_ value: String?) -> [String] {
        guard let value, !value.isEmpty else { return [] }
        return value
            .components(separatedBy: CharacterSet(charactersIn: "/,\r\n"))
            .flatMap { $0.components(separatedBy: "^|") }
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
    }

    /// 移植 `getOrchCategory`：按乐器英文名归类到弦乐/木管/铜管/打击/色彩，失败再按乐手名兜底。
    public static func getOrchCategory(instrumentName: String?, musicianName: String?) -> String? {
        let instrument = (instrumentName ?? "").lowercased()
        let musician = (musicianName ?? "").lowercased()

        let categoryPatterns: [(String, [String])] = [
            ("strings", ["violin", "viola", "cello", "double bass", "contrabass"]),
            ("woodwinds", ["flute", "piccolo", "oboe", "english horn", "cor anglais", "clarinet", "bassoon", "contrabassoon"]),
            ("brass", ["horn", "trumpet", "trombone", "tuba", "euphonium"]),
            ("percussion", ["timpani", "snare", "cymbal", "gong", "mark tree", "glockenspiel", "xylophone", "marimba", "vibraphone", "chimes", "tubular bells"]),
            ("others", ["harp", "celesta", "celeste", "piano", "organ", "harpsichord"]),
        ]

        for (category, words) in categoryPatterns {
            for word in words {
                let pattern = #"\b"# + NSRegularExpression.escapedPattern(for: word) + #"\b"#
                if instrument.range(of: pattern, options: .regularExpression) != nil {
                    return category
                }
            }
        }

        if musician.contains("string") { return "strings" }
        if musician.contains("woodwind") { return "woodwinds" }
        if musician.contains("brass") { return "brass" }
        if musician.contains("percussion") || musician.contains("perc ") { return "percussion" }
        return nil
    }
}
