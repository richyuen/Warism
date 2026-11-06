# Critic report, run 45 (focused): after R36, "a landing sails with room for all; the sea is no cancel"

- **Mode: focused.** I decided this from git before anything else (CRITIC_PROMPT, ADR-804). All three conditions hold:
  1. Run 44 (`8f6f2628`, on `0fba90d8`) has two blocking issues and naval under its bar (6, bar 8).
  2. Every commit since then qualifies:
     - `8f6f2628` is the report commit itself (critic/ and docs only). It filed R36a/b.
     - `f609d256` touches no file under `src/`, `data/` or `public/`.
     - `7e09b7b3`'s subject names R36, which `8f6f2628` filed.
  3. The last three reports were full (44), full (43) and focused (42), so they were not all focused.

  Per the brief I re-ran every named case of run 44. I rescored afresh the dimensions run 44 scored under the bar or
  blocked on, and the ones the diff touches:
  - **naval:** under the bar, blocked;
  - **uiUxPolish:** `MapTooltip.tsx`, `hud.ts`, `game.tsx`, `App.tsx`, `en.json`;
  - **stability:** `landings.ts`, `movement.ts`, `protocol.ts`;
  - **mapVisuals:** `MapView.ts`'s hover.

  Every other score is **carried**. A release needs a full run with no blocking issue.
- **Commit judged:** `7e09b7b37b58232e91c49795f282b2a097da7f85`, HEAD at the start (`critic/c45_commit.txt`).
  **Date:** 2026-11-06.
- **Build:** `vite build --outDir critic/c45_dist`, exit 0 (`critic/c45_build.log`). Served by `vite preview` on
  127.0.0.1:5299 and driven through Playwright Chromium at desk 1600 × 900 and phone 390 × 844.
- **Baselines.**
  - Run 44's own `c44_*` outputs are the `0fba90d8` baseline for its named cases.
  - New cases ran on HEAD and, in worktrees, at `0fba90d8` (`critic/wt`) and at `813eb375` (`critic/wt2`, the last
    commit before R33, where run 44 found these cases fine).
  - Both worktrees were removed at the end, each with its `node_modules` junction unlinked first.
