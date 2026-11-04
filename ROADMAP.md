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

## Released

- `release-2026-11-03b` (2026-11-03): R0a–R0i and Batch 1 (R1–R5, R7–R15), in CHANGELOG.md for
  players; the items with their evidence in `docs/history/ROADMAP-release-2026-11-03b.md`.

## Later

- [ ] R6 **SPEC.md as the game is.** The rest of SPEC.md after R0i: each section rewritten to what
  the code does now, the history left to DECISIONS. Rules of the rewrite: ADR-821. Each part's AT:
  its section added to `tests/unit/specRefs.test.ts` at 0 misses, and every constant it states read
  from the code, listed with file and line in PROGRESS.
  - [x] R6a The references checker (`tools/spec/refs.ts`) and §10, testing and verification (§2's
    three stale names fixed).
    Done (ADR-821): `specRefs.test.ts` 4 of 4; §10 had 6 misses at HEAD (parity, critic:due), 0 now.
  - [x] R6b §3.1–3.3: map, cells, provinces, cities and zones. The test judges whole sections: add
    `'3'` (§3.4–3.7 have no miss now) and call §3.1–3.3 current in SPEC's header until R6c.
    Done: §3.1–3.3 rewritten from three read-throughs of the code (22 → 21 KB: the history and measurements out, the cell layer, air zones, basins and port state in); `specRefs.test.ts` 5 of 5.
  - [x] R6c §3.4–3.7: nations, diplomacy, military, tech and production.
    Done: rewritten from four read-throughs of the code (38 → 26 KB); `specRefs.test.ts` 5 of 5.
  - [x] R6d §4: territory, fronts and the strategic layer.
    Done: rewritten from two read-throughs of the code (29 → 11 KB), in six subsections; `specRefs.test.ts` 6 of 6.
  - [x] R6e §5: combat.
    Done: rewritten from a read-through of the code (11 → 7 KB); `specRefs.test.ts` 7 of 7.
  - [x] R6f §6.1–6.2: armour and the navy. As R6b: add `'6'`; §6.1–6.2 current until R6g.
    Done: rewritten from two read-throughs of the code (21 → 11 KB); `specRefs.test.ts` 8 of 8.
  - [x] R6g §6.3–6.4: aircraft and nuclear weapons.
    Done: rewritten from two read-throughs of the code (24 → 13 KB); `specRefs.test.ts` 8 of 8.
  - [ ] R6h §7: the AI.
  - [ ] R6i §8: semantic zoom.
  - [ ] R6j §9: UI and UX.
- [ ] R16 **Traits that do nothing** (found by R6c). Of a trait's modifiers only `income` and
  `manpower` act; `landAttack`, `org`, `stability` and the rest are validated and read by nothing,
  and a scenario trait's `aggressionBias` acts only when traits are random. Either make them act
  (a rule change, with the checkers and the sweep) or drop them from the data and the panel; the
  user's decision. Also: `src/sim/systems/war.ts`'s header says a side fights to the death by any
  member's flag, the code by its leader's. And the scenario's `revival.cooldownDays` is read by
  nothing (the cooldown is `REVIVAL_COOLDOWN`); found by R6d. `retreat.ts`'s header puts the retreat
  point 3 cells from the enemy, the code 3 cells beyond the formation; the snapshot's `majors` is read
  by no UI (R6e).
