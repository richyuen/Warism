# Critic report, run 84 (focused): Batch 51 (R189 to R193), on `764aa144`

## The run

- **Mode: focused.** The spawning message does not ask for a full run (CRITIC_PROMPT, ADR-915).
- **Commit judged:** `764aa144050bf43f40ca2d63e34a3298bd0c81b5`, HEAD at the start (`critic/c84_commit.txt`).
- **Last report:** run 83, focused, on `42d0964e`.

### What changed since run 83

`git diff --stat 42d0964e HEAD -- src/sim data public/data tools` is empty. The diff is page only:

| File | Item | What it does |
|---|---|---|
| `src/ui/WarBanners.tsx` | R189 | On a desk, or with the row opened, the names' widths and `war-tight` are cleared. `fit` is counted again when `phone` changes, and the observer starts afresh. |
| `src/app/hud.ts`, `game.tsx`, `App.tsx`, `NationPanel.tsx`, `style.css` | R190 | Only the panel that Go to opened (`hud.wentTo`, class `go-strip`) leaves R186's strip of map on a short upright phone. |
| `src/app/style.css` | R191 | On a sideways phone the relations filters wrap onto rows, the zoom's buttons sit in the header beside the ×, and the news moves beside the graph's half. |
| — | R192 | Not taken, with a reason (no code). |
| `src/ui/WarBanners.tsx` | R193 | `sizeRow` gives every long name one cap, the highest that fits, with a five-letter floor, so the longest names give way first. |

### What this run scored, and why

**Scored afresh** (the same three as run 83):
- `uiUxPolish`: run 83 blocked on it (R83-B1), and every item touches it.
- `diplomacyWarDepth`: the relations panel (R191).
- `mapVisuals`: the war row (R189, R193).

**Carried from run 83, each at 8:** `emergentDynamics`, `godMode`, `editorScenarios`, `statsHistory`, `performance`,
`stability`, `semanticZoom`, `naval`, `tanks`, `aircraft`, `aiNukes`. The diff touches none of them. Where this run met
them in passing, it says so below.

**Carried by the rules:**
- **Sim unchanged, carried (ADR-917):** the named `landingInvariants` setups, R83-N4's `slowClick` case
  (`83105 3517 … 2 8`), the stuck-return and next-voyage runs, Malta's 18, the nuke seeds 64501 to 64509, and the
  performance chain.
- **Plain 1938 unchanged, carried (ADR-959):** the 20-year saves of 7019 and 32019. No file under `src/sim/` changed.

**Left out for time:**
- No worktree was needed: run 83's build (`critic/c83_dist`) was still on disk and was served beside HEAD.
- Not tried: the war row in another UI language (the game ships English only, `src/ui/i18n/en.json`), and R190 with God
  Mode's second bar row on a 320 × 568 phone during Go to's flight.

### Setup

- **HEAD's build:** `critic/c84_dist` (`critic/scripts/c84_build.sh`, build exit 0), served on 127.0.0.1:5409.
- **Run 83's build:** `critic/c83_dist` (`42d0964e`), served on 5408 beside it.
- **Lanes:**
  - `c84_laneA.sh`: run 83's named cases on both builds, and the kept page cases on HEAD.
  - `c84_laneB.sh` and `c84_laneB2.sh`: new seeds 849xx. B2 re-runs B's random-world loop: in B, the helper's `s` overwrote
    the loop's seed.
  - `c84_laneC.sh`: monkeys, a resize, `look`, and the kept nuke and sea cases.
  - `c84_laneD.sh`: the changed code's other routes, most on both builds.
  - `c84_laneE.sh`: R84-N1's "+n" clicked at the narrow desk widths, and R191's header zoom buttons tapped.
  - `c84_checkers.sh`, `c84_checkers2.sh`, `c84_landingFuzz.sh`: the rule checkers on new seeds.
