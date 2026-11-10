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
