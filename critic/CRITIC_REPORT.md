# Critic report, run 42 (focused) — after R30

- **Mode: focused.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). (1) Run 41 (`6a1a7e7c`, on
  `77d37526`) has a blocking issue (R41-B1) and naval 7 under its bar of 8. (2) Every commit since is an R30 item, and
  R30 was filed by that report commit ("… naval 7 (bar 8); R30 filed"): `aad6a00d` R30a, `1eb4bf85` R30b, R30c.
  (3) The last three reports are focused (41), focused (40), full (39): not all focused. So: run 41's named cases
  re-run; naval (under its bar, blocked) rescored; and the dimensions the changed files touch rescored —
  `amphibious.ts`/`movement.ts` → naval; `server.ts`/`protocol.ts` (the new `toPortAboard` panel state) → stability
  and performance; `en.json` (the new panel text) → uiUxPolish. The rest carried, marked "carried".
- **This run has no blocking issue, but it is focused: a release still needs a full run with none** (ADR-804). The next
  critic run is full.
- **Commit judged:** `1eb4bf8531c271a3c711b10ff2aa274cd68c4cfc` (`critic/c42_commit.txt`). **Date:** 2026-11-05.
- **Build:** `vite build --outDir critic/c42_dist`, exit 0 (`critic/c42_build.log`), `vite preview` on 127.0.0.1:5299.
  Run 41's commit `77d37526` in a worktree (`critic/wt`), built to `critic/c42_wtdist` (`critic/c42_wtbuild.log`) and
  served on 5298, so the R41-B1 page case was played on both builds. Chromium through Playwright, desk 1600 × 900.
- **Runs:** run 41's scripts copied as `critic/scripts/c42_*` (output names only changed). Job lists
  `c42_jobsBase.txt` (baseline, determinism, checkers), `c42_jobsK.txt` (run 41's 28 Japan cases, headless by the page's
  path), `c42_jobsG.txt` (Britain, HEAD and `77d37526`), `c42_suiteMK.sh` (run 41's page cases, plus R41-B1 on 7019,
  the redirect by two clicks, and the R41-N2 recall by real click). **New:** `c42_gen.ts` gained `RECALL`/`RECALLTO`
  (the two clicked back, onto the old landing, the same landing, or home), `FLEETMOVE`/`FLEET2`/`UNITAFTER` (the
  player's own order to a loaded convoy's transports, then recovery attempts), `NOREDIRECT`; `c42_jobsN.txt` (new seeds
  and coasts, both commits), `c42_jobsF.txt`/`c42_jobsF2.txt` (transports ordered by the player); page probes
  `c42_pn_panel.mjs` (the new panel, then the two clicked home while the ship sails between ports) and
  `c42_fs_strand.mjs` (the transports of a loading landing clicked out to sea). Suite Q alone at the end
  (`critic/scripts/c42_suiteQ.sh`).
- **Baseline: R30 left every AI world alone.** The year-20 save of 7019 is byte-identical to run 41's
  (`cmp critic/c42_seed7019_y20.bin critic/c41_seed7019_y20.bin`: identical); workerDeterminism ends on the same hash on
  every arm as run 41 for 3517 (`7e113d94`), 11071 (`d2716b65`), 14011 (`30c3bbe9`) and 15013 (`56855b2d`)
  (`critic/c42_wd_*.log`). The carried scores rest on this.

## Verdict

