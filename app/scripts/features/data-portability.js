import { ref } from 'vue';

function defaultDownloadTextFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (mimeType === 'application/json') URL.revokeObjectURL(url);
}

function defaultReadFileAsText(file, encoding, onLoad) {
  const reader = new FileReader();
  reader.onload = onLoad;
  reader.readAsText(file, encoding);
}

export function registerDataPortabilityFeature(context) {
  const { refs, state, utils, actions, ioState = {} } = context;
  const { itemPool, scheduledTasks, currentSessionId } = refs;
  const { settings } = state;
  const { parseTime, getNameById, getDate = () => new Date() } = utils;
  const {
    openInputModal,
    openAlertModal,
    pushHistory,
    downloadTextFile = defaultDownloadTextFile,
    getElementById = (id) => document.getElementById(id),
    readFileAsText = defaultReadFileAsText,
    logError = (error) => console.error(error),
  } = actions;

  const showImportModal = ioState.showImportModal || ref(false);

  const exportToICS = () => {
    if (scheduledTasks.value.length === 0) {
      openAlertModal('日程表是空的');
      return;
    }

    openInputModal('导出日历 (ICS)', 'recording_schedule.ics', '请输入文件名', (inputName) => {
      if (!inputName) return;

      let fileName = inputName;
      if (!fileName.toLowerCase().endsWith('.ics')) fileName += '.ics';

      let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AudioScheduler//CN\n';
      scheduledTasks.value.forEach((task) => {
        const dStr = task.date.replace(/-/g, '');
        const [sh, sm] = task.startTime.split(':').map(Number);
        const startStr = `${String(sh).padStart(2, '0')}${String(sm).padStart(2, '0')}00`;
        const durSec = parseTime(task.estDuration);
        const endD = new Date(new Date(`${task.date}T${task.startTime}`).getTime() + durSec * 1000);
        const endStr = `${endD.getFullYear()}${String(endD.getMonth() + 1).padStart(2, '0')}${String(endD.getDate()).padStart(2, '0')}T${String(endD.getHours()).padStart(2, '0')}${String(endD.getMinutes()).padStart(2, '0')}00`;

        const musicianName = getNameById(task.musicianId, 'musician');
        const instrumentName = getNameById(task.instrumentId, 'instrument');
        const projectName = getNameById(task.projectId, 'project');

        ics += `BEGIN:VEVENT\nUID:${task.scheduleId}\nDTSTAMP:${dStr}T${startStr}\nDTSTART:${dStr}T${startStr}\nDTEND:${endStr}\nSUMMARY:${musicianName} - ${instrumentName} (${projectName})\nDESCRIPTION:录制时长:${task.estDuration}\nEND:VEVENT\n`;
      });
      ics += 'END:VCALENDAR';

      downloadTextFile(ics, fileName, 'text/calendar');
    });
  };

  const exportJSON = () => {
    const now = getDate();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const defaultName = `backup_${dateStr}.json`;

    openInputModal('备份数据 (JSON)', defaultName, '请输入文件名', (inputName) => {
      if (!inputName) return;

      let fileName = inputName;
      if (!fileName.toLowerCase().endsWith('.json')) fileName += '.json';

      const data = {
        pool: itemPool.value,
        tasks: scheduledTasks.value,
        settings,
      };
      downloadTextFile(JSON.stringify(data, null, 2), fileName, 'application/json');
    }, '文件将保存到您的下载文件夹');
  };

  const importJSON = () => {
    showImportModal.value = true;
  };

  const triggerFileSelect = () => {
    const input = getElementById('json-upload');
    if (input) {
      input.value = '';
      input.click();
    }
  };

  const restoreImportedSession = (importedSettings) => {
    if (!currentSessionId || !Array.isArray(settings.sessions) || settings.sessions.length === 0) return;

    const lastSessionId = importedSettings?.lastSessionId;
    const restoredSession = settings.sessions.find((session) => session.id === lastSessionId);
    currentSessionId.value = restoredSession ? restoredSession.id : settings.sessions[0].id;
  };

  const handleJSONFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    readFileAsText(file, 'UTF-8', (ev) => {
      try {
        const data = JSON.parse(ev.target.result);

        if (!data.pool && !data.tasks && !data.settings) {
          throw new Error('无效的备份文件');
        }

        pushHistory();
        itemPool.value = data.pool || [];
        scheduledTasks.value = data.tasks || [];
        if (data.settings) Object.assign(settings, data.settings);
        restoreImportedSession(data.settings);
        pushHistory();

        showImportModal.value = false;
        openAlertModal('导入成功', '数据已成功恢复！');
      } catch (err) {
        logError(err);
        openAlertModal('导入失败', '文件格式错误或已损坏。');
      }
    });
    e.target.value = '';
  };

  return {
    showImportModal,
    exportToICS,
    exportJSON,
    importJSON,
    triggerFileSelect,
    handleJSONFile,
  };
}
