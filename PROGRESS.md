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

## 2026-11-14 — R81a: a bloc is a defensive pact (ADR-1033)

- Measured first (`tools/diag/farConquests.ts`): a free 1975 game took far capitals at 1.3-1.5 × plain 1938's rate per
  nation, the excess NATO's members following a member's attack. Where the blocs are, a bloc is a defensive pact: none
  of it called to a member's own war, to its defence the leader at any distance and the others within reach. On eight
  unseen seeds far capitals per 100 nations 13.6 → 10.4 (plain 1938 10.4); first-month declarations × 0.98; blocs whole
  and leaders apart 10 years after the track. The AT's own bar (≤ 1 a seed) re-scoped: plain 1938 has 9-12.
- `tests/unit/blocDefensive1938h.test.ts` (red without the rule); `npm test` 2,444 of 2,446 green, the two timing tests
  green alone. Plain games and the pin untouched (no blocs).
