# Critic report, run 83 (focused): Batch 50 (R183 to R188), on `42d0964e`

## The run

- **Mode: focused.** The spawning message does not ask for a full run (CRITIC_PROMPT, ADR-915).
- **Commit judged:** `42d0964e5ce420b4a89766119751f5b1b2df30f3`, HEAD at the start (`critic/c83_commit.txt`).
- **Last report:** run 82, focused, on `3e560a9c`.

### What changed since run 82

`git diff --stat 3e560a9c HEAD -- src/sim data public/data tools` is empty. The diff is page only:

| File | Item | What it does |
|---|---|---|
| `src/ui/WarBanners.tsx`, `src/app/style.css` | R183, R187 | R178's clamp is gone. `sizeRow` sizes the phone's closed row by script: long names give way to five letters and "…", then banners drop their counts. |
| `src/ui/WarBanners.tsx` | R183 follow-up | The phone's closed row also shows only the banners that fit (`fit`), counted again when the row's width changes |
| `src/app/MapView.ts`, `src/app/game.tsx` | R184 | `onChoose` clears `relationsOver` on every choice of a nation, the same one included |
| `src/ui/RelationsPanel.tsx`, `src/app/style.css` | R185 | Graph labels sized by whichever of width and height bounds the drawing; on a sideways phone the panel runs down to the bar and the filters are one scrolling row |
| `src/app/style.css`, `src/app/game.tsx` | R186 | On an upright phone 760 px tall or less, the nation panel leaves a strip of map; Go to tries rooms of 60, 32, 20, 8 px |
| `src/app/style.css` | R188 | On a sideways phone the opened Ranking stops above the bar and scrolls |

### What this run scored, and why

**Scored afresh:**
- `uiUxPolish`: the last report blocked on it (R82-B1, R82-B2), and every change touches it.
- `diplomacyWarDepth`: the relations graph is scored under it (R184, R185).
- `mapVisuals`: the war row (R183, R187).

**Carried from run 82, each at 8:** `emergentDynamics`, `godMode`, `editorScenarios`, `statsHistory`, `performance`,
`stability`, `semanticZoom`, `naval`, `tanks`, `aircraft`, `aiNukes`. The diff touches none of them. Where this run met
them in passing, it says so below.

**Carried by the rules:**
- **Sim unchanged, carried (ADR-917):** the named `landingInvariants` setups, the stuck-return and next-voyage runs,
  Malta's 18, the nuke seeds 64501 to 64509, the performance chain.
- **Plain 1938 unchanged, carried (ADR-959):** the 20-year saves of 7019 and 32019. No file under `src/sim/` changed.

**Left out for time:** nothing named by run 82. Not tried: the war row in another UI language, and the God Mode
editor on the sideways phone beyond the monkey.

### Setup

- **HEAD's build:** `critic/c83_dist` (`critic/scripts/c83_build.sh`, build exit 0), served on 127.0.0.1:5407.
- **Run 82's build:** `critic/c82_dist` (`3e560a9c`), served on 5405 beside it. No worktree was needed.
- **Lanes:**
  - `c83_laneA.sh`: run 82's named cases on both builds.
  - `c83_laneB.sh`: new seeds 839xx on HEAD, `phoneRow` and `gotoCost` on both.
  - `c83_laneC.sh`: monkeys, resize, `look` on new seeds, run 82's kept cases.
  - `c83_laneD.sh`: the rest of run 82's re-run table, and this run's off-route probes, most on both builds.
  - `c83_checkers.sh`, `c83_checkers2.sh`, `c83_landingFuzz.sh`: the rule checkers on new seeds.
- **New probes:**
  - `c83_phoneRow.mjs`: the phone's sized row running at speed: letters drawn, a stale `fit`, layout cost.
  - `c83_phoneToDesk.mjs`: a window going from a phone's width to a desk's and back.
  - `c83_rotate.mjs`: a phone turned, a panel opened and closed, a stale `fit`.
  - `c83_relRoutes.mjs`: R184 by the map's tap and a banner, not the Ranking.
  - `c83_relCover.mjs`: what R185's full-height relations panel stands over; filters scrolled out of sight.
  - `c83_panelShort.mjs`: what R186's capped panel leaves of each tab, God Mode off and on.
  - `c83_rankBar.mjs`, `c83_rankTap.mjs`: R188's bar buttons; rows tapped after a scroll.
