# Critic report, run 61 (full): the release check after run 60

- **Mode: full.** The spawning message asked for a full run ("Full run. Run the critic per CRITIC_PROMPT.md."). That is
  the request ADR-916 has the builder make after a focused run with no blocking issue and every score at its bar, which
  run 60 was. Every dimension is scored afresh, and nothing is carried.
- **Commit judged:** `d971a46bc250d67f017486121373859b647285f9`, HEAD at the start, on a clean tree (`critic/c61_commit.txt`).
- **What changed since run 60 (`91d11424`): nothing the game runs.**
  - `git diff --stat 91d11424 HEAD -- src tools data public tests vite.config.ts package.json index.html` is empty.
  - The two commits since touch only `CLAUDE.md`, `CRITIC_PROMPT.md`, `DECISIONS.md`, `PROGRESS.md`, `PROMPT.md`,
    `ROADMAP.md` and `critic/` (`git diff --stat 91d11424 HEAD`: 22 files, the other 16 under `critic/`).
  - So no worktree A/B was needed: every case run 60 also ran is a same-build comparison.
  - No score differs from the last report that scored it.
- **The sim is shown to be the same, not assumed:**
  - `npm run sim -- --seed 7019 --years 20` ends at hash `99caf939`, the same as run 59's save (`critic/c61_seed7019_save.log`).
  - workerDeterminism 31401 gives `c25ee058` on all four arms, as in run 60 (`critic/c61_wd_31401.log`).
  - All seven named `landingInvariants` cases are text-identical to run 60's logs.
  - **All 396 of run 60's named setups are text-identical** (`critic/c61_liab_named_cmp.txt`: "same 396 differ 0 missing 0").
- **Setup:**
  - Build: `vite build --outDir critic/c61_dist`, exit 0 (`critic/c61_build.log`).
  - Server: `vite preview` on 127.0.0.1:5361.
  - Browser: Playwright Chromium at 1600 × 900, plus 390 × 844, 844 × 390, 667 × 375, 740 × 360, 932 × 430 and
    1024 × 500.
  - Headless jobs: `critic/scripts/c61_jobsAll.txt`, `c61_jobsN.txt` and `c61_jobsR.txt`, run by `c61_runq.sh`.
  - Page suites:
    - `c61_suiteA.sh`: run 60's named page cases;
    - `c61_suiteB.sh`: the whole brief on new seeds;
    - `c61_suiteC.sh` and `c61_suiteD.sh`: the late saves, the 12-year watches, Malta and the sea look.
  - My own new probes are `critic/scripts/c61_x_*.mjs`.
  - Frame rates and the tick come from `c61_chainP.sh`, run alone after every other job.
  - **`npm run bench -- G` was not run.** It builds into `dist/` and writes the tracked `docs/bench/`, and the critic
    writes only to `critic/`.
  - The builder's previews on 5398, 5401 and 5411 were up before this run and were left alone. My 5361 preview and
    every browser I opened are stopped.

## Verdict

**No blocking issue. Every dimension is at its bar (8).**

- **No rule checker breaks a blocking rule on new seeds:**
  - diploInvariants: 0 broken on six new runs and on run 60's two;
  - worldInvariants: 0 broken on four;
  - workerDeterminism: one hash on every arm;
  - landingRows: 115 cases, 0 broken;
  - seaBattlesLook 32061: 75 of 75 battles seen.
  - landingInvariants on 300 new runs: only `slowClick` broke, **3 of 300 (1.0 %)**, under ADR-914's 5 %. So each break
    is a non-blocking issue (R61-SC).
- **Run 60's cases give run 60's results on this build,** case by case (the table at the end).
- **The full brief found new non-blocking problems.** Two of them are a player's real stumbles:
  - **R61-N1:** at landscape phone sizes, once a landing is ordered, the landings bar lies over the nation panel's ×.
    A tap on the × opens the bar instead. The same probe passed on run 55's commit.
  - **R61-N2:** with a scenario file chosen on the title screen, the big gold Start starts plain 1938, and the chosen
    file is dropped without a word.
- **A mystery is solved.** The editor probe's day-120 "stall" (runs 55 and 61) is a pause on an AI nuclear strike.
  The probe's exported scenario was re-run from the title screen (`critic/scripts/c61_x_stall.mjs`; the title's own
  random seed, not pinned). It paused on day 74 on Poland, given 10 warheads in the editor, A-bombing Berlin, and the
  probe never resumes after such a pause.

## Scores

