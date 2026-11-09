# Critic report, run 58 (full): after batch 11 (R56a–R56e)

- **Mode: full.** Decided from git first (CRITIC_PROMPT, ADR-804). Run 57 (`5c7cb418`, on `d3519cb0`) has a blocking
  issue (R57-B1) and a score under its bar (naval 7), and runs 55–57 were not all focused (57 full). But the
  commit-kind test fails: `5c7cb418` filed R56a–R56c only; `f888b8ab` (R56d) and `000a4731` (R56e) name items that
  commit did not file, and both change `src/` (`src/ui/ActionsTab.tsx`; `src/render/units/ball*.ts`,
  `src/sim/systems/landings.ts`, `src/worker/server.ts`, …). So the whole brief: every dimension scored afresh.
- **Commit judged:** `000a4731c9ef60089ad000ebae459891e44294de`, HEAD at the start, clean tree (`critic/c58_commit.txt`).
- **Build:** `vite build --outDir critic/c58_dist`, exit 0 (`critic/c58_build.log`), `vite preview` on 127.0.0.1:5358.
  Playwright Chromium, 1600 × 900 unless named. The last report's commit `d3519cb0`'s `src/`, `tests/helpers/`,
  `tools/`, `data/` and `public/data/` extracted read-only with `git archive` to `critic/old/` (the critic's git guard
  blocks `git worktree add`), so run 57's sim could be run beside HEAD's on the same seeds (deleted after the run; re-create with `git archive d3519cb0 src tests/helpers tools/diag tools/headless data public/data package.json tsconfig.json | tar -x -C critic/old` and a `node_modules` junction); and run 57's checker
  (`5c7cb418`'s `tests/helpers/slowClick.ts`) copied to `critic/oc/` to judge HEAD's sim with the old rule. Server
  stopped, browsers closed at the end.

## Verdict

**Batch 11 fixed what it set out to fix, on the critic's own cases: R57-B1's two seeds are at 0 broken, all 246 of run
57's landing setups are at 0, the bar says where those thrown ashore came ashore, all six at Norwich are told, the
Actions tab's "Offer peace" greys with the reason, and the Spanish Republic's purple shows on its ships. But on new
seeds HEAD breaks `slowClick` again (29043, setup 15101: a click held 8.0 days over its best way; run 57's sim with its
own checker 0 on the same setup), which by this brief is blocking (R58-B1). Two run-57 defects come back in new shapes:
the four-row news bound still strands a division with no word (27125's 319, "Landed" while the bar counts it "near
Palermo, away from Valletta"), and on 28037 the fix lands the click in pieces (365 at 9.1 days, 366 at 19.4 against a
best way of 6.7, where run 57 landed both at 14.2). Naval stays 7; every other dimension holds at 8.**

## Scores

| Dimension | Run 57 | Run 58 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Re-earned on new seeds.** <ul><li>God's H-bomb on Paris (29117): mushroom, ring, alert with "Go to", "3,329,000 civilians killed" (`critic/shots/c58a_29117_13_paris_h_strike.png`).</li><li>12-year watch at Max (29141, heroes): the USA across Canada and Mexico, Germany from Scandinavia to Iberia, every chip and ticker row whole (`critic/shots/c58lwhon_29141_y12_world.png`); a random world after a year reads as well (`critic/shots/c58rw_random_29165_end_world.png`).</li><li>**R56e's flag fixed:** at 40 m/px the Spanish Republic's destroyers show red-yellow-purple, Nationalist Spain's cruisers red-yellow (`critic/shots/c58_t316_NSP_REP_crop.png`, from `critic/seaBattles_28061_shots/t316_NSP_REP.png`).</li><li>Breakthrough corridor drawn day 3–10, gone day 11, desk and phone (`critic/c58_new.corridor_29307_1600_900.log`, `critic/c58_new.corridor_29307_390_844_m3000.log`).</li></ul> **Not 9:** the relations graph is still a knot: 26 nations left out at day 365 on desk (`critic/shots/c58rg_29129_desk_d365.png`), unreadable on a phone at day 730 (`critic/shots/c58rg_29131_phone_d730.png`); at 250 m/px on a phone the labels cover the units (`critic/shots/c58phz_29133_00250.png`); ten days after an H-bomb Paris at 30 m/px shows no ruin (`critic/shots/c58a_29117_20_paris_30m_day10.png`, the same on run 57's). |
| Diplomacy, war, alliance, puppet, revolt depth | 8 | 8 | **Re-earned.** <ul><li>diploInvariants **0 broken** on new 29001 (random, 10 y), 29003 (heroes, 10 y), 29005 (random world, 5 y), 29007, 29009 (random, heroes), 29011 (10 y each) (`critic/c58_diploinv_29*.log`).</li><li>**R57-N2 fixed (ADR-906):** new probe `critic/scripts/c58_peacebtn.mjs`, 29401 as Germany at war with Poland: day 0–35 "Offer peace" disabled, title "They refuse: lead the war score by 25 (now +0), or wear them out (war weariness 35 of 40)", the right-click menu the same verdict each sample; a forced click does nothing; day 40 (weariness 46) enabled, clicked, "Germany made peace with Poland" (`critic/c58_pb_29401_GER_POL_1600x900.json`). 28401 by run 57's probe: the +0 offer pressed, no war ended and nothing broken (`critic/c58_dp_28401_GER_POL_1600x900.json`).</li></ul> **Not 9:** on a phone the reason is a `title` and cannot be read: a grey button with no word (`critic/shots/c58pb_29403_GER_POL_390x844_disabled_d0.png`; R58-N3); at weariness 39.97 the title says "40 of 40" and refuses (`critic/c58_pb_29401_GER_POL_1600x900.json`, day 35); alliances still ignore the map (France at war with Brazil and Japan in 1938–39, `critic/shots/c58new_mine_29309_1600x900_FRA_mine.png`). |
| Emergent world dynamics | 8 | 8 | **Re-earned on new seeds** by run 55's measure (`c58_topArea.ts`): 29097 longest still 9 (Canada), 29099 6 (Canada), under 20; on 29099 France rises to 14.6 % by year 10 and falls to 9.5 %, China rises from 5 % to first at 11.6 % by year 25; the first three change 9 and 13 times (`critic/c58_toparea_2909*.log`). Two 12-year watches at Max: 104 → 73 and 96 → 68 nations, wars on every continent (`critic/c58_lwhon_29141.json`, `critic/c58_lwplain_29143.json`). **Not 9:** far-flung pairs still drive much of it (France and Brazil, Canada and Siam, Japan's fleets fed one squadron a week into the Black Sea and sunk, 8 battles 0 Soviet losses, 28061 t19734–t21576, `critic/c58_sb_28061.log`; the same on run 57's). |
| God Mode | 8 | 8 | **Re-earned.** Nuke (H and A), Revolt, Spawn, Found, Raze each told in the ticker (`critic/c58_a_29117.json`, `critic/c58_q_29119.json`). Breakthrough at war: engaged 19 → 56 by day 7 (`critic/c58_kw_breakthrough.29123.log`); in History, the CSV and the JSON (`critic/c58_kwhist.29151.log`). Phone Breakthrough corridor made and drawn to day 10 (`critic/c58_new.corridor_29307_390_844_m3000.log`). **Not 9:** God's tools still reach only the selected nation's side; no undo. |
| Editor and scenarios | 8 | 8 | **Re-earned.** 29121: fleets and a bomber placed, a fleet at Berlin refused ("Not done: no water of a sea is near the place."), exported and loaded, a sea battle by day 1, Poland's ten warheads kept to day 30 (`critic/c58_g_29121.json`). The editor filter: "uk" → Manchukuo and the UK, "FRANCE", " fra", desk and phone (`critic/c58_new.filter_29305_*.log`). The run-26 scenario file loads and starts (`critic/shots/c58os2_c58_loaded.png`). **Not 9:** the probe's real-time day-60 wait stalled again (the probe's, not filed). |
| Stats and history | 8 | 8 | **Re-earned on HEAD's 7019 year-20 save** (hash `78d08a02`, the same world as run 57's). History opens in 155 ms, 3,206 events (`critic/c58_hi_7019.json`); CSV and JSON export (`critic/c58_dl_7019.csv`, `critic/c58_dl_export.7019_critic_c58_seed7019_y20.bin.log`); "My wars only" as France, 42 of 497 (`critic/shots/c58new_mine_29309_1600x900_FRA_mine.png`). **Not 9:** the same France list has 15 sea battles in ten weeks with France losing 39, 26, 24 ships a day to Japan and no row saying where (old). |
| UI/UX and polish | 8 | 8 | **Re-earned.** <ul><li>**R57-N1 fixed (ADR-904):** 27125 h120 the bar reads "4 came ashore near Palermo, away from Valletta; gathering · 12 transports needed, 7 at hand: 2 voyages" (`critic/shots/c58lh_ita_malta6_27125_h120_1500m.png`, `critic/c58_lhold.27125_*.log`).</li><li>**R57-N3 fixed for its case (ADR-905):** 28113, all six told, "6 divisions: … (1, 2, 3, 4, 5, 42)" (`critic/c58_whotold.28113_*.log`).</li><li>Build tab at 844 × 390 and 390 × 844 whole (`critic/c58_new.build_29301_*.log`); 0 page errors in every c58 page probe.</li></ul> **Not 9:** R58-N2 (27125's 319 untold, "Landed"), R58-N3 (the phone's silent grey button), and "sails in about a day · 0 at hand" six hours before the landing ends for want of transports (`critic/shots/c58lh_ita_malta6_27125_h132_1500m.png`, the same on run 57's). |
| Performance | 8 | 8 | **Re-earned, alone, after every other job** (`critic/scripts/c58_pf.sh`), on HEAD's 7019 year-20 save (hash `78d08a02`, the same world as run 57's). `c58_pf_lookfps.mjs`: 3,000–600 m/px 59.6–60.2 fps, 120 m/px 54.5–55.6, 30 m/px 54.7–55.5 (`critic/c58_pf_lookfps.log`), within run 57's 59.2–60.2 / 52.8–56.8 / 53.8–56.6. `tools/diag/lookFps.ts` with a draw forced each frame: 58.8–60 frames/s at every zoom, p95 17.7–20.4 ms, a draw 1–2.4 ms (`critic/c58_lookfps.log`). Tick time, seed 99, 5 years, pinned to the P-cores, one after the other: mean 2.2583 ms HEAD, 2.2564 ms run 57's sim (`critic/old`), the same final hash `5d741080` (`critic/c58_sim99_head.log`, `critic/c58_sim99_old.log`). Two 12-year watches at Max: 59.7–60 fps a year, longest gap 117 ms, 0 over 500 ms (`critic/c58_long_watch2.2914*.log`); touch 59.4–59.9 (`critic/c58_tm_touch..log`). **Not 9:** 120 and 30 m/px over the busiest land fight still 54–56 fps, and the dense unit-zoom case is a light scene (at most 232 elements at 30 m/px). |
| Stability | 8 | 8 | **Re-earned.** Save/load in the page (29137): saved at t4800 (`2699795946`), 200 days → `4170796936`, loaded twice, the same both times (`critic/c58_saveload_page.29137.log`). workerDeterminism 29059: `d6b6f96d` on all arms (`critic/c58_wd_29059.log`). worldInvariants 0 broken on 29051, 29053 (heroes), 29055 (ten years), 29057 (random world) (`critic/c58_wi_*.log`). Two 12-year watches at Max: 0 page errors, 0 frames over 500 ms (`critic/c58_lw*_2914*.json`). |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Re-earned on new seeds.** 29111: one camera from world to 3 m/px, elements to 3 m/px, individuals from 28.3 m/px (13,831) (`critic/c58_z_zoom.29111.log`). Phone 29133 from 30,000 to 25 m/px, a tap at the centre opens China's panel (`critic/c58_phz.29133_40.log`, `critic/shots/c58phz_29133_*.png`). Sea battle 20885: 24/24, 24/19, 18/16 elements at 250/60/25 m/px (`critic/c58_sb_seaballs.20885_*.log`). |
| **Naval warfare (needs 8)** | 7 | **7** | **R57-B1 closed on its cases; held at 7 by R58-B1.** <ul><li>**R57-B1 (i)** 28037 orders for 8 days: **0 broken** (`critic/c58_li/head_28037_3517_g2_od8.log`); **(ii)** 28039 g1: 0 broken under HEAD's checker (`critic/c58_li_28039_g1.log`; run 57's checker on HEAD's sim still breaks it, the checker was changed to keep an aboard division in its click: ADR-903's reading, accepted); **(iii)** run 57's 246 setups **246 at 0** (`critic/c58_liab.log`); `c58_stuckret` 0 spells in 153 runs (`critic/c58_sr.log`); Malta's 18 the same endings.</li><li>**R57-N1, N3 and the small items fixed** (UI row, above; `seaBattlesLook` 46/46 and 53/53 seen with one-side battles told, `critic/c58_sbl_28061.log`, `critic/c58_sbl_29061.log`; the Republic's purple).</li><li>Checkers on new seeds: landingRows 115 cases 0 (`critic/c58_lrows_all.log`); repulse 29071/29073 0 (`critic/c58_repulse_2907*.log`); landingInvariants 29021/29023 0 (`critic/c58_li_2902*.log`); seaBattles 29061: 53 battles all drawn, 0 page errors.</li><li>Landings on new seeds play out and are told: 29105/29107 the UK's ten to Germany's coast "over: 8 landed"; 29109/29111 "over: 4 landed" with the four on the mainland walking; 29113/29115 "transports were sunk; 6 never sailed", all six told (`critic/c58_wt_GER_29113_h120.json`); 29117 cancel as run 57.</li></ul> **Held at 7** by R58-B1 (29043, `slowClick` 8.0 days over on HEAD, 0 on run 57's sim), R58-N1 (28037's click in pieces, 366 at 19.4 days) and R58-N2 (319 untold, "Landed"). **What the bar needs:** (i) `npx tsx tools/diag/landingInvariants.ts 29043 15101 120 29043 30,90 2` and `… 29043 15101` at 0 broken, with the sim and the checker reading a click onto the sea beside one's own landing alike; (ii) `P=3 sh critic/scripts/c58_liab_head.sh` (306 runs) all at 0 and R57-B1's two cases still 0; (iii) `node critic/scripts/c58_whotold.mjs 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 140`: 319's panel with its notice, as 320–322's; (iv) `SEED=28037 ORDERDAYS=8 DIV=366 npx tsx critic/scripts/c58_orderdays.ts`: 366's news and panel from t274 saying it waits for the next voyage (not checked by this run: verify on the page), or 366 ashore within the bound; (v) `c58_stuckret` still 0 and Malta's 18 the same. |
| Tanks (needs 8) | 8 | 8 | **Re-earned.** 29115, day 5: armoured divisions 40 and 42 at 15 m/px live, tank balls with treads and guns, Polish infantry facing, sorties overhead (`critic/shots/c58c_29115_arm_15m_live_1.png`); elements and individuals at every zoom, week 2 in the melee (`critic/c58_c_battle.29115.log`). |
| Aircraft (needs 8) | 8 | 8 | **Re-earned.** 29127: the patrolling fighter is followed, its mark in 61 of 61 samples at 3,000 m/px, median 44 px from its sorties (`critic/c58_w_wing.29127.log`). 29125: planes in hour 2 (37), marks from 3,000 to 25 m/px in both looks (`critic/c58_pl_planes.29125_GER_POL_5358.log`). Air war told monthly ("France and Japan fought in the air this month: France lost 3 aircraft, Japan 3", `critic/shots/c58new_mine_29309_1600x900_FRA_mine.png`). worldInvariants (air) 0. |
| AI nuclear use (needs 8) | 8 | 8 | **Re-earned on HEAD's 7019 save** (hash `78d08a02`, the same world as run 57's): the game pauses on the Soviet Union's A-bomb on Nationalist Spain near Burgos (9,965 men) and China's on Australia near Denpasar (31,000 civilians), each with its alert, "Go to" and a ticker row (`critic/c58_an_ainuke.7019_*.log`). **Not 9:** "0 civilians killed" beside 9,965 men (old). |

## Blocking issues

1. **R58-B1 (naval; breaks a rule checker): `slowClick` broken on HEAD, new seed 29043.**
   - `npx tsx tools/diag/landingInvariants.ts 29043 15101 120 29043 30,90 2` → "t1317 slowClick: t1068's click of 273 not
     ashore after 10.4 days, its best way 3.4", **1 broken**, twice (`critic/c58_li/head_29043_15101_g2_od-.log`,
     `critic/c58_li_29043_g2_rerun.log`); worst "ashore after 11.3 days, its best way 3.4", 8.0 days over. The default
     setup `… 29043 15101` breaks too, another click ("t1055's click of 272 not ashore after 11.4 days, its best way
     4.4", `critic/c58_li_29043_15101_rerun.log`).
   - **Run 57's sim with its own checker, the same commands: 0 broken** (`critic/c58_li_29043_g2_oldsim.log`,
     `critic/c58_li_29043_15101_oldsim.log`). **Run 57's checker on HEAD's sim: the same break**
     (`npx tsx critic/oc/li.ts 29043 15101 120 29043 30,90 2`), so it is the sim's, not the batch's checker change.
   - **What happens** (`critic/c58_od_29043_273.log`, `c58_orderdays3.ts`; `DIV=271` for its sibling): the UK clicks 270–274
     at t1068 onto 1034.5,279.5; their landing (L7, fleet 1076) waits at port 473 (1005,275) until ready at t1169 (4.2
     days, already past the best way of 3.4), then sails with 271 and 272 and leaves 273 at the port for want of room. At
     t1195 271 and 272, at sea in L7, are clicked again onto the sea cell 1034.5,277.5: the sim keeps them in L7
     (ADR-903) and they land at t1226, 6.6 days after t1068; the checker reads the sea click as "no landing"
     (`landingOf` of that cell is none, `critic/c58_water.ts`) and drops them from the click, so t1068's click is
     judged by 273 alone, which sails on the group's second voyage at t1284 and lands at t1340.
   - **Two readings, one break:** the sim and the checker disagree on what a click onto the sea beside one's own landing
     is (the sim: the same landing; the checker: no landing), and the click's left-behind division still lands 8 days
     over its bound. Either way the checker breaks on HEAD and not on run 57's sim.
   - **Scale:** HEAD 1 of 306 runs (run 57's 246 setups all 0, `critic/c58_liab.log`; the new 29031–29049 × 6, 1);
     `c58_stuckret` 0 spells in 153 runs, its checker line the same 29043 break (`critic/c58_sr.log`).
   - **Fix:** one reading of "the same landing" in the sim and the checker (the checker keeping a division in its click
     when the sim keeps it in its landing, read after the step from `landingOfDivision`, not from the click cell's
     water), and a click with too little room told at the click, or its second voyage held to the bound.
   - **What the bar needs:** `npx tsx tools/diag/landingInvariants.ts 29043 15101 120 29043 30,90 2` and `… 29043 15101`
     at 0 broken; `sh critic/scripts/c58_liab_head.sh` (306 runs) all at 0; R57-B1's two cases still 0.

## Non-blocking issues (prioritised)

1. **R58-N1 (naval, from R56a): 28037's click now lands in pieces.** `SEED=28037 ORDERDAYS=8 DIV=366 npx tsx
   critic/scripts/c58_orderdays.ts`: the landing sails at t274 with 365 alone while 366 is still marching; 366 reaches
   the port at t397, waits there 5 days (st0, "no ground gained") and lands at t645: **19.4 days after the t179 click,
   12.7 over its best way of 6.7** (`critic/c58_od_28037_366.log`, `critic/c58_od_28037_365.log`). Run 57's sim, the same
   command in `critic/old`: both land together at t519, 14.2 days. `slowClick` judges the first ashore (ADR-843), so the
   checker reads 9.1 days and passes. At scale the new last-ashore measure (`critic/scripts/c58_lastashore.ts`, both
   sims, the same 100 setups of 28031–28059 and 29031–29049) shows no trend: HEAD 6 of 26 multi-division clicks with the
   last ashore over 7 days past the best way, run 57's sim 6 of 27, the same per setup (`critic/c58_lasum.txt`,
   `critic/c58_la/`); so 28037 is one case, and landing a click's last division late is old and broad (the metric is the
   critic's, checked against the trace on 28037 only). Fix: a division left by a due landing told so at that hour ("it sails on the next
   voyage, in about N days"), and its next voyage held to the click's bound.
2. **R58-N2 (naval/UI, R57-N3's other shape): a division thrown ashore away from the target left with no word.**
   27125, six to Valletta, h140 (`node critic/scripts/c58_whotold.mjs 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 140`):
   the bar says "over: its transports broke off; 4 came ashore near Palermo, away from Valletta, 2 never sailed"; 320,
   321 and 322 say so in their panels; **319's panel says only "Status Landed"**, no notice (`critic/c58_wt_ITA_27125_h140.json`,
   `critic/shots/c58wt_27125_319_h140.png`). The four-row bound keeps 320–322's rows and the 2-division "sunk" row; R56c
   grouped only `lostAtSea`/`transportsSunk` rows, not four "broke off" rows of one hour. The same on 29101 (`critic/c58_lland_ita_malta6_29101.json`, news 320–322 only). Fix: group a landing's
   same-hour outcome rows as R56c did, or keep each division's last notice on its panel whatever the ticker keeps; and
   "Landed" for one ashore near Palermo, away from its target, should say so.
3. **R58-N3 (UI, new with R56d): on a phone the greyed "Offer peace" gives no reason.** 29403, 390 × 844, Germany at war
   with Poland: the button is grey and its reason is only a `title` (`critic/shots/c58pb_29403_GER_POL_390x844_disabled_d0.png`,
   `critic/c58_pb_29403_GER_POL_390x844.json`); a touch shows no tooltip. The menu's item is the same (old). Fix: the
   reason as a line under the war row (or on tap), as the Build tab's "not researched".
4. **Small:** at h132 the 27125 bar says "sails in about a day · 12 transports needed, 0 at hand", and six hours later
   the landing is over for want of transports (`critic/shots/c58lh_ita_malta6_27125_h132_1500m.png`; the same on run 57's);
   "war weariness 40 of 40" refused (39.97, rounded); Japan's Black Sea squadrons sunk one a week for 8 weeks (28061,
   old).

## Run 57's cases re-run

| Run 57 case | `d3519cb0` (run 57) | HEAD `000a4731` | Evidence |
|---|---|---|---|
| **R57-B1 (i)** `landingInvariants 28037 3517 120 28037 30 2 8` | 1 broken (7.5 days over) | **0 broken**; 9.1 days (365), 366 on the next voyage at 19.4 | `critic/c58_li/head_28037_3517_g2_od8.log`, `critic/c58_od_28037_36*.log` |
| **R57-B1 (ii)** `… 28039 3517 120 28039 30,90 1` | 1 broken | **0 broken** under HEAD's checker (365, aboard and clicked again, kept in its click); run 57's checker on HEAD's sim: still 1 ("366 not ashore after 17.7 days, best 10.7") | `critic/c58_li_28039_g1.log`; `npx tsx critic/oc/li.ts 28039 3517 120 28039 30,90 1` |
| **R57-B1 (iii)** `c57_liab_head.sh` (246 runs) | 2 broken | **0 of 246**; new 29031–29049 × 6: 1 (R58-B1) | `critic/c58_liab.log` |
| R57-B1 (v) `c57_stuckret`, 153 runs (HEAD only) | 0 | **0 spells** | `critic/c58_sr.log` |
| Malta's 18 | 12 thrown back near Catania, 6 broke off near Palermo | the same 18 endings, the same words | `node critic/scripts/c58_lsum.mjs critic/c58_lland_ita_malta_*.json` |
| **R57-N1** `c57_lhold 27125 … 6 ita_malta6 140` | "4 of 6 ashore" | "4 came ashore near Palermo, away from Valletta; gathering · …: 2 voyages" | `critic/shots/c58lh_ita_malta6_27125_h120_1500m.png` |
| **R57-N2** Offer peace at +0 | silent no-op | greyed, the reason in its title; enabled at the bar, makes peace | `critic/c58_pb_29401_GER_POL_1600x900.json` |
| **R57-N3** `c57_whotold 28113 …` | 1 and 2 untold | all six told | `critic/c58_whotold.28113_*.log` |
| R57 small: voyages, `seaBattlesLook` by side, the Spains' flags | "12 needed, 7 at hand" in red; one side counted seen; alike | ": 2 voyages"; 46/46 seen, 5 told one-side; purple shows | `critic/c58_sbl_28061.log`, `critic/shots/c58_t316_NSP_REP_crop.png` |
| R56-B1 cancel and re-click on 27125 | fixed in run 57 | the same: cancel at h66, re-click forms a new landing, broke off near Naples, told | `critic/c58_turnback.*.log`, `critic/c58_retstuck.27125_*reclick*.log` |
| R56-N1 `c57_frozen` 27123/27127/27129 | 18 h | 18 h, "over: 8 landed" | `node critic/scripts/c58_frozen.mjs critic/c58_lland_eng_br10_271*.json` |
| R56-N2 `ORDERDAYS=8 c57_orderdays.ts` 24033 | refused at the click | the same, 0 broken | `critic/c58_od_24033_8.log` |
| landingRows all | 115 cases 0 | 115 cases, 20,321 hours, 0 broken | `critic/c58_lrows_all.log` |
| AI nukes on 7019 y20 | two strikes, paused, told | the same two (hash `78d08a02` unchanged) | `critic/c58_an_ainuke.7019_*.log` |

## Design objections (none blocking, no score lowered)

- **ADR-843's `slowClick` judges a click by its first division ashore.** After ADR-903 a landing sails "due" without
  its marchers, so a click can pass the bound while its last division lands weeks later (28037: 366 at 19.4 days, R58-N1).
  The player clicked both; the rule should judge what the player sees, the last one ashore, or the left one be told.
- **Malta is never taken** (18 of 18 again).
- **Alliances and wars ignore the map** (France against Brazil and Japan; Canada against Siam).

## Ideas from other games (not scored)

- Hearts of Iron's naval invasion screen shows each division's state (embarked, landed, waiting for the next lift): a
  "2nd lift, about 5 days" line would answer R58-N1.
- Mobile strategy games put a disabled button's reason in a line beneath it (or on tap), never only in a hover tooltip
  (R58-N3).

## Strengths (verified)

- **Batch 11's items are done on the critic's own cases:** R57-B1's two seeds at 0, run 57's 246 landing setups 246 at
  0, the bar's place words, all six told at Norwich, the peace button's verdict matching the menu's at every sample of
  a 40-day war, and the Republic's purple on its ships.
- **The rules hold at scale on new seeds:** diploInvariants 0 on six 5–10-year runs, worldInvariants 0 on four,
  workerDeterminism the same hash on every arm, landingRows 0 on 115 cases, `seaBattlesLook` 99 of 99 battles drawn
  on two seeds, 0 page errors.
