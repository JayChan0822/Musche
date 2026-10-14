import { formatDate } from './format.js';

export const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
export const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
export const dateFromKey = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d, 12); };
export const shiftDate = (key, offset) => { const d = dateFromKey(key); d.setDate(d.getDate() + offset); return formatDate(d); };
export const monthKey = (date) => formatDate(date).slice(0, 7);
const lunarFormatter = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', { year: 'numeric', month: 'long', day: 'numeric' });
const lunarCache = new Map();
export function lunarLabel(key, full = false) {
  if (!lunarCache.has(key)) {
    const parts = lunarFormatter.formatToParts(dateFromKey(key));
    const n = Number(parts.find(p => p.type === 'day')?.value);
    const year = parts.find(p => p.type === 'yearName')?.value || '';
    const month = parts.find(p => p.type === 'month')?.value || '';
    const digits = '一二三四五六七八九';
    const label = n === 10 ? '初十' : n === 20 ? '二十' : n === 30 ? '三十' : n < 10 ? `初${digits[n - 1]}` : n < 20 ? `十${digits[n - 11]}` : `廿${digits[n - 21]}`;
    if (lunarCache.size > 2000) lunarCache.clear();
    lunarCache.set(key, { short: n === 1 ? month : label, full: `${year ? year + '年' : ''}${month}${label}` });
  }
  return lunarCache.get(key)[full ? 'full' : 'short'];
}
export function describeDate(key) {
  const date = dateFromKey(key);
  return { key, number: date.getDate(), weekday: date.getDay(), lunar: lunarLabel(key), month: date.getMonth(), year: date.getFullYear() };
}
export function monthWindow(anchor, radius = 5) {
  return Array.from({ length: radius * 2 + 1 }, (_, i) => {
    const date = new Date(anchor.getFullYear(), anchor.getMonth() + i - radius, 1, 12);
    const start = date.getDay();
    const count = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return { key: monthKey(date), year: date.getFullYear(), month: date.getMonth(), start,
      rows: Math.ceil((start + count) / 7),
      days: Array.from({ length: start + count }, (_, j) => j < start ? null : describeDate(formatDate(new Date(date.getFullYear(), date.getMonth(), j - start + 1, 12)))) };
  });
}
export function dateWeek(key) {
  const start = shiftDate(key, -dateFromKey(key).getDay());
  return Array.from({ length: 7 }, (_, i) => describeDate(shiftDate(start, i)));
}
