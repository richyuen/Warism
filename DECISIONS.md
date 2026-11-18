# Decisions (ADR log)

Format: ID · date · status · decision · why · consequences. Deliberate deviations
from AoC are tagged **[AoC-DEVIATION]**.

---

## ADR-1118 · 2026-11-17 · accepted · The nightly's ten-year tests in three jobs (ROADMAP R138)

- **Decision.** `.github/workflows/nightly.yml`'s `ten-year` job is a matrix of three: the sweep tests but the
  historical track's (`--exclude 'tests/sweep/historyTrack1938h*'`), the track's seeds 1-3, and the rest of the track
  (its own seed and seeds 4-5, by excluding seeds 1-3). Each keeps the 60-minute limit.
- **Why.** One job ran 53-54 min on the nights it ended and was cancelled at 60 on 2026-11-13, 11-15 and 11-17. On the
  11-16 run (43855142847) its files summed to 9,547 s on 3 workers (3,191 s); the six track files are 5,650 s of it, about
  15-16 min each. Split, a job is about the longest of its files on 3 workers: ~16 min for a track job, ~22 min for the
  rest (historyMatch1938h 800 s, freeYears1938h 698 s, the rest under 400 s). A longer limit alone would leave the next
  slow test to cancel it again.
- **Consequences.** `npm run test:sweep` and the gate's stages are unchanged. A new sweep file lands in the first job,
  a new track file in the third, with no edit to the workflow. Three runners' `npm ci` more a night.

---

> The ADRs before the last release tag are in `docs/history/`: `DECISIONS-<YYYY-MM>.md` (October) and
> `DECISIONS-<release tag>.md` from November on (ADR-805, ADR-918), in the order they had here. Search them by number (`grep -rn "ADR-623 " DECISIONS.md docs/history/`).
