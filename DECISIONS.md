# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

## ADR-1118 · 2026-11-17 · accepted · The nightly's ten-year tests in three jobs (ROADMAP R138)

- **Decision.** `.github/workflows/nightly.yml`'s `ten-year` job is a matrix of four: the sweep tests the others
  do not name (by `--exclude`), historyMatch1938h with freeYears1938h and freeWorld1938h, the track's seeds 1-3, and the
  rest of the track (its own seed and seeds 4-5, by excluding seeds 1-3). Each keeps the 60-minute limit.
- **Why.** One job ran 53-54 min on the nights it ended and was cancelled at 60 on 2026-11-13, 11-15 and 11-17. On the
  11-16 run (43855142847) its files summed to 9,547 s on 3 workers (3,191 s); the six track files are 5,650 s of it, about
  15-16 min each. Split three ways first (76551f98), run 44206444954 had a runner 1.6-1.9x slower: track jobs 22 and 27
  min, the rest 37 min, historyMatch1938h 1,547 s and freeYears1938h 1,314 s of it. Those two and freeWorld1938h (790 s)
  became a fourth job (~26 min on that runner), the rest ~3,000 s (~18 min). A longer limit alone would leave the next
  slow test to cancel it again.
- **Consequences.** `npm run test:sweep` and the gate's stages are unchanged. A new sweep file lands in the first job,
  a new track file in the last, with no edit to the workflow. Four runners' `npm ci` a night instead of one.

---

> The ADRs before the last release tag are in `docs/history/`: `DECISIONS-<YYYY-MM>.md` (October) and
> `DECISIONS-<release tag>.md` from November on (ADR-805, ADR-918), in the order they had here. Search them by number (`grep -rn "ADR-623 " DECISIONS.md docs/history/`).
