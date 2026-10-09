import Foundation

/// `features/track-list-records.js` 与 `features/schedule.js` 里录音记录/分段的核心纯逻辑。
/// 1.5s 防抖、DOM 手势在 SwiftUI 侧重写，这里的时长计算与分段移动照搬。
public enum TrackRecord {

    /// 移植 `calcTrackDiff`：recEnd − recStart（跨午夜 +24h），扣休息分钟，钳到 ≥0，输出 "HH:MM:SS"。
    /// 无 recStart/recEnd 返回 nil。
    public static func calculateActualDuration(recStart: String?, recEnd: String?, breakMinutes: Double?) -> String? {
        guard let start = recStart, !start.isEmpty, let end = recEnd, !end.isEmpty else { return nil }
        let startMins = TimeMath.timeToMinutes(start) ?? 0
        var endMins = TimeMath.timeToMinutes(end) ?? 0
        if endMins < startMins { endMins += 24 * 60 }

        var diffMins = endMins - startMins
        if let bm = breakMinutes, bm > 0 {
            diffMins -= Int(bm)
        }
        if diffMins < 0 { diffMins = 0 }

        return Format.formatSecs(diffMins * 60)
    }

    /// 移植 `moveDivider`：把分段分隔条上下移动，即把上区最后一条 / 下区第一条挪到另一边。
    /// 只同步当前视图（viewType）的拆分状态，其它视图不动。
    @discardableResult
    public static func moveDivider(
        items: inout [PoolItem],
        dividerIndex: Int,
        direction: String,
        viewType: String
    ) -> Bool {
        let upperSection = dividerIndex - 1
        let lowerSection = dividerIndex
        var movedIndex: Int? = nil

        if direction == "up" {
            for index in stride(from: items.count - 1, through: 0, by: -1) {
                if items[index].sectionIndex == upperSection {
                    items[index].sectionIndex = lowerSection
                    movedIndex = index
                    break
                }
            }
        } else if direction == "down" {
            for index in 0..<items.count {
                if items[index].sectionIndex == lowerSection {
                    items[index].sectionIndex = upperSection
                    movedIndex = index
                    break
                }
            }
        }

        guard let movedIndex else { return false }

        let newSection = items[movedIndex].sectionIndex ?? 0
        SplitState.setItemSplitState(&items[movedIndex], viewType) { $0.sectionIndex = newSection }
        return true
    }
}
