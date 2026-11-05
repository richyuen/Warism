# Critic report, run 37 (full) — after R24

- **Mode: full.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). Runs 34, 35 and 36 were all focused
  (each JSON's `mode`), so the third condition of a focused run fails whatever else holds; run 36 and ROADMAP R24 say
  the same. Every dimension is scored afresh on this build; none is carried.
- **Commit judged:** `b0dd86f303312971a1fc3239535c18e0d874f14a` (HEAD at the start, `critic/c37_commit.txt`).
  **Date:** 2026-11-05.
- **What changed since run 36** (`git diff --stat 41e88005 HEAD -- src`): `movement.ts` (R24a, a refused order restores
  `seaBound`/`seaFetch` for any division), `amphibious.ts` (R24b, `sameLanding` within `SAME_LANDING_CELLS` = 2 of the
  landing's water and land, same holder; R24d, `RejectReason.Loading` 18), `hud.ts`/`App.tsx`/`orderNewsText.ts` (R24c,
  `Hud.orderedAt` ends a refusal notice at any order sent), `events.ts`, `en.json`.
- **Build:** `vite build --outDir critic/c37_dist`, exit 0 (`critic/c37_build.log`), served by `vite preview` on
  127.0.0.1:**5299**. Chromium through Playwright, headless; desk 1600 × 900, phone 390 × 844.
- **Baseline: R24 left every AI world alone.** All 15 headless 20-year runs of run 36's seeds (`c31_ho.ts`, ten heroes
  off, five on) are identical to run 36's with timings stripped (`critic/scripts/c37_ident.py`, `critic/c37_ho_*.json`);
  the year-20 save of 7019 made on HEAD is byte-identical to run 36's (`cmp critic/c37_seed7019_y20.bin
  critic/c36_seed7019_y20.bin`); the default run 8123 is identical (`critic/c37_def_8123.json`); workerDeterminism 3517
  gives `7e113d94` on every arm as in run 36 (`critic/c37_wd_3517.log`). 88 page JSONs, none with a page error; of
  those with a `c36_` twin, all but the landing cases R24 changes are identical or differ only in samples on the page's own clock (frame-rate, tick
  at a sample, boot time) — listed under "Run 36's cases re-run".
- **Runs:** 120 headless jobs eight at a time (`critic/scripts/c37_jobsQ.txt` = run 36's 62 + its 25 R/N attack jobs +
  33 new, `critic/c37_jobsQ.log`, every one exit 0); 18 R24 edge jobs (`critic/scripts/c37_jobsP.txt`,
  `c37_jobsP2.txt`, and four run by hand: `near_s2_2`, `near_sw2_2`, `bound_sea`, `bound_neutral`); page suites A, B (less G and the long watch), C (less PF), L, R (run 36's), R2 (run 36's blocking
  page cases and R24's edges), N and N2 (fresh seeds 11003, 11071, 11149, 11213, 11287 for zoom, battle, wing, God,
  breakthrough, phone zoom, stacks, relations, AI nukes, history, export), and Q (PF, the quiet ten-year watches and the
  editor, alone on the machine). New probes: `c37_lwt4.mjs` (the landing wait with a real click NPX/NPY px off
  Shanghai's centre), `c37_lwt3.mjs` (the one aboard clicked to another landing, the panel read), `c37_cellprobe.mjs`
  (which cell a pixel offset is, and whether the click would pick a formation instead), `c37_fz2.ts` (the fuzz with a
  trace), `c37_map.ts`. A worktree of run 36's commit (`critic/wt`, removed) for one replay.

## Verdict

**R24 does what it says on the cases it was written for, and R36-B1 is fixed.** The whole click re-clicked 14 px off
Shanghai keeps all four (refused for the far ones, nothing dropped; headless all four land h1242–1243, run 36: 364 alone
at t148, the rest never) — `critic/c37_lwt2_four_allnear14.json`, `critic/c37_ash_allnear_e1.json`; a walking division
refused onto open sea or Calais stays bound and lands with the rest (`critic/c37_ash_bound_sea.json`,
`critic/c37_ash_bound_neutral.json`); the refusal notice goes at any new order, even to the same goal
(`critic/c37_sn_ger_samegoal.json`); the one aboard ordered to Fuzhou with no other transports free reads "its
transports are loading for another landing…" over "Aboard at Tokyo" (`critic/shots/c37lwt3_four_far_fuzhou_act_panel.png`).
R36-B2's own case (the two, the one aboard clicked 14 px east) now lands together at h632 (run 36: h633 / h1285).

**One blocking issue: R36-B2 is still there two cells further on.** R24b's "within two cells" is measured between
*landings*, not between the click and the landing, and the landing a click resolves to can lie much further from the
click than the click from Shanghai. A real click 42 px straight below Shanghai's dot (cell 1715,415; the same coast, the
same tooltip "China / Occupied by Japan", no formation under it) resolves to a landing whose land is four cells from
Shanghai's: the one aboard is taken off its transports in silence and sent "Marching to Sasebo to board transports"; its
partner lands alone at h632 and it is still marching 30 days on (R37-B1). This is ROADMAP R24b's own promise — "a click a
cell or two off the landing is the same landing" — broken at two cells, with the run-36 symptom unchanged to the hour
(633 / 1288 headless, identical on run 36's commit).

**Naval stays at 7, under its bar of 8,** for R37-B1. Every other dimension holds at its bar; none rises.

## Scores

| Dimension | Run 36 | Run 37 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | rescored on fresh seeds: twelve years of 11213 at world zoom (`critic/shots/c37lwnewhon_11213_y12_world.png`: Denmark holding Greenland and Canada's north, the Soviet Union and the US leading, readable names and chips); the zoom ladder on 11003 from 6,000 to 3 m/px (`critic/c37_z_11003.json`, `critic/shots/c37z_11003_13.png`); German armour on Poland at 250 and 15 m/px on 11071 (`critic/shots/c37c_11071_arm_0250m.png`, `…_arm_15m_live_1.png`). Run 36's HF/HFT/SK cases identical (`critic/c37_hf_5521_desk_d0_0.json`, `critic/c37_sk_1212.json`). **Not 8:** hero counters still bury Europe at world zoom, worst on the phone (`critic/shots/c37ht_phone_07_god.png`: eight hero labels over Europe and the Mediterranean, the countries under them unreadable; R31-N1/N2 unchanged, `critic/shots/c37hf_7019_desk_d730_0.png`); the battle at 250 m/px is a pile of overlapping division labels (`critic/shots/c37c_11071_arm_0250m.png`) |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | rescored: the order rule "a refused order leaves the one before it standing" now holds for divisions walking to their convoy (R24a: `critic/c37_ash_bound_sea.json` 365 refused 17 and still bound to 1144, lands 1243; run 36: dropped for good). Checkers on new seeds: diploInvariants 0 broken on 11003 (heroes), 11071 (random diplomacy), 11149 (random world), 11213 (`critic/c37_diploinv_11003s_h.log`, `…_11071r.log`, `…_11149w.log`, `…_11213.log`); worldInvariants 0 broken on 11003 heroes+navy 20 y, 11071 random 10 y, 11149 random world 5 y, 11287 random air 20 y (`critic/c37_wi_*.log`); heroWaits 11003 0 broken; run 36's eight seeds 0 broken again. Relations graph on 11213 over a year opens in 306 ms with 67 nodes and every kind toggles (`critic/c37_rg_11213_desk.json`). **Not 8:** run 30's list (bond exit, guarantees, a refused peace untold) untouched; R37-B1's same click is accepted or refused by how many divisions share the convoy (counted under naval) |
| Emergent world dynamics over long runs | 7 | 7 | rescored on four new 20-year seeds (`critic/c37_ho_new_*.json`, new seeds, not compared): 97 → 83, 94 → 81, 98 → 79, 101 → 61 nations; 208–278 wars declared, 262–348 capitals taken, 56–89 revolts, 47–65 puppets; the lead changes hands in three of four (Soviet Union 28.6 % at year 10 → United States 23.0 % at 20 on 11003; Canada 14.0 % → Japan 14.7 % on 11149); 15 and 5 nuclear bursts on two seeds, none on the other two. In the page, 11213 with heroes over twelve years: 101 → 78 nations, Nationalist Spain against Portugal and its 22 allies, Japan and nine allies against Free Ouémé and twelve, capitals falling every year (`critic/c37_lwnewhon_11213.json`). On 11003 by 1956 the United States has taken all of Great Britain and Ireland and holds 29.9 M km² (`critic/shots/c37an_11003y18_0_goto.png`). **Not 8:** no default in AI play (8123 identical, 0); sea heroes lost every few months (R32-N5, by construction) |
| God Mode | 7 | 7 | rescored on fresh seeds: Q 11287 — revolt (Free Saxony), spawn nation (Free Silesian Voivodeship), found city, raze Prague, each with its ticker row (`critic/c37_q_11287.json`, `critic/shots/c37q_11287_raze_prague_1day.png`); A 11213 — a hydrogen bomb on Paris, alert with Go to, "3,329,000 civilians killed" (`critic/shots/c37a_11213_14_paris_h_2h.png`); K 11003 — Breakthrough from Berlin to Warsaw at peace changes nothing and says nothing (engaged 0 → 0 at the click, `critic/c37_k_11003.json`; the same on 2203 in runs 36 and 37). Run 36's A/Q/K/K2/K3 identical but page-clock notes. **Not 8:** a trait's effect still shown nowhere (R32-N2); the silent Breakthrough at peace |
| Editor and scenarios | 7 | 7 | rescored: G 4877 run alone on the machine (suite Q): the editor places fleets, wings and Poland's ten warheads, the pending text and cancel work, the world loads (`critic/c37_g_4877.json`: `placed`, `pendingText`, `afterCancelPending`, `loaded`); marks at days 1, 2, 3, 10, 30, 60 (Poland 48 → 19 forces, a sea battle France against Germany at day 2–3 with its History rows, `histSea` 2–3 at days 1–3 where run 36 had 0–1). It again stopped at its 900 s wait for day 120 — quiet this time, so run 34/36's "slow page under load" explanation is wrong; the probe never resumes after the game pauses itself, most likely for a nuclear alert (Poland holds ten warheads at war), not established. OS2 still refuses run 25's scenario file (design objection; the same `waitForURL` fatal as run 36's, `critic/c37_os2_c25.json`). **Not 8:** the old-save refusal; no editor case seen beyond run 36's |
| Stats and history | 7 | 7 | rescored on a fresh save (11003, year 18, made on HEAD): History opens in 200 ms on 3,483 events, 29 kinds (`critic/c37_hi_11003.json`); the CSV has all 3,483 rows plus a header, the JSON 34,832 lines (`critic/c37_dl_11003.json`, `critic/c37_dl_11003.csv`); rows read well ("Land held by France rose and went back to United Kingdom"). 7019's year-20 History and export identical to run 36. **Not 8:** a jump home across the sea still leaves no History row (`critic/c37_shm_ten.json` identical to run 36) |
| UI/UX and polish | 7 | 7 | rescored: R36-N1 fixed (`critic/c37_sn_ger_samegoal.json`: "On the march", no notice after the re-click of the same goal); R36-N2 fixed for the one aboard (reason 18, `critic/shots/c37lwt3_four_far_fuzhou_act_panel.png`); the aboard panel stays right under R24a's refusals (`critic/c37_lwt2_four_allnear14.json`: "Aboard at Tokyo, waiting…", no notice). **Not 8:** R37-B1 tells nothing — no notice, no row, and a panel status naming a port at the other end of Japan (`critic/shots/c37lwt4_two_s42_act_panel.png`); the whole click re-clicked two cells south gives four "not done" refusals of which three are false for divisions that keep their transports (R37-N1); the relations graph's labels collide ("AustraliaUnited Kingdom", "French West Afri", `critic/shots/c37rg_11213_desk_d0.png`); rows still cut (R32-N3) |
| Performance | 7 | 7 | rescored, timing cases alone on the machine (suite Q, after every other job): PF on 7019's year-20 save 60 fps at 3,000, 1,200 and 600 m/px, 36.4–37.1 at 120, 43–44.9 at 30, p95 ≤ 18.4 ms (run 36: 36.7–37.9 and 43.6–44.2, ≤ 18.5; `critic/c37_pf_7019.json`, `critic/c36_pf_7019.json`); ten-year watch of 6151: 59.9–60 fps every year, longest gap 83 ms, 291.8 s, no page error (run 36: 59.8–60, 83 ms, 290.6 s; `critic/c37_lw_6151.json`); 3517 with heroes: 59.8–60, 83 ms, 298.4 s (run 36: 59.9–60, 83 ms, 300.6 s; `critic/c37_lwhon_3517.json`); new seed 11213 with heroes, twelve years beside eight sims: 59.9–60 fps, longest gap 117 ms, p99 17 ms (`critic/c37_lwnewhon_11213.json`); headless ticks 2.7–5.8 ms a tick on 11003 under load (`critic/c37_headless_11003.json`). **Not 8:** 36–45 fps at 120 and 30 m/px on a late world; no phone-class device measured |
| Stability | 7 | 7 | rescored: no page error in any of 88 page JSONs (one probe fatal, OS2, the same as run 36's); 120 + 18 headless jobs, none crashed; determinism: 7019's save byte-identical to run 36's, workerDeterminism `7e113d94` on 3517 and `d2716b65` on every arm of new seed 11071 (`critic/c37_wd_11071.log`). **Not 8:** R37-B1 splits a landing for weeks, untold |
| Semantic zoom to unit level (needs 8) | 8 | 8 | rescored on fresh seeds: Z 11003 — elements from 1,573 m/px, men from 28.3 m/px down to 3 m/px, 18 tiers, no error (`critic/c37_z_11003.json`, `critic/shots/c37z_11003_13.png`: helmets, flags, guns, aircraft at 18 m/px in contact); PHZ on a phone on 11071 — six tiers 30,000 → 25 m/px, no horizontal overflow, a tap at 25 m/px opens the division in contact ("Square infantry division 390", `critic/c37_phz_11071.json`). Z 3517/8123 and PHZ 2671/8233 as run 36 (samples on the page clock) |
| Naval warfare (needs 8) | 7 | **7** | rescored: R36-B1 fixed (above); R36-B2's 14 px case fixed (`critic/c37_lwt2_two_near14.json`, land h632; headless `critic/c37_ash_near_e1_2.json` 632/633, run 36 633/1285); navy rules 0 broken 20 years on new seed 11003 (`critic/c37_wi_11003_h20_hn.log`); sea orders fuzzed on five new seeds × 120 days, nothing stranded (`critic/c37_fz_11*.json`, `strandedN: 0`); the sea battle off Cartagena (France against the Spanish Republic, 7019, day 13) reads at 250 m/px — flotillas and squadrons labelled, the fight ringed, a ticker row (`critic/shots/c37sb_7019_250m_balls.png`); 213–445 sea battles and 1,452–3,150 ships sunk in 20 years on the four new seeds. **Not 8: R37-B1 (blocking)** |
| Tanks (needs 8) | 8 | 8 | rescored on fresh seeds: C 11071 and 11287 — Armoured division 40 in contact with the Poles at 15 m/px in three live frames, every tank drawn with its gun, 10,000+ men drawn (`critic/shots/c37c_11071_arm_15m_live_1.png`, `critic/c37_c_11071.json`, `critic/c37_c_11287.json`); wrecks left after week two (2 at 250 and 80 m/px). Run 36's C 6421/7019/8573 the same but view samples |
| Aircraft (needs 8) | 8 | 8 | rescored: W on new seed 11149 — the fighter followed, 53 of 58 samples at 3,000 m/px flying with a mark, none missing; at ×5, 57 of 57 (`critic/c37_w_11149.json`); air rules 0 broken over 20 years on new seed 11287 with random diplomacy and heroes (`critic/c37_wi_11287r_h20_air.log`); 7019 and 8431 as run 36 (the same 250 m/px p90 ≈ 660–700 px) |
| AI nuclear use (needs 8) | 8 | 8 | rescored on a fresh save: 11003 at year 18 (made on HEAD) — three Soviet strikes on the United States in four months (near Ayr: "0 civilians killed; 67,362 men, 250 guns and 216 tanks lost"; near Vaduz; a hydrogen bomb near Chamdo), each alerted with Go to and flown to (`critic/c37_an_11003y18.json`, `critic/shots/c37an_11003y18_0_goto.png`, `…_0_z00600.png`); new seeds: 15 and 5 bursts in 20 years, none on two (restraint as well as use). 7019 year 20 and 6299 year 18 the same strikes as run 36 |

## R24, case by case

| Item | Case | Result | Evidence |
|---|---|---|---|
| R24a (R36-B1) | Japan's four to Shanghai; at hour 26 all four re-clicked 14 px east (real click) | **fixed**: all still aboard/bound, no notice, "Aboard at Tokyo, waiting…" | `critic/c37_lwt2_four_allnear14.json`, `critic/shots/c37lwt2_four_allnear14_h242_panel.png` |
| R24a | headless, the same one cell east at hour 26 and hour 2; two and three cells south | **fixed**: refused, kept, all four land 1242–1243 (run 36: 364 alone at t148 / t124) | `critic/c37_ash_allnear_e1.json`, `…_allnear_e1_h0.json`, `critic/c37_ashp_allnear_s2.json`, `critic/c37_ashp_allnear_s3.json` |
| R24a | a walking division ordered onto open sea / Calais / one cell east / two cells south | **fixed**: refused (17 / 15 / — / 6), still bound, lands with the rest | `critic/c37_ash_bound_sea.json`, `…_bound_neutral.json`, `critic/c37_ashp_bound_e1.json`, `critic/c37_ashp_bound_s2.json` |
| R24b (R36-B2) | the two; the one aboard clicked 14 px east (page), one cell east / south (headless) | **fixed**: land 632/633 | `critic/c37_lwt2_two_near14.json`, `critic/c37_ash_near_e1_2.json`, `critic/c37_ashp_near_s1_2.json` |
| R24b | three, one cell east at hour 200 | **fixed**: 951/952/952 (run 36: 364 at sea at day 60) | `critic/c37_ash_near_e1_3_200.json` |
| R24b | the two; the one aboard clicked **42 px below** Shanghai (page, cell 1715,415) | **R37-B1**: "Marching to Sasebo to board transports", no notice; partner lands alone h632; still marching at h722 | `critic/c37_lwt4_two_s42.json`, `critic/shots/c37lwt4_two_s42_act_panel.png`, `…_h722_panel.png` |
| R24b | headless, two cells south / south-west; at hour 0; three at hour 200; seed 11003 | **R37-B1**: 633/1288, 633/1291, 633/1264; three: two land 952, 364 boards at Sasebo t1412; 11003 633/1288 | `critic/c37_ashp_near_s2_2.json`, `…_near_sw2_2.json`, `…_near_s2_2_h0.json`, `…_near_s2_3_200.json`, `…_11003_near_s2_2.json` |
| R24b | 21 px below; 42 / 63 px east (the sea) | together (21 px: land 632); east of the coast refused "only sea there", kept | `critic/c37_lwt4_two_s21.json`, `critic/c37_lwt2_two_near42.json` |
| R24c (R36-N1) | Germany's division refused Paris, then clicked on its march's own goal | **fixed**: no notice | `critic/c37_sn_ger_samegoal.json`, `critic/shots/c37sn_ger_samegoal_b_march.png` |
| R24d (R36-N2) | the one aboard (four) clicked onto Fuzhou (real click) | **fixed**: reason 18, still aboard; headless the four land 1242–1243 | `critic/c37_lwt3_four_far_fuzhou.json`, `critic/shots/c37lwt3_four_far_fuzhou_act_panel.png`, `critic/c37_ash_far_fuzhou.json` |

## Run 36's cases re-run

| Run 36 case | On HEAD (`b0dd86f3`) | Evidence |
|---|---|---|
| R36-B1 (whole click 14 px off; walker refused) | **Fixed** | above |
| R36-B2 (the one aboard 14 px off, two and three) | **Fixed at one cell**; two cells south: R37-B1 | above |
| R36-N1 (refusal under a same-goal re-click) | **Fixed** | `critic/c37_sn_ger_samegoal.json` |
| R36-N2 (misleading reason for a near-miss) | **Fixed** for the one aboard (18); the walkers of a whole click get 6 (R37-N1) | `critic/c37_ashp_allnear_s2.json` |
| R36-N3 (a re-click of the same landing silent) | **Unchanged**, and now covers a click two cells off (no news at 14 px, `critic/c37_lwt2_two_near14.json`) | — |
| Run 36's fuzz note (divisions bound for weeks) | changed on 10709 by R24a: two divisions refused onto neutral coasts now keep their landing, board, and wait 45 days aboard for a third ordered ten days later from 48 days away (`critic/c37_fz2_10709_usa.json`; run 36: dropped at t962, never boarded, `critic/c36_fz_10709_usa.json`) — see R37-N2 | `critic/c37_fz_*.json` |
| ash same / same2 / same3_200 / extra / neutral / seaopen / all / all_h0 / far (Fuzhou, Tsingtao, Tsingtao 300) / none / 10501 ×3 / near se1, s2 (four), nw6 / enggerfour | identical landings to run 36 | `critic/c37_ash_*.json` |
| LWT four_same / sea / neutral / recall; LWP desk/phone; PST; SSB | identical | `critic/c37_lwt_*.json`, `critic/c37_lwp_*.json` |
| WAIT ×8; PM ×5; PS; LMCHK; LH; LH2 ×5; SWE | identical | `critic/c37_wait_*.json`, `critic/c37_pm_*.log`, `critic/c37_lh_3517.json` |
| LP ×5, NR ×4, SHM ten | identical | `critic/c37_lp_*.json`, `critic/c37_nr_*.json`, `critic/c37_shm_ten.json` |
| HO ten off / five on, headless 7019 × 20, def 8123, workerDeterminism 3517 | identical (save byte-identical; per-year rows differ only in frame p95 measured under load) | `critic/c37_ho_*.json`, `critic/c37_headless_7019.json` |
| HF, HFT, RGT, HS ×2, HT, HWP, DF, A ×2, Q ×2, K/K2/K3, Z ×2, C ×3, PHZ ×2, HI, DL, AN ×2, SB, PL, P, U, RG, BT, FW2, TR, SK ×2, W ×2 | identical, or differ only in samples on the page's clock (A notes order, DF sample day, FW2 shot names, AN 6299 end tick 167287 vs 167293, W/Z/C/SB view samples) | `critic/c37_*.json` |
| Checkers on run 36's seeds | 0 broken: diploInvariants 8123 h, 8431 r, 8807 w, 8573, 8999 h, 10601 h, 10663 r, 10709 w; worldInvariants 8123, 8431, 8807, 8233 h+navy, 9311 air, 8677 bankrupt, 10601 h+navy, 10663 r; heroWaits 8125 | `critic/c37_diploinv_*.log`, `critic/c37_wi_*.log` |
| R32-N2, R32-N3, R31-N1, R31-N6, no default in AI play, R32-N5 | **Unchanged** | `critic/c37_tr_phone.json`, `critic/c37_rgt_4111.json`, `critic/c37_hs_3739.json`, `critic/c37_def_8123.json` |

## Blocking issues

1. **R37-B1. The one aboard, clicked two cells off its landing, is taken off transports with room and sent to another
   port in silence; the landing splits for four weeks (R36-B2 unchanged one step further out).** What blocks is the
   silence, not the threshold: a division aboard its convoy is moved to another port's transports with no refusal, no
   row and no notice — the very thing run 36's fix for R36-B2 asked never to happen untold, and R24 did not add — and
   whether it happens turns on how many divisions share the convoy, not on what the player meant. Japan, the two nearest
   Tokyo sent to Shanghai by one real click, escort on; at hour 26 the one aboard (364) clicked 42 px straight below
   Shanghai's dot at the default place zoom (937 m/px, 20.9 px a cell; cell 1715,415; the tooltip still "China /
   Occupied by Japan"; no formation within the 14 px pick there, `critic/c37_cellprobe_1600.json`). No refusal, no row,
   no notice: the next hour its panel reads "Marching to Sasebo to board transports"
   (`critic/shots/c37lwt4_two_s42_act_panel.png`, the map with a second voyage line, `critic/shots/c37lwt4_two_s42_act.png`);
   365 lands alone at h632; at h722 364 is still marching (`critic/c37_lwt4_two_s42.json`,
   `critic/shots/c37lwt4_two_s42_h722_panel.png`). Headless the same order lands it 27 days after its partner (633 /
   1288, `critic/c37_ashp_near_s2_2.json`), the same one cell south-west of that (633 / 1291, `…_near_sw2_2.json`), at the
   first hour aboard (633 / 1264, `…_near_s2_2_h0.json`), on new seed 11003 (633 / 1288, `…_11003_near_s2_2.json`); with
   three, the other two land at h952 and 364 boards at Sasebo at h1412 (`…_near_s2_3_200.json`). Identical on run 36's
   commit (`critic/c37_wt_ash_near_s2_2.json`: 633 / 1288). With four divisions the same click is refused and kept
   (`critic/c37_ashp_allnear_s2.json`), so whether a near-miss splits the landing depends on whether other transports
   happen to be free: the same click on the same coast is "not done, kept" with four and "done, split for four weeks" with
   two. **Cause, read:** `sameLanding` compares the *landings* (`landingOf` of the click's cell against the
   convoy's water and land) within two cells; a click two cells south of Shanghai resolves to the landing
   853683/851635, land (1715,415), four cells from Shanghai's land (1715,411) (`critic/c37_lofp4_3517.log`), so a click
   that R24b's ROADMAP line promises is "the same landing" is not. That a landing is a (water, land) pair is the
   specified rule, and the two-cell threshold is R24b's decision; what is scored is the execution as the player reads
   it — a click two cells off, nothing on the screen to tell, the division leaves transports with room and is not told
   why, its panel naming a port at the far end of Japan. **Fix:**
   measure the near-miss from the click (the clicked cell within `SAME_LANDING_CELLS` of the convoy's land, same holder),
   not from the landing it resolves to; and never move a division aboard to another port's transports without a notice
   that says it leaves its landing. AT: the two to Shanghai, the one aboard re-clicked two cells south (1715.5, 415.5) at
   hour 26: both land within a day; red without (633 / 1288).

## Non-blocking issues (prioritised)

1. **R37-N1. The whole click re-clicked near its landing gets refusals that are false for the walkers.** All four
   re-clicked two cells south at hour 26: 364 is told reason 18 (true), the three walking are told "no transports of its
   nation with room for it are at a port it can reach" (6) — while each stays bound to Tokyo's convoy with room and lands
   with it (`critic/c37_ashp_allnear_s2.json`; the same for a walker alone, `critic/c37_ashp_bound_s2.json`). Four
   "not done" rows for an order that changed nothing.
2. **R37-N2. A landing already loaded waits for any later order to the same coast.** 10709, the USA played (fuzz):
   608 and 609 ordered to one coast at day 30 board at day 42–43; 615, ordered to the same target at day 40 from 48 days
   away, joins their convoy, and they sit aboard at the port 45 days until it arrives (`critic/c37_fz2_10709_usa.json`,
   trace). By the spec (a convoy for the same target takes a new division); the wait is shown in the panel. Since R24a,
   refused orders no longer free them, so only an order taken does. Run 36's seed and fuzz, traced here; on run 36's commit the same
   fuzz dropped 608/609 at t962 (`critic/c36_fz_10709_usa.json`).
3. **R37-N3. God's Breakthrough at peace does nothing and says nothing** (`critic/c37_k_11003.json`: Berlin → Warsaw,
   engaged 0 → 0, no ticker row; the same on 2203 in run 36).
4. **R37-N4. Relations graph labels collide** ("AustraliaUnited Kingdom", "French West Afri" cut by its neighbour,
   `critic/shots/c37rg_11213_desk_d0.png`).
5. **R36-N3** (silent re-click of the same landing), **R32-N2**, **R32-N3**, **R31-N1**, **R31-N6**, **no default in AI
   play**, **R32-N5** — unchanged.

## Design objections (none blocking, no score lowered)

- ADR-826/R22b, R23b, R24b: a landing is a (water, land) cell pair the player is never shown. R24b widens the match, but
  the player still clicks a cell and the game silently resolves it to a landing somewhere else; R37-B1 is the next case
  of the same class. A marker of the landing while choosing (left open by R24b's DECISIONS entry) would end it.
- On a phone, a tap on a city with a division of one's own in it (Shanghai, 5 px a cell) selects that division instead
  of ordering the selection there (`critic/c37_cellprobe_390.json`: the centre tap picks 388) — the specified pick
  (PLAN 7.163), but a sea landing on a held city is hard to give on a phone.
- Run 33–36's objections stand: an ally's coast refused as "a nation outside its wars"; the jump home across the sea;
  save format 2 refuses older scenarios.

## Ideas from other games (not scored)

- Hearts of Iron draws a naval invasion to a named beach region; a re-click anywhere in the region keeps the plan.
- Supreme Ruler and Europa Universalis show the destination flag of a move order while dragging; a landing flag on the
  coast as the cursor moves would show which landing a click means.

## Notes

- `c37_lwt4_two_sw42` (42 px left, 42 px down) is not a case: that pixel is within 14 px of Japan's division 389, so
  the click selected it (`critic/c37_cellprobe_1600.json`); the probe reports "together" for that reason. Likewise the
  phone variant `two_far_fuzhou_phone` / `two_phone`: the centre tap selects division 388 at Shanghai, so neither is a
  landing case.
- OS2's `newMagic` differs from run 36 only because the probe's renamed path points at a `c37_` copy of the scenario
  that does not exist; its outcome (the old file refused, `waitForURL` timeout) is run 36's.
- Worktree `critic/wt` at `41e88005` was used for one replay and removed (node_modules junction unlinked first).

## Strengths, verified

- **R24's four items each do what they say on the case they were written for, by real clicks in the page**:
  `critic/c37_lwt2_four_allnear14.json`, `critic/c37_lwt2_two_near14.json` (h632 together, run 36 split for 27 days),
  `critic/c37_sn_ger_samegoal.json`, `critic/shots/c37lwt3_four_far_fuzhou_act_panel.png` — and R24 left every AI world
  bit-identical (15 twenty-year worlds, a year-20 save, the default run).
- **The world is worth watching on fresh seeds**: four new 20-year worlds each with a different arc (the US taking
  Britain by 1956 on 11003; Japan leading the world at year 20 on 11149; 101 → 61 nations on 11213), 0 broken rules on
  eight checker runs over those seeds, and a ten-plus-year page watch at 59.9–60 fps.
