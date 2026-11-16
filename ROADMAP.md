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

## Batch 32 — the map's look (the user's request, 2026-11-15; ADR-1073)

The user, of a mock-up of the game: "this looks more polished than our current game", and of the march lines: "if they
could be thick arrows like in Hearts of Iron IV, that would be great - maybe they could become thicker the more troops
that are moving." Drawing only: no item changes a sim rule, and the pin of seed 99 stays. Nothing is copied from the
mock-up or from another game; every mark is drawn in code. Each item's AT has, beside its own: before and after shots at
world, theatre and tactical zoom in `docs/evidence/<item>/`, looked at; `npm run bench -- G` within the frame budgets of
goal 5, its figures logged; and the specs that read the pixels it changes (found by a search before the change) green,
changed only where the feature they test changed.

- [x] R89 **Thick movement arrows.** Seen on seed 99 in August 1939: a march's line is 1.5 px, dashed and yellow, one a
  formation, drawn only for a selected nation; with China selected the Fujian front is some 40 lines across one another,
  and with no nation selected a war shows no movement at all. 428 of 997 formations had a march in that hour.
  - [x] R89a The arrow: a filled, tapered body with a head, in a pale tint of the nation's colour with a dark rim,
    from the formation along the start of its way (`formWay`, its turns rounded); its width from the men it stands for,
    5 to 22 px (ADR-1074). Formations of one nation that start near each other and head the same way are one arrow of
    their men together; an arrow that would cross one of its nation stops before it. The dashed line along a whole way
    stays for the fleets and for a formation picked or selected. AT: a unit test of the grouping (pure: the same
    formations give the same arrows, every marching formation in one arrow) and of the width (more men never a
    narrower arrow); the Fujian shot with no arrow lying across another of its nation.
    Done: `src/render/units/moveArrows.ts`; `moveArrows.test.ts` (15), `orderLines1938.spec.ts` with the arrows,
    `player1938.spec.ts` green. Fujian, seed 99, August 1939, China selected: 131 crossings among 38 arrows drawn to
    their ends (the first try), 0 among 35 at 600 m/px and 0 among 25 at 1,500; 12 of 99 marches at 600 m/px have no
    arrow of their own drawn (cut to nothing beside a wider one). The draw 0.1 ms slower at most (p50 2.3 to 2.4 ms at
    600 m/px); `npm run bench -- G` PASS (T0 310.8 fps, T2 174.2). Shots: `docs/evidence/R89a/`.
  - [x] R89b Whose arrows (the user's decision, ADR-1073): every nation at war shows its advances, a march whose end
    is on land an enemy holds or within reach of an enemy formation, as bold arrows, selected or not, from the world's
    counters to the sprites; a march behind the lines is thin and faint, and drawn for the selected nation and
    formations only, as before (`orderShown`). AT: `orderLines1938.spec.ts` with the new rule; a page count on seed 99
    of the arrows drawn at world zoom with no selection, its bar set from the shot (a war read at a glance, not a web).
    Done: `advances` (reach 100 km, ADR-1075), faint arrows 0.6 of the width at half the opacity, a bold one never
    under 26 px. `moveArrows.test.ts` (19); `orderLines1938.spec.ts`'s second test: Germany on Poland at 6, 24, 48 and
    96 hours, at 4,000, 1,500, 600 and 100 m/px: no arrow in peace, none of a nation at peace, none faint with nothing
    looked at, none across another of its nation, at most 40 in view (bar 60). Seed 99, August 1939, nothing selected:
    26 arrows of 13 nations in the world's view at 20,000 m/px, 18 over the Fujian front at 4,000. The arrows 0.1 to
    0.15 ms of a draw; `npm run bench -- G` PASS (T0 294.9 fps, T2 161.0 fps, draw cpu 5.0 ms of 6, from 4.7).
    Shots: `docs/evidence/R89b/`.
  - [x] R89c Names and arrows: the names no longer under a filled arrow (`MapView`'s rule for the dashed lines says a
    line across a name leaves it to be read; a filled arrow does not). The voyages' and landings' lines stay dashed,
    in the arrows' rim and weight. AT: a spec that no country name or city name is covered by an arrow by more than a
    share the item sets; the voyage and landing specs green.
    Done (ADR-1077): the arrows are drawn on the names' canvas, under the nations' names and the cities' (they were on
    the overlay with the units, over every name); the voyages' lines and the order lines at T1 have the dark edge the
    landing's mark has. `orderLines1938.spec.ts`: Germany on Poland at 48 hours, at 4,000, 1,500 and 600 m/px: of
    3,628, 2,573 and 609 pixels a name or a dot fills whole, 0 changed by the arrows; of 89 points where a nation's
    name lies on an arrow, 3 not told from it (Germany's pale grey name on its pale grey arrows; bar a tenth). The 15
    specs of the names' canvas, the voyages and the landings' marks green (40 tests). `npm run bench -- G` PASS (T0
    297.3 fps, T2 159.4 fps, draw cpu 5.0 ms). Shots: `docs/evidence/R89c/` (the voyages' lines not shot).
- [x] R90 **Fronts that glow.** At world zoom a war is a hatched patch and a small burst. The border between two
  nations at war gets a glowing red line at world and theatre zoom, and land that changed hands in the last days
  flashes once. AT: a spec on the 1938 world with a war declared by God Mode: the line's pixels along the shared
  border and none along a border at peace; gone at the peace.
  - [x] R90a The line: where the land two nations at war hold meets, a hot red line with a red glow 7 px either side,
    in the map's own pass (the border it already finds), at every zoom (ADR-1078).
    Done: `mapShader.ts` with a war table (`warTable`, 512 nations a side), `MapRenderer.setWars`.
    `fronts1938.spec.ts`: Germany on Poland at 1, 6 and 48 hours, at 20,000, 8,000, 4,000, 1,500, 600 and 150 m/px:
    the line on every point of the German-Polish border in view (113 of 113 from 1,500 m/px out, 45 of 45 at 600, 10
    of 10 at 150), on 0 of the German-Czech border's (75 to 141 points); none in peace before, none after the peace.
    `warTable.test.ts` (3). The whole browser suite green on the change (457). `npm run bench -- G` PASS (the
    map's pass 0.520 ms of GPU a frame at T0, from 0.513; budget 1). Shots: `docs/evidence/R90a/`.
  - [x] R90b The flash: land that changed hands in the last days flashes once. AT: a spec that takes a cell by God
    Mode's paint and reads its pixels brighter than its fill for the flash's time and its fill after; nothing flashes
    at a load or at the start.
    Done (ADR-1079): each cell a snapshot brings under a new holder is a soft white patch for 900 ms of the player's
    time, on the names' canvas under the names (`src/render/fx/flashes.ts`). `flashes.test.ts` (4);
    `flash1938.spec.ts`: a paint of radius 1 and of 3 at 8,000, 1,500 and 600 m/px: 5 and 29 cells flash, white at
    30 ms and less half way, none after 960 ms; none at the start, none where the holder is the same, none at a
    load. The first look (0.6 opaque, 1.15 cells) made a province taken a white blot: 0.32 and 0.85. The whole
    browser suite green on the change (458). `npm run bench -- G` PASS (T0 290.7 fps, T2 162.0). Shot:
    `docs/evidence/R90b/flash-1500.png`.
- [x] R91 **The map's ground.** The sea is one flat colour and each nation one flat fill. The sea darker with depth
  and lighter over the shelf along the coasts; inside each nation's border a soft darker edge; faint relief under the
  political colours. AT: the political map's colours still tell every pair of neighbours apart (the check the nation
  colours have now); the shots; the frame time of the world zoom unchanged within the bench's noise.
  Done (ADR-1080): the shades of T0 and T1 in the map's pass, the sea's depth and the land's light from one texture
  made once from the elevation (`farShade`), the fill 0.84 of its colour on a border and whole a cell and a half
  inland. `farShade.test.ts` (6): the 206 pairs of neighbours of 1938 at the darkest and the lightest shade, the
  least ΔE 12.9 (France and French West Africa at 0.74; bar 12, unshaded 15); the first strengths (edge 0.8, relief
  0.14) gave 11.5 and were eased, not the bar. `seaDepth1938.spec.ts` follows the feature (the sea of T1 was one
  colour: now the Dogger Bank 34,62,102 and the South Pacific 24,43,71 at T1 and at 8,000 m/px); five specs that
  tell water or a fill by its one colour measure with `view.farShades` off. The whole browser suite on the final
  code: 457 of 458, `historyMine1938` red once and green alone six times of six. Not within the bench's noise: the map's pass 0.556 ms of GPU a frame at T0, from 0.520 (budget 1), and
  1.154 at T2, from 1.078 (budget 2); `npm run bench -- G` PASS (T0 290.5 fps, T2 162.3). The edge is under 2 px at
  the world's zoom and is seen from about 4,000 m/px in. Shots: `docs/evidence/R91/`.
- [x] R92 **Country names.** Dark, heavily rimmed and steeply turned ("POLAND" runs nearly upright). White capitals
  with a soft shadow, a gentler turn and curve, a small nation's name no larger than its land lets it be; told from
  a pale arrow under it (R89c: Germany's pale name is not, on its own arrows; a white name needs its shadow there). AT: the
  label tests with the new bounds on a name's angle and size; every name's contrast against its nation's colour at
  the bar the labels have now.
  - [x] R92a The ink: white letters with an edge of a deep shade of the land's colour (the soft shadow); over a
    light land (luminance over 0.45: Japan, Austria, Finland) the letters that shade and the edge white (ADR-1081).
    Done: `nameInk`. `nationLabelLayout.test.ts` (19): every name of 1938 told from its land by a contrast of 2 at
    least (the least 2.08, Tibet; 1.99 before, Portugal), 84 of 103 names white. On the way: `labelFades1938` red, a
    pop of 59 of 255 (bar 48) in one frame: a sliver of a letter beside a name, what a full glyph atlas left standing
    when it started again. The atlas is wiped at a restart and each glyph drawn a px clear of its box's sides; the
    largest jump 40. The whole browser suite on the change. Shots: `docs/evidence/R92a/`.
  - [x] R92b The turn and the size: a name's baseline no steeper than a bound the item sets ("POLAND" runs nearly
    upright), its curve gentler, a small nation's name no larger than its land lets it be. AT: the label tests with
    the new bounds on a name's angle and size, on the 1938 map and two random worlds.
    Done (ADR-1082): a baseline at most 30 degrees from level; a land whose long axis is steeper has its name
    across it at 30 degrees, as long as the land is there, unless that is under 0.4 of the name along its axis (the
    narrow lands keep theirs: Sweden, Chile); a bow of at most 0.15 of the length. `nationLabels.test.ts` (8): slabs
    at 13 angles, a strip, a boomerang. The whole browser suite: 457 of 458, `maxGlide1938` green alone. Not done as the AT said: the bounds
    are tested on made shapes at every angle, not on two random worlds. Shots: `docs/evidence/R92b/`.
- [x] R93 **Counters.** A small ball and a small number. A dark rounded plate with the flag chip and a larger number,
  a stack's count as a tab. The countryballs stay in the countryball look (the user: "we need to keep countryballs
  on countryball mode - they can be bigger though if you think that will look nicer"): the plate is the classic
  look's and the ball's label; the ball itself may grow. AT: both looks shot at T1; the marker tests' bound on a
  pixel's change in a frame (ADR-71, ADR-72) kept; the number readable at the far end of T1 (its height in px, the
  bar set in the item).
  Done (ADR-1083): found on HEAD first: the counter of T0 was a dark plate with its flag chip, its number and
  "+n" already; it was small (14 px, a number of 10). Drawn `COUNTER_SCALE` (1.25) times that, 17.5 px with a
  number of 12.5, with round corners; in the countryball look its chip is the countryball still, larger with it.
  `counters1938.spec.ts`'s second test: the plate's height at each of the five unit sizes in both looks. The whole
  browser suite on the change: 456 of 458, `coast1938` and `shipMarks1938` green alone four times of four each.
  Not done: the markers of T1 (the boxes with a unit's symbol and its number under it) are as they were; the
  item's "number readable at the far end of T1" is not measured. Filed as R95. `npm run bench -- G` PASS, T0
  slower in its one run (268.8 fps, 290 to 302 before; budget 60). Shots: `docs/evidence/R93/`.
- [x] R94 **Chrome.** The ranking, the news, the war banners and the bottom bar are all open at once. The gunmetal
  plates stay (the user's decision, ADR-762 kept, ADR-1073). A slimmer top bar with the date and the speed in its
  middle; the ranking closed until asked for; the news one line that opens. AT: the share of a 1600 × 900 view the
  panels cover at the start, measured before, and its bar set from that; the phone layout's specs green.
  Measured first, at 1600 × 900 on seed 99: the panels cover 13.3 % of the view at the start and 17.6 % in August
  1939: the ranking 7.9, the bar 2.9, the news 2.9, the war banners 2.5, the legend 0.9, the title 0.5.
  - [x] R94a The ranking closed on a desk until the bar's Statistics opens it, and kept as the player left it; on
    a phone folded to its title as it was (ADR-760 stands). AT: at most 6 % of a 1600 × 900 view under the panels
    at the start.
    Done (ADR-1084): 5.37 % at the start (13.29), 9.70 % in August 1939 (17.62). `chromeCover1938.spec.ts` (three
    sizes of view: 5.37 % of 1600 × 900, 3.73 % of 1920 × 1080, 7.55 % of 1280 × 800; the ranking, opened, 7.9 to
    11.1 % of them). `phoneLayout1938` holds the desk's rule (closed, opened by the button, kept over a reload) and
    the phone's (as before); five specs of the ranking open it by the stored choice. Shots: `docs/evidence/R94a/`.
  - [x] R94b The news one line that opens: the newest event, the rest on a click. The rules the rows have from the
    critic's runs (R42b, R43c, R49-N3, R59c: the player's orders' news, the sea battles' rows, a phone's two rows)
    hold in the opened list and are listed in the item's ADR, each with its test green before and after. AT: the
    news at most 1 % of a 1600 × 900 view until opened (2.9 % in August 1939 on seed 99).
    Done (ADR-1085): on a desk the latest event and the first sea battle until the row above them ("N more") opens
    the rest; the choice kept. Not folded: the player's orders' news (R42b, R49-N3). As they were: a phone's two
    rows (ADR-760, R43c), and the rows beside a panel, which has no such row (PLAN 3.12Rh; its room is the rows').
    August 1939, seed 99, 1600 × 900: the news 0.85 % of the view (2.87), the panels 7.68 % (9.70); measured by
    the item's script, not held by a spec. `ticker1938.spec.ts`'s new test (none, one, two, three and five events;
    opened, folded, kept over a reload; none on a phone). The whole browser suite on the first try: 9 red, each a
    test of the earlier rows: they open the news by the stored choice; then those nine specs, `chromeCover1938`
    and `phoneLayout1938` by hand (green). Shots: `docs/evidence/R94b/`.
  - [x] R94c The date and the speed in a slim bar at the top's middle. It changes the bar's order, the user's of
    2026-10-29 (ADR-763); the phone's bar (PLAN 7.169) is not to lose a button from reach. AT: `barNarrow1938` and
    `phoneLayout1938` green; the bars together no more of the view than the bar is now (2.9 % of 1600 × 900).
    Done (ADR-1086): on a desk Pause, the speed and the date (with the track's next event) are the clock, a
    gunmetal plate at the top's middle; the bar keeps God Mode, the map, Statistics, History, Relations, the Editor
    and Settings in the user's order. On a phone all of them are in the bar as they were. The bars together 2.88 %
    of a 1600 × 900 view (the one bar 2.93). `chromeCover1938.spec.ts`: at four sizes of view the clock at the
    middle, one row, clear of the title and above the alert's place, its width kept as its words change, and it
    runs, pauses and speeds the game; on a phone none. The whole browser suite on the first try: 462 of 463,
    `trackView1938h` looked for the track's line in a `footer` (it reads the plate the line is in now).
    `barNarrow1938` and `phoneLayout1938` green. The heroes' counters keep clear of the clock as of the other
    plates. Shots: `docs/evidence/R94c/`.
- [x] R95 **The markers of T1.** Left out of R93: the box with a unit's symbol has its men in type of 9 px under
  it, and a stack's count in a tag of the same. The number larger, on a plate as the counters'. AT: the number's
  height in px at the far end of T1 (2,000 m/px), its bar set from a shot; the markers' bound on a pixel's change
  in a frame kept (ADR-71, ADR-72); `markerStacks`' rules with the new sizes.
  First try (2026-11-16, not kept; BLOCKERS.md): the markers drawn 1.25 times their footprint, as the counters
  were in R93. The number read well (the Fujian front at 600 m/px), and nine browser tests went red, each a rule
  that stands on the marker's size:
  - the T1 to T2 change: a pixel's largest change in a frame 58.7 of 255, bar 48 (`fades1938`; `MARKER_SHRINK`
    0.13 was set for a box of 26 by 17, ADR-71, ADR-72);
  - markers of two nations on each other: 7 pairs more than a quarter on each other (`markerStacks1938`;
    `NUDGE_MAX_PX` 10 is of the old box), and the markers back from T2 not where they rest;
  - the frame of a selected or picked formation (`player1938`, `orderLines1938`), the clicks on a marker
    (`enemyClickPanel1938`, `formationPanel1938`), the countryballs' counts and their flags under a helmet
    (`countryballs1938`).
  So the item is these rules given the new size, not a factor at the call: `MARKER_SHRINK`, `NUDGE_MAX_PX`,
  `STACK_UNDER`, the frames' and the clicks' boxes, each with its test; or the number alone larger on a plate wider
  than the box. More markers fold into stacks at a front with a larger box: the user's to weigh.
  Done (ADR-1087, the user's decisions of 2026-11-16: "What if we get rid of the pips?", then the trial asked for,
  then "Let's use Lato"): no pips; under the box a plate of 34 px with a strength bar and the men in Lato's Bold of
  11 px (9 px of the system's face before); the box as it was, the marker 34 by 34 px (26 by 41). The counters'
  numbers in Lato too. Of the first try's nine red tests eight were green at once (the T1 to T2 change's jump and
  the two nations' markers among them: the box did not grow). `countryballs1938`'s wings: a plate hid one wing tip
  more than the count allows (49 of 62, bar 50); planes under a plate are not judged (36 of 36 then).
  `heroStack1938`: the test clicked where the hero's marker had been before the camera followed the fleet just
  opened; it reads the place again. Gone with the pips: `pips.ts`, `pips.test.ts`, `markers1938`'s pip checks and
  its count of pips at 900 m/px (critic run 9's case); Spain's two weeks of war are read on the strength bars.
  Not measured as the AT said: the number's height in px at 2,000 m/px against a bar from a shot; it is type of 11
  px at every zoom of T1. Shots: `docs/evidence/R95/`.

- [x] R96 **Arrows only over a front** (the user's request, 2026-11-16: "for non selected countries, can we only
  show arrows if a country is invading another country or pushing through a front (more like Hearts of Iron IV)?").
  Until R96 a march that ended within 100 km of an enemy's formation was an advance too (R89b): a front had an
  arrow for each division coming up behind it. AT: no bold arrow for a march whose way does not reach land an enemy
  holds; the war spec's sweep green.
  Done (ADR-1088): an advance is a march of a nation at war whose way, within its next 100 km, is on land an enemy
  holds; a retreat is none. `moveArrows.test.ts` (21). `orderLines1938.spec.ts`: Germany on Poland, 6 to 96 hours
  at four zooms: at most 18 bold arrows in view (40 before). It found one thing: with a nation looked at, one of
  its faint arrows cut a bold one short (10 bold arrows where 11 were); the bold are drawn first now. Seed 99,
  August 1939: the Fujian front's arrows are those into and out of the pocket (shots). The marches of a nation
  looked at are as they were, faint. Shots: `docs/evidence/R96/`.

## Batch 33 — a war's opening (the user's request, 2026-11-16)

The user, of Germany's war on Poland in R96's shot, where the only arrows over the front were Poland's: "Can you
look into the Germany-Poland war?", then "Yes add a roadmap item and let's do it".

- [x] R97 **The attacker is not at its own front.**
  - [x] R97a Measured (`tools/diag/warOpening.ts`). The forced war (seed 1938, Germany on Poland by God Mode on
    the first day): after 30 days Poland holds 327 cells of Germany and Germany 107 of Poland; Germany's men 564k
    to 440k, Poland's 419k to 246k; France and its colonies join at once and 60 % of Germany's men stand west of
    Berlin; East Prussia has 3 formations and loses 157 of its 208 cells. Poland plans 18 hours before Germany: the
    planners' stagger by a nation's number (`STAGGER`), not the side. Then the AI's own wars, six seeds (99, 7,
    1938, 4483, 2081, 6047) by three years: 287 wars between leaders with a land border, 221 that ran a month.
    Of the two leaders' land after 30 days: the attacker ahead in 113 (51 %), the defender in 52 (24 %), none
    taken in 56 (25 %); in 30 the attacker ordered nothing over the front in the month (Brazil on Colombia in three
    seeds, four nations on Bolivia, China on Tibet). The cause, read at the declaration: in 118 of the 221 the
    attacker has no man within 300 km of the border. By the attacker's share of the two leaders' men near it:
    none of them, the attacker ahead in 31 % of 41 wars and the defender in 46 %; nine tenths or more of them,
    90 % of 53 and 1 %. (In 77 more neither leader has a man there.) The planner allots formations to a front
    only once there is an enemy on it, and the far ones come one a sector in eight days (`MARCH_DAYS`).
  - [x] R97b **Mass, then declare** (ADR-1089, the user's choice; `src/sim/ai/massing.ts`). A nation in no war that
    has chosen a war on a neighbour of its home first brings its army to that border (seven tenths of its formations
    on that land, the nearest first) and declares when half its men there stand within 300 km of it, if it would
    still declare by the rules of the choice; it gives up after 90 days, the target then barred to it for a year, or
    when a war finds it first. A nation at war declares a second on a neighbour of its home only with 15 % of its men
    at that border. A neighbour by a colony only, or across the sea, as before. Measured (`warOpening.ts`, three
    years; six seeds seen and six unseen, 31001-31006, before and after): of the wars between leaders with a
    border that ran a month, the attacker with no man within 300 km of the border 53 % -> 6 % (bar: a tenth); the
    defender ahead in land at day 30 25 % -> 10 % (bar: 15 %), on the unseen six 27 % -> 13 %; the attacker ahead
    51 % -> 84 %; no land taken 24 % -> 6 %; the attacker ordering nothing over the front in the month 61 wars -> 1.
    **The bar of the wars' number, re-scoped (the user's decision, 2026-11-16):** the wars with a border begun fell
    to 71 % (542 -> 385 on the twelve), under the four fifths asked; those lost are the wars in which the defender
    was ahead or no land was taken, and the wars in which the attacker is ahead after a month are as many (218 ->
    219): the bar is that number, no fewer. The checkers of war and peace (ADR-803) on the twelve seeds, a year
    each: none broken. Shots: `docs/evidence/R97/` (seed 99, the Soviet Union on Romania: begun on day 40, 790,000 men
    at the border on day 70, the war on day 71). The pin of seed 99 moved with the rule (the pin's own rule: in the
    commit of the change), not apart as this item first said.

## Batch 34 — a war declared on a nation, or by hand (the user's request, 2026-11-16)

The user, told that R97b's rule is of the wars the AI chooses and not of Germany's on Poland by God Mode: "They don't
already go to the front in a god mode declared war?", then, of measuring the arrivals first and of the rush: "Yes,
though Rush makes sense either way".

- [x] R98 **An army comes to a front just made.**
  - [x] R98a Measured (`tools/diag/frontArrivals.ts 1938 GER,POL 30 FRA`). They do go, and at once: of Germany's
    564,000 men 45 % stand far from every front as the war begins, 12 % a day later (34 % on the march), and its
    marches are in by day 7. The trickle is the 12 %: 7 formations stand still far from the fronts until day 25
    (the planner sends a far formation only to a sector that has nobody, one a sector). The greater part is the
    numbers: France and its colonies join on the first day, and Germany's 564,000 face Poland's 419,000 and
    France's 528,000. About half its army stands at each front through the month (40-57 % at Poland's, by a zone
    of 300 km that the two fronts share in the middle of Germany), while Poland has 80 % of its own at Germany's on
    the first day and 97 % by day 21. Germany wins the west (120 cells of France's on day 30, France's men
    528,000 -> 263,000) and loses the east (Poland 328 of its cells, it 107 of Poland's).
  - [x] R98b **Rush**, tried and not kept (2026-11-16). Built as: a formation far from every front (beyond
    `DEPLOY_RANGE_CELLS`, 60 cells, 1,200 km) that no sector with nobody took goes to the nearest sector of its
    nation's front that has a threat. Found:
    - In R98a's war it gives no order: the month's figures are the same to the man. Germany's 7 formations that stand
      still are not far ones: they are the reserve (`RESERVE`, 0.15: of the formations within the range of a sector
      the farthest 15 % stay put), 7 of 50. R98a called them a trickle; they are a rule.
    - Elsewhere it gives 60 orders in two years of seed 99 (32 more refused) and 137 of seed 7. On R97b's six seen
      seeds by three years, with it and without: the attacker ahead in land at day 30 in 80 % of the wars where 86 %,
      the defender in 11 % where 7 %, the attacker with no man within 300 km in 10 % where 5 %. No better; by this
      item's own bar (no worse) it fails. Reverted; nothing of it is in the game.
    - What would change R98a's war is the user's to choose (none built): the reserve let go where its front loses
      ground; how an army is shared between two fronts (Germany wins the west with half its army and loses the east
      with the other); whether a guarantor joins a war on the day it is declared.
  - [x] R98c **The invaded front has the more of the army** (ADR-1090; the user's choice of R98b's three: "Let's do
    2"). In the allotment a threatened sector at whose front cell the enemy stands on the planner's own land weighs
    `INVADED_WEIGHT` (4) times its threat; not while the historical track steers. R98a's war, day 30, on four seeds
    (1938, 99, 7, 4483), before -> with it: Germany's cells held by Poland 328, 210, 218, 215 -> 95, 65, 84, 110;
    by France 31, 68, 66, 30 -> 1 on each; France's held by Germany 120, 61, 50, 112 -> 255, 141, 142, 228;
    Poland's held by Germany 107, 109, 161, 124 -> 61, 83, 59, 14 (it defends its east where it attacked);
    Germany's men left 439, 406, 429, 452 thousand -> 463, 459, 456, 460. A weight of 2 gives about half of it
    (Poland 172, 123, 125, 184). The AI's own wars, R97b's six seen seeds by three years, weights 1, 2, 4: the
    attacker ahead in land at day 30 in 86, 82, 81 % and the defender in 7, 7, 13 % (the six unseen at weight 1: 83
    and 13 %): within what two sets of seeds differ by. The operational AI 0.35 ms a tick on seed 99's first year
    (0.53 in R97b's profile, under other runs' load): no slower. Test: `tests/unit/invadedFront1938.test.ts`.

## Batch 35 — the fronts seen (the user's request, 2026-11-16)

- [x] R99 **A front is brighter and plainer** (ADR-1091; the user: "Can we make the fronts brighter and more
  obvious?"). R90a's front was a line of light red 2.2 px wide with a red glow: on a red or pink fill (Poland's,
  the Soviet Union's) it was little more than the border. Now, from the outside in: a red glow over 12 px, a dark
  casing to 4.4 px, a band of orange red to 3.2 px, a core near white to 1.5 px (each a half width). At every zoom
  as before. `fronts1938.spec.ts` reads the core's colour from `FRONT_CORE_RGB`; its bars as they were (the front on
  113 of 113 points of the German-Polish border, 0 of the German-Czech). Shots: `docs/evidence/R99/` (20,000,
  4,000, 600 and 150 m/px).

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
