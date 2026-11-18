# Warism — Roadmap

What is still to do after `release-2026-11-03` (ADR-805, the user's decision). PLAN.md and
`docs/PLAN_DONE.md` are the frozen record of the build up to that release.

Rules:
- Work top-down. "continue" means the first unchecked item (PROMPT.md).
- Each item says what it is for, its acceptance test (`AT:` names a figure, its bar and the run that
  reads it, or the case that must hold; ADR-554), and the rules it adds to a checker, when it changes
  a sim rule (ADR-803, ADR-804).
- An item too big for one sitting is split into lettered parts (R3a, R3b), one level only.
- Tick it (`- [x]`) in the commit that finishes it, with one line under it: the commit and the
  evidence. Ticked items stay until the batch's release, then move to CHANGELOG.md.
- A batch ends with a critic run and a release tag (`release-<YYYY-MM-DD>`, PROMPT.md "Releases"; a
  second on one day takes a letter, `release-2026-11-03b`, ADR-820).

## Batch 43 — the user's decision of 2026-11-17 ("Let's do 1-6" of the recommendations after release-2026-11-17)

- [x] R138 **The nightly's ten-year tests run out of time** (`.github/workflows/nightly.yml`, job `ten-year`,
  `timeout-minutes: 60`): cancelled at 60 min on 2026-11-13, 11-15 and 11-17 (runs 43412792679, 43705787921,
  44077095528); 53–54 min on the nights it ended. Also the 11-16 red (43855142847): `specRefs` §8 and
  `snapshot-perf` in the unit job; green on 11-17, the cause named in the item's evidence. AT: three nightly runs in a
  row green, the ten-year job's longest under 45 min (split over jobs or made cheaper; a longer limit alone is an ADR,
  the user's decision).
  76551f98, 160bbb19 (ADR-1118): the job a matrix of four. Runs 44206444954 (three-way), 44213292258, 44221126695 green
  in full; the longest ten-year job 38.6, 29.2, 22.9 min; a fourth, 44228789987, green, 29.4 min. The 11-16 red: `specRefs` §8's bare `chromeCover1938` (b64c242a),
  mended by a2b5dca0.
