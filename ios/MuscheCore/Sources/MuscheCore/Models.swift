import Foundation

// MARK: - 数据模型（Codable 直接映射 user_data 里的 JSON blob）

/// 一个用户一行：content(JSON) + version(乐观锁)。不拆关系表。
public struct UserData: Codable, Equatable {
    public var pool: [PoolItem]
    public var tasks: [Schedule]
    public var settings: Settings
    public var version: Int

    public init(pool: [PoolItem], tasks: [Schedule], settings: Settings, version: Int) {
        self.pool = pool
        self.tasks = tasks
        self.settings = settings
        self.version = version
    }
}

/// Supabase `user_data.content` 列的 JSON 形状（version 是独立列，不在 content 里）。
public struct CloudContent: Codable, Equatable {
    public var pool: [PoolItem]
    public var tasks: [Schedule]
    public var settings: Settings

    public init(pool: [PoolItem], tasks: [Schedule], settings: Settings) {
        self.pool = pool
        self.tasks = tasks
        self.settings = settings
    }
}

public extension UserData {
    var cloudContent: CloudContent {
        CloudContent(pool: pool, tasks: tasks, settings: settings)
    }

    init(cloudContent: CloudContent, version: Int) {
        self.pool = cloudContent.pool
        self.tasks = cloudContent.tasks
        self.settings = cloudContent.settings
        self.version = version
    }
}

/// 每个视图的拆分状态（对应 `utils/split-state.js` 的 createSplitState 产物）。
public struct SplitViewState: Codable, Equatable {
    public var active: Bool
    public var splitFromId: String?
    public var splitTag: String
    public var musicDuration: String
    public var estDuration: String
    public var sectionIndex: Int

    public init(
        active: Bool = true,
        splitFromId: String? = nil,
        splitTag: String = "",
        musicDuration: String = "",
        estDuration: String = "",
        sectionIndex: Int = 0
    ) {
        self.active = active
        self.splitFromId = splitFromId
        self.splitTag = splitTag
        self.musicDuration = musicDuration
        self.estDuration = estDuration
        self.sectionIndex = sectionIndex
    }
}

/// 每视图拆分状态集合（musician / project；instrument 已下线）。
public struct SplitViews: Codable, Equatable {
    public var musician: SplitViewState?
    public var project: SplitViewState?

    public init(musician: SplitViewState? = nil, project: SplitViewState? = nil) {
        self.musician = musician
        self.project = project
    }

    public subscript(type: String) -> SplitViewState? {
        get {
            switch type {
            case "musician": return musician
            case "project": return project
            default: return nil
            }
        }
        set {
            switch type {
            case "musician": musician = newValue
            case "project": project = newValue
            default: break
            }
        }
    }
}

/// 实际起止时间与时长（records.musician / project / instrument 各一份）。
public struct Record: Codable, Equatable {
    public var recStart: String?
    public var recEnd: String?
    public var actualDuration: String?
    public var breakMinutes: Double?

    public init(recStart: String? = nil, recEnd: String? = nil, actualDuration: String? = nil, breakMinutes: Double? = nil) {
        self.recStart = recStart
        self.recEnd = recEnd
        self.actualDuration = actualDuration
        self.breakMinutes = breakMinutes
    }
}

/// 三套录音记录（musician / project / instrument）。
public struct Records: Codable, Equatable {
    public var musician: Record?
    public var project: Record?
    public var instrument: Record?

    public init(musician: Record? = nil, project: Record? = nil, instrument: Record? = nil) {
        self.musician = musician
        self.project = project
        self.instrument = instrument
    }

    public subscript(type: String) -> Record? {
        get {
            switch type {
            case "musician": return musician
            case "project": return project
            case "instrument": return instrument
            default: return nil
            }
        }
        set {
            switch type {
            case "musician": musician = newValue
            case "project": project = newValue
            case "instrument": instrument = newValue
            default: break
            }
        }
    }
}

/// 三套倍率（null = 自动跟随）。null 与缺失在行为上等价，Codable 下都解码为 nil。
public struct Ratios: Codable, Equatable {
    public var musician: Double?
    public var project: Double?
    public var instrument: Double?

    public init(musician: Double? = nil, project: Double? = nil, instrument: Double? = nil) {
        self.musician = musician
        self.project = project
        self.instrument = instrument
    }

    public subscript(type: String) -> Double? {
        get {
            switch type {
            case "musician": return musician
            case "project": return project
            case "instrument": return instrument
            default: return nil
            }
        }
        set {
            switch type {
            case "musician": musician = newValue
            case "project": project = newValue
            case "instrument": instrument = newValue
            default: break
            }
        }
    }
}

