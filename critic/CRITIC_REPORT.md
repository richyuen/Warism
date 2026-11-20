# Critic report, run 88 (focused): Batch 55 (R203 to R208), on `3e1ed78e`

## The run

- **Mode: focused** (ADR-1138: every run).
- **Commit judged:** `3e1ed78ebc14824d82aab955c040292d036adad2`, HEAD at the start (`critic/c88_commit.txt`).
- **Last report:** run 87, focused, on `bbf47bca`.
- **Time:** 00:21 to about 01:40 by the machine's clock.
- **The sizes** (ADR-1141): fresh scores rest on 393 × 659, 393 × 852, 734 × 343, 852 × 393 (touch, pixel ratio 3) and
  2560 × 1305. Run 87's named cases were re-run at their own sizes (700 × 800, 1280 × 720, 1600 × 900, 390 × 844); what
  shows only there is non-blocking.
- **Left out for time:**
  - The opened ranking with a nation's panel beside it on a phone on its side (the row then stands at the right, under
    the ranking's place); not probed.
  - A hidden or background tab (the one player route to R88-B1 I could think of and could not drive).
  - R204's row at 2560 × 1305 with a nation's panel and History toggled while the game runs (run paused in `c88_sizes`,
    running without panels in `c88_rowJitter`).
  - The editor and God Mode on a phone beyond one God tab (`h_godtab 393 852`) and the God toolbar in `c88_sizes`.
  - The cause of R88-B1 (found, measured, not explained).
  - R207 at its own sizes (601, 640, 700 × 800).
  - `workerDeterminism` on a new seed, and `pageHash` on its own seed (1307) as a control for R88-B1.

### What changed since run 87

- `git diff --stat bbf47bca HEAD -- src/sim data public/data` is empty: the sim is unchanged.
- **The page diff:** `src/app/style.css` (R203, R207, R208), `src/ui/MapLegend.tsx`, `src/ui/usePhone.ts` (R203),
  `src/ui/WarBanners.tsx` and the new `src/ui/bannerOrder.ts` `rowStand` (R204), `src/ui/RelationsPanel.tsx` (R205).
- **Sim unchanged, carried (ADR-917):** every bulk set run 87 carried.
- **The every-run jobs ran** (ADR-1138): see the Verdict.

### Scored afresh, and why

| Dimension | Why |
|---|---|
| `uiUxPolish` | blocked in run 87 (R87-B1); touched: `style.css`, `MapLegend.tsx`, `usePhone.ts`, `WarBanners.tsx`, `bannerOrder.ts`, `RelationsPanel.tsx` |
| `diplomacyWarDepth` | touched: `RelationsPanel.tsx` (R205), `style.css` |
| `statsHistory`, `godMode`, `editorScenarios` | touched: `style.css` |
| `performance` | `src/` changed: the chain, run alone |
| `semanticZoom`, `naval` | **the rotation**: of the dimensions the diff does not touch, the five last fresh in run 85 are the oldest; the first two in DIMENSIONS order |
| `stability` | not due (fresh in run 87), but **a defect met in passing** (R88-B1) moves it; scored on that defect and this run's every-run jobs |

- **Carried:** `mapVisuals` (run 86), `emergentDynamics` (run 87), `tanks`, `aircraft`, `aiNukes` (run 85).

### Setup

- **HEAD's build:** `critic/c88_dist` (`sh critic/scripts/c88_build.sh`, build exit 0, replay starts copied from
  `critic/c85_starts`), served on 127.0.0.1:5431.
- **Run 87's build** (`critic/c87_dist`, `bbf47bca`) served on 5432 for two cases: R88-B1 and R88-N1 on the last
  report's commit.
- **Order:** the sim jobs (`c88_long.sh`) and the page lanes at once (`c88_laneA.sh` run 87's named cases, `B` and `E`
  run 86's kept cases, `C` God Mode, editor, History and relations, `N` naval, `Z` zoom, `M` the monkeys, `X` Batch 55
  off its cases); then the determinism probes; then `c88_chainPerf.sh`, alone, from 01:01:27.
- **New scripts:**
  - `critic/scripts/c88_sizes.mjs`: the page's boxes at the five supported sizes. Which box lies over which (the element
    at sampled points), in six map modes, with the legend folded and opened, the ranking, a nation's panel, History,
    relations, charts, God Mode, a rotation, and a landing ordered.
  - `critic/scripts/c88_sameWorld.mjs`, `c88_sameWorldMsgs.mjs`, `c88_playHash.mjs`, `c88_playHash2.mjs`,
    `c88_headHash.ts`: one seed's world in the page against the headless one (R88-B1).
  - `critic/scripts/c88_relSaid.mjs`, `c88_rowJitter.mjs`, `c88_monkey.mjs`: run 86's and 87's probes at the supported
    sizes (the monkey with a pixel ratio of 3).
  - `critic/scripts/c88_scan.mjs`: page errors in every output of this run.
