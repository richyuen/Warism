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

- [ ] R1 **The relations graph** (the user's feature, 2026-11-03). A view of the world's diplomacy
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
  - [ ] R1b The panel: the bottom bar's Relations button, the drawing, the filters, the clicks; the
    e2e spec and its screenshots.
- [ ] R2 **AI puppets revolt** (critic run 28, non-blocking 1). In 3 seeds × 30 years no puppet
  with autonomy ≥ 10 fell below loyalty 30.5, and the revolt line is 20: the war of independence
  happens only through God's slider. Make the AI's puppets able to rise (the loyalty model's floor,
  the overlord's losses, a lost war), without a wave of revolts.
  AT: puppets revolting on their own in at least 2 of 3 seeds × 30 years, at most 1 in 10 of the
  puppets made; the war-and-peace checker green on its seeds.
- [ ] R3 **A bond's Force war calls no one in beside its enemy** (critic R27-N2). A forced war that
  breaks an alliance or a puppet bond can call a nation into the war on the side of its own enemy:
  3 cases on seed 1777; `tools/diag/diploInvariants.ts` reports 7 broken pairs on 8209 (random
  diplomacy, heroes). Commands only (God, the player).
  AT: the checker's rule for it red on HEAD and green after on 1777 and 8209; 0 broken pairs on
  the checker's own seeds.
- [ ] R4 **Checkers for the other systems**, as `tests/helpers/diploInvariants.ts` checks war and
  peace (ADR-803): the economy (no gold from nowhere, upkeep paid or units cut), the navy (a fleet
  at sea or in its own or a partner's port), air (a wing within range of its base), nukes (a burst
  only by a nation with warheads and a means), the bonds (no puppet of a puppet, no alliance with
  an overlord). One part per system.
  AT: each checker green on 4 seeds of the 1938 world and the random world, and red on a commit
  (or a patched rule) that breaks it.
- [ ] R5 **The critic's batch run and the release.** A full critic run on the batch, the release
  checks (`npm run check:review`, the soak, the sweep with borders moving, the bench), the tag.

## Later

- [ ] R6 **SPEC.md as the game is.** The rest of SPEC.md after R0i: each section rewritten to what
  the code does now, the history left to DECISIONS.