/// 任务池条目（待排程的「曲目 × 乐手」）。
public struct PoolItem: Codable, Equatable, Identifiable {
    public var id: String
    public var sessionId: String? = nil
    public var projectId: String? = nil
    public var instrumentId: String? = nil
    public var musicianId: String? = nil
    public var name: String
    public var musicDuration: String? = nil
    public var estDuration: String? = nil
    public var ratio: Double? = nil
    public var ratios: Ratios? = nil
    public var records: Records? = nil
    public var splitViews: SplitViews? = nil
    public var orchestration: String? = nil
    public var group: String? = nil
    public var recordingInfo: [String: String]? = nil
    public var editInfo: [String: String]? = nil
    public var roster: [String: String]? = nil
    // 拆分旧字段（与 splitViews 双写）
    public var splitFromId: String? = nil
    public var splitTag: String? = nil
    public var sectionIndex: Int? = nil
    public var sharedMusicDuration: String? = nil
    public var trackCount: Int? = nil
    // 老数据迁移字段（ratio.js ensureItemRecords 读取）
    public var actualDuration: String? = nil
    public var recStart: String? = nil
    public var recEnd: String? = nil
    public var breakMinutes: Double? = nil
}

/// 已落到日历上的时间块。
/// 注意：scheduleId 在线上历史数据里既有字符串也有数字（Date.now()），用容错解码统一成 String。
public struct Schedule: Codable, Equatable {
    public var scheduleId: String
    public var templateId: String? = nil
    public var sessionId: String? = nil
    public var date: String
    public var startTime: String
    public var estDuration: String
    public var musicianId: String? = nil
    public var projectId: String? = nil
    public var instrumentId: String? = nil
    public var ratio: Double? = nil
    public var trackCount: Int? = nil
    public var musicDuration: String? = nil
    public var recordingInfo: [String: String]? = nil
    public var editInfo: [String: String]? = nil
    public var ratios: Ratios? = nil
    public var records: Records? = nil
    public var splitViews: SplitViews? = nil
    public var splitFromId: String? = nil
    public var splitTag: String? = nil
    public var sectionIndex: Int? = nil
    public var actualDuration: String? = nil
    public var recStart: String? = nil
    public var recEnd: String? = nil
    public var breakMinutes: Double? = nil
    public var orchestration: String? = nil
    public var statusOverride: String? = nil

    public init(
        scheduleId: String,
        templateId: String? = nil,
        sessionId: String? = nil,
        date: String,
        startTime: String,
        estDuration: String,
        musicianId: String? = nil,
        projectId: String? = nil,
        instrumentId: String? = nil,
        ratio: Double? = nil,
        trackCount: Int? = nil,
        musicDuration: String? = nil,
        recordingInfo: [String: String]? = nil,
        editInfo: [String: String]? = nil,
        ratios: Ratios? = nil,
        records: Records? = nil,
        splitViews: SplitViews? = nil,
        splitFromId: String? = nil,
        splitTag: String? = nil,
        sectionIndex: Int? = nil,
        actualDuration: String? = nil,
        recStart: String? = nil,
        recEnd: String? = nil,
        breakMinutes: Double? = nil,
        orchestration: String? = nil,
        statusOverride: String? = nil
    ) {
        self.scheduleId = scheduleId
        self.templateId = templateId
        self.sessionId = sessionId
        self.date = date
        self.startTime = startTime
        self.estDuration = estDuration
        self.musicianId = musicianId
        self.projectId = projectId
        self.instrumentId = instrumentId
        self.ratio = ratio
        self.trackCount = trackCount
        self.musicDuration = musicDuration
        self.recordingInfo = recordingInfo
        self.editInfo = editInfo
        self.ratios = ratios
        self.records = records
        self.splitViews = splitViews
        self.splitFromId = splitFromId
        self.splitTag = splitTag
        self.sectionIndex = sectionIndex
        self.actualDuration = actualDuration
        self.recStart = recStart
        self.recEnd = recEnd
        self.breakMinutes = breakMinutes
        self.orchestration = orchestration
        self.statusOverride = statusOverride
    }

