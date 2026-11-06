# Critic report, run 44 (full): after R33, "the landing as one object"

- **Mode: full.** I decided this from git before anything else (CRITIC_PROMPT, ADR-804). Run 43's report commit
  `dc365b36` filed one ROADMAP item, R32a. Since then, R33a–d (`f9e7ab94`, `42cb44e9`, `fe57a033`, `2a8ac19d`,
  `0fba90d8`) change `src/`, and none of them names an item that commit filed: R33 was filed later by `642c951a`
  (ADR-829). Focused-run condition 2 therefore fails, so this is the whole brief, with every dimension rescored.
- **Commit judged:** `0fba90d8844d9ed02f91d1d7f091602380ddf5ad`, HEAD at the start (`critic/c44_commit.txt`). **Date:**
  2026-11-06.
- **Build:** `vite build --outDir critic/c44_dist`, exit 0 (`critic/c44_build.log`), served by `vite preview` on
  127.0.0.1:5299. I drove Chromium through Playwright at desk 1600 × 900 and phone 390 × 844. Run 43's commit
  `813eb375` was checked out in a worktree (`critic/wt`) to get a before/after for every new defect.
- **What "the same case" means now.** R33b removed the state "aboard at its port". A landing's divisions now wait
  ashore and board at the sail hour. Run 43's probes timed their orders from "the first aboard a convoy standing at
  its port". On HEAD I time them from "the first standing at its landing's port, ashore" (`AT0=port` in
  `critic/scripts/c44_ll5.ts`, the probes `c44_gen5.ts`, and the page probes, whose state `aboard` became
  `gathering`). That is the same moment as before (t1–t3 on 3517, t56–t64 on 15101) and it matches the grid's own t0
  (`tests/helpers/landingGrid.ts` `atItsPort`). In my new recall cases (`c44_r_*`), "aboard + P" means P hours after
  the one sent alone sails.
- **Runs.**
  - Run 43's cases: 51 headless (`critic/scripts/c44_jobsK.txt`, from run 43's R42 and E lists, plus the
    fleet-order and R43-N1 cases) and the page suite `c44_suiteMK.sh`.
  - Full-run page probes on **new seeds 18101–18513**: `c44_suiteF1.sh` (zoom, battles, wings, God Mode nukes and
    tools, Breakthrough, phone zoom, stacks) and `c44_suiteF2.sh` (relations graph, planes, hero fold, old scenario,
    sea battle, editor, phone, UI, traits, mass orders).
  - Late-game probes on HEAD's own 20-year saves: `c44_suiteF3.sh` (AI nukes, History, export).
  - Attacks on R33:
    - page probes of recall at sea (`c44_rc2_recall.mjs`) and of edits to a whole landing at sea
      (`c44_se_seaedit.mjs`);
    - a split by real click (`c44_sp_split.mjs`);
    - a 16-run split grid on both commits (`c44_jobsSX.txt`);
    - older saves made at `813eb375` and loaded on HEAD (`c44_mig.ts`).
  - Checkers on new seeds: diploInvariants, worldInvariants, landingInvariants and the builder's grid.
  - Suite Q (timing) ran alone at the end.
