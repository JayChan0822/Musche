import assert from 'node:assert/strict';
import test from 'node:test';

import { ref } from 'vue';

import { registerAuthFeature } from '../app/scripts/features/auth.js';
import { createDefaultSettings } from '../app/scripts/state/defaults.js';

const CLOUD_CACHE_KEY = 'musche_cloud_cache_v11';

function createAuthHarness({
  cloudContent,
  version = 3,
  cachedData = null,
  sessionUser = { id: 'USER_1', email: 'sync@example.com', user_metadata: {} },
  getSession,
  loadUserData,
  startupTimeoutMs = 20,
  storageOverrides = {},
  actionOverrides = {},
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
        ...storageOverrides,
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
      ...actionOverrides,
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
  assert.deepEqual(refs.scheduledTasks.value, cloudContent.tasks.map(task => ({...task, stage:'rec', editorId:''})), 'cloud restore should preserve scheduled tasks from the server');
  assert.equal(refs.localDataVersion.value, 3, 'cloud restore should retain the server data version');
  assert.equal(settings.startHour, 8, 'cloud restore should merge synced settings');
  assert.equal(refs.currentSessionId.value, 'S_B', 'cloud restore should select the synced last session when it still exists');
});

test('exporting a conflict backup dismisses only that archived draft across reloads', async () => {
  const store=new Map();
  const draftKey='musche_workflow_unsynced_v11:USER_1';
  const draft={version:1,content:{pool:[{id:'LOCAL'}],tasks:[],settings:{}}};
  store.set(draftKey,draft);
  const storageOverrides={loadData:key=>store.get(key),saveData:(key,value)=>store.set(key,JSON.parse(JSON.stringify(value))),setItem:(key,value)=>store.set(key,value)};
  let prompts=0, exported=null, confirm;
  const options={version:3,cloudContent:{pool:[],tasks:[],settings:{}},storageOverrides,actionOverrides:{
    openConfirmModal:(_title,_text,callback)=>{prompts++;confirm=callback;},
    exportUnsyncedBackup:content=>{exported=content;},
  }};
  const h=createAuthHarness(options);
  await h.feature.loadCloudData();assert.equal(prompts,1);
  await confirm();assert.deepEqual(exported,draft.content);
  await createAuthHarness(options).feature.loadCloudData();assert.equal(prompts,1);
  assert.ok([...store.keys()].some(key=>key.startsWith('musche_workflow_recovery:')));
  store.set(draftKey,{...draft,content:{...draft.content,pool:[{id:'NEW_LOCAL'}]}});
  await createAuthHarness(options).feature.loadCloudData();assert.equal(prompts,2);
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

  const cacheWrites = savedData.filter(([key]) => key === CLOUD_CACHE_KEY);
  assert.equal(cacheWrites.length, 1);
  assert.equal(cacheWrites[0][0], CLOUD_CACHE_KEY);
  assert.equal(savedData[0][1].user.id, 'USER_1');
  assert.equal(savedData[0][1].version, 9);
  assert.equal(savedData[0][1].content.pool[0].records.musician.constructor, Object);
  assert.deepEqual(savedData[0][1].content.tasks, cloudContent.tasks.map(task => ({...task, stage:'rec', editorId:''})));
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

  assert.equal(savedData.length, 2, 'write persists a recoverable draft before cloud save');
  assert.equal(savedData[0][0], 'musche_workflow_unsynced_v11:USER_1');
  assert.equal(savedData[1][1].version, 7);
  assert.equal(savedData[1][1].content.pool[0].id, 'POOL_SAVED');
  assert.equal(savedData[1][1].content.tasks[0].scheduleId, 'TASK_SAVED');
});

test('a conflicting local draft is archived before a later save replaces the working draft', async () => {
  const key='musche_workflow_unsynced_v11:USER_1';
  const draft={version:2,content:{pool:[{id:'LOCAL_ONLY'}],tasks:[],settings:{}}};
  const writes=[];
  const h=createAuthHarness({version:6,cloudContent:{pool:[{id:'CLOUD'}],tasks:[],settings:{}},storageOverrides:{
    loadData:k=>k===key?draft:null,
    saveData:(k,v)=>writes.push([k,JSON.parse(JSON.stringify(v))]),
  }});
  await h.feature.loadCloudData();
  await h.feature.saveToCloud(()=>{});
  const archived=writes.find(([k])=>k.startsWith('musche_workflow_recovery:'));
  assert.ok(archived);
  assert.deepEqual(archived[1],draft);
  assert.ok(writes.findIndex(([k])=>k===archived[0]) < writes.findIndex(([k])=>k===key));
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


test('future schema fails before replacing data or allowing cloud writes', async () => {
 const {feature, refs, alerts, savedData}=createAuthHarness({cloudContent:{schemaVersion:12,pool:[{id:'future'}],tasks:[],settings:{}}});
 refs.itemPool.value=[{id:'untouched'}];
 await assert.rejects(feature.loadCloudData(), /newer/);
 assert.equal(refs.itemPool.value[0].id,'untouched');
 await feature.saveToCloud(()=>{});
 assert.equal(savedData.length,0); assert.equal(refs.saveStatus.value,'error');
 assert.ok(alerts.some(([title])=>title.includes('数据保护')));
});


test('backup failure leaves live data unchanged and blocks writes', async () => {
 const {feature,refs}=createAuthHarness({cloudContent:{pool:[{id:'incoming'}],tasks:[],settings:{}},storageOverrides:{setItem:()=>{throw Error('quota exceeded');}}});
 refs.itemPool.value=[{id:'existing'}];
 await assert.rejects(feature.loadCloudData(),/quota/);
 assert.equal(refs.itemPool.value[0].id,'existing');
 assert.equal(refs.saveStatus.value,'error');
});
test('offline bootstrap restores the unsynced local draft over older cache', async()=>{
 const cachedData={user:{id:'USER_1',email:'a@b.c'},version:4,content:{schemaVersion:10,pool:[{id:'old'}],tasks:[],settings:{}}};
 const draft={version:4,content:{schemaVersion:10,pool:[{id:'draft',editorId:'editor'}],tasks:[],settings:{}}};
 const {feature,refs}=createAuthHarness({cachedData,getSession:()=>new Promise(()=>{}),startupTimeoutMs:5,storageOverrides:{loadData:key=>key===CLOUD_CACHE_KEY?cachedData:key==='musche_workflow_unsynced_v11:USER_1'?draft:null}});
 await feature.bootSessionData();
 assert.equal(refs.itemPool.value[0].id,'draft'); assert.equal(refs.saveStatus.value,'unsaved');
});
