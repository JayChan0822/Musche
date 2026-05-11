export function registerExportCsvFeature(context) {
  const { refs, state, utils, actions } = context;
  const { itemPool, scheduledTasks, currentSessionId } = refs;
  const { settings } = state;
  const { parseTime, getNameById } = utils;
  const { openAlertModal, openInputModal } = actions;

  const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const HEADERS = [
    '日期', '星期', '开始时间', '预计时长', '演奏者', '声部 / 乐组',
    '项目', '项目类型', '备注',
  ];

  const HEADER_STYLE = {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
    fill: { fgColor: { rgb: '2E7D6F' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      bottom: { style: 'thin', color: { rgb: '1B5E50' } },
    },
  };

  const REC_EVEN = { fill: { fgColor: { rgb: 'E8F4F2' } } };
  const REC_ODD = { fill: { fgColor: { rgb: 'F5FAF9' } } };
  const EDT_EVEN = { fill: { fgColor: { rgb: 'FFF0E6' } } };
  const EDT_ODD = { fill: { fgColor: { rgb: 'FFF8F2' } } };

  const CENTER = { alignment: { horizontal: 'center', vertical: 'center' } };

  function buildScheduleIndexMap() {
    const groups = {};
    scheduledTasks.value.forEach((t) => {
      const sess = t.sessionId || 'S_DEFAULT';
      let key = '';
      if (t.musicianId) key = `${sess}|M|${t.musicianId}`;
      else if (t.projectId) key = `${sess}|P|${t.projectId}`;
      else if (t.instrumentId) key = `${sess}|I|${t.instrumentId}`;
      if (!key) return;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    const scheduleIndexMap = new Map();
    Object.values(groups).forEach((group) => {
      group.sort(
        (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
      );
      group.forEach((t, index) => {
        scheduleIndexMap.set(t.scheduleId, index);
      });
    });
    return scheduleIndexMap;
  }

  function getItemsForSchedule(schedule, scheduleIndex) {
    const sess = schedule.sessionId || 'S_DEFAULT';
    return itemPool.value.filter((item) => {
      if ((item.sessionId || 'S_DEFAULT') !== sess) return false;
      if (schedule.musicianId && item.musicianId !== schedule.musicianId) return false;
      if (schedule.projectId && !schedule.musicianId && item.projectId !== schedule.projectId)
        return false;
      if (
        schedule.instrumentId &&
        !schedule.musicianId &&
        !schedule.projectId &&
        item.instrumentId !== schedule.instrumentId
      )
        return false;
      const itemIdx = item.sectionIndex !== undefined ? item.sectionIndex : 0;
      return itemIdx === scheduleIndex;
    });
  }

  function getInstrumentFamily(instrumentId) {
    if (!instrumentId) return '';
    const inst = settings.instruments.find((i) => i.id == instrumentId);
    return inst?.group || '';
  }

  function safeGet(id, type) {
    const name = getNameById(id, type);
    const fallbacks = ['未知项目', '未知乐器', '未知演奏员', '未选择'];
    return fallbacks.includes(name) ? '' : name;
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
    const instName = item
      ? (item.name || getNameById(item.instrumentId, 'instrument'))
      : '';
    const fallbacks = ['未知乐器', '未选择'];
    const clean = fallbacks.includes(instName) ? '' : instName;
    const family = getInstrumentFamily(item?.instrumentId);
    const splitTag = item?.splitTag || '';
    let label = family ? `${family} ${clean}` : clean;
    if (splitTag) label += ` (${splitTag})`;
    return label.trim();
  }

  function collectAllRows() {
    const scheduleIndexMap = buildScheduleIndexMap();
    const rows = [];

    scheduledTasks.value.forEach((schedule) => {
      const sess = schedule.sessionId || 'S_DEFAULT';
      if (sess !== currentSessionId.value) return;

      const idxInfo = scheduleIndexMap.get(schedule.scheduleId);
      if (idxInfo === undefined) return;

      const type = schedule.musicianId ? 'REC' : schedule.projectId ? 'EDT' : 'OTHER';
      const items = getItemsForSchedule(schedule, idxInfo);
      const recInfo = schedule.recordingInfo || {};
      const editInfo = schedule.editInfo || {};
      const estDurSec = parseTime(schedule.estDuration);

      const makeRow = (item) => {
        const projectName = safeGet(item?.projectId || schedule.projectId, 'project');
        const projectType = type === 'REC' ? 'C Projects' : 'P Projects';

        return {
          type,
          date: schedule.date || '',
          weekday: getWeekday(schedule.date),
          startTime: schedule.startTime || '',
          estDuration: formatEstDuration(estDurSec),
          musician: safeGet(item?.musicianId || schedule.musicianId, 'musician'),
          instLabel: item ? buildInstLabel(item) : buildInstLabel(null),
          project: projectName,
          projectType,
          notes: type === 'REC' ? (recInfo.notes || '') : '',
        };
      };

      if (items.length === 0) {
        rows.push(makeRow(null));
      } else {
        items.forEach((item) => rows.push(makeRow(item)));
      }
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
    const colCount = HEADERS.length;
    for (let c = 0; c < colCount; c++) {
      const addr = XLSX.utils.encode_cell({ r: rowIdx, c });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };
      const isCentered = c <= 3 || c === 7;
      ws[addr].s = {
        ...baseStyle,
        alignment: isCentered ? CENTER.alignment : { vertical: 'center' },
        border: {
          bottom: { style: 'hair', color: { rgb: 'D0D0D0' } },
        },
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
      const rowIdx = i + 1;
      const isEven = i % 2 === 0;
      const style = row.type === 'EDT'
        ? (isEven ? EDT_EVEN : EDT_ODD)
        : (isEven ? REC_EVEN : REC_ODD);
      applyRowStyle(ws, rowIdx, style);
    });

    const colWidths = [
      { wch: 12 },  // 日期
      { wch: 6 },   // 星期
      { wch: 9 },   // 开始时间
      { wch: 10 },  // 预计时长
      { wch: 28 },  // 演奏者
      { wch: 22 },  // 声部/乐组
      { wch: 10 },  // 项目
      { wch: 11 },  // 项目类型
      { wch: 40 },  // 备注
    ];
    ws['!cols'] = colWidths;

    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: HEADERS.length - 1 } }) };

    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    const lastRow = rows.length;
    const lastCol = HEADERS.length - 1;
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow, c: lastCol } });

    return ws;
  }

  function exportCSV() {
    if (scheduledTasks.value.length === 0) {
      openAlertModal('日程表是空的', '没有可导出的数据。');
      return;
    }

    if (typeof XLSX === 'undefined') {
      openAlertModal('导出失败', '表格导出库未加载，请检查网络连接后刷新页面。');
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const defaultName = `schedule_${dateStr}.xlsx`;

    openInputModal('导出表格 (Excel)', defaultName, '请输入文件名', (inputName) => {
      if (!inputName) return;
      let fileName = inputName;
      if (!fileName.toLowerCase().endsWith('.xlsx')) fileName += '.xlsx';

      const allRows = collectAllRows();

      const byTime = [...allRows].sort(
        (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
      );

      const byProject = [...allRows].sort(
        (a, b) => a.project.localeCompare(b.project) || a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
      );

      const byInstrument = [...allRows].sort(
        (a, b) => a.instLabel.localeCompare(b.instLabel) || a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
      );

      const byMusician = [...allRows].sort(
        (a, b) => a.musician.localeCompare(b.musician) || a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, buildSheet(byTime), '按时间排序');
      XLSX.utils.book_append_sheet(wb, buildSheet(byProject), '按项目排序');
      XLSX.utils.book_append_sheet(wb, buildSheet(byInstrument), '按乐器排序');
      XLSX.utils.book_append_sheet(wb, buildSheet(byMusician), '按演奏员排序');

      XLSX.writeFile(wb, fileName);
    });
  }

  return { exportCSV };
}
