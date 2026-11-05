# Critic report, run 34 (focused) — after R21

- **Mode: focused.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). (1) Run 33 has a score under its bar
  (naval 7, bar 8). (2) Every commit since run 33's commit `937fd085` is either the report's own commit `60253c14`
  (`PROGRESS.md`, `ROADMAP.md`, `critic/` only) or names a ROADMAP item that commit filed: R21a–e (`git show 60253c14 --
  ROADMAP.md` adds R21 and R21a–e; the five commits `76f8f911`, `0c3d1cd1`, `ec2bbf72`, `f17db7fb`, `2535a577` each name
  one). (3) Runs 31–33 were full, full, full. So: every named case of run 33 re-run; scored afresh are naval (under its
  bar) and the dimensions the changed files touch (`git diff --stat 937fd085 HEAD -- src`: `amphibious.ts`, `movement.ts`,
  `history.ts`, `events.ts`, `server.ts`, `protocol.ts`, `simClient.ts`, `hud.ts`, `game.tsx`, `App.tsx`,
  `MapTooltip.tsx`, `orderNewsText.ts`, `en.json`): naval, diplomacyWarDepth (the land/sea rule after a peace),
  statsHistory (a new History kind), uiUxPolish (tooltip, panel, rows), stability (worker and protocol). Every other score
  is carried, its cases re-run.
- **Commit judged:** `2535a577878009673bc5e46a6b7d4ce58e5c446b` (HEAD at the start, `critic/c34_commit.txt`). **Date:** 2026-11-04.
- **Build:** `vite build --outDir critic/c34_dist`, exit 0 (`critic/c34_build.log`), served by `vite preview` on
  127.0.0.1:**5299**. Chromium through Playwright, headless; desk 1600 × 900, phone 390 × 844.
- **Baseline.** Every R21 commit says "pin unmoved". **Verified:** all 15 headless 20-year runs of run 33's seeds (ten
  heroes off, five on; `critic/scripts/c31_ho.ts`) are identical to run 33's JSON with timings stripped; the year-20 save
  of 7019 made on HEAD is byte-identical to run 33's (`cmp critic/c34_seed7019_y20.bin critic/c33_seed7019_y20.bin`);
  the LH case's save in the first hour aboard reloads to the same hash `1306977546` (`critic/c34_lh_3517.json`). So
  every seeded world without a player's sea order is run 33's world, and run 33's page cases compare one to one.
- **Runs:** 34 headless jobs (`critic/scripts/c34_jobs1.txt`, `critic/c34_jobs.log`), 13 landing/peace jobs
  (`c34_jobs3.txt`), 11 fuzz and checker jobs on new seeds (`c34_jobs4.txt`), every one exit 0; page suites L, A, B, C
  (`critic/scripts/c34_suite{L,A,B,C}.sh`, every probe exit 0). New probes: `c34_wait.ts` (a convoy that waits for the
  rest of its click: recall, peace, cancel, four divisions), `c34_wp_waitpage.mjs` (the same in the page, real clicks),
  `c34_pst_portshut.mjs` (what the page tells of a refusal at a bombed port, with the worker's `orderNews` listened to
  directly), `c34_pnw_news.mjs` (the same listener on a peace and on landings), `c34_fz.ts` (the player's sea orders
  fuzzed on six new seeds), and one replay of the four-division case on run 33's commit in a worktree (`critic/wt`, removed).

## Verdict

**R21 does what its five items say in the sim, and most of it in the page:** an order over the sea is stopped by a peace
before it sails, as the land march is (R33-N1); the tooltip over a neutral's coast now says "No landing here" and a real
click's refusal keeps the formation panel open with the reason in full (R33-N3); ten sent home are one row and one History
record (R33-N4); one click's divisions land within an hour of each other (R32-N1).

