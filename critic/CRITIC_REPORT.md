# Critic report, run 40 (focused) — after R28

- **Mode: focused.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). (1) Run 39 (`50a94e01`, on
  `99ba6c07`) has a blocking issue (R39-B1) and naval 7 under its bar of 8. (2) Every commit since is an R28 item, and
  R28 was filed by that report commit ("… naval 7 (bar 8); R28 filed"): `ea933e6d` R28a, `de972f6a` R28b, `76b88197`
  R28c. (3) The last three reports are full (39), focused (38), full (37): not all focused. So: run 39's named cases
  re-run; naval (under its bar, blocked) rescored; and the dimensions the changed files touch rescored —
  `amphibious/movement/tick/world/server/protocol` → naval, stability, performance; `MapView/game/simClient/MapTooltip/
  en.json` → uiUxPolish and mapVisuals (the marks). The rest carried, marked "carried". A clean focused run would still
  need a full run before a release; this one is not clean.
- **Commit judged:** `76b881972be3468986a91dff6eaca6293ef8f6b3` (`critic/c40_commit.txt`). **Date:** 2026-11-05.
- **Build:** `vite build --outDir critic/c40_dist`, exit 0 (`critic/c40_build.log`); `vite preview` on 127.0.0.1:5299
  (`critic/c40_preview.log`); Chromium through Playwright, desk 1600 × 900, phone 390 × 844, a `hasTouch` phone.