- **At the end:** both preview servers (5431, 5432), every browser and every job I started were stopped, and no listener
  is left on either port.

## Verdict

**Batch 55 fixes run 87's cases on their routes (R207 was not re-run at its own sizes):**
- **R203 (R87-B1):** `MODES=political,seaControl,airControl,fallout,puppets c87_legendOpen 84901 400` gives
  `rowOverLegend` 0 and `legendOverRow` 0 opened and back in all 20 cases, `nudged` = `shown`
  (`critic/c88_lo_84901_400.log`; run 87: 89 to 329 points). `WAIT=4000 c87_legendShot` in fallout and sea control: 0
  opened and after 1280 and back (`critic/c88_ls_*.log`). `c86_modeRow` 84901 and 85901: `fit0` [], `stale` [],
  `covering` [].
- **R204 (R87-N2):** `c87_rowJitter 87601 300`: `moves` 0 in the seven cases where `countCh` is 0, one move with its
  count's change (`critic/c88_rj_87601_300.log`; run 87: 4 moves in 3 cases with the count unchanged). On a new seed
  (88603) and at 2560 × 1305 and 1920 × 1080 (88601): no move without a change of the count.
- **R205:** "Truces hidden · No ties of these kinds." and no more, at 568, 844 and 1600 px (`critic/c88_rs_84903_400.log`)
  and at all five supported sizes on a new seed (`critic/c88_rs_88905_400.log`).
- **R207:** not re-run at its own sizes (601 to 700 × 800). At the five supported sizes, with a landing ordered and a
  nation's panel open, the element at the panel's × is the × (`critic/c88_sz_88903.log`, `xHit`); on a phone's width
  the bar gives way to the panel, as SPEC §9.2 says.
- **R208:** at 393 × 659 and 393 × 852 the ranking is gone while the legend is open and back, in its state, as it
  folds, in five map modes; the opened legend lies on no box (`critic/c88_sz_88901.log`).

**One blocking issue: R88-B1 (stability, not of this batch).** In the page, one `step` of 7,200 hours or more of
plain 1938 seed 88901 ends in another world than the headless one in 8 of 18 loads on HEAD and 5 of 8 on run 87's
build, from the same messages. A game left to run at its highest speed ends in the headless world, 11 of 11. No player
route was found; the route is the one every page probe and e2e spec steps by, and PLAN 7.152b's AT (Blocking issues).

**The rule checkers on new seeds:** 6 runs of five years each, 0 broken.
- `diploInvariants`: 88001, 88005 (heroes) and random 88003. `worldInvariants`: 88051, 88053 (heroes) and the random
  world 88055. Evidence: `critic/c88_diploinv_*.log`, `critic/c88_wi_*.log`.

**`landingFuzz --seeds 15 --first 88101`:** 0 of 90 runs broken, `slowClick` 0 of 90 (`critic/c88_landingFuzz.log`).

**The 20-year hashes of plain 1938:** 7019 `ab927e1b`, 32019 `c3520016`, as in runs 79 to 87
(`critic/c88_seed7019_save.log`, `critic/c88_seed32019_save.log`).

**Monkeys:** five on new seeds at the five supported sizes, heroes on, 1,020 s in all, 0 page errors, none hung, the
tick moving at the end (`critic/c88_monkey.*.log`).

**Page errors:** 0 in all outputs of this run (`node critic/scripts/c88_scan.mjs`).

**New non-blocking issues, both at supported sizes and both on run 87's build too:**
- **R88-N1:** on the iPhone 16 upright with a landing ordered, the landings' bar lies over the whole folded legend; it
  cannot be opened.
- **R88-N2:** on the iPhone 16 sideways the landings' bar lies over the opened legend.

**Scores:** `uiUxPolish` 7 → 8 (R87-B1 fixed). `stability` 8 → 7 (R88-B1). Every other dimension 8.

## Scores

### Map visuals and readability: **8** (carried from run 86)

### Diplomacy, war, alliances, puppets, revolts: **8** (scored afresh: R205; `style.css`)
- **Checkers:** 6 runs on new seeds, 0 broken (Verdict).
- **R205 on its case and at the supported sizes** (`critic/c88_rs_84903_400.log`, `critic/c88_rs_88905_400.log`): with
  every kind hidden the footer is "Truces hidden · No ties of these kinds." at eight sizes; with ties shown the
  left-out count is back; `empty` [], `out` [] everywhere.
- **Run 87's relations cases, the same figures:** `relSide 84903` `withBad` 1, `withDead` 1, `minGraph` 123;
  `relFoot 84903` inside the panel at every step; `graphSize 68901 568 320` 123 px, 5 names, median 13 px
  (`critic/c88_{rsd,rf,gs}_*.log`).
