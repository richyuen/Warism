# Critic report, run 56 (focused): after batch 9 (R54a)

- **Mode: focused.** Decided from git first (CRITIC_PROMPT, ADR-804). Run 55 (`83e96099`, on `715a5448`) has a blocking
  issue (R55-B1) and a score under its bar (naval 7). The four commits since `715a5448` are of the allowed kinds:
  `83e96099` (the report, no `src/`), `0e669110` and `bacd2f6a` (subjects name R54a, which `83e96099` filed in ROADMAP),
  `d016ed2a` (PROGRESS only). Runs 55 and 54 were full, so the last three were not all focused. Changed files
  (`git diff --stat 715a5448 HEAD`): `src/sim/systems/amphibious.ts`, `src/sim/systems/landings.ts`,
  `tests/helpers/slowClick.ts`, `tests/helpers/landingInvariants.ts`: naval only. **Naval scored afresh; every other
  dimension carried from run 55.** A clean focused run would be followed by a full one; this one is not clean.
- **Commit judged:** `d016ed2aa0f7cfa5dc1d76c6ffc2e3d5243dc4c1`, HEAD at the start, clean tree (`critic/c56_commit.txt`).
- **Build:** `vite build --outDir critic/c56_dist`, exit 0 (`critic/c56_build.log`), `vite preview` on 127.0.0.1:5299.
  `715a5448` in worktree `critic/wt`, built to `critic/c56_olddist` (`critic/c56_oldbuild.log`), served on 5298.
  A second worktree `critic/wt2` (715a5448's `src/` with HEAD's two checker helpers, or the reverse) for the 2×2.
  Playwright Chromium 1600 × 900. Both servers stopped, every browser closed.

## Verdict

**R55-B1 is fixed, and honestly: the rule change fixes 24033 and the checker change fixes 26045, each as ADR-892
says, and the checker's relaxation hides nothing I could find. But a landing turned back with a division left at its
port for the next voyage never ends: the division stands frozen under "turning back to Rome / they come back for it"
for as long as I ran it (9+ days on the page; 36–114 days on ten fuzz runs), the Cancel button's own promise is broken,
and no checker sees it. Old, on both commits, met in passing, and blocking. Naval stays 7.**

## Scores

