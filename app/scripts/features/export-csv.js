export function registerExportCsvFeature(context) {
  const { refs, state, utils, actions } = context;
  const { itemPool, scheduledTasks, currentSessionId } = refs;
  const { settings } = state;
  const { parseTime, getNameById } = utils;
  const { openAlertModal, openInputModal } = actions;

  const HEADERS = [
    '类型',
    '日期',
    '开始时间',
    '结束时间',
    '项目',
    '乐器分类',
    '乐器',
    '演奏员',
    '谱面时长',
    '编制',
    '录音棚/工作室',
    '工程师',
    '操作员',
    '助理',
    '备注',
  ];

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

  function addMinutesFormatted(startTime, seconds) {
    const [h, m] = startTime.split(':').map(Number);
    const totalMin = h * 60 + m + seconds / 60;
    const eh = Math.floor(totalMin / 60);
    const em = Math.floor(totalMin % 60);
    return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
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
      const endTime = addMinutesFormatted(schedule.startTime, parseTime(schedule.estDuration));
      const recInfo = schedule.recordingInfo || {};
      const editInfo = schedule.editInfo || {};

      const makeRow = (item) => {
        const instRaw = item
          ? item.name || getNameById(item.instrumentId, 'instrument')
          : safeGet(schedule.instrumentId, 'instrument');
        const splitTag = item?.splitTag || '';
        const instName = splitTag ? `${instRaw} (${splitTag})` : instRaw;
        const fallbacks = ['未知乐器', '未选择'];
        const cleanInstName = fallbacks.includes(instName) ? '' : instName;

        return {
          type,
          date: schedule.date || '',
          startTime: schedule.startTime || '',
          endTime,
          project: safeGet(item?.projectId || schedule.projectId, 'project'),
          instFamily: getInstrumentFamily(item?.instrumentId || schedule.instrumentId),
          instName: cleanInstName,
          musician: safeGet(item?.musicianId || schedule.musicianId, 'musician'),
          duration: item?.musicDuration || schedule.musicDuration || '',
          orchestration: item?.orchestration || '',
          studio: type === 'EDT' ? (editInfo.studio || '') : (recInfo.studio || ''),
          engineer: type === 'EDT' ? (editInfo.engineer || '') : (recInfo.engineer || ''),
          operator: type === 'REC' ? (recInfo.operator || '') : '',
          assistant: type === 'REC' ? (recInfo.assistant || '') : '',
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
      row.type,
      row.date,
      row.startTime,
      row.endTime,
      row.project,
      row.instFamily,
      row.instName,
      row.musician,
      row.duration,
      row.orchestration,
      row.studio,
      row.engineer,
      row.operator,
      row.assistant,
      row.notes,
    ];
  }

  function buildSheet(rows) {
    const data = [HEADERS, ...rows.map(rowToArray)];
    const ws = XLSX.utils.aoa_to_sheet(data);

    const colWidths = HEADERS.map((h, i) => {
      let max = h.length * 2;
      rows.forEach((row) => {
        const val = rowToArray(row)[i] || '';
        const len = String(val).length * 1.5;
        if (len > max) max = len;
      });
      return { wch: Math.min(Math.max(max, 8), 40) };
    });
    ws['!cols'] = colWidths;

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
        (a, b) => a.instFamily.localeCompare(b.instFamily) || a.instName.localeCompare(b.instName) || a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
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
