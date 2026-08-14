import Foundation

/// 移植 track-list-records.js 的 1.5s 防抖写回（清单「坑 #6」）。
/// 定时器通过可注入的「调度器」隔离，测试里注入手动调度器即可确定性验证 reset/cancel 语义。
public final class Debouncer {
    private var generation = 0
    private let delay: TimeInterval
    private let schedule: (TimeInterval, @escaping () -> Void) -> Void

    /// - Parameters:
    ///   - delay: 防抖窗口（默认 1.5s）。
    ///   - schedule: 调度器；测试注入手动版本，生产用 DispatchQueue.asyncAfter。
    public init(delay: TimeInterval = 1.5, schedule: @escaping (TimeInterval, @escaping () -> Void) -> Void) {
        self.delay = delay
        self.schedule = schedule
    }

    /// 对应 `saveTrackRecord`：重置防抖，`delay` 后执行 writeBack（期间再 save 会作废旧任务）。
    public func save(_ writeBack: @escaping () -> Void) {
        generation += 1
        let gen = generation
        schedule(delay) { [weak self] in
            guard let self, self.generation == gen else { return }
            writeBack()
        }
    }

    /// 对应 `cancelPendingTrackSave`：使所有挂起的写回失效。
    public func cancel() {
        generation += 1
    }
}
