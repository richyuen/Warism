# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-13`.


## 2026-11-14 — The sweep's share caps reported (ADR-1030, the user's decision); the replay to 1991 planned (ADR-1031)

- The largest nation's share of land and income at the end is reported, not judged: 55 of the 61 limit failures in
  `docs/sweeps/` were these two. The release sweep judged again by `--from`: ALL GREEN (over its bar on 2 seeds by land,
  3 by income). `tests/unit/sweepCriteria.test.ts` 12 of 12.
- Batch 24, R80a-k: the replay to 1991, planned; its five questions in ADR-1031 wait on the user.

## 2026-11-14 — ADR-1031 answered; Batch 25 (run 67's "not 9" items) before the replay to 1991 (ADR-1032)

- The user took the five recommendations and asked for the critic's items first, with a performance bar for the undo.
  A world save of seed 99 measured headless: 3.1-4.0 MB, save 50-52 ms, load 75-79 ms (years 0, 1, 5); the undo's five
  bars in ADR-1032. Batch 25, R81a-h, filed above Batch 24.

## 2026-11-14 — R81a: a bloc is a defensive pact (ADR-1033)

- Measured first (`tools/diag/farConquests.ts`): a free 1975 game took far capitals at 1.3-1.5 × plain 1938's rate per
  nation, the excess NATO's members following a member's attack. Where the blocs are, a bloc is a defensive pact: none
  of it called to a member's own war, to its defence the leader at any distance and the others within reach. On eight
  unseen seeds far capitals per 100 nations 13.6 → 10.4 (plain 1938 10.4); first-month declarations × 0.98; blocs whole
  and leaders apart 10 years after the track. The AT's own bar (≤ 1 a seed) re-scoped: plain 1938 has 9-12.
- `tests/unit/blocDefensive1938h.test.ts` (red without the rule); `npm test` 2,444 of 2,446 green, the two timing tests
  green alone. Plain games and the pin untouched (no blocs).

## 2026-11-14 — R81b: a one-step undo of a God Mode act (ADR-1034)

- The bar's Undo takes back the last act: the worker copies the world before each act (one held) and loads it. Told on
  the bar only, and a replay the act ended runs again, as ADR-1032's bar 5 (bit for bit) needs. Copy at the act, packed
  300 ms after: the save's ~95 ms in the browser had made the act +108 ms.
- On the GPU, 7019 year 20: the act +15.5 ms p95, longest frame 16.8 ms, undo p95 317 ms, tick × 1.005.
  `tests/unit/godUndo1938.test.ts` 6/6, `tests/e2e/godUndo1938.spec.ts` (nine tools undone by their buttons) green.

## 2026-11-14 — R81c: a burst readable at world zoom

- Ground zero's mark: the blast radius's dark-edged amber ring about a dot, at least 18 px in radius, 20 s on the page's
  clock (the cloud is gone in 9 s and the fallout's shade was all the critic saw at 937 m/px). At 10.3 s: God's H-bomb
  on Paris 202 px across at 937 m/px and 66 at 3,000; 7019 year 20's first AI burst (atomic, August 1958) 58 and 42.
  `tests/e2e/burstMark1938.spec.ts`, `tools/diag/burstMark.ts`; `nukeFx` unit and e2e tests take the fourth part.
  Bench G on the GPU: T0 313.1 fps, T2 170.0 (release 313.3, 170.9).
