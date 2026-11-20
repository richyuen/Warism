# Warism — Roadmap

What is still to do after `release-2026-11-03` (ADR-805, the user's decision). PLAN.md and
`docs/PLAN_DONE.md` are the frozen record of the build up to that release.

Rules:
- Work top-down. "continue" means the first unchecked item (PROMPT.md).
- Each item says what it is for, its acceptance test (`AT:` names a figure, its bar and the run that
  reads it, or the case that must hold; ADR-554), and the rules it adds to a checker, when it changes
  a sim rule (ADR-803, ADR-804).
- An item too big for one sitting is split into lettered parts (R3a, R3b), one level only.
- Tick it (`- [x]`) in the commit that finishes it, with one line under it: the commit and the
  evidence. Ticked items stay until the batch's release, then move to CHANGELOG.md.
- A batch ends with a critic run and a release tag (`release-<YYYY-MM-DD>`, PROMPT.md "Releases"; a
  second on one day takes a letter, `release-2026-11-03b`, ADR-820).

## Batch 54 — critic run 86's findings (focused, on bd85eb10; no blocking issue; every score at its bar; the release check)

Non-blocking: done after the release (ADR-1138), before the next critic run (ADR-1039). Each crosses the sizes and opens and
closes the panels beside it (ADR-1137 (d)).
- [x] R200 **R86-N2: in the sea-control, air-control and fallout map modes a desk 680 to 760 px wide shows no war, "+5"
  alone** (R197's side effect: those modes' legend is wider and the band too narrow; run 85's build showed one banner over
  the legend's corner). `critic/c86_mr2_*`, `c86ms_84901_700x800_seaControl*.png`. AT: `c86_modeRow` a war shown in
  every map mode at 680–760, nothing covered; R197's case as now. (Hearts of Iron IV's folded legend, the report's idea:
  one way to free the room.)
  - Done (fa44ea2b): on a desk of 800 px or less the legend is folded to its title until clicked, in its own place, as a
    phone's is (`NARROW_DESK_QUERY`, MapLegend's `fold`; opened, it shows its rows and the units' signs); the free band
    measured a banner's height above the row's foot, whatever the row holds (with "+n" alone the legend fell out of it
    and the banner came back 3 px over its corner). `c86_modeRow 84901 400`: `fit0` [], `stale` [], `covering` [] in
    the political, sea-control, air-control, fallout and puppet modes (before: no war at 620–740 in three of them, 3–4 px
    over the legend in two); `c84_rowShot 700x800` the banner whole beside "▸ Political". A case in
    `warBannerRows1938` crossing 700, 680, 760, 1280, a phone and back in four modes (ADR-1137 (d)): the legend folded on
    the narrow desks, open on the wide one, a war shown and the row over nothing; the legend opened and closed, a
    nation's panel opened and closed (red without: the legend not folded). 30 specs on the legend, the map modes and
    the banners 90/90.
- [x] R201 **R86-N1: with every relations kind hidden the footer says "Truces hidden" where it said "No ties of these
  kinds"** (R198's side effect; `critic/c86_rs_84903.log`). AT: the empty graph says it has nothing shown; a kind tapped
  is named as R198 has it.
  - Done (c7a6c526): an empty graph's footer says "No ties of these kinds." beside the kind just tapped ("Truces hidden · No
    ties of these kinds."); with ties shown, the kind tapped alone as R198. A case in `relationsTap1938` hiding every kind
    and showing Wars again at 568 × 320, 844 × 390, a desk and upright, a nation's panel opened and closed (ADR-1137 (d);
    red without: "Truces hidden" alone). `relationsTap1938` 13/13.
