# Critic report, run 77 (focused): Batch 44 (R145 to R156), on `7066d800`

## The run

- **Mode: focused.** The spawning message asks for no full run (CRITIC_PROMPT, ADR-915).
  - The last report, run 76 (focused, on `c2440872`), had one blocking issue (R76-B1, diplomacy) and UI/UX under its
    bar (7).
  - **Scored afresh:**
    - Diplomacy (blocked on) and UI/UX (under its bar).
    - Those the changed files touch:
      - `src/sim/ai/` → emergent dynamics.
      - `MapView`, `style.css` → map visuals.
      - `historyRows`, `historyText`, `TimeLapseBar` → stats and history.
      - `counters.ts` → semantic zoom.
      - The sim change → performance, stability, naval: the bulk landing sets are due (ADR-917).
  - **Carried** from run 76: God Mode, the editor, tanks, aircraft, AI nukes. No changed file touches them. Their named
    cases were run again all the same.
- **Commit judged:** `7066d800140c6f5a6dd6c22b8ae8df3844b10f0a`, HEAD at the start (`critic/c77_commit.txt`).
- **Time:** 13:17 to 15:45, about two and a half hours. Over the hour a focused run aims for: the sim changed, so the bulk landing sets (717
  runs) and Malta were due, and the performance chain runs alone, last.
- **Left out for time:**
  - Run 75's page cases that run 76 had already left out (listed in run 76's report). Not run again here either.
  - Run 76's page cases `rg_relations 59931`, `an_ainuke 58505`, `tlMore replay 1975` and `tlMore random`, and the
    headless `warAt100 7019`. `tlMonths 59947` and `histPlace 59961` were run, late, after the advisor's review.
  - The 1280 × 720 and 844 × 390 monkeys. One monkey ran at desk size, one on a phone.
  - The undo's pixel comparison.

### What changed since run 76

- **Size:** 24 commits; 18 files under `src/`, 3 of them in the sim (`ai/massing.ts`, `ai/seaLift.ts`, `ai/strategic.ts`).
- **Batch 44:**
  - **R145, ADR-1125** (R76-B1): the lift is asked of the war's defender, and of a massing's end. A puppet's revolt and a
    revolt's war of independence are taken out of the `lift` checker.
  - **R146** (R76-N1): the page's links to a place or a fight hand the director's camera back.
  - **R147, ADR-1126** (R76-N5): no target across the sea after one is refused for want of a lift.
  - **R148, ADR-1127:** a held banner gone quiet yields to a war fought.
  - **R149** (R76-N2): the time-lapse is the month it shows: the tooltip and click of that month, Space its own, Escape
    closes it.
  - **R150** (R76-N3): the director flies clear of an open panel.
  - **R151** (R76-N4): the plate says where the record begins.
  - **R152** (R76-N6): a hero's counter eases to its place.
  - **R153:** the ticker is hidden under the time-lapse's plate.
  - **R154, ADR-1128:** a massing told and then called off bars its target for a year. The pin moved
    (`1aabdc7e` → `f311b292`).
  - **R155, ADR-1129:** the small worlds at peace are kept by decision.
  - **R156:** track rows say what happened; a war to the death is marked; the phone's ticker over the opened banners;
    the first cue in a phone's words; the main menu asks first.

### Due because the sim changed

- `git diff --stat c2440872 HEAD -- src/sim data public/data` lists 3 files, all under `src/sim/ai/`.
- So plain 1938 is not carried: the 20-year worlds differ.
  - 7019 ends at `ab927e1b` with 78 nations (run 76: `4931216a`, 73).
  - 32019 ends at `c3520016` with 76 (run 76: `deec2aee`, 77).
- The bulk sets and Malta were run again.
- Where a figure moved, I ran the same case on run 76's build (`critic/c76_dist`, kept on disk, served on 5398) at the
  same time as HEAD.

### Setup

- **Builds:**
  - HEAD's build is in `critic/c77_dist`. The replay's 54 starts were built from HEAD (`npm run saves`, 690 s, exit 0)
    and copied in (`critic/scripts/c77_build.sh`). Served on 127.0.0.1:5399.
  - Run 76's build (`critic/c76_dist`, `c2440872`) on 5398. No worktree was needed.
- **Browser:** Playwright Chromium on the GPU.
- **New seed family:** 62xxx.
- **Chains:**
  - `c77_runNamed.sh`: 135 headless cases six at a time (`c77_jobsAll.txt`: run 76's named cases plus the 62xxx
    seeds), then `landingFuzz --seeds 15 --first 62101`.
  - `c77_chainS.sh`: the cases that use the built years.
  - `c77_chainBulk.sh`: run 61's bulk sets and Malta.
  - The page lanes:
    - `c77_laneF`: run 76's page findings.
    - `c77_laneB`: banners, on both builds.
    - `c77_laneC`: markers, the editor's nuke, monkeys.
    - `c77_laneD`: God, the tiers, the sea.
    - `c77_laneE`: run 76's named page cases.
    - `c77_laneZ`: the heroes' counters, on both builds.
  - `c77_chainPerf.sh`: alone, last. `landingRows all` runs first in it, alone, for memory (below).
- **New probes:**
  - `c77_tlDead.mjs`: the time-lapse on a nation dead now, and the bar's Resume under the plate.
  - `c77_trackTexts.ts` and `c77_trackRows.mjs`: R156's track rows, through the game's own `trackText`, and on the
    replay's page.
  - `c77_phoneTicker.mjs`: R156, the phone's ticker over the opened banners.
  - `c77_dirFps.mjs`: R150's cost.
  - `c77_woAB.sh`: R147 switched off on HEAD (`--lift-far`), on run 76's war-opening seeds.

### Probe failures of mine, disclosed

- **`c77_afterTrack` crashed again** on a cache folder I had not made (`critic/c77_atcache`), as in run 76. I made it and
  ran 55601 again.
- **`landingRows all` was stopped on purpose** while the lanes ran (`critic/scripts/c77_guardRows.ps1`; 4.2 GB free at
  13:31). It was run again alone at the head of the performance chain.