| Dimension | Run 60 | Run 61 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Re-earned on new seeds.** <ul><li>A 150-nation random world on the large map from the title screen, run at Max for 90 s: 55.8–60 fps, every chip and name drawn (`critic/c61_xp_rnd_large.json`, `critic/shots/c61xp_rnd_large_end_world.png`).</li><li>The 12-year world with heroes (32141): the USA holding Canada's and Mexico's capitals, Japan across China, hero chips (Maus, Yamato, P.100 Ercole) where they fight (`critic/shots/c61lwhon_32141_y12_world.png`).</li><li>Held landing (32105 h60): a red ring on the transports and a dashed line to the British fleet, at 1500 and 250 m/px (`critic/shots/c61lh_ita_malta_32105_h60_250m.png`).</li><li>Corridor drawn days 3–10 (`critic/shots/c61new_corridor_32307_1600x900_d3_1500m.png`).</li><li>Nuclear ring and cloud on Paris (`critic/shots/c61a_32117_13_paris_h_strike.png`).</li></ul> **Not 9 (old):** the corridor still reads as a small dashed box beside Berlin; chips pile up over the Caribbean at world zoom in year 12; the relations graph at day 365 is a hairball, with 23 nations left out (`critic/shots/c61rg_32129_desk_d365.png`); the Land ranking has no unit. |
| Diplomacy, war, alliance, puppet, revolt depth | 8 | 8 | **Re-earned.** <ul><li>**diploInvariants, 0 broken on new seeds:** 32001 (random, 10 y), 32003 (heroes, 10 y), 32005 (random world, 5 y), 32007, 32009 (random, heroes), 32011, each 10 years (`critic/c61_diploinv_320*.log`).</li><li>Run 60's 31301 and 31303 are text-identical.</li><li>Joins now leave a row: on 32309, "France joined the war on Poland's side, as its guarantor" and "Nepal joined the war on Tunisia's side, as its ally" (`critic/c61_histgrep_32309_FRA.json`, `critic/c61_hi_7019.json`). This answers run 55's N1.</li><li>Peace button at six sizes on 30403: greyed with its reason on day 0, a click does nothing, accepted on day 35 (`critic/c61_peacebtn.30403_*.log`).</li><li>A player's war **by mouse only** (32421): click German land, Take control, right-click Poland, "Declare war", Shift-drag a box (7 selected), click Warsaw; all 7 got a way, and 5 were closer after 10 days (`critic/c61_xm_32421_1600x900.json`, `critic/shots/c61xm_32421_d10.png`).</li><li>Dogpiles at day 365 on new plain seeds 32139–32147: the worst are 1:5 and 2:9 (`critic/c61_piles_p.log`).</li></ul> **Not 9:** alliances still ignore the map. On 32415, the ticker says "7 February 1938 Japan declared war on Lithuania", and by day 40 Japan's panel lists Lithuania, Latvia and Estonia under AT WAR WITH, beside its Anti-Comintern allies. The ticker gives no reason (`critic/shots/c61xc_32415_continued.png`, the panel text in `critic/c61_warsof_32415_JAP.json`). The playing nation's own diplomacy AI declares wars by default (Germany on Austria, day 7, while played on 32421), told only as "Germany declared war on Austria". |
| Emergent world dynamics | 8 | 8 | **Re-earned.** <ul><li>Top-5 by area over 25 years (`c61_topArea.ts`): 24099, the first three change 9 times, and Germany leads in year 25 (`critic/c61_toparea_24099.log`); new 32099, 10 changes, the USA rising to 23 % (`critic/c61_toparea_32099.log`); new 32097, the first three change 7 times, though the Soviet Union stays first all 25 years at 19–21 % (`critic/c61_toparea_32097.log`).</li><li>The 12-year watches: 95 → 81 nations with heroes, 99 → 84 plain, wars and peace every month (`critic/c61_lwhon_32141.json`, `critic/c61_lwplain_32143.json`).</li><li>Year-20 worlds: a 1957 war of the UK against British India, and revolts annexed (`critic/shots/c61hi_32019_history.png`).</li></ul> **Not 9:** R61-N4, small random worlds are frozen: 2 nations, 0 wars in 15 years; 3 nations, 0 wars in 10 years (`critic/c61_xf_32403_2.json`, `critic/c61_xf_32403_3.json`). 6, 10 and 20 nations do go to war (`critic/c61_xf_32406_6.json`, `critic/c61_xf_324510_10.json`, `critic/c61_xf_324520_20.json`). On 32097 the Soviet Union is first for all 25 years. |
| God Mode | 8 | 8 | **Re-earned on new seeds.** <ul><li>H-bomb on Paris (32117): mushroom, ring, the alert with "Go to", 3,329,000 civilians (`critic/shots/c61a_32117_13_paris_h_strike.png`).</li><li>Revolt, Spawn, Found, Raze each told in the ticker (`critic/c61_q_32119.json`).</li><li>Breakthrough at war: engaged 0 → 4 → 19, told in the ticker (`critic/c61_kw_breakthrough.32123.log`); in History, the CSV and the JSON (`critic/c61_kwh_32151.json`); no row at peace (`critic/c61_k_32179.json`).</li><li>Force war (`critic/c61_fw2_32135.json`).</li></ul> **Not 9 (old):** on a phone the nation panel covers the corridor (`critic/shots/c61new_corridor_30307_390x844_d6_1500m.png`); God's tools reach only the selected side, and there is no undo. |
| Editor and scenarios | 8 | 8 | **Re-earned.** <ul><li>**By mouse (32443):** brush Germany over Paris; undo; redo; export (591,613 bytes); choose the file on the title screen; "Start this scenario". The painted cells are Germany's in the started game (`critic/c61_xe_32443.json`, `critic/shots/c61xe_32443_loaded.png`).</li><li>Fleets and a bomber placed, a fleet at Berlin refused ("no water of a sea is near the place"), the exported file loaded (`critic/c61_g_32121.json`).</li><li>The run-26 file still loads with its traits notice (`critic/c61_os2_c61.json`).</li><li>Filter "germ" on desk and phone (`critic/c61_new_filter_32305_*.json`).</li><li>A text file is refused with "not a Warism scenario file".</li></ul> **Why 8 holds** (new cases, same build): the editor's own paths work end to end, painting, undo, redo, export, the file's Start and refusals. What was found is about the title screen's wording and its second button. **Not 9:** R61-N2, the big Start drops a chosen file (`critic/c61_xe_32441.json`: paint lost, owners back to France; `critic/shots/c61xe_32441_title.png`), and "No file chosen" is shown beside the chosen file. R61-N3, a truncated file is told "Could not load: Failed to fetch" (`critic/c61_xb_trunc.json`). |
| Stats and history | 8 | 8 | **Re-earned on this run's year-20 saves.** <ul><li>7019 (`99caf939`): History opens in 160 ms, 3,284 events of 28 kinds (`critic/c61_hi_7019.json`).</li><li>32019 (`4702acef`): 162 ms, 3,129 events of 30 kinds; CSV 3,131 lines; JSON 739 kB (`critic/c61_hi_32019.json`, `critic/c61_dl_32019.json`).</li><li>My wars only: 74 of 460 for Germany on 32303 (`critic/c61_new_mine_32303_1600x900.json`).</li></ul> **Not 9:** same-day rows read in an impossible order: on 2 December 1957, "United States made peace with Free San Salvador", then (older) "was annexed", then (older still) "was destroyed" (`critic/shots/c61hi_32019_history.png`). |
| UI/UX and polish | 8 | 8 | **Re-earned.** <ul><li>**Batch 13's UI on new seeds:**<ul><li>32211: 172 next-voyage tellings, for example "Marching to Rome, about 8 days: its landing sails before it is there; the transports come back for it" (`critic/c61_nvpage_ITA_32211_12_1600x900.json`);</li><li>32217: the refused peace's reason whole at 844 × 390 and 1600 × 900, the peace taken on day 35 (`critic/c61_peacebtn.32217_*.log`);</li><li>32219: ten declarations at 390 × 844, every war row reachable (`critic/shots/c61mw_32219_GER_390x844_top.png`).</li></ul></li><li>Keys: Space pauses and resumes with a bar button focused; with History or Relations focused, the panel stays as it was (Statistics and God Mode were not visible to the probe). 1 to 0 switch the map modes; `.` and `,` change the speed (`critic/c61_xk.json`).</li><li>Main menu, then Continue: the same date, tick and hash, and still "Playing Germany" (`critic/c61_xc_32415_GER.json`).</li><li>Build tab whole at 844 × 390 (`critic/shots/c61new_build_32301_844x390_infantry.png`).</li><li>**0 page errors** in all 132 c61 probe outputs that record them.</li></ul> **Why 8 holds with R61-N1 and R61-N2 found on the same build:** neither blocks a task. A sea tap closes the panel, and the run-55 Cancel box is whole; the file's own Start works. Both cost a confused tap, not a lost game; a lost hour would be a 7. **Not 9:** <ul><li>R61-N1 (new): the landings bar covers the panel's × at landscape sizes (`critic/shots/c61xcb_21103_844x390.png`).</li><li>R61-N2 (new): the title's two Start buttons.</li><li>R60-N3: the ticker's order rows are undated and go stale, unchanged at 31211 h114 (`critic/c61_wt_ITA_31211_h114.json`).</li><li>R60-N4: the panel's foot sits under the bar at 667 × 375 (`critic/shots/c61mw_31201_GER_667x375_last.png`).</li><li>Order rows open with a bare number ("12: not done, met the enemy, it fights", `critic/shots/c61xm_32421_d10.png`).</li></ul> |
| Performance | 8 | 8 | **Re-earned, alone, after every other job** (`critic/scripts/c61_chainP.sh`). <ul><li>**This run's 7019 year-20 save** (`99caf939`), `c61_pf_lookfps.mjs` at Max: 3,000–600 m/px 58.0–60.1 fps; 120 m/px 52.5–57.2; 30 m/px 52.8–56.0 (`critic/c61_pf_7019.json`). Run 59 got 59.7–60.1, 54.6–56.4 and 55.1–55.9 on run 58's world.</li><li>`tools/diag/lookFps.ts`, a draw forced every frame: 59.1–59.9 frames/s at every zoom, p95 17.9–18.2 ms, a draw 0.8–2.3 ms (`critic/c61_lookfps.log`).</li><li>**The tactical goal:** 60 fps at 28 m/px with the view's individual count at 14,212, and 59.6 at Max (`critic/c61_xi_32111.json`). The screen holds about 600 balls, each standing for many of the counted figures (`critic/shots/c61xi_32111_28m_x1.png`).</li><li>A 150-nation large random map at Max: 55.8–60 fps, measured beside other jobs (`critic/c61_xp_rnd_large.json`).</li><li>Two 12-year watches at Max: 59.7–60 fps each year, longest gap 133 ms, 0 frames over 500 ms (`critic/c61_lwhon_32141.json`, `critic/c61_lwplain_32143.json`).</li><li>Touch: 59.3–59.6 fps (`critic/c61_tm_touch.alone.log`).</li><li>**Tick, seed 99, 5 years, pinned:** mean 2.2370 ms, the same hash `6471c3a5` as run 59's 2.2339 ms (`critic/c61_tick99.log`).</li></ul> **Not 9:** <ul><li>The tick is inside the budget in force, 6.5 ms in any year (ADR-757, the user's decision), at 3.09 ms in year 1. SPEC §2's older 1.5 and 2.4 ms figures are stale text.</li><li>120 and 30 m/px over the busiest late fight still dip to 52–56 fps.</li><li>`c61_heavyfps` lost the fight at unit zoom again (0 elements below 250 m/px, `critic/c61_heavyfps_head.log`).</li></ul> |
| Stability | 8 | 8 | **Re-earned.** <ul><li>**Determinism across commits:** 7019's 20 years end at `99caf939`, as on run 59's commit (`critic/c61_seed7019_save.log`); all 396 + 153 + 168 of run 60's landing, stuck-return and next-voyage logs are text-identical (`critic/c61_liab_named_cmp.txt`, `critic/c61_sr_cmp.txt`, `critic/c61_nv_cmp.txt`).</li><li>workerDeterminism, one hash on every arm: new 32059 `cf5a4a7f`; 31401 `c25ee058`, as in run 60 (`critic/c61_wd_*.log`).</li><li>Save and load in the page (32137): saved at t4800; 200 days later `351733010`; loaded twice, the same both times (`critic/c61_sl_plain_32137.json`).</li><li>**The player's own save:** Settings, Main menu, Continue on 32415 resumes the same tick (960) and hash; 60 days on it matches an unbroken game (`2691373367` both; `critic/c61_xc_32415_GER.json`).</li><li>worldInvariants 0 broken on 32051, 32053 (heroes), 32055 (10 y) and 32057 (random world) (`critic/c61_wi_*.log`).</li><li>Random worlds of 2, 3, 6, 10, 20, 150 and 200 nations start and run without an error.</li><li>Broken scenario files are refused, not crashed on (`critic/c61_xb_*.json`).</li><li>0 page errors in 132 probe outputs; two 12-year watches with 0 frames over 500 ms.</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Re-earned.** <ul><li>Z 32111 (its first days are the same opening scene as 7781: the same division, the same counts): one wheel zoom from 6,000 to 3 m/px over an engaged German division. Elements from 1,573 m/px (7,960); individual figures from 28.3 m/px (13,831); no error (`critic/c61_z_32111.json`, `critic/shots/c61z_32111_12.png`).</li><li>Phone 32133: 30,000 → 25 m/px, no horizontal overflow at any tier (`critic/c61_phz_32133.json`, `critic/shots/c61phz_32133_00060.png`).</li><li>Sea battle 20885 t107: 24 / 22 / 16 elements at 250 / 60 / 25 m/px in both looks, as in run 55 (`critic/c61_sb_20885.json`).</li><li>The frame rate at that camera, alone (`critic/scripts/c61_x_indfps.mjs`, `critic/c61_xi_32111.json`): 28 m/px, 60.0 fps at ×1 with the view's individual count at 14,212 (p95 16.8 ms), and 59.6 fps at Max with 12,378. At 18 and 12 m/px, 59.3–60 fps (`critic/shots/c61xi_32111_28m_x1.png`).</li></ul> **Not 9:** the year-12 fights are thin (cadre divisions of 600–700 men at 250 m/px, `critic/shots/c61lwhon_32141_zoom_00250.png`). |
| Naval warfare (needs 8) | 8 | 8 | **Re-earned. At its bar, with nothing new under it.** <ul><li>**landingInvariants, 300 new runs** (32101–32199 odd × six shapes, `critic/scripts/c61_liab.sh new`): only `slowClick` broke, **3 of 300 (1.0 %)**, under ADR-914's 5 %; no other rule kind broke (`critic/c61_liab_new.log`). The three are R61-SC below.</li><li>landingRows `all`: 115 cases, 20,321 hours, 0 broken (`critic/c61_lrows_all.log`).</li><li>Sea battles: 32061 has 75 battles in 3 years and `seaBattlesLook` sees **75 of 75** (`critic/c61_sbl_32061.log`); 32063 (random diplomacy) has 87 in 2 years (`critic/c61_sb_32063r.log`).</li><li>**Landings on new seeds (page):**<ul><li>32107 England to Bremerhaven: "over: 3 landed";</li><li>32109 Japan to Shanghai: "over: 3 landed" (`critic/shots/c61lland_jap_sh3_32109_over_250m.png`);</li><li>32103 Germany to Norwich: "its transports were sunk; 3 never sailed";</li><li>32105 Rome to Valletta: held, then "over: its transports broke off; 2 came ashore near Palermo, away from Valletta" at h198 (`critic/c61_lh_ita_malta_32105.json`; the others `critic/c61_lland_*.json`).</li></ul></li><li>Staged repulses 32071 and 32073: 0 broken (`critic/c61_repulse_*.log`).</li><li>Run 60's next-voyage figure: the same 119 tellings on the same 168 runs (`critic/c61_nv_all.txt`).</li></ul> **Not 9:** <ul><li>R60-N1, R60-N2 and R60-N5 unchanged;</li><li>Malta is never taken (18 of 18);</li><li>the `slowClick` tail (R61-SC).</li></ul> |
| Tanks (needs 8) | 8 | 8 | **Re-earned** (32115's opening battle is the same scene as 7781's: the same counts at every zoom, `critic/c61_c_*.json`). <ul><li>7781 day 5, 10 m/px: German armoured divisions 40 and 42 as tank balls with treads and guns, Polish infantry facing them, tracers, planes overhead (`critic/shots/c61c_7781_arm_0010m.png`).</li><li>15 m/px live (`critic/shots/c61c_32115_arm_15m_live_1.png`).</li><li>Week 2 at 80 m/px: the armour in contact on the border, labelled (`critic/shots/c61c_32115_week2_0080m.png`).</li></ul> **Not 9:** at 80 m/px German and Polish labels share one red-edged style, and the flags are tiny, so the sides read only from the ball colours. |
| Aircraft (needs 8) | 8 | 8 | **Re-earned.** <ul><li>W 32127: the fighter ordered to strike is followed, its mark in 56 of 61 samples at 3,000 m/px (median 32 px from its sorties) and 60 of 60 at ×5 (`critic/c61_w_32127.json`).</li><li>PL 32125: planes in hour 2, marks at every zoom 3,000 → 25 m/px in both looks (`critic/c61_pl_planes.32125_GER_POL_5361.log`).</li><li>Air war told monthly ("Italy and United States fought in the air this month", year 12, `critic/shots/c61lwhon_32141_y12_world.png`).</li><li>worldInvariants (air rules) 0 broken.</li></ul> **Not 9:** at 250 m/px the followed fighter's mark is 70 px from its sorties at the median and up to 1,222 px, with 2 samples unmarked (`critic/c61_w_32127.json`, "x1_250"). |
| AI nuclear use (needs 8) | 8 | 8 | **Re-earned in worlds made this run.** <ul><li>**32503** (new), saved at year 13 by this run (hash `c2c55270`, matching the headless count's): the game pauses on 6 September 1951 on "Soviet Union struck China with an atomic bomb near Olgiy: 0 civilians killed; 17,688 men and 68 guns lost", with its alert, "Go to" and ticker row (`critic/c61_an_32503y13.json`, `critic/shots/c61an_32503y13_0_goto.png`).</li><li>**The editor's scenario** (Poland given 10 warheads, at war with Germany): on day 74 the game pauses on "Poland struck Germany with an atomic bomb near Berlin: 334,000 civilians killed" (`critic/c61_xs.json`, `critic/shots/c61xs_stuck.png`). This is a re-run of the editor probe's own scenario from the title screen, with the title's random seed, not pinned (`critic/scripts/c61_x_stall.mjs`).</li><li>Run 59's 30301 y12: the same two Belgian strikes (`critic/c61_an_ainuke_30301.log`).</li><li>**Detonations over 22 years** (`critic/scripts/c61_nukecount.ts`): new seeds 32501, 32503, 32507 and 32509 give 0, 1, 6 and 26; 30301 gives 4, as in run 59 (`critic/c61_nc/*.log`).</li></ul> **Not 9:** <ul><li>No strike in the 400 days after year 20 on 7019 or 32019, nor after year 12 on 32505 (`critic/c61_an_*.json`). On those worlds a player who loads a late game sees none.</li><li>"0 civilians killed" beside 17,688 men (old).</li><li>At 600 m/px an A-bomb's mark is a dark smudge (`critic/shots/c61an_32503y13_0_z00600.png`).</li></ul> |

## Blocking issues

None.

- `slowClick` is at 3 of 300 runs on new seeds (1.0 %), under ADR-914's 5 %.
- Every other checker run is at 0 broken:
  - diploInvariants on 8 runs;
  - worldInvariants on 4;
  - workerDeterminism on 2 seeds, every arm the same;
  - landingRows on 115 cases;
  - stuck-return on 153 runs;
  - seaBattlesLook: 75 of 75 on the new seed.
    - On run 60's 31501, 43 of 45 are seen. The two misses are the same as run 60's: the tool's late look at t6243, and
      R60-N5 (a battle with no fleet left to draw).
- 0 page errors.

## Non-blocking issues (prioritised)

1. **R61-N1 (UI, new; a regression since run 55): at landscape phone sizes, an ordered landing's bar covers the nation
   panel's ×.**
   - The case: 21103, England, four divisions from Portsmouth to Bremerhaven, at 844 × 390. Before the order the × is
     at 540–561 × 54–76, and the element there is the ×.
   - After the order, the landings bar spans 265–579 × 46–78 over the panel's head. The element at the ×'s centre is now
     the bar's `landing-toggle`, so a tap on the × opens the landing instead of closing the panel.
   - The same happens at 932 × 430 and 1024 × 500, but not at 667 × 375, where the bar is narrower
     (`critic/c61_xcb_21103_*.json`, `critic/shots/c61xcb_21103_844x390.png`).
   - Run 55's own probe, `c55_lbox 21103 … 844 390`, passed on `715a5448`. The bar has not moved since (265–579 × 46 then and now); the panel has widened under it, probably with R58d's landscape layout, a lead and not a finding.
   - On `715a5448` that probe ran six days, the Cancel box whole
     (`critic/c55_lbox_eng_br4_21103_844x390.json`). The same probe now times out on the × on 21103 and on new 32223
     (`critic/c61_lbox_eng_br4_21103_844x390.json`, `critic/c61_lbox_eng_br4_32223_844x390.json`).
   - With the panel closed by a sea tap instead (`critic/scripts/c61_x_lboxsea.mjs`), run 55's claim still holds on 21103
     and 32223: the Cancel is on screen, inside the bar, and topmost on all 6 days, with the same boxes as run 55
     (`critic/c61_xlbs_eng_br4_21103_844x390.json`, `critic/c61_xlbs_eng_br4_32223_844x390.json`). SPEC does not say
     where the bar stands against the panel, so this is non-blocking.
   - A tap on the open sea still closes the panel (`critic/shots/c61xcb_21103_844x390_seatap.png`), so the player is
     not trapped.
   - The bar also hides the right half of the panel's title row.
   - **Fix:** at a height of 500 px or less, put the landings bar beside the panel or under its head, never over it; or
     keep the panel's head above the bar.
   - A check: `node critic/scripts/c61_x_closeblock.mjs 21103 844 390` must give `atClose` = the `nation-close` button
     and `clickOk` true.
2. **R61-N2 (editor/UI, new): with a scenario file chosen, the big Start starts plain 1938.**
   - The case: 32441. A painted scenario is exported and chosen on the title screen, and its card reads "Critic 61 paint
     · Start this scenario". The large gold **Start** under the 1938 options stays live and still starts World 1938.
   - The paint is lost without a word: the owners around Paris are France again (`critic/c61_xe_32441.json`,
     `critic/shots/c61xe_32441_title.png`). The file input beside it still says "No file chosen".
   - With the card's own "Start this scenario" the paint is there (32443, `critic/c61_xe_32443.json`).
   - The card's Cancel is a plain white box, unlike every other button (`critic/shots/c61xe_32441_title.png`).
   - Reproduce: `MAINSTART=1 node critic/scripts/c61_x_editor.mjs 32441` (main Start, paint lost); without `MAINSTART`, the
     card's Start (paint kept).
   - **Fix:** while a file is pending, make its Start the only one, or have the main Start start the file. Clear "No
     file chosen" when a file is pending.
3. **R61-N3 (editor, new): a truncated scenario file is told "Could not load: Failed to fetch".**
   - The case: the first 2,000 bytes of an exported file (`critic/c61_xb_trunc.json`, `critic/shots/c61xb_trunc.png`).
     A plain text file gets the right words, "not a Warism scenario file".
   - **Fix:** a damaged-file message ("the file is damaged or incomplete").
4. **R61-N4 (emergent, new): small random worlds never go to war.** The random world offers 2 to 200 nations (SPEC, the
   random world's *count*, `RANDOM_NATIONS`), but:
   - 2 nations (32403): 0 wars in 15 years, 2 History rows in all (both "learned to build the atomic bomb");
   - 3 nations (32403): 0 wars in 10 years, though Huambo and West Bengal share a long land border;
   - 6 (32406), 10 (324510) and 20 (324520) nations do fight; no nation dies in 10 years at 6 or 10.
   - Evidence: `critic/c61_xf_*.json`, `critic/shots/c61xf_32403_3.png`.
   - **Fix:** let war aims count a neighbour when there are few nations, or set the floor of `nations` where wars start.
5. **R61-SC (naval; the `slowClick` tail, under ADR-914's rate): 3 of 300 new runs.**
   - `landingInvariants 32167 3517 120 32167 30,90 2` and `… 30,90 1`: "t450's click of 366 not ashore after 13.2 days, its
     best way 6.2" and "… 12.8 days, its best way 5.7" (`critic/c61_li/new_32167_3517_g2_od-.log`, `…_g1_od-.log`).
     This is Japan's 366 again.
   - `landingInvariants 32115 15101 120 32115 30,90 2`: "t562's click of 274 not ashore after 9.3 days, its best way 2.3"
     (`critic/c61_li/new_32115_15101_g2_od-.log`). This is **the first break that is not Japan's**: England's 274, across
     the Channel.
   - 274's trace (`critic/c61_nvtrace_32115_274.log`; `SEED=32115 SETUP=15101 KEEPG=2 DIV=274 FROM=550 TO=860 npx tsx
     critic/scripts/c61_nvtrace.ts`):
     - it reaches its port at t650 and is "gathering";
     - both transport groups, 1069 and 1076, lie at the port with it;
     - at t691 both sail without it, full;
     - its panel says "next voyage, about 5 days", and it sails at t805, 4.75 days later.
   - The figure is true; the delay is the transports' room, which the checker's "best way" does not count.
   - Run 60's breaks (30041, 31099) and the builder's (203997, 204017) are unchanged.
6. **R60-N1, R60-N2, R60-N3, R60-N4 and R60-N5: unchanged** (the build is the same):
   - R60-N1: 31173's trace is text-identical to run 60's (`critic/c61_nvtrace_31173_366.log`).
   - R60-N2: 31127's trace is the same over run 60's hours.
   - R60-N3: the 31211 ticker (`critic/c61_wt_ITA_31211_h114.json`).
   - R60-N4: `critic/shots/c61mw_31201_GER_667x375_last.png`.
   - R60-N5: t17369 is still listed with no fleet.
7. **R61-N5 (stats, small): History's same-day rows can read backwards.** On 2 December 1957 (32019), newest first: "United
   States made peace with Free San Salvador", "Free San Salvador was annexed by United States", "Free San Salvador was
   destroyed", so the peace reads as made after the nation was gone (`critic/shots/c61hi_32019_history.png`).
8. **Old, unchanged:**
   - The phone's nation panel covers the breakthrough corridor (30307, 32307).
   - Alliances ignore the map: Japan declares war on Lithuania, Latvia and Estonia on day 37 of 32415.
   - "0 civilians killed" beside large military losses.
   - The ranking's Land figure has no unit.

## Run 60's cases re-run

| Run 60 case | Run 60 (`91d11424`) | Run 61 (`d971a46b`, same source) | Evidence |
|---|---|---|---|
| R59-B1 `landingInvariants 30041 3517 120 30041 30,90 1` | 1 broken, non-blocking | the same line | `critic/c61_li_30041_g1.log` |
| R60-SC 31099 g1 | 1 broken | the same | `critic/c61_li_31099_g1.log` |
| Builder's 203997, 204017 | 1 broken each | the same | `critic/c61_li_203997.log`, `critic/c61_li_204017.log` |
| 29043 15101 g2, 28037 od8, 28039 g1 | 0 | 0, text-identical | `critic/c61_li_*.log` |
| The 396 named setups (`c61_liab.sh named`) | 395 of 396 at 0 | **396 of 396 text-identical**, the same one break | `critic/c61_liab_named_cmp.txt` |
| 366's walk on 30041 | 11 cells in 10.4 days | the same lines and hashes | `critic/c61_h366d_30041.log` |
| Stuck-return (153 runs) | 0 | 0, **153 of 153 text-identical** | `critic/c61_sr_cmp.txt` |
| Next-voyage truth (168 runs) | 119 tellings, 45 of 47 within a day | the same 119 lines; **168 of 168 text-identical** | `critic/c61_nv_all.txt`, `critic/c61_nv_cmp.txt` |
| R60-N1 31173 366 | "about a day" for 4.3 days | the same trace | `critic/c61_nvtrace_31173_366.log` |
| R60-N2 31127 272 | 8.5 days after "about 4" | the same | `critic/c61_nvtrace_31127_272.log` |
| R60-N3 31211 h114 ticker | undated rows | the same | `critic/c61_wt_ITA_31211_h114.json` |
| R59-N2 27125 h140 and h400 | dated, grey | identical JSON | `critic/c61_wt_ITA_27125_h*.json` |
| Next-voyage pages 31211 and 31213 | 168 hits on 31211 | 172 on 31211, the same on a second run | `critic/c61_nvpage_ITA_31211_again.json` |
| Peace button 30403 at six sizes | greyed on day 0, peace on day 35 | the same | `critic/c61_peacebtn.30403_*.log` |
| Ten wars 31201 at 844 × 390, 1600 × 900, 667 × 375 | rows reachable | identical JSON | `critic/c61_mw_31201_*.json` |
| Phone corridor 30307 | covered by the panel | the same | `critic/shots/c61new_corridor_30307_390x844_d6_1500m.png` |
| Malta's 18 | 12 thrown back, 6 broke off | the same, word for word | `critic/c61_malta_sum.txt` |
| seaBattles 31501, and its look | 45 battles; 43 of 45 seen | the same | `critic/c61_sb_31501.log`, `critic/c61_sbl_31501.log` |
| seaBattles 28061, 3 years | 37 | 37 | `critic/c61_sb_28061.log` |
| landingRows all | 115 cases, 0 | 115 cases, 0 | `critic/c61_lrows_all.log` |
| diploInvariants 31301, 31303 | 0 | 0, text-identical | `critic/c61_diploinv_3130*.log` |
| workerDeterminism 31401 | `c25ee058` on every arm | the same | `critic/c61_wd_31401.log` |

The difference in the 31211 page counts (168 against 172):
- Run 60's samples have empty panels at hours 36, 72, 78, 90 and 114, where this run reads the panel. No row conflicts.
- Two runs on this build agree exactly.
- So it is the run 60 probe failing to read the panel (it ran beside other jobs), not the game.

## Design objections (none blocking, no score lowered)

- **ADR-914's rate keeps the `slowClick` tail.** 1.0 % here and 0.3 % in run 60. A break now also comes from a full
  transport group leaving a division behind (32115), which the checker's best way does not model. Either the checker
  should count the transports' room, or the player should be told at the click that the landing needs two voyages.
- **The played nation's AI declares wars by default** (SPEC §9.3: every AI layer but nukes stays on). On 32421, played as
  Germany, "Germany declared war on Austria" on day 7 with no word that the player's AI did it. The assist boxes are in
  the Actions tab, but nothing in the ticker points there.
- **Malta is never taken** (18 of 18).

## Ideas from other games (not scored)

- Hearts of Iron tells why a distant country entered a war ("Japan joins the Axis war on Lithuania"). Warism's ticker
  says only "Japan declared war on Lithuania".
- Paradox games' launchers have one Start, for what is selected; Warism's title screen has two.

## Strengths (verified)

- **The game is deterministic to the byte.** It gave identical checker output on 717 of run 60's runs (396 landing, 153
  stuck-return, 168 next-voyage), run 59's 20-year hash, and the player's Main menu → Continue matching an unbroken game
  60 days on.
- **The main player paths work by mouse and keys.** By mouse this run:
  - declared war from the right-click menu;
  - box-selected 7 divisions and ordered them to Warsaw;
  - brushed Germany over Paris in the editor, exported the scenario and started it from the title screen.
  - It also set the options and started random worlds of 2 to 200 nations from the title screen.
  
  All of it ran with 0 page errors.
