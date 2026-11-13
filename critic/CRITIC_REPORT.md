# Critic report, run 67 (full): Batch 21 (R76a–g, R77) and the whole brief

- **Mode: full.** The spawning message asked for one ("Run the critic per CRITIC_PROMPT.md on the current HEAD: full
  run"). This is the run ADR-1016 sets after a focused run's non-blocking fixes. Every dimension is scored afresh and
  nothing is carried.
- **Commit judged:** `6e0e46f37ddd91ba447d2c2d22239a8572601ba6`, HEAD at the start, on a clean tree
  (`critic/c67_commit.txt`).
  - During the run the builder pushed `43e6642e` (PROMPT, DECISIONS, PROGRESS only; `git diff --stat 6e0e46f3 43e6642e`
    touches no source).
  - `landingFuzz` labels its logs with that HEAD (`.cache/landingFuzz/43e6642e-39101/`). The code it ran is
    `6e0e46f3`'s.
- **What changed since run 66 (`a0880be6`):** 12 commits, 12 files under `src/`, `data/` and `tools/`.
  - R76a: the focus after the track only for an end from 1946 (`strategic.ts`).
  - R76b: the free card of a later year (`TitleScreen.tsx`, `NewGameForm.tsx`, `en.json`).
  - R76c: `seaPowers`, the seven world powers plus the seven largest navies, cross any sea. A rule of every game; the
    pin moved to `c64a53fb`.
  - R76d: the Sixth Army on 24 October; D-Day's stage moved (`timeline.json`).
  - R76e: a refused start opens at its year and mode (`gameUrl.ts`, `main.tsx`, `TitleScreen.tsx`).
  - R76f and R76g: answered, no code; ADR-1019 is the user's decision.
  - R77: `fightDays`, D-Day's window of 50 days to 25 July (`track.ts`, `schemas.ts`, `timeline.json`,
    `trackFronts.ts`).
- **The sim changed.** Run 61's bulk sets and Malta's 18 are due and re-run. Plain 1938 is not carried: the diff
  touches `src/sim/ai/`.
