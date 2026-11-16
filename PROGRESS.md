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