- **`dirHand` on a phone:** its History act cannot find `history-go`, as in run 76. The phone's "history" line is no
  result (`critic/c77_dh_59955_phone.log`).
- **The first `tlDead` run** moved the mouse without logging where it was. It was run again with the point, the cell
  under it and six control points logged; only that run is cited.
- **`c77_look.mjs`** still names its shots `c75look_<seed>_*`. Those of seeds 62901 and 62903 are this run's.
- **A loaded machine:** the lanes ran beside six to twelve headless sims, with the processor at 73 to 97 %. Frame figures
  are taken only from the performance chain, which ran alone.

### At the end

- My preview servers (5399, 5398) were stopped by the process ids that held their ports. 5399 was started again for the
  two late cases and stopped the same way. A `vite preview` on 4174 that is
  not mine was left.
- The memory guard ended by itself when the named chain ended (`critic/c77_guardRows.log`).
- No probe or browser of mine is left. There is no worktree (`git worktree list`: main only).
- The three copied scripts this run did not use were removed. The `c77_*` files left in `critic/scripts/` are the ones
  run, or the ones they call.
- `git status` shows nothing new outside `critic/`. The eight untracked PNGs under `docs/evidence/7.132/` were there
  before.
- **Writes outside `critic/` by tools at their defaults:**
  - `npm run sim` to `.cache/runs/`;
  - `landingFuzz` to `.cache/landingFuzz/`;
  - `trackFronts` to `.cache/trackFronts_*.json`.
- **Memory:** 4.2 GB free at 13:31. `landingRows all` was held back to run alone (above); nothing was reaped.

## Verdict

**One blocking issue: R77-B1, the time-lapse does not name the month's owner when that nation is dead now.**
- SPEC (R149) claims: "The tooltip and a click name the month's owner".
- On run 76's 7019 world loaded on HEAD, at January 1938, it fails for 35 of the nations on the map, Germany among them:
  - the tooltip is empty;
  - a click selects the dead nation with no panel.
- Run 76's "seen fixed when" for R76-N2 allowed "(or none)", and R149 meets that bar for a nation alive now. But the brief
  makes a contradicted claimed feature blocking, and SPEC claims the whole of it.
- Why it matters: on a map with no names, the gone nations are the ones a watcher hovers to ask about.

**R76-B1 is fixed.** The `lift` checker reports 0 broken on its two cases:
- `diploInvariants 33501 scenario 1825` (2 broken in run 76).
- `diploInvariants 58011 random 3650 --heroes` (3 broken in run 76).

The other checker runs are clean too:
- All 44 `diploInvariants` and `worldInvariants` runs: 0 broken. That is 14 on new 62xxx seeds, six of them on run 76's
  lift seeds 59013 to 59023, and run 76's 24 named runs.
- `landingFuzz` on 15 new seeds: 0 of 90.

**Run 76's non-blocking findings are fixed on their own probes:**
- R76-N1, R76-N3, R76-N4, R76-N5 and R76-N6.
- R76-N2 for Space and Escape, and for a nation living now.
- The massing told twice within the year (small issue 9).

**No score moves.** UI/UX stays at 7. Its three cases for an 8:
- `dirHand`: met. 0 cuts after each act.
- `timeLapse`: met. `ranUnderLapse` 0.
- `bannerRank 57901 150`, three runs each under 44: not met. 51, 33 and 42. One run is also over the user's bar of 50.

**Each fix brings a new hole a player meets:**
1. **R77-B1, above.** Also, the next Escape is spent clearing the invisible selection.
2. **R77-N1: the bar's Resume button runs the game under the time-lapse.** 96 hours ran in 4 s on both builds. The
   ticker is now hidden while the plate is open, so the news of those hours is never seen.
3. **R77-N2: R156's track rows are told wrongly.**
   - On the page: "Germany occupies The line of 1941-12-01", "Australia occupies Buna and Gona retaken", "Soviet Union
     occupies Kerch retaken".
   - Through the game's `trackText`: 31 of the 114 occupy, objective and nuke rows R156 tells are wrong English, and 8
     more have a capital "The" in mid-sentence.
3. **R77-N3: R147 doubles the war openings with nothing taken, on run 76's own seeds.**
   - On run 76's nine seeds: 14 of 276 (5.1 %) become 25 of 256 (9.8 %).
   - With R147 switched off on HEAD (`--lift-far`), run 76's figures come back to the war.
   - On 57211 to 57215, the defender is ahead at day 30 in 20.3 % of wars. ADR-1094's bar is 15 %.

## Scores

### Map visuals and readability: 8 → **8** (afresh)

**What I tested:**
- `look` on two new seeds, at desk and phone size (62901, 62903).
- Run 76's `markers` cases (58951, 56951).
- The time-lapse's map.
- The phone's ticker over the opened banners.

**Evidence for 8:**
- **The fronts read at every tier on a new seed.** At 100 m/px around Reșița (62901, day 180) there are named divisions,
  hatched occupied land and the orders' arrows across the line
  (`critic/shots/c75look_62901_1600x900_d180_f0_100m.png`). 0 page errors at both sizes
  (`critic/c77_look_62901_desk.log`, `critic/c77_look_62903_phone.log`).
- **Markers:**
  - On 56951, pairs on one another are the same as run 76's to the figure: 3, 1, 1, 0 / 10, 3, 2, 2 / 12, 7, 6, 2
    (`critic/c77_mk_head_desk.log`).
  - On 58951 at day 30: 10, 6, 3, 2, 2 pairs from 1,800 to 600 m/px (run 76: 11, 9, 10, 5, 1)
    (`critic/c77_mk_headn_desk.log`).
- **The phone's ticker stands above the opened banners** (R156), clear of them and of the bars: the ticker's row at
  y 562–601, the banners from 605 (`critic/c77pt_62903_390x844.json`, `critic/shots/c77pt_62903_390x844_opened.png`).
- **A war to the death is marked on the phone** with its words when the banners are opened
  (`critic/shots/c77dt_7019_400_390x844.png`).

**Not 9:**
- **On the time-lapse's map** a nation dead now has no name, and none on hover (R77-B1).
- As before: heroes' names over Europe at the world's zoom on a phone (ADR-1111), for example
  `critic/shots/c77pt_62903_390x844_opened.png`.

