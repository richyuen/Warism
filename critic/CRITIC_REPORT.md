# Critic report, run 82 (focused): Batch 49 (R177 to R182), on `3e560a9c`

## The run

- **Mode: focused.** The spawning message does not ask for a full run (CRITIC_PROMPT, ADR-915).
- **Commit judged:** `3e560a9c551c52fc3f46a904288d48a8cba07343`, HEAD at the start (`critic/c82_commit.txt`).
- **Last report:** run 81, full, on `7c64529e`.

### What changed since run 81

`git diff --stat 7c64529e HEAD -- src/sim data public/data tools` is empty. The diff is page only:

| File | Item | What it does |
|---|---|---|
| `src/app/style.css` | R177 | R170's History give-way moved into the block that counts a sideways phone |
| `src/app/style.css` | R178 | The swatch, swords and skull never shrink. A long name is clamped to one line at a word. On a row of 350 px or less, the "& n" is hidden. |
| `src/app/style.css` | R182 | On a sideways phone, Relations takes the left half and a nation's panel the right half |
| `src/app/game.tsx`, `src/app/MapView.ts` | R179 | Go to country measures the clear map two frames on, with an 8 px fallback |
| `src/ui/WarBanners.tsx` | R180 | The desk row shows only the banners that fit |
| `src/app/hud.ts` | R181 | `relationsOver` is forgotten once another nation is chosen |

### What this run scored, and why

**Scored afresh:**
- `uiUxPolish`: the last report blocked on it, and every change touches it.
- `diplomacyWarDepth`: the relations graph is scored under it (R181, R182).
- `mapVisuals`: the war row, R178 and R180.

**Carried from run 81, each at 8:** `emergentDynamics`, `godMode`, `editorScenarios`, `statsHistory`, `performance`,
`stability`, `semanticZoom`, `naval`, `tanks`, `aircraft`, `aiNukes`. The diff touches none of them.

**Carried by the rules:**
- **Sim unchanged, carried (ADR-917):**
  - the 396 named `landingInvariants` setups;
  - the 153 stuck-return runs;
  - the 168 next-voyage runs;
  - Malta's 18;
  - the nuke seeds 64501 to 64509;
  - the performance chain.
- **Plain 1938 unchanged, carried (ADR-959):** the 20-year saves of 7019 and 32019. No file under `src/sim/` changed.

**Left out for time:**
- The random-world `bannerFit` on new seed 82965. The random world was still covered by run 81's case 64965 at 390 × 844,
  on both builds.
- `bannerFit 82903 700 844 390` with Germany's panel open was cut off when lane B was stopped, so its log is empty.
- Lane B's tail was moved to two parallel lanes (`c82_laneB2.sh`, `c82_laneB3.sh`) so it would finish within the hour.

### Setup

- **HEAD's build:** `critic/c82_dist` (`critic/scripts/c82_build.sh`, build exit 0), served on 127.0.0.1:5405.
- **Run 81's build:** `critic/c81_dist` (`7c64529e`), served on 5406 beside it. No worktree was needed.
- **Lanes:**
  - `c82_laneA.sh`: run 81's named cases on both builds.
  - `c82_laneB.sh`, `B2` and `B3`: new seeds 829xx on HEAD.
  - `c82_laneC.sh`: monkeys and resizes.
  - `c82_laneD.sh`: run 81's kept page cases, and `look` on new seeds.
  - `c82_checkers.sh`, `c82_checkers2.sh` and `c82_landingFuzz.sh`: the rule checkers.
  - `c82_relRank.mjs`: R82-B2's case, run with both servers restarted after the lanes ended.
- **New probes:**
  - `c82_nameLetters.mjs`: the war row's names, read from the row shots (DPR 2).
  - `c82_graphSize.mjs` and `c82_graphZoom.mjs`: the relations graph's size, its names, and node picks after "+".
  - `c82_deskFit.mjs`: R180's fit through a panel opened and closed, a run and a resize.
  - `c82_gotoCost.mjs`: R179's finer search, timed, with the long tasks.
  - `c82_relSame.mjs`: a nation chosen again from outside the graph.
- **At the end:** both preview servers (5405, 5406) were stopped by the PIDs on their ports, and every lane, browser and
  checker of this run was stopped.

## Verdict

