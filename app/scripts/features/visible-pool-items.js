export function registerVisiblePoolItemsFeature(context) {
  const { refs, actions = {} } = context;
  const { sidebarTab } = refs;
  const {
    getGroupedItemPool = () => [],
    getCurrentSidebarList = () => [],
    isGroupExpanded = () => false,
    isStatExpanded = () => false,
  } = actions;

  const getVisiblePoolItems = () => {
    const visibleItems = [];

    if (sidebarTab.value === 'browse') {
      getGroupedItemPool().forEach((group) => {
        if (isGroupExpanded(group.key)) visibleItems.push(...group.items);
      });
    } else {
      getCurrentSidebarList().forEach((stat) => {
        if (isStatExpanded(stat.id)) visibleItems.push(...stat.items);
      });
    }

    return visibleItems;
  };

  return {
    getVisiblePoolItems,
  };
}