| Dimension | Run 55 | Run 56 | |
|---|---|---|---|
| Map visuals and readability | 8 | 8 | Carried (run 55's evidence). |
| Diplomacy, war, alliance, puppet, revolt depth | 8 | 8 | Carried. In passing: diploInvariants 0 broken on new 27201 (scenario, 5 y) and 27203 (random, heroes, 5 y) (`critic/c56_diploinv_27201s_5y.log`, `critic/c56_diploinv_27203r_h_5y.log`). |
| Emergent world dynamics | 8 | 8 | Carried. |
| God Mode | 8 | 8 | Carried. |
| Editor and scenarios | 8 | 8 | Carried. |
| Stats and history | 8 | 8 | Carried. |
| UI/UX and polish | 8 | 8 | Carried. The landing-bar defects below are scored under naval. |
| Performance | 8 | 8 | Carried. |
| Stability | 8 | 8 | Carried. In passing: worldInvariants 27205 0 broken (`critic/c56_wi_27205.log`), workerDeterminism 27207 `0d79e691` same on every arm (`critic/c56_wd_27207.log`), 0 page errors in all 43 c56 page probes. |
| Semantic zoom to unit level (needs 8) | 8 | 8 | Carried. |
| **Naval warfare (needs 8)** | 7 | **7** | **Scored afresh. R55-B1 closed; held at 7 by R56-B1.** <ul><li>**R55-B1's commands:** `landingInvariants 24033 3517 120 24033 30,90 2` and `… 26045 …` 0 broken on HEAD, 1 each on 715a5448 (`critic/c56_li/head_24033_3517_g2.log`, `old_24033…`, `head_26045…`, `old_26045…`).</li><li>**One checker, both commits:** 27031–27059 × 3 setups, 0 of 45 broken on HEAD and 0 of 45 on 715a5448's sim with HEAD's checker (`critic/c56_liab.log`, `critic/c56_liab_oldnewchk.log`); run 55's 26031–26049 × 3: 30 of 30 at 0 on HEAD. 77 HEAD runs, 0 broken.</li><li>**Malta, run 55's 18 seeds:** the same endings as run 55, 12 thrown back at h156/h162 ("over: 2 thrown back; came ashore near Catania"), 6 broke off, bar, panel and news agreeing (`critic/c56_lland_ita_malta_*.json`, `critic/c56_lh_ita_malta_2*.json`; `node critic/scripts/c56_lsum.mjs`).</li><li>**Run 55's other landing cases** the same: 23109, 26107 "3 landed" h144; 26109 "3 landed" h130; 22103 "transports sunk; never sailed"; new 27101–27105 Japan ×6 (4 by sea, 2 walk from Korea), 27107/27109 Britain ×6 "6 landed" (`critic/c56_lland_*.json`).</li><li>**R54a's new path works and reads:** Italy ×6 to Valletta (27125): 4 sail, 323 and 324 told "no room on the transports that sailed; it waits at the port, and they come back for it", panel the same (`critic/c56_lland_ita_malta6_27125.json`). Headless, landingCallBound's Hong Kong case followed to the end: the third told at t85, ashore at Belfast t261 (`critic/c56_nv_hk_s1.log`).</li><li>Checkers on new seeds: landingRows all 115 cases 0 broken (`critic/c56_lrows_all.log`); landingInvariants 27211, 27213 0; repulse 27215 0; seaBattles 27209: 43 battles (`critic/c56_sb_27209.log`).</li></ul> **Held at 7 by R56-B1** (below), plus R56-N1 and R56-N2. **What the bar needs:** (i) `BASE=… node critic/scripts/c56_turnback.mjs 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 ita6_cancelbtn 66 300` on the page: 324 freed within a few hours of the groups' return, the row "cancelled: back at Rome …", 324's panel no longer "they come back for it"; (ii) `CANCELAT=66 ORDERAT=198 ORDERTO=1106.5,383.5 ORDERIDS=323,324 node critic/scripts/c56_retstuck.mjs 27125 ITA ENG 1095.5,344.5 1106.5,383.5 6 x 480`: the re-click to Valletta forms a landing or is refused with a reason; (iii) `npx tsx critic/scripts/c56_stuckret.ts <seed> 3517 120 <seed> 30,90 <g>` with no returning-and-still spell ≥ 48 h on 24033 g2, 26041 g1, 27033 g1, 27035 g1, 27039 g1, 27053 g1 (and the checker's `stuck` counting such a spell); (iv) `sh critic/scripts/c56_liab.sh` still 0 broken and the 18 Malta endings unchanged; (v) R56-N1: on 27123 `node critic/scripts/c56_frozen.mjs` ≤ 24 h of one "lands in" text, and the row saying 7 are ashore after h144. |
| Tanks (needs 8) | 8 | 8 | Carried. |
| Aircraft (needs 8) | 8 | 8 | Carried. |
| AI nuclear use (needs 8) | 8 | 8 | Carried. |

## Blocking issues

1. **R56-B1 (naval; contradicts a claimed feature; a checker hole): a landing turned back with a division left at its
   port never ends; that division stands frozen under a false "they come back for it".**
   - **The plain player's path (HEAD, default 1938 world):** Italy, seed 27125, the six divisions nearest Rome sent to
     Valletta. At h60 four sail, 323 and 324 are told there is no room and the transports come back for them (R54a's
     path). At h66 the player presses **Cancel landing** (tooltip: "Those at sea sail to Rome with their transports;
     those ashore stop where they stand"). The four come home and march off by h84. **324 never leaves the landing:** to
     h300 (13 January, the end of the run) its panel reads "At Rome: no room on the transports that sailed; they come
     back for it", the bar "Valletta from Rome — turning back to Rome", the ticker "324: waits for the next voyage"
     (`critic/c56_tb_ita6_cancelbtn_27125.json`, `critic/shots/c56tb_ita6_cancelbtn_27125_end.png`). The transports never
     come back: they are home. **The same on 715a5448** (`critic/c56_tb_ita6_cancelbtn_OLD_27125.json`).
   - **A click instead of the button:** all six clicked back to Rome at h66 (one batch, as `player.ts` sends it): 323
     and 324 both stay "At Rome: no room … they come back for it" and the row "turning back to Rome" from h78. A later
     click of 323 and 324 to Valletta (h198) **does nothing**, no refusal, no news: to h480 they stand at Rome under the
     same row (`critic/c56_rs_ita_malta6_reclick_27125.json`, `critic/shots/c56rs_ita_malta6_reclick_27125_h420_600m.png`).
     A click to a land point frees them (`critic/c56_rs_ita_malta6_27125.json`, h204), but the news keeps saying "they
     come back for it" after they have marched off.
   - **Scale (headless, `critic/scripts/c56_stuckret.ts`: a `returning` landing whose groups have stopped moving):** on
     the liab setups (24033, 26031–26049, 27031–27059 × 3), 10 of 78 HEAD runs have such a spell ≥ 30 days, 9 of 78 on
     715a5448, identical seed for seed but 24033 (`critic/c56_sr_ab.log`, `critic/c56_sr/*.log`): 27033 g1 113.7 d,
     27053 g1 110.6, 27055 g1 108.9, 27041 g1 100.0, 27039 g1 99.2, 27035 g1 85.0, 26041 g1 84.7, 27051 g1 47.5,
     **24033 g2 43.3 (HEAD; R55-B1's own seed)**, 27037 g1 36.2. landingInvariants says **0 broken** on every one:
     `stuck` counts gathering landings only, and `slowClick` cannot reckon these clicks (best way Infinity).
   - **24033 on HEAD** (`critic/c56_trace367_head_1700.log`, `critic/c56_sr_24033_head.log`, `critic/c56_rows_24033.log`):
     the world parts from run 55's by t1726, so landing 6 at t2125 no longer happens; instead landing 4 at Tokyo turns
     back at t1785, its group is in port by t1848, and 364, 365, 367 stand at 1818.5,385.5 in it, `returning`, to the end
     of the run (t2882), through 20 player clicks; the bar's row is state 2 with `backIn` null ("turning back to Tokyo")
     the whole time.
   - **Leads (read, not proven):** `comeBack` puts ashore and releases only divisions embarked on a group at the port;
     one not aboard stays in the landing forever. `chooseTransports`' `mine` has no state filter, so a click to the
     landing's own place joins the returning landing ("its next voyage") and is absorbed. The Cancel button orders a
     division ashore to its own cell (`server.ts` `cancelOrders`); 324 stood on Rome's port cell, the very point the
     ships were sent to, so its order reads as part of the turn-back; 323, a cell away, was freed.
   - **Why blocking:** a claimed feature (Cancel: "those ashore stop where they stand") does not do what it says, a
     division is frozen with text that is false, and the player's re-click is silently swallowed. Not a regression
     (both commits), so it moves no score against run 55; it blocks the release.
   - **Fix:** a returning landing with its groups at its port ends; those not aboard leave it (stand, or take the order
     that cancelled it), told. A returning landing is not joined. `landingInvariants`' `stuck` counts a returning
     landing standing still.

## Non-blocking issues (prioritised)

1. **R56-N1 (naval/UI): a landing that sails without a marcher: the countdown freezes, and its landing is never told.**
   Britain, the 10 divisions nearest Portsmouth to Bremerhaven (27123, 27127, 27129, both builds): 7 sail at h90, 275 is
   still 9 days' march from the port. The row reads "at sea: lands in about 3 days" for **54 h without moving**
   (h90–h144), 6 h before they land; then "sails in about 6 days · transports 48, 6 needed", with no "7 of 8 ashore"
   (`landing.group.ashore` exists). 275's own panel is right ("its landing sails before it is there; the transports come
   back for it") (`critic/c56_lhold_eng_br10_27123.log`, `critic/shots/c56lh_eng_br10_27123_h138_1500m.png`,
   `_h150_1500m.png`, `critic/c56_lland_eng_br10_OLD_27123.json`; `node critic/scripts/c56_frozen.mjs` over every c56
   probe: only these three exceed 30 h). Lead: `voyageHours` takes the most of all `l.fleets`, and the groups kept at
   the port for the next voyage (not moving) count their whole voyage from the port every hour.
2. **R56-N2 (naval): a lone division joins a sailed landing's far port and walks 73 days; no checker sees it.** 24033,
   orders stopped after day 8 (`ORDERDAYS=8 npx tsx critic/scripts/c56_orderdays.ts`): t173's click of 367 (Hokkaido) to
   China joins landing 1 as it sails from port 104 (~70 cells off); 367 walks to it from t186 and lands at t2019, 77 days
   after the click; 1 click reckoned, 1 not (`critic/c56_od_24033_8.log`; the same on 715a5448,
   `critic/c56_od_24033_8_old.log`). `chooseTransports`' last fallback ("a landing for that place that has sailed: its
   next voyage") has no bound; `farPort` judges only new landings. A short pool (2 groups), so rare.
3. **R56-N3 (checker coverage):** `slowClick` reckons 369 of 2,488 clicks over the 77 HEAD runs, 74 of them ashore
   (`critic/c56_li/head_*.log`): the fuzz re-clicks too often for most clicks to be judged, which is how R56-B1 and
   R56-N2 pass at 0 broken. A fuzz with `orderDays` short (as above) would judge more.
4. **Small:** after a cancel, 323's ticker row says "left its landing for a new one"; the "they come back for it" news
   stays after the division has marched off; "transports 48, 6 needed" when 48 are at hand reads as a shortage.
5. **Carried from run 55, not re-run:** R55-N1 (a war joined by guarantee leaves no History row), R55-N2 (landscape phone
   Build and Actions tabs), and run 55's small items.

## Run 55's cases re-run

| Run 55 case | `715a5448` (run 55) | HEAD `d016ed2a` | Evidence |
|---|---|---|---|
| **R55-B1** `landingInvariants 24033 3517 120 24033 30,90 2` | 1 broken (367: 17.1 d against 10.1) | **0 broken** | `critic/c56_li/head_24033_3517_g2.log`, `old_24033_3517_g2.log` |
| **R55-B1** `… 26045 …` | 1 broken (366: 9.5 d against 2.5) | **0 broken** | `critic/c56_li/head_26045_3517_g2.log` |
| 2×2, which change fixed which | — | new checker on old sim: 24033 broken, 26045 0; old checker on new sim: 24033 0, 26045 broken. The rule fixed 24033, the checker 26045, as ADR-892 says | `critic/c56_x_newchk_oldcode_*.log`, `critic/c56_x_oldchk_newcode_*.log` |
| Is the checker's relaxation hiding breaks? | — | 26045: 63 same-landmass divisions clicked, **0** in a landing 6 h later (they walk); 366's own best way 10.2 d (`bestWayHours`). One checker on 27031–27059 × 3: 0/45 both commits (715a5448's 27051 break was the old checker's "best way 0.0") | `critic/c56_best_26045.log`, `critic/c56_liab_oldnewchk.log`, `critic/c56_li/old_27051_3517_g2.log` |
| `c55_liab.sh` 26031–26049 × 3 | 29/30 at 0 | **30/30 at 0** | `critic/c56_liab.log` |
| Malta, 18 seeds | 12 thrown back, 6 broke off, one story | the same seeds, the same endings | `critic/c56_lland_ita_malta_*.json`, `critic/c56_lh_ita_malta_*.json` |
| 23105 / 21105 held mark, thrown / broke off | as run 55 | the same | `critic/c56_lhold.23105_*.log`, `critic/c56_lh_ita_malta_21105.json` |
| 22105 phone bar, 26105 phone bar, 21103 landscape box, 20661 and 26101 turn-backs | as run 55 | run, exit 0, no page error | `critic/c56_suiteA.log`, `critic/c56_lbar_*`, `critic/c56_lbox_*`, `critic/c56_tb_*` |
| 20861/23109/26107/26109/22103 | landed / never sailed | the same | `critic/c56_lland_*.json` |
| Replay of run 55's 27 headless jobs | — | see below | `critic/c56_replay/REPORT.md` |
| Dimensions carried | run 55's evidence | not re-run (focused) | run 55's paths |

**Replay of run 55's 27 headless jobs on HEAD** (`npx tsx tools/diag/replayCritic.ts --run 55 --at head --jobs 3 --out
critic/c56_replay`, `critic/c56_replay/REPORT.md`): 17 same, 10 differ, 0 failed. The 10: six only in output paths (the
7019 save, the four area runs, seaBattles 26061: 48 battles, 70 sinkings, as run 55), four landingInvariants only in
`slowClick`'s "clicks reckoned" (26021: 24 → 12; 26025: 16 → 4), every one still 0 broken. That drop is ADR-892's
checker change (clicks wholly on the target's landmass no longer reckoned): with R56-N3 it means fewer clicks judged.
7019's 20-year hash is unchanged, `18430918` on both (`critic/c56_replay/c55_seed7019_save.log`). No new seeds (`--new`): the builder ran
60001–61601 on `bacd2f6a`; my new seeds are 27031–27215 above.

## Design objections (none blocking, no score lowered)

- **ADR-759/875: a cancel hands the army to the AI at once.** Unchanged ("cancelled: back at Rome; the AI commands them
  again", `critic/c56_rs_ita_malta2_cancel_24151.json`).
- **Malta is never taken** (18 of 18 again). Carried from run 55.
- **Marches are slow against voyages.** A division walks about a cell a day (367: ~70 cells in 73 days; 275: 16 cells
  in ~9 days), so "which port" decides weeks; a group sailing to the division would often be quicker (R56-N2).

## Ideas from other games (not scored)

- Hearts of Iron's naval invasion screen shows each division's state in the plan (embarked, waiting, ready) in one list;
  a landing row that lists "7 ashore · 1 marching to Portsmouth" would answer R56-N1.

## Strengths (verified)

- **R54a is a clean, narrow fix:** both of R55-B1's commands at 0, 77 of 77 HEAD landingInvariants runs at 0, and the
  2×2 shows the rule and the checker each fixing exactly the case ADR-892 says, with nothing hidden by the checker on
  the seeds I could test.
- **The new "those that fit sail, the rest next voyage" path reads well and delivers:** the Italian six on 27125 are
  told in panel and news, and landingCallBound's left-behind division comes ashore at Belfast 11 days on.
