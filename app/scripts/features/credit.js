export function registerCreditFeature(context) {
  const { refs, state, utils, actions } = context;
  const { showCreditModal, generatedCreditText, itemPool, scheduledTasks, currentSessionId } = refs;
  const { settings } = state;
  const { getNameById } = utils;
  const { triggerTouchHaptic, openAlertModal } = actions;

  const openCreditModal = () => {
    const sessId = currentSessionId.value;
    const projectDataMap = {};

    const getProjData = (pid) => {
      if (!projectDataMap[pid]) {
        projectDataMap[pid] = {
          name: getNameById(pid, 'project'),
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
        };
      }
      return projectDataMap[pid];
    };

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
      const names = playerName.split(/[\/,\r\n]|\^\|/).map((item) => item.trim()).filter(Boolean);

      names.forEach((name) => {
        if (!targetMap[instrumentLabel]) targetMap[instrumentLabel] = new Set();
        targetMap[instrumentLabel].add(name);
      });
    };

    const addTechInfo = (targetTech, info) => {
      if (!info) return;
      const splitAndAdd = (str, set) => {
        if (!str) return;
        const parts = str.split(/[\/,\r\n]|\^\|/).map((item) => item.trim()).filter(Boolean);
        parts.forEach((part) => set.add(part));
      };

      splitAndAdd(info.studio, targetTech.studios);
      splitAndAdd(info.engineer, targetTech.engineers);
      splitAndAdd(info.operator, targetTech.operators);
      splitAndAdd(info.assistant, targetTech.assistants);
    };

    const sessionItems = itemPool.value.filter((item) => (item.sessionId || 'S_DEFAULT') === sessId);

    if (sessionItems.length === 0 && scheduledTasks.value.length === 0) {
      openAlertModal('无数据', '当前日程表为空，无法生成名单。');
      return;
    }

    sessionItems.forEach((item) => {
      if (item.isSkipped) return;

      const pid = item.projectId || 'Unassigned';
      const pData = getProjData(pid);
      const instName = getNameById(item.instrumentId, 'instrument');
      const musName = getNameById(item.musicianId, 'musician');
      const category = getOrchCategory(instName, musName);
      let hasDetailedInfo = false;

      if (category) {
        if (category === 'percussion') {
          const musicianSettings = settings.musicians.find((musician) => musician.id === item.musicianId);
          if (musicianSettings?.percConfig?.tags?.length > 0) {
            musicianSettings.percConfig.tags.forEach((tag) => {
              if (!tag.assignedTo) return;
              const assignedPlayer = musicianSettings.percConfig.players.find((player) => player.id === tag.assignedTo);
              if (assignedPlayer) {
                addToMap(pData.orch.percussion, tag.name, assignedPlayer.name);
                hasDetailedInfo = true;
              }
            });
          }
        }

        if (!hasDetailedInfo && item.roster && Object.keys(item.roster).length > 0) {
          const targetMap = pData.orch[category];
          Object.entries(item.roster).forEach(([key, playerName]) => {
            if (!playerName || !playerName.trim()) return;
            let instrumentLabel = key.split(/[._\d]/)[0].trim();
            if (!instrumentLabel) instrumentLabel = instName;

            if (category === 'strings') {
              const names = playerName.split(/[\/,\r\n]|\^\|/).map((value) => value.trim()).filter(Boolean);
              names.forEach((name) => pData.orch.strings.add(name));
            } else {
              addToMap(targetMap, instrumentLabel, playerName.trim());
            }
            hasDetailedInfo = true;
          });
        }

        if (!hasDetailedInfo) {
          if (category === 'strings') {
            if (musName) {
              const names = musName.split(/[\/,\r\n]|\^\|/).map((value) => value.trim()).filter(Boolean);
              names.forEach((name) => pData.orch.strings.add(name));
            }
          } else {
            addToMap(pData.orch[category], instName, musName);
          }
        }
      } else {
        addToMap(pData.solo, instName, musName);
      }
    });

    const sessionTasks = scheduledTasks.value.filter((task) => (task.sessionId || 'S_DEFAULT') === sessId);

    sessionTasks.forEach((task) => {
      const currentTaskProjectIds = new Set();
      if (task.projectId) {
        currentTaskProjectIds.add(task.projectId);
      } else {
        if (task.musicianId) {
          sessionItems.filter((item) => item.musicianId === task.musicianId)
            .forEach((item) => item.projectId && currentTaskProjectIds.add(item.projectId));
        }
        if (task.instrumentId) {
          sessionItems.filter((item) => item.instrumentId === task.instrumentId)
            .forEach((item) => item.projectId && currentTaskProjectIds.add(item.projectId));
        }
      }

      if (task.editInfo) {
        const edName = task.editInfo.engineer || task.editInfo.EditEngineer;
        if (edName) {
          currentTaskProjectIds.forEach((pid) => {
            const pData = getProjData(pid);
            edName.split(/[\/,]/).forEach((name) => {
              if (name && name.trim()) pData.editors.add(name.trim());
            });
          });
        }
      }

      const info = task.recordingInfo;
      if (!info) return;

      let isOrchTask = false;
      const relatedItems = sessionItems.filter((item) => {
        if (task.musicianId) return item.musicianId === task.musicianId;
        if (task.instrumentId) return item.instrumentId === task.instrumentId;
        return false;
      });

      if (relatedItems.length > 0) {
        isOrchTask = relatedItems.some((item) => {
          const inst = getNameById(item.instrumentId, 'instrument');
          const mus = getNameById(item.musicianId, 'musician');
          return !!getOrchCategory(inst, mus);
        });
      } else {
        const inst = getNameById(task.instrumentId, 'instrument');
        const mus = getNameById(task.musicianId, 'musician');
        isOrchTask = !!getOrchCategory(inst, mus);
      }

      currentTaskProjectIds.forEach((pid) => {
        const pData = getProjData(pid);
        if (isOrchTask) {
          addTechInfo(pData.orchTech, info);
        } else {
          addTechInfo(pData.soloTech, info);
        }
      });
    });

    const finalLines = [];
    const sortedPids = Object.keys(projectDataMap).sort((a, b) =>
      projectDataMap[a].name.localeCompare(projectDataMap[b].name, 'zh-CN'),
    );

    const printTechBlock = (techData) => {
      const join = (set) => Array.from(set).join(' / ');
      if (techData.studios.size > 0) finalLines.push(`录音棚 Recording Studio：${join(techData.studios)}`);
      if (techData.engineers.size > 0) finalLines.push(`录音工程师 Recording Engineer：${join(techData.engineers)}`);
      if (techData.operators.size > 0) finalLines.push(`录音操作员 Recording Operator：${join(techData.operators)}`);
      if (techData.assistants.size > 0) finalLines.push(`录音师助理 Recording Assistant：${join(techData.assistants)}`);
    };

    const printInstMap = (title, map) => {
      const keys = Object.keys(map).sort();
      if (keys.length === 0) return;
      if (title) {
        finalLines.push('');
        finalLines.push(`${title}：`);
      }
      keys.forEach((inst) => {
        finalLines.push(`${inst}：${Array.from(map[inst]).join(' / ')}`);
      });
    };

    sortedPids.forEach((pid) => {
      const data = projectDataMap[pid];
      const projectMeta = settings.projects.find((project) => project.id === pid) || {};
      const hasSolo = Object.keys(data.solo).length > 0;
      const isOrchEmpty = data.orch.strings.size === 0 &&
        Object.keys(data.orch.woodwinds).length === 0 &&
        Object.keys(data.orch.brass).length === 0 &&
        Object.keys(data.orch.percussion).length === 0 &&
        Object.keys(data.orch.others).length === 0;

      if ((pid === 'Unassigned' && !hasSolo && isOrchEmpty) ||
        (!hasSolo && isOrchEmpty && !projectMeta.title)) {
        if (!projectMeta.title) return;
      }

      const displayTitle = projectMeta.title || data.name;
      finalLines.push(`曲目名称 Title：${displayTitle}`);
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

        if (data.orch.strings.size > 0) {
          finalLines.push('');
          finalLines.push('弦乐组 Strings：');
          data.orch.strings.forEach((name) => finalLines.push(name));
        }

        printInstMap('木管组 Woodwinds', data.orch.woodwinds);
        printInstMap('铜管组 Brass', data.orch.brass);
        printInstMap('打击乐组 Percussion', data.orch.percussion);
        printInstMap('色彩乐器 Keyboards & Harp', data.orch.others);

        finalLines.push('');
        printTechBlock(data.orchTech);
        finalLines.push('');
      }

      if (hasSolo) {
        finalLines.push('乐器录制（Instruments Recording）');
        finalLines.push('');
        printInstMap('', data.solo);
        finalLines.push('');
        printTechBlock(data.soloTech);
        finalLines.push('');
      }

      const hasPostInfo = (data.editors && data.editors.size > 0) ||
        projectMeta.mixingEngineer ||
        projectMeta.mixingStudio ||
        projectMeta.masteringEngineer ||
        projectMeta.masteringStudio ||
        projectMeta.dolbyStudio;

      if (hasPostInfo) {
        finalLines.push('');
        finalLines.push('声音后期制作（Editing, Mixing & Mastering）');
        finalLines.push('');

        if (data.editors && data.editors.size > 0) {
          finalLines.push(`音频编辑 Audio Editor：${[...data.editors].join(' / ')}`);
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
    });

    generatedCreditText.value = finalLines.join('\n');
    showCreditModal.value = true;
  };

  const copyCreditText = () => {
    if (!generatedCreditText.value) return;
    navigator.clipboard.writeText(generatedCreditText.value).then(() => {
      triggerTouchHaptic('Success');
      const btn = document.querySelector('.modal-window button i.fa-copy')?.parentNode;
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> 已复制';
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 2000);
      }
    });
  };

  return {
    showCreditModal,
    generatedCreditText,
    openCreditModal,
    copyCreditText,
  };
}
