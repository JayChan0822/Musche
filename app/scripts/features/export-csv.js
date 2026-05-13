import { computed, reactive, ref } from 'vue';

export function registerExportCsvFeature(context) {
  const { refs, state, utils, actions } = context;
  const { itemPool, scheduledTasks, currentSessionId } = refs;
  const { settings } = state;
  const { parseTime, getNameById } = utils;
  const { openAlertModal, openInputModal } = actions;

  /* ── modal state ── */
  const showExportModal = ref(false);
  const exportFilter = reactive({
    sessions: new Set(),
    projects: new Set(),
    musicians: new Set(),
    instruments: new Set(),
    types: new Set(['REC', 'EDT']),
    dateFrom: '',
    dateTo: '',
    searchProject: '',
    searchMusician: '',
    searchInstrument: '',
  });

  /* ── available options (only recompute from settings/tasks) ── */
  const exportSessionOptions = computed(() => {
    const ids = new Set();
    scheduledTasks.value.forEach((t) => ids.add(t.sessionId || 'S_DEFAULT'));
    return [...ids].map((id) => ({
      id,
      name: settings.sessions?.find((s) => s.id === id)?.name || (id === 'S_DEFAULT' ? '默认' : id),
    }));
  });

  const exportProjectOptions = computed(() => {
    const ids = new Set();
    scheduledTasks.value.forEach((t) => { if (t.projectId) ids.add(t.projectId); });
    itemPool.value.forEach((i) => { if (i.projectId) ids.add(i.projectId); });
    return [...ids]
      .map((id) => ({ id, name: getNameById(id, 'project') }))
      .filter((o) => o.name && o.name !== '未知项目')
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  const exportMusicianOptions = computed(() => {
    const ids = new Set();
    scheduledTasks.value.forEach((t) => { if (t.musicianId) ids.add(t.musicianId); });
    itemPool.value.forEach((i) => { if (i.musicianId) ids.add(i.musicianId); });
    return [...ids]
      .map((id) => ({ id, name: getNameById(id, 'musician') }))
      .filter((o) => o.name && o.name !== '未知演奏员')
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  const exportInstrumentOptions = computed(() => {
    const ids = new Set();
    itemPool.value.forEach((i) => { if (i.instrumentId) ids.add(i.instrumentId); });
    return [...ids]
      .map((id) => ({ id, name: getNameById(id, 'instrument'), group: getInstrumentFamily(id) }))
      .filter((o) => o.name && o.name !== '未知乐器')
      .sort((a, b) => (a.group || '').localeCompare(b.group || '') || a.name.localeCompare(b.name));
  });

  const exportDateRange = computed(() => {
    let min = '';
    let max = '';
    scheduledTasks.value.forEach((t) => {
      if (!t.date) return;
      if (!min || t.date < min) min = t.date;
      if (!max || t.date > max) max = t.date;
    });
    return { min, max };
  });

  /* ── styling constants ── */
  const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const HEADERS = [
    '日期', '星期', '开始时间', '预计时长', '演奏者', '声部 / 乐组',
    '项目', '项目类型', '备注',
  ];

  const HEADER_STYLE = {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
    fill: { fgColor: { rgb: '2E7D6F' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: '1B5E50' } } },
  };

  const REC_EVEN = { fill: { fgColor: { rgb: 'E8F4F2' } } };
  const REC_ODD = { fill: { fgColor: { rgb: 'F5FAF9' } } };
  const EDT_EVEN = { fill: { fgColor: { rgb: 'FFF0E6' } } };
  const EDT_ODD = { fill: { fgColor: { rgb: 'FFF8F2' } } };
  const CENTER = { alignment: { horizontal: 'center', vertical: 'center' } };

  /* ── helpers ── */
  function buildScheduleIndexMap(sessionIds) {
    const groups = {};
    scheduledTasks.value.forEach((t) => {
      const sess = t.sessionId || 'S_DEFAULT';
      if (!sessionIds.has(sess)) return;
      let key = '';
      if (t.musicianId) key = `${sess}|M|${t.musicianId}`;
      else if (t.projectId) key = `${sess}|P|${t.projectId}`;
      else if (t.instrumentId) key = `${sess}|I|${t.instrumentId}`;
      if (!key) return;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    const map = new Map();
    Object.values(groups).forEach((group) => {
      group.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
      group.forEach((t, idx) => map.set(t.scheduleId, idx));
    });
    return map;
  }

  function getItemsForSchedule(schedule, scheduleIndex) {
    const sess = schedule.sessionId || 'S_DEFAULT';
    return itemPool.value.filter((item) => {
      if ((item.sessionId || 'S_DEFAULT') !== sess) return false;
      if (schedule.musicianId && item.musicianId !== schedule.musicianId) return false;
      if (schedule.projectId && !schedule.musicianId && item.projectId !== schedule.projectId) return false;
      if (schedule.instrumentId && !schedule.musicianId && !schedule.projectId && item.instrumentId !== schedule.instrumentId) return false;
      return (item.sectionIndex !== undefined ? item.sectionIndex : 0) === scheduleIndex;
    });
  }

  function getInstrumentFamily(instrumentId) {
    if (!instrumentId) return '';
    return settings.instruments.find((i) => i.id == instrumentId)?.group || '';
  }

  function safeGet(id, type) {
    const name = getNameById(id, type);
    return ['未知项目', '未知乐器', '未知演奏员', '未选择'].includes(name) ? '' : name;
  }

  function formatEstDuration(seconds) {
    if (!seconds || seconds <= 0) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function getWeekday(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return Number.isNaN(d.getTime()) ? '' : WEEKDAYS[d.getDay()];
  }

  function buildInstLabel(item) {
    const instName = item ? (item.name || getNameById(item.instrumentId, 'instrument')) : '';
    const clean = ['未知乐器', '未选择'].includes(instName) ? '' : instName;
    const family = getInstrumentFamily(item?.instrumentId);
    const splitTag = item?.splitTag || '';
    let label = family ? `${family} ${clean}` : clean;
    if (splitTag) label += ` (${splitTag})`;
    return label.trim();
  }

  /* ── core data collection with filters ── */
  function collectFilteredRows() {
    const sessionIds = exportFilter.sessions.size > 0
      ? exportFilter.sessions
      : new Set(exportSessionOptions.value.map((o) => o.id));
    const projectIds = exportFilter.projects;
    const musicianIds = exportFilter.musicians;
    const instrumentIds = exportFilter.instruments;
    const dateFrom = exportFilter.dateFrom || '';
    const dateTo = exportFilter.dateTo || '';

    const scheduleIndexMap = buildScheduleIndexMap(sessionIds);
    const rows = [];

    scheduledTasks.value.forEach((schedule) => {
      const sess = schedule.sessionId || 'S_DEFAULT';
      if (!sessionIds.has(sess)) return;

      if (dateFrom && schedule.date < dateFrom) return;
      if (dateTo && schedule.date > dateTo) return;

      const idxInfo = scheduleIndexMap.get(schedule.scheduleId);
      if (idxInfo === undefined) return;

      const type = schedule.musicianId ? 'REC' : schedule.projectId ? 'EDT' : 'OTHER';
      if (exportFilter.types.size > 0 && !exportFilter.types.has(type)) return;
      const items = getItemsForSchedule(schedule, idxInfo);
      const recInfo = schedule.recordingInfo || {};
      const estDurSec = parseTime(schedule.estDuration);

      const makeRow = (item) => ({
        type,
        date: schedule.date || '',
        weekday: getWeekday(schedule.date),
        startTime: schedule.startTime || '',
        estDuration: formatEstDuration(estDurSec),
        musician: safeGet(item?.musicianId || schedule.musicianId, 'musician'),
        instLabel: item ? buildInstLabel(item) : '',
        project: safeGet(item?.projectId || schedule.projectId, 'project'),
        projectType: type === 'REC' ? 'REC' : 'EDT',
        notes: type === 'REC' ? (recInfo.notes || '') : '',
        _projectId: item?.projectId || schedule.projectId || '',
        _musicianId: item?.musicianId || schedule.musicianId || '',
        _instrumentId: item?.instrumentId || schedule.instrumentId || '',
      });

      const rowCandidates = items.length === 0 ? [makeRow(null)] : items.map((item) => makeRow(item));

      rowCandidates.forEach((row) => {
        if (projectIds.size > 0 && !projectIds.has(row._projectId)) return;
        if (musicianIds.size > 0 && !musicianIds.has(row._musicianId)) return;
        if (instrumentIds.size > 0 && !instrumentIds.has(row._instrumentId)) return;
        rows.push(row);
      });
    });

    return rows;
  }

  function rowToArray(row) {
    return [
      row.date, row.weekday, row.startTime, row.estDuration,
      row.musician, row.instLabel, row.project, row.projectType, row.notes,
    ];
  }

  function applyRowStyle(ws, rowIdx, baseStyle) {
    for (let c = 0; c < HEADERS.length; c++) {
      const addr = XLSX.utils.encode_cell({ r: rowIdx, c });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };
      const isCentered = c <= 3 || c === 7;
      ws[addr].s = {
        ...baseStyle,
        alignment: isCentered ? CENTER.alignment : { vertical: 'center' },
        border: { bottom: { style: 'hair', color: { rgb: 'D0D0D0' } } },
      };
    }
  }

  function buildSheet(rows) {
    const data = [HEADERS, ...rows.map(rowToArray)];
    const ws = XLSX.utils.aoa_to_sheet(data);

    for (let c = 0; c < HEADERS.length; c++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[addr]) ws[addr].s = HEADER_STYLE;
    }

    rows.forEach((row, i) => {
      const isEven = i % 2 === 0;
      const style = row.type === 'EDT' ? (isEven ? EDT_EVEN : EDT_ODD) : (isEven ? REC_EVEN : REC_ODD);
      applyRowStyle(ws, i + 1, style);
    });

    ws['!cols'] = [
      { wch: 12 }, { wch: 6 }, { wch: 9 }, { wch: 10 },
      { wch: 28 }, { wch: 22 }, { wch: 10 }, { wch: 11 }, { wch: 40 },
    ];
    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: HEADERS.length - 1 } }) };
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: HEADERS.length - 1 } });

    return ws;
  }

  /* ── public API ── */
  function openExportModal() {
    if (scheduledTasks.value.length === 0) {
      openAlertModal('日程表是空的', '没有可导出的数据。');
      return;
    }
    if (typeof XLSX === 'undefined') {
      openAlertModal('导出失败', '表格导出库未加载，请检查网络连接后刷新页面。');
      return;
    }

    exportFilter.sessions = new Set([currentSessionId.value]);
    exportFilter.types = new Set(['REC', 'EDT']);
    exportFilter.projects = new Set();
    exportFilter.musicians = new Set();
    exportFilter.instruments = new Set();
    exportFilter.dateFrom = exportDateRange.value.min;
    exportFilter.dateTo = exportDateRange.value.max;
    exportFilter.searchProject = '';
    exportFilter.searchMusician = '';
    exportFilter.searchInstrument = '';
    showExportModal.value = true;
  }

  function toggleFilterItem(setName, id) {
    const s = exportFilter[setName];
    if (s.has(id)) s.delete(id);
    else s.add(id);
    exportFilter[setName] = new Set(s);
  }

  function toggleFilterAll(setName, allIds) {
    const s = exportFilter[setName];
    const allSelected = allIds.every((id) => s.has(id));
    exportFilter[setName] = allSelected ? new Set() : new Set(allIds);
  }

  function confirmExport() {
    const allRows = collectFilteredRows();
    if (allRows.length === 0) {
      openAlertModal('无数据', '当前筛选条件下没有可导出的数据。');
      return;
    }

    showExportModal.value = false;

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const defaultName = `schedule_${dateStr}.xlsx`;

    openInputModal('导出表格 (Excel)', defaultName, '请输入文件名', (inputName) => {
      if (!inputName) return;
      let fileName = inputName;
      if (!fileName.toLowerCase().endsWith('.xlsx')) fileName += '.xlsx';

      const sort = (arr, ...keys) => [...arr].sort((a, b) => {
        for (const k of keys) { const d = (a[k] || '').localeCompare(b[k] || ''); if (d) return d; }
        return 0;
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, buildSheet(sort(allRows, 'date', 'startTime')), '按时间排序');
      XLSX.utils.book_append_sheet(wb, buildSheet(sort(allRows, 'project', 'date', 'startTime')), '按项目排序');
      XLSX.utils.book_append_sheet(wb, buildSheet(sort(allRows, 'instLabel', 'date', 'startTime')), '按乐器排序');
      XLSX.utils.book_append_sheet(wb, buildSheet(sort(allRows, 'musician', 'date', 'startTime')), '按演奏员排序');

      XLSX.writeFile(wb, fileName);
    });
  }

  const filteredExportProjects = computed(() => {
    const q = (exportFilter.searchProject || '').toLowerCase();
    if (!q) return exportProjectOptions.value;
    return exportProjectOptions.value.filter((o) => o.name.toLowerCase().includes(q));
  });

  const filteredExportMusicians = computed(() => {
    const q = (exportFilter.searchMusician || '').toLowerCase();
    if (!q) return exportMusicianOptions.value;
    return exportMusicianOptions.value.filter((o) => o.name.toLowerCase().includes(q));
  });

  const filteredExportInstruments = computed(() => {
    const q = (exportFilter.searchInstrument || '').toLowerCase();
    if (!q) return exportInstrumentOptions.value;
    return exportInstrumentOptions.value.filter((o) =>
      o.name.toLowerCase().includes(q) || (o.group || '').toLowerCase().includes(q));
  });

  /* preview count: only compute when modal is open to avoid heavy work during init */
  const exportPreviewCount = computed(() => {
    if (!showExportModal.value) return 0;
    return collectFilteredRows().length;
  });

  return {
    showExportModal,
    exportFilter,
    exportSessionOptions,
    filteredExportProjects,
    filteredExportMusicians,
    filteredExportInstruments,
    exportDateRange,
    exportPreviewCount,
    openExportModal,
    toggleFilterItem,
    toggleFilterAll,
    confirmExport,
    exportCSV: openExportModal,
  };
}
