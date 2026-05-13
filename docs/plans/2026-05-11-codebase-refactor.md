# Musche 代码库优化计划

> **执行约定**：本计划交给 Codex / Claude 按 Task 顺序逐步执行。每个 Task 完成后必须跑该 Task 的 **Verify** 命令，全部通过再进入下一个 Task。每个 Task 应单独提交一个 commit，commit message 用 `refactor: <task 标题>` 或 `fix: ...` 等常规前缀。
>
> **当前基线**：
> - `app/scripts/app.js` ≈ 10,929 行，单 `setup()` 里 ~200 个 ref / ~340 个函数 / 47 个 watch+computed
> - `app/index.html` ≈ 3,534 行，所有视图模板内联
> - Supabase anon key 硬编码进源码
> - Tailwind / Vue / Supabase 等全部走 CDN，无构建链
> - 228 处 `!important`，23 处 `document.getElementById/querySelector`
> - 现有测试：`tests/modularization-smoke.mjs`、`tests/rec-edit-split-state.mjs`、`tests/supabase-keepalive.test.mjs`

**仓库根**：`/Users/jaychan/Documents/GitHub/Musche`
**应用根**：`/Users/jaychan/Documents/GitHub/Musche/app`

---

## Phase 0 — 准备与防护

### Task 0.1：补齐 `.gitignore`，清理无关污染

**Files:**
- Edit: `/Users/jaychan/Documents/GitHub/Musche/.gitignore`

**Steps:**
1. 在 `.gitignore` 中加入以下条目（如果已存在则跳过该条）：
   ```
   .DS_Store
   **/.DS_Store
   .idea/workspace.xml
   ```
2. 从仓库索引里移除已被追踪的 `.DS_Store` 与 `.idea/workspace.xml`：
   ```bash
   git rm --cached -r --ignore-unmatch .DS_Store **/.DS_Store .idea/workspace.xml
   ```
3. 单独提交：`chore: ignore .DS_Store and IDE workspace files`

**Verify:**
- `git status` 不再显示 `.DS_Store`、`.idea/workspace.xml` 为已修改。
- 仓库根的 `.gitignore` 包含上述条目。

---

### Task 0.2：建立"重构守护"基线测试

**目的**：在动 `app.js` 之前先给纯逻辑模块加测试，作为后续重构的安全网。

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/tests/utils-time.test.mjs`
- Create: `/Users/jaychan/Documents/GitHub/Musche/tests/utils-midi.test.mjs`
- Create: `/Users/jaychan/Documents/GitHub/Musche/tests/utils-csv.test.mjs`
- Edit: `/Users/jaychan/Documents/GitHub/Musche/package.json`（在 `scripts.test` 串联新测试）

**Steps:**
1. 为 `app/scripts/utils/time.js` 中导出的每个函数（`parseTime`、`timeToMinutes`、`addMinutesToTime`、`addDaysToDate`）写 ≥ 3 个用例，覆盖：正常值 / 边界值（00:00、23:59、跨日）/ 异常输入。
2. 为 `app/scripts/utils/midi.js` 的 `normalizeForMatch`、`cleanMidiTrackName`、`calculateBarQuantizedDuration` 写用例，至少覆盖大小写、空白、Unicode、零值。
3. 为 `app/scripts/utils/csv.js` 的 `extractTime`、`normalizeDate`、`getOrchString` 写用例。
4. 用 Node 内置 test runner（`node --test`），与 `tests/supabase-keepalive.test.mjs` 保持同样的风格，**不引入新的依赖**。
5. 在 `package.json` 的 `scripts.test` 末尾追加：
   ```
   && node --test tests/utils-time.test.mjs tests/utils-midi.test.mjs tests/utils-csv.test.mjs
   ```

**Verify:**
- `npm test` 全部通过。
- 故意把 `parseTime` 改坏一行，对应测试必须 FAIL；恢复后再次 PASS。

---

## Phase 1 — 安全：处理 Supabase 密钥

### Task 1.1：把 Supabase URL/KEY 从源码移出，改为 runtime 注入

**Files:**
- Edit: `/Users/jaychan/Documents/GitHub/Musche/app/index.html`
- Edit: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/app.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/config.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/config.local.example.js`
- Edit: `/Users/jaychan/Documents/GitHub/Musche/.gitignore`（追加 `app/config.local.js`）

