export function registerSplitViewFeature(context) {
  const { refs, split } = context;
  const { trackListData, sidebarTab } = refs;
  const {
    ensureItemSplitViews,
    syncLegacySplitFields,
    peekItemVisibilityInView,
    getItemSplitState,
    peekItemSplitState,
    normalizeSplitViewType,
  } = split;

  const syncItemForView = (item, viewType = 'musician') => {
    ensureItemSplitViews(item);
    syncLegacySplitFields(item, viewType);
    return item;
  };

  const syncItemsForView = (items, viewType = 'musician') => {
    items.forEach((item) => syncItemForView(item, viewType));
    return items;
  };

  const isItemVisibleForView = (item, viewType = 'musician') => {
    return peekItemVisibilityInView(item, viewType);
  };

  const getSplitViewState = (item, viewType = 'musician') => getItemSplitState(item, viewType);
  const peekSplitViewState = (item, viewType = 'musician') => peekItemSplitState(item, viewType);

  const getCurrentSplitView = () => normalizeSplitViewType(
    (trackListData.value && trackListData.value.viewType) || sidebarTab.value || 'musician',
  );

  return {
    syncItemForView,
    syncItemsForView,
    isItemVisibleForView,
    getSplitViewState,
    peekSplitViewState,
    getCurrentSplitView,
  };
}
