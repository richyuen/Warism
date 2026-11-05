# Critic report, run 38 (focused) — after R25

- **Mode: focused.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). All three conditions hold:
  (1) run 37 had a blocking issue (R37-B1) and naval under its bar; (2) every commit since run 37's commit
  `63942ae0` is a ROADMAP R25 item that `63942ae0` filed — `40c3981c` R25a, `23d023bb` R25b, `a54afc77` R25c;
  (3) runs 35, 36, 37 were focused, focused, **full** (each JSON's `mode`), so not all three focused.
  Rescored afresh: **naval** (under its bar, blocked on), and what R25's files touch (`git diff --stat b0dd86f3 HEAD`:
  `amphibious.ts`, `movement.ts`, `events.ts`, `protocol.ts`, `server.ts`, `orderNewsText.ts`, `en.json`) —
  **uiUxPolish** (a new notice and row), **diplomacyWarDepth** (the order rule) and **stability**. Every other score is
  **carried**, each backed by an identical re-run of run 37's case on this build.
- **Commit judged:** `a54afc77ca30701733e6245683371406cd6682bb` (HEAD at the start, `critic/c38_commit.txt`).
  **Date:** 2026-11-05.
- **Build:** `vite build --outDir critic/c38_dist`, exit 0 (`critic/c38_build.log`), served by `vite preview` on
  127.0.0.1:**5299**. Chromium through Playwright, headless; desk 1600 × 900, phone 390 × 844.
