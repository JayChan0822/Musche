import Foundation
import Supabase
import MuscheCore

/// M1：supabase-swift 的 Auth + user_data 读写（乐观锁）。
/// 登录后用 session 里的 user.id 作为 user_id，PostgREST 查询自动带 JWT（RLS 生效）。
@Observable
final class SupabaseService {
    private let client: SupabaseClient
    private(set) var userId: String?
    private(set) var email: String?

    init(url: String, key: String) {
        self.client = SupabaseClient(supabaseURL: URL(string: url)!, supabaseKey: key)
    }

    static func fromBundle() -> SupabaseService? {
        let bundle = Bundle.main
        guard let url = bundle.object(forInfoDictionaryKey: "SupabaseURL") as? String, !url.isEmpty,
              let key = bundle.object(forInfoDictionaryKey: "SupabaseKey") as? String, !key.isEmpty else {
            return nil
        }
        return SupabaseService(url: url, key: key)
    }

    var isSignedIn: Bool { userId != nil }

    // MARK: - Auth

    @discardableResult
    func restoreSession() async -> Bool {
        do {
            let session = try await client.auth.session
            userId = session.user.id.uuidString
            email = session.user.email
            return true
        } catch {
            return false
        }
    }

    func signIn(email: String, password: String) async throws {
        let session = try await client.auth.signIn(email: email, password: password)
        userId = session.user.id.uuidString
        self.email = session.user.email
    }

    func signUp(email: String, password: String) async throws {
        let session = try await client.auth.signUp(email: email, password: password)
        userId = session.user.id.uuidString
        self.email = session.user.email
    }

    func signOut() async throws {
        try await client.auth.signOut()
        userId = nil
        email = nil
    }

    // MARK: - user_data（用 session 的 user_id）

    private struct CloudRow: Decodable {
        var content: CloudContent
        var version: Int
    }

    private struct SchemaProbe: Decodable {
        struct Content: Decodable { var schemaVersion: Int? }
        var content: Content
    }

    private struct VersionRow: Decodable {
        var version: Int
    }

    private struct UpsertPayload: Encodable {
        var userId: String
        var content: CloudContent
        var version: Int

        enum CodingKeys: String, CodingKey {
            case userId = "user_id"
            case content
            case version
        }
    }

    func loadUserData() async throws -> UserData? {
        guard let userId else { return nil }
        do {
            let response = try await client
                .from("user_data")
                .select("content, version")
                .eq("user_id", value: userId)
                .single()
                .execute()
            // Inspect the original JSON before Codable can silently discard newer fields.
            let probe = try JSONDecoder().decode(SchemaProbe.self, from: response.data)
            if (probe.content.schemaVersion ?? 0) > 9 {
                throw NSError(domain: "Musche.Schema", code: 10, userInfo: [NSLocalizedDescriptionKey: "此数据已升级到新版工作流，请使用新版网页端。当前 iOS 版本不会保存或覆盖此数据。"])
            }
            let row = try JSONDecoder().decode(CloudRow.self, from: response.data)
            return UserData(cloudContent: row.content, version: row.version)
        } catch is PostgrestError {
            return nil
        }
    }

    func saveUserData(_ data: UserData) async throws -> Sync.SaveResult {
        guard let userId else {
            throw NSError(domain: "Musche", code: 1, userInfo: [NSLocalizedDescriptionKey: "未登录"])
        }
        let serverVersion = try await loadUserData()?.version ?? 0
        let result = Sync.attemptSave(localVersion: data.version, cloudVersion: serverVersion)
        if case .saved(let newVersion) = result {
            let payload = UpsertPayload(userId: userId, content: data.cloudContent, version: newVersion)
            try await client.from("user_data").upsert(payload, onConflict: "user_id").execute()
        }
        return result
    }

    private func fetchVersion(userId: String) async throws -> Int {
        do {
            let row: VersionRow = try await client
                .from("user_data")
                .select("version")
                .eq("user_id", value: userId)
                .single()
                .execute()
                .value
            return row.version
        } catch is PostgrestError {
            return 0
        }
    }
}