**One blocking issue: R21b's new reason never reaches the player (R34-B1).** A division refused at the port it marched to
— the port bombed shut — is refused in the sim with `PortShut` (16), but the page's worker forgets the player's order at
the same hour's arrival and drops the refusal: in the page, with a listener on the worker's `orderNews`, **zero** news in
110 hours while two of three British divisions were refused at Portsmouth; their panels say "Holding", no notice, no row.
The same listener got a refusal ordered at once in the same page. ROADMAP R21b's AT, "the reason is the new one", holds
for the sim's event; the player is told nothing at all.

**Naval stays at 7**, for R34-B1 and for the cost of R21e: a click of four divisions to Shanghai now puts the first aboard at
Tokyo for **50 days** while the last walks there, the panel saying only "waiting for the rest of the landing", and a recall
of it, standing in its own port, refused ("it is aboard transports and takes no order until it lands").

## Scores

| Dimension | Run 33 | Run 34 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | carried (no map file changed). Run 33's cases re-run: SK 1212 and 8123, HF 5521 desk and phone, HF 7019 d730, HS 3739 and 3517 identical (`critic/c34_sk_1212.json`, `critic/c34_hf_5521_desk_d0_0.json`). R31-N1 unchanged |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | rescored: the sea and land orders now agree after a peace (R33-N1 fixed: Japan's two for Shanghai and for Java, peace while one is aboard at the port and one walks: both refused `Neutral` the next hour and the one aboard set ashore at Tokyo, `critic/c34_pm_jap_sea.log`, `critic/c34_pm_japned_sea.log`; in the page both are told, `critic/c34_pnw_japchi_peace.json`; the land march stopped `Barred` as before, `critic/c34_pm_gerfra_land.log`). Checkers on new seeds: diploInvariants 0 broken on 9533 (heroes), 9601 (random diplomacy), 9677 (random world) (`critic/c34_diploinv_9533s_h.log`, `..._9601r.log`, `..._9677w.log`); worldInvariants 0 broken on 9601 random × 10 y and 9533 heroes+navy × 20 y; run 33's seeds re-run (below). FW2 2207, BT 5113 identical. Not 8: run 30's list (bond exit, guarantees, refused peace untold) untouched |
| Emergent world dynamics over long runs | 7 | 7 | carried: the world is run 33's (15 of 15 `ho` runs identical, the year-20 save byte-identical) |
| God Mode | 7 | 7 | carried: A 4219 and 8999, Q 6421 and 8807, K/K2/K3 2203 identical but for live samples (`critic/c34_a_4219.json`, `critic/c34_q_8807.json`, `critic/c34_k_2203.json`). R32-N2 unchanged |
| Editor and scenarios | 7 | 7 | carried: G 4877 as in runs 29–33 (its 900 s wall-clock wait times out; marks differ by the page's own clock), OS2 refuses run 25's scenario as before (`critic/c34_g_4877.json`, `critic/c34_os2_c25.json`) |
| Stats and history | 7 | 7 | rescored: R33-N4's History half fixed — ten sent home are one record, "United Kingdom's formations on the ground of nations outside its wars, with no way home by land, were sent home: 10", under a filter kind "Sent home" (`critic/shots/c34shm_ten_history.png`); HI on 7019's year-20 save identical to run 33 (3,714 events). Not 8: the record counts but names neither the formations nor the place; nothing else in History or the charts changed |
| UI/UX and polish | 7 | 7 | rescored: R33-N3 fixed — over Calais at peace the tooltip says "No landing here: the ground of a nation outside your wars" and a real click leaves the formation panel open with the reason in full (`critic/shots/c34nr_eng_calais_desk_hover.png`, `critic/shots/c34nr_eng_calais_desk_click.png`; the land refusal the same, `critic/c34_nr_swe_cph_desk.json`). Not 8: R34-B1 (a refusal at the port is silent); R21e's own status string runs into its label, "StatusAboard at Tokyo, waiting for the rest of the landing" (`critic/shots/c34wp_two_h242_panel_crop.png`); a refusal's notice stays in the panel for weeks after it stopped being true (`critic/shots/c34wp_four_h1202_first.png`: 20 February, "At sea, bound for its landing" under 13 January's "not done: it is aboard transports…"); rows still cut at 272 px (R32-N3: the new "…and 9 more" row cut, `critic/c34_shm_ten.json`) |
| Performance | 7 | 7 | rescored (the sim's systems changed): quiet ten-year watch of 6151 with nothing else running, 59.8–60 fps every year, longest gap 83 ms, 293 s for ten years, no page error (run 33: 59.9–60, 83 ms, 293 s; `critic/c34_lw_6151.json`, `critic/c33_lw_6151.json`); PF on 7019's year-20 save run quiet: 60 fps at 3,000, 1,200 and 600 m/px, 35–47 fps at 120 and 30 m/px, p95 frame ≤ 18.3 ms (run 33: 35–48; `critic/c34_pf_7019.json`, copy `critic/c34_pfq_7019.json`). Under load (six sims and three browsers beside it) LW 3517 with heroes held 59.9–60 fps, longest gap 100 ms (`critic/c34_lwhon_3517.json`). Not 8: no phone-class device measured |
| Stability | 7 | 7 | rescored: no page error in any probe (suites L, A, B, C and the new probes: `errors: []`); 58 headless jobs, none crashed; determinism above (15 of 15 worlds identical, year-20 save byte-identical, a save in the first hour aboard reloads to the same hash). workerDeterminism 3517: `7e113d94` on all four arms, as in run 33 (`critic/c34_wd_3517.log`). Not 8: R34-B1 is the worker dropping an event it should send |
| Semantic zoom to unit level (needs 8) | 8 | 8 | carried: Z 3517 and 8123, PHZ 2671 and 8233 identical but for element counts sampled on the page's clock (`critic/c34_z_3517.json`, `critic/c34_phz_8233.json`) |
| Naval warfare (needs 8) | 7 | **7** | rescored: R33-N1, R33-N2 (in the sim), R33-N3, R32-N1 fixed (cases below); navy and heroes rules 0 broken over 20 years on new seed 9533 (`critic/c34_wi_9533_h20_hn.log`); the player's sea orders fuzzed on six new seeds × 120 days: no division stranded aboard a lost group, none bound or aboard at the end without a convoy (`critic/c34_fz_*.json`). **Not 8: R34-B1 (blocking), R34-N1 (the wait aboard)** |
| Tanks (needs 8) | 8 | 8 | carried: C 6421, 7019, 8573 identical but for sortie counts sampled on the page's clock (`critic/c34_c_8573.json`) |
| Aircraft (needs 8) | 8 | 8 | carried: W 7019 and 8431 (the fighter followed, 55 and 54 of 60 samples marked; run 33: 56 and 57 of 62 — the page's clock, not the build: same world) (`critic/c34_w_7019.json`, `critic/c34_w_8431.json`) |
| AI nuclear use (needs 8) | 8 | 8 | carried: AN 7019 year 20 identical (the same two strikes, alerted, `critic/c34_an_7019y20.json`); AN 6299 year 18 the same strikes (`critic/c34_an_6299y18c32.json`) |

## R21, case by case

| Item | Case | Result | Evidence |
|---|---|---|---|
| R21a (R33-N1) | Japan at war with the Netherlands, two divisions to Java, God's peace 12 h after the first is aboard (run 33's case) | the one aboard at Tokyo (R21e keeps it in port) and the one walking are both refused `Neutral` at t16; the one aboard is set ashore at Tokyo (run 33: it sailed, landed on Java t407 and was sent home; the other boarded 17 days after the peace) | `critic/c34_pm_japned_sea.log` |
| R21a | Japan → Shanghai, peace at t14 (run 33: one landed on China's ground t123, the other t510) | both refused `Neutral` at t15, none sails | `critic/c34_pm_jap_sea.log` |
| R21a in the page | Japan → Shanghai, God's peace at hour 50 | the worker sends both refusals (`orderNews` 15 for 364 and 365 at tick 51); a row "not done: it would land on the ground of a nation outside its wars" | `critic/c34_pnw_japchi_peace.json` |
| R21a | the land march for comparison (Germany → Reims, peace at h20) | stopped at the border, `Barred`, as in run 33 | `critic/c34_pm_gerfra_land.log` |
| R21b (R33-N2) | Britain at war with France, the three nearest London to Calais (headless) | each refused at Portsmouth with **16** (`PortShut`), the port's damage 0.63–0.9 (run 33: 5, "no port") | `critic/c34_ps.log`, `critic/c33_ps.log` |
| R21b in the page | the same order by a real click | **nothing told**: 0 `orderNews` posts in 110 hours (listener on the worker), no row, no notice; 270 and 271 "Holding" at Portsmouth. Control in the same page: an order refused at once is posted (reason 15, tick 111) | `critic/c34_pst.json`, `critic/shots/c34pst_div270.png` |
| R21c (R33-N3) | NR desk, Britain's division 274 over Calais at peace, real mouse | tooltip "France / No landing here: the ground of a nation outside your wars"; after the click the panel open, "Status Holding", the reason in full (run 33: panel closed, the tooltip promised the voyage) | `critic/shots/c34nr_eng_calais_desk_hover.png`, `..._click.png`, `critic/c34_nr_eng_calais_desk.json` |
| R21c | NR desk, the land refusal (Sweden → Copenhagen) | panel open with the reason (run 33: closed) | `critic/c34_nr_swe_cph_desk.json` |
| R21c | NR phone (selection by the API, as in run 33) | panel open with the reason; the row cut at 376 px | `critic/c34_nr_eng_calais_phone.json` |
| R21c | LP USA → Calais, Britain → Calais (three) | refused at the click with the panel's notice; with three selected the panel shows the last refused (270) | `critic/c34_lp_usa_calais.json`, `critic/shots/c34lp_eng_calais_click.png` |
| R21d (R33-N4) | SHM: ten British divisions put on France's ground by God, a day start | one row "Infantry division 1468 and 9 more: they stood on the ground of nations outside your wars…" (cut, 272 px); one History record that counts ten | `critic/c34_shm_ten.json`, `critic/shots/c34shm_ten_after.png`, `critic/shots/c34shm_ten_history.png` |
| R21e (R32-N1) | LP Japan → Shanghai, two divisions (run 33: landed h123 and h510) | the first boards at Tokyo h1 and waits aboard; both land h631 and h632 in the page, t632 and t633 headless | `critic/c34_pnw_japchi.json`, `critic/c34_wait_reorder.json` |
| R21e | four divisions to Shanghai, headless; the same on run 33's commit | HEAD: boarded t2, t511, t830, t1121; **all land t1242–1243** (52 days). Run 33's commit: landed t123, t445, t510 and t2322 | `critic/c34_wait_four120.json`, `critic/c34_wt_wait_four120.json` |
| R21e | four divisions in the page (real click) | the first's panel "Aboard at Tokyo, waiting for the rest of the landing" from 2 January to 20 February; recall by a real click on Japan at hour 301 refused "it is aboard transports and takes no order until it lands"; four escorts reach Shanghai's water at hours 24–51 (headless) and stay the convoys' escorts until the landing at t1242 | `critic/c34_wp_four.json`, `critic/shots/c34wp_four_recall.png`, `critic/shots/c34wp_four_h962_landing.png`, `critic/c34_wait_four120.json` (events, `trace[].escorts`) |
| R21e | a recall of the one aboard (headless) | accepted at the command, `MoveRejected 1` the next hour, and it lands at Shanghai t632 anyway | `critic/c34_wait_reorder.json` |
| R21e | re-ordering the others instead | the one aboard sails alone at once and lands t172: the way out exists, and nothing in the page points to it | `critic/c34_wait_cancel.json` |
| R21e + R21b | Britain at war with France, three to Calais (page) | the first boards at Portsmouth h54 and waits; the port is bombed shut; the other two are refused there (untold, R34-B1); the first sails alone h84, lands h96, is destroyed by h213 | `critic/c34_lp_eng_calais_war.json` |

## Run 33's cases re-run

| Run 33 case | On HEAD (`2535a577`) | Evidence |
|---|---|---|
| R33-N1 (sea order outlives the peace) | **Fixed** (table above) | `critic/c34_pm_japned_sea.log`, `critic/c34_pm_jap_sea.log` |
| R33-N2 (wrong reason at a shut port) | **Fixed in the sim** (16); **not told in the page** (R34-B1) | `critic/c34_ps.log`, `critic/c34_pst.json` |
| R33-N3 (refusal read only as a cut row; tooltip promised the voyage) | **Fixed** | `critic/shots/c34nr_eng_calais_desk_click.png` |
| R33-N4 (ten sent home, one row, six never told, no History) | **Fixed**: one counted row, one History record | `critic/c34_shm_ten.json` |
| R32-N1 (one click lands 16 days apart) | **Fixed** (h631/632), at the cost of R34-N1 | `critic/c34_pnw_japchi.json` |
| LH 3517 (three to Calais refused, Belfast lands) | identical to run 33 | `critic/c34_lh_3517.json` |
| LH2 Bergen (run 32's cell), USA → Calais, Netherlands → Java | refused 15, 15, 6 as in run 33 | `critic/c34_lh2_eng_bergen2.log`, `critic/c34_lh2_usa_calais.log`, `critic/c34_lh2_ned_java.log` |
| LP Britain → Calais at war | lands h96 (run 33: h66), alone (above) | `critic/c34_lp_eng_calais_war.json` |
| PM land, Germany → Reims after a peace | `Barred` at the border as in run 33 (the probe's start cell reconstructed: run 33 did not record it) | `critic/c34_pm_gerfra_land.log` |
| lmchk (Germany → Warsaw after a peace) | as run 33 | `critic/c34_lmchk.log` |
| R32-N2 (trait text hover-only) | **Unchanged** (TR phone identical) | `critic/c34_tr_phone.json` |
| R32-N3 (refusal rows cut) | **Unchanged** (the new rows cut too) | `critic/c34_shm_ten.json` |
| R31-N1 (Japan's heroes under the Ranking panel) | **Unchanged** (HF 5521 desk identical) | `critic/c34_hf_5521_desk_d0_0.json` |
| R31-N6 (graph's first tap after a drag; a hero hides fleets) | **Unchanged** (RGT 4111, HS 3739, HS 3517 identical) | `critic/c34_rgt_4111.json`, `critic/c34_hs_3739.json` |
| No default in AI play; DF 7019 Poland −800 | **Unchanged**: 0 defaulted, 0 collapsed on 8123 × 20 y, identical to run 33; DF the same course (samples a day apart on the page clock, as in run 33) | `critic/c34_def_8123.json`, `critic/c34_df_7019_pol.json` |
| R32-N5 (sea heroes die more) | **Unchanged** (the five heroes-on runs identical) | `critic/c34_ho_on_*.json` |
| HO ten seeds off, five on | identical to run 33 | `critic/c34_ho_*.json` |
| HWP 4637, HT phone, HFT 5521, HF 7019 d730 | identical (HT: boot time only) | `critic/c34_hwp_4637_fra.json`, `critic/c34_ht_phone.json` |
| A 4219 / 8999, Q 6421 / 8807, K/K2/K3 2203, Z 3517 / 8123, C 6421 / 7019 / 8573, PHZ 2671 / 8233 | identical but for samples on the page's clock (a title-screen seed, element and sortie counts) | `critic/c34_a_4219.json` … `critic/c34_phz_8233.json` |
| AN 7019 year 20, AN 6299 year 18 | the same strikes, alerted | `critic/c34_an_7019y20.json`, `critic/c34_an_6299y18c32.json` |
| HI / DL / PF on 7019 year 20 | HI and DL identical; PF under load (above) | `critic/c34_hi_7019_c32save.json`, `critic/c34_dl_7019.json`, `critic/c34_pf_7019.json` |
| SK 1212 / 8123 | identical | `critic/c34_sk_1212.json`, `critic/c34_sk_8123.json` |
| G 4877, OS2 | as run 33 | `critic/c34_g_4877.json`, `critic/c34_os2_c25.json` |
| SB, PL, P, U, RG, BT, FW2, TR, W | identical but for page-clock samples | `critic/c34_sb_7019.json`, `critic/c34_p.json`, `critic/c34_u_1600_5557.json`, `critic/c34_rg_4111_desk.json`, `critic/c34_w_7019.json` |
| Checkers on run 33's seeds | 0 broken: diploInvariants 8123 (heroes), 8431 (random), 8807 (random world), 8573, 8999 (heroes); worldInvariants 8123 heroes × 20 y, 8431 random × 20 y, 8807 random world × 5 y, 8233 heroes+navy × 20 y, 9311 random air × 20 y, 8677 bankrupt × 20 y; heroWaits 8125 | `critic/c34_diploinv_*.log`, `critic/c34_wi_*.log`, `critic/c34_herowaits_8125.log` |

## Blocking issues

1. **R34-B1. A refusal at the port a division marched to is never told in the page (R21b's reason unseen).** Britain at
   war with France (God's war), the three divisions nearest London sent to Calais by a real click. In the sim each is
   refused at Portsmouth with `PortShut` (16) when it arrives (`critic/c34_ps.log`: t55, t63, t87, the port's damage
   0.63–0.9). In the page, with a listener on the worker's `orderNews` from before the click, **no news is posted in 110
   hours**; no row, no panel notice; 270 and 271 stand at Portsmouth "Holding" (`critic/c34_pst.json`,
   `critic/shots/c34pst_div270.png`, `critic/shots/c34pst_h90.png`). The same listener receives an order refused at
   once in the same page (reason 15, tick 111), so the listener works. Cause, by reading: `orderNews`
   (`src/worker/server.ts`) forgets an order at a `FormationArrived` when `seaBound` no longer holds the formation, and
   reads the hour's events after the hour: the division's arrival at the port and its refusal there are the same hour,
   the refusal has already cleared `seaBound`, so the arrival forgets the order and the `MoveRejected` after it finds
   none. Every refusal at the port after the march (shut, no port, no transports, no sea way) is lost the same way; R21b's
   AT asserts the sim's event, not the page. The drop is older than R21 — it would have swallowed run 33's `NoPort` at the
   same port too (run 33 measured that case headless only) — but R21b claims the player is told, and the player is not.
   **Fix:** forget at an arrival only when no refusal of the same formation
   follows in the same hour (or handle `MoveRejected` first); an e2e spec on Portsmouth bombed shut that reads the row.

## Non-blocking issues (prioritised)

1. **R34-N1. The wait aboard has no bound, no account and no way out from the panel.** Four Japanese divisions to Shanghai
   by one click: the first boards at Tokyo in the first hour and stays aboard 50 days while the fourth walks from northern
   Honshu (R21e sends every later division of the click to the first's port, `assignTransports`); all four land at
   t1242–1243 (`critic/c34_wait_four120.json`; run 33's commit: the first three by t510, the last t2322,
   `critic/c34_wt_wait_four120.json`). The panel says "Aboard at Tokyo, waiting for the rest of the landing" for seven
   weeks without naming who or how long (`critic/shots/c34wp_four_h962_landing.png`, `critic/c34_wp_four.json` marks h25–h962); a recall of the division standing
   in its own port is refused, "takes no order until it lands" (`critic/shots/c34wp_four_recall.png`; headless: accepted,
   `MoveRejected 1` the next hour, and it lands at Shanghai anyway, `critic/c34_wait_reorder.json`); the one way out —
   re-ordering the walkers, after which it sails at once (`critic/c34_wait_cancel.json`) — is nowhere suggested; the
   four escorts sail at the click, reach Shanghai's water by hour 51 and stay assigned there until the landing
   (`critic/c34_wait_four120.json`: `trace[].escorts` `[1149, 1155, 1148, 1146]` from t2 to t1238). ADR-826 chose the unbounded wait and records
   the far-division workaround; the execution is what is judged here. **Fix:** let a division aboard a convoy still in
   its port take an order (go ashore); say in the panel how many it waits for and the furthest one's days; hold the
   escort until the convoy sails.
2. **R34-N2. R21e's status string runs into its label:** "StatusAboard at Tokyo, waiting for the rest of the landing", the
   value wrapping under the label column (`critic/shots/c34wp_two_h242_panel_crop.png`).
3. **R34-N3. A refusal notice outlives its truth.** The recall refused on 13 January stays in the panel on 20 February
   under "At sea, bound for its landing" (`critic/shots/c34wp_four_h1202_first.png`).
4. **R34-N4. A sea order on open water is refused for the land.** Britain's division clicked onto the sea off Bergen is
   told "there is no way by land that keeps off the ground of nations outside its wars" (`critic/c34_lp_eng_bergen.json`,
   `critic/shots/c34lp_eng_bergen_click.png`): the reason speaks of a march the player did not ask for. Older than R21 (run 33 met the same cell and did not file it).
5. **R32-N2**, **R32-N3**, **R31-N1**, **R31-N6**, **no default in AI play**, **R32-N5** — unchanged (table above).

## Design objections (none blocking, no score lowered)

- R21e's choice (ADR-826): land together, wait unbounded. On run 33's commit the same four-division click put three
  divisions ashore by day 21 and the fourth on day 97; on HEAD all four on day 52. Neither is good; a cap (sail with what
  is aboard after N days) would keep most of both.
- Run 33's objections stand: an ally's coast is refused as "a nation outside its wars" (the tooltip now says it before the
  click: `critic/shots/c34lp_eng_calais_click.png`, Britain and France allied); the jump home across the sea; save
  format 2 refuses older scenarios.

## Ideas from other games (not scored)

- Hearts of Iron's naval invasion shows a preparation bar and the divisions assigned, and lets an invasion be cancelled
  before it launches; R34-N1's panel could show the same: "3 of 4 aboard; division 367 9 days out".
- Europa Universalis' message settings let the player pin which order failures pop up; a refusal at a port would then be a
  message, not only a row.

## Notes

- Run 33's PM land case did not record its start cell; it was reconstructed (Rhineland to Reims) and gives the same rule.
- The phone run of the wait probe (`critic/c34_wp_twophone.json`) gave no order (the click at the canvas centre on a
  phone met Tokyo's label); not used.
- Scratch files of an interrupted attempt at this run on the same commit were overwritten; every figure cited here was made
  in this run.

## Strengths, verified

- **The sim's half of R21 is exact and leaves the world alone:** each of run 33's five naval cases now behaves as its item
  says (table above), while fifteen 20-year worlds and a year-20 save are bit-identical to run 33's
  (`critic/c34_ho_*.json`, `critic/c34_seed7019_y20.bin`).
- **The refusal at the click is now readable where it is given:** tooltip before, panel after, with the reason in full,
  on desk and phone (`critic/shots/c34nr_eng_calais_desk_hover.png`, `critic/c34_nr_eng_calais_phone.json`).
