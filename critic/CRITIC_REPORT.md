# Critic report, run 78 (focused): Batch 45 (R157 to R162), on `d7b981dd`

## The run

- **Mode: focused.** The spawning message asks for no full run (CRITIC_PROMPT, ADR-915).
  - The last report, run 77 (focused, on `7066d800`), had one blocking issue (R77-B1: UI/UX and stats) and UI/UX at
    7, under its bar of 8.
  - **Scored afresh:**
    - UI/UX (under its bar, and blocked on).
    - Stats and history (blocked on; `historyText.ts` and `timeline.json` changed).
    - Map visuals: `style.css` and `WarBanners.tsx` changed.
  - **Carried** from run 77: diplomacy, emergent dynamics, God Mode, the editor, performance, stability, semantic zoom,
    naval, tanks, aircraft and AI nukes. No file under `src/sim/` changed, and the plain 1938 worlds end at run 77's
    hashes (below).
    - Two carried dimensions were still probed: stability (two monkeys) and naval (`landingFuzz` on 15 new seeds).
    - Diplomacy's R77-N3 was re-run and measured on new seeds.
- **Commit judged:** `d7b981dd4aecef70c0ec4876c361b9fc6b2d8adb`, HEAD at the start (`critic/c78_commit.txt`).
- **Time:** 16:50 to 17:55 by the machine's clock.
- **Carried, not run:** run 77's headless named cases on plain 1938, as "plain 1938 unchanged, carried" (ADR-959):
  - `nukecount`, `topArea`, `piles`, `repulse`, `heroCeiling`, `farConquests`, `massTold` and the rest of
    `c77_jobsAll.txt`.
  - The performance chain.
  - Run 61's bulk landing sets and Malta.
- **Run again:**
  - Run 77's replay cases (`c78_startsJobs.txt`, 40 runs on HEAD's built starts): `timeline.json` is their input, and
    it changed.
  - Run 77's page cases of the carried dimensions (`c78_laneP.sh`): God, the editor, take control, peace, the stage,
    planes, the armoured fight and the tiers. They click through `view.onSelect` and `togglePause`, which this batch
    changed.
- **Left out for time:**
  - Run 77's `heroPop` and `markerPop` (semantic zoom), `markers`, `seaBattlesLook` and `seaclick` page cases. No
    changed file touches them.
  - The 1280 × 720 and 844 × 390 monkeys, and five-minute monkeys (two of three minutes ran).
  - `bannerOwn 1942` and `massSeen 56211`.

### What changed since run 77

- **Size:** 9 commits (one of them run 77's own report). 11 files under `src/`, none of them in `src/sim/`.
  - `git diff --stat 7066d800 HEAD -- src/sim data public/data` lists one file: `data/scenarios/1938h/timeline.json`.
    Five track notes were rewritten in it.
- **Batch 45:**
  - **R157** (R77-B1): the time-lapse names a nation that is dead now, from the stats' dead list. A click on one selects
    nothing.
  - **R158** (R77-N1): resuming the game closes the time-lapse.
  - **R159** (R77-N2): a track row is told only where its note is a bare place.
  - **R160, ADR-1130** (R77-N3): R147 kept, with no code change. The ADR is for the user's review.
  - **R161, ADR-1131:** a banner still for three days yields to a war in battle. The worker sends `lastBattle`. Also a
    fix of R156's death line, which widened an opened banner.
  - **R162:** a side's allies show as "& 2".

### Carry checks (ADR-959)

- **Plain 1938 is unchanged:** the two 20-year saves end at run 77's hashes.
  - 7019: `ab927e1b`, 78 nations (`critic/c78_seed7019_save.log`).
  - 32019: `c3520016`, 76 nations (`critic/c78_seed32019_save.log`).
  - The diff touches nothing under `src/sim/systems/`, `src/sim/ai/` or `src/sim/nav/`, nor `tick.ts` or `sim.ts`.
  - So the plain 1938 sets, the bulk landing sets among them, are "plain 1938 unchanged, carried".
- **"Sim unchanged" does not apply,** because `timeline.json` is in the diff. The replay cases that read it were run
  again (track rows).
- **R77-N3's case repeats exactly:** `warOpening 57211 57213 57215`, three years, gives 14 of 88 with no cell held and
  the defender ahead in 20.3 %, as run 77 (`critic/c78_woCount.log`).

### Setup

- **Builds:**
  - HEAD in `critic/c78_dist`, with the replay's 54 starts built from HEAD (`npm run saves`, 570 s, exit 0;
    `critic/scripts/c78_build.sh`). Served on 127.0.0.1:5397.
  - Run 77's build (`critic/c77_dist`, `7066d800`; `critic/c77_commit.txt`) on 5396, for the cases whose score moves.
