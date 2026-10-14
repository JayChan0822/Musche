// 周条和时间轴共享翻日进度；跨周时移动整条日期轨道，提交日期前后几何等价。
export function weekStripGeometry(weekday, dayOffset, width) {
  const index = weekday + dayOffset;
  const cellWidth = width / 7;
  const weekOffset = Math.max(-1, Math.min(0, index)) + Math.max(0, Math.min(1, index - 6));
  return {
    cellWidth,
    trackOffset: -(1 + weekOffset) * width,
    selectionLeft: (7 + index + .5) * cellWidth - 20,
  };
}
