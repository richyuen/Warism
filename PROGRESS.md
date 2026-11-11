# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-11`, next the user's design decision, then Batch 17 (R65).

## 2026-11-11 — The next design step decided (ADR-958, the user's decision)

- Batch 18 filed: R66 armies on the replay's fronts (the script decides; armies fight it out where harmless), R67 Cold
  War blocs, R68 a start from any date of the replay, R69 the replay past 1953. After Batch 17.

## 2026-11-11 — The release made shorter (ADR-959, the user's decision)

- `historyTrack1938h`'s seeds a file each: 4 m 05 s for the six (22 m). `bench -- G --gpu-only`: 31 s (10 m+). The
  soak's checks in the sweep (a save and load every 10 years, the twins compared 30 days on; red when broken, both
  ways checked); the release's soak dropped (it runs nightly). The critic carries plain 1938's bulk sets when its
  hashes and the paths they take are unchanged. PROMPT RELEASES step 3, SPEC §10.4 and §10.6, CRITIC_PROMPT.
- R69 to 1962 for now.

## 2026-11-11 — R65a: the "Next" line moves on at Max (ADR-960)

- The stats carry the next 8 named events; the line shows the first not yet past. The critic's probe at Max: present
  in 99.7 % of 1,092 samples (75.5 % before), never past.
- Evidence: `tests/e2e/trackView1938h.spec.ts` (≥ 95 % present; red before, 0.77), `tests/unit/trackShown.test.ts`. Gate.

## 2026-11-11 — R65b: the God tab says it ends the replay (ADR-961)

- A note at the God tab's head while the track runs; the bar's and the tab's words "Any God Mode act ends the replay of
  history." Evidence: `tests/e2e/trackView1938h.spec.ts` (in view, gone at the end). Gate.

