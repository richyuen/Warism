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

## 2026-11-10 — R60e: History marks the rows that follow one of their hour (R61-N5, ADR-922); Batch 14 done

- The critic's case read from its save (`critic/c61_seed32019_y20.bin`): "made peace", "was annexed", "was destroyed"
  are one hour (t174600), logged and shown cause first (ADR-865); read newest first the peace seemed after the end.
  `followsAbove` (`src/shared/history.ts`): a row following one of its hour that names a nation of it is drawn under
  it in `HistoryPanel`, "↳" in the dates' column, its title "The same hour, following the row above". The order and the
  exports are unchanged. SPEC §9.6.
- Evidence: `tests/unit/historyHourOrder.test.ts` (the critic's hour: the war and its joiner, the peace with its
  annexation and end marked, nothing across hours); `tests/e2e/history1938.spec.ts` (Germany's declaration and the
  guarantors' rows under it, in the page; 4 green), with `historyMine1938`, `historyWrap1938`: 8 green; the panel shot
  looked at. Gate green.
- Batch 14 (R59, R60) done. No critic run now (ADR-920); next, Batch 15 (R62a).

## 2026-11-10 — R59b's saved section checked while it holds a division

- `tests/unit/nextVoyageDays1938.test.ts`, 31127's case: a save on day 19 (t458), inside 272's wait at Cardiff, with
  `world.landingLeft` not empty, loads bit-identical (the probes before were on days 30 and 90, after the landing was
  over, so the section was never saved with anything in it). Green; gate green.

## 2026-11-10 — Batch 15 split finer; ADR-919's runner and reseed amended (the advisor's review)

- R62 re-split into R62a–k before any part was ticked: the scenario; the runner and its state; territory; birth and
  the end (reseed); the steering; four periods; intervention and the view; the checker. ADR-919 amended: the runner
  applies events through `applyCommand`, not the command log (a replay feeding logged track events would apply them
  twice); `1938h` a scenario id of its own, its nations after 1938's 103; the reseed's AT compares every section but
  the track's own (the second seed is in it from the start). SPEC §2.6 names the reseed as the one exception to
  streams seeded from the world seed alone; §7.7's runner. Documents only.

## 2026-11-10 — R62a: the historical track's scenario, `1938h` (ADR-919)

- `1938h` (`data/scenarios/1938h/`: `scenario.json` with `base` 1938 and `seed` 1938, `nations.json` with 12 nations
  born 1939–1949): built from 1938's own files; `addDormantNations1938h` (`src/sim/scenario1938h.ts`) appends its
  nations after 1938's 103, dead with no land, core or revival. Through the registry (`ScenarioId`, `SCENARIO_INFO`
  with `fixedSeed`), the sim's init, the worker's names (`NATIONS_1938H`), the app (its seed and no option whatever the
  URL), `NewGameForm` (`fixedSeed`: a note, Start), the CLI and the preview. The schema takes `base` and `seed`.
- Hidden until R62f (R62a's AT amended): listing a "Historical" world that plays as plain 1938 would be a feature
  faked (PROMPT rule 6), and a push deploys.
- Evidence: `tests/unit/scenario1938h.test.ts` (3: the 12 after the 103, the same land and nations as 1938, none born
  a month on; save and load bit-identical and the run after equal; its seed and hidden); `tests/e2e/scenario1938h.spec.ts`
  (the URL's seed 5 and random options change no hash; the settings' note, no seed field; shot looked at); seed 99's
  pin green run alone; gate green. DATA_SOURCES.md, SPEC §7.7.

## 2026-11-10 — R62b: the historical track's runner and its state (ADR-924; ADR-923 records R62a's hiding)

- `src/sim/track.ts`: `Track` (the timeline, its hash, the next event, ended, the seed for after, the nations unborn)
  and `runTrack`, called in `step` after the hour's commands. Annex, puppet, release and alliances through
  `applyCommand` (exported); a war of the timeline's sides, a join, a white peace and a guarantee by the war's and
  alliances' own parts. A refused event: `TrackSkipped`. A save of another timeline: `TrackEnded` at the next hour.
- `TimelineFile` in `src/sim/data/schemas.ts` with its cross checks; `data/scenarios/1938h/timeline.json` (empty until
  R62f); `startTrack1938h` binds it in the Sim (a test may give its own). The dead list leaves out the unborn.
- Evidence: `tests/unit/trackRunner1938h.test.ts` (4), the data-schemas case; gate.

## 2026-11-10 — R62c: the track's land by rings (ADR-925)

- `transfer` and `occupy` events (`TimelineFile`, `src/sim/track.ts`): land cells in a lon/lat ring owned by the
  nations named, rasterised at the hour by `forEachCellInRing`; a transfer owns and holds with a `LandCeded` row per
  giver and moves a capital in it, an occupation holds only.
- Evidence: `tests/unit/trackTerritory1938h.test.ts` (exact cells against its own point-in-polygon); a probe: an
  occupation at peace held 127 of 127 cells three days on. Gate.

## 2026-11-10 — R62d: births, the track's end and the second seed (ADR-926)

- `born` events (land, cores, seat, `NationBorn`); `TimelineFile.end` (1953-07-27 in 1938h's); `endTrack` makes the
  world's seed and streams anew from the second seed; `GameOptions.after` (`?after=`), rolled by the form's Start.
- Evidence: `tests/unit/trackBirth1938h.test.ts` (3); a probe, 5 seeds × a year: no unborn nation alive on any day;
  `tests/e2e/scenario1938h.spec.ts` (Start's URL has `after`). Gate.

## 2026-11-10 — R62f: 1938-39 on the track, measured; its bar not met (ADR-928, BLOCKERS)

- `data/scenarios/1938h/timeline.json`: 32 events of 1938-39 and three reference `maps`; `tools/diag/historyMatch.ts`
  (all land / moved right / stray); `buff`, `forces` and `without` in the timeline.
- Measured (`tests/sweep/historyMatch1938h.test.ts`): 100.00 / 98.81 / 98.79 % of land as history had it, the moved
  land 97-98 % right. Not met: China overruns Manchukuo (February 1939) and Mengjiang, 1.19 % of land strays, the
  Nomonhan war and peace are passed over. Probes: refills unpaid while the pools grow; buffs and arrivals flip the
  front from one collapse to the other. The cause is R62f2; R62f re-scoped by the user (ADR-928) and ticked.
- Evidence: `tests/unit/trackLevers1938h.test.ts`, the sweep test, the data-schemas case. Gate.

## 2026-11-10 — R62f2: the China front held (ADR-929)

- Read: neither Japan nor China refills while its manpower pool grows: Japan's gold is spent under the reserve,
  China's army upkeep over its war share. A rule of every world, left as it is.
- `hold` in the timeline: two sides at war that do not fight, take land or plan attacks until a date (combat,
  territory, the operational AI's foes); inert without a track. 1938-39: the Communists held from the start, Japan's
  arrivals to October 1938, the front with China held from November 1938, China's arrivals.
- A year from one save at 1 November 1938: held, the front unmoved, China's army 203k to 459k, the Communists and
  Manchukuo living; without, the Communists dead. The 1938-39 match: stray 0.00 %, no event passed over.
- Left: Japan holds 1 % of China, not history's fifth; the maps measure owners, so R62k's checker takes occupation.
- Evidence: `tests/sweep/chinaFront1938h.test.ts`, `tests/sweep/historyMatch1938h.test.ts`, the hold case in
  `tests/unit/trackLevers1938h.test.ts`. Gate.
