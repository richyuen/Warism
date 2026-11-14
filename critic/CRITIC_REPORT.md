# Critic report, run 68 (focused): Batch 25 (R81a–h) and R78a–e, on `bfda9503`

- **Mode: focused.** The spawning message ("Critic run.") does not ask for a full run (CRITIC_PROMPT, ADR-915).
- **Commit judged:** `bfda95033836b9afc30bfbd1d5197f3885eabd1d`, HEAD at the start (`critic/c68_commit.txt`).
  - During the run the builder pushed `398de7ae` and `5649637d` (DECISIONS, PROMPT, ROADMAP and
    `.claude/agents/critic.md` only; `git diff --stat bfda9503 5649637d` touches no source).
  - The tree had three untracked evidence PNGs under `docs/evidence/7.132/` (not the critic's).
- **The last report:** run 67, full, on `6e0e46f3`. It had no blocking issue and every dimension at 8.
- **What changed since:** 19 commits, 37 files under `src/`, `data/` and `tools/`.
  - R78a: the Normandy build-up (`timeline.json`).
  - R78b: a war across the sea costs its distance (`strategic.ts`).
  - R78c and R78d: answered, no code.
  - R78e: a strike's city on the struck land, and the Ranking's land held (`landArea.ts`, `server.ts`, `ranking.ts`).
  - R79a and R79b: the gate on the GPU, the flag chip.
  - R81a: a bloc is a defensive pact (`war.ts`, `strategic.ts`).
  - R81b: a one-step Undo of a God act (`server.ts`, `GodToolbar.tsx`, `App.tsx`).
  - R81c: a burst's mark at world zoom (`nuke.ts`).
  - R81d: the label flag's light frame (`markers.ts`, `tags.ts`).
  - R81e: the relations graph names every nation at war or allied (`RelationsPanel.tsx`, `relationLabels.ts`).
  - R81f, R81h: answered (ADR-1037; BLOCKERS).
  - R81g: the followed wing's mark on its planes (`sorties.ts`, `markers.ts`, `protocol.ts`).
- **Scored afresh:** every dimension but `tanks`, because the diff reaches each of them:
  - the sim: `src/sim/ai/`, `src/sim/systems/war.ts`, `landArea.ts` and the timeline;
  - the worker, the renderer, the HUD, the God bar and the relations panel.
  - `tanks` is carried, with its named cases re-run (`c_battle`, breakthrough).
- **Due because the sim changed** (`git diff --stat 6e0e46f3 HEAD -- src/sim data public/data` is not empty):
  - run 61's bulk sets and Malta's 18 are re-run;
  - plain 1938 is not carried (the diff touches `src/sim/ai/` and `src/sim/systems/`).
- **Setup:**
  - Build: `vite build --outDir critic/c68_dist`, exit 0 (`critic/c68_build.log`).
  - Starts: `npm run saves -- critic/c68_starts`, 38 years, copied into the build (`critic/scripts/c68_build.sh`).
  - Served by `vite preview` on 127.0.0.1:5368.
  - Browser: Playwright Chromium on the GPU, at 1600 × 900 and 390 × 844.
  - Probes: `critic/scripts/c68_*`. Run 67's probes were copied as `c68_*`; the comparers point at `c67_*`.
  - New probes:
    - `c68_undo.mjs`, `c68_undo2.mjs` and `c68_undoLate.mjs` (R81b);
    - `c68_loadruins.mjs` (a load after a burst);
    - `c68_burst.mjs` and `c68_aimark.mjs` (R81c);
    - `c68_farConquests.ts` (R81a's tool reading the critic's own starts);
    - `c68_pixdiff.py`, `c68_nextline.mjs` and `c68_loadruins_old.mjs` (the load case on run 67's build).
  - Run 67's commit `6e0e46f3` was built in `critic/wt` (`critic/c68_dist_6e0e`), served on 5369, and run for one case:
    R68-B1's load path. The `node_modules` junction was unlinked before `git worktree remove`.
  - Chains:
    - `c68_runNamed.sh` (107 headless jobs, 6 at a time);
    - `c68_fuzzNow.sh` (landingFuzz from 41101);
    - `c68_chainBulk.sh`, `c68_chainS.sh`, `c68_pagesA.sh` and `c68_pagesC.sh`;
    - `c68_chainP2.sh` (performance, alone and last) and `c68_chainP3.sh`.
- **Incidents, disclosed:**
  - The first `chainS` run of `c68_farConquests.ts` failed on an import path. It was fixed and re-run; those are the
    figures used.
  - The four `afterTrack` runs failed again for the missing cache directory, as in run 67. They were re-run by
    `c68_atRerun.sh`.
  - **The perf chain started twice:** the first `c68_chainP2.sh`, which I had stopped with TaskStop, left its `sh` alive.
    Both copies ran the tick and page measures at once for about 5 minutes. I stopped both and ran the chain's body
    once, alone (`critic/scripts/c68_chainP_body.sh`, 07:34–07:47). Only that run's figures are used; the overlapping
    run's status is kept as `critic/c68_pf_dup.status`.
  - To start `landingFuzz` sooner I stopped the queue runner's shell and left its `xargs` running. The fuzz then ran
    beside the queue (`c68_fuzzNow.sh`). The figures are unaffected; only the order changed.
  - **A probe fault of my own, caught:** `c68_an_ainuke`'s "Go to" shot calls `settle`. `settle` waits while anything
    animates, and that includes the burst's 20 s mark. Its shot therefore comes after the mark is gone.
    - My first reading ("an AI burst is not drawn after Go to") was this fault. `c68_aimark.mjs` without `settle`
      disproves it (Aircraft and AI nukes, below).
    - Run 67's "smudge at 937 m/px" came through the same probe.
- **Left out for time:**
  - Run 67's page suites `suite` and `suite2` were left out (closeblock at five sizes, keys, continue, `h_interv`,
    `whotold`, `manywars`, `h_next`, `h_pauseblank`, `h_god`, `h_seed`), and so were chain E's `x_editor 32441` and
    `h_watch`.
  - Suite B was run only in part. Left out: the landing page probes (`nvpage`, `lhold`, `lland`, `lbar`, `lbox`,
    `turnback`), `new mine/filter/corridor/build`, `os2_scen`, `sb_seaballs`, `kw_breakthrough`, `seaclick`,
    `fw2_forcewar`, `rw_random`, `histgrep`, `warsof`, `x_mouse`, `x_title`, `x_few`, `x_play`, `hero`, `joinseen`,
    the second `long_watch2` and `x_lateworld`.
  - Also left out from run 67's `c67_pages.sh`: `x_badyear` and `x_badyearsave`; `x_replaycard` 1960, 1965 and 1946;
    `x_trackend 1975`; `x_stage normandy` and `uranus2`; `x_places 1975`; `h_phone` at 390 × 844 and 844 × 390;
    `x_vietnam 1968`; `h_god70`; and the page strikes of free 1954 and 1975 (`an_ainuke year:…`). The 1975 strikes were
    read headless instead (`c68_nukes75.ts`).
  - Also left out: `seaBattlesLook` on 31501, `an_ainuke` on 32019 and 39505, and `x_building`.
  - These are UI, landing-page and replay-page cases. The batch did touch shared UI code (`hud.ts`, `App.tsx`,
    `style.css`), so they are not proven unchanged. What covers that code here: `u_ui` and `p_phone` (SAME as run 67),
    `h_blank`, the God tab at phone size, `x_badyear2`, `x_slider` and the free card at phone size. The landing page
    probes are covered headless by `landingFuzz`, the named landing cases, the bulk sets and Malta's 18.
- **Writes outside `critic/` by tools at their defaults:**
  - `landingFuzz` to `.cache/landingFuzz/bfda9503-41101/`;
  - `npm run sim` to `.cache/runs/*.json`;
  - `trackFronts` to `.cache/trackFronts_*.json`.

## Verdict

**One blocking issue: R68-B1, Undo (and any load) leaves the undone burst's ruins and fallout drawn on the map.** Every
dimension is at or over its bar. God Mode moves from 8 to 7 for R68-B1.

- **The rule checkers on new seeds:**
  - `landingInvariants` via `landingFuzz --seeds 15 --first 41101`: **1 of 90 runs broken**, `slowClick` (41101 15101
    g2), under the 5 % bar, so non-blocking (`critic/c68_landingFuzz.log`).
  - diploInvariants, 0 broken:
    - 41001 (1938), 41003 (random), 41005 (heroes) and 41007 (random world), 5 years each;
    - run 67's 39001/3/5/7 and its 10-year runs 39009 and 39011;
    - the named 33501/3/5, 37001/3/5 and 38001/3/5.
  - worldInvariants, every rule set, 0 broken:
    - 41051, 41053 (heroes) and 41055 (random world);
    - run 67's 39051/3/5;
    - the named 36009/11, 37007/9/11 and 38007/9/11 (`critic/c68_wi_*.log`).
  - `landingRows all`: 115 cases, 20,321 hours, 0 broken (`critic/c68_lrows_all.log`).
  - `repulse` on 39071 and 39073: 0 broken.
  - The track checker to 31 December 1975: 0 broken lines on 1938, 37301, 37303, 38301 and 38303, and on run 67's 39301
    and 39303 and the new 41301 (`critic/c68_track_*.log`).
- **The batch did what it claimed, on the critic's own cases:**
  - R67-N1 (D-Day lost) is fixed.
  - R67-N2 (far declarations) is fixed.
  - R81a's bar is met on new seeds (×1.17 against 1.2).
  - R81c, R81d, R81e and R81g are seen working.
  - R78e: Germany is in the 1942 Land ranking (11th).
- **New blocking issue:** R68-B1 (below).
- **New, non-blocking:**
  - R68-N1: "Carrier strike ashore: United States on United States".
  - R68-N2: European powers at war with Brazil in 1938.
  - R68-N3: the Next line names D-Day for 25 July.
  - R68-N4: the Normandy fight takes no ground and costs the Allies about four to eight times the Germans' losses.
  - R68-N5: pile-ons at day 365; Germany against the Netherlands and up to 13 nations.

## Scores

| Dimension | Run 67 | Run 68 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | **Scored afresh.** <ul><li>**R81d, the flags:** at 250 m/px on 39915 day 5, Germany's label flag is framed light; its black third reads against the dark tag, and Poland's white-red is told from it at a glance (`critic/shots/c68c_39915_arm_0250m_crop.png`, enlarged). The same on the new seed 41915 (`critic/shots/c68c_41915_inf_0250m.png`).</li><li>**R81c, the burst at world zoom:** God's H-bomb on Paris at Speed ×1, watched by wall clock (`c68_burst.mjs 41205`).<ul><li>At 937 m/px: the cloud at 1 s; an amber ring and dot at 10 s; the fallout shade alone at 20 s.</li><li>At 3,000 m/px: the cloud and blast ring at 1 s, and the yellow ring and dot at 10 s (`critic/shots/c68b_41205_paris_937m_strip.png`, `critic/shots/c68b_41205_paris_3000m_strip.png`).</li></ul></li><li>**R78e, the Land ranking by holder:** Germany 11th at 3.48M km² on 21 November 1942 (`critic/shots/c68st_uranus_d1.png`), and 13th on 17 July 1944 (`critic/shots/c68st_normandyD_d42.png`).</li></ul> **Not 9:** <ul><li>R68-B1's scar on the map after Undo or a load.</li><li>During D-Day's 50 days the Allied stacks stand on land drawn as German-held (hatched), and the beachhead takes no cell until the 25 July handover (R68-N4).</li></ul> |
| Diplomacy, war, alliance, puppet, revolt depth | 8 | 8 | **Scored afresh.** <ul><li>**Every checker passes** (above).</li><li>**R67-N2 fixed (R78b):** `c68_firstdecl.ts 60` on run 67's 39821–39839 has 96 declarations; **2 are over 6,000 km** (run 67: 17 of 98), and none is Japanese on a European state (run 67: 9 of 10 seeds). The two: FRA>BRA, 9,702 km, on 39833, and GER>NED, 9,018 km, on 39839 (`critic/c68_firstdecl.log`). The bar asked ≤ 5.</li><li>**R81a, a bloc a defensive pact,** on 6161 and the new seeds 41161–41167 (`c68_farConquests.ts`, two years):<ul><li>A free 1975 start takes 10.5 far capitals per 100 nations; plain 1938 on the same seeds takes 9.0. That is ×1.17, under the 1.2 bar (`critic/c68_farc_1975.log`, `critic/c68_farc_0.log`).</li><li>First-month declarations from 1975: 10, 9, 6, 9 and 3 of 154 nations.</li></ul></li><li>**The blocs after the track:** SOV 8/8 on all four afterTrack seeds, USA 14/14 on 37603, 38601 and 1938, and 0 days with the leaders on opposite sides (`critic/c68_atx_*.log`).</li><li>**R66-N1 stays fixed:** the replay left in 1938 declares exactly as plain 1938 on 5151 and 6161 (31/31 and 29/29, the same months) (`critic/c68_fb_*.log`).</li></ul> **Not 9:** <ul><li>R68-N2, European powers at war with Brazil.</li><li>NATO is down to 13/14 from year 4 on 37601 (`critic/c68_atx_37601.log`).</li><li>People's China still falls from about 670k to 13k–103k by day 1,800 on the four seeds (ADR-1027 answered it; old).</li></ul> |
| Emergent world dynamics | 8 | 8 | **Scored afresh.** <ul><li>**R67-N1 fixed (R78a): D-Day holds.** On the replay's seed, `c68_dday.ts 1938`, the Normandy box weekly (`critic/c68_dday_1938.log`):<ul><li>6 June: USA 37.3k, ENG 24.9k and CAN 12.4k against GER 82.7k.</li><li>4 July: 68.4k, 37.6k and 17.2k against 23.3k.</li><li>24 July: 50.0k, 35.5k and 11.5k against 16.7k.</li><li>Run 67's bar was at least 74.6k and over the Germans'. 97.0k is met.</li><li>On the page at 600 m/px on 25 July, six Allied stacks of 76k stand at Omaha to Sword (`critic/shots/c68st_normandyD_d50.png`).</li></ul></li><li>**A 12-year watch at Max on the new seed 41941:** wars every year and capitals taken (Turkey takes Damascus; the Soviet Union takes Cairo and Riyadh). 59.8–60 fps, 0 frames over 500 ms (`critic/c68_lwplain_41941.json`).</li><li>The area tops change 8 times in 25 years on 39097 (`critic/c68_toparea_39097.log`).</li><li>**Piles at day 365:** 2 wars over 4:1 in 10 seeds. On run 67's 39139–39147, ITA vs POR 1:5 on 39139 (run 67: none on these five). On the new 41139–41147, GER vs NED 2:13 on 41143 (`critic/c68_piles_p39.log`, `critic/c68_piles_p.log`).</li></ul> **Not 9:** <ul><li>R68-N4, the Normandy fight: the Allies lose 137–140k of 235k landed against the Germans' 26–39k, and take 0 of 51 cells in the window, on five seeds (`critic/c68_tf_*.log`).</li><li>R68-N5, the piles: Germany against the Netherlands with 9–13 nations on the Dutch side at day 365 on 4 of 5 new seeds (`critic/c68_piles_p.log`).</li><li>The free world after 1975 (design objection, below).</li></ul> |
| God Mode | 8 | **7** | **Scored afresh. Down one, for R68-B1.** <ul><li>**R81b's Undo works on the world** (`c68_undo.mjs 41201` and `41209`, `c68_undo2.mjs 41211`):<ul><li>An H-bomb on Berlin, then 30 or 90 days of play, then Undo: the hash is the one before the act (3597411667 and 3697481932), the date is 11 January 1938, and the history list is back to 147 and 132 lines with no strike row.</li><li>The bar says "Undone: the world as it was on 11 January 1938" and the button goes. Undo took 366–382 ms.</li><li>On the replay, a revolt ends the track; Undo 10 days later brings back "Next, 12 March 1938: The Anschluss" and the day-20 hash.</li><li>Undone 2 s after the act, the picture is pixel-identical to the one before for revolt, nation and raze; city differs by 31 px (`c68_pixdiff.py`).</li></ul></li><li>**But the map keeps the undone burst (R68-B1).**</li><li>Run 67's God cases are unchanged: `q_god_tools 39919` and `k_breakthrough 39979` are SAME (`critic/scripts/c68_cmpjson.mjs`).</li><li>H-bomb on Paris and A-bomb on London (39917) still give their alerts, rows and charts (`critic/shots/c68a_39917_*`).</li></ul> **What the bar needs back at 8:** R68-B1 fixed, seen by `c68_undo2.mjs 41211`: nuke undone, 0 px differing from before. Also `c68_loadruins.mjs 41203`: shot 02 equal to the fresh page's shot 04. |
| Editor and scenarios | 8 | 8 | **Scored afresh** (the worker's load path changed). <ul><li>`x_editor 32443`: painted, undone, redone, exported (591,613 bytes, as runs 61–67), loaded `[1,1,1]`. SAME as run 67 (`critic/c68_xe_32443.json`).</li><li>Save and load are bit-identical on 39937 (`same: true`, `same2: true`; `critic/c68_sl_plain_39937.json`).</li><li>`x_badyear2`, ten refused starts: the same as run 67 but for the port and the hashes of the year built (`critic/c68_by2.json`).</li><li>The slider and the free card at phone size: the same (`critic/c68_slider.json`, `critic/c68_rc_1975_free_390x844.json`).</li></ul> **Not 9:** R68-B1's case 3 is a save loaded into a game that had a burst. An editor scenario loaded the same way was not tried. |
| Stats and history | 8 | 8 | **Scored afresh.** <ul><li>**History on the year-20 save of 32019:** 3,134 events; the filters respond in 158–165 ms; the CSV and JSON export (`critic/c68_hi_32019.json`, `critic/c68_dl_32019.json`).</li><li>**R78e:** the Ranking's "Land held (km²)" puts Germany in 1942's top 15 (above).</li><li>The 38 yearly starts equal the deployed site's `years.json` (`critic/c68_starts/years.json` against `critic/c68_deployed_years.json`).</li><li>The Undo takes the history back to the act's day (God Mode).</li></ul> **Not 9:** <ul><li>R68-N1's row "United States on United States".</li><li>The chart's "Land (km²)" (by owner) beside the Ranking's "Land held (km²)" (by holder, R78e): two measures under near-identical names on one screen, and France's and the United States' chart lines in near-identical blues (`critic/shots/c68hi_32019_charts.png`).</li></ul> |
| UI/UX and polish | 8 | 8 | **Scored afresh.** <ul><li>**R81e, the relations graph:**<ul><li>On 39939, desk, a year on: every node named, none overlapping (`critic/shots/c68rg_39939_desk_d365.png`).</li><li>On Germany, the truces are their own dashed lines: Germany–Lithuania bent apart from the puppet bond, and Germany–Denmark (`critic/shots/c68rg_39939_desk_d365_focus.png`).</li><li>At phone size on 39931 and on the new 41939: named, though crowded at 390 px (`critic/shots/c68rg_41939_phone_d365.png`).</li></ul></li><li>The Undo button and the "Undone: …" status on the God bar (`critic/shots/c68u_41201_04_berlin_937_undone.png`).</li><li>**Run 67's UI cases:**<ul><li>`u_ui` and `p_phone`: SAME.</li><li>`h_blank 120`: 1,077 samples, 0 blank (`critic/c68_h_blank.120.log`).</li><li>The God tab at 390 × 844 opens with its notes (`critic/c68_hgt_390x844_god-world-ai.json`).</li></ul></li><li>0 page errors in every probe.</li></ul> **Not 9:** <ul><li>R68-N1.</li><li>R68-N3, "Next, 25 July 1944: D-Day: the Normandy beachhead" shown from 6 June to 25 July.</li></ul> |
| Performance | 8 | 8 | **Scored afresh, alone and last** (`critic/c68_pf.status`, 07:34–07:47; a duplicate start was stopped and the chain re-run once, below). <ul><li>**Tick, seed 99, 5 years, pinned:** mean 2.22 ms (run 67: 2.33); year 1 3.04 ms against the 6.5 ms budget. Year 1's hash is `95d9261f`, the pin of `tests/sweep/baselineHash.test.ts` (`critic/c68_tick99.log`).</li><li>**The replay's tick** (1938h, 5 years): mean 1.59 ms (run 67: 1.61) (`critic/c68_tick1938h.log`).</li><li>**R81h, 7019's year-20 world at Max** (`critic/c68_pf_7019.json`; `c68_pf_lookfps.mjs` now also counts the browser's frames, `raf`): <ul><li>3,000–600 m/px: 58.9–60.2 draws and frames.</li><li>120 m/px: the view's draws 52.5–56.8/s, the browser's frames 59.0–60.2/s.</li><li>120 m/px while panning: 60/60/60 frames and draws.</li><li>30 m/px: frames 60.0–60.2.</li><li>R81h's answer (the gap is draws skipped, not frames lost) is borne out. One hitch of 113–116 ms on the classic look at 1,200 and 120 m/px, as run 67 (104–115).</li></ul></li><li>`lookFps`: 58.8–60 frames/s forced at every zoom, a draw 0.86–2.26 ms (`critic/c68_lookfps.log`).</li><li>**The tactical goal:** 60 fps at 28 m/px with 14,212 individual figures, Speed ×1 (`critic/c68_xi.log`). Touch: 59.5–60.0 fps (`critic/c68_tm_touch.alone.log`).</li><li>**R81b's bars on the late world** (`c68_undoLate.mjs`, 7019 year 20, five A-bombs undone): Undo offered 28–44 ms after the click; the longest frame in the 2.5 s after 18–37 ms; Undo 239–279 ms (`critic/c68_undoLate.json`).</li><li>The 12-year watch: 0 frames over 500 ms (Emergent).</li></ul> **Not 9:** the classic look's single 113–116 ms hitch at 1,200 and 120 m/px (old). |
| Stability | 8 | 8 | **Scored afresh** (the sim changed). <ul><li>**The yearly starts equal the deployed site's** (Pages built from HEAD at 10:38Z): 38 of 38 years, hashes, counts and powers (`critic/c68_starts/years.json` against `critic/c68_deployed_years.json`).</li><li>**workerDeterminism:** 32059 `847d48a7`, 39059 `740d6d44` and the new 41059 `49a669de`, the same on every arm (`critic/c68_wd_*.log`).</li><li>**Save and load bit-identical** on 39937. **Undo bit-identical** to the world before the act after 2 s, 30 days and 90 days (God Mode).</li><li>**Malta's 18** are identical to run 67's, line for line (`critic/c68_malta.log`).</li><li>**Run 61's bulk sets** (due: the sim changed, so they are another world and identity is not expected): <ul><li>396 landing setups: 279 identical, 2 broken (both `slowClick`: 30041 g1, as before, and 27037 15101 g2, new) (`critic/c68_liab_named_cmp.txt`).</li><li>153 stuck returns: 152 identical, the longest still spell 0.0 days on every run (`critic/c68_sr_cmp.txt`).</li><li>168 next voyages: 128 identical, 3 broken (run 67: 2). The new one, 31175 3517 g1: "next voyage in about 7 days" sailed after 18.9 (`critic/c68_nv/31175_3517_g1.log`).</li></ul></li><li>0 page errors in every probe of this run.</li><li>The 20-year runs of 7019, 32019 and the new 41019 complete: `f8dadd4b`, `f7225aa1` and `48d7bfa4` (`critic/c68_seed*_save.log`).</li></ul> **Not 9:** R68-B1, a client layer that outlives the world it drew (Undo and load). |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>**`z_zoom` 39911, 6,000 to 3 m/px:** the figures from 28 m/px (13,837) down to 4,442 at 3 m/px. the same as run 67 but for three fields: step 1's m/px (3,840.4 against 3,840.5), step 5's elements (1,894 against 1,922) and step 15's figures (6,635 against 6,615) (`critic/c68_z_39911.json`).</li><li>**R81f, the labels at 250 m/px:**<ul><li>On 39915, 7781 and the new 41915: no tag over another, each engaged formation tagged, with leader lines to the fight (`critic/shots/c68c_39915_arm_0250m.png`, `critic/shots/c68c_41915_inf_0250m.png`).</li><li>The crowding is the count (ADR-1037, put to the user).</li></ul></li><li>The stages at their tiers: Normandy and Stalingrad from 3,000 to 40 m/px (`critic/shots/c68st_normandyD_*`, `critic/shots/c68st_uranus_*`).</li></ul> |
| Naval warfare (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>**landingFuzz:** 1 of 90 on new seeds 41101–41129, one `slowClick` (non-blocking).</li><li>`landingRows all`: 0 broken. `repulse` 39071/39073: 0 broken.</li><li>**The named landing cases:** the same breaks as run 67 (`slowClick` only), and 32115 15101 g2 is now clean (`critic/scripts/c68_cmpnamed.sh`). Malta's 18 are identical to run 67, line for line (`critic/c68_malta.log`).</li><li>**Sea battles:**<ul><li>39061: 47 battles, 47 of 47 seen at their cameras (`critic/c68_sbl_39061.log`).</li><li>32061: 63; 32063r: 67; 39063r: 54; the new 41061: 60 (`critic/c68_sb_*.log`).</li><li>Sinkings out of battle on 39061: 40, all by carriers' wings (R78c's reading, ADR-1026).</li></ul></li></ul> **Not 9:** <ul><li>The "sea battles" of 0 ships against 0 that sink 1–3 a week in the Gulf of Finland, on 32061 days 1068–1089 (`critic/c68_sb_32061.log`; old, as run 67's "USA:0 ITA:0 … lost 33").</li><li>R68-N1.</li></ul> |
| Tanks (needs 8) | 8 | 8 | **Carried**, with its named cases re-run: `c_battle 39915` and `7781` show the armoured and motorised divisions at the Polish line on day 5, as run 67 (`critic/shots/c68c_39915_arm_*`). `k_breakthrough 39979` is SAME (34 engaged in 7 days). |
| Aircraft (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>**R81g, `w_wing`** (`critic/c68_w_wing.*.log`), on 39927, 35127 and the new 41927:<ul><li>At 250 m/px the median distance from the followed wing's mark to its sorties is **0 px** (run 67: 392 on 39927; the AT ≤ 40).</li><li>At 3,000 m/px the median is 0 px (run 67: 31–32).</li></ul></li><li>`pl_planes 39925`: sorties found at hour 2, 37 of them (as run 67).</li></ul> **Not 9:** at 250 m/px only 26–36 of 58 samples have a German sortie in view to measure against. In those, the p90 distance to the nearest German sortie is 552–712 px. The probe does not tell the followed wing's planes from other German ones, so this is a lead, not a fault shown. |
| AI nuclear use (needs 8) | 8 | 8 | **Scored afresh.** <ul><li>**The AI's burst at world zoom (R81c):** on 7019's year-20 world, Germany's A-bomb "near Alxa Zuoqi" on 15 August 1958, on United States-held land. At Max, after "Go to", at 938 m/px: the cloud and ring at 2 s, and the amber ring and dot at about 8 s (`critic/shots/c68am_max2_strip.png`, `c68_aimark.mjs`; `nukeFx.shown` `[0,0,1,1]` then `[0,0,0,1]`).</li><li>**R78e:** both strikes are named for a place on the struck nation's held land: Alxa Zuoqi and Okhotsk, both United States-held in 1958 (`critic/shots/c68an_7019y20_1_goto.png`).</li><li>**Detonations over 22 years of plain 1938** (`critic/c68_nc/*.log`):<ul><li>Run 67's 37501/3/7: 13, 13 and 0. Run 67 had 5, 3 and 4, in another world (the pin moved).</li><li>39501/3/7: 0, 5 and 4 (run 67: 8, 6 and 3), with 0, 4 and 1 interceptions.</li><li>New 41501/3: 5 and 16, 0 interceptions.</li></ul></li><li>The free 1975 year after 6161: People's China launches 4 warheads on India on 8–11 November 1975, and all 4 are intercepted, 0 detonations. That is run 66's case met again (run 67: none in that world) (`critic/c68_nukes75_6161.log`).</li></ul> **Not 9:** <ul><li>47 launches on 37501/3 and 41501/3 and none intercepted. Run 67 had 6 of 13 intercepted on 37501/3/7.</li><li>The mark at 10 s sits over the struck stack's counter (`critic/shots/c68am_max2_strip.png`).</li></ul> |

## Blocking issues

### R68-B1 (God Mode, map visuals; new path R81b, cause old): Undo, and any load, leaves the undone burst's ruins and fallout on the map

- **Case 1: the 30-day Undo,** `node critic/scripts/c68_undo.mjs 41201 30` on the c68 build.
  - God's H-bomb on Berlin on 11 January 1938, then 30 days of play, then "Undo last act".
  - The world is the one before the act: hash 3597411667 both before the act and after Undo, the date 11 January, and
    the history list without the strike.
  - The map still draws Berlin's burned disc and its ruins:
    - at 937 m/px (`critic/shots/c68u_41201_04_berlin_937_undone.png` against
      `critic/shots/c68u_41201_00_berlin_937_before.png`);
    - at 150 m/px, the ruins and Berlin's name greyed (`critic/shots/c68u_41201_06_berlin_150_undone.png`);
    - and still 48 hours after the Undo (`critic/shots/c68u_41201_08_berlin_937_after_undo_48h.png`).
- **Case 2: Undo 2 s after the act,** paused, the camera fixed: `c68_undo2.mjs 41211` with `c68_pixdiff.py`.
  - Nuke on Warsaw: 7,028 px differ from before the act, inside the burst's box. The hash is equal.
  - Revolt, nation and raze differ by 0 px; city by 31 px.
  - The burned disc and the greyed units are visible (`critic/shots/c68u2_41211_nuke_pair.png`).
- **Case 3: the load path,** `c68_loadruins.mjs 41203`.
  - The day-10 save is loaded after an H-bomb on Berlin, then 24 h run.
  - The page shows the scar (`critic/shots/c68lr_41203_02_loaded_937.png`).
  - A fresh page loading the same save is clean (`critic/shots/c68lr_41203_04_fresh_937.png`).
  - The two worlds have the same hash (149009271).
- **Cause, read from code:** `src/worker/server.ts` around line 902/910.
  - The fallout and ruins are sent only when `world.fallout.size > 0 || falloutSent.cells > 0`, and likewise for
    `nukeBursts.length` / `ruinsSent.count`.
  - `loaded()` resets both "sent" counters to -1. A restored world with no burst therefore never sends the empty
    layers, and the client (`simClient.ts:82–89`) keeps the old ones.
  - The guard is the same at `6e0e46f3` (lines 809–819). **Seen on that commit too:** run 67's build in `critic/wt`,
    served on 5369, runs the same case (`c68_loadruins_old.mjs 41203`). Loaded against fresh, 2,519 px differ in the
    burst's box, exactly as on HEAD (`critic/shots/c68lr6e0e_41203_02_crop.png`; `c68_pixdiff.py` on both builds'
    shots 02 and 04). The load path's fault is old. R81b's Undo makes it one click after any God strike.
- **Why blocking:** it contradicts the feature as claimed: R81b, "the world as it was before the last act". The map, the
  player's only view of the world, shows a burned capital that the world never had. It stays until a later burst anywhere makes the worker send
  the layers again (48 h later it was still there). A
  rule checker cannot see it; the builder's spec checks only the hash.
- **Fix:** after `loaded()`, send the fallout and ruins once whatever their size (an empty layer clears). A spec should
  compare the picture, not the hash alone.
- **Seen fixed when:**
  - `c68_undo2.mjs 41211`: nuke before against undone, 0 px differing;
  - `c68_loadruins.mjs 41203`: shot 02 equals shot 04 over the map.

## Non-blocking issues (prioritised)

1. **R68-N4 (emergent, map; new with R78a): Normandy is held, not fought for.**
   - `trackFronts` on 1938, 37701, 38701, 39701 and the new 41701: the Allies lose 137–142k of 235k landed against the
     Germans' 17–39k of 82–86k, and take **0 of 51 cells** in the 50-day window on all five. The handover gives the beachhead on 25 July
     (`critic/c68_tf_*.log`).
   - From 24 July, 97k Allied men stand unengaged beside 16.7k Germans (`critic/c68_dday_1938.log`).
   - On the page, the stacks stand on hatched, German-held land for seven weeks (`critic/shots/c68st_normandyD_d42.png`).
   - **Fix:** the build-up should take ground, at least the Cotentin and Caen, inside the window.
   - **Seen fixed when:** `trackFronts 1938` shows D-Day's cells taken > 0, and the Allied loss under 2 × the German
     loss.
2. **R68-N1 (UI, stats; old rule): "Carrier strike ashore: United States on United States".**
   - On 32019's year-20 world, 27 December 1957 (`critic/shots/c68hi_32019_charts.png`, ticker).
   - Cause: `worker/carrierRaids.ts` names the holder of the cell struck when no enemy formation is near the mission's
     point. That holder can be the striker itself.
   - **Fix:** name the enemy the wings were sent against, or drop the row.
3. **R68-N2 (diplomacy; new seeds, not compared): European powers make war on Brazil in 1938.**
   - France takes Brazil's capital within two years of plain 1938 on 4 of 5 seeds (6161, 41161, 41163, 41167;
     `critic/c68_farc_0.log`).
   - It declares on day 58 on 39833 (`critic/c68_firstdecl.log`). On the new seeds 41821–41839, all 3 of the 60-day
     declarations over 6,000 km are on Brazil: FRA once and ENG twice (`critic/c68_firstdecl_41.log`).
   - FRA vs BRA 3:1 and ENG vs BRA 3:1 at day 365 on 39143 and 39145, and FRA vs BRA 3:1 on the new 41141 (`critic/c68_piles_p39.log`, `critic/c68_piles_p.log`).
   - R78b's distance cost does not stop it.
   - **Seen fixed when:** `c68_farConquests.ts 0 6161,41161,41163,41165,41167` has France take Brazil's capital on at
     most 1 seed.
4. **R68-N3 (UI; R77/R78a): the Next line reads "Next, 25 July 1944: D-Day: the Normandy beachhead" from 2 July to 25
   July** (`node critic/scripts/c68_nextline.mjs critic/c68_st_normandyD.json`; `critic/shots/c68st_normandyD_d42.png`).
   - D-Day was 6 June. 25 July is the window's end, its handover.
   - **Fix:** name the stage for what happens then ("the beachhead secured", "Cobra").
5. **R68-N5 (diplomacy, emergent): pile-ons at day 365.**
   - On the same seeds as run 67, 39139–39147, a war over 4:1 appears where run 67 had none: ITA vs POR 1:5 on 39139
     (`critic/c68_piles_p39.log`).
   - On the new 41139–41147, Germany fights the Netherlands with 9, 10, 12 and 13 nations on the Dutch side on 4 of 5
     seeds; 2:13 on 41143 (`critic/c68_piles_p.log`).
   - **Seen fixed when:** `c68_piles.ts 365 --plain` on both sets has no war over 4:1.
6. **Small:**
   - **The followed wing at 250 m/px:** median 0. In only 26–36 of 58 samples is a German sortie in view to measure
     against. In those, the p90 distance to the nearest German sortie is 552–712 px. Whether those sorties are the
     followed wing's is not shown (Aircraft).
   - **`slowClick` breaks (ADR-914; timing bounds, each non-blocking):**
     - `landingFuzz` 41101 15101 g2: t1467's click of 270 not ashore after 8.6 days, its best way 1.6.
     - Bulk 27037 15101 g2 (new against run 67): t2198's click of 277 not ashore after 8.2 days, its best way 1.2.
     - Next voyage 31175 3517 g1 (new): t1467's click of 367 not ashore after 18.1 days, its best way 11.1; the row had
       said "next voyage in about 7 days" and it sailed after 18.9 (`critic/c68_li_31175_g1.log`).
     - The named ones as run 67's: 203997, 204017, 30041 g1, 31099 g1, 32167 g1/g2 and 36105.
   - **The United States' far landings:** none in years 1–3 on 7019, 39811 and 39813 (`critic/c68_farlands_*.log`).
     Run 67 had 15/9/4, 10/3/10 and 11/8 past 4,000 km. This is R78b's distance cost; the United States now makes no far
     war before 1941. It is not a defect (it is nearer history), but R66-N3's figure no longer reads.
   - **NATO at 13/14 from year 4 on 37601.**
   - **Probe faults, not the game's:**
     - `an_ainuke`'s `settle` after "Go to" (above);
     - the replay page's seed (two loads of `?scenario=1938h&seed=1938` gave different day-20 hashes, 3218662530 and
       641862931), likely the game's second seed drawn per game. Not pursued.
   - **Old, carried:** People's China's collapse after the track (ADR-1027); the zero-ship sea battles; Malta never taken
     (18 of 18 as run 67).

