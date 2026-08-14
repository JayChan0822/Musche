import Foundation

/// `app/scripts/utils/csv.js` 的直译移植（零依赖纯文本解析）。
public enum CSV {

    /// 移植 `extractTime`：从文本里抓 "HH:MM"（支持全角冒号），抓不到返回 ""。
    public static func extractTime(_ value: Any?) -> String {
        guard let value, !(value is NSNull) else { return "" }
        let s = String(describing: value)
        let pattern = #"(\d{1,2})[:：](\d{2})"#
        guard let re = try? NSRegularExpression(pattern: pattern),
              let m = re.firstMatch(in: s, range: NSRange(s.startIndex..., in: s)),
              let hRange = Range(m.range(at: 1), in: s),
              let mRange = Range(m.range(at: 2), in: s),
              let hh = Int(String(s[hRange])),
              let mm = Int(String(s[mRange])) else {
            return ""
        }
        return String(format: "%02d:%02d", hh, mm)
    }

    /// 移植 `normalizeDate`：把 "." / "-" 分隔的日期归一为 "YYYY-MM-DD"；非法文本原样返回（去首尾空白）。
    public static func normalizeDate(_ input: Any?) -> String {
        guard let input, !(input is NSNull) else { return "" }
        let s = String(describing: input)
        let normalized = s.replacingOccurrences(of: ".", with: "/").replacingOccurrences(of: "-", with: "/")
        let parts = normalized.split(separator: "/", omittingEmptySubsequences: false)
        guard parts.count == 3,
              let year = Int(parts[0].trimmingCharacters(in: .whitespaces)),
              let month = Int(parts[1].trimmingCharacters(in: .whitespaces)),
              let day = Int(parts[2].trimmingCharacters(in: .whitespaces)) else {
            return s.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        var comps = DateComponents()
        comps.year = year
        comps.month = month
        comps.day = day
        guard let date = Calendar.current.date(from: comps) else {
            return s.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        return Format.formatYMD(date)
    }

    /// 移植 `getOrchString`：统计乐器名并输出带数量的缩写列表。
    public static func getOrchString(_ names: [String]) -> String {
        let abbrMap: [String: String] = [
            "violin": "Vln",
            "viola": "Vla",
            "cello": "Vc",
            "double bass": "Db",
            "flute": "Fl",
        ]

        var counts: [(key: String, count: Int)] = []
        var indexByKey: [String: Int] = [:]
        var displayNames: [String: String] = [:]

        for name in names {
            let rawClean = name
                .replacingOccurrences(of: #"[\d\s]+$"#, with: "", options: .regularExpression)
                .trimmingCharacters(in: .whitespacesAndNewlines)
            let lower = rawClean.lowercased()

            if let idx = indexByKey[lower] {
                counts[idx].count += 1
            } else {
                indexByKey[lower] = counts.count
                counts.append((key: lower, count: 1))
            }

            if displayNames[lower] == nil {
                displayNames[lower] = abbrMap[lower] ?? capitalizeFirst(rawClean)
            }
        }

        return counts.map { "\($0.count) \(displayNames[$0.key]!)" }.joined(separator: ", ")
    }

    /// 移植 `parseCSVLine`：解析单行 CSV（引号内逗号不分割）。
    public static func parseCSVLine(_ text: String) -> [String] {
        var result: [String] = []
        var cell = ""
        var inQuotes = false

        for ch in text {
            if ch == "\"" {
                inQuotes.toggle()
            } else if ch == "," && !inQuotes {
                result.append(stripQuotes(cell))
                cell = ""
            } else {
                cell.append(ch)
            }
        }
        result.append(stripQuotes(cell))
        return result
    }

    /// 移植 `parseCSVRobust`：多行 CSV（支持引号、转义双引号、CRLF）。
    /// 按 Unicode scalar 逐字遍历，避免 Swift 把 `\r\n` 合并成单个扩展字素簇。
    public static func parseCSVRobust(_ text: String) -> [[String]] {
        let scalars = Array(text.unicodeScalars)
        var rows: [[String]] = []
        var currentRow: [String] = []
        var currentCell = ""
        var insideQuote = false
        var i = 0

        while i < scalars.count {
            let ch = scalars[i]
            let next: UnicodeScalar? = i + 1 < scalars.count ? scalars[i + 1] : nil

            if ch == "\"" {
                if insideQuote && next == "\"" {
                    currentCell.append("\"")
                    i += 1
                } else {
                    insideQuote.toggle()
                }
            } else if ch == "," && !insideQuote {
                currentRow.append(currentCell.trimmingCharacters(in: .whitespacesAndNewlines))
                currentCell = ""
            } else if (ch == "\r" || ch == "\n") && !insideQuote {
                if ch == "\r" && next == "\n" { i += 1 }
                currentRow.append(currentCell.trimmingCharacters(in: .whitespacesAndNewlines))
                rows.append(currentRow)
                currentRow = []
                currentCell = ""
            } else {
                currentCell.unicodeScalars.append(ch)
            }
            i += 1
        }

        if !currentCell.isEmpty || !currentRow.isEmpty {
            currentRow.append(currentCell.trimmingCharacters(in: .whitespacesAndNewlines))
            rows.append(currentRow)
        }
        return rows
    }

    // MARK: - Private

    private static func stripQuotes(_ s: String) -> String {
        var t = s.trimmingCharacters(in: .whitespacesAndNewlines)
        if t.hasPrefix("\"") { t.removeFirst() }
        if t.hasSuffix("\"") { t.removeLast() }
        return t
    }

    private static func capitalizeFirst(_ s: String) -> String {
        guard let first = s.first else { return "" }
        return String(first).uppercased() + s.dropFirst()
    }
}
