# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-15`.

## 2026-11-15 — Batch 32 planned: the map's look (ADR-1073, the user's request)

Shots of seed 99 in August 1939 at 20,000 to 30 m/px beside the user's mock-up; six items filed, R89–R94 (thick
movement arrows first), the user's choices in ADR-1073. Documents only; no code.

## 2026-11-15 — R89a: the movement arrow (ADR-1074)

- A land formation's march is a thick arrow (`src/render/units/moveArrows.ts`): tapered, pale in its nation's colour,
  dark-rimmed, 5 to 22 px by its men, from the formation along the start of its way; marches that start together and
  head the same way are one. The dashed line stays for fleets and for a formation picked or selected.
- The first try, arrows along whole ways, was a thicker web (131 crossings on the Fujian front); the item's text and
  ADR-1074 follow what the shots showed. Now 0 crossings there at 600 and 1,500 m/px.
- Tests: `moveArrows.test.ts` (15); by hand `npx playwright test tests/e2e/orderLines1938.spec.ts
  tests/e2e/player1938.spec.ts --project=chromium --project=swiftshader` (6 green).
- Frame: draw p50 2.3 to 2.4 ms at 600 m/px with 35 arrows, 1.4 to 1.5 at 150 with 54. `npm run bench -- G`: GPU T0
  310.8 fps (budget 60), T2 174.2 fps with 10,752 sprites (budget 30), PASS.
- Shots: `docs/evidence/R89a/` (before and after at 1,500, 600 and 150 m/px, after at 30, the first try).

## 2026-11-15 — R89b: a war shows its advances (ADR-1075)

- Every nation at war shows its advances as bold arrows with nothing selected, at every tier (under the counters at
  the world's zoom too); the other marches of what is looked at are faint. An advance: a march to a cell an enemy
  holds or to within 100 km of an enemy's land formation (`advances`, found once a snapshot).
- Tests: `moveArrows.test.ts` (19); by hand `npx playwright test tests/e2e/orderLines1938.spec.ts
  tests/e2e/player1938.spec.ts tests/e2e/fleetOrder1938.spec.ts --project=chromium --project=swiftshader` (8 green).
  The war test sweeps 6 to 96 hours and 4,000 to 100 m/px: at most 40 bold arrows in view.
- Seed 99, August 1939, nothing selected: 26 arrows of 13 nations at 20,000 m/px; 18 at 4,000 over Fujian.
- Frame: the arrows are 0.1 to 0.15 ms of a draw, measured in one page with them on and off (1.53 to 1.63-1.72 ms at
  150 m/px with 42 arrows; 2.03 to 2.06-2.18 at the world's zoom with 26), most of it the grouping until it was made
  without allocations and by squares. `npm run bench -- G`: GPU T0 294.9 fps, draw cpu p50 2.4 ms (2.2 on R89a's
  commit, the same hour; budget 6); T2 161.0 fps with 10,752 sprites, 5.0 ms (170.7 fps, 4.7 ms; budgets 30 fps and
  6 ms): PASS, with less room.
- The bench's SwiftShader stage (reported, not judged) took over 7 minutes in three runs of seven this evening and was
  cut off by my own time limit; left to run, it ended. `-- G --gpu-only` is the run to time a change by.
- Shots: `docs/evidence/R89b/`.

## 2026-11-15 — Bench G on the GPU alone unless asked (ADR-1076, the user's decision)

- `npm run bench -- G` no longer runs the software rasteriser's stages; `--software` adds them. `--gpu-only` is still
  taken. Run after the change: `npm run bench -- G` in 31 s (several minutes before): GPU T0 305.1 fps, T2 163.1 fps
  with 10,752 sprites, draw cpu 4.9 ms, PASS; the software rasteriser's record of 2026-11-11 kept.
