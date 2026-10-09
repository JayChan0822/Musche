import XCTest
@testable import MuscheCore

/// 集成探测：用 MuscheCore 的 Codable 模型解码真实线上 user_data（字段零丢失验证）。
/// 依赖 /tmp/userdata.json（由一次性 curl 抓取），文件不存在时跳过。
final class CloudDecodeProbe: XCTestCase {

    func testDecodeRealCloudData() throws {
        let path = "/tmp/userdata.json"
        guard FileManager.default.fileExists(atPath: path) else {
            throw XCTSkip("无 \(path)，跳过线上数据解码探测")
        }
        let data = try Data(contentsOf: URL(fileURLWithPath: path))
        struct Row: Decodable {
            var user_id: String
            var content: CloudContent
            var version: Int
        }
        do {
            let rows = try JSONDecoder().decode([Row].self, from: data)
            XCTAssertEqual(rows.count, 1)
            let content = rows[0].content
            print(">>> version=\(rows[0].version)")
            print(">>> pool=\(content.pool.count) tasks=\(content.tasks.count)")
            print(">>> settings.sessions=\(content.settings.sessions.count) musicians=\(content.settings.musicians.count) projects=\(content.settings.projects.count) instruments=\(content.settings.instruments.count)")
        } catch {
            XCTFail("解码失败（字段零丢失验证失败）: \(error)")
        }
    }
}
