# Critic report, run 35 (focused) — after R22

- **Mode: focused.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). (1) Run 34 has a blocking issue
  (R34-B1) and a score under its bar (naval 7, bar 8). (2) Every commit since run 34's commit `2535a577` is either the
  report's own commit `36c06b93` (`PROGRESS.md`, `ROADMAP.md`, `critic/` only), `a3e76107` ("R22 ticked", `ROADMAP.md`
  only), or names R22, the item `36c06b93` filed (`git show 36c06b93 -- ROADMAP.md` adds R22 and R22a–e). Caveat, read
  and decided: the builder restated R22's sub-items (filed R22b split into R22b/c/d; filed R22c–e renumbered R22e–g), so
  the subjects "R22f" and "R22g" name labels `36c06b93` did not write; each carries the run-34 id it answers (R34-N3,
  R34-N4), names R22, and is work R22 filed. Read as the item R22, not as new work. (3) Runs 32, 33, 34 were full, full,
  focused. So: every named case of run 34 re-run; scored afresh are naval (blocked on, under its bar) and the dimensions
  the changed files touch (`git diff --stat 2535a577 HEAD -- src data public`: `amphibious.ts`, `sail.ts`, `movement.ts`,
  `events.ts`, `server.ts`, `protocol.ts`, `FormationPanel.tsx`, `App.tsx`, `orderNewsText.ts`, `style.css`, `en.json`):
  naval, diplomacyWarDepth (`movement.ts`: the order rules and a new reason), uiUxPolish (panel, notice, CSS), stability
  (worker, protocol), performance (three sim systems changed, as run 34 rescored it on the same grounds). Every other
  score is carried, its cases re-run.
- **Commit judged:** `a3e76107e8e7f03d6e2161d3f2bd733428f20580` (HEAD at the start, `critic/c35_commit.txt`). **Date:** 2026-11-05.
- **Build:** `vite build --outDir critic/c35_dist`, exit 0 (`critic/c35_build.log`), served by `vite preview` on
  127.0.0.1:**5299**. Chromium through Playwright, headless; desk 1600 × 900, phone 390 × 844.
- **Baseline.** Every R22 commit says "pin unmoved". **Verified:** all 15 headless 20-year runs of run 34's seeds (ten
  heroes off, five on; `critic/scripts/c31_ho.ts`) are identical to run 34's JSON with timings stripped
  (`critic/scripts/c35_ident.py`, `critic/c35_ho_*.json`); the year-20 save of 7019 made on HEAD is byte-identical to run
  34's (`cmp critic/c35_seed7019_y20.bin critic/c34_seed7019_y20.bin`); `def` 8123 × 20 years identical; workerDeterminism
  3517 `7e113d94` on every arm, as in run 34 (`critic/c35_wd_3517.log`). So every seeded world without a player's sea order
  is run 34's world, and run 34's page cases compare one to one. Where a player's sea order is in the case, the world
  differs, as R22 means it to (LH 3517 below).
- **Runs:** 51 headless re-run jobs (`critic/scripts/c35_jobsA.txt`, `critic/c35_jobsA.log`), 11 fresh-seed fuzz and
  checker jobs (`critic/scripts/c35_jobs4n.txt`, `critic/c35_jobs4n.log`), page suites L, A, B, C
  (`critic/scripts/c35_suite{L,A,B,C}.sh`) and run 34's port, news and wait probes. New probes: `c35_ash.ts` (an order to a
  division aboard a convoy still at its port: the same landing again, a neutral coast, open sea, every division of the
  click again, a fresh division), `c35_lwt_landwait.mjs` (the wait in the page by real clicks: Landing row, a real-click
  act on the one aboard), `c35_ssb_stranded.mjs` (evidence panels), `c35_lwp_phonepanel.mjs` (R22e's columns, desk and
  phone), `c35_sn_stale.mjs` (R22f: refusal notice under a later order), `c35_osq.sh` (R22g: six sea clicks), and two
  replays on run 34's commit in a worktree (`critic/wt`, removed).

