export function extractTime(value) {
  const match = value.match(/(\d{1,2})[:：](\d{2})/);
  if (!match) return '';
  return `${String(match[1]).padStart(2, '0')}:${match[2]}`;
}

export function normalizeDate(input) {
  if (!input) return '';

  const date = new Date(input.replace(/\./g, '/').replace(/-/g, '/'));
  if (Number.isNaN(date.getTime())) return input.trim();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getOrchString(names) {
  const counts = {};
  const displayNames = {};
  const abbrMap = {
    violin: 'Vln',
    viola: 'Vla',
    cello: 'Vc',
    'double bass': 'Db',
    flute: 'Fl',
  };

  names.forEach((name) => {
    const rawClean = name.replace(/[\d\s]+$/g, '').trim();
    const lower = rawClean.toLowerCase();

    counts[lower] = (counts[lower] || 0) + 1;

    if (!displayNames[lower]) {
      displayNames[lower] = abbrMap[lower]
        ? abbrMap[lower]
        : rawClean.charAt(0).toUpperCase() + rawClean.slice(1);
    }
  });

  return Object.entries(counts)
    .map(([lower, count]) => `${count} ${displayNames[lower]}`)
    .join(', ');
}