    enum CodingKeys: String, CodingKey {
        case scheduleId, templateId, sessionId, date, startTime, estDuration
        case musicianId, projectId, instrumentId, ratio, trackCount, musicDuration
        case recordingInfo, editInfo, ratios, records, splitViews
        case splitFromId, splitTag, sectionIndex, actualDuration, recStart, recEnd, breakMinutes
        case orchestration, statusOverride
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        scheduleId = try Self.decodeScheduleID(c)
        templateId = try c.decodeIfPresent(String.self, forKey: .templateId)
        sessionId = try c.decodeIfPresent(String.self, forKey: .sessionId)
        date = try c.decode(String.self, forKey: .date)
        startTime = try c.decode(String.self, forKey: .startTime)
        estDuration = try c.decode(String.self, forKey: .estDuration)
        musicianId = try c.decodeIfPresent(String.self, forKey: .musicianId)
        projectId = try c.decodeIfPresent(String.self, forKey: .projectId)
        instrumentId = try c.decodeIfPresent(String.self, forKey: .instrumentId)
        ratio = try c.decodeIfPresent(Double.self, forKey: .ratio)
        trackCount = try c.decodeIfPresent(Int.self, forKey: .trackCount)
        musicDuration = try c.decodeIfPresent(String.self, forKey: .musicDuration)
        recordingInfo = try c.decodeIfPresent([String: String].self, forKey: .recordingInfo)
        editInfo = try c.decodeIfPresent([String: String].self, forKey: .editInfo)
        ratios = try c.decodeIfPresent(Ratios.self, forKey: .ratios)
        records = try c.decodeIfPresent(Records.self, forKey: .records)
        splitViews = try c.decodeIfPresent(SplitViews.self, forKey: .splitViews)
        splitFromId = try c.decodeIfPresent(String.self, forKey: .splitFromId)
        splitTag = try c.decodeIfPresent(String.self, forKey: .splitTag)
        sectionIndex = try c.decodeIfPresent(Int.self, forKey: .sectionIndex)
        actualDuration = try c.decodeIfPresent(String.self, forKey: .actualDuration)
        recStart = try c.decodeIfPresent(String.self, forKey: .recStart)
        recEnd = try c.decodeIfPresent(String.self, forKey: .recEnd)
        breakMinutes = try c.decodeIfPresent(Double.self, forKey: .breakMinutes)
        orchestration = try c.decodeIfPresent(String.self, forKey: .orchestration)
        statusOverride = try c.decodeIfPresent(String.self, forKey: .statusOverride)
    }

    public func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        try c.encode(scheduleId, forKey: .scheduleId)
        try c.encodeIfPresent(templateId, forKey: .templateId)
        try c.encodeIfPresent(sessionId, forKey: .sessionId)
        try c.encode(date, forKey: .date)
        try c.encode(startTime, forKey: .startTime)
        try c.encode(estDuration, forKey: .estDuration)
        try c.encodeIfPresent(musicianId, forKey: .musicianId)
        try c.encodeIfPresent(projectId, forKey: .projectId)
        try c.encodeIfPresent(instrumentId, forKey: .instrumentId)
        try c.encodeIfPresent(ratio, forKey: .ratio)
        try c.encodeIfPresent(trackCount, forKey: .trackCount)
        try c.encodeIfPresent(musicDuration, forKey: .musicDuration)
        try c.encodeIfPresent(recordingInfo, forKey: .recordingInfo)
        try c.encodeIfPresent(editInfo, forKey: .editInfo)
        try c.encodeIfPresent(ratios, forKey: .ratios)
        try c.encodeIfPresent(records, forKey: .records)
        try c.encodeIfPresent(splitViews, forKey: .splitViews)
        try c.encodeIfPresent(splitFromId, forKey: .splitFromId)
        try c.encodeIfPresent(splitTag, forKey: .splitTag)
        try c.encodeIfPresent(sectionIndex, forKey: .sectionIndex)
        try c.encodeIfPresent(actualDuration, forKey: .actualDuration)
        try c.encodeIfPresent(recStart, forKey: .recStart)
        try c.encodeIfPresent(recEnd, forKey: .recEnd)
        try c.encodeIfPresent(breakMinutes, forKey: .breakMinutes)
        try c.encodeIfPresent(orchestration, forKey: .orchestration)
        try c.encodeIfPresent(statusOverride, forKey: .statusOverride)
    }

    private static func decodeScheduleID(_ c: KeyedDecodingContainer<CodingKeys>) throws -> String {
        if let s = try? c.decode(String.self, forKey: .scheduleId) { return s }
        if let i = try? c.decode(Int.self, forKey: .scheduleId) { return String(i) }
        if let d = try? c.decode(Double.self, forKey: .scheduleId) {
            return d == d.rounded() ? String(Int(d)) : String(d)
        }
        throw DecodingError.dataCorruptedError(forKey: .scheduleId, in: c, debugDescription: "scheduleId 应为 String 或 Number")
    }
}

/// 设置里的通用条目（乐手/乐器/项目/棚/工程师/操作员/助理/档期都用 {id, name, ...extra}）。
public struct SettingEntry: Codable, Equatable {
    public var id: String
    public var name: String
    public var color: String?
    public var group: String?
    public var defaultRatio: Double?

    public init(id: String, name: String, color: String? = nil, group: String? = nil, defaultRatio: Double? = nil) {
        self.id = id
        self.name = name
        self.color = color
        self.group = group
        self.defaultRatio = defaultRatio
    }
}

