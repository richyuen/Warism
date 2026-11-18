# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-17`.

## 2026-11-17 — R138: the nightly's ten-year tests in three jobs (ADR-1118)

- The cancels (43412792679, 43705787921, 44077095528): one job of 23 files, 53-54 min on the nights it ended. On
  43855142847 its files summed 9,547 s on the runner's 3 workers; the historical track's six files 5,650 s (892-969 s
  each). Split into a matrix of three (`rest`, track seeds 1-3, track's own seed and 4-5); file lists checked with
  `npx vitest list --config vitest.sweep.config.ts --filesOnly` (17 + 3 + 3 = 23).
- The 11-16 red (43855142847, on 1eec8c40): `specRefs` §8 cited a bare `chromeCover1938` (R94a, b64c242a), no code word;
  a2b5dca0 (R95) wrote it as `tests/e2e/chromeCover1938.spec.ts`, so 11-17 was green. `snapshot-perf` timed out at
  90 s in the whole run (a full sync of 113 s under load) and passed alone (68 s); it is on `tools/ci/runnerRed.json`,
  a warning, not the red.
- Dispatched run 44206444954 on 76551f98: the three ten-year jobs green in 23, 28.5 and 38.6 min, the runner 1.6-1.9x
  slower per file than 11-16's. The 38.6-min job split again: historyMatch1938h, freeYears1938h and freeWorld1938h
  (1,547 + 1,314 + 790 s) a fourth job; lists 14 + 3 + 3 + 3 = 23.
- Three dispatched runs green in full: 44206444954 (three-way; ten-year jobs 23.0, 28.5, 38.6 min, unit 62 min),
  44213292258 (four-way; 17.3, 18.3, 29.1, 29.2 min), 44221126695 (four-way; 18.7, 20.5, 20.1, 22.9 min; unit 40 min).
  R138 done.
