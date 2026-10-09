import Foundation

/// `app/scripts/features/history.js` 的直译移植：撤销栈核心。
/// 语义：整个 pool+tasks+settings 的 JSON 快照，上限 50 步，先去重再截断 redo 分支。
/// Swift 侧用值类型（UserData 是值类型），快照天然不可变。
public struct History: Equatable {
    public var snapshots: [UserData]
    public var index: Int

    public static let maxSnapshots = 50

    public init(snapshots: [UserData] = [], index: Int = -1) {
        self.snapshots = snapshots
        self.index = index
    }

    /// 移植 `pushHistory`：空快照保护（与当前索引处快照相等则跳过）必须放在 redo 截断之前。
    /// 返回是否真的入栈（手机端据此浮出撤销条）。
    @discardableResult
    public mutating func push(_ snapshot: UserData) -> Bool {
        if index >= 0 && index < snapshots.count && snapshots[index] == snapshot {
            return false
        }

        if index < snapshots.count - 1 {
            snapshots.removeSubrange((index + 1)...)
        }

        snapshots.append(snapshot)
        index += 1

        if snapshots.count > Self.maxSnapshots {
            snapshots.removeFirst()
            index -= 1
        }
        return true
    }

    /// 移植 `undo`：返回要恢复的快照；栈底返回 nil（调用方仍需 cancel 挂起写回）。
    public mutating func undo() -> UserData? {
        guard index > 0 else { return nil }
        index -= 1
        return snapshots[index]
    }

    /// 移植 `redo`。
    public mutating func redo() -> UserData? {
        guard index < snapshots.count - 1 else { return nil }
        index += 1
        return snapshots[index]
    }
}