- **Baseline: R33 left every AI world alone.**
  - The year-20 save of 7019 is byte-identical to run 43's (`cmp critic/c44_seed7019_y20.bin
    critic/c43_seed7019_y20.bin`: identical).
  - workerDeterminism ends on run 43's hash for 3517 (`7e113d94`) and 17011 (`4bae12d3`), and on one hash for every
    arm on new seed 18011 (`4d83261a`) (`critic/c44_wd_*.log`).

## Verdict

**R33 fixes what run 43 filed, but it opens two new holes in the player's landing. Both are blocking, so naval falls
to 6.**

What R33 fixes:

- **R43-B1 is gone.** The one sent alone to Fuzhou and recalled at 2 h, 8 h, 1, 2, 3 or 5 days sails back to Tokyo,
  waits there and lands at Shanghai with its mate, both at h632. The page gives the same result (h660, both)
  (`critic/c44_r_back_*.json`, `critic/c44_rc_d3.json`).
- **R43-N1, N2 and N4 are closed.** In R43-N3's case the two now land together; the fresh pair still waits (R31f, by
  decision).
- **Older saves migrate cleanly.**

What R33 breaks:

- **R44-B1.** When some of a gathering landing's divisions are re-sent by one click, the new landing keeps too few
  transports. It sails with what fits and leaves the rest standing at the port, without a word. The divisions of that
  one click then land one by one, about 12 days apart. Four sent to Shanghai, then two of them clicked onto Fuzhou:
  364 lands alone at h656 and 365 at h951. On `813eb375` the same case lands h656/657. In my grid of 8 shapes, 6
  split on HEAD and 0 on `813eb375`.
- **R44-B2.** A whole landing at sea clicked onto the water a cell off its own beach silently turns for home. The
  player is told a day later, at Tokyo, "there is only sea there". On `813eb375` the same click was refused at once and
  the landing went in.

Neither the builder's grid (two divisions, never a sea click) nor `landingInvariants` covers these cases. Both
checkers report 0 broken on new seeds.

Every other score stands on fresh evidence. The AI world is byte-identical to run 43's, the checkers are clean on 13
new runs, and no page error appeared anywhere.

## Scores

| Dimension | Run 43 | Run 44 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | **Rescored on new seeds.** Z 18101 goes from 6,000 to 3 m/px in 18 steps with no error. Elements appear from 1,573 m/px and 13,830 individuals at 28 m/px (`critic/c44_z_18101.json`). C 18203 reads cleanly from 3,000 to 10 m/px (`critic/shots/c44c_18203_arm_0010m.png`). SK 18513 shows formations with leader lines and readable tags (`critic/shots/c44sk_18513_0.png`). **Not 8:** the ranking still cuts "French Equatorial…" (every shot) and the relations graph overprints its labels (below) |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | **Rescored on new seeds, 0 broken.** diploInvariants 18013 (heroes), 18019 (random diplomacy), 18021, 18023 (random world) (`critic/c44_diploinv_*.log`). worldInvariants 18013 heroes and navy over 10 years, 18027 every rule over 20 years, 18029 air over 20 years (`critic/c44_wi_*.log`). Relations graph RG 18513: 67 nodes on day 0 (war 7, alliance 11, guarantee 8, puppet 40), matching the sim's truth, and each kind's click reads a true sentence ("Albania is a puppet of Italy") (`critic/c44_rg_18513_desk.json`). **Not 8:** R37-N4 unchanged. On day 365 "Romani…Tannu Tuva…ongolia", "Spanish Republic" and "…ench West Africa" overprint one another, and the British cluster is a knot (`critic/shots/c44rg_18513_desk_d365.png`) |
| Emergent world dynamics over long runs | 7 | 7 | **Rescored.** 7019's 20-year world is byte-identical to run 43's. **New** 18003 × 20 years (`critic/c44_headless_18003.json`): 79–100 nations living, 7–14 founded at a time, 4–14 wars. The Soviet Union falls from 32 % to 15 % while Germany rises from 3 % to 17.9 % and leads in years 17, 18 and 20. There are two AI nuclear decisions (the UK on Germany in year 11, 363,632 dead; the Soviet Union in year 15). History holds 3,464 events of 29 kinds (`critic/c44_hi_18003.json`). **Not 8:** Canada sits at 10–13 % for all 20 years and Denmark-by-Greenland at 5.4 % for most of them. The table's frozen half is the same as in run 37–43 |
| God Mode | 7 | 7 | **Rescored on new seeds.** A 18101: an H-bomb on Paris (3,329,000 civilians, alert, "Go to", History row) and an A-bomb on London (`critic/shots/c44a_18101_14_paris_h_2h.png`). Q 18203: revolt (102→103 nations), spawn nation (→104), found city and raze city, each with its ticker row (`critic/c44_q_18203.json`). **Not 8:** R37-N3 unchanged. Breakthrough at peace does nothing and says nothing (K 18307: `before` = `after`, ticker empty, `critic/c44_k_18307.json`) |
| Editor and scenarios | 7 | 7 | **Rescored.** G 18101 (`critic/c44_g_18101.json`): German and British fleets and a Polish bomber are placed, and a fleet on Berlin is refused with "Not done: no water of a sea is near the place". Poland has 10 warheads. The scenario exports; the pending text and Cancel are right. The export loads from the title with 89/76/50 forces and 10 Polish warheads, as placed, and plays to day 30 with carrier strikes in History. As in runs 39 and 43, the probe's 120-day wait timed out at max speed beside other suites, so that is not a finding. **Not 8:** the run-26 scenario is still refused as "made by an older version" (the objection since run 33), and the editor's nation list is a flat list of 100 lines (`critic/c44_g_18101.json` `editorText`) |
| Stats and history | 7 | 7 | **Rescored on a new 20-year world.** History of 18003 at year 20 opens in 106 ms with 3,464 events of 29 kinds. The CSV has 3,466 lines and the JSON export 34,642 lines (`critic/c44_hi_18003.json`, `critic/c44_dl_18003.json`). God Mode strikes have their rows (`critic/shots/c44a_18101_30_history.png`). Not 8: R32-N3 (rows cut mid-word) |
| UI/UX and polish | 7 | 7 | **Rescored.** Good: R33c's refusal for one division of a landing at sea reads well ("not done: it is at sea with its landing, which goes as one: select all of the landing…", `critic/c44_se_one.json`). The cancel is told in the panel ("Aboard, sailing back to Tokyo", `critic/c44_se_home.json`). Bad: R44-B2's sea click shows no tooltip, no mark and no message at the click (`critic/shots/c44se_water2_hover.png`). R44-N1's notice "it will not land with them" stays for 27 days beside "1 of 2 at the port", after the recall that rejoined it (`critic/shots/c44rc_d3_d10.png`). R44-B1's left-behind division reads "Waiting at Tokyo for transports" while its landing is at sea without it (`critic/shots/c44sp_four_h513.png`). Carried: R39-N2, R39-N3 and R40-N2 (`critic/c44_hs_desk.json` identical to run 43's) |
| Performance | 7 | 7 | **Rescored.** Suite Q ran alone on the machine at the end (`critic/scripts/c44_suiteQ.sh`), on the same byte-identical 7019 world as run 43. PF 7019 at year 20 (fps per pass): 3,000 / 1,200 / 600 m/px 58.8–60.1 with p95 ≤ 18.2 ms; **120 m/px 31.4–39.0** (run 43: 35.5–39.2); **30 m/px 40.7–48.3** (run 43: 38.6–48.2) (`critic/c44_pf_7019.json` `agg`). Ten-year watches: LW 6151 59.9–60 fps, longest gap 83 ms, 0 over 500 ms (run 43 the same); LWHON 3517 59.9–60, 83 ms; **new seed** 18101 59.8–60, 83 ms (`critic/c44_lw_6151.json`, `critic/c44_lwhon_3517.json`, `critic/c44_lw_18101.json`). Headless tick on 18003 is 2.6–4.7 ms a year, worst 209 ms (`critic/c44_headless_18003.json`). **Not 8:** 31–48 fps at unit zoom on a year-20 world, as in every run since 37 |
| Stability | 7 | 7 | **Rescored.** No page error in any page JSON of this run (`errors: []`). 7019's save is byte-identical to run 43's, and workerDeterminism is identical on 3517 and 17011 and consistent on new seed 18011. 13 checker runs on new seeds report 0 broken (diploInvariants 4, worldInvariants 3, landingInvariants 6), including landingInvariants on 18101, 18103, 18107, 18109 and on 3517/15101 with new order seeds (`critic/c44_li_*.log`). **Old saves:** saves made at `813eb375` mid-landing (Japan at t3, 60, 300 gathering and t620 at sea; Britain at t3, 30, 80, 140) load on HEAD and migrate into one landing each. All land together at the old hours (Japan h630/631, Britain h87), and a re-save round-trips bit-identical (`critic/c44_mig_load_jap.json`, `critic/c44_mig_load_eng.json`). **Not 8:** R44-B1 leaves divisions standing at a port, untold, for 12 days at a time |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Re-earned on new seeds.** Z 18101 is one camera from 6,000 m/px to 3 m/px in 18 steps with no error (`critic/c44_z_18101.json`). PHZ 18411 runs 40 days on the phone from 30,000 to 25 m/px with no overflow at any tier (`critic/c44_phz_18411.json`). C 18203 shows armoured divisions 40 and 42 labelled at 80 m/px, and tank balls with turrets and tracks at 10 m/px (`critic/shots/c44c_18203_arm_0010m.png`) |
| Naval warfare (needs 8) | 7 | **6** | **Rescored. Down, for two new blocking issues found on the same cases on both commits.** **R44-B1** (`critic/c44_k_four_two_far.json` vs `critic/c43_k_four_two_far.json`; split grid 6/8 vs 0/8) and **R44-B2** (`critic/c44_os_*.json` vs `critic/c44_oswt_*.json`; page `critic/c44_se_water2.json`). What R33 fixed, verified: R43-B1 (recall at 2 h–5 days: both h632, `critic/c44_e_back_*.json`, `critic/c44_r_back_*.json`; page `critic/c44_rc_*.json`); R43-N1 (the player's transports hold the Channel 20 days, `critic/c44_r31d_seawar.json`; run 43: the AI's at t26); R43-N2 (recall home or to water is a cancel, `critic/c44_e_home_d1_h.json`); R43-N3 (`steal_fresh2`: 364/365 land h656/657, run 43 never); R43-N4 (mark at the recall hover, `critic/c44_rc_d3.json` `recallHover.marks`); R42-N3 still refused (`critic/c44_r42n3.json`: reason 19). At-sea edits: whole landing redirected to Fuzhou lands within 6 h (`critic/c44_se_both.json`); cancel sails home (`critic/c44_se_home.json`). Sea battle SB 7019 the same as run 43 |
| Tanks (needs 8) | 8 | 8 | **Re-earned on new seeds.** C 18203 and 18307 (Germany–Poland, day 5): German armoured divisions 40 and 42 are in contact. They read as labelled divisions at 80 m/px and as tank balls with turrets and tracks among wings at 10 m/px, with no error (`critic/c44_c_18203.json`, `critic/c44_c_18307.json`, `critic/shots/c44c_18203_arm_0010m.png`). SK 18513: Soviet tank brigades 199–207 and tank corps 179–182 face Polish infantry at 60 m/px, each a readable formation (`critic/shots/c44sk_18513_0.png`) |
| Aircraft (needs 8) | 8 | 8 | **Re-earned on new seeds.** W 18411: a German fighter is ordered towards Warsaw and followed. In 59 samples it flies with its mark in 54, is never shown without one, and sits a median 32 px from its sorties at 3,000 m/px (`critic/c44_w_18411.json`). PL 18203, Germany–Poland from 3,000 to 25 m/px in both looks: 37 planes in hour 2, no error (`critic/c44_pl_planes.18203_GER_POL_5299.log`). Air rules report 0 broken over 20 years on new seed 18029 (`critic/c44_wi_18029_20_air.log`) |
| AI nuclear use (needs 8) | 8 | 8 | **Rescored.** AN 7019 at year 20 shows the same strike as runs 39–43 (China on the USA near Belfast, alert and row, `critic/c44_an_7019y20.json`). **New** 18003: two AI decisions in 20 years. The UK strikes Germany in year 11, with the toll and the forces lost logged, and the Soviet Union launches in year 15 (`critic/c44_headless_18003.json` `nukeLog`). No strike falls in the 400 h watched at year 20 (`critic/c44_an_18003y20.json`). Restraint, as the design asks |

## Blocking issues

1. **R44-B1. A landing re-sent in part keeps too few transports. It sails with what fits and leaves the rest of the
   one click standing at the port, untold, so they land alone one by one, about 12 days apart.**
   - **The case.** Seed 3517, Japan. The four nearest Tokyo are sent to Shanghai (one landing, four transport
     groups). Two hours after the first stands at Tokyo, 364 and 365 are re-sent to Fuzhou by one click.
   - **What happens.** The new landing for Fuzhou gets one group (1136). Groups 1144/1151/1152 stay with, or are
     freed from, the old one (`critic/c44_k_four_two_far.json` trace t4: `L2gath pTokyo f1136 d364/365`).
     - 365 reaches Tokyo at about h505.
     - The landing sails between h505 and h529 with only 364 aboard. 365 is left standing at the port, still a
       member of the sailing landing (t529: `365:still@1819.5,385.5 … L2sail`).
     - 364 lands **alone** at Fuzhou at h656.
     - The group comes back for 365, which lands alone at **h951**, 12 days later.
     - Nothing is emitted at the sail hour.
   - **The same case at `813eb375`:** both land h656/657 (`critic/c43_k_four_two_far.json`).
   - **By real click** (`critic/c44_sp_four.json`):
     - 364 lands h681 and 365 h975. 366/367 (the rest, for Shanghai) land h1269.
     - While 364 is at sea, 365's panel reads "Waiting at Tokyo for transports". It carries the stale notice
       "…it leaves the landing it had for its new one; the rest keep the old landing, and it will not land with
       them", and there is no other row (`critic/shots/c44sp_four_h513.png`).
   - **It is systematic.** I ran a split grid (`critic/c44_sx_*.json` on HEAD, `critic/c44_sxwt_*.json` on
     `813eb375`, each N to Shanghai, a subset re-sent by one click to Fuzhou). The one-click group lands more than a
     day apart in **6 of 8** shapes on HEAD and in **0 of 8** on `813eb375`:

     | Shape | HEAD | `813eb375` |
     |---|---|---|
     | 4, three re-sent | 975 / 1270 / 1565, one at a time over 25 days | 975 / 976 / 976 |
     | 4, two re-sent | 1299 / 1588 | 1267 / 1267 |
     | 4, the first and last re-sent | 1266 / 1561 | 1266 / 1267 |
     | 5, two re-sent | 656 / 951 | 656 / 657 |
     | 5, three re-sent | the same one-by-one pattern as "4, three re-sent" | together |
     | 6, three re-sent | the same one-by-one pattern | together |

     Run 43's `four_hourly` (the four re-sent one an hour, to one place) also goes wrong. Two land at h1265 and
     h1266, and 366/367, left at the port when it sailed, are still at sea on day 60. At `813eb375` all of them land
     at h1267 (`critic/c44_k_four_hourly.json`).
   - **Why blocking.** It contradicts R33's own AT and claim ("every division of a landing lands within a day of the
     others, or is refused and told why"). It lands lone divisions on an enemy coast, the class that was blocking in
     runs 37, 39 and 43. It follows from the most ordinary edit a player makes: send four, then send two of them
     elsewhere. Neither the grid (two divisions only) nor `landingInvariants` covers it (0 broken on six new seeds,
     `critic/c44_li_*.log`).
   - **Cause, read.** In `landings.ts` `gather`, the sail hour boards "those at the port, first fit"; one with no room
     is skipped (`if (fleet === undefined) continue`) and the landing sails. The groups a re-sent part takes with it
     are not sized to its divisions (`landingOrders` / `detachDivision` free groups by the old landing's room).
   - **Fix.** A landing made or changed by an order takes, or calls, room for all its divisions before it may sail.
     Then a landing never sails while one of its divisions stands at its port without room. If it cannot get the
     room, it waits or is refused, and says so.
   - **AT.** The 8 shapes above plus `four_hourly` on 3517 and 15101: every one-click group lands within a day.
     Add "no sail leaves a division of the landing standing at its port" to `landingInvariants`.

2. **R44-B2. A whole landing at sea clicked onto open water (a cell off its own beach, or any sea) silently turns for
   home, and is told a day later, at its port, that "there is only sea there".**
   - **The case, by real click.** Seed 3517: 364/365 aboard at sea for Shanghai, a day out. Both are selected and the
     sea one cell off the Shanghai coast (1718.5, 413.5) is hovered: no tooltip and no mark
     (`critic/c44_se_water2.json` `hover: {marks: [], tip: null}`, `critic/shots/c44se_water2_hover.png`).
   - **The click.** Nothing is said (`click.rows: []`). The next hour the panel reads "Aboard, sailing back to Tokyo"
     (`critic/shots/c44se_water2_after.png`).
   - **The outcome.** The landing is home at h559. Only then, 22 h after the click, both are refused "not done: there
     is only sea there: it goes over the sea to land on a coast" (`news`: reason 17 `OpenSea` at t557/558, the order
     given at t534). The invasion, a day from the beach after 22 days of gathering, is cancelled.
   - **Headless, the same on three waters** (the landing's own water 1715.5,412.5; open sea east; the Yellow Sea):
     each turns home and is refused `OpenSea` a day later. At `813eb375` all three clicks are refused at once and
     the landing goes in at h631/632 (`critic/c44_os_*.json` vs `critic/c44_oswt_*.json`). The Yellow Sea case by
     click is the same (`critic/c44_se_tsing.json`).
   - **Why blocking.** It contradicts R33's claim ("a re-click, a redirect, a recall or a cancel is an edit of it,
     refused with a told reason when it cannot be done"). Two rules fire one after the other and disagree: ADR-830's
     "to a place not over the sea: a cancel" and R22g's "an order to open sea is refused". A plausible misclick, the
     sea in front of the beach the player is watching, throws away an invasion without a word.
   - **Fix.** An order of a whole landing at sea to water is refused at the click, `OpenSea`, and the landing keeps
     its course. A cancel is an order to its nation's own land.
   - **AT.** The four waters above, by click: refused at once, the landing lands as planned, and the tooltip over
     water says why.

## Non-blocking issues (prioritised)

1. **R44-N1. Stale and misleading panel text around a recall.**
   - After a recall that rejoins (run 43's case, recalled at 1/3/5 days), the notice "it leaves the landing it had for
     its new one; the rest keep the old landing, and it will not land with them" stays on the panel for 20+ days. It
     sits beside "Landing: 1 of 2 at the port", and it does land with them (`critic/c44_rc_d3.json` `panels`,
     `critic/shots/c44rc_d3_d10.png`).
   - Recalled 5 days out, its status reads "At sea, bound for its landing" for 4+ days while it sails *away* from
     Shanghai back to Tokyo (`critic/c44_rc_d5.json` panels at h132 and h240).
   - The recall's mark is `same: false` and its tooltip "they board transports at a port and land at the marked
     place". Nothing says it will first sail back to Tokyo and wait there for weeks.
2. **R44-N2. Two clicks for one place in the same hour make two landings from two ports. The first lands alone, a
   week early.**
   - Japan (`critic/c44_mk2_freshfirst*.json`, three seeds): 366, clicked first, lands at h500 and 364/365 at h682.
     Run 43 landed all three together at h814–820.
   - Britain (`critic/c44_g_eng_7019.json`, 15103, 15109, 15111, 15121): the fresh one from Plymouth lands alone at
     h78 and is destroyed at h204. The two at Portsmouth are told `PortShut`. Run 43 landed all three together at
     h284.
   - The mark gives no hint of the other landing (`critic/shots/c44mk2_freshfirst_14003_twohover.png`).
   - ADR-830 records the separate landing (R29b's ferry not rebuilt), so the rule is a decision. The readability is
     not: the player is not told that the place already has a landing from another port that will sail first.
3. **R44-N3. Long waits at the port, by R31f's rule.**
   - `steal_one`: 364, clicked to Fuzhou with a fresh division from far, waits ashore at Tokyo 53 days and lands
     h1278 (run 43: h477) (`critic/c44_k_steal_one.json`).
   - `steal_then_sw3` lands h1005 (run 43: h770).
   - The grid's longest wait at the port is 507 h (`critic/c44_grid_3517.json`). The panel tells the wait ("the last
     22 days from it"), so this is readable. It is listed for the decision's cost.
4. **R44-N4. The checkers do not reach R33's new failure modes.**
   - `landingInvariants` has no rule that a sailing landing has left none of its divisions at its port, and none
     that its room covers its divisions.
   - The grid has two divisions and never clicks water.
   - Both report 0 broken while R44-B1 and R44-B2 happen. The builder's figure "6 of 480" is reproduced exactly
     (`critic/c44_grid_3517.log`, `critic/c44_grid_15101.json`), but it measures a narrower space than R33's claim.
5. Carried, unchanged:
   - **R37-N3**: K 18307.
   - **R37-N4**: RG 18513.
   - **R32-N3**.
   - **R40-N2**: `hs_desk` identical.
   - **R39-N2, R39-N3, R36-N3, R32-N2, R31-N1, R31-N6, R32-N5, R39-N4**.
   - The ranking cuts long names.

## Run 43's cases re-run

| Run 43 case | `813eb375` (run 43) | HEAD `0fba90d8` | Evidence |
|---|---|---|---|
| **R43-B1**: 364 alone to Fuzhou, recalled to Shanghai at 6 h / 1 / 2 / 3 / 5 days | h632 together / h632 together / 364 h1014 / 364 never by day 60 / 364 h229 alone | **fixed**: all h632 together; also 2 h and 8 h, and seeds 17101, 17203, 18201, 18203 | `critic/c44_e_back_*.json`, `critic/c44_r_back_*.json` |
| R43-B1 by real click (recall 1/3/5 days, and 6 h) | split, walk to Tokyo | both h660 at Shanghai; stale notice (R44-N1) | `critic/c44_rc_h6.json`, `…_d1.json`, `…_d3.json`, `…_d5.json` |
| **R43-N1**: the player's transports 1072 onto the Channel / a port's water | the AI's at t26 | **fixed**: the player's order held to day 20 | `critic/c44_r31d_seawar.json`, `critic/c44_r31d_ports.json` |
| **R43-N2**: recall home (1 / 3 days), to Tsingtao | refused, lands alone at Fuzhou | **fixed**: home is a cancel (sails back, marches to the cell by h184); Tsingtao is water, so R44-B2 | `critic/c44_e_home_d1_h.json`, `critic/c44_e_tsing_d1.json` |
| **R43-N3**: `steal_fresh2` | 364/366/367 not landed by day 60 | 364/365 h656/657; 366/367 still not landed by day 60 | `critic/c44_k_steal_fresh2.json` |
| **R43-N4**: no mark at sea | `marks: []` | **fixed**: a mark at the recall hover | `critic/c44_rc_d3.json` |
| `steal_freshdaybefore` (run 43: 365 alone, 15 days late) | 473 / 475 / 839 | 473 / 656 / 657: the two together | `critic/c44_k_steal_freshdaybefore.json` |
| `steal_freshfuzhou` ×4 seeds, `freshhourbefore`, `noescort`, `reclick` | all h791–793 together | 366 h475, 364/365 h656/657 (R44-N2, by decision) | `critic/c44_k_steal_*.json` |
| `steal_recall_d1`, `steal_recall_h4` | 364/365 h765/771 | h631/632 | same |
| `four_two_far`, `four_hourly` | together | **split** (R44-B1) | `critic/c44_k_four_*.json` |
| `steal_one` | 364 h477 | h1278 (R44-N3) | `critic/c44_k_steal_one.json` |
| the other K cases (`bothfar`, `click_plus_fresh`, `four_all_sw3` ×2, `fresh3_base`, `leaversfirst_fz`, `six_all_far`, `steal_four`, `there_and_back`, `three_twofar`, `aboard_alone`, `back`, late-far ×3) | — | identical landings | `critic/c44_k_*.json`, `critic/c44_e_*.json` |
| R42-N3: fleet order to a landing's transports | refused `Convoy` | refused `Convoy` (19) | `critic/c44_r42n3.json` |
| G/N Britain lists | 3 land h284–291 together | `p270` cases land h86–94 together; the auto-picked 274/271 cases split (R44-N2), `PortShut` | `critic/c44_g_*.json`, `critic/c44_n_*.json`, `critic/c44_mk4_*.json` |
| page MK cases (`nofresh2`, `leaversfirst`, `eng15101_sep`) | — | identical | `critic/c44_mk2_*.json`, `critic/c44_mk4_eng15101_sep.json` |
| R40-N2, R39-N2, R39-N3 | open | open (`hs_desk` identical) | `critic/c44_hs_desk.json`, `critic/c44_mk_mixed_s2.json` |
| 7019 × 20, workerDeterminism | — | save byte-identical; hashes identical | `critic/c44_seed7019_y20.bin`, `critic/c44_wd_*.log` |
| Suite Q | PF 120: 35.5–39.2; 30: 38.6–48.2; LW 59.4–60, 83 ms | PF 120: 31.4–39.0; 30: 40.7–48.3; LW 59.8–60, 83 ms (same world: noise) | `critic/c44_pf_7019.json`, `critic/c44_lw_*.json` |

## Design objections (none blocking, no score lowered)

- **Two landings for one place.** ADR-830 keeps a fresh division's landing at its own port separate from a landing
  for the same place at another port. The first then sails alone (R44-N2). Run 43 landed these together. A landing
  for one place could draw its divisions to one port, as the R29b ferry did. At the least, the mark could say "a
  landing for this place sails from Sasebo".
- **R31f's window kept on the object.** One click waits for its furthest division however far, so a division can
  stand 53 days at its port (R44-N3). Hearts of Iron lets the player launch with what has arrived. A "sail now" on
  the panel would put the trade in the player's hands.
- Run 33–43's objections stand: save format 2 refuses older scenarios; the jump home across the sea; an ally's coast
  is refused as "a nation outside its wars".

## Ideas from other games (not scored)

- Hearts of Iron shows a naval invasion's progress as one bar per invasion, with the divisions assigned and the
  convoys it needs. A count of transports needed against held would make R44-B1 visible before it bites.
- Many RTS games ignore a move order onto impassable ground or show a "can't go there" cursor, rather than turning a
  group around. That cursor is all R44-B2 needs.

## Strengths (verified)

- R33 fixed the run-43 blocking issue completely. At every recall hour from 2 h to 5 days headless (seed 3517, and
  2 days on 18201 and 18203) and at 6 h, 1, 3 and 5 days by click on 3517, the recalled division rejoins and lands with its mate (`critic/c44_r_back_*.json`,
  `critic/c44_rc_*.json`). Saves made at the old commit in the middle of a landing load and finish it at the same hour
  (`critic/c44_mig_load_*.json`).
- The AI is untouched by a rebuild of 850 lines. 7019's 20-year save is byte-identical to run 43's, and 13 checker runs
  on new seeds report 0 broken.

## Notes

- Run 43's R31 fuzz (`c43_fz3.ts`, a named case of its stability row) was not re-run: it reads `seaFetch` and
  `convoyPort`, which R33 removed. In its place I used the builder's `landingInvariants` on six new seeds
  (0 broken), plus my own split grid and sea-click probes, which found R44-B1 and R44-B2. It does not move stability:
  that score was 7 with the fuzz clean, and R44-B1 is already the reason it is not 8.

- `critic/wt` (`813eb375`) was used for every before/after, and removed at the end with its `node_modules` junction
  unlinked first. The preview server was stopped.
- Page probe `c44_fs_strand.mjs` picked group 1067 (the nearest), not the landing's 1068, because nobody waits aboard
  1068 any more. That is a probe artefact; R42-N3 was checked directly (`critic/c44_r42n3.json`).
- The events' `b` field in my logs is the nation and `x` the reason. The British `MoveRejected … x16` are `PortShut`,
  which is true.
