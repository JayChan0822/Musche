const { computed, watch } = Vue;

export function registerImportCsvFeature(context) {
  const { refs, state, utils, actions } = context;
  const {
    csvSearchQuery,
    csvImportData,
    csvImportConfig,
    activeImportTab,
    collapsedProjects,
    rawCsvRows,
    csvHeadersMap,
    showCsvImportModal,
    itemPool,
    scheduledTasks,
    currentSessionId,
  } = refs;
  const { settings } = state;
  const {
    formatSecs,
    parseTime,
    normalizeDate,
    getOrchString,
    getNameById,
    getOrCreateSettingItem,
    calculateEstTime,
    generateUniqueId,
  } = utils;
  const {
    pushHistory,
    openAlertModal,
    autoUpdateEfficiency,
    autoResizeSchedules,
  } = actions;

  const groupedCsvData = computed(() => {
    const query = csvSearchQuery.value.toLowerCase().trim();
    const showSkip = csvImportConfig.showSkipRows;
    const mode = activeImportTab.value;

    let sourceData = csvImportData.value;
    if (query) {
      sourceData = sourceData.filter((item) => {
        const searchTargets = [
          item.projectName,
          item.playerName,
          item.name_real,
          item.name_merge,
        ];
        return searchTargets.some((value) => value && String(value).toLowerCase().includes(query));
      });
    }

    const groups = {};
    const projectOrder = [];

    sourceData.forEach((row) => {
      const isValid = activeImportTab.value === 'rec' ? row.hasRecData : row.hasEditData;
      if (!isValid) return;

      const status = mode === 'rec' ? row.recStatusText : row.editStatusText;
      if (!showSkip && status === 'SKIP') return;

      const projectName = row.projectName || 'Unknown Project';
      if (!groups[projectName]) {
        groups[projectName] = {
          projectName,
          rows: [],
          expanded: !collapsedProjects.has(projectName),
        };
        projectOrder.push(projectName);
      }
      groups[projectName].rows.push(row);
    });

    return projectOrder
      .map((projectName) => groups[projectName])
      .filter((group) => group.rows.length > 0);
  });

  const isAllSelected = computed(() => {
    if (groupedCsvData.value.length === 0) return false;
    return groupedCsvData.value.every((group) => group.rows.every((row) => row.selected));
  });

  watch(
    () => [csvSearchQuery.value, activeImportTab.value],
    ([newQuery, newTab]) => {
      if (!newQuery || !newQuery.trim()) return;

      const query = newQuery.toLowerCase().trim();
      csvImportData.value.forEach((row) => {
        const isVisibleInTab = newTab === 'rec' ? row.hasRecData : row.hasEditData;
        if (!isVisibleInTab) return;

        const searchTargets = [
          row.projectName,
          row.playerName,
          row.name_real,
          row.name_merge,
        ];
        row.selected = searchTargets.some((value) => value && String(value).toLowerCase().includes(query));
      });
    },
  );

  watch(
    () => csvImportConfig.importTypes,
    () => {
      refreshCsvStatus();
    },
    { deep: true },
  );

  watch(
    () => csvImportConfig.nameStrategy,
    () => {
      if (rawCsvRows.value.length > 0) {
        refreshCsvPreview();
      }
    },
  );

  watch(activeImportTab, () => {
    refreshCsvStatus();
  });

  function calculateRowStatusText(row) {
    const config = csvImportConfig.importTypes;

    if (!row.selected || (!config.tasks && !config.time && !config.orch)) {
      return 'SKIP';
    }

    if (row.isDuplicate) {
      if (config.time || config.orch) {
        return 'UPDATE';
      }
      return 'SKIP';
    }

    return 'NEW';
  }

  function toggleCsvSelection(index, field) {
    const row = csvImportData.value[index];
    if (!row) return;

    if (field && row.selection) {
      row.selection[field] = !row.selection[field];
    }

    const config = csvImportConfig.importTypes;
    const updateStatusByTab = (isRec) => {
      if (!row.selected || (!config.tasks && !config.time && !config.orch)) return 'SKIP';
      if (!row.isDuplicate) return config.tasks ? 'NEW' : 'SKIP';

      const hasTimeDiff = isRec ? row.hasRecTimeDiff : row.hasEdtTimeDiff;
      const shouldUpdate = (config.time && hasTimeDiff) || (config.orch && row.hasOrchDiff);
      return shouldUpdate ? 'UPDATE' : 'SKIP';
    };

    row.recStatusText = updateStatusByTab(true);
    row.editStatusText = updateStatusByTab(false);
    csvImportData.value[index] = { ...row };
  }

  function isGroupSelected(rows) {
    return rows.length > 0 && rows.every((row) => row.selected);
  }

  function toggleGroupSelection(group, isChecked) {
    group.rows.forEach((row) => {
      row.selected = isChecked;
    });
  }

  function toggleAllRows(isChecked) {
    groupedCsvData.value.forEach((group) => {
      group.rows.forEach((row) => {
        row.selected = isChecked;
      });
    });
  }

  function parseCSVLine(text) {
    const result = [];
    let cell = '';
    let inQuotes = false;

    for (let index = 0; index < text.length; index++) {
      const char = text[index];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cell.trim().replace(/^"|"$/g, ''));
        cell = '';
      } else {
        cell += char;
      }
    }

    result.push(cell.trim().replace(/^"|"$/g, ''));
    return result;
  }

  function parseCSVRobust(text) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuote = false;

    for (let index = 0; index < text.length; index++) {
      const char = text[index];
      const nextChar = text[index + 1];

      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          currentCell += '"';
          index++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !insideQuote) {
        if (char === '\r' && nextChar === '\n') index++;
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
    }

    return rows;
  }

  function handleCSVImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (loadEvent) => {
      const csvText = loadEvent.target.result;
      const allRows = parseCSVRobust(csvText);
      const headerIndex = allRows.findIndex((row) =>
        row.some((cell) => cell.includes('PID') || cell.includes('项目') || cell.includes('Project')),
      );

      if (headerIndex === -1) {
        if (typeof alert === 'function') alert('未找到表头');
        else openAlertModal('未找到表头', '导入文件里没有识别到 CSV 表头。');
        return;
      }

      const headers = allRows[headerIndex].map((header) => header.replace(/^"|"$/g, '').trim());
      csvHeadersMap.value = {
        project: headers.findIndex((header) => header.includes('PID') || header.includes('项目') || header.includes('Project')),
        instFamily: headers.findIndex((header) => header.includes('Inst Family') || header.includes('乐器分类')),
        instName: headers.findIndex((header) => header.includes('Inst Name') || header === '乐器' || header.includes('乐器名称')),
        playerName: headers.findIndex((header) => header.includes('Player Name') || header === 'Player' || header.includes('人员')),
        duration: headers.findIndex((header) => header.includes('Duration') || header.includes('时长')),
        recDate: headers.findIndex((header) => header.includes('[REC] Date') || header.includes('录音日期')),
        recStart: headers.findIndex((header) => header.includes('[REC] Starting Time') || header.includes('录音开始时间')),
        recEnd: headers.findIndex((header) => header.includes('[REC] Ending Time') || header.includes('录音结束时间')),
        recStudio: headers.findIndex((header) => (header.includes('[REC] Studio') && !header.includes('Time')) || header.includes('录音棚')),
        recEngineer: headers.findIndex((header) => header.includes('[REC] Engineer') || header.includes('录音师')),
        recOperator: headers.findIndex((header) => header.includes('[REC] Operator') || header.includes('录音助理')),
        recAssistant: headers.findIndex((header) => header.includes('[REC] Assistant')),
        recComments: headers.findIndex((header) => header.includes('[REC] Comments') || header.includes('备注')),
        orchestration: headers.findIndex((header) => header.includes('Orchestration') || header.includes('编制')),
        edtDate: headers.findIndex((header) => header.includes('[EDT] Date')),
        edtStart: headers.findIndex((header) => header.includes('[EDT] Starting Time')),
        edtEnd: headers.findIndex((header) => header.includes('[EDT] Ending Time')),
        edtRest: headers.findIndex((header) => header.includes('[EDT] Rest Time')),
        edtEngineer: headers.findIndex((header) => header.includes('[EDT] Engineer')),
        edtStudio: headers.findIndex((header) => header.includes('[EDT] Studio') && !header.includes('Time')),
        mixEngineer: headers.findIndex((header) => header.includes('[MIX] Engineer')),
        mixStudio: headers.findIndex((header) => header.includes('[MIX] Studio') && !header.includes('Time')),
        masEngineer: headers.findIndex((header) => header.includes('[MAS] Engineer')),
        masStudio: headers.findIndex((header) => header.includes('[MAS] Studio') && !header.includes('Time')),
      };

      rawCsvRows.value = allRows.slice(headerIndex + 1).filter((row) => {
        const hasProject = csvHeadersMap.value.project > -1 && row[csvHeadersMap.value.project]?.trim();
        const hasInst = csvHeadersMap.value.instName > -1 && row[csvHeadersMap.value.instName]?.trim();
        const hasDate = csvHeadersMap.value.edtDate > -1 && row[csvHeadersMap.value.edtDate]?.trim();
        const hasRecDate = csvHeadersMap.value.recDate > -1 && row[csvHeadersMap.value.recDate]?.trim();
        return hasProject || hasInst || hasDate || hasRecDate;
      });

      refreshCsvPreview();
      showCsvImportModal.value = true;
    };
  }

  function refreshCsvPreview() {
    const rows = rawCsvRows.value;
    const col = csvHeadersMap.value;
    const strategy = csvImportConfig.nameStrategy;

    const preparedData = [];
    const orchestrationGroups = {};
    const processedIndices = new Set();
    const instNameCounter = {};
    const instTotalCounts = {};

    rows.forEach((row) => {
      const projectName = row[col.project] || '未命名项目';
      const rawName = row[col.instName] || '未命名乐器';
      const cleanName = rawName.replace(/\s+\d+$/, '').trim();
      const key = `${projectName}|${cleanName}`;
      instTotalCounts[key] = (instTotalCounts[key] || 0) + 1;
    });

    rows.forEach((row, index) => {
      const projectId = row[col.project] || '未命名项目';
      const playerName = (row[col.playerName] || '').toLowerCase();
      let groupType = '';
      if (playerName.includes('string')) groupType = 'Strings';
      else if (playerName.includes('brass')) groupType = 'Brass';
      else if (playerName.includes('wood') || playerName.includes('wind')) groupType = 'Woodwinds';
      if (col.playerName > -1 && (!row[col.playerName] || !row[col.playerName].trim())) {
        return;
      }

      if (groupType) {
        const key = `${projectId}|${groupType}`;
        if (!orchestrationGroups[key]) {
          orchestrationGroups[key] = { firstRow: row, instNames: [], maxDuration: '00:00' };
        }
        orchestrationGroups[key].instNames.push(row[col.instName] || '');
        if ((row[col.duration] || '00:00') > orchestrationGroups[key].maxDuration) {
          orchestrationGroups[key].maxDuration = row[col.duration];
        }
        processedIndices.add(index);
      }
    });

    rows.forEach((row, index) => {
      if (strategy === 'merge' && processedIndices.has(index)) return;
      if (col.playerName > -1 && (!row[col.playerName] || !row[col.playerName].trim())) {
        return;
      }

      const projectName = row[col.project] || '未命名项目';
      const rawName = row[col.instName] || '未命名乐器';
      const cleanName = rawName.replace(/\s+\d+$/, '').trim();

      const countKey = `${projectName}|${cleanName}`;
      instNameCounter[countKey] = (instNameCounter[countKey] || 0) + 1;
      const seqNum = instNameCounter[countKey];

      let displayName = cleanName;
      if ((instTotalCounts[countKey] || 0) > 1) {
        displayName = `${cleanName} ${seqNum}`;
      }

      addDataToPrepared(preparedData, row, col, {
        displayCsvName: displayName,
        realCsvName: cleanName,
      });
    });

    if (strategy === 'merge') {
      Object.keys(orchestrationGroups).forEach((key) => {
        const [, groupName] = key.split('|');
        const groupData = orchestrationGroups[key];
        addDataToPrepared(preparedData, groupData.firstRow, col, {
          forceName: groupName,
          realCsvName: groupName,
          displayCsvName: groupName,
          injectedOrch: getOrchString(groupData.instNames),
          overrideDuration: groupData.maxDuration,
        });
      });
    }

    csvImportData.value = preparedData;
  }

  function refreshCsvStatus() {
    const { tasks: isTaskMode, time: isTimeMode, orch: isOrchMode } = csvImportConfig.importTypes;

    csvImportData.value = csvImportData.value.map((row) => {
      const getStatus = () => {
        const isRecTab = activeImportTab.value === 'rec';
        const hasCurrentModeData = isRecTab ? row.hasRecData : row.hasEditData;
        if (!hasCurrentModeData) return 'SKIP';

        if (row.isDuplicate) {
          let shouldUpdate = false;
          if (isTimeMode) {
            const timeDiff = isRecTab ? row.hasRecTimeDiff : row.hasEdtTimeDiff;
            if (timeDiff) shouldUpdate = true;
          }
          if (isOrchMode && row.hasOrchDiff) {
            shouldUpdate = true;
          }
          return shouldUpdate ? 'UPDATE' : 'SKIP';
        }

        return isTaskMode ? 'NEW' : 'SKIP';
      };

      const finalStatus = getStatus();
      if (activeImportTab.value === 'rec') row.recStatusText = finalStatus;
      else row.editStatusText = finalStatus;
      row.selected = finalStatus !== 'SKIP';
      return row;
    });

    refreshCsvPreview();
  }

  function confirmCsvImport() {
    if (typeof pushHistory === 'function') pushHistory('Import CSV Data');
    const isRecTab = activeImportTab.value === 'rec';
    const selectedRows = csvImportData.value.filter(
      (row) => row.selected && (isRecTab ? row.hasRecData : row.hasEditData),
    );

    if (selectedRows.length === 0) {
      if (csvImportData.value.some((row) => row.selected)) {
        openAlertModal(
          '提示',
          `当前视图 (${activeImportTab.value === 'rec' ? 'Recording' : 'Editing'}) 没有选中的有效任务。`,
        );
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
    const affectedMusicianIds = new Set();
    const affectedProjectIds = new Set();
    const affectedInstrumentIds = new Set();
    const col = csvHeadersMap.value;
    const taskToScheduleMap = new Map();
    const snapshotLoaded = new Set();

    const ensureSnapshot = (id, type) => {
      const key = `${type}_${id}`;
      if (!id || snapshotLoaded.has(key)) return;

      const scheduleList = scheduledTasks.value
        .filter((task) => {
          if ((task.sessionId || 'S_DEFAULT') !== currentSessionId.value) return false;
          if (type === 'musician') return task.musicianId === id;
          if (type === 'project') return task.projectId === id && !task.musicianId;
          if (type === 'instrument') return task.instrumentId === id;
          return false;
        })
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

      const itemList = itemPool.value.filter((item) => {
        if ((item.sessionId || 'S_DEFAULT') !== currentSessionId.value) return false;
        if (type === 'musician') return item.musicianId === id;
        if (type === 'project') return item.projectId === id;
        if (type === 'instrument') return item.instrumentId === id;
        return false;
      });

      itemList.forEach((item) => {
        const index = item.sectionIndex || 0;
        if (scheduleList[index]) {
          taskToScheduleMap.set(item.id, scheduleList[index].scheduleId);
        }
      });

      snapshotLoaded.add(key);
    };

    const formatCell = (value) => (value ? value.replace(/[\r\n]+/g, ' / ').trim() : '');
    const getMins = (value) => {
      if (!value) return 0;
      const [hours, minutes] = value.split(':').map(Number);
      return (hours || 0) * 60 + (minutes || 0);
    };
    const formatSecsLocal = (seconds) => {
      if (seconds <= 0) return '01:00:00';
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    selectedRows.forEach((data) => {
      const projectId = getOrCreateSettingItem('project', data.projectName);
      const instrumentId = getOrCreateSettingItem('instrument', data.name_real, data.group);
      const musicianId = getOrCreateSettingItem('musician', data.playerName, data.group);

      if (musicianId) {
        affectedMusicianIds.add(musicianId);
        ensureSnapshot(musicianId, 'musician');
      }
      if (projectId) {
        affectedProjectIds.add(projectId);
        ensureSnapshot(projectId, 'project');
      }
      if (instrumentId) {
        affectedInstrumentIds.add(instrumentId);
        ensureSnapshot(instrumentId, 'instrument');
      }

      if (activeImportTab.value === 'rec') {
        if (!data.hasRecData) return;

        if (projectId && data._raw) {
          const row = data._raw;
          const project = settings.projects.find((item) => item.id === projectId);
          if (project) {
            if (col.mixEngineer > -1 && row[col.mixEngineer]) project.mixingEngineer = formatCell(row[col.mixEngineer]);
            if (col.mixStudio > -1 && row[col.mixStudio]) project.mixingStudio = formatCell(row[col.mixStudio]);
            if (col.masEngineer > -1 && row[col.masEngineer]) project.masteringEngineer = formatCell(row[col.masEngineer]);
            if (col.masStudio > -1 && row[col.masStudio]) project.masteringStudio = formatCell(row[col.masStudio]);
          }
        }

        let taskItem = itemPool.value.find(
          (item) =>
            item.projectId === projectId &&
            item.name === data.name_merge &&
            item.musicianId === musicianId &&
            item.splitTag === (data.isSplit ? `Part ${data.partIndex + 1}` : null),
        );

        if (isTaskMode && !taskItem) {
          const instrument = settings.instruments.find((item) => item.id === instrumentId);
          const isSameName = instrument && instrument.name.toLowerCase() === data.name_merge.toLowerCase();
          taskItem = {
            id: generateUniqueId('T'),
            sessionId: currentSessionId.value,
            projectId,
            instrumentId,
            musicianId,
            name: isSameName ? '' : data.name_merge,
            musicDuration: data.duration,
            orchestration: '',
            records: { musician: {}, project: {}, instrument: {} },
            splitTag: data.isSplit ? `Part ${data.partIndex + 1}` : null,
            ratio: 20,
            estDuration: calculateEstTime(data.duration, 20),
            _isNewImport: true,
          };
          itemPool.value.push(taskItem);
        }

        if (!taskItem) return;

        if (isOrchMode && data.orchestration) taskItem.orchestration = data.orchestration;
        if (isTimeMode && data.duration && data.duration !== '00:00' && taskItem.musicDuration !== data.duration) {
          taskItem.musicDuration = data.duration;
          taskItem.estDuration = calculateEstTime(data.duration, taskItem.ratio || 20);
          affectedTaskIds.add(taskItem.id);
        }

        const recDate = data.recDate;
        const recStart = data.recStart;
        const recEnd = data.recEnd;

        if (recDate && recStart) {
          if (taskItem.records) {
            if (!taskItem.records.musician) taskItem.records.musician = {};
            taskItem.records.musician.recStart = recStart;
            if (recEnd) {
              taskItem.records.musician.recEnd = recEnd;
              const [h1, m1] = recStart.split(':').map(Number);
              const [h2, m2] = recEnd.split(':').map(Number);
              let startMins = h1 * 60 + m1;
              let endMins = h2 * 60 + m2;
              if (endMins < startMins) endMins += 24 * 60;
              taskItem.records.musician.actualDuration = formatSecs((endMins - startMins) * 60);
            }
          }

          let startMins = getMins(recStart);
          let endMins = recEnd ? getMins(recEnd) : startMins + 60;
          if (endMins <= startMins) endMins += 1440;

          const row = data._raw;
          validRecordings.push({
            task: taskItem,
            pId: projectId,
            iId: instrumentId,
            mId: musicianId,
            date: typeof normalizeDate === 'function' ? normalizeDate(recDate) : recDate,
            startMins,
            endMins,
            info: {
              studio: data.recStudio || '',
              engineer: data.recEngineer || '',
              operator: col.recOperator > -1 ? formatCell(row[col.recOperator]) : '',
              assistant: col.recAssistant > -1 ? formatCell(row[col.recAssistant]) : '',
              notes: col.recComments > -1 ? formatCell(row[col.recComments]) : '',
            },
          });
        }
        return;
      }

      if (!data.hasEditData) return;

      let taskItem = itemPool.value.find(
        (item) =>
          item.projectId === projectId &&
          item.name === data.name_merge &&
          item.musicianId === musicianId &&
          item.splitTag === (data.isSplit ? `Part ${data.partIndex + 1}` : null),
      );

      if (isTaskMode && !taskItem) {
        const instrument = settings.instruments.find((item) => item.id === instrumentId);
        const isSameName = instrument && instrument.name.toLowerCase() === data.name_merge.toLowerCase();
        taskItem = {
          id: generateUniqueId('T'),
          sessionId: currentSessionId.value,
          projectId,
          instrumentId,
          musicianId,
          name: isSameName ? '' : data.name_merge,
          musicDuration: data.duration,
          orchestration: '',
          records: { musician: {}, project: {}, instrument: {} },
          splitTag: data.isSplit ? `Part ${data.partIndex + 1}` : null,
          ratio: 20,
          estDuration: calculateEstTime(data.duration, 20),
          _isNewImport: true,
        };
        itemPool.value.push(taskItem);
      }

      if (!taskItem) return;

      const editDate = data.edtDate;
      const editStart = data.edtStart;
      const editEnd = data.edtEnd;

      if (editDate && editStart) {
        if (taskItem.records) {
          if (!taskItem.records.project) taskItem.records.project = {};

          taskItem.records.project.recStart = editStart;
          if (editEnd) {
            taskItem.records.project.recEnd = editEnd;
            const [h1, m1] = editStart.split(':').map(Number);
            const [h2, m2] = editEnd.split(':').map(Number);
            let startMins = h1 * 60 + m1;
            let endMins = h2 * 60 + m2;
            if (endMins < startMins) endMins += 24 * 60;
            taskItem.records.project.actualDuration = formatSecs((endMins - startMins) * 60);
          }
          if (data.edtRest) {
            taskItem.records.project.breakMinutes = parseInt(data.edtRest, 10) || 0;
          }
        }

        let startMins = getMins(editStart);
        let endMins = editEnd ? getMins(editEnd) : startMins + 60;
        if (endMins <= startMins) endMins += 1440;

        let durationMins = endMins - startMins;
        if (data.edtRest) durationMins -= parseInt(data.edtRest, 10) || 0;

        validEditings.push({
          task: taskItem,
          pId: projectId,
          iId: instrumentId,
          mId: musicianId,
          date: typeof normalizeDate === 'function' ? normalizeDate(editDate) : editDate,
          startMins,
          endMins,
          durationMins,
          info: {
            studio: data.edtStudio || '',
            engineer: data.edtEngineer || '',
          },
        });
      }
    });

    if (validRecordings.length > 0) {
      validRecordings.sort((a, b) => a.date.localeCompare(b.date) || a.startMins - b.startMins);

      for (let index = 0; index < validRecordings.length; index++) {
        const current = validRecordings[index];
        let startMins = current.startMins;
        let endMins = current.endMins;
        const items = [current.task];
        const infos = [current.info];

        while (index + 1 < validRecordings.length) {
          const next = validRecordings[index + 1];
          if (next.date !== current.date || next.mId !== current.mId) break;

          if (next.startMins - endMins <= 60) {
            endMins = Math.max(endMins, next.endMins);
            items.push(next.task);
            infos.push(next.info);
            index++;
          } else {
            break;
          }
        }

        const mergeField = (list, key) => [...new Set(list.map((item) => item[key]).filter(Boolean))].join(' / ');
        const startStr = `${String(Math.floor(startMins / 60)).padStart(2, '0')}:${String(startMins % 60).padStart(2, '0')}`;

        let targetScheduleId;
        const existingTask = scheduledTasks.value.find(
          (task) =>
            task.date === current.date &&
            task.startTime === startStr &&
            task.musicianId === current.mId &&
            (task.sessionId || 'S_DEFAULT') === currentSessionId.value,
        );

        if (existingTask) {
          targetScheduleId = existingTask.scheduleId;
        } else {
          targetScheduleId = Date.now() + Math.random();
          scheduledTasks.value.push({
            scheduleId: targetScheduleId,
            sessionId: currentSessionId.value,
            musicianId: current.mId || null,
            projectId: !current.mId && current.pId ? current.pId : null,
            instrumentId: !current.mId && !current.pId && current.iId ? current.iId : null,
            date: current.date,
            startTime: startStr,
            estDuration: formatSecsLocal((endMins - startMins) * 60),
            trackCount: 0,
            ratio: 20,
            recordingInfo: {
              studio: mergeField(infos, 'studio'),
              engineer: mergeField(infos, 'engineer'),
              operator: mergeField(infos, 'operator'),
              assistant: mergeField(infos, 'assistant'),
              notes: mergeField(infos, 'notes'),
            },
          });
        }

        items.forEach((item) => {
          taskToScheduleMap.set(item.id, targetScheduleId);
        });
      }
    }

    if (validEditings.length > 0) {
      validEditings.sort((a, b) => a.date.localeCompare(b.date) || a.startMins - b.startMins);

      for (let index = 0; index < validEditings.length; index++) {
        const current = validEditings[index];
        let startMins = current.startMins;
        let endMins = current.endMins;
        let durationMins = current.durationMins;
        const items = [current.task];
        const infos = [current.info];

        while (index + 1 < validEditings.length) {
          const next = validEditings[index + 1];
          if (next.date !== current.date || next.pId !== current.pId) break;

          if (Math.abs(next.startMins - endMins) <= 60) {
            endMins = next.endMins;
            durationMins += next.durationMins;
            items.push(next.task);
            infos.push(next.info);
            index++;
          } else {
            break;
          }
        }

        const mergeField = (list, key) => [...new Set(list.map((item) => item[key]).filter(Boolean))].join(' / ');
        const startStr = `${String(Math.floor(startMins / 60)).padStart(2, '0')}:${String(startMins % 60).padStart(2, '0')}`;

        let targetScheduleId;
        const existingTask = scheduledTasks.value.find(
          (task) =>
            task.date === current.date &&
            task.startTime === startStr &&
            task.projectId === current.pId &&
            !task.musicianId &&
            (task.sessionId || 'S_DEFAULT') === currentSessionId.value,
        );

        if (existingTask) {
          targetScheduleId = existingTask.scheduleId;
        } else {
          targetScheduleId = Date.now() + Math.random();
          scheduledTasks.value.push({
            scheduleId: targetScheduleId,
            sessionId: currentSessionId.value,
            musicianId: null,
            projectId: current.pId,
            instrumentId: null,
            date: current.date,
            startTime: startStr,
            estDuration: formatSecsLocal(durationMins * 60),
            trackCount: 0,
            ratio: 1,
            statusOverride: 'completed',
            editInfo: {
              studio: mergeField(infos, 'studio'),
              engineer: mergeField(infos, 'engineer'),
            },
          });
        }

        items.forEach((item) => {
          taskToScheduleMap.set(item.id, targetScheduleId);
        });
      }
    }

    const updateIndexes = (id, type) => {
      let scheduleList = scheduledTasks.value.filter((task) => (task.sessionId || 'S_DEFAULT') === currentSessionId.value);
      let itemList = itemPool.value.filter((item) => (item.sessionId || 'S_DEFAULT') === currentSessionId.value);

      if (type === 'musician') {
        scheduleList = scheduleList.filter((task) => task.musicianId === id);
        itemList = itemList.filter((item) => item.musicianId === id);
      } else if (type === 'project') {
        scheduleList = scheduleList.filter((task) => task.projectId === id && !task.musicianId);
        itemList = itemList.filter((item) => item.projectId === id);
      } else if (type === 'instrument') {
        scheduleList = scheduleList.filter((task) => task.instrumentId === id);
        itemList = itemList.filter((item) => item.instrumentId === id);
      }

      if (scheduleList.length === 0) return;

      scheduleList.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
      const scheduleIdToIndex = {};
      scheduleList.forEach((task, index) => {
        scheduleIdToIndex[task.scheduleId] = index;
      });

      itemList.forEach((item) => {
        const targetScheduleId = taskToScheduleMap.get(item.id);
        if (targetScheduleId && scheduleIdToIndex[targetScheduleId] !== undefined) {
          item.sectionIndex = scheduleIdToIndex[targetScheduleId];
        }
      });
    };

    affectedMusicianIds.forEach((id) => updateIndexes(id, 'musician'));
    affectedProjectIds.forEach((id) => updateIndexes(id, 'project'));
    affectedInstrumentIds.forEach((id) => updateIndexes(id, 'instrument'));

    if (typeof autoUpdateEfficiency === 'function') {
      affectedMusicianIds.forEach((id) => autoUpdateEfficiency(id, 'musician', false));
    }

    if (validRecordings.length > 0 && typeof autoResizeSchedules === 'function') {
      autoResizeSchedules(Array.from(affectedTaskIds));
    }

    pushHistory();
    showCsvImportModal.value = false;
    openAlertModal('导入完成', `成功导入: 录音日程 ${validRecordings.length} 个, 编辑日程 ${validEditings.length} 个`);
  }

  function addDataToPrepared(targetList, rawRow, col, options = {}) {
    const projectName = rawRow[col.project]?.trim() || 'Unknown Project';
    const rawInstName = rawRow[col.instName]?.trim() || 'Unknown Inst';
    const instName = options.realCsvName || rawInstName;
    const displayInstName = options.displayCsvName || instName;
    const mergeName = options.forceName || displayInstName;
    const duration = options.overrideDuration || rawRow[col.duration]?.trim() || '00:00';
    const orchestration = options.injectedOrch || rawRow[col.orchestration]?.trim() || '';
    const playerName = rawRow[col.playerName]?.trim() || '';
    const groupName = rawRow[col.instFamily]?.trim() || '';
    const recDate = rawRow[col.recDate]?.trim();
    const recStart = rawRow[col.recStart]?.trim();
    const hasRecData = !!(recDate && recStart);
    const edtDate = rawRow[col.edtDate]?.trim();
    const edtStart = rawRow[col.edtStart]?.trim();
    const hasEditData = !!(edtDate && edtStart);

    const nextItem = {
      projectName,
      playerName,
      group: groupName,
      name_real: instName,
      name_display: displayInstName,
      name_merge: mergeName,
      duration,
      orchestration,
      recDate,
      recStart,
      recEnd: rawRow[col.recEnd]?.trim(),
      recStudio: rawRow[col.recStudio]?.trim(),
      recEngineer: rawRow[col.recEngineer]?.trim(),
      recOperator: col.recOperator > -1 ? rawRow[col.recOperator]?.trim() : '',
      recAssistant: col.recAssistant > -1 ? rawRow[col.recAssistant]?.trim() : '',
      recComments: col.recComments > -1 ? rawRow[col.recComments]?.trim() : '',
      edtDate,
      edtStart,
      edtEnd: rawRow[col.edtEnd]?.trim(),
      edtStudio: rawRow[col.edtStudio]?.trim(),
      edtEngineer: rawRow[col.edtEngineer]?.trim(),
      edtRest: rawRow[col.edtRest]?.trim(),
      hasRecData,
      hasEditData,
      selected: true,
      _raw: rawRow,
      isSplit: options.isSplit || false,
      partIndex: options.partIndex || 0,
    };

    const existingTask = itemPool.value.find((item) => {
      const itemProjectName = getNameById(item.projectId, 'project');
      const itemInstrumentName = item.name || getNameById(item.instrumentId, 'instrument');
      return itemProjectName === nextItem.projectName && itemInstrumentName === nextItem.name_merge;
    });

    nextItem.isDuplicate = !!existingTask;

    const { tasks: isTaskMode, time: isTimeMode, orch: isOrchMode } = csvImportConfig.importTypes;
    let recDiff = false;
    let edtDiff = false;

    if (existingTask) {
      const normalizeString = (value) => (value || '').toString().trim();
      const normalizeTime = (value) => (value ? value.substring(0, 5) : '');

      const hasTimeDiff =
        isTimeMode &&
        nextItem.duration &&
        parseTime(existingTask.musicDuration) !== parseTime(nextItem.duration);
      const hasOrchDiff =
        isOrchMode &&
        nextItem.orchestration &&
        normalizeString(existingTask.orchestration) !== normalizeString(nextItem.orchestration);
      nextItem.hasOrchDiff = hasOrchDiff;

      const normalizedRecDate = normalizeDate(nextItem.recDate);
      const normalizedEdtDate = normalizeDate(nextItem.edtDate);

      const recRecord = existingTask.records?.musician || {};
      const recTimeMatch =
        (!nextItem.recStart || normalizeTime(recRecord.recStart) === normalizeTime(nextItem.recStart)) &&
        (!nextItem.recEnd || normalizeTime(recRecord.recEnd) === normalizeTime(nextItem.recEnd));

      const recSchedule = scheduledTasks.value.find(
        (task) =>
          task.date === normalizedRecDate &&
          task.musicianId === existingTask.musicianId &&
          (task.sessionId || 'S_DEFAULT') === currentSessionId.value,
      );

      const recStudioMatch =
        !nextItem.recStudio ||
        (recSchedule && normalizeString(recSchedule.recordingInfo?.studio) === normalizeString(nextItem.recStudio));

      nextItem.hasRecTimeDiff = hasTimeDiff || !recTimeMatch || !recStudioMatch || !recSchedule;
      recDiff = nextItem.hasRecTimeDiff || hasOrchDiff;

      const editRecord = existingTask.records?.project || {};
      const editTimeMatch =
        (!nextItem.edtStart || normalizeTime(editRecord.recStart) === normalizeTime(nextItem.edtStart)) &&
        (!nextItem.edtEnd || normalizeTime(editRecord.recEnd) === normalizeTime(nextItem.edtEnd));

      const editSchedule = scheduledTasks.value.find(
        (task) =>
          task.date === normalizedEdtDate &&
          task.projectId === existingTask.projectId &&
          !task.musicianId &&
          (task.sessionId || 'S_DEFAULT') === currentSessionId.value,
      );

      const editStudioMatch =
        !nextItem.edtStudio ||
        (editSchedule && normalizeString(editSchedule.editInfo?.studio) === normalizeString(nextItem.edtStudio));

      nextItem.hasEdtTimeDiff = hasTimeDiff || !editTimeMatch || !editStudioMatch || !editSchedule;
      edtDiff = nextItem.hasEdtTimeDiff || hasOrchDiff;

      if (nextItem.hasRecTimeDiff) {
        console.group(`🔍 Debug: ${nextItem.name_merge} (检测到 UPDATE)`);
        console.log('项目/乐器:', nextItem.projectName, nextItem.name_real);
        console.log(`日期对比: CSV[${normalizedRecDate}] vs 数据库日程[${recSchedule ? recSchedule.date : '未找到'}]`);
        console.log(`ID匹配: CSV乐手[${nextItem.playerName}] -> ID[${existingTask.musicianId}]`);

        if (!recSchedule) {
          console.error('❌ 原因: 未找到对应的录音日程 (recSched is undefined)');
          console.log('   -> 请检查: 日期是否一致? Session是否一致? 乐手ID是否一致?');
        } else {
          if (!recTimeMatch) {
            console.warn('⚠️ 原因: 时间不匹配');
            console.log(`   CSV : ${normalizeTime(nextItem.recStart)} - ${normalizeTime(nextItem.recEnd)}`);
            console.log(`   DB  : ${normalizeTime(recRecord.recStart)} - ${normalizeTime(recRecord.recEnd)}`);
          }
          if (!recStudioMatch) {
            console.warn(`⚠️ 原因: 录音棚不匹配 (CSV: ${nextItem.recStudio} vs DB: ${recSchedule.recordingInfo?.studio})`);
          }
          if (hasTimeDiff) console.warn('⚠️ 原因: 时长(Duration)有变化');
        }
        console.groupEnd();
      }

      if (nextItem.hasEdtTimeDiff) {
        console.group(`🎬 Edit Debug: ${nextItem.projectName} (状态: UPDATE)`);
        console.log('项目名称:', nextItem.projectName);
        console.log(`日期对比: CSV[${normalizedEdtDate}] vs DB[${editSchedule ? editSchedule.date : '❌ 未找到日程'}]`);

        if (!editSchedule) {
          console.error('❌ 主要原因: 数据库中未找到对应的编辑日程');
          console.log('   可能原因:');
          console.log(`   1. 日期不匹配 (CSV: ${normalizedEdtDate})`);
          console.log('   2. 这是一个新日期的任务，数据库里还没排');
          console.log(`   3. Session ID 不匹配 (当前: ${currentSessionId.value})`);
        } else {
          if (!editTimeMatch) {
            console.warn('⚠️ 原因: 时间不匹配');
            console.log(`   CSV要求: ${nextItem.edtStart || '(空)'} - ${nextItem.edtEnd || '(空)'}`);
            console.log(`   DB现有 : ${normalizeTime(editRecord.recStart)} - ${normalizeTime(editRecord.recEnd)}`);
          }
          if (!editStudioMatch) {
            console.warn('⚠️ 原因: 录音棚不匹配');
            console.log(`   CSV要求: '${nextItem.edtStudio}'`);
            console.log(`   DB现有 : '${editSchedule.editInfo?.studio}'`);
          }
          if (hasTimeDiff) console.warn('⚠️ 原因: 乐曲时长(Duration)发生了变化');
          if (hasOrchDiff) console.warn('⚠️ 原因: 配器(Orchestration)发生了变化');
        }
        console.groupEnd();
      }
    }

    const calculateStatus = (hasData, hasSpecificDiff) => {
      if (!hasData) return 'SKIP';
      if (nextItem.isDuplicate) {
        return hasSpecificDiff ? 'UPDATE' : 'SKIP';
      }
      return isTaskMode ? 'NEW' : 'SKIP';
    };

    nextItem.recStatusText = calculateStatus(hasRecData, recDiff);
    nextItem.editStatusText = calculateStatus(hasEditData, edtDiff);

    const currentStatus = activeImportTab.value === 'rec' ? nextItem.recStatusText : nextItem.editStatusText;
    nextItem.selected = currentStatus !== 'SKIP';

    targetList.push(nextItem);
  }

  return {
    groupedCsvData,
    isAllSelected,
    calculateRowStatusText,
    toggleCsvSelection,
    isGroupSelected,
    toggleGroupSelection,
    toggleAllRows,
    parseCSVLine,
    parseCSVRobust,
    handleCSVImport,
    refreshCsvPreview,
    refreshCsvStatus,
    confirmCsvImport,
    addDataToPrepared,
  };
}