- **Setup:**
  - Build: `vite build --outDir critic/c67_dist`, exit 0 (`critic/c67_build.log`).
  - The yearly starts: `npm run saves -- critic/c67_starts`, 38 years, 430 s (`critic/c67_saves.log`), copied into the
    build.
  - Server: `vite preview` on 127.0.0.1:5367.
  - Browser: Playwright Chromium at 1600 × 900, 390 × 844, 844 × 390, 932 × 430, 1024 × 500 and 667 × 375.
  - Probes: `critic/scripts/c67_*`.
    - Run 66's and run 63's probes are copied as `c67_*`. Run 63's whole-brief suite (`c67_suiteB.sh`) runs on new
      seeds 39xxx.
    - New: `c67_seapowers.ts`, `c67_farlands.ts` (R76c), `c67_firstdecl.ts` (declarations across oceans),
      `c67_dday.ts` (the Normandy box weekly, R77) and `c67_g_editor_diag.mjs` (the editor probe's stall).
  - Headless: `c67_jobsAll.txt`, 83 jobs, 6 at a time (`c67_runNamed.sh`), then `landingFuzz` from 39101.
  - Page chains: `c67_pages.sh`, `c67_pages2.sh` (with `c67_suite.sh`, `c67_suite2.sh` and `c67_chainE.sh`), and
    `c67_suiteB.sh`.
  - Bulk: `c67_chainBulk.sh`. Performance: `c67_chainP.sh`, alone and last (13:37–13:50). After it, `c67_after.sh`.
  - Run 66's commit was checked out beside HEAD in `critic/wt` and run headless for two cases: the declarations across
    oceans and D-Day.
    The `node_modules` junction was unlinked before `git worktree remove`.
- **Incidents, disclosed:**
  - The four `afterTrack` runs of the queue failed at their end: their cache directory `critic/c67_atcache` was
    missing. They were run again (`c67_atRerun.sh`), and those reruns are the figures used.
  - I restarted suite B once, before any of its probes ran, so that it would run beside chain E.
  - `npm run bench -- G` was not run: it writes the tracked `docs/bench/`.
- **Writes outside `critic/` by tools at their defaults:**
  - `trackFronts` wrote `.cache/trackFronts_*.json`;
  - `landingFuzz` logged to `.cache/landingFuzz/43e6642e-39101/`;
  - `npm run sim` wrote `.cache/runs/*.json`.
- **Clean-up:** every server, browser and job I started is stopped, by its PID tree or its `c67_` / `--port 5367`
  command line. Nothing was matched by a browser's name.

## Verdict

**No blocking issue. Every dimension is at its bar (8).**

- **The rule checkers on new seeds:**
  - `landingInvariants` via `landingFuzz --seeds 15 --first 39101`: **0 of 90 runs broken** (`critic/c67_landingFuzz.log`).
  - diploInvariants, 0 broken:
    - 39001 (1938), 39003 (random), 39005 (heroes) and 39007 (random world), 5 years each;
    - 39009 (1938) and 39011 (random, heroes), 10 years each;
    - the named seeds 33501/3/5, 37001/3/5 and 38001/3/5 (`critic/c67_diploinv_*.log`).
  - worldInvariants, every rule set, 0 broken:
    - 39051, 39053 (heroes) and 39055 (random world);
    - the named seeds 36009/11, 37007/9/11 and 38007/9/11 (`critic/c67_wi_*.log`).
  - `landingRows all`: 115 cases, 20,321 hours, 0 broken (`critic/c67_lrows_all.log`).
  - `repulse` on 39071 and 39073: 0 broken.
  - The track's checker to 31 December 1975: 0 broken lines on 1938, 37301, 37303, 38301, 38303, 39301 and 39303
    (`critic/c67_track_*.log`).
- **The batch fixed what it was asked to fix, on the critic's own probes:**
  - R66-N1, the free-burst bar: the replay left in 1938 now declares exactly what plain 1938 does on the same seed.
  - R66-N2, the free card: fixed at 1600 × 900 and at 390 × 844.
  - R66-N3, the sea reach: the United States is among `seaPowers` at every year and lands past 4,000 km in years 1–3 on
    7019 and 39811, years 1–2 on 39813.
  - R66-N4, the stages: AT met as rescoped (ADR-1018). Uranus is fought on 38701 (0/28 before, 9/28 now), and D-Day is
    fought in 39–72 % of its samples.
  - R66-N5, a refused start: fixed in all ten cases.
- **New, non-blocking:**
  - **R67-N1, D-Day lost (the most important):** the replay's D-Day is now fought and lost.
    - On the replay's own seed, the 75k Allied men who landed are 5.2k by 26 July.
    - The British and Canadian divisions are gone by 18 July.
    - France is then "freed" on 25 August and 15 September by handover, with 5.2k American and 90 French men in it.
  - **R67-N2, wars across oceans:** Japan declares war on a European minor in the first 60 days of plain 1938 on 9 of
    10 new seeds. This is old: run 66's commit does the same.
  - **R67-N3, Japan's navy in European waters:** Japan's navy is lost out of battle there, 179–194 ships in three years
    on two seeds.

## Scores

| Dimension | Run 66 | Run 67 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Scored afresh.** <ul><li>**The stages read at their tier.** Normandy on 7 June: the American, British and Canadian divisions on the beachhead and the German divisions about it, at 600 m/px (`critic/shots/c67st_normandy_d6.png`). At 60 m/px on 20 June, each division's figures and label (`critic/shots/c67hz_normandy_00060.png`). Stalingrad at 40 m/px on 20 November: the grey and red figures of the city's fight (`critic/shots/c67st_uranus_40.png`).</li><li>**The 1975 places** match run 66 (`critic/c67_pl_1975.json`, identical). `c67_landof.ts 1975`: NFL, TAN, BEA and MAN own 0 cells (`critic/c67_landof_1975.log`).</li><li>**God's H-bomb on Paris:** the cloud, the ring and the alert are legible at country zoom (`critic/shots/c67a_39917_14_paris_h_2h.png`).</li><li>**The AI's H-bomb of 1958 on 7019** has "Go to" at the burst (`critic/shots/c67an_7019y20_0_goto.png`).</li><li>**Sea battles:** `seaBattlesLook` saw 52 of 52 battles on 39061 and 44 of 44 on 31501 at their cameras (`critic/c67_sbl_*.log`).</li></ul> **Not 9:** <ul><li>R67-N1's beachhead melts on the map.</li><li>Germany's 1938 label flag is told from Poland's only by a 2-px black band at 250 m/px (`critic/shots/c67c_39915_arm_0250m_crop.png`, enlarged).</li><li>The 1958 strike on Hokkaido is named "near Nevelsk", a city across the strait on Sakhalin (`critic/shots/c67an_7019y20_0_goto.png`).</li><li>The Land ranking is by owner, not holder: in November 1942 Germany is not in its top 15, and the figures are unchanged from 1942 to 1944 (`critic/shots/c67st_uranus_d1.png`, `critic/shots/c67st_normandy_d6.png`). It still has no unit (old).</li></ul> |
| Diplomacy, war, alliance, puppet, revolt depth | 8 | 8 | **Scored afresh.** <ul><li>**Every checker passes** (above): 15 diploInvariants runs, 11 worldInvariants runs, 7 track checkers, `landingFuzz` and `landingRows`.</li><li>**R76c, the sea reach** (`critic/scripts/c67_farlands.ts`, landings by nation and year, over 4,000 km from the port of embarkation): the United States lands past 4,000 km in years 1–3 on 7019 (15, 9, 4 landings) and 39811 (10, 3, 10), and in years 1–2 on 39813 (11, 8; none in year 3). Supporting only: far landings also come from wars a nation was drawn into (the Netherlands, no sea power, 4 of 4 past 4,000 km on 7019 in year 1). `seaPowers` holds USA, SOV, GER, ENG, FRA, ITA and JAP at day 0 on all three (`critic/c67_farlands_*.log`, `critic/c67_seapowers_7019.log`). Japan is out of the set on 7019 in years 1–5, not among the seven largest navies nor the world powers (ADR-1017's rule).</li><li>**R76a:** the replay left on 1 January 1938 declares 31 and 28 wars in its first year on 5151 and 6161. Plain 1938 on the same seeds also declares 31 and 28, on the same days (run 66: 19 and 19) (`critic/c67_fb_1938_*.log` against `critic/c67_fb_0_*.log`).</li><li>**1975's quiet start is kept:** 5 and 10 declarations in the first 30 days of 154 nations. That is 0.47 and 1.11 times plain 1938's rate per nation (bar ≤ 1.2) (`critic/c67_fb_1975_*.log`).</li><li>**The blocs hold for 10 years after the track:** SOV 8/8 and USA 14/14 at each year's end on 37601, 37603, 38601 and 1938 (`critic/c67_atx_*.log`). The end hours on 999, 5151, 6161 and 31337: every join is to a new pact (ids 10–13, `c67_tagidx.ts`), none to NATO (9) or the Eastern Bloc (8) (`critic/c67_endhours_*.log`).</li><li>**Piles:** no war over 4:1 at day 365 on 5 seeds (`critic/c67_piles_p.log`). The first war of 3-nation worlds comes on day 13 to day 2,589 (`critic/c67_few3.log`).</li></ul> **Not 9:** <ul><li>R67-N2, wars declared across the world on Baltic states and the Spanish Republic.</li><li>People's China's army falls from about 650k to 18k–90k within two years of the track's end on all four seeds (old) (`critic/c67_atx_*.log`).</li></ul> |
| Emergent world dynamics | 8 | 8 | **Scored afresh.** <ul><li>**Two 12-year watches at Max on new seeds:** 39941 with heroes, 39943 plain. Wars run every year (3–6 war banners at each year's end), and capitals change hands (the Soviet Union's twice, Hungary's, Italy's among them). 0 frames over 500 ms in 24 years watched (`critic/c67_lwhon_39941.json`, `critic/c67_lwplain_39943.json`).</li><li>**The area tops move:** the first three change 8 times in 25 years on 39097 and 39099 (`critic/c67_toparea_*.log`).</li><li>**After the track:** 61–75 declarations in the year on 7 seeds, 0–1 detonations (`critic/c67_track_*.log`). A free 1975 game (after 6161), watched to 1977, has conquests on three continents (`critic/c67_lw_1975free_6161.json`).</li><li>**The replay's war is fought at its stages:** Uranus is engaged at its hour 5/8, 24/9 and 10/8 on 1938, 37701 and 38701. 9–12 of 23–24 large land fronts are both engaged at the hour on four seeds (bar 9) (`critic/c67_tf_*.log`).</li></ul> **Not 9:** <ul><li>**R67-N1:** the replay's D-Day reads as an Allied defeat (below).</li><li>The free world after 1975 turns to capitals taken far afield within months (design objection, below).</li></ul> |
| God Mode | 8 | 8 | **Scored afresh.** <ul><li>**Run 66's God cases are identical:** the tools on 36119 and Breakthrough 36151. The H-bomb on 36117 differs only in the title's random seed field (`critic/scripts/c67_cmpjson.mjs`: `c67_q_36119.json`, `c67_kwh_36151.json` SAME).</li><li>**New seeds:**<ul><li>H-bomb on Paris and A-bomb on London (39917), each with its alert, ticker row and history row; the charts show warheads, nuclear dead and fallout (`critic/shots/c67a_39917_*`).</li><li>Breakthrough 39979: engaged formations 0 → 34 in 7 days (`critic/c67_k_39979.json`).</li><li>Breakthrough history 39951, in History, CSV and JSON (`critic/c67_kwh_39951.json`).</li></ul></li><li>**The God tab at 390 × 844** (left out in run 66): it opens with its notes ("Any God Mode act ends the replay of history"); no act, no end (`critic/c67_hgt_390x844_god-world-ai.json`).</li><li>From a 1970 start, a revolt ends the track and is told (`critic/c67_hg70.json`).</li></ul> **Not 9 (old):** God's tools reach only the selected side; there is no undo. |
| Editor and scenarios | 8 | 8 | **Scored afresh.** <ul><li>**R66-N5 fixed (R76e):** `c67_x_badyear2.mjs` at 1600 × 900 and 390 × 844. A 404 for 1960 replay, a 404 for 1975 free, and wrong bytes all open the card at the year refused, in the mode asked: slider 1960/1975, date "1 January 1960/1975". The notice is in view in all ten cases, at 390 × 844 with a saved game too (top 401 px). Continue is kept (`critic/c67_by2.json`, `critic/shots/c67by2_390x844_withSave.png`). A year never built (1977) opens at 1938.</li><li>**R66-N2 fixed (R76b):** at 1975 in "Play free", the card reads "The world as history left it on 1 January 1975, played on from there on its own course". Beside Start: "The world of 1 January 1975 is the same in every game; what follows it is drawn anew each game", at both sizes (`critic/shots/c67rc_1975_free_1600x900_card.png`, `critic/shots/c67rc_1975_free_390x844_card.png`).</li><li>**The slider:** by keys and drag, label, date, count, powers and preview move together (`critic/c67_slider.json`). The starts open at their date in 3.6 s (1975 free).</li><li>**The editor (32443):** painted, undone, redone, exported (591,613 bytes, as runs 61–66), loaded with Germany's cells `[1,1,1]` (`critic/c67_x_editor.32443.log`). Bad files are refused (`critic/c67_x_badfiles.log`). The 1938 standoff scenario loads (`c67_os2_scen`).</li><li>**`c67_g_editor` 39921**, a fleet and Polish warheads placed in the editor, exported and played: it stalls at day 60 as in run 63. `c67_g_editor_diag.mjs` shows why: the game is paused on "Poland struck Germany with an atomic bomb near Berlin" on 13 February 1938, the strike pause by design, and the tick stands at 1035 over 10 s. A probe limit, not a freeze (`critic/c67_g_39921_stall.json`, `critic/shots/c67g_39921_90_stall.png`).</li><li>Save and load are bit-identical on 39937 (`same: true`, `same2: true`).</li></ul> |
| Stats and history | 8 | 8 | **Scored afresh.** <ul><li>**History on the year-20 saves:** 32019 opens in 136 ms with 4,263 events; 7019 in 144 ms with 3,470. The CSV has 4,265 lines (`critic/c67_hi_*.json`, `critic/c67_dl_32019.json`). From the 1975 start, 2,469 events open in 140 ms (`critic/c67_te_1975.json`).</li><li>`histgrep` and `warsof` on 39309 (France, 540 days) run with 0 errors. "My wars only" on 39303 shows 28 of 302 events for Germany (`critic/c67_new.mine_39303_*.log`).</li><li>The card's great powers per year equal the deployed site's: 38 of 38 years (`critic/c67_starts/years.json` against `critic/c67_deployed_years.json`).</li></ul> **Not 9:** the Land ranking's unit and its count by owner (Map visuals); Spain on the 1941–49 card (ADR-1019, the user's decision). |
| UI/UX and polish | 8 | 8 | **Scored afresh.** <ul><li>R76b and R76e (above).</li><li>**Run 66's UI cases are identical:** the phone line at 390 × 844 and 844 × 390, the keys, Continue, closeblock at five sizes, the war list at 667 × 375, and the ticker order (`c67_cmpjson.mjs`: SAME).</li><li>**Resume during "Building the world…"** holds: "3 January 1938" running after 3 s (`critic/c67_xbp_1600x900_p1.json`). The overlay goes once the world is drawn: 1938 and 1938h at 1600 × 900, 1975 free at 390 × 844, 0 samples over a drawn world (`critic/c67_xb_*.json`).</li><li>**The Next line** is never blank in 1,087 samples of 120 s at Max (`critic/c67_h_blank.120.log`). 0 of 63 samples are blank in the 15-year watch (`critic/c67_hw_desk.json`).</li><li>The relations graph on three new seeds, desk and phone (`critic/shots/c67rg_*`).</li><li>0 page errors outside the deliberate 404s of the refused-start probes.</li></ul> **Not 9:** the relations graph labels few of its nodes; a truce is told only in its footer (`critic/shots/c67rg_39939_desk_d365_focus.png`). |
| Performance | 8 | 8 | **Scored afresh, alone and last** (`critic/c67_pf.status`, 13:37–13:50). <ul><li>**Tick, seed 99, 5 years, pinned:** mean 2.33 ms (run 66: 2.10); year 1 3.21 ms against the 6.5 ms budget. Year 1's hash is `c64a53fb`, ADR-1017's pin (`critic/c67_tick99.log`).</li><li>**The replay's tick** (1938h, 5 years): mean 1.61 ms (run 66: 1.70) (`critic/c67_tick1938h.log`).</li><li>**The year-20 world of 7019 at Max:**<ul><li>3,000–600 m/px: 58.6–60.2 fps.</li><li>120 m/px: 52.5–55.8 (run 66: 53.6–56.3).</li><li>30 m/px: 53.5–56.2 (`critic/c67_pf_7019.json`).</li><li>`lookFps`, a draw forced each frame: 58.0–60 frames/s at every zoom, a draw 0.8–2.8 ms (`critic/c67_lookfps.log`).</li></ul></li><li>**The tactical goal:** 59.9 fps at 28 m/px with 12,378 individual figures, Max (`critic/c67_xi.log`). Touch: 59.3–59.8 fps.</li><li>Beside other jobs: the 12-year watches at 0 frames over 500 ms. The free 1975 watch holds 59.6–60.1 fps (`critic/c67_lw_1975free_6161.json`).</li></ul> **Not 9:** 120 m/px over the late world still dips to 52.5 fps. |
| Stability | 8 | 8 | **Scored afresh.** <ul><li>**The yearly starts match the deployed site:** 38 of 38 hashes, counts and powers equal the deployed site's `years.json`.</li><li>**workerDeterminism:** 32059 gives `cf5a4a7f` on every arm (run 65's value; run 66 `6c0b4082`, the R74h pin), and 39059 gives `36e98e06` on every arm (`critic/c67_wd_*.log`).</li><li>**7019's year 1 is `7383572f`, as run 65's** before R74h (ADR-1017's claim, seen). Its year 20 is `f88d8b46` (`critic/c67_seed7019_save.log`).</li><li>**The named headless cases against run 66, text for text, seconds stripped** (`critic/scripts/c67_cmpnamed.sh`): 11 of 12 landing cases, both next-voyage traces, diploInvariants 33501/3/5 and 37001/3/5, and worldInvariants 36009/11 and 37007/9/11 are identical. 203997 reckons one click fewer, with the same `slowClick`.</li><li>**Malta's 18 are identical to run 66's**, line for line (`critic/c67_malta.log`).</li><li>**Run 61's bulk sets, against run 66's** (`critic/c67_liab_named_cmp.txt`, `critic/c67_sr_cmp.txt`, `critic/c67_nv_cmp.txt`): 366 of 396 landing setups identical, the one break 30041 g1's known `slowClick`; 153 of 153 stuck returns; 162 of 168 next voyages.</li><li>**The 1954 free strike:** on the page and headless on the same day, 2 May, at the same point (1316.54, 385.37) (`critic/c67_an_y1954.json`, `critic/c67_nukes54_6161.log`).</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Scored afresh** (carried in run 66). <ul><li>**`z_zoom` 39911 from 6,000 to 3 m/px in 18 steps:** formations from 1,573 m/px, individual figures from 28 m/px (13,837), down to 4,442 at 3 m/px. Frames are drawn at every step (`critic/c67_z_39911.json`).</li><li>**`c_battle` on 7781 and 39915**, infantry and armour at 3,000, 900, 250, 80, 25 and 10 m/px: elements down to 180, figures 6,003–13,280. At 15 m/px, live: German tanks against Polish infantry (`critic/shots/c67c_39915_arm_15m_live_1.png`, `critic/shots/c67c_39915_arm_0250m.png`).</li><li>**The track at 6,000 → 12 m/px** at Stalingrad and Normandy (`critic/shots/c67hz_*`). Vietnam 1968 at 4,000 → 25 m/px is identical to run 66 (`critic/c67_vn_1968.json`).</li><li>Sea click 39913: from the ticker row to the battle at 68 m/px (`critic/shots/c67sc_39913_150m.png`).</li></ul> **Not 9:** `h_zoom`'s own m/px reading is stuck at 19,567.9 (a probe fault, as in run 63); judged by its shots. The 250 m/px labels crowd a battle (`critic/shots/c67c_39915_arm_0250m.png`). |
| Naval warfare (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>**landingFuzz: 0 of 90** on new seeds 39101–39129. `landingRows all`: 0 broken. `repulse` 39071/39073: 0 broken.</li><li>**The named landing cases:** 11 of 12 identical to run 66, with R64-N2's 36105 and its one `slowClick`. Malta's 18 and the bulk sets are as run 66's (Stability).</li><li>**Sea battles:**<ul><li>39061: 52 battles; 39063r: 66.</li><li>32061: 79 (run 66: 79); 32063r: 89 (run 66: 57) (`critic/c67_sb_*.log`).</li><li>All seen at their cameras on 39061 and 31501.</li></ul></li><li>**Landing page probes on new seeds:** Rome → Valletta thrown back and landed home at Catania; Hamburg → Norwich over, its transports sunk; Shanghai at phone size, "1 of 3 ashore; at sea: lands in about a day" then "over: 3 landed"; Tokyo → Shanghai cancelled and turned back (`critic/c67_lhold.*.log`, `critic/c67_lland.*.log`, `critic/c67_lbar.*.log`, `critic/c67_turnback.*.log`).</li><li>On the 1975 replay: "Cuba and South Africa fought at sea" (`critic/c67_te_1975.json`).</li></ul> **Not 9:** R67-N3, Japan's fleets lost out of battle in European waters. |
| Tanks (needs 8) | 8 | 8 | **Scored afresh** (carried in run 66). <ul><li>**`c_battle` 39915:** Armoured division 40 and 42 with motorised divisions 44 and 45 at the Polish line on day 5. Tank figures, fire and labels are readable from 250 to 15 m/px (`critic/shots/c67c_39915_arm_*`).</li><li>Breakthrough 39979 engages 34 formations in 7 days (`critic/c67_k_39979.json`); `kw_breakthrough` 39923 runs to its end (`critic/c67_kw_breakthrough.39923.log`).</li><li>The armour at Stalingrad and Normandy reads at its tier (above).</li></ul> |
| Aircraft (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>**`pl_planes` 39925:** sorties found at hour 2, 37 of them (`critic/c67_pl_planes.39925_GER_POL_5367.log`).</li><li>**`w_wing`:** on run 66's case 35127 the followed fighter is marked in 56 of 61 samples at 3,000 m/px (median 32 px) and in 35 of 59 at 250 m/px (median 68 px), as run 66 (`critic/c67_w_wing.35127.log`). On new seed 39927: 55 of 61 at 3,000 m/px (median 31 px); at 250 m/px 25 of 58, median 392 px (`critic/c67_w_wing.39927.log`).</li><li>**The 1969 air hold:** CCP and SOV are at war 193 days with no air fight; the United States' raids on Vietnam go on (2,228 in December) (`critic/c67_air69.log`).</li><li>The monthly air rows on the replay are told: "Germany and United Kingdom fought in the air this month" (`critic/c67_st_normandyD.json`).</li></ul> **Not 9 (old):** at 250 m/px the followed fighter's mark is far from its sorties (median 392 px, max 1,259 on 39927). |
| AI nuclear use (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>**Detonations over 22 years of plain 1938:**<ul><li>New seeds 39501, 39503 and 39507: 8, 6 and 3, with 0, 3 and 0 interceptions.</li><li>Run 66's 37501/3/7: 5, 3 and 4 (run 66: 6, 19 and 8; another world, ADR-1017's pin) (`critic/c67_nc/*.log`).</li></ul></li><li>**Page strikes in worlds made this run:**<ul><li>7019 at year 20 pauses on "Soviet Union struck China with a hydrogen bomb … 28,000 civilians killed" on 7 March 1958, with "Go to" (`critic/c67_an_7019y20.json`).</li><li>39505 at year 13: "United States struck Japan with an atomic bomb near Trabzon" on 30 May 1951 (`critic/c67_an_39505y13.json`).</li><li>Free 1954 (after 6161): "Soviet Union struck Iran with an atomic bomb near Tehran" on 2 May (run 66: India, 9 May).</li></ul></li><li>**R76g:** no detonation in the free 1975 year after 6161 (headless, `critic/c67_nukes75_6161.log`; and 400 days on the page, `critic/c67_an_y1975.json`). Run 66's four lost Chinese warheads are not met in this world.</li></ul> **Not 9:** the place named for a burst can be a city across a strait (Nevelsk for Hokkaido); the burst is a smudge at 937 m/px (old). |

## Blocking issues

None.

- `landingInvariants`: 0 of 90 runs on new seeds broken. Every other checker reports no rule broken (above).
- 0 page errors outside the deliberate 404s.

## Non-blocking issues (prioritised)

1. **R67-N1 (emergent, map visuals; new, R77): the replay's D-Day is fought and lost.** France is then freed by
   handover with no Allied army in it.
   - **On the replay's own seed** (1938, the only world a player sees), `npx tsx critic/scripts/c67_dday.ts 1938`, the
     Normandy box weekly (`critic/c67_dday_1938.log`):
     - **6 June:** USA 37.3k, ENG 24.9k, CAN 12.4k against GER 82.7k.
     - **20 June:** 14.6k, 9.9k and 4.7k against 61.8k.
     - **4 July:** 8.1k, 4.2k and 1.9k.
     - **18 July:** USA 6.1k alone. The British and Canadian divisions are gone.
     - **26 July:** USA 5.2k against GER 6.8k.
   - **The day after Paris** (`critic/c67_census_1938.log`, 26 August): the France box holds USA 5,213, FRA 90 and
     GER 6,409. "Paris liberated" (25 August) and "France freed" (15 September) are handovers to that.
   - **On the page,** at 600 m/px, the stacks thin from 31k/19.7k on 25 June to 204 men and 6.2k on 17 July. On 25 July
     a single 5.2k US stack stands at Omaha (`critic/shots/c67st_normandyD_d20.png`, `critic/shots/c67st_normandyD_d42.png`, `critic/shots/c67st_normandyD_d50.png`).
   - **The same case on run 66's commit** (`critic/c67_dday_1938_a0880be6.log`): 74.4k Allied men idle and whole to 1
     August. Not fought, not lost.
   - **`trackFronts` does not see the loss:** the attacker reads "of 0k lost 0k" because its cohort is fixed at the
     window's opening, before the landing. On 1938: "attacker 2 f 5k … both engaged 144 of 200" (`critic/c67_tf_1938.log`).
   - **Not blocking:** R76d's AT, rescoped by the user (ADR-1018), and R77's AT are met (both engaged 72, 40, 39 and
     43 % of samples on 1938, 37701, 38701 and 39701). ADR-1021 states the wear. No checker is broken.
   - **What a viewer sees:** the Normandy landing destroyed in seven weeks, then France freed by a stroke of the
     timeline. That is the opposite of "the armies steered to their history" (the card's own words).
   - **Fix:** the build-up the ADR names. The Allied follow-up divisions arrive over June and July: the Second Army's
     and First Army's corps, Patton's Third Army by 1 August. Then Cobra's 25 July stage is taken by them, and the
     August stages (Paris, France) have Allied armies to hand to.
   - **Fix (tool):** `trackFronts` should count an attacker who arrives inside the window, the landed cohort.
   - **Seen fixed when:**
     - `c67_dday.ts 1938`: the Allied men in the Normandy box on 24 July are at least the 74.6k landed and over the
       Germans'.
     - `c67_census.ts 1938`: on 26 August the France box holds Allied armies of at least 100k.
     - `trackFronts` 1938, 37701, 38701: D-Day still both engaged in ≥ 1/3 of its samples.
2. **R67-N2 (diplomacy, emergent; old, on both commits): Japan, and once the United States, declare war across the
   world on European minors.**
   - `npx tsx critic/scripts/c67_firstdecl.ts 60 39821 … 39839`: in plain 1938's first 60 days on 10 new seeds,
     Japan declares on a European nation on 9 of 10 (none on 39839):
     - the Spanish Republic on day 2 on four seeds (12,739 km);
     - Lithuania, Latvia, Estonia, Finland, Romania, the Netherlands and Nationalist Spain.
   - The United States declares on Lithuania on day 16 (39821). That one is new: run 66's commit has no such declaration on
     39821. It is the one same-seed difference R76c makes in these 60 days.
   - 17 of 98 declarations are between capitals over 6,000 km apart (`critic/c67_firstdecl.log`).
   - **Run 66's commit, same seeds:** 15 of 97, Japan on 9 of 10 (`critic/c67_firstdecl_a0880be6.log`). Japan's
     far wars are not R76c's doing. The finding moves no score.
   - Its cause: ADR-670 lets a power with no land target over the bar pick the best sea target. To a great power every
     coast is a sea target, and the weakest, Lithuania or the Republic, scores best.
   - **Fix:** weigh a sea target by distance (or by a claim, a neighbour's war, an ally's enemy). Or keep the reach of
     a power to its own ocean's coasts unless it is already at war there.
   - **Seen fixed when:** `c67_firstdecl.ts 60` on 39821–39839 has no Japanese declaration on a European state, and
     ≤ 5 of its declarations over 6,000 km.
3. **R67-N3 (naval): Japan's fleets are lost out of battle, in European waters first.**
   - `seaBattles` (3 years) tallies ships sunk outside a battle:
     - 39061: Japan 194 (England 4, USA 16).
     - 32061: Japan 179 (run 66 on the same seed: 72, in another world: the pin moved).
     - 39063r: Japan 53.
   - **On 39061** (`critic/c67_sb_39061.json`):
     - Japan's fleets fight the Soviets in the Baltic and the Kattegat from day 177.
     - Then they lose 56 ships in the Channel on days 307–460, and 12 off southern France, with no battle.
     - Then 58 off Japan on days 496–538 and 36 in the Bo Hai over days 501–1057.
   - The same pattern as run 66's 32063r note. The cause (strikes, shore fire or air) is not in this run's data:
     unverified.
   - **Fix:** a fleet that loses ships month after month with no battle comes home or is laid up, and the navy's far
     stations weigh what sinks them.
   - **Seen fixed when:** `seaBattles 39061 scenario --years 3` and `32061` have under 60 Japanese ships sunk out of
     battle, and none in the Channel.
4. **R67-N4 (diplomacy; old): People's China's army collapses after the track.** From about 650k at the end to 18k–90k
   within two years on all four afterTrack seeds:
   - 37601: 652k → 56k;
   - 37603: 705k → 84k;
   - 38601: 643k → 18k;
   - 1938: 679k → 90k by day 720 (`critic/c67_atx_*.log`).
   - It attacks India and is struck by the Soviet Union.
5. **Small:**
   - **Uranus on the new seed 39701** is not engaged at its hour: 0 and 0 engaged, though both are engaged in 9 of 28
     samples. Run 66 found the same on 38701 before R76d (`critic/c67_tf_39701.log`).
   - **"The German Sixth Army at Stalingrad" (24 October)** stands 60–120 km west of the city on 31 October. The city
     and the river bank are Soviet (327.6k) (`critic/shots/c67st_stalin_d9.png`; the stage a handover, ADR-1018, the
     user's decision).
   - **A burst's place:** the 1958 strike on Hokkaido is named for Nevelsk, across the strait.
   - **Flags at 250 m/px:** Germany's 1938 flag is told from Poland's only by a 2-px band.
   - **The Land ranking counts owners:** Germany at its height is not in the 1942 top 15. It has no unit (old).
   - **Probe faults, not the game's:** `h_zoom`'s m/px reading; `x_play`'s nation count (null); `freeburst`'s peace
     count (0 in every run).
   - **Old, carried:** R61-SC's three `slowClick` breaks and R64-N2's 36105; Malta never taken (18 of 18 as run 66);
     the followed fighter's mark at 250 m/px; "0 civilians killed" beside losses (not met this run).

## Run 66's cases re-run

| Run 66 case | Run 66 (`a0880be6`) | Run 67 (`6e0e46f3`) | Evidence |
|---|---|---|---|
| R66-N1 `freeburst` 0 / 1938 / 1939 / 1941 × 5151, 6161 | 1938-left 19/19 against plain 32/28 | **fixed**: 31/28 against 31/28, the same days; 1939: 36/28; 1941: 20/17 | `critic/c67_fb_*.log` |
| R66-N1 1975 bar (≤ 1.2 × per nation, first 30 days) | — | 0.47 and 1.11 | `critic/c67_fb_1975_*.log` |
| R66-N2 `x_replaycard 1975 free` | 1938's description, the fixed-seed note | **fixed** at 1600 × 900 and 390 × 844 | `critic/shots/c67rc_1975_free_*_card.png` |
| R66-N3 `c66_greats.ts 7019 3` | USA out of year 1, JAP of years 1–3 | `greatPowers` unchanged; the reach now keys on `seaPowers`: USA in at every year, lands past 4,000 km in years 1–3 on 7019 and 39811, 1–2 on 39813; Japan still out on 7019 in years 1–4 | `critic/c67_greats_7019.log`, `critic/c67_seapowers_7019.log`, `critic/c67_farlands_*.log` |
| R66-N4 `trackFronts` 1938 / 37701 / 38701 | D-Day 0/28 ×3; Uranus 38701 0/28; Stalingrad stage no German | D-Day 144, 80, 78 of 200; Uranus 22, 13, 9 of 28 (at the hour 5/8, 24/9, 10/8); Sixth Army 14 f 161k near at the stage's hour; **R67-N1** | `critic/c67_tf_*.log` |
| R66-N5 `x_badyear2` (10 cases) | slider 1938, "Play free" | **fixed**: the year and mode refused, the notice in view | `critic/c67_by2.json` |
| R66-N6 card's powers | Spain 1941–49 | unchanged (ADR-1019, the user's decision) | `critic/c67_starts/years.json` |
| Small: CCP's four warheads, free 1975 after 6161 | 4 launched, 4 intercepted | none launched in 365 days (another world) | `critic/c67_nukes75_6161.log` |
| `x_badyear`, `x_badyearsave` | notice, Continue 1 | same, but the URL now carries the mode | `critic/c67_by.json`, `critic/c67_bys.json` |
| `c66_endhours` 999/5151/6161/31337 | no join of 8/9 | same: joins to ids 10–13 only | `critic/c67_endhours_*.log` |
| traits 1975, landof 1975, places 1975 | JAP 10, ITA 15; 0 cells; Bonn, Madrid | identical | `critic/c67_traits.log`, `critic/c67_landof_1975.log`, `critic/c67_pl_1975.json` |
| afterTrack 37601/37603/38601/1938 | blocs whole; year 1 64/70 | blocs whole 10 years; year 1 69/63/63/61 | `critic/c67_atx_*.log` |
| track checker 1938, 37301/3, 38301/3 | 0 broken | 0 broken; 61–69 declared the year after | `critic/c67_track_*.log` |
| `c66_air69.ts` | no air fight in the hold | same | `critic/c67_air69.log` |
| nukecount 37501/3/7 | 6, 19, 8 | 5, 3, 4 (another world) | `critic/c67_nc/*.log` |
| AI strike free 1954 (6161) | SOV on India, 9 May | SOV on Iran near Tehran, 2 May; page and headless agree | `critic/c67_an_y1954.json`, `critic/c67_nukes54_6161.log` |
| Named landing ×12, nvtraces ×2, diploInvariants ×6, worldInvariants ×5 | as run 65 | text-identical but 203997 (one click fewer, same break) | `critic/scripts/c67_cmpnamed.sh` |
| seaBattles 32061, 32063r | 79, 57 | 79, 89; Japan's ships out of battle on 32061 72 → 179 (R67-N3) | `critic/c67_sb_*.log` |
| workerDeterminism 32059 | `6c0b4082` | `cf5a4a7f` every arm | `critic/c67_wd_32059.log` |
| 7019 / 32019, 20 years | `970a8195`, `a6398fdb` | `f88d8b46`, `80727b2c` (year 1 as run 65) | `critic/c67_seed*_save.log` |
| Run 66's page suites | — | identical where the world is (q_36119, kwh, keys, continue, closeblock, war list, ticker, the phone line, Uranus, Vietnam, places) | `critic/scripts/c67_cmpjson.mjs` |
| `x_slider` | moves together | the same; previews by year | `critic/c67_slider.json` |
| Malta's 18 (due) | 18 not taken | identical | `critic/c67_malta.log` |
| Run 61's bulk sets (due) | 366/396, 153/153, 162/168 | 366/396 (one break, 30041 g1), 153/153, 162/168 | `critic/c67_*_cmp.txt` |
| Perf chain | tick 2.10, replay 1.70, 120 m/px 53.6–56.3 | 2.33, 1.61, 52.5–55.8; figures 59.9 fps | `critic/c67_pf.status` |
| Left out in run 66 (zoom, sea and landing page probes, seaBattlesLook, 12-year watches, God tab at phone, `h_blank 120`, `x_building`, the free 1975 watch) | — | all run (above) | `critic/c67_suiteB.log` |

## Design objections (none blocking, no score lowered)

- **The free world after the track turns to far conquest within months.** In the free 1975 game after 6161:
  - by July 1975, "United Kingdom captured Jordan's capital" and "Lebanon captured Israel's capital";
  - in 1976, People's China takes New Delhi and destroys Burma, Greece takes Damascus, and Poland takes Algiers
    (`critic/c67_lw_1975free_6161.json`).
  - It is lively. It does not read as the Cold War the card promises "played on from there on its own course". The
    focus (ADR-1009, ADR-1015) eases declarations, not conquests.
- **Stalingrad's own stage is a handover** (ADR-1018, the user's decision). The Sixth Army is placed in the steppe, and
  the city's fight is Uranus's.
- **Spain on the card of 1941–49** (ADR-1019, the user's decision).
- **Canada, Australia and South Africa are Britain's puppets in 1975** (ADR-17), as run 66 noted.

## Ideas from other games (not scored)

- Hearts of Iron IV's historical D-Day comes with a stream of reinforcements and a supply port (Mulberry). A beachhead
  is held because more lands behind it, which R67-N1 lacks.
- Europa Universalis weighs a war's target by the distance to it ("overextension", the coalition's reach). A Lithuania
  12,000 km off is never the best target (R67-N2).

## Strengths (verified)

- **The rules hold on every checker, new seeds and named ones alike.** 15 diploInvariants runs, 11 worldInvariants
  runs, 7 track checkers to 1975, 90 `landingFuzz` runs, `landingRows` over 20,321 hours: 0 broken.
- **Determinism to the bit, across machines and commits.**
  - 38 of 38 yearly starts equal the deployed Linux build's.
  - Malta's 18, 153 stuck returns and 366 landing setups are identical to the last run's.
  - The 1954 strike falls on the same day and point on the page and headless.
  - Seed 7019's first year returns to run 65's hash exactly as ADR-1017 claims.