### Diplomacy, war, alliance, puppet, revolt depth: 8 → **8** (afresh; R76-B1 fixed)

**Evidence for 8:**
- **R76-B1 fixed.**
  - 33501: 0 broken (`critic/c77_diploinv_33501s.log`).
  - 58011: 0 broken (`critic/c77_diploinv_58011rh_10y.log`).
  - ADR-1125 takes a puppet's revolt and a revolt's war of independence out of the checker. That is a decision with a
    reason (a revolt is no choice of target), and the rest of the rule is now asked at a massing's end too.
- **Every checker, 0 broken, 44 runs:**
  - `diploInvariants`:
    - New seeds: 62001, 62003, 62005, 62007, 62013, 62015 (five years); 62009 and 62011 (ten years).
    - Run 76's lift seeds: 59013 to 59023.
    - Named: 57001, 58001 to 58013.
  - `worldInvariants` on 62051 to 62057 and run 76's 58051 to 58065, 36009, 57051.
  - Logs: `critic/c77_diploinv_*.log`, `critic/c77_wi_*.log`.
- **R76-N5 fixed (R147).** `c77_firstdecl.ts 60` finds 0 declarations over 6,000 km in the first 60 days:
  - 0 of 49 on 39821 to 39839 and 0 of 55 on 55821 to 55839 (run 76: 2 and 4).
  - 0 of 41 on the new 62821 to 62839.
  - Files: `critic/c77_firstdecl*.log`.
- **Small issue 9 fixed (R154).** A massing told again after its call-off:
  - 0 on run 76's fifteen 1938 seeds and on 57613, the builder's case.
  - Twice-told: 0.
  - "CALLED OFF BUT AT WAR": 0.
  - The one told again, 59611's Soviet Union on Turkey, is 449 days after its call-off, past the year's bar.
  - Files: `critic/c77_massTold_*.log`.
- **Save and load keep the massings told** (`critic/c77_massTold_sl.log`: the same hashes, the same rows).
- **The same-seed lines that did not move:**
  - `piles` on fifteen seeds: one war over 4:1 on day 365, as in run 76, though another war: 39145's GER v ENG 2:13
    (run 76: SOV v JAP 2:10). `diploInvariants 39145 scenario 365` gives 0 broken (`critic/c77_diploinv_39145s_1y.log`).
    So the pile rule held at the declaration, and England's side grew after it.
  - `repulse` 55071 and 58073: 0 broken.
  - `blocend`, `heldfree`, `clampend`, `saveload 1942 god`: the same kinds of lines (`critic/c77_*.log`).

**Not 9:**
- **R77-N3: R147 brings back the war openings with nothing taken.**
  - Run 76's three warOpening sets, three years, by `node critic/scripts/c77_woCount.mjs`. Rows 1 and 3 are on the
    same seeds.

  | seeds | run 76 (`c2440872`) | HEAD | HEAD, R147 off (`--lift-far`) |
  |---|---|---|---|
  | 58211, 58213, 58215: no cell held at day 30 | 3 of 96 | **5 of 87** | 3 of 96 |
  | 56211, 56213, 56215 | 4 of 85 | **6 of 81** | 4 of 85 |
  | 57211, 57213, 57215 | 7 of 95 | **14 of 88** | 7 of 96 |
  | 57211…: the defender ahead at day 30 (ADR-1094's bar 15 %) | 15.5 % | **20.3 %** | 15.5 % |
  | 59211… (run 76's new) | 11 of 102 | 12 of 96 | |
  | 62211… (new) | | 9 of 91 | |

  - HEAD with R147 off gives run 76's figures to the war, so R147 alone is the cause
    (`critic/c77_woFar*.json`, `critic/scripts/c77_woAB.sh`).
  - Over run 76's twelve seeds (58, 56, 57 and 59 sets) HEAD has:
    - no cell held 37 of 352 (10.5 %; run 76 6.6 %);
    - the attacker with no man near 29 of 248 (11.7 %, bar 15 %);
    - the defender ahead 36 of 248 (14.5 %, bar 15 %).
  - ADR-1094's attacker bar holds by 3.3 points and its defender bar by half a point.
  - With the new 62 set added, the defender is ahead in 48 of 313 (15.3 %), over that bar.
  - The bare 10.5 % is over the 10 % bar that ADR-1126 cites for R139's AT, which was measured on its own five seeds.
  - ADR-1126 named this cost and left it to me to judge. Japan's far wars are gone, and the bare openings run 75's R75-N5
    had cured are half back.
- **Why diplomacy still holds 8:**
  - Every rule checker is clean on 44 runs, R76-B1 included.
  - The first wars across half the world are gone on every seed.
  - The massing words now keep to the year.
  - The openings are back between run 75's and run 76's figures on the same seeds, not below run 75's.
  - This is the limit: one more step back on R75-N5's figures moves the score.

### Emergent world dynamics: 8 → **8** (afresh)

**Evidence for 8:**
- **Twenty years headless:**
  - Plain 1938: 7019 and 32019 end with 78 and 76 nations.
  - With heroes: 7019 (80 nations, 12 heroes alive), 58019 and 62019 (new).
  - Files: `critic/c77_seed*_save.log`, `critic/c77_hero_*.log`.
- **The leaders' order:** `topArea 62097` (25 years, new): the first three changed 8 times. 58097: 3 (run 76: 7, run 75:
  4) (`critic/c77_toparea_*.log`).
- **Small worlds:** every one of run 76's six-world sets gives the same first-war day and war count as run 76. Sixty
  nations (55431): 83 wars (90). Files: `critic/c77_few*.log`.
- **Wars after the track** (`afterTrack`, ten years): 207 and 222 on 55601 and 37601 (run 76: 203 and 219)
  (`critic/c77_atx_*.log`).
- **The director** on desk size at ×5 with History open: 24 cuts in two minutes, 45 rows handed and 45 seen, every one
  clear of the panel (`critic/c77dr_head_59951_1600x900_history.json`).

**Not 9:**
- **Worlds that stand still**, now kept by ADR-1129 (the builder's decision, not the user's, so judged here):
  - Run 76's five two-nation worlds and 55404 have no war in ten years.
  - So do the new 62421, 62424 and 62426: three of six new two-nation worlds (`critic/c77_few2_62.log`).
- **The blocs' leaders are never at war** in ten years after the track on 55601 and 37601 (0 days), as in run 76.
- **At top speed the director falls behind:** 84 of 135 rows seen (62 %) in 966 days. That run was beside the bulk
  chain; run 76 had 84 of 109 alone. Not compared.
- **Far capitals** are back near run 75's count: 100 taken far in two years on ten seeds (run 76: 78, run 75: 109)
  (`critic/c77_farc_*.log`). Not a defect.

### God Mode: 8 → **8** (carried)

Run again on HEAD, 0 errors each:
- `q_god_tools 62919`: a revolt, a new nation and a town founded.
- `a_god_nuke 62917`: the strikes on Paris and London, the charts (`critic/c77_a_62917.json`).
- `undo2 41211`, `undo2y 51231`, `godpeace 1942 JAP`, `god42 1942 replay`.
  - The God peace shows "History's course ended at your first intervention", and History's track rows now say who did
    it ("Japan occupies Northern Malaya": `critic/shots/c77gp_1942_JAP_UnitedStates_1600x900_2history.png`).

### Editor and scenarios: 8 → **8** (carried)

- `g_editor 58921`: Poland's bomber stopped short near Berlin on 17 February, then the strike of the 18th
  (`critic/c77_g_editor.58921.log`), as run 76.
- `x_continue 58415`, `x_stage normandyD`: exit 0.
- The replay's free starts 1942 to 1991: 0 broken lines (`critic/c77_free_*_free.log`).
- `oldsave 1975`: run 76's 1975 start on HEAD (`critic/c77_oldsave_1975.log`).

### Stats and history: 8 → **8** (afresh)

**Evidence for 8:**
- **R76-N4 fixed (R151).** Run 75's 7019 save, loaded and run 40 days, gives a plate that says "from January 1958"
  (`critic/shots/c77tm_old_criticc75seed7019y20bin_step0.png`).
- **R76-N2 fixed for a nation living now.** On 59943 at January 1938, the cell shown in Norway's colour has the tooltip
  "Norway", and a click opens Norway's panel. Run 76 gave "Soviet Union" (`critic/c77tm_cell_59943.json`,
  `critic/shots/c77tm_cell_59943_hover.png`).
