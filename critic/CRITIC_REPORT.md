# Critic report, run 87 (focused): Batch 54 (R200 to R202), on `bbf47bca`

## The run

- **Mode: focused** (ADR-1138: every run).
- **Commit judged:** `bbf47bca2f55ae024291361f85fe5db530005c26`, HEAD at the start (`critic/c87_commit.txt`).
- **Last report:** run 86, focused, on `bd85eb10` (the release check of release-2026-11-19).
- **Time:** 20:00 to about 21:25 by the machine's clock.
- **Left out for time:**
  - **Run 86's lane E2 cases not re-run on HEAD:**
    - `dirHand 68957` (390 × 844) and `phoneTicker 85903`.
    - `deathTitle 7019` at 844 × 390, and `deathTitle 85905`.
    - `trackRows` 1941 and 1949, and `rw2 85965`.
    - `bannerRank 85901`, `bannerFlip 85903`, and `tlDead` on 32019's save.
    - New seeds 87941 to 87961 stood in for some of them (Stats and history). The page diff does not touch History or the
      ticker.
  - **The kept `heroPop 85905` was not re-run.**
  - Not done: R200 in a running game on a touch desk.
  - Not done: the editor and God Mode at a narrow desk with the legend opened. The 760 × 800 monkey covered them only
    by chance.

### What changed since run 86

- `git diff --stat bd85eb10 HEAD -- src/sim data public/data` is empty, so the sim is unchanged.
- **The page diff:**
  - `src/ui/MapLegend.tsx`, `src/ui/usePhone.ts`, `src/app/App.tsx` and `src/app/style.css` (R200: a desk of 800 px or
    less folds the legend).
  - `src/ui/RelationsPanel.tsx` (R201: the empty graph says so).
  - `src/ui/WarBanners.tsx` (R202: the row on the bar's centre).
- **Sim unchanged, carried (ADR-917):** every bulk set run 86 carried.
- **The every-run jobs ran anyway** (ADR-1138):
  - Plain 1938 7019 ends at `ab927e1b` and 32019 at `c3520016` after 20 years, as in runs 79 to 86
    (`critic/c87_seed7019_save.log`, `critic/c87_seed32019_save.log`).
  - Checkers, `landingFuzz` and monkeys: see the Verdict.

### Scored afresh, and why

| Dimension | Why |
|---|---|
| `uiUxPolish` | touched: `MapLegend.tsx`, `usePhone.ts`, `WarBanners.tsx`, `RelationsPanel.tsx`, `App.tsx`, `style.css` |
| `diplomacyWarDepth` | touched: `RelationsPanel.tsx` (R201), and `App.tsx` and `style.css` |
| `statsHistory`, `godMode`, `editorScenarios` | touched: `App.tsx` and `style.css` |
| `performance` | `src/` changed: the chain, run alone |
| `emergentDynamics`, `stability` | **the rotation** |

- **How the rotation was worked out:** run 86's JSON has no `fresh` record, so this run rebuilds it from the reports.
  - Run 85 (full, `a9736eb5`) scored every dimension afresh but `performance`.
  - Run 86 (`bd85eb10`) scored `mapVisuals`, `diplomacyWarDepth`, `statsHistory`, `uiUxPolish` and `performance`.
  - Of the dimensions this diff does not touch, seven were last fresh in run 85: `emergentDynamics`, `stability`,
    `semanticZoom`, `naval`, `tanks`, `aircraft` and `aiNukes`. In DIMENSIONS order the first two are `emergentDynamics`
    and `stability`.
- **Carried:**
  - `mapVisuals`: from run 86. The legend is under `src/ui/`, so it touches `uiUxPolish` by the table.
  - `semanticZoom`, `naval`, `tanks`, `aircraft` and `aiNukes`: from run 85, with the sim unchanged.

### Setup

- **HEAD's build:** `critic/c87_dist` (`sh critic/scripts/c87_build.sh`, build exit 0, replay starts copied from
  `critic/c85_starts`), served on 127.0.0.1:5421.
