import assert from 'node:assert/strict';
import test from 'node:test';

import { ref } from 'vue';

import { registerAuthFeature } from '../app/scripts/features/auth.js';
import { createDefaultSettings } from '../app/scripts/state/defaults.js';

function createAuthHarness({ cloudContent, version = 3 }) {
  const settings = createDefaultSettings();
  const ensureCalls = [];
  const refs = {
    user: ref({ id: 'USER_1', email: 'sync@example.com', user_metadata: {} }),
    showAuthModal: ref(false),
    authLoading: ref(false),
    authForm: {},
    activeDropdown: ref(null),
    showProfileMenu: ref(false),
    showMobileMenu: ref(false),
    tempAvatarUrl: ref(''),
    tempNickname: ref(''),
    localDataVersion: ref(0),
    saveStatus: ref('saved'),
    isSyncing: ref(false),
    itemPool: ref([]),
    scheduledTasks: ref([]),
    currentSessionId: ref('S_DEFAULT'),
  };

  const feature = registerAuthFeature({
    refs,
    state: { settings },
    utils: {
      formatDate: () => '2026-06-02',
      ensureItemRecords: (item) => {
        ensureCalls.push(item.id);
        return { ...item, records: item.records || { musician: {}, project: {}, instrument: {} } };
      },
      calculateEstTime: () => '00:00',
      generateUniqueId: () => 'ID',
    },
    services: {
      storageService: {
        loadData: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
      supabaseService: {
        loadUserData: async () => ({ data: { version, content: cloudContent }, error: null }),
      },
    },
    actions: {
      pushHistory: () => {},
      openAlertModal: () => {},
      openConfirmModal: () => {},
      triggerTouchHaptic: () => {},
      reloadPage: () => {},
      setSaveStatus: (value) => {
        refs.saveStatus.value = value;
      },
    },
  });

  return { feature, refs, settings, ensureCalls };
}

test('cloud sync restore normalizes legacy pool items and restores the last valid session', async () => {
  const cloudContent = {
    pool: [{ id: 'POOL_LEGACY', name: 'Legacy pool item' }],
    tasks: [{ scheduleId: 'TASK_1', templateId: 'POOL_LEGACY' }],
    settings: {
      startHour: 8,
      endHour: 19,
      sessions: [
        { id: 'S_A', name: 'Session A' },
        { id: 'S_B', name: 'Session B' },
      ],
      lastSessionId: 'S_B',
      instruments: [],
      musicians: [],
      projects: [],
    },
  };
  const { feature, refs, settings, ensureCalls } = createAuthHarness({ cloudContent });

  await feature.loadCloudData();

  assert.deepEqual(ensureCalls, ['POOL_LEGACY'], 'cloud restore should normalize every restored pool item');
  assert.deepEqual(refs.itemPool.value[0].records, { musician: {}, project: {}, instrument: {} });
  assert.deepEqual(refs.scheduledTasks.value, cloudContent.tasks, 'cloud restore should preserve scheduled tasks from the server');
  assert.equal(refs.localDataVersion.value, 3, 'cloud restore should retain the server data version');
  assert.equal(settings.startHour, 8, 'cloud restore should merge synced settings');
  assert.equal(refs.currentSessionId.value, 'S_B', 'cloud restore should select the synced last session when it still exists');
});

test('cloud sync restore falls back to the first available session when lastSessionId is stale', async () => {
  const { feature, refs } = createAuthHarness({
    cloudContent: {
      pool: [],
      tasks: [],
      settings: {
        sessions: [{ id: 'S_ONLY', name: 'Only Session' }],
        lastSessionId: 'S_MISSING',
      },
    },
  });

  await feature.loadCloudData();

  assert.equal(refs.currentSessionId.value, 'S_ONLY');
});