- **The graph at the supported sizes** (`rg_relations` 88929 at 2560 × 1305, 88931 at 393 × 852 and 852 × 393): exit 0,
  0 errors. At 393 × 852 the graph fills the panel and its names read
  (`critic/shots/c88sz_88901_d400_393x852_11_seaControl_legendOpen+relations.png`).
- **A forced war** (`fw2_forcewar` 88935 and 88939): sides and allies as expected, 0 errors.
- **Not 9:**
  - R88-N3: at 393 × 659 the footer's first line is cut ("Click a nation to select it, a line to read it. · 24 nations
    with no tie shown are left out", `cut` true; `critic/c88_rs_88905_400.log` line 1). At 393 × 852 it wraps to two
    lines and reads.
  - Kept: a kind's line replaces the selected nation's name; R196's 13 px graph jump.

### Emergent world dynamics: **8** (carried from run 87)

### God Mode: **8** (scored afresh: `style.css`)
- **New seeds, all exit 0 with 0 page errors** (`critic/c88_laneC.out`): `a_god_nuke`, `q_god_tools` and `undo2` (nuke,
  revolt, nation, city, raze, each undone) at 1600 × 900 (88917, 88919, 88211) and again at 2560 × 1305 (88927, 88923,
  88213; the pictures are 2560 × 1305, e.g. `critic/shots/c85a_88927_14_paris_h_2h.png`); `fw2_forcewar` 88935 and 88939
  (the probe's own 1400 × 800); `godpeace 1942 JAP`.
- **On the phones:** the God toolbar stands above the bar and the war row moves up clear of it at all four phone sizes,
  nothing over anything (`critic/c88_sz_88901.log`, the `legendOpen+god` rows;
  `critic/shots/c88sz_88901_d400_393x659_13_seaControl_legendOpen+god.png`). `h_godtab 393 852 god-world-ai`: exit 0.
- **Not 9:** as run 87 (the strike ring's cut name, R172); a phone's God toolbar takes two rows of the upright view.

### Editor and scenarios: **8** (scored afresh: `style.css`)
- **`x_editor`** 88443 and 88445 (the probe's own 1600 × 900): paint, undo, redo, export 591,884 bytes, the file loaded back with the
  paint (`loaded owners [1,1,1]`) (`critic/c88_x_editor.*.log`).
- **`g_editor`** 88921, and 88925 at 2560 × 1305: fleets placed, a refusal said in words ("Not done: no water of a sea
  is near the place."), 0 errors.
- **`os2_scen`:** the standoff file is offered and loads. **`saveload_page 88937`:** `same` and `same2` true.
  **`x_continue 88415`:** `sameAfter` true.
- **Not 9:** as in run 85.

### Stats and history: **8** (scored afresh: `style.css`)
- **Lane E's 34 cases, all exit 0, 0 errors** (`critic/c88_laneE.out`), the cases run 87 left out among them
  (`dirHand 68957`, `phoneTicker 85903`, `deathTitle 7019` at 844 × 390, `deathTitle 85905`, `bannerRank 85901`,
  `bannerFlip 85903`).
- **Same seeds as run 87, the same figures:** `bannerFlip` 57901, 58901 and 57903 change 8, 4 and 5 times
  (`critic/c88_bannerFlip.*.log`); `dirHand` on three worlds `cutsAfterAct` 0, the camera moved 0 px.
- **At the supported sizes, new seeds:** `timeLapse` 88941 at 2560 × 1305, 88945 at 393 × 852 and 734 × 343,
  `histPlace 88961` at 2560 × 1305 and 393 × 659, `tlMonths 88947`: `errors` []. The time-lapse bar at 734 × 343 stands
  between the map and the bar, clear of both (`critic/shots/c85tl_head_88945_734x343_7playing.png`). History at
  393 × 852 fills the view between the bars and reads
  (`critic/shots/c88sz_88901_d400_393x852_10_seaControl_legendOpen+history.png`).
- **Not 9:** `trackTexts`' bare notes (sim unchanged, carried).

### UI/UX and polish: 7 → **8** (scored afresh: blocked in run 87; R203 to R208)
- **Why it moves:** R87-B1 is fixed, by the same case on both builds: `c87_legendOpen 84901 400` at 700 × 800 gave
  `legendOverRow` 247 (sea), 285 (air), 329 (fallout) on `bbf47bca` (`critic/c87_lo_84901.log`) and 0 in all 20 cases on
  HEAD (`critic/c88_lo_84901_400.log`). Run 87 said 8 without it.
- **The five supported sizes, the page's boxes** (`node critic/scripts/c88_sizes.mjs 88901 400`,
  `critic/c88_sz_88901.log`; 5 sizes, 6 map modes, 0 page errors):
  - Folded: nothing lies over anything at any size in any mode; nothing leaves the view; the page never scrolls sideways.
  - 2560 × 1305: three banners on the centre in six modes, the legend bottom right, nothing covered with a nation's
    panel, History, relations, charts or God Mode open.
  - Upright (393 × 659, 393 × 852): the opened legend on no box in five modes, every row of it in view (sea control's
    12 rows fit, 270 px); the ranking gone while it is open and back as it folds (R208); a nation's panel and History
    hide it and it comes back open.
  - Sideways (734 × 343, 852 × 393): the opened legend ends above the war row (240 and 290 px), its rows scroll to the
    last (`lastIn` true); it lies over the news while open (634 to 2,155 of the news' sampled points), as R203's tick
    says it does.
  - A rotation with the legend open, both ways: the row and the legend take the other view's places, no stale count.
- **Run 87's and run 86's kept cases, the same or better figures:** `deskRow` on five worlds `fit0` [], `stale` [],
  `covering` []; `rowShot`, `deskFit`, `moreClick` ×3, `phoneRow` ×2 (`stale` 0, p95 16.7 ms), `phoneToDesk` ×3,
  `rotate` as run 87; `crossWidth` 85901 and 84901 `deskCut` 0 (run 87: 5 and 3) (`critic/c88_{dr,rw,cw,df,mc,pr,pd,rot}_*.log`).
- **R202's row** (`c86_deskAttack 84901 400 wide`, and new seed 88907): 0 px off the centre at 1600, 1920 and 2560 px in
  eleven modes; at 1280 px 16 to 44 px off, held (`critic/c88_da_*.log`).
- **Not 9:** R88-N1 and R88-N2 (the landings' bar and the legend on a phone), R88-N3, and R88-N4: at 393 px the
  banners' names cut to "Natio…" twice in one row (`critic/shots/c88sz_88901_d400_393x659_04_seaControl_legendOpen.png`).

### Performance: **8** (scored afresh: `src/` changed; the chain run alone)
- **The run:** `sh critic/scripts/c88_chainPerf.sh`, from 01:01:27 to 01:23:48, with no other job of mine running.
  Every stage exits 0 (`critic/c88_pf.status`).
- **The tick of seed 99 over five years:** plain 1.815 ms mean, hash `ca4700f1` (`critic/c88_tick99.log`; run 87:
  1.833 ms, the same hash). With heroes 1.621 ms, hash `494ed033` (`critic/c88_tick99h.log`; run 87: 1.646 ms, the
  same hash).
- **Frames at 2560 × 1305 (ADR-1141) on 7019's year-20 world, at the battle spot, from 3,000 to 30 m/px in both looks**
  (`critic/c88_pf_lookfps_w*.log`, summed by `node critic/scripts/c86_pfsum.mjs`):

  | World | Least mean fps | Highest p95 | Worst frame |
  |---|---|---|---|
  | Plain | 59.8 | 18.0 ms | 117 ms |
  | With heroes (run 79's save) | 59.6 | 18.0 ms | 116 ms |
  | Plain at 2560 × 1440, run 87's size | 59.7 | 18.2 ms | 116 ms |

  - Run 87 has no figure at 2560 × 1305 (not compared). At its own 2560 × 1440: 57.6 in its chain and 58.8 to 59.1
    alone; 59.7 here. No fall.
- **`lookFps 7019`:** forced 59.6 to 60 frames/s at every tier (least 58.8), a draw of 0.8 to 3.2 ms
  (`critic/c88_lookfps.log`). Run 87: 59.0 to 59.8.
- **The individual tier, `x_indfps 64111`:** 59.6 to 60 fps, p95 16.7 to 16.8 ms, 6,246 individuals drawn at Max speed
  (`critic/c88_xi.log`). Run 87: 59.3 to 60.
- **Touch (`tm_touch`):** 59.6 fps with 271 ticks/s and nothing selected (`critic/c88_tm_touch.alone.log`). Run 87: 59.6
  and 266.
- **A 12-year watch on the page alone at 2560 × 1305 (`long_watch2 88945`, heroes on, a new seed):** 59.8 to 60.1 fps
  each year, `ok []` (`critic/c88_lw_88945_alone.log`).
- **The page's cost of the row** (`phoneRow` ×2 over 90 s): frame gap p50 and p95 16.7 ms, 0 stale
  (`critic/c88_pr_*.log`); the row makes 0 mutations at rest (`critic/c88_da_84901_400.log`, "idle").
- **Run 79's 7019 year-20 save** loads and runs a year at 1.806 ms a tick, ending at `07e768a6` as in runs 81 to 87
  (`critic/c88_loadold_7019.log`). **The time-lapse of 20 years** plays with `errors` [] (`critic/c88_tm_lapse20.log`).
- **Not 9:** the worst single frame at the battle spot is still 116 to 117 ms; a year of 88901 headless has a mean tick
  of 3.05 ms under this run's load, against 1.8 for seed 99 alone.

### Stability: 8 → **7** (a defect met in passing: R88-B1)
- **Why it moves:** R88-B1, on both builds (HEAD 8 of 18, `bbf47bca` 5 of 8, the same two hashes). It is not new in
  this batch: the sim is unchanged since `a9736eb5`, and run 87 did not look. The page's world for a seed is not one
  world on the route every page test steps by.
- **What holds, this run:**
  - 0 page errors in every output; five monkeys at the five supported sizes, 1,020 s, none hung.
  - Plain 1938's 20-year hashes repeat runs 79 to 87. The tick of seed 99 ends at `ca4700f1`, with heroes `494ed033`.
  - The page's save and load (`saveload_page 88937`: `same`, `same2`) and Continue (`x_continue 88415`: `sameAfter`).
  - A game left running at the highest speed ends in the headless world: 6 of 6, and 5 of 5 with the page stalled for
    20 s (`critic/c88_ph_88901.log`, `critic/c88_ph_block_88901.log`).
  - 6 checker runs and 90 `landingFuzz` runs, 0 broken.
- **7 and not lower:** no player route to R88-B1 was found, and nothing else broke.
- **What 8 needs:** R88-B1's "seen fixed when".

### Semantic zoom to unit level: **8** (scored afresh: the rotation)
- **Every tier at the supported sizes, new seeds, 0 errors** (`look` 88901 at 2560 × 1305, 88903 at 393 × 852, 88907 at
  852 × 393; `critic/c88_look.*.log`):
  - 2560 × 1305 at 250 m/px: a front of some eighty divisions in the Balkans, each a flag, men and name, the engaged with
    a red edge, order arrows, the fire band (`critic/shots/c85look_88901_2560x1305_d180_f0_250m.png`).
  - 852 × 393 at 100 m/px: two divisions in contact, their men as dots, a wing overhead, the name tags clear of the news
    (`critic/shots/c85phone_88907_852x393_d400_f0_100m.png`).
  - 393 × 852 at 30 m/px: single soldiers of two divisions, the order arrow, the tags
    (`critic/shots/c85phone_88903_393x852_d240_f1_30m.png`).
- **The steps between tiers** (`z_zoom` 88911, and 88913 at 2560 × 1305): 18 steps from 6,000 m/px, elements from
  1,573 m/px (8,253 and 12,240), individuals at the last tiers, frames drawn at each (`critic/c88_z_zoom.*.log`).
- **No pop across 1,200 m/px** (`markerPop` 88951 and 56951): leaps 0, pops 0 over a wheel, a glide and two running
  watches; frame p95 18.1 to 18.6 ms. `markers 88951`: 0 pairs over 30 % at three days and three tiers.
- **`resize 88821`:** the canvas fits at four sizes, 60 frames/s. **`phz 88933`**, **`h_zoom`**: 0 errors.
- **Not 9:** the heroes' name tags still jump while the world tiers zoom (kept from run 85): `heroPop 85905` 13 jumps
  from 9,000 to 4,000 m/px, as in run 85 (13); on a new seed, 88905, 8 jumps, "TOG II" by 126 and 136 px in a frame
  (`critic/c88_heroPop.*.log`).

### Naval warfare: **8** (scored afresh: the rotation)
- **`landingFuzz` on 15 new seeds:** 0 of 90 broken.
- **Sea fights of three new worlds** (`seaBattles` 88061, 88069, random 88067): 77, 47 and 51 battles in two to three
  years; `seaBattlesLook`: 77 of 77 and 47 of 47 seen at their camera, 0 with no fleet to see, 0 page errors
  (`critic/c88_sb_*.log`, `critic/c88_sbl_*.log`). Run 85: 67 battles on 85061 (new seeds, not compared).
- **Repulses** (`c77_repulse` 88071, 88073): `broken 0`; "1 of 3 ashore; thrown back: sailing home to Southend-on-Sea",
  then "over: 1 landed, 2 thrown back".
- **On the page, new seeds, all exit 0 with 0 errors** (`critic/c88_laneN.out`):
  - `lland` ×3: "over: 3 landed" at Bremerhaven and Shanghai; at Norwich "over: its transports were sunk; 3 never
    sailed", with the news naming the three.
  - `lhold 88905`: Valletta from Rome, "over: 2 landed". `turnback 88901`: cancelled at sea, "turning back to Tokyo",
    then "cancelled: back at Tokyo, Ōsaka; the AI commands them again".
  - `whotold 88215`: each division told in words when its transports broke off or were sunk.
  - `lbar 88221` at 393 × 852 and 734 × 343, `lbox 88223` at 852 × 393 and 2560 × 1305: the bar's status counts down
    ("sails in about 4 days" … "at sea: lands in about 2 days"), every part in the view.
  - `nvpage` ×2, `seaclick 88913`, `sb_seaballs`: 0 errors.
- **Not 9:** R88-N1 and R88-N2 are the landings' bar's (scored under `uiUxPolish`); `seaBattlesLook` lists 12 and 2
  battles with one side alone at the camera.

### Tanks: **8** (carried from run 85; sim unchanged)

### Aircraft: **8** (carried from run 85; sim unchanged)

### AI nuclear use: **8** (carried from run 85; sim unchanged)

## Blocking issues

1. **R88-B1 (stability; every size; not of Batch 55): one long `step` in the page ends in another world than the seed's.**
   - **The case:** plain 1938, seed 88901, opened paused; `window.__warsim.sim.step(9600)` (400 days in one message); the
     state hash read. Headless (`npx tsx critic/scripts/c88_headHash.ts 88901 9600 600`,
     `critic/c88_headHash_88901.log`): `3723997852` at hour 9,600.
   - **HEAD, one step of 9,600:** `3723997852` in 10 loads and `1699438925` in 8, of 18
     (`critic/c88_sw_88901_400.log`, `c88_sw_wa_88901.log`, `c88_sw_wm_88901.log`, `c88_swm_88901.log`). Both hashes at
     852 × 393 and at 2560 × 1305; the size does not choose.
   - **The builder's own checker on this seed:** `npx tsx tools/diag/pageHash.ts http://127.0.0.1:5431 88901 1 76540321
     10 3` (a year in one message, ten loads, against the headless year hash `76540321`): "3 of 10 runs equal to
     headless every year"; the other seven end at `e895151f` (`critic/c88_pageHash_88901.log`).
   - **The messages are the same:** `c88_sameWorldMsgs` records every message the page posts to its worker. Before the
     step: `nukePause`, `init`, `subscribe`, `speed`, `pause`, 2 `ack`, `hash`; during it: the one `step`. The same in
     the loads that end at either hash (`critic/c88_swm_88901.log`). The start hash is `263409159` in all.
   - **It is not the first seconds:** waiting 6 s before the step still gave the other world once in 4; waiting for the
     map layers and the elevation gave it 3 times in 4.
   - **By the step's length** (`critic/c88_swm_88901_{25,100,200,300}.log`): 600, 2,400 and 4,800 hours: the headless
     hash, 8 of 8 each. 7,200 hours: `1956157891` in 2 of 8 (headless `4108155890`). 9,600: 8 of 18.
   - **In steps it holds:** 16 steps of 600 hours, 4 of 4, and 2 steps of 4,800, 8 of 8, end at the headless hash, each
     hash on the way the headless one (`critic/c88_sw_ch_88901.log`, `c88_sw_ch200_88901.log`).
   - **A running game holds:** opened running, the speed at its highest, paused past hour 9,600: the headless hash of
     its tick, 6 of 6; with the page's main thread held busy for 20 s (no snapshot acked), 5 of 5
     (`critic/c88_ph_88901.log`, `critic/c88_ph_block_88901.log`; headless by the hour in
     `critic/c88_headHash_88901_from9600.log`).
   - **Another seed:** 88903, one step of 9,600: the headless `518578261`, 8 of 8 (`critic/c88_swm_88903_400.log`). The
     fault needs a world that meets it.
   - **Run 87's build** (`bbf47bca`, 5432): the same two hashes, the other world in 5 of 8
     (`critic/c88_swm87_88901_400.log`). Not a regression of this batch.
   - **What a watcher sees:** on 5 February 1939 of seed 88901 one load shows "Nationalist Spain ⚔ Portugal" and Japan
     holding 15 sea zones, another "France ⚔ Nationalist Spain", "Japan ⚔ China" and the United Kingdom first with 5
     (`critic/shots/c88sz_88901_d400_393x659_04_seaControl_legendOpen.png`,
     `critic/shots/c88sz_88901_d400_852x393_07_seaControl_rankOpen+legendOpen.png`).
   - **Why it blocks (no player route was found; it blocks as a broken checker and a contradicted claim):**
     - SPEC §2.6 says the sim is deterministic, "identical in every engine"; the goals name "deterministic seeds". Here
       one build in one engine, given the same messages, makes two worlds.
     - The builder's own checker under `tools/diag`, `pageHash.ts` (PLAN 7.152b's AT: "each year stepped in one message
       and its state hash read", compared with headless), reports it broken on this seed: 3 of 10. Its own seed (1307)
       was not run here; seed 88903 holds, 8 of 8.
     - **Who meets it:** no player, by what I could drive. Nothing in `src/app` or `src/ui` sends `step`; a game that
       runs is stepped by the pump, and held. The ones who meet it are every page probe of mine and every e2e spec that
       steps a world by `sim.step`: a case stepped 300 days or more in one message is judged on one of two worlds. This
       run's own `c88_sizes` was.
     - Not excluded: a route where the worker steps thousands of hours with nothing between (a hidden tab was not
       driven).
   - **A lead, not a finding:** the pump and the stepped runs differ from the one long step only in what the worker does
     between hours (the snapshot, the labels and the statistics, each by the clock). The sim reads no clock
     (`src/sim` has none but `OP_PROBE`).
   - **Fix:** find what the worker's long step leaves undone that a pumped or chunked run does, and do it by the tick,
     not by the clock; then pin it: a page case that steps 9,600 hours of seed 88901 in one message against the headless
     hash.
   - **Seen fixed when:**
     - `node critic/scripts/c88_sameWorldMsgs.mjs 88901 400 12` prints one end hash, `3723997852`.
     - `node critic/scripts/c88_sameWorldMsgs.mjs 88901 300 12` prints one end hash, `4108155890`.
     - `npx tsx tools/diag/pageHash.ts <base> 88901 1 76540321 10 3` prints "10 of 10 runs equal to headless every year".
     - `node critic/scripts/c88_playHash.mjs 88901 9600 6` stays "same as headless: 6 of 6".

## Non-blocking issues (prioritised)

1. **R88-N1 (UI, the iPhone 16 upright, 393 × 659 and 393 × 852, a landing ordered): the landings' bar lies over the
   folded legend, whole.**
   - `MODES=political,seaControl node critic/scripts/c88_sizes.mjs 88903 0` (`critic/c88_sz_88903.log`): with Japan's
     landing on Shanghai ordered, the bar covers 308 of 308 sampled points of the legend's title in the political mode
     and 363 of 363 in sea control; a tap on the legend's toggle times out. Picture:
     `critic/shots/c88sz_88903_d0_393x659_22_seaControl_landing.png` (no legend to see under "Shanghai from Tokyo, Ōsaka,
     Hiroshima").
   - While a landing is on the bar (days of the game), the player who ordered it cannot read the legend of any map mode.
   - On `bbf47bca` the same: 308 of 308 and 363 of 363 (`critic/c88_sz87_88903.log`). Not of this batch; R208's rule
     ("one of the two at a time") stops at the ranking.
   - Non-blocking: the legend is back when the landing is over. SPEC §9.2's landings bar gives way to panels and a
     nation's panel; it says nothing of the legend, and no decision records the two together.
   - **Fix:** the phone's landings' bar under the legend's and ranking's row, or the legend's title given its place
     beside the bar.
   - **Seen fixed when:** `c88_sizes 88903 0 393x659,393x852` gives no `legend<landings` in the `landing` rows and the
     toggle opens.
2. **R88-N2 (UI, the iPhone 16 sideways, 734 × 343 and 852 × 393, a landing ordered): the landings' bar lies over the
   opened legend.**
   - Sea control, the legend opened: the bar covers 420 (734 px) and 231 (852 px) of the legend's sampled points; with
     the bar's row opened, 1,792 and 1,365, and at 734 × 343 the opened row also lies over the war row (574 points) and
     the news (342) (`critic/c88_sz_88903.log`, `critic/c88_sz_88901.log`).
   - Pictures: `critic/shots/c88sz_88901_d400_852x393_24_seaControl_landing+legendOpen.png` (the bar on the legend's top
     right corner), `…_25_seaControl_landing+legendOpen+barToggled.png` ("A sea zone tinted with the colour of the navy
     th…" cut by the bar's box).
   - R203 put the opened legend left of the landings' bar on a narrow desk only (`min-width: 601px` and
     `min-height: 501px`). On `bbf47bca` the same 231 and 1,365 at 852 × 393.
   - **Seen fixed when:** `c88_sizes 88903 0 734x343,852x393` gives no `legend<landings` and no `row<landings`.
3. **R88-N3 (the iPhone 16 upright with Safari's bars, 393 × 659): the relations footer's first line is cut**
   ("Click a nation to select it, a line to read it. · 24 nations with no tie shown are left out";
   `critic/c88_rs_88905_400.log`). At 393 × 852 it reads on two lines.
4. **R88-N4: at 393 px the war row's names are cut to "Natio…"** in two banners of one row ("Nationalist Spain"), so the two
   wars read alike (`critic/shots/c88sz_88901_d400_393x659_04_seaControl_legendOpen.png`).
5. **Kept:** the heroes' tags' jumps while zooming (`heroPop` 85905: 13; 88905: 8), the graph's 13 px jump (R196), R172,
   R192 and ADR-1111.

## Run 87's cases re-run

| Run 87 case | Run 87 (`bbf47bca`) | HEAD (`3e1ed78e`) | Evidence |
|---|---|---|---|
| R87-B1 `c87_legendOpen 84901 400` | `legendOverRow` 89 to 329 opened, not recounted | **fixed**: 0 and 0 in 20 cases, `nudged` = `shown` (five modes; the diplomacy leg's toggle is gone with the nation's panel) | `critic/c88_lo_84901_400.log` |
| R87-B1 `WAIT=4000 c87_legendShot` fallout, sea | 329 and 247; 193 after a recount | **fixed**: 0 opened and back | `critic/c88_ls_*.log` |
| R87-N2 `c87_rowJitter 87601 300` | 4 moves in 3 cases with the count unchanged | **fixed**: 0 moves where `countCh` is 0; 1 move with a change | `critic/c88_rj_87601_300.log` |
| Non-blocking 2: `c86_relSaid 84903` at 1600 | "No ties of these kinds." and the left-out count | **fixed**: the first alone | `critic/c88_rs_84903_400.log` |
| R200 `c86_modeRow` 85901, 84901 | `fit0` [], `covering` [] | the same | `critic/c88_mr_*.log` |
| R202 `c86_deskAttack 84901 wide` | 0 px at 1600+; 16 to 44 at 1280 | the same | `critic/c88_da_84901_400_wide.log` |
| `deskAttack` dpr, idle | all [], 0 mutations | the same | `critic/c88_da_84901_400.log` |
| `deskRow` ×5, `rowShot`, `deskFit`, `moreClick` ×3 | `fit0` [] | the same | `critic/c88_{dr,rw,df,mc}_*.log` |
| `crossWidth` ×2 | 0 stale; `deskCut` 5 and 3 | 0 stale; `deskCut` 0 and 0 | `critic/c88_cw_*.log` |
| `relSide`, `relFoot`, `graphSize` | bad 1, dead 1, 123 px | the same | `critic/c88_{rsd,rf,gs}_*.log` |
| `phoneRow` ×2, `phoneToDesk` ×3, `rotate` | 0 stale, p95 16.7 | the same | `critic/c88_{pr,pd,rot}_*.log` |
| Lane E (`bannerFlip` ×3, `bannerRank`, `dirHand` ×2, …) | exit 0; 8, 4, 5 changes | the same figures; run 87's left-out cases run, exit 0 | `critic/c88_laneE.out` |
| Kept `heroPop 85905` (not run in 87) | run 85: 13 jumps | 13 jumps | `critic/c88_heroPop.85905_300_head.log` |
| Performance chain | tick 1.833 ms `ca4700f1`; QHD 57.6 in the chain, 58.8 to 59.1 alone | tick 1.815 ms `ca4700f1`; 2560 × 1305 59.8 fps, 2560 × 1440 59.7 | `critic/c88_pf.status` |
| 20-year hashes 7019, 32019 | `ab927e1b`, `c3520016` | the same | `critic/c88_seed*_save.log` |
| Checkers, `landingFuzz` | 6 runs and 90 fuzz runs, 0 broken | 6 and 90 on new seeds, 0 broken | `critic/c88_*inv*.log`, `critic/c88_landingFuzz.log` |
| Monkeys | 4 sizes, 0 errors | the 5 supported sizes, 0 errors | `critic/c88_monkey.*.log` |

## Design objections (none blocking)

- **R203's opened legend lies over the news on a phone on its side** (634 to 2,155 of the news' sampled points; the
  news shows as slivers at its right edge, `critic/shots/c88sz_88901_d400_852x393_07_seaControl_rankOpen+legendOpen.png`).
  R203's tick chose it ("over the news while it is open, as a nation's panel there"). A legend that stopped above the
  news, as it stops above the war row, would leave five rows fewer in view and nothing half hidden.
- **R208 hides the ranking's toggle while the legend is open.** The tick says why (the title stays where it was
  tapped). The cost: a player with the legend open has no sign that a ranking exists.

## Ideas from other games (not scored)

- **Hearts of Iron IV** keeps naval invasions in the same list as its other orders at the screen's edge, never over the
  map's legend or mode keys; a phone's landings as a row above the news would end R88-N1 and R88-N2 together.

## Strengths (verified)

- **Batch 55 fixes each of run 87's cases on its own probe, and the page's boxes at the five supported sizes lie on
  nothing in the plain views:** 5 sizes × 6 map modes folded, the opened legend upright, panels, God Mode and a
  rotation, 0 overlaps but the two with the landings' bar.
- **A world that runs is the seed's world:** eleven running games ended at the headless hash of their tick, one stalled
  for 20 s among them, and plain 1938 repeats its 20-year hashes for the tenth run.