- **At the end:** both preview servers (5405, 5407) were stopped by the PIDs on their ports. No critic node process
  was left running.

## Verdict

**Run 82's two blocking issues are fixed on their cases, with run 82's build failing the same cases beside HEAD.**
- R82-B1: on 68901 day 400 at 375 × 667, HEAD's row reads "Soviet Union ⚔ Japan" whole, its counts given way
  (`critic/shots/c82nl_68901_d400_375x667_c83_5407_row.png`). Run 82's build reads "Sovi… & 3"
  (`critic/shots/c82nl_68901_d400_375x667_c83_5405_row.png`).
- R82-B2: on 68901 at 844 × 390 and 667 × 375, step 4 gives `selected` 10, `relationsOver` 0 and the panel shown on
  HEAD. Run 82's build gives `relationsOver` 10 and no panel (`critic/c82rr_68901_*_SOV_USA_c83_540[57].json`).

**R82-N1 to N3 and N4 are fixed on their cases** (table below).

**One new blocking issue: R83-B1.** R183 and its follow-up hold on a phone that stays a phone, but not on a window that
crosses a phone's width. Back at a phone's width after 1024 × 768, the row shows 1 banner and "+4" with 143 to 156 px
empty, on two seeds. This contradicts the follow-up's claim: "the banners that fit … counted again when the row's own
width changes". Back on a desk, a name is cut ("Nationalist Sp…") where run 82's build shows it whole. Run 82's build
is right on both. This is the class run 82 blocked R82-B2 on: a ticked claim holding only on its own route.

Two new non-blocking issues:
- **R83-N2:** R186 costs the panel 39 px on every short phone, God Mode included.
- **R83-N3:** R185's one-row filters hide the focus selector out of sight.

**Every rule checker on new seeds reports 0 broken:**
- 9 `diploInvariants` (83001 to 83017, five years each);
- 9 `worldInvariants` (83051 to 83067, five years each).
- `landingFuzz` on 83101 to 83129: 1 of 90 broken, by `slowClick` (1.1 %, under the 5 % bound, so not blocking under
  ADR-914).

**Scores:** `uiUxPolish` stays at 7, now held there by R83-B1 alone. Every other score is 8.

## Scores

### Map visuals and readability: 8 → **8** (scored afresh)
- **Tested:**
  - `look` on new seeds 83905 (1600 × 900, days 45 and 400, every tier), 83907 (375 × 667) and 83909 (667 × 375).
    0 page errors each (`critic/c81_look.c83_*.log`).
  - The war row on 83901 and 83903 at seven phone sizes (`c82_nameLetters`), on 83901 at six sizes, and on 83903 opened
    and with a panel (`c81_bannerFit`).
- **Evidence for 8:**
  - **Europe at 3,000 m/px, 8 February 1939, reads:** names, capitals, the hatched occupation, three desk banners and "+1"
    (`critic/shots/c81look_83905_1600x900_d400_3eur3000.png`).
  - **375 × 667 at 250 m/px:** named formations, arrows, the front's glow, the row clear
    (`critic/shots/c81phone_83907_375x667_d240_f0_250m.png`).
  - **The phone's war row:**
    - 0 overflows at every phone size on the new seeds (`critic/c83_bf_839*_5407.log`).
    - No long name under 5 letters on any of the 14 size cases (`critic/c83_nl_8390*_5407.log`; read from the shots
      for the lowest, 83903 at 320 × 568, "Sovie… ⚔ Poland | Italy & 3 ⚔ Sovie… & 2",
      `critic/shots/c82nl_83903_d700_320x568_c83_5407_row.png`), in 54 reads at Max on two seeds (27 samples each,
      before and after a resize; `critic/c83pr_*_c83_5407.json`, `under5` 0), or on the random world at 360, 375 and 390
      (`critic/shots/c81bf_random_83965_d730_360x740_c83_5407_row.png`: "Vrancea & 1 ⚔ Perth… & 6 | Shandong ⚔ Tibet").
