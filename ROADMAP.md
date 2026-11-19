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
- [x] R152 **R76-N6: two land heroes leap by the wheel in the world of 56901.** AT: `WHEEL=1 c76_heroPop.mjs` on 56901
  430, 58905 330, 59905 300, 59907 300: 4 or fewer each.
  fc9136d8: a hero counter's offset from its place (its step and `clearOf`'s beside a panel) eased at R131's pace in
  both axes. `WHEEL=1 c76_heroPop`: 0, 0, 0, 0 (11, 8, 5, 6 on HEAD). `heroes1938.spec.ts` R152: 12 px at most a frame
  (257 without the rule); the 9 hero specs green.
- [x] R153 **On a phone the time-lapse's plate covers the ticker's second row.** AT: at 390 x 844 the plate and the
  ticker's rows do not overlap (a spec's boxes).
  283de6e5: the ticker hidden while the plate is open, as the war banners are (both of now). `timeLapse1938.spec.ts`' phone
  case: no ticker row or banner under the plate at 390 x 844 (a row under it without the rule).
- [x] R154 **A massing told again 50 days after its call-off** (56211, Britain on Mozambique, day 814). AT: that case
  tells it once; `massTold` on the 15 seeds of run 75 stays 0.
  f72b1dea (ADR-1128): a told massing called off bars its target MASS_BAR_DAYS. On HEAD the case is 57613 (a day's
  Overrun); `c76_massTold.ts 3` on 13 seeds: told again 0 (1), twice 0. `massCalledOffBar1938.test.ts`. Pin -> f311b292.
- [x] R155 **Small worlds with no war in ten years** (54425, 54426, 55424, 59421, 59423 of two nations, 55404 of three).
  AT: a war in ten years on each, or an ADR that a world of two or three may keep the peace.
  ADR-1129 (no code): each traced. Four of near-equal strength score at most 0.30-0.49 against DECLARE_AT 0.5 after ten
  years' restlessness; 59423's war is refused by R139's lift (its army cannot reach its transports); 55404's best target
  is across the sea, dearer than its margin. Kept; the two levers named, each an item if wanted.
