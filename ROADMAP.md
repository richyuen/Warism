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
- A batch ends with a critic run and a release tag (`release-<YYYY-MM-DD>`, PROMPT.md "Releases").

## Now: after the release (ADR-805)

- [x] R0a Untracked probe output deleted (`.cache/` scratch, `critic/` screenshots, builds, saves).
- [x] R0b Parity retired: `docs/PARITY.md` frozen, `npm run parity` and its gate stage removed.
- [x] R0c The plan retired: PLAN.md frozen; this roadmap; `critic:due`, `plan:archive` and the
  gate's phase-review trigger removed.
- [x] R0d PROGRESS.md and DECISIONS.md archived by month under `docs/history/`.
- [x] R0e PROMPT.md, CLAUDE.md, CRITIC_PROMPT.md and the critic's agent rewritten for work after
  the release: our own goals, the batch flow, no DONE CONDITION.
- [x] R0f Tracked `critic/` pruned to the last report and the files it and its scripts cite.
- [x] R0g CI: a nightly GitHub Actions run (typecheck, lint, unit, the ten-year tests, a soak, the
  war-and-peace checker on new seeds, a small sweep) and a weekly full sweep.
- [x] R0h CHANGELOG.md with the `release-2026-11-03` entry.
- [x] R0i SPEC.md §1–§2 rewritten as the game is, with a contents list; the rest is R6.

## Batch 1

- [x] R1 **The relations graph** (the user's feature, 2026-11-03). A view of the world's diplomacy
  as a graph: every living nation a node (its flag, sized by land), and an edge for each war (by
  side), alliance, guarantee (guarantor → target), puppet bond (overlord → puppet) and truce, each
  kind its own colour and line. Filters by kind and by nation; a click on a node or an edge says
  what it is and selects the nation. The layout is seeded and stable, so the same world draws the
  same graph and it moves smoothly as the world changes. It extends the existing diplomacy map mode
  and the statistics message (`enemies`, `alliance`, `overlord`, `guarantees`, `guarantors`,
  `truces`); it does not compute relations of its own.
  AT: on seeds 7019, 2207 and 3739 at days 1, 60 and 365, the graph's edges equal the sim's
  relations on every pair of living nations (a unit test in the `allyWhy` way: 0 mismatches); an
  e2e spec opens the graph on the 1938 world, filters to one kind and clicks an edge, with
  screenshots at the start and after a year. Design: ADR-806.
  - [x] R1a The graph and its layout (`src/ui/relationGraph.ts`, `relationLayout.ts`): the unit
    test `tests/unit/relationGraph.test.ts`, 0 mismatches either way on 7019, 2207, 3739 at days
    1, 60, 365 (the worker's own statistics message against `wars.list`, `overlord`,
    `allianceOf`, `guarantees`, `truces`).
  - [x] R1b The panel: the bottom bar's Relations button, the drawing, the filters, the clicks; the
    e2e spec `tests/e2e/relations1938.spec.ts` (2 of 2: the start's ties by kind against the
    statistics message, a kind off with the nodes unmoved, Manchukuo's line read, Japan selected,
    Japan's ties alone, a year on; a phone's width), screenshots in `docs/evidence/R1/`.
- [x] R2 **AI puppets revolt** (critic run 28, non-blocking 1). In 3 seeds × 30 years no puppet
  with autonomy ≥ 10 fell below loyalty 30.5, and the revolt line is 20: the war of independence
  happens only through God's slider. Make the AI's puppets able to rise (the loyalty model's floor,
  the overlord's losses, a lost war), without a wave of revolts.
  AT: puppets revolting on their own in at least 2 of 3 seeds × 30 years, at most 1 in 10 of the
  puppets made; the war-and-peace checker green on its seeds.
  Done (ADR-807): losing, a puppet's loyalty target is 25 × min(1, its income ÷ its overlord's)
  lower; a rising leaves an alliance shared with its overlord. `tools/diag/puppetLoyalty.ts`, 7019 /
  3163 / 1777 × 30 years: 3 / 81, 2 / 72, 5 / 84 risings for puppets made (7 of the 10 by 1938's
  colonial bonds); the checker's new rule `rise` red on two patched rules, green on its seeds.
- [x] R3 **A bond's Force war calls no one in beside its enemy** (critic R27-N2). A forced war that
  breaks an alliance or a puppet bond can call a nation into the war on the side of its own enemy:
  3 cases on seed 1777; `tools/diag/diploInvariants.ts` reports 7 broken pairs on 8209 (random
  diplomacy, heroes), and the nightly's checker 2 on 1009 (scenario, day 90: Greece's Force war on
  Turkey puts Czechoslovakia beside Turkey while at war with it and with Iran; run 41624512914).
  Commands only (God, the player).
  AT: the checker's rule for it red on HEAD and green after on 1777 and 8209; 0 broken pairs on
  the checker's own seeds.
  Done (ADR-808): the hole was `declareWar`'s call, which judged a called nation against the
  other side only; one at war with a nation of its own side now stays out. The checker, every pair
  on days 60/200/350: at the critic's commit 1777 21 broken → 0 (8209 0 either way: HEAD's and the
  critic's worlds no longer reach it); HEAD 1009 2 → 0; the checker's seeds green in the suite.
