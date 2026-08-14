import Foundation

/// `app/scripts/features/schedule.js` 的直译移植（重叠检测、幽灵任务、重叠计数等纯逻辑）。
public enum ScheduleMath {

    /// 分类 → 任务上对应的 id 字段。
    public static let taskIdKeyByTab: [String: String] = [
        "musician": "musicianId",
        "project": "projectId",
        "instrument": "instrumentId",
    ]

    private static func idValue(_ idKey: String, _ task: Schedule) -> String? {
        switch idKey {
        case "projectId": return task.projectId
        case "instrumentId": return task.instrumentId
        default: return task.musicianId
        }
    }

    /// 任务所属分类（musician / project / instrument）。
    public static func taskType(of task: Schedule) -> String {
        if task.projectId != nil { return "project" }
        if task.instrumentId != nil { return "instrument" }
        return "musician"
    }

    /// 移植 `checkOverlap`：同一天、同 session、同分类下的时间段重叠检测。
    public static func checkOverlap(
        date: String,
        startTime: String,
        durationStr: String,
        excludeId: String?,
        checkType: String,
        tasks: [Schedule],
        currentSessionId: String
    ) -> Bool {
        let newStart = Double(TimeMath.timeToMinutes(startTime) ?? 0)
        let newEnd = newStart + Double(TimeMath.parseTime(durationStr)) / 60.0

        return tasks.contains { task in
            if task.scheduleId == excludeId { return false }
            if task.date != date { return false }
            if (task.sessionId ?? "S_DEFAULT") != currentSessionId { return false }
            if taskType(of: task) != checkType { return false }

            let taskStart = Double(TimeMath.timeToMinutes(task.startTime) ?? 0)
            let taskEnd = taskStart + Double(TimeMath.parseTime(task.estDuration)) / 60.0
            return newStart < taskEnd && newEnd > taskStart
        }
    }

    /// 移植 `getOverlapCount`：统计某任务与同一天其余任务的重叠数量（不按分类/session 过滤）。
    public static func getOverlapCount(_ target: Schedule, tasks: [Schedule]) -> Int {
        let targetStart = Double(TimeMath.timeToMinutes(target.startTime) ?? 0)
        let targetEnd = targetStart + Double(TimeMath.parseTime(target.estDuration)) / 60.0
        var overlapCount = 0

        for task in tasks where task.date == target.date {
            if task.scheduleId == target.scheduleId { continue }
            let taskStart = Double(TimeMath.timeToMinutes(task.startTime) ?? 0)
            let taskEnd = taskStart + Double(TimeMath.parseTime(task.estDuration)) / 60.0
            if targetStart < taskEnd && targetEnd > taskStart {
                overlapCount += 1
            }
        }
        return overlapCount
    }

    /// 移植 `isTaskGhost`：不属于当前 session、或在当前分类下没有对应 id 的任务是幽灵。
    /// 例外：在「还在用的分类」里都没有 id 的老任务（如只剩 instrumentId）按正常任务处理。
    public static func isTaskGhost(_ task: Schedule, currentSessionId: String, sidebarTab: String) -> Bool {
        let taskSession = task.sessionId ?? "S_DEFAULT"
        if taskSession != currentSessionId { return true }

        let belongsToLiveTab = SidebarTabs.sidebarTabs.contains { tab in
            guard let idKey = taskIdKeyByTab[tab] else { return false }
            return idValue(idKey, task) != nil
        }
        if !belongsToLiveTab { return false }

        guard let idKey = taskIdKeyByTab[sidebarTab] else { return false }
        return idValue(idKey, task) == nil
    }

    /// 移植 schedule-drag-drop.js 的 dropToMonth/dropToSchedule 里「任务池 → 日程」的建块逻辑。
    /// templateId 指回 PoolItem.id；trackCount 固定 0（源码即如此）。
    public static func buildSchedule(
        fromPoolItem item: PoolItem,
        date: String,
        startTime: String,
        sessionId: String,
        scheduleId: String
    ) -> Schedule {
        var s = Schedule(scheduleId: scheduleId, date: date, startTime: startTime, estDuration: item.estDuration ?? "00:30")
        s.templateId = item.id
        s.sessionId = sessionId
        s.musicianId = item.musicianId
        s.projectId = item.projectId
        s.instrumentId = item.instrumentId
        s.ratio = item.ratio
        s.musicDuration = item.musicDuration
        s.trackCount = 0
        return s
    }
}
