export function dragEdgePressure(position, start, end, zone) {
  const size = Math.min(zone, (end - start) / 2);
  if (size <= 0) return 0;
  if (position < start + size) return -Math.min(1, (start + size - position) / size);
  if (position > end - size) return Math.min(1, (position - end + size) / size);
  return 0;
}

export function dragScrollDistance(pressure, elapsed) {
  return pressure * 0.8 * Math.max(0, Math.min(elapsed, 32));
}

export function createDragEdgePaging() {
  let direction = 0;
  let nextPageAt = 0;

  return (nextDirection, time) => {
    if (nextDirection !== direction) {
      direction = nextDirection;
      nextPageAt = time + 650;
    }
    if (!direction || time < nextPageAt) return false;
    nextPageAt = time + 900;
    return true;
  };
}