- **New probes:**
  - `c84_crossWidth.mjs`: R189 off its route. A window narrowed and widened in steps across 600 px, a desk made "phone"
    by its height alone, and the row opened on a phone and carried to a desk and back. Each step is nudged to find a
    stale `fit`.
  - `c84_goChain.mjs`: R190 off its route. Go to after Go to, the same nation tapped again, History over the panel, the
    phone turned, another nation chosen, and the panel closed and reopened.
  - `c84_relSide.mjs`: R191 at nine sizes from 568 × 320 to 1280 × 480 and back. Every filter, the focus selector, the
    zoom buttons and the × are checked for being in view and on top, header overlaps are read, and each filter is tapped.
  - `c84_rowShot.mjs`: the war row from a fresh page at narrow desk and tablet widths, and the ticker rows it covers.
- **At the end:** both preview servers (5408, 5409) were stopped by the PIDs on their ports. No critic node process
  was left running.

## Verdict

**R83-B1 is fixed on every "seen fixed when" case, and run 83's build fails each case beside HEAD** (table below).

R83-N2 (R190) and R83-N3 (R191) are fixed on their cases. R193 meets the design objection on its case.

**The changed code's other routes hold:**
- `c84_crossWidth` on two new seeds, three routes each: 0 stale steps, 0 desk names with an inline width, 0 desk names
  cut.
- `c84_goChain` on three phones: the strip follows Go to through every step.
- `c84_relSide` on two new seeds at nine sizes: every filter and the focus selector are seen and take a tap.

**No blocking issue.**

Three new non-blocking issues:
- **R84-N1:** a desk window 601 to 700 px wide (as measured) shows one war banner wider than its row, over the ticker's
  second row. Its "+4" still works. This predates Batch 51: run 83's build gives the same figures.
- **R84-N2:** R191's wrapped filters cost the graph 28 px at 568 × 320 (82 px against 110).
- **R84-N3:** the relations hint's second line runs over the panel's foot on sideways phones (both builds).

**Every rule checker on new seeds reports 0 broken:**
- 9 `diploInvariants` (84001 to 84017) and 9 `worldInvariants` (84051 to 84067), five years each.
- `landingFuzz` on 84101 to 84129: 0 of 90 broken.

**Scores:** `uiUxPolish` 7 → **8**. Every other score is 8.

## Scores

### Map visuals and readability: 8 → **8** (scored afresh)
- **Tested:**
  - `look` on new seeds 84905 (1600 × 900, days 45 and 400, every tier), 84907 (375 × 667) and 84909 (667 × 375). 0 page
    errors each (`critic/c81_look.c84_*.log`).
  - The war row:
    - `c82_nameLetters` on 84901 and 84903 at seven phone sizes from 320 to 412 px.
    - `c81_bannerFit` on 84903 at 667 × 375 and 844 × 390, and on 84901 beside Germany's panel and opened at three sizes.
    - The random world on 84961, 84963 and 84965 at 320 × 568, 360 × 740 and 390 × 844.
- **Evidence for 8:**
  - **Europe at 3,000 m/px, 9 February 1939, reads:** names, capitals, the hatched occupation, hero plates, three desk
    banners and "+3" (`critic/shots/c81look_84905_1600x900_d400_3eur3000.png`).
  - **At 250 m/px:** named formations, arrows, the front's glow and the hatched occupied land
    (`critic/shots/c81look_84905_1600x900_d400_f0_250m.png`).
  - **R193's give-way, longest names first:**
    - Random 64965 at 390 × 844 reads "Kagoshima ⚔ Chukotka Autono… & 3 | Alaska ⚔ Queensland": Kagoshima and Queensland
      whole, Chukotka cut to 12 letters. Run 83's build gives "Kagosh…" (7), "Queens…" (7) and Chukotka at 14
      (`critic/c84_bfr_64965_730_390_844_random_540[89].log`, `critic/shots/c81bf_random_64965_d730_390x844_c84_540[89]_row.png`).
    - No name is under five letters in 14 size cases on the new seeds (`critic/c84_nl_849*_5409.log`), in 9 random-world
      cases (0 faults except counts given way by design, `critic/c84_bfr_849*_5409.log`), or in 54 reads at Max each
      on both builds (`critic/c84_pr_*_540[89].log`, `under5` 0).
    - Example at 320 × 568 (84901): "United Kingdom" and "Soviet Union" cut at the same 9 letters, Italy whole, Norway's
      "& 1" kept.