- [x] R4 **Checkers for the other systems**, as `tests/helpers/diploInvariants.ts` checks war and
  peace (ADR-803): the economy (no gold from nowhere, upkeep paid or units cut), the navy (a fleet
  at sea or in its own or a partner's port), air (a wing within range of its base), nukes (a burst
  only by a nation with warheads and a means), the bonds (no puppet of a puppet, no alliance with
  an overlord). One part per system.
  AT: each checker green on 4 seeds of the 1938 world and the random world, and red on a commit
  (or a patched rule) that breaks it.
  One checker, `tests/helpers/worldInvariants.ts` (`tools/diag/worldInvariants.ts`, the nightly's
  `systems` job), a rule set a part (ADR-809):
  - [x] R4a The economy: gold rises only at a month's start, at a founding or a default; by no more
    than income and tribute owed; a bankrupt nation's formations on land lose the desertion share
    of their units. `worldInvariantsEconomy.test.ts` 8 of 8 (180 days; Poland 800 in debt on
    7019); 730 days on 7019, 2207, 3739, 1009 and random 7, 11, 23, 8821: 0 broken; red on a
    doubled income (21 lines) and with no desertion (Poland's formation 558).
  - [x] R4b The navy: a fleet not under way stands on water; a formation aboard rides its own
    nation's fleet and stands where it stands, or is lost with sunk transports by the next hour; no
    fleet is a dead nation's. (Restated: "in its own or a partner's port" is no rule of the game, as
    a fleet may stand at an enemy's port to blockade it; ADR-809.) `worldInvariantsNavy.test.ts` 8
    of 8; 730 days on the eight worlds: 0 broken; red with the formation left behind its
    transports (14 lines, 7019) and kept afloat after they sank (England's 279, day 287).
  - [x] R4c Air: every wing has a base its side holds (a taken one left by the next hour) or a
    fleet of its nation's; it stands there unless ferrying; a sortie flies within its range; an
    airbase wing's mission is within it (a carrier's waits while out of range, by design).
    `worldInvariantsAir.test.ts` 8 of 8; 730 days on the eight worlds: 0 broken; red on 7019 with a
    launch out of range, a carrier's wing left behind, a taken airbase kept.
  - [x] R4d Nukes: a launch needs nukes allowed, a warhead and a means (a strategic bomber at
    its airbase in range, or missiles within MISSILE_KM); its yield what the nation builds; every
    launch that ends is told; a stockpile grows only by one built at the day's pass, to
    WARHEAD_MAX, and is no dead nation's. `worldInvariantsNukes.test.ts` 8 of 8 (God arms the
    Soviet Union on 7019 and it strikes by bomber); 20 years on 7019 and 8209: 0 broken; red with
    a launch that spends no warhead and a missile without the tech.
  - [x] R4e The bonds: no puppet of a puppet (ADR-148), none of a dead nation, never at war with
    its overlord; values within 0..100; alliances of two living members or more with their leader,
    one a nation; guarantees between two living nations at peace. ("No alliance with an overlord"
    is no rule: 1938's Tannu Tuva is in the Soviet alliance.) Red on HEAD: puppets of puppets on
    1009, 2207, 3739 and random 11 within two years; fixed (ADR-810: a realm has one head).
    `worldInvariantsBonds.test.ts` 8 of 8; the six worlds 730 days: 0 broken.
- [x] R8 **Heroes drawn where they are** (critic run 29, R29-B1). At the world's zoom (the view a
  heroes game opens on) `counters.ts` steps a hero's counter below any it would cover, as often
  as it takes: Europe's ten heroes cascade into Africa (P.100 Ercole 5,009 km off), and a click on
  a displaced counter opens the nation under it.
  AT: on the critic's seed 5521 at the start view (desk and phone), every hero's counter within
  its own height of its place, and a click on each opens that hero; screenshots looked at.
- [x] R9 **A hero stays its nation's** (R29-B2). An annexation or integration moves every
  formation of the dead nation to the taker, heroes too, while the roster row stays the dead
  nation's: Britain fields Roma and P.100 (4637), the United States the Maus (7603); lost, they
  never return. Decide (ADR) between "gone with its nation, its row waiting for a revival" and
  "the row moves with it", and add the heroes' rules to the checker (one formation a row, its
  roster nation's; back within its hour when it has a place: R29-N7).
  AT: the checker's hero rules red on HEAD on 4637 and 7603, green after; no hero of a nation
  other than its row's in 10 seeds × 20 years.
