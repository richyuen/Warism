# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-13`.


## 2026-11-14 — The sweep's share caps reported (ADR-1030, the user's decision); the replay to 1991 planned (ADR-1031)

- The largest nation's share of land and income at the end is reported, not judged: 55 of the 61 limit failures in
  `docs/sweeps/` were these two. The release sweep judged again by `--from`: ALL GREEN (over its bar on 2 seeds by land,
  3 by income). `tests/unit/sweepCriteria.test.ts` 12 of 12.
- Batch 24, R80a-k: the replay to 1991, planned; its five questions in ADR-1031 wait on the user.

## 2026-11-14 — ADR-1031 answered; Batch 25 (run 67's "not 9" items) before the replay to 1991 (ADR-1032)

- The user took the five recommendations and asked for the critic's items first, with a performance bar for the undo.
  A world save of seed 99 measured headless: 3.1-4.0 MB, save 50-52 ms, load 75-79 ms (years 0, 1, 5); the undo's five
  bars in ADR-1032. Batch 25, R81a-h, filed above Batch 24.