- **Browser:** Playwright Chromium on the GPU. New seed family: 63xxx, and 66xxx for `warOpening`.
- **Scripts:**
  - `c78_runNamed.sh` runs `c78_jobs.txt`, then `landingFuzz`.
  - `c78_laneOld.sh` runs the cases on both builds.
  - `c78_woAB.sh` runs the R77-N3 A/B.
  - The page probes are copied from run 77 as `c78_*`.
  - New: `c78_bannerHourly.mjs`, R161 hour by hour.
- **Name collisions, disclosed:**
  - `c78_tlDead.mjs` and `c78_bannerRank.mjs` write fixed file names whatever the build.
  - HEAD's outputs were copied aside before the old-build runs: `critic/c78tld_head_*`, `critic/c78_br_head_*` and
    `critic/shots/c78tld_head_*`.
  - The old build's copies are `c78tld_c77build_*` and `c78_br_c77build_*`; the 32019 world's are `c78tld_32019_*`.
- **`c78_look.mjs` names its shots `c75look_<seed>_*`.** Those of seed 63901 are this run's.
- **Probe failures of mine:**
  - `c78_afterTrack` 55601 and 37601 crashed on a cache folder I had not made (`critic/c78_atcache`), as in run 77. I made
    the folder and ran both again.
  - All three `afterTrack` cases then gave run 77's figures to the war: 207, 222 and 220 wars declared, the same great
    powers and blocs.

### At the end

- Both preview servers (5397, 5396) were stopped by the process ids that held their ports. 5397 was started again for
  the carried page cases and stopped the same way. No probe, sim or browser of mine is left. No worktree.
- `git status` shows nothing new outside `critic/`. The eight untracked PNGs under `docs/evidence/7.132/` were there
  before.
- **Writes outside `critic/` by tools at their defaults:** `npm run sim` to `.cache/runs/`, and `landingFuzz` to
  `.cache/landingFuzz/d7b981dd-63101`.

## Verdict

**No blocking issue.**
- **R77-B1 is fixed on its own case and on a second world.** HEAD names Sweden, Norway and Germany, dead now, on the
  time-lapse's first month, and a click on one selects nothing. Run 77's build, run beside it on the same world, still
  gives an empty tooltip and `selected` 32.
- **Every checker run is clean:**
  - `diploInvariants` and `worldInvariants`: 0 broken on 7 runs.
    - New seeds: 63001, 63003, 63005, 63051, 63053 and 63055.
    - R76-B1's seed 33501.
  - `landingFuzz`: 0 of 90 on new seeds 63101 to 63129, `slowClick` included.

**One score moves: UI/UX goes from 7 to 8.** Each of run 77's three cases for an 8 is met on HEAD. Run 77's build was
run in the same session:
- `bannerRank 57901 150`: 8, 20 and 17 on HEAD.
  - Run 77's build gave 34 in this session. That one run is under the bar of 44.
  - The failure is run 77's own three runs: 51, 33 and 42, against the bar of each under 44.
  - HEAD's three are all under 21, where the old build's spread on that seed was 33 to 53 (runs 77 and 78).
- `tlDead`: "Sweden" with `selected` 0 on HEAD, against an empty tooltip and `selected` 32.
- Resume: the plate closes on HEAD, and stays open over 1938 on run 77's build.

The churn R161 could have brought is not there:
- `bannerFlip`: 8, 4, 5 on HEAD, against 7, 4, 6 on run 77's build.
- `bannerHourly`: 2 changes of the row's set in 480 hours, and no banner that came and went within three hours.

**Every score is now at or over its bar, and there is no blocking issue.** Under ADR-916 the next run is the full one.

