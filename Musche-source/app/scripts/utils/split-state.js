import { formatSecs } from './format.js';
import { parseTime } from './time.js';

const DEFAULT_VIEW = 'musician';
const SUPPORTED_VIEWS = ['musician', 'project'];

const formatMusicDuration = (seconds) => {
  if (seconds >= 3600) return formatSecs(seconds);

  const safeSeconds = Math.max(0, Math.round(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const normalizeSectionIndex = (value) => {
  if (Number.isInteger(value)) return value;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const createSplitState = (seed = {}) => ({
  active: seed.active !== false,
  splitFromId: seed.splitFromId || null,
  splitTag: seed.splitTag || '',
  musicDuration: seed.musicDuration || '',
  estDuration: seed.estDuration || '',
  sectionIndex: normalizeSectionIndex(seed.sectionIndex),
});

export const getItemSplitParentIds = (item) => {
  const parentIds = new Set();

  if (item?.splitFromId) parentIds.add(item.splitFromId);
  if (item?.splitViews) {
    SUPPORTED_VIEWS.forEach((viewType) => {
      const parentId = item.splitViews?.[viewType]?.splitFromId;
      if (parentId) parentIds.add(parentId);
    });
  }

  return [...parentIds];
};

export const normalizeSplitViewType = (viewType) => (
  SUPPORTED_VIEWS.includes(viewType) ? viewType : DEFAULT_VIEW
);

export const createHiddenSplitState = () => ({
  active: false,
  splitFromId: null,
  splitTag: '',
  musicDuration: '',
  estDuration: '',
  sectionIndex: 0,
});

export const ensureItemSplitViews = (item) => {
  if (!item.splitViews) item.splitViews = {};

  const legacySeed = createSplitState({
    active: true,
    splitFromId: item.splitFromId,
    splitTag: item.splitTag,
    musicDuration: item.musicDuration,
    estDuration: item.estDuration,
    sectionIndex: item.sectionIndex,
  });

  SUPPORTED_VIEWS.forEach((viewType) => {
    if (item.splitViews[viewType]) {
      item.splitViews[viewType] = createSplitState(item.splitViews[viewType]);
    } else {
      item.splitViews[viewType] = { ...legacySeed };
    }
  });

  return item;
};

export const getItemSplitState = (item, viewType) => {
  ensureItemSplitViews(item);
  return item.splitViews[normalizeSplitViewType(viewType)];
};

export const peekItemSplitState = (item, viewType) => {
  const normalizedView = normalizeSplitViewType(viewType);
  const existingState = item?.splitViews?.[normalizedView];

  if (existingState) {
    return createSplitState(existingState);
  }

  return createSplitState({
    active: true,
    splitFromId: item?.splitFromId,
    splitTag: item?.splitTag,
    musicDuration: item?.musicDuration,
    estDuration: item?.estDuration,
    sectionIndex: item?.sectionIndex,
  });
};

export const setItemSplitState = (item, viewType, patch = {}) => {
  const current = getItemSplitState(item, viewType);
  item.splitViews[normalizeSplitViewType(viewType)] = createSplitState({
    ...current,
    ...patch,
  });
  return item.splitViews[normalizeSplitViewType(viewType)];
};

export const syncVisibleSplitDuration = (item, musicDuration, estDuration) => {
  ensureItemSplitViews(item);

  SUPPORTED_VIEWS.forEach((viewType) => {
    if (item.splitViews[viewType].active !== false) {
      item.splitViews[viewType] = createSplitState({
        ...item.splitViews[viewType],
        musicDuration,
        estDuration,
      });
    }
  });

  return item;
};

export const getVisibleConnectedSplitItems = (items, seedId, viewType) => {
  const connectedIds = getConnectedSplitItemIds(items, seedId);
  return items.filter((item) => (
    connectedIds.has(item.id) && peekItemVisibilityInView(item, viewType)
  ));
};

const getOrderedVisibleConnectedSplitItems = (items, seedId, viewType) => (
  getVisibleConnectedSplitItems(items, seedId, viewType).sort((a, b) => {
    const aState = peekItemSplitState(a, viewType);
    const bState = peekItemSplitState(b, viewType);

    if (aState.sectionIndex !== bState.sectionIndex) {
      return aState.sectionIndex - bState.sectionIndex;
    }

    return a.id.localeCompare(b.id);
  })
);

export const syncLegacySplitFields = (item, viewType) => {
  const state = getItemSplitState(item, viewType);

  item.splitFromId = state.splitFromId;
  item.musicDuration = state.musicDuration;
  item.estDuration = state.estDuration;
  item.sectionIndex = state.sectionIndex;

  if (state.splitTag) item.splitTag = state.splitTag;
  else delete item.splitTag;

  return item;
};

export const isItemVisibleInView = (item, viewType) => (
  getItemSplitState(item, viewType).active !== false
);

export const peekItemVisibilityInView = (item, viewType) => (
  peekItemSplitState(item, viewType).active !== false
);

export const deactivateItemInView = (item, viewType) => (
  setItemSplitState(item, viewType, createHiddenSplitState())
);

export const hasVisibleSplitStateInAnyView = (item) => {
  ensureItemSplitViews(item);
  return SUPPORTED_VIEWS.some((viewType) => item.splitViews[viewType].active !== false);
};

export const getConnectedSplitItemIds = (items, seedId) => {
  const connectedIds = new Set();
  const queue = [seedId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId || connectedIds.has(currentId)) continue;

    connectedIds.add(currentId);

    items.forEach((item) => {
      const parentIds = getItemSplitParentIds(item);
      if (item.id === currentId || parentIds.includes(currentId)) {
        if (!connectedIds.has(item.id)) queue.push(item.id);
        parentIds.forEach((parentId) => {
          if (!connectedIds.has(parentId)) queue.push(parentId);
        });
      }
    });
  }

  return connectedIds;
};

export const rebalanceSplitFamilyDuration = (
  items,
  seedId,
  viewType,
  editedItemId,
  nextMusicDuration,
  estimateFn
) => {
  const visibleItems = getOrderedVisibleConnectedSplitItems(items, seedId, viewType);
  if (visibleItems.length < 2) {
    return { ok: true, totalMusicDuration: nextMusicDuration };
  }

  const totalSeconds = visibleItems.reduce(
    (sum, item) => sum + parseTime(peekItemSplitState(item, viewType).musicDuration || '00:00'),
    0
  );
  const nextSeconds = parseTime(nextMusicDuration || '00:00');
  const totalMusicDuration = formatMusicDuration(totalSeconds);

  if (nextSeconds > totalSeconds) {
    return {
      ok: false,
      reason: 'exceeds_total',
      totalMusicDuration,
    };
  }

  const targetItem = [...visibleItems].reverse().find((item) => item.id !== editedItemId);
  if (!targetItem) {
    return { ok: true, totalMusicDuration };
  }

  const fixedItems = visibleItems.filter((item) => (
    item.id !== editedItemId && item.id !== targetItem.id
  ));
  const fixedSeconds = fixedItems.reduce(
    (sum, item) => sum + parseTime(peekItemSplitState(item, viewType).musicDuration || '00:00'),
    0
  );
  const remainingSeconds = totalSeconds - nextSeconds - fixedSeconds;

  if (remainingSeconds < 0) {
    return {
      ok: false,
      reason: 'exceeds_total',
      totalMusicDuration,
    };
  }

  const editedItem = visibleItems.find((item) => item.id === editedItemId);
  if (editedItem) {
    const nextEst = typeof estimateFn === 'function'
      ? estimateFn(editedItem, nextMusicDuration)
      : peekItemSplitState(editedItem, viewType).estDuration;

    setItemSplitState(editedItem, viewType, {
      musicDuration: nextMusicDuration,
      estDuration: nextEst,
    });
  }

  const remainingMusicDuration = formatMusicDuration(remainingSeconds);
  const targetEst = typeof estimateFn === 'function'
    ? estimateFn(targetItem, remainingMusicDuration)
    : peekItemSplitState(targetItem, viewType).estDuration;

  setItemSplitState(targetItem, viewType, {
    musicDuration: remainingMusicDuration,
    estDuration: targetEst,
  });

  return {
    ok: true,
    totalMusicDuration,
    adjustedItemId: targetItem.id,
  };
};

export const syncFamilyTotalDuration = (items, seedId, sourceViewType, estimateFn) => {
  const connectedIds = getConnectedSplitItemIds(items, seedId);
  const sourceItems = getVisibleConnectedSplitItems(items, seedId, sourceViewType);

  const totalSeconds = sourceItems.reduce(
    (sum, item) => sum + parseTime(peekItemSplitState(item, sourceViewType).musicDuration || '00:00'),
    0
  );
  const totalMusicDuration = formatMusicDuration(totalSeconds);

  items.forEach((item) => {
    if (connectedIds.has(item.id)) {
      item.sharedMusicDuration = totalMusicDuration;
    }
  });

  SUPPORTED_VIEWS.forEach((viewType) => {
    const visibleItems = getVisibleConnectedSplitItems(items, seedId, viewType);
    if (visibleItems.length !== 1) return;

    const target = visibleItems[0];
    const currentState = getItemSplitState(target, viewType);
    const nextEst = typeof estimateFn === 'function'
      ? estimateFn(target, totalMusicDuration)
      : currentState.estDuration;

    setItemSplitState(target, viewType, {
      musicDuration: totalMusicDuration,
      estDuration: nextEst,
    });
  });

  return totalMusicDuration;
};
