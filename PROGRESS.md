# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-19`.

## 2026-11-19 — R200: a narrow desk folds the legend and shows a war in every map mode

- At 800 px or less the desk's legend is folded to its title; the band measured at a banner's height; a crossing case.

## 2026-11-19 — R201: the empty relations graph says it is empty

- "Truces hidden · No ties of these kinds." with every kind hidden; a crossing case.

## 2026-11-19 — R202: a wide desk keeps the war row on the bar's centre

- Centred whenever the banners the band holds fit there, the band's middle only when the centre costs a banner; a
  crossing case. Batch 54 done; the critic next (ADR-1138).

## 2026-11-19 — ADR-1139: non-blocking items before the release, judged at the next; the loop stops after a release

- The user's decision, on the never-ending release/critic cycle: a release run's non-blocking items are fixed before
  the tag with no critic run after them; the next release's run judges them as touched; after the tag the loop stops and
  asks what is next. PROMPT.md and CRITIC_PROMPT.md changed. Run 87 (running) is the first under it.

## 2026-11-19 — critic run 87 (focused, on bbf47bca): ADR-829's exit

- One blocking issue, R87-B1: on a narrow desk the legend R200 folds, opened, lies over the war row (a regression of
  R197's row clear of the legend). UI/UX 7; the rest 8 (diplomacyWarDepth, godMode, editorScenarios, statsHistory,
  performance afresh; emergentDynamics and stability by the rotation). Filed as Batch 55 (R203–R206); ADR-1140 proposed
  for the user. The loop stops until the user decides.

## 2026-11-19 — ADR-1140 (b) and ADR-1141: the supported sizes (the user's decisions)

- ADR-1140 (b): on a narrow desk the legend leaves the war row's band for the top left, as a phone's. ADR-1141: the
  supported sizes are the iPhone 16 (393 × 659 and 393 × 852 upright, 734 × 343 and 852 × 393 sideways, with and without
  Safari's bars) and a 1440p desk's window (2560 × 1305); only a defect there blocks. CRITIC_PROMPT.md changed; Batch
  55's items are non-blocking, done next.

## 2026-11-19 — R203: a narrow desk's legend at the top left, as a phone's (ADR-1140 (b))

- The phone's place and giving way for the folded legend on a desk of 800 px or less; its height ends above the war row
  (a phone on its side, 734 × 343: the opened sea legend lay over the row and the bar). `c87_legendOpen`, `c87_legendShot`
  and `c86_modeRow` 0 covered; a crossing case in `warBannerRows1938`, three in `landingsBarPanel1938`; run by hand:
  airControl1938, airMapRead1938, chromeCover1938, fallout1938, heroesClear1938, legendOccupied1938, mapModes1938,
  phoneLayout1938, reviewBatch1938, seaControl1938, seaLegend1938, tags1938, warBannerRows1938, landingsBar1938,
  landingsBarPanel1938. R206 not taken (one place and state in every mode). R207 filed: the landings' bar on the nation
  panel's × at 601 to 700 px.
- After it (the tick's commit): the first cue's rule back in the phone's block (24a04c8c moved it for a narrow desk on a
  reason the probe did not bear: the cue's edge at 150 px, the title's at 125); the tick names 24a04c8c; R208 filed: on
  the iPhone 16 upright the opened legend over the folded ranking's bar, as before R203. Also run by hand on the final
  tree, with the 15: contactLine1938, countryballs1938, editor1938, editorDrag1938, flagGone1938, formationFight1938,
  mapview, nukeRuins1938, nukeYield1938, shipMarks1938, wrecksHeld1938 (90/90). The replay of `c87_legendShot` wrote
  over the critic's two shots `c87ls_84901_700x800_fallout_opened.png` and `_back.png` on disk (the probe takes no tag;
  not in git): they now show the fixed build, the defect is in the report and its log.

## 2026-11-19 — R204: the desk's war row holds its side (ADR-1142)

- The side, the bar's centre or the band's middle, chosen when the band or the banners' number changes and held; a row
  that outgrows the centre gives a banner. `c87_rowJitter 87601 300`: `moves` 0 wherever `countCh` is 0; on 60 s
  passes moves with the count unchanged 11 → 0. R202's probes as then. Run by hand: the 14 specs that read the war row
  (barNarrow1938, chromeCover1938, director1938, landingsBarPanel1938, phoneLayout1938, ranking1938, reviewBatch1938,
  settings1938, tags1938, ticker1938, timeLapse1938, toBattle1938, warBannerRows1938, warToDeath1938), 72/72, the
  director's seed 7 alone after a load timeout. The replays of `c87_rowJitter` wrote over the critic's
  `c87_rj_87601.json` and its eight shots; both put back from copies.
