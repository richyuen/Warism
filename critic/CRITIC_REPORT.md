# Critic report, run 86 (focused): run 85's unfinished parts and Batch 53 (R197, R198), on `bd85eb10`

## The run

- **Mode: focused.** The spawning message asks for no full run. Its first job is ROADMAP R199: finish what run 85 (full,
  incomplete, on `a9736eb5`) left out, namely lane E from its 7th case and the performance chain.
- **Commit judged:** `bd85eb1084e11cb3c208ce8c9a78345bb86e1ff0`, HEAD at the start.
- **Last report:** run 85, full but incomplete, on `a9736eb5`.
- **Time:** 17:25 to about 18:35 by the machine's clock.
- **Left out for time:** nothing that the spawning message or R199 asks for. Lane G, lane E2 and the performance chain all
  ran to the end, every stage exiting 0.
  - Not done: `landingFuzz` on new seeds, and the heroes' and sea probes. The sim is unchanged, so run 85's figures carry.
  - Not done: R197 in a running game in a non-political mode.
  - Not done: a figure-by-figure read of lane E's new-seed cases. They are judged by exit code and `errors` [] only.

### What changed since run 85

- `git diff --stat a9736eb5 HEAD -- src/sim data public/data tools` is empty.
- The page diff is `src/ui/WarBanners.tsx` (R197), `src/ui/RelationsPanel.tsx` and `src/ui/i18n/en.json` (R198).
- So run 85's sim results carry: its checkers, `landingFuzz`, sea battles, nukes and the 20-year hashes.
  - **Sim unchanged, carried (ADR-917):** every bulk set run 85 carried.
  - **Plain 1938 unchanged, carried (ADR-959):** run 85's 20-year saves of 7019 (`ab927e1b`) and 32019 (`c3520016`), and
    the sim is unchanged.

### Scored afresh, and why

- `mapVisuals` and `uiUxPolish`: the war row (R197).
- `diplomacyWarDepth` and `uiUxPolish`: the relations panel (R198).
- `statsHistory`: lane E's History and time-lapse cases, left out by run 85, ran this time. Some of them are judged by their
  exit code and errors alone; the Stats and history section says which.
- `performance`: run 85 carried it from run 84, and R199 asks for it afresh.
- **Every other dimension is carried from run 85**, marked "carried".

### Setup

- **HEAD's build:** `critic/c85b_dist` (`sh critic/scripts/c85_build2.sh`, build exit 0, replay starts copied), served on
  127.0.0.1:5411.
- **Run 85's build:** `critic/c85_dist` (`a9736eb5`), served on 5410 only for the cases whose figure moved (R86-N1, R86-N2).
  It was stopped after them.
- **Order, as the spawning message asks:**
  1. `c85_build2.sh`.
  2. `c85_laneG.sh` and `c85_laneE2.sh` together, all exit 0.
  3. My probes and checkers.
  4. `c85_chainPerf2.sh` alone on a quiet machine, started 18:00:39 with only the 5411 server running.
     - The first launch of the chain was stopped while it was still waiting on the lanes. Its lock was removed, and it was
       started again after my probes, so that nothing ran beside it.
- **At the end:** both preview servers, every browser and every job were stopped by process. No listener is left on 5410
  or 5411, and the chain's lock `critic/c85_perf.lock` is removed.
- **New scripts:**
  - `critic/scripts/c86_deskAttack.mjs`: R197 off its case.
    - It narrows from 1100 to 600 px at device scale 1, 1.25 and 1.5.
    - It tries four wide desks in all 11 map modes, sweeps the mouse over the map, and counts the row's mutations at rest.
  - `critic/scripts/c86_modeRow.mjs`: R197 in each map mode, from 1100 to 600 px and back, with a nudge and the legend's
    cells covered. `c86_modeShot.mjs` takes one shot of it.
  - `critic/scripts/c86_relSaid.mjs`: R198 off its case. It hides every kind in turn, shows them again, and taps a nation
    then a filter, at 568 × 320, 844 × 390 and 1600 × 900.
  - `critic/scripts/c86_laneK.sh`: run 85's named phone-row cases again. R197 now clears the row's inline `left` and
    `max-width` on every layout.
  - `critic/scripts/c86_checkers.sh` and `c86_checkers2.sh`: 12 checker runs on new seeds.
  - `critic/scripts/c86_scan.mjs`: page errors in every output of this run.

