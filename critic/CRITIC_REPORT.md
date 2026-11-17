# Critic report, run 74 (focused): Batch 39 (R121–R127) on `6cc762ea`

- **Mode: focused.** The spawning message asks for a focused run (CRITIC_PROMPT, ADR-915). Run 73 was focused, with no
  blocking issue and UI/UX at 7, its bar.
- **Time:** 03:47 to 05:36, an hour and fifty minutes: over the hour a focused run aims at, because the bulk
  landing sets were due (40 minutes) and the performance figures were then taken alone (15).
- **Commit judged:** `6cc762eae9feccfd7d6dcbba0765055e066a9a7b`, HEAD at the start (`critic/c74_commit.txt`).
- **The last report:** run 73, focused, on `a9814c43`: no blocking issue; UI/UX and polish 7, every other dimension 8.
- **What changed since run 73:** 5 commits (Batch 39), 22 files outside `critic/`, 12 of them under `src/`:
  - R121 (ADR-1105): the banners' row is the played nation's wars, then the largest by the men of the two sides' nations;
  - R122 (ADR-1107): `MassingSeen`, a row in the ticker and History once a massing, when a quarter of the massing
    nation's men stand at the border;
  - R123 (ADR-1106, the user's): a nation with one living neighbour declares when its massing runs out;
  - R124 in part (ADR-1108, proposed): a hero's counter takes the step that covers no nation's counter;
  - R126: on a phone the ticker gives way to opened banners, the first cue under the top plates;
  - R125 measured and left for the user; R127 none built.
- **Due because the sim changed:** `git diff --stat a9814c43 HEAD -- src/sim data public/data` is 4 files
  (`ai/massing.ts`, `ai/strategic.ts`, `history.ts`, `world.ts`). Plain 1938 is not carried by ADR-959: the diff touches
  `src/sim/ai/` and the 20-year saves end at new hashes (7019 `165d4b75`, 32019 `6d77a72d`; run 73: `f0783b09`,
  `37285b1d`). The worlds themselves are run 73's: both seeds end year 20 with the same nations, formations and
  flipped cells (80, 1,421, 21,830 and 84, 968, 31,074); eleven of run 73's plain-1938 logs and thirteen of its
  built-year logs are the same line for line (below); the hash moved because the history, which now has the massing
  rows, is state. Run 61's bulk sets and
  Malta's 18 were run again all the same.
- **Scored afresh** (the changed files touch them): map visuals and semantic zoom (`render/units/counters.ts`),
  diplomacy and emergent dynamics (`ai/massing.ts`, `ai/strategic.ts`), stats and history (`shared/history.ts`,
  `sim/history.ts`, `shared/events.ts`), UI (`ui/WarBanners.tsx`, `app/style.css`, `App.tsx`; and it was the score that
  moved), stability (`sim/world.ts`: a new saved section), performance (the counters' drawing has new work each frame).
- **Carried from run 73, with a check each:** God Mode, editor and scenarios, naval, tanks, aircraft, AI nukes. No file
  of theirs changed. Their page probes and checkers were still run on new seeds (57xxx), and for naval the bulk sets.
- **Left out for time, of run 73's named cases:** the twelve-year watch on 55941 (a five-year watch alone on a new seed
  was run; plain 1938 is run 73's world, see above); the nuke A/B on ten seeds (`nukecount 55503` and
  `nukeIntercepts 53501` are the same line for line as run 73's); `tagsChrome 56973`, `stripe 56981`, `waits 56961`
  and `56963`, `detvp`; `heroCeiling`; `few3 51401`; `menloss`; the phone's "banners over
  History".
- **Probe failures of mine, disclosed:**
  - `c74_g_editor 57921` stood on a paused page (as run 73's did on a nuclear strike) and I stopped its process by its
    id after ten minutes; its pictures to the third day are kept (`critic/shots/c74g_57921_*.png`), its log is empty.
  - `c74_hist 32019` stopped again on the "Charts" button of a closed ranking (I did not mend the copy); its kind
    counts were read before that, and the charts were opened by `c74_charts 57995`.
  - `c74_seaclick 57913`: no sea battle's row in sixty days on that seed; not run again (naval is carried).
  - The two `afterTrack` runs failed at first for a missing folder of mine (`critic/c74_atcache`) and were run again.
  - A command of mine that stopped a waiting chain by its command line also stopped its own shell; nothing was
    written by it. The chain was started again from two new scripts (`c74_chainBulk.sh`, `c74_chainPerf.sh`).
  - The job list was copied from run 73's with the seeds changed 56xxx to 57xxx but the log names kept: a log named
    `c74_diploinv_56001s.log` is seed 57001's (each log's own first line says its seed).
  - Run 73's `c73_warOpening.log` on disk is a later, empty run ("0 wars"); run 73's figures for it are from its
    report.
- **Setup.**
  - Build: `vite build --outDir critic/c74_dist`, exit 0; starts: `npm run saves -- critic/c74_starts`, copied into the
    build (`critic/scripts/c74_build.sh`). Served by `vite preview` on 127.0.0.1:5375; run 73's build
    (`critic/c73_dist`, `a9814c43`, its own starts) on 5373 for the comparisons. Playwright Chromium at 1600 × 900 and
    390 × 844. No worktree was needed: every headless figure that could be compared is the same as run 73's logs.
  - Run 73's probes copied as `c74_*` (prefixes, port and seed family changed). New seed family: 57xxx.
  - Chains: `c74_runNamed.sh` (`c74_jobsAll.txt`, then `landingFuzz --seeds 15 --first 57101`), `c74_chainS.sh`
    (`c74_startsJobs.txt`), `c74_pages.sh`, `c74_pagesN.sh` (run 73's named page cases), `c74_chainBulk.sh` (the bulk
    sets, Malta), `c74_chainPerf.sh` (performance, alone, last).
  - New probes: `c74_heroPop.mjs` (does a hero's counter jump while zooming, panning and running; both builds),
    `c74_bannerRank.mjs` (R121's row day by day, a nation taken and released; both builds), `c74_massTold.ts` (R122's
    rows against the wars that follow; R123 on and off), `c74_massSave.ts` and `c74_massSave2.ts` (`massTold` over a
    save), `c74_massHist.mjs` (the row in History, its export, "my wars only", the ticker's click),
    `c74_undo2_pix.py`.
- **At the end:** both preview servers stopped by the process ids that held ports 5375 and 5373, no Playwright browser
  left; no worktree was made. A `vite preview` on port 4174 that was running before I began is not mine and was left. `git status` shows nothing new outside `critic/` (the eight untracked PNGs under
  `docs/evidence/7.132/` were there before).
- **Writes outside `critic/` by tools at their defaults:** `npm run sim` to `.cache/runs/*.json`; `landingFuzz` to
  `.cache/landingFuzz/`.
- **Memory:** the machine had 0.3 to 0.6 GB free for most of the run (its committed memory near its limit before my
  jobs, 80 of 83 GB, of which my processes held about 15); six to ten sims at once, nothing reaped.

## Verdict

**No blocking issue.** Every rule checker is 0 broken on new seeds: 10 runs of five or ten years, 5 free-year games,
landingFuzz 0 of 90, `landingRows all` 0 of 115 cases; and on run 73's seeds. The bulk landing sets (717 runs) are run 73's
line for line: no rule broken but `slowClick`, in the four runs run 73 had. Run 73's first, third and sixth findings
are fixed on their own cases, its second as SPEC now has it; its fourth and fifth stand.

**Two scores move.**
- **UI/UX and polish 7 → 8.** R73-N1, the case that took it to 7, is fixed on its own probe: a played Germany's three
  wars are the row at every sample of 150 days (0 of 3 on run 73's build, the same start and after-seed), and R73-N6 is
  fixed on its pictures.
- **Semantic zoom 8 → 7, under its bar of 8** (R74-N1). R124's half-built rule makes the heroes' counters jump: over
  nine notches of the mouse's wheel (9,000 m/px in to 3,686 and out again) a hero's counter leaps 25 to 78 px from one
  drawn frame to the next 41 times on HEAD and 4 times on run 73's build (seed 56901); 36 times and never on a second
  seed (57905). With the game running at ×5 and the
  camera still, 77 leaps in twenty seconds where run 73's build has 34 (12 and 4 on the second seed). And the thing the
  rule was for is not reached: T-42 and Roma still stand on counters in the critic's scene. The heroes are on in a game
  from the title, so this is what a new player zooms through.

**What a player will meet first (non-blocking):**
- **R74-N1:** hero counters hop up and down while zooming and while the game runs (above).
- **R74-N2:** a massing told and then given up is never called off: 14 rows of 112 on six seeds of three years were
  followed by no war and by no word that the army went home. (That the row comes a median of 3 days before its war
  is as SPEC has it, and is under "Design objections".)
- **R74-N3:** with no nation played the row is the wars of the largest nations, fighting or not: on 31 May 1938 of
  seed 57901 all three banners are of wars with no battle while Japan's war in China, the one drawn on the map, is
  behind "+3". No worse than run 73's order by the same count (41 % of banner-days against 44 %).
- **R73-N4 and R73-N5 stand as they were** (the builder left both for the user, ADR-1108, proposed).

**The rule checkers on new seeds:**
- diploInvariants, 0 broken: 57001, 57005 (heroes) (1938), 57003 (random diplomacy), 57007 (random world), five years;
  57009 (heroes), ten years. Run 73's 33501: 0 (`critic/c74_diploinv_*.log`).
- worldInvariants, every rule set, 0 broken: 57051, 57053 (heroes), 57055 (random world), 57057 (random diplomacy),
  five years; 57065 (heroes), ten years. Run 73's 36009: 0 (`critic/c74_wi_*.log`).
- `c74_free.ts`, 0 broken lines: 1942 57542, 1951 57551, 1966 57566 (random diplomacy), 1975 57575 (two years), 1991
  57611 (five years), all with heroes; run 73's 51501, 51505: 0 (`critic/c74_free_*_free.log`).
- `blocend 54611`: 0 bloc lines in five years. `heldfree 1946`: 0. `clampend`: none at ±100. `repulse 55071`, `57073`:
  0. `landingRows all`: 115 cases, 20,321 hours, 0 broken (`critic/c74_lrows_all.log`).
- `landingFuzz --seeds 15 --first 57101`: **0 of 90** runs broken, `slowClick` included (`critic/c74_landingFuzz.log`).
- `workerDeterminism 54059`: `3f823012` on every arm; 57059: `8d1be792` on every arm (`critic/c74_wd_*.log`).
- The builder's measures of a war's first month on new seeds (`tools/diag/warOpening.ts`, 57211, 57213, 57215, three
  years: 128 wars, 57 with a border that ran a month): the attacker with no man within 300 km of the border in 7 of 57
  (12.3 %; the user's bar 15 %, ADR-1094); the defender ahead in land at day 30 in 9 of 57 (15.8 %; the bar 15 %; run
  73: 9 of 71, 12.7 %). It is the seeds: on run 73's own three (56211, 56213, 56215) HEAD has 9 and 9 of 71, to the
  war what run 73 had (`critic/c74_warOpening_56.json`). No finding. Of the 42 wars prepared by a massing on the new
  seeds, 0 began with no man near (`critic/c74_warOpening.log`, `critic/c74_warOpening.json`).

## Scores

### Map visuals and readability: 8 → **8** (scored afresh)

**What I tested:** run 73's `look` at desk and phone size on its seeds (56901, 56903: the cue, the chrome, two fronts
at five zooms, 110 shots), its `markers` case, the heroes with a panel open, and the new `heroPop` on two seeds and
both builds.

**Evidence for 8:**
- **The fronts as run 73 judged them:** the Japanese-Chinese front on 18 February 1938 is a white-cored line with the
  taken ground hatched and the arrows by side (`critic/shots/c74look_56901_1600x900_d45_f0_1200m.png`); the tiers below
  it are as they were (`…_f0_600m.png`, `…_f0_100m.png`, `…_f0_30m.png`). 0 page errors in both looks.
- **R72-N4's mended half holds:** with Relations open no hero's counter is piled at the panel's edge
  (`critic/shots/c74hp_55929_12000_1relations.png`).
- **A massing can now be found on the map from its row:** the ticker's "8 March 1938 Soviet Union is massing its army
  on the border of Romania", clicked, brings the border to 938 m/px with the Soviet columns from Zhytomyr down to it
  (`critic/shots/c74mh_56211_tickerclick.png`, `critic/c74_mh_56211.log`).

**Not 9:**
- **R73-N4 stands (R124, built in part).** In the same scene (seed 56901, the four-hundredth day, Europe at 6,000
  m/px) T-42 still covers "293.9k" and Roma two Italian counters; Maus and Bismarck have changed places and Bismarck
  now covers a German counter (`critic/shots/c74look_56901_1600x900_d400_2eur6000.png` beside run 73's
  `critic/shots/c73look_56901_1600x900_d400_2eur6000.png`). ROADMAP says so itself ("T-42, Bismarck, Roma and HMS
  Hood still stand on a counter each").
- **R74-N1** (scored under semantic zoom, once): the counters that R124 moves now move every few frames.
- **R73-N5 stands, to the figure:** `markers 56951`, days 10, 20, 30 at 1,800 m/px: 24, 47, 39 pairs over one another
  of 60, 71, 72 markers; at 1,200: 5, 12, 17. The same as run 73 (`critic/c74_mk_head_desk.log`).
- On a phone at the world's zoom the heroes' counters cover Europe whole
  (`critic/shots/c74phone_56903_390x844_d60_0asleft.png`); "COMMUNIST CHINA" is still under its capital's flag.

### Diplomacy, war, alliance, puppet, revolt depth: 8 → **8** (scored afresh)

**Evidence for 8:**
- **Every checker 0 broken** on new seeds (above), with heroes, random diplomacy and the random world.
- **A massing is told (R122), and the row leads somewhere:** on run 73's case (seed 56211) History has "Soviet Union is
  massing its army on the border of Romania" on 8 March 1938, six days before the declaration; the ticker has it, its
  click goes to the border, "my wars only" as Romania shows it, the kind's filter lists seven massings in 67 days, and
  the CSV and JSON have it as `MassingSeen` (`critic/c74_ms_56211.log`, `critic/c74_mh_56211.log`,
  `critic/c74_mh_56211.csv`, `critic/shots/c74mh_56211_kind.png`).
- **No row twice:** 112 rows on six seeds of three years, none of a nation already told in that massing
  (`critic/c74_massTold_a.log`, `critic/c74_massTold_b.log`).
- **Run 73's same-seed measures are the same line for line:** `farConquests 0` (both sets), `firstdecl` (53 and 59,
  none over 6,000 km), `piles` on fifteen seeds (none over 4:1), `pileSides 51`, `warlong 1942 54601 god` (peace at 90
  on 18 September 1942), `freewar` 1941, 1942, 1944, `clampend`, `blocend 54611`
  (`critic/c74_farc_0_*.log`, `critic/c74_firstdecl*.log`, `critic/c74_piles_*.log`, `critic/c74_warlong_*.log`).
- **The invaded front:** `frontArrivals 57205 GER,POL 60`: on day 60 Poland has 4,000 men left and holds 22 of
  Germany's cells; `pragueFall` 57201 and 57203: Prague taken on days 14 and 15 (`critic/c74_fa_56205.log`,
  `critic/c74_prague_5620*.log`).

**Not 9:**
- **R74-N2: a false alarm is never called off** (`c74_massTold.ts`, seeds 56211, 57611, 57613, 57615, 57617, 57619,
  three years each). Of 112 rows 14 were of a war that never came (12.5 %; 2 more were still open at the end), and
  nothing says so: the United Kingdom "is massing its army on the border of Mozambique" on 56211 and gives it up 74
  days later in silence; Brazil on Bolivia, 36 days; the Soviet Union on Turkey, 27. SPEC and ADR-1107 say nothing of
  a massing given up; ROADMAP lists it as not built ("a row when a massing is given up"), with "an arrow or a mark on
  the map at the border".
- **As specified, and measured:** 96 rows were followed by their war, after a median of 3 days (a day or less in 24,
  two days or less in 39, a week or less in 70); 56 wars that a massing prepared had no row (37 % of the 152). Read
  on two of the seeds (19 such wars, `critic/c74_massTold_why.log`): in none was the nation still marked as told from
  an earlier massing; 11 were declared a day or two after the massing began (Germany on the Soviet Union on day 343
  of 56211, the largest war of that game), 8 after 9 to 39 days (Brazil on Venezuela, Saudi Arabia on Yemen). The
  rule counts the men at the border once a day and declares, at half, before it tells, at a quarter: these were at
  half the first day they were at a quarter. Why a massing of 39 days goes from under a quarter to half in a day was
  not read. SPEC has the row at a quarter of the men ("That day, once a massing"); the declaration of the same day
  stands in for it. Neither lowers anything; both are under "Design objections".
- **Wars in which nothing happens for a month:** on run 73's three seeds 16 of 111, as run 73; on the three new ones
  9 of the 85 that ran thirty days (`critic/c74_warOpening_56.log`, `critic/c74_warOpening.log`).
- **The bloc leaders at war after the track (run 72's observation), as it was:** `afterTrack 55601`: the United
  States and the Soviet Union on opposite sides for 533 days of ten years, as run 73; 37601: 0 days
  (`critic/c74_atx_55601.log`, `critic/c74_atx_37601.log`); `blocend 54611`: 0 bloc lines broken.

### Emergent world dynamics: 8 → **8** (scored afresh)

**Evidence for 8:**
- **R73-N3 fixed on its own measure (R123):** `fewNationWars 2 55421 6 10`, the first war's day on run 72's commit →
  run 73's → HEAD: 55421 13 → 476 → 104; 55423 2,323 → none → 2,414; 55425 90 → 665 → 181; 55426 27 → none → 118. A
  war in ten years in 5 worlds of 6 (run 73: 3; run 72: 5). 55421 and 55426 have theirs within a year, which is what
  run 73 asked. The second set (54421): 54422 5 → 475 → 96; 4 of 6 with a war, as both runs before
  (`critic/c74_few2_55.log`, `critic/c74_few2_54.log`).
- **Worlds of three gain from it too** (ROADMAP: "not looked at … the rule does not apply"; it does, where one of the
  three has one neighbour): 55406 40 → 510 → 131, 53401 376 → 944 → 580 (`critic/c74_few3_55.log`,
  `critic/c74_few3_53.log`). Checked with the rule off (`c74_massTold.ts 10 --random 3 --no-alone 55406 53401`): 1 war
  each in ten years, every massing told given up; with it on, 6 and 5 wars
  (`critic/c74_massTold_r3_noalone.log`, `critic/c74_massTold_r3.log`).
- **The rule does not reach 1938:** three seeds of three years with `MASS_PROBE.alone` off end at the same hashes as
  with it on (`ecde4587`, `f3faec05`, `247dd550`): no nation with one neighbour ran a massing out, as ADR-1106 says
  (`critic/c74_massTold_noalone.log` against `critic/c74_massTold_a.log`, `…_b.log`).
- **Plain 1938 is run 73's world:** the twenty-year games of 7019, 32019 and 7019 with heroes end with the same
  nations, formations, declarations and capitals taken as run 73's (`critic/c74_seed7019_save.log`,
  `critic/c74_hero_7019_20.log`); sixty nations (55431–3): 91, 87, 56 wars, as run 73.
- **Five years on the page, alone:** 57941 with heroes, 1938 to the end of 1942: wars on the row at every year's end
  ("Soviet Union +4 ⚔ Japan +5", "France +4 ⚔ Italy +2", "Iraq +8 ⚔ Iran +3", "Finland ⚔ Soviet Union", "France +1 ⚔
  Germany +1"), 98 nations down to 92 by way of 93 and 96, "Bulgaria returned", 0 page errors
  (`critic/c74_lwalone_57941.json`, `critic/shots/c74lwalone_57941_y03_world.png`). The Soviet Union is on two or
  three of the three banners in four of the five years (R74-N3).

**Not 9:**
- **A two-nation world now waits at least its ninety days:** the first war of the worlds R123 mends is on day 96 to
  181 where run 72 had day 5 to 90; 55424, 54425 and 54426 still have no war in ten years, and three nations 55401
  and 55404 none, as run 72 and 73. A new family (57401–6, three nations): first wars on days 1,538, 601, 1,266,
  none, 1,130, 61 (`critic/c74_few3_56.log`; new seeds, not compared).
- Brazil's massing on Colombia is given up "late" on each of the three new seeds too, and on run 73's
  (`critic/c74_warOpening.log`, `critic/c74_warOpening_56.log`): as decided (ADR-1089, ADR-1106).

### God Mode: 8 (carried from run 73; no file of it changed)

- Checked: `q_god_tools 57919`: revolt, spawn, breakthrough, territory, found and raze a city, each told
  ("4 January 1938 Prague in Czechoslovakia was razed"); `a_god_nuke 57917`: its 23 pictures and 0 errors
  (`critic/c74_q_god_tools.57919.log`, `critic/c74_a_57917.json`).
- Undo: `undo2 41211` and `undo2y 51231`: 0 px of the map differ after the undo for nuke, revolt, nation, city and
  raze (`critic/c74_undo2_pix.txt`; my crop of the map, 680,000 px; run 73 had 9 px for the nuke a year on).
- `godpeace 1942 JAP`: "Japan made peace with United States"; the phone's God tab; `god42 1942 53542 replay`, which
  run 73 left out: the note "Any God Mode act ends the replay of history…" and 0 errors
  (`critic/c74_godpeace.*.log`, `critic/c74_god42.1942_53542_replay.log`).

### Editor and scenarios: 8 (carried from run 73; no file of it changed)

- Checked: `x_editor 57443` (paint, undo, redo, export and load from the title: owners `[1,1,1]`); the standoff file
  loads (`critic/c74_os2_scen.*.log`); the 1983 free card and its start, with "History's course left at the start of
  your game" (`critic/c74_x_replaycard.1983_free.log`). `g_editor 57921` was stopped (above); its fleets, the refusal
  and the warheads are in its pictures (`critic/shots/c74g_57921_03_refusal.png`).

### Stats and history: 8 → **8** (scored afresh)

- **The new kind is whole:** a filter of its own ("Army massing on a border": 7 of 112 events in 67 days of 56211, 52
  of 3,106 in twenty years of 32019), a type in both exports, a place the ticker goes to
  (`critic/c74_mh_56211.log`, `critic/c74_hist.32019_*.log`).
- **Run 73's names hold:** "29 October 1941 A major battle began near Kalinin" in the 1991 and 1975 replays; Harare,
  Antananarivo, Dhaka, Banjul and "Paris · capital, France" on 31 December 1991; `capsurvey`: 2 of 154, the
  timeline's two (`critic/c74_histnames.*.log`, `critic/c74_ev91.1990_*.log`, `critic/c74_capsurvey.log`).
- **The ranking and the charts:** the ranking by owned land, a chart of five nations (`critic/c74_charts_57995.log`,
  `critic/shots/c74ch_57995_2charts.png`). The export of 32019's year-20 world: CSV and JSON
  (`critic/c74_dl_32019.json`).
- **Not 9:** R74-N2 (no row for a massing given up); a row in History cannot be clicked to its place, only the
  ticker's can; a refused order still names a fleet by nothing (R127: "none built").

### UI/UX and polish: 7 → **8** (scored afresh)

**Why it moves: R73-N1, the case that lowered it, on both builds.**
- **HEAD:** `AFTER=4242 node critic/scripts/c74_bannerOwn.mjs 1942 GER Germany 150`: on days 30 to 150 the row is
  "Germany +6 ⚔ United States +1", "Germany +2 ⚔ United Kingdom +20", "Germany +6 ⚔ Soviet Union +3": "of the
  player's on the banners: 3" at every sample, and first of the six when "+8" is opened
  (`critic/c74_bo_1942_GER_after4242.log`, `critic/shots/c74bo_1942_GER_1600x900_closed.png`).
- **Run 73's build, the same start and after-seed, run again beside it** (`TAG=c73build AFTER=4242
  BASE=http://127.0.0.1:5373 node critic/scripts/c74_bannerOwn.mjs 1942 GER Germany 150`): 0 of the three at every
  sample ("Thailand ⚔ Vichy France", "Soviet Union ⚔ Iraq", "France ⚔ Brazil", then "Bulgaria +3 ⚔ Turkey +2",
  "Argentina ⚔ Bolivia", "Peru ⚔ Bolivia"), 0 among the six opened, as run 73 had it
  (`critic/c74_bo_c73build_1942_GER_after4242.log`).
- **Taken and released, on a new seed:** plain 1938 57901, day 150: Greece's war on Yugoslavia is behind "+3"; Greece
  taken, "Greece +2 ⚔ Yugoslavia +2" is the first banner; released, the row is as it was
  (`critic/c74_br_57901.log`, `critic/shots/c74br_57901_1600x900_taken.png`); the same on 57903.
- **The phone:** its two banners are two of Germany's three at every sample
  (`critic/c74_bo_1942_GER_after4242_phone.log`).
- **R73-N6 fixed on its pictures (R126):** with "+3" opened on a phone the banners stand where the ticker was and
  cover nothing; the first cue is under the "Political" and "Ranking" plates
  (`critic/shots/c74phone_56903_390x844_d60_c0more.png`, `critic/shots/c74phone_56903_390x844_2start.png`).
- **The row is steady:** in 149 days of each of two seeds the row's set changed on 12 and 14 days and its order alone
  on none (`critic/c74_br_57901.log`, `critic/c74_br_57903.log`).

- **R73-N2, which run 73 listed under "also not 8", is told:** a row in the ticker and in History, with a kind of its
  own and a click that goes to the border (diplomacy, above). What is left of it is the rule's (R74-N2 and the
  objection to its timing), not the interface's.

**Evidence that it is an 8 again** (run 72's and 73's, checked): the first cue once (`cueAfterResume` 0,
`cueSecondGame` 0 at both sizes); the phone's layout probe 0 clipped, 0 off-screen in 14 states
(`critic/c74_p_phone..log`); orders by mouse 7 of 7 to Warsaw, 7 closer after ten days
(`critic/c74_x_mouse.57421_10_1600_900.log`); keys; Continue at the unbroken game's hash
(`critic/c74_x_continue.57415_40_GER_60.log`); 0 page errors in every probe of this run.

**Not 9:**
- **R74-N3: with no nation played, the largest nations' wars hold the row whether or not they are fought.** The size
  is the men of every nation of the two sides (ADR-1105), not the men in the war. Seed 57901, 31 May 1938: "Soviet
  Union ⚔ Norway +2", "Italy ⚔ Nationalist Spain +1 0" and "Nationalist Spain ⚔ Portugal +2", none with a battle, the
  second at a score of 0 for a month; Japan's war in China and Greece's in Yugoslavia, both with battles, are behind
  "+3" (`critic/shots/c74br_57901_1600x900_d150.png`). SPEC's entry of the banners says nothing of the row of three
  or of its order. Over 150 days 181 of 438 banner-days are of a war with no
  battle while one with a battle is behind "+n"; 111 of 440 on 57903. Run 73's build, newest first, on 57901: 195 of
  440. No worse; no score moves on it.
- The same for a player on a phone: of Germany's three the two shown are the United States' (score 0, no battle
  drawn) and the United Kingdom's; the Soviet war, at +57, is behind "+9"
  (`critic/c74_bo_1942_GER_after4242_phone.log`).
- While the banners are opened on a phone there is no ticker at all (R126, as built): news is not seen until "−".
- The first cue on a phone still says "Scroll to zoom" and "Click", and covers two heroes' counters.

### Performance: 8 → **8** (scored afresh)

Run alone, last, after every other chain had ended, pinned to the performance cores
(`critic/scripts/c74_chainPerf.sh`, `critic/c74_pf.status`: 05:13 to 05:28):
- **Tick, seed 99, five years:** 1.890 ms mean (run 73: 1.884), year 1 at `a5dbeae6`, the new pin
  (`critic/c74_tick99.log`). With heroes: 1.765 ms (run 73: 1.750) (`critic/c74_tick99h.log`). The same.
- **Frames, HEAD's 7019 year-20 world** (`c74_pf_lookfps`): 57.3 to 60.2 fps at 3,000, 1,200, 600, 120 and 30 m/px in
  both looks; the worst frames 155 ms (Countryballs, 1,200 m/px), 108 and 103 ms, once each (run 73: 117 ms once)
  (`critic/c74_pf_lookfps.log`).
- **`tools/diag/lookFps.ts` on the same world:** 57.7 to 59.5 forced frames/s at every tier, p95 17.9 to 18.3 ms, a
  draw 0.8 to 3 ms (the longest 6.2) (`critic/c74_lookfps.log`).
- **Five years on the page, alone** (57941, heroes): 58.6 to 59.3 fps every year, the longest gap 67 ms, none over
  half a second (`critic/c74_lw_57941_alone.log`).
- **Touch and the individual tier:** 58.8 to 59.3 fps with and without a selection
  (`critic/c74_tm_touch.alone.log`); `x_indfps 32111`: 58.9 to 60 fps at 28, 18 and 12 m/px, the worst frame 67 ms
  (`critic/c74_xi.log`).
- **R124's work each frame costs nothing seen:** at 6,000 m/px with eight heroes, running at ×5 beside the other
  chains, 1,194 frames in twenty seconds on HEAD and 1,196 on run 73's build (`critic/c74_hp_head_56901.log`,
  `critic/c74_hp_c73build_56901.log`).
- **Not 9:** single frames of 155, 108 and 103 ms in the frames' probe; year 6 and later of a watch alone were not
  run (as run 73).

### Stability: 8 → **8** (scored afresh)

- **The new saved section:** a game saved while a massing is told (57621: Italy on Austria and France on the Spanish
  Republic) loads with `massTold` [15, 19] as saved, saves again to the same 3,439,416 bytes, and after 120 days is
  at the unbroken game's hash with the same massing rows and none of the two told again; the same on 57611 and 57623
  (`critic/c74_massSave.log`, `critic/c74_massSave2.log` printed by `c74_massSave2.ts`).
- **An old save:** run 73's 7019 year-20 save, made before `world.massTold` was a section, loads on HEAD and runs a
  year (`d9855177`, 78 nations; `critic/c74_loadold_7019.log`). Run 73's 1975 replay start on HEAD ends its track and runs 30 days
  (`critic/c74_oldsave_1975.log`).
- `workerDeterminism` 54059 and 57059: every arm the same. The page's save, loaded twice: `4270962851` each time
  (`critic/c74_saveload_page.57937_200.log`); a 1942 God game headless, the same over 30 days
  (`critic/c74_saveload_1942god.log`); Continue (above).
- **Long runs:** twenty years of 7019, 32019 and 7019 with heroes (12 heroes alive), ten years of two checkers.
- 0 page errors in every probe of this run.

### Semantic zoom to unit level: 8 → **7** (scored afresh; its bar is 8)

**Why it moves: R74-N1, the same seeds on both builds** (`node critic/scripts/c74_heroPop.mjs <seed> <day> <tag>`,
`BASE` HEAD's build or run 73's; a leap is a hero's counter moved over 12 px against its own place between two
frames).

| | run 73's build (`a9814c43`) | HEAD |
|---|---|---|
| 56901, day 430, zoom 9,000 → 4,000 m/px in 120 steps, paused | 1 leap | **38** (Maus 11, Bismarck 11, P.100 Ercole 9, …), 23 to 47 px |
| 57905, day 230, the same zoom | 0 | **28** |
| 56901, the camera still at 6,000 m/px, 120 steps of 6 h | 6 | **19** |
| 57905, the same | 12 | **48** |
| 56901, running at ×5 for 20 s (1,194 frames, 20 days) | 34 | **77** |
| 57905, the same | 4 | **12** |
| panning 480 px, paused (both seeds) | 2, 3 | 2, 3 |
| 56901, day 430, **the mouse's wheel**: nine notches, 9,000 → 3,686 → 11,250 m/px, every drawn frame (157) | 4 (HMS Hood) | **41** (eight heroes), 25 to 78 px |
| 57905, day 230, the same wheel (114 frames) | 0 | **36** (ten heroes) |

- **By the wheel as a player turns it** (`WHEEL=1`, the last two rows): four notches in and five out, sampled at each
  drawn frame: 41 and 36 leaps over 157 and 114 frames on HEAD, 4 and 0 over 158 and 135 on run 73's build
  (`critic/c74_hpw_head_56901.log`, `critic/c74_hpw_c73build_56901.log`, `critic/c74_hpw_head_57905.log`,
  `critic/c74_hpw_c73build_57905.log`).
- **What it looks like:** two steps of the zoom 42 m/px apart: Maus above Bismarck in one, Bismarck above Maus in the
  next, each over a different counter (`critic/shots/crop_c74hp_head_zoom_f1_f2.png`, from
  `critic/shots/c74hp_head_56901_zoom_f1.png` and `…_f2.png`); the same leaps back at steps 3, 7, 8, 9, 10
  (`critic/c74_hp_head_56901.log`).
- **The cause, as far as the code shows it:** R124 (`src/render/units/counters.ts`) picks, each frame, the first of a
  hero's three steps that covers no nation's counter of that frame, with no memory of the last frame's choice. The
  nations' counters fold and unfold as the zoom changes and move as armies do, so the pick flips. Panning moves both
  alike, and has no more leaps than before.
- **And it does not do what it was for:** R73-N4's scene still has heroes on counters (map visuals, above).
- The frame rate is not touched by it: 1,194 frames in twenty seconds on HEAD and 1,196 on run 73's build, with the
  other chains running.

**What holds it at 7:** every tier is there and reads as before: `z_zoom 57911`, 18 steps from 6,000 to 3 m/px on one
division: units drawn from 1,573 m/px (8,533) to 64 at 3 m/px, the men from 28 m/px (10,705), 0 errors
(`critic/c74_z_zoom.57911.log`); the fronts at 1,200, 600, 250, 100 and 30 m/px at desk and phone size; the heroes at
every tier (`critic/c74_hero.57425_300_hon.log`); the phone's tap on a counter opens its panel
(`critic/c74_phz.57933_40.log`).

**What to fix:** a hero's counter should keep its step from frame to frame unless its place is taken, or R124 should
be taken out until it is built whole.

**What the bar needs** (cases the builder can run, HEAD's build served on `BASE`):
- `node critic/scripts/c74_heroPop.mjs 56901 400 head` prints "zoom 9,000 -> 4,000 m/px in 120 frames: jumps" at 2 or
  fewer (run 73's build: 1) and "running 20 s" at 34 or fewer;
- `node critic/scripts/c74_heroPop.mjs 57905 200 head`: zoom jumps 2 or fewer (run 73's build: 0) and "running 20 s"
  at 4 or fewer (run 73's build: 4);
- `WHEEL=1 node critic/scripts/c74_heroPop.mjs 56901 430 head` and `… 57905 230 head`: "leaps" at 4 or fewer and at 2
  or fewer (run 73's build: 4 and 0);
- and R73-N5 no worse (`c74_markers.mjs 56951 …`: 24, 47, 39 pairs at 1,800 m/px).
The zoom's and the wheel's counts are the firm ones (paused, the same each run: 40 and 38 in two runs of the first);
the running count varies a little with the frames drawn.

### Naval warfare: 8 (carried from run 73; no file of it changed)

- **landingFuzz `--seeds 15 --first 57101`: 0 of 90** broken, `slowClick` included: the run's rate is 0 of 90.
- **The named `slowClick` cases as run 73:** 30041 (13.0 d against 5.9), 51101 (13.8 against 6.7) and 53125 (9.5
  against 2.4) break it; 27037 does not (`critic/c74_li_*.log`).
- **Run 61's bulk sets (due), against run 73's, file by file** (`critic/scripts/c74_bulkcmp.sh`): the 396 named
  landing setups, the 153 stuck returns and the 168 next voyages: **717 of 717 runs the same line for line** as run
  73's. The same four runs break a rule, each `slowClick`: 30041 3517 g1 of the setups; 30041, 31157 and 31175 3517 g1
  of the next voyages (`critic/c74_liab_named_cmp.txt`, `critic/c74_sr_cmp.txt`, `critic/c74_nv_cmp.txt`).
- **Malta's 18:** 12 thrown back near Catania and 6 broken off near Palermo, row for row as run 73
  (`critic/c74_malta.log`).
- **Sea battles:** 57061, 68 in three years (`critic/c74_sb_56061.log`); `landingRows all` 0 broken.

### Tanks: 8 (carried from run 73; no file of it changed)

- Checked: `breakthrough 57979`: 27 formations engaged by day 7 (run 73's 56979: 27); `c_battle 57915`: an armoured
  division's fight at 250, 80, 25 and 15 m/px, wrecks and contact drawn; `heroBattle 57081`: the P.100 in battle 97 of
  728 days at war (`critic/c74_k_breakthrough.57979.log`, `critic/c74_c_battle.57915.log`,
  `critic/c74_heroBattle_56081.log`).

### Aircraft: 8 (carried from run 73, which carried it from run 72; no file of the air war changed)

- Checked: `pl_planes 57925`: the wings' marks at every tier in both looks, down to 1 at 25 m/px; `w_wing 57927`: a
  followed wing flying with its mark, 0 px from it with another panel open
  (`critic/c74_pl_planes.57925_GER_POL_5375.log`, `critic/c74_w_wing.57927.log`).

### AI nuclear use: 8 (carried from run 73, which carried it from run 72; no file of the nuclear rules changed)

- Checked: `nukecount 55503` and `nukeIntercepts 53501` over 22 years: 2 launches each, the same lines as run 73;
  57501: 0 launches in 22 years (run 73's 56501: 0) (`critic/c74_nc_*.log`, `critic/c74_nukeIntercepts_53501.log`). HEAD's 7019 year-20
  save on the page for 400 days: no strike, 0 errors (`critic/c74_an_ainuke.7019_*.log`). The ten-seed A/B was not run
  again.

## Blocking issues

None.

## Non-blocking issues (prioritised)

1. **R74-N1 (semantic zoom, map; R124): the heroes' counters leap while zooming and while the game runs.**
   - **The case:** `BASE=<HEAD's build> node critic/scripts/c74_heroPop.mjs 56901 400 head`: 38 leaps in the zoom
     (run 73's build: 1), 77 in twenty seconds running (34); 57905 200: 28 (0) and 12 (4).
   - **Seen fixed when** the zoom's leaps are 2 or fewer on both seeds and the running leaps no more than run 73's
     build's (34 and 4).
2. **R74-N2 (diplomacy, stats; R122): a massing told and given up is never called off.**
   `npx tsx critic/scripts/c74_massTold.ts 3 56211 57611 57613` and `… 3 57615 57617 57619`: 14 of 112 rows with no
   war and no word after (up to 74 days). **Seen fixed when** a massing told and given up has a row of its own in
   the ticker and History (that probe's "GIVEN UP … no row of it" on no line).
3. **R74-N3 (UI; R121): wars with no battle hold the row while fought ones are behind "+n".**
   `node critic/scripts/c74_bannerRank.mjs 57901 150`: 181 of 438 banner-days; 31 May 1938 has three quiet banners
   and Japan's war in China behind "+3". **Seen fixed when** that count is under a tenth of the banner-days on 57901
   and 57903 (a war's size by the men engaged, or a war with a battle before one without).
4. **R73-N4 (map): hero tags on counters in play**, as run 73: `node critic/scripts/c74_look.mjs 56901 1600 900
   45,180,400`, the day-400 Europe at 6,000 m/px. Left for the user (ADR-1108, proposed).
5. **R73-N5 (map, zoom): markers over one another at 1,200 to 1,800 m/px**, to the figure as run 73. Left for the
   user (ADR-1108, proposed).
6. **Small worlds:** 55424, 54425, 54426 (two nations) and 55401, 55404 (three) still have no war in ten years.
7. **Wars with nothing in their first month:** 9 of 85 (`tools/diag/warOpening.ts … 57211 57213 57215`).
8. **`slowClick` (ADR-914):** this run's rate on new seeds 0 of 90; the named cases as run 73. The bulk sets: the same four runs as run 73 (30041 twice, 31157, 31175).
9. **Small things:** on a phone no ticker while the banners are opened; the first cue's "Scroll" and "Click" on a
   phone; "COMMUNIST CHINA" under its capital's flag; a fleet refused by no name (R127, none built).

## Run 73's cases re-run

| Run 73 case | Run 73 (`a9814c43`) | Run 74 (`6cc762ea`) | Evidence |
|---|---|---|---|
| R73-N1 `bannerOwn 1942 GER` (AFTER=4242) | 0 of Germany's three on the row, 0 of the six opened | **fixed**: 3 of 3 at every sample, first when opened | `critic/c74_bo_1942_GER_after4242.log` |
| R73-N1 on the phone | none from day 30 | 2 of the phone's 2 at every sample | `critic/c74_bo_1942_GER_after4242_phone.log` |
| `takescore 1942 GER 240` | Germany's wars on the row to day 60 | a war of Germany's on the row at every sample to day 240 (three of three to day 150) | `critic/c74_takescore_1942_GER_240.log` |
| R73-N2 `massSeen 56211` | no row before the declaration | **fixed, by the letter**: "massing words" on days 55 and 65 (other nations' massings); the Soviet row itself on 8 March (day 67), the war on 14 March | `critic/c74_ms_56211.log` |
| R73-N3 `few2 55421` | 3 of 6 with a war; 55426 and 55421: none, day 476 | **fixed**: 5 of 6; days 118 and 104 | `critic/c74_few2_55.log` |
| `few2 54421` | 4 of 6; 54422 day 475 | 4 of 6; day 96 | `critic/c74_few2_54.log` |
| `few3 55401`, `53401` | 4 of 6, 6 of 6; 55406 day 510, 53401 day 944 | 4 of 6, 6 of 6; days 131 and 580 | `critic/c74_few3_*.log` |
| `few60 55431` | 91, 87, 56 wars | the same | `critic/c74_few60_55.log` |
| R73-N4 `look 56901`, day 400, Europe at 6,000 | T-42 and Roma on counters | the same, and Bismarck on one (R124 in part) | `critic/shots/c74look_56901_1600x900_d400_2eur6000.png` |
| R73-N5 `markers 56951` | 24, 47, 39 pairs at 1,800; 5, 12, 17 at 1,200 | the same | `critic/c74_mk_head_desk.log` |
| R73-N6 `look 56903` phone | opened banners over the ticker; the cue over "Ranking" | **fixed** | `critic/shots/c74phone_56903_390x844_d60_c0more.png` |
| Wars with nothing in a month | 16 of 111 | 9 of 85 (new seeds) | `critic/c74_warOpening.log` |
| `warOpening`'s bars | 12.7 % and 12.7 % of 71 | 12.3 % and 15.8 % of 57 (new seeds; noise) | `critic/c74_warOpening.json` |
| `slowClick` named four | 3 broken, 27037 0 | the same figures | `critic/c74_li_*.log` |
| landingFuzz (new seeds) | 0 of 90 | 0 of 90 | `critic/c74_landingFuzz.log` |
| Run 61's 396 setups, 153 returns, 168 voyages | 1, 0, 3 broken, all `slowClick` | the same; 717 of 717 runs identical line for line | `critic/c74_*_cmp.txt` |
| Malta's 18 | 12 thrown back, 6 broke off | the same rows | `critic/c74_malta.log` |
| `capsurvey`, `heroPlace` 1975 and 1991, `endleb` | 2 of 154; Moscow, Paris | the same lines | `critic/c74_capsurvey.log` |
| `histnames` 1991 and 1975, `ev91` 1975 and 1990 | Kalinin; Harare, Dhaka… | the same | `critic/c74_histnames.*.log` |
| `warlong 1942 54601 god`, `1943 free` | at 90 on 18 Sep 1942 | the same lines | `critic/c74_warlong_*.log` |
| `freewar` 1941, 1942, 1944; `clampend`; `heldfree 1946`; `blocend 54611`; `saveload 1942 god` | 0 peaces in hour 1; none; 0; 0; same | the same lines | `critic/c74_freewar_*.log` |
| `free` 51501, 51505 | 0 | 0 | `critic/c74_free_*_free.log` |
| `godpeace 1942 JAP` | "Japan made peace with United States" | the same | `critic/c74_godpeace.*.log` |
| `g42 1942 replay 53542` | not read (my arguments) | run: the note shown, 0 errors | `critic/c74_god42.1942_53542_replay.log` |
| `undo2 41211`, `undo2y 51231` | 0 px; nuke 9 px | 0 px on the map for all ten (my crop) | `critic/c74_undo2_pix.txt` |
| `heropanel 55929` | no pile at Relations' edge | the same | `critic/shots/c74hp_55929_12000_1relations.png` |
| `farConquests 0`, `firstdecl`, `piles` (15 seeds), `pileSides 51` | 10.2, 10.4; 0 of 53, 59; none over 4:1 | the same lines | `critic/c74_farc_0_*.log` |
| `workerDeterminism 54059` | `7733f316` on every arm | `3f823012` on every arm (the history is state) | `critic/c74_wd_54059.log` |
| 7019, 32019, 20 years | `f0783b09`, `37285b1d` | `165d4b75`, `6d77a72d`; the same nations, formations, flipped cells | `critic/c74_seed*_save.log` |
| `nukecount 55503`; `nukeIntercepts 53501` | 2; 2 launches | the same lines | `critic/c74_nc_55503.log` |
| `afterTrack 55601`, `37601` | the leaders opposed 533 days; 0 | 533 days; 0 | `critic/c74_atx_*.log` |
| `x_stage normandyD` (the objection to R110) | the Soviet war behind "+n" in June 1944 | on the row: "Germany +5 ⚔ Soviet Union +3 +50" | `critic/c74_x_stage.normandyD_*.log` |
| Tick, seed 99, alone | 1.884 ms | 1.890 ms; year 1 at the new pin | `critic/c74_tick99.log` |
| Tick, seed 99 with heroes, alone | 1.750 ms | 1.765 ms | `critic/c74_tick99h.log` |
| Frames on the 7019 year-20 world | 58.3 to 60.2 fps | 57.3 to 60.2 fps | `critic/c74_pf_lookfps.log` |
| `loadold` 7019 (the run before's save) | loads, runs a year | loads, runs a year (`d9855177`) | `critic/c74_loadold_7019.log` |
| Objection: ADR-1060 empties occupied France | 146 German formations at peace in Vichy | the same lines | `critic/c74_freewar_1941free.log` |

## Design objections (none blocking, no score lowered)

- **SPEC §"The target answers" and ADR-1107: the row "when seen and not when begun".** Told at a quarter of the men at
  the border, the row is the war's last three days (the median of 96; a day or less in a quarter of them) and not
  its weeks: in run 73's case close to a million Soviet men were on the march from early February, the row is of 8
  March and the war of 14 March. And a massing first counted with half its men there is declared untold (56 of 152
  massed wars). A row when the army sets out would make it the warning R73-N2 asked for
  (`critic/c74_massTold_a.log`, `critic/c74_massTold_b.log`).
- ADR-1105 (the row's order) is recorded as accepted and is not in SPEC, so what it leaves is judged as any other
  behaviour: R74-N3, non-blocking, no score moved.
- **ADR-1106** as decided: a lone nation's war now opens with its army away. Not measured here.
- **ADR-1089's give-up**, **ADR-1060** and **heroes on by default (ADR-1070)** as run 73: not re-measured.

## Ideas from other games (not scored)

- **Hearts of Iron IV** holds a unit's counter where it is until it must move, and fades a change in; a hero's counter
  that slid to its new step over a quarter of a second, and only when its old one was taken, would read as a move and
  not as a flicker.
- **Victoria 3** ranks its wars by the battalions in them: the row by the men engaged would put the fought war first.

## Strengths (verified)

- **Run 73's first and third findings are mended on their own cases:** a played Germany has its three wars as the row
  at every sample where it had none, and two-nation worlds that had no war in ten years have one within four months.
- **A massing can be followed from a line of news to the map:** the ticker's row, clicked, shows the Soviet columns at
  Romania's border six days before the war, and the row is saved, filtered, exported and never told twice in 112.