- After it (the tick's commit): the case crosses the five supported sizes and back with a nation's panel and History
  opened and closed (ADR-1137 (d), ADR-1141), and says which branch its last stage took (a banner behind "+n", 2 banners
  0 px off); the tick names f63f45c8; `c87_rowJitter 84901 400`, a second seed: no move without its count's change;
  ADR-1142's option not chosen without its unmeasured width. The replay of `c86_deskAttack 84901 400 wide` wrote over
  the critic's run-86 shots `c86da_84901_d400_wide_*.png` on disk (the probe's shots take no tag; not in git).

## 2026-11-20 — R205: the empty relations graph without the left-out count

- "No ties of these kinds." alone with every kind hidden; the count of nations left out only beside ties shown. R201's
  case extended (1600 × 900, the count with ties); `c86_relSaid 84903 400` clean. Run by hand: heroesRead1938,
  relations1938, relationsTap1938.

## 2026-11-20 — R207: the landings' bar right of the nation panel on a narrow desk

- At 601 to 700 px the bar stood on the panel's ×; its middle now keeps right of the panel's edge by half its least width.
  Cases at 601, 640, 700, 800 and 1280 px in `landingsBarPanel1938`. Run by hand: the specs that read the landings' bar
  (landingHoldMark1938, landingMark1938, landingsBar1938, landingsBarPanel1938, research1938).

## 2026-11-20 — R208: an upright phone's ranking gives way to the opened legend

- At 393 px the opened legend lay over the folded ranking's bar; the ranking is hidden while the legend is open. The AT's
  "the ranking's toggle takes a tap while the legend is open" not met as written, by choice (the legend's title would
  move from under the tap). R203's case extended. Run by hand: airControl1938, airMapRead1938, charts1938,
  chromeCover1938, fallout1938, heroesClear1938, landingsBar1938, landingsBarPanel1938, legendOccupied1938,
  mapModes1938, nukeStats1938, phoneLayout1938, ranking1938, rankingFlags1938, rankingNames1938, rankingRows1938,
  relationsTap1938, reviewBatch1938, seaControl1938, seaLegend1938, settings1938, tags1938, warBannerRows1938 (95/95).
  Batch 55 has no open item.

## 2026-11-20 — critic run 88 (focused, on 3e1ed78e): one blocking issue, stability 7

- R88-B1: one long `sim.step` in the page ends in another world than the headless one on seed 88901 (8 of 18 loads; the
  same on bbf47bca; no player route found). UI/UX 7 → 8 (R87-B1 fixed, 329 → 0); stability 8 → 7; the rest 8
  (diplomacyWarDepth, godMode, editorScenarios, statsHistory, performance, semanticZoom, naval afresh). Four non-blocking
  issues (R88-N1 to N4). Filed as Batch 56 (R209 to R213). No exit of ADR-829: not a regression of an item ticked since
  the release, and stability under its bar for the first run.

## 2026-11-20 — R209: one long step in the page ends in the headless world (ADR-1143)

- R88-B1's cause: Chromium 153's Maglev, entering `enemyDistance`'s loop by on-stack replacement, lost the writes of the
  closure the loop called; a field capital went to the wrong cell at hour 4,983 of 88901. The loop writes its own bounds.
  32 loads of 32 right; the critic's four probes as the AT asks; `longStep1938` pins it (run by hand, red without).
  The replays wrote over the critic's `c88_swm_88901_*` and `c88_ph_88901_*` JSON; put back from copies.
- After it (the tick's commit): `longStep1938` steps the headless world itself; the comment, ADR-1143 and SPEC say what
  was read and what was taken from it (which statement the engine compiled wrongly was not read; why one long step is
  not explained). Four more seeds by `pageHash.ts`, ten loads each, a year in one message: 1307, 99, 20933, 51377, 10
  of 10 equal to headless. The gate of 8c75a5fa: `snapshot-perf.test.ts` red in the run of all, green alone.

## 2026-11-20 — critic run 89 (focused, on f27f48f5): no blocking issue, every score at its bar; the release check

- Stability 7 → 8 (R88-B1 fixed on its four cases; 74 loads of 74 at the headless world, the old build 2 wrong of 24);
  every dimension 8 (mapVisuals, diplomacyWarDepth, emergentDynamics, godMode, performance, stability, naval, tanks,
  aircraft, aiNukes afresh). The sim's course unchanged in Node (20-year hashes, seed 99's `ca4700f1`, 54 replay starts,
  717 bulk landing runs). Three new non-blocking issues filed in Batch 56 (R214 to R216) beside R210 to R213: fixed
  before the release, no critic run after (ADR-1139); then `check:review`, `bench G --gpu-only`, the tag, and the loop
  stops.

## 2026-11-20 — R210, R211: a phone's landings' bar and its legend

- Upright the bar under the legend's title; on a phone the bar gives way while the legend is open; its opened row ends
  above the war row. `c88_sizes 88903 0` at the four phone sizes: no `legend<landings`, no `row<landings`, the toggle
  opens. A crossing case in `landingsBarPanel1938`. Run by hand: the 22 specs that read the legend, the ranking, the
  landings' bar or the first cue (83/83). The replay of `c88_sizes` wrote over the critic's `c88_sz_88903` JSON and
  shots; the JSON put back from a copy.