- **Not 9:**
  - Heroes' plates over Europe's labels at 3,000 m/px ("TOG II" over London's neighbourhood, "P.100 Ercole" over Geneva;
    ADR-1111, a design objection).
  - The ring over "Pari" (kept by R172; carried from run 83, not re-read).
  - R84-N1, the narrow desk row (scored under UI).

### Diplomacy, war, alliance, puppet, revolt depth: 8 → **8** (scored afresh)
- **Checkers on new seeds, five years each, 0 broken in every run:**
  - `diploInvariants` (`critic/c84_di_*.log`): plain 1938 on 84001 and 84011, heroes on 84005 and 84017, the random world
    on 84015; random diplomacy on 84003, 84009 (heroes) and 84013, and 84007 on the random world.
  - `worldInvariants` 84051 to 84067: 1938 and the random world, random diplomacy, heroes (`critic/c84_wi_*.log`).
- **R191 fixed on its case:**
  - `c83_relCover 83903 700` at 667 × 375 and 844 × 390: `hiddenFilters` [] and the ticker's rows 0 of 2 covered with
    Relations alone on HEAD. Run 83's build hides "Puppets", "Truces" and "All nations" at 667 × 375 ("Truces" and
    "All nations" at 844 × 390) and covers 2 of 2 (`critic/c84_rc_83903_*_540[89].log`).
  - With a nation's panel on the other half, the ticker's rows are still 2 of 2 covered, on both builds (R191's note:
    no room is left).
  - Shots: `critic/shots/c83rc_83903_d700_667x375_c84_540[89]_1_relations.png`.
- **R191's header zoom buttons take a tap:** `c82_graphZoom 68901` at 844 × 390 and 667 × 375, "+" tapped four times:
  - Pickable nodes fall from 67 to 5 and 4 as the graph zooms, and names stay at 13 px.
  - A node tapped after the zoom opens its panel (`critic/c84_gz_68901_*_5409.log`).
- **R191 off its case:** `c84_relSide` on 84903 and 84933, Relations open at 568 × 320, 640 × 360, 667 × 375, 740 × 360,
  844 × 390, 932 × 430, 1280 × 480, 390 × 844 and 667 × 375 again, with and without a nation's panel beside it.
  - Every filter, the focus selector, the three zoom buttons and the × are in view, inside the panel and on top.
  - 0 header overlaps, and every filter's tap flips it. The one exception is the upright 390 × 844 with a nation chosen,
    where the nation's panel stands over Relations on both builds (R181's upright design, not a finding).
  - Run 83's build at the same sizes on 84903: "Truces" dead at 568 × 320, 640 × 360 and 667 × 375, and "Puppets" dead
    too at 568 × 320. A tap meant for Puppets landed on the nation panel's "Take control" and took Germany
    (`critic/c84_rs_84903_5408.log`, `critic/shots/c84rs_84903_d400_c84_5408_2_667x375_GER.png`: "Playing Germany").
- **R185 kept:** `c82_graphSize 68901` gives 151 / 173 / 213 px graphs with 13 px names at 667 × 375, 844 × 390 and
  932 × 430, against 151 / 173 / 212 on run 83's build (`critic/c84_gs_68901_*_540[89].log`).
- **R184 kept:** `c83_relRoutes` on run 83's three cases and on 68901 at 844 × 390: a map tap brings the panel back
  beside the graph, 0 px overlap (`critic/c84_rt_*_5409.log`).
- **Not 9:**
  - R84-N2: at 568 × 320 the graph is 82 px tall against 110 on run 83's build, with 2 names against 3
    (`critic/c84_gs_*_568_320_540[89].log`, `critic/shots/c84rs_84903_d400_c84_5409_0_568x320_GER.png`).
  - R84-N3, the hint's line over the panel's foot.
  - R192, unchanged by choice: a second nation from the Ranking beside the graph still takes a close first.

