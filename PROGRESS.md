# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-15`.

## 2026-11-15 — Batch 32 planned: the map's look (ADR-1073, the user's request)

Shots of seed 99 in August 1939 at 20,000 to 30 m/px beside the user's mock-up; six items filed, R89–R94 (thick
movement arrows first), the user's choices in ADR-1073. Documents only; no code.

## 2026-11-15 — R89a: the movement arrow (ADR-1074)

- A land formation's march is a thick arrow (`src/render/units/moveArrows.ts`): tapered, pale in its nation's colour,
  dark-rimmed, 5 to 22 px by its men, from the formation along the start of its way; marches that start together and
  head the same way are one. The dashed line stays for fleets and for a formation picked or selected.
- The first try, arrows along whole ways, was a thicker web (131 crossings on the Fujian front); the item's text and
  ADR-1074 follow what the shots showed. Now 0 crossings there at 600 and 1,500 m/px.
- Tests: `moveArrows.test.ts` (15); by hand `npx playwright test tests/e2e/orderLines1938.spec.ts
  tests/e2e/player1938.spec.ts --project=chromium --project=swiftshader` (6 green).
- Frame: draw p50 2.3 to 2.4 ms at 600 m/px with 35 arrows, 1.4 to 1.5 at 150 with 54. `npm run bench -- G`: GPU T0
  310.8 fps (budget 60), T2 174.2 fps with 10,752 sprites (budget 30), PASS.
- Shots: `docs/evidence/R89a/` (before and after at 1,500, 600 and 150 m/px, after at 30, the first try).

## 2026-11-15 — R89b: a war shows its advances (ADR-1075)

