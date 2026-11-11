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

## 2026-11-11 — R65c: run 63's small findings (ADR-962); R65 done

- A transfer told by its note is not told again as land handed over or a nation destroyed (Manchukuo's triple); the
  God Mode bar's note red; the track's line 11 px on a phone (8.8); "Building the world…" over the map until the first
  stats at a start (2 s grey before, plain 1938 too).
- Evidence: `tests/unit/historyTransferTold1938h.test.ts`, `tests/e2e/worldBuilding1938.spec.ts`. Gate.
- Batch 17 done; next Batch 18 (R66: armies on the replay's fronts).

## 2026-11-11 — Critic run 64 (focused, on `a90c7f57`): no blocking issue, all 14 dimensions at 8

- Filed: Batch 19, R70a-c, before Batch 18 (R64-N3 and R64-N1 are regressions of R65c's own fixes: land rows of other
  events hidden; the phone's line cut to ~8 letters). R64-N2 a known `slowClick` on a new seed, not taken.

## 2026-11-11 — R70a: a told transfer hides only its own rows (ADR-963)

- `transferTold` matches the land row's giver, receiver and hour; 8 May 1945's "Czechoslovakia/Yugoslavia took land
  from Hungary" shown again (`c64_transfer.ts`). Evidence: `tests/unit/historyTransferTold1938h.test.ts` (cb35c27a;
  its tick and this entry a commit after, the script that wrote them stopped on the tick's text). Gate.

## 2026-11-11 — R70b: the track's line on a phone, short and on two rows (ADR-964)

- "12 Mar 1938: The Anschluss" whole at 390 × 844 and 844 × 390 (was "Next, 12 March 1938: The An…"), 11 px.
- Evidence: `tests/e2e/trackView1938h.spec.ts` (whole, ≥ 11 px), the critic's `c64_h_phone.mjs`. Gate.

## 2026-11-11 — R70c: run 64's small findings (ADR-965); R70 done

- A forced paused start says "Resume" while the world is built (12f5c03a); the stats carry 16 named events ahead: 0
  blank of 1,096 samples at Max. Slovakia's "annexed"/"destroyed" pair left: History is every game's whole log.
- Evidence: `tests/e2e/worldBuilding1938.spec.ts`, the critic's `c63_h_blank.mjs`. Gate. Batch 19 done.

## 2026-11-11 — Critic run 65 stopped; deferred to after Batch 18 (ADR-966, the user's decision)

- Run 65 (focused, after Batch 19) stopped unfinished at the user's word; its processes stopped, its files in
  `.cache/critic-c65-aborted/`. The next critic run after Batch 18. Next: R66, armies on the replay's fronts.

## 2026-11-11 — R66a: the armies at the replay's stages measured (ADR-967); R66 split

- `tools/diag/trackFronts.ts` and `tests/helpers/trackFronts.ts`: own seed, 62 stages 1942 to mid-1945: both sides
  near at 10, neither at 36, none engaged. Cause: a held enemy is no foe to the operational AI, so no front faces it.
- R66 split into b (armies on the held fronts), c (the stages' rings), d (fighting before a stage), e (1946-53).

