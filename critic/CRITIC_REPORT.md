# Critic report, run 89 (focused): Batch 56's blocking item (R209), on `f27f48f5`

## The run

- **Mode: focused** (ADR-1138: every run).
- **Commit judged:** `f27f48f5a56b369987e352fdcff9510fd112ae41`, HEAD at the start (`critic/c89_commit.txt`).
- **Last report:** run 88, focused, on `3e1ed78e`.
- **Time:** 03:30 to about 05:25 by the machine's clock (the bulk landing sets were due and took the last half hour).
- **The sizes** (ADR-1141): fresh scores rest on 393 × 659, 393 × 852, 734 × 343, 852 × 393 (touch) and 2560 × 1305.
  Run 88's named cases were re-run at their own sizes. A probe that takes no size (`an_ainuke`, `godpeace`, `god42`,
  `takescore`, `fw2_forcewar`) ran at its own 1600 × 900 or 1400 × 800.
- **Left out for time:**
  - **Of the bulk sets** (due: `src/sim/systems/capitals.ts` changed, so neither "sim unchanged", ADR-917, nor "plain
    1938 unchanged", ADR-959, carries them): Malta's 18 landings on the page and run 85's nuke-seed set were not run. The
    three headless sets ran whole (below). Nothing is marked carried.
  - A real hidden or background tab. `c89_longStep … hidden` only tells the page it is hidden (`visibilityState` and the
    event) before the step; Chromium's own throttling of a background tab was not driven.
  - Which other functions Chromium compiles wrongly, if any: only what a state hash shows on the seeds below was read.
  - The editor and scenarios, History and statistics, the UI and the zoom beyond run 88's named cases (carried).
  - `tests/e2e/longStep1938.spec.ts` itself was not run; its case was, by my own probes.

### What changed since run 88

- `git diff --stat 3e1ed78e HEAD -- src tests data public/data`: `src/sim/systems/capitals.ts` (37 lines: `enemyDistance`'s
  breadth-first loop writes its `tail` and `left` inline, no `reach` closure; R209, ADR-1143) and a new spec,
  `tests/e2e/longStep1938.spec.ts`. One line in SPEC §2.6. No page file changed.
- **Is the sim's course changed?** Not in Node, by everything read here:
  - the 20-year hashes of plain 1938: 7019 `ab927e1b`, 32019 `c3520016`, as in runs 79 to 88
    (`critic/c89_seed7019_save.log`, `critic/c89_seed32019_save.log`);
  - seed 99 over five years `ca4700f1`, with heroes `494ed033`, as run 88 (`critic/c89_tick99.log`, `critic/c89_tick99h.log`);
  - the replay's 54 yearly starts rebuilt on HEAD (`sh critic/scripts/c89_starts.sh`, `npm run saves -- critic/c89_starts`):
    54 of 54 the same bytes as run 85's (`critic/c89_starts.log`);
  - the bulk landing sets, each output line for line the same as the last set on the sim before R209 (the seconds
    stripped; `bash critic/scripts/c89_bulk.sh`, `bash critic/scripts/c89_bulkcmp.sh`): the 396 named
    `landingInvariants` setups against run 80's (`critic/c80_li`), 396 of 396; the 153 stuck-return runs against run
    81's (`critic/c81_sr`), 153 of 153; the 168 next-voyage runs against run 81's (`critic/c81_nv`), 168 of 168;
  - `fewNationWars 3 85401 6 10` (random worlds): the six lines of run 85's (`critic/c89_few3_85401.log`,
    `critic/c85_few3_68.log`).

### Scored afresh, and why

| Dimension | Why |
|---|---|
| `stability` | blocked in run 88 (R88-B1; at its bar, 7); touched: `src/sim/` |
| `diplomacyWarDepth`, `emergentDynamics`, `naval`, `tanks`, `aircraft`, `aiNukes` | touched: `src/sim/systems/capitals.ts` |
| `performance` | `src/` changed: the chain, run alone |
| `mapVisuals`, `godMode` | **the rotation**: of the dimensions the diff does not touch, `mapVisuals` is the oldest (run 86); the rest were all fresh in run 88, so the first in DIMENSIONS order, `godMode` |

- **Carried from run 88:** `editorScenarios`, `statsHistory`, `uiUxPolish`, `semanticZoom`.

### Setup

- **HEAD's build:** `critic/c89_dist` (`sh critic/scripts/c89_build.sh`, build exit 0), served on 127.0.0.1:5441; the
  replay starts rebuilt on HEAD's sim put in it before the 1938h cases ran.
- **Run 88's build** (`critic/c88_dist`, `3e1ed78e`) served on 5442, as the control for R88-B1: each long-step set ran on
  both builds at the same time.
- **Order:** the every-run sim jobs (`c89_long.sh`) and lane S (R88-B1) first; the page lanes (`c89_laneA.sh`, `B`, `E`,
  `X`: run 88's named cases; `C` God Mode, diplomacy and the page's saves; `N` naval; `T` tanks, aircraft, the AI's nukes;
  `V` map visuals; `W` a 12-year watch; `M` the monkeys; `S2`, `S3` the long step off its case); the headless cases
  (`c89_jobsH.txt`, by `c89_runH.sh` then `c89_runH2.sh`); the bulk sets (`c89_bulk.sh`) before and after the
  performance chain, paused for it; `c89_chainPerf.sh`, alone, from 04:28:49; then `c89_laneL.sh` (the cases of run 88
  the first lanes had left out, and `sh critic/scripts/c89_laneL.sh hand` for two re-runs made by hand).
