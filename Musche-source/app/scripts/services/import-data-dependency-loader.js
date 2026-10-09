export function createImportDataDependencyLoader({ loadMidiSmf } = {}) {
  return () => Promise.all([
    import('../features/import-data.js'),
    import('../utils/csv.js'),
    import('../utils/midi.js'),
  ]).then(([importDataModule, csvUtils, midiUtils]) => ({
    registerImportDataFeature: (context) => importDataModule.registerImportDataFeature({
      ...context,
      actions: {
        ...context.actions,
        loadMidiSmf,
      },
    }),
    csvUtils,
    midiUtils,
  }));
}
