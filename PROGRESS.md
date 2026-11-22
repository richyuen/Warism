# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-20`.

## 2026-11-22 — The map frozen on an iPhone: a lost WebGL context (ADR-1151)

- The user's report: on an iPhone the map stopped scrolling while its names went on. The WebGL context lost (iOS under
  memory pressure) was never handled. Now the game saves and boots again from the save at the same view;
  `contextLost1938.spec.ts` green (chromium). Not reproduced on a device here: the loss is forced with
  `WEBGL_lose_context`.

## 2026-11-22 — Less GPU memory on a phone (ADR-1152)

- The user's decision after ADR-1151: on a touch screen the WebGL map at most at 2 px per CSS px and no kept frame; the
  names at the screen's px. `phoneGpu1938.spec.ts` green (an emulated iPhone at 3 px: map 2, names 3, no kept frame, the
  map on the screen; a desk unchanged); the touch-emulated specs run again: 43 of 49 green; the 6 red (heroes1938, landingMarkMore1938, desk cases among them) red on the commit before too, here (7 there).
