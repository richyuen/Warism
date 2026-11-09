# Critic report, run 57 (full): after batch 10 (R55a–R55j)

- **Mode: full.** Decided from git first (CRITIC_PROMPT, ADR-804). Run 56 (`1fc5a764`, on `d016ed2a`) has a blocking
  issue (R56-B1) and a score under its bar (naval 7), and runs 54–56 were not all focused, but the commit-kind test
  fails: `1fc5a764` filed R55a–R55e only, and `87cc9284` (R55f), `9e2ffbf7` (R55g), `7344e5b3` (R55h), `5671d6c1`
  (R55i) and `d3519cb0` (R55j) name items that commit did not file and change `src/`. So the whole brief: every
  dimension scored afresh.
- **Commit judged:** `d3519cb087698522946dcb373361d1e90f385be9`, HEAD at the start, clean tree (`critic/c57_commit.txt`).
- **Build:** `vite build --outDir critic/c57_dist`, exit 0 (`critic/c57_build.log`), `vite preview` on 127.0.0.1:5357.
  The last report's commit `d016ed2a` in worktree `critic/wt`, built to `critic/c57_olddist` (`critic/c57_oldbuild.log`),
  served on 5356. A second worktree `critic/wt2` (d016ed2a's sim with HEAD's three checker files) for one-checker counts.
  Playwright Chromium, 1600 × 900 unless named. Both servers stopped and every browser closed at the end.

## Verdict

**R56-B1 is fixed, on the page and at scale: the Cancel button frees the division left at the port within hours, a
re-click forms a new landing, and the "returning and still" spell is gone from all 123 HEAD fuzz runs (14 of 45 on
d016ed2a on the same new seeds held one over 48 hours, up to 112 days). Batch 10 also closed R56-N1/N2/N3, R55-N1 and R55-N2, and landings got
much better by the checker's own count: with HEAD's checker, d016ed2a's sim breaks 11 of 45 new "orders for 8 days"
setups, HEAD's 1 of 45. But that 1 is a break of `slowClick` on HEAD only (28037, 7.5 days over the best way against a
bound of 7), which by this brief's own rule is blocking (R57-B1), and the new "n of m ashore" row counts divisions that
came ashore away from the target, so for 18 hours the bar says "4 of 6 ashore" while the panel and news say their
transports broke off near Palermo (R57-N1). Naval stays 7; every other dimension holds at 8.**

## Scores

