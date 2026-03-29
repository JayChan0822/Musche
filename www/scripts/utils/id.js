export function generateUniqueId(prefix = 't') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
}