/// 设置（对应 state/defaults.js）。
public struct Settings: Codable, Equatable {
    public var startHour: Int
    public var endHour: Int
    public var sessions: [SettingEntry]
    public var instruments: [SettingEntry]
    public var musicians: [SettingEntry]
    public var projects: [SettingEntry]
    public var studios: [SettingEntry]
    public var engineers: [SettingEntry]
    public var operators: [SettingEntry]
    public var assistants: [SettingEntry]
}

// MARK: - 默认设置（对应 state/defaults.js 的 createDefaultSettings）

public extension Settings {
    static func defaults() -> Settings {
        Settings(
            startHour: 10,
            endHour: 22,
            sessions: [SettingEntry(id: "S_DEFAULT", name: "默认录音日程")],
            instruments: [
                SettingEntry(id: "Imi7d0318nsj", name: "曲笛 Qudi", color: "#60a5fa", group: "Ethnic Woodwinds"),
                SettingEntry(id: "Imi7d1wio42g", name: "大笛 Dadi", color: "#60a5fa", group: "Ethnic Woodwinds"),
                SettingEntry(id: "Imi7d1zhnrin", name: "箫 Xiao", color: "#60a5fa", group: "Ethnic Woodwinds"),
                SettingEntry(id: "Imi7d22qbj3x", name: "管子 Guanzi", color: "#60a5fa", group: "Ethnic Woodwinds"),
                SettingEntry(id: "Imi7d25hgyts", name: "葫芦丝 Hulusi", color: "#60a5fa", group: "Ethnic Woodwinds"),
                SettingEntry(id: "Imi7d28dmhcu", name: "嘟嘟克 Duduk", color: "#60a5fa", group: "Ethnic Woodwinds"),
                SettingEntry(id: "Imi7d2czbme5", name: "奈伊笛 Ney", color: "#60a5fa", group: "Ethnic Woodwinds"),
                SettingEntry(id: "Imi7d2fipt2s", name: "古筝 Guzheng", color: "#60a5fa", group: "Ethnic Plucks"),
                SettingEntry(id: "Imi7d2irx4rn", name: "琵琶 Pipa", color: "#60a5fa", group: "Ethnic Plucks"),
                SettingEntry(id: "Imi7d2lzuq1k", name: "中阮 Zhongruan", color: "#60a5fa", group: "Ethnic Plucks"),
                SettingEntry(id: "Imi7d2okw95k", name: "大阮 Daruan", color: "#60a5fa", group: "Ethnic Plucks"),
                SettingEntry(id: "Imi7d2usilyh", name: "扬琴 Yangqin", color: "#60a5fa", group: "Ethnic Plucks"),
                SettingEntry(id: "Imi7d2ypsa3n", name: "三弦 Sanxian", color: "#60a5fa", group: "Ethnic Plucks"),
                SettingEntry(id: "Imi7d321n3ff", name: "二胡 Erhu", color: "#60a5fa", group: "Ethnic Strings"),
                SettingEntry(id: "Imi7d35n8ore", name: "马头琴 Matouqin", color: "#60a5fa", group: "Ethnic Woodwinds"),
                SettingEntry(id: "Imi7d38kux53", name: "萨塔尔 Sataer", color: "#60a5fa", group: "Ethnic Strings"),
                SettingEntry(id: "Imi7d3b4omfr", name: "古典吉他 Classical Guitar", color: "#60a5fa", group: "Plucks"),
                SettingEntry(id: "Imi7d3drxrgi", name: "钢弦吉他 Acoustic Guitar", color: "#60a5fa", group: "Plucks"),
                SettingEntry(id: "Imi7d3gz35vm", name: "萨兹琴 Saz", color: "#60a5fa", group: "Ethnic Plucks"),
                SettingEntry(id: "Imi7d3jqoe3p", name: "西塔尔 Sitar", color: "#60a5fa", group: "Ethnic Plucks"),
                SettingEntry(id: "Imi7d3lxykzm", name: "笙 Sheng", color: "#60a5fa", group: "Ethnic Woodwinds"),
                SettingEntry(id: "Imi7d3pcnpbh", name: "尺八 Shakuhachi", color: "#60a5fa", group: "Ethnic Woodwinds"),
                SettingEntry(id: "Imi7d3s0hrcp", name: "人声 Vocal", color: "#60a5fa", group: "Vocal"),
                SettingEntry(id: "tmi8ygljxuqkaatv", name: "低音马头琴 Diyin Matouqin", color: "#60a5fa", group: "Ethnic Strings"),
                SettingEntry(id: "tmifto6q9igynzmf", name: "钢琴 Piano", color: "#60a5fa", group: "Keys"),
            ],
            musicians: [],
            projects: [],
            studios: [],
            engineers: [],
            operators: [],
            assistants: []
        )
    }
}
