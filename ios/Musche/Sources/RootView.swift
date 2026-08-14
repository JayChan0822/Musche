import SwiftUI
import MuscheCore

/// 根视图：未登录显示登录页；登录后进入主界面。
/// 深色渐变底 + 系统 TabView（iOS 26 下原生液态玻璃 tab bar）。
struct RootView: View {
    @State private var model = AppModel()

    var body: some View {
        Group {
            if model.isSignedIn {
                ZStack {
                    AppBackground()
                    TabView {
                        NavigationStack {
                            MonthView(model: model)
                        }
                        .tabItem { Label("日历", systemImage: "calendar") }

                        NavigationStack {
                            PoolView(model: model)
                        }
                        .tabItem { Label("任务池", systemImage: "list.bullet") }
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
