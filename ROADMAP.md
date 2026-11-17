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

## Batch 36 — before the next critic (the user: "Let's do them all", 2026-11-16)

- [x] R100 **No tag or enemy's pointer under the top clock or the war banners** (BLOCKERS, 2026-11-16). Two causes:
  the clock was not among the boxes the tags and pointers keep clear of (`tagObstacles`); the banners' row took the
  pointer over its whole box, the gaps and the room beside a short last row too. The clock is among them; the row
  takes no pointer, its banners do. `tests/e2e/tagsOnMap1938.spec.ts`: `battleTags1938`'s scene on seeds 39915, 1
  and 11, at 250, 120 and 10 m/px (77 tags and 3 pointers a seed): 11, 16 and 11 points under a box before, none now.
- [x] R101 **The tags of a crowded front** (ADR-1092; R98c's finding). `tagsCrowd1938`'s scene on twelve seeds (1, 2,
  3, 5, 7, 11, 13, 1938 to 1941, 4242; fifteen views at 60 and at 12 m/px) after R100: 76 tags of 3,347 over 120 px
  from their blocks and 31 left out; at 60 m/px seeds 7, 13, 1938 and 1940 over the 3.5 % (7.6, 4.3, 4.7, 3.6). The far
  ones are whole tags of formations in contact, 138 to 412 px off: the places straight above, below and beside a
  block are its neighbours'. Now a tag has a place at each corner of its block too (`TAG_CORNER_RINGS` 1), after the
  first ring's four: 42 far of 3,357 and 21 left out; every seed within the bar (the most 3.1 %, seed 7). The engaged
  keep the whole tag (ADR-1037 stands). `tagsCrowd1938` on seed 1938 again, its own. The bench's T2 (384 divisions in
  view): the draw's CPU 4.6 -> 5.0 ms (its line 6), 164 fps where 178.
  - Tried, not kept: the places sorted by their measured distance, with two more columns and rows of them (18 far, 6
    left out): a block that moved a part of a px changed its tag's place (`godUndoPicture1938` red on it), and the
    bench's draw 13.4 ms. Two rings of corners in a fixed order (28 far, 15 left out): the bench's draw 6.8 ms, over
    its line.
- [x] R102 **Seed 5309: Germany does not take Prague** in the war forced on Czechoslovakia (PROGRESS, R97b). Read
  with `tools/diag/pragueFall.ts` (that war, 120 days): no fault of the army's place. On HEAD Prague falls on day 17
  (and is taken back by day 20); with ADR-1090's weight at 1, on day 34; with no massing, day 15; with neither, day
  61. In all four Germany is at war from the first day with Czechoslovakia, Romania, Yugoslavia, France and the Soviet
  Union (the guarantors), 62 % of its men within 300 km of the Czech border on day 1 and 73 to 100 % after, and
  Czechoslovakia holds 100 to 300 cells of Germany's for most of it: a war Germany is losing on five fronts, in which
  the day a city falls is the seed's and the rules' luck. `nukeMeansLost1938` is on seed 5309 again (the means lost
  on day 15). No rule changed.
