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

## 2026-11-14 — R81d: Germany's label flag told from Poland's (ADR-1035)

- The bar (30 % of pixels differing) read 60 % on HEAD; the fault was Germany's black third lost on the tag's dark
  ground (its edge seen: 0 %). The tag's flag framed light: edge 100 %, pixels 70 %; shots looked at. Pairs under the
  bar in year 1 listed (red flags with a white device, Latvia's against the Soviet Union's). The ten tag specs green.

## 2026-11-14 — R81e: the relations graph names every nation at war or allied (ADR-1036)

- HEAD left 20-27 of 37-43 such nations unnamed. All nations are candidates now (the tied first), the placer tries
  sixteen directions at eight distances and covers no node; the shown nodes fill the drawing, 900 high on a phone. Two
  lines of a pair bend apart, so a puppet's truce is seen. 39939/41/43, desk and phone, whole and on Germany: all
  named, no overlap. R11's phone check now reads every nation in the zoomed view named. Relations specs 17/17.

## 2026-11-14 — R81f: a battle's labels met on HEAD (ADR-1037, proposed)

- The critic's case on 39915, 7781, 39917 at 250 m/px: 25 tags for 25 formations, 0 overlapping, 0 unplaced, the 10
  engaged all named, none of their 292 elements under a tag. No change; whether to thin the tags of formations not in
  contact at a battle is put to the user. `tools/diag/battleTags.ts`.

## 2026-11-14 — R81g: the followed fighter marked on its planes (ADR-1038)

- The mark stood at the patrol's middle while its planes circle at a radius of the view's. A sortie's row carries
  its wing now (stride 12) and the mark stands on the wing's drawn planes: at 250 m/px the median 70 → 0 px (39927),
  265 → 0 (35127), 0 on 39929; 3,000 m/px 0. The 14 sortie and wing specs green. `tools/diag/wingMark.ts`.

## 2026-11-14 — R81h: 120 m/px answered in BLOCKERS

- The critic's 52.5-55.8 at 120 m/px is draws a second over a spot left empty (its fight picked once at load): here
  48.8-57.5, while the browser draws 60.0-60.2 frames and a forced draw takes 0.7 ms (58.8-60 frames/s). The view
  skips a draw that would change nothing (`frameAt`). No change; BLOCKERS has the numbers. `lookFps.ts` `FIXED=1`.

## 2026-11-14 — Critic run 68 (focused, after Batch 25; on `bfda9503`)

- Scores: map 8, diplomacy 8, emergent 8, God Mode **7**, editor 8, stats 8, UI 8, performance 8, stability 8,
  semantic zoom 8, naval 8, tanks 8 (carried), aircraft 8, AI nukes 8. **1 blocking:** R68-B1, Undo and any load
  leave the undone burst's ruins and fallout drawn. Non-blocking R68-N1-N5. Batch 25 seen working (R81a's bar ×1.17,
  R81c-e, g; R81h's answer borne out: frames 59-60 at 120 m/px). Filed as Batch 26, R82a-f, before Batch 25's R81i;
  the critic runs again when no batch is open (ADR-1039). HEAD had moved by two document commits (ADR-1037, ADR-1039).

## 2026-11-14 — R82a: Undo and load redraw the burst layers (R68-B1, blocking)

- Cause as the critic said: `server.ts` sent fallout and ruins only while the world or the last sent had some, and
  `loaded()`/`startSim` reset the sent counts to -1, so an empty layer was never sent and the page kept the burst's.
  Now the counts are `Infinity` after a load or a start: both layers go once, empty too, then by their change as before.
- `tests/e2e/godUndoPicture1938.spec.ts` (the critic's `c68_undo2` and `c68_loadruins` as a spec, its 40-over pixel
  measure in the map clear of the bars): nuke, revolt, nation, city and raze on 41211, each act undone, the picture
  against the one before: **0 px** each (before the fix the nuke left 13,391 px); a save of before a burst loaded over
  the game that had it, against the same save in a fresh page (41203): **0 px** (before: 13,298). A city's name that
  takes its other free place after the load is left out of the count (its two boxes), and every city named before must
  be named again: a layout matter, not the world's.

## 2026-11-14 — R82b: Normandy fought for (R68-N4, ADR-1040)

- Cause: the Allies landed on Vichy-owned, German-held cells and were given none (R74g), so no neighbour cell to take
  from; a taken cell would have gone back to Vichy. Now in a stage's open window the arrival holds its cell, and taken
  stage land goes to the taker. `trackFronts` D-Day (51 cells): 1938 23 taken, Allies lost 26k vs 45k (was 0, 140k vs
  26k); 37701 23, 34k vs 58k; 38701 22, 19k vs 53k; 39701 17, 34k vs 46k; 41701 15, 32k vs 36k. Kept-release at the
  stage's own window tried, no difference, dropped. Gate green (two timing tests red in the run, green alone).

## 2026-11-14 — R82c: no carrier row on its own nation (R68-N1)

- `worker/carrierRaids.ts`: with no enemy formation in reach of the strike's point, the point cell's holder is named
  only if at war with the striker; else no row. Unit test (`carrierRaid1938.test.ts`, the strike's point on Britain's
  own land): red on the old rule, green now. Every row each hour of 20 years on 32019, 41019 and 7019: 87,697, 56,289
  and 98,471 rows, 0 on the striker's own nation, 0 on one at peace.

## 2026-11-14 — R82d: no war on Brazil by French Guiana (R68-N2, ADR-1041)

- A land neighbour bordering the attacker only by a colony costs as a war across the sea (capital to capital).
  Brazil's capital taken by France on 0 of 5 seeds (was 4); declarations over 6,000 km in the first 60 days 0 and 1
  on the critic's two sets (run 68: 3 and 2). Pin 95d9261f → 401d6856.
- With the pin moved, the e2e specs that step the sim ran: `relations1938` counted the graph before day one's
  statistics came (a war declared that day redrew it): it waits for them now. `relationsNamed1938` 39943 phone left 2
  of 44 nations at war or allied unnamed in the denser world: the labels' search goes to 12 rings (was 8). And
  `nukeRuins1938`, red since R81c (not this rule): its ground-zero dot, MARK_MS of the clock on the same overlay, sat
  on Berlin's middle; the spec reads the ruin once the mark's time is over. `shipMarks1938` T3 red once, green twice
  alone (GPU).

## 2026-11-14 — Three of run 68's "not 9" notes filed (the user's choice)

- R82g (no AI warhead intercepted, 0 of 47), R82h (the two land measures' names; France's and the United States'
  chart blues), R82i (the ground-zero mark over the struck stack's counter), after R82e-f.
