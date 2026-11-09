# Critic report, run 55 (full): after batch 8 (R53a–R53p)

- **Mode: full.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). The last report (run 54, `ba294ca2`,
  on `8d7d02fe`) has a blocking issue and a score under its bar, but not every commit since is of the two allowed
  kinds: `ba294ca2` filed only R53a, R53b and R53c, while R53d–R53p were filed by later ROADMAP commits (`19006be2`,
  `c3b1bc03`, `4e448651`, `1b7c0720`, `d58a2faa`) and their commits change `src/` (`git diff --stat 8d7d02fe HEAD -- src
  data public`: 26 files, +1047 −119). So the whole brief; every dimension scored afresh, nothing carried.
- **Commit judged:** `715a5448d310cd829492f3a3fc5fbd08fb101262`, HEAD at the start, clean tree (`critic/c55_commit.txt`).
- **Build:** `vite build --outDir critic/c55_dist`, exit 0 (`critic/c55_build.log`), served by `vite preview` on
  127.0.0.1:**5355**. Last report's commit built from a worktree (`critic/c55_olddist`, served on 5356 for the A/B
  frame-rate and glide probes; `critic/c55_oldbuild.log`). Both servers, every browser and the worktree are gone.
  Playwright Chromium at 1600 × 900, 390 × 844 and 844 × 390.
- **Runs.**
  - **Replay** of run 54's 30 headless jobs plus one new seed per family (19):
    `tools/diag/replayCritic.ts --run 54 --new 1 --jobs 3 --out critic/c55_replay` (`critic/c55_replay/REPORT.md`):
    15 same, 15 differ (hashes moved by R53g/R53k/R53l, logged pins), **1 failed: `landingInvariants 24033` → 1 broken**.
  - **Fresh seeds, 27 headless jobs** (`critic/scripts/c55_jobsAll.txt`, all exit 0): diploInvariants 26001–26011,
    landingInvariants 26021–26027, worldInvariants 26051–26057, workerDeterminism 26059, seaBattles 26061,
    `landingRows all`, far route 26043, staged repulses 26071/26073, unstaged 26081, `heldBy` 26201, 7019 for 20 years
    (saved), and R53k's bar **by area** on 21099, 20899, 24099 and new 26099 for 25 years (`critic/scripts/c55_topArea.ts`,
    the game's own `landStandings`).
  - **Same seeds on both commits:** area top-5 on 21099/20899/24099 (`critic/c55_toparea_*_at8d7d02fe.log`); war sides at
    day 365 on 26139–26147 (`critic/c55_piles_p*.log`); landingInvariants on 26031–26049 × 3 setups
    (`critic/c55_liab.log`, 30 pairs); frame rate on each commit's own 7019 year-20 save.
  - **Page** (`critic/scripts/c55_suiteA.sh`, `c55_suiteA2.sh`, `c55_suiteB.sh`): run 54's named landing cases, the
    Malta click on 18 seeds, the batch's new UI (`critic/scripts/c55_new.mjs`: Build tab, My wars only, editor filter,
    corridor), then the whole brief on new seeds 26101–26165; two 12-year watches at Max. Last, alone:
    `critic/scripts/c55_chain3.sh` (frame rate, `tools/diag/lookFps.ts`, glide, touch).
  - **New probes:** `c55_topArea.ts`, `c55_piles.ts`, `c55_new.mjs`, `c55_histgrep.mjs`, `c55_warsof.mjs`,
    `c55_joinseen.mjs`, `c55_frager.ts`, `c55_slow367.ts`, `c55_lsum.mjs`, `c55_glide.mjs`, `c55_heavyfps.mjs`, `c55_liab.sh`.

## Verdict

**R54-B1 is fixed, cleanly, on every seed I ran. The batch's other items do what they claim. But a rule checker breaks
on HEAD on run 54's own seed (24033), and on a new seed on both commits (26045): a player's landing click takes
17 days where its best way is 10 (and 9.5 against 2.5). By the brief that is blocking. Naval stays at 7.**

