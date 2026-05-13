import { computed, reactive, watch } from 'vue';

export function registerPercussionFeature({
    refs,
    state,
    utils,
    split,
    actions = {},
}) {
    const {
        editingItem,
        showEditor,
        itemPool,
        scheduledTasks,
        sidebarTab,
        currentSessionId,
    } = refs;
    const { settings } = state;
    const {
        parseTime,
        getNameById,
    } = utils;
    const {
        getCurrentSplitView,
        getSplitViewState,
        isItemVisibleForView,
        getSplitFamilyMembers,
    } = split;
    const { triggerTouchHaptic = () => {} } = actions;

    const getFamilyTotalDuration = (targetItem) => {
        const viewType = getCurrentSplitView();
        const rootId = getSplitViewState(targetItem, viewType).splitFromId || targetItem.id;

        const familyMembers = itemPool.value.filter(i => (
            isItemVisibleForView(i, viewType) &&
            (i.id === rootId || getSplitViewState(i, viewType).splitFromId === rootId)
        ));

        return familyMembers.reduce((sum, item) => {
            return sum + parseTime(getSplitViewState(item, viewType).musicDuration || '00:00');
        }, 0);
    };

    const activeOrchPresets = computed(() => {
        const instId = editingItem.value.instrumentId;
        if (!instId) return { full: '2 Fl, 2 Ob, 2 Cl, 2 Bsn', std: '1 Fl, 1 Ob, 1 Cl, 1 Bsn' };

        const inst = settings.instruments.find(i => i.id === instId);
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
        const parts = code.split(/[,+;]/).map(s => s.trim()).filter(s => s);
        const result = [];

        parts.forEach((part) => {
            const match = part.match(/^(\d+)\s*(.*)$/);

            if (match) {
                const count = parseInt(match[1], 10);
                const label = match[2].trim() || 'Player';

                if (count > 0) {
                    result.push({
                        label,
                        count,
                        startIndex: 0,
                    });
                }
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

        const inst = settings.instruments.find(i => i.id === instId);
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
        const groupName = (settings.instruments.find(i => i.id === editingItem.value.instrumentId)?.group || '').toLowerCase();
        const triggers = ['perc'];

        return triggers.some(t => instName.includes(t) || musicianName.includes(t) || groupName.includes(t));
    });

    const scanPercussionTags = () => {
        const musician = settings.musicians.find(m => m.id === editingItem.value.musicianId);

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
            relatedItems = itemPool.value.filter(i => i.musicianId === editingItem.value.musicianId && (i.sessionId || 'S_DEFAULT') === currentSessionId.value);
        } else if (editingItem.value.instrumentId) {
            relatedItems = itemPool.value.filter(i => i.instrumentId === editingItem.value.instrumentId && (i.sessionId || 'S_DEFAULT') === currentSessionId.value);
        }

        relatedItems.forEach(item => {
            const rawName = getNameById(item.instrumentId, 'instrument');

            if (rawName && !currentTags.some(t => t.fullName === rawName)) {
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

        percState.players.forEach(p => {
            const myTags = percState.tags
                .filter(t => t.assignedTo === p.id)
                .map(t => t.name);

            const uniqueTags = [...new Set(myTags)];
            const tagStr = uniqueTags.length > 0 ? ` (${uniqueTags.join(', ')})` : '';

            newRoster[`Player_${p.id}`] = p.name;
            summaryParts.push(`${p.name}${tagStr}`);
        });

        const finalOrchString = summaryParts.join(', ');

        editingItem.value.roster = newRoster;
        editingItem.value.orchestration = finalOrchString;

        const musician = settings.musicians.find(m => m.id === editingItem.value.musicianId);
        if (musician) {
            musician.percConfig = {
                tags: JSON.parse(JSON.stringify(percState.tags)),
                players: JSON.parse(JSON.stringify(percState.players)),
            };

            itemPool.value.forEach(item => {
                if (item.musicianId === musician.id && (item.sessionId || 'S_DEFAULT') === currentSessionId.value) {
                    item.orchestration = finalOrchString;
                    item.roster = JSON.parse(JSON.stringify(newRoster));
                }
            });

            scheduledTasks.value.forEach(task => {
                if (task.musicianId === musician.id && (task.sessionId || 'S_DEFAULT') === currentSessionId.value) {
                    task.orchestration = finalOrchString;
                }
            });
        }
    };

    const removePercPlayer = (idx) => {
        const player = percState.players[idx];
        percState.tags.forEach(t => {
            if (t.assignedTo === player.id) t.assignedTo = null;
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

        percState.selectedTagIndices.forEach(idx => {
            const tag = percState.tags[idx];
            tag.assignedTo = playerId;
        });

        percState.selectedTagIndices.clear();
        triggerTouchHaptic('Medium');
        updatePercOrchestration();
    };

    watch(() => showEditor.value, (val) => {
        if (val && isPercussionMode.value && !editingItem.value.orchestration) {
            scanPercussionTags();
        }
    });

    const getNameWithGroup = (id, type) => {
        if (!id) return '';
        let list = [];

        if (type === 'project') list = settings.projects;
        else if (type === 'instrument') list = settings.instruments;
        else list = settings.musicians;

        const item = list.find(i => i.id == id);
        return item ? `${item.name} ${item.group || ''}` : '';
    };

    const syncFamilyOrchestration = (item, newOrch) => {
        const familyMembers = getSplitFamilyMembers(item);

        familyMembers.forEach(member => {
            if (member.orchestration !== newOrch) {
                member.orchestration = newOrch;
            }
        });
    };

    const getOrchSize = (str) => {
        if (!str) return 0;
        const nums = str.match(/\d+/g);
        if (!nums) return 0;
        return nums.reduce((sum, n) => sum + parseInt(n, 10), 0);
    };

    const isOrchestraGroup = (item) => {
        const name = getNameById(item.instrumentId, 'instrument').toLowerCase();
        const group = (settings.instruments.find(i => i.id === item.instrumentId)?.group || '').toLowerCase();
        const text = name + ' ' + group;
        return /string|str|brass|wind|wood|hn|tpt|tbn|tuba|vln|vla|vc|db|flute|oboe|clar|bsn/.test(text);
    };

    const isPercussionGroup = (item) => {
        const name = getNameById(item.musicianId, 'musician').toLowerCase();
        return /perc/.test(name);
    };

    const isStringGroup = (item) => {
        const name = getNameById(item.musicianId, 'musician').toLowerCase();
        return /\b(strings?|str)\b/i.test(name);
    };

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
        getNameWithGroup,
        getFamilyTotalDuration,
        syncFamilyOrchestration,
        getOrchSize,
        isOrchestraGroup,
        isPercussionGroup,
        isStringGroup,
    };
}
