export function createMidiSmfLoader() {
  let midiSmfPromise;

  return () => {
    if (!midiSmfPromise) {
      midiSmfPromise = Promise.all([
        import('jzz'),
        import('jzz-midi-smf'),
        import('../utils/midi.js'),
      ]).then(([jzzModule, smfModule, midiUtils]) => {
        const JZZ = jzzModule.default || jzzModule;
        const installJzzSmf = smfModule.default || smfModule;
        midiUtils.installJzzSmfPlugin(JZZ, installJzzSmf);
        return JZZ.MIDI.SMF;
      });
    }
    return midiSmfPromise;
  };
}
