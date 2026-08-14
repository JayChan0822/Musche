import Foundation

/// 日视图时间轴里「落点/拉伸/当前时刻红线」的纯计算，直译自
/// `features/schedule-drag-drop.js`（dropToSchedule）与 `features/mobile-resize.js`。
/// 手势/DOM 命中测试在 SwiftUI 侧重写，这里的算法照搬。
public enum DayViewMath {

    /// 移植 dropToSchedule 的落点计算：相对 y → 分钟 → 30 分钟吸附 → [startHour, endHour-30min] 钳制 → "HH:MM"。
    public static func snapDropToTime(
        relativeY: Double,
        offsetMinutes: Int,
        pxPerMin: Double,
        startHour: Int,
        endHour: Int
    ) -> String {
        var adjustY = relativeY
        if offsetMinutes != 0 {
            adjustY -= Double(offsetMinutes) * pxPerMin
        }

        let rawMins = adjustY / pxPerMin
        let totalMins = Double(startHour * 60) + rawMins

        var snapped = jsRound(totalMins / 30.0) * 30
        let minStart = startHour * 60
        let maxStart = endHour * 60 - 30
        snapped = max(minStart, min(maxStart, snapped))

        return TimeMath.formatClock(snapped / 60, snapped % 60)
    }

    /// 移植 handleMobileResizeMove 的拉伸计算：目标高度 → 分钟 → 结束分钟吸附 30 → 最短 5 分钟 → "HH:MM:SS"。
    public static func snapResizeDuration(
        deltaY: Double,
        startHeight: Double,
        startTime: String,
        pxPerMin: Double
    ) -> String {
        let targetHeight = max(5, startHeight + deltaY)
        let rawDurationMins = targetHeight / pxPerMin
        let startMins = TimeMath.timeToMinutes(startTime) ?? 0
        let rawEndMins = Double(startMins) + rawDurationMins
        let snappedEndMins = jsRound(rawEndMins / 30.0) * 30

        var newDurationMins = snappedEndMins - startMins
        if newDurationMins < 5 { newDurationMins = 5 }

        return Format.formatSecs(newDurationMins * 60)
    }

    /// 移植 handleMobileResizeEnd 的倍率回写：estDuration(实际) / musicDuration(乐曲)，保留 1 位小数。
    /// 音乐时长为空/为 0 时返回 nil（不写回）。JS 侧存 toFixed(1) 字符串，这里返回 Double。
    public static func recomputeRatioAfterResize(musicDuration: String?, estDuration: String) -> Double? {
        let musicSeconds = TimeMath.parseTime(musicDuration)
        guard musicSeconds > 0 else { return nil }
        let recordSeconds = TimeMath.parseTime(estDuration)
        return (Double(recordSeconds) / Double(musicSeconds) * 10).rounded() / 10
    }

    /// 移植 nowIndicator：当前时刻落在可视时段内时返回其距顶部的像素，否则 nil。
    public static func nowIndicatorTop(nowMinutes: Int, startHour: Int, endHour: Int, pxPerMin: Double) -> Double? {
        let startMinutes = startHour * 60
        let endMinutes = endHour * 60
        guard nowMinutes >= startMinutes && nowMinutes <= endMinutes else { return nil }
        return Double(nowMinutes - startMinutes) * pxPerMin
    }

    /// 任务块距时间轴顶部的像素（getTaskStyle 里的 top）。
    public static func taskTopPx(startTime: String, startHour: Int, pxPerMin: Double) -> Double {
        Double((TimeMath.timeToMinutes(startTime) ?? 0) - startHour * 60) * pxPerMin
    }

    /// 任务块高度像素（getTaskStyle 里的 height）。
    public static func taskHeightPx(estDuration: String, pxPerMin: Double) -> Double {
        Double(TimeMath.parseTime(estDuration)) / 60.0 * pxPerMin
    }
}