- **The borders' record** (`borderLog 59097`, 20 years):
  - 19 of 19 maps of 1 January alike.
  - 2.31 % of the packed save (bar 7 %).
  - A cut is 4.2 ms median, 8.9 ms at most.
  - Log: `critic/c77_borderLog_59097.log`.
- **History of a twenty-year world** (`hist 32019`): 2,650 events; History opens in 162 ms
  (`critic/c77_hist.32019_critic_c77_seed32019_y20.bin.log`).
- **The bare rows are mostly mended** in the 1941 to 1942 replay: "Japan occupies Northern Malaya", "Japan occupies
  Davao" (`critic/shots/c77gp_1942_JAP_UnitedStates_1600x900_2history.png`).
- **The stopped bomber's row:** `interceptTold` true, true, 2 strings (`critic/c77_interceptTold.log`).

**Not 9:**
- **R77-N2: R156's track rows, wrong where they were bare.**
  - **On the page.** The replay of 1941, run 365 days, then History:
    - "1 December 1941 Germany occupies The line of 1941-12-01", and the same for 10 July, 20 August and 30 September.
    - "17 September 1941 Soviet Union occupies The Soviet zone"; "United Kingdom occupies The British zone".
    - "United Kingdom occupies Eritrea held by Britain".
    - Files: `critic/shots/c77tr_1941_1600x900_occupiesTheline.png`, `critic/c77tr_1941_1600x900.json`.
  - The 1942 replay: "Soviet Union occupies Kerch retaken", "Australia occupies Buna and Gona retaken" and "Germany
    occupies To El Alamein" (`critic/shots/c77tr_1942_1600x900_Kerch.png`, `critic/c77tr_1942_1600x900.json`).
  - **Every row R156 tells**, through the game's own `trackText`, with the nation the sim gives it (`firstNation`:
    occupy's `by`):
    - Command: `npx tsx critic/scripts/c77_trackTexts.ts`. Output: `critic/c77_trackTexts.log`, with the odd rows in
      `critic/c77_trackTexts_odd.txt`.
    - Of the 114 occupy, objective and nuke rows it tells:
      - 31 are wrong English. Besides those above, for example: "China occupies The Red Army leaves Manchuria";
        "Lebanon occupies Israel back to its security zone"; "United Kingdom occupies The Argentine surrender at
        Stanley"; "Iran occupies Iraq's army back to the border"; "United States occupies Japan occupied".
      - 8 are right but for a capital "The" in mid-sentence ("Japan occupies The Philippines").
    - The rows of 1946 to 1985 were seen through `trackText` only, not on the page (their years were not replayed).
    - The 2 alliance-join rows and the bare alliance notes are left out of these counts: the page shows an alliance's
      joining under its own kind ("Thailand joined the Anti-Comintern Pact").
    - Before R156 these rows read as the note alone, which was readable. Now over a quarter of them are wrong English,
      and some name the wrong side as the one acting.
  - Still bare on the page: "1 June 1941 Crete", "23 April 1941 Salonika", "↳ Dalmatia", "↳ Montenegro", "11 November
    1942 Italy's zone", "4 November 1942 Egypt clear". These are kinds R156 does not take, or notes that name their own
    nation (`critic/c77tr_*.json`).
- **R77-B1: on the time-lapse a nation dead now has no tooltip and no panel** (blocking; below, UI).
- **Two of run 76's cases, run again late:**
  - `tlMonths 59947`: four months of the time-lapse, each 0 cells unlike the game's own map, and after a page save and
    load (`critic/c77_tlMonths_59947.json`). R149's change to the grid the view reads leaves the map exact.
  - `histPlace 59961`: 11 of 11 kinds of History row fly to their place, on the map's canvas
    (`critic/c77hp_59961_1600x900.json`).

### UI/UX and polish: 7 → **7** (afresh)