- [x] R10 **Sea heroes come back** (R29-B3). A sea hero returns only at a naval base its nation
  holds; losing them is common, and Richelieu waited 16,123 days over 10 seeds × 20 years against
  the option's "back 60 days after they are lost". With no naval base, any port its nation holds
  (or the coast nearest its capital); the row says why while it waits.
  AT: over the critic's 10 seeds × 20 years, a living nation's sea hero back within 60 days of its
  loss wherever its nation holds a port; the checker's rule green.
- [x] R11 **What the heroes and the graph read** (run 29: `mapVisuals` and `uiUxPolish` 6, bar 7).
  A hero's formation panel and its map tag show its health, not its men (R29-N2, N3: "Men 2,200
  of 2,200" at 35 %, the Maus tagged "6"); the heroes option's hint as visible text, not a hover
  title (N6); the relations graph names a war line's side ("X is at war beside X" for one alone),
  reads on a phone, and the bottom bar does not wrap at 1024 px (N8).
  AT: the critic's shots retaken on their seeds, each reading right, at desk and phone widths.
- [x] R12 **A hero's loss and return are told** (R29-N1): ticker and History rows ("Bismarck was
  sunk near …", "Bismarck is back at Kiel") with Go to.
  AT: an e2e spec sinks a sea hero by God and sees both rows.
- [ ] R13 **A sea hero comes back to the open sea** (critic run 30, R30-B2). R10's fallback (the
  held port nearest the start) picks ports on landlocked water: Sovetsky Soyuz returns in the
  Caspian (Baku 4637, Atyrau 7603, Makhachkala 9001) or on Lake Onega (Petrozavodsk 4111) and stays
  there to the run's end, 11,259 days in 4 of 13 seeds. Only a port whose water reaches the hero's
  start sea counts; failing that it waits, and its row says so. A checker rule: a sea hero stands in
  water connected to its start sea.
  AT: the checker's rule red on HEAD on 4637, green after; over the critic's seeds 4637, 7603, 9001,
  4111 × 20 years no sea hero on water cut off from its start sea.
- [ ] R14 **Every folded hero reachable by touch** (R30-B1). On a phone (5521, 390 × 844, touch)
  the panel opened by the first tap covers "Sovetsky Soyuz +1" and "Bismarck +2", and closing it
  starts the fold over at its lead: HMS Hood, TOG II and Char 2C are never opened. A fold also
  puts a hero under another nation's flag (Hood in the Soviet counter, ~2,900 km off). Fold only
  one nation's heroes, and reach each of a fold's heroes with the panel closed and reopened (or a
  list of them); the fold's label on screen.
  AT: on 5521's start view by touch at 390 × 844 and by mouse at 1600 × 900, each of the 14 heroes
  opened by taps on its counter; no fold of two nations; screenshots looked at.
- [ ] R15 **Carrier wings stay with a hero's fleet** (R30-B3). With heroes on, the checker's air
  rules break on 3373 (random diplomacy: Japan's carrier group 1130 and Britain's 1057, days 581,
  601) and 5591 (Japan's wing 1462 at day 158; Nationalist Spain's wing 932 keeping a base lost an
  hour before, day 831); with heroes off, 0. A carrier moved 6 cells in one hour and left its wings.
  Find the move and keep the wings with it.
  AT: the checker's air rules red on HEAD on 3373 random and 5591 with heroes, green after; 0
  broken on both and on five more seeds with heroes, 20 years.
- [ ] R5 **The critic's runs and the release.** After R1–R4 (the user's request, 2026-11-03: the
  heroes feature gets a critic run of its own once the other items are resolved).
  - [x] R5a **A critic run on heroes** (PLAN 7.184, the heroes new-game option): the critic told to
    judge the heroes feature in depth (what a hero is and does, how the player reads it, its effect
    on wars over long runs with the option on and off, its rules beside the others), with its usual
    scores. Each blocking issue becomes an item before R5b.
    Run 29 (full, commit 823cbf1b): 3 blocking (R8–R10), `mapVisuals` and `uiUxPolish` 6 (R11),
    heroes' rows (R12); every other score at its bar. R5b follows R8–R12.
  - [ ] R5b **The batch's full critic run and the release.** A full critic run on the batch, the
    release checks (`npm run check:review`, the soak, the sweep with borders moving, the bench),
    the tag.
    Run 30 (focused, commit d6e1bb1e): R8–R12 hold; 3 blocking (R13–R15); `mapVisuals` and
    `uiUxPolish` back to 7, every score at its bar. A focused run does not close R5b: a full
    run with no blocking issue follows R13–R15.

## Later

- [ ] R7 **A default says so.** After COLLAPSE_MONTHS bankrupt months a nation with nothing to
  fragment has its debts voided with no row (`collapseNation`'s early return): the history never
  says why its gold went to 0 (found by R4a's checker, Poland on 7019, day 151). A row, or the
  collapse's.

- [ ] R6 **SPEC.md as the game is.** The rest of SPEC.md after R0i: each section rewritten to what
  the code does now, the history left to DECISIONS.
