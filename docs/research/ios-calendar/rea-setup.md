# 本机 REA / Ghidra 配置记录

2026-10-14，经用户明确授权安装 iOS 模拟器及反编译引擎。

## 安装内容

- Xcode 27.0 (27A266a) 已有；通过 `xcodebuild -downloadPlatform iOS -architectureVariant arm64` 安装 iOS 27.0 (24A434) ARM64 runtime，安装命令退出码 0。
- Ghidra 12.1.4：`/Users/jaychan/.local/share/rea-tools/ghidra_12.1.4_PUBLIC`。
- Temurin JDK 21.0.12.1+1 ARM64：`/Users/jaychan/.local/share/rea-tools/jdk-21.0.12.1+1/Contents/Home`。
- Ghidra 官方包未包含 macOS ARM64 native decompiler，按 REA 官方文档使用已有 Xcode 工具链编译：`make -j4 ghidra_opt ARCH_TYPE='-arch arm64' OSDIR=mac_arm_64`，安装在 `Ghidra/Features/Decompiler/os/mac_arm_64/decompile`。`file` 确认 Mach-O arm64。
- 不修改系统默认 Java，不安装 Hopper/IDA，不修改 Gatekeeper 或审批策略。

下载包 SHA-256 已核验：

| 包 | 校验值 |
| --- | --- |
| Ghidra 12.1.4 官方 zip | `ddac49f903da9d5bac833e5cc79395098b9c33cfd3279be5f31bd00387d2d4db` |
| Temurin 21 ARM64 tar.gz | `3623232f33a9c3baadf304480b2535f9a3cba8a58d42ecbb438ba267315d9998` |

官方来源：[Ghidra 12.1.4](https://github.com/NationalSecurityAgency/ghidra/releases/tag/Ghidra_12.1.4_build)、[Temurin 21](https://github.com/adoptium/temurin21-binaries/releases/tag/jdk-21.0.12.1%2B1)、[REA 安装文档](https://github.com/morluto/rea/blob/main/docs/installation.md)、[Codex MCP 配置](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)。

## Codex 配置

文件：`/Users/jaychan/.codex/config.toml`。REA 保持原有 `npx -y rea-agents@6.4.0 mcp` 启动方式。

```toml
[mcp_servers.rea]
command = "npx"
args = ["-y", "rea-agents@6.4.0", "mcp"]
startup_timeout_sec = 30
tool_timeout_sec = 600

[mcp_servers.rea.env]
GHIDRA_INSTALL_DIR = "/Users/jaychan/.local/share/rea-tools/ghidra_12.1.4_PUBLIC"
JAVA_HOME = "/Users/jaychan/.local/share/rea-tools/jdk-21.0.12.1+1/Contents/Home"
```

实际 TOML 已解析校验，并与变更前备份比较：除 `mcp_servers.rea` 外其余配置结构完全相同。REA 官方 setup dry-run 仅计划更新 Codex 注册项，没有替换技能。

变更前备份：`/Users/jaychan/.codex/config.toml.before-ghidra-20261014-015507.bak`；REA 自带备份：`/Users/jaychan/.codex/config.toml.rea.backup`。如需撤销，优先仅恢复 REA 小节，以免覆盖此后其他设置。

## 验证与生效

JDK 的 `java -version` 和 `javac -version` 都为 21.0.12.1。REA doctor 中 Ghidra 的 configuration/platform/architecture/installation/version/headless/native_decompiler/java 检查全部为 true，provider available=true。全局 doctor 仍可能报告其他未配置客户端/引擎，不应把它误读为 Ghidra 不可用。

已有桌面 MCP 进程不会自动继承后来写入的环境变量。重连 REA 或重启 Codex 后读取新配置。本次使用相同配置启动独立 REA MCP 会话进行实际 Calendar 反编译验证，不要求用户先重启整个应用。

模拟器 runtime 已安装且系统日历产物可读，但 `simctl list runtimes` 查询曾长时间无响应，已停止本次任务的两条查询；未宣称模拟器 GUI 已成功启动。静态分析不依赖启动模拟器设备。