- [x] R139 **Wars in which nothing is taken** (run 75's non-blocking 5: 20 of 103 wars with no cell held by either
  side at day 30; BLOCKERS' France's far end and the USA's lift stand near it). Find the cause first on the critic's
  seeds; one cause a commit. AT: `npx tsx tools/diag/warOpening.ts` on 58211, 58213, 58215 (and two seeds no tuning
  has seen): wars with no cell held at day 30 under 10 % (19 % now), the opening bars of ADR-1094 kept. Checker:
  the rule it changes, in diploInvariants or its kin.
  40938ff7 (ADR-1119): a war across the sea, its sides touching nowhere by land, only with a group-room of free men
  that may march to the transports (`seaLift.ts`). `warOpening.ts` on 58211, 58213, 58215, 61009, 61011 (the last two
  unseen): 13.3 % -> 4.8 %; ADR-1094's no man near 11.7 % -> 7.0 %, the defender ahead 14.4 % -> 14.0 %. Checker:
  `lift` in diploInvariants (red with the rule off: Japan on Siam, 0 men to lift). Pin 3374082b -> f6d6ab13.
- [x] R140 **The same great powers for decades** (BLOCKERS "Sweep on seeds 701–710: no stasis on 7 of 10",
  2026-10-18: the same five largest nations 20–22 years running on 702, 704, 706). Measure on HEAD first (a sweep
  on seeds no tuning has seen); if it holds, the cause found is an item of its own. AT: a 10 × 50 sweep, the same
  five largest for 20 years or more on none of the 10; or the entry closed with HEAD's figures.
  Measured, not met: `docs/sweeps/2026-11-18-sweep-r140.md` (72001–72010) 2 of 10, 72006 22 years and 72007 20; BLOCKERS
  "R140". Closed with these figures by ADR-1120 (b), the user's decision: ADR-750 stands; the entry to the watch list.
- [x] R144 ~~The United States and Australia at peace for decades~~ Dropped by ADR-1120 (b), the user's decision.
- [x] R141 **A row of History flies to its place** (run 75's small things: "a row of History cannot be clicked to
  its place"; the ticker's rows do, `PLACE_VIEW_KM`). AT: a Playwright spec, every History kind with a place (a
  battle, an annexation, a strike, a capital, a revolt) on two seeds, at 1600 × 900 and 390 × 844: a click puts the
  place in the view; a row with no place is not offered as a link.
  eb8b0030 (ADR-1121): `historyPlace` over `HISTORY_PLACED` (each kind of the log placed or not, `historyPlace.test.ts`; an
  annexation at its target's capital), `MapView.showPlaceClear`. `historyPlace1938.spec.ts`, seeds 1938 and 7, at 1600 x 900
  and 390 x 844: a battle, an annexation, a strike, a capital taken and a revolt each under the map's canvas after the
  click, the whole list too (the panel closing on the phone); no link on a war declared; `docs/evidence/R141/`.
- [x] R142 **The director: a camera that goes to what happens** (goal 1; an idea, unmeasured). A switch in the bottom
  bar: the camera flies to a new war's front, a Major Battle, a nuclear strike or a capital taken (the ticker's and
  `battleView`'s places), stays some seconds, and goes on; the player's pan, zoom or click hands the camera back.
  The page's alone, no sim rule. AT: 10 min at 1 day/s on two seeds: at least 80 % of the ticker's war and battle
  rows visited, no cut within 4 s of the last, a manual pan or zoom stops it within a frame; 60 fps held (`npm run
  bench -- G`).
  734c0305 (ADR-1122): `src/app/director.ts`, the worker's `directorRows`, `CameraController.onTaken`. `director1938.spec.ts`
  with `DIRECTOR_MINUTES=10` at 1 day/s: seed 1938 135 of 135 rows seen (80 cuts), seed 7 116 of 116 (70); the shortest
  gap 4.52 s; a wheel turns it off within a frame, no cut after. `npm run bench -- G`: T0 406 fps, T2 158.5 fps.
- [x] R143 **The borders' time-lapse** (goals 1 and 2; an idea, unmeasured). The cells that changed owner each month,
  saved (a new section, in `UPGRADABLE_SECTIONS`), and a slider in History or Charts that plays the map from the
  start to now. AT: on two seeds, the time-lapse's map at each 1 January equals the ownership of a run stopped
  there; the record under 7 % of a 50-year save, packed (ADR-1123, the user's decision); 60 fps while it plays; save and load bit-identical, the pin moved
  only if the hash takes the section (ADR).
  Measured before building: the record of 50 years is 5.0 % (seed 99) and 5.6 % (seed 7) of the packed save in the best
  decodable encoding of ten tried (ADR-1123); the bar raised to 7 % by the user. Split 2026-11-18:
  - [x] R143a The record: the cells that changed owner each month, backward from the map of now (`src/sim/borderLog.ts`),
    saved as optional sections, the hash taking them. AT: on seeds 99 and 7 for 50 years, the record's map at each
    1 January equals the map of a run stopped there, the record under 7 % of the packed save; a save made in mid-month
    loads to the same record and game; the pin moved (ADR).
    035b2ab7 (ADR-1123): `tools/diag/borderLog.ts`, 50 years: seed 99 50 of 50 maps of 1 January alike, 5.34 % of the packed
    save; seed 7 50 of 50, 5.92 %; a cut 3.0 ms median. `borderLog.test.ts` (5: the codec, two seeds' 1 January, a save in
    mid-month, none at a start or in a scenario). Pin f6d6ab13 -> 1aabdc7e. The gate, `npm run test:sweep` green.
  - [x] R143b The slider: History or Charts plays the map from the start to now by the month. AT: the map at each
    1 January of the slider equals the record's on two seeds; 60 fps while it plays.
    a0e99e32 (ADR-1124): History's "Time-lapse", `TimeLapseBar`, `src/worker/timeLapse.ts`, `MapView.showTimeLapse`.
    `timeLapse1938.spec.ts`, seeds 1938 and 7: 1 January 1939 and 1940 alike cell for cell; 60.0 fps, p95 16.7 ms on the
    GPU. Built in 23 ms at 50 years (11.0 MB). `docs/evidence/R143/`.

## Batch 44 — critic run 76's findings (focused, on c2440872; one blocking issue; every score at its bar, UI/UX 7)

RELEASES step 2 (ADR-1005): the blocking issue first, then every non-blocking one, then the critic again (focused). R76-B1
is R139's own rule missed at other doors, not one item's fix breaking another, so not ADR-829's exit.
- [x] R145 **R76-B1: the `lift` rule is broken by its own checker.** A puppet's revolt (`puppets.ts`) and a massing's
  end (`massing.ts` 277, 286) declare over the sea without asking `noLift`; Hungary on Italy's door not found. AT:
  `diploInvariants.ts 33501 scenario 1825` and `58011 random 3650 --heroes` print 0 broken, and the report's 20 seeds
  stay at 0; the rule kept at each door, or the checker's scope narrowed with an ADR.
  21958d70 (ADR-1125): the lift asked of the war's defender (a puppet beside brings its overlord from over the sea), in the
  AI's pick and at a massing's end; a revolt's war (a puppet's, or the holder's on a nation a revolt made) out of the
  checker. `diploInvariants` 33501 scenario 1825 and 58011 random 3650 --heroes: 0 broken; the report's other 18: 0.
  Pin unmoved (1aabdc7e).
- [x] R146 **R76-N1: the director takes the camera back from a click** (a ticker row, a war banner, a History link).
  AT: `c76_dirHand.mjs 59955 120`, the three acts `onLater: false` or `cutsAfterAct: 0`.
  b299ab6d: the hud's place and fight links stop the director first (`game.tsx`). `c76_dirHand.mjs 59955 120`: all six
  acts `onLater: false`, `cutsAfterAct: 0` (ticker, banner, History 1, 1, 2 cuts before). `director1938.spec.ts` clicks the three.
- [x] R147 **R76-N5: Japan's first wars 9,000 km away again.** AT: `c76_firstdecl.ts 60` on 39821–39839 and 55821–55839,
  "over 6000 km" at 1 or fewer each (ADR-1041).
  f5dfc115 (ADR-1126): after a target across the sea is refused for want of a lift, none across the sea. `c76_firstdecl`
  0 of 49 and 0 of 55. R139's bars held on twelve seeds (its AT five 8.9 %, bar 10 %; ADR-1094's 12.3 % and 13.0 %,
  bar 15 %), though over R147's own off arm (4.8 %). `seaLift1938.test.ts`: Japan's Siam then Iraq.
- [x] R148 **R132's bar not held on HEAD: quiet banners behind "+n".** AT: `c76_bannerRank.mjs 57901 150`, three runs
  each under 50 (the user's bar), under 44 for UI's 8.
  0c065446 (ADR-1127): a held war gone quiet yields to a fought one. `bannerRank 57901 150` 42, 45, 42 (under 50; two
  under 44); `bannerFlip` 7 and 1 on 57901, 4 and 0 on 58901 (bars 10, 3). `warsFought.test.ts`; 12 banner specs green.
- [x] R149 **R76-N2: the time-lapse is not the month it shows.** The tooltip and click name the owner of now; Space runs
  the game under the plate; Escape does not close it. AT: `c76_tlMore.mjs cell 59943 700` names the month's owner (or
  none); `c76_timeLapse.mjs 59941 400 head` `ranUnderLapse` 0; Escape closes the plate.
  ca5bd35d: hover and pick read the month's map; Space is the time-lapse's while open (`hud.lapsePlaying`); Escape
  closes it last. `c76_tlMore cell 59943 700`: the panel Norway's; `c76_timeLapse 59941 400 head`: `ranUnderLapse` 0
  (96), Escape `lapseOn` false. `timeLapse1938.spec.ts` the three.
- [x] R150 **R76-N3: the director flies under an open panel and counts it seen.** AT: `PANEL=history
  c76_director.mjs 59951 100 head 120`, `seenCovered` 0, on a desk and a phone.
  de213ebd: the director flies clear of the panels (`showPlaceClear`) and sees a place only uncovered. The probe: desk 45
  of 45 seen, `seenCovered` 0 (53 of 56 covered before); phone `seenCovered` 0, 1 of 45 seen (History covers the phone).
  `director1938.spec.ts`'s case.
- [x] R151 **R76-N4: a save from before R143 plays only the months since its load** under a title that says "from the
  start". AT: `c76_tlMore.mjs old critic/c75_seed7019_y20.bin 40` shows the record's first month on the plate.
  c443ed90: the plate's "from <month year>" and History's hint "from the first month recorded". The probe's plate: "from
  January 1958" (`critic/shots/c76tm_old_*_step0.png`); `timeLapse1938.spec.ts` "from … 1938".
- [ ] R152 **R76-N6: two land heroes leap by the wheel in the world of 56901.** AT: `WHEEL=1 c76_heroPop.mjs` on 56901
  430, 58905 330, 59905 300, 59907 300: 4 or fewer each.
- [ ] R153 **On a phone the time-lapse's plate covers the ticker's second row.** AT: at 390 x 844 the plate and the
  ticker's rows do not overlap (a spec's boxes).
- [ ] R154 **A massing told again 50 days after its call-off** (56211, Britain on Mozambique, day 814). AT: that case
  tells it once; `massTold` on the 15 seeds of run 75 stays 0.
- [ ] R155 **Small worlds with no war in ten years** (54425, 54426, 55424, 59421, 59423 of two nations, 55404 of three).
  AT: a war in ten years on each, or an ADR that a world of two or three may keep the peace.
- [ ] R156 **Small things:** History rows that are a bare place name; the war-to-the-death title on hover only (a phone
  never sees it); run 75's phone nits (no ticker while the banners are open; "Scroll" and "Click" in the first cue;
  Settings' button to the title asks nothing). AT: each, a case in a spec. `slowClick` (0 of 90) stays as ADR-914.

## Released

- `release-2026-11-03b` (2026-11-03): R0a–R0i and Batch 1 (R1–R5, R7–R15), in CHANGELOG.md for
  players; the items with their evidence in `docs/history/ROADMAP-release-2026-11-03b.md`.
- `release-2026-11-10` (2026-11-10): Later (R6, R16–R44) and Batches 3–13 (R34–R58), and R61a of the release
  checks, in CHANGELOG.md for players; the items with their evidence in
  `docs/history/ROADMAP-release-2026-11-10.md`.
- `release-2026-11-11` (2026-11-11): Batches 14–16 (R59, R60, R61a's follow-ups, R62 the historical track, R63, R64), in
  CHANGELOG.md for players; the items with their evidence in `docs/history/ROADMAP-release-2026-11-11.md`.
- `release-2026-11-13` (2026-11-13): Batches 17–23 (R65–R79: armies on the replay's fronts, Cold War blocs, a start from any
  year, the replay to 1975, a faster tick, runs 63–67's findings, the gate on the GPU), in CHANGELOG.md for players; the
  items with their evidence in `docs/history/ROADMAP-release-2026-11-13.md`.
- `release-2026-11-15` (2026-11-15): Batches 24–31 (R80–R88: the replay to 1991, run 67's "not 9" items, the year's
  card, runs 68–72's findings, the release checks), in CHANGELOG.md for players; the items with their evidence in
  `docs/history/ROADMAP-release-2026-11-15.md`.
- `release-2026-11-17` (2026-11-17): Batches 32–42 (R89–R137: the map's look, a war's opening and its fronts, the review
  of the game's pictures, runs 73–75's findings), in CHANGELOG.md for players; the items with their evidence in
  `docs/history/ROADMAP-release-2026-11-17.md`.