- [x] R103 **A nation massed on answers** (ADR-1093; ADR-1089's "not built"). The target of a massing, once
  `MASS_SEEN` (a quarter) of the massing nation's men stand at the border, brings its own army to its side of it as
  the other does (`MASS_SHARE` of its formations, the nearest first), each day while it is so: if it is in no war,
  prepares none itself and its army is its AI's. Of two massing on it, the one with the more men at its border. No
  state. Alone (seed 1, the AI off): the Soviet Union on Romania, seen on day 9 of 31, Romania at the border 8 % ->
  69 %; Italy on Yugoslavia 0 -> 76 %; the Soviet Union on Finland 0 -> 78 %; on Turkey seen on day 44 of 57 and
  Turkey's army not arrived. Measured, R97b's twelve seeds by three years, without it and with it: the wars with a
  border 413 and 408; of those that ran a month the attacker ahead in land at day 30 in 231 and 231 (80 and 79 %; the
  bar no fewer than 219), the defender in 41 and 40 (14 %; the bar 15 %), no land taken in 15 and 20. The opening is
  not changed by it that the measure shows.
  - **Little of it in the AI's own wars** (`docs/evidence/R103/opening.md`): of the wars prepared, the defender's men
    within 300 km of the front as the war begins are a median 5 % of its army without the answer and 10 % with it
    (the mean 38 and 41 %), and it has no man there in 128 of 269 and 126 of 278. The answer moves an army where
    the rule is driven alone; in a world at play the target is at war itself, or is seen late, or is far. Why, by
    its shares, is not measured.
  - **Over R97b's bar on both, and not by this item:** the attacker with no man within 300 km of the border 30 of
    287 (10.5 %) without it and 32 of 291 (11.0 %) with it, where R97b's build has 14 of 216 (6.5 %) on the same
    twelve seeds and the bar is a tenth. The rise is in the wars declared at once (by a nation at war already, or
    on a neighbour by a colony): 93 of them with a border on R97b's build, 138 now, and of those that ran a month
    the attacker with no man near in 13 of 43 then and 28 of 80 now; of the wars prepared, 1 of 173 then and 2 of
    207 now. Between the two builds is R98c (ADR-1090), which was measured for it on six seeds only (12 % at its
    weight of 4 where 9 %) and not read against this bar. **The user (2026-11-16): the bar is 15 %** ("we can move
    the bar to 15%"): 10.5 and 11.0 % are within it.
  - Not built: the target asking an alliance or a guarantee, a war of its own first, the massing nation thinking
    again when it sees the answer.
  - Tests: `tests/unit/massAnswer1938.test.ts` (5). The pin of seed 99 1fe6205e -> bf16e257.

## Batch 37 — a front read (the user's requests, 2026-11-16: "Let's do both", "Accept your recommendations")

Found as the user played France against the two Spains: the Char 2C, ordered over the border, stood at it "on the
march" for days. No formation walks onto an enemy's ground: a cell is taken by the pressure of men (SPEC §5.2), and a
hero is one tank.

- [x] R104 **A hero takes ground, and a formation that waits says so** (ADR-1095, the user's decisions).
  - (a) A land hero presses on the front as `HERO_PRESSURE_MEN` (10,000) men by its health, where its own (the Char
    2C: one tank). France the player's with its army's AI off, at war with Nationalist Spain, the Char 2C ordered
    three cells into Spain (seed 7): before, it waits before the border all of ten days and France holds no cell;
    now it waits 21 hours of them and France holds 31 cells of Spain's.
  - (b) A march of the player's, of any formation, that has waited before an enemy's cell for `WAIT_TOLD_HOURS` (24)
    is told of once an order: "it waits at the front. The ground ahead is the enemy's, and it goes on when that
    ground is taken: sooner with more troops beside it" (the ticker: "waits for the ground ahead to be taken"). Its
    panel's notice goes when its state does, as a refusal's.
  - Test: `tests/unit/heroFront1938.test.ts`. The pin of seed 99 stands (no hero in that world).
  - Of the user's picture: "Char 2C: not done, only sea there" is the refusal of a click on sea with none of its
    land within three cells; the cells of that front are land. Not reproduced; left.
- [x] R105 **Ground being taken is seen** (ADR-1096). A cell whose holder is being out-pressed (its `flip` counter
  rising to the hold) has a hot glow and, in it, the colour of the nation that takes it, both the stronger the
  nearer the cell is to changing hands; a stretch with none is held. The snapshot's `taking` (`takingCells`: the
  cell and its progress, 1 to 255); drawn with the flashes, under the names (`src/render/fx/taking.ts`). Germany
  against Poland, five days: 2,578 cell-hours told, 87 cells fell, each told the hour before with its hold all but
  done. Tests: `tests/unit/takingCells1938.test.ts`, `tests/e2e/taking1938.spec.ts`. Shots: `docs/evidence/R105/`
  (the fifth day, at 4,000, 1,500 and 600 m/px).
  - Not done: the glow moving in time (a pulse); a mark on a stretch that is pressed and holds (nothing is drawn
    there, as on one nobody presses).
- [x] R106 **Movement arrows by side** (ADR-1097). The arrows were their nations' colours half-way to white: two
  nations' side by side two pale greys. Now three tenths of the way (`ARROW_PALE` 0.3), and with a nation played or
  looked at another nation's arrow is drawn `OTHER_WIDE` (0.7) of its width, along the same stretch (where it is
  cut and whether it is drawn are by its whole width: R96's "looking at a nation hides no advance" holds,
  `orderLines1938`). The dotted line was the picked and the selected formations' alone already (R89a): unchanged.
  Tests: `tests/unit/moveArrows.test.ts`. Shots: `docs/evidence/R106/`.
  - Seen in the shot: a faint arrow (a march behind the lines) of a nation on its own land is harder to see than
    it was (pink on pink at half opacity); the bold ones read by their dark rim.
- [x] R107 **Occupied land read at the close zooms** (ADR-1098). On the ground of T2 and T3 occupied land was one
  even cast of the occupier's colour (`OCCUPIED_CAST` 0.3), a haze. Now broad diagonal bands of it (34 px a band and
  its gap, the fill 0.5 of the ground's colour on a band and 0.18 between: about as much of the colour in all), and
  a dashed dark line where the occupier's own land ends and what it occupies begins. The legend there: "Banded in
  the occupier's colour: occupied land". The far zooms' hatching as it was. `occupiedGround1938`, `occupation1938`
  and `legendOccupied1938` green unchanged. Shots: `docs/evidence/R107/` (Japan on China's land at 150 and 20 m/px;
  France on Germany's at 300 and 150, with the old border, the front, the glow of R105 and the arrows of R106).
  - No test of its own measures the bands or the line: the shots are its evidence.
- [x] R108 **Fewer counters at the world's zoom** (ADR-1099, the user's choice: "Counters: 1"). The counters of a
  nation at war with no one fade out between `QUIET_FROM_M` (8,000) and `QUIET_GONE_M` (12,000) metres a pixel; the
  nation played or looked at keeps its own. Over Europe at 20,000 m/px at the start of 1938: 81 counters -> 10, those
  of the 7 nations at war. Test: `tests/e2e/quietCounters1938.spec.ts`. Shots: `docs/evidence/R108/`.
  - Beyond 8,000 m/px they are a layer of their own under the others (`quietCounters`), so a counter's number and
    "+n" are of what is seen. At that zoom the counters folded across the two kinds come apart at once, at full
    opacity: the one place a counter appears without a fade (the layer's rule of PLAN 1.45b, here not kept).
  - Six specs of the counters' machinery (`counters1938`, `countersRest1938`, `declutter1938`, `heroes1938`,
    `lateFrame1938`, `seamItems1938`) keep every nation's counters by the view's switch (`quietCountersKept`): what
    they measure is the fold, the rest and the sum, on the dense picture.
- [x] R109 **Names and tags at the middle zooms** (ADR-1100, the user's choice: "Names: 1", the tags thin out).
  `CLUSTER_PX` 128 where 64: the counters' grid a level coarser at every zoom. Germany's war on Poland, day 5, at
  4,000 m/px over central Europe: 91 counters -> 72, and FRANCE, ITALY, UNITED KINGDOM and POLAND are read where
  counters stood on their letters. Shots: `docs/evidence/R109/`. `tests/unit/counters.test.ts` and
  `countersRest1938` take their zooms from the constant.
  - Not touched: the markers of T1 (2,000 m/px and nearer), which stand on a name as they did.
After the next critic (the user's choice of the order): the ground of the close zooms (relief, rivers, roads); a
war seen from the world's zoom (a mark where the fighting is heaviest).

## Batch 38 — the review of the game's pictures (the user, 2026-11-16: "use your best judgment and try to implement
1, 3, 4, 5, 6, 7, 9, 10, 11, 12, and editor styling. I automatically accept your recommendations in advance")

A sub-agent's review of 42 pictures (PROGRESS, 2026-11-16); its numbers in brackets. What needs the user is left and
said. The critic when the batch is done.

- [x] R110 **The bottom of the screen** [1] (ADR-1101). The war banners in one row on a desk (`DESK_BANNERS` 3, the
  newest wars first), the rest behind a "+n" that opens them (to `MAX_BANNERS`, two rows, as it was); a phone as it
  was. A city's or a nation's name keeps clear of the banners. Not of the bars and the ticker's rows: a name under a
  bar is not seen either way, and one that gave way to each row of the ticker would blink (`godUndoPicture1938` red
  on both tries). `warBannerRows1938`, `phoneLayout1938`, `settings1938` and `toBattle1938` follow the one row.
  - Not done: the ticker's rows moved to a column of their own; the tags kept from under the bottom bar (they were
    already: `tagObstacles`).
- [x] R111 **The counters' signs said** [3]. A "?" in the legend's title shows a line: "Flag and number: the men
  there. Blue: a fleet. +n, ×n: more beneath it" (at the close zooms: the tag's parts, its bar, the red edge and the
  line of contact). Behind the "?" because shown always it took the panels past `chromeCover1938`'s 6 % of the map.
  A nation's panel: "581,184 · 95 formations" where "581,184 (95)".
- [x] R112 **A counter's edge in its nation's colour** [4] (`COUNTER_STRIPE`, 3 px left of the flag). Not done: the
  Relations graph's and the ranking's flags.
- [x] R113 **A first cue** [5] (ADR-1102; `src/ui/FirstCue.tsx`): three lines under the clock for the first game
  started from the title screen, closed by its button or the first Resume, not shown again; only its button takes
  the pointer. Not for a game opened by its link.
- [x] R114 **A battle read at the close zooms** [6]. A tag has a bar of its men of its full strength along its foot
  (green, yellow under a half, red under a quarter, as the T1 marker's; a hero's its health), and the legend's "?"
  says what the red edge and the line between two units are.
  - Not done: a light rim on dark sprites (their tint on light ground is ADR-888's, measured).
- [x] R115 **A war banner says what it is** [7]: its title in words ("Germany and 1 more (attacking) against Poland
  and 4 more", whose way the score goes and what the bar is), the score in figures at its end, the bar's middle
  marked. Not changed: a war with no battle now is grey (PLAN 7.4f35, on purpose: its click has nowhere to go).
- [x] R116 **The settings panel whole** [9]: two headed parts ("Display and sound", "New game", a rule between),
  its foot clear of its last row, a thin bar that says it scrolls. Not tabs: twelve specs open the panel and use the
  new game's form at once, and a player would have one click more to it.
- [x] R119 **The phone's top bar** [12]: the date and "Paused" in it. Not done: the bottom bar's buttons behind a
  menu.
- [x] R120 **The editor's file inputs** in the game's look: the browser's button styled as the panels' (the editor's
  and the title screen's); the input is the browser's still, its "No file chosen" in the panel's type.
- Tests: `tests/e2e/reviewBatch1938.spec.ts` (3). Shots: `docs/evidence/R110/`.

Left of the review, for the user (not built):
- **Coasts as smooth as borders** [10]. Tried in the map's pass, twice: a Catmull-Rom curve through the coverage's
  texels, and the shore softened over its first pixel. Neither changed the picture to the eye: the steps are the
  land mask's own texels (2.4 km: 3 px at 800 m/px), and the coverage is a mask, 0 or 1. It wants a smoothed
  coverage made with the data, and the sim's shore kept with it. Reverted.
- **The name of a nation of an odd shape** [11] (a year on: "GERMANY" over a rump, "BULGARIA" bent). The names'
  fitting is a system of its own with its specs; a change of how a name is fitted needs its own item.

## Batch 39 — critic run 73's findings (focused, on a9814c43; no blocking issue; UI/UX 8 -> 7, at its bar)

Each with the critic's own "seen fixed when" (`critic/CRITIC_REPORT.md`).

- [x] R121 **R73-N1: the wars a played nation leads are on the banners** (ADR-1105). The row's order: the played
  nation's wars first, then the largest by the men of their two sides, then the newest (R110 had the newest first:
  0 of a played Germany's three wars on the row or among the six opened). With no nation played, the largest (the
  critic's objection: in June 1944 of the replay the Soviet war was behind "+n"). Test:
  `tests/e2e/reviewBatch1938.spec.ts` (five wars: the smallest behind "+n", and first once its leader is played).
  `toBattle1938` opens "+n" for its quiet war. The critic's own probe (`c73_bannerOwn.mjs`) not run here: it is
  the next critic run's.
- [ ] R122 **R73-N2: a massing is told** (R97b, R103): no ticker or History row and no arrow before the
  declaration. AT: `node critic/scripts/c73_massSeen.mjs 56211 'Soviet Union' Romania 1218,300 40,55,65,72,75`:
  "history of the two" or "massing words" not empty on day 55 or 65.
- [ ] R123 **R73-N3: small worlds wait longer for their first war, or for ever** (the cause not read; R97b's
  give-up and bar the likely rule, the critic's design objection to ADR-1089). AT:
  `npx tsx tools/diag/fewNationWars.ts 2 55421 6 10`: 55426 and 55421 have their first war within a year.
- [ ] R124 **R73-N4: hero tags on counters in play** at 6,000 m/px (R72-N4's first half). AT:
  `node critic/scripts/c73_look.mjs 56901 1600 900 45,180,400`: no hero's tag over a counter's number on day 400.
- [ ] R125 **R73-N5: markers over one another at 1,200 to 1,800 m/px** (old). AT:
  `node critic/scripts/c73_markers.mjs 56951 head 1600 900 1675,372 10,20,30 1800,1200,600`: the pairs at 1,800
  under a quarter of the markers on each day.
- [ ] R126 **R73-N6: the phone**: the opened banners cover the ticker; the first cue covers "Ranking". AT:
  `node critic/scripts/c73_look.mjs 56903 390 844 60,240 phone`.
- [ ] R127 **R73's small things**: wars with nothing in their first month (16 of 111); `slowClick`'s five named
  cases; "1202: not done, no water there" (a fleet by its number); "COMMUNIST CHINA" under its capital's flag.

The critic's design objections not items of their own: ADR-1060 (German formations at peace in Vichy France after a
1941 free start) and heroes on by default (ADR-1070), as run 72: the user's earlier decisions, not re-opened.

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