| Dimension | Run 56 | Run 57 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Re-earned on new seeds.** <ul><li>God's H-bomb on Paris (28117): mushroom, ring, alert with "Go to", 3,329,000 civilians (`critic/shots/c57a_28117_13_paris_h_strike.png`).</li><li>12-year world at Max (28141, heroes): Denmark across Greenland, France across the Sahara and Arabia, every chip and ticker row whole (`critic/shots/c57lwhon_28141_y12_world.png`); a random world after a year reads as well (`critic/shots/c57rw_random_28165_end_world.png`).</li><li>Breakthrough corridor drawn days 0–10, gone day 11, desk (28307) and phone (26307) (`critic/c57_new_corridor_28307_1600x900.json`, `critic/c57_new.corridor_26307_390_844_m3000.log`).</li><li>Held landing mark and the turn-back rows on 27125 (`critic/shots/c57lh_ita_malta6_27125_h120_1500m.png`).</li></ul> **Not 9:** the relations graph at day 365 (28129) still has 35 war edges in a dense knot and 22 nations left out (`critic/shots/c57rg_28129_desk_d365.png`); at a melee labels stack ("Cavalry brigade 573" under "Armoured division 40", `critic/shots/c57c_28115_week2_0080m.png`). |
| Diplomacy, war, alliance, puppet, revolt depth | 8 | 8 | **Re-earned.** <ul><li>diploInvariants **0 broken** on new 28001 (random, 10 y), 28003 (heroes, 10 y), 28005 (random world, 5 y), 28007, 28009 (random, heroes), 28011 (10 y each) (`critic/c57_diploinv_28*.log`).</li><li>**R55-N1 fixed (ADR-901):** 26309 as France: "16 December 1938 France joined the war on Poland's side, as its guarantor" beside "Germany declared war on Poland" and "Germany made peace with Poland"; My wars only keeps all three (23 of 456) (`critic/c57_new_mine_26309_1600x900.json`, `critic/c57_histgrep_26309_FRA.json`).</li><li>The player's own diplomacy by the Actions tab (new probe `critic/scripts/c57_dip_player.mjs`, 28401 and 28403 as Germany): an alliance proposed to Hungary is taken at once and logged ("Hungary joined the Anti-Comintern Pact"); one to the UK is refused before the click with its reason in the title; a peace offered at +32 is taken ("Germany made peace with Poland", "Truce (730 days)") (`critic/c57_dp_28401_GER_POL_1600x900.json`, `critic/c57_dp_28403_GER_POL_1600x900.json`).</li></ul> **But** the same tab's "Offer peace" at +0 does nothing and says nothing (R57-N2). **Not 9:** that, and alliances across the world (Poland in a "Defensive Pact of Afghanistan" with Iran, called into its wars twice in 1938, `critic/c57_histgrep_26309_FRA.json`). |
| Emergent world dynamics | 8 | 8 | **Re-earned on new seeds** by run 55's measure (`c57_topArea.ts`, longest run of a top-5 area share within ±0.2 points, ADR-889): 28097 longest 10 (Australia), 28099 10 (Canada), under 20; on 28099 the USA rises from 7 % to 27 % and back to 18 %, the first three change 6 times (`critic/c57_toparea_2809*.log`). Two 12-year watches at Max: 98 → 78 and 99 → 87 nations, wars on every continent, nations destroyed ("Poland was destroyed", 24 December 1938) (`critic/c57_lwhon_28141.json`, `critic/c57_lwplain_28143.json`). **Not 9:** Australia and Canada sit still for 9–10 years on both seeds; many wars are far-flung pairs (Australia and Honduras, Italy and Brazil in year 1, `critic/shots/c57rg_28129_desk_d365.png`). |
| God Mode | 8 | 8 | **Re-earned.** <ul><li>Nuke, Revolt, Spawn, Found, Raze each told in the ticker (`critic/c57_a_28117.json`, `critic/c57_q_28119.json`).</li><li>Breakthrough at war: engaged 0 → 19 → 51 by day 7 (`critic/c57_kw_breakthrough.28123.log`); in History and the CSV (`critic/c57_kwh_28151.json`).</li><li>**Run 55's phone Breakthrough fixed (ADR-900):** at 390 × 844 the nation panel closes with the tool on, and two clicks make a corridor, drawn to day 10 (`critic/c57_new.corridor_26307_390_844_m3000.log`). (My 1,500 m/px run put Berlin at x = −48: the probe, not the game, `critic/c57_new.corridor_26307_390_844_b.log`.)</li></ul> **Not 9:** God's tools still only reach the selected nation's side; no "undo" of a God act. |
| Editor and scenarios | 8 | 8 | **Re-earned.** <ul><li>**Run 55's filter items fixed:** "ussr" → Soviet Union, "great britain" → United Kingdom, "uk" lists Manchukuo and the UK and chooses the UK; a miss ("korea", "ivory") says "none match; all shown" and lists all, desk and phone (`critic/c57_new_filter_26305_*.json`).</li><li>Fleets and a bomber placed (28121), a fleet at Berlin refused ("no water of a sea is near the place"), the scenario exported and loaded as placed, a sea battle by day 1 (`critic/c57_g_28121.json`).</li><li>The run-26 scenario file loads and starts (`critic/c57_os2_c57.json`).</li></ul> **Not 9:** the editor probe's day-60 wait stalled again and was stopped at 13 min (the probe's step waits on a paused world; not filed). |
| Stats and history | 8 | 8 | **Re-earned on HEAD's 7019 year-20 save** (hash `78d08a02`; the pin moved by ADR-901's rows alone, the same world as `18430918`). History opens in 164 ms, 3,206 events, 27 kinds now with "Joined a war" (`critic/c57_hi_7019.json`); CSV 3,208 lines (`critic/c57_dl_7019.json`). **Run 55's wording fixed:** "lost 1 ship", "United States' air force", "Netherlands' side" (`critic/c57_dl_7019.csv`). WarJoined rows and My wars only as in the Diplomacy row. **Not 9:** a refused peace offer leaves no row and no word anywhere (R57-N2). |
| UI/UX and polish | 8 | 8 | **Re-earned.** <ul><li>**R55-N2 fixed (ADR-902):** at 844 × 390 the Build tab shows all 10/9/6/6 tiles whole in a 565 × 289 panel and the Actions tab's controls are reachable (`critic/c57_new_build_26301_844x390.json`, `critic/c57_new_build_28301_844x390.json`, `critic/shots/c57new_build_28301_844x390_actions.png`); Germany's long air-group list (126 controls in the tab) scrolls in the panel (wheel: 43 → 108 controls in view, `critic/c57_aw_GER_844x390.json`). Portrait and laptop unchanged (`critic/c57_new_build_28301_390x844.json`, `_1280x720.json`).</li><li>R56's small items fixed: a cancel's row "cancelled: 4 back at Rome, 2 stopped where they stood" and no "left its landing for a new one" (`critic/c57_tb_ita6_cancelbtn_27125.json`).</li><li>0 page errors in every c57 page probe.</li></ul> **Not 9:** R57-N1 and R57-N2 (a bar and a button that say what is not so, or nothing). |
| Performance | 8 | 8 | **Re-earned, alone, both commits on their own 7019 year-20 saves** (`critic/scripts/c57_pf.sh`, run after every other job). `c57_pf_lookfps.mjs`: HEAD 3,000–600 m/px 59.2–60.2 fps, 120 m/px 52.8–56.8, 30 m/px 53.8–56.6; d016ed2a 59.0–60.2, 53.8–56.3, 54.1–57.0, within noise (`critic/c57_pf_7019_head.json`, `critic/c57_pf_7019_old.json`). `tools/diag/lookFps.ts` with a draw forced each frame: 59.6–60 frames/s at every zoom, p95 17.7–20 ms, a draw 0.8–2.7 ms (`critic/c57_lookfps.log`). Tick time, seed 99, 5 years, pinned to the P-cores: mean 2.2404 ms HEAD against 2.2357 ms d016ed2a (`critic/c57_sim99_head.log`, `critic/c57_sim99_old.log`). Two 12-year watches at Max: 59.8–60 fps a year, longest gap 117 ms, 0 over 500 ms (`critic/c57_lwhon_28141.json`, `critic/c57_lwplain_28143.json`); touch 59.2–60 (`critic/c57_tm_touch.json`). **Not 9:** 120 and 30 m/px over the busiest land fight still drop to 53–56 fps, and the dense unit-zoom battle is measured on a light scene (at most 273 elements at 30 m/px). |
| Stability | 8 | 8 | **Re-earned.** Save/load in the page (28137): saved at t4800 (`1652569515`), 200 days → `667249232`, loaded twice, the same both times (`critic/c57_sl_plain_28137.json`). workerDeterminism 28059: `e2471e4c` on all four arms (`critic/c57_wd_28059.log`). worldInvariants 0 broken on 28051, 28053 (heroes), 28055 (ten years), 28057 (random world) (`critic/c57_wi_*.log`). Two 12-year watches at Max: 0 page errors, 0 frames over 500 ms (`critic/c57_lw*_2814*.json`). |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Re-earned on new seeds.** 28111: 6,000 → 3 m/px in one camera, elements from 1,573 m/px (7,963), individuals from 28.3 m/px (13,836) (`critic/c57_z_28111.json`). Phone 28133, 30,000 → 25 m/px, no overflow (`critic/c57_phz_28133.json`). Sea battle 20885 t107: 24/24, 23/19, 16/16 elements at 250/60/25 m/px (`critic/c57_sb_20885.json`). |
| **Naval warfare (needs 8)** | 7 | **7** | **R56-B1 closed; held at 7 by R57-B1.** <ul><li>**R56-B1 (i), the Cancel button** (27125, HEAD): at h69 323 and 324 read "Holding", at h78 the row "cancelled: 4 back at Rome, 2 stopped where they stood; the AI commands them again"; all six march off by h120 (`critic/c57_tb_ita6_cancelbtn_27125.json`). **d016ed2a, the same clicks:** 324 "At Rome: no room … they come back for it" to h300 under "turning back to Rome" (`critic/c57_tb_ita6_cancelbtn_OLD_27125.json`).</li><li>**(ii) the re-click:** a new landing gathers at h204 and sails h324 (`critic/c57_rs_ita_malta6_reclick_27125.json`).</li><li>**(iii) at scale:** `c57_stuckret` 0 returning-and-still spells on all 123 HEAD runs (run 56's 78 setups and new 28031–28059 × 3); d016ed2a on the new 45: 14 spells over 2 days, up to 111.9 days (`critic/c57_liab.log`, `critic/c57_sr/`).</li><li>**(iv)** run 56's 26 seeds × 6 setups 156 of 156 at 0 (`critic/c57_li/head_2*.log`); Malta's 18 endings unchanged, broke-off rows now "2 came ashore near Palermo, away from Valletta" (`critic/c57_lland_ita_malta_*.json`, `node critic/scripts/c57_lsum.mjs`).</li><li>**R56-N1 fixed:** 27123/27127/27129 longest same "lands in" 18 h (54 before), "over: 8 landed" at h210 (`node critic/scripts/c57_frozen.mjs critic/c57_lland_eng_br10_271*.json`). **R56-N2 fixed:** 24033 orders for 8 days, 367 refused at the click, no 73-day walk (`critic/c57_od_24033_8.log`). **R56-N3 fixed:** on the same 78 setups the checker reckons 1,021 clicks (369 in run 56) (`critic/c57_li/head_2*_od-.log`).</li><li>Checkers on new seeds: landingRows all 115 cases 0 broken (`critic/c57_lrows_all.log`); repulse 28071/28073 0; seaBattles 28061: 46 battles, `seaBattlesLook` 12 of 12 seen, 0 page errors (`critic/c57_sbl_28061.log`).</li></ul> **Held at 7** by R57-B1 (a `slowClick` break on HEAD, below), R57-N1 (the ashore count) and R57-N3 (an ended landing that names 4 of 6). **What the bar needs:** (i) `npx tsx tools/diag/landingInvariants.ts 28037 3517 120 28037 30 2 8` at 0 broken, with (ii) `sh critic/scripts/c57_liab_head.sh` (HEAD only, no worktree: run 56's 26 seeds and 28031–28059, × 6 setups each, 246 runs) all at 0, 28039 3517 g1 (`… 28039 3517 120 28039 30,90 1`) either at 0 or the checker shown wrong to reckon a division already on the target's land; (iii) `SHOTAT=114,120,132 node critic/scripts/c57_lhold.mjs 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 ita_malta6 140`: from h120 the bar does not say "4 of 6 ashore" while the panel says "came ashore near Palermo, away from its target" (say "4 came ashore away from Valletta; 2 at Rome"); (iv) `node critic/scripts/c57_whotold.mjs 28113 GER ENG 1100.5,267.5 1031.5,266.5 6 120`: divisions 1 and 2 told, as 3, 4, 5 and 42 are, or the row's count matching those named; (v) `c57_stuckret` still 0 and Malta's 18 the same. |
| Tanks (needs 8) | 8 | 8 | **Re-earned.** 28115, day 5: armoured divisions 40 and 42 at 15 m/px live, tank balls with treads and guns firing, Polish infantry facing (`critic/shots/c57c_28115_arm_15m_live_1.png`); week 2 at 80 m/px the armoured division in the melee (`critic/shots/c57c_28115_week2_0080m.png`); elements and individuals at every zoom (`critic/c57_c_28115.json`). |
| Aircraft (needs 8) | 8 | 8 | **Re-earned.** W 28127: the fighter ordered to strike is followed, its mark in 55 of 60 samples at 3,000 m/px, never without one, median 32 px from its sorties (`critic/c57_w_28127.json`). PL 28125: planes in hour 2 (37), marks from 3,000 to 25 m/px in both looks (`critic/c57_pl_planes.28125_GER_POL_5357.log`). Air war told monthly ("Germany and Poland fought in the air this month: Germany lost 18 aircraft, Poland 102", `critic/c57_dp_28401_GER_POL_1600x900.json`). worldInvariants (air) 0. |
| AI nuclear use (needs 8) | 8 | 8 | **Re-earned on HEAD's 7019 save.** The game pauses on two AI strikes within 400 h: the Soviet Union on Nationalist Spain near Burgos (A-bomb, 9,965 men) and China on Australia near Denpasar (31,000 civilians), each with its alert, "Go to" and a ticker row (`critic/c57_an_7019y20.json`, `critic/shots/c57an_7019y20_0_goto.png`). The same two as run 55: the world is the same, its hash moved only by ADR-901's rows. **Not 9:** "0 civilians killed" in a bomb on Burgos reads oddly beside 9,965 men. |