- **Not 9:**
  - Heroes' plates over Europe's labels at 3,000 m/px ("Roma" over Albania, "Maus" over Bulgaria; ADR-1111, a design
    objection).
  - The ring over "Pari" (kept by R172).
  - Ellipsis after a space: "Soviet …" (`critic/shots/c83ps_83941_d120_360x640_GER_c83_5407_god_tabgod.png`).
  - The names give way in proportion, so one can be cut to 6 letters beside one at 14: "Kagosh… ⚔ Chukotka Auton…"
    (`critic/shots/c81bf_random_64965_d730_390x844_c83_5407_row.png`). This is legible and follows ADR-1136 (a).

### Diplomacy, war, alliance, puppet, revolt depth: 8 → **8** (scored afresh)
- **Checkers on new seeds, five years each, 0 broken in every run:**
  - `diploInvariants` (`critic/c83_di_*.log`): plain 1938 on 83001, 83011, 83015 (the random world), 83005 and 83017
    (heroes); random diplomacy on 83003, 83009, 83013 and 83007 (the random world).
  - `worldInvariants` 83051 to 83067: 1938 and the random world, random diplomacy, heroes (`critic/c83_wi_*.log`).
- **R185 is fixed on its case and on a new seed.** `c82_graphSize`, graph height and median name height:

  | Size | Run 82's build | HEAD |
  |---|---|---|
  | 667 × 375 (68901) | 55 px, names 4 px | 151 px, names 13 px |
  | 844 × 390 (68901) | 93 px, 5 px | 173 px, 13 px |
  | 932 × 430 (68901) | 133 px, 6 px | 212 px, 13 px |
  | 390 × 844 | 13 px | 13 px |
  | 1600 × 900 and 1024 × 768 (83933) | 13 px | 13 px (unchanged on the desk) |

  Evidence: `critic/c82gs_68901_*_c83_540[57].json`, `critic/c82gs_83933_*_c83_540[57].json`.
  - After "+", nodes stay pickable and a tap opens the panel (`critic/c83_gz_*_5407.log`).
  - The graph at 667 × 375 reads (`critic/shots/c82gs_68901_667x375_c83_5407_panel.png`).
  - Bigger names mean fewer of them: 19 of 67 at 667 × 375, against 36 unreadable ones before. The rest show on a tap
    or after "+".
- **R184 off its case:** on a sideways phone, the hidden nation chosen again by a finger's tap on the map brings its
  panel back beside the graph, with 0 px of overlap. Cases: 68901 Soviet Union at 844 × 390, 83903 Soviet Union at
  667 × 375, 83903 Poland at 932 × 430 (`critic/c83rt_*_c83_5407.json`).
  - The banner route cannot be tried: on a sideways phone the war row is not shown while Relations is open, on both builds.
- **Not 9: R83-N3.** The one-row filters scroll "Puppets", "Truces" and the "All nations" focus selector out of sight at
  667 × 375, with nothing to say they are there (`critic/c83rc_83903_d700_667x375_c83_5407.json`).

