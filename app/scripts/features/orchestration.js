import { computed, reactive, watch } from 'vue';

export function registerOrchestrationFeature(context) {
  const { refs, state, utils, actions } = context;
  const {
    editingItem,
    showEditor,
    sidebarTab,
    itemPool,
    scheduledTasks,
    currentSessionId,
  } = refs;
  const { settings } = state;
  const { getNameById } = utils;
  const { triggerTouchHaptic } = actions;

  const activeOrchPresets = computed(() => {
    const instId = editingItem.value.instrumentId;
    if (!instId) return { full: '2 Fl, 2 Ob, 2 Cl, 2 Bsn', std: '1 Fl, 1 Ob, 1 Cl, 1 Bsn' };

    const inst = settings.instruments.find((item) => item.id === instId);
    const text = inst ? `${inst.name} ${inst.group || ''}`.toLowerCase() : '';

    if (/string|str|vln|vla|vc|db|violin|cello|viola/.test(text)) {
      return {
        full: '12 Vln1, 10 Vln2, 8 Vla, 8 Vc, 6 Db',
        std: '8 Vln1, 6 Vln2, 4 Vla, 4 Vc, 3 Db',
      };
    }

    if (/brass|hn|tpt|tbn|tba|horn|trumpet|trombone|tuba/.test(text)) {
      return {
        full: '4 Hn, 3 Tpt, 3 Tbn, 1 Tba',
        std: '4 Hn, 2 Tpt, 2 Tbn',
      };
    }

    return {
      full: '3 Fl, 3 Ob, 3 Cl, 3 Bsn',
      std: '2 Fl, 2 Ob, 2 Cl, 2 Bsn',
    };
  });

  const orchTemplates = {
    Brass: ['Hn', 'Tpt', 'Tbn', 'B. Tbn', 'Tba'],
    Woodwinds: ['Fl', 'Picc', 'Ob', 'E. H.', 'Cl', 'B. Cl', 'Bsn', 'C. Bsn'],
    Strings: ['Vln1', 'Vln2', 'Vla', 'Vc', 'Db'],
  };

  const parsedRoster = computed(() => {
    const code = editingItem.value.orchestration || '';
    const parts = code.split(/[,+;]/).map((part) => part.trim()).filter(Boolean);
    const result = [];

    parts.forEach((part) => {
      const match = part.match(/^(\d+)\s*(.*)$/);
      if (!match) return;

      const count = parseInt(match[1], 10);
      const label = match[2].trim() || 'Player';
      if (count > 0) {
        result.push({
          label,
          count,
          startIndex: 0,
        });
      }
    });

    return result;
  });

  const getRosterName = (sectionLabel, index) => {
    if (!editingItem.value.roster) editingItem.value.roster = {};
    const key = `${sectionLabel}_${index + 1}`;
    return editingItem.value.roster[key] || '';
  };

  const updateRosterName = (sectionLabel, index, value) => {
    if (!editingItem.value.roster) editingItem.value.roster = {};
    const key = `${sectionLabel}_${index + 1}`;
    editingItem.value.roster[key] = value;
  };

  const showOrchestrationField = computed(() => {
    const instId = editingItem.value.instrumentId;
    if (!instId) return false;

    const inst = settings.instruments.find((item) => item.id === instId);
    if (!inst) return false;

    const text = `${inst.name} ${inst.group || ''}`.toLowerCase();
    return /brass|woodwind|string|str|wind/.test(text);
  });

  const percKeywords = {
    Snare: 'SD',
    Drum: 'Dr',
    Bass: 'BD',
    Kick: 'BD',
    Cymbal: 'Cym',
    Piatti: 'Piatti',
    Crash: 'Cym',
    Sus: 'SusCym',
    Timpani: 'Timp',
    Gong: 'Gong',
    Tam: 'Tam',
    Tubular: 'TB',
    Anvil: 'Anv',
    Cabasa: 'Cab',
    Castanets: 'Cast',
    Bell: 'Bell',
    Cowbell: 'CB',
    Guiro: 'Guiro',
    'Mark Tree': 'Tree',
    Ratchet: 'Ratch',
    Whistle: 'Whis',
    Shaker: 'Shk',
    Shells: 'Shells',
    Sleigh: 'SlBell',
    Whip: 'Whip',
    'Wood Block': 'WB',
    Block: 'Blk',
    Tamb: 'Tamb',
    Tri: 'Tri',
    Vib: 'Vib',
    Xylo: 'Xyl',
    Glock: 'Glk',
    Chime: 'Chm',
    Crot: 'Crot',
    Stick: 'Stk',
    Clap: 'Clap',
  };

  const percState = reactive({
    tags: [],
    players: [],
    selectedTagIndices: new Set(),
  });

  const isPercussionMode = computed(() => {
    const instName = getNameById(editingItem.value.instrumentId, 'instrument').toLowerCase();
    const musicianName = getNameById(editingItem.value.musicianId, 'musician').toLowerCase();
    const groupName = (settings.instruments.find((item) => item.id === editingItem.value.instrumentId)?.group || '').toLowerCase();
    const triggers = ['perc'];

    return triggers.some((trigger) => (
      instName.includes(trigger) ||
      musicianName.includes(trigger) ||
      groupName.includes(trigger)
    ));
  });

  const scanPercussionTags = () => {
    const musician = settings.musicians.find((item) => item.id === editingItem.value.musicianId);

    let currentTags = [];
    let currentPlayers = [];

    if (musician && musician.percConfig) {
      currentTags = JSON.parse(JSON.stringify(musician.percConfig.tags));
      currentPlayers = JSON.parse(JSON.stringify(musician.percConfig.players));
    } else {
      currentPlayers = [{ id: 1, name: 'Perc 1', tags: [] }];
    }

    let relatedItems = [];
    if (sidebarTab.value === 'musician' && editingItem.value.musicianId) {
      relatedItems = itemPool.value.filter((item) => (
        item.musicianId === editingItem.value.musicianId &&
        (item.sessionId || 'S_DEFAULT') === currentSessionId.value
      ));
    } else if (editingItem.value.instrumentId) {
      relatedItems = itemPool.value.filter((item) => (
        item.instrumentId === editingItem.value.instrumentId &&
        (item.sessionId || 'S_DEFAULT') === currentSessionId.value
      ));
    }

    relatedItems.forEach((item) => {
      const rawName = getNameById(item.instrumentId, 'instrument');
      if (rawName && !currentTags.some((tag) => tag.fullName === rawName)) {
        currentTags.push({
          name: rawName,
          fullName: rawName,
          assignedTo: null,
        });
      }
    });

    currentTags.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

    percState.tags = currentTags;
    percState.players = currentPlayers;
    percState.selectedTagIndices.clear();
  };

  const addPercPlayer = () => {
    const id = percState.players.length + 1;
    percState.players.push({
      id,
      name: `Perc ${id}`,
      tags: [],
    });
  };

  const updatePercOrchestration = () => {
    const newRoster = {};
    const summaryParts = [];

    percState.players.forEach((player) => {
      const myTags = percState.tags
        .filter((tag) => tag.assignedTo === player.id)
        .map((tag) => tag.name);

      const uniqueTags = [...new Set(myTags)];
      const tagStr = uniqueTags.length > 0 ? ` (${uniqueTags.join(', ')})` : '';

      newRoster[`Player_${player.id}`] = player.name;
      summaryParts.push(`${player.name}${tagStr}`);
    });

    const finalOrchString = summaryParts.join(', ');

    editingItem.value.roster = newRoster;
    editingItem.value.orchestration = finalOrchString;

    const musician = settings.musicians.find((item) => item.id === editingItem.value.musicianId);
    if (musician) {
      musician.percConfig = {
        tags: JSON.parse(JSON.stringify(percState.tags)),
        players: JSON.parse(JSON.stringify(percState.players)),
      };
    }

    if (musician) {
      itemPool.value.forEach((item) => {
        if (item.musicianId === musician.id && (item.sessionId || 'S_DEFAULT') === currentSessionId.value) {
          item.orchestration = finalOrchString;
          item.roster = JSON.parse(JSON.stringify(newRoster));
        }
      });

      scheduledTasks.value.forEach((task) => {
        if (task.musicianId === musician.id && (task.sessionId || 'S_DEFAULT') === currentSessionId.value) {
          task.orchestration = finalOrchString;
        }
      });
    }
  };

  const removePercPlayer = (idx) => {
    const player = percState.players[idx];
    percState.tags.forEach((tag) => {
      if (tag.assignedTo === player.id) tag.assignedTo = null;
    });
    percState.players.splice(idx, 1);
    updatePercOrchestration();
  };

  const togglePercTagSelect = (index) => {
    if (percState.selectedTagIndices.has(index)) {
      percState.selectedTagIndices.delete(index);
    } else {
      percState.selectedTagIndices.add(index);
    }
  };

  const assignTagsToPlayer = (playerId) => {
    if (percState.selectedTagIndices.size === 0) return;

    percState.selectedTagIndices.forEach((idx) => {
      const tag = percState.tags[idx];
      tag.assignedTo = playerId;
    });

    percState.selectedTagIndices.clear();
    triggerTouchHaptic('Medium');
    updatePercOrchestration();
  };

  watch(() => showEditor.value, (val) => {
    if (val && isPercussionMode.value) {
      if (!editingItem.value.orchestration) {
        scanPercussionTags();
      }
    }
  });

  return {
    activeOrchPresets,
    orchTemplates,
    parsedRoster,
    getRosterName,
    updateRosterName,
    showOrchestrationField,
    percKeywords,
    percState,
    isPercussionMode,
    scanPercussionTags,
    addPercPlayer,
    removePercPlayer,
    togglePercTagSelect,
    assignTagsToPlayer,
    updatePercOrchestration,
  };
}
