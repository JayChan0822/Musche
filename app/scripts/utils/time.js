export function parseTime(value) {
  if (!value) return 0;
  const parts = value.toString().trim().split(':').map(Number);
  if (parts.some(Number.isNaN)) return 0;

  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] || 0;
}

export function timeToMinutes(value) {
  if (!value) return 0;
  const [hours = 0, minutes = 0] = value.toString().split(':').map(Number);
  return hours * 60 + minutes;
}

export function addMinutesToTime(time, minutes, options = {}) {
  const {
    minMinutes = Number.NEGATIVE_INFINITY,
    maxMinutes = Number.POSITIVE_INFINITY,
    stepMinutes = 1,
  } = options;

  let nextMinutes = timeToMinutes(time) + minutes;
  nextMinutes = Math.max(minMinutes, Math.min(maxMinutes, nextMinutes));

  if (stepMinutes > 1) {
    nextMinutes = Math.round(nextMinutes / stepMinutes) * stepMinutes;
  }

  const hours = Math.floor(nextMinutes / 60);
  const remainingMinutes = nextMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
}

export function addDaysToDate(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const day = String(nextDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