- [x] R202 **The design objection: the desk's row centred in the free band leaves the bar's axis** (24 to 44 px on a wide
  desk, moving about 68 px when the map mode changes; R197). AT: on a desk with room the row on the bar's centre, its
  width limited by the band; R197's and R200's cases as then.
  - Done (435feff5): the row keeps every banner the free band holds, and stands on the bar's centre whenever those banners
    fit in the width free on both sides of it alike (`freeBand`'s `even`); the band's middle only when the centre would cost
    a banner. `c86_deskAttack 84901 400 wide`: at 1600, 1920 and 2560 off the centre by 0 px in all eleven map modes, three
    banners (before 16 to 44 px, moving with the mode); at 1280 the political modes keep three banners in the band (16 to
    44 px off, as the centre holds two), the sea, air and fallout modes two on the centre. `c85_deskRow` 84901 and 85903,
    `c86_modeRow 84901 400`: `fit0` [], `covering` [] as R197 and R200. A case in `warBannerRows1938` crossing 1600 (a
    nation's panel and History opened and closed), 700, 1920, a phone and back in four modes (ADR-1137 (d)): on the
    centre within 1 px with three banners at 1600 and 1920, a war shown at 700 (red without: 44 px off at 1600).
    54 specs on the banners, the legend, the map modes, the news and phones 173/173.
- Not taken: the graph's 13 px jump (R196), `heroPop` on 85905, R172's, R192's and ADR-1111's kept items (as run 85).

## Batch 55 — critic run 87's findings (focused, on bbf47bca; one blocking issue, a regression; UI/UX 7)

ADR-829's exit: R87-B1 is a regression by R200 (ticked since release-2026-11-19) of R197's row clear of the legend. The
user chose ADR-1140 (b), and set the supported sizes (ADR-1141): R87-B1, at a desk of 800 px or less, is outside them, so
these items are non-blocking, done as items. Each item on the war row or a panel's place crosses the five supported sizes
(393 × 659, 393 × 852, 734 × 343, 852 × 393, 2560 × 1305) and back, the panels beside it opened and closed.
- [x] R203 **R87-B1: on a desk of 800 px or less the legend R200 folds, once opened, lies over the war row** (not counted
  again on opening: 247 to 329 sampled points covered at 700 × 800 in the sea, air and fallout modes, 121 to 203 at 780;
  after a recount fallout's banner still half under it, 193; the opened state kept across resizes). `c87_lo_84901.log`,
  `c87_ls_84901_700_*_w4000.log`, `c87lo_84901_d400_700x800_seaControl_open.png`, `c87ls_84901_700x800_fallout_back.png`.
  AT (ADR-1140 (b), the user's choice): on a desk of 800 px or less the legend, folded and opened, stands at the top left
  as the phone's does and gives way to a nation's panel and History; `c87_legendOpen 84901 400` `rowOverLegend` 0 and
  `legendOverRow` 0 opened and back, `nudged` = `shown`; `WAIT=4000 c87_legendShot 84901 400 700 800 fallout` 0 both
  states; `c86_modeRow 84901 400 800` as R200; a case that reads the row while the legend is open.
  - Done (24a04c8c): the folded legend's place and its giving way to a nation's panel and History are the phone's rules on a
    desk of 800 px or less too (`style.css`, one block for `PHONE_QUERY` and `NARROW_DESK_QUERY`); nothing of the legend
    is in the row's band, so the row needs no recount. Its height ends above the war row, its rows scrolled (found by the
    case at a supported size: on the iPhone 16 sideways, 734 × 343 and 852 × 393, the phone's opened sea legend lay over
    the row, 2,203 points, and at 343 over the bar). Beside it on a narrow desk: the opened legend left of an open
    ranking and of the landings' bar, its lines wrapped; the first cue stays in its place (its left edge at 150 px at
    601, the widest title's right at 125; an opened legend lies over it until folded, as a phone's). `MODES=political,seaControl,airControl,fallout,puppets c87_legendOpen 84901 400`:
    `rowOverLegend` 0 and `legendOverRow` 0 opened and back, `nudged` = `shown`, in all 20 cases (700 × 800, 780 × 800,
    760 × 560, 640 × 520); its diplomacy leg selects a nation, whose panel the legend now gives way to as the AT asks,
    and the probe waits on a toggle that is gone (the case below reads that state). `WAIT=4000 c87_legendShot 84901 400
    700 800 fallout`: `legendOverRow` 0 opened and after 1280 and back. `c86_modeRow 84901 400 800`: `fit0` [], `stale`
    [], `covering` [] in five modes. A case in `warBannerRows1938` crossing 700 × 800, the five supported sizes, 780 ×
    800, 640 × 520 and back in three modes: the legend at the top left, the row read by the element at its points both
    ways while the legend is open, the legend's foot above the row, on nothing of the page's on a narrow desk, a 1 px
    nudge, a nation's panel, History and the ranking opened and closed (red without: the legend at 508 px). Three cases
    in `landingsBarPanel1938` (601, 700, 800 px: the opened legend left of the landings' bar). 26 specs on the legend,
    the war row, the first cue, the landings and every spec with a view 601 to 800 px wide 90/90 on the final tree. No
    sim or drawing code changed (goal 5 not read). Stands on ADR-760, ADR-1140 (b), ADR-1141; SPEC §"The least view" says the narrow desk's fold.
- [x] R204 **R87-N2: on a desk of about 1100 to 1366 px the row jumps 24 to 44 px when a war on it changes** (R202's rule
  decides centre or band from the banners shown now; `c87_rowJitter 87601 300`: off the centre 40 % of the time at 1280 ×
  720). AT: `c87_rowJitter 87601 300` `moves` 0 wherever `countCh` is 0; R202's case as now.
  - Done (f63f45c8; ADR-1142): the row's side is chosen when the free band or the number of banners changes and held
    until then (`rowStand`); held on the centre, a row that outgrows it gives a banner behind "+n", and that many banners
    come back in the band. `c87_rowJitter 87601 300` on the final code: `moves` 0 in the six cases where `countCh` is 0
    and in 820 × 800 political with its one, one move in the eighth with its count's change (1100 × 800 political,
    3 → 2); the same on a pass before `outgrown`. On another seed, `c87_rowJitter 84901 400`: `moves` 0 in the four
    cases where `countCh` is 0, five moves in the other four, each with its count's change (2 → 3, 3 → 2, 1 → 2). The
    same eight cases of 87601 for 60 s
    (a scratch copy that also reads the band's edges): moves with the count unchanged 11 → 0, moves in all 12 → 3, count
    changes 1 → 4; the band's edges still in every case. The cost in ADR-1142: at 1280 × 720 political the row 44 px off
    the centre the whole time (47 %, jumping). R202's and R197's as then: `c86_deskAttack 84901 400 wide` 0 px off with
    three banners at 1600, 1920 and 2560 in eleven modes, 1280 as R202 had it; `c85_deskRow` 84901 and 85903 and
    `c86_modeRow 84901 400` `stale` [], `fit0` [], `covering` []. `tests/unit/rowStand.test.ts` (6: the side over
    sweeps of widths, the drop, one banner, the slack). A case in `warBannerRows1938` at 1280 × 720: the Spanish war
    gives its place to Turkey and Iran's and the row stays (red without: 44 px), the map mode changed and back chooses
    again, a war of long names takes a place and the row stays on the centre, a banner behind "+n" (the branch that ran:
    2 banners, 0 px off; the long row is 715 px against the centre's 712); then the five supported sizes crossed and
    back, a nation's panel and History opened and closed, the row in its width and over nothing at each, three banners
    on the centre at 2560 × 1305, a 1 px nudge at the end (ADR-1137 (d), ADR-1141). 14 specs on the war row 72/72
    (`director1938` seed 7 timed out loading in the run of all, green alone). A page rule, no sim rule (ADR-803 not
    read); no drawing code (goal 5 not read).
- [x] R205 **With every relations kind hidden at 1600 px the footer says "No ties of these kinds." and "98 nations with no
  tie shown are left out"** (R201; the second says nothing new; `c87_rs_84903_400.log`). AT: the empty graph's footer
  without the left-out count; R201's case as now.
  - Done (39ccc7a1): the left-out count is said only beside a graph with ties shown (`RelationsPanel`'s footer). R201's
    case in `relationsTap1938`, now at 1600 × 900 too: with every kind hidden the footer is "Truces hidden · No ties of
    these kinds." and no more (red without: "… · 102 nations with no tie shown are left out"), the count there with
    ties shown and back with Wars shown again. `c86_relSaid 84903 400`: that line at 568, 844 and 1600 px, `empty` [],
    `cut` [], `out` []. heroesRead1938, relations1938, relationsTap1938 21/21. Mends R201's rule; no ADR (ADR-914).
- [x] R206 **The design objection: R200 folds the legend on every narrow desk in every mode,** the political mode's two
  lines too, which never crowded the row. Taken with R203 as ADR-1140's choice decides (folding only the wide legends,
  or when the band is short, is the report's way). (Europa Universalis IV's legend in the map-mode button's tooltip, the
  report's idea: ADR-1140 (d).)
  - Not taken (with R203, 24a04c8c): by ADR-1140 (b) the folded legend is out of the row's band in every mode, so the
    political legend's two lines crowd nothing there; open at the top left they would cover the map where a phone's are
    folded, and a legend open in one mode and folded in the next would change its size with the mode. One place and one
    state in every mode, as the phone's (ADR-760). (d) was the user's to choose and (b) was chosen.
- [x] R207 **On a desk 601 to about 700 px wide the landings' bar stands on the nation panel's ×** (found by R203's case:
  a click on `nation-close` lands on `landing-go` or `landing-status`; R61-N1's case, mended there for a phone on its
  side, R60a). Outside the supported sizes (ADR-1141): non-blocking. AT: at 601, 640 and 700 × 800 with a landing
  ordered the element at the ×'s centre is the ×, and a click closes the panel; `landingsBarPanel1938` as now.
  - Done (51d72ab0): beside an open nation's panel the bar's middle stands no further left than the panel's right edge
    and half the bar's least width (`left: max(50%, 28.6rem)`); on a desk with room that is the page's middle, as
    before. R203's cases in `landingsBarPanel1938`, now at 601, 640, 700 and 800 × 800: the element at the × is the ×,
    the bar right of the panel and in the view, the click closes the panel (red without at 601, 640 and 700: the bar's
    row at the ×); a case at 1280 × 800: the bar on the page's middle within 1 px. The sideways phones' cases as before.
    landingHoldMark1938, landingMark1938, landingsBar1938, landingsBarPanel1938, research1938 19/19. Mends R60a's rule for a narrow desk; no ADR (ADR-914).
- [x] R208 **On the iPhone 16 upright the opened legend lies over the folded ranking's bar** (found by R203's probe, as
  it was before R203: at 393 × 659 and 393 × 852 the ranking's bar stands at 156 to 386 px beside the legend's title, and
  the opened legend reaches 237 px in the political mode, 328 in sea control, 347 in air control, 369 in fallout; the
  ranking's toggle is under it until the legend is folded). A supported size (ADR-1141). AT: at 393 × 659 and 393 × 852
  the opened legend's box meets no box of the page's in the political, sea-control, air-control and fallout modes, and
  the ranking's toggle takes a tap while the legend is open; sideways (734 × 343, 852 × 393) as now; R203's case as now.
  - Done (638aae49): on an upright phone the ranking gives way while the legend is open and is back as it folds, as it
    gives way to a nation's panel, History and the landings there (one rule in the phone's block). **The AT's second
    half is not met as written, by choice:** for the ranking's toggle to take a tap beside an opened legend, the legend
    would open under the toggles' row, its title 34 px lower than the tap that opened it, and a second tap on the same
    place would fall on the map; one of the two at a time keeps the title where it was tapped. R203's case in
    `warBannerRows1938`, the ranking shown as each view has it: at 393 × 659 and 393 × 852 the ranking hidden under the
    opened legend, the legend's box on nothing but the news, the ranking back and the folded legend on nothing; at 734
    × 343 and 852 × 393 the ranking stays beside it (red without: the ranking not hidden at 393 × 659). 23 specs on the
    ranking and the legend 95/95. Stands on ADR-760; no ADR (ADR-914).
- Not taken: the graph's 13 px jump (R196), `heroPop` on 85905, R172's, R192's and ADR-1111's kept items (as run 86).

## Batch 56 — critic run 88's findings (focused, on 3e1ed78e; one blocking issue; stability 7, the rest 8)

Batch 55 fixed on run 87's probes (R203, R204, R205, R208; R207 not re-run at its own sizes, the × the × at the five
supported ones). The blocking item first, then the critic again with the non-blocking ones open (ADR-1138). Each item on
the war row or a panel's place crosses the five supported sizes and back, the panels beside it opened and closed.
- [x] R209 **R88-B1 (blocking, stability; not of Batch 55, the same on bbf47bca): one long `sim.step` in the page ends in
  another world than the seed's headless one.** Plain 1938 seed 88901, `sim.step(9600)` in one message: the headless
  `3723997852` in 10 loads of 18 and `1699438925` in 8, from the same messages; 7,200 hours 2 of 8 wrong; 4,800 or less,
  chunked steps and a running game hold; seed 88903 holds. `tools/diag/pageHash.ts` on 88901: 3 of 10 equal to headless.
  No player route found (nothing in `src/app` or `src/ui` sends `step`); it blocks as a broken checker and against SPEC
  §2.6. The cause not found; the critic's lead: what the worker does between hours by the clock (the snapshot, the
  labels, the statistics). AT: `c88_sameWorldMsgs 88901 400 12` one end hash `3723997852`; `c88_sameWorldMsgs 88901 300
  12` one end hash `4108155890`; `pageHash.ts <base> 88901 1 76540321 10 3` "10 of 10 runs equal to headless every
  year"; `c88_playHash 88901 9600 6` "same as headless: 6 of 6"; a page case that steps 9,600 hours of 88901 in one
  message against the headless hash.
  - Done (8c75a5fa; ADR-1143): the cause is a miscompile of Chromium 153's Maglev, not a rule. `enemyDistance`'s
    breadth-first loop called a closure that wrote the loop's own `tail` and `left`; at hour 4,983 Latvia's field
    capital went to the cell beside Riga (the worlds part there, in nation 7's capital alone), read as the compiled
    loop, entered by on-stack replacement, losing those writes (ADR-1143 says what was read and what was taken from it). The loop writes them itself. Read by
    the engine's flags: `--no-use-osr`, `--no-maglev`, `--single-threaded` 8 of 8 right each; Maglev for
    `enemyDistance` alone 3 wrong of 24, for all but it 24 right of 24. On the fix: one step of 9,600 hours, 32 loads of
    32 at `3723997852` (before 4, 5, 6 and 4 wrong of 8 in four plain runs); `c88_sameWorldMsgs 88901 400 12` one end hash
    `3723997852`; `c88_sameWorldMsgs 88901 300 12` one end hash `4108155890`; `pageHash.ts <base> 88901 1 76540321 10 3`
    "10 of 10 runs equal to headless every year"; `c88_playHash 88901 9600 6` "same as headless: 6 of 6".
    Other seeds, `pageHash.ts` a year in one message, ten loads each, against `workerDeterminism`'s `plain` arm: 1307
    (`d8edd859`, the control run 88 left out), 99 (`f311b292`), 20933 (`5dee739e`) and 51377 (`d55bbddd`), 10 of 10
    each. The spec steps the headless world itself (no hash kept by hand).
    `tests/e2e/longStep1938.spec.ts`: four loads at once, 9,600 hours in one message each, against the headless hash
    (red without: one load of four at `1699438925`). `capitalsDistance.test.ts` and `capitals.test.ts` 21/21: the
    search's answers as before; the pin of seed 99 unchanged (the gate). Stands on ADR-5 and SPEC §2.6 (a line added),
    ADR-640 and PLAN 7.83d (the search's rule and its cut, both kept). Tick time not read: the loop runs when a
    nation's last city falls.
- [ ] R210 **R88-N1: on the iPhone 16 upright with a landing ordered the landings' bar lies over the folded legend,
  whole** (308 of 308 sampled points, the toggle takes no tap; the same on bbf47bca). AT: `c88_sizes 88903 0
  393x659,393x852` no `legend<landings` in the `landing` rows and the toggle opens. (Hearts of Iron IV's orders in one
  list at the screen's edge, the report's idea: a phone's landings as a row above the news would end this and R211.)
- [ ] R211 **R88-N2: on the iPhone 16 sideways with a landing ordered the landings' bar lies over the opened legend** (231
  to 420 points, 1,365 to 1,792 with the bar's row opened; at 734 × 343 the opened row also over the war row and the
  news; R203's rule for the bar is a narrow desk's alone). AT: `c88_sizes 88903 0 734x343,852x393` no `legend<landings`
  and no `row<landings`.
- [ ] R212 **R88-N3: at 393 × 659 the relations footer's first line is cut** ("Click a nation to select it, a line to
  read it. · 24 nations with no tie shown are left out"; two lines at 393 × 852; `c88_rs_88905_400.log`). AT: the
  footer whole at 393 × 659, the graph's height as R185 and R195 have it.
- [ ] R213 **R88-N4: at 393 px two banners of one war row both read "Natio…"** (Nationalist Spain in two wars). AT: two
  banners of one row never read alike while their wars differ; R174's and R183's cases as now.
- Design objections (UI/UX at its bar; ADR-843 files those of a dimension under its bar, these for the record): the
  opened legend over the news on a phone on its side (R203's choice): not taken now, the legend above the news would
  be about 100 px high at 734 × 343; R208's hidden ranking toggle: not taken, the tick's reason holds (the title stays
  under the tap). Both the user's to overturn.
- Not taken: `heroPop`'s jumps (85905: 13; 88905: 8), the graph's 13 px jump (R196), R172's, R192's and ADR-1111's kept
  items (as run 87).

## Released

- `release-2026-11-03b` (2026-11-03): R0a–R0i and Batch 1 (R1–R5, R7–R15), in CHANGELOG.md for
  players; the items with their evidence in `docs/history/ROADMAP-release-2026-11-03b.md`.
- `release-2026-11-10` (2026-11-10): Later (R6, R16–R44) and Batches 3–13 (R34–R58), and R61a of the release
  checks, in CHANGELOG.md for players; the items with their evidence in
  `docs/history/ROADMAP-release-2026-11-10.md`.
- `release-2026-11-11` (2026-11-11): Batches 14–16 (R59, R60, R61a's follow-ups, R62 the historical track, R63, R64), in
  CHANGELOG.md for players; the items with their evidence in `docs/history/ROADMAP-release-2026-11-11.md`.
- `release-2026-11-13` (2026-11-13): Batches 17–23 (R65–R79: armies on the replay's fronts, Cold War blocs, a start from any
  year, the replay to 1975, a faster tick, runs 63–67's findings, the gate on the GPU), in CHANGELOG.md for players; the
  items with their evidence in `docs/history/ROADMAP-release-2026-11-13.md`.
- `release-2026-11-15` (2026-11-15): Batches 24–31 (R80–R88: the replay to 1991, run 67's "not 9" items, the year's
  card, runs 68–72's findings, the release checks), in CHANGELOG.md for players; the items with their evidence in
  `docs/history/ROADMAP-release-2026-11-15.md`.
- `release-2026-11-17` (2026-11-17): Batches 32–42 (R89–R137: the map's look, a war's opening and its fronts, the review
  of the game's pictures, runs 73–75's findings), in CHANGELOG.md for players; the items with their evidence in
  `docs/history/ROADMAP-release-2026-11-17.md`.
- `release-2026-11-19` (2026-11-19): Batches 43–53 (R138–R199: the director, the borders' time-lapse, History's rows to their place,
  the sea lift, the phone's layouts and war row, runs 76–85's findings; the first release on one focused run,
  ADR-1138), in CHANGELOG.md for players; the items with their evidence in `docs/history/ROADMAP-release-2026-11-19.md`.