### UI/UX and polish: 7 → **7** (scored afresh; R83-B1 blocking)
- **Run 82's two blocking cases are met**, with run 82's build failing them beside HEAD. It would be 8 without R83-B1.
  - **R82-B1:**
    - `c82_nameLetters 68901 400`: "Soviet Union" whole at 368 and 375 px (counts given way), "Soviet… & 3" at 384, and
      "Soviet U… & 3" at 390. Run 82's build gives "Sovi… & 3" at 368 to 390.
      (`critic/shots/c82nl_68901_d400_*_c83_540[57]_row.png`)
    - `82901 400 375x667`: "Soviet Union ⚔ Japan | France & 11 ⚔ Germany & 2", "+5" at [331, 359] inside the view,
      0 overflow (`critic/c83_bf_82901_400_375_667_5407.log`).
    - Random 64965 at 390 × 844: "Alaska ⚔ Queens…". Run 82's build gives "Que…"
      (`critic/shots/c81bf_random_64965_d730_390x844_c83_540[57]_row.png`).
    - 320, 360, 390 and 412 px cases: 0 faults other than "allies shown 0" (counts given way, by design).
  - **R82-B2:** see the Verdict. `c81_relOver 68933` at 844 × 390 and 390 × 844 gives the same eight steps on both builds
    (`critic/c83_ro_68933_*_540[57].log`).
    - Steps 6 and 7 are as run 82.
    - Step 5 is not: the United States' row is no longer chosen, because the Soviet Union's panel, now back at step 4,
      stands over the Ranking on the right half. The tap lands on the panel (`viaB` top `nation-name`), so it is not a
      dead tap (non-blocking 4).
  - **R82-N2 (R186):**
    - `c81_goto2 69937 360 740`: 7 of 7 capitals on the map, and Brussels' dot and name seen
      (`critic/shots/c81g2_69937_360x740_d400_c83_5407_ENG_1.png`).
    - New seed 83937 at 320 × 568, 360 × 640, 360 × 740 and 375 × 667: 11 of 11 each (`critic/c83_g2_83937_*_5407.log`).
    - `gotoCost` 83937 360 × 740: HEAD finds the 60 px room at once (1.6 to 1.8 ms). Run 82's build needed the 8 px
      fallback (5 to 6 ms) (`critic/c83_gc_83937_360_740_540[57].log`).
  - **R82-N3 (R188):** with the Ranking open, History, Relations, Editor, Statistics, Settings and God Mode are each the top
    element at their centres on HEAD, at 844 × 390 and 667 × 375. Run 82's build has History, Relations and Editor under
    the Ranking at 844 × 390 (`critic/c83rb_83951_d300_*_c83_540[57].json`).
- **Off the cases:**
  - **R183's cost while running:** `phoneRow 83901 375 × 667`, 90 s at Max: 3,100 layouts against 1,269 on run 82's
    build, and 302 against 157 ms of layout. Frames are identical (5,542, p95 16.7 ms), with 0 stale, 0 overflow, 0 under
    5 letters (`critic/c83pr_83901_d200_375x667_c83_540[57].json`). Measured beside other lanes, so read as an upper
    bound. It costs nothing a player sees.
  - **R183's fit on a turned phone:** `c83_rotate` on 68901 and 83903 (upright, sideways, panel opened and closed, turned
    back, 20 to 30 days run): 0 stale steps. Beside a panel at 844 × 390, HEAD shows 1 banner. Run 82's build shows 2,
    5 px past the row (`critic/c83ro_*_c83_540[57].json`).
  - **Monkeys:** 0 page errors, never hung, at 390 × 844 touch (240 s), 844 × 390 touch (240 s), 360 × 640 touch (180 s)
    and 1366 × 768 (150 s) (`critic/c81_monkey.c83_*.log`). Resize: 0 chrome off screen (`critic/c81_resize.c83_83821_60.log`).
- **What would be 8:** every phone case of Batches 48 to 50 holds on run 82's named seeds and on new ones: histOver,
  dirHand, menuPinch, goto2, relOver, relRank, rankBar, bannerFit and nameLetters. That is 0 covered controls, 0
  overflows and 0 names under 5 letters from 320 to 932 px wide, on a phone that stays a phone.
- **Why 7:**
  - **R83-B1:** a window that crosses a phone's width loses R183's claims. The row shows 1 banner with half of it empty,
    and a desk name is cut where it fits.
  - **R83-N2, R83-N3,** and small gaps such as the sideways Ranking's header scrolling away with its rows
    (`critic/shots/c83rb_83951_d300_844x390_c83_5407_3_last_tapped.png`).
- **What the bar needs back at 8:** R83-B1's "seen fixed when" below, with this run's phone cases as they are now.