## Run 67's cases re-run

| Run 67 case | Run 67 (`6e0e46f3`) | Run 68 (`bfda9503`) | Evidence |
|---|---|---|---|
| R67-N1 `c67_dday.ts 1938` (24 July) | USA 6.1k alone | **fixed**: 97.0k Allied against 16.7k | `critic/c68_dday_1938.log` |
| R67-N1 `c67_census.ts 1938` (26 August, France box) | USA 5.2k, FRA 90 | **fixed**: USA 92.2k, ENG 35.6k, CAN 11.3k (139k; bar 100k) against GER 34.0k; FRA still 90 | `critic/c68_census_1938.log` |
| R67-N1 `trackFronts` attacker cohort | "of 0k lost 0k" | counted: "of 235k lost 140k" (R68-N4) | `critic/c68_tf_1938.log` |
| R67-N2 `c67_firstdecl.ts 60` 39821–39839 | 17 of 98 over 6,000 km; Japan on Europe 9/10 | **fixed**: 2 of 96; Japan none | `critic/c68_firstdecl.log` |
| R67-N3 `seaBattles 39061`, `32061` | JAP 194 and 179 out of battle | 40 and 50 sinkings out of battle, carriers' hits (ADR-1026) | `critic/c68_sb_*.log` |
| R67-N4 afterTrack CCP | 650k → 18–90k | 670k → 13–103k by day 1,800 (answered, ADR-1027) | `critic/c68_atx_*.log` |
| Design objection: free 1975 far conquest | Jordan, Damascus, Algiers | R81a's bar met (×1.17); Britain takes Beijing on 4 of 5 seeds | `critic/c68_farc_*.log` |
| Flags at 250 m/px 39915 | 2-px band | framed light, told apart | `critic/shots/c68c_39915_arm_0250m_crop.png` |
| Burst at 937 m/px | "smudge" (probe's `settle`) | ring and dot to ~18 s, God's and AI's | `critic/shots/c68b_*`, `critic/shots/c68am_max2_strip.png` |
| `w_wing` 39927, 35127 at 250 m/px | median 392, 68 | 0, 0 (p90 552–712) | `critic/c68_w_wing.*.log` |
| Relations graph 39939 | few named; truce in footer | all named; truce its own line | `critic/shots/c68rg_39939_*` |
| Land ranking 1942 | Germany not in top 15 | 11th | `critic/shots/c68st_uranus_d1.png` |
| `freeburst` 0/1938/1939/1941/1946/1954/1963/1975 × 5151, 6161 | 1938-left = plain | the same; 1975 first month 5 and 10 | `critic/c68_fb_*.log` |
| `farlands` 7019, 39811, 39813 | USA past 4,000 km years 1–3 | USA no landing (small, above) | `critic/c68_farlands_*.log` |
| `c66_endhours` 999/5151/6161/31337 | joins to new pacts only | identical (R81a's change leaves the 1975 end hours alone) | `critic/c68_endhours_*.log` |
| traits 1975, landof 1975 | JAP 10, ITA 15; 0 cells | identical | `critic/c68_traits.log`, `critic/c68_landof_1975.log` |
| `c66_air69.ts` | no air fight in the hold, 193 days | the same; raids on Vietnam 2,108 in December | `critic/c68_air69.log` |
| `c67_greats.ts 7019 3`, `seapowers` 7019/39801 | — | another world (the pin moved); `seaPowers` holds the seven at day 0 | `critic/c68_greats_7019.log`, `critic/c68_seapowers_*.log` |
| `fewNationWars 3` 39401 | first wars day 13 to day 2,589 | the same first days; fewer wars on 39405/6 | `critic/c68_few3.log` |
| `nukes75` 6161 | none launched | CCP 4 launched on India, 4 intercepted | `critic/c68_nukes75_6161.log` |
| R68-B1's load case on `6e0e46f3` | — | the same 2,519 px scar after a load: old | `critic/shots/c68lr6e0e_41203_*` |
| Named landing ×12, nvtraces, diploInv ×6, worldInv ×5 | as run 66 | nvtraces, diploInv and worldInv SAME; landings: the same `slowClick` breaks, 32115 clean | `critic/scripts/c68_cmpnamed.sh` |
| Malta's 18 (due) | 18 not taken | identical | `critic/c68_malta.log` |
| Run 61's bulk sets (due) | 366/396, 153/153, 162/168 identical (sim unchanged then) | 279/396, 152/153, 128/168 identical (sim changed); breaks: landings 2 (`slowClick`), stuck returns 0.0 d, voyages 3 | `critic/c68_*_cmp.txt` |
| workerDeterminism 32059, 39059 | `cf5a4a7f`, `36e98e06` every arm | `847d48a7`, `740d6d44` every arm (another world) | `critic/c68_wd_*.log` |
| 7019 / 32019, 20 years | `f88d8b46`, `80727b2c` | `f8dadd4b`, `f7225aa1` (the pin moved: ADR-1025, ADR-1033) | `critic/c68_seed*_save.log` |
| Page JSONs (`c68_cmpjson.mjs`) | — | SAME: `k_39979`, `p`, `q_39919`, `u_1600_5557`, `xe_32443`; others differ by world or port | `critic/scripts/c68_cmpjson.mjs` |
| Perf chain | tick 2.33, replay 1.61, 120 m/px 52.5–55.8 (draws) | tick 2.22, replay 1.59; 120 m/px draws 52.5–56.8, frames 59.0–60.2; panning 60 | `critic/c68_pf.status` |
| Left out (see the top) | — | — | — |

## Design objections (none blocking, no score lowered)

- **The free world after 1975 still conquests afar** (ADR-1033 re-scoped the bar to plain 1938's own rate, the user's
  decision). The bar is met (×1.17). But in the free 1975 game the United Kingdom takes People's China's capital within
  two years on 4 of 5 seeds:
  - 6161: day 274;
  - 41161: day 553;
  - 41165: day 623;
  - 41167: day 658.
  - Korea's and Vietnam's capitals fall to it too, 8,000–9,000 km from London (`critic/c68_farc_1975.log`).
  - Plain 1938's rate is a yardstick of a world war. It does not describe the Cold War the 1975 card promises.
- **D-Day's ground handed at the window's end** (R77, ADR-1018): the fight is real now, but the ground still comes by
  handover (R68-N4).
- Carried: Stalingrad's own stage a handover (ADR-1018); Spain on the card of 1941–49 (ADR-1019); the dominions as
  Britain's puppets in 1975 (ADR-17).

## Ideas from other games (not scored)

- **Hearts of Iron IV's frontline:** a beachhead's land is taken province by province as divisions advance. That would
  read R68-N4's seven weeks.
- **Europa Universalis and Victoria:** the undo-like "reload" re-renders every map mode from the save. A map layer kept
  across a load is a known class of bug those engines guard by clearing all layers on load.

## Strengths (verified)

- **The batch fixed what run 67 asked, on run 67's own cases:**
  - D-Day is held (6.1k → 97.0k Allied on 24 July);
  - Japan's far declarations are gone (17 → 2 of the 60-day declarations over 6,000 km);
  - the wing's mark is on its planes (median 392 → 0 px);
  - Germany's flag is told from Poland's;
  - every node of the relations graph is named.
- **Undo restores the world to the bit,** including the replay's track and the history list: hashes equal after 2 s, 30
  days and 90 days of play. Only the map's two burst layers lag (R68-B1).
