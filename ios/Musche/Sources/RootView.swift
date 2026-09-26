import SwiftUI
import MuscheCore

/// 根视图：未登录显示登录页；登录后进入主界面。
/// 深色渐变底 + 系统 TabView（iOS 26 下原生液态玻璃 tab bar）。
struct RootView: View {
    @State private var model = AppModel()
    @State private var tab = Tab.calendar
    /// 任务池里点「定位」时写进来：切到日历页并直接打开那一天
    @State private var focusDate: String?

    private enum Tab: Hashable { case calendar, pool }

    var body: some View {
        Group {
            if model.isSignedIn {
                ZStack {
                    AppBackground()
                    TabView(selection: $tab) {
                        NavigationStack {
                            MonthView(model: model, focusDate: $focusDate)
                        }
                        .tabItem { Label("日历", systemImage: "calendar") }
                        .tag(Tab.calendar)

                        NavigationStack {
                            PoolView(model: model, onLocate: { dateStr in
                                focusDate = dateStr
                                tab = .calendar
                            })
                        }
                        .tabItem { Label("任务池", systemImage: "list.bullet") }
                        .tag(Tab.pool)
                    }
                    .tint(Theme.accent)
                }
            } else {
                AuthView(model: model)
            }
        }
        .task {
            await model.restoreSession()
        }
    }
}
