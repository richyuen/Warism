# Critic report, run 39 (full) — after R26 and R27

- **Mode: full.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). Condition 2 of a focused run fails:
  the report commit `aea313ba` ("Critic run 38 (focused) … R26 filed") filed **R26** only; **R27** was filed by
  `a47aceb9` ("ADR-827 accepted (the user) … R27 filed"), not by a report commit, and R27a `d6d7a71c`, R27b `3cc93a81`
  and R27c `3ec90a26` all change `src/` (amphibious, movement, tick, world, server, MapView, markers, game, hud,
  MapTooltip, en.json). So the whole brief, every dimension rescored, nothing carried.
- **Commit judged:** `99ba6c0754c4e50cd857501caff07ca6dacd5476` (HEAD at the start, `critic/c39_commit.txt`).
  **Date:** 2026-11-05.
- **Build:** `vite build --outDir critic/c39_dist`, exit 0 (`critic/c39_build.log`), served by `vite preview` on
  127.0.0.1:**5299** (`critic/c39_preview.log`). Chromium through Playwright, headless; desk 1600 × 900, phone 390 × 844
  (and a `hasTouch` phone context, new).
- **Runs:** run 38's 175 headless jobs (`critic/scripts/c39_jobsMain.txt` = run 38's Q, P, P2, R25 and New lists;
  log `critic/c39_jobsMain.log`); run 38's page suites A, B1, C1, L, N, N2, R, R2, R3, R5 and Q (Q alone on the machine,
  last); new: 22 jobs on new seeds 13007–13519 (`critic/scripts/c39_jobsNew2.txt`, log `critic/c39_jobsNew2.log`), page
  suite New on the same seeds (`critic/scripts/c39_suiteNew.sh`), and R26/R27 attack probes:
  `c39_mk_mark.mjs` (the landing mark at four zoom tiers, Escape, mixed selections, desk and phone),
  `c39_tm_touch.mjs` (touch screen; the hover's ask rate at top speed), `c39_ll.ts` (scripted re-orders about a
  landing, 11 cases, `critic/c39_jobsLL.log`), `c39_tied.ts` (what becomes of a landing's own transports),
  `c39_comp.ts` (the land components and `landingOf` around Shanghai), and `c39_lwt5.mjs` with a click three cells
  south-west. Comparison: `critic/scripts/c39_ident.py` (each c39 JSON against its c38 twin, timings and shot names
  stripped). A worktree at run 38's commit (`critic/wt`, `a54afc77`) replayed the new naval cases.
- **Baseline: R26 and R27 left every AI world alone.** The year-20 save of 7019 made on HEAD is byte-identical to run
  38's (`cmp critic/c39_seed7019_y20.bin critic/c38_seed7019_y20.bin`), and its per-year rows equal but for timings
  (`critic/c39_headless_7019.json`); the twenty-year worlds of run 38's seeds identical (`critic/c39_ho_*.json`);
  AN 7019/6299/11003, HI and DL identical. Of the c39 JSONs with a c38 twin, all are identical except: the landing
  cases whose tooltip now carries R27b's words (`tooltip`, `act.tip`; listed below), R38-B1's cases (fixed), and the
  same page-clock-only list run 38 gave (A notes, C/SB/W/Z view samples, DF samples, FW2 cases, HT boot time). OS2
  differs because run 38's own run of it failed on a missing file (`critic/c38_os2_c25.json`); it now loads
  (`critic/c39_os2_c25.json`). No page error in any page JSON.

## Verdict

**R38-B1 is fixed and R27's mark does what its AT says — for a mouse, and for one division at a time.** The one aboard,
re-clicked 42 px south of Shanghai, stays aboard; both land h632 and no news is told (`critic/c39_lwt5_two_s42.json`,
`news: []`); all four re-clicked there land h1241–1244 with no news (`critic/c39_lwt5_four_alls42.json`). The landing
is now marked while chosen — orange for a new landing, green for the one the division has — at every zoom tier on the
desk (`critic/shots/c39mk_mixed_s2_z3000.png`, `…_z600.png`, `critic/shots/c39mk_mixed_s2_hover.png`). R38-N1's
notice now names which landing is left.

**One blocking issue, found this run and present on run 38's commit too: a landing the player redirects abandons its
own transports** (R39-B1). Two divisions loading at Tokyo for Shanghai, both sent to Fuzhou by one click: the two
transport groups that were theirs lie empty at Tokyo for the whole 54 days while both divisions walk the length of Japan
to Sasebo; they land at h1291, where the same two sent to Fuzhou from a standing start land at h657. With a third
division keeping Shanghai's landing, the same click to Fuzhou lands its two 21 days apart, the first alone. Four
re-clicked three cells south-west — a landing the new mark shows in orange — are all refused "no transports", their own
transports a march away. The mark R27 added makes the request plain; the order then does something no player would
choose. **Naval stays 7, under its bar of 8.** Every other dimension holds where it was; the four 8s are re-earned on
new seeds, not carried.

## Scores

| Dimension | Run 38 | Run 39 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | **Rescored, unchanged.** Run 38's cases identical: HF 5521 desk/phone and 7019, SK 1212/8123/11149, HS 3517/3739, Z 3517/8123/11003 (view samples only) (`critic/c39_hf_5521_desk_d0_0.json`, `critic/c39_sk_11149.json`). New seeds: Z 13109 down to 3 m/px, 18 steps, the element count falling 7,960 → 84 and individual soldiers 13,830 → 4,411 below 30 m/px (`critic/c39_z_13109.json`); SK 13313, HF 13007 desk, no error. R27b's mark reads over Japan's yellow and the markers (orange/green over a dark edge, `critic/shots/c39mk_mixed_s2_z600.png`). **Not 8:** run 37's reasons stand (hero counters over Europe, R31-N1/N2; the label pile at 250 m/px); at 30 m/px the tooltip promises "the marked place" with the mark off-screen (`critic/shots/c39mk_mixed_s2_z30.png`) |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | **Rescored, unchanged.** Checkers on **new seeds**, 0 broken: diploInvariants 13007 (heroes), 13109 (random diplomacy), 13211 (random world), 13313 (`critic/c39_diploinv_13*.log`); worldInvariants 13007 heroes+navy 20 y, 13109 random 10 y, 13211 random world 5 y, 13313 20 y, 13417 air 20 y; heroWaits 13007 (`critic/c39_wi_13*.log`, `critic/c39_herowaits_13007.log`); run 38's checker runs again 0 broken (`critic/c39_diploinv_*.log`, `critic/c39_wi_*.log`). Relations graph on 13109: 67 nodes, war 7, alliance 11, guarantee 8, puppet 40, matching the sim's truth in the same JSON (`critic/c39_rg_13109_desk.json`). **Not 8:** run 30's list (bond exit, guarantees, a refused peace untold) untouched; R37-N4 labels still collide ("AustraliaUnited Kingdom", "French West Afri", `critic/shots/c39rg_13109_desk_d0.png`) |
| Emergent world dynamics over long runs | 7 | 7 | **Rescored, unchanged.** All 20-year worlds of run 38's seeds identical (`critic/c39_ho_*.json`), so run 38's reading stands; four **new** 20-year worlds (13007, 13109 off; 13313, 13417 heroes on, `critic/c39_ho_new_*_13*.json`) and headless 13007: 80 nations living at year 20, 9 founded, 18,234 cells flipped, the Soviet Union 28 % and the USA 15 % (`critic/c39_headless_13007.json`). Run 37's reasons stand |
| God Mode | 7 | 7 | **Rescored, unchanged.** A 4219/8999/11213 (notes order only), Q 6421/8807/11287, K/K2/K3 identical. **New seeds:** A 13007 (an H-bomb on Paris and an A-bomb on London, alert and rows, 3.3 M and 314 k killed, `critic/shots/c39a_13007_20_paris_150m_day10.png`), Q 13211 (revolt, spawn and the rest, ticker rows, `critic/c39_q_13211.json`), K 13109: a Breakthrough at peace still does nothing and says nothing (`critic/c39_k_13109.json`, `before`=`after`, R37-N3) |
| Editor and scenarios | 7 | 7 | **Rescored.** OS2 now loads the standoff scenario (run 38's run of it failed on a missing file, `critic/c39_os2_c25.json`); G 4877 alone in suite Q: placing GER/ENG/POL forces, the pending scenario text, cancel and load identical to run 38, no error (`critic/c39_g_4877.json`). **Not 8:** save format 2 still refuses older scenarios (objection, run 33) |
| Stats and history | 7 | 7 | **Rescored, unchanged.** HI and DL on 7019 y20 and 11003 y18 identical; **new** 13007 y18: History opens in 169 ms with 3,263 events and 29 kinds, CSV 3,265 lines and JSON export (`critic/c39_hi_13007.json`, `critic/c39_dl_13007.json`). SHM ten identical (no History row for a jump home) |
| UI/UX and polish | 7 | 7 | **Rescored.** R38-N1's notice now says which landing is left (`critic/c39_lwt3_two_far_fuzhou.json`), though it reads heavily ("it leaves the landing it had, whose transports stay for the rest, for others bound for its new landing; it will not land with the rest"). New, R27b: the mark and its tooltip stay after Escape clears the selection while paused ("0 selected", `critic/shots/c39mk_aboard_s2_afterEsc.png`, R39-N3); on a touch screen there is no mark at all before the tap (`critic/c39_tm_touch.json`, R39-N2); the mark speaks for the first selected division only, and its words "they keep their transports" are false for the others (R39-N1). Ticker rows still cut mid-word (R32-N3, `critic/shots/c39lwt5_four_allsw63_act.png`); R37-N4 unchanged |
| Performance | 7 | 7 | **Rescored.** Suite Q alone on the machine at the end, within run 38's spread: PF 7019 y20 60 fps at 3,000–600 m/px, 37.0–39.1 at 120 and 40.9–47.4 at 30, p95 ≤ 18.4 ms (run 38: 36.7–42.2, 39.1–49.8, ≤ 18.5) (`critic/c39_pf_7019.json`); ten-year watches 59.9–60 fps, longest gap 67–83 ms, LW 6151 295.6 s, LWHON 3517 297.5 s (run 38: 289.5 s, 297.4 s), and **new seed** 13109 ten years at 59.9–60 fps, longest gap 83 ms, no gap over 500 ms (`critic/c39_lw_6151.json`, `critic/c39_lwhon_3517.json`, `critic/c39_lw_13109.json`). **Not 8:** 37–47 fps at unit zoom on a year-20 world, as before. R27b's hover is asked once a second at top speed with the cursor over a landing (0.99/s; 0 without a selection), 58–60 fps either way (`critic/c39_tm_touch.json`) |
| Stability | 7 | 7 | **Rescored.** No page error in any page JSON; run 38's 175 headless jobs and this run's 22 new-seed, 11 re-order and 3 baseline jobs, judged by their content, not their exit codes (a first attempt of the re-order jobs logged exit 0 through `npx` while each script had died on its argument, so exit codes are not relied on): every one of the 128 c38-twinned headless JSONs identical, the new-seed JSONs complete (20 of 20 years in each `critic/c39_ho_new_*_13*.json` and `critic/c39_headless_13007.json`); 41 checker runs, 0 broken; workerDeterminism the same end hash on every arm for 3517 (`7e113d94`), 11071 (`d2716b65`), 12007 (`39503469`, as run 38) and **new** 13109 (`7ca6d729`) (`critic/c39_wd_*.log`); sea orders fuzzed on six new seeds × 120 days, nothing stranded (`critic/c39_fz_13*.json`, `strandedN: 0`). **Not 8:** a redirected landing leaves its own ships idle and splits (R39-B1) |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Rescored on new seeds.** Run 38's Z 3517/8123/11003 and PHZ 2671/8233/11071 identical but view samples. **New:** Z 13109, 6,000 → 3 m/px in 18 steps with no error, elements from 1,573 m/px and individual soldiers from 28 m/px (`critic/c39_z_13109.json`); PHZ 13109 40 days, no error (`critic/c39_phz_13109.json`); C 13519 at 80 and 10 m/px: German armour and infantry labelled divisions at 80 m/px fold into tank balls with turrets and helmets at 10 m/px, wings over them, with the division tags still on (`critic/shots/c39c_13519_arm_0080m.png`, `critic/shots/c39c_13519_arm_0010m.png`). 8 kept: one seamless camera from the world to a soldier, on seeds it was never tuned on |
| Naval warfare (needs 8) | 7 | **7** | **Rescored.** R38-B1 fixed (Verdict); the landing mark agrees with the order for one division (`critic/c39_mk_mixed_s2.json` `zoom`, and the green "landing they already have" for the one aboard). Run 38's 29 R25 attack jobs and its landing ladder identical, but tooltips (`critic/c39_jobsMain.log`); sea battle SB 7019 and planes PL identical; navy rules 0 broken 20 years on new seed 13007 (`critic/c39_wi_13007_h20_hn.log`). **Not 8: R39-B1 (blocking)** — a redirected landing abandons its transports — and R39-N1 (a mixed selection lands apart from the mark) |
| Tanks (needs 8) | 8 | 8 | **Rescored on new seeds.** C 6421/7019/8573/11071/11287 identical but view samples; **new** C 13313 and 13519: Germany against Poland, armoured divisions 40 and 42 in contact on day 5, read as divisions at 80 m/px and as tank balls with turrets and tracks at 10 m/px, no error (`critic/c39_c_13519.json`, `critic/shots/c39c_13519_arm_0080m.png`, `…_0010m.png`, `critic/c39_c_13313.json`) |
| Aircraft (needs 8) | 8 | 8 | **Rescored on new seeds.** W 7019/8431/11149 identical but view samples; air rules 9311 and **new** 13417 (heroes, random diplomacy, 20 y) 0 broken (`critic/c39_wi_13417r_h20_air.log`); **new** W 13417: a fighter from Gütersloh ordered, followed, 54 of 59 samples aloft with its mark, median 32 px from its sorties at 3,000 m/px (`critic/c39_w_13417.json`); PL 13417 Germany–Poland from 3,000 to 25 m/px, both looks (`critic/c39_pl_planes.13417_GER_POL_5299.log`) |
| AI nuclear use (needs 8) | 8 | 8 | **Rescored.** AN 7019 y20, 6299 y18, 11003 y18 the same strikes as run 38 (e.g. China on the USA near Belfast, alert and row, `critic/c39_an_7019y20.json`); **new** 13007: one AI decision in 20 years (the Soviet Union on the UK, year 9), intercepted (`critic/c39_headless_13007.json` `nukeLog`), and none in the 400 h watched at year 18 (`critic/c39_an_13007y18.json`) — restraint, as the design asks |

## R26 and R27, case by case

| Item | Case | Result | Evidence |
|---|---|---|---|
| R26a (R38-B1) | the two; the one aboard re-clicked 42 px S of Shanghai (real click) | **fixed**: kept, both land h632, no news, no row | `critic/c39_lwt5_two_s42.json` |
| R26a | the four, all re-clicked 42 px S | **fixed**: land h1241–1244, no news | `critic/c39_lwt5_four_alls42.json` |
| R26a | headless: the one aboard and one walking re-clicked near in the same hour (seed 13001) | land together 631/632 | `critic/c39_ll_13001_twonear.json` |
| R26b (R38-N1) | Fuzhou, the one aboard | the notice names the landing left; still marching to Sasebo for weeks | `critic/c39_lwt3_two_far_fuzhou.json` |
| R27a/b | Shanghai hovered with the first of Japan's divisions selected, 3,000 / 600 / 120 / 30 m/px | the same mark (water 1715,412, land 1715,411) at each tier, "land at the marked place" | `critic/c39_mk_mixed_s2.json`, `critic/shots/c39mk_mixed_s2_z*.png` |
| R27b | the one aboard selected, cursor two cells S | green, "The landing they already have"; the order keeps it | `critic/c39_mk_aboard_s2.json`, `critic/shots/c39mk_mixed_s2_hover.png` |
| R27b | the one aboard **and a fresh division** selected, two cells S | green mark, "they keep their transports and land at the marked place"; the fresh one (366) boards at Sasebo and lands **alone at h470, 4 cells S of the mark**, the others h656; no news | `critic/c39_mk_mixed_s2.json` (R39-N1) |
| R27b | Escape, paused, cursor still | selection 0, the mark and "Your selected forces…" stay | `critic/shots/c39mk_aboard_s2_afterEsc.png` (R39-N3) |
| R27b | phone, `hasTouch`, a tap on Shanghai | no mark before the tap (none can be: the hover is mouse only, `MapView.ts` pointerType check); the order goes | `critic/c39_tm_touch.json`, `critic/shots/c39tm_before.png` (R39-N2) |
| R27b | phone width with a mouse | the tooltip runs off the right edge, its landing words cut | `critic/shots/c39mk_phone_s2_hover.png` |
| R27c | whole click of two sent to Fuzhou | no LeftLanding (right); both walk to Sasebo, land h1291 (standing start: h657) | `critic/c39_ll_bothfar.json`, `critic/c39_base_fuzhou_2.json` (R39-B1) |
| R27c | of three, two sent to Fuzhou in one click | both told LeftLanding; they land h791 and h1293 | `critic/c39_ll_three_twofar.json` (R39-B1) |
| R27c | the same two, one hour apart | told each; land 1291/1293 | `critic/c39_ll_three_stagger.json` |
| R27c | the walker sent to Fuzhou at hour 2, before anyone aboard | told; the partner lands alone h123 as ordered | `critic/c39_ll_walkerfar_h2.json` |
| R27c | the one aboard to Fuzhou and back to Shanghai a day later | told once; rejoins, lands 631/632 | `critic/c39_ll_back.json` |
| R27c | both sent apart in one hour (Fuzhou; 7 cells S) | nobody left behind, nobody told; each lands where sent | `critic/c39_ll_split2.json` |
| R27c | four, three walkers re-clicked one cell SE | kept, land 1241–1242 | `critic/c39_ll_four_walk_se2.json` |
| R27c | four, all re-clicked three cells SW (real click: the orange mark there) | **all four refused** (18, and 6 "no transports … with room") | `critic/c39_ll_four_all_sw3.json`, `critic/c39_lwt5_four_allsw63.json`, `critic/shots/c39lwt5_four_allsw63_act.png` (R39-B1) |

## Blocking issues

1. **R39-B1. A landing the player redirects abandons its own transports.** Seed 3517, Japan, the two divisions nearest
   Tokyo sent to Shanghai (escort): 364 boards group 1136 at Tokyo, 365 is bound for group 1144. Two hours after 364 is
   aboard, both are sent to Fuzhou by one click. Both orders are taken; 364 goes ashore and is bound for group 1151,
   365 for 1152, both at Sasebo. From that hour **1136 lies at Tokyo, empty, its convoy gone, for the 54 days of the
   trace, and 1144 joins it there at t77** — while 364 marches from Tokyo's dock to Sasebo and 365 past Tokyo the other
   way (`critic/c39_tied_two_fuzhou60.json`, `critic/c39_tied_two_fuzhou.json`). They land at Fuzhou at h1291
   (`critic/c39_ll_bothfar.json`); the same two sent to Fuzhou from a standing start land at h657
   (`critic/c39_base_fuzhou_2.json`): the redirect doubles the time, and the player's own ships sit idle behind them.
   The same seam shows two more ways: (a) with a third division keeping Shanghai's landing, the two sent to Fuzhou by one
   click are put on one group, which sails with 365 alone at ~h710: they land at h791 and **h1293, 21 days apart, the
   first alone** (`critic/c39_ll_three_twofar.json`) — against "one click, one port, one sailing" (SPEC §6.2, R21e) and
   the class of split landing that was blocking in run 37 (R37-B1); (b) the four of a landing, all re-clicked three
   cells south-west — where the new mark draws the landing in orange and the tooltip says they "land at the marked
   place" — are **all refused**: 364 "its transports are loading for another landing, and no others with room are at a
   port it can reach", the three others "no transports of its nation with room for it are at a port it can reach"
   (`critic/c39_ll_four_all_sw3.json`; by real click `critic/c39_lwt5_four_allsw63.json`,
   `critic/shots/c39lwt5_four_allsw63_act.png`), the transports in question being their own, which all four were leaving.
   The panel says only "Marching to Sasebo to board transports" (`critic/c39_lwt3_two_far_fuzhou.json`). **Not new in
   R27:** the same trace, landings and refusals on run 38's commit `a54afc77` (`critic/c39_tied_two_fuzhou_a54.json`,
   `critic/c39_ll_three_twofar_a54.json`, `critic/c39_ll_four_all_sw3_a54.json`); it is first seen this run, by the
   full run's attack on what R27 invites — the player now sees the landing he picks, so changing it is the obvious next
   act. **Blocking** because changing a landing is the core of the player's naval control, the result is one no player
   would choose (a division at a dock with empty ships walks 50 days), a click splits into landings three weeks apart,
   and a refusal names "no transports" where the click's own stand idle. **Cause, read:** `orderMove`/`orderAshore`
   choose transports for each division while its old transports are still that landing's (it is aboard, or the convoy
   is loading for the old target); once all have left, the groups are free, but a later order does not prefer them: the one sent an hour after joins the first's new convoy at Sasebo by the same-target rule (`critic/c39_ll_three_stagger.json`), and the freed ships at Tokyo stay idle. **Fix:** when an
   order takes divisions off a landing, offer that landing's own transports first (or release them before the
   choice), so the click that leaves a landing takes its transports with it. AT: the two, both re-sent to Fuzhou two
   hours after the first boards: they sail from Tokyo on their own groups and land within a day of each other and
   within ~h700 (red: h1291); of three, two to Fuzhou: land within a day of each other; the four re-clicked three cells
   south-west: no refusal, land together.