## 2026-11-20 — R212: the relations footer whole at 393 × 659

- The footer keeps its lines' height in a low panel. `c88_relSaid 88905 400` `cut` [] at the five supported sizes; a
  crossing case in `relationsTap1938`. Run by hand: heroesClear1938, heroesRead1938, relations1938, relationsLabels1938,
  relationsNamed1938, relationsTap1938 (34/34).

## 2026-11-20 — R213 waits on the user (ADR-1144, proposed)

- The phone's row at 393 px cuts "Nationalist Spain" to "Natio…" in two banners with their "& n" whole: ADR-1136 (a)'s
  order, the user's choice. Four options in ADR-1144; (b), the counts before a name is cut inside its first word,
  recommended. The loop takes R214 to R216; the release waits for the answer.

## 2026-11-20 — R214: past the map's north and south edges the sea is one colour

- The edge row's depths no longer go on past the map: the deep's shade within 8 cells, at every tier. `mapEdge1938` at
  the five supported sizes (run by hand, red without); the whole browser suite by hand, 533/533.

## 2026-11-20 — R215: ADR-1143's rule read from the source; the long step's pin says its world meets the loop

- `loopBounds.test.ts`: no loop of the sim, the worker or the shared code has a bound written by a closure it calls;
  the old `enemyDistance` is found. `longStep1938` red when its seed sends no capital to the field (run by hand).

## 2026-11-20 — R213: a phone's war row cuts a name to its first word before its counts (ADR-1144 (b))

- The user chose (b). Nationalist Spain's two wars read "Nationalist S… ⚔ Italy" and "Nationalist S… ⚔ Portugal" at 393
  px, not "Natio…" twice. New case in `warBannerRows1938`, red on the old order; R193's floor follows the rule.

## 2026-11-20 — R216: a world of few nations at peace says so and why (ADR-1145)

- `peaceWhy` (a pure read, the worker's stats) and the peace line in the war row's place. `peaceWhy.test.ts`;
  `peaceLine.spec.ts` at the five supported sizes; `warBannerRows1938`, `phoneLayout1938`, `landingsBarPanel1938`
  with it, 46/46 on both projects (run by hand). `fewNationWars 3 85401 6 10` as run 89 read it.
- Found tracing 89404: a massing begun on a border no man of its army can walk to, repeated for ten years. Filed as
  R217 in Batch 57, after this release's tag (a new declaration rule wants a critic run after it).

## 2026-11-20 — R217: a neighbour of a nation's home is one its men stand on the border's land of (ADR-1146)

- Put before the release by the user. One definition of "across the sea" (`homeByLand`): `warTarget`'s cost, the lift,
  the massing, `landlessPowers`, `peaceWhy`; the lift's touch by land only where the declaring side has men. Massings
  begun with no man on the border's lands: seed 99's year 0 of 14, 60-nation worlds 1 of 30 and 1 of 18, 89404 14 of 19.
  89404: 0 wars → 6 in ten years. Checker `mass` (`diploInvariants`), a three-nation case, red before.
- `warOpening` five seeds × 3 years: nothing held at day 30 10.1 → 7.7 %, attacker none near 12.4 → 3.4 %, defender
  ahead 16.2 → 12.9 %. `fewNationWars 3 85401 6 10` as run 89 but 85406 (day 1197 → 1126). Pin f311b292 → 9aaa81c1.
  Tick +1.5 % (strategicAi 0.275 → 0.332 ms). The gate's browser suite 465/465 (peaceLine with it).
- Found: R218, random worlds' capitals on a sea cell (seed 7's 60: 10).

## 2026-11-20 — R217, after it: a lift on order is "for now"

- With R217 89414 and 89415 told `noLift` to day 90 and went to war on days 98 and 112 (ADR-1145's promise broken):
  `peaceWhy` reads a realm refused for a lift, with its transports on order (`landlessPowers`), as "for now". Seven
  worlds reason-free in the month before their first war; `peaceWhy.test` 8/8, `peaceLine` 7/7 (by hand). The sweep
  suite 29/29; `farConquests 0` (8 seeds) far capitals 10.0 → 8.0; `c69_firstdecl 60` 0 of 61 over 6,000 km.

## 2026-11-20 — R218: a capital's land is its city's cell

- The user put R218 before the release, then a critic run. A shore capital's coordinates lie in the sea (13 of 1938's,
  10 of seed 7's 60); `homeNeighbours`, sea supply's home lands and the map's label read the city's cell now.
  `capitalLand.test.ts` (red before: 13 and 10 nations with no home; a scan for the old reader). Seed 99's pin as it
  was; the few-nation reads as after R217 (89401-89406 a war on 5 of 6). Supply +0.014 ms a tick.

## 2026-11-20 — The critic scores performance by the rotation only (ADR-1147, the user's decision)

- No fresh `performance` score for a change under `src/`, nor as a release condition; CRITIC_PROMPT.md and PROMPT.md
  changed. Critic run 90 was started before, under the old text.
