# PROGRESS (append-only)

> The log before the last release tag is in `docs/history/`: `PROGRESS-<YYYY-MM>.md` (October) and
> `PROGRESS-<release tag>.md` from November on (ADR-805, ADR-918). Search them; they are not read. The last
> entry before this file: `release-2026-11-10`, next Batch 14 (R59, R60).


## 2026-11-10 — The state files trimmed (ADR-918, the user's decision)

- DECISIONS.md (279 KB) and PROGRESS.md (206 KB) moved up to `release-2026-11-10` to
  `docs/history/DECISIONS-release-2026-11-10.md` and `PROGRESS-release-2026-11-10.md`; from now on they rotate at
  each release tag (PROMPT.md "Releases" step 4). BLOCKERS.md's watch list to `docs/BLOCKERS_WATCH.md`; the
  `tools/diag/` commands from CLAUDE.md to `docs/TOOLS.md`. Documents only: the gate has nothing to run.

## 2026-11-10 — The historical track planned (ADR-919, ADR-920, the user's decisions)

- The user asked for a deterministic replay of history and answered the design's questions: real 1938–1953 history
  in the sim, events plus steered AI, to the Korean armistice, Hiroshima and Nagasaki scripted with the AI's nukes
  off, the track ended by the first intervention, a listed scenario of its own (ADR-919); no critic run before it
  is built, Batch 14 first (ADR-920). SPEC §1's non-goal narrowed and §7.7 added; ROADMAP Batch 15 (R62a–h).
  Documents only: the gate has nothing to run.
- The reseed at the track's end (the user's, ADR-919): a second seed rolled by the form and kept in the state,
  taken by every RNG stream when the track ends, in 1953 or at the intervention; and how the land is matched (by
  the scenario's timeline data, never the shared rules). SPEC §7.7, R62a and R62g's ATs.

## 2026-11-10 — R59a: the next voyage's days count the voyage out (R60-N1)

- `nextVoyageHours` (`src/sim/systems/landings.ts`): the soonest group at the port, and no sooner than all aboard are
  ashore, since a sailing landing gathers for its next voyage only then (`landingSystem`). 31173's 366 (setup 3517,
  two groups), told "about a day" for 4.3 days beside an empty group at Tokyo, is now told 5 days at t831 and counts
  down; it boards at t935. A display figure only: no sim rule, no hash moved. Mends R58b's rule (ADR-914: no ADR).
- Evidence: `tests/unit/nextVoyageDays1938.test.ts` (new case red before, green after; with `landingCall1938`,
  `landingSunk1938`, `orderNewsStale`: 22 tests green); critic run 60's `c60_nvtrue.ts` on its 168 runs: 46 of 47
  sailings within a day of the figure (45 before; the miss left is 31127's 272, R59b), landing checker 166 × 0,
  2 × 1 as before (the `slowClick` tail). SPEC §6.2's `nextVoyage` line. Gate green.

## 2026-11-10 — R59b: those a voyage left at the port board first (R60-N2, ADR-921)

- `boardOrder` (`src/sim/systems/landings.ts`): at the sail hour those its voyages left at the port (`Landing.left`: at
  the port while the landing was at sea, or there with no room as it sailed) board first, the first left first, then
  by id; `noRoom` and ADR-909's room check the same. Saved as the optional `world.landingLeft` (absent while empty:
  older saves load; seed 99's pin held in the gate). 31127's 272 (setup 15101, one group), left at t423 and left again
  at t510 by 270 and 271, come after it, now boards at t510.
- Checker (ADR-804): `landingInvariants`' `leftAgain`, red on 31127 before (2), 0 after.
- Evidence: `tests/unit/nextVoyageDays1938.test.ts` (31127 red before, green after; 4 tests); critic run 60's
  `c60_nvtrue.ts` on its 168 runs: 48 of 48 sailings within a day of the figure (46 of 47 after R59a), the checker's
  breaks the same two runs (30041, 31157 `_3517_g1`, the `slowClick` tail). Gate green (the whole unit suite).
- Also: SPEC §7.7 named two unbuilt things in code spans, red in `specRefs` (`eb30054b`, its own commit).

## 2026-11-10 — R59c: order rows with a figure from their hour are dated (R60-N3)

- `src/app/App.tsx` passes the news tick for an order row whose words hold "in about N days" (today the next voyage);
  `src/ui/Ticker.tsx` draws its date first, as an event row's (`ticker-date`). A row told on 3 January no longer reads
  as today's on the 5th. Rows with no such figure are not dated (their words stay true).
- Evidence: `npx playwright test tests/e2e/orderRowsBrief1938.spec.ts --project=chromium`: 6 green (the new case at
  desk, landscape phone and phone: dated, whole beside a panel, an undated refusal beside it); screenshots
  `test-results/orderRowDated-{phone,land}.png` looked at. SPEC §9.2's ticker line. Gate green. UI only: no tick or
  frame budget touched.

## 2026-11-10 — R59d: the landscape nation panel ends above the bar (R60-N4)

- `src/app/style.css`, `@media (max-height: 500px)`: the nation panel is `box-sizing: border-box`, so its max-height
  holds its padding and border; before, they ran it 9.6–11.1 px past the bar's top, the last row half hidden.
- Evidence: `tests/e2e/panelFootLandscape1938.spec.ts` (new; seed 30403, Germany played, each tab scrolled to its
  end): red at all five critic sizes before, green after; screenshots at 667 × 375 and 932 × 430 looked at. The
  layout specs beside it green: `buildTab1938`, `phoneLayout1938`, `nationPanel1938`, `orderRowsBrief1938`,
  `orderRowsPanel1938`, `orderRowsTap1938` (31). The critic's own `c58_peacebtn` page script not run (its server
  setup); the spec reads the same seed, nation and sizes. Gate green.

