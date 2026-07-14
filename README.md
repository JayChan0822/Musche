# Musche

面向音乐人/录音棚的 Web 排程应用：以“任务池 + 周/月视图日程”为核心，支持拖拽排程、轨道列表（TrackList）、任务拆分、MIDI / CSV / XLSX 导入导出、Credits 生成、撤销历史和 Supabase 账号同步。

技术栈：Vue 3（ESM 运行时组件，无 SFC）+ Vite + Tailwind CSS + Supabase，部署在 Vercel。

## 本地开发

```bash
npm install
npm run dev
```

Supabase 配置二选一（本地开发推荐前者，托管构建用后者）：

- **本地文件**：创建 `app/config.local.js`（已被 gitignore）：

  ```js
  window.__MUSCHE_CONFIG__ = {
    supabaseUrl: 'https://xxx.supabase.co',
    supabaseKey: '<anon key>',
  };
  ```

- **环境变量**：`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_KEY`。

## 测试与构建

```bash
npm test          # 模块化烟雾测试 + node --test 全量测试
npm run test:e2e  # Playwright E2E 冒烟测试（基于 vite preview，本地模式、不连 Supabase）
npm run build     # 产物输出到 app/dist（Vercel 部署目录）
npm run preview
```

## 目录结构

```
app/
  index.html              # 仅保留壳层挂载点，UI 全部组件化
  scripts/
    app.js                # 组合根：装配 state / feature / 组件
    components/           # Vue 运行时组件（按弹窗/区块拆分）
    features/             # 业务功能模块（register/load 两种形态）
    services/             # 依赖装配、feature loader/registrar、外部服务
    state/                # 状态工厂与各 shell state
    utils/                # 纯函数工具（time/csv/midi/split-state 等）
  styles/                 # Tailwind + 分层 CSS
docs/plans/               # 各轮重构的设计与实施计划
docs/security/            # 安全记录（密钥轮换等）
tests/                    # 边界测试 + 行为测试（node --test）
```

架构约定详见 [CLAUDE.md](CLAUDE.md)。
