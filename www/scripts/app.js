import { parseTime, timeToMinutes, addMinutesToTime as addMinutesToTimeValue, addDaysToDate } from './utils/time.js';
import { formatDate, formatSecs } from './utils/format.js';
import { generateUniqueId } from './utils/id.js';
import {
    calculateBarQuantizedDuration,
    buildTempoMap,
    buildTimeSigMap,
    extractNotesFromJZZTrack,
    cleanMidiTrackName,
    normalizeForMatch
} from './utils/midi.js';
import { extractTime, normalizeDate, getOrchString } from './utils/csv.js';
import { createStorageService } from './services/storage-service.js';
import { createSupabaseService } from './services/supabase-service.js';
import { createDeviceService } from './services/device-service.js';

if (typeof window !== 'undefined') {
  window.__MUSCHE_LEGACY_INLINE_BOOTSTRAP__ = false;
  window.__MUSCHE_MODULARIZATION__ = {
    phase: 'task-2-helper-extraction',
    appEntrypoint: 'www/scripts/app.js',
    helpers: {
      parseTime,
      timeToMinutes,
      addMinutesToTime: addMinutesToTimeValue,
      addDaysToDate,
      formatDate,
      formatSecs,
      generateUniqueId,
    },
  };
}

    const {createApp, ref, computed, onMounted, onUnmounted, watch, reactive, nextTick} = Vue;
    const SUPABASE_URL = 'https://qsbuegmcnivwkklxsyqj.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzYnVlZ21jbml2d2trbHhzeXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTMzMDksImV4cCI6MjA4NzY4OTMwOX0.TRmEAgLBzexlh4Ii1JD-lDpYi5kp_i3P8oG4sDXoHjk';
    const storageService = createStorageService();
    const supabaseService = createSupabaseService({url: SUPABASE_URL, key: SUPABASE_KEY});
    const deviceService = createDeviceService();
    const hexToRgb = hex => {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
    };
    const flashingTaskId = ref(null); // 控制哪个任务正在闪烁
    const statClickIndexMap = reactive({}); // 记录每个演奏员点击循环到了第几个任务
    const getTextColor = hex => {
        if (!hex) return '#1f2937';
        const [r, g, b] = hexToRgb(hex);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? '#1f2937' : '#f9fafb';
    };
    const generateRandomHexColor = () => {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    };
    const adjustColor = (hex, percent) => { // percent: 0.1 for 10% brighter, -0.1 for 10% darker
        if (!hex) return '#f3f4f6';
        const [r, g, b] = hexToRgb(hex);
        const factor = 1 + percent;
        const newR = Math.min(255, Math.max(0, Math.floor(r * factor)));
        const newG = Math.min(255, Math.max(0, Math.floor(g * factor)));
        const newB = Math.min(255, Math.max(0, Math.floor(b * factor)));
        return '#' + [newR, newG, newB].map(x => x.toString(16).padStart(2, '0')).join('');
    };
    window.triggerTouchHaptic = (style = 'Light') => deviceService.triggerTouchHaptic(style);


    createApp({
        setup() {
            const itemPool = ref([]);
            const scheduledTasks = ref([]);
            const slotHeight = ref(window.innerWidth < 800 ? 30 : 40);
            const pxPerMin = computed(() => slotHeight.value / 30);
            const currentView = ref('month');      // 默认直接进入月视图
            const monthViewMode = ref('scrolled'); // 默认直接使用滚动模式
            const viewDate = ref(new Date());
            const selectedTaskId = ref(null);
            const selectedSource = ref(null);
            const selectedPoolIds = ref(new Set()); // 存储任务池多选的 ID
            // V10.2 新增：左侧栏宽度调节状态 (请添加到其他 ref 变量附近)
            const savedSidebarWidth = storageService.getItem('musche_sidebar_width');
            const sidebarWidth = ref(savedSidebarWidth ? Number(savedSidebarWidth) : 350);
            const lastPoolClickId = ref(null);      // 记录上一次点击的 ID (用于 Shift 范围选择)
            const lastPoolFocusId = ref(null);      // 新增：记录键盘/鼠标最后交互的 ID (作为键盘导航的起点)
            const showSettings = ref(false);
            const showProjectInfoModal = ref(false);
            const showMetadataManager = ref(false);
            const showEditor = ref(false);
            const showTrackList = ref(false);
            const trackListData = ref({name: '', items: []});
            const editingItem = ref({});
            const editingSource = ref('');
            const weekContainer = ref(null);
            const flashingTaskId = ref(null); // 控制哪个任务正在闪烁
            const statClickIndexMap = reactive({}); // 记录每个演奏员点击循环到了第几个任务
            const showProfileMenu = ref(false);
            const tempAvatarUrl = ref(''); // 用于输入框临时存储
            const initialTouchY = ref(0);         // 记录起始 Y 坐标，用于判断长按后是否移动
            // --- 🟢 新增: 气泡选择器逻辑 ---
            const showDurationPicker = ref(false);
            const tempDuration = reactive({m: 0, s: 0});
            const pickerMinRef = ref(null);
            const pickerSecRef = ref(null);
            const pickerPos = reactive({top: 0, left: 0}); // 🟢 新增：存储弹窗坐标
            const showMobileTaskInput = ref(false);
            const trackListContainerRef = ref(null);
            const draggingSectionIndex = ref(null);
            const savedWidth = storageService.getItem('musche_day_width');
            const dayColWidth = ref(savedWidth ? Number(savedWidth) : 52);
            const isResizingMobile = ref(false);
            const mobileResizeState = reactive({task: null, startY: 0, startHeight: 0});
            const saveStatus = ref('saved'); // 'saved', 'saving', 'unsaved'
            // --- 🟢 新增: 全局搜索状态 ---
            const globalSearchQuery = ref('');
            const lastTapState = reactive({ id: null, time: 0 });
            const currentSearchIndex = ref(0);
            const resizing = ref(null);
            const isSearchFocused = ref(false);
            const localDataVersion = ref(0);
            const showSplitModal = ref(false);
            // --- 🟢 新增：CSV 导入模式控制 ---
            const csvImportMode = ref('tasks'); // 'tasks', 'time', 'orch'
            // --- 🟢 Credit 导出逻辑 ---
            const showCreditModal = ref(false);
            const generatedCreditText = ref('');
            const visibleTopDate = ref(new Date()); // 用于存储滚动模式下当前视口顶部的日期
            const monthObserver = ref(null); // 观察器实例
            const monthRefs = ref([]);
            const showMidiManager = ref(false);
            const managingProject = ref(null);
            // --- 🎹 MIDI 高级导入逻辑 ---
            const showMidiImportModal = ref(false);
            // --- 🟢 [新增] CSV 导入弹窗状态与配置 ---
            // 1. 定义状态变量 (已适配你文件的变量命名习惯)
            const showCsvImportModal = ref(false);
            const csvImportData = ref([]);
            const csvColumnMap = reactive({}); // 🟢 新增：用于存储 CSV 列索引映射
            // 🟢 修改后的配置对象
            const csvImportConfig = reactive({
                importTypes: {
                    tasks: true,
                    time: true,
                    orch: true
                },
                nameStrategy: 'merge', // 🟢 必须加回这个，默认 'merge' (合并) 或 'csv' (原名)
                showSkipRows: true // 🟢 新增：控制是否显示状态为 SKIP 的行
            });

            const midiImportData = ref([]); // 暂存解析后的轨道数据
            const midiBpm = ref(120); // 暂存 MIDI 的基础速度
            const midiTempoMap = ref(null);
            const midiTimeSigs = ref(null);
            // 🟢 [新增] 存储分组后的聚合数据
            // 🟢 [新增] MIDI 弹窗的显示模式: 'tracks' (默认) 或 'groups'
            const midiViewMode = ref('tracks');
            const midiTimeSig = ref([4, 4]); // 拍号
            const activeMidiGroupRow = ref(null);
            // [新增] 存储 MIDI 分组下拉菜单的坐标位置
            const midiGroupPos = reactive({ top: 0, left: 0, width: 0 });
            // 🟢 [新增] MIDI 导入界面的下拉菜单状态
            const activeImportMenu = reactive({ rowId: null, type: null }); // type: 'inst' | 'group'
            const importMenuPos = reactive({ top: 0, left: 0, width: 0 });
            const importSearchQuery = ref('');
            // 🟢 [新增] MIDI Manager 分组下拉菜单的搜索状态
            const midiGroupSearchQuery = ref('');
            const trackListSearchQuery = ref('');
            // 🟢 [新增] 记录搜索状态，用于回车循环跳转
            const trackSearchIndex = ref(-1);
            const lastTrackSearchQuery = ref('');
            const lastHighlightedTrackId = ref(null); // 🟢 记录上一个高光的元素 ID
            const searchHighlightTimer = ref(null); // 🟢 [新增] 用于存储定时器ID
            // 在 setup() 内部
            const rawCsvRows = ref([]);      // 存储 CSV 除去表头后的所有原始行
            const csvHeadersMap = ref({});   // 存储表头列的索引 (例如 {project: 0, instName: 2, ...})
            const collapsedProjects = reactive(new Set());
            const activeImportTab = ref('rec');
            const csvSearchQuery = ref('')


            let dividerDragState = null;
            let trackListScrollTimer = null;
            let pickerCallback = null;
            let dragElClone = null;       // 拖拽时的克隆体
            let dragSourceTask = null;    // 源任务数据
            let dragStartDate = null;     // 源日期
            let longPressTimeout = null;  // 长按定时器
            let isDraggingMouse = false;
            let startMouseY = 0;
            let startScrollTop = 0;
            let activeColRef = null; // 当前拖动的滚轮 DOM 引用
            let startX = 0, startY = 0;   // 触摸起始位置
            let cloneOffsetX = 0, cloneOffsetY = 0; // 手指在元素内的偏移
            let activeDropSlot = null;    // 当前手指下的放置目标
            let dragSourceEl = null; // 用于记录被拖拽的原始 DOM 元素
            let touchOffsetMinutes = 0;
            let dragClickOffsetY = 0;
            let dragSourceType = 'schedule';
            let autoScrollInterval = null;
            let monthSwitchTimer = null;
            let trackSaveTimer = null; // 用于录音时间保存的防抖计时器
            let isScrollingProgrammatically = false;
            let resizeRaf = null; // 用于 requestAnimationFrame 防抖
            // --- 🟢 新增变量: 拖拽定时器 (用于手机长按) ---
            // --- 🟢 新增变量: 拖拽定时器 (用于手机长按) ---
            let trackDragTimer = null;
            let trackDragState = null;
            // --- 🟢 新增：iOS 视图切换双击检测辅助变量 ---
            let lastHeaderTap = 0; // 记录周视图表头上次点击时间
            let lastMonthTap = { time: 0, date: null };




            const toggleProjectCollapse = (pName) => {
                if (collapsedProjects.has(pName)) {
                    collapsedProjects.delete(pName);
                } else {
                    collapsedProjects.add(pName);
                }
            };

            // 修改 groupedCsvData
            const groupedCsvData = computed(() => {
                // 🟢 1. 获取当前搜索词
                const query = csvSearchQuery.value.toLowerCase().trim();
                const showSkip = csvImportConfig.showSkipRows; // 🟢 获取当前开关状态
                const mode = activeImportTab.value;

                // 🟢 2. 预处理数据：如果正在搜索，先过滤 flat list
                let sourceData = csvImportData.value;

                if (query) {
                    sourceData = sourceData.filter(item => {
                        // 定义搜索范围：项目名、演奏员、乐器、文件名
                        const searchTargets = [
                            item.projectName,
                            item.playerName,
                            item.name_real, // 乐器名
                            item.name_merge // 合并后的文件名
                        ];
                        // 只要有一个字段包含搜索词即可
                        return searchTargets.some(val => val && String(val).toLowerCase().includes(query));
                    });
                }

                // === 以下是原有的分组逻辑 (使用 sourceData 而不是 csvImportData.value) ===

                const groups = {};
                const projectOrder = [];

                sourceData.forEach(row => { // ⚠️ 注意这里改成遍历 sourceData
                    // 确保只显示当前 Tab 对应的数据 (Rec 或 Edit)
                    const isValid = activeImportTab.value === 'rec' ? row.hasRecData : row.hasEditData;
                    if (!isValid) return;

                    // 🟢 核心过滤逻辑：如果关闭了“显示 SKIP”，且当前行状态为 SKIP，则跳过
                    const status = (mode === 'rec' ? row.recStatusText : row.editStatusText);
                    if (!showSkip && status === 'SKIP') return;

                    const pName = row.projectName || 'Unknown Project';
                    if (!groups[pName]) {
                        groups[pName] = {
                            projectName: pName,
                            rows: [],
                            expanded: !collapsedProjects.has(pName)
                        };
                        projectOrder.push(pName);
                    }
                    groups[pName].rows.push(row);
                });

                return projectOrder
                    .map(pName => groups[pName])
                    .filter(group => group.rows.length > 0);
            });

            // 🟢 新增侦听器：搜索词变化时，自动同步选择状态
            watch(() => [csvSearchQuery.value, activeImportTab.value], ([newQuery, newTab]) => {
                // 1. 如果搜索框被清空，我们不做任何操作，保留最后一次的选择状态
                // (这样你可以先搜A，清空，再手动微调)
                if (!newQuery || !newQuery.trim()) return;

                const query = newQuery.toLowerCase().trim();

                // 2. 遍历所有数据，更新选择状态
                csvImportData.value.forEach(row => {
                    // 步骤A: 判断该行是否属于当前标签页 (Rec 或 Edit)
                    // 我们只修改当前能看到的任务，不要误伤另一个标签页里已选的任务
                    const isVisibleInTab = newTab === 'rec' ? row.hasRecData : row.hasEditData;

                    if (isVisibleInTab) {
                        // 步骤B: 判断是否匹配搜索词
                        const searchTargets = [
                            row.projectName,
                            row.playerName,
                            row.name_real, // 乐器
                            row.name_merge // 文件名
                        ];
                        const isMatch = searchTargets.some(val => val && String(val).toLowerCase().includes(query));

                        // 步骤C: 强制同步状态
                        // 匹配 = 选中 (true)
                        // 不匹配 = 取消选中 (false) -> 这就实现了“只剩下过滤出来的任务”
                        row.selected = isMatch;
                    }
                });
            });


            // 初始化表单数据
            const projectInfoForm = reactive({
                id: null, // 用于定位当前编辑的项目
                title: '',
                composer: '',
                arranger: '',
                producer: '',
                mixingEngineer: '',
                mixingStudio: '',
                masteringEngineer: '',
                masteringStudio: '',
                dolbyStudio: '',
                publishedBy: '',
                producedBy: ''
            });

            // 打开项目信息弹窗
            const openProjectInfoModal = (project) => {
                projectInfoForm.id = project.id;
                // 如果已有数据则回填，否则为空；Title默认回填项目名称
                projectInfoForm.title = project.title || project.name || '';
                projectInfoForm.composer = project.composer || '';
                projectInfoForm.arranger = project.arranger || '';
                projectInfoForm.producer = project.producer || '';
                projectInfoForm.mixingEngineer = project.mixingEngineer || '';
                projectInfoForm.mixingStudio = project.mixingStudio || '';
                projectInfoForm.masteringEngineer = project.masteringEngineer || '';
                projectInfoForm.masteringStudio = project.masteringStudio || '';
                projectInfoForm.dolbyStudio = project.dolbyStudio || '';
                projectInfoForm.publishedBy = project.publishedBy || '';
                projectInfoForm.producedBy = project.producedBy || '';

                showProjectInfoModal.value = true;
            };

// 保存项目信息
            const saveProjectInfo = () => {
                const target = settings.projects.find(p => p.id === projectInfoForm.id);
                if (target) {
                    // 将表单数据合并回项目对象
                    Object.assign(target, { ...projectInfoForm });
                    // 如果想让项目列表显示的名称也同步更新，可以解开下面这行：
                    // target.name = projectInfoForm.title;

                    window.triggerTouchHaptic('Success');
                    showProjectInfoModal.value = false;
                }
            };

            // 1. [新增] 提取通用的状态计算逻辑
            const calculateRowStatusText = (row) => {
                const config = csvImportConfig.importTypes;

                // 情况 A: 该行未勾选，或者全局导入开关全关 -> SKIP
                if (!row.selected || (!config.tasks && !config.time && !config.orch)) {
                    return 'SKIP';
                }

                // 情况 B: 任务已存在 (重复)
                if (row.isDuplicate) {
                    // 只有开启了时间或编制更新，才显示 UPDATE
                    if (config.time || config.orch) {
                        return 'UPDATE';
                    } else {
                        // 如果只选了任务导入但任务已存在，实际上没啥可干的，显示 SKIP
                        return 'SKIP';
                    }
                }

                // 情况 C: 新任务
                return 'NEW';
            };

            const refreshCsvStatus = () => {
                const { tasks: isTaskMode, time: isTimeMode, orch: isOrchMode } = csvImportConfig.importTypes;

                csvImportData.value = csvImportData.value.map(row => {
                    // 修改 refreshCsvStatus 中的 getStatus 逻辑
                    const getStatus = () => {
                        const isRecTab = activeImportTab.value === 'rec';
                        // 1. 数据存在性检查：如果该行在当前模式下根本没有数据，直接跳过
                        const hasCurrentModeData = isRecTab ? row.hasRecData : row.hasEditData;
                        if (!hasCurrentModeData) return 'SKIP';

                        if (row.isDuplicate) {
                            let shouldUpdate = false;
                            if (isTimeMode) {
                                // 2. 差异判断：仅对比当前模式相关的差异
                                // 如果是录音模式，只看录音时间的差异；如果是编辑模式，只看编辑时间
                                const timeDiff = isRecTab ? row.hasRecTimeDiff : row.hasEdtTimeDiff;
                                if (timeDiff) shouldUpdate = true;
                            }
                            if (isOrchMode && row.hasOrchDiff) {
                                shouldUpdate = true;
                            }
                            return shouldUpdate ? 'UPDATE' : 'SKIP';
                        } else {
                            // 新任务逻辑：仅在开启“导入新任务”且当前行有对应数据时标记为 NEW
                            return isTaskMode ? 'NEW' : 'SKIP';
                        }
                    };

                    const finalStatus = getStatus();

                    // 根据状态设置显示文字
                    if (activeImportTab.value === 'rec') row.recStatusText = finalStatus;
                    else row.editStatusText = finalStatus;

                    // 🟢 自动勾选逻辑：如果是 SKIP 状态，取消勾选任务
                    row.selected = (finalStatus !== 'SKIP');

                    return row;
                });

                refreshCsvPreview();
            };

            watch(activeImportTab, () => {
                refreshCsvStatus();
            });

            const toggleCsvSelection = (index, field) => {
                const row = csvImportData.value[index];
                if (!row) return;

                if (field) row.selection[field] = !row.selection[field];

                const config = csvImportConfig.importTypes;

                // 🟢 修复核心逻辑：不再一刀切
                const updateStatusByTab = (isRec) => {
                    if (!row.selected || (!config.tasks && !config.time && !config.orch)) return 'SKIP';
                    if (!row.isDuplicate) return config.tasks ? 'NEW' : 'SKIP';

                    // 检查是否有实际差异
                    const hasTimeDiff = isRec ? row.hasRecTimeDiff : row.hasEdtTimeDiff;
                    const shouldUpdate = (config.time && hasTimeDiff) || (config.orch && row.hasOrchDiff);
                    return shouldUpdate ? 'UPDATE' : 'SKIP';
                };

                // 分别更新两个标签的状态，互不干扰
                row.recStatusText = updateStatusByTab(true);
                row.editStatusText = updateStatusByTab(false);

                csvImportData.value[index] = { ...row };
            };

            const confirmCsvImport = () => {
                if (typeof pushHistory === 'function') pushHistory('Import CSV Data');
                const isRecTab = activeImportTab.value === 'rec';

                // 1. 过滤出当前标签页下的有效勾选行
                const selectedRows = csvImportData.value.filter(r =>
                    r.selected && (isRecTab ? r.hasRecData : r.hasEditData)
                );

                if (selectedRows.length === 0) {
                    if (csvImportData.value.some(r => r.selected)) {
                        openAlertModal("提示", `当前视图 (${activeImportTab.value === 'rec' ? 'Recording' : 'Editing'}) 没有选中的有效任务。`);
                    } else {
                        showCsvImportModal.value = false;
                    }
                    return;
                }

                pushHistory();

                const affectedTaskIds = new Set();
                const { tasks: isTaskMode, time: isTimeMode, orch: isOrchMode } = csvImportConfig.importTypes;

                const validRecordings = [];
                const validEditings = [];

                // 🟢 修复: 追踪所有受影响的维度，不仅仅是 Musician
                const affectedMusicianIds = new Set();
                const affectedProjectIds = new Set();
                const affectedInstrumentIds = new Set();

                const col = csvHeadersMap.value;

                // 🟢 1. 快照系统：用于导入后重新对齐任务 (Task -> Schedule)
                const taskToScheduleMap = new Map();
                const snapshotLoaded = new Set(); // 防止重复加载

                // 🟢 通用快照函数
                const ensureSnapshot = (id, type) => {
                    const key = `${type}_${id}`;
                    if (!id || snapshotLoaded.has(key)) return;

                    // 找到该维度下现有的日程
                    const sList = scheduledTasks.value.filter(t => {
                        if ((t.sessionId || 'S_DEFAULT') !== currentSessionId.value) return false;
                        if (type === 'musician') return t.musicianId === id;
                        if (type === 'project') return t.projectId === id && !t.musicianId; // 编辑日程通常没有演奏员
                        if (type === 'instrument') return t.instrumentId === id;
                        return false;
                    }).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

                    // 找到该维度下现有的任务
                    const iList = itemPool.value.filter(i => {
                        if ((i.sessionId || 'S_DEFAULT') !== currentSessionId.value) return false;
                        if (type === 'musician') return i.musicianId === id;
                        if (type === 'project') return i.projectId === id;
                        if (type === 'instrument') return i.instrumentId === id;
                        return false;
                    });

                    // 建立映射
                    iList.forEach(item => {
                        const idx = item.sectionIndex || 0;
                        if (sList[idx]) taskToScheduleMap.set(item.id, sList[idx].scheduleId);
                    });
                    snapshotLoaded.add(key);
                };

                const formatCell = (val) => val ? val.replace(/[\r\n]+/g, ' / ').trim() : '';
                const getMins = (t) => {
                    if (!t) return 0;
                    const [h, m] = t.split(':').map(Number);
                    return (h || 0) * 60 + (m || 0);
                };
                const formatSecsLocal = (seconds) => {
                    if (seconds <= 0) return "01:00:00";
                    const h = Math.floor(seconds / 3600);
                    const m = Math.floor((seconds % 3600) / 60);
                    const s = Math.floor(seconds % 60);
                    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                };

                // 🟢 2. 遍历处理每一行数据
                selectedRows.forEach(data => {
                    const pId = getOrCreateSettingItem('project', data.projectName);
                    const iId = getOrCreateSettingItem('instrument', data.name_real, data.group);
                    const mId = getOrCreateSettingItem('musician', data.playerName, data.group);

                    // 注册受影响的 ID 并建立快照
                    if (mId) { affectedMusicianIds.add(mId); ensureSnapshot(mId, 'musician'); }
                    if (pId) { affectedProjectIds.add(pId); ensureSnapshot(pId, 'project'); }
                    if (iId) { affectedInstrumentIds.add(iId); ensureSnapshot(iId, 'instrument'); }

                    // // Project Info (混音师等) 更新
                    // if (pId && data._raw) {
                    //     const row = data._raw;
                    //     const proj = settings.projects.find(p => p.id === pId);
                    //     if (proj) {
                    //         if (col.mixEngineer > -1 && row[col.mixEngineer]) proj.mixingEngineer = formatCell(row[col.mixEngineer]);
                    //         if (col.mixStudio > -1 && row[col.mixStudio]) proj.mixingStudio = formatCell(row[col.mixStudio]);
                    //         if (col.masEngineer > -1 && row[col.masEngineer]) proj.masteringEngineer = formatCell(row[col.masEngineer]);
                    //         if (col.masStudio > -1 && row[col.masStudio]) proj.masteringStudio = formatCell(row[col.masStudio]);
                    //     }
                    // }

                    // === Recording Import (录音导入) ===
                    if (activeImportTab.value === 'rec') {
                        if (!data.hasRecData) return;

                        // 🟢【新增】将 Project Info 更新移到这里
                        // 只有在 Editing 模式下，才更新混音/母带等项目层级信息
                        if (pId && data._raw) {
                            const row = data._raw;
                            const proj = settings.projects.find(p => p.id === pId);
                            if (proj) {
                                if (col.mixEngineer > -1 && row[col.mixEngineer]) proj.mixingEngineer = formatCell(row[col.mixEngineer]);
                                if (col.mixStudio > -1 && row[col.mixStudio]) proj.mixingStudio = formatCell(row[col.mixStudio]);
                                if (col.masEngineer > -1 && row[col.masEngineer]) proj.masteringEngineer = formatCell(row[col.masEngineer]);
                                if (col.masStudio > -1 && row[col.masStudio]) proj.masteringStudio = formatCell(row[col.masStudio]);
                            }
                        }

                        let taskItem = itemPool.value.find(item => item.projectId === pId && item.name === data.name_merge && item.musicianId === mId && (item.splitTag === (data.isSplit ? `Part ${data.partIndex + 1}` : null)));

                        if (isTaskMode && !taskItem) {
                            // 🟢 修复: 如果合并名与乐器名一致 (忽略大小写)，则不硬编码任务名
                            const _inst = settings.instruments.find(i => i.id === iId);
                            const _isSameName = _inst && _inst.name.toLowerCase() === data.name_merge.toLowerCase();
                            taskItem = {
                                id: generateUniqueId('T'),
                                sessionId: currentSessionId.value,
                                projectId: pId, instrumentId: iId, musicianId: mId,
                                name: _isSameName ? '' : data.name_merge, // 🟢 动态名称逻辑
                                musicDuration: data.duration,
                                orchestration: '',
                                records: { musician: {}, project: {}, instrument: {} },
                                splitTag: data.isSplit ? `Part ${data.partIndex + 1}` : null,
                                ratio: 20,
                                estDuration: calculateEstTime(data.duration, 20),
                                _isNewImport: true
                            };
                            itemPool.value.push(taskItem);
                        }

                        if (!taskItem) return;

                        // 更新任务属性
                        if (isOrchMode && data.orchestration) taskItem.orchestration = data.orchestration;
                        if (isTimeMode && data.duration && data.duration !== '00:00') {
                            if (taskItem.musicDuration !== data.duration) {
                                taskItem.musicDuration = data.duration;
                                taskItem.estDuration = calculateEstTime(data.duration, taskItem.ratio || 20);
                                affectedTaskIds.add(taskItem.id);
                            }
                        }

                        // 准备录音时间数据
                        const rDate = data.recDate;
                        const rStart = data.recStart;
                        const rEnd = data.recEnd;

                        if (rDate && rStart) {
                            // 🟢 写入任务记录
                            if (taskItem.records) {
                                if(!taskItem.records.musician) taskItem.records.musician = {};
                                taskItem.records.musician.recStart = rStart;
                                if (rEnd) {
                                    taskItem.records.musician.recEnd = rEnd;
                                    const [h1, m1] = rStart.split(':').map(Number);
                                    const [h2, m2] = rEnd.split(':').map(Number);
                                    let startMins = h1 * 60 + m1;
                                    let endMins = h2 * 60 + m2;
                                    if (endMins < startMins) endMins += 24 * 60;
                                    taskItem.records.musician.actualDuration = formatSecs((endMins - startMins) * 60);
                                }
                            }

                            let sMins = getMins(rStart);
                            let eMins = rEnd ? getMins(rEnd) : sMins + 60;
                            if (eMins <= sMins) eMins += 1440;

                            const row = data._raw;
                            validRecordings.push({
                                task: taskItem,
                                pId, iId, mId,
                                date: typeof normalizeDate === 'function' ? normalizeDate(rDate) : rDate,
                                startMins: sMins, endMins: eMins,
                                info: {
                                    studio: data.recStudio || '',
                                    engineer: data.recEngineer || '',
                                    operator: (col.recOperator > -1) ? formatCell(row[col.recOperator]) : '',
                                    assistant: (col.recAssistant > -1) ? formatCell(row[col.recAssistant]) : '',
                                    notes: (col.recComments > -1) ? formatCell(row[col.recComments]) : ''
                                }
                            });
                        }
                    }
                    // === Editing Import (编辑导入) ===
                    else if (activeImportTab.value === 'edt') {
                        if (!data.hasEditData) return;

                        // 注意：编辑任务可能没有演奏员(mId)，主要靠 Project 和 Name 匹配
                        let taskItem = itemPool.value.find(item => item.projectId === pId && item.name === data.name_merge && item.musicianId === mId && (item.splitTag === (data.isSplit ? `Part ${data.partIndex + 1}` : null)));

                        if (isTaskMode && !taskItem) {
                            const _inst = settings.instruments.find(i => i.id === iId);
                            const _isSameName = _inst && _inst.name.toLowerCase() === data.name_merge.toLowerCase();
                            taskItem = {
                                id: generateUniqueId('T'),
                                sessionId: currentSessionId.value,
                                projectId: pId, instrumentId: iId, musicianId: mId,
                                name: _isSameName ? '' : data.name_merge, // 🟢 动态名称逻辑
                                musicDuration: data.duration,
                                orchestration: '',
                                records: { musician: {}, project: {}, instrument: {} },
                                splitTag: data.isSplit ? `Part ${data.partIndex + 1}` : null,
                                ratio: 20,
                                estDuration: calculateEstTime(data.duration, 20),
                                _isNewImport: true
                            };
                            itemPool.value.push(taskItem);
                        }

                        if (!taskItem) return;

                        const eDate = data.edtDate;
                        const eStart = data.edtStart;
                        const eEnd = data.edtEnd;

                        if (eDate && eStart) {
                            // 🟢 修复：将编辑时间写入任务记录 (Project 维度)
                            // 这样任务在列表中就会显示“实际时间”
                            if (taskItem.records) {
                                if (!taskItem.records.project) taskItem.records.project = {}; // 确保对象存在

                                taskItem.records.project.recStart = eStart;
                                if (eEnd) {
                                    taskItem.records.project.recEnd = eEnd;
                                    // 计算持续时间
                                    const [h1, m1] = eStart.split(':').map(Number);
                                    const [h2, m2] = eEnd.split(':').map(Number);
                                    let startMins = h1 * 60 + m1;
                                    let endMins = h2 * 60 + m2;
                                    if (endMins < startMins) endMins += 24 * 60;
                                    taskItem.records.project.actualDuration = formatSecs((endMins - startMins) * 60);
                                }
                                // 扣除休息时间
                                if (data.edtRest) {
                                    taskItem.records.project.breakMinutes = parseInt(data.edtRest) || 0;
                                }
                            }

                            let sMins = getMins(eStart);
                            let eMins = eEnd ? getMins(eEnd) : sMins + 60;
                            if (eMins <= sMins) eMins += 1440;

                            let durMins = eMins - sMins;
                            if (data.edtRest) durMins -= parseInt(data.edtRest) || 0;

                            validEditings.push({
                                task: taskItem,
                                pId, iId, mId,
                                date: typeof normalizeDate === 'function' ? normalizeDate(eDate) : eDate,
                                startMins: sMins, endMins: eMins,
                                durationMins: durMins,
                                info: {
                                    studio: data.edtStudio || '',
                                    engineer: data.edtEngineer || ''
                                }
                            });
                        }
                    }
                });

                // 🟢 3. 生成录音日程 (Rec Schedules)
                if (validRecordings.length > 0) {
                    validRecordings.sort((a, b) => a.date.localeCompare(b.date) || a.startMins - b.startMins);

                    for (let i = 0; i < validRecordings.length; i++) {
                        const current = validRecordings[i];
                        let sStart = current.startMins, sEnd = current.endMins;
                        const items = [current.task], infos = [current.info];

                        while (i + 1 < validRecordings.length) {
                            const next = validRecordings[i + 1];
                            if (next.date !== current.date || next.mId !== current.mId) break;

                            // 允许0间隔合并
                            if (next.startMins - sEnd <= 60) {
                                sEnd = Math.max(sEnd, next.endMins);
                                items.push(next.task);
                                infos.push(next.info);
                                i++;
                            } else break;
                        }

                        const mergeF = (list, k) => [...new Set(list.map(x => x[k]).filter(v => v))].join(' / ');
                        const startStr = `${String(Math.floor(sStart / 60)).padStart(2, '0')}:${String(sStart % 60).padStart(2, '0')}`;

                        let targetScheduleId;
                        // 查找现有匹配的日程块
                        const existingTask = scheduledTasks.value.find(t => t.date === current.date && t.startTime === startStr && t.musicianId === current.mId && (t.sessionId || 'S_DEFAULT') === currentSessionId.value );

                        if (existingTask) {
                            targetScheduleId = existingTask.scheduleId;
                        } else {
                            targetScheduleId = Date.now() + Math.random();
                            scheduledTasks.value.push({
                                scheduleId: targetScheduleId,
                                sessionId: currentSessionId.value,
                                musicianId: current.mId || null,
                                projectId: (!current.mId && current.pId) ? current.pId : null,
                                instrumentId: (!current.mId && !current.pId && current.iId) ? current.iId : null,
                                date: current.date,
                                startTime: startStr,
                                estDuration: formatSecsLocal((sEnd - sStart) * 60),
                                trackCount: 0,
                                ratio: 20,
                                recordingInfo: {
                                    studio: mergeF(infos, 'studio'),
                                    engineer: mergeF(infos, 'engineer'),
                                    operator: mergeF(infos, 'operator'),
                                    assistant: mergeF(infos, 'assistant'),
                                    notes: mergeF(infos, 'notes')
                                }
                            });
                        }

                        // 记录关联
                        items.forEach(t => {
                            taskToScheduleMap.set(t.id, targetScheduleId);
                        });
                    }
                }

                // 🟢 4. 生成编辑日程 (Edit Schedules)
                if (validEditings.length > 0) {
                    validEditings.sort((a, b) => a.date.localeCompare(b.date) || a.startMins - b.startMins);

                    for (let i = 0; i < validEditings.length; i++) {
                        const current = validEditings[i];
                        let sStart = current.startMins, sEnd = current.endMins;
                        let duration = current.durationMins;
                        const items = [current.task], infos = [current.info];

                        while (i + 1 < validEditings.length) {
                            const next = validEditings[i + 1];
                            // 编辑日程按 Project 合并
                            if (next.date !== current.date || next.pId !== current.pId) break;

                            // 允许5分钟误差
                            if (Math.abs(next.startMins - sEnd) <= 60) {
                                sEnd = next.endMins;
                                duration += next.durationMins;
                                items.push(next.task);
                                infos.push(next.info);
                                i++;
                            } else break;
                        }

                        const mergeF = (list, k) => [...new Set(list.map(x => x[k]).filter(v => v))].join(' / ');
                        const startStr = `${String(Math.floor(sStart / 60)).padStart(2, '0')}:${String(sStart % 60).padStart(2, '0')}`;

                        let targetScheduleId;
                        // 编辑日程：查找 projectId 相同且无 musicianId 的块
                        const existingTask = scheduledTasks.value.find(t => t.date === current.date && t.startTime === startStr && t.projectId === current.pId && !t.musicianId && (t.sessionId || 'S_DEFAULT') === currentSessionId.value );

                        if (existingTask) {
                            targetScheduleId = existingTask.scheduleId;
                        } else {
                            targetScheduleId = Date.now() + Math.random();
                            scheduledTasks.value.push({
                                scheduleId: targetScheduleId,
                                sessionId: currentSessionId.value,
                                musicianId: null, // 编辑通常没有演奏员
                                projectId: current.pId,
                                instrumentId: null,
                                date: current.date,
                                startTime: startStr,
                                estDuration: formatSecsLocal(duration * 60),
                                trackCount: 0,
                                ratio: 1,
                                statusOverride: 'completed',
                                editInfo: {
                                    studio: mergeF(infos, 'studio'),
                                    engineer: mergeF(infos, 'engineer')
                                }
                            });
                        }

                        // 🟢 记录关联 (关键)
                        items.forEach(t => {
                            taskToScheduleMap.set(t.id, targetScheduleId);
                        });
                    }
                }

                // 🟢 5. 收尾：统一更新所有任务的 sectionIndex (Task -> Schedule)
                const updateIndexes = (id, type) => {
                    let sList = scheduledTasks.value.filter(t => (t.sessionId || 'S_DEFAULT') === currentSessionId.value);
                    let iList = itemPool.value.filter(i => (i.sessionId || 'S_DEFAULT') === currentSessionId.value);

                    if (type === 'musician') {
                        sList = sList.filter(t => t.musicianId === id);
                        iList = iList.filter(i => i.musicianId === id);
                    } else if (type === 'project') {
                        sList = sList.filter(t => t.projectId === id && !t.musicianId); // 仅处理编辑块
                        iList = iList.filter(i => i.projectId === id);
                    } else if (type === 'instrument') {
                        sList = sList.filter(t => t.instrumentId === id);
                        iList = iList.filter(i => i.instrumentId === id);
                    }

                    if (sList.length === 0) return;

                    sList.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

                    const schedIdToIndex = {};
                    sList.forEach((s, idx) => {
                        schedIdToIndex[s.scheduleId] = idx;
                    });

                    iList.forEach(item => {
                        const targetSchedId = taskToScheduleMap.get(item.id);
                        if (targetSchedId && schedIdToIndex[targetSchedId] !== undefined) {
                            item.sectionIndex = schedIdToIndex[targetSchedId];
                        }
                    });
                };

                // 🟢 对所有受影响的维度执行更新 (之前可能漏了 Project)
                affectedMusicianIds.forEach(id => updateIndexes(id, 'musician'));
                affectedProjectIds.forEach(id => updateIndexes(id, 'project')); // ✅ 必须更新项目索引
                affectedInstrumentIds.forEach(id => updateIndexes(id, 'instrument'));

                // 更新效率计算 (可选)
                if (typeof autoUpdateEfficiency === 'function') {
                    affectedMusicianIds.forEach(id => autoUpdateEfficiency(id, 'musician', false));
                }

                // 自动调整块大小 (如果有新录音)
                if (validRecordings.length > 0 && typeof autoResizeSchedules === 'function') {
                    autoResizeSchedules(Array.from(affectedTaskIds));
                }

                pushHistory();
                showCsvImportModal.value = false;
                openAlertModal("导入完成", `成功导入: 录音日程 ${validRecordings.length} 个, 编辑日程 ${validEditings.length} 个`);
            };

            // 🟢 修复后的 addDataToPrepared 函数 (加入差异对比)
            const addDataToPrepared = (targetList, rawRow, col, options = {}) => {
                // 1. 基础字段解析
                const projectName = rawRow[col.project]?.trim() || 'Unknown Project';
                const rawInstName = rawRow[col.instName]?.trim() || 'Unknown Inst';

                // 名称策略
                const instName = options.realCsvName || rawInstName;
                const displayInstName = options.displayCsvName || instName;
                const mergeName = options.forceName || displayInstName;

                // 数据清洗
                const duration = options.overrideDuration || rawRow[col.duration]?.trim() || '00:00';
                const orchestration = rawRow[col.orchestration]?.trim() || '';
                const playerName = rawRow[col.playerName]?.trim() || '';
                const groupName = rawRow[col.instFamily]?.trim() || '';

                // 2. 录音数据解析 [REC]
                const recDate = rawRow[col.recDate]?.trim();
                const recStart = rawRow[col.recStart]?.trim();
                const hasRecData = !!(recDate && recStart);

                // 3. 编辑数据解析 [EDT]
                const edtDate = rawRow[col.edtDate]?.trim();
                const edtStart = rawRow[col.edtStart]?.trim();
                const hasEditData = !!(edtDate && edtStart);

                // 4. 构建对象
                const newItem = {
                    projectName,
                    playerName,
                    group: groupName,
                    name_real: instName,
                    name_display: displayInstName,
                    name_merge: mergeName,
                    duration,
                    orchestration,

                    // 录音信息
                    recDate, recStart,
                    recEnd: rawRow[col.recEnd]?.trim(),
                    recStudio: rawRow[col.recStudio]?.trim(),
                    recEngineer: rawRow[col.recEngineer]?.trim(),
                    recOperator: (col.recOperator > -1) ? rawRow[col.recOperator]?.trim() : '',
                    recAssistant: (col.recAssistant > -1) ? rawRow[col.recAssistant]?.trim() : '',
                    recComments: (col.recComments > -1) ? rawRow[col.recComments]?.trim() : '',

                    // 编辑信息
                    edtDate, edtStart,
                    edtEnd: rawRow[col.edtEnd]?.trim(),
                    edtStudio: rawRow[col.edtStudio]?.trim(),
                    edtEngineer: rawRow[col.edtEngineer]?.trim(),
                    edtRest: rawRow[col.edtRest]?.trim(),

                    // 状态标记
                    hasRecData,
                    hasEditData,
                    selected: true,
                    _raw: rawRow,
                    isSplit: options.isSplit || false,
                    partIndex: options.partIndex || 0
                };

                // 5. 智能重复检测
                // 仅通过 项目名 + 乐器名 判断身份 (不再包含 duration，避免修改时长导致识别为新任务)
                const existingTask = itemPool.value.find(item => {
                    const itemProjName = getNameById(item.projectId, 'project');
                    // 匹配逻辑：优先匹配自定义名称(item.name)，其次匹配乐器库名称
                    const itemInstName = item.name || getNameById(item.instrumentId, 'instrument');

                    return itemProjName === newItem.projectName &&
                        itemInstName === newItem.name_merge;
                });

                newItem.isDuplicate = !!existingTask;

                // --- 🟢 核心修复：分维度、深入日程表检测差异 ---
                const { tasks: isTaskMode, time: isTimeMode, orch: isOrchMode } = csvImportConfig.importTypes;
                let recDiff = false;
                let edtDiff = false;

                if (existingTask) {
                    const norm = str => (str || '').toString().trim();
                    const normTime = t => t ? t.substring(0, 5) : '';

                    // 1. 时长对比 (如果 CSV 时长为空，也不报错，视为一致)
                    let hasTimeDiff = isTimeMode && newItem.duration && parseTime(existingTask.musicDuration) !== parseTime(newItem.duration);

                    // 2. 配器对比 (如果 CSV 配器为空，视为一致)
                    let hasOrchDiff = isOrchMode && newItem.orchestration && norm(existingTask.orchestration) !== norm(newItem.orchestration);
                    newItem.hasOrchDiff = hasOrchDiff;

                    const normalizedRecDate = normalizeDate(newItem.recDate);
                    const normalizedEdtDate = normalizeDate(newItem.edtDate);

                    // ==========================================
                    // 🟢 [录音对比] Recording Check (忽略 CSV 空值)
                    // ==========================================
                    const recRec = existingTask.records?.musician || {};

                    // 修正逻辑：如果 CSV 时间为空，或者 CSV 时间等于数据库时间，则视为匹配
                    let recTimeMatch = (!newItem.recStart || normTime(recRec.recStart) === normTime(newItem.recStart)) &&
                        (!newItem.recEnd || normTime(recRec.recEnd) === normTime(newItem.recEnd));

                    // 查找日程 (这里使用之前修正过的逻辑)
                    const recSched = scheduledTasks.value.find(s =>
                        s.date === normalizedRecDate &&
                        s.musicianId === existingTask.musicianId &&
                        (s.sessionId || 'S_DEFAULT') === currentSessionId.value
                    );

                    // 修正逻辑：如果 CSV 录音棚为空，或者匹配，则视为匹配
                    // 注意：如果数据库里没日程(recSched不存在)，且CSV也没写录音棚，那不算冲突；但通常没日程会直接导致 !recSched 触发 update
                    const recStudioMatch = !newItem.recStudio || (recSched && norm(recSched.recordingInfo?.studio) === norm(newItem.recStudio));

                    // 计算差异 (注意 !recSched 依然会触发 Update，因为如果数据库没排期，肯定要更新)
                    newItem.hasRecTimeDiff = hasTimeDiff || !recTimeMatch || !recStudioMatch || !recSched;
                    recDiff = newItem.hasRecTimeDiff || hasOrchDiff;


                    // ==========================================
                    // 🟢 [编辑对比] Editing Check (忽略 CSV 空值)
                    // ==========================================
                    const edtRec = existingTask.records?.project || {};

                    let edtTimeMatch = (!newItem.edtStart || normTime(edtRec.recStart) === normTime(newItem.edtStart)) &&
                        (!newItem.edtEnd || normTime(edtRec.recEnd) === normTime(newItem.edtEnd));

                    const edtSched = scheduledTasks.value.find(s =>
                        s.date === normalizedEdtDate &&
                        s.projectId === existingTask.projectId &&
                        !s.musicianId &&
                        (s.sessionId || 'S_DEFAULT') === currentSessionId.value
                    );

                    const edtStudioMatch = !newItem.edtStudio || (edtSched && norm(edtSched.editInfo?.studio) === norm(newItem.edtStudio));

                    newItem.hasEdtTimeDiff = hasTimeDiff || !edtTimeMatch || !edtStudioMatch || !edtSched;
                    edtDiff = newItem.hasEdtTimeDiff || hasOrchDiff;

                    // 🕵️‍♂️ [调试日志] 只打印有差异的任务，方便排查
                    if (newItem.hasRecTimeDiff) {
                        console.group(`🔍 Debug: ${newItem.name_merge} (检测到 UPDATE)`);
                        console.log(`项目/乐器:`, newItem.projectName, newItem.name_real);
                        console.log(`日期对比: CSV[${normalizedRecDate}] vs 数据库日程[${recSched ? recSched.date : '未找到'}]`);
                        console.log(`ID匹配: CSV乐手[${newItem.playerName}] -> ID[${existingTask.musicianId}]`);

                        if (!recSched) {
                            console.error(`❌ 原因: 未找到对应的录音日程 (recSched is undefined)`);
                            console.log(`   -> 请检查: 日期是否一致? Session是否一致? 乐手ID是否一致?`);
                        } else {
                            if (!recTimeMatch) {
                                console.warn(`⚠️ 原因: 时间不匹配`);
                                console.log(`   CSV : ${normTime(newItem.recStart)} - ${normTime(newItem.recEnd)}`);
                                console.log(`   DB  : ${normTime(recRec.recStart)} - ${normTime(recRec.recEnd)}`);
                            }
                            if (!recStudioMatch) console.warn(`⚠️ 原因: 录音棚不匹配 (CSV: ${newItem.recStudio} vs DB: ${recSched.recordingInfo?.studio})`);
                            if (hasTimeDiff) console.warn(`⚠️ 原因: 时长(Duration)有变化`);
                        }
                        console.groupEnd();
                    }
                    if (newItem.hasEdtTimeDiff) {
                        console.group(`🎬 Edit Debug: ${newItem.projectName} (状态: UPDATE)`);
                        console.log(`项目名称:`, newItem.projectName);
                        console.log(`日期对比: CSV[${normalizedEdtDate}] vs DB[${edtSched ? edtSched.date : '❌ 未找到日程'}]`);

                        if (!edtSched) {
                            console.error(`❌ 主要原因: 数据库中未找到对应的编辑日程`);
                            console.log(`   可能原因:`);
                            console.log(`   1. 日期不匹配 (CSV: ${normalizedEdtDate})`);
                            console.log(`   2. 这是一个新日期的任务，数据库里还没排`);
                            console.log(`   3. Session ID 不匹配 (当前: ${currentSessionId.value})`);
                        } else {
                            if (!edtTimeMatch) {
                                console.warn(`⚠️ 原因: 时间不匹配`);
                                console.log(`   CSV要求: ${newItem.edtStart || '(空)'} - ${newItem.edtEnd || '(空)'}`);
                                console.log(`   DB现有 : ${normTime(edtRec.recStart)} - ${normTime(edtRec.recEnd)}`);
                            }
                            if (!edtStudioMatch) {
                                console.warn(`⚠️ 原因: 录音棚不匹配`);
                                console.log(`   CSV要求: '${newItem.edtStudio}'`);
                                console.log(`   DB现有 : '${edtSched.editInfo?.studio}'`);
                            }
                            if (hasTimeDiff) console.warn(`⚠️ 原因: 乐曲时长(Duration)发生了变化`);
                            if (hasOrchDiff) console.warn(`⚠️ 原因: 配器(Orchestration)发生了变化`);
                        }
                        console.groupEnd();
                    }
                }

                // --- 状态计算函数 (保持逻辑一致) ---
                const calculateStatus = (hasData, hasSpecificDiff) => {
                    if (!hasData) return 'SKIP';
                    if (newItem.isDuplicate) {
                        return hasSpecificDiff ? 'UPDATE' : 'SKIP';
                    }
                    return isTaskMode ? 'NEW' : 'SKIP';
                };

                newItem.recStatusText = calculateStatus(hasRecData, recDiff);
                newItem.editStatusText = calculateStatus(hasEditData, edtDiff);

                // 默认选中逻辑
                const currentStatus = activeImportTab.value === 'rec' ? newItem.recStatusText : newItem.editStatusText;
                newItem.selected = (currentStatus !== 'SKIP');

                targetList.push(newItem);
            };


            const midiManagerExpandedGroups = reactive(new Set())

            // 监听弹窗关闭，清空搜索词
            watch(showTrackList, (val) => {
                if(!val) trackListSearchQuery.value = '';
            });

            const handleTrackListSearchAction = (isEnter = false) => {
                const query = trackListSearchQuery.value.trim().toLowerCase();

                // 1. 清理：无论搜没搜到，先清除上一次的定时器和高光
                if (searchHighlightTimer.value) {
                    clearTimeout(searchHighlightTimer.value);
                    searchHighlightTimer.value = null;
                }

                // 移除上一个元素的高光样式
                if (lastHighlightedTrackId.value) {
                    const prevEl = document.getElementById('track-item-' + lastHighlightedTrackId.value);
                    if (prevEl) {
                        prevEl.classList.remove('ring-2', 'ring-[#007aff]', 'bg-blue-50', 'dark:bg-white/20', 'z-50');
                    }
                    lastHighlightedTrackId.value = null;
                }

                // 如果搜索框为空，直接返回
                if (!query) {
                    trackSearchIndex.value = -1;
                    lastTrackSearchQuery.value = '';
                    return;
                }

                // 2. 查找匹配项
                const items = trackListData.value.items;
                const matchedIndices = [];

                items.forEach((item, index) => {
                    const text = [
                        item.name,
                        getNameById(item.musicianId, 'musician'),
                        getNameById(item.instrumentId, 'instrument'),
                        getNameById(item.projectId, 'project'),
                        item.splitTag || '',
                        item.orchestration || ''
                    ].join(' ').toLowerCase();

                    if (text.includes(query)) matchedIndices.push(index);
                });

                if (matchedIndices.length === 0) return;

                // 3. 计算索引
                if (isEnter && query === lastTrackSearchQuery.value) {
                    trackSearchIndex.value = (trackSearchIndex.value + 1) % matchedIndices.length;
                } else {
                    trackSearchIndex.value = 0;
                }
                lastTrackSearchQuery.value = query;

                // 4. 高亮新目标
                const targetItemIndex = matchedIndices[trackSearchIndex.value];
                const targetItem = items[targetItemIndex];

                if (targetItem) {
                    const el = document.getElementById('track-item-' + targetItem.id);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                        // 添加高光
                        el.classList.add('ring-2', 'ring-[#007aff]', 'bg-blue-50', 'dark:bg-white/20', 'z-50');
                        lastHighlightedTrackId.value = targetItem.id;

                        // 🟢 设置新的定时器 (关键修正：使用变量存储timer，方便下次清除)
                        searchHighlightTimer.value = setTimeout(() => {
                            el.classList.remove('ring-2', 'ring-[#007aff]', 'bg-blue-50', 'dark:bg-white/20', 'z-50');
                            // 只有当当前记录的ID还是自己时，才置空ID (防止快速切换时的竞态)
                            if (lastHighlightedTrackId.value === targetItem.id) {
                                lastHighlightedTrackId.value = null;
                            }
                        }, 2000); // 2秒持续时间

                        if (isMobile.value) window.triggerTouchHaptic('Light');
                    }
                }
            };

            const toggleMidiManagerGroup = (name) => {
                if (midiManagerExpandedGroups.has(name)) {
                    midiManagerExpandedGroups.delete(name);
                } else {
                    midiManagerExpandedGroups.add(name);
                }
            };

            // 将扁平列表转换为分组结构
            const projectMidiGroups = computed(() => {
                const flatList = projectMidiList.value; // 复用已有的排序列表
                if (flatList.length === 0) return [];

                const groups = {};
                const defaultKey = 'Unassigned';

                flatList.forEach(item => {
                    // 如果 item.group 为空，归入 Unassigned
                    const g = (item.group && item.group.trim()) ? item.group : defaultKey;
                    if (!groups[g]) groups[g] = [];
                    groups[g].push(item);
                });

                // 排序分组键名 (Unassigned 放最后)
                const sortedKeys = Object.keys(groups).sort((a, b) => {
                    if (a === defaultKey) return 1;
                    if (b === defaultKey) return -1;
                    return a.localeCompare(b, 'zh-CN');
                });

                return sortedKeys.map(key => ({
                    name: key,
                    items: groups[key] // items 已经在 projectMidiList 中排好序了
                }));
            });

            // 🟢 [辅助] 默认展开所有有数据的分组 (可选，这里设为默认全展开体验更好)
            watch(showMidiManager, (val) => {
                if (val) {
                    // 每次打开弹窗时，重置并展开所有组
                    midiManagerExpandedGroups.clear();
                    // projectMidiGroups.value.forEach(g => midiManagerExpandedGroups.add(g.name));
                }
            });

            // 1. 扩展乐器库 (增加常见缩写和变体)
            const instrumentLibrary = {
                "Brass": [
                    "Horn", "French Horn", "Hn", "Trumpet", "Tpt", "Cornet", "Trombone", "Tbn",
                    "Bass Trombone", "B.Tbn", "Tuba", "Tba", "Euphonium", "Brass"
                ],
                "Woodwinds": [
                    "Flute", "Fl", "Piccolo", "Picc", "Oboe", "Ob", "English Horn", "Cor Anglais", "E.H",
                    "Clarinet", "Cl", "Bass Clarinet", "B.Cl", "Bassoon", "Bsn", "Contrabassoon", "C.Bsn",
                    "Saxophone", "Sax", "Recorder", "Woodwinds"
                ],
                "Strings": [
                    "Violin", "Vln", "Viola", "Vla", "Cello", "Violoncello", "Vc",
                    "Double Bass", "Contrabass", "Db", "Cb", "Bass", // 注意：Bass 在这里，但我们会用正则防止 Bassoon 误判
                    "Strings", "Str"
                ],
                "Percussion": [
                    "Timpani", "Timp", "Snare", "SD", "Bass Drum", "BD", "Cymbals", "Cym", "Piatti",
                    "Triangle", "Tri", "Tambourine", "Tamb", "Glockenspiel", "Glock", "Xylophone", "Xyl",
                    "Vibraphone", "Vib", "Marimba", "Mar", "Tubular Bells", "Chimes", "Drum", "Percussion", "Perc"
                ],
                "Keys": [
                    "Piano", "Pno", "Celesta", "Cel", "Harpsichord", "Organ", "Accordion"
                ],
                "Plucks": [
                    "Harp", "Hp", "Guitar", "Gtr", "Mandolin", "Lute"
                ],
                "Vocal": [
                    "Soprano", "Alto", "Tenor", "Baritone", "Bass Voice", "Choir", "Voice", "Vocal"
                ]
            };

            // 2. 生成排序后的搜索列表 (按长度降序，确保 "Bass Trombone" 先于 "Trombone" 被匹配)
            const sortedLibrary = (() => {
                const list = [];
                for (const [group, names] of Object.entries(instrumentLibrary)) {
                    names.forEach(name => {
                        list.push({ name, group });
                    });
                }
                // 按字符串长度降序排序 (Longest First)
                return list.sort((a, b) => b.name.length - a.name.length);
            })();

// 核心：查找分组
            const findGroupSmart = (trackName) => {
                // A. 预处理轨道名
                const cleanName = normalizeForMatch(trackName);

                // B. 遍历库
                for (const item of sortedLibrary) {
                    const libName = normalizeForMatch(item.name);

                    // 🔴 核心修复：使用正则单词边界 (\b)
                    // 这意味着 "Bass" 只能匹配 "Bass" 或 "Double Bass"，
                    // 而不会匹配 "Bassoon" (因为 Bassoon 里的 bass 后面没有边界)

                    // 转义正则特殊字符 (如 +)
                    const escapedLibName = libName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                    // 构造正则：全字匹配 或 单词边界匹配
                    // 例子：/bass/ 会匹配 bassoon，但 /\bbass\b/ 不会匹配 bassoon
                    const regex = new RegExp(`\\b${escapedLibName}\\b`, 'i');

                    if (regex.test(cleanName)) {
                        return item.group;
                    }

                    // 兜底逻辑：对于很短的缩写 (如 "Fl", "Ob")，如果正则失败，尝试直接包含
                    // 前提是缩写长度小于3，且不是常见的单词前缀
                    if (libName.length < 3 && cleanName === libName) {
                        return item.group;
                    }
                }

                // 5. 兜底猜测 (如果库里没找到)
                if (cleanName.includes('string') || cleanName.includes('vln') || cleanName.includes('vla') || cleanName.includes('cello')) return 'Strings';
                if (cleanName.includes('brass') || cleanName.includes('horn') || cleanName.includes('tpt')) return 'Brass';
                if (cleanName.includes('wood') || cleanName.includes('flute') || cleanName.includes('oboe')) return 'Woodwinds';
                if (cleanName.includes('perc') || cleanName.includes('drum')) return 'Percussion';

                return "";
            };

            // 打开导入界面的下拉菜单
            const openImportMenu = (e, rowId, type) => {
                // 如果点击同一个，则关闭
                if (activeImportMenu.rowId === rowId && activeImportMenu.type === type) {
                    activeImportMenu.rowId = null;
                    activeImportMenu.type = null;
                    return;
                }

                // 计算位置
                const rect = e.currentTarget.getBoundingClientRect();
                importMenuPos.top = rect.bottom + 5;
                importMenuPos.left = rect.left;
                importMenuPos.width = rect.width;

                activeImportMenu.rowId = rowId;
                activeImportMenu.type = type;
                importSearchQuery.value = ''; // 重置搜索

                // 自动聚焦搜索框
                nextTick(() => {
                    const input = document.getElementById('midi-import-search');
                    if (input) input.focus();
                });
            };

            // 关闭导入菜单
            const closeImportMenu = () => {
                activeImportMenu.rowId = null;
                activeImportMenu.type = null;
            };

            // 在导入界面选择乐器
            const selectImportInst = (track, inst) => {
                track.instrumentId = inst.id;

                // 🟢 FIX: 只有在非分组视图下才自动更新分组
                // 这样在 'Group View' 下修改乐器时，条目不会因为分组变化而瞬间跳走
                if (inst.group && midiViewMode.value !== 'groups') {
                    track.group = inst.group;
                }

                track.createNew = false;
                closeImportMenu();
            };

            // 在导入界面选择新建乐器
            const selectImportNewInst = (track) => {
                track.instrumentId = ""; // 空 ID 代表新建
                track.createNew = true;
                closeImportMenu();
                // 自动聚焦名字输入框 (可选优化)
            };

            // 在导入界面选择分组
            const selectImportGroup = (track, groupName) => {
                track.group = groupName;
                closeImportMenu();
            };

            // 获取导入菜单的过滤列表
            const filteredImportOptions = computed(() => {
                const search = importSearchQuery.value.toLowerCase();

                if (activeImportMenu.type === 'inst') {
                    // 乐器列表
                    return sortedInstruments.value.filter(i =>
                        i.name.toLowerCase().includes(search) ||
                        (i.group && i.group.toLowerCase().includes(search))
                    );
                } else if (activeImportMenu.type === 'group') {
                    // 分组列表
                    return availableInstrumentGroups.value.filter(g =>
                        g.toLowerCase().includes(search)
                    );
                }
                return [];
            });

            // 🟢 [修改] 打开分组下拉菜单 (重置搜索词)
            const openMidiGroupDropdown = (e, instId) => {
                if (activeMidiGroupRow.value === instId) {
                    activeMidiGroupRow.value = null;
                    return;
                }
                const rect = e.currentTarget.getBoundingClientRect();
                midiGroupPos.top = rect.bottom + 5;
                midiGroupPos.left = rect.left;
                midiGroupPos.width = rect.width;

                activeMidiGroupRow.value = instId;
                midiGroupSearchQuery.value = ''; // 重置搜索

                // 自动聚焦输入框
                nextTick(() => {
                    const input = document.getElementById('midi-group-search-input');
                    if (input) input.focus();
                });
            };

            const selectMidiGroup = (instId, groupName) => {
                updateInstrumentGroup(instId, groupName); // 调用之前的更新函数
                activeMidiGroupRow.value = null; // 关闭菜单
            };

            // 🟢 [新算法] 判断两个区间是否重叠 (辅助函数)
            // 用于判断音符是否出现在某个小节内
            const isOverlapping = (startA, endA, startB, endB) => {
                return Math.max(startA, startB) < Math.min(endA, endB);
            };

            // 🟢 [新算法] 计算有效时长 (只计算有音符的小节)
            const calculateEffectiveDuration = (midi, track) => {
                // 1. 找到该轨道最后一个音符的结束时间 (Ticks)
                // 如果没有音符，直接返回 0
                if (track.notes.length === 0) return { bars: 0, seconds: 0, rawSeconds: 0 };

                let lastNoteOffTick = 0;
                track.notes.forEach(n => {
                    const end = n.ticks + n.durationTicks;
                    if (end > lastNoteOffTick) lastNoteOffTick = end;
                });

                // 2. 准备拍号表 (Time Signatures)
                let timeSignatures = midi.header.timeSignatures || [];
                if (timeSignatures.length === 0) {
                    timeSignatures = [{ ticks: 0, timeSignature: [4, 4] }];
                }
                timeSignatures.sort((a, b) => a.ticks - b.ticks);

                // 3. 准备基础参数
                const ppq = midi.header.ppq || 480;
                let currentTick = 0;
                let sigIndex = 0;

                let validBarsCount = 0; // 有效小节数
                let validSeconds = 0;   // 有效时长 (秒)

                // 4. [核心循环] 逐个遍历小节，直到覆盖最后一个音符
                while (currentTick < lastNoteOffTick) {
                    // A. 获取当前时刻的拍号
                    while (sigIndex + 1 < timeSignatures.length && timeSignatures[sigIndex + 1].ticks <= currentTick) {
                        sigIndex++;
                    }
                    const currentSig = timeSignatures[sigIndex];
                    const [num, den] = currentSig.timeSignature;

                    // B. 计算当前小节的长度 (Ticks)
                    // 公式: (PPQ * 4 / 分母) * 分子
                    const ticksPerBar = (ppq * 4 / den) * num;
                    const barStartTick = currentTick;
                    const barEndTick = currentTick + ticksPerBar;

                    // C. [关键步骤] 检查该小节内是否有音符
                    // 只要音符的时间范围与当前小节的时间范围有“交集”，就算有效
                    const hasNote = track.notes.some(n => {
                        const noteStart = n.ticks;
                        const noteEnd = n.ticks + n.durationTicks;
                        return isOverlapping(noteStart, noteEnd, barStartTick, barEndTick);
                    });

                    // D. 如果有音符，累加时长
                    if (hasNote) {
                        validBarsCount++;
                        // 计算该小节的秒数
                        // 利用 Tone.js 的 ticksToSeconds 计算绝对时间差，这样能自动处理该小节内部的变速(Tempo Change)
                        const startSec = midi.header.ticksToSeconds(barStartTick);
                        const endSec = midi.header.ticksToSeconds(barEndTick);
                        validSeconds += (endSec - startSec);
                    }

                    // E. 推进到下一小节
                    currentTick += ticksPerBar;
                }

                // 原始绝对时长 (用于对比)
                const totalRawSeconds = midi.header.ticksToSeconds(lastNoteOffTick);

                // 🛡️ 兜底：如果算出来是 0 但有音符 (极罕见情况)，至少给 1 秒
                if (validSeconds === 0 && track.notes.length > 0) validSeconds = 1;

                return {
                    bars: validBarsCount,       // 有效小节数
                    seconds: validSeconds,      // 有效时长 (秒)
                    rawSeconds: totalRawSeconds // 原始总时长 (包含空小节)
                };
            };

            // 🟢 [修改] projectMidiList: 优先按 MIDI 原始顺序排序
            const projectMidiList = computed(() => {
                if (!managingProject.value || !managingProject.value.midiData) return [];

                const list = [];
                const map = managingProject.value.midiData;

                for (const [instId, data] of Object.entries(map)) {
                    const inst = settings.instruments.find(i => i.id === instId);
                    const instName = inst ? inst.name : '未知乐器';
                    const group = inst ? inst.group : '';

                    if (Array.isArray(data)) {
                        data.forEach((subItem, idx) => {
                            list.push({
                                instId: instId,
                                instName: subItem.name || `${instName} #${idx + 1}`,
                                group: group,
                                duration: subItem.duration,
                                isSubItem: true,
                                subIndex: idx,
                                // 🟢 读取保存的 order，如果没有则设为极大值(沉底)
                                order: subItem.order !== undefined ? subItem.order : 99999
                            });
                        });
                    } else {
                        // 旧版本字符串数据的兼容
                        list.push({
                            instId: instId,
                            instName: instName,
                            group: group,
                            duration: data,
                            order: 99999
                        });
                    }
                }

                // 🟢 排序逻辑: 先按 Order (总谱顺序)，Order 相同则按名称
                return list.sort((a, b) => {
                    if (a.order !== b.order) {
                        return a.order - b.order;
                    }
                    return a.instName.localeCompare(b.instName, 'zh-CN');
                });
            });

            // 打开管理器
            const openMidiManager = (project) => {
                managingProject.value = project;
                // 🟢 Vital: If this project was created before the MIDI update,
                // it won't have midiData. Initialize it now so reactivity works.
                if (!project.midiData) {
                    project.midiData = {};
                }
                showMidiManager.value = true;
            };

// 🟢 [重构] 更新 MIDI 时长 (同步更新已存在的任务)
            const updateMidiDuration = (instId, subIndex, newVal) => {
                if (!managingProject.value) return;

                const pid = managingProject.value.id;
                const data = managingProject.value.midiData[instId];

                // 1. 更新 MIDI Manager 的源数据
                let updatedDuration = newVal;

                if (Array.isArray(data)) {
                    if (data[subIndex]) {
                        data[subIndex].duration = newVal;
                    }
                } else {
                    // 兼容旧数据
                    if (newVal) {
                        managingProject.value.midiData[instId] = newVal;
                    } else {
                        delete managingProject.value.midiData[instId];
                        return; // 删除操作不触发同步
                    }
                }

                // ---------------------------------------------------------
                // 🟢 2. 高级功能: 实时同步到任务池 (Task Pool) & 日程表 (Schedule)
                // ---------------------------------------------------------

                // A. 找到当前 Session 下，属于该项目、该乐器的所有任务
                const relatedTasks = itemPool.value.filter(t =>
                    (t.sessionId || 'S_DEFAULT') === currentSessionId.value &&
                    t.projectId === pid &&
                    t.instrumentId === instId
                );

                // B. 定位目标任务
                // 逻辑: MIDI 里的第 subIndex 条数据，对应任务池里的第 subIndex 个任务
                // 例如: 修改了 "Flute 2" (index 1) 的时长 -> 更新第 2 个 Flute 任务
                const targetTask = relatedTasks[subIndex];

                if (targetTask) {
                    // 更新谱面时长
                    targetTask.musicDuration = updatedDuration;

                    // 重新计算预估时长 (保持原有倍率)
                    const currentRatio = targetTask.ratio || 20;
                    const newEst = calculateEstTime(updatedDuration, currentRatio);
                    targetTask.estDuration = newEst;

                    // C. 同步更新日程表 (如果有已排期的块)
                    scheduledTasks.value.forEach(sched => {
                        if (sched.templateId === targetTask.id) {
                            sched.musicDuration = updatedDuration;
                            sched.estDuration = newEst;
                        }
                    });

                    if (isMobile.value) window.triggerTouchHaptic('Light');
                }

                pushHistory();
            };

// 🟢 [修复] 删除映射 (支持删除数组中的单项)
            const removeMidiMapping = (instId, subIndex) => {
                if (!managingProject.value) return;

                const data = managingProject.value.midiData[instId];

                if (Array.isArray(data)) {
                    // 1. 从数组中移除指定项
                    // subIndex 是在 projectMidiList 中生成的
                    if (subIndex !== undefined && subIndex >= 0) {
                        data.splice(subIndex, 1);
                    }

                    // 2. 如果数组空了，彻底删除该 Key
                    if (data.length === 0) {
                        delete managingProject.value.midiData[instId];
                    }
                } else {
                    // 旧版直接删除 Key
                    delete managingProject.value.midiData[instId];
                }

                pushHistory();
            };

// 清空当前项目所有 MIDI 数据
            const clearProjectMidi = () => {
                if (!managingProject.value) return;
                openConfirmModal(
                    '清空映射',
                    `确定要清空项目 "${managingProject.value.name}" 的所有 MIDI 时长数据吗？`,
                    () => {
                        managingProject.value.midiData = {};
                        pushHistory();
                        window.triggerTouchHaptic('Medium');
                    },
                    true
                );
            };

            // 🟢 [增强] 更新乐器分组 (核心逻辑)
            const updateInstrumentGroup = (instId, newGroup) => {
                const finalGroup = newGroup.trim();
                if (!finalGroup) return;

                const inst = settings.instruments.find(i => i.id === instId);
                if (inst) {
                    inst.group = finalGroup; // 更新源数据

                    // 1. 自动展开这个新分组 (否则该项移过去后会被折叠起来看不到)
                    midiManagerExpandedGroups.add(finalGroup);

                    // 2. 保存并关闭菜单
                    pushHistory();
                    activeMidiGroupRow.value = null;

                    if (isMobile.value) window.triggerTouchHaptic('Success');
                }
            };

            // 🟢 [新增] 过滤分组列表 (用于下拉菜单显示)
            const filteredMidiGroups = computed(() => {
                const query = midiGroupSearchQuery.value.toLowerCase().trim();
                // 复用已有的 availableInstrumentGroups (在之前代码中已定义)
                return availableInstrumentGroups.value.filter(g =>
                    g.toLowerCase().includes(query)
                );
            });

// 触发定向导入 (复用之前的 input，但这次我们已经知道是哪个项目了)
            const triggerMidiImportForProject = () => {
                // 复用之前的 input 元素
                const input = document.getElementById('midi-import-input');
                if (input) {
                    input.value = '';
                    input.click();
                }
            };

            // 在 setup() 内部靠前位置添加

// ... 其他 refs ...

// 🟢 MIDI 导入相关逻辑
            const triggerMidiImport = () => {
                const input = document.getElementById('midi-import-input');
                if (input) {
                    input.value = '';
                    input.click();
                }
            };

            const handleMidiFile = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                // 🟢 [修复] 自动关联项目逻辑补全
                if (!managingProject.value) {
                    if (settings.projects.length > 0) {
                        // 默认关联到第一个项目，并初始化 midiData
                        managingProject.value = settings.projects[0];
                        if (!managingProject.value.midiData) {
                            managingProject.value.midiData = {};
                        }
                        // 可选：提示用户关联了哪个项目
                        // console.log("Auto-associated with project:", managingProject.value.name);
                    } else {
                        // 如果连一个项目都没有，无法导入，必须报错
                        openAlertModal("无法导入", "请先至少创建一个项目 (Project) 后再导入 MIDI。");
                        e.target.value = '';
                        return;
                    }
                }

                processMidiFile(file);
                e.target.value = '';
            };

// 🟢 [重写] processMidiFile - 满足三大核心需求
            const processMidiFile = (file) => {
                // 检查库
                if (typeof JZZ === 'undefined' || typeof JZZ.MIDI.SMF === 'undefined') {
                    openAlertModal('库丢失', 'JZZ MIDI 库未加载，请检查网络。');
                    return;
                }

                // 🟢 辅助函数：获取用于匹配 ID 的名称
                // 规则：只去除末尾的阿拉伯数字 (1, 2, 3...)，保留罗马数字 (I, II, V...)
                const getMatchName = (name) => {
                    if (!name) return "";
                    // 解释：
                    // [_\s-]* 匹配前面的空格、下划线或横杠
                    // \d+      匹配一个或多个数字
                    // $        匹配字符串结尾
                    // 这样 "Horn 1" -> "Horn", "Horn 2" -> "Horn"
                    // 但是 "Violin I" -> "Violin I" (因为 I 不是数字 \d)
                    return name.replace(/[_\s-]*\d+$/, '').trim();
                };

                const reader = new FileReader();
                reader.readAsBinaryString(file);

                reader.onload = async (ev) => {
                    try {
                        const data = ev.target.result;
                        const smf = JZZ.MIDI.SMF(data);

                        const tempoMap = buildTempoMap(smf);
                        const timeSigs = buildTimeSigMap(smf);

                        // 🟢 [新增] 保存到全局 Ref，供 Group 计算使用
                        midiTempoMap.value = tempoMap;
                        midiTimeSigs.value = timeSigs;

                        const firstTempo = tempoMap.events.find(e => e.bpm) || { bpm: 120 };
                        midiBpm.value = Math.round(60000000 / firstTempo.mpb);
                        midiTimeSig.value = timeSigs[0].timeSignature;

                        // 🟢 1. 物理合并容器：Key = 轨道原始名称
                        // 这样 "Piano" 和 "Piano" 会落入同一个 Key (合并)
                        // "Horn 1" 和 "Horn 2" 会落入不同 Key (不合并)
                        const mergedMap = {};

                        // ...
                        smf.forEach((track, index) => {
                            // A. 获取名称
                            let rawName = '';
                            track.forEach(e => { if (e.ff === 0x03) rawName = e.dd; });
                            if (!rawName) rawName = `Track ${index + 1}`;

                            // 🟢 [修复] 在这里统一清洗显示名称
                            let displayName = rawName.replace(/\0/g, '').trim();

                            displayName = displayName
                                // 处理 " Flat", "-Flat", "Flat" (忽略大小写) -> "b"
                                // 例如: "Clarinet (B Flat)" -> "Clarinet (Bb)"
                                .replace(/[\s\-_]?Flat/gi, 'b')

                                // 处理 " Sharp", "-Sharp", "Sharp" (忽略大小写) -> "#"
                                .replace(/[\s\-_]?Sharp/gi, '#')

                                // 处理 Unicode 符号
                                .replace(/♭/g, 'b')
                                .replace(/♯/g, '#');

                            // B. 提取音符
                            const trackNotes = extractNotesFromJZZTrack(track);

                            // 空轨且无名则跳过
                            if (trackNotes.length === 0 && !displayName) return;

                            // C. 归并逻辑 (完全同名才合并)
                            if (!mergedMap[displayName]) {
                                mergedMap[displayName] = {
                                    name: displayName,
                                    notes: [],
                                    firstTrackIndex: index, // 记录排序用
                                    trackCount: 0
                                };
                            }

                            mergedMap[displayName].notes.push(...trackNotes);
                            mergedMap[displayName].trackCount++;
                        });

                        const processedTracks = [];
                        let uniqueIdCounter = 0;

                        // --- 第二轮遍历：生成最终列表并进行【智能匹配】 ---
                        for (const name in mergedMap) {
                            const groupData = mergedMap[name];
                            const notes = groupData.notes;

                            // 🟢 核心匹配逻辑

                            // 1. 准备两个用于查找的名字
                            // A: 原始名 (例如 "Violin I", "Horn 1")
                            const exactName = normalizeForMatch(groupData.name);
                            // B. 去掉数字的名 (例如 "Violin I"->"Violin I", "Horn 1"->"Horn")
                            const strippedName = normalizeForMatch(getMatchName(groupData.name));

                            let matchedInstId = '';
                            let matchedGroup = findGroupSmart(groupData.name); // 智能猜分组

                            // 2. 尝试在库里找
                            // 优先级 A: 精确匹配 (库里有 "Horn 1" 就用 "Horn 1")
                            let found = settings.instruments.find(inst => normalizeForMatch(inst.name) === exactName);

                            // 优先级 B: 去掉数字匹配 (库里没有 "Horn 1"，但有 "Horn"，则匹配 "Horn")
                            // 注意：对于 "Violin I"，strippedName 还是 "Violin I"，所以它只会去库里找 "Violin I"，不会匹配到 "Violin"
                            if (!found) {
                                found = settings.instruments.find(inst => normalizeForMatch(inst.name) === strippedName);
                            }

                            // 优先级 C: 模糊包含 (兜底)
                            if (!found) {
                                found = settings.instruments.find(inst => {
                                    const iName = normalizeForMatch(inst.name);
                                    // 确保不是简单的包含 (防止 "Violin" 匹配到 "Violin I")
                                    return iName.includes(strippedName) && strippedName.length > 2;
                                });
                            }

                            if (found) {
                                matchedInstId = found.id;
                                // 如果库里有定义分组，优先用库里的
                                if (found.group) matchedGroup = found.group;
                            }

                            // 3. 计算时长
                            let analysis = { seconds: 0, rawSeconds: 0, bars: 0 }; // 🟢 初始化增加 bars
                            if (notes.length > 0) {
                                analysis = calculateBarQuantizedDuration(notes, tempoMap, timeSigs);
                            }

                            const isTechnicalEmpty = notes.length === 0;

// 🟢 [新增] 智能生成建议名称：去掉末尾的空格和数字 (例如 "Horn (F) 1" -> "Horn (F)")
// 这样在创建新乐器时，多个分轨会自动归并到同一个乐器名下
                            const cleanNameForCreation = groupData.name.replace(/\s+\d+$/, '').trim();

                            processedTracks.push({
                                id: uniqueIdCounter++,
                                name: groupData.name,
                                originalName: groupData.name,
                                suggestedInstName: cleanNameForCreation,
                                instrumentId: matchedInstId,
                                createNew: !matchedInstId && !isTechnicalEmpty,

                                notes: notes,

                                rawDuration: analysis.rawSeconds,
                                quantizedDuration: analysis.seconds,

                                bars: analysis.bars, // 🟢 修复: 将原来的 0 改为 analysis.bars

                                noteCount: notes.length,
                                group: matchedGroup || 'Unassigned',
                                selected: !isTechnicalEmpty,
                                description: groupData.trackCount > 1 ? `Merged ${groupData.trackCount} duplicate tracks` : '',
                                _sortIndex: groupData.firstTrackIndex
                            });
                        }

                        // 保持原始 MIDI 顺序
                        processedTracks.sort((a, b) => a._sortIndex - b._sortIndex);

                        if (processedTracks.length === 0) {
                            openAlertModal('无数据', '未解析到任何有效轨道。');
                            return;
                        }

                        midiImportData.value = processedTracks;
                        showMidiImportModal.value = true;

                    } catch (e) {
                        console.error("JZZ Parse Error:", e);
                        openAlertModal('解析错误', '文件解析失败: ' + e.message);
                    }
                };
            };

            // --- 🟢 MIDI Group 状态管理 ---
            const midiGroupExpanded = reactive(new Set()); // 存储已展开的组名

            const toggleMidiGroupExpand = (groupName) => {
                if (midiGroupExpanded.has(groupName)) {
                    midiGroupExpanded.delete(groupName);
                } else {
                    midiGroupExpanded.add(groupName);
                }
            };

// 🟢 [新增] 判断某组是否全选 (用于分组 Checkbox 状态)
            const isGroupSelected = (rows) => {
                return rows.length > 0 && rows.every(r => r.selected);
            };

            // 🟢 [新增] 切换某组的全选状态
            const toggleGroupSelection = (group, isChecked) => {
                group.rows.forEach(row => {
                    row.selected = isChecked;
                });
            };

            // 🟢 [新增] 全局全选状态 (计算属性：检查当前视图下所有可见行)
            const isAllSelected = computed(() => {
                if (groupedCsvData.value.length === 0) return false;
                return groupedCsvData.value.every(group =>
                    group.rows.every(r => r.selected)
                );
            });

            // 🟢 [修复] 全局全选切换 (只操作当前视图可见的行)
            const toggleAllRows = (isChecked) => {
                groupedCsvData.value.forEach(group => {
                    group.rows.forEach(row => {
                        row.selected = isChecked;
                    });
                });
            };

// 🟢 [修复] midiGroupData: 修复 Group 视图下 Bars 显示为 0 的问题
            const midiGroupData = computed(() => {
                const tracks = midiImportData.value;
                const groupsMap = {};

                // 1. Grouping (分组逻辑保持不变)
                tracks.forEach(t => {
                    if (t.group && t.group.trim() !== '') {
                        if (!groupsMap[t.group]) {
                            groupsMap[t.group] = { name: t.group, items: [] };
                        }
                        groupsMap[t.group].items.push(t);
                    } else {
                        if (!groupsMap['Unassigned']) {
                            groupsMap['Unassigned'] = { name: 'Unassigned', items: [] };
                        }
                        groupsMap['Unassigned'].items.push(t);
                    }
                });

                // 2. Aggregation (聚合计算逻辑)
                return Object.values(groupsMap).map(g => {
                    const selectedItems = g.items.filter(t => t.selected);
                    const hasSelection = selectedItems.length > 0;

                    let finalDuration = 0;
                    let totalNotes = 0;
                    let maxBars = 0; // 🟢 初始化 maxBars

                    // 如果有选中的轨道，且具备 Tempo/TimeSig 数据，进行精确合并计算
                    if (hasSelection && midiTempoMap.value && midiTimeSigs.value) {
                        let allGroupNotes = [];
                        selectedItems.forEach(t => {
                            totalNotes += t.noteCount;
                            if (t.notes) allGroupNotes.push(...t.notes);
                        });

                        if (allGroupNotes.length > 0) {
                            // 将所有音符按时间排序
                            allGroupNotes.sort((a, b) => a.ticks - b.ticks);

                            // 调用之前修复过的 calculateBarQuantizedDuration 函数
                            // 它可以正确返回合并后的总小节数
                            const analysis = calculateBarQuantizedDuration(allGroupNotes, midiTempoMap.value, midiTimeSigs.value);

                            finalDuration = analysis.seconds;
                            maxBars = analysis.bars; // 🟢 关键修复 1: 从分析结果中获取 bars
                        }
                    } else {
                        // 简单回退模式 (如果没有选中或没有 Tempo 数据)
                        selectedItems.forEach(t => {
                            finalDuration = Math.max(finalDuration, t.quantizedDuration);
                            totalNotes += t.noteCount;

                            // 🟢 关键修复 2: 取所有子轨道中最大的 Bars
                            maxBars = Math.max(maxBars, t.bars || 0);
                        });
                    }

                    const genericInst = settings.instruments.find(i =>
                        i.name.toLowerCase() === g.name.toLowerCase() ||
                        (i.group === g.name && i.name.toLowerCase().includes('section'))
                    );

                    return {
                        id: `GRP_${g.name}`,
                        name: g.name,
                        originalName: g.name,
                        instrumentId: genericInst ? genericInst.id : '',
                        createNew: !genericInst,
                        quantizedDuration: finalDuration,
                        bars: maxBars, // 🟢 赋值计算出的小节数
                        noteCount: totalNotes,
                        group: g.name,
                        selected: hasSelection,
                        items: g.items,
                        isGroup: true,
                        description: `${selectedItems.length} / ${g.items.length} tracks`
                    };
                }).sort((a, b) => {
                    if (a.name === 'Unassigned') return 1;
                    if (b.name === 'Unassigned') return -1;
                    return a.name.localeCompare(b.name, 'zh-CN');
                });
            });


            // 🟢 [新增] 根据模式返回当前显示的列表
            const currentMidiDisplayList = computed(() => {
                return midiViewMode.value === 'groups' ? midiGroupData.value : midiImportData.value;
            });

            const findGroupFromLibrary = (cleanName) => {
                const target = cleanName.toLowerCase();

                // 遍历所有分组
                for (const [groupName, instruments] of Object.entries(instrumentLibrary)) {
                    // 检查该分组下的乐器是否匹配
                    const match = instruments.find(inst => {
                        const libInst = inst.toLowerCase();
                        // 匹配逻辑：
                        // 1. 全字匹配 (最准确)
                        if (libInst === target) return true;
                        // 2. 包含匹配 (如库里是 "Piano", 轨道叫 "Piano (L)")
                        if (target.includes(libInst)) return true;
                        return false;
                    });

                    if (match) return groupName;
                }
                return "";
            };

            // 🟢 辅助：计算基于 Tick 的精确时长 (核心算法)
            const calculateAccurateDuration = (midi, track) => {
                // 1. 获取基础信息
                const ppq = midi.header.ppq || 480; // 默认 480 ticks per quarter note

                // 2. 获取拍号 (假设大部分情况主拍号在开头，如果中间变拍号需要更复杂的遍历，这里取第一个)
                const timeSig = midi.header.timeSignatures[0] || { timeSignature: [4, 4] };
                const [num, den] = timeSig.timeSignature;

                // 计算一个小节有多少 Ticks
                // 公式: (PPQ * 4 / 分母) * 分子
                // 例如 4/4: (480 * 1) * 4 = 1920 ticks
                const ticksPerBar = (ppq * 4 / den) * num;

                // 3. 找到轨道中最后一个音符的结束位置 (Ticks)
                let maxTick = 0;
                // 注意：@tonejs/midi 解析后的 note.ticks 是绝对位置，note.durationTicks 是长度
                track.notes.forEach(n => {
                    const end = n.ticks + n.durationTicks;
                    if (end > maxTick) maxTick = end;
                });

                // 4. 量化：向上取整到下一个小节线
                const totalBars = Math.ceil(maxTick / ticksPerBar);
                const quantizedTotalTicks = totalBars * ticksPerBar;

                // 5. 将量化后的 Ticks 转换回秒数 (必须遍历 Tempo Map)
                const durationSeconds = convertTicksToSeconds(midi, quantizedTotalTicks);

                return {
                    bars: totalBars,
                    seconds: durationSeconds,
                    rawEndTick: maxTick
                };
            };

            // 🟢 辅助：利用 Tempo Map 将 Ticks 转为 Seconds
            const convertTicksToSeconds = (midi, targetTick) => {
                const tempos = midi.header.tempos || [];
                // 如果没有速度变化，使用默认 120 BPM
                if (tempos.length === 0) {
                    const ppq = midi.header.ppq || 480;
                    const secondsPerTick = 60 / 120 / ppq;
                    return targetTick * secondsPerTick;
                }

                // 遍历 Tempo Map 累加时间
                let currentTick = 0;
                let currentTime = 0;

                for (let i = 0; i < tempos.length; i++) {
                    const tempo = tempos[i];
                    const nextTempo = tempos[i + 1];

                    // 当前段的结束 tick (要么是下一个变速点，要么是目标 tick)
                    const segmentEndTick = nextTempo ? Math.min(targetTick, nextTempo.ticks) : targetTick;

                    // 如果当前 tempo 开始点已经在目标之后，停止
                    if (tempo.ticks >= targetTick) break;

                    // 计算这段区间的长度 (ticks)
                    // 注意：第一个 tempo 通常从 tick 0 开始，如果不是，前面默认为 120
                    const startTick = Math.max(currentTick, tempo.ticks);
                    const deltaTicks = segmentEndTick - startTick;

                    if (deltaTicks > 0) {
                        const secondsPerTick = 60 / tempo.bpm / midi.header.ppq;
                        currentTime += deltaTicks * secondsPerTick;
                        currentTick += deltaTicks;
                    }

                    // 如果已经到达目标，退出
                    if (currentTick >= targetTick) break;
                }

                // 如果遍历完所有 tempo map 还没到 targetTick (说明最后一段是恒速)
                if (currentTick < targetTick) {
                    const lastTempo = tempos[tempos.length - 1];
                    const secondsPerTick = 60 / lastTempo.bpm / midi.header.ppq;
                    currentTime += (targetTick - currentTick) * secondsPerTick;
                }

                return currentTime;
            };

            // 🟢 核心算法：基于拍号/速度表的小节量化计算
            const calculateQuantizedDuration = (midi, track) => {
                // 1. 找到所有音符中，最后结束的那个时间点 (Ticks)
                // 这能有效忽略轨道末尾的空白或非音符事件
                let lastNoteOffTick = 0;
                track.notes.forEach(n => {
                    const end = n.ticks + n.durationTicks;
                    if (end > lastNoteOffTick) lastNoteOffTick = end;
                });

                if (lastNoteOffTick === 0) return { bars: 0, seconds: 0, rawEndTick: 0 };

                // 2. 准备拍号表 (按时间排序)
                // 默认为 4/4 拍
                let timeSignatures = midi.header.timeSignatures || [];
                if (timeSignatures.length === 0) {
                    timeSignatures = [{ ticks: 0, timeSignature: [4, 4] }];
                }
                timeSignatures.sort((a, b) => a.ticks - b.ticks);

                // 3. "小节步进" 算法
                // 我们从 0 开始，一小节一小节地加，直到超过 lastNoteOffTick
                // 这样做可以完美处理中途变拍号的情况 (e.g. 4/4 -> 3/4 -> 4/4)
                let currentTick = 0;
                let barCount = 0;
                let sigIndex = 0;
                const ppq = midi.header.ppq || 480;

                while (currentTick < lastNoteOffTick) {
                    // 检查当前是否进入了新的拍号范围
                    // 如果下一个拍号变更点的 ticks <= 当前 ticks，说明要切换拍号了
                    while (sigIndex + 1 < timeSignatures.length && timeSignatures[sigIndex + 1].ticks <= currentTick) {
                        sigIndex++;
                    }

                    const currentSig = timeSignatures[sigIndex];
                    const [num, den] = currentSig.timeSignature;

                    // 计算当前拍号下一小节的长度 (Ticks)
                    // 公式: (PPQ * 4 / 分母) * 分子
                    const ticksPerBar = (ppq * 4 / den) * num;

                    currentTick += ticksPerBar;
                    barCount++;
                }

                // 4. 最终转换：将量化后的小节结束点 (currentTick) 转为秒
                // midi.header.ticksToSeconds 会利用 Tempo Map 自动处理所有变速
                const quantizedSeconds = midi.header.ticksToSeconds(currentTick);

                // 原始音符结束时间的秒数 (用于对比)
                const rawSeconds = midi.header.ticksToSeconds(lastNoteOffTick);

                // 🛡️ 兜底修复：如果 Tone.js 算出来的秒数是 0 (解析失败)，手动算一下
                if (quantizedSeconds === 0 && currentTick > 0) {
                    // 假设 120 BPM, 480 PPQ 的标准情况进行估算
                    // 60秒 / 120拍 = 0.5秒/拍
                    // 1拍 = 480 ticks -> 1 tick = 0.5/480 秒
                    const estimatedSecPerTick = 60 / 120 / 480;
                    quantizedSeconds = currentTick * estimatedSecPerTick;
                }

                return {
                    bars: barCount,
                    seconds: quantizedSeconds,
                    rawSeconds: rawSeconds
                };
            };

            // 🟢 [修改] 获取所有可用分组 (合并系统设置 + 当前导入界面的临时分组)
            const availableInstrumentGroups = computed(() => {
                const groups = new Set(['Unassigned']);

                // 1. 来自系统现有的乐器设置
                settings.instruments.forEach(i => {
                    if (i.group) groups.add(i.group);
                });

                // 2. 常用预设
                ['Strings', 'Brass', 'Woodwinds', 'Percussion', 'Keys', 'Plucks', 'Vocal', 'Synth'].forEach(g => groups.add(g));

                // 3. 🟢 [新增] 实时抓取 MIDI 导入界面中刚刚输入的新分组
                // 这样你在 Track 1 输入了 "My New Group"，Track 2 的下拉列表里马上就能选到它
                if (showMidiImportModal.value) {
                    midiImportData.value.forEach(t => {
                        if (t.group && t.group.trim()) {
                            groups.add(t.group.trim());
                        }
                    });
                }

                return Array.from(groups).sort();
            });

            // 🟢 [新增] 当用户改变乐器选择时，自动更新 Group
            const onImportInstChange = (track) => {
                track.createNew = false;
                if (track.instrumentId) {
                    const inst = settings.instruments.find(i => i.id === track.instrumentId);
                    if (inst) track.group = inst.group || 'Unassigned';
                }
            };

            const getSmartName = (row) => {
                if (!row) return 'New Instrument';
                // 如果是分组行(Group)，直接返回名字
                if (row.isGroup) return row.name;

                // 如果是轨道行(Track)，且用户改过名字，显示新名字
                if (row.name !== row.originalName) return row.name;

                // 否则显示建议名字(去掉数字的)
                return row.suggestedInstName || row.name;
            };

            // 🟢 [修改] confirmMidiImport: 支持存储多条轨道数据 (Flute 1, Flute 2)
            const confirmMidiImport = () => {
                if (!managingProject.value) {
                    openAlertModal("错误", "未找到关联的项目，无法保存数据。");
                    return;
                }
                // 初始化
                if (!managingProject.value.midiData) managingProject.value.midiData = {};

                let count = 0;
                const sourceList = midiViewMode.value === 'groups' ? midiGroupData.value : midiImportData.value;

                // 1. 临时存储，用于处理同一个乐器 ID 下的多条数据
                const tempMap = {};

                sourceList.forEach(row => {
                    if (!row.selected) return;

                    let targetInstId = row.instrumentId;

                    // 新建乐器逻辑 (保持不变)
                    if (!targetInstId && row.createNew) {
                        const finalName = (row.name !== row.originalName)
                            ? row.name
                            : (row.suggestedInstName || row.name);

                        const existing = settings.instruments.find(i => i.name === finalName);
                        if (existing) {
                            targetInstId = existing.id;
                        } else {
                            const newId = generateUniqueId('I');
                            const newInst = {
                                id: newId,
                                name: finalName, // 🟢 修复：使用 finalName 替代 nameToUse
                                group: row.group || 'Unassigned',
                                color: generateRandomHexColor()
                            };
                            settings.instruments.push(newInst);
                            targetInstId = newId;
                        }
                    }

                    if (targetInstId) {
                        // 🟢 核心修改: 不直接覆盖，而是收集到临时列表
                        if (!tempMap[targetInstId]) tempMap[targetInstId] = [];

                        tempMap[targetInstId].push({
                            name: row.name, // 保留原始名字 (e.g. "Flute 1")
                            duration: formatSecs(row.quantizedDuration), // 保留特定时长
                            // 可以加一个 sortIndex 方便后续排序
                            _sortIndex: row._sortIndex || 0
                        });

                        count++;
                    }
                });

                // 2. 将临时列表写入项目数据 (替换旧数据，或者合并)
                // 这里采用：覆盖该乐器的旧数据 (以本次导入为准)，并按 MIDI 里的顺序排序
                for (const [instId, items] of Object.entries(tempMap)) {
                    // 按原始轨道顺序排序，确保 Flute 1 在 Flute 2 前面
                    items.sort((a, b) => a._sortIndex - b._sortIndex);

                    // 🟢 关键修改: 保存时保留 order 字段
                    const cleanItems = items.map(item => ({
                        name: item.name,
                        duration: item.duration,
                        order: item._sortIndex // <--- 新增这行，持久化保存排序权重
                    }));

                    managingProject.value.midiData[instId] = cleanItems;
                }

                pushHistory();
                window.triggerTouchHaptic('Success');
                showMidiImportModal.value = false;
                openAlertModal('导入成功', `已导入 ${count} 条轨道数据 (支持分部)。`);
            };

            // 1. 周视图 -> 月视图 (双击表头)
            const handleHeaderDoubleTap = (e) => {
                const now = Date.now();
                // 如果两次点击间隔小于 300ms
                if (now - lastHeaderTap < 300) {
                    e.preventDefault(); // 阻止默认行为（如缩放）
                    switchView('month');
                }
                lastHeaderTap = now;
            };

            // 2. 月视图 -> 周视图 (双击日期格)
            const handleMonthCellDoubleTap = (e, dateStr) => {
                // 如果点到了任务条(Task)，不要触发视图切换，让任务条自己的逻辑处理
                if (e.target.closest('.task-block') || e.target.closest('.text-\\[11px\\]')) {
                    return;
                }

                const now = Date.now();
                // 必须是同一个日期格子，且间隔小于 300ms
                if (now - lastMonthTap.time < 300 && lastMonthTap.date === dateStr) {
                    e.preventDefault();
                    window.triggerTouchHaptic('Light');
                    switchToWeek(dateStr);
                }
                lastMonthTap.time = now;
                lastMonthTap.date = dateStr;
            };

            // 🟢 [新增] 无限滚动范围控制
            const renderedRange = reactive({
                past: 6,   // 初始往回看 6 个月
                future: 18 // 初始往后看 18 个月
            });
            const isLoadingMore = ref(false); // 防抖锁

            // 辅助：配合 v-for 收集 DOM 引用
            const setMonthRef = (el) => {
                if (el) monthRefs.value.push(el);
            };

            const initMonthObserver = () => {
                if (monthObserver.value) monthObserver.value.disconnect();
                monthRefs.value = []; // 清空旧引用

                const options = {
                    root: document.getElementById('main-content'),
                    rootMargin: '0px 0px -90% 0px', // 判定线调整到顶部
                    threshold: 0
                };

                monthObserver.value = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // 读取单元格上的 data-month-start
                            const dateStr = entry.target.dataset.monthStart;
                            if (dateStr) {
                                visibleTopDate.value = new Date(dateStr);
                            }
                        }
                    });
                }, options);

                // 等待 DOM 渲染后观察所有“1号”的格子
                setTimeout(() => {
                    // monthRefs 在模板渲染时会自动填充
                    monthRefs.value.forEach((el) => {
                        monthObserver.value.observe(el);
                    });
                }, 100);
            };

// 监听视图模式切换：切到滚动模式时启动观察器
            watch(monthViewMode, (newMode) => {
                if (newMode === 'scrolled') {
                    visibleTopDate.value = viewDate.value; // 重置为当前 viewDate
                    nextTick(() => initMonthObserver());
                } else {
                    if (monthObserver.value) monthObserver.value.disconnect();
                }
            });


            const openCreditModal = () => {
                const sessId = currentSessionId.value;

                // 1. 初始化数据容器
                const projectDataMap = {};

                const getProjData = (pid) => {
                    if (!projectDataMap[pid]) {
                        projectDataMap[pid] = {
                            name: getNameById(pid, 'project'), // 获取项目基础名称
                            // --- 管弦乐部分 ---
                            orch: {
                                strings: new Set(),
                                woodwinds: {},
                                brass: {},
                                percussion: {},
                                others: {}
                            },
                            orchTech: {
                                studios: new Set(), engineers: new Set(),
                                operators: new Set(), assistants: new Set()
                            },
                            // --- 普通乐器部分 ---
                            solo: {},
                            soloTech: {
                                studios: new Set(), engineers: new Set(),
                                operators: new Set(), assistants: new Set()
                            },
                            editors: new Set()
                        };
                    }
                    return projectDataMap[pid];
                };

                // --- 核心函数：判断乐器分类 ---
                const getOrchCategory = (instName, musName) => {
                    const i = (instName || '').toLowerCase();
                    const m = (musName || '').toLowerCase();

                    if (/\b(violin|viola|cello|double\s*bass|contrabass)\b/.test(i)) return 'strings';
                    if (/\b(flute|piccolo|oboe|english\s*horn|cor\s*anglais|clarinet|bassoon|contrabassoon)\b/.test(i)) return 'woodwinds';
                    if (/\b(horn|trumpet|trombone|tuba|euphonium)\b/.test(i)) return 'brass';
                    if (/\b(timpani|snare|cymbal|gong|mark\s*tree|glockenspiel|xylophone|marimba|vibraphone|chimes|tubular\s*bells)\b/.test(i)) return 'percussion';
                    if (/\b(harp|celesta|celeste|piano|organ|harpsichord)\b/.test(i)) return 'others';

                    if (m.includes('string')) return 'strings';
                    if (m.includes('woodwind')) return 'woodwinds';
                    if (m.includes('brass')) return 'brass';
                    if (m.includes('percussion') || m.includes('perc ')) return 'percussion';

                    return null;
                };

                const addToMap = (targetMap, instrumentLabel, playerName) => {
                    if (!playerName || playerName === '未知演奏员' || playerName === '未选择') return;

                    // 🟢 [修正] 加入 \r 和 \n
                    const names = playerName.split(/[\/,\r\n]|\^\|/).map(s => s.trim()).filter(s => s);

                    names.forEach(name => {
                        if (!targetMap[instrumentLabel]) targetMap[instrumentLabel] = new Set();
                        targetMap[instrumentLabel].add(name);
                    });
                };

                const addTechInfo = (targetTech, info) => {
                    if (!info) return;
                    const splitAndAdd = (str, set) => {
                        if (!str) return;

                        // 🟢 [修正] 加入 \r 和 \n 确保所有类型的换行都能切分
                        const parts = str.split(/[\/,\r\n]|\^\|/).map(s => s.trim()).filter(s => s);

                        parts.forEach(p => set.add(p));
                    };
                    // ... 后面的代码不变
                    splitAndAdd(info.studio, targetTech.studios);
                    splitAndAdd(info.engineer, targetTech.engineers);
                    splitAndAdd(info.operator, targetTech.operators);
                    splitAndAdd(info.assistant, targetTech.assistants);
                };

                // 2. 遍历曲目 (ItemPool)
                const sessionItems = itemPool.value.filter(i => (i.sessionId || 'S_DEFAULT') === sessId);

                if (sessionItems.length === 0 && scheduledTasks.value.length === 0) {
                    openAlertModal("无数据", "当前日程表为空，无法生成名单。");
                    return;
                }

                sessionItems.forEach(item => {
                    if (item.isSkipped) return;

                    const pid = item.projectId || 'Unassigned';
                    const pData = getProjData(pid);

                    const instId = item.instrumentId;
                    const systemInstName = getNameById(instId, 'instrument');
                    const musId = item.musicianId;
                    const musName = getNameById(musId, 'musician');

                    const category = getOrchCategory(systemInstName, musName);
                    let hasDetailedInfo = false;

                    if (category) {
                        // Orchestra
                        if (category === 'percussion') {
                            const musicianSettings = settings.musicians.find(m => m.id === musId);
                            if (musicianSettings && musicianSettings.percConfig && musicianSettings.percConfig.tags.length > 0) {
                                musicianSettings.percConfig.tags.forEach(tag => {
                                    if (tag.assignedTo) {
                                        const assignedPlayer = musicianSettings.percConfig.players.find(p => p.id === tag.assignedTo);
                                        if (assignedPlayer) {
                                            addToMap(pData.orch.percussion, tag.name, assignedPlayer.name);
                                            hasDetailedInfo = true;
                                        }
                                    }
                                });
                            }
                        }

                        if (!hasDetailedInfo && item.roster && Object.keys(item.roster).length > 0) {
                            let targetMap = pData.orch[category];
                            Object.entries(item.roster).forEach(([key, playerName]) => {
                                if (!playerName || !playerName.trim()) return;
                                let instrumentLabel = key.split(/[._\d]/)[0].trim();
                                if (!instrumentLabel) instrumentLabel = systemInstName;

                                if (category === 'strings') {
                                    // 🟢 [修正]
                                    const names = playerName.split(/[\/,\r\n]|\^\|/).map(s => s.trim()).filter(s => s);
                                    names.forEach(n => pData.orch.strings.add(n));
                                } else {
                                    addToMap(targetMap, instrumentLabel, playerName.trim());
                                }
                                hasDetailedInfo = true;
                            });
                        }

                        if (!hasDetailedInfo) {
                            if (category === 'strings') {
                                if (musName) {
                                    // 🟢 [修正]
                                    const names = musName.split(/[\/,\r\n]|\^\|/).map(s => s.trim()).filter(s => s);
                                    names.forEach(n => pData.orch.strings.add(n));
                                }
                            } else {
                                addToMap(pData.orch[category], systemInstName, musName);
                            }
                        }

                    } else {
                        // Solo Instruments
                        addToMap(pData.solo, systemInstName, musName);
                    }
                });

                // 3. 遍历日程 (ScheduledTasks)
                const sessionTasks = scheduledTasks.value.filter(t => (t.sessionId || 'S_DEFAULT') === sessId);

                sessionTasks.forEach(task => {
                    // 1. 确定项目归属
                    const currentTaskProjectIds = new Set();
                    if (task.projectId) {
                        currentTaskProjectIds.add(task.projectId);
                    } else {
                        if (task.musicianId) {
                            sessionItems.filter(i => i.musicianId === task.musicianId)
                                .forEach(i => i.projectId && currentTaskProjectIds.add(i.projectId));
                        }
                        if (task.instrumentId) {
                            sessionItems.filter(i => i.instrumentId === task.instrumentId)
                                .forEach(i => i.projectId && currentTaskProjectIds.add(i.projectId));
                        }
                    }

                    // 2. 处理 Edit Info (音频编辑)
                    if (task.editInfo) {
                        const edName = task.editInfo.engineer || task.editInfo.EditEngineer;
                        if (edName) {
                            currentTaskProjectIds.forEach(pid => {
                                const pData = getProjData(pid);
                                const names = edName.split(/[\/,]/);
                                names.forEach(n => {
                                    if (n && n.trim()) pData.editors.add(n.trim());
                                });
                            });
                        }
                    }

                    // 3. 处理 Recording Info (录音技术人员)
                    const info = task.recordingInfo;
                    if (!info) return;

                    let isOrchTask = false;
                    const relatedItems = sessionItems.filter(i => {
                        if (task.musicianId) return i.musicianId === task.musicianId;
                        if (task.instrumentId) return i.instrumentId === task.instrumentId;
                        return false;
                    });

                    if (relatedItems.length > 0) {
                        isOrchTask = relatedItems.some(i => {
                            const iName = getNameById(i.instrumentId, 'instrument');
                            const mName = getNameById(i.musicianId, 'musician');
                            return !!getOrchCategory(iName, mName);
                        });
                    } else {
                        const iName = getNameById(task.instrumentId, 'instrument');
                        const mName = getNameById(task.musicianId, 'musician');
                        isOrchTask = !!getOrchCategory(iName, mName);
                    }

                    currentTaskProjectIds.forEach(pid => {
                        const pData = getProjData(pid);
                        if (isOrchTask) {
                            addTechInfo(pData.orchTech, info);
                        } else {
                            addTechInfo(pData.soloTech, info);
                        }
                    });
                });

                // 4. 生成文本
                const finalLines = [];
                const sortedPids = Object.keys(projectDataMap).sort((a, b) =>
                    projectDataMap[a].name.localeCompare(projectDataMap[b].name, 'zh-CN')
                );

                // 辅助输出函数
                const printTechBlock = (techData) => {
                    const join = (set) => Array.from(set).join(' / ');
                    if (techData.studios.size > 0) finalLines.push(`录音棚 Recording Studio：${join(techData.studios)}`);
                    if (techData.engineers.size > 0) finalLines.push(`录音工程师 Recording Engineer：${join(techData.engineers)}`);
                    if (techData.operators.size > 0) finalLines.push(`录音操作员 Recording Operator：${join(techData.operators)}`);
                    if (techData.assistants.size > 0) finalLines.push(`录音师助理 Recording Assistant：${join(techData.assistants)}`);
                };

                const printInstMap = (title, map) => {
                    const keys = Object.keys(map).sort();
                    if (keys.length > 0) {
                        if(title) {
                            finalLines.push("");
                            finalLines.push(`${title}：`);
                        }
                        keys.forEach(inst => {
                            const names = Array.from(map[inst]).join(' / ');
                            finalLines.push(`${inst}：${names}`);
                        });
                    }
                };

                sortedPids.forEach(pid => {
                    const d = projectDataMap[pid];

                    // 🟢 获取项目详细元数据 (Project Info)
                    const projectMeta = settings.projects.find(p => p.id === pid) || {};

                    // 判断是否有内容需要输出 (如果是一个空项目，什么都没录，也没有设置信息，则跳过)
                    const hasSolo = Object.keys(d.solo).length > 0;
                    const isOrchEmpty = d.orch.strings.size === 0 &&
                        Object.keys(d.orch.woodwinds).length === 0 &&
                        Object.keys(d.orch.brass).length === 0 &&
                        Object.keys(d.orch.percussion).length === 0 &&
                        Object.keys(d.orch.others).length === 0;

                    // 如果是 Unassigned 且没有录音内容，或者有ID但没内容且没元数据，则跳过
                    if ((pid === 'Unassigned' && !hasSolo && isOrchEmpty) ||
                        (!hasSolo && isOrchEmpty && !projectMeta.title)) {
                        // 允许有title但没录音的项目显示，作为占位
                        if(!projectMeta.title) return;
                    }

                    // --- 1. Header (Title, Composer, Arranger) ---
                    // 使用 Project Info 中的 Title，如果没有则使用项目名
                    const displayTitle = projectMeta.title || d.name;
                    finalLines.push(`曲目名称 Title：${displayTitle}`);
                    finalLines.push("");

                    if (projectMeta.composer) {
                        finalLines.push(`作曲 Composer：${projectMeta.composer}`);
                        finalLines.push("");
                    }
                    if (projectMeta.arranger) {
                        finalLines.push(`编曲 Arranger：${projectMeta.arranger}`);
                        finalLines.push("");
                    }

                    // --- 2. Orchestra Recording ---
                    if (!isOrchEmpty) {
                        finalLines.push("管弦乐队录制（Orchestra Recording）");
                        finalLines.push("");
                        // 这里目前没有 Orchestra Name 字段，如果将来加了可以在这里输出
                        // finalLines.push(`乐队 Orchestra：${projectMeta.orchestraName || '...'}`);
                        finalLines.push("指挥 Conductor：[请填写]");

                        if (d.orch.strings.size > 0) {
                            finalLines.push("");
                            finalLines.push("弦乐组 Strings：");
                            d.orch.strings.forEach(s => finalLines.push(s));
                        }

                        printInstMap("木管组 Woodwinds", d.orch.woodwinds);
                        printInstMap("铜管组 Brass", d.orch.brass);
                        printInstMap("打击乐组 Percussion", d.orch.percussion);
                        printInstMap("色彩乐器 Keyboards & Harp", d.orch.others);

                        finalLines.push("");
                        printTechBlock(d.orchTech);
                        finalLines.push("");
                    }

                    // --- 3. Instruments Recording ---
                    if (hasSolo) {
                        finalLines.push("乐器录制（Instruments Recording）");
                        finalLines.push("");
                        printInstMap("", d.solo); // 乐器名：人名

                        finalLines.push("");
                        printTechBlock(d.soloTech);
                        finalLines.push("");
                    }

                    // --- 4. Post Production (Mixing, Mastering, Editing) ---
                    // 检查是否有任何后期信息
                    const hasPostInfo = (d.editors && d.editors.size > 0) ||
                        projectMeta.mixingEngineer ||
                        projectMeta.mixingStudio ||
                        projectMeta.masteringEngineer ||
                        projectMeta.masteringStudio ||
                        projectMeta.dolbyStudio;

                    if (hasPostInfo) {
                        finalLines.push(""); // 与上文隔开
                        finalLines.push("声音后期制作（Editing, Mixing & Mastering）");
                        finalLines.push("");

                        // 音频编辑 (来自 Edit Info 弹窗)
                        if (d.editors && d.editors.size > 0) {
                            finalLines.push(`音频编辑 Audio Editor：${[...d.editors].join(' / ')}`);
                        }

                        // 混音 & 母带 (来自 Project Info 弹窗)
                        if (projectMeta.mixingEngineer) finalLines.push(`混音工程师 Mixing Engineer：${projectMeta.mixingEngineer}`);
                        if (projectMeta.mixingStudio) finalLines.push(`混音工作室 Mixing Studio：${projectMeta.mixingStudio}`);

                        if (projectMeta.masteringEngineer) finalLines.push(`母带工程师 Mastering Engineer：${projectMeta.masteringEngineer}`);
                        if (projectMeta.masteringStudio) finalLines.push(`母带工作室 Mastering Studio：${projectMeta.masteringStudio}`);

                        if (projectMeta.dolbyStudio) finalLines.push(`杜比全景声母带工作室 Dolby Atmos Mastering Studio：${projectMeta.dolbyStudio}`);
                    }

                    // --- 5. Production & Publishing ---
                    if (projectMeta.producer) {
                        finalLines.push("");
                        finalLines.push("音乐制作人（Music Producer）");
                        finalLines.push(projectMeta.producer);
                    }

                    if (projectMeta.publishedBy) {
                        finalLines.push("");
                        finalLines.push("发行（Published by）");
                        finalLines.push(projectMeta.publishedBy);
                    }

                    if (projectMeta.producedBy) {
                        finalLines.push("");
                        finalLines.push("出品（Produced by）");
                        finalLines.push(projectMeta.producedBy);
                    }

                    finalLines.push("------------------------------------------------");
                    finalLines.push("");
                });

                generatedCreditText.value = finalLines.join('\n');
                showCreditModal.value = true;
            };

            const copyCreditText = () => {
                if (!generatedCreditText.value) return;
                navigator.clipboard.writeText(generatedCreditText.value).then(() => {
                    window.triggerTouchHaptic('Success');
                    // 按钮文字变一下反馈 (可选)
                    const btn = document.querySelector('.modal-window button i.fa-copy')?.parentNode;
                    if(btn) {
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<i class="fa-solid fa-check"></i> 已复制';
                        setTimeout(() => btn.innerHTML = originalText, 2000);
                    }
                });
            };

            // 🟢 [新增] 检查是否允许删除 (只允许删除链条的末端)
            const checkCanDeleteSplit = (item) => {
                // 1. 检查是否有任何任务的 splitFromId 指向当前任务
                // 如果有，说明当前任务是"父级" (例如它是 Part 2，且存在 Part 3)，则不能删
                const directChild = itemPool.value.find(t => t.splitFromId === item.id);

                if (directChild) {
                    const childName = directChild.splitTag || '后续部分';
                    openAlertModal(
                        '无法删除',
                        `检测到后续任务 ${childName} 存在。\n\n为了保证时间计算正确，请务必按顺序先删除最后一个 Part，才能逐级归还时间。`
                    );
                    window.triggerTouchHaptic('Error');
                    return false; // 禁止删除
                }

                return true; // 允许删除
            };



            // 🟢 [新增] 辅助函数：计算某个任务及其所有分身的总时长
            const getFamilyTotalDuration = (targetItem) => {
                // 1. 找到根节点 ID (如果是子任务，取 splitFromId；如果是根任务，取自身 ID)
                const rootId = targetItem.splitFromId || targetItem.id;

                // 2. 在任务池中找到整个家族 (根节点 + 所有子节点)
                // 注意：这里只筛选 ID 匹配，不筛选 Session，因为 splitFromId 是跨 Session 唯一的
                const familyMembers = itemPool.value.filter(i => i.id === rootId || i.splitFromId === rootId);

                // 3. 累加所有成员的 musicDuration
                const totalSeconds = familyMembers.reduce((sum, item) => {
                    return sum + parseTime(item.musicDuration || '00:00');
                }, 0);

                return totalSeconds;
            };

            // 🟢 [修改] 编制预设 (改为显式名称格式)
            const activeOrchPresets = computed(() => {
                const instId = editingItem.value.instrumentId;
                // 默认木管配置
                if (!instId) return { full: '2 Fl, 2 Ob, 2 Cl, 2 Bsn', std: '1 Fl, 1 Ob, 1 Cl, 1 Bsn' };

                const inst = settings.instruments.find(i => i.id === instId);
                const text = inst ? `${inst.name} ${inst.group || ''}`.toLowerCase() : '';

                // 1. Strings (弦乐)
                if (/string|str|vln|vla|vc|db|violin|cello|viola/.test(text)) {
                    return {
                        full: '12 Vln1, 10 Vln2, 8 Vla, 8 Vc, 6 Db',
                        std: '8 Vln1, 6 Vln2, 4 Vla, 4 Vc, 3 Db'
                    };
                }

                // 2. Brass (铜管)
                if (/brass|hn|tpt|tbn|tba|horn|trumpet|trombone|tuba/.test(text)) {
                    return {
                        full: '4 Hn, 3 Tpt, 3 Tbn, 1 Tba',
                        std: '4 Hn, 2 Tpt, 2 Tbn'
                    };
                }

                // 3. Woodwinds (木管 - 默认)
                return {
                    full: '3 Fl, 3 Ob, 3 Cl, 3 Bsn',
                    std: '2 Fl, 2 Ob, 2 Cl, 2 Bsn'
                };
            });


            const orchTemplates = {
                'Brass': ['Hn', 'Tpt', 'Tbn', 'B. Tbn', 'Tba'],
                'Woodwinds':['Fl', 'Picc', 'Ob', 'E. H.', 'Cl', 'B. Cl', 'Bsn', 'C. Bsn'],
                'Strings': ['Vln1', 'Vln2', 'Vla', 'Vc', 'Db']
            };

            // 🟢 [修改] 解析编制字符串 (动态模式)
            // 输入: "4 Fl, 2 Ob, 12 Vln1"
            // 输出: 动态生成对应数量的输入框
            const parsedRoster = computed(() => {
                const code = editingItem.value.orchestration || '';

                // 1. 分割字符串：支持逗号(,) 加号(+) 或分号(;) 分隔
                // 过滤掉空字符串
                const parts = code.split(/[,+;]/).map(s => s.trim()).filter(s => s);

                const result = [];

                parts.forEach((part, index) => {
                    // 2. 正则匹配：以数字开头，后面跟着名称
                    // 捕获组 1: 数字 (\d+)
                    // 捕获组 2: 名称 (剩下的部分)
                    const match = part.match(/^(\d+)\s*(.*)$/);

                    if (match) {
                        const count = parseInt(match[1], 10);
                        // 如果没有写名字(例如只写了"4")，则使用默认名称 "Player"
                        const label = match[2].trim() || 'Player';

                        if (count > 0) {
                            result.push({
                                label: label,
                                count: count,
                                // 使用 label 作为前缀，确保 rosters 对象中的 key 唯一
                                // 例如: "Fl._1", "Fl._2"
                                startIndex: 0
                            });
                        }
                    }
                });

                return result;
            });

            // 初始化/获取人员名单对象
            const getRosterName = (sectionLabel, index) => {
                if (!editingItem.value.roster) editingItem.value.roster = {};
                const key = `${sectionLabel}_${index + 1}`;
                return editingItem.value.roster[key] || '';
            };

            // 更新人员名单
            const updateRosterName = (sectionLabel, index, value) => {
                if (!editingItem.value.roster) editingItem.value.roster = {};
                const key = `${sectionLabel}_${index + 1}`;
                editingItem.value.roster[key] = value;
            };

            // --- 🟢 新增：判断是否显示编制/名单输入框 ---
            const showOrchestrationField = computed(() => {
                const instId = editingItem.value.instrumentId;
                if (!instId) return false;

                // 1. 找到当前乐器对象
                const inst = settings.instruments.find(i => i.id === instId);
                if (!inst) return false;

                // 2. 拼接 名称 和 分组 (转小写)
                const text = `${inst.name} ${inst.group || ''}`.toLowerCase();

                // 3. 关键词匹配 (支持 Brass, Woodwind, String, Wind, Str 等)
                // 只要名称或分组里包含这些词，就显示
                return /brass|woodwind|string|str|wind/.test(text);
            });

            // --- 🥁 智能打击乐处理逻辑 (Smart Percussion) ---

            // 1. 定义打击乐关键词映射表 (根据你的截图大幅扩充)
            const percKeywords = {
                // 基础类
                'Snare': 'SD', 'Drum': 'Dr', 'Bass': 'BD', 'Kick': 'BD',
                'Cymbal': 'Cym', 'Piatti': 'Piatti', 'Crash': 'Cym', 'Sus': 'SusCym',
                'Timpani': 'Timp', 'Gong': 'Gong', 'Tam': 'Tam', 'Tubular':'TB',

                // 你的截图特定乐器
                'Anvil': 'Anv',       // 铁砧
                'Cabasa': 'Cab',      // 卡巴萨
                'Castanets': 'Cast',  // 响板
                'Bell': 'Bell',       // 各种铃 (China Bell, LP Bell, SL Bell)
                'Cowbell': 'CB',      // 牛铃
                'Guiro': 'Guiro',     // 刮瓜
                'Mark Tree': 'Tree',  // 音树
                'Ratchet': 'Ratch',   // 棘轮
                'Whistle': 'Whis',    // 哨子 (Samba Whistle)
                'Shaker': 'Shk',      // 沙锤 (Plastic, Metal, Wooden)
                'Shells': 'Shells',   // 贝壳风铃
                'Sleigh': 'SlBell',   // 雪橇铃
                'Whip': 'Whip',       // 鞭响
                'Wood Block': 'WB',   // 木鱼/木盒
                'Block': 'Blk',
                'Tamb': 'Tamb',       // 铃鼓
                'Tri': 'Tri',         // 三角铁
                'Vib': 'Vib', 'Xylo': 'Xyl', 'Glock': 'Glk', 'Chime': 'Chm',
                'Crot': 'Crot', 'Stick': 'Stk', 'Clap': 'Clap'
            };

            // 1. 状态变量
            const percState = reactive({
                tags: [],
                players: [],
                selectedTagIndices: new Set()
            });

            // 3. 判断当前是否为打击乐编辑模式 (修正: 检查范围更广)
            const isPercussionMode = computed(() => {
                const instName = getNameById(editingItem.value.instrumentId, 'instrument').toLowerCase();
                const musicianName = getNameById(editingItem.value.musicianId, 'musician').toLowerCase();
                const groupName = (settings.instruments.find(i => i.id === editingItem.value.instrumentId)?.group || '').toLowerCase();

                // 触发词：只要命中这些词，就视为打击乐任务，开启分部面板
                // 包含了 "Percussion" (匹配你的 SPO Percussion Player)
                const triggers = ['perc'];

                return triggers.some(t => instName.includes(t) || musicianName.includes(t) || groupName.includes(t));
            });

            // 4. 核心：扫描并生成/恢复标签 (修复: 读取演奏员存档实现持久化)
            const scanPercussionTags = () => {
                // 1. 获取当前演奏员对象 (作为配置的存储载体)
                const musician = settings.musicians.find(m => m.id === editingItem.value.musicianId);

                // 初始化临时列表
                let currentTags = [];
                let currentPlayers = [];

                // 2. 尝试读取该演奏员已保存的配置
                if (musician && musician.percConfig) {
                    // 深拷贝以断开引用，防止修改未保存时污染源数据
                    currentTags = JSON.parse(JSON.stringify(musician.percConfig.tags));
                    currentPlayers = JSON.parse(JSON.stringify(musician.percConfig.players));
                } else {
                    // 如果没有存档，初始化默认演奏员
                    currentPlayers = [{ id: 1, name: 'Perc 1', tags: [] }];
                }

                // 3. 扫描当前 Session 下该人的所有任务，找出所有涉及的乐器
                // (目的是发现新添加的任务/乐器，并合并到现有配置中)
                let relatedItems = [];
                if (sidebarTab.value === 'musician' && editingItem.value.musicianId) {
                    relatedItems = itemPool.value.filter(i => i.musicianId === editingItem.value.musicianId && (i.sessionId || 'S_DEFAULT') === currentSessionId.value);
                } else if (editingItem.value.instrumentId) {
                    relatedItems = itemPool.value.filter(i => i.instrumentId === editingItem.value.instrumentId && (i.sessionId || 'S_DEFAULT') === currentSessionId.value);
                }

                relatedItems.forEach(item => {
                    const rawName = getNameById(item.instrumentId, 'instrument');

                    // 检查这个乐器是否已经在 tags 里了
                    // 🟢 修复: 只有当它是新乐器时才添加
                    if (rawName && !currentTags.some(t => t.fullName === rawName)) {
                        currentTags.push({
                            name: rawName,
                            fullName: rawName,
                            assignedTo: null // 新乐器默认未分配
                        });
                    }
                });

                // 4. 排序 (让界面整洁)
                currentTags.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

                // 5. 赋值给响应式状态
                percState.tags = currentTags;
                percState.players = currentPlayers;
                percState.selectedTagIndices.clear();
            };

            // 5. 添加演奏员
            const addPercPlayer = () => {
                const id = percState.players.length + 1;
                percState.players.push({
                    id: id,
                    name: `Perc ${id}`,
                    tags: []
                });
            };

            // 6. 移除演奏员
            const removePercPlayer = (idx) => {
                const player = percState.players[idx];
                // 把该人的标签释放回未分配状态
                percState.tags.forEach(t => {
                    if (t.assignedTo === player.id) t.assignedTo = null;
                });
                percState.players.splice(idx, 1);

                // 🟢 触发保存和同步
                updatePercOrchestration();
            };

            // 7. 分配逻辑：点击标签
            const togglePercTagSelect = (index) => {
                if (percState.selectedTagIndices.has(index)) {
                    percState.selectedTagIndices.delete(index);
                } else {
                    percState.selectedTagIndices.add(index);
                }
            };

            // 8. 分配逻辑：点击演奏员 (将选中的标签给这个人)
            const assignTagsToPlayer = (playerId) => {
                if (percState.selectedTagIndices.size === 0) return;

                percState.selectedTagIndices.forEach(idx => {
                    const tag = percState.tags[idx];
                    tag.assignedTo = playerId;
                });

                percState.selectedTagIndices.clear(); // 清空选择
                window.triggerTouchHaptic('Medium');
                updatePercOrchestration();
            };

            // 9. 更新最终字符串并同步给同组所有任务 (修复: 持久化存储 + 全局同步)
            const updatePercOrchestration = () => {
                // A. 生成 Roster 对象和摘要字符串
                const newRoster = {};
                const summaryParts = [];

                percState.players.forEach(p => {
                    // 找到归属该人的标签
                    const myTags = percState.tags
                        .filter(t => t.assignedTo === p.id)
                        .map(t => t.name);

                    const uniqueTags = [...new Set(myTags)];
                    const tagStr = uniqueTags.length > 0 ? ` (${uniqueTags.join(', ')})` : '';

                    newRoster[`Player_${p.id}`] = p.name;
                    summaryParts.push(`${p.name}${tagStr}`);
                });

                const finalOrchString = summaryParts.join(', ');

                // B. 更新当前正在编辑的任务 (UI显示)
                editingItem.value.roster = newRoster;
                editingItem.value.orchestration = finalOrchString;

                // C. 🟢 核心修复: 保存配置到演奏员对象 (持久化)
                const musician = settings.musicians.find(m => m.id === editingItem.value.musicianId);
                if (musician) {
                    musician.percConfig = {
                        tags: JSON.parse(JSON.stringify(percState.tags)),
                        players: JSON.parse(JSON.stringify(percState.players))
                    };
                }

                // D. 🟢 核心修复: 同步更新该演奏员的所有任务 (同步化)
                // 这样你在一个任务里分好了，其他任务卡片上的文字也会跟着变
                if (musician) {
                    // 1. 更新任务池
                    itemPool.value.forEach(item => {
                        if (item.musicianId === musician.id && (item.sessionId || 'S_DEFAULT') === currentSessionId.value) {
                            item.orchestration = finalOrchString;
                            item.roster = JSON.parse(JSON.stringify(newRoster));
                        }
                    });

                    // 2. 更新日程表
                    scheduledTasks.value.forEach(task => {
                        if (task.musicianId === musician.id && (task.sessionId || 'S_DEFAULT') === currentSessionId.value) {
                            // 注意: 日程表里的任务可能没有 roster 字段结构，主要更新 orchestration 用于显示
                            task.orchestration = finalOrchString;
                            // task.roster = ... (如果需要的话也可以存)
                        }
                    });
                }

                // E. 保存历史
                // (注意：这里如果频繁触发可能会导致历史记录过多，可以考虑加个防抖，或者只在关闭弹窗时 pushHistory)
                // pushHistory();
            };

            // 10. 监听 Modal 打开，如果是打击乐且没有数据，自动扫描
            watch(() => showEditor.value, (val) => {
                if (val && isPercussionMode.value) {
                    // 如果 Orchestration 是空的，或者看起来不像已经手动编辑过的，就自动扫描
                    if (!editingItem.value.orchestration) {
                        scanPercussionTags();
                    }
                }
            });

            // 🟢 [辅助函数] 获取带分组的完整名称 (用于搜索)
            const getNameWithGroup = (id, type) => {
                if (!id) return '';
                let list = [];
                // 根据类型获取对应列表
                if (type === 'project') list = settings.projects;
                else if (type === 'instrument') list = settings.instruments;
                else list = settings.musicians;

                // 使用 loose equality (==) 兼容字符串/数字 ID
                const item = list.find(i => i.id == id);
                // 返回 "名称 + 分组"
                return item ? `${item.name} ${item.group || ''}` : '';
            };

            // --- 🟢 搜索辅助函数 (放在 setup 内部靠前的位置) ---
            const smartMatch = (text, keyword) => {
                if (!text) return false;
                const lowerText = text.toLowerCase();
                // 1. 原文包含
                if (lowerText.includes(keyword)) return true;
                // 2. 去空格包含 (匹配英文名如 "Yi Li" -> "yili")
                if (lowerText.replace(/\s/g, '').includes(keyword)) return true;
                // 3. 拼音匹配
                if (window.pinyinPro && window.pinyinPro.match) {
                    return !!window.pinyinPro.match(text, keyword, { continuous: true });
                }
                return false;
            };

            // 🟢 [修改] 获取用于搜索的组合文本 (加入分组信息)
            const getFullSearchText = (task, groupName) => {
                // 原代码：
                // const mText = getNameById(task.musicianId, 'musician');
                // const pText = getNameById(task.projectId, 'project');
                // const iText = getNameById(task.instrumentId, 'instrument');

                // 🟢 修改后：使用 getNameWithGroup 获取带分组的文本
                const mText = getNameWithGroup(task.musicianId, 'musician');
                const pText = getNameWithGroup(task.projectId, 'project');
                const iText = getNameWithGroup(task.instrumentId, 'instrument');

                // 获取录音信息
                const info = task.recordingInfo || {};
                const infoText = [
                    info.studio, info.engineer, info.operator,
                    info.assistant, info.notes
                ].join(' ');

                // 组合所有相关文本
                return `${groupName} ${mText} ${pText} ${iText} ${task.splitTag || ''} ${infoText}`;
            };

            // 添加一个处理失焦的函数 (加一点延迟，防止点击"清除"按钮时还没触发就跑了)
            const handleSearchBlur = () => {
                // 延迟 100ms，如果只是点了清除按钮，不要立刻收回去
                setTimeout(() => {
                    // 只有当 globalSearchQuery 为空时，才收回底部
                    // 或者你可以选择：只要失焦就收回 (根据你的喜好，这里推荐只要失焦就收回)
                    isSearchFocused.value = false;

                    // 失焦时强制收起键盘
                    if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                    }
                }, 100);
            };

            const onSearchFocus = () => {
                isSearchFocused.value = true;

                // ⚡️ 强力修正: 延迟一下，等键盘弹出来那一刻，把页面按回去
                setTimeout(() => {
                    window.scrollTo(0, 0);
                    document.body.scrollTop = 0;
                }, 100);

                // 双重保险: 300ms 后再按一次 (对应某些慢速动画)
                setTimeout(() => {
                    window.scrollTo(0, 0);
                }, 300);
            };

            // 1. 开始拖拽任务 (修复版: 分割条也会避让)
            const startTrackDrag = (e, item) => {
                // A. 🛡️ 防误触检测
                if (e.target.closest('input, button, select, i.fa-trash-can, i.fa-scissors, i.fa-eraser, .cursor-pointer')) {
                    return;
                }

                if (trackDragState || dividerDragState) return;

                const isTouch = e.type === 'touchstart';
                const triggerEl = e.currentTarget; // 被拖拽的卡片
                const touch = isTouch ? e.touches[0] : e;

                const executeDrag = () => {
                    // 1. 视觉反馈：原元素彻底透明
                    triggerEl.style.setProperty('opacity', '0', 'important');

                    const rect = triggerEl.getBoundingClientRect();
                    const container = trackListContainerRef.value;
                    const initialScrollTop = container ? container.scrollTop : 0;

                    // 🟢 关键修改 1: 获取所有“可移动元素” (包含卡片 和 分割条)
                    // 注意: Tailwind 的 group/divider 类名中有斜杠，需要转义
                    const allMovableEls = Array.from(container.querySelectorAll('.track-card, .group\\/divider'));

                    // 找到自己在 DOM 中的索引 (Visual Index)
                    const domStartIndex = allMovableEls.indexOf(triggerEl);
                    if (domStartIndex === -1) return;

                    // 找到自己在 Data 数组中的索引 (Data Index)
                    const dataStartIndex = trackListData.value.items.findIndex(i => i.id === item.id);

                    // 计算所有元素的高度 (含margin)
                    const elementHeights = allMovableEls.map(el => {
                        const style = window.getComputedStyle(el);
                        return el.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
                    });

                    // 2. 创建替身
                    const ghost = triggerEl.cloneNode(true);
                    ghost.style.opacity = '1';
                    ghost.classList.remove('hover:border-white/10', 'group');
                    Object.assign(ghost.style, {
                        position: 'fixed', top: `${rect.top}px`, left: `${rect.left}px`,
                        width: `${rect.width}px`, height: `${rect.height}px`,
                        zIndex: '10000',
                        backgroundColor: isDark.value ? '#2c2c2e' : '##F4F4F5',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        transform: 'scale(1.02)',
                        transition: 'none',
                        pointerEvents: 'none',
                        borderRadius: '8px'
                    });
                    document.body.appendChild(ghost);

                    // 3. 初始化状态
                    trackDragState = {
                        item,
                        targetEl: triggerEl,
                        ghost,

                        allMovableEls,      // 🟢 存储所有元素(卡片+分割条)
                        elementHeights,     // 🟢 存储所有高度
                        itemHeight: elementHeights[domStartIndex], // 当前被拖元素的高度

                        fingerOffset: touch.clientY - rect.top,
                        lastClientY: touch.clientY,
                        lastScrollTop: initialScrollTop,
                        cumulativeDelta: 0,

                        domStartIndex,      // 初始 DOM 索引
                        virtualDomIndex: domStartIndex, // 当前视觉所在的 DOM 索引

                        dataStartIndex,     // 初始数据索引 (用于最终 splice)
                        virtualDataIndex: dataStartIndex // 当前数据所在的索引
                    };

                    window.triggerTouchHaptic('Medium');
                };

                if (isTouch) {
                    trackDragTimer = setTimeout(() => executeDrag(), 300);
                    trackDragState = { preStartX: touch.clientX, preStartY: touch.clientY };
                    window.addEventListener('touchmove', onTrackDragMove, {passive: false});
                    window.addEventListener('touchend', onTrackDragEnd);
                    window.addEventListener('touchcancel', onTrackDragEnd);
                } else {
                    e.preventDefault();
                    executeDrag();
                    window.addEventListener('mousemove', onTrackDragMove);
                    window.addEventListener('mouseup', onTrackDragEnd);
                }
            };

            // 2. 拖拽过程 (修复版: 逻辑通用化)
            const onTrackDragMove = (e) => {
                if (!trackDragState || !trackDragState.ghost) {
                    if (trackDragTimer && e.type === 'touchmove') {
                        const touch = e.touches[0];
                        const moveY = Math.abs(touch.clientY - trackDragState.preStartY);
                        if (moveY > 10) {
                            clearTimeout(trackDragTimer);
                            trackDragTimer = null;
                            trackDragState = null;
                        }
                    }
                    return;
                }

                if (e.cancelable) e.preventDefault();

                const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
                // 解构新状态变量
                const { ghost, fingerOffset, lastClientY, lastScrollTop, itemHeight, elementHeights, allMovableEls } = trackDragState;

                // A. 移动替身
                ghost.style.top = `${clientY - fingerOffset}px`;

                // B. 计算滚动增量
                const container = trackListContainerRef.value;
                const currentScrollTop = container ? container.scrollTop : 0;
                const dy = clientY - lastClientY;
                const dScroll = currentScrollTop - lastScrollTop;

                trackDragState.lastClientY = clientY;
                trackDragState.lastScrollTop = currentScrollTop;
                trackDragState.cumulativeDelta += (dy + dScroll);

                let indexChanged = false;

                // 🟢 核心修改: 使用 virtualDomIndex 和 allMovableEls 进行判断
                // 这样无论是卡片还是分割条，只要高度符合阈值，都会触发交换逻辑

                // 向下移动
                while (trackDragState.cumulativeDelta > 0) {
                    // 到底了
                    if (trackDragState.virtualDomIndex >= elementHeights.length - 1) break;

                    const nextDomIndex = trackDragState.virtualDomIndex + 1;
                    const threshold = elementHeights[nextDomIndex] / 2 + itemHeight / 2;

                    if (trackDragState.cumulativeDelta > threshold) {
                        trackDragState.cumulativeDelta -= elementHeights[nextDomIndex]; // 减去被跨越元素的高度
                        trackDragState.virtualDomIndex++;

                        // 🟢 只有跨越的是卡片时，数据索引才+1；跨越分割条时，数据索引不变
                        if (allMovableEls[nextDomIndex].classList.contains('track-card')) {
                            trackDragState.virtualDataIndex++;
                        }

                        indexChanged = true;
                    } else break;
                }

                // 向上移动
                while (trackDragState.cumulativeDelta < 0) {
                    if (trackDragState.virtualDomIndex <= 0) break;

                    const prevDomIndex = trackDragState.virtualDomIndex - 1;
                    // 计算阈值时使用上一个元素的高度
                    const threshold = elementHeights[prevDomIndex] / 2 + itemHeight / 2;

                    if (trackDragState.cumulativeDelta < -threshold) {
                        trackDragState.cumulativeDelta += elementHeights[prevDomIndex];
                        trackDragState.virtualDomIndex--;

                        // 🟢 只有跨越的是卡片时，数据索引才-1
                        if (allMovableEls[prevDomIndex].classList.contains('track-card')) {
                            trackDragState.virtualDataIndex--;
                        }

                        indexChanged = true;
                    } else break;
                }

                // C. 应用视觉变换 (对所有 allMovableEls 生效)
                if (indexChanged || true) {
                    if (indexChanged) window.triggerTouchHaptic('Light');

                    const vDomIdx = trackDragState.virtualDomIndex;
                    const domStartIdx = trackDragState.domStartIndex;

                    trackDragState.allMovableEls.forEach((el, i) => {
                        // 跳过自己
                        if (i === domStartIdx) return;

                        let translateY = 0;
                        // 逻辑与之前相同，只是现在 i 代表 DOM 索引
                        if (domStartIdx < vDomIdx) {
                            // 向下拖：中间的元素向上移
                            if (i > domStartIdx && i <= vDomIdx) translateY = -itemHeight;
                        } else if (domStartIdx > vDomIdx) {
                            // 向上拖：中间的元素向下移
                            if (i >= vDomIdx && i < domStartIdx) translateY = itemHeight;
                        }

                        el.style.transform = translateY !== 0 ? `translate3d(0, ${translateY}px, 0)` : '';
                        el.style.transition = 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)';
                    });
                }

                handleTrackListAutoScroll(clientY);
            };

            // 3. 拖拽结束 (修复版: 完美支持分割条跨越检测)
            const onTrackDragEnd = () => {
                if (trackDragTimer) {
                    clearTimeout(trackDragTimer);
                    trackDragTimer = null;
                }

                if (!trackDragState || !trackDragState.ghost) {
                    trackDragState = null;
                    window.removeEventListener('touchmove', onTrackDragMove);
                    window.removeEventListener('touchend', onTrackDragEnd);
                    window.removeEventListener('touchcancel', onTrackDragEnd);
                    return;
                }

                const { targetEl, ghost, allMovableEls, dataStartIndex, virtualDataIndex, domStartIndex, virtualDomIndex, item } = trackDragState;

                // 1. 恢复显示 & 清理
                if (targetEl) targetEl.style.opacity = '';
                if (ghost && document.body.contains(ghost)) document.body.removeChild(ghost);

                allMovableEls.forEach(el => {
                    el.style.transform = '';
                    el.style.transition = '';
                });
                stopTrackListAutoScroll();

                // 🟢 关键修改: 只要视觉位置变了(跨越了分割条) OR 数据位置变了，都要处理
                if (domStartIndex !== virtualDomIndex || dataStartIndex !== virtualDataIndex) {
                    const items = trackListData.value.items;

                    // A. 执行数据移动 (如果跨越了其他任务)
                    // 注意：如果只跨越了分割条，virtualDataIndex 可能等于 dataStartIndex，此时数组不需变动
                    if (dataStartIndex !== virtualDataIndex) {
                        items.splice(dataStartIndex, 1);
                        items.splice(virtualDataIndex, 0, item);
                    }

                    // B. 计算新的 SectionIndex (核心修复逻辑)
                    // 我们需要模拟一下 DOM 移动后的状态，看看“我的头上是谁”
                    const tempDomArray = [...allMovableEls];
                    const movedEl = tempDomArray.splice(domStartIndex, 1)[0];
                    tempDomArray.splice(virtualDomIndex, 0, movedEl);

                    const prevEl = tempDomArray[virtualDomIndex - 1]; // 我上面的元素

                    if (prevEl && prevEl.id && prevEl.id.startsWith('sec-divider-')) {
                        // 🟢 情况1: 头上是分割条 -> 说明我被拖到了该分割条的下方 -> 继承该分割条的 Section
                        // ID 格式为 "sec-divider-2"，取出最后的数字
                        const newSection = parseInt(prevEl.id.replace('sec-divider-', ''));
                        item.sectionIndex = newSection;
                    } else {
                        // 🟢 情况2: 头上是普通任务 或 没东西(在顶部) -> 走标准继承逻辑
                        if (items.length > 1) {
                            let newSectionIndex = 0;

                            if (virtualDataIndex === 0) {
                                // 如果插在队首，尝试继承原来队首(现在是老二)的 section
                                // (防止队首就是 section 0 的情况)
                                newSectionIndex = items[1].sectionIndex;
                            } else {
                                // 否则继承前一个任务的 section
                                newSectionIndex = items[virtualDataIndex - 1].sectionIndex;
                            }
                            item.sectionIndex = newSectionIndex;
                        }
                    }

                    // 保存 & 反馈
                    pushHistory();
                    window.triggerTouchHaptic('Success');

                    // 强制重新排序以刷新分割条位置 (Vue 响应式有时候需要这一下)
                    // autoSortTrackList();
                }

                trackDragState = null;

                window.removeEventListener('touchmove', onTrackDragMove);
                window.removeEventListener('touchend', onTrackDragEnd);
                window.removeEventListener('touchcancel', onTrackDragEnd);
                window.removeEventListener('mousemove', onTrackDragMove);
                window.removeEventListener('mouseup', onTrackDragEnd);
            };

            // 🟢 [重写] 过滤日程 (修复搜索定位问题)
            const filteredScheduledTasks = computed(() => {
                const rawQuery = globalSearchQuery.value.trim().toLowerCase();
                if (!rawQuery) return scheduledTasks.value;

                const statusDefinitions = {
                    '完成': ['completed'], 'finished': ['completed'],
                    '进行中': ['in-progress'], 'ing': ['in-progress'],
                    '缺时': ['insufficient'], 'missing': ['insufficient'],
                    '已排': ['full', 'completed'], 'full': ['full', 'completed']
                };

                const textKeywords = [];
                const statusFilters = new Set();

                // 解析搜索词 (分离状态关键词和文本关键词)
                rawQuery.split(/\s+/).filter(k => k).forEach(inputWord => {
                    let isStatus = false;
                    for (const [key, statuses] of Object.entries(statusDefinitions)) {
                        if (key.includes(inputWord) || inputWord.includes(key)) {
                            statuses.forEach(s => statusFilters.add(s));
                            isStatus = true;
                            break;
                        }
                    }
                    if (!isStatus) textKeywords.push(inputWord);
                });

                // 智能匹配函数
                const smartMatch = (text, keyword) => {
                    if (!text) return false;
                    const lowerText = text.toLowerCase();
                    if (lowerText.includes(keyword)) return true;
                    if (lowerText.replace(/\s/g, '').includes(keyword)) return true;
                    if (window.pinyinPro && window.pinyinPro.match) {
                        return !!window.pinyinPro.match(text, keyword, { continuous: true });
                    }
                    return false;
                };

                // 🟢 [核心修复] 状态检查逻辑
                const checkTaskStatus = (task) => {
                    // 1. 如果没有指定状态过滤 (只搜文字)，直接放行！
                    // 这样避免了"在项目视图搜不到乐器任务"的问题
                    if (statusFilters.size === 0) return true;

                    // 2. 如果有状态过滤，才去检查侧边栏的统计状态
                    let targetList = musicianStats.value;
                    let targetId = task.musicianId;

                    if (sidebarTab.value === 'project') {
                        targetList = projectStats.value;
                        targetId = task.projectId;
                    }
                    else if (sidebarTab.value === 'instrument') {
                        targetList = instrumentStats.value;
                        targetId = task.instrumentId;
                    }

                    if (!targetId) return false;
                    const statItem = targetList.find(s => s.id === targetId);
                    if (!statItem) return false;

                    return statusFilters.has(statItem.statusKey);
                };

                const scheduleSectionMap = new Map();
                const groups = {};
                // ... (分组逻辑保持不变) ...
                scheduledTasks.value.forEach(t => {
                    const sess = t.sessionId || 'S_DEFAULT';
                    let key = '';
                    if (t.musicianId) key = `M|${t.musicianId}`;
                    else if (t.projectId) key = `P|${t.projectId}`;
                    else if (t.instrumentId) key = `I|${t.instrumentId}`;
                    const fullKey = `${sess}|${key}`;
                    if (!groups[fullKey]) groups[fullKey] = [];
                    groups[fullKey].push(t);
                });
                Object.values(groups).forEach(group => {
                    group.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
                    group.forEach((t, index) => {
                        scheduleSectionMap.set(t.scheduleId, index);
                    });
                });

                return scheduledTasks.value.filter(task => {
                    const sess = task.sessionId || 'S_DEFAULT';

                    // 1. 检查状态过滤器
                    if (!checkTaskStatus(task)) return false;

                    // 2. 如果没有文本关键词，直接返回
                    if (textKeywords.length === 0) return true;

                    // 🟢 [核心修复] 使用全局 getNameWithGroup 获取所有相关文本
                    // 确保项目名、乐器名、人员名都被纳入搜索范围
                    const selfText = [
                        getNameWithGroup(task.musicianId, 'musician'),
                        getNameWithGroup(task.projectId, 'project'),
                        getNameWithGroup(task.instrumentId, 'instrument'),
                        task.recordingInfo?.studio,
                        task.recordingInfo?.engineer,
                        task.recordingInfo?.notes
                    ].join(' ');

                    // 自身匹配
                    if (textKeywords.every(k => smartMatch(selfText, k))) return true;

                    // 子项匹配 (聚合任务)
                    let subItems = [];
                    if (task.templateId) {
                        const exactItem = itemPool.value.find(i => i.id === task.templateId);
                        if (exactItem) subItems.push(exactItem);
                    } else {
                        const mySectionIndex = scheduleSectionMap.get(task.scheduleId);
                        subItems = itemPool.value.filter(i => {
                            if ((i.sessionId || 'S_DEFAULT') !== sess) return false;
                            let idMatch = false;
                            if (task.musicianId) idMatch = (i.musicianId === task.musicianId);
                            else if (task.projectId) idMatch = (i.projectId === task.projectId);
                            else if (task.instrumentId) idMatch = (i.instrumentId === task.instrumentId);
                            if (!idMatch) return false;
                            const itemIdx = i.sectionIndex !== undefined ? i.sectionIndex : 0;
                            return itemIdx === mySectionIndex;
                        });
                    }

                    return subItems.some(sub => {
                        const itemText = [
                            getNameWithGroup(sub.projectId, 'project'),
                            getNameWithGroup(sub.instrumentId, 'instrument'),
                            getNameWithGroup(sub.musicianId, 'musician'),
                            sub.splitTag,
                            sub.recordingInfo?.notes
                        ].join(' ');
                        const combinedText = itemText + ' ' + selfText;
                        return textKeywords.every(k => smartMatch(combinedText, k));
                    });
                });
            });

            // 🟢 [简化] 侧边栏列表 (过滤逻辑已移至 core stats calculation)
            const filteredSidebarList = computed(() => {
                // 直接返回计算好的结果，它们已经是响应式且过滤过的了
                if (sidebarTab.value === 'project') return projectStats.value;
                if (sidebarTab.value === 'instrument') return instrumentStats.value;
                return musicianStats.value;
            });

            // 🟢 [修改] 搜索回车跳转逻辑 (支持循环定位)
            const handleSearchEnter = () => {
                const tasks = filteredScheduledTasks.value; // 获取所有匹配的任务

                if (tasks.length > 0) {
                    // 1. 确保按时间顺序排列 (从早到晚，跨天优先按日期)
                    const sorted = [...tasks].sort((a, b) => {
                        if (a.date !== b.date) return a.date.localeCompare(b.date);
                        return a.startTime.localeCompare(b.startTime);
                    });

                    // 2. 安全检查: 防止索引越界 (比如刚才删了一个任务)
                    if (currentSearchIndex.value >= sorted.length) {
                        currentSearchIndex.value = 0;
                    }

                    // 3. 获取目标任务
                    const target = sorted[currentSearchIndex.value];

                    // 4. 执行跳转
                    smartScrollToTask(target);
                    window.triggerTouchHaptic('Success');

                    // 5. 计算下一次的索引 (取模实现循环: 0 -> 1 -> 2 -> 0 ...)
                    const nextIndex = (currentSearchIndex.value + 1) % sorted.length;
                    currentSearchIndex.value = nextIndex;

                    // (可选) 可以在控制台打印一下，方便调试
                    // console.log(`Searching: Jumping to ${currentSearchIndex.value + 1} / ${sorted.length}`);

                } else {
                    // 如果日程表里没有，检查一下侧边栏有没有
                    const sidebarItems = filteredSidebarList.value;
                    if (sidebarItems.length > 0) {
                        openAlertModal("查找结果", "日程表中未找到匹配项，但在任务池(Sidebar)中找到了相关任务。");
                    } else {
                        window.triggerTouchHaptic('Error');
                    }
                }
            };

            const showRecInfoModal = ref(false);
            const recInfoForm = reactive({
                studio: '',
                engineer: '',
                operator: '',
                assistant: '', // 🟢 新增
                notes: ''
            });

            const openRecInfoModal = () => {
                const task = trackListData.value.taskRef;
                if (!task) return;

                // 判断当前模式 (根据侧边栏 Tab)
                const isEditMode = sidebarTab.value === 'project';

                // 如果是编辑模式，读 editInfo；否则读 recordingInfo
                const info = isEditMode ? (task.editInfo || {}) : (task.recordingInfo || {});

                recInfoForm.studio = info.studio || '';
                recInfoForm.engineer = info.engineer || ''; // 这里可能是 Edit Engineer
                recInfoForm.operator = info.operator || '';
                recInfoForm.assistant = info.assistant || '';
                recInfoForm.notes = info.notes || '';

                showRecInfoModal.value = true;
            };

            // 保存录音信息
            const saveRecInfo = () => {
                const task = trackListData.value.taskRef;
                if (!task) return;

                const isEditMode = sidebarTab.value === 'project';

                const newData = {
                    studio: recInfoForm.studio.trim(),
                    engineer: recInfoForm.engineer.trim(),
                    operator: recInfoForm.operator.trim(),
                    assistant: recInfoForm.assistant.trim(),
                    notes: recInfoForm.notes.trim()
                };

                if (isEditMode) {
                    task.editInfo = newData; // ✅ 存入编辑信息
                } else {
                    task.recordingInfo = newData; // ✅ 存入录音信息
                }

                // 强制更新视图
                const idx = scheduledTasks.value.findIndex(t => t.scheduleId === task.scheduleId);
                if (idx !== -1) {
                    scheduledTasks.value[idx] = { ...task };
                }

                pushHistory();
                window.triggerTouchHaptic('Success');
                showRecInfoModal.value = false;
            };

            watch(globalSearchQuery, () => {
                currentSearchIndex.value = 0;
            });

            const savedSidebarState = storageService.getItem('musche_sidebar_open');
            // 🟢 修改: 默认为 true (打开状态)
            const isSidebarOpen = ref(savedSidebarState !== null ? JSON.parse(savedSidebarState) : true);
            // 3. 监听变化并自动保存 (记忆功能)
            watch([isSidebarOpen, sidebarWidth], ([open, width]) => {
                storageService.setItem('musche_sidebar_open', open);
                storageService.setItem('musche_sidebar_width', width);
            });

            // 🟢 新增: 当鼠标进入输入框，临时禁止父级拖拽 (解决无法选中文本的问题)
            const disableRowDrag = (e) => {
                const row = e.target.closest('.group\\/item'); // 查找父级行
                if (row) {
                    row.setAttribute('draggable', 'false');
                    row.style.cursor = 'text'; // 强制显示文本光标
                }
            };

            // 🟢 新增: 当鼠标离开输入框，恢复父级拖拽
            const enableRowDrag = (e) => {
                const row = e.target.closest('.group\\/item');
                if (row) {
                    row.setAttribute('draggable', 'true');
                    row.style.cursor = ''; // 恢复默认光标
                }
            };

            // ----------------------------------------------------------------
            // 🟢 新增: 1. 定义电脑端引导步骤
            // ----------------------------------------------------------------
            const desktopSteps = [
                {
                    // 1. 欢迎
                    popover: {
                        title: '欢迎使用 Musche',
                        description: '这是一款专为音乐人设计的智能排程工具。<br>已为您预设了演示数据，让我们花 1 分钟了解核心流程。',
                        align: 'center'
                    }
                },
                {
                    // 2. Session
                    element: '#tour-session-select',
                    popover: {
                        title: '日程切换 (Session)',
                        description: '这是“档期管理器”。<br>您可以新建不同的录音档期（如“2025春季录音”），并在此切换。',
                        side: "bottom"
                    }
                },
                {
                    // 3. 侧边栏整体
                    element: '#sidebar',
                    popover: {
                        title: '任务池 (Pool)',
                        description: '这里存放所有待排程的资源。<br>点击顶部的 <b>人员/项目/乐器</b> 标签可切换不同维度的分组显示。',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    // 4. 具体的统计卡片 (原侧边栏Guide的内容)
                    element: '#tour-first-stat-card',
                    popover: {
                        title: '任务卡片',
                        description: `
                    这是具体的待排程对象（如 Musician A）。
                    <br>🟢 <b>绿色</b>：已排期
                    <br>🔴 <b>红色</b>：缺时 (需增加排期)
                    <br>🔵 <b>蓝色</b>：录制完成
                    <br>🟠 <b>橙色</b>：进行中
                    <hr style="margin:8px 0; opacity:0.2">
                    <b>长按拖拽</b>：直接将卡片拖到右侧日程表中。
                    <br><b>点击卡片</b>：展开查看具体的曲目列表。
                `,
                        side: "right",
                        align: 'center'
                    }
                },
                {
                    // 5. 新建按钮
                    element: '#tour-new-task',
                    popover: {
                        title: '添加任务',
                        description: '点击这里录入新的人员、乐器或项目。<br>支持手动输入或 CSV 批量导入。',
                        side: "bottom"
                    }
                },
                {
                    // 6. 主日程
                    element: '#main-content',
                    popover: {
                        title: '日程表 (Schedule)',
                        description: `
                    主工作台，支持<b>周/月</b>视图切换。
                    <br>已为您在“今天”创建了一个演示日程。
                    <hr style="margin:8px 0; opacity:0.2">
                    <b>双击日程块</b>：打开 TrackList 详情页，可记录实际录音时间、拆分任务或自动计算效率倍率。
                `,
                        side: "left",
                        align: 'center'
                    }
                },
                {
                    // 7. 视图切换
                    element: '#tour-view-switch',
                    popover: {
                        title: '视图切换',
                        description: '<b>周视图</b>：精确到分钟的排程操作。<br><b>月视图</b>：宏观查看每日安排和空档。',
                        side: "bottom"
                    }
                },
                {
                    // 8. 同步
                    element: '#tour-sync-btn',
                    popover: {
                        title: '云端同步',
                        description: '登录账号后，数据将自动保存到云端，支持多设备协作。',
                        side: "bottom"
                    }
                }
            ];

            // ----------------------------------------------------------------
            // 🟢 新增: 2. 定义手机端引导步骤 (适配 Mobile UI)
            // ----------------------------------------------------------------
            const mobileSteps = [
                {
                    popover: {
                        title: '欢迎使用 Musche',
                        description: '专为移动端优化的排程体验。<br>支持手势操作和快速记录。',
                        align: 'center'
                    }
                },
                {
                    element: '#tour-session-select',
                    popover: {
                        title: '切换档期',
                        description: '点击顶部切换不同的录音 Session。',
                        side: "bottom"
                    }
                },
                {
                    element: '#main-content',
                    popover: {
                        title: '日程表与手势',
                        description: `
                            <b>长按</b>：进入拖拽模式。
                            <br><b>双击</b>：打开详情页记录时间。
                            <br><b>左右滑动</b>：切换日期 (日程表) 或 切换分类 (任务池)。
                        `,
                        align: 'center'
                    }
                },
                {
                    element: '.mobile-header-nav',
                    popover: {
                        title: '日期导航',
                        description: '左右滑动屏幕，或点击这里切换日期。',
                        side: "bottom"
                    }
                },
                {
                    // 7. 视图切换
                    element: '#tour-view-switch',
                    popover: {
                        title: '视图切换',
                        description: '<b>周视图</b>：精确到分钟的排程操作。<br><b>月视图</b>：宏观查看每日安排和空档。',
                        side: "bottom"
                    }
                },
                {
                    element: '.mobile-tab-bar',
                    popover: {
                        title: '底部导航',
                        description: '<b>核心功能区</b>：<br><b>任务池</b>：查看待排任务<br><b>添加</b>：快速新建<br><b>日程表</b>：查看当前安排',
                        side: "top"
                    }
                },
                // --- 🟢 修改点：插入任务池介绍步骤，并自动切换视图 ---
                {
                    element: '#sidebar', // 目标元素：侧边栏容器
                    popover: {
                        title: '任务池 (Task Pool)',
                        description: '这里存放所有待排程的资源。<br>点击上方标签可切换 <b>人员/项目/乐器</b>。<br><b>长按卡片</b>即可拖拽到日程表中。',
                        side: "top",
                        align: 'center'
                    },
                    // 🚀 核心逻辑：进入此步骤时，强制切换到 Pool 视图
                    onHighlightStarted: () => {
                        mobileTab.value = 'pool';
                        showMobileTaskInput.value = false; // 确保添加弹窗关闭
                        // 稍微滚动一下侧边栏确保有动感 (可选)
                        if(sidebarScrollRef.value) sidebarScrollRef.value.scrollTop = 0;
                    }
                },
                {
                    // 4. 具体的统计卡片 (原侧边栏Guide的内容)
                    element: '#tour-first-stat-card',
                    popover: {
                        title: '任务卡片',
                        description: `
                    这是具体的待排程对象（如 Musician A）。
                    <br>🟢 <b>绿色</b>：已排期
                    <br>🔴 <b>红色</b>：缺时 (需增加排期)
                    <br>🔵 <b>蓝色</b>：录制完成
                    <br>🟠 <b>橙色</b>：进行中
                    <hr style="margin:8px 0; opacity:0.2">
                    <b>长按拖拽</b>：直接将卡片拖到右侧日程表中。
                    <br><b>点击卡片</b>：展开查看具体的曲目列表。
                `,
                        side: "right",
                        align: 'center'
                    }
                },
                {
                    // 5. 新建按钮
                    element: '#tour-new-task',
                    popover: {
                        title: '添加任务',
                        description: '点击这里录入新的人员、乐器或项目。<br>支持手动输入或 CSV 批量导入。',
                        side: "bottom"
                    }
                },
                // ----------------------------------------------------
                {
                    // 8. 同步
                    element: '#tour-sync-btn',
                    popover: {
                        title: '云端同步',
                        description: '登录账号后，数据将自动保存到云端，支持多设备协作。',
                        side: "bottom"
                    },
                    // 🚀 核心逻辑：离开任务池介绍后，切回日程表视图，以便正确高亮 #main-content
                    onHighlightStarted: () => {
                        mobileTab.value = 'schedule';
                    }
                }
            ];

            // ----------------------------------------------------------------
            // 🟢 新增: 3. 初始化 Driver 实例 (空配置)
            // ----------------------------------------------------------------
            const driverObj = window.driver.js.driver({
                showProgress: true,
                animate: true,
                allowClose: true,
                doneBtnText: '开始使用',
                nextBtnText: '下一步',
                prevBtnText: '上一步',
            });

            // ----------------------------------------------------------------
            // 🟢 新增: 4. 智能启动函数 (根据屏幕判断)
            // ----------------------------------------------------------------
            const startTour = () => {
                // 确保之前可能存在的侧边栏引导标记不干扰
                storageService.removeItem('musche_sidebar_tour_seen');

                if (window.innerWidth < 800) {
                    // === 📱 手机模式 ===

                    // 1. 强制切换到底部导航的“日程表”视图，确保界面整洁
                    mobileTab.value = 'schedule';
                    showMobileTaskInput.value = false;

                    // 2. 设置手机版剧本
                    driverObj.setConfig({ steps: mobileSteps });

                    // 3. 直接播放
                    driverObj.drive();
                } else {
                    // === 💻 电脑模式 ===

                    // 1. 强制展开侧边栏，确保元素可见
                    isSidebarOpen.value = true;

                    // 2. 设置电脑版剧本
                    driverObj.setConfig({ steps: desktopSteps });

                    // 3. 延迟播放，等待侧边栏动画展开
                    setTimeout(() => {
                        driverObj.drive();
                    }, 400);
                }

                // 标记已读
                storageService.setItem('musche_tour_seen', 'true');
            };

            // 🟢 修复: 简化的侧边栏切换 (不再包含引导逻辑)
            const toggleSidebar = () => {
                isSidebarOpen.value = !isSidebarOpen.value;
            };

            const splitState = reactive({
                task: null,        // 目标任务
                totalSec: 0,       // 总时长(秒)
                splitPoint: 0,     // 分割点(秒)，即 Part 1 的时长
                part1Str: '00:00', // 显示用
                part2Str: '00:00'  // 显示用
            });

            // 🟢 [增强版] 检查是否允许拆分 (自动寻找并提示最后一个 Part)
            const checkCanSplit = (item) => {
                // 1. 检查是否有直接子节点
                const directChild = itemPool.value.find(t => t.splitFromId === item.id);

                if (directChild) {
                    // 2. 如果有孩子，说明当前不是末端。开始顺藤摸瓜找“孙子”...直到找到最后一代
                    let lastNode = directChild;
                    // 为了防止死循环（虽然逻辑上不应该出现），加个最大深度的安全限制
                    let safeGuard = 0;

                    while (safeGuard < 100) {
                        const nextChild = itemPool.value.find(t => t.splitFromId === lastNode.id);
                        if (nextChild) {
                            lastNode = nextChild; // 还有下一代，继续往下找
                        } else {
                            break; // 没有下一代了，lastNode 就是链条末端
                        }
                        safeGuard++;
                    }

                    // 3. 获取末端节点的名称 (优先显示 splitTag，如 "Part 3")
                    const targetName = lastNode.splitTag || '最后一个部分';

                    openAlertModal(
                        '禁止拆分',
                        `当前任务已进行过拆分（存在后续 Part），\n请寻找【${targetName}】进行拆分。`
                    );
                    window.triggerTouchHaptic('Error');
                    return false;
                }
                return true;
            };

            // 🟢 [修改版] 打开拆分滑块
            const openSplitSlider = (item) => {
                // 1. 🔍 新增：父级检查
                if (!checkCanSplit(item)) return;

                const totalMusicStr = item.musicDuration;
                if (!totalMusicStr || totalMusicStr === '00:00') {
                    return openAlertModal('无法拆分', '该曲目没有设置谱面时长。');
                }

                splitState.task = item;
                splitState.totalSec = parseTime(totalMusicStr);

                // 默认从一半开始
                splitState.splitPoint = Math.floor(splitState.totalSec / 2);

                updateSplitStrings();
                showSplitModal.value = true;
            };

            // 2. 滑块拖动时更新文字
            const onSplitSliderInput = () => {
                updateSplitStrings();
                // 拖动时给一点轻微震动反馈 (节流)
                window.triggerTouchHaptic('Light');
            };

            const updateSplitStrings = () => {
                const p1 = splitState.splitPoint;
                const p2 = splitState.totalSec - splitState.splitPoint;
                splitState.part1Str = formatSecs(p1);
                splitState.part2Str = formatSecs(p2);
            };

            // 🟢 [修复版] 确认拆分 (修复：建立链式父子关系，支持逐级归还)
            const confirmSplitSlider = () => {
                const item = splitState.task;
                const doneStr = splitState.part1Str;
                const remainingStr = splitState.part2Str;

                if (splitState.splitPoint <= 0 || splitState.splitPoint >= splitState.totalSec) {
                    return openAlertModal('无效拆分', '请拖动滑块选择一个中间的时间点。');
                }

                // 1. 智能计算 Part 编号
                let baseNum = 1;
                if (item.splitTag) {
                    const match = String(item.splitTag).match(/Part\s*(\d+)/i);
                    if (match && match[1]) baseNum = parseInt(match[1], 10);
                }

                // A. 更新当前任务 (变为父级)
                item.musicDuration = doneStr;
                item.splitTag = `Part ${baseNum}`;

                // B. 创建新任务 (变为子级)
                const newRatio = item.ratio || 20;
                const newEst = calculateEstTime(remainingStr, newRatio);

                const newTask = {
                    id: generateUniqueId('T'),

                    // 🚩 核心修复：始终指向当前 item 为父级，建立 Part 1 -> Part 2 -> Part 3 的链条
                    // 原代码的 `|| item.splitFromId` 会导致扁平化，跳过中间层级
                    splitFromId: item.id,

                    splitTag: `Part ${baseNum + 1}`,
                    sessionId: item.sessionId || currentSessionId.value,
                    projectId: item.projectId,
                    instrumentId: item.instrumentId,
                    musicianId: item.musicianId,
                    musicDuration: remainingStr,
                    ratio: newRatio,
                    estDuration: newEst,
                    group: item.group || '',
                    recordingInfo: item.recordingInfo ? JSON.parse(JSON.stringify(item.recordingInfo)) : {},
                    // 🟢【在此处添加修复代码】复制编制和名单
                    orchestration: item.orchestration || '',
                    roster: item.roster ? JSON.parse(JSON.stringify(item.roster)) : {}
                };

                ensureItemRecords(newTask);
                itemPool.value.push(newTask);

                // --- C. 自动排期逻辑 ---
                if (showTrackList.value && trackListData.value.schedules) {
                    const currentIdx = trackListData.value.currentSectionIndex;
                    const currentSchedule = trackListData.value.schedules[currentIdx];
                    const nextSchedule = trackListData.value.schedules[currentIdx + 1];

                    // 1. 存在下一个日程 -> 直接加入
                    if (nextSchedule) {
                        newTask.sectionIndex = currentIdx + 1;
                    }
                    // 2. 没有下一个日程 -> 紧接当前日程新建一个
                    else if (currentSchedule) {
                        const startMins = timeToMinutes(currentSchedule.startTime);
                        const durMins = parseTime(currentSchedule.estDuration) / 60;
                        const endMins = startMins + durMins;

                        const h = Math.floor(endMins / 60);
                        const m = Math.floor(endMins % 60);
                        const newStartStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

                        const scheduleEntry = {
                            scheduleId: Date.now(),
                            templateId: newTask.id,
                            sessionId: currentSessionId.value,
                            musicianId: currentSchedule.musicianId ? newTask.musicianId : '',
                            projectId: currentSchedule.projectId ? newTask.projectId : '',
                            instrumentId: currentSchedule.instrumentId ? newTask.instrumentId : '',
                            date: currentSchedule.date,
                            startTime: newStartStr,
                            estDuration: newTask.estDuration,
                            trackCount: 0,
                            ratio: newTask.ratio,
                            musicDuration: newTask.musicDuration,
                            reminderMinutes: 15,
                            sound: 'default'
                        };
                        scheduledTasks.value.push(scheduleEntry);
                        newTask.sectionIndex = currentIdx + 1;
                        trackListData.value.schedules.push(scheduleEntry);
                        trackListData.value.totalSections++;
                    } else {
                        newTask.sectionIndex = 0;
                    }

                    trackListData.value.items.push(newTask);
                    autoSortTrackList();
                }

                pushHistory();
                window.triggerTouchHaptic('Success');
                if (item.musicianId) autoUpdateEfficiency(item.musicianId, 'musician', false);

                showSplitModal.value = false;
            };

            // 🟢 [修改版] 拆分任务 (输入时长版 - 如果你还保留着这个备用函数的话)
            const splitTrack = (item) => {
                // 1. 🔍 新增：父级检查
                if (!checkCanSplit(item)) return;

                const totalMusicStr = item.musicDuration;
                if (!totalMusicStr || totalMusicStr === '00:00') {
                    return openAlertModal('无法拆分', '该曲目没有设置谱面时长。');
                }

                openInputModal(
                    '拆分任务 (留待下次)',
                    '',
                    '请输入 剩余 谱面时长 (例如 01:30)',
                    (remainingStr) => {
                        // ... (原有的确认逻辑保持不变)
                        if (!/^\d{1,2}:\d{2}$/.test(remainingStr)) {
                            return openAlertModal('格式错误', '请输入正确的时间格式 (MM:SS)');
                        }

                        // ... (后续代码不用动，只要开头拦住即可)
                        // ...

                        // 既然你在这个函数里有一大段逻辑，为了完整性，这里简略表示：
                        // 这里直接调用 confirmSplitSlider 的核心逻辑或者保留你之前的逻辑
                        // 重点是上面的 if (!checkCanSplit(item)) return;

                        // 下面是原有的核心逻辑复述，确保你替换时不会丢代码：
                        const totalSec = parseTime(totalMusicStr);
                        const remainSec = parseTime(remainingStr);

                        if (remainSec <= 0 || remainSec >= totalSec) {
                            return openAlertModal('数值错误', '剩余时长必须小于总时长且大于0。');
                        }

                        const doneSec = totalSec - remainSec;
                        const doneStr = formatSecs(doneSec);

                        let baseNum = 1;
                        if (item.splitTag) {
                            const match = String(item.splitTag).match(/Part\s*(\d+)/i);
                            if (match && match[1]) baseNum = parseInt(match[1], 10);
                        }

                        item.musicDuration = doneStr;
                        item.splitTag = `Part ${baseNum}`;

                        const newRatio = item.ratio || 20;
                        const newEst = calculateEstTime(remainingStr, newRatio);

                        const newTask = {
                            id: generateUniqueId('T'),
                            splitFromId: item.id, // 链式指向
                            splitTag: `Part ${baseNum + 1}`,
                            sessionId: item.sessionId || currentSessionId.value,
                            projectId: item.projectId,
                            instrumentId: item.instrumentId,
                            musicianId: item.musicianId,
                            musicDuration: remainingStr,
                            ratio: newRatio,
                            estDuration: newEst,
                            group: item.group || '',
                            recordingInfo: item.recordingInfo ? JSON.parse(JSON.stringify(item.recordingInfo)) : {},
                            // 🟢【在此处添加修复代码】
                            orchestration: item.orchestration || '',
                            roster: item.roster ? JSON.parse(JSON.stringify(item.roster)) : {}
                        };
                        ensureItemRecords(newTask);
                        itemPool.value.push(newTask);

                        // 自动排期逻辑
                        if (showTrackList.value && trackListData.value.schedules) {
                            const currentIdx = trackListData.value.currentSectionIndex;
                            const currentSchedule = trackListData.value.schedules[currentIdx];
                            const nextSchedule = trackListData.value.schedules[currentIdx + 1];
                            if (nextSchedule) {
                                newTask.sectionIndex = currentIdx + 1;
                            } else if (currentSchedule) {
                                const startMins = timeToMinutes(currentSchedule.startTime);
                                const durMins = parseTime(currentSchedule.estDuration) / 60;
                                const endMins = startMins + durMins;
                                const h = Math.floor(endMins / 60);
                                const m = Math.floor(endMins % 60);
                                const newStartStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                                const scheduleEntry = {
                                    scheduleId: Date.now(),
                                    templateId: newTask.id,
                                    sessionId: currentSessionId.value,
                                    musicianId: currentSchedule.musicianId ? newTask.musicianId : '',
                                    projectId: currentSchedule.projectId ? newTask.projectId : '',
                                    instrumentId: currentSchedule.instrumentId ? newTask.instrumentId : '',
                                    date: currentSchedule.date,
                                    startTime: newStartStr,
                                    estDuration: newTask.estDuration,
                                    trackCount: 0,
                                    ratio: newTask.ratio,
                                    musicDuration: newTask.musicDuration
                                };
                                scheduledTasks.value.push(scheduleEntry);
                                newTask.sectionIndex = currentIdx + 1;
                                trackListData.value.schedules.push(scheduleEntry);
                                trackListData.value.totalSections++;
                            } else {
                                newTask.sectionIndex = 0;
                            }
                            trackListData.value.items.push(newTask);
                            autoSortTrackList();
                        }

                        pushHistory();
                        window.triggerTouchHaptic('Success');
                        if (item.musicianId) autoUpdateEfficiency(item.musicianId, 'musician', false);
                    },
                    `总长 ${totalMusicStr}。`
                );
            };

            // 🟢 [重写] 归还时间 (无限链式版：逐级归还 + 标签智能清理)
            const restoreSplitTime = (taskInput) => {
                // 1. 获取最新的 Live 对象 (因为传入的可能是弹窗里的副本)
                const taskToDelete = itemPool.value.find(i => i.id === taskInput.id);

                // 如果找不到父级，说明它是根节点，直接返回
                if (!taskToDelete || !taskToDelete.splitFromId) return;

                // 2. 找到直接父级 (上一环)
                const parent = itemPool.value.find(i => i.id === taskToDelete.splitFromId);
                if (!parent) return;

                // 3. 执行时间归还 (合并时长)
                const parentSec = parseTime(parent.musicDuration);
                const childSec = parseTime(taskToDelete.musicDuration);

                if (parentSec > 0 && childSec > 0) {
                    const newTotal = formatSecs(parentSec + childSec);
                    parent.musicDuration = newTotal;

                    // 🟢 4. 链条修补 (把孙子过继给爷爷)
                    // 如果我删的是 Part 2，且 Part 2 后面还有 Part 3
                    // 我们必须把 Part 3 的父亲改成 Part 1 (即当前的 parent)
                    const orphans = itemPool.value.filter(i => i.splitFromId === taskToDelete.id);
                    if (orphans.length > 0) {
                        orphans.forEach(orphan => {
                            orphan.splitFromId = parent.id;
                        });
                    }

                    // 🟢 5. 标签清理逻辑
                    // 规则：只有当父级是【绝对根节点】且【没有其他孩子】时，才清除标签。
                    // 如果父级本身也是个 Part (有 splitFromId)，说明我们在合并中间层级，父级标签必须保留。

                    const isParentAlsoChild = !!parent.splitFromId;

                    if (isParentAlsoChild) {
                        // === 情况 A: 父级是中间节点 (如 Part 2) ===
                        // 合并后它还是 Part 2，只是时间变长了，标签保留
                        openAlertModal(
                            '时间已归还',
                            `当前任务已逐级合并回上一层 (${parent.splitTag})。`
                        );
                    } else {
                        // === 情况 B: 父级是根节点 (Part 1 / Source) ===
                        // 检查根节点名下是否还有其他分身
                        const hasChildren = itemPool.value.some(i =>
                            i.id !== taskToDelete.id && // 排除当前正在删的
                            i.splitFromId === parent.id // 检查是否还有其他孩子
                        );

                        if (!hasChildren) {
                            // 真的没孩子了，彻底自由，清除 Part 1 标签
                            delete parent.splitTag;
                            openAlertModal(
                                '合并完成',
                                `拆分任务已全部合并回原任务。\n现有时长: ${newTotal}`
                            );
                        } else {
                            // 还有孩子 (比如删了 Part 2，但 Part 3 被过继过来了)
                            // 此时根节点仍需保留 "Part 1" 标签
                            openAlertModal(
                                '时间已归还',
                                `时间已合并回 Part 1。\n(标签保留，因为仍有后续部分存在)`
                            );
                        }
                    }

                    window.triggerTouchHaptic('Success');
                }
            };

            // --- 🟢 新增：自定义颜色选择器逻辑 ---
            const showColorPickerModal = ref(false);
            const colorPickerTarget = ref(null); // 当前正在编辑的对象 { item, type }
            const tempColor = ref('');           // 临时颜色，确认后才应用

            // 🟢 修复: 隔离坐标状态，防止切换时位置跳动
            const inputRects = reactive({
                name: { top: 0, left: 0, width: 0, height: 0 },
                group: { top: 0, left: 0, width: 0, height: 0 }
            });

            // 更新坐标 (增加 kind 参数: 'name' | 'group')
            const updateInputRect = (e, kind) => {
                const wrapperClass = kind === 'name' ? '.settings-name-wrapper' : '.settings-group-wrapper';
                const el = e.target.closest(wrapperClass);
                if (el) {
                    const r = el.getBoundingClientRect();
                    inputRects[kind] = { top: r.top, left: r.left, width: r.width, height: r.height };
                }
            };

            // 🟢 动态计算样式 (根据 kind 获取各自的坐标)
            const getFloatingStyle = (kind) => {
                const rect = inputRects[kind]; // 获取各自独立的坐标
                const windowHeight = window.innerHeight;

                const inputBottom = rect.top + rect.height;
                const spaceBelow = windowHeight - inputBottom;
                const menuHeight = 220;
                const isDropUp = spaceBelow < menuHeight;

                const style = {
                    position: 'fixed',
                    left: `${rect.left}px`,
                    width: `${rect.width}px`,
                    margin: 0,
                    zIndex: 99999,
                };

                if (isDropUp) {
                    style.top = 'auto';
                    style.bottom = `${windowHeight - rect.top + 5}px`;
                    style.transformOrigin = 'bottom center';
                } else {
                    style.top = `${inputBottom + 5}px`;
                    style.bottom = 'auto';
                    style.transformOrigin = 'top center';
                }

                return style;
            };

            // 🟢 关键：滚动时关闭菜单 (防止菜单悬浮在空中不动)
            const onSettingsScroll = () => {
                if (settingsNameFocus.value || settingsGroupFocus.value) {
                    settingsNameFocus.value = null;
                    settingsGroupFocus.value = null;
                }
            };

            // 🟢 新增：名称输入框的焦点状态
            const settingsNameFocus = ref(null);

            // 🟢 新增：获取当前类型下“未分组”的项目
            const getUngroupedItems = (type) => {
                let list = [];
                if (type === 'instrument') list = settings.instruments;
                else if (type === 'musician') list = settings.musicians;
                else if (type === 'project') list = settings.projects;

                // 筛选条件：没有 group 或者 group 是空字符串
                return list.filter(i => !i.group || !i.group.trim())
                    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
            };

            // 定义一套符合 App 风格的预设颜色
            const presetColors = [
                '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
                '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
                '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
                '#ec4899', '#f43f5e', '#64748b', '#71717a', '#000000'
            ];

            // 打开颜色选择器
            const openColorPicker = (item, type) => {
                colorPickerTarget.value = { item, type };
                tempColor.value = item.color || getDefaultColorByType(type);
                showColorPickerModal.value = true;
            };

            // 获取默认颜色 (用于重置)
            const getDefaultColorByType = (type) => {
                if (type === 'project') return '#eab308';    // 黄
                if (type === 'instrument') return '#3b82f6'; // 蓝
                if (type === 'musician') return '#a855f7';   // 紫
                return '#9ca3af';
            };

            // 重置颜色
            const resetColorPicker = () => {
                if (colorPickerTarget.value) {
                    tempColor.value = getDefaultColorByType(colorPickerTarget.value.type);
                }
            };

            // 确认保存
            const saveColorPicker = () => {
                if (colorPickerTarget.value && tempColor.value) {
                    // 更新对象颜色
                    colorPickerTarget.value.item.color = tempColor.value;
                    pushHistory(); // 保存历史
                }
                showColorPickerModal.value = false;
            };

            // 1. 切换单个分组 (修改：增加 type 参数，使用复合键)
            const toggleSettingsGroup = (type, groupName) => {
                const key = type + '|' + groupName; // 🟢 生成唯一 Key
                if (settingsExpandedGroups.has(key)) {
                    settingsExpandedGroups.delete(key);
                } else {
                    settingsExpandedGroups.add(key);
                }
            };

            // 2. 判断全展开 (修改：使用复合键检查)
            const isAllGroupsExpanded = (type) => {
                const groups = getSettingsGroupedList(type);
                if (groups.length === 0) return false;

                // 检查是否每个分组的 Key 都在 Set 里
                return groups.every(g => settingsExpandedGroups.has(type + '|' + g.name));
            };

            // 3. 批量切换 (修改：使用复合键操作)
            const toggleAllGroups = (type) => {
                const groups = getSettingsGroupedList(type);
                const isAllOpen = isAllGroupsExpanded(type);

                if (isAllOpen) {
                    // 全关
                    groups.forEach(g => settingsExpandedGroups.delete(type + '|' + g.name));
                } else {
                    // 全开
                    groups.forEach(g => settingsExpandedGroups.add(type + '|' + g.name));
                }
            };

            // --- 🟢 新增: 视图切换动画与手势逻辑 ---
            const viewTransitionName = ref('view-slide-left'); // 默认动画方向
            const touchStartX = ref(0);
            const touchStartY = ref(0);

            // --- 🟢 新增: 侧边栏(任务池) 滑动切换 Tab ---
            const sidebarTouchStartX = ref(0);
            const sidebarTouchStartY = ref(0);
            const sidebarTabsOrder = ['musician', 'project', 'instrument']; // 定义切换顺序

            const onSidebarTouchStart = (e) => {
                // 如果正在拖拽任务，不记录起点，防止误触
                if (dragElClone) return;

                sidebarTouchStartX.value = e.touches[0].clientX;
                sidebarTouchStartY.value = e.touches[0].clientY;
            };

            // 1. 定义动画状态和 Scroll 引用
            const sidebarTransitionName = ref('slide-next');
            const sidebarScrollRef = ref(null);

            // ... (原有的 sidebarTouchStartX 等变量保持不变) ...

            // 🟢 新增：智能切换 Tab 函数 (处理动画方向)
            const switchSidebarTab = (targetTab) => {
                if (sidebarTab.value === targetTab) return;

                const order = ['musician', 'project', 'instrument'];
                const oldIdx = order.indexOf(sidebarTab.value);
                const newIdx = order.indexOf(targetTab);

                // 判断方向：新索引 > 旧索引 ? 向左推(Next) : 向右推(Prev)
                sidebarTransitionName.value = newIdx > oldIdx ? 'slide-next' : 'slide-prev';

                // 切换数据
                sidebarTab.value = targetTab;

                // 切换后自动滚回顶部，体验更好
                if (sidebarScrollRef.value) {
                    sidebarScrollRef.value.scrollTop = 0;
                }
            };

            // 🟢 更新：触摸结束处理函数 (集成动画逻辑)
            const onSidebarTouchEnd = (e) => {
                if (dragElClone || !isMobile.value) return;

                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const diffX = endX - sidebarTouchStartX.value;
                const diffY = endY - sidebarTouchStartY.value;

                if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 50) {
                    const currentIndex = sidebarTabsOrder.indexOf(sidebarTab.value);
                    if (currentIndex === -1) return;

                    let nextIndex = currentIndex;
                    let direction = '';

                    if (diffX < 0) {
                        // 左滑 -> 下一个
                        if (currentIndex < sidebarTabsOrder.length - 1) {
                            nextIndex++;
                            direction = 'next';
                        }
                    } else {
                        // 右滑 -> 上一个
                        if (currentIndex > 0) {
                            nextIndex--;
                            direction = 'prev';
                        }
                    }

                    if (nextIndex !== currentIndex) {
                        // 🟢 手动设置动画方向
                        sidebarTransitionName.value = direction === 'next' ? 'slide-next' : 'slide-prev';

                        sidebarTab.value = sidebarTabsOrder[nextIndex];
                        window.triggerTouchHaptic('Light');

                        // 滚回顶部
                        if (sidebarScrollRef.value) sidebarScrollRef.value.scrollTop = 0;
                    }
                }
                sidebarTouchStartX.value = 0;
                sidebarTouchStartY.value = 0;
            };

            // 🟢 [修改] 自动分配：修正已录音任务占用空间计算 (优先读取 Actual Duration)
            const autoDistributeSections = () => {
                const listData = trackListData.value;
                const viewType = listData.viewType || 'musician';

                if (!listData.items || !listData.schedules || listData.schedules.length === 0) return;

                // 1. 获取所有日程块的总容量 (秒)
                const capacities = listData.schedules.map(s => parseTime(s.estDuration));
                const totalScheduleCapacity = capacities.reduce((a, b) => a + b, 0);

                if (totalScheduleCapacity === 0) {
                    openAlertModal('无法分配', '日程块的总时长为 0。');
                    return;
                }

                // --- 阶段 A: 筛选与分离 ---
                const lockedItems = [];
                const movableItems = [];

                const usedTimePerSection = new Array(capacities.length).fill(0);
                let totalLockedDuration = 0;

                listData.items.forEach(item => {
                    if (item.isSkipped) return;

                    const rec = item.records?.[viewType];
                    const hasRecord = rec && (
                        (rec.actualDuration && rec.actualDuration !== '00:00') ||
                        (rec.recStart && rec.recStart !== '')
                    );

                    if (hasRecord) {
                        lockedItems.push(item);

                        // 🟢 核心修复：计算占用空间时，优先使用【实际录音时长】
                        // 如果实际时长是 60m，预计是 50m，我们必须按 60m 扣除空间，防止撞车
                        let occupiedSec = 0;
                        if (rec.actualDuration && rec.actualDuration !== '00:00') {
                            occupiedSec = parseTime(rec.actualDuration);
                        } else {
                            // 兜底：如果没有算好 actualDuration，就用 estDuration
                            occupiedSec = parseTime(item.estDuration);
                        }

                        totalLockedDuration += occupiedSec;

                        if (item.sectionIndex >= 0 && item.sectionIndex < usedTimePerSection.length) {
                            usedTimePerSection[item.sectionIndex] += occupiedSec;
                        }
                    } else {
                        movableItems.push(item);
                    }
                });

                if (movableItems.length === 0) return;

                // --- 阶段 B: 计算“完美填充”的时间配额 ---
                const totalRemainingCapacity = Math.max(0, totalScheduleCapacity - totalLockedDuration);

                // 2. 计算可移动任务的总谱面时长
                let totalMovableMusicSec = 0;
                movableItems.forEach(item => {
                    totalMovableMusicSec += parseTime(item.musicDuration || '00:00');
                });

                // 3. 应用配额
                movableItems.forEach(item => {
                    let allocatedSec = 0;
                    const itemMusicSec = parseTime(item.musicDuration || '00:00');

                    if (totalMovableMusicSec > 0 && totalRemainingCapacity > 0) {
                        allocatedSec = (itemMusicSec / totalMovableMusicSec) * totalRemainingCapacity;
                    } else {
                        // 兜底：如果没空间了或者没谱面，给个最小时间
                        allocatedSec = 30;
                    }

                    allocatedSec = Math.max(30, Math.floor(allocatedSec));
                    item.estDuration = formatSecs(allocatedSec);

                    if (itemMusicSec > 0) {
                        item.ratio = (allocatedSec / itemMusicSec).toFixed(1);
                    }
                });

                // --- 阶段 C: 排序 (编制优先) ---
                movableItems.sort((a, b) => {
                    const sizeA = isOrchestraGroup(a) ? getOrchSize(a.orchestration) : 0;
                    const sizeB = isOrchestraGroup(b) ? getOrchSize(b.orchestration) : 0;
                    return sizeB - sizeA;
                });

                // --- 阶段 D: 填空分配 ---
                let currentSection = 0;

                movableItems.forEach(item => {
                    const itemDuration = parseTime(item.estDuration);

                    while (currentSection < capacities.length - 1) {
                        const capacity = capacities[currentSection];
                        const used = usedTimePerSection[currentSection];

                        // 🟢 容错优化：允许 5秒 误差，防止浮点数精度问题导致最后一点塞不进
                        if (used + itemDuration <= capacity + 5) {
                            break;
                        } else {
                            currentSection++;
                        }
                    }

                    item.sectionIndex = currentSection;

                    if (currentSection < usedTimePerSection.length) {
                        usedTimePerSection[currentSection] += itemDuration;
                    }
                });

                pushHistory();
                window.triggerTouchHaptic('Success');
            };

            // 修改 switchView 函数
            const switchView = (targetView) => {
                if (targetView === currentView.value) return;

                if (targetView === 'month') {
                    viewTransitionName.value = 'zoom-out';
                    currentView.value = targetView;

                    // 🟢 [新增] 如果是切到滚动模式，自动定位到当前月份
                    if (monthViewMode.value === 'scrolled') {
                        scrollToMonthDate(viewDate.value);
                    }
                } else {
                    viewTransitionName.value = 'zoom-in';
                    currentView.value = targetView;
                    // 切回周视图时可能也需要类似的定位逻辑，这里暂略
                }
                window.triggerTouchHaptic('Light');
            };

            const resetAutoHide = () => {
                // 强制显示
                showMobileSlider.value = true;

                // 清除之前的定时器
                if (idleTimer) clearTimeout(idleTimer);

                // 虽然是"保持显示"，但我们还是重置一个定时器，
                // 确保如果用户手指停在滑块上不动，它依然保持显示状态
                idleTimer = setTimeout(() => {
                    showMobileSlider.value = true;
                }, 1000);
            };

            // --- 🟢 新增: 电脑端鼠标滑动翻页 (模拟触摸体验) ---
            const isMouseViewDrag = ref(false);
            const mouseStartX = ref(0);
            const mouseStartY = ref(0);

            const onMainMouseDown = (e) => {
                // 1. 如果是手机端，直接忽略 (交给 Touch 事件处理)
                if (isMobile.value) return;

                // 2. 只响应鼠标左键
                if (e.button !== 0) return;

                // 3. 智能避让: 如果点到了任务块、调整手柄或滚动条，不触发翻页
                if (e.target.closest('.task-block') || e.target.closest('.resize-handle')) return;

                isMouseViewDrag.value = true;
                mouseStartX.value = e.clientX;
                mouseStartY.value = e.clientY;
            };

            const onMainMouseUp = (e) => {
                if (!isMouseViewDrag.value) return;
                isMouseViewDrag.value = false;

                const diffX = e.clientX - mouseStartX.value;
                const diffY = e.clientY - mouseStartY.value;

                // 4. 判定阈值 (逻辑同手机端: 水平距离 > 垂直距离的1.5倍 且 距离 > 50px)
                if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 50) {
                    const dir = diffX < 0 ? 1 : -1; // 左滑=下翻(1), 右滑=上翻(-1)
                    changeDate(dir);
                }
            };

            // --- 🟢 新增: 触控板左右滑动切换 (防抖动处理) ---
            let isWheelLocked = false; // 锁定状态，防止连续触发

            const onMainWheel = (e) => {
                // 1. 如果正在动画锁定中，或者按住了 Ctrl/Cmd (可能是缩放)，则忽略
                if (isWheelLocked || e.ctrlKey || e.metaKey) return;

                // 2. 判断是否为水平滑动 (X轴移动量 > Y轴移动量)
                // 且移动力度足够大 (阈值设为 30，避免轻微误触)
                if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 30) {

                    // 3. 阻止浏览器默认的“前进/后退”手势
                    e.preventDefault();

                    // 4. 判断方向
                    // deltaX > 0 通常代表向右滚动(看右边的内容) -> 下一周
                    // deltaX < 0 通常代表向左滚动(看左边的内容) -> 上一周
                    const dir = e.deltaX > 0 ? 1 : -1;

                    // 5. 执行切换
                    changeDate(dir);

                    // 6. 上锁 (800ms 内不接受新的切换，等待动画完成)
                    isWheelLocked = true;
                    setTimeout(() => {
                        isWheelLocked = false;
                    }, 800);
                }
            };

            // 触摸开始 (记录起点)
            const onMainTouchStart = (e) => {
                // 如果正在拖拽任务，不触发滑屏切换
                if (dragElClone || isResizingMobile.value) return;

                touchStartX.value = e.touches[0].clientX;
                touchStartY.value = e.touches[0].clientY;
            };

            // 🟢 修复: 触摸结束 (判定更宽松，X > Y * 1.5 即可)
            const onMainTouchEnd = (e) => {
                // 如果正在拖拽任务或调整大小，不触发视图切换
                if (dragElClone || isResizingMobile.value) return;

                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;

                const diffX = endX - touchStartX.value;
                const diffY = endY - touchStartY.value;

                // 优化: 水平距离 > 垂直距离的 1.5 倍 (比之前的 2 倍更灵敏) 且距离 > 50px
                if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 50) {

                    let dir = 0;
                    if (diffX < 0) dir = 1;  // 左划 -> 下一周
                    if (diffX > 0) dir = -1; // 右划 -> 上一周

                    if (dir !== 0) {
                        // A. 周视图 (仅窄屏模式下允许)
                        if (currentView.value === 'week') {
                            if (dayColWidth.value < 60) {
                                changeDate(dir);
                            }
                        }
                        // B. 月视图 (始终允许)
                        else if (currentView.value === 'month') {
                            changeDate(dir);
                        }
                    }
                }

                // 归零
                touchStartX.value = 0;
                touchStartY.value = 0;
            };

            const currentScrollSpeed = {x: 0, y: 0};

            // 🟢 [修改] 图标逻辑：根据视图类型显示不同图标
            const widthIcon = computed(() => {
                // 1. 月视图：显示 翻页 vs 滚动 图标
                if (currentView.value === 'month') {
                    // 如果当前是分页，显示"切换到流式"图标；反之亦然
                    return monthViewMode.value === 'paged' ? 'fa-scroll' : 'fa-table-cells';
                }

                // 2. 周视图：保持原有宽窄切换图标
                if (dayColWidth.value >= 100) return 'fa-compress';
                return 'fa-expand';
            });

// 🟢 [修改] 按钮点击逻辑
            const cycleDayWidth = () => {
                // 在 cycleDayWidth 函数内
                if (currentView.value === 'month') {
                    monthViewMode.value = monthViewMode.value === 'paged' ? 'scrolled' : 'paged';
                    window.triggerTouchHaptic('Medium');

                    // 🟢 [修改] 切换到滚动模式时，定位到当前月，而不是单纯回到顶部
                    if (monthViewMode.value === 'scrolled') {
                        scrollToMonthDate(viewDate.value);
                    } else {
                        // 切回分页模式，回到顶部
                        const main = document.getElementById('main-content');
                        if (main) main.scrollTop = 0;
                    }
                    return;
                }

                // 2. 周视图逻辑 (保持不变)
                if (dayColWidth.value >= 100) {
                    dayColWidth.value = window.innerWidth < 400 ? 45 : 52;
                } else {
                    dayColWidth.value = 100;
                }
                storageService.setItem('musche_day_width', dayColWidth.value);
                window.triggerTouchHaptic('Medium');
            };

            // 🟢 修复: 终极修正版清理函数
            // 修复了 S_DEFAULT 含下划线导致的分组解析错误，防止误删所有日程
            const cleanupEmptySchedules = () => {
                const activePoolIds = new Set(itemPool.value.map(i => i.id));
                const originalLength = scheduledTasks.value.length;

                // 1. 按 "Session | 类型 | ID" 分组日程块
                // 🔴 修复: 使用 "|" 作为分隔符，因为 S_DEFAULT 含有下划线，会导致 split 出错
                const groups = {};
                const getGroupKey = (t) => {
                    const sess = t.sessionId || 'S_DEFAULT';
                    if (t.musicianId) return `${sess}|M|${t.musicianId}`;
                    if (t.projectId) return `${sess}|P|${t.projectId}`;
                    if (t.instrumentId) return `${sess}|I|${t.instrumentId}`;
                    return null;
                };

                scheduledTasks.value.forEach(t => {
                    if (!t.templateId) { // 仅处理聚合块
                        const k = getGroupKey(t);
                        if (k) {
                            if (!groups[k]) groups[k] = [];
                            groups[k].push(t);
                        }
                    }
                });

                const schedulesKeepSet = new Set();

                // 2. 遍历每一组
                Object.entries(groups).forEach(([key, scheduleBlocks]) => {
                    // A. 排序
                    scheduleBlocks.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

                    // 🔴 修复: 正确解析 Key (使用 | 分割)
                    const [sess, type, id] = key.split('|');

                    // B. 筛选任务池
                    const poolItems = itemPool.value.filter(i => {
                        if ((i.sessionId || 'S_DEFAULT') !== sess) return false;
                        if (type === 'M') return i.musicianId === id;
                        if (type === 'P') return i.projectId === id;
                        if (type === 'I') return i.instrumentId === id;
                        return false;
                    });

                    // C. 建立映射: SectionIndex -> 任务列表
                    const taskMap = new Map();
                    poolItems.forEach(t => {
                        let idx = parseInt(t.sectionIndex);
                        if (isNaN(idx)) idx = 0;

                        if (!taskMap.has(idx)) taskMap.set(idx, []);
                        taskMap.get(idx).push(t);
                    });

                    // D. 核心: 索引对齐与保留逻辑
                    let newBlockIndex = 0;

                    scheduleBlocks.forEach((block, oldIndex) => {
                        const relatedTasks = taskMap.get(oldIndex);

                        if (relatedTasks && relatedTasks.length > 0) {
                            // ✅ 命中：保留该块
                            schedulesKeepSet.add(block.scheduleId);

                            // ⚡️ 修正索引：如果前面有块被删了，修正当前任务的 index
                            if (oldIndex !== newBlockIndex) {
                                relatedTasks.forEach(t => {
                                    t.sectionIndex = newBlockIndex;
                                });
                            }
                            newBlockIndex++;
                        }
                        // ❌ 未命中：该块对应任务已空，不加入 KeepSet (即删除)
                    });
                });

                // 3. 执行物理删除
                scheduledTasks.value = scheduledTasks.value.filter(task => {
                    if ((task.sessionId || 'S_DEFAULT') !== currentSessionId.value) return true;

                    // 非聚合块 (有具体 templateId)，检查 ID 是否存在
                    if (task.templateId) return activePoolIds.has(task.templateId);

                    // 聚合块，检查是否在保留名单里
                    return schedulesKeepSet.has(task.scheduleId);
                });

                if (scheduledTasks.value.length < originalLength) {
                    window.triggerTouchHaptic('Medium');
                }
            };

            // 🟢 新增: 强力扫描并清理当前弹窗内的空日程块
            const pruneEmptySchedules = () => {
                const listData = trackListData.value;
                if (!listData.schedules || listData.schedules.length === 0) return;

                // 倒序遍历，防止删除元素时索引错位
                for (let i = listData.schedules.length - 1; i >= 0; i--) {
                    // 检查属于当前 sectionIndex (i) 的任务还有几个
                    const itemsInSection = listData.items.filter(item => item.sectionIndex === i);

                    // 如果一个都没有了，说明这个日程块是个空壳
                    if (itemsInSection.length === 0) {
                        const scheduleToRemove = listData.schedules[i];

                        // 1. 从主数据库 scheduledTasks 中彻底删除该日程
                        scheduledTasks.value = scheduledTasks.value.filter(t => t.scheduleId !== scheduleToRemove.scheduleId);

                        // 2. 从弹窗 UI 数据中移除
                        listData.schedules.splice(i, 1);

                        // 3. 关键: 修正所有后续任务的 sectionIndex
                        // 因为第 i 个日程没了，那么所有 sectionIndex > i 的任务，索引都要减 1
                        listData.items.forEach(item => {
                            if (item.sectionIndex > i) {
                                item.sectionIndex--;
                            }
                        });
                    }
                }

                // 更新总段数
                listData.totalSections = listData.schedules.length;

                // 如果全部删光了，关闭弹窗
                if (listData.totalSections === 0) {
                    showTrackList.value = false;
                } else {
                    // 修正当前显示的索引，防止越界
                    if (listData.currentSectionIndex >= listData.totalSections) {
                        listData.currentSectionIndex = listData.totalSections - 1;
                    }
                }
            };

            // 🟢 修改: 根据录音记录自动调整日程块 (精确吸附版)
            // 修改点：移除了 snapToGrid 的 30分钟强制吸附，现在会精确贴合录音时间的边缘
            const autoResizeScheduleByRecords = (isSilent = false, shouldPushHistory = true) => {
                // 1. 获取当前弹窗管理的所有日程块 (Sections)
                const sections = trackListData.value.schedules;
                const items = trackListData.value.items;
                const viewType = trackListData.value.viewType || 'musician';

                let hasUpdate = false;

                // 2. 遍历每个日程块 (Section)
                sections.forEach((scheduleRef, sectionIndex) => {
                    if (!scheduleRef) return;

                    // 找到属于该 Section 的所有 Tracks
                    const sectionItems = items.filter(t => (t.sectionIndex || 0) === sectionIndex);

                    if (sectionItems.length === 0) return;

                    let minMins = Infinity;
                    let maxMins = -Infinity;

                    // 3. 找出该段落内 最早开始 和 最晚结束 的分钟数
                    sectionItems.forEach(item => {
                        const rec = item.records[viewType];
                        if (!rec) return;

                        if (rec.recStart) {
                            const [h, m] = rec.recStart.split(':').map(Number);
                            const startVal = h * 60 + m;
                            if (startVal < minMins) minMins = startVal;
                        }
                        if (rec.recEnd) {
                            const [h, m] = rec.recEnd.split(':').map(Number);
                            let endVal = h * 60 + m;
                            // 处理跨天
                            if (rec.recStart) {
                                const [sh, sm] = rec.recStart.split(':').map(Number);
                                if (endVal < (sh * 60 + sm)) endVal += 24 * 60;
                            }
                            // 如果结束时间正好等于开始时间(比如0时长)，不应该推大 maxMins，除非它是唯一的记录
                            if (endVal > maxMins) maxMins = endVal;
                        }
                    });

                    // 如果没有有效时间记录，跳过
                    if (minMins === Infinity || maxMins === -Infinity) return;

                    // 4. [修改点] 精确吸附：不再强制吸附到 00/30 网格
                    // 直接使用计算出的最早/最晚时间作为日程块的边界
                    const newStartMins = minMins;
                    const newEndMins = maxMins;

                    // 计算新时长
                    const durationMins = newEndMins - newStartMins;

                    // 安全检查：时长必须大于0 (防止误操作导致日程块消失)
                    if (durationMins <= 0) return;

                    // 5. 更新主数据 scheduledTasks
                    const taskInMainArray = scheduledTasks.value.find(t => t.scheduleId === scheduleRef.scheduleId);

                    if (taskInMainArray) {
                        // 转换回 HH:MM 格式
                        const sh = Math.floor(newStartMins / 60);
                        const sm = newStartMins % 60;
                        const newStartTimeStr = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;

                        // 转换时长为 HH:MM:SS
                        const newDurationStr = formatSecs(durationMins * 60);

                        // 检查是否有变更，避免无效更新
                        if (taskInMainArray.startTime !== newStartTimeStr || taskInMainArray.estDuration !== newDurationStr) {
                            taskInMainArray.startTime = newStartTimeStr;
                            taskInMainArray.estDuration = newDurationStr;
                            hasUpdate = true;
                        }
                    }
                });

                if (hasUpdate) {
                    // 🟢 只有显式要求时才保存
                    // if (shouldPushHistory) {
                    //     pushHistory();
                    // }
                    // 自动模式下不弹窗，但可以给个轻微震动反馈
                    if (!isSilent) {
                        window.triggerTouchHaptic('Success');
                        // 提示语微调
                        openAlertModal('自动调整完成', '日程块已根据实际录音时间精确调整。');
                    }
                } else {
                    if (!isSilent) {
                        openAlertModal('无需调整', '未找到有效的时间记录，或当前日程已匹配。');
                    }
                }
            };


            // 🟢 修复版: 智能跳转 (适配长动画)
            const smartScrollToTask = (targetTask) => {
                if (!targetTask) return;

                // 1. 强制切换到日程表 (手机端)
                if (isMobile.value) {
                    mobileTab.value = 'schedule';
                }

                // 2. 准备目标日期
                const targetDateObj = new Date(targetTask.date.replace(/-/g, '/'));

                // 判断动画方向
                if (targetDateObj.getTime() > viewDate.value.getTime()) {
                    dateTransitionName.value = 'slide-next';
                } else if (targetDateObj.getTime() < viewDate.value.getTime()) {
                    dateTransitionName.value = 'slide-prev';
                }

                // 3. 切换视图 & 设置日期
                currentView.value = 'week';
                viewDate.value = targetDateObj;

                // 4. 触发高亮
                flashingTaskId.value = targetTask.scheduleId;
                setTimeout(() => {
                    if (flashingTaskId.value === targetTask.scheduleId) flashingTaskId.value = null;
                }, 2500);

                // 🟢 5. 核心优化: 延迟执行滚动
                // CSS 动画时长是 400ms，这里设置 450ms 确保 DOM 稳定后再滚动
                setTimeout(() => {
                    const container = weekContainer.value;
                    if (container) {
                        const pxPerMinVal = pxPerMin.value; // 获取当前缩放比例

                        // --- A. 垂直定位 ---
                        const startMins = timeToMinutes(targetTask.startTime);
                        const offsetMins = startMins - settings.startHour * 60;
                        // 稍微向上偏一点 (-50px)，让任务不要贴着屏幕顶边，视觉更舒适
                        const targetTopPixel = (offsetMins * pxPerMinVal);
                        const scrollTop = Math.max(0, targetTopPixel - 50);

                        // --- B. 水平定位 ---
                        const dayIndex = targetDateObj.getDay();
                        const timeColW = isMobile.value ? 40 : 70;
                        // 动态计算列宽
                        const totalW = container.scrollWidth - timeColW;
                        const singleDayW = totalW / 7;

                        const targetCenterX = timeColW + (dayIndex * singleDayW) + (singleDayW / 2);
                        const scrollLeft = Math.max(0, targetCenterX - (container.clientWidth / 2));

                        // 执行平滑滚动
                        container.scrollTo({
                            top: scrollTop,
                            left: scrollLeft,
                            behavior: 'smooth'
                        });

                        // 🟢 双重保险:
                        // 有时 smooth 滚动会被并未完全结束的渲染打断
                        // 100ms 后检查位置，微调一次 (这次用 auto 瞬间对齐，防止用户没感觉)
                        setTimeout(() => {
                            if (Math.abs(container.scrollTop - scrollTop) > 10) {
                                container.scrollTo({top: scrollTop, left: scrollLeft, behavior: 'auto'});
                            }
                        }, 600);
                    }
                }, 1000); // ⏳ 延迟增加到 450ms
            };

            // 1. 鼠标按下 (开始拖拽)
            const onDragStart = (e, type) => {
                // 仅响应鼠标左键 (e.button === 0)
                if (e.button !== 0) return;

                e.preventDefault();
                isDraggingMouse = true;
                startMouseY = e.clientY;

                // 确定当前操作的滚轮引用
                activeColRef = type === 'm' ? pickerMinRef.value : pickerSecRef.value;
                startScrollTop = activeColRef.scrollTop;

                // 在全局添加监听，防止鼠标移出滚轮区域后拖拽中断
                window.addEventListener('mousemove', onDragMove);
                window.addEventListener('mouseup', onDragEnd);
            };

            // 2. 鼠标移动 (手动滚动)
            const onDragMove = (e) => {
                if (!isDraggingMouse) return;
                e.preventDefault();

                const deltaY = e.clientY - startMouseY;
                // 鼠标向下移动，滚轮应该向上滚动（scrollTop 增大），所以是减法
                activeColRef.scrollTop = startScrollTop - deltaY;

                // NOTE: @scroll 事件会负责更新 tempDuration
            };

            // 3. 鼠标抬起 (结束拖拽)
            const onDragEnd = () => {
                if (!isDraggingMouse) return;

                isDraggingMouse = false;
                // 清理全局监听器
                window.removeEventListener('mousemove', onDragMove);
                window.removeEventListener('mouseup', onDragEnd);

                // 触发一次 @scroll 事件，确保最后的值被吸附到位
                activeColRef.dispatchEvent(new Event('scroll'));
            };


            // 1. 打开选择器
            // 调用方式: openDurationPicker(item, 'musicDuration')
            const openDurationPicker = (event, targetObj, key) => {
                // --- A. 计算坐标 ---
                const targetEl = event.target; // 获取被点击的输入框
                const rect = targetEl.getBoundingClientRect();

                // 气泡宽高 (与 CSS 对应)
                const boxWidth = 280;
                const boxHeight = 320;

                // 计算 Left: 居中对齐输入框，但防止超出屏幕左右边界
                let left = rect.left + (rect.width / 2) - (boxWidth / 2);
                // 边界保护 (左边不小于 10px，右边不超屏幕)
                left = Math.max(10, Math.min(window.innerWidth - boxWidth - 10, left));

                // 计算 Top: 默认显示在输入框上方 (减去气泡高度和一点间距)
                let top = rect.top - boxHeight - 15;

                // 如果上方空间不够 (比如输入框在屏幕最顶端)，则显示在下方
                if (top < 10) {
                    top = rect.bottom + 15;
                    // 注意：如果显示在下方，理论上 CSS 的小三角应该转方向，这里为简化暂不处理
                    // 或者你可以给 box 加个 class 来翻转 ::after
                }

                pickerPos.top = top;
                pickerPos.left = left;

                // --- B. 初始化数据 ---
                const currentVal = targetObj[key] || '';
                let m = 0, s = 0;
                if (currentVal.includes(':')) {
                    const parts = currentVal.split(':');
                    m = parseInt(parts[0]) || 0;
                    s = parseInt(parts[1]) || 0;
                }
                tempDuration.m = m;
                tempDuration.s = s;
                showDurationPicker.value = true;

                // --- C. 设置回调 ---
                pickerCallback = (isReset = false) => {
                    const finalStr = isReset ? '' : `${String(tempDuration.m).padStart(2, '0')}:${String(tempDuration.s).padStart(2, '0')}`;
                    targetObj[key] = finalStr;

                    if (targetObj.ratio && targetObj.estDuration !== undefined) {
                        if (typeof calculateEstTime === 'function') {
                            targetObj.estDuration = calculateEstTime(finalStr, targetObj.ratio);
                        }
                    }
                    pushHistory(); // 保存历史
                };

                // --- D. 滚动到位 ---
                Vue.nextTick(() => {
                    scrollToValue(pickerMinRef.value, m);
                    scrollToValue(pickerSecRef.value, s);
                });
            };

            const closePicker = () => {
                showDurationPicker.value = false;
            };

            const scrollToValue = (el, val) => {
                if (el) el.scrollTop = val * 44; // 注意: CSS里改成了 44px 高
            };

            let scrollTimeout = null;
            const onScroll = (e, type) => {
                clearTimeout(scrollTimeout);
                const el = e.target;

                // 1. 计算当前滚到了第几格 (44px 是 CSS 中定义的格高)
                // Math.round 确保过半就吸附到下一个数字
                const newIndex = Math.round(el.scrollTop / 44);

                // 2. 获取旧的索引 (上一次的状态)
                const oldIndex = (type === 'm' ? tempDuration.m : tempDuration.s);

                // 🟢 关键修改: 只有当数字发生变化时 (跳格)，才触发逻辑
                if (newIndex !== oldIndex) {

                    // A. 更新数据
                    if (type === 'm') tempDuration.m = newIndex;
                    if (type === 's') tempDuration.s = newIndex;

                    // B. 触发震动 📳
                    // 使用 'Light' 档位，这种轻微的敲击感最适合模拟滚轮的齿感
                    window.triggerTouchHaptic('Light');
                }
                // 仅用于滚动结束后的吸附修正 (可选)

                scrollTimeout = setTimeout(() => {
                    // 此处可以加逻辑
                }, 100);

            };

            // 辅助：精确计算元素占据的物理空间 (含 margin)
            const getOuterHeight = (el) => {
                if (!el) return 0;
                const style = window.getComputedStyle(el);
                const h = el.offsetHeight;
                const mt = parseFloat(style.marginTop) || 0;
                const mb = parseFloat(style.marginBottom) || 0;
                // 处理 margin collapse (通常取 max，但在 space-y 布局中往往是叠加或固定间距，这里简单相加通常足够精确，
                // 因为我们是为了计算"跨越这个元素需要走多远")
                // 在 flex/block 布局中，为了防止 collapse 计算复杂，直接取外边距总和通常更符合直觉手感
                return h + Math.max(mt, mb);
            };

            // 1. 开始拖拽
            const startDividerDrag = (e, sectionIndex) => {
                if (dividerDragState) return;
                const isTouch = e.type === 'touchstart';
                if (e.cancelable) e.preventDefault();

                // 🟢 关键修改: 虽然点击的是胶囊，但我们要操作的是整行分割条
                const triggerEl = e.currentTarget;
                const targetEl = triggerEl.closest('.group\\/divider'); // 查找带有 group/divider 类的父容器

                // 如果找不到父容器(理论上不会)，就回退到当前元素
                const actualTarget = targetEl || triggerEl;

                // 隐藏原始元素
                actualTarget.style.opacity = '0';

                const rect = actualTarget.getBoundingClientRect();
                const clientY = isTouch ? e.touches[0].clientY : e.clientY;
                const container = trackListContainerRef.value;
                const initialScrollTop = container ? container.scrollTop : 0;

                // 获取所有卡片 DOM
                const taskEls = Array.from(container.querySelectorAll('.track-card'));
                // 🟢 2. 计算高度时包含 margin (更精确)
                const taskHeights = taskEls.map(el => {
                    const style = window.getComputedStyle(el);
                    return el.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
                });

                // 计算分割条的真实占据高度 (包含 margin)
                const dividerStyle = window.getComputedStyle(targetEl);
                const ghostHeight = targetEl.offsetHeight + parseFloat(dividerStyle.marginTop) + parseFloat(dividerStyle.marginBottom);

                let startIndex = trackListData.value.items.findIndex(item => item.sectionIndex === sectionIndex);
                if (startIndex === -1) startIndex = trackListData.value.items.length;

                // 创建替身
                const ghost = actualTarget.cloneNode(true);
                Object.assign(ghost.style, {
                    position: 'fixed', top: `${rect.top}px`, left: `${rect.left}px`,
                    width: `${rect.width}px`, height: `${rect.height}px`,
                    zIndex: '9999', opacity: '0.95',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    transform: 'none', transition: 'none', pointerEvents: 'none',
                    // 替身必须是可见的
                    opacity: '1'
                });
                document.body.appendChild(ghost);

                draggingSectionIndex.value = sectionIndex;

                dividerDragState = {
                    targetEl: actualTarget, // 🟢 保存引用以便恢复
                    ghost: ghost,
                    ghostHeight: ghostHeight,
                    taskEls: taskEls,
                    fingerOffset: clientY - rect.top,
                    lastClientY: clientY,
                    lastScrollTop: initialScrollTop,
                    cumulativeDelta: 0,
                    taskHeights: taskHeights,
                    virtualIndex: startIndex,
                    startIndex: startIndex,
                    sectionIndex: sectionIndex
                };

                window.triggerTouchHaptic('Medium');

                if (isTouch) {
                    window.addEventListener('touchmove', onDividerDragMove, {passive: false});
                    window.addEventListener('touchend', onDividerDragEnd);
                    window.addEventListener('touchcancel', onDividerDragEnd);
                } else {
                    window.addEventListener('mousemove', onDividerDragMove);
                    window.addEventListener('mouseup', onDividerDragEnd);
                }
            };

            // 2. 拖拽过程 (保持不变，确认逻辑无误)
            const onDividerDragMove = (e) => {
                if (!dividerDragState) return;
                if (e.cancelable) e.preventDefault();

                const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

                // A. 移动替身
                const newTop = clientY - dividerDragState.fingerOffset;
                dividerDragState.ghost.style.top = `${newTop}px`;

                const container = trackListContainerRef.value;
                const currentScrollTop = container ? container.scrollTop : 0;
                const dy = clientY - dividerDragState.lastClientY;
                const dScroll = currentScrollTop - dividerDragState.lastScrollTop;

                dividerDragState.lastClientY = clientY;
                dividerDragState.lastScrollTop = currentScrollTop;
                dividerDragState.cumulativeDelta += (dy + dScroll);

                const {taskHeights, startIndex, ghostHeight, taskEls} = dividerDragState;
                let indexChanged = false;

                // 计算 Virtual Index
                while (dividerDragState.cumulativeDelta < 0) {
                    if (dividerDragState.virtualIndex <= 0) break;
                    const targetIndex = dividerDragState.virtualIndex - 1;
                    const threshold = taskHeights[targetIndex];
                    if (!threshold || threshold < 10) break;

                    if (dividerDragState.cumulativeDelta < -threshold) {
                        dividerDragState.cumulativeDelta += threshold;
                        dividerDragState.virtualIndex--;
                        indexChanged = true;
                    } else break;
                }

                while (dividerDragState.cumulativeDelta > 0) {
                    if (dividerDragState.virtualIndex >= taskHeights.length) break;
                    const targetIndex = dividerDragState.virtualIndex;
                    const threshold = taskHeights[targetIndex];
                    if (!threshold || threshold < 10) break;

                    if (dividerDragState.cumulativeDelta > threshold) {
                        dividerDragState.cumulativeDelta -= threshold;
                        dividerDragState.virtualIndex++;
                        indexChanged = true;
                    } else break;
                }

                if (indexChanged || isMobile.value) {
                    const vIdx = dividerDragState.virtualIndex;
                    if (indexChanged) window.triggerTouchHaptic('Light');

                    taskEls.forEach((el, i) => {
                        let translateY = 0;
                        // 向下拖：中间的卡片向上移
                        if (vIdx > startIndex) {
                            if (i >= startIndex && i < vIdx) translateY = -ghostHeight;
                        }
                        // 向上拖：中间的卡片向下移
                        else if (vIdx < startIndex) {
                            if (i >= vIdx && i < startIndex) translateY = ghostHeight;
                        }

                        if (translateY !== 0) {
                            el.style.transform = `translateY(${translateY}px)`;
                            el.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)';
                        } else {
                            el.style.transform = '';
                            el.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)';
                        }
                    });
                }

                handleTrackListAutoScroll(clientY);
            };

            // 3. 结束拖拽 (修复版：彻底清除样式残留)
            const onDividerDragEnd = () => {
                if (dividerDragState) {
                    const {sectionIndex, startIndex, virtualIndex, taskEls, targetEl} = dividerDragState;

                    // 🟢 1. 立即清除所有视觉偏移 (防止 Vue 复用带偏移样式的 DOM)
                    taskEls.forEach(el => {
                        el.style.transform = '';
                        el.style.transition = 'none'; // 禁用动画，立即复位
                    });

                    // 🟢 2. 恢复原始分割条显示
                    if (targetEl) targetEl.style.opacity = '';

                    // 3. 移除替身
                    if (dividerDragState.ghost && document.body.contains(dividerDragState.ghost)) {
                        document.body.removeChild(dividerDragState.ghost);
                    }

                    // 🟢 4. 延迟一帧执行数据更新
                    // 这样可以确保上面的 style.transform = '' 已经生效
                    // 否则 Vue 可能会复用一个还带有 translateY 的元素，导致位置叠加错误
                    requestAnimationFrame(() => {
                        if (virtualIndex !== startIndex) {
                            const diff = virtualIndex - startIndex;
                            const direction = diff > 0 ? 'down' : 'up';
                            const moves = Math.abs(diff);

                            // 批量修改数据
                            for (let i = 0; i < moves; i++) {
                                moveDivider(sectionIndex, direction, false);
                            }
                            pushHistory();
                        }
                    });
                }

                dividerDragState = null;
                draggingSectionIndex.value = null;
                stopTrackListAutoScroll();

                window.removeEventListener('touchmove', onDividerDragMove);
                window.removeEventListener('touchend', onDividerDragEnd);
                window.removeEventListener('touchcancel', onDividerDragEnd);
                window.removeEventListener('mousemove', onDividerDragMove);
                window.removeEventListener('mouseup', onDividerDragEnd);
                window.removeEventListener('mousemove', onDividerDragMove);
                window.removeEventListener('mouseup', onDividerDragEnd);
            };

            // 🟢 新增: 同步状态
            const isSyncing = ref(false);

// 🟢 新增: 手动同步函数
            const handleManualSync = async () => {
                if (!user.value) {
                    return openAlertModal("请先登录", "只有登录后才能同步云端数据。");
                }

                if (isSyncing.value) return; // 防止重复点击

                isSyncing.value = true;
                window.triggerTouchHaptic('Medium'); // 震动反馈

                try {
                    // 复用已有的 loadCloudData 函数
                    await loadCloudData();

                    // 稍微延迟一点，让动画转完，给用户一种"已完成"的实感
                    setTimeout(() => {
                        isSyncing.value = false;
                        window.triggerTouchHaptic('Success');
                        // 可选：如果不希望每次都弹窗，可以只用震动反馈，或者用一个小Toast
                        // openAlertModal("同步完成", "已拉取最新的云端数据。");
                    }, 500);

                } catch (e) {
                    isSyncing.value = false;
                    window.triggerTouchHaptic('Error');
                    openAlertModal("同步失败", "网络连接异常或服务不可用。");
                }
            };

            // 4. 自动滚动逻辑 (稍微调整了一下参数以配合 fixed 定位的 ghost)
            const handleTrackListAutoScroll = (clientY) => {
                const container = trackListContainerRef.value;
                if (!container) return;

                const rect = container.getBoundingClientRect();
                const edgeSize = 60;
                const maxSpeed = 15;

                stopTrackListAutoScroll();

                let scrollSpeed = 0;
                // 只有当替身在容器范围内时才触发滚动，防止无限滚
                if (clientY < rect.top + edgeSize && clientY > rect.top - 50) {
                    const intensity = Math.max(0, (rect.top + edgeSize - clientY) / edgeSize);
                    scrollSpeed = -maxSpeed * intensity;
                } else if (clientY > rect.bottom - edgeSize && clientY < rect.bottom + 50) {
                    const intensity = Math.max(0, (clientY - (rect.bottom - edgeSize)) / edgeSize);
                    scrollSpeed = maxSpeed * intensity;
                }

                if (scrollSpeed !== 0) {
                    trackListScrollTimer = requestAnimationFrame(function scrollLoop() {
                        if (scrollSpeed !== 0 && container) {
                            container.scrollTop += scrollSpeed;
                            // 注意：因为 Ghost 是 fixed 定位，它不受容器 scroll 影响，
                            // 所以这里不需要像之前那样补偿 startY，视觉上是解耦的。
                            trackListScrollTimer = requestAnimationFrame(scrollLoop);
                        }
                    });
                }
            };

            const stopTrackListAutoScroll = () => {
                if (trackListScrollTimer) {
                    cancelAnimationFrame(trackListScrollTimer);
                    trackListScrollTimer = null;
                }
            };

            const confirmDurationPicker = () => {
                if (pickerCallback) pickerCallback(false);
                showDurationPicker.value = false;
            };

            // 🟢 新增: 重置功能
            const resetDuration = () => {
                if (pickerCallback) pickerCallback(true); // 传 true 清空
                showDurationPicker.value = false;
            };

            // 1. 触摸开始 (修改为记录像素偏移)
            const handleTouchStart = (e, task, dateStr) => {
                if (!isMobile.value) return;

                dragSourceType = 'schedule';

                const touch = e.touches[0];
                const targetEl = e.currentTarget;

                startX = touch.clientX;
                startY = touch.clientY;
                dragSourceTask = task;
                dragStartDate = dateStr;

                const rect = targetEl.getBoundingClientRect();
                cloneOffsetX = touch.clientX - rect.left;
                cloneOffsetY = touch.clientY - rect.top;
                dragClickOffsetY = touch.clientY - rect.top;

                longPressTimeout = setTimeout(() => {
                    // 🟢 修改: 只有非幽灵任务才允许拖拽
                    // 幽灵任务虽然不能拖拽，但前面的代码已经记录了 dragSourceTask
                    // 所以 touchend 里的双击检测依然有效
                    if (!isTaskGhost(task)) {
                        startMobileDrag(targetEl, touch);
                    }
                }, 300);
            };

            // 🟢 修复: 触摸开始 (防误触 + 智能状态判断)
            const handlePoolTouchStart = (e, item, type = 'pool') => {
                if (!isMobile.value) return;

                // 🛑 1. 彻底禁止小卡片拖动 (防止列表滑动误触)
                if (type === 'pool') return;

                // 🛑 2. 大卡片 (aggregate) 状态检查
                if (type === 'aggregate') {
                    // 如果已完成或已排满 -> 禁止拖动，只给拒绝反馈
                    if (item.statusKey === 'completed' || item.statusKey === 'full' || item.statusKey === 'in-progress') {
                        // 📳 震动两下，提示用户“此人已搞定，无需安排”
                        //window.triggerTouchHaptic('Medium');
                        //setTimeout(() => window.triggerTouchHaptic('Medium'), 150);
                        return;
                    }
                }

                // --- 以下是允许拖动的情况 (大卡片 && 时间不足/未排期) ---
                dragSourceType = type;

                const touch = e.touches[0];
                const targetEl = e.currentTarget;

                startX = touch.clientX;
                startY = touch.clientY;
                dragSourceTask = item;

                const rect = targetEl.getBoundingClientRect();
                cloneOffsetX = touch.clientX - rect.left;
                cloneOffsetY = touch.clientY - rect.top;
                dragClickOffsetY = touch.clientY - rect.top;

                // 启动长按计时器
                longPressTimeout = setTimeout(() => {
                    startMobileDrag(targetEl, touch);

                    mobileTab.value = 'schedule'; // 跳转到日程表
                    window.triggerTouchHaptic('Heavy'); // 成功触发震动
                }, 300);
            };

            // 🟢 修改: handleTouchMove (增加周视图边缘翻页功能)
            const handleTouchMove = (e) => {
                const touch = e.touches[0];

                // A. 如果还在长按检测阶段
                if (longPressTimeout && !dragElClone) {
                    const deltaX = Math.abs(touch.clientX - startX);
                    const deltaY = Math.abs(touch.clientY - startY);

                    // 如果手指移动超过 10px，视为用户想滚动屏幕，取消长按
                    if (deltaX > 10 || deltaY > 10) {
                        clearTimeout(longPressTimeout);
                        longPressTimeout = null;
                    }
                    return;
                }

                // B. 如果已经开始拖拽
                if (dragElClone) {
                    // 禁用屏幕滚动
                    if (e.cancelable) e.preventDefault();

                    // 1. 移动克隆体
                    const x = touch.clientX - cloneOffsetX;
                    const y = touch.clientY - cloneOffsetY;
                    dragElClone.style.transform = `translate3d(${x}px, ${y}px, 0)`;

                    // 2. 视图自动滚动与翻页检测
                    const scrollContainer = weekContainer.value;

                    // --- 周视图逻辑 ---
                    if (currentView.value === 'week' && scrollContainer) {
                        // [Part A] 现有的全向自动滚动 (保持不变)
                        let vx = 0, vy = 0;
                        if (isMobile.value) {
                            const topZone = 500;
                            const bottomZone = window.innerHeight - 150;
                            const leftZone = 60;
                            const rightZone = window.innerWidth - 60;
                            const ramp = 80;

                            if (touch.clientY < topZone) vy = -Math.min(1, (topZone - touch.clientY) / ramp);
                            else if (touch.clientY > bottomZone) vy = Math.min(1, (touch.clientY - bottomZone) / ramp);

                            if (touch.clientX < leftZone) vx = -Math.min(1, (leftZone - touch.clientX) / ramp);
                            else if (touch.clientX > rightZone) vx = Math.min(1, (touch.clientX - rightZone) / ramp);
                        }

                        if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) {
                            if (!autoScrollInterval) startAutoScroll(vx, vy, scrollContainer, scrollContainer);
                            else updateAutoScrollDirection(vx, vy);
                        } else {
                            stopAutoScroll();
                        }

                        // [Part B] 新增: 周视图边缘翻页 (仿月视图逻辑)
                        const edgeThreshold = 50; // 边缘触发区域大小
                        let switchDir = 0;

                        // 检测左右边缘
                        if (touch.clientX < edgeThreshold) {
                            switchDir = -1; // 上一周
                        } else if (touch.clientX > window.innerWidth - edgeThreshold) {
                            switchDir = 1;  // 下一周
                        }

                        if (switchDir !== 0) {
                            // 如果手指在边缘，且没有正在等待的翻页定时器
                            if (!monthSwitchTimer) {
                                monthSwitchTimer = setTimeout(() => {
                                    changeDate(switchDir); // 执行翻页 (changeDate 会自动处理 +7/-7 天)
                                    window.triggerTouchHaptic('Medium'); // 震动反馈

                                    // 翻页后重置定时器，允许连续翻页
                                    monthSwitchTimer = null;
                                }, 800); // 停留 800ms 后触发
                            }
                        } else {
                            // 离开边缘，取消定时器
                            if (monthSwitchTimer) {
                                clearTimeout(monthSwitchTimer);
                                monthSwitchTimer = null;
                            }
                        }
                    }

                    // --- 月视图逻辑 (保持不变) ---
                    else if (currentView.value === 'month' && isMobile.value) {
                        const edgeThreshold = 50;
                        let switchDir = 0;
                        if (touch.clientX < edgeThreshold) switchDir = -1;
                        else if (touch.clientX > window.innerWidth - edgeThreshold) switchDir = 1;

                        if (switchDir !== 0) {
                            if (!monthSwitchTimer) {
                                monthSwitchTimer = setTimeout(() => {
                                    changeDate(switchDir);
                                    window.triggerTouchHaptic('Medium');
                                    monthSwitchTimer = null;
                                }, 800);
                            }
                        } else {
                            if (monthSwitchTimer) {
                                clearTimeout(monthSwitchTimer);
                                monthSwitchTimer = null;
                            }
                        }
                    }

                    // 3. 高亮显示下方的格子
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (activeDropSlot) activeDropSlot.classList.remove('drag-over');
                    activeDropSlot = null;

                    if (target) {
                        const slot = target.closest('.grid-slot, .droppable-slot');
                        if (slot) {
                            activeDropSlot = slot;
                            activeDropSlot.classList.add('drag-over');
                        }
                    }
                }
            };

            // 🟢 修改: handleTouchEnd
            const handleTouchEnd = (e) => {
                if (longPressTimeout) {
                    clearTimeout(longPressTimeout);
                    longPressTimeout = null;

                    // --- 双击检测逻辑 START ---
                    if (!dragElClone && dragSourceType === 'schedule' && dragSourceTask) {
                        const now = Date.now();

                        // 如果点击的是同一个任务，且间隔小于 300ms (判定为双击)
                        if (lastTapState.id === dragSourceTask.scheduleId && (now - lastTapState.time) < 300) {

                            // 🟢 核心修复: 阻止浏览器继续触发原生的 click/dblclick
                            // 否则原生 dblclick 会在 Session 切换完成后再次触发，导致误判为非幽灵任务从而打开弹窗
                            if (e.cancelable) e.preventDefault();

                            // 🟢 修复: 手机端双击幽灵任务时，强制执行跳转逻辑，不打开详情页
                            if (isTaskGhost(dragSourceTask)) {
                                jumpToGhostContext(dragSourceTask);
                            } else {
                                handleTaskDblClick(e, dragSourceTask);
                            }

                            lastTapState.id = null;
                            lastTapState.time = 0;
                        } else {
                            // 第一次点击 (判定为单击)
                            lastTapState.id = dragSourceTask.scheduleId;
                            lastTapState.time = now;

                            // 🟢 核心修复: 在这里手动触发选中！
                            selectTask(dragSourceTask.scheduleId, 'schedule');
                        }
                    }
                    // --- 🟢 新增: 双击检测逻辑 END ---
                }

                stopAutoScroll();

                if (monthSwitchTimer) {
                    clearTimeout(monthSwitchTimer);
                    monthSwitchTimer = null;
                }

                if (dragElClone) {
                    document.body.removeChild(dragElClone);
                    dragElClone = null;
                    if (activeDropSlot) activeDropSlot.classList.remove('drag-over');

                    const touch = e.changedTouches[0];
                    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);

                    const dropColumn = targetEl ? targetEl.closest('[data-date-str]') : null;
                    const dropMonthCell = targetEl ? targetEl.closest('[data-date]') : null;

                    // --- 情况 A: 放置在周视图 ---
                    if (dropColumn) {
                        const dateStr = dropColumn.dataset.dateStr;
                        const timeGridContainer = dropColumn.querySelector('.relative[style*="min-height"]');

                        if (timeGridContainer && dragSourceTask) {
                            // 1. 计算目标时间
                            const gridRect = timeGridContainer.getBoundingClientRect();
                            const touchYInContainer = touch.clientY - gridRect.top;
                            const taskTopPixel = touchYInContainer - dragClickOffsetY;
                            const minsFromStart = taskTopPixel / pxPerMin.value;
                            let totalMins = (settings.startHour * 60) + minsFromStart;
                            const snappedMins = Math.round(totalMins / 30) * 30;
                            const minMins = settings.startHour * 60;
                            const maxMins = settings.endHour * 60 - 30;
                            const finalMins = Math.max(minMins, Math.min(maxMins, snappedMins));
                            const h = Math.floor(finalMins / 60);
                            const m = finalMins % 60;
                            const newTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

                            // 2. 准备检测参数
                            let checkType = 'musician';
                            let checkDuration = '';
                            let excludeId = null;

                            // 判断类型和时长
                            if (dragSourceType === 'aggregate') {
                                checkType = sidebarTab.value;
                                const item = dragSourceTask;
                                const remainingSecs = item.totalSeconds - item.scheduledSeconds;
                                if (remainingSecs <= 0) return; // 没时间了，直接退出
                                let remainingMins = Math.ceil(remainingSecs / 1800) * 30;
                                if (remainingMins === 0) remainingMins = 30;
                                checkDuration = formatSecs(remainingMins * 60);
                            } else if (dragSourceType === 'pool') {
                                const item = dragSourceTask;
                                if (item.projectId) checkType = 'project';
                                else if (item.instrumentId) checkType = 'instrument';
                                else checkType = 'musician';
                                checkDuration = item.estDuration;
                            } else {
                                // schedule
                                const item = dragSourceTask;
                                if (item.projectId) checkType = 'project';
                                else if (item.instrumentId) checkType = 'instrument';
                                else checkType = 'musician';
                                checkDuration = item.estDuration;
                                excludeId = item.scheduleId; // 排除自己，移动时不算冲突
                            }

                            // 3. 执行冲突检测
                            if (checkOverlap(dateStr, newTime, checkDuration, excludeId, checkType)) {
                                openAlertModal('时间冲突', '该时间段已有重叠的安排。');
                                window.triggerTouchHaptic('Error');
                                if (dragSourceEl) dragSourceEl.style.opacity = '';
                                dragSourceEl = null;
                                activeDropSlot = null;
                                return; // ⛔️ 发生冲突，终止操作
                            }

                            // 4. 通过检测，执行放置
                            if (dragSourceType === 'aggregate') {
                                const item = dragSourceTask;
                                // 时长逻辑上面已经算过一次，这里复用
                                const remainingSecs = item.totalSeconds - item.scheduledSeconds;
                                let remainingMins = Math.ceil(remainingSecs / 1800) * 30;
                                if (remainingMins === 0) remainingMins = 30;

                                const nt = {
                                    scheduleId: Date.now(),
                                    sessionId: currentSessionId.value,
                                    musicianId: sidebarTab.value === 'musician' ? item.id : '',
                                    projectId: sidebarTab.value === 'project' ? item.id : '',
                                    instrumentId: sidebarTab.value === 'instrument' ? item.id : '',
                                    date: dateStr,
                                    startTime: newTime,
                                    estDuration: formatSecs(remainingMins * 60),
                                    trackCount: item.trackCount,
                                    ratio: item.defaultRatio || 20,
                                    reminderMinutes: 15,
                                    sound: 'default'
                                };
                                scheduledTasks.value.push(nt);
                                window.triggerTouchHaptic('Success');
                                pushHistory();
                            } else if (dragSourceType === 'pool') {
                                const newTask = {
                                    scheduleId: Date.now(),
                                    sessionId: currentSessionId.value,
                                    projectId: dragSourceTask.projectId,
                                    instrumentId: dragSourceTask.instrumentId,
                                    musicianId: dragSourceTask.musicianId,
                                    musicDuration: dragSourceTask.musicDuration,
                                    ratio: dragSourceTask.ratio,
                                    estDuration: dragSourceTask.estDuration,
                                    date: dateStr,
                                    startTime: newTime,
                                    reminderMinutes: 15,
                                    sound: 'default'
                                };
                                scheduledTasks.value.push(newTask);
                                window.triggerTouchHaptic('Success');
                                pushHistory();
                            } else {
                                // 日程内部移动
                                if (dragSourceTask.startTime !== newTime || dragSourceTask.date !== dateStr) {
                                    dragSourceTask.startTime = newTime;
                                    dragSourceTask.date = dateStr;
                                    window.triggerTouchHaptic('Success');
                                    pushHistory();
                                }
                            }
                        }
                    }
                    // --- 情况 B: 放置在月视图 ---
                    else if (dropMonthCell && dragSourceTask) {
                        const dateStr = dropMonthCell.dataset.date;

                        if (dragSourceType === 'schedule') {
                            if (dragSourceTask.date !== dateStr) {
                                dragSourceTask.date = dateStr;
                                window.triggerTouchHaptic('Success');
                                pushHistory();
                            }
                        } else if (dragSourceType === 'aggregate' || dragSourceType === 'pool') {
                            const item = dragSourceTask;
                            let mId = '', pId = '', iId = '';
                            let ratio = 20;
                            let estDur = '00:30';
                            let tCount = 0;
                            let musDur = '';
                            let checkType = 'musician';

                            if (dragSourceType === 'pool') {
                                mId = item.musicianId;
                                pId = item.projectId;
                                iId = item.instrumentId;
                                ratio = item.ratio;
                                estDur = item.estDuration;
                                musDur = item.musicDuration;
                                if (pId) checkType = 'project'; else if (iId) checkType = 'instrument';
                            } else {
                                if (sidebarTab.value === 'musician') mId = item.id;
                                else if (sidebarTab.value === 'project') {
                                    pId = item.id;
                                    checkType = 'project';
                                } else if (sidebarTab.value === 'instrument') {
                                    iId = item.id;
                                    checkType = 'instrument';
                                }
                                ratio = item.defaultRatio || 20;
                                estDur = item.estDuration || '00:30';
                                tCount = item.trackCount || 0;
                            }

                            // 默认插在开头，检测冲突
                            const defaultStart = settings.startHour + ':00';
                            if (checkOverlap(dateStr, defaultStart, estDur, null, checkType)) {
                                openAlertModal('冲突', '该日期已有安排，请切换到周视图查看详情。');
                                window.triggerTouchHaptic('Error');
                            } else {
                                const nt = {
                                    scheduleId: Date.now(),
                                    sessionId: currentSessionId.value,
                                    musicianId: mId, projectId: pId, instrumentId: iId,
                                    date: dateStr, startTime: defaultStart,
                                    estDuration: estDur, trackCount: tCount, ratio: ratio, musicDuration: musDur
                                };
                                scheduledTasks.value.push(nt);
                                window.triggerTouchHaptic('Success');
                                pushHistory();
                            }
                        }
                    }
                }

                if (dragSourceEl) {
                    dragSourceEl.style.opacity = '';
                    dragSourceEl = null;
                }
                activeDropSlot = null;
            };

            // 1. 启动滚动
            const startAutoScroll = (vx, vy, xContainer, yContainer) => {
                if (autoScrollInterval) return;

                currentScrollSpeed.x = vx;
                currentScrollSpeed.y = vy;

                // 🟢 最大极速 (像素/帧)
                // 因为 vx/vy 现在是 0~1 的小数，这里设大一点，比如 20
                const maxSpeed = 25;

                autoScrollInterval = setInterval(() => {
                    isScrollingProgrammatically = true;

                    // --- 垂直滚动 (Y) ---
                    // 速度 = 向量值 * 最大极速
                    if (Math.abs(currentScrollSpeed.y) > 0 && yContainer) {
                        yContainer.scrollTop += currentScrollSpeed.y * maxSpeed;
                    }

                    // --- 水平滚动 (X) ---
                    if (Math.abs(currentScrollSpeed.x) > 0 && xContainer) {
                        xContainer.scrollLeft += currentScrollSpeed.x * maxSpeed;
                    }

                    setTimeout(() => {
                        isScrollingProgrammatically = false;
                    }, 50);

                }, 16); // 约 60fps
            };

            const updateAutoScrollDirection = (vx, vy) => {
                currentScrollSpeed.x = vx;
                currentScrollSpeed.y = vy;
            };

            // stopAutoScroll 保持不变
            const stopAutoScroll = () => {
                if (autoScrollInterval) {
                    clearInterval(autoScrollInterval);
                    autoScrollInterval = null;
                    currentScrollSpeed.x = 0;
                    currentScrollSpeed.y = 0;
                    isScrollingProgrammatically = false;
                }
            };

            // 1. 初始化拖动
            const initMobileResize = (e, task) => {
                if (!isMobile.value) return;

                // 阻止冒泡
                e.stopPropagation();
                // 震动反馈
                window.triggerTouchHaptic('Heavy');

                const touch = e.touches[0];
                const taskEl = e.target.closest('.task-block');
                const rect = taskEl.getBoundingClientRect();

                // 初始化状态
                isResizingMobile.value = true;
                mobileResizeState.task = task;
                mobileResizeState.taskEl = taskEl;
                mobileResizeState.startY = touch.clientY;
                mobileResizeState.startHeight = rect.height; // 记录初始高度
                mobileResizeState.originalDuration = task.estDuration; // 记录原始时长

                // 绑定事件
                // 🟢 关键修改：不需要 capture，因为 touchmove 没有被阻止
                window.addEventListener('touchmove', handleMobileResizeMove, { passive: false });

                // 🟢 核心修复：添加 true (使用捕获模式)
                // 这样即使底下的元素有 @touchend.stop，window 也能先收到通知！
                window.addEventListener('touchend', handleMobileResizeEnd, true);
                window.addEventListener('touchcancel', handleMobileResizeEnd, true);
            };

            // 🟢 修改: 手机端拖动过程 (吸附到 Grid 绝对时间刻度)
            const handleMobileResizeMove = (e) => {
                if (!isResizingMobile.value) return;

                if (e.cancelable) e.preventDefault();

                const touch = e.touches[0];
                const deltaY = touch.clientY - mobileResizeState.startY;

                // 1. 计算目标高度
                const targetHeight = Math.max(5, mobileResizeState.startHeight + deltaY);

                // 2. 转换为分钟
                const rawDurationMins = targetHeight / pxPerMin.value;

                // 3. 计算绝对时间并吸附
                const startMins = timeToMinutes(mobileResizeState.task.startTime);
                const rawEndMins = startMins + rawDurationMins;

                // 吸附到 30 分钟网格
                const snappedEndMins = Math.round(rawEndMins / 30) * 30;

                // 4. 计算新时长
                let newDurationMins = snappedEndMins - startMins;
                if (newDurationMins < 5) newDurationMins = 5;

                const newDurationStr = formatSecs(newDurationMins * 60);

                if (mobileResizeState.task.estDuration !== newDurationStr) {
                    mobileResizeState.task.estDuration = newDurationStr;
                    window.triggerTouchHaptic('Light'); // 只有数值变化时才震动
                }
            };

            // 3. 拖动结束 (核心修正)
            const handleMobileResizeEnd = (e) => {
                // 强制立即重置状态 (必须是第一步，以最高优先级清除标志位)
                const wasResizing = isResizingMobile.value;
                isResizingMobile.value = false;

                // 强制无条件移除监听器 (必须是第二步)
                window.removeEventListener('touchmove', handleMobileResizeMove);

                // 🟢 核心修复：移除时也要带上 true (捕获模式)
                window.removeEventListener('touchend', handleMobileResizeEnd, true);
                window.removeEventListener('touchcancel', handleMobileResizeEnd, true);

                if (resizeRaf) cancelAnimationFrame(resizeRaf);

                // 延迟一小段时间，执行一次 DOM/CSS 级别的重绘操作
                requestAnimationFrame(() => {
                    document.body.style.display = 'none';
                    document.body.offsetHeight; // 强制浏览器计算
                    document.body.style.display = '';

                    const taskEl = mobileResizeState.taskEl;
                    if (taskEl) {
                        taskEl.style.opacity = '';
                        taskEl.style.transition = '';
                    }
                });

                // 只有确定是拖拽操作时，才执行耗时的冲突检测和数据保存
                if (wasResizing) {
                    setTimeout(() => {
                        const t = mobileResizeState.task;
                        // 🟢 防御性编程：防止 t 为空导致报错
                        if (!t) return;

                        const newDurationStr = t.estDuration;
                        let type = 'musician';
                        if (t.projectId) type = 'project';
                        else if (t.instrumentId) type = 'instrument';

                        // 执行冲突检测
                        if (checkOverlap(t.date, t.startTime, newDurationStr, t.scheduleId, type)) {
                            t.estDuration = mobileResizeState.originalDuration; // 冲突回退
                            openAlertModal('冲突', '调整后的时间与现有任务冲突');
                            window.triggerTouchHaptic('Error');
                        } else {
                            // 无冲突则保存
                            const m = parseTime(t.musicDuration);
                            const r = parseTime(t.estDuration);
                            if (m > 0) t.ratio = (r / m).toFixed(1);
                            pushHistory();
                            window.triggerTouchHaptic('Success');
                        }

                        // 确保清除引用
                        mobileResizeState.task = null;
                    }, 0);
                }
            };

            // 🟢 修改: calcTrackDiff 支持多维度
            const calcTrackDiff = (item) => {
                // 1. 获取当前视图类型
                const viewType = trackListData.value.viewType || 'musician';

                // 2. 获取对应记录对象
                const record = item.records[viewType];
                if (!record) return;

                if (record.recStart && record.recEnd) {
                    const [sh, sm] = record.recStart.split(':').map(Number);
                    const [eh, em] = record.recEnd.split(':').map(Number);

                    let startMins = sh * 60 + sm;
                    let endMins = eh * 60 + em;

                    if (endMins < startMins) endMins += 24 * 60;

                    let diffMins = endMins - startMins;

                    if (record.breakMinutes && record.breakMinutes > 0) {
                        diffMins -= parseInt(record.breakMinutes);
                    }

                    if (diffMins < 0) diffMins = 0;
                    const diffSecs = diffMins * 60;

                    // 3. 写入对应记录
                    record.actualDuration = formatSecs(diffSecs);

                    // 触发保存 (注意 saveTrackRecord 也需要修改)
                    saveTrackRecord(item);

                    autoResizeScheduleByRecords(true);

                    // 3. 🟢 在这里统一保存一次历史 (这是唯一的一次)
                    // pushHistory();
                }
            };

            const setTrackBreak = (item) => {
                const viewType = trackListData.value.viewType || 'musician';
                const record = item.records[viewType]; // 获取对应记录

                openInputModal(
                    '设置中断/休息时长',
                    record.breakMinutes ? String(record.breakMinutes) : '',
                    '请输入分钟数',
                    (val) => {
                        const mins = parseInt(val);
                        record.breakMinutes = (isNaN(mins) || mins < 0) ? 0 : mins;
                        calcTrackDiff(item);
                        pushHistory();
                    },
                    '这段时间将从总录制时长中扣除'
                );
            };

            // 4. 辅助函数：启动拖拽模式
            const startMobileDrag = (originalEl, touch) => {
                // 1. 记录并变淡原元素
                dragSourceEl = originalEl;
                dragSourceEl.style.opacity = '0.3'; // 变淡，提示用户它被“拿”起来了

                window.triggerTouchHaptic('Medium');

                // 2. 创建克隆体 (保持之前的逻辑不变)
                dragElClone = originalEl.cloneNode(true);

                // 设置克隆体样式 (固定定位，浮在最上层)
                Object.assign(dragElClone.style, {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: `${originalEl.offsetWidth}px`,
                    height: `${originalEl.offsetHeight}px`,
                    zIndex: '9999',
                    opacity: '0.9',
                    pointerEvents: 'none', // 关键：让触摸事件穿透克隆体
                    transform: `translate3d(${touch.clientX - cloneOffsetX}px, ${touch.clientY - cloneOffsetY}px, 0)`,
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                    transition: 'none' // 禁止过渡动画，保证跟随手指无延迟
                });
                dragElClone.style.opacity = '0.9';

                // 添加到 Body
                document.body.appendChild(dragElClone);
            };


            // 🟢 存储触摸时的起始点，用于计算偏移量
            const initialTouchCoords = reactive({x: 0, y: 0});

            // 🟢 存储被拖拽元素的原始 DOM 引用 (可选，但有助于某些复杂操作)
            const draggingTaskElement = ref(null);

            // --- 🟢 新增：获取 Capacitor 插件引用 ---
            // 注意：这里不能用 import，必须从全局对象取
            // --- 🟢 新增：震动与通知功能函数 ---
            const scheduleReminder = async (title, body, delaySeconds = 5) => {
                try {
                    const result = await deviceService.scheduleReminder(title, body, delaySeconds);
                    if (result.reason === 'permission-denied') {
                        openAlertModal("请授权通知权限，否则无法提醒！");
                    } else if (result.skipped) {
                        console.log("非 App 环境，跳过通知");
                    }
                } catch (e) {
                    console.error("通知设置失败", e);
                    openAlertModal("通知设置出错：" + e.message);
                }
            };

            // 🟢 [修改] 计算单曲效率 (依赖 sidebarTab)
            const calculateSingleRatio = (item) => {
                // 优先使用弹窗的 viewType，如果没有则使用侧边栏的当前 Tab
                let type = 'musician';
                if (trackListData.value && showTrackList.value) {
                    type = trackListData.value.viewType;
                } else {
                    type = sidebarTab.value || 'musician';
                }

                // 读取对应维度的记录
                const record = item.records?.[type];
                if (!record || !record.actualDuration || !item.musicDuration) return '-';

                const actualSec = parseTime(record.actualDuration);
                const musicSec = parseTime(item.musicDuration);
                if (musicSec === 0) return '-';
                return (actualSec / musicSec).toFixed(1);
            };

            // --- V11.7 Session 状态 ---
            const currentSessionId = ref('');

            // --- V11.9 Session UI 辅助逻辑 ---

            // 1. 获取当前 Session 名称 (用于显示在按钮上)
            const currentSessionName = computed(() => {
                const s = settings.sessions.find(x => x.id === currentSessionId.value);
                return s ? s.name : '未命名日程';
            });

            // 2. 切换 Session
            const switchSession = (id) => {
                currentSessionId.value = id;
                activeDropdown.value = null; // 选完关闭菜单
            };

            // 🟢 修改后的 handleSessionAction
            const handleSessionAction = (action) => {
                if (action === 'new') {
                    // 替换 prompt
                    openInputModal('新建日程', '', '请输入日程名称 (例如: 2026 春季录音)', (name) => {
                        if (name) {
                            const newId = generateUniqueId('S');
                            settings.sessions.push({id: newId, name: name});
                            currentSessionId.value = newId;
                            pushHistory();
                        }
                    });
                } else if (action === 'rename') {
                    const current = settings.sessions.find(s => s.id === currentSessionId.value);
                    // 替换 prompt
                    openInputModal('重命名日程', current.name, '请输入新名称', (name) => {
                        if (name) {
                            current.name = name;
                            pushHistory();
                        }
                    });
                    // 🟢 修改部分
                } else if (action === 'delete') {
                    if (settings.sessions.length <= 1) {
                        openAlertModal('无法删除', '至少需要保留一个日程。');
                        return;
                    }

                    // 替换 confirm
                    openConfirmModal(
                        '删除日程',
                        '确定删除当前日程？\n（属于该日程的任务仍然会保留在日程表中）',
                        () => {
                            const idx = settings.sessions.findIndex(s => s.id === currentSessionId.value);
                            settings.sessions.splice(idx, 1);
                            currentSessionId.value = settings.sessions[0].id;
                            pushHistory();
                            window.triggerTouchHaptic('Success');
                        },
                        true // isDestructive = true (红色按钮)
                    );
                }
                activeDropdown.value = null;
            };

            // --- 🟢 顶部菜单与主题逻辑 ---
            const showMobileMenu = ref(false);

            // 🟢 核心修改: 引入三态主题管理 (Auto / Light / Dark)

            // 1. 定义状态: 优先读取本地存储，没有则默认为 'auto'
            const themeMode = ref(storageService.getItem('theme_mode') || 'auto');

            // isDark 依然保留，作为"当前实际生效颜色"的计算结果，供界面其他部分(如图表颜色)使用
            const isDark = ref(document.documentElement.classList.contains('dark'));

            // 2. 应用主题的核心函数
            const applyTheme = () => {
                let shouldBeDark = false;

                if (themeMode.value === 'auto') {
                    // 如果是自动模式，查询系统偏好
                    shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                } else {
                    // 否则直接根据设定值
                    shouldBeDark = themeMode.value === 'dark';
                }

                // 操作 DOM
                const html = document.documentElement;
                if (shouldBeDark) {
                    html.classList.add('dark');
                    isDark.value = true;
                } else {
                    html.classList.remove('dark');
                    isDark.value = false;
                }
            };

            // 3. 切换按钮点击事件 (Auto -> Light -> Dark -> Auto 循环)
            const toggleTheme = () => {
                const modes = ['auto', 'light', 'dark'];
                const nextIndex = (modes.indexOf(themeMode.value) + 1) % modes.length;

                themeMode.value = modes[nextIndex];

                // 保存到本地
                storageService.setItem('theme_mode', themeMode.value);

                applyTheme();
            };

            // 4. 获取当前模式的显示名称和图标 (供 HTML 使用)
            const getThemeLabel = computed(() => {
                if (themeMode.value === 'auto') return {text: '跟随系统', icon: 'fa-desktop'};
                if (themeMode.value === 'dark') return {text: '深色模式', icon: 'fa-moon'};
                return {text: '浅色模式', icon: 'fa-sun'};
            });

            // --- 🟢 头像裁剪与上传逻辑 ---
            const showCropModal = ref(false);
            const cropImgSrc = ref('');
            const cropImgRef = ref(null); // 绑定到 <img> 标签
            let cropper = null; // 存放 Cropper 实例

            // --- 🟢 通用确认/提示弹窗状态 (Universal Confirm/Alert) ---
            const showConfirmModal = ref(false);
            const confirmModalConfig = reactive({
                title: '',
                content: '',
                confirmText: '确定',
                cancelText: '取消',
                isAlert: false,      // true=只有确定按钮, false=有确定和取消
                isDestructive: false,// true=按钮变红(用于删除等危险操作)
                onConfirm: null,
                onCancel: null // <--- 🟢 新增这一行
            });



            // 1. 打开提示框 (替代 alert)
            const openAlertModal = (title, content, callback) => {
                confirmModalConfig.title = title;
                confirmModalConfig.content = content;
                confirmModalConfig.isAlert = true;
                confirmModalConfig.isDestructive = false;
                confirmModalConfig.confirmText = '我知道了';
                confirmModalConfig.onConfirm = callback;
                showConfirmModal.value = true;
                window.triggerTouchHaptic('Light'); // 轻微震动
            };

            // 2. 打开确认框 (替代 confirm)
            const openConfirmModal = (title, content, onConfirm, isDestructive = false, confirmText = '确定', cancelText = '取消') => {
                confirmModalConfig.title = title;
                confirmModalConfig.content = content;
                confirmModalConfig.isAlert = false;
                confirmModalConfig.isDestructive = isDestructive;
                confirmModalConfig.confirmText = confirmText;
                confirmModalConfig.cancelText = cancelText;
                confirmModalConfig.onConfirm = onConfirm;
                showConfirmModal.value = true;
                window.triggerTouchHaptic('Medium'); // 警告震动
            };

            const closeConfirmModal = () => {
                // 🟢 如果定义了 onCancel 回调，则执行 (用于处理二选一的情况)
                if (confirmModalConfig.onCancel) {
                    confirmModalConfig.onCancel();
                }

                showConfirmModal.value = false;
                // 延迟清理回调
                setTimeout(() => {
                    confirmModalConfig.onConfirm = null;
                    confirmModalConfig.onCancel = null; // 🟢 清理 onCancel
                }, 300);
            };

            const handleConfirmAction = () => {
                // 1. 执行确认回调 (保留原名)
                if (confirmModalConfig.onConfirm) {
                    confirmModalConfig.onConfirm();
                }

                // 🟢 核心修复: 执行完确认后，必须手动清空 onCancel
                // 这样在调用 closeConfirmModal 时，就不会再次触发“取消/自动合并”的逻辑了
                confirmModalConfig.onCancel = null;

                // 2. 关闭弹窗
                closeConfirmModal();
            };

            // --- 🟢 通用输入弹窗状态 (Universal Input Modal) ---
            const showInputModal = ref(false);
            const universalInputRef = ref(null);
            const inputModalConfig = reactive({
                title: '',
                value: '',
                placeholder: '',
                hint: '',
                callback: null // 存储点击确定后的回调函数
            });

            // 打开弹窗的通用方法
            const openInputModal = (title, initialValue, placeholder, callback, hint = '') => {
                inputModalConfig.title = title;
                inputModalConfig.value = initialValue;
                inputModalConfig.placeholder = placeholder;
                inputModalConfig.callback = callback;
                inputModalConfig.hint = hint;
                showInputModal.value = true;

                // 自动聚焦输入框
                Vue.nextTick(() => {
                    if (universalInputRef.value) universalInputRef.value.focus();
                    if (universalInputRef.value) universalInputRef.value.select(); // 全选文本方便修改
                });
            };

            const closeInputModal = () => {
                showInputModal.value = false;
                inputModalConfig.callback = null; // 清理回调
            };

            const confirmInputModal = () => {
                if (!inputModalConfig.value.trim()) {
                    // 如果是必填项，可以在这里拦截，或者允许空值由回调函数自己判断
                    // 这里我们简单处理：如果是空的且不是文件名导出，给个震动反馈或不做反应
                }

                if (inputModalConfig.callback) {
                    inputModalConfig.callback(inputModalConfig.value.trim());
                }
                closeInputModal();
            };

            // 🟢 新增: 快速添加弹窗的状态
            const showQuickAddModal = ref(false);
            const quickAddType = ref(''); // 'project', 'instrument', 'musician'
            const quickAddForm = reactive({name: '', group: '', defaultRatio: 20});

            // 🟢 新增: 计算属性，专门用于 Quick Add 弹窗的分组列表
            // 这能确保当 quickAddType 变化或 settings 数据变化时，列表能自动更新
            const currentQuickAddGroups = computed(() => {
                // 显式访问 .value，确保依赖被追踪
                const type = quickAddType.value;
                // 复用已有的获取逻辑
                return getExistingGroups(type);
            });

            // 🟢 新增: 打开快速添加弹窗
            const openQuickAdd = (type) => {
                quickAddType.value = type;
                quickAddForm.name = '';
                quickAddForm.group = '';
                quickAddForm.defaultRatio = 20;
                showQuickAddModal.value = true;

                // 自动聚焦输入框
                setTimeout(() => {
                    const input = document.getElementById('quick-add-name');
                    if (input) input.focus();
                }, 100);
            };

            // 🟢 [修改] confirmQuickAdd: 统一为所有类型添加 defaultRatio
            const confirmQuickAdd = () => {
                const nameStr = quickAddForm.name.trim();
                if (!nameStr) return openAlertModal("名称不能为空");

                const type = quickAddType.value;

                // 1. 获取对应列表
                let list = [];
                let label = '';
                if (type === 'instrument') {
                    list = settings.instruments;
                    label = '乐器';
                } else if (type === 'musician') {
                    list = settings.musicians;
                    label = '演奏员';
                } else if (type === 'project') {
                    list = settings.projects;
                    label = '项目';
                }

                // 🟢 2. 核心修复: 检查重名 (不区分大小写)
                if (list.some(i => i.name.toLowerCase() === nameStr.toLowerCase())) {
                    window.triggerTouchHaptic('Error');
                    return openAlertModal('无法添加', `该${label}名称 "${nameStr}" 已存在！`);
                }

                // 3. 执行添加
                const idPrefix = type === 'project' ? 'P' : (type === 'instrument' ? 'I' : 'M');
                const newId = generateUniqueId(idPrefix);

                const newItemObj = {
                    id: newId,
                    name: nameStr,
                    group: quickAddForm.group.trim(),
                    color: generateRandomHexColor(),
                    defaultRatio: quickAddForm.defaultRatio || 20 // 🟢 核心修改: 所有类型都赋予默认倍率
                };

                if (type === 'project') {
                    settings.projects.push(newItemObj);
                    newItem.projectId = newId;
                } else if (type === 'instrument') {
                    settings.instruments.push(newItemObj);
                    newItem.instrumentId = newId;
                } else if (type === 'musician') {
                    settings.musicians.push(newItemObj);
                    newItem.musicianId = newId;
                    onMusicianSelect();
                }

                pushHistory();
                showQuickAddModal.value = false;
                activeDropdown.value = null;
                window.triggerTouchHaptic('Success');
            };



            // 1. 用户选择文件 -> 打开裁剪弹窗
            const onFileSelect = (event) => {
                const file = event.target.files[0];
                if (!file) return;

                // 放宽大小限制到 20MB
                if (file.size > 20 * 1024 * 1024) return openAlertModal("图片太大了，请选择 20MB 以下的图片");

                const reader = new FileReader();
                reader.onload = (e) => {
                    //
                    // const arrayBuffer = e.target.result;
                    //
                    // // 打印到控制台或显示在页面上
                    // console.log("解析结果：", cleanNames);
                    // 重置状态
                    cropImgSrc.value = e.target.result;
                    showCropModal.value = true;

                    Vue.nextTick(() => {
                        // 1. 先彻底销毁旧实例
                        if (cropper) {
                            cropper.destroy();
                            cropper = null;
                        }

                        const imgEl = cropImgRef.value;
                        if (!imgEl) return;

                        // 2. 定义初始化函数 (增加防抖，防止跑两次)
                        let isInitialized = false;
                        const initCropper = () => {
                            if (isInitialized) return; // 如果已经跑过，直接停止
                            isInitialized = true;

                            cropper = new Cropper(imgEl, {
                                aspectRatio: 1,
                                viewMode: 1,
                                dragMode: 'move',
                                autoCropArea: 1,
                                background: false,
                                checkCrossOrigin: false,
                                ready() {
                                    // 可以在这里加个 console.log 确认只打印了一次
                                    // console.log('Cropper ready');
                                }
                            });
                        };

                        // 3. 智能判断加载状态
                        // 如果图片已经在缓存里加载好了，直接初始化
                        if (imgEl.complete && imgEl.naturalWidth > 0) {
                            initCropper();
                        } else {
                            // 否则监听 load 事件，且只监听一次
                            imgEl.addEventListener('load', initCropper, {once: true});
                        }
                    });
                };
                reader.readAsDataURL(file);

                event.target.value = '';
            };

            // 2. 取消裁剪
            const cancelCrop = () => {
                showCropModal.value = false;
                if (cropper) {
                    cropper.destroy();
                    cropper = null;
                }
            };

            // 3. 确认裁剪并上传
            const confirmCrop = () => {
                if (!cropper) return;

                // 尝试获取裁剪后的 Canvas
                const canvas = cropper.getCroppedCanvas({
                    width: 300,
                    height: 300
                });

                // 🟢 关键修复：如果 canvas 是 null，说明裁剪器还没准备好，或者 CSS 没加载
                if (!canvas) {
                    return openAlertModal("裁剪失败：未能获取到图片内容。\n请检查是否已引入 cropper.min.css 样式文件。");
                }

                authLoading.value = true;

                // 🟢 修改: 使用 'image/webp' 格式，并将质量降为 0.6
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        authLoading.value = false;
                        return openAlertModal("生成图片文件失败");
                    }

                    try {
                        const fileName = `${user.value.id}-${Date.now()}.webp`;
                        const filePath = `${fileName}`;
                        const {error: uploadError} = await supabaseService.uploadAvatar(filePath, blob, {
                            contentType: 'image/webp', // 显式指定类型
                            upsert: true
                        });

                        if (uploadError) throw uploadError;

                        // 获取 URL
                        const {data} = supabaseService.getAvatarPublicUrl(filePath);
                        const publicUrl = data.publicUrl;

                        // 更新用户资料
                        const {error: updateError} = await supabaseService.updateUser({
                            data: {avatar_url: publicUrl}
                        });

                        if (updateError) throw updateError;

                        // 更新成功
                        user.value = (await supabaseService.getUser()).data.user;

                        // 关闭弹窗
                        cancelCrop();
                        openAlertModal("头像更新成功！");

                    } catch (error) {
                        console.error(error);
                        openAlertModal("上传失败: " + error.message);
                    } finally {
                        authLoading.value = false;
                    }

                }, 'image/webp', 0.6); // 使用 webp 格式和 0.6 质量
            };

            // 🟢 修改: 删除列表任务
            const deleteTrackFromList = (itemToDelete) => {
                // 🛡️ 1. [新增] 检查是否为末端任务
                if (!checkCanDeleteSplit(itemToDelete)) return;

                // 🟢 2. 尝试归还时间
                restoreSplitTime(itemToDelete);

                // 3. 从全局任务池中删除
                itemPool.value = itemPool.value.filter(i => i.id !== itemToDelete.id);

                // 4. 从当前弹窗列表中删除
                trackListData.value.items = trackListData.value.items.filter(i => i.id !== itemToDelete.id);

                // 5. 如果弹窗还开着，保存历史
                if (showTrackList.value) {
                    pushHistory();
                }

                // 震动反馈
                window.triggerTouchHaptic('Medium');
            };

            // 🟢 新增: 监听 TrackList 弹窗关闭
            // 当弹窗关闭时，统一执行一次全局清理，移除那些变空的日程块
            watch(showTrackList, (isOpen) => {
                if (!isOpen) {
                    // 弹窗刚关闭 -> 执行清理
                    cleanupEmptySchedules();

                    // 可选：保存一次历史，确保清理后的状态被记录
                    // pushHistory();
                }
            });


            // 🟢 新增: 自动计算时间差
            const autoCalcDuration = () => {
                const start = trackListData.value.actualStart;
                const end = trackListData.value.actualEnd;

                if (start && end) {
                    const [sh, sm] = start.split(':').map(Number);
                    const [eh, em] = end.split(':').map(Number);

                    let startMins = sh * 60 + sm;
                    let endMins = eh * 60 + em;

                    // 如果结束时间小于开始时间，假设是跨天 (加24小时)
                    if (endMins < startMins) endMins += 24 * 60;

                    const diffSecs = (endMins - startMins) * 60;
                    trackListData.value.actualDuration = formatSecs(diffSecs);
                }
            };

            // 🟢 修改: 保存录音时间并强制更新视图
            const saveScheduleActualTime = () => {
                const currentScheduleId = trackListData.value.taskRef.scheduleId;

                if (!currentScheduleId) return;

                // 1. 更新数据
                // 使用 map 创建新数组，确保触发 Vue 的响应式更新
                scheduledTasks.value = scheduledTasks.value.map(task => {
                    if (task.scheduleId === currentScheduleId) {
                        return {
                            ...task, // 复制原对象
                            actualStartTime: trackListData.value.actualStart,
                            actualEndTime: trackListData.value.actualEnd,
                            actualDuration: trackListData.value.actualDuration
                        };
                    }
                    return task;
                });

                pushHistory();

                // 2. 提示用户
                openAlertModal("✅ 录音时间已保存！\n该演奏员的「真实平均比值」已在侧边栏自动更新。");


            };

            // 🟢 新增: 保存单曲实际用时
            const saveTrackActual = (item) => {
                // 找到源数据并更新
                const task = scheduledTasks.value.find(t => t.scheduleId === item.scheduleId);
                if (task) {
                    task.actualDuration = item.actualDuration;
                    // 强制更新数组以触发 computed 重新计算
                    scheduledTasks.value = [...scheduledTasks.value];

                    // 保存到历史
                    // pushHistory(); // 可选：如果不希望每次输入字符都存历史，可以不加
                }
            };

            // 🟢 新增: 检查任务归属的资源是否已完成 (用于保护已完成任务不被误删)
            const isResourceCompleted = (task) => {
                if (!task) return false;

                const currentTab = sidebarTab.value;
                let stat = null;
                let list = [];

                // 根据当前侧边栏视图，获取对应的统计列表和 ID
                if (currentTab === 'project') {
                    list = projectStats.value;
                    if (task.projectId) stat = list.find(i => i.id === task.projectId);
                } else if (currentTab === 'instrument') {
                    list = instrumentStats.value;
                    if (task.instrumentId) stat = list.find(i => i.id === task.instrumentId);
                } else {
                    // 默认为 musician
                    list = musicianStats.value;
                    if (task.musicianId) stat = list.find(i => i.id === task.musicianId);
                }

                // 如果找到了对应统计对象，且状态为 completed (蓝色完成态)，则返回 true
                return stat && stat.statusKey === 'completed';
            };

            // 🟢 [重写] 删除当前日程块 (修复聚合任务状态不更新的问题)
            const deleteCurrentSchedule = () => {
                const taskToDelete = trackListData.value.taskRef;
                if (!taskToDelete) return;

                // 🟢 新增: 拦截已完成任务
                if (isResourceCompleted(taskToDelete)) {
                    window.triggerTouchHaptic('Error');
                    return openAlertModal("无法删除", "当前归属对象（人员/项目/乐器）已标记为【完成】。\n\n为防止误操作，请先清除该对象下部分曲目的录音数据，使其回到“进行中”状态后再尝试删除。");
                }

                // --- 1. 尝试清理关联的录音数据 ---
                if (taskToDelete.templateId) {
                    // 情况 A: 单曲任务 (有明确 ID) -> 直接清理该 ID
                    clearPoolRecord(taskToDelete.templateId);
                } else {
                    // 情况 B: 聚合任务 (没有 ID) -> 利用 Section 匹配清理
                    // 逻辑：当前弹窗显示的第 X 段 (currentSectionIndex)，对应的就是我们要删的这个日程块

                    const currentIdx = trackListData.value.currentSectionIndex;
                    const viewType = trackListData.value.viewType || 'musician';

                    // 遍历弹窗内的所有条目
                    if (trackListData.value.items) {
                        let hasCleared = false;
                        let targetId = null;

                        trackListData.value.items.forEach(item => {
                            // 🟢 核心修复: 只有属于当前分段 (sectionIndex) 的任务才会被清理
                            // 这样不会误删同一个人在其他日程块里的录音数据
                            if (item.sectionIndex === currentIdx) {

                                // 执行清理
                                if (item.records && item.records[viewType]) {
                                    // 只有当有数据时才清理，避免无效操作
                                    if (item.records[viewType].actualDuration || item.records[viewType].recStart) {
                                        item.records[viewType].actualDuration = '';
                                        item.records[viewType].recStart = '';
                                        item.records[viewType].recEnd = '';
                                        item.records[viewType].breakMinutes = 0;
                                        hasCleared = true;
                                    }

                                    // 记录一个 ID 用于触发效率更新 (取第一个即可)
                                    if (!targetId) {
                                        if (viewType === 'project') targetId = item.projectId;
                                        else if (viewType === 'instrument') targetId = item.instrumentId;
                                        else targetId = item.musicianId;
                                    }
                                }
                            }
                        });

                        // 如果有数据被清理，触发一次效率更新，确保左侧大卡片进度条回退
                        if (hasCleared && targetId) {
                            autoUpdateEfficiency(targetId, viewType, false);
                        }
                    }
                }

                // --- 2. 从日程数组中物理删除 ---
                scheduledTasks.value = scheduledTasks.value.filter(t => t.scheduleId !== taskToDelete.scheduleId);

                // --- 3. 关闭并保存 ---
                showTrackList.value = false;
                pushHistory();
                window.triggerTouchHaptic('Medium');

                // 提示用户
                // openAlertModal("删除成功", "日程及其包含的录音数据已清除。");
            };

            // 🟢 [新增] 清理任务池本体的录音记录
            const clearPoolRecord = (templateId) => {
                if (!templateId) return;

                const poolItem = itemPool.value.find(i => i.id === templateId);
                if (poolItem && poolItem.records) {
                    // 遍历所有视图类型，彻底清除该任务的“实际录音数据”
                    ['musician', 'project', 'instrument'].forEach(type => {
                        if (poolItem.records[type]) {
                            poolItem.records[type].actualDuration = '';
                            poolItem.records[type].recStart = '';
                            poolItem.records[type].recEnd = '';
                            poolItem.records[type].breakMinutes = 0;
                        }
                    });

                    // 同时也尝试触发一次效率更新，以防这个删除影响了平均值
                    // (虽然 calculateGroupStats 会自动重算，但这里确保数据层同步)
                    if (poolItem.musicianId) autoUpdateEfficiency(poolItem.musicianId, 'musician', false);
                    if (poolItem.projectId) autoUpdateEfficiency(poolItem.projectId, 'project', false);
                }
            };

            // 🟢 新增：在 TrackList 弹窗中修改提醒时间
            const onTrackListReminderChange = (task) => {
                if (!task) return;

                // 1. 调用之前写好的更新通知函数
                // (确保你之前已经添加了 updateTaskNotification 函数)
                if (typeof updateTaskNotification === 'function') {
                    updateTaskNotification(task);
                }

                // 2. 保存数据到历史记录
                pushHistory();

                // 3. (可选) 给个轻微震动反馈
                window.triggerTouchHaptic('Light');
            };

            // --- V9.7.4: settings.projects 取代 settings.projectColors ---
            const settings = reactive({
                startHour: 10, endHour: 22,
                sessions: [
                    {id: 'S_DEFAULT', name: '默认录音日程'} // 初始默认 Session
                ],
                instruments: [
                    {id: 'Imi7d0318nsj', name: '曲笛 Qudi', color: '#60a5fa', group: 'Ethnic Woodwinds'},
                    {id: 'Imi7d1wio42g', name: '大笛 Dadi', color: '#60a5fa', group: 'Ethnic Woodwinds'},
                    {id: 'Imi7d1zhnrin', name: '箫 Xiao', color: '#60a5fa', group: 'Ethnic Woodwinds'},
                    {id: 'Imi7d22qbj3x', name: '管子 Guanzi', color: '#60a5fa', group: 'Ethnic Woodwinds'},
                    {id: 'Imi7d25hgyts', name: '葫芦丝 Hulusi', color: '#60a5fa', group: 'Ethnic Woodwinds'},
                    {id: 'Imi7d28dmhcu', name: '嘟嘟克 Duduk', color: '#60a5fa', group: 'Ethnic Woodwinds'},
                    {id: 'Imi7d2czbme5', name: '奈伊笛 Ney', color: '#60a5fa', group: 'Ethnic Woodwinds'},
                    {id: 'Imi7d2fipt2s', name: '古筝 Guzheng', color: '#60a5fa', group: 'Ethnic Plucks'},
                    {id: 'Imi7d2irx4rn', name: '琵琶 Pipa', color: '#60a5fa', group: 'Ethnic Plucks'},
                    {id: 'Imi7d2lzuq1k', name: '中阮 Zhongruan', color: '#60a5fa', group: 'Ethnic Plucks'},
                    {id: 'Imi7d2okw95k', name: '大阮 Daruan', color: '#60a5fa', group: 'Ethnic Plucks'},
                    {id: 'Imi7d2usilyh', name: '扬琴 Yangqin', color: '#60a5fa', group: 'Ethnic Plucks'},
                    {id: 'Imi7d2ypsa3n', name: '三弦 Sanxian', color: '#60a5fa', group: 'Ethnic Plucks'},
                    {id: 'Imi7d321n3ff', name: '二胡 Erhu', color: '#60a5fa', group: 'Ethnic Strings'},
                    {id: 'Imi7d35n8ore', name: '马头琴 Matouqin', color: '#60a5fa', group: 'Ethnic Woodwinds'},
                    {id: 'Imi7d38kux53', name: '萨塔尔 Sataer', color: '#60a5fa', group: 'Ethnic Strings'},
                    {id: 'Imi7d3b4omfr', name: '古典吉他 Classical Guitar', color: '#60a5fa', group: 'Plucks'},
                    {id: 'Imi7d3drxrgi', name: '钢弦吉他 Acoustic Guitar', color: '#60a5fa', group: 'Plucks'},
                    {id: 'Imi7d3gz35vm', name: '萨兹琴 Saz', color: '#60a5fa', group: 'Ethnic Plucks'},
                    {id: 'Imi7d3jqoe3p', name: '西塔尔 Sitar', color: '#60a5fa', group: 'Ethnic Plucks'},
                    {id: 'Imi7d3lxykzm', name: '笙 Sheng', color: '#60a5fa', group: 'Ethnic Woodwinds'},
                    {id: 'Imi7d3pcnpbh', name: '尺八 Shakuhachi', color: '#60a5fa', group: 'Ethnic Woodwinds'},
                    {id: 'Imi7d3s0hrcp', name: '人声 Vocal', color: '#60a5fa', group: 'Vocal'},
                    {
                        id: 'tmi8ygljxuqkaatv',
                        name: '低音马头琴 Diyin Matouqin',
                        color: '#60a5fa',
                        group: 'Ethnic Strings'
                    },
                    {id: 'tmifto6q9igynzmf', name: '钢琴 Piano', color: '#60a5fa', group: 'Keys'}
                ],
                musicians: [],
                // V9.7.4: 新增 Projects 列表
                projects: [],
                // 🟢 [新增] 录音信息元数据列表
                studios: [],
                engineers: [],
                operators: [],
                assistants: []
            });

            // 🟢 [新增] 录音信息弹窗的下拉菜单状态
            const activeRecDropdown = ref(null); // 'studio', 'engineer', 'operator', 'assistant'
            const recDropdownSearch = ref('');

            // 🟢 [新增] 获取当前下拉菜单的可选列表 (支持搜索)
            const filteredRecOptions = computed(() => {
                const type = activeRecDropdown.value;
                const search = recDropdownSearch.value.toLowerCase().trim();
                let list = [];

                if (type === 'studio') list = settings.studios;
                else if (type === 'engineer') list = settings.engineers;
                else if (type === 'operator') list = settings.operators;
                else if (type === 'assistant') list = settings.assistants;

                if (!list) return [];

                // 过滤
                let result = list.filter(item => item.name.toLowerCase().includes(search));

                // 排序 (按名称)
                result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }));
                return result;
            });

            // 🟢 [新增] 选中下拉项
            const selectRecOption = (item) => {
                // 将选中的名字填入 form
                if (activeRecDropdown.value) {
                    recInfoForm[activeRecDropdown.value] = item.name;
                }
                // 关闭菜单
                activeRecDropdown.value = null;
                recDropdownSearch.value = '';
            };

            // 🟢 [新增] 在下拉中新建条目
            const createRecOption = () => {
                const name = recDropdownSearch.value.trim();
                const type = activeRecDropdown.value;
                if (!name || !type) return;

                // 1. 存入 settings
                let list = null;
                if (type === 'studio') list = settings.studios;
                else if (type === 'engineer') list = settings.engineers;
                else if (type === 'operator') list = settings.operators;
                else if (type === 'assistant') list = settings.assistants;

                if (list) {
                    // 查重
                    const exists = list.some(i => i.name.toLowerCase() === name.toLowerCase());
                    if (!exists) {
                        list.push({
                            id: generateUniqueId('REC'), // 简单生成一个ID
                            name: name
                        });
                        pushHistory(); // 保存历史
                    }
                }

                // 2. 填入输入框
                recInfoForm[type] = name;

                // 3. 关闭
                activeRecDropdown.value = null;
                recDropdownSearch.value = '';
                window.triggerTouchHaptic('Success');
            };

            currentSessionId.value = 'S_DEFAULT';

            // 🟢 新增: 通用排序函数 (优先按 Group 排序，分组相同的按 Name 拼音排序)
            const sortSettingsList = (list) => {
                return [...list].sort((a, b) => {
                    const gA = (a.group || '').trim();
                    const gB = (b.group || '').trim();

                    // 1. 分组逻辑: 有分组的排前面，没分组(空)的排后面
                    if (gA && !gB) return -1;
                    if (!gA && gB) return 1;

                    // 2. 如果都有分组，按分组名称拼音排序
                    if (gA !== gB) return gA.localeCompare(gB, 'zh-CN');

                    // 3. 分组相同，按名称拼音排序
                    return (a.name || '').localeCompare(b.name || '', 'zh-CN');
                });
            };

            // 🟢 新增: 三个排序后的计算属性 (供 HTML 渲染使用)
            const sortedInstruments = computed(() => sortSettingsList(settings.instruments));
            const sortedMusicians = computed(() => sortSettingsList(settings.musicians));
            const sortedProjects = computed(() => sortSettingsList(settings.projects));

            const removeInstrument = (id) => {
                openConfirmModal(
                    '删除乐器',
                    '确定删除该乐器吗？\n⚠ 警告：所有关联的任务（任务池及日程）都将被永久删除！',
                    () => {
                        // 1. 从设置中删除
                        settings.instruments = settings.instruments.filter(i => i.id !== id);

                        // 2. 从任务池删除关联任务
                        itemPool.value = itemPool.value.filter(item => item.instrumentId !== id);

                        // 3. 从日程表删除关联任务
                        scheduledTasks.value = scheduledTasks.value.filter(task => task.instrumentId !== id);

                        // 4. 清理可能变空的日程块
                        cleanupEmptySchedules();

                        pushHistory();
                        window.triggerTouchHaptic('Medium');
                    },
                    true // 红色按钮
                );
            };

            const removeMusician = (id) => {
                openConfirmModal(
                    '删除演奏员',
                    '确定删除该演奏员吗？\n⚠ 警告：所有关联的任务（任务池及日程）都将被永久删除！',
                    () => {
                        // 1. 从设置中删除
                        settings.musicians = settings.musicians.filter(m => m.id !== id);

                        // 2. 从任务池删除关联任务
                        itemPool.value = itemPool.value.filter(item => item.musicianId !== id);

                        // 3. 从日程表删除关联任务
                        scheduledTasks.value = scheduledTasks.value.filter(task => task.musicianId !== id);

                        // 4. 清理可能变空的日程块
                        cleanupEmptySchedules();

                        pushHistory();
                        window.triggerTouchHaptic('Medium');
                    },
                    true
                );
            };

            const deleteProject = (projectId) => {
                openConfirmModal(
                    '删除项目',
                    '确定删除该项目吗？\n⚠ 警告：所有关联的任务（任务池及日程）都将被永久删除！',
                    () => {
                        // 1. 从设置中删除
                        settings.projects = settings.projects.filter(p => p.id !== projectId);

                        // 2. 从任务池删除关联任务
                        itemPool.value = itemPool.value.filter(item => item.projectId !== projectId);

                        // 3. 从日程表删除关联任务
                        scheduledTasks.value = scheduledTasks.value.filter(task => task.projectId !== projectId);

                        // 4. 清理可能变空的日程块
                        cleanupEmptySchedules();

                        pushHistory();
                        window.triggerTouchHaptic('Medium');
                    },
                    true
                );
            };


            // V9.7.4: newItem 现在绑定 projectId
            const newItem = reactive({projectId: '', instrumentId: '', musicianId: '', musicDuration: '', ratio: 20});

            // 🟢 [修复] 自动认领逻辑 (增加重置机制)
            const autoFillMidiDuration = () => {
                const newPid = newItem.projectId;
                const newIid = newItem.instrumentId;

                if (!newPid || !newIid) return;

                const proj = settings.projects.find(p => p.id === newPid);

                // 1. 尝试获取该乐器的 MIDI 数据
                let midiList = [];

                if (proj && proj.midiData) {
                    const midiEntry = proj.midiData[newIid];
                    if (midiEntry) {
                        if (Array.isArray(midiEntry)) {
                            midiList = midiEntry;
                        } else if (typeof midiEntry === 'string') {
                            midiList = [{ name: getNameById(newIid, 'instrument'), duration: midiEntry }];
                        }
                    }
                }

                // 🟢 2. 核心修复: 如果没有找到 MIDI 数据，必须显式重置！
                if (midiList.length === 0) {
                    newItem.musicDuration = '';       // 清空时长
                    newItem.estDuration = '00:00:00'; // 重置预估
                    newItem._autoSuggestedName = null;// 清除自动命名建议
                    return;
                }

                // --- 以下是有数据时的逻辑 (保持不变) ---

                // 实时计算已存在的任务数量 (认领 Guzheng 1 / 2)
                const existingTasks = itemPool.value.filter(t =>
                    (t.sessionId || 'S_DEFAULT') === currentSessionId.value &&
                    t.projectId === newPid &&
                    t.instrumentId === newIid
                );

                let targetIndex = existingTasks.length;
                if (targetIndex >= midiList.length) {
                    targetIndex = midiList.length - 1;
                }

                const targetData = midiList[targetIndex];

                // 填充数据
                newItem.musicDuration = targetData.duration;

                const baseInstName = getNameById(newIid, 'instrument');
                if (targetData.name && targetData.name !== baseInstName) {
                    newItem._autoSuggestedName = targetData.name;
                } else {
                    newItem._autoSuggestedName = null;
                }

                let ratio = 20;
                if (newItem.musicianId) {
                    const mus = settings.musicians.find(m => m.id === newItem.musicianId);
                    if (mus && mus.defaultRatio) ratio = mus.defaultRatio;
                }
                newItem.ratio = ratio;
                newItem.estDuration = calculateEstTime(newItem.musicDuration, ratio);
            };

            // 🟢 [修改] 监听器 1: 当用户在下拉菜单改变选择时触发
            watch(() => [newItem.projectId, newItem.instrumentId], () => {
                autoFillMidiDuration();
            });

            // 🟢 [新增] 监听器 2: 当新建弹窗打开时，强制重新检查一遍
            // 解决场景：创建完 Guzheng 1 后关闭弹窗，再打开弹窗想创建 Guzheng 2，
            // 此时 instrumentId 没变，如果不强制检查，时长还是 1 的。
            watch(showMobileTaskInput, (isOpen) => {
                if (isOpen) {
                    autoFillMidiDuration();
                }
            });

            // 🟢 修改: 纯粹的登录逻辑 (不再自动跳转注册)
            const handleLogin = async () => {
                if (!authForm.email || !authForm.password) return openAlertModal("请输入邮箱和密码");
                authLoading.value = true;

                // 1. 尝试登录
                const {data, error} = await supabaseService.signInWithPassword({
                    email: authForm.email, password: authForm.password
                });

                if (error) {
                    // 🟢 关键修改: 登录失败就是失败，不再自动尝试注册
                    // 这样输错密码时，就会明确提示 "Invalid login credentials" (账号或密码错误)
                    if (error.message.includes("Invalid login credentials")) {
                        openAlertModal("登录失败：账号或密码错误");
                    } else {
                        openAlertModal("登录失败: " + error.message);
                    }
                } else {
                    user.value = data.user;
                    showAuthModal.value = false;
                    await loadCloudData(); // 加载数据
                }
                authLoading.value = false;
            };

            // 🟢 新增: 独立的注册逻辑
            const handleRegister = async () => {
                if (!authForm.email || !authForm.password) return openAlertModal("请输入邮箱和密码");
                authLoading.value = true;

                const {data, error} = await supabaseService.signUp({
                    email: authForm.email, password: authForm.password
                });

                if (error) {
                    openAlertModal("注册失败: " + error.message);
                } else {
                    // Supabase 默认行为：如果该邮箱已注册，signUp 不会报错，但返回的 user 为 null (或假数据)
                    // 我们提示用户去确认邮件或直接登录
                    if (data.user && data.user.identities && data.user.identities.length === 0) {
                        openAlertModal("该邮箱已被注册，请直接登录 (若忘记密码请点击找回)。");
                    } else {
                        openAlertModal("注册成功！\n请检查您的邮箱进行验证，验证后即可登录。");
                    }
                }
                authLoading.value = false;
            };

            // --- 🟢 新增：设置单个任务的系统通知 ---
            const updateTaskNotification = async (task) => {
                try {
                    const result = await deviceService.updateTaskNotification(task, {
                        title: `准备录音: ${getNameById(task.musicianId, 'musician')}`,
                        body: `${task.startTime} 开始 (${getNameById(task.projectId, 'project')})`
                    });
                    if (!result.skipped) console.log('✅ 通知已设定');
                } catch (e) {
                    console.error("设置通知失败:", e);
                }
            };

            // 🟢 新增: 找回密码逻辑
            const handleResetPwd = async () => {
                if (!authForm.email) return openAlertModal("请先在上方输入您的邮箱地址");

                authLoading.value = true;
                const {data, error} = await supabaseService.resetPasswordForEmail(authForm.email, {
                    redirectTo: window.location.origin, // 重置后跳回当前页面
                });

                if (error) {
                    openAlertModal("发送失败: " + error.message);
                } else {
                    openAlertModal(`重置邮件已发送至 ${authForm.email}\n请查收邮件并点击链接重设密码。`);
                }
                authLoading.value = false;
            };

            // 🟢 新增: 个人中心逻辑

            // 计算当前显示的头像 (优先读取 user_metadata)
            const userAvatar = computed(() => {
                if (user.value && user.value.user_metadata && user.value.user_metadata.avatar_url) {
                    return user.value.user_metadata.avatar_url;
                }
                return null;
            });

            // --- 🟢 新增: 昵称管理逻辑 ---
            const tempNickname = ref('');

            // 计算显示名称 (优先显示 full_name，否则显示邮箱前缀)
            const userDisplayName = computed(() => {
                if (user.value && user.value.user_metadata && user.value.user_metadata.full_name) {
                    return user.value.user_metadata.full_name;
                }
                return user.value ? user.value.email.split('@')[0] : 'Guest';
            });

            // 更新昵称到 Supabase
            const updateNickname = async () => {
                if (!user.value) return;
                if (!tempNickname.value.trim()) return openAlertModal("昵称不能为空");

                authLoading.value = true;
                try {
                    const {data, error} = await supabaseService.updateUser({
                        data: {full_name: tempNickname.value.trim()}
                    });

                    if (error) throw error;

                    user.value = data.user; // 更新本地用户数据以刷新 UI
                    // alert("昵称已更新！"); // 可选：不喜欢弹窗可以注释掉
                    // 这里我们不关闭菜单，方便用户看到变化
                } catch (error) {
                    openAlertModal("更新失败: " + error.message);
                } finally {
                    authLoading.value = false;
                }
            };

            // 🚩🚩🚩 替换 factoryReset 函数的完整定义 🚩🚩🚩

            const factoryReset = () => {
                openConfirmModal(
                    '恢复出厂设置',
                    '⚠确定要清空所有数据吗？\n\n如果当前为登录状态，云端数据也将被永久清除。此操作不可逆！',
                    // 确认执行的异步回调函数
                    async () => {
                        // 1. 如果已登录，清空云端数据 (核心修改点)
                        if (user.value) {
                            // 删除 Supabase 中 user_data 表中与当前用户 ID 匹配的行
                            const { error } = await supabaseService.deleteUserData(user.value.id);

                            if (error) {
                                console.error("Cloud data deletion failed:", error);
                                // 即使云端删除失败，也要继续进行本地清理和刷新
                                openAlertModal('云端清理失败', '无法删除云端数据，请检查网络或稍后重试。');
                            } else {
                                // 云端删除成功后，给用户一个明确提示 (注意：刷新后这个弹窗会消失)
                                openAlertModal('云端数据已清除', '您的所有数据已从云端永久清除。');
                            }
                        }

                        // 2. 清理本地数据
                        storageService.removeItem('v9_data');
                        // 3. 清除引导记录
                        storageService.removeItem('musche_tour_seen');

                        localDataVersion.value = 0;

                        // 4. 刷新页面
                        window.location.reload();
                    },
                    true, // isDestructive: 红色按钮
                    '彻底清空',
                    '再想想'
                );
            };

            // 处理顶部按钮点击
            // 🔴 修改: 加入互斥逻辑
            // 🔴 修改: 处理顶部头像按钮点击 (合并了之前的互斥逻辑和昵称填充)
            const handleUserBtnClick = () => {
                if (user.value) {
                    const wasOpen = showProfileMenu.value;

                    // 1. 强制关闭其他菜单 (互斥)
                    activeDropdown.value = null;
                    showMobileMenu.value = false;

                    // 2. 切换自己
                    showProfileMenu.value = !wasOpen;

                    // 3. 如果打开了，初始化数据
                    if (showProfileMenu.value) {
                        // 填充头像 URL
                        tempAvatarUrl.value = userAvatar.value || '';
                        // 填充当前昵称 (如果有)
                        tempNickname.value = userDisplayName.value;
                    }
                } else {
                    showAuthModal.value = true;
                }
            };

            // 更新头像到 Supabase
            const updateAvatar = async () => {
                if (!user.value) return;

                const url = tempAvatarUrl.value.trim();

                // 调用 Supabase 更新用户元数据
                const {data, error} = await supabaseService.updateUser({
                    data: {avatar_url: url}
                });

                if (error) {
                    openAlertModal("更新失败: " + error.message);
                } else {
                    // 更新本地 user 对象以立即刷新 UI
                    user.value = data.user;
                    openAlertModal("头像已更新！");
                }
            };

            // 🟢 新增: 判断是否为默认倍率 (用于隐藏卡片上的倍率标签)
            const isDefaultRatio = (item) => {
                // 1. 如果没有倍率，视作默认（隐藏）
                if (!item.ratio) return true;

                const val = Number(item.ratio);

                // 2. 尝试找到对应演奏员的默认倍率配置
                if (item.musicianId) {
                    const m = settings.musicians.find(u => u.id === item.musicianId);
                    // 如果该演奏员有特定的默认倍率，则与该值比较
                    if (m && m.defaultRatio) {
                        return val === Number(m.defaultRatio);
                    }
                }

                // 3. 如果找不到特定配置，则兜底比较全局默认值 20
                return val === 20;
            };


            // 🟢 [重写] 独立维度的效率更新 (修复: 设为 null 以保持自动跟随)
            const autoUpdateEfficiency = (targetId, viewType, shouldPushHistory = true) => {
                if (!targetId || !viewType) return;

                // 1. 确定 ID 匹配键
                let idKey = 'musicianId';
                let list = settings.musicians;
                if (viewType === 'project') {
                    idKey = 'projectId';
                    list = settings.projects;
                } else if (viewType === 'instrument') {
                    idKey = 'instrumentId';
                    list = settings.instruments;
                }

                // 2. 筛选任务 (只计算当前 Session)
                const items = itemPool.value.filter(i => i[idKey] === targetId && (i.sessionId || 'S_DEFAULT') === currentSessionId.value);

                let totalActual = 0;
                let totalMusic = 0;

                items.forEach(item => {
                    ensureItemRecords(item);
                    // 只读取当前维度 (viewType) 的录音记录
                    const rec = item.records[viewType];
                    if (rec && rec.actualDuration && item.musicDuration) {
                        const act = parseTime(rec.actualDuration);
                        const mus = parseTime(item.musicDuration);
                        if (act > 0 && mus > 0) {
                            totalActual += act;
                            totalMusic += mus;
                        }
                    }
                });

                // 3. 计算新的平均倍率
                // 🟢 修复: 如果没有录音数据(totalMusic=0)，不要强制重置为 20
                // 而是应该回退使用该对象的 defaultRatio (如果设置过)，否则才用 20
                let newRatio = 0;

                if (totalMusic > 0) {
                    newRatio = parseFloat((totalActual / totalMusic).toFixed(1));
                }

                // 4. 更新设置里的 defaultRatio
                const settingItem = list.find(i => i.id === targetId);
                let oldDefaultRatio = 20;

                if (settingItem) {
                    oldDefaultRatio = settingItem.defaultRatio || 20;

                    if (newRatio > 0) {
                        // 有真实数据，更新设置
                        settingItem.defaultRatio = newRatio;
                    } else {
                        // 无真实数据，使用现有的设置值作为“新倍率”去更新任务
                        newRatio = oldDefaultRatio;
                    }
                } else {
                    if (newRatio === 0) newRatio = 20;
                }

                // 5. 更新所有相关任务 (包括任务池和日程表)
                const updateTaskLogic = (task) => {
                    if (task[idKey] !== targetId || !task.musicDuration) return;

                    ensureItemRecords(task);

                    // A. 获取该任务在当前维度的旧倍率
                    const currentDimRatio = task.ratios[viewType];

                    // B. 智能判断：
                    // 如果该任务的倍率等于旧的默认值 (说明之前就在跟随)，或者是 0/空/null
                    // 或者等于 20 (旧数据的默认值)
                    if (!currentDimRatio || currentDimRatio == oldDefaultRatio || parseFloat(currentDimRatio) === 20) {

                        // 🟢 核心修复: 设为 null，表示"自动跟随"
                        task.ratios[viewType] = null;

                        // 🟢 2. 更新主显示属性 (为了日程表显示正确)
                        // 日程表(Schedule View)不走 calculateGroupStats 的实时计算，它是静态显示的
                        // 所以这里必须把最新的 newRatio 赋值给 task.ratio 和 task.estDuration
                        if (task.ratio !== newRatio) {
                            task.ratio = newRatio;
                            task.estDuration = calculateEstTime(task.musicDuration, newRatio);
                        }
                    }
                };

                // 执行更新
                itemPool.value.forEach(updateTaskLogic);
                scheduledTasks.value.forEach(updateTaskLogic);

                // if (shouldPushHistory) {
                //     pushHistory();
                // }
            };

            // 🟢 新增: 处理头像文件上传
            const handleAvatarUpload = async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                // 1. 限制文件大小 (例如 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    return openAlertModal("图片太大了，请选择 2MB 以下的图片");
                }

                // 更改按钮文字显示状态（可选优化）
                const btnText = document.getElementById('upload-text');
                if (btnText) btnText.innerText = "上传中...";

                try {
                    // 2. 生成文件名: user_id + 时间戳 + 后缀
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${user.value.id}-${Date.now()}.${fileExt}`;
                    const filePath = `${fileName}`;

                    // 3. 上传到 'avatars' 桶
                    const {error: uploadError} = await supabaseService.uploadAvatar(filePath, file);

                    if (uploadError) throw uploadError;

                    // 4. 获取公开访问 URL
                    const {data} = supabaseService.getAvatarPublicUrl(filePath);

                    const publicUrl = data.publicUrl;

                    // 5. 更新用户元数据 (Metadata)
                    const {data: userData, error: updateError} = await supabaseService.updateUser({
                        data: {avatar_url: publicUrl}
                    });

                    if (updateError) throw updateError;

                    // 成功！
                    user.value = userData.user;
                    openAlertModal("头像上传成功！");

                } catch (error) {
                    openAlertModal("上传失败: " + error.message);
                    console.error(error);
                } finally {
                    if (btnText) btnText.innerText = "选择图片...";
                    event.target.value = ''; // 重置 input，允许重复选择同一文件
                }
            };

            // 🟢 新增: 登出逻辑
            // 🟢 修改: 暴力清除所有缓存，确保退出后不会自动登录
            // 🟢 修改: 退出登录时，只清除身份信息，保留本地数据 (v9_data)
            const handleLogout = async () => {
                // 1. 界面上置空用户
                user.value = null;

                // 2. 执行 Supabase 登出
                // (Supabase 会自动清除浏览器中与账号相关的 sb-xxx-token，但不会动你的 v9_data)
                try {
                    await supabaseService.signOut();
                } catch (e) {
                    console.error("Cloud signout failed:", e);
                }

                // 🔴 关键修改: 删除之前写的 localStorage.clear() 或 removeItem
                // 我们不再清除本地存储，这样“游客模式”的数据或者刚才同步下来的数据都会留在本地

                // 3. 提示并刷新
                openAlertModal("已退出账号连接。");

                localDataVersion.value = 0;

                // 刷新页面，此时 onMounted 会发现没登录，从而加载本地的 v9_data
                window.location.reload();
            };

            // 🟢 修改: 优化后的加载逻辑 (支持版本控制)
            const loadCloudData = async () => {
                if (!user.value) return;

                // 1. 从云端拉取数据，同时查询 content 和 version
                const {data, error} = await supabaseService.loadUserData(user.value.id);

                if (data && data.content) {
                    console.log("✅ 已加载云端数据, 版本:", data.version);
                    const d = data.content;

                    // 🟢 关键: 更新本地版本号
                    localDataVersion.value = data.version || 0;

                    // 恢复逻辑 (保持不变)
                    if (d.pool) itemPool.value = d.pool;
                    if (d.tasks) scheduledTasks.value = d.tasks;

                    if (d.settings) {
                        settings.startHour = d.settings.startHour;
                        settings.endHour = d.settings.endHour;
                        if(d.settings.sessions) settings.sessions = d.settings.sessions;
                        if(d.settings.instruments) settings.instruments = d.settings.instruments;
                        if(d.settings.musicians) settings.musicians = d.settings.musicians;
                        if(d.settings.projects) settings.projects = d.settings.projects;
                        if(d.settings.studios) settings.studios = d.settings.studios;
                        if(d.settings.engineers) settings.engineers = d.settings.engineers;
                        if(d.settings.operators) settings.operators = d.settings.operators;
                        if(d.settings.assistants) settings.assistants = d.settings.assistants;

                        if (d.settings.lastSessionId) {
                            const exists = settings.sessions.find(s => s.id === d.settings.lastSessionId);
                            currentSessionId.value = exists ? exists.id : settings.sessions[0].id;
                        }
                    }
                } else {
                    // 云端无数据逻辑 (保持不变)
                    console.log("⚠️ 云端无数据");
                    localDataVersion.value = 0; // 重置版本

                    const localData = storageService.loadData('v9_data');
                    if (localData) {
                        const hasRealData = (localData.pool && localData.pool.length > 0) || (localData.tasks && localData.tasks.length > 0);

                        if (hasRealData) {
                            openConfirmModal(
                                '数据冲突',
                                '检测到您本地有旧数据，而云端是空的。\n\n您希望如何处理？',
                                async () => {
                                    // 上传本地数据逻辑
                                    const dataToUpload = {
                                        pool: localData.pool || [],
                                        tasks: localData.tasks || [],
                                        settings: localData.settings || settings
                                    };
                                    // 初始上传，版本设为 1
                                    const {error: uploadError} = await supabaseService.saveUserData(user.value.id, dataToUpload, 1);

                                    if (!uploadError) {
                                        localDataVersion.value = 1;
                                        openAlertModal('成功', '✅ 本地数据已成功上传！');
                                    } else {
                                        openAlertModal('上传失败', uploadError.message);
                                    }
                                },
                                false,
                                '上传本地数据',
                                '放弃本地数据'
                            );
                        }
                    }
                }
            };

            // 🟢 修改: 增加版本检查的保存逻辑 (解决 Race Condition)
            const saveToCloud = async (force = false) => {
                if (!user.value) return;

                saveStatus.value = 'saving';

                try {
                    // --- 步骤 1: 检查云端最新版本 ---
                    // 我们只查询 version 字段，开销很小
                    const { data: serverRecord, error: checkError } = await supabaseService.fetchUserDataVersion(user.value.id);

                    // 如果查询出错且不是"查无此人"(PGRST116)，则报错
                    if (checkError && checkError.code !== 'PGRST116') throw checkError;

                    const serverVersion = serverRecord ? serverRecord.version : 0;

                    // 🚨 核心判断: 如果云端版本 > 本地版本，说明有人捷足先登了
                    if (serverVersion > localDataVersion.value && !force) {
                        console.warn(`版本冲突: 本地 v${localDataVersion.value} vs 云端 v${serverVersion}`);
                        saveStatus.value = 'error';
                        window.triggerTouchHaptic('Error');

                        // 弹出冲突提示
                        openConfirmModal(
                            '⚠ 数据同步冲突',
                            '检测到云端有更新的数据（可能您在其他设备进行了操作）。\n\n为了防止数据覆盖，请先同步最新数据。',
                            async () => {
                                await handleManualSync(); // 引导用户拉取
                            },
                            false,
                            '立即同步 (推荐)',
                            '暂不处理'
                        );
                        return; // ⛔️ 终止保存
                    }

                    // --- 步骤 2: 准备保存 ---
                    const newVersion = serverVersion + 1; // 版本号 +1

                    const dataToSave = {
                        pool: itemPool.value,
                        tasks: scheduledTasks.value,
                        settings: {...settings, lastSessionId: currentSessionId.value}
                    };

                    // --- 步骤 3: 执行写入 ---
                    const { error: saveError } = await supabaseService.saveUserData(user.value.id, dataToSave, newVersion);

                    if (saveError) throw saveError;

                    // ✅ 保存成功: 更新本地版本号
                    localDataVersion.value = newVersion;
                    console.log(`云端同步完成 (v${newVersion})`);

                    setTimeout(() => {
                        saveStatus.value = 'saved';
                    }, 500);

                } catch (e) {
                    console.error("保存失败", e);
                    saveStatus.value = 'error';
                }
            };

            // --- V11.8 自定义下拉菜单状态 ---
            const activeDropdown = ref(null); // 当前打开的菜单: 'project' | 'instrument' | 'musician' | null
            const dropdownSearch = ref('');   // 下拉菜单内的搜索词

            // 1. 设置弹窗的分组状态
            const settingsExpandedGroups = reactive(new Set()); // 默认空Set，即全部折叠

            // 2. 下拉菜单的分组状态
            const dropdownExpandedGroups = reactive(new Set()); // 默认空Set，即全部折叠

            const toggleDropdownGroup = (groupName) => {
                if (dropdownExpandedGroups.has(groupName)) {
                    dropdownExpandedGroups.delete(groupName);
                } else {
                    dropdownExpandedGroups.add(groupName);
                }
            };

            // 3. 监听搜索框：如果用户开始搜索，自动展开所有下拉分组，方便查找
            watch(dropdownSearch, (val) => {
                if (val && val.trim()) {
                    // 搜索时不清空 Set，而是逻辑上视为全展开 (在 HTML v-show 中处理)
                } else {
                    // 搜索清空时，恢复之前的折叠状态（或者你可以选择在这里 dropdownExpandedGroups.clear() 来全部折叠）
                    dropdownExpandedGroups.clear();
                }
            });

            // 🟢 修改 toggleDropdown: 每次打开菜单时，重置为全折叠状态
            const toggleDropdown = (type) => {
                if (activeDropdown.value === type) {
                    activeDropdown.value = null;
                } else {
                    showMobileMenu.value = false;
                    showProfileMenu.value = false;
                    activeDropdown.value = type;
                    dropdownSearch.value = '';
                    activeGroupFilter.value = '全部';

                    // 重置折叠状态
                    dropdownExpandedGroups.clear();

                    setTimeout(() => {
                        const input = document.querySelector('.custom-dropdown-menu input[placeholder*="搜索"]');
                        if (input) input.focus();
                    }, 50);
                }
            };

            // 🟢 新增: 分组筛选状态
            const activeGroupFilter = ref('全部');

            // 🟢 修改: 支持 edit_ 前缀
            const availableGroups = computed(() => {
                const type = activeDropdown.value;
                if (!type) return [];

                // 同时去除 mobile_ 和 edit_ 前缀
                const realType = type.replace('mobile_', '').replace('edit_', '');

                let list = [];
                if (realType === 'project') list = settings.projects;
                else if (realType === 'instrument') list = settings.instruments;
                else if (realType === 'musician') list = settings.musicians;

                // ... (后续去重排序逻辑保持不变)
                const groups = new Set(list.map(i => (i.group && i.group.trim()) ? i.group : '未分组'));
                const sorted = Array.from(groups).sort((a, b) => {
                    if (a === '未分组') return 1;
                    if (b === '未分组') return -1;
                    return a.localeCompare(b, 'zh-CN');
                });

                return ['全部', ...sorted];
            });

            // 🔴 新增: 切换手机菜单 (互斥其他)
            const toggleMobileMenu = () => {
                const wasOpen = showMobileMenu.value;
                // 先关闭其他所有菜单
                activeDropdown.value = null;
                showProfileMenu.value = false;
                // 再切换自己
                showMobileMenu.value = !wasOpen;
            };


            // 🟢 修复: 统一管理所有下拉菜单的“点击外部关闭”逻辑
            const closeDropdowns = (e) => {
                // 1. 主界面下拉菜单 & 用户菜单
                const insideSelect = e.target.closest('.custom-select-container');
                const insideUser = e.target.closest('.user-menu-container');

                if (!insideSelect && !insideUser) {
                    activeDropdown.value = null;
                    showProfileMenu.value = false;
                    showMobileMenu.value = false;
                }

                // 2. Settings 弹窗里的分组下拉
                // 如果点击的目标不在 settings-group-wrapper 内部，且当前是打开状态，则关闭
                const insideSettingsGroup = e.target.closest('.settings-group-wrapper');
                if (!insideSettingsGroup && settingsGroupFocus.value) {
                    settingsGroupFocus.value = null;
                }

                // ✨✨✨ 新增：Settings 弹窗里的【名称】下拉 ✨✨✨
                const insideSettingsName = e.target.closest('.settings-name-wrapper');
                if (!insideSettingsName && settingsNameFocus.value) {
                    settingsNameFocus.value = null;
                }

                // 3. Quick Add 弹窗里的分组下拉
                // 如果点击的目标不在 quick-add-group-wrapper 内部，且当前是打开状态，则关闭
                const insideQuickAddGroup = e.target.closest('.quick-add-group-wrapper');
                if (!insideQuickAddGroup && showGroupSuggestions.value) {
                    showGroupSuggestions.value = false;
                }
                // 🟢 [新增] 关闭录音信息下拉
                const insideRec = e.target.closest('.rec-dropdown-wrapper');
                if (!insideRec && activeRecDropdown.value) {
                    activeRecDropdown.value = null;
                }
            };

            // 🟢 修改: 支持 edit_ 前缀
            const filteredOptions = computed(() => {
                const search = dropdownSearch.value.toLowerCase();
                const type = activeDropdown.value;
                if (!type) return [];

                // 同时去除 mobile_ 和 edit_ 前缀
                const realType = type.replace('mobile_', '').replace('edit_', '');

                let list = [];
                if (realType === 'project') list = settings.projects;
                else if (realType === 'instrument') list = settings.instruments;
                else if (realType === 'musician') list = settings.musicians;

                // ... (后续搜索、筛选、排序逻辑保持不变)
                let result = list.filter(i => i.name.toLowerCase().includes(search));

                if (activeGroupFilter.value !== '全部') {
                    result = result.filter(i => {
                        const g = (i.group && i.group.trim()) ? i.group : '未分组';
                        return g === activeGroupFilter.value;
                    });
                }

                // 🟢 修复: 启用自然排序
                result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }));
                return result;
            });

            // 🟢 新增 helper: 将平铺的数组转换为分组对象 {'分组A': [item1], '分组B': [item2]}
            const getGroupedOptions = (list) => {
                const groups = {};
                const defaultKey = '未分组'; // 默认分组名称

                list.forEach(item => {
                    // 如果没有设置 group 字段，归入默认分组
                    const g = item.group && item.group.trim() ? item.group : defaultKey;
                    if (!groups[g]) groups[g] = [];
                    groups[g].push(item);
                });

                // 稍微排个序，把“未分组”放到最后，其他分组按名称排
                const sortedKeys = Object.keys(groups).sort((a, b) => {
                    if (a === defaultKey) return 1;
                    if (b === defaultKey) return -1;
                    return a.localeCompare(b, 'zh-CN');
                });

                // 构造有序的遍历数组
                return sortedKeys.map(key => ({
                    name: key,
                    items: groups[key]
                }));
            };

            // 🟢 修改: 支持编辑模式赋值
            const selectOption = (type, item) => {
                // 1. 判断当前上下文：如果是编辑模式 (activeDropdown 以 edit_ 开头)
                if (activeDropdown.value && activeDropdown.value.startsWith('edit_')) {
                    const realType = activeDropdown.value.replace('edit_', '');

                    if (realType === 'project') editingItem.value.projectId = item.id;
                    else if (realType === 'instrument') editingItem.value.instrumentId = item.id;
                    else if (realType === 'musician') editingItem.value.musicianId = item.id;

                    // 选中后关闭
                    activeDropdown.value = null;
                    return;
                }

                // 2. 原有的新建模式逻辑 (保持不变)
                if (type === 'project') newItem.projectId = item.id;
                if (type === 'instrument') newItem.instrumentId = item.id;
                if (type === 'musician') {
                    newItem.musicianId = item.id;
                    onMusicianSelect();
                }
                activeDropdown.value = null;
            };

            // 在 onMounted 里绑定点击外部关闭
            // onMounted(() => { ... window.addEventListener('click', closeDropdowns); ... })
            // 别忘了在 onUnmounted 移除

            const SLOT_HEIGHT = 40;
            const PX_PER_MIN = 40 / 30;


            // V9.7.4: sortKey/activeColorKey 可以是 projectId
            // 修改：默认分组改为 'projectId' (项目)
            const sortKey = ref('projectId');
            const activeColorKey = ref('projectId');
            // 改用 expandedGroups：存谁展开了，没存的就是折叠的 (默认全空=全折叠)
            const expandedGroups = reactive(new Set());

            // --- V10.3 排序状态管理 ---
            const sortField = ref('status'); // 'name' | 'duration'
            const sortAsc = ref(true);     // true=正序(A-Z, 小-大), false=倒序(Z-A, 大-小)

            // 1. 新建项目的临时状态
            const newSettingsItem = reactive({
                instrument: {name: '', group: ''},
                musician: {name: '', group: ''},
                project: {name: '', group: ''}
            });

            // --- 🟢 新增: 录音元数据管理逻辑 (Settings页面用) ---
            const newRecInputs = reactive({
                studio: '',
                engineer: '',
                operator: '',
                assistant: ''
            });

            const addRecItem = (type) => {
                // 🟢 1. 优先读取输入框中当前填写的文字
                let val = recInfoForm[type];

                // 如果输入框是空的，才弹窗询问 (作为备选方案)
                if (!val || !val.trim()) {
                    val = prompt(`Enter new ${type} name:`);
                }

                if (val && val.trim()) {
                    const cleanVal = val.trim();
                    const listKey = type + 's'; // studios, engineers...

                    // 🟢 2. 检查是否重复
                    const exists = settings[listKey].some(item => item.name === cleanVal);

                    if (!exists) {
                        // 保存到元数据列表
                        settings[listKey].push({
                            id: Date.now(),
                            name: cleanVal
                        });
                        window.triggerTouchHaptic('Success');

                        // 可选：添加成功后给一点视觉反馈，或者保持下拉框开启以便确认
                        // alert(`Saved "${cleanVal}" to library.`);
                    } else {
                        // 已经在库里了，不做任何事，或者提示已存在
                    }
                }
            };

            const removeRecItem = (type, id) => {
                let list = null;
                if (type === 'studio') list = settings.studios;
                else if (type === 'engineer') list = settings.engineers;
                else if (type === 'operator') list = settings.operators;
                else if (type === 'assistant') list = settings.assistants;

                if (list) {
                    const idx = list.findIndex(i => i.id === id);
                    if (idx !== -1) {
                        list.splice(idx, 1);
                        pushHistory();
                        window.triggerTouchHaptic('Medium');
                    }
                }
            };

            // --- 🟢 分组选择器状态管理 ---
            const showGroupSuggestions = ref(false); // 用于 Quick Add 弹窗
            const settingsGroupFocus = ref(null);    // 用于 Settings 弹窗，存储当前聚焦的类型 ('instrument'/'musician'/'project')

            // 2. 获取分组后的列表 (核心逻辑) - 🟢 修复: 启用 numeric: true 自然排序
            const getSettingsGroupedList = (type) => {
                let list = [];
                if (type === 'instrument') list = settings.instruments;
                else if (type === 'musician') list = settings.musicians;
                else if (type === 'project') list = settings.projects;

                const groups = {};
                const defaultKey = '未分组';

                list.forEach(item => {
                    const g = (item.group && item.group.trim()) ? item.group : defaultKey;
                    if (!groups[g]) groups[g] = [];
                    groups[g].push(item);
                });

                // 排序：先按分组名排序（"未分组"放最后），组内按名称排序
                // 🟢 这里加了 { numeric: true }，解决 C10 排在 C2 前面的问题
                return Object.keys(groups).sort((a, b) => {
                    if (a === defaultKey) return 1;
                    if (b === defaultKey) return -1;
                    // 修复分组名排序 (例如 Group 2 vs Group 10)
                    return a.localeCompare(b, 'zh-CN', { numeric: true });
                }).map(key => ({
                    name: key === defaultKey ? '' : key,
                    // 🟢 修复项目名排序 (例如 C2 vs C10)
                    items: groups[key].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }))
                }));
            };

            // 🟢 新增：使用 computed 缓存分组结果，防止页面重绘导致输入框跳动
            const allSettingsGrouped = computed(() => {
                return {
                    project: getSettingsGroupedList('project'),
                    instrument: getSettingsGroupedList('instrument'),
                    musician: getSettingsGroupedList('musician')
                };
            });

            // 🟢 修复: 健壮的分组获取函数
            const getExistingGroups = (type) => {
                // 1. 安全解包: 无论传入的是 Ref 对象还是普通字符串，都统一转为字符串
                let val = type;
                if (typeof type === 'object' && type !== null && 'value' in type) {
                    val = type.value;
                }

                // 如果值为空，直接返回
                if (!val) return [];

                // 2. 移除可能存在的前缀
                // 强制转换为字符串再 replace，防止 val 是非字符串类型导致的报错
                const realType = String(val).replace('mobile_', '');

                // 3. 匹配数据源
                let list = [];
                if (realType === 'instrument') list = settings.instruments;
                else if (realType === 'musician') list = settings.musicians;
                else if (realType === 'project') list = settings.projects;

                // 如果找不到对应列表，返回空
                if (!list || !Array.isArray(list)) return [];

                // 4. 提取分组并去重
                const groups = new Set();
                list.forEach(item => {
                    // 确保 group 字段存在，且不是纯空格
                    if (item.group && typeof item.group === 'string' && item.group.trim() !== '') {
                        groups.add(item.group.trim());
                    }
                });

                // 5. 排序返回 (按拼音排序)
                return Array.from(groups).sort((a, b) => a.localeCompare(b, 'zh-CN'));
            };


            // 4. 重命名分组
            const renameGroup = (type, oldName, newName) => {
                const finalNewName = newName.trim();
                if (oldName === finalNewName) return; // 没变

                let list = [];
                if (type === 'instrument') list = settings.instruments;
                else if (type === 'musician') list = settings.musicians;
                else if (type === 'project') list = settings.projects;

                // 批量更新所有属于该组的项目
                // 如果 oldName 为空，表示将"未分组"的项目归入新组
                // 如果 newName 为空，表示将该组项目变为"未分组"
                list.forEach(item => {
                    const g = (item.group || '').trim();
                    if (g === (oldName || '').trim()) {
                        item.group = finalNewName;
                    }
                });
                pushHistory();
            };

            // 🟢 修改：addSettingsItem (支持“移动分组”逻辑)
            const addSettingsItem = (type) => {
                const form = newSettingsItem[type];
                const nameStr = form.name.trim();
                const groupStr = form.group.trim();

                if (!nameStr && !groupStr) {
                    return openAlertModal('无法添加', '请至少输入 名称 或 分组。');
                }

                let list = [];
                if (type === 'instrument') list = settings.instruments;
                else if (type === 'musician') list = settings.musicians;
                else if (type === 'project') list = settings.projects;

                // 🟢 核心修改：检查是否存在同名项目
                if (nameStr) {
                    const existingItem = list.find(i => i.name.toLowerCase() === nameStr.toLowerCase());

                    if (existingItem) {
                        // ✨ 场景 A: 项目已存在 -> 执行“移动分组”操作
                        if (existingItem.group !== groupStr) {
                            existingItem.group = groupStr;

                            // 如果有新分组，自动展开它
                            if (groupStr) settingsExpandedGroups.add(type + '|' + groupStr);

                            pushHistory();
                            window.triggerTouchHaptic('Success');

                            // 重置输入框，方便下一次操作
                            form.name = '';
                            return; // 结束函数，不创建新 ID
                        } else {
                            // 如果分组也一样，那就是纯重复，报错
                            window.triggerTouchHaptic('Error');
                            return openAlertModal('重复添加', '该项目已存在于当前分组中。');
                        }
                    }
                }

                // ✨ 场景 B: 项目不存在 -> 执行“新建”操作 (原有逻辑)
                const idPrefix = type === 'project' ? 'P' : (type === 'instrument' ? 'I' : 'M');
                const newItem = {
                    id: generateUniqueId(idPrefix),
                    name: nameStr,
                    group: groupStr,
                    color: generateRandomHexColor()
                };
                if (type === 'musician') newItem.defaultRatio = 20;

                list.push(newItem);

                if (groupStr) {
                    settingsExpandedGroups.add(type + '|' + groupStr);
                }

                form.name = '';
                pushHistory();
                window.triggerTouchHaptic('Success');
            };

            watch(viewDate, () => {
                // 重置为默认范围，以新日期为中心
                renderedRange.past = 6;
                renderedRange.future = 18;

                // 如果在月视图，需要稍微延迟定位一下 (复用之前的 scrollToMonthDate)
                if (currentView.value === 'month' && monthViewMode.value === 'scrolled') {
                    scrollToMonthDate(viewDate.value);
                }
            });

            // 6. 删除项目
            const removeSettingsItem = (type, id) => {
                // 使用之前定义的特定删除函数以保留确认弹窗逻辑
                if (type === 'instrument') removeInstrument(id);
                else if (type === 'musician') removeMusician(id);
                else if (type === 'project') deleteProject(id);
            };

            const clearSettingsList = (type) => {
                if (type === 'instrument') clearAllInstruments();
                else if (type === 'musician') clearAllMusicians();
                else if (type === 'project') clearAllProjects();
            }

            // --- 拖拽重分组逻辑 ---
            let settingsDragItem = null;

            // 🟢 修改: 拖拽开始 (仅改变视觉透明度，不影响数据)
            const onSettingsItemDragStart = (item, type, e) => {
                // ✨ 核心修复: 如果用户点击的是 输入框 OR 按钮，阻止拖拽，确保 Click 事件能正常触发
                // 使用 .closest() 确保即使点到按钮里的图标也能被识别
                if (e.target.closest('input, button, select, i')) {
                    e.preventDefault();
                    return;
                }

                settingsDragItem = {item, type};
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', JSON.stringify(item));

                // 让整行变半透明
                // 因为现在 draggable 加在行上，e.target 就是行本身，或者用 currentTarget 更稳
                if (e.currentTarget) {
                    e.currentTarget.style.opacity = '0.4';
                }
            };

            // 🟢 新增: 拖拽结束 (无论成功与否，都强制恢复样式)
            const onSettingsItemDragEnd = (e) => {
                // 1. 恢复整行透明度
                const rowEl = e.target.closest('.group\\/item');
                if (rowEl) {
                    rowEl.style.opacity = '1';
                }

                // 2. 清理全局高亮样式
                document.querySelectorAll('.settings-group-container').forEach(el => {
                    el.classList.remove('drag-over');
                });

                // 3. 清空临时变量
                settingsDragItem = null;
            };

            const onSettingsDragOver = (e) => {
                if (settingsDragItem) {
                    e.preventDefault(); // 允许放置
                    e.currentTarget.classList.add('drag-over');
                }
            };

            const onSettingsDragLeave = (e) => {
                e.currentTarget.classList.remove('drag-over');
            };

            const onSettingsDrop = (targetType, targetGroupName, e) => {
                e.currentTarget.classList.remove('drag-over');
                // 恢复样式
                const draggables = document.querySelectorAll('[draggable=true]');
                draggables.forEach(el => el.style.opacity = '1');

                if (!settingsDragItem) return;

                // 只能在同类型之间拖拽
                if (settingsDragItem.type !== targetType) return;

                // 如果拖到了自己所在的分组，不做处理
                const currentGroup = settingsDragItem.item.group || '';
                const targetGroup = targetGroupName || ''; // 空字符串代表未分组

                if (currentGroup === targetGroup) {
                    settingsDragItem = null;
                    return;
                }

                // 执行移动：更新 group 属性
                settingsDragItem.item.group = targetGroup;

                pushHistory();
                settingsDragItem = null;
                window.triggerTouchHaptic('Light');
            };


            // 通用切换排序函数
            const toggleSort = (field) => {
                if (sortField.value === field) {
                    // 如果点的还是当前字段，就反转顺序
                    sortAsc.value = !sortAsc.value;
                } else {
                    // 如果点了新字段，切换字段
                    sortField.value = field;
                    // 设置默认顺序：名称默认正序(A-Z)，时长默认倒序(从长到短，方便看工作量)
                    sortAsc.value = (field === 'name');
                }
            };

            // 🟢 修改: getSortIcon (增加 Status 图标支持)
            const getSortIcon = (field) => {
                if (sortField.value !== field) return '';
                if (field === 'name') return sortAsc.value ? 'fa-arrow-down-a-z' : 'fa-arrow-up-a-z';
                if (field === 'duration') return sortAsc.value ? 'fa-arrow-up-short-wide' : 'fa-arrow-down-wide-short';
                // status: 正序(完成->未排)用 list-check 图标，倒序用反向
                if (field === 'status') return sortAsc.value ? 'fa-arrow-down-short-wide' : 'fa-arrow-up-wide-short';
                return '';
            };

            const calculateEstTime = (d, r) => formatSecs(parseTime(d) * (r || 1));

            // --- History & Persistence ---
            // --- History & Persistence ---
            const history = ref([]);
            const historyIndex = ref(-1);

            const user = ref(null);
            const showAuthModal = ref(false);
            const authLoading = ref(false);
            const authForm = reactive({email: '', password: ''});
            const authPasswordRef = ref(null);
            let syncTimeout = null; // 用于防抖保存

            // 🟢 新增: 动态计算按比例分配的时间配额
            // 逻辑: (单曲谱面时长 / 列表所有曲目谱面总长) * 日程块总时长
            const calculateProportionalDuration = (item) => {
                // 安全检查: 如果没有日程块引用或列表为空，回退到默认显示
                if (!trackListData.value.taskRef || !trackListData.value.items || trackListData.value.items.length === 0) {
                    return item.estDuration;
                }

                // 1. 获取日程块的总时长 (例如 "10:43 - 11:05" 之间的时长，或者是 taskRef.estDuration)
                // 这里我们使用日程块的 estDuration (即已安排时长)
                const blockSeconds = parseTime(trackListData.value.taskRef.estDuration);

                // 2. 计算当前列表中所有曲目的谱面总长
                let totalMusicSeconds = 0;
                trackListData.value.items.forEach(i => {
                    totalMusicSeconds += parseTime(i.musicDuration || '00:00');
                });

                // 防止除以零
                if (totalMusicSeconds === 0) return item.estDuration;

                // 3. 计算当前曲目的权重并分配时间
                const itemMusicSeconds = parseTime(item.musicDuration || '00:00');
                const allocatedSeconds = (itemMusicSeconds / totalMusicSeconds) * blockSeconds;

                return formatSecs(Math.round(allocatedSeconds));
            };

            // 🟢 [修复版] 获取默认倍率
            // 修复了读取 undefined 报错的问题
            // 移除了对 stats 的循环引用，防止死锁
            const getDefaultRatio = (id, type = 'musician') => {
                let list = [];

                // 1. 安全地获取列表
                if (type === 'project') list = settings.projects;
                else if (type === 'instrument') list = settings.instruments;
                else list = settings.musicians;

                // 🛡️ 防御代码：如果列表尚未初始化或为空，直接返回默认值
                if (!list || !Array.isArray(list)) return 20;

                // 2. 查找设置
                const item = list.find(i => i.id === id);

                // 3. 仅读取设置里的默认值 (断开循环依赖)
                if (item && item.defaultRatio && item.defaultRatio > 0) {
                    return item.defaultRatio;
                }

                return 20;
            };

            const pushHistory = () => {
                if (historyIndex.value < history.value.length - 1) history.value = history.value.slice(0, historyIndex.value + 1);

                // 🟢 修复: 将 settings 也加入到历史记录快照中
                history.value.push(JSON.stringify({
                    pool: itemPool.value,
                    tasks: scheduledTasks.value,
                    settings: settings // 关键修改：保存设置状态
                }));

                historyIndex.value++;
                if (history.value.length > 50) {
                    history.value.shift();
                    historyIndex.value--;
                }
            };

            // 🟢 修复: Undo 撤销函数 (加入 sectionIndex 排序支持)
            const undo = () => {
                if (historyIndex.value > 0) {
                    historyIndex.value--;
                    const s = JSON.parse(history.value[historyIndex.value]);
                    itemPool.value = s.pool;
                    scheduledTasks.value = s.tasks;

                    if (s.settings) {
                        Object.assign(settings, s.settings);
                    }

                    // --- 🟢 TrackList 视图实时刷新 ---
                    if (showTrackList.value && trackListData.value.taskRef) {
                        // 获取当前视图类型 (确保能读到正确的时间记录)
                        const viewType = trackListData.value.viewType || 'musician';

                        // 1. 根据当前上下文筛选任务
                        let list = [];
                        // 如果是按项目查看，就筛选同项目的任务
                        if (viewType === 'project') {
                            list = itemPool.value.filter(i => i.projectId === trackListData.value.taskRef.projectId && (i.sessionId || 'S_DEFAULT') === currentSessionId.value);
                        }
                        // 如果是按乐器查看
                        else if (viewType === 'instrument') {
                            list = itemPool.value.filter(i => i.instrumentId === trackListData.value.taskRef.instrumentId && (i.sessionId || 'S_DEFAULT') === currentSessionId.value);
                        }
                        // 默认按演奏员查看
                        else {
                            list = itemPool.value.filter(i => i.musicianId === trackListData.value.taskRef.musicianId && (i.sessionId || 'S_DEFAULT') === currentSessionId.value);
                        }

                        // 2. 🟢 关键修复: 使用完整的排序逻辑 (先分段，后时间)
                        list.sort((a, b) => {
                            // 第一优先级: 分段索引 (Section)
                            const secA = a.sectionIndex || 0;
                            const secB = b.sectionIndex || 0;
                            if (secA !== secB) return secA - secB;

                            // 第二优先级: 时间 (Time)
                            const recA = a.records?.[viewType];
                            const recB = b.records?.[viewType];
                            const tA = recA?.recStart || '99:99';
                            const tB = recB?.recStart || '99:99';
                            return tA.localeCompare(tB);
                        });

                        // 3. 赋值更新 UI
                        trackListData.value.items = list;
                    }
                }
            };

// 🟢 修复: Redo 重做函数 (加入 sectionIndex 排序支持)
            const redo = () => {
                if (historyIndex.value < history.value.length - 1) {
                    historyIndex.value++;
                    const s = JSON.parse(history.value[historyIndex.value]);
                    itemPool.value = s.pool;
                    scheduledTasks.value = s.tasks;

                    if (s.settings) {
                        Object.assign(settings, s.settings);
                    }

                    // --- 🟢 TrackList 视图实时刷新 ---
                    if (showTrackList.value && trackListData.value.taskRef) {
                        const viewType = trackListData.value.viewType || 'musician';

                        let list = [];
                        if (viewType === 'project') {
                            list = itemPool.value.filter(i => i.projectId === trackListData.value.taskRef.projectId && (i.sessionId || 'S_DEFAULT') === currentSessionId.value);
                        } else if (viewType === 'instrument') {
                            list = itemPool.value.filter(i => i.instrumentId === trackListData.value.taskRef.instrumentId && (i.sessionId || 'S_DEFAULT') === currentSessionId.value);
                        } else {
                            list = itemPool.value.filter(i => i.musicianId === trackListData.value.taskRef.musicianId && (i.sessionId || 'S_DEFAULT') === currentSessionId.value);
                        }

                        // 🟢 关键修复: 同样的排序逻辑
                        list.sort((a, b) => {
                            const secA = a.sectionIndex || 0;
                            const secB = b.sectionIndex || 0;
                            if (secA !== secB) return secA - secB;

                            const recA = a.records?.[viewType];
                            const recB = b.records?.[viewType];
                            const tA = recA?.recStart || '99:99';
                            const tB = recB?.recStart || '99:99';
                            return tA.localeCompare(tB);
                        });

                        trackListData.value.items = list;
                    }
                }
            };

            // 🟢 修改后的 exportToICS
            const exportToICS = () => {
                if (scheduledTasks.value.length === 0) {
                    openAlertModal("日程表是空的");
                    return;
                }

                openInputModal('导出日历 (ICS)', 'recording_schedule.ics', '请输入文件名', (inputName) => {
                    if (!inputName) return;

                    let fileName = inputName;
                    if (!fileName.toLowerCase().endsWith('.ics')) fileName += '.ics';

                    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AudioScheduler//CN\n";
                    scheduledTasks.value.forEach(t => {
                        // ... (中间的生成逻辑保持不变，完全不需要改动) ...
                        const dStr = t.date.replace(/-/g, '');
                        const [sh, sm] = t.startTime.split(':').map(Number);
                        const startStr = `${String(sh).padStart(2, '0')}${String(sm).padStart(2, '0')}00`;
                        const durSec = parseTime(t.estDuration);
                        const endD = new Date(new Date(t.date + 'T' + t.startTime).getTime() + durSec * 1000);
                        const endStr = `${endD.getFullYear()}${String(endD.getMonth() + 1).padStart(2, '0')}${String(endD.getDate()).padStart(2, '0')}T${String(endD.getHours()).padStart(2, '0')}${String(endD.getMinutes()).padStart(2, '0')}00`;

                        const musicianName = getNameById(t.musicianId, 'musician');
                        const instrumentName = getNameById(t.instrumentId, 'instrument');
                        const projectName = getNameById(t.projectId, 'project');

                        ics += `BEGIN:VEVENT\nUID:${t.scheduleId}\nDTSTAMP:${dStr}T${startStr}\nDTSTART:${dStr}T${startStr}\nDTEND:${endStr}\nSUMMARY:${musicianName} - ${instrumentName} (${projectName})\nDESCRIPTION:录制时长:${t.estDuration}\nEND:VEVENT\n`;
                    });
                    ics += "END:VCALENDAR";

                    const blob = new Blob([ics], {type: 'text/calendar'});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName; // 使用输入的文件名
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
            };

            // 🟢 修改后的 exportJSON
            const exportJSON = () => {
                // 自动生成默认文件名
                const now = new Date();
                const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
                const defaultName = `backup_${dateStr}.json`;

                openInputModal('备份数据 (JSON)', defaultName, '请输入文件名', (inputName) => {
                    if (!inputName) return;

                    // 自动补全后缀
                    let fileName = inputName;
                    if (!fileName.toLowerCase().endsWith('.json')) fileName += '.json';

                    const data = {
                        pool: itemPool.value,
                        tasks: scheduledTasks.value,
                        settings: settings
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, '文件将保存到您的下载文件夹');
            };

            // --- 🟢 导入弹窗状态 ---
            const showImportModal = ref(false);

            // 1. 点击菜单中的“恢复数据”时，只打开漂亮的弹窗
            const importJSON = () => {
                showImportModal.value = true;
            };

            // 2. 点击弹窗中间的大区域时，触发隐藏的 input
            const triggerFileSelect = () => {
                const input = document.getElementById("json-upload");
                if (input) {
                    input.value = ''; // 清空上次记录，确保重复选文件有效
                    input.click();
                }
            };

            // 🟢 修改后的 handleJSONFile
            const handleJSONFile = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const data = JSON.parse(ev.target.result);

                        // 简单校验
                        if (!data.pool && !data.tasks && !data.settings) {
                            throw new Error("无效的备份文件");
                        }

                        pushHistory();
                        itemPool.value = data.pool || [];
                        scheduledTasks.value = data.tasks || [];
                        if (data.settings) Object.assign(settings, data.settings);
                        pushHistory();

                        // ✅ 成功后关闭导入弹窗
                        showImportModal.value = false;

                        // 使用我们刚才做的漂亮 Alert 提示成功
                        openAlertModal('导入成功', '数据已成功恢复！');

                    } catch (err) {
                        console.error(err);
                        openAlertModal('导入失败', '文件格式错误或已损坏。');
                    }
                };
                reader.readAsText(file, "UTF-8");
                e.target.value = "";
            };


            onMounted(async () => {
                // 1. 基础初始化 (布局、主题、监听)
                refreshLayout();
                applyTheme();

                // 🟢 [新增] 如果默认是滚动月视图，初始化时自动滚动到今天
                if (currentView.value === 'month' && monthViewMode.value === 'scrolled') {
                    nextTick(() => {
                        scrollToMonthDate(viewDate.value);
                    });
                }

                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                    if (themeMode.value === 'auto') applyTheme();
                });
                window.addEventListener('resize', refreshLayout);
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') {
                        refreshLayout();
                        setTimeout(refreshLayout, 200);
                    }
                });
                window.addEventListener('pageshow', (e) => {
                    if (e.persisted) refreshLayout();
                });
                // 绑定全局事件
                const appElement = document.getElementById('app');
                if (appElement) {
                    appElement.addEventListener('click', (event) => {
                        const target = event.target.closest('button, a, [role="button"], .cursor-pointer, .segment-btn');
                        if (target && !['INPUT', 'TEXTAREA'].includes(target.tagName) && !target.hasAttribute('disabled')) {
                            window.triggerTouchHaptic('Medium');
                        }
                    });
                }
                window.addEventListener('keydown', handleGlobalKey);
                window.addEventListener('mousemove', handleResizeMove);
                window.addEventListener('mouseup', handleResizeEnd);
                window.addEventListener('click', closeDropdowns);

                // 2. 移除加载动画
                const loader = document.getElementById('global-loader');
                if (loader) {
                    setTimeout(() => loader.classList.add('hidden'), 300);
                }

                // ---------------------------------------------------------
                // 🟢 核心数据加载逻辑开始
                // ---------------------------------------------------------

                // 检查云端 Session
                const { data } = await supabaseService.getSession();
                // 🟢 定义初始化函数 (用于出厂设置或第一次打开)
                const initDefaultData = () => {
                    console.log("执行初始化：生成演示数据 (Musician A / Project A)...");

                    // 1. 建立基础设置 (ID固定，方便关联)
                    const demoMusicianId = 'M_DEMO_A';
                    const demoProjectId = 'P_DEMO_A';
                    const demoInstrumentId = 'I_DEMO_A';

                    // 覆盖/初始化 settings
                    settings.musicians = [{ id: demoMusicianId, name: 'Musician A', defaultRatio: 20, color: '#a855f7', group: '' }];
                    settings.projects = [{ id: demoProjectId, name: 'Project A', color: '#eab308', group: '' }];
                    settings.instruments = [{ id: demoInstrumentId, name: 'Instrument A', color: '#3b82f6', group: '' }];

                    // 确保 Session 存在
                    if(settings.sessions.length === 0) {
                        settings.sessions = [{id: 'S_DEFAULT', name: '默认录音日程'}];
                    }
                    currentSessionId.value = settings.sessions[0].id;

                    // 2. 建立任务池 Task-Card
                    const demoTaskId = 'T_DEMO_001';
                    itemPool.value = [{
                        id: demoTaskId,
                        name: '演示曲目', // 这里的 name 不重要，显示的是关联对象的 name
                        sessionId: 'S_DEFAULT',
                        musicianId: demoMusicianId,
                        projectId: demoProjectId,
                        instrumentId: demoInstrumentId,
                        musicDuration: '03:00', // 谱面 3 分钟
                        estDuration: '01:00:00', // 预计 1 小时
                        ratio: 20,
                        trackCount: 1,
                        // 🟢 关键: 初始化记录结构，防止报错
                        records: { musician: {}, project: {}, instrument: {} }
                    }];

                    // 3. 在“今天”建立日程
                    const todayStr = formatDate(new Date());
                    scheduledTasks.value = [{
                        scheduleId: Date.now(),
                        templateId: demoTaskId,
                        sessionId: 'S_DEFAULT',
                        musicianId: demoMusicianId,
                        projectId: demoProjectId,
                        instrumentId: demoInstrumentId,
                        date: todayStr,
                        startTime: '10:00',
                        estDuration: '01:00:00',
                        trackCount: 1,
                        ratio: 20,
                        musicDuration: '03:00',
                        reminderMinutes: 15,
                        sound: 'default'
                    }];

                    // 4. 强制打开侧边栏 (默认状态)
                    isSidebarOpen.value = true;
                    // 并保存这个状态，以免下次刷新又关了
                    storageService.setItem('musche_sidebar_open', 'true');

                    // 5. 展开侧边栏里的第一项 (Musician A)，确保 Guide 能定位到它
                    setTimeout(() => {
                        if (musicianStats.value.length > 0) {
                            expandedStatsIds.add(musicianStats.value[0].id);
                        }
                    }, 100); // 稍作延迟等待 computed 计算
                };

                if (data.session) {
                    // [情况 A] 已登录：加载云端数据
                    user.value = data.session.user;
                    await loadCloudData();

                    // 🚩【核心修复点】：如果已登录但数据是空的，则强制初始化默认数据
                    if (itemPool.value.length === 0 && scheduledTasks.value.length === 0) {
                        // 调用你已实现的初始化函数来创建默认任务、日程和侧边栏状态
                        initDefaultData();
                    }

                } else {
                    // [情况 B] 未登录：检查本地数据
                    const d = storageService.loadData('v9_data') || {};


                    // 🟢 判定逻辑：如果有旧数据，加载旧数据；否则初始化
                    // 判断依据：pool 数组是否有内容
                    if (d.pool && d.pool.length > 0) {
                        // --- 加载旧数据 ---
                        if (d.settings) {
                            // 恢复各项设置 (使用 Object.assign 或手动赋值以保持响应性)
                            settings.startHour = d.settings.startHour;
                            settings.endHour = d.settings.endHour;
                            if(d.settings.sessions) settings.sessions = d.settings.sessions;

                            // 恢复列表 (带 group 字段)
                            if(d.settings.instruments) settings.instruments = d.settings.instruments;
                            if(d.settings.musicians) settings.musicians = d.settings.musicians;
                            if(d.settings.projects) settings.projects = d.settings.projects;

                            // 🟢 [修复] 恢复录音信息元数据 (防止刷新丢失)
                            if(d.settings.studios) settings.studios = d.settings.studios;
                            if(d.settings.engineers) settings.engineers = d.settings.engineers;
                            if(d.settings.operators) settings.operators = d.settings.operators;
                            if(d.settings.assistants) settings.assistants = d.settings.assistants;

                            // 恢复 Session ID
                            if (d.settings.lastSessionId) {
                                const exists = settings.sessions.find(s => s.id === d.settings.lastSessionId);
                                currentSessionId.value = exists ? exists.id : settings.sessions[0].id;
                            }
                        }

                        // 恢复任务 (确保数据结构升级)
                        itemPool.value = d.pool.map(item => ensureItemRecords(item));
                        scheduledTasks.value = d.tasks || [];

                        // 侧边栏状态：读取用户之前的偏好 (在 setup 顶部已读过，这里不需要强制设为 true)
                    } else {
                        // --- 无数据 (首次打开 或 恢复出厂设置后) ---
                        initDefaultData();
                    }
                }

                // 3. 检查是否需要播放新手引导
                const hasSeenTour = storageService.getItem('musche_tour_seen');
                if (!hasSeenTour) {
                    // 稍微延迟，等页面完全渲染、侧边栏展开后再播放
                    setTimeout(() => {
                        startTour();
                        // 注意：startTour 函数内部应当包含 isSidebarOpen.value = true 的逻辑
                    }, 1200);
                }

                // 初始化一次历史记录
                pushHistory();
            });

            onUnmounted(() => {
                window.removeEventListener('keydown', handleGlobalKey);
                window.removeEventListener('mousemove', handleResizeMove);
                window.removeEventListener('mouseup', handleResizeEnd);
                window.removeEventListener('click', closeDropdowns);
            });

            watch([itemPool, scheduledTasks, settings, currentSessionId], () => {
                if (user.value) {
                    // 只要数据一变，立刻变橙色
                    if (saveStatus.value !== 'saving') {
                        saveStatus.value = 'unsaved'; // 🟠 变橙：有改动
                    }

                    clearTimeout(syncTimeout);

                    // ⚡️ 1秒后执行保存 (比之前的2秒更灵敏)
                    syncTimeout = setTimeout(() => {
                        saveToCloud();
                    }, 1000);
                } else {
                    // 【未登录/游客状态】
                    // 1. 仅保存到本地，作为离线数据
                    const dataToSave = {
                        pool: itemPool.value,
                        tasks: scheduledTasks.value,
                        settings: {...settings, lastSessionId: currentSessionId.value}
                    };
                    storageService.saveData('v9_data', dataToSave);
                }

            }, {deep: true});

            // 🟢 修改: addProject (不再生成颜色)
            const addProject = () => {
                settings.projects.push({
                    id: generateUniqueId('P'),
                    name: `新项目${settings.projects.length + 1}`,
                    group: ''
                    // color: ... 已移除
                });
                pushHistory();
            };

            const jumpToGhostContext = (task) => {
                // 🟢 [新增] 上锁：防止原生 dblclick 事件穿透导致误开弹窗
                isContextSwitching.value = true;
                setTimeout(() => {
                    isContextSwitching.value = false;
                }, 600);

                let changed = false;
                let message = [];

                // 1. 检查 Session 是否不同
                const taskSession = task.sessionId || 'S_DEFAULT';
                if (currentSessionId.value !== taskSession) {
                    currentSessionId.value = taskSession;
                    changed = true;
                    const sessionName = settings.sessions.find(s => s.id === taskSession)?.name || '目标日程';
                    message.push(`已切换到: ${sessionName}`);
                }

                // 2. 检查视图类型 (Sidebar Tab) 是否不同
                // 逻辑：如果任务有 projectId，就应该在 Project 视图下看；有 instrumentId 去 Instrument 视图...
                let targetTab = 'musician';
                if (task.musicianId) targetTab = 'musician';
                else if (task.projectId) targetTab = 'project';
                else if (task.instrumentId) targetTab = 'instrument';

                if (sidebarTab.value !== targetTab) {
                    sidebarTab.value = targetTab;
                    changed = true;
                    // const tabName = targetTab === 'project' ? '项目视图' : (targetTab === 'instrument' ? '乐器视图' : '人员视图');
                    // message.push(`已切换到 ${tabName}`);
                }

                if (changed) {
                    window.triggerTouchHaptic('Medium');

                    // 高亮一下该任务，让用户知道跳到了哪里
                    flashingTaskId.value = task.scheduleId;
                    setTimeout(() => {
                        if (flashingTaskId.value === task.scheduleId) flashingTaskId.value = null;
                    }, 1500);

                    // 可选：弹个提示
                    // openAlertModal("视图跳转", message.join('\n'));
                } else {
                    // 如果上下文都一样，说明可能是逻辑判断漏了，或者它本来就不是幽灵
                    window.triggerTouchHaptic('Error');
                }
            };


            // --- V9.7: 软排期逻辑 ---
            const scheduledTemplateIds = computed(() => {
                return new Set(scheduledTasks.value.map(t => t.templateId).filter(id => id !== undefined));
            });
            const isScheduled = templateId => scheduledTemplateIds.value.has(templateId);

            const handlePoolItemClick = (poolItemId) => {
                selectTask(poolItemId, 'pool');
                // 原来的逻辑是手动找 task 然后 scrollTo
                // 现在 selectTask 内部已经调用了 smartScrollToTask，所以这里其实只需要保留 selectTask 即可
                // 但为了保险，如果你这里有特殊的逻辑，也可以直接调用：
                /* const firstScheduled = scheduledTasks.value.find(t => t.templateId === poolItemId);
                    if (firstScheduled) {
                        smartScrollToTask(firstScheduled);
                    }
                    */
            };

            // --- V9.7.4: CSV 导入逻辑 (基于 ID) ---
            const getOrCreateProjectId = (projectName) => {
                let project = settings.projects.find(p => p.name === projectName);
                if (!project) {
                    project = {id: generateUniqueId('P'), name: projectName, color: generateRandomHexColor()};
                    settings.projects.push(project);
                }
                return project.id;
            };

            // --- 🟢 新增辅助函数: 查找或创建设置项 ---
            const getOrCreateSettingItem = (type, name, group = '') => {
                if (!name || !name.trim()) return '';

                let list = [];
                let idPrefix = '';

                if (type === 'project') { list = settings.projects; idPrefix = 'P'; }
                else if (type === 'instrument') { list = settings.instruments; idPrefix = 'I'; }
                else if (type === 'musician') { list = settings.musicians; idPrefix = 'M'; }

                // 查找已存在的 (不区分大小写)
                const existing = list.find(i => i.name.toLowerCase() === name.trim().toLowerCase());
                if (existing) return existing.id;

                // 创建新的
                const newId = generateUniqueId(idPrefix);
                const newItem = {
                    id: newId,
                    name: name.trim(),
                    group: group.trim(), // 使用传入的分组 (如 Inst Family)
                    color: generateRandomHexColor()
                };

                if (type === 'musician') newItem.defaultRatio = 20; // 默认倍率

                list.push(newItem);
                return newId;
            };



            // --- 🟢 辅助函数：将 HH:MM 转换为分钟数 (用于计算时间距离) ---
            const getMins = (timeStr) => {
                if (!timeStr) return 0;
                const [h, m] = timeStr.split(':').map(Number);
                return h * 60 + m;
            };

            // 🟢 [新增] 同步家族编制信息
            const syncFamilyOrchestration = (item, newOrch) => {
                // 1. 找到根 ID (如果自己是子任务，取 splitFromId；否则取自己的 ID)
                const rootId = item.splitFromId || item.id;

                // 2. 找到所有家族成员 (根节点 + 所有子节点)
                // 注意：只匹配 ID，不匹配 Session，因为编制信息应该是跨 Session 统一的
                const familyMembers = itemPool.value.filter(i => i.id === rootId || i.splitFromId === rootId);

                // 3. 批量更新
                familyMembers.forEach(member => {
                    if (member.orchestration !== newOrch) {
                        member.orchestration = newOrch;
                    }
                });
            };

            // 3. 触发文件选择 (适配你现有的 input id)
            const triggerCSV = () => {
                const input = document.getElementById('csv-import-input');
                if(input) {
                    input.value = '';
                    input.click();
                }
            };

            // 2. 辅助函数：解析 CSV 单行 (处理引号包裹的情况)
            const parseCSVLine = (text) => {
                const result = [];
                let cell = '';
                let inQuotes = false;
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        result.push(cell.trim().replace(/^"|"$/g, '')); // 去除包裹的引号
                        cell = '';
                    } else {
                        cell += char;
                    }
                }
                result.push(cell.trim().replace(/^"|"$/g, ''));
                return result;
            };

            // CSV 核心解析引擎 (解析双引号、换行符等复杂情况)
            const parseCSVRobust = (text) => {
                const rows = []; let currentRow = []; let currentCell = ''; let insideQuote = false;
                for (let i = 0; i < text.length; i++) {
                    const char = text[i]; const nextChar = text[i + 1];
                    if (char === '"') {
                        if (insideQuote && nextChar === '"') { currentCell += '"'; i++; }
                        else { insideQuote = !insideQuote; }
                    }
                    else if (char === ',' && !insideQuote) { currentRow.push(currentCell.trim()); currentCell = ''; }
                    else if ((char === '\r' || char === '\n') && !insideQuote) {
                        if (char === '\r' && nextChar === '\n') i++;
                        currentRow.push(currentCell.trim()); rows.push(currentRow); currentRow = []; currentCell = '';
                    } else { currentCell += char; }
                }
                if (currentCell || currentRow.length > 0) { currentRow.push(currentCell.trim()); rows.push(currentRow); }
                return rows;
            };

            const handleCSVImport = (event) => {
                const file = event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onload = (e) => {
                    const csvText = e.target.result;

                    // 1. 使用你原有的解析引擎 (parseCSVRobust)
                    const allRows = parseCSVRobust(csvText);
                    const headerIndex = allRows.findIndex(row =>
                        row.some(cell => (cell.includes('PID') || cell.includes('项目') || cell.includes('Project')))
                    );

                    if (headerIndex === -1) { alert("未找到表头"); return; }

                    // 2. 映射表头索引
                    const headers = allRows[headerIndex].map(h => h.replace(/^"|"$/g, '').trim());
                    csvHeadersMap.value = {
                        project: headers.findIndex(h => h.includes('PID') || h.includes('项目') || h.includes('Project')),
                        instFamily: headers.findIndex(h => h.includes('Inst Family') || h.includes('乐器分类')),
                        instName: headers.findIndex(h => h.includes('Inst Name') || h === '乐器' || h.includes('乐器名称')),
                        playerName: headers.findIndex(h => h.includes('Player Name') || h === 'Player' || h.includes('人员')),
                        duration: headers.findIndex(h => h.includes('Duration') || h.includes('时长')),

                        // [REC] 录音相关
                        recDate: headers.findIndex(h => h.includes('[REC] Date') || h.includes('录音日期')),
                        recStart: headers.findIndex(h => h.includes('[REC] Starting Time') || h.includes('录音开始时间')),
                        recEnd: headers.findIndex(h => h.includes('[REC] Ending Time') || h.includes('录音结束时间')),
                        recStudio: headers.findIndex(h => (h.includes('[REC] Studio') && !h.includes('Time')) || h.includes('录音棚')),
                        recEngineer: headers.findIndex(h => h.includes('[REC] Engineer') || h.includes('录音师')),
                        recOperator: headers.findIndex(h => h.includes('[REC] Operator') || h.includes('录音助理')),
                        recAssistant: headers.findIndex(h => h.includes('[REC] Assistant')),
                        recComments: headers.findIndex(h => h.includes('[REC] Comments') || h.includes('备注')),

                        orchestration: headers.findIndex(h => h.includes('Orchestration') || h.includes('编制')),

                        // 🟢 [新增] [EDT] 编辑日程相关
                        edtDate: headers.findIndex(h => h.includes('[EDT] Date')),
                        edtStart: headers.findIndex(h => h.includes('[EDT] Starting Time')),
                        edtEnd: headers.findIndex(h => h.includes('[EDT] Ending Time')),
                        edtRest: headers.findIndex(h => h.includes('[EDT] Rest Time')),
                        edtEngineer: headers.findIndex(h => h.includes('[EDT] Engineer')),
                        edtStudio: headers.findIndex(h => h.includes('[EDT] Studio')&& !h.includes('Time')),

                        mixEngineer: headers.findIndex(h => h.includes('[MIX] Engineer')),
                        mixStudio: headers.findIndex(h => h.includes('[MIX] Studio') && !h.includes('Time')),
                        masEngineer: headers.findIndex(h => h.includes('[MAS] Engineer')),
                        masStudio: headers.findIndex(h => h.includes('[MAS] Studio') && !h.includes('Time')),
                    };

                    // 3. 保存原始数据并显示模态框
                    rawCsvRows.value = allRows.slice(headerIndex + 1).filter(r => {
                        // 只有当 项目名 或 乐器名/录音师 等关键列有值时，才视为有效行
                        // 避免导入全是逗号的空行
                        const hasProject = csvHeadersMap.value.project > -1 && r[csvHeadersMap.value.project]?.trim();
                        const hasInst = csvHeadersMap.value.instName > -1 && r[csvHeadersMap.value.instName]?.trim();
                        const hasDate = csvHeadersMap.value.edtDate > -1 && r[csvHeadersMap.value.edtDate]?.trim(); // 针对编辑日程
                        const hasRecDate = csvHeadersMap.value.recDate > -1 && r[csvHeadersMap.value.recDate]?.trim(); // 针对录音日程

                        // 只要有任意关键信息，就保留
                        return hasProject || hasInst || hasDate || hasRecDate;
                    });

                    // 4. 调用刷新预览函数（见第三步）
                    refreshCsvPreview();
                    showCsvImportModal.value = true;
                };
            };

            const refreshCsvPreview = () => {
                const rows = rawCsvRows.value;
                const col = csvHeadersMap.value;
                const strategy = csvImportConfig.nameStrategy;

                const preparedData = [];
                const orchGroupsMap = {};
                const processedIndices = new Set();
                const instNameCounter = {}; // 计数器 { "ProjectA|Flute": 1 }

                const instTotalCounts = {};

                rows.forEach(row => {
                    const proj = row[col.project] || '未命名项目';
                    const rawName = row[col.instName] || '未命名乐器';
                    const cleanName = rawName.replace(/\s+\d+$/, '').trim();
                    const key = `${proj}|${cleanName}`;
                    instTotalCounts[key] = (instTotalCounts[key] || 0) + 1;
                });

                // 1. 扫描合并组 (Strings/Brass 等) - 保持不变
                rows.forEach((row, index) => {
                    const pid = row[col.project] || '未命名项目';
                    const pPlayer = (row[col.playerName] || '').toLowerCase();
                    let groupType = '';
                    if (pPlayer.includes('string')) groupType = 'Strings';
                    else if (pPlayer.includes('brass')) groupType = 'Brass';
                    else if (pPlayer.includes('wood') || pPlayer.includes('wind')) groupType = 'Woodwinds';
                    if (col.playerName > -1 && (!row[col.playerName] || !row[col.playerName].trim())) {
                        return;
                    }

                    if (groupType) {
                        const key = `${pid}|${groupType}`;
                        if (!orchGroupsMap[key]) {
                            orchGroupsMap[key] = { firstRow: row, instNames: [], maxDuration: '00:00' };
                        }
                        orchGroupsMap[key].instNames.push(row[col.instName] || '');
                        if ((row[col.duration] || '00:00') > orchGroupsMap[key].maxDuration) {
                            orchGroupsMap[key].maxDuration = row[col.duration];
                        }
                        processedIndices.add(index);
                    }
                });

                // 2. 处理单独乐器 (关键修改)
                rows.forEach((row, index) => {
                    if (strategy === 'merge' && processedIndices.has(index)) return;
                    if (col.playerName > -1 && (!row[col.playerName] || !row[col.playerName].trim())) {
                        return;
                    }

                    const proj = row[col.project] || '未命名项目';
                    const rawName = row[col.instName] || '未命名乐器';

                    // A. 提取“纯净”名称 (去掉 CSV 里可能自带的数字，比如把 "Flute 2" 变成 "Flute")
                    const cleanName = rawName.replace(/\s+\d+$/, '').trim();

                    // B. 计算序号 (仅用于预览显示)
                    const countKey = `${proj}|${cleanName}`;
                    instNameCounter[countKey] = (instNameCounter[countKey] || 0) + 1;
                    const seqNum = instNameCounter[countKey];

                    // C. 生成“显示名称” (带序号)
                    // 🟢 修改：只有当该项目下该乐器数量 > 1 时，才加序号
                    let displayName = cleanName;
                    if ((instTotalCounts[countKey] || 0) > 1) {
                        displayName = `${cleanName} ${seqNum}`;
                    }

                    addDataToPrepared(preparedData, row, col, {
                        displayCsvName: displayName, // 🟢 UI显示用：Flute 1
                        realCsvName: cleanName       // 🟢 实际导入用：Flute
                    });
                });

                // 3. 处理合并组 - 保持不变
                if (strategy === 'merge') {
                    Object.keys(orchGroupsMap).forEach(key => {
                        const [pid, groupName] = key.split('|');
                        const groupData = orchGroupsMap[key];
                        addDataToPrepared(preparedData, groupData.firstRow, col, {
                            forceName: groupName,
                            realCsvName: groupName,    // 🟢 修复: 强制乐器名也为组名 (创建/关联 "Strings" 乐器)
                            displayCsvName: groupName, // 🟢 修复: 显示名也同步
                            injectedOrch: getOrchString(groupData.instNames),
                            overrideDuration: groupData.maxDuration
                        });
                    });
                }

                csvImportData.value = preparedData;
            };

// 如果你想让勾选框开关也即时生效（虽然通常是导入时判断），也可以监听它们
            // 监听全局导入类型开关
            watch(() => csvImportConfig.importTypes, () => {
                refreshCsvStatus(); // 开关一变，立刻重算所有行的状态文本
            }, { deep: true });

            // 🟢 监听策略变化，一旦切换单选框，立即重算列表
            watch(() => csvImportConfig.nameStrategy, () => {
                if (rawCsvRows.value.length > 0) {
                    refreshCsvPreview();
                }
            });

            // 🔍 辅助：根据名字查找 ID (仅查找，不创建)
            const findSettingId = (type, name) => {
                if (!name || !settings[type + 's']) return null;
                const found = settings[type + 's'].find(i => i.name.trim().toLowerCase() === name.trim().toLowerCase());
                return found ? found.id : null;
            };


            // 4. 辅助：全局日程块自动调整
            const autoResizeSchedules = (taskIds) => {
                console.log("执行全局自动调整...");
                // 此处填入你最初代码末尾的那个 taskMap.forEach 循环逻辑
                // 它会自动计算所有受影响日程块的 minMins 和 maxMins，并更新 scheduledTasks 的 startTime 和 estDuration
            };

            // 🟢 [新增] 设置项重命名处理 (支持重名自动合并)
            const handleItemRename = (type, item, event) => {
                const newName = event.target.value.trim();
                const oldName = item.name;

                // 1. 空值或未变检查
                if (!newName) {
                    event.target.value = oldName; // 回滚
                    return;
                }
                if (newName === oldName) return;

                // 2. 确定数据源
                let list = [];
                let idKey = '';
                if (type === 'instrument') { list = settings.instruments; idKey = 'instrumentId'; }
                else if (type === 'musician') { list = settings.musicians; idKey = 'musicianId'; }
                else if (type === 'project') { list = settings.projects; idKey = 'projectId'; }

                // 3. 检查重名 (排除自身)
                const targetItem = list.find(i => i.name.toLowerCase() === newName.toLowerCase() && i.id !== item.id);

                if (targetItem) {
                    // === 🚨 发现重名 -> 触发合并流程 ===

                    // 先回滚输入框显示，等待用户确认
                    event.target.value = oldName;

                    openConfirmModal(
                        '合并条目',
                        `检测到 "${targetItem.name}" 已存在。\n确定要将 "${oldName}" 合并归入 "${targetItem.name}" 吗？\n\n⚠ 警告：\n1. "${oldName}" 下的所有任务将转移给 "${targetItem.name}"。\n2. "${oldName}" 将被永久删除。\n3. 此操作不可撤销。`,
                        () => {
                            // --- 执行合并 ---

                            // A. 迁移任务池 (Pool)
                            itemPool.value.forEach(task => {
                                if (task[idKey] === item.id) {
                                    task[idKey] = targetItem.id;
                                }
                            });

                            // B. 迁移日程表 (Scheduled Tasks)
                            scheduledTasks.value.forEach(task => {
                                if (task[idKey] === item.id) {
                                    task[idKey] = targetItem.id;
                                }
                            });

                            // C. 删除旧条目 (Source Item)
                            const idx = list.findIndex(i => i.id === item.id);
                            if (idx !== -1) {
                                list.splice(idx, 1);
                            }

                            // D. 触发关联更新 (如效率值重算)
                            // 简单起见，我们触发目标对象的效率更新，以防合并过来的数据影响了平均值
                            if (type === 'musician') {
                                autoUpdateEfficiency(targetItem.id, 'musician', false);
                            }

                            // E. 保存与反馈
                            pushHistory();
                            window.triggerTouchHaptic('Success');
                            openAlertModal("合并成功", `已将相关任务全部转移至 "${targetItem.name}"。`);
                        },
                        true, // isDestructive (红色确认按钮)
                        '确认合并',
                        '取消'
                    );
                } else {
                    // === ✅ 无重名 -> 正常改名 ===
                    item.name = newName;
                    pushHistory();
                }
            };

            // 🟢 [新增] 录音元数据重命名 (支持级联更新任务 + 自动合并)
            const handleRecRename = (type, item, event) => {
                const newName = event.target.value.trim();
                const oldName = item.name; // 记录修改前的名字

                // 1. 基础检查
                if (!newName) {
                    event.target.value = oldName; // 不能为空，回滚
                    return;
                }
                if (newName === oldName) return; // 没变化

                // 2. 获取对应的列表 (studio -> studios)
                const listKey = type + 's';
                const list = settings[listKey];
                if (!list) return;

                // 3. 查重：检查是否改成了已存在的名字
                const existing = list.find(i => i.name.toLowerCase() === newName.toLowerCase() && i.id !== item.id);

                // 定义更新任务的通用逻辑
                const updateAllTasks = (targetName) => {
                    let count = 0;
                    // 更新任务池
                    itemPool.value.forEach(t => {
                        if (t.recordingInfo && t.recordingInfo[type] === oldName) {
                            t.recordingInfo[type] = targetName;
                            count++;
                        }
                    });
                    // 更新日程表
                    scheduledTasks.value.forEach(t => {
                        if (t.recordingInfo && t.recordingInfo[type] === oldName) {
                            t.recordingInfo[type] = targetName;
                            count++;
                        }
                    });
                    return count;
                };

                if (existing) {
                    // === 🅰️ 发现重名 -> 触发合并流程 ===
                    event.target.value = oldName; // 先在 UI 上回滚，等待确认

                    openConfirmModal(
                        '合并条目',
                        `检测到 "${existing.name}" 已存在。\n确定要将 "${oldName}" 合并归入 "${existing.name}" 吗？\n\n⚠ 注意：所有使用 "${oldName}" 的任务都将自动更新。`,
                        () => {
                            // 1. 更新所有任务
                            updateAllTasks(existing.name);

                            // 2. 删除当前条目 (因为合并到了 existing)
                            const idx = list.findIndex(i => i.id === item.id);
                            if (idx !== -1) list.splice(idx, 1);

                            // 3. 保存
                            pushHistory();
                            window.triggerTouchHaptic('Success');
                            openAlertModal("合并成功", `相关任务信息已更新为 "${existing.name}"。`);
                        },
                        true, // 红色按钮
                        '确认合并'
                    );
                } else {
                    // === 🅱️ 无重名 -> 直接重命名 ===

                    // 1. 更新设置项本身
                    item.name = newName;

                    // 2. 级联更新所有引用了旧名字的任务
                    updateAllTasks(newName);

                    // 3. 保存
                    pushHistory();
                    window.triggerTouchHaptic('Success');
                }
            };

            // --- V9.7.4 名称和颜色查找器 (新增项目类型) ---
            const getNameById = (id, type) => {
                if (!id) return '未选择'; // 这里的文字对应你的截图

                // 确保 list 获取正确
                const list = type === 'instrument' ? settings.instruments :
                    type === 'musician' ? settings.musicians :
                        type === 'project' ? settings.projects : [];

                // 🟢 关键: 使用 == 而不是 ===，防止 id 类型(string/number)不一致导致找不到
                const item = list.find(i => i.id == id);

                return item ? item.name : (type === 'project' ? '未知项目' : (type === 'instrument' ? '未知乐器' : '未知演奏员'));
            };

            // 🟢 修改: getGroupColor (强制统一颜色：紫/金/蓝)
            const getGroupColor = (item, key, isBorder) => {
                // 这里的 key 决定了我们要获取哪种类型的颜色

                // 1. 演奏员 = 紫色
                if (key === 'musicianId') return '#a855f7';

                // 2. 项目 = 金色
                if (key === 'projectId') return '#eab308';

                // 3. 乐器 = 蓝色
                if (key === 'instrumentId') return '#3b82f6';

                // 默认灰色
                return isBorder ? '#9ca3af' : '#f3f4f6';
            };

            // V9.5 任务移动助手：添加分钟
            const addMinutesToTime = (timeStr, minutes) => addMinutesToTimeValue(timeStr, minutes, {
                minMinutes: settings.startHour * 60,
                maxMinutes: settings.endHour * 60 - 30,
                stepMinutes: 30
            });

            // V9.5 任务移动助手：添加天数

            const onMusicianSelect = () => {
                const m = settings.musicians.find(x => x.id === newItem.musicianId);
                if (m) newItem.ratio = m.defaultRatio;
            };

            const addItemToPool = () => {
                if (!newItem.projectId || !newItem.instrumentId || !newItem.musicianId || !newItem.musicDuration) {
                    openAlertModal('信息不完整', '请务必填写所有信息');
                    return;
                }

                const rMusician = getDefaultRatio(newItem.musicianId, 'musician');
                const baseInstName = getNameById(newItem.instrumentId, 'instrument');

                // 🟢 修改: 优先使用自动识别的具体名字 (Flute 1/2)，如果没有则用基础名
                let finalName = newItem._autoSuggestedName || baseInstName;

                // 检查重复并自动编号 (如果名字完全一样才编号)
                // 比如如果已经有了 "Flute 1", 新来的也是 "Flute 1", 才会变成 "Flute 1 2"
                // 但如果新来的是 "Flute 2", 则不会冲突
                const siblings = itemPool.value.filter(t =>
                    (t.sessionId || 'S_DEFAULT') === currentSessionId.value &&
                    t.projectId === newItem.projectId &&
                    t.instrumentId === newItem.instrumentId &&
                    t.name === finalName // 只检查完全同名的
                );

                if (siblings.length > 0) {
                    finalName = `${finalName} ${siblings.length + 1}`;
                }

                const rawItem = {
                    id: generateUniqueId('T'),
                    sessionId: currentSessionId.value,
                    projectId: newItem.projectId,
                    instrumentId: newItem.instrumentId,
                    musicianId: newItem.musicianId,
                    musicDuration: newItem.musicDuration,
                    orchestration: '',
                    ratios: { musician: null, project: null, instrument: null },
                    ratio: rMusician,
                    estDuration: calculateEstTime(newItem.musicDuration, rMusician),
                    name: finalName // 使用新名字
                };

                const finalItem = ensureItemRecords(rawItem);
                itemPool.value.push(finalItem);

                // 清理临时标记
                newItem._autoSuggestedName = null;

                pushHistory();
                if(isMobile.value) window.triggerTouchHaptic('Success');
                showMobileTaskInput.value = false;
            };

            // 🟢 [重写] 获取任务倍率 (支持动态继承)
            // 逻辑: 如果任务自己有设定倍率，就用任务的；否则去读全局设置(settings)里的默认倍率
            const getTaskRatio = (item, contextType = null) => {
                if (!item.ratios) ensureItemRecords(item);

                // 1. 确定当前上下文类型
                let type = contextType;
                if (!type) {
                    if (trackListData.value && showTrackList.value) {
                        type = trackListData.value.viewType;
                    } else {
                        type = sidebarTab.value || 'musician';
                    }
                }

                // 2. 优先读取任务自身的“私有倍率” (Manual Override)
                const localRatio = item.ratios[type];
                if (localRatio && localRatio > 0) {
                    return localRatio;
                }

                // 3. 如果任务没有私有倍率，则“动态继承”全局设置的默认倍率
                let targetId = null;
                if (type === 'project') targetId = item.projectId;
                else if (type === 'instrument') targetId = item.instrumentId;
                else targetId = item.musicianId;

                // 调用之前修好的 getDefaultRatio (只读 settings，不产生死锁)
                return getDefaultRatio(targetId, type);
            };

            // 🟢 [新增] 清理旧倍率数据 (Data Cleaning)
            const cleanOldRatios = () => {
                openConfirmModal(
                    '清理旧倍率数据',
                    '此操作将把所有倍率为 x20 (默认值) 的任务重置为“自动跟随模式”。\n\n清理后，这些任务将不再锁定倍率，而是实时跟随大卡片的平均效率计算时长。\n(手动设置的其他特殊倍率不会受影响)',
                    () => {
                        let count = 0;

                        // 定义处理单条数据的逻辑
                        const processItem = (item) => {
                            let changed = false;

                            // 确保结构存在
                            ensureItemRecords(item);

                            // 遍历三个维度
                            ['musician', 'project', 'instrument'].forEach(type => {
                                // 核心逻辑：如果倍率等于 20，就设为 null (自动)
                                if (parseFloat(item.ratios[type]) === 20) {
                                    item.ratios[type] = null;
                                    changed = true;
                                }
                            });

                            // 兼容性清理：如果主 ratio 也是 20，也可以重置一下
                            // (虽然主要是靠 ratios 对象，但为了数据整洁)
                            if (parseFloat(item.ratio) === 20) {
                                // 这里不置空，保留数值类型，但在下次计算时它会被覆盖
                            }

                            if (changed) count++;
                        };

                        // 1. 清理任务池
                        itemPool.value.forEach(processItem);

                        // 2. 清理日程表
                        scheduledTasks.value.forEach(processItem);

                        // 3. 强制保存并反馈
                        pushHistory();

                        // 触发一次全局重算，确保界面时长立即刷新
                        // (虽然 calculateGroupStats 是自动的，但这里手动触发一下更稳)
                        if (musicianStats.value.length > 0) {
                            // 随意触发一个更新来强制视图重绘
                            const firstId = musicianStats.value[0].id;
                            autoUpdateEfficiency(firstId, 'musician', false);
                        }

                        window.triggerTouchHaptic('Success');
                        openAlertModal('清理完成', `已成功将 ${count} 个任务重置为自动跟随模式。\n现在它们会乖乖跟随大卡片的效率了！`);
                    },
                    false, // 非破坏性操作 (虽然改了数据，但是是良性的)
                    '立即清理'
                );
            };

            // 🟢 修复: 列表分组折叠 (新增震动反馈)
            const toggleCollapse = (groupKey) => {
                if (isMobile.value) window.triggerTouchHaptic('Medium'); // 🟢 增加震动反馈

                if (expandedGroups.has(groupKey)) {
                    expandedGroups.delete(groupKey);
                } else {
                    expandedGroups.add(groupKey);
                }
            };

            // --- Drag & Drop ---
            let draggedData = null;
            // 🟢 修改: 拖拽开始时，计算鼠标相对于任务顶部的偏移量
            const dragStart = (e, item, source) => {
                let offsetMinutes = 0;

                // 如果是拖动日程表上的任务
                if (source === 'schedule' && e.target) {
                    const rect = e.target.getBoundingClientRect();
                    // 计算鼠标距离任务顶部的像素距离
                    const offsetY = e.clientY - rect.top;
                    // 将像素转换为分钟 (pxPerMin.value 是每分钟的高度)
                    const rawMinutes = offsetY / pxPerMin.value;
                    // 向下取整到最近的 30 分钟刻度，保证吸附
                    offsetMinutes = Math.floor(rawMinutes / 30) * 30;
                }

                // 将 offsetMinutes 存入 draggedData
                draggedData = {item, source, isCopy: e.altKey, offsetMinutes};

                e.dataTransfer.effectAllowed = 'move';

                // ... (后续的克隆样式逻辑保持不变) ...
                if (source === 'schedule' && e.target) {
                    const clone = e.target.cloneNode(true);
                    // ... (克隆样式代码省略，保持原样即可) ...
                    clone.classList.remove('is-selected');
                    clone.style.setProperty('opacity', '0.4', 'important');
                    clone.style.position = 'absolute';
                    clone.style.top = '-9999px';
                    clone.style.zIndex = '9999';
                    clone.style.width = `${e.target.offsetWidth}px`;
                    document.body.appendChild(clone);
                    // 这里为了视觉对齐，拖拽时的“把手”位置也建议减去 offset
                    // 但为了简单，原有的 setDragImage 逻辑通常够用了，这里只用改数据逻辑
                    const rect = e.target.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const offsetY = e.clientY - rect.top;
                    e.dataTransfer.setDragImage(clone, offsetX, offsetY);

                    setTimeout(() => {
                        document.body.removeChild(clone);
                        e.target.classList.add('pointer-events-none');
                        e.target.style.transition = 'none';
                        e.target.style.opacity = '0';
                    }, 0);
                }
            };

            // --- 新增开始: 拖拽结束处理 ---
            const handleDragEnd = (e) => {
                if (e.target) {
                    e.target.classList.remove('pointer-events-none');
                    // 清除行内样式，恢复 CSS 类中定义的默认样式
                    e.target.style.opacity = '';
                    e.target.style.transition = '';
                }
                draggedData = null;
            };
            // --- 新增结束 ---

            const dragEnterPool = e => e.currentTarget.classList.add('drag-over');
            const dragLeavePool = e => e.currentTarget.classList.remove('drag-over');

            // 🟢 修复: 拖动已排程任务回任务池 (同步执行数据清理)
            const dropToPool = e => {
                e.currentTarget.classList.remove('drag-over');
                if (!draggedData) return;

                // 仅处理从日程表拖回的情况
                if (draggedData.source === 'schedule') {
                    const taskToDelete = draggedData.item;

                    // 🟢 新增: 拦截已完成任务
                    if (isResourceCompleted(taskToDelete)) {
                        window.triggerTouchHaptic('Error');
                        return openAlertModal("操作被拒绝", "该任务所属对象已处于【完成】状态，禁止移回任务池。");
                    }

                    // 🟢 1. 执行数据清理 (复用键盘删除的核心逻辑)
                    if (taskToDelete.templateId) {
                        // 情况 A: 单曲任务 (有明确 ID) -> 清理指定 ID 的录音数据
                        clearPoolRecord(taskToDelete.templateId);
                    } else {
                        // 情况 B: 聚合任务 (大卡片) -> 清理对应 Section 的数据并修正索引
                        // 注意：必须确保 clearAggregateRecords 函数已定义且在作用域内
                        if (typeof clearAggregateRecords === 'function') {
                            clearAggregateRecords(taskToDelete);
                        } else {
                            console.error("找不到 clearAggregateRecords 函数，无法清理聚合数据");
                        }
                    }

                    // 🟢 2. 物理删除日程块
                    scheduledTasks.value = scheduledTasks.value.filter(t => t.scheduleId !== taskToDelete.scheduleId);

                    // 3. 反馈与保存
                    if (isMobile.value) window.triggerTouchHaptic('Medium');
                    pushHistory();
                }

                draggedData = null;
            };

            const dragEnterSlot = e => {
                if (e.target.closest('.droppable-slot')) e.target.closest('.droppable-slot').classList.add('drag-over');
            };
            const dragLeaveSlot = e => {
                if (e.target.closest('.droppable-slot')) e.target.closest('.droppable-slot').classList.remove('drag-over');
            };
            // 🟢 修改: dropToSchedule (加入防重叠检测)
            // 🟢 [重写] dropToSchedule (基于坐标计算，解决遮挡问题)
            const dropToSchedule = (e, dateStr) => {
                // 清除高亮样式
                document.querySelectorAll('.grid-slot.drag-over').forEach(el => el.classList.remove('drag-over'));

                if (!draggedData) return;

                // 1. 获取列容器 (Column) 和 时间容器 (Grid Container)
                // 无论 e.target 是 slot 还是 task-block，往上找都能找到 data-date-str
                const colEl = e.target.closest('[data-date-str]');
                if (!colEl) return;

                const container = colEl.querySelector('.relative[style*="min-height"]');
                if (!container) return;

                const {item, source, offsetMinutes} = draggedData;

                // 2. 基于鼠标 Y 坐标计算时间 (而不是依赖 slot.dataset.time)
                const rect = container.getBoundingClientRect();
                const relativeY = e.clientY - rect.top; // 鼠标在容器内的相对高度

                // 如果是从日程内部拖动，需要减去鼠标抓取位置的偏移，保持视觉不跳动
                let adjustY = relativeY;
                if (source === 'schedule' && offsetMinutes) {
                    adjustY -= (offsetMinutes * pxPerMin.value);
                }

                // 转换为分钟
                const rawMins = adjustY / pxPerMin.value;
                // 加上起始小时 (如 10:00)
                const totalMins = (settings.startHour * 60) + rawMins;

                // 吸附到 30 分钟网格
                let snappedMins = Math.round(totalMins / 30) * 30;

                // 边界限制
                const minStart = settings.startHour * 60;
                const maxStart = settings.endHour * 60 - 30; // 至少留30分钟
                snappedMins = Math.max(minStart, Math.min(maxStart, snappedMins));

                // 生成 HH:MM 字符串
                const h = Math.floor(snappedMins / 60);
                const m = snappedMins % 60;
                const newStartTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

                // 3. 准备检测参数
                let checkType = 'musician'; // 默认为人员
                let newDuration = '';
                let excludeId = null;

                if (source === 'aggregate') {
                    // 从侧边栏拖入：类型由当前 Tab 决定
                    checkType = sidebarTab.value;
                    // 计算统计卡片剩余时长
                    const remainingSecs = item.totalSeconds - item.scheduledSeconds;
                    if (remainingSecs <= 0) {
                        pushHistory(); // 甚至可能无法拖动，这里做个防御
                        draggedData = null;
                        return;
                    }
                    let remainingMins = Math.ceil(remainingSecs / 1800) * 30;
                    if (remainingMins === 0) remainingMins = 30;
                    newDuration = formatSecs(remainingMins * 60);

                } else if (source === 'schedule') {
                    // 日程内部移动
                    if (item.projectId) checkType = 'project';
                    else if (item.instrumentId) checkType = 'instrument';

                    newDuration = item.estDuration;
                    excludeId = item.scheduleId; // 移动时排除自己

                } else if (source === 'pool') {
                    // 从任务池拖入
                    if (item.projectId) checkType = 'project';
                    else if (item.instrumentId) checkType = 'instrument';

                    newDuration = item.estDuration;
                }

                // 4. 执行冲突检测
                // 注意：checkOverlap 内部已经包含了 "不同类型允许重叠" 的逻辑 (tType !== checkType return false)
                if (checkOverlap(dateStr, newStartTime, newDuration, excludeId, checkType)) {
                    openAlertModal('时间冲突', '该时间段已有同类型的其他安排。');
                    window.triggerTouchHaptic('Error');
                    draggedData = null;
                    return;
                }

                // 5. 执行放置逻辑 (Create / Update)
                if (source === 'aggregate') {
                    const nt = {
                        scheduleId: Date.now(),
                        sessionId: currentSessionId.value,
                        musicianId: sidebarTab.value === 'musician' ? item.id : '',
                        projectId: sidebarTab.value === 'project' ? item.id : '',
                        instrumentId: sidebarTab.value === 'instrument' ? item.id : '',
                        date: dateStr,
                        startTime: newStartTime,
                        estDuration: newDuration,
                        trackCount: item.trackCount,
                        ratio: item.defaultRatio || 20,
                        reminderMinutes: 15,
                        sound: 'default'
                    };
                    scheduledTasks.value.push(nt);
                    window.triggerTouchHaptic('Success');

                } else if (source === 'schedule') {
                    const idx = scheduledTasks.value.findIndex(t => t.scheduleId === item.scheduleId);
                    if (idx !== -1) {
                        // 必须深拷贝并更新，确保 Vue 响应式触发
                        const nt = JSON.parse(JSON.stringify(item));
                        nt.date = dateStr;
                        nt.startTime = newStartTime;
                        scheduledTasks.value[idx] = nt;
                        window.triggerTouchHaptic('Success');
                    }

                } else if (source === 'pool') {
                    const nt = {
                        scheduleId: Date.now(),
                        templateId: item.id,
                        sessionId: currentSessionId.value,
                        projectId: item.projectId,
                        instrumentId: item.instrumentId,
                        musicianId: item.musicianId,
                        musicDuration: item.musicDuration,
                        ratio: item.ratio,
                        estDuration: item.estDuration,
                        date: dateStr,
                        startTime: newStartTime,
                        reminderMinutes: 15,
                        sound: 'default'
                    };
                    scheduledTasks.value.push(nt);
                    window.triggerTouchHaptic('Success');
                }

                pushHistory();
                draggedData = null;
            };

            // 🟢 修改: dropToMonth (加入防重叠检测)
            const dropToMonth = (e, dateStr) => {
                document.querySelectorAll('.droppable-slot.drag-over').forEach(el => el.classList.remove('drag-over'));
                if (!draggedData) return;
                const {item, source} = draggedData;

                // 1. 确定目标时间和时长
                let targetStartTime = settings.startHour + ':00'; // 默认插在开头
                let targetDuration = '';
                let excludeId = null;
                let checkType = 'musician';
                if (source === 'aggregate') {
                    checkType = sidebarTab.value;
                } else {
                    if (item.projectId) checkType = 'project';
                    else if (item.instrumentId) checkType = 'instrument';
                }

                if (source === 'schedule') {
                    targetStartTime = item.startTime; // 保持原有时间不变
                    targetDuration = item.estDuration;
                    excludeId = item.scheduleId;
                } else {
                    // 新任务默认时长 30分钟 或 剩余时长
                    targetDuration = item.estDuration || '00:30';
                }

                if (checkOverlap(dateStr, targetStartTime, targetDuration, excludeId, checkType)) {
                    openAlertModal('时间冲突', '该日期已有同类型的其他安排。');
                    window.triggerTouchHaptic('Error');
                    draggedData = null;
                    return;
                }

                // --- 3. 通过检测，执行原有逻辑 ---
                if (source === 'schedule') {
                    const task = scheduledTasks.value.find(t => t.scheduleId === item.scheduleId);
                    if (task) {
                        task.date = dateStr;
                        pushHistory();
                    }
                } else if (source === 'aggregate' || source === 'pool') {
                    // ... (保持你上一轮改好的构建 ID 的逻辑) ...
                    let mId = '', pId = '', iId = '';
                    let ratio = 20;
                    let estDur = '00:30';
                    let tCount = 0;
                    let musDur = '';

                    if (source === 'pool') {
                        mId = item.musicianId;
                        pId = item.projectId;
                        iId = item.instrumentId;
                        ratio = item.ratio;
                        estDur = item.estDuration;
                        musDur = item.musicDuration;
                    } else {
                        if (sidebarTab.value === 'musician') mId = item.id;
                        else if (sidebarTab.value === 'project') pId = item.id;
                        else if (sidebarTab.value === 'instrument') iId = item.id;
                        ratio = item.defaultRatio || 20;
                        estDur = item.estDuration || '00:30';
                        tCount = item.trackCount || 0;
                    }
                    const tId = source === 'pool' ? item.id : undefined;

                    const nt = {
                        scheduleId: Date.now(),
                        templateId: tId, // <--- 添加这行
                        sessionId: currentSessionId.value,
                        musicianId: mId,
                        projectId: pId,
                        instrumentId: iId,
                        date: dateStr,
                        startTime: targetStartTime,
                        estDuration: estDur,
                        trackCount: tCount,
                        ratio: ratio,
                        musicDuration: musDur,
                        reminderMinutes: 15,
                        sound: 'default'
                    };
                    scheduledTasks.value.push(nt);
                    pushHistory();
                }
                draggedData = null;
            };


            const initResize = (e, t) => {
                e.preventDefault();
                e.stopPropagation();
                const el = e.target.closest('.task-block');
                resizing.value = {
                    task: t,
                    startY: e.clientY,
                    startH: el.offsetHeight,
                    // 🟢 记录原始时长以便回退
                    originalDuration: t.estDuration
                };
                document.body.style.cursor = 'ns-resize';
            };


            // 🟢 修改: 调整时长 (吸附到 Grid 绝对时间刻度)
            const handleResizeMove = e => {
                if (!resizing.value) return;
                const {task, startY, startH} = resizing.value;

                // 1. 计算鼠标移动后的物理高度
                const delta = e.clientY - startY;
                const rawHeight = Math.max(5, startH + delta); // 最小 5px

                // 2. 将高度转换为分钟数 (不取整)
                const rawDurationMins = rawHeight / pxPerMin.value;

                // 3. 获取任务开始的绝对分钟数 (例如 10:15 = 615)
                const startMins = timeToMinutes(task.startTime);

                // 4. 计算拖动后的“理论结束时间”
                const rawEndMins = startMins + rawDurationMins;

                // 5. 🟢 核心修改: 将结束时间吸附到最近的 30 分钟刻度 (:00 或 :30)
                // 这样无论开始时间是多少(如10:15)，结束时间总是对齐网格的(如10:30, 11:00)
                const snappedEndMins = Math.round(rawEndMins / 30) * 30;

                // 6. 反算新时长
                let newDurationMins = snappedEndMins - startMins;

                // 7. 最小保护 (防止负数或0，至少保留5分钟)
                if (newDurationMins < 5) newDurationMins = 5;

                // 8. 更新视图
                const newDurationStr = formatSecs(newDurationMins * 60);
                if (task.estDuration !== newDurationStr) {
                    task.estDuration = newDurationStr;
                }
            };

            // 🟢 修改: handleResizeEnd
            const handleResizeEnd = () => {
                if (!resizing.value) return;
                const t = resizing.value.task;

                // 确定类型
                let type = 'musician';
                if (t.projectId) type = 'project';
                else if (t.instrumentId) type = 'instrument';

                // 传入 type
                if (checkOverlap(t.date, t.startTime, t.estDuration, t.scheduleId, type)) {
                    t.estDuration = resizing.value.originalDuration;
                    openAlertModal('冲突', '调整后的时间有重叠');
                    window.triggerTouchHaptic('Error');
                } else {
                    // ✅ 无冲突，正常保存
                    const m = parseTime(t.musicDuration);
                    const r = parseTime(t.estDuration);
                    if (m > 0) t.ratio = (r / m).toFixed(1);
                    pushHistory();
                }

                resizing.value = null;
                document.body.style.cursor = '';
            };

            // 🟢 新增: 滚动侧边栏到指定 ID
            const scrollToSidebarItem = (targetId) => {
                if (!targetId) return;

                // 稍微延迟，确保 DOM 状态稳定
                setTimeout(() => {
                    // 使用刚才在 HTML 中添加的 data-stat-id 查找元素
                    const el = document.querySelector(`[data-stat-id="${targetId}"]`);

                    if (el) {
                        el.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center' // 滚动到视口中间，体验更好
                        });

                        // 可选: 给一个临时的闪烁高亮，提示用户位置
                        el.classList.add('ring-2', 'ring-[#ffffff]');
                        setTimeout(() => {
                            el.classList.remove('ring-2', 'ring-[#ffffff]');
                        }, 800);
                    }
                }, 50);
            };

            // 🟢 [修改] 选中任务逻辑 (增强跳转能力：支持 Section 索引精准定位)
            const selectTask = (id, src, event) => {
                // 1. 如果点击的是日程表中的任务
                if (src === 'schedule') {
                    selectedSource.value = src;
                    selectedTaskId.value = id;
                    selectedPoolIds.value.clear();

                    // --- 🟢 新增部分开始: 侧边栏联动滚动 ---
                    const task = scheduledTasks.value.find(t => t.scheduleId === id);
                    if (task) {
                        // 根据当前侧边栏的 Tab 类型，决定我们要找哪个 ID
                        let targetId = null;
                        if (sidebarTab.value === 'project') targetId = task.projectId;
                        else if (sidebarTab.value === 'instrument') targetId = task.instrumentId;
                        else targetId = task.musicianId; // 默认为 musician

                        // 如果找到了关联 ID，并且侧边栏是打开的，执行滚动
                        if (targetId && (isSidebarOpen.value || isMobile.value)) {
                            scrollToSidebarItem(targetId);
                        }
                    }
                    // --- 🟢 新增部分结束 ---

                    return;
                }

                // 2. 如果点击的是侧边栏(Pool)中的任务
                if (src === 'pool') {
                    selectedSource.value = src;
                    selectedTaskId.value = id;
                    lastPoolFocusId.value = id;

                    const isShift = event && event.shiftKey;
                    const isCtrl = event && (event.metaKey || event.ctrlKey);

                    // 单选时，尝试跳转
                    if (!isShift && !isCtrl) {
                        const poolItem = itemPool.value.find(i => i.id === id);
                        if (poolItem) {
                            // --- 策略 A: 精确匹配 (单曲模式) ---
                            // 检查是否有日程块直接引用了这个 templateId
                            let specificTask = scheduledTasks.value.find(t =>
                                (t.sessionId || 'S_DEFAULT') === currentSessionId.value &&
                                t.templateId === id
                            );

                            if (specificTask) {
                                // 如果找到了具体的日程块，直接跳过去
                                smartScrollToTask(specificTask);
                                if (isMobile.value) window.triggerTouchHaptic('Light');
                            } else {
                                // --- 策略 B: 聚合匹配 (Section 模式) ---
                                // 如果没有具体引用，说明是聚合在某个大日程块里，通过 sectionIndex 定位

                                // 1. 根据当前侧边栏视图，决定匹配哪个维度的 ID
                                let filterKey = 'musicianId'; // 默认按人员
                                if (sidebarTab.value === 'project') filterKey = 'projectId';
                                else if (sidebarTab.value === 'instrument') filterKey = 'instrumentId';

                                const filterId = poolItem[filterKey];

                                if (filterId) {
                                    // 2. 找到该资源在当前 Session 下的所有日程块
                                    const relatedSchedules = scheduledTasks.value.filter(t =>
                                        (t.sessionId || 'S_DEFAULT') === currentSessionId.value &&
                                        t[filterKey] === filterId
                                    );

                                    // 3. 排序 (按时间顺序，确保索引对应正确)
                                    relatedSchedules.sort((a, b) => {
                                        if (a.date !== b.date) return a.date.localeCompare(b.date);
                                        return a.startTime.localeCompare(b.startTime);
                                    });

                                    if (relatedSchedules.length > 0) {
                                        // 4. 🟢 核心修复: 使用 sectionIndex 定位目标块
                                        let targetIndex = 0;
                                        if (poolItem.sectionIndex !== undefined && poolItem.sectionIndex >= 0) {
                                            // 确保索引不越界 (防止日程块被删后索引未更新的情况)
                                            targetIndex = Math.min(poolItem.sectionIndex, relatedSchedules.length - 1);
                                        }

                                        const targetTask = relatedSchedules[targetIndex];
                                        smartScrollToTask(targetTask);

                                        // 给个反馈
                                        if (isMobile.value) window.triggerTouchHaptic('Light');
                                    }
                                }
                            }
                        }
                    }

                    // 多选逻辑 (保持不变)
                    if (isShift && lastPoolClickId.value) {
                        const visibleItems = [];
                        if (sidebarTab.value === 'browse') {
                            groupedItemPool.value.forEach(group => {
                                if (expandedGroups.has(group.key)) visibleItems.push(...group.items);
                            });
                        } else {
                            currentSidebarList.value.forEach(stat => {
                                if (expandedStatsIds.has(stat.id)) visibleItems.push(...stat.items);
                            });
                        }
                        const startIdx = visibleItems.findIndex(i => i.id === lastPoolClickId.value);
                        const endIdx = visibleItems.findIndex(i => i.id === id);
                        if (startIdx !== -1 && endIdx !== -1) {
                            const min = Math.min(startIdx, endIdx);
                            const max = Math.max(startIdx, endIdx);
                            for (let i = min; i <= max; i++) {
                                selectedPoolIds.value.add(visibleItems[i].id);
                            }
                        }
                    } else if (isCtrl) {
                        if (selectedPoolIds.value.has(id)) selectedPoolIds.value.delete(id);
                        else selectedPoolIds.value.add(id);
                        lastPoolClickId.value = id;
                    } else {
                        // 普通单击，重置多选
                        selectedPoolIds.value.clear();
                        selectedPoolIds.value.add(id);
                        lastPoolClickId.value = id;
                    }
                }
            };

            // 替换原有的 clearSelection 函数
            const clearSelection = () => {
                selectedTaskId.value = null;
                selectedSource.value = null;
                selectedPoolIds.value.clear(); // 新增：清空多选
            };

            // V9.5 任务重叠计算
            const getOverlapCount = (targetTask) => {
                const dayTasks = scheduledTasks.value.filter(t => t.date === targetTask.date);
                const targetStart = timeToMinutes(targetTask.startTime);
                const targetEnd = targetStart + parseTime(targetTask.estDuration) / 60;

                let overlapCount = 0;
                for (const task of dayTasks) {
                    if (task.scheduleId === targetTask.scheduleId) continue;

                    const taskStart = timeToMinutes(task.startTime);
                    const taskEnd = taskStart + parseTime(task.estDuration) / 60;

                    if (targetStart < taskEnd && targetEnd > taskStart) {
                        overlapCount++;
                    }
                }
                return overlapCount;
            };

            // V9.5 任务键盘移动逻辑
            // V9.5 任务键盘移动逻辑 (V11.2 修改：左右移动自动切换周视图)
            // V11.3 升级：支持周视图(改时间)和月视图(改日期)的键盘移动
            // 🟢 修复: moveTask (修复变量未定义报错，确保冲突检测逻辑正确)
            const moveTask = (task, direction) => {
                let updated = false;
                const isMonth = currentView.value === 'month';

                const checkMonthViewSwitch = (dStr) => {
                    if (!isMonth) return;
                    const newD = new Date(dStr);
                    const currentD = new Date(viewDate.value);
                    if (newD.getMonth() !== currentD.getMonth() || newD.getFullYear() !== currentD.getFullYear()) {
                        viewDate.value = newD;
                    }
                };

                // 确定类型
                let type = 'musician';
                if (task.projectId) type = 'project';
                else if (task.instrumentId) type = 'instrument';

                // 🟢 修复: 将计算逻辑和冲突检测移到具体的方向判断内部
                // 这样能确保 newTime/newDate 在检测前已经计算出来

                if (direction === 'up') {
                    if (isMonth) {
                        const newDate = addDaysToDate(task.date, -7);
                        // 检测日期冲突
                        if (checkOverlap(newDate, task.startTime, task.estDuration, task.scheduleId, type)) {
                            window.triggerTouchHaptic('Error');
                            return;
                        }
                        if (newDate !== task.date) {
                            pushHistory();
                            task.date = newDate;
                            updated = true;
                            checkMonthViewSwitch(newDate);
                        }
                    } else {
                        const newTime = addMinutesToTime(task.startTime, -30);
                        // 检测时间冲突
                        if (checkOverlap(task.date, newTime, task.estDuration, task.scheduleId, type)) {
                            window.triggerTouchHaptic('Error');
                            return;
                        }
                        if (newTime !== task.startTime) {
                            pushHistory();
                            task.startTime = newTime;
                            updated = true;
                        }
                    }
                } else if (direction === 'down') {
                    if (isMonth) {
                        const newDate = addDaysToDate(task.date, 7);
                        if (checkOverlap(newDate, task.startTime, task.estDuration, task.scheduleId, type)) {
                            window.triggerTouchHaptic('Error');
                            return;
                        }
                        if (newDate !== task.date) {
                            pushHistory();
                            task.date = newDate;
                            updated = true;
                            checkMonthViewSwitch(newDate);
                        }
                    } else {
                        const newTime = addMinutesToTime(task.startTime, 30);
                        if (checkOverlap(task.date, newTime, task.estDuration, task.scheduleId, type)) {
                            window.triggerTouchHaptic('Error');
                            return;
                        }
                        if (newTime !== task.startTime) {
                            pushHistory();
                            task.startTime = newTime;
                            updated = true;
                        }
                    }
                } else if (direction === 'left') {
                    const newDate = addDaysToDate(task.date, -1);
                    if (checkOverlap(newDate, task.startTime, task.estDuration, task.scheduleId, type)) {
                        window.triggerTouchHaptic('Error');
                        return;
                    }
                    if (newDate !== task.date) {
                        pushHistory();
                        task.date = newDate;
                        updated = true;
                        if (isMonth) checkMonthViewSwitch(newDate);
                        else if (currentView.value === 'week' && newDate < currentWeekDays.value[0].dateStr) viewDate.value = new Date(newDate);
                    }
                } else if (direction === 'right') {
                    const newDate = addDaysToDate(task.date, 1);
                    if (checkOverlap(newDate, task.startTime, task.estDuration, task.scheduleId, type)) {
                        window.triggerTouchHaptic('Error');
                        return;
                    }
                    if (newDate !== task.date) {
                        pushHistory();
                        task.date = newDate;
                        updated = true;
                        if (isMonth) checkMonthViewSwitch(newDate);
                        else if (currentView.value === 'week' && newDate > currentWeekDays.value[6].dateStr) viewDate.value = new Date(newDate);
                    }
                }
            };

            // 🟢 [新增] 专门用于清理聚合任务录音数据的函数
            const clearAggregateRecords = (task) => {
                // 1. 确定任务类型和 ID
                let filterKey = 'musicianId';
                let filterId = task.musicianId;
                let viewType = 'musician';

                if (task.projectId) {
                    filterKey = 'projectId';
                    filterId = task.projectId;
                    viewType = 'project';
                } else if (task.instrumentId) {
                    filterKey = 'instrumentId';
                    filterId = task.instrumentId;
                    viewType = 'instrument';
                }

                // 2. 找到该任务在当前 Session 中的顺序 (Section Index)
                // 因为聚合任务是通过索引与任务池条目关联的
                const relatedSchedules = scheduledTasks.value.filter(t =>
                    (t.sessionId || 'S_DEFAULT') === currentSessionId.value &&
                    t[filterKey] === filterId
                ).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

                const sectionIndex = relatedSchedules.findIndex(t => t.scheduleId === task.scheduleId);
                if (sectionIndex === -1) return;

                // 3. 遍历任务池，清理对应 Section 的数据
                let hasCleared = false;
                itemPool.value.forEach(item => {
                    // 必须匹配 ID 且 匹配 SectionIndex
                    if (item[filterKey] === filterId) {
                        if (item.sectionIndex === sectionIndex) {
                            // --- 执行清理 ---
                            if (item.records && item.records[viewType]) {
                                const rec = item.records[viewType];
                                if (rec.actualDuration || rec.recStart) {
                                    rec.actualDuration = '';
                                    rec.recStart = '';
                                    rec.recEnd = '';
                                    rec.breakMinutes = 0;
                                    hasCleared = true;
                                }
                            }
                        }

                        // 🟢 关键: 删除中间的一个块后，后面的块索引需要前移
                        // 否则后面的任务会找不到对应的日程块
                        if (item.sectionIndex > sectionIndex) {
                            item.sectionIndex--;
                        }
                    }
                });

                // 4. 如果有数据被清理，强制更新效率计算
                if (hasCleared) {
                    autoUpdateEfficiency(filterId, viewType, false);
                }
            };

            // 🟢 修复: 全局快捷键控制 (优化 ESC 关闭顺序)
            const handleGlobalKey = e => {
                const isAnyModalOpen =
                    showSettings.value || showEditor.value || showTrackList.value ||
                    showAuthModal.value || showCropModal.value || showMobileMenu.value ||
                    showColorPickerModal.value || showMobileTaskInput.value ||
                    showQuickAddModal.value || showRecInfoModal.value ||
                    showConfirmModal.value || showInputModal.value ||
                    showSplitModal.value || showCreditModal.value ||
                    showMidiManager.value || showMidiImportModal.value || showCsvImportModal.value ||
                    showProjectInfoModal.value;


                // 2. ESC 键特权处理 (按视觉层级，由上至下逐层处理)
                if (e.key === 'Escape') {

                    // === 层级 1: 全局顶层浮窗 (优先级最高，无论下面是什么) ===
                    if (showDurationPicker.value) { closePicker(); e.preventDefault(); return; }
                    if (showColorPickerModal.value) { showColorPickerModal.value = false; e.preventDefault(); return; }
                    // 确认框/输入框通常在最顶层
                    if (showConfirmModal.value) { closeConfirmModal(); e.preventDefault(); return; }
                    if (showInputModal.value) { closeInputModal(); e.preventDefault(); return; }

                    // === 层级 2: 业务弹窗 (按堆叠顺序判断) ===
                    // 关键逻辑：先判断顶层弹窗，再判断该弹窗内部的下拉/状态‘

                    if (showProjectInfoModal.value) {
                        showProjectInfoModal.value = false;
                        return;
                    }

                    // [Top] 快速添加弹窗 (可能叠加在 MobileTaskInput 之上)
                    if (showQuickAddModal.value) {
                        // 优先关闭内部的分组建议
                        if (showGroupSuggestions.value) { showGroupSuggestions.value = false; }
                        // 否则关闭弹窗本身
                        else { showQuickAddModal.value = false; }
                        e.preventDefault(); return;
                    }

                    // [Top] 录音信息弹窗 (可能叠加在 TrackList 之上)
                    if (showRecInfoModal.value) {
                        if (activeRecDropdown.value) { activeRecDropdown.value = null; }
                        else { showRecInfoModal.value = false; }
                        e.preventDefault(); return;
                    }

                    // [Top] 拆分/Credit/裁切/导入 (独立弹窗)
                    if (showSplitModal.value) { showSplitModal.value = false; e.preventDefault(); return; }
                    if (showCreditModal.value) { showCreditModal.value = false; e.preventDefault(); return; }
                    if (showCropModal.value) { showCropModal.value = false; e.preventDefault(); return; }
                    if (showImportModal.value) { showImportModal.value = false; e.preventDefault(); return; }
                    // 🟢 新增：处理 CSV 导入弹窗的关闭
                    if (showCsvImportModal.value) {
                        showCsvImportModal.value = false;
                        e.preventDefault();
                        return;
                    }

                    // [Top] MIDI 导入界面 (🟢 修复: 加入 ESC 支持)
                    if (showMidiImportModal.value) {
                        // 如果打开了右键菜单，先关菜单
                        if (activeImportMenu.rowId) { closeImportMenu(); }
                        else { showMidiImportModal.value = false; }
                        e.preventDefault(); return;
                    }

                    // [Top] MIDI 管理界面 (🟢 修复: 加入 ESC 支持)
                    if (showMidiManager.value) {
                        // 如果打开了分组菜单，先关菜单
                        if (activeMidiGroupRow.value) { activeMidiGroupRow.value = null; }
                        else { showMidiManager.value = false; }
                        e.preventDefault(); return;
                    }

                    // [Middle] TrackList 详情页
                    if (showTrackList.value) { showTrackList.value = false; e.preventDefault(); return; }

                    // [Middle] 编辑/新建页 (MobileTaskInput / Editor)
                    if (showMobileTaskInput.value) {
                        // 如果内部的主下拉菜单打开了，先关下拉
                        if (activeDropdown.value) { activeDropdown.value = null; }
                        else { showMobileTaskInput.value = false; }
                        e.preventDefault(); return;
                    }

                    if (showEditor.value) {
                        // Editor 内部也有下拉
                        if (activeDropdown.value && activeDropdown.value.startsWith('edit_')) { activeDropdown.value = null; }
                        else { showEditor.value = false; }
                        e.preventDefault(); return;
                    }

                    // [Bottom] 设置页
                    if (showSettings.value) {
                        if (settingsNameFocus.value || settingsGroupFocus.value) {
                            settingsNameFocus.value = null; settingsGroupFocus.value = null;
                        } else {
                            showSettings.value = false;
                        }
                        e.preventDefault(); return;
                    }

                    // [Bottom] 侧边栏菜单/用户菜单
                    if (showMobileMenu.value) { showMobileMenu.value = false; e.preventDefault(); return; }
                    if (showProfileMenu.value) { showProfileMenu.value = false; e.preventDefault(); return; }
                    if (showAuthModal.value) { showAuthModal.value = false; e.preventDefault(); return; }

                    // === 层级 3: 基础界面交互 (最低优先级) ===

                    // 如果没有任何弹窗，但在主界面打开了下拉 (如 Session 切换)
                    if (activeDropdown.value) { activeDropdown.value = null; e.preventDefault(); return; }

                    // 清除任务选择
                    if (selectedTaskId.value || selectedPoolIds.value.size > 0) {
                        clearSelection();
                        e.preventDefault();
                        return;
                    }
                }

                if (e.shiftKey && e.key.toLowerCase() === 'f') {
                    // 输入框保护：如果在打字，不触发折叠
                    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
                    if (isTyping) return;

                    e.preventDefault();

                    // --- 场景 1: CSV 导入弹窗 ---
                    if (showCsvImportModal.value) {
                        const allGroups = groupedCsvData.value.map(g => g.projectName);
                        const isAllCollapsed = allGroups.every(name => collapsedProjects.has(name));
                        if (isAllCollapsed) {
                            collapsedProjects.clear();
                        } else {
                            allGroups.forEach(name => collapsedProjects.add(name));
                        }
                        if (isMobile.value) window.triggerTouchHaptic('Light');
                        return;
                    }

                    // --- 场景 2: MIDI 管理器弹窗 (修复点) ---
                    if (showMidiManager.value) {
                        // 修正：从数组中提取组名，并移除 Set 的 .value
                        const allGroups = projectMidiGroups.value.map(g => g.name);
                        const isAllExpanded = allGroups.every(name => midiManagerExpandedGroups.has(name));

                        if (isAllExpanded) {
                            midiManagerExpandedGroups.clear();
                        } else {
                            midiManagerExpandedGroups.clear();
                            allGroups.forEach(name => midiManagerExpandedGroups.add(name));
                        }
                        if (isMobile.value) window.triggerTouchHaptic('Light');
                        return;
                    }

                    // --- 场景 3: 侧边栏任务池 (原逻辑) ---
                    const allItems = filteredSidebarList.value;
                    if (allItems.length > 0) {
                        const isAllExpanded = allItems.every(item => expandedStatsIds.has(item.id));
                        if (isAllExpanded) {
                            expandedStatsIds.clear();
                        } else {
                            allItems.forEach(item => expandedStatsIds.add(item.id));
                        }
                    }
                    return;
                }

                // 4. 撤销/重做 (Cmd+Z / Ctrl+Z) - 这些通常允许在无弹窗时全局触发
                if ((e.metaKey || e.ctrlKey)) {
                    if (e.key.toLowerCase() === 'z') {
                        e.preventDefault();
                        if (e.shiftKey) redo(); else undo();
                        return;
                    }
                    if (e.key.toLowerCase() === 'y') {
                        e.preventDefault();
                        redo();
                        return;
                    }
                }

                // 3. 🟢 核心修复: 如果有任何弹窗打开，直接停止后续逻辑
                // 这防止了在弹窗打开时，按下 Delete 键误删背景里的任务，或者按方向键移动任务
                if (isAnyModalOpen) return;

                // 5. 输入框保护: 防止在侧边栏搜索框打字时触发快捷键
                const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
                if (isTyping) return;

                // 🟢 修改: handleGlobalKey 中的 Tab 键逻辑
                if (e.key === 'Tab') {
                    e.preventDefault();
                    if (e.altKey) {
                        // Alt+Tab: 切换 Session (保持不变)
                        const sessions = settings.sessions;
                        const currentIndex = sessions.findIndex(s => s.id === currentSessionId.value);
                        let nextIndex = e.shiftKey ? (currentIndex - 1 + sessions.length) % sessions.length : (currentIndex + 1) % sessions.length;
                        if (sessions.length > 0) currentSessionId.value = sessions[nextIndex].id;
                    } else if (e.shiftKey) {
                        // Shift+Tab: 切换 周/月 视图 (保持不变)
                        currentView.value = currentView.value === 'week' ? 'month' : 'week';
                        switchView(target);
                    } else {
                        // 🟢 Tab: 在 人员 -> 项目 -> 乐器 之间循环切换
                        if (sidebarTab.value === 'musician') {
                            sidebarTab.value = 'project';
                        } else if (sidebarTab.value === 'project') {
                            sidebarTab.value = 'instrument';
                        } else {
                            sidebarTab.value = 'musician';
                        }

                        // 可选: 切换时给个轻微震动反馈
                        if (isMobile.value) window.triggerTouchHaptic('Light');
                    }
                    return;
                }

                // 8. 侧边栏导航 (仅当未选中日程表任务时生效)
                if (selectedSource.value !== 'schedule' && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                    // Browse 模式下的左右键 (切换分组)
                    if (sidebarTab.value === 'browse' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                        e.preventDefault();
                        const keys = ['projectId', 'musicianId', 'instrumentId'];
                        const currentIndex = keys.indexOf(sortKey.value);
                        let newIndex = e.key === 'ArrowRight' ? (currentIndex + 1) % keys.length : (currentIndex - 1 + keys.length) % keys.length;
                        sortKey.value = keys[newIndex];
                        activeColorKey.value = keys[newIndex];
                        return;
                    }

                    // 上下键选择列表项
                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        const visibleItems = [];
                        if (sidebarTab.value === 'browse') {
                            groupedItemPool.value.forEach(group => {
                                if (expandedGroups.has(group.key)) visibleItems.push(...group.items);
                            });
                        } else {
                            musicianStats.value.forEach(stat => {
                                if (expandedStatsIds.has(stat.id)) visibleItems.push(...stat.items);
                            });
                        }
                        if (visibleItems.length === 0) return;

                        let currentIdx = -1;
                        const focusId = lastPoolFocusId.value || lastPoolClickId.value;
                        if (focusId) currentIdx = visibleItems.findIndex(i => i.id === focusId);

                        let newIdx = currentIdx === -1
                            ? (e.key === 'ArrowDown' ? 0 : visibleItems.length - 1)
                            : (e.key === 'ArrowDown' ? Math.min(currentIdx + 1, visibleItems.length - 1) : Math.max(currentIdx - 1, 0));

                        const targetItem = visibleItems[newIdx];
                        if (targetItem) {
                            selectTask(targetItem.id, 'pool', e);
                            // 简单的滚动跟随逻辑
                            setTimeout(() => {
                                const activeEl = document.querySelector('#sidebar .border-blue-600') || document.querySelector('#sidebar .ring-2');
                                if (activeEl) activeEl.scrollIntoView({behavior: 'smooth', block: 'nearest'});
                            }, 0);
                        }
                        return;
                    }
                }

                // 9. 日程表操作 (移动任务)
                if (selectedTaskId.value && selectedSource.value === 'schedule') {
                    const task = scheduledTasks.value.find(t => t.scheduleId === selectedTaskId.value);
                    if (!task) return;

                    const keyMap = {'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right'};
                    const direction = keyMap[e.key];

                    if (direction) {
                        e.preventDefault();
                        moveTask(task, direction);
                    }
                }

                // 10. 删除操作
                if (e.key === 'Backspace' || e.key === 'Delete') {
                    // 情况 A: 删除侧边栏选中的任务池项目 ... (保持不变)
                    if (selectedSource.value === 'pool' && selectedPoolIds.value.size > 0) {

                        // 🛡️ [新增] 批量删除前的安全检查
                        let canDeleteAll = true;
                        for (const id of selectedPoolIds.value) {
                            const task = itemPool.value.find(i => i.id === id);
                            if (task) {
                                // 复用检查函数，如果返回 false，标记为不可删除
                                if (!checkCanDeleteSplit(task)) {
                                    canDeleteAll = false;
                                    break; // 只要有一个不行，就全部打断
                                }
                            }
                        }
                        if (!canDeleteAll) return; // ⛔️ 阻止删除

                        // ... (原有的删除逻辑) ...
                        selectedPoolIds.value.forEach(id => {
                            const task = itemPool.value.find(i => i.id === id);
                            if (task) restoreSplitTime(task);
                        });
                        scheduledTasks.value = scheduledTasks.value.filter(t => !selectedPoolIds.value.has(t.templateId));
                        itemPool.value = itemPool.value.filter(i => !selectedPoolIds.value.has(i.id));
                        cleanupEmptySchedules();
                        clearSelection();
                        pushHistory();
                    }
                    // 情况 B: 删除日程表选中的任务 (单选)
                    else if (selectedTaskId.value && selectedSource.value === 'schedule') {
                        const taskToDelete = scheduledTasks.value.find(t => t.scheduleId === selectedTaskId.value);

                        // 🟢 新增: 拦截已完成任务
                        if (taskToDelete && isResourceCompleted(taskToDelete)) {
                            window.triggerTouchHaptic('Error');
                            // 这里使用轻提示或者不做动作，避免频繁弹窗打断，或者可以选择弹窗
                            return openAlertModal("无法删除", "该任务处于【完成】保护状态。");
                        }

                        if (taskToDelete) {
                            // 🟢 修复开始: 区分 单曲任务 和 聚合任务 进行清理
                            if (taskToDelete.templateId) {
                                // 1. 单曲任务 (有 templateId) -> 清理指定 ID
                                clearPoolRecord(taskToDelete.templateId);
                            } else {
                                // 2. 聚合任务 (无 templateId) -> 使用新函数清理关联数据
                                clearAggregateRecords(taskToDelete);
                            }
                            // 🟢 修复结束

                            // 物理删除
                            scheduledTasks.value = scheduledTasks.value.filter(t => t.scheduleId !== selectedTaskId.value);

                            // 触发震动反馈
                            if (isMobile.value) window.triggerTouchHaptic('Medium');

                            clearSelection();
                            pushHistory();
                        }
                    }
                }
            };

            // 🟢 修改: handleTaskDblClick 适配三种视图逻辑
            const handleTaskDblClick = (e, task) => {
                if (isContextSwitching.value) return;
                if (isTaskGhost(task)) {
                    jumpToGhostContext(task);
                    return;
                }
                window.triggerTouchHaptic('Heavy');

                if (e.metaKey || e.ctrlKey) {
                    // ... (保留原有的拆分逻辑不变) ...
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickY = e.clientY - rect.top;
                    const splitM = Math.round((clickY / pxPerMin.value) / 30) * 30;
                    const tot = parseTime(task.estDuration);
                    if (splitM * 60 >= tot || splitM <= 0) return;
                    const t1 = JSON.parse(JSON.stringify(task));
                    t1.scheduleId = Date.now();
                    t1.estDuration = formatSecs(splitM * 60);
                    const t2 = JSON.parse(JSON.stringify(task));
                    t2.scheduleId = Date.now() + 1;
                    const [h, m] = task.startTime.split(':').map(Number);
                    const sm = h * 60 + m + splitM;
                    t2.startTime = `${Math.floor(sm / 60)}:${String(sm % 60).padStart(2, '0')}`;
                    t2.estDuration = formatSecs(tot - splitM * 60);
                    scheduledTasks.value = scheduledTasks.value.filter(t => t.scheduleId !== task.scheduleId);
                    scheduledTasks.value.push(t1, t2);
                    pushHistory();
                } else {
                    const currentSchedule = scheduledTasks.value.find(t => t.scheduleId === task.scheduleId);
                    if (!currentSchedule) return;

                    // 1. 确定日程块类型 (用于后续筛选和显示)
                    let blockType = 'musician';
                    let filterId = task.musicianId;

                    if (task.musicianId) {
                        blockType = 'musician';
                        filterId = task.musicianId;
                    } else if (task.projectId) {
                        blockType = 'project';
                        filterId = task.projectId;
                    } else if (task.instrumentId) {
                        blockType = 'instrument';
                        filterId = task.instrumentId;
                    }

                    // 2. 筛选相关的日程 (用于计算分段)
                    // 注意：这里要根据类型筛选，比如是项目块，就要找同项目同Session的所有块
                    const relatedSchedules = scheduledTasks.value
                        .filter(t => {
                            if ((t.sessionId || 'S_DEFAULT') !== currentSessionId.value) return false;
                            if (blockType === 'musician') return t.musicianId === filterId;
                            if (blockType === 'project') return t.projectId === filterId && !t.musicianId; // 严格匹配类型
                            if (blockType === 'instrument') return t.instrumentId === filterId && !t.musicianId && !t.projectId;
                            return false;
                        })
                        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

                    const currentSectionIndex = relatedSchedules.findIndex(t => t.scheduleId === task.scheduleId);
                    const totalSections = relatedSchedules.length;

                    // 3. 筛选任务池 (Pool Items)
                    // 根据 blockType 决定筛选条件
                    const poolItems = itemPool.value.filter(i => {
                        if ((i.sessionId || 'S_DEFAULT') !== currentSessionId.value) return false;
                        if (blockType === 'musician') return i.musicianId === filterId;
                        if (blockType === 'project') return i.projectId === filterId;
                        if (blockType === 'instrument') return i.instrumentId === filterId;
                        return false;
                    });

                    // 初始化分段
                    poolItems.forEach(i => {
                        ensureItemRecords(i);
                        if (i.sectionIndex === undefined) i.sectionIndex = 0;
                        if (i.sectionIndex >= totalSections) i.sectionIndex = totalSections - 1;
                    });

                    // 4. 设置弹窗数据
                    let modalTitle = '';
                    if (blockType === 'musician') modalTitle = getNameById(filterId, 'musician');
                    else if (blockType === 'project') modalTitle = getNameById(filterId, 'project');
                    else if (blockType === 'instrument') modalTitle = getNameById(filterId, 'instrument');

                    trackListData.value = {
                        name: modalTitle,
                        items: poolItems,
                        taskRef: currentSchedule,
                        totalSections: totalSections,
                        currentSectionIndex: currentSectionIndex,
                        schedules: relatedSchedules,
                        viewType: blockType // 🟢 关键：传入视图类型，供 HTML 模板判断显示内容
                    };

                    // ... (前面的代码保持不变)
                    autoSortTrackList();
                    showTrackList.value = true;

                    // ✨✨✨ 修复版：自动滚动逻辑 ✨✨✨
                    // 使用 setTimeout 代替单纯的 nextTick，给浏览器 50ms-100ms 的渲染缓冲时间
                    setTimeout(() => {
                        const container = trackListContainerRef.value;
                        if (!container) return;

                        const targetIdx = trackListData.value.currentSectionIndex;

                        // 如果是第 0 段，直接滚到顶部 (最稳妥)
                        if (targetIdx === 0) {
                            container.scrollTo({ top: 0, behavior: 'auto' });
                        } else {
                            const dividerId = 'sec-divider-' + targetIdx;
                            const dividerEl = document.getElementById(dividerId);

                            if (dividerEl) {
                                // 🟢 关键：先尝试瞬移
                                dividerEl.scrollIntoView({ behavior: 'auto', block: 'start' });

                                // 🟢 双重保险：
                                // 因为 TransitionGroup 的动画可能会在滚动后把元素位置挤偏
                                // 所以在动画结束(300ms)后，再微调一次，确保位置绝对正确
                                setTimeout(() => {
                                    const retryEl = document.getElementById(dividerId);
                                    if(retryEl) retryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 350);
                            } else {
                                // 调试用：如果找不到元素，打印日志
                                // console.warn('未找到分割线元素:', dividerId);
                            }
                        }
                    }, 50); // 👈 这里设置 50ms 延迟，既不明显卡顿，又能避开渲染冲突
                    // ✨✨✨ 修复结束 ✨✨✨
                }
            };

            const setTrackNow = (item, type) => {
                const viewType = trackListData.value.viewType || 'musician';
                const record = item.records[viewType];

                const now = new Date();
                const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

                if (type === 'start') record.recStart = timeStr;
                if (type === 'end') record.recEnd = timeStr;

                calcTrackDiff(item);
                pushHistory();
            };

            // 🟢 修改: checkOverlap (支持分层检测)
            const checkOverlap = (date, startTime, durationStr, excludeId, checkType) => {
                // 1. 计算当前意图的时间段
                const newStart = timeToMinutes(startTime);
                const newEnd = newStart + parseTime(durationStr) / 60;

                return scheduledTasks.value.some(t => {
                    // 排除自身
                    if (t.scheduleId === excludeId) return false;

                    // 排除其他日期
                    if (t.date !== date) return false;

                    // 排除其他 Session
                    if ((t.sessionId || 'S_DEFAULT') !== currentSessionId.value) return false;

                    // 🟢 核心修改: 判断现有任务 t 的类型
                    let tType = 'musician';
                    if (t.projectId) tType = 'project';
                    else if (t.instrumentId) tType = 'instrument';

                    // 🟢 只有类型一致时，才检查时间冲突
                    // (即: 项目任务只跟项目任务撞，不跟人员任务撞)
                    if (tType !== checkType) return false;

                    // 计算现有任务的时间段
                    const tStart = timeToMinutes(t.startTime);
                    const tEnd = tStart + parseTime(t.estDuration) / 60;

                    return (newStart < tEnd && newEnd > tStart);
                });
            };


            const saveTrackRecord = (item) => {
                if (trackSaveTimer) clearTimeout(trackSaveTimer);
                trackSaveTimer = setTimeout(() => {
                    const viewType = trackListData.value.viewType || 'musician';
                    let targetId = item.musicianId;
                    if (viewType === 'project') targetId = item.projectId;
                    else if (viewType === 'instrument') targetId = item.instrumentId;

                    // 🟢 调用新函数
                    autoUpdateEfficiency(targetId, viewType);
                }, 1500);
            };

            const clearTrackTime = (item) => {
                const viewType = trackListData.value.viewType || 'musician';
                const record = item.records[viewType];

                record.recStart = '';
                record.recEnd = '';
                record.actualDuration = '';

                autoResizeScheduleByRecords(true, false);

                // 🟢 获取正确的 ID 并调用新函数
                let targetId = item.musicianId;
                if (viewType === 'project') targetId = item.projectId;
                else if (viewType === 'instrument') targetId = item.instrumentId;

                autoUpdateEfficiency(targetId, viewType, false);

                pushHistory();
                window.triggerTouchHaptic('Medium');
            };

            // 🟢 辅助：计算编制人数 (将 "4.3.2.1" 解析为 10, "4 Hn" 解析为 4)
            const getOrchSize = (str) => {
                if (!str) return 0;
                // 提取所有数字并求和
                const nums = str.match(/\d+/g);
                if (!nums) return 0; // 如果没有数字（如 "Solo"），算作 0，或者你可以设为 1
                return nums.reduce((sum, n) => sum + parseInt(n, 10), 0);
            };

            // 🟢 辅助：判断是否为管弦乐组 (Brass/String/Woodwind)
            const isOrchestraGroup = (item) => {
                const name = getNameById(item.instrumentId, 'instrument').toLowerCase();
                // 也可以结合 settings 中的 group 字段判断，这里简单匹配常用关键词
                const group = (settings.instruments.find(i => i.id === item.instrumentId)?.group || '').toLowerCase();
                const text = name + ' ' + group;
                return /string|str|brass|wind|wood|hn|tpt|tbn|tuba|vln|vla|vc|db|flute|oboe|clar|bsn/.test(text);
            };

            // 🟢 辅助：判断是否为打击乐 (Percussion)
            const isPercussionGroup = (item) => {
                const name = getNameById(item.musicianId, 'musician').toLowerCase();

                // 只有演奏员名字里带有 "perc" (如 "Percussion", "Perc 1", "SPO Perc") 时，才视为打击乐组
                // 这样 "Timpani" 或 "Drum Set" 如果名字里没带 Perc，就会正常显示黄色编制标签
                return /perc/.test(name);
            };

            // 🟢 修复: 判断是否为弦乐 (V3: 仅检测演奏员名字，只有演奏员叫 "Strings" 时才隐藏)
            const isStringGroup = (item) => {
                // 获取【演奏员】的名字，而不是乐器名
                const name = getNameById(item.musicianId, 'musician').toLowerCase();

                // 只有当演奏员名字里包含 "string", "strings", "str" 时返回 true
                // 例如: "String Ensemble", "Strings A", "Orch Strings"
                return /\b(strings?|str)\b/i.test(name);
            };

            // 🟢 [修复版] 手动排序按钮
            const sortTrackList = () => {
                if (!trackListData.value.items) return;

                const viewType = trackListData.value.viewType || 'musician';

                // 1. 执行排序
                trackListData.value.items = [...trackListData.value.items].sort((a, b) => {
                    // 优先级 1: 分段索引 (Section) - 必须是最高优先级，确保任务不跨块乱跳
                    const secA = a.sectionIndex || 0;
                    const secB = b.sectionIndex || 0;
                    if (secA !== secB) return secA - secB;

                    // 优先级 2: Skip 状态 - 在同一个日程块内部，把不录的任务排到块内底部
                    if (!!a.isSkipped !== !!b.isSkipped) return a.isSkipped ? 1 : -1;

                    // 优先级 3: 时间优先 - 块内按具体录音开始时间排序
                    const recA = a.records?.[viewType];
                    const recB = b.records?.[viewType];
                    const tA = (recA && recA.recStart) ? recA.recStart : '99:99';
                    const tB = (recB && recB.recStart) ? recB.recStart : '99:99';
                    if (tA !== tB) return tA.localeCompare(tB);

                    // --- 以下是时间相同时的备选逻辑 ---

                    // 优先级 3: 管弦乐团按人数排序
                    const isOrchA = isOrchestraGroup(a);
                    const isOrchB = isOrchestraGroup(b);
                    if (isOrchA && isOrchB && !isPercussionGroup(a) && !isPercussionGroup(b)) {
                        const sizeA = getOrchSize(a.orchestration);
                        const sizeB = getOrchSize(b.orchestration);
                        if (sizeA !== sizeB) return sizeB - sizeA;
                    }

                    // 优先级 4: 打击乐按名称归类
                    const nameA = getNameById(a.instrumentId, 'instrument');
                    const nameB = getNameById(b.instrumentId, 'instrument');
                    const isPercA = isPercussionGroup(a);
                    const isPercB = isPercussionGroup(b);

                    if (isPercA && isPercB) {
                        if (nameA !== nameB) return nameA.localeCompare(nameB, 'zh-CN');
                    }

                    return 0;
                });

                // 2. 自动吸附 & 保存
                autoResizeScheduleByRecords(true, false);
                pushHistory();
                window.triggerTouchHaptic('Medium');
            };

            // 🟢 [修复版] 自动排序逻辑 (与上方保持一致)
            const autoSortTrackList = () => {
                if (!trackListData.value.items) return;

                const viewType = trackListData.value.viewType || 'musician';

                trackListData.value.items.sort((a, b) => {
                    // 0. Skip
                    if (!!a.isSkipped !== !!b.isSkipped) return a.isSkipped ? 1 : -1;

                    const secA = a.sectionIndex || 0;
                    const secB = b.sectionIndex || 0;
                    if (secA !== secB) return secA - secB;

                    // 优先级 2: Skip 状态 - 在同一个日程块内部，把不录的任务排到块内底部
                    if (!!a.isSkipped !== !!b.isSkipped) return a.isSkipped ? 1 : -1;

                    // 优先级 3: 时间优先 - 块内按具体录音开始时间排序
                    const recA = a.records?.[viewType];
                    const recB = b.records?.[viewType];
                    const tA = (recA && recA.recStart) ? recA.recStart : '99:99';
                    const tB = (recB && recB.recStart) ? recB.recStart : '99:99';
                    if (tA !== tB) return tA.localeCompare(tB);

                    // 3. Orchestra Size
                    const isOrchA = isOrchestraGroup(a);
                    const isOrchB = isOrchestraGroup(b);
                    if (isOrchA && isOrchB && !isPercussionGroup(a) && !isPercussionGroup(b)) {
                        const sizeA = getOrchSize(a.orchestration);
                        const sizeB = getOrchSize(b.orchestration);
                        if (sizeA !== sizeB) return sizeB - sizeA;
                    }

                    // 4. Percussion Grouping
                    const nameA = getNameById(a.instrumentId, 'instrument');
                    const nameB = getNameById(b.instrumentId, 'instrument');
                    const isPercA = isPercussionGroup(a);
                    const isPercB = isPercussionGroup(b);
                    if (isPercA && isPercB) {
                        if (nameA !== nameB) return nameA.localeCompare(nameB, 'zh-CN');
                    }

                    return 0;
                });
            };

            // 🟢 修改: 增加 shouldSaveHistory 参数，防止拖动时卡顿
            const moveDivider = (dividerIndex, direction, shouldSaveHistory = true) => {
                const upperSection = dividerIndex - 1;
                const lowerSection = dividerIndex;
                const items = trackListData.value.items;

                if (direction === 'up') {
                    // 向上移：把上方分段的最后一个任务，拉到下方分段
                    for (let i = items.length - 1; i >= 0; i--) {
                        if (items[i].sectionIndex === upperSection) {
                            items[i].sectionIndex = lowerSection;
                            break;
                        }
                    }
                } else if (direction === 'down') {
                    // 向下移：把下方分段的第一个任务，推到上方分段
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].sectionIndex === lowerSection) {
                            items[i].sectionIndex = upperSection;
                            break;
                        }
                    }
                }

                // 重新排序
                // autoSortTrackList();

                // 🟢 关键: 拖动过程中不存历史，只在松手时存
                if (shouldSaveHistory) {
                    pushHistory();
                }
            };

            // --- Date/View Logic ---
            const timeSlots = computed(() => {
                const s = [];
                for (let i = settings.startHour; i < settings.endHour; i++) {
                    s.push(`${i}:00`);
                    s.push(`${i}:30`);
                }
                return s;
            });

            // 🟢 修改: getTaskStyle (增加 z-index 控制)
            const getTaskStyle = t => {
                const [h, m] = t.startTime.split(':').map(Number);
                const top = ((h - settings.startHour) * 60 + m) * pxPerMin.value;
                const hgt = (parseTime(t.estDuration) / 60) * pxPerMin.value;

                let baseColor = '#a855f7';
                if (t.projectId) baseColor = '#eab308';
                else if (t.instrumentId) baseColor = '#3b82f6';

                // 🟢 核心修改: 计算层级
                // 如果任务不是幽灵（即它是当前视图的任务），层级设为 20 (高)
                // 如果是幽灵，层级设为 1 (低)
                const isGhost = isTaskGhost(t); // 复用之前的判断函数
                const zIndex = isGhost ? 1 : 20;

                return {
                    top: `${top}px`,
                    height: `${hgt}px`,
                    '--task-border': baseColor,
                    zIndex: zIndex, // 应用层级
                };
            };

            // 🟢 新增: 获取日程块显示的标题
            const getBlockTitle = (task) => {
                if (task.musicianId) return getNameById(task.musicianId, 'musician');
                if (task.projectId) return getNameById(task.projectId, 'project');
                if (task.instrumentId) return getNameById(task.instrumentId, 'instrument');
                return '未命名日程';
            };

            // 🟢 新增: 判断任务是否为"幽灵"状态 (Session不匹配 或 视图类型不匹配)
            const isTaskGhost = (task) => {
                // 1. 检查 Session 是否匹配 (最基础条件)
                const taskSession = task.sessionId || 'S_DEFAULT';
                if (taskSession !== currentSessionId.value) return true;

                // 2. 检查视图类型是否匹配
                // 当前侧边栏在什么模式，就只亮显什么类型的块

                // 如果是 'musician' (人员) 视图 -> 只有含 musicianId 的块亮显
                if (sidebarTab.value === 'musician') {
                    return !task.musicianId;
                }

                // 如果是 'project' (项目) 视图 -> 只有含 projectId 的块亮显
                if (sidebarTab.value === 'project') {
                    return !task.projectId;
                }

                // 如果是 'instrument' (乐器) 视图 -> 只有含 instrumentId 的块亮显
                if (sidebarTab.value === 'instrument') {
                    return !task.instrumentId;
                }

                return false; // 默认不变成幽灵
            };

            const hasRecordingInfo = (task) => {
                // 定义一个辅助函数来检查对象是否有内容
                const checkInfo = (info) => {
                    if (!info) return false;
                    return !!(
                        (info.studio && info.studio.trim()) ||
                        (info.engineer && info.engineer.trim()) ||
                        (info.operator && info.operator.trim()) ||
                        (info.assistant && info.assistant.trim()) ||
                        (info.notes && info.notes.trim())
                    );
                };

                // 同时检查录音信息和编辑信息
                return checkInfo(task.recordingInfo) || checkInfo(task.editInfo);
            };

            // 🟢 [修改] ensureItemRecords: 修复“自动跟随”失效的问题
            const ensureItemRecords = (item) => {
                // 1. 初始化时间记录 records (保持不变)
                if (!item.records) {
                    item.records = { musician: {}, project: {}, instrument: {} };
                    if (item.actualDuration || item.recStart || item.recEnd) {
                        item.records.musician = {
                            recStart: item.recStart || '',
                            recEnd: item.recEnd || '',
                            actualDuration: item.actualDuration || '',
                            breakMinutes: item.breakMinutes || 0
                        };
                    }
                }
                if (!item.records.musician) item.records.musician = {};
                if (!item.records.project) item.records.project = {};
                if (!item.records.instrument) item.records.instrument = {};

                // 2. 初始化多维倍率 ratios
                if (!item.ratios) {
                    // 旧数据迁移：如果是旧数据，保留原 ratio；如果是新初始化，设为 null (自动)
                    const oldRatio = item.ratio || 20;

                    item.ratios = {
                        // 演奏员：保留旧值作为初始值
                        musician: item.musicianId ? oldRatio : null,
                        // 项目/乐器：默认为 null (开启自动跟随)
                        project: null,
                        instrument: null
                    };
                }

                // 🛑 删除或注释掉下面这三行！它们是罪魁祸首！
                // if (!item.ratios.musician) item.ratios.musician = 20;
                // if (!item.ratios.project) item.ratios.project = 20;
                // if (!item.ratios.instrument) item.ratios.instrument = 20;

                // 🟢 改为：如果键不存在(undefined)，才初始化为 null；如果是 null 则保留 null
                if (item.ratios.musician === undefined) item.ratios.musician = null;
                if (item.ratios.project === undefined) item.ratios.project = null;
                if (item.ratios.instrument === undefined) item.ratios.instrument = null;

                return item;
            };

            const isToday = d => formatDate(new Date()) === d;

            // --- 🟢 日期切换动画控制 ---
            const dateTransitionName = ref('slide-next'); // 默认方向

            // 🟢 修复: changeDate (修复月视图切换卡顿/跳月问题)
            const changeDate = (dir) => {
                // 1. 设置动画方向
                if (dir > 0) {
                    dateTransitionName.value = 'slide-next';
                } else {
                    dateTransitionName.value = 'slide-prev';
                }

                const d = new Date(viewDate.value);

                if (currentView.value === 'week') {
                    // --- 周视图逻辑 ---
                    // 简单加减 7 天即可
                    d.setDate(d.getDate() + 7 * dir);
                } else {
                    // --- 月视图逻辑 (核心修复) ---
                    // 1. 先把日期设为 1 号
                    // (是为了防止如 "1月31日 + 1个月" 变成 "3月3日" 从而跳过2月的问题)
                    d.setDate(1);

                    // 2. 安全地加减月份
                    d.setMonth(d.getMonth() + dir);
                }

                viewDate.value = d;
                window.triggerTouchHaptic('Light'); // 震动反馈
            };

            const currentWeekDays = computed(() => {
                const d = new Date(viewDate.value);
                const day = d.getDay();
                const diff = d.getDate() - day;
                const s = new Date(d.setDate(diff));
                const r = [];
                for (let i = 0; i < 7; i++) {
                    const c = new Date(s);
                    c.setDate(s.getDate() + i);
                    r.push({
                        dateStr: formatDate(c),
                        weekday: ['日', '一', '二', '三', '四', '五', '六'][c.getDay()],
                        dateShort: `${c.getMonth() + 1}/${c.getDate()}`
                    });
                }
                return r;
            });

            // 🟢 [重构] 通用月历生成函数 (支持生成任意月份的数据)
            const generateMonthGrid = (targetDate) => {
                const y = targetDate.getFullYear();
                const m = targetDate.getMonth(); // 0-11
                const f = new Date(y, m, 1); // 当月第一天
                const l = new Date(y, m + 1, 0); // 当月最后一天
                const r = [];

                // 1. 上个月补位
                for (let i = f.getDay(); i > 0; i--) {
                    const d = new Date(y, m, 1 - i);
                    r.push({
                        fullDate: formatDate(d),
                        dayNum: d.getDate(),
                        isCurrentMonth: false,
                        dateObj: d // 用于后续比较
                    });
                }

                // 2. 当月日期
                for (let i = 1; i <= l.getDate(); i++) {
                    const d = new Date(y, m, i);
                    r.push({
                        fullDate: formatDate(d),
                        dayNum: i,
                        isCurrentMonth: true,
                        dateObj: d
                    });
                }

                // 3. 下个月补位 (默认补齐到 35 或 42 格)
                const targetLen = r.length <= 35 ? 35 : 42;
                while (r.length < targetLen) {
                    const nextDateNum = r.length - l.getDate() - f.getDay() + 1;
                    const d = new Date(y, m + 1, nextDateNum);
                    r.push({
                        fullDate: formatDate(d),
                        dayNum: nextDateNum,
                        isCurrentMonth: false,
                        dateObj: d
                    });
                }
                return r;
            };

// 🟢 [兼容] 保持原有的 currentMonthDays 调用方式 (用于分页模式)
            const currentMonthDays = computed(() => generateMonthGrid(viewDate.value));

// 🟢 [修改] 生成连续的扁平化天数列表 (动态范围)
            const flatScrolledDays = computed(() => {
                const list = [];
                // 使用响应式变量
                const bufferMonths = renderedRange.past;
                const totalMonths = renderedRange.past + renderedRange.future;

                // 起始日期：从 viewDate 往前推
                const startMonthDate = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - bufferMonths, 1);

                // 1. 补位 (Padding)
                const firstDayWeekday = startMonthDate.getDay();
                for (let i = firstDayWeekday; i > 0; i--) {
                    const d = new Date(startMonthDate);
                    d.setDate(d.getDate() - i);
                    list.push({
                        fullDate: formatDate(d),
                        dayNum: d.getDate(),
                        isCurrentMonth: false,
                        isPadding: true,
                        dateObj: d
                    });
                }

                // 2. 生成真实日期
                for (let i = 0; i < totalMonths; i++) {
                    const currentM = new Date(startMonthDate.getFullYear(), startMonthDate.getMonth() + i, 1);
                    const year = currentM.getFullYear();
                    const month = currentM.getMonth();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();

                    for (let d = 1; d <= daysInMonth; d++) {
                        const dateObj = new Date(year, month, d);
                        list.push({
                            fullDate: formatDate(dateObj),
                            dayNum: d,
                            isCurrentMonth: true,
                            isFirstDay: d === 1,
                            dateObj: dateObj
                        });
                    }
                }

                // 3. 尾部补齐
                const remaining = list.length % 7;
                if (remaining > 0) {
                    const lastDate = list[list.length - 1].dateObj;
                    for (let i = 1; i <= (7 - remaining); i++) {
                        const d = new Date(lastDate);
                        d.setDate(d.getDate() + i);
                        list.push({
                            fullDate: formatDate(d),
                            dayNum: d.getDate(),
                            isCurrentMonth: false,
                            isPadding: true,
                            dateObj: d
                        });
                    }
                }

                return list;
            });

            // 🟢 [新增] 无限滚动处理函数
            const handleInfiniteScroll = (e) => {
                // 只在月视图的滚动模式下生效
                if (currentView.value !== 'month' || monthViewMode.value !== 'scrolled') return;
                if (isLoadingMore.value) return;

                const el = e.target; //通常是 #main-content
                const threshold = 800; // 触发阈值 (像素)

                // 1. 向上滚动加载更多历史
                if (el.scrollTop < threshold) {
                    isLoadingMore.value = true;

                    // 记录当前的滚动高度和位置
                    const oldScrollHeight = el.scrollHeight;
                    const oldScrollTop = el.scrollTop;

                    // 增加 6 个月历史
                    renderedRange.past += 6;

                    // 等待 DOM 更新后，修正滚动条位置
                    nextTick(() => {
                        const newScrollHeight = el.scrollHeight;
                        // 关键：新的高度 - 旧的高度 = 新增内容的高度
                        el.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
                        isLoadingMore.value = false;
                    });
                }
                // 2. 向下滚动加载更多未来
                else if (el.scrollTop + el.clientHeight > el.scrollHeight - threshold) {
                    isLoadingMore.value = true;
                    renderedRange.future += 6; // 增加 6 个月未来

                    nextTick(() => {
                        isLoadingMore.value = false;
                    });
                }
            };

            // 🟢 [修改] 滚动到指定日期 (并居中显示)
            const scrollToMonthDate = (targetDate) => {
                // 1. 格式化目标日期字符串 (YYYY-MM-DD)
                // 这样我们可以精确定位到“今天”或者“选中的那天”，而不仅仅是月初
                const targetDateStr = formatDate(targetDate);

                // 2. 稍微延迟，等待 DOM 渲染
                setTimeout(() => {
                    // 3. 利用 data-date 属性查找具体的日期格子
                    // (HTML 模板中已绑定 :data-date="day.fullDate")
                    const el = document.querySelector(`[data-date="${targetDateStr}"]`);

                    if (el) {
                        // 4. block: 'center' 将其置于视口垂直居中位置
                        el.scrollIntoView({ behavior: 'auto', block: 'center' });
                    } else {
                        // 兜底：如果找不到具体日期（比如切到了很远的月份），尝试退回找当月1号
                        const y = targetDate.getFullYear();
                        const m = String(targetDate.getMonth() + 1).padStart(2, '0');
                        const monthStartId = `${y}-${m}-01`;
                        const monthEl = document.querySelector(`[data-month-start="${monthStartId}"]`);

                        if (monthEl) {
                            monthEl.scrollIntoView({ behavior: 'auto', block: 'center' });
                        }
                    }
                }, 50);
            };

            // 监听数据变化 (改名了)
            watch(flatScrolledDays, () => {
                if (monthViewMode.value === 'scrolled') {
                    nextTick(() => initMonthObserver());
                }
            });



            // 🟢 [修改] 顶部标题逻辑：根据模式显示不同日期
            const currentDateLabel = computed(() => {
                // 1. 如果是月视图-滚动模式，显示 IntersectionObserver 侦测到的日期
                if (currentView.value === 'month' && monthViewMode.value === 'scrolled') {
                    return `${visibleTopDate.value.getFullYear()}年 ${visibleTopDate.value.getMonth() + 1}月`;
                }

                // 2. 其他情况 (周视图 或 月视图-分页)，显示选中的 viewDate
                return `${viewDate.value.getFullYear()}年 ${viewDate.value.getMonth() + 1}月`;
            });

            // 找到原有的 tasksByDateMap 定义，用这段代码替换它
            const tasksByDateMap = computed(() => {
                const map = {};
                // 🔴 修改点: 这里原来是 scheduledTasks.value，现在改成 filteredScheduledTasks.value
                for (const task of filteredScheduledTasks.value) {
                    if (!map[task.date]) {
                        map[task.date] = [];
                    }
                    map[task.date].push(task);
                }

                for (const date in map) {
                    map[date].sort((a, b) => {
                        return a.startTime.localeCompare(b.startTime);
                    });
                }

                return map;
            });

            // 辅助函数：仅保留用于模板中仍然需要函数调用的极少数情况 (可选，主要为了兼容)
            const getTasksForDate = (d) => {
                return tasksByDateMap.value[d] || [];
            };
            const switchToWeek = d => {
                viewDate.value = new Date(d);
                currentView.value = 'week';
            };
            const openEditModal = (i, s) => {
                editingItem.value = JSON.parse(JSON.stringify(i));

                // 🟢 关键修改：如果倍率为空或0，默认设为 getDefaultRatio
                if (!editingItem.value.ratio || editingItem.value.ratio <= 0) {
                    editingItem.value.ratio = getDefaultRatio(editingItem.value.musicianId); // 🟢 使用通用默认倍率
                }

                editingSource.value = s;
                showEditor.value = true;
            };

            const saveEdit = () => {
                if (editingItem.value.orchestration) {
                    editingItem.value.orchestration = editingItem.value.orchestration.trim();
                }
                // 🟢 新增：保存前的最后一道防线，如果为空强制设为 20
                if (!editingItem.value.ratio || editingItem.value.ratio <= 0) {
                    editingItem.value.ratio = getDefaultRatio(editingItem.value.musicianId);
                }

                // 核心修复：确保乐曲时长和倍数更新后，估算时长也会更新
                editingItem.value.estDuration = calculateEstTime(editingItem.value.musicDuration, editingItem.value.ratio);
                // 🟢【新增】保存时，自动同步编制信息给所有关联的 Part
                syncFamilyOrchestration(editingItem.value, editingItem.value.orchestration);

                if (editingSource.value === 'pool') {
                    const idx = itemPool.value.findIndex(x => x.id === editingItem.value.id);
                    if (idx !== -1) {
                        // 更新任务模板
                        itemPool.value[idx] = editingItem.value;
                        // 如果是模板，同时更新所有已排期的实例
                        scheduledTasks.value.filter(st => st.templateId === editingItem.value.id).forEach(st => {
                            st.projectId = editingItem.value.projectId;
                            st.instrumentId = editingItem.value.instrumentId;
                            st.musicianId = editingItem.value.musicianId;
                            st.musicDuration = editingItem.value.musicDuration;
                            st.ratio = editingItem.value.ratio;
                            st.estDuration = editingItem.value.estDuration;
                        });
                    }
                } else {
                    const idx = scheduledTasks.value.findIndex(x => x.scheduleId === editingItem.value.scheduleId);
                    if (idx !== -1) {
                        scheduledTasks.value[idx] = editingItem.value;
                        updateTaskNotification(scheduledTasks.value[idx]);
                    }
                }

                showEditor.value = false;

                // 🟢 修复点：保存后，立即触发效率重算
                // 因为修改了时长(Music Duration)，会导致分母变化，从而影响平均倍率
                if (editingItem.value.musicianId) autoUpdateEfficiency(editingItem.value.musicianId, 'musician', false);
                if (editingItem.value.projectId) autoUpdateEfficiency(editingItem.value.projectId, 'project', false);
                // 如果需要支持乐器视图的自动更新，也可以加上：
                // if (editingItem.value.instrumentId) autoUpdateEfficiency(editingItem.value.instrumentId, 'instrument', false);

                pushHistory();
            };

            // 🟢 [修改] deleteEditingItem
            const deleteEditingItem = () => {
                // 1. 如果是删除日程，先取消系统通知 (保持原有逻辑)
                if (editingSource.value !== 'pool') {
                    const notifId = editingItem.value.scheduleId % 2147483647;
                    deviceService.cancelNotification(notifId);
                }

                if (editingSource.value === 'pool') {
                    // 🛡️ [新增] 检查是否为末端任务 (仅针对任务池删除)
                    if (!checkCanDeleteSplit(editingItem.value)) return;

                    // 🟢 核心修复: 在物理删除前，尝试将时间归还给父任务 (Part 1)
                    restoreSplitTime(editingItem.value);

                    // 删除任务池逻辑
                    scheduledTasks.value = scheduledTasks.value.filter(t => t.templateId !== editingItem.value.id);
                    itemPool.value = itemPool.value.filter(i => i.id !== editingItem.value.id);
                    cleanupEmptySchedules();
                } else {
                    // === 删除日程表逻辑 (保持不变) ===
                    if (editingItem.value.templateId) {
                        clearPoolRecord(editingItem.value.templateId);
                    }
                    scheduledTasks.value = scheduledTasks.value.filter(t => t.scheduleId !== editingItem.value.scheduleId);
                }

                showEditor.value = false;
                pushHistory();
            };

            const sidebarTab = ref('musician');

            // 🟢 [重写] 核心统计函数 (智能搜索优化版：修复 "Part 1" 误搜 "Part 2" 的问题)
            const calculateGroupStats = (sourceList, filterKey) => {
                const currentSessionItems = itemPool.value.filter(t =>
                    (t.sessionId || 'S_DEFAULT') === currentSessionId.value
                );

                const recordTypeMap = {
                    'musicianId': 'musician',
                    'projectId': 'project',
                    'instrumentId': 'instrument'
                };
                const currentRecordType = recordTypeMap[filterKey] || 'musician';

                // --- 1. 准备搜索条件 ---
                const rawQuery = globalSearchQuery.value.trim().toLowerCase();
                const statusDefinitions = {
                    '完成': ['completed'], 'finished': ['completed'],
                    '进行中': ['in-progress'], 'ing': ['in-progress'],
                    '缺时': ['insufficient'], 'missing': ['insufficient'],
                    '已排': ['full', 'completed'], 'full': ['full', 'completed']
                };

                const textKeywords = [];
                const statusFilters = new Set();

                if (rawQuery) {
                    // 1. 提取状态关键词
                    // 我们先用空格拆分来检查是否包含状态词 (如 "Part 1 完成")
                    const tempParts = rawQuery.split(/\s+/).filter(k => k);
                    const nonStatusParts = [];

                    tempParts.forEach(inputWord => {
                        let isStatus = false;
                        for (const [key, statuses] of Object.entries(statusDefinitions)) {
                            if (key.includes(inputWord) || inputWord.includes(key)) {
                                statuses.forEach(s => statusFilters.add(s));
                                isStatus = true;
                                break;
                            }
                        }
                        if (!isStatus) nonStatusParts.push(inputWord);
                    });

                    // 2. 生成文本关键词 (智能防拆分逻辑)
                    // 重新组合剩余的非状态词
                    const cleanQuery = nonStatusParts.join(' ');

                    if (cleanQuery) {
                        // 🟢 核心优化: 检测 "单词+空格+数字" 模式 (例如 "Part 1", "Take 2", "Violin 1")
                        // 如果符合这种模式，强制作为整体匹配，不拆分
                        const isSequencePattern = /^[a-zA-Z\u4e00-\u9fa5]+\s+\d+$/.test(cleanQuery);

                        if (isSequencePattern) {
                            textKeywords.push(cleanQuery); // 整体推入，如 ["part 1"]
                        } else {
                            // 否则正常拆分，支持 "Violin Mozart" 搜 "Mozart Violin"
                            textKeywords.push(...cleanQuery.split(/\s+/));
                        }
                    }
                }

                // 是否处于文本搜索模式
                const isSearchMode = textKeywords.length > 0;

                const stats = sourceList.map(group => {
                    // 1. 获取该组下的原始任务
                    let poolItems = currentSessionItems.filter(t => t[filterKey] === group.id);

                    // --- 过滤逻辑 ---
                    if (isSearchMode) {
                        poolItems = poolItems.filter(item => {
                            // 原代码：
                            // const fullText = getFullSearchText(item, group.name);

                            // 🟢 修改后：将当前大卡片的分组 (group.group) 也拼接到搜索文中
                            // 这样比如您在乐器视图搜 "Pluck"，属于 Pluck 分组的 "Guitar" 卡片就会被匹配到
                            const groupContext = `${group.name} ${group.group || ''}`;
                            const fullText = getFullSearchText(item, groupContext);

                            return textKeywords.every(k => smartMatch(fullText, k));
                        });
                    }

                    if (poolItems.length === 0) return null;

                    // 2. 获取该组的日程块
                    const scheduleItems = scheduledTasks.value.filter(t =>
                        t[filterKey] === group.id &&
                        (t.sessionId || 'S_DEFAULT') === currentSessionId.value
                    );
                    scheduleItems.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
                    const scheduleCount = scheduleItems.length;

                    // --- A. 计算平均倍率 (基于筛选后的条目) ---
                    let groupTotalActual = 0;
                    let groupTotalMusic = 0;

                    poolItems.forEach(item => {
                        ensureItemRecords(item);
                        const rec = item.records ? item.records[currentRecordType] : null;
                        if (rec && rec.actualDuration && item.musicDuration) {
                            const act = parseTime(rec.actualDuration);
                            const mus = parseTime(item.musicDuration);
                            if (act > 0 && mus > 0) {
                                groupTotalActual += act;
                                groupTotalMusic += mus;
                            }
                        }
                    });

                    const avgRealRatio = (groupTotalMusic > 0)
                        ? parseFloat((groupTotalActual / groupTotalMusic).toFixed(1))
                        : 0;

                    let smartBaseRatio = 20;
                    if (avgRealRatio > 0) {
                        smartBaseRatio = avgRealRatio;
                    } else if (group.defaultRatio && group.defaultRatio > 0) {
                        smartBaseRatio = parseFloat(group.defaultRatio);
                    }

                    // --- B. 计算总需时长 (应用智能倍率) ---
                    let totalSecs = 0;
                    let totalActualSec = 0;
                    let recordedCount = 0;
                    let effectiveCount = 0;

                    const displayItems = poolItems.map(rawItem => {
                        ensureItemRecords(rawItem);

                        const rec = rawItem.records ? rawItem.records[currentRecordType] : null;
                        const actualDur = (rec && rec.actualDuration) ? rec.actualDuration : null;

                        const manualRatio = rawItem.ratios ? rawItem.ratios[currentRecordType] : null;
                        const rawVal = manualRatio ? parseFloat(manualRatio) : 0;
                        let validManualRatio = null;

                        if (rawVal > 0 && rawVal !== 20 && rawVal !== smartBaseRatio) {
                            // 这里增加一个容错：如果 manualRatio 和 defaultRatio 相同，也视为自动
                            const defaultR = (group.defaultRatio && group.defaultRatio > 0) ? parseFloat(group.defaultRatio) : 20;
                            if (rawVal !== defaultR) {
                                validManualRatio = rawVal;
                            }
                        }

                        const isManual = (validManualRatio !== null);
                        const effectiveRatio = isManual ? validManualRatio : smartBaseRatio;
                        const dynEst = calculateEstTime(rawItem.musicDuration, effectiveRatio);

                        if (!rawItem.isSkipped) {
                            effectiveCount++;
                            if (actualDur) {
                                recordedCount++;
                                totalActualSec += parseTime(actualDur);
                            }
                            totalSecs += parseTime(dynEst || '00:00');
                        }

                        return {
                            ...rawItem,
                            actualDuration: actualDur,
                            ratio: effectiveRatio,
                            isManualRatio: isManual,
                            estDuration: dynEst,
                            _sortTime: (rec && rec.recStart) ? rec.recStart : '99:99'
                        };
                    });

                    // 排序
                    displayItems.sort((a, b) => {
                        if (!!a.isSkipped !== !!b.isSkipped) return a.isSkipped ? 1 : -1;
                        if (sortField.value === 'duration' || sortField.value === 'status') {
                            const actualA = parseTime(a.actualDuration || '00:00');
                            const actualB = parseTime(b.actualDuration || '00:00');
                            if (actualA !== actualB) return sortAsc.value ? (actualB - actualA) : (actualA - actualB);
                            const estA = parseTime(a.estDuration || '00:00');
                            const estB = parseTime(b.estDuration || '00:00');
                            if (estA !== estB) return sortAsc.value ? (estB - estA) : (estA - estB);
                        } else if (sortField.value === 'name') {
                            const nameA = filterKey === 'musicianId' ? getNameById(a.projectId, 'project') : getNameById(a.musicianId, 'musician');
                            const nameB = filterKey === 'musicianId' ? getNameById(b.projectId, 'project') : getNameById(b.musicianId, 'musician');

                            // 🟢 修复：启用自然排序
                            return sortAsc.value
                                ? nameA.localeCompare(nameB, 'zh-CN', { numeric: true })
                                : nameB.localeCompare(nameA, 'zh-CN', { numeric: true });
                        }
                        const secA = a.sectionIndex || 0;
                        const secB = b.sectionIndex || 0;
                        if (secA !== secB) return secA - secB;
                        return a._sortTime.localeCompare(b._sortTime);
                    });

                    // --- C. 计算已排期时长 (搜索模式: 仅累加真实录音时长) ---
                    let scheduledSecs = 0;

                    if (isSearchMode) {
                        displayItems.forEach(item => {
                            if (item.sectionIndex !== undefined && item.sectionIndex >= 0 && item.sectionIndex < scheduleItems.length) {
                                if (item.actualDuration && item.actualDuration !== '00:00') {
                                    scheduledSecs += parseTime(item.actualDuration);
                                }
                            }
                        });
                    } else {
                        // 普通模式
                        scheduleItems.forEach((block, blockIndex) => {
                            const blockTotalSecs = parseTime(block.estDuration);
                            const itemsInBlock = poolItems.filter(item => {
                                const sIdx = item.sectionIndex !== undefined ? item.sectionIndex : 0;
                                return sIdx === blockIndex;
                            });
                            const totalBreakSecs = itemsInBlock.reduce((sum, item) => {
                                const rec = item.records && item.records[currentRecordType];
                                const bMins = (rec && rec.breakMinutes) ? parseInt(rec.breakMinutes) : 0;
                                return sum + (bMins * 60);
                            }, 0);
                            let totalGapSecs = 0;
                            const recordedItems = itemsInBlock.filter(item => {
                                const r = item.records?.[currentRecordType];
                                return r && r.recStart && r.recEnd;
                            });
                            recordedItems.sort((a, b) => {
                                const tA = a.records[currentRecordType].recStart;
                                const tB = b.records[currentRecordType].recStart;
                                return tA.localeCompare(tB);
                            });
                            for(let i = 0; i < recordedItems.length - 1; i++) {
                                const curr = recordedItems[i];
                                const next = recordedItems[i+1];
                                const currRec = curr.records[currentRecordType];
                                const nextRec = next.records[currentRecordType];
                                const toMins = (t) => { const [h,m] = t.split(':').map(Number); return h*60+m; };
                                let endMins = toMins(currRec.recEnd);
                                let startMins = toMins(nextRec.recStart);
                                if (startMins >= endMins) {
                                    const gap = startMins - endMins;
                                    if (gap > 0) totalGapSecs += (gap * 60);
                                }
                            }
                            let netBlockDuration = blockTotalSecs - totalBreakSecs - totalGapSecs;
                            if (netBlockDuration < 0) netBlockDuration = 0;
                            scheduledSecs += netBlockDuration;
                        });
                    }

                    // --- D. 状态判断 ---
                    const trackCount = poolItems.length;
                    let statusKey = 'unscheduled';

                    if (trackCount > 0 && effectiveCount === 0) {
                        statusKey = 'completed';
                    }
                    else if (effectiveCount > 0 && recordedCount === effectiveCount) {
                        statusKey = 'completed';
                    }
                    else if (scheduledSecs > 0 && scheduledSecs < totalSecs) {
                        statusKey = 'insufficient';
                    }
                    else if (recordedCount > 0) {
                        statusKey = 'in-progress';
                    }
                    else if (scheduledSecs >= totalSecs && totalSecs > 0) {
                        statusKey = 'full';
                    }

                    if (statusFilters.size > 0) {
                        if (!statusFilters.has(statusKey)) return null;
                    }

                    return {
                        ...group,
                        id: group.id,
                        items: displayItems,
                        trackCount,
                        scheduleCount,
                        totalDuration: formatSecs(totalSecs),
                        totalSeconds: totalSecs,
                        scheduledSeconds: scheduledSecs,
                        completedSeconds: totalActualSec,
                        statusKey,
                        avgRealRatio,
                        recordedCount,
                        isFullyScheduled: (statusKey === 'full' || statusKey === 'completed')
                    };
                }).filter(Boolean);

                return stats.sort((a, b) => {
                    if (sortField.value === 'name') {
                        // 🟢 修复: 启用自然排序
                        return sortAsc.value
                            ? a.name.localeCompare(b.name, 'zh-CN', { numeric: true })
                            : b.name.localeCompare(a.name, 'zh-CN', { numeric: true });
                    }
                    if (sortField.value === 'status') {
                        const statusWeight = { 'completed': 0, 'in-progress': 1, 'insufficient': 2, 'full': 3, 'unscheduled': 4 };
                        const wA = statusWeight[a.statusKey] ?? 99;
                        const wB = statusWeight[b.statusKey] ?? 99;
                        if (wA !== wB) return sortAsc.value ? (wA - wB) : (wB - wA);
                        return a.name.localeCompare(b.name, 'zh-CN');
                    }
                    const valA = a.totalSeconds;
                    const valB = b.totalSeconds;
                    if (valA < valB) return sortAsc.value ? -1 : 1;
                    if (valA > valB) return sortAsc.value ? 1 : -1;
                    return 0;
                });
            };

            // 3. 三个维度的计算属性
            // 仍然保留 musicianStats 这个名字，以兼容你代码中可能引用它的地方
            const musicianStats = computed(() => calculateGroupStats(settings.musicians, 'musicianId'));
            const projectStats = computed(() => calculateGroupStats(settings.projects, 'projectId'));
            const instrumentStats = computed(() => calculateGroupStats(settings.instruments, 'instrumentId'));

            // 🟢 新增: 统计当前 Session 下的活跃任务总数
            const activeTaskCount = computed(() => {
                return itemPool.value.filter(t => (t.sessionId || 'S_DEFAULT') === currentSessionId.value).length;
            });

            // 4. 当前侧边栏显示的数据源
            const currentSidebarList = computed(() => {
                if (sidebarTab.value === 'project') return projectStats.value;
                if (sidebarTab.value === 'instrument') return instrumentStats.value;
                return musicianStats.value;
            });

            // V10.0 新增：计算演奏员统计数据
            // --- V10.4 新增：统计卡片展开状态 ---
            const expandedStatsIds = reactive(new Set());

            const toggleStatCollapse = (id) => {
                if (expandedStatsIds.has(id)) {
                    expandedStatsIds.delete(id);
                } else {
                    expandedStatsIds.add(id);
                }
            };

            // 🟢 新增: 计算当前弹窗内日程块的实时比率
            const getSessionRatio = () => {
                const actual = trackListData.value.actualDuration;
                const items = trackListData.value.items;

                if (!actual || !items || items.length === 0) return '-';

                const actualSec = parseTime(actual);
                if (actualSec === 0) return '-';

                // 计算该块内所有曲目的谱面总长
                const totalMusicSec = items.reduce((sum, item) => sum + parseTime(item.musicDuration), 0);

                if (totalMusicSec === 0) return '-';

                return (actualSec / totalMusicSec).toFixed(1);
            };

            // 🟢 新增: 将真实比值应用为默认比值
            // 🟢 修复: 更新倍率并重算所有任务时长
            // 🟢 修改: 移除确认弹窗，直接更新全局倍率
            // 🟢 修复: 更新效率 (修复日程块缩为0的Bug)
            const updateMusicianRatio = (stat) => {
                if (!stat.avgRealRatio || stat.avgRealRatio <= 0) return;

                const newRatio = parseFloat(stat.avgRealRatio);

                // 1. 更新演奏员的全局默认设置
                const mus = settings.musicians.find(m => m.id === stat.id);
                if (mus) {
                    mus.defaultRatio = newRatio;
                }

                // 2. 更新【任务池】里该演奏员的所有任务
                // 任务池里的都是模板，肯定有 musicDuration，所以必须更新 estDuration 以便下次拖拽
                itemPool.value.forEach(item => {
                    if (item.musicianId === stat.id) {
                        item.ratio = newRatio;
                        if (item.musicDuration) {
                            item.estDuration = calculateEstTime(item.musicDuration, newRatio);
                        }
                    }
                });

                // 3. 更新【日程表】里该演奏员的所有任务
                scheduledTasks.value.forEach(task => {
                    if (task.musicianId === stat.id) {
                        task.ratio = newRatio;

                        // 🟢 关键修复: 只有当任务拥有“谱面时长”时，才根据新倍率重算时长
                        // 如果是纯时间占位块(没有musicDuration)，则保持原有排期时间不变
                        if (task.musicDuration) {
                            task.estDuration = calculateEstTime(task.musicDuration, newRatio);
                        }
                    }
                });

                pushHistory();
            };

            const musicianScheduledStats = computed(() => {
                const map = {};

                for (const mus of settings.musicians) {
                    map[mus.id] = {
                        id: mus.id,
                        name: mus.name,
                        color: mus.color,
                        scheduledSeconds: 0
                    };
                }

                for (const task of scheduledTasks.value) {
                    const sec = parseTime(task.estDuration);
                    if (map[task.musicianId]) {
                        map[task.musicianId].scheduledSeconds += sec;
                    }
                }

                // 格式化
                return Object.values(map).map(m => ({
                    ...m,
                    scheduledFormatted: formatSecs(m.scheduledSeconds)
                }));
            });

            // 🟢 修复: 跳转回今天 (修复动画方向)
            const jumpToToday = () => {
                const now = new Date();

                // 🟢 关键修复: 判断今天是在当前视图的"左边"还是"右边"
                if (now.getTime() > viewDate.value.getTime()) {
                    dateTransitionName.value = 'slide-next'; // 今天在未来 -> 左滑
                } else if (now.getTime() < viewDate.value.getTime()) {
                    dateTransitionName.value = 'slide-prev'; // 今天在过去 -> 右滑
                }

                // 1. 重置日期
                viewDate.value = now;

                // 2. 只有在周视图才需要滚动定位
                if (currentView.value === 'week') {
                    setTimeout(() => {
                        if (weekContainer.value) {
                            // --- A. 计算垂直位置 (定位到当前时间) ---
                            const currentMins = now.getHours() * 60 + now.getMinutes();
                            const startMins = settings.startHour * 60;
                            // 垂直目标位置 (像素)
                            const targetTop = (currentMins - startMins) * pxPerMin.value;
                            // 垂直居中修正
                            const screenHeight = weekContainer.value.clientHeight;
                            const scrollTop = Math.max(0, targetTop - (screenHeight / 2));

                            // --- B. 计算水平位置 (定位到今天这一列) ---
                            const dayIndex = now.getDay();
                            const timeColWidth = window.innerWidth < 800 ? 40 : 70;
                            const dayColWidth = 100; // 这里的宽度估算可能需要根据实际 dayColWidth.value 调整，但通常够用
                            const targetCenterX = timeColWidth + (dayIndex * dayColWidth) + (dayColWidth / 2);
                            const containerWidth = weekContainer.value.clientWidth;
                            const scrollLeft = Math.max(0, targetCenterX - (containerWidth / 2));

                            // --- C. 执行双向滚动 ---
                            weekContainer.value.scrollTo({
                                top: scrollTop,
                                left: scrollLeft,
                                behavior: 'smooth'
                            });
                        }
                    }, 100);
                }
            };

            const handlePageUnload = () => {
                if (saveStatus.value === 'unsaved') {
                    // 尝试发送最后的数据 (利用 Beacon API 或同步请求，但最简单的是由浏览器尽力发送)
                    saveToCloud(true);
                }
            };

            // 🟢 新增: 专门用于点击颜色条跳转日程的函数
            const jumpToStatSchedule = (stat) => {
                if (isMobile.value) window.triggerTouchHaptic('Medium');

                // 1. 查找相关任务 (根据当前 Tab 类型筛选)
                let relatedTasks = [];
                if (sidebarTab.value === 'project') {
                    relatedTasks = scheduledTasks.value.filter(t => t.projectId === stat.id);
                } else if (sidebarTab.value === 'instrument') {
                    relatedTasks = scheduledTasks.value.filter(t => t.instrumentId === stat.id);
                } else {
                    relatedTasks = scheduledTasks.value.filter(t => t.musicianId === stat.id);
                }

                // 2. 过滤掉非当前 Session 的任务
                relatedTasks = relatedTasks.filter(t => (t.sessionId || 'S_DEFAULT') === currentSessionId.value);

                // 如果没有已排期的任务，无法跳转
                if (relatedTasks.length === 0) {
                    openAlertModal("未排期", "该条目下暂时没有已安排的日程。");
                    return;
                }

                // 3. 排序 (按时间顺序，确保跳转逻辑符合直觉)
                relatedTasks.sort((a, b) => {
                    const dateA = new Date(a.date + 'T' + a.startTime);
                    const dateB = new Date(b.date + 'T' + b.startTime);
                    return dateA - dateB;
                });

                // 4. 循环获取目标任务
                let currentIndex = statClickIndexMap[stat.id] || 0;
                if (currentIndex >= relatedTasks.length) currentIndex = 0;

                const targetTask = relatedTasks[currentIndex];

                // 更新下一次点击的索引 (+1)
                statClickIndexMap[stat.id] = (currentIndex + 1) % relatedTasks.length;

                // 5. 执行跳转
                smartScrollToTask(targetTask);
            };

            // 🟢 修复后的 handleStatCardClick (仅在展开时跳转)
            const handleStatCardClick = (stat) => {
                if (isMobile.value) window.triggerTouchHaptic('Medium');

                // 1. 切换展开/折叠状态
                toggleStatCollapse(stat.id);

                // 🛑 核心修改: 检查状态，如果是"收起"操作，直接结束，不跳转
                /*if (!expandedStatsIds.has(stat.id)) {
                    return;
                }

                // --- 以下是展开后的跳转逻辑 ---

                // 2. 查找相关任务
                let relatedTasks = [];
                if (sidebarTab.value === 'project') {
                    relatedTasks = scheduledTasks.value.filter(t => t.projectId === stat.id);
                } else if (sidebarTab.value === 'instrument') {
                    relatedTasks = scheduledTasks.value.filter(t => t.instrumentId === stat.id);
                } else {
                    relatedTasks = scheduledTasks.value.filter(t => t.musicianId === stat.id);
                }

                // 过滤掉非当前 Session 的任务
                relatedTasks = relatedTasks.filter(t => (t.sessionId || 'S_DEFAULT') === currentSessionId.value);

                // 如果该卡片下没有已排期的任务，只展开列表，不跳转
                if (relatedTasks.length === 0) return;

                // 排序 (按日期和时间)
                relatedTasks.sort((a, b) => {
                    const dateA = new Date(a.date + 'T' + a.startTime);
                    const dateB = new Date(b.date + 'T' + b.startTime);
                    return dateA - dateB;
                });

                // 3. 获取目标任务 (循环点击逻辑)
                let currentIndex = statClickIndexMap[stat.id] || 0;
                if (currentIndex >= relatedTasks.length) currentIndex = 0;

                const targetTask = relatedTasks[currentIndex];

                // 更新下一次点击的索引
                statClickIndexMap[stat.id] = (currentIndex + 1) % relatedTasks.length;

                // 4. 执行跳转 (调用上一轮封装好的通用函数)
                smartScrollToTask(targetTask);*/
            };


            // 🟢 修改: 清空列表 (级联删除任务，增加确认弹窗)
            const clearAllInstruments = () => {
                if (settings.instruments.length === 0) return;

                openConfirmModal(
                    '清空乐器库',
                    '确定要清空所有乐器吗？\n⚠ 警告：所有关联的任务（任务池及日程）都将被永久删除！',
                    () => {
                        // 1. 获取要删除的ID集合
                        const idsToDelete = new Set(settings.instruments.map(i => i.id));

                        // 2. 清空设置
                        settings.instruments = [];

                        // 3. 级联删除: 任务池
                        itemPool.value = itemPool.value.filter(item => !idsToDelete.has(item.instrumentId));

                        // 4. 级联删除: 日程表
                        scheduledTasks.value = scheduledTasks.value.filter(task => !idsToDelete.has(task.instrumentId));

                        // 5. 清理空日程块
                        cleanupEmptySchedules();

                        pushHistory();
                        window.triggerTouchHaptic('Medium');
                    },
                    true // 红色危险按钮
                );
            };

            const clearAllMusicians = () => {
                if (settings.musicians.length === 0) return;

                openConfirmModal(
                    '清空人员库',
                    '确定要清空所有演奏员吗？\n⚠ 警告：所有关联的任务（任务池及日程）都将被永久删除！',
                    () => {
                        const idsToDelete = new Set(settings.musicians.map(m => m.id));

                        settings.musicians = [];
                        itemPool.value = itemPool.value.filter(item => !idsToDelete.has(item.musicianId));
                        scheduledTasks.value = scheduledTasks.value.filter(task => !idsToDelete.has(task.musicianId));

                        cleanupEmptySchedules();

                        pushHistory();
                        window.triggerTouchHaptic('Medium');
                    },
                    true
                );
            };

            const clearAllProjects = () => {
                if (settings.projects.length === 0) return;

                openConfirmModal(
                    '清空项目库',
                    '确定要清空所有项目吗？\n⚠ 警告：所有关联的任务（任务池及日程）都将被永久删除！',
                    () => {
                        const idsToDelete = new Set(settings.projects.map(p => p.id));

                        settings.projects = [];
                        itemPool.value = itemPool.value.filter(item => !idsToDelete.has(item.projectId));
                        scheduledTasks.value = scheduledTasks.value.filter(task => !idsToDelete.has(task.projectId));

                        cleanupEmptySchedules();

                        pushHistory();
                        window.triggerTouchHaptic('Medium');
                    },
                    true
                );
            };


            // --- 🟢 手机端适配逻辑 ---
            // --- 🟢 手机端适配 & 布局自动修复 ---
            const isMobile = ref(window.innerWidth < 800);
            const isContextSwitching = ref(false); // 🟢 [新增] 上下文切换锁
            const mobileTab = ref('schedule');

            // 🟢 优化: 增强版布局刷新函数
            const refreshLayout = () => {
                const w = window.innerWidth;

                // 1. 获取用户代理字符串 (判断是否为 Android/iPhone 等)
                const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                // 2. 判断是否支持粗略指针 (通常指触摸屏) - 这是一个更现代的 CSS/JS 媒体特性检测
                const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

                // 3. 综合判断:
                // 只有当 [宽度小于 800] 且 ([是移动端UA] 或 [是触摸设备]) 时，才判定为移动端。
                // 这样电脑浏览器缩窄时，因为不满足后两个条件，依然会保持电脑端视图。
                isMobile.value = w < 800 && (isMobileUA || isCoarsePointer);

                // 2. 重新计算视口高度 (解决地址栏遮挡)
                let vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);

                // 3. 🟢 新增: 电脑端响应式保护逻辑
                // 当屏幕宽度小于 1100px (接近 iPad 横屏尺寸) 时，自动收起侧边栏，防止顶部日期文字被挤压换行
                if (!isMobile.value && w < 1100) {
                    if (isSidebarOpen.value) {
                        isSidebarOpen.value = false;
                    }
                } else if (!isMobile.value && w >= 1100) {
                    // 可选: 宽度足够大时，如果您希望自动展开，可以取消下面这行的注释
                    isSidebarOpen.value = true;
                }

                // 4. 强制重绘 (保持原有逻辑)
                if (isMobile.value) {
                    document.body.style.display = 'none';
                    document.body.offsetHeight;
                    document.body.style.display = '';
                }
            };

            onMounted(() => {
                // 初始化执行
                refreshLayout();

                // 🟢 1. 初始化应用主题
                applyTheme();

                // 🟢 2. 监听系统颜色变化 (实现"跟随系统"的实时切换)
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                    // 只有当当前模式是 'auto' 时，才响应系统的变化
                    if (themeMode.value === 'auto') {
                        applyTheme();
                    }
                });

                // 监听窗口大小改变 (旋转屏幕等)
                window.addEventListener('resize', refreshLayout);

                // 🟢 关键: 监听网页“显示/隐藏” (切后台回来)
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') {
                        refreshLayout();
                        // 延迟 200ms 再执行一次，确保浏览器 UI 动画已结束
                        setTimeout(refreshLayout, 200);
                    }
                });

                // 🟢 关键: 监听 Safari 的页面缓存恢复 (BFCache)
                window.addEventListener('pageshow', (e) => {
                    if (e.persisted) {
                        refreshLayout();
                    }
                });
                // 检查 LocalStorage
                const hasSeenTour = storageService.getItem('musche_tour_seen');
                if (!hasSeenTour) {
                    // 稍微延迟，等页面加载完、数据渲染完再显示
                    setTimeout(() => {
                        startTour();
                        storageService.setItem('musche_tour_seen', 'true');
                    }, 1500);
                }
                window.addEventListener('beforeunload', handlePageUnload);
            });

            onUnmounted(() => {
                window.removeEventListener('resize', refreshLayout);
                window.removeEventListener('beforeunload', handlePageUnload);
                // 这里省略了 remove 其他监听，因为这是根组件，销毁即刷新，通常不需要清理
            });


            return {
                sidebarTab,
                showMetadataManager,
                activeTaskCount,
                isResourceCompleted,
                musicianStats,
                projectStats,
                instrumentStats,
                itemPool,
                scheduledTasks,
                settings,
                currentView,
                currentDateLabel,
                currentWeekDays,
                currentMonthDays,
                timeSlots,
                selectedTaskId,
                showSettings,
                showEditor,
                editingItem,
                editingSource,
                newItem,
                weekContainer,
                dragStart,
                dragEnterPool,
                dragLeavePool,
                dropToPool,
                dragEnterSlot,
                dragLeaveSlot,
                dropToSchedule,
                dropToMonth,
                handleDragEnd,
                initResize,
                selectTask,
                clearSelection,
                onMusicianSelect,
                addItemToPool,
                changeDate,
                isToday,
                getTasksForDate,
                getTaskStyle,
                switchToWeek,
                calculateEstTime,
                openEditModal,
                saveEdit,
                deleteEditingItem,
                handleTaskDblClick,
                handleGlobalKey,
                undo,
                redo,
                historyIndex,
                history,
                pushHistory,
                exportToICS,
                currentSidebarList,
                handleRecRename,
                sortKey,
                expandedGroups,
                toggleCollapse,
                cleanupEmptySchedules,
                sortField,
                sortAsc,
                toggleSort,
                getSortIcon,
                calculateGroupStats,
                expandedStatsIds,
                toggleStatCollapse,
                resetAutoHide,
                showTrackList,
                trackListData,
                slotHeight,
                getNameById,
                generateUniqueId,
                getOverlapCount,
                jumpToGhostContext,
                activeColorKey,
                getGroupColor,
                getTextColor,

                exportJSON,
                importJSON,
                handleJSONFile,

                selectedPoolIds,
                lastPoolClickId,
                sidebarWidth,

                handlePoolItemClick,
                isScheduled,
                clearAllInstruments,
                clearAllMusicians,
                clearAllProjects,

                flashingTaskId,
                handleStatCardClick,
                isSidebarOpen,

                activeDropdown,
                dropdownSearch,
                toggleDropdown,
                selectOption,
                filteredOptions,
                getOrCreateSettingItem,

                user,
                showAuthModal,
                authForm,
                authLoading,
                handleLogin,
                handleRegister,
                handleResetPwd,
                handleLogout,

                showProfileMenu,
                tempAvatarUrl,
                userAvatar,
                handleUserBtnClick,
                updateAvatar,

                currentSessionId,
                currentSessionName,
                switchSession,
                handleSessionAction,
                tempNickname,
                userDisplayName,
                updateNickname,
                ensureItemRecords,

                handleCSVImport,
                handleAvatarUpload,
                authPasswordRef,
                addProject,
                deleteCurrentSchedule,
                clearTrackTime,
                isTaskGhost,
                deleteProject,
                deleteTrackFromList,
                getGroupedOptions,
                isSyncing,
                handleManualSync,
                viewTransitionName,
                switchView,
                onMainTouchStart,
                onMainTouchEnd,

                isMobile,
                mobileTab,
                showMobileMenu,
                isDark,
                toggleTheme,
                themeMode,
                applyTheme,
                getThemeLabel,
                showMobileTaskInput,
                calculateSingleRatio,
                updateMusicianRatio,
                getSessionRatio,
                autoCalcDuration,
                saveScheduleActualTime,
                saveTrackActual,
                setTrackNow,
                calcTrackDiff,
                autoUpdateEfficiency,
                toggleMobileMenu,
                closeDropdowns,
                calculateProportionalDuration,
                getDefaultRatio,
                onDragStart,
                showInputModal,
                inputModalConfig,
                openInputModal,
                closeInputModal,
                confirmInputModal,
                universalInputRef,
                showConfirmModal,
                confirmModalConfig,
                openAlertModal,
                openConfirmModal,
                closeConfirmModal,
                handleConfirmAction,
                showImportModal,
                triggerFileSelect,
                showOrchestrationField,
                showCropModal,
                cropImgSrc,
                cropImgRef,
                checkOverlap,
                autoResizeScheduleByRecords,
                onFileSelect,
                cancelCrop,
                confirmCrop,
                smartScrollToTask,
                currentQuickAddGroups,
                activeGroupFilter,
                availableGroups,
                factoryReset,
                jumpToToday,
                tasksByDateMap,
                showQuickAddModal,
                quickAddForm,
                openQuickAdd,
                confirmQuickAdd,
                draggingTaskElement,
                scheduleReminder,
                onTrackListReminderChange,
                initialTouchCoords,
                dayColWidth,
                widthIcon,
                cycleDayWidth,
                settingsExpandedGroups,
                toggleSettingsGroup,
                dropdownExpandedGroups,
                toggleDropdownGroup,
                showGroupSuggestions,
                settingsGroupFocus,
                dragElClone,
                dragSourceType,
                showDurationPicker,
                tempDuration,
                pickerMinRef,
                pickerPos,
                closePicker,
                resetDuration,
                formatDate,
                viewDate,
                isDefaultRatio,
                isResizingMobile,
                mobileResizeState,
                initMobileResize,
                handleMobileResizeMove,
                handleMobileResizeEnd,
                pickerSecRef,
                openDurationPicker,
                onScroll,
                confirmDurationPicker,
                formatSecs,
                handleTouchStart,
                handleTouchMove,
                handleTouchEnd,
                handlePoolTouchStart,
                sortedInstruments,
                sortedMusicians,
                sortedProjects,
                removeInstrument,
                removeMusician,
                startAutoScroll,
                stopAutoScroll,
                updateAutoScrollDirection,
                setTrackBreak,
                sortTrackList,
                moveDivider,
                autoSortTrackList,
                trackListContainerRef,
                startDividerDrag,
                draggingSectionIndex,
                onDividerDragMove,
                onDividerDragEnd,
                getBlockTitle,
                dateTransitionName,
                jumpToStatSchedule,
                getSettingsGroupedList,
                allSettingsGrouped,
                renameGroup,
                addSettingsItem,
                removeSettingsItem,
                newSettingsItem,
                getExistingGroups,
                clearSettingsList,
                onSettingsItemDragStart,
                onSettingsDragOver,
                onSettingsDragLeave,
                onSettingsDrop,
                onSidebarTouchStart,
                onSidebarTouchEnd,
                sidebarTransitionName,
                sidebarScrollRef,
                switchSidebarTab,
                isAllGroupsExpanded,
                toggleAllGroups,
                showColorPickerModal,
                presetColors,
                tempColor,
                openColorPicker,
                resetColorPicker,
                saveColorPicker,
                settingsNameFocus,
                getUngroupedItems,
                inputRects,
                updateInputRect,
                getFloatingStyle,
                onSettingsScroll,
                splitTrack,
                restoreSplitTime,
                showSplitModal,
                splitState,
                smartMatch,
                getFullSearchText,
                openSplitSlider,
                onSplitSliderInput,
                confirmSplitSlider,
                startTour,
                toggleSidebar,
                desktopSteps,
                mobileSteps,
                onSettingsItemDragEnd,
                disableRowDrag,
                enableRowDrag,
                saveStatus,
                handlePageUnload,
                isContextSwitching,
                getTaskRatio,
                cleanOldRatios,
                clearPoolRecord,
                clearAggregateRecords,
                onMainMouseDown,
                onMainMouseUp,
                isMouseViewDrag,
                onMainWheel,
                showRecInfoModal,
                recInfoForm,
                openRecInfoModal,
                saveRecInfo,
                activeRecDropdown,
                recDropdownSearch,
                filteredRecOptions,
                selectRecOption,
                createRecOption,
                newRecInputs,
                addRecItem,
                removeRecItem,
                globalSearchQuery,
                handleSearchEnter,
                filteredSidebarList,
                handleItemRename,
                hasRecordingInfo,
                autoDistributeSections,
                startTrackDrag,
                isSearchFocused,
                handleSearchBlur,
                onSearchFocus,
                triggerTouchHaptic: window.triggerTouchHaptic,
                orchTemplates,
                parsedRoster,
                getRosterName,
                updateRosterName,
                percKeywords,
                percState,
                isPercussionMode,
                scanPercussionTags,
                addPercPlayer,
                removePercPlayer,
                togglePercTagSelect,
                assignTagsToPlayer,
                updatePercOrchestration,
                getOrchSize,
                isOrchestraGroup,
                isPercussionGroup,
                isStringGroup,
                activeOrchPresets,
                getNameWithGroup,
                getFamilyTotalDuration,
                syncFamilyOrchestration,
                triggerCSV,
                showCreditModal,
                generatedCreditText,
                openCreditModal,
                copyCreditText,
                monthViewMode, // 新增
                flatScrolledDays, // 新增
                generateMonthGrid, // 新增
                setMonthRef,
                scrollToMonthDate,
                handleInfiniteScroll,
                handleHeaderDoubleTap,      // <--- 新增导出
                handleMonthCellDoubleTap,
                triggerMidiImport, // 🟢 新增
                openMidiManager,
                showMidiManager,
                managingProject,
                projectMidiList,
                updateMidiDuration,
                removeMidiMapping,
                clearProjectMidi,
                triggerMidiImportForProject,
                showMidiImportModal,
                midiImportData,
                midiBpm,
                handleMidiFile,
                confirmMidiImport,
                calculateAccurateDuration,
                convertTicksToSeconds,
                calculateQuantizedDuration,
                isOverlapping,
                calculateEffectiveDuration,
                processMidiFile,
                onImportInstChange,
                availableInstrumentGroups,
                activeImportMenu,
                importMenuPos,
                importSearchQuery,
                openImportMenu,
                closeImportMenu,
                selectImportInst,
                selectImportNewInst,
                selectImportGroup,
                filteredImportOptions,
                midiGroupSearchQuery,
                filteredMidiGroups,
                updateInstrumentGroup,
                selectMidiGroup,
                activeMidiGroupRow,
                midiGroupPos,
                openMidiGroupDropdown,
                midiTimeSig,
                findGroupFromLibrary,
                cleanMidiTrackName,
                sortedLibrary,
                normalizeForMatch,
                findGroupSmart,
                instrumentLibrary,
                midiGroupData,
                midiViewMode,
                currentMidiDisplayList,
                midiGroupExpanded,
                toggleMidiGroupExpand,
                toggleGroupSelection,
                projectMidiGroups,
                midiManagerExpandedGroups,
                toggleMidiManagerGroup,
                autoFillMidiDuration,
                getSmartName,
                trackListSearchQuery,
                handleTrackListSearchAction,
                showCsvImportModal,
                csvImportData,
                csvImportConfig,
                toggleCsvSelection, // 🟢 新增
                handleCSVImport,     // 🟢 新增
                confirmCsvImport,
                getOrchString,
                addDataToPrepared,
                refreshCsvPreview,
                findSettingId,
                normalizeDate,
                refreshCsvStatus,
                toggleAllRows,
                calculateRowStatusText,
                showProjectInfoModal,
                projectInfoForm,
                openProjectInfoModal,
                saveProjectInfo,
                groupedCsvData,       // 🟢 新增
                collapsedProjects,    // 🟢 新增
                toggleProjectCollapse,
                activeImportTab,
                isAllSelected,
                isGroupSelected,
                csvSearchQuery,
                extractTime

            };
        }
    }).mount('#app');
