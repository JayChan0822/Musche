import Foundation

/// M1 数据层的乐观锁版本冲突逻辑，直译自 auth.js 的 saveToCloud（清单「坑 #11」）。
public enum Sync {

    /// 云端版本比本地新 → 冲突，不得覆盖（多设备互相覆盖的防线）。
    public static func shouldConflict(localVersion: Int, cloudVersion: Int) -> Bool {
        cloudVersion > localVersion
    }

    /// 保存成功后的版本号：+1。
    public static func nextVersion(_ version: Int) -> Int {
        version + 1
    }

    /// 一次保存尝试的结果。
    public enum SaveResult: Equatable {
        case saved(newVersion: Int)
        case conflict(cloudVersion: Int)
    }

    /// 纯逻辑：尝试保存。冲突返回 .conflict；否则返回 .saved(version+1)。
    /// 注意：真实链路是「先读云端 version 再写」，这里把「读到的云端 version」作为入参。
    public static func attemptSave(localVersion: Int, cloudVersion: Int) -> SaveResult {
        if shouldConflict(localVersion: localVersion, cloudVersion: cloudVersion) {
            return .conflict(cloudVersion: cloudVersion)
        }
        return .saved(newVersion: nextVersion(localVersion))
    }
}
