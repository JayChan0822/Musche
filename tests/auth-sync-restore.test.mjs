import assert from 'node:assert/strict';
import test from 'node:test';

import { ref } from 'vue';

import { registerAuthFeature } from '../app/scripts/features/auth.js';
import { createDefaultSettings } from '../app/scripts/state/defaults.js';

const CLOUD_CACHE_KEY = 'musche_cloud_cache_v1';

function createAuthHarness({
  cloudContent,
  version = 3,
  cachedData = null,
  sessionUser = { id: 'USER_1', email: 'sync@example.com', user_metadata: {} },
  getSession,
  loadUserData,
  startupTimeoutMs = 20,
} = {}) {
  const settings = createDefaultSettings();
  const ensureCalls = [];
  const savedData = [];
  const removedItems = [];
  const alerts = [];
  let confirmAction = null;
  let reloadCount = 0;
  const refs = {
    user: ref(sessionUser),
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
        loadData: (key) => (key === CLOUD_CACHE_KEY ? cachedData : null),
        saveData: (key, value) => savedData.push([key, value]),
        setItem: () => {},
        removeItem: (key) => removedItems.push(key),
      },
      supabaseService: {
        getSession: getSession || (async () => ({ data: { session: sessionUser ? { user: sessionUser } : null }, error: null })),
        loadUserData: loadUserData || (async () => ({ data: { version, content: cloudContent }, error: null })),
        fetchUserDataVersion: async () => ({ data: { version }, error: null }),
        saveUserData: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
        deleteUserData: async () => ({ error: null }),
      },
    },
    actions: {
      pushHistory: () => {},
      openAlertModal: (...args) => alerts.push(args),
      openConfirmModal: (...args) => {
        confirmAction = args[2];
      },
      triggerTouchHaptic: () => {},
      reloadPage: () => {
        reloadCount += 1;
      },
      startupTimeoutMs,
      setSaveStatus: (value) => {
        refs.saveStatus.value = value;
      },
    },
  });

  return {
    feature,
    refs,
    settings,
    ensureCalls,
    savedData,
    removedItems,
    alerts,
    getConfirmAction: () => confirmAction,
    getReloadCount: () => reloadCount,
  };
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

test('cloud sync restore caches the normalized snapshot for the signed-in user', async () => {
  const cloudContent = {
    pool: [{ id: 'POOL_CACHE', name: 'Cached later' }],
    tasks: [{ scheduleId: 'TASK_CACHE' }],
    settings: {
      sessions: [{ id: 'S_CACHE', name: 'Cache session' }],
      lastSessionId: 'S_CACHE',
    },
  };
  const { feature, savedData } = createAuthHarness({ cloudContent, version: 9 });

  await feature.loadCloudData();

  assert.equal(savedData.length, 1);
  assert.equal(savedData[0][0], CLOUD_CACHE_KEY);
  assert.equal(savedData[0][1].user.id, 'USER_1');
  assert.equal(savedData[0][1].version, 9);
  assert.equal(savedData[0][1].content.pool[0].records.musician.constructor, Object);
  assert.deepEqual(savedData[0][1].content.tasks, cloudContent.tasks);
});

test('boot restores a matching cloud cache before session recovery finishes', async () => {
  const cachedData = {
    user: { id: 'USER_1', email: 'cached@example.com', user_metadata: { full_name: 'Cached User' } },
    version: 4,
    content: {
      pool: [{ id: 'POOL_FAST', name: 'Immediate', records: { musician: {}, project: {}, instrument: {} } }],
      tasks: [{ scheduleId: 'TASK_FAST' }],
      settings: {
        sessions: [{ id: 'S_FAST', name: 'Fast session' }],
        lastSessionId: 'S_FAST',
      },
    },
  };
  const never = new Promise(() => {});
  const { feature, refs } = createAuthHarness({
    cachedData,
    getSession: () => never,
    startupTimeoutMs: 5,
  });

  const bootPromise = feature.bootSessionData();
  await Promise.resolve();

  assert.equal(refs.user.value.user_metadata.full_name, 'Cached User');
  assert.equal(refs.itemPool.value[0].id, 'POOL_FAST');
  assert.equal(refs.scheduledTasks.value[0].scheduleId, 'TASK_FAST');
  assert.equal(refs.currentSessionId.value, 'S_FAST');

  await bootPromise;
});

