# Critic report, run 43 (full) — after R31

- **Mode: full.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). Condition 3 of a focused run fails:
  the last three reports are all focused — run 42 (`9830a4ad`, on `1eb4bf85`), run 41 (`6a1a7e7c`, on `77d37526`) and
  run 40 (`27d14686`, on `76b88197`), each JSON `"mode": "focused"`. Run 42 itself said the next run is
  full. So the whole brief: every dimension rescored, nothing carried; the four 8s re-earned on new seeds.
- **Commit judged:** `813eb3757f02967d66ef448c942fa05b26b655d1` (HEAD at the start, `critic/c43_commit.txt`).
  **Date:** 2026-11-05.
- **Build:** `vite build --outDir critic/c43_dist`, exit 0 (`critic/c43_build.log`), served by `vite preview` on
  127.0.0.1:5299. Chromium through Playwright, desk 1600 × 900, phone 390 × 844. Run 42's commit `1eb4bf85` in a
  worktree (`critic/wt`) for the before/after of every new defect.
- **Runs.** Run 42's scripts copied as `critic/scripts/c43_*` (and run 39's full-run probes where no run-42 copy
  existed). Run 42's cases: page suite `c43_suiteMK.sh` (R40-B1/B2, R41-B1, R41-N2, the mark, touch, the hint, plus
  R42-N1 `c43_pn_panel.mjs` and R42-N3 `c43_fs_strand.mjs`), 51 headless jobs `c43_jobsR42.txt` (run 42's K, G, G2, N,
  F, F2 lists). Full-run probes on **new seeds 17101–17617**: `c43_suiteF1.sh`, `c43_suiteF2.sh` (zoom, battles, wing,
  God Mode nukes and tools, Breakthrough, phone zoom, stacks, relations graph, planes, hero fold, editor, sea battle,
  phone/UI, traits, mass orders), `c43_suiteF3.sh` (AI nukes, History, export on HEAD's own 20-year saves). New attacks
  on R31: `c43_jobsE.txt` (R31e recall at sea at 6 h, 1, 2, 3, 5 days; recall to home, to another coast; R31f late
  orders), replayed on `1eb4bf85` (`c43_jobsEWT2.txt`); page probe `c43_rc_recall.mjs` (the recall by real click);
  `c43_r31d.ts` (a player's fleet order to empty transports); `c43_fz3.ts` (run 34's sea-order fuzz plus R31's own
  attack: aboard divisions re-ordered and convoy transports given fleet orders every 3 days, idle-aboard spells
  tracked), six new seeds × 120 days. Checkers on new seeds. Suite Q (timing) alone at the end.
- **Baseline: R31 left every AI world alone.** The year-20 save of 7019 is byte-identical to run 42's
  (`cmp critic/c43_seed7019_y20.bin critic/c42_seed7019_y20.bin`: identical); workerDeterminism ends on run 42's hash on
  every arm for 3517 (`7e113d94`), 11071 (`d2716b65`), 14011 (`30c3bbe9`), 15013 (`56855b2d`) and on new seed 17011
  (`4bae12d3`) (`critic/c43_wd_*.log`).

## Verdict

**R31 closes four of run 42's six as filed** — R42-N1, R42-N2, R42-N3 by real click or on their seeds, and R40-N1 at
the moment its AT names — and leaves R41-N1 and R37-N2's named case as they were, by recorded decision. **But R31e's
recall at sea opens a worse hole than the one it closes, and it is blocking (R43-B1).** The one sent alone to Fuzhou
and recalled to its landing at Shanghai one day out rejoins it (both h632, page h658, `critic/c43_rc_d1.json`). Recalled
**three** days out — the same click, two days later — its transports turn for the nearest Japanese port, it is put
ashore on Kyushu and marches the length of Honshu back to **Tokyo** for 40+ days ("Marching to Tokyo to board
transports"), its partner lands **alone** at h658, and on day 60 it has only just sailed (`critic/c43_rc_d3.json`,
`critic/shots/c43rc_d3_d20.png`). The map, the moment the order is given, shows the green mark "The landing they
already have: they keep their transports and land at the marked place" (`critic/shots/c43rc_d3_recall_panel.png`):
neither is true. Recalled two days out it lands 16 days after its partner; five days out it lands alone 17 days before
it. On `1eb4bf85` every one of these recalls was refused and it landed at Fuzhou h150 (`critic/c43_ewt_back_*.json`).
**Naval stays 7, under its bar of 8.** No other score moves: R31 changed no AI world, the checkers are clean on seven
new runs, and the fuzz of R31's own orders strands nobody.

## Scores

| Dimension | Run 42 | Run 43 | |
|---|---|---|---|
| Map visuals and readability | 7 (carried) | 7 | **Rescored.** Z 17101 from 6,000 to 3 m/px in 18 steps, no error (elements from 1,573 m/px, 13,828 individuals at 28 m/px, `critic/c43_z_17101.json`); C 17203 at 3,000/80/10 m/px reads cleanly (`critic/shots/c43c_17203_arm_3000m.png`, `…_0080m.png`, `…_0010m.png`). **Not 8:** the run 37–39 reasons stand — the ranking still cuts "French Equatorial…" (every shot, e.g. `critic/shots/c43sk_17513_0.png`), division labels pile up in a battle at 80 m/px (`critic/shots/c43c_17203_arm_0080m.png`), the relations graph's labels overlap (below) |
| Diplomacy, war, alliance, puppet, revolt depth | 7 (carried) | 7 | **Rescored.** Checkers on **new seeds**, 0 broken: diploInvariants 17013 (heroes), 17019 (random diplomacy), 17021, 17023 (random world) (`critic/c43_diploinv_*.log`); worldInvariants 17013 heroes+navy 10 y, 17027 all rules 20 y, 17029 air 20 y (`critic/c43_wi_*.log`). Relations graph on 17513, day 0 and 365: 67 nodes, war 7 / alliance 11 / guarantee 8 / puppet 40, matching the sim's truth; each kind's click reads a true sentence ("Albania is a puppet of Italy") (`critic/c43_rg_17513_desk.json`). **Not 8:** R37-N4 unchanged — "France"/"French West…ca", "Mengjiang"/"Turkey", "Spanish Re~ublic" overprint each other at day 365 (`critic/shots/c43rg_17513_desk_d365.png`); run 30's list (bond exit, guarantees, a refused peace untold) untouched |
| Emergent world dynamics over long runs | 7 (carried) | 7 | **Rescored.** 7019's 20-year world byte-identical to run 42's, so run 37–42's reading stands. **New** 17003 × 20 years (`critic/c43_headless_17003.json`): 82–99 nations living, 7–12 founded at a time, 7–10 wars, the Soviet Union 20–28 % and the USA 11–15 %, Germany rising to 8.4 % by year 17, one AI nuclear decision (the Soviet Union on the UK, year 11); History of that world 3,703 events of 29 kinds (`critic/c43_hi_17003.json`). **Not 8:** the top of the table barely moves over 20 years (Soviet Union, USA, Canada, Denmark-by-Greenland 5.4 % every year), as run 37 said |
| God Mode | 7 (carried) | 7 | **Rescored on new seeds.** A 17101: an H-bomb on Paris (3,329,000 civilians, alert, "Go to", History row) and an A-bomb on London, with the cloud and fallout read at 3,000 to 30 m/px (`critic/shots/c43a_17101_14_paris_h_2h.png`, `critic/shots/c43a_17101_30_history.png`); Q 17203: revolt, spawn nation, found city, raze city, each with its ticker row (`critic/c43_q_17203.json`). **Not 8:** R37-N3 unchanged — a Breakthrough at peace does nothing and says nothing (K 17307, `before` = `after`, ticker empty, `critic/c43_k_17307.json`) |
| Editor and scenarios | 7 (carried) | 7 | **Rescored.** G 17101: German/British fleets and a Polish bomber placed, a fleet on Berlin refused "no water of a sea is near the place"; the scenario exported, the pending text and Cancel right, the export loaded from the title (89/76/50 forces, 10 Polish warheads as placed) and played to day 60 with its sea battle in the ticker and History (`critic/c43_g_17101.json` `loaded`, `marks`); the probe's 120-day wait timed out at max speed beside other suites, as run 39's did at the same point (`critic/c39_g_4877.json`), so not a finding. OS2: the run-26 scenario is still refused "made by an older version of Warism" (`critic/c43_os2_c25.json`, the objection since run 33). Not 8 for that, and for the editor's flat 100-line nation list |
| Stats and history | 7 (carried) | 7 | **Rescored on a new 20-year world.** History of 17003 y20 opens in 136 ms with 3,703 events and 29 kinds; CSV 3,705 lines, JSON export (`critic/c43_hi_17003.json`, `critic/c43_dl_17003.json`); the God Mode strikes have their rows (`critic/shots/c43a_17101_30_history.png`). Not 8: R32-N3 (rows cut mid-word, "its port is bombe…", `critic/shots/c43fs_eng15101_d3.png`) |
| UI/UX and polish | 7 (carried) | 7 | **Rescored.** R31a's refusal reads well ("Transport group 1068: not done: these transports carry a landing, or load for one: they sail with it…", `critic/c43_fs_eng15101.json` `rows0`); R42-N1's false refusal is gone (`critic/c43_pn_eng15101.json` `rowsAfterLand: []`). New: R43-B1's green mark and "they keep their transports" for an order that puts the division ashore 600 km away; its panel notice "it leaves the landing it had for its new one; the rest keep the old landing" stays for 40 days after the player sent it back to that landing (`critic/shots/c43rc_d3_d20.png`); before the recall click there is no mark and no by-sea line at all for a division aboard at sea (`critic/shots/c43rc_d3_hover.png`, `recallHover.marks: []`). R31b's convoy ended by bombing tells the one aboard "not done: its port is bombed shut" though no order was given (`critic/shots/c43fs_eng15101_d3.png`). Carried: R39-N2, R39-N3, R40-N2 (`critic/c43_tm_touch.json`, `critic/c43_mk_mixed_s2.json`, `critic/c43_hs_desk.json`) |
| Performance | 7 | 7 | **Rescored**, Suite Q alone on the machine at the end (`critic/scripts/c43_suiteQ.sh`). PF 7019 y20 (fps per pass, worst p95): 3,000 / 1,200 / 600 m/px 58.8–60.2, ≤ 18.4 ms; **120 m/px 35.5–39.2** (run 42 35.5–38.2); **30 m/px 38.6–48.2** (run 42 38.6–48) (`critic/c43_pf_7019.json` `agg`). Ten-year watches: LW 6151 59.9–60 fps, longest gap 83 ms (run 42 the same), LWHON 3517 59.4–60 fps, 83 ms, and **new seed** 17101 59.6–60 fps, 83 ms, no gap over 500 ms (`critic/c43_lw_6151.json`, `critic/c43_lwhon_3517.json`, `critic/c43_lw_17101.json`). Headless tick on 17003 y17 6.1 ms, worst 257 ms (`critic/c43_headless_17003.json`). **Not 8:** 35–48 fps at unit zoom on a year-20 world, as in every run since 37 |
| Stability | 7 | 7 | **Rescored.** No page error in any page JSON of this run (`errors: []`); 7019's save byte-identical; workerDeterminism the same end hash on every arm for four old seeds and new 17011; seven checker runs on new seeds 0 broken; the R31 fuzz (`critic/c43_fz3_*.json`, six seeds × 120 days, 412 sea orders, 153 re-orders of divisions aboard, 98 fleet orders to convoy transports): **no division aboard a dead group, no idle-aboard spell over 72 h, none idle at the end**. **Not 8:** R43-B1 is a state the player cannot see out of (a division marching 40+ days to a port while the panel and the mark say it keeps its transports); the longest bound spell in the fuzz is 1,772 h (74 days, 17101 `worstBound`) |
| Semantic zoom to unit level (needs 8) | 8 (carried) | 8 | **Re-earned on new seeds.** Z 17101: one camera from 6,000 m/px to 3 m/px, 18 steps, no error, elements appear at 1,573 m/px and individual soldiers at 28 m/px (`critic/c43_z_17101.json`); PHZ 17411 on the phone 40 days, 30,000 → 25 m/px, no overflow, Japanese and Chinese soldiers as helmeted balls with their division tags (`critic/c43_phz_17411.json`, `critic/shots/c43phz_17411_00025.png`); C 17203: armoured division 40/42 labelled at 80 m/px and tank balls with turrets at 10 m/px (`critic/shots/c43c_17203_arm_0010m.png`) |
| Naval warfare (needs 8) | 7 | **7** | **Rescored. Not 8: R43-B1 (blocking).** What works, verified: R42-N3 (the fleet order refused, `critic/c43_fs_eng15101.json`, headless `critic/c43_f_control.json`); R42-N2 (16117: 274 no longer lands alone, `critic/c43_n_eng_16117_recall30.json`); R42-N1 (270/274 goes ashore and marches, nobody lands in France untold, `critic/c43_pn_eng15101.json`, `critic/c43_g_eng_15101_p270_land.json`); R40-N1 at one day (`critic/c43_k_back.json`, `critic/c43_rc_d1.json`); 23 of run 42's 28 Japan cases identical (`k_back` and `steal_freshdaybefore` changed, below; `aboard_alone`, `four_hourly`, `steal_cancelfresh` only in end-states after the same landings); sea battle SB 7019 identical but page-clock samples; the fuzz above. Open: R43-B1, R43-N1, R43-N2, R43-N3, R41-N1 and R37-N2 (by decision) |
| Tanks (needs 8) | 8 (carried) | 8 | **Re-earned on new seeds.** C 17203 and 17307 (Germany–Poland, day 5): German armoured divisions 40 and 42 in contact, read as labelled divisions at 80 m/px and as tank balls with turrets and tracks among wings at 10 m/px, no error (`critic/c43_c_17203.json`, `critic/c43_c_17307.json`, `critic/shots/c43c_17203_arm_0080m.png`, `…_0010m.png`); SK 17513: Soviet tank brigades 201–204 stacked against Polish cavalry at 60 m/px, each a readable formation (`critic/shots/c43sk_17513_0.png`) |
| Aircraft (needs 8) | 8 (carried) | 8 | **Re-earned on new seeds.** W 17411: a German fighter ordered towards Warsaw and followed, 59 of 59 samples aloft with its mark at 3,000 m/px, median 32 px from its sorties (43 px at ×5) (`critic/c43_w_17411.json`); PL 17203 Germany–Poland from 3,000 to 25 m/px, both looks, 37 planes found in hour 2, no error (`critic/c43_pl_planes.17203_GER_POL_5299.log`); air rules 0 broken 20 years on new seed 17029 (`critic/c43_wi_17029_20_air.log`) |
| AI nuclear use (needs 8) | 8 (carried) | 8 | **Rescored.** AN 7019 y20 the same strike as runs 39–42 (China on the USA near Belfast, alert and row, `critic/c43_an_7019y20.json`); **new** 17003: one AI decision in 20 years (the Soviet Union on the UK, year 11, 25,838 men lost, `critic/c43_headless_17003.json` `nukeLog`) and none in the 400 h watched at year 20 (`critic/c43_an_17003y20.json`) — restraint as the design asks, with the strike that comes read in the alert and History |

## R31, item by item

| Item | Case | Result | Evidence |
|---|---|---|---|
| R31a (R42-N3) | Britain 15101, the loading convoy's transports clicked onto the Channel (real click) | **refused** with its reason; the one aboard stays at Portsmouth | `critic/c43_fs_eng15101.json` `rows0`, `news` |
| R31b (R42-N2) | 16117, recalled to Calais 30 h after; the port bombed shut | 274 put ashore at the port (h106), does not land alone; c42: alone h199, destroyed | `critic/c43_n_eng_16117_recall30.json` |
| R31b | 15101 page case: Portsmouth bombed shut on day 2 | both told "its port is bombed shut", 274 "Holding" at Portsmouth (no new order was given; the text says "not done") | `critic/shots/c43fs_eng15101_d3.png` |
| R31c (R42-N1) | 15101, the two onto the Midlands while the ship sails to Plymouth (real click) | no refusal, 274 ashore and marching; nobody lands in France untold | `critic/c43_pn_eng15101.json` |
| R31d (R41-N1) | 3517, 365 bound for Sasebo | **unchanged** — the walk stays (decision: "the ferry would save ~2 days"), only the idle transports go back to the AI | `critic/c43_k_steal_freshfuzhou.json` identical to c42 |
| R31d | Britain 15101, the player's empty transports 1072 clicked onto the Channel | arrive at t12 and are **the AI's at once**: back to Plymouth by t26, sailed off towards 1280,536 at t362. On `1eb4bf85` they hold the Channel for 20 days | `critic/c43_r31d_seawar.json`, `critic/c43_r31dwt_seawar.json` (R43-N1) |
| R31e (R40-N1) | one sent alone to Fuzhou, recalled to Shanghai at 6 h / 1 day | both land h632 (page h658) | `critic/c43_e_back_h6.json`, `critic/c43_k_back.json`, `critic/c43_rc_d1.json` |
| R31e | the same, recalled at **2 / 3 / 5 days** | **h1014 (16 days after its mate) / not landed by day 60, marched Kyushu → Tokyo / alone h229, 17 days before its mate**; on `1eb4bf85` all refused, Fuzhou h150 | `critic/c43_e_back_d2.json`, `…_d3.json`, `…_d5.json`; `critic/c43_ewt_back_*.json`; page `critic/c43_rc_d3.json` (R43-B1) |
| R31e | recalled to home soil (1 / 3 days) or to Tsingtao (1 day) | refused (`Aboard`, `NoPort`), lands alone at Fuzhou h150 | `critic/c43_e_home_d1.json`, `…_home_d3.json`, `…_tsing_d1.json` (R43-N2) |
| R31f (R37-N2) | run 40–42's named case (two fresh to Fuzhou, one in the far north, then the two) | **unchanged**: 364 and 366 aboard at Sasebo on day 60, 367 still walking | `critic/c43_k_steal_fresh2.json` identical to c42 (R43-N3) |
| R31f | the fresh one sent a day before the two (`steal_freshdaybefore`) | now 473 / 475 / **839**: the later click's 365 lands alone 15 days after (c42: 839–841 together), untold | `critic/c43_k_steal_freshdaybefore.json` |
| R31 fuzz | 6 new seeds × 120 days, R31's orders included | 0 stranded, 0 idle-aboard spells > 72 h; `Convoy` (19) refusals 4–25 a seed | `critic/c43_fz3_*.json` |

## Blocking issues

1. **R43-B1. A landing recalled at sea after its first day splits: the one aboard is put ashore on the nearest home
   coast and marches to the old port for weeks, while its partner lands alone; the map says it keeps its transports.**
   Seed 3517, Japan, by real click: the two nearest Tokyo sent to Shanghai; two hours after 364 boards, 364 alone is
   clicked onto Fuzhou (it sails at once, alone, as R28a has it); at h75 it is clicked back onto Shanghai. The order
   is taken. Its transports turn for the nearest Japanese port; 364 is put ashore on Kyushu (1766.5,411.5) and bound
   for group 1152 **at Tokyo**; its panel reads "Marching to Tokyo to board transports" on days 5, 10, 20 and 40
   (`critic/c43_rc_d3.json` `panels`, `critic/shots/c43rc_d3_d20.png`: 364 on day 20 at Hiroshima, Sasebo's transports
   beside it). 365 sails without it and lands **alone** at h658; at h1444 (day 60) 364 has only just left Tokyo
   (`end`). The green mark and tooltip at the click: "The landing they already have: they keep their transports and
   land at the marked place" (`critic/shots/c43rc_d3_recall_panel.png`); the notice "it leaves the landing it had for
   its new one; the rest keep the old landing, and it will not land with them" stays on its panel for the 40 days of
   the march. Headless the same (`critic/c43_e_back_d3.json`: still `bound1152` at 1818,386 on day 60). The outcome
   depends on the hour of the recall: 6 h and 1 day — both land h632 (the AT, `critic/c43_e_back_h6.json`,
   `critic/c43_k_back.json`); 2 days — 364 lands h1014, 16 days after 365, alone (`critic/c43_e_back_d2.json`);
   3 days — above; 5 days — it lands alone at h229, 17 days **before** 365 (`critic/c43_e_back_d5.json`). On run 42's
   commit `1eb4bf85` every one of these recalls is refused and 364 lands at Fuzhou h150 as first ordered
   (`critic/c43_ewt_back_d1.json` … `…_d5.json`): **new in R31e.** **Blocking** because it contradicts the feature R31e
   claims ("a convoy of one at sea can be recalled … it rejoins its landing"), because the order splits a landing by
   weeks and lands one division alone on an enemy coast — the class that was blocking in runs 37 and 39 (R37-B1,
   R39-B1) — and because the map promises the opposite of what happens. **Cause, read:** `turnBack` picks the nearest
   port of the nation by straight cells and `orderMove` takes the order "as at that port"; the old landing's convoy is
   at Tokyo, so `assignTransports` binds 364 to it and it walks; `waitedFor` (R31f) then does not wait for it (bound
   two days after the first of its landing, a march of weeks), so the convoy sails without it. **Fix:** a recalled
   convoy of one sails back to its own landing's port (or straight to the landing, joining its mates there), not to the
   nearest port; and a recall that cannot rejoin is refused with that reason. AT: the case above recalled at 1, 2, 3 and
   5 days: 364 lands within a day of 365 each time, or is refused and told why; the mark agrees with the outcome.

## Non-blocking issues (prioritised)

1. **R43-N1. A player's fleet order to empty transports is undone the hour they arrive.** Britain 15101: transports
   1072 clicked onto the Channel arrive at t12; by t26 the AI has sailed them back to Plymouth, and at t362 it sends
   them south towards 1280,536; the player is told nothing (`critic/c43_r31d_seawar.json`; peace, a port's water: the
   order is dropped on arrival, `critic/c43_r31d_ports.json`). On `1eb4bf85` they hold the Channel for 20 days
   (`critic/c43_r31dwt_seawar.json`). R31d specifies it (transports with no convoy and nobody aboard are the AI's), so
   the rule is not the defect; the player cannot see which of his fleets are his and which the AI's, and a warship
   fleet keeps the same order indefinitely. The AI then uses the freed transports to ship the player's own divisions
   far away: 366 (Japan, never ordered) aboard 1144 off Ceylon for 1186,328 (`critic/c43_k_steal_cancelfresh.json`
   `end`); 271, ordered by the player to the English Midlands, aboard 1076 in mid-Atlantic
   (`critic/c43_g_eng_15101_p270_land.json` `end`). See Design objections.
2. **R43-N2. The one alone at sea, ordered anywhere but its old landing, is refused and lands alone where first sent.**
   Recalled to home soil at 1 day (`Aboard`) or 3 days (`NoPort`), or to Tsingtao (`Aboard`): refused; it lands at
   Fuzhou h150 alone (`critic/c43_e_home_d1.json`, `…_home_d3.json`, `…_tsing_d1.json`). R31e turns the ship back only
   for its own landing; R40-N1's "cannot be recalled" stands for every other order.
3. **R43-N3. R37-N2 as runs 40–42 named it is unchanged.** Two fresh ones to Fuzhou (one from the far north), then the
   two: 364 and 366 aboard at Sasebo on day 60, 367 still walking (`critic/c43_k_steal_fresh2.json`, identical to
   c42). ROADMAP R31f names this case and is ticked; its Done line measures a different one (a later order three days
   on). By R31f's rule (one click is waited for however far) this is designed, but the player still has two divisions
   sitting aboard at a port for two months. And R31f now splits `steal_freshdaybefore` — 473/475 then 365 alone at
   839, untold (`critic/c43_k_steal_freshdaybefore.json`; c42 839–841 together).
4. **R43-N4. No mark for a division aboard at sea.** Hovering Shanghai with 364 selected at sea: `marks: []`, the
   tooltip only "China / Occupied by Japan" (`critic/shots/c43rc_d3_hover.png`); the mark appears only after the
   click, and then false (R43-B1).
5. **R41-N1** unchanged by decision (`critic/c43_k_steal_freshfuzhou.json` identical to c42).
6. Carried, unchanged: **R37-N3** (K 17307), **R37-N4** (RG 17513), **R32-N3** (rows cut: "its port is bombe…"),
   **R39-N2**, **R39-N3**, **R40-N2**, **R36-N3**, **R32-N2**, **R31-N1**, **R31-N6**, **R32-N5**, **R39-N4**.

## Run 42's cases re-run

| Run 42 case | `1eb4bf85` (run 42) | HEAD `813eb375` | Evidence |
|---|---|---|---|
| R41-B1 by real click, 15101 / 7019 / by two clicks | all three h291 | identical | `critic/c43_mk4_eng15101_p270.json`, `…_eng7019_p270.json`, `…_eng15101_sep.json` |
| R40-B1 by click 3517 / 14003 / 14011; nofresh2; leaversfirst; four SW | as run 41 | identical | `critic/c43_mk2_*.json`, `critic/c43_lwt5_four_allsw63.json` |
| R41-N2 recall 4 h by click | 364/365 Shanghai h788/794 | identical | `critic/c43_mk2_recall4.json` |
| **R42-N1** land order while ferried to Plymouth | 270 refused "aboard", Caen h119 | **fixed**: no refusal, ashore, marches | `critic/c43_pn_eng15101.json`; headless `critic/c43_g_eng_15101_p270_land.json` |
| **R42-N2** port bombed shut (16117 recall30; 15101 backport) | 274 alone h199 destroyed; 270 alone h135 destroyed | **fixed**: put ashore at the port, told `PortShut` | `critic/c43_n_eng_16117_recall30.json`, `critic/c43_f2_backport.json` |
| **R42-N3** fleet order to the loading convoy's transports (page and headless) | 270 at sea 12/25 days | **fixed**: refused `Convoy` | `critic/c43_fs_eng15101.json`, `critic/c43_f_control.json` |
| **R40-N1** recall a day later | refused, Fuzhou h150 | **fixed at 1 day** (both h632); R43-B1 at 2–5 days | `critic/c43_k_back.json`, `critic/c43_e_back_*.json` |
| **R41-N1** 365 walks to Sasebo | t4–t769 | unchanged (by decision) | `critic/c43_k_steal_freshfuzhou.json` |
| **R37-N2** two fresh + the two | 364/366 aboard day 60 | unchanged | `critic/c43_k_steal_fresh2.json` |
| the other 23 of run 42's 28 Japan cases | — | identical, but `steal_freshdaybefore` (above) and end-states of unordered divisions after landing (`aboard_alone`, `four_hourly`, `steal_cancelfresh`: same landings) | `critic/c43_k_*.json` |
| G, N lists (Britain, Germany, Italy) | — | identical, but R42's cases above | `critic/c43_g_*.json`, `critic/c43_n_*.json` |
| R40-N2, R39-N2, R39-N3 | open | open (`hs_desk` identical; `tm_touch` timings only; `mk_mixed_s2` ticker rows only) | `critic/c43_hs_desk.json`, `critic/c43_tm_touch.json`, `critic/c43_mk_mixed_s2.json` |
| 7019 × 20, workerDeterminism | — | save byte-identical, hashes identical | `critic/c43_seed7019_y20.bin`, `critic/c43_wd_*.log` |
| Suite Q alone | PF 120: 35.5–38.2, 30: 38.6–48; LW 59.9–60, 83 ms | PF 120: 35.5–39.2, 30: 38.6–48.2; LW 59.4–60, 83 ms | `critic/c43_pf_7019.json`, `critic/c43_lw_6151.json`, `critic/c43_lwhon_3517.json` |

## Design objections (none blocking, no score lowered)

- **R31d hands a player's transports back to the AI** the hour they stand empty. A player who stages transports at a
  port or off a coast loses them to the AI (R43-N1), and the AI then ships the player's own divisions across the world
  on them. A player-owned fleet that stays where it was put until ordered again — as warships do — with only *called*
  transports returned to the AI, would fix R41-N1's idle ships without taking the player's.
- **R31e's "nearest port".** A recall is a request to rejoin a landing; turning back for whatever port is nearest by
  straight cells makes the result depend on where the ship happens to be (R43-B1). A landing as one object — its
  transports and divisions, with one port and one sailing — remains run 41–42's objection; R31 added two more rules
  (`waitedFor`, `turnBack`) measured from different places.
- Run 33–42's objections stand: save format 2 refuses older scenarios; the jump home across the sea; an ally's coast
  refused as "a nation outside its wars".

## Ideas from other games (not scored)

- Hearts of Iron lets a naval invasion be cancelled while under way: the transports return to the port they left and
  the divisions disembark there, never at an arbitrary port.
- Many RTS games mark a group as "AI-controlled" with an icon when it reverts; a small mark on a fleet the player no
  longer commands would make R31d readable.

## Strengths (verified)

- The AI is untouched by six commits of player-order changes: 7019's 20-year save is byte-identical to run 42's, and
  workerDeterminism ends on the same hash on every arm for five seeds (`critic/c43_wd_*.log`).
- R31's own orders do not strand: across six new seeds × 120 days with 153 re-orders of divisions aboard and 98 fleet
  orders to convoy transports, no division ever sat aboard an idle ship (`critic/c43_fz3_*.json`, `idleOver72: 0`,
  `strandedN: 0`), and R31a's refusal is told in plain words at the click (`critic/c43_fs_eng15101.json`).

## Notes

- `critic/scripts/c43_os2_scen.mjs` first ran with a renamed input (`c43_critic_standoff…` did not exist); re-run after
  copying run 39's file; both passes show the title's "Could not load: it was made by an older version" and the probe's
  load wait times out, exactly as run 39's JSON (`critic/c39_os2_c25.json` `fatal`). The worktree `critic/wt` at `1eb4bf85` was used for the
  replays and removed at the end (its `node_modules` junction unlinked first). The preview was stopped.
- The page probes `c43_pn_panel.mjs` and `c43_fs_strand.mjs` pick "the two nearest London" on the page's clock; on HEAD they
  picked 274 (aboard at Portsmouth at h55) where run 42 picked 270 (h63): the same shape, one aboard and one walking.
  It is a probe artefact, not a game difference: every headless case that picks by the same rule (`c43_n_eng_16111.json`,
  `c43_n_eng3_16107.json`) and every `PICK=270,271` case is identical to run 42's.
- Early-game page probes on "new seeds" (C 17203 and 17307) show the same first days: the 1938 world's first week is
  nearly seed-independent, so those two count as one case; Z, W, PHZ, SK, RG and the 20-year world do differ.