## Verdict

**Batch 53 fixes both of its cases:**
- **R197 (R85-N1):**
  - `c85_deskRow 84901 400 800` and `85903 700 900` give `fit0` [], `covering` [], `overflow` [] and `stale` [] at every
    step (`critic/c85b_dr_84901_400_800_5411.log`, `critic/c85b_dr_85903_700_900_5411.log`).
  - Run 85 had 0 banners from 620 to 660 px on 84901, and from 620 to 700 px on 85903.
  - The same holds on 85901, 85905 and the random world 85965 (`critic/c85b_dr_*_5411.log`).
- **R198 (R85-N2):** `c85_explore 84901 400` at 568 × 320 touch. Each filter tapped says its kind: "Wars hidden",
  "Alliances hidden", "Guarantees hidden", "Puppets hidden" and "Truces hidden", with the line counts as in run 85 (88, 99,
  111, 76, 102) (`critic/c85ex_84901_d400_c85b_5411.json`).

**No blocking issue.**

**The rule checkers on new seeds:** 12 runs, five years each, 0 broken.
- `diploInvariants`: 86001, 86007, 86005 (heroes), 86011 (heroes), and random diplomacy 86003 and 86009.
- `worldInvariants`: 86051, 86057, 86053 (heroes), 86059 (heroes), and the random world 86055 and 86061.
- Evidence: `critic/c86_diploinv_*.log`, `critic/c86_wi_*.log`.

**Page errors:** 0 in all 155 outputs of this run (`node critic/scripts/c86_scan.mjs`).

