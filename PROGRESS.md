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

## 2026-11-15 — R89c: no name under an arrow (ADR-1077); R89 done

- The arrows are drawn on the names' canvas, under the names (they were on the overlay, over them). The voyages'
  lines and the order lines at T1 have a dark edge, as the landing's mark.
- Tests: `orderLines1938.spec.ts` (0 of the names' whole pixels changed by arrows at three zooms; 3 of 89 points of a
  nation's name on an arrow not told from it, bar a tenth). By hand: the 15 specs that read the names' canvas, the
  voyages or the landings' marks, with `fleetOrder1938` and `player1938` (40 tests green).
- `npm run bench -- G`: T0 297.3 fps, T2 159.4 fps, draw cpu 5.0 ms, PASS (as R89b).
- Shots: `docs/evidence/R89c/` (before and after at 1,500 and 600 m/px). The voyages' new lines were not shot; their
  specs are green.

## 2026-11-15 — R90a: the fronts glow (ADR-1078)

- The border between what two nations at war hold is a hot red line with a glow, drawn by the map's own pass from a
  war table. R90 split: R90a this line, R90b the flash of land that changed hands (open).
- Tests: `warTable.test.ts` (3); `fronts1938.spec.ts` (Germany on Poland, three hours by six zooms: every point of
  the border at war lit, none of a border at peace, none before the war or after the peace). The whole browser suite
  by hand on the change: `npx playwright test --project=chromium --project=swiftshader`, 457 passed in 10.1 min.
- `npm run bench -- G`: T0 302.3 fps, the map's pass 0.520 ms of GPU a frame (0.512 to 0.515 before; budget 1); T2
  161.0 fps, 1.078 ms (budget 2), draw cpu 4.9 ms: PASS.
- Shots: `docs/evidence/R90a/` (peace at 4,000 m/px; the war at six zooms).

## 2026-11-15 — R90b: land taken flashes (ADR-1079); R90 done

- Each cell that changes hands with a snapshot is a soft white patch for 900 ms (`src/render/fx/flashes.ts`), under
  the names; none at a start or a load.
- Tests: `flashes.test.ts` (4); `flash1938.spec.ts` (two sizes of paint by three zooms; the start, the same holder,
  a load). The whole browser suite by hand on the change: 458 passed in 10.0 min.
- `npm run bench -- G`: T0 290.7 fps, T2 162.0 fps, draw cpu 4.9 ms, PASS.
- Shot: `docs/evidence/R90b/flash-1500.png` (the first look, a white blot, is in ADR-1079).

## 2026-11-15 — R91: the map's ground at T0 and T1 (ADR-1080)

- The sea by its depth, the land by its relief, a fill darker toward its border, in the map's pass from one
  texture made from the elevation.
- Tests: `farShade.test.ts` (6; neighbours' least ΔE 12.9, bar 12). The whole browser suite on the first try: 9
  failed of 458. Seven told water or a fill by its one colour or compared the map with the ground of T2 on and
  off: the shades untied from `relief`, and `view.farShades` off where a test needs flat fills (ADR-1080).
  `seaDepth1938` changed with the feature. `invasion1938` and `occupiedGround1938` passed alone and after.
  The suite again on the final code: 457 passed, 1 failed (`historyMine1938`, the phone's History panel), green
  alone six times of six after (`--repeat-each=3`): a test of the panel, red once under the whole suite's load.
- `npm run bench -- G`: the map's pass 0.556 ms of GPU a frame at T0 (0.520 before, budget 1), 1.154 at T2 (1.078,
  budget 2); T0 290.5 fps, T2 162.3 fps, PASS.
- Shots: `docs/evidence/R91/` (before and after at 20,000 and 4,000 m/px; after at 10,000 and 2,200).

## 2026-11-15 — R92a: the names white (ADR-1081)

- A nation's name is white with an edge of its land's deep shade; dark on the 19 light lands of 1938. R92 split:
  R92b, the turn and the size of a name, is open.
- Tests: `nationLabelLayout.test.ts` (19; the least contrast 2.08, 1.99 before; a restart wipes the atlas, a glyph
  is clipped to its box). The whole browser suite by hand: the first run 456 of 458, `bench-pages` green alone and
  `labelFades1938` red twice (a pop of 59, bar 48). Its cause, found by drawing the frames about the pixel: the glyph
  atlas left its old glyphs standing when it started again (ADR-1081). Mended; the suite again: 458 passed in 10.1 min.
- No change to the frame: the glyphs are drawn once into the atlas as before, in another ink.
- Shots: `docs/evidence/R92a/` (before and after at 20,000 and 4,000 m/px).

## 2026-11-16 — R92b: a name's turn and bow (ADR-1082); R92 done

- A name is turned at most 30 degrees from level and bows at most 0.15 of its length; the narrow steep lands keep
  their names along their axes.
- Tests: `nationLabels.test.ts` (8). The whole browser suite by hand: 457 of 458, `maxGlide1938` (the units' glide at
  Max, a timing) red once and green alone four times of four.
- Since R91 each whole run under 8 workers has had one test red that is green alone, another each time
  (`historyMine1938`, `settings1938`, `bench-pages`, `maxGlide1938`): none of them reads the map's picture. Watched.
- No change to the frame: the curves are the worker's, made every few seconds as before.
- Shots: `docs/evidence/R92b/` (before and after at 20,000 and 4,000 m/px).

## 2026-11-16 — R93: the counters larger (ADR-1083)

- The counters of T0 are drawn 1.25 times their size, with round corners; countryballs still in their look. The
  markers of T1 are not touched: R95 filed.
- Tests: `counters1938.spec.ts` (the plate's height at five unit sizes in two looks). The whole browser suite by
  hand: 456 of 458; `coast1938` and `shipMarks1938` red once, green alone four times of four each.
- The frame: `npm run bench -- G`: T0 268.8 fps, p95 7.5 ms, draw cpu 2.5 ms (290 to 302 fps, 5.0 ms and 2.4 ms in
  the runs of R91 and R90: the counters' plates and numbers are drawn at a scale of 1.25, one run, not a pair);
  T2 159.3 fps, 5.0 ms. PASS (budgets 60 and 30 fps, 6 ms).
- Shots: `docs/evidence/R93/` (both looks at 6,000 m/px).