**Run 81's blocking issue and all four of its UI non-blocking issues are fixed on their cases.** For each, run 81's build
beside HEAD fails the same case as run 81 found:
- R81-B1: History over the panel on a sideways phone.
- R81-N1: the swatches.
- R81-N2: Go to country.
- R81-N3: "+n" at 1024 × 768.
- R81-N4: a nation chosen again.
- Non-blocking 5 (R182) is fixed as well.

**One new blocking issue: R82-B1.** R178 regresses R174 (R80-B1's fix) on phones 375 and 390 px wide. On the random world's
case 64965 at 390 × 844, "Queensland" shows as "Que…", against "Queen…" on run 81's build. The 1938 case is below.
- On R178's own named case (68901, day 400, 375 × 667), the war row shows "Sovi…": 4 letters of "Soviet Union", with its
  "& 3" still shown.
- Run 81's build shows "Soviet Un…".
- This breaks ADR-1135 (a), the user's decision: a name keeps about 5 letters and the "& n" gives way first. It also
  breaks R178's own claim: "the count gives way before a name goes under five letters".

**Every rule checker on new seeds reports 0 broken:**
- 9 `diploInvariants` (82001 to 82017, five years each);
- 9 `worldInvariants` (82051 to 82067, five years each);
- 90 `landingFuzz` runs (82101 to 82129).

**A second new blocking issue: R82-B2.** On a sideways phone, with Relations open over the Soviet Union's panel, a tap on the
Soviet Union's row in the Ranking (on screen beside the graph) leaves it selected with no panel. R181 claims that "a
nation chosen again from outside the relations graph shows its panel". Run 81's build is the same.

**Scores:**
- `uiUxPolish` stays at 7, held there by R82-B1 and R82-B2.
- `mapVisuals` and `diplomacyWarDepth` stay at 8.
- Every carried score is 8.

## Scores

### Map visuals and readability: 8 → **8** (scored afresh)
- **Tested:**
  - `look` on new seeds 82905 (1600 × 900, days 45 and 400, every tier, both looks), 82907 (390 × 844) and 82909 (844 × 390).
    0 page errors on each (`critic/c81_look.c82_*.log`).
  - The war row at eleven sizes on 82901 day 400 and 82903 day 700.
- **Evidence for 8:**
  - **Europe at 3,000 m/px on 6 February 1939 reads cleanly:** named nations and capitals, the front's glow over Belgium,
    hatched occupation, arrows, planes (`critic/shots/c81look_82905_1600x900_d400_3eur3000.png`).
  - **844 × 390 at 250 m/px over the Chinese front:** named divisions, the front's glow, the war row clear of the bar
    (`critic/shots/c81phone_82909_844x390_d120_f0_250m.png`).
  - **The war row:** no squeezed swatch, no overlap and no overflow at 390, 412, 667, 844, 932, 1024, 1280 and 1600 wide on
    both new seeds, and opened at 320, 360 and 844 (`critic/c82_bf_829*.log`). The probe cannot see a clamped name's cut, so
    the names were read from the row shots: at 390 × 844 on 82903, "United Kingdom & 8 ⚔ Italy & 4" is whole
    (`critic/shots/c81bf_1938_82903_d700_390x844_c82_5405_row.png`).
  - **Swatches kept on small phones (R178):** at 320 × 568, "Soviet Union ⚔ Japan" and "France ⚔ Germany" with swatches
    whole (`critic/shots/c81bf_1938_82901_d400_320x568_c82_5405_row.png`).
- **Not 9:**
  - R82-B1's "Sovi…" at 375 px.
  - The ring over "Pari" (kept by R172), seen again (`critic/shots/c81a_64917_14_paris_h_2h.png`).
  - A hero's plate, "Sovetsky Soyuz", under the top bar at 3,000 m/px (`critic/shots/c81look_82905_1600x900_d400_3eur3000.png`;
    ADR-1111's class).

### Diplomacy, war, alliance, puppet, revolt depth: 8 → **8** (scored afresh)
- **Checkers on new seeds, five years each, 0 broken in every run:**
  - `diploInvariants` (`critic/c82_di_*.log`):
    - plain 1938 on 82001, 82011, 82015 (the random world), 82005 and 82017 (with heroes);
    - random diplomacy on 82003, 82009, 82013 and 82007 (the random world).
  - `worldInvariants` 82051 to 82067: 1938 and the random world, random diplomacy, heroes (`critic/c82_wi_*.log`).
- **R181 is fixed on its case:**
  - `c81_relOver` step 4 gives "panel Germany" on 68933 at 390 × 844 and 844 × 390, "Soviet Union" on 69933, and "United
    States" on 69935 at 360 × 740.
  - Run 81's build gives `null` on all four (`critic/c82_ro_*_5405.log`, `critic/c82_ro_*_5406.log`).
  - On the new seed 82933 at 844 × 390, every step shows the right panel (`critic/c82_ro_82933_844_390_SOV_FRA_5405.log`).
- **R182 is fixed on its case:** `c81_relOver 68933 844 390` step 5 gives 0 of 81 graph points covered. Run 81's build
  gives 81 (`critic/c82_ro_68933_844_390_5406.log`).
- **R82-B2 is scored under UI.** It is a panel's give-way, not the graph's reading of the rules. The graph's edges and its
  lines' texts are unchanged since run 81.
- **Not 9: R82-N1.** On a sideways phone the graph is a strip of 55 to 133 px, and its names are 4 to 6 px at every zoom.
  - The flags grow with "+", but the names do not.
  - At 667 × 375, R182 made the strip smaller: 70 px on run 81's build, 55 px on HEAD.
  - Upright, the names are 13 px.

### UI/UX and polish: 7 → **7** (R82-B1 and R82-B2 blocking)
- **Fixed on their cases, run 81's build beside HEAD:**

  | Case | Run 81's build (5406) | HEAD (5405) |
  |---|---|---|
  | R81-B1 `c81_histOver 68901 60 … GER`, 844 × 390 / 667 × 375 / 932 × 430 | `hiddenOf81` 81 / 63 / 63, `historyGoTapped` false | 0 / 0 / 0, true |
  | R81-B1 `dirHand 59955 120 844 390 touch` | "act failed … history-go" | "A major battle began near Elbląg", `cutsAfterAct` 0 |
  | R81-B1 upright 390 × 844 | 0, true | 0, true |
  | R81-N2 `c81_goto2 68931 390 844` | 6 of 8 on map | 8 of 8 |
  | R81-N2 `69931 390 844 700` | 10 of 12 | 12 of 12 |
  | R81-N2 `69937 360 740 400` | 0 of 7 | 7 of 7 |
  | R81-N3 `c81_moreClick 68901 400 1024 768` | refused, over the ticker 16 × 13 px | clicked, opened, `overTicker` [] |
  | R81-N4 `c81_relOver` step 4 (four cases) | no panel | the panel |
  | Non-blocking 5 `relOver 68933 844 390` step 5 | 81 of 81 | 0 of 81 |

  Evidence: `critic/c81ho_68901_d60_*_c82_540[56].json`, `critic/c82_dh_*_540[56].log`, `critic/c82_g2_*_540[56].log`,
  `critic/c81_mc_68901_400_1024x768_c82_540[56].json`.
- **R81-N1 is fixed on its cases:** no swatch is squeezed and nothing overlaps at 320 × 568 and 360 × 740 on 68901 and
  69903 (`critic/c82_bf_68901_*_5405.log`). The lines the probe still prints are "allies shown 0" at 320 and 360 wide, the
  "& n" giving way as designed (ADR-1135 (a)).
- **R180 off its case:** `c82_deskFit` on 68901 day 400 at 1280 × 720 shows 2 banners and "+3", with nothing covered and
  "+n" clickable at every step: a panel opened and closed, paused and running, and a resize
  (`critic/c82df_68901_d400_1280x720_GER_5405.json`). Run 81's build shows 3 banners there, 12 px past the row's width.
  - **On new seeds:** 82901 day 400 (7 wars) and 82903 day 700 (4, then 6) at 1024 × 768, 1152 × 864, 1280 × 720 and
    1366 × 768. That is 48 steps: 0 banners covered, 0 overflows, "+n" clickable at every step
    (`critic/c82df_829*_c82_5405.json`).
  - **The cost:** at 1024 × 768 the row holds a single banner and "+6", with room to spare beside it
    (`critic/shots/c82df_82901_d400_1024x768_GER_c82_5405_1_paused.png`). That is legible, but it says less at a glance.
- **R177 and R182 on new seeds:**
  - `c81_histOver 82901 200` at 844 × 390 and 667 × 375: 0 of 81 covered, go tapped (`critic/c81ho_82901_*_c82_5405.json`).
  - `c81_relOver 82933` at 667 × 375 and 932 × 430: step 5 gives 0 of 81 with the panel shown (`critic/c82_ro_82933_*_5405.log`).
- **R179 on a new seed:** `c81_goto2 82937 … 300 ITA,USA,ENG,JAP,BRA` gives 11 of 11 capitals on the map at each of
  360 × 740, 375 × 667, 844 × 390 and 1600 × 900 (`critic/c82_g2_82937_*_5405.log`).
- **R179 off its case:** the finer search costs 1.4 to 6 ms on 360 × 740, with no long tasks on 69937 and 82937
  (`critic/c82gc_69937_360x740_5405.json`, `critic/c82gc_82937_360x740_c82_5405.json`).
- **Monkeys:** 0 page errors and never hung, at 390 × 844 touch (240 s), 844 × 390 touch (240 s), 1024 × 768 (180 s) and
  360 × 740 touch (180 s) (`critic/c82_monkey.*.log`). Resize: 0 chrome off screen (`critic/c82_resize.82821_60.log`).
- **Why 7:**
  - **R82-B1:** the war row's name falls under the 5-letter floor at 375 px. This is a regression of R174 by R178 on R178's
    own named case.
  - **R82-N2:** at 360 × 740, Go to country puts the capital in an 8 px strip between the panel and the ticker, where
    neither its dot nor its name can be seen.
  - **R82-B2:** on a sideways phone, choosing again from the Ranking the nation whose panel Relations hid is a dead tap,
    against R181's claim.
  - **R82-N1:** the sideways graph's names cannot be read.
- **What the bar needs back at 8:** R82-B1's and R82-B2's "seen fixed when" below, with the cases of R177 to R182 staying as
  they are now.

### Carried (the diff touches none of them; run 81's scores and evidence stand)
- **Emergent dynamics: 8** (carried).
- **God Mode: 8** (carried). `a_god_nuke 64917` was re-run on HEAD (exit 0) and is the same as before, ring over "Pari"
  included.
- **Editor and scenarios: 8** (carried).
- **Stats and history: 8** (carried).
- **Performance: 8** (carried). The page change adds 1.5 to 5.5 ms to one Go to country, measured above.
- **Stability: 8** (carried). This run's 0 page errors in 14 minutes of monkeys and every lane's probe agree with it.
- **Semantic zoom: 8** (carried).
- **Naval: 8** (carried). Sim unchanged.
  - `seaclick 64913` was re-run, exit 0.
  - `landingFuzz --seeds 15 --first 82101` (`critic/scripts/c82_landingFuzz.sh`): 0 of 90 broken, `slowClick` included
    (`critic/c82_landingFuzz.log`).
- **Tanks: 8** (carried).
- **Aircraft: 8** (carried).
- **AI nuclear use: 8** (carried). `an_ainuke 64511` on run 79's year-13 save: exit 0, `ok []`; two strikes told in words
  (`critic/c81_an_ainuke.c82_64511_*.log`).

## Blocking issues

1. **R82-B1 (UI, phone 375 px; R178 regresses R174 and ADR-1135 (a)): the war row cuts "Soviet Union" to "Sovi…" while its
   "& 3" stays shown.**
   - **The case:** `BASE=<HEAD build> TAG=_x node critic/scripts/c82_nameLetters.mjs 68901 400 375x667`. The row reads
     "Sovi… & 3 ⚔ Japan & 6" (`critic/shots/c82nl_68901_d400_375x667_5405_row.png`).
   - **The same on a new seed:** 82901 day 400 at 375 × 667 reads "Sovi… & 3". The row there is also 10 px past its width,
     and "+5" is cut at the screen's edge, 378 px against a 375 px view (`critic/c82_bf_82901_400_375_667_5405.log`,
     `critic/shots/c81bf_1938_82901_d400_375x667_c82_5405_row.png`).
   - **Run 81's build on the same cases:**
     - 68901: "Soviet Un…" (`critic/shots/c82nl_68901_d400_375x667_5406_row.png`);
     - run 81's own log for it: "Soviet Union cut→8" (`critic/c81_bf_68901_400_375_667_1938_5403.log`).
   - **Worse on the random world, at R80-B1's own size:** `SCEN=random DPR=2 node critic/scripts/c81_bannerFit.mjs 64965 730 390
     844` (R178's named "random 64965 at 390") shows "Alaska ⚔ Que…", 3 letters of "Queensland", while "Chukotka Autonomo…"
     keeps 17. The probe reports 0 faults (`critic/c82_bfr_64965_730_390_844_5405.log`), but the shot shows the cut
     (`critic/shots/c81bf_random_64965_d730_390x844_c82_5405_row.png`). Run 81's build gives "Queen…" (5 letters), with the
     swatch squeezed (`critic/shots/c81bf_random_64965_d730_390x844_c82_5406_row.png`). So R178 traded R81-N1's swatch for
     two of the letters ADR-1135 (a) keeps, and it does so at 390 px too, not only at 375.
   - **At 390 × 844 in 1938:** HEAD gives "Soviet…" (6 letters, R178's word clamp as designed). Run 81's build gives "Soviet Un…".
     (`critic/shots/c82nl_68901_d400_390x844_540[56]_row.png`)
   - **The name's box, from the probe's own geometry:** "Soviet Union" gets 34 px on HEAD ([26, 60]) and 51 px on run 81's
     build ([25, 76]), while its "& 3" stays whole on both (`critic/c82_bf_68901_400_375_667_5405.log`,
     `critic/c81_bf_68901_400_375_667_1938_5403.log`).
   - **Why it blocks:**
     - It contradicts ADR-1135, the user's decision. Option (a) reads "a side's name keeps at least about 5 em … the score,
       then the '& n', give way first", and its record of R174 reads "a longer one keeps 6 ch (its first five letters and
       the ellipsis)".
     - R178's own comment in `src/app/style.css` says the count "gives way before a name goes under five letters". R178's
       ROADMAP note claims "0 overflow" on 68901 day 400 at 375 and the random 64965 at 390 clean. This run finds a 3 px
       overflow on the first (`critic/c82_bf_68901_400_375_667_5405.log`) and "Que…" on the second.
     - It is a regression of R174, ticked since the last release, in the class R80-B1 blocked on. 375 × 667 is a common phone
       size.
   - **Why run 81's probe misses it:** R178's `-webkit-line-clamp` keeps `scrollWidth` equal to `clientWidth`, so
     `c81_bannerFit` reports 0 faults at 375 on 68901. The cut shows only in the shot. `c82_nameLetters`' own letter count
     reads the text's layout under the clamp, not the drawn ellipsis, and is not reliable. Judge from its row shots.
   - **The cause, by the code:** the container query that hides "& n" fires only on a row of 350 px or less (a phone 365 px
     wide or less). From 366 to about 385 px, a banner with two counts has no room left. The clamp gives way first, and once
     "Soviet" no longer fits, `overflow-wrap: anywhere` breaks inside the word.
   - **Fix:** let the "& n" give way per banner, before the name goes under 5 letters, not by the row's width alone. Or raise
     the container query's bound to cover the 366 to 400 px rows. Keep the clamp's break at a word (no `anywhere`), so the
     floor is the first word or 5 letters.
   - **Seen fixed when:**
     - The row shots of `c82_nameLetters 68901 400 368x740,375x667,384x832` and `82901 400 375x667`, and of
       `SCEN=random c81_bannerFit 64965 730 390 844`, show every long name with 5 or more letters before its ellipsis, or
       whole. The last shows "Queen…" or more.
     - Read each from its shot, since neither probe's count sees a clamp's cut. A probe that compares each name's drawn
       width to its full text's width would see it.
     - `c81_bannerFit 82901 400 375 667` shows no overflow and "+n" inside the view.
     - The 320, 360, 390 and 412 cases stay as they are now.

2. **R82-B2 (UI, sideways phone; R175/R181 unfinished): a nation chosen again from outside the graph, while Relations
   stands over its panel, shows no panel. The tap does nothing visible.**
   - **The case:** `BASE=<HEAD build> node critic/scripts/c82_relRank.mjs 68901 844 390 SOV USA`.
     1. The Soviet Union's panel is open, then Relations is tapped (the panel gives way, R175).
     2. Ranking is opened. It is on screen beside Relations.
     3. The Soviet Union's row is tapped with a finger.
     4. The row lights, the Soviet Union stays selected, `relationsOver` is still 10, and no panel shows (step 4).
     5. The United States' row, tapped next, opens its panel (step 5).
   - **Evidence:**
     - `critic/c82rr_68901_844x390_SOV_USA_5405.json`;
     - `critic/shots/c82rr_68901_844x390_SOV_USA_5405_4_A_row_tapped.png`;
     - `critic/c82_relRank.log`: the same at 667 × 375.
   - **Run 81's build is the same** (`…_5406.json`), so this is not a new regression. R181's hud rule clears
     `relationsOver` only when the selection changes. Choosing the same nation changes nothing (`MapView.select` returns
     early), so its panel stays hidden until the graph closes.
   - **Why it blocks:** it contradicts R181's ticked claim, "a nation chosen again from outside the relations graph shows
     its panel". R181's AT ran only the route A, then B, then A.
     - The route here is the more direct one: the player taps the nation whose panel the graph just hid.
     - The tap is dead on a control that works for every other row.
     - This is the same class as R81-B1: an item's claim holding only on its own route.
   - **Fix:** clear `relationsOver` when any choice is made from outside the graph (in `hud.onSelectNation`'s callers, or
     on a ranking, ticker or map choice whatever the id), not only when the id changes.
   - **Seen fixed when:** `c82_relRank.mjs 68901 844 390 SOV USA` and `… 667 375` show at step 4 `panel` not null with
     `selected` 10, steps 5 to 7 stay as now, and `c81_relOver`'s eight steps stay as now.

## Non-blocking issues (prioritised)

1. **R82-N1 (UI and diplomacy, sideways phone): the relations graph cannot be read, and R182 made it smaller at
   667 × 375.**
   - **The case:** `node critic/scripts/c82_graphSize.mjs 68901 667 375`. The graph is 302 × 55 px. All 36 names are under
     8 px, with a median of 4 px (`critic/c82gs_68901_667x375_5405.json`, `critic/shots/c82gs_68901_667x375_5405_panel.png`).
   - **The graph's size and names, on both builds:**

     | Size | HEAD | Run 81's build |
     |---|---|---|
     | 667 × 375 | 55 px high, names 4 px | 70 px high, names 5 px |
     | 844 × 390 | 93 px high, names 5 px | 85 px high, names 5 px |
     | 932 × 430 | 133 px high, names 6 px | 147 px high, names 7 px |
     | 390 × 844 (upright) | names 13 px | names 13 px |

   - **Zoom does not help:** `c82_graphZoom.mjs` with "+" tapped 4 times leaves the names' median at 4 to 6 px at every step
     (`critic/c82_graphZoom.log`, `critic/shots/c82gz_68901_844x390_5405_k4.png`). The flags grow and become pickable (a
     tapped node opens its panel), but the names stay unreadable.
   - **The panel's room goes to its controls:** the filters, the menu and the zoom row take about 60 % of the panel's height
     at 667 × 375.
   - **The builder saw it:** R182's own note says "at 667 × 375, where the graph is 54 px high and no node is wide enough to
     pick by finger".
   - **Fix:** on a sideways phone, fold the filters into one row or a menu so the graph gets the panel's height. Draw the
     names at a fixed screen size, so that a zoom makes them readable.
   - **Seen fixed when:** `c82_graphSize 68901 844 390` and `667 375` show the graph at 150 px high or more, with a median
     name of 10 px or more, at least after one "+".
2. **R82-N2 (UI, 360 × 740; R179's fallback): Go to country puts the capital in an 8 px strip under the panel, where it
   cannot be seen.**
   - `c81_goto2 69937 360 740 400 ITA,USA,ENG`: Brussels is put at (176, 528), between the panel's bottom (about 513 px) and
     the ticker (about 537 px).
   - The probe's `capTop` is "map", but neither the city's dot nor its name shows. Only "BELG" of the country's label peeks
     out (`critic/shots/c81g2_69937_360x740_d400_c82_5405_ENG_1.png`).
   - R179's AT holds to the letter (the point is on map), not to its intent: the player is meant to see the capital.
   - **Fix:** where no 60 px room is left, scroll the panel or shorten it while flying, or close it as `showPlaceClear`'s
     doc says the caller should.
3. **Kept by R172, still seen:**
   - the ring over "Pari" (`critic/shots/c81a_64917_14_paris_h_2h.png`);
   - the AI's bomb as a faint spot (`an_ainuke 64511`);
   - like flags at sea (`seaclick 64913`).
4. **At 360 and 375 px, a clamped name sits away from its swatch.** The line-clamp box centres a short word in its room
   ("▢   United…" on 82903 day 700, `critic/shots/c82nl_82903_d700_375x667_5405_row.png`). Some clamps end in ".."
   ("Soviet.." on 69903, `critic/shots/c82nl_69903_d700_375x667_5405_row.png`).
5. **R82-N3 (UI, sideways phone): the opened Ranking covers the bar's History, Relations and Editor buttons.** At
   844 × 390 the player must fold the Ranking to reach them (`critic/shots/c82rr_68901_844x390_SOV_USA_5405_4_A_row_tapped.png`).
   Run 81's build is the same (`…_5406_4_A_row_tapped.png`).

## Run 81's cases re-run

| Run 81 case | Run 81 (`7c64529e`) | Run 82 (`3e560a9c`) | Evidence |
|---|---|---|---|
| R81-B1 `histOver 68901 60` at 844 × 390, 667 × 375, 932 × 430 | 81, 63, 63 covered | **fixed**: 0, 0, 0; go tapped | `critic/c81ho_68901_d60_*_c82_540[56].json` |
| R81-B1 `dirHand 59955 120 844 390 touch` | act failed | **fixed** | `critic/c82_dh_59955_120_844_390_touch_540[56].log` |
| R81-N1 `bannerFit 68901 0 360 740`, `69903 700 360 740`, `68901 400 320 568` | swatches 0 px; swords over "& 2" | **fixed**: swatches whole, 0 overlaps | `critic/c82_bf_*_5405.log` |
| R81-N1 at 375 × 667 (68901 day 400) | swatches 3 to 3.9 px | swatches whole, but "Sovi…" (**R82-B1**) | above |
| R81-N2 `goto2` 68931 / 69931 / 69937 | 6 of 8 / 10 of 12 / 0 of 7 | **fixed** 8 / 12 / 7 (R82-N2 on what shows) | `critic/c82_g2_*` |
| R81-N3 `moreClick 68901 400 1024 768` | refused | **fixed** | `critic/c81_mc_*_c82_*.json` |
| R81-N4 `relOver` step 4 (four cases) | no panel | **fixed** | `critic/c82_ro_*` |
| Non-blocking 5 `relOver 68933 844 390` step 5 | 81 of 81 | **fixed**: 0 | the same |
| R80-N1 `menuPinch 68933` at 390 × 844 and 844 × 390 | 0 / 0 | 0 / 0, History opens | `critic/c82_mp_*_5405.log` |
| R80-B1 random 64965 730 at 390 × 844 | "Queen…", swatch 1.6 px | **"Que…" (3 letters), R82-B1** | `critic/c82_bfr_*`, row shots |
| Kept: `a_god_nuke 64917`, `seaclick 64913`, `an_ainuke 64511` | as kept | the same, exit 0 | `critic/c81_*.c82_*.log` |
| `slowClick` named cases, stuck-return, next-voyage, Malta | as run 81 | sim unchanged, carried | — |
| `landingFuzz` on new seeds | 0 of 90 (69101 to 69115) | 0 of 90 (82101 to 82129); new seeds, not compared | `critic/c82_landingFuzz.log` |
| 7019 and 32019 twenty years | `ab927e1b`, `c3520016` | plain 1938 unchanged, carried | — |
| Performance chain, nuke seeds, `workerDeterminism` | run 81's figures | sim unchanged, carried | — |

## Design objections (none blocking)

- **ADR-1135 (a)'s order on a phone:** run 82 shows that a fixed floor per name and a row-width rule for the count do not
  agree between 366 and 400 px. R82-B1 is judged as a defect against the decision, not against the decision itself.
- **ADR-1111:** heroes' plates over Europe's labels at 3,000 m/px, and one under the top bar (as in runs 80 and 81).

## Ideas from other games (not scored)

- **Hearts of Iron IV**'s diplomacy view on small screens lists relations as rows, not as a graph. On a sideways phone, a
  list of the selected nation's ties would read where a 55 px graph cannot (R82-N1).

## Strengths (verified)

- **All six items of Batch 49 work on the cases they were filed on, and run 81's build fails each of them beside HEAD.**
  For example, History on a sideways phone goes from 81 of 81 points covered to 0, and Go to country at 360 × 740 from
  0 of 7 to 7 of 7.
- **The rule checkers are clean on 18 new five-year runs** across 1938, the random world, random diplomacy and heroes. The
  monkeys at four sizes ran 14 minutes with 0 page errors.
