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
