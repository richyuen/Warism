# Critic report, run 36 (focused) — after R23

- **Mode: focused.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). (1) Run 35 has two blocking issues
  (R35-B1, R35-B2) and a score under its bar (naval 7, bar 8). (2) Every commit since run 35's commit `a3e76107` is
  either the report's own commit `1c530ad7` (`PROGRESS.md`, `ROADMAP.md`, `critic/` only) or names an item that commit
  filed (`git show 1c530ad7 -- ROADMAP.md` adds R23 and R23a–e; the five commits are R23a, R23b, R23c, R23d, R23e).
  (3) Runs 33, 34, 35 were full, focused, focused: not all focused. So: every named case of run 35 re-run; scored afresh
  are naval (blocked on, under its bar) and the dimensions the changed files touch (`git diff --stat a3e76107 HEAD --
  src data public`: `amphibious.ts`, `movement.ts`, `orderNewsText.ts`, `server.ts`, `protocol.ts`): naval,
  diplomacyWarDepth (`movement.ts`: the order and refusal rules), uiUxPolish (the panel's notice), stability (worker,
  protocol), performance (two sim systems changed). Every other score is carried, its cases re-run.
  **Run 37 must be full** whatever comes of R23's successor: two of the last three would then be focused only if run 37
  were not, and a clean focused run is followed by a full one in any case.
- **Commit judged:** `41e88005e77ee4c91f924036fe4d28f4251fbca4` (HEAD at the start, `critic/c36_commit.txt`). **Date:** 2026-11-05.
- **Build:** `vite build --outDir critic/c36_dist`, exit 0 (`critic/c36_build.log`), served by `vite preview` on
  127.0.0.1:**5299**. Chromium through Playwright, headless; desk 1600 × 900, phone 390 × 844.
- **Baseline.** All 15 headless 20-year runs of run 35's seeds (`critic/scripts/c31_ho.ts`, ten heroes off, five on) are
  identical to run 35's with timings stripped (`critic/scripts/c36_ident.py`, `critic/c36_ho_*.json`); the year-20 save
  of 7019 made on HEAD is byte-identical to run 35's (`critic/c36_seed7019_y20.bin` = `critic/c35_seed7019_y20.bin`), and
  the 20 yearly rows of 7019 are identical but for timings (`critic/c36_headless_7019.json`). R23 left every AI world
  alone; where a player's sea order is in a case, the world differs as R23 means it to.
