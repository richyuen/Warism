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
