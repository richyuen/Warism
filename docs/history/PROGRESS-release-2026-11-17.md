# Progress log: `release-2026-11-15` to `release-2026-11-17` (archived, ADR-805, ADR-918)

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

## 2026-11-16 — R104: a hero takes ground; a march that waits for the front is told of (ADR-1095)

- `HERO_PRESSURE_MEN` in `territory.ts`; `waitsForFront` in `movement.ts`; the worker's `waitsFront` news and its
  words. `tests/unit/heroFront1938.test.ts`: the Char 2C alone against Spain, 0 cells in ten days before, 31 now.
- Batch 37 opened (R104 to R109) by the user's "Accept your recommendations".

## 2026-11-16 — R105: ground being taken is seen (ADR-1096)

- `takingCells`, the snapshot's `taking`, `src/render/fx/taking.ts`. The first glow (orange alone, faint) was not
  seen at 1,500 m/px: the taker's colour in a stronger glow.

## 2026-11-16 — R106, R107: the arrows by side; occupied land in bands (ADR-1097, ADR-1098)

- R106: `ARROW_PALE` 0.3, `OTHER_WIDE`. Thinner in the layout it dropped an advance with a nation looked at
  (`orderLines1938` red): thinner in the drawing alone.
- R107: bands and the dashed old border in the map's pass, on the ground only. One run of the browser suite for
  the two, and one commit.

## 2026-11-16 — R108, R109: fewer counters (ADR-1099, ADR-1100, the user's choices); Batch 37 done

- R108: `quietAlphaAt`, `MapView.quietCounters`. R109: `CLUSTER_PX` 128. The whole browser suite on the two: 463
  green, eight specs of the counters red on the new picture (six given the switch, `countersRest1938` its zoom
  from the constant) and `nukeAlertTwo1938` red in the run.
- A review of 42 pictures of the game by a sub-agent (the user's request): twelve ideas, told to the user; none
  built. Its nine map-mode pictures all showed the political colours: a fault of the capture or of the modes, not
  yet known.

## 2026-11-16 — Batch 38: nine of the review's eleven (ADR-1101 to ADR-1104)

- R110 to R116, R119, R120 built; `tests/e2e/reviewBatch1938.spec.ts`. The coasts tried twice and reverted; the
  odd-shaped names not begun. Both in ROADMAP for the user.
- The whole browser suite on the batch before its last fixes: 467 green, five red (`chromeCover1938` twice for the
  legend's line, `godUndoPicture1938` for the names, `heroesRead1938` and `maxGlide1938` in the run and green
  alone); the first two mended and their specs green.

## 2026-11-17 — critic run 73 (focused, on a9814c43)

- Scores: map 8, diplomacy 8, emergent 8, God Mode 8, editor 8, stats 8, UI/UX 7 (was 8; its bar 7), performance 8,
  stability 8, semantic zoom 8, naval 8, tanks 8, aircraft 8 and AI nukes 8 (carried). Blocking: 0.
- UI/UX fell by R73-N1: R110's newest-first row left the wars a played nation leads off the banners. Its six
  non-blocking issues and the small things are Batch 39 (R121 to R127).

## 2026-11-17 — R121: the played nation's wars first on the banners (ADR-1105)

- `WarBanners`' order; `reviewBatch1938` has its case. The first of Batch 39; R122 to R127 open.

## 2026-11-17 — R123: a nation with one neighbour declares when its massing runs out (ADR-1106, the user's decision)

- `massStep`'s `alone`; `fewNationWars.ts --no-massing`. Six worlds of two nations, ten years: a war in 3 before,
  5 now (5 with no massing at all). The sweep tests and `sweep:quick` not run on it: the pin stands.

## 2026-11-17 — R122: a massing seen is told (ADR-1107)

- `MassingSeen`, `World.massTold`. The pin of seed 99 bf16e257 -> a5dbeae6.

## 2026-11-17 — R126, R127; R124 in part; R125 measured and left (ADR-1108, proposed)

- R126: the phone's ticker gives way to opened banners; the cue lower. R127: a fleet named in its refusal.
- R124: the step that covers no counter; the critic's scene still has four hero counters on counters. R125: the
  tighter stacking meets the critic's target and rewrites the quarter: for the user. The critic's probes run here
  against a preview of the build on port 5373.
- R127's fleet name taken out again: the whole browser suite had `orderRowsBrief1938` red on it (a division's order
  has the same refusal). The suite else: 468 green; `heroes1938` twice and `nukeAlertTwo1938` red in the run and green
  alone, `maxGlide1938` red alone too this time (red in every whole run of the day, green alone before).

## 2026-11-17 — critic run 74 (focused, on 6cc762ea)