- **Run 86's build** (`critic/c85b_dist`, `bd85eb10`) was served on 5422 for one case only. The chain's QHD and 4K
  frame means read about 1.3 fps under run 86's, so `critic/scripts/c87_pfAB.sh` ran that case on both builds, A B A B,
  alone after the chain.
- **Order:**
  1. The sim jobs: `c87_long.sh` (the 20-year saves, `landingFuzz --seeds 15 --first 87101`, six checker runs).
  2. The page lanes at the same time:
     - `c87_laneA.sh`: run 86's R86-N1, R86-N2 and wide-desk cases.
     - `c87_laneB.sh` and `c87_laneE.sh`: run 86's lane G, lane K and lane E2 cases, on the same seeds.
     - `c87_laneC.sh`: God Mode, the editor and History on new seeds 87xxx.
     - `c87_laneD.sh` and `c87_laneW.sh`: the rotation's cases.
     - `c87_laneM.sh`: the monkeys.
     - My new probes.
  3. `c87_chainPerf.sh`, gated on every lane's done file. It started at 20:32:44 with no other job of mine running.
- **New scripts:**
  - `critic/scripts/c87_legendOpen.mjs`: R200 off its case. The folded legend is opened on a narrow desk in six modes at
    four sizes: is the row recounted, who covers whom, and what a widen-and-back and a nudge do.
  - `critic/scripts/c87_legendShot.mjs`: one picture of that, before and after a resize round trip.
  - `critic/scripts/c87_rowJitter.mjs`: R202 off its case, in a running game. The row's centre is read every 100 ms for
    40 s at four desk sizes in two modes.
  - `critic/scripts/c87_scan.mjs`: page errors in every output of this run.
- **At the end:** both preview servers (5421, 5422), every browser and every job I started were stopped by process, and no
  listener is left on either port. The idle preview on 4174 is not mine and was left alone.

## Verdict

**Batch 54 fixes its three cases:**
- **R200 (R86-N2):** `c86_modeRow` 85901 (sea control, air control, fallout) and 84901 (all five modes) give `fit0` [],
  `stale` [] and `covering` [] in every mode (`critic/c87_mr_*.log`).
  - Run 86 had no war at 620 to 740 px in three modes.
- **R201 (R86-N1):** `c86_relSaid 84903 400` gives `empty` [] at 568, 844 and 1600 px. With every kind hidden the footer
  reads "Truces hidden · No ties of these kinds." (`critic/c87_rs_84903_400.log`).
- **R202 (the design objection):**
  - `c86_deskAttack 84901 400 wide`: 0 px off the centre at 1600, 1920 and 2560 px in all 11 modes, with three banners.
  - At 1280 px: 16 to 44 px off in the political modes (three banners), and 0 px in the sea, air and fallout modes (two
    banners), as R202's tick says (`critic/c87_da_84901_400.log`).

**One blocking issue: R87-B1 (R200 off its route).** On a desk of 800 px or less, the legend R200 folds lies over the
war row once the player opens it. The row is not counted again when the legend opens, which contradicts R197's ticked
"recounts when the band moves". In the fallout mode, the row stays half under the legend even after a full recount
(Blocking issues).

**The rule checkers on new seeds:** 6 runs of five years each, 0 broken.
- `diploInvariants`: 87001, 87005 (heroes) and random 87003.
- `worldInvariants`: 87051, 87053 (heroes) and the random world 87055.
- Evidence: `critic/c87_diploinv_*.log`, `critic/c87_wi_*.log`.

**`landingFuzz --seeds 15 --first 87101`:** 0 of 90 runs broken, `slowClick` included (`critic/c87_landingFuzz.log`).

