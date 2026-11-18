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
- A fourth on the four-way split, 44228789987: green, the ten-year jobs 13.3, 18.0, 20.5, 29.4 min.

## 2026-11-18 — R139 read first: the wars with nothing held at day 30 (no commit of a rule)

- The critic's measure (`warOpening.ts`, a war that ran 30 days with no cell held by either side) read off its own
  `critic/c75_warOpening.json`: 20 of 103, 19 of them between leaders with no land border. On HEAD (8fe68e51), ten
  seeds (58211, 58213, 58215, 58217, 58219, 58221, 61001, 61003, 61005, 61007; `.cache/r139/base_*`, all seen now):
  55 of 348 (15.8 %), every one a war across the sea; the opening bars (ADR-1094) 11.1 % with no man near, 10.1 %
  the defender ahead.
- Japan on Siam (days 10-73 on five seeds): its army all on its front in China, its landing turns "noArmy" until day
  28-37. Tried, not kept (R139a, `.cache/r139/r139a.patch`): in a war, a war across the sea only with MASS_SECOND of
  its men beyond DEPLOY_RANGE_CELLS of its fronts. Japan on Siam gone; on the ten seeds 50 of 327 (15.3 %), on the five
  not looked at first 16.4 % both ways; the attacker with no man near 14.9 % (bar 15 %). One war removed, not a cause.
- Next: a table of causes over the 55 (the attacker's wars at the declaration, its plans, days to the first order,
  aboard and ashore, landings thrown back), before any rule.
- Corrected: of the 55, 52 are between leaders with no land border; GER-LAT 58219, POL-#104 58221 and SAU-YEM 61007
  have one (1, 6 and 33 cells).
- The cause table (`.cache/r139/causes.ts`, ten seeds): of the 52, 47 attackers were in another war as they declared;
  28 had landing turns "noArmy", 10 "noTransports", 4 "noTarget". Two kinds of "noArmy": no free army (Japan at war
  with China, Germany with Poland and Norway) and transports stranded (Italy's one group at Mogadishu, on the land of
  its 267,000 standing men in Italy, none of whom can march there; `sailToMost` sails only for another land).
  A bar on wars across the sea in a war would cost: 104 such wars ran a month, 53 held land by day 30.
- Japan on Siam, 58211, hour by hour (`.cache/r139/japan2.ts`): its landing turn runs on the day of the declaration
  (the table's tracer missed it) and sends formation 374 to Shanghai's port from 64 cells off; at about 1.5 cells a
  day it is still marching on day 21, and the turns after find no one else ("noArmy").