**R30 fixes R41-B1 as run 41 stated it, by real click, on both seeds.** Britain at war with France, 270 and 271 clicked
onto Calais; the hour after 270 boards, the fresh tank brigade 276 clicked onto Caen, then the two: **all three land
together at h291** on 15101 and on 7019 (`critic/c42_mk4_eng15101_p270.json`, `critic/c42_mk4_eng7019_p270.json`;
`critic/shots/c42mk4_eng15101_p270_firstland.png`: one 26.4k stack at Caen on 13 January). The same clicks on
`77d37526` still land 276 alone at h87 and lose it at h237 (`critic/c42_mk4_old_eng15101_p270.json`). Redirected by
two clicks instead of one: the three at h291 (`critic/c42_mk4_eng15101_sep.json`). Headless, ascending ids:
290/290/291 on both seeds (`critic/c42_g_eng_15101_p270.json`, `critic/c42_g_eng_7019_p270.json`; `77d37526`: 276 at
h85 alone, destroyed h233, `critic/c42_gwt_eng_15101_p270.json`).

**R30b and R30c do what they say.** The R41-N2 recall (fresh one to Fuzhou, then the two, then the two back onto
Shanghai four hours later), by real click: nobody refused, 364 and 365 land at Shanghai h788/794
(`critic/c42_mk2_recall4.json`; run 41: 364 refused, Fuzhou h500, 365 Shanghai h794 alone). The re-click onto the
landing it has while the ship is under way refuses nothing now (`critic/c42_k_steal_reclick.json`: no `MoveRejected`;
run 41's had `t9 MoveRejected a364 … x1.0`). The panel reads "Aboard, sailing to Sasebo to load the rest of the
landing" (`critic/shots/c42mk2_freshfirst_panel_h4.png`) and, for Britain, "Aboard, sailing to Plymouth…"
(`critic/shots/c42pn_eng15101_landorder.png`).

**No blocking issue.** The new defects found are non-blocking: a land order to the one aboard while its ship ferries
between home ports is refused with a reason that is no longer true and it then lands abroad (R42-N1, R30b's remaining
hole); a port bombed shut while a division walks to it sends the convoy off with the one aboard alone (R42-N2,
pre-existing); a player's fleet order to a loaded convoy's transports strands the division aboard at sea indefinitely
under a false "bound for its landing" (R42-N3, pre-existing). **Naval stays 7**, under its bar of 8.

## Scores

| Dimension | Run 41 | Run 42 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | **Carried.** No map file changed |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | **Carried.** No rule file changed. Checkers on new seeds: diploInvariants 16013 (heroes, 400 days) and 16019 (random world) 0 broken (`critic/c42_diploinv_16013s_h.log`, `critic/c42_diploinv_16019r.log`); worldInvariants 16013 heroes+navy 10 years 0 broken (`critic/c42_wi_16013_h10_hn.log`) |
| Emergent world dynamics over long runs | 7 | 7 | **Carried.** 20-year save of 7019 byte-identical to run 41's |
| God Mode | 7 | 7 | **Carried.** |
| Editor and scenarios | 7 | 7 | **Carried.** |
| Stats and history | 7 | 7 | **Carried.** |
| UI/UX and polish | 7 | 7 | **Rescored.** R41-N3 fixed (the panel lines above). R41-B1's "1 of 2 aboard" for a landing of three is gone with it: 276's panel reads "2 of 3 aboard; the last 9 days from the port" (`critic/c42_mk4_eng15101_p270.json` `panels` h69). Still: R40-N2 (33 selected, "Your selected forces go by sea", `critic/c42_hs_desk.json`, `critic/shots/c42hs_desk_n33.png`), R39-N2 (no mark on a touch screen, `critic/c42_tm_touch.json` `before.mark: null`), R39-N3 (Escape empties the selection, mark and by-sea tooltip stay, `critic/c42_mk_mixed_s2.json` `afterEsc`). New: R42-N1's refusal text ("it is aboard transports and takes no order until it lands") for a division that takes orders at the port it reaches next day (`critic/shots/c42pn_eng15101_landorder.png`); R42-N3's "At sea, bound for its landing" for twelve days on transports going nowhere (`critic/shots/c42fs_eng15101_d12.png`). Not 8: these, the same class run 38–41 scored 7 |
| Performance | 7 | 7 | **Rescored** (`server.ts`'s new panel state). Suite Q alone (the two previews only; PF and LW re-run by `critic/scripts/c42_suiteQ2.sh` after the first pass overlapped two headless probes, kept as `critic/c42_pf_7019_contended.json`, `critic/c42_lw_6151_contended.json`): PF 7019 y20 (min–max fps, worst p95) 3,000 m/px 60–60.2, 18.5 ms; 1,200 59–60.2; 600 60–60.2; **120: 35.5–38.2** (run 41 37.1–38.2, run 40 34.5–39.1); **30: 38.6–48** (run 41 38.5–47.1) (`critic/c42_pf_7019.json`); LW 6151 ten years 59.9–60 fps, longest gap 83 ms, none over 500 ms (`critic/c42_lw_6151.json`); LWHON 3517 (heroes) 59.9–60 fps, longest gap 83 ms, none over 500 ms (`critic/c42_lwhon_3517.json`), all as run 41. **Not 8:** 35–48 fps at unit zoom on a year-20 world, as before |
| Stability | 7 | 7 | **Rescored.** Save of 7019 byte-identical; workerDeterminism the same end hashes on 3517, 11071, 14011, 15013 on every arm; checkers 0 broken on new seeds; a save taken while R29b's ship sails Tokyo → Sasebo (t12, the R30a/R30b state) and one while it waits at Sasebo (t200) load to the same hash, step identically to t900 and land h790/790/792 as the unsaved run (`critic/c42_sl_t12.json`, `critic/c42_sl_t200.json`, 0 diffs); no page error in any page JSON of this run (`errors: []`). **Not 8:** run 41 held it at 7 for R41-B1, which is fixed, but R42-N3 is a state the game never leaves on its own: a division aboard at sea for 25 days and counting, its mate waiting at the port as long (`critic/c42_f_control.json`, `critic/c42_fs_eng15101.json`), reached by one ordinary fleet order |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Carried.** |
| Naval warfare (needs 8) | 7 | **7** | **Rescored.** R41-B1 fixed, R41-N2 and R41-N3 fixed, R40-N1's re-click fixed (Verdict). **Not 8:** R41-N1 unchanged (365 walks Tokyo → Sasebo for ~29 days while its landing waits, `critic/c42_k_steal_freshfuzhou.json` `trace` t4–t769); R42-N1 (new, R30b's hole); R42-N2 and R42-N3 (pre-existing, found this run, both builds); R40-N1 (re-sent alone and recalled: refused) and R37-N2 unchanged |
| Tanks (needs 8) | 8 | 8 | **Carried.** (R41-B1's lost tank brigade now lands with the others) |
| Aircraft (needs 8) | 8 | 8 | **Carried.** No air file changed |
| AI nuclear use (needs 8) | 8 | 8 | **Carried.** |

## Run 41's cases re-run

| Run 41 case | `77d37526` (run 41) | HEAD `1eb4bf85` | Evidence |
|---|---|---|---|
| **R41-B1** by real click, 15101 (270/271 → Calais, then 276 and the two → Caen) | 276 alone h87, destroyed h237; 270/271 h291 | **all three h291** | `critic/c42_mk4_eng15101_p270.json`; same clicks on `77d37526` re-played: `critic/c42_mk4_old_eng15101_p270.json` (h87 / dead h237 / h291) |
| R41-B1 by real click, 7019 | as 15101 | **all three h291** | `critic/c42_mk4_eng7019_p270.json` |
| R41-B1, the two by two clicks | — | all three h291 (one "leftLanding" row for 270 after the first click, true at that moment) | `critic/c42_mk4_eng15101_sep.json` |
| R41-B1 headless, ascending ids, 15101 / 7019 | 276 h85 alone, dead h233 / same | 290/290/291 both | `critic/c42_g_eng_*_p270.json`, `critic/c42_gwt_eng_*_p270.json` |
| **R41-N2** recall 4 h later, by real click | 364 refused, Fuzhou h500; 365 Shanghai h794 | **364/365 Shanghai h788/794**, nobody refused | `critic/c42_mk2_recall4.json` |
| R41-N2 headless, recall 4 h / 1 day | 364 Fuzhou 477; 365 Shanghai 771 | 765/771 both | `critic/c42_k_steal_recall_h4.json`, `…_d1.json` |
| the steal, then all three 3 SW of Shanghai a day later | 364 refused, alone h178 | **770/768/767 together** | `critic/c42_k_steal_then_sw3.json` |
| the steal, re-clicked onto Fuzhou 6 h later (R40-N1's re-click) | 364 refused `Aboard` | **no refusal**, 793/791/791 | `critic/c42_k_steal_reclick.json` |
| **R41-N3** panel while sailing to Sasebo | "At sea, bound for its landing" | "Aboard, sailing to Sasebo to load the rest of the landing" | `critic/shots/c42mk2_freshfirst_panel_h4.png` |
| **R41-N1** 365 walks to Sasebo | t3–t700 | unchanged (bound 1152, 1794 → 1767 by t601, aboard t769) | `critic/c42_k_steal_freshfuzhou.json` |
| R40-B1 by real click, 3517 / 14003 / 14011 | 814/814/820 | 814/814/820 | `critic/c42_mk2_freshfirst*.json` |
| R40-B2 four 3 SW by click; two by one click; leavers first | h1244 no row; h682 no row; h1006 | same, `news: []` | `critic/c42_lwt5_four_allsw63.json`, `critic/c42_mk2_nofresh2.json`, `critic/c42_mk2_leaversfirst.json` |
| the rest of run 41's 28 Japan cases (`c42_jobsK.txt`) | — | landing hours identical to run 41's (only recall_h4, recall_d1 and steal_then_sw3 moved, above) | `critic/c42_k_*.json` against `critic/c41_k_*.json` |
| R40-N1 (one re-sent alone; recalled a day later) | 150; recall refused | unchanged | `critic/c42_k_aboard_alone.json`, `critic/c42_k_back.json` |
| R37-N2 (two fresh, one far north) | 365 alone h656; 364/366 wait | unchanged | `critic/c42_k_steal_fresh2.json` |
| R40-N2, R39-N2, R39-N3 | open | unchanged | UI row above |
| save/load mid-sail t12, t200 | 0 diffs | 0 diffs | `critic/c42_sl_*.json` |
| AI worlds: 7019 × 20, workerDeterminism | — | save byte-identical; hashes identical | `critic/c42_seed7019_y20.bin`, `critic/c42_wd_*.log` |
| Suite Q alone | PF/LW as run 40 | within run 38–41's spread (Performance row) | `critic/c42_pf_7019.json`, `critic/c42_lw_6151.json`, `critic/c42_lwhon_3517.json` |

## New cases (new seeds and variants, both commits)

| Case | `77d37526` | HEAD | Evidence |
|---|---|---|---|
| Britain 16107, three nearest London → Calais, then fresh + three → Caen | 274 refused `Aboard` (t56), two "leftLanding"; all four 283–285 | **nothing refused, no row**; all four 283–285 | `critic/c42_nwt_eng3_16107.json`, `critic/c42_n_eng3_16107.json` |
| Britain 16111, two nearest | 284/284/285 | 284/284/285 | `critic/c42_n_eng_16111.json` |
| Britain 15101, the two recalled to Calais 4 h after the redirect | 270 refused, lands Caen h100 with 276; 271 Calais h81 alone | 270/271 Calais h300 together; 276 (its own order) Caen alone h89, lost h231 | `critic/c42_gwt_eng_15101_p270_recall4.json`, `critic/c42_g_eng_15101_p270_recall4.json` |
| … re-clicked onto Caen 4 h after | 270 refused; 276 alone h85 | no refusal; 290/290/291 | `critic/c42_g*_eng_15101_p270_reclick.json` |
| … the two clicked home (inland) 4 h after | 270 refused, lands Caen h100 with 276, both destroyed (h341/353) | **the same** (h100/101, destroyed h352/495) | `critic/c42_g*_eng_15101_p270_land.json`; by real click `critic/c42_pn_eng15101.json` (R42-N1) |
| Britain 16117, recalled to Calais 30 h after the redirect | 274 Calais alone h199 (271 refused `PortShut` t178), lost h464; 276 Caen alone, lost | **the same** | `critic/c42_nwt_eng_16117_recall30.json`, `critic/c42_n_eng_16117_recall30.json` (R42-N2) |
| Britain 15101, 270 aboard at Portsmouth, its transports ordered to sea by the player (no redirect) | 270 aboard at sea, 271 waiting at Portsmouth, to day 25 | **the same**; by real click to day 12 | `critic/c42_fwt_control.json`, `critic/c42_f_control.json`, `critic/c42_fs_eng15101.json` (R42-N3) |
| Germany 16101/16103 (Hamburg → Norfolk), Italy 16113 (Naples → Corfu) | refused `NoTransports` / `NoRoute` at the first order | the same | `critic/c42_n_ger_*.json`, `critic/c42_n_ita_16113.json`: **not engaged**, no evidence either way |

## Blocking issues

None.

## Non-blocking issues (prioritised)

1. **R42-N1. A land order to the one aboard while its transports ferry it between home ports is refused with a reason
   that is not true, and it then lands abroad.** Britain 15101, by real click: R41-B1's case; while 270's ship sails
   Portsmouth → Plymouth (panel "Aboard, sailing to Plymouth to load the rest of the landing"), 270 and 271 are selected
   and clicked onto the English Midlands. 271 obeys; 270 is refused: "Infantry division 270: not done: it is aboard
   transports and takes no order until it lands" (`critic/c42_pn_eng15101.json` `rowsAfterLand`,
   `critic/shots/c42pn_eng15101_landorder.png`). It then sails with 276's convoy and lands at Caen by h119
   (`arriveTrace`); headless the two at Caen are destroyed h352/h495 (`critic/c42_g_eng_15101_p270_land.json`). An hour
   earlier, aboard at Portsmouth, the same click would have put it ashore; a day later, at Plymouth, it would too. SPEC
   (R30b) refuses "anything else", so the refusal itself is specified — but the words promise the player nothing will
   change until it lands, and the player is not told the ship then takes it to France. Identical on `77d37526` (R29b's
   state since `76b88197`), so it moves no score by itself; it is the one order R30b's fix left behind. **Fix:** on
   arrival at the port, take the refused order (or hold it ashore), or at least say "it takes an order at <port>" and
   do not sail it to the landing it was refused away from without a row.
2. **R42-N2. A port bombed shut while a division walks to it sends the convoy waiting there off with the one aboard
   alone.** Britain 16117: the two recalled to Calais 30 h after the redirect; 274 is aboard group 1068 at port 538
   from t122, 271 walks there; at t178 271 is refused `PortShut`; at t194 1068 sails with 274 alone, it lands at Calais
   h199 and is destroyed h464; 271 stands on the Kent coast to the end (`critic/c42_n_eng_16117_recall30.json`). The
   same with the transports sent back to Portsmouth (`critic/c42_f2_backport.json`: 271 refused `PortShut` t120, 270
   lands alone h135, destroyed h304). Same on `77d37526`. SPEC R21b says only that the division is refused `PortShut`;
   not that its convoy then sails without it. R36-B1's shape (a convoy whose bound division is refused sails with the
   one aboard alone), from enemy bombing instead of a click.
3. **R42-N3. A player's fleet order to a loading convoy's transports strands the division aboard at sea.** Britain
   15101, by real click: 270 aboard group 1068 at Portsmouth waiting for 271; 1068 selected and clicked onto the
   Channel. It sails there and stays; 270 is aboard at sea for the 12 days played (25 headless), its panel "At sea,
   bound for its landing" throughout; 271's "waiting at Portsmouth" as long; no row (`critic/c42_fs_eng15101.json`
   `trace`, `panel270_d12`; `critic/shots/c42fs_eng15101_d12.png`; headless `critic/c42_f_control.json`, the same on
   `77d37526` `critic/c42_fwt_control.json`). 270 itself refuses every order (`Aboard`, `critic/c42_f2_unitcalais.json`,
   `critic/c42_f2_unithome.json`). Ordering 1068 back to Portsmouth's water is the only way out found
   (`critic/c42_f2_backport.json`), and the player is told nothing that suggests it. SPEC does not cover a player's
   order to a convoy's transports. **Fix:** refuse a fleet order to a group with a convoy (or carrying), or end the
   convoy and treat it as at sea (land or go home).
