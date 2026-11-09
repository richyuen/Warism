# Critic report, run 59 (full): after batch 12 (R57a–R57f)

- **Mode: full.** Decided from git first (CRITIC_PROMPT, ADR-804). Run 58 (`6ddfb428`, on `000a4731`) has a blocking
  issue (R58-B1) and a score under its bar (naval 7), and runs 56–58 were not all focused (57 and 58 full). But the
  commit-kind test fails: `6ddfb428` filed R57a–R57c only (its ROADMAP diff: R58-N3 and the small items "Not filed");
  R57d (`4ad0c30f`, `src/ui/ActionsTab.tsx`), R57e (`8e243383`, `src/sim/systems/landings.ts`, `src/ui/standing.ts`)
  and R57f (`a1084e6d`, `src/sim/ai/invasion.ts`, `src/sim/ai/naval.ts`) name items that commit did not file, and each
  changes `src/`. So the whole brief: every dimension scored afresh.
- **Commit judged:** `fe9b0e9ef618bf114a8ef5b35aaaad903e031411`, HEAD at the start, clean tree (`critic/c59_commit.txt`).
- **Build:** `vite build --outDir critic/c59_dist`, exit 0 (`critic/c59_build.log`), `vite preview` on 127.0.0.1:5359.
  Playwright Chromium, 1600 × 900 unless named. Run 58's commit `000a4731`'s `src/`, `tests/helpers/`, `tools/diag`,
  `tools/headless`, `data/`, `public/data/` extracted read-only with `git archive` to `critic/old/` (a `node_modules`
  junction, removed before the folder), so run 58's sim and checker ran beside HEAD's on the same seeds (re-create with `git archive 000a4731 src tests/helpers tools/diag
  tools/headless data public/data package.json tsconfig.json | tar -x -C critic/old` and a `node_modules` junction; the
  copies of the critic's scripts there import `./src`, `./tests`). Server stopped,
  browsers closed at the end.
- **A trap for whoever re-runs this:** in Git Bash `GROUPS` is a shell variable (the user's group ids): `GROUPS=1 npx
  tsx …` passes nothing and the scripts' default (2) is used. Run 58's `c58_orderdays*.ts` traces read `GROUPS`; this
  run's `c59_h366*.ts` and `c59_told_all.ts` read `KEEPG`. (Found when a trace and the checker disagreed on 30041.)

## Verdict

**Batch 12 did what it set out to do, on every case the critic named: R58-B1's two commands are at 0 broken, all 306
of run 58's landing setups are at 0, R57-B1's two seeds still 0, 153 stuck-return runs 0, 28037's 366 is told at the
sail hour and lands at 14.3 days (19.4 on run 58's), 27125's 319 keeps its word, the phone's grey "Offer peace" says
why in a line, the bar no longer gives a sail hour with 0 transports, and Japan's weekly Black Sea losses are gone
(28061: 46 sea battles → 37). But on 90 new landing setups HEAD's `slowClick` breaks once (30041, setup 3517 g1: a
click ashore 9.5 days over its best way), where run 58's checker on the same sim says 0. The sim is the same on both
commits (traces identical); the batch's new checker reading (a refused re-click keeps a division in its earlier click,
ADR-908) now sees a real slow landing the old one dropped: 366 walks 11 cells to Tokyo in 10.4 days. By this brief a
broken checker is blocking (R59-B1), so naval stays 7. Every other dimension holds at 8.**

## Scores

| Dimension | Run 58 | Run 59 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Re-earned on new seeds.** <ul><li>God's H-bomb on Paris (30117): mushroom, ring, alert with "Go to", "3,329,000 civilians killed; 47,440 men and 162 guns lost" (`critic/shots/c59a_30117_13_paris_h_strike.png`).</li><li>12-year watch at Max (30141, heroes): Canada, the US, Xinjiang and a French Equatorial Africa of 8.6 M km² read at once, every chip and ticker row whole (`critic/shots/c59lwhon_30141_y12_world.png`); at 250 m/px Australia's divisions against Peru near Guayaquil, labels clear (`critic/shots/c59lwhon_30141_zoom_00250.png`).</li><li>An AI A-bomb in HEAD's own world (30301, year 12): the alert, the burst over As Suwayda, the ticker row (`critic/shots/c59an_30301y12_0_alert.png`).</li></ul> **Not 9:** the relations graph is still a knot, 21 nations left out at day 365 on desk (`critic/shots/c59rg_30129_desk_d365.png`), unreadable on a phone at day 730 (`critic/shots/c59rg_30131_phone_d730.png`); on a phone the nation panel hides most of the breakthrough corridor (`critic/shots/c59new_corridor_30307_390x844_d6_1500m.png`). |
| Diplomacy, war, alliance, puppet, revolt depth | 8 | 8 | **Re-earned.** <ul><li>diploInvariants **0 broken** on new 30001 (random, 10 y), 30003 (heroes, 10 y), 30005 (random world, 5 y), 30007, 30009 (random, heroes), 30011 (10 y each) (`critic/c59_diploinv_300*.log`).</li><li>**R58-N3 fixed (R57d, ADR-911):** 29403 at 390 × 844, Germany at war with Poland: day 0 the grey "Offer peace" with "They refuse: lead the war score by 25 (now +0), or wear them out (war weariness 0, over 40 needed)." in a line under the row (`critic/shots/c59pb_29403_GER_POL_390x844_disabled_d0.png`); enabled at day 35, pressed, "Germany made peace with Poland" (`critic/c59_pb_29403_GER_POL_390x844.json`). New 30403 at 844 × 390: the same, peace at day 35 (`critic/c59_pb_30403_GER_POL_844x390.json`).</li><li>**R57e (2) fixed:** 29401 day 35, weariness 39.97 now reads "war weariness 40, over 40 needed", true (`critic/c59_pb_29401_GER_POL_1600x900.json`). The war row's "(+N)" and the reason's "(now +N)" cannot disagree: the score is an integer (`src/sim/systems/war.ts:642`).</li></ul> **Not 9:** at 844 × 390 the reason line is cut at the panel's foot on day 0 (`critic/shots/c59pb_30403_GER_POL_844x390_disabled_d0.png`); alliances still ignore the map (France at war with Brazil in 1939, `critic/shots/c59new_mine_30309_1600x900_FRA_mine.png`). |
| Emergent world dynamics | 8 | 8 | **Re-earned on new seeds** by run 55's measure (`c59_topArea.ts`): 30097 longest still 14 (Australia), 30099 7, both under 20; on 30099 the first three change 13 times in 25 years and the US goes from 11.8 % to 19.4 % in a year (y21–22); on 30097 the Soviet Union falls from 15.3 % to 8.5 % in four years (`critic/c59_toparea_3009*.log`). Two 12-year watches at Max: 97 → 76 and 100 → 75 nations (`critic/c59_lwhon_30141.json`, `critic/c59_lwplain_30143.json`). **R57f did not starve the AI's landings:** six new seeds × 6 years, landings per seed HEAD / run 58's sim: 722/444, 578/750, 684/684, 818/765, 328/277 (`critic/c59_lc/head_*.log`, `old_*.log`; both ways, the worlds diverge), and Japan's weekly Black Sea losses are gone (28061: 46 sea battles → 37). **Not 9:** far-flung pairs still drive much of it (France and Brazil; Australia and Peru fighting in Ecuador, `critic/shots/c59lwhon_30141_zoom_00250.png`). |
| God Mode | 8 | 8 | **Re-earned.** Nuke (H and A), Revolt, Spawn, Found, Raze each told in the ticker (`critic/c59_a_30117.json`, `critic/c59_q_30119.json`: "Free Saxony broke away", "New Town was founded", "Prague in Czechoslovakia was razed"). Breakthrough at war: engaged 19 → 54 by day 7 (`critic/c59_kw_breakthrough.30123.log`); in History, the CSV and the JSON (`critic/c59_kwhist.30151.log`). Corridor drawn days 3–10 desk and phone (`critic/shots/c59new_corridor_30307_*`). 0 page errors. **Not 9:** God's tools still reach only the selected nation's side; no undo. |
| Editor and scenarios | 8 | 8 | **Re-earned.** 30121: fleets and a bomber placed, a fleet at Berlin refused ("Not done: no water of a sea is near the place."), exported, the pending start cancelled, then loaded, a sea battle by day 1, Poland's ten warheads kept to day 30 (`critic/c59_g_30121.json`). The run-26 scenario file loads and starts (`critic/shots/c59os2_c59_loaded.png`). The editor filter desk and phone (`critic/c59_new.filter_30305_*.log`). **Not 9:** the probe's real-time day-60 wait stalled again (stopped by hand; the probe's, not filed). |
| Stats and history | 8 | 8 | **Re-earned on HEAD's 7019 year-20 save** (hash `99caf939`; a different world from run 58's from year 8, R57f's landing rule): History opens in 138 ms, 3,284 events, each kind filter 167–176 ms (`critic/c59_hi_7019.json`); CSV 3,284 rows and JSON export (`critic/c59_dl_7019.csv`, `critic/c59_dl_export.7019_critic_c59_seed7019_y20.bin.log`); "My wars only" as France, 42 of 472 (`critic/shots/c59new_mine_30309_1600x900_FRA_mine.png`). **Not 9:** that list says "France and Italy fought at sea: France lost 12 ships, Italy 0" with no place (old); the filter row wraps "To year" onto a second line at 1600 px. |
| UI/UX and polish | 8 | 8 | **Re-earned.** <ul><li>**R58-N2 fixed (R57c, ADR-910):** 27125 h140, all six told in their panels, 319 "its transports broke off; it came ashore near Palermo, away from its target." (`critic/shots/c59wt_27125_319_h140.png`); 28113, 30101, 30113 all six (`critic/c59_whotold.*_120.log`, `_140.log`).</li><li>**R57e (1) fixed:** 27125 h132 the bar reads "4 came ashore near Palermo, away from Valletta; gathering · 12 transports needed, 0 at hand", no sail hour (`critic/shots/c59lh_ita_malta6_27125_h132_1500m.png`).</li><li>Build tab at 844 × 390 and 390 × 844 whole (`critic/shots/c59new_build_30301_*`); 0 page errors in every c59 page probe.</li></ul> **Not 9:** R59-N2 (a kept notice never ages: 323 "On the march" 11 days on under an orange "the landing is over", `critic/shots/c59wt_27125_323_h400.png`), R59-N1's figure-less "waits for the next voyage", the cut reason line at 844 × 390. |
| Performance | 8 | 8 | **Re-earned, alone, after every other job** (`critic/scripts/c59_pf.sh`), on run 58's 7019 year-20 save (hash `78d08a02`, the world run 58 measured). `c59_pf_lookfps.mjs`: 3,000–600 m/px 59.7–60.1 fps, 120 m/px 54.6–56.4, 30 m/px 55.1–55.9 (`critic/c59_pf_lookfps.log`), within run 58's 59.6–60.2 / 54.5–55.6 / 54.7–55.5. `tools/diag/lookFps.ts`, a draw forced each frame: 58.5–60 frames/s at every zoom, p95 17.7–20.4 ms, a draw 0.8–2.3 ms (`critic/c59_lookfps.log`). Tick time, seed 99, 5 years, pinned to the P-cores, one after the other: mean **2.2339 ms HEAD, 2.2457 ms run 58's sim** (`critic/c59_sim99_head.log`, `critic/c59_sim99_old.log`): R57f's scan of enemy fleets per landing plan costs nothing measurable. Two 12-year watches at Max: 59.7–60 fps a year, longest gap 100 ms, 0 over 500 ms (`critic/c59_long_watch2.*.log`). **Not 9:** 120 and 30 m/px over the busiest land fight still 54–56 fps; the dense unit-zoom case is light (at most 236 elements). |
| Stability | 8 | 8 | **Re-earned.** **Save and load mid-landing (new, R57a's `world.landingSailed`):** 29043 setup 15101, saved at t24, t400, t1100 (L7 gathering), t1200 (L7 sailing), t1250 (L7 gathering again for 273, sailed once), t1300, t1350, each loaded into a new Sim and run on with the later commands: **the same hash every hour to t2882** (`critic/c59_saveland_29043.log`, `critic/scripts/c59_saveland.ts`). workerDeterminism 30059: `aed47e32` on all arms (`critic/c59_wd_30059.log`). worldInvariants 0 broken on 30051, 30053 (heroes), 30055 (ten years), 30057 (random world) (`critic/c59_wi_*.log`). Two 12-year watches at Max: 0 page errors, 0 frames over 500 ms. |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Re-earned on new seeds.** 30139: one camera from 6,000 to 3 m/px, elements from 1,573 m/px, individuals from 28.3 m/px (13,831) (`critic/c59_z_zoom.30139.log`, `critic/shots/c59z_30139_17.png`). Phone 30133 from 30,000 to 25 m/px, no overflow, a tap at the centre opens China's panel (`critic/c59_phz.30133_40.log`). Sea battle 20885: 24/24, 22/18, 16/16 elements at 250/60/25 m/px (`critic/c59_sb_seaballs.20885_107_1188.17_328.5.log`). |
| **Naval warfare (needs 8)** | 7 | **7** | **Run 58's bar met on every case it named; held at 7 by a new break (R59-B1).** <ul><li>**R58-B1 (i)** `landingInvariants 29043 15101 120 29043 30,90 2` and `… 29043 15101`: **0 broken** (`critic/c59_li_29043_g2.log`, `critic/c59_li_29043_15101.log`); **(ii)** run 58's 306 setups **306 at 0** (`critic/c59_liab.log`); R57-B1's 28037 od8 and 28039 g1 **0** (`critic/c59_li_28037_od8.log`, `critic/c59_li_28039_g1.log`).</li><li>**(iii) R58-N2** 319 told (UI row). **(iv) R58-N1** 28037: 366 told `NextVoyage` at t274, the hour its landing sails without it, and ashore at t522, **14.3 days** (19.4 on run 58's sim; `critic/c59_told_28037.log`, `critic/c59_od_28037_366.log`); the last-ashore measure on the same 100 setups: HEAD 6 of 26 over 7 days, run 58's sim 6 of 26, only 28037 differs, for the better (`critic/c59_la/`, `node critic/scripts/c59_lasum.mjs`). **(v)** `c59_stuckret` 153 runs, 0 spells, checker 0 (`critic/c59_sr.log`); Malta's 18 the same 12 thrown back near Catania and 6 broke off near Palermo, the same words.</li><li>**R57f:** 28061's three years 37 sea battles (46 on run 58's), Japan's Sevastopol landings gone, Italy's two left (`critic/c59_sb_28061.log`).</li><li>Checkers on new seeds: landingRows 115 cases, 20,321 hours, 0 (`critic/c59_lrows_all.log`); repulse 30071/30073 0; landingInvariants 30021/30023 0; seaBattles 30061: 42 battles, `seaBattlesLook` 42/42 seen, 0 page errors (`critic/c59_sbl_30061.log`). Landings on new seeds play out and are told: 30105/30107 "over: 8 landed"; 30109/30111 "over: 4 landed"; 30113/30115 "its transports were sunk; 6 never sailed", all six told.</li></ul> **Held at 7** by R59-B1 (30041: `slowClick` 9.5 days over on HEAD, 0 on run 58's tree, the sim the same; 1 of 90 new setups). **What the bar needs:** (i) `npx tsx tools/diag/landingInvariants.ts 30041 3517 120 30041 30,90 1` at 0 broken with 366 kept in t729's click; (ii) `P=2 sh critic/scripts/c59_liab_new.sh` (90 runs) and `P=3 sh critic/scripts/c59_liab_head.sh` (306) all 0; (iii) `KEEPG=1 SEED=30041 SETUP=3517 DIV=366 FROM=725 TO=985 npx tsx critic/scripts/c59_h366d.ts`: 366's walk from 1808.9,389.5 to its port within what its best way allows (or the click told it cannot be ashore within the bound); (iv) R58-B1's and R57-B1's cases, `c59_stuckret`, Malta's 18 unchanged. |
| Tanks (needs 8) | 8 | 8 | **Re-earned.** 30115: armoured division 40 from 250 to 10 m/px, elements and individuals at every zoom (452 / 7,418 at 80 m/px, 320 / 13,286 at 25), live at 15 m/px with sorties overhead, week 2 in the melee (`critic/c59_c_battle.30115.log`, `critic/shots/c59c_30115_*`). |
| Aircraft (needs 8) | 8 | 8 | **Re-earned.** 30127: the patrolling fighter followed, its mark in 60 of 60 samples at 3,000 m/px, median 90 px from its sorties (`critic/c59_w_wing.30127.log`). 30125: 37 planes in hour 2, marks from 3,000 to 25 m/px in both looks (`critic/c59_pl_planes.30125_GER_POL_5359.log`). Air war told monthly ("France and Brazil fought in the air this month", `critic/shots/c59new_mine_30309_1600x900_FRA_mine.png`). worldInvariants (air) 0. |
| AI nuclear use (needs 8) | 8 | 8 | **Re-earned in HEAD's own world and on run 58's save.** 30301 saved at year 12 on HEAD: the game pauses on Belgium's A-bomb on Syria near As Suwayda (1,000 civilians; 16,800 men) and on Nationalist Spain near Pamplona, each with its alert, "Go to" and ticker row (`critic/c59_an_ainuke_30301.log`, `critic/shots/c59an_30301y12_0_alert.png`); run 58's 7019 save on HEAD: the same two strikes as run 58 (`critic/c59_an_ainuke_c58bin.log`). Detonations over 22 years, three seeds: 18 on HEAD, 21 on run 58's sim (bursty, seed by seed both ways; `critic/c59_lc/n*.log`). HEAD's own 7019 world has none in the 400 days after year 20. **Not 9:** "0 civilians killed" beside 22,679 men (old). |

## Blocking issues

1. **R59-B1 (naval; breaks a rule checker): `slowClick` broken on HEAD, new seed 30041, setup 3517, one group kept.**
   - `npx tsx tools/diag/landingInvariants.ts 30041 3517 120 30041 30,90 1` → "t1040 slowClick: t729's click of 366 not
     ashore after 13.0 days, its best way 5.9", **1 broken**, worst "t729's click of 366 ashore after 15.4 days, its best
     way 5.9" (9.5 days over). Red five times: `critic/c59_li/new_30041_3517_g1_od-.log`, `critic/c59_li_30041_g1_rerun.log`,
     `critic/c59_hookab_{none,noop,events}.log`.
   - **Run 58's tree (`000a4731`, sim and checker) on the same command: 0 broken** (`critic/c59_li_30041_g1_oldsim.log`).
     **The sim is the same on both:** 366's hourly trace from t600 to t1110 (place, landing, aboard, cell owner) is
     line for line the same on HEAD and on `000a4731` (`critic/c59_h366_30041.log`, `critic/c59_h366_old_30041.log`;
     `KEEPG=1 SEED=30041 SETUP=3517 DIV=366 FROM=600 TO=1110 npx tsx critic/scripts/c59_h366.ts`).
   - **What happens** (`critic/c59_h366d_30041.log`, `critic/c59_told_30041_all.log`): Japan clicks 364–366 at t729 onto
     1715.0,413.7 (best way 5.9 days). 366, at 1808.9,389.5 on Japan's own land, joins landing L4 (port near Tokyo,
     1819,386) and **walks 11 cells in 10.4 days** (about one cell a day, moving, never engaged: 1809.6 at t744, 1813.5
     at t864, 1818.2 at t960), boards at t980, lands near Shanghai at t1099 (`FormationLanded` on China's land): 15.4
     days after the click. At t870 366 is clicked again (364–366 onto 1717.0,413.7) and refused (`MoveRejected` t871).
   - **Why it breaks now and not before:** run 58's checker took 366 out of t729's click at the t870 re-click, so the
     click was never judged; R57a's reading (ADR-908: a division whose new order is refused stays in its earlier click)
     keeps it, so the slow walk is judged. The reading is right (the player's t729 order is what 366 obeyed); what it
     exposes is a landing whose best way assumes a march about twice as fast as the one the division makes to its port.
     That pace is not 366's alone: on 28041 (setup 3517, orders for 8 days) 367 walks 50 cells on Japan's own land in
     48 days, t279 to t1440, the same cell a day (`critic/c59_od_28041_367.log`), so the reckoning, not the division,
     looks wrong.
   - **Scale:** HEAD 1 of 90 new setups (30031–30059 × 6, `critic/c59_liab_new.log`), run 58's tree 0 of the same 90
     (`critic/c59_liab_new_old.log`); run 58's 306 setups 306 at 0 on HEAD (`critic/c59_liab.log`).
   - **Fix:** the best way (`clickBest`, `Landing.due`) and the march to the port read alike: the walk to the port
     reckoned at the pace divisions make (about a cell a day for 366 and for 28041's 367); and a click that cannot be
     ashore within the bound told so at the click.
   - **What the bar needs:** `npx tsx tools/diag/landingInvariants.ts 30041 3517 120 30041 30,90 1` at 0 broken with
     366 still kept in t729's click (no checker change that drops it); `P=2 sh critic/scripts/c59_liab_new.sh` (90 runs)
     all 0; `P=3 sh critic/scripts/c59_liab_head.sh` (306) still all 0; R58-B1's and R57-B1's cases still 0.

## Non-blocking issues (prioritised)

1. **R59-N1 (naval/UI): the left-behind division still waits most of a week, and is told with no figure.** 29043 setup
   15101: 273 is left at its port at t1170 for want of room, told "waits for the next voyage" that hour
   (`critic/c59_told_29043_273.log`), sails at t1284 and lands at t1340: **11.3 days after the t1068 click, best 3.4**,
   the same hours as on run 58's sim (`critic/c59_od_29043_273.log`). The checker passes it now because 271 is kept in
   the click (first ashore 6.6 days); 273's wait is unchanged. R57b's own wording asked for "sails on the next voyage,
   in about N days"; the strings have no figure (`order.nextVoyageBrief`, `formation.voyage.nextVoyage`).
2. **R59-N2 (UI, new with R57c): a kept notice never ages.** 27125 at h400 (11 days after its landing ended): 323 and
   324 "On the march", their panels still in orange "the transports of its landing were sunk … the landing is over"
   with no date (`critic/shots/c59wt_27125_323_h400.png`, `critic/c59_whotold.27125_ITA_ENG_1095.5_344.5_1106.5_383.5_6_400.log`);
   30113's six the same at h400. Not false, but a warning-coloured line about a landing long over reads as live news.
   A date ("5 Jan: …"), or the line dropped once the division has a new order, would fix it.
3. **Small:** 27125 h140: the ticker keeps three of the four "came ashore near Palermo" rows (320–322; 319's row only
   in its panel, `critic/c59_whotold.27125_ITA_ENG_1095.5_344.5_1106.5_383.5_6_140.log`); on a phone the nation panel
   still covers the breakthrough corridor (`critic/shots/c59new_corridor_30307_390x844_d6_1500m.png`, old); the editor
   probe's real-time day-60 wait stalled again (the probe's; day 30 reached, Poland's ten warheads kept); at 844 × 390
   the new peace reason line is cut at the panel's foot on day 0 (`critic/shots/c59pb_30403_GER_POL_844x390_disabled_d0.png`).

## Run 58's cases re-run

| Run 58 case | `000a4731` (run 58) | HEAD `fe9b0e9e` | Evidence |
|---|---|---|---|
| **R58-B1** `landingInvariants 29043 15101 120 29043 30,90 2` | 1 broken (273, 8.0 days over) | **0 broken**; 273 still lands at t1340, 11.3 days after t1068, told "waits for the next voyage" at t1170; the click is now judged by 271, kept in it (6.6 days) | `critic/c59_li_29043_g2.log`, `critic/c59_od_29043_273.log`, `critic/c59_told_29043_273.log` |
| **R58-B1** `… 29043 15101` | 1 broken (272) | **0 broken** | `critic/c59_li_29043_15101.log` |
| **R58-B1** `c58_liab_head.sh` (306 runs) | 1 broken | **306 at 0** | `critic/c59_liab.log` |
| R57-B1 28037 od8, 28039 g1 | 0, 0 | 0, 0 | `critic/c59_li_28037_od8.log`, `critic/c59_li_28039_g1.log` |
| `c58_stuckret` (153 runs) | 0 spells, checker 1 (29043) | **0 spells, checker 0** | `critic/c59_sr.log` |
| Malta's 18 | 12 thrown back near Catania, 6 broke off near Palermo | the same 18 endings, the same words | `node critic/scripts/c59_lsum.mjs critic/c59_lland_ita_malta_*.json` |
| **R58-N1** `SEED=28037 ORDERDAYS=8 DIV=366 c58_orderdays.ts` | 366 ashore at 19.4 days, untold | **told at t274; ashore at 14.3 days** | `critic/c59_od_28037_366.log`, `critic/c59_told_28037.log` |
| Last-ashore measure (100 setups, both sims) | 6 of 26 over 7 days | 6 of 26; only 28037 differs (12.7 → 7.6 days over) | `node critic/scripts/c59_lasum.mjs` |
| **R58-N2** `c58_whotold 27125 … 6 140` | 319 "Landed", no notice | **319 told**, all six | `critic/shots/c59wt_27125_319_h140.png` |
| R58-N2 `c58_whotold 28113 …` | all six | all six | `critic/c59_whotold.28113_*_120.log` |
| **R58-N3** `c58_peacebtn 29403` at 390 × 844 | grey button, reason only in a title | **reason in a line under the war row** | `critic/shots/c59pb_29403_GER_POL_390x844_disabled_d0.png` |
| R58 small: 27125 h132 bar | "sails in about a day · 0 at hand" | "gathering · 12 transports needed, 0 at hand", no sail hour | `critic/shots/c59lh_ita_malta6_27125_h132_1500m.png` |
| R58 small: weariness 39.97 | "40 of 40", refused | "40, over 40 needed", refused | `critic/c59_pb_29401_GER_POL_1600x900.json` |
| R58 small: 28061 Japan in the Black Sea | 8 battles, 0 Soviet losses, 46 in all | none of Japan's; 37 in all; Italy's two left (ADR-913) | `critic/c59_sb_28061.log` |
| landingRows all | 115 cases 0 | 115 cases, 20,321 hours, 0 | `critic/c59_lrows_all.log` |
| AI nukes on run 58's 7019 y20 save | two strikes, paused, told | the same two on HEAD | `critic/c59_an_ainuke_c58bin.log` |
| Frame rates on the same save; tick time seed 99 | 59.6–60.2 / 54.5–55.6 / 54.7–55.5 fps; 2.2583 ms | 59.7–60.1 / 54.6–56.4 / 55.1–55.9 fps; 2.2339 ms (2.2457 on run 58's sim, the same session) | `critic/c59_pf_lookfps.log`, `critic/c59_sim99_*.log` |

## Design objections (none blocking, no score lowered)

- **ADR-843's `slowClick` judges a click by its first division ashore.** R57a made the checker keep a refused re-click's
  division in its click, which is right, and R59-B1 is the first time that reading judges a slow walk the old one hid.
  29043's 273 shows the other side: the click passes on 271 while 273, told, lands 7.9 days over the best way. The
  player clicked them all; the last one ashore is what they see.
- **Malta is never taken** (18 of 18 again).
- **Alliances and wars ignore the map** (France against Brazil; Australia fighting Peru in Ecuador).

## Ideas from other games (not scored)

- Hearts of Iron's naval invasion screen shows each division's state with a time ("next lift in N days"); R57b's own
  wording asked for the figure.
- Paradox games date each notification in the outliner; a kept panel notice with its date (R59-N2) would read as history,
  not live news.

## Strengths (verified)

- **Batch 12's six items are done on the critic's own cases**, and on new ones: 306 of 306 landing setups at 0, the
  left division told at the sail hour, every division at Valletta and Norwich told, the phone's peace button explained
  on day 0, a save loaded at seven hours of one landing (gathering, sailing, sailed once and gathering again) running
  on to the same hash every hour.
- **The rules hold at scale on new seeds:** diploInvariants 0 on six 5–10-year runs, worldInvariants 0 on four,
  workerDeterminism the same hash on every arm, landingRows 0 on 115 cases, 42 of 42 sea battles drawn, 0 page errors
  in every page probe, and R57f's new rule costs nothing in tick time.
