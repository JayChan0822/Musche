import { computed, reactive, ref } from 'vue';

export function createMuscheStore(storageService) {
  const getItem = typeof storageService?.getItem === 'function'
    ? storageService.getItem.bind(storageService)
    : () => null;

  const itemPool = ref([]);
  const scheduledTasks = ref([]);
  const slotHeight = ref(window.innerWidth < 800 ? 30 : 40);
  const pxPerMin = computed(() => slotHeight.value / 30);
  const currentView = ref('month');
  const monthViewMode = ref('scrolled');
  const viewDate = ref(new Date());
  const selectedTaskId = ref(null);
  const selectedSource = ref(null);
  const selectedPoolIds = ref(new Set());
  const savedSidebarWidth = getItem('musche_sidebar_width');
  const sidebarWidth = ref(savedSidebarWidth ? Number(savedSidebarWidth) : 350);
  const lastPoolClickId = ref(null);
  const lastPoolFocusId = ref(null);
  const showSettings = ref(false);
  const showProjectInfoModal = ref(false);
  const showMetadataManager = ref(false);
  const showEditor = ref(false);
  const showTrackList = ref(false);
  const trackListData = ref({ name: '', items: [] });
  const editingItem = ref({});
  const editingSource = ref('');
  const weekContainer = ref(null);
  const flashingTaskId = ref(null);
  const statClickIndexMap = reactive({});
  const showProfileMenu = ref(false);
  const tempAvatarUrl = ref('');
  const initialTouchY = ref(0);
  const showDurationPicker = ref(false);
  const tempDuration = reactive({ m: 0, s: 0 });
  const pickerMinRef = ref(null);
  const pickerSecRef = ref(null);
  const pickerPos = reactive({ top: 0, left: 0 });
  const showMobileTaskInput = ref(false);
  const trackListContainerRef = ref(null);
  const draggingSectionIndex = ref(null);
  const savedWidth = getItem('musche_day_width');
  const dayColWidth = ref(savedWidth ? Number(savedWidth) : 52);
  const isResizingMobile = ref(false);
  const mobileResizeState = reactive({ task: null, startY: 0, startHeight: 0 });
  const saveStatus = ref('saved');
  const globalSearchQuery = ref('');
  const lastTapState = reactive({ id: null, time: 0 });
  const currentSearchIndex = ref(0);
  const resizing = ref(null);
  const isSearchFocused = ref(false);
  const localDataVersion = ref(0);
  const isBootstrappingData = ref(false);
  const showSplitModal = ref(false);
  const csvImportMode = ref('tasks');
  const showCreditModal = ref(false);
  const generatedCreditText = ref('');
  const visibleTopDate = ref(new Date());
  const monthObserver = ref(null);
  const monthRefs = ref([]);
  const showMidiManager = ref(false);
  const managingProject = ref(null);
  const showMidiImportModal = ref(false);
  const showCsvImportModal = ref(false);
  const csvImportData = ref([]);
  const csvColumnMap = reactive({});
  const csvImportConfig = reactive({
    importTypes: {
      tasks: true,
      time: true,
      orch: true,
    },
    nameStrategy: 'merge',
    showSkipRows: true,
  });
  const midiImportData = ref([]);
  const midiBpm = ref(120);
  const midiTempoMap = ref(null);
  const midiTimeSigs = ref(null);
  const midiViewMode = ref('tracks');
  const midiTimeSig = ref([4, 4]);
  const activeMidiGroupRow = ref(null);
  const midiGroupPos = reactive({ top: 0, left: 0, width: 0 });
  const activeImportMenu = reactive({ rowId: null, type: null });
  const importMenuPos = reactive({ top: 0, left: 0, width: 0 });
  const importSearchQuery = ref('');
  const midiGroupSearchQuery = ref('');
  const trackListSearchQuery = ref('');
  const trackSearchIndex = ref(-1);
  const lastTrackSearchQuery = ref('');
  const lastHighlightedTrackId = ref(null);
  const searchHighlightTimer = ref(null);
  const rawCsvRows = ref([]);
  const csvHeadersMap = ref({});
  const collapsedProjects = reactive(new Set());
  const activeImportTab = ref('rec');
  const csvSearchQuery = ref('');
  const currentSessionId = ref('');
  const activeDropdown = ref(null);
  const showMobileMenu = ref(false);
  const tempNickname = ref('');
  const settingsExpandedGroups = reactive(new Set());
  const newSettingsItem = reactive({
    instrument: { name: '', group: '' },
    musician: { name: '', group: '' },
    project: { name: '', group: '' },
  });
  const user = ref(null);
  const showAuthModal = ref(false);
  const authLoading = ref(false);
  const authForm = reactive({ email: '', password: '' });
  const authPasswordRef = ref(null);
  const history = ref([]);
  const historyIndex = ref(-1);
  const showConfirmModal = ref(false);
  const confirmModalConfig = reactive({
    title: '',
    content: '',
    confirmText: '确定',
    cancelText: '取消',
    isAlert: false,
    isDestructive: false,
    onConfirm: null,
    onCancel: null,
  });
  const showInputModal = ref(false);
  const universalInputRef = ref(null);
  const inputModalConfig = reactive({
    title: '',
    value: '',
    placeholder: '',
    hint: '',
    callback: null,
  });
  const showQuickAddModal = ref(false);
  const quickAddType = ref('');
  const quickAddForm = reactive({ name: '', group: '', defaultRatio: 20 });
  const showCropModal = ref(false);
  const cropImgSrc = ref('');
  const cropImgRef = ref(null);
  const showGroupSuggestions = ref(false);
  const settingsGroupFocus = ref(null);
  const sortKey = ref('projectId');
  const activeColorKey = ref('projectId');
  const expandedGroups = reactive(new Set());
  const themeMode = ref(getItem('theme_mode') || 'auto');
  const isDark = ref(document.documentElement.classList.contains('dark'));

  return {
    itemPool,
    scheduledTasks,
    slotHeight,
    pxPerMin,
    currentView,
    monthViewMode,
    viewDate,
    selectedTaskId,
    selectedSource,
    selectedPoolIds,
    sidebarWidth,
    lastPoolClickId,
    lastPoolFocusId,
    showSettings,
    showProjectInfoModal,
    showMetadataManager,
    showEditor,
    showTrackList,
    trackListData,
    editingItem,
    editingSource,
    weekContainer,
    flashingTaskId,
    statClickIndexMap,
    showProfileMenu,
    tempAvatarUrl,
    initialTouchY,
    showDurationPicker,
    tempDuration,
    pickerMinRef,
    pickerSecRef,
    pickerPos,
    showMobileTaskInput,
    trackListContainerRef,
    draggingSectionIndex,
    dayColWidth,
    isResizingMobile,
    mobileResizeState,
    saveStatus,
    globalSearchQuery,
    lastTapState,
    currentSearchIndex,
    resizing,
    isSearchFocused,
    localDataVersion,
    isBootstrappingData,
    showSplitModal,
    csvImportMode,
    showCreditModal,
    generatedCreditText,
    visibleTopDate,
    monthObserver,
    monthRefs,
    showMidiManager,
    managingProject,
    showMidiImportModal,
    showCsvImportModal,
    csvImportData,
    csvColumnMap,
    csvImportConfig,
    midiImportData,
    midiBpm,
    midiTempoMap,
    midiTimeSigs,
    midiViewMode,
    midiTimeSig,
    activeMidiGroupRow,
    midiGroupPos,
    activeImportMenu,
    importMenuPos,
    importSearchQuery,
    midiGroupSearchQuery,
    trackListSearchQuery,
    trackSearchIndex,
    lastTrackSearchQuery,
    lastHighlightedTrackId,
    searchHighlightTimer,
    rawCsvRows,
    csvHeadersMap,
    collapsedProjects,
    activeImportTab,
    csvSearchQuery,
    currentSessionId,
    activeDropdown,
    showMobileMenu,
    tempNickname,
    settingsExpandedGroups,
    newSettingsItem,
    user,
    showAuthModal,
    authLoading,
    authForm,
    authPasswordRef,
    history,
    historyIndex,
    showConfirmModal,
    confirmModalConfig,
    showInputModal,
    universalInputRef,
    inputModalConfig,
    showQuickAddModal,
    quickAddType,
    quickAddForm,
    showCropModal,
    cropImgSrc,
    cropImgRef,
    showGroupSuggestions,
    settingsGroupFocus,
    sortKey,
    activeColorKey,
    expandedGroups,
    themeMode,
    isDark,
  };
}