## Blocking issues

1. **R57-B1 (naval; breaks a rule checker): a click's landing is held past its best way on HEAD, 28037.**
   - `npx tsx tools/diag/landingInvariants.ts 28037 3517 120 28037 30 2 8` → "t508 slowClick: t179's click of 365,366 not
     ashore after 13.7 days, its best way 6.7", **1 broken**, twice (`critic/c57_li/head_28037_3517_g2_od8.log`,
     `critic/c57_li_28037_rerun.log`). The same checker on d016ed2a's sim: **0 broken** (`critic/c57_li_28037_newchk_oldsim.log`).
   - **What happens** (`critic/c57_od_28037_365.log`, `critic/c57_od_28037_366.log` by `c57_orderdays.ts`, and
     `critic/wt2`'s traces): on HEAD the t31 click leaves 366 standing at Hiroshima (1777,393) where d016ed2a put it in
     landing 2; at t76 it is sent toward Tokyo; the t179 click puts 365 (at port 56) and 366 (11 cells off, marching)
     into one landing at port 56. Its groups are there by t273, but it sails at t396, when 366 has walked in: 9 days in
     a gathering landing, ashore after 14.2 days against a best way of 6.7. 367 has no landing after the click and keeps
     marching (lead, read not proven: refused by R55c), so on HEAD no sibling waits; the hold is 366's march. On d016ed2a the same click sails at t351, 6.9 days over: inside the
     bound by 0.1 day.
   - **The rule that disagrees (lead, read from the constants, not traced):** a division joins a click's landing at a shared port unless its own port is a week
     sooner (R43a, `SPLIT_SOONER_HOURS`), and `slowClick` breaks a click a week over its best way; a click just under the
     first can land just over the second. Here it is 0.5 day over.
   - **Second case, both commits:** `… 28039 3517 120 28039 30,90 1` → "t1278 slowClick: t853's click of 366 not ashore
     after 17.7 days, its best way 10.7" on HEAD and on d016ed2a with its own checker (`critic/c57_li/head_28039_3517_g1_od-.log`,
     `critic/c57_li/old_28039_3517_g1_od-.log`). 366 is already in China and walks 13 cells toward Shanghai in 18 days
     (`critic/c57_od_28039_366.log`): the checker reckons a sea way for a division on the target's land, which ADR-892
     meant not to reckon. Either the checker's or the march's; it breaks the checker on both builds.
   - **Scale:** HEAD 2 of 246 runs broken (123 setups × with and without the order-day stop); run 56's 156 setups 156 at
     0; on the new seeds with orders for 8 days HEAD 1 of 45, d016ed2a's sim under HEAD's checker 11 of 45
     (`critic/c57_liab_oldsim.log`), with its own checker 3 of 45 (`critic/c57_li/old_*.log`). The batch made landings
     far better; the rule is still broken on HEAD, and a broken checker is blocking by this brief.
   - **Fix:** a click whose division's march to the shared port is longer than its own port's way splits it there (or
     the landing sails without it, told), so that `SPLIT_SOONER_HOURS` and `slowClick` cannot disagree; and the checker
     not reckoning the sea way of a division already on the target's landmass (28039), or the march being judged by its
     own bound.

