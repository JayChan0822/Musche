import Foundation

/// M1 数据层抽象：读/写 user_data（乐观锁版本冲突）。
/// supabase-swift 实现放 App 层（依赖 + 凭据注入）；这里提供协议 + 内存参考实现（离线/测试用）。
public protocol UserDataStore {
    func load() async throws -> UserData?
    func save(_ data: UserData) async throws -> Sync.SaveResult
}

/// 内存实现：用 Sync.attemptSave 做乐观锁，供测试与离线兜底。
public final class InMemoryUserDataStore: UserDataStore {
    private var stored: UserData?

    public init(stored: UserData? = nil) {
        self.stored = stored
    }

    public func load() async throws -> UserData? {
        stored
    }

    public func save(_ data: UserData) async throws -> Sync.SaveResult {
        let cloudVersion = stored?.version ?? 0
        let result = Sync.attemptSave(localVersion: data.version, cloudVersion: cloudVersion)
        if case .saved(let newVersion) = result {
            var updated = data
            updated.version = newVersion
            stored = updated
        }
        return result
    }
}