- **R54-B1 fixed** (one story in bar, panel and ticker). Rome → Valletta on 18 seeds: 12 thrown back, 6 broke off. Every
  thrown-back one reads "thrown back: sailing home to Catania" in the bar and the panel from the hour of the news, never
  "lands in" after it, and ends "over: 2 thrown back; came ashore near Catania", with both divisions' last news "thrown
  back; it came ashore near Catania." Every broke-off one ends "over: its transports broke off; 2 came ashore away from
  Valletta" beside two matching news rows (`critic/c55_lh_ita_malta_23105.json`,
  `critic/shots/c55lh_ita_malta_23105_h186_1500m.png`, `critic/c55_lland_ita_malta_2*.json`).
- **Better, same seeds, both commits:** dogpiles. 26139–26147 at day 365: 8d7d02fe has 1:23, 35:1, 8:33, 5:31, 9:1, 7:1;
  HEAD's worst is 2:9 and 1:5 (`critic/c55_piles_p_at8d7d02fe.log` against `critic/c55_piles_p.log`). Frame rate at
  120 m/px on each commit's 7019 year-20 save: 33.2–39.6 → 52.3–57.5 fps.
- **R55-B1 (blocking):** `slowClick` broken, below.

## Scores

| Dimension | Run 54 | Run 55 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Re-earned.** <ul><li>**Held landing mark (ADR-880):** 21105 h60, a red ring on transport group 1195 and a dashed red line to the British fleet east of Sicily, at 1500 and 250 m/px (`critic/shots/c55lh_ita_malta_21105_h60_1500m.png`, `_250m.png`). Run 54's objection is answered.</li><li>**Breakthrough corridor (ADR-881)** drawn east of Berlin, amber-edged, days 0–10, gone on day 11 (`critic/c55_new_corridor_26307_1600x900.json`, `critic/shots/c55new_corridor_26307_1600x900_d3_1500m.png`).</li><li>12-year world at Max (26141): USA across Canada, Peru across the Andes, Free Kamchatka Krai, every chip and ticker row whole (`critic/shots/c55lwhon_26141_y12_world.png`).</li></ul> **Not 9:** the corridor reads as a small grey box (≈175 km of a Berlin → Warsaw click), easy to take for terrain (`critic/shots/c55new_corridor_26307_1600x900_h1_600m.png`); the relations graph at day 365 on 20887 still has 51 war edges and 19 nations left out (`critic/shots/c55rg_20887_desk_d365.png`). |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | **8** | **Up, on the same seeds on both commits.** <ul><li>**Dogpiles:** 26139, 26141, 26143, 26145, 26147 (plain), day 365. 8d7d02fe: NSP 1:23 POR, FRA 35:1 BRA, GER 8:33 ENG, TUR 5:31 FRA, ITA 7:1 COL, POL 9:1 COL. HEAD: worst GER 2:9 NED, ITA 2:9 ENG, POL 1:5 GER, NSP 1:5 TUR; 3 of 5 seeds have no chip over 4:1 (`critic/c55_piles_p.log`, `critic/c55_piles_p_at8d7d02fe.log`).</li><li>**R53l's bar:** 21129 and 24129 none over 4:1; 20887 ITA 2:11 ENG, the front the user accepted (`critic/c55_piles_h.log`, `critic/shots/c55rg_20887_desk_d365.png`). New 26129: none.</li><li>**0 broken:** diploInvariants on 26001, 26003 (heroes), 26005 (random world), 26007, 26009, 26011, ten years each but the random world's five (`critic/c55_diploinv_26*.log`), and on the replay's new 60001–60401.</li><li>Joins follow the rules: on 26309 France joins Germany–Poland on day 350 as Poland's guarantor, and leaves at the peace on day 377 (`critic/c55_frager_26309_win.log`, `critic/c55_warsof_26309_FRA.json` "GUARANTEES … Poland").</li></ul> **Not 9:** that join, and the guarantee before it, leave no row anywhere (N1). |
| Emergent world dynamics over long runs | 7 | **8** | **Up.** R53k's bar, by area (the user's choice, ADR-889), on `c55_topArea.ts`: longest run of a top-5 share within ±0.2 points, 18 (21099, Australia), 14 (20899), 6 (24099), 9 (new 26099), all under 20; the first three change 15, 13, 11 and 7 times (`critic/c55_toparea_*.log`). **Same seed, both commits, 24099:** on 8d7d02fe the Soviet Union is first all 25 years (`critic/c55_toparea_24099_at8d7d02fe.log`); on HEAD the USA leads by year 10, the UK by year 15 and Germany by year 25 at 14.2 % (`critic/c55_toparea_24099.log`). 21099: the USA rises from 7 % to 25 % and China to 10 %; 20899: France peaks at 18 % in year 10, then falls to 6 %. The page watch 26141 has 101 → 71 → 77 nations and a 12-year USA–USSR–UK race (`critic/c55_lwhon_26141.json`). Caveat, honestly: by my area count the old commit also stays under 20 (9, 10, 10), so part of run 54's 7 was the cells metric the user replaced. The up rests on the 24099 leadership change and the livelier wars above. **Not 9:** Australia holds 6.11 % for 18 years on 21099. |
| God Mode | 8 | 8 | **Re-earned on new seeds.** <ul><li>H-bomb on Paris (26117): mushroom, ring, alert with "Go to", 3,329,000 civilians (`critic/shots/c55a_26117_13_paris_h_strike.png`).</li><li>Revolt, Spawn, Found, Raze told in the ticker (`critic/c55_q_26119.json`).</li><li>Breakthrough at war: engaged 0 → 19 → 56 by day 7 (`critic/c55_kw_breakthrough.26123.log`); refused at peace (`critic/c55_k_20879.json`); the corridor now drawn (Map row).</li></ul> **Not 9:** on the phone with Germany selected, the nation panel covers Berlin and Warsaw, so the two Breakthrough clicks fall on the panel and no corridor is made (`critic/shots/c55new_corridor_26307_390x844_h1_1500m.png`, `critic/c55_new_corridor_26307_390x844.json`, 0 marks). |
| Editor and scenarios | 7 | **8** | **Up: both of run 54's bar items met.** <ul><li>The run-26 file loads: "Critic standoff 8 · Made before nation traits: its nations start with none." Start, then a tick-0 world (`critic/c55_os2_c55.json`).</li><li>Typed filter, desk and phone: "united" → 2 of 103, "germ" → Germany, "FRANCE" and " fra" → France (`critic/c55_new_filter_26305_*.json`, `critic/shots/c55new_filter_26305_1600x900_ger.png`).</li><li>Fleets and a bomber placed on 26121, a fleet at Berlin refused ("no water of a sea is near the place"), the scenario exported and loaded as placed, sea battle by day 2 (`critic/c55_g_26121.json`).</li></ul> **Not 9:** no aliases ("uk" → Manchukuo, "ussr" → nothing), and a word with no match shows the last chosen nation alone beside "0 of 103" ("korea" → United Kingdom). The editor probe's day-60 wait stalled again (I stopped it at 14 min); that is the probe. |
| Stats and history | 8 | 8 | **Rescored on HEAD's 7019 year-20 save** (hash `18430918`, new, the pin moved with R53g/R53k/R53l). <ul><li>History opens in 111 ms, 2,994 events of 26 kinds (`critic/c55_hi_7019.json`); CSV 2,996 lines (`critic/c55_dl_7019.json`).</li><li>R53g: no repeated begin/won pair; "A major battle began near Ourense" then "won by United States" a day later.</li><li>**My wars only** works on desk and phone: 44 of 329 for Germany (26303), the checkbox in view, kinds filter on top of it (`critic/c55_new_mine_26303_*.json`, `critic/shots/c55new_mine_26303_390x844_GER_mine.png`).</li></ul> **Not 9:** N1: France's "My wars only" (26309) shows "Germany and France fought at sea/in the air" but not the war they belong to, nor its end (`critic/c55_histgrep_26309_FRA.json`). Small: "lost 1 ships", "United States's air force" (`critic/c55_hi_7019.json`). |
| UI/UX and polish | 7 | **8** | **Up: run 54's bar items met.** <ul><li>R54-B1's cases read as one story (Naval row), and so does `landingRows`' page check: 115 cases, 0 broken, the seven Malta clicks among them (`critic/c55_lrows_all.log`).</li><li>22105, day 2: every division line has its days ("about a day", "about 2 days") (`critic/c55_lbar_eng_br3_phone_22105_390.json`).</li><li>Phone Build tab: all 10/9/6/6 tiles whole at 390 × 844 and 1600 × 900; a tile builds ("Infantry division · ready in 90 days") (`critic/c55_new_build_26301_390x844.json`, `critic/shots/c55new_build_26301_390x844_infantry.png`). The phone panel is 139–443 px (run 54: to 1289) (`critic/c55_p.json`).</li><li>Turn-backs name every port (20661, 26101), landscape Cancel box whole (21103) (`critic/c55_tb_*.json`, `critic/c55_lbox_eng_br4_21103_844x390.json`). No page error in any c55 probe.</li></ul> **Not 9:** N2, landscape phone (844 × 390): the Build tab shows 2 of 10 infantry tiles in a 170-px panel, and the Actions tab puts 8 air-wing controls off the screen (`critic/c55_new_build_26301_844x390.json`, `critic/shots/c55new_build_26301_844x390_infantry.png`). |
| Performance | 7 | **8** | **Up, on run 54's own probe, alone, both commits.** `c55_pf_lookfps.mjs` on each commit's 7019 year-20 save: 8d7d02fe 120 m/px 33.2–39.6, 30 m/px 37.7–47.6; HEAD 120 m/px 52.3–57.5, 30 m/px 53.6–56.3; 3,000–600 m/px 58.8–60.2 on both (`critic/c55_pf_7019_old.json`, `critic/c55_pf_7019.json`). `tools/diag/lookFps.ts` with a draw forced each frame: 58.8–60 frames/s at every zoom, a draw 0.7–2.8 ms (`critic/c55_lookfps.log`). Two 12-year watches at Max: 59.8–60.1 fps, longest gap 83 ms, 0 over 500 ms (`critic/c55_lwhon_26141.json`, `critic/c55_lwplain_26143.json`). Touch 59.4–59.9 (`critic/c55_tm_touch.json`). At 900 m/px over the German–Polish front at Max, 2,500–4,900 elements at 59.4–60 (`critic/c55_heavyfps_head.log`). **Not 9:** the unit-zoom scenes measured are light (lookFps: at most 235 elements at 120 and 30 m/px); my heavy-fight probe lost the fight at Max (0 elements below 250 m/px), so no figure for a dense unit-zoom battle. The glide itself I could not judge from numbers: on HEAD the view draws every frame at Max and, at 120 m/px, elements stand still on 58 % of frames between larger steps (`critic/c55_glide_head_7019_120.json`); the old build's 120 m/px run hung and was stopped, and its fresh-war run drew 210 of 241 frames (`critic/c55_glide_old_99.log`). No verdict on the glide. |
| Stability | 8 | 8 | **Re-earned.** <ul><li>Save/load in the page (26137): saved at t4800 (3215990627), 200 days → 3008165651; loaded twice, the same both times (`critic/c55_sl_plain_26137.json`).</li><li>workerDeterminism 26059: `0be431f9` on every arm; 60901 the same (`critic/c55_wd_26059.log`, the replay).</li><li>worldInvariants 0 broken on 26051, 26053 (heroes), 26055 (ten years), 26057 (random world), and 60601–60801.</li><li>Two 12-year watches at Max: 0 page errors, 0 frames over 500 ms. No `pageerror` in any c55 JSON.</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Re-earned on new seeds.** Z 26111: 6,000 → 3 m/px in one camera, elements from 1,573 m/px (7,959), individuals from 28.3 m/px (13,838), no error (`critic/c55_z_26111.json`). Phone 26133, 30,000 → 25 m/px, no overflow (`critic/c55_phz_26133.json`). Sea battle 20885 t107: 24/24, 22/19, 16/16 elements at 250/60/25 m/px (`critic/c55_sb_20885.json`). |
| Naval warfare (needs 8) | 7 | 7 | **Held at 7 by R55-B1.** **Fixed (R54-B1), 18 seeds:** 23105, 24151–24171, 26151–26161 thrown back at h156–162 and told so from that hour to the end; 21105, 24105, 24157, 24173, 24175, 26163 break off, "2 came ashore away from Valletta", news agreeing (`critic/c55_lland_ita_malta_*.json`, `critic/c55_lh_ita_malta_*.json`; summary by `critic/scripts/c55_lsum.mjs`). Held mark drawn (Map row). Landings that go right: 26107 and 23109 "over: 3 landed" at h144, 26109 and 20861 "3 landed" at h130. 22103 and new 26103 "transports sunk; never sailed". Checkers: landingRows 0 broken on 115 cases; landingInvariants 0 broken on 26021–26027 and 29 of 30 new A/B pairs; staged repulses 26071/26073 0 broken; seaBattles 26061: 48 battles. **But** `slowClick` breaks on 24033 (HEAD only) and 26045 (both commits): R55-B1. **What the bar needs:** `npx tsx tools/diag/landingInvariants.ts 24033 3517 120 24033 30,90 2` and `… 26045 3517 120 26045 30,90 2` at 0 broken, with landingInvariants on 26031–26049 (`sh critic/scripts/c55_liab.sh`) still 0, and the Malta bar above unchanged. |
| Tanks (needs 8) | 8 | 8 | **Re-earned.** 7781 (R53o's seed), day 5: armoured divisions 40 and 42 at 15 m/px live, tank balls with treads and guns, Polish infantry facing, tracers (`critic/shots/c55c_7781_arm_15m_live_1.png`); 10 m/px the same, the German tanks clearly apart from the olive ground (`critic/shots/c55c_7781_arm_0010m.png`). 26115 the same counts (`critic/c55_c_26115.json`). |
| Aircraft (needs 8) | 8 | 8 | **Re-earned.** W 26127: the fighter ordered to strike is followed, its mark in 56 of 61 samples at 3,000 m/px, never shown without one, median 32 px from its sorties (`critic/c55_w_26127.json`). PL 26125: planes in hour 2, marks from 3,000 to 25 m/px in both looks (`critic/c55_pl_planes.26125_GER_POL_5355.log`). Air war told monthly in History and the ticker (26141 y11 "Germany and Italy fought in the air"). worldInvariants (air) 0 broken. |
| AI nuclear use (needs 8) | 8 | 8 | **Rescored on a new world** (HEAD's 7019, hash `18430918`, not the runs 39–54 world). The game pauses on two AI strikes within 400 h: the Soviet Union on Nationalist Spain near Burgos (A-bomb, 9,965 men) and China on Australia near Denpasar (31,000 civilians), each with its alert, "Go to" to the place, and a ticker row (`critic/c55_an_7019y20.json`, `critic/shots/c55an_7019y20_0_goto.png`). |

## Blocking issues

1. **R55-B1 (naval; breaks a rule checker): a player's landing click is held in port days past its best way.**
   - **Run 54's own seed:** `npx tsx tools/diag/landingInvariants.ts 24033 3517 120 24033 30,90 2` → "t2415 slowClick: t2004's
     click of 367 not ashore after 17.1 days, its best way 10.1", **1 broken**, twice on HEAD (`critic/c55_replay/c54_li_24033_jap_g2.log`,
     `critic/c55_li_24033_rerun.log`); **0 broken** on 8d7d02fe (`critic/c55_li_24033_at8d7d02fe.log`).
   - **What happens** (`critic/scripts/c55_slow367.ts`, `critic/c55_slow367_wars.log`, `_head.log`, `c55_slow365_head.log`):
     the t2004 click sends 365, 366, 367 to China (1715,411). 366 walks there. 365 and 367 join landing 6 at Tokyo; its
     transports are in port and it is **ready at t2125**. At t2142, 365 leaves for another landing (to 1703,445), and 367
     is alone in landing 6, ready, at war with China all along, **from t2142 to t2315 (173 h, already past
     READY_WAIT_HOURS' 144)**. 364 then joins it at t2315 and leaves about t2354; landing 6 sails only at t2393, 11 days
     after it was ready. The likely cause is `siblingWait` holding it for its click-mate 365 in a different landing; I read
     the trace and the constants, not the sail decision itself, so that is a lead, not a finding.
   - **A second case on both commits:** new seed 26045, `… 26045 3517 120 26045 30,90 2` → "t1358's click of 366 not ashore
     after 9.5 days, its best way 2.5" (HEAD 2.5, 8d7d02fe 2.3; `critic/c55_liab.log`). Here 366 takes 123 h to reach
     Tokyo from 7 cells inland, sails at t1482, and turns back near the target at t1590 (`critic/c55_slow366_26045.log`).
     It is not one seed's luck: 2 of the 11 runs of this setup (3517, two groups) I ran on HEAD broke.
   - **Why blocking:** the brief counts a broken rule checker as blocking. ADR-843's own bar is a week over the best way.
   - **Fix:** a landing ready with its transports and no division of its own still marching sails within READY_WAIT_HOURS,
     whatever a click-mate in another landing is doing (`siblingWait` should count only siblings still bound to the same
     target), if that is the cause. Find whether 26045's slow march to port (0.1 cells an hour) and the turn-back are the checker reckoning a
     throw-back as slow, or a real stall; say which in landingInvariants' line.

## Non-blocking issues (prioritised)

1. **R55-N1 (stats/UI): a war joined by guarantee or alliance leaves no row, so "My wars only" cannot explain it.** On
   26309, played as France, France joins Germany–Poland on day 350 as Poland's guarantor and leaves at the peace on day
   377 (`critic/c55_frager_26309_win.log`: only "WarDeclared GER POL" and "PeaceSigned GER POL"). History has no row
   saying France joined, or that France guaranteed Poland; "My wars only" keeps "Germany and France fought at sea" and
   "fought in the air" (Dec 1938–Feb 1939) but drops "Germany declared war on Poland" and the peace, since neither names
   France (`critic/c55_histgrep_26309_FRA.json`, `critic/shots/c55hg_26309_FRA_mine.png`). **Fix:** a "France joined the
   war on Poland's side (guarantee)" row, and a guarantee-given row; let My wars only keep a war's rows when the player
   is on one of its sides.
2. **R55-N2 (UI): landscape phone (844 × 390).** The Build tab shows 2 of 10 infantry tiles in a 170-px panel above an
   empty band of map, and the Actions tab puts 8 air-wing controls ("Patrol", "Strike", "Rebase", "Select this group…")
   off the screen (`critic/c55_new_build_26301_844x390.json`, `critic/shots/c55new_build_26301_844x390_*.png`).
   `buildTab1938` tests only 390 × 844 and 1280 × 720.
3. **Small:** a phone Breakthrough's clicks land on the nation panel (God row); the editor filter has no aliases and shows
   the chosen nation alone on a miss (Editor row); "lost 1 ships", "United States's"; "came ashore away from Valletta"
   does not say where (Palermo, Catania), as "near Catania" does.

## Run 54's cases re-run

| Run 54 case | `8d7d02fe` (run 54) | HEAD `715a5448` | Evidence |
|---|---|---|---|
| **R54-B1** 23105 h156–186 | "lands in about a day" after the throw-back; end "over: 2 thrown back" beside "landed away" | **"thrown back: sailing home to Catania"** from h162 in bar and panel; end "over: 2 thrown back; came ashore near Catania", both news the same | `critic/c55_lhold.23105_ITA_ENG_1095.5_344.5_1106.5_383.5_2_ita_malta_200.log`, `critic/shots/c55lh_ita_malta_23105_h186_1500m.png` |
| R54-B1 seeds 24151, 24153, 24155, 24159, 24171 | the same contradiction | **all agree**, thrown at h156–162 | `critic/c55_lland_ita_malta_241*.json` |
| 24105, 24157, 24173, 24175, 21105 (broke off) | "broke off; 2 came ashore away" | the same, news agreeing | `critic/c55_lh_ita_malta_24105.json`, `critic/c55_lland_ita_malta_2417*.json` |
| R54-N1 `heldBy` | nearest engaged formation | 21105 h60 names United Kingdom, the line drawn to its fleet | `critic/shots/c55lh_ita_malta_21105_h60_250m.png` |
| Small: 22105 day 2 | two lines without days | **every line has its days** | `critic/c55_lbar_eng_br3_phone_22105_390.json` |
| 20661 turn-back h30 / cancel h48 | Tokyo, Ōsaka; AI at once | the same (ADR-875) | `critic/c55_tb_jap_cancel_20661.json`, `critic/c55_cp_jap_cancel_20661.json` |
| 20861, 23109, 22103, 3517, 22107 | 3 landed; 3 landed; never sailed; landed; 3 away | the same | `critic/c55_lland_*`, `critic/c55_lost_desk.json`, `critic/c55_lbar_ita_malta3_22107_1600.json` |
| 21103 landscape box | Cancel and 4 lines on screen | the same | `critic/c55_lbox_eng_br4_21103_844x390.json` |
| Sea balls 20885 t107 | 24 / 22 / 16 | 24 / 22 / 16 | `critic/c55_sb_20885.json` |
| Relations 20887, 21129, 24129 day 365 | dogpiles (UK +36, UK +35) | 20887 ITA 2:11 (accepted front); 21129, 24129 none over 4:1 | `critic/c55_piles_h.log`, `critic/shots/c55rg_*_desk_d365.png` |
| Run-26 scenario | refused | **loads, with "Made before nation traits"** | `critic/c55_os2_c55.json` |
| Editor nation list | flat | **typed filter** | `critic/c55_new_filter_26305_*.json` |
| Phone Build buttons | below the screen (to 1289 px) | **Build tab, whole at 390 × 844** (but N2 at 844 × 390) | `critic/c55_p.json`, `critic/c55_new_build_*` |
| History Tangier pair on 7019 | begin/won ×3 in two days | a new world (pin moved); no repeat in its first rows | `critic/c55_hi_7019.json` |
| Denmark frozen 21099/20899, 24099 top 3 | frozen (cells) | by area: 18, 14 years; 24099 first three change 11 times | `critic/c55_toparea_*.log` |
| Frame rate 7019 y20, 120 m/px | 33–39 | **52–57.5** (alone) | `critic/c55_pf_7019.json` |
| Breakthrough 21151 History/CSV; at peace 20879 | named; refused | the same | `critic/c55_kwh_21151.json`, `critic/c55_k_20879.json` |
| Replay of run 54's 30 jobs + 19 new | — | 15 same, 15 differ (logged rule changes), **1 failed (24033, R55-B1)**; every new seed exit 0 and 0 broken | `critic/c55_replay/REPORT.md` |

**Checkers on fresh seeds:** diploInvariants 26001–26011: 0; worldInvariants 26051–26057: 0; workerDeterminism 26059:
same on every arm; landingInvariants 26021–26027: 0; landingRows all: 115 cases, 0; staged repulses 26071/26073: 0;
landingInvariants A/B 26031–26049 × 3: 29 of 30 at 0 on both commits, 26045 broken on both (R55-B1).

## Design objections (none blocking, no score lowered)

- **ADR-759/875: a cancel hands the army to the AI at once.** Unchanged ("cancelled: back at Tokyo, Ōsaka; the AI
  commands them again", `critic/c55_cp_jap_cancel_20661.json`). The user's call; still the one thing a player can't undo.
- **Malta is never taken.** On all 18 seeds the two-division Rome → Valletta click is held by the same British fleet for
  ~90 h and then thrown back or broken off; the outcome is almost seed-independent (thrown at h156 or h162, every one).
  Correct by the rules, but a player's commonest test of a landing always fails the same way.

## Ideas from other games (not scored)

- Hearts of Iron's event log names why a country entered a war ("France honours its guarantee to Poland"), which is
  what N1 lacks.
- Europa Universalis' outliner lists the player's wars as wars (sides, start, score), not only their rows.

## Strengths (verified)

- **R54-B1 is fixed properly, not patched:** 18 Malta seeds, two endings, bar, panel and both divisions' news saying the
  same thing every hour, and `landingRows` now checks the three places itself (115 cases, 0 broken).
- **The year-one dogpiles are gone on the same seeds:** 1:23, 35:1, 8:33 and 5:31 on 8d7d02fe become at worst 2:9 on
  HEAD, with diploInvariants still at 0 on six new ten-year runs; and the unit zooms on a late save went from 33–40 to
  52–57 fps on run 54's own probe.
