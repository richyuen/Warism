# Critic report, run 46 (focused): after R37, "a re-sent part keeps its freed groups; sibling landings land together; the panel reads true"

- **Mode: focused.** I decided this from git before anything else (CRITIC_PROMPT, ADR-804). All three conditions hold:
  1. Run 45 (`021cf870`, on `7e09b7b3`) has a blocking issue (R45-B1) and naval under its bar (7, bar 8).
  2. Every commit since `7e09b7b3` qualifies:
     - `021cf870` is the report commit itself (critic/, DECISIONS, PROGRESS, ROADMAP; no `src/`, `data/`, `public/`). It filed R37.
     - `eaf78f24` touches only DECISIONS.md and ROADMAP.md.
     - `4040cad6`'s subject names R37, which `021cf870` filed.
  3. The last three reports were focused (45), full (44) and full (43), so not all focused.

  I re-ran every named case of run 45 and rescored afresh the dimensions run 45 scored under the bar or blocked on, and
  those the diff (`git diff --stat 7e09b7b3 HEAD`) touches:
  - **naval:** under the bar, blocked; `landings.ts`, `amphibious.ts`, `world.ts`;
  - **uiUxPolish:** `MapTooltip.tsx`, `en.json`, `orderNewsText.ts`;
  - **stability:** `landings.ts`, `amphibious.ts`, `world.ts`, `protocol.ts`, `events.ts`, `server.ts`.

  Every other score is **carried**. A release needs a full run with no blocking issue.
- **Commit judged:** `4040cad64df6bf5ef3ca72294ac40a6c2a25bb12`, HEAD at the start (`critic/c46_commit.txt`). **Date:** 2026-11-06.
- **Build:** `vite build --outDir critic/c46_dist`, exit 0 (`critic/c46_build.log`). Served by `vite preview` on
  127.0.0.1:**5297** (5299 was held by a stale socket in FIN_WAIT, pid 88736, not mine; left alone) and driven through
  Playwright Chromium at desk 1600 × 900 and phone 390 × 844.
- **Baselines.** Run 45's own `c45_*` outputs are the `7e09b7b3` baseline for its named cases, and `c45_swt2_*` the
  `813eb375` one. New cases ran on HEAD and in worktrees at `7e09b7b3` (`critic/wt`) and `813eb375` (`critic/wt2`), each
  with a `node_modules` junction that I unlinked before removing the worktree.