4. **R41-N1** unchanged: 365 bound for Sasebo walks ~29 days while the transports called for it stand empty at Tokyo
   (`critic/c42_k_steal_freshfuzhou.json` `trace`). The R41-N2 recall now costs ~5 days over the pre-R29b build
   (765/771 against 631/632) for the same reason: the ship goes on to Sasebo and the landing loads there.
5. **R40-N1, R37-N2, R40-N2, R39-N2, R39-N3** unchanged (table above).
6. **Headless and page differ on an unordered division of the player's nation.** In `c42_gen.ts` (`setPlayer`, then the
   war) the fresh brigade 276, never ordered, is put aboard a group and sailed far south-west
   (`critic/c42_f_control.json` `end`: `276:aboard1072@785.2,399.5`), as run 41 noted for a God Mode spawn; in the page
   (war, then Take control) it stands at Plymouth (`critic/c42_fs_eng15101.json`). Not followed up; the headless
   end-states of unordered divisions are caveated, not filed.
7. Carried: **R37-N3, R37-N4, R36-N3, R32-N2, R32-N3, R31-N1, R31-N6, R32-N5, R39-N4**, and two paradrop refusals in
   one click showing one row.

## Design objections (none blocking, no score lowered)

- R30b keeps R29b's ferry between home ports as "at sea" for every order but one over the sea from the next port.
  R42-N1 is the result. A division aboard a player's convoy under way between two of the player's own ports could take
  any order as at the port it reaches (go ashore there and march), which is what a player expects from a ferry.