### Carried (the diff touches none of them; run 82's scores and evidence stand)
- **Emergent dynamics: 8** (carried).
- **God Mode: 8** (carried). `a_god_nuke 64917` re-run on HEAD, exit 0. R83-N2's cost to the God tab on short phones is
  scored under UI.
- **Editor and scenarios: 8** (carried).
- **Stats and history: 8** (carried).
- **Performance: 8** (carried). R183's layout cost and R186's cheaper Go to are measured above.
- **Stability: 8** (carried). 0 page errors in this run's 13.5 minutes of monkeys and in every probe.
- **Semantic zoom: 8** (carried).
- **Naval: 8** (carried; sim unchanged).
  - `seaclick 64913` re-run, exit 0.
  - `landingFuzz --seeds 15 --first 83101`: 1 of 90 broken by `slowClick`, a non-blocking issue under ADR-914 (R83-N4).
- **Tanks: 8** (carried).
- **Aircraft: 8** (carried).
- **AI nuclear use: 8** (carried). `an_ainuke 64511` on run 79's year-13 save, exit 0, `ok []`; two strikes told in words
  (`critic/c81_an_ainuke.c83_64511_*.log`).

## Blocking issues

1. **R83-B1 (UI; R183 and its follow-up off their route, a regression against run 82's build): a window that crosses a
   phone's width keeps the phone's sizing.** Back at a phone's width, the row shows 1 banner with half of it empty. Back
   on a desk, a long name stays cut where it fits.
   - **The cause, by the code:** `sizeRow` writes each long name's width on the element, and only the opened row clears
     it; the desk path never does. On the way to a phone width, the desk's `fit` is counted down while `phone` is still
     false. When `phone` turns true, the `ResizeObserver` finds the row's width equal to the one it last saw, so `fit` is
     not counted again.
   - **Phone after desk:**
     - `c83_phoneToDesk 68901 400` (its default sizes 384x832, 1280x720, 1024x768, 384x832, 1600x900): at the second
       384 × 832, HEAD shows 1 banner and "+4" with 156 px of the row empty
       (`critic/shots/c83pd_68901_d400_c83_5407_3_384x832.png`). Run 82's build shows 2 banners and "+3"
       (`critic/shots/c83pd_68901_d400_c83_5405_3_384x832.png`).
     - `83903 700 375x667,1280x720,1024x768,375x667`: 1 banner with 143 px empty, against 2 on run 82's build
       (`critic/shots/c83pd_83903_d700_c83_540[57]_3_375x667.png`).
     - `83901 400 384x832,1366x768,1024x768,384x832` came back at 2 on HEAD, so it does not happen on every route.
   - **Desk after phone:** on 83901 at 1366 × 768, HEAD shows "Nationalist Sp…" cut (inline width 89 px) with room
     to spare. Run 82's build shows "Nationalist Spain" whole
     (`critic/shots/c83pd_83901_d400_c83_5407_1_1366x768.png` against `…_5405_1_1366x768.png`). On 68901 and 83903,
     "Soviet Union" keeps an inline 67.5 px on the desk, which happens not to cut it.
   - **How long it lasts, by the code (not run):** a stale `fit` lasts until the number of wars changes or the window is
     resized again. A desk name's width lasts until the row is opened (the opened branch clears it) or the window goes
     back to a phone's width.
   - **Who meets it:** a desk browser narrowed under 600 px and widened again, or a tablet's split view resized.
   - **A phone that stays a phone is not affected:** `c83_rotate` (turned, a panel opened and closed, 20 to 30 days run)
     finds 0 stale steps on 68901 and 83903, and `phoneRow` finds 0 in 54 reads.
   - **Why it blocks:**
     - It contradicts R183's ticked follow-up: the phone's row "shows the banners that fit … counted again when the row's
       own width changes". The row's width changed, and it shows 1 banner where 2 fit.
     - R183's desk side regresses run 82's build, where the same desk row shows the name whole.
     - This is R82-B2's class: the claim holds on its own route (a sideways phone beside a panel) and not on another.
   - **Fix:**
     - Clear the names' widths and `war-tight` whenever the row is not a phone's.
     - Count `fit` again when `phone` changes (or reset `rowWidth` when the observer is attached).
   - **Seen fixed when:**
     - `c83_phoneToDesk 68901 400` shows 2 banners at the second 384 × 832, and no inline width on any name at 1280,
       1024 and 1600.
     - `c83_phoneToDesk 83903 700 375x667,1280x720,1024x768,375x667` shows 2 banners at the last step.
     - `c83_phoneToDesk 83901 400 384x832,1366x768,1024x768,384x832` shows "Nationalist Spain" whole at 1366.
     - `c83_rotate 68901 400 GER 20` and `83903 700 GER 30` stay at 0 stale.

## Non-blocking issues (prioritised)

1. **R83-N2 (UI, short upright phones; R186's cost): the nation panel is 39 px shorter on every phone 760 px tall or
   less, all the time, to leave a strip that only Go to uses.**
   - At 320 × 568 with God Mode on, the panel shows 167 px of content against 206 px on run 82's build. The God tab
     shows one "Place" row, cut, and needs 11 swipes against 9; the Overview shows 39 % of itself. The map strip under
     it is 74 px against 35 px (`critic/c83ps_83941_d120_320x568_GER_c83_540[57].json`,
     `critic/shots/c83ps_83941_d120_320x568_GER_c83_5407_god_tabgod.png`).
   - At 360 × 640 the cost is the same 39 px (`critic/c83ps_83941_d120_360x640_GER_c83_540[57].json`).
   - **Fix:** leave the strip only while Go to's flight shows the capital, or only when the panel's content is shorter
     than the room.
2. **R83-N3 (UI and diplomacy, sideways phone; R185's cost): the relations filters' row hides "Truces" and the
   "All nations" focus selector off its right edge.** At 667 × 375 "Puppets" goes too. Only a sliver of the next
   checkbox hints that the row scrolls (`critic/c83rc_83903_d700_667x375_c83_5407.json`,
   `critic/shots/c82rr_68901_844x390_SOV_USA_c83_5407_2_relations.png`). The panel now also covers both ticker rows,
   against one on run 82's build.
   - **Fix:** a fade or a chevron at the row's edge, or the focus selector first in the row.
3. **R83-N4 (naval, `slowClick`, 1 of 90):** `npx tsx tools/diag/landingInvariants.ts 83105 3517 120 83105 30 2 8`:
   t41's click of 367 came ashore after 14.1 days, against a best way of 6.7 (`critic/c83_lf_83105_3517_g2_od8.log`).
   This is a timing bound under ADR-914, 1.1 % of the run.
4. **After R184, the panel brought back on a sideways phone covers the Ranking beside the graph.** `c82_relRank` step 5
   no longer reaches the United States' row: the tap lands on the panel's name (`viaB` top `nation-name`,
   `critic/shots/c82rr_68901_844x390_SOV_USA_c83_5407_5_B_row_tapped.png`). This is the same as any panel on that half
   and is not a dead tap, but choosing a second nation from the Ranking now takes a close first.
5. **Kept by R172, still seen:** the ring over "Pari", the AI's bomb as a faint spot, like flags at sea.

## Run 82's cases re-run

| Run 82 case | Run 82 (`3e560a9c`) | Run 83 (`42d0964e`) | Evidence |
|---|---|---|---|
| R82-B1 `nameLetters 68901 400` 368 / 375 / 384 / 390 | "Sovi… & 3" at each | **fixed**: whole / whole / "Soviet… & 3" / "Soviet U… & 3" | `critic/shots/c82nl_68901_d400_*_c83_540[57]_row.png` |
| R82-B1 `82901 400 375x667` | "Sovi… & 3", 10 px past | **fixed**: "Soviet Union", "+5" in view | `critic/c83_bf_82901_400_375_667_540[57].log` |
| R82-B1 random 64965 at 390 × 844 | "Que…" | **fixed**: "Queens…" | `critic/shots/c81bf_random_64965_d730_390x844_c83_540[57]_row.png` |
| R82-B2 `relRank 68901` 844 × 390 / 667 × 375 step 4 | no panel | **fixed**: panel, `relationsOver` 0 | `critic/c82rr_68901_*_c83_540[57].json` |
| R82-N1 `graphSize 68901` sideways | 55 / 93 / 133 px, names 4–6 px | **fixed**: 151 / 173 / 212 px, 13 px | `critic/c82gs_68901_*_c83_540[57].json` |
| R82-N2 `goto2 69937 360 740` | Brussels in an 8 px strip | **fixed**: dot and name seen | `critic/shots/c81g2_69937_360x740_d400_c83_5407_ENG_1.png` |
| R82-N3 Ranking over the bar, 844 × 390 | History, Relations, Editor covered | **fixed**: all top | `critic/c83rb_83951_d300_*_c83_540[57].json` |
| N4 clamped name off its swatch, ".." | seen | **fixed** (clamp gone) | `critic/shots/c82nl_82903_d700_375x667_c83_5407_row.png` |
| R81-B1 `histOver 68901 60` at 844 × 390, 667 × 375, 932 × 430, 390 × 844 | 0 covered, go tapped | the same | `critic/c83_ho_68901_60_*_5407.log` |
| `dirHand 59955 120` touch, both sizes | history acted | the same | `critic/c83_dh_*_5407.log` |
| `goto2 68931`, `69931` | 8 / 8, 12 / 12 | the same | `critic/c83_g2_*_5407.log` |
| `moreClick 68901 400 1024 768`, `deskFit 68901 400 1280 720` | clickable; 0 covered | the same | `critic/c83_mc_*`, `critic/c82df_68901_d400_1280x720_GER_c83_5407.json` |
| `relOver 68933`, `69933`, `69935` | 8 steps as named | the same | `critic/c83_ro_*_5407.log` |
| `menuPinch 68933` at 390 × 844, 844 × 390 | 0 / 0 | the same | `critic/c83_mp_*_5407.log` |
| Kept: `a_god_nuke 64917`, `seaclick 64913`, `an_ainuke 64511` | as kept | the same, exit 0 | `critic/c81_*.c83_*.log` |
| `slowClick` named cases, stuck-return, next-voyage, Malta | as run 82 | sim unchanged, carried | — |
| `landingFuzz` on new seeds | 0 of 90 (82101 to 82129) | 1 of 90 (83101 to 83129); new seeds, not compared | `critic/c83_landingFuzz.log` |
| 7019 and 32019 twenty years | carried | plain 1938 unchanged, carried | — |
| Performance chain, nuke seeds | carried | sim unchanged, carried | — |

A note on method: a finger's tap made right after a CDP touch swipe is not taken as a click on either build
(`critic/c83rt2_83951_d300_844x390_c83_540[57].json`, case c). `c83_rankBar`'s "last row not chosen" is that artifact,
not a finding.

## Design objections (none blocking)

- **ADR-1136 (a)'s proportional give-way:** a short long-name ("Kagoshima") is cut to 6 letters while a longer one
  beside it keeps 14 ("Chukotka Auton…"). Cutting the longest first would keep more names whole.
- **ADR-1111:** heroes' plates over Europe's labels at 3,000 m/px (as in runs 80 to 82).

## Ideas from other games (not scored)

- **Hearts of Iron IV** puts its diplomacy filters behind a single "filter" button. A sideways phone could do the
  same, rather than scroll a row whose end is out of sight (R83-N3).

## Strengths (verified)

- **Batch 50 fixes every item on the case it was filed on, and run 82's build fails each beside HEAD.** For example, the
  sideways relations graph went from 55 px with 4 px names to 151 px with 13 px names, and the phone's war row from
  "Sovi… & 3" to "Soviet Union" whole.
- **The rule checkers are clean on 18 new five-year runs** across 1938, the random world, random diplomacy and heroes.
  The monkeys at four sizes ran 13.5 minutes with 0 page errors.
