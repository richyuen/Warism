# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

## ADR-1119 · 2026-11-18 · accepted · A war across the sea is declared only with a lift (ROADMAP R139)

- **Decision.** The strategic AI does not declare on a target that is no land neighbour of its home (a target across
  the sea, `seaTargets`, or by a colony only) when the sides `declareWar` would call touch nowhere by land and its free
  men that may march to a port where a transport group of its stands are fewer than its largest such group holds
  (`src/sim/ai/seaLift.ts`: `noLift`, `seaLift`, `sidesTouch`). Free as the landings ship them (standing, not within
  DEPLOY_RANGE_CELLS of its own front on their land; PLAN 7.26c3a); the way to the port by `mayReach`. Such a target is
  refused as `outnumbered` refuses one (ADR-1042, `firstNotOutnumbered`): its next best is taken, or none. The checker:
  `lift` in `tests/helpers/diploInvariants.ts`.
- **Why.** Critic run 75's non-blocking 5: 20 of 103 wars with no cell held by either side at day 30. On ten seeds of
  HEAD (348 wars that ran a month) 55, 52 between leaders with no land border. Of the 131 wars between such leaders,
  the 57 whose sides touched by land held nothing in 1; the 74 that touched nowhere, in 51. In 33 of those 51 the
  attacker had, as it declared, under a group's room of free men that might march to its transports: Japan on Siam on
  every seed (its army on its front in China; its day-0 landing sent a division 64 cells to Shanghai's port), Italy on
  South Africa, Saudi Arabia, Yemen and Sweden (its one group at Mogadishu, on the land of its army in Italy, which
  cannot march there), Germany on Saudi Arabia and Spain (its army on its fronts). R139a (a free-army share in a war,
  `.cache/r139/r139a.patch`) was tried first and not kept: it took Japan on Siam away and moved nothing else.
- **Measured** (`tools/diag/warOpening.ts`, three years; `--no-lift` the rule off): on the AT's five (58211, 58213,
  58215 and 61009, 61011, not seen before) 24 of 180 (13.3 %) -> 8 of 167 (4.8 %); on the ten looked at 55 of 348
  (15.8 %) -> 19 of 322 (5.9 %). ADR-1094's bar, the attacker with no man near its border (15 %): 11.7 % -> 7.0 % on the
  five, 11.1 % -> 9.0 % on the ten; R97b's defender ahead in land at day 30 (15 %): 14.4 % -> 14.0 %, 10.1 % -> 8.5 %. The
  wars that began: 496 -> 468 on the ten (-6 %). Two- and three-nation random worlds of critic run 73-75's small cases:
  the same wars with the rule as without.
- **Stands on** ADR-670 (the nation across the sea "it could land on"), R78b, R74h (`warOverSea1938`), ADR-1068
  (`landlessPowers`), ADR-1042 (`pileRefused1938`), ADR-1089 (`massing1938`): green before and after.
- **Consequences.** A nation whose army is on its fronts, or whose transports stand where its army cannot march, makes
  no war across the sea until it has both. The pin of seed 99 moves 3374082b -> f6d6ab13 (a war of its year declared
  otherwise); `heroes.test.ts`' row count of German hero losses is read as Germany dies (a second loss in the wait).

---

## ADR-1118 · 2026-11-17 · accepted · The nightly's ten-year tests in three jobs (ROADMAP R138)

- **Decision.** `.github/workflows/nightly.yml`'s `ten-year` job is a matrix of four: the sweep tests the others
  do not name (by `--exclude`), historyMatch1938h with freeYears1938h and freeWorld1938h, the track's seeds 1-3, and the
  rest of the track (its own seed and seeds 4-5, by excluding seeds 1-3). Each keeps the 60-minute limit.
- **Why.** One job ran 53-54 min on the nights it ended and was cancelled at 60 on 2026-11-13, 11-15 and 11-17. On the
  11-16 run (43855142847) its files summed to 9,547 s on 3 workers (3,191 s); the six track files are 5,650 s of it, about
  15-16 min each. Split three ways first (76551f98), run 44206444954 had a runner 1.6-1.9x slower: track jobs 22 and 27
  min, the rest 37 min, historyMatch1938h 1,547 s and freeYears1938h 1,314 s of it. Those two and freeWorld1938h (790 s)
  became a fourth job (~26 min on that runner), the rest ~3,000 s (~18 min). A longer limit alone would leave the next
  slow test to cancel it again.
- **Consequences.** `npm run test:sweep` and the gate's stages are unchanged. A new sweep file lands in the first job,
  a new track file in the last, with no edit to the workflow. Four runners' `npm ci` a night instead of one.

---

> The ADRs before the last release tag are in `docs/history/`: `DECISIONS-<YYYY-MM>.md` (October) and
> `DECISIONS-<release tag>.md` from November on (ADR-805, ADR-918), in the order they had here. Search them by number (`grep -rn "ADR-623 " DECISIONS.md docs/history/`).