- **Runs:** run 39's scripts copied to `c40_*` (`critic/scripts/`); the headless list (run 39's main list, its new-seed
  list, the re-order list `c39_jobsLL`, `c39_jobsB` and the TR jobs: `critic/scripts/c40_jobsRun.txt`, log
  `critic/c40_jobsRun.log`); page suites A, B1, C1, L, N, N2, New, R, R2, R3, R5, run 39's mark and touch probes
  (`critic/scripts/c40_suiteMK.sh`), and Q alone at the end. New: `c40_ll2.ts` / `c40_ll3.ts` (scripted re-orders with
  fresh divisions, the `seaHint` marks of each order and the transport groups traced; `NOW=1` applies each order at once
  as the game's UI does, `T0=1` gives the first orders at tick 0 as the page does), `c40_mk2_steal.mjs` (real clicks,
  paused), `c40_hs_hintsel.mjs` and `c40_hp_hintperf.mjs` (R28b's marks for box selections, and their cost). A worktree
  at run 39's commit (`critic/wt`, `99ba6c07`) replayed every new case (`critic/c40_wt_*`).
- **Baseline: R28 left every AI world alone.** The year-20 save of 7019 is byte-identical to run 39's
  (`cmp critic/c40_seed7019_y20.bin critic/c39_seed7019_y20.bin`); workerDeterminism ends on the same hash on every arm
  for 3517 (`7e113d94`), 11071 (`d2716b65`), 12007 (`39503469`) and 13109 (`7ca6d729`), as run 39 (`critic/c40_wd_*.log`).

## Verdict

**R28's acceptance tests pass, by script and by real click, and R39-N1 is fixed.** The two re-sent to Fuzhou two hours
after the first boards land h657/h658 (run 39: h1292) on their own groups (`critic/c40_ll_bothfar.json`); of three, the
two land h657/h658 (run 39: h792/h1294, `critic/c40_ll_three_twofar.json`); the four re-clicked three cells south-west
are refused nothing and land together h1244 (run 39: all four refused; `critic/c40_ll_four_all_sw3.json`, real click
`critic/c40_lwt5_four_allsw63.json`). A mixed selection now shows two marks and says "2 landings, each marked: they
will not land together" (`critic/shots/c40mk_mixed_s2_hover.png`).

**Two blocking issues, both found by playing the order the way the game gives it.**

- **R40-B1.** Build a landing at Fuzhou the natural way — send a fresh division there first, then redirect the Shanghai
  landing there too — and R39-B1 is back whole: the division aboard its transports at Tokyo is put ashore and walks
  ~50 days to Sasebo while its own transport group sails there empty in five; the other lands alone 26 days before it.
- **R40-B2.** The game applies each division's order at once, one at a time (`hud.command` → `sim.command(cmd, true)` →
  the worker's `applyNow`), so R28a's "the hour's orders judged together" never sees a click in the real game, and the
  R25b/R27c notice fires on every whole-landing redirect: re-click all four of a landing and three are told "the rest
  keep the old landing, and it will not land with them" — and all four then land together. The builder's tests queue
  the orders and apply them in one batch, which the game never does; they prove the code matches itself.

**Naval stays 7, under its bar of 8.** Every other rescored dimension holds; the carried ones are carried on the
evidence that the AI's worlds are byte-identical.

## Scores

| Dimension | Run 39 | Run 40 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | **Rescored (the marks).** Two marks, green for the kept landing and orange for the new, read clearly over Japan's yellow and the markers at 600 m/px (`critic/shots/c40mk_mixed_s2_hover.png`); the marks at 3,000/600/120/30 m/px as run 39 (`critic/c40_mk_mixed_s2.json` `zoom`). **Not 8:** run 37/39's reasons (hero counters over Europe, the label pile at 250 m/px, the tooltip pointing at an off-screen mark at 30 m/px, `critic/shots/c40mk_mixed_s2_z30.png`) unchanged |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | **Carried.** No file of the rules changed; run 39's checker runs re-run (`critic/c40_diploinv_*.log`, `critic/c40_wi_*.log`); new seeds 14003 (heroes) and 14011 (random diplomacy) — see Stability |
| Emergent world dynamics over long runs | 7 | 7 | **Carried.** The 20-year save of 7019 byte-identical; run 39's twenty-year worlds re-run (`critic/c40_ho_*.json`) |
| God Mode | 7 | 7 | **Carried.** A/Q/K re-run (`critic/c40_a_*.json`, `critic/c40_q_*.json`, `critic/c40_k_*.json`) |
| Editor and scenarios | 7 | 7 | **Carried.** OS2 and G 4877 re-run (`critic/c40_os2_c25.json`, `critic/c40_g_4877.json`) |
| Stats and history | 7 | 7 | **Carried.** HI/DL re-run (`critic/c40_hi_*.json`, `critic/c40_dl_*.json`) |
| UI/UX and polish | 7 | 7 | **Rescored.** R39-N1 fixed (two marks, "2 landings…", `critic/c40_mk_mixed_s2.json` `hover.nLandings: "2"`). New: the false "the rest keep the old landing" on every whole-landing redirect (R40-B2, `critic/shots/c40lwt5_four_allsw63_notice_h35.png`); a hover over Fuzhou right after the order says "they keep their transports" over a panel reading "Marching to Sasebo to board transports" (`critic/shots/c40mk2_freshfirst_panel_h4.png`); a box of all 33 Japanese divisions, 29 of them on the mainland and marching by land, is told "Your selected forces go by sea: they board transports at a port" (`critic/shots/c40hs_desk_n33.png`, R40-N2). Unchanged: R39-N2 (no mark on touch, `critic/c40_tm_touch.json`; the tooltip cut at phone width, `critic/shots/c40hs_phone_n2.png`), R39-N3 (Escape leaves the mark, `critic/c40_mk_mixed_s2.json` `afterEsc`: `sel: 0`, mark still set), R32-N3 (rows cut mid-word). Not lowered: the false notice is the same class run 38 and 39 scored 7 with |
| Performance | 7 | 7 | **Rescored.** Suite Q alone: within run 38–39's spread (PF 120 m/px 34.5–39.1, 30 m/px 39.5–49.1; ten-year watches 59.8–60 fps, longest gap 83 ms; below). R28b's `overSea` now judges every selected division: 0.1 ms median, 0.2 ms max for all 33 of Japan's (`critic/c40_hp_hintperf.json` `asks`); with 16 or 33 selected and the cursor parked on Shanghai at top speed, 56–58 fps against 55 with none, p95 16.8 ms either way (`perf`; the machine was loaded by the headless queue at the time). **Not 8:** 37–47 fps at unit zoom on a year-20 world, as before |
| Stability | 7 | 7 | **Rescored.** Save of 7019 byte-identical; workerDeterminism the same end hash on all four of run 39's seeds and **new** 14011 `30c3bbe9` on every arm; checkers 0 broken on new seeds 14003 (heroes, 400 days; heroes+navy rules 10 years) and 14011 (random diplomacy) (`critic/c40_diploinv_14003s_h.log`, `critic/c40_diploinv_14011r.log`, `critic/c40_wi_14003_h10_hn.log`) and on run 39's list; the sea-order fuzz 0 stranded on every seed (`critic/c40_fz_*.json`); no page error in any page JSON. **Not 8:** R40-B1 (a redirected landing still splits and walks) |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Carried.** Z/PHZ/C re-run, view samples only differ (`critic/c40_z_13109.json`) |
| Naval warfare (needs 8) | 7 | **7** | **Rescored.** R39-B1's three cases fixed (Verdict; per-order replicas `critic/c40_now_bothfar.json`, `critic/c40_now_three_twofar.json`, `critic/c40_now_four_all_sw3.json` agree). **Not 8: R40-B1 and R40-B2 (blocking)**; R37-N2 unchanged; a division re-sent alone now sails at once and can no longer be recalled (R40-N1) |
| Tanks (needs 8) | 8 | 8 | **Carried.** C re-run, view samples only differ (`critic/c40_c_*.json`); TR phone identical (`critic/c40_tr_phone.json`); the TRAB headless jobs ran with no run-39 twin to compare (`critic/c40_trab_*.json`) |
| Aircraft (needs 8) | 8 | 8 | **Carried.** W/PL re-run (`critic/c40_w_*.json`) |
| AI nuclear use (needs 8) | 8 | 8 | **Carried.** AN re-run (`critic/c40_an_*.json`) |

## R28, case by case

Headless (`c40_ll.ts`, orders queued and applied in one batch, as the builder's tests do) and **the game's path**
(`c40_ll3.ts NOW=1 T0=1`: each order applied at once, as `hud.command` does; it reproduces the page). Seed 3517, Japan,
the divisions nearest Tokyo sent to Shanghai, re-ordered two hours after the first is aboard (h = landing hour).

| Item | Case | HEAD batch | HEAD game path | 99ba6c07 game path | Evidence |
|---|---|---|---|---|---|
| R28a | both re-sent to Fuzhou | 657/658, no notice | 656/657, **364 told "the rest keep the old landing"** | 1291/1291, told | `critic/c40_ll_bothfar.json`, `critic/c40_now_bothfar.json`, `critic/c40_wt_now_bothfar.json` |
| R28a | of three, two to Fuzhou | 657/658 (third 952) | 656/657 | 1293/791 | `critic/c40_ll_three_twofar.json`, `critic/c40_now_three_twofar.json` |
| R28a | four re-clicked 3 cells SW | together 1244, none refused | together 1244, **364, 365, 366 each told they "will not land with them"** | all four refused | `critic/c40_ll_four_all_sw3.json`, `critic/c40_now_four_all_sw3.json`, `critic/c40_wt_now_four_all_sw3.json` |
| R28a | the same by real click | — | together h1244; three LeftLanding rows | (run 39: refused) | `critic/c40_lwt5_four_allsw63.json` `news`, `critic/shots/c40lwt5_four_allsw63_notice_h35.png` |
| R28a | two by real click (paused) | — | together h682; 364 told the rest keep the landing | — | `critic/c40_mk2_nofresh2.json` |
| R28a | **a fresh one to Fuzhou first, then the two** (same hour) | all three 1292–1294; 364 walks Tokyo→Sasebo | **365 alone 657, 364 and the fresh one 1291** | 364, fresh 1291; 365 not landed in 60 d | `critic/c40_l3_steal_freshfuzhou.json`, `critic/c40_now_steal_freshfuzhou.json`, `critic/c40_wt_now_steal_freshfuzhou.json` (R40-B1) |
| R28a | the same, fresh one an hour / a day before | 1292 / 1316–1318 | — | 1292 / 1316 | `critic/c40_l2_steal_freshhourbefore.json`, `critic/c40_l2_steal_freshdaybefore.json`, `critic/c40_wt_l2_*` |
| R28a | the same by real click, seeds 3517, 14003, 14011 | — | 365 alone h682, 364 + fresh h1318; 364 "Marching to Sasebo" days 1–20 | — | `critic/c40_mk2_freshfirst.json`, `critic/c40_mk2_freshfirst_14003.json`, `critic/c40_mk2_freshfirst_14011.json`, `critic/shots/c40mk2_freshfirst_day10.png` |
| R28a | control: the two first, then the fresh one | 979/980 | 978/979 | 1293/791 | `critic/c40_l2_steal_leaversfirst_fz.json`, `critic/c40_now_leaversfirst_fz.json`, `critic/c40_mk2_leaversfirst.json` (h1006 together) |
| R28a | one click: the two and the fresh one | 979/980 (standing start of three: 976/977) | — | 1294/792 | `critic/c40_l2_click_plus_fresh.json`, `critic/c40_l2_fresh3_base.json` |
| R28a | paused: the two to Fuzhou and back to Shanghai in the same hour | land Shanghai 632/633 | — | — | `critic/c40_l2_there_and_back_samehour.json` |
| R28a | one aboard re-sent alone | sails at once, h151 | — | (run 39: walked, 1292) | `critic/c40_ll_13001_far.json`, `critic/c40_l2_aboard_alone.json` |
| R28a | …and recalled to Shanghai a day later | **refused `Aboard` (at sea), lands Fuzhou alone h150** | — | run 39: rejoined, 631/632 | `critic/c40_ll_back.json` (R40-N1) |
| R28a/c | four re-sent one an hour (or a day) apart | first alone h151, the three 1268 (four from a standing start ~1241–1266) | — | — | `critic/c40_l2_four_hourly.json`, `critic/c40_l2_four_daily.json` |
| R28c | two re-sent an hour apart | 151 and 658 (run 39: 1292/1294) | — | — | `critic/c40_ll_three_stagger.json` |
| R28a | a fresh one sent elsewhere in the same hour (either order) | leavers 657/658, fresh 453 | — | — | `critic/c40_l2_steal_freshfirst.json`, `critic/c40_l2_steal_leaversfirst.json` |
| R28b | the one aboard + a fresh one, two cells S | two marks (green kept, orange new), "2 landings…" | — | (run 39: one mark, "they keep their transports") | `critic/c40_mk_mixed_s2.json`, `critic/shots/c40mk_mixed_s2_hover.png` |
| R28b | box of 1, 2, 4, 16, 33 at hour 0 over Shanghai | one mark each; 33 includes 29 marching by land, still "go by sea… board transports" | — | — | `critic/c40_hs_desk.json`, `critic/shots/c40hs_desk_n33.png` (R40-N2) |
| R28b | the hint's cost | 0.1–0.2 ms for 33 | — | — | `critic/c40_hp_hintperf.json` |
| R28b | every `seaHint` mark of the scripted orders against where they landed | the mark's land cell is where each landed (e.g. Fuzhou 1704,444; SW3 1713,416) | — | — | `critic/c40_l2_*.json` (`HINT` events) |

## Blocking issues

1. **R40-B1. A landing redirected to a target another convoy already serves still walks to that convoy's port while its
   own ship sails there empty, and splits (R39-B1's remaining case).** Seed 3517, Japan: the two divisions nearest Tokyo
   sent to Shanghai (escort); 364 boards group 1136 at Tokyo, 365 is bound for group 1144. Paused, in the hour after,
   the player sends a fresh division (366, west of Tokyo) to Fuzhou, then selects the two of the landing and clicks
   Fuzhou too. By the game's path: 366's order makes a Fuzhou convoy at Sasebo (port 573); 364 — aboard 1136 at Tokyo —
   is put ashore and bound for group 1152 at Sasebo, and **group 1136 sails from Tokyo to Sasebo with nobody aboard
   (t6 → t122) while 364 walks there for ~50 days** (`critic/c40_l3_steal_freshfuzhou.json` trace,
   `[g1136@…m cp573]`); **365 lands alone at h657, 364 and 366 at h1291, 26 days apart**
   (`critic/c40_now_steal_freshfuzhou.json`). By real click in the page the same, on seeds 3517, 14003 and 14011: 365
   h682, 364 and 366 h1318; 364's panel reads "Marching to Sasebo to board transports" on days 1, 5, 10 and 20
   (`critic/c40_mk2_freshfirst.json`, `…_14003.json`, `…_14011.json`; `critic/shots/c40mk2_freshfirst_day10.png`: 364 at
   Shizuoka on 11 January). The hover over Fuzhou in the same frame says "The landing they already have: they keep their
   transports" (`critic/shots/c40mk2_freshfirst_panel_h4.png`). Three from a standing start land h976/977
   (`critic/c40_l2_fresh3_base.json`); the reverse order of the same two clicks lands all three h978/979
   (`critic/c40_now_leaversfirst_fz.json`). With the fresh one's order an hour or a day earlier, the same (1292,
   1316–1318, `critic/c40_l2_steal_freshhourbefore.json`, `…_freshdaybefore.json`). **Not new:** on `99ba6c07` the same
   walk, and 365 does not land in 60 days (`critic/c40_wt_now_steal_freshfuzhou.json`). **Blocking** because it is R39-B1's
   symptom — "a division at a dock with its ship walks for weeks" — on the obvious way to build a landing from two places,
   it splits one click's landing by 26 days with the first alone, and it contradicts R28a's claim ("a click that leaves a
   landing takes its ships with it"): the ship goes, the division walks. The same-target rule (SPEC §6.2, R21e: later
   orders for a target join its loading convoy's port) is the design; walking a division off a ship that is sailing to
   that very port is not. **Fix:** when a leaver aboard (or bound for) a group joins a convoy at another port, and its
   group is free to go there, it stays aboard and sails with it (or its group is offered first, as `comingTo` does for a
   group under way). AT: the fresh one first, then the two (same hour, and an hour before): all three land within a day
   of each other by ~h980; 364 never "Marching to Sasebo"; by the game's path (orders applied one at a time), not only by
   a queued batch.
2. **R40-B2. The game applies each division's order at once, so a whole-landing redirect tells every division but the
   last "the rest keep the old landing, and it will not land with them" — and they all land together.** `player.ts:333`
   sends one `hud.command` per selected division; `hud.ts:548` sends it with `now = true`; the worker then calls
   `sim.applyNow` for each (`server.ts`, `if (msg.now)`), so `applyPendingCommands` — with R28a's `noteLeaving` and R27c's
   `tellLandingsLeft` — runs once per division. When the first is told, the others still hold the old landing, so it
   is told the rest keep it. Real click, the four of a landing re-clicked three cells SW: LeftLanding for 364, 365 and
   366 at tick 25, the ticker row "Square infantry division 366: it leaves the landing it had for its new one; the rest
   keep the old landing, and it will not land with them", and all four land together h1244
   (`critic/c40_lwt5_four_allsw63.json` `news`, `final`; `critic/shots/c40lwt5_four_allsw63_notice_h35.png`). Two re-sent
   to Fuzhou by one paused click: 364 told so, both land h682 (`critic/c40_mk2_nofresh2.json`). The headless replica with
   each order applied at once reproduces it (`critic/c40_now_four_all_sw3.json`, `critic/c40_now_bothfar.json`); the same
   orders queued and applied as one batch, as every R25–R28 test does, tell nobody (`critic/c40_ll_four_all_sw3.json`,
   `critic/c40_ll_bothfar.json`). On `99ba6c07` by the game's path, the notice was told too (`critic/c40_wt_now_bothfar.json`)
   — run 39 judged it by the batch, wrongly. **Blocking** because the most basic redirect of a landing gives the player a
   false report of what will happen, in the class run 38 blocked on (R38-B1, a false "came ashore away"), and because
   R28a's whole-click judgement is not what the game runs: every AT of R25–R28 was proved on a path the player never
   takes. **Fix:** give a click's orders to the sim as one batch (queued for the hour, or one command carrying the
   selection), or let `tellLandingsLeft` judge after the whole click is in; and test the order news and landings through
   `hud.command` (now = true), not `sim.command`. AT: the four re-clicked three cells SW by real click: no LeftLanding;
   two re-sent to Fuzhou by one click: none; of three, the two sent away: both told (as now).

## Non-blocking issues (prioritised)

1. **R40-N1. A division re-sent alone now sails at once and cannot be recalled.** The one aboard sent alone to Fuzhou
   takes its own group (R28a) and sails within the hour; a recall to Shanghai a day later is refused `Aboard` and it
   lands alone at Fuzhou h150 (`critic/c40_ll_back.json`; run 39: it rejoined, 631/632). Re-sending a landing's
   divisions one by one at speed lands the first alone 3–5 weeks before the rest (`critic/c40_l2_four_hourly.json`:
   151, then 1268). Consistent with the rules, but the first click of a redirect now commits a lone division to sea with
   no warning.
2. **R40-N2. "Your selected forces go by sea" for a selection most of which march.** All 33 of Japan's land divisions
   selected, cursor on Shanghai: one mark and "they board transports at a port and land at the marked place"; 29 of them
   stand on the mainland and would march (`critic/c40_hs_desk.json`, `critic/shots/c40hs_desk_n33.png`). R28b counts
   landings but not those that are not going by sea; "{n} of {m} go by sea" would be true.
3. **R39-N2** unchanged: no mark on a touch screen (`critic/c40_tm_touch.json`: `before.mark: null`), and at phone width
   the tooltip runs off the screen (`critic/shots/c40hs_phone_n2.png`).
4. **R39-N3** unchanged: Escape empties the selection and the marks and tooltip stay (`critic/c40_mk_mixed_s2.json`
   `afterEsc`; the stale "The landing they already have" at "0 selected" in
   `critic/shots/c40lwt5_four_allsw63_notice_h35.png`).
5. **R39-N4** unchanged (`critic/shots/c40mk_mixed_s2_z30.png`).
6. **R37-N2** (a loaded landing waits for any later order to the same coast): see the FZ rows below.
7. **R37-N3, R37-N4, R36-N3, R32-N2, R32-N3, R31-N1, R31-N6, R32-N5**: unchanged (carried dimensions).

## Run 39's cases re-run

| Run 39 case | On HEAD (`76b88197`) | Evidence |
|---|---|---|
| R39-B1 (two re-sent to Fuzhou; of three, two; four three cells SW) | **Fixed** in outcome (657/658; 657/658; together 1244, none refused) by both paths; but see R40-B1, R40-B2 | `critic/c40_ll_*.json`, `critic/c40_now_*.json`, `critic/c40_lwt5_four_allsw63.json` |
| R39-B1 trace (`c39_tied`) | 364 stays aboard 1136 at Tokyo, 365 boards 1144 there; both groups carry them to Fuzhou, none left idle | `critic/c40_tied_two_fuzhou60.json` |
| R39-N1 (the mark speaks for the first) | **Fixed**: two marks, "2 landings…" | `critic/c40_mk_mixed_s2.json`, `critic/c40_mk_mixedlow_s2.json` |
| R39-N2, R39-N3, R39-N4 | Unchanged | above |
| R38-N1's notice | now short; but told falsely on whole redirects (R40-B2) | `critic/c40_lwt5_four_allsw63.json` |
| ll (11 cases) | changed as R28 intends: see the R28 table; `back` now refused at sea (R40-N1) | `critic/c40_ll_*.json` |
| lwt, lwt2–lwt5 page cases | identical but tooltip/notice words and mark shape (`how` gone from the mark); lwt3 two_far_fuzhou: the one aboard sails on its own group (run 39: walked to Sasebo) | `critic/c40_lwt*.json` |
| AI worlds: headless 7019 × 20, HO, workerDeterminism | save byte-identical; hashes identical | `critic/c40_seed7019_y20.bin`, `critic/c40_wd_*.log`, `critic/c40_ho_*.json` |
| Page suites A, B1, C1, L, N, N2, New, R, R2 | see the twin list below | `critic/c40_suite*.out` |
| Q alone: PF 7019 y20, LW 6151, LWHON 3517, G 4877, LW 13109 | see below | `critic/c40_pf_7019.json`, `critic/c40_lw_*.json` |

**Twins** (`critic/scripts/c40_ident.py`, each c40 JSON against its c39 twin with timings and shot names stripped;
`critic/c40_ident.txt`): **200 identical, 75 differ, 83 new.** The differences are (a) R28's intended changes: the re-order
and landing cases (`ll_*`, `ash*`, `r25_near_s8_2`, `r25_12007_far_fuzhou_2`, `lwt3_*`, `tied_two_fuzhou60`: the one aboard
re-sent alone now sails on its own group) and the sea-order fuzz (`fz_*`: 0 stranded on every seed, fewer `NoTransports`
refusals, e.g. 11071 ENG 37 → 30, 10853 ENG 14 → 9); (b) R28b's shape of the mark (`how` gone from the mark; `mk_*`,
`lwt*`, `tm_touch`); (c) the page-clock-only list run 38 and 39 gave (A notes, C/SB/W/Z view samples, DF samples, SN steps,
HT boot time, C 13519 `engagedWeek2` 15 vs 14 on the page clock); (d) the probes' own artefacts: OS2 `newMagic` reads a
file named after the run (`c40_critic_standoff…`, written by no probe this run), and headless 7019/13007 rows differ only
in timings (both saves byte-identical: `cmp critic/c40_seed13007_y18.bin critic/c39_seed13007_y18.bin`). No page error in
any of the 129 page JSONs. **Checkers:** every diploInvariants, worldInvariants and heroWaits log of run 39's list and the
new seeds 14003/14011: **0 broken** (`critic/c40_diploinv_*.log`, `critic/c40_wi_*.log`, `critic/c40_herowaits_*.log`).
R37-N2: `critic/c40_fz_12203_usa.json` identical to run 39 (one aboard 889 h); `critic/c40_fz_13211_usa.json` as run 39.

**Suite Q alone:** PF 7019 y20 (min–max fps, worst p95) — 3,000 m/px 60–60.1, 18.4 ms; 1,200 58.8–60.1; 600 60–60.2;
**120: 34.5–39.1** (run 39 37.0–39.1, run 38 36.7–42.2); **30: 39.5–49.1** (run 39 40.9–47.4) (`critic/c40_pf_7019.json`).
LW 6151 59.8–60 fps, longest gap 83 ms, none over 500 ms, 293.2 s (run 39 67 ms, 295.6 s); LWHON 3517 59.9, 83 ms,
299.0 s (run 39 297.5 s); LW 13109 59.9–60, 83 ms, 296.0 s (run 39 291.8 s) (`critic/c40_lw_*.json`,
`critic/c40_lwhon_3517.json`). G 4877: `placed`, `pendingText`, `afterCancelPending`, `loaded` and the rest identical to
run 39; both runs end on the same probe timeout waiting for days to pass after the load (`fatal` in
`critic/c40_g_4877.json` and `critic/c39_g_4877.json`; run 39's report did not say so) — a probe limit, not judged.

## Design objections (none blocking, no score lowered)

- The same-target rule sends every division for a target to one convoy's port, however far: with R28a it now meets a
  division's own transports going the same way, and the rule wins over the ship (R40-B1). A landing could be the set of
  convoys bound for one target, each sailing from its own port and meeting off the coast.
- Orders applied at once, one division at a time (`hud.command` with `now`), make "a click" a notion the sim never sees;
  R21e, R25b, R27c and R28a each wrote rules about the click. One command per click carrying the selection would make
  the click real to the sim.
- Run 33–39's objections stand.

## Ideas from other games (not scored)

- Hearts of Iron assigns a naval invasion its transports as one operation; adding a division to it, or retargeting it,
  re-plans the operation and its ships together.
- Supreme Ruler shows a pending order's whole plan (the ports, the sailing, the arrival day) before it is confirmed; an
  arrival date in the landing tooltip would have shown R40-B1 at the click.

## Strengths (verified)

- R28b's marks: one source of truth with the order — every `seaHint` mark of the scripted orders is the land cell they
  landed on (`critic/c40_l2_*.json` `HINT` vs `landed`), the kept landing green and the new orange, cheap (0.2 ms for 33).
- The isolation of the AI: R28 touched the tick, the world and movement, and the 20-year save of 7019 is byte-identical,
  workerDeterminism the same on five seeds.

## Notes

- **The page and the batch replica differ, and the page is right.** The headless re-order scripts (run 39's and the
  builder's tests) queue a click's orders and apply them in one batch; the game applies each at once. `c40_ll3.ts NOW=1`
  is the faithful replica (it gives the page's split and notices); `T0=1` gives the first orders at tick 0, as the page.
- **Not tested:** a selection whose lowest-id land division does not go by sea (R28b takes `how` from the first by sorted id, so no mark and no by-sea tooltip would show while the rest sail). Japan's home divisions have the lowest ids (`npx tsx critic/scripts/c40_hintlist.ts 3517 1715.5 413.5`: 364–367 by sea, 368–396 by land; `critic/c40_hintmix_3517_sh.json`), so it was not reachable here. Flagged, not scored.
- The worktree `critic/wt` at `99ba6c07` was used for the replays and removed at the end (its `node_modules` junction
  unlinked first).