**Two new non-blocking issues:**
- **R86-N1 (R198's side effect):** with every kind hidden, the empty graph's footer says "Truces hidden" where run 85's
  build said "No ties of these kinds."
- **R86-N2 (R197's side effect):** in the sea-control, air-control and fallout map modes, a 680 to 760 px desk shows no war
  again. Run 85's build showed one there, over the legend's corner by a few px.

**Scores:** every dimension 8.
- `performance` is scored afresh from run 85's chain, run alone: 8, as in run 81.
- R199 is met: lane E's cases and performance are both scored afresh, not carried.

## Scores

### Map visuals and readability: **8** (scored afresh: R197)
- **Tested:**
  - Five `deskRow` routes on four 1938 seeds and the random world.
  - `c86_deskAttack 84901 400`: three device scales, four wide desks in all 11 modes, a mouse sweep, and the row at rest.
  - `c86_modeRow` on 84901 and 85901 in four modes on both builds.
- **Evidence for 8:**
  - **On a desk in the political mode, the war row now shows a war at every 20 px step from 1100 to 600 px.**
    - At 640 × 800: "United Kingdom & 13 ⚔ Italy & 3 +33" and "+4", with `overflow` 0 and nothing under it
      (`critic/c85b_rw_84901_400_620x900_640x800_683x768_700x800_768x1024_5411.log`).
    - At 1024 × 768 the row now holds two banners where run 85 had one (`critic/c86_pd_83903_*_5411.log`).
  - **Fractional scales lose nothing:** at device scale 1.25 and 1.5, from 1100 to 600 px, the row shows the same count as
    at 1. There is no stale fit, no overflow and no cover (`critic/c86_da_84901.log`, "dpr summary"). R197 dropped the
    overflow's 1 px tolerance, and this was the case where that could have hurt.
  - **No flicker where measured.** These are paused games only; a running game in a non-political mode was not tried.
    - Sweeping the mouse over 88 and 160 points of land and sea, in the political, sea-control and air-control modes at 700
      and 1280 px, leaves the row unchanged ("changes":0).
    - In the political mode at rest, the row has 0 mutations in 4 s at 640, 700 and 1280 px (`critic/c86_da_84901.log`).
- **Not 9:**
  - R86-N2: in the sea-control and air-control modes a 680 to 740 px desk shows no war
    (`critic/shots/c86mr_84901_d400_h800_seaControl_700.png`).
  - On a wide desk the row now sits in the band between the news and the legend, not over the bar's middle. At 1280 × 720 it
    is 44 px right of the centre in the political mode and 24 to 44 px left of it in the sea, air and fallout modes. So the
    row moves about 68 px sideways, and loses a banner (3 to 2), when the map mode changes (`critic/c86_da_84901.log`,
    "wide"; `critic/shots/c86da_84901_d400_wide_1280x720_political.png`).
  - The kept items of run 85: hero plates over labels (ADR-1111), and the ring over "Pari" (R172).

### Diplomacy, war, alliances, puppets, revolts: **8** (scored afresh: R198)
- **Checkers:** 12 runs on new seeds, 0 broken (Verdict).
- **R198 on its case (Verdict).** Off its case (`c86_relSaid 84903 400`, `critic/c86_rs_84903.log`):
  - At 568 × 320, 844 × 390 and 1600 × 900, hiding each kind and showing it again names it each time.
  - The footer is never cut and never leaves the panel or the view.
  - At 1600 px the line keeps its count, for example "Wars hidden · 26 nations with no tie shown are left out".
- **Run 85's relations cases on HEAD:**
  - `relSide 84903`: `withBad` 1, `withDead` 1, `minGraph` 123, as on run 85's HEAD (`critic/c85b_rs_84903_400_5411.log`).
  - `relFoot 84903`: the footer is inside the panel at all 33 steps (`critic/c85b_rf_84903_400_5411.log`).
  - `graphSize 68901 568 320`: 123 px with 5 names, as run 85 (`critic/c85b_gs_68901_568_320_5411.log`).
- **Not 9:**
  - R86-N1: the empty graph says "Truces hidden", not that it is empty
    (`critic/shots/c86rs_84903_d400_568x320_alloff.png`).
  - A kind's line replaces a selected nation's name in the footer: "Germany", then a tap on Wars gives "Wars hidden", while
    the nation stays selected. This is a small loss, not judged a defect.
  - The 13 px graph jump of R196 (kept).

### Emergent world dynamics: **8** (carried from run 85; sim unchanged)

### God Mode: **8** (carried from run 85; page diff outside it)

### Editor and scenarios: **8** (carried from run 85)

### Stats and history: **8** (scored afresh: lane E's History and time-lapse cases ran)
- **All 36 cases of `c85_laneE2.sh` exit 0, with 0 page errors** (`critic/c85_laneE2.out`).
- **Same seeds as run 81, compared:**
  - `phoneTicker 64903` and `bannerFlip` ×3 are identical.
  - `tlDead` on run 76's save differs by one hour of run (96 against 95).
  - `rw2 64965`, `bannerRank 57901` and `bannerHourly 57901` differ in small war-score and men figures, and in the row's
    order. These are page runs at game speed, not stepped, so they are not deterministic. For example, in `bannerRank`, 14
    banner-days of a quiet war were shown while a war with a battle was behind "+n", against run 81's 7 of about 440.
  - None of these differences moves a score.
- **New seeds (`timeLapse`, `tlMonths`, `histPlace`, `tlMore`, `rw2 85965`, `bannerRank 85901`):** judged by their exit
  code and `errors` [] only, not by each figure.
- **`trackRows` 1940, 1941 and 1949:**
  - 396 rows in 1940.
  - "30 August 1940 The Second Vienna Award to Hungary" is found. "alliance" and "Tripartite" are not found in 1940, as in
    run 80 (`critic/c85_trackRows.1940_365.log` against `critic/c80_trackRows.1940_365.log`).
- **`tlDead` on run 76's 7019 year-20 save** at 1600 × 900 and 390 × 844, and on run 85's 32019 save (28 dead nations):
  `errors` [] (`critic/c85_tlDead.*.log`).
- **`timeLapse` 85941 and 85945 (390 × 844), `tlMonths 85947`, `histPlace 85961`, `tlMore cell 85943`:** `errors` [].
- **`deathTitle`** at three sizes on 7019 and on 85905: "China fights to the death: no peace is made…", 7 to 8 lines, not cut,
  on screen (`critic/c85_deathTitle.*.log`).
- **Banners over time:**
  - `bannerFlip` on 57901, 58901 and 57903 gives the same figures as run 81 on the same seeds. For example, 57901 changes
    8 times with its shortest tenure 1017 ms (run 81: 1018) (`critic/c85_bannerFlip.*.log`, `critic/c81_bannerFlip.*.log`).
  - `bannerHourly 57901`: 2 changes, 0 of them back.
  - `bannerLoad 85901` at days 90 and 150: the row is the same across a load, with 0 changes in 72 h.
  - `bannerRank 85901`: 6 banner-days of a quiet war shown while a war with a battle was behind "+n", out of 415.
- **Not 9:** `trackTexts` still reads 65 of 168 track rows as bare notes (run 85, sim unchanged).

### UI/UX and polish: **8** (scored afresh: R197, R198)
- **Batch 53's two cases are fixed (Verdict).**
- **Run 85's kept cases hold on HEAD:**
  - `phoneRow` ×2: `stale` 0, `overflowSamples` 0, `under5` 0, p95 16.7 ms (`critic/c86_pr_*_5411.log`; run 85: the same,
    p95 16.8).
  - `phoneToDesk` ×3: the same counts on phones. Desks now show more banners, for example 2 where run 85 had 1 at 1024 × 768.
  - `rotate`: 0 stale (`critic/c86_rot_68901_400_GER_20_5411.log`).
  - `crossWidth 85901` across 600 and 601 px, and `84901` steps: 0 stale and 0 overflow steps.
  - `deskFit 68901` with a nation's panel opened and closed: 0 covered, "+2" clickable.
  - `moreClick` at 1024, 620 and 640: clicked and opened (`critic/c85b_*_5411.log`).
- **Lane E's page cases:**
  - `dirHand` ×4, on 59955, 68957 and 85955 at 390 × 844 touch and on a desk: each of the 6 acts hands the camera back
    (the director off after it, `cutsAfterAct` 0, the camera moved 0 px). Evidence: `critic/c85_dirHand.*.log`.
  - `phoneTicker` ×2, `p_phone` and `bannerOwn 1942 GER`: exit 0, with 0 errors.
- **Not 9:** R86-N1, R86-N2, the row off the bar's centre on a wide desk, and R192 (kept).

### Performance: 8 (carried) → **8** (scored afresh: run 85's chain, run alone)
- **The run:** `sh critic/scripts/c85_chainPerf2.sh`, from 18:00:39 to 18:26:17 on a quiet machine, with only the 5411
  server running. Every stage exits 0 (`critic/c85_pf.status`). It is compared with run 81, the last run to score this
  afresh.
- **The tick of seed 99 over five years:**
  - Plain: 1.851 ms mean, hash `ca4700f1` (`critic/c85_tick99.log`). Run 81: 1.834 ms, the same hash.
  - With heroes: 1.645 ms, hash `494ed033` (`critic/c85_tick99h.log`). Run 81: 1.639 ms, the same hash.
- **Frames on 7019's year-20 world, at the battle spot, from 3,000 to 30 m/px in both looks** (`critic/c85_pf_lookfps*.log`,
  summed by `node critic/scripts/c86_pfsum.mjs`):

  | Size | Least mean fps | Highest p95 | Worst frame | Run 81 |
  |---|---|---|---|---|
  | 1600 × 900 | 58.9 | 18.2 ms | 123 ms | 59.3, 18.3, 111 |
  | 2560 × 1440 | 58.9 | 18.3 ms | 116 ms | 59.4, 18.2, 121 |
  | 3840 × 2160 | 58.8 | 18.3 ms | 148 ms | 59.4, 18.2, 122 |
  | With heroes (run 79's save) | 59.1 | 18.2 ms | 120 ms | 57.8, 18.1, 113 |

- **`lookFps 7019`:**
  - Forced 58.7 to 59.7 frames/s at every tier (least 58.0), and a draw of 0.9 to 2.7 ms (`critic/c85_lookfps.log`).
  - Run 81: 59.2 to 59.9, with draws of 1 to 2.7 ms.
- **The individual tier, `x_indfps 64111`:** 59.1 to 59.9 fps, p95 16.7 to 16.8 ms, with 6,246 individuals drawn at Max
  speed (`critic/c85_xi.log`). Run 81: 59.5 to 60, p95 16.8.
- **Touch (`tm_touch`):** 59.1 fps with 267 ticks/s and nothing selected (`critic/c85_tm_touch.alone.log`). Run 81: 59.4 and
  267.
- **A 12-year watch on the page alone (`long_watch2 64945`, heroes on):** 59.1 to 59.8 fps each year and `ok []`
  (`critic/c85_lw_64945_alone.log`). Run 81: 58.6 to 60, with the same game speed year by year.
- **Run 79's 7019 year-20 save** loads and runs a year at 1.841 ms a tick, ending at hash `07e768a6` as in run 81 (1.810 ms)
  (`critic/c85_loadold_7019.log`).
- **The time-lapse of 20 years** plays from January 1938 to December 1957 with `errors` [] (`critic/c85_tm_lapse20.log`), as
  in run 81.
- **Not 9:**
  - The worst single frame at the battle spot is 116 to 148 ms at every size. That is no better than run 81 (111 to 122),
    and at 4K it is one frame worse.
  - Least means sit 0.4 to 0.6 fps (0.7 to 1 %) under run 81 at every size. The heroes' figure went up by 1.3 fps.
  - On the same hashes, the unchanged sim's tick reads 0.9 % (plain) and 1.7 % (run 79's save) slower than run 81.
  - With the sim unchanged, these figures are the machine's spread between runs, not a regression.
- **No change moves the score:** the page diff is the war row and the relations footer, and the tick and every frame figure
  stand within about 1 % of run 81.

### Stability: **8** (carried from run 85)
- In passing: 0 page errors in 155 outputs. The 12 checker runs end normally. The R197 row shows no render loop (0 mutations
  at rest).

### Semantic zoom to unit level: **8** (carried from run 85)

### Naval warfare: **8** (carried from run 85; sim unchanged)

### Tanks: **8** (carried from run 85; sim unchanged)

### Aircraft: **8** (carried from run 85; sim unchanged)

### AI nuclear use: **8** (carried from run 85; sim unchanged)

## Blocking issues

None.

**Why R86-N2 does not block,** by the test runs 82 and 83 blocked on (R82-B2, R83-B1: a ticked claim that holds only on its
own route):
- **R197's claim is the band**, "a desk's closed row takes the band free between the page's boxes beside it … the news,
  the legend". In the sea-control mode the row does take that band: 127 px between x 238 and x 373 at 700 px. The claim is
  true there. The band is simply too narrow for one sized banner.
- **What remains is R85-N1's own symptom** (no war on a narrow desk, non-blocking in run 85), in four of eleven modes and
  over 60 to 100 px more of width.
  - The old build showed a war there only by lying over the legend's corner, as it did at every width from 680 to 1020 px.
  - HEAD clears that cover, except in fallout at 680 to 720 px and air control on 84901 at 680 px.
- **No player quits over it:** it needs a half-screen desk and a non-default map mode, and "+n" opens the full list.
- **R86-N1** is footer wording, and is non-blocking.

## Non-blocking issues (prioritised)

1. **R86-N2 (UI, a desk 680 to 760 px wide in the sea-control, air-control or fallout map mode; R197's side effect): no war
   shown, "+5" alone.**
   - **`c86_modeRow`** (1100 to 600 px and back, with a nudge; `critic/c86_mr2_*_5411.log`, `critic/c86_mr2_*_5410.log`):

     | Seed, mode | HEAD: 0 banners at (px) | Run 85's build: 0 banners at (px) |
     |---|---|---|
     | 84901, sea control | 620 to 700 | 620 to 660 |
     | 84901, air control | 620 to 720 | 620 to 660 |
     | 85901, sea control | 620 to 720 | 620 to 660 |
     | 85901, air control | 620 to 740 | 620 to 660 |
     | 85901, fallout | 620 to 680, 740, 760 | 620 to 660 |
     | 84901, fallout | 620 to 660, 740 | 620 to 660 |
     | 84901, puppets | 620 | 620 to 660 |
     | 85901, puppets | 620 to 640 | 620 to 660 |

   - None of these are stale fits.
   - **Why:** R197 sizes the row by the band between the news and the legend, and in these modes the legend is 315 to
     356 px wide.
     - At 700 × 800 in the sea-control mode, the news ends at x 238 and the legend starts at x 373. The band is 127 px and
       the sized banner does not fit, so the row is "+5" alone.
     - Run 85's build showed "United Ki… ⚔ Italy" there, over the legend's rounded corner by about 3 sampled cells
       (`critic/shots/c86ms_84901_700x800_seaControl.png` against `critic/shots/c86ms_84901_700x800_seaControl_5410.png`).
   - **Political mode, the default, is fixed (Verdict).** The cover was a few px of a rounded corner.
     - In the fallout mode HEAD still covers 3 cells of the legend at 680 to 720 px.
     - In the air-control mode on 84901, it still covers 4 cells at 680 px.
   - **Fix:** in these modes let the row lie over the legend's empty lower-left corner as before, or move or shorten the
     legend when the row has no room. Or fall back to the phone's row (two short banners) when the band is under one sized
     banner.
   - **Seen fixed when:** `node critic/scripts/c86_modeRow.mjs 85901 400 800 seaControl,airControl,fallout` shows `fit0`
     no wider than the political mode's (none) and `covering` [].
2. **R86-N1 (Relations, every size; R198's side effect): with every kind hidden, the footer says "Truces hidden" (the last
   kind tapped) instead of "No ties of these kinds."**
   - HEAD: `critic/c86_rs_84903.log`, at 568, 844 and 1600 px.
   - Run 85's build said "No ties of these kinds." on the same step (`critic/c86_rs_84903_5410.log`).
   - The graph is empty and nothing on it says so (`critic/shots/c86rs_84903_d400_568x320_alloff.png`).
   - **Fix:** when no line is left, say both, for example "Truces hidden: no ties of these kinds."
   - **Seen fixed when:** `c86_relSaid 84903 400` gives `empty` [] at all three sizes.
3. **The row's place on a wide desk follows the legend** (R197): it is 24 to 44 px off the bar's centre, and moves about
   68 px sideways with one banner fewer when the map mode changes at 1280 × 720 (`critic/c86_da_84901.log`, "wide").
4. **Kept from run 85:** the graph's 13 px jump (R196), `heroPop` on 85905, and R172, R192 and ADR-1111.

## Run 85's cases re-run

| Run 85 case | Run 85 (`a9736eb5`) | HEAD (`bd85eb10`) | Evidence |
|---|---|---|---|
| R85-N1 `deskRow 84901 400 800` | `fit0` 620 to 660 | **fixed**: `fit0` [], `covering` [] | `critic/c85b_dr_84901_400_800_5411.log` |
| R85-N1 `deskRow 85903 700 900` | `fit0` 620 to 700 | **fixed** | `critic/c85b_dr_85903_700_900_5411.log` |
| R85-N1 `deskRow` 85901, 85905, random 85965 | `fit0` 620 to 660/680 | **fixed**: `fit0` [] | `critic/c85b_dr_*_5411.log` |
| R85-N1 `crossWidth 85901` 600/601 | 601: 0 banners, "+3" | 1 banner, 0 stale | `critic/c85b_cw_85901_*_5411.log` |
| R85-N2 `explore 84901` 568 × 320 | "Click a nation…" on every tap | **fixed**: "Wars hidden" and so on | `critic/c85ex_84901_d400_c85b_5411.json` |
| R194 `rowShot 84901` ×5 | `ov` 0, `under` [] | the same | `critic/c85b_rw_*_5411.log` |
| R195 `graphSize 68901` | 123 px, 5 names | the same | `critic/c85b_gs_*_5411.log` |
| R196 `relFoot 84903` | inside at all sizes | the same | `critic/c85b_rf_*_5411.log` |
| `relSide 84903` | bad 1, dead 1 | the same | `critic/c85b_rs_*_5411.log` |
| `moreClick` ×3, `deskFit 68901` | opened, 0 covered | the same | `critic/c85b_mc_*`, `critic/c85b_df_*` |
| `phoneRow` ×2, `phoneToDesk` ×3, `rotate` | 0 stale, p95 16.8 ms | 0 stale, p95 16.7 ms | `critic/c86_{pr,pd,rot}_*_5411.log` |
| Lane E, from the 7th case | not run | run, 36 cases, all exit 0 | `critic/c85_laneE2.out` |
| Performance chain | not run (carried) | run alone: tick 1.851 ms `ca4700f1`, frames 58.8 to 59.1 fps least mean | `critic/c85_pf.status` |
| Checkers, `landingFuzz`, bulk sets, 20-year hashes | 0 broken; `ab927e1b`, `c3520016` | sim unchanged, carried; 12 new checker runs 0 broken | `critic/c86_*inv*.log` |

## Design objections (none blocking)

- **Centring the desk's row in the band (R197) rather than on the page.** The row leaves the bar's axis and moves with the
  legend. A fixed centre with a band-limited width would read steadier.

## Ideas from other games (not scored)

- **Hearts of Iron IV** folds its map-mode legend to a single chip. A folded legend in the sea and air modes would free the
  row's room on a narrow desk (R86-N2).

## Strengths (verified)

- **R197 fixes run 85's narrow-desk row on all five worlds.** It holds at device scales 1.25 and 1.5, and does not flicker
  under a moving mouse or at rest.
- **The rules hold:** 12 checker runs on new seeds give 0 broken, and there are 0 page errors in 155 outputs.
