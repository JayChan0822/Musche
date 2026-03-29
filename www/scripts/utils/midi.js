export function calculateBarQuantizedDuration(notes, tempoMap, timeSigs) {
  if (notes.length === 0) {
    return { seconds: 0, rawSeconds: 0, bars: 0 };
  }

  let lastNoteOffTick = 0;
  notes.forEach((note) => {
    const end = note.ticks + note.durationTicks;
    if (end > lastNoteOffTick) lastNoteOffTick = end;
  });

  const ppq = tempoMap.ppq;
  let currentTick = 0;
  let sigIndex = 0;
  let validSeconds = 0;
  let validBars = 0;

  while (currentTick < lastNoteOffTick) {
    if (sigIndex + 1 < timeSigs.length && currentTick >= timeSigs[sigIndex + 1].ticks) {
      sigIndex++;
    }

    const currentSig = timeSigs[sigIndex];
    const [num, den] = currentSig.timeSignature;
    const ticksPerBar = (ppq * 4 / den) * num;
    const barStartTick = currentTick;
    const barEndTick = currentTick + ticksPerBar;

    const isActiveBar = notes.some((note) => {
      const start = note.ticks;
      const end = note.ticks + note.durationTicks;
      return Math.max(start, barStartTick) < Math.min(end, barEndTick);
    });

    if (isActiveBar) {
      const startSec = jzzTicksToSeconds(barStartTick, tempoMap);
      const endSec = jzzTicksToSeconds(barEndTick, tempoMap);
      validSeconds += endSec - startSec;
      validBars++;
    }

    currentTick += ticksPerBar;
  }

  return {
    seconds: validSeconds,
    rawSeconds: jzzTicksToSeconds(lastNoteOffTick, tempoMap),
    bars: validBars,
  };
}

export function buildTempoMap(smf) {
  const ppq = smf.ppqn;
  const tempoEvents = [];

  smf.forEach((track) => {
    track.forEach((event) => {
      if (event.ff === 0x51) {
        const mpb = (event.dd.charCodeAt(0) << 16) | (event.dd.charCodeAt(1) << 8) | event.dd.charCodeAt(2);
        tempoEvents.push({
          tick: event.tt,
          bpm: 60000000 / mpb,
          mpb,
        });
      }
    });
  });

  if (tempoEvents.length === 0) {
    tempoEvents.push({ tick: 0, mpb: 500000 });
  }

  tempoEvents.sort((a, b) => a.tick - b.tick);

  if (tempoEvents[0].tick > 0) {
    tempoEvents.unshift({ tick: 0, mpb: 500000 });
  }

  let currentSec = 0;
  for (let index = 0; index < tempoEvents.length; index++) {
    const current = tempoEvents[index];
    const previous = tempoEvents[index - 1];
    if (previous) {
      const deltaTicks = current.tick - previous.tick;
      currentSec += (deltaTicks * previous.mpb) / (ppq * 1000000);
    }
    current.seconds = currentSec;
  }

  return { ppq, events: tempoEvents };
}

export function jzzTicksToSeconds(tick, tempoMap) {
  const { ppq, events } = tempoMap;
  let index = events.length - 1;
  while (index > 0 && events[index].tick > tick) {
    index--;
  }

  const tempo = events[index];
  const deltaTicks = tick - tempo.tick;
  return tempo.seconds + (deltaTicks * tempo.mpb) / (ppq * 1000000);
}

export function buildTimeSigMap(smf) {
  const timeSigs = [];

  smf.forEach((track) => {
    track.forEach((event) => {
      if (event.ff === 0x58) {
        const num = event.dd.charCodeAt(0);
        const denPower = event.dd.charCodeAt(1);
        timeSigs.push({
          ticks: event.tt,
          timeSignature: [num, Math.pow(2, denPower)],
        });
      }
    });
  });

  if (timeSigs.length === 0) {
    timeSigs.push({ ticks: 0, timeSignature: [4, 4] });
  }

  timeSigs.sort((a, b) => a.ticks - b.ticks);
  return timeSigs;
}

export function extractNotesFromJZZTrack(track) {
  const notes = [];
  const activeNotes = {};

  track.forEach((event) => {
    const tick = event.tt;

    if (event[0] >= 0x90 && event[0] <= 0x9f && event[2] > 0) {
      const noteNum = event[1];
      if (activeNotes[noteNum]) {
        const previous = activeNotes[noteNum];
        notes.push({
          ticks: previous.startTick,
          durationTicks: tick - previous.startTick,
          midi: noteNum,
        });
      }
      activeNotes[noteNum] = { startTick: tick };
    } else if ((event[0] >= 0x80 && event[0] <= 0x8f) || (event[0] >= 0x90 && event[0] <= 0x9f && event[2] === 0)) {
      const noteNum = event[1];
      if (activeNotes[noteNum]) {
        const start = activeNotes[noteNum].startTick;
        notes.push({
          ticks: start,
          durationTicks: tick - start,
          midi: noteNum,
        });
        delete activeNotes[noteNum];
      }
    }
  });

  return notes;
}

export function cleanMidiTrackName(name) {
  if (!name) return '';
  return name
    .replace(/\s*\d+$/, '')
    .replace(/\s+(I{1,3}|IV|V|VI)$/i, '')
    .replace(/[_-]\d+$/, '')
    .trim();
}

export function normalizeForMatch(value) {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/♭/g, 'b')
    .replace(/\bflat\b/g, 'b')
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\d+/g, '')
    .replace(/[()\[\]]/g, '')
    .replace(/\bsharp\b/g, '#')
    .replace(/♯/g, '#')
    .replace(/\bin\b/g, '')
    .trim();
}
