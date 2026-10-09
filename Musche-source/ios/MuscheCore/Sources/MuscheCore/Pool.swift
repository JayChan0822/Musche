import Foundation

/// 任务池的构建逻辑，直译自 `features/quick-add.js` 的 addItemToPool。
public enum Pool {

    /// 新建一条任务池条目：同名去重追加序号、按乐手默认倍率算 estDuration、补全 records/splitViews。
    /// - Parameters:
    ///   - baseName: 基础名称（通常由乐器名解析而来）。
    public static func buildItem(
        id: String,
        sessionId: String,
        projectId: String,
        instrumentId: String,
        musicianId: String,
        musicDuration: String,
        baseName: String,
        existingPool: [PoolItem],
        settings: Settings
    ) -> PoolItem {
        let musicianRatio = Ratio.getDefaultRatio(musicianId, type: "musician", settings: settings)

        // 同名去重：同 session、同项目、同乐器、同名 → 追加序号
        var finalName = baseName
        let siblings = existingPool.filter {
            ($0.sessionId ?? "S_DEFAULT") == sessionId &&
            $0.projectId == projectId &&
            $0.instrumentId == instrumentId &&
            $0.name == finalName
        }
        if !siblings.isEmpty {
            finalName = "\(finalName) \(siblings.count + 1)"
        }

        var item = PoolItem(id: id, name: finalName)
        item.sessionId = sessionId
        item.projectId = projectId
        item.instrumentId = instrumentId
        item.musicianId = musicianId
        item.musicDuration = musicDuration
        item.orchestration = ""
        item.ratios = Ratios(musician: nil, project: nil, instrument: nil)
        item.ratio = musicianRatio
        item.estDuration = Ratio.calculateEstTime(musicDuration, musicianRatio)

        Ratio.ensureItemRecords(&item)
        return item
    }
}
