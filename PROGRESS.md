# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-13`.


## 2026-11-14 — The sweep's share caps reported (ADR-1030, the user's decision); the replay to 1991 planned (ADR-1031)

- The largest nation's share of land and income at the end is reported, not judged: 55 of the 61 limit failures in
  `docs/sweeps/` were these two. The release sweep judged again by `--from`: ALL GREEN (over its bar on 2 seeds by land,
  3 by income). `tests/unit/sweepCriteria.test.ts` 12 of 12.
- Batch 24, R80a-k: the replay to 1991, planned; its five questions in ADR-1031 wait on the user.
