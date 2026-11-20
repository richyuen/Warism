# Critic report, run 91 (focused): R219 to R222 (Batch 58), on `4f5c5427`

## The run

- **Mode: focused** (ADR-1138: every run).
- **Commit judged:** `4f5c54275e6433230f134e13802cdf4101b9cf0e`, HEAD at the start (`critic/c91_commit.txt`).
- **Last report:** run 90, focused, on `fc767d88`.
- **Time:** 12:30 to about 14:50 by the machine's clock.
- **The sizes** (ADR-1141): fresh scores rest on 393 × 659, 393 × 852, 734 × 343, 852 × 393 (touch, pixel ratio 3 where a
  probe takes it) and 2560 × 1305. A probe that takes no size ran at its own 1600 × 900 (said where it matters).
- **Left out for time:** a real background tab (as runs 89 and 90); Malta's 18 landings on the page and run 85's
  nuke-seed set. Every bulk landing set ran in full this time (below).
- **A fault of mine, mended:** on Windows `critic/scripts/c91_lanes.sh` (my lane driver) and `c91_laneS.sh` (the
  stability lane) are one file, so at 12:58 "lane S" ran the driver again and re-ran lanes M, C, V and D over their own
  logs until I stopped it at 13:03. The stability lane is now `c91_laneStab.sh`, the driver `c91_groups.sh`; the probes
  the restart cut short were re-run whole by `c91_laneR.sh` (monkeys 91803 and 91813, `fw2_forcewar 91935`,
  `timeLapse 91941`, `look 91901`); the rest of those lanes had finished both times. `c91_laneM.out`, `c91_laneC.out`,
  `c91_laneV.out` and `c91_laneD.out` hold only the second start; the probes' own logs are whole. A second headless runner
  (`c91_runH2.sh`) was started twice by me; the second copy's queue was stopped (its jobs ran once, by a claim per line).

### What changed since run 90

`git diff --stat fc767d88 HEAD` (code): `src/sim/ai/peaceWhy.ts`, `src/sim/systems/war.ts`, `src/sim/sim.ts`,
`src/sim/history.ts`, `src/shared/events.ts`, `history.ts`, `protocol.ts`, `src/ui/WarBanners.tsx`, `historyText.ts`,
`src/ui/i18n/en.json`, `tests/helpers/slowClick.ts`, tests. ROADMAP Batch 58: R219 (R90-B1, the peace line gives no reason
that ends before its cap; ADR-1148), R220 (R90-N3, `inReach` on typed arrays), R221 (R90-N1, the `slowClick` checker keeps
a division re-clicked onto its own landing in its click), R222 (R90-N2, `PeaceHeld` rows in History; ADR-1149).

- **The sim's course in 1938 did not move:** the 20-year hashes of plain 1938 are 7019 `fda52a36` and 32019 `61762049`,
  as run 90 (`critic/c91_seed7019_save.log`, `critic/c91_seed32019_save.log`); the replay's 54 yearly starts rebuilt on
  HEAD are the same bytes as run 90's, 54 of 54 (`sh critic/scripts/c91_starts.sh`, `critic/c91_starts.log`). R220's
  claim that `inReach` gives the same answer holds on both. Few-nation worlds' hashes move (R222's History rows) by design.
- The diff touches `src/sim/systems/` and `src/sim/ai/`, so no bulk set is carried (ADR-917, ADR-959): all ran.

### Scored afresh, and why

| Dimension | Why |
|---|---|
| `diplomacyWarDepth` | under its bar and blocked in run 90 (R90-B1); touched (`src/sim/`, `i18n`) |
| `emergentDynamics`, `stability`, `naval`, `tanks`, `aircraft`, `aiNukes` | touched: `src/sim/` |
| `statsHistory`, `uiUxPolish` | touched: `historyText.ts`, `WarBanners.tsx`, `i18n` |
| `godMode`, `editorScenarios` | touched: `src/ui/i18n/` |
| `mapVisuals`, `performance` | the rotation: of the three untouched (`mapVisuals`, `performance`, `semanticZoom`), all last fresh in run 90, the first two in the DIMENSIONS order (ADR-1138, ADR-1147) |

Carried: `semanticZoom` 8 (run 90, `fc767d88`). Its kept case re-run all the same (below).

### Setup

- **HEAD's build:** `critic/c91_dist` (`sh critic/scripts/c91_build.sh`, build exit 0), served on 127.0.0.1:5491; the
  replay starts rebuilt on HEAD put in it (`c91_starts.sh`) before the 1938h cases ran.
