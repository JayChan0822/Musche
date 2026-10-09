export function registerCreditsFeature(context) {
  const { refs, state, utils, actions } = context;
  const {
    itemPool,
    scheduledTasks,
    currentSessionId,
    showCreditModal,
    generatedCreditText,
  } = refs;
  const { settings } = state;
  const { getNameById } = utils;
  const { openAlertModal } = actions;

  const splitCreditNames = (value) =>
    (value || '').split(/[\/,\r\n]|\^\|/).map((name) => name.trim()).filter(Boolean);

  const createProjectData = (projectId) => ({
    name: getNameById(projectId, 'project'),
    orch: {
      strings: new Set(),
      woodwinds: {},
      brass: {},
      percussion: {},
      others: {},
    },
    orchTech: {
      studios: new Set(),
      engineers: new Set(),
      operators: new Set(),
      assistants: new Set(),
    },
    solo: {},
    soloTech: {
      studios: new Set(),
      engineers: new Set(),
      operators: new Set(),
      assistants: new Set(),
    },
    editors: new Set(),
  });

  const getOrchCategory = (instrumentName, musicianName) => {
    const instrument = (instrumentName || '').toLowerCase();
    const musician = (musicianName || '').toLowerCase();

    if (/\b(violin|viola|cello|double\s*bass|contrabass)\b/.test(instrument)) return 'strings';
    if (/\b(flute|piccolo|oboe|english\s*horn|cor\s*anglais|clarinet|bassoon|contrabassoon)\b/.test(instrument)) return 'woodwinds';
    if (/\b(horn|trumpet|trombone|tuba|euphonium)\b/.test(instrument)) return 'brass';
    if (/\b(timpani|snare|cymbal|gong|mark\s*tree|glockenspiel|xylophone|marimba|vibraphone|chimes|tubular\s*bells)\b/.test(instrument)) return 'percussion';
    if (/\b(harp|celesta|celeste|piano|organ|harpsichord)\b/.test(instrument)) return 'others';

    if (musician.includes('string')) return 'strings';
    if (musician.includes('woodwind')) return 'woodwinds';
    if (musician.includes('brass')) return 'brass';
    if (musician.includes('percussion') || musician.includes('perc ')) return 'percussion';

    return null;
  };

  const addToMap = (targetMap, instrumentLabel, playerName) => {
    if (!playerName || playerName === '未知演奏员' || playerName === '未选择') return;

    splitCreditNames(playerName).forEach((name) => {
      if (!targetMap[instrumentLabel]) targetMap[instrumentLabel] = new Set();
      targetMap[instrumentLabel].add(name);
    });
  };

  const addTechInfo = (targetTech, info) => {
    if (!info) return;

    splitCreditNames(info.studio).forEach((name) => targetTech.studios.add(name));
    splitCreditNames(info.engineer).forEach((name) => targetTech.engineers.add(name));
    splitCreditNames(info.operator).forEach((name) => targetTech.operators.add(name));
    splitCreditNames(info.assistant).forEach((name) => targetTech.assistants.add(name));
  };

  const addSessionItemsToCredits = (projectDataMap, sessionItems) => {
    const getProjectData = (projectId) => {
      if (!projectDataMap[projectId]) projectDataMap[projectId] = createProjectData(projectId);
      return projectDataMap[projectId];
    };

    sessionItems.forEach((item) => {
      if (item.isSkipped) return;

      const projectId = item.projectId || 'Unassigned';
      const projectData = getProjectData(projectId);
      const systemInstrumentName = getNameById(item.instrumentId, 'instrument');
      const musicianName = getNameById(item.musicianId, 'musician');
      const category = getOrchCategory(systemInstrumentName, musicianName);
      let hasDetailedInfo = false;

      if (category) {
        if (category === 'percussion') {
          const musicianSettings = settings.musicians.find((musician) => musician.id === item.musicianId);
          if (musicianSettings?.percConfig?.tags?.length > 0) {
            musicianSettings.percConfig.tags.forEach((tag) => {
              if (!tag.assignedTo) return;
              const assignedPlayer = musicianSettings.percConfig.players.find((player) => player.id === tag.assignedTo);
              if (!assignedPlayer) return;
              addToMap(projectData.orch.percussion, tag.name, assignedPlayer.name);
              hasDetailedInfo = true;
            });
          }
        }

        if (!hasDetailedInfo && item.roster && Object.keys(item.roster).length > 0) {
          const targetMap = projectData.orch[category];
          Object.entries(item.roster).forEach(([key, playerName]) => {
            if (!playerName || !playerName.trim()) return;
            let instrumentLabel = key.split(/[._\d]/)[0].trim();
            if (!instrumentLabel) instrumentLabel = systemInstrumentName;

            if (category === 'strings') {
              splitCreditNames(playerName).forEach((name) => projectData.orch.strings.add(name));
            } else {
              addToMap(targetMap, instrumentLabel, playerName.trim());
            }
            hasDetailedInfo = true;
          });
        }

        if (!hasDetailedInfo) {
          if (category === 'strings') {
            splitCreditNames(musicianName).forEach((name) => projectData.orch.strings.add(name));
          } else {
            addToMap(projectData.orch[category], systemInstrumentName, musicianName);
          }
        }
      } else {
        addToMap(projectData.solo, systemInstrumentName, musicianName);
      }
    });
  };

  const addScheduledTasksToCredits = (projectDataMap, sessionItems, sessionTasks) => {
    const getProjectData = (projectId) => {
      if (!projectDataMap[projectId]) projectDataMap[projectId] = createProjectData(projectId);
      return projectDataMap[projectId];
    };

    sessionTasks.forEach((task) => {
      const currentTaskProjectIds = new Set();
      if (task.projectId) {
        currentTaskProjectIds.add(task.projectId);
      } else {
        if (task.musicianId) {
          sessionItems
            .filter((item) => item.musicianId === task.musicianId)
            .forEach((item) => item.projectId && currentTaskProjectIds.add(item.projectId));
        }
        if (task.instrumentId) {
          sessionItems
            .filter((item) => item.instrumentId === task.instrumentId)
            .forEach((item) => item.projectId && currentTaskProjectIds.add(item.projectId));
        }
      }

      if (task.editInfo) {
        const editorName = task.editInfo.engineer || task.editInfo.EditEngineer;
        if (editorName) {
          currentTaskProjectIds.forEach((projectId) => {
            const projectData = getProjectData(projectId);
            editorName.split(/[\/,]/).forEach((name) => {
              if (name && name.trim()) projectData.editors.add(name.trim());
            });
          });
        }
      }

      const info = task.recordingInfo;
      if (!info) return;

      const relatedItems = sessionItems.filter((item) => {
        if (task.musicianId) return item.musicianId === task.musicianId;
        if (task.instrumentId) return item.instrumentId === task.instrumentId;
        return false;
      });
      const isOrchTask = relatedItems.length > 0
        ? relatedItems.some((item) => (
          !!getOrchCategory(getNameById(item.instrumentId, 'instrument'), getNameById(item.musicianId, 'musician'))
        ))
        : !!getOrchCategory(getNameById(task.instrumentId, 'instrument'), getNameById(task.musicianId, 'musician'));

      currentTaskProjectIds.forEach((projectId) => {
        const projectData = getProjectData(projectId);
        addTechInfo(isOrchTask ? projectData.orchTech : projectData.soloTech, info);
      });
    });
  };

  const printTechBlock = (finalLines, techData) => {
    const join = (set) => Array.from(set).join(' / ');
    if (techData.studios.size > 0) finalLines.push(`录音棚 Recording Studio：${join(techData.studios)}`);
    if (techData.engineers.size > 0) finalLines.push(`录音工程师 Recording Engineer：${join(techData.engineers)}`);
    if (techData.operators.size > 0) finalLines.push(`录音操作员 Recording Operator：${join(techData.operators)}`);
    if (techData.assistants.size > 0) finalLines.push(`录音师助理 Recording Assistant：${join(techData.assistants)}`);
  };

  const printInstrumentMap = (finalLines, title, map) => {
    const keys = Object.keys(map).sort();
    if (keys.length === 0) return;

    if (title) {
      finalLines.push('');
      finalLines.push(`${title}：`);
    }

    keys.forEach((instrument) => {
      const names = Array.from(map[instrument]).join(' / ');
      finalLines.push(`${instrument}：${names}`);
    });
  };

  const appendProjectCredits = (finalLines, projectId, projectData) => {
    const projectMeta = settings.projects.find((project) => project.id === projectId) || {};
    const hasSolo = Object.keys(projectData.solo).length > 0;
    const isOrchEmpty = projectData.orch.strings.size === 0 &&
      Object.keys(projectData.orch.woodwinds).length === 0 &&
      Object.keys(projectData.orch.brass).length === 0 &&
      Object.keys(projectData.orch.percussion).length === 0 &&
      Object.keys(projectData.orch.others).length === 0;

    if ((projectId === 'Unassigned' && !hasSolo && isOrchEmpty) ||
      (!hasSolo && isOrchEmpty && !projectMeta.title)) {
      if (!projectMeta.title) return;
    }

    finalLines.push(`曲目名称 Title：${projectMeta.title || projectData.name}`);
    finalLines.push('');

    if (projectMeta.composer) {
      finalLines.push(`作曲 Composer：${projectMeta.composer}`);
      finalLines.push('');
    }
    if (projectMeta.arranger) {
      finalLines.push(`编曲 Arranger：${projectMeta.arranger}`);
      finalLines.push('');
    }

    if (!isOrchEmpty) {
      finalLines.push('管弦乐队录制（Orchestra Recording）');
      finalLines.push('');
      finalLines.push('指挥 Conductor：[请填写]');

      if (projectData.orch.strings.size > 0) {
        finalLines.push('');
        finalLines.push('弦乐组 Strings：');
        projectData.orch.strings.forEach((name) => finalLines.push(name));
      }

      printInstrumentMap(finalLines, '木管组 Woodwinds', projectData.orch.woodwinds);
      printInstrumentMap(finalLines, '铜管组 Brass', projectData.orch.brass);
      printInstrumentMap(finalLines, '打击乐组 Percussion', projectData.orch.percussion);
      printInstrumentMap(finalLines, '色彩乐器 Keyboards & Harp', projectData.orch.others);

      finalLines.push('');
      printTechBlock(finalLines, projectData.orchTech);
      finalLines.push('');
    }

    if (hasSolo) {
      finalLines.push('乐器录制（Instruments Recording）');
      finalLines.push('');
      printInstrumentMap(finalLines, '', projectData.solo);

      finalLines.push('');
      printTechBlock(finalLines, projectData.soloTech);
      finalLines.push('');
    }

    const hasPostInfo = (projectData.editors && projectData.editors.size > 0) ||
      projectMeta.mixingEngineer ||
      projectMeta.mixingStudio ||
      projectMeta.masteringEngineer ||
      projectMeta.masteringStudio ||
      projectMeta.dolbyStudio;

    if (hasPostInfo) {
      finalLines.push('');
      finalLines.push('声音后期制作（Editing, Mixing & Mastering）');
      finalLines.push('');

      if (projectData.editors && projectData.editors.size > 0) {
        finalLines.push(`音频编辑 Audio Editor：${[...projectData.editors].join(' / ')}`);
      }
      if (projectMeta.mixingEngineer) finalLines.push(`混音工程师 Mixing Engineer：${projectMeta.mixingEngineer}`);
      if (projectMeta.mixingStudio) finalLines.push(`混音工作室 Mixing Studio：${projectMeta.mixingStudio}`);
      if (projectMeta.masteringEngineer) finalLines.push(`母带工程师 Mastering Engineer：${projectMeta.masteringEngineer}`);
      if (projectMeta.masteringStudio) finalLines.push(`母带工作室 Mastering Studio：${projectMeta.masteringStudio}`);
      if (projectMeta.dolbyStudio) finalLines.push(`杜比全景声母带工作室 Dolby Atmos Mastering Studio：${projectMeta.dolbyStudio}`);
    }

    if (projectMeta.producer) {
      finalLines.push('');
      finalLines.push('音乐制作人（Music Producer）');
      finalLines.push(projectMeta.producer);
    }

    if (projectMeta.publishedBy) {
      finalLines.push('');
      finalLines.push('发行（Published by）');
      finalLines.push(projectMeta.publishedBy);
    }

    if (projectMeta.producedBy) {
      finalLines.push('');
      finalLines.push('出品（Produced by）');
      finalLines.push(projectMeta.producedBy);
    }

    finalLines.push('------------------------------------------------');
    finalLines.push('');
  };

  const openCreditModal = () => {
    const sessionId = currentSessionId.value;
    const projectDataMap = {};
    const sessionItems = itemPool.value.filter((item) => (item.sessionId || 'S_DEFAULT') === sessionId);

    if (sessionItems.length === 0 && scheduledTasks.value.length === 0) {
      openAlertModal('无数据', '当前日程表为空，无法生成名单。');
      return;
    }

    addSessionItemsToCredits(projectDataMap, sessionItems);

    const sessionTasks = scheduledTasks.value.filter((task) => (task.sessionId || 'S_DEFAULT') === sessionId);
    addScheduledTasksToCredits(projectDataMap, sessionItems, sessionTasks);

    const finalLines = [];
    const sortedProjectIds = Object.keys(projectDataMap).sort((a, b) =>
      projectDataMap[a].name.localeCompare(projectDataMap[b].name, 'zh-CN'),
    );

    sortedProjectIds.forEach((projectId) => {
      appendProjectCredits(finalLines, projectId, projectDataMap[projectId]);
    });

    generatedCreditText.value = finalLines.join('\n');
    showCreditModal.value = true;
  };

  const copyCreditText = () => {
    if (!generatedCreditText.value) return;

    navigator.clipboard.writeText(generatedCreditText.value).then(() => {
      const button = document.querySelector('.modal-window button i.fa-copy')?.parentNode;
      if (!button) return;

      const originalText = button.innerHTML;
      button.innerHTML = '<i class="fa-solid fa-check"></i> 已复制';
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    });
  };

  return {
    openCreditModal,
    copyCreditText,
  };
}