- **New scripts:**
  - `critic/scripts/c89_longStep.mjs`: for each seed, N loads of the page (4 at once), one `step` of H hours each, the
    end hashes counted; a size, `EXTRA` (heroes) and a tab told hidden as options.
  - `critic/scripts/c89_closureLoops.mjs`: a coarse read of `src/sim` and `src/worker` for SPEC §2.6's new rule.
  - `critic/scripts/c89_bulk.sh`, `c89_bulkcmp.sh`, `c89_starts.sh`, `c89_scan.mjs`, `c89_crop.mjs`.
- **A probe's fault, mine:** `c86_deskAttack 84901 400` hit lane A's 900 s limit under this run's load (run 88: 600 s);
  run again with a longer limit it ends as run 88's (`critic/c89_da_again_84901_400.log`).
- **At the end:** both preview servers (5441, 5442), every browser and every job I started were stopped, and no listener
  is left on either port.

## Verdict

**R209 fixes R88-B1 on its case, shown on both builds side by side in this run. No blocking issue. Every score at its bar.**

- **R88-B1's four "seen fixed when", all four hold on HEAD:**
  - `c88_sameWorldMsgs 88901 400 12`: one end hash, `3723997852` (`critic/c89_swm_88901_400_12.log`).
  - `c88_sameWorldMsgs 88901 300 12`: one end hash, `4108155890` (`critic/c89_swm_88901_300_12.log`).
  - `npx tsx tools/diag/pageHash.ts http://127.0.0.1:5441 88901 1 76540321 10 3`: "10 of 10 runs equal to headless every
    year" (`critic/c89_pageHash_88901.log`; run 88: 3 of 10).
  - `c88_playHash 88901 9600 6`: "same as headless: 6 of 6" (`critic/c89_ph_88901_9600_6.log`).
- **The control, both builds at the same time** (`sh critic/scripts/c89_laneS3.sh`; seed 88901, one step of 9,600 hours,
  16 loads each, 4 at once): HEAD `3723997852` in 16 of 16; run 88's build `3723997852` in 15 and `1699438925` in 1
  (`critic/c89_ls_head_ctl_88901.log`, `critic/c89_ls_old_ctl_88901.log`). Two years in one step (17,520 hours, 8 loads):
  HEAD the headless `689969563` in 8 of 8; run 88's build another world in 1 of 8 (`critic/c89_ls_head_17520.log`,
  `critic/c89_ls_old_17520.log`, `critic/c89_headHash2y_88901.log`).
- **On HEAD, seed 88901 in all:** 74 long-stepped loads (12 + 12 + 10 + 8 + 8 at 393 × 852 + 8 told hidden + 16), 0 in
  another world. Run 88's build in this run: 2 of 24, both on this seed; in run 88, 8 of 18. The old build's rate was
  lower under this run's load than in run 88, so the 0 of 74 is the figure to hold, not the ratio.

**The rule checkers on new seeds:** 6 runs of five years each, 0 broken.
- `diploInvariants`: 89001, 89005 (heroes), random 89003. `worldInvariants`: 89051, 89053 (heroes), the random world
  89055. Evidence: `critic/c89_diploinv_*.log`, `critic/c89_wi_*.log`.

**`landingFuzz --seeds 15 --first 89101`:** 0 of 90 runs broken, `slowClick` 0 of 90 (`critic/c89_landingFuzz.log`).

**The 20-year hashes of plain 1938:** 7019 `ab927e1b`, 32019 `c3520016`, as in runs 79 to 88.

**Monkeys:** five on new seeds at the five supported sizes (pixel ratio 3, heroes on), 1,020 s in all, 0 page errors,
none hung (`critic/c89_monkey.*.log`).

**Page errors:** 0 in all outputs of this run (`node critic/scripts/c89_scan.mjs`: 253 files, 0 with something).

**New non-blocking issues:** R89-N1 (half of six new three-nation worlds keep the peace for ten years; a recorded
choice, ADR-1129, at a higher rate than it read), R89-N2 (the sea's last row drawn out into faint vertical bands above
the map at world zoom on the 1440p desk), R89-N3 (R209's pin is one seed's one event).

**Run 88's non-blocking issues R88-N1 to R88-N4 stand as they were** (no page file changed; ROADMAP R210 to R213 are
open, as ADR-1138 lets them be).

**Scores:** `stability` 7 → 8 (R88-B1 fixed). Every other dimension 8.

## Scores

### Map visuals and readability: **8** (scored afresh: the rotation; last fresh in run 86)
- **Every tier at the five supported sizes, new seeds, 0 errors** (`look` 89901 at 2560 × 1305; 89903 at 393 × 852, 89907
  at 852 × 393, 89909 at 734 × 343, 89911 at 393 × 659; `critic/c89_look.*.log`):
  - 2560 × 1305, Europe at 6,000 m/px on 6 February 1939: every nation's name on its land, counts on flags, the heroes'
    plates, three wars in the row on the bar's centre, the legend bottom right, nothing over anything
    (`critic/shots/c85look_89901_2560x1305_d400_2eur6000.png`).
  - 2560 × 1305 at 250 m/px: the Finnish front, the front line glowing, occupied land hatched in the occupier's colour,
    each division a flag, a strength and a name, order arrows, wings (`critic/shots/c85look_89901_2560x1305_d180_f0_250m.png`).
  - 393 × 852 at 3,000 m/px: Germany, its neighbours and their capitals read; the folded legend and ranking stand in one
    row over the map (`critic/shots/c85phone_89903_393x852_d240_3eur3000.png`).
  - 852 × 393 at 250 m/px: eleven divisions' tags, the engaged with a red edge, none over the news or the war row
    (`critic/shots/c85phone_89907_852x393_d400_f0_250m.png`).