### UI/UX and polish: 7 → **8** (scored afresh)
- **Why the score moves:**
  - Run 83 held UI at 7 on R83-B1 alone ("it would be 8 without R83-B1").
  - R83-B1's four cases now pass on HEAD and fail on run 83's build, run beside it in this run (table below).
  - R83-N2 and R83-N3 are fixed on their cases, also on both builds.
  - The routes the fixes did not name hold on new seeds.
- **R189 (R83-B1) off its route:** `c84_crossWidth` on 84901 and 84903, three routes each (`critic/c84_cw_*_5409.log`):
  - **steps:** 1280 down to 375 and back in 17 steps across 600 / 601 px.
  - **short:** a 1280-wide window made a phone by 480 and 500 px of height, then 844 × 390, then 390 × 844.
  - **opened:** "+n" opened at 390 × 844, carried to 1280 × 720 and 1024 × 768 and back, closed, then turned sideways and
    to a desk.
  - Results: 0 stale steps in 68, 0 desk steps with an inline name width, 0 desk names cut.
  - For example, at 600 × 800 the phone row comes back at 2 banners after 601 × 800 showed 1
    (`critic/shots/c84cw_84901_d400_steps_c84_5409_13_601x800.png`, `…_5_600x800.png`).
- **R190 (R83-N2):**
  - `c83_panelShort 83941 120` at 320 × 568 with God Mode: 206 px of panel against 167 on run 83's build. The God tab
    takes 9 swipes against 11, and the Overview's strip is 35 px against 74.
  - At 360 × 640: 303 px against 264.
  - Evidence: `critic/c84_ps_83941_*_540[89].log`, `critic/shots/c83ps_83941_d120_320x568_GER_c84_5409_god_tabgod.png`.
  - R186's case holds: `c81_goto2 69937 360 740` gives 7 of 7 capitals on the map (`critic/c84_g2_69937_*_5409.log`), and
    68931 at 390 × 844 gives 8 of 8.
- **R190 off its route:** `c84_goChain`, three runs (`critic/c84_gc_*_5409.log`,
  `critic/shots/c84gc_84937_d300_320x568_FRA_c84_5409_*.png`):
  - 84937 at 320 × 568: France → United Kingdom → France, then Japan → Germany.
  - 84937 at 360 × 640: Germany → Italy → Germany. Brazil's panel had no chip, so step 7 did not run there.
  - 84939 at 375 × 667: United Kingdom → France → United Kingdom, then → the Philippines.

  Across the three:
  - The strip is on each Go to's panel, a Go to after a Go to included, with the capital on the map every time.
  - It is kept when the same nation is tapped again, and through History opened and closed, and a turn sideways and back.
  - It is gone when another nation is chosen, and when the panel is closed and the nation chosen again.
- **The kept phone cases, on HEAD, 0 faults:**
  - `histOver 68901 60` at four sizes; `menuPinch 68933` at both.
  - `dirHand 59955` touch at both.
  - `moreClick 68901 1024 × 768` (clickable, 0 over the ticker); `deskFit 68901 1280 × 720` (0 covered in six steps).
  - `relOver 68933` (eight steps as named).
  - `rankBar 83951 667 × 375`: every bar button is on top with the Ranking open.
  - `c83_rotate` on 68901 and 83903: 0 stale steps.
  - The beside-panel and opened rows on 84901: 0 overflows.
  - `c83_phoneRow` on both builds: 0 stale, 0 overflow, 0 under five letters. HEAD's 3,172 layouts compare with 3,174 on
    run 83's build; frames are p95 16.7 ms on both (`critic/c84_pr_*_540[89].log`).
- **Monkeys:** 0 page errors, never hung, at 390 × 844 touch (240 s), 844 × 390 touch (240 s), 360 × 640 touch (180 s) and
  1366 × 768 (150 s) (`critic/c81_monkey.c84_*.log`). Resize: 0 chrome off screen (`critic/c81_resize.c84_84821_60.log`).
  - The 360 × 640 monkey ended at "tick moved 4 in 5 s, frames 242". Run 83's at that size ended at "5 in 5 s, frames
    300" (`critic/c81_monkey.c83_83817_*.log`).
  - Its world had been restarted by the monkey's taps (ticks 285 → 39).
  - This run measured it beside six checker processes, so the frame count is new seeds, not compared, and moves no score.
