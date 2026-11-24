export const RECORDING_INFO_SEPARATOR = ' / ';

export function recordingInfoNames(value) {
  const names = new Map();
  for (const part of (value || '').split(/[/／,，、\r\n]|\^\|/)) {
    const name = part.trim();
    if (name && !names.has(name.toLowerCase())) names.set(name.toLowerCase(), name);
  }
  return [...names.values()];
}

export const formatRecordingInfoNames = (value) => recordingInfoNames(value).join(RECORDING_INFO_SEPARATOR);