- Two convoys for one target at one port still load and sail apart; R30a makes the moving one a mate while it sails.
  Run 41's objection stands: a landing as one object (the groups and divisions for one target, sailing when the last is
  in, ended or held when one is refused) would make R21e, R28, R29, R30 and R42-N2 one rule.

## Ideas from other games (not scored)

- Hearts of Iron cancels a naval invasion whose port is lost or blockaded before launch and tells the player, rather
  than sending the part already embarked.
- Most RTS games lock a transport's orders while it carries an assigned landing force, or give the transport a
  "return to port and unload" order the player can see.

## Strengths (verified)

- R30a is a real fix at the page: the same real clicks that lost the tank brigade on `77d37526` now land all three
  together on both seeds and by one or two clicks (`critic/c42_mk4_eng15101_p270.json`,
  `critic/c42_mk4_eng7019_p270.json`, `critic/c42_mk4_eng15101_sep.json`), and on a new seed with three divisions the
  old build's refusal and false "leftLanding" rows are gone (`critic/c42_n_eng3_16107.json`).
- The fix touches nothing else: 25 of run 41's 28 Japan cases land at the same hours, the three that moved all moved to
  one landing together, and the AI's 20-year world is byte-identical (`critic/c42_seed7019_y20.bin`).

## Notes

- The worktree `critic/wt` at `77d37526` was used for the replays and removed at the end (its `node_modules` junction
  unlinked first). Both previews were stopped.
