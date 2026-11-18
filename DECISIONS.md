# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

## ADR-1122 · 2026-11-18 · accepted · The director's camera (ROADMAP R142)

- **Decision.** A Director switch in the bottom bar (`src/app/director.ts`). The worker sends the History rows of a new
  war, a Major Battle, a capital taken and a nuclear strike since its last stats message (`DIRECTOR_KINDS`,
  `directorRows`, the last 40, places as the ticker's: a war at the capital of the nation it was declared on); the
  director flies to each as the ticker's row does (`showPlace`), no cut within 4.5 s of the last nor 2.5 s of the camera
  standing, a strike first, the rest in order, one waiting over 45 s passed over. A row whose place stands 40 px
  inside a view at most 3000 km across while the camera stands is seen there, not flown to. `CameraController.onTaken`
  (a wheel, a press on the map, a double click, a camera key) turns it off.
- **Why.** Goal 1: a world that moves, shown without the player's hand. Major Battles reach the page in no row of the
  ticker, so the worker sends the director's own; a war has no front at its declaration, so the ticker's place.
  Measured on 600 days of seeds 1938 and 7 (headless): 36 and 27 wars, 66 and 61 Major Battles, 35 and 29 capitals,
  no strike: one every 4.6 s at 1 day/s, about the gap; the shots near the one shown are seen with it.
- **Measured** (`director1938.spec.ts`, `DIRECTOR_MINUTES=10`, 1600 x 900): seed 1938 135 of 135 rows seen, 80 cuts,
  seed 7 116 of 116, 70 cuts; the shortest gap 4.52 s; 600 days in 600 s; a wheel turned it off within a frame and no
  cut followed. A first count that took the whole world's view as seeing everything (0 cuts, 100 %) is why a view must
  be 3000 km across at most. `npm run bench -- G`: T0 406 fps, T2 158.5 fps (budgets 60 and 30). No sim rule, no pin.
- **Consequences.** The stats message carries up to 40 more rows a second, only where such events happen. The gate
  runs the spec for 1.5 minutes; the 10-minute run is by hand.

---

## ADR-1121 · 2026-11-18 · accepted · A row of History flies to its place (ROADMAP R141)

- **Decision.** A History row whose kind is in `HISTORY_PLACED` (`src/shared/history.ts`) and that has both numbers is a
  link (`historyPlace`): a battle, a capital taken, a revolt, land that went over, a strike and its kin, an air or sea
  battle, a raid, a hero lost, a massing, God's acts on a place, an event of the track. `HISTORY_UNPLACED` has the
  rest, whose log has no place (wars, peaces, alliances, puppets' bonds, a death) or other numbers in x and y (the bonds
  a forced war broke, why a nation joined, why the track passed over an event); each kind of the log is in one of the
  two (`historyPlace.test.ts`). An annexation logs no place: the worker gives it the target's capital, as the ticker's
  row has it. A click flies the camera, PLACE_VIEW_KM across as the ticker's, to the point nearest the view's middle
  where `elementFromPoint` finds the map's canvas, it and PLACE_CLEAR_PX (60) about it (`MapView.showPlaceClear`); with
  none (390 x 844, the panel at its tallest), the panel closes and the place is at the middle (`showPlace`).
- **Why.** Run 75's small things: "a row of History cannot be clicked to its place". The panel stands in the middle
  of the view, over where the ticker's flight puts its place; the page's other overlays (bars, ticker, side panels, an
  alert) stand at many places, so the free point is asked of the page, not drawn from their boxes.
- **Consequences.** No sim change, no pin move. A dead nation keeps its capital's columns, so an annexation's place is
  where its capital was; a nation revived since is placed at its new capital. A place in a game saved before is as the
  log had it then.

---

## ADR-1120 · 2026-11-18 · proposed, the user's decision · R140: a top five held 20 years, the bar or ADR-750

- **The conflict.** R140's AT (Batch 43, the user's decision of 2026-11-17) asks that no seed of a 10 × 50 sweep keep
  the same five largest nations for 20 years or more. ADR-750 (the user's decision) has it that a stable top is a valid
  world: the sweep reports stasis and does not judge it.
- **Measured on HEAD** (40938ff7, 72001–72010, `docs/sweeps/2026-11-18-sweep-r140.md`): 2 of 10 (22 and 20 years), the
  other eight 7–17. The cause read (BLOCKERS, R140): the United States is in the held set on all 30 seeds of the last
  three sweeps, Australia on most, and the two are at war on few days of decades (Australia 0 in years 9–27 of 72006,
  the United States 0 in 22 of 32), so the set holds while the Soviet Union, Britain and Brazil keep their places.
- **Options.**
  (a) Keep the bar, and make the two at peace for decades part of the world's wars: a war on them that the AI would
  take (across the sea, with a lift: ADR-1119), or wars of their own (their aggression, the United States'
  isolation). R144, its AT R140's bar on new seeds.
  (b) Keep ADR-750: R140 closed with HEAD's figures (2 of 10), the entry to the watch list; R144 dropped.
  (c) Judge another measure of the top's movement (realms rather than nations, or the top three, or the largest's
  share), with its bar.
- **Until the user decides**, R140 and R144 are not taken; the loop goes on to R141.

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
  Found after the commit by the whole ten-year suite (the gate's sweep stage runs only the pin): `aiSweep1` red, seed 1
  founding no nation in ten years (its first in year 12). Nations founded in ten years, rule off -> on, seeds 1-13: 6->0,
  4->1, 12->11, 10->10, 5->1, 10->18, 22->11, 6->5, 13->33, 4->5, 2->5, 1->10, 5->2 (100 -> 112; 7 of 13 fell, the paired
  mean +0.9, -11 to +20): no measurable effect. The test's `founded > 0` guards its name-and-flag checks (PLAN 2.15's AT,
  every nation founded has a flag), so `aiSweep` steps on by the month until the first is founded, five years at most.

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