## 2026-11-10 — R59e: seaBattlesLook tells a battle with no fleet to see, and looks in order (R60-N5)

- `tools/diag/seaBattlesLook.ts`: a battle listed with no fleet (31501's t17369 NED v USA, the Dutch all sunk in its
  hour) is told "no fleet to see" and counted in the summary, not failed; the battles are looked at in the order of
  their first hours, the page stepping only forward (the list had t6243 after t6257, looked at 14 h late: the run's
  other miss). `docs/TOOLS.md`'s line.
- Evidence: on the critic's `critic/c60_sb_31501.json` (a preview on 4173): exit 0, "44 of 44 battles seen ... 1 with
  no fleet to see", t6243 seen at its own hour with both sides (ENG 96, ITA 16), page errors 0 (was 43 of 45, exit 1).
  A tool only: no sim or page code. Gate green. R59 done.

## 2026-11-10 — R60a: the landings bar beside the landscape nation panel, its × in reach (R61-N1)

- `src/app/style.css`, `@media (max-height: 500px)`: with the nation panel open the landings bar stands on its right
  (`left: var(--side-panel-w) + 1rem` to the view's edge, no centring), not over its head; the panel (R55j, R61a)
  had widened under the bar since run 55. SPEC §9.2 gains the bar's entry (where it stands, what it gives way to).
- Evidence: the critic's probes, run from copies under `.cache/cr` (their output kept out of `critic/`) on a preview:
  `c61_x_closeblock.mjs 21103` at 844 × 390, 932 × 430, 1024 × 500, 667 × 375: the element at the × is
  `nation-close`, `clickOk` true, the bar 7 px right of the panel, page errors 0; `c55_lbox.mjs 21103` and `32223`
  at 844 × 390: six days, the Cancel in view, inside the bar and topmost each day, as run 55's file, day 6 "over:
  4 landed". `tests/e2e/landingsBarPanel1938.spec.ts` (new): red at all four sizes before ("landing-toggle" at the
  ×), green after; `landingsBar1938`, `phoneLayout1938`, `orderRowsTap1938`, `panelFootLandscape1938` green (29);
  the 844 × 390 shot looked at. Gate green.

## 2026-11-10 — R60b: a pending scenario file's Start is the only one (R61-N2)

- `src/ui/NewGameForm.tsx`: a `blocked` reason disables the form's Start and is said under it and in its title;
  `src/ui/TitleScreen.tsx` passes it while a file is pending ("A scenario file is chosen: start it or cancel it under
  Scenario file."). The file chooser is a button of the game's (`title-file-btn`, "Choose a file") with the browser's
  input inside it, out of sight (it read "No file chosen" beside the file, the input being emptied once read); the
  card's Cancel takes `god-btn`. SPEC §9.1.
- Evidence: `tests/e2e/title.spec.ts` (the scenario-file case: the main Start disabled with its reason while pending,
  the chooser's words, the input unseen, Cancel styled as Random, the Start back after Cancel); with
  `scenarioUpgrade1938`, `randomWorld`, `editorForces1938`: 19 green; the confirm shot looked at. The critic's
  `MAINSTART=1 c61_x_editor` would now find the main Start disabled: the AT's second branch. Gate green.

## 2026-11-10 — R60c: a cut scenario file is told damaged or incomplete (R61-N3)

- `src/shared/scenarioFile.ts`: `decodeScenarioFile` catches a gzip stream that fails to unpack (cut short, or a byte
  changed) and throws "the file is damaged or incomplete", not the platform's words ("Failed to fetch" in
  Chromium). The title screen and the editor load through it (`src/app/scenarioFiles.ts`).
- Evidence: `tests/unit/scenarioFile.test.ts` (an exported file's first 2,000 bytes, and one with a byte changed:
  red before, green); `tests/e2e/title.spec.ts` (the cut file on the title screen: "Could not load: the file is
  damaged or incomplete", no "fetch"); with `scenarioFile1938`, `scenarioUpgrade1938`: 13 green. Gate green.

## 2026-11-10 — R60d: small random worlds measured; the AT holds on HEAD (R61-N4)

- `tools/diag/fewNationWars.ts` (new; `docs/TOOLS.md`): random worlds of N nations, the day of the first war. Over 10
  years, seeds 32401–32410: 2 nations 6 of 10 at war, 3 nations 7, 4 nations 9, 5 to 8 nations 10 each; 3 nations
  on 20 more (32411–32430): 17. So 3 nations: 24 of 30, "most seeds": the AT's first branch, no change needed.
- Why the quiet ones stay quiet (32403, 3 nations, a probe of `warUtility` yearly): nations 2 and 3 are near equals
  (strength term −0.10 and +0.03) and restlessness grows to `RESTLESS` 0.3 at most, under `DECLARE_AT` 0.5; nation
  1, the strongest, has no land neighbour and no target over the sea. The rules work as ADR-481 set them; raising
  `RESTLESS` would move every world (and the pin) for a few small ones, so not taken. SPEC §3.4 says it, with the
  figures. Documents and a tool only; gate green.
