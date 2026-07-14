import { computed, nextTick, reactive, watch } from 'vue';

export function registerMidiManagerFeature(context) {
  const { refs, state, utils, actions } = context;
  const {
    showMidiManager,
    managingProject,
    activeMidiGroupRow,
    midiGroupPos,
    midiGroupSearchQuery,
    newItem,
    itemPool,
    scheduledTasks,
    currentSessionId,
    showMobileTaskInput,
    isMobile,
  } = refs;
  const { settings } = state;
  const { calculateEstTime, getNameById } = utils;
  const {
    getAvailableInstrumentGroups,
    openConfirmModal,
    pushHistory,

  } = actions;

  const midiManagerExpandedGroups = reactive(new Set());

  const toggleMidiManagerGroup = (name) => {
    if (midiManagerExpandedGroups.has(name)) {
      midiManagerExpandedGroups.delete(name);
    } else {
      midiManagerExpandedGroups.add(name);
    }
  };

  const projectMidiList = computed(() => {
    if (!managingProject.value || !managingProject.value.midiData) return [];

    const list = [];
    const map = managingProject.value.midiData;

    for (const [instId, data] of Object.entries(map)) {
      const inst = settings.instruments.find((item) => item.id === instId);
      const instName = inst ? inst.name : '未知乐器';
      const group = inst ? inst.group : '';

      if (Array.isArray(data)) {
        data.forEach((subItem, index) => {
          list.push({
            instId,
            instName: subItem.name || `${instName} #${index + 1}`,
            group,
            duration: subItem.duration,
            isSubItem: true,
            subIndex: index,
            order: subItem.order !== undefined ? subItem.order : 99999,
          });
        });
      } else {
        list.push({
          instId,
          instName,
          group,
          duration: data,
          order: 99999,
        });
      }
    }

    return list.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.instName.localeCompare(b.instName, 'zh-CN');
    });
  });

  const projectMidiGroups = computed(() => {
    const flatList = projectMidiList.value;
    if (flatList.length === 0) return [];

    const groups = {};
    const defaultKey = 'Unassigned';

    flatList.forEach((item) => {
      const group = item.group && item.group.trim() ? item.group : defaultKey;
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === defaultKey) return 1;
      if (b === defaultKey) return -1;
      return a.localeCompare(b, 'zh-CN');
    });

    return sortedKeys.map((key) => ({
      name: key,
      items: groups[key],
    }));
  });

  watch(showMidiManager, (value) => {
    if (value) {
      midiManagerExpandedGroups.clear();
    }
  });

  const openMidiGroupDropdown = (event, instId) => {
    if (activeMidiGroupRow.value === instId) {
      activeMidiGroupRow.value = null;
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    midiGroupPos.top = rect.bottom + 5;
    midiGroupPos.left = rect.left;
    midiGroupPos.width = rect.width;

    activeMidiGroupRow.value = instId;
    midiGroupSearchQuery.value = '';

    nextTick(() => {
      const input = document.getElementById('midi-group-search-input');
      if (input) input.focus();
    });
  };

  const openMidiManager = (project) => {
    managingProject.value = project;
    if (!project.midiData) {
      project.midiData = {};
    }
    showMidiManager.value = true;
  };

  const updateMidiDuration = (instId, subIndex, newVal) => {
    if (!managingProject.value) return;

    const projectId = managingProject.value.id;
    const data = managingProject.value.midiData[instId];
    const updatedDuration = newVal;

    if (Array.isArray(data)) {
      if (data[subIndex]) {
        data[subIndex].duration = newVal;
      }
    } else if (newVal) {
      managingProject.value.midiData[instId] = newVal;
    } else {
      delete managingProject.value.midiData[instId];
      return;
    }

    const relatedTasks = itemPool.value.filter((task) =>
      (task.sessionId || 'S_DEFAULT') === currentSessionId.value &&
      task.projectId === projectId &&
      task.instrumentId === instId,
    );
    const targetTask = relatedTasks[subIndex];

    if (targetTask) {
      targetTask.musicDuration = updatedDuration;

      const currentRatio = targetTask.ratio || 20;
      const newEst = calculateEstTime(updatedDuration, currentRatio);
      targetTask.estDuration = newEst;

      scheduledTasks.value.forEach((schedule) => {
        if (schedule.templateId === targetTask.id) {
          schedule.musicDuration = updatedDuration;
          schedule.estDuration = newEst;
        }
      });


    }

    pushHistory();
  };

  const removeMidiMapping = (instId, subIndex) => {
    if (!managingProject.value) return;

    const data = managingProject.value.midiData[instId];

    if (Array.isArray(data)) {
      if (subIndex !== undefined && subIndex >= 0) {
        data.splice(subIndex, 1);
      }

      if (data.length === 0) {
        delete managingProject.value.midiData[instId];
      }
    } else {
      delete managingProject.value.midiData[instId];
    }

    pushHistory();
  };

  const clearProjectMidi = () => {
    if (!managingProject.value) return;

    openConfirmModal(
      '清空映射',
      `确定要清空项目 "${managingProject.value.name}" 的所有 MIDI 时长数据吗？`,
      () => {
        managingProject.value.midiData = {};
        pushHistory();

      },
      true,
    );
  };

  const updateInstrumentGroup = (instId, newGroup) => {
    const finalGroup = newGroup.trim();
    if (!finalGroup) return;

    const inst = settings.instruments.find((item) => item.id === instId);
    if (inst) {
      inst.group = finalGroup;
      midiManagerExpandedGroups.add(finalGroup);
      pushHistory();
      activeMidiGroupRow.value = null;


    }
  };

  const selectMidiGroup = (instId, groupName) => {
    updateInstrumentGroup(instId, groupName);
    activeMidiGroupRow.value = null;
  };

  const filteredMidiGroups = computed(() => {
    const query = midiGroupSearchQuery.value.toLowerCase().trim();
    const groups = getAvailableInstrumentGroups()?.value || [];
    return groups.filter((group) => group.toLowerCase().includes(query));
  });

  const isOverlapping = (startA, endA, startB, endB) => (
    Math.max(startA, startB) < Math.min(endA, endB)
  );

  const calculateEffectiveDuration = (midi, track) => {
    if (track.notes.length === 0) return { bars: 0, seconds: 0, rawSeconds: 0 };

    let lastNoteOffTick = 0;
    track.notes.forEach((note) => {
      const end = note.ticks + note.durationTicks;
      if (end > lastNoteOffTick) lastNoteOffTick = end;
    });

    let timeSignatures = midi.header.timeSignatures || [];
    if (timeSignatures.length === 0) {
      timeSignatures = [{ ticks: 0, timeSignature: [4, 4] }];
    }
    timeSignatures.sort((a, b) => a.ticks - b.ticks);

    const ppq = midi.header.ppq || 480;
    let currentTick = 0;
    let sigIndex = 0;
    let validBarsCount = 0;
    let validSeconds = 0;

    while (currentTick < lastNoteOffTick) {
      while (
        sigIndex + 1 < timeSignatures.length &&
        timeSignatures[sigIndex + 1].ticks <= currentTick
      ) {
        sigIndex++;
      }

      const currentSig = timeSignatures[sigIndex];
      const [num, den] = currentSig.timeSignature;
      const ticksPerBar = (ppq * 4 / den) * num;
      const barStartTick = currentTick;
      const barEndTick = currentTick + ticksPerBar;

      const hasNote = track.notes.some((note) => {
        const noteStart = note.ticks;
        const noteEnd = note.ticks + note.durationTicks;
        return isOverlapping(noteStart, noteEnd, barStartTick, barEndTick);
      });

      if (hasNote) {
        validBarsCount++;
        const startSec = midi.header.ticksToSeconds(barStartTick);
        const endSec = midi.header.ticksToSeconds(barEndTick);
        validSeconds += endSec - startSec;
      }

      currentTick += ticksPerBar;
    }

    const totalRawSeconds = midi.header.ticksToSeconds(lastNoteOffTick);
    if (validSeconds === 0 && track.notes.length > 0) validSeconds = 1;

    return {
      bars: validBarsCount,
      seconds: validSeconds,
      rawSeconds: totalRawSeconds,
    };
  };

  const convertTicksToSeconds = (midi, targetTick) => {
    const tempos = midi.header.tempos || [];
    if (tempos.length === 0) {
      const ppq = midi.header.ppq || 480;
      const secondsPerTick = 60 / 120 / ppq;
      return targetTick * secondsPerTick;
    }

    let currentTick = 0;
    let currentTime = 0;

    for (let index = 0; index < tempos.length; index++) {
      const tempo = tempos[index];
      const nextTempo = tempos[index + 1];
      const segmentEndTick = nextTempo ? Math.min(targetTick, nextTempo.ticks) : targetTick;

      if (tempo.ticks >= targetTick) break;

      const startTick = Math.max(currentTick, tempo.ticks);
      const deltaTicks = segmentEndTick - startTick;

      if (deltaTicks > 0) {
        const secondsPerTick = 60 / tempo.bpm / midi.header.ppq;
        currentTime += deltaTicks * secondsPerTick;
        currentTick += deltaTicks;
      }

      if (currentTick >= targetTick) break;
    }

    if (currentTick < targetTick) {
      const lastTempo = tempos[tempos.length - 1];
      const secondsPerTick = 60 / lastTempo.bpm / midi.header.ppq;
      currentTime += (targetTick - currentTick) * secondsPerTick;
    }

    return currentTime;
  };

  const calculateAccurateDuration = (midi, track) => {
    const ppq = midi.header.ppq || 480;
    const timeSig = midi.header.timeSignatures[0] || { timeSignature: [4, 4] };
    const [num, den] = timeSig.timeSignature;
    const ticksPerBar = (ppq * 4 / den) * num;

    let maxTick = 0;
    track.notes.forEach((note) => {
      const end = note.ticks + note.durationTicks;
      if (end > maxTick) maxTick = end;
    });

    const totalBars = Math.ceil(maxTick / ticksPerBar);
    const quantizedTotalTicks = totalBars * ticksPerBar;
    const durationSeconds = convertTicksToSeconds(midi, quantizedTotalTicks);

    return {
      bars: totalBars,
      seconds: durationSeconds,
      rawEndTick: maxTick,
    };
  };

  const calculateQuantizedDuration = (midi, track) => {
    let lastNoteOffTick = 0;
    track.notes.forEach((note) => {
      const end = note.ticks + note.durationTicks;
      if (end > lastNoteOffTick) lastNoteOffTick = end;
    });

    if (lastNoteOffTick === 0) return { bars: 0, seconds: 0, rawEndTick: 0 };

    let timeSignatures = midi.header.timeSignatures || [];
    if (timeSignatures.length === 0) {
      timeSignatures = [{ ticks: 0, timeSignature: [4, 4] }];
    }
    timeSignatures.sort((a, b) => a.ticks - b.ticks);

    let currentTick = 0;
    let barCount = 0;
    let sigIndex = 0;
    const ppq = midi.header.ppq || 480;

    while (currentTick < lastNoteOffTick) {
      while (
        sigIndex + 1 < timeSignatures.length &&
        timeSignatures[sigIndex + 1].ticks <= currentTick
      ) {
        sigIndex++;
      }

      const currentSig = timeSignatures[sigIndex];
      const [num, den] = currentSig.timeSignature;
      const ticksPerBar = (ppq * 4 / den) * num;

      currentTick += ticksPerBar;
      barCount++;
    }

    let quantizedSeconds = midi.header.ticksToSeconds(currentTick);
    const rawSeconds = midi.header.ticksToSeconds(lastNoteOffTick);

    if (quantizedSeconds === 0 && currentTick > 0) {
      const estimatedSecPerTick = 60 / 120 / 480;
      quantizedSeconds = currentTick * estimatedSecPerTick;
    }

    return {
      bars: barCount,
      seconds: quantizedSeconds,
      rawSeconds,
    };
  };

  const autoFillMidiDuration = () => {
    const newPid = newItem.projectId;
    const newIid = newItem.instrumentId;

    if (!newPid || !newIid) return;

    const project = settings.projects.find((item) => item.id === newPid);
    let midiList = [];

    if (project && project.midiData) {
      const midiEntry = project.midiData[newIid];
      if (midiEntry) {
        if (Array.isArray(midiEntry)) {
          midiList = midiEntry;
        } else if (typeof midiEntry === 'string') {
          midiList = [{ name: getNameById(newIid, 'instrument'), duration: midiEntry }];
        }
      }
    }

    if (midiList.length === 0) {
      newItem.musicDuration = '';
      newItem.estDuration = '00:00:00';
      newItem._autoSuggestedName = null;
      return;
    }

    const existingTasks = itemPool.value.filter((task) =>
      (task.sessionId || 'S_DEFAULT') === currentSessionId.value &&
      task.projectId === newPid &&
      task.instrumentId === newIid,
    );

    let targetIndex = existingTasks.length;
    if (targetIndex >= midiList.length) {
      targetIndex = midiList.length - 1;
    }

    const targetData = midiList[targetIndex];
    newItem.musicDuration = targetData.duration;

    const baseInstName = getNameById(newIid, 'instrument');
    if (targetData.name && targetData.name !== baseInstName) {
      newItem._autoSuggestedName = targetData.name;
    } else {
      newItem._autoSuggestedName = null;
    }

    let ratio = 20;
    if (newItem.musicianId) {
      const musician = settings.musicians.find((item) => item.id === newItem.musicianId);
      if (musician && musician.defaultRatio) ratio = musician.defaultRatio;
    }
    newItem.ratio = ratio;
    newItem.estDuration = calculateEstTime(newItem.musicDuration, ratio);
  };

  watch(() => [newItem.projectId, newItem.instrumentId], () => {
    autoFillMidiDuration();
  });

  watch(showMobileTaskInput, (isOpen) => {
    if (isOpen) {
      autoFillMidiDuration();
    }
  });

  return {
    midiManagerExpandedGroups,
    toggleMidiManagerGroup,
    projectMidiList,
    projectMidiGroups,
    openMidiGroupDropdown,
    selectMidiGroup,
    openMidiManager,
    updateMidiDuration,
    removeMidiMapping,
    clearProjectMidi,
    updateInstrumentGroup,
    filteredMidiGroups,
    isOverlapping,
    calculateEffectiveDuration,
    calculateAccurateDuration,
    convertTicksToSeconds,
    calculateQuantizedDuration,
    autoFillMidiDuration,
  };
}