- **Not 9:**
  - **R84-N1:** a narrow desk window's single war banner over the ticker. This defect predates Batch 51 and is filed
    here; it is not the reason the score moves.
  - **R84-N3:** the hint over the panel's foot.
  - **R192:** the Ranking beside the graph needs a close first.
  - The sideways Ranking's header still scrolls away with its rows (run 83).
- **What would hold 8:** this run's cases as they are now. Phone cases from 320 to 932 px wide, crossing the widths both
  ways, must show 0 covered controls, 0 overflows, 0 stale fits and 0 names under five letters.

### Carried (the diff touches none of them; run 83's scores and evidence stand)
- **Emergent dynamics: 8** (carried). In passing, 84905's world by 9 February 1939 has the Soviet Union over most of
  Germany and at war with the Netherlands (`critic/shots/c81look_84905_1600x900_d400_3eur3000.png`).
- **God Mode: 8** (carried). `a_god_nuke 64917` re-run on HEAD, exit 0. R190 gives back the God tab's 39 px on short
  phones (UI above).
- **Editor and scenarios: 8** (carried).
- **Stats and history: 8** (carried).
- **Performance: 8** (carried). R193's cap search costs nothing seen: `phoneRow` layouts and frames are equal on both
  builds.
- **Stability: 8** (carried). 0 page errors in this run's 13.5 minutes of monkeys and in every probe.
- **Semantic zoom: 8** (carried).
- **Naval: 8** (carried; sim unchanged).
  - `seaclick 64913` re-run, exit 0.
  - `landingFuzz --seeds 15 --first 84101`: 0 of 90 broken (`critic/c84_landingFuzz.log`).
- **Tanks: 8** (carried).
- **Aircraft: 8** (carried).
- **AI nuclear use: 8** (carried). `an_ainuke 64511` on run 79's year-13 save: exit 0, `ok []`, and two strikes told in
  words (`critic/c81_an_ainuke.c84_*.log`).

## Blocking issues

None.

## Non-blocking issues (prioritised)

