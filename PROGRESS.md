# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-10`, next Batch 14 (R59, R60).


## 2026-11-10 — The state files trimmed (ADR-918, the user's decision)

- DECISIONS.md (279 KB) and PROGRESS.md (206 KB) moved up to `release-2026-11-10` to
  `docs/history/DECISIONS-release-2026-11-10.md` and `PROGRESS-release-2026-11-10.md`; from now on they rotate at
  each release tag (PROMPT.md "Releases" step 4). BLOCKERS.md's watch list to `docs/BLOCKERS_WATCH.md`; the
  `tools/diag/` commands from CLAUDE.md to `docs/TOOLS.md`. Documents only: the gate has nothing to run.

## 2026-11-10 — The historical track planned (ADR-919, ADR-920, the user's decisions)

- The user asked for a deterministic replay of history and answered the design's questions: real 1938–1953 history
  in the sim, events plus steered AI, to the Korean armistice, Hiroshima and Nagasaki scripted with the AI's nukes
  off, the track ended by the first intervention, a listed scenario of its own (ADR-919); no critic run before it
  is built, Batch 14 first (ADR-920). SPEC §1's non-goal narrowed and §7.7 added; ROADMAP Batch 15 (R62a–h).
  Documents only: the gate has nothing to run.
- The reseed at the track's end (the user's, ADR-919): a second seed rolled by the form and kept in the state,
  taken by every RNG stream when the track ends, in 1953 or at the intervention; and how the land is matched (by
  the scenario's timeline data, never the shared rules). SPEC §7.7, R62a and R62g's ATs.

## 2026-11-10 — R59a: the next voyage's days count the voyage out (R60-N1)

- `nextVoyageHours` (`src/sim/systems/landings.ts`): the soonest group at the port, and no sooner than all aboard are
  ashore, since a sailing landing gathers for its next voyage only then (`landingSystem`). 31173's 366 (setup 3517,
  two groups), told "about a day" for 4.3 days beside an empty group at Tokyo, is now told 5 days at t831 and counts
  down; it boards at t935. A display figure only: no sim rule, no hash moved. Mends R58b's rule (ADR-914: no ADR).
- Evidence: `tests/unit/nextVoyageDays1938.test.ts` (new case red before, green after; with `landingCall1938`,
  `landingSunk1938`, `orderNewsStale`: 22 tests green); critic run 60's `c60_nvtrue.ts` on its 168 runs: 46 of 47
  sailings within a day of the figure (45 before; the miss left is 31127's 272, R59b), landing checker 166 × 0,
  2 × 1 as before (the `slowClick` tail). SPEC §6.2's `nextVoyage` line. Gate green.

## 2026-11-10 — R59b: those a voyage left at the port board first (R60-N2, ADR-921)

- `boardOrder` (`src/sim/systems/landings.ts`): at the sail hour those its voyages left at the port (`Landing.left`: at
  the port while the landing was at sea, or there with no room as it sailed) board first, the first left first, then
  by id; `noRoom` and ADR-909's room check the same. Saved as the optional `world.landingLeft` (absent while empty:
  older saves load; seed 99's pin held in the gate). 31127's 272 (setup 15101, one group), left at t423 and left again
  at t510 by 270 and 271, come after it, now boards at t510.
- Checker (ADR-804): `landingInvariants`' `leftAgain`, red on 31127 before (2), 0 after.
- Evidence: `tests/unit/nextVoyageDays1938.test.ts` (31127 red before, green after; 4 tests); critic run 60's
  `c60_nvtrue.ts` on its 168 runs: 48 of 48 sailings within a day of the figure (46 of 47 after R59a), the checker's
  breaks the same two runs (30041, 31157 `_3517_g1`, the `slowClick` tail). Gate green (the whole unit suite).
- Also: SPEC §7.7 named two unbuilt things in code spans, red in `specRefs` (`eb30054b`, its own commit).