## Non-blocking issues (prioritised)

1. **R57-N1 (naval/UI, new with R55b): "4 of 6 ashore" while the four came ashore away from the target.** Italy, 27125,
   six to Valletta: at h114 the four at sea break off; from h120 their panels say "Status: Landed · its transports broke
   off; it came ashore near Palermo, away from its target", two ticker rows "321: landed near Palermo, away from its
   target", and the bar says **"Valletta from Rome · 4 of 6 ashore; gathering · 12 transports needed, 7 at hand"**, then
   "4 of 6 ashore; sails in about a day" to h132; at h138 "over: its transports broke off; 4 came ashore away from
   Valletta, 2 never sailed" (`critic/shots/c57lh_ita_malta6_27125_h120_1500m.png`, `critic/c57_lland_ita_malta6_27125.json`).
   The same on 28101 and 28103 (`critic/c57_lland_ita_malta6_2810*.json`). On d016ed2a the row said "gathering"
   (`critic/c56_lland_ita_malta6_27125.json`). `landingRows` 0 broken: it does not compare the ashore count with where
   they came ashore. ADR-894 counts "landed or away" as ashore by design; the defect is the words. Fix: say where they
   came ashore ("4 ashore near Palermo, away from Valletta; 2 at Rome"), as the over row and the news already do.