1. **R84-N1 (UI, a desk window 601 to 700 px wide as measured, older than Batch 51): one war banner wider than its row
   spills over the ticker's second row.** At 768 × 1024 it still overflows its row by 7 px but covers nothing.
   - **What happens:** on a desk the row is squeezed between the ticker and the legend, and `fit` stops at one banner
     (`if (shown <= 1) return`). Desk names are never cut, so a banner like "United Kingdom & 13 ⚔ Italy & 3" stays 220 px
     wide in a row 90 to 170 px wide. It is centred, so it spills over both neighbours.
   - **`c84_rowShot 84901 400`, fresh pages:** the row overflows by 81, 71, 50, 41 and 7 px at 620 × 900, 640 × 800,
     683 × 768, 700 × 800 and 768 × 1024. It covers 56, 48, 24 and 16 px of the ticker's "Carrier strike ashore" row
     (`critic/c84_rw2_84901_540[89].log`, `critic/shots/c84rw_84901_d400_620x900_c84_5409.png`).
   - **84903 day 700:** it covers 24 px at 640 × 800 (`critic/c84_rw_84903_700_*_540[89].log`).
   - **Run 83's build gives the same figures to the pixel.**
   - **Who meets it:** a desk browser snapped to half of a 1280 or 1366 screen (640 or 683 px).
   - **The "+4" works at every one of these widths:** `c81_moreClick 84901 400` at 620 × 900, 640 × 800, 683 × 768 and
     700 × 800 gives `moreClicked` true and `opened` true. The same probe reads the banner over the ticker's row by 44,
     34, 12 and 4 px (`critic/c84_mc_84901_400_*_5409.log`).
   - **Against R180, plainly:** this is R81-N3's second symptom (the row over the ticker's second row) at widths R180's
     case did not take. R180's done-note says the row's `max-width` "kept it clear of the ticker … once it no longer
     spills past it", and here the lone banner still spills. R180's AT (the "+n" clickable at 1024 × 768 and at the
     sizes that worked) holds, and the click works here too.
   - **Why it is filed non-blocking:** it predates Batch 51, with the same figures to the pixel on run 83's build. The
     covered part is the end of a ticker row whose text is already cut by its own ellipsis, and the row stays tappable on
     its left.
   - **Fix:** on a desk, let a lone banner's long names give way as the phone's do (`sizeRow` with the desk's row), or cap
     the banner at the row's width.
   - **Seen fixed when:** `c84_rowShot 84901 400 620x900,640x800,683x768,700x800,768x1024` shows `ov` 0 and `under` [] at
     every size.
2. **R84-N2 (diplomacy and UI, 568 × 320, R191's cost): the wrapped filters take three rows on the smallest sideways
   phone, and the graph falls from 110 px to 82 px.**
   - `c82_graphSize 68901 568 320` and `84933`: 82 px on HEAD against 110 on run 83's build
     (`critic/c84_gs_*_568_320_540[89].log`).
   - Names counted: 2 against 3, but with a median height of 1 px on both builds. So about one readable name on each,
     and the shot shows one, "Iraq" (`critic/shots/c84rs_84903_d400_c84_5409_0_568x320_GER.png`).
   - Nodes are 1.6 px across on HEAD. The graph was already unreadable at this size before R191; R191 makes it smaller.
   - The header's "+" makes up for it: three taps give 6 names at 13 px, and a node tapped opens its panel
     (`critic/c84_gz_84933_568_320_5409.log`).
   - Every larger sideways size keeps two rows and R185's heights.
   - **Fix:** at this height, put the focus selector in the header beside the zoom buttons, or the five filters on one row
     of swatches without words.
3. **R84-N3 (UI, sideways Relations, both builds): the hint's second line ("… shown are left out") runs over the panel's
   bottom edge** at 667 × 375 and 568 × 320 (`critic/shots/c84rs_84903_d400_c84_5409_2_667x375_GER.png`, and the same on
   `…_5408_…`).
   - **Fix:** let the graph's height give way to the hint, or drop the "left out" clause on a sideways phone.
4. **R192 kept by choice:** on a sideways phone with Relations open, a second nation from the Ranking takes a close of
   the panel first (`critic/c84_rr_68901_*_5409.log`, step 5). The builder's reason holds: the tap lands on a panel, not
   on nothing.
5. **Kept by R172 (carried from run 83, not re-read in this run):** the ring over "Pari", the AI's bomb as a faint spot,
   and like flags at sea.

## Run 83's cases re-run

| Run 83 case | Run 83's build (`42d0964e`, this run) | HEAD (`764aa144`) | Evidence |
|---|---|---|---|
| R83-B1 `c83_phoneToDesk 68901 400`, second 384 × 832 | 1 banner "+4", 156 px empty; "Soviet Union@67.5px" on every desk | **fixed**: 2 banners "+3"; no inline width at 1280, 1024, 1600 | `critic/c84_pd_68901_400_540[89].log`, `critic/shots/c83pd_68901_d400_c84_540[89]_3_384x832.png` |
| R83-B1 `83903 700 375x667,1280x720,1024x768,375x667` | 1 banner, 143 px empty | **fixed**: 2 banners | `critic/shots/c83pd_83903_d700_c84_540[89]_3_375x667.png` |
| R83-B1 `83901 400 384x832,1366x768,…` | "Nationalist Sp…" cut @89 px at 1366 | **fixed**: "Nationalist Spain" whole | `critic/c84_pd_83901_*_540[89].log`, `critic/shots/c83pd_83901_d400_c84_5409_1_1366x768.png` |
| R83-B1 `c83_rotate 68901 400 GER 20`, `83903 700 GER 30` | 0 stale (a phone that stays a phone) | 0 stale (as required) | `critic/c84_rot_*_5409.log` |
| R83-N2 `c83_panelShort 83941 120 320x568 GER` | 167 px with God, God tab 11 swipes | **fixed**: 206 px, 9 swipes | `critic/c84_ps_83941_*_540[89].log` |
| R83-N3 `c83_relCover 83903 700 667x375` | Puppets, Truces, focus hidden; ticker 2 of 2 covered | **fixed**: none hidden; 0 of 2 | `critic/c84_rc_83903_*_540[89].log` |
| R83-N4 `slowClick 83105 3517 … 2 8` | — | sim unchanged, carried; `landingFuzz` on new seeds 0 of 90 | `critic/c84_landingFuzz.log` |
| N4 (R192) `c82_relRank 68901` 844 × 390 / 667 × 375 step 5 | the panel takes the tap | the same (R192 not taken, reason given) | `critic/c84_rr_68901_*_540[89].log` |
| Design objection (R193) random 64965 at 390 × 844 | "Kagosh…" 7, "Queens…" 7, Chukotka 14 | **met**: Kagoshima, Queensland whole, Chukotka 12 | `critic/c84_bfr_64965_*_540[89].log` |
| `c82_nameLetters 68901 400` 368 / 375 / 384 / 390 | whole / whole / 7 cut / 8 cut | the same | `critic/c84_nl_68901_*_540[89].log` |
| `c82_graphSize 68901` sideways | 151 / 173 / 212 px, 13 px names | 151 / 173 / 213, 13 px | `critic/c84_gs_68901_*_540[89].log` |
| `goto2 69937 360 740`, `68931 390 844` | 7 / 7 | 7 / 7, 8 / 8 | `critic/c84_g2_*` |
| `histOver 68901 60` ×4, `menuPinch 68933` ×2, `dirHand 59955` ×2, `moreClick`, `deskFit`, `relOver 68933` ×2, `rankBar 83951` | as run 83 | the same, 0 faults | `critic/c84_{ho,mp,dh,mc,df,ro,rb}_*_5409.log` |
| `phoneRow 83901 375x667`, `83903 844x390` | 0 stale / 0 under 5 | the same; layouts equal | `critic/c84_pr_*_540[89].log` |
| Kept: `a_god_nuke 64917`, `seaclick 64913`, `an_ainuke 64511` | as kept | the same, exit 0 | `critic/c81_*.c84_*.log` |
| Stuck-return, next-voyage, Malta, nuke seeds, performance chain | carried | sim unchanged, carried | — |
| 7019 and 32019 twenty years | carried | plain 1938 unchanged, carried | — |

A note on method: `c82_relRank 84933 844 390 GER FRA` found no Germany row in the Ranking ("viaA no row"), so its
"aAgainDead" is not a reading. `c83_rankBar`'s "last row not chosen" is the CDP-swipe artifact noted in run 83.

## Design objections (none blocking)

- **ADR-1111:** heroes' plates over Europe's labels at 3,000 m/px (as in runs 80 to 83).
- **R192's choice:** a third panel has no room on a sideways phone. However, a Ranking row tapped beside the graph
  could open its nation in the panel's place rather than land on the panel.

## Ideas from other games (not scored)

- **Hearts of Iron IV**'s single filter button (run 83's idea) would also answer R84-N2 at 568 × 320, where the wrapped
  filters take a third of the panel.
- **Ages of Conflict** lists wars in a scrolling side list on narrow windows. A desk window at half a laptop's width
  (R84-N1) could fall back to the phone's row instead.

## Strengths (verified)

- **Batch 51 fixes every item on its case, and run 83's build fails each beside HEAD.** The fixes also hold on routes
  their cases did not take:
  - 68 window steps across 600 px with 0 stale counts and 0 desk names cut.
  - Go to chains on three phones, with the strip exactly where it should be.
  - Every relations filter tappable at nine sizes, where run 83's build turned a "Puppets" tap into "Take control".
- **The rule checkers are clean on 18 new five-year runs and on 90 `landingFuzz` runs.** The monkeys ran 13.5 minutes at
  four sizes with 0 page errors.
