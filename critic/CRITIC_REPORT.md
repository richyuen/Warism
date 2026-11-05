# Critic report, run 41 (focused) — after R29

- **Mode: focused.** Decided from git before anything else (CRITIC_PROMPT, ADR-804). (1) Run 40 (`27d14686`, on
  `76b88197`) has two blocking issues (R40-B1, R40-B2) and naval 7 under its bar of 8. (2) Every commit since is an R29
  item, and R29 was filed by that report commit ("… naval 7 (bar 8); R29 filed"): `2b115a28` R29a, `e7317fc5` R29b;
  `77d37526` changes only `PROGRESS.md`. (3) The last three reports are focused (40), full (39), focused (38): not all
  focused. So: run 40's named cases re-run; naval (under its bar, blocked) rescored; and the dimensions the changed files
  touch rescored — `amphibious.ts`/`movement.ts` → naval; `server.ts`/`protocol.ts`/`simClient.ts` (the worker's new
  `cmds` message) → stability and performance; `hud.ts`/`player.ts` (a click's orders sent together) → uiUxPolish, and
  aircraft (the paradrop of a selection goes the same way). The rest carried, marked "carried". This run is not clean.
- **Commit judged:** `77d37526eef9a0a7c244b62310669146e4305ce0` (`critic/c41_commit.txt`). **Date:** 2026-11-05.
- **Build:** `vite build --outDir critic/c41_dist`, exit 0 (`critic/c41_build.log`), `vite preview` on 127.0.0.1:5299
  (`critic/c41_preview.log`). Run 40's commit `76b88197` in a worktree (`critic/wt`), built to `critic/c41_wtdist` and
  served on 5298 (`critic/c41_wtbuild.log`), so every new page case was played on both builds. Chromium through
  Playwright, desk 1600 × 900.
- **Runs:** `c41_ll4.ts` (run 40's `c40_ll3` with `NOW=click`: each click's orders taken, then applied together at once —
  what `hud.commands` → the worker's `cmds` now does; `TRACEG` traces transport groups), job list
  `critic/scripts/c41_jobsK.txt` (28 cases, `critic/c41_k_*.json`); the old game path (`c40_ll3 NOW=1`, each order at
  once) on the worktree (`critic/c41_wt_*.json`); page probes by real click `c41_mk2_steal.mjs` (run 40's, plus
  `RECALL`), `c41_lwt5.mjs`, `c41_mk_mark.mjs`, `c41_tm_touch.mjs`, `c41_hs_hintsel.mjs`; **new**: `c41_gen.ts` (the same
  redirect on any coast, `ASC=1` sends a click's orders by ascending id as `player.ts` does, `PER=1` one at a time as the
  old page did), `c41_mk4_eng.mjs` (Britain's redirect by real clicks), `c41_pd_paradrop.ts` (a selection's paradrop by
  real click), `c41_sl.ts` (save and load while R29b's ship is under way). Baseline and checkers:
  `critic/scripts/c41_jobsBase.txt`. Suite Q alone at the end (`critic/scripts/c41_suiteQ.sh`).
- **Baseline: R29 left every AI world alone.** The year-20 save of 7019 is byte-identical to run 40's
  (`cmp critic/c41_seed7019_y20.bin critic/c40_seed7019_y20.bin`); workerDeterminism ends on the same hash on every arm
  for 3517 (`7e113d94`), 11071 (`d2716b65`) and 14011 (`30c3bbe9`) as run 40, and on new seed 15013 (`56855b2d`)
  (`critic/c41_wd_*.log`). The carried scores rest on this.

## Verdict

**R29 fixes both of run 40's blocking issues as run 40 stated them, by real click.** The four of a landing re-clicked
three cells south-west: no "leftLanding" row, no notice, all four land h1244 (`critic/c41_lwt5_four_allsw63.json`
`news: []`; run 40: three false rows). A fresh division to Fuzhou, then the two of the Shanghai landing: all three land
within six hours (page h814/814/820 on seeds 3517, 14003, 14011, `critic/c41_mk2_freshfirst*.json`; run 40: 682 alone,
then 1318), and 364 is "Aboard at Sasebo, waiting for the rest of the landing; 1 of 3 aboard; the last 20 days from the
port" on day 10, never "Marching to Sasebo" (`critic/shots/c41mk2_freshfirst_day10.png`).

**One blocking issue, found by playing the same redirect on another coast.**

- **R41-B1.** R29b keeps the one aboard on its own transports and sails them to the new landing's port, but those
  transports do not join that port's convoy: the convoy already loading there sails as soon as its own are aboard, and
  the division that was there first lands alone. Britain at war with France, by real clicks on the HEAD page: a fresh
  tank brigade sent to Caen, then the two divisions of a Calais landing sent there too — the brigade lands alone on day
  4 and is destroyed on day 10; the two land on day 12. On run 40's build the same clicks land all three together on
  day 12. A regression, and it contradicts `sailAboard`'s own claim ("to load the rest there and sail with that port's
  convoys").

**Naval stays 7**, under its bar of 8. Every other rescored dimension holds; the carried ones are carried on the
byte-identical 20-year save.

## Scores

| Dimension | Run 40 | Run 41 | |
|---|---|---|---|
| Map visuals and readability | 7 | 7 | **Carried.** No file of the map changed; the marks as run 40 (`critic/c41_mk_mixed_s2.json` `hover`: two marks, green kept, orange new) |
| Diplomacy, war, alliance, puppet, revolt depth | 7 | 7 | **Carried.** No rule file changed. Checkers on new seeds: diploInvariants 15013 (heroes, 400 days) and 15017 (random diplomacy) 0 broken (`critic/c41_diploinv_15013s_h.log`, `critic/c41_diploinv_15017r.log`); worldInvariants 15013 heroes+navy 10 years 0 broken (`critic/c41_wi_15013_h10_hn.log`) |
| Emergent world dynamics over long runs | 7 | 7 | **Carried.** 20-year save of 7019 byte-identical to run 40's |
| God Mode | 7 | 7 | **Carried.** |
| Editor and scenarios | 7 | 7 | **Carried.** |
| Stats and history | 7 | 7 | **Carried.** |
| UI/UX and polish | 7 | 7 | **Rescored.** R40-B2 fixed by real click (above). Still: R40-N2 (33 selected, 29 marching by land, told "Your selected forces go by sea", `critic/c41_hs_desk.json`, `critic/shots/c41hs_desk_n33.png`), R39-N2 (no mark on a touch screen, `critic/c41_tm_touch.json` `before.mark: null`), R39-N3 (Escape empties the selection, the mark and the by-sea tooltip stay, `critic/c41_mk_mixed_s2.json` `afterEsc`). New: in R41-B1 the waiting division's panel reads "1 of 2 aboard" for a landing of three after the third has sailed off alone, and nothing tells the player it went (`critic/c41_mk4_eng15101_p270.json` `panels` h123, `news: []`); the one aboard whose ship sails to another port to wait three weeks reads "At sea, bound for its landing" (`critic/shots/c41mk2_freshfirst_panel_h4.png`, R41-N3). Not lowered: the false notice of run 40 is gone, and these are the same class run 38–40 scored 7 with |
| Performance | 7 | 7 | **Rescored** (the worker's `cmds`). Suite Q alone (the two previews only): PF 7019 y20 (min–max fps, worst p95) 3,000 m/px 60–60.1, 18.2 ms; 1,200 58.8–60.1; 600 60–60.2; **120: 37.1–38.2** (run 40 34.5–39.1); **30: 38.5–47.1** (run 40 39.5–49.1) (`critic/c41_pf_7019.json`); LW 6151 ten years 59.9–60 fps, longest gap 83 ms, none over 500 ms, as run 40 (`critic/c41_lw_6151.json`); LWHON 3517 (heroes) 59.9–60 fps, longest gap 83 ms, none over 500 ms, as run 40 (`critic/c41_lwhon_3517.json`). A click's orders are one message now; nothing measurable. **Not 8:** 37–47 fps at unit zoom on a year-20 world, as before |
| Stability | 7 | 7 | **Rescored.** Save of 7019 byte-identical; workerDeterminism the same end hashes on 3517, 11071, 14011 and on new 15013 on every arm; checkers 0 broken on new seeds (above); a save taken while R29b's ship sails Tokyo → Sasebo with 364 aboard (t12) and one while it waits at Sasebo (t200) load to the same hash, step identically for 900 h and land h790/790/792 as the unsaved run (`critic/c41_sl_t12.json`, `critic/c41_sl_t200.json`, 0 diffs); no page error in any page JSON of this run. **Not 8:** R41-B1 |
| Semantic zoom to unit level (needs 8) | 8 | 8 | **Carried.** |
| Naval warfare (needs 8) | 7 | **7** | **Rescored.** R40-B1 and R40-B2 fixed (Verdict; replica table below). **Not 8: R41-B1 (blocking)**; R41-N1 (the bound one walks to the other port while its called transports idle empty at Tokyo); R41-N2 (a redirect undone four hours later now splits the landing: page-proven regression); R40-N1 and R37-N2 unchanged |
| Tanks (needs 8) | 8 | 8 | **Carried.** (R41-B1's lost brigade is a tank brigade; the loss is the convoy rule's, scored under naval) |
| Aircraft (needs 8) | 8 | 8 | **Rescored** (`player.ts`'s paradrop now goes as one batch). Three garrison brigades at Germany's transport base, selected, Paradrop armed, Warsaw clicked: the first dropped 0.37 cells from Warsaw, the other two refused `NoAirlift` — identical on HEAD and on `76b88197` (`critic/c41_pd_head3.json`, `critic/c41_pd_old3.json`); one brigade alone dropped (`critic/c41_pd_head1.json`). Of the two refusals only one row shows on both builds (pre-existing, `critic/shots/c41pd_head3.png`) |
| AI nuclear use (needs 8) | 8 | 8 | **Carried.** |

## R29, case by case

Headless, seed 3517, Japan, the divisions nearest Tokyo sent to Shanghai, re-ordered two hours after the first is aboard
(h = landing hour). "HEAD click" is `c41_ll4 NOW=click` (the game's path since R29a); "76b8 game path" is run 40's
per-order replica on the worktree.

| Item | Case | HEAD click | 76b8 game path (run 40) | Evidence |
|---|---|---|---|---|
| R29b | **a fresh one to Fuzhou first, then the two** (same hour) | **791/791/793**, no notice | 657 alone, 1291/1291 | `critic/c41_k_steal_freshfuzhou.json`; run 40 `critic/c40_now_steal_freshfuzhou.json` |
| R29b | the same, seeds 14003, 14011, 13001 | 791/791/793 each | — | `critic/c41_k_steal_freshfuzhou_1400{3,11}.json`, `…_13001.json` |
| R29b | the same, fresh one an hour / a day before | 791–793 / 839–841 | 1292 / 1316–1318 | `critic/c41_k_steal_freshhourbefore.json`, `…_freshdaybefore.json` |
| R29b | the same by real click (3517, 14003, 14011) | **814/814/820**; 364 "Aboard at Sasebo, waiting…" days 5–20 | 682 alone, 1318 | `critic/c41_mk2_freshfirst*.json`, `critic/shots/c41mk2_freshfirst_day10.png` |
| R29b | groups traced | 364 aboard 1136 Tokyo → Sasebo t3–t121 (R29b); **365 re-bound from 1144 to 1152 at Sasebo and walks there t3–t700 while 1144 stands empty at Tokyo** (R41-N1) | — | `critic/c41_k_steal_freshfuzhou_groups.json` |
| R29a | four re-clicked 3 cells SW (aboard+2 / h26) | together 1243/1244, no notice | together 1244, three told | `critic/c41_k_four_all_sw3*.json` |
| R29a | the same by real click | together h1244, `news: []` | three LeftLanding rows | `critic/c41_lwt5_four_allsw63.json` |
| R29a | two re-sent to Fuzhou by one click (page) | together h682, no row | 364 told | `critic/c41_mk2_nofresh2.json` |
| R29a | the two first, then the fresh one (page / replica) | h1006 together / 978–979 | 978/979 | `critic/c41_mk2_leaversfirst.json`, `critic/c41_k_leaversfirst_fz.json` |
| — | both far; three, two far; six far; four, two far | 656/657; 656/657 + 951; 1266/1267; 656/657 + 1242 | as run 40 | `critic/c41_k_bothfar.json`, `…three_twofar.json`, `…six_all_far.json`, `…four_two_far.json` |
| — | one click of three; three from a standing start | 978/979; 976/977 | 979/980; 976/977 | `critic/c41_k_click_plus_fresh.json`, `…fresh3_base.json` |
| R40-N1 | one aboard re-sent alone; recalled a day later | 150 alone; recall refused `Aboard` | same | `critic/c41_k_aboard_alone.json`, `…back.json` |
| R40-N1 | four re-sent an hour apart | 150, then 1267 | 151, then 1268 | `critic/c41_k_four_hourly.json` |
| new | the steal, then the two recalled to Shanghai 4 h / 1 day after | **364 refused `Aboard` (its ship under way to Sasebo), lands Fuzhou h477 with 366; 365 Shanghai h771** | 4 h: both Shanghai 631/632; 1 day: 149/632 | `critic/c41_k_steal_recall_h4.json`, `…_d1.json`; `critic/c41_wt_steal_recall_*.json` (R41-N2) |
| new | the same 4 h recall by real click | 364 refused, lands Fuzhou h500; 365 Shanghai h794 | both Shanghai h656 | `critic/c41_mk2_recall4.json`, `critic/shots/c41mk2_recall4_recall.png`; `critic/c41_mk2_old_recall4.json` |
| new | the steal, then the two re-clicked onto Fuzhou 6 h later | together 791/793, but 364 refused `Aboard` | 365 alone 657, 1291 | `critic/c41_k_steal_reclick.json`, `critic/c41_wt_steal_reclick.json` |
| new | the steal, then all three to 3 SW of Shanghai a day later | 364 refused, lands alone h178; 365/366 767/768 | 365 alone 634; 977/979 | `critic/c41_k_steal_then_sw3.json`, `critic/c41_wt_steal_then_sw3.json` |
| new | the steal, then the fresh one sent home 6 h later | 364/365 land 793/791 | — | `critic/c41_k_steal_cancelfresh.json` |
| new | two fresh (one in the far north), then the two | 365 alone h656; 364/366 aboard at Sasebo at day 60 waiting for a walker | **the same** | `critic/c41_k_steal_fresh2.json`, `critic/c41_wt_steal_fresh2.json` (R37-N2's class; moves no score) |
| new | the steal unescorted; with four; one alone | 791/793; 1266/1267; 475/477 + 632 | — | `critic/c41_k_steal_noescort.json`, `…four.json`, `…one.json` |
| new | save/load mid-sail (t12, t200) | same hash, same landings | — | `critic/c41_sl_t12.json`, `critic/c41_sl_t200.json` |

## Blocking issues

1. **R41-B1. The one aboard sails on its own transports to the new landing's port, but they never join the convoy
   loading there: that convoy sails as soon as its own are aboard, and the division that was there first lands alone
   and dies.** Britain at war with France (seed 15101; 7019 gives the same — the opening weeks do not depend on the
   seed). By real clicks on the HEAD page: divisions 270 and 271 selected and clicked onto Calais; 270 boards group 1068
   at Portsmouth (tick 63), 271 marches to it. Paused at tick 64: the fresh tank brigade 276 (by Plymouth) selected and
   clicked onto the Normandy coast at Caen, then 270 and 271 selected and clicked there. 276 boards at Plymouth and its
   group sails at once; 270's group sails Portsmouth → Plymouth with 270 aboard (R29b) and waits there for 271, which
   marches; **276 lands alone at Caen h87 (4 January) and is destroyed h237; 270 and 271 land h291**
   (`critic/c41_mk4_eng15101_p270.json` `steps`, `landed`; `critic/shots/c41mk4_eng15101_p270_firstland.png`: the
   1,792-man brigade alone on the beach; same on 7019, `critic/c41_mk4_eng7019_p270.json`). Nothing tells the player:
   no order news, and 270's panel at h123 reads "Aboard at Plymouth, waiting for the rest of the landing; 1 of 2
   aboard" (`panels`). **On `76b88197`, the same clicks land all three together at h291** (`critic/c41_mk4_old_eng15101_p270.json`;
   the old per-order replica agrees, `critic/c41_gwtper_eng_15101_pick270_271.json`: 290/291/291). Headless, the click
   sent in ascending id as `player.ts` sends it (`c41_gen.ts ASC=1 PICK=270,271`): the same split, 276 h84 alone,
   destroyed h233 (`critic/c41_g_eng_15101_pick270_271.json`). **Why** (`critic/c41_g_eng_15101_hourly.json`, the case with
   the order reversed): after the click, 1068 has `convoyPort` Plymouth and 271 stays bound for 1068, so nobody is bound
   for 276's group 1072, and `convoySystem` sails a loading group once "no division bound for it that would fit is still
   to come"; the two groups for one target at one port are two convoys. It happens when the one aboard is first in the
   click and its group has room for the one still marching to it — in Japan's case 365 does not fit on 1136 and is
   bound to 1152 at Sasebo, which is why the R29b AT (`landingJoinsAboard1938.test.ts`) does not see it. **Blocking**
   because a click the player gives in the natural way splits one landing, the first ashore alone and lost, a regression
   from run 40's build on the same clicks, and it contradicts R29b's claim (SPEC §6.2: "they sail to that port with it
   and load the rest there"; `sailAboard`: "to load the rest there and sail with that port's convoys"). **Fix:** a
   group `sailAboard` sends to a port where a convoy for the same target loads is one with it — that convoy waits for it
   (and for those still bound for it) as for a division still to come, or the leavers still marching are bound to the
   port's convoy, not to the ship under way. AT, by the page's path (`player.click`, ids ascending): Britain 15101, the
   case above — all three land within a day of each other, 276 never alone; and the Japan cases of R29b unchanged.

## Non-blocking issues (prioritised)

1. **R41-N2. A redirect undone a few hours later now splits the landing (page-proven regression).** The R40-B1 case
   (fresh one to Fuzhou, then the two), then the two re-clicked onto Shanghai four hours later: 364, whose ship R29b sent
   to sea for Sasebo, is refused ("not done: it is aboard transports and takes no order until it lands") and lands at
   Fuzhou h500 with the fresh one; 365 obeys and lands at Shanghai alone h794 (`critic/c41_mk2_recall4.json`,
   `critic/shots/c41mk2_recall4_recall.png`). On `76b88197` the same clicks bring both back to Shanghai, h656 together
   (`critic/c41_mk2_old_recall4.json`). The refusal is told, and SPEC's "aboard anything else, it takes none" covers it;
   R40-N1's class, now reached by a misclick on any landing whose ship can sail to another port.
2. **R41-N1. The bound half of R40-B1 is not done.** Run 40's fix asked for "a leaver aboard (or bound for) a group";
   R29b keeps only the one aboard. 365, bound for group 1144 which is sailing to Tokyo for it, is re-bound to 1152 at
   Sasebo and walks there for ~29 days while 1144 stands empty at Tokyo; the convoy waits for it, so the landing is
   h791 where 365 sailing would have let it go ~h500 (`critic/c41_k_steal_freshfuzhou_groups.json` `trace`, `G1144@1819.5,386.5 n0`
   from t73 to t793).
3. **R41-N3. "At sea, bound for its landing" for a division whose ship is sailing to a home port to wait there.** 364
   on day 1 (`critic/shots/c41mk2_freshfirst_panel_h4.png`); it then waits at Sasebo 24 days.
4. **R40-N1** unchanged (`critic/c41_k_back.json`, `critic/c41_k_four_hourly.json`). A re-click onto the same landing
   while R29b's ship is under way is refused `Aboard` (`critic/c41_k_steal_reclick.json`), where SPEC says an order to
   the landing it is aboard for "changes nothing".
5. **R40-N2, R39-N2, R39-N3** unchanged (UI row above).
6. **R37-N2** unchanged: a loaded convoy waits for any later order to the same coast — two fresh ones to Fuzhou, one
   in the far north: 364 and 366 still aboard at Sasebo on day 60, on both builds (`critic/c41_k_steal_fresh2.json`,
   `critic/c41_wt_steal_fresh2.json`).
7. Two paradrop refusals in one click show one row (both builds, `critic/c41_pd_head3.json` `rows`).
8. **R37-N3, R37-N4, R36-N3, R32-N2, R32-N3, R31-N1, R31-N6, R32-N5, R39-N4**: unchanged (carried dimensions).

## Run 40's cases re-run

| Run 40 case | On HEAD (`77d37526`) | Evidence |
|---|---|---|
| R40-B1 (fresh first, then the two; page, three seeds; hour/day before) | **Fixed**: 814/814/820 by click, 791/793 by the replica, 364 never walks; but see R41-B1, R41-N1 | `critic/c41_mk2_freshfirst*.json`, `critic/c41_k_steal_*.json` |
| R40-B2 (four 3 SW by click; two by one click) | **Fixed**: no row, together h1244; h682, no row | `critic/c41_lwt5_four_allsw63.json`, `critic/c41_mk2_nofresh2.json` |
| R40-N1 | unchanged | above |
| R40-N2 | unchanged | `critic/c41_hs_desk.json` |
| R39-N2, R39-N3 | unchanged | `critic/c41_tm_touch.json`, `critic/c41_mk_mixed_s2.json` (landings 656/656/470 as run 40) |
| run 40's `ll`/`now` lists | as the table above | `critic/c41_k_*.json` |
| AI worlds: 7019 × 20, workerDeterminism | save byte-identical; hashes identical | `critic/c41_seed7019_y20.bin`, `critic/c41_wd_*.log` |
| Suite Q alone | PF and LW within run 38–40's spread (Performance row) | `critic/c41_pf_7019.json`, `critic/c41_lw_6151.json`, `critic/c41_lwhon_3517.json` (`critic/c41_suiteQ.out`) |

## Design objections (none blocking, no score lowered)

- R29b makes a redirect irrevocable for the days the ship sails between home ports (R41-N2): the "aboard, takes no
  order" rule was written for ships at sea toward a landing, and now covers a ferry between two of the player's own
  ports. Letting a division aboard a player's convoy group under way to a home port take an order (go ashore at
  arrival) would keep the old undo.
- Two convoys for one target at one port load and sail apart (R41-B1's mechanism). A landing as one object — the set of
  groups and divisions for one target, sailing when the last is in — would make R21e, R28 and R29's special cases one
  rule. Run 40's objections stand.

## Ideas from other games (not scored)

- Hearts of Iron re-plans a naval invasion's transports as one operation when divisions are added; the operation does
  not launch until every assigned division is embarked.
- Supreme Ruler's order preview lists each unit's arrival day; R41-B1 would show one unit arriving eight days early.

## Strengths (verified)

- R29a is a real fix, not a test fix: the order of a click is now one message to the worker (`cmds`), the page
  shows no false "leftLanding" on any whole-landing redirect played (`critic/c41_lwt5_four_allsw63.json`,
  `critic/c41_mk2_nofresh2.json`), and the builder's e2e drives `player.click` this time
  (`tests/e2e/landingClickBatch1938.spec.ts`).
- Save and load mid-voyage of R29b's new state are exact (`critic/c41_sl_*.json`), and the AI's world is untouched
  (7019's 20-year save byte-identical).

## Notes

- **The replica's order matters.** `c41_gen.ts` first sent a click's orders in distance order (the aboard one first)
  and split on 7 of 7 seeds where the page did not; the page sends ascending ids (`player.ts`). With `ASC=1` the
  replica agrees with the page on every case played, and R41-B1 is filed on the page's own result (pair 270/271, where
  ascending puts the one aboard first). The distance-order runs (`critic/c41_g_eng_*.json`) are kept as the trace of
  the mechanism, not as evidence of what a player sees.
- A division God Mode places beside Plymouth was put aboard a ship and sailed off south-west at once
  (`critic/c41_mk4_eng15101_sp.json`, both builds); not followed up.
- The worktree `critic/wt` at `76b88197` was used for the replays and removed at the end (its `node_modules` junction
  unlinked first).
