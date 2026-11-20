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
  - Done (COMMIT): on a desk of 800 px or less the legend is folded to its title until clicked, in its own place, as a
    phone's is (`NARROW_DESK_QUERY`, MapLegend's `fold`; opened, it shows its rows and the units' signs); the free band
    measured a banner's height above the row's foot, whatever the row holds (with "+n" alone the legend fell out of it
    and the banner came back 3 px over its corner). `c86_modeRow 84901 400`: `fit0` [], `stale` [], `covering` [] in
    the political, sea-control, air-control, fallout and puppet modes (before: no war at 620–740 in three of them, 3–4 px
    over the legend in two); `c84_rowShot 700x800` the banner whole beside "▸ Political". A case in
    `warBannerRows1938` crossing 700, 680, 760, 1280, a phone and back in four modes (ADR-1137 (d)): the legend folded on
    the narrow desks, open on the wide one, a war shown and the row over nothing; the legend opened and closed, a
    nation's panel opened and closed (red without: the legend not folded). 30 specs on the legend, the map modes and
    the banners 90/90.
- [ ] R201 **R86-N1: with every relations kind hidden the footer says "Truces hidden" where it said "No ties of these
  kinds"** (R198's side effect; `critic/c86_rs_84903.log`). AT: the empty graph says it has nothing shown; a kind tapped
  is named as R198 has it.
- [ ] R202 **The design objection: the desk's row centred in the free band leaves the bar's axis** (24 to 44 px on a wide
  desk, moving about 68 px when the map mode changes; R197). AT: on a desk with room the row on the bar's centre, its
  width limited by the band; R197's and R200's cases as then.
- Not taken: the graph's 13 px jump (R196), `heroPop` on 85905, R172's, R192's and ADR-1111's kept items (as run 85).

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