## Verdict

**R22 fixes what run 34 named, case by case:** a refusal at a bombed port is told in the page (R34-B1: Portsmouth, "its
port is bombed shut" for 270 and 271 at ticks 61 and 85, row and panel); the waiting division's panel counts the landing
and its days, right to the day (R34-N1, R22c: "1 of 4 aboard; the last 47 days from the port" at hour 4, the last aboard
at hour 1121); the four escorts reach Shanghai's water at hour 1121, not hour 24, and the landing is not later (R22d);
the aboard status keeps to its column on desk and phone (R34-N2); a click on open water says so (R34-N4); a recall of the
one aboard is obeyed and the other three land together (R22b).

**Two blocking issues, both from R22b's new rule** — `ashoreAtPort` takes the division off its transports *before* the
new order is judged, and gives its convoy up:

- **R35-B1.** The same landing clicked again for the division waiting aboard (the most natural "go on, then" a player
  gives) takes it ashore, rebinds it to the transports another division of the click was walking to, and that one, when it
  reaches Tokyo, has no room: it stands "Waiting at Tokyo for transports" for **36 days** (hour 512 to 1367) while the
  other three sail at 1121 and land at 1244; it sails alone afterwards, told nothing. The panel of the first meanwhile
  says "2 of 4 aboard; the last a day from the port" with the fourth standing on the quay. On run 34's commit the same
  click was refused (`Aboard`) and all four landed together at 1242–1243.
- **R35-B2.** A refused order still takes the division off its transports: a click on France's Calais (peace) or on open
  water with the waiting division selected is refused ("not done: …"), yet the division is now ashore at Tokyo,
  "Holding", out of the landing it was in — the notice says nothing was done; the worker's own rule says a refused order
  leaves the one before it standing, and SPEC says the order (the new one) stands.

**Naval stays at 7**: R34-B1 and three of run 34's four naval notes are fixed, but the way out R22b opened leaves the
landing in a state the player is told wrongly about, twice. uiUxPolish stays 7: R22f clears a refusal only when the
formation's state changes, so a refusal given while marching stays in the panel under the next, accepted march
(R35-N1).

## Scores

| Dimension | Run 34 | Run 35 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | carried (no map file changed). Run 34's cases re-run: SK 1212 and 8123 identical but for view samples on the page's clock, HF 5521 desk and phone, HF 7019 d730 identical (`critic/c35_sk_1212.json`, `critic/c35_hf_5521_desk_d0_0.json`). R31-N1 unchanged |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | rescored (`movement.ts`): the order rules agree after a peace as in run 34 (PM Japan → Shanghai / Java, Germany → Reims identical, `critic/c35_pm_jap_sea.log`, `critic/c35_pm_gerfra_land.log`); the new `OpenSea` reason is given only off the water (six real clicks, below; LH2 Bergen `17` where run 34 had `3`, `critic/c35_lh2_eng_bergen.log`). Checkers on new seeds: diploInvariants 0 broken on 10037 (heroes), 10111 (random diplomacy), 10193 (random world) (`critic/c35_diploinv_10037s_h.log`, `..._10111r.log`, `..._10193w.log`); worldInvariants 0 broken on 10037 heroes+navy × 20 y and 10111 random × 10 y (`critic/c35_wi_10037_h20_hn.log`, `critic/c35_wi_10111r_10.log`); run 34's seeds 0 broken (below). Not 8: run 30's list (bond exit, guarantees, refused peace untold) untouched; R35-B2 is an order rule that no longer agrees with the refusal rule |
| Emergent world dynamics over long runs | 7 | 7 | carried: the world is run 34's (15 of 15 `ho` runs identical, the year-20 save byte-identical) |
| God Mode | 7 | 7 | carried: A 4219 and 8999, Q 6421 and 8807, K/K2/K3 2203 identical but for the title screen's random seed and page-clock samples (`critic/c35_a_4219.json`, `critic/c35_q_8807.json`, `critic/c35_k_2203.json`) |
| Editor and scenarios | 7 | 7 | carried: G 4877 completes its marks (run 34 timed out at 900 s on the page's wall clock; the marks agree, `critic/c35_g_4877.json`); OS2 refuses run 25's scenario as before (`critic/c35_os2_c25.json`) |
| Stats and history | 7 | 7 | carried (no stats or history file changed): HI and DL on 7019's year-20 save identical to run 34 (`critic/c35_hi_7019.json`, `critic/c35_dl_7019.json`); SHM ten sent home, one record, identical (`critic/c35_shm_ten.json`) |
| UI/UX and polish | 7 | 7 | rescored: R34-N2 fixed (Status and Landing label 10 px clear of a two-line value at 1600 × 900, one line at 390 × 844; `critic/shots/c35lwp_desk_h4_panel.png`, `critic/c35_lwp_phone.json`); R34-N3's case fixed (the recall is obeyed, so no refusal under "At sea"); the Landing row is clear and right to the day (`critic/c35_lwt_four_same.json`: 47 days said at hour 4, the last aboard at hour 1121). Not 8: R35-N1 (a refusal stays under the next accepted march, `critic/shots/c35sn_ger3_b_march.png`); R35-B1/B2 put the panel in contradiction with the world (the Landing row counts a division that is left behind; "not done" after the division was unloaded); rows still cut at 272 px (R32-N3, `critic/c35_shm_ten.json`) |
| Performance | 7 | 7 | rescored (three sim systems changed): quiet ten-year watch of 6151 with nothing else running, 59.8–60 fps every year, longest gap 83 ms, 291.5 s for ten years, no page error (run 34: 59.8–60, 83 ms, 292.6 s; `critic/c35_lw_6151.json`, `critic/c34_lw_6151.json`); PF on 7019's year-20 save run quiet: 60 fps at 3,000, 1,200 and 600 m/px, 37–48.5 fps at 120 and 30 m/px, p95 frame ≤ 18.4 ms (run 34: 35–47, ≤ 18.3; `critic/c35_pfq_7019.json`, `critic/c34_pf_7019.json`). Under load (five sims and three browsers beside it) LW 3517 with heroes held 59.9–60 fps, longest gap 83 ms (`critic/c35_lwhon_3517.json`); the headless 20-year 7019 run identical in every figure but timings (year 1 at 3.94 ms a tick under load, run 34 3.76, `critic/c35_headless_7019.json`). Not 8: no phone-class device measured |
| Stability | 7 | 7 | rescored: R34-B1's worker drop fixed (`critic/c35_pst.json`: both refusals posted); no page error in any probe (suites L, A, B, C and every new probe: `errors: []`); 62 headless jobs, none crashed; determinism above. Not 8: R35-B1 leaves a division bound to a convoy that has sailed without it for 36 days (`critic/c35_ash_same.json`: `convoyPort` keeps 1144 → port 33 from hour 1121 to 1366 while 1144 is at sea); the one-hour "aboard a dead group" on fuzz seed 10331 is the same on run 34's commit (`critic/c35_fz_10331_eng.log`, `critic/c35_wt_fz_10331_eng.log`), so it moves nothing |
| Semantic zoom to unit level (needs 8) | 8 | 8 | carried: Z 3517 and 8123, PHZ 2671 and 8233 identical but for element counts sampled on the page's clock (`critic/c35_z_3517.json`, `critic/c35_phz_8233.json`) |
| Naval warfare (needs 8) | 7 | **7** | rescored: R34-B1, R34-N2, R34-N4 fixed; R34-N1 answered (way out, account, escort timing) and R34-N3's case gone (cases below); navy rules 0 broken over 20 years on new seed 10037 (`critic/c35_wi_10037_h20_hn.log`); the player's sea orders fuzzed on six new seeds × 120 days: nothing stranded that run 34's commit does not strand too (`critic/c35_fz_*.json`). **Not 8: R35-B1 and R35-B2 (blocking), both in R22b's own rule** |
| Tanks (needs 8) | 8 | 8 | carried: C 6421, 7019, 8573 identical but for sortie/view counts sampled on the page's clock (`critic/c35_c_8573.json`) |
| Aircraft (needs 8) | 8 | 8 | carried: W 7019 and 8431, the fighter followed, samples on the page's clock (`critic/c35_w_7019.json`, `critic/c35_w_8431.json`) |
| AI nuclear use (needs 8) | 8 | 8 | carried: AN 7019 year 20 and AN 6299 year 18 the same strikes, alerted (`critic/c35_an_7019y20.json`, `critic/c35_an_6299y18c32.json`) |

## R22, case by case

| Item | Case | Result | Evidence |
|---|---|---|---|
| R22a (R34-B1) | Britain at war with France, the three nearest London to Calais by a real click, listener on the worker | **told**: `orderNews` refused 16 for 270 (tick 61) and 271 (tick 85); rows and panels "not done: its port is bombed shut."; 274 lands (run 34: nothing told in 110 hours) | `critic/c35_pst.json`, `critic/shots/c35pst_div270.png` |
| R22a | the same in run 34's LP case (Calais at war) | the notice now reads "its port is bombed shut" | `critic/c35_lp_eng_calais_war.json` |
| R22b (R34-N1) | four to Shanghai, a real click on Japan by the port at hour 302 with the one aboard selected | obeyed: "On the march", ashore at Tokyo; the other three land at hour 1244 (as without the recall) | `critic/c35_lwt_four_recall.json`, `critic/shots/c35lwt_four_recall_act_panel.png` |
| R22b | the one aboard clicked to Shanghai again at hour 26 (real click) | **R35-B1**: 365 left at the quay h512–h1367, the others land h1244 | `critic/c35_lwt_four_same.json`, `critic/c35_ssb.json`, `critic/shots/c35ssb_h1250_tokyo.png` |
| R22b | the one aboard clicked onto Calais (France at peace) or open water at hour 26 (real clicks) | **R35-B2**: refused 15 / 17, and ashore at Tokyo, out of the landing | `critic/c35_lwt_four_neutral.json`, `critic/c35_lwt_four_sea.json`, `critic/shots/c35lwt_four_sea_act_panel.png` |
| R22b | the same re-order with two or three divisions (headless) | no harm: the transports had room; land together (h633; h952) | `critic/c35_ash_same2.json`, `critic/c35_ash_same3_200.json` |
| R22c | the Landing row, four to Shanghai | "1 of 4 aboard; the last 47 days from the port" at hour 4, counting down a day a day; the last aboard at 1121 (46.6 days); desk and phone | `critic/c35_lwt_four_same.json` (trace), `critic/shots/c35lwp_desk_h4_panel.png`, `critic/shots/c35lwp_phone_h4_panel.png` |
| R22d | four to Shanghai, headless | escorts 1146, 1148, 1149, 1155 reach Shanghai's water at t1121 (run 34: t24–t51); landed t1242–1243 on both commits | `critic/c35_wait_four120.json`, `critic/c34_wait_four120.json` |
| R22d | one division to Belfast (LH 3517) | lands at hour 73; run 34's commit 59: the transports now wait 14 hours for their escort | `critic/c35_lh_3517.json`, `critic/c34_lh_3517.json` |
| R22d | Japan → Java (PM, landed arm) | the two land at t916–917; run 34's commit: both thrown back the same hours (the escort no longer stood weeks at the landing) | `critic/c35_pm_japned_landed.log`, `critic/c34_pm_japned_landed.log` |
| R22e (R34-N2) | Status and Landing rows, desk 1600 × 900 and phone 390 × 844 | label and value 10 px apart, the value right-aligned and wrapping in its column | `critic/c35_lwp_desk.json`, `critic/c35_lwp_phone.json` |
| R22f (R34-N3) | Germany's division 1: march to Hamburg, a refused click on Paris, then a march to central Germany, real clicks | the notice goes when the state changes (Holding → marching, `critic/c35_sn_ger.json`) but **stays** when the refusal came while marching and the next order is a march (R35-N1) | `critic/c35_sn_ger3.json`, `critic/shots/c35sn_ger3_b_march.png`, `critic/shots/c35sn_ger3_end.png` |
| R22g (R34-N4) | Britain's division clicked onto the water off Bergen, mid North Sea, the Atlantic; Japan's onto the Pacific | "not done: there is only sea there: it goes over the sea to land on a coast."; Biscay by France still "a nation outside its wars"; Heligoland at war with Germany still goes by sea | `critic/c35_lp_os_bergen.json`, `critic/shots/c35lp_os_bergen_click.png`, `critic/c35_lp_os_helgoland_war.json` |

## Run 34's cases re-run

| Run 34 case | On HEAD (`a3e76107`) | Evidence |
|---|---|---|
| R34-B1 (refusal at the port untold) | **Fixed** | `critic/c35_pst.json` |
| R34-N1 (the wait aboard: no bound, no account, no way out) | **Account and way out fixed; escort fixed**; the way out opens R35-B1, R35-B2 | above |
| R34-N2 (status runs into its label) | **Fixed** | `critic/shots/c35lwp_desk_h4_panel.png` |
| R34-N3 (refusal notice outlives its truth) | **Fixed for its case** (the recall is now obeyed); a refusal while marching still outlives (R35-N1) | `critic/c35_sn_ger3.json` |
| R34-N4 (sea click refused for the land) | **Fixed** | `critic/c35_lp_os_bergen.json` |
| PS (three to Calais, headless) | identical: `PortShut` at t55, t63, t87 | `critic/c35_ps.log` |
| WAIT four120 / three90 / reorder / cancel / peace / enggerfour / engcalais3 | landings as in run 34 except where R22 means otherwise: escorts no longer at the landing weeks ahead (four120, three90, cancel, peace, engcalais3); reorder: the recall obeyed (364 ashore, 365 lands t633; run 34: refused, both landed t632–633) | `critic/c35_wait_*.json` |
| PNW in the page: Japan → Shanghai (two), the same with God's peace at hour 50, Japan → Java | identical: land h631/632; both refusals (15) posted at tick 51; Java h914/915 | `critic/c35_pnw_japchi.json`, `critic/c35_pnw_japchi_peace.json`, `critic/c35_pnw_japned.json` |
| WP two / four (the wait in the page) | re-run as LWT with the Landing row and real-click acts (four), and LWP (two rows' columns, desk and phone): the same wait (first aboard h1–4, all land h1244) | `critic/c35_lwt_four_recall.json`, `critic/c35_lwp_desk.json` |
| PM (sea and land after a peace), lmchk, LH2 USA → Calais, Netherlands → Java, Bergen2 | identical, but PM Japan → Java's landed arm (R22d row above) | `critic/c35_pm_*.log`, `critic/c35_lmchk.log`, `critic/c35_lh2_*.log` |
| LH 3517 | Calais refused 15 ×3 as before; Belfast lands h73 (run 34: h59); the save at the first hour reloads to the same hash (`1154433137`; run 34's world there differs by the escort kept) | `critic/c35_lh_3517.json` |
| NR desk/phone, LP (Calais, Bergen, USA, at war, Shanghai), SHM | identical but R22's own changes (Bergen's reason; the bombed-shut notice) and page-clock samples | `critic/c35_nr_eng_calais_desk.json`, `critic/c35_lp_*.json`, `critic/c35_shm_ten.json` |
| R32-N2 (trait text hover-only), R32-N3 (rows cut), R31-N1 (heroes under Ranking), R31-N6 (graph's first tap; a hero hides fleets) | **Unchanged** (TR phone, SHM, HF 5521, RGT 4111, HS 3739 and 3517 identical) | `critic/c35_tr_phone.json`, `critic/c35_rgt_4111.json`, `critic/c35_hs_3739.json` |
| No default in AI play; DF 7019 Poland −800 | **Unchanged** (`def` 8123 identical; DF the same course on the page clock) | `critic/c35_def_8123.json`, `critic/c35_df_7019_pol.json` |
| HO ten seeds off, five on; headless 7019 × 20 | identical | `critic/c35_ho_*.json`, `critic/c35_headless_7019.json` |
| A, Q, K/K2/K3, Z, C, PHZ, SB, PL, P, U, RG, BT, FW2, TR, W, HWP, HT, HFT, HF, HS, G, OS2 | identical but for samples on the page's clock | `critic/c35_*.json` (e.g. `critic/c35_u_1600_5557.json`, `critic/c35_rg_4111_desk.json`, `critic/c35_bt_5113_phone.json`, `critic/c35_fw2_2207.json`, `critic/c35_p.json`) |
| AN 7019 year 20, AN 6299 year 18; HI / DL / PF on 7019 year 20 | the same strikes, alerted; HI, DL identical; PF quiet below | `critic/c35_an_7019y20.json`, `critic/c35_hi_7019.json` |
| Checkers on run 34's seeds | 0 broken: diploInvariants 8123 (heroes), 8431 (random), 8807 (random world), 8573, 8999 (heroes); worldInvariants 8123, 8431, 8807 × 5 y, 8233 heroes+navy, 9311 air, 8677 bankrupt; heroWaits 8125 | `critic/c35_diploinv_*.log`, `critic/c35_wi_*.log`, `critic/c35_herowaits_8125.log` |

## Blocking issues

1. **R35-B1. Clicking the same landing again for the division waiting aboard leaves another division of the click on
   the quay for weeks.** Japan, the four divisions nearest Tokyo sent to Shanghai by one real click (escort on); at hour
   26 the one aboard (364) is clicked to Shanghai again. It goes ashore (`ashoreAtPort`), its convoy 1136 ends empty, and
   its new order binds it to group 1144 — the transports 365 was walking to — which it boards at hour 63. 365 reaches
   Tokyo at hour 512 and finds no room: "Waiting at Tokyo for transports" from hour 512 to 1367 (`critic/c35_lwt_four_same.json`
   trace; `critic/c35_ssb.json`; `critic/shots/c35ssb_h1250_365_panel.png`, `critic/shots/c35ssb_h1250_tokyo.png`,
   22 February, the other three ashore at Shanghai). Group 1144 sails with the others at 1121 and lands at 1244; 365 sails
   alone at 1367 (`critic/c35_ash_same.json`: `convoyPort` still holds 1144 → port 33 while 1144 is at sea). Nothing is
   told (`news: []`). While 365 stands on the quay, 364's panel says "2 of 4 aboard; the last a day from the port"
   (`critic/shots/c35ssb_h1100_364_panel.png`). On run 34's commit the same click is refused `Aboard` and all four land
   at 1242–1243 (`critic/c35_wt_ash_same.json`), so this is new with R22b and contradicts R21e's "one click lands
   together" and R22c's account. With two or three divisions there was room and it did not bite
   (`critic/c35_ash_same2.json`, `critic/c35_ash_same3_200.json`). **Fix:** a division going ashore from a loading convoy
   keeps that convoy's place (or a re-order to the same landing is a no-op while it waits); never bind a division to a
   group another division of the click is bound to beyond its room; count in `landingWait` a bound division standing at
   the port with no room as held up, and tell it.
2. **R35-B2. A refused order unloads the division waiting aboard and drops it from its landing.** The same four; at hour
   26 the one aboard clicked onto Calais (France at peace) or onto open water. Refused at once (15, 17), the notice "not
   done: …" — yet the division is ashore at Tokyo, "Holding", its voyage gone; the other three go on without it
   (`critic/c35_lwt_four_neutral.json`, `critic/c35_lwt_four_sea.json`, `critic/shots/c35lwt_four_sea_act_panel.png`;
   headless: `critic/c35_ash_neutral.json`, `critic/c35_ash_seaopen.json`, 364 ends at Tokyo, never lands). The rule the
   worker states for refusals (`orderNews`: "a refused order leaves the one before it standing … a division aboard keeps
   its voyage") and the one SPEC states for R22b ("goes ashore … and the order stands") are both false here; the player
   reads "not done" and a division has been taken out of a landing. **Fix:** judge the order first and go ashore only for
   an accepted one (or undo `ashoreAtPort` on a refusal); a spec: the aboard division clicked onto open sea keeps
   "Aboard at Tokyo".

## Non-blocking issues (prioritised)

1. **R35-N1. A refusal given while marching stays under the next accepted march.** Germany's division 1 marching to
   Hamburg, a click on Paris (refused, "no way by land…"), then a click in central Germany, accepted, the division turning
   south: six hours later the panel still says "On the march" over "not done: there is no way by land that keeps off the
   ground of nations outside its wars" (`critic/c35_sn_ger3.json`, `critic/shots/c35sn_ger3_b_march.png`,
   `critic/shots/c35sn_ger3_end.png`). R22f's ROADMAP text said "order or state"; SPEC and the code took state only
   (`staleNotice`: voyage, moving, engaged, retreat). **Fix:** a refusal notice goes with the next accepted order of the
   formation too (the worker knows it: `ordered` changes).
2. **R35-N2. A whole click clicked again scatters its landing — older than R22.** All four re-selected and sent to
   Shanghai again at hour 26: they land at hours 185, 633, 952 and 1243, each alone (`critic/c35_ash_all.json`); the
   same on run 34's commit (148, 633, 952, 1243; `critic/c35_wt_ash_all.json`). A second click of the same order should
   not undo R21e's landing together.
3. **R35-N3. The escort's wait costs a lone landing time.** One division to Belfast lands at hour 73 where run 34's
   commit landed it at 59 (`critic/c35_lh_3517.json`, `critic/c34_lh_3517.json`): the loaded transports wait for the
   escort kept at its anchorage; nothing on the panel says why it has not sailed.
4. **R32-N2**, **R32-N3**, **R31-N1**, **R31-N6**, **no default in AI play**, **R32-N5** — unchanged (table above).

## Design objections (none blocking, no score lowered)

- ADR-826/R22b: a re-order of a division aboard is allowed only at a port of its nation while the convoy loads; R35-B1
  and B2 are execution, but the simpler rule — the division keeps its place on the transports until it is actually
  told to go somewhere else that is accepted — would have avoided both.
- Run 33's and 34's objections stand: an ally's coast refused as "a nation outside its wars"; the jump home across the
  sea; save format 2 refuses older scenarios; the unbounded wait (now accounted for, and with a way out).

## Ideas from other games (not scored)

- Hearts of Iron's naval invasion keeps its divisions assigned to the plan until the player removes them: re-issuing the
  plan does not reshuffle the transports. R35-B1's fix could treat the click's divisions as one plan the same way.
- Europa Universalis clears an order's error tooltip as soon as the unit takes any new order: R35-N1's fix.

## Notes

- `c35_lwt_four_recall_phone` gave no order (the phone's click met the place label, as run 34's phone wait); not used.
  Phone evidence for R22c/R22e is `critic/c35_lwp_phone.json` (orders through the page's command).
- The fuzzer's "aboard a dead group" hour on seed 10331 (`t1617 275 aboard dead group -1`) is the same on run 34's
  commit (replayed in the worktree, `critic/c35_wt_fz_10331_eng.log`): older, one hour, not filed.
- Britain's divisions boarding on their own after a refused order (`critic/c35_wait_engcalais3.json`, t361) is the AI
  that SPEC §9.3 keeps on for a played nation; the same on run 34.

## Strengths, verified

- **The worker now tells every refusal at the port** (`critic/c35_pst.json`), and the new Landing row is exact: the days
  it states at hour 4 come true at hour 1121 (`critic/c35_lwt_four_same.json`).
- **R22 left every AI world alone:** fifteen 20-year worlds, a year-20 save and the default run are bit-identical to run
  34's (`critic/c35_ho_*.json`, `critic/c35_seed7019_y20.bin`, `critic/c35_def_8123.json`).
