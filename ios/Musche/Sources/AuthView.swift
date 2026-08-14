import SwiftUI
import MuscheCore

/// 登录/注册（supabase Auth）。
struct AuthView: View {
    let model: AppModel
    @State private var email = ""
    @State private var password = ""
    @State private var message = ""
    @State private var isLoading = false

    var body: some View {
        NavigationStack {
            Form {
                Section("登录 Musche") {
                    TextField("邮箱", text: $email)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .keyboardType(.emailAddress)
                    SecureField("密码", text: $password)
                }
                if !message.isEmpty {
                    Text(message)
                        .font(.caption)
                        .foregroundStyle(.red)
                }
                Section {
                    Button("登录") { Task { await signIn() } }
                        .disabled(email.isEmpty || password.isEmpty || isLoading)
                    Button("注册") { Task { await signUp() } }
                        .disabled(email.isEmpty || password.isEmpty || isLoading)
                }
            }
            .navigationTitle("Musche")
            .disabled(isLoading)
        }
    }

    private func signIn() async {
        isLoading = true
        defer { isLoading = false }
        do {
            try await model.signIn(email: email, password: password)
        } catch {
            message = "登录失败：\(error.localizedDescription)"
        }
    }

    private func signUp() async {
        isLoading = true
        defer { isLoading = false }
        do {
            try await model.signUp(email: email, password: password)
        } catch {
            message = "注册失败：\(error.localizedDescription)"
        }
    }
}
