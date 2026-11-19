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

## 2026-11-18 — R139: a war across the sea only with a lift (ADR-1119)

- The cause, with the tracer mended (a war's first-day turns, the lift read before the declaring step, the sides'
  contact): of 131 wars between leaders with no land border, 57 had sides touching by land (1 held nothing at day 30),
  74 did not (51). In 33 of those 51 the attacker had under a transport group's room of free men that might march to
  its transports. Scored as a bar before it was written: 33 of the 52 barred, 8 wars that held land barred.
- The rule (`src/sim/ai/seaLift.ts`, `firstNotOutnumbered`'s refusal): `warOpening.ts`, three years, `--no-lift` the
  rule off: the AT's five (58211, 58213, 58215; 61009, 61011 not seen) 24 of 180 (13.3 %) -> 8 of 167 (4.8 %); the ten
  looked at 55 of 348 -> 19 of 322 (5.9 %). ADR-1094's no man near 11.7 % -> 7.0 % (five), 11.1 % -> 9.0 % (ten); the
  defender ahead 14.4 % -> 14.0 %, 10.1 % -> 8.5 %; on 61009 and 61011 alone the defender ahead 16.4 % without, 21.3 %
  with (9 and 10 wars). Wars begun on the ten 496 -> 468. Random worlds of two and three nations (55401, 55404, 57404,
  53401; 55421, 54421, 55424, 58422): the same wars in ten years with and without.
- Checker: `lift` in `tests/helpers/diploInvariants.ts` (the AI's scope: a target no land neighbour of its home); the
  six cases green; with the rule off, 2207 and 3739 red (Japan on Siam, Italy on Norway: 0 men to lift).
- Tests: `seaLift1938.test.ts` (new); `warOverSea1938`, `landlessPowers`, `massing1938`, `pileRefused1938` green before
  and after (ADR-670, R78b, R74h, ADR-1068, ADR-1042, ADR-1089). `heroes.test.ts`' count of German hero losses read as
  Germany dies (a second loss of seed 99's in the months of the wait). Pin 3374082b -> f6d6ab13.
- Tick, seed 99 a year (`--profile`, run one after the other): mean 2.737 -> 2.746 ms; strategicAi 0.196 -> 0.240 ms.
- Gate: green (the browser specs of the moved pin), `shipMarks1938`'s T3 on knownRed (b8174401: red at 16.5 px on HEAD
  without the rule too).

## 2026-11-18 — R140 measured: the bar not met; ADR-1120 to the user

- `npm run sweep -- --first 72001 --seeds 10 --years 50 --tag r140` on 40938ff7 (33 min, 6 processes): limits 10 of 10,
  riser and faller 10 of 10, no break-up 10 of 10; the same five largest 20 years or more on 2 of 10 (72006 22, 72007
  20). Release79's 1581–1590 none (14 at most); 701–710 three.
- The cause read (`.cache/r140/top.ts` on 72006 and 72007, `.cache/r140/tally.mjs` on three sweeps): the United States in
  every held set (30 of 30), Australia in most; the two at war on few days of decades. Filed as R144; the bar against
  ADR-750 is the user's (ADR-1120). R140 and R144 wait; the loop goes on to R141.

## 2026-11-18 — R139 follow-up: the whole ten-year suite, `aiSweep1` red, the test's guard stepped on

- `npm run test:sweep` on 40938ff7 (the gate's sweep stage ran only the pin): 28 of 29 green, `aiSweep1` red, seed 1
  founding no nation in ten years. Founded in ten years, rule off -> on, seeds 1-13: 100 -> 112, seed by seed -11 to +20
  (7 of 13 fell): no measurable effect; seed 1's first comes 19 months after year 10.
- `founded > 0` and `revolts founded > 0` guard the name-and-flag and "broke away" checks (PLAN 2.15's and 3.12b's ATs:
  every founded nation has a flag; only a founding breaks away), not a rate. `aiSweep` now goes on with a copy of the
  game from its save, by the month, five years at most, until the first is founded, and checks the copy's nation and
  its revolt rows; the ten years' checks as before. aiSweep1-3 green; the gate green.
- The `lift` checker on eight fresh seeds, two in each of the nightly's four modes (4201-4204, 4301-4304): 0 broken.

## 2026-11-18 — R141: a row of History flies to its place (ADR-1121)

- The log's x and y, by kind (every `emit` of a kind of HISTORY_KINDS read): a place for battles, capitals, revolts,
  land that went over, strikes, air and sea, heroes, massing, God's acts on a place and the track's events; none for
  wars, peaces, alliances, puppets, a death; other numbers for BondsBroken, WarJoined and TrackSkipped (y) and a
  track-end PeaceSigned (x). An annexation has none: the worker gives it the target's capital, as the ticker does.
- The History panel stands in the middle of the view: the place goes to the point nearest the middle where
  `elementFromPoint` finds the map, 60 px about it too; on a phone with the whole list open, none, so the panel closes.
- `historyPlace.test.ts` (5: the two lists cover the log; no-place rows; the annexation; 3 years of seed 11 and the
  track's first year, every place on the map); `historyPlace1938.spec.ts` green on chromium and swiftshader; the History
  and ticker specs green; the gate green. No sim change, no pin move; the click's cost is a scan of the view's points
  on the click alone, nothing per frame.

## 2026-11-18 — R142: the director's camera (ADR-1122)

- Sized first (headless, 600 days of seeds 1938 and 7): 63 and 56 wars and capitals, 66 and 61 Major Battles, no
  strike; one every 4.6 s at 1 day/s. Major Battles are in no ticker row: the worker sends the director's rows.
- A first spec run said 100 % seen with 0 cuts (the whole world in view at the start): seen now asks a view at most
  3000 km across. Then 90 s: 15 and 18 cuts, 97-100 %; 10 min: 135/135 and 116/116, 80 and 70 cuts, gap >= 4.52 s.
- `director.test.ts` (6: gap and hold, a strike first, a far view, old news, the hand, the start); bench G T0 406 fps,
  T2 158.5 fps. The gate green.

## 2026-11-18 — R143 measured before building: the 5 % bar not met; ADR-1123 to the user

- A probe of the owner's monthly changes (`.cache/r143_probe*.ts`, 50 years of seeds 99 and 7; ~1,000-1,400 runs of
  changed cells a year) and ten encodings tried on the dumped runs (`.cache/r143_enc.mjs`): the record kept backward
  from the map of now, packed, is 9.1-9.8 % of the packed save plainly and 5.0 / 5.6 % at best (decodable). Every 2 or
  3 months: the same (the changes last). Against the raw save the plain columnar record is 3.8-4.0 %.
- Nothing built: the item waits on ADR-1123, as R140 and R144 on ADR-1120. Every open item of Batch 43 now waits on
  the user.

## 2026-11-18 — R143a: the borders' record (ADR-1123, the bar 7 % by the user's decision)

- `src/sim/borderLog.ts`: each month's changes of owner, backward from the map of now, the decodable encoding of the
  offline trials; cut in `step` after the month's first hour's systems; `borders.log` and `borders.open` (a save in
  mid-month), optional sections, hashed, dropped from an exported scenario.
- `tools/diag/borderLog.ts`, 50 years: 50 of 50 maps of 1 January alike on seeds 99 and 7; 5.34 % and 5.92 % of the
  packed save; a cut 3.0 ms median, 7.4 ms most, once a month. Pin f6d6ab13 -> 1aabdc7e.
- The first whole browser run since R142 found its word "Director" over `chromeCover1938`'s bars' cover (3.10 % >
  2.95): the switch is a drawn camera and the bar's buttons 0.5rem at their sides, 2.92 % (ADR-1122 amended).
- `snapshot-perf` timed out in both gates' whole unit runs, green alone at 45 s with and without the cut: the watch list.
- The gate green; `npm run test:sweep` 23 of 23 by hand.

## 2026-11-18 — R143b: the time-lapse's slider (ADR-1124); R143 done

- History's "Time-lapse": the game paused, a plate of play, a slider over the months, the month and close; the map of
  the step as owner and controller, nothing of now drawn over it (units, flags, marches, fronts, names, war banners).
- `timeLapse1938.spec.ts` on seeds 1938 and 7: the maps of 1 January 1939 and 1940 the page's own of that hour; 60.0 fps
  while it plays. The worker's build at 10/25/50 years of seed 99: 12/12/23 ms, 5.5/8.0/11.0 MB.
- Every item of Batch 43 is ticked: the batch ends with a critic run and a release tag (PROMPT "Releases").

## 2026-11-18 — critic run 76 (focused, on c2440872): one blocking issue

- Scores: map 8, diplomacy 8, emergent 8, God mode 8, editor 8, stats 8, UI/UX 7, performance 8, stability 8, semantic
  zoom 8, naval 8, tanks 8, aircraft 8, AI nukes 8. Every one at its bar (UI/UX's 7, run 75's).
- Blocking 1: R76-B1, `diploInvariants` finds the `lift` rule broken (a puppet's revolt and a massing's end declare
  over the sea unasked). R139's own rule missed at doors it did not cover, not ADR-829's regression exit.
- Batch 44 (R145-R156): the blocking issue, then the 11 non-blocking ones; the critic again (focused) after.

## 2026-11-18 — R145: the lift asked of the war's defender (ADR-1125; R76-B1)

- Hungary chose Yugoslavia, Italy's puppet beside it, and so asked no lift; `declareWar` made the war Italy's, over the
  sea, with no transport. The AI's over-the-sea test and a massing's end now ask it of the defender.
- A revolt's war (a puppet on its overlord; a holder on a nation a revolt made or revived) is no choice of target:
  outside the checker's `lift` (Lithuania on Germany, the Soviet Union on Lebanon).
- `diploInvariants`: 33501 and 58011 0 broken (2, 3 before); the critic's other 18 runs 0. Pin unmoved.

## 2026-11-18 — R146: the page's links hand the director's camera back (R76-N1)

- A ticker row, a war banner, History's rows, an alert and a formation's fight stop the director before they fly
  (`game.tsx`: the hud's four camera hooks; the director flies by `view.showPlace` itself, not through them).
- `c76_dirHand.mjs 59955 120`: the six acts all off, 0 cuts after. `director1938.spec.ts` clicks the three, green.

## 2026-11-18 — R147: no target across the sea after one refused for want of a lift (ADR-1126; R76-N5)

- Japan, refused Siam by R139, went down its list to Iraq, Iran or Finland, whose allies touch its side by land.
- `c76_firstdecl.ts 60`: 0 of 49, 0 of 55 over 6,000 km (2, 4 before). On twelve seeds the wars with nothing held at
  day 30 rose 6.1 % -> 10.3 % (R139's five 4.8 % -> 8.9 %, its bar 10 %), in wars the rule does not touch; every bar holds.

## 2026-11-18 — R148: a held banner gone quiet yields to a war fought (ADR-1127)

- `heldRow`: R132's hold no longer keeps a war with no battle in its days on the row while a fought war waits.
- `bannerRank 57901 150`: 42, 45, 42 (59, 55, 63, 48 on HEAD); churn 7 and 1 a minute (bars 10 and 3). A banner's click
  stops the director before it asks for the battle (R146's case, a quiet war first).

## 2026-11-18 — R149: the time-lapse is the month it shows (R76-N2)

- The tooltip and a click name the owner of the month on show; Space plays and pauses the time-lapse, not the game
  under it; Escape closes the plate, after a panel opened over it. The critic's probes: Norway's panel, 0 hours run
  (96), the plate closed by Escape.

## 2026-11-18 — R150: the director flies clear of an open panel and counts only what it shows (R76-N3)

- `director.go` flies as History's rows do (`showPlaceClear`); a place is seen only where no panel covers it.
- `c76_director.mjs 59951 100` under History: desk 45 of 45 seen, none covered (53 of 56 covered); phone none covered,
  1 of 45 seen: the panel leaves the phone almost no map, and the director no longer calls a hidden place seen.

## 2026-11-18 — R151: the time-lapse says where its record begins (R76-N4)

- The plate shows "from <month year>", the record's first month; History's hint no longer says "from the start". On a
  save made before R143 (`critic/c75_seed7019_y20.bin`) the plate reads "from January 1958".

## 2026-11-18 — R152: a hero counter eases to its place beside its formation (R76-N6)

- T0's hero counter chose its step and its place beside a panel anew each frame: two heroes near each other leapt a
  step as the wheel moved (P.100 Ercole and Char 2C, 56901), and one at a panel's edge leapt 380 px (Richelieu, 58905).
  Its offset now goes to its place at R131's pace, across and down.
- `WHEEL=1 c76_heroPop`: 0 leaps on 56901, 58905, 59905, 59907 (11, 8, 5, 6). `heroes1938.spec.ts`' R152 case: 12 px a
  frame at most (257 without the rule).

## 2026-11-18 — R153: the ticker hidden under the time-lapse's plate

- The ticker, like the war banners, tells of now: hidden while the plate is open. On a phone its second row stood under
  the plate. The spec's phone case: no row under it (one without the rule).

## 2026-11-18 — R154: a massing told and called off bars its target a year (ADR-1128)

- Britain's massing on Mozambique (57613 on HEAD) ended by a day's refusal and was told again 50 days on. A told
  massing called off before its time now bars its target MASS_BAR_DAYS, as one given up does.
- `c76_massTold.ts 3` on 13 seeds: told again after a call-off 0 (1). Pin 1aabdc7e -> f311b292.

## 2026-11-18 — R155: the small worlds at peace, traced (ADR-1129)

- 54425, 54426, 55424, 59421 (near-equal pairs: best utility 0.30-0.49 against 0.5 after ten years), 59423 (R139's lift:
  its army cannot reach its transports), 55404 (its target across the sea, dearer than its margin). Kept by ADR, as the
  AT allows; RESTLESS's cap and transports moved to a port the army reaches are named as items if wanted.

## 2026-11-18 — R156: the small things of run 76

- A track row whose note is a bare place says what happened ("Japan occupies Northern Malaya").
- A war to the death has ☠ on its banner and, opened, its line in words: a phone has no hover.
- On a phone the ticker stands above the opened banners (R126 hid it); the first cue says tap and pinch; Settings'
  main menu asks first. Each a case in a spec (37 of the specs touched green on both projects).
- `npm run test:sweep` after R154: 23 of 23.

## 2026-11-18 — critic run 77 (focused, on 7066d800)

- One blocking issue (R77-B1: the time-lapse names no owner dead now); every score at its bar but UI/UX 7. Its findings
  filed as Batch 45 (R157–R162).

## 2026-11-18 — R157, R158: the time-lapse's dead owners and its Resume

- A month's owner dead now is named in the tooltip (from the stats' dead list); a click on it picks nothing. Resuming
  closes the plate. The critic's probe green at both sizes; a case in `timeLapse1938.spec.ts`, red without the fix.

## 2026-11-18 — R159, R162: track rows judged on the timeline's notes; a banner's allies

- Only a bare place is told ("Japan occupies Northern Malaya", "Dalmatia to Italy"); a sentence is kept as written. A
  unit test runs every note of the timeline; five notes written ("Barbarossa: the German front" for "The line of
  1941-…"). None of the critic's 41 odd rows told.
- A banner's allies read "& 2", not "+2" beside the score's "+32".

## 2026-11-18 — R160: R147's bare openings traced; kept by ADR-1130

- From one saved state every bare opening of HEAD is declared the same with R147 off; on nine new seeds the bare share
  is 10.6 % with it and 9.2 % without. Kept, for the user's review: bare wars across the sea are their own item if wanted.

## 2026-11-18 — R161: a still banner yields to a war in battle (ADR-1131)

- The quiet banner-days with a war in battle behind "+n" were wars fought in their ten days but still for days. A war
  with no battle for three days now gives its place: 57901 8, 16, 10 (bar each under 44); 58901 9, 62901 12.
- With it, R156's death line kept to its banner's width (it stood the opened banners three rows deep; `warBannerRows1938`).

## 2026-11-18 — critic run 78 (focused, on d7b981dd)

- No blocking issue; every score at its bar (8 each; UI/UX 7 → 8). R77-B1, R77-N1, R77-N2 and R132's bar fixed.
- Four non-blocking issues filed as Batch 46 (R163–R166); then the full run (ADR-1016).

## 2026-11-18 — R163: R147's figures pooled on twelve seeds (ADR-1132)

- The critic's three seeds put the attacker with no man near at 18.8 % with R147. Pooled with ADR-1130's nine: 13.2 %
  with it, 12.1 % without, under ADR-1094's 15 %. No code; for the user's review with ADR-1130.

## 2026-11-18 — R164: the track rows' residue

- A note with a semicolon is kept as written; a told row starts with a capital; an alliance joined is named ("Romania
  joins the Anti-Comintern Pact"); Rome's 1944 note says the Allies took it.

## 2026-11-18 — R165: the time-lapse says a nation is gone; the first month named once

- The tooltip on a nation gone by now says so and why a click picks nothing; the plate's "from" is hidden at its first
  month.

## 2026-11-18 — R166: an opened banner is its own height

- Opened, the war banners stand at their row's head, each its own height: one with no death line is no longer half
  empty beside one with it. Batch 46 done; next, the full critic run (ADR-1016).

## 2026-11-18 — critic run 79 (full, on 79058a5a)

- One blocking issue (R79-B1: a war across the sea with no lift, by a door the gate does not ask); every score at its
  bar (8 each). Batch 46's four fixed on their probes. Filed as Batch 47 (R167–R172).

## 2026-11-18 — R167: across the sea by control too (ADR-1133); the next critic run full (ADR-1134)

- Argentina's war on a rebel of Brazil's was declared with no lift: its border was Brazil's, but "across the sea" was
  asked by ownership. Both doors now ask it by control too. The case and ten new seeds 0 broken; seed 99 unchanged.
- The user: the critic run after Batch 47 is a full run.
