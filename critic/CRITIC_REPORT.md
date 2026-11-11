# Critic report, run 63 (full): batch 16, run 62's findings on the historical track

- **Mode: full.** The spawning message asked for one ("Full run. Run the critic per CRITIC_PROMPT.md…"): the request
  ADR-916 has the builder make after a focused run with no blocking issue and every score at its bar, which run 62 was.
  Every dimension is scored afresh; nothing is carried.
- **Commit judged:** `78b082b4f0b6cc98638c9b263cc498a1524e2519`, HEAD at the start, on a clean tree
  (`critic/c63_commit.txt`).
- **What changed since run 62 (`9e094f50`):** six commits, R64a–f, run 62's six findings (54 files).
  - The sim changed only for the track: `src/sim/track.ts`, `src/sim/data/schemas.ts`,
    `data/scenarios/1938h/timeline.json`.
  - The UI changed for the track: the notes that end the replay, `TrackEnded` in the ticker, the hidden past "Next",
    the offshore strike sentence.
  - **Plain 1938 is bit-identical to runs 61 and 62:** 7019 ends its 20 years at `99caf939` and 32019 at `4702acef`
    (`critic/c63_seed7019_save.log`, `critic/c63_seed32019_save.log`). The sim changed, so run 61's bulk landing
    sets are re-run (ADR-917), below.
- **The run was interrupted by a reboot of the machine at 01:31** (it started 01:16).
  - Everything I had running died: the preview, the browsers, the headless queue, the job chains.
  - Finished before it: the build; the four track checkers (1938, 33301, 34301, 34303); the two 20-year saves;
    diploInvariants 34001; 88 of the 90 `landingFuzz` runs; and suite T up to its 14th probe.
  - Also finished: my own probes `c63_h_blank`, `c63_h_continue`, `c63_h_godtab`, `c63_h_pauseblank` and
    `c63_x_loadfile`.
  - **Re-run after the reboot (from 06:10):**
    - the 46 unfinished jobs of `critic/scripts/c63_jobsAll.txt`, as `c63_jobsResume.txt`, 4 at a time (6 before);
    - the two cut `landingFuzz` runs (34129 3517 g1 od8, 34129 15101 g2 od8), each alone
      (`critic/c63_lf_34129_*.log`);
    - suite T's last probe (the track watch, `c63_suiteT2.sh`) and the whole of suite B;
    - then run 61's bulk landing sets (396 + 153 + 168);
    - the performance chain, alone;
    - then Malta's 18 and R60-N5's seaBattlesLook 31501 (`c63_after.sh`);
    - and the editor probe 32443 once more on the quiet machine.
  - **Left out:**
    - `c63_heavyfps` (it lost its fight in run 61);
    - `npm run bench -- G`, which writes the tracked `docs/bench/`;
    - `c63_g_editor`'s wait on a strike pause, stopped after 15 min (its fleet and refusal steps were saved).
  - Every figure in this report comes from a run that finished. A log that was cut short is not used.
