import Foundation

/// `app/scripts/utils/id.js` 的直译移植。
public enum ID {

    private static let alphabet = Array("0123456789abcdefghijklmnopqrstuvwxyz")

    /// 移植 `generateUniqueId`：`prefix` + 36 进制毫秒时间戳 + 7 位随机后缀。
    public static func generateUniqueId(_ prefix: String = "t") -> String {
        let ms = Int64(Date().timeIntervalSince1970 * 1000)
        let timestamp = String(ms, radix: 36)
        let random = String((0..<7).map { _ in alphabet.randomElement()! })
        return prefix + timestamp + random
    }
}