## Non-blocking issues (prioritised)

1. **R39-N1. The mark speaks for the first selected division, and its words for all.** The one aboard (364) and a fresh
   division (366) selected, the cursor two cells south of Shanghai: green, "The landing they already have: they keep
   their transports and land at the marked place". On the click 364 keeps Shanghai's landing; 366 marches to Sasebo,
   boards other transports and lands **alone at 1715,415 at h470**, four cells from the marked land and 186 h before the
   others, told nothing (`critic/c39_mk_mixed_s2.json`, `critic/shots/c39mk_mixed_s2_hover.png`). SPEC §9.3 makes the
   mark the first division's answer; the tooltip's "they keep their transports" is not true of the selection.
2. **R39-N2. No mark on a touch screen.** The hover that asks for the landing is mouse-only (`MapView` hover handler
   returns on `pointerType !== 'mouse'`); with `hasTouch` the mark is null before the tap and the order goes at once
   (`critic/c39_tm_touch.json`, `critic/shots/c39tm_before.png`). A phone player still clicks blind, the thing ADR-827
   set out to end. With a mouse at phone width the tooltip runs off the screen (`critic/shots/c39mk_phone_s2_hover.png`).
3. **R39-N3. Escape leaves the mark.** Paused, the cursor still: Escape empties the selection ("0 selected") and the
   orange mark and "Your selected forces go by sea…" stay until the mouse moves (`critic/shots/c39mk_aboard_s2_afterEsc.png`).
