# Critic report, run 75 (full): Batches 40 and 41 (R125, R128 to R131) and the whole brief, on `e830930e`

- **Mode: full.** The spawning message asks for a full run (CRITIC_PROMPT, ADR-915, ADR-916). Run 74 was focused, with
  no blocking issue and semantic zoom at 7, under its bar of 8. Every dimension is scored afresh.
- **Time:** 06:48 to 09:20, two and a half hours. A full run is not bounded.
- **Commit judged:** `e830930ec2c121f12ef5e746fa6151db5497ca48`, HEAD at the start (`critic/c75_commit.txt`).
- **The last report:** run 74, focused, on `6cc762ea`: no blocking issue; UI/UX 8; semantic zoom 7; every other
  dimension 8 (six of them carried). The last full run was run 72 (`2ae30ec6`).
- **What changed since run 74:** 3 commits, 15 files outside `critic/` and the documents, 11 of them under `src/`:
  - R128 (ADR-1109): R124's step, which chose a hero's counter anew each frame, taken out of `counters.ts`;
  - R129 (ADR-1109): `MassingCalledOff`, a row in the ticker and History when a massing that was told ends with no
    war on its target;
  - R130 (ADR-1109): the banners' row has a war with a battle before one without;
  - R125 (ADR-1110, the user's decision): from 1,200 m/px out the T1 markers are stacked and parted by a tighter rule;
  - R131 (ADR-1112): a hero's marker at T1 keeps its side of its unit and moves at 6 px a frame at most;
  - R124 left as it is (ADR-1111, the user's decision).
- **Due because the sim changed:** `git diff --stat 6cc762ea HEAD -- src/sim data public/data` is 2 files
  (`ai/massing.ts`, `history.ts`). Plain 1938 is not carried by ADR-959 (the diff touches `src/sim/ai/`, and the
  20-year saves end at new hashes: 7019 `068f1066`, 32019 `a75df50c`; run 74: `165d4b75`, `6d77a72d`). The worlds are
  run 74's: both seeds have the same nations, formations and flipped cells in every one of the twenty years (80, 1,421,
  21,830 and 84, 968, 31,074 at the end); the hash moved because the history, which now has the called-off rows, is
  state. Run 61's bulk sets and Malta's 18 were run again all the same.
- **An earlier run 75 was begun and died.** `critic/` held 215 `c75_*` scripts and 60 outputs of a run started at 06:00
  on `c8023172` (its `c75_commit.txt`), which ended in fork failures (`c75_buildchain.log`) before it wrote a report.
  I moved every output of it to `critic/c75_stale_c8023172/` and cite none; its scripts (copies of run 74's on the
  seed family 58xxx, with `c75_massOff.mjs`, `c75_bannerFlip.mjs` and a `c75_massTold.ts` that reads the new kind) I
  read and used. The build and the starts were made again from HEAD.
- **Files named `c74_*` that are not run 74's:** six are newer than its report (05:40 to 06:41, the builder's runs of
  the critic's probes: `c74_hp_r124_*`, `c74_hp_r128_*`, `c74_mk_r125_*`, `c74_br_57901_1600x900.json`). None is
  used. Run 74's figures are from its report, from its logs older than 05:36, or from its build run again beside
  HEAD.
- **Left out:** no dimension. Of run 74's left-outs, all were run but the nuke A/B against run 72's commit: the
  nuclear rules have not changed since run 72 (`git diff 2ae30ec6 HEAD -- src/sim/systems/nuclear.ts` is empty), so
  there is nothing to compare; the launches were counted on six seeds on HEAD instead.
- **Probe failures of mine, disclosed:**
  - `c75_g_editor 58921` stood again on the pause of a nuclear strike (as in runs 73 and 74). The cause is the
    probe's: it waited for the clock while the game, as designed, waits for the player at the alert. I stopped it by
    its process id, made the probe read the alert and resume (`critic/scripts/c75_g_editor.mjs`), and ran it twice
    more: both whole (`critic/c75_g_editor.58921.rerun2.log`).
  - `c75_hist`, `c75_x_trackend91`: the "Charts" button is inside the ranking since R94a and the probes clicked where
    it was (run 74's `hist` stopped there too). Mended and run whole.
  - `c75_seaclick 58913`: no row in sixty days, as in run 74: the probe stepped a day at a time and a sea battle's
    row is there only while it is fought. Mended to two hours a step: the row is found on day 6 of 58061.
  - `c75_monkey.mjs 58807` (my new probe): its first run stopped answering after 241 s. The page's renderer was idle
    (0.00 CPU-seconds in 4 s); I stopped the probe by its process id. With a timeout on every act the same seed and
    three more runs went to their ends with no act timed out, so I count it as the probe's, cause not found.
  - Arguments of mine: `c75_massOff.mjs` and `c75_massHist.mjs` want a tag where I gave a name (their "Take control"
    step failed; the rows before it were read; run again with tags); `c75_bannerFlip.mjs` looked a nation up by a
    name the page does not hold (mended to a tag); one `c75_ev91` log name was too long for the file system (run
    again under a short name); `c75_histnames … 67` asks for a filter that does not exist (run 72's own note). `c75_rw_random 58965` printed
    nothing to its log; its JSON has a random world and the toy world run 390 days each with 0 errors and its
    readers of the wars and nations empty (the probe's selectors are stale), so I cite it for nothing but that.
  - `c75_chainBulk.out` was overwritten by a second, guarded start of the chain ("already running"); the chain's own
    log and results are whole.
- **Setup.**
  - Build: `vite build --outDir critic/c75_dist`, exit 0; starts: `npm run saves -- critic/c75_starts`, 54 years in
    599 s, exit 0, copied into the build (`critic/scripts/c75_build.sh`). HEAD's build served by `vite preview` on
    127.0.0.1:5377; run 74's build (`critic/c74_dist`, `6cc762ea`) on 5378 for the comparisons. Playwright Chromium
    on the GPU at 1600 × 900, 390 × 844, 844 × 390, 1280 × 720, and for the frames 2560 × 1440 and 3840 × 2160.
  - Chains: `c75_runNamed.sh` (`c75_jobsAll.txt`, 114 headless cases six at a time, then `landingFuzz --seeds 15
    --first 58101`), `c75_chainS.sh` (`c75_startsJobs.txt`, 40 cases from the built years), `c75_chainBulk.sh` (the
    bulk sets, Malta), `c75_suiteF.sh` (the whole page suite of run 72 on new seeds, about 95 probes),
    `c75_lane2.sh` (run 74's, 73's, 72's and 71's named page cases and the batch's own), `c75_pagesZ.sh` (semantic
    zoom on both builds), `c75_lane3.sh` to `c75_lane6.sh` (my new probes and the mended ones), `c75_chainPerf.sh`
    (performance, alone, last). New seed family: 58xxx.
  - New probes: `c75_markerPop.mjs` (does a T1 marker leap or pop while the wheel is turned through 1,200 m/px and
    while the game runs; both builds), `c75_bannerFrames.mjs` (the banners' strip second by second),
    `c75_monkey.mjs` (random clicks, drags, wheel, keys and buttons for five and ten minutes, desk and touch),
    `c75_resize.mjs` (nine window sizes in a running game), `c75_evAround.ts` (the events of two nations about a
    day), `c75_warAt100.ts` (wars that stand at ±100), `c75_interceptTold.ts` (which nuclear kinds reach History).
- **At the end:** my three preview servers (5377 HEAD's build, 5378 run 74's, 5376 run 73's for one comparison)
  stopped by the process ids that held their ports; no Playwright browser or probe of mine left; no worktree was
  made. A `vite preview` on port 5373 that was running before I began (started 06:27, not mine) was left. `git status`
  shows nothing new outside `critic/` (the eight untracked PNGs under `docs/evidence/7.132/` were there before).
- **Writes outside `critic/` by tools at their defaults:** `npm run sim` to `.cache/runs/*.json`; `landingFuzz` to
  `.cache/landingFuzz/`; `trackFronts` to `.cache/trackFronts_*.json`.
- **Memory:** 11 to 21 GB free throughout; six sims and up to five browsers at once, nothing reaped.

## Verdict

**No blocking issue.** Every rule checker is 0 broken on new seeds: 13 runs of five or ten years (diploInvariants 7,
worldInvariants 6; three of them over ten years), 9 free-year games, `landingFuzz` 0 of 90, `landingRows all` 0 of 115
cases; and on the last runs' seeds. The bulk landing sets (717 runs) are run 74's line for line: no rule broken but
`slowClick`, in the same four runs. No page error in any probe output that records them, among them 36 minutes of
random input at four sizes and three twelve-year watches. One page look of the builder's, `seaBattlesLook`, ends
"NOT SEEN" on 1 of its 97 battles; I traced it to the look's own list (the side not seen had been sunk whole within
the battle's one hour) and do not count it blocking: the case and the trace are under naval.

**Two scores move, against each other.**
- **Semantic zoom 7 → 8, at its bar.** R74-N1 is fixed on its own probe on both builds side by side: zooming 9,000 to
  4,000 m/px a hero's counter leaps 1, 0 and 1 times on HEAD where run 74's build has 38, 28 and 50 (seeds 56901,
  57905 and a new one, 58905); by the mouse's wheel 4, 0 and 4 against 43, 41 and 37. Run 74's bars for it are met:
  seven to the figure, and the eighth (36 leaps running where the bar said 34) at the count run 73's build itself
  gives today, 36. R125 and R131, built since, hold on their own measures.
- **UI/UX and polish 8 → 7, at its bar** (R75-N1). R130's order makes the banners change places as battles begin
  and end: with the game running at the speed it loads with (×5), the row changed 41, 25 and 29 times in a minute on
  HEAD and 6, 5 and 7 times on run 74's build (seeds 57901, 57903, 58901, the same days); the banner under a resting
  cursor became another war's 18, 0 and 19 times against 1, 0 and 0. Run 74's finding (wars with no battle on the row
  while fought ones were behind "+n") is fixed by it: 0 of 440 banner-days where 181 of 438.

**What a player will meet first (non-blocking):**
- **R75-N1:** the banners swap places every second or two while a war's battles come and go (above).
- **R75-N2:** a bomber stopped short with a warhead is told nowhere: the event has no row and no words. In an
  editor game with ten warheads given to Poland, History has "Poland decided on a nuclear strike near Berlin" on 14
  and on 15 February, one strike on the 15th, and the stockpile at 8: one warhead gone with no word of it (that it
  was a bomber stopped short is my inference; the event itself I did not read).
- **R75-N3:** a massing can be called off in the hour its nation goes to war with the target by another door
  (France on Germany, seed 58619, day 884): 1 of 21 call-offs on twelve seeds.
- **Just inside 1,200 m/px the markers are heaped as they were:** 21 pairs on one another of 58 at 1,150 m/px where
  1,300 has 6 of 53 (seed 58951, day 30): zooming in a notch makes the front harder to read. ADR-1110 is the user's
  decision and this is under "Design objections".

**The rule checkers on new seeds:**
- diploInvariants, 0 broken: 58001, 58005 and 58013 (heroes) (1938), 58003 (random diplomacy), 58007 (random world),
  five years; 58009 (heroes) and 58011 (random diplomacy, heroes), ten years. Runs 73's and 74's 33501 and 57001: 0
  (`critic/c75_diploinv_*.log`).
- worldInvariants, every rule set, 0 broken: 58051, 58053 and 58063 (heroes), 58055 (random world), 58057 (random
  diplomacy), five years; 58065 (heroes), ten years. 36009 and 57051: 0 (`critic/c75_wi_*.log`).
- `c75_free.ts`, 0 broken lines: 1942 58542, 1946 58546, 1951 58551, 1962 58562 (a year each), 1966 58566 (random
  diplomacy), 1975 58575 and 1983 58583 (two years), 1991 58611 (five years), all with heroes; 1946 51515 (random
  diplomacy, two years); runs 73's 51501 and 51505: 0 (`critic/c75_free_*_free.log`).
- `blocend 54611`: 0 bloc lines in five years. `heldfree 1946`: 0. `heldAtEnd` 54311 and 58311: 0. `clampend`: none
  at ±100. `repulse` 55071, 58073: 0. `landingRows all`: 115 cases, 20,321 hours, 0 broken
  (`critic/c75_lrows_all.log`).
- `landingFuzz --seeds 15 --first 58101`: **0 of 90** runs broken, `slowClick` included
  (`critic/c75_landingFuzz.log`).
- `workerDeterminism` 54059: `3f823012` on every arm (as run 74); 58059: `9880185a` on every arm
  (`critic/c75_wd_*.log`).
- The builder's measures of a war's first month (`tools/diag/warOpening.ts`, three years a seed): on new seeds
  58211, 58213, 58215, 155 wars, 62 with a border that ran a month: the attacker with no man within 300 km in 4
  (6.5 %; the user's bar 15 %, ADR-1094), the defender ahead in land at day 30 in 10 (16.1 %; the bar 15 %). On run
  74's seeds (57211…) HEAD has 7 and 9 of 57, and on run 73's (56211…) 9 and 9 of 71: to the war what those runs had
  (`critic/c75_warOpening*.json`, read with run 74's own file). Over the nine seeds the defender is ahead in 28 of
  190 (14.7 %): the share moves a point either side of the bar by the seeds, as run 74 found; no finding. Of the 68
  wars prepared by a massing on the new seeds, 0 began with no man near.

## Scores

### Map visuals and readability: 8 → **8**

**What I tested:** run 73's `look` at desk and phone size on its seeds and on two new ones (56901, 56903, 58901,
58903: the cue, the chrome, two fronts at five zooms, the world, Europe and Asia; 209 shots), run 73's `markers` case
on both builds and on a new seed and a phone, the heroes with a panel open, `tagsChrome` on two seeds, `stripe`, the
window at nine sizes.

**Evidence for 8:**
- **The fronts read at every tier:** a front by Salum on 1 July 1938 is a white-cored line, the taken land
  hatched, the arrows by side and two named divisions (an Italian and a colonial one) in contact at 250 m/px
  (`critic/shots/c75look_56901_1600x900_d180_f0_250m.png`), their men as countryballs with the line of contact at
  30 m/px (`…_f0_30m.png`). 0 page errors in the four looks.
- **R73-N5 is mended where the user chose (R125), on both builds** (`c75_markers.mjs 56951 … 10,20,30`, the Japanese
  front in China): pairs of markers on one another at 1,800 m/px 3, 10 and 12 of 48, 54 and 59 on HEAD; 24, 47 and 39
  of 60, 71 and 72 on run 74's build, to the figure what run 74 had. At 1,200: 1, 3, 7 against 5, 12, 17
  (`critic/c75_mk_head_desk.log`, `critic/c75_mk_c74build_desk.log`). The builder's own figures are these but one
  pair (it gives 9 on day 20). On a new seed (58951, days 30 and 60): 10 and 12 of 47 and 46 at 1,800 against 39 and
  40 of 59 and 56 (`critic/c75_mk_headn_desk.log`, `critic/c75_mk_c74n_desk.log`). The numbers that were under
  other boxes can be read: `critic/shots/c75mk_head_56951_1600x900_d30_1800m.png` beside
  `critic/shots/c75mk_c74build_56951_1600x900_d30_1800m.png`. On a phone the same front is stacks of ×17, ×11 and
  ×10 with their numbers clear (`critic/shots/c75phone_56903_390x844_d240_f0_1200m.png`).
- **A massing called off goes to its border from the ticker** (R129): the row of 12 November 1938, clicked, puts the
  camera on the Soviet-Romanian border at 938 m/px (`critic/c75_mo_58623.log`); a call-off whose border is gone
  (France on a Switzerland annexed that day; the event has no place) still lands in France
  (`critic/shots/c75mo_57613_tickerclick.png`).
- **The window resized in a running game:** nine sizes from 320 × 568 to 2560 × 1440 and back: the canvas the
  window's size each time, no page wider than the window, no chrome off the screen, 60 frames a second, 0 errors
  (`critic/c75_resize_58821.log`, `critic/shots/c75rs_58821_320x568.png`).
- `tagsChrome` 56973 and 58973: 9 and 0 tags, none under the chrome, no pair on one another; R72-N4's mended half
  holds (`critic/shots/c75hp_55929_12000_1relations.png`).

**Not 9:**
- **Inside 1,200 m/px the heap is as it was** (design objection, below): at 1,150 m/px 11, 16 (56951) and 21, 21
  (58951) pairs where 1,250 to 1,300 has 2, 6 and 6, 8 (`critic/c75_mk_headx_desk.log`,
  `critic/c75_mk_headn_desk.log`; `critic/shots/c75mp_head_56951_d30_live_1150.png`: the numbers about Jinan cannot
  be read).
- **One marker more covered than before:** on day 10 at 1,200 m/px the one pair left on HEAD has a marker over 60 %
  under another, where run 74's build, with 5 pairs, had none over 30 % (`critic/c75_mk_head_desk.log`,
  `critic/c75_mk_c74build_desk.log`; `critic/shots/c75mk_head_56951_1600x900_d10_1200m.png`).
- **Where two armies meet in a battle the far rule leaves a heap too:** 58951 on day 60 at 1,300 m/px, the fight west
  of Xingtai: "1…", "42.0k", "32.1", "126.0k" under other boxes (`critic/shots/c75mp_head_58951_d60_1300.png`). The
  boxes of two nations are moved 13 px at most.
- **Hero names on counters at 6,000 m/px** (R73-N4): T-42 still covers "293.9k", Roma a counter's number
  (`critic/shots/c75look_56901_1600x900_d400_2eur6000.png`). Left as it is by the user (ADR-1111): under "Design
  objections" now.
- On a phone at the world's zoom the heroes' names cover Europe whole at the first sight of a new game
  (`critic/shots/c75t2_1938_58203_390x844_2start.png`); "COMMUNIST CHINA" is still under its capital's flag.

### Diplomacy, war, alliance, puppet, revolt depth: 8 → **8**

**Evidence for 8:**
- **Every checker 0 broken** on new seeds (above), with heroes, random diplomacy and the random world.
- **R74-N2 fixed on its own probe (R129)** (`npx tsx critic/scripts/c75_massTold.ts 3 …`): on run 74's six seeds 114
  massings told, 97 followed by their war, 15 given up: 13 called off in a row of their own, and 2 that the probe
  lists "in silence" were at war with their target by then (the war came by another declaration). Run 74: 14 of
  112 given up with no word. The United Kingdom's massing on Mozambique of run 74's example (seed 56211) is now
  called off on day 855, 74 days after it was told. On six new seeds (58611 to 58621): 94 told, 83 followed, 11 given
  up, 8 called off, 3 at war with the target (`critic/c75_massTold_a.log`, `_b.log`, `_n1.log`, `_n2.log`).
- **None told twice in one massing; none told again within days of a call-off:** 0 "twice" in 208 rows; a pair told
  again after a call-off only in a ten-year world of three nations, 988 and 2,276 days later
  (`critic/c75_massTold_r3.log`).
- **The row on the page:** History's kind "Massing called off" (1 of 355 events in 320 days of 58623; 12 of 3,118 in
  twenty years of 32019), "my wars only" as Romania has both the massing and its call-off, the CSV and JSON have
  `MassingCalledOff` with both nations (`critic/c75_mo_58623.log`, `critic/shots/c75mo_58623_mine.png`,
  `critic/c75_mo_57613.log`).
- **A game saved with a massing told** loads, and after 120 days is at the unbroken game's hash with the same rows
  (58623: `00b09e5d` twice, 4 rows and 4; `critic/c75_massTold_sl.log`).
- **The last runs' same-seed measures are the same lines:** `farConquests 0` (both sets), `firstdecl` (53 and 59
  first declarations, none over 6,000 km), `piles` on fifteen seeds (none over 4:1), `pileSides 51`, `warlong 1942
  54601 god` and `1943 free`, `freewar` 1941, 1942, 1944, `clampend`, `blocend 54611`, `afterTrack 55601` (the
  leaders opposed 533 days) and `37601` (0) (`critic/c75_farc_0_*.log`, `critic/c75_firstdecl*.log`,
  `critic/c75_piles_*.log`, `critic/c75_warlong_*.log`, `critic/c75_atx_*.log`).
- **The invaded front:** `frontArrivals 58205 GER,POL 60`: on day 60 Poland has 22,000 men in 17 formations, 84 % of
  them at the German front, and holds 41 of Germany's cells; `58207 JAP,CHI`: 93 % of China's 703,000 at the
  Japanese front; `pragueFall` 58201 and 58203: Prague taken on days 13 and 14 (`critic/c75_fa_5820*.log`,
  `critic/c75_prague_5820*.log`).
- **The relations graph says what the state is:** `rg_relations` on three seeds, desk and phone: each kind of tie
  read back from the panel ("Austria is a puppet of Italy", "Germany and Lithuania are at truce, 420 days left"), 0
  errors (`critic/c75_rg_relations.*.log`).

**Not 9:**
- **R75-N3: called off, and at war with the target in the same hour.** Seed 58619: France's massing on Germany, told
  on day 794, runs out its ninety days; at hour 0 of day 884 the events are `MassingCalledOff FRA GER`, then
  Italy and Japan joining Germany's side of a war and France joining the other (`critic/c75_ev_58619_fra_ger.log`;
  "CALLED OFF BUT AT WAR at the day's end" in `critic/c75_massTold_n2.log`). SPEC has the row "if it then ends with no
  war on its target", which holds for that instant; a reader has "France has called off its massing on the border of
  Germany" and France at war with Germany under one date. 1 of the 21 call-offs of the twelve seeds.
- **As specified, and measured:** a massed war with no row before it (declared the first day its men are counted at
  the border) is still common: on the six new seeds 141 of 274 declarations had no massing the day before, and the
  massings that were told were told a median of 3 days ahead. Under "Design objections", as in run 74.
- **A war that stands at ±100:** Japan's war in China is at −100 for 738 days on end on seed 7019 (13.4 % of that
  game's war-days are at ±100) and at +100 for 321 on 58203 (`critic/c75_war100_*.log`). China and both Spains fight
  to the death (`data/scenarios/1938/nations.json`), as SPEC has it; nothing on the banner or its tooltip says so
  (the words are only in the refusal of a peace the player offers), so a watcher sees a decided score and a war that
  does not end.
- **Wars with no cell held by either side at day 30:** 20 of the 103 that ran a month on the new seeds; 11 of 82 on
  run 74's seeds on both commits (`critic/c75_warOpening.json`, `critic/c74_warOpening.json`).
- The bloc leaders at war after the track, as it was: 533 days of ten years on 55601, 303 on the track's own seed,
  0 on 37601 (`critic/c75_atx_*.log`).

### Emergent world dynamics: 8 → **8**

**Evidence for 8:**
- **Three twelve-year watches on the page** (58941 with heroes, 58943 and 58945 plain; 1938 to 1950): wars on the row
  at every year's end and the map redrawn each time: Italy's green over North Africa and Arabia by 1943 on 58941,
  Germany and Italy at war by 1948 (`critic/shots/c75lwhon_58941_y05_world.png`, `…_y10_world.png`); "Poland +7 ⚔ Netherlands
  +12", "United Kingdom +7 ⚔ Japan +12", "Brazil +3 ⚔ Argentina +1" on 58945; nations 100 → 76, 98 → 81, 95 → 75 by
  way of rises (87, 91, 88: nations revived and born); 0 page errors (`critic/c75_lwhon_58941.json`,
  `critic/c75_lwplain_58943.json`, `critic/c75_lwplain2_58945.json`).
- **A thing that looked like a broken rule and is not:** on 58943 "Communist China was destroyed" (26 December 1945)
  and "Japan made peace with Communist China" (10 December 1948). Traced headless: `NationRevived CCP` on day 3,834,
  its capital taken on day 3,965, peace and a puppet on day 3,996 (`critic/c75_ev_58943_ccp.log`).
- **Twenty years headless:** 7019 and 32019 plain (80 and 84 nations at the end), 7019 and a new 58019 with heroes
  (72 and 86 nations; 12 and 9 heroes alive; 4 detonations in 7019's last year), 58021 with heroes for twelve
  (`critic/c75_seed*_save.log`, `critic/c75_hero_*.log`). 7019 with heroes is run 74's game year for year (the
  same nations, formations, declarations, peaces, capitals and detonations in each of twenty lines).
- **Small worlds as run 74 left them** (`fewNationWars`, ten years): two nations 55421: a war in 5 of 6, the first
  on days 104, 20, 2,414, 181, 118 (run 74's lines); 54421: 4 of 6; three nations 53401: 6 of 6; 51401: 6 of 6;
  55401: 4 of 6. New families: two nations 58421: 5 of 6 (days 1,251, 124, 2,231, 139, 47); three nations 58401: 6 of
  6. Sixty nations (55431 to 55433): 91, 87, 56 wars (`critic/c75_few*.log`).
- **The leaders' order changes:** `topArea 58097`, 25 years: the first three by land changed 4 times
  (`critic/c75_toparea_58097.log`). After the track, a year: 67 and 59 wars declared on two seeds
  (`critic/c75_track_*.log`).

**Not 9:**
- 55424, 54425, 54426 and a new 58422 (two nations), 55401, 55404 and 57404 (three) have no war in ten years.
- Brazil's massing on Colombia is given up "late" on each of the nine seeds of `warOpening`, and the United
  Kingdom's on Angola on five: the same false alarms game after game (as decided, ADR-1089).

### God Mode: 8 → **8**

**Evidence for 8:**
- **Every tool, told:** `q_god_tools 58919`: revolt ("Free Greater Poland Voivodeship was set up on land of
  Poland"), spawn, breakthrough, territory, found a city, raze ("4 January 1938 Prague in Czechoslovakia was razed"),
  each in the ticker (`critic/c75_q_god_tools.58919.log`); `a_god_nuke 58917`: hydrogen and atomic bombs with the
  alert, the cloud and the charts, 0 errors (`critic/c75_a_58917.json`); `kwhist 58951`: God's breakthrough in
  History and both exports (`critic/c75_kwhist.58951.log`).
- **Undo:** `undo2 41211`, `undo2y 51231` and `53231`: nuke, revolt, nation, city and raze each undone
  (`critic/c75_undo2*.log`).
- **God in the replay:** `godpeace 1942 JAP` and `GER`: "Japan made peace with United States", "Germany made peace
  with Soviet Union", with "History's course ended at your first intervention"; `god42 1942 replay`: the note that
  any God act ends the replay; the phone's God tab; `h_god`, `h_interv` at both sizes: 0 errors
  (`critic/c75_godpeace.*.log`, `critic/c75_god42.*.log`, `critic/c75_h_godtab.*.log`).
- **Under random input:** God Mode's buttons and map tools were among the 5,900 buttons the monkeys pressed (a bomb
  armed and the map clicked, Undo, the nation panel's God tab: `critic/shots/c75mky_58807_1280x720_241.png`) with no
  page error (stability).

**Not 9:** a God peace in the replay decides the war by the year it is made in (run 71's observation, not measured
again); the nuke's Undo was not compared pixel by pixel this run (run 74: 0 px).

### Editor and scenarios: 8 → **8**

**Evidence for 8:**
- **An edited scenario, played to the end of its story** (`g_editor 58921`, whole for the first time since run 72):
  fleets placed for Germany and Britain, ten warheads given to Poland, a refusal read, the scenario exported, loaded
  from the title, wars declared: a sea battle on day 1, the alert "Poland struck Germany with an atomic bomb near
  Berlin: 334,000 civilians killed; 295 men lost" on 15 February, "Poland lost its last means to deliver its
  warheads: Germany took its airbase near Warsaw" on the 26th, Poland's capital taken, 0 errors
  (`critic/c75_g_58921.json`, `critic/shots/c75g_58921_15_nuke_alert.png`, `critic/shots/c75g_58921_03_refusal.png`).
- **Paint, undo, redo, export, load:** `x_editor 32443`: French cells painted German, undone and redone (owners
  [19,19,19] ↔ [1,1,1]), exported and loaded from the title as painted; `32441`: with a scenario file
  chosen the title's own Start is disabled and says "A scenario file is chosen: start it or cancel it under Scenario
  file" (`critic/c75_x_editor.*.log`); bad files refused with the Start gone (`critic/c75_x_badfiles.log`); the
  standoff file loads in 4.6 s (`critic/c75_os2_scen.*.log`).
- **The title's forms:** heroes "On", look "balls", 14 heroes in a 1938 game and 12 in a free 1946, 1975 or 1991, at
  desk and phone, 0 errors (`critic/c75_title2.*.log`); the free cards of 1943, 1975, 1983 and 1991
  (`critic/c75_x_replaycard.*.log`); a random large world for 90 days at 58.7 to 60 fps
  (`critic/c75_x_play.rnd_large_random_large_90.log`); a world of three nations (`critic/c75_x_few.58403_3_3.log`).
- **The replay's years:** 54 starts built from HEAD; `capsurvey`: 2 of 154 nations seated away from their capital in
  1975, the timeline's two; `histnames`: "29 October 1941 A major battle began near Kalinin" in the 1975 and 1991
  replays; `ev91`: Kuwait in August 1990, the Soviet Union's end, the capitals of 1991 (`critic/c75_capsurvey.log`,
  `critic/c75_histnames.*.log`, `critic/c75_ev91_kuwait.log`).

**Not 9:** R75-N2 was met here (the editor's Poland has bombers and no missiles); a refused order still names a fleet
by nothing.

### Stats and history: 8 → **8**

**Evidence for 8:**
- **History of a twenty-year world, whole** (`hist 32019`, the probe mended): 3,118 events, each of 30 kinds
  filtered in 154 to 172 ms, "Massing called off" 12, "Army massing on a border" 52, "Nuclear strike" 5; the charts
  opened from the ranking (`critic/c75_hist.32019_*.log`); the heroes' world of 7019: 3,458 events, "Hero lost" 150
  and "Hero back" 150 (`critic/c75_hist.7019_*.log`).
- **Export:** 3,118 of 3,118 events to CSV (3,120 lines) and JSON (`critic/c75_dl_32019.json`).
- **Ranking and charts:** `charts 58995`: the ranking by owned land, a chart of five nations, ten measures to choose
  (`critic/c75_charts_58995.log`, `critic/shots/c75ch_58995_2charts.png`).
- **The replay's History:** blank "Next" lines 0 of 1,089 (`critic/c75_h_blank.120.log`); the Greek civil war's rows
  (`critic/c75_h_next.1030_96_greece.log`); "joined" rows of 540 days (`critic/c75_histgrep.*.log`).

**Not 9:**
- **R75-N2:** of the six nuclear kinds, `NukeLaunched`, `NukeIntercepted` and `NukeDetonated` are in neither History
  nor the ticker and have no words (`critic/c75_interceptTold.log`); a burst is told by `NukeCasualties`, a bomber
  stopped short by nothing.
- A row in History cannot be clicked to its place (only the ticker's can).

### UI/UX and polish: 8 → **7**

**Why it moves: R75-N1, the same seeds and days on both builds, run at the same time**
(`BASE=<build> node critic/scripts/c75_bannerFlip.mjs <seed> <day> <tag> 60`: plain 1938 with heroes, Resume at the
speed as loaded, the row read every 100 ms for a minute, which is 60 days).

| | run 74's build (`6cc762ea`) | HEAD |
|---|---|---|
| 57901, day 150: the row changed | 6 times (its order alone 1) | **41** (2) |
| … a banner held its place under 2 s | 1 time | **73** |
| … the banner under a resting cursor became another war's | 1 time | **18** |
| 57903, day 120: the row changed | 5 | **25** |
| … under 2 s | 1 | **30** |
| 58901, day 200 (a new seed): the row changed | 7 (2) | **29** (16) |
| … under 2 s; under the cursor | 2; 0 | **33**; **19** |
| 57901 on a phone (two banners): the row changed | 4 | **36** |
| … under the finger | 1 | **22** |
| 57901, Japan played: the row changed | 1 | **20** |
| 58901, Germany played | not run | 25 (under the cursor 16) |

- **What it looks like:** twelve pictures a second apart (`critic/shots/c75bfr_head_58901_00.png` to `…_11.png`,
  `critic/c75_bfr_head_58901.log`): "Italy +1 ⚔ Nationalist Spain +1" and "Soviet Union +1 ⚔ Japan +4" change places
  at seconds 1, 3 and 9. On 58901 the last five seconds of the minute are one pair swapping each second
  (`critic/c75_bf_head_58901.log`: "15b 18b 11q → 18b 15q 11q → 15b 18b 11q", `b` a war with a battle).
- **The cause, as far as the code shows it:** `WarBanners.tsx` sorts by `battle` before the sides' men, and a war's
  `battle` goes on and off by the hour. ADR-1109 says "a banner's place can change as a battle begins and ends" and
  measured it by the day (the order alone on 7 days of 149); by the second, at ×5, it is a row that does not hold
  still, and a click meant for one war can land on another.
- **What R130 was for is reached:** `bannerRank` 57901: 0 of 440 banner-days of a war with no battle while a fought
  one was behind "+n" (run 74: 181 of 438); 57903: 0 of 440 (111); a new 58901 and a phone on 58903: 0
  (`critic/c75_br_*.log`). Japan's war in China is on the row on every sampled day.

**What holds it at 7** (each checked in this run):
- **R73-N1 holds with R130:** a played Germany in 1942 has wars of its own on all three banners at every sample of
  150 days (from day 120 the third is the Bulgarian war it joined, which has a battle; the war on the United States,
  quiet at 0, is behind "+8" and first of the three when opened); taken and released on 57901, 57903 and 58901: the
  taken nation's war first, the row as before after (`critic/c75_bo_1942_GER_after4242.log`, `critic/c75_br_*.log`).
- **The whole page suite** at 1600 × 900, 390 × 844 and 844 × 390: the phone's layout 0 clipped and 0 off-screen in
  10 states (`critic/c75_p_phone..log`); orders by mouse 7 of 7 to Warsaw, 6 closer after ten days
  (`critic/c75_x_mouse.58421_10_1600_900.log`); keys; the first cue once (`cueAfterResume` 0, `cueSecondGame` 0 at
  both sizes on four seeds); Continue at the unbroken game's hash (`critic/c75_x_continue.58415_40_GER_60.log`); the
  peace button enabled at +25 and refused with its reason at +0, at two sizes (`critic/c75_peacebtn.*.log`,
  `critic/shots/c75pb_58217_GER_POL_844x390_enabled_d20.png`); ten wars' buttons in a phone's panel
  (`critic/c75_manywars.*.log`); a landing's bar, box, cancel and hold (`critic/c75_lbar.*.log`,
  `critic/c75_turnback.*.log`); the world built in 4.4 to 5.3 s to its statistics (`critic/c75_x_building.*.log`).
- **Random input:** 36 minutes of it at 1600 × 900, 1280 × 720, 390 × 844 and 844 × 390 (touch): 15,500 acts, 0
  page errors, the game running and drawing at the end of each (stability).
- 0 page errors in every probe of this run.

**Not 8:** R75-N1. **Also not 9:** while the banners are opened on a phone there is no ticker; the first cue on a
phone says "Scroll to zoom" and "Click"; the button to the title in Settings leaves at once, with no question (the
game is autosaved and "Continue" brings it back; a monkey found it within 40 s).

**What an 8 needs** (the bar is 7 and is met; this is the way back): `node critic/scripts/c75_bannerFlip.mjs 57901 150
head 60` and `… 58901 200 head 60` with "the row changed" at 10 or fewer and "the banner under a resting cursor
changed" at 2 or fewer (run 74's build: 6, 7 and 1, 0), with `c75_bannerRank.mjs 57901 150` still under 44 quiet
banner-days of 440 (a tenth).

### Performance: 8 → **8**

Run alone, last, after every other chain had ended, pinned to the performance cores
(`critic/scripts/c75_chainPerf.sh`, `critic/c75_pf.status`: 08:39 to 09:05):
- **Tick, seed 99, five years:** 1.858 ms mean (run 74: 1.890), year 1 at `a5dbeae6`, the pin
  (`critic/c75_tick99.log`). With heroes: 1.738 ms (run 74: 1.765) (`critic/c75_tick99h.log`). The same.
- **Frames, HEAD's 7019 year-20 world** (`c75_pf_lookfps`): 59.2 to 60.2 fps at 3,000, 1,200, 600, 120 and 30 m/px in
  both looks and panning; the worst frames 105 and 104 ms, once each (run 74: 155, 108, 103)
  (`critic/c75_pf_lookfps.log`). The heroes' year-20 world of 7019: 59.2 to 60.2 fps, the worst 115 ms
  (`critic/c75_pf_lookfps_h.log`).
- **A large screen (new):** the same world and probe at 2560 × 1440: 59.0 to 60.2 fps, the worst frame 111 ms; at
  3840 × 2160: 58.9 to 60.3 fps, the worst 116 ms (`critic/c75_pf_lookfps_qhd.log`, `critic/c75_pf_lookfps_4k.log`;
  `critic/shots/c75pf_7019_4k_1200m.png` is 3840 × 2160). The frame rate does not fall with the pixels.
- **`tools/diag/lookFps.ts` on the same world:** 59.6 to 60 forced frames/s at every tier, p95 17.8 to 18.1 ms, a
  draw 0.8 to 2.7 ms (the longest 5.1) (`critic/c75_lookfps.log`).
- **Twelve years on the page, alone** (58941, heroes, 1938 to 1950): 59.8 to 60 fps every year, the longest gap
  83 ms, none over half a second, a year in 16 to 29 s (`critic/c75_lw_58941_alone.log`). The three twelve-year
  watches run beside the other chains: 59.6 to 60 fps, the longest gap 150 ms, none over half a second.
- **Touch and the individual tier:** 59.6 and 59.9 fps without and with a selection
  (`critic/c75_tm_touch.alone.log`); `x_indfps 32111`: 59.6 to 60 fps at 28, 18 and 12 m/px, the worst frame 67 ms
  (`critic/c75_xi.log`).
- **R125's tighter rule and R131's lifts cost nothing seen** (not run alone: beside the other chains, the two
  builds at the same time, four scenes of four measures each): with the wheel turned through T1 and the game
  running the frames are 16.6 to 17.0 ms at the median and 18.6 to 21.8 ms at the 95th centile on HEAD, 16.6 to
  17.9 and 18.4 to 25.2 on run 74's build (`critic/c75_mp_*.log`).
- **Not 9:** one frame of 101 to 116 ms in each measure where the look is changed to Classic at 1,200 and at 120 m/px,
  at every screen size; a tick of 399 ms in the first year of the heroes game and the first year's mean at 2.7 to
  2.9 ms where the later years have 1.1 to 1.8.

### Stability: 8 → **8**

**Evidence for 8:**
- **Random input** (`c75_monkey.mjs`, new: clicks, right clicks, drags, wheel, keys, and every shown button, tab,
  select and checkbox, God Mode and the editor among them): 58803 (1600 × 900, 5 min), 58807 (1280 × 720, 5 min),
  58815 (1600 × 900, 10 min), 58811 (390 × 844 touch, 5 min), 58813 and 58809 (844 × 390 touch, 5 and 4 min), 58801
  (2 min): 15,500 acts in all, 5,900 of them on buttons, **0 page errors, the tick moving and 269 to 301 frames
  drawn in the 5 s after each**; in the four run after every act had a timeout of 8 s (58807, 58811, 58813, 58815:
  10,400 acts) none timed out (`critic/c75_monkey_*.log`, `critic/c75_mky_*.json`). One earlier run of
  58807 is disclosed above; 58805 left the game by the Settings panel's button to the title after 40 s (as built: the
  game is autosaved).
- **Save and load:** the page's save loaded twice, the same hash each time and the same after 200 days more
  (`critic/c75_saveload_page.58937_200.log`); a 1942 God game headless, `ae20f897` on both arms after 30 days
  (`critic/c75_saveload_1942god.log`); a game saved with a massing told (diplomacy); Continue (UI).
- **Old saves:** run 74's 7019 year-20 save loads on HEAD and runs a year (`75b9c02a`, 78 nations;
  `critic/c75_loadold_7019.log`); run 74's 1975 replay
  start on HEAD runs 30 days (`critic/c75_oldsave_1975.log`).
- **Determinism:** `workerDeterminism` 54059 and 58059, every arm the same.
- **Long runs:** twenty years headless four times, twelve years on the page three times (0 errors, 0 gaps over half a
  second), ten years of three checker runs.
- **The window resized nine times in a running game:** 0 errors (map visuals).
- 0 page errors in the 225 probe outputs that record them (`node critic/scripts/c75_errscan.mjs`: the six it lists
  are the probes' own arguments, above).

**Not 9:** a tick of 0.35 to 1.6 s once in a twenty-year heroes game (`max 846.9`, `1633.0` ms in
`critic/c75_hero_*.log`, run beside five other sims).

### Semantic zoom to unit level: 7 → **8**

**Why it moves: run 74's own probe and bars, on both builds at the same time** (`node critic/scripts/c75_heroPop.mjs
<seed> <day> <tag>`, `BASE` HEAD's build or run 74's; a leap is a hero's counter moved over 12 px against its own
place between two frames).

| | run 74's build (`6cc762ea`) | HEAD | run 74's bar |
|---|---|---|---|
| 56901, day 400, zoom 9,000 → 4,000 m/px in 120 steps | 38 leaps | **1** | 2 or fewer |
| 57905, day 200, the same zoom | 28 | **0** | 2 or fewer |
| 58905, day 300 (a new seed), the same | 50 | **1** | |
| 56901, running at ×5 for 20 s | 78 | **36** (run 73's build today: 36) | 34 or fewer |
| 57905, the same | 12 | **4** | 4 or fewer |
| 58905, the same | 87 | **17** | |
| 56901, day 430, the wheel, nine notches | 43 | **4** | 4 or fewer |
| 57905, day 230, the wheel | 41 | **0** | 2 or fewer |
| 58905, day 330, the wheel | 37 | **4** | |
| 56901 and 57905, the camera still, 120 steps of 6 h | 19, 49 | **6, 12** | (run 73's build: 6, 12) |
| panning 480 px (three seeds) | 2, 3, 1 | 2, 3, 1 | |

- Run 74's build gives run 74's own figures again (38, 28, 77 → 78, 41 → 43, 36 → 41), so the two columns are one
  measure. Seven of the eight bars are met to the figure. The eighth, the running count on 56901, is 36 where the
  bar is 34: that bar was run 73's build's count in run 74, and run 73's build run again here gives 36 too, the
  same heroes the same number of times (Bismarck 10, Roma 18, Maus 8), as does HEAD run alone a second time.
  `counters.ts` is run 73's file again (`git diff a9814c43 HEAD -- src/render/units/counters.ts` is empty). So the
  bar is met in what it asked: no more leaps than before R124 (`critic/c75_hp_*.log`, `critic/c75_hpw_*.log`,
  `critic/c75_hp_c73build_56901.log`, `critic/c75_hp_headalone_56901.log`).
- **R73-N5 no worse, which was the last bar: much better** (map visuals: 3, 10, 12 pairs at 1,800 m/px where 24, 47,
  39).
- **R131 on its own measure, both builds** (`c75_markerPop.mjs`, new: every drawn frame of the wheel turned from
  2,000 to 655 m/px and back, then the game running 15 s at 1,800 and at 1,150 m/px; a leap is a marker moved over
  12 px against its formation's place in one frame):

  | scene | run 74's build | HEAD |
  |---|---|---|
  | 56951, day 30, China: the wheel | 6 leaps, a hero's marker up to 32 px a frame | **0**, 6 px |
  | … running at 1,800; at 1,150 m/px | 11; 14 leaps, up to 185 px | **0; 0**, 5 px |
  | 56901, day 400, Europe: the wheel; running | 5; 0 and 2, up to 145 px | **0; 0**, 5 px |
  | 58905, day 300, Europe: the wheel; running | 1; 11 and 0, up to 208 px | **0; 0**, 6 px |
  | 58951, day 60, China (no hero in the view) | 0 | 0 |

  The builder's claim (no move over 6 px a frame) holds: the largest is 6.0 (`critic/c75_mp_*.log`).
- **R125's change of rule at 1,200 m/px is not seen as a pop:** gliding 1,300 → 1,100 m/px in 90 frames, four
  scenes: 0 leaps, 0 markers whose opacity jumped, the largest move of a box in a frame 3.3 px; the frames 16.6 ms at
  the median and 18.4 to 18.8 at the 95th centile on both builds, so the tighter rule costs nothing seen
  (`critic/c75_mp_head_*.log` against `critic/c75_mp_c74build_*.log`).
- **Every tier is there:** `z_zoom 58911`, 18 steps from 6,000 to 3 m/px on one division: units drawn from
  1,573 m/px (8,504) to 64 at 3 m/px, the men from 28 m/px (10,710), the followed division on screen at the end
  (`critic/c75_z_zoom.58911.log`); an armoured division's fight at 250, 80, 25 and 10 m/px
  (`critic/shots/c75c_58915_arm_0025m.png`); the heroes at every tier from the world's zoom to 2,500 m/px at desk and phone
  size (`critic/c75_hero.*.log`); the phone's tap on a counter opens its panel with its elements
  (`critic/c75_phz.58933_40.log`); Normandy on 5 June 1944 from 3,000 to 12 m/px (`critic/c75_h_zoom..log`).

**Not 9:** the heap inside 1,200 m/px and in a two-nation battle (map visuals); hero names on counters at 6,000
m/px; a hero's counter still leaps now and then with the camera still as the armies under it move (6 and 12 times
in 30 days of the game, as before R124).

### Naval warfare: 8 → **8**

**Evidence for 8:**
- **landingFuzz `--seeds 15 --first 58101`: 0 of 90** broken, `slowClick` included: this run's rate is 0 of 90.
- **Run 61's bulk sets (due), against run 74's, file by file** (`critic/scripts/c75_bulkcmp.sh`): the 396 named
  landing setups, the 153 stuck returns and the 168 next voyages: **717 of 717 runs the same line for line**. The
  same four runs break a rule, each `slowClick`: 30041 3517 g1 of the setups; 30041, 31157 and 31175 3517 g1 of the
  next voyages (`critic/c75_liab_named_cmp.txt`, `critic/c75_sr_cmp.txt`, `critic/c75_nv_cmp.txt`).
- **Malta's 18:** 12 thrown back near Catania and 6 broken off near Palermo, row for row as run 74
  (`critic/c75_malta.log`). On a new seed a landing held up at sea under British attack
  (`critic/shots/c75lh_ita_malta_58905_h90_250m.png`: "Valletta from Rome: at sea: under attack by United Kingdom,
  held up") goes on and ends "over: 2 landed" (`critic/c75_lhold.58905_*.log`); who holds Valletta after it I did
  not read.
- **A sea battle as a player finds it** (`seaclick 58061`, mended): the ticker's "⚓ Sea battle: Japan against Siam"
  on 6 January 1938, clicked, puts the camera on a cruiser squadron and a submarine flotilla in the Gulf of Thailand
  inside the battle's ring (`critic/shots/c75sc_58061_click.png`, `critic/c75_sc_58061.json`).
- **Every sea battle looked at on the page at its camera** (`tools/diag/seaBattlesLook.ts`): 39061: 65 of 65 seen
  with both sides' ships in the view (3 listed with one side alone), 0 page errors; 58061: 31 of 32 (below)
  (`critic/c75_sbl_39061.log`, `critic/c75_sbl_58061.log`).
- **Sea battles headless:** 58061: 32 in three years and 18 sinkings by carriers' wings; 39061: 65 and 80; a random
  world 58067: 69 in two years (`critic/c75_sb_*.log`). In twenty years of 7019 with heroes History has 319 "Sea
  battle" rows and 168 "Convoys raided".
- **Landings on the page, new seeds:** Britain's three divisions ashore at Bremerhaven ("over: 3 landed"), Japan's at
  Shanghai, a German landing whose transports were sunk told as such, a cancelled one back at Tokyo with "the AI
  commands them again" (`critic/c75_lland.*.log`, `critic/c75_turnback.*.log`); the next voyage's words
  (`critic/c75_nvpage.58211_*.log`).
- **In the editor's game** a sea battle on the first day and Britain's 39 formations afloat down to 25 in 120 days
  (`critic/c75_g_58921.json`).

**Not 9:**
- **`seaBattlesLook` ends with "NOT SEEN" once (exit 1) on 58061:** t5712, Germany against Sweden in the Baltic, a
  battle begun and over in one hour: only Sweden's 23 ships are in the view
  (`critic/seaBattles_58061_shots/t5712_GER_SWE.png`). Traced: the German fleet that fought (1204, 3 cells off) is
  gone at the hour's end, sunk whole (Germany lost 4 ships), and the two German fleets the list gives for the
  battle (1199 and 1203) are others, 16 and 6 cells away, taken up by the list's search of 16 cells about a one-hour
  battle (`critic/c75_fleetsAt_58061_5712.log`, `npx tsx critic/scripts/c75_fleetsAt.ts 58061 5712 1113,239.5`).
  Nothing German was left there to draw, so I count it the look's own listing and not a battle hidden from the
  player; it is not one of the rule checkers, and it is not blocking. It is new all the same: run 72 had 43 of 43.
- The named `slowClick` cases as run 74 (30041: 15.4 days against 5.9; 51101 and 53125 break it, 27037 does not;
  `critic/c75_li_*.log`); Malta thrown back or broken off in all 18 of its own runs.

### Tanks: 8 → **8**

**Evidence for 8:**
- `breakthrough 58979`: 27 formations engaged by day 7 (run 74's 57979: 27); `kw_breakthrough 58923`: 47 by day 7
  with the corridor told (`critic/c75_k_breakthrough.58979.log`, `critic/c75_kw_breakthrough.58923.log`).
- **An armoured division's fight at every tier:** `c_battle 58915` and `7781`: Armoured division 40 against a Polish
  infantry division on 10 January 1938 at 3,000, 900, 250, 80, 25 and 10 m/px, the line of contact, the fire and the
  Maus beside it (`critic/shots/c75c_58915_arm_0025m.png`, `critic/c75_c_battle.*.log`).
- **The land heroes:** `tools/diag/heroCeiling.ts` on ten new seeds × 3 years (58181 to 58190): 100 of 144 lives at
  or above their nation's top-decile regular, 0.69 (run 72: 79 of 127, 0.62; ADR-795 closed the AT at 0.64)
  (`critic/c75_heroCeiling3_*.log`); `heroBattle 58081`: the P.100 in battle 76 of 677 days at war
  (`critic/c75_heroBattle_58081.log`).
- **D-Day and Stalingrad on the page:** 5 June 1944 at 600 m/px with the German divisions about Caen and "Next, 5
  June 1944: D-Day: the American divisions at Omaha and Utah" (`critic/shots/c75st_normandyD_600.png`); `dday`: on 26
  July the Allies 233,000 men in Normandy against Germany's 22,000 (`critic/c75_dday_1938.log`); "The German Fourth
  Panzer Army at Stalingrad" on 24 October 1942 (`critic/c75_x_stage.stalin_*.log`).

**Not 9:** on 7019 the P.100 is in battle 42 of 1,065 days at war (`critic/c75_heroBattle_7019.log`): a hero tank
seldom seen fighting on that seed.

### Aircraft: 8 → **8**

**Evidence for 8:**
- `pl_planes 58925`: the wings' marks at every tier in both looks: 42 at 3,000 m/px, 30 at 1,200, 12 at 600, 7 at
  250, down to 1 at 25 (`critic/c75_pl_planes.58925_GER_POL_5377.log`,
  `critic/shots/c75pl_58925_GER_POL_5377_0250m_balls.png`).
- `w_wing 58927`: a followed wing flying with its mark in 56 of 56 samples at 3,000 m/px (median 0 px from it, the
  90th centile 67), and 0 px from it with another panel open (`critic/c75_w_wing.58927.log`).
- **The air war is told and counted:** the month's rows in every watch ("Japan's air force struck China over the past
  month: 9,637 men, guns and vehicles lost"), 660 "Air raids" and 256 "Air war" rows in twenty years of 32019; a
  nation's panel has its aircraft, losses and men lost to strikes
  (`critic/shots/c75mky_58807_1280x720_241.png`: Nationalist Spain, 63 aircraft, 57 lost, 799 lost to air strikes).
- **A carrier strike in the ticker** in every game watched ("⚓ Carrier strike ashore: Japan on China ×3").

**Not 9:** a bomber shot down with a warhead is not told (R75-N2); the air war is read from monthly rows and marks,
with no fight of wings to watch at the close tiers.

### AI nuclear use: 8 → **8**

**Evidence for 8:**
- **Three AI strikes on the page, with the pause, the alert and "Go to":** on 58505's year-13 world "Poland struck
  Switzerland with an atomic bomb near Krasino: 2,000 civilians killed; 33,566 men and 120 guns lost" (15 January
  1951) and "Poland struck United Kingdom with an atomic bomb near Århus: 4,000 civilians killed; 142,068 men, 523
  guns and 612 tanks lost" (16 March 1951), the scorch at Århus under the British markers
  (`critic/c75_an_58505y13.json`, `critic/shots/c75an_58505y13_1_z00600.png`); on 7019's heroes world "United Kingdom
  struck United States with an atomic bomb near Mezen: 0 civilians killed; 100,881 men and 384 guns lost" (19 July
  1958) (`critic/c75_an_h7019y20.json`). And the editor's Poland on Berlin (editor).
- **Counts over 22 years** (`nukecount`): new seeds 58501: 37 launches, 58503: 17, 58507: 0; 55501: 25, 55503: 2 (run
  74's line), 55507: 0; every launch a burst (`critic/c75_nc_*.log`); `nukeIntercepts 53501`: 2 launches, both
  missiles, as run 74.
- **Restraint is told:** "Poland decided on a nuclear strike near Berlin, after long hesitation"; "lost its last
  means to deliver its warheads" when the airbase fell.

**Not 9:**
- **R75-N2: a warhead's bomber stopped short is told nowhere.** `EventKind.NukeIntercepted` is emitted by
  `src/sim/systems/nuclear.ts` and is in no list of History, the ticker or the strings
  (`critic/c75_interceptTold.log`): that much is read from the code and the lists. The instance is inferred: in
  the editor's game there are two decisions on Berlin a day apart, one strike, and the stockpile 10 → 8
  (`critic/c75_g_editor.58921.rerun2.log`, "nuclear rows by kind"; `critic/c75_g_58921.json`, `polWarheads`); a
  launch takes a warhead and its arrival is a burst or `NukeIntercepted`, but I did not read the event, and SPEC
  also lets a nation scrap warheads it cannot pay for, untold. In plain games it is rare (0 of 81 launches stopped on six seeds: the
  AI's bombs come late, by missile); it is what a player who gives an early nation bombs in the editor or God Mode
  will meet.
- Plain 7019 and 32019 year-20 worlds: no strike in 400 days of the page (as run 72); strikes come in some years of
  some seeds (0, 0, 2, 17, 25, 37 in 22 years).

## Blocking issues

None.

## Non-blocking issues (prioritised)

1. **R75-N1 (UI; R130): the banners change places by the second while the game runs.**
   - **The case:** `BASE=<HEAD's build> node critic/scripts/c75_bannerFlip.mjs 57901 150 head 60`: the row changed 41
     times in a minute (run 74's build: 6), a banner held its place under 2 s 73 times (1), the banner under a
     resting cursor changed 18 times (1); `… 58901 200 head 60`: 29 (7), 33 (2), 19 (0).
   - **Seen fixed when** both print "the row changed" at 10 or fewer and "the banner under a resting cursor changed"
     at 2 or fewer, and `c75_bannerRank.mjs 57901 150` stays under 44 quiet banner-days (a battle of the last days,
     not of the hour; or a place kept for some seconds once taken).
2. **R75-N2 (AI nukes, stats, aircraft): a bomber stopped short with a warhead is told nowhere.**
   `npx tsx critic/scripts/c75_interceptTold.ts`: `NukeIntercepted` in History's kinds false, in the ticker's false,
   strings 0. The instance (inferred): `EXTRA='&heroes=on' node critic/scripts/c75_g_editor.mjs 58921`: "Nuclear
   decision" 2 rows, "Nuclear strike" 1, warheads 10 → 8. **Seen fixed when** `c75_interceptTold.ts` prints the kind
   in History's kinds and the ticker's with strings over 0 (a row that says who, where, and that the bomber was
   stopped).
3. **R75-N3 (diplomacy; R129): "called off" and at war with the target under one date.**
   `npx tsx critic/scripts/c75_massTold.ts 3 58617 58619 58621`: "d884 FRA>GER CALLED OFF BUT AT WAR at the day's
   end"; `npx tsx critic/scripts/c75_evAround.ts 58619 880 886 FRA,GER`. **Seen fixed when** that line is on no seed
   of the twelve (the call-off held to the hour's end, or not told when its nation is at war with the target by
   then).
4. **Small worlds:** 55424, 54425, 54426, 58422 (two nations) and 55401, 55404, 57404 (three) have no war in ten
   years.
5. **Wars with no cell held by either side at day 30:** 20 of 103 (`tools/diag/warOpening.ts … 58211 58213 58215`).
6. **A war at ±100 with nothing saying why it goes on:** `npx tsx critic/scripts/c75_warAt100.ts 7019 5 off`: Japan
   and China at −100 for 738 days on end. **Seen fixed when** the banner or its tooltip says a side fights to the
   death.
7. **`slowClick` (ADR-914):** this run's rate on new seeds 0 of 90; the named cases and the bulk sets' four runs as
   run 74.
8. **`seaBattlesLook` exits 1 on 58061** (`npx tsx tools/diag/seaBattles.ts 58061 scenario --years 3 --out f.json`,
   then `npx tsx tools/diag/seaBattlesLook.ts f.json`): t5712 GER v SWE "NOT SEEN"; the side not seen was sunk whole
   in the battle's one hour and the list names two bystanders for it (naval). **Seen fixed when** that run ends
   32 of 32, or 31 seen and 1 "no fleet to see".
9. **Small things:** on a phone the heroes' names over Europe at the world's zoom; no ticker while the banners are
   opened; the first cue's "Scroll" and "Click"; "COMMUNIST CHINA" under its capital's flag; a row of History
   cannot be clicked to its place; a fleet refused by no name; "A major battle began near Hammerfest" twice under 1
   January 1942 after a God peace in the replay (`critic/shots/c75gp_1942_GER_SovietUnion_390x844_2history.png`); "France has called off its massing on the border of
   Switzerland" one row above "Switzerland was annexed by Germany" of the same day
   (`critic/shots/c75mo_57613_tickerclick.png`).

## Run 74's cases re-run

| Run 74 case | Run 74 (`6cc762ea`) | Run 75 (`e830930e`) | Evidence |
|---|---|---|---|
| R74-N1 `heroPop 56901 400`: zoom; running | 38; 77 | **fixed**: 1; 36 (run 74's build beside it: 38; 78) | `critic/c75_hp_head_56901.log` |
| R74-N1 `heroPop 57905 200` | 28; 12 | **fixed**: 0; 4 | `critic/c75_hp_head_57905.log` |
| R74-N1 by the wheel, 56901 and 57905 | 41; 36 | **fixed**: 4; 0 | `critic/c75_hpw_head_*.log` |
| R74-N2 `massTold`, six seeds | 14 of 112 given up with no word | **fixed**: 13 called off in a row; 2 at war with the target by then | `critic/c75_massTold_a.log`, `_b.log` |
| R74-N3 `bannerRank 57901 150` | 181 of 438 quiet banner-days | **fixed**: 0 of 440; and R75-N1 in its place | `critic/c75_br_57901.log` |
| `bannerRank 57903` | 111 of 440 | 0 of 440 | `critic/c75_br_57903.log` |
| "The row is steady" (57901, 57903, by the day) | its set changed on 12 and 14 days, its order alone on none | its set on 27 and 26 days, its order alone on 8 and 2 | `critic/c75_br_*.log` |
| R73-N1 `bannerOwn 1942 GER` (AFTER=4242) | 3 of Germany's three on the row | wars of Germany's on all three banners at every sample (a war it joined, with a battle, for the quiet one on the United States from day 120) | `critic/c75_bo_1942_GER_after4242.log` |
| … on the phone | 2 of 2 | 2 of 2 | `critic/c75_bo_1942_GER_after4242_phone.log` |
| `takescore 1942 GER 240` | a war of Germany's on the row at every sample | the same | `critic/c75_takescore_1942_GER_240.log` |
| R73-N2 `massSeen 56211` | the Soviet row on 8 March, the war on 14 March | the same rows; "France has called off its massing on the border of Spanish Republic" on 20 February new | `critic/c75_ms_56211.log` |
| R73-N3 `few2 55421`, `54421` | 5 of 6; 4 of 6 | the same lines | `critic/c75_few2_5*.log` |
| `few3 55401`, `53401`, `57401` | 4 of 6, 6 of 6, 5 of 6 | the same lines | `critic/c75_few3_*.log` |
| `few60 55431` | 91, 87, 56 wars | the same | `critic/c75_few60_55.log` |
| R73-N4 `look 56901`, day 400, Europe at 6,000 | T-42, Roma and Bismarck on counters | T-42 and Roma on counters (R124's step out); the user's decision now | `critic/shots/c75look_56901_1600x900_d400_2eur6000.png` |
| R73-N5 `markers 56951` | 24, 47, 39 pairs at 1,800; 5, 12, 17 at 1,200 | **fixed from 1,200 out**: 3, 10, 12; 1, 3, 7 | `critic/c75_mk_head_desk.log` |
| Wars with nothing in a month (57211…) | 9 of 85 (its count) | 11 of 82 with no cell held at day 30 on both commits (my count) | `critic/c75_warOpening_57.json` |
| `warOpening`'s bars (57211…; 56211…) | 12.3 % and 15.8 % of 57; 9 and 9 of 71 | the same wars | `critic/c75_warOpening_5*.json` |
| `slowClick` named four | 3 broken, 27037 0 | the same | `critic/c75_li_*.log` |
| landingFuzz (new seeds) | 0 of 90 | 0 of 90 | `critic/c75_landingFuzz.log` |
| Run 61's 396 setups, 153 returns, 168 voyages | 1, 0, 3 broken, all `slowClick` | the same; 717 of 717 runs identical line for line | `critic/c75_*_cmp.txt` |
| Malta's 18 | 12 thrown back, 6 broke off | the same rows | `critic/c75_malta.log` |
| `capsurvey`, `heroPlace` 1975 and 1991, `endleb` | 2 of 154; the capitals | the same lines | `critic/c75_capsurvey.log` |
| `histnames` 1991 and 1975, `ev91` 1975 and 1990 | Kalinin; Harare, Dhaka… | the same | `critic/c75_histnames.*.log` |
| `warlong 1942 54601 god`, `1943 free` | peace on 18 Sep 1942 at 90 … | the same lines | `critic/c75_warlong_*.log` |
| `freewar` 1941, 1942, 1944; `clampend`; `heldfree 1946`; `blocend 54611`; `saveload 1942 god` | none; 0; 0; same | the same lines | `critic/c75_freewar_*.log` |
| `free` 51501, 51505 | 0 | 0 | `critic/c75_free_*_free.log` |
| `godpeace 1942 JAP`; `god42 1942 replay` | "Japan made peace with United States"; the note | the same | `critic/c75_godpeace.*.log` |
| `undo2 41211`, `undo2y 51231` | each undone, 0 px | each undone (pixels not compared) | `critic/c75_undo2*.log` |
| `heropanel 55929` | no pile at Relations' edge | the same | `critic/shots/c75hp_55929_12000_1relations.png` |
| `farConquests 0`, `firstdecl`, `piles`, `pileSides 51` | 0 of 53, 59; none over 4:1 | the same lines | `critic/c75_farc_0_*.log` |
| `workerDeterminism 54059` | `3f823012` on every arm | `3f823012` on every arm | `critic/c75_wd_54059.log` |
| 7019, 32019, 20 years | `165d4b75`, `6d77a72d` | `068f1066`, `a75df50c`; the same nations, formations and flipped cells every year | `critic/c75_seed*_save.log` |
| 7019 with heroes, 20 years | 72 nations, 1,014 formations, 12 heroes | the same in every year's line | `critic/c75_hero_7019_20.log` |
| `nukecount 55503`; `nukeIntercepts 53501` | 2; 2 launches | the same lines | `critic/c75_nc_55503.log` |
| `afterTrack 55601`, `37601` | 533 days; 0 | 533 days; 0 | `critic/c75_atx_*.log` |
| `x_stage normandyD` | "Germany +5 ⚔ Soviet Union +3 +50" on the row | the same | `critic/c75_x_stage.normandyD_*.log` |
| `g_editor` | stopped on a paused page | whole (the probe mended) | `critic/c75_g_58921.json` |
| `hist 32019`, `seaclick` | stopped at "Charts"; no row | whole (the probes mended) | `critic/c75_hist.32019_*.log`, `critic/c75_sc_58061.json` |
| Left out by run 74: `tagsChrome`, `stripe`, `waits` ×2, `detvp`, `heroCeiling`, `few3 51401`, `menloss`, the phone's banners over History, the twelve-year watch | | all run: 0 tags under the chrome; 0 stripes; the waits' words; one hash a step; 0.69; 6 of 6; the armies' lines; none over History; three watches | `critic/c75_tagsChrome_*.log`, `critic/c75_detvp.log`, `critic/c75_menloss_*.log` |
| Tick, seed 99, alone | 1.890 ms | 1.858 ms; year 1 at the pin `a5dbeae6` | `critic/c75_tick99.log` |
| Tick, seed 99 with heroes, alone | 1.765 ms | 1.738 ms | `critic/c75_tick99h.log` |
| Frames on the 7019 year-20 world | 57.3 to 60.2 fps; worst 155 ms | 59.2 to 60.2 fps; worst 105 ms | `critic/c75_pf_lookfps.log` |
| `lookFps`, touch, `x_indfps` | 57.7 to 59.5; 58.8 to 59.3; 58.9 to 60 | 59.6 to 60; 59.6 to 59.9; 59.6 to 60 | `critic/c75_lookfps.log` |
| `loadold` 7019 (the run before's save) | loads, runs a year | loads, runs a year (`75b9c02a`) | `critic/c75_loadold_7019.log` |

## Design objections (none blocking, no score lowered)

- **ADR-1110 (the user's decision): the tighter rule "at the far end of T1 only".** The rule stops at 1,200 m/px, so
  the view a notch nearer is the more heaped of the two: 21 pairs of 58 markers at 1,150 m/px against 6 of 53 at 1,300
  on the same front and day (`critic/c75_mk_headn_desk.log`), and R73-N5's own 1,200 figures (5, 12, 17) now stand
  just inside the line. A player zooming in to read a crowded front loses the numbers at the step where he expects
  more. The same rule to T1's near end, or eased in between 1,200 and 600, would answer it.
- **ADR-1111 (the user's decision): R124 left as it is.** Hero names on counters' numbers at 6,000 m/px stand
  (`critic/shots/c75look_56901_1600x900_d400_2eur6000.png`), and on a phone they are most of what Europe shows at the
  world's zoom.
- **SPEC §"The target answers" and ADR-1107: the row "when seen and not when begun"**, as run 74: a median of 3 days
  between the row and its war, and 141 of 274 declarations on six new seeds with no massing the day before.
- **ADR-1109's R130** is recorded as accepted and its row's order is not in SPEC, so what it leaves is judged as any
  other behaviour: R75-N1.
- **ADR-1060** and **heroes on by default (ADR-1070)** as run 74: not measured again.

## Ideas from other games (not scored)

- **Hearts of Iron IV** keeps a war's place in its list while it lasts and marks the fought one with a pulsing
  sword: a battle shown on the banner, and not by the banner's place, would keep both of R130's aims.
- **Victoria 3** shows on a war's tile why it cannot end yet (the war goals still pressed): a "to the death" mark
  on a banner at ±100 would tell the watcher what the score cannot.
- **DEFCON** names every warhead shot down: the intercepted bomber is the best news a defender gets.

## Strengths (verified)

- **Run 74's three findings are mended on their own probes, with both builds side by side:** the heroes' counters
  leap 1, 0 and 1 times in a zoom where 38, 28 and 50; a massing given up is called off in a row of its own (13 of
  the 15 that needed one, the other two at war by then); no quiet war holds the row while a fought one is hidden.
- **The crowded front at the middle zooms can be read:** 12 pairs of markers on one another where 39 on the same day
  of the same game, the hidden numbers out in the open, with no pop at the change of rule and no frame time added.
- **Nothing broke under 15,500 random acts:** seven monkeys at four sizes, God Mode and the editor among their
  buttons, 0 page errors and the game running at the end of each; and the frame rate is the same 59 to 60 at
  3840 × 2160 as at 1600 × 900.