- **Runs.**
  - Run 45's named cases: 211 headless jobs (`critic/scripts/c46_jobsAll.txt` = run 45's Re, N2, B and S lists on HEAD),
    the page suites (`c46_suiteP.sh`, `c46_suiteP2.sh`: SE, RC, MK, sp_split, touch, hint, uw_wait, uh_seahover), and
    the checkers.
  - New, all on HEAD and on `7e09b7b3` (and the `813eb375` arm where it finished):
    - **a split grid of 150 cases**: seeds 19101–19109 × five shapes × re-send at +2/+24/+72 h × Fuzhou or the sea off
      Tsingtao (`c46_jobsG.txt`, probe `c46_ll7.ts`, which also logs `NextVoyage` and the panel's voyage state per hour);
    - **one-click permutations** of the R45-B1 edit (`who` = [2,1,0], [1,0,2], [2,0,1]) on 18705, 3517, 19101;
    - Britain's grid on new seeds 19111, 19113;
    - **sibling cases** (two clicks for one place from two ports, R37c) on 3517, 13001, 14003, 14011, 19101–19109,
      headless with the panel state per hour and by page with the fresh one's panel read (`c46_sib_panel.mjs`);
    - the new rejoin hover (R37b) at phone width (`c46_rcp_recall.mjs`).
  - Checkers on new seeds: landingInvariants 19111, 19113, 19115, 19117 and 18705's own order seed; diploInvariants
    19121 (heroes), 19123 (random world); worldInvariants 19129; workerDeterminism 19127. A copy of the
    landingInvariants helper that prints its clicks, events and landings (`critic/scripts/c46_litrace.ts`) traced each
    break.

## Verdict

**R37 fixes R45-B1, R45-N1, R44-N1 and R44-N2. The player's landing now behaves in every one-click shape I tried.
But the checker, run on new seeds, finds one rule broken that a player meets at the worst moment.**

- **R45-B1 is fixed.** 18705's three re-sent land 975/976/976 headless (run 45: 976/977/**1272**) and 999/999/999 by
  real clicks (run 45: 999/1005/**1299**). The permuted clicks of the same edit split on `7e09b7b3` (951/952/**1241**)
  and land together on HEAD (975/976/976).
- **0 splits in 198 one-click groups on HEAD** (the 150-case new grid, run 45's 40-shape S grid, the N2 and B lists and
  the permutations).
- **R45-N1 is fixed.** Every re-sent part lands at `813eb375`'s hour ±1 h, 5.5 days earlier than `7e09b7b3`
  (`critic/c46_s_cmp.txt`: 30 of 40 shapes within 1 h of `813eb375`; the 10 others are the part *not* re-sent, as on
  `7e09b7b3`).
- **R44-N1 is fixed.** The recall panel reads "Aboard, sailing back to Tokyo" with no stale notice at 6 h, 1, 3 and 5
  days, and the hover says it turns back and joins.
- **R44-N2 is fixed.** The fresh one from Sasebo now lands 22–24 h before the two from Tokyo, not a week (656/657/634;
  run 45: 656/657/475), on 10 seeds.
- **New blocking issue: R46-B1.** landingInvariants on new seed 19113 (Britain): a landing's transports are sunk at sea
  with two divisions aboard. In that hour the drowning divisions are told "not done: no transports of its nation with
  room for it are at a port it can reach", and nothing says they were lost. The checker reports `aboardNoLanding`. The
  code is unchanged since R33b, so this is not R37's, but it is a broken rule a checker reports.

**Naval stays 7.** All the issues of runs 44–45 are gone, and only R46-B1 holds naval under its bar. If R46-B1 is fixed
and nothing new is found, I expect naval to reach 8.

## Scores

| Dimension | Run 45 | Run 46 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 (carried) | R37 changes the tooltip's words, not the map. The rejoin hover's mark and line are drawn as before (`critic/shots/c46rc_d3_hover.png`) |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 (carried) | diploInvariants 18615 (heroes), 18617 (random world), 19121 (heroes) and 19123 (random world): 0 broken (`critic/c46_diploinv_*.log`) |
| Emergent world dynamics over long runs | 7 | 7 (carried) | |
| God Mode | 7 | 7 (carried) | |
| Editor and scenarios | 7 | 7 (carried) | `callTransports(…, busy)` may now take a fleet the editor holds in place (`world.station`) and clear its hold. Read only, not reached in a case; noted under Design objections |
| Stats and history | 7 | 7 (carried) | |
| UI/UX and polish | 7 | 7 | **Rescored.** <br>**Better:** <ul><li>The recall panel is true at every probe hour: "Aboard, sailing back to Tokyo", no stale "it will not land with them" (`critic/c46_rc_d1.json`–`d5`, `h6`; run 45: "At sea, bound for its landing" plus the stale notice).</li><li>The recall hover says "Your landing at sea turns back to Tokyo and joins the landing gathering there for the marked place; they sail together" (`critic/shots/c46rc_d3_hover.png`).</li><li>R45-N1's "waiting for the rest" beside "2 of 2 at the port" is gone: there is no such wait any more.</li></ul> **Not 8:** <ul><li>**R46-N1:** for the 6.6 days a ready landing waits for its sibling, its panel says "At Sasebo, all of the landing there: it sails when its transports and escort are ready" (`critic/shots/c46sib_freshfirst_h484.png`, `_h544.png`). Its transports and escort are ready; it waits for the other landing, and nothing says so.</li><li>**R46-N2:** the new rejoin hover is one 546-px line, cut on a phone at "turns back to Tok…" (`critic/shots/c46rc_phone_d3_hover.png`, `critic/c46_rc_phone_d3.json` `box`). R45-N2 is unchanged (`critic/c46_uh_phone.json` identical to run 45's).</li><li>R45-N3 (no hover for a gathering landing over water) is unchanged (`critic/c46_uh_desk.json` = run 45's).</li><li>R46-B1's false refusal reaches the player as a toast and a row (read in `server.ts` `orderNews`).</li></ul> |
| Performance | 7 | 7 (carried) | `tm_touch` ran beside six sims: 58.3–59.6 fps, 1.0 hover ask a second with a selection, as in run 45 (`critic/c46_tm_touch.json`) |
| Stability | 7 | 7 | **Rescored.** <ul><li>No page error in any page JSON of this run.</li><li>workerDeterminism ends on run 45's hashes for 3517 (`7e113d94`), 17011 (`4bae12d3`) and 18011 (`4d83261a`) on every arm, and new seed 19127 (`9dde4562`) is the same on every arm (`critic/c46_wd_*.log`).</li><li>The `813eb375` saves load and land at run 45's hours (`critic/c46_mig_load_*.json` byte-identical to run 45's).</li><li>Builder's grid: 3517 6 of 240 (the same R31f split set), 15101 0 of 240 (`critic/c46_grid_*.log`).</li><li>worldInvariants 19129: 0 broken.</li><li>landingInvariants: 0 broken on run 45's 10 runs and on 19115 and 19117.</li><li>7019's 20-year save is byte-identical to run 45's (`cmp critic/c46_seed7019_y20.bin critic/c45_seed7019_y20.bin`): the AI world is untouched.</li></ul> **Not 8:** landingInvariants breaks on 3 of 5 new runs: <ul><li>19113 `aboardNoLanding` (R46-B1) and `leftBehind` (R46-N4);</li><li>18705 and 19111 `stuck` (R46-N3), identical on `7e09b7b3` (`critic/c46_liwt_*.log`).</li></ul> |
| Semantic zoom to unit level (needs 8) | 8 | 8 (carried) | |
| Naval warfare (needs 8) | 7 | **7** | **Rescored. Every issue of runs 44–45 is fixed; held under 8 by R46-B1 alone.** Same cases on both commits: <ul><li>R45-B1: `s_18705_n4_012` / `b_jap18705_n4_012` 975/976/976 (run 45: 976/977/1272); by click `uw_three18705` 999/999/999 (run 45: 999/1005/1299); new seed `uw_three19101` 999/999/999.</li><li>Permutations of that click on 18705: HEAD 975/976/976 ×3; `7e09b7b3` 951/952/**1241** ×3 (`critic/c46_cmp_y.txt`).</li><li>R45-N1: S grid re-sent parts at `813eb375`'s hour ±1 h on all five seeds (`critic/c46_s_cmp.txt`); `four_two_far` 656/657 (run 45: 788/789); `four_hourly` 1266/1267 ×3 (run 45: 1399/1400); `sp_four` by click h681 (run 45: h813).</li><li>New 150-case grid: 0 splits on HEAD and 0 on `7e09b7b3`, but HEAD lands the re-sent parts 132–162 h earlier in 55 of 150 cases (`critic/c46_cmp_wt.txt`). The re-sends to the sea off Tsingtao are refused with reason 17 and the landing keeps its course (`critic/c46_g_*_ts_*.json`).</li><li>Unchanged from run 45: the sea-click cases (`se_*` h655/h559/h679), recalls h660, the Britain mk4 cases 87/93, `steal_one` (R44-N3), and the Britain grid on 15101 and 18701 (except `n6_012`, +17 h: 243/244/244 against 226/225/225, the same on new seeds 19111 and 19113).</li><li>R46-B1 (blocking): a sunk landing's drowned divisions get a false refusal and no word of their loss.</li></ul> |
| Tanks (needs 8) | 8 | 8 (carried) | |
| Aircraft (needs 8) | 8 | 8 (carried) | |
| AI nuclear use (needs 8) | 8 | 8 (carried) | |

## Blocking issues

1. **R46-B1. When a landing's transports are sunk at sea with divisions aboard, the player is told those divisions were
   refused for want of transports at a port, and nothing says they were lost. The landingInvariants checker breaks
   (`aboardNoLanding`).**
   - **The case.** landingInvariants seed 19113, setup 15101 (Britain at war with France), its own orders. The click at
     t1422 sends 271 and 272 to the target off Portsmouth.
   - **What happens** (`critic/c46_litrace_19113_sink.log`, from `critic/scripts/c46_litrace.ts`):
     - Landing 10 sails at t1446 with 271 and 272 aboard group 1076, which is under the player's call (`po3`).
     - From t1449 the group is in a fight (`E`), and at t1463 it is sunk.
     - In that hour the landing has no group left. `landingSystem` takes "aboard none, no groups" as "all of it ashore,
       no transports" and calls `endLanding(…, RejectReason.NoTransports)`.
     - 271 and 272, still listed as aboard (fleet −1), each get `MoveRejected` reason 6, then `FormationDestroyed` in
       the same hour. For that hour `voyageOf` reads `nextVoyage` ("no room on the transports that sailed").
     - The checker reports `t1463 aboardNoLanding: 271 aboard -1` and the same for 272 (`critic/c46_li_19113_eng.log`).
   - **What the player sees** (read in `src/worker/server.ts` `orderNews`): the refusal becomes a toast and a row,
     "Square infantry division 271: not done: no transports of its nation with room for it are at a port it can
     reach." `FormationDestroyed` only forgets the order. In `src/`, `FormationDestroyed` is used only by the sim and by
     `orderNews`, and `en.json` has no string for a division lost, so no row, toast or history kind tells the loss. So
     the invasion fleet goes down and the game reports a missing port.
   - **Not R37's.** The branch (`landings.ts` ~l.759, "All it carried ashore …") is unchanged since R33b (`42cb44e9`).
     On `7e09b7b3` the same seed's history differs from t562 and does not reach a sinking (`critic/c46_liwt_19113_eng.log`).
     It is a rule broken that a checker reports on a new seed, so it blocks.
   - **Fix.**
     - Tell a sailing landing whose transports were sunk apart from one that put everyone ashore. A division aboard a
       group that is gone is lost with it (or put ashore, if the rule says so), not refused.
     - Tell the player: an order news kind such as "lost at sea with its transports", or the landing's "transports
       sunk" with what became of each division.
     - Give no `nextVoyage` panel state to a division whose group is gone.
   - **AT.**
     - landingInvariants 19113/15101 reports no `aboardNoLanding`.
     - A unit case: a sailing landing whose group is destroyed. Its divisions get no `MoveRejected`, and the news names
       the sinking.
     - landingInvariants on ten new seeds of each setup reports no `aboardNoLanding`.

**Why the run's other two checker breaks are not blocking.**
- **`stuck`** (18705, 19111) is identical on `7e09b7b3`. It is R31f/R44-N3's long wait, by decision: a threshold the
  checker sets against the game's decided rule, not a new rule broken (R46-N3).
- **`leftBehind`** (19113 t595) fires on a division told `NextVoyage` in the same hour. That is R17b as specified, and
  the checker cannot see the telling (R46-N4).

## Non-blocking issues (prioritised)

1. **R46-N1. A landing waiting for its sibling (R37c) says it is ready.**
   - **The case.** Seed 3517 (and 19101, `critic/c46_sib_freshfirst*.json`). The fresh one's landing at Sasebo is
     ready from about h480 and waits until about h600 for the two from Tokyo.
   - **The panel says** "At Sasebo, all of the landing there: it sails when its transports and escort are ready"
     (`critic/shots/c46sib_freshfirst_h484.png`, `critic/shots/c46sib_freshfirst_h544.png`).
   - **Headless:** 159 h in voyage state `ready` on all 10 seeds (`critic/c46_x_sum.txt`, `steal_freshfuzhou*`,
     `fresh*_1910x`).
   - **Nothing says** it waits for the other landing, or for how long. This is the R45-N1 class (the panel misstating
     the wait) in R37's new wait.
   - **Fix:** a state `sibling` with "waiting for the landing from {port} for the same place; they land together", and
     the days.
2. **R46-N2. The new rejoin hover cannot be read on a phone.** It is one line of 546 px on a 390-px screen, cut at "turns
   back to Tok…" (`critic/shots/c46rc_phone_d3_hover.png`, `critic/c46_rc_phone_d3.json` `box.note.w = 545.6`).
   R45-N2's sea hover is unchanged (`critic/c46_uh_phone.json` = run 45's). Fix as R45-N2: `max-width` and wrap.
3. **R46-N3. landingInvariants `stuck` on 18705 and 19111** (`critic/c46_li_18705_jap.log`,
   `critic/c46_li_19111_jap.log`). Both are identical on `7e09b7b3` (`critic/c46_liwt_*`).
   - **What happens.** 367, sent from near Tokyo to Shanghai, is given Sasebo's group and walks there at about 1.2 cells
     a day (`critic/c46_litrace_18705.log`: 1802.8 → 1763.0 between t1440 and t2400, 40 days). The landing gathers for
     45+ days while its panel reads "Marching to Sasebo to board transports".
   - **Two things disagree.** The checker's own note says "the longest walk ~21 days", and the game makes a 40-day walk
     within Honshu rather than wait at Tokyo. That is R31f/R44-N3 by decision, but either the threshold or the port
     choice is wrong.
4. **R46-N4. `leftBehind` fires on a told next voyage, and R37a's AT for the checker was not done.**
   - **On HEAD.** 19113 t595 (`critic/c46_litrace_19113.log`): a called group, 1069, is sunk on its way to the port
     (t594). The landing sails with the one group it has, and 273 is told `NextVoyage`. That is the R17b fallback,
     told, as designed, but the checker cannot tell it from R45-B1.
   - **On `7e09b7b3`.** The same seed breaks `leftBehind` at t562 untold (`critic/c46_liwt_19113_eng.log`), so the
     checker can catch the R45-B1 class on a new seed. That half-answers R45-N4.
   - **Still to do.** ROADMAP R37a says the checker was not given a pool one group short. Exempt divisions told
     `NextVoyage` in the same hour, and add that pool.
5. **R46-N5.** Britain's `n6_012` (three of six re-sent to the far beach) lands 17–19 h later than on `7e09b7b3`
   (243/244/244 against 226/225/225) on 15101, 18701, 19111 and 19113. It is within a day and still together.
6. Carried, unchanged:
   - **R45-N3** (no hover for a gathering landing over water);
   - **R44-N3** (`steal_one` 1280/632/1278);
   - **R37-N3, R37-N4, R32-N3, R40-N2, R39-N2, R39-N3, R36-N3, R32-N2, R31-N1, R31-N6, R32-N5, R39-N4**, and the ranking
     cutting long names (`critic/c46_hs_desk.json` identical to run 45's).

## Run 45's cases re-run

| Run 45 case | `7e09b7b3` (run 45) | HEAD `4040cad6` | Evidence |
|---|---|---|---|
| **R45-B1** 18705 `n4_012` (headless, S and B lists) | 976/977/**1272** | **fixed**: 975/976/976 (`813eb375`: 975/976/976) | `critic/c46_s_18705_n4_012.json`, `critic/c46_b_jap18705_n4_012.json` |
| **R45-B1** by click, `uw_three18705` | 999/1005/**1299**; "Waiting at Tokyo for transports" while the others sail | **fixed**: 999/999/999 | `critic/c46_uw_three18705.json` |
| **R45-N1** S grid on 18705–18715 (40 shapes) | re-sent parts +132–161 h on `813eb375` | **fixed**: re-sent parts at `813eb375` ±1 h; 0 splits | `critic/c46_s_cmp.txt` |
| **R45-N1** `four_two_far`, `four_hourly`, `sp_four`, `uw_four`, `uw_four15101` | 788/789; 1399–1400; h813; h813 | 656/657; 1266/1267; **h681**; h681 | `critic/c46_cmp_re.txt`, `critic/c46_uw_four*.json` |
| Run 44's split grid on 3517, 15101, 18601 (N2, sx) | 0 of 8 split each | 0 of 8 split each; parts 132 h earlier | `critic/c46_cmp_re.txt` |
| **R44-N1** recall at 6 h, 1, 3 and 5 days (page) | "At sea, bound for its landing" plus a stale notice | **fixed**: "Aboard, sailing back to Tokyo", no notice; h660 together | `critic/c46_rc_*.json`, `critic/shots/c46rc_d1_recall_panel.png` |
| **R44-N2** `mk2_freshfirst` on 3517, 14003, 14011 | 366 h502, the two h682 | 366 h658, the two h682 | `critic/c46_mk2_freshfirst*.json` |
| R44-N2 headless `steal_fresh*` (7 cases) | 656/657/475 | 656/657/634 | `critic/c46_k_steal_*.json` |
| **R45-N2** sea hover on a phone | cut 6 of 6 | unchanged | `critic/c46_uh_phone.json` |
| **R45-N3** gathering landing hover over water | none | unchanged | `critic/c46_uh_desk.json` |
| **R45-N4** `leftBehind` on the old code | never fired on four seeds | fires on `7e09b7b3` at 19113 t562 (new seed); no short pool added | `critic/c46_liwt_19113_eng.log` |
| R44-B2 sea clicks (`os_*`, `se_*`, `seawater_*`, `mixwater`) | refused, land 631/632, h655 | identical | `critic/c46_os_*.json`, `critic/c46_se_*.json`, `critic/c46_n_*.json` |
| Every other K, E, G, F, R31d and R42-N3 case | — | identical but for the R45-N1/R44-N2 hours above and `steal_one` (1280 against 1278) | `critic/c46_cmp_re.txt` |
| Britain lists (`b_eng*`) | — | identical but `n6_012` +17 h (R46-N5) | `critic/c46_cmp_re.txt` |
| Migration of `813eb375` saves | Japan h630/631, Britain h87 | byte-identical JSON | `critic/c46_mig_load_*.json` |
| landingInvariants (10 runs) | 0 broken | 0 broken | `critic/c46_li_18*.log`, `critic/c46_li_15101_o18117.log`, `critic/c46_li_3517_o18113.log` |
| Builder's grid 3517 / 15101 | 6 / 0 of 240 | 6 / 0 of 240 | `critic/c46_grid_*.log` |
| workerDeterminism 3517 / 17011 / 18011 | `7e113d94` / `4bae12d3` / `4d83261a` | identical | `critic/c46_wd_*.log` |
| Page MK, SE, touch and hint cases | — | identical landings; `hs_desk` identical | `critic/c46_mk*.json`, `critic/c46_hs_desk.json`, `critic/c46_tm_touch.json` |

## Design objections (none blocking, no score lowered)

- **R37c's sibling wait** holds a ready landing for up to `LATE_WAIT_HOURS` (a week) for another click's landing to the
  same place. That may be right for one intent split over two ports. But a player who sends a second wave a day later
  now holds back the first wave, and nothing on the panel says so (R46-N1). A one-line choice ("wait for the landing
  from Tokyo / sail now") would make it the player's.
- **The busy call (R37a) may take a fleet the editor placed and held** (`world.station`), and deletes the hold
  (`amphibious.ts` `callTransports(…, busy)`). It is the player's own nation's fleet, so it is arguably theirs to use.
  But an editor scenario that parks a transport group as a set piece loses it silently to the first landing short of
  room. Not reached in a case; read only.
- **R31f's long waits** (R46-N3): a landing for Shanghai from near Tokyo waits 40+ days for a walk to Sasebo rather than
  for a group to come to Tokyo.

## Ideas from other games (not scored)

- Hearts of Iron reports a convoy sunk with the divisions lost aboard as its own event ("X divisions lost at sea"). That
  is the shape of R46-B1's fix.
- Many RTS show a "waiting for: …" line naming what a queued order waits on. That is R46-N1's.

## Strengths (verified)

- **The re-send is now right in every shape I could make.** 0 of 198 one-click groups split on HEAD across 12 seeds,
  three delays, two targets and three click orders, at `813eb375`'s hours. The permutations on 18705 still split on
  `7e09b7b3` (`critic/c46_cmp_y.txt`, `critic/c46_s_cmp.txt`).
- **The recall now reads true end to end.** The hover says where it turns back, the panel says it sails back, no stale
  notice is left, and both land at h660 (`critic/c46_rc_*.json`, `critic/shots/c46rc_d3_hover.png`).

## Notes

- I stopped the `813eb375` arm of the new grid (`c46_gwt2_*`, `c46_xwt2_*`, run with `c43_ll4.ts`, which has no
  `AT0=port`) after 79 cases, for time. In those 79:
  - every re-sent part lands at `813eb375`'s hour ±1 h, except the `p72_n3_12` shape (three seeds), where HEAD is
    +24/+28 h (975/976 against 951/948). That is 4 h over R37a's "no later than `813eb375` by over a day", and the same
    as `7e09b7b3` (950/951);
  - the other 6 rows of 9 flagged are the one left behind (364), as on `7e09b7b3` (`critic/c46_cmp_wt.txt`).
- None of about 400 HEAD probes met a `NextVoyage` except the checker's 19113 case. The R17b fallback is now rare,
  because the busy call finds a group. So its row ("no room on the transports that sailed; it waits at the port, and
  they come back for it") was not seen in the page.
- The re-sends to 1703.5,373.5 ("ts" in the grid) are water, refused with reason 17, and keep their landing. They test
  R44-B2 on new seeds, not a re-send.
- Britain's new seeds 19111 and 19113 bomb its ports shut early (reason 16), and several cases never land on either
  commit. Told; not judged.