2. **R57-N2 (diplomacy/UI): the Actions tab's "Offer peace" is a silent no-op when the enemy would refuse.** 28401 as
   Germany (Diplomacy assist off), day 30: "Germany ⚔ Poland (+0) Offer peace" and "Hungary ⚔ Austria (+0)" pressed:
   wars unchanged, no ticker row, no refusal, the button still live (`critic/c57_dp_28401_GER_POL_1600x900.json`,
   `critic/shots/c57dp_28401_GER_POL_1600x900_peace0.png`); the same on 28403 for "Japan ⚔ Latvia (+0)"
   (`critic/c57_dp_28403_GER_POL_1600x900.json`). The right-click menu greys the same offer and gives the reason
   (`NationMenu.tsx` uses `peaceVerdict`/`peaceWhy`; `peace.ts`: "One rule, so the menu and the sim cannot disagree");
   the tab does not, and `tick.ts` drops `offerPeace`'s false. The same clicks on d016ed2a: the same silence
   (`critic/c57_dpOLD_28401_GER_POL_1600x900.json`); old, met in passing. Fix: the tab's button as the menu's (greyed, the reason
   in its title), or a refusal told.
3. **R57-N3 (naval/UI): an ended landing names 4 of the 6 it counts.** Germany, 28113, six to Norwich: "over: its
   transports were sunk; 6 never sailed", the news "4 divisions: … the landing is over (3, 4, 5, 42)"; divisions 1 and 2
   have no notice and read "On the march" (`critic/c57_wt_GER_28113_h120.json`, `critic/shots/c57wt_28113_1_h120.png`).
   The same on d016ed2a (`critic/c57_wtOLD_GER_28113_h120.json`) and in run 56's 27111/27113 (5 counted, 4 named). Old.
