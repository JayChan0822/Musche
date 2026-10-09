import SwiftUI

/// 视觉设计系统：复刻 Web 版的深色渐变 + 玻璃拟态 + 悬浮 dock。
enum Theme {
    /// 主色（对应 #007aff）
    static let accent = Color(red: 0, green: 122 / 255, blue: 1)

    /// 任务块/统计卡片左边框颜色（对应 schedule.js getTaskStyle）
    static let musicianColor = Color(red: 168 / 255, green: 85 / 255, blue: 247 / 255)  // #a855f7
    static let projectColor = Color(red: 234 / 255, green: 179 / 255, blue: 8 / 255)    // #eab308
    static let instrumentColor = Color(red: 59 / 255, green: 130 / 255, blue: 246 / 255) // #3b82f6
}

/// 深色径向渐变背景（对应 base.css 的三层 radial-gradient）。
struct AppBackground: View {
    var body: some View {
        ZStack {
            Color(red: 0.055, green: 0.055, blue: 0.08)
            RadialGradient(colors: [Color.purple.opacity(0.5), .clear], center: UnitPoint(x: 0, y: 0), startRadius: 0, endRadius: 720)
            RadialGradient(colors: [Color.blue.opacity(0.45), .clear], center: UnitPoint(x: 0.5, y: 0), startRadius: 0, endRadius: 720)
            RadialGradient(colors: [Color.pink.opacity(0.4), .clear], center: UnitPoint(x: 1.0, y: 0), startRadius: 0, endRadius: 720)
        }
        .ignoresSafeArea()
    }
}

extension View {
    /// 玻璃拟态表面（毛玻璃 + 细描边）。
    func glass(cornerRadius: CGFloat = 24) -> some View {
        self
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous).stroke(.white.opacity(0.12), lineWidth: 1))
    }
}
