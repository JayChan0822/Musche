import assert from 'node:assert/strict';
import test from 'node:test';

import { registerGlobalKeyboardFeature } from '../app/scripts/features/global-keyboard.js';
import { registerMainViewNavigationFeature } from '../app/scripts/features/main-view-navigation.js';
import { registerAuthFeature } from '../app/scripts/features/auth.js';
import { createDefaultSettings } from '../app/scripts/state/defaults.js';

const ref = (value) => ({ value });
const falseRef = () => ref(false);
const nullRef = () => ref(null);

function createKeyboard(overrides = {}) {
  const calls = { cancel: 0 };
  const refs = {
    currentSessionId: ref('S1'),
    currentView: ref('week'),
    sidebarTab: ref('musician'),
    ...(overrides.refs || {}),
  };
  const actions = {
    getSettings: () => ({ sessions: [{ id: 'S1' }, { id: 'S2' }, { id: 'S3' }] }),
    getActiveElement: () => ({ tagName: 'BODY' }),
    cancelPendingTrackSave: () => { calls.cancel += 1; },
    ...(overrides.actions || {}),
  };
  const feature = registerGlobalKeyboardFeature({
    refs,
    state: {},
    actions,
  });
  return { feature, refs, calls };
}

const altTab = (shiftKey = false) => ({ key: 'Tab', altKey: true, shiftKey, preventDefault: () => {} });

test('Alt+Tab switches session and cancels the pending track-save only when the session actually changes', () => {
  const { feature, refs, calls } = createKeyboard();

  feature.handleGlobalKey(altTab());
  assert.equal(refs.currentSessionId.value, 'S2', 'forward Alt+Tab advances the session');
  assert.equal(calls.cancel, 1, 'session change must cancel the pending write-back');

  feature.handleGlobalKey(altTab(true));
  assert.equal(refs.currentSessionId.value, 'S1', 'shift+Alt+Tab goes backward');
  assert.equal(calls.cancel, 2);
});

test('Alt+Tab with a single session does not cancel (no actual switch, write-back must survive)', () => {
  const { feature, refs, calls } = createKeyboard({
    actions: { getSettings: () => ({ sessions: [{ id: 'S1' }] }) },
  });

  feature.handleGlobalKey(altTab());
  assert.equal(refs.currentSessionId.value, 'S1', 'single session stays put');
  assert.equal(calls.cancel, 0, 'no-op switch must not drop the pending write-back');

  feature.handleGlobalKey(altTab(true));
  assert.equal(calls.cancel, 0, 'reverse no-op switch must not cancel either');
});

test('Alt+Tab with zero sessions is safe and does not cancel', () => {
  const { feature, refs, calls } = createKeyboard({
    actions: { getSettings: () => ({ sessions: [] }) },
  });

  feature.handleGlobalKey(altTab());
  assert.equal(refs.currentSessionId.value, 'S1', 'zero sessions leaves the id untouched');
  assert.equal(calls.cancel, 0);
});

test('ghost-task cross-session jump cancels the pending write-back before switching', () => {
  const calls = { cancel: 0 };
  const currentSessionId = ref('S1');
  const sidebarTab = ref('musician');
  const feature = registerMainViewNavigationFeature({
    refs: {
      currentView: ref('week'),
      monthViewMode: ref('week'),
      viewDate: ref(new Date()),
      dayColWidth: ref(100),
      isMobile: ref(false),
      isResizingMobile: ref(false),
      currentSessionId,
      sidebarTab,
      flashingTaskId: ref(null),
      isContextSwitching: ref(false),
    },
    services: { storageService: { saveData: () => {}, loadData: () => ({}) } },
    actions: {
      changeDate: () => {},
      scrollToMonthDate: () => {},
      isDragActive: () => false,
      cancelPendingTrackSave: () => { calls.cancel += 1; },
      getWindow: () => ({ setTimeout: () => 0 }),
      setTimeoutFn: () => 0,
    },
  });

  feature.jumpToGhostContext({ sessionId: 'S3', musicianId: 'M1' });

  assert.equal(calls.cancel, 1, 'cross-session ghost jump must cancel the pending write-back');
  assert.equal(currentSessionId.value, 'S3');

  // 同 session 跳转：不 cancel
  feature.jumpToGhostContext({ sessionId: 'S3', musicianId: 'M1' });
  assert.equal(calls.cancel, 1, 'same-session jump must not cancel');
});

test('auth cloud-load empty path cancels the pending write-back before resetWorkingData replaces the pool', async () => {
  const calls = { cancel: 0 };
  const refs = {
    user: ref({ id: 'U1' }),
    showAuthModal: ref(false),
    authLoading: ref(false),
    authForm: ref({ mode: 'login', email: '', password: '' }),
    activeDropdown: ref(null),
    showProfileMenu: ref(false),
    showMobileMenu: ref(false),
    tempAvatarUrl: ref(''),
    tempNickname: ref(''),
    localDataVersion: ref(0),
    saveStatus: ref('idle'),
    isSyncing: ref(false),
    itemPool: ref([{ id: 'OLD' }]),
    scheduledTasks: ref([{ scheduleId: 1 }]),
    currentSessionId: ref('S1'),
  };
  const settings = { ...createDefaultSettings() };
  const feature = registerAuthFeature({
    refs,
    state: { settings },
    utils: {
      formatDate: () => '',
      ensureItemRecords: (item) => (item.records ? item : { ...item, records: {} }),
      calculateEstTime: (d, r) => d,
      generateUniqueId: (p) => `${p}_1`,
    },
    services: {
      storageService: { saveData: () => {}, loadData: () => null },
      supabaseService: { loadUserData: async () => ({ data: null, error: null }) },
    },
    actions: {
      pushHistory: () => {},
      openAlertModal: () => {},
      openConfirmModal: () => {},
      cancelPendingTrackSave: () => { calls.cancel += 1; },
      reloadPage: () => {},
      getLocationOrigin: () => 'http://localhost',
      getUploadTextElement: () => null,
      setSaveStatus: () => {},
    },
  });

  // 云端无 content → clearCloudCache + resetWorkingData（内部先 cancel）
  await feature.loadCloudData();
  assert.equal(calls.cancel, 1, 'empty cloud load must cancel the pending write-back before reset');
  assert.equal(refs.itemPool.value.length, 0, 'reset replaces the pool with empty');
});
