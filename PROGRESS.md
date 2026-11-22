# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-20`.

## 2026-11-22 — The map frozen on an iPhone: a lost WebGL context (ADR-1151)

- The user's report: on an iPhone the map stopped scrolling while its names went on. The WebGL context lost (iOS under
  memory pressure) was never handled. Now the game saves and boots again from the save at the same view;
  `contextLost1938.spec.ts` green (chromium). Not reproduced on a device here: the loss is forced with
  `WEBGL_lose_context`.