- **Runs.**
  - Run 44's named cases: 116 headless jobs (`critic/scripts/c45_jobsRe.txt`), covering the K and E lists, the split
    grid, the `os_*` sea clicks, R31d, R42-N3, the save migration, the builder's grid and landingInvariants. Page
    cases: `c45_suiteP.sh` (SE, RC, MK, sp_split, touch, hint).
  - New attacks on R36:
    - 68 jobs on both commits (`c45_jobsN2.txt`): the split grid on seed 15101 (the AT's second seed) and new seed
      18601, new shapes, a gathering landing ordered onto water, a mixed selection onto water, and sea clicks on
      new seeds;
    - 42 jobs for Britain (two divisions to a transport group) and Japan on new seeds 18703/18705/18707
      (`c45_jobsB.txt`);
    - **the split grid on five new seeds, 40 shapes, HEAD beside `813eb375`** (`c45_jobsS.txt`);
    - page probes: the hover sweep over the sea at desk and phone (`c45_uh_seahover.mjs`), and the wait for room and
      the stranded division by click (`c45_uw_wait.mjs`).
  - Checkers on new seeds:
    - landingInvariants: 6 runs on seeds 18601–18613;
    - diploInvariants: 18615 with heroes, 18617 on a random world;
    - HEAD's landingInvariants run against `0fba90d8` (`critic/c45_liwt_headchecker.log`);
    - workerDeterminism on 3517, 17011 and 18011;
    - 7019 × 20 years.

## Verdict

**R36 fixes R44-B2 completely and fixes R44-B1 in most cases, but not all.**

- **R44-B2 is fixed.**
  - An order of a landing at sea onto water is now refused at the click, with a tooltip saying why, and the
    landing lands as planned.
  - This holds on every water I tried: its own beach's water, the sea a cell off it, open sea east, the Yellow Sea,
    Tokyo Bay, and two misclicks in a row. It holds on three seeds, by click at desk and phone, and with a fresh
    division mixed into the selection.
- **R44-B1 is fixed in run 44's eight shapes on 3517 and 15101, and in four_hourly.** Every one-click group now
  lands within two hours.
- **R44-B1 is not fixed on new seed 18705, and that case is blocking.** On 18705 the same edit (three of four re-sent
  by one click) still sails with two transport groups and leaves the third division standing at Tokyo, untold.
  - The stranded division lands alone at Fuzhou 12 days later, in the page and headless alike.
  - On the same seed, `813eb375` lands all three together.
  - The cause is R36's own fallback, "none to be had anywhere: those that fit sail". It counts only idle groups. The
    group the re-send freed was, at that hour, sailing the Yellow Sea under the AI.
  - I filed this as **R45-B1**: 1 of 40 new-seed shapes, against 6 of 8 shapes in run 44.
- **The fix has a systematic cost.** On 4 of 5 new seeds, and on 3517/15101, every re-sent part lands **5.5–6.7 days
  later than at `813eb375`** (+132 to +161 h).
  - The re-send still frees the group to the AI. The landing calls it back only at the sail hour, then waits for it
    while the panel says "waiting for the rest of the landing" beside "2 of 2 at the port" (R45-N1).

**Naval goes from 6 to 7.** It stays under its bar of 8, with one blocking issue. That matches run 43, which scored
naval 7 with one blocking issue in the same class.

## Scores

| Dimension | Run 44 | Run 45 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | **Rescored (the hover).** R36 builds a hover over every sea cell whenever something is selected. Sweeping the mouse over open sea at 3,000 m/px across 60 points each way (desk): <ul><li>a selected warship group shows no tooltip over water;</li><li>with nothing selected there is no tooltip over water;</li><li>the landing at sea shows "Only sea here…" over water and its by-sea lines over land;</li><li>no page error (`critic/c45_uh_desk.json` `sweepShip`/`sweepNone`/`sweepLanding`, `critic/shots/c45uh_desk_sweep_landing.png`).</li></ul> **Not 8:** run 37–44's reasons stand (carried, see run 44), and the tooltip still runs off the screen near the right edge (3 of 6 samples on desk) |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 (carried) | Not touched by R36. diploInvariants on new seeds 18615 (heroes) and 18617 (random world) report 0 broken (`critic/c45_diploinv_*.log`) |
| Emergent world dynamics over long runs | 7 | 7 (carried) | R36 changes only the player's landings; see Stability for the AI world |
| God Mode | 7 | 7 (carried) | |
| Editor and scenarios | 7 | 7 (carried) | |
| Stats and history | 7 | 7 (carried) | |
| UI/UX and polish | 7 | 7 | **Rescored.** <br>**Good:** the sea hover now reads "Only sea here: your landing at sea keeps its course. Click a coast to send it there, or your own land to bring it back" (`critic/shots/c45se_water2_hover.png`). The click gives a row and toast at once ("not done: there is only sea there…", `critic/c45_se_water2.json`), and the panel keeps "At sea, bound for its landing". A gathering landing clicked onto water is refused at once and stays as it was (`critic/shots/c45uh_desk_g_after.png`). <br>**Bad:** <ul><li>On a phone the new tooltip is cut ("Only sea here: your landing at sea ke…") in 6 of 6 samples, because the tooltip is `white-space: nowrap` with no clamping and 545 px wide on a 390 px screen (`critic/shots/c45uh_phone_m_hover.png`, `critic/c45_uh_phone.json` `offscreen: 6`). This is the R39 phone-tooltip class, with the AT's "the hover says why" unreadable there.</li><li>R45-N1: during R36a's 5-day wait for a called group the panel says "At Tokyo, waiting for the rest of the landing" beside "2 of 2 at the port" (`critic/shots/c45uw_four_h561.png`).</li><li>R44-N1's stale notice is unchanged (`critic/c45_rc_d3.json` identical panels to run 44).</li><li>R45-B1's stranded division reads "Waiting at Tokyo for transports" while its landing is at sea (`critic/shots/c45uw_three18705_stranded_h831.png`).</li></ul> Carried: R39-N2, R39-N3, R40-N2 (`critic/c45_hs_desk.json` identical to run 44's) |
| Performance | 7 | 7 (carried) | Not rerun as suite Q. Touch probe `tm_touch` under heavy contention (eight sims running): 58.6–60 fps. Its overSea asks went from 0.05 to 1.0 a second with a selection parked (`critic/c45_tm_touch.json`); cheap, noted only |
| Stability | 7 | 7 | **Rescored.** <ul><li>No page error in any page JSON of this run.</li><li>workerDeterminism ends on run 44's hashes for 3517 (`7e113d94`), 17011 (`4bae12d3`) and 18011 (`4d83261a`) on every arm (`critic/c45_wd_*.log`).</li><li>12 landingInvariants runs report 0 broken (`critic/c45_li_*.log`), and two diploInvariants runs report 0.</li><li>7019's 20-year save is byte-identical to run 44's (`cmp critic/c45_seed7019_y20.bin critic/c44_seed7019_y20.bin`).</li><li>Saves made at `813eb375` mid-landing still load and land at the old hours (`critic/c45_mig_load_*.json` = run 44).</li><li>The builder's grid: 3517 6 of 240, the same R31f "split" set as run 44; 15101 0 of 240 (`critic/c45_grid_*.log`).</li></ul> **Not 8:** R45-B1 is a division standing 12 days at a port, untold, with no checker able to see it. HEAD's `leftBehind` rule ran against `0fba90d8` on four seeds flags `cancelWater` 8 times but `leftBehind` **never**, although R44-B1 was there in 6 of 8 shapes (`critic/c45_liwt_headchecker.log`). The rule exists, but random clicks rarely hit the shape |
| Semantic zoom to unit level (needs 8) | 8 | 8 (carried) | |
| Naval warfare (needs 8) | 6 | **7** | **Rescored. Up, for R44-B2 fixed and R44-B1 fixed in all of run 44's shapes. Not 8: R45-B1 (blocking) and the cost of the fix.** Same cases on both commits: <ul><li>`os_own`/`os_east`/`os_yellow`: `0fba90d8` 856/856 (sailed home); HEAD 631/632, as at `813eb375`.</li><li>By click, `se_water2`: `0fba90d8` home at h559; HEAD lands h655.</li><li>`se_tsing` lands h655.</li><li>New: `seawater_15101`, `seawater_18601`, `seawater_tokyo`, `mixwater`: `0fba90d8` -/- or 856; HEAD 631/632 (`critic/c45_n_*.json` vs `critic/c45_nwt_*.json`).</li><li>Split grid on 3517: HEAD 0 of 8 shapes split, against 6 of 8 on `0fba90d8` (`critic/c45_sx_*.json`).</li><li>`four_two_far` 788/789 (was 656/951); `four_hourly` 1399/1400 × 4 (was 2 never landed).</li><li>The same on 15101; on 18601, 0 of 8 shapes split.</li><li>Five new seeds: **1 of 40** splits (18705 `n4_012`: 976/977/**1272**; `813eb375` 975/976/976).</li><li>Delay against `813eb375` on 4 of 5 seeds: +132–161 h on every re-sent part (`critic/c45_s_cmp.txt`).</li><li>Unchanged: the recall cases (`r_back_*`, `e_back_*`, `rc_*`: h632 / h660 as run 44), R43-N1 (R31d identical), R42-N3 (`critic/c45_r42n3.json`: reason 19), and Britain's cases (`critic/c45_b_eng*` = `c45_bwt_eng*`).</li></ul> |
| Tanks (needs 8) | 8 | 8 (carried) | `movement.ts`'s change is one reason code for a division aboard at sea (read) |
| Aircraft (needs 8) | 8 | 8 (carried) | |
| AI nuclear use (needs 8) | 8 | 8 (carried) | |

## Blocking issues

1. **R45-B1. R44-B1 is still there when the group a re-send freed is busy. Of three divisions re-sent by one click,
   the landing sails with two and leaves the third standing at its port, untold. That division lands alone 12 days
   later.**
   - **The case.** Seed 18705, Japan. The four divisions nearest Tokyo are sent to Shanghai. Two hours after the first
     stands at Tokyo, the first three are clicked onto Fuzhou.
   - **Headless** (`critic/c45_b_jap18705_n4_012.json`; groups traced in `critic/c45_b_jap18705_n4_012_g.json`):
     - The Fuzhou landing gets group 1136, and 1144 is freed to the AI.
     - At about h830 the landing has 1136 and 1151. 1152 belongs to 367's landing, and 1144 is under way in the Yellow
       Sea (`G1144@1742.9,395.9m`).
     - It sails with 364 and 365. **366 stays at Tokyo, still a member of the sailing landing** (`366:still@1819.5,385.5
       …L2sail`).
     - Nothing is emitted. 364/365 land h976/977 and **366 lands alone h1272**.
   - **By real click** (`critic/c45_uw_three18705.json`): 364 lands h999, 365 h1005 and 366 **h1299**. While the two
     are at sea, 366's panel reads "Waiting at Tokyo for transports". The only row is the stale "it leaves the landing
     it had…" (`critic/shots/c45uw_three18705_stranded_h831.png`, h903, h975).
   - **The same case at `813eb375`:** 975/976/976 together (`critic/c45_bwt2_jap18705_n4_012.json`,
     `critic/c45_swt2_18705_n4_012.json`).
   - **Why blocking.** It is R44-B1, the same edit with the same outcome, still untold. It contradicts R36's AT ("every
     one-click group lands within a day, or is refused and told") and SPEC's R36a ("short, a group free at its port or
     one called joins it and it waits"). A group was to be had: it was the player's nation's own group, and the re-send
     had just handed it to the AI.
   - **Cause, read.** `gather`: `noRoom` → `freeAtPort(...) || callTransports(...)`. `callTransports` skips groups that
     are `moving` or `engaged`. When it returns 0, the code falls through to "those that fit sail". The re-send
     (`detachDivision`) frees the old landing's surplus groups to the AI at once, so the group the new landing will
     need is usually the one now sailing for the AI.
   - **Fix.** Either of these:
     - Keep, at the re-send, the groups the new landing needs: `detachDivision` sizes the new landing's groups to its
       divisions, as `813eb375` effectively did. This also removes R45-N1's 5.5-day wait.
     - Let the call take a busy group of the nation (one of the AI's under way) before falling back.

     If none can be had, say so at the sail hour, to the one left behind.
   - **AT.**
     - The split grid of `c45_jobsS.txt` (8 shapes × seeds 18705, 18709, 18711, 18713, 18715) plus run 44's grid on
       3517 and 15101: every one-click group lands within a day.
     - The re-sent part lands no later than at `813eb375` + 24 h.
     - landingInvariants' `leftBehind` fires on `0fba90d8` within its default seeds, or a fixed case does.

## Non-blocking issues (prioritised)

1. **R45-N1. The fix costs 5.5–6.7 days on every part re-sent, and the panel misstates the wait.**
   - **The cost.** On seeds 3517, 15101, 18703, 18707, 18709, 18711, 18713 and 18715, the re-sent part lands 132–161 h
     later than at `813eb375`:

     | Shape | HEAD | `813eb375` |
     |---|---|---|
     | `n4_012` | 1108 | 975 |
     | `n4_23` | 1426/1428 | 1267 |
     | `n5_01` | 788 | 656 |
     | `four_hourly` | 1399 | 1267 |

   - **The cause.** The freed group is called back only at the sail hour, from wherever the AI sent it. 18601 and
     18705, where the group stayed near, show no delay.
   - **What the player sees.** For those days both divisions stand at Tokyo. The status reads "At Tokyo, waiting for
     the rest of the landing" while the landing row reads "2 of 2 at the port; it sails when its transports and escort
     are ready". Nothing says a group is being called or from where (`critic/c45_uw_four.json` panels h513/561/609,
     `critic/shots/c45uw_four_h561.png`).
2. **R45-N2. On a phone the new sea tooltip cannot be read.** It is a single 545-px line on a 390-px screen, cut at
   "your landing at sea ke…" in 6 of 6 samples (`critic/shots/c45uh_phone_m_hover.png`). This is the R39 phone-tooltip
   class (`.map-tooltip { white-space: nowrap }`, no clamping).
3. **R45-N3. A gathering (ashore) landing gets no hover hint over water**, though the click is refused at once with a
   row (`critic/c45_uh_desk.json` `g.hover.tip: null`). `seaHint` 3 needs one of the selection aboard.
4. **R45-N4. The `leftBehind` rule did not catch R44-B1 on `0fba90d8` in four random seeds** (`critic/c45_liwt_headchecker.log`), and
   it cannot see R45-B1 on HEAD. R44-N4 is half closed: `cancelWater` works, `leftBehind` is untested by its own pool.
5. Carried, unchanged:
   - **R44-N1**: the stale "it will not land with them" notice for 20 days after a rejoining recall
     (`critic/c45_rc_d1.json`–`d5`, `h6`, identical panels).
   - **R44-N2**: two landings for one place (`critic/c45_mk2_freshfirst*.json` identical).
   - **R44-N3**: `steal_one` h1278.
   - **R37-N3, R37-N4, R32-N3, R40-N2, R39-N2, R39-N3, R36-N3, R32-N2, R31-N1, R31-N6, R32-N5, R39-N4**, and the
     ranking cutting long names.

## Run 44's cases re-run

| Run 44 case | `0fba90d8` (run 44) | HEAD `7e09b7b3` | Evidence |
|---|---|---|---|
| **R44-B1** `four_two_far` | 364 h656, 365 h951 | **fixed**: 788/789 (`813eb375`: 656/657; +132 h, R45-N1) | `critic/c45_k_four_two_far.json` |
| **R44-B1** `four_hourly` | 1266/1267; 366/367 never | **fixed**: 1399/1400/1400/1400 | `critic/c45_k_four_hourly.json` |
| **R44-B1** split grid, 8 shapes on 3517 | 6 of 8 split | **0 of 8**; all later than `813eb375` by 132–161 h (`n3_*` the same) | `critic/c45_sx_*.json`, `critic/c45_cmp_part1.txt` |
| **R44-B1** by click, `sp_four` | 364 h681, 365 h975 | 364/365 **h813** together | `critic/c45_sp_four.json` |
| **R44-B2** `os_own`/`os_east`/`os_yellow` | home, refused a day later, land 856 | **fixed**: refused at t536, land 631/632 | `critic/c45_os_*.json` |
| **R44-B2** by click, `se_water2` | no tooltip; home h559 | **fixed**: tooltip; row at the click; lands h655 | `critic/c45_se_water2.json`, `critic/shots/c45se_water2_hover.png` |
| `se_tsing`, `se_water`, `se_one`, `se_both`, `se_home` | — | tsing **fixed** (refused, h655); the rest identical | `critic/c45_se_*.json` |
| `e_tsing_d1`, `r_tsing_26` (one alone at sea onto Tsingtao's water) | -/632 | 151/632: refused, keeps its course to Fuzhou | `critic/c45_e_tsing_d1.json` |
| R43-B1 recalls (`e_back_*`, `r_back_*`, `rc_*`) | h632 / h660 together | identical | `critic/c45_e_back_*.json`, `critic/c45_r_back_*.json`, `critic/c45_rc_*.json` |
| Every other K case (`steal_*`, `bothfar`, `click_plus_fresh`, `four_all_sw3*`, `fresh3_base`, `leaversfirst_fz`, `six_all_far`, `three_twofar`, `aboard_alone`, `back`, late-far ×3, `there_and_back`) | — | identical | `critic/c45_k_*.json` |
| G/N/F Britain lists, R31d, R42-N3 | — | identical | `critic/c45_g_*.json`, `critic/c45_f*_*.json`, `critic/c45_r31d_*.json`, `critic/c45_r42n3.json` |
| Page MK, RC, hint and touch cases | — | identical landings; `hs_desk` identical | `critic/c45_mk*.json`, `critic/c45_hs_desk.json` |
| Migration of `813eb375` saves | Japan h630/631, Britain h87 | identical | `critic/c45_mig_load_*.json` |
| landingInvariants on 18101–18117 | 0 broken | 0 broken | `critic/c45_li_181*.log` |
| Builder's grid 3517 / 15101 | 6 / 0 of 240 | 6 / 0 of 240 | `critic/c45_grid_*.log` |
| workerDeterminism 3517 / 17011 / 18011 | `7e113d94` / `4bae12d3` / `4d83261a` | identical | `critic/c45_wd_*.log` |
| 7019 × 20 years | save | **byte-identical** to run 44's (`cmp`) | `critic/c45_seed7019_y20.bin` |

## Design objections (none blocking, no score lowered)

- **R31f's window and the ADR-830 two-landings rule** stand as in run 44.
- **R17b's fallback** ("no group to be had: those that fit sail, the groups come back") is a silent split by design.
  - Given how few groups a nation has (Japan and Britain have four each, `critic/scripts/c45_tx.ts` output in this
    report's runs), any landing larger than the fleet meets it.
  - A sentence at the sail hour ("2 of 3 sail; the rest on the next voyage, ~12 days") would make it a choice the
    player sees.

## Ideas from other games (not scored)

- Hearts of Iron reserves the convoys an invasion needs when it is planned, and shows "convoys needed / assigned". That
  is the shape of R45-B1's fix: reserve at the order, not at the sail hour.
- RTS tooltips clamp to the screen edge and wrap. R45-N2 needs only `max-width` and a flip at the right edge.

## Strengths (verified)

- **R44-B2 is fixed cleanly.** The refusal is immediate on every water, seed, selection shape and input tried, and the
  landing goes in at the old hour (`critic/c45_os_*.json`, `critic/c45_n_seawater_*.json`, `critic/c45_uh_*.json`). The
  new hover sentence tells the player both ways out.
- **The AI world is untouched.** 7019's 20-year save is byte-identical to run 44's, workerDeterminism gives identical hashes on three seeds, and every run-44 case that
  R36 did not aim at lands at the same hour.

## Notes

- Seed 15101's Japan runs are hour-identical to 3517's in the first 70 days. Its "second seed" adds little for
  Japan's landings, so I added five new seeds.
- Britain's new cases (`critic/c45_b_eng*`) are identical on both commits. Several never record a `FormationLanded`
  for the divisions within the window, the same on `0fba90d8`. I did not judge them.
- `tm_touch`'s ticks per second fell (231 → 129) because it ran beside eight sims. It is contention, not a finding.
- `critic/wt` (`0fba90d8`) and `critic/wt2` (`813eb375`) were removed at the end with their `node_modules`
  junctions unlinked first. The preview server was stopped.
