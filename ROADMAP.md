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
- [x] R210 **R88-N1: on the iPhone 16 upright with a landing ordered the landings' bar lies over the folded legend,
  whole** (308 of 308 sampled points, the toggle takes no tap; the same on bbf47bca). AT: `c88_sizes 88903 0
  393x659,393x852` no `legend<landings` in the `landing` rows and the toggle opens. (Hearts of Iron IV's orders in one
  list at the screen's edge, the report's idea: a phone's landings as a row above the news would end this and R211.)
- [x] R211 **R88-N2: on the iPhone 16 sideways with a landing ordered the landings' bar lies over the opened legend** (231
  to 420 points, 1,365 to 1,792 with the bar's row opened; at 734 × 343 the opened row also over the war row and the
  news; R203's rule for the bar is a narrow desk's alone). AT: `c88_sizes 88903 0 734x343,852x393` no `legend<landings`
  and no `row<landings`.
  - R210 and R211 done together (55b31e41; one cause, the phone's landings' bar and its legend in one place): upright
    the bar stands under the legend's title (`--landings-top`, 6.2 rem); on a phone the bar gives way while the legend
    is open and is back as it folds, one of the two at a time as the ranking (R208); the bar's opened row ends above
    the war row, its lines scrolled. `MODES=political,seaControl c88_sizes 88903 0 393x659,393x852,734x343,852x393`: no
    `legend<landings` and no `row<landings` in any row, no "toggle press failed" (before 308 of 308 and 363 of 363
    upright, the toggle's tap timed out; `row<landings 574`, `news<landings 342` at 734 x 343); what is left there is
    R203's legend over the news (run 88's objection, not taken). A case in `landingsBarPanel1938` crossing the five
    supported sizes and back with one landing, a nation's panel opened and closed at each: the bar and the legend
    apart, the element at the legend's title the title, the bar gone while the legend is open and back, the opened
    bar's foot above the war row (red without: the two met at 393 x 659). 22 specs on the legend, the ranking, the
    landings and the first cue 83/83. Stands on ADR-760, R60a, R208; no ADR (ADR-914).
- [x] R212 **R88-N3: at 393 × 659 the relations footer's first line is cut** ("Click a nation to select it, a line to
  read it. · 24 nations with no tie shown are left out"; two lines at 393 × 852; `c88_rs_88905_400.log`). AT: the
  footer whole at 393 × 659, the graph's height as R185 and R195 have it.
  - Done (d15ae683): the footer does not shrink in its panel's column (`flex: 0 0 auto`); the graph gives the height.
    `c88_relSaid 88905 400`: `cut` [] at 393 × 659, 393 × 852, 734 × 343, 852 × 393 and 2560 × 1305 (before `cut`
    ["open"] at 393 × 659), `empty` [] and `out` []. A case in `relationsTap1938` crossing the five supported sizes and
    back, a nation's panel opened and closed: the footer whole and in its panel with ties shown, wars hidden and none
    shown, the panel in the view, the graph at least 100 px high (red without: cut at 393 × 659). heroesClear1938,
    heroesRead1938, relations1938, relationsLabels1938, relationsNamed1938, relationsTap1938 34/34 (R185's and R195's
    cases among them). No ADR (ADR-914).
- [x] R213 **R88-N4: at 393 px two banners of one war row both read "Natio…"** (Nationalist Spain in two wars). AT: two
  banners of one row never read alike while their wars differ; R174's and R183's cases as now.
  - Waits on the user (ADR-1144, proposed): the row reads as ADR-1136 (a), the user's choice, has it (the names to five
    letters first, the counts whole): "Natio… ⚔ Portugal & 2" beside "Natio… & 1 ⚔ Italy & 2" at 393 px (38 px of
    77 drawn), whole at 734 px. A better reading changes that order: the options are in the ADR. Not ticked.
  - Done (52eeb7e1): ADR-1144 (b), the user's choice: a long name gives way down to its first word, then the banners
    drop their counts, then the names go to five letters (`sizeRow`). `warBannerRows1938`'s new case: Nationalist Spain
    at war with Italy and with Portugal, the others at peace; at 393 × 852 and 393 × 659 each of its names reads
    "Nationalist" at least and no two banners of different wars read alike (as drawn: the letters before the ellipsis,
    the counts shown); at 734 × 343 whole. It reads "Nationalist S… ⚔ Italy" beside "Nationalist S… ⚔ Portugal" at 393
    (looked at). Red on the old order ("National…"), and R193's case with it ("cut inside the first word while a count
    stands" at 390); R174's and R183's cases as now. `warBannerRows1938` and `phoneLayout1938`, 29/29, both projects.
