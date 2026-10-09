export function registerVisiblePoolItemsFeature(context) {
  const { actions = {} } = context;
  const {
    getCurrentSidebarList = () => [],
    isStatExpanded = () => false,
  } = actions;

  const getVisiblePoolItems = () => {
    const visibleItems = [];

    getCurrentSidebarList().forEach((stat) => {
      if (isStatExpanded(stat.id)) visibleItems.push(...stat.items);
    });

    return visibleItems;
  };

  return {
    getVisiblePoolItems,
  };
}
