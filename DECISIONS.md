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