- **Critic run 89 (focused, on f27f48f5): no blocking issue, every score at its bar (stability 7 → 8, R88-B1 fixed on its
  four cases; the old build beside HEAD on 88901, 2 wrong of 24 against 0 of 74). The release check (ADR-1138): the
  items open here are fixed before the release, with no critic run after them (ADR-1139).** R210 to R213 kept as they
  are; its own three:
- [x] R214 **R89-N2: at 2560 × 1305, at world zoom, the band above the map's north edge is the sea's last row drawn out
  into faint vertical stripes** (`critic/shots/c89_edge_top.png`; a supported size). AT: the view beyond the map's north
  and south edges one flat sea colour at 2560 × 1305 and at the four phone sizes; the map's own rows as now.
  - Done (628cd6e7): past the map's top and bottom rows the sea's depth goes over to the deep's one shade within
    `EDGE_FADE_CELLS` (8), at T0 and T1 (the shade texture's edge row went on there) and in the ground's sea of T2 and
    T3 (`depthAt`). The least zoom shows the map at nine tenths of the view's height, so the band is a twentieth of
    the view at every size (65 px at 2560 × 1305), not at the desk alone. `tests/e2e/mapEdge1938.spec.ts` at the five
    supported sizes: rows of the picture 2 and 6 px from the view's top and bottom, over the map's width, one colour
    (a spread of 2 of 255 at most), north and south alike (red without at all five: the Arctic's stripes). Looked at:
    the band above and below the map at 2560 × 1305, flat. The whole browser suite 533/533 (the shader is every map
    spec's). Frame time not read here: one `mix` a sea pixel; `bench G --gpu-only` is the release's check. No ADR
    (ADR-914: a look mended, PLAN 4.7f's and R91's shades as they were on the map).
- [x] R215 **R89-N3 and the objection to ADR-1143: R209's pin is one event of one seed, and the rule is checked by
  nothing.** AT: `longStep1938` says that the world it stepped did send a capital to the field (red when the seed's
  world no longer does); a test that reads `src/sim` and `src/worker` for a loop whose bounds a closure of its function
  writes, 0 found, red on `enemyDistance` as it was before R209.
  - Done (9f65ba5a): `tests/unit/loopBounds.test.ts` reads every source of `src/sim`, `src/worker` and `src/shared`
    with the TypeScript parser (`loopBoundsScan.ts`) for a `for`, `while` or `do` loop whose condition reads a variable
    that a closure of the loop's function writes, the closure written in the loop or called by its name from it: none
    found. It finds `enemyDistance` as it was before R209 (`tests/fixtures/enemyDistanceBeforeR209.ts.txt`: the search
    loop, `reach` writing `left` and `tail`), a closure written in the loop and a write through a destructuring, and
    leaves alone a loop that writes its own bounds, a closure's own variables and a closure the loop does not call.
    `longStep1938` counts the capitals its headless world sends to the field (`CapitalMoved` to no city) and is red
    with none, saying to choose another seed; green on 88901 (run by hand). What the reading cannot see: a closure
    reached through another call (a callback handed to a function in another file). SPEC §2.6's line names the test.
- [x] R216 **R89-N1: three of six new three-nation random worlds have no war in ten years** (`fewNationWars 3 89401 6
  10`: 89402, 89403, 89404; ADR-1129 keeps the rules, a peace of near-equals; on the page three years with 2 events).
  AT (the report's second way; the first, a war on 5 of 6, would change ADR-1129's rules): in a world of few nations with
  no war the page says that its nations are at peace and why, at the five supported sizes; `fewNationWars 3 85401 6 10`
  as now.
  - Done (2a438a2d): ADR-1145. `peaceWhy` reads each realm's reason by the strategic AI's own terms at its most
    restless; the war row's place says "At peace" and the reason most share ("none outmatches another" on 89403), a tap
    opens each realm's; "for now" with no reason when one may yet declare (89404, 89402 from year 9). Read on ADR-1129's
    worlds as it traced them (54425 near-equals, 55404 across the sea, 59423 no lift; `tests/unit/peaceWhy.test.ts`,
    with the save the same bytes after each read and 89401 giving no reason in the month before its first war).
    `tests/e2e/peaceLine.spec.ts` at the five supported sizes: the line and its reason whole, in the view and over no
    other box, closed and opened; gone when a war is declared; "for now" on 89404; none in 1938 at peace (looked at:
    393 × 852, 734 × 343, 2560 × 1305). `fewNationWars 3 85401 6 10`: run 89's six lines, the same (the sim does not
    import `peaceWhy`). The worker asks it once a game day at most, and in 1938 reads only the war count. With
    `warBannerRows1938`, `phoneLayout1938`, `landingsBarPanel1938`: 46/46 on both projects. Found on the way: R217.
- Run 89's objection to ADR-1129 (a small world's AI tiring of peace by the year): not taken, a change of the rules
  ADR-1129 kept; R216 takes the telling. Run 88's two stand as filed below.
- Design objections (UI/UX at its bar; ADR-843 files those of a dimension under its bar, these for the record): the
  opened legend over the news on a phone on its side (R203's choice): not taken now, the legend above the news would
  be about 100 px high at 734 × 343; R208's hidden ranking toggle: not taken, the tick's reason holds (the title stays
  under the tap). Both the user's to overturn.
- Not taken: `heroPop`'s jumps (85905: 13; 88905: 8), the graph's 13 px jump (R196), R172's, R192's and ADR-1111's kept
  items (as run 87).

## Batch 57 — found in R216's trace (filed after this release's tag, a new declaration rule wanting a critic run after it, ADR-1139; R217 and R218 put before the release by the user, 2026-11-20, ADR-1146, with a critic run after them)

- [x] R217 **A massing begun on a border no man of its army can walk to** (found tracing R216's 89404; three-nation
  random world, `.cache/massTrace.ts`, `.cache/armyLand.ts`). Nation 2's whole army (4.2 M men) stands on its home
  continent (navigation land 56, 362,792 cells, no other holder); its borders with 1 and 3 lie on a northern land of
  33,601 cells (land 4, held by all three, no man of any) and small islands. `homeNeighbours` counts them as home by
  their area, so the strategic AI begins a massing there (`beginMassing`: the border has points); with 0 % of its men on
  the border's lands it is never ready, is given up after `MASS_DAYS` and bars the target `MASS_BAR_DAYS`: nine
  massings in ten years, no war (R123's `alone` is for one neighbour only). Nation 1's on 3 reach 44 % of the 50 %
  five times (`MASS_READY`; a separate question). AT: the 89404 case has its war, or its peace for a reason the
  rules state (R139's lift), in ten years; no massing begins with no man on its border's lands, checked on several
  seeds (ADR-804's checker); seed 99's pin and `fewNationWars 3 85401 6 10` as now or the change logged; one
  definition of "across the sea" for `warTarget`'s cost, `acrossSea`'s lift and `beginMassing` (not `standing()` in
  the per-candidate pick: R82f's +37 %). First: where the cause belongs (the home rule, the massing, or the random
  world's placing of armies on its capitals' land), and how often it happens in seed 99's first year and in a
  60-nation random world. Likely origin: R84h (ADR-1065) made each piece of a nation's own of `HOME_KM2` or more its
  home (`homeNeighbours.test.ts`: 51401's second nation borders the third only by such a piece).
  - Done (4e7b0505): ADR-1146. A neighbour of a nation's home is one of `homeNeighbours`' at whose border its land men
    stand on the border's land (`homeByLand`; `armyLands`, `borderOnLands` in `massing.ts`), the one definition for
    `warTarget`'s cost, `acrossSea`'s lift, `beginMassing`, `unprepared`, `stillDeclares`, `landlessPowers` and
    `peaceWhy`; `noLift`'s touch by land only where a man of the declaring side stands. The cause is the rule's: of
    massings begun with no man on the border's lands, seed 99's first year 0 of 14, 60-nation worlds 1 of 30 (seed 7)
    and 1 of 18 (60601), both armies that stood elsewhere, not never placed. 89404: 0 wars and 14 empty massings in ten
    years → 6 wars (2 on 3 by a landing on day 138; until its lift `peaceWhy` reads nation 2 `noLift`). Checker: `mass`
    in `diploInvariants` (no massing begun with no man there), a three-nation case 89404 (red before on day 5), seed 7's
    60 red before on day 131; the other cases green. `fewNationWars 3 85401 6 10` as run 89 but 85406 (first war day
    1197 → 1126); 51401 and 53401 6 of 6. `warOpening`, five seeds, three years: nothing held at day 30 10.1 → 7.7 %,
    attacker none near 12.4 → 3.4 %, defender ahead 16.2 → 12.9 %. Pin f311b292 → 9aaa81c1 (the Soviet Union's war on
    Mengjiang, a neighbour it touches nowhere, not declared). Tick +1.5 %. ADR-1145's "for now" world is 89418 now.
    `peaceLine.spec.ts` run by hand. Found on the way: R218.
  - After it (552aeab1): `peaceWhy` gives no reason for a realm refused for want of a lift whose transports are on order
    (`landlessPowers`, no group at a port): 89414 and 89415 read `noLift` to day 90 and went to war on days 98 and 112.
    The 30 days before the first war reason-free on seven worlds; `peaceWhy.test` (89414 added) and `peaceLine` 7/7.
    Reads: the sweep suite 29/29, `farConquests 0` far capitals 10.0 → 8.0 a seed (Brazil's 0 of 8 both),
    `c69_firstdecl 60` 0 of 61 over 6,000 km (ADR-1146).
- [x] R218 (before the release, the user's word, 2026-11-20) **A random world's capital on a sea cell** (found in R217: seed 7's 60, 10 capitals on a cell no nation owns,
  land 0; 89413, 2 of 3). `homeNeighbours` then finds no home (null: every neighbour home before R217; those its men
  stand by since). AT: every random world's capital on a land cell of its own at the start, on several seeds and sizes;
  the capitals' cities as now. First: where the capital point is set (the city's centre beside the coast).
  - Done (0ee58e32): the cause is the readers, not the placing: every capital city's own cell is land of its nation (1938
    102 of 102, seed 7's 60 60, 89413 3), while the coordinates of a shore city lie in the sea (13 of 1938's: Brazil,
    Estonia, Iceland, Panama, New Zealand…; 10 of seed 7's 60; 2 of 89413's). Three readers made a cell of them:
    `homeNeighbours` (no home: every neighbour home), sea supply's bloc home lands (`seaReach`) and the map's label
    (`deriveNationLabels`'s capital piece). They read the capital city's cell now (`capitalCell`, `capitalCells`). AT
    as re-scoped: `capitalLand.test.ts`, on 1938 99, random 7 (60) and 89413 (3), each living nation's capital cell its
    own land and a home but where its province is another's by its centre (Danzig, the Communists, Mengjiang), red
    before (13 and 10 with no home); and no source of the sim, worker or shared code makes a cell of the coordinates
    but `capitals.ts` (the old reader found). Seed 99's pin as it was (9aaa81c1), its year's wars and massings the same;
    `fewNationWars 3 85401 6 10`, 51401 and 89404 as after R217; 89401-89406 a war on 5 of 6 (89403's near-equals at
    peace, said); seed 7's 60 0 of 29 massings with no man there. `seaSupply1938`'s kept-answer test moves Italy's seat
    to a city on Malta, as the game moves a capital (the coordinates alone are no longer read). Supply 0.206 →
    0.220 ms a tick. No ADR (ADR-914: R82d's and R84h's "capital's land" read as stated).

## Batch 58 — critic run 90's findings (focused, on fc767d88; one blocking issue; diplomacyWarDepth 7, the rest 8)

- [x] R219 **R90-B1: the peace line says the peace holds "even after ten years" days before the war it rules out**
  (90441: "no rival within its reach" for both to day 90, transports at port on day 91, war on day 98; 89401: a truce
  with 2 days left read as "bound", the next rival named, war on the truce's party 7 days on; 16 of 33 wars on 24 seeds
  within 30 days of a day with reasons). AT (the report's "seen fixed when"): `node critic/scripts/c90_peaceWeek.mjs
  90441 2 88 98` and `... 89401 3 1595 1604` read "for now" (or the coming war's rival) every day before the war; on
  the 24 seeds (`c90_peaceTruth.ts 3 89401 4 10`, `3 90411 6 10`, `3 90431 8 10`, `2 90441 6 10`, then
  `c90_peaceWars.sh`) no war within 30 days of a day whose reasons were a truce or "no rival within its reach"; the
  14 untraced (`noLift` among them) traced, each a cause fixed or a war no reason can foresee (a revolt, a new nation).
  - Done (bdd4bec1): ADR-1148. `peaceWhy` gives no reason, in any branch, for a realm whose lift is on its way (no
    group at a port; one in training, at sea, or ordered at peace by `landlessPowers`) or that holds off a rival it
    would fight only by a truce (two years, ends before the cap). The page: 90441 days 88-97 and 89401 days 1595-1603
    "At peace for now", then the war. The 24 seeds: wars after a day with reasons 33 → 1 (2,186 days on), within 30
    days 16 → 0, so the 14 untraced among them too; days with reasons 65 % → 33 % of peace days; reads pure. Tests:
    `peaceWhy.test` (two cases, red before), `peaceLine.spec` 7/7 by hand. The page probe wrote over the critic's
    `c90_pw_90441.json`, `c90_pw_89401.json` and their shots (git-ignored, not restored).
- [x] R220 **R90-N3: with heroes, 7019's year-20 battle at 1,200 m/px drops one 4-second sample to 51.5–52.1 fps**
  (against 60.1 on `f27f48f5` beside it, 4 of 4; the tier's mean 56.8–57, run 89 59.7). AT: `TAG=x VW=2560 VH=1305 node
  critic/scripts/c85_pf_lookfps.mjs 7019 critic/c79_hseed7019_y20.bin` no sample under 58.5 fps in two runs; first,
  which commit since `f27f48f5` costs it (R214's shader, R217's formations pass, R218's capital cells).
  - Done (b6767004): the worker, not the draw. Bisected (each build probed alone): `2a438a2d` 60.1/60.1/58.8, R217's
    `4e7b0505` 52.1 and after. From the save the sim's hours, both commits at once on separate cores: one day start
    40 days on (hour 176,160) took 194 ms on HEAD, 39 ms before; `strategicAi` 167 ms of it, 90 ms in `inReach`
    (`callSides` asking the side rule's 500 km reach, round by round, for the more declarations R217 lets through) and
    20 ms in R217's `massPoints`. At Max that hour is a frame's worth of snapshots missed. `inReach` now spreads over
    typed arrays (one queue, the nations by id) in place of a `Set` asked and a four-cell array made per cell: the same
    cells reached, the same answer (7019's hash after 200 days and seed 99's pin as before). That day's `strategicAi`
    167 → 81 ms; seed 99's year, `strategicAi` mean 0.32 → 0.17 ms, its longest 247 → 77 ms. The AT, two runs: lowest
    1,200 m/px sample 58.9 and 58.8 (run 89's build 58.8 at the same spot), every other tier 59.2 or more. No ADR.
- [x] R221 **R90-N1: one `slowClick` of 90 on new seeds** (90103, setup 3517). AT: `npx tsx
  tools/diag/landingInvariants.ts 90103 3517 120 90103 30 2 8` ends with 0 broken.
  - Done (f2c768aa): the checker's, not the sim's. t118's click of 364 and 367: 364, aboard, clicked 2 cells off its
    beach at t162, sailed on in its landing (L3) and was ashore 6.2 days after t118; taken from its click by that
    re-click, it left 367 judged alone by 364's 6.6-day best (367's own way: its group back from Shanghai, 6.1 days,
    then 7.5 days' sail from the north). `SlowClicks` keeps a division in its click when, after the click's hour, it is
    still aboard the same landing and that landing's water is within SAME_LANDING_CELLS of the click's (R56a's "same
    water", by the sim's own same-landing distance); a landing redirected elsewhere is the new click's (the first, wider
    try kept those too and made 3 new breaks on 90121 and 90123). The case: 0 broken. `landingFuzz --seeds 15 --first
    90101` (the critic's): 0 of 90 (run 90: 1). A fresh block, 30 seeds from 618599: 3 of 180 (1.7 %), each broken the
    same on the checker before (618605 and 618625 Japan's 366/367, 618641 England's 270/277): ADR-914's tail, under its
    5 %, not filed. No ADR (ADR-914: R56a's rule mended).
- [x] R222 **R90-N2: the peace line's reasons never reach History** (89403: ten years of peace, two events). AT: History
  notes the peace's reason when first given and when it changes, on 89403 and one more seed, at the five supported sizes.
  - Done (124f1104): ADR-1149. `PeaceHeld`, told on the strategic AI's day when the peace line gives a reason not told
    since the last war: "The world is at peace: none outmatches another" (89403, once in two years), "…rivals too far
    over the sea" (55404, day 91); none before 89401's and 90441's first wars (`peaceWhy.test`). `peaceLine.spec` at the
    five supported sizes: the row in History, whole and in the view (looked at 393 × 852, 734 × 343); 12/12. Seed 99's
    pin as it was (1938 has more than three realms).
- Design objection (diplomacyWarDepth, at its bar): ADR-1145 reads the AI at ten years' restlessness against today's
  bonds; "until 22 May" would read better (a truce's days left, Hearts of Iron IV's way). Taken into R219 where a truce
  holds the rival off; the line's frame otherwise the user's to overturn.
- Kept as run 89: `heroPop`'s jumps (85905: 12), the opened legend over the news on a phone on its side, R172, R192,
  ADR-1111.

## Batch 59 — critic run 91's findings (focused, on 4f5c5427; no blocking issue, every score 8: the release check)

Non-blocking, fixed before the release with no critic run after them (ADR-1139).

- [ ] R223 **R91-N1: R221's `slowClick` change turns five named landing runs from 0 broken to 1** (27037/3517 two
  groups, 31103/15101 one and two, 31153/3517 two, 31165/3517 two; waits of 9–14 days against best ways of 2–7), and
  lets 31157/3517 one group pass on a kept division's landing while 366 waits 14.3 days. AT: each of the five traced (a
  slow voyage named and its cause fixed, or the checker's rule narrowed) so that `npx tsx
  tools/diag/landingInvariants.ts 31103 15101 120 31103 30,90 1` and the others end with 0 broken while `... 90103 3517
  120 90103 30 2 8` stays 0; and a kept division no longer lets a click pass while another of it waits past the bound
  (31157 3517 one group).
- [ ] R224 **R91-N2: random world 91415 (three nations) at peace fifteen years, its line "At peace for now" every day,
  no reason and no History row** (no war, no massing; the same on `fc767d88`). AT: 91415's cause traced (which of
  ADR-1145's "for now" causes holds), and either a war comes or the line names what it waits on (`npx tsx
  critic/scripts/c90_peaceTruth.ts 3 91415 1 15`).

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