test('cloud startup timeout keeps a matching cached snapshot', async () => {
  const cachedData = {
    user: { id: 'USER_1', email: 'cached@example.com', user_metadata: {} },
    version: 4,
    content: {
      pool: [{ id: 'POOL_KEEP', records: { musician: {}, project: {}, instrument: {} } }],
      tasks: [{ scheduleId: 'TASK_KEEP' }],
      settings: { sessions: [{ id: 'S_KEEP', name: 'Keep' }], lastSessionId: 'S_KEEP' },
    },
  };
  const { feature, refs } = createAuthHarness({
    cachedData,
    loadUserData: () => new Promise(() => {}),
    startupTimeoutMs: 5,
  });

  await feature.bootSessionData();

  assert.equal(refs.itemPool.value[0].id, 'POOL_KEEP');
  assert.equal(refs.scheduledTasks.value[0].scheduleId, 'TASK_KEEP');
});

test('a different signed-in account cannot retain the previous account cache after timeout', async () => {
  const cachedData = {
    user: { id: 'USER_OLD', email: 'old@example.com', user_metadata: {} },
    version: 2,
    content: {
      pool: [{ id: 'POOL_OLD', records: { musician: {}, project: {}, instrument: {} } }],
      tasks: [{ scheduleId: 'TASK_OLD' }],
      settings: { sessions: [{ id: 'S_OLD', name: 'Old' }], lastSessionId: 'S_OLD' },
    },
  };
  const newUser = { id: 'USER_NEW', email: 'new@example.com', user_metadata: {} };
  const { feature, refs, settings, removedItems } = createAuthHarness({
    cachedData,
    sessionUser: newUser,
    loadUserData: () => new Promise(() => {}),
    startupTimeoutMs: 5,
  });

  await feature.bootSessionData();

  assert.equal(refs.user.value.id, 'USER_NEW');
  assert.notEqual(refs.itemPool.value[0]?.id, 'POOL_OLD');
  assert.notEqual(refs.currentSessionId.value, 'S_OLD');
  assert.notEqual(settings.sessions[0]?.id, 'S_OLD');
  assert.ok(removedItems.includes(CLOUD_CACHE_KEY));
});

test('a confirmed guest session clears cached account data before loading guest defaults', async () => {
  const cachedData = {
    user: { id: 'USER_OLD', email: 'old@example.com', user_metadata: {} },
    version: 2,
    content: {
      pool: [{ id: 'POOL_OLD', records: { musician: {}, project: {}, instrument: {} } }],
      tasks: [{ scheduleId: 'TASK_OLD' }],
      settings: { sessions: [{ id: 'S_OLD', name: 'Old' }], lastSessionId: 'S_OLD' },
    },
  };
  const { feature, refs, settings } = createAuthHarness({
    cachedData,
    sessionUser: null,
  });

  await feature.bootSessionData();

  assert.equal(refs.user.value, null);
  assert.notEqual(refs.itemPool.value[0]?.id, 'POOL_OLD');
  assert.notEqual(refs.currentSessionId.value, 'S_OLD');
  assert.notEqual(settings.sessions[0]?.id, 'S_OLD');
});

test('successful cloud save refreshes the cached snapshot version and content', async () => {
  const { feature, refs, savedData } = createAuthHarness({ version: 6 });
  refs.itemPool.value = [{ id: 'POOL_SAVED', records: { musician: {}, project: {}, instrument: {} } }];
  refs.scheduledTasks.value = [{ scheduleId: 'TASK_SAVED' }];
  refs.localDataVersion.value = 6;

  await feature.saveToCloud(() => {});

  assert.equal(savedData.length, 1);
  assert.equal(savedData[0][1].version, 7);
  assert.equal(savedData[0][1].content.pool[0].id, 'POOL_SAVED');
  assert.equal(savedData[0][1].content.tasks[0].scheduleId, 'TASK_SAVED');
});

test('logout clears the cached cloud snapshot before reloading', async () => {
  const { feature, removedItems, getReloadCount } = createAuthHarness();

  await feature.handleLogout();

  assert.ok(removedItems.includes(CLOUD_CACHE_KEY));
  assert.equal(getReloadCount(), 1);
});

test('factory reset clears the cached cloud snapshot', async () => {
  const { feature, removedItems, getConfirmAction } = createAuthHarness();

  feature.factoryReset();
  await getConfirmAction()();

  assert.ok(removedItems.includes(CLOUD_CACHE_KEY));
});
