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

- [ ] R89 **Thick movement arrows.** Seen on seed 99 in August 1939: a march's line is 1.5 px, dashed and yellow, one a
  formation, drawn only for a selected nation; with China selected the Fujian front is some 40 lines across one another,
  and with no nation selected a war shows no movement at all. 428 of 997 formations had a march in that hour.
  - [ ] R89a The arrow: a filled, tapered body along the march's way (`formWay`, its turns rounded), a head, in the
    nation's colour with a dark rim; its width from the men it stands for, between a least and a most (the bounds and
    the scale in the ADR of the item). Formations of one nation whose marches start and end near each other are one
    arrow of their men together (a stack of markers, `markerStacks.ts`, is one already). AT: a unit test of the
    grouping (pure: the same formations give the same arrows, every marching formation in one arrow) and of the width
    (more men never a narrower arrow); the Fujian shot with no arrow lying across another of its nation.
  - [ ] R89b Whose arrows (the user's decision, ADR-1073): every nation at war shows its advances, a march whose end
    is on land an enemy holds or within reach of an enemy formation, as bold arrows, selected or not; a march behind
    the lines is thin and faint, and drawn for the selected nation and formations only, as now (`orderShown`). AT:
    `orderLines1938.spec.ts` with the new rule; a page count on seed 99 of the arrows drawn at world zoom with no
    selection, its bar set from the shot (a war read at a glance, not a web).
  - [ ] R89c Names and arrows: the names no longer under a filled arrow (`MapView`'s rule for the dashed lines says a
    line across a name leaves it to be read; a filled arrow does not). The voyages' and landings' lines stay dashed,
    in the arrows' rim and weight. AT: a spec that no country name or city name is covered by an arrow by more than a
    share the item sets; the voyage and landing specs green.
- [ ] R90 **Fronts that glow.** At world zoom a war is a hatched patch and a small burst. The border between two
  nations at war gets a glowing red line at world and theatre zoom, and land that changed hands in the last days
  flashes once. AT: a spec on the 1938 world with a war declared by God Mode: the line's pixels along the shared
  border and none along a border at peace; gone at the peace.
- [ ] R91 **The map's ground.** The sea is one flat colour and each nation one flat fill. The sea darker with depth
  and lighter over the shelf along the coasts; inside each nation's border a soft darker edge; faint relief under the
  political colours. AT: the political map's colours still tell every pair of neighbours apart (the check the nation
  colours have now); the shots; the frame time of the world zoom unchanged within the bench's noise.
- [ ] R92 **Country names.** Dark, heavily rimmed and steeply turned ("POLAND" runs nearly upright). White capitals
  with a soft shadow, a gentler turn and curve, a small nation's name no larger than its land lets it be. AT: the
  label tests with the new bounds on a name's angle and size; every name's contrast against its nation's colour at
  the bar the labels have now.
- [ ] R93 **Counters.** A small ball and a small number. A dark rounded plate with the flag chip and a larger number,
  a stack's count as a tab. The countryballs stay in the countryball look (the user: "we need to keep countryballs
  on countryball mode - they can be bigger though if you think that will look nicer"): the plate is the classic
  look's and the ball's label; the ball itself may grow. AT: both looks shot at T1; the marker tests' bound on a
  pixel's change in a frame (ADR-71, ADR-72) kept; the number readable at the far end of T1 (its height in px, the
  bar set in the item).
- [ ] R94 **Chrome.** The ranking, the news, the war banners and the bottom bar are all open at once. The gunmetal
  plates stay (the user's decision, ADR-762 kept, ADR-1073). A slimmer top bar with the date and the speed in its
  middle; the ranking closed until asked for; the news one line that opens. AT: the share of a 1600 × 900 view the
  panels cover at the start, measured before, and its bar set from that; the phone layout's specs green.

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