**Steps:**
1. 创建 `app/scripts/config.js`，从 `window.__MUSCHE_CONFIG__` 读取：
   ```js
   const cfg = window.__MUSCHE_CONFIG__ || {};
   export const SUPABASE_URL = cfg.supabaseUrl || '';
   export const SUPABASE_KEY = cfg.supabaseKey || '';
   if (!SUPABASE_URL || !SUPABASE_KEY) {
       console.error('[Musche] Missing Supabase config. Copy app/config.local.example.js to app/config.local.js.');
   }
   ```
2. 创建 `app/config.local.example.js`（不含真密钥，仅占位）：
   ```js
   window.__MUSCHE_CONFIG__ = {
       supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
       supabaseKey: 'YOUR-ANON-KEY'
   };
   ```
3. 让用户手动 `cp app/config.local.example.js app/config.local.js` 并填入真实值。把 `app/config.local.js` 加入 `.gitignore`。
4. 在 `app/index.html` 中，把 `<script src=".../supabase-js@2"></script>` 之后、加载 `scripts/app.js` 之前插入：
   ```html
   <script src="./config.local.js"></script>
   ```
   注意：必须是普通脚本（非 module），以便先于 ESM 入口执行。
5. 修改 `app/scripts/app.js` 第 41-42 行，删除硬编码常量，改为：
   ```js
   import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
   ```
6. **不要在本次 commit 删除原密钥的 git 历史**——这一步留给 1.2。

**Verify:**
- `grep -R "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" app/scripts app/index.html` 必须返回空。
- 在用户本地有 `config.local.js` 的情况下，应用启动后 Supabase 调用工作正常。
- `npm test` 仍通过。

---

### Task 1.2：发出密钥轮换告警（**仅记录，不自动执行**）

> ⚠️ Codex **不要**自动 rotate 或 force-push 重写历史。这一步只生成一个 checklist 文件，提醒人类操作者。

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/docs/security/2026-05-11-supabase-key-rotation.md`

**Steps:**
1. 在新文件中写明：
   - 旧 anon key 已经进入公开 git 历史，必须在 Supabase 控制台 rotate；
   - rotate 后更新本地 `config.local.js`；
   - 建议启用 RLS，列出当前所有表名（让人类 review 哪些需要 policy）；
   - 给出 `git log -S "qsbuegmcnivwkklxsyqj"` 命令以便 audit 旧引用。
2. 在 commit message 中明确 "documentation only, requires human action"。

**Verify:**
- 该 md 文件存在；不做其他改动。

---

## Phase 2 — 构建工具落地

### Task 2.1：引入 Vite 作为构建/开发服务器

**目标**：仍保持 `app/` 目录为应用根；用 Vite 接管资源打包，让后续可以本地化 Tailwind / Vue / Supabase。

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/vite.config.mjs`
- Edit: `/Users/jaychan/Documents/GitHub/Musche/package.json`
- Edit: `/Users/jaychan/Documents/GitHub/Musche/.gitignore`（追加 `dist/`、`app/dist/`）
- Edit: `/Users/jaychan/Documents/GitHub/Musche/capacitor.config.json`（如有需要把 `webDir` 指向构建产物）

**Steps:**
1. 安装：`npm i -D vite`（**不要**升级现有 runtime 依赖）。
2. `vite.config.mjs`：
   - `root: 'app'`
   - `build.outDir: '../www'`（覆盖现有 `www/`，对应 Capacitor 期望路径——先确认 `capacitor.config.json` 中 `webDir`）
   - `server.port: 5173`
3. `package.json` `scripts` 追加：
   ```
   "dev": "vite",
   "build": "vite build",
   "preview": "vite preview"
   ```