4. **Small:** "12 transports needed, 7 at hand" for the two left at Rome (R57-N1's shot); `seaBattlesLook` counts a
   battle "seen" with one side's ships alone (t705 ENG v ITA: 8 British only; t809 ENG v GER: British and French, no
   German, `critic/c57_sbl_28061.log`); a destroyer and a cruiser
   squadron of the two Spains look alike at 40 m/px (`critic/seaBattles_28061_shots/t316_NSP_REP.png`).

## Run 56's cases re-run

| Run 56 case | `d016ed2a` | HEAD `d3519cb0` | Evidence |
|---|---|---|---|
| **R56-B1 (i)** `c57_turnback 27125 ITA ENG … 6 ita6_cancelbtn 66 300` | 324 frozen to h300 under "turning back to Rome / they come back for it" | 323/324 "Holding" h69; row "cancelled: 4 back at Rome, 2 stopped where they stood" h78; all march off | `critic/c57_tb_ita6_cancelbtn_OLD_27125.json`, `critic/c57_tb_ita6_cancelbtn_27125.json` |
| **R56-B1 (ii)** `CANCELAT=66 ORDERAT=198 ORDERTO=1106.5,383.5 ORDERIDS=323,324 c57_retstuck …` | re-click swallowed (run 56) | new landing gathers h204, sails h324, broke off near Naples, told | `critic/c57_rs_ita_malta6_reclick_27125.json` |
| **R56-B1 (iii)** `c57_stuckret` on run 56's 78 setups | 10 of 78 ≥ 30 days (run 56) | **0 spells** | `critic/c57_liab.log`, `critic/c57_sr/` |
| R56-B1 (iii) new seeds 28031–28059 × 3 | 14 spells > 2 days, up to 111.9 d | **0** | `critic/c57_liab.log` |
| **R56-B1 (iv)** liab setups at 0; Malta's 18 | 0; 12 thrown back, 6 broke off | 156 of 156 at 0; the same 18 endings, now naming Palermo | `critic/c57_li/head_2*.log`, `critic/c57_lland_ita_malta_*.json` |
| **R56-N1** `c57_frozen` on 27123/27127/27129 | 54 h | **18 h**; "over: 8 landed" | `critic/c57_lland_eng_br10_271*.json` |
| **R56-N2** `ORDERDAYS=8 c57_orderdays.ts` 24033 | 367 joins a far next voyage, 77 days | refused at the click | `critic/c57_od_24033_8.log` |
| **R56-N3** clicks reckoned, same 78 setups | 369 | **1,021** | `critic/c57_li/head_2*_od-.log` |
| R56 small items | "left its landing for a new one"; stale "come back for it" | gone | `critic/c57_tb_ita6_cancelbtn_27125.json` |
| R55-N1 (26309 France) | no join row | "France joined the war on Poland's side, as its guarantor"; My wars only keeps the war | `critic/c57_new_mine_26309_1600x900.json` |
| R55-N2 (844 × 390 Build/Actions) | 2 of 10 tiles; 8 controls off screen (run 55) | all tiles whole; controls in a scrolling panel | `critic/c57_new_build_26301_844x390.json` |
| Run 55's small items | "lost 1 ships", "United States's", "away from Valletta", filter, phone Breakthrough | all fixed | Stats, Editor, God rows |
| 20661/26101 turn-backs, 22105 phone bar, 21103 box, 22103/23109/26107/26109 | as run 56 | the same, exit 0, no page error | `critic/c57_suiteA.log` |

