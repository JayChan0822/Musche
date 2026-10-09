import Foundation

/// 复刻 JS `Math.round`（对所有有限值都等于 floor(x + 0.5)）。
func jsRound(_ x: Double) -> Int {
    Int((x + 0.5).rounded(.down))
}

/// 复刻 JS `Number(string)` 的类型强转：先去掉首尾空白；空串 → 0；否则解析为整数，失败返回 nil（≈ NaN）。
func jsNumber(_ s: String) -> Int? {
    let t = s.trimmingCharacters(in: .whitespacesAndNewlines)
    if t.isEmpty { return 0 }
    return Int(t)
}

/// 复刻 JS 的 `value || 0` + `Number(...)`：falsy 或无法解析 → 0。
func jsToDouble(_ value: Any?) -> Double {
    guard let value, !(value is NSNull) else { return 0 }
    let t = String(describing: value).trimmingCharacters(in: .whitespacesAndNewlines)
    if t.isEmpty { return 0 }
    return Double(t) ?? 0
}