- **The page's boxes in six map modes at the five sizes, a new world** (`node critic/scripts/c88_sizes.mjs 89901 300`,
  `critic/c89_sz_89901.log`, 138 states): `outs` [] in all; `covers` [] in 108; the rest are the ones run 88 named and
  SPEC or R203 allow (the opened legend over the news on a phone on its side, a panel over the news, the opened ranking
  over the end of the row's box: the banners themselves stand left of it,
  `critic/shots/c88sz_89901_d300_734x343_06_seaControl_rankOpen.png`). 0 page errors.
  - Sea control at 2560 × 1305: the zones tinted in their holders' colours, the land muted, the legend's rows naming
    eight holders and "and 4 more" (`critic/shots/c88sz_89901_d300_2560x1305_02_seaControl_base.png`).
- **Markers** (`markers 89951` at 2560 × 1305, three days, three tiers): exit 0. **The desk's row** (`c86_deskAttack
  89907 400 wide`): as run 88 on 88907. **Run 86's own cases:** `c86_modeRow 85901` and `84901`, `c85_deskRow` on five
  worlds: `fit0` [], `stale` [], `covering` [] (`critic/c89_mr_*.log`, `critic/c89_dr_*.log`).
- **Not 9:**
  - R89-N2: at world zoom on the 1440p desk the band above the map's north edge is the sea's last row drawn out into
    faint vertical stripes (`critic/shots/c89_edge_top.png`, cut from
    `critic/shots/c85lwplain_89943_y12_world.png` at twice its size). Faint, and always in the picture at that zoom.
  - Kept: the heroes' plates over labels (ADR-1111), the strike ring's cut name (R172), the AI's bomb as a faint spot:
    after "Go to" on "Soviet Union struck France with an atomic bomb near Paris" the map at 600 m/px shows Paris and no
    mark of the strike (`critic/shots/c85an_64511y13_0_z00600.png`).

### Diplomacy, war, alliances, puppets, revolts: **8** (scored afresh: `src/sim/`)
- **Checkers:** 6 runs on new seeds, 0 broken (Verdict).
- **Headless, new seeds:**
  - `warOpening` on 89211, 89213, 89215 over three years: 141 wars; of those with a border that ran 30 days (21, 28, 20)
    the defender was ahead in land at day 30 in 5, 1 and 3 (`critic/c89_warOpening.log`).
  - `frontArrivals` 89205 (Germany on Poland, day 60: Poland 89 % of its men at the German front, Germany 40 % there and
    51 % at another front, 9 % idle) and 89207 (Japan on China) (`critic/c89_fa_*.log`).
  - `pragueFall 89201`: Prague taken on day 22; it changes hands again by the peace (`critic/c89_prague_89201.log`).
  - `c77_firstdecl` on ten seeds: 49 first declarations, 0 over 6,000 km (`critic/c89_firstdecl.log`).
  - `c77_piles` on ten seeds at day 365: one war in five over 4:1 on two seeds (`critic/c89_piles_*.log`).
  - `heldAtEnd 89311`: the replay's track ends with 0 held lines. `trackFronts 89701`: exit 0.
- **On the page, new seeds, all exit 0 with 0 errors** (`critic/c89_laneC.out`):
  - `peacebtn 89217` at 852 × 393 and 2560 × 1305: peace offered and made ("Germany made peace with Poland"); a refused
    offer says why ("They refuse: lead the war score by 25 (now +0), or wear them out…").
  - `manywars 89219` at 393 × 852: ten wars' rows in the panel, the last reached by scrolling, no sideways scroll.
  - `rg_relations` 89929 at 2560 × 1305 (heroes) and 89931 at 393 × 852: each kind's line read in words ("Lithuania is a
    puppet of Soviet Union", "Germany and Lithuania are at truce, 442 days left").
  - `fw2_forcewar` 89935 and 89939, `joinseen 89427`, `histgrep 89309 FRA 540 joined` (each joiner told with its side),
    `warsof 89309`.
- **Run 88's relations cases, the same figures:** `relSaid` 84903 and 88905, `relSide`, `relFoot`, `graphSize`
  (`critic/c89_{rs,rsd,rf,gs}_*.log`).
- **Not 9:** R88-N3 (the footer's cut line at 393 × 659, as run 88); `c77_massTold` on three seeds still lists wars
  declared a day or two into a massing never told (19 lines; run 85: 25 on its seeds; new seeds, not compared).

### Emergent world dynamics: **8** (scored afresh: `src/sim/`)
- **A 12-year watch on the page at 2560 × 1305** (`long_watch2 89943`, plain; `critic/c89_long_watch2.89943_12__plain.log`):
  the nations go 100, 96, 94, 93, 90, 91, 94, 83, 83, 82, 82, 80; the row's wars change every year (the Soviet Union on
  Japan, Sweden, Turkey, Switzerland, Austria; the United States on Canada in 1944; China on Tibet, Siam, the
  Philippines and Australia; France and eight against Portugal and nine in 1949); two years of twelve end with one war
  in the row. 59.2 to 60 frames/s each year, `ok []`. Pictures: `critic/shots/c85lwplain_89943_y03_world.png`,
  `critic/shots/c85lwplain_89943_y12_world.png` (1950: the United States over half of Canada, China ashore in Australia).
- **`c77_topArea 89097`, 25 years:** the first three by land change 5 times; the Soviet Union ends at 21.5 %, the
  longest still spell 15 years (Australia) (`critic/c89_toparea_89097.log`).
- **`c77_farConquests`, five seeds, two years:** 26.6 capitals taken a seed, 9.2 of them far (run 87: new seeds, not
  compared) (`critic/c89_farc.log`).
- **`borderLog 89099`, 20 years:** 19 of 19 yearly maps alike after replay, the record 2.99 % of the save.
- **Not 9:**
  - R89-N1: `fewNationWars 3 89401 6 10`: no war in ten years on 3 of 6 three-nation worlds (89402, 89403, 89404), a
    first war on day 894 on a fourth; on the page `x_few 89403 3 3` shows three years with two events in History
    ("Alaska founded a Coalition", "Agadez joined the Coalition of Alaska") (`critic/c89_few3.log`,
    `critic/c89_x_few.89403_3_3.log`, `critic/shots/c85xf_89403_3.png`). Two-nation worlds: a war on 4 of 6
    (`critic/c89_few2.log`), the rate ADR-1069 records as accepted. ADR-1129 (accepted; not marked the user's) keeps the
    rule as it is: two or three of near-equal strength may keep the peace; it named one three-nation world.
  - The Soviet Union is first by land in every one of `topArea`'s 25 years (16.0 % to 21.5 %), and in the watch.

### God Mode: **8** (scored afresh: the rotation)
- **At 2560 × 1305, new seeds, all exit 0 with 0 page errors** (`critic/c89_laneC.out`): `a_god_nuke 89917` (the bomb,
  its cloud and ring, the news "A bomb fell from the heavens on Ireland near Limerick: a hydrogen bomb, 187,000 civilians
  killed; no troops in the blast" with "Go to", the Map tools' row above the bar;
  `critic/shots/c85a_89917_14_paris_h_2h.png`; the probe's click, placed for 1600 × 900, falls on Ireland at this size);
  `q_god_tools 89919` (revolt, nation, city, raze: each told in the news, "Prague in Czechoslovakia was razed");
  `undo2 89211` (nuke, revolt, nation and city each undone, the hash back; its raze click, fixed at (800, 450) for a
  1600 × 900 view, met no city at this size, so no raze was made or undone there: the probe's, not the game's);
  `fw2_forcewar 89935`; `h_god`. The same fixed click is why `a_god_nuke`'s bomb fell on Ireland: its "Paris" and
  "London" aftermath shots at this size show the wrong places.
- **The same at the probes' own 1600 × 900:** `a_god_nuke 89927`, `q_god_tools 89923`, `undo2 89213` (nuke, revolt,
  nation, city and raze each undone, as run 88), `fw2_forcewar 89939`.
- **On the phones:** `h_godtab` at 393 × 852, 393 × 659 and 852 × 393: the God tab's lists read and scroll. The God
  toolbar at 393 × 659 stands above the bar, the war row and the news above it, the opened legend clear of all
  (`critic/shots/c88sz_89901_d300_393x659_13_seaControl_legendOpen+god.png`; `critic/c89_sz_89901.log`, the `+god` rows:
  `covers` []).
- **The replay, on starts rebuilt on HEAD's sim:** `godpeace 1942 JAP 'United States'` ("Japan made peace with United
  States", "History's course ended at your first intervention, and the world goes its own way"); `god42 1942 89542`
  (the same output as run 85's); `takescore 1942 GER 240`.
- **Not 9:** as run 88 (R172's ring; a phone's God toolbar takes two rows of the upright view).

### Editor and scenarios: **8** (carried from run 88)

### Stats and history: **8** (carried from run 88)
- Run 88's lane E re-run, 34 cases, all exit 0 (`critic/c89_laneE.out`); `bannerFlip` on 57901, 58901, 57903 the same
  changes as run 88.

### UI/UX and polish: **8** (carried from run 88)
- Run 88's named cases re-run (lanes A, B, X): the same figures (the table below). R88-N1 to R88-N4 as they were.

### Performance: **8** (scored afresh: `src/` changed; the chain run alone)
- **The run:** `sh critic/scripts/c89_chainPerf.sh`, from 04:28:49 to 04:51:27, with no other job of mine running (the
  bulk sets paused). Every stage exits 0 (`critic/c89_pf.status`).
- **The tick of seed 99 over five years:** plain 1.834 ms mean, hash `ca4700f1` (`critic/c89_tick99.log`; run 88:
  1.815 ms, the same hash). With heroes 1.628 ms, hash `494ed033` (`critic/c89_tick99h.log`; run 88: 1.621 ms, the same
  hash). 1 % and 0.4 % apart, inside what two runs of one build differ by; `enemyDistance` runs only when a nation's
  last city falls.
- **Frames at 2560 × 1305 on 7019's year-20 world, at the battle spot, from 3,000 to 30 m/px in both looks**
  (`critic/c89_pf_lookfps_w*.log`, summed by `node critic/scripts/c86_pfsum.mjs`):

  | World | Least mean fps | Highest p95 | Worst frame | Run 88 |
  |---|---|---|---|---|
  | Plain | 59.7 | 18.1 ms | 122 ms | 59.8, 18.0, 117 |
  | With heroes (run 79's save) | 59.7 | 18.2 ms | 117 ms | 59.6, 18.0, 116 |
  | Plain at 2560 × 1440 | 59.7 | 18.2 ms | 118 ms | 59.7, 18.2, 116 |

- **`lookFps 7019`:** forced 59.6 to 60 frames/s at every tier (least 58.8), a draw of 0.8 to 3.3 ms
  (`critic/c89_lookfps.log`). Run 88: the same.
- **The individual tier, `x_indfps 64111`:** 59.8 to 60 fps, p95 16.8 ms, 6,246 individuals drawn at Max speed
  (`critic/c89_xi.log`).
- **Touch (`tm_touch`):** 59.6 fps with 271 ticks/s and nothing selected (`critic/c89_tm_touch.alone.log`). Run 88: 59.6
  and 271.
- **A 12-year watch on the page alone at 2560 × 1305** (`long_watch2 89945`, heroes on, a new seed; the log's name keeps
  run 88's seed by my copy, `critic/c89_lw_88945_alone.log`): 59.8 to 60 fps each year, the longest gap between frames
  83 ms, `ok []`. The plain watch under this run's load (89943): 59.2 to 60.
- **Run 79's 7019 year-20 save** loads and runs a year at 1.810 ms a tick, ending at `07e768a6` as in runs 81 to 88
  (`critic/c89_loadold_7019.log`). **The time-lapse of 20 years** plays with `errors` [] (`critic/c89_tm_lapse20.log`).
- **Not 9:** the worst single frame at the battle spot is still 117 to 122 ms.

### Stability: 7 → **8** (scored afresh: blocked in run 88; R209)
- **Why it moves:** R88-B1 is fixed, by the same case on both builds in this run (Verdict: HEAD 0 of 74 loads of seed
  88901 in another world; run 88's build 1 of 16 and 1 of 8 beside it, at the hashes run 88 saw, `1699438925` at 9,600
  hours). Run 88 said 8 without it.
- **Off its case, HEAD and run 88's build at the same time** (`c89_longStep`, 8 loads a seed, 4 at once):
  - Eight new plain seeds, 89901 to 89915, one step of 9,600 hours: one end hash a seed on both builds, each the
    headless one (`critic/c89_ls_head_9600.log`, `critic/c89_ls_old_9600.log`, `critic/c89_headHash_899*.log`).
  - Four new seeds with heroes on, 89921 to 89927: one end hash a seed, the same on both builds
    (`critic/c89_ls_head_heroes_9600.log`, `critic/c89_ls_old_heroes_9600.log`; no headless hash read with heroes).
  - Two years in one step, 88901, 89931, 89933: HEAD the headless hash, 24 of 24 (`critic/c89_ls_head_17520.log`,
    `critic/c89_headHash2y_*.log`).
  - At 393 × 852 (88901, 89901) and with the tab told hidden before the step (88901, 89903): the headless hash, 32 of 32
    (`critic/c89_ls_head_phone_9600.log`, `critic/c89_ls_head_hidden_9600.log`).
  - **What this shows and does not:** the new seeds held on run 88's build too, so they say only that nothing new
    broke; the fault needs a world that sends a capital to the field, and of the fifteen seeds only 88901 showed it on
    the old build.
- **`workerDeterminism 89059 4380 24`** (run 88 left it out): all four arms end at `5f28e9b8` (`critic/c89_wd_89059.log`).
  **`pageHash` on its own seed 1307** (left out in run 88): 10 of 10 loads equal to the headless year hash `d8edd859`
  (`critic/c89_pageHash_1307.log`). **A running game** (`c88_playHash2 88901 9600 5`): the headless hash of its tick, 5
  of 5, and 5 of 5 with the page stalled for 20 s.
- **SPEC §2.6's new rule read over the code** (`node critic/scripts/c89_closureLoops.mjs`, `critic/c89_closureLoops.log`):
  in 112 files of `src/sim` and `src/worker`, two hits, both a union-find's `find` writing its own parameter (`src/sim/nav/
  airZones.ts:177`, `src/sim/nav/lanes.ts:305`): no loop bound written by a closure. A coarse read: it sees a closure
  declared within 80 lines before the loop, and not a bound that is an array's length grown by a closure.
- **What holds besides:** 0 page errors in every output; five monkeys, 1,020 s, none hung; the page's save and load
  (`saveload_page 89937`: `same`, `same2` true) and Continue (`x_continue 89415`: `sameAfter` true); 6 checker runs and
  90 `landingFuzz` runs, 0 broken; the 20-year hashes.
- **Not 9:**
  - R89-N3: what the engine compiled wrongly was not read (ADR-1143 says so), and the spec that pins it meets the
    loop only while seed 88901 sends Latvia's capital to the field (the spec's own note). Another function compiled
    wrongly on another world would show on no test until a critic's seed met it.
  - No player route to the old fault was found or ruled out, by the builder or by me.

### Semantic zoom to unit level: **8** (carried from run 88)
- Kept `heroPop 85905 300`: 11 jumps zooming (run 88: 13), 7 panning (run 88: 11); `heroPop 88905 300`: 9 zooming (run
  88: 8) (`critic/c89_heroPop.*_head.log`). No page file changed; the counts move with the probe's timing.

### Naval warfare: **8** (scored afresh: `src/sim/`)
- **`landingFuzz` on 15 new seeds:** 0 of 90 broken, `slowClick` 0 of 90.
- **Sea fights of three new worlds** (`seaBattles` 89061, 89069, random 89067): 71, 63 and 55 battles in two to three
  years; `seaBattlesLook`: 71 of 71 and 63 of 63 seen at their camera, 0 with no fleet to see, 0 page errors
  (`critic/c89_sb_*.log`, `critic/c89_sbl_*.log`). Run 88: 77 and 47 (new seeds, not compared).
- **Repulses** (`c77_repulse` 89071, 89073): `broken 0`; "over: 1 thrown back; came ashore near Shanghai".
- **On the page, new seeds, all exit 0 with 0 errors** (`critic/c89_laneN.out`):
  - `lland` ×3: Norwich "the transports of their landing were sunk, and no others can come to their port: the landing is
    over", naming the three divisions; Bremerhaven and Shanghai "over: 3 landed".
  - `lhold 89905` (Valletta from Rome): held up by the Royal Navy from hour 54; the row says "at sea: under attack by
    United Kingdom, held up" for 37 samples of 6 hours (9 days), then "lands in about a day" and "over: 2 landed"
    (`critic/c89_lhold.long_*.log`; run 88's seed: 19 samples). True at every sample; a long wait with no count of days.
  - `turnback 89901`: "cancelled: back at Tokyo, Ōsaka; the AI commands them again". `whotold 89215`.
  - `lbar 89221` at 393 × 852 and 734 × 343, `lbox 89223` at 852 × 393 and 2560 × 1305: "1 of 2 ashore; at sea: lands in
    about a day", "over: 3 landed".
  - `nvpage` ×2, `seaclick 89913`, `sb_seaballs`: 0 errors.
- **The bulk landing sets, re-run whole** (the sim changed): 717 runs, each the same as before R209 line for line.
  - The 396 named `landingInvariants` setups: 395 with 0 broken; one `slowClick` (30041, setup 3517, one group: "t729's
    click of 366 not ashore after 13.0 days, its best way 5.9"), the same line as in run 80's set. A named old case,
    non-blocking by ADR-914; this run's 90 new-seed runs have 0.
  - Stuck-return: 153 runs, 0 broken. Next voyage: 165 with 0 broken; 30041, 31157 and 31175 (one group) one break
    each, the `slowClick` cases run 81 named, as then (`critic/c89_li`, `critic/c89_sr`, `critic/c89_nv`).
- **Not 9:** R88-N1 and R88-N2 (the landings' bar and the legend on a phone, scored under `uiUxPolish`);
  `seaBattlesLook` lists 14 and 9 battles with one side alone at the camera.

### Tanks: **8** (scored afresh: `src/sim/`; last fresh in run 85)
- **On the page at 2560 × 1305, heroes on, new seeds, exit 0 with 0 errors** (`critic/c89_laneT.out`):
  - `c_battle 89915`: an armoured division and an infantry division in contact at 25 m/px, each man a ball, the tanks'
    and the fallen's marks between the lines, a hero tank (Maus) beside them with its own plate
    (`critic/shots/c85c_89915_arm_0025m.png`); at 15 m/px live, 854 individuals and 9 wrecks drawn. `c_battle 7781`.
  - `k_breakthrough 89979`, `kw_breakthrough 89923` (the hint "Click the start, then the end of the breakthrough."; 45
    formations engaged by day 7), `kwhist 89951` ("God opened a breakthrough for Germany near Berlin" in the news,
    History, the CSV and the JSON).
- **Heroes** (`heroBattle 89081`, three years): TOG II in battle 108 days of 405 at war, Char 2C 108 of 360, P.100 169 of
  723, Maus 76 of 819. `heroCeiling 89181`: "11 of 16 lives at or above the top decile". `hero` 89425 and 89427 (at
  393 × 852), `heropanel 89929`: exit 0.
- **Not 9:** in the battle at 25 m/px nothing but the two tags' numbers says which side is winning
  (`critic/shots/c85c_89915_arm_0025m.png`); `heroCeiling` still lists two heroes' lives as MISS (P.100, Char 2C).

### Aircraft: **8** (scored afresh: `src/sim/`; last fresh in run 85)
- **On the page at 2560 × 1305, new seeds, exit 0 with 0 errors:**
  - `pl_planes 89925 GER POL`: 43 sorties found at hour 2; marks at every tier from 3,000 to 25 m/px in both looks; at
    60 m/px the wing a group of planes over the border (`critic/shots/c85pl_89925_GER_POL_5441_0060m_balls.png`).
  - `w_wing 89927`: a followed wing keeps its mark in 55 of 55 samples at ×5, the camera on it.
- **Told:** the monthly lines in the news of the watch ("United Kingdom's air force struck Netherlands over the past
  month: 13,607 men, guns and vehicles lost"), carrier strikes ashore; `seaBattles`: 28, 48 and 47 sinkings out of
  battle by carriers' wings.
- **Not 9:** a wing at 60 m/px is a handful of small planes on a wide empty view with no tag: nothing says whose
  they are until clicked (`critic/shots/c85pl_89925_GER_POL_5441_0060m_balls.png`).

### AI nuclear use: **8** (scored afresh: `src/sim/`; last fresh in run 85)
- **Headless, 22 years, new seeds:** `nukeIntercepts 89501`: 13 launches, 2 by bomber, 0 stopped (0.80 expected);
  `c77_nukecount`: 89503 0 launches, 89505 16 launched and 16 detonated, 89507 2 and 2 by year 20
  (`critic/c89_nukeIntercepts_89501.log`, `critic/c89_nc_*.log`). Landings in the same worlds: 1,191 to 1,311.
- **On the page:** run 79's year-13 save of 64511 loaded on HEAD strikes as in run 85: "Soviet Union struck France with
  an atomic bomb near Paris: 183,000 civilians killed; 56,936 men and 226 guns lost", with "Go to", then a second near
  Brive (`critic/c89_an_ainuke.64511_*.log`, `critic/shots/c85an_64511y13_0_alert.png`). On this run's saves of 7019,
  32019 (year 20) and 89511 (year 13): no strike in 400 days, `ok []`, as run 85 on its saves.
- **`c77_interceptTold`:** the kinds as run 85 (`NukeDecided`, `NukeMeansLost`, `NukeCasualties` in History).
- **Not 9:** the AI's bomb leaves a faint spot at 600 m/px (kept, R172); three of four saves show no AI strike in the
  400 days watched, so the page case rests on one old save.

## Blocking issues

None.

## Non-blocking issues (prioritised)

1. **R88-N1 (kept; ROADMAP R210): on the iPhone 16 upright with a landing ordered, the landings' bar lies over the folded
   legend, whole.** `c88_sizes 88903 0` on HEAD: 308 of 308 and 363 of 363 points, the toggle's tap times out, as run 88
   (`critic/c89_sz_88903.log`).
2. **R88-N2 (kept; R211): on the iPhone 16 sideways the landings' bar lies over the opened legend;** with its row
   opened at 734 × 343 also over the war row (574 points) and the news (342) (`critic/c89_sz_88903.log`).
3. **R88-N3 (kept; R212): at 393 × 659 the relations footer's first line is cut** (`cut` ["open"],
   `critic/c89_rs_88905_400.log`).
4. **R88-N4 (kept; R213): at 393 px the war row's names cut to "Natio…"** (seen again:
   `critic/shots/c88sz_89901_d300_393x659_13_seaControl_legendOpen+god.png`: "Natio… ⚔ Portugal" beside "Soviet … ⚔ Japan").
5. **R89-N1 (emergent dynamics): three of six new three-nation worlds have no war in ten years.**
   - `npx tsx tools/diag/fewNationWars.ts 3 89401 6 10` (`critic/c89_few3.log`): 89402, 89403, 89404 "first war day -1";
     89401's first on day 894. On the page, `x_few 89403 3 3`: three years, 2 events.
   - ADR-1129 (accepted, the builder's reading of run 76's case) keeps the rules: a world of two or three of near-equal
     strength may keep the peace; it named one three-nation world (55404). Not a contradiction; the rate is the finding.
     On the same seeds across R209 nothing moved: `fewNationWars 3 85401 6 10` gives run 85's six lines (a war on 6 of
     6). The difference is the seeds'.
   - **Seen better when:** `fewNationWars 3 89401 6 10` a war on at least 5 of 6, or the page says of such a world that
     its nations are at peace and why.
6. **R89-N2 (map visuals, 2560 × 1305): at world zoom the band above the map is the sea's edge row drawn out into
   faint vertical stripes** (`critic/shots/c89_edge_top.png`; in every world shot of `long_watch2 89943`).
   **Seen fixed when:** the view beyond the map's north edge is one flat sea colour.
7. **R89-N3 (stability): R209's pin is one event of one seed.** `tests/e2e/longStep1938.spec.ts` meets `enemyDistance`'s
   loop only while seed 88901 sends a capital to the field in its first 9,600 hours (its own note); a later rule change
   that moves that day leaves the spec green and blind. **Better when:** the spec (or a unit case) asserts that the
   world it steps did call the field-capital search, or `pageHash` runs on a list of seeds in the review.
8. **Kept:** the heroes' tags' jumps while zooming (`heroPop 85905`: 11), the graph's 13 px jump (R196), R172, R192,
   ADR-1111.

## Run 88's cases re-run

| Run 88 case | Run 88 (`3e1ed78e`) | HEAD (`f27f48f5`) | Evidence |
|---|---|---|---|
| R88-B1 `c88_sameWorldMsgs 88901 400 12` | two end hashes, 8 of 18 loads wrong | **fixed**: one, `3723997852` | `critic/c89_swm_88901_400_12.log` |
| R88-B1 `c88_sameWorldMsgs 88901 300 12` | `1956157891` in 2 of 8 | **fixed**: one, `4108155890` | `critic/c89_swm_88901_300_12.log` |
| R88-B1 `pageHash 88901 1 76540321 10 3` | 3 of 10 | **fixed**: 10 of 10 | `critic/c89_pageHash_88901.log` |
| R88-B1 `c88_playHash 88901 9600 6` | 6 of 6 | 6 of 6 | `critic/c89_ph_88901_9600_6.log` |
| R88-B1 on `3e1ed78e` in this run (the control) | — | 1 of 16 wrong at 9,600 hours, 1 of 8 at 17,520; HEAD 0 of 16 and 0 of 8 beside it | `critic/c89_ls_*ctl*.log`, `critic/c89_ls_*_17520.log` |
| R88-N1, R88-N2 `c88_sizes 88903 0` | 308/308, 363/363; 420, 231; 1,792, 1,365 | the same (16 `legend<landings` lines on both) | `critic/c89_sz_88903.log` |
| R88-N3 `c88_relSaid 88905 400` | `cut` at 393 × 659 | the same | `critic/c89_rs_88905_400.log` |
| `c87_legendOpen 84901 400`, `c87_legendShot` ×2 | 0 and 0 in 20 cases | the same (the logs equal) | `critic/c89_lo_*.log`, `critic/c89_ls_84901_*.log` |
| `c87_rowJitter 87601 300`; `c88_rowJitter` 88601, 88603 | 0 moves with the count unchanged | the same | `critic/c89_rj_*.log` |
| `c86_modeRow` ×2, `c86_deskAttack` 84901 and wide, 88907 | `fit0` [], `covering` []; 0 px at 1600+ | the same (`deskAttack 84901` on its second run, Setup) | `critic/c89_mr_*.log`, `critic/c89_da_*.log` |
| Lane B (`deskRow` ×5, `explore`, `rowShot`, `crossWidth`, `deskFit`, `moreClick`, `relSide`, `relFoot`, `graphSize`, `phoneRow` ×2, `phoneToDesk` ×2, `rotate`) | exit 0; 0 stale, p95 16.7 ms | exit 0; 0 stale, p95 16.7 ms | `critic/c89_laneB.out` |
| Lane E (34 cases) | exit 0 | exit 0; `bannerFlip` the same changes | `critic/c89_laneE.out` |
| Kept `heroPop 85905`; `heroPop 88905` | 13 jumps; 8 | 11; 9 | `critic/c89_heroPop.*_head.log` |
| `c88_sizes 88901 400` (R88-N4, the two worlds' shots) | judged on one of two worlds; `legend<landings` on 2 lines at 852 × 393 | the headless world; exit 0, 0 errors; in it the probe's landing sets no bar at day 400, so no landing line (R88-N2 stands on 88903) | `critic/c89_sz_88901.log` |
| `c88_playHash2 88901 9600 5`, the page stalled 20 s | 5 of 5 | 5 of 5 (and 5 of 5 not stalled) | `critic/c89_ph2_block_88901_9600_5.log`, `critic/c89_ph2_88901_9600_5.log` |
| `pageHash` on its own seed 1307 (left out in run 88) | — | 10 of 10 equal to the headless `d8edd859` | `critic/c89_pageHash_1307.log`, `critic/c89_wd_1307.log` |
| Performance chain | tick 1.815 ms `ca4700f1`; 59.8 fps at 2560 × 1305 | tick 1.834 ms `ca4700f1`; 59.7 fps at 2560 × 1305 | `critic/c89_pf.status` |
| 20-year hashes 7019, 32019 | `ab927e1b`, `c3520016` | the same | `critic/c89_seed*_save.log` |
| Checkers, `landingFuzz` | 6 and 90 on new seeds, 0 broken | 6 and 90 on new seeds, 0 broken | `critic/c89_*inv*.log`, `critic/c89_wi_*.log`, `critic/c89_landingFuzz.log` |
| Monkeys | 5 sizes, 0 errors | 5 sizes, new seeds, 0 errors | `critic/c89_monkey.*.log` |
| Bulk landing sets | sim unchanged, carried | due (the sim changed): 396 + 153 + 168 runs, each the same as the last set before R209; the same four `slowClick` breaks as then | `critic/c89_li`, `critic/c89_sr`, `critic/c89_nv` |

## Design objections (none blocking)

- **ADR-1143's rule is written for the code and checked by nothing.** "A loop's own bounds and counters are written in
  the loop's function" stands in SPEC §2.6 with nothing in `eslint.config.js` and no test of the rule behind it; the next closure of that shape is found by
  a critic's seed or not at all. My coarse read (`c89_closureLoops.mjs`) found none today.
- **ADR-1129's peace of equals** leaves half of this run's three-nation worlds with nothing to watch (R89-N1). A world
  that small could say so on its title card, or its AI could tire of peace by the year.
- **Run 88's two** (the opened legend over the news on a phone on its side; the ranking's toggle hidden while the legend
  is open) stand.

## Ideas from other games (not scored)

- **Hearts of Iron IV** tells a held-up naval invasion with the enemy fleet's strength beside it; `lhold`'s nine days of
  "under attack by United Kingdom, held up" would read better with a count ("held up 9 days").
- **Ages of Conflict** lets a small custom world be started with a set aggression; a slider on the random world's card
  would answer R89-N1 without touching ADR-1129.

## Strengths (verified)

- **The fix of R88-B1 is shown, not claimed:** on seed 88901 the old build still made a second world beside HEAD in this
  run (2 of 24 loads), and HEAD made one world in 74 loads of 74, in four shapes of the step; the builder's own checker
  went from 3 of 10 to 10 of 10.
- **The change left the sim's course alone:** the 20-year hashes, seed 99's two hashes, all 54 replay starts and all 717
  bulk landing runs are the same bytes or lines as before it.