## Design objections (none blocking, no score lowered)

- **ADR-759/875: a cancel hands the army to the AI at once**, and the AI at once boards them on its own landing ("At sea
  with the AI's landing (not one of yours)", 28117 and 28119, `critic/c57_tb_jap_cancel6_28117.json`,
  `critic/c57_tb_eng_cancel8_28119.json`): the player's cancel reads as a hand-over.
- **Malta is never taken** (18 of 18 again).
- **ADR-894's "ashore" counts those thrown ashore away from the target,** and the last two then sail alone to a
  place none of their side holds (27125, R57-N1): a landing whose first wave broke off could end there.
- **Alliances ignore the map:** Poland in Afghanistan's pact with Iran, Australia at war with Honduras.

## Ideas from other games (not scored)

- Hearts of Iron's naval invasion list shows each division's state (embarked, landed, at the target, elsewhere): a row
  "4 ashore near Palermo · 2 at Rome" would answer R57-N1.
- Europa Universalis shows the AI's acceptance of a peace offer before it is sent ("they will refuse: war score +0,
  need +25"); the Actions tab has the verdict and does not show it (R57-N2).

## Strengths (verified)

- **Batch 10 fixed what it set out to fix, on the critic's own cases:** R56-B1's three probes pass on HEAD and fail on
  d016ed2a; the returning-and-still spell is gone from 123 of 123 runs; with one checker, broken "orders for 8 days"
  setups fell from 11 of 45 to 1 of 45.
- **Wording and small layout items are done carefully:** the possessive, the plural, the place a landing came ashore,
  the filter aliases, the phone Breakthrough and the landscape Build tab all verified on the page.