- Scores: map 8, diplomacy 8, emergent 8, stats 8, UI/UX 8 (was 7), performance 8, stability 8, semantic zoom 7 (was
  8; under its bar of 8); God Mode, editor, naval, tanks, aircraft and AI nukes 8 (carried). Blocking: 0.
- Run 73's R73-N1, N2 and N3 seen fixed. Semantic zoom fell by R74-N1: R124's step made the heroes' counters leap.
  Batch 40 (R128 to R130).

## 2026-11-17 — R128 to R130 (ADR-1109): Batch 40 done

- R128: R124's step out of `counters.ts`. R129: `MassingCalledOff`. R130: a war with a battle first on the row.
  The critic's probes for R128 and R130 run here and met; R129's is the next run's.

## 2026-11-17 — R125: the markers' rule from 1,200 m/px out (ADR-1110, the user's decision)

- `StackRule`, `STACK_RULE_FAR`, `stackRuleAt` (`markerStacks.ts`); `MapView` gives the rule of the zoom.
- The critic's probe, pairs on one another at 1,800 m/px, days 10, 20, 30: 3 of 48, 9 of 54, 12 of 59 (24 of 60, 47
  of 71, 39 of 72). At 1,200: 0, 3, 7 (5, 12, 17).
- By hand: `markerStacks1938`, `markers1938`, `handover1938` (6 green). No frame time measured: the same passes
  over the same markers, a reach of two cells of the grid where one.
- R131 filed: a hero's marker at T1 leaps with the zoom (on HEAD too).

## 2026-11-17 — R131 (ADR-1112); R124's (a) measured and not taken (ADR-1111, the user's decision)

- R131: `HeroLifts`. The wheel run of R125: no move of a hero's marker over 6 px a frame (the largest 5.0).
- R124: (a) on branch `r124-fit`: 5 of 7 pairs left in the critic's scene, the zoom's jumps 4 and 4 over the bar of
  2. `main` as it was: the user's decision, R124 left as it is.
- Next, by the user's word ("After this, let's run the full critic"): the critic, full run.

## 2026-11-17 — critic run 75 (full, on e830930e; asked for by the user)

- Scores: map 8, diplomacy 8, emergent 8, God Mode 8, editor 8, stats 8, UI/UX 7 (was 8; its bar 7), performance 8,
  stability 8, semantic zoom 8 (was 7; its bar 8), naval 8, tanks 8, aircraft 8, AI nukes 8. Blocking: 0.
- R74-N1 seen fixed (R128), R125 and R131 hold on their measures. UI/UX fell by R75-N1: R130's order makes the
  banners change places by the second. Batch 42 (R132 to R137). A full run where the process had a focused one next
  (semantic zoom was under its bar): the user's word.

## 2026-11-17 — R125b: the markers' tight rule at every zoom of T1 (ADR-1113, the user's decision)

- `STACK_RULE_TIGHT` is the view's rule; `stackRuleAt` gone. Day 30 on the critic's two fronts, pairs on one another
  at 1,150 m/px 16 -> 6 and 21 -> 3; at 600, 6 -> 2 and 9 -> 2.
- By hand: `markerStacks1938`, `markers1938`, `handover1938`, `heroStack1938` (7 green).

## 2026-11-17 — where the loop stands

- Next: R132, the first open item of Batch 42 (then R133 to R137). The tree is clean and pushed.
- After Batch 42: run 75 was the full run with no blocking issue and every score at its bar, so no critic run
  follows its fixes (ADR-1022): `npm run check:review`, `npm run bench -- G --gpu-only`, then the release
  (PROMPT.md, RELEASES, steps 3 and 4).
- Kept aside: branch `r124-fit` (R124's (a), not taken, ADR-1111).


## 2026-11-17 — R132 not met; to BLOCKERS and the user (ADR-1114)

- Six rules tried on branch `r132-hold` (aafda250); the critic's probes on each. The one that met the three bars (a
  place held 20 days in its slot) turned R121's `reviewBatch1938` red; the one that keeps R121 reads the cursor 3 (bar
  2) and bannerRank 45 (bar under 44). `main` unchanged. Next: R133.

## 2026-11-17 — R133: a warhead's bomber stopped short is told (ADR-1115)

- `c75_interceptTold.ts`: NukeIntercepted in History's kinds true, the ticker's true, strings 2 (false, false, 0).
- Tests: `tests/unit/nukeInterceptTold1938.test.ts`; `tests/e2e/nukeInterceptTold1938.spec.ts` (Germany's bombers at
  Warsaw, the first stopped short; the row in the ticker and in History, `docs/evidence/R133/`). Gate green, the pin
  of seed 99 unmoved. No tick time measured: one more kind kept in the log, rows only where a bomber is stopped.

## 2026-11-17 — R134: a massing's call-off told at the hour's end (ADR-1116)