- **Runs:** 62 headless jobs (run 35's 51 re-runs and 11 fresh-seed fuzz and checker jobs, `critic/scripts/c36_jobsAll.txt`,
  `critic/c36_jobsAll.log`, none failed), 16 + 9 + 2 R23 attack jobs (`critic/scripts/c36_jobsR.txt`, `c36_jobsN.txt`,
  `c36_ash2.ts` acts `bound`/`allnear`), page suites L, A, B, C and a new suite R that records run 35's R22/R23 page
  commands (`critic/scripts/c36_suiteR.sh`; run 35 left them unrecorded). New probes: `c36_lof.ts` (which cells near
  Shanghai give the four's landing), `c36_lwt2.mjs` (the landing wait in the page with a real click NPX pixels east of
  Shanghai's centre, the one aboard alone or the whole click). Replays on run 35's commit in a worktree (`critic/wt`,
  removed): `critic/c36_wt_ash_*.json`.

## Verdict

**R23 fixes what run 35 named, case by case, in the page and headless:** the same landing clicked again for the one
aboard keeps all four together (land h1242–1243, `critic/c36_lwt_four_same.json`, `critic/c36_ssb.json`: 365 aboard at
h600, "Landed" at h1250); a refused order on open sea or on Calais leaves it "Aboard at Tokyo" under the refusal, and
all land together (`critic/c36_lwt_four_sea.json`, `critic/c36_lwt_four_neutral.json`,
`critic/shots/c36lwt_four_sea_act_panel.png`); the whole click clicked again lands together (h1242–1243 at hour 26 and
at the first hour aboard, `critic/c36_ash_all.json`, `critic/c36_ash_all_h0.json`; run 35: 185, 633, 952, 1243); the
lone Belfast landing is back at h59 (`critic/c36_lh_3517.json`; run 35: 73); a refusal given while marching goes with
the next march taken (`critic/c36_sn_ger3.json`, `critic/shots/c36sn_ger3_b_march.png`).

**Two blocking issues, both a click a few pixels off the one R23 tested.** `sameLanding` matches the landing to the
cell: one cell east of Shanghai is already another landing (`critic/c36_lof_3517.log`: the four's landing is
`845491/843443`; 1716.5,413.5 gives `845492/843444`, and 39 other landings lie within 20 cells). At the zoom the
page uses for this (937 m/px, 20.9 px a cell) a click 14 px from the centre of Shanghai — same tooltip, "China / Occupied
by Japan" — is another cell. There, the rule R23 restated ("a refused order leaves the one before it standing") does not
hold for the divisions still walking, and the one aboard is still taken off its transports:

- **R36-B1.** The whole click re-clicked 14 px off Shanghai: refused for all four ("no transports … with room"), yet the
  three walking lose their landing, the convoy sails at once with the one aboard, and that division lands **alone** in
  China at hour ~148, its panel reading "At sea, bound for its landing" over "not done" the hour after the click.
- **R36-B2.** With two (or three) divisions, the one aboard clicked 14 px off Shanghai is accepted silently, taken off
  the transports at Tokyo and sent "Marching to Sasebo to board transports" (the far end of Japan); the other lands
  alone at h633; 30 days on, it is still marching (two), or boards 19 days after the others landed (three).

**Naval stays at 7.** Run 35's blocking cases are fixed and its notes answered, but the landing a player can wreck with
the most natural click is still there, two pixels' width from the case the fix covers. uiUxPolish stays 7 for B1's
panel contradiction and a notice that outlives a re-click of the same march (R36-N1).

## Scores

| Dimension | Run 35 | Run 36 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | carried (no map file changed). Run 35's cases re-run: HF 5521 desk and phone, HF 7019 d730, HFT 5521, SK 1212 and 8123 identical (`critic/c36_hf_5521_desk_d0_0.json`, `critic/c36_hft_5521.json`, `critic/c36_sk_1212.json`, `critic/c36_sk_8123.json`). R31-N1 unchanged |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | rescored (`movement.ts`): the refusal rule now holds for the one aboard (R35-B2 fixed) but not for a division walking to its port: a refused order drops it from its landing (`critic/c36_ash_bound_sea.json`: 365 refused 17 at t27, stands at Tokyo to day 60 while the other three land; same on run 35's commit, `critic/c36_wt_ash_bound_sea.json`) — R36-B1. Checkers on new seeds: diploInvariants 0 broken on 10601 (heroes), 10663 (random diplomacy), 10709 (random world) (`critic/c36_diploinv_10601s_h.log`, `…_10663r.log`, `…_10709w.log`); worldInvariants 0 broken on 10601 heroes+navy × 20 y and 10663 random × 10 y (`critic/c36_wi_10601_h20_hn.log`, `critic/c36_wi_10663r_10.log`); run 35's seeds 0 broken (below). Not 8: run 30's list untouched; R36-B1 |
| Emergent world dynamics over long runs | 7 | 7 | carried: the world is run 35's (15 of 15 `ho` identical, year-20 save byte-identical) |
| God Mode | 7 | 7 | carried: A 4219 and 8999, Q 6421 and 8807, K/K2/K3 2203 identical but for the order of page-clock notes (`critic/c36_a_4219.json`, `critic/c36_k_2203.json`) |
| Editor and scenarios | 7 | 7 | carried: G 4877 timed out at its 900 s page wall clock as in run 34 (run 35 finished); its six marks agree in forces; its `histSea` is empty at every mark where run 35 had entries, which we put down to the slower page reaching the history late (history itself is identical on 7019's save, `critic/c36_hi_7019_c32save.json`), not established (`critic/c36_g_4877.json`); OS2 identical to run 35 (`critic/c36_os2_c25.json`) |
| Stats and history | 7 | 7 | carried: HI (both) and DL on 7019's year-20 save identical (`critic/c36_hi_7019_c32save.json`, `critic/c36_dl_7019.json`); SHM ten identical (`critic/c36_shm_ten.json`) |
| UI/UX and polish | 7 | 7 | rescored: R35-N1 fixed (`critic/c36_sn_ger3.json`: the refusal gone in the first hour of the next march); the aboard panel stays right under refusals (`critic/shots/c36lwt_four_sea_act_panel.png`); Status/Landing columns identical to run 35 (`critic/c36_lwp_desk.json`, `critic/c36_lwp_phone.json`). Not 8: R36-B1 puts "At sea, bound for its landing" over "not done: no transports …" (`critic/shots/c36lwt2_four_allnear14_act_panel.png`); a refusal stays under a re-click of the same march (R36-N1, `critic/shots/c36sn_ger_samegoal_b_march.png`); a re-click of the same landing is taken in silence; rows still cut (R32-N3) |
| Performance | 7 | 7 | rescored: PF on 7019's year-20 save, quiet: 60 fps at 3,000 and 600 m/px, 58.8–60 at 1,200, 35–40 at 120, 39–48 at 30, p95 ≤ 18.5 ms (run 35: 37–48.5 at 120/30, ≤ 18.4; `critic/c36_pf_7019.json`, `critic/c35_pfq_7019.json`); LW 3517 with heroes, run beside suite C: 59.9–60 fps, longest gap 83 ms, as run 35 (`critic/c36_lwhon_3517.json`); quiet ten-year LW 6151 with nothing else running: 59.8–60 fps every year, longest gap 83 ms, 290.6 s, no page error (run 35: 59.8–60, 83 ms, 291.5 s; `critic/c36_lw_6151.json`, `critic/c35_lw_6151.json`); headless 7019 year 1 3.59 ms a tick (run 35 3.94 under load). `escortConvoy` now searches up to eight sea routes per new convoy: SHM ten sent at once identical to run 35 (`critic/c36_shm_ten.json`). Not 8: no phone-class device measured |
| Stability | 7 | 7 | rescored: no page error in any probe (66 page JSONs, `errors: []`); 62 + 27 headless jobs, none crashed; determinism above. Not 8: R36-B1/B2 leave divisions out of their landing, untold or told the opposite |
| Semantic zoom to unit level (needs 8) | 8 | 8 | carried: PHZ 2671 and 8233 identical; Z 3517 and 8123 differ only in element counts sampled on the page clock (`critic/c36_z_3517.json`, `critic/c36_phz_8233.json`) |
| Naval warfare (needs 8) | 7 | **7** | rescored: R35-B1, R35-B2, R35-N2, R35-N3 fixed (table below); navy rules 0 broken 20 years on new seed 10601 (`critic/c36_wi_10601_h20_hn.log`); sea orders fuzzed on six new seeds × 120 days, nothing stranded (`critic/c36_fz_*.json`, `strandedN: 0`; new seeds, not compared). **Not 8: R36-B1 and R36-B2 (blocking)** |
| Tanks (needs 8) | 8 | 8 | carried: C 6421, 7019, 8573 identical but view samples (`critic/c36_c_7019.json`) |
| Aircraft (needs 8) | 8 | 8 | carried: W 7019 and 8431 re-run, samples on the page clock (`critic/c36_w_7019.json`) |
| AI nuclear use (needs 8) | 8 | 8 | carried: AN 6299 year 18 and AN 7019 year 20 identical (`critic/c36_an_6299y18c32.json`, `critic/c36_an_7019y20.json`) |

## R23, case by case

| Item | Case | Result | Evidence |
|---|---|---|---|
| R23a (R35-B2) | Japan's four to Shanghai; at hour 26 the one aboard clicked onto open Pacific / Calais (real clicks) | **fixed**: refused 17 / 15, "Aboard at Tokyo" with the notice; all land h1242–1243 headless | `critic/c36_lwt_four_sea.json`, `critic/c36_lwt_four_neutral.json`, `critic/c36_ash_seaopen.json`, `critic/c36_ash_neutral.json` |
| R23a | the same, one cell off Shanghai (headless) | **fixed**: refused 6, stays aboard, all four land together (run 35's commit: ashore at Tokyo, never lands, `critic/c36_wt_ash_near_e1.json`) | `critic/c36_ash_near_e1.json`, `…_near_se1`, `…_near_s2`, `…_near_nw6` |
| R23a | a **walking** division of the click (365) ordered onto open sea / Calais | **not fixed** (older): refused, and dropped from the landing for good | `critic/c36_ash_bound_sea.json`, `critic/c36_ash_bound_neutral.json`, `critic/c36_wt_ash_bound_sea.json` |
| R23b (R35-B1) | the one aboard clicked to Shanghai again (real click on its centre, and 8 px off) | **fixed**: stays aboard, all land h1243–1244 | `critic/c36_lwt_four_same.json`, `critic/c36_ssb.json`, `critic/c36_lwt2_four_allnear8.json`, `critic/c36_lwt2_two_near8.json` (land h632) |
| R23b | the one aboard clicked **14 px** off (two divisions; three, headless) | **R36-B2** | `critic/c36_lwt2_two_near14.json`, `critic/c36_ash_near_e1_2.json`, `critic/c36_ash_near_e1_3_200.json` |
| R23c (R35-N1) | Germany's division 1 marching, refused Paris, then sent elsewhere (real clicks) | **fixed** | `critic/c36_sn_ger3.json` |
| R23c | the same, then re-clicked on the first march's own goal | refusal stays (R36-N1) | `critic/c36_sn_ger_samegoal.json` |
| R23d (R35-N3) | one division to Belfast (LH 3517) | **fixed**: lands h59 (run 35: h73) | `critic/c36_lh_3517.json` |
| R23e (R35-N2) | all four re-clicked to Shanghai at hour 26 and at the first hour aboard | **fixed**: land h1242–1243 | `critic/c36_ash_all.json`, `critic/c36_ash_all_h0.json` |
| R23e | all four re-clicked 14 px off (real click; headless one cell off, at hour 2 and 26) | **R36-B1** | `critic/c36_lwt2_four_allnear14.json`, `critic/c36_ash_allnear_e1.json`, `critic/c36_ash_allnear_e1_h0.json` |

## Run 35's cases re-run

| Run 35 case | On HEAD (`41e88005`) | Evidence |
|---|---|---|
| R35-B1 (same landing again: 365 on the quay h512–h1367) | **Fixed** | `critic/c36_ssb.json`, `critic/c36_ash_same.json` |
| R35-B2 (refused order unloads the one aboard) | **Fixed for the one aboard**; a walking one still dropped (R36-B1) | above |
| R35-N1 (refusal under the next march) | **Fixed**; same-goal re-click not (R36-N1) | `critic/c36_sn_ger3.json` |
| R35-N2 (whole click re-clicked scatters) | **Fixed** for the exact landing; one cell off: R36-B1 | `critic/c36_ash_all.json` |
| R35-N3 (Belfast h73) | **Fixed** (h59) | `critic/c36_lh_3517.json` |
| ash same2 / same3_200 / extra / neutral / seaopen | same2 land 632/633, same3 951/952, extra the four 1242–1243 (369 as in run 35), neutral and seaopen all four together | `critic/c36_ash_*.json` |
| LWT four_recall, LWP desk/phone, PST | identical to run 35 (recall obeyed; columns; "its port is bombed shut" for 270 and 271 at h61, h85) | `critic/c36_lwt_four_recall.json`, `critic/c36_lwp_desk.json`, `critic/c36_pst.json` |
| WAIT four120 / three90 / reorder / cancel / peace / engcalais3 / enggerfour; PM; PS; LMCHK; LH2 | every `landedAt` identical to run 35; traces differ where R23d picks another escort; PM, PS, LMCHK, LH2 logs identical | `critic/c36_wait_*.json`, `critic/c36_pm_*.log`, `critic/c36_ps.log`, `critic/c36_lh2_*.log` |
| LP (Calais, Bergen, USA, at war, Shanghai), NR desk/phone, SHM ten | identical but one page-clock ticker row | `critic/c36_lp_*.json`, `critic/c36_nr_*.json` |
| HO ten off / five on, headless 7019 × 20, def 8123, workerDeterminism 3517 | identical (timings aside) | `critic/c36_ho_*.json`, `critic/c36_headless_7019.json`, `critic/c36_def_8123.json`, `critic/c36_wd_3517.log` (`7e113d94` on every arm) |
| A, Q, K/K2/K3, Z, C, PHZ, SB, PL, P, U, RG, RGT, BT, FW2, TR, W, HWP, HT, HFT, HF, HS, DF, G, OS2, AN, HI, DL, PF, LW 3517 heroes | identical, or differ only in samples on the page's clock (G timed out at 900 s as in run 34) | `critic/c36_*.json` |
| Checkers on run 35's seeds | 0 broken: diploInvariants 8123 h, 8431 r, 8807 w, 8573, 8999 h; worldInvariants 8123, 8431, 8807, 8233 h+navy, 9311 air, 8677 bankrupt; heroWaits 8125 | `critic/c36_diploinv_*.log`, `critic/c36_wi_*.log`, `critic/c36_herowaits_8125.log` |
| R32-N2, R32-N3, R31-N1, R31-N6, no default in AI play, R32-N5 | **Unchanged** | `critic/c36_tr_phone.json`, `critic/c36_rgt_4111.json`, `critic/c36_hs_3739.json`, `critic/c36_def_8123.json` |

## Blocking issues

1. **R36-B1. A refused order drops a walking division from its landing; a whole click re-clicked a few pixels off
   sends the one aboard to land alone.** Japan, the four nearest Tokyo sent to Shanghai by one real click (escort on); at
   hour 26 all four selected and clicked again 14 px east of Shanghai's centre (937 m/px; the tooltip still "China /
   Occupied by Japan"). The worker refuses all four at once (`orderNews` reason 6, "no transports of its nation with
   room for it are at a port it can reach"). Yet: the one aboard (364) is "At sea, bound for its landing" the next hour,
   the notice "not done" under it (`critic/shots/c36lwt2_four_allnear14_act_panel.png`), lands alone in China and is
   "On the march" there, supply 75 %, by hour 242 (`critic/shots/c36lwt2_four_allnear14_h242_panel.png`); the other
   three are no longer bound to anything (`critic/c36_lwt2_four_allnear14.json`, `final`: `v: null`) and, headless,
   stand at Tokyo to day 60 (`critic/c36_ash_allnear_e1.json`: 364 lands t148; the same at the first hour aboard,
   `critic/c36_ash_allnear_e1_h0.json`: t124). Cause, read: `orderAshore` deletes `seaBound`/`seaFetch` before judging
   the order, and only the aboard path (`ashoreAtPort`'s way back) restores them; with nobody else bound the convoy sails.
   A single walking division refused (open sea, Calais) is dropped the same way and stands at Tokyo for good
   (`critic/c36_ash_bound_sea.json`, `critic/c36_ash_bound_neutral.json`). The bound-division drop is older (run 35's
   commit: `critic/c36_wt_ash_bound_sea.json`; whole click: all four at Tokyo, none landed, `critic/c36_wt_ash_allnear_e1.json`),
   but R23a's DECISIONS entry claims "a refused order leaves the one before it standing holds aboard too", and here a
   refusal launches a one-division landing. **Fix:** judge every order before clearing the formation's binding; a
   refused order restores `seaBound`/`seaFetch` for any division, not only one aboard. AT: the four re-clicked one cell
   east of Shanghai at hour 26: all refused, all four still bound/aboard, all land within a day; red without.
2. **R36-B2. The one aboard clicked a few pixels off its landing is taken off its transports and sent to another port;
   the landing splits for weeks, untold.** Japan, the two nearest Tokyo to Shanghai; at hour 26 the one aboard (364)
   clicked 14 px east of Shanghai (real click). No refusal, no notice: it is ashore, "Marching to Sasebo to board
   transports" (`critic/shots/c36lwt2_two_near14_act_panel.png`), still marching 30 days later; 365 sails alone and lands
   at h633 (`critic/c36_lwt2_two_near14.json`). Headless: 364 boards elsewhere at t1236 and lands at t1285, 27 days after
   365 (`critic/c36_ash_near_e1_2.json`); with three, it boards at t1412, 19 days after the other two landed
   (`critic/c36_ash_near_e1_3_200.json`). The same click 8 px off keeps both together (`critic/c36_lwt2_two_near8.json`,
   land h632). Older than R23 (identical on run 35's commit: `critic/c36_wt_ash_near_e1_2.json`,
   `critic/c36_wt_ash_near_e1_3_200.json`), but it is R35-B1's "go on, then" click
   made at a distance a player cannot see: 39 other landings lie within 20 cells of Shanghai (`critic/c36_lof_3517.log`).
   That a cell apart is another landing is the specified rule (SPEC, R23b: the same land and water); what is scored
   here is its execution as the player reads it: nothing on the map, the tooltip or the panel tells the two landings
   apart, the division leaves transports with room that sail to the next cell, the panel names a port at the other
   end of Japan without a word on why, and no notice is given. The design itself is under "Design objections".
   **Fix:** a landing for an order of a division aboard (or bound) matches its own when it is the same coast within a
   few cells (or the same water zone and land holder), not only the same cell pair; or the one aboard keeps its convoy
   and the convoy takes the new landing when it is that close; never send a division aboard to another port's
   transports without telling it. AT: the two to Shanghai, the one aboard re-clicked one cell east: both land within a
   day; red without (h633 / h1285).

## Non-blocking issues (prioritised)

1. **R36-N1. A refusal stays under a re-click of the same march.** Germany's division 1 marching, refused Paris, then
   clicked on its own march's goal again (accepted): six hours on, "On the march" over "not done: there is no way by
   land…" (`critic/c36_sn_ger_samegoal.json`, `critic/shots/c36sn_ger_samegoal_b_march.png`). R23c keys staleness on the
   goal cell; an order taken is the event, not a changed goal.
2. **R36-N2. The refusal reason misleads for a near-miss landing.** The one aboard (four case) clicked a cell off
   Shanghai is refused "no transports of its nation with room for it are at a port it can reach" while it sits aboard
   transports at Tokyo bound for the same coast (`critic/c36_ash_near_e1.json`, reason 6). Fuzhou (a real other landing)
   gets the same (`critic/c36_ash_far_fuzhou.json`).
3. **R36-N3. A re-click of the same landing is taken in silence** (`critic/c36_lwt_four_same.json`: no news, the panel
   unchanged); read, not run: the escort box's state on the second click is ignored (`sameLanding` returns first).
4. Fuzz on new seeds: one division bound (walking to or waiting at its port) 1,920 h of 2,880 on 10601 JAP, 1,165 h on
   10709 USA, 960 h on 10853 ENG, none stranded (`critic/c36_fz_10601_jap.json`, `…_10709_usa.json`,
   `…_10853_eng.json`); new seeds, not compared, not filed.
5. **R32-N2**, **R32-N3**, **R31-N1**, **R31-N6**, **no default in AI play**, **R32-N5** — unchanged.

## Design objections (none blocking, no score lowered)

- ADR-826/R22b, R23b: a landing is a (water, land) cell pair, and the player is never shown which; any two clicks a
  cell apart are two landings. R36-B2 is execution, but a landing the player can see (a marker on the coast while
  choosing) would remove the class of bug and the confusion with it.
- Run 33–35's objections stand: an ally's coast refused as "a nation outside its wars"; the jump home across the sea;
  save format 2 refuses older scenarios.

## Ideas from other games (not scored)

- Hearts of Iron's naval invasion is a plan drawn to a named beach; re-issuing it to the same region does not reshuffle
  divisions. A "landing" snapped to the nearest named coast/port region would make R36-B2 impossible.
- Europa Universalis clears an order's error as soon as the unit takes any new order, even the same one (R36-N1).

## Notes

- `c36_sn_stale`'s first click landed on "Germany" rather than run 35's "Hamburg" label (a reconstructed coordinate);
  the case is the same (a march, a refused Paris, a march elsewhere). Commands now recorded in `critic/scripts/c36_suiteR.sh`.
- `enggerfour` (Britain → Germany's coast) is refused "neutral" at hour 3 on both commits; the AI then ships them to
  Aden. Not R23's.
- Worktree `critic/wt` at `a3e76107` was used for the replays and removed (node_modules junction unlinked first).

## Strengths, verified

- **R23's five items each do what they say on the case they were written for**, in the page by real clicks:
  `critic/c36_lwt_four_same.json`, `critic/c36_lwt_four_sea.json`, `critic/c36_sn_ger3.json`, `critic/c36_lh_3517.json`
  (59 h), `critic/c36_ash_all.json`.
- **R23 again left every AI world bit-identical** (15 twenty-year worlds, a year-20 save, the default run), and 0 broken
  rules on 16 checker runs, three of them on new seeds.