4. **不要**这一步就把 CDN 资源全部下沉。先验证 `npm run dev` 能直接拉起当前 `app/index.html`（它会忽略未识别的 cdn `<script>`，依旧从网络加载）。
5. 如果 `capacitor.config.json` 里 `webDir: "www"`，本步无需改动；否则同步更新。

**Verify:**
- `npm run dev` 起服务器，浏览器访问 `http://localhost:5173/` 应用功能完好（与 `file://` 打开 `app/index.html` 行为一致）。
- `npm run build` 不报错，产物落到 `www/`。
- `npm test` 仍通过。

---

### Task 2.2：把 Tailwind 改成构建期 PostCSS 流水线

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/tailwind.config.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/postcss.config.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/styles/tailwind.css`
- Edit: `/Users/jaychan/Documents/GitHub/Musche/app/index.html`（删除 `<script src="https://cdn.tailwindcss.com"></script>` 与内联 `tailwind.config`，改为引入 `tailwind.css`）

**Steps:**
1. `npm i -D tailwindcss postcss autoprefixer`
2. `tailwind.config.js` 中 `content: ['./app/index.html', './app/scripts/**/*.js']`，把当前 `index.html` 内联的 `theme.extend.colors.glass` / `boxShadow` 拷过来。
3. `tailwind.css`：
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
4. `app/index.html` 在 `<head>` 末尾删除 CDN tailwind 与内联 config，改为 `<link rel="stylesheet" href="./styles/tailwind.css">`（Vite 会处理）。
5. **不要**这一步合并 `base.css/components.css/layout.css/mobile.css`，保留它们的引用。
6. 重新 `npm run dev`，逐页对照 UI，**记录任何丢失的 class**——通常是动态拼接的 class 名（如 `'ring-[#007aff]'`），需要在 tailwind config 里加 `safelist`。

**Verify:**
- `npm run dev` 启动后视觉与之前一致（人工对照月视图、周视图、设置弹窗、CSV 导入弹窗）。
- 浏览器 Network 面板中不再请求 `cdn.tailwindcss.com`。
- `npm run build` 产物 CSS 经过 purge，体积应远小于 CDN 版。

---

### Task 2.3：把 Vue / Supabase / 其它 CDN 库下沉为 npm 依赖

**Files:**
- Edit: `/Users/jaychan/Documents/GitHub/Musche/app/index.html`
- Edit: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/app.js`（顶部 `import { createApp, ref, ... } from 'vue'`）
- Edit: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/services/supabase-service.js`

**Steps:**
1. `npm i vue@3 @supabase/supabase-js@2 pinyin-pro jzz jzz-midi-smf xlsx-js-style driver.js cropperjs`
2. 在 `app.js` 顶部把：
   ```js
   const {createApp, ref, computed, ...} = Vue;
   ```
   改为：
   ```js
   import { createApp, ref, computed, onMounted, onUnmounted, watch, reactive, nextTick } from 'vue';
   ```
3. `supabase-service.js` 内 `import { createClient } from '@supabase/supabase-js'` 替代 `window.supabase.createClient`。
4. 类似处理 `JZZ`、`pinyin-pro`、`XLSX`、`Cropper`、`driver.js` 的引用——**逐个**改、每改完一个跑一次 `npm run dev` 验证。
5. 从 `index.html` 删除对应 `<script>`/`<link>` 标签。font-awesome / Google Fonts 暂时保留为 CDN（不是 JS 依赖）。

**Verify:**
- `app/index.html` 中只剩字体、图标 CSS 和 `config.local.js`、`<script type="module" src="./scripts/app.js">` 几行。
- `npm run dev` 应用功能完整：登录、CSV 导入、MIDI 导入、调度拖拽、Credit 导出。
- `npm run build` 成功，`www/` 产物可被 Capacitor 加载。

---

## Phase 3 — 拆分 `app.js`

> **重要**：每个子 Task 拆完一个特性后必须保证应用功能与之前一致。建议每次拆完跑一遍核心场景：登录 → 选项目 → 切月/周视图 → 拖拽任务 → 编辑录制时间 → 导出 Credit。

### Task 3.1：建立 store 层，统一管理顶层 ref

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/store/index.js`
- Edit: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/app.js`

**Steps:**
1. 在 `store/index.js` 中导出一个 `createMuscheStore()` 工厂函数，内部 `import { ref, reactive } from 'vue'`，把 `app.js` 第 83-209 行那批顶层 ref/reactive **整段** 搬过来，然后 `return { itemPool, scheduledTasks, ... }`。
2. `app.js` 改为：
   ```js
   import { createMuscheStore } from './store/index.js';
   ...
   setup() {
       const store = createMuscheStore();
       const { itemPool, scheduledTasks, ... } = store;
       ...
   }
   ```
3. **不要** 改任何业务逻辑或函数体；纯搬运。
4. 已有的 `features/*.js` 仍通过 `context.refs.xxx` 访问，因此 setup 内部还要继续把 ref 装进 `refs` 对象传给 feature——这一步只是把"声明"挪走。

**Verify:**
- `npm run dev` 应用行为与上一步完全一致。
- `wc -l app/scripts/app.js` 至少减少 100 行。
- `npm test` 通过。

---

### Task 3.2：把搜索 / 高亮逻辑拆到 `features/search.js`

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/features/search.js`
- Edit: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/app.js`

**Steps:**
1. 把 `handleTrackListSearchAction`、`globalSearchQuery`、`currentSearchIndex`、`searchHighlightTimer`、`lastHighlightedTrackId`、`lastTrackSearchQuery`、`trackSearchIndex`、`handleSearchEnter`、`filteredSidebarList`、`handleSearchBlur`、`onSearchFocus` 等搬到 `features/search.js`，按现有 `registerXxxFeature(context)` 模式。
2. 顺手做一个**小**清理：`handleTrackListSearchAction` 里的 DOM 直操作（`document.getElementById('track-item-' + id)`）保留，但加 TODO 注释指向 Task 5.1。

**Verify:**
- `npm run dev` 中："轨道列表" 搜索框输入文字 + 回车循环高亮，与之前一致；2 秒后高亮消失。
- `npm test` 通过。

---

### Task 3.3：拆 MIDI 导入弹窗逻辑到 `features/midi-import-ui.js`

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/features/midi-import-ui.js`
- Edit: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/app.js`

**Steps:**
1. 搬移：`midiImportData`、`midiBpm`、`midiTempoMap`、`midiTimeSigs`、`midiTimeSig`、`midiViewMode`、`activeMidiGroupRow`、`midiGroupPos`、`activeImportMenu`、`importMenuPos`、`importSearchQuery`、`midiGroupSearchQuery`，以及 `openImportMenu`、`closeImportMenu`、`selectImportInst`、`selectImportNewInst`、`selectImportGroup`、`filteredImportOptions`、`openMidiGroupDropdown`、`filteredMidiGroups`、`selectMidiGroup`、`findGroupSmart`、`findGroupFromLibrary`、`instrumentLibrary`、`sortedLibrary`。
2. `findGroupSmart` 中的正则编译挪到 `sortedLibrary` 构建时缓存（每条记录预存 `regex`），避免每次调用重编。
3. 通过 context 暴露给 setup。

**Verify:**
- MIDI 导入弹窗：上传 .mid，能正确分组、能切 Tracks/Groups 视图、能改乐器和分组、确认导入。
- `npm test` 通过。

---

### Task 3.4：拆项目信息 / Credit / 录制信息弹窗到独立 feature

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/features/project-info.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/features/credit.js`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/features/rec-info.js`
- Edit: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/app.js`

**Steps:**
1. `project-info.js`：`projectInfoForm`、`showProjectInfoModal`、`openProjectInfoModal`、`saveProjectInfo`。
2. `credit.js`：`showCreditModal`、`generatedCreditText`、`openCreditModal`、`copyCreditText`。
3. `rec-info.js`：`showRecInfoModal`、`recInfoForm`、`openRecInfoModal`、`saveRecInfo`、`activeRecDropdown`、`recDropdownSearch`、`filteredRecOptions`、`selectRecOption`、`createRecOption`、`newRecInputs`、`addRecItem`、`removeRecItem`、`hasRecordingInfo`。

**Verify:**
- 三个弹窗（项目信息、Credit、录制信息）功能完整；保存/取消按钮行为不变。

---

### Task 3.5：拆 Percussion / Orchestration 逻辑到 `features/percussion.js`

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/features/percussion.js`

**Steps:**
1. 搬移：`percKeywords`、`percState`、`isPercussionMode`、`scanPercussionTags`、`addPercPlayer`、`removePercPlayer`、`togglePercTagSelect`、`assignTagsToPlayer`、`updatePercOrchestration`、`getOrchSize`、`isOrchestraGroup`、`isPercussionGroup`、`isStringGroup`、`activeOrchPresets`、`orchTemplates`、`parsedRoster`、`getRosterName`、`updateRosterName`、`syncFamilyOrchestration`、`getNameWithGroup`、`getFamilyTotalDuration`。

**Verify:**
- 打开一个打击乐项目，乐手分配、tag 扫描、自动 orchestration 正常。

---

### Task 3.6：拆拖拽（schedule drag / mobile drag）到 `features/drag-drop.js`

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/features/drag-drop.js`

**Steps:**
1. 搬移所有以 `dragElClone` / `dragSourceTask` / `dragStartDate` / `longPressTimeout` 等为代表的拖拽 state，以及 `handleTouchStart`、`handleTouchMove`、`handleTouchEnd`、`handlePoolTouchStart`、`startMobileDrag`、`startAutoScroll`、`stopAutoScroll`、`updateAutoScrollDirection`、`handleMobileResizeMove`、`handleMobileResizeEnd`、`startTrackDrag`、`trackDragTimer`、`trackDragState`。
2. 此 feature 在 `onUnmounted` 时**必须** 集中清理 `window.addEventListener('touchmove' / 'touchend' / 'touchcancel')` 与所有 timer。

**Verify:**
- 桌面端：池 → 日历拖拽、resize、跨周拖拽全部正常。
- 移动端：长按拾起、自动滚动、resize 一致。
- 多次进出页面后没有事件监听泄漏（Chrome DevTools Performance → Memory）。

---

### Task 3.7：拆月视图 / 周视图渲染到 `features/calendar-view.js`

**Files:**
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/features/calendar-view.js`

**Steps:**
1. 搬移：`currentView`、`monthViewMode`、`viewDate`、`visibleTopDate`、`monthObserver`、`monthRefs`、`flatScrolledDays`、`generateMonthGrid`、`setMonthRef`、`scrollToMonthDate`、`handleInfiniteScroll`、`handleHeaderDoubleTap`、`handleMonthCellDoubleTap`、`dateTransitionName`、`weekContainer`、`onScroll`、`onMainMouseDown`、`onMainMouseUp`、`onMainWheel`、`isMouseViewDrag`。

**Verify:**
- 月视图（grid + scrolled）、周视图、双击切换、无限滚动一致。

---

### Task 3.8：最终回看，setup 收敛

**Steps:**
1. `wc -l app/scripts/app.js`：目标 ≤ 2000 行。
2. 把仍留在 `app.js` 内的"协调器"函数（`pushHistory`、`openAlertModal`、`openInputModal`、`checkOverlap`、`autoResizeSchedules`、`autoUpdateEfficiency` 等）整理到一个新的 `core/coordinator.js` 或保留在 `app.js`——视依赖图决定，不强行拆。
3. 删除所有 `// 🟢 新增`、`// 🔴 修复`、`// V10.2 ...`、`// 必须加回这个` 这类历史注释（**仅删纯历史注释**，保留解释 "为什么" 的注释）。

**Verify:**
- `grep -nE "🟢|🔴|V[0-9]+\." app/scripts/app.js` 返回空。
- `npm run dev` 全功能回归。

---

## Phase 4 — index.html 模板拆分

### Task 4.1：把模板按视图域切成 Vue SFC

**前置**：Phase 2 已经引入 Vite，可以直接用 `.vue` SFC。

**Files (示例)：**
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/components/MonthView.vue`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/components/WeekView.vue`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/components/Sidebar.vue`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/components/modals/CsvImportModal.vue`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/components/modals/MidiImportModal.vue`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/components/modals/ProjectInfoModal.vue`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/components/modals/CreditModal.vue`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/components/modals/RecInfoModal.vue`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/components/modals/SettingsModal.vue`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/components/modals/EditorModal.vue`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/components/modals/TrackListModal.vue`
- Create: `/Users/jaychan/Documents/GitHub/Musche/app/App.vue`
- Edit: `/Users/jaychan/Documents/GitHub/Musche/app/index.html`（精简至几十行）
- Edit: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/app.js`（改为 mount `App.vue`）

**Steps:**
1. 安装 `@vitejs/plugin-vue`，在 `vite.config.mjs` 中启用。
2. **逐个**视图迁移：每次只搬一个组件，搬完跑 `npm run dev` 对照像素。
3. 组件之间通过 props/emit 或 `inject/provide` 共享 store，不再依赖单 setup 暴露 600+ 个属性。
4. 推荐顺序：先搬最独立的 Modal（CreditModal、ProjectInfoModal），最后搬主视图（MonthView、WeekView）。

**Verify:**
- `wc -l app/index.html` ≤ 200 行。
- `npm run dev` 完整功能回归。
- `npm run build` 产物正常。

---

## Phase 5 — 收尾：消除 DOM 直操作 & 清理 CSS

### Task 5.1：用响应式状态替代 `document.getElementById` + classList

**Files:**
- Edit: `/Users/jaychan/Documents/GitHub/Musche/app/scripts/features/search.js`
- Edit: 任何还在用 `document.getElementById` / `classList.add` 来切样式的组件

**Steps:**
1. 把 `searchHighlightTimer` 改为只存 ID + `setTimeout` 清空 ID；在组件模板里用 `:class="{ 'search-highlight': item.id === highlightedId }"`。
2. 把 `.search-highlight` 的具体样式（`ring-2 ring-[#007aff] bg-blue-50 dark:bg-white/20 z-50`）定义在 CSS 里。
3. `el.scrollIntoView` 保留——这是合法的命令式 API。
4. 全仓 `grep -nE "document\.(getElementById|querySelector)" app/scripts app/components` 应只剩极少几处（focus/scroll 等命令式 API）。

**Verify:**
- 搜索高亮视觉一致；多次搜索切换不会出现样式错乱或残留。

---

### Task 5.2：清理 `!important` 和 force-reflow hack

**Files:**
- Edit: `/Users/jaychan/Documents/GitHub/Musche/app/styles/*.css`
- Edit: 任何包含 `document.body.style.display = 'none'; document.body.offsetHeight; document.body.style.display = ''` 的位置

**Steps:**
1. 把 4 个 css 文件里能去掉的 `!important` 全部去掉（Tailwind 构建化之后特异性问题应缓解）。目标：`grep -c "!important" app/styles/*.css` ≤ 50。
2. 在 `features/drag-drop.js`（原 `app.js` 第 5068-5070 行附近）定位 force-reflow hack，先加 `console.log` 复现问题（什么场景下 transition 没收尾），再用 `nextTick` + 重置具体属性的方式替代。如果暂时复现不出，至少包一层 `if (window.__FORCE_REFLOW_HACK__)` 加 TODO，便于后续删除。

**Verify:**
- 移动端 resize task 后没有视觉残留（之前 hack 想解决的问题）。
- 视觉对比无明显回退。

---

## 收尾 checklist（人类操作）

> 这些动作 Codex **不要**自动做，必须由人类完成：

- [ ] Supabase 控制台 rotate anon key，更新本地 `config.local.js`。
- [ ] 启用 Supabase RLS，给每张表写 policy。
- [ ] 全量手测一次 iOS Capacitor 打包（`npm run build && npx cap sync ios && open ios/App/App.xcworkspace`），验证构建产物在原生 webview 里行为一致。
- [ ] 考虑接入 ESLint + Prettier，统一代码风格（可作为下一个 plan）。
- [ ] 把 `console.log` 收敛到一个简单 logger（当前 12 处 `console.*`），方便生产环境关闭。