- `c75_massTold.ts 3` on the twelve seeds (57611 to 57621, 58611 to 58621): no "CALLED OFF BUT AT WAR" line (58619: 1
  before). France's on Germany (58619, d884) is now given up with no row, at war with it; France's on Switzerland
  (58615, d105) too, Switzerland dead. Every silent give-up of the run is at war with its target or the target dead.
- `massOffBreaks` in diploInvariants (every hour); tests `tests/unit/massOffTold1938.test.ts`, `massAnswer1938`. Gate
  green with every unit test (`snapshot-perf` red under load, green alone). No tick time measured: one list read an hour.

## 2026-11-17 — R135: a war banner says which side fights to the death

- The banner's title: "China fights to the death: no peace is made, whatever the score; the war ends when one side
  holds three quarters of the other's land, or after five years" (both sides: "A and B fight to the death"), and
  `data-death`. Seed 7019 (the critic's `c75_warAt100.ts 7019 5 off`): Japan's war in China at −100 on days 700 to 800,
  China's flag on, the line its banner's.
- By hand: `warToDeath1938` (new), `reviewBatch1938`, `toBattle1938`, `warBannerRows1938` (10 green on both projects).

## 2026-11-17 — R136: `seaBattles`' one-hour battles list the fleets that fought

- A one-hour battle's fleets: of the nations on the two sides of a war between its two (not another war's), and of a
  side that lost ships only the fleets near that lost strength in the hour. 58061 t5712 GER v SWE: Germany's 4 ships
  sunk whole, the two German fleets 6 and 15 cells off no longer listed; one Swedish fleet.
- `seaBattles.ts 58061 scenario --years 3` then `seaBattlesLook.ts`: 32 of 32 seen, exit 0 (31 of 32, exit 1). 39061,
  two years: 63 of 63. A tool's change: no sim, no tick time.

## 2026-11-17 — R137: one Major Battle at a place in an hour (ADR-1117); Batch 42's items done but R132

- The critic's case on `public/data/scenarios/1938h/start/1942.sav`, Germany's peace with the Soviet Union by God, the
  hours after: battle 86 began beside 84 near Hammerfest; with the rule, one row, battle 84 with both groups' men.
- Tests: `majorBattles.test.ts` (one new: red on the old rule), `farWait1938` to seed 6 (`firstWait.ts`: 99, 7, 1, 2
  none in 400 days; 6 on day 93). The pin a5dbeae6 -> 3374082b.
- `seaClose1938`: the destroyers against the cruisers at hour 1641 (`seaPairs.ts 3613 80`), as before R98c.
- Found at its gate (the pin moved: the whole suite): `enemyClickPanel1938` red since R125 (a marker up to 13 px off its
  formation; 857ceeeb: the click at the counter, the scene seed 7's day 70); `relationsNamed1938` on 39939's phone
  (4febbde7: twenty rings for a label). BLOCKERS' entry on 39943's phone left open: its red was one run of three.

## 2026-11-17 — R132 by the user's decision (ADR-1114 (b)); Batch 42 done

- `r132-hold`'s last rule on `main` (R135's `data-death` kept). The critic's probes on this build: 57901 row 3, cursor 1;
  58901 5, 0; bannerRank 46 (bar under 50); 57903, the phone and Japan played as in ROADMAP. 45 banner specs green.
- Next: the release checks (PROMPT.md, RELEASES 3): `npm run check:review`, `npm run bench -- G --gpu-only`.

## 2026-11-17 — BLOCKERS looked at (the user's question)

- Closed: `seaRow1938`'s Speed x1 (green 3 of 3 on both projects; off `tools/gate/knownRed.json`), `godUi1938`'s "Revive
  after a Kill" (the file green 3 of 3). To the watch list: `relationsNamed1938` 39943's phone (green 3 of 3 after
  4febbde7). Left open: R81h (the measure, nothing in the game), PLAN 7.83b, 7.83c, 7.89, 3.10c1d2 (October's AI bars,
  each measured on rules since changed), the sweep's stasis on 701–710 (no sweep is a release condition, ADR-1072),
  `seaBattleSeen1938` under load (the release's `check:review` judges it).

## 2026-11-17 — The release checks after Batch 42; release-2026-11-17

- `npm run check:review` green on 8201f781: unit 2575 of 2576 (snapshot-perf green alone), the sweep tests, the browser
  suite 478 of 479 (nukeAlertTwo1938's pause-off case green alone; to the watch list, red in a whole run twice today),
  perf green; 0 known red, 0 not known; no `WARNING historyTrack`. No sweep (ADR-1072, the user's decision).
- `npm run bench -- G --gpu-only`: PASS, T0 402.7 fps (budget 60), T2 160.5 fps (budget 30).
- CHANGELOG entry; Batches 32-42 (R89-R137), ADR-1073 to ADR-1117 and this log since `release-2026-11-15` archived to
  `docs/history/` (ADR-918).