- **Runs:** run 37's 120 headless jobs + its 14 R24 edge jobs + its four hand-run jobs, and 23 new R25 attack jobs
  (`critic/scripts/c38_jobsQ.txt`, `c38_jobsP.txt`, `c38_jobsP2.txt` and `critic/scripts/c38_jobsR25.txt`; logs
  `critic/c38_jobsQ.log`, whose first 28 jobs are a discarded mis-named attempt of the R25 jobs, and
  `critic/c38_jobsR25.log`; every one exit 0); 12 new-seed jobs (fuzz and checkers on 12007–12503,
  `critic/scripts/c38_jobsNew.txt`); run 37's page suites A, B1, C1, L, N, N2, R, R2 and Q (Q alone on the machine,
  last); new page suites R3, R5 (R25's cases by real clicks, `critic/scripts/c38_suiteR3.sh`, `c38_suiteR5.sh`). New
  probe `critic/scripts/c38_lwt5.mjs` (run 37's `lwt4` plus a shot of the panel and the `order-news` rows at the first
  notice after the act and at the end); `c38_lwt3/4.mjs` now also read `order-news` rows (so `lwt3_four_far_fuzhou`'s
  `rows` differ from run 37 for that reason only). Summaries: `critic/scripts/c38_sumash.py`, `c38_sumlwt.py`,
  `c38_ident.py` (c38 vs c37 with timings and shot names stripped).
- **Baseline: R25 left every AI world alone.** All 15 twenty-year worlds of run 37's seeds identical
  (`critic/c38_ho_*.json`); the default run 8123 identical (`critic/c38_def_8123.json`); the year-20 save of 7019
  made on HEAD is byte-identical to run 37's (`cmp critic/c38_seed7019_y20.bin critic/c37_seed7019_y20.bin`);
  workerDeterminism on 3517 and 11071 as run 37, and on new seed 12007 the same end hash `39503469` on every arm
  (`critic/c38_wd_12007.log`). Of the c38 JSONs with a c37 twin, 151 are identical; the rest are R25's landing cases
  (below) or differ only in samples on the page's own clock — A notes, C/SB/W/Z view samples, DF samples, FW2 cases,
  HT boot time, AN shot names and one end tick (166754 vs 166753), the headless 7019 per-year timings — the same list
  run 37 gave. No page error in any page JSON.

## Verdict

**R37-B1 is fixed, and R25's three items do what their ATs say.** The one aboard, clicked 42 px straight below
Shanghai by a real click (cell 1715,415), now stays aboard ("Aboard at Tokyo, waiting…", no notice) and the two land
together at h632 (`critic/c38_lwt4_two_s42.json`, `critic/shots/c38lwt4_two_s42_act_panel.png`; run 37: marching to
Sasebo, partner alone h632, still marching h722). Headless, run 37's whole R37-B1 ladder lands together: 632/633 at two
cells south, south-west, at hour 0, on seed 11003, and the three at 951/952/952 (run 37: 633/1288, 633/1291, 633/1264,
633/1288, 364 at Sasebo h1412). The one sent to Fuzhou with other transports free is now told, in its panel and a row
(`critic/shots/c38lwt3_two_far_fuzhou_act_panel.png`); the whole click re-clicked two cells south draws no refusal
(R37-N1 fixed, `critic/c38_ashp_allnear_s2.json`, `critic/c38_lwt4_four_alls42.json`).

**One blocking issue, new in R25: the near-miss R25a now accepts is reported, when it lands, as a failed landing.**
The one aboard re-clicked two cells south lands with its partner, at the same landing, the same hour — and its panel
and a row say "its transports broke off; it came ashore away from its target" (R38-B1). With the whole click of four
re-clicked two cells south (R25c's own case), the same false failure is told at the landing for the walkers too. R25a
calls the click "that landing" and R25c promises the walkers "are told nothing"; the game then tells the player the
landing went wrong. **Naval stays at 7, under its bar of 8,** for R38-B1. Every other dimension holds at its bar.

## Scores

| Dimension | Run 37 | Run 38 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | **carried.** Run 37's cases identical on this build: HF 5521 desk/phone and 7019, SK 1212/8123/11149, HS 3517/3739, HT phone (boot time only), Z 3517/8123/11003 (view samples only) (`critic/c38_hf_5521_desk_d0_0.json`, `critic/c38_sk_1212.json`, `critic/c38_z_11003.json`). Run 37's reasons stand (hero counters over Europe, R31-N1/N2; the 250 m/px label pile) |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | **rescored** (R25 changes the order rule). The rule "an order to the landing it already has changes nothing and is not refused" now holds two cells off: the four re-clicked two cells south or west are taken with no refusal and land 1242–1243 (`critic/c38_ashp_allnear_s2.json`, `critic/c38_r25_allnear_w2.json`; run 37: four refusals, three false); a walker re-clicked onto open sea or Calais is still refused and kept (`critic/c38_ash_bound_sea.json`, `critic/c38_ash_bound_neutral.json`, identical to run 37). Checkers on **new seeds**: diploInvariants 0 broken on 12007 (heroes), 12101 (random diplomacy), 12203 (random world) (`critic/c38_diploinv_12007s_h.log`, `…_12101r.log`, `…_12203w.log`); worldInvariants 0 broken on 12007 heroes+navy 20 y and 12101 random diplomacy 10 y (`critic/c38_wi_12007_h20_hn.log`, `critic/c38_wi_12101r_10.log`); run 37's 13 diplo/world checker runs and heroWaits 8125 0 broken again (`critic/c38_diploinv_*.log`, `critic/c38_wi_*.log`). Relations graph RG 4111/11213 identical. **Not 8:** run 30's list (bond exit, guarantees, a refused peace untold) untouched; R38-B1 is an order told as failed when it was not |
| Emergent world dynamics over long runs | 7 | 7 | **carried.** All 15 twenty-year worlds of run 37's seeds and its four new 20-year seeds identical (`critic/c38_ho_*.json`, `critic/c38_ho_new_*.json`); default 8123 identical. Run 37's reasons stand |
| God Mode | 7 | 7 | **carried.** A 4219/8999/11213 (notes order only), Q 6421/8807/11287, K/K2/K3 2203, K 11003 identical or page-clock only (`critic/c38_a_11213.json`, `critic/c38_q_11287.json`, `critic/c38_k_11003.json`). R37-N3 (Breakthrough at peace silent) unchanged |
| Editor and scenarios | 7 | 7 | **carried.** G 4877 run alone (suite Q): placing, pending text, cancel and load identical to run 37, and the same stop at its day-120 wait (`critic/c38_g_4877.json`); OS2 as run 37 (`critic/c38_os2_c25.json`) |
| Stats and history | 7 | 7 | **carried.** HI and DL on 7019 year 20 and 11003 year 18 identical (`critic/c38_hi_11003.json`, `critic/c38_dl_11003.json`); SHM ten identical (no History row for a jump home, unchanged) |
| UI/UX and polish | 7 | 7 | **rescored** (R25 adds a notice and a row). R37-N1 fixed (no false refusals for the walkers, above). R25b's notice reads in the panel over "Marching to Sasebo to board transports" and as an `order-news` row (`critic/shots/c38lwt3_two_far_fuzhou_act_panel.png`, `critic/c38_lwt3_two_far_fuzhou.json`). Run 37's panel cases identical (LWP desk/phone, SN ger3/samegoal, LWT ×4, NR ×4). **Not 8:** R38-B1 — a false "its transports broke off" on a landing that went as ordered (`critic/shots/c38lwt5_two_s42_notice_h632_panel.png`); ticker rows still cut mid-word ("Square infantry division 364: its transports broke…", `critic/shots/c38lwt5_four_alls42_end.png`, R32-N3); the relations graph's label collisions (R37-N4) unchanged |
| Performance | 7 | 7 | **carried.** Suite Q alone on the machine at the end, within run 37's spread: PF 7019 60 fps at 3,000–600 m/px, 36.7–42.2 at 120 and 39.1–49.8 at 30, p95 ≤ 18.5 ms (run 37: 36.2–37.9, 38.2–50.7, ≤ 18.4); ten-year watches 59.8–60 fps, longest gap 83 ms, as run 37 (`critic/c38_pf_7019.json`, `critic/c38_lw_6151.json`, `critic/c38_lwhon_3517.json`). Nothing in R25 touches drawing or the tick's AI path (AI worlds bit-identical) |
| Stability | 7 | 7 | **rescored.** No page error in any page JSON of this run; 134 of run 37's headless jobs, 28 R25 attack jobs (`critic/c38_jobsR25.log`; a first attempt of these wrote nowhere through a script slip and is discarded) and 12 new-seed jobs, every one exit 0; determinism as above (byte-identical save, `39503469` on every arm of new seed 12007); sea orders fuzzed on six new seeds × 120 days, nothing stranded (`critic/c38_fz_12*.json`, `strandedN: 0`). R37-B1's split landing is gone. **Not 8:** a landing order can still tell the player something false about what happened to it (R38-B1: a failed landing reported for one that went as ordered) |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **carried.** Z 3517/8123/11003 and PHZ 2671/8233/11071 identical but view samples (`critic/c38_z_11003.json`, `critic/c38_phz_11071.json`) |
| Naval warfare (needs 8) | 7 | **7** | **rescored.** R37-B1 fixed by real click and headless (Verdict; `critic/c38_lwt4_two_s42.json`, `critic/c38_ashp_near_s2_2.json` 632/633, `critic/c38_ashp_near_sw2_2.json` 632/633, `critic/c38_ashp_near_s2_2_h0.json`, `critic/c38_ashp_11003_near_s2_2.json`, `critic/c38_ashp_near_s2_3_200.json` 951/952/952). R25 ladder headless, the one aboard re-clicked: n2, n3, nw2, w2, w3, w4 kept and land together (`critic/c38_r25_near_*_2.json`); s3–s6 are sea, refused 17 and kept; s8 (China-held, 8 cells) → LeftLanding told, the partner lands alone as ordered (`critic/c38_r25_near_s8_2.json`); new seed 12007: Fuzhou → told (`critic/c38_r25_12007_far_fuzhou_2.json`). Navy rules 0 broken 20 years on new seed 12007 (`critic/c38_wi_12007_h20_hn.log`); sea battle SB 7019 and planes PL identical. **Not 8: R38-B1 (blocking)** |
| Tanks (needs 8) | 8 | 8 | **carried.** C 6421/7019/8573/11071/11287 identical but view samples (`critic/c38_c_11071.json`) |
| Aircraft (needs 8) | 8 | 8 | **carried.** W 7019/8431/11149 identical but view samples (`critic/c38_w_11149.json`); air rules 9311 0 broken again (`critic/c38_wi_9311r_h20_air.log`) |
| AI nuclear use (needs 8) | 8 | 8 | **carried.** AN 7019 y20, 6299 y18, 11003 y18 the same strikes as run 37 (shot names and one end tick only; `critic/c38_an_11003y18.json`) |

## R25, case by case

| Item | Case | Result | Evidence |
|---|---|---|---|
| R25a (R37-B1) | the two; the one aboard clicked 42 px below Shanghai (real click, cell 1715,415, tooltip "China / Occupied by Japan") | **fixed**: stays aboard, no notice; both land h632 | `critic/c38_lwt4_two_s42.json`, `critic/shots/c38lwt4_two_s42_act_panel.png` |
| R25a | headless: two cells S, SW, at hour 0, seed 11003; three at hour 200 | **fixed**: 632/633 ×4; 951/952/952 (run 37: 633/1288, 633/1291, 633/1264, 633/1288; 364 at Sasebo h1412) | `critic/c38_ashp_near_s2_2.json`, `…_sw2_2.json`, `…_s2_2_h0.json`, `…_11003_near_s2_2.json`, `…_s2_3_200.json` |
| R25a | new: two cells N / NW / W, three and four cells W, three cells N | kept, land 632/633 | `critic/c38_r25_near_{n2,nw2,w2,w3,w4,n3}_2.json` |
| R25a | new, real clicks: 21 px S, 14 px E, 42 px W | together, no notice | `critic/c38_lwt4_two_s21.json`, `critic/c38_lwt5_two_e14.json`, `critic/c38_lwt5_two_w42.json` |
| R25a | new, real clicks 63 / 105 px S (the sea) | refused "only sea there", kept, land together | `critic/c38_lwt4_two_s63.json`, `critic/c38_lwt4_two_s105.json` |
| R25a | **the landing after the act**: 42 px S, two and four | **R38-B1**: both/all land together h632 / h1241–1244, and are told "its transports broke off; it came ashore away from its target" | `critic/c38_lwt5_two_s42.json`, `critic/shots/c38lwt5_two_s42_notice_h632.png`, `…_notice_h632_panel.png`, `critic/c38_lwt5_four_alls42.json`, `critic/shots/c38lwt5_four_alls42_notice_h1241_panel.png`, `critic/shots/c38lwt5_four_alls42_end.png` |
| R25b | the two; the one aboard clicked onto Fuzhou (real click), other transports free | **done**: panel notice "its transports are loading for another landing; it left them for other transports and will not land with the rest." over "Marching to Sasebo to board transports", and an `order-news` row | `critic/c38_lwt3_two_far_fuzhou.json`, `critic/shots/c38lwt3_two_far_fuzhou_act_panel.png` |
| R25b | headless: Fuzhou (3517, 12007), 8 cells S onto China-held land | LeftLanding emitted at the order's hour | `critic/c38_ashp_far_fuzhou_2.json`, `critic/c38_r25_12007_far_fuzhou_2.json`, `critic/c38_r25_near_s8_2.json` |
| R25c (R37-N1) | all four re-clicked two cells S (headless, and by real click 42 px S), two cells W; seed 11003 | **fixed** at the order: no refusal, all land 1242–1244 | `critic/c38_ashp_allnear_s2.json`, `critic/c38_lwt4_four_alls42.json`, `critic/c38_r25_allnear_w2.json`, `critic/c38_r25_11003_allnear_s2.json` |
| R25c | a walker re-clicked onto the sea three / five cells S | refused 17 (true: sea), kept, lands with the rest | `critic/c38_r25_bound_s3.json`, `critic/c38_r25_bound_s5.json` |

## Run 37's cases re-run

| Run 37 case | On HEAD (`a54afc77`) | Evidence |
|---|---|---|
| R37-B1 (the one aboard two cells off) | **Fixed** (above); the landing then told as failed: R38-B1 | above |
| R37-N1 (false refusals for the walkers) | **Fixed** | `critic/c38_ashp_allnear_s2.json` (run 37: four MoveRejected; now none) |
| R37-N2 (a loaded landing waits for a later order to the same coast) | **Unchanged** on 10709 (`critic/c38_fz_10709_usa.json` identical); seen again on **new seed** 12203, the USA played: 608 aboard 889 h at the end, 616 bound 1,185 h (`critic/c38_fz_12203_usa.json`, `worstAboardStill`, `worstBound`) | — |
| R37-N3 (Breakthrough at peace silent) | **Unchanged** | `critic/c38_k_11003.json` |
| R37-N4 (relations graph labels) | **Unchanged** | `critic/c38_rg_11213_desk.json` identical |
| ash ×31, ashp ×14, ash_bound_sea/neutral, wait ×8, pm ×5, ps, lmchk, lh, lh2 ×4, swe, fz ×10 | identical, except R25's own cases: four-division near clicks lose their refusal 18 (`ash_near_s2`, `ash_near_se1`), the near-miss landings now together (`ashp_near_s2_2`, `…_sw2_2`, `…_s2_2_h0`, `…_11003_near_s2_2`, `…_s2_3_200`), Fuzhou with two adds LeftLanding (`ash_far_fuzhou_2`, `ashp_far_fuzhou_2`) | `critic/c38_ash*.json`, `critic/c38_wait_*.json`, `critic/c38_pm_*.log`, `critic/c38_fz_1*.json` |
| LWT ×4, LWT2 ×7, LWT3 four Fuzhou, LWP ×2, SN ×2, SSB, PST, LP ×5, NR ×4, SHM ten | identical (LWT3 four: `rows` only, the probe now reads `order-news` too) | `critic/c38_lwt*_*.json`, `critic/c38_lp_*.json`, `critic/c38_nr_*.json` |
| LWT2 two_far_fuzhou_phone | exit 1 as in run 37 — not a case (the centre tap selects division 388 at Shanghai) | `critic/c38_suiteR2.out` |
| HO ten off / five on, the four new 20-year seeds, def 8123, headless 7019 × 20, workerDeterminism 3517 / 11071 | identical (save byte-identical; per-year rows differ only in wall/tick timings) | `critic/c38_ho_*.json`, `critic/c38_headless_7019.json` |
| HF, HFT, RGT, HS ×2, HT, HWP, DF, A ×3, Q ×3, K/K2/K3, K 11003, Z ×3, C ×5, PHZ ×3, HI ×2, DL ×2, AN ×3, SB, PL ×2, P, U, RG ×2, BT, FW2, TR, SK ×3, W ×3, OS2 | identical, or differ only in samples on the page's clock (as run 37 listed) | `critic/c38_*.json` |
| Q, alone on the machine: PF 7019 y20, LW 6151 ten years, LWHON 3517 ten years, G 4877 | PF fps (min–max, worst p95) by m/px — 3,000: 60–60.1, 18.1 ms; 1,200: 58.8–60.1; 600: 60–60.2; **120: 36.7–42.2** (run 37 36.2–37.9); **30: 39.1–49.8** (run 37 38.2–50.7); p95 ≤ 18.5 ms (run 37 ≤ 18.4). LW 6151: 59.9–60 fps every year (one 63.4 sample), longest gap 83 ms, 289.5 s (run 37 59.9–60, 83 ms, 291.8 s). LWHON 3517: 59.8–60, 83 ms, 297.4 s (run 37 59.8–60, 83 ms, 298.4 s). G 4877: `placed`, `pendingText`, `afterCancelPending: 0`, `loaded` identical; it again stops at its 900 s wait for day 120, as in run 37 (probe, not a page error; `errors: []`) — performance and editor stay carried | `critic/c38_pf_7019.json`, `critic/c38_lw_6151.json`, `critic/c38_lwhon_3517.json`, `critic/c38_g_4877.json`, `critic/c38_suiteQ.out` |
| Checkers on run 37's seeds | 0 broken: diploInvariants 8123 h, 8431 r, 8807 w, 8573, 8999 h, 10601 h, 10663 r, 10709 w, 11003 h, 11071 r, 11149 w, 11213; worldInvariants 8123, 8431, 8807, 8233 h+navy, 9311 air, 8677 bankrupt, 10601 h+navy, 10663 r, 11003 h+navy, 11071 r, 11149 w, 11287 air; heroWaits 8125 and 11003 | `critic/c38_diploinv_*.log`, `critic/c38_wi_*.log`, `critic/c38_herowaits_*.log` |
| R32-N2, R32-N3, R31-N1, R31-N6, no default in AI play, R32-N5, R36-N3 | **Unchanged** | `critic/c38_tr_phone.json`, `critic/c38_def_8123.json` |

## Blocking issues

1. **R38-B1. A near re-click that R25a keeps as the same landing is told, when it lands, as a failed landing:
   "its transports broke off; it came ashore away from its target."** Japan, the two nearest Tokyo sent to Shanghai by
   one real click, escort on; at hour 26 the one aboard (364) clicked 42 px straight below Shanghai's dot (run 37's
   R37-B1 click, cell 1715,415). The order is taken in silence and 364 stays aboard — R25a working — and both land
   together at h632 on the landing's land (1715.5, 411.5). At that hour 364's panel and an `order-news` row say its
   transports broke off and it came ashore away from its target (`critic/c38_lwt5_two_s42.json`,
   `critic/shots/c38lwt5_two_s42_notice_h632.png`, `critic/shots/c38lwt5_two_s42_notice_h632_panel.png`; the same in
   `critic/c38_lwt4_two_s42.json`'s trace). Nothing broke off: its partner, ordered to Shanghai itself, lands beside it
   and is told nothing. With the whole click of four re-clicked 42 px south (R25c's case), all four land h1241–1244
   and the false failure is told for 364 and again for 367, a walker R25c says is "told nothing"
   (`critic/c38_lwt5_four_alls42.json`, `critic/shots/c38lwt5_four_alls42_notice_h1241_panel.png`,
   `critic/shots/c38lwt5_four_alls42_end.png`). Clicks 21 px south, 14 px east and 42 px west land with no notice
   (`critic/c38_lwt4_two_s21.json`, `critic/c38_lwt5_two_e14.json`, `critic/c38_lwt5_two_w42.json`), and run 37's
   one-cell cases had none (`critic/c37_lwt2_two_near14.json`, `critic/c37_lwt4_two_s21.json`): this is new in R25.
   **Cause, read:** the worker's `orderNews` (`src/worker/server.ts`) keeps the *new click* as the order's target and
   tells `landedAway` when the landing is more than `AT_PORT_CELLS` (3) from it; R25a accepts a click within
   `SAME_LANDING_CELLS` (2) of the goal, and Shanghai's landing land lies two cells north of Shanghai, so a click two
   cells south is four cells from where the landing is made. Unlike R37-N1 (a "not done" for an order that changed nothing, non-blocking), this
   reports an *event that did not happen* about a landing that went exactly as ordered: the game's own account of the
   world is false, against the goal "rules that agree", and it ships inside the fix for R37-B1. Blocking also because it
   contradicts the claimed features it
   ships with (R25a: the click "is that landing"; R25c: the walkers "are told nothing") and tells the player a landing
   failed when it went as ordered — the game disagreeing with itself. **Fix:** when an order is kept as the same
   landing (`sameLanding`), keep the order's target the landing it already had (or measure "landed away" from that
   landing's land), so the news is judged against what the division is doing. AT: the two to Shanghai, the one aboard
   re-clicked two cells south (1715.5, 415.5) at hour 26: both land within a day and no `landedAway` is told for
   either; red without (364 told at h632). And the four, all re-clicked there: no news at the landing.

## Non-blocking issues (prioritised)

1. **R38-N1. R25b's notice reads backwards.** "Its transports are loading for another landing; it left them for other
   transports…" — the transports are loading for *its* landing; it is the division that goes to another
   (`critic/shots/c38lwt3_two_far_fuzhou_act_panel.png`). And what follows is long: 364 is still marching to Sasebo 30
   days later (`critic/c38_lwt3_two_far_fuzhou_long.json`, final `toPort Sasebo` at h722), with no word of how far.
2. **R37-N2** (a loaded landing waits for any later order to the same coast) — unchanged, and met on a new seed
   (12203: 37 days aboard, `critic/c38_fz_12203_usa.json`).
3. **R37-N3** Breakthrough at peace silent; **R37-N4** relations graph labels collide — unchanged.
4. **R36-N3**, **R32-N2**, **R32-N3** (rows cut, here "…its transports broke…", `critic/shots/c38lwt5_four_alls42_end.png`),
   **R31-N1**, **R31-N6**, **no default in AI play**, **R32-N5** — unchanged.

## Design objections (none blocking, no score lowered)

- A landing is still a (water, land) pair the player never sees. R25a widens "the same landing" around the clicked
  goal, and R38-B1 shows the next seam: the goal, the landing's land and the click are three different cells, and each
  rule measures from a different one. Showing the landing while choosing (left open by R24b's DECISIONS entry) would
  give the player, and the rules, one cell to agree on.
- Run 33–37's objections stand: an ally's coast refused as "a nation outside its wars"; the jump home across the sea;
  save format 2 refuses older scenarios; a phone tap on a held city selects one's own division there.

## Ideas from other games (not scored)

- Hearts of Iron reports a naval invasion's outcome once, for the operation, not per division; a single "landing at
  Shanghai: made" line would replace per-division news for a landing that went as ordered.
- Supreme Ruler shows the order's destination flag while dragging; a landing flag on the coast would show which landing
  a click means.

## Notes

- The ENG/FRA and ENG/GER near-click jobs (`critic/c38_r25_eng*.json`) are not cases: England is not at war with France
  or Germany on 3517, so both divisions were refused (15/16) before boarding and the act never ran.
- `critic/c38_lwt3_two_far_fuzhou_ph2.json` (phone) is not a case for the reason run 37 gave (the tap selects 388).
- Suite R4's `lwt5` cases failed at a syntax error in the new probe (`critic/c38_suiteR4.log`); it was fixed and the
  cases re-run as suite R5 (`critic/c38_suiteR5.log`).
- This is a focused run; a clean focused run must be followed by a full one before a release.
