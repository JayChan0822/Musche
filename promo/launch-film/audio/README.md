# Musche original launch score

## Complete workflow version (57.6 seconds)

The expanded film uses **musche-score-v2-master.wav** and **beat-map-v2.json**. This is a newly arranged 24-bar composition with 268 piano notes, not a loop extension of the first master. Principal landings: **0 / 4.8 / 14.4 / 21.6 / 28.8 / 36.0 / 40.8 / 45.6 / 52.8 seconds**. Final piano responses land at 54.0 and 54.6, with the final 2.4 seconds reserved for the tail.

```sh
python3 promo/launch-film/audio/compose_v2.py
CLANG_MODULE_CACHE_PATH=/tmp/musche-swift-cache swift promo/launch-film/audio/render_piano.swift "$PWD/promo/launch-film/audio/v2-stems" 57.6
python3 promo/launch-film/audio/compose_v2.py master
```

The first version and all its assets remain intact. V2 intermediate sources live in `v2-stems/`; final measured specifications are saved in `audio-qa-v2.json`.

## Original version (48 seconds)

The delivery master is **musche-score-master.wav**: exactly 48 seconds, stereo, 48 kHz, 24-bit PCM. The preview is **musche-score-listen.m4a** (320 kbps AAC).

Original 100 BPM composition in 4/4, twenty bars. A B-minor piano motif opens into a D-major-nine resolution. The arrangement includes sampled acoustic piano, warm synthesized pad, restrained deep bass, wood percussion, hats, claps, tonal details, reverse harmonic swells, stereo ambience and a composed final cadence. No downloaded music or commercial recording is used. Piano is performed by the built-in macOS General MIDI instrument; all other sound sources are synthesized in `compose.py`.

Use `beat-map.json` for choreography. Principal section landings are **0 / 9.6 / 19.2 / 28.8 / 38.4 / 43.2 seconds**. The logo cadence starts at 43.2; final piano responses are 44.4 and 45.0; the tail ends at 48.0. Beats are every 0.6 seconds, with useful eighth-note staggering every 0.3 seconds.

## Rebuild

Requires Python with NumPy, FFmpeg, and Swift/AVFoundation on macOS. Run in this order:

```sh
python3 promo/launch-film/audio/compose.py
CLANG_MODULE_CACHE_PATH=/tmp/musche-swift-cache swift promo/launch-film/audio/render_piano.swift "$PWD/promo/launch-film/audio"
python3 promo/launch-film/audio/compose.py master
```

Audio-unit rendering may require access outside the sandbox. `piano-events.json` contains all 206 performed notes with timing, velocity and duration. Intermediate sources are retained to make the result reproducible. The mastering stage uses two-pass loudness normalization, with a target of −15 LUFS and −1.2 dBTP maximum.