**Still open, non-blocking:**
1. **R78-N1:** the residue of the track rows. On the page, "Italy occupies Rome" and a row that begins "the Second
   Vienna Award". Through `trackText` only, "Soviet Union occupies Bagration and Lvov-Sandomierz; Romania".
2. **R78-N2:** R77-N3, kept by ADR-1130. On three new seeds of mine, with R147 the attacker has no man near in 18.8 % of
   wars, against 9.4 % without it. ADR-1094's bar is 15 %.

## Scores

### Map visuals and readability: 8 → **8** (afresh)

**What I tested:**
- `look` on a new seed (63901) at desk size, days 45, 180 and 400, every tier, both looks.
- The opened banners at 1400 × 800 and on a phone (R161's death-line fix).
- The phone's ticker over the opened banners (62903).
- The time-lapse's map on two worlds.

**Evidence for 8:**
- **The fronts read at every tier.** In February 1939 on 63901, at 3,000 m/px over Europe, there are hatched occupied
  land, named capitals and each army's men (`critic/shots/c75look_63901_1600x900_d400_3eur3000.png`).
  - At 100 m/px on the Japanese–Chinese front: named divisions, the line and the orders' arrows
    (`critic/shots/c75look_63901_1600x900_d400_f0_100m.png`).
  - At 30 m/px: the men of each division (`…_f0_30m.png`).
  - 0 page errors (`critic/c78_look_63901_desk.log`).
- **R161's death-line fix holds.** At 1400 × 800 the opened banners stand two rows deep, not three, and the death line
  wraps under its own banner (`critic/shots/c78dt_7019_400_1400x800.png`). On a phone:
  `critic/shots/c78dt_7019_400_390x844.png`.
- **The phone's ticker** stands clear above the opened banners: the ticker at y 575 to 613
  (`critic/c78pt_62903_390x844.json`, `critic/shots/c78pt_62903_390x844_opened.png`).
- **The phone's layout:** 0 controls off the screen and 0 clipped (`critic/c78_p_phone.log`).
- **The time-lapse's map is exact:**
  - `tlMonths 59947`: three months, each with 0 cells unlike the game's own map, and the record whole after a save and
    load (`critic/c78_tlMonths_59947.json`).
  - On 32019 (HEAD's year-20 world), Manchukuo, dead now, is named on its 1938 land (`critic/c78tld_32019_1600x900.json`,
    `critic/shots/c78tld_32019_1600x900_hover.png`).

**Not 9:**
- An opened banner of a short war stands as tall as its neighbour with the death line, half of it empty ("Italy & 3 ⚔
  Turkey & 2" in `critic/shots/c78dt_7019_400_1400x800.png`).
- As before: heroes' names over counters at the world's zoom on a phone (ADR-1111).

### Diplomacy, war, alliance, puppet, revolt depth: 8 → **8** (carried; R77-N3 re-run)

- **Carried:** plain 1938 is unchanged (above). The checkers are 0 broken on the new seeds 63001, 63003 and 63005, and on
  33501.
- **R77-N3, kept by ADR-1130,** which is the builder's decision for the user's review, so it is judged here.
  - **The case on HEAD** (sim unchanged) repeats run 77: 57211 to 57215 give 14 of 88 with no cell held, the defender
    ahead in 20.3 %.
  - **ADR-1130's claim on three new seeds of mine** (66211, 66213, 66215; three years; `critic/scripts/c78_woAB.sh`,
    `critic/c78_woCount.log`):

    | measure (ADR-1094's bar) | HEAD | R147 off (`--lift-far`) |
    |---|---|---|
    | no cell held at day 30 | 10 of 92 (10.9 %) | 10 of 96 (10.4 %) |
    | attacker with no man near (bar 15 %) | **13 of 69 (18.8 %)** | 6 of 64 (9.4 %) |
    | defender ahead at day 30 (bar 15 %) | **12 of 69 (17.4 %)** | 9 of 64 (14.1 %) |

  - **What this shows:**
    - The bare openings are as many with R147 as without it. That bears out ADR-1130's main finding.
    - On these three seeds HEAD breaks both of ADR-1094's bars, and R147 off breaks neither. ADR-1130 says the bars hold
      on its nine seeds; they do not on mine.
    - Three seeds are noise (run 77 saw 5 to 14 % a set either way), so this moves no score.
    - Pooled with run 77's fifteen seeds, the defender is ahead in 60 of 382 (15.7 %, bar 15 %).
  - It is filed as R78-N2.
  - **Diplomacy stays at 8, at its limit as in run 77:** the code is the same, and only the pool of seeds grew.

### Emergent world dynamics: 8 → **8** (carried)

Plain 1938 is unchanged: 7019 and 32019 end at run 77's hashes with 78 and 76 nations.

### God Mode: 8 → **8** (carried)

No changed file touches it. Run again on HEAD, each with exit 0 and 0 page errors:
- `a_god_nuke 63917`, with the strikes on Paris and London (`critic/c78_a_63917.json`).
- `q_god_tools 63919`.
- `undo2 41211` and `undo2y 51231`: each of the five tools undone (`critic/c78_undo2*.log`).
- `godpeace 1942 JAP` and `takescore 1942 GER`.

### Editor and scenarios: 8 → **8** (carried)

No changed file touches it. Run again all the same:
- **The replay's starts**, built from HEAD with the new `timeline.json`. Run 77's 40 replay cases were run on them; the
  side-by-side lines are in `critic/c78_startsCmp.txt` (`sh critic/scripts/c78_startsCmp.sh`).
  - The free starts 1942 to 1991 (13 runs): 0 broken lines each, as in run 77.
  - `blocend 54611`: 0 bloc lines broken. `track 58301`: 0 broken.
  - `capsurvey 1975`: 2 of 154, as in run 77.
  - Run 77's 1975 start loads on HEAD (`critic/c78_oldsave_1975.log`).
- **The page:**
  - `g_editor 58921`, `x_stage normandyD`, `god42 1942 replay`: exit 0, 0 page errors.
  - `x_continue 58415`: the same failure to find Continue as in run 77's log, not judged.

### Stats and history: 8 → **8** (afresh)

**Evidence for 8:**
- **R77-N2 fixed on its own probe.**
  - `npx tsx critic/scripts/c78_trackTexts.ts` (`critic/c78_trackTexts.log`): 67 rows told, 36 kept as written, 65 bare.
  - Of run 77's 41 odd rows, 0 are produced: `cut -f5 critic/c78_trackTexts.log | grep -Fxf critic/c77_trackTexts_odd.txt`
    is empty.
- **On the page:**
  - 1941 (365 days): no "occupies The" and no "line of 1941" (`critic/c78tr_1941_1600x900.json`). The four lines read
    "Barbarossa: the German front" (`critic/shots/c78tr_1941_1600x900_Barbarossa.png`).
  - 1942 (400 days): "Kerch retaken" and "Buna and Gona retaken" stand as written
    (`critic/shots/c78tr_1942_1600x900_Kerch.png`). "Japan occupies the Netherlands Indies" now has a small "the".
  - The rows of 1943 and 1944: `critic/c78tr_1943_1600x900.json`, `critic/c78tr_1944_1600x900.json`.
- **R77-B1 fixed** (see UI/UX).
- **Run 77's late cases:**
  - `histPlace 59961`: 11 of 11 kinds of row fly to their place on the canvas (`critic/c78hp_59961_1600x900.json`).
  - `tlMore cell 59943`: still "Norway", with Norway's panel (`critic/c78tm_cell_59943.json`).

**Not 9 (R78-N1):**
- **"4 June 1944 Italy occupies Rome"** on the page. Rome fell to the Allies; the row makes Italy the taker of its own
  capital (`critic/shots/c78tr_1943_1600x900_Rome.png`).
- **"30 August 1940 the Second Vienna Award to Hungary"** begins with a small letter on the 1941 page
  (`critic/c78tr_1941_1600x900.json`).
- **Through `trackText` only** (the page shows that date's other row, which has a colon):
  - "Soviet Union occupies Bagration and Lvov-Sandomierz; Romania". The semicolon passes R159's bare-place test, and
    Bagration is an operation, not a place.
  - "Romania joins the alliance" and eight more name no alliance (`critic/c78_trackTexts.log`).
- **Rows that repeat:**
  - "Barbarossa: the German front" four times on four dates.
  - On 31 December 1942: "Uranus and Little Saturn: the Red Army's advance" beside "Uranus and Little Saturn: west of
    the line" (`critic/c78tr_1942_1600x900.json`).
- Still bare: "Italy's zone", "Egypt clear", "The Soviet zone".

### UI/UX and polish: 7 → **8** (afresh)

**The cases run 77 named for an 8, on both builds in the same session:**

| case | run 77's build (`7066d800`) | HEAD | the bar |
|---|---|---|---|
| `bannerRank 57901 150`: quiet banner-days with a war in battle behind "+n" | 34 here (`critic/c78_br_c77build_57901.log`); run 77: 51, 33, 42 | **8, 20, 17** (`critic/c78_br_57901_a.log`, `_b`, `_c`) | three runs each under 44 |
| `tlDead` on run 76's 7019 world, at January 1938: the tooltip on Sweden | empty | **"Sweden"**; Norway and Germany named too | "Sweden" |
| … a click | `selected` 32, no panel | **`selected` 0** | 0 or a panel |
| … the bar's Resume | the plate stays open over 1938, 96 h run | **the plate closes; the map is 1957's** | `ranHours` 0 or the plate closed |

- Files for the `tlDead` rows: `critic/c78tld_c77build_1600x900.json`, `critic/c78tld_head_1600x900.json`,
  `critic/shots/c78tld_head_1600x900_hover.png`, `critic/shots/c78tld_head_1600x900_resume.png`.
- **The same at phone size** (`critic/c78tld_head_390x844.json`):
  - The tooltip "Sweden"; Norway and Sweden named at the control points.
  - `selected` 0, and the plate closed on Resume.
- **On a second world** (HEAD's 32019, year 20; `critic/c78tld_32019_1600x900.json`):
  - "Manchukuo" and "Xinjiang", dead now, are named. Soviet Union, alive, is named too.
  - `selected` 0, and the plate closed on Resume.
- **New seed:** `bannerRank 63901 150` gives 6 (`critic/c78_br_63901.log`).
- **R161 brings no churn:**
  - `bannerFlip` (60 s at ×5), changes of the row and of the banner under a resting cursor:

    | seed | HEAD | run 77's build |
    |---|---|---|
    | 57901 | 8; 1 | 7; 1 |
    | 58901 | 4; 0 | 4; 0 |
    | 57903 | 5; 2 | 6; 2 |

    Files: `critic/c78_bf_head_*.log`, `critic/c78_bf_c77build_*.log`.
  - Hour by hour (`c78_bannerHourly.mjs 57901 100 480`): the row's set changed 2 times in 480 hours, 0 of them back
    within three hours (`critic/c78_bh_57901.log`).
- **R162:** banners read "Nationalist Spain ⚔ Portugal & 2 +32 ☠"; the allies and the score no longer both carry a plus
  (`critic/c78_dh_59955.log`).
- **Run 77's other UI cases hold:**
  - `dirHand 59955`: 0 cuts after every act on desk size (`critic/c78_dh_59955.log`). On a phone, 0 cuts after the
    ticker and banner acts (`critic/c78_dh_59955_phone.log`).
  - `timeLapse 59941` (desk) and `59945` (phone): `ranUnderLapse` 0 (`critic/c78_tl_59941_desk.log`,
    `critic/c78_tl_59945_phone.log`).
- **Monkeys:** 63803 (1600 × 900, 3 min) and 63811 (390 × 844 touch, 3 min).
  - 0 page errors. The game was running at the end, neither hung nor left (`critic/c78_monkey_63803.log`,
    `critic/c78_monkey_63811_phone.log`).
  - The game stood paused through most of both: 83 ticks on the desk, and on the phone the tick went from 22 to 18 (a
    load or an undo). They test the controls, not a running world.
- **R161 after a page save and load** (`c78_bannerLoad.mjs 57901 150`, with `LOAD=1` and without):
  - The row is the same before and after the load, and 0 changes in the next 72 hours, as in the run with no load
    (`critic/c78_bl_load150.log`, `critic/c78_bl_noload150.log`).
  - Not stressed: the case had no war fought one or two days before the load. Such a war has no `lastBattle` after a load
    and counts as still at once. Not tested.
- **R157 was tested at step 0 (January 1938) only,** not at a mid-record month.
- **Run 77's page cases of the carried dimensions, on HEAD:**
  - Exit 0 and 0 page errors for all 15 (`critic/c78_laneP*.out`, `critic/c78_*.log`).
  - `x_continue 58415` cannot find the title's Continue after leaving, as in run 77's own log
    (`critic/c78_x_continue.58415_40_GER_60.log`). Run 77 did not judge it. It is not judged here either.
  - The first `c_battle 63915` timed out loading the page beside five headless sims. Run again alone: exit 0.

**Not 9:**
- **A dead nation is named exactly as a living one** on the time-lapse ("Sweden"), with no sign that it is gone. A click
  on it does nothing, with no word why.
- **At the first month the plate says "from January 1938" and "January 1938" side by side**
  (`critic/shots/c78tld_head_1600x900_hover.png`).
- **`dirHand`'s History act** still cannot be clicked on a phone (`history-go` not shown). Not judged, as in run 77.

### Performance: 8 → **8** (carried)

No sim file changed. The worker's one change adds a field per war to the stats.

### Stability: 8 → **8** (carried)

Probed all the same:
- Two monkeys, 0 errors (above).
- Run 76's year-20 save loaded on HEAD plays its 240-month time-lapse (`critic/c78tld_head_1600x900.json`).
- The 20-year runs repeat run 77's hashes.

### Semantic zoom to unit level: 8 → **8** (carried)

No changed file touches it. Every tier was drawn in `look 63901` (30 to 14,000 m/px, `critic/shots/c75look_63901_*`).

### Naval warfare: 8 → **8** (carried)

- `landingFuzz --seeds 15 --first 63101`: **0 of 90** broken, `slowClick` included (`critic/c78_landingFuzz.log`).
- The bulk sets and Malta: plain 1938 unchanged, carried.

### Tanks: 8 → **8** (carried)

### Aircraft: 8 → **8** (carried)

### AI nuclear use: 8 → **8** (carried)

## Blocking issues

None.

## Non-blocking issues (prioritised)

1. **R78-N2 (diplomacy; R77-N3, ADR-1130): with R147, the attacker has no man near more often on new seeds.**
   - **The case:** `sh critic/scripts/c78_woAB.sh`.
     - HEAD: attacker with no man near 13 of 69 (18.8 %), defender ahead 12 of 69 (17.4 %).
     - R147 off: 9.4 % and 14.1 %.
     - The bare openings are the same (10.9 % against 10.4 %).
   - Over 3 seeds this is noise-sized, but it is against ADR-1130's "ADR-1094's bars hold on the new seeds".
   - **Seen settled when:** the nine new seeds of ADR-1130, with mine added, give the attacker bar under 15 % with R147,
     by `node critic/scripts/c77_woCount.mjs`.
2. **R78-N1 (stats; R159): the track rows' residue.**
   - On the page: "Italy occupies Rome" (4 June 1944), and "the Second Vienna Award to Hungary" with a small first
     letter.
   - Through `trackText` only, not seen on the page: "Soviet Union occupies Bagration and Lvov-Sandomierz; Romania" (a
     semicolon passes the bare-place test), and nine "… joins the alliance" rows that name no alliance.
   - **Seen fixed when:** `c78_trackTexts.ts` tells none of these, and `ROWS=Rome node critic/scripts/c78_trackRows.mjs
     1943 600` shows Rome's row with its taker or as written.
3. **The time-lapse:**
   - It names a gone nation with no mark that it is gone.
   - At step 0 the plate shows the month twice.
4. **Small:**
   - A short war's opened banner is as tall as a neighbour with the death line.
   - `slowClick` (ADR-914) is 0 of 90 on new seeds.

## Run 77's cases re-run

| Run 77 case | Run 77 (`7066d800`) | Run 78 (`d7b981dd`) | Evidence |
|---|---|---|---|
| R77-B1 `tlDead` 7019 (desk, phone) | tooltip "", `selected` 32 | **fixed**: "Sweden", 0; run 77's build beside it: "", 32 | `critic/c78tld_head_*.json`, `critic/c78tld_c77build_1600x900.json` |
| R77-N1 Resume under the plate | the plate stays, 96 h | **fixed**: the plate closes (run 77's build: stays) | the same |
| R77-N2 `c77_trackTexts.ts`; the 1941 and 1942 pages | 31 wrong, 8 "The" | **fixed** for those 41 (0 produced); residue R78-N1 | `critic/c78_trackTexts.log`, `critic/c78tr_*.json` |
| R77-N3 `warOpening 57211…` | 14 of 88, 20.3 % | the same (sim unchanged); kept by ADR-1130; R78-N2 | `critic/c78_woCount.log` |
| `bannerRank 57901 150` | 51, 33, 42 | **8, 20, 17** (run 77's build: 34) | `critic/c78_br_*.log` |
| `bannerFlip` 57901, 58901, 57903 | 7, 4, 6; 1, 0, 2 | 8, 4, 5; 1, 0, 2 (run 77's build: 7, 4, 6; 1, 0, 2) | `critic/c78_bf_*.log` |
| Small: "+2 +32" banner | both pluses | "& 2 +32" | `critic/c78_dh_59955.log` |
| `tlMore cell 59943` | "Norway" | "Norway" | `critic/c78tm_cell_59943.json` |
| `tlMonths 59947`, `histPlace 59961` | 0 unlike; 11 of 11 | 0 unlike (3 months); 11 of 11 | `critic/c78_tlMonths_59947.json`, `critic/c78hp_59961_1600x900.json` |
| `dirHand 59955` (desk, phone) | 0 cuts | 0 cuts | `critic/c78_dh_59955*.log` |
| `timeLapse 59941`, `59945` | `ranUnderLapse` 0 | 0 | `critic/c78_tl_*.log` |
| `phoneTicker 62903`, `p_phone` | clear; 0 off | clear; 0 off | `critic/c78pt_62903_390x844.json`, `critic/c78_p_phone.log` |
| `diploInvariants 33501` | 0 broken | 0 broken | `critic/c78_diploinv_33501s.log` |
| 7019 and 32019, twenty years | `ab927e1b`, `c3520016` | the same | `critic/c78_seed*_save.log` |
| `landingFuzz` (new seeds) | 0 of 90 | 0 of 90 | `critic/c78_landingFuzz.log` |
| Run 77's 40 replay cases (free starts, `freewar`, `saveload`, `blocend`, `oldsave`, `menloss`, `afterTrack`) | 0 broken lines | 0 broken lines; the same figures where they are counts | `critic/c78_startsCmp.txt` |
| Run 77's God, editor, take-control, stage, planes, armour and tiers page cases (15) | exit 0 | exit 0, 0 page errors | `critic/c78_laneP*.out` |
| Run 77's other headless plain-1938 cases, the bulk sets, Malta, the performance chain | | plain 1938 unchanged, carried | |
| Run 77's `heroPop`, `markerPop`, `markers`, `seaBattlesLook`, `seaclick` | | left out for time (no changed file touches them) | |

## Design objections (none blocking, no score lowered)

- **ADR-1130 is "for the user's review".** The rule (R147) stays at the cost run 77 named. The builder's own trace from one
  saved state (22 of 22 bare openings declared the same with R147 off) is a fair answer to "R147 causes them". My three
  seeds do not bear out its line on ADR-1094's bars (R78-N2).

## Ideas from other games (not scored)

- **Ages of Conflict's time-lapse** writes the year's names on the map, a gone nation's too. A small "(gone)" in the
  tooltip would say as much here.
- **Hearts of Iron IV's event log** keeps the event's own sentence and puts the actor in a column. That would settle
  "Italy occupies Rome".

## Strengths (verified)

- **Every case run 77 named is met on its own probe.** Run 77's build, run in the same session, still fails the time-lapse
  ones:
  - `tlDead`: "" on the old build against "Sweden" on HEAD.
  - The plate on Resume: open on the old build against closed on HEAD.
  - `bannerRank`: 8, 20 and 17 on HEAD, against 34 on the old build here, and 51, 33 and 42 in run 77.
- **R161 cut the quiet banners without churn.** `bannerFlip` is the same on both builds (8, 4, 5 against 7, 4, 6), and
  the row's set changed 2 times in 480 hours.
