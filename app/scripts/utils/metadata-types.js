export const metadataTypes = [
  { type: 'studio', label: '录音棚', icon: 'fa-building' },
  { type: 'engineer', label: '工程师', icon: 'fa-sliders' },
  { type: 'operator', label: '操作员', icon: 'fa-headphones' },
  { type: 'assistant', label: '助理', icon: 'fa-user-group' },
];

const colors = ['#567b9c', '#7970ac', '#ad718d', '#558e85', '#a78050', '#678750'];
export function metadataAvatarColor(item, type) {
  if (item?.color) return item.color;
  const hash = [...`${type}:${item?.id ?? item?.name ?? ''}`].reduce((value, char) => (value * 31 + char.codePointAt(0)) >>> 0, 0);
  return colors[hash % colors.length];
}
