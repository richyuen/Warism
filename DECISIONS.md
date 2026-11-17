# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

> The ADRs before the last release tag are in `docs/history/`: `DECISIONS-<YYYY-MM>.md` (October) and
> `DECISIONS-<release tag>.md` from November on (ADR-805, ADR-918), in the order they had here. Search them by number (`grep -rn "ADR-623 " DECISIONS.md docs/history/`).

### ADR-1073 · 2026-11-15 · accepted (the user's decision) — Batch 32: the map's look; thick arrows for nations at war
- **The user:** "Let's make a plan to improve the visual style of this game", of a mock-up (`reference/Warism.gif`,
  not committed): "We shouldn't take this literally, but I think this looks more polished than our current game. One
  example that I would like to improve are the troop movement arrows - if they could be thick arrows like in Hearts
  of Iron IV, that would be great - maybe they could become thicker the more troops that are moving."
- **Found:** shots of seed 99 in August 1939 beside the mock-up. The march lines are thin dashed lines, one a
  formation, for a selected nation only (`orderShown`; 428 of 997 formations marching at once); a front at world
  zoom is a hatched patch; sea and nations are flat fills; names are dark and steeply turned; counters small; four
  panels open at once.
- **Decision:** ROADMAP Batch 32, R89–R94, in this order: thick movement arrows, glowing fronts, the map's ground,
  country names, counters, chrome. The user's choices:
  - Arrows show by default for every nation at war (its advances; marches behind the lines faint, for the selected).
    This changes the request of 2026-10-29 that the lines show for the selected alone.
  - All five other items are in the batch.
  - Counters: the countryballs stay in the countryball look; they may be bigger.
  - The panels keep the gunmetal plates (ADR-762 stands); only what is open and where changes.
- **Bounds:** drawing only, no sim rule and no change of the pin of seed 99; nothing copied from the mock-up or from
  another game (CLAUDE.md's hard rule), its painted units not taken; each item within the frame budgets of goal 5.
- **Consequences:** "continue" takes R89a. The widths, the grouping's reach and each item's bars are set in the
  item, with an ADR where they are a new bound.

### ADR-1074 · 2026-11-15 · accepted — R89a: a movement arrow is the start of a march's way; its bounds
- **Found:** the item as filed drew each arrow along the whole way and made one of marches that start and end near
  each other. On the Fujian front of seed 99 (August 1939, China selected, 600 m/px) that was 38 thick arrows, most
  from beyond the screen to a handful of ends, with 131 crossings among them: the dashed web, thicker. And in the
  nation's own colour an arrow on its own land was not seen (China's yellow on yellow).
- **Decision:**
  - An arrow is drawn from where the formation stands along the first `ARROW_LONG_PX` (70) of its way and
    `ARROW_LONG_WIDTHS` (3) of its own widths more: where a force is going, not the whole of its way. The whole way,
    the dashed line, stays for the fleets (a way over the sea) and for a formation picked or selected.
  - Width: `ARROW_MIN_PX` 5 at `ARROW_MIN_MEN` 2,000 men or fewer, `ARROW_MAX_PX` 22 at `ARROW_MAX_MEN` 400,000 or
    more, by the logarithm between; times the unit size. Tail 0.4 of the neck; head 2.1 widths wide, 1.7 long.
  - One arrow: marches of one nation that start within `GROUP_START_PX` (44, a marker and a half) and head within
    `GROUP_TURN` (40°) of the strongest's heading; their men together, along the strongest's way.
  - No crossing within a nation: an arrow of fewer men stops `CROSS_GAP_PX` (4) before the side of one it would
    cross; one cut to under `ARROW_SHORTEST_PX` (10) is not drawn.
  - Fill: the nation's colour `ARROW_PALE` (half) of the way to white, a dark rim.
- **Consequences:** on that front 0 crossings among 35 arrows at 600 m/px (12 of 99 marches with no arrow of their
  own drawn, each beside a wider one). Whose arrows are drawn is unchanged until R89b (`orderShown`). ROADMAP R89a's
  text follows this.

### ADR-1075 · 2026-11-15 · accepted — R89b: what an advance is; arrows at the world's zoom
- **Stands on:** ADR-1073 (the user's decision: every nation at war shows its advances; marches behind the lines
  faint, for what is looked at). It changes ADR-441 (PLAN 7.4b: an order line only for what is looked at) for the
  advances alone; the dashed lines of whole ways are as ADR-441 has them.