- **Lanes** (`critic/scripts/c91_lane*.sh`, each sourcing `c91_r.sh`; copies of run 90's on new seeds 91xxx): P the peace
  line, R219's and R222's ATs (new), M monkeys, C God Mode and diplomacy, V map visuals, D editor, scenarios and stats,
  N naval, T tanks, aircraft and nukes, Stab stability, W a 12-year watch, R the re-runs above, then run 90's named cases
  X, A, L, E, B. Headless: `c91_long.sh` (every-run jobs), `c91_jobsH.txt` by `c91_runH.sh` and `c91_runH2.sh`,
  `c91_bulk.sh`; `c91_chainPerf.sh` alone at the end.
- **New scripts:** `c91_peaceHistPage.mjs` (R222's rows in History at a size: the row whole and in view, the kind and
  nation filters, the time-lapse from History), `c91_peaceHist.ts` (headless: PeaceHeld rows a seed, during a war,
  flipping back, within 30 days of a war), `c91_forNow.ts` (how long the line says "for now" and how each stretch ends),
  `c91_forNowWhy.ts` (which realm and which of R219's causes), `c91_massHist.ts`, `c91_scan.mjs`.
- **At the end:** the preview server on 5491 and every job I started were stopped; the worktree `critic/wt` (made twice,
  at `fc767d88`) was removed after its `node_modules` link was unlinked. The listeners on 5451, 5452, 5460 to 5463 and
  5470 were there before this run and are not mine; they were left alone. As in run 90, a probe of the first lanes
  rewrote the tracked `critic/c85_critic_standoff.warsim-scenario` at 12:58:45 (592,870 to 592,018 bytes); the critic's
  permission guard refused my restoring it from HEAD's copy, so it stands modified for the builder to restore.

## Verdict

**No blocking issue. Every dimension at its bar** (`diplomacyWarDepth` back to 8, `performance` 8). Run 90's
blocking issue R90-B1 and its non-blocking R90-N1, R90-N2, R90-N3 are fixed on their own cases (table below). New
non-blocking issues: **R91-N1** (R221's checker change, on the same sim: five named landing runs from 0 broken to 1,
and one from 1 to 0 by a kept division's landing),
**R91-N2** (a three-nation world at peace fifteen years whose line says only "for now" every day; as before R219).

**The rule checkers on new seeds:** 10 runs of five years, 0 broken: `diploInvariants` 91001, 91005 (heroes), random
91003; `worldInvariants` 91051, 91053 (heroes), random 91055; and the war-and-peace rules on random worlds of three and two
nations (`c90_diploN.ts`) 91601 and 91603 each (`critic/c91_diploinv_*.log`, `critic/c91_wi_*.log`,
`critic/c91_diploN*_*.log`).

**`landingFuzz --seeds 15 --first 91101`:** 0 of 90 runs broken (`critic/c91_landingFuzz.log`).

**The 20-year hashes of plain 1938:** 7019 `fda52a36`, 32019 `61762049` (run 90's).

**Monkeys:** five on new seeds at the five supported sizes (pixel ratio 3, heroes on), 1,020 s in all, 0 page errors,
none hung (`critic/c91_monkey.*.log`; 91803 and 91813 from lane R).

**Page errors:** 0 in the 299 outputs of this run named `c91*`/`c90*` since 12:30 (`node critic/scripts/c91_scan.mjs`).

## Batch 58 against its ATs

| Item | AT | HEAD | Evidence |
|---|---|---|---|
| R219 (R90-B1) | `c90_peaceWeek.mjs 90441 2 88 98` and `89401 3 1595 1604` read "for now" (or the coming war) every day before the war | **met**: 90441 days 88 to 97 "At peace for now", day 98 "Lagunes declared war on Western Australia"; 89401 days 1595 to 1602 "for now", day 1603 "Madhya Pradesh declared war on La Libertad"; 0 errors | `critic/c91_pw_90441.log`, `critic/c91_pw_89401.log`, `critic/shots/c90pw_90441_d98.png` |
| R219 | the 24 seeds: no war within 30 days of a day with a truce or "no rival within reach" | **met**: 62 wars, 1 after a day with reasons (89402, 2,186 days on), 0 within 30 days (run 90: 16 of 33); reasons on 18,767 of 57,474 peace days (32.7 %); every seed's read and unread hash the same | `FILES="c91_pt3b_* c91_pt3c_* c91_pt2c_*" bash critic/scripts/c91_peaceWars.sh`, `critic/c91_peaceTruth_wars_AT.txt` |
| R220 (R90-N3) | the heroes arm at 2560 × 1305, no sample under 58.5 fps in two runs | **met**: least 4-second sample 58.9 and 58.8 fps, both at 1,200 m/px classic (run 90: 51.5 to 52.1) | `critic/c91_pf_lookfps_wh.log`, `critic/c91_pf_lookfps_wh2.log` |
| R221 (R90-N1) | `landingInvariants 90103 3517 120 90103 30 2 8`: 0 broken | **met**: 0 broken ("2 divisions kept by a click to the same landing") | `critic/c91_li_90103_r221.log` |
| R222 (R90-N2) | History notes the peace's reason, 89403 and one more seed, at the five sizes | **met**: "1 January 1938 The world is at peace: none outmatches another" (89403) at 2560 × 1305, 393 × 852, 734 × 343, 852 × 393; "2 April 1938 The world is at peace: rivals too far over the sea" (55404) at 2560 × 1305 and 393 × 659; each row whole and in the view, the filter "Peace holds" keeps it alone, no sideways scroll, 0 errors | `critic/c91_phh_*.json`, `critic/shots/c91phh_89403_3_393x659_kind.png` |

## Scores

### Map visuals and readability: **8** (scored afresh: the rotation)
- **Every tier at the five sizes, new seeds, 0 errors** (`look` 91901 at 2560 × 1305 on days 45, 180 and 400 (re-run in lane
  R), 91903 at 393 × 852, 91907 at 852 × 393, 91909 at 734 × 343, 91911 at 393 × 659). Europe at 3,000 m/px on 6 February
  1939 at 2560 × 1305: names on their land, counts on flags, the front's glow, the war row and the legend clear of each
  other (`critic/shots/c85look_91901_2560x1305_d400_3eur3000.png`); Germany at 3,000 m/px on the upright phone with Safari's
  bars, the news, the war row and the bars whole (`critic/shots/c85phone_91911_393x659_d300_3eur3000.png`).
- **The page's boxes in the map modes at the five sizes on a new world** (`c88_sizes 91901 300`, `critic/c91_sz_89901.log`,
  0 errors at each size): `outs` [] in every state; the covers are the ones SPEC allows and run 88 named (the opened legend
  over the news on a phone on its side, the opened ranking over the row's end).
- **Run 86's own cases:** `c86_modeRow` 85901 and 84901: `fit0` [], `stale` [], `covering` [] in every mode;
  `c86_deskAttack` 84901, 84901 wide, 88907 wide and 91907 wide, exit 0 (`critic/c91_mr_*.log`, `critic/c91_da_*.log`).
- **Not 9:** kept: the heroes' plates over labels (ADR-1111; "Sovetsky Soyuz"'s plate over the Baltic and "TOG II" beside
  London's name in the picture above); the AI's bomb as a faint spot (R172).

### Diplomacy, war, alliances, puppets, revolts: 7 → **8** (scored afresh: blocked in run 90; `src/sim/`)
- **Why it moves:** R90-B1, the only thing that held it at 7, is fixed on its own two cases and on its 24 seeds (the table
  above). **Both builds, the same cases** (a worktree at `fc767d88`, headless, the line read daily as the worker does):
  90441 on `fc767d88` "last reason given day 90 (8 before)" the war of day 98, on HEAD no reason before it; 89401 on
  `fc767d88` "last reason given day 1596 (7 before)" the war of day 1603 (`far`, `bound`, `equal`), on HEAD none before any
  of its four wars (`critic/c91_wt_pt_90441.log`, `critic/c91_wt_pt_89401.log`; `critic/c91_pt2c_90441.log`,
  `critic/c91_pt3b_89401.log`).
- **New seeds, the line's honesty both ways** (`c90_peaceTruth.ts` on 3-nation 91411-91418 and 2-nation 91441-91448, ten
  years): 35 wars, one after a day with reasons (91418, 38 days on), none within 30 days; every read and unread hash
  equal (`FILES="c91_pt3n_* c91_pt2n_*" bash critic/scripts/c91_peaceWars.sh`, `critic/c91_peaceTruth_wars_new.txt`).
  And "for now" (no reason): on 90431-90434 and 91441-91444 every stretch of "for now" ended in a war, at the run's end,
  or (91442, 91 days) in a reason; the longest, 90434's 2,426 days, in a war (`critic/c91_fn3_90431.log`,
  `critic/c91_fn2_91441.log`, `critic/c91_fn2_91443.log`). One world is the exception: R91-N2 (below).
- **On the page:** the line on new few-nation worlds at five sizes (`c90_peace.mjs` 91403, 91407, 91409, 91447, 91449):
  exit 0 and each run's end hash the headless world's at its hour, 5 of 5 (`critic/c91_laneP.out`).
- **Checkers:** 10 runs on new seeds, 0 broken (Verdict).
- **Headless, new seeds:** `warOpening` 91211, 91213, 91215 over three years: 153 wars; the defender ahead in land at day
  30 in 4, 2 and 0 of 29, 24 and 22 (`critic/c91_warOpening.log`; run 90's seeds: 149 wars, 3, 3, 2; new seeds, not
  compared). `c77_firstdecl` on ten seeds: 55 first declarations in 60 days, 0 over 6,000 km. `c77_piles` at day 365 on five plain
  seeds: one war over 4:1 (ITA vs POR 1:5 on 91139; `critic/c91_piles_p.log`; run 90: two of five). `pragueFall 91201`: Prague on day 17. `c77_massTold` on three
  seeds: told 55, a war after 45, given up 10 (`critic/c91_massTold.log`).
- **On the page, new seeds, all exit 0 with 0 errors** (`critic/c91_laneC.out` and the probes' logs): `fw2_forcewar` 91935
  and 91939, `peacebtn` 91217 at 852 × 393 and 2560 × 1305, `manywars 91219` at 393 × 852, `rg_relations` 91929 at
  2560 × 1305 (heroes) and 91931 at 393 × 852, `joinseen 91427`, `histgrep 91309`, `warsof 91309`; `c88_relSaid 88905 400`:
  `cut` [] at all five sizes.
- **Not 9:** R91-N2; the line still says nothing of when ("until 22 May": run 90's design objection, kept by ADR-1148).

### Emergent world dynamics: **8** (scored afresh: `src/sim/`)
- **A 12-year watch on the page at 2560 × 1305** (`long_watch2 91943`, plain; `critic/c91_long_watch2.91943_12__plain.log`):
  59.7 to 60 frames/s each year, the longest gap between frames 150 ms, wars in the row in 11 years of 12, `ok []`.
- **Few-nation worlds** (`fewNationWars`): three nations 91401-91406 a war on 5 of 6; two nations 91421-91426 on 2 of 6
  (run 90's seeds: 5 of 6 and 2 of 6); run 90's 89401-89406 still 5 of 6; 85401 still a war on day 110
  (`critic/c91_few3*.log`, `critic/c91_few2.log`).
- **`c77_topArea 91097`, 25 years:** the first three by land changed 5 times, 6 orders; the longest still spells USA 16
  years, Brazil 14 (`critic/c91_toparea_91097.log`; run 90's seed: 10 changes; new seed, not compared).
- **`c77_farConquests`, five seeds, two years:** 28.2 capitals taken a seed, 9.8 far (run 90: 28.2 and 10.0).
- **`borderLog 91099`, 20 years:** 19 of 19 yearly maps alike after replay, the record 3.43 % of the save (bar 7 %).
- **`capitalMoves`** on the two 20-year saves: 8 moves, 8 on the most-held land of 8 possible (as run 90).
- **Not 9:** four of six new two-nation worlds keep the peace ten years (ADR-1069, ADR-1129); one three-nation world
  keeps it fifteen with nothing said of why (R91-N2).

### God Mode: **8** (scored afresh: `i18n`)
- **At 2560 × 1305 and the probes' 1600 × 900, new seeds, exit 0 with 0 errors** (`critic/c91_*` logs): `a_god_nuke` 91917
  and 91927, `q_god_tools` 91919 and 91923 (Prague razed and told: "4 January 1938 Prague in Czechoslovakia was razed"),
  `undo2` 91211 and 91213 (nuke, revolt, nation and city each undone to the start hash), `fw2_forcewar` 91935 and 91939,
  `h_god`; `h_godtab` at 393 × 852, 393 × 659 and 852 × 393.
  - `undo2 91211` at 2560 × 1305 shows `["raze",0,true]`: the probe clicks (800, 450), a point of its own 1600 × 900, and
    at 2560 × 1305 that is open land west of Warsaw (`critic/shots/c85u2_91211_raze_1act.png`): my probe's size, not a
    defect; `q_god_tools` razes Prague by its city.
- **The replay on starts rebuilt on HEAD:** `godpeace 1942 JAP 'United States'` ("1 January 1942 Japan made peace with
  United States", then the track ended), `god42 1942 91542`, `takescore 1942 GER 240`: exit 0, `errors` [].
- **Not 9:** as run 90 (R172's ring, the phone's God toolbar two rows of the upright view).

### Editor and scenarios: **8** (scored afresh: `i18n`)
- `g_editor` 91921 and 91925 (at 2560 × 1305), `x_editor` 91443 and 91445, `os2_scen` on run 26's standoff scenario: all
  exit 0 with 0 errors. `g_editor 91921` ends with the editor's Poland striking Berlin, told with its count ("334,000
  civilians killed; 327 men lost").
- **Not 9:** as run 90 (no new editor feature; nothing found a player would leave over).

### Stats and history: **8** (scored afresh: `historyText.ts`, `i18n`)
- **R222 on the page** (`bash critic/scripts/c91_laneP.sh`, `c91_peaceHistPage.mjs`): the AT's table above; besides, the
  kind filter lists "Peace holds" and keeps the row alone (`critic/shots/c91phh_89403_3_393x659_kind.png`), the nation
  filter drops it (an unplaced row of no nation), the time-lapse opened from History plays with 0 errors, on 89403 and
  55404 and on new worlds 91403, 91405 (at war: no row), 91443 ("for now": no row), 91445 ("2 April 1938 The world is at
  peace: none outmatches another").
- **Headless** (`c91_peaceHist.ts` on 89401-89406, 91481-91488, 91491-91498, ten years): 12 PeaceHeld rows on 22 seeds,
  never one reason told twice in a row of peace, none within 30 days before a war (`critic/c91_ph*.log`). One row
  (91483, day 2735, "far") stands on a day my day-start sample saw a war; the war-ending peace and the row likely share the
  AI's hour (`notePeace` runs after `strategicAi`); not traced, not filed.
- `timeLapse` 91941 at 2560 × 1305 and 91945 at 393 × 852 and 734 × 343, `tlMonths 91947`, `histPlace 91961` at
  2560 × 1305 and 393 × 659: exit 0 with `errors` []. Run 88's lane E (34 cases), exit 0.
- **Not 9:** a world at peace for "for now" holds no row at all (91443, 91415: R91-N2).

### UI/UX and polish: **8** (scored afresh: `WarBanners.tsx`, `historyText.ts`, `i18n`)
- **The peace line and History's new row at the five sizes:** above; nothing cut, nothing out of the view, no sideways
  scroll.
- **Run 90's named UI cases:** `c88_sizes 88903 0`: 0 `legend<landings` (R88-N1, R88-N2 stay fixed); `c88_relSaid 88905
  400`: `cut` [] at all sizes; lanes A and B (run 87's and 86's cases: `legendOpen`, `legendShot` ×2, `rowJitter`,
  `modeRow` ×2, `deskAttack` ×4, `deskRow` ×5, `rowShot`, `crossWidth`, `deskFit`, `moreClick`, `relSide`, `relFoot`,
  `graphSize`, `phoneRow` ×2, `phoneToDesk` ×2, `rotate`): all exit 0 (`critic/c91_laneA.out`, `critic/c91_laneB.out`).
- **Not 9:** the opened legend over the news on a phone on its side (`news<legend 634/816` at 734 × 343 and 852 × 393,
  `critic/c91_sz_88903.log`, as runs 88 to 90); a panel over the news on a phone.

### Performance: **8** (scored afresh: the rotation)
- **The run:** `sh critic/scripts/c91_chainPerf.sh`, from 14:12:47 to 14:35:03, with no other job of mine running (every
  lane, the bulk sets and the headless jobs ended, the worktree removed; only the preview server; the machine's load 0 %
  at the start). Every stage exits 0 (`critic/c91_pf.status`).
- **The tick of seed 99 over five years:** plain 1.808 ms mean, hash `242be86c` (`critic/c91_tick99.log`; run 90: 1.886
  ms, the same hash); with heroes 1.695 ms, `95b922e2` (`critic/c91_tick99h.log`; run 90: 1.786 ms, the same hash). The
  same worlds, one run each, not paired: 4 to 5 % faster, within what a sequential pair drifts; R220's `inReach` is the
  only change on the tick's path.
- **Frames at 2560 × 1305 at 7019's year-20 battle spot, 3,000 to 30 m/px in both looks** (`node critic/scripts/c86_pfsum.mjs`):

  | World | Least mean fps | Least 4-s sample | Highest p95 | Worst frame | Run 90 |
  |---|---|---|---|---|---|
  | Plain, HEAD's own year-20 save | no formation engaged at load: no battle spot (as run 90; `critic/c91_pf_lookfps_w.log`) | | | | the same |
  | Plain, run 89's year-20 save loaded on HEAD | 59.6 | | 18.3 ms | 130 ms | 59.7, 18.0, 123 |
  | With heroes (run 79's save), twice | **59.7 and 59.6** | **58.9 and 58.8**, both at 1,200 m/px classic | 18.1 ms | 123 and 120 ms | 56.8 to 57; 51.5 to 52.1 at 1,200 m/px (R90-N3) |

  - **R90-N3 fixed (R220):** the 1,200 m/px classic samples `[60.1, 60, 58.9]` and `[59.8, 60.2, 58.8]`
    (`critic/c91_pf_lookfps_wh.log`, `critic/c91_pf_lookfps_wh2.log`), the AT's bar 58.5; run 89's build read 58.8 at the
    same spot in run 90.
- **`lookFps 7019`** on HEAD's year-20 save: forced 58.8 to 60 frames/s at every tier, a draw of 0.8 to 2.9 ms
  (`critic/c91_lookfps.log`; run 90: least 58.5).
- **The individual tier, `x_indfps 64111`:** 60 fps, p95 16.8 ms, up to 10,854 individuals drawn (`critic/c91_xi.log`).
- **Touch (`tm_touch`):** 59.5 fps with 255 ticks/s and nothing selected (`critic/c91_tm_touch.alone.log`; run 90: 59.5
  and 235).
- **A 12-year watch on the page alone at 2560 × 1305** (`long_watch2 91945`, heroes on): 59.8 to 60.1 fps each year, the
  longest gap between frames 83 ms, `ok []` (`critic/c91_lw_91945_alone.log`). The plain watch under this run's load
  (91943): 59.7 to 60.
- **Run 79's 7019 year-20 save** loads and runs a year at 1.804 ms a tick, ending at `916c1563` (run 90's). **The
  time-lapse of 20 years** plays with `errors` [] (`critic/c91_tm_lapse20.log`).
- **Not 9:** the worst single frame at the battle spot is still 120 to 130 ms (a frame of 7 to 8 missed at Max).

### Stability: **8** (scored afresh: `src/sim/`)
- **The page against the headless world:**
  - `c88_sameWorldMsgs 88901 400 12`: one end hash, `403266384` (run 90's) (`critic/c91_swm_88901_400_12.log`).
  - `pageHash 88901` against the headless year hash `41707ffc`: 10 of 10; `pageHash 1307`: 10 of 10
    (`critic/c91_pageHash_88901.log`, `critic/c91_pageHash_1307.log`).
  - `c88_playHash 88901 9600 6`: 6 of 6 at the headless hash of their tick, read against run 90's HEAD headless file
    (`node critic/scripts/c90_phCmp.mjs critic/c90_headHash_88901_from9600.log critic/c91_ph_88901_9600_6.log`; valid
    because 1938's hashes did not move); the probe's own "0 of 6" reads run 88's stale file, as run 90 said.
  - The long step (`c89_longStep`, one step of 9,600 hours, 8 loads a seed) on six new plain seeds 91901 to 91911 and two
    with heroes 91921, 91923: one end hash a seed, each plain one the headless hash (`critic/c91_ls_head_9600.log`,
    `critic/c91_ls_head_heroes_9600.log`, `critic/c91_headHash_919*.log`).
  - `workerDeterminism 91059 4380 24`: all arms `b57c8c22` (`critic/c91_wd_91059.log`).
  - The peace line's reads: 5 of 5 page runs at the headless hash; 43 headless seeds read daily end where unread ones do.
- **What holds besides:** 0 page errors in every output; five monkeys, 1,020 s, none hung; `saveload_page 91937` and
  `x_continue 91415` exit 0; 10 checker runs, 90 `landingFuzz` runs.
- **Not 9:** as run 90 (no player route to R88-B1's old fault ruled out; one seed pins it).

### Semantic zoom to unit level: **8** (carried from run 90, `fc767d88`)
- Its kept case re-run on HEAD: `heroPop 85905 300`: 12 jumps zooming, 11 panning (run 90: 12 and 4; the count moves with
  the probe's timing under load; `critic/c91_heroPop.85905_300_head.log`); `heroPop 88905`: 6 and 5. No change to
  `src/render/` since run 90.

### Naval warfare: **8** (scored afresh: `src/sim/`)
- **`landingFuzz` on 15 new seeds:** 0 of 90 broken. **R90-N1's case** (90103): 0 broken.
- **The bulk landing sets, in full** (due: `src/sim/systems/`, `src/sim/ai/` changed): the 396 named `landingInvariants`
  setups, the 153 stuck-return runs and the 168 next-voyage runs (`bash critic/scripts/c91_bulk.sh`, all finished;
  `bash critic/scripts/c91_bulkcmp.sh`, `critic/c91_bulkcmp.log`):
  - Named setups with run 90's file (358): 219 the same, 139 differ, **every difference in the `slowClick` lines only**
    (the "kept by a click to the same landing" count: R221), the sim's notes the same in all 358; broken: 30041 setup
    3517 one group (old, as run 90) and **27037 setup 3517 two groups, new** (R91-N1). The 38 run 90 left out: 0 broken.
  - Stuck-return: 1 broken of 153, the same 27037 case's `slowClick` (`critic/c91_sr/head_27037_3517_g2.log`).
  - Next voyage: 6 of 168 broken (run 89's set: 3, on the sim before R217). Its new ones run alone on both builds: 31103
    setup 15101 one and two groups, 31153 and 31165 setup 3517 two groups break on HEAD and not on `fc767d88`; 31157
    setup 3517 one group the other way (R91-N1).
- **Sea fights of three new worlds** (`seaBattles` 91061, 91069, random 91067): 68, 53 and 45 battles; `seaBattlesLook`:
  68 of 68 and 53 of 53 seen at their camera, 0 with no fleet to see (8 and 7 with one side alone)
  (`critic/c91_sbl_*.log`).
- **Repulses** (`c77_repulse` 91071, 91073): `broken 0`.
- **On the page, new seeds, all exit 0 with 0 errors** (`critic/c91_laneN.out`): `lland` ×3 (Norwich: "the transports of
  their landing were sunk, and no others can come to their port: the landing is over"; Bremerhaven "over: 3 landed";
  Shanghai "over: 3 landed"), `lhold 91905` (Valletta, "at sea: under attack by United Kingdom, held up" to the probe's end
  at 200 hours), `turnback 91901`, `whotold 91215`, `lbar 91221` at 393 × 852 and 734 × 343, `lbox 91223` at 852 × 393 and
  2560 × 1305 ("at sea: lands in about 3 days", then 2), `nvpage` ×2, `seaclick 91913`, `sb_seaballs`.
- **Why still 8 with R91-N1:** a `slowClick` break is a timing bound and non-blocking (ADR-914); 0 of 90 on new seeds.
- **Not 9:** a held-up landing still says nothing of how long (`lhold`); R91-N1.

### Tanks: **8** (scored afresh: `src/sim/`)
- **On the page at 2560 × 1305, heroes on, new seeds, exit 0 with 0 errors** (`critic/c91_laneT.out`): `c_battle 91915`
  (at 25 m/px 9,966 individuals drawn, 3 wrecks), `c_battle 7781`, `k_breakthrough 91979`, `kw_breakthrough 91923` (45
  formations engaged by day 7), `kwhist 91951`, `hero` 91425 and 91427 (393 × 852), `heropanel 91929`.
- **Heroes headless:** `heroBattle 91081`; `heroCeiling 91181`: "7 of 14 lives at or above the top decile" (run 90's seed:
  6 of 11; new seeds, not compared) (`critic/c91_heroCeiling3_91181.log`).
- **Not 9:** nothing in a battle at 25 m/px says which side is winning; heroes' lives under the decile.

### Aircraft: **8** (scored afresh: `src/sim/`)
- `pl_planes 91925 GER POL` at 2560 × 1305: 43 sorties found at hour 2, a mark at every tier from 3,000 to 25 m/px in both
  looks; `w_wing 91927`: the followed wing's mark kept, the camera on it (`critic/c91_pl_planes.*.log`,
  `critic/c91_w_wing.91927.log`). Exit 0, 0 errors.
- `seaBattles`: 7, 33 and 77 sinkings out of battle by carriers' wings.
- **Not 9:** a wing at 60 m/px has no tag saying whose it is (as run 90).

### AI nuclear use: **8** (scored afresh: `src/sim/`)
- **Headless, 22 years:** `nukeIntercepts 91501`: 0 launches; `c77_nukecount` 91503: 0, 91505: 0, 91507: 3 launched, 0
  intercepted, 3 detonated (`critic/c91_nukeIntercepts_91501.log`, `critic/c91_nc_*.log`; run 90's seeds: 2 and 12; new
  seeds, not compared; 1938's course is run 90's, so the rule is unchanged).
- **On the page:** run 79's 64511 year-13 save strikes as in runs 85 to 90 ("Soviet Union struck France with an atomic bomb
  near Paris", then Brive; "Go to"). This run's saves of 7019, 32019 (year 20) and 91511 (year 13): no strike in 400 days,
  `ok []` (`critic/c91_an_ainuke.*.log`).
- **Not 9:** as run 90 (a faint spot at 600 m/px; the page case rests on one old save; three of four new 22-year seeds
  launch nothing).

## Blocking issues

None.

## Non-blocking issues (prioritised)

1. **R91-N1 (naval): R221's change to the `slowClick` checker, on the same sim, turns five named landing runs from 0
   broken to 1, and one from 1 to 0 by a slow division's click passing on another's landing.** Run on HEAD and on `fc767d88` beside it (a worktree; 1938's hashes are equal on both, so only the checker
   differs): 27037 setup 3517 two groups, "t1749's click of 367 not ashore after 13.8 days, its best way 6.8"; 31103
   setup 15101 one group and two, "t269's click of 270 not ashore after 9.0 days, its best way 2.0"; 31153 setup 3517 two
   groups, "t54's click of 367 not ashore after 11.0 days, its best way 4.0"; 31165 setup 3517 two groups, "t453's click of
   365 not ashore after 13.9 days, its best way 6.9" (`critic/c91_li/named_27037_3517_g2_od-.log`,
   `critic/c91_nvli_*.log` on HEAD; `critic/c91_wtli_*.log` on `fc767d88`, each "0 broken"). The other way: 31157 setup
   3517 one group breaks on `fc767d88` ("t1661's click of 366 not ashore after 14.3 days, its best way 7.3",
   `critic/c91_wtli_31157_3517_g1.log`) and not on HEAD, where 367, kept in that click, lands at 7.8 days and the click
   counts as ashore by its first division ("t1661's click of 366,367 ashore after 7.8 days",
   `critic/c91_nvli_31157_3517_g1b.log`): 366's 14-day wait is no longer judged. R221 keeps a division in its
   earlier click while it stays aboard the same landing near the same water; so each of these is either a slow voyage the
   old checker hid behind a re-click (9 to 14 days against a best of 2 to 7), or the new rule keeping a division in a click
   whose voyage the re-click did change. R221's own read (30 fresh seeds, "each broken the same on the checker before")
   did not cover the named sets. Non-blocking (ADR-914). **Seen better when:** each of the five traced (a slow voyage
   named and its cause fixed, or the checker's rule narrowed so that `npx tsx tools/diag/landingInvariants.ts 31103 15101
   120 31103 30,90 1` and the others end with 0 broken while `... 90103 3517 120 90103 30 2 8` stays 0), and a kept
   division no longer lets a click pass while another division of it waits past the bound (31157 3517 one group).
2. **R91-N2 (diplomacyWarDepth): a three-nation world at peace fifteen years whose line says "At peace for now" every day
   and gives no reason, nor History a row.** Random world 91415, three nations: 5,475 days at peace, 0 days with a
   reason, 0 wars, 0 massings in ten years (`npx tsx critic/scripts/c90_peaceTruth.ts 3 91415 1 15`,
   `critic/c91_pt_91415_15y.log`; `critic/c91_mh_91415.log`). "No nation here has a reason for peace that holds: a war may
   yet come" for fifteen years is R89-N1's silence in other words. Not R219's: on `fc767d88` the same seed reads the same
   ten years ("why 0", the same hash 359971103; `critic/c91_wt_pt_91415.log`), and a lift on its way explains none of it: 41 of 41
   samples say "for now", realms 1 and 3 have no transport and order none, realm 2's lift is coming on days 0 and 90 only
   and it has a group at port from day 180 (`critic/c91_fnw_91415.log`). The line asks each realm at ten years'
   restlessness (ADR-1145); this world passed ten years of peace and went five more with no war and no massing. Which of ADR-1145's other "for now" causes holds (a target chosen and not refused, a truce, a target barred)
   was not traced. **Seen better when:** 91415's cause traced, and either a war comes or the line names what it waits on.
3. **Kept:** the heroes' tags' jumps while zooming (`heroPop 85905`: 12), the opened legend over the news on a phone on its
   side, R172, R192, ADR-1111.

## Run 90's cases re-run

| Run 90 case | Run 90 (`fc767d88`) | HEAD (`4f5c5427`) | Evidence |
|---|---|---|---|
| R90-B1 `c90_peaceWeek.mjs 90441 2 88 98` | "no rival within its reach" to day 90, war day 98 | **fixed**: "for now" days 88 to 97 | `critic/c91_pw_90441.log` |
| R90-B1 `c90_peaceWeek.mjs 89401 3 1595 1604` | "bound" (a truce with 2 days left), war day 1603 | **fixed**: "for now" days 1595 to 1602 | `critic/c91_pw_89401.log` |
| R90-B1 the 24 seeds (`c90_peaceWars.sh`) | 16 of 33 wars within 30 days of a reason | **fixed**: 0 of 62 (1 after a reason, 2,186 days on) | `critic/c91_peaceTruth_wars_AT.txt` |
| R90-N1 `landingInvariants 90103 3517 ... 2 8` | 1 broken (`slowClick`) | **fixed**: 0 broken; but R91-N1 | `critic/c91_li_90103_r221.log` |
| R90-N2 89403's History | 2 events, nothing of the peace | **fixed**: "The world is at peace: none outmatches another" | `critic/c91_x_few.89403_3_3.log` |
| R90-N3 the heroes arm at 1,200 m/px | 51.5 to 52.1 fps, 4 of 4 | **fixed**: 58.9 and 58.8 (two runs alone) | `critic/c91_pf_lookfps_wh*.log` |
| Run 90's checkers, `landingFuzz` | 11 runs 0 broken; 1 of 90 | 10 runs 0 broken; 0 of 90 (new seeds) | Verdict |
| 20-year hashes 7019, 32019 | `fda52a36`, `61762049` | the same | `critic/c91_seed*_save.log` |
| Replay starts | 54 built on `fc767d88` | 54 of 54 the same bytes | `critic/c91_starts.log` |
| R88-B1's cases (`sameWorldMsgs`, `pageHash` ×2, `playHash`) | one hash; 10/10; 6/6 | one hash `403266384`; 10/10, 10/10; 6/6 | Stability |
| `fewNationWars 3 89401 6 10`; 85401 | 5 of 6; day 110 | 5 of 6; day 110 | `critic/c91_few3_89401.log` |
| Run 90's lanes X, A, L, E, B (runs 86 to 89's cases) | exit 0 | exit 0 (5, 9, 3, 34, 18 cases) | `critic/c91_lane{X,A,L,E,B}.out` |
| Kept `heroPop 85905` | 12 zooming, 4 panning | 12, 11 | `critic/c91_heroPop.85905_300_head.log` |
| Bulk landing sets | 358 of 396 named; the rest left out | all 396 + 153 + 168; R91-N1 | Naval |
| Performance chain | tick 1.886 ms `242be86c`; heroes 56.8 to 57 at 1,200 m/px | tick 1.808 ms `242be86c`; heroes least sample 58.8 | Performance |

## Design objections (none blocking)

- **Run 90's on ADR-1145 stands in part:** ADR-1148 chose "no reason" over "until 22 May" for a truce near its end. The
  line is now never false, but it is often silent: reasons on 33 % of peace days (65 % before), and on 91415 never in
  fifteen years. A line that named what it waits on ("Madhya Pradesh's truce with La Libertad ends 20 May") would say
  more than "a war may yet come".
- **Run 88's two** (the opened legend over the news on a phone on its side; the ranking's toggle hidden while the legend
  is open) stand.

## Ideas from other games (not scored)

- **Hearts of Iron IV** shows a truce's days left and a war goal's justification time; the "for now" line could carry
  the one it waits on.
- **Ages of Conflict** lets a small custom world start with a set aggression (as runs 89 and 90 said).

## Strengths (verified)

- **Batch 58 met each of its four ATs on the report's own cases**, measured here: 16 of 33 wars within 30 days of a told
  reason to 0 of 62, one `slowClick` to none, History's silence to a row at five sizes; and R220's rewrite left 1938's
  course untouched to the byte (two 20-year hashes and 54 replay starts the same).
- **The peace line's reads still leave the world alone:** 5 page runs end at the headless hash, and 43 headless seeds
  read every day end where unread ones do.
