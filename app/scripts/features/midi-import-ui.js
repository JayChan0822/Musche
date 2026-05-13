import { computed, nextTick } from 'vue';

import { normalizeForMatch } from '../utils/midi.js';

export const instrumentLibrary = {
  Brass: [
    'Horn', 'French Horn', 'Hn', 'Trumpet', 'Tpt', 'Cornet', 'Trombone', 'Tbn',
    'Bass Trombone', 'B.Tbn', 'Tuba', 'Tba', 'Euphonium', 'Brass',
  ],
  Woodwinds: [
    'Flute', 'Fl', 'Piccolo', 'Picc', 'Oboe', 'Ob', 'English Horn', 'Cor Anglais', 'E.H',
    'Clarinet', 'Cl', 'Bass Clarinet', 'B.Cl', 'Bassoon', 'Bsn', 'Contrabassoon', 'C.Bsn',
    'Saxophone', 'Sax', 'Recorder', 'Woodwinds',
  ],
  Strings: [
    'Violin', 'Vln', 'Viola', 'Vla', 'Cello', 'Violoncello', 'Vc',
    'Double Bass', 'Contrabass', 'Db', 'Cb', 'Bass',
    'Strings', 'Str',
  ],
  Percussion: [
    'Timpani', 'Timp', 'Snare', 'SD', 'Bass Drum', 'BD', 'Cymbals', 'Cym', 'Piatti',
    'Triangle', 'Tri', 'Tambourine', 'Tamb', 'Glockenspiel', 'Glock', 'Xylophone', 'Xyl',
    'Vibraphone', 'Vib', 'Marimba', 'Mar', 'Tubular Bells', 'Chimes', 'Drum', 'Percussion', 'Perc',
  ],
  Keys: [
    'Piano', 'Pno', 'Celesta', 'Cel', 'Harpsichord', 'Organ', 'Accordion',
  ],
  Plucks: [
    'Harp', 'Hp', 'Guitar', 'Gtr', 'Mandolin', 'Lute',
  ],
  Vocal: [
    'Soprano', 'Alto', 'Tenor', 'Baritone', 'Bass Voice', 'Choir', 'Voice', 'Vocal',
  ],
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const sortedLibrary = Object.entries(instrumentLibrary)
  .flatMap(([group, names]) =>
    names.map((name) => {
      const normalizedName = normalizeForMatch(name);
      return {
        name,
        group,
        normalizedName,
        regex: new RegExp(`\\b${escapeRegExp(normalizedName)}\\b`, 'i'),
      };
    }),
  )
  .sort((a, b) => b.name.length - a.name.length);

export function findGroupSmart(trackName) {
  const cleanName = normalizeForMatch(trackName);

  for (const item of sortedLibrary) {
    if (item.regex.test(cleanName)) {
      return item.group;
    }

    if (item.normalizedName.length < 3 && cleanName === item.normalizedName) {
      return item.group;
    }
  }

  if (cleanName.includes('string') || cleanName.includes('vln') || cleanName.includes('vla') || cleanName.includes('cello')) return 'Strings';
  if (cleanName.includes('brass') || cleanName.includes('horn') || cleanName.includes('tpt')) return 'Brass';
  if (cleanName.includes('wood') || cleanName.includes('flute') || cleanName.includes('oboe')) return 'Woodwinds';
  if (cleanName.includes('perc') || cleanName.includes('drum')) return 'Percussion';

  return '';
}

export function findGroupFromLibrary(cleanName) {
  const target = cleanName.toLowerCase();

  for (const [groupName, instruments] of Object.entries(instrumentLibrary)) {
    const match = instruments.find((inst) => {
      const libInst = inst.toLowerCase();
      if (libInst === target) return true;
      return target.includes(libInst) || libInst.includes(target);
    });

    if (match) return groupName;
  }

  return '';
}

export function registerMidiImportUiFeature(context) {
  const { refs, computedRefs, actions } = context;
  const {
    activeImportMenu,
    importMenuPos,
    importSearchQuery,
    midiViewMode,
    activeMidiGroupRow,
    midiGroupPos,
    midiGroupSearchQuery,
  } = refs;
  const {
    sortedInstruments,
    availableInstrumentGroups,
  } = computedRefs;
  const {
    updateInstrumentGroup,
  } = actions;

  const openImportMenu = (event, rowId, type) => {
    if (activeImportMenu.rowId === rowId && activeImportMenu.type === type) {
      activeImportMenu.rowId = null;
      activeImportMenu.type = null;
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    importMenuPos.top = rect.bottom + 5;
    importMenuPos.left = rect.left;
    importMenuPos.width = rect.width;

    activeImportMenu.rowId = rowId;
    activeImportMenu.type = type;
    importSearchQuery.value = '';

    nextTick(() => {
      const input = document.getElementById('midi-import-search');
      if (input) input.focus();
    });
  };

  const closeImportMenu = () => {
    activeImportMenu.rowId = null;
    activeImportMenu.type = null;
  };

  const selectImportInst = (track, inst) => {
    track.instrumentId = inst.id;
    if (inst.group && midiViewMode.value !== 'groups') {
      track.group = inst.group;
    }
    track.createNew = false;
    closeImportMenu();
  };

  const selectImportNewInst = (track) => {
    track.instrumentId = '';
    track.createNew = true;
    closeImportMenu();
  };

  const selectImportGroup = (track, groupName) => {
    track.group = groupName;
    closeImportMenu();
  };

  const filteredImportOptions = computed(() => {
    const search = importSearchQuery.value.toLowerCase();

    if (activeImportMenu.type === 'inst') {
      return sortedInstruments.value.filter((item) =>
        item.name.toLowerCase().includes(search) ||
        (item.group && item.group.toLowerCase().includes(search)),
      );
    }

    if (activeImportMenu.type === 'group') {
      return availableInstrumentGroups.value.filter((group) =>
        group.toLowerCase().includes(search),
      );
    }

    return [];
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

  const filteredMidiGroups = computed(() => {
    const query = midiGroupSearchQuery.value.toLowerCase().trim();
    return availableInstrumentGroups.value.filter((group) =>
      group.toLowerCase().includes(query),
    );
  });

  const selectMidiGroup = (instId, groupName) => {
    updateInstrumentGroup(instId, groupName);
    activeMidiGroupRow.value = null;
  };

  return {
    openImportMenu,
    closeImportMenu,
    selectImportInst,
    selectImportNewInst,
    selectImportGroup,
    filteredImportOptions,
    openMidiGroupDropdown,
    filteredMidiGroups,
    selectMidiGroup,
    instrumentLibrary,
    sortedLibrary,
    findGroupSmart,
    findGroupFromLibrary,
  };
}