- **Setup:**
  - Build: `vite build --outDir critic/c63_dist`, exit 0 (`critic/c63_build.log`).
  - Server: `vite preview` on 127.0.0.1:5363.
  - Browser: Playwright Chromium at 1600 × 900, 390 × 844, 844 × 390, 932 × 430, 1024 × 500 and 667 × 375.
  - Probes: `critic/scripts/c63_*` (run 61's and 62's as `c63_*`, pointed at 5363). My new ones are
    `c63_h_blank`, `c63_h_pauseblank`, `c63_h_continue`, `c63_h_godtab`, `c63_h_zoom` and `c63_x_loadfile`.
  - Headless: `c63_jobsAll.txt` (53 jobs), run by `c63_runq.sh`.
  - Page suites: `c63_suiteT.sh` / `c63_suiteT2.sh` (run 62's named cases), `c63_suiteB.sh` (the whole brief on
    new seeds 35xxx).
  - Bulk: `c63_chainBulk.sh` (run 61's 396 + 153 + 168). Performance: `c63_chainP.sh`, alone after every other job.
  - The builder's preview on 5398 was up before the run and was left alone; after the reboot nothing of the builder's
    was up. My 5363 preview and every browser I opened are stopped.

## Verdict

**No blocking issue. Every dimension is at its bar (8).**

- **No checker breaks a rule on new seeds:**
  - `landingInvariants` via `landingFuzz --seeds 15 --first 34101`: **0 of 90 runs broken** (88 in the fuzz, the two
    killed by the reboot re-run alone: 0 broken each). `slowClick` included. Logs: `critic/c63_landingFuzz.log`,
    `.cache/landingFuzz/78b082b4-34101/`, `critic/c63_lf_34129_*.log`.
  - diploInvariants, 0 broken on:
    - 34001 (1938), 34003 (random), 34005 (heroes) and 34007 (random world), 5 years each;
    - 34009 (1938) and 34011 (random, heroes), 10 years each (`critic/c63_diploinv_340*.log`).
  - worldInvariants, every rule set, 0 broken on 34051, 34053 (heroes) and 34055 (random world), 5 years each
    (`critic/c63_wi_340*.log`).
  - workerDeterminism 34059: one hash `7ee67ce6` on every arm (`critic/c63_wd_34059.log`).
  - landingRows `all`: 115 cases, 20,321 hours, 0 broken (`critic/c63_lrows_all.log`).
  - seaBattlesLook 34061: **50 of 50 battles seen**, 0 with no fleet (`critic/c63_sbl_34061.log`).
  - Staged repulses 34071 and 34073: 0 broken (`critic/c63_repulse_*.log`).
  - **The track's checker:** own seed 1938, 0 broken, 0 passed over, ended 27 July 1953. New seeds 34301 and 34303
    (warnings only, ADR-950): 0 broken, one event passed over by rule (18, the Spanish war's end)
    (`critic/c63_track_*.log`).
- **All six of run 62's findings are fixed on the probes that found them** (the table at the end). R62-N6's fix brings
  a new, smaller fault (R63-N1).
- **The full brief on new seeds found no player-stopping fault.** In a full run's page probes:
  - 0 page errors in 90 probe outputs;
  - save, load and Continue give the same hash as an unbroken game, plain and mid-track;
  - the God Mode tools, the editor's path, landings, sea battles, AI and God strikes and the two 12-year watches all
    work.
- **What it found, all non-blocking:**
  - **R63-N1 (UI):** at Max, the track's "Next" line is now missing a quarter of the time, for up to 2 s.
  - A design objection, with a census behind it (lowers no score): from 1942 the track's fronts are held and move by
    paint, as SPEC §7.7 says. So D-Day is an empty box, Stalingrad has no army, and 2.6 million Allied and German
    soldiers stand idle together in the Low Countries in June 1944.
  - **R63-N2 (UI, track):** the nation panel's God tab ends the replay with one checkbox and says nothing of it.

## Scores

| Dimension | Run 62 | Run 63 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Scored afresh.** <ul><li>A 150-nation large random map from the title, run at Max for 90 s: 56.8–60 fps, every chip drawn (`critic/c63_xp_rnd_large.json`).</li><li>The 12-year world with heroes (35141): the USA, the Soviet Union and Germany leading; hero chips (Yamato, Bismarck, Maus, P.100 Ercole, TOG II) where they fight (`critic/shots/c63lwhon_35141_y12_world.png`).</li><li>The track's maps at Max: Vichy beside the hatched north in 1940; the Reich's four zones in 1945 (`critic/shots/c63hw_desk_*_europe.png`).</li><li>The God H-bomb on Paris (35117): mushroom, ring, the alert with "Go to", 3,329,000 civilians, the same figures as run 61 (`critic/shots/c63a_35117_13_paris_h_strike.png`).</li><li>Corridor drawn on day 3 at 1600 × 900 and 390 × 844 (`critic/c63_new.corridor_35307_*.log`).</li><li>The relations graph opens in 175–198 ms with 67–73 nodes (`critic/c63_rg_relations.*.log`).</li></ul> **Not 9 (old):** <ul><li>The ranking's Land figure still has no unit (`critic/shots/c63hi_1600x900_notinterv.png`).</li><li>The track's line under the date is about 10 px high on a phone (`critic/c63_hp_390x844.json`: top 822, bottom 832).</li><li>An AI A-bomb's place at 937 m/px is a dark smudge beside the chips (`critic/shots/c63an_34501y12_0_goto.png`).</li></ul> |
| Diplomacy, war, alliance, puppet, revolt depth | 8 | 8 | **Scored afresh.** <ul><li>diploInvariants on 6 new runs and worldInvariants on 3: 0 broken (above).</li><li>Run 62's 33501, 33503 and 33505, and run 61's 32001 (10 y): all 0 again (`critic/c63_diploinv_33*.log`, `critic/c63_diploinv_32001r_10y.log`).</li><li>**A player's war by mouse only (35421):** click German land, Take control, right-click Poland, "Declare war", Shift-drag a box (7 selected), click Warsaw. All 7 got a way, and 6 were closer after 10 days (`critic/c63_xm_35421_1600x900.json`).</li><li>The peace button at 844 × 390 and 1600 × 900 on 35217: greyed with its reason, then taken on day 35 (`critic/c63_peacebtn.35217_*.log`).</li><li>Force war (35135) (`critic/c63_fw2_35135.json`).</li><li>The track's wars and peace on their days: the Reich's end now reads "8 May 1945 The Reich ends: the four zones, and the rest under Soviet rule to the Oder" (`critic/c63_hw_desk.json`, sample 28). R62-N4 fixed.</li></ul> **Not 9:** <ul><li>Dogpiles at day 365: on 34145, France with 15 against Germany with 3; the other four seeds have none over 4:1 (`critic/c63_piles_p.log`).</li><li>After 1953 the world forgets the blocs: the Soviet Union declares war on Norway two days after Panmunjom, as in run 62 (`critic/c63_track_1938.log`).</li></ul> |
| Emergent world dynamics | 8 | 8 | **Scored afresh.** <ul><li>**Top three by area over 25 years:** they change 8 times on 34099 and 14 times on 34097. In year 25 the USA and the Soviet Union stand at 11.6 % each on 34097 (`critic/c63_toparea_*.log`).</li><li>The 12-year watches: 95 → 77 nations with heroes and 96 → 79 plain, with war and peace each month (`critic/c63_lwhon_35141.json`, `critic/c63_lwplain_35143.json`).</li><li>Year 20: in 1957 the UK is at war with British India and the US annexes Free San Salvador (`critic/shots/c63hi_32019_history.png`).</li><li>The track runs 1938 → 1953 on its days (Paris German 13–14 June 1940 and free 26 August 1944 on 1938, 34301 and 34303).</li><li>Small worlds: 3-nation random worlds 34401–34406, 4 of 6 at war in 10 years (days 4–60), 2 never. SPEC §3.4 covers this (`critic/c63_few3.log`).</li></ul> **Not 9:** <ul><li>The track's fronts of 1942–44 are painted, not fought, as specified (a design objection, below; no score lowered).</li><li>39–54 wars in the first one to two years after 1953 (`critic/c63_track_*.log`; Design objections).</li></ul> |
| God Mode | 8 | 8 | **Scored afresh.** <ul><li>H-bomb on Paris (35117), as above.</li><li>Revolt, Spawn, Found and Raze each told in the ticker (`critic/c63_q_35119.json`).</li><li>Breakthrough at war: engaged 0 → 4 → …, told in the ticker; in History, the CSV and the JSON (`critic/c63_kw_breakthrough.35123.log`, `critic/c63_kwhist.35151.log`).</li><li>On the track a God act ends it and is told: "3 January 1938 History's course ended at your first intervention, and the world goes its own way" (`critic/c63_hg.json`).</li><li>The bar says "Any act here ends the replay of history." (`critic/shots/c63hg_god_open.png`).</li></ul> **Not 9:** <ul><li>R63-N2: the God tab's ~40 controls say nothing of the replay.</li><li>God's tools still reach only the selected side, and there is no undo (old).</li></ul> |
| Editor and scenarios | 8 | 8 | **Scored afresh.** <ul><li>**By mouse (32443):** brush, undo, redo, export (591,613 bytes, as runs 61 and 62), choose the file, "Start this scenario". The painted cells are Germany's in the started game: `[1,1,1]` on the probe re-run after the reboot (`critic/c63_x_editor.32443.again.log`, `critic/c63_xe_32443.json`). The first run, on the overloaded machine, read before the world came: `[0,0,0]`, with the world there at 11.8 s (`critic/c63_xl_32443.json`).</li><li>Fleets and a bomber placed; a fleet at Berlin refused ("Not done: no water of a sea is near the place.") (`critic/c63_g_35121.json`).</li><li>The run-26 scenario file still loads (`critic/c63_os2_scen.*.log`).</li><li>R61-N2 holds: with a file chosen, the main Start is disabled with its reason (`critic/c63_x_editor.32441.log`).</li><li>Refusals: a cut file is told "the file is damaged or incomplete" and plain text "not a Warism scenario file" (`critic/c63_x_badfiles.log`).</li><li>The track's form now says "Taking a nation, a God Mode act or an editor edit ends the replay" at every size (`critic/c63_hp_390x844.json`).</li></ul> **Not 9:** <ul><li>`VIE` is defined in `1938h/nations.json` and never born on any seed (`critic/c63_track_*.log`, "never: VIE"; old).</li><li>A started scenario file shows a grey map with no nations and a short bar until its stats come: over 3 s on the machine loaded before the reboot (`critic/shots/c63xl_32443_2s.png`, stats at 11.8 s), 2–3 s afterwards (`critic/c63_xl_32443b.json`).</li><li>`c63_g_editor`'s Poland-with-warheads scenario paused on an AI strike and the probe waited on it (run 61's known case); I stopped it after 15 min.</li></ul> |
| Stats and history | 8 | 8 | **Scored afresh.** <ul><li>History on the year-20 saves: 7019 opens in 123 ms with 3,284 events and 32019 in 122 ms with 3,129, as run 61 had. Same-day rows follow their head with "↳" (`critic/c63_hi_*.json`, `critic/shots/c63hi_32019_history.png`).</li><li>CSV 3,130 lines (`critic/c63_dl_32019.csv`).</li><li>My wars only: 60 of 386 for Germany on 35303 (`critic/c63_new.mine_35303_*.log`).</li><li>**The track's rows (R62-N2, N3, N5 fixed):**<ul><li>no "timeline" or "stage" in 158 distinct ticker rows of the 15-year watch;</li><li>the Soviet arrivals named once ("15 July 1941 The Soviet mobilisation: reserves to Moscow");</li><li>Nagasaki on Japan's land, (1762.5, 403.5), JAP/JAP (`critic/c63_hw_desk.json`, `critic/c63_nagasaki.log`).</li></ul></li></ul> **Not 9:** <ul><li>One event still told three ways: on 18 August 1945, "Manchukuo was destroyed", "Mengjiang was destroyed" and "Manchukuo and Mengjiang dissolved: China in name". Two days later come two Manchuria rows (`critic/c63_hw_desk.json`, sample 29).</li><li>"0 civilians killed" beside 18,628 men (old, `critic/shots/c63an_34501y12_0_goto.png`).</li></ul> |
| UI/UX and polish | 8 | 8 | **Scored afresh.** <ul><li>**R62-N1 fixed:** a red note under Take control, "Ends the replay of history: the world then goes its own way", at 1600 × 900 and 390 × 844 (`critic/shots/c63hi_1600x900_notinterv.png`, `critic/shots/c63hi_390x844_notinterv.png`). The bar's note and the form's sentence are there too.</li><li>After a take, the ticker tells "History's course ended at your first intervention", and the notes and the line go (`critic/c63_hi_1600x900.json`).</li><li>R61-N1 holds: the × is topmost and closes the panel at 844 × 390, 932 × 430, 1024 × 500 and 667 × 375 (`critic/c63_xcb_21103_*.json`).</li><li>Run 61's 31211 h114 and run 60's 31201 at 667 × 375 give run 62's outputs byte for byte (`critic/c63_wt_ITA_31211_h114.json`, `critic/c63_mw_31201_GER_667x375.json`).</li><li>Keys: Space pauses and resumes with History focused (`critic/c63_xk.json`).</li><li>Build tiles whole at 390 × 844 and 844 × 390 (`critic/c63_new.build_35301_*.log`).</li><li>0 page errors in 90 outputs.</li></ul> **Not 9:** <ul><li>R63-N1: the "Next" line flickers at Max.</li><li>R63-N2: the God tab has no note.</li><li>The bar's note is grey, where the panel's is red (`critic/shots/c63hg_god_open.png`).</li></ul> |
| Performance | 8 | 8 | **Scored afresh, alone after every other job** (`critic/scripts/c63_chainP.sh`, 07:44–07:55; nothing else of mine running). <ul><li>**7019's year-20 save** (`99caf939`), `c63_pf_lookfps.mjs` at Max: 3,000–600 m/px 58.5–60.2 fps; 120 m/px 54.6–57.3; 30 m/px 54.0–56.3 (`critic/c63_pf_7019.json`). Run 61 had 58.0–60.1, 52.5–57.2 and 52.8–56.0 on the same world.</li><li>`tools/diag/lookFps.ts`, a draw forced each frame: 59.6–60 frames/s at every zoom, p95 about 18 ms, a draw 0.8–1.9 ms (`critic/c63_lookfps.log`).</li><li>**The tactical goal:** 60 fps at 28 m/px with 14,212 individual figures in view, and 60 at Max with 12,378 (p95 16.8 ms). 59.6–60 at 18 and 12 m/px (`critic/c63_xi_32111.json`).</li><li>Touch: 59.6 fps (`critic/c63_tm_touch.alone.log`).</li><li>**Tick, seed 99, 5 years, pinned:** mean 2.2463 ms, hash `6471c3a5`, as run 61's 2.2370 ms; year 1 is 3.10 ms against the 6.5 ms budget (`critic/c63_tick99.log`).</li><li>Beside other jobs:<ul><li>the track's 15 years at Max, 58.5–60.7 fps a quarter, longest gap 83 ms (`critic/c63_hw_desk.json`);</li><li>two 12-year watches at 59.8–60 fps, 0 frames over 500 ms;</li><li>a 150-nation large random map at 56.8–60.</li></ul></li></ul> **Not 9:** <ul><li>120 and 30 m/px over the late world still dip to 54–57 fps.</li><li>SPEC §2's older tick figures are stale text (old).</li></ul> |
| Stability | 8 | 8 | **Scored afresh.** <ul><li>**Determinism across commits:** 7019 and 32019, 20 years, `99caf939` and `4702acef` as in runs 61 and 62. workerDeterminism 32059 gives `cf5a4a7f` on every arm, as in runs 61 and 62, and new 34059 gives `7ee67ce6`.</li><li>**Run 61's bulk sets are re-run as due:**<ul><li>395 of the 396 named setups are text-identical to run 61's. The one that differs (30037 3517 g1) has 0 broken in both and counts one more click (17 against 16). The difference dates from after run 61, not from this batch: this batch's sim change is the track's alone, and plain hashes match run 62's. Not bisected; run 62 did not run this set (`critic/c63_liab_named_cmp.txt`).</li><li>All 153 stuck-return runs are identical (`critic/c63_sr_cmp.txt`).</li><li>The 168 next-voyage runs are compared by their own truth, since `landings.ts` changed after run 61 (R59a). There are 120 tellings of "next voyage in about N days". The 48 followed by a voyage all sail within a day of the days told (−0.9 to +1.0); run 61 had 47, up to 4.5 days late. The same two runs break the landing checker as in run 61 (30041 and 31157, 3517 g1) (`critic/c63_nv_cmp.txt`, `critic/c63_nv/`).</li></ul></li><li>**Save mid-track:** 1938h saved by Settings > Main menu on 5 February 1939 continues at the same tick and hash (9600, `2004257376`) with its "Next" line. 120 days on it matches an unbroken page with the same `?after=` (`80410916` both; `critic/c63_hc_400_120.json`).</li><li>Plain save and load (35137): the same hash twice (`critic/c63_sl_plain_35137.json`). The player's Continue (35415) matches an unbroken game 60 days on (`critic/c63_xc_35415_GER.json`).</li><li>The two 12-year watches: 0 frames over 500 ms. 0 page errors in 90 outputs.</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>Z 35111: one wheel zoom from 6,000 to 3 m/px over the opening battle. Elements from 1,573 m/px (7,965); individual figures from 28.3 m/px (13,832); no error. These are run 61's figures to within 5 (`critic/c63_z_35111.json`).</li><li>Phone 35133: 30,000 → 25 m/px, no horizontal overflow at any tier (`critic/c63_phz_35133.json`).</li><li>Sea battle 20885 t107 in both looks (`critic/c63_sb_seaballs.*.log`).</li></ul> **Not 9:** <ul><li>Tiers seen on the track: Normandy on 20 June 1944 and Stalingrad on 15 September 1942 at 6,000 → 12 m/px. The tiers draw, but there is nothing fighting to zoom into, by design (Design objections; `critic/shots/c63hz_*.png`).</li></ul> |
| Naval warfare (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>landingInvariants on new seeds: 0 of 90 broken, no `slowClick`.</li><li>Run 61's three `slowClick` cases and seven named cases are text-identical to run 62's (`critic/c63_li_*.log`).</li><li>R60-N1 and R60-N2's traces are identical to run 62's fixed ones (`critic/c63_nvtrace_*.log`).</li><li>seaBattles: run 61's 32061 and 32063 give 75 and 87, as before. New 34061 has 50 in 3 years, all 50 seen in the page; 34063 (random diplomacy) has 54 (`critic/c63_sb_*.log`, `critic/c63_sbl_34061.log`). **R60-N5 (31501):** 45 battles as in run 61. 44 of 44 are seen and 1 is told "no fleet to see" (NED v USA, t17369), where run 61 saw 43 of 45 (`critic/c63_sbl_31501.log`).</li><li>**Landings on new seeds (page):**<ul><li>35107 England to Bremerhaven: "over: 3 landed";</li><li>35109 Japan to Shanghai: "over: 3 landed";</li><li>35103 Germany to Norwich: "the transports of their landing were sunk… the landing is over";</li><li>35105 Rome to Valletta: "its transports broke off; 2 came ashore near Palermo";</li><li>35101 a cancel: "2 back at Tokyo, Ōsaka, 1 stopped where they stood" (`critic/c63_lland.*.log`, `critic/c63_lhold.*.log`, `critic/c63_turnback.*.log`).</li></ul></li><li>Next-voyage tellings on 35211 ("Marching to Rome, about 12 days: its landing sails before it is there…", `critic/c63_nvpage_ITA_35211_12_1600x900.json`).</li></ul> **Not 9 (old):** <ul><li>Malta is never taken: run 61's 18 page runs re-run, 18 of 18 over with Valletta not taken (11 thrown back to Catania, 7 broken off to Palermo; `critic/c63_malta.log`), and new 35105 broke off.</li><li>The run-61 `slowClick` tail is still there, unchanged.</li><li>On the track D-Day is an `occupy` with no landing (a design objection).</li></ul> |
| Tanks (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>7781 and 35115, day 4: the same opening scene as run 61's, armoured divisions 40 and 42 picked, 0 errors (`critic/c63_c_7781.json`, `critic/c63_c_35115.json`).</li><li>`combat.ts` is unchanged since run 62.</li></ul> **Not 9 (old):** German and Polish labels share one style at 80 m/px. |
| Aircraft (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>PL 35125: plane marks at every tier from 3,000 to 25 m/px in both looks (42 marks at 3,000, 1 at 25; `critic/c63_pl_planes.35125_GER_POL_5363.log`).</li><li>W 35127: the followed fighter marked in 56 of 61 samples at 3,000 m/px (median 32 px) and in 61 of 61 at ×5 (`critic/c63_w_wing.35127.log`).</li><li>The air war told monthly in every watch.</li></ul> **Not 9 (old):** at 250 m/px the followed fighter's mark is 94 px from its sorties at the median and up to 1,256 px, and only 37 of its 59 samples have a flying mark, 1 flying with none (`critic/c63_w_wing.35127.log`, "x1_250"). |
| AI nuclear use (needs 8) | 8 | 8 | **Scored afresh, in a world made this run.** <ul><li>**34501**, saved at year 12 by this run (`critic/c63_seed34501_y12.bin`): on 9 April 1950 the page pauses on "United States struck Canada with an atomic bomb near Duluth: 0 civilians killed; 18,628 men and 68 guns lost", with its alert, "Go to" and ticker row (`critic/c63_an_34501y12.json`, `critic/shots/c63an_34501y12_0_goto.png`).</li><li>**Detonations over 22 years** (`critic/scripts/c63_nukecount.ts`): new seeds 34501, 34503 and 34507 give 12, 2 and 12, with 7 interceptions on 34507 (`critic/c63_nc/*.log`).</li><li>On the track, the AI strikes nothing until 1953 (`critic/c63_track_*.log`).</li></ul> **Not 9:** <ul><li>No strike in the 400 days after year 20 on 7019 or 32019, nor after year 13 on 34505 (`critic/c63_an_*.json`; old).</li><li>"0 civilians killed" beside large military losses (old).</li><li>The burst's place is a smudge at 937 m/px.</li></ul> |

## Blocking issues

None.

- `landingInvariants` on 90 new runs: 0 broken, no `slowClick`.
- diploInvariants on 6 new runs and 4 named ones; worldInvariants on 3 new runs and 4 named ones: 0 broken.
- workerDeterminism: one hash on every arm, on 2 seeds.
- landingRows (115 cases), seaBattlesLook (50 of 50) and the staged repulses: 0 broken.
- The track's checker on its own seed and 3 more: 0 broken.
- 0 page errors.

## Non-blocking issues (prioritised)

1. **R63-N1 (UI, track, new, from R64f's fix): at Max, the "Next" line is missing a quarter of the time.**
   - `node critic/scripts/c63_h_blank.mjs 120 1600 900 99`: 1,084 samples about 110 ms apart, 1938 → December 1941
     (`critic/c63_hb_1600x900_s99.json`).
     - The line is absent in **266 (24.5 %)** of them, in runs of up to 18 samples (about 2 s).
     - It is never past (0 of 1,084), so R62-N6 is fixed.
   - The stats come once a second (median 997 ms apart). At Max the line hides from its event's hour until the next
     stats, so it blinks off at every event (`critic/shots/c63hb_1600x900_blank0.png`).
   - In the page watch, 19 of 62 samples taken just after a pause have no line; run 62 had 3 of 63
     (`critic/c63_hw_desk.json` against `critic/c62_hw_desk.json`). Paused, it comes back within about 1.5 s
     (`critic/c63_hpb.json`).
   - **Fix:** send the next few events' ticks and notes with the stats, so the bar moves on to the next one at the
     right hour instead of hiding.
2. **R63-N2 (UI, track, new): the God tab ends the replay unsaid.**
   - `node critic/scripts/c63_h_godtab.mjs 1600 900 god-world-ai`: 1938h, God Mode on, Germany's God tab.
   - In view: about 40 controls (traits, efficiency, "World AI", "Winner takes all", diplomacy) and no note.
     - The Take control note is scrolled out of the panel.
     - The bar's "Any act here ends the replay of history." stands under "Map tools", which reads as those tools only
       (`critic/shots/c63hgt_1600x900_box.png`).
   - One click on "World AI" ends the track that hour (`critic/c63_hgt_1600x900_god-world-ai.json`). It is told
     after, in the ticker (`critic/shots/c63hgt_1600x900_after.png`).
   - **Fix:** the note at the head of the God tab too (as the editor's), or word the bar's note "Any God Mode act".
3. **R61-SC (naval, carried as is):** run 61's three `slowClick` breaks, word for word (`critic/c63_li_32167_*.log`,
   `critic/c63_li_32115_15101_g2.log`). 0 new breaks in 90 runs.
4. **Small:**
   - The 18 August 1945 Manchukuo triple (statsHistory row).
   - Ticker order rows dated 3 January still stand under a 4 January row on 31211 h114 (byte-identical to run 62,
     `critic/c63_wt_ITA_31211_h114.json`).
   - The bar's note is grey, where the panel's is red.
   - A started scenario file shows a grey world for 2–3 s (`critic/shots/c63xl_32443_2s.png`).
   - `VIE` defined and never born.
   - The track's line is ~10 px on a phone.
   - The ranking's Land figure has no unit.
   - "0 civilians killed" beside large losses.
   - No late strike after year 20.
   - **Old, not re-checked this run:** alliances ignoring the map (run 61's 32415); the phone's panel over the corridor
     (run 61's 30307). Their probes were not re-run, and nothing in this batch touched them.

## Run 62's cases re-run

| Run 62 case | Run 62 (`9e094f50`) | Run 63 (`78b082b4`) | Evidence |
|---|---|---|---|
| R62-N1 `c62_h_interv 1600 900`, `c62_h_god` | one click ends the track, unwarned, untold in the ticker | **fixed**: notes under Take control, on the bar, at the editor's head and on the form; the ticker row "History's course ended…"; a revolt and a take each end it that hour | `critic/c63_hi_1600x900.json`, `critic/c63_hg.json`, `critic/shots/c63hi_390x844_notinterv.png` |
| R62-N2 builder's words, doubles | "the timeline's stages", 4 doubles | **fixed**: none in 158 distinct rows of the watch; one triple of another kind remains (Manchukuo) | `critic/c63_hw_desk.json` |
| R62-N3 "The mobilisation" ×22 | whose not said | **fixed**: "The Soviet mobilisation: reserves to Moscow", once | `critic/c63_hw_desk.json` |
| R62-N4 8 May 1945 | "Germany was annexed by Soviet Union" | **fixed**: "The Reich ends: the four zones, and the rest under Soviet rule to the Oder" | `critic/c63_hw_desk.json`, sample 28 |
| R62-N5 `c62_nagasaki.ts` | sea cell, "no nation holds the land" | **fixed**: (1762.5, 403.5), JAP/JAP | `critic/c63_nagasaki.log` |
| R62-N6 `c62_h_watch` at Max | a past "Next" in 14 of 60 samples | **fixed** (0 of 62), but no line in 19 of 62 (R63-N1) | `critic/c63_hw_desk.json` |
| `c62_h_next` Greece, 6-hour steps | moves on in its step | the same, with 2 steps blank between | `critic/c63_hn_greece.json` |
| `c62_h_phone` 390 × 844, 844 × 390 | line fits | fits; the form's sentence now whole | `critic/c63_hp_*.json` |
| `c62_h_seed` | one hash for three URLs | ran; the same | `critic/c63_hseed.json` |
| Save and Continue mid-track | not driven | **same hash, track on** | `critic/c63_hc_400_120.json` |
| Track checker 1938, 33301, 33303 | 0 broken | 0 broken; 33301's hash moved (Nagasaki's burst moved) | `critic/c63_track_*.log` |
| R61-N1 closeblock 21103 ×4 sizes | fixed | the same | `critic/c63_xcb_21103_*.json` |
| R61-N2 / R61-N3 editor, bad files | fixed | the same | `critic/c63_x_editor.32441.log`, `critic/c63_x_badfiles.log` |
| Editor 32443 | paint kept | paint kept, `[1,1,1]` on the re-run (the first run read too early under load) | `critic/c63_x_editor.32443.again.log` |
| R60-N3 31211 h114, R60-N4 31201 667 × 375 | fixed | byte-identical outputs | `critic/c63_wt_ITA_31211_h114.json`, `critic/c63_mw_31201_GER_667x375.json` |
| 7019, 32019 20 y | `99caf939`, `4702acef` | the same | `critic/c63_seed*_save.log` |
| diploInvariants 33501/3/5, worldInvariants 33507/9/11 | 0 | 0 | `critic/c63_diploinv_33*.log`, `critic/c63_wi_33*.log` |
| Named landingInvariants ×7, R61-SC ×3, nvtraces ×2 | as run 61 | text-identical | `critic/c63_li_*.log`, `critic/c63_nvtrace_*.log` |
| seaBattles 32061, 32063r; workerDeterminism 32059 | 75, 87; `cf5a4a7f` | the same | `critic/c63_sb_*.log`, `critic/c63_wd_32059.log` |
| Malta's 18 (run 61's) | | 18 of 18 not taken, as run 61 | `critic/c63_malta.log` |
| R60-N5 seaBattlesLook 31501 (not run by run 62) | run 61: 43 of 45 | **fixed**: 44 of 44 seen, 1 told "no fleet to see" | `critic/c63_sbl_31501.log` |
| Run 61's bulk sets (not run by run 62) | | 395 of 396 and 153 of 153 identical to run 61; next voyage: 48 of 48 within a day (run 61: up to 4.5 days) | `critic/c63_*_cmp.txt` |

## Design objections (none blocking, no score lowered)

- **The historical track's great land battles of 1942–44 are painted, not fought.** This is specified: "From 1942 the
  fronts are held between their stages and move by them alone" (SPEC §7.7, R62h0, ADR-935). A `hold` keeps "The
  Western Front" from 6 June 1944, and D-Day is an `occupy` with no `forces` (`data/scenarios/1938h/timeline.json`).
  What it gives a viewer who zooms in:
  - **Census** (`npx tsx critic/scripts/c63_census.ts 1938`, `critic/c63_census_1938.log`; land formations by box):
    - 15 September 1942: no land formation of any nation between 38°E and 47°E, 46.5°N and 51.5°N: Stalingrad and
      the Don bend.
    - 20 June 1944: none in the Normandy beachhead, and no German one anywhere in France.
    - In the Low Countries box, Germany has 1.31M men (164 formations), the UK 571k (83) and the US 720k (69), all 0
      engaged. They are the stacks at Amsterdam in `critic/shots/c63hz_normandy_01500.png`.
    - 26 August 1944, "Paris liberated": the same, the UK with 25k in France (`critic/shots/c63hw_desk_25_europe.png`).
  - **Sight:**
    - the beachhead an empty hatched box (`critic/shots/c63hz_normandy_00250.png`);
    - at Stalingrad a few scattered marks (`critic/shots/c63hz_stalingrad_00120.png`, `node critic/scripts/c63_h_zoom.mjs`).
  - The fault is the design's: a replay at unit zoom shows its turning points as paint. Some armies there, even ones
    the `hold` keeps from fighting, would make it read as history.
- **The world after 1953 forgets the Cold War at once** (as run 62). On the own seed the Soviet Union declares war on
  Norway on 29 July 1953, and 54 wars come in two years (`critic/c63_track_1938.log`).
- **The same history every game** (ADR-919).
- **A confirm before the first act would cost less than a note** (ADR-952 chose notes). A player who has read none of
  the four notes loses fifteen years with one checkbox (R63-N2).

## Ideas from other games (not scored)

- Hearts of Iron's historical AI moves real armies to the historical fronts, rather than painting them. That is the
  way to give D-Day a fight.
- Paradox games keep a "next event" list for the player, a few ahead, not only the next one.

## Strengths (verified)

- **The batch fixed all six of its findings, on the probes that found them,** with no rule broken anywhere:
  - 90 new landing runs at 0;
  - 6 new diplomacy runs and 3 new world runs at 0;
  - the track's checker at 0.
- **The game is deterministic and holds across saves.** Plain 1938 is bit-identical over two batches (`99caf939`), and
  395 of run 61's 396 landing setups and all 153 stuck-return runs are text-identical. A 1938h game saved mid-track
  continues to the same hash as an unbroken one (`critic/c63_hc_400_120.json`).