**Fixed on run 76's own probes:**

| run 76 case | run 76 | HEAD |
|---|---|---|
| R76-N1 `dirHand 59955 120`: the ticker, banner and History acts | on, 2 / 1 / 2 cuts | **off, 0 cuts each** (`critic/c77_dh_59955_desk.log`) |
| R76-N1 on a phone: ticker and banner | on | **off, 0 cuts** (`critic/c77_dh_59955_phone.log`; its History act cannot be clicked on a phone, as run 76) |
| R76-N3 `PANEL=history director 59951`: seen under the panel | 53 of 56 | **0 of 45** (`critic/c77dr_head_59951_1600x900_history.json`) |
| R76-N2b `timeLapse 59941` / `59945` phone: `ranUnderLapse` (Space) | 96 | **0, 0**; Escape closes the plate (`critic/c77_tl_head_59941_1600x900.json`) |
| The plate over the ticker on a phone | half under | ticker hidden while it is open (R153; `critic/shots/c77tl_head_59945_390x844_8mid.png`) |
| `bannerFlip 57901 / 58901 / 57903`: changes; under the cursor | 4, 4, 5; 2, 0, 3 | 7, 4, 6; 1, 0, 2 (run 76's build beside it: 4, 4, 5; 2, 0, 3) |

- **R150 costs nothing seen:** with the director on and History open, at ×5, HEAD has 57.8 fps and p95 16.8 ms. Run 76's
  build beside it has 57.2 fps and p95 16.8 ms (`critic/c77_dirFps_head_59951_1600x900.json`, `…_c76build_…`).
- **The main menu asks first** (R156). The phone monkey (62811, 2,203 acts) did not leave the game this time; runs 75 and
  76 left by Settings' title button (`critic/c77_monkey_62811_phone.log`).
- **The phone's first cue says "Tap" and "Pinch"** (`critic/c77_look_62903_phone.log`).
- **The phone's layout:** 0 controls off the screen, 0 clipped (`critic/c77_p_phone.log`).

**What holds it at 7:**
- **R132's bar, `bannerRank 57901 150` (R148 aimed at it).**

  | | HEAD | run 76's build, beside it | the bar |
  |---|---|---|---|
  | 57901: quiet banner-days with a fought war behind "+n" | **51, 33, 42** | 53 | each under 44 for an 8; under 50 (ADR-1114, the user's) |
  | 58901 | **45** | 85 | |
  | 62901 (new) | 33 | | |

  - R148 cuts 58901 nearly in half on the same seed at the same time.
  - On 57901 its mean is 42 against 53, but one run of three is 51, over the user's bar. Run-to-run noise on the same
    seed spans 33 to 51.
  - The rule yields only to a fought war among the order's first three (`want`). A fought war further down the order
    still waits behind a quiet one.
  - Files: `critic/c77_br_*.log`.
- **R77-B1 and R77-N1: the time-lapse.**
  - `node critic/scripts/c77_tlDead.mjs critic/c76_seed7019_y20.bin` loads run 76's 7019 world on HEAD.
  - It opens the time-lapse at January 1938 and rests the mouse on the middle of Sweden (dead by 1957, now the United
    Kingdom's).
  - On HEAD:
    - The tooltip is empty.
    - A click sets `selected` to Sweden with no panel. The first Escape is spent clearing that selection.
    - Control points on Norway and on Germany (both dead now) show no tooltip; on Denmark (alive) it says "Denmark".
  - Run 76's build, on the same world: "United Kingdom", and the United Kingdom's panel.
  - At phone size: the same.
  - Files: `critic/c77tld_1600x900.json`, `critic/c77tld_c76build_1600x900.json`, `critic/c77tld_390x844.json`;
    `critic/shots/c77tld_1600x900_hover.png`, `…_click.png`.
  - **R77-N1: the Resume button runs the game under the plate:**
    - The bar's Resume, with the plate at January 1938, ran 96 hours in 4 s: 27 to 31 December 1957, the clock moving
      and the map still 1938.
    - Run 76's build does the same. Run 76's probe pressed only Space.
    - With R153 the ticker is hidden while the plate is open, so the news of those hours is never shown
      (`critic/shots/c77tld_1600x900_resume.png`).
  - I wrote run 76's bar as "the tooltip names the owner of the month on show (or none)", and R149 meets it for a living
    nation. SPEC (R149) claims more: "the tooltip and a click name the month's owner". It fails for 35 of the nations on
    the 1938 map of that world, Germany among them. My bar allowed it, but the brief makes a contradicted claimed
    feature blocking, so it is R77-B1. It holds the score at 7 and does not lower it: the rest of R76-N2 is fixed.

**What an 8 needs:**
- `BASE=<build> node critic/scripts/c77_bannerRank.mjs 57901 150`: three runs, each under 44.
- `node critic/scripts/c77_tlDead.mjs critic/c76_seed7019_y20.bin`:
  - a tooltip naming Sweden;
  - a click that opens a panel or nothing (`selected` 0);
  - `resume.ranHours` 0, or the plate closing when the game resumes.

### Performance: 8 → **8** (afresh)

The performance chain ran alone, last, from 14:55 to 15:31 (`critic/scripts/c77_chainPerf.sh`, `critic/c77_pf.status`). The
lanes and the other chains had ended before it began.

- **The tick, seed 99, five years:** 1.809 ms mean (run 76: 1.827). Year 1 is at `f311b292`, the pin of ADR-1128
  (`critic/c77_tick99.log`). With heroes: 1.629 ms (run 76: 1.670) (`critic/c77_tick99h.log`).
- **Frames on HEAD's 7019 year-20 world** (`c77_pf_lookfps`, five tiers in both looks and panning):
  - 1600 × 900: 59.4 to 60.2 fps. The worst frames are 131 and 114 ms, where the look is changed to Classic (run 76:
    120 and 123).
  - 2560 × 1440: 59.7 to 60.2, worst 122.
  - 3840 × 2160: 59.3 to 60.1, worst 122.
  - The heroes' year-20 world: 59.3 to 60.2, worst 128.
  - Files: `critic/c77_pf_lookfps*.log`.
- **`tools/diag/lookFps.ts`** on the same world: 59.5 to 60.1 forced frames/s (least 58.5), p95 18 to 18.1 ms; the
  longest draw 8.3 ms (`critic/c77_lookfps.log`).
- **Touch and the individual tier:**
  - Touch: 59.6 to 60.0 fps (`critic/c77_tm_touch.alone.log`).
  - `x_indfps 32111`: 59.6 to 60 fps, the worst frame 67 ms (`critic/c77_xi.log`).
- **Twelve years on the page, alone** (58941, heroes): 59.7 to 60 fps every year, the longest gap 83 ms, a year in 17 to
  34 s (`critic/c77_lw_58941_alone.log`).
- **The time-lapse of a twenty-year record** (HEAD's 7019 save; 240 months): 59.8 fps, p95 16.7 ms, the longest frame
  33 ms while it plays (`critic/c77_tm_lapse20.log`).
- **The director's new check costs nothing seen:** R150, 57.8 against 57.2 fps beside run 76's build, under load.

**Not 9:** one frame of 114 to 131 ms where the look is changed to Classic, at every screen size, as in runs 75 and 76.

### Stability: 8 → **8** (afresh)

**Evidence for 8:**
- **Random input:**
  - `c77_monkey.mjs 62803` (1600 × 900, 5 min): 1,988 acts (733 on buttons). 0 page errors. At the end the tick moved
    and 301 frames were drawn in 5 s.
  - `62811` (390 × 844 touch): 2,203 acts, 0 errors, the game running at the end, never left by the Settings button.
  - Files: `critic/c77_monkey_*.log`.
- **Save and load:**
  - `saveload 1942 god`: exit 0.
  - `massTold --saveload` 57621 and 58623: the same hashes after two loads (`critic/c77_massTold_sl.log`).
  - Run 76's 7019 year-20 save loaded in the page plays its 240-month time-lapse (`critic/c77tld_1600x900.json`).
  - Run 75's save (no record) loads and runs 40 days (`critic/c77tm_old_criticc75seed7019y20bin.json`).
  - Run 76's 7019 year-20 save, headless on HEAD, runs a year (`c9f6f1a7`, 73 nations; `critic/c77_loadold_7019.log`).
- **Determinism:** `workerDeterminism 54059`: `ed05e7b5` on every arm, as run 76 (`critic/c77_wd_54059.log`).
- **Long runs:** twenty years headless five times; 0 errors in every page probe of this run.

**Not 9:** under the load of this run, the tick of a twelve-year heroes game (58021) reached 1.06 s once
(`critic/c77_hero_58021_12.log`, beside eleven other sims). Not compared.

### Semantic zoom to unit level: 8 → **8** (afresh)

**Evidence for 8:**
- **R76-N6 fixed (R152).** `WHEEL=1 c77_heroPop.mjs` gives 0 leaps by the wheel on all four of run 76's cases:
  - 56901 d430: 0 (run 76: 11);
  - 58905 d330: 0 (8);
  - 59905 d300: 0 (16);
  - 59907 d300: 0 (7);
  - and 57905 d230: 0 (2).
  - Files: `critic/c77_hpw_head_*.log`.
- **Run 76's `heroPop` cases, both builds at the same time:**

  | | run 76's build | HEAD |
  |---|---|---|
  | 56901 d400: zooming 9,000 → 4,000 m/px | 3 | **0** |
  | 56901: panning 480 px | 4 | 3 |
  | 56901 / 57905: running 120 × 6 h | 0 / 9 | 3 / 6 |

  Files: `critic/c77_hpz_*.log`. The worlds differ by R154.
- **`markerPop 56951`:** 0 leaps and 0 pops through the wheel and the glide across 1,200 m/px and while running. The
  largest hero move in a frame is 5.1 px (`critic/c77_mp_head_56951.log`).
- **Every tier:** `z_zoom 62911` draws units from 1,573 m/px down to 3 m/px, and the individual men from 28 m/px
  (`critic/c77_z_zoom.62911.log`). `c_battle 62915`: an armoured fight at every tier, 0 errors.

**Not 9:** as before. Hero names lie on counters at the world's zoom on a phone
(`critic/shots/c77pt_62903_390x844_opened.png`: "Sovetsky Soyuz" over a counter's number).

### Naval warfare: 8 → **8** (afresh)

**Evidence for 8:**
- **`landingFuzz --seeds 15 --first 62101`: 0 of 90** runs broken, `slowClick` included (`critic/c77_landingFuzz.log`).
- **Run 61's bulk sets (due), against run 76's, file by file** (`bash critic/scripts/c77_bulkcmp.sh`):
  - The 396 named landing setups: 351 the same line for line, 45 moved with the world.
  - The 153 stuck returns: all the same.
  - The 168 next voyages: 153 the same.
  - The same four runs break a rule as in runs 74 to 76, and no other run breaks one:
    - 30041 3517 g1 of the setups, its one `slowClick`;
    - 30041, 31157 and 31175 3517 g1 of the next voyages.
  - Files: `critic/c77_liab_named_cmp.txt`, `critic/c77_sr_cmp.txt`, `critic/c77_nv_cmp.txt`.
- **Malta's 18:** 12 thrown back near Catania and 6 broken off near Palermo, as run 76 (`critic/c77_malta.log`).
- **`landingRows all`:** 115 cases, 20,321 hours, 0 broken, run alone (`critic/c77_lrows_all.log`).
- **Named `slowClick` cases:** 30041, 51101 and 53125 break it, and 27037 does not, as run 76 (`critic/c77_li_*.log`).
- **Sea battles:**
  - Headless, three years: 58061 60 (run 76: 53); 39061 66 (101); 59061 75; new 62061 57; the random world 58067 60.
  - On the page: `seaBattlesLook` sees 60 of 60 and 66 of 66, 0 page errors (`critic/c77_sbl_*.log`).

**Not 9:** the named `slowClick` cases as before (ADR-914, non-blocking).

### Tanks: 8 → **8** (carried)

- `c_battle 62915` shows an armoured division's fight at every tier, 0 errors.
- `heroBattle`:
  - 58081: the P.100 in battle 237 of 651 days at war.
  - 7019: 121 of 737.
- `heroCeiling` on run 75's ten seeds: 92 of 131 lives at or above the top decile (0.70; run 76: 0.60, run 75: 0.69)
  (`critic/c77_heroCeiling3_*.log`).

### Aircraft: 8 → **8** (carried)

- `pl_planes 62925` in both looks at three zooms, 0 errors (`critic/c77_pl_planes.62925.log`).
- The monthly air rows are in every History looked at (`critic/shots/c77dr_head_59951_1600x900_history_060.png`).

### AI nuclear use: 8 → **8** (carried)

- **`nukecount`, 22 years** (`critic/c77_nc_*.log`; the worlds differ from run 76's):

  | seed | launches |
  |---|---|
  | 58501 | 9 |
  | 58503 | 12 |
  | 58507 | 18 |
  | 55501 | 12 |
  | 55503 | 0 |
  | 55507 | 19, 1 stopped |
  | 59501 | 2 |
  | 62501 (new) | 7, 5 stopped |

- The free starts' detonations: 1983 2, 1991 3.
- The editor's Poland strikes Berlin and is told when stopped (`g_editor`).
- On run 76's seven seeds, 6 of 7 have AI strikes, where run 76 had 5 of 7.

## Blocking issues

### R77-B1: the time-lapse does not name the month's owner when that nation is dead now (UI, stats; R149)

- **The claim:** SPEC (R149): "The tooltip and a click name the month's owner".
- **The case:** `node critic/scripts/c77_tlDead.mjs critic/c76_seed7019_y20.bin` (and `… 390 844`).
  - At January 1938, on Sweden (dead by 1957): `tooltip ""`, `click.selected 32` with no panel, the first Escape spent on
    that selection.
  - Germany and Norway, dead now: no tooltip. Denmark, alive: "Denmark".
  - 35 of the 1938 map's nations are dead in that world.
  - Run 76's build, on the same world, named the owner of now ("United Kingdom").
  - Files: `critic/c77tld_1600x900.json`, `critic/c77tld_390x844.json`, `critic/c77tld_c76build_1600x900.json`,
    `critic/shots/c77tld_1600x900_hover.png`.
- **Why blocking:** it contradicts a claimed feature, and in the case a watcher most wants answered.
- **The fix:** name a nation that is not living from its last name (the record or the dead nation's own row). A click on
  one opens nothing (`selected` 0) or a short "gone since" line.
- **Seen fixed when:** the probe gives a tooltip of "Sweden" and `click.selected` 0 or a panel, at both sizes, and
  `tlMore cell 59943` still gives "Norway".

## Non-blocking issues (prioritised)

1. **R77-N1 (UI; R143b): the bar's Resume runs the game under the time-lapse.**
   - **The case:** the same probe gives `resume.ranHours` 96, on HEAD and on run 76's build.
   - The plate keeps showing January 1938 while the clock runs, and the ticker is hidden (R153), so the news of those
     hours is never shown.
   - **Seen fixed when:** `ranHours` is 0, or the plate is closed when the game resumes.
2. **R77-N2 (stats; R156): track rows told wrongly.**
   - **The case:** `npx tsx critic/scripts/c77_trackTexts.ts` gives 31 wrong rows and 8 with a capital "The", among the
     odd rows in `critic/c77_trackTexts_odd.txt`. On the page: `node critic/scripts/c77_trackRows.mjs 1941 365` and
     `1942 400`.
   - **Why:** `trackText` puts "{nation} occupies" before any note without a colon or the nation's name. Many occupy
     notes are already sentences ("Kerch retaken", "The Red Army leaves Manchuria", "The line of 1941-12-01"), and
     occupy's `by` is not always the actor the note speaks of. The unit test (`tests/unit/trackText.test.ts`) feeds
     hand-made notes, not the timeline's.
   - **The fix:** tell only notes that are a bare place, judged on the timeline itself, or write the notes. Add a test
     that runs every timeline note through `trackText`.
   - **Seen fixed when:** `c77_trackTexts.ts` lists no row of `c77_trackTexts_odd.txt`'s kinds, and the 1941 page shows
     no "The line of 1941-…".
3. **R77-N3 (diplomacy; R147): war openings with nothing taken, half back.**
   - **The case:** `sh critic/scripts/c77_woAB.sh` beside `npx tsx tools/diag/warOpening.ts … --years 3 57211 57213
     57215`. HEAD gives 14 of 88 with no cell held at day 30, and the defender ahead in 20.3 %. With `--lift-far`: 7 of 96
     and 15.5 %.
   - **Seen fixed when:** HEAD's figure on run 76's nine seeds is back at 14 of 276 or near it (under 6 %), with
     `c77_firstdecl.ts 60` still at 0 over 6,000 km.
4. **R132's bar on 57901 (UI):** `bannerRank 57901 150`: 51, 33, 42. **Seen fixed when** three runs are each under 44.
5. **`slowClick` (ADR-914):** 0 of 90 on new seeds; the named cases as run 76.
6. **Small things:**
   - A banner reads "Nationalist Spain ⚔ Portugal +2 +32 ☠": the allies' count and the score sit side by side, both with
     a plus.
   - Track notes still bare: "Crete", "Salonika", "↳ Dalmatia", "Italy's zone", "Egypt clear".
   - `dirHand`'s History act cannot be clicked on a phone (`history-go` not shown). That may be the phone's History,
     not a defect; not judged.

## Run 76's cases re-run

| Run 76 case | Run 76 (`c2440872`) | Run 77 (`7066d800`) | Evidence |
|---|---|---|---|
| R76-B1 `diploInvariants 33501`, `58011` | 2, 3 broken | **fixed**: 0, 0 | `critic/c77_diploinv_33501s.log`, `…58011rh_10y.log` |
| run 76's other 18 checker runs and its 6 lift seeds | 0 | 0 | `critic/c77_diploinv_*.log`, `critic/c77_wi_*.log` |
| R76-N1 `dirHand 59955` | on, 2/1/2 cuts | **fixed**: off, 0 | `critic/c77_dh_59955_*.log` |
| R76-N2 `tlMore cell 59943` | "Soviet Union" | **fixed**: "Norway" (but R77-B1 for a dead nation) | `critic/c77tm_cell_59943.json` |
| R76-N2b `timeLapse 59941`, `59945` | ran 96 h; Escape no | **fixed**: 0; Escape closes | `critic/c77_tl_head_*.json` |
| R76-N3 `director PANEL=history 59951` | 53 of 56 under the panel | **fixed**: 0 of 45 | `critic/c77dr_head_59951_1600x900_history.json` |
| R76-N4 `tlMore old c75 save` | "from the start", 2 steps | **fixed**: "from January 1958" | `critic/shots/c77tm_old_criticc75seed7019y20bin_step0.png` |
| R76-N5 `firstdecl` 39821…, 55821… | 2 of 50, 4 of 58 | **fixed**: 0 of 49, 0 of 55 | `critic/c77_firstdecl*.log` |
| R76-N6 `heroPop WHEEL` 56901, 58905, 59905, 59907 | 11, 8, 16, 7 | **fixed**: 0, 0, 0, 0 | `critic/c77_hpw_head_*.log` |
| `bannerRank 57901 150` | 59, 55, 63, 48 | 51, 33, 42 (run 76's build beside it: 53); 58901 45 (85) | `critic/c77_br_*.log` |
| `bannerFlip` 57901, 58901, 57903 | 4, 4, 5; 2, 0, 3 | 7, 4, 6; 1, 0, 2 | `critic/c77_bf_*.log` |
| Small issue 9, massing told again (56211…, 57613) | 1 | **fixed**: 0 | `critic/c77_massTold_*.log` |
| The plate over the ticker on a phone | half under | hidden (R153) | `critic/shots/c77tl_head_59945_390x844_8mid.png` |
| Bare track rows ("Northern Malaya") | bare | told; but R77-N2 | `critic/shots/c77gp_1942_JAP_UnitedStates_1600x900_2history.png` |
| War to the death on a phone | hover only | marked, with its line when opened | `critic/shots/c77dt_7019_400_390x844.png` |
| Small worlds 54425, 54426, 55424, 59421, 59423, 55404 | no war | the same (ADR-1129 keeps it) | `critic/c77_few*.log` |
| `warOpening` 58211…, 56211…, 57211… (no cell held) | 3, 4, 7 | 5, 6, 14 (R147 off: 3, 4, 7) | `critic/c77_warOpening*.json`, `critic/c77_woFar*.json` |
| `markers 56951` | 3, 10, 12 / 1, 3, 7 | the same | `critic/c77_mk_head_desk.log` |
| `markerPop 56951` | 0 leaps | 0 leaps | `critic/c77_mp_head_56951.log` |
| `seaBattlesLook 58061`, `39061` | 53 of 53, 101 of 101 | 60 of 60, 66 of 66 | `critic/c77_sbl_*.log` |
| `landingFuzz` (new seeds) | 0 of 90 | 0 of 90 | `critic/c77_landingFuzz.log` |
| Run 61's 717 bulk runs | 571 the same; 4 broken | 657 the same; the same 4 broken | `critic/c77_*_cmp.txt` |
| Malta's 18 | 12 thrown back, 6 broke off | the same | `critic/c77_malta.log` |
| `slowClick` named four | 3 broken, 27037 0 | the same | `critic/c77_li_*.log` |
| `afterTrack 55601`, `37601` | 203, 219 wars; leaders 0 days | 207, 222; 0 days | `critic/c77_atx_*.log` |
| `topArea 58097` | 7 changes | 3 | `critic/c77_toparea_58097.log` |
| `farConquests 0` ten seeds | 78 far | 100 | `critic/c77_farc_*.log` |
| `nukecount` six seeds | 7, 0, 5, 1, 2, 24 | 9, 12, 18, 12, 0, 19 | `critic/c77_nc_*.log` |
| `heroCeiling` 58181–58190 | 68 of 113 (0.60) | 92 of 131 (0.70) | `critic/c77_heroCeiling3_*.log` |
| `borderLog 59097` | 2.53 %, cut 4.9 ms | 2.31 %, 4.2 ms | `critic/c77_borderLog_59097.log` |
| 7019, 32019 twenty years | `4931216a`, `deec2aee` | `ab927e1b`, `c3520016` (78, 76 nations) | `critic/c77_seed*_save.log` |
| Tick seed 99; frames on 7019 year 20 | 1.827 ms; 59.6–60.1 fps | 1.809 ms (pin `f311b292`); 59.4–60.2 fps, worst 131 ms | `critic/c77_tick99.log`, `critic/c77_pf_lookfps.log` |
| `godpeace`, `god42`, `undo2`, `undo2y`, `heropanel`, `takescore`, `peacebtn`, `x_stage`, `x_continue`, `g_editor` | as before | exit 0, the same | `critic/c77_laneE1.out`, `critic/c77_*.log` |

## Design objections (none blocking, no score lowered)

- ADR-1126 and ADR-1129 are the builder's decisions, not the user's, so they are judged in the scores (R77-N3; the still
  worlds under emergent dynamics), not here.
- **ADR-1114 (the row held 20 days):** as run 76.

## Ideas from other games (not scored)

- **Ages of Conflict's time-lapse** writes the names of the year's nations on its map, so a vanished nation is still
  named while it is shown.
- **Hearts of Iron IV's history log** keeps the event's own sentence ("The Red Army leaves Manchuria") and puts the actor
  in a separate column, never prefixed to the sentence.

## Strengths (verified)

- **Every finding of run 76 is mended on its own probe.**
  - The lift checker is clean on its two seeds and 44 runs.
  - The director gives the camera back (0 cuts after each act) and flies clear of History (0 of 45 under it).
  - The heroes' counters no longer leap by the wheel (0 where 7 to 16).
  - Japan's far first wars are gone (0 of 145).
- **Run 76's build gives run 76's figures again** where both were run beside each other (`bannerFlip` 4, 4, 5; 2, 0, 3).
  So the HEAD figures above are the code's, not the machine's.
- **R148 nearly halves the quiet banner-days on 58901** (85 → 45, same seed, same time), without the churn coming back
  (7, 4 and 6 changes a minute).
