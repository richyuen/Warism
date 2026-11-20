# Critic report, run 90 (focused): R210 to R218 (Batches 56 and 57), on `fc767d88`

## The run

- **Mode: focused** (ADR-1138: every run).
- **Commit judged:** `fc767d886f1b98ec7a708e6023a1a350c337da00`, HEAD at the start (`critic/c90_commit.txt`).
- **Last report:** run 89, focused, on `f27f48f5`.
- **Time:** 08:34 to about 10:35 by the machine's clock.
- **The sizes** (ADR-1141): fresh scores rest on 393 × 659, 393 × 852, 734 × 343, 852 × 393 (touch, pixel ratio 3 where a
  probe takes it) and 2560 × 1305. A probe that takes no size ran at its own 1600 × 900 (said where it matters).
- **Left out for time:**
  - **Of the bulk landing sets** (due: `src/sim/ai/` and `src/sim/systems/` changed, so neither "sim unchanged", ADR-917,
    nor "plain 1938 unchanged", ADR-959, carries them): 358 of the 396 named `landingInvariants` setups ran; the 153
    stuck-return runs and the 168 next-voyage runs did not; Malta's 18 landings on the page and run 85's nuke-seed set
    did not. Stopped by `critic/c90_stop.flag` so the performance chain ran alone.
  - Run 89's build was run beside HEAD only for the frames and the tick (their figures differ); no score moves on a case
    both builds can run (the one that moves, `diplomacyWarDepth`, moves on R216's peace line, which `f27f48f5` lacks).
  - A real background tab (as run 89).
  - The peace line with the legend or ranking open, a panel open or the God toolbar shown (R216's audit ran with all
    folded); God Mode's edits while paused against the line's once-a-day cache (`peaceOf`'s key).

### What changed since run 89

`git diff --stat f27f48f5 HEAD`: `src/sim/ai/peaceWhy.ts` (new), `strategic.ts`, `massing.ts`, `seaLift.ts`,
`economic.ts`, `src/sim/systems/capitals.ts`, `seaSupply.ts`, `src/worker/server.ts`, `src/shared/protocol.ts`,
`src/render/map/ground.ts`, `mapShader.ts`, `src/app/style.css`, `App.tsx`, `src/ui/WarBanners.tsx`, `src/ui/i18n/en.json`,
and tests. ROADMAP R210 to R218: the phone's landings' bar under the legend's title (R210, R211), the relations
footer (R212), the phone's war row cut to a first word (R213, ADR-1144 (b), the user's), a flat sea past the map's edges
(R214), ADR-1143's rule read from the source and the long step's pin asserting its world meets the loop (R215), **the
peace line of a world of few nations (R216, ADR-1145)**, a neighbour of a nation's home is one its men stand on the
border's land of (R217, ADR-1146), a capital's land is its city's cell (R218).

- **The sim's course moved** (R217, R218): the 20-year hashes of plain 1938 are now 7019 `fda52a36` and 32019
  `61762049` (runs 79 to 89: `ab927e1b`, `c3520016`; `critic/c90_seed7019_save.log`, `critic/c90_seed32019_save.log`).
  The replay's 54 yearly starts rebuilt on HEAD (`sh critic/scripts/c90_starts.sh`): 31 the same bytes as run 89's, 23
  differ, every one from 1969 on (`critic/c90_starts.log`).

### Scored afresh, and why

Every dimension: the diff touches every row of the table.

| Dimension | Why |
|---|---|
| `diplomacyWarDepth`, `emergentDynamics`, `stability`, `naval`, `tanks`, `aircraft`, `aiNukes` | touched: `src/sim/`, `src/worker/` |
| `performance` | `src/` changed: the chain, run alone |
| `mapVisuals`, `semanticZoom` | touched: `src/render/map/` |
| `uiUxPolish`, `statsHistory`, `godMode`, `editorScenarios` | touched: `src/app/style.css`, `App.tsx`, `src/ui/i18n/`, `src/ui/WarBanners.tsx` |

No rotation is needed: nothing is carried.

### Setup

- **HEAD's build:** `critic/c90_dist` (`sh critic/scripts/c90_build.sh`, build exit 0), served on 127.0.0.1:5451; the
  replay starts rebuilt on HEAD put in it before the 1938h cases ran.
- **Lanes** (`critic/scripts/c90_lane*.sh`, each run with `bash`, sourcing `c90_r.sh`): S stability (R88-B1's guard, the
  long step on new seeds), C God Mode and diplomacy, D the editor, scenarios, time-lapse and History, N naval, T tanks,
  aircraft and the AI's nukes (`c90_laneT2.sh` its last two cases, after a wrong file name of mine stopped the lane),
  V map visuals, Z semantic zoom, X and A and B and E and L run 88's and 89's named cases, P the peace line (new), M the
  monkeys, W a 12-year watch. Headless: `c90_long.sh` (every-run jobs), `c90_jobsH.txt` by `c90_runH.sh`, `c90_bulk.sh`.
  Then `c90_chainPerf.sh` alone.
- **New scripts:** `c90_peace.mjs` (the peace line at a size, its reasons, the boxes over it, opened and shut, the end
  hash), `c90_headHashR.ts` (a random world's headless hash), `c90_peaceTruth.ts` (does a reason the line gives hold?),
  `c90_peaceCase.ts`, `c90_peaceWeek.mjs`, `c90_reachCase.ts` (the cases behind R90-B1), `c90_diploN.ts` (the rule
  checker on a random world of N nations, which `tools/diag/diploInvariants.ts` cannot ask for), `c90_fields.ts` (does a
  seed still send a capital to the field), `c90_edge.mjs` and `c90_edge.py` (R89-N2), `c90_phCmp.mjs`, `c90_scan.mjs`.
- **A probe's fault, mine:** `c88_playHash` and `c88_playHash2` compare with run 88's headless file
  (`critic/c88_headHash_88901_from9600.log`), made on the sim before R217: they printed "0 of 6" and "0 of 5". Against
  HEAD's own headless hashes (`critic/c90_headHash_88901_from9600.log`, `node critic/scripts/c90_phCmp.mjs`): 6 of 6
  and 5 of 5 (`critic/c90_phCmp.log`). Some logs keep run 89's seed in their name from my copy (e.g.
  `critic/c90_sb_89061.log` is seed 90061; the first line of each says its seed).
- **At the end:** the preview servers on 5451 and 5452 (run 89's build, `critic/c90_olddist`), every browser and every
  job I started were stopped; the worktree `critic/wt` was removed after its `node_modules` link was unlinked; no
  listener is left. My probe `os2_scen` rewrote `critic/c85_critic_standoff.warsim-scenario` (592,870 to 592,012 bytes);
  the critic's guard blocks restoring it with git, so it stands modified in the tree for the builder to restore.

## Verdict

**One blocking issue: R90-B1, the new peace line (R216) tells the player that a peace holds "even after ten years" days
before the AI declares the war it said it would not.** Every other dimension at its bar; `diplomacyWarDepth` 7 with
R90-B1 standing. Run 89's non-blocking issues R88-N1 to R88-N4, R89-N1, R89-N2 and R89-N3 are fixed on their cases (R88-N4 read on
other rows, its own world having moved). New non-blocking issues: R90-N1 (one `slowClick` of 90), R90-N2 (History
holds nothing of the peace), R90-N3 (a frame drop to 52 fps with heroes at 1,200 m/px, shown against `f27f48f5`).

**The rule checkers on new seeds:** 6 runs of five years each, 0 broken: `diploInvariants` 90001, 90005 (heroes), random
90003; `worldInvariants` 90051, 90053 (heroes), the random world 90055 (`critic/c90_diploinv_*.log`,
`critic/c90_wi_*.log`). And R217's `mass` rule on random worlds of few nations (`c90_diploN.ts`): three nations
90601, 90603, 90605, 90607 and two nations 90441, five years each, 0 broken (`critic/c90_diploN*_*.log`).

**`landingFuzz --seeds 15 --first 90101`:** 1 of 90 runs broken, `slowClick` 1 of 90 (90103, setup 3517, two groups,
orders for 8 days: "t118's click of 367 not ashore after 13.6 days, its best way 6.6"; `critic/c90_landingFuzz.log`,
`critic/c90_lf_90103_3517_g2_od8.log`). Under 5 %: non-blocking by ADR-914 (R90-N1).

**The 20-year hashes of plain 1938:** 7019 `fda52a36`, 32019 `61762049` (moved by R217 and R218, above).

**Monkeys:** five on new seeds at the five supported sizes (pixel ratio 3, heroes on), 1,020 s in all, 0 page errors,
none hung (`critic/c90_monkey.*.log`).

**Page errors:** 0 in all outputs of this run (`node critic/scripts/c90_scan.mjs`).

## Scores

### Map visuals and readability: **8** (scored afresh: `src/render/map/`)
- **R89-N2 fixed (R214).** 1938 seed 89943 at the start camera at 2560 × 1305 (`node critic/scripts/c90_edge.mjs 89943`,
  `python critic/scripts/c90_edge.py critic/shots/c90edge_89943_2560x1305_start.png 0 48 250 1040`, and 1520 to 2560):
  the band above the map's north edge has a colour spread of 1 across x in every row (one colour, `(23, 42, 70)`);
  run 89's crop of the same band: 31 (`critic/shots/c89_edge_top.png`). Picture: `critic/shots/c90edge_top_band.png`.
- **Every tier at the five sizes, new seeds, 0 errors** (`look` 90901 and 90971 at 2560 × 1305, 90903 and 90973 at
  393 × 852, 90907 and 90977 at 852 × 393, 90909 at 734 × 343, 90911 at 393 × 659). Europe at 3,000 m/px on
  7 February 1939: names on their land, counts on flags, the heroes' plates, the front's glow, the war row and the
  legend clear of each other (`critic/shots/c85look_90901_2560x1305_d400_3eur3000.png`).
- **The page's boxes in six map modes at the five sizes on a new world** (`c88_sizes 90901 300`, `critic/c90_sz_89901.log`,
  143 states, 0 errors): `outs` [] in all; the covers are the ones run 88 named and SPEC allows (a panel over the news,
  the opened legend over the news on a phone on its side, the opened ranking over the row's end).
- **Run 86's own cases:** `c86_modeRow` 85901 and 84901: `fit0` [], `stale` [], `covering` []; `c86_deskAttack` 84901,
  84901 wide, 88907 wide, 90907 wide: 0 px off centre (`critic/c90_mr_*.log`, `critic/c90_da_*.log`).
- **Not 9:** kept: the heroes' plates over labels (ADR-1111), "Sovetsky Soyuz"'s plate across Sweden's name in the
  picture above; the AI's bomb as a faint spot (R172).

### Diplomacy, war, alliances, puppets, revolts: 8 → **7** (scored afresh: `src/sim/`; R90-B1)
- **Why it moves:** R90-B1, a new feature's told rule that the sim contradicts within days (below). It cannot be run
  on `f27f48f5` (no peace line there). Everything else in this dimension holds at run 89's level.
- **The peace line (R216) on the page, at the five sizes** (`bash critic/scripts/c90_laneP.sh`, `critic/c90_peace.*.log`):
  - It shows in a world of three or two nations while there is no war, and goes when one starts, at every sample: 8
    worlds, 0 samples with the line during a war, 0 at peace without it. Opened and shut by a click or a tap; with the
    legend and the ranking folded and no panel or God toolbar open (the opened states not tried), 0 boxes over it
    opened or shut, 0 cut, nothing out of the view, no sideways scroll at 393 × 659, 393 × 852, 734 × 343,
    852 × 393 and 2560 × 1305. Pictures: `critic/shots/c90peace_89403_d30_open_crop.png` (desk),
    `critic/shots/c90peace_90403_3_393x659_d0_open.png` (the phone, upright, with Safari's bars).
  - **The reads do not move the world:** each page run's end hash equals the headless world's at the same hour, 8 of 8
    (e.g. 89403 at 25,920 h `3198476352` both; `critic/c90_laneP.out`, `critic/c90_peace_head.log`); and headless,
    a world read every day ends at the same hash as one never read, on 38 seeds of two and three nations, ten years each (`critic/c90_pt*.log`).
  - **R90-B1:** what it says is not true. See Blocking issues.
- **Checkers:** 6 runs on new seeds and 5 on few-nation worlds, 0 broken (Verdict).
- **Headless, new seeds:** `warOpening` 90211, 90213, 90215 over three years: 149 wars; of those with a border that ran
  30 days (24, 23, 25) the defender was ahead in land at day 30 in 3, 3 and 2 (`critic/c90_warOpening.log`; run 89: 141
  wars, 5, 1, 3). `c77_firstdecl` on ten seeds: 71 first declarations in 60 days, 0 over 6,000 km. `c77_piles` at day 365: one war
  over 4:1 on two of five seeds (GER vs ENG 2:14, ITA vs POR 1:5; `critic/c90_piles_p.log`). `pragueFall 90201`: Prague
  on day 18. `c77_massTold` on three seeds: told 52, a war after 45, given up 7; 29 wars "after a massing never told"
  (run 89 on its seeds: 29 by the same count; `critic/c90_massTold.log`).
  - `frontArrivals 90205`: at day 60 Poland holds 359 of Germany's cells and Germany none of Poland's; Germany at war
    with nine (POL FRA AOF AEF TUN AUT CZS ROM YUG), 204,000 men in 45 formations (`critic/c90_fa_89205.log`). A new
    seed, not compared; a world worth a look, not a broken rule.
- **On the page, new seeds, all exit 0 with 0 errors** (`critic/c90_laneC.out`): `fw2_forcewar` 90935 and 90939,
  `peacebtn` 90217 at 852 × 393 and 2560 × 1305, `manywars 90219` at 393 × 852, `rg_relations` 90929 at 2560 × 1305
  (heroes) and 90931 at 393 × 852, `joinseen 90427`, `histgrep 90309`, `warsof 90309`.
- **R88-N3 fixed (R212):** `c88_relSaid 88905 400`: `cut` [] at all five sizes (run 89: `cut` ["open"] at 393 × 659;
  `critic/c90_rs_88905_400.log`).
- **What earns 8 back:** R90-B1's "seen fixed when" (below): the two traced cases read true on the page, and on the 24
  seeds no war within 30 days of a truce or "no rival within its reach" reason; and
  `node critic/scripts/c90_peaceWeek.mjs 89401 3 1595 1604` and `... 90441 2 88 98` show the line naming the war that
  comes (or "for now") on every day before it.

### Emergent world dynamics: **8** (scored afresh: `src/sim/`)
- **A 12-year watch on the page at 2560 × 1305** (`long_watch2 90943`, plain; `critic/c90_long_watch2.90943_12__plain.log`):
  59.7 to 59.9 frames/s each year, the longest gap between frames 117 to 150 ms, three wars in the row in 11 years of 12,
  `ok []`.
- **R89-N1's case, `fewNationWars 3 89401 6 10`:** a war on 5 of 6 (run 89: 3 of 6): 89401 day 174, 89402 day 3,281,
  89404 day 138, 89405, 89406; 89403 none (`critic/c90_few3_89401.log`). R217 ended 89404's empty massings (ADR-1146).
  The "seen better when" of R89-N1 (5 of 6, or the page saying why) is met both ways. New seeds:
  `fewNationWars 3 90401 6 10` a war on 5 of 6; two nations, `2 90421 6 10`, on 2 of 6 (run 89's seeds: 4 of 6; new
  seeds, not compared) (`critic/c90_few3.log`, `critic/c90_few2.log`). Run 85's 85401 still a war on day 110.
- **`c77_topArea 90097`, 25 years:** the first three by land changed 10 times, 9 orders; the longest still spell 10 years
  (Brazil) (`critic/c90_toparea_89097.log`; run 89 on its seed: 5 changes, the Soviet Union first all 25 years).
- **`c77_farConquests`, five seeds, two years:** 28.2 capitals taken a seed, 10.0 far (run 89: 26.6 and 9.2).
- **`borderLog 90099`, 20 years:** 19 of 19 yearly maps alike after replay, the record 2.43 % of the save.
- **`capitalMoves`** on the two 20-year saves (R218 touched the capitals): 8 moves, 8 on the most-held land of 8 possible.
- **The late world:** HEAD's 7019 year-20 save had no formation engaged at load, but its last six years flip more land
  than run 89's (cells flipped, years 15 to 20: 8,995, 19,655, 44,200, 38,907, 38,644, 57,413; run 89: 7,295 to 20,781);
  32019 ends quieter (2,775 and 303 in years 19 and 20; run 89: 25,695 and 27,577) (`critic/c90_seed*_save.log`,
  `critic/c89_seed*_save.log`). Two worlds, one each way: not a trend.
- **Not 9:** four of six new two-nation worlds keep the peace ten years (ADR-1069, ADR-1129; now told by the line).

### God Mode: **8** (scored afresh: `style.css`, `App.tsx`)
- **At 2560 × 1305 and the probes' 1600 × 900, new seeds, exit 0 with 0 errors** (`critic/c90_laneC.out`):
  `a_god_nuke` 90917 and 90927, `q_god_tools` 90919 and 90923, `undo2` 90211 and 90213 (nuke, revolt, nation, city and
  raze each undone: `[["nuke",1,true],["revolt",1,true],["nation",1,true],["city",1,true],["raze",1,true]]`),
  `fw2_forcewar` 90935 and 90939, `h_god`; `h_godtab` at 393 × 852, 393 × 659 and 852 × 393.
- **The replay on starts rebuilt on HEAD:** `godpeace 1942 JAP 'United States'`, `god42 1942 90542`, `takescore 1942 GER
  240`, exit 0, `errors` [].
- **Not 9:** as run 89 (R172's ring, the phone's God toolbar two rows of the upright view).

### Editor and scenarios: **8** (scored afresh: `style.css`, `App.tsx`)
- `g_editor` 90921 and 90925 (at 2560 × 1305), `x_editor` 90443 and 90445, `os2_scen` on run 26's standoff scenario
  (the file loads, "1 January 1938 · Paused", `errors` []): all exit 0 (`critic/c90_laneD.out`). `g_editor 90921` ends
  with the editor's Poland striking Berlin, told with its count.
- **Not 9:** as run 88 (no new editor feature; nothing found that a player would leave over).

### Stats and history: **8** (scored afresh: `style.css`, `App.tsx`, `i18n`)
- `timeLapse` 90941 at 2560 × 1305 and 90945 at 393 × 852 and 734 × 343 (the lapse opened, stepped, closed, the clock
  back at 5 February 1939), `tlMonths 90947`, `histPlace 90961` at 2560 × 1305 and 393 × 659, all exit 0 with `errors`
  [] (`critic/c90_laneD.out`). Run 88's lane E re-run (25 lines of `critic/scripts/c90_laneE.sh`, some loops), every case exit 0 (`critic/c90_laneE.out`).
- 89403's History over three years still holds two events ("Alaska founded a Coalition", "Agadez joined the Coalition
  of Alaska"), and the line under it now says "At peace · none outmatches another" (`critic/shots/c85xf_89403_3.png`).
- **Not 9:** a few-nation world's History says nothing of the peace; only the line does.

### UI/UX and polish: **8** (scored afresh: `style.css`, `App.tsx`, `WarBanners.tsx`)
- **R88-N1 and R88-N2 fixed (R210, R211):** `c88_sizes 88903 0` on HEAD: no `legend<landings` line (run 89: 16); on the
  phones the landings' bar stands under the legend's title (393 × 659: landings [7, 84, 386, 118], legend [7, 46, 90,
  80]) and goes while the legend is open; at 734 × 343 and 852 × 393 beside it (`critic/c90_sz_88903.log`,
  `critic/c88sz_88903_d0.json`, `critic/shots/c88sz_88903_d0_393x659_18_political_landing.png`).
- **R88-N4 (R213, ADR-1144 (b)):** the row at 393 × 659 cuts a long name toward its first word with its counts standing:
  "Soviet Uni… & 1 ⚔ Iraq & 2" (`critic/shots/c90_r213_row_393x659.png`, from `c88_sizes 88901 400`); "Nationalist …
  ⚔ Spanish Re…" (88903). Seed 88901 no longer has Nationalist Spain leading at day 400 (the sim moved), so R88-N4's own
  row could not be re-read; the rule as ADR-1144 (b) words it holds on the two rows seen.
- **R88-N3 fixed (R212):** above.
- **The peace line** at the five sizes: no box over it, nothing cut (above).
- Lanes A and B (run 87's and 86's cases: `legendOpen`, `legendShot` ×2, `rowJitter` 87601 (0 moves), `modeRow` ×2,
  `deskAttack` ×4, `deskRow` ×5, `crossWidth` (0 stale), `rowShot`, `deskFit`, `moreClick`, `relSide`, `relFoot`,
  `graphSize`, `phoneRow` ×2, `phoneToDesk` ×2, `rotate`): all exit 0, 0 errors.
- **Not 9:** the opened legend over the news on a phone on its side (`news<legend 634/816` at 734 × 343 and 852 × 393,
  as run 88); a panel over the news on a phone.

### Performance: **8** (scored afresh: `src/` changed; the chain run alone)
- **The run:** `sh critic/scripts/c90_chainPerf.sh`, from 09:46:38 to 10:04:28, with no other job of mine running (the
  bulk set stopped, every lane done; only the preview server). Every stage exits 0 (`critic/c90_pf.status`). Then
  `c90_perf2.sh` and `c90_perfAB.sh`, alone, below. (`CRITIC_PROMPT.md` changed during this run, `97d493a1`, ADR-1147:
  `performance` afresh only by the rotation; with every other dimension touched, the rotation would have chosen it.)
- **The tick of seed 99 over five years:** plain 1.886 ms mean, hash `242be86c` (`critic/c90_tick99.log`; run 89: 1.834
  ms, `ca4700f1`). With heroes 1.786 ms, `95b922e2` (`critic/c90_tick99h.log`; run 89: 1.628 ms, `494ed033`). The worlds
  differ (R217, R218). **Both commits at the same time on separate cores** (`c90_perfAB.sh`, a worktree at `f27f48f5`):
  plain 1.972 ms on HEAD against 1.934 ms (+2 %), heroes 1.849 against 1.759 (+5 %) (`critic/c90_tickab_*.log`); one
  pair each, not swapped (HEAD on cores 0xFF00, the old on 0x00FF), in worlds that differ.
- **Frames at 2560 × 1305 at 7019's year-20 battle spot, 3,000 to 30 m/px in both looks** (`node critic/scripts/c86_pfsum.mjs`):

  | World | Least mean fps | Highest p95 | Worst frame | Run 89 |
  |---|---|---|---|---|
  | Plain, HEAD's own year-20 save | no formation engaged at load: the probe finds no battle spot (`critic/c90_pf_lookfps_w.log`) | | | 59.7, 18.1, 122 |
  | Plain, run 89's year-20 save loaded on HEAD | 59.7 | 18.0 ms | 123 ms | the same save: 59.7, 18.1, 122 |
  | With heroes (run 79's save) | **56.8 to 57.0** (four runs) | 18.3 ms | 116 to 126 ms | 59.7, 18.2, 117 |

  - **The heroes arm, both builds alone one after the other, swapped** (`critic/c90_pfab_*.log`): at 1,200 m/px in the
    classic look the second 4-second sample is 51.5 to 52.1 fps in 4 of 4 runs on HEAD (the chain's two included:
    `critic/c90_pf_lookfps_wh.log`, `critic/c90_pf_lookfps_wh2.log`); on `f27f48f5` 60.1 to 60.2 in 2 of 2, its least
    sample 58.9 at that tier. The worst frame is the same on both (116 to 129 ms). R90-N3.
- **`lookFps 7019`** on HEAD's year-20 save: forced 58.5 to 60 frames/s at every tier, a draw of 0.9 to 3.4 ms
  (`critic/c90_lookfps.log`; run 89: least 58.8).
- **The individual tier, `x_indfps 64111`:** 59.6 to 60 fps, p95 16.8 ms, up to 10,854 individuals drawn (`critic/c90_xi.log`).
- **Touch (`tm_touch`):** 59.5 fps with 235 ticks/s and nothing selected (`critic/c90_tm_touch.alone.log`; run 89: 59.6
  and 271). Ticks a second are the sim's at Max speed in a world R217 changed; the tick pairs above put HEAD 2 to 5 %
  slower (one unswapped pair); the rest of the 13 % was not read.
- **A 12-year watch on the page alone at 2560 × 1305** (`long_watch2 90945`, heroes on): 59.8 to 60 fps each year, the
  longest gap between frames 83 ms, `ok []` (`critic/c90_lw_90945_alone.log`). The plain watch under this run's load
  (90943): 59.7 to 59.9.
- **Run 79's 7019 year-20 save** loads and runs a year at 1.886 ms a tick, ending at `916c1563` (runs 81 to 89:
  `07e768a6`; the sim moved). **The time-lapse of 20 years** plays with `errors` [] (`critic/c90_tm_lapse20.log`).
- **Why still 8:** one 4-second sample at 52 fps at one tier of one battle, the worst frame unchanged, every other tier
  and the watches at 59.5 to 60: a regression to fix (R90-N3), not one a player leaves over.
- **Not 9:** the worst single frame at the battle spot is still 116 to 129 ms; R90-N3.

### Stability: **8** (scored afresh: `src/sim/`, `src/worker/`)
- **R209's guard and R89-N3 (R215):** the long step's spec now asserts its world sends a capital to the field; headless,
  88901 still does, five times on days 240 to 244, ending at `403266384` (`npx tsx critic/scripts/c90_fields.ts 88901
  9600`, `critic/c90_fields_88901.log`). `tests/unit/loopBounds.test.ts` (with `peaceWhy` and `capitalLand`): 16 of 16
  pass (`critic/c90_vitest_new.log`).
- **The page against the headless world, HEAD only:**
  - `c88_sameWorldMsgs 88901 400 12`: one end hash, `403266384`, the headless one (`critic/c90_swm_88901_400_12.log`).
  - `pageHash 88901` against HEAD's headless year hash `41707ffc`: 10 of 10 (`critic/c90_pageHash_88901.log`).
  - `c88_playHash 88901 9600 6` and `c88_playHash2 88901 9600 5` (a running game): 6 of 6 and 5 of 5 the headless hash at
    their tick (`critic/c90_phCmp.log`; see Setup for the probe's stale file).
  - The long step (`c89_longStep`, one step of 9,600 hours, 8 loads a seed, 4 at once) on six new plain seeds 90901 to
    90911 and two with heroes 90921, 90923: one end hash a seed, each plain one the headless hash
    (`critic/c90_ls_head_9600.log`, `critic/c90_ls_head_heroes_9600.log`, `critic/c90_headHash_909*.log`).
  - `workerDeterminism 90059 4380 24`: all arms `8a76e6ba` (`critic/c90_wd_89059.log`). `pageHash 1307`: 10 of 10.
  - The peace line's reads: 8 of 8 page runs at the headless hash (Diplomacy).
- **What holds besides:** 0 page errors in every output; five monkeys, 1,020 s, none hung; the page's save and load
  (`saveload_page 90937`) and Continue (`x_continue 90415`) exit 0; 11 checker runs and 90 `landingFuzz` runs.
- **Not 9:** no player route to R88-B1's old fault was ruled out (ADR-1143 says so); one seed pins it.

### Semantic zoom to unit level: **8** (scored afresh: `src/render/map/`)
- `look` at every tier (Map visuals), `z_zoom` 90911 and 90913 (at 2560 × 1305), `markers 90951`, `markerPop` 90951 and
  56951, `phz 90933`, `h_zoom`, `resize 90821`: exit 0 with 0 errors (`critic/c90_laneZ.out`).
- **Kept `heroPop 85905 300`:** 12 jumps zooming (run 89: 11), 4 panning (7); `heroPop 88905`: 6 and 6; 90905: 5 and 4
  (`critic/c90_heroPop.*.log`). Under this run's load; the count moves with the probe's timing.
- **Not 9:** the heroes' tags still jump while zooming (kept).

### Naval warfare: **8** (scored afresh: `src/sim/`)
- **`landingFuzz` on 15 new seeds:** 1 of 90 broken, a `slowClick` (R90-N1, non-blocking by ADR-914).
- **Sea fights of three new worlds** (`seaBattles` 90061, 90069, random 90067): 42, 45 and 51 battles; `seaBattlesLook`:
  42 of 42 and 45 of 45 seen at their camera, 0 with no fleet to see (`critic/c90_sb_89061.log`, `critic/c90_sbl_*.log`).
- **Repulses** (`c77_repulse` 90071, 90073): `broken 0`; "over: 1 landed, 2 thrown back"; "over: 1 thrown back; came
  ashore near Shanghai".
- **On the page, new seeds, all exit 0 with 0 errors** (`critic/c90_laneN.out`): `lland` ×3 (Norwich: "the transports
  of their landing were sunk, and no others can come to their port: the landing is over (Infantry division 1, Infantry
  division 4, Maus)"), `lhold 90905` (Valletta from Rome, "at sea: under attack by United Kingdom, held up" to the
  probe's end at 200 hours), `turnback 90901`, `whotold 90215`, `lbar 90221` at 393 × 852 and 734 × 343, `lbox 90223` at
  852 × 393 and 2560 × 1305, `nvpage` ×2, `seaclick 90913`, `sb_seaballs`.
- **The bulk landing set (part):** 358 of the 396 named `landingInvariants` setups: 353 the same output as run 89's, 5
  differ, 1 broken, the same old `slowClick` of 30041 setup 3517, one group (`bash critic/scripts/c90_bulkcmp.sh`,
  `critic/c90_bulkcmp.log`). The rest left out for time.
- **Not 9:** a held-up landing still says nothing of how long (`lhold`); `seaBattlesLook` lists 6 and 10 battles with one
  side alone at the camera.

### Tanks: **8** (scored afresh: `src/sim/`)
- **On the page at 2560 × 1305, heroes on, new seeds, exit 0 with 0 errors** (`critic/c90_laneT.out`): `c_battle 90915`
  (at 15 m/px 863 individuals and 10 wrecks drawn; at 25 m/px 11,437), `c_battle 7781`, `k_breakthrough 90979`,
  `kw_breakthrough 90923` (43 formations engaged by day 7, "God opened a breakthrough for Germany near Berlin"),
  `kwhist 90951`, `hero` 90425 and 90427 (393 × 852), `heropanel 90929`.
- **Heroes headless:** `heroBattle 90081`; `heroCeiling 90181`: "6 of 11 lives at or above the top decile" (run 89 on its
  seed: 11 of 16; new seeds, not compared), four TOG II and Char 2C lives and one Maus life MISS
  (`critic/c90_heroCeiling3_89181.log`).
- **Not 9:** nothing in a battle at 25 m/px says which side is winning; heroes' lives under the decile.

### Aircraft: **8** (scored afresh: `src/sim/`)
- `pl_planes 90925 GER POL` at 2560 × 1305: 43 sorties found at hour 2, a mark at every tier from 3,000 to 25 m/px in both
  looks; `w_wing 90927`: the followed wing's mark kept, the camera on it (`critic/c90_pl_planes.*.log`,
  `critic/c90_w_wing.90927.log`). Exit 0, 0 errors.
- `seaBattles`: 48, 58 and 51 sinkings out of battle by carriers' wings.
- **Not 9:** a wing at 60 m/px has no tag saying whose it is (as run 89).

### AI nuclear use: **8** (scored afresh: `src/sim/`)
- **Headless, 22 years:** `nukeIntercepts 90501`: 2 launches, 0 stopped (0.00 expected); `c77_nukecount 90503`: 12
  launched, 5 intercepted, 7 detonated (`critic/c90_nukeIntercepts_89501.log`, `critic/c90_nc_89503.log`).
- **On the page:** run 79's 64511 year-13 save strikes as in runs 85 and 89 ("Soviet Union struck France with an atomic
  bomb near Paris: 183,000 civilians killed; 56,936 men and 226 guns lost", "Go to", then Brive). This run's saves of
  7019, 32019 (year 20) and 90511 (year 13): no strike in 400 days, `ok []` (`critic/c90_an_ainuke.*.log`).
- **Not 9:** as run 89 (a faint spot at 600 m/px; the page case rests on one old save).

## Blocking issues

1. **R90-B1 (diplomacyWarDepth): the peace line says the peace holds "even after ten years of peace" days before the war
   it rules out, and names the wrong rival.**
   - **On the page, two-nation world 90441** (`node critic/scripts/c90_peaceWeek.mjs 90441 2 88 98` at 2560 × 1305,
     `critic/c90_pw_90441.log`, `critic/shots/c90pw_90441_d88.png`, `critic/shots/c90pw_90441_d98.png`): to day 90 the
     opened line reads "The AI starts a war on a nation it outmatches. Even after ten years of peace these would not:
     Lagunes has no rival within its reach. Western Australia has no rival within its reach." On day 91 it turns "for
     now"; on 8 April 1938 "Lagunes declared war on Western Australia", its only rival. Headless (`c90_reachCase.ts
     90441 2 88 93`, `critic/c90_reachCase_90441.log`): on day 91 each nation's first transport group comes to port and
     `seaTargetKm` gives each the other (2 at 10,966 km, 1 at 235 km). The "no rival within reach" reading ignores a lift
     on order, as `coming()` covers only the `noLift` branch.
   - **On the page, three-nation world 89401** (`c90_peaceWeek.mjs 89401 3 1595 1604`, `critic/c90_pw_89401.log`,
     `critic/shots/c90pw_89401_d1595_crop.png`): on 14 and 15 May 1942 the line reads "Madhya Pradesh would fight North
     Dakota, but across the sea that war costs more than it would win. La Libertad is bound to North Dakota by a truce
     or an overlord. North Dakota outmatches no rival…" under "Even after ten years of peace these would not". A truce
     between Madhya Pradesh and La Libertad has 2 days left (`c90_peaceCase.ts 89401 3 1590 1604`,
     `critic/c90_peaceCase_89401.log`: "truces 1-2:2d"); the line never names it. On 22 May 1942 "Madhya Pradesh declared
     war on La Libertad". A truce with a known end is skipped as "bound" and the next rival is given as the reason.
   - **How often** (`npx tsx critic/scripts/c90_peaceTruth.ts`, a read each day as the worker does; `critic/c90_pt*.log`):
     24 seeds of two and three nations, ten years each (`bash critic/scripts/c90_peaceWars.sh`; the first 14 seeds I ran
     predate the script's last-reason field and are left out of this count): of the 33 wars that came after a day the
     line gave reasons, 16 came within 30 days of that day, on 11 seeds (`critic/c90_peaceTruth_wars.txt`: seed, war
     day, days since the last reason; e.g. 90414 and 90446 one day, 90438 two, 90434 four, 89401 seven, 90441 eight).
     Ten of the 16 had "bound" (a truce) among the reasons; three "no rival within its reach" for every nation (90415,
     90416, 90441). Traced: 89401 (a truce's end) and 90441 (a lift on order); the other 14 not traced (90416 and 90433
     gave `noLift` 18 to 22 days before their war, cause not read).
   - **SPEC §2 (R216's line) says** each realm's reason is given "by the strategic AI's terms at its most restless;
     'for now' when one may yet declare". A realm whose truce ends in two days, or whose transports are being built,
     may yet declare: by SPEC's own words the line should say "for now" in both traced cases. ADR-1145's own claim, "a reason given then
     holds while the world is as it is", is what fails: a truce's end and a lift on order are both the world as it is.
   - **Fix:** a realm whose best target is held off only by a truce that ends, or by a lift on order (`landlessPowers`,
     transports building), gives no reason ("for now"), in every branch, not only `noLift`; or the line says the truce's
     days left and names that rival. **Seen fixed when:** `node critic/scripts/c90_peaceWeek.mjs 90441 2 88 98` and
     `... 89401 3 1595 1604` show "for now" (or the coming war's rival) on every day before the war; and on the same 24
     seeds (`c90_peaceTruth.ts 3 89401 4 10`, `3 90411 6 10`, `3 90431 8 10`, `2 90441 6 10`, then `c90_peaceWars.sh`)
     no war comes within 30 days of a day whose reasons were a truce or "no rival within its reach". The other causes
     (the 14 untraced, `noLift` among them) are to be traced by the builder; a war that a reason cannot foresee (a
     revolt, a new nation) is no defect.

## Non-blocking issues (prioritised)

1. **R90-N1 (naval): one `slowClick` of 90 on new seeds** (90103, setup 3517, two groups, orders for 8 days: "t118's
   click of 367 not ashore after 13.6 days, its best way 6.6"; `critic/c90_lf_90103_3517_g2_od8.log`). 1 of 90, under
   ADR-914's 5 %. **Seen fixed when:** `npx tsx tools/diag/landingInvariants.ts 90103 3517 120 90103 30 2 8` ends with 0
   broken.
2. **R90-N3 (performance): with heroes, at 7019's year-20 battle at 1,200 m/px in the classic look, one 4-second sample
   drops to 51.5 to 52.1 fps on HEAD in 4 of 4 runs, against 60.1 on `f27f48f5` beside it** (`critic/c90_pfab_*.log`,
   `sh critic/scripts/c90_perfAB.sh`). The tier's mean 56.8 to 57 (run 89: 59.7). What costs the frames was not read
   (R217's pass over the formations in the worker, or R214's change to the map's shader). **Seen fixed when:** the heroes
   arm (`TAG=x VW=2560 VH=1305 node critic/scripts/c85_pf_lookfps.mjs 7019 critic/c79_hseed7019_y20.bin`) has no sample
   under 58.5 fps in two runs.
3. **R90-N2 (stats and history): the peace line's "Why the peace holds" never reaches History.** A world kept at peace
   for ten years holds two events (`critic/shots/c85xf_89403_3.png`); the reasons live only in the line. **Better
   when:** History notes the peace's reason when it is first given or changes.
4. **Kept:** the heroes' tags' jumps while zooming (`heroPop 85905`: 12), the opened legend over the news on a phone on
   its side, R172, R192, ADR-1111.

## Run 89's cases re-run

| Run 89 case | Run 89 (`f27f48f5`) | HEAD (`fc767d88`) | Evidence |
|---|---|---|---|
| R88-N1, R88-N2 `c88_sizes 88903 0` | 16 `legend<landings` lines; 308/308 and 363/363 points | **fixed**: 0; the bar under the legend's title | `critic/c90_sz_88903.log` |
| R88-N3 `c88_relSaid 88905 400` | `cut` ["open"] at 393 × 659 | **fixed**: `cut` [] at all sizes | `critic/c90_rs_88905_400.log` |
| R88-N4 `c88_sizes 88901 400` | "Natio… ⚔ Portugal" | the world moved: "Soviet Uni… & 1 ⚔ Iraq & 2"; the rule as ADR-1144 (b) | `critic/shots/c90_r213_row_393x659.png` |
| R89-N1 `fewNationWars 3 89401 6 10` | a war on 3 of 6 | **better**: 5 of 6; and the page says why (with R90-B1) | `critic/c90_few3_89401.log` |
| R89-N1 `x_few 89403 3 3` | 2 events, nothing said | 2 events; "At peace · none outmatches another" | `critic/shots/c85xf_89403_3.png` |
| R89-N2 the band above the map at 2560 × 1305 | colour spread 31 | **fixed**: 1 | `critic/shots/c90edge_top_band.png` |
| R89-N3 the long step's pin | one seed's one event, unasserted | asserted (R215); 88901 still sends 5 capitals to the field | `critic/c90_fields_88901.log` |
| R88-B1's cases (`sameWorldMsgs`, `pageHash`, `playHash`, `playHash2`) | one hash; 10/10; 6/6; 5/5 | one hash; 10/10; 6/6; 5/5 (on HEAD's headless hashes) | `critic/c90_swm_*.log`, `critic/c90_pageHash_88901.log`, `critic/c90_phCmp.log` |
| `legendOpen`, `legendShot` ×2, `rowJitter`, `modeRow` ×2, `deskAttack` ×3 | 0, 0 moves, `fit0` [], 0 px | the same | `critic/c90_lo_*.log`, `critic/c90_rj_*.log`, `critic/c90_mr_*.log`, `critic/c90_da_*.log` |
| Lanes B and E (run 86's and 88's cases) | exit 0 | exit 0 | `critic/c90_laneB.out`, `critic/c90_laneE.out` |
| Kept `heroPop 85905` | 11 jumps zooming, 7 panning | 12, 4 | `critic/c90_heroPop.85905_300_head.log` |
| 20-year hashes 7019, 32019 | `ab927e1b`, `c3520016` | `fda52a36`, `61762049` (the sim moved: R217, R218) | `critic/c90_seed*_save.log` |
| Checkers, `landingFuzz` | 6 and 90, 0 broken | 6 + 5 few-nation, 0 broken; 90 with 1 `slowClick` | `critic/c90_*inv*.log`, `critic/c90_landingFuzz.log` |
| Monkeys | 5 sizes, 0 errors | 5 sizes, new seeds, 0 errors | `critic/c90_monkey.*.log` |
| Performance chain | tick 1.834 ms `ca4700f1`; 59.7 fps at 2560 × 1305 (plain and heroes) | tick 1.886 ms `242be86c`; plain 59.7 on run 89's save; heroes 56.8 to 57 (R90-N3; both builds beside each other) | `critic/c90_pf.status`, `critic/c90_pfab_*.log` |
| Bulk landing sets | 717 runs, as before R209 | 358 of 396 named; 353 the same, 5 differ, the same one break; the rest left out | `critic/c90_bulkcmp.log` |

## Design objections (none blocking)

- **ADR-1145 judges the peace "at the cap" of restlessness but not at the end of what holds it today.** A truce, an
  alliance and a navy on order all end on days the sim already knows; reading the AI at ten years of restlessness and
  today's bonds mixes two times, and R90-B1 is the result. A line that said "until 22 May" would read better than a
  claim about ten years.
- **Run 88's two** (the opened legend over the news on a phone on its side; the ranking's toggle hidden while the legend
  is open) stand.

## Ideas from other games (not scored)

- **Hearts of Iron IV** shows a truce's days left on the diplomacy screen; the peace line's "bound" row could carry them.
- **Ages of Conflict** lets a small custom world start with a set aggression (as run 89 said).

## Strengths (verified)

- **Batch 57 closed six of run 89's seven non-blocking issues on their own cases** (R88-N1 to R88-N3, R89-N1, R89-N2,
  R89-N3), measured here: 16 overlaps to 0, a cut line to none, a colour spread of 31 to 1, 3 of 6 worlds at war to 5.
- **The peace line's reads leave the world alone:** 8 page runs at five sizes end at the headless hash, and 38 headless
  seeds read every day for ten years end where unread ones do.
