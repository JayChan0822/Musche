// 侧栏任务分类的唯一真源：录音（musician / REC）与编辑（project / EDIT）两类。
// 早期还有乐器（instrument）分类，已下线（app-sidebar 里的 INST 按钮已注释掉），
// 手势翻页、ghost 跳转、键盘切换一律以这里为准，避免落到没有入口的分类。
export const SIDEBAR_TABS = ['musician', 'project'];

export const DEFAULT_SIDEBAR_TAB = SIDEBAR_TABS[0];

export const isSidebarTab = (tab) => SIDEBAR_TABS.includes(tab);

// 按候选优先级挑一个仍然存在的分类（候选全下线时回落到默认分类）
export const pickSidebarTab = (candidates = []) =>
  candidates.find((tab) => isSidebarTab(tab)) || DEFAULT_SIDEBAR_TAB;

// 在分类之间循环切换（当前分类已下线时回到第一个）
export const nextSidebarTab = (currentTab) => {
  const index = SIDEBAR_TABS.indexOf(currentTab);
  if (index === -1) return DEFAULT_SIDEBAR_TAB;
  return SIDEBAR_TABS[(index + 1) % SIDEBAR_TABS.length];
};
