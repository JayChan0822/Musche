import { formatDate } from './format.js';

export const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
export const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
export const dateFromKey = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d, 12); };
export const shiftDate = (key, offset) => { const d = dateFromKey(key); d.setDate(d.getDate() + offset); return formatDate(d); };
export const monthKey = (date) => formatDate(date).slice(0, 7);
// Intl 的 day 是本地化字符串，不保证所有 WebKit/ICU 版本都返回阿拉伯数字。
const lunarDays = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
const chineseNumbers = ['一','二','三','四','五','六','七','八','九','十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '二十一','二十二','二十三','二十四','二十五','二十六','二十七','二十八','二十九','三十'];
export function formatLunarDateParts(parts) {
  const raw = String(parts.find(p => p.type === 'day')?.value ?? '').normalize('NFKC').trim().replace(/日$/, '');
  const n = /^\d{1,2}$/.test(raw) ? Number(raw) : Math.max(lunarDays.indexOf(raw), chineseNumbers.indexOf(raw)) + 1;
  if (!Number.isInteger(n) || n < 1 || n > 30) return { short: '', full: '' };
  const year = parts.find(p => p.type === 'yearName')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const label = lunarDays[n - 1];
  return { short: n === 1 && month ? month : label, full: `${year ? year + '年' : ''}${month}${label}` };
}
const lunarFormatter = (() => {
  try {
    const formatter = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', { year: 'numeric', month: 'long', day: 'numeric', numberingSystem: 'latn' });
    return formatter.resolvedOptions().calendar === 'chinese' ? formatter : null;
  } catch { return null; }
})();
const lunarCache = new Map();
export function lunarLabel(key, full = false) {
  if (!lunarCache.has(key)) {
    let labels = { short: '', full: '' };
    try { if (lunarFormatter) labels = formatLunarDateParts(lunarFormatter.formatToParts(dateFromKey(key))); } catch { /* 保留公历，不显示错误的农历。 */ }
    if (lunarCache.size > 2000) lunarCache.clear();
    lunarCache.set(key, labels);
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
