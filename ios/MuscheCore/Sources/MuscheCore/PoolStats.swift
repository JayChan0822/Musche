import Foundation

/// `app/scripts/features/sidebar-stats.js` 的直译移植（四态统计核心算法）。
/// 搜索/排序/渲染交给 SwiftUI List，这里的「四态 + 时长合计」照搬。
public enum PoolStats {

    public struct GroupStats: Equatable {
        public var trackCount: Int
        public var totalSeconds: Int
        public var scheduledSeconds: Int
        public var completedSeconds: Int
        public var recordedCount: Int
        public var effectiveCount: Int
        public var statusKey: String
        public var avgRealRatio: Double
        public var isFullyScheduled: Bool

        public init(
            trackCount: Int, totalSeconds: Int, scheduledSeconds: Int, completedSeconds: Int,
            recordedCount: Int, effectiveCount: Int, statusKey: String, avgRealRatio: Double, isFullyScheduled: Bool
        ) {
            self.trackCount = trackCount
            self.totalSeconds = totalSeconds
            self.scheduledSeconds = scheduledSeconds
            self.completedSeconds = completedSeconds
            self.recordedCount = recordedCount
            self.effectiveCount = effectiveCount
            self.statusKey = statusKey
            self.avgRealRatio = avgRealRatio
            self.isFullyScheduled = isFullyScheduled
        }
    }

    /// 计算某个分类（乐手/项目/乐器）条目下的统计。poolItems 为空返回 nil。
    /// - Parameters:
    ///   - poolItems: 该条目下、当前 session、且在该视图可见的任务池条目。
    ///   - scheduleItems: 该条目下、当前 session 的日程块（按 date+startTime 排序后枚举）。
    ///   - recordType: "musician" / "project" / "instrument"。
    ///   - defaultRatio: 该条目的默认倍率。
    public static func computeGroupStats(
        poolItems: [PoolItem],
        scheduleItems: [Schedule],
        recordType: String,
        defaultRatio: Double?
    ) -> GroupStats? {
        guard !poolItems.isEmpty else { return nil }

        // 1) 有效音乐时长/起止取该视图的拆分状态；isSkipped 在 M5 TrackList 引入，这里一律视为未跳过。
        var groupTotalActual = 0
        var groupTotalMusic = 0
        for item in poolItems {
            let split = SplitState.peekItemSplitState(item, recordType)
            if let actual = item.records?[recordType]?.actualDuration, !actual.isEmpty, !split.musicDuration.isEmpty {
                let a = TimeMath.parseTime(actual)
                let m = TimeMath.parseTime(split.musicDuration)
                if a > 0 && m > 0 {
                    groupTotalActual += a
                    groupTotalMusic += m
                }
            }
        }

        let avgRealRatio: Double = groupTotalMusic > 0
            ? (Double(groupTotalActual) / Double(groupTotalMusic) * 10).rounded() / 10
            : 0

        var smartBaseRatio: Double = 20
        if avgRealRatio > 0 {
            smartBaseRatio = avgRealRatio
        } else if let dr = defaultRatio, dr > 0 {
            smartBaseRatio = dr
        }

        var totalSecs = 0
        var totalActualSec = 0
        var recordedCount = 0
        var effectiveCount = 0

        for item in poolItems {
            let split = SplitState.peekItemSplitState(item, recordType)
            let actualDur = (item.records?[recordType]?.actualDuration?.isEmpty == false)
                ? item.records![recordType]!.actualDuration
                : nil

            let rawVal = item.ratios?[recordType] ?? nil ?? 0
            var validManualRatio: Double? = nil
            if rawVal > 0 && rawVal != 20 && rawVal != smartBaseRatio {
                let dflt = (defaultRatio ?? 0) > 0 ? defaultRatio! : 20
                if rawVal != dflt { validManualRatio = rawVal }
            }

            let effectiveRatio = validManualRatio ?? smartBaseRatio
            let dynEst = Ratio.calculateEstTime(split.musicDuration, effectiveRatio)

            // isSkipped 视为 false
            effectiveCount += 1
            if actualDur != nil {
                recordedCount += 1
                totalActualSec += TimeMath.parseTime(actualDur)
            }
            totalSecs += TimeMath.parseTime(dynEst)
        }

        // 2) scheduledSecs：按日程块累加，扣掉休息与间隙。
        var scheduledSecs = 0
        let sortedSchedules = scheduleItems.sorted { lhs, rhs in
            lhs.date != rhs.date ? lhs.date < rhs.date : lhs.startTime < rhs.startTime
        }

        for (blockIndex, block) in sortedSchedules.enumerated() {
            let blockTotalSecs = TimeMath.parseTime(block.estDuration)

            let itemsInBlock = poolItems.filter { item in
                SplitState.peekItemSplitState(item, recordType).sectionIndex == blockIndex
            }

            var totalBreakSecs = 0
            for item in itemsInBlock {
                if let bm = item.records?[recordType]?.breakMinutes, bm > 0 {
                    totalBreakSecs += Int(bm) * 60
                }
            }

            var totalGapSecs = 0
            let recordedItems = itemsInBlock.filter { item in
                guard let rec = item.records?[recordType] else { return false }
                return (rec.recStart?.isEmpty == false) && (rec.recEnd?.isEmpty == false)
            }
            let sortedRecorded = recordedItems.sorted { lhs, rhs in
                (lhs.records?[recordType]?.recStart ?? "") < (rhs.records?[recordType]?.recStart ?? "")
            }

            if sortedRecorded.count > 1 {
                for index in 0..<(sortedRecorded.count - 1) {
                    let currRec = sortedRecorded[index].records?[recordType]
                    let nextRec = sortedRecorded[index + 1].records?[recordType]
                    if let end = currRec?.recEnd, let start = nextRec?.recStart {
                        let endMins = TimeMath.timeToMinutes(end) ?? 0
                        let startMins = TimeMath.timeToMinutes(start) ?? 0
                        if startMins >= endMins {
                            let gap = startMins - endMins
                            if gap > 0 { totalGapSecs += gap * 60 }
                        }
                    }
                }
            }

            var netBlockDuration = blockTotalSecs - totalBreakSecs - totalGapSecs
            if netBlockDuration < 0 { netBlockDuration = 0 }
            scheduledSecs += netBlockDuration
        }

        let trackCount = poolItems.count
        var statusKey = "unscheduled"
        if trackCount > 0 && effectiveCount == 0 {
            statusKey = "completed"
        } else if effectiveCount > 0 && recordedCount == effectiveCount {
            statusKey = "completed"
        } else if scheduledSecs > 0 && scheduledSecs < totalSecs {
            statusKey = "insufficient"
        } else if recordedCount > 0 {
            statusKey = "in-progress"
        } else if scheduledSecs >= totalSecs && totalSecs > 0 {
            statusKey = "full"
        }

        return GroupStats(
            trackCount: trackCount,
            totalSeconds: totalSecs,
            scheduledSeconds: scheduledSecs,
            completedSeconds: totalActualSec,
            recordedCount: recordedCount,
            effectiveCount: effectiveCount,
            statusKey: statusKey,
            avgRealRatio: avgRealRatio,
            isFullyScheduled: statusKey == "full" || statusKey == "completed"
        )
    }
}