- [x] R156 **Small things:** History rows that are a bare place name; the war-to-the-death title on hover only (a phone
  never sees it); run 75's phone nits (no ticker while the banners are open; "Scroll" and "Click" in the first cue;
  Settings' button to the title asks nothing). AT: each, a case in a spec. `slowClick` (0 of 90) stays as ADR-914.
  f59be4b2: a track row's bare note told by its kind ("Japan occupies Northern Malaya"; `trackText.test.ts`); a war to the
  death marked ☠ on its banner, its line in words when the banners are opened (`warToDeath1938`'s phone case); on a
  phone the ticker stands above the opened banners, not hidden (`reviewBatch1938`, no row under a banner); the first
  cue says tap and pinch on a phone (`reviewBatch1938`); Settings' main menu asks, Stay or Leave (`title.spec.ts`).

## Batch 45 — critic run 77's findings (focused, on 7066d800; one blocking issue; every score at its bar, UI/UX 7)

RELEASES step 2 (ADR-1005): the blocking issue first, then every non-blocking one, then the critic again (focused).
- [x] R157 **R77-B1: the time-lapse names no owner that is dead now.** On run 76's 7019 world at January 1938, 35 of the
  map's nations are dead by 1957 (Sweden, Germany, Norway): no tooltip, and a click selects the dead nation with no panel
  (the first Escape spent on it). AT: `node critic/scripts/c77_tlDead.mjs critic/c76_seed7019_y20.bin` (and `… 390 844`)
  gives the tooltip "Sweden" and `click.selected` 0 or a panel at both sizes; `tlMore cell 59943` still "Norway"; a case
  in `timeLapse1938.spec.ts`.
  d58a116a: the tooltip names a nation dead now from the stats' dead list; on the time-lapse a click on one selects
  nothing. Probe: "Sweden", `click.selected` 0, at 1600 × 900 and 390 × 844 (Norway, Germany named too). The spec's
  case annexes Sweden by God and hovers it on the first month's map (red without the fix: no tooltip).
- [x] R158 **R77-N1: the bar's Resume runs the game under the time-lapse.** 96 hours ran with the plate on January 1938
  and the ticker hidden (R153). AT: the probe's `resume.ranHours` is 0, or resuming closes the plate; a case in the spec.
  d58a116a: resuming closes the plate (`togglePause`); probe `after.open` false at both sizes; the spec's case clicks
  the bar's Resume.
- [x] R159 **R77-N2: R156's track rows told wrongly.** "{nation} occupies" goes before notes that are already sentences
  ("Kerch retaken", "The line of 1941-12-01"), and occupy's `by` is not always the note's actor; still bare: "Crete",
  "Salonika", "↳ Dalmatia", "Italy's zone", "Egypt clear". AT: `npx tsx critic/scripts/c77_trackTexts.ts` lists no row
  of `critic/c77_trackTexts_odd.txt`'s kinds; the 1941 page shows no "The line of 1941-…"; a unit test runs every
  timeline note through `trackText`.
  129a6305: only a note that is a bare place (every word a capital's but "and"/"of", no colon, not "To …") is told,
  each kind its own way ("Dalmatia to Italy", "Romania joins the war"), "The" small inside; a note in the nation's
  own name as it is. Five notes written: "Uranus and Little Saturn: the Red Army's advance", the four "The line of
  1941-…" as "Barbarossa: the German front". `c77_trackTexts.ts`: none of the 41 odd rows told; `trackText.test.ts`
  runs all 1,207 notes (a sentence kept as written; 69 told). The 1941 page: no "occupies The", no "line of 1941".
- [x] R160 **R77-N3: R147 brings back war openings with nothing taken.** `c77_woAB.sh`: HEAD 14 of 88 with no cell
  held at day 30 (defender ahead 20.3 %), `--lift-far` 7 of 96 (15.5 %). AT: on run 76's nine seeds HEAD is back near
  14 of 276 (under 6 %), with `c77_firstdecl.ts 60` still 0 over 6,000 km; or the trade kept by an ADR for the user.
  f11b6406 (ADR-1130, no code; for the user's review): kept. From one saved state all 22 of HEAD's bare openings are
  declared the same with R147 off (`.cache/r160_ab.ts`); on nine new seeds 10.6 % with it, 9.2 % without (the
  defender ahead 14.4 %, 13.4 %), neither under 6 %. The rise on run 76's seeds is the world's course, not the rule.
- [x] R161 **R132's bar on 57901.** `bannerRank 57901 150`: 51, 33, 42. AT: three runs each under 44.
  c781bb4b (ADR-1131): a war with no battle for 3 days yields its place to one in battle now behind "+n" (its last
  battle sent by the worker). `bannerRank 57901 150` (a copy reading `fought`, `.cache/r161_br.mjs`): 8, 16, 10;
  58901 9, 62901 12; the row's set changes as before. `warsFought.test.ts`: a case, red without the rule.
  With it, a fix of R156 the gate missed (no spec of it changed): its death line widened an opened banner to a row,
  three rows deep at 1400 × 800 (`warBannerRows1938` red); the line is now as wide as its banner. The 13 specs that
  read the banners green on both projects.
- [x] R162 **Small things:** a banner "Nationalist Spain ⚔ Portugal +2 +32 ☠" (the allies' count and the score side by
  side, both with a plus). AT: a case in a spec. `slowClick` (0 of 90) stays as ADR-914; `dirHand`'s phone History act
  not judged by the critic, not filed.
  129a6305: a side's allies are "& 2" (its title "Portugal and 2 more"); `warToDeath1938`'s case: each allies mark
  "& n", no banner with two plus numbers.

## Batch 46 — critic run 78's findings (focused, on d7b981dd; no blocking issue; every score at its bar)

RELEASES step 2 (ADR-1016): a focused run with no blocking issue; its non-blocking issues fixed, then the full run.
- [x] R163 **R78-N2 (R77-N3, ADR-1130): with R147 the attacker has no man near more often on new seeds.** `c78_woAB.sh`
  on 66211, 66213, 66215: HEAD 13 of 69 (18.8 %), defender ahead 17.4 %; R147 off 9.4 %, 14.1 %; bare openings the same
  (10.9 %, 10.4 %). AT: ADR-1130's nine seeds with run 78's three, by `node critic/scripts/c77_woCount.mjs`, give the
  attacker bar under 15 % with R147; or ADR-1130 amended with the pooled figures, for the user's review.
  1431c0d8 (ADR-1132, no code): pooled over the twelve seeds, the attacker with no man near 34 of 257 (13.2 %) with R147,
  32 of 265 (12.1 %) without; the defender ahead 15.2 % and 13.6 % (a measure, no bar). ADR-1130's line corrected.
- [x] R164 **R78-N1: the track rows' residue.** "Italy occupies Rome" (4 June 1944; the Allies took it), "the Second
  Vienna Award to Hungary" with a small first letter, "Soviet Union occupies Bagration and Lvov-Sandomierz; Romania" (a
  semicolon passes the bare test), nine "… joins the alliance" naming no alliance. AT: `npx tsx
  critic/scripts/c78_trackTexts.ts` tells none of these; `ROWS=Rome node critic/scripts/c78_trackRows.mjs 1943 600` shows
  Rome's row with its taker or as written; cases in `trackText.test.ts`.
  f1bbc8a5: a note with a semicolon is kept as written; a told row starts with a capital ("The Second Vienna Award to
  Hungary"); "… joins the Anti-Comintern Pact" (the Eastern Bloc, the North Atlantic Treaty): the row carries its
  alliance's name; Rome's note is "Rome falls to the Allies". `c78_trackTexts.ts` with the alliance passed
  (`.cache/r164_trackTexts.ts`): none of the four; `trackText.test.ts`: a case, and every told note starts with a
  capital and names its alliance. With the starts rebuilt, `ROWS=Rome c78_trackRows.mjs 1943 600`: "4 June 1944 Rome
  falls to the Allies".
- [x] R165 **The time-lapse:** a nation gone now is named exactly as a living one; at the first month the plate reads
  "from January 1938" beside "January 1938". AT: the tooltip on a dead nation marks it gone (`c77_tlDead.mjs` on 7019);
  the first month's plate names the month once; cases in `timeLapse1938.spec.ts`.
  f32f55bf: the tooltip on a nation gone by now adds "Gone by now: nothing to select"; at the first month the plate's
  "from" is hidden (kept in its place, the slider does not move). `c77_tlDead.mjs` on 7019: "Sweden / Gone by now:
  nothing to select", Norway the same, `selected` 0, at 1600 × 900 and 390 × 844; the spec's case (red without).
- [x] R166 **Small:** a short war's opened banner stands as tall as a neighbour with the death line, half empty
  (`critic/shots/c78dt_7019_400_1400x800.png`). AT: an opened banner's height is its own content's; a case in
  `warToDeath1938.spec.ts`. `slowClick` 0 of 90 stays as ADR-914, not filed.
  16cbcebb: opened, the banners stand at their row's head, each its own height. `warToDeath1938`'s case: Poland's banner
  shorter than one with a death line on its row, at 1400 × 800 and 390 × 844 (red without: 78 against 73 px). The
  banner specs (13 files and the tooltip's) green on both projects.

## Batch 47 — critic run 79's findings (full, on 79058a5a; one blocking issue; every score at its bar)

RELEASES step 2 (ADR-1022): the blocking issue first, then every non-blocking one; then the critic again, a full run
(ADR-1134, the user's decision).
- [x] R167 **R79-B1: a war across the sea declared with no lift, through a door the gate does not ask.**
  `npx tsx tools/diag/diploInvariants.ts 64015 random 1825 --heroes`: day 1411, ARG declares on #105 (at war with
  Brazil, which takes it as a puppet that hour), 16,294 men to lift for a room of 25,200; `noLift` true in the six
  hours before (`critic/scripts/c79_liftTrace.ts`). AT: that command prints 0 broken; `diploInvariants` on ten more
  random-diplomacy seeds with heroes, five years each, 0 broken; a unit test of the door.
  838b1aff (ADR-1133): the day's choice declared it (no massing); "across the sea" was asked by ownership. Now
  `acrossSea`, for both doors, counts a neighbour touched nowhere by control too. The case 0 broken; 67001–67010 0
  broken each; `seaLift1938.test.ts`: Chile's border held by Bolivia, both doors refuse Argentina with no lift (red
  without the rule). Seed 99's pin unchanged.
- [x] R168 **R79-N1: the random world's banners wrap mid-phrase** ("Orientale & / 1 ⚔ Diffa & / 2" at 1600 × 900).
  AT: `node critic/scripts/c79_rw2.mjs 64965 730` ends with each banner on one line, or a name truncated with its
  count whole; a case in a spec.
  eba1ee3f: a side's name on one line, cut short past 11 rem, its "& n" whole (the closed row squeezed three banners and
  wrapped them). `c79_rw2.mjs 64965 730`: "Kagoshima ⚔ Chukotka Autonomous Okrug & 3 +55" on one line, every banner so;
  `warBannerRows1938`'s case renames the sides to long names: one line closed and opened (red without: 28 px).
- [x] R169 **R79-N2: `WebGL: INVALID_VALUE: bufferSubData: buffer overflow` at 2560 × 1440,** 64907 day 500, 30 m/px over
  British carrier groups. AT: `node critic/scripts/c79_glSpot.mjs 64907 2560 1440 500 1043.43 273.0` prints
  `"errors":[]`; a test of the buffer's growth.
  85dfce3f: the ground's instances were sent with a count of 0 when nothing stood in the view, and WebGL reads a length
  of 0 as the whole array, there longer than the buffer (the scatter's array sized to the view and the frame's time).
  An empty upload now sends nothing (the units' `ProxyRenderer` the same). `c79_glSpot.mjs 64907 2560 1440 500 …`:
  `"errors":[]`; `groundThings1938`'s case: an empty upload of twice the buffer, `getError` 0 (red without: 1281).
- [x] R170 **R79-N3: on a phone History opens under an open nation panel** (`dirHand 59955 120 390 844 touch`: the
  History act cannot click `history-go`). AT: that act ends with `cutsAfterAct` and no "act failed"; a case in a spec.
  2913b3e1: on a phone History stands in the nation panel's place while open (History's own panel; the relations graph
  still opens a panel over itself); the nation stays selected and its panel comes back. `c79_dirHand.mjs 59955 120 390
  844 touch`: the History act taps "A major battle began near Elbląg", `cutsAfterAct` 0, no "act failed";
  `historyPlace1938`'s case: History's link under the tap (red without). The 19 phone specs of the nation panel green.
- [x] R171 **R79-N4: a pact named for another:** "Romania joins the Anti-Comintern Pact" under "The Tripartite Pact:
  Hungary"; bare rows "Thailand's alliance with Japan", "The Sino-Soviet treaty", "Canada in NATO as since 1949". AT:
  the rows of 1940-11 name the pact the timeline names; those three told or rewritten; cases in `trackText.test.ts`.
  adbc4b71: the notes of the Tripartite Pact's joinings name it as Hungary's does ("The Tripartite Pact: Romania",
  Slovakia, Bulgaria; the game's bloc is the Anti-Comintern Pact); "Thailand allies itself with Japan", "The
  Sino-Soviet treaty: the People's Republic of China allies itself with the Soviet Union", "NATO: Canada, a member
  since 1949". `trackText.test.ts`: the four 1940–41 rows the Tripartite Pact, every alliance row a sentence or a
  "Pact: nation" line (red on the old notes).
- [x] R172 **Small:** the strike's ring over the city's name (God Mode); like flags on both sides of a civil war's sea
  battle; three opened phone banners with the same death sentence; the AI's bomb a faint spot at 600 m/px where the game
  stops on it. AT: each seen fixed in a shot or a case, or kept by a line here. `slowClick` stays as ADR-914.
  3d68ee45: the death sentence: opened, a banner whose sentence another already said says it short ("China fights to
  the death: no peace is made"); `warToDeath1938`'s case, a second war with China to the death (red without: in full
  twice). Kept, not traced in this batch: the strike's ring over the city's name, like flags in a civil war's sea
  battle, the AI's bomb as a faint spot at 600 m/px where the game stops. Each is the report's "not 9" in a dimension
  at its bar (God Mode, naval, AI nukes at 8), a drawing question of its own; the full run judges them again.
- [x] R173 **`relationsTap1938` red 1 in 2 on HEAD** (found in R170's hand run, not the critic's): "the pinch zoomed in"
  fails with or without R170's change (`--repeat-each 2`: 1 failed, 1 passed). AT: ten runs green, or on
  `tools/gate/knownRed.json` with a BLOCKERS entry if a machine's alone.
  8233a81b: two faults, both the game's. (1) A nation's menu closed only on a press on the map: the spec's second tap
  could land on the chip of the panel now over the node, opening the menu, and the panel's × left it over the graph,
  where the pinch began (traced by logging the pointers in a failing run: "nation-menu-take < nation-menu"). A press
  anywhere outside the menu now closes it (`touchMenu1938`'s case, red without). (2) A finger whose `pointerup` the
  graph never had stayed among the fingers down and made a pinch's two three: a new gesture's first finger starts the
  count again (`relationsTap1938`'s case, red without). `relationsTap1938` 48 of 48 green at 8 workers (before: 2 of 20
  red).

## Batch 48 — critic run 80's findings (full but incomplete, on 18c2b40a; one blocking issue, a regression; UI/UX 7)

ADR-829's exit: R80-B1 is a regression of R168. The loop stops; ADR-1135 (proposed) waits on the user. No item of the
UI/UX dimension is taken until the user decides.
- [x] R174 **R80-B1: on a phone the war banners' names cut to 0–3 letters** (R168's regression). `BASE=… node
  critic/scripts/c80_bannerNames.mjs 68901 400 390 844`: "China" 0 of 5; day 0 "J… & 2 ⚔ C… & 1"; 68903 day 700 "T… ⚔
  Gr…". AT: by the user's choice in ADR-1135; for (a), each side at least 5 letters or whole on both probes, the 1600 ×
  900 random case whole, a phone case in `warBannerRows1938`.
  - Done (d6316672, the user's (a), ADR-1135): `c80_bannerNames` at 390 × 844 on 68901 day 0 and 400 and 68903 day 700:
    0 sides cut to 3 or fewer, every name of 8 letters or fewer whole ("Soviet Un…", "Nationalist Sp…"), each count
    whole, the banners on the screen; the same at 360 × 740, 844 × 390 and opened. The new case red on the build
    before (`"Japan" whole`); the 1600 × 900 case green; the 13 specs on the banners 54/54.
- [x] R175 **R80-N1: on a phone Relations opens under an open nation panel** (`c80_menuPinch.mjs 68933 390 844`: 45 of 81
  graph points covered; 844 × 390: 81 of 81). AT: `hiddenOf81` 0 at both sizes; a case in a spec.
  - Done (cb55c840): on a phone the panel open as the graph opens gives way to it (`hud.relationsOver`) until a nation is
    chosen or the graph closes. `relationsTap1938`'s new case: 0 of 81 points covered at 390 × 844 and 844 × 390 (red
    before: 45); closed with no choice, the panel back; a node tapped, its panel shown. The specs on Relations 36/36.
- [x] R176 **R80-N2: "Go to country" in a chip's menu selects but does not fly there** (PLAN 7.175f; `c80_goto.mjs 68931`:
  the camera still at (1024, 512) at 4 s). AT: the probe shows the camera on the nation; a case in a spec.
  - Done (53861743): "Go to country" selects the nation and flies to its capital, clear of the panels (`hud.onGoToNation`;
    the chip never flew either, PLAN 7.175f's "as the chip did" was wrong). `c80_goto.mjs 68931`: (1024, 512) × 0.79 →
    (1095, 344.5) × 20.9, Rome in the view, 0 errors. `forceWar1938`'s Go to case: Rome in view and uncovered, the scale
    up (red without the wiring: unchanged).

## Batch 49 — critic run 81's findings (full, on 7c64529e; one blocking issue; UI/UX 7, every other score at its bar)

R81-B1 is R170 unfinished (run 80's build the same), not a regression: ADR-829's exit does not apply. UI/UX under its
bar in runs 80 and 81 (two in a row).
- [x] R177 **R81-B1: on a sideways phone History opens under an open nation panel** (R170 held upright only). `BASE=… node
  critic/scripts/c81_histOver.mjs 68901 60 844 390 GER`: 81 of 81 of History covered, `historyGoTapped` false; 667 × 375
  and 932 × 430: 63 of 81; `dirHand 59955 120 844 390 touch`: "act failed … history-go". AT (the bar's): the probe shows
  `history-btn.hiddenOf81` 0 and `historyGoTapped` true at the three sizes; `dirHand` at 844 × 390 with no "act
  failed"; the upright case as it is; a case in `historyPlace1938`.
  - Done (1f45e2f3): R170's give-way moved into the phone block that counts a sideways phone (`max-height: 500px`, as
    `usePhone`). `c81_histOver 68901 60 … GER` at 844 × 390, 667 × 375, 932 × 430 and 390 × 844: `hiddenOf81` 0,
    `historyGoTapped` true; `dirHand 59955 120 844 390 touch`: History's act "A major battle began near Elbląg",
    `cutsAfterAct` 0, no "act failed". R170's case in `historyPlace1938` now at 390 × 844, 844 × 390 and 667 × 375 (red
    without: the panel visible). The 21 specs that open History 76/76.
- [x] R178 **R81-N1: on a phone 375 px or narrower the banners' swatches squeezed to 0 px; at 320 px the swords over "& 2"**
  (R174's side effect; also Hearts of Iron IV's flag kept by a cut name, the report's idea: taken here). `DPR=2 node
  critic/scripts/c81_bannerFit.mjs 68901 0 360 740`; 69903 day 700; 320 × 568 day 400. AT: no swatch under 6 px and no
  overlap on these cases; a case in `warBannerRows1938`.
  - Done (144c26e9): the swatch, swords and skull never shrink; on the phone's closed row a side and a banner are no
    narrower than what they show, a long name's least its first letters (one line clamped, at a word where it can be:
    "Soviet.."); on a row of 350 px or less (a phone ≤ 365 px) the padding is less and the "& n" gives way (ADR-1135 (a)'s
    order; still in the title and opened). `c81_bannerFit` (DPR 2): 0 swatches under 6 px, 0 overlaps, 0 overflow on
    68901 d0 and d400 and 69903 d700 at 320, 360, 375, 390 and 412 wide, opened at 360 and the random 64965 at 390; its
    only lines left are "allies shown 0" at 320 and 360, by design. The new case red before (swatches 1.5–2.5 px); the 13
    specs on the banners 55/55.
- [x] R179 **R81-N2: "Go to country" on a phone leaves the capital under the new panel** (11 of 27; 360 × 740 7 of 7).
  `c81_goto2.mjs 68931 390 844`, `69937 360 740 400 ITA,USA,ENG`. Cause by the code: the clear map measured before the
  new panel is drawn. AT: the capital on open map in the probe's flights at both sizes; a case in a spec.
  - Done (b26ae6b6): the clear map measured two frames on, once the chosen nation's panel is drawn; where no room of 60 px
    is left (360 × 740: the panel leaves a strip over the ticker), a strip of 8 px, then the centre
    (`showPlaceClear`'s `margin`). `c81_goto2`: 68931 at 390 × 844 8 of 8 on the map (before 6), 69937 at 360 × 740 7 of
    7 (before 0), 69931 at 390 × 844 day 700 9 of 9, the desk and 844 × 390 8 of 8. A case in `forceWar1938` at 390 ×
    844 and 360 × 740 (red without: "panel-puppets").
- [x] R180 **R81-N3: at 1024 × 768 the war row's "+n" under the legend, not clickable** (and the row over the ticker's
  second row). `c81_moreClick.mjs 68901 400 1024 768`. AT: the click works at 1024 × 768 and the sizes that work now; a
  case in a spec. (Ages of Conflict's scrolling war list, the report's idea: not taken unless the row cannot clear the
  legend, a change of what the row is.)
  - Done (3bf4e111): on a desk the closed row shows the banners that fit its width (`fit` in `WarBanners`, counted again
    at a resize and when the number of wars changes), the rest behind "+n"; the row's `max-width` (PLAN 3.12Rh) kept
    it clear of the ticker and the legend once it no longer spills past it. `c81_moreClick 68901 400`: the click works
    at 1024 × 768 (before refused, "map-legend intercepts"), 1152 × 864, 1280 × 800, 1366 × 768 and 1600 × 900;
    `overTicker` []. The case in `warBannerRows1938` (red without: past its width, over the ticker, under the legend,
    "+n" not hit). `settings1938`'s low view at 1100 × 600 waited for 3 closed banners: now the row's fit (1 there) and
    the row within its width, its opening to 6 as before. The 13 specs on the banners 56/56.
- [x] R181 **R81-N4: on a phone a nation chosen again from outside the graph shows no panel** (R175's `relationsOver`
  still names it). `c81_relOver.mjs 68933 390 844` step 4; 69933, 69935 at 360 × 740, and 844 × 390. AT: the panel
  shows at step 4 on these; a case in `relationsTap1938`.
  - Done (bb611265): `relationsOver` forgotten once another nation is chosen (hud's selection effect). `c81_relOver`
    step 4 "panel Germany" on 68933 and 69933 at 390 × 844, 69935 at 360 × 740 and 68933 at 844 × 390 (before: none); the
    rest of its steps as before. A case in `relationsTap1938` at both sizes (red without: no panel).
- [x] R182 **On a sideways phone a node chosen in the graph hides the whole graph under its panel** (non-blocking 5 and the
  design objection; R175 as designed). `c81_relOver.mjs 68933 844 390` step 5: 81 of 81. Taken: the graph stays in
  view beside or above the panel. AT: at 844 × 390 after a node's tap its panel shows and at most half the graph's
  points are covered; a case in `relationsTap1938`.
  - Done (e29440c0): on a sideways phone with Relations open, the graph's panel on the left half and a nation's panel on
    the right half. `c81_relOver 68933 844 390`: 0 of 81 covered at every step (before: 81 at steps 3–5); boxes at 667 ×
    375 and 932 × 430 side by side; upright unchanged. A case in `relationsTap1938` at 844 × 390 and 932 × 430 (red
    without: 81); not at 667 × 375, where the graph is 54 px high and no node is wide enough to pick by finger. The 17
    specs on Relations and sideways layouts 86/86.
- Not taken: ADR-1111's heroes' names over Europe's counters at the world's zoom (decided there); R172's kept three (the
  ring over "Pari", the AI's bomb at 600 m/px, like flags at sea; as R172); `slowClick`'s named cases (ADR-914).

## Batch 50 — critic run 82's findings (focused, on 3e560a9c; two blocking issues, one a regression; UI/UX 7)

ADR-829's exit, on two counts: R82-B1 is a regression of R174 by R178, and UI/UX is under its bar in runs 80, 81 and 82.
ADR-1136: the user chose (a).
- [x] R183 **R82-B1: on a phone the war row cuts a name under five letters while its "& n" stays** (R178 regresses R174 and
  ADR-1135 (a)). `c82_nameLetters 68901 400 375x667`: "Sovi… & 3"; 82901 day 400 at 375 × 667 "Sovi… & 3", the row 10 px
  past its width, "+5" cut at the edge; `SCEN=random c81_bannerFit 64965 730 390 844`: "Que…" (Queensland). Cause: the
  count gives way by the row's width alone (≤ 350 px), and `overflow-wrap: anywhere` breaks inside a word. AT: by the
  user's choice in ADR-1136; for (a), the row shots of `c82_nameLetters 68901 400 368x740,375x667,384x832`, `82901 400
  375x667` and the random 64965 at 390 show every long name with 5 or more letters or whole ("Queen…" or more), read from
  the shots or by a drawn-width check; `c81_bannerFit 82901 400 375 667` no overflow and "+n" in the view; 320, 360, 390
  and 412 as now; a case in `warBannerRows1938` that measures the drawn letters.
  - Done (b69e59a8, ADR-1136 (a)): R178's clamp and its row-width rule out; `WarBanners` sizes the phone's closed row
    (`sizeRow`): each banner measured as with room; if the row is short the long names give way by what each has to
    give, down to their first five letters and the ellipsis (its drawn width in the name's font); if not enough, banners
    drop their counts one at a time, those with a long name first, and the names give way again. Banners and sides do
    not shrink on that row; a short name is whole. Shots (DPR 2): 68901 day 400 "Soviet Union" whole at 320–375 with
    its banner's counts gone and "Japan & 2 ⚔ China & 1" kept, "Soviet… & 3" at 384, "Soviet U… & 3" at 390, whole with
    all counts at 412; 82901 at 375 "Soviet Union ⚔ Japan | France & 11 ⚔ Germany & 2", "+5" in the view; random 64965
    at 390 "Kagosh… ⚔ Chukotka Auton…" and "Alaska ⚔ Queens…"; 69903 at 360 "Sovie… & 1". `c81_bannerFit`: 0 faults
    but "allies shown 0" (by design) on 68901 d0/d400, 69903, 82901 from 320 to 412 and opened. The new case in
    `warBannerRows1938` at 368, 375, 384 and 390 measures the drawn letters (red on R178: "Kagoshima Prefecture" under
    five letters, the row past its width, "+n" off the screen); the 13 specs on the banners 57/57.
- [ ] R184 **R82-B2: on a sideways phone the nation whose panel Relations hid, chosen again from the Ranking, shows no
  panel** (R175/R181 unfinished; run 81's build the same). `c82_relRank.mjs 68901 844 390 SOV USA` step 4, and at 667 ×
  375: selected 10, `relationsOver` 10, no panel. Cause: `relationsOver` cleared only when the id changes; the same id
  changes nothing. AT: step 4 a panel with `selected` 10 at both sizes; steps 5–7 and `c81_relOver`'s eight as now; a case
  in `relationsTap1938`. (UI/UX: held for ADR-1136 with the rest.)
- [ ] R185 **R82-N1: on a sideways phone the relations graph cannot be read** (667 × 375: 302 × 55 px, names 4 px; R182
  made it smaller there; zoom leaves names 4–6 px). `c82_graphSize 68901 667 375`, `844 390`; `c82_graphZoom`. AT: the
  graph 150 px high or more and a median name 10 px or more, at least after one "+", at both sizes. (Hearts of Iron IV's
  list of a nation's ties on a small screen, the report's idea: an option for ADR-1136, not taken alone.)
- [ ] R186 **R82-N2: at 360 × 740 "Go to country" puts the capital in an 8 px strip where it cannot be seen** (R179's
  fallback). `c81_goto2 69937 360 740 400 ITA,USA,ENG`: Brussels at (176, 528). AT: the capital's dot and name seen in
  the probe's shots at 360 × 740; a case in a spec.
- [x] R187 **At 360 and 375 px a clamped name sits away from its swatch, some clamps end ".."** (`c82nl_82903_d700_375x667`,
  `69903_d700`). AT: the name beside its swatch and one ellipsis, from the shots. (With R183.)
  - Done (b69e59a8, with R183): the clamp is gone; a cut name ends in one "…" by `text-overflow`, its box as wide as set,
    beside its swatch (`c82nl_82903_d700_375x667_r183`, `c82nl_69903_d700_360x740_r183` shots).
- [ ] R188 **R82-N3: on a sideways phone the opened Ranking covers the bar's History, Relations and Editor** (run 81's
  build the same; `c82rr_68901_844x390_SOV_USA_*_4_A_row_tapped.png`). AT: those buttons tappable with the Ranking open
  at 844 × 390 and 667 × 375; a case in a spec.
- Not taken: ADR-1111's heroes' plates over Europe at 3,000 m/px (decided there); R172's kept three (as R172); the
  design objection on ADR-1135 (a)'s order is ADR-1136's question.

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
