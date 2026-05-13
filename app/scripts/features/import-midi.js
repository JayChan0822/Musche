const { computed } = Vue;

export function registerImportMidiFeature(context) {
  const { refs, state, utils, actions } = context;
  const {
    settings,
    managingProject,
    showMidiImportModal,
    midiImportData,
    midiBpm,
    midiTempoMap,
    midiTimeSigs,
    midiViewMode,
    midiTimeSig,
  } = refs;
  const {
    buildTempoMap,
    buildTimeSigMap,
    extractNotesFromJZZTrack,
    calculateBarQuantizedDuration,
    normalizeForMatch,
    findGroupSmart,
    generateUniqueId,
    generateRandomHexColor,
    formatSecs,
  } = utils;
  const { openAlertModal, pushHistory, triggerTouchHaptic } = actions;

  const availableInstrumentGroups = computed(() => {
    const groups = new Set(['Unassigned']);

    settings.instruments.forEach((item) => {
      if (item.group) groups.add(item.group);
    });

    ['Strings', 'Brass', 'Woodwinds', 'Percussion', 'Keys', 'Plucks', 'Vocal', 'Synth'].forEach((group) => {
      groups.add(group);
    });

    if (showMidiImportModal.value) {
      midiImportData.value.forEach((track) => {
        if (track.group && track.group.trim()) {
          groups.add(track.group.trim());
        }
      });
    }

    return Array.from(groups).sort();
  });

  const midiGroupData = computed(() => {
    const groupsMap = {};

    midiImportData.value.forEach((track) => {
      const groupName = track.group && track.group.trim() !== '' ? track.group : 'Unassigned';
      if (!groupsMap[groupName]) {
        groupsMap[groupName] = { name: groupName, items: [] };
      }
      groupsMap[groupName].items.push(track);
    });

    return Object.values(groupsMap)
      .map((group) => {
        const selectedItems = group.items.filter((item) => item.selected);
        const hasSelection = selectedItems.length > 0;

        let finalDuration = 0;
        let totalNotes = 0;
        let maxBars = 0;

        if (hasSelection && midiTempoMap.value && midiTimeSigs.value) {
          const allGroupNotes = [];
          selectedItems.forEach((item) => {
            totalNotes += item.noteCount;
            if (item.notes) allGroupNotes.push(...item.notes);
          });

          if (allGroupNotes.length > 0) {
            allGroupNotes.sort((a, b) => a.ticks - b.ticks);
            const analysis = calculateBarQuantizedDuration(allGroupNotes, midiTempoMap.value, midiTimeSigs.value);
            finalDuration = analysis.seconds;
            maxBars = analysis.bars;
          }
        } else {
          selectedItems.forEach((item) => {
            finalDuration = Math.max(finalDuration, item.quantizedDuration);
            totalNotes += item.noteCount;
            maxBars = Math.max(maxBars, item.bars || 0);
          });
        }

        const genericInstrument = settings.instruments.find(
          (item) =>
            item.name.toLowerCase() === group.name.toLowerCase() ||
            (item.group === group.name && item.name.toLowerCase().includes('section')),
        );

        return {
          id: `GRP_${group.name}`,
          name: group.name,
          originalName: group.name,
          instrumentId: genericInstrument ? genericInstrument.id : '',
          createNew: !genericInstrument,
          quantizedDuration: finalDuration,
          bars: maxBars,
          noteCount: totalNotes,
          group: group.name,
          selected: hasSelection,
          items: group.items,
          isGroup: true,
          description: `${selectedItems.length} / ${group.items.length} tracks`,
        };
      })
      .sort((a, b) => {
        if (a.name === 'Unassigned') return 1;
        if (b.name === 'Unassigned') return -1;
        return a.name.localeCompare(b.name, 'zh-CN');
      });
  });

  const currentMidiDisplayList = computed(() =>
    midiViewMode.value === 'groups' ? midiGroupData.value : midiImportData.value,
  );

  function triggerMidiImportForProject() {
    const input = document.getElementById('midi-import-input');
    if (input) {
      input.value = '';
      input.click();
    }
  }

  function triggerMidiImport() {
    const input = document.getElementById('midi-import-input');
    if (input) {
      input.value = '';
      input.click();
    }
  }

  function handleMidiFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!managingProject.value) {
      if (settings.projects.length > 0) {
        managingProject.value = settings.projects[0];
        if (!managingProject.value.midiData) {
          managingProject.value.midiData = {};
        }
      } else {
        openAlertModal('无法导入', '请先至少创建一个项目 (Project) 后再导入 MIDI。');
        event.target.value = '';
        return;
      }
    }

    processMidiFile(file);
    event.target.value = '';
  }

  function processMidiFile(file) {
    if (typeof JZZ === 'undefined' || typeof JZZ.MIDI.SMF === 'undefined') {
      openAlertModal('库丢失', 'JZZ MIDI 库未加载，请检查网络。');
      return;
    }

    const getMatchName = (name) => {
      if (!name) return '';
      return name.replace(/[_\s-]*\d+$/, '').trim();
    };

    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (loadEvent) => {
      try {
        const data = loadEvent.target.result;
        const smf = JZZ.MIDI.SMF(data);

        const tempoMap = buildTempoMap(smf);
        const timeSigs = buildTimeSigMap(smf);
        midiTempoMap.value = tempoMap;
        midiTimeSigs.value = timeSigs;

        const firstTempo = tempoMap.events.find((event) => event.bpm) || { bpm: 120, mpb: 500000 };
        midiBpm.value = Math.round(60000000 / firstTempo.mpb);
        midiTimeSig.value = timeSigs[0].timeSignature;

        const mergedMap = {};

        smf.forEach((track, index) => {
          let rawName = '';
          track.forEach((event) => {
            if (event.ff === 0x03) rawName = event.dd;
          });
          if (!rawName) rawName = `Track ${index + 1}`;

          let displayName = rawName.replace(/\0/g, '').trim();
          displayName = displayName
            .replace(/[\s\-_]?Flat/gi, 'b')
            .replace(/[\s\-_]?Sharp/gi, '#')
            .replace(/♭/g, 'b')
            .replace(/♯/g, '#');

          const trackNotes = extractNotesFromJZZTrack(track);
          if (trackNotes.length === 0 && !displayName) return;

          if (!mergedMap[displayName]) {
            mergedMap[displayName] = {
              name: displayName,
              notes: [],
              firstTrackIndex: index,
              trackCount: 0,
            };
          }

          mergedMap[displayName].notes.push(...trackNotes);
          mergedMap[displayName].trackCount++;
        });

        const processedTracks = [];
        let uniqueIdCounter = 0;

        for (const name in mergedMap) {
          const groupData = mergedMap[name];
          const notes = groupData.notes;
          const exactName = normalizeForMatch(groupData.name);
          const strippedName = normalizeForMatch(getMatchName(groupData.name));

          let matchedInstrumentId = '';
          let matchedGroup = findGroupSmart(groupData.name);

          let found = settings.instruments.find((item) => normalizeForMatch(item.name) === exactName);
          if (!found) {
            found = settings.instruments.find((item) => normalizeForMatch(item.name) === strippedName);
          }
          if (!found) {
            found = settings.instruments.find((item) => {
              const instrumentName = normalizeForMatch(item.name);
              return instrumentName.includes(strippedName) && strippedName.length > 2;
            });
          }

          if (found) {
            matchedInstrumentId = found.id;
            if (found.group) matchedGroup = found.group;
          }

          let analysis = { seconds: 0, rawSeconds: 0, bars: 0 };
          if (notes.length > 0) {
            analysis = calculateBarQuantizedDuration(notes, tempoMap, timeSigs);
          }

          const isTechnicalEmpty = notes.length === 0;
          const cleanNameForCreation = groupData.name.replace(/\s+\d+$/, '').trim();

          processedTracks.push({
            id: uniqueIdCounter++,
            name: groupData.name,
            originalName: groupData.name,
            suggestedInstName: cleanNameForCreation,
            instrumentId: matchedInstrumentId,
            createNew: !matchedInstrumentId && !isTechnicalEmpty,
            notes,
            rawDuration: analysis.rawSeconds,
            quantizedDuration: analysis.seconds,
            bars: analysis.bars,
            noteCount: notes.length,
            group: matchedGroup || 'Unassigned',
            selected: !isTechnicalEmpty,
            description: groupData.trackCount > 1 ? `Merged ${groupData.trackCount} duplicate tracks` : '',
            _sortIndex: groupData.firstTrackIndex,
          });
        }

        processedTracks.sort((a, b) => a._sortIndex - b._sortIndex);
        if (processedTracks.length === 0) {
          openAlertModal('无数据', '未解析到任何有效轨道。');
          return;
        }

        midiImportData.value = processedTracks;
        showMidiImportModal.value = true;
      } catch (error) {
        console.error('JZZ Parse Error:', error);
        openAlertModal('解析错误', `文件解析失败: ${error.message}`);
      }
    };
  }

  function onImportInstChange(track) {
    track.createNew = false;
    if (track.instrumentId) {
      const instrument = settings.instruments.find((item) => item.id === track.instrumentId);
      if (instrument) track.group = instrument.group || 'Unassigned';
    }
  }

  function getSmartName(row) {
    if (!row) return 'New Instrument';
    if (row.isGroup) return row.name;
    if (row.name !== row.originalName) return row.name;
    return row.suggestedInstName || row.name;
  }

  function confirmMidiImport() {
    if (!managingProject.value) {
      openAlertModal('错误', '未找到关联的项目，无法保存数据。');
      return;
    }

    if (!managingProject.value.midiData) managingProject.value.midiData = {};

    let count = 0;
    const sourceList = midiViewMode.value === 'groups' ? midiGroupData.value : midiImportData.value;
    const tempMap = {};

    sourceList.forEach((row) => {
      if (!row.selected) return;

      let targetInstrumentId = row.instrumentId;

      if (!targetInstrumentId && row.createNew) {
        const finalName = row.name !== row.originalName ? row.name : row.suggestedInstName || row.name;
        const existing = settings.instruments.find((item) => item.name === finalName);

        if (existing) {
          targetInstrumentId = existing.id;
        } else {
          const newId = generateUniqueId('I');
          settings.instruments.push({
            id: newId,
            name: finalName,
            group: row.group || 'Unassigned',
            color: generateRandomHexColor(),
          });
          targetInstrumentId = newId;
        }
      }

      if (!targetInstrumentId) return;

      if (!tempMap[targetInstrumentId]) tempMap[targetInstrumentId] = [];
      tempMap[targetInstrumentId].push({
        name: row.name,
        duration: formatSecs(row.quantizedDuration),
        _sortIndex: row._sortIndex || 0,
      });
      count++;
    });

    Object.entries(tempMap).forEach(([instId, items]) => {
      items.sort((a, b) => a._sortIndex - b._sortIndex);
      managingProject.value.midiData[instId] = items.map((item) => ({
        name: item.name,
        duration: item.duration,
        order: item._sortIndex,
      }));
    });

    pushHistory();
    triggerTouchHaptic('Success');
    showMidiImportModal.value = false;
    openAlertModal('导入成功', `已导入 ${count} 条轨道数据 (支持分部)。`);
  }

  return {
    availableInstrumentGroups,
    midiGroupData,
    currentMidiDisplayList,
    triggerMidiImportForProject,
    triggerMidiImport,
    handleMidiFile,
    processMidiFile,
    onImportInstChange,
    getSmartName,
    confirmMidiImport,
  };
}