- Every nation at war shows its advances as bold arrows with nothing selected, at every tier (under the counters at
  the world's zoom too); the other marches of what is looked at are faint. An advance: a march to a cell an enemy
  holds or to within 100 km of an enemy's land formation (`advances`, found once a snapshot).
- Tests: `moveArrows.test.ts` (19); by hand `npx playwright test tests/e2e/orderLines1938.spec.ts
  tests/e2e/player1938.spec.ts tests/e2e/fleetOrder1938.spec.ts --project=chromium --project=swiftshader` (8 green).
  The war test sweeps 6 to 96 hours and 4,000 to 100 m/px: at most 40 bold arrows in view.
- Seed 99, August 1939, nothing selected: 26 arrows of 13 nations at 20,000 m/px; 18 at 4,000 over Fujian.
- Frame: the arrows are 0.1 to 0.15 ms of a draw, measured in one page with them on and off (1.53 to 1.63-1.72 ms at
  150 m/px with 42 arrows; 2.03 to 2.06-2.18 at the world's zoom with 26), most of it the grouping until it was made
  without allocations and by squares. `npm run bench -- G`: GPU T0 294.9 fps, draw cpu p50 2.4 ms (2.2 on R89a's
  commit, the same hour; budget 6); T2 161.0 fps with 10,752 sprites, 5.0 ms (170.7 fps, 4.7 ms; budgets 30 fps and
  6 ms): PASS, with less room.
- The bench's SwiftShader stage (reported, not judged) took over 7 minutes in three runs of seven this evening and was
  cut off by my own time limit; left to run, it ended. `-- G --gpu-only` is the run to time a change by.
- Shots: `docs/evidence/R89b/`.

## 2026-11-15 — Bench G on the GPU alone unless asked (ADR-1076, the user's decision)

- `npm run bench -- G` no longer runs the software rasteriser's stages; `--software` adds them. `--gpu-only` is still
  taken. Run after the change: `npm run bench -- G` in 31 s (several minutes before): GPU T0 305.1 fps, T2 163.1 fps
  with 10,752 sprites, draw cpu 4.9 ms, PASS; the software rasteriser's record of 2026-11-11 kept.

## 2026-11-15 — R89c: no name under an arrow (ADR-1077); R89 done

- The arrows are drawn on the names' canvas, under the names (they were on the overlay, over them). The voyages'
  lines and the order lines at T1 have a dark edge, as the landing's mark.
- Tests: `orderLines1938.spec.ts` (0 of the names' whole pixels changed by arrows at three zooms; 3 of 89 points of a
  nation's name on an arrow not told from it, bar a tenth). By hand: the 15 specs that read the names' canvas, the
  voyages or the landings' marks, with `fleetOrder1938` and `player1938` (40 tests green).
- `npm run bench -- G`: T0 297.3 fps, T2 159.4 fps, draw cpu 5.0 ms, PASS (as R89b).
- Shots: `docs/evidence/R89c/` (before and after at 1,500 and 600 m/px). The voyages' new lines were not shot; their
  specs are green.

## 2026-11-15 — R90a: the fronts glow (ADR-1078)

- The border between what two nations at war hold is a hot red line with a glow, drawn by the map's own pass from a
  war table. R90 split: R90a this line, R90b the flash of land that changed hands (open).
- Tests: `warTable.test.ts` (3); `fronts1938.spec.ts` (Germany on Poland, three hours by six zooms: every point of
  the border at war lit, none of a border at peace, none before the war or after the peace). The whole browser suite
  by hand on the change: `npx playwright test --project=chromium --project=swiftshader`, 457 passed in 10.1 min.
- `npm run bench -- G`: T0 302.3 fps, the map's pass 0.520 ms of GPU a frame (0.512 to 0.515 before; budget 1); T2
  161.0 fps, 1.078 ms (budget 2), draw cpu 4.9 ms: PASS.
- Shots: `docs/evidence/R90a/` (peace at 4,000 m/px; the war at six zooms).

## 2026-11-15 — R90b: land taken flashes (ADR-1079); R90 done

- Each cell that changes hands with a snapshot is a soft white patch for 900 ms (`src/render/fx/flashes.ts`), under
  the names; none at a start or a load.
- Tests: `flashes.test.ts` (4); `flash1938.spec.ts` (two sizes of paint by three zooms; the start, the same holder,
  a load). The whole browser suite by hand on the change: 458 passed in 10.0 min.
- `npm run bench -- G`: T0 290.7 fps, T2 162.0 fps, draw cpu 4.9 ms, PASS.
- Shot: `docs/evidence/R90b/flash-1500.png` (the first look, a white blot, is in ADR-1079).

## 2026-11-15 — R91: the map's ground at T0 and T1 (ADR-1080)

- The sea by its depth, the land by its relief, a fill darker toward its border, in the map's pass from one
  texture made from the elevation.
- Tests: `farShade.test.ts` (6; neighbours' least ΔE 12.9, bar 12). The whole browser suite on the first try: 9
  failed of 458. Seven told water or a fill by its one colour or compared the map with the ground of T2 on and
  off: the shades untied from `relief`, and `view.farShades` off where a test needs flat fills (ADR-1080).
  `seaDepth1938` changed with the feature. `invasion1938` and `occupiedGround1938` passed alone and after.
  The suite again on the final code: 457 passed, 1 failed (`historyMine1938`, the phone's History panel), green
  alone six times of six after (`--repeat-each=3`): a test of the panel, red once under the whole suite's load.
- `npm run bench -- G`: the map's pass 0.556 ms of GPU a frame at T0 (0.520 before, budget 1), 1.154 at T2 (1.078,
  budget 2); T0 290.5 fps, T2 162.3 fps, PASS.
- Shots: `docs/evidence/R91/` (before and after at 20,000 and 4,000 m/px; after at 10,000 and 2,200).

## 2026-11-15 — R92a: the names white (ADR-1081)

- A nation's name is white with an edge of its land's deep shade; dark on the 19 light lands of 1938. R92 split:
  R92b, the turn and the size of a name, is open.
- Tests: `nationLabelLayout.test.ts` (19; the least contrast 2.08, 1.99 before; a restart wipes the atlas, a glyph
  is clipped to its box). The whole browser suite by hand: the first run 456 of 458, `bench-pages` green alone and
  `labelFades1938` red twice (a pop of 59, bar 48). Its cause, found by drawing the frames about the pixel: the glyph
  atlas left its old glyphs standing when it started again (ADR-1081). Mended; the suite again: 458 passed in 10.1 min.
- No change to the frame: the glyphs are drawn once into the atlas as before, in another ink.
- Shots: `docs/evidence/R92a/` (before and after at 20,000 and 4,000 m/px).

## 2026-11-16 — R92b: a name's turn and bow (ADR-1082); R92 done

- A name is turned at most 30 degrees from level and bows at most 0.15 of its length; the narrow steep lands keep
  their names along their axes.
- Tests: `nationLabels.test.ts` (8). The whole browser suite by hand: 457 of 458, `maxGlide1938` (the units' glide at
  Max, a timing) red once and green alone four times of four.
- Since R91 each whole run under 8 workers has had one test red that is green alone, another each time
  (`historyMine1938`, `settings1938`, `bench-pages`, `maxGlide1938`): none of them reads the map's picture. Watched.
- No change to the frame: the curves are the worker's, made every few seconds as before.
- Shots: `docs/evidence/R92b/` (before and after at 20,000 and 4,000 m/px).

## 2026-11-16 — R93: the counters larger (ADR-1083)

- The counters of T0 are drawn 1.25 times their size, with round corners; countryballs still in their look. The
  markers of T1 are not touched: R95 filed.
- Tests: `counters1938.spec.ts` (the plate's height at five unit sizes in two looks). The whole browser suite by
  hand: 456 of 458; `coast1938` and `shipMarks1938` red once, green alone four times of four each.
- The frame: `npm run bench -- G`: T0 268.8 fps, p95 7.5 ms, draw cpu 2.5 ms (290 to 302 fps, 5.0 ms and 2.4 ms in
  the runs of R91 and R90: the counters' plates and numbers are drawn at a scale of 1.25, one run, not a pair);
  T2 159.3 fps, 5.0 ms. PASS (budgets 60 and 30 fps, 6 ms).
- Shots: `docs/evidence/R93/` (both looks at 6,000 m/px).

## 2026-11-16 — R94a: the ranking closed until asked for (ADR-1084)

- The panels were 13.3 % of a 1600 × 900 view at the start (17.6 % in August 1939 on seed 99), the ranking 7.9 of
  them. Closed on a desk until Statistics opens it: 5.4 % and 9.7 %. A phone's is folded to its title as before.
  R94 split in three: R94b (the news) and R94c (the date and speed at the top) are open.
- Tests: `chromeCover1938.spec.ts` (three sizes of view). The whole browser suite on the first try: 13 red, all
  of the ranking open at the start; then the phone's fold kept, and by hand the 14 specs of the ranking, the
  panels and the bar (40 tests green).
- Shots: `docs/evidence/R94a/` (August 1939 before and after).

## 2026-11-16 — R94b: the news one line until opened (ADR-1085)

- On a desk the news is its latest event and the first sea battle until "N more" opens the rest. The orders'
  news, a phone's rows and the rows beside a panel are as they were.
- August 1939, seed 99: the news 0.85 % of a 1600 × 900 view (2.87), the panels 7.68 % (9.70; 17.62 before R94).
- Tests: `ticker1938.spec.ts`'s new test. The whole browser suite on the first try: 9 red, tests of the earlier
  rows, which open the news by the stored choice now; one of them (`ticker1938`'s room beside a panel) had found
  the opening row 12 px over the panel's foot: no such row beside a panel. By hand after: those nine specs,
  `chromeCover1938`, `phoneLayout1938` (green). The whole suite was not run again on the last change.
- Shots: `docs/evidence/R94b/` (August 1939 before and after).

## 2026-11-16 — R94c: the clock at the top's middle (ADR-1086); R94 done

- On a desk Pause, the speed and the date are a plate at the top's middle; the bar keeps the rest in its order. A
  phone's bar is as it was.
- Tests: `chromeCover1938.spec.ts` (the clock at four sizes of view; none on a phone). The whole browser suite on
  the first try: 462 of 463; `trackView1938h` looked for the line's bar as a `footer`. By hand after the last
  changes (the plate's gunmetal, the heroes' counters clear of it): `chromeCover1938`, `trackView1938h`,
  `barNarrow1938`, `heroesClear1938`, `heroesRead1938`, `nukeAlert1938`, `phoneLayout1938` (green). The whole suite
  was not run again on those two.
- The panels of a 1600 × 900 view in August 1939 on seed 99: 17.62 % before R94, 7.62 % now.
- Shots: `docs/evidence/R94c/` (August 1939 before and after).

## 2026-11-16 — R95 tried and not kept; Batch 32 stands at R95

- The markers of T1 drawn 1.25 times their size: nine browser tests red, each a rule that stands on the marker's
  size (the T1 to T2 change's jump 58.7 of 255, bar 48; two nations' markers on each other; frames, clicks,
  countryballs). Reverted; the findings in ROADMAP R95 and BLOCKERS.md. No code of it is in the tree.
- Batch 32: R89 to R94 done (the arrows, the fronts, the map's ground, the names, the counters, the chrome). R95
  is open and waits on the user's choice (BLOCKERS.md), so no critic run yet (ADR-1039).
- Seen through the batch and not chased: in each whole run of the browser suite under 8 workers one or two tests
  red that are green alone, others each time (`historyMine1938`, `settings1938`, `bench-pages`, `maxGlide1938`,
  `coast1938`, `shipMarks1938`).

## 2026-11-16 — R95: no pips; a strength bar and a larger number in Lato (ADR-1087, the user's decision)

- Under a T1 marker's box: a plate of 34 px with a strength bar and the men in Lato's Bold of 11 px. The pips and
  their module are gone. The counters' numbers in Lato too.
- The trial's run (the whole browser suite and the unit tests): of the first try's nine, eight green; red:
  `countryballs1938`'s wings (a plate over a wing tip), `heroStack1938` (the test's stale place), and the pips' own
  three (`markers1938`'s count, `pips.test.ts`, `specRefs` of SPEC's line). All mended or gone with the feature.
- The whole suite on the final code: 467 of 467 browser tests; 2,528 of 2,529 unit tests, `snapshot-perf` (a timing,
  on the watch list) red under the full run and green alone three times of three.
- Found on the way: `specRefs.test.ts` red since R94a's commit (SPEC named `chromeCover1938` as a word, not by its
  path): R94a's last commit changed documents only and the gate ran nothing. SPEC cites the path now.
- Shots: `docs/evidence/R95/` (the Fujian front before and after; the three faces side by side).

## 2026-11-16 — R96: arrows only over a front (ADR-1088, the user's request)

- An advance is a march whose way within 100 km is on land an enemy holds; a march that only ends near an enemy's
  formation is behind the lines. Bold arrows are drawn before faint ones.
- Tests: `moveArrows.test.ts` (21); by hand `orderLines1938.spec.ts` and `player1938.spec.ts` (7 green): Germany
  on Poland at most 18 bold arrows in view (40).
- No change to the frame worth a figure: fewer arrows are drawn; the advances are found once a snapshot from the
  ways the snapshot brings.
- Shots: `docs/evidence/R96/` (the German-Polish war and the Fujian front, before and after).

## 2026-11-16 — R97a: a war's opening measured; R97b waits on the user (ADR-1089 proposed)

- `tools/diag/warOpening.ts`. The forced German-Polish war of the tests: Poland ahead in land by three to one after
  a month, Germany's army split by France's joining and East Prussia all but empty.
- The AI's own wars, six seeds by three years, 221 between leaders with a border that ran a month: the attacker
  ahead in land at day 30 in 51 %, the defender in 24 %, none taken in 25 %; the attacker with no man within 300 km
  of the border as it declares in 118 (53 %), and there the defender is ahead more often than the attacker.
- No code of the game changed. Figures: `.cache/r97/own-<seed>.json` (not committed).

## 2026-11-16 — R97b: mass, then declare (ADR-1089, the user's choice); R97 done

- `src/sim/ai/massing.ts`, `World.massing` and `World.massBarred` (saved), the strategic AI's declaration through
  it; `tests/unit/massing1938.test.ts` (6).
- Twelve seeds by three years, before and after: the attacker with no man within 300 km of its border 53 % -> 6 %,
  the defender ahead in land after a month 25 % -> 10 %, the attacker ahead 51 % -> 84 %. The wars with a border
  71 % of what they were, under the four fifths R97b asked: the bar re-scoped by the user to the wars in which the
  attacker is ahead (218 -> 219).
- Found on the way: the first rule massed on neighbours by a colony (Britain on the Netherlands over Borneo, 60
  days and given up): `nukeOutrage1938.test.ts` showed it. The delayed declaration asks ADR-1042's and ADR-981's
  rules again (the advisor's review).
- The pin of seed 99 ac4fab37 -> a49837a3. Three tests of a seed's luck re-aimed (DECISIONS, ADR-1089).
- The whole unit suite: green but `snapshot-perf` and `scenario1938`'s build time under the load of other runs,
  both green alone. The browser suite was not run whole: the gate's specs for a pin move (397), six of them re-aimed
  at a seed, a day or a formation that holds their scene (DECISIONS, ADR-1089).
- Not looked into: on seed 5309 Germany, in the war the test forces on Czechoslovakia, no longer takes Prague in
  300 days. No massing is in that war (Germany is at war); the world about it differs.

## 2026-11-16 — R97b, after its commit: the sweep tests, four more tests, the draw first

- Every sweep test green (23 files); the checkers over random diplomacy, heroes and the random world, none broken.
- `massing1938.test.ts` 10: the second war's rule, a neighbour by a colony, `stillDeclares`, and the strategic AI's
  own war prepared and declared (seed 99).
- The strategic AI's draw before its weighing of targets: 0.20 ms a tick where 0.49 (0.38 before the rule), the
  same hash.
- Open: no run past three years was read for what a massed army leaves open at its other borders (`npm run
  sweep:quick` started after this commit). The war the user asked of, Germany's on Poland by God Mode, is not
  touched by this rule: a war declared by hand, or on a nation, still finds the army where it stood (ADR-1089's
  option c, not built). In the twelve seeds' three years the AI itself began none on Poland with the rule.

## 2026-11-16 — R97b's quick sweep read; R98a: the arrivals at a front just made, measured

- `npm run sweep:quick` on R97b (10 seeds by 20 years, `.cache/`): the limits on 10 of 10 seeds (land changing, the
  nations alive, a war in four fifths of the years), a riser and a faller on 10, no stasis on 10, no break-up on 10.
- `tools/diag/frontArrivals.ts`. Germany's war on Poland by God Mode: its army is at its fronts within a week but
  for 12 % of it, which stands far and still for 25 days; half of it faces France, who joins on the first day, and
  Poland brings all of its own. The rush (R98b) is of that 12 %; the rest is two fronts against 947,000 men.

## 2026-11-16 — R98b: the rush tried and not kept

- The 12 % of Germany's army that stands still in R98a's war is the planner's reserve (`RESERVE`), not a trickle:
  R98a's reading of it was wrong, and is corrected in ROADMAP.
- The rush for the far formations (beyond 1,200 km of every front) gives no order in that war, and on six seeds by
  three years the wars open no better with it (the defender ahead 11 % where 7 %). Reverted. R98 is open: what would
  change that war is three choices of the user's (ROADMAP R98b).

## 2026-11-16 — R98c: the invaded front has the more of the army (ADR-1090, the user's choice); R98 done

- `INVADED_WEIGHT` 4 in the operational AI's allotment; `tests/unit/invadedFront1938.test.ts`. Germany's war on
  Poland and France, day 30, four seeds: its land held by Poland about a third to a half of what it was, by France
  1 cell; more of France's taken, less of Poland's.
- The sweep tests found the historical track of seed 1938 passing an event over with it: the weight is 1 while the
  track steers. The sweep tests then: 21 files green as they ran, and those two and the pin green after.
- The pin of seed 99 a49837a3 -> 1fe6205e. Tests of a seed's history re-aimed (DECISIONS, ADR-1090).
- A slip of the loop's: the unit suite and the sweep tests were run at once and starved each other (42 tests timed
  out); run again each alone.

## 2026-11-16 — R98c checked whole (the user's request)

- On 8d272bac, each run alone: the unit suite 2,541 of 2,542 (`snapshot-perf` timed out in the run and is green
  alone); the sweep tests 23 files of 23; `npm run sweep:quick` (10 seeds by 20 years) limits on 10 of 10 seeds, a
  riser and a faller on each, nukes used on 9, the saves' twins equal.

## 2026-11-16 — R99: a front is brighter and plainer (ADR-1091, the user's request)

- The front's line: a glow of 12 px, a dark casing, an orange band, a core near white (`ground.ts`,
  `mapShader.ts`). `fronts1938.spec.ts` reads the core's colour from the constant; green, its bars unchanged.
  Shots in `docs/evidence/R99/`.

## 2026-11-16 — R100: no tag or pointer under the clock or the banners' row

- `.topclock` among `tagObstacles`; `.war-banners` takes no pointer, its children do (`#ui > *` gave it one).
  `tests/e2e/tagsOnMap1938.spec.ts`, red before on its three seeds. The BLOCKERS entry to `docs/BLOCKERS_DONE.md`.

## 2026-11-16 — R101: the tags of a crowded front (ADR-1092)

- A place at each corner of a block (`TAG_CORNER_RINGS`). Twelve seeds of `tagsCrowd1938`'s scene: far tags 76 -> 42,
  left out 31 -> 21, every seed within 3.5 % (four were over). The bench's T2 draw 4.6 -> 5.0 ms.
- Two wider tries not kept (ROADMAP): one made a tag's place turn on a part of a px, both cost the bench its line.

## 2026-11-16 — R102: seed 5309's Prague read; no fault

- `tools/diag/pragueFall.ts`. Prague falls on day 17 on HEAD (day 15, 34, 61 with the two rules of R97b and R98c on
  or off); Germany's army is at that front in each; it fights five nations from the first day. No rule changed.
  `nukeMeansLost1938` back on seed 5309.

## 2026-11-16 — R103: a nation massed on brings its army to that border (ADR-1093); Batch 36 done

- `massStep`'s answer and `gather`; `tests/unit/massAnswer1938.test.ts` (5). Twelve seeds by three years with and
  without: the attacker ahead after a month in 231 wars on both, the defender in 40 and 41.
- Found by the measure, older than this item: the attacker with no man within 300 km of its border in 10.5 to 11 %
  of the wars, over R97b's tenth (6 % then). In ROADMAP and ADR-1093 for the user.
- The pin of seed 99 1fe6205e -> bf16e257.
- Checked whole, each alone: the unit suite 2,544 of 2,547 (`snapshot-perf` and `scenario1938`'s build time under the
  run's load; `specRefs` on the new test not yet in git, green once staged); the sweep tests 23 files of 23;
  `sweep:quick` limits on 10 of 10 seeds; the checkers of war and peace on six seeds to day 180, none broken.

## 2026-11-16 — Batch 36 read again (the advisor's review)

- R103 in the AI's own wars: the defender's men near the front as a prepared war begins a median 5 % -> 10 % of its
  army: little. ROADMAP's "the army is at the border as the war begins" taken out.
- The bar over (the attacker with no man near, 10.5 to 11 % where a tenth): the rise since R97b's build (6.5 %) is in
  the wars declared at once, 93 -> 138 of them; R98c between. For the user.
- R103's commit rests on its third gate: the second was red twice on `relationsNamed1938` (BLOCKERS).
- Evidence files for R101, R102, R103 (`docs/evidence/`); `tags.test.ts` pins the count of places (20, as before).
- The user's decision (ADR-1094): the bar of the attacker with no man near its border is 15 %.