**Monkeys:** four on new seeds, heroes on, 1,020 s in all, 0 page errors, none hung, and the tick moving at the end.
- 1600 × 900, 390 × 844 touch, 844 × 390 touch, and 760 × 800, a narrow desk with the folded legend.
- Evidence: `critic/c87_monkey.*.log`.

**Page errors:** 0 in all 145 outputs of this run (`node critic/scripts/c87_scan.mjs`).

**A new non-blocking issue:**
- **R87-N2 (R202's rule in a running game):** at 1280 × 720 and 1100 × 800, the row jumps 44 px sideways when a war on it
  changes, though the window does not.

**Scores:**
- `uiUxPolish` is 7: it would be 8 without R87-B1, as run 83 scored R83-B1.
- Every other dimension is 8.

## Scores

### Map visuals and readability: **8** (carried from run 86)
- In passing: R87-B1 is a legend over the war row. It is scored under `uiUxPolish`.

### Diplomacy, war, alliances, puppets, revolts: **8** (scored afresh: R201; `App.tsx`, `style.css`)
- **Checkers:** 6 runs on new seeds, 0 broken (Verdict).
- **R201 on its case and off it** (`critic/c87_rs_84903_400.log`):
  - At 568 × 320, 844 × 390 and 1600 × 900, hiding each kind and showing it again names it each time.
  - With all kinds hidden, the footer says "Truces hidden · No ties of these kinds.", and at 1600 px "… · 98 nations
    with no tie shown are left out".
  - The footer is never cut and never leaves the panel.
- **Run 86's relations cases on HEAD, the same as run 86:**
  - `relSide 84903`: `withBad` 1, `withDead` 1, `minGraph` 123 (`critic/c87_rsd_84903_400.log`).
  - `relFoot 84903`: inside the panel at all 33 steps (`critic/c87_rf_84903_400.log`).
  - `graphSize 68901 568 320`: 123 px with 5 names, median 13 px (`critic/c87_gs_68901_568_320.log`).
- **The war's rules in a forced war** (`fw2_forcewar 87935`, `critic/c87_fw2_forcewar.87935.log`): the alliances and
  sides read as expected, with 0 errors.
- **Not 9:**
  - At 1600 px, the empty graph's footer says both "No ties of these kinds." and "98 nations with no tie shown are left
    out". The second line is redundant when nothing is shown.
  - Kept from run 86: a kind's line replaces the selected nation's name, and R196's 13 px graph jump.

### Emergent world dynamics: 8 (carried) → **8** (scored afresh: the rotation)
- **A 12-year page watch on a new seed** (`long_watch2 87943`, plain): `ok []` and 58.8 to 60 fps each year
  (`critic/c87_long_watch2.87943_12__plain.log`).
  - By 16 January 1950 France holds a band across West and Central Africa.
  - Three wars are on the row: Japan and China, France and a "Free Bamingui-Bangoran Prefecture", and the United States
    and Britain (`critic/shots/c85lwplain_87943_y12_world.png`).
  - At 250 m/px, a French and a rebel division meet on a burning front with an order arrow
    (`critic/shots/c85lwplain_87943_zoom_00250.png`).
- **No runaway:** `topArea 87097` over 25 years ends with France at 20.0 %, the Soviet Union 19.9 % and the United
  States 10.4 %, with 70 nations living (`critic/c87_toparea_87097.log`).
  - France leaps from outside the top five to 16.4 % in year 8, the year Canada (6.84 %) leaves the top five and the
    United States grows from 6.97 to 9.76 %.
- **`farConquests`:** 30.2 capitals taken per 100 nations in two years, 8.0 of them far (`critic/c87_farc.log`).
  - Run 85 had 26.1 and 9.8, on other seeds (85161 to 85169), so the two are not compared.
- **A 3-nation world (`x_few 87403`):** 2 wars in year 1, then none in years 2 and 3 (`critic/c87_x_few.87403_3_3.log`).
- **Not 9:**
  - 87097's last ten years are nearly still. The top five hardly move from year 16 to 25 (France 19.86 to 19.98 %), and
    the first three change place 3 times in 25 years against 85097's 9 (new seeds, not compared).
    - Brazil's and Australia's areas stand still for 18 years each.
    - A world that settles into two blocs of 20 % for a decade is less worth watching than its first half.
  - A 3-nation world falls quiet after year 1.

### God Mode: **8** (scored afresh: `App.tsx`, `style.css`)
- **`a_god_nuke 87917`:** a hydrogen bomb on Paris.
  - The alert reads "3,329,000 civilians killed; 47,440 men and 162 guns lost" with Go to, and the cloud stands in its
    ring (`critic/shots/c85a_87917_14_paris_h_2h.png`). The toll is the same as on run 85's 85917: on day one it comes
    from Paris alone.
- **Tools, all exit 0 with 0 page errors** (`critic/c87_laneC.out`):
  - `q_god_tools 87919`: Prague razed is named in the ticker.
  - `fw2_forcewar 87935`.
  - `undo2 87211`: nuke, revolt, nation, city and raze, each undone.
  - `godpeace 1942 JAP`: says why the replay ends.
- **Not 9:**
  - The ring still reads "Pari" (R172) in the shot above.
  - With God Mode on at 1600 px, the war row, the God toolbar and the bar stack in the bottom 90 px. The row also lies
    over the "Burgos" label.

### Editor and scenarios: **8** (scored afresh: `App.tsx`, `style.css`)
- **`x_editor 87443`** paints three cells to Germany, undoes, redoes, exports 591,880 bytes, and loads the file back with
  the paint (`loaded owners`) (`critic/c87_x_editor.87443.log`).
- **`g_editor 87921`:** fleets are placed for Germany and Britain with no refusal, and the nuclear rows by kind read
  right (`critic/c87_g_editor.87921.log`).
- **`os2_scen`:** the standoff file is offered and loads (`critic/c87_os2_scen.*.log`).
- **The page's save (`saveload_page 87937`):** `same` and `same2` are true.
- **Continue (`x_continue 87415`):** `sameAfter` true.
- **Not 9:** as in run 85.

### Stats and history: **8** (scored afresh: `App.tsx`, `style.css`; lane E2's cases again on the same seeds)
- **28 cases of `c87_laneE.sh` and lane C's History cases, all exit 0 with 0 errors.**
- **Same seeds as run 86, compared:**
  - `bannerFlip` 57901, 58901 and 57903 give 8, 4 and 5 changes, the same as run 86. 57901's shortest tenure is
    1017 ms both times.
  - `bannerRank 57901`: taking Nationalist Spain puts its war first, and releasing it gives back the row as before.
  - `dirHand` on 59955 (390 × 844 touch) and 85955 (desk): every act hands the camera back, with `cutsAfterAct` 0 and
    the camera moved 0 px.
  - `deathTitle 7019` at two sizes, `trackRows 1940`, `tlDead` at two sizes, `phoneTicker 64903`, `bannerHourly`,
    `bannerLoad` at days 90 and 150, `tlMore`, `p_phone` and `bannerOwn 1942 GER`: `errors` [].
- **New seeds:** `timeLapse` 87941 and 87945 (390 × 844), `tlMonths 87947` and `histPlace 87961` give `errors` [].
  - The time-lapse bar reads "Play from January 1938 … February 1939" with its slider, clear of the war row
    (`critic/shots/c85tl_head_87941_1600x900_7playing.png`).
- **Not 9:** `trackTexts` still reads 65 of 168 track rows as bare notes (sim unchanged, carried).

### UI/UX and polish: 8 → **7** (scored afresh: R200, R201, R202; R87-B1 blocking)
- **Batch 54's cases are fixed on their own routes (Verdict).** This would be 8 without R87-B1.
- **Run 86's kept cases on HEAD, the same figures:**
  - `deskRow` on 84901, 85901, 85903, 85905 and random 85965: `fit0` [], `stale` [], `overflow` [] and `covering` [] at
    every step (`critic/c87_dr_*.log`).
  - `rowShot 84901` ×5: `overflow` 0, `under` [].
  - `crossWidth` 85901 and 84901: 0 stale and 0 overflow steps, with the same `deskCut` as run 86 (5 and 3).
  - `deskFit 68901`: 0 covered, "+2" clickable.
  - `moreClick` at 1024, 620 and 640: opened.
  - `phoneRow` ×2: `stale` 0, p95 16.8 and 16.7 ms.
  - `phoneToDesk` ×3: identical to run 86 (`critic/c86_pd_*_5411.log`).
  - `rotate`: 0 stale.
- **R200 off its case:** `c87_legendOpen 84901 400` at 700 × 800, 780 × 800, 760 × 560 and 640 × 520, in six modes
  (`critic/c87_lo_84901.log`).
  - Folded, the legend leaves the row a war in every case.
  - **Opened, it covers the banner (R87-B1).**
  - The toggle's click does not reach the map: the selection is unchanged.
- **R202 in a running game:** `c87_rowJitter 87601 300` (`critic/c87_rj_87601.log`).
  - Of 8 cases of 40 s, 5 hold the row still.
  - The other 3 move it sideways 24 to 44 px, 4 times in all, when the war in a slot changes (R87-N2).
- **What the bar needs:** `node critic/scripts/c87_legendOpen.mjs 84901 400` and `c87_legendShot.mjs 84901 400 700 800
  fallout` must give `legendOverRow` 0 in the opened and back states, at every size and mode. R200's case must stay as
  now.
- **Not 9:** R87-B1, R87-N2, and R192 (kept).

### Performance: **8** (scored afresh: `src/` changed; the chain run alone)
- **The run:** `sh critic/scripts/c87_chainPerf.sh`, from 20:32:44 to 20:58:27, with no other job of mine running. Every
  stage exits 0 (`critic/c87_pf.status`). It is compared with run 86's chain (`critic/c85_*.log`).
- **The tick of seed 99 over five years:**
  - Plain: 1.833 ms mean, hash `ca4700f1` (`critic/c87_tick99.log`). Run 86: 1.851 ms, the same hash.
  - With heroes: 1.646 ms, hash `494ed033` (`critic/c87_tick99h.log`). Run 86: 1.645 ms, the same hash.
- **Frames on 7019's year-20 world, at the battle spot, from 3,000 to 30 m/px in both looks** (`critic/c87_pf_lookfps*.log`,
  summed by `node critic/scripts/c86_pfsum.mjs`):

  | Size | Least mean fps | Highest p95 | Worst frame | Run 86 |
  |---|---|---|---|---|
  | 1600 × 900 | 59.0 | 18.2 ms | 114 ms | 58.9, 18.2, 123 |
  | 2560 × 1440 | 57.6 | 18.2 ms | 124 ms | 58.9, 18.3, 116 |
  | 3840 × 2160 | 57.5 | 18.4 ms | 114 ms | 58.8, 18.3, 148 |
  | With heroes (run 79's save) | 57.9 | 18.4 ms | 113 ms | 59.1, 18.2, 120 |

- **The QHD and 4K means fell by about 1.3 fps, evenly across every tier,** the 3,000 m/px world view included, where the
  page diff draws nothing new.
  - **A/B on the same world, alone after the chain** (`critic/scripts/c87_pfAB.sh`, `critic/c87_pfab_*.log`):

    | Arm | Run 86's build (5422) | HEAD (5421) |
    |---|---|---|
    | 1 | 58.8 fps least mean, p95 18.1, worst 125 | 58.8, p95 18.5, worst 127 |
    | 2 | 59.1, p95 18.3, worst 128 | 59.1, p95 18.1, worst 123 |

  - Both builds give the same figures, so the chain's 57.5 to 57.6 was the machine at that moment, not R200 to R202. It
    moves no score (ADR-917).
  - The row also makes 0 mutations at rest at 640, 700 and 1280 px (`critic/c87_da_84901_400.log`, "idle"). The R202
    measure does not run each frame.
- **`lookFps 7019`:** forced 59.0 to 59.8 frames/s at every tier (least 58.0), and a draw of 0.8 to 2.8 ms
  (`critic/c87_lookfps.log`). Run 86: 58.7 to 59.7.
- **The individual tier, `x_indfps 64111`:** 59.3 to 60 fps, p95 16.7 to 16.8 ms, with 6,246 individuals drawn at Max
  speed (`critic/c87_xi.log`). Run 86: 59.1 to 59.9.
- **Touch (`tm_touch`):** 59.6 fps with 266 ticks/s and nothing selected (`critic/c87_tm_touch.alone.log`). Run 86: 59.1
  and 267.
- **A 12-year watch on the page alone (`long_watch2 64945`, heroes on):** 59.1 to 60 fps each year, `ok []`
  (`critic/c87_lw_64945_alone.log`). Run 86: 59.1 to 59.8.
- **Run 79's 7019 year-20 save** loads and runs a year at 1.871 ms a tick, ending at hash `07e768a6` as in runs 81 and 86
  (`critic/c87_loadold_7019.log`).
- **The time-lapse of 20 years** plays with `errors` [] (`critic/c87_tm_lapse20.log`).
- **Not 9:**
  - The worst single frame at the battle spot is still 113 to 128 ms at every size, on both builds.
  - The battle spot's least means sit about 1 fps under 60 at QHD (58.8 to 59.1 on both builds).

### Stability: 8 (carried) → **8** (scored afresh: the rotation)
- **0 page errors** in 145 outputs. The four monkeys ran 1,020 s with 0 errors and never hung, and the page answered
  throughout (`critic/c87_monkey.*.log`).
  - The 760 × 800 monkey ran on a narrow desk, where the folded legend's toggle is among the buttons it clicks.
  - It made 677 UI acts and 326 clicks, and the tick went from 153 to 11,355.
  - The 390 × 844 monkey's tick falls back to 0 several times. Its URL shows why: it chose a Large map in the settings
    (`size=L`), which starts a new world. This is not a fault (`critic/c85_mky_87811_390x844_touch.json`).
- **Determinism:**
  - `workerDeterminism 87059` (a new seed) ends at `84e44286` on all four arms (plain, quiet, start, every)
    (`critic/c87_wd_87059.log`).
  - Plain 1938's 20-year hashes repeat runs 79 to 86: `ab927e1b` and `c3520016`.
  - The page's save and load (`saveload_page 87937`) and Continue (`x_continue 87415`) give the same state.
- **Rules:** 6 checker runs and 90 `landingFuzz` runs on new seeds, 0 broken.
- **Not 9:** a stale row when the legend opens (R87-B1, scored under `uiUxPolish`) is a missed recount in the page
  layer.

### Semantic zoom to unit level: **8** (carried from run 85; sim and render unchanged)
- In passing: at 250 m/px in 1950, divisions on a burning front read with their names and an order arrow
  (`critic/shots/c85lwplain_87943_zoom_00250.png`).

### Naval warfare: **8** (carried from run 85; sim unchanged)
- In passing: `landingFuzz` on 15 new seeds, 0 of 90 broken.

### Tanks: **8** (carried from run 85; sim unchanged)

### Aircraft: **8** (carried from run 85; sim unchanged)

### AI nuclear use: **8** (carried from run 85; sim unchanged)

## Blocking issues

1. **R87-B1 (UI, a desk of 800 px or less with the folded legend opened; R200 off its route): the opened legend lies
   over the war row's banner, and the row is not counted again.**
   - **On opening, the row is not recounted** (`critic/c87_lo_84901.log`).
     - At 700 × 800, the legend covers 247 sampled points of the row in sea control, 285 in air control, 329 in fallout
       and 89 in puppets.
     - At 780 × 800 it still covers 121 to 203 points in the sea, air and fallout modes.
     - Picture: `critic/shots/c87lo_84901_d400_700x800_seaControl_open.png`. "Italy & 3 +33" sits under "Sea control".
     - **Not a timing artefact:** run alone after every other job, with 4 s after the click, the figures are the same:
       fallout 329, sea control 247 (`critic/c87_ls_84901_700_*_w4000.log`).
   - **After a resize** (1280 px and back), the row is recounted:
     - In sea control, air control and puppets it falls to "+5" alone. This is R86-N2's symptom, with the legend open.
     - In fallout at 700 × 800 it keeps its banner, still half under the legend: 193 points
       (`critic/c87_ls_84901_700_fallout.log`, `critic/shots/c87ls_84901_700x800_fallout_back.png`, where "United Ki…
       Italy" is cut by the legend's box).
   - **The opened state is kept** across a widening past 800 px and back (`back open true`). A player who opened it once
     meets the covered row again after any resize.
   - **Fix:** recount the row when the legend opens or closes (its box is one of the band's walls). Never let the free
     band's measure miss a box that overlaps the row's height, which is fallout's case.
   - **Against run 86's build:** its legend never folded. At 700 × 800 its row covered 3 sampled cells of the fallout
     legend, and in sea and air control it showed "+5" alone with nothing covered (`critic/c86_mr2_84901_5411.log`).
     HEAD with the legend open covers 329 cells, and 193 after a recount.
   - **Why it blocks,** by R83-B1's test ("the claim holds on its own route … and not on another"):
     - R197's tick says the desk row "recounts when the band moves". Opening the legend moves the band's right wall (the
       legend grows from its title to its full box), and the row is not counted again.
     - R200's tick says the free band is measured "whatever the row holds" and that the row lies "over nothing". After a
       full recount in fallout, the band measure still puts the banner half under the legend.
     - R200's own case opens and closes the legend, but never reads the row while it is open.
     - **Who meets it:** every player on a half-screen desk who clicks the folded legend to read it, which is the one
       thing the fold asks of them. It is commoner than R83-B1's narrow-and-widen route, and run 83 blocked on that.
     - It is not R86-N2's case. There, R197's band claim was true and the band was only too narrow. Here the recount
       claim is false, and the banner is drawn under a box.
   - **Seen fixed when:**
     - `node critic/scripts/c87_legendOpen.mjs 84901 400` gives `rowOverLegend` 0 and `legendOverRow` 0 in the `opened`
       and `back` states, at every size and mode, with `nudged` equal to `shown`.
     - `WAIT=4000 node critic/scripts/c87_legendShot.mjs 84901 400 700 800 fallout` gives `legendOverRow` 0 in both
       states.
     - `c86_modeRow 84901 400 800` stays at `fit0` [] and `covering` [] (R200's case).

## Non-blocking issues (prioritised)

1. **R87-N2 (UI, a desk of about 1100 to 1366 px, a running game; R202's rule): the row jumps sideways when a war on it
   changes.**
   - `c87_rowJitter 87601 300` (`critic/c87_rj_87601.log`), 40 s at Speed ×5:
     - At 1280 × 720 in the political mode, the row moves 44 px off the centre and back twice, with the same count
       (3 → 3). Only the war in slot 2 changed (wars 15 → 13, then 13 → 16).
     - The row is off the centre 40 % of the time.
     - At 1100 × 800 political it moves 44 px; at 1366 × 768 sea control, 24 px.
   - The page shows the row at the centre or in the band's middle depending on the names' lengths, so it moves when a
     name changes.
   - **Fix:** decide centre or band from the row's widest case (the band's width), not from the banners shown now; or
     keep the side the row stood on while the count holds.
   - **Seen fixed when:** `c87_rowJitter 87601 300` gives `moves` 0 in every case where `countCh` is 0.
2. **The relations footer at 1600 px with every kind hidden** says "No ties of these kinds." and "98 nations with no tie
   shown are left out" together. The second line says nothing new (`critic/c87_rs_84903_400.log`).
3. **Kept from run 86:** the graph's 13 px jump (R196), `heroPop` on 85905, and R172, R192 and ADR-1111.

## Run 86's cases re-run

| Run 86 case | Run 86 (`bd85eb10`) | HEAD (`bbf47bca`) | Evidence |
|---|---|---|---|
| R86-N2 `c86_modeRow 85901` sea, air, fallout | `fit0` 620 to 760 | **fixed**: `fit0` [], `covering` [] | `critic/c87_mr_85901_*.log` |
| R86-N2 `c86_modeRow 84901` five modes | `fit0` 620 to 720 in three | **fixed** | `critic/c87_mr_84901_*.log` |
| R86-N1 `c86_relSaid 84903` | "Truces hidden" on an empty graph | **fixed**: `empty` [] at 3 sizes | `critic/c87_rs_84903_400.log` |
| Non-blocking 3: `c86_deskAttack 84901 wide` | 24 to 44 px off at 1280, moving with the mode | 0 px at 1600+; 1280 as R202 says | `critic/c87_da_84901_400.log` |
| `deskAttack` dpr, hover, idle | no fewer, no stale | the same (`dpr summary` all []) | `critic/c87_da_84901_400.log` |
| `deskRow` ×5 | `fit0` [] | the same | `critic/c87_dr_*.log` |
| `rowShot`, `crossWidth` ×2, `deskFit`, `moreClick` ×3 | as run 86 | the same | `critic/c87_{rw,cw,df,mc}_*.log` |
| `relSide`, `relFoot`, `graphSize` | bad 1, dead 1, 123 px | the same | `critic/c87_{rsd,rf,gs}_*.log` |
| `phoneRow` ×2, `phoneToDesk` ×3, `rotate` | 0 stale, p95 16.7 | the same | `critic/c87_{pr,pd,rot}_*.log` |
| Lane E2 (bannerFlip ×3, bannerRank, dirHand ×2, …) | exit 0, figures as listed | the same figures | `critic/c87_laneE.out` |
| Performance chain | tick 1.851 ms `ca4700f1`; QHD 58.9 fps | tick 1.833 ms `ca4700f1`; QHD 57.6 in the chain, 58.8 to 59.1 in the A/B on both builds | `critic/c87_pf.status`, `critic/c87_pfab_*.log` |
| 20-year hashes 7019, 32019 | `ab927e1b`, `c3520016` (carried) | run again: the same | `critic/c87_seed*_save.log` |
| Checkers, `landingFuzz` | 12 runs 0 broken (fuzz carried) | 6 runs and 90 fuzz runs, 0 broken | `critic/c87_*inv*.log`, `critic/c87_landingFuzz.log` |

## Design objections (none blocking)

- **R200 folds the legend on every desk of 800 px or less, in every mode,** including the political mode, whose legend is
  two lines and never crowded the row there (R197 had fixed it).
  - A player on a half-screen desk now has to click to read the political legend's two lines.
  - Folding only the wide legends (sea, air, fallout), or folding when the band is short, would cost less.

## Ideas from other games (not scored)

- **Europa Universalis IV** keeps its map-mode legend inside the map-mode button's tooltip. The legend never sits in the
  bottom band at all, which would end R86-N2 and R87-B1 together.

## Strengths (verified)

- **Batch 54 fixes all three of run 86's cases on their seeds, and keeps every other case of run 86's figures.** That is
  the row on five worlds, phones, rotation, relations and lane E2, the same figures to the banner.
- **The world holds its rules:** 6 checker runs, 90 landing runs and four monkeys on new seeds, with 0 broken and 0 page
  errors. Plain 1938 repeats its 20-year hashes for the ninth run.
