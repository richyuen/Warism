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