- **Decision:**
  - An advance (`advances`, found once a snapshot): a land march of a nation at war whose end is on a cell an enemy
    holds (`controlGrid`, a nation it is at war with), or within `ADVANCE_REACH_KM` (100 km, a day's march or two) of
    a land formation of an enemy. Every other march is behind the lines.
  - Advances are bold arrows for every viewer, at every tier: under the counters beyond T1 too (the markers drew
    order lines from T1 in). Marches behind the lines are faint (`FAINT_WIDE` 0.6 of the width, `FAINT_ALPHA` 0.5)
    and drawn for `orderShown` alone. A faint and a bold march are never one arrow.
  - A bold arrow is never shorter than `ARROW_LEAST_PX` (26): at the world's zoom a march of 100 km is 5 px, and is
    drawn that long along its heading, a sign of where it goes.
- **Consequences:** a march in peace, of a nation looked at, is a faint arrow (`orderLines1938.spec.ts`'s first test
  follows). At 20,000 m/px many arrows start under their nation's counter and show only their heads; R90's fronts are
  what a war is read by at that zoom.

### ADR-1076 · 2026-11-15 · accepted (the user's decision) — Bench G runs on the GPU alone unless asked
- **The user:** "do we need the software bench?", then: "yes accept your recommendation".
- **Found:** bench G's software rasteriser is reported and never judged; the release's run leaves it out (ADR-959).
  Its figures are 1 to 3 fps against budgets of 60 and 30 and move by more than a factor of two between runs of one
  build (T2 2.4 fps, then 0.9, on 2026-11-15); it is most of G's time, over 7 minutes in three runs of seven that
  evening. The gate's `@swiftshader` project and the perf specs on SwiftShader are another thing and stay.
- **Decision:** `npm run bench -- G` runs the GPU's stages alone. `--software` adds the software rasteriser's, reported
  as before. `--gpu-only` is still taken and changes nothing. `docs/bench/G-game.json` keeps the software rasteriser's
  last record and its two pictures, marked with their date.
- **Consequences:** PROMPT RELEASES step 3's `npm run bench -- G --gpu-only` is the same run as `-- G`.

### ADR-1077 · 2026-11-15 · accepted — R89c: the arrows under the names, on the names' canvas
- **Found:** the nations' names and the cities' are drawn on a canvas of their own under the overlay (PLAN 2.7t), and
  the arrows were on the overlay with the units: a filled arrow covered whatever name it crossed ("POLAND"'s P under
  an arrow's head at 1,500 m/px). `nameObstacles` keeps the cities' names off the markers and says why not off the
  order lines: "names that gave way to every arrow would leave a front without names".
- **Decision:** the arrows are drawn first on the names' canvas (`drawCityLayer`'s `under`), so under the nations'
  names, the cities' dots and names, and all of the overlay (counters, markers, tags, the dashed lines). No name gives
  way to an arrow and none is covered by one. The picture of the names alone (`drawLabelLayers`, the names' tests)
  has no arrows. The voyages' lines are drawn twice, a dark edge then the colour, and the order lines have their dark
  edge at T1 too: the arrows' rim.
- **The bar:** of the points of arrows' middle lines that a nation's name lies on, at most a tenth where the picture
  is the arrow's plain fill (the name not told from it). Measured 3 of 89 in the German-Polish war: Germany's pale
  grey name on its own pale grey arrows. R92 (the names' new look) is told to keep a name told from a pale arrow.
- **Consequences:** an arrow under a nation's name is partly hidden by its letters; under a marker, by the box.

### ADR-1078 · 2026-11-15 · accepted — R90a: a front is the border of what two nations at war hold, drawn by the map's pass
- **Found:** the map's pass already finds, at each pixel, the two strongest holders (`uController`) and its distance
  to the border between them, for the dark border line. Whether those two are at war is all a front needs.
- **Decision:**
  - A war table, `FRONT_NATIONS` (512) a side, one byte a pair (`warTable`, `MapRenderer.setWars`, from the
    snapshot's `wars`; uploaded when the pairs change). A nation of an id from 512 has no front drawn (the 1938 world
    has 102 nations and those founded in a game).
  - Where the two holders are at war, in the modes of the palette's fills: a glow of `FRONT_GLOW_RGB` (0.93, 0.08,
    0.06), `FRONT_GLOW` (0.7) of the pixel on the line, falling off over `FRONT_GLOW_PX` (7 CSS px) either side;
    over it the line, `FRONT_CORE_RGB` (1, 0.36, 0.26), at least `FRONT_CORE_PX` (1.1) either side, the border's own
    width where that is more. Hot and light, so that it is told from a red nation's fill.
  - At every zoom, on the ground of T2 and T3 too: the first try faded it out with the ground, and it was gone at
    600 m/px, inside T1.
  - Land against sea is no front; the holders are what counts, not the owners (an occupied province's edge is the
    front).
- **The flash** of land that changed hands is R90b: it needs a time for each cell, which the pass does not have.
- **Consequences:** the map's picture changes wherever two nations at war touch; the whole browser suite was run on
  it. One more texture for the pass (15 of the 16 a WebGL2 context must give).

### ADR-1079 · 2026-11-15 · accepted — R90b: the flash is of the player's time, of each cell that changes hands
- **The item said** "land that changed hands in the last days flashes once". A flash measured in the game's days
  is no flash at the speeds the game is watched at (a day is a fraction of a second at ×5 and nothing at Max), and
  the map's pass has no time for each cell.
- **Decision:** the view compares each snapshot's holders with those it had (`changedCells`: another holder, and
  neither the sea nor land no one held) and lights those cells: a soft white patch, `FLASH_ALPHA` (0.32) falling to
  nothing over `FLASH_MS` (900 ms of the player's time), `FLASH_RADIUS_CELLS` (0.85) wide and at least
  `FLASH_MIN_PX` (1.5), on the names' canvas under the arrows and the names. The newest `FLASH_MAX_CELLS` (3,000).
  None for a game's first snapshot, at a start or after a load. The view draws on while one fades.
- **Found on the way:** at 0.6 and 1.15 cells the patches of a province taken at once ran together into a white
  blot that hid the map; at 0.32 and 0.85 they are a sheen.
- **Consequences:** at Max a front that moves every tick shimmers along its length; that is the war moving. A
  picture drawn at a time far ahead (the tests' `now + 1e6`) has no flash in it.

### ADR-1080 · 2026-11-15 · accepted — R91: the shades of T0 and T1; their bounds; what the tests of flat fills do
- **Found:** the pass of T0 and T1 is compiled without the ground's loop over the heights because that loop cost
  half as much again at T0 (PLAN 2.8a). The elevation has the sea floor. The pass already has, for the border line,
  how far a pixel is inland of the border between the two strongest holders (0 on it, 1 about a cell and a half in).
- **Decision:** three factors on a fill's colour in the political modes, by the share the ground of T2 and T3
  leaves them:
  - the sea, `FAR_SEA_SHALLOW` (1.2) at the shore to `FAR_SEA_DEEP` (0.8) at 6,000 m, by the log ramp of the sea of
    T2 (`seaDepthShare`);
  - the land's light from the north-west, at most `FAR_RELIEF` (0.12) either way, the slope 12 times steeper than
    it is and the mean of nine cells;
  - the fill toward its border and coast, `FAR_EDGE` (0.84) on the border, whole from `FAR_EDGE_BAND` (1) inland.
  The first two from one texture of two bytes a cell made once from the elevation (`farShade`): one bilinear lookup
  a pixel, no loop. The pass has 16 textures now, the least a WebGL2 context must give.
- **The bar:** every pair of neighbours of 1938 told apart by ΔE over 12 at the darkest and the lightest shade
  (15 unshaded, `nations.test.ts`). Edge 0.8 and relief 0.14 gave 11.5 for France and French West Africa; the
  strengths were eased to 12.9, the bar kept.
- **Tests of flat fills:** `MapView.farShades` (on by default) turns the shades off. Used by the tests that tell
  water, land or a nation by its one colour, or find the largest fill as one colour (`measureGround`,
  `hillshade1938`, `coast1938`, `lakeT1`, `seaControl1938`): they test the coast, the lakes, the sea's holders and
  the ground of T2, which the shades are not. `seaDepth1938`'s "at T1 one colour" was this feature's opposite and
  is changed with it: flat, one colour; shaded, the bank lighter and the ocean darker by the far ramp.
  The shades are not tied to `relief`: with the ground of T2 on or off the map of T0 and T1 is one picture, as
  `coastPicture1938` and `hillshade1938` hold.
- **Consequences:** the map's pass is 7 % dearer at T0 (0.520 to 0.556 ms of GPU a frame, budget 1): not within
  the bench's noise, as the item's AT asked, and logged as that. The darker edge reaches a cell and a half: under
  2 px at the world's zoom. A wider one needs the distance to the border over more cells than the pass reads.

### ADR-1081 · 2026-11-15 · accepted — R92a: a name is white with an edge of its land's deep shade
- **Stands on:** ADR-1073 (the user's decision: "white upright country names with soft shadow"). It replaces
  ADR-440 (PLAN 7.4a: a name a darker shade of its land with a lighter edge, as AoC draws its names).
- **Decision:** `nameInk`: white letters at `NAME_ALPHA` (0.92), their edge the land's colour at `NAME_SHADE`
  (0.3) of itself, 0.8 opaque: the shadow that tells a white letter from its land and from a pale arrow under it
  (R89c's weak spot was Germany's pale grey name on its pale grey arrows). Over a land of a luminance over
  `LIGHT_NATION` (0.45) the other way round: letters of that deep shade, a white edge. A name with no nation's
  colour keeps the plain dark ink.
- **The bar:** every name of 1938 told from its land by a contrast of 2 or more (letters over land, by their
  opacity). The names before had 1.99 at the least (Portugal); these 2.08 (Tibet). 0.45 is where white on the land
  falls to that bar: 84 of the 103 names are white, 19 dark on light lands.
- **Found by `labelFades1938`** (no pixel of the names' layers changes by more than 48 of 255 in a frame): with
  this ink a pixel changed by 59, at four crossings of the zoom by turns as other things were tried (the letters'
  opacity, a finer ladder of sizes, boxes of an even size: none of them it). The frames showed a sliver of a
  letter in empty ground beside "Austria" for one frame. The glyph atlas, when full, forgot its glyphs and began
  again at its corner, but each new glyph cleared its own box alone: beside and below it stood the old glyphs, and
  a piece drawn at an angle reads a px across its box's side, until the next glyph took the place. The names
  before had the same slivers under the bar (a darker ink). Now the atlas is wiped when it starts again, and each
  glyph is drawn inside its box a px clear of its sides. The largest jump of the test's 20 crossings: 40.
- **Consequences:** the turn and the size of a name are R92b.

### ADR-1082 · 2026-11-16 · accepted — R92b: a name is turned at most 30 degrees, and bows at most 0.15 of its length
- **Stands on:** ADR-1073 (the user's decision: "white upright country names"). It changes PLAN 1.29's rule (a
  name along its land's long axis, whatever the axis).
- **Found:** "POLAND" ran at 60 degrees, "UNITED KINGDOM" and "ITALY" near upright: the long axis of a land
  that is as broad as it is long is an accident of its shape.
- **Decision** (`deriveLabels.ts`):
  - `MAX_TILT` 30 degrees. A land whose axis is within it: as before. A steeper one: the baseline at 30 degrees,
    leaning the way the axis does, through the land's middle; its ends and its mid-line from the cells within a
    strip about that line (half the land's spread across it, two cells at least), so the name is as long as the
    land is there and not as its shadow on the line; the two ends as far to the line's side as each other.
  - `STEEP_KEEP` 0.4: where the name across would be under 0.4 of the name along the axis, the land keeps the
    name along its axis however steep (Sweden, Chile, Norway's coast): across them there is no room for one.
  - `MAX_BEND` 0.15: the baseline's middle no further from its chord's than 0.15 of the name's length.
- **The size** follows: the layout sizes a name by its baseline's length and the land's thickness, so a name
  across a land is no larger than the land is across ("ITALY" and "UNITED KINGDOM" are smaller than they were).
- **Consequences:** some names are smaller and come in at a closer zoom than before.

### ADR-1083 · 2026-11-16 · accepted — R93: the counters of T0 a quarter larger, with round corners
- **Stands on:** ADR-1073 (the user: "we need to keep countryballs on countryball mode - they can be bigger").
- **Found:** the counter of T0 (`counters.ts`) was the plate the item asked for (dark, a flag chip or a
  countryball, the men, "+n" for the nations folded in), 14 px high with a number of 10.
- **Decision:** the view draws the counters at the unit size times `COUNTER_SCALE` (1.25): a plate of 17.5 px, a
  number of 12.5, a countryball of radius 10; the plate's corners round (`COUNTER_CORNER` 3 of its own px). The
  layout (declutter, the folds, the names and flags that keep clear of the boxes) is told the larger boxes: it is
  what the unit-size setting of 1.25 would be, were there one.
- **Not in this:** the markers of T1 (R95).
- **Consequences:** fewer counters stand side by side in a crowded view; more are folded into a neighbour's "+n".

### ADR-1084 · 2026-11-16 · accepted — R94a: the ranking is closed on a desk until asked for; R94 in three parts
- **Stands on:** ADR-1073 (the user's choice of the chrome: "ranking collapsed by default"; the gunmetal plates
  kept). ADR-760 (the user's: on a phone the ranking folded to its title) stands.
- **Measured** at 1600 × 900, seed 99: the panels 13.3 % of the view at the start, 17.6 % in August 1939; the
  ranking alone 7.9 %.
- **Decision:** `Hud.showStats` is the player's choice or none yet. None yet: closed on a desk, folded to its title
  on a phone. The bar's Statistics opens and closes it, and the choice is kept (`warsim.showStats`). A player who
  had it open before keeps it: only one who never touched it sees the change.
- **The bar:** at most 6 % of a 1600 × 900 view under the panels at the start (5.37 measured; 5 % of 1920 × 1080
  and 8 % of 1280 × 800, where the same panels are more of a smaller view).
- **R94 split:** R94b the news as one line that opens, R94c the date and the speed at the top. Each changes a
  layout the user set (ADR-760's news on a phone, ADR-763's order of the bar) and rules the critic's runs added
  to the rows: they are taken one at a time, each naming what it replaces.
- **Tests that stood on the ranking open at the start:** five open it by the stored choice, as a player who asked
  for it has it; `phoneLayout1938`'s desk case tests the new rule.

### ADR-1085 · 2026-11-16 · accepted — R94b: the news on a desk is its latest event until opened
- **Stands on:** ADR-1073 (the user's choice of the chrome: "one-line news"). It changes what
  `phoneLayout1938` said of a desk ("a desktop's is as it was": every row), for the unopened news alone.
- **Decision** (`Ticker`, `Hud.newsOpen`, kept as `warsim.newsOpen`):
  - On a desk, until opened: the latest event and the first sea battle. A row above them, "▸ N more", opens the
    earlier events and the other sea battles; "▾ Latest only" folds them. No row with nothing more to show.
  - Not folded: the player's orders' news. R42b and R49-N3 were of such a row not on the screen.
  - As they were: a phone's rows (ADR-760, R43c, ADR-837); the rows beside a panel (`short`: two events, a sea
    battle, two orders), where there is no row to open them: the first try put it there, and the news stood 12 px
    over the panel's foot (`ticker1938`'s room test, PLAN 3.12Rh). Folded, the latest event stands beside a panel.
- **Measured:** August 1939, seed 99, 1600 × 900: the news 0.85 % of the view, from 2.87.
- **Tests of the earlier rows** (nine) open the news by the stored choice, as a player who asked for them has it.

### ADR-1086 · 2026-11-16 · accepted — R94c: on a desk Pause, the speed and the date are a plate at the top's middle
- **Stands on:** ADR-1073 (the user's choice of the chrome: "slim top bar with date and speed centred"). It
  changes ADR-763 (the user's order of the bar, 2026-10-29: Pause, speed, God Mode, map, Statistics, History,
  Editor, the date, Settings) on a desk: three of its members leave the bar; those that stay keep their order.
- **Decision** (`BottomBar.tsx`, `.topclock`): the clock, a gunmetal plate at the top's middle: Pause or Resume,
  the speed down, its label, the speed up, the date with "Paused" and the historical track's next event under it.
  The same elements, with their reserved widths (ADR-763: the plate does not change its width as its words do).
  On a phone there is no clock: the bar is as it was, every button in reach (PLAN 7.169).
- **What stands at the top's middle:** the alert of a nuclear strike, 3.4rem down: the clock ends above it. The
  heroes' counters keep clear of the clock (`COVER_SELECTOR`).
- **The bars' share:** 1.12 % and 1.76 % of a 1600 × 900 view, 2.88 together; the one bar was 2.93.
- **Consequences:** the bar is narrower by the clock's members and wraps onto a second row later than it did.

### ADR-1087 · 2026-11-16 · accepted (the user's decision) — R95: no pips under a marker; a strength bar and a larger number in Lato
- **The user:** "What are the little boxes inside the counters?"; "What if we get rid of the pips? Does that
  help?"; "Were the pips based on critic request?"; "Let's try to build that version — no pips, thin strength
  bar, larger number on a wider plate"; of the face: "It makes sense to use Lato anyway", "Let's use Lato".
- **It replaces ADR-498** (PLAN 7.21c2: a pip for each element under a T1 marker) and ADR-535's count of them. They
  answered critic run 8 ("at 900 m/px nothing of the units shows but counters") and run 9, which did not see the
  pips as elements. The user was told so before deciding. **For the next critic run:** at T1 a formation's elements
  are not shown, by the user's choice; a formation is its symbol, its strength bar and its men. The elements are
  drawn from T2 in.
- **Decision** (`markers.ts`): under the box (26 by 17, as it was) a plate 34 px wide: a strength bar of 2 px (the
  formation's men of its full strength, a hero's health; green, yellow under a half, red under a quarter) and the
  men in type of 11 px. A marker is 34 by 34 px (26 by 41). `NUDGE_MAX_PX` follows the height as it did (8).
- **The face** (`UNIT_FONT`): Lato's Bold for the markers' and the counters' numbers and the stacks' tags. They were
  the system's face (Segoe UI here), so a plate's fit was this machine's. Measured in the page, Bold of 11 px:
  "12.5k" 27.7 px in Lato, 28.1 in Segoe UI; "405.0k" 34.1 and 34.4. Barlow Condensed (20.2 and 27.0) was tried
  and not taken: at the same size it read smaller and was a second face to bundle.
- **Why not the whole marker larger** (the first try, 1.25 times): it broke nine tests of rules that stand on the
  box's size (BLOCKERS, resolved by this). With the box as it is, eight of them held at once.
- **Consequences:** the worker still sends the elements from T1 (PLAN 7.21c1): the handover to T2 has them in hand.
  The view no longer lays out pips at each snapshot. A click on the plate's 4 px beside the box is not on the marker.

### ADR-1088 · 2026-11-16 · accepted (the user's request) — R96: an advance is a march onto land an enemy holds
- **The user:** "for non selected countries, can we only show arrows if a country is invading another country or
  pushing through a front (more like Hearts of Iron IV)?"
- **It changes ADR-1075** (R89b): a march that ended within 100 km of an enemy's land formation was an advance.
  That made every reinforcement on its way to a front a bold arrow.
- **Decision** (`advances`, `MapView.findAdvances`): an advance is a land march of a nation at war, not a retreat,
  whose way within its next `ADVANCE_REACH_KM` (100 km, along the way, looked at every half cell) is on land held
  by a nation it is at war with: it crosses the front, or stands over it. Its own land an enemy holds counts: a
  counter-attack is over a front too. Bold arrows are drawn before faint ones: none is cut short for a march
  behind the lines.
- **As it was:** a nation or a formation looked at shows its other marches faint (`orderShown`).
- **Consequences:** a front where no one moves over the line has no arrow; its red line (R90a) says where it is.

### ADR-1089 · 2026-11-16 · the user's decision: a — R97b: how an attacker comes to be at its border when its war begins
- **Found (R97a):** in 118 of 221 of the AI's own wars between leaders with a land border the attacker has no man
  within 300 km of that border as it declares, and where it has none the defender is ahead in land after a month
  more often than the attacker (46 % against 31 %). The operational AI allots formations to a front that has an
  enemy on it; before the declaration there is none, so the army is where the last war or the start left it.
- **Options:**
  - **a. Mass, then declare.** The strategic AI, having chosen its war, first orders a share of its army to the
    border and declares when enough of it stands there (or gives the war up after a time). Nearest to what a
    player does and to Hearts of Iron IV; the build-up is seen on the map before the war. The largest change:
    a state between peace and war, saved, and rules for what the neighbour does on seeing it.
  - **b. Declare only from where the army is.** A war is declared only on a neighbour at whose border enough of
    the army already stands. Small and easy to check; but armies do not go to a border of themselves, so most
    declarations would be refused until something else moved them, and wars would be fewer.
  - **c. Come at once.** As now at the declaration, but the planner sends the army to the new front at once and
    all together (no "one a sector in eight days" for a front just made). No new state; the defender still has
    the first days, a big attacker's march of weeks still leaves its border open at first.
- **The loop's recommendation:** a, with c's quick march kept for the wars others begin on it.
- **Decided (the user, 2026-11-16): a, "Mass, then declare".** Built as `src/sim/ai/massing.ts`:
  - The strategic AI's choice (its utility, its draw, the pile of ADR-1042) begins a massing where it declared, for
    a nation in no war whose army is its AI's, on a neighbour of its home (`homeNeighbours`) that it holds land
    beside. `World.massing` (nation -> target, day), saved. One at a time; it chooses no other war meanwhile.
  - Each day: `MASS_SHARE` (0.7) of its land formations on the border's land (`NavGrid.component`; those over a sea
    are not this border's army) are to be within `MASS_NEAR_CELLS` (15, 300 km) of a point of the border (one a
    sector of 4 cells) or on the march to one; the nearest of the rest are ordered there (`askMove`).
  - It declares when `MASS_READY` (0.5) of its men there are at the border, if it would still declare: `whyNotWar`,
    its gold, ADR-1042's pile and ADR-981's deterrence are asked again that day (weeks have passed, and alliances
    are made in them); else the war is given up.
  - Given up: after `MASS_DAYS` (90), the target then barred to it for `MASS_BAR_DAYS` (365; `World.massBarred`,
    saved); when it is at war (called by an ally, or declared on); when its AI's diplomacy or army is off; when the
    border is gone.
  - A nation at war prepares none; it declares a second war on a neighbour of its home only where `MASS_SECOND`
    (0.15) of its men stand at that border. This is option b for second wars only: without it (measured, six
    seeds) the wars not prepared were 56 of 136, the defender ahead in 25 of them and the attacker with no man near
    in 30.
  - Not built: the neighbour's answer to a massing it sees, and c's quick march. The target does nothing of it.
- **Tried:** `MASS_DAYS` 45: the Soviet Union on Finland, Estonia or Turkey and France on Germany did not arrive;
  90 gave 26 % more wars prepared on the six seeds and the defender ahead in 8 % where 16 %. Every land
  neighbour massed on: Britain and France stood 60 days "preparing" a war on the Netherlands over Borneo and
  Guiana with no army there (`nukeOutrage1938.test.ts` went red on it, and is green unchanged since).
- **Measured**, twelve seeds by three years (ROADMAP R97b): the attacker with no man within 300 km of the border
  53 % -> 6 %; the defender ahead in land after a month 25 % -> 10 %; the attacker ahead 51 % -> 84 %.
- **The bar of the wars' number re-scoped (the user's decision, 2026-11-16):** R97b asked that the wars begun be no
  fewer than four fifths; the wars with a border are 71 % (542 -> 385). Those lost are the wars in which nothing
  moved or the defender advanced; the wars in which the attacker is ahead after a month are 218 -> 219. The bar is
  that number, no fewer.
- **Could contradict (ADR-803), read:** ADR-1042 and ADR-981 (asked again at the declaration); ADR-759 (the layers:
  a massing needs both the diplomacy's and the army's, and leaves a formation on the player's order alone);
  ADR-703 (`askMove`, the same refusals' memory); R62e (the historical track: `strategicAi` does not run while it
  steers, so no massing); R75a's focus (it scales the draw of the choice, as before). MAX_WARS: a massing nation is
  in no war. The checkers of war and peace on the twelve seeds: none broken.
- **After the commit (the advisor's review):** every sweep test (`tests/sweep/`, 23 files, the ten-year ones) green on
  the rule; the gate runs the pin alone. The checkers also over the options (ADR-804): seed 99 with random
  diplomacy, seed 7 with heroes, seed 7 in the random world, a year each, none broken. No invariant of the
  massing's own was added to the checker: a nation declared on in a day's turn is massing and at war until the
  next day's step gives its massing up, so "none massing is at war" does not hold of a day's end.
- **The tick:** the borders' armies were read for every nation of the day's turn before its draw: the strategic AI
  0.38 -> 0.49 ms a tick on seed 99's two years. The draw is now first (it reads the seed, the day and the nation
  alone): the targets are weighed only on a day the nation would declare; 0.20 ms a tick, the same hash.
  `stillDeclares` named and tested.
- **Seed 5309 looked at:** the war forced on Czechoslovakia there is Germany, Italy and Japan against France, the
  Soviet Union, Romania and Yugoslavia from its first day, and Germany loses land in both histories (530 of its
  cells held by others on day 80 before the rule, 751 with it); with the rule two more wars find it by day 80. No
  massing is in it.
- **Not checked:** `formationFight1938`'s scan had two seeds of eight (2 and 13) with a block over the 20 km the
  spec allows (20.0 and 22.5); whether they were so before the rule was not run.
- **The pin of seed 99:** ac4fab37 -> a49837a3 (the wars of its year are begun later and at their borders).
- **Tests re-aimed, none weakened:** `farWait1938` (seed 7 from day 90: the first refused march of a seed is on
  another day), `nukeMeansLost1938` (seed 1; on 5309 Prague is not taken in 300 days of the new history),
  `airHolderFighting1938` (the wars of seed 8217's first ten days are not begun so soon: the case found by what it
  is, a nation at war elsewhere the top flyer of a zone of others' land, on seed 4 day 24: Britain over France's).
  Of the browser's, six whose scene is a seed's history, each by its own scan: `enemyClickPanel1938` (seed 7 day 70
  of 18 seed-days), `fightCamera1938` (formation 752 for 746, no longer in contact), `formationFight1938` (seed 1 of
  8), `nukeMeansLost1938` (seed 1), `seaClose1938` (the same four battles at their new hours, `seaPairs`),
  `smallMark1938` (the first armour fire from day 25, where from day 7). No bar of any was changed.

### ADR-1090 · 2026-11-16 · the user's decision — R98c: the invaded front has the more of the army
- **Found (R98a, R98b):** in Germany's war on Poland by God Mode its army goes to its fronts at once; what stands
  still is the planner's reserve. The allotment shares the formations among the threatened sectors by their threat
  (ADR-634), France joins on the first day, and half the army stands at each front: Germany takes France's land
  and loses its own to Poland. The rush of far formations (R98b) gave no order in that war and opened the wars of
  six seeds no better: not kept.
- **Offered:** the reserve let go where its front loses ground; the army shared between two fronts by where it
  loses; a guarantor's joining delayed. **The user: "Let's do 2".**
- **Decision:** in the allotment (`heat`), a threatened sector at whose own front cell an enemy holds a cell beside
  it that is the planner's own land (its owner the planner) weighs `INVADED_WEIGHT` times its threat. 4: of 1, 2
  and 4 on four seeds of that war the land Germany loses falls with each (Poland's 328 -> 172 -> 95 on seed 1938),
  and with 4 France holds 1 cell of Germany's on each seed where 30 to 68.
- **Not while the historical track steers** (`world.steered`): with the weight in every world the track of seed 1938
  passed an event over (`historyTrack1938h`, `historyMatch1938h` red); the timeline's objectives say what is to be
  taken there (ADR-951's `aim`).
- **Could contradict (ADR-803), read:** ADR-634 (the threatened first: the shares among them change, not who is
  threatened); ADR-951 (an objective's sector is taken as threatened: the weight multiplies its heat too, but not
  on the track); ADR-53 (a march under way keeps its sector: unchanged); ADR-187 (a sector takes only the
  formations within its range: unchanged, so two fronts far apart are still manned each from its own).
- **The pin of seed 99:** a49837a3 -> 1fe6205e.
- **Tests re-aimed, no bar changed:** of the unit suite `farWait1938` (seed 99), `airSpread` (day 8: on days 1 to 5 one
  German formation or none is in contact), `airHolderFighting1938` (day 40). Of the browser's, eleven, each by its own
  scan: `battleTags1938` (seed 2), `countryballs1938`'s losses (seed 7019), `enemyPointer1938` (the search from day
  19), `fallen1938` (formation 542), `fightCamera1938` (759 for 752), `fightSeen1938` (day 24), `formationFight1938`
  (seed 2), `seaClose1938` (hour 1477), `tagsCrowd1938` (seed 1), `tankBattle1938` (seed 2), `zoomDemo1938` (from day
  34).
- **Two bars changed (the user's decisions, 2026-11-16):**
  - The two strikes of `nukeAlertStop1938.test.ts` and `nukeAlertTwo1938.spec.ts`: three days apart at most where a
    day ("Yes to nuclear but do we need up to 7 days?": no; 72 hours is the scene's own). Poland strikes in hour 25
    as before, France in hour 97 where 49. The pause on each strike's tick is asserted as before.
  - `enemyClickPanel1938.spec.ts`, Germany and Poland: the clicked formation's own panel at least 5 times of 12
    where 9 ("Lower to 5"), on seed 11's day 20 (6). On 90 scene-days it is 9 once, with 10 formations left. That the
    panel is of what is drawn (12 of 12) and never one's own unselected is asserted as before.
- **Seen in the scans, real and not hidden by a seed:** the tags of formations in contact are more and closer (12
  seeds, 15 views at 60 m/px: 1,509 tags -> 2,526; those over 120 px off 0.6 % -> 2.3 %; `tagsCrowd1938`'s bar of
  3.5 % is passed on 10 of 12 seeds where 12). A block over 20 km from the one it faces on 4 seeds of 12 where 1
  (`formationFight1938`). And two faults older than this rule (BLOCKERS): a tag or an enemy's pointer under the top
  clock or the war banners takes no hover or click.

### ADR-1091 · 2026-11-16 · accepted (the user's request) — R99: a front is a line of fire, with a core near white
- **Asked:** "Can we make the fronts brighter and more obvious?" ADR-1078's line was (1, 0.36, 0.26), 1.1 px
  either side, in a red glow of 7 px: a red line on a red or pink nation, and thin at the zooms a war is watched at.
- **Decision** (`ground.ts`, `mapShader.ts`), each a half width in CSS px, from the outside in:
  - the glow, `FRONT_GLOW_RGB` (1, 0.14, 0.07), `FRONT_GLOW` 0.6 on the line, over `FRONT_GLOW_PX` 12 (was 0.7 over 7);
  - a dark casing, `FRONT_CASE_RGB` (0.16, 0.02, 0.02), `FRONT_CASE` 0.7 of the pixel, to `FRONT_CASE_PX` 4.4: the
    line's edge on a light fill (yellow, white);
  - a band, `FRONT_BAND_RGB` (1, 0.22, 0.08), to `FRONT_BAND_PX` 3.2;
  - the core, `FRONT_CORE_RGB` (1, 0.95, 0.62), to `FRONT_CORE_PX` 1.5: light on red, on grey and on yellow. (At
    8,000 m/px and further the picture at peace has 464 to 805 px within the test's reach of that colour, none at
    1,500 and nearer; which fill they are was not looked into. The test's bars are of the line along a border.)
- **Not done:** a pulse. The map's pass has no clock and the view draws when something changes; a front that
  moved in time would have it draw every frame.
- **The test:** `fronts1938.spec.ts` looked for the old line's colour by its numbers; it reads `FRONT_CORE_RGB`
  now. No bar changed.
- **Consequences:** the map's picture changes wherever two nations at war touch; the whole browser suite run on it.
  No sim input: the pin of seed 99 stands.

### ADR-1092 · 2026-11-16 · accepted — R101: a tag has a place at each corner of its block
- **Found:** on a front made dense by ADR-1090 the tags over `TAG_FAR` (120 px) from their blocks are whole tags of
  formations in contact, 138 to 412 px off in steps of a tag's height or width: the layout's places were a column
  above and below the block and a row beside it, and a neighbour's block or tag stands on the near ones.
- **Decision** (`tags.ts`): the rings under `TAG_CORNER_RINGS` (1) have, after their four places, a place at each
  corner of the block (the tag's corner at the block's, `TAG_GAP` off). Not for the first pass (the places "by the
  block" are the four, as before). In the rings' fixed order. The cheapest question (within `TAG_FAR`) is asked
  before the grids'.
- **Not** the engaged tags made short where they find no place: "the engaged keep the whole tag" is the user's
  (ADR-1037).
- **Tried:** every place sorted by its measured distance, with more of them: the fewest far tags (18 of 3,372), but
  the order turned on a part of a px, so a tag changed its place between two pictures of one world
  (`godUndoPicture1938`), and the bench's draw was 13.4 ms where 4.6. Two rings of corners: 28 far, the draw 6.8 ms.
  One ring: 42 far (76 before), 21 left out (31), the draw 5.0 ms.
- **Tests:** `tests/unit/tags.test.ts`: its plain layout (the grid's twin) has the same places; `PLACES` is counted
  from the layout (no fewer than the rings' four each); "three columns side by side" has no tag off with a line now
  (the middle one stands at its corner): asserted so. `tagsCrowd1938` back on seed 1938. No bar changed.

### ADR-1093 · 2026-11-16 · accepted (the user: "Let's do them all") — R103: the target of a massing brings its army to that border
- **Was:** ADR-1089's first rule: "the target is not told and does nothing of it". A massing takes weeks and is
  seen on the map; the neighbour's army stood where it was until the war.
- **Decision** (`massing.ts`, `massStep`): a massing is seen by its target when `MASS_SEEN` (0.25) of the massing
  nation's men on the border's land stand at the border. The target then, each day, does with its own formations
  and its own points of that border what the massing nation does (`gather`: `MASS_SHARE` of them at the border or
  on the march, the nearest of the rest ordered there; one in a fight, going home, refused or on the player's order
  left). Not when it is in a war (its army is on its fronts by the operational AI), when it prepares a war itself
  (one plan at a time), or when its army is not its AI's. Massed on by two: the one with the more men at its border,
  the lower number on a tie. Read from `World.massing` each day: nothing saved, nothing to undo when the massing is
  given up (its army stays).
- **The narrowest answer, on purpose:** no alliance asked, no pre-emption, and the massing nation does not think
  again for it (it asks the rules of the choice again as it declares, ADR-1089; the target's army at the border is
  not among them).
- **Measured** (ROADMAP R103): twelve seeds by three years, without and with: the attacker ahead after a month in 231
  wars and 231, the defender in 41 and 40, the wars with a border 413 and 408. R97b's bars of those hold.
- **R97b's third bar is over on both arms:** the attacker with no man within 300 km of the border in 10.5 % of the
  wars without the answer and 11.0 % with it (30 and 32 wars), where a tenth was set and R97b's build has 6.5 % on
  the same seeds. The rise is in the wars declared at once, which are more (93 -> 138 with a border) and more often
  empty (13 of 43 -> 28 of 80); ADR-1090 lies between the builds. Left to the user.
- **In the AI's own wars the answer shows little:** the defender's men near the front as a prepared war begins, a
  median 5 % of its army without and 10 % with (`docs/evidence/R103/opening.md`).
- **Not tested:** two nations massing on one target (the rule is in the code and above; no scene of it was made).
- **Could contradict (ADR-803), read:** ADR-1089 (its "not built": built); ADR-759 (the layers: the target's army
  layer is asked, a formation on the player's order left); ADR-703 (`askMove`'s memory of refusals: the same);
  R62e (no massing while the historical track steers, so no answer).
- **The pin of seed 99:** 1fe6205e -> bf16e257.

### ADR-1094 · 2026-11-16 · the user's decision — R97b's bar of the attacker with no man near its border: 15 %
- **Was:** a tenth of the wars between leaders with a border that ran a month (ADR-1089; 6.5 % on R97b's build).
- **Measured since** (ADR-1093): 10.5 % on the build of ADR-1090, 11.0 % with ADR-1093's answer; the rise in the wars
  declared at once, which are more (93 -> 138 on the twelve seeds).
- **The user: "Yes, we can move the bar to 15%."** The bar is 15 %. Why the wars declared at once are more was not
  looked into, and is not asked for.

### ADR-1095 · 2026-11-16 · the user's decision ("Let's do both (the second for normal units)") — R104: a hero presses as a division; a march that waits for the front is told of
- **Found** as the user played France against the two Spains: the Char 2C ordered over Nationalist Spain's border
  stood before it, drawn on the march. PLAN 1.14: a formation enters an enemy's cell only once the territory system
  has taken it; SPEC §5.2: by pressure, a formation's men ÷ 1000; a hero is one element. In a run of it the cell was
  taken six days on, when France's divisions came.
- **Decision (a):** a land hero's pressure is of `HERO_PRESSURE_MEN` (10,000) men × its health (`heroHealth`), or its
  own men where more (`territory.ts`). In fights it is as it was. Only where the option of heroes is on.
- **Decision (b):** the worker, for each formation on a player's order (`ordered`): where `waitsForFront`
  (`movement.ts`: on the march, not holding in a fight, its next step onto the ground of a nation at war with its
  own) has held for `WAIT_TOLD_HOURS` (24) on end, an `orderNews` of kind `waitsFront`, once an order. For every
  land formation, not heroes alone (the user's words). A day: a front that moves takes a cell in 16 hours, and the
  wait behind it is no news.
- **Not done:** anything on the map that shows the ground being taken (R105).
- **The pin of seed 99** stands: that world has no hero, and (b) is the worker's.

### ADR-1096 · 2026-11-16 · accepted (the user: "Accept your recommendations") — R105: the cells being taken are told to the map, and glow
- **Was:** a front's line (ADR-1078, ADR-1091) says where the front stands and the flash (ADR-1079) where it just
  moved; that a cell is being taken, and how near it is, was the sim's alone (`cells.flip`). A formation ordered
  onto such ground stands and waits (ADR-1095), and nothing on the map said the ground was on its way.
- **Decision:**
  - `takingCells(world)` (`territory.ts`): the cells with hold progress (`flippingOf`, a set the territory system
    keeps: no scan of the grid), each `cell · 256 + progress`, progress 1 to 255 of `holdHours`. In the snapshot as
    `taking` (a `Uint32Array`, the whole world's: some hundreds in a war).
  - The view (`src/render/fx/taking.ts`, on the names' canvas under the flashes): a soft patch of a hot orange
    (`TAKING_GLOW_RGB`, 1.15 cells, opacity 0.25 to 0.7 by the progress) and in it one of the taker's colour (0.75
    cells, 0.2 to 0.85): the taker read from the picture, the holder of a cell beside it at war with the cell's
    (`takerOf`); with none found, the glow alone.
  - Not in the map's pass: it has 15 of its 16 textures, and the patch is of the kind of the flash.
- **First tried:** the orange glow alone, 0.1 to 0.6 at 0.8 cells: not seen under the units at 1,500 m/px, and it
  did not say who takes the cell.
- **Not done:** a pulse (the view draws when something changes); a mark where a front is pressed and holds.
- **No sim input:** the pin of seed 99 stands.

### ADR-1097 · 2026-11-16 · accepted (the user: "Accept your recommendations") — R106: the arrows nearer their nations' colours; another nation's thinner
- **Was (ADR-1073):** an arrow's fill half-way from its nation's colour to white, every nation's as wide as its men.
- **Decision:** `ARROW_PALE` 0.3. `drawMoveArrows` takes `own` (the nation played, else the one looked at): another
  nation's arrow is drawn `OTHER_WIDE` (0.7) of its width. The layout (the stretch, the cut before a crossing, the
  shortest drawn) stays by the whole width: thinner in the layout, an advance of Germany's was dropped with Poland
  looked at (12 arrows -> 11, `orderLines1938`, R96's rule).
- **Not changed:** the dotted order line (the picked and the selected only, R89a).

### ADR-1098 · 2026-11-16 · accepted (the user: "Accept your recommendations") — R107: occupied land in broad bands on the ground, and the old border dashed
- **Was:** PLAN 2.11f took the 7-px hatching off the ground of T2 and T3 (it lay over the whole view where a front
  had moved) and left the occupier's cast, even; ADR-449 lowered that cast from 0.42 (French-held Germany "read as
  a lake"). At 20 to 30 m/px in the user's picture the cast over Spain's ground is a grey haze.
- **Decision** (`mapShader.ts`, `ground.ts`), on the ground only (by `uDetail`):
  - bands along the diagonal, `OCCUPIED_BAND_PX` (34) a band and its gap, the band `OCCUPIED_BAND_DUTY` (0.4) of it,
    soft-edged: the fill's share `OCCUPIED_BAND_CAST` (0.5) on a band, `OCCUPIED_GAP_CAST` (0.18) between. Their mean
    0.31: no more of the occupier's colour over the land than ADR-449 left.
  - where the holder's own land meets what it occupies (the occupied share of the strongest holder's weight crossing
    a half, away from a front), a dark line of `OLD_BORDER_PX` (1.2) in dashes of `OLD_BORDER_DASH_PX` (9), `OLD_BORDER`
    (0.6) of the pixel.
- **Against PLAN 2.11f, read:** that took a fine weave off the ground; these are bands five times as broad, and the
  7-px measure of `occupiedGround1938` (the hatching's contrast under a fifth of T1's) holds unchanged.
- **No sim input.**