4. **R39-N4. At unit zoom the tooltip points at a mark that is off the screen** (30 m/px, the landing ~2 cells away:
   `critic/shots/c39mk_mixed_s2_z30.png`).
5. **R38-N1's notice** is now true but long and hard to parse (above).
6. **R37-N2** (a loaded landing waits for any later order to the same coast) — unchanged (`critic/c39_fz_12203_usa.json` identical to run 38's); on new seed 13211 (the USA) one aboard 870 h and one bound 1,795 h (`critic/c39_fz_13211_usa.json`, `worstAboardStill`, `worstBound`).
7. **R37-N3** Breakthrough at peace silent (again on new seed 13109); **R37-N4** relations graph labels collide (again
   on 13109) — unchanged.
8. **R36-N3**, **R32-N2**, **R32-N3** (rows cut mid-word), **R31-N1**, **R31-N6**, **no default in AI play**,
   **R32-N5** — unchanged.

## Run 38's cases re-run

| Run 38 case | On HEAD (`99ba6c07`) | Evidence |
|---|---|---|
| R38-B1 (the near re-click told "came ashore away") | **Fixed**, two and four | `critic/c39_lwt5_two_s42.json`, `critic/c39_lwt5_four_alls42.json` |
| R38-N1 (R25b's notice backwards) | **Fixed** in meaning; long | `critic/c39_lwt3_two_far_fuzhou.json` |
| R37-N2 | **Unchanged** (12203 identical; new 13211: 870 h aboard) | `critic/c39_fz_*.json` |
| R37-N3, R37-N4 | Unchanged | `critic/c39_k_11003.json`, `critic/c39_rg_11213_desk.json` |
| lwt5 ×4, lwt4 ×6, lwt3 ×2, lwt2 ×7, lwt ×4 | the same landings and refusals; tooltips now R27b's words; R38-B1's news gone | `critic/c39_lwt*_*.json` |
| ash, ashp, ash_bound, wait, pm, ps, lmchk, lh, lh2, swe, fz, R25 jobs (the headless list) | all 128 identical (the R25 near-click ladder lands together as in run 38) | `critic/c39_ash*.json`, `critic/c39_r25_*.json`, `critic/c39_jobsMain.log` |
| HO ten off / five on, the four 20-year seeds of run 37, def 8123, headless 7019 × 20, workerDeterminism 3517 / 11071 / 12007 | identical (save byte-identical; per-year rows differ only in timings); workerDeterminism as run 38 | `critic/c39_ho_*.json`, `critic/c39_headless_7019.json`, `critic/c39_wd_*.log` |
| HF, HFT, RGT, HS ×2, HT, HWP, DF, A ×3, Q ×3, K/K2/K3, K 11003, Z ×3, C ×5, PHZ ×3, HI ×3, DL ×2, AN ×3, SB, PL ×2, P, U, RG ×2, BT, FW2, TR, SK ×3, W ×3, NR ×4, LP ×5, SN ×2, SSB, PST, LWP ×2, SHM | identical, or differ only in samples on the page's clock (the list run 38 gave); OS2 now loads | `critic/c39_*.json` |
| LWT2/LWT3 Fuzhou phone | exit 1 as in runs 37 and 38 — not a case (the centre tap selects division 388) | `critic/c39_suiteR2.out`, `critic/c39_suiteR3.out` |
| Q alone: PF 7019 y20, LW 6151, LWHON 3517, G 4877 | PF fps (min–max, worst p95) by m/px — 3,000: 60–60.1, 18.4 ms; 1,200: 58.8–60.1; 600: 60–60.2; **120: 37.0–39.1** (run 38 36.7–42.2); **30: 40.9–47.4** (run 38 39.1–49.8). LW 6151 59.9–60 fps, 67 ms, 295.6 s; LWHON 3517 59.9–60, 83 ms, 297.5 s. G 4877: `placed`, `pendingText`, `afterCancelPending: 0`, `loaded`, `errors: []` identical to run 38 (`marks` only) | `critic/c39_pf_7019.json`, `critic/c39_lw_6151.json`, `critic/c39_lwhon_3517.json`, `critic/c39_g_4877.json` |

## Design objections (none blocking, no score lowered)

- The mark is the first selected division's answer (SPEC §9.3, R27b "Not chosen"). A box of divisions half of which
  have a landing makes two landings under one mark (R39-N1). Marking each distinct landing of the selection, or saying
  "2 landings" in the tooltip, would keep ADR-827's promise for a selection.
- A landing is held by its transports, not by the click: the abandoned-transports seam (R39-B1) is the same "three
  cells that each rule measures from" run 38 described, moved from the news to the transports.
- Run 33–38's objections stand: an ally's coast refused as "a nation outside its wars"; the jump home across the sea;
  save format 2 refuses older scenarios; a phone tap on a held city selects one's own division there.

## Ideas from other games (not scored)

- Hearts of Iron keeps a naval invasion as one operation whose transports are assigned to it; changing the target
  re-plans the operation with the same ships.
- Supreme Ruler and Hearts of Iron both show the plan on a touch long-press before it is confirmed; a long-press preview
  of the landing would carry R27b to phones.

## Strengths (verified)

- The determinism and isolation of the AI: R26–R27 touched the tick, the world and movement, and the 20-year save of
  7019 is byte-identical to run 38's, every 20-year world identical, the checkers 0 broken on five new seeds.
- The landing mark on a desk: one source of truth with the order (the worker's `landingFor`), readable over Japan's
  yellow at every tier, and green for the kept landing exactly when the order keeps it (`critic/c39_mk_aboard_s2.json`).

## Notes

- **Run 38's shots partly overwritten.** Run 38's probes named some shots `c38lwt5_…`, `c38lwt4_…`, `c38hwp_…` and the
  like (no underscore after the run number), and the first hour of this run's copies, made by replacing `c38_`, kept
  those names: shots of suites R5, R3, R and A from this run overwrote run 38's of the same name (`critic/shots/` is
  untracked). Fixed mid-run (`c38` + letter → `c39` in every c39 script); the overwritten files now show HEAD. The
  JSONs of both runs are intact. The four-south-west case's shots were copied to `critic/shots/c39lwt5_four_allsw63_*`.
- The worktree `critic/wt` at `a54afc77` was used for the three naval replays and removed at the end.
